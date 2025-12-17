/**
 * 🔔 Notification Service Mock
 *
 * Mock notification service for integration testing.
 * Simulates push notifications, SMS, and in-app notifications.
 *
 * @module tests/integration/mocks/notification
 * @version 1.0.0
 *
 * Divine Pattern: External service mocking with agricultural consciousness
 * Agricultural Context: Real-time notifications for farm-to-table ecosystem
 */

import { randomUUID } from "crypto";

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actionUrl?: string;
  priority?: "high" | "normal" | "low";
}

interface SmsNotificationRequest {
  phoneNumber: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface FarmerNotificationRequest {
  farmerId: string;
  type: string;
  orderId?: string;
  message: string;
  data?: Record<string, unknown>;
}

interface InAppNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: "order" | "farm" | "product" | "system" | "promotion";
  data?: Record<string, unknown>;
}

interface Notification {
  id: string;
  type: "push" | "sms" | "in_app";
  userId?: string;
  phoneNumber?: string;
  title?: string;
  body?: string;
  message?: string;
  data?: Record<string, unknown>;
  sentAt: Date;
  status: "sent" | "failed" | "delivered" | "read";
  deliveredAt?: Date;
  readAt?: Date;
}

class NotificationServiceMock {
  private notifications: Notification[] = [];
  private failureRate: number = 0;
  private initialized: boolean = false;
  private deliveryDelay: number = 0; // Simulated delivery delay in ms

  /**
   * Initialize the mock service
   */
  initialize(): void {
    this.initialized = true;
    this.reset();
    console.log("✅ Notification Service Mock initialized");
  }

  /**
   * Reset all mock data
   */
  reset(): void {
    this.notifications = [];
    this.failureRate = 0;
    this.deliveryDelay = 0;
  }

  /**
   * Set failure rate for testing error scenarios (0-100)
   */
  setFailureRate(rate: number): void {
    this.failureRate = Math.max(0, Math.min(100, rate));
  }

  /**
   * Set delivery delay in milliseconds
   */
  setDeliveryDelay(ms: number): void {
    this.deliveryDelay = Math.max(0, ms);
  }

  /**
   * Send a push notification
   */
  async sendPushNotification(
    request: PushNotificationRequest,
  ): Promise<Notification> {
    if (!this.initialized) {
      throw new Error(
        "Notification service mock not initialized. Call initialize() first.",
      );
    }

    // Simulate failure based on failure rate
    const shouldFail = Math.random() * 100 < this.failureRate;

    const notification: Notification = {
      id: `push_${randomUUID()}`,
      type: "push",
      userId: request.userId,
      title: request.title,
      body: request.body,
      data: {
        ...request.data,
        imageUrl: request.imageUrl,
        actionUrl: request.actionUrl,
        priority: request.priority || "normal",
      },
      sentAt: new Date(),
      status: shouldFail ? "failed" : "sent",
    };

    this.notifications.push(notification);

    if (shouldFail) {
      throw new Error(
        `Failed to send push notification to user ${request.userId}`,
      );
    }

    // Simulate delivery delay
    if (this.deliveryDelay > 0) {
      setTimeout(() => {
        this.simulateDelivery(notification.id);
      }, this.deliveryDelay);
    }

    return notification;
  }

  /**
   * Send an SMS notification
   */
  async sendSmsNotification(
    request: SmsNotificationRequest,
  ): Promise<Notification> {
    if (!this.initialized) {
      throw new Error(
        "Notification service mock not initialized. Call initialize() first.",
      );
    }

    // Simulate failure based on failure rate
    const shouldFail = Math.random() * 100 < this.failureRate;

    const notification: Notification = {
      id: `sms_${randomUUID()}`,
      type: "sms",
      phoneNumber: request.phoneNumber,
      message: request.message,
      data: request.metadata,
      sentAt: new Date(),
      status: shouldFail ? "failed" : "sent",
    };

    this.notifications.push(notification);

    if (shouldFail) {
      throw new Error(`Failed to send SMS to ${request.phoneNumber}`);
    }

    // Simulate delivery delay
    if (this.deliveryDelay > 0) {
      setTimeout(() => {
        this.simulateDelivery(notification.id);
      }, this.deliveryDelay);
    }

    return notification;
  }

  /**
   * Send an in-app notification
   */
  async sendInAppNotification(
    request: InAppNotificationRequest,
  ): Promise<Notification> {
    if (!this.initialized) {
      throw new Error(
        "Notification service mock not initialized. Call initialize() first.",
      );
    }

    const notification: Notification = {
      id: `inapp_${randomUUID()}`,
      type: "in_app",
      userId: request.userId,
      title: request.title,
      message: request.message,
      data: {
        ...request.data,
        type: request.type,
      },
      sentAt: new Date(),
      status: "sent",
    };

    this.notifications.push(notification);

    return notification;
  }

