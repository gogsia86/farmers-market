/**
 * 🔍 ENVIRONMENT VARIABLES CHECK API
 *
 * This route helps diagnose environment variable issues by showing
 * which variables are set (without exposing sensitive values)
 *
 * ⚠️ SECURITY: Only shows if variables exist, not their actual values
 * ⚠️ DISABLE IN PRODUCTION or protect with authentication
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// List of environment variables to check
const ENV_VARS_TO_CHECK = [
  // Auth
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_APP_URL",

  // Database
  "DATABASE_URL",

  // Build
  "NODE_ENV",
  "TURBOPACK",
  "SENTRY_UPLOAD_DRY_RUN",
  "NEXT_DISABLE_SOURCEMAPS",
  "SKIP_ENV_VALIDATION",

  // Sentry
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",

  // Redis
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_PASSWORD",

  // Payment
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",

  // Email
  "SENDGRID_API_KEY",
  "EMAIL_FROM",

  // Storage
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",

  // Vercel
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
];

function maskValue(value: string): string {
  if (value.length <= 8) {
    return "***";
  }
  // Show first 4 and last 4 characters
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function GET(request: Request) {
  // Only allow in development or with special header
  const isDevelopment = process.env.NODE_ENV === "development";
  const hasDebugHeader = request.headers.get("x-debug-token") === process.env.DEBUG_TOKEN;

  if (!isDevelopment && !hasDebugHeader) {
    return NextResponse.json(
      {
        error: "This endpoint is only available in development mode",
        hint: "Set NODE_ENV=development or provide x-debug-token header"
      },
      { status: 403 }
    );
  }

  // Check each environment variable
  const envStatus: Record<string, {
    exists: boolean;
    masked?: string;
    length?: number;
  }> = {};

  for (const envVar of ENV_VARS_TO_CHECK) {
    const value = process.env[envVar];

    if (value) {
      envStatus[envVar] = {
        exists: true,
        masked: maskValue(value),
        length: value.length,
      };
    } else {
      envStatus[envVar] = {
        exists: false,
      };
    }
  }

  // Calculate statistics
  const totalChecked = ENV_VARS_TO_CHECK.length;
  const totalSet = Object.values(envStatus).filter(v => v.exists).length;
  const totalMissing = totalChecked - totalSet;

  // Identify critical missing variables
  const criticalVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL"];
  const missingCritical = criticalVars.filter(
    varName => !envStatus[varName]?.exists
  );

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    vercel: {
      isVercel: process.env.VERCEL === "1",
      env: process.env.VERCEL_ENV,
      url: process.env.VERCEL_URL ? maskValue(process.env.VERCEL_URL) : "not set",
    },
    summary: {
      totalChecked,
      totalSet,
      totalMissing,
      percentageSet: Math.round((totalSet / totalChecked) * 100),
    },
    critical: {
      allCriticalSet: missingCritical.length === 0,
      missingCritical,
    },
    variables: envStatus,
    recommendations: generateRecommendations(envStatus, missingCritical),
  });
}

function generateRecommendations(
  envStatus: Record<string, { exists: boolean }>,
  missingCritical: string[]
): string[] {
  const recommendations: string[] = [];

  // Critical variables
  if (missingCritical.length > 0) {
    recommendations.push(
      `🚨 CRITICAL: Set these required variables: ${missingCritical.join(", ")}`
    );
  }

  // NextAuth
  if (!envStatus.NEXTAUTH_SECRET?.exists) {
    recommendations.push(
      "🔐 Generate NEXTAUTH_SECRET: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
  }

  if (!envStatus.NEXTAUTH_URL?.exists) {
    recommendations.push(
      "🌐 Set NEXTAUTH_URL to your application URL (e.g., http://localhost:3001 or https://your-domain.vercel.app)"
    );
  }

  // Database
  if (!envStatus.DATABASE_URL?.exists) {
    recommendations.push(
      "🗄️ Set DATABASE_URL to your PostgreSQL connection string"
    );
  }

  // Optional but recommended
  if (!envStatus.SENTRY_DSN?.exists) {
    recommendations.push(
      "📊 Consider setting SENTRY_DSN for error tracking (optional)"
    );
  }

  if (!envStatus.REDIS_HOST?.exists) {
    recommendations.push(
      "⚡ Consider setting Redis variables for caching (optional but recommended)"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ All critical environment variables are set!");
  }

  return recommendations;
}
