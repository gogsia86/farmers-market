/**
 * 🎨 Animation System - Central Export Hub
 *
 * Divine agricultural animations for the Farmers Market Platform.
 * Exports all animation variants, transitions, and utilities for
 * notifications, toasts, banners, lists, and seasonal effects.
 *
 * Usage:
 * ```typescript
 * import { toastAnimations, bannerAnimations, listAnimations } from '@/components/notifications/animations';
 * ```
 *
 * @module animations
 * @agricultural-consciousness MAXIMUM
 */

// ============================================================================
// TOAST ANIMATIONS - Re-export all from toast-animations.ts
// ============================================================================

export {

  // Default and core variants
  defaultToastVariants, dismissIconVariants, errorToastVariants, fallToastVariants, getAccessibleToastVariants,
  // Helper functions
  getSeasonalToastVariants,
  getSeverityToastVariants, infoToastVariants, progressBarVariants, quickTransition,
  // Accessibility
  reducedMotionToastVariants, slowTransition, smoothTransition,
  // Seasonal variants
  springToastVariants,
  // Transitions
  springTransition, staggeredToastVariants,
  // Severity variants
  successToastVariants, summerToastVariants,
  // Container and stagger variants
  toastContainerVariants,
  // Interaction variants
  toastHoverVariants,
  // Position variants
  toastPositionVariants, warningToastVariants, winterToastVariants, type Season,
  // Types
  type ToastPosition
} from './toast-animations';

// ============================================================================
// BANNER ANIMATIONS - Re-export all from banner-animations.ts
// ============================================================================

export {

  // Container and stagger variants
  bannerContainerVariants, bannerContentVariants, bannerDismissButtonVariants,
  // Interaction variants
  bannerHoverVariants, bottomBannerVariants,
  // Default variant
  defaultBannerVariants, errorBannerVariants, fallBannerVariants, getAccessibleBannerVariants,
  // Helper functions
  getBannerPositionVariants,
  getSeasonalBannerVariants,
  getSeverityBannerVariants, infoBannerVariants,
  // Accessibility
  reducedMotionBannerVariants,
  // Seasonal variants
  springBannerVariants, staggeredBannerVariants, stickyBottomBannerVariants,
  // Sticky variants
  stickyTopBannerVariants,
  // Severity variants
  successBannerVariants, summerBannerVariants,
  // Position variants
  topBannerVariants, warningBannerVariants, winterBannerVariants,
  // Types
  type BannerPosition,
  type Season as BannerSeason
} from './banner-animations';

// ============================================================================
// LIST ANIMATIONS - Re-export all from list-animations.ts
// ============================================================================

export {
  archiveItemVariants, createStaggerConfig,
  // Empty/loading states
  emptyStateVariants, fadeOnlyVariants, fastListContainerVariants,
  // Filter/sort variants
  filterTransitionVariants, getAccessibleListVariants, getAgriculturalVariants, getFilterVariants, getGroupVariants,
  // Helper functions
  getListItemVariants, getStaggerDelay, groupBadgeVariants, groupContainerVariants,
  // Group variants
  groupHeaderVariants,
  groupIconVariants,
  // Agricultural variants
  harvestNotificationVariants,
  // Complete bundle (pre-built in list-animations.ts)
  listAnimations,
  // Container variants
  listContainerVariants,
  // Item variants
  listItemVariants,
  // Transitions
  listTransition, loadMoreVariants,
  // Action variants
  markAsReadVariants, marketUpdateVariants, pinItemVariants, quickListTransition, removeItemVariants, scaleInVariants, scrollTopButtonVariants, searchResultVariants, seasonalTransitionVariants, skeletonVariants, slideInLeftVariants,
  slideInRightVariants, smoothListTransition, sortTransitionVariants, staggerTransition, weatherAlertVariants, type FilterTransition,
  type GroupState, type ListAnimationConfig,
  // Types
  type ListItemAction, type SortDirection
} from './list-animations';

// ============================================================================
// SEASONAL ANIMATIONS - Re-export all from seasonal-animations.ts
// ============================================================================

export {
  breezeTransition,
  celebrationTransition, createSeasonalAnimation, fallHarvestVariants, frostVariants, getAgriculturalEventVariants, getGrowthVariants, getSeasonalColors,
  // Helper functions
  getSeasonalTransition, getWeatherVariants, growingVariants,
  // Transitions
  growthTransition, harvestCelebrationVariants, marketDayVariants,
  // Agricultural event variants
  plantingEventVariants, priceDecreaseVariants,
  // Price change variants
  priceIncreaseVariants, rainyDayVariants,
  // Complete bundle (pre-built in seasonal-animations.ts)
  seasonalAnimations,
  // Seasonal colors
  seasonalColors, seasonalTransition,
  // Growth cycle variants
  seedPlantingVariants, snowyDayVariants,
  // Seasonal transition variants
  springAwakeningVariants, sproutingVariants, stormyWeatherVariants, summerBrillianceVariants,
  // Weather variants
  sunnyDayVariants, wateringEventVariants, winterRestVariants, type AgriculturalEvent, type GrowthStage, type SeasonalConfig,
  // Types
  type Season as SeasonalSeason, type WeatherType
} from './seasonal-animations';

