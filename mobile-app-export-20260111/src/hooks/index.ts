/**
 * 📦 HOOKS INDEX
 * Central export for all custom React hooks
 */

// Stripe Checkout Hook
export {
  useStripeCheckout,
  default as useStripeCheckoutDefault,
} from "./useStripeCheckout";

// Re-export types from hooks
export type {
  CheckoutItem,
  ShippingAddress,
  CheckoutOptions,
  CheckoutTotals,
  CheckoutResult,
  CheckoutStep,
} from "./useStripeCheckout";
