/**
 * Loading State Hooks
 *
 * React hooks for managing loading states, async operations,
 * and loading UI lifecycle.
 *
 * @module hooks/use-loading
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  LoadingPriority,
  LoadingState,
  LoadingStrategy,
  type AsyncOperationState,
  type BaseLoadingState,
  type LoadingMetrics,
} from "@/lib/loading/types";
import {
  completeLoadingMetrics,
  createLoadingMetrics,
  createLoadingState,
  getLoadingHelpers,
  incrementRetry,
  transitionState,
} from "@/lib/loading/utils";

// ============================================================================
// BASE LOADING HOOK
// ============================================================================

/**
 * Base loading state hook
 *
 * @example
 * ```tsx
 * const { state, startLoading, stopLoading, setError } = useLoadingState();
 *
 * const fetchData = async () => {
 *   startLoading();
 *   try {
 *     const data = await api.fetch();
 *     stopLoading();
 *   } catch (error) {
 *     setError(error);
 *   }
 * };
 * ```
 */
export function useLoadingState(initialState?: Partial<BaseLoadingState>) {
  const [loadingState, setLoadingState] = useState<BaseLoadingState>(() =>
    createLoadingState(initialState),
  );

  const startLoading = useCallback(() => {
    setLoadingState((prev) => transitionState(prev, LoadingState.LOADING));
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState((prev) => transitionState(prev, LoadingState.SUCCESS));
  }, []);

  const setError = useCallback((error: Error) => {
    setLoadingState((prev) => transitionState(prev, LoadingState.ERROR, error));
  }, []);

  const setRefreshing = useCallback(() => {
    setLoadingState((prev) => transitionState(prev, LoadingState.REFRESHING));
  }, []);

  const setStale = useCallback(() => {
    setLoadingState((prev) => transitionState(prev, LoadingState.STALE));
  }, []);

  const reset = useCallback(() => {
    setLoadingState(createLoadingState(initialState));
  }, [initialState]);

  const helpers = getLoadingHelpers(loadingState.state);

  return {
    state: loadingState,
    ...helpers,
    startLoading,
    stopLoading,
    setError,
    setRefreshing,
    setStale,
    reset,
  };
}

// ============================================================================
// ASYNC OPERATION HOOK
// ============================================================================

export interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  priority?: LoadingPriority;
  strategy?: LoadingStrategy;
}

/**
 * Async operation hook with automatic loading state management
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useAsync(
 *   async () => await fetchFarms(),
 *   { immediate: true }
 * );
 * ```
 */
export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {},
) {
  const {
    immediate = false,
    onSuccess,
    onError,
    priority = LoadingPriority.NORMAL,
    strategy = LoadingStrategy.EAGER,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    state: LoadingState.IDLE,
    priority,
    strategy,
    data: undefined,
    error: undefined,
    progress: 0,
  });

  const isMountedRef = useRef(true);
  const metricsRef = useRef<LoadingMetrics | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args) => {
      if (!isMountedRef.current) return;

      setState((prev) => ({
        ...prev,
        state: LoadingState.LOADING,
        startTime: Date.now(),
        error: undefined,
      }));

      metricsRef.current = createLoadingMetrics(Date.now());

      try {
        const result = await asyncFunction(...args);

        if (!isMountedRef.current) return;

        metricsRef.current = completeLoadingMetrics(metricsRef.current);

        setState((prev) => ({
          ...prev,
          state: LoadingState.SUCCESS,
          data: result,
          endTime: Date.now(),
          duration: metricsRef.current?.duration,
          error: undefined,
        }));

        onSuccess?.(result);
        return result;
      } catch (error) {
        if (!isMountedRef.current) return;

        const err = error instanceof Error ? error : new Error(String(error));

        metricsRef.current = completeLoadingMetrics(metricsRef.current!);

        setState((prev) => ({
          ...prev,
          state: LoadingState.ERROR,
          error: err,
          endTime: Date.now(),
          duration: metricsRef.current?.duration,
        }));

        onError?.(err);
        throw err;
      }
    },
    [asyncFunction, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({
      state: LoadingState.IDLE,
      priority,
      strategy,
      data: undefined,
      error: undefined,
      progress: 0,
    });
  }, [priority, strategy]);

  const retry = useCallback(async () => {
    if (metricsRef.current) {
      metricsRef.current = incrementRetry(metricsRef.current);
    }
    return execute(...([] as unknown as Args));
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, [immediate, execute]);

  const helpers = getLoadingHelpers(state.state);

  return {
    ...state,
    ...helpers,
    execute,
    reset,
    retry,
    metrics: metricsRef.current,
  };
}

// ============================================================================
// LOADING CALLBACK HOOK
// ============================================================================

