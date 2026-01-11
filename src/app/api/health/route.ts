/**
 * Health Check API Route
 *
 * Provides comprehensive health monitoring for the Farmers Market Platform
 * including database, cache, and system resource checks.
 *
 * @route GET /api/health
 * @route GET /api/health/db
 * @route GET /api/health/cache
 */

import { multiLayerCache } from "@/lib/cache/multi-layer.cache";
import { database } from "@/lib/database";
import { logger } from "@/lib/monitoring/logger";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// TYPES
// ============================================================================

type HealthStatus = "healthy" | "degraded" | "unhealthy";

interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  checks: {
    database?: {
      status: HealthStatus;
      latency?: number;
      message?: string;
      details?: Record<string, unknown>;
    };
    cache?: {
      status: HealthStatus;
      latency?: number;
      message?: string;
      details?: Record<string, unknown>;
    };
    system?: {
      status: HealthStatus;
      memory?: {
        used: number;
        total: number;
        percentage: number;
      };
      uptime?: number;
      message?: string;
    };
  };
  version?: string;
  environment?: string;
}

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Check database connectivity and performance
 */
async function checkDatabase(): Promise<
  HealthCheckResult["checks"]["database"]
> {
  const start = Date.now();

  try {
    // Simple query to check connection
    await database.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    // Latency thresholds
    if (latency > 1000) {
      return {
        status: "degraded",
        latency,
        message: "Database response time is slow",
      };
    }

    if (latency > 5000) {
      return {
        status: "unhealthy",
        latency,
        message: "Database response time is critical",
      };
    }

    return {
      status: "healthy",
      latency,
      message: "Database is responsive",
    };
  } catch (error) {
    logger.error("Database health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      status: "unhealthy",
      latency: Date.now() - start,
      message: "Database connection failed",
      details:
        process.env.NODE_ENV === "development"
          ? { error: error instanceof Error ? error.message : "Unknown error" }
          : undefined,
    };
  }
}

/**
 * Check cache system health
 */
async function checkCache(): Promise<HealthCheckResult["checks"]["cache"]> {
  const start = Date.now();

  try {
    // Test cache read/write
    const testKey = "health-check-test";
    const testValue = { timestamp: Date.now() };

    await multiLayerCache.set(testKey, testValue, { ttl: 10 });
    const retrieved = await multiLayerCache.get(testKey);

    const latency = Date.now() - start;

    if (!retrieved) {
      return {
        status: "degraded",
        latency,
        message: "Cache read/write test failed",
      };
    }

    // Get cache statistics
    const stats = multiLayerCache.getStats();

    // Latency thresholds
    if (latency > 100) {
      return {
        status: "degraded",
        latency,
        message: "Cache response time is slow",
        details:
          process.env.NODE_ENV === "development"
            ? (stats as unknown as Record<string, unknown>)
            : undefined,
      };
    }

    return {
      status: "healthy",
      latency,
      message: "Cache is responsive",
      details:
        process.env.NODE_ENV === "development"
          ? (stats as unknown as Record<string, unknown>)
          : undefined,
    };
  } catch (error) {
    logger.warn("Cache health check failed - treating as degraded", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Cache failure is degraded, not unhealthy - app can work without cache
    return {
      status: "degraded",
      latency: Date.now() - start,
      message: "Cache system unavailable or degraded",
      details:
        process.env.NODE_ENV === "development"
          ? { error: error instanceof Error ? error.message : "Unknown error" }
          : undefined,
    };
  }
}

/**
 * Check system resources
 */
function checkSystem(): HealthCheckResult["checks"]["system"] {
  try {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    let status: HealthStatus = "healthy";

    if (memoryPercentage > 90) {
      status = "unhealthy";
    } else if (memoryPercentage > 80) {
      status = "degraded";
    }

    return {
      status,
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
      uptime: Math.round(process.uptime()),
    };
  } catch (error) {
    logger.error("System health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      status: "unhealthy",
    };
  }
}

/**
 * Determine overall health status based on individual checks
 * Database is critical, cache and system are less critical
 */
function determineOverallStatus(
  checks: HealthCheckResult["checks"],
): HealthStatus {
  // Database unhealthy = system unhealthy
  if (checks.database?.status === "unhealthy") {
    return "unhealthy";
  }

  // System critically degraded = unhealthy
  if (checks.system?.status === "unhealthy") {
    return "unhealthy";
  }

  // Database degraded OR any other issue = degraded
  if (checks.database?.status === "degraded") {
    return "degraded";
  }

  // Cache or system degraded = overall degraded (but app can run)
  const statuses = [checks.cache?.status, checks.system?.status].filter(
    Boolean,
  ) as HealthStatus[];

  if (statuses.includes("unhealthy") || statuses.includes("degraded")) {
    return "degraded";
  }

  return "healthy";
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * GET /api/health - Comprehensive health check
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Database-only health check (support both /db and /database paths)
    if (pathname === "/api/health/db" || pathname === "/api/health/database") {
      const dbCheckResult = await checkDatabase();
      return NextResponse.json(
        {
          status: dbCheckResult?.status || "unhealthy",
          timestamp: new Date().toISOString(),
          database: dbCheckResult,
        },
        { status: dbCheckResult?.status === "healthy" ? 200 : 503 },
      );
    }

    // Cache-only health check
    if (pathname === "/api/health/cache") {
      const cacheCheckResult = await checkCache();
      return NextResponse.json(
        {
          status: cacheCheckResult?.status || "unhealthy",
          timestamp: new Date().toISOString(),
          cache: cacheCheckResult,
        },
        { status: cacheCheckResult?.status === "healthy" ? 200 : 503 },
      );
    }

    // Full health check - run checks in parallel
    // Wrap cache check to not fail the entire health check
    const [dbCheck, cacheCheck, systemCheck] = await Promise.allSettled([
      checkDatabase(),
      checkCache(),
      Promise.resolve(checkSystem()),
    ]);

    const checks: HealthCheckResult["checks"] = {
      database:
        dbCheck.status === "fulfilled"
          ? dbCheck.value
          : {
              status: "unhealthy",
              message: "Database check failed",
            },
      cache:
        cacheCheck.status === "fulfilled"
          ? cacheCheck.value
          : {
              status: "degraded",
              message: "Cache check failed",
            },
      system:
        systemCheck.status === "fulfilled"
          ? systemCheck.value
          : {
              status: "degraded",
              message: "System check failed",
            },
    };

    const overallStatus = determineOverallStatus(checks);

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "production",
    };

    // Log degraded or unhealthy status
    if (overallStatus !== "healthy") {
      logger.warn("Health check returned non-healthy status", {
        status: overallStatus,
        checks: {
          database: dbCheck?.status || "unknown",
          cache: cacheCheck?.status || "unknown",
          system: systemCheck?.status || "unknown",
        },
      });
    }

    // Determine HTTP status code
    // - 200: healthy or degraded (system is functional)
    // - 503: unhealthy (system cannot serve requests)
    const httpStatus = overallStatus === "unhealthy" ? 503 : 200;

    return NextResponse.json(result, {
      status: httpStatus,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    logger.error("Health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        message: "Health check failed",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}

/**
 * HEAD /api/health - Quick health check (no body)
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick database ping
    await database.$queryRaw`SELECT 1`;

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }
}

// ============================================================================
// EXPORT ROUTE CONFIG
// ============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
