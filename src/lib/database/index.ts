/**
 * 🗄️ PRISMA DATABASE SINGLETON
 * Divine database connection with quantum consciousness
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var databaseConnected: boolean | undefined;
}

let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Prisma v7 configuration with adapter support
const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Prisma v7: Pass datasourceUrl via client config
    datasourceUrl: process.env.DATABASE_URL,
  });

  return client;
};

// Sleep utility for retries
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Enhanced connection handling with retries
const connectWithRetry = async (client: PrismaClient) => {
  while (connectionAttempts < MAX_RETRIES) {
    try {
      await client.$connect();
      console.log("✅ Database connection established successfully");
      globalThis.databaseConnected = true;
      return;
    } catch (error) {
      connectionAttempts++;
      console.warn(
        `⚠️  Database connection attempt ${connectionAttempts}/${MAX_RETRIES} failed:`,
        error instanceof Error ? error.message : error
      );

      if (connectionAttempts < MAX_RETRIES) {
        console.log(`🔄 Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
      } else {
        console.error(
          "❌ Database connection failed after",
          MAX_RETRIES,
          "attempts"
        );
        console.error("⚠️  Server will start but database operations will fail");
        console.error(
          "💡 Tip: Make sure PostgreSQL is running and DATABASE_URL is correct"
        );
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
const initializeDatabase = () => {
  const client = createPrismaClient();

  // Attempt connection asynchronously (non-blocking)
  connectWithRetry(client).catch((error) => {
    console.error("🚨 Fatal database connection error:", error);
  });

  return client;
};

export const database = globalThis.prisma ?? initializeDatabase();

// Prevent hot reload from creating new instances in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = database;
}

// Helper to check database connection status
export const isDatabaseConnected = () => globalThis.databaseConnected ?? false;

// Re-export as both database and prisma for compatibility
export const prisma = database;
export default database;
