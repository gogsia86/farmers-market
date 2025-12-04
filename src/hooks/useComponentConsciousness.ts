/**
 * 🧠 DIVINE PATTERN: Component Consciousness Tracking
 * 📚 Reference: 01_DIVINE_CORE_PRINCIPLES.instructions.md
 * 🌾 Domain: Agricultural Component Monitoring
 * ⚡ Performance: Quantum Performance Measurement
 */

import { useCallback, useEffect, useRef } from "react";

export interface ComponentContext {
  componentName: string;
  variant?: string;
  size?: string;
  [key: string]: unknown;
}

export interface PerformanceMeasurement {
  operationName: string;
  startTime: number;
  success: () => void;
  failure: (error: Error | unknown) => void;
}

export interface MeasurementRecord {
  name: string;
  duration: number;
  success: boolean;
  timestamp: Date;
  error?: Error;
}

export interface ComponentConsciousness {
  startMeasurement: (operationName: string) => PerformanceMeasurement;
  trackEvent: (eventName: string, metadata?: Record<string, unknown>) => void;
  trackInteraction: (
    eventName: string,
    metadata?: Record<string, unknown>,
  ) => void;
  captureError: (errorName: string, error: unknown) => void;
  getMetrics: () => ComponentMetrics;
}

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  errorCount: number;
  eventCount: number;
}

/**
 * Divine Performance Tracker Interface
 * Global window interface for performance monitoring
 */
export interface DivinePerformanceMetric {
  component: string;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface DivinePerformanceTracker {
  recordMetric: (metric: DivinePerformanceMetric) => void;
  getMetrics: () => DivinePerformanceMetric[];
  getComponentMetrics: (componentName: string) => DivinePerformanceMetric[];
  clearMetrics: () => void;
}

/**
 * Divine Analytics Tracker Interface
 * Global window interface for analytics tracking
 */
export interface DivineAnalyticsEvent {
  component: string;
  event: string;
  metadata?: Record<string, unknown>;
  context?: Record<string, unknown>;
  timestamp: number;
}

export interface DivineAnalyticsTracker {
  track: (event: DivineAnalyticsEvent) => void;
}

/**
 * Extended Window and Global Interface
 */
declare global {
  interface Window {
    __DIVINE_PERFORMANCE__?: DivinePerformanceTracker;
    __DIVINE_ANALYTICS__?: DivineAnalyticsTracker;
  }

  var __DIVINE_PERFORMANCE__: DivinePerformanceTracker | undefined;

  var __DIVINE_ANALYTICS__: DivineAnalyticsTracker | undefined;
}

/**
 * DIVINE HOOK: useComponentConsciousness
 *
 * Provides component-level consciousness tracking for performance,
 * errors, and user interactions. Follows agricultural quantum patterns.
 *
 * @example
 * ```tsx
 * const consciousness = useComponentConsciousness('FarmCard', { variant: 'agricultural' });
 *
 * const handleClick = async (e) => {
 *   const measurement = consciousness.startMeasurement('click');
 *   try {
 *     await onClick?.(e);
 *     measurement.success();
 *   } catch (error) {
 *     measurement.failure(error);
 *   }
 * };
 * ```
 */
export function useComponentConsciousness(
  componentName: string,
  context?: Record<string, unknown>,
): ComponentConsciousness {
  // Metrics storage
  const metricsRef = useRef<ComponentMetrics>({
    componentName,
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    errorCount: 0,
    eventCount: 0,
  });

  const renderTimesRef = useRef<number[]>([]);
  const renderStartRef = useRef<number>(0);

  // Track render start
  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  // Track render end
  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;

    metricsRef.current.renderCount += 1;
    metricsRef.current.lastRenderTime = renderTime;

    renderTimesRef.current.push(renderTime);

    // Keep only last 100 render times for average calculation
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current.shift();
    }

    // Calculate average render time
    metricsRef.current.averageRenderTime =
      renderTimesRef.current.reduce((sum, time) => sum + time, 0) /
      renderTimesRef.current.length;

