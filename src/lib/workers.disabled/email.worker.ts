/**
 * Email Worker
 *
 * Processes email jobs from the Bull queue.
 * Handles job execution, error handling, retry logic, and database logging.
 *
 * @module lib/workers/email.worker
 */

import { database } from "@/lib/database";
import { EmailJobData, emailQueue } from "@/lib/queue/email.queue";
import { emailService } from "@/lib/services/email.service";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { EmailStatus } from "@prisma/client";

import { logger } from '@/lib/monitoring/logger';

import type { Job } from "bull";

// ============================================
// WORKER CONFIGURATION
// ============================================

/**
 * Number of concurrent jobs to process
 */
const CONCURRENCY = parseInt(process.env.EMAIL_WORKER_CONCURRENCY || "5");

/**
 * Job timeout in milliseconds (2 minutes)
 */
const JOB_TIMEOUT = parseInt(process.env.EMAIL_WORKER_TIMEOUT || "120000");

// ============================================
// JOB PROCESSOR
// ============================================

/**
 * Process email job
 *
 * @param job - Bull job containing email data
 * @returns Job result
 */
async function processEmailJob(job: Job<EmailJobData>) {
  const tracer = trace.getTracer("email-worker");

  return await tracer.startActiveSpan("processEmailJob", async (span) => {
    span.setAttributes({
      "job.id": job.id.toString(),
      "job.attempt": job.attemptsMade + 1,
      "email.type": job.data.emailType || "OTHER",
      "email.recipient": job.data.emailOptions.to,
      "email.priority": job.data.emailOptions.priority || "normal",
    });

    const startTime = Date.now();

    try {
      // Update job progress
      await job.progress(10);

      // Update database status to SENDING
      if (job.data.userId || job.id) {
        await database.emailLog.updateMany({
          where: { jobId: job.id.toString() },
          data: {
            status: EmailStatus.SENT,
            sentAt: new Date(),
            attemptCount: job.attemptsMade,
          },
        });
      }

      await job.progress(20);

      // Send email via email service
      logger.info(
        `📧 Sending email to ${job.data.emailOptions.to} (Job: ${job.id})`,
      );
      const result = await emailService.sendEmail(job.data.emailOptions);

      await job.progress(80);

      // Update database with result
      if (job.data.userId || job.id) {
        await database.emailLog.updateMany({
          where: { jobId: job.id.toString() },
          data: {
            status: result.success ? EmailStatus.SENT : EmailStatus.FAILED,
            sentAt: result.success ? new Date() : undefined,
            failedAt: result.success ? undefined : new Date(),
            errorMessage: result.error,
            attemptCount: job.attemptsMade,
          },
        });
      }

      await job.progress(100);

      // Calculate duration
      const duration = Date.now() - startTime;

      if (result.success) {
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttributes({
          "email.message_id": result.messageId || "unknown",
          "job.duration": duration,
        });

        logger.info(
          `✅ Email sent successfully to ${job.data.emailOptions.to} (${duration}ms)`,
        );

        return {
          success: true,
          messageId: result.messageId,
          duration,
        };
      } else {
        throw new Error(result.error || "Email send failed");
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      // Update database status to FAILED
      if (job.data.userId || job.id) {
        await database.emailLog.updateMany({
          where: { jobId: job.id.toString() },
          data: {
            status: EmailStatus.FAILED,
            failedAt: new Date(),
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            attemptCount: job.attemptsMade,
            lastAttemptAt: new Date(),
          },
        });
      }

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.setAttributes({
        "job.duration": duration,
        "job.error": error instanceof Error ? error.message : "Unknown error",
      });

      logger.error(`❌ Email failed to ${job.data.emailOptions.to} (Job: ${job.id}, Attempt: ${job.attemptsMade + 1
        }):`, {
        error: error instanceof Error ? error.message : String(error)
      });

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
 * Start email worker
 */
export function startEmailWorker() {
  logger.info(`🚀 Starting email worker with concurrency: ${CONCURRENCY}`);

  // Process jobs from queue
  emailQueue.process(CONCURRENCY, async (job) => {
    return await processEmailJob(job);
  });

  // Event listeners
  emailQueue.on("completed", (job, result) => {
    logger.info(`✅ Job ${job.id} completed:`, {
      recipient: job.data.emailOptions.to,
      type: job.data.emailType,
      duration: result.duration,
      messageId: result.messageId,
    });
  });

  emailQueue.on("failed", (job, error) => {
    logger.error(`❌ Job ${job?.id} failed:`, {
      recipient: job?.data?.emailOptions?.to,
      type: job?.data?.emailType,
      attempt: job?.attemptsMade,
      error: error.message,
    });
  });

  emailQueue.on("stalled", (job) => {
    logger.warn(`⚠️ Job ${job.id} stalled:`, {
      recipient: job.data.emailOptions.to,
      type: job.data.emailType,
    });
  });

  emailQueue.on("error", (error) => {
    logger.error("❌ Worker error:", {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  logger.info("✅ Email worker started successfully");
}

/**
 * Stop email worker gracefully
 */
export async function stopEmailWorker() {
  logger.info("Stopping email worker...");

  try {
    await emailQueue.close();
    logger.info("✅ Email worker stopped successfully");
  } catch (error) {
    logger.error("Failed to stop email worker:", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

if (process.env.NODE_ENV !== "test") {
  // Handle process termination
  process.on("SIGTERM", async () => {
    logger.info("Received SIGTERM, shutting down worker...");
    await stopEmailWorker();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.info("Received SIGINT, shutting down worker...");
    await stopEmailWorker();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on("uncaughtException", async (error) => {
    logger.error("Uncaught exception:", {
      error: error instanceof Error ? error.message : String(error),
    });
    await stopEmailWorker();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason, promise) => {
    logger.error("Unhandled rejection at:", promise, "reason:", reason);
    await stopEmailWorker();
    process.exit(1);
  });
}

// ============================================
// EXPORTS
// ============================================

export default {
  start: startEmailWorker,
  stop: stopEmailWorker,
};

// Auto-start worker if this file is run directly
if (require.main === module) {
  logger.info("📧 Email Worker Process");
  logger.info("========================");
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`Concurrency: ${CONCURRENCY}`);
  logger.info(`Timeout: ${JOB_TIMEOUT}ms`);
  logger.info("========================\n");

  startEmailWorker();
}
