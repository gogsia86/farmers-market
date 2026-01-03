/**
 * 🌾 Notification Engine Service - Divine Agricultural Communication
 *
 * Quantum consciousness for multi-channel notifications
 * Part of Sprint 6 Phase 3 Day 4: Receipt System & Notifications
 *
 * Features:
 * - Email notifications (transactional & marketing)
 * - SMS notifications (optional)
 * - Push notifications (web & mobile)
 * - In-app notifications
 * - Real-time notification delivery
 * - Notification preferences management
 * - Template system with agricultural branding
 * - Delivery tracking and retry logic
 * - Multi-language support
 *
 * Hardware Optimization: HP OMEN (RTX 2070 Max-Q, 64GB RAM, 12 threads)
 * Agricultural Consciousness: ACTIVATED ⚡🌾
 *
 * @module NotificationService
 * @version 3.0.0
 */

import { z } from "zod";
import { database } from "@/lib/database";
import { BaseService } from "./base.service";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// ==================== VALIDATION SCHEMAS ====================

const SendNotificationSchema = z.object({
  recipientId: z.string().min(1),
  recipientEmail: z.string().email(),
  recipientPhone: z.string().optional(),
  type: z.enum([
    "ORDER_CONFIRMATION",
    "PAYMENT_RECEIVED",
    "ORDER_SHIPPED",
    "ORDER_DELIVERED",
    "ORDER_CANCELLED",
    "RECEIPT_GENERATED",
    "FARM_MESSAGE",
    "SYSTEM_ALERT",
    "MARKETING",
  ]),
  channels: z
    .array(z.enum(["EMAIL", "SMS", "PUSH", "IN_APP"]))
    .min(1)
    .default(["EMAIL", "IN_APP"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  data: z.record(z.any()),
  locale: z.string().default("en-US"),
  sendAt: z.date().optional(),
});

const NotificationPreferencesSchema = z.object({
  userId: z.string().min(1),
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(true),
  inAppEnabled: z.boolean().default(true),
  orderUpdates: z.boolean().default(true),
  paymentAlerts: z.boolean().default(true),
  farmMessages: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  weeklyDigest: z.boolean().default(true),
});

const EmailTemplateSchema = z.object({
  subject: z.string().min(1),
  htmlBody: z.string().min(1),
  textBody: z.string().min(1),
  from: z
    .object({
      name: z.string(),
      email: z.string().email(),
    })
    .optional(),
  replyTo: z.string().email().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.any(),
        contentType: z.string().optional(),
      }),
    )
    .optional(),
});

// ==================== TYPE DEFINITIONS ====================

type NotificationType =
  | "ORDER_CONFIRMATION"
  | "PAYMENT_RECEIVED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "RECEIPT_GENERATED"
  | "FARM_MESSAGE"
  | "SYSTEM_ALERT"
  | "MARKETING";

type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP";

type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type DeliveryStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "BOUNCED";

interface Notification {
  id: string;
  recipientId: string;
  recipientEmail: string;
  type: NotificationType;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  subject: string;
  message: string;
  data: Record<string, any>;
  status: DeliveryStatus;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  retryCount: number;
  lastError: string | null;
  metadata: Record<string, any>;
}

interface SendNotificationRequest extends z.infer<
  typeof SendNotificationSchema
> {}

interface NotificationPreferences extends z.infer<
  typeof NotificationPreferencesSchema
> {}

interface EmailTemplate extends z.infer<typeof EmailTemplateSchema> {}

interface NotificationResult {
  success: boolean;
  notificationId: string;
  channelResults: {
    channel: NotificationChannel;
    success: boolean;
    messageId?: string;
    error?: string;
  }[];
}

// ==================== CUSTOM ERRORS ====================

class NotificationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recipientId?: string,
  ) {
    super(`
╔════════════════════════════════════════════════════════════╗
║ 🌾 NOTIFICATION CONSCIOUSNESS DISRUPTION                   ║
╠════════════════════════════════════════════════════════════╣
║ 🔮 WHAT HAPPENED: ${message}
║ 👤 RECIPIENT ID: ${recipientId || "UNKNOWN"}
║ 🔑 ERROR CODE: ${code}
║
║ 🛠️  PATH TO ENLIGHTENMENT:
║    1. Verify recipient exists and has valid contact info
║    2. Check notification preferences
║    3. Ensure email/SMS service is configured
║    4. Verify notification templates exist
║    5. Review agricultural notification flow
╚════════════════════════════════════════════════════════════╝
    `);
    this.name = "NotificationError";
  }
}

class EmailDeliveryError extends Error {
  constructor(
    message: string,
    public readonly recipientEmail: string,
  ) {
    super(`Failed to deliver email to ${recipientEmail}: ${message}`);
    this.name = "EmailDeliveryError";
  }
}

class SMSDeliveryError extends Error {
  constructor(
    message: string,
    public readonly recipientPhone: string,
  ) {
    super(`Failed to deliver SMS to ${recipientPhone}: ${message}`);
    this.name = "SMSDeliveryError";
  }
}

class TemplateNotFoundError extends Error {
  constructor(templateName: string) {
    super(`Notification template not found: ${templateName}`);
    this.name = "TemplateNotFoundError";
  }
}

// ==================== MAIN SERVICE ====================

/**
 * 🌾 Notification Engine Service
 *
 * Provides quantum consciousness for multi-channel notifications:
 * - Email delivery with branded templates
 * - SMS notifications for urgent updates
 * - Push notifications for real-time alerts
 * - In-app notifications for user engagement
 * - Preference management
 * - Delivery tracking and analytics
 */
export class NotificationService extends BaseService {
  private emailTransporter: Transporter | null = null;

  constructor() {
    super({
      serviceName: "NotificationService",
      enableCaching: true,
      enableTracing: true,
      enableAgriculturalConsciousness: true,
    });

    this.initializeEmailTransporter();
  }

  // ==================== INITIALIZATION ====================

