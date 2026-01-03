/**
 * 🛒 CHECKOUT WIZARD COMPONENT
 * Divine multi-step checkout flow for agricultural commerce
 *
 * Features:
 * - 4-step checkout process (Review → Delivery → Payment → Confirm)
 * - Progress indicator with step navigation
 * - State persistence via Zustand store
 * - Validation before step advancement
 * - Back/Next navigation with keyboard support
 * - Mobile-responsive design
 * - WCAG 2.1 AA accessibility
 * - Agricultural consciousness patterns
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

"use client";

import { cn } from "@/lib/utils";
import { orderLogger } from "@/lib/utils/logger";
import { useCartStore } from "@/stores/cartStore";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Step components (to be imported)
import { ConfirmOrderStep } from "./steps/ConfirmOrderStep";
import { DeliveryDetailsStep } from "./steps/DeliveryDetailsStep";
import { PaymentMethodStep } from "./steps/PaymentMethodStep";
import { ReviewCartStep } from "./steps/ReviewCartStep";

// ============================================================================
// TYPES
// ============================================================================

export interface CheckoutStep {
  id: number;
  name: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<CheckoutStepProps>;
  isComplete: boolean;
  isValid: boolean;
}

export interface CheckoutStepProps {
  onNext: () => void;
  onBack: () => void;
  onUpdateData: (data: Partial<CheckoutData>) => void;
  checkoutData: CheckoutData;
  isLoading?: boolean;
}

export interface CheckoutData {
  // Cart data
  cartId: string;
  cartSummary: {
    items: any[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    itemCount: number;
  };

  // Delivery data
  selectedAddress: any | null;
  fulfillmentMethod: "PICKUP" | "DELIVERY" | "SHIPPING";
  deliveryInstructions: string;
  pickupTime?: Date;

  // Payment data
  paymentMethod: "CARD" | "CASH" | null;
  savePaymentMethod: boolean;

  // Order data
  termsAccepted: boolean;
  marketingOptIn: boolean;
  orderNotes: string;
}

interface CheckoutWizardProps {
  userId: string;
  cartId: string;
  onComplete?: (orderId: string) => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// CHECKOUT WIZARD COMPONENT
// ============================================================================

export function CheckoutWizard({
  userId,
  cartId,
  onComplete,
  onCancel,
  className,
}: CheckoutWizardProps) {
  const router = useRouter();
  const cartStore = useCartStore();

  // Current step (0-3)
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checkout data state
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    cartId,
    cartSummary: {
      items: cartStore.items,
      subtotal: cartStore.getSubtotal(),
      tax: cartStore.getTax(),
      deliveryFee: cartStore.getDeliveryFee(),
      total: cartStore.getTotal(),
      itemCount: cartStore.getTotalItems(),
    },
    selectedAddress: null,
    fulfillmentMethod: "PICKUP",
    deliveryInstructions: "",
    paymentMethod: null,
    savePaymentMethod: false,
    termsAccepted: false,
    marketingOptIn: false,
    orderNotes: "",
  });

  // Define checkout steps
  const steps: CheckoutStep[] = [
    {
      id: 0,
      name: "review",
      label: "Review Cart",
      description: "Review your items",
      icon: ShoppingCart,
      component: ReviewCartStep,
      isComplete: currentStep > 0,
      isValid: checkoutData.cartSummary.itemCount > 0,
    },
    {
      id: 1,
      name: "delivery",
      label: "Delivery",
      description: "Delivery details",
      icon: MapPin,
      component: DeliveryDetailsStep,
      isComplete: currentStep > 1,
      isValid:
        checkoutData.fulfillmentMethod === "PICKUP" ||
        !!checkoutData.selectedAddress,
    },
    {
      id: 2,
      name: "payment",
      label: "Payment",
      description: "Payment method",
      icon: CreditCard,
      component: PaymentMethodStep,
      isComplete: currentStep > 2,
      isValid: !!checkoutData.paymentMethod,
    },
    {
      id: 3,
      name: "confirm",
      label: "Confirm",
      description: "Review & confirm",
      icon: CheckCircle,
      component: ConfirmOrderStep,
      isComplete: false,
      isValid: checkoutData.termsAccepted,
    },
  ];

  // Update checkout data
  const handleUpdateData = useCallback((data: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...data }));
    setError(null);
  }, []);

  // Navigate to next step
  const handleNext = useCallback(() => {
    const currentStepData = steps[currentStep];

    if (!currentStepData || !currentStepData.isValid) {
      setError("Please complete all required fields before continuing.");
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, steps]);

  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // Go to specific step
  const handleGoToStep = useCallback(
    (stepIndex: number) => {
      const previousStep = steps[stepIndex - 1];
      if (
        stepIndex <= currentStep ||
        (previousStep && previousStep.isComplete)
      ) {
        setCurrentStep(stepIndex);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep, steps],
  );

  // Handle order placement
  const handlePlaceOrder = useCallback(async () => {
    if (!checkoutData.termsAccepted) {
      setError("You must accept the terms and conditions to place an order.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          cartId: checkoutData.cartId,
          addressId: checkoutData.selectedAddress?.id,
          fulfillmentMethod: checkoutData.fulfillmentMethod,
          paymentMethod: checkoutData.paymentMethod,
          deliveryInstructions: checkoutData.deliveryInstructions,
          orderNotes: checkoutData.orderNotes,
          marketingOptIn: checkoutData.marketingOptIn,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to create order");
      }

      // Clear cart after successful order
      cartStore.clearCart();

      // Call completion callback
      if (onComplete) {
        onComplete(result.data.orderId);
      } else {
        // Navigate to order confirmation
        router.push(`/orders/${result.data.orderId}/confirmation`);
      }
    } catch (err) {
      orderLogger.error(
        "Order creation error",
        err instanceof Error ? err : new Error(String(err)),
        {
          userId,
          fulfillmentMethod: checkoutData.fulfillmentMethod,
          paymentMethod: checkoutData.paymentMethod,
        },
      );
      setError(
        err instanceof Error
          ? err.message
          : "Failed to place order. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId, checkoutData, cartStore, onComplete, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Current step component
  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className={cn("min-h-screen bg-gray-50 py-8", className)}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">
            Complete your order in {steps.length} simple steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isComplete = step.isComplete;
              const isAccessible = index <= currentStep || isComplete;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex-1 relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-5 left-1/2 w-full h-0.5 -z-10",
                        isComplete ? "bg-green-600" : "bg-gray-300",
                      )}
                      aria-hidden="true"
                    />
                  )}

                  {/* Step Button */}
                  <button
                    onClick={() => isAccessible && handleGoToStep(index)}
                    disabled={!isAccessible}
                    className={cn(
                      "relative flex flex-col items-center gap-2 w-full group",
                      isAccessible &&
                        "cursor-pointer hover:opacity-80 transition-opacity",
                    )}
                    aria-label={`${step.label}: ${step.description}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {/* Step Circle */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                        isActive &&
                          "bg-green-600 border-green-600 text-white scale-110",
                        isComplete &&
                          "bg-green-600 border-green-600 text-white",
                        !isActive &&
                          !isComplete &&
                          "bg-white border-gray-300 text-gray-500",
                      )}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>

                    {/* Step Label */}
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isActive && "text-green-600",
                          isComplete && "text-green-600",
                          !isActive && !isComplete && "text-gray-500",
                        )}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  There was an error with your checkout
                </h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {CurrentStepComponent && (
            <CurrentStepComponent
              onNext={
                currentStep === steps.length - 1 ? handlePlaceOrder : handleNext
              }
              onBack={handleBack}
              onUpdateData={handleUpdateData}
              checkoutData={checkoutData}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={currentStep === 0 ? onCancel : handleBack}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
              "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
            aria-label={currentStep === 0 ? "Cancel checkout" : "Go back"}
          >
            <ChevronLeft className="w-5 h-5" />
            {currentStep === 0 ? "Cancel" : "Back"}
          </button>

          {/* Next/Place Order Button */}
          <button
            onClick={
              currentStep === steps.length - 1 ? handlePlaceOrder : handleNext
            }
            disabled={!steps[currentStep]?.isValid || isLoading}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
              "text-white bg-green-600 hover:bg-green-700",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
              (!steps[currentStep]?.isValid || isLoading) &&
                "opacity-50 cursor-not-allowed",
            )}
            aria-label={
              currentStep === steps.length - 1
                ? "Place order"
                : "Continue to next step"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Place Order
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Secure checkout powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
