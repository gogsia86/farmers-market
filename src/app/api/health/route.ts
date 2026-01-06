/**
 * 🏥 HEALTH CHECK API ENDPOINT - COMPREHENSIVE
 *
 * Production-grade health monitoring for the Farmers Market Platform
 *
 * Features:
 * - Overall system health status
 * - Database connectivity and query performance
 * - Cache (Redis) availability
 * - External service status (optional)
 * - Detailed diagnostics in development
 * - Lightweight response in production
 *
 * Endpoints:
 * - GET /api/health - Overall health status
 * - GET /api/health/db - Database-specific health
 * - GET /api/health/cache - Cache-specific health
 * - GET /api/health/live - Kubernetes liveness probe
 * - GET /api/health/ready - Kubernetes readiness probe
 *
 * Response Format:
 * {
 *   status: "healthy" | "degraded" | "unhealthy",
 *   timestamp: ISO string,
 *   uptime: seconds,
 *   version: string,
 *   checks: {
 *     database: { status, latency, details? },
 *     cache: { status, latency, details? },
 *     ...
 *   }
 * }
 *
 * @reference .cursorrules - Health Check Patterns
 */

import { multiLayerCache } from '@/lib/cache/multi-layer.cache';
import { database } from '@/lib/database';
import { createLogger } from '@/lib/monitoring/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ============================================================================
// LOGGER
// ============================================================================

const logger = createLogger('HealthCheck');

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface HealthCheckResult {
  status: HealthStatus;
  latency?: number;
  message?: string;
  details?: Record<string, unknown>;
}

interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckResult;
    cache: HealthCheckResult;
    application: HealthCheckResult;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get system uptime in seconds
 */
function getUptime(): number {
  return process.uptime();
}

/**
 * Get application version from package.json
 */
function getVersion(): string {
  return process.env.npm_package_version || '1.0.0';
}

/**
 * Determine overall status from individual checks
 */
function determineOverallStatus(
  checks: Record<string, HealthCheckResult>
): HealthStatus {
  const statuses = Object.values(checks).map((check) => check.status);

  if (statuses.every((status) => status === 'healthy')) {
    return 'healthy';
  }

  if (statuses.some((status) => status === 'unhealthy')) {
    return 'unhealthy';
  }

  return 'degraded';
}

/**
 * Measure execution time of an async function
 */
async function measureLatency<T>(
  fn: () => Promise<T>
): Promise<{ result: T; latency: number }> {
  const start = performance.now();
  const result = await fn();
  const latency = Math.round(performance.now() - start);
  return { result, latency };
}

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Check database health
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    const { result, latency } = await measureLatency(async () => {
      // Simple query to check connectivity
      return await database.$queryRaw`SELECT 1 as health`;
    });

    if (!result) {
      return {
        status: 'unhealthy',
        message: 'Database query returned no result',
      };
    }

    // Latency thresholds
    if (latency > 1000) {
      return {
        status: 'degraded',
        latency,
        message: 'Database response time is slow',
      };
    }

    return {
      status: 'healthy',
      latency,
      message: 'Database is responsive',
    };
  } catch (error) {
    logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      details:
        process.env.NODE_ENV === 'development'
          ? { error: error instanceof Error ? error.message : String(error) }
          : undefined,
    };
  }
}

/**
 * Check cache health (Redis + L1)
 */
async function checkCache(): Promise<HealthCheckResult> {
  try {
    const testKey = '__health_check__';
    const testValue = Date.now().toString();

    const { latency } = await measureLatency(async () => {
      // Test set and get
      await multiLayerCache.set(testKey, testValue, { ttl: 10 });
      const retrieved = await multiLayerCache.get(testKey);

      if (retrieved !== testValue) {
        throw new Error('Cache value mismatch');
      }

      // Cleanup
      await multiLayerCache.delete(testKey);
    });

    // Get cache statistics
    const stats = multiLayerCache.getStats();

    // Latency thresholds
    if (latency > 100) {
      return {
        status: 'degraded',
        latency,
        message: 'Cache response time is slow',
        details: process.env.NODE_ENV === 'development' ? stats : undefined,
      };
    }

    return {
      status: 'healthy',
      latency,
      message: 'Cache is responsive',
      details: process.env.NODE_ENV === 'development' ? stats : undefined,
    };
  } catch (error) {
    logger.error('Cache health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Cache failure is not critical (can use L1 only or direct DB)
    return {
      status: 'degraded',
      message: 'Cache unavailable (operating with fallback)',
      details:
        process.env.NODE_ENV === 'development'
          ? { error: error instanceof Error ? error.message : String(error) }
          : undefined,
    };
  }
}

/**
 * Check application health
 */
async function checkApplication(): Promise<HealthCheckResult> {
  try {
    // Basic application checks
    const memoryUsage = process.memoryUsage();
    const heapUsedPercentage =
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Memory threshold check
    if (heapUsedPercentage > 90) {
      return {
        status: 'degraded',
        message: 'High memory usage',
        details:
          process.env.NODE_ENV === 'development'
            ? {
              heapUsedPercentage: `${heapUsedPercentage.toFixed(2)}%`,
              heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
              heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            }
            : undefined,
      };
    }

    return {
      status: 'healthy',
      message: 'Application is running normally',
      details:
        process.env.NODE_ENV === 'development'
          ? {
            heapUsedPercentage: `${heapUsedPercentage.toFixed(2)}%`,
            uptime: `${getUptime().toFixed(0)}s`,
            nodeVersion: process.version,
          }
          : undefined,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Application check failed',
      details:
        process.env.NODE_ENV === 'development'
          ? { error: error instanceof Error ? error.message : String(error) }
          : undefined,
    };
  }
}

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/health - Comprehensive health check
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const start = performance.now();

  try {
    // Run all health checks in parallel
    const [databaseCheck, cacheCheck, applicationCheck] = await Promise.all([
      checkDatabase(),
      checkCache(),
      checkApplication(),
    ]);

    // Build response
    const checks = {
      database: databaseCheck,
      cache: cacheCheck,
      application: applicationCheck,
    };

    const overallStatus = determineOverallStatus(checks);

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: getUptime(),
      version: getVersion(),
      environment: process.env.NODE_ENV || 'unknown',
      checks,
    };

    // Log health check
    const duration = Math.round(performance.now() - start);
    logger.info('Health check completed', {
      status: overallStatus,
      duration,
    });

    // HTTP status codes based on health
    const statusCode =
      overallStatus === 'healthy'
        ? 200
        : overallStatus === 'degraded'
          ? 200 // Still operational
          : 503; // Service unavailable

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: getUptime(),
        version: getVersion(),
        environment: process.env.NODE_ENV || 'unknown',
        checks: {
          database: { status: 'unhealthy', message: 'Check failed' },
          cache: { status: 'unhealthy', message: 'Check failed' },
          application: { status: 'unhealthy', message: 'Check failed' },
        },
        error:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'Health check failed',
      },
      { status: 503 }
    );
  }
}

/**
 * Kubernetes liveness probe
 * Indicates if the application is running
 */
export async function HEAD(): Promise<NextResponse> {
  // Simple liveness check - just return 200 if process is running
  return new NextResponse(null, { status: 200 });
}

/**
 * Divine health monitoring achieved ✨
 * Comprehensive checks for production readiness
 * Kubernetes-compatible probes included
 */
