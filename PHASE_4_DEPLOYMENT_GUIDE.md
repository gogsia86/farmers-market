# 🚀 PHASE 4 DEPLOYMENT GUIDE

**Marketing Automation Platform - Production Deployment**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ **Environment Setup**

#### 1. Email Service Provider (Required)

Choose and configure one:

**Option A: SendGrid (Recommended)**

```bash
# Install SendGrid SDK
npm install @sendgrid/mail

# Environment variables
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@farmersmarket.app
SENDGRID_FROM_NAME="Farmers Market"
```

**Option B: AWS SES**

```bash
# Install AWS SDK
npm install @aws-sdk/client-ses

# Environment variables
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SES_FROM_EMAIL=noreply@farmersmarket.app
```

**Option C: Resend (Modern Alternative)**

```bash
# Install Resend SDK
npm install resend

# Environment variables
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@farmersmarket.app
```

#### 2. Database Migrations

```bash
# Create Prisma schema for marketing tables
npx prisma migrate dev --name add_marketing_tables

# Apply to production
npx prisma migrate deploy
```

#### 3. Environment Variables

Add to `.env.production`:

```bash
# === MARKETING CONFIGURATION ===

# Email Service
EMAIL_PROVIDER=sendgrid  # or 'ses' or 'resend'
SENDGRID_API_KEY=your_key_here
EMAIL_FROM=noreply@farmersmarket.app
EMAIL_FROM_NAME="Farmers Market"

# Marketing URLs
NEXT_PUBLIC_APP_URL=https://farmersmarket.app
NEXT_PUBLIC_UNSUBSCRIBE_URL=https://farmersmarket.app/unsubscribe

# Analytics
ENABLE_MARKETING_ANALYTICS=true
ANALYTICS_RETENTION_DAYS=90

# Referral Program
REFERRAL_CONSUMER_REWARD=10
REFERRAL_FARMER_REWARD=20
REFEREE_CONSUMER_REWARD=5
REFEREE_FARMER_REWARD=10

# Rate Limiting
EMAIL_RATE_LIMIT_PER_HOUR=1000
CAMPAIGN_MAX_RECIPIENTS=10000

# Feature Flags
ENABLE_AUTOMATED_SEQUENCES=true
ENABLE_DISCOUNT_CODES=true
ENABLE_REFERRAL_PROGRAM=true
ENABLE_SOCIAL_SHARING=true
```

---

## 🗄️ DATABASE SCHEMA DEPLOYMENT

### Prisma Schema Updates

Create `prisma/migrations/add_marketing_tables.sql`:

```sql
-- Email Campaigns Table
CREATE TABLE "EmailCampaign" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "recipientType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "scheduledFor" TIMESTAMP,
  "sentAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Campaign Analytics
CREATE TABLE "CampaignAnalytics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "campaignId" TEXT NOT NULL,
  "sent" INTEGER NOT NULL DEFAULT 0,
  "delivered" INTEGER NOT NULL DEFAULT 0,
  "opened" INTEGER NOT NULL DEFAULT 0,
  "clicked" INTEGER NOT NULL DEFAULT 0,
  "converted" INTEGER NOT NULL DEFAULT 0,
  "revenue" DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE
);

-- Automated Sequences
CREATE TABLE "EmailSequence" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "triggerType" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Sequence Emails
CREATE TABLE "SequenceEmail" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sequenceId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "delayDays" INTEGER NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  FOREIGN KEY ("sequenceId") REFERENCES "EmailSequence"("id") ON DELETE CASCADE
);

-- User Sequence Enrollment
CREATE TABLE "SequenceEnrollment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sequenceId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "currentStep" INTEGER NOT NULL DEFAULT 0,
  "enrolledAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("sequenceId") REFERENCES "EmailSequence"("id") ON DELETE CASCADE
);

-- Discount Codes
CREATE TABLE "DiscountCode" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL,
  "value" DECIMAL(10,2) NOT NULL,
  "minOrderAmount" DECIMAL(10,2),
  "maxUses" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Discount Usage
CREATE TABLE "DiscountUsage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "discountId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "discountAmount" DECIMAL(10,2) NOT NULL,
  "usedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("discountId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Referrals
CREATE TABLE "Referral" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "referrerId" TEXT NOT NULL,
  "refereeId" TEXT,
  "code" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "rewardPaid" BOOLEAN NOT NULL DEFAULT false,
  "referrerReward" DECIMAL(10,2) NOT NULL,
  "refereeReward" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Marketing Analytics
CREATE TABLE "MarketingEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventType" TEXT NOT NULL,
  "userId" TEXT,
  "campaignId" TEXT,
  "metadata" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX "idx_campaign_status" ON "EmailCampaign"("status");
CREATE INDEX "idx_sequence_active" ON "EmailSequence"("isActive");
CREATE INDEX "idx_enrollment_user" ON "SequenceEnrollment"("userId");
CREATE INDEX "idx_discount_code" ON "DiscountCode"("code");
CREATE INDEX "idx_referral_code" ON "Referral"("code");
CREATE INDEX "idx_referral_referrer" ON "Referral"("referrerId");
CREATE INDEX "idx_marketing_event_type" ON "MarketingEvent"("eventType");
```

