/**
 * 📧 Email Service Mock
 *
 * Mock email service for integration testing.
 * Simulates email sending with tracking and verification.
 *
 * @module tests/integration/mocks/email
 * @version 1.0.0
 *
 * Divine Pattern: External service mocking with agricultural consciousness
 * Agricultural Context: Email notifications for farm-to-table transactions
 */

import { randomUUID } from "crypto";

interface EmailRequest {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
  metadata?: Record<string, any>;
}

interface SentEmail {
  id: string;
  to: string | string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
  metadata?: Record<string, any>;
  sentAt: Date;
  status: "sent" | "failed" | "bounced" | "delivered";
}

interface OrderConfirmationRequest {
  to: string;
  orderId: string;
  orderNumber: string;
  items: Array<{
    product: { name: string };
    quantity: number;
    price: number;
  }>;
  total: number;
}

interface OrderStatusUpdateRequest {
  to: string;
  orderId: string;
  status: string;
  message: string;
}

interface OrderCancellationRequest {
  to: string;
  orderId: string;
  reason: string;
}

interface FarmVerificationRequest {
  to: string;
  farmName: string;
  farmId: string;
}

interface FarmAnnouncementRequest {
  to: string;
  farmName: string;
  subject: string;
  message: string;
}

class EmailServiceMock {
  private sentEmails: SentEmail[] = [];
  private failureRate: number = 0;
  private initialized: boolean = false;
  private fromAddress: string = "noreply@farmersmarket.test";

  /**
   * Initialize the mock service
   */
  initialize(): void {
    this.initialized = true;
    this.reset();
    console.log("✅ Email Service Mock initialized");
  }

  /**
   * Reset all mock data
   */
  reset(): void {
    this.sentEmails = [];
    this.failureRate = 0;
  }

  /**
   * Set failure rate for testing error scenarios (0-100)
   */
  setFailureRate(rate: number): void {
    this.failureRate = Math.max(0, Math.min(100, rate));
  }

  /**
   * Set the from address
   */
  setFromAddress(address: string): void {
    this.fromAddress = address;
  }

