/**
 * ⚡ STRIPE CLIENT CONFIGURATION
 * Divine payment processing with quantum security
 */
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

/**
 * STRIPE DIVINE CONFIGURATION
 * Enterprise payment processing with agricultural consciousness
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover", // Latest Stripe API version for 100% compatibility
  typescript: true,
  appInfo: {
    name: "Farmers Market Platform",
    version: "1.0.0",
    url: "https://farmersmarket.com",
  },
});

export const STRIPE_CONFIG = {
  currency: "usd",
  platformFeePercent: 15, // 15% platform fee
  paymentMethods: [
    "card",
  ] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
};

export default stripe;
