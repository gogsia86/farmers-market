/**
 * 📱 Google Pay Button Component - Divine Agricultural Payment Integration
 *
 * Quantum consciousness for Google Pay payments on Chrome and Android
 * Part of Sprint 6 Phase 3 Day 3: Digital Wallets Integration
 *
 * Features:
 * - Automatic device detection (Chrome/Android)
 * - Google Pay availability checking
 * - Payment Data API integration
 * - Tokenization with Stripe
 * - Agricultural consciousness throughout
 *
 * @version 3.0.0
 */

"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { paymentLogger } from "@/lib/utils/logger";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ==================== TYPE DEFINITIONS ====================

interface GooglePayButtonProps {
  orderId: string;
  amount: number;
  currency?: "usd" | "eur" | "gbp" | "cad";
  label?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

interface GooglePayPaymentDataRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: any[];
  merchantInfo: {
    merchantId: string;
    merchantName: string;
  };
  transactionInfo: {
    totalPriceStatus: string;
    totalPrice: string;
    currencyCode: string;
    countryCode: string;
  };
}

interface GooglePayClient {
  isReadyToPay(request: any): Promise<any>;
  loadPaymentData(request: GooglePayPaymentDataRequest): Promise<any>;
  createButton(options: any): HTMLElement;
}

// Type declaration removed to avoid conflicts - using type casting instead

// ==================== GOOGLE PAY BUTTON COMPONENT ====================

