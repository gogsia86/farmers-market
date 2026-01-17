/**
 * SENTRY UTILITIES
 * Comprehensive error tracking and monitoring utilities for the Farmers Market Platform
 *
 * Features:
 * - Type-safe error tracking
 * - User context management
 * - Custom error boundaries
 * - Performance monitoring
 * - Agricultural-specific error contexts
 *
 * @module lib/monitoring/sentry-utils
 */

import type { User as PrismaUser } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ErrorContext {
  userId?: string;
  farmId?: string;
  orderId?: string;
  productId?: string;
  action?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count";
  tags?: Record<string, string>;
}

export interface AgriculturalContext {
  farmType?: string;
  cropCategory?: string;
  season?: string;
  region?: string;
  certifications?: string[];
}

// ============================================
// USER CONTEXT
// ============================================

/**
 * Set user context in Sentry for error tracking
 * Automatically sanitizes sensitive information
 */
export function setUserContext(user: Partial<PrismaUser> | null): void {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  // Only send non-sensitive user data
  Sentry.setUser({
    id: user.id,
    username: user.name || undefined,
    // DO NOT send email, phone, or other PII
    segment: user.role || "customer",
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

// ============================================
// ERROR TRACKING
// ============================================

/**
 * Track a caught error with context
 * Use this for expected errors that you want to monitor
 */
export function trackError(
  error: Error,
  context?: ErrorContext,
  level: "error" | "warning" | "fatal" = "error"
): void {
  Sentry.withScope((scope) => {
    // Set severity level
    scope.setLevel(level);

    // Add tags for filtering
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Add user IDs for tracking
    if (context?.userId) {
      scope.setTag("user_id", context.userId);
    }
    if (context?.farmId) {
      scope.setTag("farm_id", context.farmId);
    }
    if (context?.orderId) {
      scope.setTag("order_id", context.orderId);
    }
    if (context?.productId) {
      scope.setTag("product_id", context.productId);
    }
    if (context?.action) {
      scope.setTag("action", context.action);
    }

    // Add extra context data
    if (context?.extra) {
      scope.setContext("additional_context", context.extra);
    }

    // Capture the error
    Sentry.captureException(error);
  });
}

/**
 * Track a custom message (not an error object)
 * Use for logging important events or warnings
 */
export function trackMessage(
  message: string,
  context?: ErrorContext,
  level: "info" | "warning" | "error" = "info"
): void {
  Sentry.withScope((scope) => {
    scope.setLevel(level);

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      scope.setContext("additional_context", context.extra);
    }

    Sentry.captureMessage(message);
  });
}

/**
 * Track API errors with request context
 */
export function trackApiError(
  error: Error,
  request: {
    method: string;
    url: string;
    statusCode?: number;
    userId?: string;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setLevel("error");

    // Add HTTP context
    scope.setTag("http.method", request.method);
    scope.setTag("http.url", request.url);
    if (request.statusCode) {
      scope.setTag("http.status_code", request.statusCode.toString());
    }
    if (request.userId) {
      scope.setTag("user_id", request.userId);
    }

    scope.setContext("http_request", {
      method: request.method,
      url: request.url,
      status_code: request.statusCode,
    });

    Sentry.captureException(error);
  });
}

/**
 * Track database errors with query context
 */
export function trackDatabaseError(
  error: Error,
  context: {
    operation: string;
    model?: string;
    query?: string;
    duration?: number;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setLevel("error");

    scope.setTag("db.operation", context.operation);
    if (context.model) {
      scope.setTag("db.model", context.model);
    }

    scope.setContext("database", {
      operation: context.operation,
      model: context.model,
      duration_ms: context.duration,
      // Don't include full query to avoid exposing sensitive data
    });

    Sentry.captureException(error);
  });
}

// ============================================
// AGRICULTURAL-SPECIFIC TRACKING
// ============================================

/**
 * Track agricultural operations with domain-specific context
 */
export function trackAgriculturalOperation(
  operation: string,
  context: AgriculturalContext & {
    success: boolean;
    error?: Error;
    duration?: number;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setLevel(context.success ? "info" : "error");

    // Tag with agricultural context
    scope.setTag("operation", operation);
    scope.setTag("success", context.success.toString());
    if (context.farmType) {
      scope.setTag("farm_type", context.farmType);
    }
    if (context.cropCategory) {
      scope.setTag("crop_category", context.cropCategory);
    }
    if (context.season) {
      scope.setTag("season", context.season);
    }
    if (context.region) {
      scope.setTag("region", context.region);
    }

    // Add detailed context
    scope.setContext("agricultural_operation", {
      operation,
      farm_type: context.farmType,
      crop_category: context.cropCategory,
      season: context.season,
      region: context.region,
      certifications: context.certifications,
      duration_ms: context.duration,
    });

    // Capture based on success/failure
    if (context.error) {
      Sentry.captureException(context.error);
    } else {
      Sentry.captureMessage(`Agricultural operation: ${operation}`);
    }
  });
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

/**
 * Start a performance transaction
 * Returns a function to end the transaction
 */
export function startTransaction(
  name: string,
  op: string,
  tags?: Record<string, string>
): () => void {
  const transaction = Sentry.startTransaction({
    name,
    op,
    tags,
  });

  Sentry.getCurrentHub().configureScope((scope) => {
    scope.setSpan(transaction);
  });

  return () => {
    transaction.finish();
  };
}