---

## 📧 EMAIL SERVICE INTEGRATION

### SendGrid Integration (Recommended)

Create `src/lib/email/sendgrid.ts`:

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM!,
        name: process.env.EMAIL_FROM_NAME!,
      },
      subject,
      html,
      text: text || stripHtml(html),
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    const [response] = await sgMail.send(msg);

    return {
      success: true,
      messageId: response.headers["x-message-id"],
    };
  } catch (error) {
    console.error("SendGrid error:", error);
    throw error;
  }
}

export async function sendBulkEmail(
  recipients: Array<{ email: string; name?: string }>,
  subject: string,
  html: string
) {
  try {
    const messages = recipients.map((recipient) => ({
      to: recipient.email,
      from: {
        email: process.env.EMAIL_FROM!,
        name: process.env.EMAIL_FROM_NAME!,
      },
      subject,
      html,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    }));

    await sgMail.send(messages);

    return {
      success: true,
      sent: messages.length,
    };
  } catch (error) {
    console.error("Bulk email error:", error);
    throw error;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
```

### Update Campaign Send API

Modify `src/app/api/marketing/campaigns/send/route.ts`:

```typescript
import { sendBulkEmail } from "@/lib/email/sendgrid";
import { database } from "@/lib/database";

export async function POST(request: NextRequest) {
  // ... existing validation ...

  // Get recipients
  const recipients = await getRecipients(validated.campaignId);

  // Send via SendGrid
  try {
    const result = await sendBulkEmail(
      recipients.map((r) => ({ email: r.email, name: r.name })),
      campaign.subject,
      campaign.content
    );

    // Update campaign status
    await database.emailCampaign.update({
      where: { id: validated.campaignId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // Track analytics
    await database.campaignAnalytics.update({
      where: { campaignId: validated.campaignId },
      data: {
        sent: result.sent,
      },
    });

    return NextResponse.json({
      success: true,
      sent: result.sent,
      message: "Campaign sent successfully",
    });
  } catch (error) {
    console.error("Campaign send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send campaign",
      },
      { status: 500 }
    );
  }
}
```

---

## 🔧 CRON JOBS & BACKGROUND WORKERS

### Setup Automated Sequence Processing

Create `src/lib/cron/sequence-processor.ts`:

```typescript
/**
 * Run this every hour via cron job
 * Example: Vercel Cron, AWS EventBridge, or node-cron
 */
export async function processAutomatedSequences() {
  console.log("Processing automated sequences...");

  // Find active enrollments that need emails
  const enrollments = await database.sequenceEnrollment.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      sequence: {
        include: {
          emails: true,
        },
      },
      user: true,
    },
  });

  for (const enrollment of enrollments) {
    const nextEmail = enrollment.sequence.emails[enrollment.currentStep];

    if (!nextEmail) {
      // Sequence complete
      await database.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED" },
      });
      continue;
    }

    // Check if it's time to send
    const enrolledDate = new Date(enrollment.enrolledAt);
    const daysSinceEnrolled = Math.floor(
      (Date.now() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceEnrolled >= nextEmail.delayDays) {
      // Send email
      await sendEmail(
        enrollment.user.email,
        nextEmail.subject,
        nextEmail.content
      );

      // Update enrollment
      await database.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStep: enrollment.currentStep + 1,
        },
      });

      console.log(`Sent sequence email to ${enrollment.user.email}`);
    }
  }

  console.log("Sequence processing complete");
}
```

### Vercel Cron Configuration

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-sequences",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/process-analytics",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Create cron endpoints:

```typescript
// src/app/api/cron/process-sequences/route.ts
import { processAutomatedSequences } from "@/lib/cron/sequence-processor";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  await processAutomatedSequences();

  return Response.json({ success: true });
}
```

---

## 🔐 SECURITY CONSIDERATIONS

### 1. Rate Limiting

Install rate limiting:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Add to API routes:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  // ... rest of handler
}
```

### 2. Email Unsubscribe

Create `src/app/unsubscribe/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new Response("Invalid token", { status: 400 });
  }

  // Verify and unsubscribe user
  const userId = await verifyUnsubscribeToken(token);

  await database.user.update({
    where: { id: userId },
    data: {
      emailSubscribed: false,
      unsubscribedAt: new Date(),
    },
  });

  return new Response("Successfully unsubscribed");
}
```

