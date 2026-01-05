/**
 * Loading State Type Definitions
 *
 * Comprehensive type system for loading states, skeleton screens,
 * and progress indicators with agricultural consciousness.
 *
 * @module lib/loading/types
 */

// ============================================================================
// CORE LOADING STATE TYPES
// ============================================================================

/**
 * Loading state enumeration
 */
export enum LoadingState {
  IDLE = "IDLE",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  REFRESHING = "REFRESHING",
  STALE = "STALE",
}

/**
 * Loading priority levels
 */
export enum LoadingPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Loading strategy types
 */
export enum LoadingStrategy {
  EAGER = "EAGER", // Load immediately
  LAZY = "LAZY", // Load when needed
  PROGRESSIVE = "PROGRESSIVE", // Load in stages
  OPTIMISTIC = "OPTIMISTIC", // Show optimistic updates
  STALE_WHILE_REVALIDATE = "STALE_WHILE_REVALIDATE", // Show stale, fetch fresh
}

/**
 * Skeleton animation types
 */
export enum SkeletonAnimation {
  PULSE = "PULSE",
  WAVE = "WAVE",
  SHIMMER = "SHIMMER",
  NONE = "NONE",
}

/**
 * Progress indicator types
 */
export enum ProgressType {
  LINEAR = "LINEAR",
  CIRCULAR = "CIRCULAR",
  STEPS = "STEPS",
  PERCENTAGE = "PERCENTAGE",
}

// ============================================================================
// LOADING STATE INTERFACES
// ============================================================================

/**
 * Base loading state interface
 */
export interface BaseLoadingState {
  state: LoadingState;
  priority: LoadingPriority;
  strategy: LoadingStrategy;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: Error;
}

/**
 * Async operation state
 */
export interface AsyncOperationState<T = any> extends BaseLoadingState {
  data?: T;
  progress?: number;
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Multi-stage loading state
 */
export interface MultiStageLoadingState {
  stages: LoadingStage[];
  currentStage: number;
  totalStages: number;
  overallProgress: number;
  state: LoadingState;
}

/**
 * Individual loading stage
 */
export interface LoadingStage {
  id: string;
  name: string;
  description?: string;
  state: LoadingState;
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: Error;
}

// ============================================================================
// SKELETON SCREEN TYPES
// ============================================================================

/**
 * Skeleton configuration
 */
export interface SkeletonConfig {
  animation: SkeletonAnimation;
  speed?: number; // Animation speed in seconds
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: string;
  className?: string;
}

/**
 * Skeleton variant types
 */
export type SkeletonVariant =
  | "text"
  | "circular"
  | "rectangular"
  | "rounded"
  | "avatar"
  | "card"
  | "thumbnail";

/**
 * Skeleton props
 */
export interface SkeletonProps extends Partial<SkeletonConfig> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  "aria-label"?: string;
}

// ============================================================================
// PROGRESS INDICATOR TYPES
// ============================================================================

/**
 * Progress configuration
 */
export interface ProgressConfig {
  type: ProgressType;
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  thickness?: number;
}

/**
 * Step progress configuration
 */
export interface StepProgressConfig {
  steps: ProgressStep[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
}

/**
 * Individual progress step
 */
export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  state: "pending" | "active" | "completed" | "error";
  icon?: React.ReactNode;
}

// ============================================================================
// SUSPENSE & LAZY LOADING TYPES
// ============================================================================

/**
 * Suspense boundary configuration
 */
