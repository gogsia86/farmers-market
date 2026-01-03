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
    console.warn("⚠️ Workers are already running");
    return;
  }

  console.log("🚀 Starting all background workers...\n");

  try {
    // Start email worker
    console.log("📧 Starting email worker...");
    emailWorker.start();
    workerStatus.email = true;
    console.log("✅ Email worker started\n");

    // Start SMS worker
    console.log("📱 Starting SMS worker...");
    smsWorker.start();
    workerStatus.sms = true;
    console.log("✅ SMS worker started\n");

    // Start push notification worker
    console.log("🔔 Starting push notification worker...");
    pushWorker.start();
    workerStatus.push = true;
    console.log("✅ Push notification worker started\n");

    isRunning = true;
    console.log("✅ All background workers started successfully!\n");
  } catch (error) {
    console.error("❌ Failed to start workers:", error);
    await stopAllWorkers();
    throw error;
  }
}

/**
 * Stop all background workers gracefully
 */
export async function stopAllWorkers(): Promise<void> {
  if (!isRunning) {
    console.warn("⚠️ Workers are not running");
    return;
  }

  console.log("🛑 Stopping all background workers...\n");

  const stopPromises: Promise<void>[] = [];

  // Stop email worker
  if (workerStatus.email) {
    console.log("📧 Stopping email worker...");
    stopPromises.push(
      emailWorker.stop().then(() => {
        workerStatus.email = false;
        console.log("✅ Email worker stopped");
      })
    );
  }

  // Stop SMS worker
  if (workerStatus.sms) {
    console.log("📱 Stopping SMS worker...");
    stopPromises.push(
      smsWorker.stop().then(() => {
        workerStatus.sms = false;
        console.log("✅ SMS worker stopped");
      })
    );
  }

  // Stop push notification worker
  if (workerStatus.push) {
    console.log("🔔 Stopping push notification worker...");
    stopPromises.push(
      pushWorker.stop().then(() => {
        workerStatus.push = false;
        console.log("✅ Push notification worker stopped");
      })
    );
  }

  await Promise.all(stopPromises);

  isRunning = false;
  console.log("\n✅ All background workers stopped successfully!\n");
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
    console.log("\n🛑 Received SIGTERM, shutting down workers gracefully...");
    await stopAllWorkers();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("\n🛑 Received SIGINT, shutting down workers gracefully...");
    await stopAllWorkers();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on("uncaughtException", async (error) => {
    console.error("❌ Uncaught exception:", error);
    await stopAllWorkers();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason, promise) => {
    console.error("❌ Unhandled rejection at:", promise, "reason:", reason);
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
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   🌾 Farmers Market Background Workers       ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Node Version: ${process.version}`);
  console.log(`PID: ${process.pid}`);
  console.log("════════════════════════════════════════════════\n");

  startAllWorkers().catch((error) => {
    console.error("Failed to start workers:", error);
    process.exit(1);
  });
}
