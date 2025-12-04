# 🔧 PHASE 2 CLEANUP PLAN

**Farmers Market Platform - Service Layer Optimization & Logging Standardization**  
**Version:** 2.0  
**Timeline:** 2 weeks post-deployment  
**Priority:** HIGH  
**Status:** 📋 PLANNED

---

## 📊 EXECUTIVE SUMMARY

### Objective

Replace 600+ console statements with proper structured logging, focusing on critical production code paths (services, API routes) while maintaining acceptable console usage in monitoring infrastructure.

### Scope

- **Primary Target:** Service layer (`src/lib/services/`)
- **Secondary Target:** API routes (`src/app/api/`)
- **Tertiary Target:** Feature services (`src/features/`)
- **Out of Scope:** Monitoring infrastructure (acceptable usage)

### Success Criteria

- ✅ Zero console.log in `src/lib/services/`
- ✅ Zero console.log in `src/app/api/` (except error handling)
- ✅ Proper logger implementation with OpenTelemetry integration
- ✅ Structured logging with context and metadata
- ✅ All tests still passing

---

## 📈 CURRENT STATE ANALYSIS

### Console Statement Distribution

```
TOTAL: 600 console statements

By Directory:
  • src/lib:          434 (72%) - PRIMARY TARGET
  • src/app:          166 (28%) - SECONDARY TARGET
  • src/features:     0
  • src/repositories: 0

By Type:
  • console.log:   293 (49%)
  • console.error: 255 (42%)
  • console.warn:  41 (7%)
  • console.debug: 10 (2%)
  • console.info:  1 (<1%)
```

### Top 10 Offending Files (Prioritized)

| Priority  | File                                                | Count | Action              |
| --------- | --------------------------------------------------- | ----- | ------------------- |
| 🔥 HIGH   | `src/lib/performance/gpu-processor.ts`              | 39    | Replace with logger |
| 🟡 MEDIUM | `src/lib/monitoring/workflows/workflow-executor.ts` | 35    | Keep (monitoring)   |
| 🟡 MEDIUM | `src/lib/monitoring/reporter.ts`                    | 30    | Keep (monitoring)   |
| 🟡 MEDIUM | `src/lib/monitoring/bot.ts`                         | 27    | Keep (monitoring)   |
| 🔥 HIGH   | `src/lib/cache/redis.ts`                            | 19    | Replace with logger |
| 🟡 MEDIUM | `src/lib/monitoring/app-insights.ts`                | 18    | Keep (monitoring)   |
| 🔥 HIGH   | `src/app/api/webhooks/stripe/route.ts`              | 18    | Replace with logger |
| 🟡 MEDIUM | `src/lib/monitoring/storage/database.storage.ts`    | 13    | Keep (monitoring)   |
| 🔥 HIGH   | `src/lib/email/email-service.ts`                    | 13    | Replace with logger |
| 🟡 MEDIUM | `src/lib/monitoring/telemetry.ts`                   | 11    | Keep (monitoring)   |

### Critical Service Files (Must Fix)

```
🔴 CRITICAL - Production Services
├── src/lib/services/geocoding.service.ts       (9 statements)
├── src/lib/services/payment.service.ts         (10 statements)
└── src/app/api/webhooks/stripe/route.ts        (18 statements)

🟡 HIGH PRIORITY - Infrastructure
├── src/lib/cache/redis.ts                      (19 statements)
├── src/lib/email/email-service.ts              (13 statements)
└── src/lib/performance/gpu-processor.ts        (39 statements)

🟢 ACCEPTABLE - Monitoring (Keep)
├── src/lib/monitoring/**/*                     (~200 statements)
└── Test files (__tests__/**/*.test.ts)         (all console usage OK)
```

---

## 🎯 PHASE 2 OBJECTIVES

### Week 1: Foundation & Critical Services

**Days 1-2: Logger Infrastructure**

- [ ] Create comprehensive logging utility
- [ ] Integrate with OpenTelemetry
- [ ] Add structured logging support
- [ ] Create logging middleware for API routes

