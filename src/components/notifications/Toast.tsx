/**
 * @fileoverview Toast Notification Component
 * @module components/notifications/Toast
 * @description Divine toast notifications with agricultural consciousness
 *
 * Features:
 * - Multiple severity levels (info, success, warning, error, agricultural)
 * - Customizable positions and durations
 * - Agricultural seasonal themes
 * - Action buttons support
 * - Rich content with icons
 * - Animations (slide, fade, bounce, grow) - POWERED BY FRAMER MOTION
 * - Accessibility (ARIA labels, keyboard navigation, reduced motion)
 * - Dismissible with X button
 * - 86 animation variants with seasonal awareness
 *
 * @example
 * ```tsx
 * // Simple toast
 * toast("Hello, World!");
 *
 * // With options
 * toast.success("Farm created successfully!", {
 *   duration: 5000,
 *   position: "top-right"
 * });
 *
 * // Agricultural toast with seasonal animations
 * toast.agricultural("Harvest season has begun!", {
 *   metadata: {
 *     agricultural: {
 *       season: "fall",
 *       eventType: "harvesting"
 *     }
 *   }
 * });
 * ```
 *
 * @version 2.0.0 - Framer Motion Integration
 * @since 2024-11-15
 */

"use client";

import type {
  NotificationAction,
  NotificationSeverity,
  ToastNotification
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
  defaultToastVariants,
  getAccessibleToastVariants,
  getSeasonalToastVariants,
  getSeverityToastVariants
} from "./animations/toast-animations";
import { useAnimationContext } from "./context/AnimationContext";
import { useReducedMotion } from "./hooks/useReducedMotion";

// ============================================================================
// Toast Variants
// ============================================================================

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full max-w-md items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
  ].join(" "),
  {
    variants: {
      severity: {
        info: "border-blue-200 bg-blue-50 text-blue-900",
        success: "border-green-200 bg-green-50 text-green-900",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
        error: "border-red-200 bg-red-50 text-red-900",
        agricultural: "border-emerald-200 bg-emerald-50 text-emerald-900",
      },
      animation: {
        slide: "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
        fade: "data-[state=open]:fade-in data-[state=closed]:fade-out",
        bounce: "data-[state=open]:animate-bounce-in data-[state=closed]:fade-out",
        grow: "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
      },
    },
    defaultVariants: {
      severity: "info",
      animation: "slide",
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
  },
  defaultVariants: {
    severity: "info",
  },
});

// ============================================================================
// Toast Component
// ============================================================================

export interface ToastProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
  VariantProps<typeof toastVariants> {
  /** Toast notification data */
  notification: ToastNotification;

  /** Dismiss handler */
  onDismiss?: () => void;

  /** Action click handler */
  onActionClick?: (actionId: string) => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      notification,
      onDismiss,
      onActionClick,
      severity = notification.severity,
      animation = notification.animation,
      className,
      ...props
    },
    ref
  ) => {
    const dismissible = notification.dismissible ?? true;
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

    // Get icon based on severity
    const Icon = getIconForSeverity(effectiveSeverity);

    // Get seasonal styling for agricultural toasts
    const seasonalColors = isAgricultural
      ? getSeasonalColors(agriculturalData?.season ?? getCurrentSeason())
      : null;

    // Determine position from metadata
    const position = (notification.metadata as any)?.position || "top-right";

    // Select appropriate animation variants
    let motionVariants;
    if (prefersReducedMotion) {
      // Accessible variants with minimal motion
      motionVariants = getAccessibleToastVariants(position);
    } else if (isAgricultural && agriculturalData?.season && animationContext?.useSeasonalAnimations) {
      // Seasonal variants for agricultural toasts
      motionVariants = getSeasonalToastVariants(agriculturalData.season);
    } else if (effectiveSeverity) {
      // Severity-based variants
      motionVariants = getSeverityToastVariants(effectiveSeverity);
    } else {
      // Default variants
      motionVariants = defaultToastVariants;
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
        className={cn(toastVariants({ severity: effectiveSeverity, animation }), className)}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={motionVariants}
        layout
        {...restProps}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={iconVariants({ severity })} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          {/* Title */}
          {notification.title && (
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none">
                {isAgricultural &&
                  agriculturalData?.season &&
                  `${getSeasonalMessagePrefix(agriculturalData.season)} `}
                {notification.title}
              </p>
            </div>
          )}

          {/* Message */}
          {notification.message && (
            <p className="text-sm opacity-90">{notification.message}</p>
          )}

          {/* Agricultural Metadata */}
          {isAgricultural && agriculturalData && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs opacity-75">
              {agriculturalData.farmName && (
                <span className="rounded bg-white/50 px-2 py-0.5">
                  🏡 {agriculturalData.farmName}
                </span>
              )}
              {agriculturalData.productName && (
                <span className="rounded bg-white/50 px-2 py-0.5">
                  🌾 {agriculturalData.productName}
                </span>
              )}
              {agriculturalData.eventType && (
                <span className="rounded bg-white/50 px-2 py-0.5">
                  {getEventTypeLabel(agriculturalData.eventType)}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {actions.map((action: any) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    onActionClick?.(action.id);
                  }}
                  disabled={action.disabled}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    action.type === "primary" &&
                    severity === "info" &&
                    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
                    action.type === "primary" &&
                    severity === "success" &&
                    "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
                    action.type === "primary" &&
                    severity === "warning" &&
                    "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
                    action.type === "primary" &&
                    severity === "error" &&
                    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
                    action.type === "primary" &&
                    severity === "agricultural" &&
                    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
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
              severity === "info" && "focus:ring-blue-500",
              severity === "success" && "focus:ring-green-500",
              severity === "warning" && "focus:ring-yellow-500",
              severity === "error" && "focus:ring-red-500",
              severity === "agricultural" && "focus:ring-emerald-500"
            )}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </motion.div>
    );
  }
);

