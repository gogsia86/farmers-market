/**
 * Notification Queue Service - Stub Version
 *
 * This is a stub implementation that doesn't import Bull/Redis dependencies.
 * The full implementation with Bull queue is available in notification.queue.ts.bak
 * and can be enabled when Redis is available in the deployment environment.
 *
 * @module lib/queue/notification.queue
 */

import { NotificationChannel } from "@prisma/client";

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
  priority?: "low" | "normal" | "high";
}

// ============================================
// STUB IMPLEMENTATIONS
// ============================================

/**
 * Enqueue SMS for sending (stub - logs only)
 */
export async function enqueueSMS(data: SMSJobData): Promise<string> {
  console.log('[Queue Stub] SMS would be queued:', {
    phoneNumber: data.phoneNumber.substring(data.phoneNumber.length - 4),
    userId: data.userId,
  });
  return `stub-sms-${Date.now()}`;
}

/**
 * Schedule SMS for later sending (stub - logs only)
 */
export async function scheduleSMS(
  data: SMSJobData,
  delay: number
): Promise<string> {
  console.log('[Queue Stub] SMS would be scheduled:', {
    phoneNumber: data.phoneNumber.substring(data.phoneNumber.length - 4),
    userId: data.userId,
    delay: `${delay}ms`,
  });
  return `stub-sms-scheduled-${Date.now()}`;
}

/**
 * Enqueue push notification (stub - logs only)
 */
export async function enqueuePush(data: PushJobData): Promise<string> {
  console.log('[Queue Stub] Push notification would be queued:', {
    userId: data.userId,
    title: data.title,
    priority: data.priority || 'normal',
  });
  return `stub-push-${Date.now()}`;
}

/**
 * Schedule push notification (stub - logs only)
 */
export async function schedulePush(
  data: PushJobData,
  delay: number
): Promise<string> {
  console.log('[Queue Stub] Push notification would be scheduled:', {
    userId: data.userId,
    title: data.title,
    delay: `${delay}ms`,
  });
  return `stub-push-scheduled-${Date.now()}`;
}

/**
 * Get queue statistics (stub - returns empty stats)
 */
export async function getAllQueueStats(): Promise<{
  sms: QueueStats;
  push: QueueStats;
  notification: QueueStats;
}> {
  const emptyStats: QueueStats = {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    total: 0,
  };

  return {
    sms: emptyStats,
    push: emptyStats,
    notification: emptyStats,
  };
}

/**
 * Check if queues are healthy (stub - always returns true)
 */
export async function areQueuesHealthy(): Promise<{
  overall: boolean;
  sms: boolean;
  push: boolean;
  notification: boolean;
}> {
  return {
    overall: true,
    sms: true,
    push: true,
    notification: true,
  };
}

/**
 * Get failed jobs (stub - returns empty array)
 */
export async function getFailedSMSJobs(limit: number = 10): Promise<any[]> {
  console.log(`[Queue Stub] Would fetch ${limit} failed SMS jobs`);
  return [];
}

/**
 * Get failed jobs (stub - returns empty array)
 */
export async function getFailedPushJobs(limit: number = 10): Promise<any[]> {
  console.log(`[Queue Stub] Would fetch ${limit} failed push jobs`);
  return [];
}

/**
 * Clean old jobs (stub - logs only)
 */
export async function cleanOldNotificationJobs(
  completedAge: number,
  failedAge: number
): Promise<void> {
  console.log('[Queue Stub] Would clean old jobs:', {
    completedAge: `${completedAge}ms`,
    failedAge: `${failedAge}ms`,
  });
}

// ============================================
// HELPER TYPES
// ============================================

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

// ============================================
// EXPORTS
// ============================================

export default {
  enqueueSMS,
  scheduleSMS,
  enqueuePush,
  schedulePush,
  getAllQueueStats,
  areQueuesHealthy,
  getFailedSMSJobs,
  getFailedPushJobs,
  cleanOldNotificationJobs,
};

// ============================================
// NOTES
// ============================================

/**
 * To enable full queue functionality:
 *
 * 1. Ensure Redis is running and accessible
 * 2. Set environment variables:
 *    - REDIS_HOST
 *    - REDIS_PORT
 *    - REDIS_PASSWORD (if required)
 *
 * 3. Restore the full implementation:
 *    mv src/lib/queue/notification.queue.ts.bak src/lib/queue/notification.queue.ts
 *
 * 4. Restart the application
 *
 * The full Bull queue implementation provides:
 * - Automatic retry with exponential backoff
 * - Job prioritization
 * - Rate limiting
 * - Delayed/scheduled jobs
 * - Job progress tracking
 * - Failed job recovery
 * - Redis-backed persistence
 */