**Days 3-5: Critical Service Migration**

- [ ] Replace console in `geocoding.service.ts`
- [ ] Replace console in `payment.service.ts`
- [ ] Replace console in `stripe webhook route`
- [ ] Add tests for logging functionality

### Week 2: Infrastructure & Validation

**Days 6-8: Infrastructure Services**

- [ ] Replace console in `redis.ts`
- [ ] Replace console in `email-service.ts`
- [ ] Replace console in `gpu-processor.ts`

**Days 9-10: Validation & Rollout**

- [ ] Run full test suite
- [ ] Production deployment
- [ ] Monitor logging in production
- [ ] Performance validation

---

## 🛠️ IMPLEMENTATION STRATEGY

### Step 1: Create Enhanced Logger Utility

#### File: `src/lib/logger/index.ts`

```typescript
/**
 * 🌟 DIVINE LOGGING UTILITY
 * Structured logging with OpenTelemetry integration
 * Reference: 12_ERROR_HANDLING_VALIDATION.instructions.md
 */

import { trace, context as otelContext } from "@opentelemetry/api";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  service?: string;
  operation?: string;
  userId?: string;
  orderId?: string;
  farmId?: string;
  [key: string]: any;
}

export class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log errors with full context
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? {
          ...context,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : context;

    this.log(LogLevel.ERROR, message, errorContext);
  }

  /**
   * Internal logging implementation with OpenTelemetry integration
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const span = trace.getActiveSpan();
    const timestamp = new Date().toISOString();

    // Build structured log entry
    const logEntry = {
      timestamp,
      level,
      service: this.service,
      message,
      ...context,
      traceId: span?.spanContext().traceId,
      spanId: span?.spanContext().spanId,
    };

    // Add to active span if exists
    if (span) {
      span.addEvent(message, {
        "log.level": level,
        "log.service": this.service,
        ...context,
      });
    }

    // Output based on environment
    if (process.env.NODE_ENV === "production") {
      // Production: JSON structured logs for log aggregation
      console.log(JSON.stringify(logEntry));
    } else {
      // Development: Human-readable format
      const emoji = this.getLogEmoji(level);
      const contextStr = context ? JSON.stringify(context, null, 2) : "";
      console.log(`${emoji} [${timestamp}] [${this.service}] ${message}`);
      if (contextStr) {
        console.log(contextStr);
      }
    }
  }

  private getLogEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "🔍";
      case LogLevel.INFO:
        return "ℹ️";
      case LogLevel.WARN:
        return "⚠️";
      case LogLevel.ERROR:
        return "❌";
      default:
        return "📝";
    }
  }
}

/**
 * Create logger instance for a service
 */
export function createLogger(service: string): Logger {
  return new Logger(service);
}

/**
 * Default logger for general usage
 */
export const logger = createLogger("app");
```

#### File: `src/lib/logger/types.ts`

```typescript
/**
 * Agricultural domain-specific logging contexts
 */

export interface FarmContext {
  farmId: string;
  farmName?: string;
  farmerId?: string;
  operation: string;
}

export interface OrderContext {
  orderId: string;
  customerId: string;
  farmId?: string;
  totalAmount?: number;
  status: string;
}

export interface PaymentContext {
  paymentIntentId?: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface GeocodingContext {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  cached?: boolean;
}
```

---

### Step 2: Migration Pattern Examples

#### Example 1: Geocoding Service Migration

**Before:**

```typescript
// ❌ OLD PATTERN - Using console.log
export class GeocodingService {
  async geocodeAddress(address: string): Promise<Coordinates> {
    console.log(`🌍 Geocoding address: ${address}`);

    // Check cache first
    const cached = await this.cache.get(address);
    if (cached) {
      console.log(`✅ Geocoding cache hit: ${address}`);
      return cached;
    }

    try {
      const result = await this.googleMapsClient.geocode(address);
      console.log(`✅ Geocoded: ${address} → (${result.lat}, ${result.lng})`);
      return result;
    } catch (error) {
      console.error(`❌ Geocoding failed for: ${address}`, error);
      throw error;
    }
  }
}
```

