/**
 * 🛒 CART PAGE CLIENT COMPONENT
 * Interactive cart UI with state management for updates/removes
 *
 * Features:
 * - Real-time cart updates via API
 * - Optimistic UI updates
 * - Error handling with user feedback
 * - Empty cart state
 * - Grouped items by farm
 * - Continue shopping link
 * - Full accessibility
 * - Agricultural consciousness
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { CartItemCard } from "./CartItemCard";
import { CartSummary } from "./CartSummary";
import type {
  CartSummary as CartSummaryData,
  CartItemData,
} from "@/lib/services/cart.service";

interface CartPageClientProps {
  initialCartSummary: CartSummaryData | null;
  userId?: string;
  error?: string | null;
}

export function CartPageClient({
  initialCartSummary,
  userId,
  error: initialError,
}: CartPageClientProps) {
  const [cartSummary, setCartSummary] = useState(initialCartSummary);
  const [error, setError] = useState(initialError);
  const [isLoading, _setIsLoading] = useState(false);

  // Refresh cart from API
  const refreshCart = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (data.success) {
        setCartSummary(data.data);
        setError(null);
      } else {
        setError(data.error?.message || "Failed to refresh cart");
      }
    } catch (err) {
      console.error("Error refreshing cart:", err);
      setError("Failed to refresh cart. Please reload the page.");
    }
  }, [userId]);

  // Update cart item quantity
  const handleUpdateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!userId || !cartSummary) return;

      // Optimistic update
      const previousSummary = { ...cartSummary };
      const updatedItems = cartSummary.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      );

      // Recalculate totals
      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const tax = subtotal * 0.08;
      const deliveryFee = cartSummary.deliveryFee; // Keep same for now
      const total = subtotal + tax + deliveryFee;
      const itemCount = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      setCartSummary({
        ...cartSummary,
        items: updatedItems,
        subtotal,
        tax,
        total,
        itemCount,
      });

      try {
        const response = await fetch(`/api/cart/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        });

        const data = await response.json();

        if (!data.success) {
          // Revert on error
          setCartSummary(previousSummary);
          setError(data.error?.message || "Failed to update quantity");
        } else {
          // Refresh to get accurate totals
          await refreshCart();
        }
      } catch (err) {
        // Revert on error
        setCartSummary(previousSummary);
        setError("Failed to update quantity. Please try again.");
        console.error("Error updating quantity:", err);
      }
    },
    [userId, cartSummary, refreshCart],
  );

  // Remove cart item
  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      if (!userId || !cartSummary) return;

      // Optimistic update
      const previousSummary = { ...cartSummary };
      const updatedItems = cartSummary.items.filter(
        (item) => item.id !== itemId,
      );

      // Recalculate totals
      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const tax = subtotal * 0.08;
      const deliveryFee =
        updatedItems.length === 0 ? 0 : cartSummary.deliveryFee;
      const total = subtotal + tax + deliveryFee;
      const itemCount = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const farmCount = new Set(updatedItems.map((item) => item.farmId)).size;

      setCartSummary({
        ...cartSummary,
        items: updatedItems,
        subtotal,
        tax,
        deliveryFee,
        total,
        itemCount,
        farmCount,
      });

      try {
        const response = await fetch(`/api/cart/${itemId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!data.success) {
          // Revert on error
          setCartSummary(previousSummary);
          setError(data.error?.message || "Failed to remove item");
        } else {
          // Refresh to get accurate totals
          await refreshCart();
        }
      } catch (err) {
        // Revert on error
        setCartSummary(previousSummary);
        setError("Failed to remove item. Please try again.");
        console.error("Error removing item:", err);
      }
    },
    [userId, cartSummary, refreshCart],
  );

  // Group items by farm
  const itemsByFarm =
    cartSummary?.items.reduce(
      (acc, item) => {
        const farmKey = item.farmId;
        const farmName = item.farmName || "Unknown Farm";

        if (!acc[farmKey]) {
          acc[farmKey] = {
            farmId: item.farmId,
            farmName,
            items: [],
          };
        }

        acc[farmKey].items.push(item);
        return acc;
      },
      {} as Record<
        string,
        { farmId: string; farmName: string; items: CartItemData[] }
      >,
    ) || {};

  const isEmpty = !cartSummary || cartSummary.items.length === 0;

  // Require authentication
  if (!userId) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Sign In Required
              </h1>
              <p className="text-muted-foreground mb-6">
                Please sign in to view your shopping cart and checkout.
              </p>
              <Link
                href="/auth/login?callbackUrl=/cart"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Skip to content link for accessibility */}
          <a
            href="#cart-items"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50"
          >
            Skip to cart items
          </a>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground">
              {cartSummary?.itemCount || 0}{" "}
              {cartSummary?.itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle
                className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Error
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Empty Cart State */}
          {isEmpty ? (
            <div
              className="glass-card rounded-2xl p-12 text-center"
              id="cart-items"
            >
              <div className="text-6xl mb-4" role="img" aria-label="Empty cart">
                🛒
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Your Cart is Empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Start adding some fresh products from local farms!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6" id="cart-items">
                {Object.values(itemsByFarm).map((farmGroup) => (
                  <div
                    key={farmGroup.farmId}
                    className="glass-card rounded-2xl p-6"
                  >
                    {/* Farm Header */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-xl" role="img" aria-label="Farm">
                          🌾
                        </span>
                      </div>
                      <div>
                        <Link
                          href={`/farms/${farmGroup.farmId}`}
                          className="font-semibold text-foreground hover:text-primary-600 transition-colors"
                        >
                          {farmGroup.farmName}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {farmGroup.items.length}{" "}
                          {farmGroup.items.length === 1
                            ? "product"
                            : "products"}
                        </p>
                      </div>
                    </div>

                    {/* Farm Items */}
                    <div className="space-y-4">
                      {farmGroup.items.map((item) => (
                        <CartItemCard
                          key={item.id}
                          item={item}
                          onUpdateQuantity={handleUpdateQuantity}
                          onRemove={handleRemoveItem}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Continue Shopping */}
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 font-medium transition-colors"
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                {cartSummary && (
                  <CartSummary
                    summary={cartSummary}
                    checkoutHref="/checkout"
                    showPromoCode={false}
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
