/**
 * PRODUCT CARD - DIVINE AGRICULTURAL PRODUCT COMPONENT
 *
 * Holographic component manifesting product essence in quantum reality.
 * Each card contains the complete consciousness of the agricultural product.
 *
 * Divine Patterns Applied:
 * - Holographic Component (01_DIVINE_CORE_PRINCIPLES)
 * - Agricultural Consciousness (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - UX Design Consciousness (08_UX_DESIGN_CONSCIOUSNESS)
 *
 * Functional Requirements: FR-001 (Product Catalog)
 */

"use client";

import { cn } from "@/lib/utils";
import type { QuantumProduct } from "@/types/product.types";
import {
  ProductQuantumState,
  calculateDiscount,
  formatPrice,
  formatPricePerUnit,
  getQuantumStateBadgeColor,
  getSeasonalBadgeColor,
  isProductAvailable,
} from "@/types/product.types";
import { Award, Clock, Heart, Leaf, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useState } from "react";

// ============================================================================
// COMPONENT PROPS - DIVINE INTERFACE
// ============================================================================

export interface ProductCardProps {
  product: QuantumProduct;
  variant?: "default" | "compact" | "featured" | "agricultural";
  interactive?: boolean;
  showAddToCart?: boolean;
  showFavorite?: boolean;
  showSeasonBadge?: boolean;
  showCertifications?: boolean;
  className?: string;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
}