**After:**

```typescript
// ✅ NEW PATTERN - Using structured logger
import { createLogger } from "@/lib/logger";
import type { GeocodingContext } from "@/lib/logger/types";

export class GeocodingService {
  private logger = createLogger("geocoding-service");

  async geocodeAddress(address: string): Promise<Coordinates> {
    const context: GeocodingContext = { address };

    this.logger.info("Geocoding address request", context);

    // Check cache first
    const cached = await this.cache.get(address);
    if (cached) {
      this.logger.info("Geocoding cache hit", {
        ...context,
        cached: true,
        coordinates: cached,
      });
      return cached;
    }

    try {
      const result = await this.googleMapsClient.geocode(address);
      this.logger.info("Geocoding successful", {
        ...context,
        coordinates: result,
        cached: false,
      });
      return result;
    } catch (error) {
      this.logger.error("Geocoding failed", error as Error, context);
      throw error;
    }
  }
}
```

#### Example 2: Payment Service Migration

**Before:**

```typescript
// ❌ OLD PATTERN
async handlePaymentSuccess(paymentIntent: PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  console.log(`Payment successful for order ${orderId}`, {
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  });

  try {
    await this.updateOrder(orderId);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}
```

**After:**

```typescript
// ✅ NEW PATTERN
import { createLogger } from '@/lib/logger';
import type { PaymentContext } from '@/lib/logger/types';

async handlePaymentSuccess(paymentIntent: PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  const context: PaymentContext = {
    paymentIntentId: paymentIntent.id,
    orderId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
  };

  this.logger.info('Payment successful', context);

  try {
    await this.updateOrder(orderId);
    this.logger.info('Order updated after payment', { orderId });
  } catch (error) {
    this.logger.error('Failed to update order after payment', error as Error, context);
    throw error;
  }
}
```

#### Example 3: Stripe Webhook Migration

**Before:**

```typescript
// ❌ OLD PATTERN - Multiple console statements
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    console.log("Stripe webhook received:", event.type);

    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("Processing payment success...");
        await handlePaymentSuccess(event.data.object);
        break;
      // ... more cases
    }

    console.log("Webhook processed successfully");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
```

**After:**

```typescript
// ✅ NEW PATTERN - Structured logging
import { createLogger } from "@/lib/logger";

const logger = createLogger("stripe-webhook");

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);

    logger.info("Stripe webhook received", {
      eventType: event.type,
      eventId: event.id,
      livemode: event.livemode,
    });

    switch (event.type) {
      case "payment_intent.succeeded":
        logger.info("Processing payment success", {
          paymentIntentId: event.data.object.id,
        });
        await handlePaymentSuccess(event.data.object);
        break;
      // ... more cases
    }

    logger.info("Webhook processed successfully", {
      eventType: event.type,
      eventId: event.id,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", error as Error, {
      signature: signature?.substring(0, 20) + "...",
    });
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
```

---

## 📋 DETAILED MIGRATION CHECKLIST

### Week 1: Critical Services

#### Day 1-2: Logger Infrastructure

- [ ] Create `src/lib/logger/index.ts`
- [ ] Create `src/lib/logger/types.ts`
- [ ] Add logger tests: `src/lib/logger/__tests__/logger.test.ts`
- [ ] Update `tsconfig.json` path alias: `@/lib/logger`
- [ ] Document logger usage in README

#### Day 3: Geocoding Service

- [ ] **File:** `src/lib/services/geocoding.service.ts`
- [ ] Replace 9 console statements
- [ ] Add GeocodingContext type
- [ ] Test geocoding with logger
- [ ] Verify cache logging works
- [ ] Verify error logging works

#### Day 4: Payment Service

