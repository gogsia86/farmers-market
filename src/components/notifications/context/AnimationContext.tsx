/**
 * @fileoverview Animation Context - Global Animation State Management
 * @module components/notifications/context/AnimationContext
 * @description Divine animation context with agricultural consciousness
 *
 * Features:
 * - Global animation preferences
 * - Seasonal animation themes
 * - Performance monitoring
 * - Reduced motion support
 * - Animation state management
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

"use client";

import type { Season } from "@/lib/notifications/types";
import { getCurrentSeason } from "@/lib/notifications/utils";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useReducedMotion, useShouldAnimate } from "../hooks/useReducedMotion";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Types
// ============================================================================

export type AnimationPreset = "minimal" | "standard" | "enhanced" | "divine";

export interface AnimationContextValue {
  /** Current animation preset */
  preset: AnimationPreset;

  /** Update animation preset */
  setPreset: (preset: AnimationPreset) => void;

  /** Current agricultural season */
  season: Season;

  /** Update season */
  setSeason: (season: Season) => void;

  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;

  /** Whether animations should be enabled */
  shouldAnimate: boolean;

  /** Whether to use seasonal animations */
  useSeasonalAnimations: boolean;

  /** Toggle seasonal animations */
  toggleSeasonalAnimations: () => void;

  /** Performance mode (auto-detected) */
  performanceMode: "high" | "medium" | "low";

  /** Global animation speed multiplier */
  speedMultiplier: number;

  /** Update speed multiplier */
  setSpeedMultiplier: (multiplier: number) => void;

  /** Whether to show animation debug info */
  debugMode: boolean;

  /** Toggle debug mode */
  toggleDebugMode: () => void;
}

// ============================================================================
// Context
// ============================================================================

const AnimationContext = createContext<AnimationContextValue | undefined>(
  undefined
);

// ============================================================================
// Provider Props
// ============================================================================

export interface AnimationProviderProps {
  children: React.ReactNode;

  /** Initial animation preset */
  initialPreset?: AnimationPreset;

  /** Initial season (defaults to current season) */
  initialSeason?: Season;

  /** Enable seasonal animations by default */
  enableSeasonalAnimations?: boolean;

  /** Enable debug mode */
  enableDebugMode?: boolean;
}

// ============================================================================
// Provider Component
// ============================================================================