export function GooglePayButton({
  orderId,
  amount,
  currency = "usd",
  label = "Buy with Google Pay",
  onSuccess,
  onError,
  disabled = false,
  className = "",
}: GooglePayButtonProps) {
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [googlePayClient, setGooglePayClient] = useState<GooglePayClient | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // ==================== GOOGLE PAY CONFIGURATION ====================

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
  };

  const allowedCardNetworks = ["AMEX", "DISCOVER", "MASTERCARD", "VISA"];
  const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

  const tokenizationSpecification = {
    type: "PAYMENT_GATEWAY",
    parameters: {
      gateway: "stripe",
      "stripe:version": "2024-11-20.acacia",
      "stripe:publishableKey": process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    },
  };

  const baseCardPaymentMethod = {
    type: "CARD",
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks,
    },
  };

  const cardPaymentMethod = {
    ...baseCardPaymentMethod,
    tokenizationSpecification: tokenizationSpecification,
  };

  // ==================== LOAD GOOGLE PAY SCRIPT ====================

  useEffect(() => {
    const loadGooglePayScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).google?.payments?.api) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://pay.google.com/gp/p/js/pay.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Pay script"));
        document.body.appendChild(script);
      });
    };

    loadGooglePayScript()
      .then(() => {
        paymentLogger.debug("Google Pay script loaded successfully");
      })
      .catch((error) => {
        paymentLogger.error("Failed to load Google Pay script", error instanceof Error ? error : new Error(String(error)));
      });
  }, []);

  // ==================== DEVICE DETECTION ====================

  useEffect(() => {
    async function checkGooglePayAvailability() {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        // Wait for Google Pay API to be available
        let attempts = 0;
        while (!(window as any).google?.payments?.api && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (!(window as any).google?.payments?.api) {
          paymentLogger.debug("Google Pay not available - API not loaded");
          setIsGooglePayAvailable(false);
          setIsLoading(false);
          return;
        }

        // Create Google Pay client
        const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
          environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
        });

        setGooglePayClient(paymentsClient);

        // Check if Google Pay is ready
        const isReadyToPayRequest = {
          ...baseRequest,
          allowedPaymentMethods: [baseCardPaymentMethod],
        };

        const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);

        if (response.result) {
          // Double-check with backend API
          const apiResponse = await fetch("/api/payment/wallet", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!apiResponse.ok) {
            throw new Error("Failed to check wallet capabilities");
          }

          const data = await apiResponse.json();

          if (data.success) {
            const hasGooglePay =
              data.data.capabilities.googlePay &&
              data.data.availableWallets.includes("GOOGLE_PAY");

            setIsGooglePayAvailable(hasGooglePay);
            paymentLogger.debug("Google Pay availability check completed", { available: hasGooglePay });
          }
        } else {
          setIsGooglePayAvailable(false);
        }
      } catch (error) {
        paymentLogger.error("Google Pay availability check failed", error instanceof Error ? error : new Error(String(error)));
        setIsGooglePayAvailable(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkGooglePayAvailability();
  }, []);

  // ==================== PAYMENT PROCESSING ====================

  const handleGooglePayClick = async () => {
    if (!googlePayClient || isProcessing || disabled) {
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create payment intent
      paymentLogger.info("Creating Google Pay payment intent", { orderId, amount, currency });

      const intentResponse = await fetch("/api/payment/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          walletType: "GOOGLE_PAY",
          amount,
          currency,
        }),
      });

      if (!intentResponse.ok) {
        throw new Error("Failed to create Google Pay payment intent");
      }

      const intentData = await intentResponse.json();

      if (!intentData.success) {
        throw new Error(
          intentData.error?.message || "Failed to create payment intent"
        );
      }

      const { paymentIntent } = intentData.data;

      // Step 2: Create payment data request
      const paymentDataRequest: GooglePayPaymentDataRequest = {
        ...baseRequest,
        allowedPaymentMethods: [cardPaymentMethod],
        merchantInfo: {
          merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || "",
          merchantName: "Farmers Market Platform",
        },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount.toFixed(2),
          currencyCode: currency.toUpperCase(),
          countryCode: "US",
        },
      };

      // Step 3: Load payment data (opens Google Pay sheet)
      paymentLogger.debug("Loading Google Pay payment sheet", { orderId });
      const paymentData = await googlePayClient.loadPaymentData(
        paymentDataRequest
      );

      // Step 4: Process payment with backend
      paymentLogger.info("Processing Google Pay payment", { orderId });

      const processResponse = await fetch(
        "/api/payment/wallet/google-pay/process",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            paymentData: paymentData,
          }),
        }
      );

      if (!processResponse.ok) {
        throw new Error("Payment processing failed");
      }

      const processData = await processResponse.json();

      if (processData.success) {
        toast({
          title: "📱 Payment Successful!",
          description: "Your Google Pay payment has been processed.",
          variant: "default",
        });

        // Call success callback
        if (onSuccess) {
          onSuccess(paymentIntent.id);
        }

        // Redirect to success page
        router.push(`/orders/${orderId}/confirmation`);
      } else {
        throw new Error(
          processData.error?.message || "Payment processing failed"
        );
      }
    } catch (error) {
      paymentLogger.error("Google Pay payment error", error instanceof Error ? error : new Error(String(error)), { orderId, amount, currency });

      // Check if user cancelled
      if (
        error instanceof Error &&
        (error.message.includes("CANCELED") || error.message.includes("cancelled"))
      ) {
        toast({
          title: "Payment Cancelled",
          description: "You cancelled the Google Pay payment.",
          variant: "default",
        });
      } else {
        toast({
          title: "Payment Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to process Google Pay payment",
          variant: "destructive",
        });

        if (onError && error instanceof Error) {
          onError(error);
        }
      }

      setIsProcessing(false);
    }
  };

  // ==================== RENDER ====================

  // Don't render if Google Pay is not available
  if (isLoading) {
    return (
      <div className="w-full">
        <Button
          disabled
          className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Checking Google Pay...
          </span>
        </Button>
      </div>
    );
  }

  if (!isGooglePayAvailable) {
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
        onClick={handleGooglePayClick}
        disabled={disabled || isProcessing}
        className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 h-12 text-base font-medium relative overflow-hidden group"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <>
            {/* Google Pay branding */}
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 41 17"
                className="h-5"
              >
                <g fill="none" fillRule="evenodd">
                  <path
                    fill="#5F6368"
                    d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.437 0-.544-.202-1.018-.605-1.421-.392-.413-.888-.62-1.488-.62h-2.518zm0 5.52v4.736h-1.504V1.198h3.99c1.013 0 1.873.337 2.582 1.01.72.675 1.08 1.497 1.08 2.466 0 .991-.36 1.819-1.08 2.482-.697.665-1.559.998-2.583.998h-2.485v.001zm7.668 2.287c0 .392.166.718.499.98.332.26.722.391 1.168.391.633 0 1.196-.234 1.692-.701.497-.469.744-1.019.744-1.65-.469-.37-1.123-.555-1.962-.555-.61 0-1.103.123-1.478.37-.374.245-.663.609-.663 1.165zm1.389-2.173c.99 0 1.639.172 1.948.514.308.344.463.737.463 1.185v3.715c0 .139.031.264.095.375a.616.616 0 0 0 .231.245v.254h-1.504a1.223 1.223 0 0 1-.098-.364 3.12 3.12 0 0 1-.036-.254c-.354.354-.739.605-1.157.752a3.415 3.415 0 0 1-1.285.231c-.708 0-1.31-.242-1.806-.726-.496-.484-.744-1.066-.744-1.746 0-.778.265-1.39.795-1.838.53-.447 1.253-.67 2.168-.67.831 0 1.487.12 1.967.363v-.282c0-.435-.149-.797-.447-1.086-.298-.291-.68-.437-1.145-.437-.716 0-1.221.303-1.515.908l-1.366-.58c.473-1.002 1.404-1.502 2.794-1.502l.002.003zm6.854 2.964c.062.459.265.833.61 1.126.344.293.76.439 1.246.439.418 0 .778-.11 1.08-.329.304-.219.528-.499.672-.84l1.35.547c-.445 1.223-1.46 1.834-3.047 1.834-.928 0-1.705-.293-2.331-.879-.627-.586-.94-1.33-.94-2.233 0-.893.306-1.632.918-2.218.612-.586 1.384-.879 2.317-.879.917 0 1.675.293 2.274.879.599.586.898 1.328.898 2.225 0 .113-.006.229-.017.348h-4.03v-.02zm2.85-1.683a1.295 1.295 0 0 0-.553-.983c-.314-.235-.7-.352-1.155-.352-.44 0-.815.117-1.125.352-.31.235-.5.551-.569.949h3.402z"
                  />
                  <path
                    fill="#4285F4"
                    d="M13.473 7.196c0-.427-.037-.838-.106-1.235h-5.95v2.334h3.402a2.907 2.907 0 0 1-1.262 1.908v1.515h2.044c1.196-1.1 1.872-2.72 1.872-4.522z"
                  />
                  <path
                    fill="#34A853"
                    d="M7.417 13.096c1.707 0 3.138-.566 4.184-1.533l-2.044-1.515c-.566.38-1.29.604-2.14.604-1.647 0-3.042-1.112-3.54-2.606H1.765v1.564c1.04 2.066 3.172 3.486 5.652 3.486z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M3.877 8.046A3.835 3.835 0 0 1 3.877 5.58V4.015H1.765a6.732 6.732 0 0 0 0 6.03l2.112-1.564v-.435z"
                  />
                  <path
                    fill="#EA4335"
                    d="M7.417 3.34c.929 0 1.763.319 2.419.946l1.813-1.813C10.552 1.556 9.123.96 7.417.96c-2.48 0-4.612 1.42-5.652 3.486l2.112 1.564c.498-1.494 1.893-2.606 3.54-2.606v-.064z"
                  />
                </g>
              </svg>
              <span className="font-medium">{label}</span>
            </span>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </>
        )}
      </Button>

      {/* Agricultural blessing */}
      <div className="text-xs text-center mt-2 text-muted-foreground">
        🌾 Secure agricultural payment powered by Google Pay
      </div>
    </motion.div>
  );
}

/**
 * Export type for external use
 */
export type { GooglePayButtonProps };
