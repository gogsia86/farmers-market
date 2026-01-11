/**
 * @fileoverview Animation Context - Central Export
 * @module components/notifications/context
 * @description Central export point for animation context and providers
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

// ============================================================================
// Animation Context Exports
// ============================================================================

export {
  AnimationProvider,
  default,
  useAdjustedDuration,
  useAnimationContext,
  useAnimationQuality,
  useAnimationSeason,
  useShouldUseSeasonalVariants,
  useStaggerDelay,
} from "./AnimationContext";

// ============================================================================
// Type Exports
// ============================================================================

export type {
  AnimationContextValue,
  AnimationPreset,
  AnimationProviderProps,
} from "./AnimationContext";
