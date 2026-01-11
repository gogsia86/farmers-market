"use client";

// 🛒 CART ITEM CARD - Divine Cart Item Display Component
// Displays individual cart items with quantum consciousness and agricultural awareness

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { CartItemWithProduct } from "@/lib/services/cart.service";
import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface CartItemCardProps {
  item: CartItemWithProduct;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  isUpdating?: boolean;
}

// ============================================================================
// CART ITEM CARD COMPONENT
// ============================================================================

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: CartItemCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity.toNumber());

  const product = item.product;
  const farm = product.farm;
  const priceAtAdd = item.priceAtAdd.toNumber();
  const currentPrice = product.price.toNumber();
  const availableStock = product.quantityAvailable?.toNumber() || 0;
  const itemTotal = quantity * priceAtAdd;

  // Check for price changes
  const priceChanged = Math.abs(currentPrice - priceAtAdd) > 0.01;
  const priceIncreased = currentPrice > priceAtAdd;

  // Check stock status
  const isOutOfStock = availableStock === 0;
  const isLowStock = availableStock < quantity;
  const hasStockWarning = isLowStock || isOutOfStock;

  // Get product image
  const productImages = product.images as string[] | null;
  const primaryImage: string =
    (productImages && productImages.length > 0
      ? productImages[0]
      : "/images/placeholder-product.jpg") || "/images/placeholder-product.jpg";

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity === quantity) return;
    if (newQuantity > availableStock) {
      return; // Don't update if exceeds stock
    }

    setIsLoading(true);
    setQuantity(newQuantity);

    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      // Revert on error
      setQuantity(quantity);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = () => {
    if (quantity < availableStock) {
      handleUpdateQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      handleUpdateQuantity(quantity - 1);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardBody className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link
            href={`/products/${product.slug}`}
            className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
          >
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
            {product.organic && (
              <div className="absolute left-1 top-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                Organic
              </div>
            )}
          </Link>

          {/* Product Info */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              {/* Product Name & Farm */}
              <div className="mb-1">
                <Link
                  href={`/products/${product.slug}`}
                  className="font-semibold text-gray-900 hover:text-green-600"
                >
                  {product.name}
                </Link>
                <Link
                  href={`/farms/${farm.slug}`}
                  className="ml-2 text-sm text-gray-600 hover:text-green-600"
                >
                  from {farm.name}
                </Link>
              </div>

              {/* Price & Stock Warnings */}
              <div className="space-y-1">
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    ${priceAtAdd.toFixed(2)} / {item.unit}
                  </span>
                  {priceChanged && (
                    <span
                      className={`text-xs ${
                        priceIncreased ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {priceIncreased ? "↑" : "↓"} ${currentPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock Warning */}
                {hasStockWarning && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    {isOutOfStock ? (
                      <span>Out of stock</span>
                    ) : (
                      <span>
                        Only {availableStock} {item.unit} available
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Controls & Remove */}
            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDecrement}
                  disabled={
                    quantity <= 1 || isLoading || isUpdating || isOutOfStock
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex h-8 w-12 items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-medium">
                  {quantity}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleIncrement}
                  disabled={
                    quantity >= availableStock ||
                    isLoading ||
                    isUpdating ||
                    isOutOfStock
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <span className="text-sm text-gray-600">{item.unit}</span>
              </div>

              {/* Item Total & Remove */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ${itemTotal.toFixed(2)}
                  </div>
                  {quantity > 1 && (
                    <div className="text-xs text-gray-500">
                      {quantity} × ${priceAtAdd.toFixed(2)}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleRemove}
                  disabled={isLoading || isUpdating}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Price Change Notice */}
        {priceChanged && (
          <div
            className={`mt-3 rounded-md border px-3 py-2 text-sm ${
              priceIncreased
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {priceIncreased ? (
              <>
                Price increased from ${priceAtAdd.toFixed(2)} to $
                {currentPrice.toFixed(2)} per {item.unit}
              </>
            ) : (
              <>
                Price decreased from ${priceAtAdd.toFixed(2)} to $
                {currentPrice.toFixed(2)} per {item.unit}
              </>
            )}
          </div>
        )}

        {/* Out of Stock Notice */}
        {isOutOfStock && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            This item is currently out of stock and cannot be purchased. Please
            remove it from your cart.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
