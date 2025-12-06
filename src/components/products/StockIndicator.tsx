/**
 * STOCK INDICATOR COMPONENT
 * Divine stock status display for agricultural products
 * Features: Visual indicators, stock levels, availability messages
 */

"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface StockIndicatorProps {
  availableQuantity: number;
  unit: string;
  lowStockThreshold?: number;
  showQuantity?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "pre-order";

// ============================================
// STOCK INDICATOR COMPONENT
// ============================================

export function StockIndicator({
  availableQuantity,
  unit,
  lowStockThreshold = 10,
  showQuantity = true,
  size = "md",
  className,
}: StockIndicatorProps) {
  // Determine stock status
  const getStockStatus = (): StockStatus => {
    if (availableQuantity <= 0) {
      return "out-of-stock";
    }
    if (availableQuantity <= lowStockThreshold) {
      return "low-stock";
    }
    return "in-stock";
  };

  const stockStatus = getStockStatus();

  // Size configurations
  const sizeClasses = {
    sm: {
      container: "text-xs",
      icon: "h-3 w-3",
      dot: "h-2 w-2",
    },
    md: {
      container: "text-sm",
      icon: "h-4 w-4",
      dot: "h-2.5 w-2.5",
    },
    lg: {
      container: "text-base",
      icon: "h-5 w-5",
      dot: "h-3 w-3",
    },
  };

  const sizeConfig = sizeClasses[size];

  // Status configurations
  const statusConfig = {
    "in-stock": {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      dotColor: "bg-green-500",
      label: "In Stock",
      message: showQuantity
        ? `${availableQuantity} ${unit} available`
        : "Available now",
    },
    "low-stock": {
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      dotColor: "bg-orange-500",
      label: "Low Stock",
      message: showQuantity
        ? `Only ${availableQuantity} ${unit} left!`
        : "Limited availability",
    },
    "out-of-stock": {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      dotColor: "bg-red-500",
      label: "Out of Stock",
      message: "Currently unavailable",
    },
    "pre-order": {
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      dotColor: "bg-blue-500",
      label: "Pre-Order",
      message: "Available for pre-order",
    },
  };

  const config = statusConfig[stockStatus];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2",
        config.bgColor,
        config.borderColor,
        sizeConfig.container,
        className,
      )}
      role="status"
      aria-label={`Stock status: ${config.label}`}
    >
      {/* Status Icon */}
      <Icon className={cn(sizeConfig.icon, config.color)} aria-hidden="true" />

      {/* Status Text */}
      <div className="flex items-center gap-2">
        <span className={cn("font-semibold", config.color)}>
          {config.label}
        </span>
        {size !== "sm" && (
          <>
            <span className={cn("text-gray-400", sizeConfig.dot)}>•</span>
            <span className="text-gray-700">{config.message}</span>
          </>
        )}
      </div>

      {/* Animated pulse dot for low stock */}
      {stockStatus === "low-stock" && size !== "sm" && (
        <span className="relative ml-1 flex">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              config.dotColor,
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full",
              sizeConfig.dot,
              config.dotColor,
            )}
          />
        </span>
      )}
    </div>
  );
}

// ============================================
// SIMPLE BADGE VARIANT
// ============================================

export function StockBadge({
  availableQuantity,
  lowStockThreshold = 10,
  className,
}: {
  availableQuantity: number;
  lowStockThreshold?: number;
  className?: string;
}) {
  const isLowStock =
    availableQuantity > 0 && availableQuantity <= lowStockThreshold;
  const isOutOfStock = availableQuantity <= 0;

  if (isOutOfStock) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800",
          className,
        )}
      >
        Out of Stock
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800",
          className,
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
        </span>
        Low Stock
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800",
        className,
      )}
    >
      In Stock
    </span>
  );
}
