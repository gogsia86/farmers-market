/**
 * 🌟 Error Recovery Hook - Divine Agricultural Error Recovery
 *
 * React hooks for error recovery strategies including retry with backoff,
 * fallback data, circuit breaker, and agricultural consciousness.
 *
 * @module hooks/use-error-recovery
 */

"use client";

import { withRetry, type RetryOptions } from "@/lib/errors/handlers";
import { logError } from "@/lib/errors/logger";
import type { AppError } from "@/lib/errors/types";
import { toAppError } from "@/lib/errors/types";
import { useCallback, useEffect, useRef, useState } from "react";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// RETRY HOOK
// ============================================================================

export interface UseRetryOptions extends RetryOptions {
  /** Reset on success */
  resetOnSuccess?: boolean;
  /** Callback on successful retry */
  onSuccess?: () => void;
  /** Callback on final failure */
  onFailure?: (error: AppError) => void;
}

export interface UseRetryReturn<T> {
  /** Execute function with retry */
  execute: () => Promise<T | null>;
  /** Current attempt number */
  attempt: number;
  /** Is currently retrying */
  isRetrying: boolean;
  /** Last error */
  error: AppError | null;
  /** Reset retry state */
  reset: () => void;
  /** Can retry */
  canRetry: boolean;
}

/**
 * Hook for retry logic with exponential backoff
 *
 * @example
 * ```tsx
 * const retry = useRetry(
 *   async () => await fetchData(),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 1000,
 *     onSuccess: () => logger.info('Success!'),
 *     onFailure: (error) => logger.error('Failed:', error)
 *   }
 * );
 *
 * return (
 *   <button onClick={retry.execute} disabled={retry.isRetrying}>
 *     {retry.isRetrying ? `Retrying... (${retry.attempt})` : 'Try Again'}
 *   </button>
 * );
 * ```
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxAttempts = 3,
    resetOnSuccess = true,
    onSuccess,
    onFailure,
    ...retryOptions
  } = options;

  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setIsRetrying(true);
    setError(null);

    try {
      const result = await withRetry(fn, {
        ...retryOptions,
        maxAttempts,
        onRetry: (err, attemptNum) => {
          setAttempt(attemptNum);
          retryOptions.onRetry?.(err, attemptNum);
        },
      });

      if (resetOnSuccess) {
        setAttempt(0);
      }

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (err) {
      const appError = toAppError(err);
      setError(appError);
      setAttempt(maxAttempts);

      if (onFailure) {
        onFailure(appError);
      }

      logError(appError, {
        context: "retry-failed",
        maxAttempts,
      });

      return null;
    } finally {
      setIsRetrying(false);
    }
  }, [fn, maxAttempts, resetOnSuccess, onSuccess, onFailure, retryOptions]);

  const reset = useCallback(() => {
    setAttempt(0);
    setIsRetrying(false);
    setError(null);
  }, []);

  const canRetry = attempt < maxAttempts && !isRetrying;

  return {
    execute,
    attempt,
    isRetrying,
    error,
    reset,
    canRetry,
  };
}

// ============================================================================
// FALLBACK HOOK
// ============================================================================

export interface UseFallbackOptions<T> {
  /** Fallback data */
  fallback: T;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  /** Enable caching */
  enableCache?: boolean;
  /** Callback when using fallback */
  onFallback?: (error: AppError) => void;
}

export interface UseFallbackReturn<T> {
  /** Execute with fallback */
  execute: () => Promise<T>;
  /** Current data */
  data: T | null;
  /** Is loading */
  isLoading: boolean;
  /** Error */
  error: AppError | null;
  /** Is using fallback */
  isFallback: boolean;
  /** Retry */
  retry: () => Promise<T>;
  /** Clear cache */
  clearCache: () => void;
}

/**
 * Hook for fallback data strategy
 *
 * @example
 * ```tsx
 * const { data, execute, isFallback, retry } = useFallback(
 *   async () => await fetchProducts(),
 *   {
 *     fallback: [],
 *     cacheDuration: 5 * 60 * 1000, // 5 minutes
 *     onFallback: (error) => logger.warn('Using cached data')
 *   }
 * );
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 *
 * return (
 *   <div>
 *     {isFallback && <Banner>Showing cached data</Banner>}
 *     <ProductList products={data || []} />
 *   </div>
 * );
 * ```
 */
