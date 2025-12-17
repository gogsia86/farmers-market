"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Leaf,
  Sun,
  CloudRain,
  Snowflake,
  Sprout,
  Wheat,
  Wind,
  Thermometer
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES - Divine Agricultural Type System
// ============================================================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export interface SeasonalIndicatorProps {
  /** Current season */
  season: Season;
  /** Temperature in Celsius (optional) */
  temperature?: number;
  /** Display variant */
  variant?: "default" | "compact" | "detailed";
  /** Show temperature */
  showTemperature?: boolean;
  /** Show seasonal activities */
  showActivities?: boolean;
  /** Custom className */
  className?: string;
  /** Animated transition */
  animated?: boolean;
  /** On season click handler */
  onSeasonClick?: (season: Season) => void;
}

interface SeasonConfig {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  description: string;
  activities: string[];
  temperatureRange: string;
  emoji: string;
}

// ============================================================================
// SEASON CONFIGURATIONS - Biodynamic Consciousness
// ============================================================================

const SEASON_CONFIG: Record<Season, SeasonConfig> = {
  SPRING: {
    name: "Spring",
    icon: Sprout,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    gradient: "from-green-400 to-emerald-500",
    description: "Season of renewal and planting",
    activities: ["Plant", "Prepare Soil", "Prune", "Start Seeds"],
    temperatureRange: "10-20°C",
    emoji: "🌱"
  },
  SUMMER: {
    name: "Summer",
    icon: Sun,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    gradient: "from-amber-400 to-orange-500",
    description: "Season of growth and abundance",
    activities: ["Water", "Weed", "Monitor", "Harvest Early Crops"],
    temperatureRange: "20-35°C",
    emoji: "☀️"
  },
  FALL: {
    name: "Fall",
    icon: Leaf,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    gradient: "from-orange-400 to-red-500",
    description: "Season of harvest and preservation",
    activities: ["Harvest", "Preserve", "Compost", "Plant Cover Crops"],
    temperatureRange: "10-20°C",
    emoji: "🍂"
  },
  WINTER: {
    name: "Winter",
    icon: Snowflake,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    gradient: "from-blue-400 to-cyan-500",
    description: "Season of rest and planning",
    activities: ["Rest", "Plan", "Repair", "Indoor Growing"],
    temperatureRange: "-5-10°C",
    emoji: "❄️"
  }
};

// ============================================================================
// SEASONAL INDICATOR COMPONENT - Divine Implementation
// ============================================================================

export function SeasonalIndicator({
  season,
  temperature,
  variant = "default",
  showTemperature = true,
  showActivities = true,
  className,
  animated = true,
  onSeasonClick
}: SeasonalIndicatorProps) {
  const config = SEASON_CONFIG[season];
  const Icon = config.icon;

  // Compact variant - minimal display
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
          config.bgColor,
          config.borderColor,
          animated && "transition-all duration-300 hover:shadow-md",
          onSeasonClick && "cursor-pointer",
          className
        )}
        onClick={() => onSeasonClick?.(season)}
        role={onSeasonClick ? "button" : undefined}
        tabIndex={onSeasonClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onSeasonClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onSeasonClick(season);
          }
        }}
        aria-label={`Current season: ${config.name}`}
      >
        <Icon className={cn("h-4 w-4", config.color)} aria-hidden="true" />
        <span className={cn("text-sm font-medium", config.color)}>
          {config.name}
        </span>
        {showTemperature && temperature !== undefined && (
          <>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-600">{temperature}°C</span>
          </>
        )}
      </div>
    );
  }

  // Detailed variant - comprehensive display
  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "rounded-lg border p-6",
          config.bgColor,
          config.borderColor,
          animated && "transition-all duration-300",
          className
        )}
        role="region"
        aria-label={`${config.name} season information`}
      >
        {/* Header with gradient */}
        <div className="mb-4">
          <div
            className={cn(
              "inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r",
              config.gradient,
              "text-white shadow-md"
            )}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-bold">{config.name}</h3>
              <p className="text-sm opacity-90">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Temperature info */}
        {showTemperature && (
          <div className="mb-4 flex items-center gap-2">
            <Thermometer className={cn("h-5 w-5", config.color)} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {temperature !== undefined ? (
                  <>
                    <span className="text-lg font-bold">{temperature}°C</span>
                    <span className="text-gray-500 ml-2">
                      (Typical: {config.temperatureRange})
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    Typical range: {config.temperatureRange}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Seasonal activities */}
        {showActivities && (
          <div>
            <h4 className={cn("text-sm font-semibold mb-2", config.color)}>
              Seasonal Activities
            </h4>
            <div className="flex flex-wrap gap-2">
              {config.activities.map((activity, index) => (
                <span
                  key={index}
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                    "bg-white border",
                    config.borderColor,
                    config.color
                  )}
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant - balanced display
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        config.bgColor,
        config.borderColor,
        animated && "transition-all duration-300 hover:shadow-lg",
        onSeasonClick && "cursor-pointer",
        className
      )}
      onClick={() => onSeasonClick?.(season)}
      role={onSeasonClick ? "button" : "region"}
      tabIndex={onSeasonClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSeasonClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSeasonClick(season);
        }
      }}
      aria-label={`Current season: ${config.name} - ${config.description}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 p-3 rounded-lg bg-gradient-to-br",
            config.gradient,
            "text-white shadow-md"
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn("text-lg font-bold", config.color)}>
              {config.emoji} {config.name}
            </h3>
            {showTemperature && temperature !== undefined && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <Thermometer className="h-3.5 w-3.5" aria-hidden="true" />
                {temperature}°C
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{config.description}</p>

          {/* Activities */}
          {showActivities && (
            <div className="flex flex-wrap gap-1.5">
              {config.activities.map((activity, index) => (
                <span
                  key={index}
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    "bg-white border",
                    config.borderColor,
                    config.color
                  )}
                >
                  {activity}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS - Agricultural Consciousness
// ============================================================================

/**
 * Get current season based on date (Northern Hemisphere)
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11

  if (month >= 2 && month <= 4) return "SPRING"; // Mar, Apr, May
  if (month >= 5 && month <= 7) return "SUMMER"; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return "FALL"; // Sep, Oct, Nov
  return "WINTER"; // Dec, Jan, Feb
}

/**
 * Get season configuration
 */
export function getSeasonConfig(season: Season): SeasonConfig {
  return SEASON_CONFIG[season];
}

/**
 * Check if activity is appropriate for season
 */
export function isSeasonalActivity(season: Season, activity: string): boolean {
  return SEASON_CONFIG[season].activities.some(
    (a) => a.toLowerCase() === activity.toLowerCase()
  );
}

// ============================================================================
// DISPLAY NAME - For React DevTools
// ============================================================================

SeasonalIndicator.displayName = "SeasonalIndicator";

// ============================================================================
// EXPORTS
// ============================================================================

export default SeasonalIndicator;
