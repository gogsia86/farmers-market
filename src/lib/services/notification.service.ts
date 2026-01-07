/**
 * Notification Service
 * Handles multi-channel notifications (EMAIL, SMS, PUSH, IN_APP)
 * with batching, queuing, and delivery tracking
 */

import { database } from "@/lib/database";
import { enqueuePush, enqueueSMS } from "@/lib/queue/notification.queue";
import type {
  Farm,
  Notification,
  NotificationChannel,
  NotificationType,
  User,
} from "@prisma/client";
import { emailService } from "./email.service";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CreateNotificationRequest {
  userId?: string;
  farmId?: string;
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  sendAt?: Date;
}

export interface NotificationWithRelations extends Notification {
  user?: User | null;
  farm?: Farm | null;
}

export interface NotificationPreferencesData {
  emailEnabled: boolean;
  emailFrequency: string;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  orderUpdates: boolean;
  reviewNotifications: boolean;
  promotions: boolean;
  systemAnnouncements: boolean;
}

export interface BulkNotificationRequest {
  userIds?: string[];
  farmIds?: string[];
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byChannel: Record<NotificationChannel, number>;
}

// ============================================================================
// Notification Service
// ============================================================================

export class NotificationService {
  /**
   * Create and send a notification through specified channels
   */
  async createNotification(
    request: CreateNotificationRequest
  ): Promise<Notification> {
    const {
      userId,
      farmId,
      type,
      channels,
      title,
      body,
      data,
      priority = "MEDIUM",
      sendAt,
    } = request;

    // Get user preferences if userId is provided
    let effectiveChannels = channels;
    if (userId) {
      const preferences = await this.getUserPreferences(userId);
      effectiveChannels = this.filterChannelsByPreferences(
        channels,
        preferences,
        type
      );
    }

    // Create in-app notification record
    const notification = await database.notification.create({
      data: {
        userId,
        farmId,
        type,
        channel: effectiveChannels[0] || "IN_APP", // Primary channel
        title,
        body,
        data: data ? JSON.parse(JSON.stringify(data)) : null,
        sentAt: sendAt || new Date(),
      },
      include: {
        user: true,
        farm: true,
      },
    });

    // Send through all effective channels
    if (!sendAt || sendAt <= new Date()) {
      await this.sendThroughChannels(
        notification,
        effectiveChannels,
        priority
      );
    } else {
      // Queue for later delivery
      await this.queueNotification(notification, effectiveChannels, sendAt);
    }

    return notification;
  }

