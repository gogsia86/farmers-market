# 📧 Email Service Configuration Guide

## Overview

The Farmers Market Platform includes a comprehensive email service for sending:

- **Transactional emails** - Order confirmations, payment receipts
- **Notifications** - Farm approvals, account updates
- **Support** - Ticket confirmations, responses
- **Welcome emails** - User onboarding

## Quick Setup

### 1. Choose an SMTP Provider

Popular options:

| Provider     | Best For               | Cost                         | Setup Difficulty |
| ------------ | ---------------------- | ---------------------------- | ---------------- |
| **Gmail**    | Development/Testing    | Free                         | Easy             |
| **SendGrid** | Production (Twilio)    | Free tier: 100 emails/day    | Easy             |
| **AWS SES**  | Production (AWS users) | $0.10 per 1000 emails        | Medium           |
| **Mailgun**  | Production             | Free tier: 5000 emails/month | Easy             |
| **Postmark** | Transactional emails   | Free tier: 100 emails/month  | Easy             |

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```bash
# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
SMTP_FROM="noreply@farmersmarket.app"
```

### 3. Test the Configuration

The email service automatically logs to console if SMTP is not configured, allowing development without email setup.

---

## Provider-Specific Setup

### 📮 Gmail (Recommended for Development)

**Step 1: Enable App-Specific Passwords**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new app password for "Mail"
5. Copy the 16-character password

**Step 2: Configure Environment**

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  # App-specific password (no spaces)
SMTP_FROM="your-email@gmail.com"
```

**Limitations:**

- Daily limit: 500 emails
- Best for: Development, testing, small projects
- Not recommended for: Production at scale

---

### 📨 SendGrid (Recommended for Production)

**Step 1: Create Account**

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your email address
3. Create an API key in **Settings** → **API Keys**

**Step 2: Configure Environment**

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"  # Literal string "apikey"
SMTP_PASSWORD="SG.your-actual-api-key"
SMTP_FROM="noreply@yourdomain.com"
```

**Step 3: Verify Domain (Recommended)**

1. Go to **Settings** → **Sender Authentication**
2. Click **Domain Authentication**
3. Add DNS records to your domain
4. Wait for verification (can take 24-48 hours)

**Advantages:**

- Free tier: 100 emails/day
- Excellent deliverability
- Email analytics included
- Scales easily

---

### ☁️ AWS SES (For AWS Users)

**Step 1: Setup SES**

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Verify your email address or domain
3. Request production access (if needed)
4. Create SMTP credentials

**Step 2: Configure Environment**

```bash
SMTP_HOST="email-smtp.us-west-2.amazonaws.com"  # Your region
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-ses-smtp-username"
SMTP_PASSWORD="your-ses-smtp-password"
SMTP_FROM="verified@yourdomain.com"
```

**Advantages:**

- Very affordable ($0.10 per 1000 emails)
- Integrates with AWS ecosystem
- High deliverability
- Scales to millions

**Limitations:**

- Requires AWS account
- Sandbox mode has limitations
- More complex setup

---

### 📬 Mailgun

**Step 1: Create Account**

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Verify your domain (or use sandbox domain for testing)
3. Get SMTP credentials from **Sending** → **Domain Settings**

**Step 2: Configure Environment**

```bash
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASSWORD="your-mailgun-smtp-password"
SMTP_FROM="noreply@your-domain.com"
```

**Advantages:**

- Free tier: 5000 emails/month
- Good for transactional emails
- Advanced tracking
- Email validation API

---

## Email Service Features

### Available Email Templates

The platform includes pre-built templates for:

1. **Welcome Email** - `sendWelcomeEmail()`
   - Sent when users sign up
   - Includes login link and platform overview

2. **Farm Approval** - `sendFarmApprovalEmail()`
   - Sent when farm application is approved
   - Includes dashboard access link

3. **Farm Rejection** - `sendFarmRejectionEmail()`
   - Sent when farm application is denied
   - Includes reason and reapply link

4. **Support Ticket** - `sendSupportTicketEmail()`
   - Sent when support ticket is created
   - Includes ticket ID and priority

5. **Order Confirmation** - `sendOrderConfirmationEmail()`
   - Sent after successful order
   - Includes order details and tracking link

### Usage Example

