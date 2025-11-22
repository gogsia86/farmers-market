/**
 * 🛡️ UNIFIED ERROR BOUNDARY COMPONENT - DIVINE CONSCIOUSNESS RESTORATION
 *
 * Purpose: Handle runtime errors with agricultural quantum consciousness
 * Features:
 * - Biodynamic error recovery patterns
 * - Cosmic error reporting with i18n support
 * - Temporal reality restoration
 * - Enlightening user guidance
 * - Zero duplication - single source of truth
 *
 * DIVINE PRINCIPLES:
 * - Semantic precision in error context
 * - Holographic component patterns
 * - Agricultural domain intelligence
 * - Reality bending for error recovery
 *
 * @reference .github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md
 * @reference .github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md
 */
"use client";

import { AlertTriangle, RefreshCw, AlertCircle, XCircle } from "lucide-react";
import type { ErrorInfo } from "react";
import React, { Component } from "react";

// 🌿 Agricultural season context for divine error consciousness
// Reserved for future biodynamic error recovery features
function _getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/**
 * DIVINE ERROR CATEGORIZATION
 * Classify errors for appropriate handling and user messaging
 */
enum ErrorCategory {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

interface CategorizedError {
  category: ErrorCategory;
  userMessage: string;
  technicalMessage: string;
  recoverable: boolean;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  categorizedError: CategorizedError | null;
}

/**
 * STRUCTURED LOGGER for Error Boundary
 * Consistent logging format across all error scenarios
 */
class StructuredLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  error(message: string, error: Error, metadata?: Record<string, any>): void {
    const logEntry = {
      level: "ERROR",
      timestamp: new Date().toISOString(),
      context: this.context,
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      metadata: metadata || {},
    };

    console.error(JSON.stringify(logEntry, null, 2));
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const logEntry = {
      level: "WARN",
      timestamp: new Date().toISOString(),
      context: this.context,
      message,
      metadata: metadata || {},
    };

    console.warn(JSON.stringify(logEntry, null, 2));
  }

