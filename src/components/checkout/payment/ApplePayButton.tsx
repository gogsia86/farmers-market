/**
 * 🍎 Apple Pay Button Component - Divine Agricultural Payment Integration
 *
 * Quantum consciousness for Apple Pay payments on iOS and macOS Safari
 * Part of Sprint 6 Phase 3 Day 3: Digital Wallets Integration
 *
 * Features:
 * - Automatic device detection (iOS/macOS Safari)
 * - Apple Pay availability checking
 * - Merchant session validation
 * - Payment sheet integration
 * - Agricultural consciousness throughout
 *
 * @version 3.0.0
 */

"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { paymentLogger } from "@/lib/utils/logger";
import { motion } from "framer-motion";
import { AppleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ==================== TYPE DEFINITIONS ====================

interface ApplePayButtonProps {
  orderId: string;
  amount: number;
  currency?: "usd" | "eur" | "gbp" | "cad";
  label?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

interface ApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  total: {
    label: string;
    amount: string;
  };
  supportedNetworks: string[];
  merchantCapabilities: string[];
}

// ==================== APPLE PAY BUTTON COMPONENT ====================

export function ApplePayButton({
  orderId,
  amount,
  currency = "usd",
  label = "Buy with",
  onSuccess,
  onError,
  disabled = false,
  className = "",
}: ApplePayButtonProps) {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // ==================== DEVICE DETECTION ====================

  useEffect(() => {
    async function checkApplePayAvailability() {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        // Check for Apple Pay API availability
        if (!("ApplePaySession" in window)) {
          paymentLogger.debug(
            "Apple Pay not available - ApplePaySession not found",
          );
          setIsApplePayAvailable(false);
          setIsLoading(false);
          return;
        }

        // Check if Apple Pay can make payments
        const canMakePayments = (
          window as any
        ).ApplePaySession.canMakePayments();
        if (!canMakePayments) {
          paymentLogger.debug("Apple Pay not available - Cannot make payments");
          setIsApplePayAvailable(false);
          setIsLoading(false);
          return;
        }

        // Check device capabilities via API
        const response = await fetch("/api/payment/wallet", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to check wallet capabilities");
        }

        const data = await response.json();

        if (data.success) {
          const hasApplePay =
            data.data.capabilities.applePay &&
            data.data.availableWallets.includes("APPLE_PAY");

          setIsApplePayAvailable(hasApplePay);
          paymentLogger.debug("Apple Pay availability check completed", {
            available: hasApplePay,
          });
        }
      } catch (error) {
        paymentLogger.error(
          "Apple Pay availability check failed",
          error instanceof Error ? error : new Error(String(error)),
        );
        setIsApplePayAvailable(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkApplePayAvailability();
  }, []);

  // ==================== PAYMENT PROCESSING ====================

  const handleApplePayClick = async () => {
    if (!("ApplePaySession" in window) || isProcessing || disabled) {
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create payment intent
      paymentLogger.info("Creating Apple Pay payment intent", {
        orderId,
        amount,
        currency,
      });

      const intentResponse = await fetch("/api/payment/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          walletType: "APPLE_PAY",
          amount,
          currency,
        }),
      });

      if (!intentResponse.ok) {
        throw new Error("Failed to create Apple Pay payment intent");
      }

      const intentData = await intentResponse.json();

      if (!intentData.success) {
        throw new Error(
          intentData.error?.message || "Failed to create payment intent",
        );
      }

      const { paymentIntent } = intentData.data;

      // Step 2: Create Apple Pay payment request
      const paymentRequest: ApplePayPaymentRequest = {
        countryCode: "US",
        currencyCode: currency.toUpperCase(),
        total: {
          label: label,
          amount: amount.toFixed(2),
        },
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: ["supports3DS"],
      };

      // Step 3: Create Apple Pay session
      const ApplePaySessionClass = (window as any).ApplePaySession;
      const session = new ApplePaySessionClass(3, paymentRequest);

      // Handle merchant validation
      session.onvalidatemerchant = async (event: any) => {
        try {
          paymentLogger.debug("Validating Apple Pay merchant", {
            validationURL: event.validationURL,
          });

          const validationResponse = await fetch(
            "/api/payment/wallet/apple-pay/validate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                validationUrl: event.validationURL,
              }),
            },
          );

          if (!validationResponse.ok) {
            throw new Error("Merchant validation failed");
          }

          const merchantSession = await validationResponse.json();

          if (merchantSession.success) {
            session.completeMerchantValidation(merchantSession.data);
          } else {
            session.abort();
            throw new Error(
              merchantSession.error?.message || "Merchant validation failed",
            );
          }
        } catch (error) {
          paymentLogger.error(
            "Apple Pay merchant validation error",
            error instanceof Error ? error : new Error(String(error)),
            { orderId },
          );
          session.abort();
          throw error;
        }
      };

      // Handle payment authorization
      session.onpaymentauthorized = async (event: any) => {
        try {
          paymentLogger.info("Processing Apple Pay payment authorization", {
            orderId,
          });

          // Process payment with Stripe
          const processResponse = await fetch(
            "/api/payment/wallet/apple-pay/process",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentIntentId: paymentIntent.id,
                payment: event.payment,
              }),
            },
          );

          if (!processResponse.ok) {
            throw new Error("Payment processing failed");
          }

          const processData = await processResponse.json();

          if (processData.success) {
            // Complete payment successfully
            session.completePayment(ApplePaySessionClass.STATUS_SUCCESS);

            toast({
              title: "🍎 Payment Successful!",
              description: "Your Apple Pay payment has been processed.",
              variant: "default",
            });

            // Call success callback
            if (onSuccess) {
              onSuccess(paymentIntent.id);
            }

            // Redirect to success page
            router.push(`/orders/${orderId}/confirmation`);
          } else {
            // Payment failed
            session.completePayment(ApplePaySessionClass.STATUS_FAILURE);
            throw new Error(
              processData.error?.message || "Payment processing failed",
            );
          }
        } catch (error) {
          paymentLogger.error(
            "Apple Pay payment authorization error",
            error instanceof Error ? error : new Error(String(error)),
            { orderId },
          );
          session.completePayment(ApplePaySessionClass.STATUS_FAILURE);
          throw error;
        }
      };

      // Handle cancellation
      session.oncancel = (event: any) => {
        paymentLogger.info("Apple Pay session cancelled by user", { orderId });
        setIsProcessing(false);
        toast({
          title: "Payment Cancelled",
          description: "You cancelled the Apple Pay payment.",
          variant: "default",
        });
      };

      // Begin Apple Pay session
      session.begin();
    } catch (error) {
      paymentLogger.error(
        "Apple Pay payment error",
        error instanceof Error ? error : new Error(String(error)),
        { orderId, amount, currency },
      );

      toast({
        title: "Payment Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process Apple Pay payment",
        variant: "destructive",
      });

      if (onError && error instanceof Error) {
        onError(error);
      }

      setIsProcessing(false);
    }
  };

  // ==================== RENDER ====================

  // Don't render if Apple Pay is not available
  if (isLoading) {
    return (
      <div className="w-full">
        <Button
          disabled
          className="w-full bg-black text-white hover:bg-gray-900"
        >
          <span className="flex items-center gap-2">
            <AppleIcon className="w-5 h-5" />
            Checking Apple Pay...
          </span>
        </Button>
      </div>
    );
  }

  if (!isApplePayAvailable) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${className}`}
    >
      <Button
        onClick={handleApplePayClick}
        disabled={disabled || isProcessing}
        className="w-full bg-black text-white hover:bg-gray-900 transition-all duration-200 h-12 text-base font-medium relative overflow-hidden group"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <>
            {/* Apple Pay branding */}
            <span className="flex items-center gap-2">
              <AppleIcon className="w-5 h-5" />
              <span>{label}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 165.52 105.97"
                className="h-5"
              >
                <path
                  fill="currentColor"
                  d="M150.7 0H14.82C6.64 0 0 6.64 0 14.82v76.33c0 8.18 6.64 14.82 14.82 14.82H150.7c8.18 0 14.82-6.64 14.82-14.82V14.82C165.52 6.64 158.88 0 150.7 0z"
                  fillOpacity="0"
                />
                <g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M43.51 37.24c-1.13 1.38-2.98 2.44-4.58 2.3-0.22-1.74 0.63-3.58 1.68-4.73 1.13-1.33 3.09-2.32 4.65-2.39 0.19 1.81-0.53 3.58-1.75 4.82zm1.73 2.74c-2.58-0.15-4.78 1.47-6.01 1.47-1.23 0-3.13-1.39-5.15-1.35-2.65 0.04-5.1 1.54-6.46 3.92-2.76 4.79-0.71 11.88 1.98 15.77 1.32 1.9 2.89 4.04 4.95 3.96 1.98-0.08 2.73-1.28 5.13-1.28s3.08 1.28 5.19 1.24c2.14-0.04 3.49-1.95 4.8-3.86 1.52-2.21 2.14-4.35 2.18-4.46-0.05-0.02-4.18-1.6-4.22-6.35-0.04-3.97 3.24-5.87 3.39-5.98-1.85-2.7-4.73-2.99-5.76-3.04z"
                    />
                    <path
                      fill="currentColor"
                      d="M69.27 32.58c5.42 0 9.19 3.72 9.19 9.09 0 5.41-3.88 9.13-9.36 9.13h-6.04v9.75h-4.65V32.58h10.86zm-6.21 14.53h5.01c3.76 0 5.91-2.01 5.91-5.45 0-3.43-2.15-5.41-5.91-5.41h-5.01v10.86z"
                    />
                    <path
                      fill="currentColor"
                      d="M79.42 55.15c0-3.39 2.57-5.49 7.14-5.77l5.45-0.32v-1.58c0-2.36-1.54-3.68-4.13-3.68-2.43 0-3.97 1.21-4.29 3.08h-4.33c0.21-3.89 3.57-6.85 8.74-6.85 5.01 0 8.54 2.64 8.54 6.77v14.75h-4.37v-3.47h-0.12c-1.13 2.26-3.68 3.8-6.49 3.8-4.18 0-6.93-2.52-6.93-6.28 0-0.14 0.04-0.29 0.04-0.43zm12.59-1.83v-1.62l-4.93 0.32c-2.48 0.16-3.92 1.29-3.92 3.16 0 1.91 1.54 3.08 3.84 3.08 3.12 0 5.01-2.03 5.01-4.94z"
                    />
                    <path
                      fill="currentColor"
                      d="M98.83 66.05c0.49 0 0.99-0.04 1.48-0.12v3.6c-0.73 0.16-1.83 0.28-2.73 0.28-3.76 0-5.49-1.79-5.49-5.61v-20.3h4.53v3.72h4.13v3.64h-4.13v12.35c0 1.75 0.73 2.44 2.21 2.44z"
                    />
                  </g>
                </g>
              </svg>
            </span>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </>
        )}
      </Button>

      {/* Agricultural blessing */}
      <div className="text-xs text-center mt-2 text-muted-foreground">
        🌾 Secure agricultural payment powered by Apple Pay
      </div>
    </motion.div>
  );
}

/**
 * Export type for external use
 */
export type { ApplePayButtonProps };