// ============================================================================
// CONVENIENCE BUNDLES - Built from imported names
// ============================================================================

// Import everything we need to build the bundles
import {
  defaultToastVariants,
  dismissIconVariants,
  errorToastVariants,
  fallToastVariants,
  getAccessibleToastVariants,
  getSeasonalToastVariants,
  getSeverityToastVariants,
  infoToastVariants,
  progressBarVariants,
  quickTransition,
  reducedMotionToastVariants,
  slowTransition,
  smoothTransition,
  springToastVariants,
  springTransition,
  staggeredToastVariants,
  successToastVariants,
  summerToastVariants,
  toastContainerVariants,
  toastHoverVariants,
  toastPositionVariants,
  warningToastVariants,
  winterToastVariants,
} from './toast-animations';

import {
  bannerContainerVariants,
  bannerContentVariants,
  bannerDismissButtonVariants,
  bannerHoverVariants,
  bottomBannerVariants,
  defaultBannerVariants,
  errorBannerVariants,
  fallBannerVariants,
  getAccessibleBannerVariants,
  getBannerPositionVariants,
  getSeasonalBannerVariants,
  getSeverityBannerVariants,
  infoBannerVariants,
  reducedMotionBannerVariants,
  springBannerVariants,
  staggeredBannerVariants,
  stickyBottomBannerVariants,
  stickyTopBannerVariants,
  successBannerVariants,
  summerBannerVariants,
  topBannerVariants,
  warningBannerVariants,
  winterBannerVariants,
} from './banner-animations';

import {
  createStaggerConfig,
  getAccessibleListVariants,
  getAgriculturalVariants,
  getFilterVariants,
  getGroupVariants,
  getListItemVariants,
  getStaggerDelay,
  listAnimations,
  listTransition,
  staggerTransition,
} from './list-animations';

import {
  breezeTransition,
  celebrationTransition,
  createSeasonalAnimation,
  getAgriculturalEventVariants,
  getGrowthVariants,
  getSeasonalColors,
  getSeasonalTransition,
  getWeatherVariants,
  growthTransition,
  seasonalAnimations,
  seasonalTransition,
} from './seasonal-animations';

/**
 * Complete toast animations bundle
 */
export const toastAnimations = {
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
  interaction: {
    hover: toastHoverVariants,
    dismiss: dismissIconVariants,
    progress: progressBarVariants,
  },
  stagger: {
    container: toastContainerVariants,
    item: staggeredToastVariants,
  },
  reducedMotion: reducedMotionToastVariants,
  transitions: {
    spring: springTransition,
    smooth: smoothTransition,
    quick: quickTransition,
    slow: slowTransition,
  },
};

/**
 * Complete banner animations bundle
 */
export const bannerAnimations = {
  position: {
    top: topBannerVariants,
    bottom: bottomBannerVariants,
    stickyTop: stickyTopBannerVariants,
    stickyBottom: stickyBottomBannerVariants,
  },
  default: defaultBannerVariants,
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
  interaction: {
    hover: bannerHoverVariants,
    dismiss: bannerDismissButtonVariants,
    content: bannerContentVariants,
  },
  stagger: {
    container: bannerContainerVariants,
    item: staggeredBannerVariants,
  },
  reducedMotion: reducedMotionBannerVariants,
};

/**
 * Complete animation system - all animations in one object
 */
export const animations = {
  toast: toastAnimations,
  banner: bannerAnimations,
  list: listAnimations,
  seasonal: seasonalAnimations,

  transitions: {
    spring: springTransition,
    smooth: smoothTransition,
    quick: quickTransition,
    slow: slowTransition,
    list: listTransition,
    stagger: staggerTransition,
    growth: growthTransition,
    seasonal: seasonalTransition,
    breeze: breezeTransition,
    celebration: celebrationTransition,
  },
};

/**
 * Utility functions for all animations
 */
