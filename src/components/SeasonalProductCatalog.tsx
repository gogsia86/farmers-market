"use client";

import React from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  season: string;
  inStock: boolean;
  farmId: string;
  description?: string;
  organic?: boolean;
  biodynamic?: boolean;
  harvestDate?: Date;
}

interface SeasonalProductCatalogProps {
  season: string;
  products?: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  virtualized?: boolean;
}

export function SeasonalProductCatalog({
  season,
  products = [],
  onProductClick,
  onAddToCart,
  virtualized = false,
}: SeasonalProductCatalogProps) {
  const filteredProducts = products.filter(
    (product) => product.season === season && product.inStock,
  );

  // For virtualized rendering, only show first 20 items
  const displayProducts = virtualized
    ? filteredProducts.slice(0, 20)
    : filteredProducts;

  return (
    <div className="seasonal-product-catalog" data-testid="seasonal-catalog">
      <h2 className="text-2xl font-bold mb-4">{season} Products</h2>
      {displayProducts.length === 0 ? (
        <p className="text-gray-500">
          No seasonal products available for this season
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="product-card border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              data-testid={`product-${product.id}`}
              onClick={() => onProductClick?.(product)}
            >
              <h3 className="text-lg font-semibold">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {product.description}
                </p>
              )}
              <p className="text-gray-600 mt-2">${product.price.toFixed(2)}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {product.season}
                </span>
                {product.organic && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Organic
                  </span>
                )}
                {product.biodynamic && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    Biodynamic
                  </span>
                )}
              </div>
              {product.harvestDate && (
                <p className="text-xs text-gray-500 mt-2">
                  Harvested:{" "}
                  {new Date(product.harvestDate).toLocaleDateString()}
                </p>
              )}
              {onAddToCart && (
                <button
                  className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  aria-label="Add to cart"
                >
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(SeasonalProductCatalog);
