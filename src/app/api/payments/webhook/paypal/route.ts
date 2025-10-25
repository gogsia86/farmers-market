// src/app/api/payments/webhook/paypal/route.ts
import { database } from "@/lib/database";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payments/webhook/paypal
 * Handle PayPal webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    // Handle different event types
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        await handlePaymentCaptureCompleted(event);
        break;
      }

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.FAILED": {
        await handlePaymentCaptureFailed(event);
        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        await handlePaymentRefunded(event);
        break;
      }

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 400 }
    );
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptureCompleted(event: any) {
  try {
    const resource = event.resource;
    const orderId = resource.supplementary_data?.related_ids?.order_id;

    if (!orderId) {
      console.error("No order ID found in PayPal event");
      return;
    }

    // Find payment by PayPal order ID
    const payment = await database.payment.findFirst({
      where: { paypalOrderId: orderId },
    });

    if (!payment) {
      console.error("Payment not found for PayPal order:", orderId);
      return;
    }

    // Update payment status
    await database.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: resource.id,
        completedAt: new Date(),
      },
    });

    // Update order payment status
    await database.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    console.log(
      `PayPal payment ${payment.id} completed for order ${payment.orderId}`
    );
  } catch (error) {
    console.error("Error handling PAYMENT.CAPTURE.COMPLETED:", error);
    throw error;
  }
}

/**
 * Handle failed payment capture
 */
async function handlePaymentCaptureFailed(event: any) {
  try {
    const resource = event.resource;
    const orderId = resource.supplementary_data?.related_ids?.order_id;

    if (!orderId) {
      console.error("No order ID found in PayPal event");
      return;
    }

    const payment = await database.payment.findFirst({
      where: { paypalOrderId: orderId },
    });

    if (!payment) {
      console.error("Payment not found for PayPal order:", orderId);
      return;
    }

    // Update payment status
    await database.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    // Update order payment status
    await database.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
      },
    });

    console.log(
      `PayPal payment ${payment.id} failed for order ${payment.orderId}`
    );
  } catch (error) {
    console.error("Error handling PAYMENT.CAPTURE.FAILED:", error);
    throw error;
  }
}

/**
 * Handle payment refunded
 */
async function handlePaymentRefunded(event: any) {
  try {
    const resource = event.resource;
    const captureId = resource.links
      ?.find((link: any) => link.rel === "up")
      ?.href?.split("/")
      .pop();

    if (!captureId) {
      console.error("No capture ID found in PayPal refund event");
      return;
    }

    const payment = await database.payment.findFirst({
      where: { transactionId: captureId },
    });

    if (!payment) {
      console.error("Payment not found for capture:", captureId);
      return;
    }

    // Update payment status
    await database.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    // Update order payment status
    await database.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });

    console.log(
      `PayPal payment ${payment.id} refunded for order ${payment.orderId}`
    );
  } catch (error) {
    console.error("Error handling PAYMENT.CAPTURE.REFUNDED:", error);
    throw error;
  }
}