```typescript
import { emailService } from "@/lib/email/email.service";

// Send welcome email
await emailService.sendWelcomeEmail({
  firstName: "John",
  email: "john@example.com",
  loginUrl: "https://farmersmarket.app/login",
});

// Send custom email
await emailService.sendEmail({
  to: "customer@example.com",
  subject: "Your order is ready!",
  html: "<h1>Fresh produce on the way!</h1>",
  text: "Your order is ready for pickup.",
});
```

---

## Docker Configuration

### Update `.env.docker`

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@farmersmarket.app
```

### Rebuild Container

```powershell
# Rebuild with new environment
docker-compose down
docker-compose build app
docker-compose up -d
```

---

## Testing Email Configuration

### Method 1: Check Logs

The email service logs to console:

```bash
# Watch logs
docker-compose logs -f app

# Look for:
# ✅ Email service initialized  (configured)
# ⚠️  SMTP not configured       (dev mode)
```

### Method 2: Test Endpoint (TODO)

Create a test endpoint in development:

```typescript
// src/app/api/test-email/route.ts
import { emailService } from "@/lib/email/email.service";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await emailService.sendEmail({
    to: "your-test-email@example.com",
    subject: "Test Email from Farmers Market",
    html: "<h1>✅ Email is working!</h1>",
    text: "Email is working!",
  });

  return NextResponse.json({
    success: result,
    message: result ? "Email sent!" : "Email failed (check logs)",
  });
}
```

Then visit: `http://localhost:3000/api/test-email`

---

## Development Mode

When SMTP is **not configured**, the email service operates in **development mode**:

- ✅ All email methods work without errors
- 📝 Email content is logged to console
- 🚀 No actual emails are sent
- 💻 Perfect for development and testing

**Console Output Example:**

```
📧 [EMAIL DEV MODE] {
  to: 'user@example.com',
  subject: '🌾 Welcome to Farmers Market Platform!',
  html: '<!DOCTYPE html><html>...'
}
```

---

## Production Checklist

Before going to production:

- [ ] Choose production-grade SMTP provider (SendGrid, SES, Mailgun)
- [ ] Verify sender domain for better deliverability
- [ ] Set up DKIM, SPF, and DMARC DNS records
- [ ] Configure proper `SMTP_FROM` address
- [ ] Test all email templates
- [ ] Set up email bounce handling
- [ ] Monitor email delivery rates
- [ ] Implement rate limiting if needed
- [ ] Add unsubscribe links (for marketing emails)
- [ ] Ensure GDPR/CAN-SPAM compliance

---

## Troubleshooting

### "SMTP not configured" Warning

**Solution**: Add SMTP environment variables to `.env` or `.env.docker`

### Emails Not Sending (Gmail)

**Common Issues:**

1. Not using app-specific password
2. 2-Step Verification not enabled
3. "Less secure app access" disabled (legacy)

**Fix**: Generate app-specific password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### Connection Timeout

**Check:**

- SMTP_HOST and SMTP_PORT are correct
- Firewall allows outbound connections on port 587/465
- SMTP credentials are valid

### Authentication Failed

**Verify:**

- SMTP_USER is correct (often the full email address)
- SMTP_PASSWORD is the actual SMTP password (not account password)
- Provider-specific requirements (e.g., SendGrid uses "apikey" as username)

### Emails Go to Spam

**Improve Deliverability:**

1. Verify your domain with the SMTP provider
2. Set up SPF, DKIM, and DMARC records
3. Use a recognizable "from" address
4. Avoid spam trigger words in subject lines
5. Include unsubscribe links
6. Maintain good sender reputation

---

## Security Best Practices

1. **Never commit SMTP credentials** to version control
2. **Use app-specific passwords** (Gmail) or API keys (SendGrid)
3. **Enable TLS** (port 587) or SSL (port 465)
4. **Rotate credentials** periodically
5. **Monitor for unauthorized usage**
6. **Use environment variables** for all sensitive data
7. **Implement rate limiting** to prevent abuse

---

## Support

For issues or questions:

- Check logs: `docker-compose logs app`
- Review SMTP provider documentation
- Test with a simple SMTP client first
- Verify DNS records (for domain authentication)

---

## Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [AWS SES SMTP](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)
- [Email Deliverability Guide](https://www.mailgun.com/blog/deliverability/)

---

**Last Updated**: November 12, 2025  
**Platform Version**: 1.0.0
