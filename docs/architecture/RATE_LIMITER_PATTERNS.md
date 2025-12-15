# 🛡️ Rate Limiter Patterns & Best Practices

## Overview

The Farmers Market Platform implements a sophisticated distributed rate limiting system to protect against abuse, ensure fair resource usage, and maintain system stability. This document provides comprehensive guidelines for implementing and using rate limiting effectively.

## Architecture

### Rate Limiting Components

```
┌─────────────────────────────────────────────────────────────┐
│                     REQUEST FLOW                             │
├─────────────────────────────────────────────────────────────┤
│  1. Request arrives at API route                             │
│     ↓                                                        │
│  2. Extract client identifier (IP, user ID, API key)         │
│     ↓                                                        │
│  3. Check rate limit in Redis/Memory                         │
│     ↓                                                        │
│  4a. WITHIN LIMIT → Process request                          │
│  4b. EXCEEDED → Return 429 Too Many Requests                 │
│     ↓                                                        │
│  5. Increment counter with TTL                               │
│     ↓                                                        │
│  6. Add rate limit headers to response                       │
└─────────────────────────────────────────────────────────────┘
```

### Storage Backend

- **Redis** (Production): Distributed counter with atomic operations, shared across instances
- **Memory Map** (Development/Fallback): In-process counter for local testing

## Rate Limiter API

### Core Functions

#### 1. Check Rate Limit

```typescript
import { checkRateLimit } from "@/lib/middleware/rate-limiter";

const result = await checkRateLimit({
  identifier: "user:123",
  max: 100, // Maximum requests
  window: 60, // Time window in seconds
});

if (!result.success) {
  // Rate limit exceeded
  console.log(`Too many requests. Reset in ${result.resetInSeconds}s`);
  return new Response("Rate limit exceeded", { status: 429 });
}

// Request allowed - continue processing
console.log(`Remaining: ${result.remaining}/${result.limit}`);
```

#### 2. Pre-configured Rate Limits

```typescript
import {
  LOGIN_RATE_LIMIT,
  API_RATE_LIMIT,
  SENSITIVE_RATE_LIMIT,
} from "@/lib/middleware/rate-limiter";

// Login attempts: 5 per 15 minutes
const loginResult = await checkRateLimit(LOGIN_RATE_LIMIT("192.168.1.1"));

// API requests: 100 per minute
const apiResult = await checkRateLimit(API_RATE_LIMIT("user:123"));

// Sensitive operations: 10 per hour
const sensitiveResult = await checkRateLimit(SENSITIVE_RATE_LIMIT("user:123"));
```

#### 3. Get Rate Limit Status

```typescript
import { getRateLimitStatus } from "@/lib/middleware/rate-limiter";

// Check current status without incrementing counter
const status = await getRateLimitStatus("user:123");

if (status) {
  console.log(`
    Limit: ${status.limit}
    Remaining: ${status.remaining}
    Reset: ${new Date(status.reset)}
  `);
}
```

#### 4. Reset Rate Limit

```typescript
import {
  resetRateLimit,
  resetAllRateLimits,
} from "@/lib/middleware/rate-limiter";

// Reset specific identifier
await resetRateLimit("user:123");

// Clear all rate limits (admin operation)
await resetAllRateLimits();
```

#### 5. Extract Client IP

```typescript
import { getClientIp } from "@/lib/middleware/rate-limiter";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  // clientIp extracted from headers:
  // 1. x-forwarded-for (priority)
  // 2. x-real-ip
  // 3. cf-connecting-ip (Cloudflare)
  // 4. "unknown" if none found

  console.log(`Request from IP: ${clientIp}`);
}
```

## Pre-configured Rate Limits

### 1. Login Rate Limit

**Purpose**: Prevent brute force authentication attacks

```typescript
LOGIN_RATE_LIMIT("192.168.1.1");

// Configuration:
// - Max: 5 attempts
// - Window: 900 seconds (15 minutes)
// - Identifier: IP address
```

**Use case**: Login endpoints, password reset, email verification

```typescript
// app/api/auth/login/route.ts
import {
  LOGIN_RATE_LIMIT,
  checkRateLimit,
} from "@/lib/middleware/rate-limiter";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  const rateLimit = await checkRateLimit(LOGIN_RATE_LIMIT(clientIp));

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: "Too many login attempts. Please try again later.",
        resetInSeconds: rateLimit.resetInSeconds,
      },
      { status: 429 },
    );
  }

  // Process login...
}
```

