/**
 * Loading State Utilities and Helpers
 *
 * Comprehensive utility functions for managing loading states,
 * calculating progress, and handling cache operations.
 *
 * @module lib/loading/utils
 */

import {
  AGRICULTURAL_LOADING_MESSAGES,
  LoadingPriority,
  LoadingState,
  LoadingStrategy,
  SEASONAL_LOADING_COLORS,
  SeasonalLoadingTheme,
  type AgriculturalLoadingMetadata,
  type BaseLoadingState,
  type LoadingCacheEntry,
  type LoadingMetrics,
  type LoadingStage,
  type MultiStageLoadingState,
} from "./types";

// ============================================================================
// LOADING STATE HELPERS
// ============================================================================

/**
 * Create initial loading state
 */
export function createLoadingState(
  overrides?: Partial<BaseLoadingState>,
): BaseLoadingState {
  return {
    state: LoadingState.IDLE,
    priority: LoadingPriority.NORMAL,
    strategy: LoadingStrategy.EAGER,
    ...overrides,
  };
}

/**
 * Transition loading state
 */
export function transitionState(
  current: BaseLoadingState,
  newState: LoadingState,
  error?: Error,
): BaseLoadingState {
  const now = Date.now();

  return {
    ...current,
    state: newState,
    startTime: newState === LoadingState.LOADING ? now : current.startTime,
    endTime:
      newState === LoadingState.SUCCESS || newState === LoadingState.ERROR
        ? now
        : undefined,
    duration:
      current.startTime &&
      (newState === LoadingState.SUCCESS || newState === LoadingState.ERROR)
        ? now - current.startTime
        : undefined,
    error: newState === LoadingState.ERROR ? error : undefined,
  };
}

/**
 * Get loading state helpers
 */
export function getLoadingHelpers(state: LoadingState) {
  return {
    isIdle: state === LoadingState.IDLE,
    isLoading:
      state === LoadingState.LOADING || state === LoadingState.REFRESHING,
    isSuccess: state === LoadingState.SUCCESS,
    isError: state === LoadingState.ERROR,
    isRefreshing: state === LoadingState.REFRESHING,
    isStale: state === LoadingState.STALE,
  };
}

/**
 * Check if loading state should show loading UI
 */
export function shouldShowLoading(
  state: BaseLoadingState,
  minDuration = 300,
): boolean {
  if (state.state !== LoadingState.LOADING) return false;
  if (!state.startTime) return true;

  const elapsed = Date.now() - state.startTime;
  return elapsed >= minDuration;
}

/**
 * Check if loading is taking too long
 */
export function isLoadingTimeout(
  state: BaseLoadingState,
  timeout = 30000,
): boolean {
  if (state.state !== LoadingState.LOADING) return false;
  if (!state.startTime) return false;

  const elapsed = Date.now() - state.startTime;
  return elapsed >= timeout;
}

// ============================================================================
// MULTI-STAGE LOADING HELPERS
// ============================================================================

/**
 * Create multi-stage loading state
 */
export function createMultiStageLoading(
  stageNames: string[],
): MultiStageLoadingState {
  const stages: LoadingStage[] = stageNames.map((name: any, index: any) => ({
    id: `stage-${index}`,
    name,
    state: index === 0 ? LoadingState.LOADING : LoadingState.IDLE,
    progress: 0,
  }));

  return {
    stages,
    currentStage: 0,
    totalStages: stages.length,
    overallProgress: 0,
    state: LoadingState.LOADING,
  };
}

/**
 * Update stage progress
 */
export function updateStageProgress(
  multiStage: MultiStageLoadingState,
  stageIndex: number,
  progress: number,
): MultiStageLoadingState {
  const stages = [...multiStage.stages];
  const currentStage = stages[stageIndex];
  stages[stageIndex] = {
    ...currentStage,
    id: currentStage?.id || `stage-${stageIndex}`,
    name: currentStage?.name || `Stage ${stageIndex + 1}`,
    state: currentStage?.state || LoadingState.LOADING,
    progress: Math.min(100, Math.max(0, progress)),
  };

  const overallProgress = calculateOverallProgress(stages);

  return {
    ...multiStage,
    stages,
    overallProgress,
  };
}

/**
 * Complete current stage and move to next
 */
export function completeStage(
  multiStage: MultiStageLoadingState,
): MultiStageLoadingState {
  const stages = [...multiStage.stages];
  const currentIndex = multiStage.currentStage;

  // Mark current stage as complete
  const completedStage = stages[currentIndex];
  stages[currentIndex] = {
    ...completedStage,
    id: completedStage?.id || `stage-${currentIndex}`,
    name: completedStage?.name || `Stage ${currentIndex + 1}`,
    state: LoadingState.SUCCESS,
    progress: 100,
    endTime: Date.now(),
  };

  // Start next stage if available
  const nextIndex = currentIndex + 1;
  if (nextIndex < stages.length) {
    const nextStage = stages[nextIndex];
    stages[nextIndex] = {
      ...nextStage,
      id: nextStage?.id || `stage-${nextIndex}`,
      name: nextStage?.name || `Stage ${nextIndex + 1}`,
      state: LoadingState.LOADING,
      progress: nextStage?.progress || 0,
      startTime: Date.now(),
    };
  }

  const overallProgress = calculateOverallProgress(stages);
  const allComplete = nextIndex >= stages.length;

  return {
    ...multiStage,
    stages,
    currentStage: allComplete ? currentIndex : nextIndex,
    overallProgress,
    state: allComplete ? LoadingState.SUCCESS : LoadingState.LOADING,
  };
}

