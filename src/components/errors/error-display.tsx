/**
 * 🌟 Error Display Components - Divine Agricultural Error UI
 *
 * Comprehensive error display components for various error states,
 * with agricultural consciousness and recovery actions.
 *
 * @module components/errors/error-display
 */

"use client";

import type { AppError, RecoveryAction } from "@/lib/errors/types";
import { ErrorCategory, ErrorSeverity } from "@/lib/errors/types";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle, Info, RefreshCw, X } from "lucide-react";
import { useState } from "react";

// ============================================================================
// ERROR ALERT COMPONENT
// ============================================================================

const errorAlertVariants = cva(
  "rounded-lg border p-4 transition-all duration-200",
  {
    variants: {
      severity: {
        INFO: "bg-blue-50 border-blue-200 text-blue-900",
        WARNING: "bg-yellow-50 border-yellow-200 text-yellow-900",
        ERROR: "bg-red-50 border-red-200 text-red-900",
        CRITICAL: "bg-red-100 border-red-300 text-red-950",
        FATAL: "bg-red-200 border-red-400 text-red-950",
      },
      size: {
        sm: "text-sm p-3",
        md: "text-base p-4",
        lg: "text-lg p-6",
      },
    },
    defaultVariants: {
      severity: "ERROR",
      size: "md",
    },
  }
);

export interface ErrorAlertProps extends VariantProps<typeof errorAlertVariants> {
  error: AppError;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  showIcon?: boolean;
  dismissible?: boolean;
}

/**
 * Error alert component
 */
