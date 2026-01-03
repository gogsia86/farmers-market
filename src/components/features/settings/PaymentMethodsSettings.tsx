/**
 * 💳 PAYMENT METHODS SETTINGS COMPONENT
 * Divine implementation for configuring accepted payment methods
 * Features: Method selection, deposit settings, payment policies
 */

"use client";

import { useState } from "react";
import {
  CreditCardIcon,
  BanknotesIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface PaymentMethodsSettingsProps {
  /** Currently accepted payment methods */
  acceptedMethods: string[];
  /** Callback when methods change */
  onMethodsChange: (methods: string[]) => void;
  /** Require deposit on orders */
  requireDeposit: boolean;
  /** Callback when deposit requirement changes */
  onRequireDepositChange: (required: boolean) => void;
  /** Deposit percentage (if required) */
  depositPercentage?: number;
  /** Callback when deposit percentage changes */
  onDepositPercentageChange: (percentage: number) => void;
  /** Optional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

const PAYMENT_METHODS = [
  {
    id: "CARD",
    name: "Credit/Debit Card",
    description: "Accept card payments through Stripe",
    icon: CreditCardIcon,
  },
  {
    id: "CASH",
    name: "Cash",
    description: "Accept cash payments on delivery or pickup",
    icon: BanknotesIcon,
  },
  {
    id: "CHECK",
    name: "Check",
    description: "Accept check payments",
    icon: DocumentCheckIcon,
  },
  {
    id: "BANK_TRANSFER",
    name: "Bank Transfer",
    description: "Accept direct bank transfers",
    icon: BanknotesIcon,
  },
  {
    id: "VENMO",
    name: "Venmo",
    description: "Accept Venmo payments",
    icon: CreditCardIcon,
  },
  {
    id: "PAYPAL",
    name: "PayPal",
    description: "Accept PayPal payments",
    icon: CreditCardIcon,
  },
] as const;

/**
 * PaymentMethodsSettings - Configure accepted payment methods
 *
 * @example
 * ```tsx
 * <PaymentMethodsSettings
 *   acceptedMethods={["CARD", "CASH"]}
 *   onMethodsChange={setMethods}
 *   requireDeposit={false}
 *   onRequireDepositChange={setRequireDeposit}
 *   depositPercentage={25}
 *   onDepositPercentageChange={setDepositPercentage}
 * />
 * ```
 */
export function PaymentMethodsSettings({
  acceptedMethods,
  onMethodsChange,
  requireDeposit,
  onRequireDepositChange,
  depositPercentage = 0,
  onDepositPercentageChange,
  className = "",
  disabled = false,
}: PaymentMethodsSettingsProps) {
  /**
   * Toggle payment method
   */
  const toggleMethod = (methodId: string) => {
    if (acceptedMethods.includes(methodId)) {
      // Remove method
      onMethodsChange(acceptedMethods.filter((m) => m !== methodId));
    } else {
      // Add method
      onMethodsChange([...acceptedMethods, methodId]);
    }
  };

  /**
   * Check if method is accepted
   */
  const isMethodAccepted = (methodId: string): boolean => {
    return acceptedMethods.includes(methodId);
  };

  return (
    <div
      className={`space-y-6 ${className}`}
      data-testid="payment-methods-settings"
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select which payment methods you accept for orders
        </p>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isAccepted = isMethodAccepted(method.id);

          return (
            <label
              key={method.id}
              className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                isAccepted
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              data-testid={`payment-method-${method.id.toLowerCase()}`}
            >
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={() => toggleMethod(method.id)}
                disabled={disabled}
                className="sr-only"
              />
              <div className="flex flex-1 items-start">
                <div className="flex-shrink-0">
                  <Icon
                    className={`h-6 w-6 ${
                      isAccepted ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isAccepted ? "text-green-900" : "text-gray-900"
                      }`}
                    >
                      {method.name}
                    </span>
                    {isAccepted && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 12 12"
                        >
                          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-xs ${
                      isAccepted ? "text-green-700" : "text-gray-500"
                    }`}
                  >
                    {method.description}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Validation Warning */}
      {acceptedMethods.length === 0 && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                You must accept at least one payment method to receive orders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Settings */}
      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={requireDeposit}
                onChange={(e) => onRequireDepositChange(e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                data-testid="require-deposit-checkbox"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-900">
                Require deposit for orders
              </label>
              <p className="text-sm text-gray-500">
                Customers must pay a deposit percentage upfront when placing
                orders
              </p>
            </div>
          </div>

          {requireDeposit && (
            <div className="ml-7 space-y-3">
              <div>
                <label
                  htmlFor="deposit-percentage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Deposit Percentage
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="range"
                    id="deposit-percentage"
                    min="10"
                    max="100"
                    step="5"
                    value={depositPercentage}
                    onChange={(e) =>
                      onDepositPercentageChange(parseInt(e.target.value))
                    }
                    disabled={disabled}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    data-testid="deposit-percentage-slider"
                  />
                  <div className="w-16 text-right">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      step="5"
                      value={depositPercentage}
                      onChange={(e) =>
                        onDepositPercentageChange(
                          Math.max(
                            10,
                            Math.min(100, parseInt(e.target.value) || 10),
                          ),
                        )
                      }
                      disabled={disabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm text-center"
                      data-testid="deposit-percentage-input"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-4">%</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Customers will pay {depositPercentage}% upfront and the
                  remaining {100 - depositPercentage}% on delivery/pickup
                </p>
              </div>

              {/* Example Calculation */}
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Example Calculation:
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Order Total:</span>
                    <span className="font-medium">$100.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit ({depositPercentage}%):</span>
                    <span className="font-medium text-green-600">
                      ${(100 * (depositPercentage / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-1">
                    <span>Due on Delivery:</span>
                    <span className="font-medium">
                      ${(100 * ((100 - depositPercentage) / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 rounded-md p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Payment Processing:</span> Card
              payments are processed securely through Stripe. Make sure to
              connect your Stripe account in the Payments section to accept card
              payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
