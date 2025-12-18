"use client";

/**
 * 🖼️ PRODUCT IMAGE COMPONENT
 * Standardized product image with consistent aspect ratio across the platform
 *
 * Purpose:
 * - Enforce consistent aspect-square ratio for all product images
 * - Provide fallback for missing images
 * - Optimize image loading with Next.js Image
 * - Handle error states gracefully
 *
 * Features:
 * - aspect-square ratio (1:1) by default
 * - Automatic fallback to placeholder
 * - Loading states with skeleton
 * - Error handling
 * - Hover effects (optional)
 * - Badge overlays (organic, seasonal, etc.)
 *
 * Reference: DESIGN_SYSTEM_ANALYSIS.md - Image Standardization
 */

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export interface ProductImageProps {
  /**
   * Image source URL
   */
  src?: string | null;

  /**
   * Alt text for accessibility
   */
  alt: string;

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * Aspect ratio (default: square)
   */
  aspectRatio?: "square" | "4:3" | "16:9" | "3:2";

  /**
   * Show hover effect
   */
  hoverable?: boolean;

  /**
   * Priority loading (for above-the-fold images)
   */
  priority?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Badge overlays
   */
  badges?: Array<{
    label: string;
    variant: "organic" | "seasonal" | "sale" | "new" | "out_of_stock";
  }>;

  /**
   * Show loading skeleton
   */
  showSkeleton?: boolean;

  /**
   * Fallback icon/emoji
   */
  fallbackIcon?: string;

  /**
   * Click handler
   */
  onClick?: () => void;
}

const aspectRatioClasses = {
  square: "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-[16/9]",
  "3:2": "aspect-[3/2]",
};

const badgeStyles = {
  organic: "bg-green-500 text-white",
  seasonal: "bg-agricultural-500 text-white",
  sale: "bg-red-500 text-white",
  new: "bg-blue-500 text-white",
  out_of_stock: "bg-gray-500 text-white",
};

export function ProductImage({
  src,
  alt,
  size = "md",
  aspectRatio = "square",
  hoverable = false,
  priority = false,
  className,
  badges = [],
  showSkeleton = false,
  fallbackIcon = "🥬",
  onClick,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hasValidSrc = src && !imageError;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-100 rounded-lg",
        aspectRatioClasses[aspectRatio],
        hoverable && "group cursor-pointer",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {/* Image or Fallback */}
      {hasValidSrc ? (
        <>
          {/* Loading Skeleton */}
          {isLoading && showSkeleton && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Actual Image */}
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-all duration-300",
              hoverable && "group-hover:scale-105",
              isLoading && "opacity-0",
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
        </>
      ) : (
        // Fallback when no image or error
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
          <span
            className="text-6xl"
            role="img"
            aria-label="Product placeholder"
          >
            {fallbackIcon}
          </span>
        </div>
      )}

      {/* Badge Overlays */}
      {badges.length > 0 && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {badges.map((badge, index) => (
            <span
              key={index}
              className={cn(
                "px-2 py-1 rounded-full text-xs font-bold shadow-sm",
                badgeStyles[badge.variant],
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Hover Overlay (optional) */}
      {hoverable && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      )}
    </div>
  );
}

/**
 * Product Image Grid
 * For displaying multiple product images in a consistent grid
 */
export function ProductImageGrid({
  images,
  maxImages = 4,
  onClick,
  className,
}: {
  images: Array<{ src: string; alt: string }>;
  maxImages?: number;
  onClick?: (index: number) => void;
  className?: string;
}) {
  const displayImages = images.slice(0, maxImages);
  const remainingCount = images.length - maxImages;

  return (
    <div
      className={cn(
        "grid gap-2",
        maxImages === 2 && "grid-cols-2",
        maxImages === 3 && "grid-cols-3",
        maxImages === 4 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {displayImages.map((image, index) => (
        <div key={index} className="relative">
          <ProductImage
            src={image.src}
            alt={image.alt}
            hoverable
            onClick={() => onClick?.(index)}
          />

          {/* Show remaining count on last image */}
          {index === maxImages - 1 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg rounded-lg">
              +{remainingCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Product Image Skeleton
 * Loading placeholder for product images
 */
export function ProductImageSkeleton({
  aspectRatio = "square",
  className,
}: {
  aspectRatio?: "square" | "4:3" | "16:9" | "3:2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-200 rounded-lg animate-pulse",
        aspectRatioClasses[aspectRatio],
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
    </div>
  );
}

/**
 * Farm Logo Image
 * Circular farm logo with consistent styling
 */
export function FarmLogoImage({
  src,
  alt,
  size = "md",
  className,
  fallbackIcon = "🏪",
}: {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackIcon?: string;
}) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const iconSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-5xl",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-gray-100 flex items-center justify-center",
        sizeClasses[size],
        className,
      )}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={iconSizes[size]}>{fallbackIcon}</span>
      )}
    </div>
  );
}

// Export all components
export default ProductImage;