  /**
   * Send a generic email
   */
  async send(request: EmailRequest): Promise<SentEmail> {
    if (!this.initialized) {
      throw new Error("Email service mock not initialized. Call initialize() first.");
    }

    // Simulate failure based on failure rate
    const shouldFail = Math.random() * 100 < this.failureRate;

    const email: SentEmail = {
      id: `email_mock_${randomUUID()}`,
      to: request.to,
      from: request.from || this.fromAddress,
      subject: request.subject,
      html: request.html,
      text: request.text,
      attachments: request.attachments,
      metadata: request.metadata,
      sentAt: new Date(),
      status: shouldFail ? "failed" : "sent",
    };

    this.sentEmails.push(email);

    if (shouldFail) {
      throw new Error(`Failed to send email to ${request.to}`);
    }

    return email;
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(request: OrderConfirmationRequest): Promise<SentEmail> {
    const itemsList = request.items
      .map(
        (item) =>
          `${item.quantity}x ${item.product.name} - $${(item.price * item.quantity).toFixed(2)}`
      )
      .join("\n");

    const html = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <h2>Order #${request.orderNumber}</h2>
      <h3>Items:</h3>
      <pre>${itemsList}</pre>
      <h3>Total: $${request.total.toFixed(2)}</h3>
      <p>We'll notify you when your order is ready for pickup or delivery.</p>
    `;

    const text = `
Order Confirmation

Thank you for your order!

Order #${request.orderNumber}

Items:
${itemsList}

Total: $${request.total.toFixed(2)}

We'll notify you when your order is ready for pickup or delivery.
    `;

    return this.send({
      to: request.to,
      subject: `Order Confirmation #${request.orderNumber}`,
      html,
      text,
      metadata: {
        type: "order_confirmation",
        orderId: request.orderId,
      },
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(request: OrderStatusUpdateRequest): Promise<SentEmail> {
    const html = `
      <h1>Order Status Update</h1>
      <p>Order #${request.orderId.slice(0, 8)}</p>
      <h2>Status: ${request.status}</h2>
      <p>${request.message}</p>
    `;

    const text = `
Order Status Update

Order #${request.orderId.slice(0, 8)}

Status: ${request.status}

${request.message}
    `;

    return this.send({
      to: request.to,
      subject: `Order Status Update: ${request.status}`,
      html,
      text,
      metadata: {
        type: "order_status_update",
        orderId: request.orderId,
        status: request.status,
      },
    });
  }

  /**
   * Send order cancellation email
   */
  async sendOrderCancellation(request: OrderCancellationRequest): Promise<SentEmail> {
    const html = `
      <h1>Order Cancelled</h1>
      <p>Your order #${request.orderId.slice(0, 8)} has been cancelled.</p>
      <h2>Reason:</h2>
      <p>${request.reason}</p>
      <p>If you were charged, a refund will be processed within 5-7 business days.</p>
    `;

    const text = `
Order Cancelled

Your order #${request.orderId.slice(0, 8)} has been cancelled.

Reason:
${request.reason}

If you were charged, a refund will be processed within 5-7 business days.
    `;

    return this.send({
      to: request.to,
      subject: `Order Cancelled #${request.orderId.slice(0, 8)}`,
      html,
      text,
      metadata: {
        type: "order_cancellation",
        orderId: request.orderId,
      },
    });
  }

  /**
   * Send farm verification email
   */
  async sendFarmVerificationEmail(request: FarmVerificationRequest): Promise<SentEmail> {
    const html = `
      <h1>🎉 Farm Verified!</h1>
      <p>Congratulations! Your farm "${request.farmName}" has been verified.</p>
      <p>You can now start listing products and accepting orders.</p>
      <a href="https://farmersmarket.test/farmer/dashboard">Go to Dashboard</a>
    `;

    const text = `
🎉 Farm Verified!

Congratulations! Your farm "${request.farmName}" has been verified.

You can now start listing products and accepting orders.

Visit your dashboard: https://farmersmarket.test/farmer/dashboard
    `;

    return this.send({
      to: request.to,
      subject: `Farm Verified: ${request.farmName}`,
      html,
      text,
      metadata: {
        type: "farm_verification",
        farmId: request.farmId,
      },
    });
  }

  /**
   * Send farm announcement email
   */
  async sendFarmAnnouncement(request: FarmAnnouncementRequest): Promise<SentEmail> {
    const html = `
      <h1>Announcement from ${request.farmName}</h1>
      <p>${request.message}</p>
      <a href="https://farmersmarket.test/farms/${request.farmName}">Visit Farm</a>
    `;

    const text = `
Announcement from ${request.farmName}

${request.message}

Visit Farm: https://farmersmarket.test/farms/${request.farmName}
    `;

    return this.send({
      to: request.to,
      subject: request.subject,
      html,
      text,
      metadata: {
        type: "farm_announcement",
        farmName: request.farmName,
      },
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<SentEmail> {
    const html = `
      <h1>Welcome to Farmers Market! 🌾</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining our community of conscious consumers and sustainable farmers.</p>
      <p>Start exploring fresh, local products from verified farms in your area.</p>
      <a href="https://farmersmarket.test/explore">Explore Products</a>
    `;

    const text = `
Welcome to Farmers Market! 🌾

Hi ${name},

Thank you for joining our community of conscious consumers and sustainable farmers.

Start exploring fresh, local products from verified farms in your area.

Explore Products: https://farmersmarket.test/explore
    `;

    return this.send({
      to,
      subject: "Welcome to Farmers Market!",
      html,
      text,
      metadata: {
        type: "welcome",
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<SentEmail> {
    const resetUrl = `https://farmersmarket.test/reset-password?token=${resetToken}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    const text = `
Password Reset Request

You requested to reset your password.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
    `;

    return this.send({
      to,
      subject: "Password Reset Request",
      html,
      text,
      metadata: {
        type: "password_reset",
        resetToken,
      },
    });
  }

  /**
   * Get all sent emails
   */
  getSentEmails(): SentEmail[] {
    return [...this.sentEmails];
  }

  /**
   * Get emails by recipient
   */
  getEmailsByRecipient(recipient: string): SentEmail[] {
    return this.sentEmails.filter((email) => {
      if (Array.isArray(email.to)) {
        return email.to.includes(recipient);
      }
      return email.to === recipient;
    });
  }

  /**
   * Get emails by type
   */
  getEmailsByType(type: string): SentEmail[] {
    return this.sentEmails.filter((email) => email.metadata?.type === type);
  }

  /**
   * Get emails by status
   */
  getEmailsByStatus(status: SentEmail["status"]): SentEmail[] {
    return this.sentEmails.filter((email) => email.status === status);
  }

  /**
   * Get email by ID
   */
  getEmailById(id: string): SentEmail | undefined {
    return this.sentEmails.find((email) => email.id === id);
  }

  /**
   * Clear all sent emails
   */
  clear(): void {
    this.sentEmails = [];
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      totalSent: this.sentEmails.length,
      byStatus: {
        sent: this.getEmailsByStatus("sent").length,
        failed: this.getEmailsByStatus("failed").length,
        bounced: this.getEmailsByStatus("bounced").length,
        delivered: this.getEmailsByStatus("delivered").length,
      },
      byType: {
        order_confirmation: this.getEmailsByType("order_confirmation").length,
        order_status_update: this.getEmailsByType("order_status_update").length,
        order_cancellation: this.getEmailsByType("order_cancellation").length,
        farm_verification: this.getEmailsByType("farm_verification").length,
        farm_announcement: this.getEmailsByType("farm_announcement").length,
        welcome: this.getEmailsByType("welcome").length,
        password_reset: this.getEmailsByType("password_reset").length,
      },
      successRate:
        this.sentEmails.length > 0
          ? (this.getEmailsByStatus("sent").length / this.sentEmails.length) * 100
          : 100,
    };
  }

  /**
   * Simulate email delivery (change status from sent to delivered)
   */
  async simulateDelivery(emailId: string): Promise<void> {
    const email = this.sentEmails.find((e) => e.id === emailId);
    if (email && email.status === "sent") {
      email.status = "delivered";
    }
  }

  /**
   * Simulate email bounce
   */
  async simulateBounce(emailId: string): Promise<void> {
    const email = this.sentEmails.find((e) => e.id === emailId);
    if (email && email.status === "sent") {
      email.status = "bounced";
    }
  }
}

// Singleton instance
export const mockEmailService = new EmailServiceMock();

// Export types
export type {
  EmailRequest,
  SentEmail,
  OrderConfirmationRequest,
  OrderStatusUpdateRequest,
  OrderCancellationRequest,
  FarmVerificationRequest,
  FarmAnnouncementRequest,
};
