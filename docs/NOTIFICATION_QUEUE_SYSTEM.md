# 🔔 Notification Queue System Documentation

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: December 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Services](#services)
4. [Queue Infrastructure](#queue-infrastructure)
5. [Workers](#workers)
6. [Configuration](#configuration)
7. [Usage Examples](#usage-examples)
8. [Deployment](#deployment)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Notification Queue System provides reliable, scalable multi-channel notification delivery using Bull queues and Redis. It supports:

- ✅ **Email** notifications via SMTP/SendGrid
- ✅ **SMS** notifications via Twilio
- ✅ **Push** notifications via Firebase Cloud Messaging (FCM)
- ✅ **In-App** notifications stored in database

### Key Features

- 🔄 **Automatic retry** with exponential backoff
- ⏰ **Scheduled delivery** for future notifications
- 📊 **Delivery tracking** and logging
- 🎯 **User preferences** honor opt-in/opt-out
- 🚀 **High throughput** with configurable concurrency
- 🔒 **Graceful shutdown** and error handling
- 📈 **OpenTelemetry tracing** integration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   Next.js    │   │  API Routes  │   │   Services   │   │
│  │  Components  │   │              │   │              │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Notification Service                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • User preference filtering                         │  │
│  │  • Channel selection                                 │  │
│  │  • Template rendering                                │  │
│  │  • Queue routing                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
               ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │ Email Queue │  │  SMS Queue  │  │ Push Queue  │
    │   (Bull)    │  │   (Bull)    │  │   (Bull)    │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   Redis     │  │   Redis     │  │   Redis     │
    │  Job Store  │  │  Job Store  │  │  Job Store  │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │Email Worker │  │ SMS Worker  │  │Push Worker  │
    │ (5 threads) │  │ (3 threads) │  │ (5 threads) │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │Email Service│  │ SMS Service │  │Push Service │
    │   (SMTP)    │  │  (Twilio)   │  │    (FCM)    │
    └─────────────┘  └─────────────┘  └─────────────┘
```

### Data Flow

1. **Application** creates notification via `NotificationService`
2. **Service** checks user preferences and filters channels
3. **Queue** receives job with retry configuration
4. **Redis** stores job for processing
5. **Worker** picks up job and processes it
6. **Provider** (Twilio/FCM/SMTP) delivers notification
7. **Database** logs delivery status and metrics

---

## 📦 Services

### 1. Notification Service

**Location**: `src/lib/services/notification.service.ts`

Main service for creating and managing notifications across all channels.

```typescript
import { notificationService } from "@/lib/services/notification.service";

// Create and send notification
await notificationService.createNotification({
  userId: "user_123",
  type: "ORDER_CONFIRMATION",
  channels: ["EMAIL", "SMS", "PUSH"],
  title: "Order Confirmed",
  body: "Your order has been confirmed!",
  data: { orderNumber: "ORD-123" },
});
```

### 2. SMS Service

**Location**: `src/lib/services/sms.service.ts`

Handles SMS delivery via Twilio with template support.

```typescript
import { smsService } from "@/lib/services/sms.service";

// Send SMS
await smsService.sendSMS({
  to: "+1234567890",
  message: "Your order is ready!",
  userId: "user_123",
});

// Send template SMS
await smsService.sendTemplateSMS(
  "+1234567890",
  "ORDER_READY",
  { orderNumber: "ORD-123", farmName: "Green Valley Farm" },
  "user_123"
);
```

#### SMS Templates

Available templates in `SMS_TEMPLATES`:

- `ORDER_CONFIRMED`
- `ORDER_READY`
- `ORDER_CANCELLED`
- `VERIFICATION_CODE`
- `PASSWORD_RESET`
- `DELIVERY_UPDATE`
- `LOW_STOCK_ALERT`
- `NEW_REVIEW`
- `PAYMENT_FAILED`
- `PAYMENT_RECEIVED`
- `FARM_APPROVED`
- `FARM_REJECTED`
- `WELCOME`

### 3. Push Notification Service

**Location**: `src/lib/services/push.service.ts`

Manages push notifications via Firebase Cloud Messaging (FCM).

```typescript
import { pushNotificationService } from "@/lib/services/push.service";

// Register device token
await pushNotificationService.registerDeviceToken(
  "user_123",
  "fcm_device_token_here",
  "ios"
);

// Send push notification
await pushNotificationService.sendPushNotification({
  userId: "user_123",
  title: "Order Ready!",
  body: "Your order is ready for pickup",
  data: { orderNumber: "ORD-123" },
  priority: "high",
});

// Send template push
await pushNotificationService.sendTemplatePush(
  "user_123",
  "ORDER_READY",
  { orderNumber: "ORD-123", farmName: "Green Valley Farm" }
);
```

#### Push Templates

Available templates in `PUSH_TEMPLATES`:

- `ORDER_CONFIRMED`
- `ORDER_READY`
- `ORDER_CANCELLED`
- `NEW_MESSAGE`
- `NEW_REVIEW`
- `LOW_STOCK_ALERT`
- `PAYMENT_FAILED`
- `PAYMENT_RECEIVED`
- `DELIVERY_UPDATE`
- `FARM_APPROVED`
- `FARM_REJECTED`
- `PRICE_DROP`
- `SEASONAL_PRODUCT`
- `WELCOME`

---

## ⚙️ Queue Infrastructure

### Queue Configuration

**Location**: `src/lib/queue/notification.queue.ts`

All queues use Bull with Redis backend and the following configuration:

```typescript
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000, // Start with 2 seconds
  },
  removeOnComplete: {
    age: 7 * 24 * 60 * 60, // 7 days
    count: 100,
  },
  removeOnFail: {
    age: 30 * 24 * 60 * 60, // 30 days
    count: 200,
  },
  timeout: 30000, // 30 seconds per job
};
```

### Queue Methods

#### SMS Queue

```typescript
import { enqueueSMS, scheduleSMS } from "@/lib/queue/notification.queue";

// Enqueue SMS immediately
const jobId = await enqueueSMS({
  phoneNumber: "+1234567890",
  message: "Hello!",
  userId: "user_123",
});

// Schedule SMS for later
const scheduledJobId = await scheduleSMS(
  {
    phoneNumber: "+1234567890",
    message: "Reminder!",
  },
  new Date(Date.now() + 3600000) // 1 hour from now
);
```

#### Push Queue

```typescript
import { enqueuePush, schedulePush } from "@/lib/queue/notification.queue";

// Enqueue push immediately
const jobId = await enqueuePush({
  userId: "user_123",
  title: "New Message",
  body: "You have a new message",
  priority: "high",
});

// Schedule push for later
const scheduledJobId = await schedulePush(
  {
    userId: "user_123",
    title: "Reminder",
    body: "Don't forget!",
  },
  new Date(Date.now() + 3600000)
);
```

### Queue Statistics

```typescript
import { getAllQueueStats } from "@/lib/queue/notification.queue";

const stats = await getAllQueueStats();
console.log(stats);
// {
//   sms: { waiting: 5, active: 2, completed: 100, failed: 3, delayed: 0, total: 7 },
//   push: { waiting: 10, active: 4, completed: 250, failed: 5, delayed: 2, total: 16 },
//   notification: { waiting: 0, active: 0, completed: 50, failed: 0, delayed: 0, total: 0 }
// }
```

---

## 👷 Workers

### Email Worker

**Location**: `src/lib/workers/email.worker.ts`

- **Concurrency**: 5 (configurable via `EMAIL_WORKER_CONCURRENCY`)
- **Timeout**: 120 seconds
- **Queue**: `email-notifications`

```bash
# Start standalone
node -r ts-node/register src/lib/workers/email.worker.ts

# Or via npm script
npm run worker:email
```

### SMS Worker

**Location**: `src/lib/workers/sms.worker.ts`

- **Concurrency**: 3 (configurable via `SMS_WORKER_CONCURRENCY`)
- **Timeout**: 30 seconds
- **Queue**: `sms-notifications`

```bash
# Start standalone
node -r ts-node/register src/lib/workers/sms.worker.ts

# Or via npm script
npm run worker:sms
```

### Push Worker

**Location**: `src/lib/workers/push.worker.ts`

- **Concurrency**: 5 (configurable via `PUSH_WORKER_CONCURRENCY`)
- **Timeout**: 30 seconds
- **Queue**: `push-notifications`

```bash
# Start standalone
node -r ts-node/register src/lib/workers/push.worker.ts

# Or via npm script
npm run worker:push
```

### Master Worker Process

**Location**: `src/lib/workers/index.ts`

Starts all workers in a single process.

```bash
# Start all workers
node -r ts-node/register src/lib/workers/index.ts

# Or via npm script
npm run workers:start
```

---

## 🔧 Configuration

### Environment Variables

Add to your `.env.local` or `.env` file:

```bash
# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TLS=false

# ============================================
# TWILIO (SMS)
# ============================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# FIREBASE (PUSH NOTIFICATIONS)
# ============================================
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# ============================================
# WORKER CONFIGURATION
# ============================================
EMAIL_WORKER_CONCURRENCY=5
EMAIL_WORKER_TIMEOUT=120000
SMS_WORKER_CONCURRENCY=3
SMS_WORKER_TIMEOUT=30000
PUSH_WORKER_CONCURRENCY=5
PUSH_WORKER_TIMEOUT=30000
```

### Obtaining API Keys

#### Twilio Setup

1. Sign up at [twilio.com](https://www.twilio.com)
2. Go to Console Dashboard
3. Copy **Account SID** and **Auth Token**
4. Purchase a phone number
5. Add credentials to `.env`

#### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create or select project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download JSON file
6. Extract values:
   ```json
   {
     "project_id": "your-project-id",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "firebase-adminsdk@..."
   }
   ```
7. Add to `.env` (replace `\n` in private key with actual newlines or keep as `\n`)

---

## 💻 Usage Examples

### Example 1: Order Confirmation Notification

```typescript
// In your order service
import { notificationService } from "@/lib/services/notification.service";

async function confirmOrder(orderId: string) {
  const order = await database.order.findUnique({
    where: { id: orderId },
    include: { customer: true, farm: true },
  });

  // Send multi-channel notification
  await notificationService.createNotification({
    userId: order.customerId,
    farmId: order.farmId,
    type: "ORDER_CONFIRMATION",
    channels: ["EMAIL", "SMS", "PUSH"],
    title: "Order Confirmed!",
    body: `Your order #${order.orderNumber} from ${order.farm.name} has been confirmed.`,
    data: {
      orderNumber: order.orderNumber,
      farmName: order.farm.name,
      total: order.total.toString(),
    },
  });
}
```

### Example 2: Scheduled Reminder

```typescript
import { scheduleSMS } from "@/lib/queue/notification.queue";

// Send reminder 1 hour before pickup time
async function schedulePickupReminder(order: Order) {
  const reminderTime = new Date(order.pickupTime);
  reminderTime.setHours(reminderTime.getHours() - 1);

  await scheduleSMS(
    {
      phoneNumber: order.customer.phone,
      message: `Reminder: Your order #${order.orderNumber} is ready for pickup at ${formatTime(order.pickupTime)}`,
      userId: order.customerId,
    },
    reminderTime
  );
}
```

### Example 3: Broadcast Notification

```typescript
import { notificationService } from "@/lib/services/notification.service";

// Notify all farmers about system maintenance
async function broadcastMaintenanceAlert() {
  const farmers = await database.user.findMany({
    where: { role: "FARMER", status: "ACTIVE" },
    select: { id: true },
  });

  await notificationService.sendBulkNotifications({
    userIds: farmers.map((f) => f.id),
    type: "SYSTEM_ANNOUNCEMENT",
    channels: ["EMAIL", "PUSH"],
    title: "Scheduled Maintenance",
    body: "The platform will be undergoing maintenance on Sunday at 2 AM EST.",
  });
}
```

### Example 4: Low Stock Alert

```typescript
import { notificationService } from "@/lib/services/notification.service";

// Alert farmer when product stock is low
async function checkInventoryAndAlert(productId: string) {
  const product = await database.product.findUnique({
    where: { id: productId },
    include: { farm: { include: { owner: true } } },
  });

  if (product.stockQuantity <= product.lowStockThreshold) {
    await notificationService.sendLowStockAlert(
      product.id,
      product.name,
      product.stockQuantity
    );
  }
}
```

---

## 🚀 Deployment

### Development

```bash
# 1. Start Redis (required)
docker run -d -p 6379:6379 redis:alpine

# 2. Start Next.js app
npm run dev

# 3. Start workers (separate terminal)
npm run workers:start
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
    depends_on:
      - redis

  workers:
    build: .
    command: node dist/lib/workers/index.js
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
    depends_on:
      - redis
      - app

volumes:
  redis-data:
```

### Production (PM2)

```bash
# Install PM2
npm install -g pm2

# Start all workers with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs workers
```

**ecosystem.config.js**:

```javascript
module.exports = {
  apps: [
    {
      name: 'notification-workers',
      script: './dist/lib/workers/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/workers-error.log',
      out_file: './logs/workers-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
```

### Kubernetes

```yaml
# notification-workers-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notification-workers
spec:
  replicas: 2
  selector:
    matchLabels:
      app: notification-workers
  template:
    metadata:
      labels:
        app: notification-workers
    spec:
      containers:
      - name: workers
        image: farmersmarket/workers:latest
        env:
        - name: REDIS_HOST
          value: "redis-service"
        - name: REDIS_PORT
          value: "6379"
        - name: TWILIO_ACCOUNT_SID
          valueFrom:
            secretKeyRef:
              name: twilio-secrets
              key: account_sid
        - name: TWILIO_AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: twilio-secrets
              key: auth_token
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📊 Monitoring

### Queue Dashboard

Bull Board provides a web UI for monitoring queues:

```bash
npm install @bull-board/express bull-board
```

```typescript
// src/lib/monitoring/bull-board.ts
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from '@/lib/queue/email.queue';
import { smsQueue, pushQueue } from '@/lib/queue/notification.queue';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullAdapter(emailQueue),
    new BullAdapter(smsQueue),
    new BullAdapter(pushQueue),
  ],
  serverAdapter,
});

export default serverAdapter;
```

Access dashboard at: `http://localhost:3000/admin/queues`

### Health Check Endpoint

```typescript
// src/app/api/health/workers/route.ts
import { NextResponse } from "next/server";
import { areQueuesHealthy } from "@/lib/queue/notification.queue";

export async function GET() {
  const health = await areQueuesHealthy();

  return NextResponse.json(
    {
      status: health.overall ? "healthy" : "unhealthy",
      queues: health,
      timestamp: new Date().toISOString(),
    },
    { status: health.overall ? 200 : 503 }
  );
}
```

### Metrics Collection

```typescript
// Collect metrics for monitoring
import { getAllQueueStats } from "@/lib/queue/notification.queue";

async function collectMetrics() {
  const stats = await getAllQueueStats();

  // Send to monitoring service (Prometheus, Datadog, etc.)
  metrics.gauge('queue.sms.waiting', stats.sms.waiting);
  metrics.gauge('queue.sms.active', stats.sms.active);
  metrics.gauge('queue.push.waiting', stats.push.waiting);
  metrics.gauge('queue.push.active', stats.push.active);
}

// Run every minute
setInterval(collectMetrics, 60000);
```

---

## 🔍 Troubleshooting

### Issue: Workers Not Processing Jobs

**Symptoms**: Jobs stuck in "waiting" state

**Solutions**:

1. Check Redis connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. Verify workers are running:
   ```bash
   pm2 status
   # Or check process
   ps aux | grep worker
   ```

3. Check Redis memory:
   ```bash
   redis-cli info memory
   ```

4. Review worker logs:
   ```bash
   pm2 logs workers --lines 100
   ```

### Issue: SMS Not Sending

**Symptoms**: SMS jobs complete but no SMS received

**Solutions**:

1. Verify Twilio credentials:
   ```typescript
   import { smsService } from '@/lib/services/sms.service';
   console.log(smsService.getStatus());
   ```

2. Check Twilio balance and phone number status in Twilio Console

3. Verify phone number format:
   - Must include country code
   - Format: `+1234567890`

4. Check Twilio logs in console for delivery status

### Issue: Push Notifications Not Received

**Symptoms**: Push jobs complete but no notification on device

**Solutions**:

1. Verify device token is registered:
   ```typescript
   const tokens = await database.deviceToken.findMany({
     where: { userId: "user_123", isActive: true }
   });
   console.log(tokens);
   ```

2. Check Firebase credentials:
   ```typescript
   import { pushNotificationService } from '@/lib/services/push.service';
   console.log(pushNotificationService.getStatus());
   ```

3. Test FCM token validity in Firebase Console

4. Verify app has notification permissions enabled

### Issue: High Job Failure Rate

**Symptoms**: Many jobs in "failed" state

**Solutions**:

1. Check failed jobs:
   ```typescript
   import { getFailedSMSJobs, getFailedPushJobs } from '@/lib/queue/notification.queue';

   const failedSMS = await getFailedSMSJobs(10);
   failedSMS.forEach(job => {
     console.log(job.id, job.failedReason);
   });
   ```

2. Review error logs in database:
   ```sql
   SELECT * FROM sms_logs WHERE status = 'FAILED' ORDER BY created_at DESC LIMIT 10;
   SELECT * FROM push_notification_logs WHERE status = 'FAILED' ORDER BY created_at DESC LIMIT 10;
   ```

3. Increase retry attempts if transient failures:
   ```typescript
   // In queue configuration
   attempts: 5, // Increase from 3
   ```

4. Adjust backoff delay:
   ```typescript
   backoff: {
     type: 'exponential',
     delay: 5000, // Increase from 2000
   }
   ```

### Issue: Redis Out of Memory

**Symptoms**: Redis errors, jobs not being added

**Solutions**:

1. Increase Redis memory:
   ```bash
   # In redis.conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   ```

2. Clean old jobs more frequently:
   ```typescript
   import { cleanOldNotificationJobs } from '@/lib/queue/notification.queue';

   // Run daily
   setInterval(() => {
     cleanOldNotificationJobs(
       3 * 24 * 60 * 60 * 1000, // 3 days for completed
       7 * 24 * 60 * 60 * 1000  // 7 days for failed
     );
   }, 24 * 60 * 60 * 1000);
   ```

3. Reduce job retention:
   ```typescript
   removeOnComplete: {
     age: 3 * 24 * 60 * 60, // Reduce to 3 days
     count: 50,
   }
   ```

---

## 📚 Additional Resources

### Documentation

- [Bull Queue Docs](https://github.com/OptimalBits/bull)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Redis Documentation](https://redis.io/documentation)

### Related Files

- `src/lib/services/notification.service.ts` - Main notification service
- `src/lib/services/sms.service.ts` - SMS service
- `src/lib/services/push.service.ts` - Push notification service
- `src/lib/queue/notification.queue.ts` - Queue infrastructure
- `src/lib/queue/email.queue.ts` - Email queue
- `src/lib/workers/` - Worker processes
- `prisma/schema.prisma` - Database models (SMSLog, PushNotificationLog, DeviceToken)

### Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check queue statistics
4. Contact development team

---

**Last Updated**: December 2024
**Maintained By**: Farmers Market Platform Team
**License**: MIT
