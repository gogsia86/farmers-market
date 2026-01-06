/**
 * 🌟 Error Handler Hook - Divine Agricultural Error Management
 *
 * React hooks for manual error handling, async error throwing,
 * and error state management with agricultural consciousness.
 *
 * @module hooks/use-error-handler
 */

"use client";

import { logError } from "@/lib/errors/logger";
import type { AppError } from "@/lib/errors/types";
import { toAppError } from "@/lib/errors/types";
import { useCallback, useState } from "react";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// ERROR HANDLER HOOK
// ============================================================================

export interface UseErrorHandlerOptions {
  /** Log errors automatically */
  logErrors?: boolean;
  /** Callback when error occurs */
  onError?: (error: AppError) => void;
  /** Throw errors to error boundary */
  throwToBoundary?: boolean;
}

export interface UseErrorHandlerReturn {
  /** Current error state */
  error: AppError | null;
  /** Check if there's an error */
  hasError: boolean;
  /** Handle an error */
  handleError: (error: unknown) => void;
  /** Clear the error */
  clearError: () => void;
  /** Reset error state */
  reset: () => void;
}

/**
 * Hook for manual error handling
 *
 * @example
 * ```tsx
 * const { error, handleError, clearError } = useErrorHandler({
 *   logErrors: true,
 *   onError: (error) => logger.error(error)
 * });
 *
 * const submitForm = async () => {
 *   try {
 *     await api.submit(data);
 *   } catch (err) {
 *     handleError(err);
 *   }
 * };
 * ```
 */
export function useErrorHandler(
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn {
  const {
    logErrors = true,
    onError,
    throwToBoundary = false,
  } = options;

  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback(
    (err: unknown) => {
      const appError = toAppError(err);
      setError(appError);

      // Log error
      if (logErrors) {
        logError(appError);
      }

      // Call error callback
      if (onError) {
        onError(appError);
      }

      // Throw to error boundary
      if (throwToBoundary) {
        throw appError;
      }
    },
    [logErrors, onError, throwToBoundary]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = clearError;

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
    reset,
  };
}

// ============================================================================
// ASYNC ERROR HOOK
// ============================================================================

/**
 * Hook to throw errors in async callbacks (for error boundaries)
 *
 * Error boundaries don't catch errors in async functions or event handlers.
 * This hook provides a way to throw errors that will be caught by error boundaries.
 *
 * @example
 * ```tsx
 * const throwError = useAsyncError();
 *
 * const handleClick = async () => {
 *   try {
 *     await fetchData();
 *   } catch (error) {
 *     throwError(error); // Will be caught by error boundary
 *   }
 * };
 * ```
 */
export function useAsyncError(): (error: unknown) => void {
  const [, setError] = useState<unknown>(null);

  return useCallback((error: unknown) => {
    setError(() => {
      throw error;
    });
  }, []);
}

// ============================================================================
// ERROR BOUNDARY HOOK
// ============================================================================

export interface UseErrorBoundaryReturn {
  /** Show error boundary */
  showBoundary: (error: unknown) => void;
  /** Reset error boundary */
  resetBoundary: () => void;
}

/**
 * Hook to access nearest error boundary
 *
 * Provides methods to manually trigger the error boundary or reset it.
 *
 * @example
 * ```tsx
 * const { showBoundary, resetBoundary } = useErrorBoundary();
 *
 * const handleError = (error: Error) => {
 *   showBoundary(error); // Show error boundary
 * };
 *
 * const retry = () => {
 *   resetBoundary(); // Reset and retry
 * };
 * ```
 */
export function useErrorBoundary(): UseErrorBoundaryReturn {
  const throwError = useAsyncError();

  const showBoundary = useCallback(
    (error: unknown) => {
      throwError(error);
    },
    [throwError]
  );

  const resetBoundary = useCallback(() => {
    // Reset is typically handled by the error boundary itself
    // This is a placeholder for custom reset logic
    window.location.reload();
  }, []);

  return {
    showBoundary,
    resetBoundary,
  };
}

// ============================================================================
// ERROR STATE HOOK
// ============================================================================

export interface ErrorState {
  error: AppError | null;
  isError: boolean;
  errorCount: number;
  lastError: Date | null;
}

export interface UseErrorStateReturn extends ErrorState {
  /** Set error */
  setError: (error: unknown) => void;
  /** Clear error */
  clearError: () => void;
  /** Reset error state */
  reset: () => void;
  /** Check if error is of specific type */
  isErrorType: (type: string) => boolean;
  /** Check if error is retryable */
  isRetryable: boolean;
}

/**
 * Hook for advanced error state management
 *
 * @example
 * ```tsx
 * const errorState = useErrorState();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await submit();
 *   } catch (err) {
 *     errorState.setError(err);
 *   }
 * };
 *
 * if (errorState.isError && errorState.isRetryable) {
 *   // Show retry button
 * }
 * ```
 */
export function useErrorState(): UseErrorStateReturn {
  const [state, setState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorCount: 0,
    lastError: null,
  });

  const setError = useCallback((error: unknown) => {
    const appError = toAppError(error);
    setState((prev) => ({
      error: appError,
      isError: true,
      errorCount: prev.errorCount + 1,
      lastError: new Date(),
    }));
    logError(appError);
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      isError: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      error: null,
      isError: false,
      errorCount: 0,
      lastError: null,
    });
  }, []);

  const isErrorType = useCallback(
    (type: string): boolean => {
      return state.error?.code === type;
    },
    [state.error]
  );

  const isRetryable = state.error?.retryable ?? false;

  return {
    ...state,
    setError,
    clearError,
    reset,
    isErrorType,
    isRetryable,
  };
}

