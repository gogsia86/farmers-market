/**
 * 🎨 Notification Center List Animations
 *
 * Comprehensive animation variants for notification lists, filtering,
 * sorting, grouping, and item interactions within the notification center.
 *
 * Features:
 * - List item stagger animations
 * - Filter/sort transition effects
 * - Group expansion/collapse
 * - Item removal animations
 * - Mark as read effects
 * - Infinite scroll animations
 * - Search result animations
 * - Empty state transitions
 *
 * @module animations/list-animations
 * @agricultural-consciousness ACTIVE
 */

import type { Transition, Variants } from "framer-motion";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ListItemAction = "add" | "remove" | "update" | "read" | "unread";
export type FilterTransition = "instant" | "fade" | "slide" | "scale";
export type GroupState = "expanded" | "collapsed";
export type SortDirection = "asc" | "desc";

export interface ListAnimationConfig {
  staggerDelay?: number;
  enableParallax?: boolean;
  reducedMotion?: boolean;
  scrollBehavior?: "smooth" | "instant";
}

// ============================================================================
// TRANSITION CONFIGURATIONS
// ============================================================================

/**
 * Standard list transition - balanced speed
 */
export const listTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

/**
 * Stagger transition - sequential item appearance
 */
export const staggerTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 1,
};

/**
 * Quick transition - fast interactions
 */
export const quickListTransition: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

/**
 * Smooth transition - graceful movements
 */
export const smoothListTransition: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
};

// ============================================================================
// LIST CONTAINER VARIANTS
// ============================================================================

/**
 * Container variant with stagger children
 */
export const listContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

/**
 * Fast container variant - quick list appearance
 */
export const fastListContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Grouped container variant - for notification groups
 */
export const groupContainerVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.3, delay: 0.1 },
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

// ============================================================================
// LIST ITEM VARIANTS
// ============================================================================

/**
 * Standard list item entrance/exit
 */
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: listTransition,
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.95,
    transition: quickListTransition,
  },
  hover: {
    scale: 1.01,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.99,
  },
};

/**
 * Slide in from left (new notification)
 */
export const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: quickListTransition,
  },
};

/**
 * Slide in from right (archive/dismiss)
 */
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: staggerTransition,
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: quickListTransition,
  },
};

/**
 * Scale in (emphasis)
 */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
};

/**
 * Fade only (reduced motion)
 */
export const fadeOnlyVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ============================================================================
// ACTION-SPECIFIC VARIANTS
// ============================================================================

/**
 * Mark as read animation - subtle fade
 */
export const markAsReadVariants: Variants = {
  unread: {
    opacity: 1,
    scale: 1,
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  read: {
    opacity: 0.7,
    scale: 0.98,
    backgroundColor: "rgba(0, 0, 0, 0)",
    transition: smoothListTransition,
  },
};

/**
 * Item removal animation - swipe away
 */
export const removeItemVariants: Variants = {
  initial: {
    opacity: 1,
    x: 0,
    height: "auto",
  },
  removing: {
    opacity: 0,
    x: 100,
    transition: quickListTransition,
  },
  removed: {
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  },
};

/**
 * Archive animation - slide down and fade
 */
export const archiveItemVariants: Variants = {
  initial: {
    opacity: 1,
    y: 0,
    height: "auto",
  },
  archiving: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  archived: {
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    transition: {
      height: { duration: 0.25 },
    },
  },
};

/**
 * Pin/unpin animation - jump to top
 */
export const pinItemVariants: Variants = {
  unpinned: {
    backgroundColor: "transparent",
  },
  pinned: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    transition: {
      backgroundColor: { duration: 0.3 },
    },
  },
  pinning: {
    scale: [1, 1.05, 1],
    y: [0, -5, 0],
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

// ============================================================================
// FILTER & SORT VARIANTS
// ============================================================================

/**
 * Filter transition - fade and scale
 */
export const filterTransitionVariants: Variants = {
  initial: {
    opacity: 1,
    scale: 1,
  },
  filtering: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
  filtered: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.04,
    },
  },
};

/**
 * Sort transition - reorder with position shift
 */
export const sortTransitionVariants: Variants = {
  initial: { opacity: 1 },
  sorting: {
    opacity: 0.5,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
  sorted: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Search result highlight
 */
export const searchResultVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: staggerTransition,
  },
  highlighted: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    scale: 1.02,
    transition: {
      backgroundColor: { duration: 0.3 },
      scale: { duration: 0.2 },
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: quickListTransition,
  },
};

// ============================================================================
// GROUP VARIANTS
// ============================================================================

/**
 * Group header variants
 */
export const groupHeaderVariants: Variants = {
  collapsed: {
    opacity: 0.7,
  },
  expanded: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    transition: { duration: 0.15 },
  },
};

/**
 * Group icon rotation (chevron)
 */
export const groupIconVariants: Variants = {
  collapsed: {
    rotate: 0,
  },
  expanded: {
    rotate: 90,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

/**
 * Group badge count
 */
export const groupBadgeVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  updated: {
    scale: [1, 1.3, 1],
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

// ============================================================================
// EMPTY STATE VARIANTS
// ============================================================================

/**
 * Empty state animation
 */
export const emptyStateVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

/**
 * Loading skeleton variants
 */
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.3,
  },
  pulse: {
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// INFINITE SCROLL VARIANTS
// ============================================================================

/**
 * Load more indicator
 */
export const loadMoreVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothListTransition,
  },
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Scroll to top button
 */
export const scrollTopButtonVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
  },
};

