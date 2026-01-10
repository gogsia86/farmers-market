import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Returns the health status of the application including:
 * - API status
 * - Database connectivity
 * - System uptime
 * - Environment info
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check database connection
    let dbStatus = "unknown";
    let dbLatency = 0;

    try {
      const dbStart = Date.now();
      await database.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
      dbStatus = "healthy";
    } catch (dbError) {
      dbStatus = "unhealthy";
      console.error("Database health check failed:", dbError);
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Build health response
    const healthData = {
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        api: {
          status: "healthy",
          responseTime: `${responseTime}ms`
        },
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`
        }
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        env: process.env.NODE_ENV || "development"
      },
      version: "1.0.0"
    };

    // Return appropriate status code
    const statusCode = dbStatus === "healthy" ? 200 : 503;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    // Critical error in health check itself
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json"
        }
      }
    );
  }
}

/**
 * HEAD /api/health
 * Lightweight health check (no body)
 */
export async function HEAD(request: NextRequest) {
  try {
    await database.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
