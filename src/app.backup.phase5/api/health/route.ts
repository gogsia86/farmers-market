/**
 * 🏥 HEALTH CHECK API ENDPOINT
 * System health monitoring for production
 */

import { database } from "@/lib/database";
import { NextResponse } from "next/server";
import v8 from "v8";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "up" | "down";
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    environment: string;
  };
}

export async function GET() {
  const startTime = Date.now();

  const health: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime(),
    checks: {
      database: {
        status: "down",
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      environment: process.env.NODE_ENV || "unknown",
    },
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    await database.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - dbStart;

    health.checks.database = {
      status: "up",
      responseTime: dbTime,
    };
  } catch (error) {
    health.status = "unhealthy";
    health.checks.database = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const heapStats = v8.getHeapStatistics();
  const usedMemory = memUsage.heapUsed;
  const rawHeapLimit = heapStats.heap_size_limit;
  const heapLimit =
    rawHeapLimit > 0
      ? rawHeapLimit
      : Math.max(memUsage.heapTotal, usedMemory || 1);

  health.checks.memory = {
    used: Math.round(usedMemory / 1024 / 1024), // MB
    total: Math.round(heapLimit / 1024 / 1024), // MB
    percentage: Math.round((usedMemory / heapLimit) * 100),
  };

  // Determine overall status
  if (health.checks.database.status === "down") {
    health.status = "unhealthy";
  } else if (health.checks.memory.percentage > 90) {
    health.status = "degraded";
  }

  const totalTime = Date.now() - startTime;

  return NextResponse.json(
    {
      ...health,
      responseTime: totalTime,
    },
    {
      status: health.status === "healthy" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
