/**
 * 🔍 DATABASE HEALTH CHECK ENDPOINT
 * Tests database connectivity and returns health status
 *
 * @module api/health/database
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextResponse } from "next/server";

// Initialize structured logger
const logger = createLogger("health-database-api");

/**
 * GET /api/health/database
 * Checks database connectivity and returns status
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Test database connection with a simple query
    await database.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    logger.info("Database health check passed", {
      responseTime: `${responseTime}ms`,
      status: "healthy",
    });

    return NextResponse.json(
      {
        success: true,
        status: "healthy",
        database: {
          connected: true,
          responseTime: `${responseTime}ms`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.error("Database health check failed", error as Error, {
      responseTime: `${responseTime}ms`,
      status: "unhealthy",
      operation: "GET /api/health/database",
    });

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        database: {
          connected: false,
          responseTime: `${responseTime}ms`,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