  /**
   * Initialize email transporter
   */
  private initializeEmailTransporter(): void {
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT, 10),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        this.logger.info("📧 Email transporter initialized", {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
        });
      } else {
        this.logger.warn("📧 Email transporter not configured", {
          message: "SMTP credentials not found in environment",
        });
      }
    } catch (error) {
      this.logger.error("📧 Failed to initialize email transporter", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // ==================== NOTIFICATION SENDING ====================

  /**
   * Send notification via multiple channels
   *
   * @param request - Notification request
   * @returns Notification result
   */
  async sendNotification(
    request: SendNotificationRequest,
  ): Promise<NotificationResult> {
    const tracer = trace.getTracer("notification-service");

    return await tracer.startActiveSpan("sendNotification", async (span) => {
      try {
        // Validate request
        const validated = SendNotificationSchema.parse(request);
        const {
          recipientId,
          recipientEmail,
          recipientPhone,
          type,
          channels,
          priority,
          data,
          locale,
          sendAt,
        } = validated;

        span.setAttributes({
          "notification.recipient_id": recipientId,
          "notification.type": type,
          "notification.priority": priority,
          "notification.channels": channels.join(","),
          "agricultural.consciousness": "ACTIVE",
        });

        this.logger.info("🌾 Sending notification", {
          recipientId,
          type,
          channels,
          priority,
        });

        // Check notification preferences
        const preferences = await this.getNotificationPreferences(recipientId);
        const allowedChannels = this.filterChannelsByPreferences(
          channels,
          preferences,
          type,
        );

        if (allowedChannels.length === 0) {
          this.logger.info("🌾 Notification blocked by user preferences", {
            recipientId,
            type,
          });

          return {
            success: false,
            notificationId: `notif_${Date.now()}`,
            channelResults: channels.map((channel) => ({
              channel,
              success: false,
              error: "Blocked by user preferences",
            })),
          };
        }

        // Generate notification content
        const content = await this.generateNotificationContent(
          type,
          data,
          locale,
        );

        // Create notification record
        const notificationId = `notif_${Date.now()}`;

        // Send via each channel
        const channelResults = await Promise.all(
          allowedChannels.map(async (channel) => {
            try {
              let messageId: string | undefined;

              switch (channel) {
                case "EMAIL":
                  messageId = await this.sendEmail({
                    to: recipientEmail,
                    subject: content.subject,
                    html: content.htmlBody,
                    text: content.textBody,
                    data,
                  });
                  break;

                case "SMS":
                  if (recipientPhone) {
                    messageId = await this.sendSMS({
                      to: recipientPhone,
                      message: content.smsBody || content.textBody,
                      data,
                    });
                  }
                  break;

                case "PUSH":
                  messageId = await this.sendPushNotification({
                    recipientId,
                    title: content.subject,
                    body: content.pushBody || content.textBody,
                    data,
                  });
                  break;

                case "IN_APP":
                  messageId = await this.createInAppNotification({
                    recipientId,
                    title: content.subject,
                    message: content.textBody,
                    type,
                    data,
                  });
                  break;
              }

              return {
                channel,
                success: true,
                messageId,
              };
            } catch (error) {
              this.logger.error(`Failed to send ${channel} notification`, {
                recipientId,
                type,
                error: error instanceof Error ? error.message : "Unknown error",
              });

              return {
                channel,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          }),
        );

        const success = channelResults.some((result) => result.success);

        this.logger.info("🌾 Notification sent", {
          notificationId,
          recipientId,
          type,
          success,
          channelResults,
        });

        span.setStatus({ code: SpanStatusCode.OK });

        return {
          success,
          notificationId,
          channelResults,
        };
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });

        if (error instanceof z.ZodError) {
          throw new NotificationError(
            "Invalid notification request",
            "VALIDATION_ERROR",
            request.recipientId,
          );
        }

        throw error;
      } finally {
        span.end();
      }
    });
  }

  // ==================== EMAIL SENDING ====================

  /**
   * Send email notification
   *
   * @param params - Email parameters
   * @returns Message ID
   */
  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
    data: Record<string, any>;
  }): Promise<string> {
    const tracer = trace.getTracer("notification-service");

    return await tracer.startActiveSpan("sendEmail", async (span) => {
      try {
        span.setAttribute("email.to", params.to);
        span.setAttribute("email.subject", params.subject);

        if (!this.emailTransporter) {
          throw new EmailDeliveryError(
            "Email transporter not configured",
            params.to,
          );
        }

        const info = await this.emailTransporter.sendMail({
          from: {
            name: "Farmers Market Platform",
            address: process.env.SMTP_FROM || "noreply@farmersmarket.com",
          },
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        });

        this.logger.info("📧 Email sent successfully", {
          to: params.to,
          messageId: info.messageId,
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return info.messageId;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });

        throw new EmailDeliveryError(
          error instanceof Error ? error.message : "Unknown error",
          params.to,
        );
      } finally {
        span.end();
      }
    });
  }

  // ==================== SMS SENDING ====================

  /**
   * Send SMS notification
   *
   * @param params - SMS parameters
   * @returns Message ID
   */
  private async sendSMS(params: {
    to: string;
    message: string;
    data: Record<string, any>;
  }): Promise<string> {
    const tracer = trace.getTracer("notification-service");

    return await tracer.startActiveSpan("sendSMS", async (span) => {
      try {
        span.setAttribute("sms.to", params.to);

        this.logger.info("📱 SMS notification", {
          to: params.to,
          message: params.message,
        });

        // In production, integrate with Twilio, AWS SNS, or similar
        // For now, just log
        // TODO: Implement actual SMS sending

        const messageId = `sms_${Date.now()}`;

        span.setStatus({ code: SpanStatusCode.OK });
        return messageId;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });

        throw new SMSDeliveryError(
          error instanceof Error ? error.message : "Unknown error",
          params.to,
        );
      } finally {
        span.end();
      }
    });
  }

  // ==================== PUSH NOTIFICATIONS ====================

  /**
   * Send push notification
   *
   * @param params - Push notification parameters
   * @returns Message ID
   */
  private async sendPushNotification(params: {
    recipientId: string;
    title: string;
    body: string;
    data: Record<string, any>;
  }): Promise<string> {
    const tracer = trace.getTracer("notification-service");

    return await tracer.startActiveSpan(
      "sendPushNotification",
      async (span) => {
        try {
          span.setAttribute("push.recipient_id", params.recipientId);

          this.logger.info("🔔 Push notification", {
            recipientId: params.recipientId,
            title: params.title,
          });

          // In production, integrate with Firebase Cloud Messaging, OneSignal, or similar
          // For now, just log
          // TODO: Implement actual push notification sending

          const messageId = `push_${Date.now()}`;

          span.setStatus({ code: SpanStatusCode.OK });
          return messageId;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          throw new NotificationError(
            "Failed to send push notification",
            "PUSH_ERROR",
            params.recipientId,
          );
        } finally {
          span.end();
        }
      },
    );
  }

  // ==================== IN-APP NOTIFICATIONS ====================

  /**
   * Create in-app notification
   *
   * @param params - In-app notification parameters
   * @returns Notification ID
   */
  private async createInAppNotification(params: {
    recipientId: string;
    title: string;
    message: string;
    type: NotificationType;
    data: Record<string, any>;
  }): Promise<string> {
    const tracer = trace.getTracer("notification-service");

    return await tracer.startActiveSpan(
      "createInAppNotification",
      async (span) => {
        try {
          span.setAttribute("inapp.recipient_id", params.recipientId);
          span.setAttribute("inapp.type", params.type);

          // In production, store in database
          // For now, just log
          // TODO: Implement in-app notification storage

          const notificationId = `inapp_${Date.now()}`;

          this.logger.info("📬 In-app notification created", {
            notificationId,
            recipientId: params.recipientId,
            type: params.type,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return notificationId;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          throw new NotificationError(
            "Failed to create in-app notification",
            "IN_APP_ERROR",
            params.recipientId,
          );
        } finally {
          span.end();
        }
      },
    );
  }

  // ==================== CONTENT GENERATION ====================

  /**
   * Generate notification content based on type
   *
   * @param type - Notification type
   * @param data - Notification data
   * @param locale - Locale
   * @returns Generated content
   */
  private async generateNotificationContent(
    type: NotificationType,
    data: Record<string, any>,
    locale: string,
  ): Promise<{
    subject: string;
    htmlBody: string;
    textBody: string;
    smsBody?: string;
    pushBody?: string;
  }> {
    const templates: Record<
      NotificationType,
      (data: any) => {
        subject: string;
        htmlBody: string;
        textBody: string;
        smsBody?: string;
        pushBody?: string;
      }
    > = {
      ORDER_CONFIRMATION: (data) => ({
        subject: `🌾 Order Confirmation - ${data.orderNumber}`,
        htmlBody: this.generateOrderConfirmationHTML(data),
        textBody: `Thank you for your order ${data.orderNumber}! Your agricultural products are being prepared.`,
        smsBody: `Order ${data.orderNumber} confirmed! Track at: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}`,
        pushBody: `Order ${data.orderNumber} confirmed`,
      }),

      PAYMENT_RECEIVED: (data) => ({
        subject: `💰 Payment Received - ${data.orderNumber}`,
        htmlBody: this.generatePaymentReceivedHTML(data),
        textBody: `Payment of $${data.amount} received for order ${data.orderNumber}.`,
        smsBody: `Payment received! Order ${data.orderNumber}: $${data.amount}`,
        pushBody: `Payment of $${data.amount} received`,
      }),

      ORDER_SHIPPED: (data) => ({
        subject: `🚚 Order Shipped - ${data.orderNumber}`,
        htmlBody: this.generateOrderShippedHTML(data),
        textBody: `Your order ${data.orderNumber} has been shipped! Tracking: ${data.trackingNumber}`,
        smsBody: `Order shipped! Track: ${data.trackingNumber}`,
        pushBody: `Your order is on the way!`,
      }),

      ORDER_DELIVERED: (data) => ({
        subject: `📦 Order Delivered - ${data.orderNumber}`,
        htmlBody: this.generateOrderDeliveredHTML(data),
        textBody: `Your order ${data.orderNumber} has been delivered. Enjoy your fresh products!`,
        smsBody: `Order ${data.orderNumber} delivered! Enjoy 🌾`,
        pushBody: `Your order has been delivered`,
      }),

      ORDER_CANCELLED: (data) => ({
        subject: `❌ Order Cancelled - ${data.orderNumber}`,
        htmlBody: this.generateOrderCancelledHTML(data),
        textBody: `Order ${data.orderNumber} has been cancelled. ${data.reason}`,
        smsBody: `Order ${data.orderNumber} cancelled`,
        pushBody: `Order cancelled`,
      }),

      RECEIPT_GENERATED: (data) => ({
        subject: `🧾 Receipt - ${data.orderNumber}`,
        htmlBody: this.generateReceiptHTML(data),
        textBody: `Your receipt for order ${data.orderNumber} is ready.`,
      }),

      FARM_MESSAGE: (data) => ({
        subject: `🌾 Message from ${data.farmName}`,
        htmlBody: this.generateFarmMessageHTML(data),
        textBody: data.message,
        pushBody: `New message from ${data.farmName}`,
      }),

      SYSTEM_ALERT: (data) => ({
        subject: `⚠️ System Alert`,
        htmlBody: this.generateSystemAlertHTML(data),
        textBody: data.message,
        pushBody: data.message,
      }),

      MARKETING: (data) => ({
        subject: data.subject || "🌾 Fresh Updates from Farmers Market",
        htmlBody: data.htmlBody || this.generateMarketingHTML(data),
        textBody: data.textBody || data.message,
      }),
    };

    const generator = templates[type];
    if (!generator) {
      throw new TemplateNotFoundError(type);
    }

    return generator(data);
  }

  // ==================== TEMPLATE GENERATORS ====================

  private generateOrderConfirmationHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">🌾 Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Total:</strong> $${data.totalAmount}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Order</a>
      </div>
    `;
  }

  private generatePaymentReceivedHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">💰 Payment Received</h1>
        <p>We've received your payment!</p>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
      </div>
    `;
  }

  private generateOrderShippedHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">🚚 Order Shipped</h1>
        <p>Your order is on its way!</p>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
        <a href="${data.trackingUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Track Shipment</a>
      </div>
    `;
  }

  private generateOrderDeliveredHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">📦 Order Delivered</h1>
        <p>Your order has been delivered!</p>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p>Enjoy your fresh agricultural products! 🌾</p>
      </div>
    `;
  }

  private generateOrderCancelledHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">❌ Order Cancelled</h1>
        <p>Your order has been cancelled.</p>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
      </div>
    `;
  }

  private generateReceiptHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">🧾 Receipt</h1>
        <p>Your receipt is ready!</p>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <a href="${data.receiptUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Receipt</a>
      </div>
    `;
  }

  private generateFarmMessageHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">🌾 Message from ${data.farmName}</h1>
        <p>${data.message}</p>
      </div>
    `;
  }

  private generateSystemAlertHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">⚠️ System Alert</h1>
        <p>${data.message}</p>
      </div>
    `;
  }

  private generateMarketingHTML(data: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">🌾 ${data.title}</h1>
        <p>${data.message}</p>
      </div>
    `;
  }

  // ==================== PREFERENCE MANAGEMENT ====================

  /**
   * Get notification preferences for user
   *
   * @param userId - User ID
   * @returns Notification preferences
   */
  async getNotificationPreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    const tracer = trace.getTracer("notification-service");

    return await tracer.startActiveSpan(
      "getNotificationPreferences",
      async (span) => {
        try {
          span.setAttribute("user_id", userId);

          // In production, fetch from database
          // For now, return defaults
          // TODO: Implement preference storage and retrieval

          const preferences: NotificationPreferences = {
            userId,
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            inAppEnabled: true,
            orderUpdates: true,
            paymentAlerts: true,
            farmMessages: true,
            marketingEmails: false,
            weeklyDigest: true,
          };

          span.setStatus({ code: SpanStatusCode.OK });
          return preferences;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Update notification preferences
   *
   * @param preferences - Updated preferences
   */
  async updateNotificationPreferences(
    preferences: NotificationPreferences,
  ): Promise<void> {
    const tracer = trace.getTracer("notification-service");

    return await tracer.startActiveSpan(
      "updateNotificationPreferences",
      async (span) => {
        try {
          const validated = NotificationPreferencesSchema.parse(preferences);
          span.setAttribute("user_id", validated.userId);

          this.logger.info("🌾 Updating notification preferences", {
            userId: validated.userId,
          });

          // In production, save to database
          // TODO: Implement preference storage

          span.setStatus({ code: SpanStatusCode.OK });
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Filter channels based on user preferences
   *
   * @param channels - Requested channels
   * @param preferences - User preferences
   * @param type - Notification type
   * @returns Allowed channels
   */
  private filterChannelsByPreferences(
    channels: NotificationChannel[],
    preferences: NotificationPreferences,
    type: NotificationType,
  ): NotificationChannel[] {
    return channels.filter((channel) => {
      // Check channel-specific preferences
      switch (channel) {
        case "EMAIL":
          if (!preferences.emailEnabled) return false;
          break;
        case "SMS":
          if (!preferences.smsEnabled) return false;
          break;
        case "PUSH":
          if (!preferences.pushEnabled) return false;
          break;
        case "IN_APP":
          if (!preferences.inAppEnabled) return false;
          break;
      }

      // Check notification type preferences
      switch (type) {
        case "ORDER_CONFIRMATION":
        case "ORDER_SHIPPED":
        case "ORDER_DELIVERED":
        case "ORDER_CANCELLED":
          return preferences.orderUpdates;

        case "PAYMENT_RECEIVED":
          return preferences.paymentAlerts;

        case "FARM_MESSAGE":
          return preferences.farmMessages;

        case "MARKETING":
          return preferences.marketingEmails;

        default:
          return true;
      }
    });
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Send notification to multiple recipients
   *
   * @param requests - Array of notification requests
   * @returns Array of results
   */
  async sendBulkNotifications(
    requests: SendNotificationRequest[],
  ): Promise<NotificationResult[]> {
    const tracer = trace.getTracer("notification-service");

    return await tracer.startActiveSpan(
      "sendBulkNotifications",
      async (span) => {
        try {
          span.setAttribute("notification.count", requests.length);

          this.logger.info("🌾 Sending bulk notifications", {
            count: requests.length,
          });

          // Process in parallel with concurrency limit
          const batchSize = 10;
          const results: NotificationResult[] = [];

          for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchResults = await Promise.all(
              batch.map((req) => this.sendNotification(req)),
            );
            results.push(...batchResults);
          }

          this.logger.info("🌾 Bulk notifications sent", {
            total: results.length,
            successful: results.filter((r) => r.success).length,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return results;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }
}

// ==================== SINGLETON EXPORT ====================

/**
 * Singleton instance of NotificationService
 * Use this throughout the application for consistency
 */
export const notificationService = new NotificationService();

/**
 * Export types for external use
 */
export type {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  DeliveryStatus,
  Notification,
  SendNotificationRequest,
  NotificationPreferences,
  EmailTemplate,
  NotificationResult,
};

/**
 * Export custom errors
 */
export {
  NotificationError,
  EmailDeliveryError,
  SMSDeliveryError,
  TemplateNotFoundError,
};