export function ErrorAlert({
  error,
  severity,
  size,
  onDismiss,
  onRetry,
  className,
  showIcon = true,
  dismissible = true,
}: ErrorAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const Icon = getErrorIcon(error.severity);

  return (
    <div
      className={cn(
        errorAlertVariants({ severity: severity || error.severity, size }),
        className
      )}
      role="alert"
    >
      <div className="flex gap-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1">{error.userDetails.title}</h3>
          <p className="text-sm opacity-90">{error.userDetails.message}</p>

          {error.userDetails.suggestions && error.userDetails.suggestions.length > 0 && (
            <ul className="mt-2 text-sm space-y-1 opacity-80">
              {error.userDetails.suggestions.map((suggestion: any, index: any) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}

          {(onRetry || error.retryable) && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ERROR CARD COMPONENT
// ============================================================================

export interface ErrorCardProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
  actions?: RecoveryAction[];
}

/**
 * Error card component with detailed information
 */
export function ErrorCard({
  error,
  onRetry,
  onDismiss,
  className,
  showDetails = false,
  actions = [],
}: ErrorCardProps) {
  const Icon = getErrorIcon(error.severity);
  const allActions = [
    ...actions,
    ...(error.userDetails.actions || []),
  ];

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-lg border-2 p-6",
        getSeverityBorderColor(error.severity),
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex-shrink-0 p-3 rounded-full",
            getSeverityBackgroundColor(error.severity)
          )}
        >
          <Icon className={cn("h-6 w-6", getSeverityTextColor(error.severity))} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error.userDetails.title}
          </h2>
          <p className="text-gray-600 mb-4">{error.userDetails.message}</p>

          {error.userDetails.suggestions && error.userDetails.suggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                What you can do:
              </p>
              <ul className="space-y-2">
                {error.userDetails.suggestions.map((suggestion: any, index: any) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {allActions.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {allActions.map((action: any, index: any) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={cn(
                    "px-4 py-2 rounded-md font-medium transition-colors",
                    action.type === "primary" &&
                    "bg-blue-600 text-white hover:bg-blue-700",
                    action.type === "secondary" &&
                    "bg-gray-200 text-gray-700 hover:bg-gray-300",
                    action.type === "tertiary" &&
                    "text-blue-600 hover:text-blue-700 hover:underline"
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {onRetry && error.retryable && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}

          {showDetails && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium text-gray-700">Error ID:</dt>
                    <dd className="text-gray-600 font-mono text-xs">{error.errorId}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700">Error Code:</dt>
                    <dd className="text-gray-600 font-mono text-xs">{error.code}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700">Category:</dt>
                    <dd className="text-gray-600">{error.category}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700">Timestamp:</dt>
                    <dd className="text-gray-600">
                      {new Date(error.timestamp).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </details>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// INLINE ERROR COMPONENT
// ============================================================================

export interface InlineErrorProps {
  message: string;
  className?: string;
  icon?: boolean;
}

/**
 * Inline error message for form fields
 */
export function InlineError({ message, className, icon = true }: InlineErrorProps) {
  return (
    <div className={cn("flex items-start gap-2 text-sm text-red-600 mt-1", className)}>
      {icon && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

// ============================================================================
// ERROR PAGE COMPONENT
// ============================================================================

export interface ErrorPageProps {
  error: AppError;
  onRetry?: () => void;
  onHome?: () => void;
  showSupport?: boolean;
}

/**
 * Full-page error display
 */
export function ErrorPage({
  error,
  onRetry,
  onHome,
  showSupport = true,
}: ErrorPageProps) {
  const Icon = getErrorIcon(error.severity);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "p-4 rounded-full mb-6",
                getSeverityBackgroundColor(error.severity)
              )}
            >
              <Icon className={cn("h-12 w-12", getSeverityTextColor(error.severity))} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error.userDetails.title}
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              {error.userDetails.message}
            </p>

            {error.userDetails.suggestions && error.userDetails.suggestions.length > 0 && (
              <div className="w-full max-w-md mb-8 text-left">
                <p className="font-medium text-gray-700 mb-3">What you can try:</p>
                <ul className="space-y-3">
                  {error.userDetails.suggestions.map((suggestion: any, index: any) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-600 pt-0.5">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              {onRetry && error.retryable && (
                <button
                  onClick={onRetry}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </button>
              )}

              {onHome && (
                <button
                  onClick={onHome}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Go to Homepage
                </button>
              )}

              {showSupport && error.userDetails.helpLink && (
                <a
                  href={error.userDetails.helpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
                >
                  Get Help
                </a>
              )}
            </div>

            <div className="mt-8 text-sm text-gray-500">
              Error ID: <span className="font-mono">{error.errorId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AGRICULTURAL ERROR DISPLAY (Divine Pattern)
// ============================================================================

export interface AgriculturalErrorDisplayProps {
  error: AppError;
  season?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error display with agricultural consciousness
 */
export function AgriculturalErrorDisplay({
  error,
  season,
  onRetry,
  className,
}: AgriculturalErrorDisplayProps) {
  const isSeasonalError = error.category === ErrorCategory.SEASONAL;
  const isBiodynamicError = error.category === ErrorCategory.BIODYNAMIC;
  const isAgriculturalError = error.category === ErrorCategory.AGRICULTURAL;

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200 p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-4xl">
          {isSeasonalError ? "🌱" : isBiodynamicError ? "🌾" : "🚜"}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error.userDetails.title}
          </h3>
          <p className="text-gray-700 mb-4">{error.userDetails.message}</p>

          {season && (
            <div className="mb-4 p-3 bg-white rounded-md border border-green-200">
              <p className="text-sm">
                <span className="font-medium text-green-800">Current Season:</span>{" "}
                <span className="text-gray-700">{season}</span>
              </p>
            </div>
          )}

          {(isSeasonalError || isBiodynamicError || isAgriculturalError) && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">🌾 Agricultural Notice:</span>{" "}
                {isSeasonalError &&
                  "This operation is subject to seasonal availability"}
                {isBiodynamicError &&
                  "This action follows biodynamic farming principles"}
                {isAgriculturalError &&
                  "Agricultural guidelines apply to this operation"}
              </p>
            </div>
          )}

          {error.userDetails.suggestions && error.userDetails.suggestions.length > 0 && (
            <ul className="space-y-2 mb-4">
              {error.userDetails.suggestions.map((suggestion: any, index: any) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}

          {onRetry && error.retryable && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getErrorIcon(severity: ErrorSeverity) {
  switch (severity) {
    case ErrorSeverity.FATAL:
    case ErrorSeverity.CRITICAL:
      return AlertCircle;
    case ErrorSeverity.ERROR:
      return AlertTriangle;
    case ErrorSeverity.WARNING:
      return AlertTriangle;
    case ErrorSeverity.INFO:
      return Info;
    default:
      return AlertCircle;
  }
}

function getSeverityBorderColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.FATAL:
    case ErrorSeverity.CRITICAL:
      return "border-red-400";
    case ErrorSeverity.ERROR:
      return "border-red-300";
    case ErrorSeverity.WARNING:
      return "border-yellow-300";
    case ErrorSeverity.INFO:
      return "border-blue-300";
    default:
      return "border-gray-300";
  }
}

function getSeverityBackgroundColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.FATAL:
    case ErrorSeverity.CRITICAL:
      return "bg-red-100";
    case ErrorSeverity.ERROR:
      return "bg-red-50";
    case ErrorSeverity.WARNING:
      return "bg-yellow-50";
    case ErrorSeverity.INFO:
      return "bg-blue-50";
    default:
      return "bg-gray-50";
  }
}

function getSeverityTextColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.FATAL:
    case ErrorSeverity.CRITICAL:
      return "text-red-700";
    case ErrorSeverity.ERROR:
      return "text-red-600";
    case ErrorSeverity.WARNING:
      return "text-yellow-600";
    case ErrorSeverity.INFO:
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
}
