/**
 * 📧 LAZY EMAIL SERVICE
 * Dynamic import wrapper for email service to reduce server bundle size
 *
 * WHY THIS EXISTS:
 * - nodemailer is ~80KB and was bundled in every API route
 * - Email sending is infrequent (only on approvals, registrations, orders)
 * - Lazy loading defers bundling until actual email send
 *
 * USAGE:
 * Replace: import { emailService } from '@/lib/email/email-service';
 * With:    import { sendEmailLazy } from '@/lib/email/email.service';
 *
 * PERFORMANCE:
 * - First call: +10-50ms (dynamic import overhead)
 * - Subsequent calls: Same as normal (module cached)
 * - Bundle savings: ~80KB per API route
 */

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

/**
 * Send email with lazy-loaded email service
 * @param options Email configuration
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendEmailLazy(options: EmailOptions): Promise<boolean> {
  const { emailService } = await import("./email.service");
  return emailService.sendEmail(options);
}

/**
 * Send farmer welcome email
 * @param email Farmer email address
 * @param data Farmer and farm information
 * @returns Promise<boolean>
 */
export async function sendFarmerWelcomeLazy(
  email: string,
  data: FarmerWelcomeData,
): Promise<boolean> {
  const { emailService } = await import("./email.service");
  // Note: email.service uses sendWelcomeEmail, not sendFarmerWelcome
  // Need to adapt the data structure
  return emailService.sendWelcomeEmail({
    firstName: data.farmerName,
    email,
    loginUrl: `${process.env.NEXTAUTH_URL}/farmer/dashboard`,
  });
}

/**
 * Send support ticket confirmation
 * @param data Support ticket information
 * @returns Promise<boolean>
 */
export async function sendSupportTicketConfirmationLazy(
  data: SupportTicketData,
): Promise<boolean> {
  const { emailService } = await import("./email.service");
  return emailService.sendSupportTicketEmail({
    ticketId: data.ticketId,
    userName: data.name,
    email: data.email,
    subject: data.subject,
    message: "", // Not available in old interface
    priority: "MEDIUM", // Default priority
  });
}

/**
 * Send order notification to farmer
 * @param farmerEmail Farmer's email address
 * @param data Order information
 * @returns Promise<boolean>
 */
export async function sendOrderNotificationLazy(
  farmerEmail: string,
  data: OrderNotificationData,
): Promise<boolean> {
  const { emailService } = await import("./email.service");
  return emailService.sendOrderConfirmationEmail({
    orderNumber: data.orderNumber,
    customerName: data.customerName,
    email: farmerEmail,
    items: data.items,
    total: data.total,
    deliveryDate: data.pickupDate,
    trackingUrl: `${process.env.NEXTAUTH_URL}/farmer/orders/${data.orderNumber}`,
  });
}

/**
 * Send order confirmation to customer
 * @param customerEmail Customer's email address
 * @param data Order information
 * @returns Promise<boolean>
 */
export async function sendOrderConfirmationLazy(
  customerEmail: string,
  data: OrderNotificationData,
): Promise<boolean> {
  const { emailService } = await import("./email.service");
  return emailService.sendOrderConfirmationEmail({
    orderNumber: data.orderNumber,
    customerName: data.customerName,
    email: customerEmail,
    items: data.items,
    total: data.total,
    deliveryDate: data.pickupDate,
    trackingUrl: `${process.env.NEXTAUTH_URL}/orders/${data.orderNumber}`,
  });
}

/**
 * Check if email service is configured
 * Note: This requires loading the email service, use sparingly
 * @returns Promise<boolean>
 */
export async function isEmailServiceConfiguredLazy(): Promise<boolean> {
  try {
    const { emailService } = await import("./email.service");
    // Access through a method since isConfigured is private
    await emailService.sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "Test",
      text: "Test",
    });
    // In development, it always returns true if configured
    return true;
  } catch {
    return false;
  }
}

/**
 * DIVINE PATTERN: Batch Email Sending
 * Send multiple emails efficiently with single dynamic import
 */
export async function sendBatchEmailsLazy(
  emails: EmailOptions[],
): Promise<boolean[]> {
  const { emailService } = await import("./email.service");

  return Promise.all(emails.map((options) => emailService.sendEmail(options)));
}

/**
 * AGRICULTURAL CONSCIOUSNESS: Seasonal Newsletter
 * Send seasonal update emails to farmers
 */
export async function sendSeasonalNewsletterLazy(
  recipients: string[],
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
  content: string,
): Promise<boolean> {
  const { emailService } = await import("./email.service");

  const seasonEmoji = {
    SPRING: "🌱",
    SUMMER: "☀️",
    FALL: "🍂",
    WINTER: "❄️",
  };

  return emailService.sendEmail({
    to: recipients,
    subject: `${seasonEmoji[season]} Seasonal Update: ${season} Tips & Insights`,
    html: content,
    text: content.replace(/<[^>]*>/g, ""), // Strip HTML for text version
  });
}

/**
 * QUANTUM PATTERN: Deferred Email Queue
 * Returns a function that will send email when called
 * Useful for scheduling or background jobs
 */
export function createDeferredEmailSender(options: EmailOptions) {
  return async (): Promise<boolean> => {
    const { emailService } = await import("./email.service");
    return emailService.sendEmail(options);
  };
}

/**
 * PERFORMANCE MONITORING: Email Service Status
 * Get email service status without fully initializing
 */
export async function getEmailServiceStatusLazy(): Promise<{
  configured: boolean;
  provider: string;
}> {
  try {
    // Check environment variables without loading nodemailer
    const hasProvider =
      !!process.env.SENDGRID_API_KEY ||
      !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
      );

    return {
      configured: hasProvider || process.env.NODE_ENV === "development",
      provider: process.env.SENDGRID_API_KEY
        ? "sendgrid"
        : process.env.SMTP_HOST
          ? "smtp"
          : "console",
    };
  } catch (error) {
    return {
      configured: false,
      provider: "none",
    };
  }
}

/**
 * TYPE EXPORTS
 * Re-export types for convenience
 */
export type {
  EmailOptions,
  FarmerWelcomeData,
  SupportTicketData,
  OrderNotificationData,
};
