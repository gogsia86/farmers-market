/**
 * 💳 Client-Side Stripe Utilities
 * Handles Stripe payment confirmation on the client
 * Following: 05_TESTING_SECURITY_DIVINITY & 11_KILO_SCALE_ARCHITECTURE
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// STRIPE INSTANCE
// ============================================================================

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (lazy initialization)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      logger.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

// ============================================================================
// PAYMENT CONFIRMATION
// ============================================================================

export interface ConfirmPaymentParams {
  clientSecret: string;
  returnUrl?: string;
}

export interface ConfirmPaymentResult {
  success: boolean;
  paymentIntentId?: string;
  status?: string;
  error?: string;
}

/**
 * Confirm payment with Stripe
 * This should be called after order creation to complete the payment
 */
export async function confirmPayment(
  params: ConfirmPaymentParams
): Promise<ConfirmPaymentResult> {
  try {
    const stripe = await getStripe();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe failed to initialize",
      };
    }

    const { clientSecret, returnUrl } = params;

    // Confirm the payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: returnUrl || `${window.location.origin}/orders/confirmation`,
      },
      redirect: "if_required", // Don't redirect unless necessary (e.g., 3D Secure)
    });

    if (error) {
      logger.error("Payment confirmation error:", {
      error: error instanceof Error ? error.message : String(error),
    });
      return {
        success: false,
        error: error.message || "Payment confirmation failed",
      };
    }

    if (paymentIntent) {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    }

    return {
      success: false,
      error: "No payment intent returned",
    };
  } catch (err) {
    logger.error("Payment confirmation exception:", {
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Retrieve payment intent status
 */
export async function retrievePaymentIntent(
  clientSecret: string
): Promise<ConfirmPaymentResult> {
  try {
    const stripe = await getStripe();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe failed to initialize",
      };
    }

    const { paymentIntent, error } = await stripe.retrievePaymentIntent(
      clientSecret
    );

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to retrieve payment intent",
      };
    }

    if (paymentIntent) {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    }

    return {
      success: false,
      error: "No payment intent found",
    };
  } catch (err) {
    logger.error("Retrieve payment intent exception:", {
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Handle payment that requires additional action (e.g., 3D Secure)
 */
export async function handlePaymentAction(
  clientSecret: string
): Promise<ConfirmPaymentResult> {
  try {
    const stripe = await getStripe();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe failed to initialize",
      };
    }

    const { error, paymentIntent } = await stripe.handleCardAction(
      clientSecret
    );

    if (error) {
      return {
        success: false,
        error: error.message || "Payment action failed",
      };
    }

    if (paymentIntent) {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    }

    return {
      success: false,
      error: "No payment intent returned",
    };
  } catch (err) {
    logger.error("Handle payment action exception:", {
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Check if payment requires action (e.g., 3D Secure)
 */
export function requiresPaymentAction(status: string): boolean {
  return status === "requires_action" || status === "requires_source_action";
}

/**
 * Check if payment was successful
 */
export function isPaymentSuccessful(status: string): boolean {
  return status === "succeeded";
}

/**
 * Check if payment is processing
 */
export function isPaymentProcessing(status: string): boolean {
  return status === "processing";
}

/**
 * Check if payment failed
 */
export function isPaymentFailed(status: string): boolean {
  return (
    status === "requires_payment_method" ||
    status === "canceled" ||
    status === "failed"
  );
}
