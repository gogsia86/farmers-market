/**
 * 💳 DIVINE PAYMENT SERVICE
 * Quantum payment processing with Stripe integration
 *
 * @module PaymentService
 * @version 2.0.0 - Full Stripe Integration
 */

import Stripe from "stripe";
import { database } from "@/lib/database";
import type { Order } from "@prisma/client";

// ✅ Initialize Stripe with proper configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

// ✅ DIVINE TYPE DEFINITIONS
export interface PaymentIntent {
  id: string;
  clientSecret: string | null;
  amount: number;
  currency: string;
  status: Stripe.PaymentIntent.Status;
  orderId: string;
}

export interface PaymentConfirmation {
  success: boolean;
  status: Stripe.PaymentIntent.Status;
  paymentIntent: Stripe.PaymentIntent;
}

export interface RefundResult {
  id: string;
  amount: number;
  status: string;
  reason?: string | null;
}

export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

// ✅ CUSTOM ERROR CLASSES
export class PaymentServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = "PaymentServiceError";
  }
}

export class StripeConfigurationError extends PaymentServiceError {
  constructor(message: string) {
    super(message, "STRIPE_CONFIG_ERROR");
    this.name = "StripeConfigurationError";
  }
}

export class PaymentIntentError extends PaymentServiceError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "PAYMENT_INTENT_ERROR", details);
    this.name = "PaymentIntentError";
  }
}

export class RefundError extends PaymentServiceError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "REFUND_ERROR", details);
    this.name = "RefundError";
  }
}

/**
 * 🌟 DIVINE PAYMENT SERVICE
 * Handles all payment operations with Stripe
 */
export class PaymentService {
  /**
   * Validate Stripe configuration
   */
  private static validateStripeConfig(): void {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new StripeConfigurationError(
        "STRIPE_SECRET_KEY is not configured in environment variables",
      );
    }

