/**
 * 🌾 PAYPAL EXPRESS CHECKOUT BUTTON COMPONENT
 * Divine PayPal Integration with Agricultural Consciousness
 *
 * Features:
 * - PayPal SDK integration
 * - Express Checkout flow
 * - Order creation and approval
 * - Error handling and loading states
 * - Responsive design
 * - Agricultural consciousness in UI
 *
 * @divine-pattern React Client Component
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @reference 08_UX_DESIGN_CONSCIOUSNESS.instructions.md
 */

"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { paymentLogger } from "@/lib/utils/logger";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PayPalButtonProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess?: (data: PayPalCaptureData) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
}

interface PayPalCaptureData {
  orderId: string;
  orderNumber: string;
  paypalOrderId: string;
  captureId: string;
  transactionId: string;
  amount: number;
  currency: string;
}

interface PayPalSDK {
  Buttons: (config: PayPalButtonConfig) => {
    render: (selector: string) => Promise<void>;
  };
}

interface PayPalButtonConfig {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (error: any) => void;
  onCancel: () => void;
  style?: {
    layout?: "vertical" | "horizontal";
    color?: "gold" | "blue" | "silver" | "white" | "black";
    shape?: "rect" | "pill";
    label?: "paypal" | "checkout" | "buynow" | "pay";
    height?: number;
  };
}

declare global {
  interface Window {
    paypal?: PayPalSDK;
  }
}

// ============================================================================
// PAYPAL BUTTON COMPONENT
// ============================================================================

export function PayPalButton({
  orderId,
  amount,
  currency = "USD",
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = "",
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // ==========================================================================
  // LOAD PAYPAL SDK
  // ==========================================================================

  useEffect(() => {
    // Check if SDK already loaded
    if (window.paypal) {
      setSdkLoaded(true);
      setIsLoading(false);
      return;
    }

    // Load PayPal SDK
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!clientId) {
      setError("PayPal is not configured");
      setIsLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.async = true;

    script.onload = () => {
      setSdkLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      setError("Failed to load PayPal SDK");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [currency]);

  // ==========================================================================
  // RENDER PAYPAL BUTTONS
  // ==========================================================================

  useEffect(() => {
    if (!sdkLoaded || !window.paypal || disabled) {
      return;
    }

    // Clear any existing buttons
    const container = document.getElementById("paypal-button-container");
    if (container) {
      container.innerHTML = "";
    }

    // Render PayPal buttons
    try {
      window.paypal
        .Buttons({
          createOrder: handleCreateOrder,
          onApprove: handleApprove,
          onError: handleError,
          onCancel: handleCancel,
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 45,
          },
        })
        .render("#paypal-button-container");
    } catch (error) {
      paymentLogger.error("Error rendering PayPal buttons", error instanceof Error ? error : new Error(String(error)), { orderId });
      setError("Failed to render PayPal buttons");
    }
  }, [sdkLoaded, disabled, orderId]);

  // ==========================================================================
  // PAYPAL FLOW HANDLERS
  // ==========================================================================

  /**
   * Create PayPal order
   */
  const handleCreateOrder = async (): Promise<string> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch("/api/payments/paypal/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to create PayPal order");
      }

      // Return PayPal order ID for SDK
      return result.data.paypalOrderId;
    } catch (error) {
      paymentLogger.error("Error creating PayPal order", error instanceof Error ? error : new Error(String(error)), { orderId });
      setError(error instanceof Error ? error.message : "Failed to create order");
      setIsProcessing(false);
      throw error;
    }
  };

  /**
   * Handle PayPal order approval
   */
  const handleApprove = async (data: { orderID: string }): Promise<void> => {
    try {
      setIsProcessing(true);
      setError(null);

      // Capture the payment
      const response = await fetch("/api/payments/paypal/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          orderId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to capture payment");
      }

      // Show success message
      toast({
        title: "🌾 Payment Successful!",
        description: `Your order has been confirmed. Thank you for supporting local farms!`,
        variant: "default",
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (error) {
      paymentLogger.error("Error capturing PayPal payment", error instanceof Error ? error : new Error(String(error)), { orderId, paypalOrderId: data.orderID });
      const errorMessage =
        error instanceof Error ? error.message : "Payment capture failed";

      setError(errorMessage);
      setIsProcessing(false);

      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  };

  /**
   * Handle PayPal error
   */
  const handleError = (error: any): void => {
    paymentLogger.error("PayPal error", error instanceof Error ? error : new Error(String(error)), { orderId });
    const errorMessage = "An error occurred with PayPal. Please try again.";

    setError(errorMessage);
    setIsProcessing(false);

    toast({
      title: "Payment Error",
      description: errorMessage,
      variant: "destructive",
    });

    if (onError) {
      onError(new Error(errorMessage));
    }
  };

  /**
   * Handle PayPal cancellation
   */
  const handleCancel = (): void => {
    paymentLogger.info("PayPal payment cancelled by user", { orderId });
    setIsProcessing(false);

    toast({
      title: "Payment Cancelled",
      description: "You cancelled the PayPal payment.",
      variant: "default",
    });

    if (onCancel) {
      onCancel();
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 ${className}`}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0070ba]" />
          <p className="text-sm text-gray-600">Loading PayPal...</p>
        </div>
      </div>
    );
  }

  if (error && !sdkLoaded) {
    return (
      <div
        className={`rounded-lg border-2 border-red-200 bg-red-50 p-6 ${className}`}
      >
        <div className="flex flex-col gap-2">
          <p className="font-medium text-red-900">PayPal Unavailable</p>
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2 w-full"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* PayPal Button Container */}
      <div
        id="paypal-button-container"
        className={isProcessing || disabled ? "pointer-events-none opacity-50" : ""}
      />

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#0070ba]" />
            <p className="text-sm font-medium text-gray-900">
              Processing payment...
            </p>
            <p className="text-xs text-gray-600">🌾 Securing your harvest</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && sdkLoaded && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Agricultural Blessing */}
      {!isProcessing && !error && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            🌾 Secure checkout powered by PayPal
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * PayPal button skeleton loader
 */
export function PayPalButtonSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-[45px] w-full rounded-lg bg-gray-200" />
      <div className="mt-2 h-3 w-2/3 mx-auto rounded bg-gray-200" />
    </div>
  );
}
