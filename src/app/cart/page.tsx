"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  ArrowRight,
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";

/**
 * 🛒 SHOPPING CART PAGE - Fall Harvest Theme
 * Manage cart items and proceed to checkout
 */

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  unit?: string;
  quantity: number;
  farm?: string;
  organic?: boolean;
  image?: string;
}

export default function CartPage() {
  const {
    items: cartItems,
    updateQuantity,
    removeItem,
    getTotalPrice,
  } = useCartStore();

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  // Group items by farm (with fallback for items without farm info)
  const itemsByFarm = cartItems.reduce(
    (acc: Record<string, CartItem[]>, item: CartItem) => {
      const farmName = item.farm || "Unknown Farm";
      if (!acc[farmName]) {
        acc[farmName] = [];
      }
      acc[farmName]!.push(item);
      return acc;
    },
    {} as Record<string, CartItem[]>,
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
              </p>
            </div>

            {cartItems.length === 0 ? (
              /* Empty Cart */
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Your Cart is Empty
                </h2>
                <p className="text-muted-foreground mb-6">
                  Start adding some fresh products from local farms!
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                  {Object.entries(itemsByFarm).map(([farmName, items]) => (
                    <div key={farmName} className="glass-card rounded-2xl p-6">
                      {/* Farm Header */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-xl">🌾</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {farmName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {(items as CartItem[]).length}{" "}
                            {(items as CartItem[]).length === 1
                              ? "product"
                              : "products"}
                          </p>
                        </div>
                      </div>

                      {/* Farm Items */}
                      <div className="space-y-4">
                        {(items as CartItem[]).map((item: CartItem) => (
                          <div
                            key={item.id}
                            data-testid="cart-item"
                            className="flex gap-4 p-4 rounded-xl hover:bg-accent-900/10 transition-colors"
                          >
                            {/* Product Image */}
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-900 to-secondary-900 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                              <span className="text-3xl">🍎</span>
                              {item.organic && (
                                <div className="absolute top-1 right-1">
                                  <div className="bg-accent-600 p-1 rounded-full">
                                    <Leaf className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${item.productId}`}
                                className="font-semibold text-foreground hover:text-primary-600 transition-colors block mb-1"
                              >
                                {item.name}
                              </Link>
                              <p className="text-sm text-muted-foreground mb-3">
                                ${item.price.toFixed(2)} per {item.unit}
                              </p>

                              <div className="flex items-center gap-4">
                                {/* Quantity Controls */}
                                <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                    className="p-2 hover:bg-accent-900/10 transition-colors"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="px-4 font-semibold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                    className="p-2 hover:bg-accent-900/10 transition-colors"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 text-sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </button>
                              </div>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <div className="text-lg font-bold text-foreground">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
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

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="glass-card rounded-2xl p-6 sticky top-24">
                    <h2 className="text-xl font-bold text-foreground mb-6">
                      Order Summary
                    </h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span className="text-accent-600 font-medium">
                          Pickup
                        </span>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between text-lg font-bold text-foreground">
                          <span>Total</span>
                          <span className="text-gradient-warm">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Link
                      href="/checkout"
                      className="w-full bg-primary-600 hover:bg-primary-500 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-5 w-5" />
                    </Link>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-border space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="w-8 h-8 bg-accent-900/20 rounded-full flex items-center justify-center">
                          <span className="text-lg">✅</span>
                        </div>
                        <span>Secure checkout</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="w-8 h-8 bg-accent-900/20 rounded-full flex items-center justify-center">
                          <span className="text-lg">🌾</span>
                        </div>
                        <span>Fresh from local farms</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="w-8 h-8 bg-accent-900/20 rounded-full flex items-center justify-center">
                          <span className="text-lg">📦</span>
                        </div>
                        <span>Easy pickup scheduling</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