### 3. GDPR Compliance

Add to all marketing emails:

```html
<footer
  style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;"
>
  <p>You received this email because you signed up for Farmers Market.</p>
  <p>
    <a href="https://farmersmarket.app/unsubscribe?token={{unsubscribe_token}}"
      >Unsubscribe</a
    >
    |
    <a href="https://farmersmarket.app/privacy">Privacy Policy</a>
  </p>
  <p>Farmers Market, 123 Farm Street, CA 94000</p>
</footer>
```

---

## 📊 MONITORING & ANALYTICS

### 1. Sentry Error Tracking

```bash
npm install @sentry/nextjs
```

Configure `sentry.client.config.js`:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### 2. Custom Analytics Events

```typescript
// Track marketing events
export function trackMarketingEvent(
  eventType: string,
  userId?: string,
  metadata?: any
) {
  await database.marketingEvent.create({
    data: {
      eventType,
      userId,
      metadata: JSON.stringify(metadata),
    },
  });

  // Also send to analytics platform
  if (process.env.MIXPANEL_TOKEN) {
    mixpanel.track(eventType, {
      userId,
      ...metadata,
    });
  }
}
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Deploy Database Changes

```bash
# Backup production database first!
npx prisma db push --preview-feature

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

### Step 2: Deploy Application

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel --prod

# Or deploy to other platforms
# AWS: amplify publish
# Netlify: netlify deploy --prod
# Railway: railway up
```

### Step 3: Configure Email Service

```bash
# Test SendGrid connection
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@farmersmarket.app"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
```

### Step 4: Setup Cron Jobs

- **Vercel**: Automatic via `vercel.json`
- **AWS**: Create EventBridge rules
- **Railway**: Use Railway Cron
- **Self-hosted**: Use node-cron or systemd timers

### Step 5: Verify Deployment

Run post-deployment checks:

```bash
# Test APIs
curl https://farmersmarket.app/api/marketing/campaigns
curl https://farmersmarket.app/api/marketing/analytics

# Test sitemap
curl https://farmersmarket.app/sitemap.xml

# Test robots.txt
curl https://farmersmarket.app/robots.txt
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Immediate Checks (0-1 hour):

- [ ] All API endpoints responding (200 status)
- [ ] Database migrations applied successfully
- [ ] Email service connected (send test campaign)
- [ ] Cron jobs scheduled and running
- [ ] Sentry error tracking active
- [ ] Analytics tracking working

### First Day Checks:

- [ ] Monitor error logs (Sentry)
- [ ] Check email delivery rates
- [ ] Verify automated sequences triggering
- [ ] Test discount code validation
- [ ] Verify referral link generation
- [ ] Check analytics dashboard loading

### First Week Checks:

- [ ] Review email open/click rates
- [ ] Monitor sequence completion rates
- [ ] Check discount code usage
- [ ] Review referral conversions
- [ ] Analyze marketing ROI
- [ ] Optimize underperforming campaigns

---

## 🐛 TROUBLESHOOTING

### Email Sending Issues

**Problem**: Emails not sending

- Check API key is valid
- Verify sender email is authenticated
- Check rate limits not exceeded
- Review SendGrid activity logs

**Problem**: Emails going to spam

- Add SPF, DKIM, DMARC records
- Use authenticated domain
- Warm up sending reputation
- Avoid spam trigger words

### Database Performance

**Problem**: Slow queries

- Add missing indexes
- Optimize query patterns
- Consider read replicas
- Enable query logging

### Cron Jobs Not Running

**Problem**: Sequences not processing

- Verify cron schedule is correct
- Check cron endpoint authentication
- Review cron execution logs
- Test endpoint manually

---

## 📚 ADDITIONAL RESOURCES

### Documentation Links:

- SendGrid Docs: https://docs.sendgrid.com/
- Prisma Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Vercel Cron: https://vercel.com/docs/cron-jobs
- Next.js Deployment: https://nextjs.org/docs/deployment

### Support Contacts:

- SendGrid Support: support@sendgrid.com
- Vercel Support: https://vercel.com/support
- Community Discord: [Your Discord Link]

---

## 🎉 SUCCESS!

**Once deployed, your marketing automation platform will:**

✅ Send automated email campaigns
✅ Process sequences in background
✅ Track discount codes & referrals
✅ Provide real-time analytics
✅ Generate SEO-optimized content
✅ Scale to thousands of users

**Congratulations on deploying Phase 4!** 🚀

---

**Need help?** Review this guide or contact the development team.

**Next Steps**: Monitor performance and iterate based on user feedback!
