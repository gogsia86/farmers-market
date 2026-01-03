# Sprint 4: Email Enhancements - Kickoff Document

**Sprint Duration**: Week 7-8 (2 weeks)  
**Start Date**: January 2025  
**Status**: 🚀 READY TO START  
**Engineer**: TBD  
**Priority**: HIGH  

---

## 📋 Executive Summary

Sprint 4 builds upon the comprehensive email notification service implemented in Sprint 3. This sprint focuses on enhancing the email system to production-grade standards with:
- Database schema updates for token-based authentication flows
- Background job queue for reliable email delivery
- User email preferences and unsubscribe functionality
- Email analytics and monitoring dashboard

**Goals**:
1. ✅ Complete production-ready email infrastructure
2. ✅ Enable reliable background email processing
3. ✅ Give users control over email preferences
4. ✅ Track email engagement metrics

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Database Schema Enhancement** (CRITICAL)
   - Add User model token fields for password reset and email verification
   - Ensure secure token storage and expiration handling
   - Create and test Prisma migration

2. **Email Queue Implementation** (HIGH)
   - Add Bull/BullMQ for background job processing
   - Implement retry logic with exponential backoff
   - Handle email failures gracefully

3. **User Email Preferences** (HIGH)
   - Create EmailPreferences table
   - Implement unsubscribe functionality
   - Build preference center UI

4. **Email Analytics** (MEDIUM)
   - Track email delivery status
   - Monitor open rates and click-through rates
   - Create email metrics dashboard

### Success Criteria

- [ ] All database migrations run successfully
- [ ] Email queue processes jobs reliably
- [ ] Users can manage email preferences
- [ ] Email analytics dashboard shows real-time data
- [ ] Zero TypeScript errors maintained
- [ ] All tests passing
- [ ] Documentation complete

---

## 📊 Current State Analysis

### What We Have (From Sprint 3)

✅ **Email Service** (`src/lib/services/email.service.ts` - 1,400 lines)
- Comprehensive email sending functionality
- 10+ professional email templates
- Graceful degradation in development
- Azure telemetry integration

✅ **Order Email Integration**
- Order confirmation emails
- Status update notifications
- Shipping notifications with tracking
- Cancellation notifications

✅ **Authentication Emails**
- Password reset endpoint (`/api/auth/forgot-password`)
- Email verification endpoint (`/api/auth/send-verification`)
- Welcome emails for new users

✅ **Type Safety**
- 0 TypeScript errors
- Comprehensive interfaces
- Full Zod validation

### What We Need (Sprint 4)

❌ **Database Support**
- No token fields in User model yet
- No EmailPreferences table
- No email tracking table

❌ **Background Processing**
- Emails sent synchronously
- No retry mechanism
- No queue for failed emails

❌ **User Control**
- No preference management
- No unsubscribe functionality
- All emails mandatory

❌ **Analytics**
- No delivery tracking
- No engagement metrics
- No monitoring dashboard

---

## 🏗️ Technical Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTION                               │
│           (Order created, Password reset, etc.)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              EMAIL SERVICE (Existing)                        │
│  - Prepares email content                                    │
│  - Checks user preferences ← NEW                             │
│  - Enqueues email job ← NEW                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BULL QUEUE ← NEW                            │
│  - Background job processing                                 │
│  - Retry logic (exponential backoff)                         │
│  - Job status tracking                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              EMAIL WORKER (Existing)                         │
│  - Sends email via Nodemailer                                │
│  - Records delivery status ← NEW                             │
│  - Tracks engagement ← NEW                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            DATABASE (Enhanced Schema)                        │
│  - User tokens (resetToken, verificationToken) ← NEW         │
│  - EmailPreferences (user preferences) ← NEW                 │
│  - EmailLog (delivery tracking) ← NEW                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Deliverables

### P4.1: Database Schema Updates ✅ PRIORITY 1

**File**: `prisma/schema.prisma`

**Changes Required**:

