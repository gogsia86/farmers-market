/**
 * 🌾 BIODYNAMIC METRIC - Agricultural Stats Card Component
 *
 * Divine metric display component with trend indicators, comparisons, and agricultural consciousness.
 * Perfect for dashboards, analytics, and performance monitoring with seasonal awareness.
 *
 * FEATURES:
 * - Metric value display with formatting
 * - Trend indicators (up/down/neutral)
 * - Comparison periods (vs previous period)
 * - Icon support with Heroicons
 * - Seasonal color schemes
 * - Loading states
 * - Agricultural consciousness
 * - Accessibility support
 *
 * USAGE:
 * ```tsx
 * <BiodynamicMetric
 *   label="Total Revenue"
 *   value={125400}
 *   format="currency"
 *   trend={{ value: 12.5, direction: "up" }}
 *   comparison="vs last month"
 *   icon={CurrencyDollarIcon}
 *   season="SPRING"
 * />
 * ```
 *
 * DIVINE PATTERN:
 * - Quantum metric manifestation
 * - Biodynamic trend calculations
 * - Agricultural consciousness integration
 * - Seasonal color harmonization
 */

"use client";

import React from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
export type MetricFormat = "number" | "currency" | "percentage" | "decimal" | "custom";
export type TrendDirection = "up" | "down" | "neutral";
export type MetricSize = "sm" | "md" | "lg" | "xl";

/**
 * Trend information
 */
export interface MetricTrend {
  /** Trend value (numeric) */
  value: number;
  /** Trend direction */
  direction: TrendDirection;
  /** Custom label */
  label?: string;
}

/**
 * Main component props
 */
export interface BiodynamicMetricProps {
  /** Metric label/title */
  label: string;
  /** Metric value */
  value: number | string;
  /** Value format type */
  format?: MetricFormat;
  /** Custom format function */
  customFormat?: (value: number | string) => string;
  /** Trend information */
  trend?: MetricTrend;
  /** Comparison period text */
  comparison?: string;
  /** Icon component (Heroicon) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Seasonal theme */
  season?: Season;
  /** Component size */
  size?: MetricSize;
  /** Loading state */
  loading?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Agricultural consciousness */
  consciousness?: "DIVINE" | "QUANTUM" | "BIODYNAMIC";
  /** Show border */
  bordered?: boolean;
  /** Show shadow */
  shadow?: boolean;
  /** Background color override */
  backgroundColor?: string;
  /** Helper text */
  helperText?: string;
}

// ============================================================================
// SEASONAL COLOR SCHEMES
// ============================================================================

const SEASONAL_COLORS = {
  SPRING: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-600",
    text: "text-green-900",
    trend: {
      up: "text-green-600",
      down: "text-red-600",
      neutral: "text-gray-600",
    },
  },
  SUMMER: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    text: "text-amber-900",
    trend: {
      up: "text-amber-600",
      down: "text-red-600",
      neutral: "text-gray-600",
    },
  },
  FALL: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "text-orange-600",
    text: "text-orange-900",
    trend: {
      up: "text-orange-600",
      down: "text-red-600",
      neutral: "text-gray-600",
    },
  },
  WINTER: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-900",
    trend: {
      up: "text-blue-600",
      down: "text-red-600",
      neutral: "text-gray-600",
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format number based on type
 */
function formatValue(value: number | string, format: MetricFormat): string {
  if (typeof value === "string") return value;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case "percentage":
      return `${value.toFixed(1)}%`;

    case "decimal":
      return value.toFixed(2);

    case "number":
      return new Intl.NumberFormat("en-US").format(value);

    default:
      return String(value);
  }
}

/**
 * Get size classes
 */
function getSizeClasses(size: MetricSize) {
  switch (size) {
    case "sm":
      return {
        padding: "p-3",
        labelText: "text-xs",
        valueText: "text-lg",
        iconSize: "h-5 w-5",
        trendText: "text-xs",
      };
    case "md":
      return {
        padding: "p-4",
        labelText: "text-sm",
        valueText: "text-2xl",
        iconSize: "h-6 w-6",
        trendText: "text-sm",
      };
    case "lg":
      return {
        padding: "p-6",
        labelText: "text-base",
        valueText: "text-3xl",
        iconSize: "h-8 w-8",
        trendText: "text-base",
      };
    case "xl":
      return {
        padding: "p-8",
        labelText: "text-lg",
        valueText: "text-4xl",
        iconSize: "h-10 w-10",
        trendText: "text-lg",
      };
    default:
      return getSizeClasses("md");
  }
}

/**
 * Get seasonal colors
 */
function getSeasonalColors(season: Season) {
  return SEASONAL_COLORS[season];
}

// ============================================================================
// BIODYNAMIC METRIC COMPONENT
// ============================================================================

