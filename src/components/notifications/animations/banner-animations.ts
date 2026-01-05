/**
 * @fileoverview Banner Animation Variants
 * @module components/notifications/animations/banner-animations
 * @description Framer Motion animation variants for banner notifications
 *
 * Features:
 * - Position-based slide animations (top/bottom)
 * - Sticky banner effects
 * - Height transitions
 * - Agricultural-themed transitions
 * - Accessibility support
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

import type { Variants } from "framer-motion";

// ============================================================================
// Type Definitions
// ============================================================================

export type BannerPosition = "top" | "bottom";
export type Season = "spring" | "summer" | "fall" | "winter";

// ============================================================================
// Core Banner Animations
// ============================================================================

/**
 * Top banner slide animation
 */
export const topBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -100,
    height: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      opacity: { duration: 0.2 },
      y: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
      height: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  exit: {
    opacity: 0,
    y: -100,
    height: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Bottom banner slide animation
 */
export const bottomBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: 100,
    height: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      opacity: { duration: 0.2 },
      y: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
      height: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  exit: {
    opacity: 0,
    y: 100,
    height: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Get position-based banner variants
 */
export function getBannerPositionVariants(position: BannerPosition): Variants {
  return position === "top" ? topBannerVariants : bottomBannerVariants;
}

/**
 * Default banner animation
 */
export const defaultBannerVariants: Variants = {
  initial: { opacity: 0, y: -50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ============================================================================
// Sticky Banner Animations
// ============================================================================

/**
 * Sticky banner that slides down and stays
 */
export const stickyTopBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -100,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // Smooth ease-out
    },
  },
  exit: {
    opacity: 0,
    y: -100,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1],
    },
  },
  // Sticky state - slight shadow increase on scroll
  stuck: {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Sticky bottom banner
 */
export const stickyBottomBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 100,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1],
    },
  },
  stuck: {
    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// Seasonal Banner Animations
// ============================================================================

/**
 * Spring banner - Growing from top
 */
export const springBannerVariants: Variants = {
  initial: {
    opacity: 0,
    scaleY: 0,
    transformOrigin: "top",
  },
  animate: {
    opacity: 1,
    scaleY: 1,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1], // Bounce
      scaleY: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  },
  exit: {
    opacity: 0,
    scaleY: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Summer banner - Bright fade with expansion
 */
export const summerBannerVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    filter: "brightness(0.8)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "brightness(1)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "brightness(0.8)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Fall banner - Cascading down like leaves
 */
export const fallBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    rotate: -2,
  },
  animate: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      rotate: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    rotate: 2,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Winter banner - Frosted slide with blur
 */
export const winterBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -100,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -100,
    filter: "blur(8px)",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Get seasonal banner variants
 */
export function getSeasonalBannerVariants(season: Season): Variants {
  switch (season) {
    case "spring":
      return springBannerVariants;
    case "summer":
      return summerBannerVariants;
    case "fall":
      return fallBannerVariants;
    case "winter":
      return winterBannerVariants;
    default:
      return defaultBannerVariants;
  }
}

// ============================================================================
// Severity-Based Banner Animations
// ============================================================================

/**
 * Success banner - Slide with celebration
 */
export const successBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: [0.95, 1.02, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.6, 1],
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Error banner - Attention-grabbing shake
 */
export const errorBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
  },
  animate: {
    opacity: 1,
    y: 0,
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      opacity: { duration: 0.2 },
      y: { duration: 0.3 },
      x: {
        duration: 0.5,
        delay: 0.3,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Warning banner - Pulse effect
 */
export const warningBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.5, 1],
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Info banner - Smooth slide
 */
export const infoBannerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Get severity-based banner variants
 */
export function getSeverityBannerVariants(severity: string): Variants {
  switch (severity) {
    case "success":
      return successBannerVariants;
    case "error":
      return errorBannerVariants;
    case "warning":
      return warningBannerVariants;
    case "info":
      return infoBannerVariants;
    default:
      return defaultBannerVariants;
  }
}

// ============================================================================
// Interactive Animations
// ============================================================================

/**
 * Banner hover effect
 */
export const bannerHoverVariants: Variants = {
  initial: {},
  hover: {
    scale: 1.005,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Dismiss button animation
 */
export const bannerDismissButtonVariants: Variants = {
  initial: { opacity: 0.7, rotate: 0 },
  hover: {
    opacity: 1,
    rotate: 90,
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Banner content reveal animation
 */
export const bannerContentVariants: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// Accessibility
// ============================================================================

/**
 * Reduced motion banner variants
 */
export const reducedMotionBannerVariants: Variants = {
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
 * Get accessible banner variants
 */
export function getAccessibleBannerVariants(
  prefersReducedMotion: boolean,
  baseVariants: Variants = defaultBannerVariants
): Variants {
  return prefersReducedMotion ? reducedMotionBannerVariants : baseVariants;
}

// ============================================================================
// Stagger Animations
// ============================================================================

/**
 * Container for multiple banners
 */
export const bannerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
};

/**
 * Individual banner in staggered container
 */
export const staggeredBannerVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// ============================================================================
// Export All
// ============================================================================

export default {
  position: {
    top: topBannerVariants,
    bottom: bottomBannerVariants,
  },
  sticky: {
    top: stickyTopBannerVariants,
    bottom: stickyBottomBannerVariants,
  },
  seasonal: {
    spring: springBannerVariants,
    summer: summerBannerVariants,
    fall: fallBannerVariants,
    winter: winterBannerVariants,
  },
  severity: {
    success: successBannerVariants,
    error: errorBannerVariants,
    warning: warningBannerVariants,
    info: infoBannerVariants,
  },
  interactive: {
    hover: bannerHoverVariants,
    dismissButton: bannerDismissButtonVariants,
    content: bannerContentVariants,
  },
  container: bannerContainerVariants,
  staggered: staggeredBannerVariants,
  default: defaultBannerVariants,
  reducedMotion: reducedMotionBannerVariants,
};