```prisma
model User {
  id                      String    @id @default(cuid())
  email                   String    @unique
  name                    String?
  emailVerified           DateTime?
  image                   String?
  
  // NEW: Token fields for authentication flows
  resetToken              String?   @unique
  resetTokenExpiry        DateTime?
  verificationToken       String?   @unique
  verificationTokenExpiry DateTime?
  
  // NEW: Relationship to email preferences
  emailPreferences        EmailPreferences?
  
  // Existing fields...
  role                    UserRole  @default(CUSTOMER)
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  
  // Existing relations...
  accounts                Account[]
  sessions                Session[]
  farms                   Farm[]
  orders                  Order[]
  reviews                 Review[]
  favorites               Favorite[]
}

// NEW: Email preferences table
model EmailPreferences {
  id                     String   @id @default(cuid())
  userId                 String   @unique
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Notification preferences
  orderConfirmation      Boolean  @default(true)
  orderStatusUpdates     Boolean  @default(true)
  orderShipped           Boolean  @default(true)
  orderDelivered         Boolean  @default(true)
  
  // Marketing preferences
  farmUpdates            Boolean  @default(true)
  newProducts            Boolean  @default(true)
  promotions             Boolean  @default(true)
  newsletter             Boolean  @default(false)
  
  // System preferences
  securityAlerts         Boolean  @default(true) // Always true, can't disable
  accountUpdates         Boolean  @default(true)
  
  // Unsubscribe functionality
  unsubscribedAt         DateTime?
  unsubscribeToken       String?  @unique
  
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  
  @@index([userId])
  @@index([unsubscribeToken])
}

// NEW: Email delivery tracking
model EmailLog {
  id                     String      @id @default(cuid())
  
  // Recipient information
  userId                 String?
  recipientEmail         String
  recipientName          String?
  
  // Email details
  emailType              EmailType
  subject                String
  templateName           String?
  
  // Delivery status
  status                 EmailStatus @default(PENDING)
  sentAt                 DateTime?
  deliveredAt            DateTime?
  failedAt               DateTime?
  
  // Error tracking
  errorMessage           String?
  retryCount             Int         @default(0)
  lastRetryAt            DateTime?
  
  // Engagement tracking
  openedAt               DateTime?
  clickedAt              DateTime?
  unsubscribedAt         DateTime?
  
  // Job tracking
  jobId                  String?     @unique
  queueName              String?
  
  // Metadata
  metadata               Json?
  
  createdAt              DateTime    @default(now())
  updatedAt              DateTime    @updatedAt
  
  @@index([userId])
  @@index([recipientEmail])
  @@index([emailType])
  @@index([status])
  @@index([sentAt])
  @@index([jobId])
}

enum EmailType {
  ORDER_CONFIRMATION
  ORDER_STATUS_UPDATE
  ORDER_SHIPPED
  ORDER_DELIVERED
  ORDER_CANCELLED
  PASSWORD_RESET
  EMAIL_VERIFICATION
  WELCOME
  FARM_APPROVED
  FARM_REJECTED
  NEWSLETTER
  PROMOTION
}

enum EmailStatus {
  PENDING
  QUEUED
  SENDING
  SENT
  DELIVERED
  FAILED
  BOUNCED
  UNSUBSCRIBED
}
```

**Migration Steps**:

1. Update `schema.prisma` with new models and fields
2. Generate migration: `npx prisma migrate dev --name add-email-enhancements`
3. Test migration on local database
4. Create seed data for testing
5. Verify all relationships work correctly

**Estimated Effort**: 2 hours

---

### P4.2: Email Queue Implementation ✅ PRIORITY 2

**Files to Create/Update**:
- `src/lib/queue/email.queue.ts` (NEW - 300 lines)
- `src/lib/workers/email.worker.ts` (NEW - 200 lines)
- `src/lib/services/email.service.ts` (UPDATE - add queue integration)

**Dependencies Required**:

```bash
npm install bull ioredis
npm install -D @types/bull
```

**Queue Configuration**:

```typescript
// src/lib/queue/email.queue.ts

import Queue from 'bull';
import { EmailOptions, EmailPriority } from '@/lib/services/email.service';

interface EmailJobData {
  emailOptions: EmailOptions;
  userId?: string;
  emailType: EmailType;
  metadata?: Record<string, any>;
}

// Create email queue
export const emailQueue = new Queue<EmailJobData>('email-notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200,     // Keep last 200 failed jobs
  },
});

// Job priority mapping
const PRIORITY_MAP: Record<EmailPriority, number> = {
  critical: 1,  // Highest priority
  high: 3,
  normal: 5,
  low: 7,       // Lowest priority
};

/**
 * Add email to queue
 */
export async function enqueueEmail(
  emailOptions: EmailOptions,
  userId?: string,
  emailType?: EmailType,
  metadata?: Record<string, any>
): Promise<string> {
  const job = await emailQueue.add(
    {
      emailOptions,
      userId,
      emailType: emailType || 'GENERIC',
      metadata,
    },
    {
      priority: PRIORITY_MAP[emailOptions.priority || 'normal'],
      jobId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
  );

  // Log to database
  if (userId) {
    await database.emailLog.create({
      data: {
        userId,
        recipientEmail: emailOptions.to,
        recipientName: emailOptions.recipientName,
        emailType: emailType || 'GENERIC',
        subject: emailOptions.subject,
        status: 'QUEUED',
        jobId: job.id.toString(),
        queueName: emailQueue.name,
        metadata: metadata || {},
      },
    });
  }

  return job.id.toString();
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed,
  };
}

/**
 * Retry failed job
 */
export async function retryFailedJob(jobId: string) {
  const job = await emailQueue.getJob(jobId);
  if (job && await job.isFailed()) {
    await job.retry();
    return true;
  }
  return false;
}

/**
 * Clean old jobs
 */
export async function cleanOldJobs() {
  await emailQueue.clean(7 * 24 * 60 * 60 * 1000, 'completed'); // 7 days
  await emailQueue.clean(30 * 24 * 60 * 60 * 1000, 'failed');   // 30 days
}
```

**Worker Implementation**:

```typescript
// src/lib/workers/email.worker.ts

import { emailQueue } from '@/lib/queue/email.queue';
import { emailService } from '@/lib/services/email.service';
import { database } from '@/lib/database';
import { trace } from '@opentelemetry/api';

// Process email jobs
emailQueue.process(async (job) => {
  const tracer = trace.getTracer('email-worker');
  
  return await tracer.startActiveSpan('processEmailJob', async (span) => {
    span.setAttributes({
      'job.id': job.id.toString(),
      'email.type': job.data.emailType,
      'email.recipient': job.data.emailOptions.to,
    });

    try {
      // Update status to SENDING
      if (job.data.userId) {
        await database.emailLog.updateMany({
          where: { jobId: job.id.toString() },
          data: { status: 'SENDING' },
        });
      }

      // Send email
      const result = await emailService.sendEmail(job.data.emailOptions);

      // Update status to SENT
      if (job.data.userId) {
        await database.emailLog.updateMany({
          where: { jobId: job.id.toString() },
          data: {
            status: result.success ? 'SENT' : 'FAILED',
            sentAt: result.success ? new Date() : undefined,
            failedAt: result.success ? undefined : new Date(),
            errorMessage: result.error?.message,
          },
        });
      }

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      // Update status to FAILED
      if (job.data.userId) {
        await database.emailLog.updateMany({
          where: { jobId: job.id.toString() },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            retryCount: job.attemptsMade,
            lastRetryAt: new Date(),
          },
        });
      }

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      span.end();
    }
  });
});

// Event listeners for monitoring
emailQueue.on('completed', (job, result) => {
  console.log(`✅ Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, error) => {
  console.error(`❌ Email job ${job.id} failed:`, error);
});