### 2. API Rate Limit

**Purpose**: General API protection for authenticated users

```typescript
API_RATE_LIMIT("user:123");

// Configuration:
// - Max: 100 requests
// - Window: 60 seconds (1 minute)
// - Identifier: User ID
```

**Use case**: General API endpoints, data fetching, CRUD operations

```typescript
// app/api/farms/route.ts
import { API_RATE_LIMIT, checkRateLimit } from "@/lib/middleware/rate-limiter";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(API_RATE_LIMIT(session.user.id));

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.reset.toString(),
          "Retry-After": rateLimit.resetInSeconds.toString(),
        },
      },
    );
  }

  // Fetch farms...
}
```

### 3. Sensitive Operations Rate Limit

**Purpose**: Strict limits for critical operations

```typescript
SENSITIVE_RATE_LIMIT("user:123");

// Configuration:
// - Max: 10 requests
// - Window: 3600 seconds (1 hour)
// - Identifier: User ID
```

**Use case**: Account changes, payment operations, admin actions

```typescript
// app/api/account/delete/route.ts
import {
  SENSITIVE_RATE_LIMIT,
  checkRateLimit,
} from "@/lib/middleware/rate-limiter";

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(SENSITIVE_RATE_LIMIT(session.user.id));

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: "Too many sensitive operations. Please try again later.",
        resetInSeconds: rateLimit.resetInSeconds,
      },
      { status: 429 },
    );
  }

  // Process account deletion...
}
```

## Rate Limiting Patterns

### Pattern 1: IP-Based Rate Limiting

**Use case**: Public endpoints (no authentication required)

```typescript
import { getClientIp, checkRateLimit } from "@/lib/middleware/rate-limiter";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  const rateLimit = await checkRateLimit({
    identifier: `ip:${clientIp}`,
    max: 20,
    window: 60,
  });

  if (!rateLimit.success) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  // Process request...
}
```

**Pros**:

- No authentication required
- Protects against anonymous attacks
- Simple to implement

**Cons**:

- Shared IPs (NAT, proxies) affect multiple users
- VPN/proxy users can bypass by changing IP

### Pattern 2: User-Based Rate Limiting

**Use case**: Authenticated endpoints

```typescript
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/middleware/rate-limiter";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit({
    identifier: `user:${session.user.id}`,
    max: 50,
    window: 60,
  });

  if (!rateLimit.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Process authenticated request...
}
```

**Pros**:

- Accurate per-user limits
- Fair distribution of resources
- Prevents account abuse

**Cons**:

- Requires authentication
- Attacker can create multiple accounts

### Pattern 3: API Key Rate Limiting

**Use case**: Third-party integrations

```typescript
import { checkRateLimit } from "@/lib/middleware/rate-limiter";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  // Verify API key
  const apiKeyRecord = await database.apiKey.findUnique({
    where: { key: apiKey },
  });

  if (!apiKeyRecord) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit({
    identifier: `apikey:${apiKey}`,
    max: apiKeyRecord.rateLimit,
    window: 60,
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "API rate limit exceeded" },
      { status: 429 },
    );
  }

  // Process API request...
}
```

**Pros**:

- Granular control per integration
- Different limits for different API keys
- Easy to track and monitor usage

**Cons**:

- Requires API key management
- Keys can be stolen/shared

### Pattern 4: Tiered Rate Limiting

**Use case**: Different limits based on user tier/role

```typescript
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/middleware/rate-limiter";

const TIER_LIMITS = {
  FREE: { max: 50, window: 60 },
  PREMIUM: { max: 200, window: 60 },
  ENTERPRISE: { max: 1000, window: 60 },
} as const;

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user tier
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true },
  });

  const tierLimit = TIER_LIMITS[user.tier] || TIER_LIMITS.FREE;

  const rateLimit = await checkRateLimit({
    identifier: `user:${session.user.id}`,
    ...tierLimit,
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        tier: user.tier,
        limit: tierLimit.max,
      },
      { status: 429 },
    );
  }

  // Process request...
}
```

### Pattern 5: Composite Rate Limiting

**Use case**: Multiple rate limits (IP + User)

