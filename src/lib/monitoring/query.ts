/**
 * 🔍 DATABASE QUERY PERFORMANCE MONITORING
 * Wrapper utilities for measuring and logging database query performance
 */

import { recordDatabaseQuery } from "./performance";

/**
 * Measure the performance of a database query
 * Logs slow queries (>100ms) and records metrics
 */
export async function measureQueryPerformance<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  options: {
    warnThreshold?: number; // ms - default 100
    errorThreshold?: number; // ms - default 1000
    tags?: Record<string, string>;
  } = {},
): Promise<T> {
  const { warnThreshold = 100, errorThreshold = 1000, tags = {} } = options;

  const startTime = performance.now();
  let success = true;
  let error: Error | null = null;

  try {
    const result = await queryFn();
    return result;
  } catch (err) {
    success = false;
    error = err as Error;
    throw err;
  } finally {
    const duration = performance.now() - startTime;

    // Record metric
    recordDatabaseQuery({
      query: queryName,
      duration,
      timestamp: Date.now(),
      success,
    });

    // Log based on duration
    if (duration >= errorThreshold) {
      console.error(
        `❌ [CRITICAL SLOW QUERY] ${queryName}: ${duration.toFixed(2)}ms`,
        { tags, error: error?.message },
      );
    } else if (duration >= warnThreshold) {
      console.warn(`⚠️  [SLOW QUERY] ${queryName}: ${duration.toFixed(2)}ms`, {
        tags,
      });
    } else if (process.env.NODE_ENV === "development") {
      console.log(`✅ [QUERY] ${queryName}: ${duration.toFixed(2)}ms`);
    }
  }
}

/**
 * Measure multiple queries in parallel
 * Returns results array and total duration
 */
export async function measureParallelQueries<T extends unknown[]>(
  queries: {
    name: string;
    fn: () => Promise<T[number]>;
  }[],
): Promise<{
  results: T;
  totalDuration: number;
  individualDurations: number[];
}> {
  const startTime = performance.now();
  const individualDurations: number[] = [];

  const results = await Promise.all(
    queries.map(async (query) => {
      const queryStart = performance.now();
      const result = await measureQueryPerformance(query.name, query.fn);
      individualDurations.push(performance.now() - queryStart);
      return result;
    }),
  );

  const totalDuration = performance.now() - startTime;

  if (process.env.NODE_ENV === "development") {
    console.log(
      `⚡ [PARALLEL QUERIES] ${queries.length} queries in ${totalDuration.toFixed(2)}ms`,
      {
        individual: queries.map((q, i) => ({
          name: q.name,
          duration: individualDurations[i]?.toFixed(2) + "ms",
        })),
      },
    );
  }

  return {
    results: results as unknown as T,
    totalDuration,
    individualDurations,
  };
}

/**
 * Create a query performance monitor for a specific context
 * Useful for tracking queries in a single API route or service
 */
export class QueryMonitor {
  private queries: Array<{
    name: string;
    duration: number;
    success: boolean;
    timestamp: number;
  }> = [];

  constructor(private context: string) {}

  /**
   * Measure a single query
   */
  async measure<T>(name: string, queryFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    let success = true;

    try {
      const result = await queryFn();
      return result;
    } catch (err) {
      success = false;
      throw err;
    } finally {
      const duration = performance.now() - startTime;

      this.queries.push({
        name,
        duration,
        success,
        timestamp: Date.now(),
      });

      recordDatabaseQuery({
        query: `${this.context}::${name}`,
        duration,
        timestamp: Date.now(),
        success,
      });
    }
  }

  /**
   * Get summary of all queries in this context
   */
  getSummary() {
    const totalDuration = this.queries.reduce((sum, q) => sum + q.duration, 0);
    const successCount = this.queries.filter((q) => q.success).length;
    const failureCount = this.queries.length - successCount;

    return {
      context: this.context,
      totalQueries: this.queries.length,
      totalDuration,
      averageDuration:
        this.queries.length > 0 ? totalDuration / this.queries.length : 0,
      successCount,
      failureCount,
      queries: this.queries.map((q) => ({
        name: q.name,
        duration: q.duration,
        success: q.success,
      })),
    };
  }

  /**
   * Log summary to console
   */
  logSummary() {
    const summary = this.getSummary();
    console.log(`📊 [QUERY MONITOR] ${summary.context}:`, {
      total: summary.totalQueries,
      duration: `${summary.totalDuration.toFixed(2)}ms`,
      avg: `${summary.averageDuration.toFixed(2)}ms`,
      success: summary.successCount,
      failed: summary.failureCount,
    });
  }
}

/**
 * Helper to create a monitored Prisma query wrapper
 * Usage: const result = await monitoredQuery('getUserById', () => prisma.user.findUnique(...))
 */
export const monitoredQuery = measureQueryPerformance;
