/**
 * SMS Worker
 *
 * Processes SMS jobs from the Bull queue.
 * Handles job execution, error handling, retry logic, and database logging.
 *
 * @module lib/workers/sms.worker
 */

import { database } from "@/lib/database";
import { SMSJobData, smsQueue } from "@/lib/queue/notification.queue";
import { smsService } from "@/lib/services/sms.service";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import type { Job } from "bull";

// ============================================
// WORKER CONFIGURATION
// ============================================

/**
 * Number of concurrent jobs to process
 */
const CONCURRENCY = parseInt(process.env.SMS_WORKER_CONCURRENCY || "3");

/**
 * Job timeout in milliseconds (30 seconds)
 */
const JOB_TIMEOUT = parseInt(process.env.SMS_WORKER_TIMEOUT || "30000");

// ============================================
// JOB PROCESSOR
// ============================================

/**
 * Process SMS job
 *
 * @param job - Bull job containing SMS data
 * @returns Job result
 */
async function processSMSJob(job: Job<SMSJobData>) {
  const tracer = trace.getTracer("sms-worker");

  return await tracer.startActiveSpan("processSMSJob", async (span) => {
    span.setAttributes({
      "job.id": job.id.toString(),
      "job.attempt": job.attemptsMade + 1,
      "sms.to": maskPhoneNumber(job.data.phoneNumber),
      "sms.has_user": !!job.data.userId,
    });

    const startTime = Date.now();

    try {
      // Update job progress
      await job.progress(10);

      // Send SMS via SMS service
      console.log(
        `📱 Sending SMS to ${maskPhoneNumber(job.data.phoneNumber)} (Job: ${job.id})`
      );

      await job.progress(30);

      const result = await smsService.sendSMS({
        to: job.data.phoneNumber,
        message: job.data.message,
        userId: job.data.userId,
        metadata: {
          ...job.data.metadata,
          jobId: job.id.toString(),
          queueName: smsQueue.name,
        },
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
          "sms.message_id": result.messageId || "unknown",
          "job.duration": duration,
        });

        console.log(
          `✅ SMS sent successfully to ${maskPhoneNumber(job.data.phoneNumber)} (${duration}ms)`
        );

        return {
          success: true,
          messageId: result.messageId,
          duration,
        };
      } else {
        throw new Error(result.error || "SMS send failed");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Note: Notification model doesn't have failedAt field
      // Failed notifications are tracked in SMSLog table
      if (job.data.notificationId) {
        console.error(`Notification ${job.data.notificationId} SMS delivery failed: ${errorMessage}`);
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
        `❌ SMS failed to ${maskPhoneNumber(job.data.phoneNumber)} (Job: ${job.id}, Attempt: ${job.attemptsMade + 1
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
// HELPER FUNCTIONS
// ============================================

/**
 * Mask phone number for logging (show only last 4 digits)
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return "****";
  return `****${phone.slice(-4)}`;
}

// ============================================
// WORKER INITIALIZATION
// ============================================

/**
 * Start SMS worker
 */
export function startSMSWorker() {
  console.log(`🚀 Starting SMS worker with concurrency: ${CONCURRENCY}`);

  // Process jobs from queue
  smsQueue.process(CONCURRENCY, async (job) => {
    return await processSMSJob(job);
  });

  // Event listeners
  smsQueue.on("completed", (job, result) => {
    console.log(`✅ SMS job ${job.id} completed:`, {
      recipient: maskPhoneNumber(job.data.phoneNumber),
      duration: result.duration,
      messageId: result.messageId,
    });
  });

  smsQueue.on("failed", (job, error) => {
    console.error(`❌ SMS job ${job?.id} failed:`, {
      recipient: job?.data?.phoneNumber
        ? maskPhoneNumber(job.data.phoneNumber)
        : "unknown",
      attempt: job?.attemptsMade,
      error: error.message,
    });
  });

  smsQueue.on("stalled", (job) => {
    console.warn(`⚠️ SMS job ${job.id} stalled:`, {
      recipient: maskPhoneNumber(job.data.phoneNumber),
    });
  });

  smsQueue.on("error", (error) => {
    console.error("❌ SMS worker error:", error);
  });

  console.log("✅ SMS worker started successfully");
}

/**
 * Stop SMS worker gracefully
 */
export async function stopSMSWorker() {
  console.log("Stopping SMS worker...");

  try {
    await smsQueue.close();
    console.log("✅ SMS worker stopped successfully");
  } catch (error) {
    console.error("Failed to stop SMS worker:", error);
    throw error;
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

if (process.env.NODE_ENV !== "test") {
  // Handle process termination
  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, shutting down SMS worker...");
    await stopSMSWorker();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("Received SIGINT, shutting down SMS worker...");
    await stopSMSWorker();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on("uncaughtException", async (error) => {
    console.error("Uncaught exception:", error);
    await stopSMSWorker();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
    await stopSMSWorker();
    process.exit(1);
  });
}

// ============================================
// EXPORTS
// ============================================

export default {
  start: startSMSWorker,
  stop: stopSMSWorker,
};

// Auto-start worker if this file is run directly
if (require.main === module) {
  console.log("📱 SMS Worker Process");
  console.log("========================");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Timeout: ${JOB_TIMEOUT}ms`);
  console.log("========================\n");

  startSMSWorker();
}
