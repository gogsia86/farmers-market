/**
 * 📧 Email Service - Divine Communication Infrastructure
 * Email sending service with template support and queue integration
 * Following: 11_KILO_SCALE_ARCHITECTURE & 06_AUTOMATION_INFRASTRUCTURE
 */

import { BaseService } from "@/lib/services/base.service";

/**
 * Email template types
 */
export type EmailTemplate =
  | "welcome"
  | "order_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "farm_verified"
  | "farm_rejected"
  | "password_reset"
  | "email_verification"
  | "review_reminder"
  | "low_stock_alert";

/**
 * Email priority levels
 */
export enum EmailPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

/**
 * Email options (alias for EmailData for compatibility)
 */
export interface EmailOptions extends EmailData {
  priority?: EmailPriority;
}

/**
 * Email data interface
 */
export interface EmailData {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 📧 Email Service
 */
class EmailService extends BaseService {
  private readonly defaultFrom: string;
  private readonly templates: Map<EmailTemplate, EmailTemplateConfig>;

  constructor() {
    super("EmailService");
    this.defaultFrom = process.env.EMAIL_FROM || "noreply@farmersmarket.com";
    this.templates = this.initializeTemplates();
  }

  /**
   * Initialize email templates
   */
  private initializeTemplates(): Map<EmailTemplate, EmailTemplateConfig> {
    const templates = new Map<EmailTemplate, EmailTemplateConfig>();

    templates.set("welcome", {
      subject: "Welcome to Farmers Market Platform! 🌾",
      generateHtml: (data) => this.generateWelcomeEmail(data),
      generateText: (data) => this.generateWelcomeEmailText(data),
    });

    templates.set("order_confirmation", {
      subject: "Order Confirmation - Order #{orderId}",
      generateHtml: (data) => this.generateOrderConfirmationEmail(data),
      generateText: (data) => this.generateOrderConfirmationEmailText(data),
    });

    templates.set("order_shipped", {
      subject: "Your Order Has Shipped! 📦",
      generateHtml: (data) => this.generateOrderShippedEmail(data),
      generateText: (data) => this.generateOrderShippedEmailText(data),
    });

    templates.set("order_delivered", {
      subject: "Your Order Has Been Delivered! ✅",
      generateHtml: (data) => this.generateOrderDeliveredEmail(data),
      generateText: (data) => this.generateOrderDeliveredEmailText(data),
    });

    templates.set("farm_verified", {
      subject: "Your Farm Has Been Verified! 🎉",
      generateHtml: (data) => this.generateFarmVerifiedEmail(data),
      generateText: (data) => this.generateFarmVerifiedEmailText(data),
    });

    templates.set("farm_rejected", {
      subject: "Farm Verification Update",
      generateHtml: (data) => this.generateFarmRejectedEmail(data),
      generateText: (data) => this.generateFarmRejectedEmailText(data),
    });

    templates.set("password_reset", {
      subject: "Reset Your Password",
      generateHtml: (data) => this.generatePasswordResetEmail(data),
      generateText: (data) => this.generatePasswordResetEmailText(data),
    });

    templates.set("email_verification", {
      subject: "Verify Your Email Address",
      generateHtml: (data) => this.generateEmailVerificationEmail(data),
      generateText: (data) => this.generateEmailVerificationEmailText(data),
    });

    templates.set("review_reminder", {
      subject: "How was your recent purchase? 💭",
      generateHtml: (data) => this.generateReviewReminderEmail(data),
      generateText: (data) => this.generateReviewReminderEmailText(data),
    });

    templates.set("low_stock_alert", {
      subject: "Low Stock Alert - {productName}",
      generateHtml: (data) => this.generateLowStockAlertEmail(data),
      generateText: (data) => this.generateLowStockAlertEmailText(data),
    });

    return templates;
  }

