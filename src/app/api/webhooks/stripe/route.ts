/**
 * Stripe Webhook Handler
 * Processes payment events from Stripe with deduplication and idempotency
 * Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
 */

import { database } from "@/lib/database";
import { notificationService } from "@/lib/services/notification.service";
import { webhookEventService } from "@/lib/services/webhook-event.service";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Lazy Stripe Initialization
// ============================================================================

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeInstance;
}

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
  }
  return secret;
}

// ============================================================================
// POST /api/webhooks/stripe
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      logger.error("No Stripe signature found in headers");
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      const webhookSecret = getWebhookSecret();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    logger.info(`Processing Stripe webhook event: ${event.type} (${event.id})`);

    // Record event for idempotency and deduplication
    const recordResult = await webhookEventService.recordEvent({
      provider: "STRIPE",
      eventId: event.id,
      eventType: event.type,
      payload: event as any,
    });

    // If event was already processed, return success immediately
    if (recordResult.alreadyProcessed) {
      logger.info(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
      });
    }

    // If recording failed, return error
    if (!recordResult.success) {
      logger.error(`Failed to record event ${event.id}: ${recordResult.error}`);
      return NextResponse.json(
        {
          error: "Failed to record webhook event",
          message: recordResult.error,
        },
        { status: 500 }
      );
    }

    try {
      // Handle different event types
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case "charge.refunded":
          await handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case "payment_intent.created":
          await handlePaymentIntentCreated(event.data.object as Stripe.PaymentIntent);
          break;

        case "charge.succeeded":
          // Usually handled by payment_intent.succeeded, but log for tracking
          logger.info(`Charge succeeded: ${event.data.object.id}`);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      // Mark event as successfully processed
      await webhookEventService.markAsProcessed(event.id);

      return NextResponse.json({ received: true });
    } catch (processingError) {
      // Mark event as failed for retry
      const errorMessage =
        processingError instanceof Error
          ? processingError.message
          : "Unknown processing error";

      await webhookEventService.markAsFailed(event.id, errorMessage);

      logger.error(`Webhook event ${event.id} processing failed:`, processingError);

      // Return 500 to trigger Stripe retry
      return NextResponse.json(
        {
          error: "Webhook processing failed",
          message: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Webhook handler error:", error);
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  logger.info(`Payment intent succeeded: ${paymentIntent.id}`);

  const metadata = paymentIntent.metadata;
  const orderId = metadata?.orderId;

  if (!orderId) {
    logger.error("No orderId in payment intent metadata");
    return;
  }

  try {
    // Update payment record
    await database.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // Update order status
    const order = await database.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        paidAt: new Date(),
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Send notification to customer
    if (order.customer) {
      await notificationService.sendPaymentNotification(order.customer.id, {
        amount: (paymentIntent.amount / 100).toFixed(2),
        currency: paymentIntent.currency.toUpperCase(),
        orderId: order.id,
        orderNumber: order.orderNumber,
      });

      // Send order confirmation notification
      await notificationService.sendOrderNotification(
        order.customer.id,
        order.id,
        "CONFIRMED",
        {
          orderNumber: order.orderNumber,
          total: order.total.toNumber(),
          items: order.items,
        }
      );
    }

    // Send notification to farmers
    const farmIds = [...new Set(order.items.map((item) => item.product.farmId))];
    for (const farmId of farmIds) {
      const farm = await database.farm.findUnique({
        where: { id: farmId },
        select: { ownerId: true, name: true },
      });

      if (farm) {
        await notificationService.createNotification({
          userId: farm.ownerId,
          farmId,
          type: "PAYMENT_RECEIVED",
          channels: ["IN_APP", "EMAIL"],
          title: "New order received",
          body: `You have a new order #${order.orderNumber}`,
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            farmName: farm.name,
          },
        });
      }
    }

    logger.info(`Successfully processed payment for order ${orderId}`);
  } catch (error) {
    logger.error(`Failed to process successful payment for order ${orderId}:`, error);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  logger.info(`Payment intent failed: ${paymentIntent.id}`);

  const metadata = paymentIntent.metadata;
  const orderId = metadata?.orderId;

  if (!orderId) {
    logger.error("No orderId in payment intent metadata");
    return;
  }

  try {
    // Update payment record
    await database.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        status: "FAILED",
      },
    });

    // Update order status
    const order = await database.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
      },
      include: {
        customer: true,
      },
    });

    // Send notification to customer
    if (order.customer) {
      await notificationService.createNotification({
        userId: order.customer.id,
        type: "ORDER_CANCELLED",
        channels: ["IN_APP", "EMAIL"],
        title: "Payment failed",
        body: `Payment for order #${order.orderNumber} failed. Please try again.`,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          reason: paymentIntent.last_payment_error?.message || "Payment failed",
        },
      });
    }

    logger.info(`Successfully processed failed payment for order ${orderId}`);
  } catch (error) {
    logger.error(`Failed to process failed payment for order ${orderId}:`, error);
  }
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  logger.info(`Charge refunded: ${charge.id}`);

  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    logger.error("No payment intent ID found in charge");
    return;
  }

  try {
    // Find the payment record
    const payment = await database.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      logger.error(`Payment not found for payment intent ${paymentIntentId}`);
      return;
    }

    const refundAmount = charge.amount_refunded / 100;
    const isFullRefund = charge.amount_refunded === charge.amount;

    // Update payment status
    await database.payment.update({
      where: { id: payment.id },
      data: {
        status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
      },
    });

    // Update order status
    await database.order.update({
      where: { id: payment.orderId },
      data: {
        status: "CANCELLED",
      },
    });

    // Send notification to customer
    if (payment.order.customer) {
      await notificationService.createNotification({
        userId: payment.order.customer.id,
        type: "PAYMENT_RECEIVED",
        channels: ["IN_APP", "EMAIL"],
        title: isFullRefund ? "Refund processed" : "Partial refund processed",
        body: `Your refund of $${refundAmount.toFixed(2)} for order #${payment.order.orderNumber} has been processed.`,
        data: {
          orderId: payment.order.id,
          orderNumber: payment.order.orderNumber,
          refundAmount,
          isFullRefund,
        },
      });
    }

    logger.info(
      `Successfully processed refund for payment ${payment.id}, amount: $${refundAmount}`
    );
  } catch (error) {
    logger.error(`Failed to process refund for charge ${charge.id}:`, error);
  }
}

/**
 * Handle payment intent created
 */
async function handlePaymentIntentCreated(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  logger.info(`Payment intent created: ${paymentIntent.id}`);

  const metadata = paymentIntent.metadata;
  const orderId = metadata?.orderId;

  if (!orderId) {
    logger.info("No orderId in payment intent metadata");
    return;
  }

  try {
    // Update payment record to track creation
    await database.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        status: "PROCESSING",
      },
    });

    logger.info(`Tracked payment intent creation for order ${orderId}`);
  } catch (error) {
    logger.error(
      `Failed to track payment intent creation for order ${orderId}:`,
      error
    );
  }
}

// ============================================================================
// Configuration
// ============================================================================

// Note: Body parsing is automatically disabled for webhook routes in Next.js App Router
// The raw request body is accessed via request.text() which is the correct approach
// for Stripe webhook signature verification.
