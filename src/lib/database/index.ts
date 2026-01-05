/**
 * 🗄️ PRISMA DATABASE SINGLETON
 * Divine database connection with quantum consciousness
 * Optimized for Vercel serverless environment
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 */

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Prisma Client configuration for serverless
const createPrismaClient = (): PrismaClient => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Prisma v7 uses DATABASE_URL from environment automatically
  // No need for datasources config - it's handled by the schema
  const client = new PrismaClient({
    log: isDevelopment ? ["error", "warn"] : ["error"],
  });

  return client;
};

// Initialize database singleton
// In serverless, connection pooling is handled by Prisma internally
export const database = globalThis.prisma ?? createPrismaClient();

// Prevent hot reload from creating new instances in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = database;
}

// Re-export as both database and prisma for compatibility
export const prisma = database;
export default database;
