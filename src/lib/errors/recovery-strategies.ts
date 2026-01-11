/**
 * 🌟 Recovery Strategies - Divine Agricultural Error Recovery Patterns
 *
 * Comprehensive recovery strategy implementations including retry patterns,
 * fallback mechanisms, circuit breakers, and agricultural consciousness.
 *
 * @module lib/errors/recovery-strategies
 */

import { logError } from "./logger";
import type { AppError, RecoveryStrategy } from "./types";
import { ErrorCategory, toAppError } from "./types";

// ============================================================================
// RECOVERY STRATEGY INTERFACE
// ============================================================================

export interface RecoveryStrategyConfig {
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Initial retry delay in milliseconds */
  initialDelay?: number;
  /** Maximum retry delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
  /** Timeout for operation */
  timeout?: number;
  /** Fallback value */
  fallback?: any;
  /** Should retry predicate */
  shouldRetry?: (error: AppError, attempt: number) => boolean;
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  strategy: RecoveryStrategy;
  attempts: number;
  usedFallback: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_CONFIG: Required<Omit<RecoveryStrategyConfig, "fallback">> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  timeout: 30000,
  shouldRetry: (error: AppError) => error.retryable,
};

// ============================================================================
// RETRY STRATEGY
// ============================================================================

/**
 * Execute function with retry logic and exponential backoff
 */
export async function retryStrategy<T>(
  fn: () => Promise<T>,
  config: RecoveryStrategyConfig = {},
): Promise<RecoveryResult<T>> {
  const {
    maxRetries = DEFAULT_CONFIG.maxRetries,
    initialDelay = DEFAULT_CONFIG.initialDelay,
    maxDelay = DEFAULT_CONFIG.maxDelay,
    backoffMultiplier = DEFAULT_CONFIG.backoffMultiplier,
    shouldRetry = DEFAULT_CONFIG.shouldRetry,
  } = config;

  let lastError: AppError | null = null;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        strategy: "RETRY" as RecoveryStrategy,
        attempts: attempt,
        usedFallback: false,
      };
    } catch (err) {
      lastError = toAppError(err);

      logError(lastError, {
        context: "retry-strategy",
        attempt,
        maxRetries,
        willRetry: attempt < maxRetries && shouldRetry(lastError, attempt),
      });

      // Check if we should retry
      if (attempt < maxRetries && shouldRetry(lastError, attempt)) {
        // Wait before retrying
        await sleep(delay);

        // Exponential backoff
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      } else {
        // No more retries or not retryable
        break;
      }
    }
  }

  return {
    success: false,
    error: lastError || toAppError(new Error("Retry strategy failed")),
    strategy: "RETRY" as RecoveryStrategy,
    attempts: maxRetries,
    usedFallback: false,
  };
}

// ============================================================================
// FALLBACK STRATEGY
// ============================================================================

/**
 * Execute function with fallback value on failure
 */
export async function fallbackStrategy<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  config: RecoveryStrategyConfig = {},
): Promise<RecoveryResult<T>> {
  const { timeout = DEFAULT_CONFIG.timeout } = config;

  try {
    const data = await withTimeout(fn(), timeout);
    return {
      success: true,
      data,
      strategy: "FALLBACK" as RecoveryStrategy,
      attempts: 1,
      usedFallback: false,
    };
  } catch (err) {
    const error = toAppError(err);

    logError(error, {
      context: "fallback-strategy",
      usingFallback: true,
    });

    return {
      success: true,
      data: fallbackValue,
      error,
      strategy: "FALLBACK" as RecoveryStrategy,
      attempts: 1,
      usedFallback: true,
    };
  }
}

// ============================================================================
// CIRCUIT BREAKER STRATEGY
// ============================================================================

export interface CircuitBreakerState {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = {
    state: "CLOSED",
    failures: 0,
    successes: 0,
    lastFailureTime: null,
    nextAttemptTime: null,
  };

