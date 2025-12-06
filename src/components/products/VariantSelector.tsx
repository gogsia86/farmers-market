/**
 * VARIANT SELECTOR COMPONENT
 * Divine product variant selection for agricultural products
 * Features: Quantity stepper, unit selection, stock validation
 */

"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface ProductVariant {
  id: string;
  name: string;
  unit: string;
  price: number;
  availableQuantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  stepQuantity?: number;
}

interface VariantSelectorProps {
  variants?: ProductVariant[];
  defaultQuantity?: number;
  availableQuantity: number;
  unit: string;
  price: number;
  minQuantity?: number;
  maxQuantity?: number;
  stepQuantity?: number;
  onQuantityChange: (quantity: number) => void;
  onVariantChange?: (variantId: string) => void;
  className?: string;
  disabled?: boolean;
}

// ============================================
// VARIANT SELECTOR COMPONENT
// ============================================

export function VariantSelector({
  variants,
  defaultQuantity = 1,
  availableQuantity,
  unit,
  price,
  minQuantity = 1,
  maxQuantity,
  stepQuantity = 1,
  onQuantityChange,
  onVariantChange,
  className,
  disabled = false,
}: VariantSelectorProps) {
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants?.[0]?.id || null,
  );

  // Calculate effective max quantity
  const effectiveMaxQuantity = maxQuantity
    ? Math.min(maxQuantity, availableQuantity)
    : availableQuantity;

  // Update parent when quantity changes
  useEffect(() => {
    onQuantityChange(quantity);
  }, [quantity, onQuantityChange]);

  // Handle quantity increment
  const handleIncrement = () => {
    if (disabled) return;

    const newQuantity = quantity + stepQuantity;
    if (newQuantity <= effectiveMaxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Handle quantity decrement
  const handleDecrement = () => {
    if (disabled) return;

    const newQuantity = quantity - stepQuantity;
    if (newQuantity >= minQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Handle direct input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const value = e.target.value;

    // Allow empty string for editing
    if (value === "") {
      return;
    }

    const numValue = parseFloat(value);

    // Validate number
    if (isNaN(numValue)) {
      return;
    }

    // Clamp to valid range
    const clampedValue = Math.max(
      minQuantity,
      Math.min(effectiveMaxQuantity, numValue),
    );

    setQuantity(clampedValue);
  };

  // Handle input blur (reset to min if empty)
  const handleInputBlur = () => {
    if (quantity < minQuantity || isNaN(quantity)) {
      setQuantity(minQuantity);
    }
  };

  // Handle variant selection
  const handleVariantSelect = (variantId: string) => {
    if (disabled) return;

    setSelectedVariantId(variantId);

    const selectedVariant = variants?.find((v) => v.id === variantId);
    if (selectedVariant && onVariantChange) {
      onVariantChange(variantId);

      // Reset quantity if current exceeds new variant's availability
      if (quantity > selectedVariant.availableQuantity) {
        setQuantity(
          Math.min(
            selectedVariant.availableQuantity,
            selectedVariant.minQuantity || 1,
          ),
        );
      }
    }
  };

  // Check if quantity is at limits
  const isAtMinimum = quantity <= minQuantity;
  const isAtMaximum = quantity >= effectiveMaxQuantity;

  // Stock status
  const isLowStock = availableQuantity > 0 && availableQuantity <= 10;
  const isOutOfStock = availableQuantity <= 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Variant Options (if variants exist) */}
      {variants && variants.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Option
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              const isVariantOutOfStock = variant.availableQuantity <= 0;

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => handleVariantSelect(variant.id)}
                  disabled={disabled || isVariantOutOfStock}
                  className={cn(
                    "relative rounded-lg border-2 p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                    isSelected
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-gray-300",
                    isVariantOutOfStock &&
                      "cursor-not-allowed opacity-50 line-through",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Select ${variant.name}`}
                >
                  <div className="font-medium text-gray-900">
                    {variant.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    ${variant.price.toFixed(2)} / {variant.unit}
                  </div>
                  {isVariantOutOfStock && (
                    <div className="mt-1 text-xs font-medium text-red-600">
                      Out of Stock
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label
          htmlFor="quantity-input"
          className="text-sm font-medium text-gray-700"
        >
          Quantity
        </label>

        <div className="flex items-center gap-3">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || isAtMinimum || isOutOfStock}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-green-500",
              isAtMinimum || disabled || isOutOfStock
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-300 bg-white text-gray-700 hover:border-green-500 hover:text-green-600",
            )}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>

          {/* Quantity Input */}
          <div className="relative flex-1">
            <input
              id="quantity-input"
              type="number"
              value={quantity}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={disabled || isOutOfStock}
              min={minQuantity}
              max={effectiveMaxQuantity}
              step={stepQuantity}
              className={cn(
                "h-10 w-full rounded-lg border-2 border-gray-300 bg-white px-4 text-center text-lg font-medium text-gray-900 transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500",
                (disabled || isOutOfStock) &&
                  "cursor-not-allowed bg-gray-100 text-gray-500",
              )}
              aria-label="Product quantity"
              aria-valuemin={minQuantity}
              aria-valuemax={effectiveMaxQuantity}
              aria-valuenow={quantity}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {unit}
            </div>
          </div>

          {/* Increment Button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || isAtMaximum || isOutOfStock}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-green-500",
              isAtMaximum || disabled || isOutOfStock
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-300 bg-white text-gray-700 hover:border-green-500 hover:text-green-600",
            )}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Stock Status Indicators */}
        <div className="space-y-1">
          {isOutOfStock && (
            <p className="text-sm font-medium text-red-600" role="alert">
              ⚠️ Out of Stock
            </p>
          )}

          {!isOutOfStock && isLowStock && (
            <p className="text-sm font-medium text-orange-600" role="status">
              ⚡ Only {availableQuantity} {unit} left in stock!
            </p>
          )}

          {!isOutOfStock && !isLowStock && (
            <p className="text-sm text-gray-500">
              {availableQuantity} {unit} available
            </p>
          )}

          {/* Quantity Limits Info */}
          {(minQuantity > 1 || maxQuantity) && (
            <p className="text-xs text-gray-500">
              {minQuantity > 1 && `Min: ${minQuantity} ${unit}`}
              {minQuantity > 1 && maxQuantity && " • "}
              {maxQuantity && `Max: ${maxQuantity} ${unit}`}
            </p>
          )}
        </div>

        {/* Total Price Display */}
        <div className="rounded-lg bg-green-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Subtotal:</span>
            <span className="text-lg font-bold text-green-700">
              ${(price * quantity).toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-600">
            ${price.toFixed(2)} × {quantity} {unit}
          </p>
        </div>
      </div>
    </div>
  );
}
