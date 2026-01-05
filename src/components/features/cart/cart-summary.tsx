"use client";

// 📊 CART SUMMARY - Divine Cart Totals Display Component
// Displays cart summary with subtotal, tax, delivery fee, and total calculations

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { CartSummary as CartSummaryType } from "@/lib/services/cart.service";
import { ShoppingCart, Truck } from "lucide-react";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

interface CartSummaryProps {
  summary: CartSummaryType;
  showCheckoutButton?: boolean;
  isValidating?: boolean;
  onCheckout?: () => void;
}

// ============================================================================
// CART SUMMARY COMPONENT
// ============================================================================

export function CartSummary({
  summary,
  showCheckoutButton = true,
  isValidating = false,
  onCheckout,
}: CartSummaryProps) {
  const { subtotal, tax, deliveryFee, total, itemCount, uniqueProductCount } = summary;

  const freeDeliveryThreshold = 50;
  const remainingForFreeDelivery = freeDeliveryThreshold - subtotal;
  const qualifiesForFreeDelivery = remainingForFreeDelivery <= 0;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Card className="sticky top-4">
      <CardBody className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShoppingCart className="h-4 w-4" />
            <span>
              {itemCount} item{itemCount !== 1 ? "s" : ""} ({uniqueProductCount} unique)
            </span>
          </div>
        </div>

        {/* Calculation Breakdown */}
        <div className="space-y-3 border-b pb-4">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>

          {/* Delivery Fee */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Delivery Fee</span>
            </div>
            <span
              className={`font-medium ${deliveryFee === 0 ? "text-green-600" : "text-gray-900"
                }`}
            >
              {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
            </span>
          </div>

          {/* Free Delivery Progress */}
          {!qualifiesForFreeDelivery && deliveryFee > 0 && (
            <div className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
              Add ${remainingForFreeDelivery.toFixed(2)} more for free delivery!
            </div>
          )}

          {/* Tax */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tax (8%)</span>
            <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
        </div>

        {/* Checkout Button */}
        {showCheckoutButton && (
          <div className="space-y-3">
            {onCheckout ? (
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={onCheckout}
                disabled={isValidating || itemCount === 0}
              >
                {isValidating ? "Validating..." : "Proceed to Checkout"}
              </Button>
            ) : (
              <Link href="/checkout">
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isValidating || itemCount === 0}
                >
                  {isValidating ? "Validating..." : "Proceed to Checkout"}
                </Button>
              </Link>
            )}

            <Link href="/products">
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 rounded-md bg-gray-50 py-3 text-xs text-gray-600">
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure checkout with Stripe</span>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-xs text-gray-500">
          <p className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Free returns within 24 hours of delivery</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Farm-fresh products from local farmers</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Support sustainable agriculture</span>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
