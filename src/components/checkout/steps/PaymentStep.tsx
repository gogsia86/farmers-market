"use client";

/**
 * 💳 PAYMENT STEP - Checkout Flow Step 3
 * Payment method selection and Stripe integration
 *
 * Features:
 * - Stripe Elements integration
 * - Real payment intent creation
 * - Payment method validation
 * - Secure payment processing
 * - 3D Secure (SCA) support
 * - Agricultural consciousness UI
 */

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { StripePaymentElement } from "@/components/checkout/StripePaymentElement";

// ============================================================================
// TYPES
// ============================================================================

interface PaymentIntentResponse {
  success: boolean;
  paymentIntent?: {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
  };
  error?: string;
}

// ============================================================================
// PAYMENT STEP COMPONENT
// ============================================================================

export function PaymentStep() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [_paymentIntentId, _setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod);
  const orderPreview = useCheckoutStore((state) => state.orderPreview);

  // Create payment intent on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get order preview for amount
        if (!orderPreview || !orderPreview.total) {
          setError("Order total is required to process payment");
          return;
        }

        // Call backend to create payment intent
        const response = await fetch("/api/checkout/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: orderPreview.total,
            metadata: {
              farmCount: orderPreview.farmCount || 1,
              itemCount: orderPreview.itemCount || 0,
            },
          }),
        });

        const data: PaymentIntentResponse = await response.json();

        if (!data.success || !data.paymentIntent) {
          setError(data.error || "Failed to initialize payment");
          return;
        }

        setClientSecret(data.paymentIntent.clientSecret);
        _setPaymentIntentId(data.paymentIntent.id);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError("Unable to initialize payment. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [orderPreview]);

  // Handle successful payment
  const handlePaymentSuccess = (intentId: string) => {
    setPaymentSuccess(true);
    _setPaymentIntentId(intentId);

    // Update checkout store with payment info
    setPaymentMethod({
      id: intentId,
      type: "CARD",
      last4: "****", // Will be filled in from Stripe webhook
      brand: "card",
      expiryMonth: 0,
      expiryYear: 0,
      isDefault: false,
    });
  };

  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setPaymentSuccess(false);
  };

  // Loading state
  if (isLoading) {
    return <PaymentSkeleton />;
  }

  // Error state
  if (error && !clientSecret) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Payment Error</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Success state
  if (paymentSuccess) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">
                Payment Successful! 🎉
              </h4>
              <p className="text-sm text-green-800">
                Your payment has been processed successfully. You can now
                complete your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Stripe payment element
  return (
    <div className="space-y-6">
      {clientSecret && orderPreview && (
        <StripePaymentElement
          clientSecret={clientSecret}
          amount={Math.round(orderPreview.total * 100)} // Convert to cents
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          returnUrl={`${window.location.origin}/checkout/confirmation`}
        />
      )}
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function PaymentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Initializing secure payment...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we set up your payment
          </p>
        </div>
      </div>
      <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
      <div className="border border-gray-300 rounded-lg p-4 space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-14 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  );
}
