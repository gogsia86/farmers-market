/**
 * 🏥 HEALTH CHECK API ENDPOINT
 *
 * Comprehensive health check for debugging Vercel deployments
 * Tests database connectivity, environment configuration, and system status
 *
 * @endpoint GET /api/health
 * @returns {HealthCheckResponse} System health status
 */

import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  environment: string;
  version: string;
  checks: {
    database: HealthCheckResult;
    environment: HealthCheckResult;
    prisma: HealthCheckResult;
    nextAuth: HealthCheckResult;
    tracing: HealthCheckResult;
  };
  system?: {
    runtime: string;
    nodeVersion: string;
    memory?: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

interface HealthCheckResult {
  status: "pass" | "warn" | "fail";
  message: string;
  details?: Record<string, any>;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Initialize results
    const checks: HealthCheckResponse["checks"] = {
      database: await checkDatabase(),
      environment: checkEnvironment(),
      prisma: checkPrisma(),
      nextAuth: checkNextAuth(),
      tracing: checkTracing(),
    };

    // Determine overall status
    const overallStatus = determineOverallStatus(checks);

    // Get system info
    const system = getSystemInfo();

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      version: process.env.npm_package_version || "1.0.0",
      checks,
      system,
    };

    const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 207 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Health-Check-Duration": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "unknown",
        version: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
        checks: {
          database: { status: "fail", message: "Health check crashed" },
          environment: { status: "fail", message: "Health check crashed" },
          prisma: { status: "fail", message: "Health check crashed" },
          nextAuth: { status: "fail", message: "Health check crashed" },
          tracing: { status: "fail", message: "Health check crashed" },
        },
      } as HealthCheckResponse,
      { status: 503 }
    );
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    // Try to execute a simple query
    await database.$queryRaw`SELECT 1 as health_check`;

    return {
      status: "pass",
      message: "Database connection successful",
      details: {
        connected: true,
        provider: "postgresql",
      },
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Check critical environment variables
 */
function checkEnvironment(): HealthCheckResult {
  const requiredVars = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ];

  const optionalVars = [
    "SENTRY_DSN",
    "STRIPE_SECRET_KEY",
    "ENABLE_TRACING",
  ];

  const missing: string[] = [];
  const present: string[] = [];
  const optional: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }

  // Check optional variables
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      optional.push(varName);
    }
  }

  if (missing.length > 0) {
    return {
      status: "fail",
      message: `Missing required environment variables: ${missing.join(", ")}`,
      details: {
        missing,
        present,
        optional,
      },
    };
  }

  return {
    status: "pass",
    message: "All required environment variables are set",
    details: {
      required: present.length,
      optional: optional.length,
      total: present.length + optional.length,
    },
  };
}

/**
 * Check Prisma Client status
 */
function checkPrisma(): HealthCheckResult {
  try {
    // Check if Prisma client is available
    if (!database) {
      return {
        status: "fail",
        message: "Prisma client not initialized",
      };
    }

    return {
      status: "pass",
      message: "Prisma client initialized",
      details: {
        client: "available",
        version: "7.2.0",
      },
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Prisma check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Check NextAuth configuration
 */
function checkNextAuth(): HealthCheckResult {
  const hasSecret = !!process.env.NEXTAUTH_SECRET;
  const hasUrl = !!process.env.NEXTAUTH_URL;

  if (!hasSecret || !hasUrl) {
    return {
      status: "fail",
      message: "NextAuth configuration incomplete",
      details: {
        hasSecret,
        hasUrl,
      },
    };
  }

  return {
    status: "pass",
    message: "NextAuth configured correctly",
    details: {
      secret: "present",
      url: process.env.NEXTAUTH_URL,
    },
  };
}

/**
 * Check tracing configuration
 */
function checkTracing(): HealthCheckResult {
  const tracingEnabled = process.env.ENABLE_TRACING === "true";

  if (!tracingEnabled) {
    return {
      status: "pass",
      message: "Tracing disabled (recommended for production)",
      details: {
        enabled: false,
      },
    };
  }

  const hasOtelEndpoint = !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const hasServiceName = !!process.env.OTEL_SERVICE_NAME;

  if (!hasOtelEndpoint || !hasServiceName) {
    return {
      status: "warn",
      message: "Tracing enabled but not fully configured",
      details: {
        enabled: true,
        hasEndpoint: hasOtelEndpoint,
        hasServiceName: hasServiceName,
      },
    };
  }

  return {
    status: "pass",
    message: "Tracing enabled and configured",
    details: {
      enabled: true,
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      serviceName: process.env.OTEL_SERVICE_NAME,
    },
  };
}

/**
 * Get system information
 */
function getSystemInfo() {
  try {
    const used = process.memoryUsage();

    return {
      runtime: process.env.NEXT_RUNTIME || "nodejs",
      nodeVersion: process.version,
      memory: {
        used: Math.round(used.heapUsed / 1024 / 1024),
        total: Math.round(used.heapTotal / 1024 / 1024),
        percentage: Math.round((used.heapUsed / used.heapTotal) * 100),
      },
    };
  } catch (error) {
    return {
      runtime: process.env.NEXT_RUNTIME || "nodejs",
      nodeVersion: process.version,
    };
  }
}

/**
 * Determine overall status from individual checks
 */
function determineOverallStatus(
  checks: HealthCheckResponse["checks"]
): "healthy" | "degraded" | "unhealthy" {
  const statuses = Object.values(checks).map((check) => check.status);

  // If any critical check fails, system is unhealthy
  if (checks.database.status === "fail" || checks.environment.status === "fail") {
    return "unhealthy";
  }

  // If any check fails, system is degraded
  if (statuses.includes("fail")) {
    return "degraded";
  }

  // If any check warns, system is degraded
  if (statuses.includes("warn")) {
    return "degraded";
  }

  return "healthy";
}