// ============================================================================
// AGRICULTURAL-THEMED VARIANTS
// ============================================================================

/**
 * Harvest notification - celebration bounce
 */
export const harvestNotificationVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -10,
  },
  visible: {
    opacity: 1,
    scale: [0.8, 1.1, 1],
    rotate: [-10, 5, 0],
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: quickListTransition,
  },
};

/**
 * Weather alert - urgent shake
 */
export const weatherAlertVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: staggerTransition,
  },
  alert: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      delay: 0.2,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: quickListTransition,
  },
};

/**
 * Market update - price change pulse
 */
export const marketUpdateVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: listTransition,
  },
  priceUp: {
    backgroundColor: [
      "rgba(34, 197, 94, 0)",
      "rgba(34, 197, 94, 0.1)",
      "rgba(34, 197, 94, 0)",
    ],
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
  priceDown: {
    backgroundColor: [
      "rgba(239, 68, 68, 0)",
      "rgba(239, 68, 68, 0.1)",
      "rgba(239, 68, 68, 0)",
    ],
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: quickListTransition,
  },
};

/**
 * Seasonal transition - smooth color shift
 */
export const seasonalTransitionVariants: Variants = {
  spring: {
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    transition: { duration: 0.5 },
  },
  summer: {
    backgroundColor: "rgba(251, 191, 36, 0.05)",
    transition: { duration: 0.5 },
  },
  fall: {
    backgroundColor: "rgba(249, 115, 22, 0.05)",
    transition: { duration: 0.5 },
  },
  winter: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    transition: { duration: 0.5 },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get list item variants based on action type
 */
export function getListItemVariants(action: ListItemAction): Variants {
  switch (action) {
    case "add":
      return slideInLeftVariants;
    case "remove":
      return removeItemVariants;
    case "update":
      return scaleInVariants;
    case "read":
      return markAsReadVariants;
    case "unread":
      return markAsReadVariants;
    default:
      return listItemVariants;
  }
}

/**
 * Get filter transition variant
 */
export function getFilterVariants(transitionType: FilterTransition): Variants {
  switch (transitionType) {
    case "instant":
      return fadeOnlyVariants;
    case "fade":
      return filterTransitionVariants;
    case "slide":
      return slideInLeftVariants;
    case "scale":
      return scaleInVariants;
    default:
      return filterTransitionVariants;
  }
}

/**
 * Get accessible list variants (reduced motion)
 */
export function getAccessibleListVariants(
  prefersReducedMotion: boolean,
  baseVariants: Variants = listItemVariants,
): Variants {
  if (prefersReducedMotion) {
    return fadeOnlyVariants;
  }
  return baseVariants;
}

/**
 * Get stagger delay based on index
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0.05,
): number {
  return Math.min(index * baseDelay, 0.5); // Cap at 500ms
}

/**
 * Get agricultural notification variants
 */
export function getAgriculturalVariants(
  notificationType: "harvest" | "weather" | "market" | "seasonal",
): Variants {
  switch (notificationType) {
    case "harvest":
      return harvestNotificationVariants;
    case "weather":
      return weatherAlertVariants;
    case "market":
      return marketUpdateVariants;
    case "seasonal":
      return seasonalTransitionVariants;
    default:
      return listItemVariants;
  }
}

/**
 * Create custom stagger configuration
 */
export function createStaggerConfig(
  itemCount: number,
  baseDelay: number = 0.05,
  maxDelay: number = 0.5,
): { staggerChildren: number; delayChildren: number } {
  const staggerDelay = Math.min(baseDelay, maxDelay / itemCount);
  return {
    staggerChildren: staggerDelay,
    delayChildren: 0.1,
  };
}

/**
 * Get group variants based on state
 */
export function getGroupVariants(state: GroupState): Variants {
  return state === "expanded" ? groupContainerVariants : groupContainerVariants;
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * All list animation variants and utilities
 */
export const listAnimations = {
  // Container variants
  container: listContainerVariants,
  fastContainer: fastListContainerVariants,
  groupContainer: groupContainerVariants,

  // Item variants
  item: listItemVariants,
  slideLeft: slideInLeftVariants,
  slideRight: slideInRightVariants,
  scale: scaleInVariants,
  fade: fadeOnlyVariants,

  // Action variants
  markAsRead: markAsReadVariants,
  remove: removeItemVariants,
  archive: archiveItemVariants,
  pin: pinItemVariants,

  // Filter/sort variants
  filter: filterTransitionVariants,
  sort: sortTransitionVariants,
  search: searchResultVariants,

  // Group variants
  groupHeader: groupHeaderVariants,
  groupIcon: groupIconVariants,
  groupBadge: groupBadgeVariants,

  // Empty/loading states
  empty: emptyStateVariants,
  skeleton: skeletonVariants,
  loadMore: loadMoreVariants,
  scrollTop: scrollTopButtonVariants,

  // Agricultural variants
  harvest: harvestNotificationVariants,
  weather: weatherAlertVariants,
  market: marketUpdateVariants,
  seasonal: seasonalTransitionVariants,

  // Transitions
  transitions: {
    list: listTransition,
    stagger: staggerTransition,
    quick: quickListTransition,
    smooth: smoothListTransition,
  },

  // Helpers
  helpers: {
    getListItemVariants,
    getFilterVariants,
    getAccessibleListVariants,
    getStaggerDelay,
    getAgriculturalVariants,
    createStaggerConfig,
    getGroupVariants,
  },
};

export default listAnimations;
