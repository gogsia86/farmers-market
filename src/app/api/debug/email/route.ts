/**
 * 📧 EMAIL DEBUG ENDPOINT
 *
 * Tests email functionality and configuration
 * Part of Wave 2: Integration Verification
 *
 * Usage:
 *   GET  /api/debug/email         - Check email configuration
 *   POST /api/debug/email         - Send test email
 *
 * ⚠️ SECURITY: Only available in development or with debug token
 */

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

// Security check
function isAuthorized(request: NextRequest): boolean {
  const isDevelopment = process.env.NODE_ENV === "development";
  const hasDebugToken =
    request.headers.get("x-debug-token") === process.env.DEBUG_TOKEN;

  return isDevelopment || hasDebugToken;
}

interface EmailConfig {
  provider: string;
  configured: boolean;
  variables: {
    [key: string]: boolean;
  };
  testMode: boolean;
}

function checkEmailConfiguration(): EmailConfig {
  // Check SendGrid
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const sendgridConfigured = !!sendgridApiKey;

  // Check SMTP
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpConfigured = !!(smtpHost && smtpPort && smtpUser && smtpPassword);

  // Check general settings
  const emailFrom = process.env.EMAIL_FROM;
  const emailFromName = process.env.EMAIL_FROM_NAME;

  let provider = "none";
  let configured = false;

  if (sendgridConfigured) {
    provider = "sendgrid";
    configured = true;
  } else if (smtpConfigured) {
    provider = "smtp";
    configured = true;
  }

  return {
    provider,
    configured,
    variables: {
      SENDGRID_API_KEY: sendgridConfigured,
      SMTP_HOST: !!smtpHost,
      SMTP_PORT: !!smtpPort,
      SMTP_USER: !!smtpUser,
      SMTP_PASSWORD: !!smtpPassword,
      EMAIL_FROM: !!emailFrom,
      EMAIL_FROM_NAME: !!emailFromName,
    },
    testMode: process.env.EMAIL_TEST_MODE === "true",
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "This endpoint is only available in development mode or with x-debug-token header",
      },
      { status: 403 }
    );
  }

  const config = checkEmailConfiguration();

  if (!config.configured) {
    return NextResponse.json(
      {
        success: false,
        message: "Email is not configured",
        configuration: config,
        recommendations: [
          "Choose one email provider:",
          "",
          "Option 1: SendGrid (Recommended)",
          "  1. Sign up at https://sendgrid.com/",
          "  2. Create an API key",
          "  3. Add to .env.local:",
          "     SENDGRID_API_KEY=your-api-key",
          "     EMAIL_FROM=noreply@your-domain.com",
          "     EMAIL_FROM_NAME=Farmers Market",
          "",
          "Option 2: SMTP",
          "  Add to .env.local:",
          "     SMTP_HOST=smtp.your-provider.com",
          "     SMTP_PORT=587",
          "     SMTP_USER=your-username",
          "     SMTP_PASSWORD=your-password",
          "     EMAIL_FROM=noreply@your-domain.com",
          "     EMAIL_FROM_NAME=Farmers Market",
        ],
        examples: {
          sendgrid: {
            SENDGRID_API_KEY: "SG.xxxxxxxxxxxxx",
            EMAIL_FROM: "noreply@farmers-market.com",
            EMAIL_FROM_NAME: "Farmers Market Platform",
          },
          smtp: {
            SMTP_HOST: "smtp.gmail.com",
            SMTP_PORT: "587",
            SMTP_USER: "your-email@gmail.com",
            SMTP_PASSWORD: "your-app-password",
            EMAIL_FROM: "noreply@farmers-market.com",
            EMAIL_FROM_NAME: "Farmers Market Platform",
          },
        },
      },
      { status: 200 }
    );
  }

  // Configuration is valid
  return NextResponse.json({
    success: true,
    message: "Email is properly configured",
    configuration: config,
    instructions: {
      sendTest: "POST to this endpoint to send a test email",
      example: {
        method: "POST",
        url: "/api/debug/email",
        body: {
          to: "test@example.com",
          subject: "Test Email",
          text: "This is a test email",
        },
      },
    },
    nextSteps: [
      "1. Send a test email using POST request",
      "2. Check your inbox for the test email",
      "3. Verify email templates are rendering correctly",
      "4. Test transactional emails (order confirmations, etc.)",
    ],
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "This endpoint is only available in development mode",
      },
      { status: 403 }
    );
  }

  const config = checkEmailConfiguration();

  if (!config.configured) {
    return NextResponse.json(
      {
        success: false,
        error: "Email is not configured",
        hint: "Configure SENDGRID_API_KEY or SMTP settings first",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      to = process.env.EMAIL_FROM || "test@example.com",
      subject = "🧪 Test Email from Farmers Market Platform",
      text,
      html,
    } = body;

    // Default test email content
    const defaultText = `
🧪 Test Email

This is a test email from the Farmers Market Platform.

If you're seeing this, your email configuration is working correctly!

Timestamp: ${new Date().toISOString()}
Provider: ${config.provider}
Environment: ${process.env.NODE_ENV}

---
Farmers Market Platform
    `.trim();

    const defaultHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🧪 Test Email</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Farmers Market Platform</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">
      <strong>Success! 🎉</strong>
    </p>

    <p style="font-size: 14px; color: #666;">
      This is a test email from the Farmers Market Platform. If you're seeing this, your email configuration is working correctly!
    </p>

    <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #666;">
        <strong>Configuration Details:</strong><br>
        Provider: ${config.provider}<br>
        Environment: ${process.env.NODE_ENV}<br>
        Timestamp: ${new Date().toISOString()}
      </p>
    </div>

    <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>📋 Next Steps:</strong>
      </p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e; font-size: 13px;">
        <li>Verify this email arrived in your inbox (not spam)</li>
        <li>Check email formatting and images</li>
        <li>Test transactional emails (orders, notifications)</li>
        <li>Configure email templates in production</li>
      </ul>
    </div>

    <p style="font-size: 13px; color: #999; margin-bottom: 0;">
      This is an automated test email. Please do not reply.
    </p>
  </div>

  <div style="text-align: center; padding: 20px 0; color: #999; font-size: 12px;">
    <p style="margin: 0;">© 2025 Farmers Market Platform</p>
    <p style="margin: 5px 0 0 0;">Connecting farmers and communities</p>
  </div>
</body>
</html>
    `.trim();

    const emailContent = {
      to,
      subject,
      text: text || defaultText,
      html: html || defaultHtml,
    };

    // Send email based on provider
    if (config.provider === "sendgrid") {
      // SendGrid implementation
      const sendgridApiKey = process.env.SENDGRID_API_KEY!;

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: {
            email: process.env.EMAIL_FROM || "noreply@farmers-market.com",
            name: process.env.EMAIL_FROM_NAME || "Farmers Market Platform",
          },
          subject: emailContent.subject,
          content: [
            { type: "text/plain", value: emailContent.text },
            { type: "text/html", value: emailContent.html },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid API error: ${error}`);
      }

      return NextResponse.json({
        success: true,
        message: "Test email sent successfully via SendGrid",
        provider: "sendgrid",
        details: {
          to: emailContent.to,
          subject: emailContent.subject,
          from: process.env.EMAIL_FROM,
          fromName: process.env.EMAIL_FROM_NAME,
        },
        instructions: [
          "1. Check the inbox for: " + to,
          "2. Look in spam/junk folder if not in inbox",
          "3. Verify email formatting looks correct",
          "4. Check that images and links work",
        ],
      });
    } else if (config.provider === "smtp") {
      // SMTP implementation using nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      // Verify connection
      await transporter.verify();

      // Send email
      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "Farmers Market"}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: emailContent.to,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      return NextResponse.json({
        success: true,
        message: "Test email sent successfully via SMTP",
        provider: "smtp",
        details: {
          to: emailContent.to,
          subject: emailContent.subject,
          from: process.env.EMAIL_FROM,
          fromName: process.env.EMAIL_FROM_NAME,
          messageId: info.messageId,
        },
        instructions: [
          "1. Check the inbox for: " + to,
          "2. Look in spam/junk folder if not in inbox",
          "3. Verify email formatting looks correct",
          "4. Check that images and links work",
        ],
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unknown email provider",
      },
      { status: 500 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        details: {
          errorMessage,
          provider: config.provider,
          possibleCauses: [
            "Invalid API key or credentials",
            "Network connectivity issues",
            "Rate limiting",
            "Invalid email address",
            "SMTP server not reachable",
          ],
          troubleshooting: [
            "1. Verify your email credentials are correct",
            "2. Check that your email provider allows API/SMTP access",
            "3. Test credentials directly with your provider",
            "4. Check firewall/network settings",
            "5. Review rate limits if using free tier",
          ],
        },
      },
      { status: 500 }
    );
  }
}
