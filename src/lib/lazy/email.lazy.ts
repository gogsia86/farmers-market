/**
 * 📧 LAZY EMAIL LOADING
 * Divine lazy-loading wrapper for nodemailer
 * Reduces initial bundle size by ~50-80 KB
 *
 * @module lib/lazy/email.lazy
 * @category Performance Optimization
 */

import type nodemailer from "nodemailer";
import type { Transporter, SendMailOptions, SentMessageInfo } from "nodemailer";

// ============================================================================
// TYPES
// ============================================================================

export type { Transporter, SendMailOptions, SentMessageInfo };

export interface EmailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  service?: string;
}

// ============================================================================
// LAZY LOADING
// ============================================================================

let nodemailerPromise: Promise<typeof nodemailer> | null = null;

/**
 * Load nodemailer lazily
 * Caches the promise to avoid multiple imports
 */
async function loadNodemailer(): Promise<typeof nodemailer> {
  if (!nodemailerPromise) {
    nodemailerPromise = import("nodemailer");
  }
  return nodemailerPromise;
}

// ============================================================================
// LAZY API
// ============================================================================

/**
 * Create email transporter (lazy-loaded)
 *
 * @example
 * ```typescript
 * const transporter = await createTransporter({
 *   host: process.env.SMTP_HOST,
 *   port: 587,
 *   secure: false,
 *   auth: {
 *     user: process.env.SMTP_USER,
 *     pass: process.env.SMTP_PASS,
 *   },
 * });
 * ```
 */
export async function createTransporter(
  config: EmailConfig,
): Promise<Transporter> {
  const nm = await loadNodemailer();
  return nm.createTransport(config);
}

/**
 * Send email (lazy-loaded)
 * Convenience function that creates transporter and sends email
 *
 * @example
 * ```typescript
 * await sendEmail(
 *   {
 *     host: process.env.SMTP_HOST,
 *     port: 587,
 *     auth: { user: "...", pass: "..." },
 *   },
 *   {
 *     from: "noreply@farmersmarket.com",
 *     to: "customer@example.com",
 *     subject: "Order Confirmation",
 *     html: "<h1>Thank you for your order!</h1>",
 *   }
 * );
 * ```
 */
export async function sendEmail(
  config: EmailConfig,
  mailOptions: SendMailOptions,
): Promise<SentMessageInfo> {
  const transporter = await createTransporter(config);
  return transporter.sendMail(mailOptions);
}

/**
 * Queue email for background sending (fire-and-forget)
 * Useful when you don't want to wait for email delivery
 *
 * @example
 * ```typescript
 * // In API route - don't wait for email
 * queueEmail(emailConfig, {
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   html: welcomeTemplate,
 * });
 *
 * return NextResponse.json({ success: true });
 * ```
 */
export function queueEmail(
  config: EmailConfig,
  mailOptions: SendMailOptions,
): void {
  // Fire and forget - don't await
  sendEmail(config, mailOptions).catch((error) => {
    console.error("❌ Failed to send queued email:", error);
    // TODO: Add to retry queue or dead letter queue
  });
}

/**
 * Verify email configuration (lazy-loaded)
 * Tests SMTP connection without sending email
 *
 * @example
 * ```typescript
 * const isValid = await verifyEmailConfig({
 *   host: process.env.SMTP_HOST,
 *   port: 587,
 *   auth: { user: "...", pass: "..." },
 * });
 * ```
 */
export async function verifyEmailConfig(
  config: EmailConfig,
): Promise<boolean> {
  try {
    const transporter = await createTransporter(config);
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("❌ Email configuration verification failed:", error);
    return false;
  }
}

// ============================================================================
// MIGRATION GUIDE
// ============================================================================

/*
MIGRATION GUIDE:

Before (eager loading - adds ~50-80 KB to bundle):
```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  // ...
});

await transporter.sendMail({
  to: "user@example.com",
  subject: "Hello",
  html: "<p>World</p>",
});
```

After (lazy loading):
```typescript
import { createTransporter, sendEmail } from "@/lib/lazy/email.lazy";

// Option 1: Create transporter
const transporter = await createTransporter({
  host: process.env.SMTP_HOST,
  // ...
});
await transporter.sendMail({
  to: "user@example.com",
  subject: "Hello",
  html: "<p>World</p>",
});

// Option 2: Send directly
await sendEmail(
  { host: process.env.SMTP_HOST, ... },
  {
    to: "user@example.com",
    subject: "Hello",
    html: "<p>World</p>",
  }
);

// Option 3: Fire-and-forget (for non-critical emails)
queueEmail(config, mailOptions);
```

EXPECTED SAVINGS:
- Bundle size reduction: ~50-80 KB
- First load improvement: ~30-50ms (depends on email usage)
- Only loads when email functionality is actually used

FILES TO UPDATE:
- src/lib/email/email-service.ts
- src/lib/email/email.service.ts
- Any API routes that send emails
*/