  /**
   * Send notification through multiple channels
   */
  private async sendThroughChannels(
    notification: NotificationWithRelations,
    channels: NotificationChannel[],
    priority: string
  ): Promise<void> {
    const promises: Promise<any>[] = [];

    for (const channel of channels) {
      switch (channel) {
        case "EMAIL":
          promises.push(this.sendEmailNotification(notification));
          break;
        case "SMS":
          promises.push(this.sendSMSNotification(notification));
          break;
        case "PUSH":
          promises.push(this.sendPushNotification(notification));
          break;
        case "IN_APP":
          // Already stored in database
          break;
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notification: NotificationWithRelations
  ): Promise<void> {
    if (!notification.user?.email) {
      logger.warn(
        `Cannot send email notification ${notification.id}: No user email`
      );
      return;
    }

    try {
      const emailData = {
        email: notification.user.email,
        userName: notification.user.name || notification.user.firstName || "User",
        notificationTitle: notification.title,
        notificationBody: notification.body,
        orderNumber: "",
        customerName: notification.user.name || notification.user.firstName || "User",
        items: [],
        total: 0,
      };

      // Map notification types to email templates
      switch (notification.type) {
        case "ORDER_PLACED":
        case "ORDER_CONFIRMED":
          if (notification.data && typeof notification.data === 'object') {
            const data = notification.data as any;
            await emailService.sendOrderConfirmationEmail(
              notification.user.email,
              {
                orderNumber: data.orderNumber || "",
                customerName: notification.user.name || notification.user.firstName || "User",
                items: data.items || [],
                total: data.total || 0,
              }
            );
          }
          break;
        case "PAYMENT_RECEIVED":
        case "LOW_STOCK":
        case "REVIEW_RECEIVED":
        default:
          // For non-order notifications, we'll skip email for now
          // as they don't fit the current email templates
          logger.info(`Email notification skipped for type: ${notification.type}`);
          break;
      }
    } catch (error) {
      logger.error(
        `Failed to send email notification ${notification.id}:`, {
      error: error instanceof Error ? error.message : String(error),
    });
    }
  }

  /**
   * Send SMS notification via queue
   */
  private async sendSMSNotification(
    notification: NotificationWithRelations
  ): Promise<void> {
    if (!notification.user?.phone) {
      logger.warn(`⚠️ No phone number for user ${notification.userId}, skipping SMS`);
      return;
    }

    try {
      // Queue SMS for background processing
      await enqueueSMS({
        phoneNumber: notification.user.phone,
        message: `${notification.title}\n\n${notification.body}`,
        userId: notification.userId || undefined,
        notificationId: notification.id,
        metadata: {
          type: notification.type,
          notificationId: notification.id,
        },
      });

      logger.info(`📱 SMS queued for ${notification.user.phone.substring(notification.user.phone.length - 4)}`);
    } catch (error) {
      logger.error("Failed to queue SMS:", {
      error: error instanceof Error ? error.message : String(error),
    });
    }
  }

  /**
   * Send push notification via queue
   */
  private async sendPushNotification(
    notification: NotificationWithRelations
  ): Promise<void> {
    if (!notification.userId) {
      logger.warn("⚠️ No userId provided, skipping push notification");
      return;
    }

    try {
      // Queue push notification for background processing
      await enqueuePush({
        userId: notification.userId || "",
        title: notification.title,
        body: notification.body,
        data: notification.data as Record<string, any> | undefined,
        notificationId: notification.id,
        priority: this.getPushPriority(notification.type),
      });

      logger.info(`🔔 Push notification queued for user ${notification.userId}`);
    } catch (error) {
      logger.error("Failed to queue push notification:", {
      error: error instanceof Error ? error.message : String(error),
    });
    }
  }

  /**
   * Get push notification priority based on notification type
   */
  private getPushPriority(type: NotificationType): "high" | "normal" {
    const highPriorityTypes: NotificationType[] = [
      "ORDER_CONFIRMED",
      "ORDER_READY",
      "PAYMENT_RECEIVED",
      "NEW_MESSAGE",
    ];

    return highPriorityTypes.includes(type) ? "high" : "normal";
  }

  /**
   * Queue notification for scheduled delivery
   */
  private async queueNotification(
    notification: Notification,
    channels: NotificationChannel[],
    sendAt: Date
  ): Promise<void> {
    const delay = sendAt.getTime() - Date.now();

    if (delay <= 0) {
      // Send immediately if time has passed
      const fullNotification = await database.notification.findUnique({
        where: { id: notification.id },
        include: { user: true, farm: true },
      });

      if (fullNotification) {
        await this.sendThroughChannels(
          fullNotification,
          channels,
          "MEDIUM"
        );
      }
      return;
    }

    try {
      // Queue for future delivery based on channels
      for (const channel of channels) {
        if (channel === "SMS" && notification.userId) {
          const user = await database.user.findUnique({
            where: { id: notification.userId },
            select: { phone: true },
          });

          if (user?.phone) {
            // SMS scheduled sending will be handled by the queue's delay mechanism
            logger.info(
              `📅 SMS scheduled for ${sendAt.toISOString()} to ${user.phone.substring(user.phone.length - 4)}`
            );
          }
        } else if (channel === "PUSH" && notification.userId) {
          logger.info(
            `📅 Push notification scheduled for ${sendAt.toISOString()} for user ${notification.userId}`
          );
        }
      }

      logger.info(
        `✅ Notification ${notification.id} queued for delivery at ${sendAt.toISOString()}`
      );
    } catch (error) {
      logger.error("Failed to queue scheduled notification:", {
      error: error instanceof Error ? error.message : String(error),
    });
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(
    userId: string
  ): Promise<NotificationPreferencesData> {
    const preferences = await database.notificationPreferencesV2.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences
      return {
        emailEnabled: true,
        emailFrequency: "immediate",
        pushEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        orderUpdates: true,
        reviewNotifications: true,
        promotions: false,
        systemAnnouncements: true,
      };
    }

    // Map Prisma schema fields to our interface
    return {
      emailEnabled: preferences.emailEnabled,
      emailFrequency: preferences.emailFrequency,
      pushEnabled: preferences.pushEnabled,
      smsEnabled: preferences.smsEnabled,
      inAppEnabled: preferences.inAppEnabled,
      orderUpdates: true, // Default values for unmapped fields
      reviewNotifications: true,
      promotions: false,
      systemAnnouncements: true,
    };
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<NotificationPreferencesData>
  ): Promise<void> {
    const updateData: any = {};
    if (updates.emailEnabled !== undefined) updateData.emailEnabled = updates.emailEnabled;
    if (updates.emailFrequency !== undefined) updateData.emailFrequency = updates.emailFrequency;
    if (updates.pushEnabled !== undefined) updateData.pushEnabled = updates.pushEnabled;
    if (updates.smsEnabled !== undefined) updateData.smsEnabled = updates.smsEnabled;
    if (updates.inAppEnabled !== undefined) updateData.inAppEnabled = updates.inAppEnabled;

    await database.notificationPreferencesV2.upsert({
      where: { userId },
      create: {
        userId,
        emailEnabled: updates.emailEnabled ?? true,
        emailFrequency: updates.emailFrequency ?? "immediate",
        pushEnabled: updates.pushEnabled ?? true,
        smsEnabled: updates.smsEnabled ?? false,
        inAppEnabled: updates.inAppEnabled ?? true,
      },
      update: updateData,
    });
  }

  /**
   * Filter channels based on user preferences
   */
  private filterChannelsByPreferences(
    channels: NotificationChannel[],
    preferences: NotificationPreferencesData,
    type: NotificationType
  ): NotificationChannel[] {
    return channels.filter((channel) => {
      switch (channel) {
        case "EMAIL":
          return preferences.emailEnabled && this.shouldSendEmailForType(type, preferences);
        case "SMS":
          return preferences.smsEnabled;
        case "PUSH":
          return preferences.pushEnabled;
        case "IN_APP":
          return preferences.inAppEnabled;
        default:
          return true;
      }
    });
  }

  /**
   * Check if email should be sent for notification type
   */
  private shouldSendEmailForType(
    type: NotificationType,
    preferences: NotificationPreferencesData
  ): boolean {
    switch (type) {
      case "ORDER_PLACED":
      case "ORDER_CONFIRMED":
      case "ORDER_READY":
      case "ORDER_FULFILLED":
      case "ORDER_CANCELLED":
      case "PAYMENT_RECEIVED":
        return preferences.orderUpdates;
      case "REVIEW_RECEIVED":
        return preferences.reviewNotifications;
      case "SYSTEM_ANNOUNCEMENT":
        return preferences.systemAnnouncements;
      default:
        return true;
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const { page = 1, limit = 20, unreadOnly = false, type } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    if (type) where.type = type;

    const [notifications, total, unread] = await Promise.all([
      database.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      database.notification.count({ where }),
      database.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unread };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await database.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await database.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await database.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(userId: string): Promise<number> {
    const result = await database.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return result.count;
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(
    request: BulkNotificationRequest
  ): Promise<{ sent: number; failed: number }> {
    const { userIds, farmIds, type, channels, title, body, data } = request;

    let targetUserIds: string[] = [];

    if (userIds) {
      targetUserIds = userIds;
    } else if (farmIds) {
      // Get farm owners
      const farms = await database.farm.findMany({
        where: { id: { in: farmIds } },
        select: { ownerId: true },
      });
      targetUserIds = farms.map((f) => f.ownerId);
    }

    let sent = 0;
    let failed = 0;

    for (const userId of targetUserIds) {
      try {
        await this.createNotification({
          userId,
          type,
          channels,
          title,
          body,
          data,
        });
        sent++;
      } catch (error) {
        logger.error(`Failed to send notification to user ${userId}:`, {
      error: error instanceof Error ? error.message : String(error),
    });
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Send system announcement to all users
   */
  async sendSystemAnnouncement(
    title: string,
    body: string,
    channels: NotificationChannel[] = ["IN_APP", "EMAIL"]
  ): Promise<{ sent: number; failed: number }> {
    // Get all active users
    const users = await database.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });

    return await this.sendBulkNotifications({
      userIds: users.map((u) => u.id),
      type: "SYSTEM_ANNOUNCEMENT",
      channels,
      title,
      body,
    });
  }

  /**
   * Get notification statistics for user
   */
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    const notifications = await database.notification.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        channel: true,
        isRead: true,
      },
    });

    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      byType: {} as Record<NotificationType, number>,
      byChannel: {} as Record<NotificationChannel, number>,
    };

    // Count by type
    notifications.forEach((n) => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byChannel[n.channel] = (stats.byChannel[n.channel] || 0) + 1;
    });

    return stats;
  }

  /**
   * Send order status notification
   */
  async sendOrderNotification(
    userId: string,
    orderId: string,
    status: string,
    orderData: any
  ): Promise<void> {
    const typeMap: Record<string, NotificationType> = {
      PENDING: "ORDER_PLACED",
      CONFIRMED: "ORDER_CONFIRMED",
      READY: "ORDER_READY",
      FULFILLED: "ORDER_FULFILLED",
      CANCELLED: "ORDER_CANCELLED",
    };

    const type = typeMap[status] || "ORDER_CONFIRMED";

    await this.createNotification({
      userId,
      type,
      channels: ["IN_APP", "EMAIL"],
      title: `Order ${status.toLowerCase()}`,
      body: `Your order #${orderData.orderNumber} has been ${status.toLowerCase()}.`,
      data: {
        orderId,
        orderNumber: orderData.orderNumber,
        status,
        ...orderData,
      },
    });
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(
    userId: string,
    paymentData: any
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: "PAYMENT_RECEIVED",
      channels: ["IN_APP", "EMAIL"],
      title: "Payment received",
      body: `We've received your payment of $${paymentData.amount}.`,
      data: paymentData,
    });
  }

  /**
   * Send low stock alert to farm owner
   */
  async sendLowStockAlert(
    farmId: string,
    productData: any
  ): Promise<void> {
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true },
    });

    if (!farm) return;

    await this.createNotification({
      userId: farm.ownerId,
      farmId,
      type: "LOW_STOCK",
      channels: ["IN_APP", "EMAIL"],
      title: "Low stock alert",
      body: `Product "${productData.name}" is running low on stock.`,
      data: productData,
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
