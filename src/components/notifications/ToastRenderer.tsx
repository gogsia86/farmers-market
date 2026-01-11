/**
 * @fileoverview Toast Renderer - Global Toast Display
 * @module components/notifications/ToastRenderer
 * @description Divine toast renderer with agricultural consciousness
 *
 * Features:
 * - Renders active toasts from context
 * - Supports all toast positions
 * - Auto-dismiss handling
 * - Stacking and animations with Framer Motion
 * - Accessibility compliant with reduced motion support
 * - Agricultural theming with seasonal variants
 * - 86 animation variants integrated
 *
 * @version 2.0.0 - Framer Motion Integration
 * @since 2024-11-15
 */

"use client";

import type { ToastNotification } from "@/lib/notifications/types";
import { AnimatePresence } from "framer-motion";
import React from "react";
import type { CSSProperties } from "react";
import {
  defaultToastVariants,
  getAccessibleToastVariants,
  getSeasonalToastVariants,
  getSeverityToastVariants,
} from "./animations/toast-animations";
import { useAnimationContext } from "./context/AnimationContext";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useNotificationContext } from "./NotificationProvider";
import { Toast } from "./Toast";

// ============================================================================
// Types
// ============================================================================

export interface ToastRendererProps {
  /**
   * Maximum toasts to show per position
   * @default 3
   */
  maxPerPosition?: number;

  /**
   * Offset from screen edge
   * @default "1rem"
   */
  offset?: string;

  /**
   * Gap between toasts
   * @default "0.5rem"
   */
  gap?: string;

  /**
   * Z-index for toast container
   * @default 9999
   */
  zIndex?: number;
}

type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get position styles for toast container
 */
function getPositionStyles(
  position: ToastPosition,
  offset: string,
): CSSProperties {
  const styles: CSSProperties = {
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    pointerEvents: "none",
    zIndex: 9999,
  };

  switch (position) {
    case "top-left":
      return { ...styles, top: offset, left: offset };
    case "top-center":
      return {
        ...styles,
        top: offset,
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "top-right":
      return { ...styles, top: offset, right: offset };
    case "bottom-left":
      return { ...styles, bottom: offset, left: offset };
    case "bottom-center":
      return {
        ...styles,
        bottom: offset,
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "bottom-right":
      return { ...styles, bottom: offset, right: offset };
    default:
      return { ...styles, top: offset, right: offset };
  }
}

/**
 * Select appropriate animation variants for a toast
 */
function selectToastVariants(
  toast: ToastNotification,
  position: ToastPosition,
  prefersReducedMotion: boolean,
  useSeasonalAnimations: boolean,
) {
  // Check for reduced motion
  if (prefersReducedMotion) {
    const isTop = (position || "top-right").startsWith("top");
    return getAccessibleToastVariants(isTop);
  }

  // Check for agricultural/seasonal toast
  const agriculturalData = toast.metadata?.agricultural;
  const isAgricultural = toast.severity === "agricultural";

  if (isAgricultural && agriculturalData?.season && useSeasonalAnimations) {
    return getSeasonalToastVariants(agriculturalData.season);
  }

  // Use severity-based variants
  if (toast.severity) {
    return getSeverityToastVariants(toast.severity);
  }

  // Default variants
  return defaultToastVariants;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Toast Renderer Component
 * Renders all active toasts from notification context
 */
export function ToastRenderer({
  maxPerPosition = 3,
  offset = "1rem",
  gap = "0.5rem",
  zIndex = 9999,
}: ToastRendererProps) {
  const { toasts, dismissToast } = useNotificationContext();
  const prefersReducedMotion = useReducedMotion();

  // Try to get animation context, but don't fail if not available
  let animationContext: any = null;
  try {
    animationContext = useAnimationContext?.() || null;
  } catch {
    // Context not available, continue without it
  }

  // Group toasts by position
  const toastsByPosition = toasts.reduce(
    (acc, toast) => {
      const position =
        ((toast.metadata as any)?.position as ToastPosition) || "top-right";
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, ToastNotification[]>,
  );

  // Position array for consistent ordering
  const positions: ToastPosition[] = [
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];

  return (
    <>
      {positions.map((position: ToastPosition) => {
        const positionToasts = toastsByPosition[position] || [];
        if (positionToasts.length === 0) return null;

        // Limit toasts per position
        const visibleToasts = positionToasts.slice(0, maxPerPosition);
        const positionStyles = getPositionStyles(position, offset);

        return (
          <div
            key={position}
            style={{
              ...positionStyles,
              zIndex,
              gap,
            }}
            aria-live="polite"
            aria-label={`Notifications: ${position.replace("-", " ")}`}
          >
            <AnimatePresence mode="sync">
              {visibleToasts.map((toast: any, index: any) => {
                // Select appropriate variants for this toast
                const variants = selectToastVariants(
                  toast,
                  position,
                  prefersReducedMotion,
                  animationContext?.useSeasonalAnimations ?? true,
                );

                return (
                  <Toast
                    key={toast.id}
                    notification={toast}
                    onDismiss={() => dismissToast(toast.id)}
                    onActionClick={(actionId) => {
                      // Handle action click
                      const action = toast.actions?.find(
                        (a: any) => a.id === actionId,
                      );
                      action?.onClick?.();
                    }}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}

// ============================================================================
// Display Name
// ============================================================================

ToastRenderer.displayName = "ToastRenderer";

// ============================================================================
// Export Memoized Version
// ============================================================================

import { memo } from "react";

export default memo(ToastRenderer);
