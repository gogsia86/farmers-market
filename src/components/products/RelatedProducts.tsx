/**
 * RELATED PRODUCTS COMPONENT
 * Divine product recommendations for agricultural marketplace
 * Features: Product grid, farm info, quick add to cart
 */

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface Farm {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  verificationStatus?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  primaryPhotoUrl?: string | null;
  organic: boolean;
  averageRating?: number | null;
  reviewCount: number;
  inStock: boolean;
  quantityAvailable?: number | null;
  farm: Farm;
}

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
  title?: string;
  className?: string;
}

// ============================================
// RELATED PRODUCTS COMPONENT
// ============================================

export function RelatedProducts({
  products,
  currentProductId,
  title = "You May Also Like",
  className,
}: RelatedProductsProps) {
  const router = useRouter();

  // Filter out current product and empty results
  const filteredProducts = products.filter((p) => p.id !== currentProductId);

  if (filteredProducts.length === 0) {
    return null;
  }

  const handleProductClick = (_farmSlug: string, productSlug: string) => {
    router.push(`/marketplace/products/${productSlug}`);
  };

  return (
    <section className={cn("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={() => router.push("/marketplace/products")}
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          View All Products →
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={handleProductClick}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: (farmSlug: string, productSlug: string) => void;
}) {
  const imageUrl = product.primaryPhotoUrl || "/images/placeholder-product.jpg";
  const isOutOfStock = !product.inStock;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md",
        isOutOfStock && "opacity-75",
      )}
    >
      {/* Product Image */}
      <div
        className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
        onClick={() => onClick(product.farm.slug, product.slug)}
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.organic && (
            <span className="rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
              Organic
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Add Button (appears on hover) */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // This would trigger add to cart - simplified for now
                onClick(product.farm.slug, product.slug);
              }}
              className="flex w-full items-center justify-center gap-2 bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
              aria-label={`Quick add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
              Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div
        className="flex flex-1 flex-col p-4 cursor-pointer"
        onClick={() => onClick(product.farm.slug, product.slug)}
      >
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>

        {/* Farm Info */}
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{product.farm.name}</span>
          {product.farm.verificationStatus === "VERIFIED" && (
            <span
              className="ml-1 text-green-600"
              title="Verified Farm"
              aria-label="Verified farm"
            >
              ✓
            </span>
          )}
        </div>

        {/* Rating */}
        {product.averageRating && product.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm font-medium text-gray-900">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">/ {product.unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
