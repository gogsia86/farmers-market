/**
 * Notification Queue Service
 *
 * Background job processing for SMS and push notifications using Bull and Redis.
 * Implements retry logic, job tracking, and integration with Notification model.
 *
 * @module lib/queue/notification.queue
 */

import { NotificationChannel } from "@prisma/client";
import Queue, { Job, JobOptions } from "bull";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface NotificationJobData {
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, any>;
  retryCount?: number;
}

export interface SMSJobData {
  phoneNumber: string;
  message: string;
  userId?: string;
  notificationId?: string;
  metadata?: Record<string, any>;
}

export interface PushJobData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  notificationId?: string;
  badge?: number;
  sound?: string;
  priority?: "high" | "normal";
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
 * Default job options for notification queues
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
  timeout: 30000, // 30 seconds timeout per job
};

// ============================================
// QUEUE INSTANCES
// ============================================

/**
 * SMS notification queue
 */
export const smsQueue = new Queue<SMSJobData>("sms-notifications", {
  redis: redisConfig,
  defaultJobOptions,
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 60000, // Check for stalled jobs every 60 seconds
    maxStalledCount: 2, // Retry stalled jobs twice
  },
});

/**
 * Push notification queue
 */
export const pushQueue = new Queue<PushJobData>("push-notifications", {
  redis: redisConfig,
  defaultJobOptions,
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 60000, // Check for stalled jobs every 60 seconds
    maxStalledCount: 2, // Retry stalled jobs twice
  },
});

/**
 * General notification queue (for routing)
 */
export const notificationQueue = new Queue<NotificationJobData>(
  "notifications",
  {
    redis: redisConfig,
    defaultJobOptions,
    settings: {
      lockDuration: 30000,
      stalledInterval: 60000,
      maxStalledCount: 2,
    },
  }
);

// ============================================
// SMS QUEUE METHODS
// ============================================

/**
 * Add SMS to queue for background processing
 *
 * @param smsData - SMS configuration and content
 * @returns Job ID
 */
export async function enqueueSMS(smsData: SMSJobData): Promise<string> {
  try {
    // Generate unique job ID
    const jobId = `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add job to queue
    const job = await smsQueue.add(smsData, {
      jobId,
      priority: 5, // Normal priority
    });

    console.log(`📱 SMS queued: ${jobId} to ${smsData.phoneNumber}`);

    return job.id.toString();
  } catch (error) {
    console.error("Failed to enqueue SMS:", error);
    throw error;
  }
}

/**
 * Schedule SMS for future delivery
 *
 * @param smsData - SMS configuration and content
 * @param sendAt - When to send the SMS
 * @returns Job ID
 */
export async function scheduleSMS(
  smsData: SMSJobData,
  sendAt: Date
): Promise<string> {
  try {
    const delay = sendAt.getTime() - Date.now();

    if (delay <= 0) {
      return await enqueueSMS(smsData);
    }

    const jobId = `sms-scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job = await smsQueue.add(smsData, {
      jobId,
      delay,
      priority: 5,
    });

    console.log(`📅 SMS scheduled: ${jobId} for ${sendAt.toISOString()}`);

    return job.id.toString();
  } catch (error) {
    console.error("Failed to schedule SMS:", error);
    throw error;
  }
}

// ============================================
// PUSH QUEUE METHODS
// ============================================

/**
 * Add push notification to queue for background processing
 *
 * @param pushData - Push notification configuration and content
 * @returns Job ID
 */
export async function enqueuePush(pushData: PushJobData): Promise<string> {
  try {
    // Generate unique job ID
    const jobId = `push-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Determine priority based on push priority
    const priority = pushData.priority === "high" ? 1 : 5;

    // Add job to queue
    const job = await pushQueue.add(pushData, {
      jobId,
      priority,
    });

    console.log(`🔔 Push notification queued: ${jobId} for user ${pushData.userId}`);

    return job.id.toString();
  } catch (error) {
    console.error("Failed to enqueue push notification:", error);
    throw error;
  }
}

/**
 * Schedule push notification for future delivery
 *
 * @param pushData - Push notification configuration and content
 * @param sendAt - When to send the push notification
 * @returns Job ID
 */
export async function schedulePush(
  pushData: PushJobData,
  sendAt: Date
): Promise<string> {
  try {
    const delay = sendAt.getTime() - Date.now();

    if (delay <= 0) {
      return await enqueuePush(pushData);
    }

    const jobId = `push-scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const priority = pushData.priority === "high" ? 1 : 5;

    const job = await pushQueue.add(pushData, {
      jobId,
      delay,
      priority,
    });

    console.log(`📅 Push notification scheduled: ${jobId} for ${sendAt.toISOString()}`);

    return job.id.toString();
  } catch (error) {
    console.error("Failed to schedule push notification:", error);
    throw error;
  }
}