  /**
   * Send farmer notification
   */
  async sendFarmerNotification(
    request: FarmerNotificationRequest,
  ): Promise<Notification> {
    const notification: Notification = {
      id: `farmer_${randomUUID()}`,
      type: "push",
      userId: request.farmerId,
      title: request.type.replace(/_/g, " "),
      body: request.message,
      data: {
        ...request.data,
        type: request.type,
        orderId: request.orderId,
      },
      sentAt: new Date(),
      status: "sent",
    };

    this.notifications.push(notification);

    return notification;
  }

  /**
   * Send bulk push notifications
   */
  async sendBulkPushNotifications(
    requests: PushNotificationRequest[],
  ): Promise<Notification[]> {
    const notifications = await Promise.all(
      requests.map((request) => this.sendPushNotification(request)),
    );

    return notifications;
  }

  /**
   * Send bulk SMS notifications
   */
  async sendBulkSmsNotifications(
    requests: SmsNotificationRequest[],
  ): Promise<Notification[]> {
    const notifications = await Promise.all(
      requests.map((request) => this.sendSmsNotification(request)),
    );

    return notifications;
  }

  /**
   * Get all sent notifications
   */
  getSentNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get notifications by user ID
   */
  getNotificationsByUser(userId: string): Notification[] {
    return this.notifications.filter(
      (notification) => notification.userId === userId,
    );
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: Notification["type"]): Notification[] {
    return this.notifications.filter(
      (notification) => notification.type === type,
    );
  }

  /**
   * Get notifications by status
   */
  getNotificationsByStatus(status: Notification["status"]): Notification[] {
    return this.notifications.filter(
      (notification) => notification.status === status,
    );
  }

  /**
   * Get notification by ID
   */
  getNotificationById(id: string): Notification | undefined {
    return this.notifications.find((notification) => notification.id === id);
  }

  /**
   * Get unread notifications for user
   */
  getUnreadNotifications(userId: string): Notification[] {
    return this.notifications.filter(
      (notification) =>
        notification.userId === userId &&
        notification.type === "in_app" &&
        notification.status !== "read",
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(
      (n) => n.id === notificationId,
    );
    if (notification) {
      notification.status = "read";
      notification.readAt = new Date();
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<void> {
    this.notifications
      .filter(
        (n) =>
          n.userId === userId && n.type === "in_app" && n.status !== "read",
      )
      .forEach((n) => {
        n.status = "read";
        n.readAt = new Date();
      });
  }

  /**
   * Simulate notification delivery
   */
  async simulateDelivery(notificationId: string): Promise<void> {
    const notification = this.notifications.find(
      (n) => n.id === notificationId,
    );
    if (notification && notification.status === "sent") {
      notification.status = "delivered";
      notification.deliveredAt = new Date();
    }
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications = [];
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const index = this.notifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllForUser(userId: string): Promise<void> {
    this.notifications = this.notifications.filter((n) => n.userId !== userId);
  }

  /**
   * Get notification count by user
   */
  getNotificationCount(userId: string): number {
    return this.getNotificationsByUser(userId).length;
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(userId: string): number {
    return this.getUnreadNotifications(userId).length;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      totalSent: this.notifications.length,
      byType: {
        push: this.getNotificationsByType("push").length,
        sms: this.getNotificationsByType("sms").length,
        in_app: this.getNotificationsByType("in_app").length,
      },
      byStatus: {
        sent: this.getNotificationsByStatus("sent").length,
        failed: this.getNotificationsByStatus("failed").length,
        delivered: this.getNotificationsByStatus("delivered").length,
        read: this.getNotificationsByStatus("read").length,
      },
      deliveryRate:
        this.notifications.length > 0
          ? (this.getNotificationsByStatus("delivered").length /
              this.notifications.length) *
            100
          : 100,
      readRate:
        this.notifications.length > 0
          ? (this.getNotificationsByStatus("read").length /
              this.notifications.length) *
            100
          : 0,
    };
  }

  /**
   * Get notifications sent in time range
   */
  getNotificationsInTimeRange(startDate: Date, endDate: Date): Notification[] {
    return this.notifications.filter(
      (notification) =>
        notification.sentAt >= startDate && notification.sentAt <= endDate,
    );
  }

  /**
   * Get notification delivery metrics
   */
  getDeliveryMetrics() {
    const delivered = this.getNotificationsByStatus("delivered");
    const failed = this.getNotificationsByStatus("failed");

    const averageDeliveryTime =
      delivered.length > 0
        ? delivered.reduce((sum, n) => {
            if (n.deliveredAt) {
              return sum + (n.deliveredAt.getTime() - n.sentAt.getTime());
            }
            return sum;
          }, 0) / delivered.length
        : 0;

    return {
      totalDelivered: delivered.length,
      totalFailed: failed.length,
      averageDeliveryTimeMs: averageDeliveryTime,
      successRate:
        this.notifications.length > 0
          ? (delivered.length / this.notifications.length) * 100
          : 100,
    };
  }
}

// Singleton instance
export const mockNotificationService = new NotificationServiceMock();

// Export types
export type {
  PushNotificationRequest,
  SmsNotificationRequest,
  FarmerNotificationRequest,
  InAppNotificationRequest,
  Notification,
};
