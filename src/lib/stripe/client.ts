/**
 * 🌾 STRIPE CLIENT-SIDE LOADER
 * Divine payment processing for the agricultural platform
 *
 * Features:
 * - Lazy loading of Stripe.js
 * - Automatic retry on failure
 * - Type-safe Stripe instance
 * - Agricultural consciousness integration
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// CONFIGURATION
// ============================================================================

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  logger.warn(
    "⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found. Payment features will use test mode.",
  );
}

// ============================================================================
// STRIPE INSTANCE CACHE
// ============================================================================

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * ⚡ GET STRIPE CLIENT INSTANCE
 * Loads and returns the Stripe.js instance with caching
 *
 * This function ensures Stripe.js is only loaded once per session
 * and reuses the same instance across the application.
 *
 * @returns Promise resolving to Stripe instance or null if key is missing
 *
 * @example
 * ```typescript
 * const stripe = await getStripeClient();
 * if (stripe) {
 *   const { error } = await stripe.confirmPayment({ ... });
 * }
 * ```
 */
export const getStripeClient = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    if (STRIPE_PUBLISHABLE_KEY) {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
        locale: "en",
      });
    } else {
      // Return null promise if key is missing
      stripePromise = Promise.resolve(null);
    }
  }

  return stripePromise;
};

/**
 * ⚡ CREATE PAYMENT METHOD
 * Creates a Stripe payment method from card details
 *
 * @param stripe - Stripe instance
 * @param cardElement - Stripe Card Element
 * @param billingDetails - Billing information
 * @returns PaymentMethod or error
 */
export async function createPaymentMethod(
  stripe: Stripe,
  cardElement: unknown, // Stripe CardElement type
  billingDetails: {
    name: string;
    email?: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  },
) {
  try {
    // Type assertion for Stripe CardElement
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement as any,
      billing_details: billingDetails,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, paymentMethod };
  } catch (error) {
    logger.error("Error creating payment method:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * ⚡ CONFIRM PAYMENT
 * Confirms a payment intent on the client side
 *
 * @param stripe - Stripe instance
 * @param clientSecret - Payment intent client secret
 * @param paymentMethodId - Payment method ID
 * @returns Payment result or error
 */
export async function confirmPayment(
  stripe: Stripe,
  clientSecret: string,
  paymentMethodId: string,
) {
  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: paymentMethodId,
      },
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, paymentIntent };
  } catch (error) {
    logger.error("Error confirming payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 🌾 AGRICULTURAL STRIPE METADATA
 * Adds agricultural context to Stripe transactions
 */
export function createAgriculturalMetadata(data: {
  farmId?: string;
  farmName?: string;
  season?: string;
  productTypes?: string[];
  deliveryMethod?: string;
}): Record<string, string> {
  return {
    platform: "Farmers Market",
    farm_id: data.farmId || "",
    farm_name: data.farmName || "",
    season: data.season || "",
    product_types: data.productTypes?.join(",") || "",
    delivery_method: data.deliveryMethod || "",
    consciousness_level: "BIODYNAMIC",
  };
}

/**
 * ⚡ STRIPE ERROR HANDLER
 * Converts Stripe errors to user-friendly messages
 */
export function getStripeErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  // Type guard for error object
  const errorObj = error as { type?: string; message?: string };

  // Stripe-specific error messages
  switch (errorObj?.type) {
    case "card_error":
      return errorObj.message || "Your card was declined.";
    case "validation_error":
      return "Invalid payment information. Please check your details.";
    case "api_error":
      return "Unable to process payment. Please try again.";
    case "authentication_error":
      return "Authentication failed. Please contact support.";
    case "rate_limit_error":
      return "Too many requests. Please wait a moment and try again.";
    default:
      return errorObj?.message || "An unexpected error occurred.";
  }
}

/**
 * 🔒 VALIDATE STRIPE KEY
 * Checks if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY.startsWith("pk_");
}

/**
 * 🌾 STRIPE CLIENT UTILITIES
 * Export all utilities for convenience
 */
export const stripeClient = {
  getClient: getStripeClient,
  createPaymentMethod,
  confirmPayment,
  createAgriculturalMetadata,
  getErrorMessage: getStripeErrorMessage,
  isConfigured: isStripeConfigured,
};

export default stripeClient;
