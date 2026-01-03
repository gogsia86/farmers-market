/**
 * @file CartSummary.tsx
 * @description Cart pricing summary component with breakdown of costs
 *
 * Features:
 * - Subtotal display
 * - Tax calculation display
 * - Delivery fee display
 * - Discount display (if applicable)
 * - Grand total display
 * - Currency formatting
 * - Tooltip explanations
 * - Mobile responsive
 * - Accessibility compliant
 *
 * @module components/features/cart/CartSummary
 */

"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import type { CartTotals } from "@/lib/stores/cart.store";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CartSummaryProps {
  /**
   * Cart totals data
   */
  totals: CartTotals;

  /**
   * Whether to show detailed breakdown
   * @default true
   */
  showBreakdown?: boolean;

  /**
   * Whether to show tooltips
   * @default true
   */
  showTooltips?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Size variant
   * @default "default"
   */
  size?: "compact" | "default" | "large";
}

// ============================================================================
// Component
// ============================================================================

/**
 * Cart summary component with pricing breakdown
 *
 * @example
 * ```tsx
 * import { CartSummary } from '@/components/features/cart/CartSummary';
 *
 * function CartDrawer() {
 *   const totals = useCartTotals();
 *
 *   return (
 *     <div>
 *       <CartSummary totals={totals} />
 *     </div>
 *   );
 * }
 * ```
 */
export function CartSummary({
  totals,
  showBreakdown = true,
  showTooltips = true,
  className = "",
  size = "default",
}: CartSummaryProps) {
  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Size-based text classes
  const textSizeClasses = {
    compact: {
      row: "text-sm",
      total: "text-base",
      label: "text-sm",
      value: "text-sm",
    },
    default: {
      row: "text-base",
      total: "text-lg",
      label: "text-base",
      value: "text-base",
    },
    large: {
      row: "text-lg",
      total: "text-xl",
      label: "text-lg",
      value: "text-lg",
    },
  };

  const sizeClasses = textSizeClasses[size];

  return (
    <div className={`space-y-3 ${className}`} data-testid="cart-summary">
      {showBreakdown && (
        <>
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className={`${sizeClasses.label} text-gray-600`}>
                Subtotal
              </span>
              {showTooltips && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Subtotal information"
                  title="Total cost of all items before tax and fees"
                >
                  <InformationCircleIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <span
              className={`${sizeClasses.value} text-gray-900 font-medium`}
              data-testid="subtotal-amount"
            >
              {formatCurrency(totals.subtotal)}
            </span>
          </div>

          {/* Tax */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className={`${sizeClasses.label} text-gray-600`}>Tax</span>
              {showTooltips && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Tax information"
                  title="Sales tax based on delivery location"
                >
                  <InformationCircleIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <span
              className={`${sizeClasses.value} text-gray-900 font-medium`}
              data-testid="tax-amount"
            >
              {formatCurrency(totals.tax)}
            </span>
          </div>

          {/* Delivery Fee */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className={`${sizeClasses.label} text-gray-600`}>
                Delivery Fee
              </span>
              {showTooltips && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Delivery fee information"
                  title="Delivery fee based on your location"
                >
                  <InformationCircleIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <span
              className={`${sizeClasses.value} text-gray-900 font-medium`}
              data-testid="delivery-fee-amount"
            >
              {totals.deliveryFee === 0
                ? "FREE"
                : formatCurrency(totals.deliveryFee)}
            </span>
          </div>

          {/* Discount (if applicable) */}
          {totals.discount > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className={`${sizeClasses.label} text-green-600`}>
                  Discount
                </span>
                {showTooltips && (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Discount information"
                    title="Coupon or promotional discount applied"
                  >
                    <InformationCircleIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              <span
                className={`${sizeClasses.value} text-green-600 font-medium`}
                data-testid="discount-amount"
              >
                -{formatCurrency(totals.discount)}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3" />
        </>
      )}

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className={`${sizeClasses.total} font-bold text-gray-900`}>
          Total
        </span>
        <span
          className={`${sizeClasses.total} font-bold text-gray-900`}
          data-testid="total-amount"
        >
          {formatCurrency(totals.total)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Minimal Cart Summary Variant
// ============================================================================

/**
 * Minimal cart summary showing only the total
 */
export function MinimalCartSummary({ totals }: { totals: CartTotals }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div
      className="flex justify-between items-center"
      data-testid="minimal-cart-summary"
    >
      <span className="text-base font-semibold text-gray-900">Total</span>
      <span className="text-lg font-bold text-gray-900">
        {formatCurrency(totals.total)}
      </span>
    </div>
  );
}

// ============================================================================
// Detailed Cart Summary with Savings
// ============================================================================

/**
 * Detailed cart summary with savings calculation
 */
export function DetailedCartSummary({ totals }: { totals: CartTotals }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate savings percentage
  const savingsPercentage =
    totals.discount > 0
      ? Math.round(
          (totals.discount / (totals.subtotal + totals.discount)) * 100,
        )
      : 0;

  return (
    <div className="space-y-4" data-testid="detailed-cart-summary">
      {/* Order Summary Header */}
      <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>

      {/* Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-base">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-base">
          <span className="text-gray-600">Tax (8%)</span>
          <span className="text-gray-900 font-medium">
            {formatCurrency(totals.tax)}
          </span>
        </div>

        <div className="flex justify-between text-base">
          <span className="text-gray-600">Delivery</span>
          <span className="text-gray-900 font-medium">
            {totals.deliveryFee === 0
              ? "FREE"
              : formatCurrency(totals.deliveryFee)}
          </span>
        </div>

        {totals.discount > 0 && (
          <>
            <div className="flex justify-between text-base">
              <span className="text-green-600 font-medium">Discount</span>
              <span className="text-green-600 font-medium">
                -{formatCurrency(totals.discount)}
              </span>
            </div>

            {/* Savings Badge */}
            <div className="rounded-md bg-green-50 p-3">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm text-green-800">
                  You're saving{" "}
                  <span className="font-semibold">
                    {formatCurrency(totals.discount)}
                  </span>{" "}
                  ({savingsPercentage}% off)
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Total */}
      <div className="flex justify-between items-baseline">
        <span className="text-xl font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(totals.total)}
        </span>
      </div>

      {/* Free Shipping Notice */}
      {totals.deliveryFee === 0 && (
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-blue-800">
              Enjoy <span className="font-semibold">free delivery</span> on this
              order!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Checkout Summary Variant
// ============================================================================

/**
 * Summary for checkout page with estimated total
 */
export function CheckoutSummary({ totals }: { totals: CartTotals }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div
      className="rounded-lg border-2 border-green-200 bg-green-50 p-6 space-y-4"
      data-testid="checkout-summary"
    >
      <h3 className="text-lg font-semibold text-gray-900">Order Total</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">{formatCurrency(totals.tax)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery</span>
          <span className="text-gray-900">
            {totals.deliveryFee === 0
              ? "FREE"
              : formatCurrency(totals.deliveryFee)}
          </span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="text-green-600">
              -{formatCurrency(totals.discount)}
            </span>
          </div>
        )}
      </div>

      <div className="border-t-2 border-green-300 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-xl font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(totals.total)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Final amount may vary based on selected delivery options
      </p>
    </div>
  );
}