export interface UseLoadingCallbackOptions {
  minLoadingTime?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Wrap a callback with loading state
 *
 * @example
 * ```tsx
 * const [handleSubmit, isLoading] = useLoadingCallback(
 *   async (data) => await submitForm(data),
 *   { minLoadingTime: 300 }
 * );
 * ```
 */
export function useLoadingCallback<Args extends any[]>(
  callback: (...args: Args) => Promise<void>,
  options: UseLoadingCallbackOptions = {},
): [(...args: Args) => Promise<void>, boolean] {
  const { minLoadingTime = 0, onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const wrappedCallback = useCallback(
    async (...args: Args) => {
      setIsLoading(true);
      const startTime = Date.now();

      try {
        await callback(...args);

        // Ensure minimum loading time
        if (minLoadingTime > 0) {
          const elapsed = Date.now() - startTime;
          if (elapsed < minLoadingTime) {
            await new Promise((resolve) =>
              setTimeout(resolve, minLoadingTime - elapsed),
            );
          }
        }

        if (isMountedRef.current) {
          setIsLoading(false);
          onSuccess?.();
        }
      } catch (error) {
        if (isMountedRef.current) {
          setIsLoading(false);
          const err = error instanceof Error ? error : new Error(String(error));
          onError?.(err);
          throw err;
        }
      }
    },
    [callback, minLoadingTime, onSuccess, onError],
  );

  return [wrappedCallback, isLoading];
}

// ============================================================================
// LOADING DELAY HOOK
// ============================================================================

/**
 * Delay showing loading state to prevent flashing
 *
 * @example
 * ```tsx
 * const { isLoading } = useAsync(fetchData);
 * const showLoading = useLoadingDelay(isLoading, 300);
 *
 * return showLoading ? <Spinner /> : <Content />;
 * ```
 */
export function useLoadingDelay(isLoading: boolean, delay = 300): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowLoading(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, delay]);

  return showLoading;
}

// ============================================================================
// LOADING TIMEOUT HOOK
// ============================================================================

/**
 * Trigger timeout callback if loading takes too long
 *
 * @example
 * ```tsx
 * const { isLoading } = useAsync(fetchData);
 * const isTimeout = useLoadingTimeout(isLoading, 30000);
 *
 * if (isTimeout) {
 *   return <ErrorMessage>Request timed out</ErrorMessage>;
 * }
 * ```
 */
export function useLoadingTimeout(
  isLoading: boolean,
  timeout = 30000,
  onTimeout?: () => void,
): boolean {
  const [isTimeout, setIsTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isLoading) {
      setIsTimeout(false);
      timeoutRef.current = setTimeout(() => {
        setIsTimeout(true);
        onTimeout?.();
      }, timeout);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsTimeout(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, timeout, onTimeout]);

  return isTimeout;
}

// ============================================================================
// PROGRESS TRACKING HOOK
// ============================================================================

export interface UseProgressOptions {
  interval?: number;
  increment?: number;
  max?: number;
}

/**
 * Track progress with automatic incrementation
 *
 * @example
 * ```tsx
 * const { progress, start, stop, reset } = useProgress({
 *   interval: 100,
 *   increment: 5,
 *   max: 90
 * });
 * ```
 */
export function useProgress(options: UseProgressOptions = {}) {
  const { interval = 100, increment = 5, max = 90 } = options;
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const start = useCallback(() => {
    setIsActive(true);
    setProgress(0);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const complete = useCallback(() => {
    setProgress(100);
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const setManual = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= max) {
            return prev;
          }
          return Math.min(prev + increment, max);
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, interval, increment, max]);

  return {
    progress,
    isActive,
    start,
    stop,
    complete,
    reset,
    setProgress: setManual,
  };
}

// ============================================================================
// SEQUENTIAL LOADING HOOK
// ============================================================================

/**
 * Load multiple items sequentially with progress tracking
 *
 * @example
 * ```tsx
 * const { progress, isLoading, execute } = useSequentialLoading();
 *
 * const loadAll = () => {
 *   execute([
 *     () => fetchFarms(),
 *     () => fetchProducts(),
 *     () => fetchOrders(),
 *   ]);
 * };
 * ```
 */
export function useSequentialLoading<T = any>() {
  const [state, setState] = useState<{
    isLoading: boolean;
    progress: number;
    results: T[];
    currentIndex: number;
    error?: Error;
  }>({
    isLoading: false,
    progress: 0,
    results: [],
    currentIndex: -1,
  });

  const execute = useCallback(async (operations: Array<() => Promise<T>>) => {
    setState({
      isLoading: true,
      progress: 0,
      results: [],
      currentIndex: 0,
    });

    const results: T[] = [];

    try {
      for (let i = 0; i < operations.length; i++) {
        setState((prev) => ({
          ...prev,
          currentIndex: i,
          progress: (i / operations.length) * 100,
        }));

        const operation = operations[i];
        if (operation) {
          const result = await operation();
          results.push(result);
        }
      }

      setState({
        isLoading: false,
        progress: 100,
        results,
        currentIndex: operations.length,
      });

      return results;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err,
      }));
      throw err;
    }
  }, []);

  return {
    ...state,
    execute,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useLoadingState;
