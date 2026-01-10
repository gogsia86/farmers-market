/**
 * SMS Service
 *
 * Handles SMS sending via Twilio with retry logic, rate limiting, and logging.
 * Supports templates, verification codes, order updates, and general messaging.
 *
 * @module lib/services/sms.service
 */

import { database } from "@/lib/database";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { Twilio } from "twilio";

import { logger } from '@/lib/monitoring/logger';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface SMSOptions {
  to: string;
  message: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export interface SMSTemplate {
  name: string;
  message: string;
}

// ============================================
// SMS TEMPLATES
// ============================================

export const SMS_TEMPLATES: Record<string, (params: any) => string> = {
  ORDER_CONFIRMED: (params: { orderNumber: string; farmName: string }) =>
    `✅ Your order #${params.orderNumber} from ${params.farmName} has been confirmed! We'll notify you when it's ready for pickup.`,

  ORDER_READY: (params: { orderNumber: string; farmName: string; pickupTime?: string }) =>
    `🎉 Your order #${params.orderNumber} from ${params.farmName} is ready for pickup${params.pickupTime ? ` at ${params.pickupTime}` : ''}!`,

  ORDER_CANCELLED: (params: { orderNumber: string; reason?: string }) =>
    `❌ Order #${params.orderNumber} has been cancelled${params.reason ? `: ${params.reason}` : ''}. Contact support if you need help.`,

  VERIFICATION_CODE: (params: { code: string; expiryMinutes: number }) =>
    `Your Farmers Market verification code is: ${params.code}. Valid for ${params.expiryMinutes} minutes. Do not share this code.`,

  PASSWORD_RESET: (params: { code: string; expiryMinutes: number }) =>
    `Your password reset code is: ${params.code}. Valid for ${params.expiryMinutes} minutes. If you didn't request this, please ignore.`,

  DELIVERY_UPDATE: (params: { orderNumber: string; status: string; estimatedTime?: string }) =>
    `📦 Delivery update for order #${params.orderNumber}: ${params.status}${params.estimatedTime ? `. ETA: ${params.estimatedTime}` : ''}`,

  LOW_STOCK_ALERT: (params: { productName: string; currentStock: number }) =>
    `⚠️ Low stock alert: ${params.productName} has only ${params.currentStock} units left. Restock soon!`,

  NEW_REVIEW: (params: { customerName: string; rating: number; productName: string }) =>
    `⭐ New ${params.rating}-star review from ${params.customerName} on ${params.productName}. Check your dashboard!`,

  PAYMENT_FAILED: (params: { orderNumber: string }) =>
    `💳 Payment failed for order #${params.orderNumber}. Please update your payment method to complete your order.`,

  PAYMENT_RECEIVED: (params: { orderNumber: string; amount: string }) =>
    `✅ Payment received: $${params.amount} for order #${params.orderNumber}. Thank you for your purchase!`,

  FARM_APPROVED: (params: { farmName: string }) =>
    `🎉 Congratulations! Your farm "${params.farmName}" has been approved. You can now start listing products!`,

  FARM_REJECTED: (params: { farmName: string; reason: string }) =>
    `❌ Your farm application "${params.farmName}" needs attention: ${params.reason}. Please contact support.`,

  WELCOME: (params: { firstName: string }) =>
    `👋 Welcome to Farmers Market, ${params.firstName}! Discover fresh, local produce from farms near you.`,
};

// ============================================
// SMS SERVICE CLASS
// ============================================

export class SMSService {
  private client: Twilio | null = null;
  private isConfigured = false;
  private phoneNumber: string | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  /**
   * Initialize Twilio client
   */
  private async initialize(): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || null;

      if (!accountSid || !authToken || !this.phoneNumber) {
        logger.warn(
          "⚠️ SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER"
        );
        this.isConfigured = false;
        return;
      }

      // Initialize Twilio client
      this.client = new Twilio(accountSid, authToken);

      // Verify credentials by checking account
      await this.client.api.accounts(accountSid).fetch();

      this.isConfigured = true;
      logger.info("✅ SMS service initialized successfully");
    } catch (error) {
      logger.error("❌ Failed to initialize SMS service:", {
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
   * Send SMS message
   *
   * @param options - SMS options
   * @returns Send result
   */
  async sendSMS(options: SMSOptions): Promise<SendSMSResult> {
    await this.ensureInitialized();

    const tracer = trace.getTracer("sms-service");

    return await tracer.startActiveSpan("sendSMS", async (span) => {
      span.setAttributes({
        "sms.to": this.maskPhoneNumber(options.to),
        "sms.length": options.message.length,
        "sms.has_user": !!options.userId,
      });

      const timestamp = new Date();

      try {
        // Check if service is configured
        if (!this.isConfigured || !this.client || !this.phoneNumber) {
          logger.info(
            `📱 [SMS NOT CONFIGURED] Would send to ${options.to}: ${options.message}`
          );
          span.setStatus({ code: SpanStatusCode.OK });
          span.setAttributes({
            "sms.simulated": true,
          });

          return {
            success: true,
            messageId: `simulated-${Date.now()}`,
            timestamp,
          };
        }

        // Validate phone number format
        const cleanPhone = this.cleanPhoneNumber(options.to);
        if (!this.isValidPhoneNumber(cleanPhone)) {
          throw new Error(`Invalid phone number format: ${options.to}`);
        }

        // Send SMS via Twilio
        const message = await this.client.messages.create({
          body: options.message,
          from: this.phoneNumber,
          to: cleanPhone,
        });

        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttributes({
          "sms.message_id": message.sid,
          "sms.status": message.status,
        });

        logger.info(
          `✅ SMS sent successfully to ${this.maskPhoneNumber(cleanPhone)}: ${message.sid}`
        );

        // Log to database if userId provided
        if (options.userId) {
          await this.logSMS({
            userId: options.userId,
            phoneNumber: cleanPhone,
            message: options.message,
            status: "SENT",
            messageId: message.sid,
            metadata: options.metadata,
          });
        }

        return {
          success: true,
          messageId: message.sid,
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
          `❌ Failed to send SMS to ${this.maskPhoneNumber(options.to)}:`, {
      error: error instanceof Error ? error.message : String(error),
    });

        // Log failure to database if userId provided
        if (options.userId) {
          await this.logSMS({
            userId: options.userId,
            phoneNumber: this.cleanPhoneNumber(options.to),
            message: options.message,
            status: "FAILED",
            errorMessage,
            metadata: options.metadata,
          });
        }

        return {
          success: false,
          error: errorMessage,
          timestamp,
        };
      } finally {
        span.end();
      }
    });
  }

  /**
   * Send SMS using a template
   *
   * @param to - Recipient phone number
   * @param templateName - Template name
   * @param params - Template parameters
   * @param userId - Optional user ID
   * @returns Send result
   */
  async sendTemplateSMS(
    to: string,
    templateName: string,
    params: any,
    userId?: string
  ): Promise<SendSMSResult> {
    const template = SMS_TEMPLATES[templateName];

    if (!template) {
      throw new Error(`SMS template not found: ${templateName}`);
    }

    const message = template(params);

    return await this.sendSMS({
      to,
      message,
      userId,
      metadata: {
        template: templateName,
        params,
      },
    });
  }

  /**
   * Send order confirmation SMS
   */
  async sendOrderConfirmationSMS(
    phoneNumber: string,
    userId: string,
    orderNumber: string,
    farmName: string
  ): Promise<SendSMSResult> {
    return await this.sendTemplateSMS(
      phoneNumber,
      "ORDER_CONFIRMED",
      { orderNumber, farmName },
      userId
    );
  }

  /**
   * Send order ready SMS
   */
  async sendOrderReadySMS(
    phoneNumber: string,
    userId: string,
    orderNumber: string,
    farmName: string,
    pickupTime?: string
  ): Promise<SendSMSResult> {
    return await this.sendTemplateSMS(
      phoneNumber,
      "ORDER_READY",
      { orderNumber, farmName, pickupTime },
      userId
    );
  }

  /**
   * Send verification code SMS
   */
  async sendVerificationCodeSMS(
    phoneNumber: string,
    code: string,
    expiryMinutes: number = 10,
    userId?: string
  ): Promise<SendSMSResult> {
    return await this.sendTemplateSMS(
      phoneNumber,
      "VERIFICATION_CODE",
      { code, expiryMinutes },
      userId
    );
  }

  /**
   * Send password reset code SMS
   */
  async sendPasswordResetSMS(
    phoneNumber: string,
    code: string,
    expiryMinutes: number = 10,
    userId?: string
  ): Promise<SendSMSResult> {
    return await this.sendTemplateSMS(
      phoneNumber,
      "PASSWORD_RESET",
      { code, expiryMinutes },
      userId
    );
  }

  /**
   * Send low stock alert SMS
   */
  async sendLowStockAlertSMS(
    phoneNumber: string,
    userId: string,
    productName: string,
    currentStock: number
  ): Promise<SendSMSResult> {
    return await this.sendTemplateSMS(
      phoneNumber,
      "LOW_STOCK_ALERT",
      { productName, currentStock },
      userId
    );
  }

  /**
   * Send payment failed SMS
   */
  async sendPaymentFailedSMS(
    phoneNumber: string,
    userId: string,
    orderNumber: string
  ): Promise<SendSMSResult> {
    return await this.sendTemplateSMS(
      phoneNumber,
      "PAYMENT_FAILED",
      { orderNumber },
      userId
    );
  }

  /**
   * Clean phone number (remove spaces, dashes, parentheses)
   */
  private cleanPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, "");

    // If no country code, assume US/Canada (+1)
    if (!cleaned.startsWith("+")) {
      cleaned = `+1${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Must start with + and have at least 10 digits
    const regex = /^\+\d{10,15}$/;
    return regex.test(phone);
  }

  /**
   * Mask phone number for logging (show only last 4 digits)
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) return "****";
    return `****${phone.slice(-4)}`;
  }

  /**
   * Log SMS to database
   */
  private async logSMS(data: {
    userId: string;
    phoneNumber: string;
    message: string;
    status: string;
    messageId?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await database.sMSLog.create({
        data: {
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          message: data.message,
          status: data.status,
          messageId: data.messageId,
          errorMessage: data.errorMessage,
          metadata: data.metadata || {},
          sentAt: data.status === "SENT" ? new Date() : undefined,
          failedAt: data.status === "FAILED" ? new Date() : undefined,
        },
      });
    } catch (error) {
      logger.error("Failed to log SMS to database:", {
      error: error instanceof Error ? error.message : String(error),
    });
      // Don't throw - logging failure shouldn't break SMS sending
    }
  }

  /**
   * Get SMS sending statistics for a user
   */
  async getUserSMSStats(userId: string): Promise<{
    total: number;
    sent: number;
    failed: number;
    lastSentAt: Date | null;
  }> {
    try {
      const logs = await database.sMSLog.findMany({
        where: { userId },
        select: {
          status: true,
          sentAt: true,
        },
      });

      const sent = logs.filter((log: any) => log.status === "SENT");
      const failed = logs.filter((log: any) => log.status === "FAILED");
      const lastSentAt =
        sent.length > 0
          ? new Date(
            Math.max(...sent.map((log: any) => log.sentAt?.getTime() || 0))
          )
          : null;

      return {
        total: logs.length,
        sent: sent.length,
        failed: failed.length,
        lastSentAt,
      };
    } catch (error) {
      logger.error("Failed to get user SMS stats:", {
      error: error instanceof Error ? error.message : String(error),
    });
      return {
        total: 0,
        sent: 0,
        failed: 0,
        lastSentAt: null,
      };
    }
  }

  /**
   * Check if service is configured and ready
   */
  isReady(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    ready: boolean;
    phoneNumber: string | null;
  } {
    return {
      configured: this.isConfigured,
      ready: this.isReady(),
      phoneNumber: this.phoneNumber
        ? this.maskPhoneNumber(this.phoneNumber)
        : null,
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const smsService = new SMSService();

// ============================================
// EXPORTS
// ============================================

export default smsService;
