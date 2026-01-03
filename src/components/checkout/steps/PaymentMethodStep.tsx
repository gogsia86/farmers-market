/**
 * 💳 PAYMENT METHOD STEP - Step 3 of Checkout
 * Divine payment method selection for agricultural commerce
 *
 * Features:
 * - Payment method selection (Card, Cash on Delivery)
 * - Stripe integration preparation
 * - Save payment method option
 * - Security badges and PCI compliance indicators
 * - Mobile-responsive design
 * - WCAG 2.1 AA accessibility
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

"use client";

import { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Check,
  Shield,
  Lock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutStepProps } from "../CheckoutWizard";

// ============================================================================
// TYPES
// ============================================================================

type PaymentMethodType = "CARD" | "CASH" | null;

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
  processingFee?: number;
  notes?: string;
}

// ============================================================================
// PAYMENT METHOD STEP COMPONENT
// ============================================================================

export function PaymentMethodStep({
  onNext,
  onBack,
  onUpdateData,
  checkoutData,
  isLoading,
}: CheckoutStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
    checkoutData.paymentMethod || null,
  );
  const [savePaymentMethod, setSavePaymentMethod] = useState(
    checkoutData.savePaymentMethod || false,
  );
  const [showCardForm, setShowCardForm] = useState(false);

  // Available payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      type: "CARD",
      name: "Credit or Debit Card",
      description: "Pay securely with your card",
      icon: CreditCard,
      available: true,
      processingFee: 0,
      notes: "Stripe secure payment processing",
    },
    {
      id: "cash",
      type: "CASH",
      name: "Cash on Delivery/Pickup",
      description: "Pay when you receive your order",
      icon: DollarSign,
      available: checkoutData.fulfillmentMethod !== "SHIPPING",
      processingFee: 0,
      notes: "Available for pickup and local delivery only",
    },
  ];

  // Handle payment method selection
  const handleSelectMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    onUpdateData({ paymentMethod: method });

    // Show card form if card is selected
    if (method === "CARD") {
      setShowCardForm(true);
    } else {
      setShowCardForm(false);
    }
  };

  // Handle save payment method toggle
  const handleSavePaymentToggle = (checked: boolean) => {
    setSavePaymentMethod(checked);
    onUpdateData({ savePaymentMethod: checked });
  };

  const isValid = !!selectedMethod;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Method
        </h2>
        <p className="text-gray-600">
          Choose how you'd like to pay for your order
        </p>
      </div>

      {/* Security Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">
              Secure Payment Processing
            </h4>
            <p className="text-sm text-green-800">
              All transactions are encrypted and secure. We never store your
              full card details on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-900">
          Select Payment Method
        </label>

        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.type;
            const isAvailable = method.available;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => isAvailable && handleSelectMethod(method.type)}
                disabled={!isAvailable}
                className={cn(
                  "relative w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left",
                  isSelected
                    ? "border-green-600 bg-green-50"
                    : isAvailable
                      ? "border-gray-200 hover:border-gray-300"
                      : "border-gray-200 opacity-50 cursor-not-allowed",
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                    isSelected
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 mb-1">
                    {method.name}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {method.description}
                  </p>
                  {method.notes && (
                    <p className="text-xs text-gray-500 italic">
                      {method.notes}
                    </p>
                  )}
                  {method.processingFee && method.processingFee > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Processing fee: ${method.processingFee.toFixed(2)}
                    </p>
                  )}
                  {!isAvailable && (
                    <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                      <AlertCircle className="w-3 h-3" />
                      <span>Not available for this delivery method</span>
                    </div>
                  )}
                </div>

                {/* Check Mark */}
                {isSelected && (
                  <Check className="absolute top-4 right-4 w-5 h-5 text-green-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Payment Form (Stripe Placeholder) */}
      {showCardForm && selectedMethod === "CARD" && (
        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Card Details</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Secured by Stripe</span>
            </div>
          </div>

          {/* Stripe Payment Integration Placeholder */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">
              Payment Integration Coming Soon
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Stripe payment form will be integrated in Phase 3. For now, your
              order will be created and payment can be processed separately.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5">
              <Shield className="w-3 h-3 text-green-600" />
              <span>PCI DSS Compliant</span>
            </div>
          </div>

          {/* Card Form Fields (Placeholder - will be Stripe Elements) */}
          <div className="space-y-4 opacity-50 pointer-events-none">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled
              />
            </div>
          </div>

          {/* Save Payment Method */}
          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savePaymentMethod}
                onChange={(e) => handleSavePaymentToggle(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  Save card for future purchases
                </span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Your card details will be securely stored for faster checkout
                  next time.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Cash on Delivery/Pickup Info */}
      {selectedMethod === "CASH" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Cash Payment Instructions
              </h4>
              <p className="text-sm text-blue-800">
                {checkoutData.fulfillmentMethod === "PICKUP"
                  ? "Please have exact change ready when you pick up your order. We'll send you the total amount with your pickup confirmation."
                  : "Please have exact change ready when our driver arrives. You'll receive the total amount with your delivery confirmation."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Features */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
          Your Payment is Protected
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-gray-900">
                256-bit SSL
              </div>
              <div className="text-xs text-gray-600">Encrypted</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-gray-900">
                PCI Compliant
              </div>
              <div className="text-xs text-gray-600">Secure Storage</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-gray-900">
                Fraud Protection
              </div>
              <div className="text-xs text-gray-600">24/7 Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {!isValid && (
        <div className="text-sm text-red-600 text-center">
          Please select a payment method to continue
        </div>
      )}

      {/* Order Summary Preview */}
      {isValid && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount to be charged:</span>
            <span className="text-lg font-bold text-gray-900">
              ${checkoutData.cartSummary.total.toFixed(2)}
            </span>
          </div>
          {selectedMethod === "CARD" && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your card will be charged after order confirmation
            </p>
          )}
          {selectedMethod === "CASH" && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Payment due upon{" "}
              {checkoutData.fulfillmentMethod === "PICKUP"
                ? "pickup"
                : "delivery"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
