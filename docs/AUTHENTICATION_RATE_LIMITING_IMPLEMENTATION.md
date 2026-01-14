# 🔐 Authentication & Rate Limiting Implementation Guide

**Farmers Market Platform - AI Features Security**  
**Version:** 1.0  
**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [Rate Limiting](#rate-limiting)
5. [AI Middleware](#ai-middleware)
6. [Usage Tracking & Quotas](#usage-tracking--quotas)
7. [API Integration](#api-integration)
8. [Testing](#testing)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This document covers the implementation of authentication, rate limiting, cost tracking, and usage quotas for AI-powered endpoints in the Farmers Market Platform.

### Key Features

- ✅ **Authentication**: NextAuth v5 integration with session validation
- ✅ **Rate Limiting**: Multi-layer (Redis + in-memory) with per-user and per-endpoint limits
- ✅ **Cost Tracking**: Automatic logging of AI usage with token and cost metrics
- ✅ **Usage Quotas**: Monthly token and cost limits per user
- ✅ **Middleware**: Reusable middleware for all AI endpoints
- ✅ **Error Handling**: Comprehensive error responses with rate limit headers

### Technology Stack

- **Authentication**: NextAuth v5 (Auth.js)
- **Rate Limiting**: Redis (Upstash) or in-memory fallback
- **Database**: Prisma + PostgreSQL
- **Logging**: Pino (structured logging)
- **Type Safety**: TypeScript with strict mode

---

## 🏗️ Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Request                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Middleware Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Check   │→ │ Rate Limiter │→ │ Quota Check  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Endpoint Handler                         │
│  ┌──────────────────────────────────────────────┐           │
│  │ 1. Validate request data (Zod)               │           │
│  │ 2. Call OpenAI API                           │           │
│  │ 3. Process response                          │           │
│  │ 4. Log usage (tokens, cost)                  │           │
│  │ 5. Return formatted response                 │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Database & Redis Storage                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AIUsageLog   │  │ AIUsageQuota │  │ Rate Limits  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Request arrives** → AI endpoint
2. **Middleware executes**:
   - Validate user authentication (NextAuth session)
   - Check rate limits (Redis or in-memory)
   - Verify usage quotas (PostgreSQL)
3. **Endpoint processes** request (if middleware passes)
4. **Usage logged** to database with cost calculation
5. **Response returned** with appropriate headers

---

## ⚙️ Setup & Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# ============================================================================
# Authentication (NextAuth v5)
# ============================================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters

# ============================================================================
# Database
# ============================================================================
DATABASE_URL=postgresql://user:password@localhost:5432/farmers_market

# ============================================================================
# Redis (Optional - for distributed rate limiting)
# ============================================================================
# Standard Redis
REDIS_URL=redis://localhost:6379

# OR Upstash Redis (Recommended for production)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# ============================================================================
# OpenAI
# ============================================================================
OPENAI_API_KEY=sk-your-openai-api-key

# ============================================================================
# Monitoring (Optional)
# ============================================================================
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 2. Database Migration

Run the Prisma migration to create AI usage tracking tables:

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add-ai-usage-tracking

# Apply migration to production
npx prisma migrate deploy
```

### 3. Install Dependencies

Ensure you have the required packages:

```bash
npm install @upstash/redis ioredis next-auth@beta prisma @prisma/client zod pino sonner
```

### 4. Verify Setup

Run the following command to check TypeScript compilation:

```bash
npx tsc --noEmit
```

---

## 🛡️ Rate Limiting

### Rate Limit Configuration

Rate limits are defined in `src/lib/rate-limit/index.ts`:

```typescript
export const RATE_LIMITS = {
  // AI Endpoints (cost-sensitive)
  AI_PRODUCT_DESCRIPTION: {
    interval: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 requests per hour
    uniqueTokenPerInterval: 500,
  },

  AI_PRICING: {
    interval: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 requests per hour
    uniqueTokenPerInterval: 500,
  },

  AI_ADVISOR: {
    interval: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 conversations per hour
    uniqueTokenPerInterval: 500,
  },

  AI_PEST_IDENTIFY: {
    interval: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 image analyses per hour (vision is expensive)
    uniqueTokenPerInterval: 500,
  },

  // API Endpoints (standard)
  API_DEFAULT: {
    interval: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    uniqueTokenPerInterval: 500,
  },

  // Authentication endpoints (strict)
  AUTH: {
    interval: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    uniqueTokenPerInterval: 500,
  },
};
```

### Customizing Rate Limits

To adjust rate limits for specific endpoints:

```typescript
// src/lib/rate-limit/index.ts

// Example: Increase product description limit for premium users
export const getPremiumRateLimits = (userRole: string) => {
  if (userRole === 'PREMIUM' || userRole === 'ADMIN') {
    return {
      ...RATE_LIMITS.AI_PRODUCT_DESCRIPTION,
      max: 100, // Double the limit for premium users
    };
  }
  return RATE_LIMITS.AI_PRODUCT_DESCRIPTION;
};
```

### Rate Limit Response

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again in 3452 seconds.",
    "retryAfter": 3452
  }
}
```

**Response Headers:**

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706123456
Retry-After: 3452
```

---

## 🤖 AI Middleware

### Middleware Features

The AI middleware (`src/lib/ai/middleware.ts`) provides:

1. **Authentication validation**
2. **Rate limiting enforcement**
3. **Usage quota checking**
4. **Cost calculation**
5. **Usage logging**

### Using the Middleware

#### Basic Usage

```typescript
// src/app/api/ai/your-endpoint/route.ts
import { withAIMiddleware, extractUser } from "@/lib/ai/middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Apply middleware
  const middlewareResult = await withAIMiddleware(request, {
    requireAuth: true,
    rateLimitConfig: RATE_LIMITS.AI_PRODUCT_DESCRIPTION,
    endpoint: "your-endpoint",
    checkQuota: true,
  });

  // If middleware returns a NextResponse, it's an error response
  if (middlewareResult instanceof NextResponse) {
    return middlewareResult;
  }

  // Extract user info
  const { userId, email, role } = extractUser(middlewareResult);

  // Your endpoint logic here...
  // ...

  return NextResponse.json({ success: true, data: result });
}
```

#### Skipping Specific Checks

```typescript
// Skip authentication (public endpoint)
const result = await withAIMiddleware(request, {
  requireAuth: false,
  endpoint: "public-endpoint",
});

// Skip quota check (admin endpoint)
const result = await withAIMiddleware(request, {
  requireAuth: true,
  checkQuota: false,
  endpoint: "admin-endpoint",
});
```

---

## 📊 Usage Tracking & Quotas

### Database Models

#### AIUsageLog

Tracks every AI API call:

```prisma
model AIUsageLog {
  id               String   @id @default(cuid())
  userId           String
  endpoint         String   // "product-description", "pricing", "advisor"
  model            String   // "gpt-4o", "gpt-4-vision-preview"
  tokensUsed       Int
  costUSD          Float    // Estimated cost in USD
  requestId        String   @unique
  requestData      Json?
  responseData     Json?
  confidence       Float?
  processingTimeMs Int
  success          Boolean
  errorCode        String?
  errorMessage     String?
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id])
}
```

#### AIUsageQuota

Manages user quotas:

```prisma
model AIUsageQuota {
  id                       String   @id @default(cuid())
  userId                   String   @unique
  monthlyTokenLimit        Int      @default(100000)
  monthlyTokenUsed         Int      @default(0)
  monthlyCostLimit         Float    @default(50.00)
  monthlyCostUsed          Float    @default(0.00)
  productDescriptionHourly Int      @default(50)
  pricingHourly            Int      @default(100)
  advisorHourly            Int      @default(30)
  pestIdentifyHourly       Int      @default(20)
  periodStart              DateTime @default(now())
  periodEnd                DateTime
  user                     User     @relation(fields: [userId], references: [id])
}
```

### Logging Usage

Usage is automatically logged when using the middleware:

```typescript
import { logAIUsage, estimateCost } from "@/lib/ai/middleware";

// After successful API call
const costUSD = estimateCost("gpt-4o", tokensUsed);

await logAIUsage({
  userId,
  endpoint: "product-description",
  model: "gpt-4o",
  tokensUsed,
  costUSD,
  requestId,
  requestData: { productName, category },
  responseData: { wordCount, confidence },
  confidence: 0.95,
  processingTimeMs: Date.now() - startTime,
  success: true,
});
```

### Querying Usage

```typescript
// Get user's monthly usage
const quota = await database.aIUsageQuota.findUnique({
  where: { userId },
});

console.log(`Tokens used: ${quota.monthlyTokenUsed}/${quota.monthlyTokenLimit}`);
console.log(`Cost: $${quota.monthlyCostUsed}/$${quota.monthlyCostLimit}`);

// Get recent usage logs
const recentUsage = await database.aIUsageLog.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// Get usage by endpoint
const endpointUsage = await database.aIUsageLog.groupBy({
  by: ['endpoint'],
  where: { userId, success: true },
  _sum: { tokensUsed: true, costUSD: true },
  _count: true,
});
```

---

## 🔌 API Integration

### Complete Example

Here's a complete example integrating all features:

```typescript
// src/app/api/ai/example/route.ts
import { getOpenAIClient } from "@/lib/ai/agent-config";
import {
  estimateCost,
  extractUser,
  logAIUsage,
  withAIMiddleware,
} from "@/lib/ai/middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { createLogger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("AI-Example");

// Validation schema
const RequestSchema = z.object({
  input: z.string().min(1).max(500),
  temperature: z.number().min(0).max(2).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // 1. Apply middleware
    const middlewareResult = await withAIMiddleware(request, {
      requireAuth: true,
      rateLimitConfig: RATE_LIMITS.AI_PRODUCT_DESCRIPTION,
      endpoint: "example",
      checkQuota: true,
    });

    if (middlewareResult instanceof NextResponse) {
      return middlewareResult;
    }

    const { userId, email } = extractUser(middlewareResult);

    // 2. Validate request
    const body = await request.json();
    const { input, temperature } = RequestSchema.parse(body);

    logger.info("Processing AI request", { requestId, userId });

    // 3. Call OpenAI
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: input },
      ],
      temperature: temperature || 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "";
    const tokensUsed = completion.usage?.total_tokens || 0;
    const costUSD = estimateCost("gpt-4o", tokensUsed);

    // 4. Log usage
    await logAIUsage({
      userId,
      endpoint: "example",
      model: "gpt-4o",
      tokensUsed,
      costUSD,
      requestId,
      requestData: { inputLength: input.length },
      responseData: { outputLength: response.length },
      processingTimeMs: Date.now() - startTime,
      success: true,
    });

    // 5. Return response
    return NextResponse.json({
      success: true,
      data: { response },
      metadata: {
        requestId,
        tokensUsed,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error("AI request failed", { error, requestId });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Request failed" } },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
// __tests__/lib/rate-limit.test.ts
import { RateLimiter } from "@/lib/rate-limit";

describe("RateLimiter", () => {
  it("should allow requests within limit", async () => {
    const limiter = new RateLimiter({
      interval: 60000,
      max: 5,
      uniqueTokenPerInterval: 100,
    });

    for (let i = 0; i < 5; i++) {
      const result = await limiter.check("test-user");
      expect(result.success).toBe(true);
    }
  });

  it("should block requests exceeding limit", async () => {
    const limiter = new RateLimiter({
      interval: 60000,
      max: 3,
      uniqueTokenPerInterval: 100,
    });

    // First 3 should succeed
    for (let i = 0; i < 3; i++) {
      await limiter.check("test-user");
    }

    // 4th should fail
    const result = await limiter.check("test-user");
    expect(result.success).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// __tests__/api/ai/product-description.test.ts
import { createMockSession } from "@/tests/utils";

describe("POST /api/ai/product-description", () => {
  it("requires authentication", async () => {
    const response = await fetch("/api/ai/product-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName: "Test", category: "Test" }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("enforces rate limits", async () => {
    const session = await createMockSession();

    // Make requests up to limit
    for (let i = 0; i < 50; i++) {
      await fetch("/api/ai/product-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": session.cookie,
        },
        body: JSON.stringify({ productName: "Test", category: "Test" }),
      });
    }

    // Next request should be rate limited
    const response = await fetch("/api/ai/product-description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": session.cookie,
      },
      body: JSON.stringify({ productName: "Test", category: "Test" }),
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("50");
  });
});
```

---

## 📈 Monitoring

### Logging

All AI requests are logged with structured data:

```typescript
logger.info("AI request processed", {
  requestId,
  userId,
  endpoint: "product-description",
  tokensUsed: 456,
  costUSD: 0.00912,
  processingTimeMs: 1234,
  success: true,
});
```

### Metrics to Track

1. **Request Volume**: Requests per endpoint per hour
2. **Token Usage**: Total tokens consumed per user/endpoint
3. **Cost**: Daily/monthly AI spending
4. **Latency**: Average response time per endpoint
5. **Error Rate**: Failed requests percentage
6. **Quota Violations**: Users hitting limits

### Dashboard Queries

```sql
-- Daily AI costs by endpoint
SELECT 
  endpoint,
  DATE(created_at) as date,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost,
  COUNT(*) as request_count
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY endpoint, DATE(created_at)
ORDER BY date DESC, total_cost DESC;

-- Top users by cost
SELECT 
  u.email,
  u.role,
  SUM(a.cost_usd) as total_cost,
  SUM(a.tokens_used) as total_tokens,
  COUNT(*) as request_count
FROM ai_usage_logs a
JOIN users u ON u.id = a.user_id
WHERE a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.role
ORDER BY total_cost DESC
LIMIT 20;

-- Rate limit violations
SELECT 
  endpoint,
  COUNT(*) as violations,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_usage_logs
WHERE error_code = 'RATE_LIMIT_EXCEEDED'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY endpoint
ORDER BY violations DESC;
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Redis Connection Errors

**Problem**: Rate limiting fails, falls back to in-memory

**Solution**:
```bash
# Check Redis is running
redis-cli ping

# Verify environment variables
echo $REDIS_URL
echo $UPSTASH_REDIS_REST_URL

# Test connection in Node.js
node -e "const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.ping().then(console.log)"
```

#### 2. Rate Limit Headers Not Showing

**Problem**: Response doesn't include rate limit headers

**Solution**: Ensure you're calling `createRateLimitHeaders()`:

```typescript
const result = await rateLimit(request, config, userId);
const headers = createRateLimitHeaders(result);

return NextResponse.json(data, { headers });
```

#### 3. Quota Not Resetting

**Problem**: User's monthly quota doesn't reset

**Solution**: Check the `periodEnd` date and implement a cron job:

```typescript
// src/app/api/cron/reset-quotas/route.ts
export async function GET() {
  const now = new Date();
  const expiredQuotas = await database.aIUsageQuota.findMany({
    where: { periodEnd: { lt: now } },
  });

  for (const quota of expiredQuotas) {
    const nextPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    await database.aIUsageQuota.update({
      where: { id: quota.id },
      data: {
        monthlyTokenUsed: 0,
        monthlyCostUsed: 0,
        periodStart: now,
        periodEnd: nextPeriodEnd,
      },
    });
  }

  return Response.json({ reset: expiredQuotas.length });
}
```

#### 4. High Latency on First Request

**Problem**: First AI request is slow

**Solution**: Warm up connections on app start:

```typescript
// src/lib/ai/warmup.ts
import { getOpenAIClient } from "@/lib/ai/agent-config";

export async function warmupAI() {
  try {
    const client = getOpenAIClient();
    await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 5,
    });
    console.log("✅ AI client warmed up");
  } catch (error) {
    console.error("❌ AI warmup failed:", error);
  }
}
```

#### 5. Authentication Fails in Development

**Problem**: NextAuth session not found

**Solution**:
```bash
# Check NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Verify session cookie in browser DevTools
# Clear cookies and login again

# Check database session table
psql $DATABASE_URL -c "SELECT * FROM sessions LIMIT 1;"
```

---

## 📚 Additional Resources

- [NextAuth v5 Documentation](https://authjs.dev/)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

## 🎯 Best Practices

1. **Always use middleware** for AI endpoints
2. **Log all usage** for cost tracking and debugging
3. **Set appropriate rate limits** based on endpoint cost
4. **Monitor quota usage** and alert users before hitting limits
5. **Implement graceful degradation** when Redis is unavailable
6. **Use structured logging** with request IDs for traceability
7. **Cache expensive operations** where possible
8. **Test rate limiting** thoroughly in staging
9. **Review costs daily** and adjust limits as needed
10. **Provide clear error messages** to users

---

**Last Updated:** January 2025  
**Maintained by:** Farmers Market Platform Development Team  
**License:** MIT