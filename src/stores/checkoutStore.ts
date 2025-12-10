/**
 * 🛒 CHECKOUT STORE - Divine Multi-Step Checkout Flow
 * Zustand store for managing checkout state with agricultural consciousness
 *
 * Features:
 * - Multi-step checkout flow (cart → address → payment → review → confirmation)
 * - Address selection and validation
 * - Payment method management
 * - Order preview and totals
 * - Quantum state persistence
 * - Agricultural consciousness patterns
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FulfillmentMethod } from "@prisma/client";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CheckoutStep =
  | "cart"
  | "address"
  | "payment"
  | "review"
  | "confirmation";

export interface ShippingAddress {
  id?: string;
  type?: "HOME" | "WORK" | "OTHER";
  label?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "CARD" | "BANK_ACCOUNT" | "CASH_ON_DELIVERY";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
  stripePaymentMethodId?: string;
}

export interface OrderPreview {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  platformFee: number;
  discount: number;
  total: number;
  farmerAmount: number;
  itemCount: number;
  farmCount: number;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    farmId: string;
    farmName: string;
    image?: string;
  }>;
}

export interface CheckoutError {
  step: CheckoutStep;
  field?: string;
  message: string;
  code?: string;
}

// ============================================================================
// CHECKOUT STORE INTERFACE
// ============================================================================

interface CheckoutStore {
  // Current state
  currentStep: CheckoutStep;
  completedSteps: Set<CheckoutStep>;

  // Address data
  shippingAddress: ShippingAddress | null;
  savedAddresses: ShippingAddress[];
  fulfillmentMethod: FulfillmentMethod;
  deliveryInstructions: string;

  // Payment data
  paymentMethod: PaymentMethod | null;
  savedPaymentMethods: PaymentMethod[];

  // Order data
  orderPreview: OrderPreview | null;
  specialInstructions: string;

  // UI state
  isProcessing: boolean;
  errors: CheckoutError[];

  // Completed order
  orderId: string | null;
  orderNumber: string | null;

  // Navigation actions
  goToStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepComplete: (step: CheckoutStep) => void;

  // Address actions
  setShippingAddress: (address: ShippingAddress) => void;
  setSavedAddresses: (addresses: ShippingAddress[]) => void;
  setFulfillmentMethod: (method: FulfillmentMethod) => void;
  setDeliveryInstructions: (instructions: string) => void;

  // Payment actions
  setPaymentMethod: (method: PaymentMethod) => void;
  setSavedPaymentMethods: (methods: PaymentMethod[]) => void;

  // Order actions
  setOrderPreview: (preview: OrderPreview) => void;
  setSpecialInstructions: (instructions: string) => void;

  // Processing actions
  setProcessing: (isProcessing: boolean) => void;
  addError: (error: CheckoutError) => void;
  clearErrors: (step?: CheckoutStep) => void;

  // Order completion
  setCompletedOrder: (orderId: string, orderNumber: string) => void;

  // Reset
  resetCheckout: () => void;

  // Validation
  canProceedFromStep: (step: CheckoutStep) => boolean;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  currentStep: "cart" as CheckoutStep,
  completedSteps: new Set<CheckoutStep>(),

  shippingAddress: null,
  savedAddresses: [],
  fulfillmentMethod: "DELIVERY" as FulfillmentMethod,
  deliveryInstructions: "",

  paymentMethod: null,
  savedPaymentMethods: [],

  orderPreview: null,
  specialInstructions: "",

  isProcessing: false,
  errors: [],

  orderId: null,
  orderNumber: null,
};

// ============================================================================
// CHECKOUT STORE
// ============================================================================

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // NAVIGATION ACTIONS
      // ========================================================================

      goToStep: (step: CheckoutStep) => {
        const { completedSteps } = get();
        const steps: CheckoutStep[] = [
          "cart",
          "address",
          "payment",
          "review",
          "confirmation",
        ];
        const currentIndex = steps.indexOf(get().currentStep);
        const targetIndex = steps.indexOf(step);

        // Only allow going back or to completed steps
        if (targetIndex <= currentIndex || completedSteps.has(step)) {
          set({ currentStep: step });
          get().clearErrors();
        }
      },

      nextStep: () => {
        const { currentStep, canProceedFromStep } = get();

        // Validate current step
        if (!canProceedFromStep(currentStep)) {
          return;
        }

        const steps: CheckoutStep[] = [
          "cart",
          "address",
          "payment",
          "review",
          "confirmation",
        ];
        const currentIndex = steps.indexOf(currentStep);

        if (currentIndex < steps.length - 1) {
          const nextStep = steps[currentIndex + 1];
          get().markStepComplete(currentStep);
          set({ currentStep: nextStep });
          get().clearErrors();
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        const steps: CheckoutStep[] = [
          "cart",
          "address",
          "payment",
          "review",
          "confirmation",
        ];
        const currentIndex = steps.indexOf(currentStep);

        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1] });
          get().clearErrors();
        }
      },

      markStepComplete: (step: CheckoutStep) => {
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step]),
        }));
      },

      // ========================================================================
      // ADDRESS ACTIONS
      // ========================================================================

      setShippingAddress: (address: ShippingAddress) => {
        set({ shippingAddress: address });
        get().clearErrors("address");
      },

      setSavedAddresses: (addresses: ShippingAddress[]) => {
        set({ savedAddresses: addresses });
      },

      setFulfillmentMethod: (method: FulfillmentMethod) => {
        set({ fulfillmentMethod: method });
      },

      setDeliveryInstructions: (instructions: string) => {
        set({ deliveryInstructions: instructions });
      },

      // ========================================================================
      // PAYMENT ACTIONS
      // ========================================================================

      setPaymentMethod: (method: PaymentMethod) => {
        set({ paymentMethod: method });
        get().clearErrors("payment");
      },

      setSavedPaymentMethods: (methods: PaymentMethod[]) => {
        set({ savedPaymentMethods: methods });
      },

      // ========================================================================
      // ORDER ACTIONS
      // ========================================================================

      setOrderPreview: (preview: OrderPreview) => {
        set({ orderPreview: preview });
      },

      setSpecialInstructions: (instructions: string) => {
        set({ specialInstructions: instructions });
      },

      // ========================================================================
      // PROCESSING ACTIONS
      // ========================================================================

      setProcessing: (isProcessing: boolean) => {
        set({ isProcessing });
      },

      addError: (error: CheckoutError) => {
        set((state) => ({
          errors: [...state.errors, error],
        }));
      },

      clearErrors: (step?: CheckoutStep) => {
        if (step) {
          set((state) => ({
            errors: state.errors.filter((e) => e.step !== step),
          }));
        } else {
          set({ errors: [] });
        }
      },

      // ========================================================================
      // ORDER COMPLETION
      // ========================================================================

      setCompletedOrder: (orderId: string, orderNumber: string) => {
        set({
          orderId,
          orderNumber,
          currentStep: "confirmation",
        });
        get().markStepComplete("review");
        get().markStepComplete("confirmation");
      },

      // ========================================================================
      // RESET
      // ========================================================================

      resetCheckout: () => {
        set({
          ...initialState,
          // Preserve saved addresses and payment methods
          savedAddresses: get().savedAddresses,
          savedPaymentMethods: get().savedPaymentMethods,
        });
      },

      // ========================================================================
      // VALIDATION
      // ========================================================================

      canProceedFromStep: (step: CheckoutStep): boolean => {
        const state = get();

        switch (step) {
          case "cart":
            // Can proceed if order preview exists (cart has items)
            return (
              state.orderPreview !== null && state.orderPreview.itemCount > 0
            );

          case "address": {
            // Can proceed if shipping address is set
            if (!state.shippingAddress) {
              state.addError({
                step: "address",
                message: "Please select or enter a shipping address",
                code: "ADDRESS_REQUIRED",
              });
              return false;
            }

            // Validate address completeness
            const addr = state.shippingAddress;
            if (!addr.street || !addr.city || !addr.state || !addr.zipCode) {
              state.addError({
                step: "address",
                message: "Please complete all required address fields",
                code: "ADDRESS_INCOMPLETE",
              });
              return false;
            }

            return true;
          }

          case "payment":
            // Can proceed if payment method is set
            if (!state.paymentMethod) {
              state.addError({
                step: "payment",
                message: "Please select a payment method",
                code: "PAYMENT_METHOD_REQUIRED",
              });
              return false;
            }

            return true;

          case "review":
            // All previous steps must be completed
            return (
              state.shippingAddress !== null &&
              state.paymentMethod !== null &&
              state.orderPreview !== null
            );

          case "confirmation":
            // Should have completed order
            return state.orderId !== null;

          default:
            return true;
        }
      },
    }),
    {
      name: "checkout-storage",
      // Only persist certain fields
      partialize: (state) => ({
        shippingAddress: state.shippingAddress,
        savedAddresses: state.savedAddresses,
        fulfillmentMethod: state.fulfillmentMethod,
        deliveryInstructions: state.deliveryInstructions,
        savedPaymentMethods: state.savedPaymentMethods,
        specialInstructions: state.specialInstructions,
      }),
    },
  ),
);

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get current step validation status
 */
export const useCheckoutValidation = () => {
  const currentStep = useCheckoutStore((state) => state.currentStep);
  const canProceed = useCheckoutStore((state) =>
    state.canProceedFromStep(currentStep),
  );
  const errors = useCheckoutStore((state) =>
    state.errors.filter((e) => e.step === currentStep),
  );

  return {
    canProceed,
    errors,
    hasErrors: errors.length > 0,
  };
};

/**
 * Hook to get checkout progress
 */
export const useCheckoutProgress = () => {
  const currentStep = useCheckoutStore((state) => state.currentStep);
  const completedSteps = useCheckoutStore((state) => state.completedSteps);

  const steps: CheckoutStep[] = [
    "cart",
    "address",
    "payment",
    "review",
    "confirmation",
  ];
  const currentIndex = steps.indexOf(currentStep);
  const totalSteps = steps.length;
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  return {
    currentStep,
    currentIndex,
    totalSteps,
    progress,
    completedSteps: Array.from(completedSteps),
    isFirstStep: currentIndex === 0,
    isLastStep: currentIndex === totalSteps - 1,
  };
};