Toast.displayName = "Toast";

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
// Toast Container Component
// ============================================================================

export interface ToastContainerProps {
  /** Position of toast container */
  position?:
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

  /** Children (Toast components) */
  children?: React.ReactNode;

  /** Max visible toasts */
  maxVisible?: number;

  /** Custom class name */
  className?: string;
}

export function ToastContainer({
  position = "top-right",
  children,
  maxVisible = 5,
  className,
}: ToastContainerProps) {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-center": "top-0 left-1/2 -translate-x-1/2",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <motion.div
      className={cn(
        "fixed z-[100] flex flex-col gap-2 p-4",
        positionClasses[position],
        className
      )}
      role="region"
      aria-label="Notifications"
      layout
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Toast Variants for Quick Access
// ============================================================================

export interface QuickToastProps {
  title?: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  onDismiss?: () => void;
}

/**
 * Info toast (blue)
 */
export function InfoToast({
  title = "Info",
  message,
  duration = 5000,
  actions,
  onDismiss,
}: QuickToastProps) {
  const notification: ToastNotification = {
    id: `toast-${Date.now()}`,
    type: "toast",
    severity: "info",
    priority: "medium",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    duration,
    dismissible: true,
    actions,
  };

  return <Toast notification={notification} onDismiss={onDismiss} />;
}

/**
 * Success toast (green)
 */
export function SuccessToast({
  title = "Success",
  message,
  duration = 5000,
  actions,
  onDismiss,
}: QuickToastProps) {
  const notification: ToastNotification = {
    id: `toast-${Date.now()}`,
    type: "toast",
    severity: "success",
    priority: "medium",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    duration,
    dismissible: true,
    actions,
  };

  return <Toast notification={notification} onDismiss={onDismiss} />;
}

/**
 * Warning toast (yellow)
 */
export function WarningToast({
  title = "Warning",
  message,
  duration = 7000,
  actions,
  onDismiss,
}: QuickToastProps) {
  const notification: ToastNotification = {
    id: `toast-${Date.now()}`,
    type: "toast",
    severity: "warning",
    priority: "high",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    duration,
    dismissible: true,
    actions,
  };

  return <Toast notification={notification} onDismiss={onDismiss} />;
}

/**
 * Error toast (red)
 */
export function ErrorToast({
  title = "Error",
  message,
  duration = 0, // Persistent by default
  actions,
  onDismiss,
}: QuickToastProps) {
  const notification: ToastNotification = {
    id: `toast-${Date.now()}`,
    type: "toast",
    severity: "error",
    priority: "urgent",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    duration,
    dismissible: true,
    actions,
  };

  return <Toast notification={notification} onDismiss={onDismiss} />;
}

/**
 * Agricultural toast (emerald with seasonal themes)
 */
export interface AgriculturalToastProps extends QuickToastProps {
  season?: "spring" | "summer" | "fall" | "winter";
  eventType?: string;
  farmName?: string;
  productName?: string;
}

export function AgriculturalToast({
  title = "Agricultural Update",
  message,
  duration = 6000,
  season,
  eventType,
  farmName,
  productName,
  actions,
  onDismiss,
}: AgriculturalToastProps) {
  const notification: ToastNotification = {
    id: `toast-${Date.now()}`,
    type: "toast",
    severity: "agricultural",
    priority: "medium",
    status: "sent",
    title,
    message,
    createdAt: new Date(),
    duration,
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

  return <Toast notification={notification} onDismiss={onDismiss} />;
}

// ============================================================================
// Export
// ============================================================================

export default Toast;