```typescript
import { auth } from "@/lib/auth";
import { getClientIp, checkRateLimit } from "@/lib/middleware/rate-limiter";

export async function POST(request: NextRequest) {
  const session = await auth();
  const clientIp = getClientIp(request);

  // Check IP rate limit (broad protection)
  const ipRateLimit = await checkRateLimit({
    identifier: `ip:${clientIp}`,
    max: 100,
    window: 60,
  });

  if (!ipRateLimit.success) {
    return NextResponse.json(
      { error: "IP rate limit exceeded" },
      { status: 429 },
    );
  }

  // Check user rate limit (if authenticated)
  if (session?.user?.id) {
    const userRateLimit = await checkRateLimit({
      identifier: `user:${session.user.id}`,
      max: 50,
      window: 60,
    });

    if (!userRateLimit.success) {
      return NextResponse.json(
        { error: "User rate limit exceeded" },
        { status: 429 },
      );
    }
  }

  // Both limits passed - process request
}
```

### Pattern 6: Endpoint-Specific Rate Limiting

**Use case**: Different limits for different operations

```typescript
const ENDPOINT_LIMITS = {
  "GET /api/farms": { max: 100, window: 60 },
  "POST /api/farms": { max: 10, window: 60 },
  "DELETE /api/farms": { max: 5, window: 60 },
  "GET /api/products": { max: 200, window: 60 },
  "POST /api/orders": { max: 20, window: 60 },
} as const;

export async function createRateLimitMiddleware(
  endpoint: keyof typeof ENDPOINT_LIMITS,
) {
  return async (request: NextRequest) => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = ENDPOINT_LIMITS[endpoint];

    const rateLimit = await checkRateLimit({
      identifier: `user:${session.user.id}:${endpoint}`,
      ...limit,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded for ${endpoint}` },
        { status: 429 },
      );
    }

    return null; // Continue processing
  };
}

// Usage in API route
export async function POST(request: NextRequest) {
  const rateLimitResponse =
    await createRateLimitMiddleware("POST /api/farms")(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Process farm creation...
}
```

## Rate Limit Headers

### Standard Headers

```typescript
// Add rate limit information to response headers
function addRateLimitHeaders(
  response: NextResponse,
  rateLimit: RateLimitResult,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
  response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
  response.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());

  if (!rateLimit.success) {
    response.headers.set("Retry-After", rateLimit.resetInSeconds.toString());
  }

  return response;
}

// Usage
export async function GET(request: NextRequest) {
  const rateLimit = await checkRateLimit(API_RATE_LIMIT("user:123"));

  if (!rateLimit.success) {
    const response = NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 },
    );
    return addRateLimitHeaders(response, rateLimit);
  }

  const data = await fetchData();
  const response = NextResponse.json(data);
  return addRateLimitHeaders(response, rateLimit);
}
```

### Header Meanings

| Header                  | Description                          | Example      |
| ----------------------- | ------------------------------------ | ------------ |
| `X-RateLimit-Limit`     | Maximum requests allowed in window   | `100`        |
| `X-RateLimit-Remaining` | Requests remaining in current window | `42`         |
| `X-RateLimit-Reset`     | Unix timestamp when limit resets     | `1705334400` |
| `Retry-After`           | Seconds until rate limit resets      | `58`         |

## Monitoring & Alerting

### Track Rate Limit Violations

```typescript
import { trace } from "@opentelemetry/api";

export async function POST(request: NextRequest) {
  const tracer = trace.getTracer("rate-limiter");

  return await tracer.startActiveSpan("checkRateLimit", async (span) => {
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(LOGIN_RATE_LIMIT(clientIp));

    span.setAttributes({
      "rate_limit.identifier": clientIp,
      "rate_limit.limit": rateLimit.limit,
      "rate_limit.remaining": rateLimit.remaining,
      "rate_limit.success": rateLimit.success,
    });

    if (!rateLimit.success) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Rate limit exceeded",
      });

      // Log violation for monitoring
      console.warn(`Rate limit exceeded for ${clientIp}`, {
        limit: rateLimit.limit,
        resetInSeconds: rateLimit.resetInSeconds,
      });

      // Could also send to monitoring service
      await sendAlert({
        type: "RATE_LIMIT_VIOLATION",
        identifier: clientIp,
        endpoint: request.nextUrl.pathname,
      });
    }

    span.end();

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    // Continue processing...
  });
}
```

### Dashboard Metrics

```typescript
// Expose rate limiter metrics endpoint
// app/api/admin/metrics/rate-limits/route.ts

