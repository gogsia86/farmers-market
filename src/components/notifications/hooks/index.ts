/**
 * @fileoverview Animation Hooks & Utilities - Central Export
 * @module components/notifications/hooks
 * @description Central export point for all animation hooks and utilities
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

// ============================================================================
// Reduced Motion Hooks
// ============================================================================

export {
  default, useAccessibleTransition,
  useAgriculturalAnimation,
  useAnimationDuration,
  useReducedMotion,
  useReducedMotionCallback,
  useShouldAnimate
} from "./useReducedMotion";

// ============================================================================
// Type Exports
// ============================================================================

export type { Season } from "@/lib/notifications/types";
