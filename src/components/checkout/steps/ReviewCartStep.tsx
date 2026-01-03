/**
 * 🛒 REVIEW CART STEP - Step 1 of Checkout
 * Divine cart review with inline editing and validation
 *
 * Features:
 * - Display all cart items grouped by farm
 * - Inline quantity editing
 * - Remove items option
 * - Stock validation warnings
 * - Pricing summary
 * - Agricultural consciousness (organic, seasonal badges)
 * - Mobile-responsive design
 * - WCAG 2.1 AA accessibility
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

"use client";

import { cn } from "@/lib/utils";
import { cartLogger } from "@/lib/utils/logger";
import { useCartStore } from "@/stores/cartStore";
import {
  AlertTriangle,
  Calendar,
  Leaf,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CheckoutStepProps } from "../CheckoutWizard";

// ============================================================================
// TYPES
// ============================================================================

interface CartItemDisplay {
  id: string;
  productId: string;
  productName: string;
  farmId: string;
  farmName: string;
  quantity: number;
  unit: string;
  price: number;
  imageUrl?: string;
  organic?: boolean;
  seasonal?: boolean;
  availableQuantity: number;
  notes?: string;
}

// ============================================================================
// REVIEW CART STEP COMPONENT
// ============================================================================

export function ReviewCartStep({
  onNext,
  onBack,
  onUpdateData,
  checkoutData,
  isLoading,
}: CheckoutStepProps) {
  const cartStore = useCartStore();
  const [items, setItems] = useState<CartItemDisplay[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

  // Load cart items on mount
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const response = await fetch("/api/cart");
        const data = await response.json();

        if (data.success && data.data) {
          const formattedItems = data.data.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productName:
              item.productName || item.product?.name || "Unknown Product",
            farmId: item.farmId,
            farmName: item.farmName || item.farm?.name || "Unknown Farm",
            quantity: item.quantity,
            unit: item.unit,
            price: Number(item.priceAtAdd || item.price),
            imageUrl: item.product?.primaryPhotoUrl || item.imageUrl,
            organic: item.product?.organic,
            seasonal: item.product?.seasonal,
            availableQuantity: item.product?.quantityAvailable || 0,
            notes: item.notes,
          }));

          setItems(formattedItems);

          // Check for stock issues
          const warnings: string[] = [];
          formattedItems.forEach((item: CartItemDisplay) => {
            if (item.quantity > item.availableQuantity) {
              warnings.push(
                `${item.productName}: Only ${item.availableQuantity} ${item.unit} available`,
              );
            }
          });
          setStockWarnings(warnings);

          // Update checkout data
          onUpdateData({
            cartSummary: {
              items: formattedItems,
              subtotal: data.data.subtotal,
              tax: data.data.tax,
              deliveryFee: data.data.deliveryFee || 0,
              total: data.data.total,
              itemCount: formattedItems.length,
            },
          });
        }
      } catch (error) {
        cartLogger.error("Error loading cart items", error instanceof Error ? error : new Error(String(error)));
      }
    };

    loadCartItems();
  }, [onUpdateData]);

  // Update item quantity
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item,
          ),
        );

        // Update cart store
        cartStore.updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      cartLogger.error("Error updating quantity", error instanceof Error ? error : new Error(String(error)), {
        itemId,
        newQuantity,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setItems((prev) => prev.filter((item) => item.id !== itemId));

        // Update cart store
        cartStore.removeItem(itemId);
      }
    } catch (error) {
      cartLogger.error("Error removing item", error instanceof Error ? error : new Error(String(error)), {
        itemId,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Group items by farm
  const itemsByFarm = items.reduce(
    (acc, item) => {
      if (!acc[item.farmId]) {
        acc[item.farmId] = {
          farmId: item.farmId,
          farmName: item.farmName,
          items: [],
        };
      }
      const farmGroup = acc[item.farmId];
      if (farmGroup) {
        farmGroup.items.push(item);
      }
      return acc;
    },
    {} as Record<
      string,
      { farmId: string; farmName: string; items: CartItemDisplay[] }
    >,
  );

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const hasItems = items.length > 0;
  const hasStockIssues = stockWarnings.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Cart
        </h2>
        <p className="text-gray-600">
          Check your items before proceeding to delivery details
        </p>
      </div>

      {/* Stock Warnings */}
      {hasStockIssues && (
        <div
          className="rounded-lg bg-orange-50 border border-orange-200 p-4"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-orange-900 mb-1">
                Stock Availability Issues
              </h3>
              <ul className="text-sm text-orange-800 space-y-1">
                {stockWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
              <p className="text-sm text-orange-700 mt-2">
                Please adjust quantities before continuing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty Cart State */}
      {!hasItems && (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-600 mb-6">
            Add some fresh products from our farms to get started!
          </p>
          <Link
            href="/marketplace/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* Cart Items by Farm */}
      {hasItems && (
        <div className="space-y-6">
          {Object.values(itemsByFarm).map((farmGroup) => (
            <div
              key={farmGroup.farmId}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Farm Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">
                    {farmGroup.farmName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({farmGroup.items.length} items)
                  </span>
                </div>
              </div>

              {/* Farm Items */}
              <div className="divide-y divide-gray-200">
                {farmGroup.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.productName}
                            </h4>

                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-2">
                              {item.organic && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                                  <Leaf className="w-3 h-3" />
                                  Organic
                                </span>
                              )}
                              {item.seasonal && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full px-2 py-0.5">
                                  <Calendar className="w-3 h-3" />
                                  Seasonal
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} / {item.unit}
                            </div>

                            {/* Notes */}
                            {item.notes && (
                              <div className="mt-2 text-sm text-gray-500 italic">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>

                          {/* Price & Remove */}
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 mb-2">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 ml-auto"
                              aria-label={`Remove ${item.productName}`}
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || isUpdating}
                              className={cn(
                                "w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center",
                                "hover:bg-gray-100 transition-colors",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                              )}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <div className="w-12 text-center">
                              <span className="font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <span className="text-xs text-gray-500 block">
                                {item.unit}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={
                                item.quantity >= item.availableQuantity ||
                                isUpdating
                              }
                              className={cn(
                                "w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center",
                                "hover:bg-gray-100 transition-colors",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                              )}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Stock Indicator */}
                          <div className="text-xs text-gray-500">
                            {item.availableQuantity > 0 ? (
                              <span>
                                {item.availableQuantity} {item.unit} available
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                Out of stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Summary */}
      {hasItems && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8%)</span>
            <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900">
                Total
              </span>
              <span className="text-xl font-bold text-green-600">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center pt-2">
            Delivery fee will be calculated in the next step
          </div>
        </div>
      )}

      {/* Continue Shopping Link */}
      {hasItems && (
        <div className="text-center">
          <Link
            href="/marketplace/products"
            className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center gap-2"
          >
            ← Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
