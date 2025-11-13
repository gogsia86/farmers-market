// 🧠 DIVINE PATTERN: Holographic Component Architecture
// 📚 Reference: 01_DIVINE_CORE_PRINCIPLES.instructions.md
// 🌾 Domain: Agricultural Farm Entity Display
// ⚡ Performance: Optimized Image Loading with Next.js

"use client";

import { cn } from "@/lib/utils";
import {
  CheckBadgeIcon,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useState } from "react";

// 🧬 QUANTUM TYPE DEFINITIONS
export interface QuantumFarmConsciousness {
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
  biodynamicScore: number;
  agriculturalAwareness: number;
  seasonalAlignment: Season;
}

export interface QuantumFarm {
  id: string;
  name: string;
  description: string | null;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  certifications: string[];
  images: string[];
  consciousness: QuantumFarmConsciousness;
  _count: {
    products: number;
    reviews: number;
  };
  averageRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuantumFarmCardProps {
  farm: QuantumFarm;
  variant?: "default" | "compact" | "featured";
  interactive?: boolean;
  onFarmClick?: (farm: QuantumFarm) => void;
  onFavoriteToggle?: (farmId: string) => void;
  isFavorite?: boolean;
  className?: string;
}

type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

/**
 * QUANTUM FARM CARD COMPONENT
 *
 * Holographic component containing complete farm consciousness.
 * Self-aware, self-optimizing, and performance-conscious.
 *
 * DIVINE FEATURES:
 * - Quantum state management
 * - Agricultural consciousness tracking
 * - Biodynamic score visualization
 * - Seasonal alignment awareness
 * - Performance-optimized image loading
 * - Accessibility compliant
 *
 * @example
 * ```tsx
 * <QuantumFarmCard
 *   farm={quantumFarm}
 *   variant="featured"
 *   interactive
 *   onFarmClick={handleFarmClick}
 * />
 * ```
 */
export const QuantumFarmCard = forwardRef<HTMLDivElement, QuantumFarmCardProps>(
  (
    {
      farm,
      variant = "default",
      interactive = true,
      onFarmClick,
      onFavoriteToggle,
      isFavorite = false,
      className,
    },
    ref
  ) => {
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // 🎯 QUANTUM EVENT HANDLERS
    const handleCardClick = useCallback(() => {
      if (interactive) {
        if (onFarmClick) {
          onFarmClick(farm);
        } else {
          router.push(`/farms/${farm.id}`);
        }
      }
    }, [interactive, onFarmClick, farm, router]);

    const handleFavoriteClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onFavoriteToggle?.(farm.id);
      },
      [onFavoriteToggle, farm.id]
    );

    // 🌾 AGRICULTURAL CONSCIOUSNESS CALCULATION
    const getConsciousnessColor = (level: number): string => {
      if (level >= 0.9) return "text-green-600";
      if (level >= 0.7) return "text-yellow-600";
      return "text-orange-600";
    };

    const getBiodynamicBadge = (score: number): string => {
      if (score >= 90) return "🌟 Divine";
      if (score >= 75) return "✨ Excellent";
      if (score >= 60) return "🌿 Good";
      return "🌱 Growing";
    };

    const getSeasonalEmoji = (season: Season): string => {
      const seasonMap = {
        SPRING: "🌸",
        SUMMER: "☀️",
        FALL: "🍂",
        WINTER: "❄️",
      };
      return seasonMap[season];
    };

    // 🎨 DYNAMIC STYLING BASED ON VARIANT
    const cardStyles = cn(
      // Base styles
      "relative overflow-hidden rounded-lg shadow-lg transition-all duration-300",
      "bg-white border border-gray-200",

      // Variant styles
      {
        "hover:shadow-xl hover:scale-[1.02]":
          interactive && variant === "default",
        "hover:shadow-2xl hover:scale-[1.05]":
          interactive && variant === "featured",
        "max-w-sm": variant === "compact",
        "max-w-2xl": variant === "featured",
      },

      // Interactive styles
      {
        "cursor-pointer": interactive,
        "cursor-default": !interactive,
      },

      // Agricultural consciousness styling
      {
        "border-green-300 bg-green-50":
          farm.consciousness.biodynamicScore >= 90,
        "border-yellow-300 bg-yellow-50":
          farm.consciousness.biodynamicScore >= 75 &&
          farm.consciousness.biodynamicScore < 90,
      },

      className
    );

    const primaryImage = farm.images[0] || "/images/placeholder-farm.svg";

    return (
      <div
        ref={ref}
        className={cardStyles}
        onClick={handleCardClick}
        role={interactive ? "button" : "article"}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={(e) => {
          if (interactive && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`Farm: ${farm.name}`}
      >
        {/* FEATURED BADGE */}
        {variant === "featured" && (
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ⭐ Featured Farm
          </div>
        )}

        {/* FAVORITE BUTTON */}
        {onFavoriteToggle && (
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200",
              "bg-white/90 hover:bg-white shadow-lg hover:shadow-xl",
              {
                "text-red-500": isFavorite,
                "text-gray-400 hover:text-red-500": !isFavorite,
              }
            )}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <StarIcon
              className="w-6 h-6"
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
        )}

        {/* FARM IMAGE */}
        <div className="relative w-full h-48 bg-gray-200">
          {!imageError && (
            <Image
              src={primaryImage}
              alt={`${farm.name} - Agricultural landscape`}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority={variant === "featured"}
            />
          )}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
              <span className="text-6xl">🌾</span>
            </div>
          )}

          {/* AGRICULTURAL CONSCIOUSNESS OVERLAY */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-2 text-white text-sm">
              <span
                className={getConsciousnessColor(
                  farm.consciousness.agriculturalAwareness
                )}
              >
                {getSeasonalEmoji(farm.consciousness.seasonalAlignment)}
              </span>
              <span className="font-semibold">
                {getBiodynamicBadge(farm.consciousness.biodynamicScore)}
              </span>
            </div>
          </div>
        </div>

        {/* FARM DETAILS */}
        <div className="p-4 space-y-3">
          {/* HEADER */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {farm.name}
              </h3>
              {farm.certifications.includes("ORGANIC") && (
                <CheckBadgeIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
              )}
            </div>

            {/* LOCATION */}
            <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
              <MapPinIcon className="w-4 h-4" />
              <span className="line-clamp-1">{farm.address}</span>
            </div>
          </div>

          {/* DESCRIPTION */}
          {farm.description && variant !== "compact" && (
            <p className="text-gray-700 text-sm line-clamp-2">
              {farm.description}
            </p>
          )}

          {/* CERTIFICATIONS */}
          {farm.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {farm.certifications.slice(0, 3).map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {cert}
                </span>
              ))}
              {farm.certifications.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{farm.certifications.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* STATS */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            {/* RATING */}
            {farm.averageRating && (
              <div className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-900">
                  {farm.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">
                  ({farm._count.reviews})
                </span>
              </div>
            )}

            {/* PRODUCTS COUNT */}
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{farm._count.products}</span>{" "}
              products
            </div>

            {/* CONSCIOUSNESS SCORE */}
            <div className="text-sm">
              <span
                className={cn(
                  "font-semibold",
                  getConsciousnessColor(
                    farm.consciousness.agriculturalAwareness
                  )
                )}
              >
                {Math.round(farm.consciousness.agriculturalAwareness * 100)}%
              </span>
              <span className="text-gray-500 ml-1">conscious</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

QuantumFarmCard.displayName = "QuantumFarmCard";