// ============================================
// NOTIFICATION QUEUE METHODS (ROUTING)
// ============================================

/**
 * Add notification to routing queue
 * This queue will determine which channels to send through
 *
 * @param notificationData - Notification data
 * @returns Job ID
 */
export async function enqueueNotification(
  notificationData: NotificationJobData
): Promise<string> {
  try {
    const jobId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job = await notificationQueue.add(notificationData, {
      jobId,
      priority: 5,
    });

    console.log(`🔄 Notification queued for routing: ${jobId}`);

    return job.id.toString();
  } catch (error) {
    console.error("Failed to enqueue notification:", error);
    throw error;
  }
}

// ============================================
// QUEUE STATISTICS
// ============================================

/**
 * Get SMS queue statistics
 */
export async function getSMSQueueStats(): Promise<QueueStats> {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      smsQueue.getWaitingCount(),
      smsQueue.getActiveCount(),
      smsQueue.getCompletedCount(),
      smsQueue.getFailedCount(),
      smsQueue.getDelayedCount(),
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
    console.error("Failed to get SMS queue stats:", error);
    throw error;
  }
}

/**
 * Get push notification queue statistics
 */
export async function getPushQueueStats(): Promise<QueueStats> {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      pushQueue.getWaitingCount(),
      pushQueue.getActiveCount(),
      pushQueue.getCompletedCount(),
      pushQueue.getFailedCount(),
      pushQueue.getDelayedCount(),
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
    console.error("Failed to get push queue stats:", error);
    throw error;
  }
}

/**
 * Get notification routing queue statistics
 */
export async function getNotificationQueueStats(): Promise<QueueStats> {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      notificationQueue.getWaitingCount(),
      notificationQueue.getActiveCount(),
      notificationQueue.getCompletedCount(),
      notificationQueue.getFailedCount(),
      notificationQueue.getDelayedCount(),
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
    console.error("Failed to get notification queue stats:", error);
    throw error;
  }
}

/**
 * Get combined queue statistics
 */
export async function getAllQueueStats(): Promise<{
  sms: QueueStats;
  push: QueueStats;
  notification: QueueStats;
}> {
  const [sms, push, notification] = await Promise.all([
    getSMSQueueStats(),
    getPushQueueStats(),
    getNotificationQueueStats(),
  ]);

  return { sms, push, notification };
}

// ============================================
// JOB MANAGEMENT
// ============================================

/**
 * Retry a failed SMS job
 */
