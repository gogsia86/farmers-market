/**
 * @file CartItem.tsx
 * @description Individual cart item component with product details and controls
 *
 * Features:
 * - Product image and details display
 * - Quantity controls (increment/decrement)
 * - Price display and subtotal
 * - Remove item button
 * - Notes/special instructions
 * - Stock availability indicator
 * - Optimistic UI updates
 * - Mobile responsive
 * - Accessibility compliant
 *
 * @module components/features/cart/CartItem
 */

"use client";

import type { CartItem as CartItemType } from "@/lib/stores/cart.store";
import { useCartActions } from "@/lib/stores/cart.store";
import { cartLogger } from "@/lib/utils/logger";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CartItemProps {
  /**
   * Cart item data
   */
  item: CartItemType;

  /**
   * Whether to show farm name
   * @default true
   */
  showFarm?: boolean;

  /**
   * Whether to show notes field
   * @default false
   */
  showNotes?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Callback when item is removed
   */
  onRemove?: (itemId: string) => void;

  /**
   * Callback when quantity changes
   */
  onQuantityChange?: (itemId: string, quantity: number) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Cart item component with product details and controls
 *
 * @example
 * ```tsx
 * import { CartItem } from '@/components/features/cart/CartItem';
 *
 * function CartList({ items }) {
 *   return (
 *     <div className="space-y-4">
 *       {items.map((item) => (
 *         <CartItem key={item.id} item={item} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function CartItem({
  item,
  showFarm = true,
  showNotes = false,
  className = "",
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  const { updateQuantity, removeItem, updateNotes } = useCartActions();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotesField, setShowNotesField] = useState(false);
  const [notes, setNotes] = useState(item.notes || "");

  /**
   * Handle quantity change with optimistic update
   */
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }

    if (newQuantity > (item.maxQuantity || 999)) {
      return; // Don't exceed max
    }

    setLocalQuantity(newQuantity);
    setIsUpdating(true);

    try {
      await updateQuantity(item.id, newQuantity);
      if (onQuantityChange) {
        onQuantityChange(item.id, newQuantity);
      }
    } catch (error) {
      // Revert on error
      setLocalQuantity(item.quantity);
      cartLogger.error("Failed to update quantity", error instanceof Error ? error : new Error(String(error)), {
        itemId: item.id,
        productId: item.productId,
        newQuantity,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle item removal
   */
  const handleRemove = async () => {
    setIsUpdating(true);

    try {
      await removeItem(item.id);
      if (onRemove) {
        onRemove(item.id);
      }
    } catch (error) {
      setIsUpdating(false);
      cartLogger.error("Failed to remove item", error instanceof Error ? error : new Error(String(error)), {
        itemId: item.id,
        productId: item.productId,
      });
    }
  };

  /**
   * Handle notes update
   */
  const handleNotesBlur = async () => {
    if (notes !== item.notes) {
      try {
        await updateNotes(item.id, notes);
      } catch (error) {
        cartLogger.error("Failed to update notes", error instanceof Error ? error : new Error(String(error)), {
          itemId: item.id,
        });
      }
    }
  };

  /**
   * Format price for display
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Calculate subtotal
  const subtotal = localQuantity * item.unitPrice;

  return (
    <div
      className={`
        relative
        bg-white
        border border-gray-200 rounded-lg
        p-4
        transition-opacity duration-200
        ${isUpdating ? "opacity-50" : "opacity-100"}
        ${className}
      `}
      data-testid="cart-item"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Organic Badge */}
          {item.organic && (
            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
              Organic
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col">
          <div className="flex justify-between">
            <div className="flex-1">
              {/* Product Name */}
              <Link
                href={`/products/${item.productId}`}
                className="text-base font-semibold text-gray-900 hover:text-green-600 transition-colors"
              >
                {item.productName}
              </Link>

              {/* Farm Name */}
              {showFarm && item.farmName && (
                <Link
                  href={`/farms/${item.farmId}`}
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  from {item.farmName}
                </Link>
              )}

              {/* Variant */}
              {item.variantName && (
                <p className="text-sm text-gray-500">{item.variantName}</p>
              )}

              {/* Stock Status */}
              <div className="mt-1 flex items-center gap-2">
                {item.availability === "OUT_OF_STOCK" && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    Out of Stock
                  </span>
                )}
                {item.availability === "LOW_STOCK" && (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    Low Stock
                  </span>
                )}
                {item.availability === "IN_STOCK" && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUpdating}
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              aria-label="Remove item"
              data-testid="remove-item-button"
            >
              <TrashIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Quantity and Price Controls */}
          <div className="mt-4 flex items-end justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <label htmlFor={`quantity-${item.id}`} className="sr-only">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                {/* Decrement Button */}
                <button
                  type="button"
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  disabled={isUpdating || localQuantity <= 1}
                  className="
                    p-2
                    text-gray-600 hover:text-gray-900
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                  aria-label="Decrease quantity"
                  data-testid="decrease-quantity"
                >
                  <MinusIcon className="h-4 w-4" aria-hidden="true" />
                </button>

                {/* Quantity Input */}
                <input
                  type="number"
                  id={`quantity-${item.id}`}
                  min="1"
                  max={item.maxQuantity || 999}
                  value={localQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0) {
                      handleQuantityChange(value);
                    }
                  }}
                  disabled={isUpdating}
                  className="
                    w-16
                    border-0
                    text-center
                    text-gray-900
                    focus:ring-0
                    disabled:opacity-50
                  "
                  data-testid="quantity-input"
                />

                {/* Increment Button */}
                <button
                  type="button"
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  disabled={
                    isUpdating ||
                    (item.maxQuantity !== undefined &&
                      localQuantity >= item.maxQuantity)
                  }
                  className="
                    p-2
                    text-gray-600 hover:text-gray-900
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                  aria-label="Increase quantity"
                  data-testid="increase-quantity"
                >
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <span className="text-sm text-gray-500">× {item.unit}</span>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {formatPrice(item.unitPrice)} / {item.unit}
              </div>
              <div className="text-base font-semibold text-gray-900">
                {formatPrice(subtotal)}
              </div>
            </div>
          </div>

          {/* Notes Field */}
          {(showNotes || showNotesField) && (
            <div className="mt-3">
              <label
                htmlFor={`notes-${item.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Special Instructions
              </label>
              <textarea
                id={`notes-${item.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
                rows={2}
                placeholder="Any special requests? (optional)"
                className="
                  block w-full
                  rounded-md
                  border-gray-300
                  shadow-sm
                  text-sm
                  focus:border-green-500 focus:ring-green-500
                "
                data-testid="item-notes"
              />
            </div>
          )}

          {/* Add Notes Button */}
          {!showNotes && !showNotesField && (
            <button
              type="button"
              onClick={() => setShowNotesField(true)}
              className="mt-2 text-sm text-green-600 hover:text-green-700"
            >
              Add special instructions
            </button>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Compact Cart Item Variant
// ============================================================================

/**
 * Compact cart item for smaller displays or summaries
 */
export function CompactCartItem({ item }: { item: CartItemType }) {
  const { removeItem } = useCartActions();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div
      className="flex items-center gap-3 py-2"
      data-testid="compact-cart-item"
    >
      {/* Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
        {item.productImage ? (
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {item.productName}
        </p>
        <p className="text-sm text-gray-500">
          {item.quantity} × {formatPrice(item.unitPrice)}
        </p>
      </div>

      {/* Subtotal */}
      <div className="text-sm font-semibold text-gray-900">
        {formatPrice(item.subtotal)}
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className="text-gray-400 hover:text-red-500"
        aria-label="Remove item"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