    if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
      throw new StripeConfigurationError(
        "STRIPE_SECRET_KEY appears to be invalid (should start with 'sk_')",
      );
    }
  }

  /**
   * 💰 Create payment intent for an order
   *
   * @param request - Payment intent creation request
   * @returns Payment intent with client secret
   */
  static async createPaymentIntent(
    request: CreatePaymentIntentRequest,
  ): Promise<PaymentIntent> {
    try {
      // Validate configuration
      this.validateStripeConfig();

      const { orderId, amount, currency = "usd", metadata = {} } = request;

      // Validate amount
      if (amount <= 0) {
        throw new PaymentIntentError("Payment amount must be greater than 0", {
          amount,
        });
      }

      // Verify order exists
      const order = await database.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          farm: true,
        },
      });

      if (!order) {
        throw new PaymentIntentError("Order not found", { orderId });
      }

      // Check if order already has a payment intent
      if (order.paymentIntentId) {
        // Retrieve existing payment intent
        const existingIntent = await stripe.paymentIntents.retrieve(
          order.paymentIntentId,
        );

        if (existingIntent.status !== "canceled") {
          return {
            id: existingIntent.id,
            clientSecret: existingIntent.client_secret,
            amount: existingIntent.amount / 100,
            currency: existingIntent.currency,
            status: existingIntent.status,
            orderId,
          };
        }
      }

      // Convert amount to cents (Stripe requires smallest currency unit)
      const amountInCents = Math.round(amount * 100);

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          orderId,
          customerId: order.customerId,
          farmId: order.farmId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Order #${orderId.slice(0, 8)} - ${order.farm?.name || "Farm"}`,
      });

      // Update order with payment intent ID
      await database.order.update({
        where: { id: orderId },
        data: {
          paymentIntentId: paymentIntent.id,
          paymentStatus: "PENDING",
        },
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        orderId,
      };
    } catch (error) {
      if (error instanceof PaymentServiceError) {
        throw error;
      }

      if (error instanceof Stripe.errors.StripeError) {
        throw new PaymentIntentError(`Stripe error: ${error.message}`, {
          type: error.type,
          code: error.code,
          statusCode: error.statusCode,
        });
      }

      throw new PaymentIntentError(
        `Failed to create payment intent: ${error instanceof Error ? error.message : "Unknown error"}`,
        { originalError: error },
      );
    }
  }

  /**
   * ✅ Confirm payment intent
   *
   * @param paymentIntentId - Stripe payment intent ID
   * @returns Payment confirmation result
   */
  static async confirmPayment(
    paymentIntentId: string,
  ): Promise<PaymentConfirmation> {
    try {
      this.validateStripeConfig();

      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      const success = paymentIntent.status === "succeeded";

      return {
        success,
        status: paymentIntent.status,
        paymentIntent,
      };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new PaymentIntentError(
          `Failed to confirm payment: ${error.message}`,
          {
            type: error.type,
            code: error.code,
          },
        );
      }

      throw new PaymentIntentError(
        `Failed to confirm payment: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🔄 Process successful payment (called by webhook)
   *
   * @param paymentIntent - Stripe payment intent object
   */
  static async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      const orderId = paymentIntent.metadata.orderId;

      if (!orderId) {
        console.error("Payment intent missing orderId in metadata", {
          paymentIntentId: paymentIntent.id,
        });
        return;
      }

      await database.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          paymentIntentId: paymentIntent.id,
          paidAt: new Date(),
          status: "CONFIRMED",
        },
      });

      console.log(`Payment successful for order ${orderId}`, {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
      });
    } catch (error) {
      console.error("Error handling payment success:", error);
      throw error;
    }
  }

  /**
   * ❌ Process failed payment (called by webhook)
   *
   * @param paymentIntent - Stripe payment intent object
   */
  static async handlePaymentFailure(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      const orderId = paymentIntent.metadata.orderId;

      if (!orderId) {
        console.error("Payment intent missing orderId in metadata", {
          paymentIntentId: paymentIntent.id,
        });
        return;
      }

      await database.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
        },
      });

      console.log(`Payment failed for order ${orderId}`, {
        paymentIntentId: paymentIntent.id,
        lastPaymentError: paymentIntent.last_payment_error?.message,
      });
    } catch (error) {
      console.error("Error handling payment failure:", error);
      throw error;
    }
  }

  /**
   * 💸 Create refund for a payment
   *
   * @param paymentIntentId - Stripe payment intent ID
   * @param amount - Optional partial refund amount (in dollars)
   * @param reason - Refund reason
   * @returns Refund result
   */
  static async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason,
  ): Promise<RefundResult> {
    try {
      this.validateStripeConfig();

      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason: reason || "requested_by_customer",
      };

      if (amount !== undefined) {
        if (amount <= 0) {
          throw new RefundError("Refund amount must be greater than 0", {
            amount,
          });
        }
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundParams);

      return {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status as string,
        reason: refund.reason,
      };
    } catch (error) {
      if (error instanceof RefundError) {
        throw error;
      }

      if (error instanceof Stripe.errors.StripeError) {
        throw new RefundError(`Stripe refund error: ${error.message}`, {
          type: error.type,
          code: error.code,
        });
      }

      throw new RefundError(
        `Failed to create refund: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🔄 Handle refund webhook event
   *
   * @param charge - Stripe charge object
   */
  static async handleRefund(charge: Stripe.Charge): Promise<void> {
    try {
      const paymentIntentId = charge.payment_intent as string;

      if (!paymentIntentId) {
        console.error("Charge missing payment_intent", { chargeId: charge.id });
        return;
      }

      const order = await database.order.findFirst({
        where: { paymentIntentId },
      });

      if (!order) {
        console.error("Order not found for payment intent", {
          paymentIntentId,
        });
        return;
      }

      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "REFUNDED",
        },
      });

      console.log(`Refund processed for order ${order.id}`, {
        paymentIntentId,
        amount: charge.amount_refunded / 100,
      });
    } catch (error) {
      console.error("Error handling refund:", error);
      throw error;
    }
  }

  /**
   * 📊 Get payment details for an order
   *
   * @param orderId - Order ID
   * @returns Payment details including Stripe payment intent
   */
  static async getPaymentDetails(orderId: string): Promise<{
    order: Order;
    paymentIntent?: Stripe.PaymentIntent;
  }> {
    try {
      const order = await database.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new PaymentServiceError("Order not found", "ORDER_NOT_FOUND", {
          orderId,
        });
      }

      let paymentIntent: Stripe.PaymentIntent | undefined;

      if (order.paymentIntentId) {
        this.validateStripeConfig();
        paymentIntent = await stripe.paymentIntents.retrieve(
          order.paymentIntentId,
        );
      }

      return {
        order,
        paymentIntent,
      };
    } catch (error) {
      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        `Failed to get payment details: ${error instanceof Error ? error.message : "Unknown error"}`,
        "GET_PAYMENT_DETAILS_ERROR",
        { orderId },
      );
    }
  }

  /**
   * 🔍 Verify webhook signature
   *
   * @param payload - Raw webhook payload
   * @param signature - Stripe signature header
   * @returns Verified Stripe event
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new StripeConfigurationError(
          "STRIPE_WEBHOOK_SECRET is not configured",
        );
      }

      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        throw new PaymentServiceError(
          "Webhook signature verification failed",
          "INVALID_SIGNATURE",
          { error: error.message },
        );
      }

      throw error;
    }
  }
}

// ✅ Export singleton instance for convenience
export const paymentService = PaymentService;
