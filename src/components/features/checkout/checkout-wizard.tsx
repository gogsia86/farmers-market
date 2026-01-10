"use client";

// 🧙 CHECKOUT WIZARD - Divine State Orchestrator
// Manages multi-step checkout flow with centralized state
// Follows divine wizard pattern with agricultural consciousness

import { Card, CardBody } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { CartItem, Farm, Product, UserAddress } from "@prisma/client";
import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { CartSummary } from "./cart-summary";
import { DeliveryStep } from "./delivery-step";
import { PaymentStep } from "./payment-step";
import { ReviewStep } from "./review-step";
import { ShippingStep } from "./shipping-step";

// ============================================================================
// TYPES
// ============================================================================

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  saveAddress?: boolean;
}

export interface DeliveryInfo {
  preferredDate: string;
  preferredTime: string;
  deliveryInstructions?: string;
}

export interface PaymentInfo {
  method: "card" | "wallet";
  saveCard?: boolean;
  paymentIntentId?: string;
}

interface CheckoutFormData {
  shipping: ShippingAddress | null;
  delivery: DeliveryInfo | null;
  payment: PaymentInfo | null;
}

type CheckoutStep = 1 | 2 | 3 | 4;

interface WizardProps {
  cart: (CartItem & {
    product: Product & {
      farm: Pick<Farm, "id" | "name" | "slug" | "address" | "city" | "state" | "zipCode">;
    };
  })[];
  savedAddresses: UserAddress[];
  userId: string;
}

// ============================================================================
// WIZARD ORCHESTRATOR
// ============================================================================

export function CheckoutWizard({ cart, savedAddresses, userId }: WizardProps) {
  // ==========================================================================
  // STATE MANAGEMENT (Centralized)
  // ==========================================================================
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping: null,
    delivery: null,
    payment: null,
  });
  const { trackBeginCheckout } = useAnalytics();

  // Calculate cart total
  const cartTotal = cart.reduce((sum: any, item: any) => {
    const itemTotal = Number(item.priceAtAdd) * Number(item.quantity);
    return sum + itemTotal;
  }, 0);

  // ==========================================================================
  // ANALYTICS TRACKING
  // ==========================================================================

  // Track checkout initiation on mount
  useEffect(() => {
    trackBeginCheckout({
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: Number(item.priceAtAdd),
        quantity: Number(item.quantity),
      })),
      totalValue: cartTotal,
    });
  }, []); // Only track once on mount

  // ==========================================================================
  // STEP CONFIGURATION
  // ==========================================================================
  const steps = [
    { number: 1 as const, name: "Shipping", key: "shipping" },
    { number: 2 as const, name: "Delivery", key: "delivery" },
    { number: 3 as const, name: "Payment", key: "payment" },
    { number: 4 as const, name: "Review", key: "review" },
  ];

  // ==========================================================================
  // STEP HANDLERS
  // ==========================================================================

  const handleStepComplete = (stepData: any) => {
    const currentStepKey = steps.find((s: any) => s.number === currentStep)?.key;

    if (currentStepKey && currentStepKey !== "review") {
      // Save step data
      setFormData({
        ...formData,
        [currentStepKey]: stepData,
      });
    }

    // Move to next step
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as CheckoutStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as CheckoutStep);
    }
  };

  const handleEditStep = (stepNumber: CheckoutStep) => {
    // Allow editing previous steps
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  // ==========================================================================
  // STEP VALIDATION
  // ==========================================================================

  const isStepComplete = (stepNumber: CheckoutStep): boolean => {
    switch (stepNumber) {
      case 1:
        return formData.shipping !== null;
      case 2:
        return formData.delivery !== null;
      case 3:
        return formData.payment !== null;
      case 4:
        return false; // Review step is never "complete" until order placed
      default:
        return false;
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* LEFT SIDE: Wizard Steps (2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Indicator */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              {steps.map((step: any, index: any) => (
                <div key={step.number} className="flex items-center">
                  {/* Step Circle */}
                  <button
                    onClick={() => handleEditStep(step.number)}
                    disabled={step.number > currentStep}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${step.number === currentStep
                      ? "border-green-600 bg-green-600 text-white"
                      : isStepComplete(step.number)
                        ? "border-green-600 bg-green-100 text-green-600 hover:bg-green-200"
                        : "border-gray-300 bg-white text-gray-400"
                      } ${step.number < currentStep
                        ? "cursor-pointer"
                        : step.number === currentStep
                          ? "cursor-default"
                          : "cursor-not-allowed"
                      }`}
                  >
                    {isStepComplete(step.number) ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  {/* Step Label */}
                  <div className="ml-2">
                    <p
                      className={`text-sm font-medium ${step.number === currentStep
                        ? "text-green-600"
                        : isStepComplete(step.number)
                          ? "text-green-600"
                          : "text-gray-400"
                        }`}
                    >
                      {step.name}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-12 ${isStepComplete(step.number)
                        ? "bg-green-600"
                        : "bg-gray-300"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Current Step Content */}
        <Card>
          <CardBody className="p-6">
            {currentStep === 1 && (
              <ShippingStep
                formData={formData}
                onComplete={handleStepComplete}
                onBack={handleBack}
                savedAddresses={savedAddresses}
              />
            )}

            {currentStep === 2 && (
              <DeliveryStep
                formData={formData}
                onComplete={handleStepComplete}
                onBack={handleBack}
              />
            )}

            {currentStep === 3 && (
              <PaymentStep
                formData={formData}
                cartTotal={cartTotal}
                userId={userId}
                onComplete={handleStepComplete}
                onBack={handleBack}
              />
            )}

            {currentStep === 4 && (
              <ReviewStep
                formData={formData}
                cart={cart}
                userId={userId}
                onBack={handleBack}
                onEditStep={handleEditStep}
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* RIGHT SIDE: Cart Summary (1 column) */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <CartSummary cart={cart} />
        </div>
      </div>
    </div>
  );
}
