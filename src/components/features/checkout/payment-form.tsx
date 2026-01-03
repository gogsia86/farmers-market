"use client";

// 💳 PAYMENT FORM - Stripe Elements Integration Component
// Secure payment collection with agricultural consciousness

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CreditCard, Lock } from "lucide-react";
import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface PaymentFormProps {
  onReady: () => Promise<void>;
  onProceed: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

// ============================================================================
// PAYMENT FORM COMPONENT
// ============================================================================

export function PaymentForm({
  onReady,
  onProceed,
  onBack,
  isProcessing = false,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isElementsReady, setIsElementsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethodReady, setPaymentMethodReady] = useState(false);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleElementsReady = () => {
    setIsElementsReady(true);
  };

  const handleElementsChange = (event: any) => {
    if (event.complete) {
      setPaymentMethodReady(true);
      setError(null);
    } else {
      setPaymentMethodReady(false);
    }

    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handleInitializePayment = async () => {
    if (!stripe || !elements || !isElementsReady) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Call parent to create payment intent
      await onReady();

      // If successful, payment intent is created and we can proceed to review
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize payment");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleProceed = () => {
    onProceed();
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
            <p className="text-sm text-gray-600">
              Enter your payment information securely
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-6">
          {/* Security Notice */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
            <Lock className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Secure Payment Processing
              </h3>
              <p className="mt-1 text-sm text-blue-800">
                Your payment information is encrypted and securely processed by Stripe.
                We never store your card details on our servers.
              </p>
            </div>
          </div>

          {/* Stripe Payment Element */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-900">
              Card Information <span className="text-red-500">*</span>
            </label>

            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <PaymentElement
                onReady={handleElementsReady}
                onChange={handleElementsChange}
                options={{
                  layout: "tabs",
                  defaultValues: {
                    billingDetails: {
                      // Can pre-fill with user data if available
                    },
                  },
                }}
              />
            </div>

            {!isElementsReady && (
              <div className="mt-3 flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                <span className="ml-2 text-sm text-gray-600">
                  Loading payment form...
                </span>
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Accepted Payment Methods */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">Accepted Payment Methods</p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5">
                <svg className="h-6 w-10" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="#1434CB" />
                  <path
                    d="M23.5 20.5L18.5 11.5H21L24.5 18L28 11.5H30.5L25.5 20.5H23.5Z"
                    fill="white"
                  />
                </svg>
                <span className="text-xs text-gray-600">Visa</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5">
                <svg className="h-6 w-10" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="#EB001B" />
                  <circle cx="18" cy="16" r="8" fill="#FF5F00" />
                  <circle cx="30" cy="16" r="8" fill="#F79E1B" />
                </svg>
                <span className="text-xs text-gray-600">Mastercard</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5">
                <svg className="h-6 w-10" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="#016FD0" />
                  <path
                    d="M15 11.5L13 20.5H15.5L17.5 11.5H15ZM24.5 11.5L22 20.5H24.5L27 11.5H24.5ZM32 11.5L29.5 20.5H32L34.5 11.5H32Z"
                    fill="white"
                  />
                </svg>
                <span className="text-xs text-gray-600">Amex</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5">
                <svg className="h-6 w-10" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="#00457C" />
                  <circle cx="16" cy="16" r="4" fill="#FF6000" />
                  <circle cx="32" cy="16" r="4" fill="#FFC800" />
                </svg>
                <span className="text-xs text-gray-600">Discover</span>
              </div>
            </div>
          </div>

          {/* Terms Notice */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-gray-600">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-green-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </a>
              . Your payment will be processed when you confirm your order on the next
              step.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              disabled={isProcessing || isInitializing}
            >
              Back to Delivery
            </Button>

            <Button
              type="button"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleInitializePayment}
              disabled={
                !stripe ||
                !elements ||
                !isElementsReady ||
                isProcessing ||
                isInitializing
              }
            >
              {isInitializing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Initializing...
                </>
              ) : (
                "Review Order"
              )}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