  constructor(
    private config: {
      failureThreshold: number;
      successThreshold: number;
      timeout: number;
    } = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000, // 1 minute
    },
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<RecoveryResult<T>> {
    // Check if circuit is open
    if (this.state.state === "OPEN") {
      const now = Date.now();
      if (this.state.nextAttemptTime && now < this.state.nextAttemptTime) {
        // Circuit is still open
        const error = toAppError(new Error("Circuit breaker is open"));
        return {
          success: false,
          error,
          strategy: "NONE" as RecoveryStrategy,
          attempts: 0,
          usedFallback: false,
        };
      }

      // Transition to half-open
      this.state.state = "HALF_OPEN";
      this.state.failures = 0;
    }

    try {
      const data = await fn();
      this.onSuccess();
      return {
        success: true,
        data,
        strategy: "RETRY" as RecoveryStrategy,
        attempts: 1,
        usedFallback: false,
      };
    } catch (err) {
      const error = toAppError(err);
      this.onFailure();

      logError(error, {
        context: "circuit-breaker",
        circuitState: this.state.state,
        failures: this.state.failures,
      });

      return {
        success: false,
        error,
        strategy: "NONE" as RecoveryStrategy,
        attempts: 1,
        usedFallback: false,
      };
    }
  }

  private onSuccess(): void {
    if (this.state.state === "HALF_OPEN") {
      this.state.successes++;
      if (this.state.successes >= this.config.successThreshold) {
        // Close the circuit
        this.state.state = "CLOSED";
        this.state.failures = 0;
        this.state.successes = 0;
        this.state.lastFailureTime = null;
        this.state.nextAttemptTime = null;
      }
    } else {
      // Reset failures on success in closed state
      this.state.failures = 0;
    }
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.config.failureThreshold) {
      // Open the circuit
      this.state.state = "OPEN";
      this.state.successes = 0;
      this.state.nextAttemptTime = Date.now() + this.config.timeout;
    }

    // If in half-open, go back to open
    if (this.state.state === "HALF_OPEN") {
      this.state.state = "OPEN";
      this.state.nextAttemptTime = Date.now() + this.config.timeout;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      state: "CLOSED",
      failures: 0,
      successes: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
    };
  }
}

// ============================================================================
// GRACEFUL DEGRADATION STRATEGY
// ============================================================================

/**
 * Try multiple strategies in order until one succeeds
 */
export async function gracefulDegradationStrategy<T>(
  strategies: Array<() => Promise<T>>,
  config: RecoveryStrategyConfig = {},
): Promise<RecoveryResult<T>> {
  let lastError: AppError | null = null;

  for (let i = 0; i < strategies.length; i++) {
    try {
      const strategy = strategies[i];
      if (!strategy) continue;
      const data = await strategy();

      if (i > 0) {
        logError(toAppError(new Error("Using degraded service")), {
          context: "graceful-degradation",
          level: i,
          totalLevels: strategies.length,
        });
      }

      return {
        success: true,
        data,
        strategy:
          i === 0
            ? ("NONE" as RecoveryStrategy)
            : ("FALLBACK" as RecoveryStrategy),
        attempts: i + 1,
        usedFallback: i > 0,
      };
    } catch (err) {
      lastError = toAppError(err);

      logError(lastError, {
        context: "graceful-degradation-attempt",
        level: i,
        hasNextLevel: i < strategies.length - 1,
      });

      // Continue to next strategy
      continue;
    }
  }

  return {
    success: false,
    error: lastError || toAppError(new Error("All degradation levels failed")),
    strategy: "NONE" as RecoveryStrategy,
    attempts: strategies.length,
    usedFallback: false,
  };
}

// ============================================================================
// TIMEOUT STRATEGY
// ============================================================================

/**
 * Execute function with timeout
 */
