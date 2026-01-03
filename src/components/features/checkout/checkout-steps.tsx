"use client";

// 🎯 CHECKOUT STEPS - Progress Indicator Component
// Visual stepper showing checkout progress with agricultural consciousness

import type { CheckoutStep } from "@/app/(customer)/checkout/page";
import { Check } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

interface Step {
  id: CheckoutStep;
  name: string;
  description: string;
}

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

const steps: Step[] = [
  {
    id: "address",
    name: "Delivery Address",
    description: "Where should we deliver?",
  },
  {
    id: "delivery",
    name: "Delivery Options",
    description: "Choose delivery or pickup",
  },
  {
    id: "payment",
    name: "Payment Method",
    description: "Secure payment information",
  },
  {
    id: "review",
    name: "Review Order",
    description: "Confirm and place order",
  },
];

// ============================================================================
// CHECKOUT STEPS COMPONENT
// ============================================================================

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <li
              key={step.id}
              className={`relative flex-1 ${index !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
                }`}
            >
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute left-0 top-4 -ml-px mt-0.5 h-0.5 w-full"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full transition-colors duration-300 ${isCompleted ? "bg-green-600" : "bg-gray-300"
                      }`}
                  />
                </div>
              )}

              {/* Step Content */}
              <div className="group relative flex flex-col items-center">
                {/* Step Circle */}
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${isCompleted
                      ? "bg-green-600 text-white"
                      : isCurrent
                        ? "border-2 border-green-600 bg-white text-green-600"
                        : "border-2 border-gray-300 bg-white text-gray-400"
                    }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </span>

                {/* Step Label - Hidden on mobile, shown on sm+ */}
                <div className="mt-3 hidden sm:block text-center">
                  <span
                    className={`block text-sm font-medium transition-colors duration-300 ${isCurrent
                        ? "text-green-600"
                        : isCompleted
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                  >
                    {step.name}
                  </span>
                  <span
                    className={`mt-1 block text-xs transition-colors duration-300 ${isCurrent || isCompleted ? "text-gray-600" : "text-gray-400"
                      }`}
                  >
                    {step.description}
                  </span>
                </div>

                {/* Mobile Label - Only show current step */}
                <div className="mt-3 sm:hidden text-center">
                  {isCurrent && (
                    <>
                      <span className="block text-sm font-medium text-green-600">
                        {step.name}
                      </span>
                      <span className="mt-1 block text-xs text-gray-600">
                        {step.description}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile Progress Counter */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm text-gray-600">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>
    </nav>
  );
}