export function BiodynamicMetric({
  label,
  value,
  format = "number",
  customFormat,
  trend,
  comparison,
  icon: Icon,
  season = "SPRING",
  size = "md",
  loading = false,
  className = "",
  onClick,
  consciousness = "DIVINE",
  bordered = true,
  shadow = true,
  backgroundColor,
  helperText,
}: BiodynamicMetricProps) {
  const colors = getSeasonalColors(season);
  const sizeClasses = getSizeClasses(size);

  // Format the display value
  const displayValue = customFormat
    ? customFormat(value)
    : formatValue(typeof value === "number" ? value : parseFloat(String(value)) || 0, format);

  // Get trend icon
  const TrendIcon =
    trend?.direction === "up"
      ? ArrowTrendingUpIcon
      : trend?.direction === "down"
        ? ArrowTrendingDownIcon
        : MinusIcon;

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div
        className={`biodynamic-metric ${sizeClasses.padding} bg-white rounded-lg ${bordered ? "border-2 border-agricultural-200" : ""} ${shadow ? "shadow-md" : ""} ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-agricultural-200 rounded w-24" />
            {Icon && <div className={`${sizeClasses.iconSize} bg-agricultural-200 rounded`} />}
          </div>
          <div className="h-8 bg-agricultural-300 rounded w-32 mb-2" />
          {(trend || comparison) && <div className="h-3 bg-agricultural-200 rounded w-20" />}
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      className={`biodynamic-metric ${sizeClasses.padding} ${backgroundColor || colors.bg} rounded-lg ${bordered ? `border-2 ${colors.border}` : ""} ${shadow ? "shadow-md" : ""} transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-lg hover:scale-105" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Header: Label and Icon */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`${sizeClasses.labelText} font-medium text-gray-600 uppercase tracking-wide`}>
          {label}
        </h3>
        {Icon && (
          <div className={`${colors.icon} ${colors.bg} p-2 rounded-lg`}>
            <Icon className={sizeClasses.iconSize} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className={`${sizeClasses.valueText} font-bold ${colors.text} mb-2`}>
        {displayValue}
      </div>

      {/* Trend and Comparison */}
      {(trend || comparison) && (
        <div className="flex items-center space-x-2">
          {trend && (
            <div
              className={`flex items-center space-x-1 ${colors.trend[trend.direction]} ${sizeClasses.trendText} font-semibold`}
            >
              <TrendIcon className="h-4 w-4" />
              <span>
                {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
                {Math.abs(trend.value)}%
              </span>
              {trend.label && <span className="text-gray-500 font-normal ml-1">{trend.label}</span>}
            </div>
          )}
          {comparison && (
            <span className={`${sizeClasses.trendText} text-gray-500`}>{comparison}</span>
          )}
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <div className="mt-2 text-xs text-gray-500 border-t border-gray-200 pt-2">
          {helperText}
        </div>
      )}

      {/* Divine Consciousness Indicator */}
      {consciousness === "DIVINE" && (
        <div className="mt-2 text-xs text-agricultural-600 opacity-50">
          🌾 Quantum Metric • {season} Consciousness
        </div>
      )}
    </div>
  );
}

// ============================================================================
// METRIC GRID COMPONENT
// ============================================================================

/**
 * Grid layout for multiple metrics
 */
export interface BiodynamicMetricGridProps {
  metrics: BiodynamicMetricProps[];
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function BiodynamicMetricGrid({
  metrics,
  columns = 3,
  gap = "md",
  className = "",
}: BiodynamicMetricGridProps) {
  const gapClass = gap === "sm" ? "gap-3" : gap === "md" ? "gap-4" : "gap-6";
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`biodynamic-metric-grid grid ${gridCols[columns]} ${gapClass} ${className}`}>
      {metrics.map((metric, index) => (
        <BiodynamicMetric key={index} {...metric} />
      ))}
    </div>
  );
}

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate trend from current and previous values
 */
export function calculateTrend(
  current: number,
  previous: number
): { value: number; direction: TrendDirection } {
  if (previous === 0) {
    return { value: 0, direction: "neutral" };
  }

  const change = ((current - previous) / previous) * 100;
  const direction: TrendDirection =
    change > 0.5 ? "up" : change < -0.5 ? "down" : "neutral";

  return {
    value: Math.abs(parseFloat(change.toFixed(1))),
    direction,
  };
}

/**
 * Create metric props helper
 */
export function createMetric(props: BiodynamicMetricProps): BiodynamicMetricProps {
  return props;
}

/**
 * Batch create metrics
 */
export function createMetrics(
  metrics: BiodynamicMetricProps[]
): BiodynamicMetricProps[] {
  return metrics;
}
