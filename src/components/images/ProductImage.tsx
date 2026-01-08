/**
 * 🖼️ PRODUCT IMAGE COMPONENT
 * Reusable component for displaying product images with intelligent fallbacks
 * ALWAYS shows an image - uses placeholders when none available
 */

import type { Product } from "@prisma/client";
import Image from "next/image";

interface ProductImageProps {
  product: Pick<Product, "id" | "name" | "primaryPhotoUrl" | "images" | "organic" | "featured">;
  variant?: "hero" | "card" | "thumbnail" | "grid";
  className?: string;
  priority?: boolean;
  sizes?: string;
  showBadges?: boolean;
}

/**
 * Get the best available image for a product
 * Priority: primaryPhotoUrl > images[0] > null
 */
function getBestProductImage(product: ProductImageProps["product"]): string | null {
  if (product.primaryPhotoUrl) return product.primaryPhotoUrl;
  if (product.images && product.images.length > 0) return product.images[0];
  return null;
}

/**
 * Get appropriate emoji for product placeholder
 * Could be enhanced to use product category
 */
function getProductEmoji(product: ProductImageProps["product"]): string {
  if (product.organic) return "🥬"; // Organic leafy greens
  return "🥕"; // Generic produce
}

/**
 * ProductImage Component
 *
 * Displays product images with automatic fallback to placeholder
 * Uses Next.js Image for optimization
 *
 * @example
 * ```tsx
 * <ProductImage
 *   product={product}
 *   variant="card"
 *   showBadges={true}
 * />
 * ```
 */
