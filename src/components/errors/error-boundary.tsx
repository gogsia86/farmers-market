/**
 * 🌟 Error Boundary Components - Divine Agricultural Error Recovery
 *
 * React error boundaries with recovery strategies, fallback UI,
 * and agricultural consciousness.
 *
 * @module components/errors/error-boundary
 */

"use client";

import { logError } from "@/lib/errors/logger";
import {
  AppError,
  ErrorBoundaryState,
  ErrorCategory,
  ErrorSeverity,
  RecoveryStrategy,
  toAppError,
} from "@/lib/errors/types";
import React, { Component, type ErrorInfo, type ReactNode } from "react";

// ============================================================================
// ERROR BOUNDARY PROPS
// ============================================================================

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Fallback UI to render on error */
  fallback?: ReactNode | ((error: AppError, reset: () => void) => ReactNode);
  /** Callback when error occurs */
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  /** Callback when error is reset */
  onReset?: () => void;
  /** Maximum recovery attempts before giving up */
  maxRecoveryAttempts?: number;
  /** Recovery cooldown in milliseconds */
  recoveryCooldown?: number;
  /** Error boundary name for identification */
  name?: string;
  /** Enable automatic recovery */
  autoRecover?: boolean;
  /** Recovery delay in milliseconds */
  recoveryDelay?: number;
}

// ============================================================================
// BASE ERROR BOUNDARY
// ============================================================================

/**
 * Base error boundary with recovery logic
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private recoveryTimer: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempts: 0,
      lastRecoveryAttempt: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error: toAppError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const appError = toAppError(error);

    // Log the error
    logError(appError, {
      component: this.props.name || "ErrorBoundary",
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call onError callback
    if (this.props.onError) {
      this.props.onError(appError, errorInfo);
    }

    // Attempt automatic recovery if enabled
    if (this.props.autoRecover && this.canRecover()) {
      this.scheduleRecovery();
    }
  }

  componentWillUnmount(): void {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }

  /**
   * Check if recovery is allowed
   */
  private canRecover(): boolean {
    const { maxRecoveryAttempts = 3, recoveryCooldown = 5000 } = this.props;
    const { recoveryAttempts, lastRecoveryAttempt } = this.state;

    // Check max attempts
    if (recoveryAttempts >= maxRecoveryAttempts) {
      return false;
    }

    // Check cooldown
    if (lastRecoveryAttempt) {
      const timeSinceLastAttempt = Date.now() - lastRecoveryAttempt.getTime();
      if (timeSinceLastAttempt < recoveryCooldown) {
        return false;
      }
    }

    return true;
  }

  /**
   * Schedule automatic recovery
   */
  private scheduleRecovery(): void {
    const { recoveryDelay = 3000 } = this.props;

    this.recoveryTimer = setTimeout(() => {
      this.handleReset();
    }, recoveryDelay);
  }

  /**
   * Reset error boundary
   */
  private handleReset = (): void => {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
      this.recoveryTimer = null;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempts: prevState.recoveryAttempts + 1,
      lastRecoveryAttempt: new Date(),
    }));

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render fallback UI
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// DEFAULT ERROR FALLBACK
// ============================================================================

interface DefaultErrorFallbackProps {
  error: AppError;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border-2 border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {error.userDetails.title}
          </h2>
        </div>

        <p className="text-gray-600 mb-4">{error.userDetails.message}</p>

