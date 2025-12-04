/**
 * 🎯 READINESS PROBE API ENDPOINT
 * Kubernetes-style readiness check for load balancer
 */

import { database } from "@/lib/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ReadinessStatus {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    prisma: boolean;
    dependencies: boolean;
  };
  message?: string;
}

export async function GET() {
  const status: ReadinessStatus = {
    ready: true,
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      prisma: false,
      dependencies: true,
    },
  };

  try {
    // Check Prisma client is initialized
    status.checks.prisma = !!database;

    // Check database connection with timeout
    const dbPromise = database.$queryRaw`SELECT 1 as result`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 5000),
    );

    await Promise.race([dbPromise, timeoutPromise]);
    status.checks.database = true;

    // All checks passed
    status.ready = Object.values(status.checks).every((check) => check);
    status.message = "Application is ready to accept traffic";
  } catch (error) {
    status.ready = false;
    status.message =
      error instanceof Error ? error.message : "Readiness check failed";
  }

  return NextResponse.json(status, {
    status: status.ready ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
