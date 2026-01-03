"use client";

/**
 * 💳 STRIPE PAYMENT ELEMENT - Divine Payment Processing
 * Modern Stripe Elements integration with agricultural consciousness
 *
 * Features:
 * - Stripe Elements Provider wrapper
 * - PaymentElement for unified payment methods
 * - Automatic payment method detection
 * - 3D Secure (SCA) support
 * - Real-time validation
 * - Agricultural-themed UI
 * - Error handling with enlightening messages
 * - Loading states and skeleton UI
 */

import { paymentLogger } from "@/lib/utils/logger";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// CONFIGURATION
// ============================================================================

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

// ============================================================================
// TYPES
// ============================================================================

interface StripePaymentElementProps {
  clientSecret: string;
  amount: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
}

interface PaymentFormProps {
  amount: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
}

// ============================================================================
// PAYMENT FORM COMPONENT (Inside Elements Provider)
// ============================================================================

function PaymentForm({
  amount,
  onSuccess,
  onError,
  returnUrl,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Handle payment submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url:
            returnUrl || `${window.location.origin}/checkout/confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Payment failed
        const message =
          error.type === "card_error" || error.type === "validation_error"
            ? error.message || "Payment failed"
            : "An unexpected error occurred";

        setErrorMessage(message);
        onError?.(message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        onSuccess?.(paymentIntent.id);
      } else if (paymentIntent) {
        // Payment requires additional action (3D Secure, etc.)
        // Stripe will handle this automatically with redirect: "if_required"
        paymentLogger.debug("Payment intent requires additional action", { status: paymentIntent.status });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      data-testid="stripe-payment-form"
    >
      {/* Security Badge */}
      <div
        className="bg-green-50 border border-green-200 rounded-lg p-4"
        data-testid="payment-security-badge"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900 mb-1">
              🔒 Secure Payment
            </h4>
            <p className="text-sm text-green-800">
              Your payment information is encrypted and processed securely by
              Stripe. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Order Amount */}
      <div
        className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4"
        data-testid="payment-amount-display"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total Amount
          </span>
          <span className="text-2xl font-bold text-amber-900">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div
        className="border border-gray-300 rounded-lg p-4 bg-white"
        data-testid="stripe-elements-container"
      >
        <PaymentElement
          onReady={() => setIsReady(true)}
          options={{
            layout: "tabs",
            business: {
              name: "Farmers Market Platform",
            },
            fields: {
              billingDetails: {
                address: {
                  country: "auto",
                },
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          data-testid="stripe-payment-error"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Payment Error</h4>
              <p
                className="text-sm text-red-800"
                data-testid="stripe-error-message"
              >
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !isReady}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        data-testid="stripe-submit-button"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            <span>Pay ${(amount / 100).toFixed(2)}</span>
          </>
        )}
      </button>

      {/* Payment Methods Accepted */}
      <div
        className="pt-4 border-t border-gray-200"
        data-testid="payment-methods-accepted"
      >
        <p className="text-sm text-gray-600 mb-3 text-center">
          We accept all major payment methods
        </p>
        <div
          className="flex items-center justify-center gap-3"
          data-testid="payment-card-icons"
        >
          <div className="w-12 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
            VISA
          </div>
          <div className="w-12 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
            MC
          </div>
          <div className="w-12 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
            AMEX
          </div>
          <div className="w-12 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
            DISC
          </div>
        </div>
      </div>

      {/* Stripe Badge */}
      <div
        className="flex items-center justify-center gap-2 text-sm text-gray-500"
        data-testid="stripe-powered-badge"
      >
        <span>Powered by</span>
        <span className="font-semibold text-blue-600">Stripe</span>
      </div>
    </form>
  );
}

// ============================================================================
// STRIPE PAYMENT ELEMENT (Main Export)
// ============================================================================

export function StripePaymentElement({
  clientSecret,
  amount,
  onSuccess,
  onError,
  returnUrl,
}: StripePaymentElementProps) {
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);

  useEffect(() => {
    // Check if Stripe is loaded
    stripePromise.then((stripe) => {
      if (stripe) {
        setIsStripeLoaded(true);
      } else {
        onError?.("Stripe failed to load. Please refresh the page.");
      }
    });
  }, [onError]);

  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">
              Payment Setup Required
            </h4>
            <p className="text-sm text-yellow-800">
              Unable to initialize payment. Please try again or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isStripeLoaded) {
    return <PaymentElementSkeleton data-testid="stripe-loading" />;
  }

  // Stripe Elements configuration
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#f59e0b", // Amber-500
        colorBackground: "#ffffff",
        colorText: "#1f2937", // Gray-800
        colorDanger: "#ef4444", // Red-500
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
      rules: {
        ".Input": {
          border: "1px solid #d1d5db",
          boxShadow: "none",
        },
        ".Input:focus": {
          border: "1px solid #f59e0b",
          boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.1)",
        },
        ".Label": {
          fontWeight: "500",
          marginBottom: "8px",
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        returnUrl={returnUrl}
      />
    </Elements>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function PaymentElementSkeleton({
  "data-testid": testId,
}: {
  "data-testid"?: string;
}) {
  return (
    <div className="space-y-6" data-testid={testId || "stripe-skeleton"}>
      {/* Security badge skeleton */}
      <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />

      {/* Amount skeleton */}
      <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />

      {/* Payment form skeleton */}
      <div className="border border-gray-300 rounded-lg p-4 space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="h-14 bg-gray-200 rounded-lg animate-pulse" />

      {/* Cards skeleton */}
      <div className="flex items-center justify-center gap-3 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-12 h-8 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default StripePaymentElement;