    // Log slow renders (development only)
    if (process.env.NODE_ENV === "development" && renderTime > 16) {
      console.warn(
        `🐌 Slow render detected in ${componentName}:`,
        `${renderTime.toFixed(2)}ms`,
        context,
      );
    }
  });

  /**
   * Start performance measurement for an operation
   */
  const measurements = useRef(new Map<string, MeasurementRecord>());
  const errors = useRef<Error[]>([]);

  const startMeasurement = useCallback(
    (operationName: string) => {
      const startTime = performance.now();

      return {
        operationName,
        startTime,
        success: () => {
          const duration = performance.now() - startTime;

          // Store internally
          measurements.current.set(operationName, {
            name: operationName,
            duration,
            success: true,
            timestamp: new Date(),
          });

          // Record in global tracker if available
          if (globalThis.__DIVINE_PERFORMANCE__) {
            globalThis.__DIVINE_PERFORMANCE__.recordMetric({
              component: componentName,
              operation: operationName,
              duration,
              success: true,
              timestamp: Date.now(),
            });
          }
        },
        failure: (error: unknown) => {
          const duration = performance.now() - startTime;
          const err = error instanceof Error ? error : new Error(String(error));
          errors.current.push(err);

          // Increment error count
          metricsRef.current.errorCount += 1;

          const errorMessage = err.message;

          // Store internally
          measurements.current.set(operationName, {
            name: operationName,
            duration,
            success: false,
            timestamp: new Date(),
            error: err,
          });

          // Record in global tracker if available
          if (globalThis.__DIVINE_PERFORMANCE__) {
            globalThis.__DIVINE_PERFORMANCE__.recordMetric({
              component: componentName,
              operation: operationName,
              duration,
              success: false,
              error: errorMessage,
              timestamp: Date.now(),
            });
          }
        },
      };
    },
    [componentName],
  ); /**
   * Track custom events (clicks, interactions, etc.)
   */
  const trackEvent = useCallback(
    (eventName: string, metadata?: Record<string, unknown>) => {
      metricsRef.current.eventCount += 1;

      if (process.env.NODE_ENV === "development") {
        console.debug(`📊 ${componentName}.${eventName}`, metadata);
      }

      // Track in analytics (if available)
      if (typeof window !== "undefined" && window.__DIVINE_ANALYTICS__) {
        window.__DIVINE_ANALYTICS__.track({
          component: componentName,
          event: eventName,
          metadata,
          context,
          timestamp: Date.now(),
        });
      }
    },
    [componentName, context],
  );

  /**
   * Track user interactions (alias for trackEvent for consistency)
   */
  const trackInteraction = useCallback(
    (eventName: string, metadata?: Record<string, unknown>) => {
      trackEvent(eventName, metadata);
    },
    [trackEvent],
  );

  /**
   * Capture and report errors
   */
  const captureError = useCallback(
    (errorName: string, error: unknown) => {
      metricsRef.current.errorCount += 1;

      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = String(error);
      }

      console.error(`❌ ${componentName}.${errorName}:`, error);

      // Track error in monitoring (if available)
      if (globalThis.__DIVINE_PERFORMANCE__) {
        globalThis.__DIVINE_PERFORMANCE__.recordMetric({
          component: componentName,
          operation: errorName,
          duration: 0,
          success: false,
          error: errorMessage,
          timestamp: Date.now(),
        });
      }
    },
    [componentName],
  );

  /**
   * Get current component metrics
   */
  const getMetrics = useCallback((): ComponentMetrics => {
    return { ...metricsRef.current };
  }, []);

  return {
    startMeasurement,
    trackEvent,
    trackInteraction,
    captureError,
    getMetrics,
  };
}

/**
 * DIVINE UTILITY: Create global performance tracking system
 *
 * Initialize this in your root layout or _app.tsx to enable
 * global performance tracking across all components.
 */
export function initializeDivinePerformanceTracking() {
  if (globalThis.window === undefined) return;

  const metrics: DivinePerformanceMetric[] = [];

  globalThis.__DIVINE_PERFORMANCE__ = {
    recordMetric: (metric: DivinePerformanceMetric) => {
      metrics.push(metric);

      // Keep only last 1000 metrics
      if (metrics.length > 1000) {
        metrics.shift();
      }
    },
    getMetrics: () => metrics,
    getComponentMetrics: (componentName: string) =>
      metrics.filter((m) => m.component === componentName),
    clearMetrics: () => {
      metrics.length = 0;
    },
  };

  globalThis.__DIVINE_ANALYTICS__ = {
    track: (event: DivineAnalyticsEvent) => {
      // Integration point for analytics services
      console.debug("📊 Analytics event:", event);
    },
  };

  console.log("✨ Divine Performance Tracking initialized");
}
