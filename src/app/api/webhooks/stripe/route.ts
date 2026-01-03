/**
 * 🎣 STRIPE WEBHOOK HANDLER - Divine Payment Processing
 * Processes Stripe webhook events for payment processing with ServiceResponse pattern
 *
 * @route POST /api/webhooks/stripe
 * @version 3.0.0 - ServiceResponse Integration
 *
 * Features:
 * - ServiceResponse pattern for all payment operations
 * - Comprehensive error handling and logging
 * - Webhook signature verification
 * - Payment intent lifecycle management
 * - Refund processing
 * - Structured logging with context
 * - Health check endpoint
 */

import { createLogger } from "@/lib/logger";
import { paymentService } from "@/lib/services/payment.service";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const logger = createLogger("stripe-webhook-api");

/**
 * ⚠️ IMPORTANT: Disable body parsing for webhook signature verification
 * Stripe requires the raw body to verify webhook signatures
 */
export const runtime = "nodejs";

// ============================================================================
// MAIN WEBHOOK HANDLER
// ============================================================================

/**
 * POST /api/webhooks/stripe
 * Handle incoming Stripe webhook events with ServiceResponse pattern
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ STEP 1: GET RAW BODY FOR SIGNATURE VERIFICATION
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      logger.error("Missing Stripe signature header", undefined, {
        operation: "verifySignature",
      });

      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    // ✅ STEP 2: VERIFY WEBHOOK SIGNATURE (ServiceResponse pattern)
    const verificationResponse = await paymentService.verifyWebhookSignature({
      payload: body,
      signature,
    });

    if (!verificationResponse.success) {
      logger.error("Webhook signature verification failed", verificationResponse.error, {
        operation: "verifySignature",
      });

      return NextResponse.json(
        {
          error: "Webhook signature verification failed",
          code: verificationResponse.error.code,
          message: verificationResponse.error.message,
        },
        { status: 400 },
      );
    }

    const event = verificationResponse.data;

    // ✅ STEP 3: LOG WEBHOOK EVENT
    logger.info("Received Stripe webhook", {
      operation: "receiveWebhook",
      eventId: event.id,
      eventType: event.type,
      created: new Date(event.created * 1000).toISOString(),
      livemode: event.livemode,
    });

    // ✅ STEP 4: ROUTE EVENT TO APPROPRIATE HANDLER
    let handlerResult: {
      handled: boolean;
      error?: string;
    } = { handled: false };

    try {
      switch (event.type) {
        // 💰 PAYMENT INTENT EVENTS
        case "payment_intent.succeeded":
          handlerResult = await handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.payment_failed":
          handlerResult = await handlePaymentIntentFailed(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.canceled":
          handlerResult = await handlePaymentIntentCanceled(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.processing":
          handlerResult = await handlePaymentIntentProcessing(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.requires_action":
          handlerResult = await handlePaymentIntentRequiresAction(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        // 💸 CHARGE EVENTS
        case "charge.succeeded":
          handlerResult = await handleChargeSucceeded(
            event.data.object as Stripe.Charge,
          );
          break;

        case "charge.failed":
          handlerResult = await handleChargeFailed(
            event.data.object as Stripe.Charge,
          );
          break;

        case "charge.refunded":
          handlerResult = await handleChargeRefunded(
            event.data.object as Stripe.Charge,
          );
          break;

        // 🔄 REFUND EVENTS
        case "refund.created":
          handlerResult = await handleRefundCreated(
            event.data.object as Stripe.Refund,
          );
          break;

        case "refund.updated":
          handlerResult = await handleRefundUpdated(
            event.data.object as Stripe.Refund,
          );
          break;

        // 🔔 OTHER EVENTS
        case "payment_method.attached":
          handlerResult = await handlePaymentMethodAttached(
            event.data.object as Stripe.PaymentMethod,
          );
          break;

        case "customer.created":
          handlerResult = await handleCustomerCreated(
            event.data.object as Stripe.Customer,
          );
          break;

        default:
          logger.debug(`Unhandled event type: ${event.type}`, {
            operation: "handleEvent",
            eventId: event.id,
          });
          handlerResult = { handled: false };
      }

      // ✅ STEP 5: ACKNOWLEDGE RECEIPT
      // Always return 200 to Stripe, even if handler failed
      // Stripe will retry if we return an error
      const responsePayload: {
        received: boolean;
        eventId: string;
        eventType: string;
        handled: boolean;
        warning?: string;
      } = {
        received: true,
        eventId: event.id,
        eventType: event.type,
        handled: handlerResult.handled,
      };

      if (handlerResult.error) {
        responsePayload.warning = handlerResult.error;
        logger.warn("Handler completed with warning", {
          operation: "handleEvent",
          eventId: event.id,
          eventType: event.type,
          error: handlerResult.error,
        });
      }

      return NextResponse.json(responsePayload, { status: 200 });
    } catch (handlerError) {
      logger.error(`Error handling ${event.type}`, handlerError, {
        operation: "handleEvent",
        eventId: event.id,
      });

      // Still return 200 to acknowledge receipt
      // Stripe will retry if we return an error
      return NextResponse.json(
        {
          received: true,
          eventId: event.id,
          eventType: event.type,
          handled: false,
          warning: "Event received but handler failed",
        },
        { status: 200 },
      );
    }
  } catch (error) {
    logger.error("Webhook processing error", error, {
      operation: "processWebhook",
    });

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// PAYMENT INTENT HANDLERS (ServiceResponse Pattern)
// ============================================================================

/**
 * Handle successful payment intent
 * Uses ServiceResponse pattern for error handling
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Processing payment_intent.succeeded", {
    operation: "handlePaymentIntentSucceeded",
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    orderId: paymentIntent.metadata.orderId,
  });

  const response = await paymentService.handlePaymentSuccess(paymentIntent);

  if (!response.success) {
    logger.error("Failed to handle payment success", response.error, {
      operation: "handlePaymentIntentSucceeded",
      paymentIntentId: paymentIntent.id,
    });

    return {
      handled: false,
      error: response.error.message,
    };
  }

  logger.info("Payment success handled", {
    operation: "handlePaymentIntentSucceeded",
    paymentIntentId: paymentIntent.id,
    orderId: response.data.id,
    orderStatus: response.data.status,
    paymentStatus: response.data.paymentStatus,
  });

  return { handled: true };
}

/**
 * Handle failed payment intent
 * Uses ServiceResponse pattern for error handling
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Processing payment_intent.payment_failed", {
    operation: "handlePaymentIntentFailed",
    paymentIntentId: paymentIntent.id,
    orderId: paymentIntent.metadata.orderId,
    lastError: paymentIntent.last_payment_error?.message,
  });

  const response = await paymentService.handlePaymentFailure(paymentIntent);

  if (!response.success) {
    logger.error("Failed to handle payment failure", response.error, {
      operation: "handlePaymentIntentFailed",
      paymentIntentId: paymentIntent.id,
    });

    return {
      handled: false,
      error: response.error.message,
    };
  }

  logger.info("Payment failure handled", {
    operation: "handlePaymentIntentFailed",
    paymentIntentId: paymentIntent.id,
    orderId: response.data.id,
    paymentStatus: response.data.paymentStatus,
  });

  return { handled: true };
}

/**
 * Handle canceled payment intent
 * Treated as a payment failure
 */
