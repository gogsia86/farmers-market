"use client";

/**
 * 🛒 CHECKOUT FLOW - Divine Multi-Step Checkout Orchestration
 * Main checkout component that orchestrates the entire checkout process
 *
 * Features:
 * - Multi-step wizard with progress tracking
 * - Cart review and validation
 * - Address selection/entry
 * - Payment method selection
 * - Order review and confirmation
 * - Real-time order preview calculations
 * - Agricultural consciousness UI patterns
 * - Responsive mobile design
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ShoppingCart,
  MapPin,
  CreditCard,
  FileText,
  ArrowLeft,
  ArrowRight,
  Leaf,
} from "lucide-react";
import { useCheckoutStore, useCheckoutProgress } from "@/stores/checkoutStore";
import { CartReviewStep } from "@/components/checkout/steps/CartReviewStep";
import { AddressStep } from "@/components/checkout/steps/AddressStep";
import { PaymentStep } from "@/components/checkout/steps/PaymentStep";
import { ReviewStep } from "@/components/checkout/steps/ReviewStep";
import { ConfirmationStep } from "@/components/checkout/steps/ConfirmationStep";

// ============================================================================
// TYPES
// ============================================================================

interface StepConfig {
  id: string;
  title: string;
  icon: typeof ShoppingCart;
  component: React.ComponentType;
}

// ============================================================================
// CHECKOUT FLOW COMPONENT
// ============================================================================

export function CheckoutFlow() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Store state
  const currentStep = useCheckoutStore((state) => state.currentStep);
  const isProcessing = useCheckoutStore((state) => state.isProcessing);
  const errors = useCheckoutStore((state) => state.errors);
  const previousStep = useCheckoutStore((state) => state.previousStep);
  const nextStep = useCheckoutStore((state) => state.nextStep);

  // Progress tracking
  const progress = useCheckoutProgress();

  // Step configuration
  const steps: StepConfig[] = [
    {
      id: "cart",
      title: "Review Cart",
      icon: ShoppingCart,
      component: CartReviewStep,
    },
    {
      id: "address",
      title: "Shipping",
      icon: MapPin,
      component: AddressStep,
    },
    {
      id: "payment",
      title: "Payment",
      icon: CreditCard,
      component: PaymentStep,
    },
    {
      id: "review",
      title: "Review",
      icon: FileText,
      component: ReviewStep,
    },
    {
      id: "confirmation",
      title: "Complete",
      icon: CheckCircle,
      component: ConfirmationStep,
    },
  ];

  // Initialize checkout on mount
  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // TODO: Initialize checkout session with API
        // For now, just set loading to false
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Failed to initialize checkout:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, []);

  // Get current step configuration
  const currentStepConfig = steps.find((s) => s.id === currentStep) || steps[0];
  const CurrentStepComponent = currentStepConfig!.component;

  // Handle back button
  const handleBack = () => {
    if (currentStep === "cart") {
      router.push("/cart");
    } else {
      previousStep();
    }
  };

  // Determine if back button should be shown
  const showBackButton = currentStep !== "confirmation";

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto" data-testid="checkout-flow">
      {/* Progress Steps */}
      <div className="mb-8" data-testid="checkout-progress">
        <StepProgress
          steps={steps}
          currentStep={currentStep}
          progress={progress}
        />
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-600 mt-0.5">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Please fix the following issues:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Step Content */}
        <div className="lg:col-span-2" data-testid="checkout-main-content">
          <div
            className="bg-white rounded-xl shadow-md p-6 lg:p-8"
            data-testid="checkout-step-container"
          >
            {/* Step Header */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  {currentStepConfig && (
                    <currentStepConfig.icon className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentStepConfig!.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Step {progress.currentIndex + 1} of {progress.totalSteps}
                  </p>
                </div>
              </div>
            </div>

            {/* Step Component */}
            <div
              className={isProcessing ? "opacity-50 pointer-events-none" : ""}
              data-testid={`checkout-step-${currentStep}`}
            >
              <CurrentStepComponent />
            </div>

            {/* Navigation Buttons */}
            {currentStep !== "confirmation" && (
              <div
                className="mt-8 pt-6 border-t border-gray-200 flex justify-between"
                data-testid="checkout-navigation"
              >
                {showBackButton && (
                  <button
                    onClick={handleBack}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-amber-500 text-gray-700 hover:text-amber-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="checkout-back-button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                )}

                <button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="ml-auto inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="checkout-continue-button"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {currentStep === "review" ? "Place Order" : "Continue"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1" data-testid="checkout-sidebar">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP PROGRESS COMPONENT
// ============================================================================

interface StepProgressProps {
  steps: StepConfig[];
  currentStep: string;
  progress: ReturnType<typeof useCheckoutProgress>;
}

function StepProgress({ steps, currentStep, progress }: StepProgressProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500 ease-out"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStep;
          const isCompleted = progress.completedSteps.includes(step.id as any);
          const isPast = index < progress.currentIndex;

          return (
            <div key={step.id} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg scale-110"
                          : isPast
                            ? "bg-gray-300 text-gray-600"
                            : "bg-gray-200 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center
                    ${isCurrent ? "text-amber-600" : "text-gray-600"}
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    absolute top-5 left-1/2 w-full h-0.5 -z-10
                    ${isPast || isCompleted ? "bg-gradient-to-r from-amber-500 to-orange-600" : "bg-gray-300"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// ORDER SUMMARY COMPONENT
// ============================================================================

function OrderSummary() {
  const orderPreview = useCheckoutStore((state) => state.orderPreview);

  if (!orderPreview) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        <p className="text-gray-600 text-sm">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* Order Stats */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items</span>
          <span className="font-medium text-gray-900">
            {orderPreview.itemCount}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Farms</span>
          <span className="font-medium text-gray-900">
            {orderPreview.farmCount}
          </span>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            ${orderPreview.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium text-gray-900">
            {orderPreview.deliveryFee === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `$${orderPreview.deliveryFee.toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">
            ${orderPreview.tax.toFixed(2)}
          </span>
        </div>
        {orderPreview.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">
              -${orderPreview.discount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="pt-6 border-t border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            ${orderPreview.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <span>Secure SSL checkout</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-amber-600" />
          </div>
          <span>Supporting local farms</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </div>
          <span>100% satisfaction guarantee</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function CheckoutSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="h-2 bg-gray-200 rounded-full animate-pulse mb-6" />
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 w-12 bg-gray-200 rounded mt-2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
