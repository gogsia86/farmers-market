/**
 * 🧾 CART SUMMARY COMPONENT
 * Displays order summary with pricing breakdown and checkout button
 *
 * Features:
 * - Subtotal, tax, delivery fee breakdown
 * - Total calculation with visual emphasis
 * - Checkout button with loading state
 * - Trust badges
 * - Promo code input (future enhancement)
 * - Accessibility (ARIA labels, semantic HTML)
 * - Agricultural consciousness
 */

"use client";

import Link from "next/link";
import { ArrowRight, Tag, Lock, Truck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { CartSummary as CartSummaryData } from "@/lib/services/cart.service";

interface CartSummaryProps {
  summary: CartSummaryData;
  checkoutHref?: string;
  showPromoCode?: boolean;
  disabled?: boolean;
}

export function CartSummary({
  summary,
  checkoutHref = "/checkout",
  showPromoCode = false,
  disabled = false,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    setPromoError(null);

    // TODO: Implement promo code API call
    setTimeout(() => {
      setPromoError("Promo code not valid");
      setIsApplyingPromo(false);
    }, 1000);
  };

  const isEmpty = summary.itemCount === 0;
  const hasDeliveryFee = summary.deliveryFee > 0;

  return (
    <div
      className="glass-card rounded-2xl p-6 sticky top-24"
      data-testid="cart-summary"
    >
      {/* Header */}
      <h2
        className="text-xl font-bold text-foreground mb-6"
        data-testid="cart-summary-title"
      >
        Order Summary
      </h2>

      {/* Promo Code (Optional) */}
      {showPromoCode && !isEmpty && (
        <div className="mb-6">
          <label htmlFor="promo-code" className="sr-only">
            Promo code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="promo-code"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo code"
                disabled={isApplyingPromo || disabled}
                className="w-full pl-10 pr-3 py-2 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby={promoError ? "promo-error" : undefined}
                data-testid="promo-code-input"
              />
            </div>
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || isApplyingPromo || disabled}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              type="button"
              data-testid="apply-promo-button"
            >
              {isApplyingPromo ? "Applying..." : "Apply"}
            </button>
          </div>
          {promoError && (
            <p
              id="promo-error"
              className="text-sm text-red-600 dark:text-red-400 mt-2"
            >
              {promoError}
            </p>
          )}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-4 mb-6" data-testid="price-breakdown">
        {/* Subtotal */}
        <div
          className="flex justify-between text-muted-foreground"
          data-testid="subtotal-line"
        >
          <span>
            Subtotal ({summary.itemCount}{" "}
            {summary.itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-medium" data-testid="subtotal-amount">
            ${summary.subtotal.toFixed(2)}
          </span>
        </div>

        {/* Tax */}
        <div
          className="flex justify-between text-muted-foreground"
          data-testid="tax-line"
        >
          <span>Tax (8%)</span>
          <span className="font-medium" data-testid="tax-amount">
            ${summary.tax.toFixed(2)}
          </span>
        </div>

        {/* Delivery Fee */}
        <div
          className="flex justify-between text-muted-foreground"
          data-testid="delivery-line"
        >
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4" aria-hidden="true" />
            Delivery
          </span>
          {hasDeliveryFee ? (
            <span className="font-medium" data-testid="delivery-amount">
              ${summary.deliveryFee.toFixed(2)}
            </span>
          ) : (
            <span
              className="text-green-600 dark:text-green-400 font-medium"
              data-testid="delivery-free"
            >
              Free
            </span>
          )}
        </div>

        {/* Multi-farm Notice */}
        {summary.farmCount > 1 && (
          <div className="text-xs text-muted-foreground bg-accent/10 p-3 rounded-lg">
            <span className="font-semibold">{summary.farmCount} farms</span> -
            Items from multiple farms may have separate delivery times
          </div>
        )}

        {/* Divider & Total */}
        <div
          className="pt-4 border-t border-border"
          data-testid="total-section"
        >
          <div className="flex justify-between text-lg font-bold text-foreground">
            <span>Total</span>
            <span
              className="text-2xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
              data-testid="total-amount"
            >
              ${summary.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        href={isEmpty ? "#" : checkoutHref}
        onClick={(e) => {
          if (isEmpty || disabled) {
            e.preventDefault();
          }
        }}
        className={`
          w-full px-6 py-4 rounded-xl font-semibold transition-all
          flex items-center justify-center gap-2 shadow-lg
          ${
            isEmpty || disabled
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-glow hover:shadow-glow-lg"
          }
        `}
        aria-disabled={isEmpty || disabled}
        tabIndex={isEmpty || disabled ? -1 : 0}
        data-testid="checkout-button"
      >
        {isEmpty ? (
          "Cart is Empty"
        ) : (
          <>
            Proceed to Checkout
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </>
        )}
      </Link>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock
              className="h-4 w-4 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          </div>
          <span>Secure checkout with SSL encryption</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg" role="img" aria-label="Farm">
              🌾
            </span>
          </div>
          <span>Fresh from local family farms</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldCheck
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
          </div>
          <span>100% satisfaction guarantee</span>
        </div>

        {hasDeliveryFee && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Truck
                className="h-4 w-4 text-orange-600 dark:text-orange-400"
                aria-hidden="true"
              />
            </div>
            <span>Free delivery on orders over $50</span>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!isEmpty && (
        <div className="mt-4 text-xs text-center text-muted-foreground">
          Need help?{" "}
          <Link
            href="/support"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            Contact support
          </Link>
        </div>
      )}
    </div>
  );
}