async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Processing payment_intent.canceled", {
    operation: "handlePaymentIntentCanceled",
    paymentIntentId: paymentIntent.id,
    orderId: paymentIntent.metadata.orderId,
    cancellationReason: paymentIntent.cancellation_reason,
  });

  // Treat cancellation as failure
  const response = await paymentService.handlePaymentFailure(paymentIntent);

  if (!response.success) {
    logger.error("Failed to handle payment cancellation", response.error, {
      operation: "handlePaymentIntentCanceled",
      paymentIntentId: paymentIntent.id,
    });

    return {
      handled: false,
      error: response.error.message,
    };
  }

  logger.info("Payment cancellation handled", {
    operation: "handlePaymentIntentCanceled",
    paymentIntentId: paymentIntent.id,
    orderId: response.data.id,
  });

  return { handled: true };
}

/**
 * Handle payment intent processing
 * Informational event - no action required
 */
async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Payment intent processing", {
    operation: "handlePaymentIntentProcessing",
    paymentIntentId: paymentIntent.id,
    orderId: paymentIntent.metadata.orderId,
    status: paymentIntent.status,
  });

  // Optional: Update order status to indicate payment is processing
  // This can be useful for customer communication
  // For now, just log the event

  return { handled: true };
}

/**
 * Handle payment intent requires action (e.g., 3D Secure)
 * Informational event - no action required
 */
async function handlePaymentIntentRequiresAction(
  paymentIntent: Stripe.PaymentIntent,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Payment intent requires action", {
    operation: "handlePaymentIntentRequiresAction",
    paymentIntentId: paymentIntent.id,
    orderId: paymentIntent.metadata.orderId,
    nextAction: paymentIntent.next_action?.type,
  });

  // Optional: Notify customer that additional action is required
  // For now, just log the event

  return { handled: true };
}

