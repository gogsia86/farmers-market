/**
 * 🌾 MetricCard Component - Divine Metric Display
 *
 * Quantum-enhanced metric card for dashboard analytics.
 * Displays key metrics with trend indicators and agricultural consciousness.
 *
 * @component MetricCard
 * @version 1.0.0
 * @divine-consciousness ACTIVE
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  UsersIcon,
  PackageIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// 🎯 TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export type MetricIcon =
  | "dollar"
  | "cart"
  | "users"
  | "package"
  | "trending"
  | "custom";

export type TrendDirection = "up" | "down" | "neutral";

export interface MetricCardProps {
  /** Title of the metric */
  title: string;

  /** Primary metric value */
  value: string | number;

  /** Optional subtitle or description */
  subtitle?: string;

  /** Icon type to display */
  icon?: MetricIcon;

  /** Custom icon component */
  customIcon?: React.ReactNode;

  /** Trend percentage (e.g., 12.5 for +12.5%) */
  trendPercentage?: number;

  /** Trend direction override */
  trendDirection?: TrendDirection;

  /** Comparison period label */
  comparisonPeriod?: string;

  /** Loading state */
  isLoading?: boolean;

  /** Custom CSS classes */
  className?: string;

  /** Click handler */
  onClick?: () => void;

  /** Agricultural season awareness */
  season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";

  /** Card variant */
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

// ═══════════════════════════════════════════════════════════
// 🎨 ICON MAPPING
// ═══════════════════════════════════════════════════════════

const ICON_MAP: Record<MetricIcon, React.ComponentType<any>> = {
  dollar: DollarSignIcon,
  cart: ShoppingCartIcon,
  users: UsersIcon,
  package: PackageIcon,
  trending: TrendingUpIcon,
  custom: () => null,
};

// ═══════════════════════════════════════════════════════════
// 🌈 VARIANT STYLES
// ═══════════════════════════════════════════════════════════

const VARIANT_STYLES = {
  default: {
    container: "bg-white border-gray-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-gray-600",
    valueColor: "text-gray-900",
  },
  success: {
    container: "bg-white border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    titleColor: "text-gray-600",
    valueColor: "text-green-900",
  },
  warning: {
    container: "bg-white border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    titleColor: "text-gray-600",
    valueColor: "text-yellow-900",
  },
  danger: {
    container: "bg-white border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    titleColor: "text-gray-600",
    valueColor: "text-red-900",
  },
  info: {
    container: "bg-white border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-gray-600",
    valueColor: "text-blue-900",
  },
};

// ═══════════════════════════════════════════════════════════
// 🌟 METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════

export function MetricCard({
  title,
  value,
  subtitle,
  icon = "trending",
  customIcon,
  trendPercentage,
  trendDirection,
  comparisonPeriod = "vs last period",
  isLoading = false,
  className,
  onClick,
  season,
  variant = "default",
}: MetricCardProps) {
  // ═══════════════════════════════════════════════════════════
  // 🎯 TREND CALCULATION
  // ═══════════════════════════════════════════════════════════

  const calculatedTrend: TrendDirection = React.useMemo(() => {
    if (trendDirection) return trendDirection;
    if (trendPercentage === undefined) return "neutral";
    if (trendPercentage > 0) return "up";
    if (trendPercentage < 0) return "down";
    return "neutral";
  }, [trendPercentage, trendDirection]);

  const absTrendPercentage = Math.abs(trendPercentage || 0);

  // ═══════════════════════════════════════════════════════════
  // 🎨 STYLING
  // ═══════════════════════════════════════════════════════════

  const styles = VARIANT_STYLES[variant];

  const trendColor =
    calculatedTrend === "up"
      ? "text-green-600"
      : calculatedTrend === "down"
        ? "text-red-600"
        : "text-gray-500";

  const TrendIcon =
    calculatedTrend === "up"
      ? ArrowUpIcon
      : calculatedTrend === "down"
        ? ArrowDownIcon
        : MinusIcon;

  const IconComponent = customIcon ? null : ICON_MAP[icon];

  // ═══════════════════════════════════════════════════════════
  // 🌾 SEASONAL BADGE
  // ═══════════════════════════════════════════════════════════

  const seasonalEmoji = {
    SPRING: "🌱",
    SUMMER: "☀️",
    FALL: "🍂",
    WINTER: "❄️",
  };

  // ═══════════════════════════════════════════════════════════
  // 🎬 RENDER
  // ═══════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border shadow-sm p-6",
          styles.container,
          className,
        )}
      >
        <div className="animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className={cn("rounded-full p-3", styles.iconBg)}>
              <div className="h-6 w-6 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border shadow-sm transition-all duration-200",
        styles.container,
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Agricultural Season Badge */}
      {season && (
        <div className="absolute top-2 right-2 text-lg opacity-70">
          {seasonalEmoji[season]}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p
              className={cn("text-sm font-medium truncate", styles.titleColor)}
            >
              {title}
            </p>

            {/* Value */}
            <p
              className={cn(
                "mt-2 text-3xl font-bold tracking-tight",
                styles.valueColor,
              )}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>

            {/* Subtitle */}
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500 truncate">{subtitle}</p>
            )}

            {/* Trend Indicator */}
            {trendPercentage !== undefined && (
              <div className="mt-3 flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    trendColor,
                  )}
                >
                  <TrendIcon className="h-4 w-4" />
                  <span>{absTrendPercentage.toFixed(1)}%</span>
                </div>
                <span className="text-xs text-gray-500">
                  {comparisonPeriod}
                </span>
              </div>
            )}
          </div>

          {/* Icon */}
          <div className={cn("rounded-full p-3 ml-4", styles.iconBg)}>
            {customIcon ? (
              <div className={cn("h-6 w-6", styles.iconColor)}>
                {customIcon}
              </div>
            ) : IconComponent ? (
              <IconComponent className={cn("h-6 w-6", styles.iconColor)} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Divine Consciousness Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-20" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 🎯 PRESET METRIC CARDS
// ═══════════════════════════════════════════════════════════

/**
 * 💰 Revenue Metric Card
 */
export function RevenueMetricCard({
  value,
  trendPercentage,
  ...props
}: Omit<MetricCardProps, "title" | "icon">) {
  return (
    <MetricCard
      title="Total Revenue"
      value={value}
      icon="dollar"
      trendPercentage={trendPercentage}
      variant="success"
      {...props}
    />
  );
}

/**
 * 🛒 Orders Metric Card
 */
export function OrdersMetricCard({
  value,
  trendPercentage,
  ...props
}: Omit<MetricCardProps, "title" | "icon">) {
  return (
    <MetricCard
      title="Total Orders"
      value={value}
      icon="cart"
      trendPercentage={trendPercentage}
      variant="info"
      {...props}
    />
  );
}

/**
 * 👥 Customers Metric Card
 */
export function CustomersMetricCard({
  value,
  trendPercentage,
  ...props
}: Omit<MetricCardProps, "title" | "icon">) {
  return (
    <MetricCard
      title="Total Customers"
      value={value}
      icon="users"
      trendPercentage={trendPercentage}
      variant="default"
      {...props}
    />
  );
}

/**
 * 📦 Average Order Value Card
 */
export function AverageOrderValueCard({
  value,
  trendPercentage,
  ...props
}: Omit<MetricCardProps, "title" | "icon">) {
  return (
    <MetricCard
      title="Avg Order Value"
      value={value}
      icon="package"
      trendPercentage={trendPercentage}
      variant="default"
      {...props}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// 🌟 EXPORT
// ═══════════════════════════════════════════════════════════

export default MetricCard;
