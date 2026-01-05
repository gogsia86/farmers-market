/**
 * @fileoverview Banner Notification Component
 * @module components/notifications/Banner
 * @description Divine banner notifications for persistent alerts with agricultural consciousness
 *
 * Features:
 * - Persistent alert banners (top, bottom, inline)
 * - Multiple severity levels (info, success, warning, error, agricultural)
 * - Sticky positioning option
 * - Dismissible with X button
 * - Action buttons support
 * - Agricultural seasonal themes
 * - Variants (default, outline, filled)
 * - Accessibility (ARIA labels, roles, reduced motion)
 * - Framer Motion animations with position awareness
 *
 * @example
 * ```tsx
 * <Banner
 *   notification={{
 *     title: "System Maintenance",
 *     message: "Scheduled maintenance tonight at 11 PM",
 *     severity: "warning",
 *     position: "top",
 *     sticky: true
 *   }}
 *   onDismiss={() => console.log("Dismissed")}
 * />
 *
 * <AgriculturalBanner
 *   title="Harvest Season"
 *   message="Fresh produce available now!"
 *   season="fall"
 *   eventType="harvesting"
 * />
 * ```
 *
 * @version 2.0.0 - Framer Motion Integration
 * @since 2024-11-15
 */

"use client";

import type {
  BannerNotification,
  NotificationAction,
  NotificationSeverity,
} from "@/lib/notifications/types";
import {
  getCurrentSeason,
  getSeasonalColors,
  getSeasonalMessagePrefix,
} from "@/lib/notifications/utils";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Sprout,
  X,
  XCircle,
} from "lucide-react";
import React from "react";
import {
  defaultBannerVariants,
  getAccessibleBannerVariants,
  getSeasonalBannerVariants,
  getSeverityBannerVariants,
} from "./animations/banner-animations";
import { useAnimationContext } from "./context/AnimationContext";
import { useReducedMotion } from "./hooks/useReducedMotion";

// ============================================================================
// Banner Variants
// ============================================================================

const bannerVariants = cva(
  [
    "flex w-full items-start gap-3 p-4 transition-all",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2",
  ].join(" "),
  {
    variants: {
      severity: {
        info: "bg-blue-50 text-blue-900",
        success: "bg-green-50 text-green-900",
        warning: "bg-yellow-50 text-yellow-900",
        error: "bg-red-50 text-red-900",
        agricultural: "bg-emerald-50 text-emerald-900",
      },
      variant: {
        default: "",
        outline: "bg-transparent",
        filled: "",
      },
      bordered: {
        true: "border",
        false: "",
      },
      position: {
        top: "rounded-none",
        bottom: "rounded-none",
        inline: "rounded-lg",
      },
    },
    compoundVariants: [
      // Outline variant colors
      {
        severity: "info",
        variant: "outline",
        class: "border-blue-200 text-blue-900",
      },
      {
        severity: "success",
        variant: "outline",
        class: "border-green-200 text-green-900",
      },
      {
        severity: "warning",
        variant: "outline",
        class: "border-yellow-200 text-yellow-900",
      },
      {
        severity: "error",
        variant: "outline",
        class: "border-red-200 text-red-900",
      },
      {
        severity: "agricultural",
        variant: "outline",
        class: "border-emerald-200 text-emerald-900",
      },
      // Filled variant colors
      {
        severity: "info",
        variant: "filled",
        class: "bg-blue-600 text-white",
      },
      {
        severity: "success",
        variant: "filled",
        class: "bg-green-600 text-white",
      },
      {
        severity: "warning",
        variant: "filled",
        class: "bg-yellow-600 text-white",
      },
      {
        severity: "error",
        variant: "filled",
        class: "bg-red-600 text-white",
      },
      {
        severity: "agricultural",
        variant: "filled",
        class: "bg-emerald-600 text-white",
      },
      // Border colors
      {
        severity: "info",
        bordered: true,
        class: "border-blue-200",
      },
      {
        severity: "success",
        bordered: true,
        class: "border-green-200",
      },
      {
        severity: "warning",
        bordered: true,
        class: "border-yellow-200",
      },
      {
        severity: "error",
        bordered: true,
        class: "border-red-200",
      },
      {
        severity: "agricultural",
        bordered: true,
        class: "border-emerald-200",
      },
    ],
    defaultVariants: {
      severity: "info",
      variant: "default",
      bordered: true,
      position: "inline",
    },
  }
);

const iconVariants = cva("h-5 w-5 flex-shrink-0", {
  variants: {
    severity: {
      info: "text-blue-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
      agricultural: "text-emerald-600",
    },
    variant: {
      default: "",
      outline: "",
      filled: "text-white",
    },
  },
  defaultVariants: {
    severity: "info",
    variant: "default",
  },
});

