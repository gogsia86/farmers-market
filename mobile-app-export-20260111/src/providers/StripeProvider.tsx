/**
 * 💳 STRIPE PROVIDER - Divine Payment Integration
 * Provides Stripe payment functionality throughout the mobile app
 *
 * Features:
 * - Payment sheet initialization with Apple Pay / Google Pay
 * - Card tokenization via Stripe SDK
 * - Payment method management
 * - Secure payment processing
 * - 3D Secure authentication handling
 *
 * @requires @stripe/stripe-react-native
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  StripeProvider as StripeSDKProvider,
  useStripe,
  useConfirmPayment,
  CardField,
  CardFieldInput,
  initPaymentSheet,
  presentPaymentSheet,
  confirmPayment as stripeConfirmPayment,
  createPaymentMethod as stripeCreatePaymentMethod,
  PaymentSheetError,
  ConfirmPaymentResult,
} from "@stripe/stripe-react-native";
import apiClient from "../services/api";

// ============================================================================
// TYPES
// ============================================================================

interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status?: string;
}

interface PaymentMethodData {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface CardDetails {
  complete: boolean;
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  postalCode?: string;
}

interface StripeContextType {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  cardDetails: CardDetails | null;

  // Payment Intent
  createPaymentIntent: (
    amount: number,
    currency?: string,
    metadata?: Record<string, string>,
  ) => Promise<PaymentIntentResult | null>;

  // Payment Sheet
  initializePaymentSheet: (
    clientSecret: string,
    options?: PaymentSheetOptions,
  ) => Promise<{ initialized: boolean; error?: string }>;
  presentPaymentSheet: () => Promise<{ success: boolean; error?: string }>;

  // Card Operations
  setCardDetails: (details: CardDetails | null) => void;
  createPaymentMethod: () => Promise<{ paymentMethodId: string } | null>;

  // Confirm Payment
  confirmPayment: (
    clientSecret: string,
    paymentMethodId?: string,
  ) => Promise<{ success: boolean; error?: string; requiresAction?: boolean }>;

  // Payment Methods Management
  savedPaymentMethods: PaymentMethodData[];
  fetchSavedPaymentMethods: () => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<boolean>;

  // Utility
  clearError: () => void;
}

interface PaymentSheetOptions {
  merchantName?: string;
  customerId?: string;
  customerEphemeralKeySecret?: string;
  allowsDelayedPaymentMethods?: boolean;
  applePay?: {
    merchantCountryCode: string;
  };
  googlePay?: {
    merchantCountryCode: string;
    testEnv?: boolean;
  };
  returnURL?: string;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postalCode?: string;
      state?: string;
    };
  };
}

// ============================================================================
// CONTEXT
// ============================================================================

const StripeContext = createContext<StripeContextType | undefined>(undefined);

// ============================================================================
// INTERNAL PROVIDER (uses Stripe hooks)
// ============================================================================

interface StripeInternalProviderProps {
  children: ReactNode;
}

function StripeInternalProvider({ children }: StripeInternalProviderProps) {
  const _stripe = useStripe();
  const { confirmPayment: _confirmPaymentHook } = useConfirmPayment();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    PaymentMethodData[]
  >([]);
  const [_currentPaymentIntent, setCurrentPaymentIntent] =
    useState<PaymentIntentResult | null>(null);

  // ========================================
  // INITIALIZATION
  // ========================================

  useEffect(() => {
    // Stripe SDK is initialized by StripeSDKProvider wrapper
    setIsInitialized(true);
    console.log("🔐 Stripe SDK initialized");
  }, []);

  // ========================================
  // PAYMENT INTENT
  // ========================================

  const createPaymentIntent = useCallback(
    async (
      amount: number,
      currency: string = "usd",
      metadata?: Record<string, string>,
    ): Promise<PaymentIntentResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.payments.createPaymentIntent(
          amount,
          currency,
          metadata,
        );

        if (response.success && response.paymentIntent) {
          const result: PaymentIntentResult = {
            clientSecret: response.paymentIntent.clientSecret,
            paymentIntentId: response.paymentIntent.id,
            amount: response.paymentIntent.amount,
            currency: response.paymentIntent.currency,
            status: response.paymentIntent.status,
          };

          setCurrentPaymentIntent(result);
          console.log("💰 Payment intent created:", result.paymentIntentId);
          return result;
        }

        throw new Error(response.error || "Failed to create payment intent");
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create payment intent";
        console.error("❌ Payment intent creation failed:", message);
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ========================================
  // PAYMENT SHEET
  // ========================================

  const initializePaymentSheetHandler = useCallback(
    async (
      clientSecret: string,
      options: PaymentSheetOptions = {},
    ): Promise<{ initialized: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: options.merchantName || "Farmers Market",
          customerId: options.customerId,
          customerEphemeralKeySecret: options.customerEphemeralKeySecret,
          allowsDelayedPaymentMethods:
            options.allowsDelayedPaymentMethods ?? true,
          applePay: options.applePay
            ? {
                merchantCountryCode:
                  options.applePay.merchantCountryCode || "US",
              }
            : undefined,
          googlePay: options.googlePay
            ? {
                merchantCountryCode:
                  options.googlePay.merchantCountryCode || "US",
                testEnv: options.googlePay.testEnv ?? __DEV__,
              }
            : undefined,
          returnURL: options.returnURL || "farmersmarket://stripe-redirect",
          defaultBillingDetails: options.billingDetails,
          style: "automatic",
        });

        if (initError) {
          console.error("❌ Payment sheet init error:", initError.message);
          setError(initError.message);
          return { initialized: false, error: initError.message };
        }

        console.log("💳 Payment sheet initialized successfully");
        return { initialized: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to initialize payment sheet";
        console.error("❌ Payment sheet init exception:", message);
        setError(message);
        return { initialized: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const presentPaymentSheetHandler = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // Handle user cancellation gracefully
        if (presentError.code === PaymentSheetError.Canceled) {
          console.log("ℹ️ Payment sheet canceled by user");
          return { success: false, error: "Payment canceled" };
        }

        console.error("❌ Payment sheet error:", presentError.message);
        setError(presentError.message);
        return { success: false, error: presentError.message };
      }

      console.log("✅ Payment completed via payment sheet");
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      console.error("❌ Payment sheet exception:", message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // CARD OPERATIONS
  // ========================================

  const createPaymentMethodHandler = useCallback(async (): Promise<{
    paymentMethodId: string;
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!cardDetails?.complete) {
        throw new Error("Please complete card details");
      }

      const { paymentMethod, error: createError } =
        await stripeCreatePaymentMethod({
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {},
          },
        });

      if (createError) {
        throw new Error(createError.message);
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      console.log("💳 Payment method created:", paymentMethod.id);
      return { paymentMethodId: paymentMethod.id };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create payment method";
      console.error("❌ Create payment method error:", message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cardDetails]);

  // ========================================
  // CONFIRM PAYMENT
  // ========================================

  const confirmPaymentHandler = useCallback(
    async (
      clientSecret: string,
      paymentMethodId?: string,
    ): Promise<{
      success: boolean;
      error?: string;
      requiresAction?: boolean;
    }> => {
      setIsLoading(true);
      setError(null);

      try {
        let result: ConfirmPaymentResult;

        if (paymentMethodId) {
          // Confirm with existing payment method
          result = await stripeConfirmPayment(clientSecret, {
            paymentMethodType: "Card",
            paymentMethodData: {
              paymentMethodId,
            },
          });
        } else {
          // Confirm with card details from CardField
          if (!cardDetails?.complete) {
            throw new Error("Please complete card details");
          }

          result = await stripeConfirmPayment(clientSecret, {
            paymentMethodType: "Card",
          });
        }

        const { paymentIntent, error: confirmError } = result;

        if (confirmError) {
          console.error("❌ Confirm payment error:", confirmError.message);
          setError(confirmError.message);
          return { success: false, error: confirmError.message };
        }

        if (!paymentIntent) {
          throw new Error("Payment confirmation failed");
        }

        // Handle different payment intent statuses
        switch (paymentIntent.status) {
          case "Succeeded":
            console.log("✅ Payment succeeded");
            return { success: true };

          case "RequiresAction":
          case "RequiresConfirmation":
            console.log("⚠️ Payment requires additional action (3DS)");
            return { success: false, requiresAction: true };

          case "RequiresPaymentMethod":
            console.log("❌ Payment method failed");
            return {
              success: false,
              error: "Payment method was declined. Please try another card.",
            };

          case "Processing":
            console.log("⏳ Payment is processing");
            return { success: true }; // Will be confirmed via webhook

          case "Canceled":
            return { success: false, error: "Payment was canceled" };

          default:
            console.log("❓ Unknown payment status:", paymentIntent.status);
            return { success: false, error: "Payment status unknown" };
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Payment confirmation failed";
        console.error("❌ Confirm payment exception:", message);
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [cardDetails],
  );

  // ========================================
  // PAYMENT METHODS MANAGEMENT
  // ========================================

  const fetchSavedPaymentMethods = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await apiClient.payments.getPaymentMethods();

      if (response.success && response.data) {
        const methods: PaymentMethodData[] = response.data.map(
          (pm: Record<string, unknown>) => ({
            id: pm.id as string,
            brand:
              (pm.card as Record<string, unknown>)?.brand ||
              pm.brand ||
              "unknown",
            last4:
              (pm.card as Record<string, unknown>)?.last4 || pm.last4 || "****",
            expMonth:
              (pm.card as Record<string, unknown>)?.exp_month ||
              pm.expMonth ||
              0,
            expYear:
              (pm.card as Record<string, unknown>)?.exp_year || pm.expYear || 0,
            isDefault: (pm.isDefault as boolean) || false,
          }),
        );

        setSavedPaymentMethods(methods);
        console.log(`💳 Fetched ${methods.length} saved payment methods`);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch payment methods:", err);
      // Don't set error state for fetch failures
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(
    async (paymentMethodId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await apiClient.payments.addPaymentMethod(paymentMethodId);

        if (response.success) {
          await fetchSavedPaymentMethods();
          console.log("✅ Payment method added:", paymentMethodId);
          return true;
        }

        throw new Error(response.error || "Failed to add payment method");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to add payment method";
        console.error("❌ Add payment method error:", message);
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSavedPaymentMethods],
  );

  const removePaymentMethod = useCallback(
    async (paymentMethodId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await apiClient.payments.removePaymentMethod(paymentMethodId);

        if (response.success) {
          setSavedPaymentMethods((prev) =>
            prev.filter((pm) => pm.id !== paymentMethodId),
          );
          console.log("✅ Payment method removed:", paymentMethodId);
          return true;
        }

        throw new Error(response.error || "Failed to remove payment method");
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to remove payment method";
        console.error("❌ Remove payment method error:", message);
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const setDefaultPaymentMethodHandler = useCallback(
    async (paymentMethodId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await apiClient.payments.setDefaultPaymentMethod?.(paymentMethodId);

        if (response?.success !== false) {
          setSavedPaymentMethods((prev) =>
            prev.map((pm) => ({
              ...pm,
              isDefault: pm.id === paymentMethodId,
            })),
          );
          console.log("✅ Default payment method set:", paymentMethodId);
          return true;
        }

        throw new Error(
          response?.error || "Failed to set default payment method",
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to set default payment method";
        console.error("❌ Set default payment method error:", message);
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ========================================
  // UTILITY
  // ========================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: StripeContextType = {
    isInitialized,
    isLoading,
    error,
    cardDetails,
    createPaymentIntent,
    initializePaymentSheet: initializePaymentSheetHandler,
    presentPaymentSheet: presentPaymentSheetHandler,
    setCardDetails,
    createPaymentMethod: createPaymentMethodHandler,
    confirmPayment: confirmPaymentHandler,
    savedPaymentMethods,
    fetchSavedPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod: setDefaultPaymentMethodHandler,
    clearError,
  };

  return (
    <StripeContext.Provider value={contextValue}>
      {children}
    </StripeContext.Provider>
  );
}

// ============================================================================
// PUBLIC PROVIDER COMPONENT
// ============================================================================

interface StripeProviderProps {
  children: ReactNode;
  publishableKey?: string;
  merchantIdentifier?: string;
  urlScheme?: string;
}

/**
 * StripePaymentProvider - Wraps the app with Stripe functionality
 *
 * @example
 * ```tsx
 * <StripePaymentProvider
 *   publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
 *   merchantIdentifier="merchant.com.farmersmarket"
 * >
 *   <App />
 * </StripePaymentProvider>
 * ```
 */