export function ProductImage({
  product,
  variant = "card",
  className = "",
  priority = false,
  sizes,
  showBadges = false,
}: ProductImageProps) {
  const imageUrl = getBestProductImage(product);

  // Define responsive sizes based on variant
  const defaultSizes = {
    hero: "100vw",
    card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    grid: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
    thumbnail: "(max-width: 768px) 25vw, 10vw",
  };

  const imageSizes = sizes || defaultSizes[variant];

  // Aspect ratio classes based on variant
  const aspectRatioClasses = {
    hero: "h-96",
    card: "h-48",
    grid: "h-48",
    thumbnail: "h-24 w-24",
  };

  const emojiSizes = {
    hero: "text-9xl",
    card: "text-6xl",
    grid: "text-6xl",
    thumbnail: "text-3xl",
  };

  if (!imageUrl) {
    // Show beautiful placeholder when no image available
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 ${aspectRatioClasses[variant]} ${className}`}
      >
        <div className="flex h-full w-full items-center justify-center">
          <span className={emojiSizes[variant]}>{getProductEmoji(product)}</span>
        </div>
        {showBadges && (
          <ProductBadges product={product} />
        )}
      </div>
    );
  }

  // Show optimized image
  return (
    <div
      className={`relative overflow-hidden ${variant !== "thumbnail" ? aspectRatioClasses[variant] : ""
        } ${className}`}
    >
      <Image
        src={imageUrl}
        alt={product.name}
        fill={variant !== "thumbnail"}
        width={variant === "thumbnail" ? 96 : undefined}
        height={variant === "thumbnail" ? 96 : undefined}
        className={`object-cover transition-transform duration-300 ${variant === "card" || variant === "grid" ? "group-hover:scale-105" : ""
          }`}
        sizes={imageSizes}
        priority={priority}
        quality={85}
      />
      {showBadges && (
        <ProductBadges product={product} />
      )}
    </div>
  );
}

/**
 * ProductBadges Component
 *
 * Displays organic and featured badges on product images
 */
interface ProductBadgesProps {
  product: Pick<Product, "organic" | "featured">;
}

function ProductBadges({ product }: ProductBadgesProps) {
  if (!product.organic && !product.featured) return null;

  return (
    <div className="absolute left-2 top-2 flex flex-col gap-1">
      {product.organic && (
        <span className="rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-md">
          🌱 Organic
        </span>
      )}
      {product.featured && (
        <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
          ⭐ Featured
        </span>
      )}
    </div>
  );
}

/**
 * ProductImageGallery Component
 *
 * Displays a photo gallery for product detail pages
 * Shows primary image + grid of additional photos
 */
interface ProductImageGalleryProps {
  product: Pick<Product, "id" | "name" | "primaryPhotoUrl" | "images" | "organic" | "featured">;
  additionalPhotos?: string[];
}

export function ProductImageGallery({ product, additionalPhotos = [] }: ProductImageGalleryProps) {
  // Collect all available photos
  const allPhotos = [
    ...(product.primaryPhotoUrl ? [product.primaryPhotoUrl] : []),
    ...product.images,
    ...additionalPhotos,
  ];

  // Remove duplicates
  const uniquePhotos = Array.from(new Set(allPhotos));

  const primaryPhoto = uniquePhotos[0];
  const secondaryPhotos = uniquePhotos.slice(1, 5);

  if (uniquePhotos.length === 0) {
    // Show beautiful placeholder gallery
    return (
      <div className="mb-8">
        <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-9xl">{getProductEmoji(product)}</div>
              <p className="text-xl font-semibold text-gray-700">{product.name}</p>
            </div>
          </div>
          <ProductBadges product={product} />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Primary Photo */}
      <div className="relative h-96 w-full overflow-hidden rounded-t-lg">
        <Image
          src={primaryPhoto}
          alt={`${product.name} - Main Photo`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />
        <ProductBadges product={product} />
      </div>

      {/* Additional Photos Grid */}
      {secondaryPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 rounded-b-lg bg-white p-2 md:grid-cols-4">
          {secondaryPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative h-24 cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-105"
            >
              <Image
                src={photo}
                alt={`${product.name} - Photo ${index + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                quality={80}
              />
            </div>
          ))}
          {uniquePhotos.length > 5 && (
            <div className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-gray-100 transition-all hover:bg-gray-200">
              <span className="text-lg font-semibold text-gray-600">
                +{uniquePhotos.length - 5} more
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ProductThumbnail Component
 *
 * Small thumbnail for product lists, cart items, etc.
 */
interface ProductThumbnailProps {
  product: Pick<Product, "id" | "name" | "primaryPhotoUrl" | "images" | "organic">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductThumbnail({ product, size = "md", className = "" }: ProductThumbnailProps) {
  const imageUrl = getBestProductImage(product);

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const emojiSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-md bg-gradient-to-br from-green-50 to-emerald-50 ${sizeClasses[size]} ${className}`}
      >
        <span className={emojiSizes[size]}>{getProductEmoji(product)}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-md ${sizeClasses[size]} ${className}`}>
      <Image
        src={imageUrl}
        alt={product.name}
        fill
        className="object-cover"
        sizes="100px"
        quality={80}
      />
    </div>
  );
}

/**
 * ProductImageCarousel Component
 *
 * Interactive carousel for cycling through product images
 * Client component for interactivity
 */
"use client";

import { useState } from "react";

interface ProductImageCarouselProps {
  product: Pick<Product, "id" | "name" | "primaryPhotoUrl" | "images" | "organic" | "featured">;
  additionalPhotos?: string[];
}

export function ProductImageCarousel({ product, additionalPhotos = [] }: ProductImageCarouselProps) {
  const allPhotos = [
    ...(product.primaryPhotoUrl ? [product.primaryPhotoUrl] : []),
    ...product.images,
    ...additionalPhotos,
  ].filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates

  const [currentIndex, setCurrentIndex] = useState(0);

  if (allPhotos.length === 0) {
    return (
      <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-9xl">{getProductEmoji(product)}</div>
            <p className="text-xl font-semibold text-gray-700">{product.name}</p>
          </div>
        </div>
        <ProductBadges product={product} />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative h-96 w-full overflow-hidden rounded-lg">
        <Image
          src={allPhotos[currentIndex]}
          alt={`${product.name} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="100vw"
          quality={90}
          priority={currentIndex === 0}
        />
        <ProductBadges product={product} />

        {/* Navigation Arrows */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
              aria-label="Previous image"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
              aria-label="Next image"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {allPhotos.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {allPhotos.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {allPhotos.map((photo, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md transition-all ${index === currentIndex
                  ? "ring-2 ring-green-600 ring-offset-2"
                  : "opacity-60 hover:opacity-100"
                }`}
            >
              <Image
                src={photo}
                alt={`${product.name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                quality={70}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
