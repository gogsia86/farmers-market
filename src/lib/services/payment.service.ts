// src/lib/services/payment.service.ts
import { database } from "@/lib/database";
import type {
  ConfirmPaymentInput,
  CreatePaymentIntentInput,
  PaymentHistoryItem,
  PaymentIntentResponse,
  PaymentResult,
  RefundInput,
  RefundResult,
} from "@/types/payment.types";
import { PaymentStatus } from "@prisma/client";
import {
  calculatePayPalFee,
  capturePayPalOrder,
  createPayPalOrder,
  refundPayPalCapture,
} from "../payment/paypal";
import {
  calculateStripeFee,
  confirmStripePayment,
  createStripePaymentIntent,
  createStripeRefund,
} from "../payment/stripe";

export class PaymentService {
  /**
   * Create payment intent (Stripe or PayPal)
   */
  static async createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<PaymentIntentResponse> {
    // Validate order exists
    const order = await database.order.findUnique({
      where: { id: input.orderId },
      include: {
        farm: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new Error(
        `Order payment status is ${order.paymentStatus}, cannot create payment intent`
      );
    }

    // Create payment record
    const payment = await database.payment.create({
      data: {
        orderId: input.orderId,
        amount: input.amount,
        currency: input.currency || "usd",
        status: PaymentStatus.PENDING,
        paymentMethod: input.paymentMethod,
      },
    });

    try {
      let intentResponse: PaymentIntentResponse;

      if (input.paymentMethod === "STRIPE" || input.paymentMethod === "CARD") {
        // Create Stripe payment intent
        intentResponse = await createStripePaymentIntent(input, {
          orderId: order.id,
          farmId: order.farmId,
          customerId: order.customerId,
          orderNumber: order.orderNumber,
        });

        // Update payment with Stripe payment intent ID
        await database.payment.update({
          where: { id: payment.id },
          data: {
            stripePaymentIntentId: intentResponse.id,
          },
        });
      } else if (input.paymentMethod === "PAYPAL") {
        // Create PayPal order
        const paypalOrder = await createPayPalOrder({
          orderId: order.id,
          amount: input.amount,
          currency: input.currency || "usd",
          description: `Order ${order.orderNumber} from ${order.farm.name}`,
        });

        intentResponse = {
          id: paypalOrder.id,
          clientSecret: paypalOrder.approvalUrl,
          amount: input.amount,
          currency: input.currency || "usd",
          status: "requires_action",
        };

        // Update payment with PayPal order ID
        await database.payment.update({
          where: { id: payment.id },
          data: {
            paypalOrderId: paypalOrder.id,
          },
        });
      } else {
        throw new Error(`Unsupported payment method: ${input.paymentMethod}`);
      }

      return intentResponse;
    } catch (error) {
      // Mark payment as failed
      await database.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      throw error;
    }
  }

  /**
   * Confirm payment (Stripe or PayPal)
   */
  static async confirmPayment(
    input: ConfirmPaymentInput
  ): Promise<PaymentResult> {
    const payment = await database.payment.findFirst({
      where: {
        orderId: input.orderId,
        status: PaymentStatus.PENDING,
      },
      include: {
        order: {
          include: {
            farm: { select: { name: true } },
          },
        },
      },
    });

    if (!payment) {
      return {
        success: false,
        orderId: input.orderId,
        status: PaymentStatus.FAILED,
        amount: 0,
        error: "Payment not found or already processed",
      };
    }

    try {
      let transactionId: string;
      let receiptUrl: string | undefined;

      if (payment.stripePaymentIntentId) {
        // Confirm Stripe payment
        const stripeIntent = await confirmStripePayment(
          payment.stripePaymentIntentId
        );

        if (stripeIntent.status !== "succeeded") {
          throw new Error(`Payment not successful: ${stripeIntent.status}`);
        }

        transactionId = stripeIntent.id;
        receiptUrl = stripeIntent.charges?.data[0]?.receipt_url || undefined;
      } else if (payment.paypalOrderId) {
        // Capture PayPal payment
        const capture = await capturePayPalOrder(payment.paypalOrderId);

        if (capture.status !== "COMPLETED") {
          throw new Error(`PayPal capture failed: ${capture.status}`);
        }

        transactionId = capture.captureId;
      } else {
        throw new Error("No payment provider found");
      }

      // Update payment status
      await database.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId,
          completedAt: new Date(),
        },
      });

      // Update order payment status
      await database.order.update({
        where: { id: input.orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paidAt: new Date(),
        },
      });

      return {
        success: true,
        paymentId: payment.id,
        orderId: input.orderId,
        status: PaymentStatus.COMPLETED,
        amount: payment.amount,
        transactionId,
        receiptUrl,
      };
    } catch (error) {
      // Mark payment as failed
      await database.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      // Update order payment status
      await database.order.update({
        where: { id: input.orderId },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      return {
        success: false,
        paymentId: payment.id,
        orderId: input.orderId,
        status: PaymentStatus.FAILED,
        amount: payment.amount,
        error:
          error instanceof Error
            ? error.message
            : "Payment confirmation failed",
      };
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(input: RefundInput): Promise<RefundResult> {
    const payment = await database.payment.findUnique({
      where: { id: input.paymentId },
      include: {
        order: {
          select: { orderNumber: true, totalAmount: true },
        },
      },
    });

    if (!payment) {
      return {
        success: false,
        paymentId: input.paymentId,
        orderId: input.orderId,
        amount: 0,
        status: "failed",
        error: "Payment not found",
      };
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      return {
        success: false,
        paymentId: input.paymentId,
        orderId: input.orderId,
        amount: 0,
        status: "failed",
        error: "Can only refund completed payments",
      };
    }

    const refundAmount = input.amount || payment.amount;

    try {
      let refundId: string;

      if (payment.stripePaymentIntentId) {
        // Create Stripe refund
        const stripeRefund = await createStripeRefund(
          payment.stripePaymentIntentId,
          refundAmount,
          input.reason
        );

        refundId = stripeRefund.id;
      } else if (payment.paypalOrderId && payment.transactionId) {
        // Create PayPal refund
        const paypalRefund = await refundPayPalCapture(
          payment.transactionId,
          refundAmount,
          payment.currency
        );

        refundId = paypalRefund.id;
      } else {
        throw new Error("No refundable payment provider found");
      }

      // Create refund record
      const refund = await database.refund.create({
        data: {
          paymentId: payment.id,
          amount: refundAmount,
          reason: input.reason,
          status: "COMPLETED",
          refundId,
        },
      });

      // Update payment status
      const isFullRefund = refundAmount >= payment.amount;
      await database.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund
            ? PaymentStatus.REFUNDED
            : PaymentStatus.COMPLETED,
        },
      });

      // Update order if full refund
      if (isFullRefund) {
        await database.order.update({
          where: { id: input.orderId },
          data: {
            paymentStatus: PaymentStatus.REFUNDED,
          },
        });
      }

      return {
        success: true,
        refundId: refund.id,
        paymentId: payment.id,
        orderId: input.orderId,
        amount: refundAmount,
        status: "completed",
      };
    } catch (error) {
      return {
        success: false,
        paymentId: input.paymentId,
        orderId: input.orderId,
        amount: refundAmount,
        status: "failed",
        error: error instanceof Error ? error.message : "Refund failed",
      };
    }
  }

  /**
   * Get payment history for user
   */
  static async getPaymentHistory(
    userId: string
  ): Promise<PaymentHistoryItem[]> {
    const payments = await database.payment.findMany({
      where: {
        order: {
          customerId: userId,
        },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            farm: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return payments.map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      method: payment.paymentMethod,
      createdAt: payment.createdAt,
      transactionId: payment.transactionId || undefined,
      order: payment.order,
    }));
  }

  /**
   * Get payment by order ID
   */
  static async getPaymentByOrderId(orderId: string) {
    return await database.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Calculate processing fee
   */
  static calculateProcessingFee(
    amount: number,
    method: "STRIPE" | "PAYPAL" | "CARD"
  ): number {
    if (method === "PAYPAL") {
      return calculatePayPalFee(amount);
    }
    return calculateStripeFee(amount);
  }
}