export async function GET(request: NextRequest) {
  const session = await auth();

  // Admin only
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get rate limit statistics from Redis
  const redis = getRedisClient();

  if (!redis) {
    return NextResponse.json({ error: "Redis unavailable" }, { status: 503 });
  }

  // Scan for all rate limit keys
  const keys = await redis.keys("rate-limit:*");

  const stats = await Promise.all(
    keys.map(async (key) => {
      const count = await redis.get(key);
      const ttl = await redis.ttl(key);

      return {
        identifier: key.replace("rate-limit:", ""),
        count: parseInt(count || "0"),
        ttl,
      };
    }),
  );

  // Aggregate statistics
  const totalIdentifiers = stats.length;
  const totalRequests = stats.reduce((sum, s) => sum + s.count, 0);
  const topConsumers = stats.sort((a, b) => b.count - a.count).slice(0, 10);

  return NextResponse.json({
    totalIdentifiers,
    totalRequests,
    topConsumers,
    timestamp: new Date().toISOString(),
  });
}
```

## Best Practices

### ✅ DO

1. **Use appropriate rate limits for endpoint sensitivity**

   ```typescript
   ✅ Login: 5 per 15 minutes (strict)
   ✅ API read: 100 per minute (moderate)
   ✅ Public data: 1000 per hour (lenient)
   ```

2. **Combine IP and user-based rate limiting**

   ```typescript
   ✅ Check both IP and user ID
   ✅ Prevents both anonymous and authenticated abuse
   ```

3. **Return helpful error messages**

   ```typescript
   ✅ {
     error: "Rate limit exceeded",
     resetInSeconds: 58,
     limit: 100,
     remaining: 0
   }
   ```

4. **Add rate limit headers to all responses**

   ```typescript
   ✅ X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
   ```

5. **Monitor and alert on violations**
   ```typescript
   ✅ Track rate limit violations
   ✅ Alert on suspicious patterns
   ✅ Dashboard for rate limit metrics
   ```

### ❌ DON'T

1. **Don't use the same limit for all endpoints**

   ```typescript
   ❌ All endpoints: 100 per minute
   ✅ Different limits based on cost/sensitivity
   ```

2. **Don't rate limit without proper headers**

   ```typescript
   ❌ Return 429 without headers
   ✅ Include X-RateLimit-* headers
   ```

3. **Don't forget to handle Redis unavailability**

   ```typescript
   ❌ Crash when Redis is down
   ✅ Automatic fallback to memory-based limiting
   ```

4. **Don't use overly aggressive limits**

   ```typescript
   ❌ 10 requests per hour for normal API
   ✅ Balance security and user experience
   ```

5. **Don't rate limit critical health/status endpoints**
   ```typescript
   ❌ Rate limit /health, /status
   ✅ Allow unlimited health checks
   ```

## Advanced Patterns

### Sliding Window Rate Limiting

```typescript
// More accurate than fixed window
async function slidingWindowRateLimit(
  identifier: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    return fallbackMemoryRateLimit(identifier, max, windowSeconds);
  }

  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const key = `rate-limit:sliding:${identifier}`;

  // Use Redis sorted set with timestamps as scores
  const pipeline = redis.pipeline();

  // Remove old entries
  pipeline.zremrangebyscore(key, 0, windowStart);

  // Count remaining entries
  pipeline.zcard(key);

  // Add current request
  pipeline.zadd(key, now, `${now}-${Math.random()}`);

  // Set expiry
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const count = results[1][1] as number;

  const success = count < max;
  const remaining = Math.max(0, max - count - 1);

  return {
    success,
    limit: max,
    remaining,
    reset: now + windowSeconds * 1000,
    resetInSeconds: windowSeconds,
  };
}
```

### Token Bucket Rate Limiting

```typescript
// Allow bursts while maintaining average rate
interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number; // tokens per second
}