        {error.userDetails.suggestions &&
          error.userDetails.suggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Suggestions:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {error.userDetails.suggestions.map(
                  (suggestion: any, index: any) => (
                    <li key={index}>{suggestion}</li>
                  ),
                )}
              </ul>
            </div>
          )}

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(
                {
                  errorId: error.errorId,
                  code: error.code,
                  category: error.category,
                  severity: error.severity,
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AGRICULTURAL ERROR BOUNDARY (Divine Pattern)
// ============================================================================

export interface AgriculturalErrorBoundaryProps extends Omit<
  ErrorBoundaryProps,
  "fallback"
> {
  /** Season context */
  season?: string;
  /** Farm ID context */
  farmId?: string;
  /** Custom agricultural fallback */
  fallback?: ReactNode | ((error: AppError, reset: () => void) => ReactNode);
}

/**
 * Error boundary with agricultural consciousness
 */
export class AgriculturalErrorBoundary extends Component<
  AgriculturalErrorBoundaryProps,
  ErrorBoundaryState
> {
  private boundary: ErrorBoundary | null = null;

  render(): ReactNode {
    const { season, farmId, fallback, ...boundaryProps } = this.props;

    const agriculturalFallback =
      fallback ||
      ((error: AppError, reset: () => void) => (
        <AgriculturalErrorFallback
          error={error}
          onReset={reset}
          season={season}
          farmId={farmId}
        />
      ));

    return (
      <ErrorBoundary
        ref={(ref) => {
          this.boundary = ref;
        }}
        {...boundaryProps}
        fallback={agriculturalFallback}
        onError={(error, errorInfo) => {
          // Log with agricultural context
          logError(error, {
            agricultural: {
              season,
              farmId,
              consciousness: "DIVINE",
            },
            errorInfo: {
              componentStack: errorInfo.componentStack,
            },
          });

          // Call parent onError if provided
          if (this.props.onError) {
            this.props.onError(error, errorInfo);
          }
        }}
      />
    );
  }
}

interface AgriculturalErrorFallbackProps {
  error: AppError;
  onReset: () => void;
  season?: string;
  farmId?: string;
}

function AgriculturalErrorFallback({
  error,
  onReset,
  season,
}: AgriculturalErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <span className="text-4xl">🌾</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Agricultural System Notice
          </h2>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 font-medium mb-2">
            {error.userDetails.title}
          </p>
          <p className="text-gray-600 text-sm">{error.userDetails.message}</p>
        </div>

        {season && (
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-800">
              <span className="font-medium">Current Season:</span> {season}
            </p>
          </div>
        )}

        {error.category === ErrorCategory.SEASONAL && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ This operation may be affected by seasonal restrictions
            </p>
          </div>
        )}

        {error.userDetails.suggestions &&
          error.userDetails.suggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                🌱 Suggested Actions:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {error.userDetails.suggestions.map(
                  (suggestion: any, index: any) => (
                    <li key={index}>{suggestion}</li>
                  ),
                )}
              </ul>
            </div>
          )}

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            🔄 Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/farms")}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            🏠 Browse Farms
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ROUTE ERROR BOUNDARY
// ============================================================================

export interface RouteErrorBoundaryProps extends ErrorBoundaryProps {
  /** Route path */
  route?: string;
  /** Show route breadcrumb */
  showBreadcrumb?: boolean;
}

/**
 * Error boundary for route-level errors
 */
export function RouteErrorBoundary({
  route,
  showBreadcrumb = true,
  ...props
}: RouteErrorBoundaryProps) {
  return (
    <ErrorBoundary
      {...props}
      name={`RouteErrorBoundary:${route || "unknown"}`}
      fallback={(error, reset) => (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-2xl w-full">
            {showBreadcrumb && route && (
              <div className="mb-4 text-sm text-gray-500">
                <span>Home</span>
                {route
                  .split("/")
                  .filter(Boolean)
                  .map((segment: any, index: any) => (
                    <span key={index}>
                      {" / "}
                      <span className="capitalize">{segment}</span>
                    </span>
                  ))}
              </div>
            )}
            <DefaultErrorFallback error={error} onReset={reset} />
          </div>
        </div>
      )}
    />
  );
}

// ============================================================================
// ASYNC BOUNDARY
// ============================================================================

export interface AsyncBoundaryProps extends ErrorBoundaryProps {
  /** Loading fallback */
  loading?: ReactNode;
  /** Suspense fallback */
  suspenseFallback?: ReactNode;
}

/**
 * Error boundary with Suspense support for async components
 */
export function AsyncBoundary({
  loading,
  suspenseFallback,
  children,
  ...props
}: AsyncBoundaryProps) {
  const fallback = suspenseFallback || loading || (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <ErrorBoundary {...props}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { AppError, ErrorCategory, ErrorSeverity, RecoveryStrategy };
