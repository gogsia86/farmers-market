"use client";

/**
 * 🛒 CART BADGE COMPONENT
 * Divine shopping cart badge with live count and optional mini-cart dropdown
 *
 * Features:
 * - Real-time cart count display
 * - Animated badge on count changes
 * - Optional mini-cart dropdown preview
 * - Guest cart support via localStorage
 * - Loading states and optimistic updates
 */

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils/currency";
import { ShoppingCart, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface CartBadgeProps {
  userId?: string;
  showMiniCart?: boolean;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
}

// ============================================================================
// CART BADGE COMPONENT
// ============================================================================

export function CartBadge({
  userId,
  showMiniCart = true,
  variant = "ghost",
  size = "sm",
  className = "",
}: CartBadgeProps) {
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const { cart, count, isLoading, removeFromCart, clearCart } = useCart();

  // Trigger animation when count changes (only when mounted)
  useEffect(() => {
    if (mounted && count !== previousCount && count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      setPreviousCount(count);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count, previousCount, mounted]);

  // Close mini-cart when clicking outside
  useEffect(() => {
    if (!miniCartOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".mini-cart-container")) {
        setMiniCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [miniCartOpen]);

  const handleBadgeClick = () => {
    if (showMiniCart && count > 0) {
      setMiniCartOpen(!miniCartOpen);
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="relative mini-cart-container">
        <Button
          variant={variant}
          size={size}
          className={`relative ${className}`}
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mini-cart-container">
      {/* Cart Badge Button */}
      {showMiniCart && count > 0 ? (
        <Button
          variant={variant}
          size={size}
          className={`relative ${className}`}
          onClick={handleBadgeClick}
          aria-label={`Shopping cart with ${count} items`}
        >
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span
              className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white transition-transform ${
                isAnimating ? "scale-125" : "scale-100"
              }`}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      ) : (
        <Link href="/cart" aria-label={`Shopping cart with ${count} items`}>
          <Button
            variant={variant}
            size={size}
            className={`relative ${className}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span
                className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white transition-transform ${
                  isAnimating ? "scale-125" : "scale-100"
                }`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Button>
        </Link>
      )}

      {/* Mini Cart Dropdown */}
      {showMiniCart && miniCartOpen && cart && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setMiniCartOpen(false)}
          />

          {/* Mini cart panel */}
          <div className="absolute right-0 z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-lg border bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="font-semibold text-gray-900">Shopping Cart</h3>
                <p className="text-sm text-gray-500">
                  {count} {count === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={() => setMiniCartOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
                aria-label="Close mini cart"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-96 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
                </div>
              ) : cart.items.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <ShoppingCart className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.items.slice(0, 5).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                    >
                      {/* Product Image */}
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 text-2xl">
                          🌾
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {item.product.farm.name}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity.toString()}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(
                              Number(item.priceAtAdd) * Number(item.quantity),
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={async () => {
                          await removeFromCart(item.id);
                          if (cart.items.length <= 1) {
                            setMiniCartOpen(false);
                          }
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Show more indicator */}
                  {cart.items.length > 5 && (
                    <p className="text-center text-sm text-gray-500">
                      + {cart.items.length - 5} more items
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t p-4">
                {/* Subtotal */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(cart.subtotal)}
                  </span>
                </div>

                {/* Tax & Delivery notice */}
                <p className="mb-3 text-xs text-gray-500">
                  Tax and delivery calculated at checkout
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    className="block"
                    onClick={() => setMiniCartOpen(false)}
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link
                    href="/cart"
                    className="block"
                    onClick={() => setMiniCartOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      View Full Cart
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT CART BADGE (for mobile/minimal display)
// ============================================================================

export function CompactCartBadge({
  userId,
  className = "",
}: {
  userId?: string;
  className?: string;
}) {
  const { count } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count]);

  return (
    <Link href="/cart" className={`relative inline-block ${className}`}>
      <ShoppingCart className="h-6 w-6 text-gray-700" />
      {count > 0 && (
        <span
          className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white transition-transform ${
            isAnimating ? "scale-125" : "scale-100"
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
