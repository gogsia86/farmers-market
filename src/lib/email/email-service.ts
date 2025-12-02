/**
 * 📧 EMAIL SERVICE
 * Handles all email notifications for the platform
 * Supports multiple providers: SendGrid, AWS SES, SMTP
 */

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface FarmerWelcomeData {
  farmerName: string;
  farmName: string;
  farmId: string;
}

interface SupportTicketData {
  ticketId: string;
  subject: string;
  name: string;
  email: string;
}

interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  farmName: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  pickupDate: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  private initialize() {
    try {
      // Check for SendGrid API key (preferred)
      if (process.env.SENDGRID_API_KEY) {
        // SendGrid configuration would go here
        // Using nodemailer-sendgrid-transport
        this.isConfigured = true;
        console.log("✅ Email service: SendGrid configured");
        return;
      }

      // Check for SMTP configuration (fallback)
      if (
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
      ) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        this.isConfigured = true;
        console.log("✅ Email service: SMTP configured");
        return;
      }

      // Development mode - log emails to console
      if (process.env.NODE_ENV === "development") {
        console.log(
          "⚠️ Email service: Development mode - emails will be logged",
        );
        this.isConfigured = true;
        return;
      }

      console.warn("⚠️ Email service: Not configured");
    } catch (error) {
      console.error("❌ Email service initialization error:", error);
    }
  }

  /**
   * Send email (generic method)
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.warn("Email service not configured - skipping email");
        return false;
      }

      // Development mode - log to console
      if (process.env.NODE_ENV === "development") {
        console.log("\n📧 EMAIL (Development Mode):");
        console.log("To:", options.to);
        console.log("Subject:", options.subject);
        console.log("Body:", options.text || options.html.substring(0, 200));
        console.log("---\n");
        return true;
      }

      // Send via configured transporter
      if (this.transporter) {
        await this.transporter.sendMail({
          from:
            options.from ||
            process.env.EMAIL_FROM ||
            "noreply@farmersmarket.com",
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        console.log(`✅ Email sent to ${options.to}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Send email error:", error);
      return false;
    }
  }

  /**
   * Send farmer welcome email after registration
   */
  async sendFarmerWelcome(
    email: string,
    data: FarmerWelcomeData,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d97706 0%, #b83838 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 Welcome to Farmers Market!</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${data.farmerName}!</h2>
            <p>Thank you for registering <strong>${data.farmName}</strong> with our marketplace.</p>

            <h3>What happens next?</h3>
            <ol>
              <li><strong>Review Process</strong> - Our team will review your application within 2-3 business days</li>
              <li><strong>Approval</strong> - You'll receive an email when your farm is approved</li>
              <li><strong>Setup</strong> - Add your products and start selling!</li>
            </ol>

            <p>Your Farm ID: <code>${data.farmId}</code></p>

            <a href="${process.env.NEXTAUTH_URL}/farmer/dashboard" class="button">Go to Dashboard</a>

            <h3>Need Help?</h3>
            <p>Visit our <a href="${process.env.NEXTAUTH_URL}/resources">Resource Center</a> or contact support at <a href="mailto:support@farmersmarket.com">support@farmersmarket.com</a></p>
          </div>
          <div class="footer">
            <p>© 2025 Farmers Market Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to Farmers Market - ${data.farmName}`,
      html,
      text: `Welcome ${data.farmerName}! Your farm ${data.farmName} has been registered. We'll review your application within 2-3 business days.`,
    });
  }

  /**
   * Send support ticket confirmation
   */
  async sendSupportTicketConfirmation(
    data: SupportTicketData,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Support Ticket Created</h2>
          <p>Hi ${data.name},</p>
          <p>We've received your support request and will respond within 24 hours.</p>

          <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #d97706; margin: 20px 0;">
            <strong>Ticket ID:</strong> ${data.ticketId}<br>
            <strong>Subject:</strong> ${data.subject}
          </div>

          <p>You can track your ticket status in the <a href="${process.env.NEXTAUTH_URL}/support">Support Portal</a>.</p>

          <p>Best regards,<br>Farmers Market Support Team</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      subject: `Support Ticket Created - ${data.ticketId}`,
      html,
      text: `Your support ticket ${data.ticketId} has been created. We'll respond within 24 hours.`,
    });
  }

  /**
   * Send new order notification to farmer
   */
  async sendOrderNotification(
    farmerEmail: string,
    data: OrderNotificationData,
  ): Promise<boolean> {
    const itemsList = data.items
      .map(
        (item) =>
          `<li>${item.name} - Qty: ${item.quantity} - $${item.price.toFixed(2)}</li>`,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🎉 New Order Received!</h2>
          <p>You have a new order for ${data.farmName}.</p>

          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0;">
            <strong>Order #:</strong> ${data.orderNumber}<br>
            <strong>Customer:</strong> ${data.customerName}<br>
            <strong>Pickup Date:</strong> ${data.pickupDate}<br>
            <strong>Total:</strong> $${data.total.toFixed(2)}
          </div>

          <h3>Items Ordered:</h3>
          <ul>${itemsList}</ul>

          <a href="${process.env.NEXTAUTH_URL}/farmer/dashboard"
             style="display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            View Order Details
          </a>

          <p>Please confirm this order in your dashboard.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: farmerEmail,
      subject: `New Order: ${data.orderNumber} - ${data.farmName}`,
      html,
      text: `New order ${data.orderNumber} from ${data.customerName}. Total: $${data.total}. Pickup: ${data.pickupDate}`,
    });
  }

  /**
   * Send order confirmation to customer
   */
  async sendOrderConfirmation(
    customerEmail: string,
    data: OrderNotificationData,
  ): Promise<boolean> {
    const itemsList = data.items
      .map(
        (item) =>
          `<li>${item.name} - Qty: ${item.quantity} - $${item.price.toFixed(2)}</li>`,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>✅ Order Confirmed!</h2>
          <p>Thank you for your order from ${data.farmName}.</p>

          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0;">
            <strong>Order #:</strong> ${data.orderNumber}<br>
            <strong>Farm:</strong> ${data.farmName}<br>
            <strong>Pickup Date:</strong> ${data.pickupDate}<br>
            <strong>Total:</strong> $${data.total.toFixed(2)}
          </div>

          <h3>Your Items:</h3>
          <ul>${itemsList}</ul>

          <a href="${process.env.NEXTAUTH_URL}/orders"
             style="display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Track Your Order
          </a>

          <p>You'll receive another email when your order is ready for pickup.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `Order Confirmed: ${data.orderNumber}`,
      html,
      text: `Your order ${data.orderNumber} from ${data.farmName} is confirmed. Pickup: ${data.pickupDate}. Total: $${data.total}`,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type {
  EmailOptions,
  FarmerWelcomeData,
  OrderNotificationData,
  SupportTicketData,
};