// ============================================================================
// VALIDATION ERROR HOOK
// ============================================================================

export interface UseValidationErrorReturn {
  /** Field errors */
  errors: Record<string, string>;
  /** Check if field has error */
  hasError: (field: string) => boolean;
  /** Get error message for field */
  getError: (field: string) => string | undefined;
  /** Set field error */
  setError: (field: string, message: string) => void;
  /** Clear field error */
  clearError: (field: string) => void;
  /** Clear all errors */
  clearAll: () => void;
  /** Set multiple errors */
  setErrors: (errors: Record<string, string>) => void;
  /** Check if any errors exist */
  hasAnyError: boolean;
}

/**
 * Hook for managing form validation errors
 *
 * @example
 * ```tsx
 * const validation = useValidationError();
 *
 * const handleSubmit = () => {
 *   validation.clearAll();
 *
 *   if (!email) {
 *     validation.setError('email', 'Email is required');
 *   }
 *
 *   if (validation.hasAnyError) {
 *     return;
 *   }
 *
 *   // Submit form
 * };
 *
 * return (
 *   <input
 *     {...}
 *     error={validation.hasError('email')}
 *     helperText={validation.getError('email')}
 *   />
 * );
 * ```
 */
export function useValidationError(): UseValidationErrorReturn {
  const [errors, setErrorsState] = useState<Record<string, string>>({});

  const hasError = useCallback(
    (field: string): boolean => {
      return field in errors;
    },
    [errors]
  );

  const getError = useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  const setError = useCallback((field: string, message: string) => {
    setErrorsState((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAll = useCallback(() => {
    setErrorsState({});
  }, []);

  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrorsState(newErrors);
  }, []);

  const hasAnyError = Object.keys(errors).length > 0;

  return {
    errors,
    hasError,
    getError,
    setError,
    clearError,
    clearAll,
    setErrors,
    hasAnyError,
  };
}

// ============================================================================
// AGRICULTURAL ERROR HOOK (Divine Pattern)
// ============================================================================

export interface UseAgriculturalErrorOptions {
  /** Current season */
  season?: string;
  /** Farm ID */
  farmId?: string;
  /** Log with agricultural context */
  logWithContext?: boolean;
}

export interface UseAgriculturalErrorReturn extends UseErrorHandlerReturn {
  /** Agricultural context */
  agriculturalContext: {
    season?: string;
    farmId?: string;
    consciousness: string;
  };
}

/**
 * Hook for agricultural error handling with consciousness
 *
 * @example
 * ```tsx
 * const { error, handleError } = useAgriculturalError({
 *   season: 'SPRING',
 *   farmId: 'farm_123'
 * });
 *
 * const handlePlanting = async () => {
 *   try {
 *     await plantSeeds();
 *   } catch (err) {
 *     handleError(err); // Logged with agricultural context
 *   }
 * };
 * ```
 */
export function useAgriculturalError(
  options: UseAgriculturalErrorOptions = {}
): UseAgriculturalErrorReturn {
  const { season, farmId, logWithContext = true } = options;

  const [error, setError] = useState<AppError | null>(null);

  const agriculturalContext = {
    season,
    farmId,
    consciousness: "DIVINE" as const,
  };

  const handleError = useCallback(
    (err: unknown) => {
      const appError = toAppError(err);
      setError(appError);

      // Log with agricultural context
      if (logWithContext) {
        logError(appError, {
          agricultural: agriculturalContext,
        });
      }
    },
    [logWithContext, agriculturalContext]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
    reset: clearError,
    agriculturalContext,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================
// All types are already exported inline above
