/**
 * 🔧 DATABASE CONFIGURATION MODULE
 * Environment-aware database connection configuration
 * Handles direct connections vs Prisma Accelerate
 *
 * @reference .cursorrules - Claude Sonnet 4.5 Database Patterns
 */

import { logger } from "@/lib/monitoring/logger";

export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  useAccelerate: boolean;
}

/**
 * Get database configuration based on environment
 */
export function getDatabaseConfig(): DatabaseConfig {
  const env = process.env.NODE_ENV;
  const isDevelopment = env === "development";
  const isProduction = env === "production";

  // Validate required environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Determine which connection URL to use
  const useAccelerate = isProduction && !!process.env.DATABASE_URL_ACCELERATE;
  const connectionUrl = useAccelerate
    ? process.env.DATABASE_URL_ACCELERATE!
    : process.env.DATABASE_URL;

  // Log configuration (without exposing credentials)
  logger.info("📊 Database configuration loaded", {
    environment: env,
    useAccelerate,
    connectionType: useAccelerate ? "Prisma Accelerate" : "Direct PostgreSQL",
  });

  // Environment-specific connection pool settings
  if (isDevelopment) {
    return {
      url: connectionUrl,
      maxConnections: 5, // More connections for local development
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 10000, // 10 seconds
      useAccelerate: false, // Always use direct connection in dev
    };
  }

  if (isProduction) {
    return {
      url: connectionUrl,
      maxConnections: 1, // Single connection per serverless function
      idleTimeoutMillis: 10000, // 10 seconds - faster cleanup
      connectionTimeoutMillis: 5000, // 5 seconds - quick timeout
      useAccelerate,
    };
  }

  // Test environment
  return {
    url: process.env.DATABASE_URL, // Always direct for tests
    maxConnections: 3,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 3000,
    useAccelerate: false,
  };
}

/**
 * Validate database URL format
 */
export function validateDatabaseUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  try {
    // Check for Prisma Accelerate URL
    if (url.startsWith("prisma+postgres://")) {
      return { valid: true };
    }

    // Check for standard PostgreSQL URL
    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      // Basic validation - parse the URL
      const parsed = new URL(url);

      if (!parsed.hostname) {
        return { valid: false, error: "Missing hostname in DATABASE_URL" };
      }

      if (!parsed.pathname || parsed.pathname === "/") {
        return { valid: false, error: "Missing database name in DATABASE_URL" };
      }

      return { valid: true };
    }

    return {
      valid: false,
      error: "Invalid database URL format. Must start with postgres:// or prisma+postgres://",
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid URL format",
    };
  }
}

/**
 * Get redacted database URL for logging
 * Masks password and sensitive query parameters
 */
export function getRedactedDatabaseUrl(url: string): string {
  try {
    // Handle Prisma Accelerate URLs
    if (url.startsWith("prisma+postgres://")) {
      return "prisma+postgres://accelerate.prisma-data.net/?api_key=[REDACTED]";
    }

    // Handle standard PostgreSQL URLs
    const parsed = new URL(url);

    // Redact password
    if (parsed.password) {
      parsed.password = "[REDACTED]";
    }

    // Redact username if it looks like a token/key
    if (parsed.username && parsed.username.length > 20) {
      parsed.username = "[REDACTED]";
    }

    return parsed.toString();
  } catch {
    return "[INVALID_URL]";
  }
}

/**
 * Database connection health check configuration
 */
export const HEALTH_CHECK_CONFIG = {
  timeout: 5000, // 5 seconds
  retries: 3,
  retryDelay: 1000, // 1 second between retries
} as const;

/**
 * Query performance thresholds
 */
export const QUERY_PERFORMANCE_THRESHOLDS = {
  slow: 1000, // 1 second - log as slow query
  critical: 5000, // 5 seconds - log as critical
  veryFast: 10, // 10ms - extremely fast
  fast: 100, // 100ms - fast
} as const;

/**
 * Connection pool monitoring configuration
 */
export const POOL_MONITORING_CONFIG = {
  checkInterval: 60000, // Check every 60 seconds
  maxConnectionsWarning: 0.8, // Warn at 80% capacity
  idleConnectionsThreshold: 0.5, // Warn if >50% connections are idle
} as const;
