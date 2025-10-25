/**
 * CART PAGE - FULL SHOPPING CART VIEW
 *
 * Complete shopping cart page with:
 * - All cart items
 * - Cart summary
 * - Checkout button
 * - Continue shopping link
 */

"use client";

import CartItem from "@/components/cart/CartItem";
import { useCart } from "@/components/cart/CartProvider";
import CartSummary from "@/components/cart/CartSummary";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-3 text-gray-600">
            Start adding some fresh, local produce to your cart!
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-agricultural-600 text-white rounded-md hover:bg-agricultural-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">
            {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <div
                      key={item.product.identity.id}
                      className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                    >
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    Clear entire cart
                  </button>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-agricultural-600 hover:text-agricultural-700 font-medium"
              >
                <ArrowLeft className="h-5 w-5" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <CartSummary cart={cart} showDetails={true} />

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="mt-6 block w-full bg-agricultural-600 text-white text-center px-6 py-3 rounded-md font-semibold hover:bg-agricultural-700 transition-colors"
              >
                Proceed to Checkout
              </Link>

              {/* Additional Info */}
              <div className="mt-6 text-sm text-gray-500 space-y-2">
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Free shipping on orders over $50
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Fresh from local farms
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Secure checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