// ============================================================================
// Banner Component
// ============================================================================

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
  VariantProps<typeof bannerVariants> {
  /** Banner notification data */
  notification: BannerNotification;

  /** Dismiss handler */
  onDismiss?: () => void;

  /** Action click handler */
  onActionClick?: (actionId: string) => void;
}

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      notification,
      onDismiss,
      onActionClick,
      severity = notification.severity,
      variant = notification.variant,
      bordered = notification.bordered,
      position = notification.position,
      className,
      ...props
    },
    ref
  ) => {
    const dismissible = notification.dismissible ?? true;
    const sticky = notification.sticky ?? false;
    const actions = notification.actions ?? [];
    const isAgricultural = severity === "agricultural";
    const agriculturalData = notification.metadata?.agricultural;

    // Animation hooks
    const prefersReducedMotion = useReducedMotion();

    // Try to get animation context, but don't fail if not available
    let animationContext: any = null;
    try {
      animationContext = useAnimationContext?.() || null;
    } catch {
      // Context not available, continue without it
    }

    // Ensure severity is not null
    const effectiveSeverity = severity || "info";
    const effectivePosition = position || "inline";

    // Get icon based on severity
    const Icon = getIconForSeverity(effectiveSeverity);

    // Get seasonal styling for agricultural banners
    const seasonalColors = isAgricultural
      ? getSeasonalColors(agriculturalData?.season ?? getCurrentSeason())
      : null;

    // Select appropriate animation variants
    let motionVariants;
    if (prefersReducedMotion) {
      // Accessible variants with minimal motion
      motionVariants = getAccessibleBannerVariants(effectivePosition === "top" || effectivePosition === "bottom");
    } else if (isAgricultural && agriculturalData?.season && animationContext?.useSeasonalAnimations) {
      // Seasonal variants for agricultural banners
      motionVariants = getSeasonalBannerVariants(agriculturalData.season);
    } else if (effectiveSeverity) {
      // Severity-based variants
      motionVariants = getSeverityBannerVariants(effectiveSeverity);
    } else {
      // Default variants
      motionVariants = defaultBannerVariants;
    }

    // Remove conflicting event handlers
    const {
      onDrag,
      onDragEnd,
      onDragStart,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      ...restProps
    } = props;

    return (
      <motion.div
        ref={ref}
        role="alert"
        aria-live={severity === "error" ? "assertive" : "polite"}
        aria-atomic="true"
        className={cn(
          bannerVariants({ severity: effectiveSeverity, variant, bordered, position: effectivePosition }),
          sticky &&
          (effectivePosition === "top" || effectivePosition === "bottom") &&
          "sticky z-50",
          effectivePosition === "top" && sticky && "top-0",
          effectivePosition === "bottom" && sticky && "bottom-0",
          className
        )}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={motionVariants}
        layout
        {...restProps}
      >
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          <Icon
            className={iconVariants({ severity, variant })}
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Title */}
          {notification.title && (
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "text-sm font-semibold leading-none",
                  variant === "filled" && "text-white"
                )}
              >
                {isAgricultural &&
                  agriculturalData?.season &&
                  `${getSeasonalMessagePrefix(agriculturalData.season)} `}
                {notification.title}
              </p>
            </div>
          )}

          {/* Message */}
          {notification.message && (
            <p
              className={cn(
                "text-sm",
                variant === "filled" ? "text-white/90" : "opacity-90"
              )}
            >
              {notification.message}
            </p>
          )}

          {/* Agricultural Metadata */}
          {isAgricultural && agriculturalData && (
            <div className="flex flex-wrap gap-2 text-xs opacity-75">
              {agriculturalData.farmName && (
                <span
                  className={cn(
                    "rounded px-2 py-0.5",
                    variant === "filled"
                      ? "bg-white/20 text-white"
                      : "bg-white/50"
                  )}
                >
                  🏡 {agriculturalData.farmName}
                </span>
              )}
              {agriculturalData.productName && (
                <span
                  className={cn(
                    "rounded px-2 py-0.5",
                    variant === "filled"
                      ? "bg-white/20 text-white"
                      : "bg-white/50"
                  )}
                >
                  🌾 {agriculturalData.productName}
                </span>
              )}
              {agriculturalData.eventType && (
                <span
                  className={cn(
                    "rounded px-2 py-0.5",
                    variant === "filled"
                      ? "bg-white/20 text-white"
                      : "bg-white/50"
                  )}
                >
                  {getEventTypeLabel(agriculturalData.eventType)}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    onActionClick?.(action.id);
                  }}
                  disabled={action.disabled}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    // Primary action styling
                    action.type === "primary" &&
                    variant !== "filled" &&
                    severity === "info" &&
                    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
                    action.type === "primary" &&
                    variant !== "filled" &&
                    severity === "success" &&
                    "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
                    action.type === "primary" &&
                    variant !== "filled" &&
                    severity === "warning" &&
                    "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
                    action.type === "primary" &&
                    variant !== "filled" &&
                    severity === "error" &&
                    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
                    action.type === "primary" &&
                    variant !== "filled" &&
                    severity === "agricultural" &&
                    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
                    // Primary on filled variant
                    action.type === "primary" &&
                    variant === "filled" &&
                    "bg-white text-gray-900 hover:bg-gray-100 focus:ring-white",
                    // Secondary action styling
                    action.type === "secondary" &&
                    "bg-white/80 text-gray-700 hover:bg-white focus:ring-gray-400",
                    action.type === "tertiary" &&
                    "text-gray-700 hover:bg-white/50 focus:ring-gray-400",
                    action.disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {action.icon && <span>{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              "flex-shrink-0 rounded p-1 transition-colors",
              "hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1",
              variant !== "filled" && severity === "info" && "focus:ring-blue-500",
              variant !== "filled" && severity === "success" && "focus:ring-green-500",
              variant !== "filled" && severity === "warning" && "focus:ring-yellow-500",
              variant !== "filled" && severity === "error" && "focus:ring-red-500",
              variant !== "filled" && severity === "agricultural" && "focus:ring-emerald-500",
              variant === "filled" && "text-white hover:bg-white/20 focus:ring-white"
            )}
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </motion.div>
    );
  }
);

