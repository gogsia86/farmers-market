/**
 * EMAIL SERVICE - Divine Email Management
 *
 * Handles all email communications for the platform:
 * - Transactional emails (orders, confirmations)
 * - Notifications (farm approvals, support tickets)
 * - Marketing emails (newsletters, promotions)
 *
 * Divine Patterns Applied:
 * - Agricultural Quantum Mastery (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - Performance Reality Bending (03_PERFORMANCE_REALITY_BENDING)
 * - Testing & Security Divinity (05_TESTING_SECURITY_DIVINITY)
 *
 * ⚡ PERFORMANCE: Uses lazy loading for nodemailer (~50-80 KB savings)
 *
 * @module EmailService
 */

import { createTransporter } from "@/lib/lazy/email.lazy";
import type { Transporter } from "nodemailer";

// ============================================================================
// TYPES
// ============================================================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface WelcomeEmailData {
  firstName: string;
  email: string;
  loginUrl: string;
}

export interface FarmApprovalEmailData {
  farmName: string;
  farmerName: string;
  email: string;
  dashboardUrl: string;
}

export interface FarmRejectionEmailData {
  farmName: string;
  farmerName: string;
  email: string;
  reason?: string;
  reapplyUrl: string;
}

export interface SupportTicketEmailData {
  ticketId: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface OrderConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  email: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryDate: string;
  trackingUrl: string;
}

