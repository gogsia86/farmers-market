/**
 * FARM PROFILE CARD - DIVINE AGRICULTURAL COMPONENT
 *
 * Holographic component manifesting farm essence in quantum reality.
 * Each card contains the complete consciousness of the farm entity.
 *
 * Divine Patterns Applied:
 * - Holographic Component (01_DIVINE_CORE_PRINCIPLES)
 * - Agricultural Consciousness (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - UX Design Consciousness (08_UX_DESIGN_CONSCIOUSNESS)
 *
 * Functional Requirements: FR-013 (Farm Directory/Listing)
 */

"use client";

import { cn } from "@/lib/utils";
import type { QuantumFarm } from "@/types/farm.types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useState } from "react";

// ============================================================================
// COMPONENT PROPS - DIVINE INTERFACE
// ============================================================================

export interface FarmProfileCardProps {
  farm: QuantumFarm;
  variant?: "default" | "compact" | "featured" | "agricultural";
  interactive?: boolean;
  showMetrics?: boolean;
  showSeason?: boolean;
  className?: string;
  onFarmClick?: (farmId: string) => void;
}

// ============================================================================
// QUANTUM FARM PROFILE CARD - MAIN COMPONENT
// ============================================================================

export const FarmProfileCard = forwardRef<HTMLDivElement, FarmProfileCardProps>(
  (
    {
      farm,
      variant = "default",
      interactive = true,
      showMetrics = true,
      showSeason = true,
      className,
      onFarmClick,
    },
    ref
  ) => {
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // ========================================================================
    // EVENT HANDLERS - CONSCIOUSNESS INTERACTIONS
    // ========================================================================

    const handleCardClick = useCallback(() => {
      if (interactive) {
        if (onFarmClick) {
          onFarmClick(farm.identity.id);
        } else {
          router.push(`/farms/${farm.identity.slug}`);
        }
      }
    }, [
      interactive,
      onFarmClick,
      farm.identity.id,
      farm.identity.slug,
      router,
    ]);

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

    const seasonalEmoji = {
      SPRING: "🌱",
      SUMMER: "☀️",
      FALL: "🍂",
      WINTER: "❄️",
    }[farm.consciousness.currentSeason];

    const consciousnessEmoji = {
      DORMANT: "💤",
      AWAKENING: "🌅",
      GROWING: "🌿",
      HARVESTING: "🌾",
      REGENERATING: "🔄",
    }[farm.consciousness.state];

    const isVerified = farm.status.verificationStatus === "VERIFIED";
    const isActive = farm.status.farmStatus === "ACTIVE";

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
          },

          // Variant styles
          {
            "shadow-md": variant === "default",
            "shadow-sm": variant === "compact",
            "shadow-2xl border-4 border-agricultural-500":
              variant === "featured",
            "bg-gradient-to-br from-agricultural-50 to-green-50 border-agricultural-300":
              variant === "agricultural",
          },

          className
        )}
        aria-label={`${farm.identity.name} farm profile`}
      >
        {/* ================================================================ */}
        {/* FARM IMAGE - VISUAL CONSCIOUSNESS */}
        {/* ================================================================ */}
        <div
          className={cn("relative w-full overflow-hidden", {
            "h-48": variant === "default" || variant === "agricultural",
            "h-32": variant === "compact",
            "h-64": variant === "featured",
          })}
        >
          {imageError ? (
            <div className="absolute inset-0 bg-gradient-to-br from-agricultural-100 to-green-100 flex items-center justify-center">
              <span className="text-6xl">🌾</span>
            </div>
          ) : (
            <Image
              src="/images/default-farm.jpg"
              alt={`${farm.identity.name} farm`}
              fill
              className={cn("object-cover transition-all duration-500", {
                "opacity-0": !imageLoaded,
                "opacity-100 group-hover:scale-105": imageLoaded,
              })}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority={variant === "featured"}
            />
          )}

          {/* Verification Badge */}
          {isVerified && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
              <span>✓</span>
              <span>Verified</span>
            </div>
          )}

          {/* Seasonal Indicator */}
          {showSeason && (
            <div
              className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-md"
              title={`${farm.consciousness.currentSeason} - ${farm.consciousness.state}`}
            >
              {seasonalEmoji} {consciousnessEmoji}
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* FARM INFORMATION - TEXTUAL CONSCIOUSNESS */}
        {/* ================================================================ */}
        <div className="p-4 space-y-3">
          {/* Farm Name & Location */}
          <div>
            <h3
              className={cn("font-bold text-gray-900 line-clamp-1", {
                "text-xl": variant === "default" || variant === "agricultural",
                "text-lg": variant === "compact",
                "text-2xl": variant === "featured",
              })}
            >
              {farm.identity.name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <span>📍</span>
              <span className="line-clamp-1">
                {farm.location.city}, {farm.location.state}
              </span>
            </p>
          </div>

          {/* Farm Description */}
          {farm.business.description && variant !== "compact" && (
            <p
              className={cn("text-gray-700 line-clamp-2", {
                "text-sm": variant === "default",
                "text-base":
                  variant === "featured" || variant === "agricultural",
              })}
            >
              {farm.business.description}
            </p>
          )}

          {/* Farming Practices Tags */}
          {farm.practices.farmingMethods.length > 0 &&
            variant !== "compact" && (
              <div className="flex flex-wrap gap-2">
                {farm.practices.farmingMethods.slice(0, 3).map((practice) => (
                  <span
                    key={practice}
                    className="px-2 py-1 bg-agricultural-100 text-agricultural-800 text-xs font-medium rounded-full"
                  >
                    {practice}
                  </span>
                ))}
                {farm.practices.farmingMethods.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    +{farm.practices.farmingMethods.length - 3} more
                  </span>
                )}
              </div>
            )}

          {/* Metrics */}
          {showMetrics && isActive && (
            <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-gray-100">
              {farm.metrics.averageRating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">
                    {farm.metrics.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-400">
                    ({farm.metrics.reviewCount})
                  </span>
                </div>
              )}

              {farm.delivery.deliveryEnabled && (
                <div className="flex items-center gap-1">
                  <span>🚚</span>
                  <span className="text-xs">
                    {farm.delivery.deliveryRadius} mi
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* STATUS OVERLAY - INACTIVE FARMS */}
        {/* ================================================================ */}
        {!isActive && (
          <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-xl font-bold">
                {farm.status.farmStatus === "PENDING" && "⏳ Pending Setup"}
                {farm.status.farmStatus === "SUSPENDED" && "⚠️ Suspended"}
                {farm.status.farmStatus === "INACTIVE" && "💤 Inactive"}
              </p>
              <p className="text-sm mt-2 opacity-90">
                This farm is not currently accepting orders
              </p>
            </div>
          </div>
        )}
      </CardWrapper>
    );
  }
);

FarmProfileCard.displayName = "FarmProfileCard";

// ============================================================================
// FARM PROFILE CARD SKELETON - LOADING STATE
// ============================================================================

export function FarmProfileCardSkeleton({
  variant = "default",
  className,
}: Readonly<{
  variant?: "default" | "compact" | "featured";
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-white border-2 border-gray-200 animate-pulse",
        className
      )}
    >
      {/* Image skeleton */}
      <div
        className={cn("w-full bg-gray-200", {
          "h-48": variant === "default",
          "h-32": variant === "compact",
          "h-64": variant === "featured",
        })}
      />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>

        {variant !== "compact" && (
          <>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-24" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS EXPORT
// ============================================================================

export default FarmProfileCard;
