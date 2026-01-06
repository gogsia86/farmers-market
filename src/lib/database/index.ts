/**
 * 🗄️ PRISMA DATABASE SINGLETON
 * Divine database connection with quantum consciousness
 * Optimized for Vercel serverless environment with Prisma v7
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 */

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

  // Store pool globally in development
  if (isDevelopment && !globalThis.pgPool) {
    globalThis.pgPool = pool;
  }

  // Create Prisma adapter using pg driver
  const adapter = new PrismaPg(pool);

  // Prisma v7 configuration with PostgreSQL adapter
  const client = new PrismaClient({
    adapter,
    log: isDevelopment ? ["error", "warn"] : ["error"],
  });

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
