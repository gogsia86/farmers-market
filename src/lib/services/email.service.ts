/**
 * 📧 Email Notification Service
 *
 * Divine email consciousness for the Farmers Market Platform.
 * Handles all email notifications with agricultural awareness and quantum reliability.
 *
 * Features:
 * - Order confirmations
 * - Password reset emails
 * - Email verification
 * - Order status updates
 * - Farm notifications
 * - Promotional emails
 *
 * @module EmailService
 * @version 1.0.0
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { BaseService } from "./base.service";
import { telemetryService } from "@/lib/telemetry/azure-insights";
import type { Order, Farm, Product } from "@prisma/client";
import { emailPreferencesService } from "./email-preferences.service";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Email template types
 */
export type EmailTemplate =
  | "ORDER_CONFIRMATION"
  | "ORDER_STATUS_UPDATE"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "PASSWORD_RESET"
  | "EMAIL_VERIFICATION"
  | "WELCOME"
  | "FARM_APPROVED"
  | "FARM_REJECTED"
  | "PRODUCT_LOW_STOCK"
  | "PROMOTIONAL"
  | "NEWSLETTER";

/**
 * Email priority levels
 */
export type EmailPriority = "HIGH" | "NORMAL" | "LOW";

/**
 * Email send status
 */
export type EmailStatus = "SENT" | "FAILED" | "QUEUED" | "PENDING";

/**
 * Base email options
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  priority?: EmailPriority;
  attachments?: EmailAttachment[];
  userId?: string; // User ID for preference checking
  emailType?: EmailTemplate; // Email type for preference checking
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

/**
 * Simplified user type for emails
 */
export interface EmailUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Template data for order confirmation
 */
export interface OrderConfirmationData {
  order: Order & {
    items: Array<{
      product: Product;
      quantity: number;
      price: number;
    }>;
    shippingAddress: any;
  };
  user: EmailUser;
  estimatedDelivery?: Date;
}

/**
 * Template data for password reset
 */
export interface PasswordResetData {
  user: EmailUser;
  resetToken: string;
  resetUrl: string;
  expiresIn: string;
}

/**
 * Template data for email verification
 */
export interface EmailVerificationData {
  user: EmailUser;
  verificationToken: string;
  verificationUrl: string;
  expiresIn: string;
}

/**
 * Template data for order status update
 */
export interface OrderStatusData {
  order: Order;
  user: EmailUser;
  oldStatus: string;
  newStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

/**
 * Template data for farm notifications
 */
export interface FarmNotificationData {
  farm: Farm;
  user: EmailUser;
  status: "ACTIVE" | "REJECTED";
  reason?: string;
}

/**
 * Email service configuration
 */
export interface EmailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  replyTo?: string;
}

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status: EmailStatus;
  timestamp: Date;
}

// ============================================================================
// EMAIL SERVICE
// ============================================================================

/**
 * Divine Email Service
 *
 * Handles all email notifications with agricultural consciousness.
 */