// ============================================================================
// CHARGE HANDLERS
// ============================================================================

/**
 * Handle successful charge
 * Backup/additional logging - primary handling via payment_intent events
 */
async function handleChargeSucceeded(
  charge: Stripe.Charge,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Charge succeeded", {
    operation: "handleChargeSucceeded",
    chargeId: charge.id,
    amount: charge.amount / 100,
    currency: charge.currency,
    paymentIntentId: charge.payment_intent,
  });

  // Charges are typically handled via payment_intent events
  // This is a backup/additional logging point
  return { handled: true };
}

/**
 * Handle failed charge
 * Logging for analytics/monitoring
 */
async function handleChargeFailed(
  charge: Stripe.Charge,
): Promise<{ handled: boolean; error?: string }> {
  logger.error("Charge failed", undefined, {
    operation: "handleChargeFailed",
    chargeId: charge.id,
    paymentIntentId: charge.payment_intent,
    failureCode: charge.failure_code,
    failureMessage: charge.failure_message,
  });

  // Optional: Log failure for analytics/monitoring
  return { handled: true };
}

/**
 * Handle refunded charge
 * Uses ServiceResponse pattern for error handling
 */
async function handleChargeRefunded(
  charge: Stripe.Charge,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Processing charge.refunded", {
    operation: "handleChargeRefunded",
    chargeId: charge.id,
    amountRefunded: charge.amount_refunded / 100,
    refunded: charge.refunded,
    paymentIntentId: charge.payment_intent,
  });

  const response = await paymentService.handleRefund(charge);

  if (!response.success) {
    logger.error("Failed to handle charge refund", response.error, {
      operation: "handleChargeRefunded",
      chargeId: charge.id,
    });

    return {
      handled: false,
      error: response.error.message,
    };
  }

  logger.info("Charge refund handled", {
    operation: "handleChargeRefunded",
    chargeId: charge.id,
    orderId: response.data.id,
    paymentStatus: response.data.paymentStatus,
  });

  return { handled: true };
}

// ============================================================================
// REFUND HANDLERS
// ============================================================================

/**
 * Handle refund created
 * Informational event - primary handling via charge.refunded
 */
async function handleRefundCreated(
  refund: Stripe.Refund,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Refund created", {
    operation: "handleRefundCreated",
    refundId: refund.id,
    amount: refund.amount / 100,
    status: refund.status,
    reason: refund.reason,
    paymentIntentId: refund.payment_intent,
  });

  // Refunds are typically handled via charge.refunded event
  // This provides additional status tracking
  return { handled: true };
}

/**
 * Handle refund updated
 * Track refund status changes
 */
async function handleRefundUpdated(
  refund: Stripe.Refund,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Refund updated", {
    operation: "handleRefundUpdated",
    refundId: refund.id,
    status: refund.status,
    paymentIntentId: refund.payment_intent,
  });

  // Track refund status changes (e.g., pending -> succeeded)
  return { handled: true };
}

// ============================================================================
// OTHER EVENT HANDLERS
// ============================================================================

/**
 * Handle payment method attached
 * Optional: Store payment method details
 */
async function handlePaymentMethodAttached(
  paymentMethod: Stripe.PaymentMethod,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Payment method attached", {
    operation: "handlePaymentMethodAttached",
    paymentMethodId: paymentMethod.id,
    type: paymentMethod.type,
    customerId: paymentMethod.customer,
  });

  // Optional: Store payment method details for future use
  return { handled: true };
}

/**
 * Handle customer created
 * Optional: Link Stripe customer to internal user
 */
async function handleCustomerCreated(
  customer: Stripe.Customer,
): Promise<{ handled: boolean; error?: string }> {
  logger.info("Stripe customer created", {
    operation: "handleCustomerCreated",
    customerId: customer.id,
    email: customer.email,
  });

  // Optional: Link Stripe customer to internal user record
  return { handled: true };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/webhooks/stripe
 * Health check endpoint for webhook monitoring
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    endpoint: "stripe-webhooks",
    version: "3.0.0",
    features: [
      "ServiceResponse pattern integration",
      "Webhook signature verification",
      "Payment intent lifecycle handling",
      "Refund processing",
      "Comprehensive error handling",
    ],
    message: "Stripe webhook endpoint is operational",
    timestamp: new Date().toISOString(),
  });
}