emailQueue.on('stalled', (job) => {
  console.warn(`⚠️ Email job ${job.id} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down email worker...');
  await emailQueue.close();
  process.exit(0);
});
```

**Environment Variables**:

```bash
# Redis Configuration (for Bull queue)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_TLS="false"

# Production (Azure Redis Cache)
# REDIS_HOST="your-redis.redis.cache.windows.net"
# REDIS_PORT="6380"
# REDIS_PASSWORD="your-redis-key"
# REDIS_TLS="true"
```

**Estimated Effort**: 4 hours

---

### P4.3: Email Preferences System ✅ PRIORITY 3

**Files to Create**:
- `src/lib/services/email-preferences.service.ts` (NEW - 250 lines)
- `src/app/api/preferences/email/route.ts` (NEW - 150 lines)
- `src/app/api/unsubscribe/route.ts` (NEW - 100 lines)
- `src/components/settings/EmailPreferences.tsx` (NEW - 300 lines)

**Service Implementation**:

```typescript
// src/lib/services/email-preferences.service.ts

import { database } from '@/lib/database';
import { EmailPreferences, Prisma } from '@prisma/client';
import crypto from 'crypto';

export class EmailPreferencesService {
  /**
   * Get user email preferences (create if not exists)
   */
  async getUserPreferences(userId: string): Promise<EmailPreferences> {
    let preferences = await database.emailPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await database.emailPreferences.create({
        data: {
          userId,
          unsubscribeToken: this.generateUnsubscribeToken(),
        },
      });
    }

    return preferences;
  }

  /**
   * Update user email preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<Omit<EmailPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<EmailPreferences> {
    const preferences = await this.getUserPreferences(userId);

    return await database.emailPreferences.update({
      where: { id: preferences.id },
      data: updates,
    });
  }

  /**
   * Check if user wants to receive email type
   */
  async canSendEmail(userId: string, emailType: string): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);

    // Check if user unsubscribed from all emails
    if (preferences.unsubscribedAt) {
      // Always allow security alerts
      return emailType === 'SECURITY_ALERT';
    }

    // Map email type to preference field
    const fieldMap: Record<string, keyof EmailPreferences> = {
      'ORDER_CONFIRMATION': 'orderConfirmation',
      'ORDER_STATUS_UPDATE': 'orderStatusUpdates',
      'ORDER_SHIPPED': 'orderShipped',
      'ORDER_DELIVERED': 'orderDelivered',
      'FARM_UPDATE': 'farmUpdates',
      'NEW_PRODUCT': 'newProducts',
      'PROMOTION': 'promotions',
      'NEWSLETTER': 'newsletter',
      'SECURITY_ALERT': 'securityAlerts',
      'ACCOUNT_UPDATE': 'accountUpdates',
    };

    const field = fieldMap[emailType];
    if (!field) {
      return true; // Unknown type, allow by default
    }

    return preferences[field] as boolean;
  }

  /**
   * Unsubscribe user from all emails
   */
  async unsubscribeAll(token: string): Promise<boolean> {
    const preferences = await database.emailPreferences.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!preferences) {
      return false;
    }

    await database.emailPreferences.update({
      where: { id: preferences.id },
      data: {
        unsubscribedAt: new Date(),
        // Disable all optional emails
        orderStatusUpdates: false,
        orderShipped: false,
        orderDelivered: false,
        farmUpdates: false,
        newProducts: false,
        promotions: false,
        newsletter: false,
        // Keep security and critical emails
        securityAlerts: true,
        accountUpdates: true,
        orderConfirmation: true,
      },
    });

    return true;
  }

  /**
   * Resubscribe user
   */
  async resubscribe(userId: string): Promise<EmailPreferences> {
    const preferences = await this.getUserPreferences(userId);

    return await database.emailPreferences.update({
      where: { id: preferences.id },
      data: {
        unsubscribedAt: null,
        // Re-enable common emails
        orderStatusUpdates: true,
        orderShipped: true,
        orderDelivered: true,
        farmUpdates: true,
      },
    });
  }

  /**
   * Generate secure unsubscribe token
   */
  private generateUnsubscribeToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

export const emailPreferencesService = new EmailPreferencesService();
```

**API Endpoints**:

```typescript
// src/app/api/preferences/email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { emailPreferencesService } from '@/lib/services/email-preferences.service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await emailPreferencesService.getUserPreferences(session.user.id);
    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const preferences = await emailPreferencesService.updatePreferences(
      session.user.id,
      updates
    );

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
```

**UI Component**:

```typescript
// src/components/settings/EmailPreferences.tsx

"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export function EmailPreferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/preferences/email');
      const data = await response.json();
      if (data.success) {
        setPreferences(data.data);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: string, value: boolean) => {
    setSaving(true);
    try {
      const response = await fetch('/api/preferences/email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();
      if (data.success) {
        setPreferences(data.data);
        toast({ title: 'Saved', description: 'Preferences updated' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Preferences</h2>
        <p className="text-muted-foreground">
          Manage which emails you receive from us
        </p>
      </div>

      <div className="space-y-4">
        {/* Order emails */}
        <PreferenceItem
          label="Order confirmations"
          description="Receive confirmation when you place an order"
          checked={preferences?.orderConfirmation}
          onChange={(v) => updatePreference('orderConfirmation', v)}
          disabled={saving}
        />

        <PreferenceItem
          label="Order status updates"
          description="Get notified when your order status changes"
          checked={preferences?.orderStatusUpdates}
          onChange={(v) => updatePreference('orderStatusUpdates', v)}
          disabled={saving}
        />

        {/* Marketing emails */}
        <PreferenceItem
          label="Farm updates"
          description="News and updates from your favorite farms"
          checked={preferences?.farmUpdates}
          onChange={(v) => updatePreference('farmUpdates', v)}
          disabled={saving}
        />

        <PreferenceItem
          label="New products"
          description="Be the first to know about new products"
          checked={preferences?.newProducts}
          onChange={(v) => updatePreference('newProducts', v)}
          disabled={saving}
        />

        <PreferenceItem
          label="Promotions"
          description="Exclusive deals and discounts"
          checked={preferences?.promotions}
          onChange={(v) => updatePreference('promotions', v)}
          disabled={saving}
        />

        {/* System emails - always enabled */}
        <PreferenceItem
          label="Security alerts"
          description="Important security notifications (always enabled)"
          checked={preferences?.securityAlerts}
          onChange={() => {}}
          disabled={true}
        />
      </div>
    </div>
  );
}

function PreferenceItem({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
```

**Estimated Effort**: 3 hours

---

### P4.4: Email Analytics Dashboard ✅ PRIORITY 4

**Files to Create**:
- `src/app/api/analytics/email/route.ts` (NEW - 200 lines)
- `src/app/(admin)/analytics/email/page.tsx` (NEW - 400 lines)
- `src/lib/services/email-analytics.service.ts` (NEW - 300 lines)

**Analytics Service**:

```typescript
// src/lib/services/email-analytics.service.ts

import { database } from '@/lib/database';
import { EmailStatus, EmailType } from '@prisma/client';

export class EmailAnalyticsService {
  /**
   * Get email delivery statistics
   */
  async getDeliveryStats(startDate: Date, endDate: Date) {
    const logs = await database.emailLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        status: true,
        emailType: true,
      },
    });

    const stats = {
      total: logs.length,
      sent: logs.filter((l) => l.status === 'SENT').length,
      failed: logs.filter((l) => l.status === 'FAILED').length,
      pending: logs.filter((l) => l.status === 'PENDING').length,
      deliveryRate: 0,
    };

    stats.deliveryRate = stats.total > 0 ? (stats.sent / stats.total) * 100 : 0;

    return stats;
  }

  /**
   * Get email engagement metrics
   */
  async getEngagementStats(startDate: Date, endDate: Date) {
    const logs = await database.emailLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'SENT',
      },
      select: {
        openedAt: true,
        clickedAt: true,
      },
    });

    const stats = {
      sent: logs.length,
      opened: logs.filter((l) => l.openedAt).length,
      clicked: logs.filter((l) => l.clickedAt).length,
      openRate: 0,
      clickRate: 0,
    };

    stats.openRate = stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
    stats.clickRate = stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0;

    return stats;
  }

  /**
   * Get email type breakdown
   */
  async getEmailTypeBreakdown(startDate: Date, endDate: Date) {
    const result = await database.emailLog.groupBy({
      by: ['emailType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    return result.map((item) => ({
      type: item.emailType,
      count: item._count.id,
    }));
  }

  /**
   * Get failed email details
   */
  async getFailedEmails(limit: number = 50) {
    return await database.emailLog.findMany({
      where: {
        status: 'FAILED',
      },
      orderBy: {
        failedAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        recipientEmail: true,
        emailType: true,
        errorMessage: true,
        failedAt: true,
        retryCount: true,
      },
    });
  }
}

export const emailAnalyticsService = new EmailAnalyticsService();
```

**Estimated Effort**: 3 hours

---

## 🧪 Testing Strategy

### Unit Tests

**Test Files to Create**:
- `__tests__/lib/services/email-preferences.service.test.ts`
- `__tests__/lib/queue/email.queue.test.ts`
- `__tests__/lib/services/email-analytics.service.test.ts`

**Test Coverage Requirements**:
- [ ] Database schema migrations
- [ ] Email queue enqueue/dequeue
- [ ] Worker job processing
- [ ] Preference updates
- [ ] Unsubscribe flow
- [ ] Analytics calculations

### Integration Tests

**Test Scenarios**:
1. **End-to-End Email Flow**
   - Trigger email → Queue → Worker → Delivery → Log
   - Verify database updates at each stage
   - Check telemetry events

2. **Preference Enforcement**
   - User disables email type
   - Trigger that email type
   - Verify email not sent

3. **Unsubscribe Flow**
   - User clicks unsubscribe link
   - Verify preferences updated
   - Verify no emails sent (except critical)

4. **Retry Logic**
   - Simulate SMTP failure
   - Verify job retried with backoff
   - Verify max attempts respected

### Manual Testing Checklist

- [ ] Create user account
- [ ] Trigger password reset email
- [ ] Verify email received with correct token
- [ ] Test token in database
- [ ] Update email preferences in UI
- [ ] Trigger disabled email type
- [ ] Verify email not sent
- [ ] Click unsubscribe link
- [ ] Verify redirected to confirmation page
- [ ] Check admin analytics dashboard
- [ ] Verify metrics accurate

---

## 📚 Documentation Requirements

### Code Documentation

- [ ] JSDoc comments for all public methods
- [ ] Interface documentation
- [ ] Type definitions exported
- [ ] Example usage in comments

### User Documentation

- [ ] Email preferences guide for users
- [ ] Unsubscribe flow documentation
- [ ] FAQ about email types

### Technical Documentation

- [ ] Database schema migration guide
- [ ] Redis setup instructions
- [ ] Queue monitoring guide
- [ ] Analytics dashboard user guide
- [ ] Troubleshooting guide

### Files to Create/Update

1. `docs/guides/EMAIL_PREFERENCES_GUIDE.md` (NEW)
2. `docs/guides/EMAIL_QUEUE_SETUP.md` (NEW)
3. `docs/admin/EMAIL_ANALYTICS_GUIDE.md` (NEW)
4. `docs/ENVIRONMENT_VARIABLES.md` (UPDATE)
5. `README.md` (UPDATE - Redis setup)

---

## 🔧 Environment Setup

### Local Development

**Required Services**:
1. **PostgreSQL** (existing) - for database
2. **Redis** (NEW) - for email queue

**Docker Compose Addition**:

```yaml
# Add to docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

**Environment Variables**:

```bash
# .env.local

# Redis (Email Queue)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_TLS="false"

# Email Service (existing)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@farmersmarket.com"
```

### Production Setup

**Azure Redis Cache**:
1. Create Azure Redis Cache instance
2. Get connection string
3. Update environment variables

```bash
# Production .env

REDIS_HOST="your-redis.redis.cache.windows.net"
REDIS_PORT="6380"
REDIS_PASSWORD="your-redis-key"
REDIS_TLS="true"
```

---

## 📊 Success Metrics

### Technical Metrics

- [ ] **Type Safety**: 0 TypeScript errors
- [ ] **Test Coverage**: >80% for new code
- [ ] **Performance**: Email queue processes <100ms per job
- [ ] **Reliability**: >99% email delivery rate

### Functional Metrics

- [ ] **User Adoption**: 50%+ users customize preferences
- [ ] **Email Engagement**: Track open/click rates
- [ ] **Queue Health**: <5 failed jobs per 1000 sent
- [ ] **Response Time**: Analytics dashboard loads <2s

### Business Metrics

- [ ] **User Satisfaction**: Reduced email complaints
- [ ] **Deliverability**: Improved sender reputation
- [ ] **Engagement**: Higher open and click rates
- [ ] **Compliance**: GDPR/CAN-SPAM compliant

---

## ⚠️ Risks & Mitigation

### Risk 1: Redis Dependency

**Risk**: New infrastructure dependency (Redis)  
**Impact**: HIGH  
**Mitigation**:
- Use managed Azure Redis Cache for production
- Implement graceful fallback (sync email if Redis unavailable)
- Add comprehensive health checks
- Document Redis setup thoroughly

### Risk 2: Database Schema Migration

**Risk**: Schema changes on existing data  
**Impact**: MEDIUM  
**Mitigation**:
- Test migration thoroughly on staging
- Create rollback migration
- Backup production database before migration
- Run migration during low-traffic period

### Risk 3: Email Queue Complexity

**Risk**: New async complexity with jobs/workers  
**Impact**: MEDIUM  
**Mitigation**:
- Comprehensive logging and telemetry
- Bull UI for queue monitoring
- Clear error messages and alerts
- Retry logic with limits

### Risk 4: User Preference Confusion

**Risk**: Users accidentally disable critical emails  
**Impact**: LOW  
**Mitigation**:
- Clear UI labels and descriptions
- Some emails always enabled (security)
- Confirmation before bulk disable
- Easy re-subscribe flow

---

## 🗓️ Implementation Timeline

### Week 1: Foundation (Days 1-5)

**Day 1-2**: Database Schema
- [ ] Update Prisma schema
- [ ] Generate and test migration
- [ ] Create seed data
- [ ] Verify relationships

**Day 3-4**: Email Queue
- [ ] Install Bull and Redis
- [ ] Implement queue service
- [ ] Create worker process
- [ ] Test job processing

**Day 5**: Integration
- [ ] Update email service to use queue
- [ ] Add preference checking
- [ ] Update order actions
- [ ] Test end-to-end flow

### Week 2: Features & Polish (Days 6-10)

**Day 6-7**: Email Preferences
- [ ] Implement preferences service
- [ ] Create API endpoints
- [ ] Build UI components
- [ ] Test unsubscribe flow

**Day 8**: Analytics
- [ ] Implement analytics service
- [ ] Create API endpoints
- [ ] Build dashboard UI
- [ ] Test metrics calculations

**Day 9**: Testing & Documentation
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Complete all documentation
- [ ] Update environment guides

**Day 10**: Review & Deploy
- [ ] Code review
- [ ] Final testing
- [ ] Deploy to staging
- [ ] Production deployment

---

## 📋 Pre-Sprint Checklist

Before starting Sprint 4:

### Technical Prerequisites
- [ ] Redis installed locally or Docker Compose updated
- [ ] Database backup created
- [ ] Staging environment ready for testing
- [ ] All Sprint 3 code merged to main

### Knowledge Prerequisites
- [ ] Read Bull.js documentation
- [ ] Review Prisma migration best practices
- [ ] Understand email deliverability metrics
- [ ] Review Redis basics

### Access Prerequisites
- [ ] Access to Azure Portal (for Redis Cache)
- [ ] Access to production database (for migration)
- [ ] Access to staging environment
- [ ] SendGrid/SMTP credentials ready

---

## 🎯 Sprint Completion Criteria

Sprint 4 is complete when:

### Core Functionality
- [ ] Database migrations run successfully
- [ ] Email queue processing jobs
- [ ] Users can manage email preferences
- [ ] Unsubscribe flow working
- [ ] Analytics dashboard showing data

### Quality Standards
- [ ] 0 TypeScript errors
- [ ] All tests passing
- [ ] >80% test coverage for new code
- [ ] No ESLint errors
- [ ] Code reviewed and approved

### Documentation
- [ ] Sprint completion report written
- [ ] Technical documentation complete
- [ ] User guides created
- [ ] Environment setup documented
- [ ] TECHNICAL_DEBT.md updated

### Production Ready
- [ ] Deployed to staging
- [ ] Smoke tests passing
- [ ] Performance metrics acceptable
- [ ] Security review complete
- [ ] Ready for production deployment

---

## 📖 Related Documentation

### Sprint 3 Deliverables
- [Sprint 3 Completion Report](./SPRINT_3_EMAIL_NOTIFICATIONS_COMPLETE.md)
- [Sprint 3 Continuation Summary](../../SPRINT_3_CONTINUATION_SUMMARY.md)

### Technical References
- [Email Service Implementation](../../src/lib/services/email.service.ts)
- [Database Schema](../../prisma/schema.prisma)
- [Environment Variables Guide](../ENVIRONMENT_VARIABLES.md)

### External Documentation
- [Bull.js Documentation](https://github.com/OptimalBits/bull)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Azure Redis Cache](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/)

---

## 🤝 Team Coordination

### Daily Standups

**Questions**:
1. What did I complete yesterday?
2. What am I working on today?
3. Any blockers?

### Mid-Sprint Check-in (Day 5)

**Review**:
- Progress on Week 1 deliverables
- Any timeline adjustments needed
- Risk assessment
- Blocker resolution

### Sprint Review (Day 10)

**Demonstrate**:
- Email queue in action
- Preference management UI
- Analytics dashboard
- End-to-end flow

---

## 🚀 Getting Started

### Step 1: Environment Setup

```bash
# Start Redis via Docker
docker-compose up -d redis

# Verify Redis running
redis-cli ping
# Expected: PONG

# Install new dependencies
npm install bull ioredis
npm install -D @types/bull
```

### Step 2: Database Migration

```bash
# Update schema.prisma (see P4.1 above)

# Generate migration
npx prisma migrate dev --name add-email-enhancements

# Verify migration
npx prisma studio
# Check User, EmailPreferences, EmailLog tables
```

### Step 3: Implement Queue

```bash
# Create queue files
touch src/lib/queue/email.queue.ts
touch src/lib/workers/email.worker.ts

# Implement (see P4.2 above)
```

### Step 4: Test Integration

```bash
# Start worker process
npm run worker:email

# Trigger test email
# Check queue dashboard
# Verify database logs
```

---

## 📞 Support & Resources

### Questions?

- **Technical Issues**: Check troubleshooting guide
- **Architecture Questions**: Review Sprint 3 documentation
- **Environment Setup**: See environment variables guide
- **Testing Help**: See testing strategy section

### Useful Commands

```bash
# Type check
npm run type-check

# Run tests
npm test

# Check queue status
npm run queue:status

# View email logs
npm run logs:email

# Clean old jobs
npm run queue:clean
```

---

## ✅ Final Notes

Sprint 4 builds directly on Sprint 3's foundation. The email service is already excellent - we're adding production-grade enhancements:
- **Reliability**: Queue with retry logic
- **Control**: User preferences
- **Visibility**: Analytics dashboard

Focus on:
1. ✅ Type safety (maintain 0 errors)
2. ✅ Comprehensive testing
3. ✅ Clear documentation
4. ✅ Production readiness

**Remember**: Agricultural consciousness in all code! 🌾

---

**Document Version**: 1.0  
**Created**: January 2025  
**Status**: READY FOR SPRINT START  
**Next Review**: End of Week 1  

🚀 **Ready to build production-grade email infrastructure!**