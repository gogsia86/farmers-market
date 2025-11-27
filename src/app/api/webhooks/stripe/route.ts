/**
 * 🎣 STRIPE WEBHOOK HANDLER
 * Processes Stripe webhook events for payment processing
 *
 * @route POST /api/webhooks/stripe
 * @version 2.0.0 - Full Stripe Integration
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { paymentService } from "@/lib/services/payment.service";

/**
 * ⚠️ IMPORTANT: Disable body parsing for webhook signature verification
 * Stripe requires the raw body to verify webhook signatures
 */
export const runtime = "nodejs";

/**
 * POST /api/webhooks/stripe
 * Handle incoming Stripe webhook events
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ GET RAW BODY FOR SIGNATURE VERIFICATION
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    // ✅ VERIFY WEBHOOK SIGNATURE
    let event: Stripe.Event;
    try {
      event = paymentService.verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json(
        {
          error: "Webhook signature verification failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      );
    }

    // ✅ LOG WEBHOOK EVENT
    console.log(`Received Stripe webhook: ${event.type}`, {
      eventId: event.id,
      type: event.type,
      created: new Date(event.created * 1000).toISOString(),
    });

    // ✅ ROUTE EVENT TO APPROPRIATE HANDLER
    try {
      switch (event.type) {
        // 💰 PAYMENT INTENT EVENTS
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.canceled":
          await handlePaymentIntentCanceled(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.processing":
          await handlePaymentIntentProcessing(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.requires_action":
          await handlePaymentIntentRequiresAction(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        // 💸 CHARGE EVENTS
        case "charge.succeeded":
          await handleChargeSucceeded(event.data.object as Stripe.Charge);
          break;

        case "charge.failed":
          await handleChargeFailed(event.data.object as Stripe.Charge);
          break;

        case "charge.refunded":
          await handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        // 🔄 REFUND EVENTS
        case "refund.created":
          await handleRefundCreated(event.data.object as Stripe.Refund);
          break;

        case "refund.updated":
          await handleRefundUpdated(event.data.object as Stripe.Refund);
          break;

        // 🔔 OTHER EVENTS
        case "payment_method.attached":
          await handlePaymentMethodAttached(
            event.data.object as Stripe.PaymentMethod,
          );
          break;

        case "customer.created":
          await handleCustomerCreated(event.data.object as Stripe.Customer);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // ✅ ACKNOWLEDGE RECEIPT
      return NextResponse.json(
        {
          received: true,
          eventId: event.id,
          eventType: event.type,
        },
        { status: 200 },
      );
    } catch (handlerError) {
      console.error(`Error handling ${event.type}:`, handlerError);

      // Still return 200 to acknowledge receipt
      // Stripe will retry if we return an error
      return NextResponse.json(
        {
          received: true,
          eventId: event.id,
          eventType: event.type,
          warning: "Event received but handler failed",
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 💰 PAYMENT INTENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  console.log("Payment intent succeeded:", {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    orderId: paymentIntent.metadata.orderId,
  });

  await paymentService.handlePaymentSuccess(paymentIntent);
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  console.log("Payment intent failed:", {
    id: paymentIntent.id,
    orderId: paymentIntent.metadata.orderId,
    lastError: paymentIntent.last_payment_error?.message,
  });

  await paymentService.handlePaymentFailure(paymentIntent);
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  console.log("Payment intent canceled:", {
    id: paymentIntent.id,
    orderId: paymentIntent.metadata.orderId,
  });

  await paymentService.handlePaymentFailure(paymentIntent);
}

/**
 * Handle payment intent processing
 */
async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  console.log("Payment intent processing:", {
    id: paymentIntent.id,
    orderId: paymentIntent.metadata.orderId,
  });

  // Optional: Update order status to indicate payment is processing
  // This can be useful for customer communication
}

/**
 * Handle payment intent requires action (e.g., 3D Secure)
 */
async function handlePaymentIntentRequiresAction(
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  console.log("Payment intent requires action:", {
    id: paymentIntent.id,
    orderId: paymentIntent.metadata.orderId,
    nextAction: paymentIntent.next_action?.type,
  });

  // Optional: Notify customer that additional action is required
}

// ═══════════════════════════════════════════════════════════════════════════
// 💳 CHARGE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle successful charge
 */
async function handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
  console.log("Charge succeeded:", {
    id: charge.id,
    amount: charge.amount / 100,
    currency: charge.currency,
    paymentIntentId: charge.payment_intent,
  });

  // Charges are typically handled via payment_intent events
  // This is a backup/additional logging point
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(charge: Stripe.Charge): Promise<void> {
  console.log("Charge failed:", {
    id: charge.id,
    paymentIntentId: charge.payment_intent,
    failureCode: charge.failure_code,
    failureMessage: charge.failure_message,
  });

  // Optional: Log failure for analytics/monitoring
}

/**
 * Handle refunded charge
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log("Charge refunded:", {
    id: charge.id,
    amountRefunded: charge.amount_refunded / 100,
    refunded: charge.refunded,
    paymentIntentId: charge.payment_intent,
  });

  await paymentService.handleRefund(charge);
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 REFUND HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle refund created
 */
async function handleRefundCreated(refund: Stripe.Refund): Promise<void> {
  console.log("Refund created:", {
    id: refund.id,
    amount: refund.amount / 100,
    status: refund.status,
    reason: refund.reason,
    paymentIntentId: refund.payment_intent,
  });

  // Refunds are typically handled via charge.refunded event
  // This provides additional status tracking
}

/**
 * Handle refund updated
 */
async function handleRefundUpdated(refund: Stripe.Refund): Promise<void> {
  console.log("Refund updated:", {
    id: refund.id,
    status: refund.status,
    paymentIntentId: refund.payment_intent,
  });

  // Track refund status changes (e.g., pending -> succeeded)
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔔 OTHER EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle payment method attached
 */
async function handlePaymentMethodAttached(
  paymentMethod: Stripe.PaymentMethod,
): Promise<void> {
  console.log("Payment method attached:", {
    id: paymentMethod.id,
    type: paymentMethod.type,
    customerId: paymentMethod.customer,
  });

  // Optional: Store payment method details for future use
}

/**
 * Handle customer created
 */
async function handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
  console.log("Stripe customer created:", {
    id: customer.id,
    email: customer.email,
  });

  // Optional: Link Stripe customer to internal user record
}

/**
 * GET /api/webhooks/stripe
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    endpoint: "stripe-webhooks",
    message: "Stripe webhook endpoint is operational",
    timestamp: new Date().toISOString(),
  });
}