export const animationHelpers = {
  toast: {
    getSeasonalVariants: getSeasonalToastVariants,
    getSeverityVariants: getSeverityToastVariants,
    getAccessibleVariants: getAccessibleToastVariants,
  },

  banner: {
    getPositionVariants: getBannerPositionVariants,
    getSeasonalVariants: getSeasonalBannerVariants,
    getSeverityVariants: getSeverityBannerVariants,
    getAccessibleVariants: getAccessibleBannerVariants,
  },

  list: {
    getItemVariants: getListItemVariants,
    getFilterVariants: getFilterVariants,
    getAccessibleVariants: getAccessibleListVariants,
    getStaggerDelay: getStaggerDelay,
    getAgriculturalVariants: getAgriculturalVariants,
    createStaggerConfig: createStaggerConfig,
    getGroupVariants: getGroupVariants,
  },

  seasonal: {
    getSeasonalTransition: getSeasonalTransition,
    getGrowthVariants: getGrowthVariants,
    getWeatherVariants: getWeatherVariants,
    getAgriculturalEventVariants: getAgriculturalEventVariants,
    getSeasonalColors: getSeasonalColors,
    createSeasonalAnimation: createSeasonalAnimation,
  },
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export - complete animation system
 */
export default animations;

// ============================================================================
// DOCUMENTATION
// ============================================================================

/**
 * @example Basic Toast Animation
 * ```typescript
 * import { toastPositionVariants } from '@/components/notifications/animations';
 *
 * <motion.div
 *   variants={toastPositionVariants['top-center']}
 *   initial="initial"
 *   animate="animate"
 *   exit="exit"
 * >
 *   Toast content
 * </motion.div>
 * ```
 *
 * @example Seasonal Animation
 * ```typescript
 * import { getSeasonalToastVariants } from '@/components/notifications/animations';
 *
 * const variants = getSeasonalToastVariants('spring');
 *
 * <motion.div variants={variants} initial="initial" animate="animate">
 *   Spring notification
 * </motion.div>
 * ```
 *
 * @example List with Stagger
 * ```typescript
 * import { listContainerVariants, listItemVariants } from '@/components/notifications/animations';
 *
 * <motion.ul variants={listContainerVariants} initial="hidden" animate="visible">
 *   {items.map(item => (
 *     <motion.li key={item.id} variants={listItemVariants}>
 *       {item.content}
 *     </motion.li>
 *   ))}
 * </motion.ul>
 * ```
 *
 * @example Agricultural Event
 * ```typescript
 * import { harvestCelebrationVariants } from '@/components/notifications/animations';
 *
 * <motion.div
 *   variants={harvestCelebrationVariants}
 *   initial="ready"
 *   animate="celebration"
 * >
 *   🌾 Harvest Complete!
 * </motion.div>
 * ```
 *
 * @example Weather Effect
 * ```typescript
 * import { getWeatherVariants } from '@/components/notifications/animations';
 *
 * const weatherVariants = getWeatherVariants('rainy');
 *
 * <motion.div variants={weatherVariants} animate="drizzle">
 *   🌧️ Rainy Day Alert
 * </motion.div>
 * ```
 *
 * @example Accessible Animation
 * ```typescript
 * import { getAccessibleToastVariants, defaultToastVariants } from '@/components/notifications/animations';
 *
 * const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 * const variants = getAccessibleToastVariants(prefersReducedMotion, defaultToastVariants);
 *
 * <motion.div variants={variants}>
 *   Accessible notification
 * </motion.div>
 * ```
 *
 * @example Using Convenience Bundles
 * ```typescript
 * import { toastAnimations, bannerAnimations } from '@/components/notifications/animations';
 *
 * // Access nested animations
 * <motion.div variants={toastAnimations.seasonal.spring}>
 *   Spring Toast
 * </motion.div>
 *
 * <motion.div variants={bannerAnimations.position.top}>
 *   Top Banner
 * </motion.div>
 * ```
 */

/**
 * Animation System Architecture:
 *
 * 1. Toast Animations (toast-animations.ts)
 *    - Position-based entrance/exit
 *    - Seasonal themes
 *    - Severity indicators
 *    - Micro-interactions
 *
 * 2. Banner Animations (banner-animations.ts)
 *    - Top/bottom positioning
 *    - Sticky behavior
 *    - Seasonal awareness
 *    - Dismissal effects
 *
 * 3. List Animations (list-animations.ts)
 *    - Stagger effects
 *    - Filter transitions
 *    - Group expand/collapse
 *    - Item actions (mark read, delete, archive)
 *
 * 4. Seasonal Animations (seasonal-animations.ts)
 *    - Growth cycles (seed → harvest)
 *    - Weather effects
 *    - Agricultural events
 *    - Price changes
 *
 * All animations support:
 * - Reduced motion preferences
 * - Agricultural consciousness
 * - Seasonal awareness
 * - GPU acceleration
 * - 60fps performance target
 */

/**
 * Performance Guidelines:
 *
 * ✅ DO:
 * - Animate transform and opacity only
 * - Use GPU-accelerated properties
 * - Implement reduced motion alternatives
 * - Keep animations under 500ms
 * - Use spring physics for natural motion
 *
 * ❌ DON'T:
 * - Animate width/height directly (use scale)
 * - Use margin/padding in animations
 * - Create layout shifts
 * - Chain too many animations
 * - Ignore accessibility
 */
