/**
 * Push Notification Service
 *
 * Handles push notifications via Firebase Cloud Messaging (FCM) with support for
 * iOS (APNS) and Android. Includes device token management, topic subscriptions,
 * and notification templates.
 *
 * @module lib/services/push.service
 */

import { database } from "@/lib/database";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import * as admin from "firebase-admin";

import { logger } from "@/lib/monitoring/logger";

import type { MulticastMessage } from "firebase-admin/messaging";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface PushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
  priority?: "high" | "normal";
  imageUrl?: string;
  clickAction?: string;
  notificationId?: string;
}

export interface SendPushResult {
  success: boolean;
  messageId?: string;
  failedTokens?: string[];
  error?: string;
  timestamp: Date;
}

export interface DeviceToken {
  token: string;
  platform: "ios" | "android" | "web";
  userId: string;
}

export interface PushTemplate {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// ============================================
// PUSH NOTIFICATION TEMPLATES
// ============================================

export const PUSH_TEMPLATES: Record<string, (params: any) => PushTemplate> = {
  ORDER_CONFIRMED: (params: { orderNumber: string; farmName: string }) => ({
    title: "Order Confirmed! ✅",
    body: `Your order #${params.orderNumber} from ${params.farmName} has been confirmed.`,
    data: {
      type: "order",
      orderNumber: params.orderNumber,
      action: "view_order",
    },
  }),

  ORDER_READY: (params: {
    orderNumber: string;
    farmName: string;
    pickupTime?: string;
  }) => ({
    title: "Order Ready for Pickup! 🎉",
    body: `Your order #${params.orderNumber} from ${params.farmName} is ready${params.pickupTime ? ` at ${params.pickupTime}` : ""}!`,
    data: {
      type: "order",
      orderNumber: params.orderNumber,
      action: "view_order",
    },
  }),

  ORDER_CANCELLED: (params: { orderNumber: string; reason?: string }) => ({
    title: "Order Cancelled ❌",
    body: `Order #${params.orderNumber} has been cancelled${params.reason ? `: ${params.reason}` : ""}.`,
    data: {
      type: "order",
      orderNumber: params.orderNumber,
      action: "view_order",
    },
  }),

  NEW_MESSAGE: (params: { senderName: string; preview: string }) => ({
    title: `Message from ${params.senderName}`,
    body: params.preview,
    data: {
      type: "message",
      sender: params.senderName,
      action: "view_messages",
    },
  }),

  NEW_REVIEW: (params: { customerName: string; rating: number }) => ({
    title: "New Review ⭐",
    body: `${params.customerName} left you a ${params.rating}-star review!`,
    data: {
      type: "review",
      rating: params.rating.toString(),
      action: "view_reviews",
    },
  }),

  LOW_STOCK_ALERT: (params: { productName: string; currentStock: number }) => ({
    title: "Low Stock Alert ⚠️",
    body: `${params.productName} has only ${params.currentStock} units left. Restock soon!`,
    data: {
      type: "inventory",
      productName: params.productName,
      action: "view_inventory",
    },
  }),

  PAYMENT_FAILED: (params: { orderNumber: string }) => ({
    title: "Payment Failed 💳",
    body: `Payment for order #${params.orderNumber} failed. Please update your payment method.`,
    data: {
      type: "payment",
      orderNumber: params.orderNumber,
      action: "update_payment",
    },
  }),

  PAYMENT_RECEIVED: (params: { orderNumber: string; amount: string }) => ({
    title: "Payment Received ✅",
    body: `Payment of $${params.amount} received for order #${params.orderNumber}.`,
    data: {
      type: "payment",
      orderNumber: params.orderNumber,
      action: "view_order",
    },
  }),

  DELIVERY_UPDATE: (params: {
    orderNumber: string;
    status: string;
    estimatedTime?: string;
  }) => ({
    title: "Delivery Update 📦",
    body: `Order #${params.orderNumber}: ${params.status}${params.estimatedTime ? `. ETA: ${params.estimatedTime}` : ""}`,
    data: {
      type: "delivery",
      orderNumber: params.orderNumber,
      action: "track_delivery",
    },
  }),

  FARM_APPROVED: (params: { farmName: string }) => ({
    title: "Farm Approved! 🎉",
    body: `Congratulations! Your farm "${params.farmName}" has been approved.`,
    data: {
      type: "farm",
      action: "view_farm",
    },
  }),

  FARM_REJECTED: (params: { farmName: string; reason: string }) => ({
    title: "Farm Application Update",
    body: `Your farm "${params.farmName}" needs attention: ${params.reason}`,
    data: {
      type: "farm",
      action: "view_farm_details",
    },
  }),

  PRICE_DROP: (params: {
    productName: string;
    oldPrice: string;
    newPrice: string;
  }) => ({
    title: "Price Drop! 💰",
    body: `${params.productName} is now $${params.newPrice} (was $${params.oldPrice})`,
    data: {
      type: "promotion",
      action: "view_product",
    },
  }),

  SEASONAL_PRODUCT: (params: { productName: string; farmName: string }) => ({
    title: "Fresh Seasonal Product! 🌾",
    body: `${params.productName} is now available at ${params.farmName}`,
    data: {
      type: "product",
      action: "view_product",
    },
  }),

  WELCOME: (params: { firstName: string }) => ({
    title: "Welcome to Farmers Market! 👋",
    body: `Welcome, ${params.firstName}! Discover fresh, local produce from farms near you.`,
    data: {
      type: "welcome",
      action: "explore_farms",
    },
  }),
};

// ============================================
// PUSH NOTIFICATION SERVICE CLASS
// ============================================

export class PushNotificationService {
  private app: admin.app.App | null = null;
  private messaging: admin.messaging.Messaging | null = null;
  private isConfigured = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private async initialize(): Promise<void> {
    try {
      // Check if Firebase credentials are configured
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n",
      );
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      if (!projectId || !privateKey || !clientEmail) {
        logger.warn(
          "⚠️ Push notification service not configured. Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL",
        );
        this.isConfigured = false;
        return;
      }

      // Initialize Firebase Admin SDK
      if (!admin.apps.length) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          }),
        });
      } else {
        this.app = admin.apps[0] || null;
      }

      if (this.app) {
        this.messaging = admin.messaging(this.app);
        this.isConfigured = true;
        logger.info("✅ Push notification service initialized successfully");
      }
    } catch (error) {
      logger.error("❌ Failed to initialize push notification service:", {
        error: error instanceof Error ? error.message : String(error),
      });
      this.isConfigured = false;
    }
  }

  /**
   * Ensure service is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Send push notification to a user
   *
   * @param options - Push notification options
   * @returns Send result
   */
  async sendPushNotification(
    options: PushNotificationOptions,
  ): Promise<SendPushResult> {
    await this.ensureInitialized();

    const tracer = trace.getTracer("push-service");

    return await tracer.startActiveSpan(
      "sendPushNotification",
      async (span) => {
        span.setAttributes({
          "push.user_id": options.userId,
          "push.title": options.title,
          "push.priority": options.priority || "normal",
        });

        const timestamp = new Date();

        try {
          // Check if service is configured
          if (!this.isConfigured || !this.messaging) {
            logger.info(
              `🔔 [PUSH NOT CONFIGURED] Would send to user ${options.userId}: ${options.title}`,
            );
            span.setStatus({ code: SpanStatusCode.OK });
            span.setAttributes({ "push.simulated": true });

            return {
              success: true,
              messageId: `simulated-${Date.now()}`,
              timestamp,
            };
          }

          // Get user's device tokens
          const tokens = await this.getUserDeviceTokens(options.userId);

          if (tokens.length === 0) {
            logger.warn(`⚠️ No device tokens found for user ${options.userId}`);
            return {
              success: false,
              error: "No device tokens registered for user",
              timestamp,
            };
          }

          // Build multicast message
          const message: MulticastMessage = {
            tokens: tokens.map((t: any) => t.token),
            notification: {
              title: options.title,
              body: options.body,
              imageUrl: options.imageUrl,
            },
            data: options.data,
            apns: {
              payload: {
                aps: {
                  badge: options.badge,
                  sound: options.sound || "default",
                },
              },
            },
            android: {
              priority: options.priority || "normal",
              notification: {
                clickAction: options.clickAction,
                sound: options.sound || "default",
              },
            },
            webpush: options.clickAction
              ? {
                  fcmOptions: {
                    link: options.clickAction,
                  },
                }
              : undefined,
          };

          // Send to all devices
          const response = await this.messaging.sendEachForMulticast(message);

          span.setAttributes({
            "push.success_count": response.successCount,
            "push.failure_count": response.failureCount,
          });

          // Track failed tokens for cleanup
          const failedTokens: string[] = [];
          if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const token = tokens[idx];
                if (token) {
                  failedTokens.push(token.token);

                  // If token is invalid, remove it
                  if (
                    resp.error?.code ===
                      "messaging/invalid-registration-token" ||
                    resp.error?.code ===
                      "messaging/registration-token-not-registered"
                  ) {
                    this.removeDeviceToken(token.token).catch((err) =>
                      logger.error("Failed to remove invalid token:", err),
                    );
                  }
                }
              }
            });
          }

          // Log to database
          await this.logPushNotification({
            userId: options.userId,
            title: options.title,
            body: options.body,
            data: options.data,
            status: response.successCount > 0 ? "SENT" : "FAILED",
            successCount: response.successCount,
            failureCount: response.failureCount,
            notificationId: options.notificationId,
          });

          const success = response.successCount > 0;
          span.setStatus({
            code: success ? SpanStatusCode.OK : SpanStatusCode.ERROR,
          });

          logger.info(
            `${success ? "✅" : "❌"} Push notification sent to user ${options.userId}: ${response.successCount}/${tokens.length} successful`,
          );

          return {
            success,
            messageId: `batch-${Date.now()}`,
            failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
            error:
              response.failureCount === tokens.length
                ? "All push notifications failed"
                : undefined,
            timestamp,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: errorMessage,
          });

          logger.error(
            `❌ Failed to send push notification to user ${options.userId}:`,
            {
              error: error instanceof Error ? error.message : String(error),
            },
          );

          // Log failure
          await this.logPushNotification({
            userId: options.userId,
            title: options.title,
            body: options.body,
            data: options.data,
            status: "FAILED",
            successCount: 0,
            failureCount: 1,
            errorMessage,
            notificationId: options.notificationId,
          });

          return {
            success: false,
            error: errorMessage,
            timestamp,
          };
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Send push notification using a template
   *
   * @param userId - User ID
   * @param templateName - Template name
   * @param params - Template parameters
   * @param options - Additional options
   * @returns Send result
   */
  async sendTemplatePush(
    userId: string,
    templateName: string,
    params: any,
    options?: {
      badge?: number;
      sound?: string;
      priority?: "high" | "normal";
      imageUrl?: string;
      notificationId?: string;
    },
  ): Promise<SendPushResult> {
    const template = PUSH_TEMPLATES[templateName];

    if (!template) {
      throw new Error(`Push notification template not found: ${templateName}`);
    }

    const { title, body, data } = template(params);

    return await this.sendPushNotification({
      userId,
      title,
      body,
      data: {
        ...data,
        template: templateName,
      },
      ...options,
    });
  }

  /**
   * Register device token for a user
   *
   * @param userId - User ID
   * @param token - FCM device token
   * @param platform - Device platform
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    platform: "ios" | "android" | "web",
  ): Promise<void> {
    try {
      // Check if token already exists
      const existing = await database.deviceToken.findUnique({
        where: { token },
      });

      if (existing) {
        // Update existing token
        await database.deviceToken.update({
          where: { token },
          data: {
            userId,
            platform,
            lastUsedAt: new Date(),
            isActive: true,
          },
        });
      } else {
        // Create new token
        await database.deviceToken.create({
          data: {
            userId,
            token,
            platform,
            isActive: true,
            lastUsedAt: new Date(),
          },
        });
      }

      logger.info(`✅ Device token registered for user ${userId}`);
    } catch (error) {
      logger.error("Failed to register device token:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Remove device token
   *
   * @param token - FCM device token
   */
  async removeDeviceToken(token: string): Promise<void> {
    try {
      await database.deviceToken.delete({
        where: { token },
      });

      logger.info(`🗑️ Device token removed: ${token.substring(0, 20)}...`);
    } catch (error) {
      logger.error("Failed to remove device token:", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - token might already be deleted
    }
  }

  /**
   * Get all active device tokens for a user
   *
   * @param userId - User ID
   * @returns Array of device tokens
   */
  private async getUserDeviceTokens(
    userId: string,
  ): Promise<{ token: string; platform: string }[]> {
    try {
      const tokens = await database.deviceToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          token: true,
          platform: true,
        },
      });

      return tokens;
    } catch (error) {
      logger.error("Failed to get user device tokens:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Log push notification to database
   */
  private async logPushNotification(data: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    status: string;
    successCount: number;
    failureCount: number;
    errorMessage?: string;
    notificationId?: string;
  }): Promise<void> {
    try {
      await database.pushNotificationLog.create({
        data: {
          userId: data.userId,
          title: data.title,
          body: data.body,
          data: data.data || {},
          status: data.status,
          successCount: data.successCount,
          failureCount: data.failureCount,
          errorMessage: data.errorMessage,
          notificationId: data.notificationId,
          sentAt: data.status === "SENT" ? new Date() : undefined,
          failedAt: data.status === "FAILED" ? new Date() : undefined,
        },
      });
    } catch (error) {
      logger.error("Failed to log push notification to database:", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - logging failure shouldn't break push sending
    }
  }

  /**
   * Send push to multiple users (broadcast)
   *
   * @param userIds - Array of user IDs
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional data payload
   * @returns Results for each user
   */
  async broadcastPush(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ userId: string; result: SendPushResult }[]> {
    const results = await Promise.allSettled(
      userIds.map((userId: any) =>
        this.sendPushNotification({
          userId,
          title,
          body,
          data,
        }),
      ),
    );

    return userIds.map((userId: any, index: any) => {
      const result = results[index];
      if (!result) {
        return {
          userId,
          result: {
            success: false,
            error: "No result returned",
            timestamp: new Date(),
          },
        };
      }
      return {
        userId,
        result:
          result.status === "fulfilled"
            ? result.value
            : {
                success: false,
                error:
                  (result as PromiseRejectedResult).reason?.message ||
                  "Unknown error",
                timestamp: new Date(),
              },
      };
    });
  }

  /**
   * Subscribe user to a topic
   *
   * @param userId - User ID
   * @param topic - Topic name
   */
  async subscribeToTopic(userId: string, topic: string): Promise<void> {
    await this.ensureInitialized();

    if (!this.isConfigured || !this.messaging) {
      logger.info(
        `🔔 [PUSH NOT CONFIGURED] Would subscribe user ${userId} to topic ${topic}`,
      );
      return;
    }

    try {
      const tokens = await this.getUserDeviceTokens(userId);

      if (tokens.length === 0) {
        logger.warn(`⚠️ No device tokens found for user ${userId}`);
        return;
      }

      await this.messaging.subscribeToTopic(
        tokens.map((t: any) => t.token),
        topic,
      );

      logger.info(`✅ User ${userId} subscribed to topic: ${topic}`);
    } catch (error) {
      logger.error(`Failed to subscribe user ${userId} to topic ${topic}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Unsubscribe user from a topic
   *
   * @param userId - User ID
   * @param topic - Topic name
   */
  async unsubscribeFromTopic(userId: string, topic: string): Promise<void> {
    await this.ensureInitialized();

    if (!this.isConfigured || !this.messaging) {
      logger.info(
        `🔔 [PUSH NOT CONFIGURED] Would unsubscribe user ${userId} from topic ${topic}`,
      );
      return;
    }

    try {
      const tokens = await this.getUserDeviceTokens(userId);

      if (tokens.length === 0) {
        return;
      }

      await this.messaging.unsubscribeFromTopic(
        tokens.map((t: any) => t.token),
        topic,
      );

      logger.info(`✅ User ${userId} unsubscribed from topic: ${topic}`);
    } catch (error) {
      logger.error(
        `Failed to unsubscribe user ${userId} from topic ${topic}:`,
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
      throw error;
    }
  }

  /**
   * Check if service is configured and ready
   */
  isReady(): boolean {
    return this.isConfigured && this.messaging !== null;
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    ready: boolean;
  } {
    return {
      configured: this.isConfigured,
      ready: this.isReady(),
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const pushNotificationService = new PushNotificationService();

// ============================================
// EXPORTS
// ============================================

export default pushNotificationService;
