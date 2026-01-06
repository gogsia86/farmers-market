/**
 * 🚀 APPLICATION INITIALIZATION
 * Bootstrap the application with environment validation and startup checks
 *
 * @module init
 * @version 1.0.0
 *
 * Features:
 * - Environment variable validation
 * - Optional service checks
 * - Startup diagnostics
 * - Agricultural consciousness activation
 */

import {

import { logger } from '@/lib/monitoring/logger';

  checkOptionalServices,
  validateEnv,
  type Env,
} from "./config/env.validation";

/**
 * Initialize application
 * Call this at the top of your main entry point (layout.tsx or middleware.ts)
 */
export function initializeApp(): Env {
  // Skip validation in test environment (handled by jest.setup.js)
  if (process.env.NODE_ENV === "test") {
    return process.env as Env;
  }

  logger.info("🌾 Initializing Farmers Market Platform...\n");

  // ✅ Step 1: Validate required environment variables
  const env = validateEnv();

  // ✅ Step 2: Check optional services
  checkOptionalServices(env);

  // ✅ Step 3: Log startup info
  logger.info("📊 Environment:", env.NODE_ENV);
  logger.info(
    "🗄️  Database:",
    env.DATABASE_URL?.split("@")[1]?.split("?")[0] || "configured",
  );
  logger.info("🔐 Auth:", env.NEXTAUTH_URL);

  logger.info("\n✨ Application initialized successfully!\n");

  return env;
}

/**
 * Initialize database connection
 * Verifies Prisma can connect to the database
 */
export async function initializeDatabase(): Promise<void> {
  if (process.env.NODE_ENV === "test") {
    return; // Skip in tests
  }

  try {
    const { database } = await import("./database");

    // Test connection
    await database.$queryRaw`SELECT 1`;

    logger.info("✅ Database connection verified");
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    throw new Error("Failed to connect to database");
  }
}

/**
 * Graceful shutdown handler
 * Cleanup resources on process termination
 */
export async function shutdownApp(): Promise<void> {
  logger.info("\n🌙 Shutting down Farmers Market Platform gracefully...");

  try {
    // Close database connection
    const { database } = await import("./database");
    await database.$disconnect();
    logger.info("✅ Database disconnected");
  } catch (error) {
    logger.error("⚠️  Error during shutdown:", error);
  }

  logger.info("👋 Shutdown complete\n");
}

// Register shutdown handlers
if (typeof process !== "undefined") {
  process.on("SIGTERM", async () => {
    await shutdownApp();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    await shutdownApp();
    process.exit(0);
  });
}

// Auto-initialize on import (only in non-test environments)
let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env && process.env.NODE_ENV !== "test") {
    _env = initializeApp();
  }
  return _env || (process.env as Env);
}

// Export singleton
export default {
  initialize: initializeApp,
  initializeDatabase,
  shutdown: shutdownApp,
  getEnv,
};
