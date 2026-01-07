/**
 * 🔔 REAL-TIME NOTIFICATION SERVICE
 * WebSocket-based notifications for orders, approvals, messages
 * Uses Server-Sent Events (SSE) for real-time updates
 */

import { logger } from '@/lib/monitoring/logger';

export interface Notification {
  id: string;
  userId: string;
  type: "ORDER" | "APPROVAL" | "MESSAGE" | "ALERT";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private static connections: Map<string, Set<any>> = new Map();

  /**
   * Subscribe to notifications for a user
   */
  static subscribe(
    userId: string,
    callback: (notification: Notification) => void,
  ) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const userConnections = this.connections.get(userId);
      if (userConnections) {
        userConnections.delete(callback);
        if (userConnections.size === 0) {
          this.connections.delete(userId);
        }
      }
    };
  }

  /**
   * Send notification to user
   */
  static async notify(
    userId: string,
    notification: Omit<Notification, "id" | "userId" | "createdAt">,
  ) {
    const fullNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      createdAt: new Date(),
      ...notification,
    };

    // Store in database (when Notification model is added)
    // await database.notification.create({ data: fullNotification });

    // Send to connected clients
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.forEach((callback) => {
        try {
          callback(fullNotification);
        } catch (error) {
          logger.error("Notification callback error:", {
      error: error instanceof Error ? error.message : String(error),
    });
        }
      });
    }

    return fullNotification;
  }

  /**
   * Send notification to multiple users
   */
  static async notifyMany(
    userIds: string[],
    notification: Omit<Notification, "id" | "userId" | "createdAt">,
  ) {
    return Promise.all(
      userIds.map((userId) => this.notify(userId, notification)),
    );
  }

  /**
   * Notify farmer of new order
   */
  static async notifyNewOrder(
    farmerId: string,
    orderData: {
      orderNumber: string;
      customerName: string;
      total: number;
    },
  ) {
    return this.notify(farmerId, {
      type: "ORDER",
      title: "New Order Received!",
      message: `New order #${orderData.orderNumber} from ${orderData.customerName} - $${orderData.total.toFixed(2)}`,
      data: orderData,
      read: false,
    });
  }

  /**
   * Notify farmer of approval decision
   */
  static async notifyApprovalDecision(
    farmerId: string,
    decision: {
      farmName: string;
      approved: boolean;
      reason?: string;
    },
  ) {
    return this.notify(farmerId, {
      type: "APPROVAL",
      title: decision.approved ? "Farm Approved!" : "Application Update",
      message: decision.approved
        ? `Your farm "${decision.farmName}" has been approved. Start selling now!`
        : `Your application for "${decision.farmName}" needs attention.`,
      data: decision,
      read: false,
    });
  }

  /**
   * Notify customer of order status
   */
  static async notifyOrderStatus(
    customerId: string,
    orderData: {
      orderNumber: string;
      status: string;
      farmName: string;
    },
  ) {
    return this.notify(customerId, {
      type: "ORDER",
      title: "Order Status Update",
      message: `Your order #${orderData.orderNumber} from ${orderData.farmName} is now ${orderData.status.toLowerCase()}`,
      data: orderData,
      read: false,
    });
  }

  /**
   * Send alert notification
   */
  static async sendAlert(
    userId: string,
    alert: {
      title: string;
      message: string;
      severity: "info" | "warning" | "error";
    },
  ) {
    return this.notify(userId, {
      type: "ALERT",
      title: alert.title,
      message: alert.message,
      data: { severity: alert.severity },
      read: false,
    });
  }

  /**
   * Get unread count for user
   */
  static getActiveConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size || 0;
  }

  /**
   * Get all active users
   */
  static getActiveUserCount(): number {
    return this.connections.size;
  }

  /**
   * Clear all connections (for testing)
   */
  static clearAll() {
    this.connections.clear();
  }
}

// Export singleton
export const notificationService = NotificationService;
