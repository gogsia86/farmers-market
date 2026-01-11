/**
 * Readiness Check API Route
 *
 * Kubernetes-style readiness probe endpoint
 * Returns 200 when the application is ready to serve traffic
 * Returns 503 when the application is not ready
 *
 * @route GET /api/ready
 */

import { database } from "@/lib/database";
import { NextResponse } from "next/server";

/**
 * GET /api/ready - Quick readiness check
 *
 * Checks if the application is ready to serve traffic
 * - Database connection available
 * - Core services initialized
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Quick database connection check
    await database.$queryRaw`SELECT 1`;

    // Application is ready
    return NextResponse.json(
      {
        status: "ready",
        timestamp: new Date().toISOString(),
        message: "Application is ready to serve traffic",
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    // Application is not ready
    return NextResponse.json(
      {
        status: "not_ready",
        timestamp: new Date().toISOString(),
        message: "Application is not ready to serve traffic",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : "Service temporarily unavailable",
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Retry-After": "5",
        },
      },
    );
  }
}

/**
 * HEAD /api/ready - Quick readiness check (no body)
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    await database.$queryRaw`SELECT 1`;
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Retry-After": "5",
      },
    });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