// ============================================================================
// QUANTUM PRODUCT CARD - MAIN COMPONENT
// ============================================================================

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      product,
      variant = "default",
      interactive = true,
      showAddToCart = true,
      showFavorite = true,
      showSeasonBadge = true,
      showCertifications = true,
      className,
      onProductClick,
      onAddToCart,
      onToggleFavorite,
    },
    ref
  ) => {
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // ========================================================================
    // EVENT HANDLERS - CONSCIOUSNESS INTERACTIONS
    // ========================================================================

    const handleCardClick = useCallback(() => {
      if (interactive) {
        if (onProductClick) {
          onProductClick(product.identity.id);
        } else {
          router.push(`/products/${product.identity.slug}`);
        }
      }
    }, [
      interactive,
      onProductClick,
      product.identity.id,
      product.identity.slug,
      router,
    ]);

    const handleAddToCart = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isProductAvailable(product)) return;

        setIsAddingToCart(true);
        try {
          if (onAddToCart) {
            await onAddToCart(product.identity.id);
          }
        } catch (error) {
          console.error("Failed to add to cart:", error);
        } finally {
          setIsAddingToCart(false);
        }
      },
      [product, onAddToCart]
    );

    const handleToggleFavorite = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        if (onToggleFavorite) {
          onToggleFavorite(product.identity.id);
        }
      },
      [isFavorite, onToggleFavorite, product.identity.id]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleCardClick();
        }
      },
      [interactive, handleCardClick]
    );

    // ========================================================================
    // DERIVED STATE - QUANTUM CALCULATIONS
    // ========================================================================

    const isAvailable = isProductAvailable(product);
    const isOnSale = product.pricing.onSale && product.pricing.salePrice;
    const discount = isOnSale
      ? calculateDiscount(product.pricing.basePrice, product.pricing.salePrice!)
      : 0;

    const quantumStateColor = getQuantumStateBadgeColor(
      product.inventory.quantumState
    );
    const primarySeasonColor =
      product.seasonality.primarySeasons.length > 0
        ? getSeasonalBadgeColor(product.seasonality.primarySeasons[0])
        : "";

    const primaryImage = product.gallery.primaryImage;
    const isLowStock =
      product.inventory.quantumState === ProductQuantumState.LOW_STOCK;
    const isOrganic = product.quality.organic;

    // ========================================================================
    // RENDER - REALITY MANIFESTATION
    // ========================================================================

    const CardWrapper = interactive ? "button" : "article";

    return (
      <CardWrapper
        ref={ref as React.Ref<HTMLButtonElement & HTMLElement>}
        type={interactive ? "button" : undefined}
        onClick={interactive ? handleCardClick : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
        className={cn(
          // Base styles
          "relative group rounded-lg overflow-hidden w-full text-left",
          "bg-white border-2 border-gray-200",
          "transition-all duration-300",

          // Interactive states
          {
            "hover:shadow-xl hover:border-agricultural-600 cursor-pointer transform hover:-translate-y-1":
              interactive,
            "focus:outline-none focus:ring-4 focus:ring-agricultural-400/50":
              interactive,
            "opacity-75": !isAvailable,
          },

          // Variant styles
          {
            "shadow-md": variant === "default",
            "shadow-sm h-auto": variant === "compact",
            "shadow-2xl border-4 border-agricultural-500":
              variant === "featured",
            "bg-gradient-to-br from-agricultural-50 to-green-50 border-agricultural-300":
              variant === "agricultural",
          },

          className
        )}
        aria-label={`${product.identity.name} - ${product.pricing.pricePerUnit}`}
        disabled={!isAvailable && interactive}
      >
        {/* ================================================================ */}
        {/* IMAGE SECTION */}
        {/* ================================================================ */}
        <div
          className={cn("relative w-full bg-gray-100", {
            "h-48": variant === "default",
            "h-32": variant === "compact",
            "h-64": variant === "featured",
            "h-56": variant === "agricultural",
          })}
        >
          {/* Product Image */}
          {!imageError ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn("object-cover transition-all duration-300", {
                "opacity-0": !imageLoaded,
                "opacity-100 group-hover:scale-105": imageLoaded,
              })}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority={variant === "featured"}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200">
              <Leaf className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Favorite Button */}
          {showFavorite && interactive && (
            <button
              onClick={handleToggleFavorite}
              className={cn(
                "absolute top-2 right-2 p-2 rounded-full",
                "bg-white/90 backdrop-blur-sm",
                "hover:bg-white transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-agricultural-400"
              )}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={cn("w-5 h-5", {
                  "text-red-500 fill-red-500": isFavorite,
                  "text-gray-600": !isFavorite,
                })}
              />
            </button>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {/* Quantum State Badge */}
            <span
              className={cn(
                "px-2 py-1 text-xs font-semibold rounded-md",
                quantumStateColor
              )}
            >
              {product.inventory.quantumState.replace(/_/g, " ")}
            </span>

            {/* On Sale Badge */}
            {isOnSale && (
              <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-500 text-white">
                {discount}% OFF
              </span>
            )}

            {/* Organic Badge */}
            {isOrganic && (
              <span className="px-2 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-800 flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                Organic
              </span>
            )}

            {/* Season Badge */}
            {showSeasonBadge &&
              product.seasonality.primarySeasons.length > 0 && (
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-semibold rounded-md",
                    primarySeasonColor
                  )}
                >
                  {product.seasonality.primarySeasons[0]}
                </span>
              )}
          </div>

          {/* Low Stock Warning */}
          {isLowStock && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="px-2 py-1 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Only {product.inventory.quantityAvailable} left!
              </div>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* CONTENT SECTION */}
        {/* ================================================================ */}
        <div
          className={cn("p-4", {
            "p-3": variant === "compact",
            "p-6": variant === "featured",
          })}
        >
          {/* Product Name */}
          <h3
            className={cn("font-semibold text-gray-900 mb-1 line-clamp-2", {
              "text-base": variant === "compact",
              "text-lg": variant === "default",
              "text-xl": variant === "featured",
            })}
          >
            {product.identity.name}
          </h3>

          {/* Product Category & Farm */}
          <p className="text-xs text-gray-600 mb-2">
            {product.metadata.category.replace(/_/g, " ")}
            {product.metadata.variety && ` • ${product.metadata.variety}`}
          </p>

          {/* Short Description (if not compact) */}
          {variant !== "compact" && product.identity.shortDescription && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {product.identity.shortDescription}
            </p>
          )}

          {/* Certifications (if enabled and not compact) */}
          {showCertifications &&
            variant !== "compact" &&
            product.quality.certifications.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.quality.certifications.slice(0, 3).map((cert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-800"
                  >
                    <Award className="w-3 h-3" />
                    {cert.type.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

          {/* Pricing */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              {/* Sale Price */}
              {isOnSale ? (
                <>
                  <span className="text-2xl font-bold text-agricultural-600">
                    {formatPrice(product.pricing.salePrice!)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.pricing.basePrice)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.pricing.basePrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {formatPricePerUnit(
                isOnSale
                  ? product.pricing.salePrice!
                  : product.pricing.basePrice,
                product.inventory.unit
              )}
            </p>
          </div>

          {/* Metrics (if featured variant) */}
          {variant === "featured" && product.metrics && (
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
              <span>⭐ {product.metrics.rating.toFixed(1)}</span>
              <span>👁️ {product.metrics.views}</span>
              <span>💚 {product.metrics.likes}</span>
            </div>
          )}

          {/* Add to Cart Button */}
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || isAddingToCart}
              className={cn(
                "w-full py-2 px-4 rounded-md font-semibold",
                "transition-all duration-200",
                "flex items-center justify-center gap-2",
                {
                  "bg-agricultural-600 text-white hover:bg-agricultural-700 focus:ring-2 focus:ring-agricultural-400":
                    isAvailable,
                  "bg-gray-300 text-gray-500 cursor-not-allowed": !isAvailable,
                  "opacity-50 cursor-wait": isAddingToCart,
                }
              )}
              aria-label={isAvailable ? "Add to cart" : "Product unavailable"}
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddingToCart
                ? "Adding..."
                : isAvailable
                  ? "Add to Cart"
                  : "Unavailable"}
            </button>
          )}
        </div>

        {/* ================================================================ */}
        {/* AGRICULTURAL CONSCIOUSNESS INDICATOR */}
        {/* ================================================================ */}
        {variant === "agricultural" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-agricultural-500 to-green-600 opacity-50" />
        )}
      </CardWrapper>
    );
  }
);

ProductCard.displayName = "ProductCard";

// ============================================================================
// EXPORT
// ============================================================================

export default ProductCard;
