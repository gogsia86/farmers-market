"use client";

import { useComponentConsciousness } from "@/hooks/useComponentConsciousness";
import { useSeasonalConsciousness } from "@/hooks/useSeasonalConsciousness";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface BiodynamicProductGridProps {
  products: Product[];
  farmId?: string;
  seasonalFilter?: boolean;
  organicOnly?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (productId: string) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * BIODYNAMIC PRODUCT GRID COMPONENT
 * Agricultural-aware product display with seasonal consciousness
 */
export function BiodynamicProductGrid({
  products,
  farmId,
  seasonalFilter = false,
  organicOnly = false,
  onProductClick,
  onAddToCart,
  columns = 3,
  className,
}: BiodynamicProductGridProps) {
  // Component consciousness
  const consciousness = useComponentConsciousness("BiodynamicProductGrid", {
    farmId,
    productCount: products.length,
  });

  // Seasonal consciousness
  const {
    season: currentSeason,
    plantingWindow,
    harvestWindow,
  } = useSeasonalConsciousness();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Apply filters
  useEffect(() => {
    let filtered = products;

    if (seasonalFilter) {
      filtered = filtered.filter((product) =>
        product.seasonal ? plantingWindow || harvestWindow : true,
      );
    }

    if (organicOnly) {
      filtered = filtered.filter((product) => product.organic);
    }

    setFilteredProducts(filtered);
  }, [products, seasonalFilter, organicOnly, currentSeason]);

  const handleProductClick = (product: Product) => {
    const measurement = consciousness.startMeasurement("product_click");
    try {
      onProductClick?.(product);
      measurement.success();
    } catch (error) {
      measurement.failure(error);
    }
  };

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const measurement = consciousness.startMeasurement("add_to_cart");
    try {
      onAddToCart?.(productId);
      measurement.success();
    } catch (error) {
      measurement.failure(error);
    }
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No products available{seasonalFilter ? " for the current season" : ""}
        </p>
        {seasonalFilter && (
          <p className="text-sm text-gray-400 mt-2">
            Current season: {currentSeason}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="product-grid"
      className={cn(
        "grid gap-6",
        {
          "grid-cols-1 md:grid-cols-2": columns === 2,
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
        },
        className,
      )}
    >
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          data-testid="product-card"
          onClick={() => handleProductClick(product)}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
          {/* Product Image */}
          <div className="relative h-48 bg-gray-200">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images?.[0] || "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-100 to-green-200">
                <span className="text-6xl">🥬</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.organic && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ORGANIC
                </span>
              )}
              {product.seasonal && (
                <span className="bg-agricultural-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  SEASONAL
                </span>
              )}
              {!product.inStock && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  OUT OF STOCK
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-agricultural-700">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">per {product.unit}</span>
            </div>

            {/* Quantity */}
            {product.quantity !== null && product.quantity !== undefined && (
              <p className="text-sm text-gray-600 mb-3">
                {product.quantity} {product.unit}s available
              </p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={(e) => handleAddToCart(product.id, e)}
              disabled={!product.inStock}
              className={cn(
                "w-full py-2 rounded-lg font-medium transition-colors",
                product.inStock
                  ? "bg-agricultural-600 text-white hover:bg-agricultural-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed",
              )}
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
