/**
 * 📊 PERFORMANCE MONITORING SYSTEM
 * Real-time performance tracking with agricultural awareness
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface WebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

/**
 * Performance Tracker
 */
export class PerformanceTracker {
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 1000;

  /**
   * Track a performance metric
   */
  static track(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(metric);
    }
  }

  /**
   * Track operation duration
   */
  static async trackOperation<T>(
    name: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - start;

      this.track(name, duration, { ...tags, status: "success" });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.track(name, duration, { ...tags, status: "error" });

      throw error;
    }
  }

  /**
   * Track database query
   */
  static trackQuery(query: string, duration: number, rowCount?: number): void {
    this.track("db.query", duration, {
      query: query.substring(0, 100),
      rowCount: rowCount?.toString() || "0",
    });
  }

  /**
   * Track API call
   */
  static trackAPI(
    method: string,
    path: string,
    duration: number,
    statusCode: number
  ): void {
    this.track("api.request", duration, {
      method,
      path,
      statusCode: statusCode.toString(),
    });
  }

  /**
   * Track agricultural operation
   */
  static trackAgriculturalOperation(
    operation: string,
    farmId: string,
    duration: number
  ): void {
    this.track("agricultural.operation", duration, {
      operation,
      farmId,
    });
  }

  /**
   * Get metrics
   */
  static getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return [...this.metrics];
  }

  /**
   * Get metric statistics
   */
  static getStatistics(name: string): {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    count: number;
  } | null {
    const metrics = this.metrics
      .filter((m) => m.name === name)
      .map((m) => m.value)
      .sort((a, b) => a - b);

    if (metrics.length === 0) {
      return null;
    }

    const sum = metrics.reduce((a, b) => a + b, 0);

    return {
      min: metrics[0] ?? 0,
      max: metrics.at(-1) ?? 0,
      avg: sum / metrics.length,
      p50: metrics[Math.floor(metrics.length * 0.5)] ?? 0,
      p95: metrics[Math.floor(metrics.length * 0.95)] ?? 0,
      p99: metrics[Math.floor(metrics.length * 0.99)] ?? 0,
      count: metrics.length,
    };
  }

  /**
   * Clear metrics
   */
  static clear(): void {
    this.metrics = [];
  }

  /**
   * Send metric to monitoring service (Sentry, DataDog, etc.)
   */
  private static sendToMonitoring(metric: PerformanceMetric): void {
    // In production, send to Sentry/DataDog
    if (typeof globalThis.window !== "undefined" && (globalThis as any).gtag) {
      (globalThis as any).gtag("event", metric.name, {
        value: metric.value,
        ...metric.tags,
      });
    }
  }

  /**
   * Check performance budget
   */
  static checkBudget(name: string, budget: number): boolean {
    const stats = this.getStatistics(name);
    if (!stats) return true;

    return stats.p95 <= budget;
  }
}

/**
 * Performance budgets for monitoring
 */
export const PERFORMANCE_BUDGETS = {
  "api.request": 500, // 500ms for API requests
  "db.query": 100, // 100ms for database queries
  "agricultural.operation": 1000, // 1s for agricultural operations
  "page.load": 3000, // 3s for page load
  "component.render": 50, // 50ms for component render
};

/**
 * Web Vitals monitoring
 */
export class WebVitalsMonitor {
  private static vitals: WebVitals = {};

  static record(metric: { name: string; value: number }): void {
    const { name, value } = metric;

    switch (name) {
      case "LCP":
      case "FID":
      case "CLS":
      case "FCP":
      case "TTFB":
        this.vitals[name] = value;
        break;
    }

    // Send to analytics
    if (process.env.NODE_ENV === "production") {
      this.sendToAnalytics(name, value);
    }
  }

  static getVitals(): WebVitals {
    return { ...this.vitals };
  }

  static checkThresholds(): {
    passed: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // LCP should be < 2.5s
    if (this.vitals.LCP && this.vitals.LCP > 2500) {
      violations.push(`LCP: ${this.vitals.LCP}ms (should be < 2500ms)`);
    }

    // FID should be < 100ms
    if (this.vitals.FID && this.vitals.FID > 100) {
      violations.push(`FID: ${this.vitals.FID}ms (should be < 100ms)`);
    }

    // CLS should be < 0.1
    if (this.vitals.CLS && this.vitals.CLS > 0.1) {
      violations.push(`CLS: ${this.vitals.CLS} (should be < 0.1)`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  private static sendToAnalytics(name: string, value: number): void {
    if (typeof globalThis.window !== "undefined" && (globalThis as any).gtag) {
      (globalThis as any).gtag("event", name, {
        value: Math.round(value),
        metric_id: `${name}_${Date.now()}`,
        metric_value: value,
        metric_delta: value,
      });
    }
  }
}
