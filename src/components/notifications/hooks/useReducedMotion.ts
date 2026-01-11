/**
 * @fileoverview Reduced Motion Hook - Accessibility First
 * @module components/notifications/hooks/useReducedMotion
 * @description Divine accessibility hook that respects user motion preferences
 *
 * Features:
 * - Detects prefers-reduced-motion media query
 * - Updates dynamically when preference changes
 * - SSR-safe with proper hydration
 * - Agricultural consciousness in accessibility
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Respects system accessibility preferences
 *
 * @returns {boolean} True if user prefers reduced motion
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   const variants = prefersReducedMotion
 *     ? accessibleVariants
 *     : fullAnimationVariants;
 *
 *   return <motion.div variants={variants}>Content</motion.div>;
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  // Default to false for SSR, will update on client
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === "undefined") {
      return undefined;
    }

    // Create media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create event listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Legacy browsers (Safari < 14)
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
    // Return empty cleanup function if no listeners were added
    return undefined;
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook variant that returns a callback to check reduced motion
 * Useful when you need to compute values based on motion preference
 *
 * @returns {() => boolean} Function that returns true if reduced motion is preferred
 *
 * @example
 * ```tsx
 * function Component() {
 *   const shouldReduceMotion = useReducedMotionCallback();
 *
 *   const duration = shouldReduceMotion() ? 0 : 300;
 * }
 * ```
 */
export function useReducedMotionCallback(): () => boolean {
  const prefersReducedMotion = useReducedMotion();
  return () => prefersReducedMotion;
}

/**
 * Get animation duration based on reduced motion preference
 *
 * @param normalDuration - Duration when motion is enabled
 * @param reducedDuration - Duration when motion is reduced (default: 0)
 * @returns Appropriate duration based on user preference
 *
 * @example
 * ```tsx
 * function Component() {
 *   const duration = useAnimationDuration(300, 0);
 *
 *   return (
 *     <motion.div
 *       transition={{ duration: duration / 1000 }}
 *     />
 *   );
 * }
 * ```
 */
export function useAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0,
): number {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? reducedDuration : normalDuration;
}

/**
 * Get appropriate transition config based on reduced motion
 *
 * @returns Transition configuration object
 *
 * @example
 * ```tsx
 * function Component() {
 *   const transition = useAccessibleTransition();
 *
 *   return <motion.div transition={transition} />;
 * }
 * ```
 */
export function useAccessibleTransition() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return {
      duration: 0,
      delay: 0,
    };
  }

  return {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  };
}

/**
 * Check if animations should be enabled
 * Considers both reduced motion preference and performance
 *
 * @returns True if animations should be fully enabled
 */
export function useShouldAnimate(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Check for low-end device indicators
    if (typeof window === "undefined") return;

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    const isLowEnd = cores <= 2;

    // Check device memory if available
    const memory = (navigator as any).deviceMemory;
    const isLowMemory = memory && memory <= 4;

    setIsLowPerformance(isLowEnd || isLowMemory);
  }, []);

  return !prefersReducedMotion && !isLowPerformance;
}

/**
 * Get agricultural-conscious animation config
 * Respects both accessibility and agricultural context
 *
 * @param season - Current agricultural season
 * @returns Animation configuration with seasonal awareness
 */
export function useAgriculturalAnimation(
  season?: "spring" | "summer" | "fall" | "winter",
) {
  const shouldAnimate = useShouldAnimate();
  const prefersReducedMotion = useReducedMotion();

  // Seasonal animation characteristics
  const seasonalConfig = {
    spring: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      mass: 0.8,
    },
    summer: {
      type: "tween" as const,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
    fall: {
      type: "spring" as const,
      stiffness: 200,
      damping: 30,
      mass: 1.2,
    },
    winter: {
      type: "tween" as const,
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  };

  if (prefersReducedMotion) {
    return {
      duration: 0,
      delay: 0,
    };
  }

  if (!shouldAnimate) {
    return {
      duration: 0.1,
      ease: "linear" as const,
    };
  }

  return season ? seasonalConfig[season] : seasonalConfig.spring;
}

// ============================================================================
// Export All
// ============================================================================

export default useReducedMotion;