export async function retrySMSJob(jobId: string): Promise<boolean> {
  try {
    const job = await smsQueue.getJob(jobId);
    if (!job) return false;

    const isFailed = await job.isFailed();
    if (isFailed) {
      await job.retry();
      console.log(`🔄 Retrying SMS job: ${jobId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to retry SMS job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Retry a failed push notification job
 */
export async function retryPushJob(jobId: string): Promise<boolean> {
  try {
    const job = await pushQueue.getJob(jobId);
    if (!job) return false;

    const isFailed = await job.isFailed();
    if (isFailed) {
      await job.retry();
      console.log(`🔄 Retrying push job: ${jobId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to retry push job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Get failed SMS jobs for inspection
 */
export async function getFailedSMSJobs(
  limit: number = 50
): Promise<Job<SMSJobData>[]> {
  try {
    return await smsQueue.getFailed(0, limit - 1);
  } catch (error) {
    console.error("Failed to get failed SMS jobs:", error);
    throw error;
  }
}

/**
 * Get failed push notification jobs for inspection
 */
export async function getFailedPushJobs(
  limit: number = 50
): Promise<Job<PushJobData>[]> {
  try {
    return await pushQueue.getFailed(0, limit - 1);
  } catch (error) {
    console.error("Failed to get failed push jobs:", error);
    throw error;
  }
}

// ============================================
// QUEUE HEALTH & MAINTENANCE
// ============================================

/**
 * Check if all notification queues are healthy
 */
export async function areQueuesHealthy(): Promise<{
  sms: boolean;
  push: boolean;
  notification: boolean;
  overall: boolean;
}> {
  try {
    const [smsStats, pushStats, notificationStats] = await Promise.all([
      getSMSQueueStats(),
      getPushQueueStats(),
      getNotificationQueueStats(),
    ]);

    const smsHealthy =
      !(await smsQueue.isPaused()) && smsStats.active + smsStats.waiting < 1000;
    const pushHealthy =
      !(await pushQueue.isPaused()) && pushStats.active + pushStats.waiting < 1000;
    const notificationHealthy =
      !(await notificationQueue.isPaused()) &&
      notificationStats.active + notificationStats.waiting < 1000;

    return {
      sms: smsHealthy,
      push: pushHealthy,
      notification: notificationHealthy,
      overall: smsHealthy && pushHealthy && notificationHealthy,
    };
  } catch (error) {
    console.error("Queue health check failed:", error);
    return {
      sms: false,
      push: false,
      notification: false,
      overall: false,
    };
  }
}

/**
 * Clean old jobs from all notification queues
 */
export async function cleanOldNotificationJobs(
  completedAge: number = 7 * 24 * 60 * 60 * 1000,
  failedAge: number = 30 * 24 * 60 * 60 * 1000
): Promise<void> {
  try {
    await Promise.all([
      smsQueue.clean(completedAge, "completed"),
      smsQueue.clean(failedAge, "failed"),
      pushQueue.clean(completedAge, "completed"),
      pushQueue.clean(failedAge, "failed"),
      notificationQueue.clean(completedAge, "completed"),
      notificationQueue.clean(failedAge, "failed"),
    ]);

    console.log("✅ Old notification jobs cleaned successfully");
  } catch (error) {
    console.error("Failed to clean old notification jobs:", error);
    throw error;
  }
}

/**
 * Pause all notification queues
 */
export async function pauseAllQueues(): Promise<void> {
  try {
    await Promise.all([
      smsQueue.pause(),
      pushQueue.pause(),
      notificationQueue.pause(),
    ]);
    console.log("⏸️  All notification queues paused");
  } catch (error) {
    console.error("Failed to pause queues:", error);
    throw error;
  }
}

/**
 * Resume all notification queues
 */
export async function resumeAllQueues(): Promise<void> {
  try {
    await Promise.all([
      smsQueue.resume(),
      pushQueue.resume(),
      notificationQueue.resume(),
    ]);
    console.log("▶️  All notification queues resumed");
  } catch (error) {
    console.error("Failed to resume queues:", error);
    throw error;
  }
}

// ============================================
// QUEUE EVENT LISTENERS
// ============================================

// SMS Queue Events
smsQueue.on("error", (error) => {
  console.error("❌ SMS queue error:", error);
});

smsQueue.on("completed", (job, result) => {
  console.log(`✅ SMS job ${job.id} completed`);
});

smsQueue.on("failed", (job, error) => {
  console.error(`❌ SMS job ${job?.id} failed:`, error.message);
});

smsQueue.on("stalled", (job) => {
  console.warn(`⚠️ SMS job ${job.id} stalled`);
});

// Push Queue Events
pushQueue.on("error", (error) => {
  console.error("❌ Push queue error:", error);
});

pushQueue.on("completed", (job, result) => {
  console.log(`✅ Push job ${job.id} completed`);
});

pushQueue.on("failed", (job, error) => {
  console.error(`❌ Push job ${job?.id} failed:`, error.message);
});

pushQueue.on("stalled", (job) => {
  console.warn(`⚠️ Push job ${job.id} stalled`);
});

// Notification Queue Events
notificationQueue.on("error", (error) => {
  console.error("❌ Notification queue error:", error);
});

notificationQueue.on("completed", (job, result) => {
  console.log(`✅ Notification job ${job.id} completed`);
});

notificationQueue.on("failed", (job, error) => {
  console.error(`❌ Notification job ${job?.id} failed:`, error.message);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

/**
 * Gracefully close all notification queues
 */
export async function closeAllQueues(): Promise<void> {
  try {
    await Promise.all([
      smsQueue.close(),
      pushQueue.close(),
      notificationQueue.close(),
    ]);
    console.log("👋 All notification queues closed gracefully");
  } catch (error) {
    console.error("Failed to close queues:", error);
    throw error;
  }
}

// Handle process termination
if (process.env.NODE_ENV !== "test") {
  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, shutting down notification queues...");
    await closeAllQueues();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("Received SIGINT, shutting down notification queues...");
    await closeAllQueues();
    process.exit(0);
  });
}

// ============================================
// EXPORTS
// ============================================

export default {
  smsQueue,
  pushQueue,
  notificationQueue,
  enqueueSMS,
  scheduleSMS,
  enqueuePush,
  schedulePush,
  enqueueNotification,
  getSMSQueueStats,
  getPushQueueStats,
  getNotificationQueueStats,
  getAllQueueStats,
  retrySMSJob,
  retryPushJob,
  getFailedSMSJobs,
  getFailedPushJobs,
  areQueuesHealthy,
  cleanOldNotificationJobs,
  pauseAllQueues,
  resumeAllQueues,
  closeAllQueues,
};
