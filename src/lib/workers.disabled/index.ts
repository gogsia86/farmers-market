/**
 * Master Worker Process
 *
 * Starts and manages all background workers (email, SMS, push notifications).
 * Handles graceful shutdown and provides health monitoring.
 *
 * @module lib/workers
 */

import emailWorker from "./email.worker";
import pushWorker from "./push.worker";
import smsWorker from "./sms.worker";

import { logger } from '@/lib/monitoring/logger';

// ============================================
// TYPES
// ============================================

interface WorkerStatus {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// ============================================
// WORKER MANAGEMENT
// ============================================

let isRunning = false;
const workerStatus: WorkerStatus = {
  email: false,
  sms: false,
  push: false,
};

/**
 * Start all background workers
 */
export async function startAllWorkers(): Promise<void> {
  if (isRunning) {
    logger.warn("⚠️ Workers are already running");
    return;
  }

  logger.info("🚀 Starting all background workers...\n");

  try {
    // Start email worker
    logger.info("📧 Starting email worker...");
    emailWorker.start();
    workerStatus.email = true;
    logger.info("✅ Email worker started\n");

    // Start SMS worker
    logger.info("📱 Starting SMS worker...");
    smsWorker.start();
    workerStatus.sms = true;
    logger.info("✅ SMS worker started\n");

    // Start push notification worker
    logger.info("🔔 Starting push notification worker...");
    pushWorker.start();
    workerStatus.push = true;
    logger.info("✅ Push notification worker started\n");

    isRunning = true;
    logger.info("✅ All background workers started successfully!\n");
  } catch (error) {
    logger.error("❌ Failed to start workers:", {
      error: error instanceof Error ? error.message : String(error),
    });
    await stopAllWorkers();
    throw error;
  }
}

/**
 * Stop all background workers gracefully
 */
export async function stopAllWorkers(): Promise<void> {
  if (!isRunning) {
    logger.warn("⚠️ Workers are not running");
    return;
  }

  logger.info("🛑 Stopping all background workers...\n");

  const stopPromises: Promise<void>[] = [];

  // Stop email worker
  if (workerStatus.email) {
    logger.info("📧 Stopping email worker...");
    stopPromises.push(
      emailWorker.stop().then(() => {
        workerStatus.email = false;
        logger.info("✅ Email worker stopped");
      })
    );
  }

  // Stop SMS worker
  if (workerStatus.sms) {
    logger.info("📱 Stopping SMS worker...");
    stopPromises.push(
      smsWorker.stop().then(() => {
        workerStatus.sms = false;
        logger.info("✅ SMS worker stopped");
      })
    );
  }

  // Stop push notification worker
  if (workerStatus.push) {
    logger.info("🔔 Stopping push notification worker...");
    stopPromises.push(
      pushWorker.stop().then(() => {
        workerStatus.push = false;
        logger.info("✅ Push notification worker stopped");
      })
    );
  }

  await Promise.all(stopPromises);

  isRunning = false;
  logger.info("\n✅ All background workers stopped successfully!\n");
}

/**
 * Get status of all workers
 */
export function getWorkerStatus(): WorkerStatus {
  return { ...workerStatus };
}

/**
 * Check if all workers are running
 */
export function areWorkersRunning(): boolean {
  return isRunning;
}

/**
 * Check if workers are healthy
 */
export function areWorkersHealthy(): boolean {
  return (
    isRunning &&
    workerStatus.email &&
    workerStatus.sms &&
    workerStatus.push
  );
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

if (process.env.NODE_ENV !== "test") {
  // Handle process termination
  process.on("SIGTERM", async () => {
    logger.info("\n🛑 Received SIGTERM, shutting down workers gracefully...");
    await stopAllWorkers();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.info("\n🛑 Received SIGINT, shutting down workers gracefully...");
    await stopAllWorkers();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on("uncaughtException", async (error) => {
    logger.error("❌ Uncaught exception:", {
      error: error instanceof Error ? error.message : String(error),
    });
    await stopAllWorkers();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason, promise) => {
    logger.error("❌ Unhandled rejection at:", promise, "reason:", reason);
    await stopAllWorkers();
    process.exit(1);
  });
}

// ============================================
// EXPORTS
// ============================================

export default {
  startAll: startAllWorkers,
  stopAll: stopAllWorkers,
  getStatus: getWorkerStatus,
  areRunning: areWorkersRunning,
  areHealthy: areWorkersHealthy,
};

// ============================================
// AUTO-START (if run directly)
// ============================================

if (require.main === module) {
  logger.info("╔════════════════════════════════════════════════╗");
  logger.info("║   🌾 Farmers Market Background Workers       ║");
  logger.info("╚════════════════════════════════════════════════╝");
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`Node Version: ${process.version}`);
  logger.info(`PID: ${process.pid}`);
  logger.info("════════════════════════════════════════════════\n");

  startAllWorkers().catch((error) => {
    logger.error("Failed to start workers:", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });
}
