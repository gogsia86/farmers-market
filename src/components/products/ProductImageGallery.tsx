/**
 * PRODUCT IMAGE GALLERY COMPONENT
 * Divine image display for agricultural products
 * Features: Main image, thumbnails, lightbox, zoom, keyboard navigation
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

// ============================================
// PRODUCT IMAGE GALLERY COMPONENT
// ============================================

export function ProductImageGallery({
  images,
  productName,
  className,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Ensure we have at least a placeholder image
  const imageList =
    images.length > 0 ? images : ["/images/placeholder-product.jpg"];

  const selectedImage = imageList[selectedIndex];

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [imageList.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [imageList.length]);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "z":
        case "Z":
          toggleZoom();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrevious, handleNext]);

  // Touch gesture support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <>
      {/* Main Gallery */}
      <div className={cn("space-y-4", className)}>
        {/* Main Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          <div
            className="relative h-full w-full cursor-zoom-in"
            onClick={openLightbox}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={selectedImage || "/images/placeholder-product.jpg"}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              priority={selectedIndex === 0}
            />
          </div>

          {/* Navigation Arrows (Desktop) */}
          {imageList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 md:block"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-gray-800" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 md:block"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-gray-800" />
              </button>
            </>
          )}

          {/* Zoom Hint */}
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 p-2 text-white">
            <ZoomIn className="h-4 w-4" />
          </div>

          {/* Image Counter */}
          {imageList.length > 1 && (
            <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              {selectedIndex + 1} / {imageList.length}
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {imageList.length > 1 && (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5">
            {imageList.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-green-500",
                  selectedIndex === index
                    ? "border-green-600 ring-2 ring-green-500 ring-offset-2"
                    : "border-gray-200 hover:border-gray-400",
                )}
                aria-label={`View image ${index + 1}`}
                aria-pressed={selectedIndex === index}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Zoom Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
            className="absolute right-4 top-16 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            aria-pressed={isZoomed}
          >
            <ZoomIn className={cn("h-6 w-6", isZoomed && "text-green-400")} />
          </button>

          {/* Navigation Arrows */}
          {imageList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Main Lightbox Image */}
          <div
            className={cn(
              "relative transition-all duration-300",
              isZoomed
                ? "h-full w-full cursor-zoom-out overflow-auto"
                : "max-h-[90vh] max-w-[90vw] cursor-zoom-in",
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
          >
            <div
              className={cn(
                "relative",
                isZoomed
                  ? "h-auto w-auto min-h-screen min-w-full"
                  : "h-full w-full",
              )}
            >
              <Image
                src={selectedImage || "/images/placeholder-product.jpg"}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                width={isZoomed ? 3000 : 1200}
                height={isZoomed ? 3000 : 1200}
                className={cn(
                  "object-contain",
                  isZoomed ? "w-full h-auto" : "max-h-[90vh]",
                )}
                priority
              />
            </div>
          </div>

          {/* Image Counter */}
          {imageList.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-white">
              {selectedIndex + 1} / {imageList.length}
            </div>
          )}

          {/* Keyboard Hints */}
          <div className="absolute bottom-4 right-4 space-y-1 text-right text-sm text-white/60">
            <p>ESC to close</p>
            <p>← → to navigate</p>
            <p>Z to zoom</p>
          </div>
        </div>
      )}
    </>
  );
}
