/**
 * 🛒 CART ITEM CARD COMPONENT
 * Displays individual cart item with quantity controls and remove option
 *
 * Features:
 * - Product image with fallback
 * - Quantity stepper controls
 * - Remove item button
 * - Stock validation display
 * - Organic badge
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Agricultural consciousness
 */

"use client";

import type { CartItemData } from "@/lib/services/cart.service";
import { cartLogger } from "@/lib/utils/logger";
import { AlertCircle, Leaf, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CartItemCardProps {
  item: CartItemData;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  disabled?: boolean;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (isUpdating || disabled) return;

    // Validate quantity
    if (newQuantity < 0) return;
    if (item.maxQuantity && newQuantity > item.maxQuantity) {
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      cartLogger.error(
        "Error updating cart item quantity",
        error instanceof Error ? error : new Error(String(error)),
        {
          itemId: item.id,
          productId: item.productId,
          currentQuantity: item.quantity,
          newQuantity,
        },
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving || disabled) return;

    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      cartLogger.error(
        "Error removing cart item",
        error instanceof Error ? error : new Error(String(error)),
        {
          itemId: item.id,
          productId: item.productId,
        },
      );
      setIsRemoving(false);
    }
  };

  const itemTotal = item.price * item.quantity;
  const canIncrement = !item.maxQuantity || item.quantity < item.maxQuantity;
  const canDecrement = item.quantity > 1;

  return (
    <div
      data-testid="cart-item"
      className={`
        flex gap-4 p-4 rounded-xl transition-all
        ${isRemoving ? "opacity-50 pointer-events-none" : "hover:bg-accent/5"}
        ${!item.inStock ? "border-2 border-red-200 dark:border-red-900" : ""}
      `}
    >
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl" role="img" aria-label="Product">
              🥬
            </span>
          </div>
        )}

        {/* Organic Badge */}
        {item.organic && (
          <div className="absolute top-2 right-2" title="Certified Organic">
            <div className="bg-green-600 p-1.5 rounded-full shadow-lg">
              <Leaf className="h-3 w-3 text-white" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        {/* Product Name & Farm */}
        <div className="mb-2">
          <Link
            href={`/products/${item.productId}`}
            className="font-semibold text-foreground hover:text-primary-600 transition-colors block mb-1 truncate"
          >
            {item.name}
          </Link>
          {item.farmName && (
            <Link
              href={`/farms/${item.farmId}`}
              className="text-sm text-muted-foreground hover:text-primary-600 transition-colors inline-flex items-center gap-1"
            >
              <span role="img" aria-label="Farm">
                🌾
              </span>
              {item.farmName}
            </Link>
          )}
        </div>

        {/* Price per Unit */}
        <p className="text-sm text-muted-foreground mb-3">
          ${item.price.toFixed(2)} per {item.unit}
        </p>

        {/* Stock Warning */}
        {!item.inStock && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-3">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span>
              Only {item.maxQuantity} available - please adjust quantity
            </span>
          </div>
        )}

        {/* Quantity Controls & Remove Button */}
        <div className="flex items-center gap-4">
          {/* Quantity Stepper */}
          <div
            className="flex items-center border-2 border-border rounded-lg overflow-hidden"
            role="group"
            aria-label="Quantity controls"
          >
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={!canDecrement || isUpdating || disabled}
              className="p-2 hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
              type="button"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="px-4 py-2 min-w-[3rem] text-center">
              <span
                className="font-semibold"
                aria-label={`Quantity: ${item.quantity}`}
              >
                {item.quantity}
              </span>
            </div>

            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={!canIncrement || isUpdating || disabled}
              className="p-2 hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
              title={
                !canIncrement && item.maxQuantity
                  ? `Maximum ${item.maxQuantity} available`
                  : "Increase quantity"
              }
              type="button"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isRemoving || disabled}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Remove ${item.name} from cart`}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>

        {/* Loading State */}
        {isUpdating && (
          <p className="text-xs text-muted-foreground mt-2">Updating...</p>
        )}
      </div>

      {/* Item Total */}
      <div className="text-right flex-shrink-0">
        <div className="text-lg font-bold text-foreground">
          ${itemTotal.toFixed(2)}
        </div>
        {item.quantity > 1 && (
          <div className="text-xs text-muted-foreground">
            {item.quantity} × ${item.price.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
