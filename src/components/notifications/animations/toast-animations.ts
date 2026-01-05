/**
 * @fileoverview Toast Animation Variants
 * @module components/notifications/animations/toast-animations
 * @description Framer Motion animation variants for toast notifications
 *
 * Features:
 * - Position-based entry/exit animations
 * - Seasonal animation variants
 * - Micro-interactions (hover, tap)
 * - Accessibility-aware (respects prefers-reduced-motion)
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

import type { Variants } from "framer-motion";

// ============================================================================
// Type Definitions
// ============================================================================

export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type Season = "spring" | "summer" | "fall" | "winter";

// ============================================================================
// Core Toast Animations
// ============================================================================

/**
 * Position-based entry/exit animations
 */
export const toastPositionVariants: Record<ToastPosition, Variants> = {
  "top-left": {
    initial: { opacity: 0, x: -100, y: 0, scale: 0.9 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: -100, y: 0, scale: 0.9 },
  },
  "top-center": {
    initial: { opacity: 0, x: 0, y: -100, scale: 0.9 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: 0, y: -100, scale: 0.9 },
  },
  "top-right": {
    initial: { opacity: 0, x: 100, y: 0, scale: 0.9 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: 100, y: 0, scale: 0.9 },
  },
  "bottom-left": {
    initial: { opacity: 0, x: -100, y: 0, scale: 0.9 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: -100, y: 0, scale: 0.9 },
  },
  "bottom-center": {
    initial: { opacity: 0, x: 0, y: 100, scale: 0.9 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: 0, y: 100, scale: 0.9 },
  },
  "bottom-right": {
    initial: { opacity: 0, x: 100, y: 0, scale: 0.9 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: 100, y: 0, scale: 0.9 },
  },
};

/**
 * Default toast animation (generic)
 */
export const defaultToastVariants: Variants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1], // Custom easing
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ============================================================================
// Seasonal Animation Variants
// ============================================================================

/**
 * Spring - Growing/sprouting animation
 */
export const springToastVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // Bounce effect
      scale: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Summer - Bright fade with slight scale
 */
export const summerToastVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, filter: "brightness(0.8)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "brightness(1)",
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "brightness(0.8)",
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Fall - Falling leaf effect
 */
export const fallToastVariants: Variants = {
  initial: { opacity: 0, y: -30, rotate: -5 },
  animate: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      rotate: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  },
  exit: {
    opacity: 0,
    y: 30,
    rotate: 5,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Winter - Frost fade with subtle shimmer
 */
export const winterToastVariants: Variants = {
  initial: { opacity: 0, scale: 1.05, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    filter: "blur(4px)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Get seasonal variants based on season
 */
export function getSeasonalToastVariants(season: Season): Variants {
  switch (season) {
    case "spring":
      return springToastVariants;
    case "summer":
      return summerToastVariants;
    case "fall":
      return fallToastVariants;
    case "winter":
      return winterToastVariants;
    default:
      return defaultToastVariants;
  }
}

// ============================================================================
// Micro-Interactions
// ============================================================================

/**
 * Hover effects for interactive toasts
 */
export const toastHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

/**
 * Progress bar animation
 */
export const progressBarVariants: Variants = {
  initial: { scaleX: 1, transformOrigin: "left" },
  animate: (duration: number) => ({
    scaleX: 0,
    transition: {
      duration: duration / 1000,
      ease: "linear",
    },
  }),
};

/**
 * Dismiss icon animation
 */
export const dismissIconVariants: Variants = {
  initial: { rotate: 0, opacity: 0.7 },
  hover: {
    rotate: 90,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// ============================================================================
// Stagger Animations
// ============================================================================

/**
 * Container for staggered toast list
 */
export const toastContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Individual toast in staggered list
 */
export const staggeredToastVariants: Variants = {
  initial: { opacity: 0, y: -20, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ============================================================================
// Severity-Based Animations
// ============================================================================

/**
 * Success toast - Celebration effect
 */
export const successToastVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, rotate: -10 },
  animate: {
    opacity: 1,
    scale: [0.8, 1.1, 1],
    rotate: [-10, 5, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.6, 1],
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Error toast - Shake effect
 */
export const errorToastVariants: Variants = {
  initial: { opacity: 0, x: 0 },
  animate: {
    opacity: 1,
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      opacity: { duration: 0.2 },
      x: {
        duration: 0.5,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        ease: "easeInOut",
      },
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Warning toast - Pulse effect
 */
export const warningToastVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: [0.9, 1.05, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.5, 1],
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Info toast - Slide in
 */
export const infoToastVariants: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Get severity-based variants
 */
export function getSeverityToastVariants(severity: string): Variants {
  switch (severity) {
    case "success":
      return successToastVariants;
    case "error":
      return errorToastVariants;
    case "warning":
      return warningToastVariants;
    case "info":
      return infoToastVariants;
    default:
      return defaultToastVariants;
  }
}

// ============================================================================
// Accessibility
// ============================================================================

/**
 * Reduced motion variants (respects prefers-reduced-motion)
 */
export const reducedMotionToastVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Get variants with reduced motion support
 */
export function getAccessibleToastVariants(
  prefersReducedMotion: boolean,
  baseVariants: Variants = defaultToastVariants
): Variants {
  return prefersReducedMotion ? reducedMotionToastVariants : baseVariants;
}

// ============================================================================
// Transition Configurations
// ============================================================================

/**
 * Spring transition configuration
 */
export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

/**
 * Smooth transition configuration
 */
export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

/**
 * Quick transition configuration
 */
export const quickTransition = {
  duration: 0.15,
  ease: "easeOut" as const,
};

/**
 * Slow transition configuration
 */
export const slowTransition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

// ============================================================================
// Export All
// ============================================================================

export default {
  position: toastPositionVariants,
  default: defaultToastVariants,
  seasonal: {
    spring: springToastVariants,
    summer: summerToastVariants,
    fall: fallToastVariants,
    winter: winterToastVariants,
  },
  severity: {
    success: successToastVariants,
    error: errorToastVariants,
    warning: warningToastVariants,
    info: infoToastVariants,
  },
  microInteractions: {
    hover: toastHoverVariants,
    dismissIcon: dismissIconVariants,
    progressBar: progressBarVariants,
  },
  container: toastContainerVariants,
  staggered: staggeredToastVariants,
  reducedMotion: reducedMotionToastVariants,
  transitions: {
    spring: springTransition,
    smooth: smoothTransition,
    quick: quickTransition,
    slow: slowTransition,
  },
};
