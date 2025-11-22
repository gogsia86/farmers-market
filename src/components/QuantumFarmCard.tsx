"use client";

import { useComponentConsciousness } from "@/hooks/useComponentConsciousness";
import { useSeasonalConsciousness } from "@/hooks/useSeasonalConsciousness";
import { QuantumFarm } from "@/types/agricultural.types";
import Image from "next/image";
import Link from "next/link";
import { forwardRef, useState } from "react";

/**
 * QUANTUM FARM CARD COMPONENT
 * Divine agricultural component with biodynamic consciousness
 */

export interface QuantumFarmCardProps {
  farm: QuantumFarm;
  variant?: "default" | "agricultural" | "divine";
  interactive?: boolean;
  showBiodynamicScore?: boolean;
  onFarmClick?: (farm: QuantumFarm) => void;
}

export const QuantumFarmCard = forwardRef<HTMLDivElement, QuantumFarmCardProps>(
  (
    {
      farm,
      variant = "default",
      interactive = true,
      showBiodynamicScore = true,
      onFarmClick,
    },
    ref
  ) => {
    // Component consciousness tracking
    const consciousness = useComponentConsciousness("QuantumFarmCard", {
      farmId: farm.id,
      variant,
    });

    // Seasonal consciousness
    const { currentSeason, lunarPhase, getSeasonalAdvice } =
      useSeasonalConsciousness();

    const [imageError, setImageError] = useState(false);

    const handleClick = async () => {
      if (!interactive || !onFarmClick) return;

      const measurement = consciousness.startMeasurement("farm_click");

      try {
        await onFarmClick(farm);
        measurement.success();
      } catch (error) {
        measurement.failure(error);
        throw error;
      }
    };

    const primaryImage = farm.images?.[0] || "/images/farm-placeholder.jpg";
    const biodynamicScore = farm.biodynamicScore?.overall || 0;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg shadow-lg overflow-hidden transition-all duration-300",
          {
            "hover:shadow-xl hover:scale-[1.02] cursor-pointer": interactive,
            "bg-white border border-gray-200": variant === "default",
            "bg-agricultural-50 border-2 border-agricultural-200":
              variant === "agricultural",
            "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200":
              variant === "divine",
          }
        )}
        onClick={handleClick}
        data-testid="farm-card"
      >
        {/* Farm Image */}
        <div className="relative h-48 w-full overflow-hidden">
          {!imageError ? (
            <Image
              src={primaryImage}
              alt={farm.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-agricultural-100 flex items-center justify-center">
              <span className="text-4xl">🌾</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span
              className={cn("px-3 py-1 rounded-full text-xs font-semibold", {
                "bg-green-500 text-white": farm.status === "ACTIVE",
                "bg-yellow-500 text-white": farm.status === "PENDING",
                "bg-gray-500 text-white": farm.status === "INACTIVE",
                "bg-red-500 text-white": farm.status === "SUSPENDED",
              })}
            >
              {farm.status}
            </span>
          </div>

          {/* Seasonal Badge */}
          <div className="absolute top-2 left-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
              {currentSeason} {getSeasonEmoji(currentSeason)}
            </span>
          </div>
        </div>

        {/* Farm Details */}
        <div className="p-6">
          {/* Farm Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{farm.name}</h3>

          {/* Description */}
          {farm.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {farm.description}
            </p>
          )}

          {/* Address */}
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{farm.address}</span>
          </div>

          {/* Biodynamic Score */}
          {showBiodynamicScore && biodynamicScore > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">
                  Biodynamic Score
                </span>
                <span className="text-xs font-bold text-agricultural-700">
                  {biodynamicScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn("h-2 rounded-full transition-all", {
                    "bg-red-500": biodynamicScore < 40,
                    "bg-yellow-500":
                      biodynamicScore >= 40 && biodynamicScore < 70,
                    "bg-green-500": biodynamicScore >= 70,
                    "w-[var(--biodynamic-width)]": true,
                  })}
                  {...({
                    style: { "--biodynamic-width": `${biodynamicScore}%` },
                  } as any)}
                />
              </div>
            </div>
          )}

          {/* Certifications */}
          {farm.certifications && farm.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {farm.certifications.slice(0, 3).map((cert, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {cert}
                </span>
              ))}
              {farm.certifications.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{farm.certifications.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Agricultural Consciousness */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Agricultural Consciousness
              </span>
              <span className="text-xs font-semibold text-purple-600">
                {Math.round(farm.agriculturalConsciousness * 100)}%
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              Lunar Phase: {lunarPhase.replace(/_/g, " ")}
            </div>
          </div>
        </div>

        {/* View Farm Button */}
        {interactive && (
          <div className="px-6 pb-6">
            <Link
              href={`/farms/${farm.id}`}
              className={cn(
                "block w-full text-center py-2 rounded-lg font-medium transition-colors",
                {
                  "bg-agricultural-600 hover:bg-agricultural-700 text-white":
                    variant === "agricultural",
                  "bg-purple-600 hover:bg-purple-700 text-white":
                    variant === "divine",
                  "bg-blue-600 hover:bg-blue-700 text-white":
                    variant === "default",
                }
              )}
            >
              View Farm
            </Link>
          </div>
        )}
      </div>
    );
  }
);

QuantumFarmCard.displayName = "QuantumFarmCard";

// ============================================
// HELPER FUNCTIONS
// ============================================

function cn(
  ...classes: (string | boolean | undefined | Record<string, boolean>)[]
) {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === "string") return cls;
      if (typeof cls === "object") {
        return Object.entries(cls)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(" ");
      }
      return "";
    })
    .join(" ");
}

function getSeasonEmoji(season: string): string {
  const emojis = {
    SPRING: "🌸",
    SUMMER: "☀️",
    FALL: "🍂",
    WINTER: "❄️",
  };
  return emojis[season as keyof typeof emojis] || "🌾";
}
