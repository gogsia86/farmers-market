/**
 * PRODUCT ACTIONS CLIENT COMPONENT
 * Divine product interaction for agricultural marketplace
 * Features: Quantity selection, add to cart integration
 */

"use client";

import { useState } from "react";
import { VariantSelector } from "./VariantSelector";
import { AddToCartButton } from "./AddToCartButton";

// ============================================
// TYPES
// ============================================

interface ProductActionsProps {
  productId: string;
  farmId: string;
  unit: string;
  price: number;
  availableQuantity: number;
  className?: string;
}

// ============================================
// PRODUCT ACTIONS COMPONENT
// ============================================

export function ProductActions({
  productId,
  farmId,
  unit,
  price,
  availableQuantity,
  className,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={className}>
      <div className="space-y-4">
        <VariantSelector
          availableQuantity={availableQuantity}
          unit={unit}
          price={price}
          onQuantityChange={setQuantity}
          minQuantity={1}
          stepQuantity={1}
        />

        <AddToCartButton
          productId={productId}
          farmId={farmId}
          quantity={quantity}
          unit={unit}
          price={price}
          availableQuantity={availableQuantity}
        />
      </div>
    </div>
  );
}