/**
 * Calculate overall progress from stages
 */
export function calculateOverallProgress(stages: LoadingStage[]): number {
  if (stages.length === 0) return 0;

  const totalProgress = stages.reduce(
    (sum: any, stage: any) => sum + stage.progress,
    0,
  );
  return Math.round(totalProgress / stages.length);
}

// ============================================================================
// PROGRESS CALCULATION HELPERS
// ============================================================================

/**
 * Calculate linear progress
 */
export function calculateLinearProgress(
  current: number,
  total: number,
): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Calculate time-based progress estimate
 */
export function estimateTimeBasedProgress(
  startTime: number,
  estimatedDuration: number,
): number {
  const elapsed = Date.now() - startTime;
  const progress = Math.round((elapsed / estimatedDuration) * 100);
  return Math.min(99, progress); // Never reach 100% on estimate
}

/**
 * Calculate exponential progress (slows down near end)
 */
export function calculateExponentialProgress(
  current: number,
  total: number,
  factor = 2,
): number {
  if (total === 0) return 0;
  const linear = current / total;
  const exponential = 1 - Math.pow(1 - linear, factor);
  return Math.round(exponential * 100);
}

/**
 * Smooth progress transition (avoid jumps)
 */
export function smoothProgress(
  currentProgress: number,
  targetProgress: number,
  smoothingFactor = 0.1,
): number {
  const diff = targetProgress - currentProgress;
  const increment = diff * smoothingFactor;
  return Math.round(currentProgress + increment);
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Create cache entry
 */
export function createCacheEntry<T>(
  data: T,
  ttl?: number,
): LoadingCacheEntry<T> {
  const now = Date.now();
  return {
    data,
    timestamp: now,
    expiresAt: ttl ? now + ttl : undefined,
    isStale: false,
    revalidating: false,
  };
}

/**
 * Check if cache entry is expired
 */
export function isCacheExpired<T>(entry: LoadingCacheEntry<T>): boolean {
  if (!entry.expiresAt) return false;
  return Date.now() > entry.expiresAt;
}

/**
 * Check if cache entry needs revalidation
 */
export function needsRevalidation<T>(
  entry: LoadingCacheEntry<T>,
  staleTime = 5000,
): boolean {
  const age = Date.now() - entry.timestamp;
  return age > staleTime;
}

/**
 * Mark cache entry as stale
 */
export function markStale<T>(
  entry: LoadingCacheEntry<T>,
): LoadingCacheEntry<T> {
  return {
    ...entry,
    isStale: true,
  };
}

/**
 * Start cache revalidation
 */
export function startRevalidation<T>(
  entry: LoadingCacheEntry<T>,
): LoadingCacheEntry<T> {
  return {
    ...entry,
    revalidating: true,
  };
}

/**
 * Complete cache revalidation
 */
export function completeRevalidation<T>(
  entry: LoadingCacheEntry<T>,
  newData: T,
): LoadingCacheEntry<T> {
  return {
    data: newData,
    timestamp: Date.now(),
    expiresAt: entry.expiresAt
      ? Date.now() + (entry.expiresAt - entry.timestamp)
      : undefined,
    isStale: false,
    revalidating: false,
  };
}

// ============================================================================
// METRICS UTILITIES
// ============================================================================

/**
 * Create loading metrics
 */
export function createLoadingMetrics(
  startTime: number,
  cacheHit = false,
): LoadingMetrics {
  return {
    startTime,
    attempts: 1,
    retries: 0,
    cacheHit,
  };
}

/**
 * Complete loading metrics
 */
export function completeLoadingMetrics(
  metrics: LoadingMetrics,
): LoadingMetrics {
  const endTime = Date.now();
  return {
    ...metrics,
    endTime,
    duration: endTime - metrics.startTime,
  };
}

/**
 * Increment retry count
 */
export function incrementRetry(metrics: LoadingMetrics): LoadingMetrics {
  return {
    ...metrics,
    attempts: metrics.attempts + 1,
    retries: metrics.retries + 1,
  };
}

// ============================================================================
// AGRICULTURAL LOADING UTILITIES
// ============================================================================

/**
 * Get current season
 */
export function getCurrentSeason(): SeasonalLoadingTheme {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return SeasonalLoadingTheme.SPRING; // Mar-May
  if (month >= 5 && month <= 7) return SeasonalLoadingTheme.SUMMER; // Jun-Aug
  if (month >= 8 && month <= 10) return SeasonalLoadingTheme.FALL; // Sep-Nov
  return SeasonalLoadingTheme.WINTER; // Dec-Feb
}

/**
 * Get seasonal colors
 */
export function getSeasonalColors(season?: SeasonalLoadingTheme) {
  const currentSeason = season || getCurrentSeason();
  return SEASONAL_LOADING_COLORS[currentSeason];
}

/**
 * Get agricultural loading message
 */
export function getAgriculturalMessage(
  metadata?: AgriculturalLoadingMetadata,
): string {
  if (!metadata) {
    return AGRICULTURAL_LOADING_MESSAGES.PROCESSING;
  }

  if (metadata.consciousness === "QUANTUM") {
    return AGRICULTURAL_LOADING_MESSAGES.QUANTUM_MANIFESTATION;
  }

  if (metadata.consciousness === "BIODYNAMIC") {
    return AGRICULTURAL_LOADING_MESSAGES.BIODYNAMIC_SYNC;
  }

  switch (metadata.harvestStatus) {
    case "PLANTING":
      return AGRICULTURAL_LOADING_MESSAGES.PLANTING;
    case "GROWING":
      return AGRICULTURAL_LOADING_MESSAGES.GROWING;
    case "HARVESTING":
      return AGRICULTURAL_LOADING_MESSAGES.HARVESTING;
    case "PROCESSING":
      return AGRICULTURAL_LOADING_MESSAGES.PROCESSING;
    default:
      return AGRICULTURAL_LOADING_MESSAGES.PROCESSING;
  }
}

/**
 * Create agricultural loading metadata
 */
export function createAgriculturalMetadata(
  overrides?: Partial<AgriculturalLoadingMetadata>,
): AgriculturalLoadingMetadata {
  return {
    season: getCurrentSeason(),
    consciousness: "ORGANIC",
    ...overrides,
  };
}

// ============================================================================
// DEBOUNCE & THROTTLE UTILITIES
// ============================================================================

/**
 * Debounce loading state updates
 */
export function debounceLoading<T extends any[]>(
  fn: (...args: T) => void,
  delay = 300,
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: T) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle loading state updates
 */
export function throttleLoading<T extends any[]>(
  fn: (...args: T) => void,
  limit = 100,
): (...args: T) => void {
  let inThrottle = false;

  return (...args: T) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// DELAY UTILITIES
// ============================================================================

/**
 * Ensure minimum loading time (prevent flashing)
 */
export async function ensureMinimumLoadingTime<T>(
  promise: Promise<T>,
  minTime = 300,
): Promise<T> {
  const startTime = Date.now();
  const result = await promise;
  const elapsed = Date.now() - startTime;

  if (elapsed < minTime) {
    await new Promise((resolve) => setTimeout(resolve, minTime - elapsed));
  }

  return result;
}

/**
 * Add artificial delay (for testing/UX)
 */
export async function withDelay<T>(
  promise: Promise<T>,
  delay: number,
): Promise<T> {
  const [result] = await Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, delay)),
  ]);
  return result;
}

