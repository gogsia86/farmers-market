/**
 * 🛒 USE STRIPE CHECKOUT HOOK
 * Custom hook for handling the complete checkout flow with Stripe
 *
 * Features:
 * - Payment intent creation and management
 * - Payment sheet presentation
 * - Order creation after successful payment
 * - Error handling and retry logic
 * - Loading states throughout the flow
 *
 * @requires StripePaymentProvider to be in the component tree
 */

import { useState, useCallback } from "react";
import { useStripePayment } from "../providers/StripeProvider";
import apiClient from "../services/api";

// ============================================================================
// TYPES
// ============================================================================

export interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
}

export interface ShippingAddress {
  id?: string;
  fullName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  phone?: string;
}

export interface CheckoutOptions {
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: "DELIVERY" | "PICKUP" | "SHIPPING";
  paymentMethodId?: string;
  promoCode?: string;
  specialInstructions?: string;
}

export interface CheckoutTotals {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
  requiresAction?: boolean;
  clientSecret?: string;
}

export type CheckoutStep =
  | "idle"
  | "creating_intent"
  | "confirming_payment"
  | "creating_order"
  | "completed"
  | "failed";

// ============================================================================
// HOOK
// ============================================================================

export function useStripeCheckout() {
  const stripe = useStripePayment();

  const [step, setStep] = useState<CheckoutStep>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // ========================================
  // RESET
  // ========================================

  const reset = useCallback(() => {
    setStep("idle");
    setIsProcessing(false);
    setError(null);
    setOrderId(null);
    setPaymentIntentId(null);
    stripe.clearError();
  }, [stripe]);

  // ========================================
  // CALCULATE TOTALS
  // ========================================

  const calculateTotals = useCallback(
    (
      items: CheckoutItem[],
      deliveryFee: number = 0,
      discount: number = 0,
      taxRate: number = 0.08,
    ): CheckoutTotals => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const tax = subtotal * taxRate;
      const total = subtotal + tax + deliveryFee - discount;

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100,
      };
    },
    [],
  );

  // ========================================
  // PROCESS CHECKOUT
  // ========================================

  const processCheckout = useCallback(
    async (
      options: CheckoutOptions,
      totals: CheckoutTotals,
    ): Promise<CheckoutResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Step 1: Create Payment Intent
        setStep("creating_intent");
        const amountInCents = Math.round(totals.total * 100);

        const paymentIntent = await stripe.createPaymentIntent(
          amountInCents,
          "usd",
        );

        if (!paymentIntent) {
          throw new Error(stripe.error || "Failed to create payment intent");
        }

        setPaymentIntentId(paymentIntent.paymentIntentId);

        // Step 2: Initialize and Present Payment Sheet (if no saved payment method)
        if (!options.paymentMethodId) {
          const initialized = await stripe.initializePaymentSheet(
            paymentIntent.clientSecret,
            "Farmers Market",
          );

          if (!initialized) {
            throw new Error("Failed to initialize payment sheet");
          }

          const sheetResult = await stripe.presentPaymentSheet();

          if (!sheetResult.success) {
            if (sheetResult.error === "Payment canceled") {
              setStep("idle");
              return { success: false, error: "Payment canceled" };
            }
            throw new Error(sheetResult.error || "Payment failed");
          }
        } else {
          // Step 2b: Confirm with saved payment method
          setStep("confirming_payment");

          const confirmResult = await stripe.confirmPayment(
            paymentIntent.clientSecret,
            options.paymentMethodId,
          );

          if (!confirmResult.success) {
            if (confirmResult.error?.includes("requires_action")) {
              return {
                success: false,
                requiresAction: true,
                clientSecret: paymentIntent.clientSecret,
                error: "Additional authentication required",
              };
            }
            throw new Error(
              confirmResult.error || "Payment confirmation failed",
            );
          }
        }

        // Step 3: Create Order
        setStep("creating_order");

        const orderData = {
          items: options.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddressId: options.shippingAddress.id,
          shippingAddress: options.shippingAddress.id
            ? undefined
            : options.shippingAddress,
          fulfillmentMethod: options.deliveryMethod,
          paymentIntentId: paymentIntent.paymentIntentId,
          paymentMethodId: options.paymentMethodId,
          subtotal: totals.subtotal,
          tax: totals.tax,
          deliveryFee: totals.deliveryFee,
          discount: totals.discount,
          total: totals.total,
          promoCode: options.promoCode,
          specialInstructions: options.specialInstructions,
        };

        const orderResponse = await apiClient.orders.create(orderData);

        if (!orderResponse.success && !orderResponse.data?.id) {
          throw new Error(orderResponse.error || "Failed to create order");
        }

        const createdOrderId =
          orderResponse.data?.id || orderResponse.id || "unknown";
        setOrderId(createdOrderId);
        setStep("completed");

        return {
          success: true,
          orderId: createdOrderId,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Checkout failed";
        setError(errorMessage);
        setStep("failed");

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe],
  );

  // ========================================
  // QUICK CHECKOUT (with saved payment method)
  // ========================================

  const quickCheckout = useCallback(
    async (
      options: CheckoutOptions,
      totals: CheckoutTotals,
    ): Promise<CheckoutResult> => {
      if (!options.paymentMethodId) {
        return {
          success: false,
          error: "Payment method ID required for quick checkout",
        };
      }

      return processCheckout(options, totals);
    },
    [processCheckout],
  );

  // ========================================
  // RETRY FAILED PAYMENT
  // ========================================

  const retryPayment = useCallback(
    async (
      options: CheckoutOptions,
      totals: CheckoutTotals,
    ): Promise<CheckoutResult> => {
      reset();
      return processCheckout(options, totals);
    },
    [processCheckout, reset],
  );

  // ========================================
  // VALIDATE CHECKOUT
  // ========================================

  const validateCheckout = useCallback(
    (options: CheckoutOptions): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Validate items
      if (!options.items || options.items.length === 0) {
        errors.push("Cart is empty");
      }

      // Validate shipping address
      if (!options.shippingAddress) {
        errors.push("Shipping address is required");
      } else {
        const addr = options.shippingAddress;
        if (!addr.fullName) errors.push("Full name is required");
        if (!addr.street) errors.push("Street address is required");
        if (!addr.city) errors.push("City is required");
        if (!addr.state) errors.push("State is required");
        if (!addr.zipCode) errors.push("ZIP code is required");
      }

      // Validate delivery method
      if (!options.deliveryMethod) {
        errors.push("Delivery method is required");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [],
  );

  // ========================================
  // APPLY PROMO CODE
  // ========================================

  const validatePromoCode = useCallback(
    async (
      code: string,
      subtotal: number,
    ): Promise<{ valid: boolean; discount: number; message?: string }> => {
      try {
        // Call API to validate promo code
        // For now, implement basic logic
        const upperCode = code.toUpperCase().trim();

        // Mock validation - replace with actual API call
        if (upperCode === "FRESH10") {
          return {
            valid: true,
            discount: subtotal * 0.1,
            message: "10% off applied!",
          };
        } else if (upperCode === "FIRST5") {
          return {
            valid: true,
            discount: 5,
            message: "$5 off your first order!",
          };
        } else if (upperCode === "FREESHIP") {
          return {
            valid: true,
            discount: 0,
            message: "Free shipping applied!",
          };
        }

        return {
          valid: false,
          discount: 0,
          message: "Invalid promo code",
        };
      } catch (_err) {
        return {
          valid: false,
          discount: 0,
          message: "Failed to validate promo code",
        };
      }
    },
    [],
  );

  // ========================================
  // RETURN VALUE
  // ========================================

  return {
    // State
    step,
    isProcessing,
    error,
    orderId,
    paymentIntentId,

    // Stripe state (forwarded)
    isStripeInitialized: stripe.isInitialized,
    savedPaymentMethods: stripe.savedPaymentMethods,

    // Methods
    processCheckout,
    quickCheckout,
    retryPayment,
    reset,

    // Utilities
    calculateTotals,
    validateCheckout,
    validatePromoCode,

    // Payment methods (forwarded)
    fetchSavedPaymentMethods: stripe.fetchSavedPaymentMethods,
    addPaymentMethod: stripe.addPaymentMethod,
    removePaymentMethod: stripe.removePaymentMethod,
  };
}

export default useStripeCheckout;