Banner.displayName = "Banner";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get icon component for severity level
 */
function getIconForSeverity(severity: NotificationSeverity) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    agricultural: Sprout,
  };

  return icons[severity] ?? Info;
}

/**
 * Get label for agricultural event type
 */
function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    planting: "🌱 Planting",
    growing: "🌿 Growing",
    harvesting: "🌾 Harvesting",
    processing: "⚙️ Processing",
    market_opening: "🏪 Market Open",
    market_closing: "🔒 Market Close",
    weather_alert: "⚠️ Weather",
    seasonal_change: "🍃 Season Change",
    crop_ready: "✅ Ready",
    harvest_complete: "🎉 Complete",
    product_available: "📦 Available",
    low_stock: "⚠️ Low Stock",
    out_of_stock: "❌ Out of Stock",
  };

  return labels[eventType] ?? eventType;
}

// ============================================================================
// Banner Variants for Quick Access
// ============================================================================

export interface QuickBannerProps {
  title?: string;
  message: string;
  position?: "top" | "bottom" | "inline";
  sticky?: boolean;
  variant?: "default" | "outline" | "filled";
  actions?: NotificationAction[];
  onDismiss?: () => void;
}

/**
 * Info banner (blue)
 */
export function InfoBanner({
  title = "Info",
  message,
  position = "inline",
  sticky = false,
  variant = "default",
  actions,
  onDismiss,
}: QuickBannerProps) {
  const notification: BannerNotification = {
    id: `banner-${Date.now()}`,
    type: "banner",
    severity: "info",
    priority: "medium",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    position,
    sticky,
    variant,
    dismissible: true,
    actions,
  };

  return <Banner notification={notification} onDismiss={onDismiss} />;
}

/**
 * Success banner (green)
 */
export function SuccessBanner({
  title = "Success",
  message,
  position = "inline",
  sticky = false,
  variant = "default",
  actions,
  onDismiss,
}: QuickBannerProps) {
  const notification: BannerNotification = {
    id: `banner-${Date.now()}`,
    type: "banner",
    severity: "success",
    priority: "medium",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    position,
    sticky,
    variant,
    dismissible: true,
    actions,
  };

  return <Banner notification={notification} onDismiss={onDismiss} />;
}

/**
 * Warning banner (yellow)
 */
export function WarningBanner({
  title = "Warning",
  message,
  position = "inline",
  sticky = false,
  variant = "default",
  actions,
  onDismiss,
}: QuickBannerProps) {
  const notification: BannerNotification = {
    id: `banner-${Date.now()}`,
    type: "banner",
    severity: "warning",
    priority: "high",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    position,
    sticky,
    variant,
    dismissible: true,
    actions,
  };

  return <Banner notification={notification} onDismiss={onDismiss} />;
}

/**
 * Error banner (red)
 */
export function ErrorBanner({
  title = "Error",
  message,
  position = "inline",
  sticky = false,
  variant = "default",
  actions,
  onDismiss,
}: QuickBannerProps) {
  const notification: BannerNotification = {
    id: `banner-${Date.now()}`,
    type: "banner",
    severity: "error",
    priority: "urgent",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    position,
    sticky,
    variant,
    dismissible: true,
    actions,
  };

  return <Banner notification={notification} onDismiss={onDismiss} />;
}

/**
 * Agricultural banner (emerald with seasonal themes)
 */
export interface AgriculturalBannerProps extends QuickBannerProps {
  season?: "spring" | "summer" | "fall" | "winter";
  eventType?: string;
  farmName?: string;
  productName?: string;
}

export function AgriculturalBanner({
  title = "Agricultural Update",
  message,
  position = "inline",
  sticky = false,
  variant = "default",
  season,
  eventType,
  farmName,
  productName,
  actions,
  onDismiss,
}: AgriculturalBannerProps) {
  const notification: BannerNotification = {
    id: `banner-${Date.now()}`,
    type: "banner",
    severity: "agricultural",
    priority: "medium",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    position,
    sticky,
    variant,
    dismissible: true,
    actions,
    metadata: {
      agricultural: {
        season: season ?? getCurrentSeason(),
        eventType: eventType as any,
        farmName,
        productName,
      },
    },
  };

  return <Banner notification={notification} onDismiss={onDismiss} />;
}

// ============================================================================
// Export
// ============================================================================

export default Banner;
