/**
 * 🔍 READINESS CHECK
 * Kubernetes-style readiness probe
 */

import { database } from "@/lib/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Readiness check - can the service accept traffic?
 */
export async function GET() {
  try {
    // Check database is accessible
    await database.$queryRaw`SELECT 1`;

    // Check environment variables
    const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET"];
    const missing = requiredEnvVars.filter((v) => !process.env[v]);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          ready: false,
          reason: `Missing environment variables: ${missing.join(", ")}`,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        reason: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