class EmailService extends BaseService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
  private config: EmailServiceConfig | null = null;
  private isEnabled: boolean = false;
  private isDevelopment: boolean = false;

  constructor() {
    super();
    this.initialize();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize email service with configuration
   */
  private initialize(): void {
    try {
      this.isDevelopment = process.env.NODE_ENV !== "production";

      // Check if email is configured
      const host = process.env.EMAIL_SERVER_HOST;
      const port = process.env.EMAIL_SERVER_PORT;
      const user = process.env.EMAIL_SERVER_USER;
      const pass = process.env.EMAIL_SERVER_PASSWORD;
      const from = process.env.EMAIL_FROM;

      if (!host || !user || !pass || !from) {
        this.logger.warn(
          "Email service not configured. Email notifications will be disabled.",
        );
        this.isEnabled = false;
        return;
      }

      // Create configuration
      this.config = {
        host,
        port: parseInt(port || "587", 10),
        secure: parseInt(port || "587", 10) === 465,
        auth: {
          user,
          pass,
        },
        from,
        replyTo: process.env.EMAIL_REPLY_TO || from,
      };

      // Create transporter
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        logger: this.isDevelopment,
        debug: this.isDevelopment,
      });

      this.isEnabled = true;
      this.logger.info("Email service initialized successfully", {
        host: this.config.host,
        port: this.config.port,
        from: this.config.from,
      });
    } catch (error) {
      this.logger.error("Failed to initialize email service", error as Error);
      this.isEnabled = false;
    }
  }

  // ==========================================================================
  // CORE EMAIL SENDING
  // ==========================================================================

  /**
   * Send email with options
   */
  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    const startTime = Date.now();

    try {
      // Check user preferences if userId and emailType provided
      if (options.userId && options.emailType) {
        const canSend = await emailPreferencesService.canSendEmail(
          options.userId,
          options.emailType,
        );

        if (!canSend) {
          this.logger.info("Email blocked by user preferences", {
            userId: options.userId,
            emailType: options.emailType,
            to: options.to,
            subject: options.subject,
          });

          return {
            success: false,
            status: "FAILED",
            error: "User has unsubscribed from this email type",
            timestamp: new Date(),
          };
        }
      }

      // Check if email is enabled
      if (!this.isEnabled || !this.transporter || !this.config) {
        this.logger.warn("Email service not enabled. Skipping email send.", {
          to: options.to,
          subject: options.subject,
        });

        // In development, log the email instead
        if (this.isDevelopment) {
          this.logger.info("📧 [DEV MODE] Email would be sent:", {
            to: options.to,
            subject: options.subject,
            html: options.html?.substring(0, 200) + "...",
          });
        }

        return {
          success: false,
          status: "FAILED",
          error: "Email service not enabled",
          timestamp: new Date(),
        };
      }

      // Send email
      const result = await this.transporter.sendMail({
        from: this.config.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo || this.config.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        priority: options.priority?.toLowerCase() as "high" | "normal" | "low",
      });

      const duration = Date.now() - startTime;

      // Track success
      telemetryService.trackEvent("email_sent", {
        to: Array.isArray(options.to) ? options.to.join(",") : options.to,
        subject: options.subject,
        messageId: result.messageId,
        duration,
        priority: options.priority || "NORMAL",
      });

      this.logger.info("Email sent successfully", {
        messageId: result.messageId,
        to: options.to,
        subject: options.subject,
        duration,
      });

      return {
        success: true,
        messageId: result.messageId,
        status: "SENT",
        timestamp: new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Track error
      telemetryService.trackException(error as Error, {
        operation: "sendEmail",
        to: Array.isArray(options.to) ? options.to.join(",") : options.to,
        subject: options.subject,
        duration,
      });

      this.logger.error("Failed to send email", error as Error, {
        to: options.to,
        subject: options.subject,
      });

      return {
        success: false,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  // ==========================================================================
  // ORDER NOTIFICATIONS
  // ==========================================================================

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    data: OrderConfirmationData,
  ): Promise<EmailSendResult> {
    this.logger.info("Sending order confirmation email", {
      orderId: data.order.id,
      userId: data.user.id,
    });

    const html = this.generateOrderConfirmationHTML(data);
    const text = this.generateOrderConfirmationText(data);

    return this.sendEmail({
      to: data.user.email,
      subject: `Order Confirmation #${data.order.id}`,
      html,
      text,
      priority: "HIGH",
      userId: data.user.id,
      emailType: "ORDER_CONFIRMATION",
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(data: OrderStatusData): Promise<EmailSendResult> {
    this.logger.info("Sending order status update email", {
      orderId: data.order.id,
      userId: data.user.id,
      newStatus: data.newStatus,
    });

    const html = this.generateOrderStatusUpdateHTML(data);
    const text = this.generateOrderStatusUpdateText(data);

    return this.sendEmail({
      to: data.user.email,
      subject: `Order ${data.order.id} Status Update`,
      html,
      text,
      priority: "NORMAL",
      userId: data.user.id,
      emailType: "ORDER_STATUS_UPDATE",
    });
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShipped(
    order: Order,
    user: EmailUser,
    trackingNumber: string,
    estimatedDelivery?: Date,
  ): Promise<EmailSendResult> {
    const data: OrderStatusData = {
      order,
      user,
      oldStatus: "PROCESSING",
      newStatus: "SHIPPED",
      trackingNumber,
      estimatedDelivery,
    };

    return this.sendOrderStatusUpdate(data);
  }

  /**
   * Send order delivered notification
   */
  async sendOrderDelivered(
    order: Order,
    user: EmailUser,
  ): Promise<EmailSendResult> {
    const data: OrderStatusData = {
      order,
      user,
      oldStatus: "SHIPPED",
      newStatus: "DELIVERED",
    };

    return this.sendOrderStatusUpdate(data);
  }

  /**
   * Send order cancelled notification
   */
  async sendOrderCancelled(
    order: Order,
    user: EmailUser,
    reason?: string,
  ): Promise<EmailSendResult> {
    const html = this.generateOrderCancelledHTML(order, user, reason);
    const text = this.generateOrderCancelledText(order, user, reason);

    return this.sendEmail({
      to: user.email,
      subject: `Order Cancelled - Order #${order.id.substring(0, 8)}`,
      html,
      text,
      priority: "HIGH",
    });
  }

  // ==========================================================================
  // AUTHENTICATION NOTIFICATIONS
  // ==========================================================================

  /**
   * Send password reset email
   */
  async sendPasswordReset(data: PasswordResetData): Promise<EmailSendResult> {
    this.logger.info("Sending password reset email", {
      userId: data.user.id,
    });

    const html = this.generatePasswordResetHTML(data);
    const text = this.generatePasswordResetText(data);

    return this.sendEmail({
      to: data.user.email,
      subject: "Reset Your Password",
      html,
      text,
      priority: "HIGH",
      userId: data.user.id,
      emailType: "PASSWORD_RESET",
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    data: EmailVerificationData,
  ): Promise<EmailSendResult> {
    this.logger.info("Sending email verification", {
      userId: data.user.id,
    });

    const html = this.generateEmailVerificationHTML(data);
    const text = this.generateEmailVerificationText(data);

    return this.sendEmail({
      to: data.user.email,
      subject: "Verify Your Email Address",
      html,
      text,
      priority: "HIGH",
      userId: data.user.id,
      emailType: "EMAIL_VERIFICATION",
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user: EmailUser): Promise<EmailSendResult> {
    this.logger.info("Sending welcome email", {
      userId: user.id,
      email: user.email,
    });

    const html = this.generateWelcomeHTML(user);
    const text = this.generateWelcomeText(user);

    return this.sendEmail({
      to: user.email,
      subject: "Welcome to Farmers Market! 🌾",
      html,
      text,
      priority: "NORMAL",
    });
  }

  // ==========================================================================
  // FARM NOTIFICATIONS
  // ==========================================================================

  /**
   * Send farm approval notification
   */
  async sendFarmApproved(data: FarmNotificationData): Promise<EmailSendResult> {
    this.logger.info("Sending farm approval email", {
      farmId: data.farm.id,
      userId: data.user.id,
    });

    const html = this.generateFarmApprovedHTML(data);
    const text = this.generateFarmApprovedText(data);

    return this.sendEmail({
      to: data.user.email,
      subject: `Farm Approved: ${data.farm.name}`,
      html,
      text,
      priority: "NORMAL",
      userId: data.user.id,
      emailType: "FARM_APPROVED",
    });
  }

  /**
   * Send farm rejection notification
   */
  async sendFarmRejected(data: FarmNotificationData): Promise<EmailSendResult> {
    this.logger.info("Sending farm rejection email", {
      farmId: data.farm.id,
      userId: data.user.id,
    });

    const html = this.generateFarmRejectedHTML(data);
    const text = this.generateFarmRejectedText(data);

    return this.sendEmail({
      to: data.user.email,
      subject: `Farm Application Update - "${data.farm.name}"`,
      html,
      text,
      priority: "HIGH",
    });
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Get status title for email subject
   */
  private getStatusTitle(status: string): string {
    const titles: Record<string, string> = {
      PENDING: "Order Received",
      CONFIRMED: "Order Confirmed",
      PROCESSING: "Order Processing",
      SHIPPED: "Order Shipped",
      DELIVERED: "Order Delivered",
      CANCELLED: "Order Cancelled",
    };

    return titles[status] || status;
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  /**
   * Format date
   */
  private formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  }

  // ==========================================================================
  // HTML TEMPLATE GENERATORS
  // ==========================================================================

  /**
   * Generate order confirmation HTML
   */
  private generateOrderConfirmationHTML(data: OrderConfirmationData): string {
    const { order, user, estimatedDelivery } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .order-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .order-items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
          .item:last-child { border-bottom: none; }
          .totals { margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.grand { font-weight: bold; font-size: 18px; border-top: 2px solid #10b981; padding-top: 15px; margin-top: 15px; }
          .button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 Order Confirmed!</h1>
          </div>

          <div class="content">
            <p>Hi ${user.name || "there"},</p>
            <p>Thank you for your order! We're preparing your fresh farm products with care.</p>

            <div class="order-info">
              <strong>Order #${order.id.substring(0, 8)}</strong><br>
              Order Date: ${this.formatDate(order.createdAt)}<br>
              ${estimatedDelivery ? `Estimated Delivery: ${this.formatDate(estimatedDelivery)}` : ""}
            </div>

            <div class="order-items">
              <h3>Order Items</h3>
              ${order.items
                .map(
                  (item) => `
                <div class="item">
                  <div>
                    <strong>${item.product.name}</strong><br>
                    <small>Quantity: ${item.quantity}</small>
                  </div>
                  <div>${this.formatCurrency(item.price * item.quantity)}</div>
                </div>
              `,
                )
                .join("")}
            </div>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${this.formatCurrency(Number(order.subtotal) || 0)}</span>
              </div>
              <div class="total-row">
                <span>Shipping:</span>
                <span>${this.formatCurrency(Number(order.deliveryFee) || 0)}</span>
              </div>
              <div class="total-row">
                <span>Tax:</span>
                <span>${this.formatCurrency(Number(order.tax) || 0)}</span>
              </div>
              <div class="total-row grand">
                <span>Total:</span>
                <span>${this.formatCurrency(Number(order.total))}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">
                View Order Details
              </a>
            </div>

            <p style="margin-top: 30px;">
              <strong>Shipping Address:</strong><br>
              ${order.shippingAddress?.street || ""}<br>
              ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.zip || ""}<br>
              ${order.shippingAddress?.country || ""}
            </p>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@farmersmarket.com</p>
            <p>&copy; ${new Date().getFullYear()} Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate order confirmation text (plain text version)
   */
  private generateOrderConfirmationText(data: OrderConfirmationData): string {
    const { order, user, estimatedDelivery } = data;

    return `
Order Confirmed! 🌾

Hi ${user.name || "there"},

Thank you for your order! We're preparing your fresh farm products with care.

Order #${order.id.substring(0, 8)}
Order Date: ${this.formatDate(order.createdAt)}
${estimatedDelivery ? `Estimated Delivery: ${this.formatDate(estimatedDelivery)}` : ""}

ORDER ITEMS:
${order.items.map((item) => `- ${item.product.name} (x${item.quantity}): ${this.formatCurrency(Number(item.price) * item.quantity)}`).join("\n")}

TOTALS:
Subtotal: ${this.formatCurrency(Number(order.subtotal) || 0)}
Shipping: ${this.formatCurrency(Number(order.deliveryFee) || 0)}
Tax: ${this.formatCurrency(Number(order.tax) || 0)}
Total: ${this.formatCurrency(Number(order.total))}

SHIPPING ADDRESS:
${order.shippingAddress?.street || ""}
${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.zip || ""}
${order.shippingAddress?.country || ""}

View your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}

Questions? Contact us at support@farmersmarket.com

© ${new Date().getFullYear()} Farmers Market. All rights reserved.
    `.trim();
  }

  /**
   * Generate order status update HTML
   */
  private generateOrderStatusUpdateHTML(data: OrderStatusData): string {
    const { order, user, newStatus, trackingNumber, estimatedDelivery } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .status-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Update</h1>
          </div>

          <div class="content">
            <p>Hi ${user.name || "there"},</p>
            <p>Your order has been updated!</p>

            <div style="text-align: center;">
              <span class="status-badge">${this.getStatusTitle(newStatus)}</span>
            </div>

            <div class="info-box">
              <strong>Order #${order.id.substring(0, 8)}</strong><br>
              Status: ${this.getStatusTitle(newStatus)}<br>
              ${trackingNumber ? `Tracking Number: ${trackingNumber}<br>` : ""}
              ${estimatedDelivery ? `Estimated Delivery: ${this.formatDate(estimatedDelivery)}` : ""}
            </div>

            ${
              newStatus === "SHIPPED" && trackingNumber
                ? `
              <p>Your order is on its way! You can track your shipment using the tracking number above.</p>
            `
                : ""
            }

            ${
              newStatus === "DELIVERED"
                ? `
              <p>Your order has been delivered! We hope you enjoy your fresh farm products. 🌾</p>
            `
                : ""
            }

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">
                View Order Details
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@farmersmarket.com</p>
            <p>&copy; ${new Date().getFullYear()} Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate order status update text
   */
  private generateOrderStatusUpdateText(data: OrderStatusData): string {
    const { order, user, newStatus, trackingNumber, estimatedDelivery } = data;

    return `
Order Update 📦

Hi ${user.name || "there"},

Your order has been updated!

Order #${order.id.substring(0, 8)}
Status: ${this.getStatusTitle(newStatus)}
${trackingNumber ? `Tracking Number: ${trackingNumber}` : ""}
${estimatedDelivery ? `Estimated Delivery: ${this.formatDate(estimatedDelivery)}` : ""}

${newStatus === "SHIPPED" && trackingNumber ? "Your order is on its way! You can track your shipment using the tracking number above." : ""}
${newStatus === "DELIVERED" ? "Your order has been delivered! We hope you enjoy your fresh farm products. 🌾" : ""}

View your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}

Questions? Contact us at support@farmersmarket.com

© ${new Date().getFullYear()} Farmers Market. All rights reserved.
    `.trim();
  }

  /**
   * Generate order cancelled HTML
   */
  private generateOrderCancelledHTML(
    order: Order,
    user: EmailUser,
    reason?: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .info-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
          </div>

          <div class="content">
            <p>Hi ${user.name || "there"},</p>
            <p>Your order has been cancelled.</p>

            <div class="info-box">
              <strong>Order #${order.id.substring(0, 8)}</strong><br>
              Status: Cancelled<br>
              ${reason ? `Reason: ${reason}<br>` : ""}
              Refund Amount: ${this.formatCurrency(Number(order.total))}
            </div>

            <p>If you paid for this order, a refund will be processed within 5-7 business days.</p>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">
                Continue Shopping
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@farmersmarket.com</p>
            <p>&copy; ${new Date().getFullYear()} Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate order cancelled text
   */
  private generateOrderCancelledText(
    order: Order,
    user: EmailUser,
    reason?: string,
  ): string {
    return `
Order Cancelled

Hi ${user.name || "there"},

Your order has been cancelled.

Order #${order.id.substring(0, 8)}
Status: Cancelled
${reason ? `Reason: ${reason}` : ""}
Refund Amount: ${this.formatCurrency(Number(order.total))}

If you paid for this order, a refund will be processed within 5-7 business days.

Continue shopping: ${process.env.NEXT_PUBLIC_APP_URL}

Questions? Contact us at support@farmersmarket.com

© ${new Date().getFullYear()} Farmers Market. All rights reserved.
    `.trim();
  }

  /**
   * Generate password reset HTML
   */
  private generatePasswordResetHTML(data: PasswordResetData): string {
    const { user, resetUrl, expiresIn } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .warning-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>

          <div class="content">
            <p>Hi ${user.name || "there"},</p>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">
                Reset Password
              </a>
            </div>

            <div class="warning-box">
              <strong>⚠️ Important:</strong> This link expires in ${expiresIn}. If you didn't request this password reset, please ignore this email.
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@farmersmarket.com</p>
            <p>&copy; ${new Date().getFullYear()} Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset text
   */
  private generatePasswordResetText(data: PasswordResetData): string {
    const { user, resetUrl, expiresIn } = data;

    return `
Password Reset 🔐

Hi ${user.name || "there"},

We received a request to reset your password. Click the link below to create a new password.

Reset your password: ${resetUrl}

⚠️ Important: This link expires in ${expiresIn}. If you didn't request this password reset, please ignore this email.

Questions? Contact us at support@farmersmarket.com

© ${new Date().getFullYear()} Farmers Market. All rights reserved.
    `.trim();
  }

  /**
   * Generate email verification HTML
   */
  private generateEmailVerificationHTML(data: EmailVerificationData): string {
    const { user, verificationUrl, expiresIn } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .info-box { background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email</h1>
          </div>

          <div class="content">
            <p>Hi ${user.name || "there"},</p>
            <p>Welcome to Farmers Market! Please verify your email address to get started.</p>

            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">
                Verify Email Address
              </a>
            </div>

            <div class="info-box">
              <strong>ℹ️ Note:</strong> This link expires in ${expiresIn}.
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #10b981;">${verificationUrl}</p>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@farmersmarket.com</p>
            <p>&copy; ${new Date().getFullYear()} Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate email verification text
   */
  private generateEmailVerificationText(data: EmailVerificationData): string {
    const { user, verificationUrl, expiresIn } = data;

    return `
Verify Your Email ✉️

Hi ${user.name || "there"},

Welcome to Farmers Market! Please verify your email address to get started.

Verify your email: ${verificationUrl}

ℹ️ Note: This link expires in ${expiresIn}.

Questions? Contact us at support@farmersmarket.com

© ${new Date().getFullYear()} Farmers Market. All rights reserved.
    `.trim();
  }

  /**
   * Generate welcome HTML
   */
  private generateWelcomeHTML(user: EmailUser): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Farmers Market</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .feature { padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
          .feature:last-child { border-bottom: none; }
          .button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 Welcome to Farmers Market!</h1>
          </div>

          <div class="content">
            <p>Hi ${user.name || "there"},</p>
            <p>We're thrilled to have you join our community of food lovers and local farmers!</p>

            <h3>What you can do:</h3>
            <div class="feature">
              <strong>🛒 Shop Fresh Products</strong><br>
              Browse fresh, locally-sourced products from farms in your area.
            </div>
            <div class="feature">
              <strong>🌱 Support Local Farms</strong><br>
              Connect directly with farmers and support sustainable agriculture.
            </div>
            <div class="feature">
              <strong>📦 Easy Delivery</strong><br>
              Get fresh products delivered right to your door.
            </div>
            <div class="feature">
              <strong>❤️ Save Favorites</strong><br>
              Create wishlists and track your favorite farms and products.
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">
                Start Shopping
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@farmersmarket.com</p>
            <p>&copy; ${new Date().getFullYear()} Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate welcome text
   */
  private generateWelcomeText(user: EmailUser): string {
    return `
Welcome to Farmers Market! 🌾

Hi ${user.name || "there"},

We're thrilled to have you join our community of food lovers and local farmers!

What you can do:

🛒 Shop Fresh Products
Browse fresh, locally-sourced products from farms in your area.

🌱 Support Local Farms
Connect directly with farmers and support sustainable agriculture.

📦 Easy Delivery
Get fresh products delivered right to your door.

❤️ Save Favorites
Create wishlists and track your favorite farms and products.

Start shopping: ${process.env.NEXT_PUBLIC_APP_URL}

Questions? Contact us at support@farmersmarket.com

© ${new Date().getFullYear()} Farmers Market. All rights reserved.
    `.trim();
  }

  /**
   * Generate farm approved HTML
   */
  private generateFarmApprovedHTML(data: FarmNotificationData): string {
    const { farm, user } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Farm Approved</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .success-box { background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>

          <div class="content">
            <p>Hi ${user.name || "there"},</p>

            <div class="success-box">
              <h2 style="margin-top: 0;">Your farm "${farm.name}" has been approved!</h2>
              <p>You can now start listing products and accepting orders.</p>
            </div>

            <h3>Next Steps:</h3>
            <ol>
              <li>Add your first products to your farm catalog</li>
              <li>Set up your shipping and payment methods</li>
              <li>Share your farm profile with customers</li>
              <li>Start receiving and fulfilling orders</li>
            </ol>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/farmer/farms/${farm.id}" class="button">
                Manage Your Farm
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@farmersmarket.com</p>
            <p>&copy; ${new Date().getFullYear()} Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate farm approved text
   */
  private generateFarmApprovedText(data: FarmNotificationData): string {
    const { farm, user } = data;

    return `
Congratulations! 🎉

Hi ${user.name || "there"},

Your farm "${farm.name}" has been approved! You can now start listing products and accepting orders.

Next Steps:
1. Add your first products to your farm catalog
2. Set up your shipping and payment methods
3. Share your farm profile with customers
4. Start receiving and fulfilling orders

Manage your farm: ${process.env.NEXT_PUBLIC_APP_URL}/farmer/farms/${farm.id}

Questions? Contact us at support@farmersmarket.com

© ${new Date().getFullYear()} Farmers Market. All rights reserved.
    `.trim();
  }

  /**
   * Generate farm rejected HTML
   */
  private generateFarmRejectedHTML(data: FarmNotificationData): string {
    const { farm, user, reason } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Farm Application Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .info-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Farm Application Update</h1>
          </div>

          <div class="content">
            <p>Hi ${user.name || "there"},</p>
            <p>Thank you for your interest in joining Farmers Market. After reviewing your application for "${farm.name}", we're unable to approve it at this time.</p>

            ${
              reason
                ? `
            <div class="info-box">
              <strong>Reason:</strong><br>
              ${reason}
            </div>
            `
                : ""
            }

            <p>We encourage you to review our farm guidelines and resubmit your application with any necessary updates.</p>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/farmer/farms/${farm.id}/edit" class="button">
                Update Your Application
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@farmersmarket.com</p>
            <p>&copy; ${new Date().getFullYear()} Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate farm rejected text
   */
  private generateFarmRejectedText(data: FarmNotificationData): string {
    const { farm, user, reason } = data;

    return `
Farm Application Update

Hi ${user.name || "there"},

Thank you for your interest in joining Farmers Market. After reviewing your application for "${farm.name}", we're unable to approve it at this time.

${reason ? `Reason: ${reason}` : ""}

We encourage you to review our farm guidelines and resubmit your application with any necessary updates.

Update your application: ${process.env.NEXT_PUBLIC_APP_URL}/farmer/farms/${farm.id}/edit

Questions? Contact us at support@farmersmarket.com

© ${new Date().getFullYear()} Farmers Market. All rights reserved.
    `.trim();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of the email service
 */
export const emailService = new EmailService();

/**
 * Type export for testing and mocking
 */
export type { EmailService as EmailServiceType };
