/**
 * 🗄️ PRISMA DATABASE SINGLETON
 * Divine database connection with quantum consciousness
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 */

import { dbLogger } from "@/lib/utils/logger";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;

  var databaseConnected: boolean | undefined;
}

let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Prisma v7 configuration with adapter support
const createPrismaClient = (): PrismaClient => {
  // Create PostgreSQL connection pool
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    dbLogger.warn("DATABASE_URL not set, using fallback configuration");
  }

  const pool = new Pool({
    connectionString:
      connectionString ||
      "postgresql://farmers_user:changeme123@localhost:5432/farmers_market",
  });

  // Create Prisma adapter for PostgreSQL
  const adapter = new PrismaPg(pool);

  // Initialize Prisma Client with adapter
  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return client;
};

// Sleep utility for retries
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Enhanced connection handling with retries
const connectWithRetry = async (client: PrismaClient): Promise<void> => {
  while (connectionAttempts < MAX_RETRIES) {
    try {
      await client.$connect();
      dbLogger.info("Database connection established successfully");
      globalThis.databaseConnected = true;
      return;
    } catch (error) {
      connectionAttempts++;
      dbLogger.warn(`Database connection attempt ${connectionAttempts}/${MAX_RETRIES} failed`, {
        errorMessage: error instanceof Error ? error.message : String(error),
        attempt: connectionAttempts,
        maxRetries: MAX_RETRIES,
      });

      if (connectionAttempts < MAX_RETRIES) {
        dbLogger.info(`Retrying database connection in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
      } else {
        dbLogger.error("Database connection failed after maximum attempts", {
          maxRetries: MAX_RETRIES,
          tip: "Make sure PostgreSQL is running and DATABASE_URL is correct",
        });
        globalThis.databaseConnected = false;
        // Don't exit - allow server to start for development
        if (process.env.NODE_ENV === "production") {
          throw error;
        }
      }
    }
  }
};

// Initialize with logging configuration based on environment
const initializeDatabase = (): PrismaClient => {
  const client = createPrismaClient();

  // Attempt connection asynchronously (non-blocking)
  connectWithRetry(client).catch((error) => {
    dbLogger.error("Fatal database connection error", {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  });

  return client;
};

export const database = globalThis.prisma ?? initializeDatabase();

// Prevent hot reload from creating new instances in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = database;
}

// Helper to check database connection status
export const isDatabaseConnected = (): boolean =>
  globalThis.databaseConnected ?? false;

// Re-export as both database and prisma for compatibility
export const prisma = database;
export default database;
