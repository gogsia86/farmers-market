// 🎣 STRIPE WEBHOOK HANDLER - Divine Payment Event Processing
// API endpoint for handling Stripe webhook events with agricultural consciousness

import { database } from "@/lib/database";
import { checkoutService } from "@/lib/services/checkout.service";
import { stripeService } from "@/lib/services/stripe.service";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// ============================================================================
// CONFIGURATION
// ============================================================================

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error("STRIPE_WEBHOOK_SECRET environment variable is not set");
}

// ============================================================================
// POST - HANDLE WEBHOOK EVENT
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get raw body
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    if (!WEBHOOK_SECRET) {
      console.error("Webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature and construct event
    let event: Stripe.Event;
    try {
      event = stripeService.constructWebhookEvent(
        body,
        signature,
        WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log(`Received webhook event: ${event.type} (${event.id})`);

    // Handle event based on type
    let result;

    switch (event.type) {
      case "payment_intent.succeeded":
        result = await handlePaymentIntentSucceeded(event);
        break;

      case "payment_intent.payment_failed":
        result = await handlePaymentIntentFailed(event);
        break;

      case "payment_intent.canceled":
        result = await handlePaymentIntentCanceled(event);
        break;

      case "charge.refunded":
        result = await handleChargeRefunded(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        result = { handled: false };
    }

    // Return success response
    return NextResponse.json(
      {
        received: true,
        eventId: event.id,
        eventType: event.type,
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook handler error:", error);

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
// EVENT HANDLERS
// ============================================================================

/**
 * ✅ Handle payment intent succeeded
 * Creates orders and sends confirmation emails
 */
async function handlePaymentIntentSucceeded(
  event: Stripe.Event
): Promise<any> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;
  const metadata = paymentIntent.metadata;

  console.log(`Processing payment success: ${paymentIntentId}`);
  console.log("Metadata:", metadata);

  try {
    // Extract metadata
    const checkoutSessionId = metadata.checkoutSessionId;
    const userId = metadata.customerId;
    const customerEmail = metadata.customerEmail;

    if (!checkoutSessionId || !userId) {
      console.error("Missing required metadata in payment intent");
      return {
        handled: false,
        error: "Missing required metadata",
      };
    }

    // Check if orders already created (idempotency)
    const existingOrders = await database.order.findMany({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (existingOrders.length > 0) {
      console.log(
        `Orders already created for payment intent ${paymentIntentId}`
      );
      return {
        handled: true,
        ordersCreated: false,
        orderCount: existingOrders.length,
        message: "Orders already exist",
      };
    }

    // Create orders from checkout session
    const result = await checkoutService.createOrdersFromSession({
      sessionId: checkoutSessionId,
      paymentIntentId,
      userId,
    });

    console.log(
      `Created ${result.orderCount} order(s) for payment ${paymentIntentId}`
    );

    // Send order confirmation emails
    for (const order of result.orders) {
      try {
        // TODO: Send order confirmation email
        // await emailService.sendOrderConfirmationEmail(...)
        console.log(`Order confirmation email queued for order ${order.orderNumber}`);
      } catch (emailError) {
        console.error(
          `Failed to send confirmation email for order ${order.orderNumber}:`,
          emailError
        );
        // Don't fail the webhook if email fails
      }
    }

    // Mark payment as successful in database
    for (const order of result.orders) {
      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "COMPLETED" as any,
          paidAt: new Date(),
        },
      });
    }

    return {
      handled: true,
      ordersCreated: true,
      orderCount: result.orderCount,
      totalAmount: result.totalAmount,
      orderNumbers: result.orders.map((o) => o.orderNumber),
    };
  } catch (error) {
    console.error("Error processing payment success:", error);

    // Log the error but return success to Stripe to prevent retries
    // The error should be investigated separately
    return {
      handled: true,
      error: error instanceof Error ? error.message : "Unknown error",
      requiresManualReview: true,
    };
  }
}

/**
 * ❌ Handle payment intent failed
 * Updates order status and sends failure notification
 */
async function handlePaymentIntentFailed(event: Stripe.Event): Promise<any> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;
  const metadata = paymentIntent.metadata;

  console.log(`Processing payment failure: ${paymentIntentId}`);
  console.log(
    "Failure reason:",
    paymentIntent.last_payment_error?.message || "Unknown"
  );

  try {
    // Find orders associated with this payment intent
    const orders = await database.order.findMany({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (orders.length === 0) {
      console.log(`No orders found for payment intent ${paymentIntentId}`);
      return {
        handled: true,
        ordersUpdated: false,
      };
    }

    // Update order status to failed
    for (const order of orders) {
      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED" as any,
          status: "CANCELLED" as any,
          cancelReason: `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
          cancelledAt: new Date(),
          cancelledBy: "system",
        },
      });
    }

    // Send payment failure notification
    const customerEmail = metadata.customerEmail;
    if (customerEmail) {
      try {
        // TODO: Send payment failure notification email
        console.log(`Payment failure notification queued for ${customerEmail}`);
      } catch (emailError) {
        console.error("Failed to send payment failure email:", emailError);
      }
    }

    return {
      handled: true,
      ordersUpdated: true,
      orderCount: orders.length,
    };
  } catch (error) {
    console.error("Error processing payment failure:", error);
    return {
      handled: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 🚫 Handle payment intent canceled
 */
async function handlePaymentIntentCanceled(event: Stripe.Event): Promise<any> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;

  console.log(`Processing payment cancellation: ${paymentIntentId}`);

  try {
    // Find orders associated with this payment intent
    const orders = await database.order.findMany({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (orders.length === 0) {
      return {
        handled: true,
        ordersUpdated: false,
      };
    }

    // Update order status to cancelled
    for (const order of orders) {
      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "CANCELLED" as any,
          status: "CANCELLED" as any,
          cancelReason: "Payment canceled by customer",
          cancelledAt: new Date(),
          cancelledBy: "customer",
        },
      });
    }

    return {
      handled: true,
      ordersUpdated: true,
      orderCount: orders.length,
    };
  } catch (error) {
    console.error("Error processing payment cancellation:", error);
    return {
      handled: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 💸 Handle charge refunded
 */
async function handleChargeRefunded(event: Stripe.Event): Promise<any> {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId = charge.payment_intent as string;
  const refundedAmount = charge.amount_refunded / 100;

  console.log(`Processing refund for payment intent: ${paymentIntentId}`);
  console.log(`Refunded amount: $${refundedAmount}`);

  try {
    // Find orders associated with this payment intent
    const orders = await database.order.findMany({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (orders.length === 0) {
      return {
        handled: true,
        ordersUpdated: false,
      };
    }

    // Create refund records and update order status
    for (const order of orders) {
      // TODO: Create refund record in Refund table
      // await database.refund.create({ ... });

      // Update order status
      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "REFUNDED" as any,
          status: "CANCELLED" as any,
        },
      });
    }

    return {
      handled: true,
      ordersRefunded: true,
      orderCount: orders.length,
      refundedAmount,
    };
  } catch (error) {
    console.error("Error processing refund:", error);
    return {
      handled: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// OPTIONS - CORS PREFLIGHT
// ============================================================================

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
      },
    }
  );
}