export async function timeoutStrategy<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 30000,
): Promise<RecoveryResult<T>> {
  try {
    const data = await withTimeout(fn(), timeoutMs);
    return {
      success: true,
      data,
      strategy: "NONE" as RecoveryStrategy,
      attempts: 1,
      usedFallback: false,
    };
  } catch (err) {
    const error = toAppError(err);

    logError(error, {
      context: "timeout-strategy",
      timeout: timeoutMs,
    });

    return {
      success: false,
      error,
      strategy: "NONE" as RecoveryStrategy,
      attempts: 1,
      usedFallback: false,
    };
  }
}

// ============================================================================
// COMPOSITE STRATEGY
// ============================================================================

/**
 * Combine multiple recovery strategies
 */
export async function compositeStrategy<T>(
  fn: () => Promise<T>,
  config: {
    retry?: RecoveryStrategyConfig;
    fallback?: T;
    timeout?: number;
    useCircuitBreaker?: boolean;
    circuitBreaker?: CircuitBreaker;
  } = {},
): Promise<RecoveryResult<T>> {
  const {
    retry: retryConfig,
    fallback,
    timeout,
    useCircuitBreaker = false,
    circuitBreaker,
  } = config;

  // Wrap function with timeout if specified
  let wrappedFn = fn;
  if (timeout) {
    wrappedFn = () => withTimeout(fn(), timeout);
  }

  // Apply circuit breaker if enabled
  if (useCircuitBreaker && circuitBreaker) {
    return circuitBreaker.execute(wrappedFn);
  }

  // Try with retry strategy
  if (retryConfig) {
    const result = await retryStrategy(wrappedFn, retryConfig);
    if (result.success) {
      return result;
    }

    // If retry failed and fallback is available, use it
    if (fallback !== undefined) {
      return {
        success: true,
        data: fallback,
        error: result.error,
        strategy: "FALLBACK" as RecoveryStrategy,
        attempts: result.attempts,
        usedFallback: true,
      };
    }

    return result;
  }

  // Fallback strategy only
  if (fallback !== undefined) {
    return fallbackStrategy(wrappedFn, fallback);
  }

  // No recovery strategy - just execute
  try {
    const data = await wrappedFn();
    return {
      success: true,
      data,
      strategy: "NONE" as RecoveryStrategy,
      attempts: 1,
      usedFallback: false,
    };
  } catch (err) {
    const error = toAppError(err);
    return {
      success: false,
      error,
      strategy: "NONE" as RecoveryStrategy,
      attempts: 1,
      usedFallback: false,
    };
  }
}

// ============================================================================
// AGRICULTURAL RECOVERY STRATEGIES (Divine Pattern)
// ============================================================================

/**
 * Recovery strategy with agricultural consciousness
 */
export async function agriculturalRecoveryStrategy<T>(
  fn: () => Promise<T>,
  config: RecoveryStrategyConfig & {
    season?: string;
    farmId?: string;
    checkSeasonal?: (error: AppError) => boolean;
  } = {},
): Promise<RecoveryResult<T>> {
  const { season, farmId, checkSeasonal, ...strategyConfig } = config;

  const agriculturalContext = {
    season,
    farmId,
    consciousness: "DIVINE",
  };

  // Custom shouldRetry that accounts for seasonal errors
  const shouldRetry = (error: AppError, attempt: number): boolean => {
    // Don't retry seasonal errors
    if (
      error.category === ErrorCategory.SEASONAL ||
      error.category === ErrorCategory.BIODYNAMIC
    ) {
      return false;
    }

    // Custom seasonal check
    if (checkSeasonal && checkSeasonal(error)) {
      return false;
    }

    return error.retryable;
  };

  const result = await retryStrategy(fn, {
    ...strategyConfig,
    shouldRetry,
  });

  // Log with agricultural context
  if (!result.success && result.error) {
    logError(result.error, {
      context: "agricultural-recovery",
      agricultural: agriculturalContext,
    });
  }

  return result;
}

/**
 * Seasonal fallback strategy
 */