export interface SuspenseBoundaryConfig {
  fallback: React.ReactNode;
  errorFallback?: React.ReactNode;
  minLoadingTime?: number; // Minimum time to show fallback
  maxLoadingTime?: number; // Maximum time before error
  onLoadingStart?: () => void;
  onLoadingEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Lazy load configuration
 */
export interface LazyLoadConfig {
  threshold?: number; // Intersection observer threshold
  rootMargin?: string;
  triggerOnce?: boolean;
  placeholder?: React.ReactNode;
  onVisible?: () => void;
}

// ============================================================================
// OPTIMISTIC UPDATE TYPES
// ============================================================================

/**
 * Optimistic update configuration
 */
export interface OptimisticUpdateConfig<T = any> {
  optimisticData: T;
  mutationFn: () => Promise<T>;
  rollbackFn?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Optimistic state
 */
export interface OptimisticState<T = any> {
  data: T;
  isOptimistic: boolean;
  isPending: boolean;
  error?: Error;
}

// ============================================================================
// STALE-WHILE-REVALIDATE TYPES
// ============================================================================

/**
 * SWR configuration
 */
export interface SWRConfig<T = any> {
  key: string;
  fetcher: () => Promise<T>;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateInterval?: number;
  dedupingInterval?: number;
  fallbackData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * SWR state
 */
export interface SWRState<T = any> {
  data?: T;
  error?: Error;
  isLoading: boolean;
  isValidating: boolean;
  isStale: boolean;
  mutate: (data?: T, shouldRevalidate?: boolean) => Promise<void>;
  revalidate: () => Promise<void>;
}

// ============================================================================
// AGRICULTURAL LOADING TYPES
// ============================================================================

/**
 * Seasonal loading themes
 */
export enum SeasonalLoadingTheme {
  SPRING = "SPRING", // Growing, fresh green
  SUMMER = "SUMMER", // Vibrant, sunny yellow
  FALL = "FALL", // Harvest, warm orange
  WINTER = "WINTER", // Resting, cool blue
}

/**
 * Agricultural loading metadata
 */
export interface AgriculturalLoadingMetadata {
  season?: SeasonalLoadingTheme;
  farmId?: string;
  productType?: string;
  harvestStatus?: "PLANTING" | "GROWING" | "HARVESTING" | "PROCESSING";
  consciousness?: "QUANTUM" | "BIODYNAMIC" | "ORGANIC" | "CONVENTIONAL";
}

/**
 * Agricultural loading state
 */
export interface AgriculturalLoadingState extends BaseLoadingState {
  agricultural: AgriculturalLoadingMetadata;
  message?: string;
}

// ============================================================================
// LOADING SPINNER TYPES
// ============================================================================

/**
 * Spinner variant types
 */
export type SpinnerVariant =
  | "default"
  | "dots"
  | "bars"
  | "circle"
  | "pulse"
  | "agricultural"; // Special agricultural-themed spinner

/**
 * Spinner size
 */
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Spinner configuration
 */
export interface SpinnerConfig {
  variant: SpinnerVariant;
  size: SpinnerSize;
  color?: string;
  speed?: number;
  label?: string;
  className?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Loading state helpers
 */
export type LoadingStateHelpers = {
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isRefreshing: boolean;
  isStale: boolean;
};

/**
 * Loading metrics
 */
export interface LoadingMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  attempts: number;
  retries: number;
  cacheHit: boolean;
}

/**
 * Loading cache entry
 */
export interface LoadingCacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  isStale: boolean;
  revalidating: boolean;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if state is loading
 */
export function isLoading(state: LoadingState): boolean {
  return state === LoadingState.LOADING || state === LoadingState.REFRESHING;
}

/**
 * Check if state is complete (success or error)
 */
export function isComplete(state: LoadingState): boolean {
  return state === LoadingState.SUCCESS || state === LoadingState.ERROR;
}

/**
 * Check if state is actionable (not loading)
 */
export function isActionable(state: LoadingState): boolean {
  return !isLoading(state);
}

/**
 * Check if data is stale
 */
export function isStale<T>(entry: LoadingCacheEntry<T>): boolean {
  if (!entry.expiresAt) return false;
  return Date.now() > entry.expiresAt;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default loading configuration
 */
export const DEFAULT_LOADING_CONFIG: BaseLoadingState = {
  state: LoadingState.IDLE,
  priority: LoadingPriority.NORMAL,
  strategy: LoadingStrategy.EAGER,
};

/**
 * Default skeleton configuration
 */
export const DEFAULT_SKELETON_CONFIG: SkeletonConfig = {
  animation: SkeletonAnimation.PULSE,
  speed: 1.5,
  baseColor: "#e0e0e0",
  highlightColor: "#f5f5f5",
  borderRadius: "0.375rem",
};

/**
 * Default progress configuration
 */
export const DEFAULT_PROGRESS_CONFIG: Partial<ProgressConfig> = {
  type: ProgressType.LINEAR,
  showLabel: true,
  showPercentage: true,
  size: "md",
};

/**
 * Agricultural loading messages
 */
export const AGRICULTURAL_LOADING_MESSAGES = {
  PLANTING: "Planting seeds of data...",
  GROWING: "Growing your information...",
  HARVESTING: "Harvesting fresh results...",
  PROCESSING: "Processing farm data...",
  QUANTUM_MANIFESTATION: "Manifesting quantum agricultural reality...",
  BIODYNAMIC_SYNC: "Synchronizing with biodynamic consciousness...",
} as const;

/**
 * Seasonal loading colors
 */
export const SEASONAL_LOADING_COLORS = {
  [SeasonalLoadingTheme.SPRING]: {
    primary: "#10b981", // Green
    secondary: "#34d399",
    gradient: "from-green-400 to-emerald-500",
  },
  [SeasonalLoadingTheme.SUMMER]: {
    primary: "#f59e0b", // Amber
    secondary: "#fbbf24",
    gradient: "from-yellow-400 to-amber-500",
  },
  [SeasonalLoadingTheme.FALL]: {
    primary: "#f97316", // Orange
    secondary: "#fb923c",
    gradient: "from-orange-400 to-red-500",
  },
  [SeasonalLoadingTheme.WINTER]: {
    primary: "#3b82f6", // Blue
    secondary: "#60a5fa",
    gradient: "from-blue-400 to-indigo-500",
  },
} as const;