/**
 * Track a custom performance metric
 */
export function trackPerformanceMetric(metric: PerformanceMetrics): void {
  Sentry.withScope((scope) => {
    if (metric.tags) {
      Object.entries(metric.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    scope.setContext("performance_metric", {
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
    });

    Sentry.captureMessage(`Performance: ${metric.name}`, "info");
  });
}

/**
 * Track page load performance
 */
export function trackPageLoad(
  page: string,
  metrics: {
    ttfb?: number; // Time to first byte
    fcp?: number; // First contentful paint
    lcp?: number; // Largest contentful paint
    cls?: number; // Cumulative layout shift
    fid?: number; // First input delay
  }
): void {
  Sentry.withScope((scope) => {
    scope.setTag("page", page);
    scope.setContext("web_vitals", metrics);

    // Capture as message if metrics are poor
    const hasIssues =
      (metrics.lcp && metrics.lcp > 2500) ||
      (metrics.fid && metrics.fid > 100) ||
      (metrics.cls && metrics.cls > 0.1);

    if (hasIssues) {
      Sentry.captureMessage(`Poor page performance: ${page}`, "warning");
    }
  });
}

// ============================================
// BREADCRUMBS
// ============================================

/**
 * Add a custom breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  category: string = "user-action",
  level: "info" | "warning" | "error" = "info"
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Add a navigation breadcrumb
 */
export function addNavigationBreadcrumb(from: string, to: string): void {
  Sentry.addBreadcrumb({
    message: "Navigation",
    category: "navigation",
    level: "info",
    data: {
      from,
      to,
    },
    timestamp: Date.now() / 1000,
  });
}

// ============================================
// CONTEXT HELPERS
// ============================================

/**
 * Set custom context for the current scope
 */
export function setCustomContext(
  key: string,
  value: Record<string, unknown>
): void {
  Sentry.setContext(key, value);
}

/**
 * Set tags for the current scope
 */
export function setTags(tags: Record<string, string>): void {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

// ============================================
// ERROR BOUNDARY HELPERS
// ============================================

/**
 * Capture an error from React Error Boundary
 */
export function captureErrorBoundaryError(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  Sentry.withScope((scope) => {
    scope.setContext("react_error_boundary", {
      component_stack: errorInfo.componentStack,
    });

    Sentry.captureException(error);
  });
}

// ============================================
// TESTING & DEBUGGING
// ============================================

/**
 * Test Sentry integration by sending a test error
 * Only use in development!
 */
export function sendTestError(): void {
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ sendTestError() should not be called in production!");
    return;
  }

  try {
    throw new Error("🌾 Test error from Farmers Market Platform");
  } catch (error) {
    trackError(error as Error, {
      tags: {
        test: "true",
        environment: "development",
      },
      extra: {
        message: "This is a test error to verify Sentry integration",
      },
    });
  }
}

/**
 * Check if Sentry is properly configured
 */
export function isSentryConfigured(): boolean {
  const client = Sentry.getCurrentHub().getClient();
  return !!client && !!client.getDsn();
}

/**
 * Get Sentry configuration status
 */
export function getSentryStatus(): {
  configured: boolean;
  environment: string;
  dsn?: string;
} {
  const client = Sentry.getCurrentHub().getClient();
  const dsn = client?.getDsn();

  return {
    configured: !!dsn,
    environment: process.env.NODE_ENV || "unknown",
    dsn: dsn ? dsn.toString().replace(/\/\/.*@/, "//[REDACTED]@") : undefined,
  };
}

// ============================================
// ASYNC ERROR HANDLING
// ============================================

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      trackError(error as Error, context);
      throw error;
    }
  }) as T;
}

/**
 * Wrap a sync function with error tracking
 */
export function withSyncErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  context?: ErrorContext
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      trackError(error as Error, context);
      throw error;
    }
  }) as T;
}

// ============================================
// RATE LIMITING & SAMPLING
// ============================================

/**
 * Sample errors to avoid overwhelming Sentry
 * Returns true if error should be tracked
 */
export function shouldSampleError(
  errorType: string,
  sampleRate: number = 1.0
): boolean {
  if (sampleRate >= 1.0) {
    return true;
  }

  if (sampleRate <= 0) {
    return false;
  }

  // Use consistent sampling based on error type
  const hash = errorType
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const normalized = (hash % 100) / 100;

  return normalized < sampleRate;
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  // User context
  setUserContext,
  clearUserContext,

  // Error tracking
  trackError,
  trackMessage,
  trackApiError,
  trackDatabaseError,
  trackAgriculturalOperation,

  // Performance monitoring
  startTransaction,
  trackPerformanceMetric,
  trackPageLoad,

  // Breadcrumbs
  addBreadcrumb,
  addNavigationBreadcrumb,

  // Context
  setCustomContext,
  setTags,

  // Error boundary
  captureErrorBoundaryError,

  // Testing
  sendTestError,
  isSentryConfigured,
  getSentryStatus,

  // Wrappers
  withErrorTracking,
  withSyncErrorTracking,

  // Sampling
  shouldSampleError,
};