export async function seasonalFallbackStrategy<T>(
  fn: () => Promise<T>,
  fallbackByseason: Record<string, T>,
  currentSeason: string,
): Promise<RecoveryResult<T>> {
  try {
    const data = await fn();
    return {
      success: true,
      data,
      strategy: "NONE" as RecoveryStrategy,
      attempts: 1,
      usedFallback: false,
    };
  } catch (err) {
    const error = toAppError(err);

    // Get seasonal fallback
    const fallback =
      fallbackByseason[currentSeason] || fallbackByseason["DEFAULT"];

    logError(error, {
      context: "seasonal-fallback",
      season: currentSeason,
      hasFallback: fallback !== undefined,
    });

    if (fallback === undefined) {
      return {
        success: false,
        error,
        strategy: "FALLBACK" as RecoveryStrategy,
        attempts: 1,
        usedFallback: false,
      };
    }

    return {
      success: true,
      data: fallback,
      error,
      strategy: "FALLBACK" as RecoveryStrategy,
      attempts: 1,
      usedFallback: true,
    };
  }
}

// ============================================================================
// CACHE-BASED RECOVERY
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class RecoveryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(private defaultTTL: number = 5 * 60 * 1000) {} // 5 minutes

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttl || this.defaultTTL),
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Execute with cache-based recovery
 */
export async function cacheRecoveryStrategy<T>(
  key: string,
  fn: () => Promise<T>,
  cache: RecoveryCache<T>,
  config: {
    cacheTTL?: number;
    maxCacheAge?: number;
  } = {},
): Promise<RecoveryResult<T>> {
  const { cacheTTL, maxCacheAge = 5 * 60 * 1000 } = config;

  try {
    const data = await fn();
    // Update cache on success
    cache.set(key, data, cacheTTL);
    return {
      success: true,
      data,
      strategy: "NONE" as RecoveryStrategy,
      attempts: 1,
      usedFallback: false,
    };
  } catch (err) {
    const error = toAppError(err);

    // Try to use cached data
    const cached = cache.get(key);
    if (cached !== null) {
      logError(error, {
        context: "cache-recovery",
        usingCache: true,
      });

      return {
        success: true,
        data: cached,
        error,
        strategy: "FALLBACK" as RecoveryStrategy,
        attempts: 1,
        usedFallback: true,
      };
    }

    return {
      success: false,
      error,
      strategy: "FALLBACK" as RecoveryStrategy,
      attempts: 1,
      usedFallback: false,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute promise with timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(toAppError(new Error(`Operation timed out after ${timeoutMs}ms`)));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// ============================================================================
// STRATEGY SELECTOR
// ============================================================================

/**
 * Select appropriate recovery strategy based on error
 */
export function selectRecoveryStrategy(error: AppError): RecoveryStrategy {
  // Network errors - retry
  if (error.category === ErrorCategory.NETWORK) {
    return "RETRY" as RecoveryStrategy;
  }

  // Database errors - retry
  if (error.category === ErrorCategory.DATABASE) {
    return "RETRY" as RecoveryStrategy;
  }

  // API errors - retry if 5xx
  if (error.category === ErrorCategory.API) {
    if (error.code.includes("5")) {
      return "RETRY" as RecoveryStrategy;
    }
    return "FALLBACK" as RecoveryStrategy;
  }

  // Validation errors - don't retry
  if (error.category === ErrorCategory.VALIDATION) {
    return "CONTINUE" as RecoveryStrategy;
  }

  // Auth errors - reauth
  if (
    error.category === ErrorCategory.AUTHENTICATION ||
    error.category === ErrorCategory.AUTHORIZATION
  ) {
    return "REAUTH" as RecoveryStrategy;
  }

  // Seasonal/agricultural - don't retry
  if (
    error.category === ErrorCategory.SEASONAL ||
    error.category === ErrorCategory.BIODYNAMIC
  ) {
    return "CONTINUE" as RecoveryStrategy;
  }

  // Default - retry if retryable
  return error.retryable
    ? ("RETRY" as RecoveryStrategy)
    : ("CONTINUE" as RecoveryStrategy);
}

// ============================================================================
// EXPORTS
// ============================================================================

// All types are already exported inline above