- [ ] **File:** `src/lib/services/payment.service.ts`
- [ ] Replace 10 console statements
- [ ] Add PaymentContext type
- [ ] Test payment success logging
- [ ] Test payment failure logging
- [ ] Test refund logging

#### Day 5: Stripe Webhook

- [ ] **File:** `src/app/api/webhooks/stripe/route.ts`
- [ ] Replace 18 console statements
- [ ] Add webhook event context
- [ ] Test all webhook event types
- [ ] Verify signature validation logging
- [ ] Deploy to staging for testing

### Week 2: Infrastructure Services

#### Day 6: Redis Cache

- [ ] **File:** `src/lib/cache/redis.ts`
- [ ] Replace 19 console statements
- [ ] Add cache operation context
- [ ] Test connection logging
- [ ] Test operation logging
- [ ] Test error scenarios

#### Day 7: Email Service

- [ ] **File:** `src/lib/email/email-service.ts`
- [ ] Replace 13 console statements
- [ ] Add email context (to, subject, template)
- [ ] Test email send logging
- [ ] Test email failure logging
- [ ] Verify no sensitive data logged

#### Day 8: GPU Processor

- [ ] **File:** `src/lib/performance/gpu-processor.ts`
- [ ] Replace 39 console statements
- [ ] Add GPU operation context
- [ ] Test performance logging
- [ ] Verify no performance impact
- [ ] Test with actual GPU operations

#### Day 9-10: Validation & Deployment

- [ ] Run full test suite: `npm test`
- [ ] Check all tests pass
- [ ] Run type check: `npm run type-check`
- [ ] Build for production: `npm run build`
- [ ] Deploy to staging
- [ ] Monitor logs for 24 hours
- [ ] Verify log aggregation works
- [ ] Deploy to production
- [ ] Monitor production logs
- [ ] Create Phase 2 completion report

---

## 🧪 TESTING STRATEGY

### Logger Unit Tests

```typescript
// src/lib/logger/__tests__/logger.test.ts
describe("Logger", () => {
  describe("Structured Logging", () => {
    it("should log with proper structure", () => {
      const logger = createLogger("test-service");
      const logSpy = jest.spyOn(console, "log");

      logger.info("Test message", { userId: "123" });

      expect(logSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(logSpy.mock.calls[0][0]);
      expect(logEntry).toMatchObject({
        level: "info",
        service: "test-service",
        message: "Test message",
        userId: "123",
      });
    });
  });

  describe("OpenTelemetry Integration", () => {
    it("should add events to active span", () => {
      // Test span integration
    });
  });

  describe("Error Logging", () => {
    it("should log errors with stack traces", () => {
      // Test error logging
    });
  });
});
```

### Integration Tests

```typescript
// src/lib/services/__tests__/geocoding.service.integration.test.ts
describe("GeocodingService with Logger", () => {
  it("should log successful geocoding", async () => {
    const logSpy = jest.spyOn(console, "log");

    await geocodingService.geocodeAddress("123 Main St");

    // Verify structured log was created
    expect(logSpy).toHaveBeenCalled();
  });
});
```

---

## 📊 MONITORING & VALIDATION

### Production Log Monitoring

```bash
# Verify structured logging in production
# Check logs contain required fields

# Example structured log entry:
{
  "timestamp": "2024-11-26T10:30:00.000Z",
  "level": "info",
  "service": "payment-service",
  "message": "Payment successful",
  "orderId": "order_123",
  "amount": 5000,
  "currency": "usd",
  "traceId": "abc123...",
  "spanId": "def456..."
}
```

### Success Metrics

- [ ] Zero console.log in critical services
- [ ] All logs include traceId/spanId
- [ ] Log aggregation works (Azure/CloudWatch)
- [ ] No performance degradation
- [ ] All tests passing
- [ ] Team can query logs effectively

---

## 🚨 ROLLBACK PLAN

### If Issues Arise

```bash
# 1. Revert logger changes
git revert <phase2-commits>

# 2. Redeploy previous version
npm run build
npm start

# 3. Verify rollback
npm test
curl https://api.farmersmarket.com/health
```