export function useFallback<T>(
  fn: () => Promise<T>,
  options: UseFallbackOptions<T>
): UseFallbackReturn<T> {
  const {
    fallback,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    enableCache = true,
    onFallback,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const cacheRef = useRef<{
    data: T;
    timestamp: number;
  } | null>(null);

  const execute = useCallback(async (): Promise<T> => {
    setIsLoading(true);
    setError(null);
    setIsFallback(false);

    try {
      const result = await fn();
      setData(result);

      // Update cache
      if (enableCache) {
        cacheRef.current = {
          data: result,
          timestamp: Date.now(),
        };
      }

      return result;
    } catch (err) {
      const appError = toAppError(err);
      setError(appError);

      // Check cache
      if (enableCache && cacheRef.current) {
        const age = Date.now() - cacheRef.current.timestamp;
        if (age < cacheDuration) {
          // Use cached data
          setData(cacheRef.current.data);
          setIsFallback(true);

          if (onFallback) {
            onFallback(appError);
          }

          logError(appError, {
            context: "using-cached-fallback",
            cacheAge: age,
          });

          return cacheRef.current.data;
        }
      }

      // Use fallback
      setData(fallback);
      setIsFallback(true);

      if (onFallback) {
        onFallback(appError);
      }

      logError(appError, {
        context: "using-fallback-data",
      });

      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, [fn, fallback, enableCache, cacheDuration, onFallback]);

  const retry = useCallback(async (): Promise<T> => {
    return execute();
  }, [execute]);

  const clearCache = useCallback(() => {
    cacheRef.current = null;
  }, []);

  return {
    execute,
    data,
    isLoading,
    error,
    isFallback,
    retry,
    clearCache,
  };
}

// ============================================================================
// CIRCUIT BREAKER HOOK
// ============================================================================

export interface UseCircuitBreakerOptions {
  /** Failure threshold before opening circuit */
  failureThreshold?: number;
  /** Success threshold before closing circuit */
  successThreshold?: number;
  /** Timeout in milliseconds before trying again */
  timeout?: number;
  /** Callback when circuit opens */
  onOpen?: () => void;
  /** Callback when circuit closes */
  onClose?: () => void;
}

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface UseCircuitBreakerReturn<T> {
  /** Execute with circuit breaker */
  execute: () => Promise<T | null>;
  /** Circuit state */
  state: CircuitState;
  /** Failure count */
  failures: number;
  /** Success count */
  successes: number;
  /** Reset circuit */
  reset: () => void;
  /** Is circuit open */
  isOpen: boolean;
}

/**
 * Hook for circuit breaker pattern
 *
 * Prevents cascading failures by "opening" after repeated failures.
 *
 * @example
 * ```tsx
 * const circuit = useCircuitBreaker(
 *   async () => await callExternalAPI(),
 *   {
 *     failureThreshold: 5,
 *     timeout: 60000, // 1 minute
 *     onOpen: () => logger.warn('Circuit opened!')
 *   }
 * );
 *
 * return (
 *   <div>
 *     {circuit.isOpen && <Alert>Service temporarily unavailable</Alert>}
 *     <button onClick={circuit.execute}>
 *       Call API ({circuit.state})
 *     </button>
 *   </div>
 * );
 * ```
 */
export function useCircuitBreaker<T>(
  fn: () => Promise<T>,
  options: UseCircuitBreakerOptions = {}
): UseCircuitBreakerReturn<T> {
  const {
    failureThreshold = 5,
    successThreshold = 2,
    timeout = 60000, // 1 minute
    onOpen,
    onClose,
  } = options;

  const [state, setState] = useState<CircuitState>("CLOSED");
  const [failures, setFailures] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Open circuit
  const openCircuit = useCallback(() => {
    setState("OPEN");
    setSuccesses(0);

    if (onOpen) {
      onOpen();
    }

    // Set timeout to half-open
    timeoutRef.current = setTimeout(() => {
      setState("HALF_OPEN");
      setFailures(0);
    }, timeout);
  }, [timeout, onOpen]);

  // Close circuit
  const closeCircuit = useCallback(() => {
    setState("CLOSED");
    setFailures(0);
    setSuccesses(0);

    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const execute = useCallback(async (): Promise<T | null> => {
    // Circuit is open - reject immediately
    if (state === "OPEN") {
      const error = toAppError(new Error("Circuit breaker is open"));
      logError(error, {
        context: "circuit-breaker-open",
        failures,
      });
      return null;
    }

    try {
      const result = await fn();

      // Success
      if (state === "HALF_OPEN") {
        const newSuccesses = successes + 1;
        setSuccesses(newSuccesses);

        // Close circuit if threshold reached
        if (newSuccesses >= successThreshold) {
          closeCircuit();
        }
      } else {
        // Reset failures on success in closed state
        setFailures(0);
      }

      return result;
    } catch (err) {
      const newFailures = failures + 1;
      setFailures(newFailures);

      // Open circuit if threshold reached
      if (newFailures >= failureThreshold) {
        openCircuit();
      }

      // Back to open if failure in half-open
      if (state === "HALF_OPEN") {
        openCircuit();
      }

      const appError = toAppError(err);
      logError(appError, {
        context: "circuit-breaker-failure",
        failures: newFailures,
        state,
      });

      return null;
    }
  }, [
    fn,
    state,
    failures,
    successes,
    failureThreshold,
    successThreshold,
    openCircuit,
    closeCircuit,
  ]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState("CLOSED");
    setFailures(0);
    setSuccesses(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    execute,
    state,
    failures,
    successes,
    reset,
    isOpen: state === "OPEN",
  };
}

// ============================================================================
// GRACEFUL DEGRADATION HOOK
// ============================================================================

export interface UseGracefulDegradationOptions<T> {
  /** Degradation levels (ordered from best to worst) */
  levels: Array<() => Promise<T>>;
  /** Callback on degradation */
  onDegrade?: (level: number) => void;
}

export interface UseGracefulDegradationReturn<T> {
  /** Execute with graceful degradation */
  execute: () => Promise<T | null>;
  /** Current degradation level */
  level: number;
  /** Is degraded */
  isDegraded: boolean;
  /** Is loading */
  isLoading: boolean;
  /** Last error */
  error: AppError | null;
}

/**
 * Hook for graceful degradation
 *
 * Try multiple strategies in order until one succeeds.
 *
 * @example
 * ```tsx
 * const { execute, level, isDegraded } = useGracefulDegradation({
 *   levels: [
 *     async () => await fetchFromAPI(),
 *     async () => await fetchFromCache(),
 *     async () => await fetchFromLocal(),
 *     async () => defaultData
 *   ],
 *   onDegrade: (level) => logger.warn(`Degraded to level ${level}`)
 * });
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 * ```
 */
export function useGracefulDegradation<T>(
  options: UseGracefulDegradationOptions<T>
): UseGracefulDegradationReturn<T> {
  const { levels, onDegrade } = options;

  const [level, setLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    for (let i = 0; i < levels.length; i++) {
      try {
        const levelFn = levels[i];
        if (!levelFn) continue;
        const result = await levelFn();
        setLevel(i);

        if (i > 0 && onDegrade) {
          onDegrade(i);
        }

        setIsLoading(false);
        return result;
      } catch (err) {
        const appError = toAppError(err);
        setError(appError);

        // Log degradation attempt
        logError(appError, {
          context: "graceful-degradation",
          level: i,
          hasNext: i < levels.length - 1,
        });

        // Continue to next level
        continue;
      }
    }

    // All levels failed
    setIsLoading(false);
    return null;
  }, [levels, onDegrade]);

  return {
    execute,
    level,
    isDegraded: level > 0,
    isLoading,
    error,
  };
}

// ============================================================================
// AGRICULTURAL RECOVERY HOOK (Divine Pattern)
// ============================================================================

export interface UseAgriculturalRecoveryOptions<T>
  extends Omit<UseRetryOptions, "shouldRetry"> {
  /** Season context */
  season?: string;
  /** Farm ID */
  farmId?: string;
  /** Fallback data */
  fallback?: T;
  /** Check if error is seasonal */
  isSeasonalError?: (error: AppError) => boolean;
}

export interface UseAgriculturalRecoveryReturn<T>
  extends Omit<UseRetryReturn<T>, "execute"> {
  /** Execute with agricultural consciousness */
  execute: () => Promise<T | null>;
  /** Is using fallback */
  isFallback: boolean;
  /** Agricultural context */
  agriculturalContext: {
    season?: string;
    farmId?: string;
    consciousness: string;
  };
}

/**
 * Hook for agricultural error recovery with consciousness
 *
 * Combines retry logic with agricultural awareness and seasonal handling.
 *
 * @example
 * ```tsx
 * const recovery = useAgriculturalRecovery(
 *   async () => await plantSeeds(),
 *   {
 *     season: 'SPRING',
 *     farmId: 'farm_123',
 *     fallback: { planted: false },
 *     maxAttempts: 3
 *   }
 * );
 *
 * return (
 *   <button onClick={recovery.execute}>
 *     {recovery.isRetrying ? 'Planting...' : 'Plant Seeds'}
 *   </button>
 * );
 * ```
 */
export function useAgriculturalRecovery<T>(
  fn: () => Promise<T>,
  options: UseAgriculturalRecoveryOptions<T> = {}
): UseAgriculturalRecoveryReturn<T> {
  const {
    season,
    farmId,
    fallback,
    isSeasonalError,
    ...retryOptions
  } = options;

  const [isFallback, setIsFallback] = useState(false);

  const agriculturalContext = {
    season,
    farmId,
    consciousness: "DIVINE" as const,
  };

  const retry = useRetry(fn, {
    ...retryOptions,
    shouldRetry: (error) => {
      const appError = toAppError(error);

      // Don't retry seasonal errors
      if (isSeasonalError && isSeasonalError(appError)) {
        return false;
      }

      return appError.retryable;
    },
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setIsFallback(false);

    const result = await retry.execute();

    // Use fallback if available and retry failed
    if (result === null && fallback !== undefined) {
      setIsFallback(true);
      return fallback;
    }

    return result;
  }, [retry, fallback]);

  return {
    ...retry,
    execute,
    isFallback,
    agriculturalContext,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// All types are already exported inline above