// ============================================================================
// EMAIL SERVICE CLASS
// ============================================================================

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Start initialization but don't wait
    this.initPromise = this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter (lazy-loaded)
   */
  private async initializeTransporter(): Promise<void> {
    try {
      // Check if SMTP is configured
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT
        ? Number.parseInt(process.env.SMTP_PORT, 10)
        : undefined;
      const smtpUser = process.env.SMTP_USER;
      const smtpPassword = process.env.SMTP_PASSWORD;
      const smtpSecure = process.env.SMTP_SECURE === "true";

      if (!smtpHost || !smtpPort) {
        console.warn("⚠️  SMTP not configured - emails will be logged only");
        this.isConfigured = false;
        return;
      }

      this.transporter = await createTransporter({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure, // true for 465, false for other ports
        auth:
          smtpUser && smtpPassword
            ? {
                user: smtpUser,
                pass: smtpPassword,
              }
            : undefined,
      });

      this.isConfigured = true;
      console.log("✅ Email service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Ensure transporter is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    await this.ensureInitialized();

    try {
      // If not configured, log and return success (dev mode)
      if (!this.isConfigured || !this.transporter) {
        console.log("📧 [EMAIL DEV MODE]", {
          to: options.to,
          subject: options.subject,
          html: `${options.html?.substring(0, 100)}...`,
        });
        return true;
      }

      // Send email
      const info = await this.transporter.sendMail({
        from:
          options.from || process.env.SMTP_FROM || "noreply@farmersmarket.app",
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      });

      console.log("✅ Email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = this.generateWelcomeEmailTemplate(data);
    const text = `Welcome to Farmers Market, ${data.firstName}!\n\nLog in at: ${data.loginUrl}`;

    return this.sendEmail({
      to: data.email,
      subject: "🌾 Welcome to Farmers Market Platform!",
      html,
      text,
    });
  }

  /**
   * Send farm approval email
   */
  async sendFarmApprovalEmail(data: FarmApprovalEmailData): Promise<boolean> {
    const html = this.generateFarmApprovalTemplate(data);
    const text = `Congratulations ${data.farmerName}! Your farm "${data.farmName}" has been approved. Access your dashboard at: ${data.dashboardUrl}`;

    return this.sendEmail({
      to: data.email,
      subject: "✅ Your Farm Has Been Approved!",
      html,
      text,
    });
  }

  /**
   * Send farm rejection email
   */
  async sendFarmRejectionEmail(data: FarmRejectionEmailData): Promise<boolean> {
    const html = this.generateFarmRejectionTemplate(data);
    const reasonText = data.reason ? `Reason: ${data.reason}` : "";
    const text = `Dear ${data.farmerName}, unfortunately your farm application for "${data.farmName}" could not be approved at this time. ${reasonText} You can reapply at: ${data.reapplyUrl}`;

    return this.sendEmail({
      to: data.email,
      subject: "Farm Application Status Update",
      html,
      text,
    });
  }

  /**
   * Send support ticket confirmation
   */
  async sendSupportTicketEmail(data: SupportTicketEmailData): Promise<boolean> {
    const html = this.generateSupportTicketTemplate(data);
    const text = `Support Ticket #${data.ticketId} Created\n\nDear ${data.userName},\n\nWe've received your support request: "${data.subject}"\n\nOur team will respond within 24-48 hours.`;

    return this.sendEmail({
      to: data.email,
      subject: `Support Ticket #${data.ticketId} - ${data.subject}`,
      html,
      text,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    data: OrderConfirmationEmailData,
  ): Promise<boolean> {
    const html = this.generateOrderConfirmationTemplate(data);
    const text = `Order Confirmation #${data.orderNumber}\n\nThank you for your order, ${data.customerName}!\n\nTotal: $${data.total.toFixed(2)}\nDelivery Date: ${data.deliveryDate}\n\nTrack your order: ${data.trackingUrl}`;

    return this.sendEmail({
      to: data.email,
      subject: `Order Confirmation #${data.orderNumber}`,
      html,
      text,
    });
  }

  // ============================================================================
  // EMAIL TEMPLATES
  // ============================================================================

  private generateWelcomeEmailTemplate(data: WelcomeEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Farmers Market</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🌾 Welcome to Farmers Market!</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.firstName},</p>

    <p style="font-size: 16px;">Welcome to the Farmers Market Platform! We're thrilled to have you join our community of farmers and food lovers.</p>

    <p style="font-size: 16px;">Here's what you can do:</p>
    <ul style="font-size: 16px;">
      <li>🌱 Browse local farms and fresh products</li>
      <li>🛒 Shop directly from farmers</li>
      <li>📦 Get fresh deliveries to your door</li>
      <li>🤝 Support local agriculture</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.loginUrl}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Get Started</a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      If you have any questions, feel free to contact our support team.
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      Best regards,<br>
      The Farmers Market Team
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
    <p>© ${new Date().getFullYear()} Farmers Market Platform. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  private generateFarmApprovalTemplate(data: FarmApprovalEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Farm Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Congratulations!</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.farmerName},</p>

    <p style="font-size: 16px;">Great news! Your farm <strong>"${data.farmName}"</strong> has been approved and is now live on the Farmers Market Platform! 🎉</p>

    <p style="font-size: 16px;">You can now:</p>
    <ul style="font-size: 16px;">
      <li>✅ Add and manage your products</li>
      <li>📊 View your farm analytics</li>
      <li>📦 Process customer orders</li>
      <li>💰 Track your revenue</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Your Dashboard</a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      If you need any assistance getting started, our support team is here to help!
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      Welcome to the community,<br>
      The Farmers Market Team
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
    <p>© ${new Date().getFullYear()} Farmers Market Platform. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  private generateFarmRejectionTemplate(data: FarmRejectionEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Farm Application Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📋 Application Update</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.farmerName},</p>

    <p style="font-size: 16px;">Thank you for your interest in joining the Farmers Market Platform. After reviewing your application for <strong>"${data.farmName}"</strong>, we regret to inform you that we cannot approve it at this time.</p>

    ${data.reason ? `<p style="font-size: 16px;"><strong>Reason:</strong> ${data.reason}</p>` : ""}

    <p style="font-size: 16px;">We encourage you to address any concerns and reapply. Our team is happy to provide guidance on meeting our requirements.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.reapplyUrl}" style="background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reapply</a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      If you have questions about this decision, please contact our support team.
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      Best regards,<br>
      The Farmers Market Team
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
    <p>© ${new Date().getFullYear()} Farmers Market Platform. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  private generateSupportTicketTemplate(data: SupportTicketEmailData): string {
    const priorityColors = {
      LOW: "#10b981",
      MEDIUM: "#f59e0b",
      HIGH: "#f97316",
      URGENT: "#ef4444",
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Ticket Created</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎫 Support Ticket Created</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.userName},</p>

    <p style="font-size: 16px;">We've received your support request and created ticket <strong>#${data.ticketId}</strong>.</p>

    <div style="background: #f9fafb; border-left: 4px solid ${priorityColors[data.priority]}; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Priority:</strong> <span style="color: ${priorityColors[data.priority]};">${data.priority}</span></p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;"><strong>Subject:</strong> ${data.subject}</p>
    </div>

    <p style="font-size: 16px;"><strong>Your Message:</strong></p>
    <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
      <p style="margin: 0; font-size: 14px; color: #374151;">${data.message}</p>
    </div>

    <p style="font-size: 16px; margin-top: 20px;">Our support team typically responds within <strong>24-48 hours</strong>. We'll send you an email as soon as we have an update.</p>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Thank you for your patience!
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      Best regards,<br>
      The Farmers Market Support Team
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
    <p>© ${new Date().getFullYear()} Farmers Market Platform. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  private generateOrderConfirmationTemplate(
    data: OrderConfirmationEmailData,
  ): string {
    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `,
      )
      .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Order Confirmed!</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order #${data.orderNumber}</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.customerName},</p>

    <p style="font-size: 16px;">Thank you for your order! We've received your payment and are preparing your fresh produce.</p>

    <h3 style="color: #10b981; margin-top: 30px;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
          <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="background: #f9fafb; font-weight: bold;">
          <td colspan="2" style="padding: 15px; border-top: 2px solid #e5e7eb;">Total</td>
          <td style="padding: 15px; text-align: right; border-top: 2px solid #e5e7eb; color: #10b981;">$${data.total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>📅 Estimated Delivery:</strong> ${data.deliveryDate}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.trackingUrl}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Order</a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      You'll receive shipping updates via email as your order progresses.
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      Happy eating!<br>
      The Farmers Market Team
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
    <p>© ${new Date().getFullYear()} Farmers Market Platform. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const emailService = new EmailService();

// ============================================================================
// LAZY EMAIL FUNCTIONS - Re-export from email-service-lazy
// ============================================================================

export {
  sendEmailLazy,
  sendFarmerWelcomeLazy,
  sendSupportTicketConfirmationLazy,
  sendOrderNotificationLazy,
  sendOrderConfirmationLazy,
  sendBatchEmailsLazy,
  sendSeasonalNewsletterLazy,
  isEmailServiceConfiguredLazy,
  getEmailServiceStatusLazy,
  createDeferredEmailSender,
} from "./email-service-lazy";
