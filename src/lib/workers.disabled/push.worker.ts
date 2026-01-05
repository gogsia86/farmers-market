/**
 * Push Notification Worker
 *
 * Processes push notification jobs from the Bull queue.
 * Handles job execution, error handling, retry logic, and database logging.
 *
 * @module lib/workers/push.worker
 */

import { database } from "@/lib/database";
import { PushJobData, pushQueue } from "@/lib/queue/notification.queue";
import { pushNotificationService } from "@/lib/services/push.service";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import type { Job } from "bull";

// ============================================
// WORKER CONFIGURATION
// ============================================

/**
 * Number of concurrent jobs to process
 */
const CONCURRENCY = parseInt(process.env.PUSH_WORKER_CONCURRENCY || "5");

/**
 * Job timeout in milliseconds (30 seconds)
 */
const JOB_TIMEOUT = parseInt(process.env.PUSH_WORKER_TIMEOUT || "30000");

// ============================================
// JOB PROCESSOR
// ============================================

/**
 * Process push notification job
 *
 * @param job - Bull job containing push notification data
 * @returns Job result
 */
async function processPushJob(job: Job<PushJobData>) {
  const tracer = trace.getTracer("push-worker");

  return await tracer.startActiveSpan("processPushJob", async (span) => {
    span.setAttributes({
      "job.id": job.id.toString(),
      "job.attempt": job.attemptsMade + 1,
      "push.user_id": job.data.userId,
      "push.title": job.data.title,
      "push.priority": job.data.priority || "normal",
    });

    const startTime = Date.now();

    try {
      // Update job progress
      await job.progress(10);

      // Send push notification via push service
      console.log(
        `🔔 Sending push notification to user ${job.data.userId} (Job: ${job.id})`
      );

      await job.progress(30);

      const result = await pushNotificationService.sendPushNotification({
        userId: job.data.userId,
        title: job.data.title,
        body: job.data.body,
        data: job.data.data,
        badge: job.data.badge,
        sound: job.data.sound,
        priority: job.data.priority,
        notificationId: job.data.notificationId,
      });

      await job.progress(80);

      // Update notification status in database if notificationId provided
      if (job.data.notificationId && result.success) {
        await database.notification.update({
          where: { id: job.data.notificationId },
          data: {
            sentAt: new Date(),
          },
        });
      }

      await job.progress(100);

      // Calculate duration
      const duration = Date.now() - startTime;

      if (result.success) {
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttributes({
          "push.message_id": result.messageId || "unknown",
          "push.failed_tokens": result.failedTokens?.length || 0,
          "job.duration": duration,
        });

        console.log(
          `✅ Push notification sent successfully to user ${job.data.userId} (${duration}ms)`
        );

        return {
          success: true,
          messageId: result.messageId,
          failedTokens: result.failedTokens,
          duration,
        };
      } else {
        throw new Error(result.error || "Push notification send failed");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Note: Notification model doesn't have failedAt field
      // Failed notifications are tracked in PushNotificationLog table
      if (job.data.notificationId) {
        console.error(`Notification ${job.data.notificationId} push delivery failed: ${errorMessage}`);
      }

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: errorMessage,
      });
      span.setAttributes({
        "job.duration": duration,
        "job.error": errorMessage,
      });

      console.error(
        `❌ Push notification failed to user ${job.data.userId} (Job: ${job.id}, Attempt: ${job.attemptsMade + 1
        }):`,
        error
      );

      throw error;
    } finally {
      span.end();
    }
  });
}

// ============================================
// WORKER INITIALIZATION
// ============================================

/**
 * Start push notification worker
 */
export function startPushWorker() {
  console.log(`🚀 Starting push notification worker with concurrency: ${CONCURRENCY}`);

  // Process jobs from queue
  pushQueue.process(CONCURRENCY, async (job) => {
    return await processPushJob(job);
  });

  // Event listeners
  pushQueue.on("completed", (job, result) => {
    console.log(`✅ Push job ${job.id} completed:`, {
      userId: job.data.userId,
      title: job.data.title,
      duration: result.duration,
      messageId: result.messageId,
      failedTokens: result.failedTokens?.length || 0,
    });
  });

  pushQueue.on("failed", (job, error) => {
    console.error(`❌ Push job ${job?.id} failed:`, {
      userId: job?.data?.userId || "unknown",
      title: job?.data?.title || "unknown",
      attempt: job?.attemptsMade,
      error: error.message,
    });
  });

  pushQueue.on("stalled", (job) => {
    console.warn(`⚠️ Push job ${job.id} stalled:`, {
      userId: job.data.userId,
      title: job.data.title,
    });
  });

  pushQueue.on("error", (error) => {
    console.error("❌ Push worker error:", error);
  });

  console.log("✅ Push notification worker started successfully");
}

/**
 * Stop push notification worker gracefully
 */
export async function stopPushWorker() {
  console.log("Stopping push notification worker...");

  try {
    await pushQueue.close();
    console.log("✅ Push notification worker stopped successfully");
  } catch (error) {
    console.error("Failed to stop push notification worker:", error);
    throw error;
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

if (process.env.NODE_ENV !== "test") {
  // Handle process termination
  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, shutting down push notification worker...");
    await stopPushWorker();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("Received SIGINT, shutting down push notification worker...");
    await stopPushWorker();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on("uncaughtException", async (error) => {
    console.error("Uncaught exception:", error);
    await stopPushWorker();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
    await stopPushWorker();
    process.exit(1);
  });
}

// ============================================
// EXPORTS
// ============================================

export default {
  start: startPushWorker,
  stop: stopPushWorker,
};

// Auto-start worker if this file is run directly
if (require.main === module) {
  console.log("🔔 Push Notification Worker Process");
  console.log("========================");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Timeout: ${JOB_TIMEOUT}ms`);
  console.log("========================\n");

  startPushWorker();
}
