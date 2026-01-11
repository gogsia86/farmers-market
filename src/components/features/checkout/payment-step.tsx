"use client";

// 💳 PAYMENT STEP - Divine Payment Processing
// Handles payment method selection with Stripe integration
// Follows divine payment patterns with agricultural consciousness

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { AlertCircle, CreditCard, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

import type { PaymentInfo } from "./checkout-wizard";

// ============================================================================
// STRIPE CONFIGURATION
// ============================================================================

// Lazy load Stripe with proper null check
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const stripeAppearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#16a34a", // green-600
    colorBackground: "#ffffff",
    colorText: "#111827",
    colorDanger: "#dc2626",
    fontFamily: "system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
  },
};

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const paymentSchema = z.object({
  method: z.enum(["card", "wallet"], {
    required_error: "Please select a payment method",
  }),
  saveCard: z.boolean().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface PaymentStepProps {
  formData: {
    shipping: any;
    delivery: any;
    payment: PaymentInfo | null;
  };
  cartTotal: number;
  userId: string;
  onComplete: (data: PaymentInfo) => void;
  onBack: () => void;
}

// ============================================================================
// PAYMENT STEP WRAPPER - Manages Payment Intent
// ============================================================================

export function PaymentStep({
  formData,
  cartTotal,
  userId,
  onComplete,
  onBack,
}: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // CHECK STRIPE CONFIGURATION
  // ==========================================================================
  useEffect(() => {
    if (!stripePromise) {
      setLoading(false);
      setError(
        "Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.",
      );
      return;
    }
  }, []);

  // ==========================================================================
  // CREATE PAYMENT INTENT ON MOUNT
  // ==========================================================================
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if Stripe is configured
        if (!stripePromise) {
          throw new Error(
            "Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.",
          );
        }

        const response = await fetch("/api/checkout/payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: cartTotal,
            currency: "usd",
            metadata: {
              userId,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error?.message || "Failed to create payment intent",
          );
        }

        setClientSecret(result.data.clientSecret);
        setPaymentIntentId(result.data.paymentIntentId);
      } catch (err) {
        logger.error("Payment intent creation error:", {
          error: err instanceof Error ? err.message : String(err),
        });
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize payment. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (cartTotal > 0) {
      createPaymentIntent();
    }
  }, [cartTotal, userId]);

  // ==========================================================================
  // RENDER - Loading/Error States
  // ==========================================================================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
          <p className="mt-4 text-sm text-gray-600">
            Initializing secure payment...
          </p>
        </div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">
                Payment Initialization Failed
              </h3>
              <p className="mt-1 text-xs text-red-800">
                {error || "Unable to initialize payment. Please try again."}
              </p>
              {error?.includes("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") && (
                <div className="mt-3 rounded bg-yellow-50 border border-yellow-200 p-3">
                  <p className="text-xs text-yellow-900 font-medium">
                    🔧 Developer Note:
                  </p>
                  <p className="mt-1 text-xs text-yellow-800">
                    Add{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                    </code>{" "}
                    to your{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      .env.local
                    </code>{" "}
                    file.
                  </p>
                  <p className="mt-1 text-xs text-yellow-800">
                    Get your key from:{" "}
                    <a
                      href="https://dashboard.stripe.com/test/apikeys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Stripe Dashboard
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Back to Delivery
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER - Stripe Elements
  // ==========================================================================
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: stripeAppearance,
      }}
    >
      <PaymentStepForm
        formData={formData}
        paymentIntentId={paymentIntentId}
        onComplete={onComplete}
        onBack={onBack}
      />
    </Elements>
  );
}

// ============================================================================
// PAYMENT STEP FORM - Handles Payment Element
// ============================================================================

interface PaymentStepFormProps {
  formData: {
    shipping: any;
    delivery: any;
    payment: PaymentInfo | null;
  };
  paymentIntentId: string | null;
  onComplete: (data: PaymentInfo) => void;
  onBack: () => void;
}

function PaymentStepForm({
  formData,
  paymentIntentId,
  onComplete,
  onBack,
}: PaymentStepFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(false);
  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Validate payment element
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      // Complete the payment step
      // Note: We're not confirming the payment here - that will happen after order creation
      onComplete({
        method: "card",
        saveCard,
        paymentIntentId: paymentIntentId || undefined,
      });
    } catch (err) {
      logger.error("Payment validation error:", {
        error: err instanceof Error ? err.message : String(err),
      });
      setPaymentError(
        err instanceof Error
          ? err.message
          : "Payment validation failed. Please check your information.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <CreditCard className="h-6 w-6 text-green-600" />
          Payment Method
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Enter your payment details securely
        </p>
      </div>

      {/* Security Badge */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex gap-3">
          <Lock className="h-5 w-5 flex-shrink-0 text-green-600" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900">
              Secure Payment Processing
            </h3>
            <p className="mt-1 text-xs text-green-800">
              Your payment information is encrypted and processed securely
              through Stripe. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Payment Details *</Label>

        <div className="rounded-lg border border-gray-200 p-4">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card", "apple_pay", "google_pay"],
            }}
          />
        </div>

        {/* Save Card Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="saveCard"
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <Label
            htmlFor="saveCard"
            className="cursor-pointer text-sm font-normal"
          >
            Save this payment method for future purchases
          </Label>
        </div>
      </div>

      {/* Billing Address Note */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Billing Address</h3>
        <p className="mt-1 text-xs text-gray-600">
          Your billing address will be the same as your shipping address.
        </p>
      </div>

      {/* Accepted Payment Methods */}
      <div className="flex items-center justify-center gap-4 opacity-60">
        <div className="rounded border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
          VISA
        </div>
        <div className="rounded border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
          MASTERCARD
        </div>
        <div className="rounded border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
          AMEX
        </div>
        <div className="rounded border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
          DISCOVER
        </div>
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">
                Payment Error
              </h3>
              <p className="mt-1 text-xs text-red-800">{paymentError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing || !stripe}
        >
          Back to Delivery
        </Button>
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? "Validating..." : "Continue to Review"}
        </Button>
      </div>
    </form>
  );
}