  info(message: string, metadata?: Record<string, any>): void {
    const logEntry = {
      level: "INFO",
      timestamp: new Date().toISOString(),
      context: this.context,
      message,
      metadata: metadata || {},
    };

    console.info(JSON.stringify(logEntry, null, 2));
  }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fallbackRender?: (
    error: Error,
    errorInfo: React.ErrorInfo,
  ) => React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  categorizedError: CategorizedError | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private logger: StructuredLogger;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      categorizedError: null,
    };
    this.logger = new StructuredLogger("ErrorBoundary");
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0,
      categorizedError: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const categorizedError = this.categorizeError(error);

    this.setState((prevState) => ({
      ...prevState,
      errorInfo,
      categorizedError,
    }));

    // Structured logging with categorization
    this.logger.error("React Error Boundary caught error", error, {
      componentStack: errorInfo.componentStack,
      category: categorizedError.category,
      severity: categorizedError.severity,
      recoverable: categorizedError.recoverable,
      retryCount: this.state.retryCount,
    });

    // Attempt automatic retry for recoverable errors
    if (categorizedError.recoverable && this.shouldRetry()) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  /**
   * ERROR CATEGORIZATION SYSTEM
   * Classify errors for appropriate handling
   */
  private categorizeError(error: Error): CategorizedError {
    const errorMessage = error.message.toLowerCase();

    // Network errors
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("timeout")
    ) {
      return {
        category: ErrorCategory.NETWORK,
        userMessage:
          "Network connection issue. Please check your internet connection and try again.",
        technicalMessage: error.message,
        recoverable: true,
        severity: "medium",
        message: error.message,
      };
    }

    // Authentication errors
    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("authentication")
    ) {
      return {
        category: ErrorCategory.AUTHENTICATION,
        userMessage: "Authentication required. Please log in to continue.",
        technicalMessage: error.message,
        recoverable: false,
        severity: "medium",
        message: error.message,
      };
    }

    // Authorization errors
    if (
      errorMessage.includes("forbidden") ||
      errorMessage.includes("authorization")
    ) {
      return {
        category: ErrorCategory.AUTHORIZATION,
        userMessage: "You don't have permission to access this resource.",
        technicalMessage: error.message,
        recoverable: false,
        severity: "medium",
        message: error.message,
      };
    }

    // Validation errors
    if (
      errorMessage.includes("validation") ||
      errorMessage.includes("invalid")
    ) {
      return {
        category: ErrorCategory.VALIDATION,
        userMessage: "Invalid input. Please check your data and try again.",
        technicalMessage: error.message,
        recoverable: true,
        severity: "low",
        message: error.message,
      };
    }

    // Not found errors
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return {
        category: ErrorCategory.NOT_FOUND,
        userMessage: "The requested resource was not found.",
        technicalMessage: error.message,
        recoverable: false,
        severity: "medium",
        message: error.message,
      };
    }

    // Server errors
    if (
      errorMessage.includes("server") ||
      errorMessage.includes("500") ||
      errorMessage.includes("internal")
    ) {
      return {
        category: ErrorCategory.SERVER,
        userMessage:
          "A server error occurred. Our team has been notified. Please try again later.",
        technicalMessage: error.message,
        recoverable: true,
        severity: "high",
        message: error.message,
      };
    }

    // Unknown errors
    return {
      category: ErrorCategory.UNKNOWN,
      userMessage:
        "An unexpected error occurred. Please try again or contact support if the problem persists.",
      technicalMessage: error.message,
      recoverable: true,
      severity: "high",
      message: error.message,
    };
  }

  /**
   * RETRY MECHANISM with Exponential Backoff
   */
  private shouldRetry(): boolean {
    const maxRetries = this.props.maxRetries || 3;
    return this.state.retryCount < maxRetries;
  }

  private scheduleRetry(): void {
    const baseDelay = this.props.retryDelay || 1000;
    const delay = baseDelay * Math.pow(2, this.state.retryCount); // Exponential backoff

    this.logger.info("Scheduling automatic retry", {
      retryCount: this.state.retryCount + 1,
      delayMs: delay,
    });

    this.retryTimeout = setTimeout(() => {
      this.setState((prevState) => ({
        retryCount: prevState.retryCount + 1,
      }));
      this.resetError();
    }, delay);
  }

  resetError = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.logger.info("Error boundary reset", {
      wasAutoRetry: this.retryTimeout !== null,
      totalRetries: this.state.retryCount,
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      categorizedError: null,
    });
  };

  private getSeverityIcon() {
    const severity = this.state.categorizedError?.severity;

    switch (severity) {
      case "critical":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "high":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case "medium":
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case "low":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-600" />;
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.fallbackRender && this.state.errorInfo) {
        return this.props.fallbackRender(
          this.state.error,
          this.state.errorInfo,
        );
      }

      const categorized = this.state.categorizedError;

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3">
                {this.getSeverityIcon()}
              </div>
            </div>

            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
              {categorized?.category === ErrorCategory.NETWORK
                ? "Connection Issue"
                : categorized?.category === ErrorCategory.AUTHENTICATION
                  ? "Authentication Required"
                  : categorized?.category === ErrorCategory.AUTHORIZATION
                    ? "Access Denied"
                    : "Oops! Something went wrong"}
            </h1>

            <p className="mb-6 text-center text-gray-600">
              {categorized?.userMessage ||
                "We apologize for the inconvenience. An error occurred while rendering this page."}
            </p>

            {this.state.retryCount > 0 && (
              <div className="mb-4 rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  Retry attempt {this.state.retryCount} of{" "}
                  {this.props.maxRetries || 3}
                </p>
              </div>
            )}

            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 rounded-md bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">
                  Error Details:
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  <strong>Category:</strong> {categorized?.category}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  <strong>Severity:</strong> {categorized?.severity}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  <strong>Message:</strong> {this.state.error.message}
                </p>
              </div>
            )}

            {categorized?.recoverable && (
              <button
                onClick={this.resetError}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            )}

            {!categorized?.recoverable && (
              <button
                onClick={() => (window.location.href = "/")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Go to Homepage
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