export function AnimationProvider({
  children,
  initialPreset = "standard",
  initialSeason,
  enableSeasonalAnimations = true,
  enableDebugMode = false,
}: AnimationProviderProps) {
  // Core state
  const [preset, setPreset] = useState<AnimationPreset>(initialPreset);
  const [season, setSeason] = useState<Season>(
    initialSeason || getCurrentSeason()
  );
  const [useSeasonalAnimations, setUseSeasonalAnimations] = useState(
    enableSeasonalAnimations
  );
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [debugMode, setDebugMode] = useState(enableDebugMode);

  // Accessibility hooks
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = useShouldAnimate();

  // Performance detection
  const [performanceMode, setPerformanceMode] = useState<
    "high" | "medium" | "low"
  >("high");

  // Detect performance mode on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;

    // Device memory (if available)
    const memory = (navigator as any).deviceMemory;

    // Connection speed (if available)
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;

    // Determine performance mode
    let mode: "high" | "medium" | "low" = "high";

    if (cores <= 2 || memory <= 2) {
      mode = "low";
    } else if (cores <= 4 || memory <= 4 || effectiveType === "3g") {
      mode = "medium";
    }

    setPerformanceMode(mode);
  }, []);

  // Auto-adjust preset based on performance and accessibility
  useEffect(() => {
    if (prefersReducedMotion) {
      setPreset("minimal");
    } else if (performanceMode === "low") {
      setPreset("standard");
    }
  }, [prefersReducedMotion, performanceMode]);

  // Update season automatically (optional)
  useEffect(() => {
    if (!initialSeason && useSeasonalAnimations) {
      const interval = setInterval(() => {
        setSeason(getCurrentSeason());
      }, 1000 * 60 * 60); // Check every hour

      return () => clearInterval(interval);
    }
    // Return empty cleanup function if condition not met
    return () => { };
  }, [initialSeason, useSeasonalAnimations]);

  // Log debug info
  useEffect(() => {
    if (debugMode) {
      logger.info("🎨 Animation Context Debug Info", { presetseasonprefersReducedMotionshouldAnimateperformanceModespeedMultiplieruseSeasonalAnimations: {
        preset,
        season,
        prefersReducedMotion,
        shouldAnimate,
        performanceMode,
        speedMultiplier,
        useSeasonalAnimations,
      } });
    }
  }, [
    debugMode,
    preset,
    season,
    prefersReducedMotion,
    shouldAnimate,
    performanceMode,
    speedMultiplier,
    useSeasonalAnimations,
  ]);

  // Context value
  const value: AnimationContextValue = {
    preset,
    setPreset,
    season,
    setSeason,
    prefersReducedMotion,
    shouldAnimate,
    useSeasonalAnimations,
    toggleSeasonalAnimations: () =>
      setUseSeasonalAnimations((prev) => !prev),
    performanceMode,
    speedMultiplier,
    setSpeedMultiplier,
    debugMode,
    toggleDebugMode: () => setDebugMode((prev) => !prev),
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Use animation context
 * Access global animation state and preferences
 *
 * @throws {Error} If used outside AnimationProvider
 * @returns Animation context value
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { preset, season, shouldAnimate } = useAnimationContext();
 *
 *   if (!shouldAnimate) {
 *     return <StaticContent />;
 *   }
 *
 *   return <AnimatedContent preset={preset} season={season} />;
 * }
 * ```
 */
export function useAnimationContext(): AnimationContextValue {
  const context = useContext(AnimationContext);

  if (!context) {
    throw new Error(
      "useAnimationContext must be used within an AnimationProvider"
    );
  }

  return context;
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Get animation duration adjusted for context
 *
 * @param baseDuration - Base duration in seconds
 * @returns Adjusted duration based on preset and speed multiplier
 */
export function useAdjustedDuration(baseDuration: number): number {
  const { preset, speedMultiplier, prefersReducedMotion } =
    useAnimationContext();

  if (prefersReducedMotion) {
    return 0;
  }

  const presetMultipliers: Record<AnimationPreset, number> = {
    minimal: 0.5,
    standard: 1,
    enhanced: 1.2,
    divine: 1.5,
  };

  return baseDuration * presetMultipliers[preset] * speedMultiplier;
}

/**
 * Get whether to use seasonal variants
 *
 * @returns True if seasonal variants should be used
 */
export function useShouldUseSeasonalVariants(): boolean {
  const { useSeasonalAnimations, shouldAnimate } = useAnimationContext();
  return useSeasonalAnimations && shouldAnimate;
}

/**
 * Get current season for animations
 *
 * @returns Current season if seasonal animations enabled, otherwise undefined
 */
export function useAnimationSeason(): Season | undefined {
  const { season, useSeasonalAnimations } = useAnimationContext();
  return useSeasonalAnimations ? season : undefined;
}

/**
 * Get stagger delay for list animations
 *
 * @param baseDelay - Base delay between items in seconds
 * @param index - Item index
 * @returns Calculated stagger delay
 */
export function useStaggerDelay(baseDelay: number, index: number): number {
  const { preset, speedMultiplier, prefersReducedMotion } =
    useAnimationContext();

  if (prefersReducedMotion) {
    return 0;
  }

  const presetMultipliers: Record<AnimationPreset, number> = {
    minimal: 0,
    standard: 1,
    enhanced: 1,
    divine: 1.2,
  };

  return baseDelay * index * presetMultipliers[preset] * speedMultiplier;
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Get recommended animation quality based on performance mode
 */
export function useAnimationQuality(): {
  useBlur: boolean;
  useScale: boolean;
  useRotate: boolean;
  useComplexTransforms: boolean;
  useShadows: boolean;
} {
  const { performanceMode } = useAnimationContext();

  const qualitySettings = {
    high: {
      useBlur: true,
      useScale: true,
      useRotate: true,
      useComplexTransforms: true,
      useShadows: true,
    },
    medium: {
      useBlur: false,
      useScale: true,
      useRotate: true,
      useComplexTransforms: false,
      useShadows: false,
    },
    low: {
      useBlur: false,
      useScale: true,
      useRotate: false,
      useComplexTransforms: false,
      useShadows: false,
    },
  };

  return qualitySettings[performanceMode];
}

// ============================================================================
// Export
// ============================================================================

export default AnimationProvider;
