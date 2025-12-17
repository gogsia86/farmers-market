/**
 * ⚡ STRIPE CLIENT CONFIGURATION
 * Divine payment processing with quantum security
 *
 * Note: Stripe client is lazily initialized to avoid build-time errors
 */
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe instance (lazy initialization)
 * This avoids requiring STRIPE_SECRET_KEY at build time
 */
function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not defined in environment variables",
      );
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover", // Latest Stripe API version for 100% compatibility
      typescript: true,
      appInfo: {
        name: "Farmers Market Platform",
        version: "1.0.0",
        url: "https://farmersmarket.com",
      },
    });
  }

  return stripeInstance;
}

/**
 * STRIPE DIVINE CONFIGURATION
 * Enterprise payment processing with agricultural consciousness
 */
export const STRIPE_CONFIG = {
  currency: "usd",
  platformFeePercent: 15, // 15% platform fee
  paymentMethods: [
    "card",
  ] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
};

// Export getter function for lazy initialization
export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => {
    const instance = getStripeInstance();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export default stripe;
