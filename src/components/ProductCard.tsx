/**
 * PRODUCT CARD COMPONENT
 * Divine React component for agricultural product preview cards
 * Holographic product display with quantum consciousness
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  showFarm?: boolean;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  showFarm = true,
  onAddToCart,
  onAddToWishlist,
  className,
}: ProductCardProps) {
  const primaryImage =
    product.primaryImageUrl ||
    product.images[0]?.url ||
    "/images/placeholder-product.jpg";
  const isAvailable =
    product.status === "AVAILABLE" && product.inventory.inStock;
  const isLowStock = product.inventory.isLowStock;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-lg",
        className
      )}
    >
      {/* Product Image */}
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isFeatured && (
                <Badge variant="default" className="bg-yellow-500">
                  Featured
                </Badge>
              )}
              {product.attributes.isOrganic && (
                <Badge variant="success" className="bg-green-600">
                  Organic
                </Badge>
              )}
              {!isAvailable && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
              {isLowStock && isAvailable && (
                <Badge variant="warning" className="bg-orange-500">
                  Low Stock
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            {onAddToWishlist && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToWishlist(product.id);
                }}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </Link>
      </CardHeader>

      {/* Product Info */}
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Farm Info */}
        {showFarm && product.farm && (
          <Link
            href={`/farms/${product.farm.slug}`}
            className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
          >
            {product.farm.logoUrl && (
              <Image
                src={product.farm.logoUrl}
                alt={product.farm.name}
                width={16}
                height={16}
                className="rounded-full"
              />
            )}
            <span>{product.farm.name}</span>
            {product.farm.verificationStatus === "VERIFIED" && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                ✓
              </Badge>
            )}
          </Link>
        )}

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            ${product.pricing.basePrice.amount.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            / {product.pricing.basePrice.unit}
          </span>
        </div>

        {/* Attributes */}
        <div className="mt-2 flex flex-wrap gap-1">
          {product.attributes.isNonGMO && (
            <Badge variant="outline" className="text-xs">
              Non-GMO
            </Badge>
          )}
          {product.attributes.isLocallyGrown && (
            <Badge variant="outline" className="text-xs">
              Local
            </Badge>
          )}
          {product.attributes.isSeasonal && (
            <Badge variant="outline" className="text-xs">
              Seasonal
            </Badge>
          )}
        </div>

        {/* Availability */}
        {isAvailable && (
          <p className="text-sm text-gray-600 mt-2">
            {product.inventory.availableQuantity}{" "}
            {product.pricing.basePrice.unit} available
          </p>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0">
        {isAvailable ? (
          <Button
            onClick={() => onAddToCart?.(product.id)}
            className="w-full"
            disabled={!onAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        ) : (
          <Button className="w-full" disabled variant="secondary">
            Out of Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
