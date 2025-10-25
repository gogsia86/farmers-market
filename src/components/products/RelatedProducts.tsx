/**
 * RELATED PRODUCTS COMPONENT
 *
 * Shows related products from the same category.
 * Helps users discover similar items.
 */

"use client";

import type { QuantumProduct } from "@/types/product.types";
import ProductCard from "./ProductCard";

interface RelatedProductsProps {
  products: QuantumProduct[];
  currentProductId: string;
}

export default function RelatedProducts({
  products,
  currentProductId,
}: RelatedProductsProps) {
  // Filter out current product
  const relatedItems = products.filter(
    (p) => p.identity.id !== currentProductId
  );

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        You May Also Like
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedItems.map((product) => (
          <ProductCard
            key={product.identity.id}
            product={product}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
}
