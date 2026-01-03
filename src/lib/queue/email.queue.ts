/**
 * Email Queue Service
 *
 * Background job processing for email delivery using Bull and Redis.
 * Implements retry logic, job tracking, and integration with EmailLog.
 *
 * @module lib/queue/email.queue
 */

import { database } from "@/lib/database";
import { EmailOptions, EmailPriority } from "@/lib/services/email.service";
import { EmailStatus, EmailType } from "@prisma/client";
import Queue, { Job, JobOptions } from "bull";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface EmailJobData {
  emailOptions: EmailOptions;
  userId?: string;
  emailType?: EmailType;
  metadata?: Record<string, any>;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

// ============================================
// QUEUE CONFIGURATION
// ============================================

/**
 * Redis connection configuration from environment variables
 */
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

/**
 * Priority mapping for Bull queue
 * Lower numbers = higher priority
 */
const PRIORITY_MAP: Record<EmailPriority, number> = {
  [EmailPriority.HIGH]: 1, // Highest priority (security alerts, password resets, order confirmations)
  [EmailPriority.NORMAL]: 5, // Normal priority (status updates)
  [EmailPriority.LOW]: 7, // Low priority (marketing emails)
  [EmailPriority.URGENT]: 0, // Urgent priority
};

/**
 * Default job options for email queue
 */
const defaultJobOptions: JobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000, // Start with 2 seconds
  },
  removeOnComplete: {
    age: 7 * 24 * 60 * 60, // Keep completed jobs for 7 days
    count: 100, // Keep last 100 completed jobs
  },
  removeOnFail: {
    age: 30 * 24 * 60 * 60, // Keep failed jobs for 30 days
    count: 200, // Keep last 200 failed jobs
  },
};

// ============================================
// QUEUE INSTANCE
// ============================================

/**
 * Email queue instance
 * Handles background processing of email jobs
 */
export const emailQueue = new Queue<EmailJobData>("email-notifications", {
  redis: redisConfig,
  defaultJobOptions,
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 60000, // Check for stalled jobs every 60 seconds
    maxStalledCount: 2, // Retry stalled jobs twice
  },
});

// ============================================
// QUEUE METHODS
// ============================================

/**
 * Add email to queue for background processing
 *
 * @param emailOptions - Email configuration and content
 * @param userId - Optional user ID for tracking
 * @param emailType - Type of email for categorization
 * @param metadata - Additional metadata for logging
 * @returns Job ID
 */
export async function enqueueEmail(
  emailOptions: EmailOptions,
  userId?: string,
  emailType?: EmailType,
  metadata?: Record<string, any>,
): Promise<string> {
  try {
    // Generate unique job ID
    const jobId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Determine priority
    const priority = PRIORITY_MAP[emailOptions.priority || EmailPriority.NORMAL];

    // Add job to queue
    const job = await emailQueue.add(
      {
        emailOptions,
        userId,
        emailType: emailType || EmailType.OTHER,
        metadata,
      },
      {
        jobId,
        priority,
      },
    );

    // Create database log entry
    await database.emailLog.create({
      data: {
        userId,
        recipient: Array.isArray(emailOptions.to)
          ? emailOptions.to[0] || emailOptions.to.join(", ")
          : emailOptions.to,
        emailType: emailType || EmailType.OTHER,
        subject: emailOptions.subject,

        status: EmailStatus.QUEUED,
        jobId: job.id.toString(),
        queueName: emailQueue.name,
        metadata: metadata || {},
      },
    });

    return job.id.toString();
  } catch (error) {
    console.error("Failed to enqueue email:", error);
    throw error;
  }
}

/**
 * Get queue statistics
 *
 * @returns Current queue stats
 */
export async function getQueueStats(): Promise<QueueStats> {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  } catch (error) {
    console.error("Failed to get queue stats:", error);
    throw error;
  }
}

/**
 * Retry a failed job
 *
 * @param jobId - Job ID to retry
 * @returns True if job was retried
 */