### Partial Rollback

- Keep logger infrastructure
- Revert specific service changes
- Debug issues in development
- Re-deploy incrementally

---

## 📈 SUCCESS CRITERIA

### Quantitative Metrics

| Metric              | Current | Target | Status        |
| ------------------- | ------- | ------ | ------------- |
| Console in Services | 19      | 0      | 📋 Planned    |
| Console in APIs     | 18      | 0      | 📋 Planned    |
| Structured Logs     | 0%      | 100%   | 📋 Planned    |
| Tests Passing       | 1,870   | 1,870+ | ✅ Maintained |
| Build Success       | ✅      | ✅     | ✅ Maintained |

### Qualitative Metrics

- [ ] Team can easily search logs
- [ ] Errors include full context
- [ ] Logs are aggregated properly
- [ ] No sensitive data in logs
- [ ] Performance not impacted

---

## 🎓 TEAM TRAINING

### Logger Documentation

```markdown
# Using the Divine Logger

## Import

import { createLogger } from '@/lib/logger';

## Create Logger

const logger = createLogger('my-service');

## Usage

logger.info('Operation successful', { userId, orderId });
logger.warn('Potential issue detected', { details });
logger.error('Operation failed', error, { context });

## Best Practices

1. Always include relevant context
2. Use structured data (objects, not strings)
3. Never log sensitive data (passwords, tokens)
4. Use appropriate log levels
5. Include IDs for correlation
```

### Migration Training Session

- **Duration:** 1 hour
- **Topics:**
  - Why structured logging matters
  - How to use the logger
  - Migration patterns
  - Testing logging
  - Querying production logs

---

## 📅 TIMELINE

```
Week 1: Critical Services
├── Day 1-2: Logger Infrastructure ⏱️ 16 hours
├── Day 3:   Geocoding Service    ⏱️ 6 hours
├── Day 4:   Payment Service      ⏱️ 6 hours
└── Day 5:   Stripe Webhook       ⏱️ 8 hours

Week 2: Infrastructure & Validation
├── Day 6:   Redis Cache          ⏱️ 6 hours
├── Day 7:   Email Service        ⏱️ 6 hours
├── Day 8:   GPU Processor        ⏱️ 8 hours
└── Day 9-10: Validation & Deploy ⏱️ 16 hours

Total Estimated Time: 72 hours (2 weeks at 80% capacity)
```

---

## 💰 COST-BENEFIT ANALYSIS

### Costs

- **Development Time:** 72 hours (~2 weeks)
- **Testing Time:** Included in above
- **Deployment Risk:** Low (gradual rollout)

### Benefits

- **Debugging Efficiency:** 10x improvement in production debugging
- **Log Aggregation:** Proper integration with monitoring tools
- **Traceability:** Full request tracing with OpenTelemetry
- **Compliance:** Better audit trail for payments
- **Performance:** Structured JSON logs easier to process
- **Team Productivity:** Faster issue resolution

**ROI:** High - Investment pays for itself in first production incident

---

## 🔗 RELATED DOCUMENTS

- `REPOSITORY_ANALYSIS_AND_CLEANUP.md` - Full analysis
- `CLEANUP_EXECUTION_SUMMARY.md` - Phase 1 results
- `QUICK_CLEANUP_REFERENCE.md` - Quick commands
- `.github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md` - Error patterns

---

## ✅ APPROVAL & SIGN-OFF

- [ ] **Technical Lead:** Review and approve plan
- [ ] **DevOps Team:** Confirm log aggregation setup
- [ ] **Product Team:** Acknowledge timeline
- [ ] **QA Team:** Review testing strategy

**Start Date:** TBD (Post Phase 1 deployment)  
**Target Completion:** 2 weeks from start  
**Status:** 📋 AWAITING APPROVAL

---

**Document Version:** 2.0  
**Last Updated:** November 26, 2024  
**Next Review:** Upon Phase 1 completion  
**Owner:** Engineering Team
