/**
 * 📈 PERFORMANCE MONITORING SYSTEM
 * Divine agricultural performance tracking and metrics collection
 *
 * Features:
 * - Request timing
 * - Database query metrics
 * - API endpoint monitoring
 * - Memory usage tracking
 * - Agricultural consciousness metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  ip?: string;
  userAgent?: string;
}

export interface DatabaseMetrics {
  query: string;
  duration: number;
  timestamp: number;
  success: boolean;
  rowCount?: number;
}

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  timestamp: number;
}

// In-memory storage (upgrade to Redis/TimescaleDB in production)
const metrics: {
  requests: RequestMetrics[];
  database: DatabaseMetrics[];
  memory: MemoryMetrics[];
  custom: PerformanceMetric[];
} = {
  requests: [],
  database: [],
  memory: [],
  custom: [],
};

// Limits for in-memory storage
const MAX_STORED_METRICS = 1000;

/**
 * Record an API request metric
 */
export function recordRequest(metric: RequestMetrics): void {
  metrics.requests.push(metric);

  // Keep only last MAX_STORED_METRICS
  if (metrics.requests.length > MAX_STORED_METRICS) {
    metrics.requests.shift();
  }
}

/**
 * Record a database query metric
 */
export function recordDatabaseQuery(metric: DatabaseMetrics): void {
  metrics.database.push(metric);

  if (metrics.database.length > MAX_STORED_METRICS) {
    metrics.database.shift();
  }
}

/**
 * Record current memory usage
 */
export function recordMemoryUsage(): void {
  const mem = process.memoryUsage();

  metrics.memory.push({
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
    rss: mem.rss,
    timestamp: Date.now(),
  });

  if (metrics.memory.length > MAX_STORED_METRICS) {
    metrics.memory.shift();
  }
}

/**
 * Record a custom performance metric
 */
export function recordMetric(metric: PerformanceMetric): void {
  metrics.custom.push(metric);

  if (metrics.custom.length > MAX_STORED_METRICS) {
    metrics.custom.shift();
  }
}

/**
 * Get performance statistics for a time window
 */
export function getPerformanceStats(windowMs: number = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Filter metrics within window
  const recentRequests = metrics.requests.filter(
    (m) => m.timestamp > windowStart,
  );
  const recentDbQueries = metrics.database.filter(
    (m) => m.timestamp > windowStart,
  );
  const recentMemory = metrics.memory.filter(
    (m: any) => m.timestamp > windowStart,
  );

  // Calculate request stats
  const requestStats = {
    total: recentRequests.length,
    avgDuration: average(recentRequests.map((r: any) => r.duration)),
    p50Duration: percentile(
      recentRequests.map((r: any) => r.duration),
      50,
    ),
    p95Duration: percentile(
      recentRequests.map((r: any) => r.duration),
      95,
    ),
    p99Duration: percentile(
      recentRequests.map((r: any) => r.duration),
      99,
    ),
    successRate:
      (recentRequests.filter((r: any) => r.statusCode < 400).length /
        recentRequests.length) *
        100 || 0,
    errorRate:
      (recentRequests.filter((r: any) => r.statusCode >= 400).length /
        recentRequests.length) *
        100 || 0,
  };

  // Calculate database stats
  const dbStats = {
    total: recentDbQueries.length,
    avgDuration: average(recentDbQueries.map((q: any) => q.duration)),
    p95Duration: percentile(
      recentDbQueries.map((q: any) => q.duration),
      95,
    ),
    successRate:
      (recentDbQueries.filter((q: any) => q.success).length /
        recentDbQueries.length) *
        100 || 0,
  };

  // Calculate memory stats
  const memoryStats = recentMemory.length
    ? {
        current: recentMemory[recentMemory.length - 1],
        avg: {
          heapUsed: average(recentMemory.map((m: any) => m.heapUsed)),
          heapTotal: average(recentMemory.map((m: any) => m.heapTotal)),
          rss: average(recentMemory.map((m: any) => m.rss)),
        },
      }
    : null;

  return {
    windowMs,
    timestamp: now,
    requests: requestStats,
    database: dbStats,
    memory: memoryStats,
  };
}

/**
 * Get slowest endpoints
 */
export function getSlowestEndpoints(limit: number = 10) {
  const endpointMap = new Map<string, number[]>();

  for (const req of metrics.requests) {
    const key = `${req.method} ${req.path}`;
    if (!endpointMap.has(key)) {
      endpointMap.set(key, []);
    }
    endpointMap.get(key)!.push(req.duration);
  }

  const endpointStats = Array.from(endpointMap.entries()).map(
    ([endpoint, durations]) => ({
      endpoint,
      avgDuration: average(durations),
      p95Duration: percentile(durations, 95),
      count: durations.length,
    }),
  );

  return endpointStats
    .sort((a, b) => b.p95Duration - a.p95Duration)
    .slice(0, limit);
}

/**
 * Get error rate by endpoint
 */
export function getErrorRates() {
  const endpointMap = new Map<string, { total: number; errors: number }>();

  for (const req of metrics.requests) {
    const key = `${req.method} ${req.path}`;
    if (!endpointMap.has(key)) {
      endpointMap.set(key, { total: 0, errors: 0 });
    }
    const stats = endpointMap.get(key)!;
    stats.total++;
    if (req.statusCode >= 400) {
      stats.errors++;
    }
  }

  // Convert to array and calculate error rates
  return Array.from(endpointMap.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      total: stats.total,
      errors: stats.errors,
      errorRate: stats.total > 0 ? (stats.errors / stats.total) * 100 : 0,
    }))
    .sort((a, b) => b.errorRate - a.errorRate);
}

/**
 * Clear all metrics (for testing)
 */
export function clearMetrics(): void {
  metrics.requests = [];
  metrics.database = [];
  metrics.memory = [];
  metrics.custom = [];
}

/**
 * Get current metrics count
 */
export function getMetricsCount() {
  return {
    requests: metrics.requests.length,
    database: metrics.database.length,
    memory: metrics.memory.length,
    custom: metrics.custom.length,
  };
}

/**
 * Export metrics for external monitoring systems
 */
export function exportMetrics() {
  return {
    timestamp: Date.now(),
    stats: getPerformanceStats(),
    slowestEndpoints: getSlowestEndpoints(5),
    errorRates: getErrorRates(),
    count: getMetricsCount(),
  };
}

// Helper functions
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum: any, val: any) => sum + val, 0) / values.length;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)] || 0;
}

// Start memory monitoring (every 30 seconds)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    recordMemoryUsage();
  }, 30000);
}
