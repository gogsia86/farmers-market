/**
 * 🗄️ PRISMA DATABASE SINGLETON - ENHANCED WITH QUERY MONITORING
 * Divine database connection with quantum consciousness
 * Optimized for Vercel serverless environment with Prisma v7
 * Enhanced with query performance monitoring and slow query detection
 *
 * Features:
 * - Connection pooling (PostgreSQL)
 * - Query performance logging
 * - Slow query detection (>1s)
 * - Connection health checks
 * - Agricultural consciousness
 *
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 * @reference .cursorrules - Claude Sonnet 4.5 Database Patterns
 */

import { dbQueryLogger } from "@/lib/monitoring/logger";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

// Prisma Client configuration for serverless with PostgreSQL adapter
const createPrismaClient = (): PrismaClient => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Validate DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create PostgreSQL connection pool
  // Reuse existing pool in development to prevent connection leaks
  const pool = globalThis.pgPool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optimize for serverless (Vercel)
    max: isDevelopment ? 10 : 5, // Fewer connections in production
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Log pool events
  pool.on('connect', () => {
    if (isDevelopment) {
      console.log('🔌 PostgreSQL connection established');
    }
  });

  pool.on('error', (err) => {
    console.error('🚨 PostgreSQL pool error:', err);
  });

  // Store pool globally in development
  if (isDevelopment && !globalThis.pgPool) {
    globalThis.pgPool = pool;
  }

  // Create Prisma adapter using pg driver
  const adapter = new PrismaPg(pool);

  // Prisma v7 configuration with PostgreSQL adapter
  const client = new PrismaClient({
    adapter,
    log: isDevelopment
      ? [
        { level: "query", emit: "event" },
        { level: "error", emit: "event" },
        { level: "warn", emit: "event" },
        { level: "info", emit: "event" },
      ]
      : [
        { level: "error", emit: "event" },
        { level: "warn", emit: "event" },
      ],
  });

  // Query performance monitoring
  client.$on("query" as never, (e: any) => {
    const duration = e.duration || 0;
    const query = e.query || "";
    const params = e.params || "[]";
    const target = e.target || "unknown";

    // Log query performance
    dbQueryLogger.logPrismaQuery(query, params, duration, target);
  });

  // Error logging
  client.$on("error" as never, (e: any) => {
    console.error("🚨 Prisma error:", e);
  });

  // Warning logging
  client.$on("warn" as never, (e: any) => {
    console.warn("⚠️ Prisma warning:", e);
  });

  // Info logging (development only)
  if (isDevelopment) {
    client.$on("info" as never, (e: any) => {
      console.log("ℹ️ Prisma info:", e);
    });
  }

  return client;
};

// Initialize database singleton
// In serverless, connection pooling is handled by pg Pool
export const database = globalThis.prisma ?? createPrismaClient();

// Prevent hot reload from creating new instances in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = database;
}

// Re-export as both database and prisma for compatibility
export const prisma = database;
export default database;

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    await database.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: -1,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get database connection statistics
 */
export async function getDatabaseStats(): Promise<{
  connections: number;
  maxConnections: number;
  idleConnections: number;
}> {
  try {
    const stats = await database.$queryRaw<Array<{
      total_connections: number;
      max_connections: number;
      idle_connections: number;
    }>>`
      SELECT
        (SELECT count(*) FROM pg_stat_activity) as total_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections
    `;

    const result = stats[0];
    if (!result) {
      return {
        connections: 0,
        maxConnections: 0,
        idleConnections: 0,
      };
    }
    return {
      connections: result.total_connections,
      maxConnections: result.max_connections,
      idleConnections: result.idle_connections,
    };
  } catch (error) {
    console.error("Failed to get database stats:", error);
    return {
      connections: 0,
      maxConnections: 0,
      idleConnections: 0,
    };
  }
}

/**
 * Disconnect from database (useful for cleanup in tests)
 */
export async function disconnectDatabase(): Promise<void> {
  if (globalThis.prisma) {
    await globalThis.prisma.$disconnect();
    globalThis.prisma = undefined;
  }
  if (globalThis.pgPool) {
    await globalThis.pgPool.end();
    globalThis.pgPool = undefined;
  }
}

/**
 * Divine database singleton with performance monitoring achieved ✨
 * Query performance tracked
 * Slow queries detected
 * Connection health monitored
 * Ready for production at kilo-scale
 */
