"use client";

/**
 * 🛒 CART REVIEW STEP - Checkout Flow Step 1
 * Review cart items, quantities, and initial order preview
 *
 * Features:
 * - Cart item listing with farm grouping
 * - Quantity adjustment
 * - Item removal
 * - Stock validation display
 * - Order preview calculation
 * - Agricultural consciousness UI
 */

import { cartLogger } from "@/lib/utils/logger";
import { useCheckoutStore } from "@/stores/checkoutStore";
import {
  AlertCircle,
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
  farmName: string;
  farmId: string;
  organic?: boolean;
  inStock: boolean;
  maxQuantity?: number;
}

// ============================================================================
// CART REVIEW STEP COMPONENT
// ============================================================================

export function CartReviewStep() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const setOrderPreview = useCheckoutStore((state) => state.setOrderPreview);

  // Fetch cart items on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/cart");
        const data = await response.json();

        if (data.success) {
          // Transform cart data to match our interface
          const items: CartItem[] = data.cart.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit || "unit",
            image: item.image,
            farmName: item.farmName || "Local Farm",
            farmId: item.farmId,
            organic: item.organic,
            inStock: item.inStock,
            maxQuantity: item.maxQuantity,
          }));

          setCartItems(items);

          // Set order preview
          setOrderPreview({
            subtotal: data.cart.subtotal,
            deliveryFee: data.cart.deliveryFee,
            tax: data.cart.tax,
            platformFee: data.cart.platformFee || 0,
            discount: 0,
            total: data.cart.total,
            farmerAmount: 0,
            itemCount: data.cart.itemCount,
            farmCount: data.cart.farmCount,
            items: [],
          });
        }
      } catch (error) {
        cartLogger.error(
          "Failed to fetch cart",
          error instanceof Error ? error : new Error(String(error)),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [setOrderPreview]);

  // Handle quantity update
  const handleUpdateQuantity = async (
    cartItemId: string,
    newQuantity: number,
  ) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity: newQuantity } : item,
          ),
        );

        // Refresh cart totals
        await refreshCartTotals();
      }
    } catch (error) {
      cartLogger.error(
        "Failed to update quantity",
        error instanceof Error ? error : new Error(String(error)),
        {
          cartItemId,
          newQuantity,
        },
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (cartItemId: string) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));

        // Refresh cart totals
        await refreshCartTotals();
      }
    } catch (error) {
      cartLogger.error(
        "Failed to remove item",
        error instanceof Error ? error : new Error(String(error)),
        {
          cartItemId,
        },
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Refresh cart totals
  const refreshCartTotals = async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (data.success) {
        setOrderPreview({
          subtotal: data.cart.subtotal,
          deliveryFee: data.cart.deliveryFee,
          tax: data.cart.tax,
          platformFee: data.cart.platformFee || 0,
          discount: 0,
          total: data.cart.total,
          farmerAmount: 0,
          itemCount: data.cart.itemCount,
          farmCount: data.cart.farmCount,
          items: [],
        });
      }
    } catch (error) {
      cartLogger.error(
        "Failed to refresh cart totals",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  // Group items by farm
  const itemsByFarm = cartItems.reduce<Record<string, CartItem[]>>(
    (acc, item) => {
      if (!acc[item.farmId]) {
        acc[item.farmId] = [];
      }
      acc[item.farmId]!.push(item);
      return acc;
    },
    {},
  );

  if (isLoading) {
    return <CartReviewSkeleton />;
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="space-y-6">
      {/* Cart Items by Farm */}
      {Object.entries(itemsByFarm).map(([farmId, items]) => {
        if (items.length === 0) return null;

        const firstItem = items[0];
        if (!firstItem) return null;

        return (
          <div
            key={farmId}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Farm Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">
                  {firstItem.farmName}
                </h3>
                {firstItem.organic && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    Organic
                  </span>
                )}
              </div>
            </div>

            {/* Farm Items */}
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  disabled={isUpdating}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Before you continue:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Review your items and quantities</li>
              <li>Check stock availability</li>
              <li>Ensure all items are from farms you want to order from</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CART ITEM ROW COMPONENT
// ============================================================================

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemove: (cartItemId: string) => void;
  disabled?: boolean;
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  disabled,
}: CartItemRowProps) {
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (!item.maxQuantity || item.quantity < item.maxQuantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-1 truncate">
            {item.name}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            ${item.price.toFixed(2)} per {item.unit}
          </p>

          {/* Stock Status */}
          {!item.inStock && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>Out of stock</span>
            </div>
          )}
          {item.inStock &&
            item.maxQuantity &&
            item.quantity >= item.maxQuantity && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span>Max quantity reached</span>
              </div>
            )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={handleDecrement}
              disabled={disabled || item.quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <span className="px-4 font-medium text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={
                disabled ||
                !item.inStock ||
                (item.maxQuantity !== undefined &&
                  item.quantity >= item.maxQuantity)
              }
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Subtotal */}
          <div className="w-24 text-right">
            <p className="font-semibold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY CART COMPONENT
// ============================================================================

function EmptyCart() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h3>
      <p className="text-gray-600 mb-6">
        Add some delicious products from local farms!
      </p>
      <Link
        href="/marketplace/products"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transition-all"
      >
        Browse Products
      </Link>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function CartReviewSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2].map((j) => (
              <div key={j} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