async function tokenBucketRateLimit(
  identifier: string,
  capacity: number,
  refillRate: number,
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    return fallbackMemoryRateLimit(identifier, capacity, 60);
  }

  const key = `rate-limit:token:${identifier}`;
  const now = Date.now();

  // Get current bucket state
  const bucketData = await redis.get(key);
  let bucket: TokenBucket = bucketData
    ? JSON.parse(bucketData)
    : {
        tokens: capacity,
        lastRefill: now,
        capacity,
        refillRate,
      };

  // Refill tokens based on elapsed time
  const elapsedSeconds = (now - bucket.lastRefill) / 1000;
  const tokensToAdd = elapsedSeconds * refillRate;
  bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Check if request can be processed
  const success = bucket.tokens >= 1;

  if (success) {
    bucket.tokens -= 1;
  }

  // Save bucket state
  await redis.set(key, JSON.stringify(bucket), "EX", 3600);

  return {
    success,
    limit: capacity,
    remaining: Math.floor(bucket.tokens),
    reset: now + ((capacity - bucket.tokens) / refillRate) * 1000,
    resetInSeconds: Math.ceil((capacity - bucket.tokens) / refillRate),
  };
}
```

### Dynamic Rate Limiting

```typescript
// Adjust limits based on system load
async function dynamicRateLimit(
  identifier: string,
  baseMax: number,
  window: number,
): Promise<RateLimitResult> {
  // Get current system load
  const systemLoad = await getSystemLoad();

  // Adjust limit based on load
  let adjustedMax = baseMax;

  if (systemLoad > 0.9) {
    adjustedMax = Math.floor(baseMax * 0.5); // Reduce by 50%
  } else if (systemLoad > 0.7) {
    adjustedMax = Math.floor(baseMax * 0.75); // Reduce by 25%
  }

  return await checkRateLimit({
    identifier,
    max: adjustedMax,
    window,
  });
}

async function getSystemLoad(): Promise<number> {
  // Could check:
  // - CPU usage
  // - Memory usage
  // - Database connections
  // - Request queue depth
  // - Response times

  // Example: Redis connection pool
  const redis = getRedisClient();
  if (!redis) return 0;

  const info = await redis.info("stats");
  // Parse info and calculate load metric

  return 0.5; // Example: 50% load
}
```

## Testing

### Unit Tests

```typescript
describe("Rate Limiter", () => {
  beforeEach(async () => {
    await resetAllRateLimits();
  });

  it("should allow requests within limit", async () => {
    const result = await checkRateLimit({
      identifier: "test:1",
      max: 5,
      window: 60,
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should block requests exceeding limit", async () => {
    const identifier = "test:2";

    // Use up all requests
    for (let i = 0; i < 5; i++) {
      await checkRateLimit({ identifier, max: 5, window: 60 });
    }

    // Next request should be blocked
    const result = await checkRateLimit({ identifier, max: 5, window: 60 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset after time window", async () => {
    const identifier = "test:3";

    // Exhaust limit
    for (let i = 0; i < 5; i++) {
      await checkRateLimit({ identifier, max: 5, window: 1 });
    }

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Should be allowed again
    const result = await checkRateLimit({ identifier, max: 5, window: 1 });
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe("Rate Limit Middleware", () => {
  it("should enforce login rate limit", async () => {
    const ip = "192.168.1.100";

    // Mock 5 login attempts
    for (let i = 0; i < 5; i++) {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "x-forwarded-for": ip },
        body: JSON.stringify({ email: "test@example.com", password: "wrong" }),
      });

      expect(response.status).toBe(401); // Unauthorized (wrong password)
    }

    // 6th attempt should be rate limited
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      body: JSON.stringify({ email: "test@example.com", password: "wrong" }),
    });

    expect(response.status).toBe(429); // Too Many Requests
    expect(response.headers.get("retry-after")).toBeTruthy();
  });
});
```

## Troubleshooting

### Issue: Rate Limits Not Working

**Symptoms**: Users not being rate limited

**Causes & Solutions**:

1. Redis not connected → Check `REDIS_URL` environment variable
2. Identifier not consistent → Verify identifier extraction logic
3. Memory fallback in production → Ensure Redis is running
4. Keys expiring too quickly → Review TTL configuration

### Issue: False Positive Rate Limits

**Symptoms**: Legitimate users getting blocked

**Causes & Solutions**:

1. Shared IP addresses (NAT) → Use user-based limiting for authenticated requests
2. Limits too strict → Review and adjust `max` values
3. Multiple services sharing limits → Use service-specific identifier prefixes
4. CDN/proxy headers wrong → Fix IP extraction from headers

### Issue: Rate Limiter Performance Slow

**Symptoms**: High latency on rate-limited endpoints

**Causes & Solutions**:

1. Redis connection slow → Check Redis latency, optimize network
2. Too many Redis operations → Batch operations where possible
3. Memory fallback on production → Fix Redis connection
4. Inefficient identifier computation → Cache computed identifiers

## Agricultural Consciousness 🌾

Remember: Rate limiting is like crop rotation - it prevents resource exhaustion and ensures sustainable growth. Apply limits wisely to cultivate a healthy, thriving platform!

---

**Version**: 1.0  
**Last Updated**: 2024-01-15  
**Status**: ✅ PRODUCTION READY

_"Limit with wisdom, protect with precision, scale with agricultural consciousness."_ 🌾⚡
