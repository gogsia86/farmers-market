/**
 * 🚀 Lazy Loading Wrapper - Vercel Analytics
 * Farmers Market Platform - Performance Optimization
 *
 * Phase 6 Optimization #1: Analytics Lazy Loading
 * Expected Savings: 25-30 KB
 *
 * This wrapper ensures analytics code is only loaded when actually needed,
 * not on initial page load. Perfect for non-critical tracking code.
 *
 * @module lib/lazy/analytics.lazy
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

import { logger } from '@/lib/monitoring/logger';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface AnalyticsOptions {
  debug?: boolean;
  enabled?: boolean;
}

// ============================================================================
// LAZY ANALYTICS LOADER
// ============================================================================

let analyticsPromise: Promise<typeof import("@vercel/analytics")> | null = null;

/**
 * Lazy load the Vercel Analytics module
 * Only imports the module on first use
 */
async function loadAnalytics() {
  if (!analyticsPromise) {
    analyticsPromise = import("@vercel/analytics");
  }
  return analyticsPromise;
}

// ============================================================================
// PUBLIC API - LAZY WRAPPED FUNCTIONS
// ============================================================================

/**
 * Track a custom analytics event
 * Analytics code is loaded on first call
 *
 * @example
 * ```typescript
 * await trackEvent('product_view', { productId: '123' });
 * ```
 */
export async function trackEvent(
  name: string,
  properties?: Record<string, any>,
): Promise<void> {
  if (typeof window === "undefined") {
    // Skip on server-side
    return;
  }

  try {
    const { track } = await loadAnalytics();
    track(name, properties);
  } catch (error) {
    logger.error("Failed to track analytics event:", error);
  }
}

/**
 * Track a page view
 * Analytics code is loaded on first call
 *
 * @example
 * ```typescript
 * await trackPageView('/products');
 * ```
 */
export async function trackPageView(path?: string): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Page views are automatically tracked by Vercel Analytics
    // This is a helper for manual tracking if needed
    const currentPath = path || window.location.pathname;
    await trackEvent("page_view", { path: currentPath });
  } catch (error) {
    logger.error("Failed to track page view:", error);
  }
}

/**
 * Track user interaction
 *
 * @example
 * ```typescript
 * await trackInteraction('button_click', { buttonId: 'checkout' });
 * ```
 */
export async function trackInteraction(
  action: string,
  data?: Record<string, any>,
): Promise<void> {
  return trackEvent(`interaction:${action}`, data);
}

/**
 * Track conversion event
 *
 * @example
 * ```typescript
 * await trackConversion('purchase', { value: 99.99, currency: 'USD' });
 * ```
 */
export async function trackConversion(
  type: string,
  data?: Record<string, any>,
): Promise<void> {
  return trackEvent(`conversion:${type}`, data);
}

/**
 * Track error event
 *
 * @example
 * ```typescript
 * await trackError('api_error', { endpoint: '/api/products' });
 * ```
 */
export async function trackError(
  error: string,
  context?: Record<string, any>,
): Promise<void> {
  return trackEvent(`error:${error}`, context);
}

// ============================================================================
// AGRICULTURAL TRACKING HELPERS
// ============================================================================

/**
 * Track farm-related events
 */
export async function trackFarmEvent(
  action: string,
  farmData?: Record<string, any>,
): Promise<void> {
  return trackEvent(`farm:${action}`, farmData);
}

/**
 * Track product-related events
 */
export async function trackProductEvent(
  action: string,
  productData?: Record<string, any>,
): Promise<void> {
  return trackEvent(`product:${action}`, productData);
}

/**
 * Track order-related events
 */
export async function trackOrderEvent(
  action: string,
  orderData?: Record<string, any>,
): Promise<void> {
  return trackEvent(`order:${action}`, orderData);
}

// ============================================================================
// BATCH TRACKING (Advanced)
// ============================================================================

const eventQueue: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

/**
 * Queue an event to be sent in batch
 * Useful for high-frequency events
 */
export function queueEvent(
  name: string,
  properties?: Record<string, any>,
): void {
  eventQueue.push({
    name,
    properties,
    timestamp: new Date(),
  });

  // Auto-flush after 5 seconds or 10 events
  if (eventQueue.length >= 10) {
    flushEvents();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushEvents, 5000);
  }
}

/**
 * Flush all queued events
 */
export async function flushEvents(): Promise<void> {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (eventQueue.length === 0) {
    return;
  }

  const events = [...eventQueue];
  eventQueue.length = 0;

  // Send all events
  await Promise.all(
    events.map((event) => trackEvent(event.name, event.properties)),
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if analytics is available
 * (without loading the module)
 */
export function isAnalyticsEnabled(): boolean {
  return (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    !!process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID
  );
}

/**
 * Preload analytics module
 * Call this during idle time to warm up the module
 */
export function preloadAnalytics(): void {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      loadAnalytics().catch(() => {
        // Ignore preload errors
      });
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  trackEvent,
  trackPageView,
  trackInteraction,
  trackConversion,
  trackError,
  trackFarmEvent,
  trackProductEvent,
  trackOrderEvent,
  queueEvent,
  flushEvents,
  isAnalyticsEnabled,
  preloadAnalytics,
};