export async function retryFailedJob(jobId: string): Promise<boolean> {
  try {
    const job = await emailQueue.getJob(jobId);

    if (!job) {
      return false;
    }

    const isFailed = await job.isFailed();
    if (isFailed) {
      await job.retry();

      // Update database log
      await database.emailLog.updateMany({
        where: { jobId },
        data: {
          status: EmailStatus.QUEUED,
          lastAttemptAt: new Date(),
        },
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to retry job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Get job details by ID
 *
 * @param jobId - Job ID
 * @returns Job instance or null
 */
export async function getJob(jobId: string): Promise<Job<EmailJobData> | null> {
  try {
    return await emailQueue.getJob(jobId);
  } catch (error) {
    console.error(`Failed to get job ${jobId}:`, error);
    return null;
  }
}

/**
 * Remove a job from the queue
 *
 * @param jobId - Job ID to remove
 * @returns True if job was removed
 */
export async function removeJob(jobId: string): Promise<boolean> {
  try {
    const job = await emailQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to remove job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Clean old completed and failed jobs
 *
 * @param completedAge - Age in milliseconds for completed jobs (default: 7 days)
 * @param failedAge - Age in milliseconds for failed jobs (default: 30 days)
 */
export async function cleanOldJobs(
  completedAge: number = 7 * 24 * 60 * 60 * 1000,
  failedAge: number = 30 * 24 * 60 * 60 * 1000,
): Promise<void> {
  try {
    await emailQueue.clean(completedAge, "completed");
    await emailQueue.clean(failedAge, "failed");

    console.log("✅ Old jobs cleaned successfully");
  } catch (error) {
    console.error("Failed to clean old jobs:", error);
    throw error;
  }
}

/**
 * Pause the queue
 */
export async function pauseQueue(): Promise<void> {
  try {
    await emailQueue.pause();
    console.log("⏸️  Email queue paused");
  } catch (error) {
    console.error("Failed to pause queue:", error);
    throw error;
  }
}

/**
 * Resume the queue
 */
export async function resumeQueue(): Promise<void> {
  try {
    await emailQueue.resume();
    console.log("▶️  Email queue resumed");
  } catch (error) {
    console.error("Failed to resume queue:", error);
    throw error;
  }
}

/**
 * Check if queue is healthy
 *
 * @returns True if queue is operational
 */
export async function isQueueHealthy(): Promise<boolean> {
  try {
    const stats = await getQueueStats();
    const isPaused = await emailQueue.isPaused();

    // Queue is healthy if:
    // - Not paused
    // - Active + waiting jobs < 1000 (not overloaded)
    // - Can get stats successfully
    return !isPaused && stats.active + stats.waiting < 1000;
  } catch (error) {
    console.error("Queue health check failed:", error);
    return false;
  }
}

/**
 * Get failed jobs for inspection
 *
 * @param limit - Maximum number of failed jobs to return
 * @returns Array of failed jobs
 */
export async function getFailedJobs(
  limit: number = 50,
): Promise<Job<EmailJobData>[]> {
  try {
    return await emailQueue.getFailed(0, limit - 1);
  } catch (error) {
    console.error("Failed to get failed jobs:", error);
    throw error;
  }
}

/**
 * Get waiting jobs
 *
 * @param limit - Maximum number of waiting jobs to return
 * @returns Array of waiting jobs
 */
export async function getWaitingJobs(
  limit: number = 50,
): Promise<Job<EmailJobData>[]> {
  try {
    return await emailQueue.getWaiting(0, limit - 1);
  } catch (error) {
    console.error("Failed to get waiting jobs:", error);
    throw error;
  }
}

// ============================================
// QUEUE EVENT LISTENERS (for monitoring)
// ============================================

emailQueue.on("error", (error) => {
  console.error("❌ Email queue error:", error);
});

emailQueue.on("waiting", (jobId) => {
  console.log(`⏳ Email job ${jobId} is waiting`);
});

emailQueue.on("active", (job) => {
  console.log(`🔄 Email job ${job.id} started processing`);
});

emailQueue.on("stalled", (job) => {
  console.warn(`⚠️ Email job ${job.id} stalled`);
});

emailQueue.on("progress", (job, progress) => {
  console.log(`📊 Email job ${job.id} progress: ${progress}%`);
});

emailQueue.on("completed", (job, result) => {
  console.log(`✅ Email job ${job.id} completed successfully`);
});

emailQueue.on("failed", (job, error) => {
  console.error(`❌ Email job ${job?.id} failed:`, error.message);
});

emailQueue.on("paused", () => {
  console.log("⏸️  Email queue paused");
});

emailQueue.on("resumed", () => {
  console.log("▶️  Email queue resumed");
});

emailQueue.on("cleaned", (jobs, type) => {
  console.log(`🧹 Cleaned ${jobs.length} ${type} jobs from queue`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

/**
 * Gracefully close the queue
 */
export async function closeQueue(): Promise<void> {
  try {
    await emailQueue.close();
    console.log("👋 Email queue closed gracefully");
  } catch (error) {
    console.error("Failed to close queue:", error);
    throw error;
  }
}

// Handle process termination
if (process.env.NODE_ENV !== "test") {
  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, shutting down email queue...");
    await closeQueue();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("Received SIGINT, shutting down email queue...");
    await closeQueue();
    process.exit(0);
  });
}

// ============================================
// EXPORTS
// ============================================

export default emailQueue;
