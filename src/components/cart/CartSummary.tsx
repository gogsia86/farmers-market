/**
 * CART SUMMARY - PRICE BREAKDOWN DISPLAY
 *
 * Shows:
 * - Subtotal
 * - Tax
 * - Shipping
 * - Discounts
 * - Total
 */

"use client";

import type { ShoppingCart } from "@/types/cart.types";

interface CartSummaryProps {
  cart: ShoppingCart;
  showDetails?: boolean;
}

export default function CartSummary({
  cart,
  showDetails = true,
}: CartSummaryProps) {
  return (
    <div className="space-y-3">
      {/* Subtotal */}
      {showDetails && (
        <div className="flex justify-between text-base text-gray-900">
          <p>Subtotal ({cart.itemCount} items)</p>
          <p>${(cart.subtotal / 100).toFixed(2)}</p>
        </div>
      )}

      {/* Tax */}
      {showDetails && (
        <div className="flex justify-between text-sm text-gray-600">
          <p>Tax (8%)</p>
          <p>${(cart.tax / 100).toFixed(2)}</p>
        </div>
      )}

      {/* Shipping */}
      {showDetails && (
        <div className="flex justify-between text-sm text-gray-600">
          <p>Shipping</p>
          <p>
            {cart.shipping === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `$${(cart.shipping / 100).toFixed(2)}`
            )}
          </p>
        </div>
      )}

      {/* Free Shipping Notice */}
      {showDetails && cart.shipping > 0 && cart.subtotal < 5000 && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 Add ${((5000 - cart.subtotal) / 100).toFixed(2)} more for free
          shipping!
        </div>
      )}

      {/* Discount */}
      {showDetails && cart.discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <p>Discount</p>
          <p>-${(cart.discount / 100).toFixed(2)}</p>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900">
        <p>Total</p>
        <p className="text-agricultural-600">
          ${(cart.total / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