  /**
   * Send email
   */
  async sendEmail(emailData: EmailData): Promise<EmailSendResult> {
    return this.withTracing(
      "sendEmail",
      async () => {
        try {
          const template = this.templates.get(emailData.template);
          if (!template) {
            throw new Error(`Unknown email template: ${emailData.template}`);
          }

          // Generate subject with data interpolation
          const subject = this.interpolateString(
            emailData.subject || template.subject,
            emailData.data,
          );

          // Generate HTML and text content
          const html = template.generateHtml(emailData.data);
          const text = template.generateText(emailData.data);

          // In production, this would use a service like SendGrid, AWS SES, or Nodemailer
          // For now, we'll log the email
          this.log("info", "Email sent", {
            to: emailData.to,
            subject,
            template: emailData.template,
          });

          // TODO: Integrate with actual email provider
          // Example with Nodemailer:
          // const transporter = nodemailer.createTransporter({...});
          // const info = await transporter.sendMail({
          //   from: emailData.from || this.defaultFrom,
          //   to: Array.isArray(emailData.to) ? emailData.to.join(", ") : emailData.to,
          //   subject,
          //   html,
          //   text,
          //   cc: emailData.cc,
          //   bcc: emailData.bcc,
          //   attachments: emailData.attachments,
          // });

          return {
            success: true,
            messageId: `mock-${Date.now()}`,
          };
        } catch (error) {
          this.log("error", "Failed to send email", {
            error: error instanceof Error ? error.message : "Unknown error",
            template: emailData.template,
          });

          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      { template: emailData.template },
    );
  }

  /**
   * Queue email for asynchronous sending
   */
  async queueEmail(emailData: EmailData): Promise<void> {
    // TODO: Integrate with queue service (Bull, BullMQ, etc.)
    // For now, send immediately
    await this.sendEmail(emailData);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
  ): Promise<EmailSendResult> {
    return this.sendEmail({
      to,
      subject: "Welcome to Farmers Market Platform! 🌾",
      template: "welcome",
      data: { userName },
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    to: string,
    orderData: any,
  ): Promise<EmailSendResult> {
    return this.sendEmail({
      to,
      subject: `Order Confirmation - Order #${orderData.id}`,
      template: "order_confirmation",
      data: orderData,
    });
  }

  /**
   * Send farm verification email
   */
  async sendFarmVerificationEmail(
    to: string,
    farmData: any,
  ): Promise<EmailSendResult> {
    return this.sendEmail({
      to,
      subject: "Your Farm Has Been Verified! 🎉",
      template: "farm_verified",
      data: farmData,
    });
  }

  /**
   * Interpolate template strings with data
   */
  private interpolateString(
    template: string,
    data: Record<string, any>,
  ): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  // Template generation methods
  private generateWelcomeEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 Welcome to Farmers Market Platform!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Welcome to our community of farmers and food lovers! We're thrilled to have you join us.</p>
            <p>Our platform connects local farms with customers who care about fresh, sustainable, and locally-grown food.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>Discover local farms and their stories</li>
              <li>Browse fresh, seasonal products</li>
              <li>Support sustainable agriculture</li>
              <li>Connect directly with farmers</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Get Started</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Farmers Market Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(data: any): string {
    return `
Welcome to Farmers Market Platform!

Hi ${data.userName},

Welcome to our community of farmers and food lovers! We're thrilled to have you join us.

Our platform connects local farms with customers who care about fresh, sustainable, and locally-grown food.

Visit ${process.env.NEXT_PUBLIC_APP_URL}/dashboard to get started!

© ${new Date().getFullYear()} Farmers Market Platform
    `.trim();
  }

  private generateOrderConfirmationEmail(data: any): string {
    const itemsHtml = data.items
      ?.map(
        (item: any) => `
        <tr>
          <td>${item.product?.name || "Product"}</td>
          <td>${item.quantity}</td>
          <td>$${Number(item.priceUSD).toFixed(2)}</td>
          <td>$${Number(item.subtotalUSD).toFixed(2)}</td>
        </tr>
      `,
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Order #${data.id}</p>
          </div>
          <div class="content">
            <p>Thank you for your order!</p>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="total">
              <p>Subtotal: $${Number(data.subtotalUSD).toFixed(2)}</p>
              <p>Tax: $${Number(data.taxUSD).toFixed(2)}</p>
              <p>Shipping: $${Number(data.shippingUSD).toFixed(2)}</p>
              <p>Total: $${Number(data.totalUSD).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderConfirmationEmailText(data: any): string {
    return `
Order Confirmation - Order #${data.id}

Thank you for your order!

Total: $${Number(data.totalUSD).toFixed(2)}

We'll notify you when your order ships.
    `.trim();
  }

  private generateOrderShippedEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>Your Order Has Shipped! 📦</h1>
          <p>Good news! Your order #${data.orderId} is on its way.</p>
          ${data.trackingNumber ? `<p>Tracking Number: <strong>${data.trackingNumber}</strong></p>` : ""}
          <p>Expected delivery: ${data.estimatedDelivery || "Soon"}</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderShippedEmailText(data: any): string {
    return `Your order #${data.orderId} has shipped! ${data.trackingNumber ? `Tracking: ${data.trackingNumber}` : ""}`;
  }

  private generateOrderDeliveredEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>Your Order Has Been Delivered! ✅</h1>
          <p>Your order #${data.orderId} has been delivered.</p>
          <p>We hope you enjoy your fresh, locally-grown products!</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}/review">Leave a review</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderDeliveredEmailText(data: any): string {
    return `Your order #${data.orderId} has been delivered! Enjoy your fresh products.`;
  }

  private generateFarmVerifiedEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>🎉 Your Farm Has Been Verified!</h1>
          <p>Congratulations! Your farm "${data.farmName}" has been verified and is now live on our platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Add products to your farm</li>
            <li>Receive orders from customers</li>
            <li>Manage your farm profile</li>
          </ul>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/farmer/dashboard">Go to Dashboard</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private generateFarmVerifiedEmailText(data: any): string {
    return `Your farm "${data.farmName}" has been verified! Start adding products now.`;
  }

  private generateFarmRejectedEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>Farm Verification Update</h1>
          <p>Thank you for submitting your farm "${data.farmName}" for verification.</p>
          <p>Unfortunately, we need more information before we can verify your farm.</p>
          ${data.reason ? `<p>Reason: ${data.reason}</p>` : ""}
          <p>Please update your farm information and resubmit for verification.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateFarmRejectedEmailText(data: any): string {
    return `Farm verification update for "${data.farmName}". Please review and resubmit.`;
  }

  private generatePasswordResetEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <p><a href="${data.resetLink}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailText(data: any): string {
    return `Reset your password: ${data.resetLink} (expires in 1 hour)`;
  }

  private generateEmailVerificationEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>Verify Your Email Address</h1>
          <p>Click the link below to verify your email address:</p>
          <p><a href="${data.verificationLink}">Verify Email</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private generateEmailVerificationEmailText(data: any): string {
    return `Verify your email: ${data.verificationLink}`;
  }

  private generateReviewReminderEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>How was your recent purchase? 💭</h1>
          <p>We'd love to hear about your experience with ${data.farmName}!</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}/review">Leave a Review</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private generateReviewReminderEmailText(data: any): string {
    return `How was your purchase from ${data.farmName}? Leave a review!`;
  }

  private generateLowStockAlertEmail(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>⚠️ Low Stock Alert</h1>
          <p>Your product "${data.productName}" is running low on stock.</p>
          <p>Current quantity: ${data.quantity}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/farmer/products/${data.productId}">Update Inventory</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private generateLowStockAlertEmailText(data: any): string {
    return `Low stock alert: ${data.productName} (${data.quantity} remaining)`;
  }
}

/**
 * Email template configuration
 */
interface EmailTemplateConfig {
  subject: string;
  generateHtml: (data: any) => string;
  generateText: (data: any) => string;
}

// Export singleton instance
export const emailService = new EmailService();

// Export class for testing
export { EmailService };
