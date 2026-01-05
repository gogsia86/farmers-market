/**
 * Loading Components Barrel Export
 *
 * Centralized exports for all loading-related components, hooks, and utilities.
 *
 * @module components/loading
 */

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

export {
  AvatarSkeleton,
  CardSkeleton,
  GridSkeleton,
  ListSkeleton,
  Skeleton,
  SkeletonGroup,
  TableSkeleton,
  TextSkeleton,
  type AvatarSkeletonProps,
  type CardSkeletonProps,
  type GridSkeletonProps,
  type ListSkeletonProps,
  type SkeletonGroupProps,
  type SkeletonProps,
  type TableSkeletonProps,
  type TextSkeletonProps
} from "./Skeleton";

// ============================================================================
// LOADING SPINNER COMPONENTS
// ============================================================================

export {
  ButtonLoadingSpinner,
  CenteredLoadingSpinner,
  InlineLoadingSpinner,
  LoadingSpinner,
  OverlayLoadingSpinner,
  type ButtonLoadingSpinnerProps,
  type CenteredLoadingSpinnerProps,
  type InlineLoadingSpinnerProps,
  type LoadingSpinnerProps,
  type OverlayLoadingSpinnerProps
} from "./LoadingSpinner";

// ============================================================================
// PROGRESS INDICATOR COMPONENTS
// ============================================================================

export {
  AgriculturalProgress,
  CircularProgress,
  LinearProgress,
  MultiProgress,
  ProgressRing,
  StepProgress,
  type AgriculturalProgressProps,
  type CircularProgressProps,
  type LinearProgressProps,
  type MultiProgressProps,
  type MultiProgressSegment,
  type ProgressRingProps,
  type StepProgressProps
} from "./ProgressIndicator";

// ============================================================================
// SUSPENSE BOUNDARY COMPONENTS
// ============================================================================

export {
  AgriculturalSuspenseBoundary,
  ConditionalSuspenseBoundary,
  LazySuspenseBoundary,
  NestedSuspenseBoundary,
  PreloadedSuspenseBoundary,
  SkeletonSuspenseBoundary,
  SuspenseBoundary,
  SuspenseListBoundary,
  SuspenseWithErrorBoundary,
  type AgriculturalSuspenseBoundaryProps,
  type ConditionalSuspenseBoundaryProps,
  type LazySuspenseBoundaryProps,
  type NestedSuspenseBoundaryProps,
  type PreloadedSuspenseBoundaryProps,
  type SkeletonSuspenseBoundaryProps,
  type SuspenseBoundaryProps,
  type SuspenseListBoundaryProps,
  type SuspenseWithErrorBoundaryProps
} from "./SuspenseBoundary";

// ============================================================================
// EXAMPLES
// ============================================================================

export { LoadingExamples } from "./LoadingExamples";

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export { default as Spinner } from "./LoadingSpinner";
export { default as Progress } from "./ProgressIndicator";
export { default } from "./Skeleton";
export { default as Suspense } from "./SuspenseBoundary";

