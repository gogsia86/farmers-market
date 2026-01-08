"use client";

// 🛒 MINI CART - Divine Mini Cart Sidebar Component
// Slide-out cart sidebar for quick cart access throughout the site

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { ArrowRight, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

// ============================================================================
// MINI CART COMPONENT
// ============================================================================

export function MiniCart({ isOpen, onClose, userId }: MiniCartProps) {
  const [isMounted, setIsMounted] = useState(false);

  const {
    cart,
    count,
    isLoading,
    isEmpty,
    updateCartItem,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Close sidebar on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleViewCart = () => {
    onClose();
  };

  const handleCheckout = () => {
    onClose();
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full transform bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-96 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart
            </h2>
            {count > 0 && (
              <span className="ml-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                {count}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-64px)] flex-col">
          {isLoading ? (
            // Loading State
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
            </div>
          ) : isEmpty || !cart ? (
            // Empty State
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <div className="mb-4 rounded-full bg-gray-100 p-6">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Your cart is empty
              </h3>
              <p className="mb-6 text-center text-sm text-gray-600">
                Add some fresh, local products to get started!
              </p>
              <Link href="/products" onClick={onClose}>
                <Button className="bg-green-600 hover:bg-green-700">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            // Cart Items
            <>
              {/* Items List - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {cart.items.map((item) => {
                    const product = item.product;
                    const productImages = product.images as string[] | null;
                    const primaryImage: string = (
                      productImages && productImages.length > 0
                        ? productImages[0]
                        : "/images/placeholder-product.jpg"
                    ) || "/images/placeholder-product.jpg";
                    const itemTotal =
                      item.quantity.toNumber() * item.priceAtAdd.toNumber();

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md"
                      >
                        {/* Product Image */}
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={onClose}
                          className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100"
                        >
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={onClose}
                              className="line-clamp-1 text-sm font-medium text-gray-900 hover:text-green-600"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-gray-600">
                              {item.quantity.toNumber()} {item.unit} × $
                              {item.priceAtAdd.toNumber().toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">
                              ${itemTotal.toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer - Summary & Actions */}
              <div className="border-t bg-gray-50 px-6 py-4">
                {/* Subtotal */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ${cart.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-gray-900">
                      {cart.deliveryFee === 0
                        ? "FREE"
                        : `$${cart.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-green-600">
                      ${cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Free Delivery Notice */}
                {cart.deliveryFee > 0 && cart.subtotal < 50 && (
                  <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
                    Add ${(50 - cart.subtotal).toFixed(2)} more for free
                    delivery!
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link href="/checkout" onClick={handleCheckout}>
                    <Button
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/cart" onClick={handleViewCart}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      View Full Cart
                    </Button>
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-500">
                  <svg
                    className="h-3 w-3"
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
                  <span>Secure checkout</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