export function StripePaymentProvider({
  children,
  publishableKey,
  merchantIdentifier = "merchant.com.farmersmarket",
  urlScheme = "farmersmarket",
}: StripeProviderProps) {
  const stripePublishableKey =
    publishableKey || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

  if (!stripePublishableKey) {
    console.warn(
      "⚠️ Stripe publishable key not found. Payment features will be limited.",
    );
  }

  return (
    <StripeSDKProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier={merchantIdentifier}
      urlScheme={urlScheme}
    >
      <StripeInternalProvider>{children}</StripeInternalProvider>
    </StripeSDKProvider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useStripePayment - Access Stripe payment functionality
 *
 * @example
 * ```tsx
 * const {
 *   createPaymentIntent,
 *   initializePaymentSheet,
 *   presentPaymentSheet,
 *   isLoading,
 *   error,
 * } = useStripePayment();
 *
 * const handleCheckout = async () => {
 *   const intent = await createPaymentIntent(1000, 'usd');
 *   if (intent) {
 *     await initializePaymentSheet(intent.clientSecret);
 *     const { success } = await presentPaymentSheet();
 *     if (success) {
 *       // Payment completed!
 *     }
 *   }
 * };
 * ```
 */
export function useStripePayment(): StripeContextType {
  const context = useContext(StripeContext);

  if (context === undefined) {
    throw new Error(
      "useStripePayment must be used within a StripePaymentProvider",
    );
  }

  return context;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format card brand for display
 */
export function formatCardBrand(brand: string): string {
  const brands: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    diners: "Diners Club",
    jcb: "JCB",
    unionpay: "UnionPay",
    unknown: "Card",
  };

  return brands[brand.toLowerCase()] || brands.unknown;
}

/**
 * Get card brand icon name (for icon libraries)
 */
export function getCardBrandIcon(brand: string): string {
  const icons: Record<string, string> = {
    visa: "cc-visa",
    mastercard: "cc-mastercard",
    amex: "cc-amex",
    discover: "cc-discover",
    diners: "cc-diners-club",
    jcb: "cc-jcb",
    unknown: "credit-card",
  };

  return icons[brand.toLowerCase()] || icons.unknown;
}

/**
 * Format card expiry date
 */
export function formatExpiryDate(month: number, year: number): string {
  const monthStr = month.toString().padStart(2, "0");
  const yearStr = year.toString().slice(-2);
  return `${monthStr}/${yearStr}`;
}

/**
 * Check if card is expired
 */
export function isCardExpired(expMonth: number, expYear: number): boolean {
  const now = new Date();
  const expiry = new Date(expYear, expMonth, 0); // Last day of expiry month
  return expiry < now;
}

/**
 * Mask card number for display
 */
export function maskCardNumber(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export CardField for use in payment forms
export { CardField, CardFieldInput };

// Export types
export type {
  PaymentIntentResult,
  PaymentMethodData,
  CardDetails,
  StripeContextType,
  PaymentSheetOptions,
};