/**
 * Race promise with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  timeoutError?: Error,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            timeoutError || new Error(`Operation timed out after ${timeout}ms`),
          ),
        timeout,
      ),
    ),
  ]);
}

// ============================================================================
// PRIORITY UTILITIES
// ============================================================================

/**
 * Compare loading priorities
 */
export function comparePriority(
  a: LoadingPriority,
  b: LoadingPriority,
): number {
  const priorities = {
    [LoadingPriority.LOW]: 1,
    [LoadingPriority.NORMAL]: 2,
    [LoadingPriority.HIGH]: 3,
    [LoadingPriority.CRITICAL]: 4,
  };

  return priorities[a] - priorities[b];
}

/**
 * Get highest priority from multiple states
 */
export function getHighestPriority(
  states: BaseLoadingState[],
): LoadingPriority {
  if (states.length === 0) return LoadingPriority.NORMAL;

  const priorityOrder: Record<LoadingPriority, number> = {
    [LoadingPriority.LOW]: 0,
    [LoadingPriority.NORMAL]: 1,
    [LoadingPriority.HIGH]: 2,
    [LoadingPriority.CRITICAL]: 3,
  };

  return states.reduce((highest: LoadingPriority, state: BaseLoadingState) => {
    return priorityOrder[state.priority] > priorityOrder[highest]
      ? state.priority
      : highest;
  }, LoadingPriority.LOW);
}

// ============================================================================
// BATCH LOADING UTILITIES
// ============================================================================

/**
 * Batch multiple loading operations
 */
export async function batchLoad<T>(
  operations: Array<() => Promise<T>>,
  batchSize = 5,
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((op: any) => op()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Load with retry logic
 */
export async function loadWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  backoff = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = backoff * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ============================================================================
// FORMAT UTILITIES
// ============================================================================

/**
 * Format loading duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Format progress percentage
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

/**
 * Get loading state label
 */
export function getLoadingStateLabel(state: LoadingState): string {
  const labels = {
    [LoadingState.IDLE]: "Ready",
    [LoadingState.LOADING]: "Loading",
    [LoadingState.SUCCESS]: "Complete",
    [LoadingState.ERROR]: "Error",
    [LoadingState.REFRESHING]: "Refreshing",
    [LoadingState.STALE]: "Stale",
  };

  return labels[state];
}
