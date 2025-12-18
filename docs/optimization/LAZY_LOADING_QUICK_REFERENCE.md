# ⚡ Lazy Loading Quick Reference Guide

**Purpose**: Quick copy-paste patterns for implementing lazy loading in the Farmers Market Platform  
**Last Updated**: 2025-01-XX  
**Status**: Production Ready ✅

---

## 📋 Table of Contents

1. [Email Service Lazy Loading](#email-service-lazy-loading)
2. [Tracing Lazy Loading](#tracing-lazy-loading)
3. [Component Lazy Loading](#component-lazy-loading)
4. [Service Lazy Loading](#service-lazy-loading)
5. [Middleware Lazy Loading](#middleware-lazy-loading)
6. [Common Patterns](#common-patterns)

---

## 📧 Email Service Lazy Loading

### Basic Email Sending

```typescript
// ✅ CORRECT: Lazy import
import { sendEmailLazy } from "@/lib/email/email-service-lazy";

export async function POST(request: NextRequest) {
  try {
    // Your main logic here
    const user = await database.user.create({ ... });

    // Send email (non-blocking)
    try {
      await sendEmailLazy({
        to: user.email,
        subject: "Welcome!",
        html: "<h1>Welcome to our platform</h1>",
        text: "Welcome to our platform",
      });
    } catch (emailError) {
      console.error("Email failed:", emailError);
      // Continue anyway
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Farmer Welcome Email

```typescript
import { sendFarmerWelcomeLazy } from "@/lib/email/email-service-lazy";

try {
  await sendFarmerWelcomeLazy(user.email, {
    farmerName: user.name,
    farmName: farm.name,
    farmId: farm.id,
  });
} catch (emailError) {
  console.error("Welcome email failed:", emailError);
}
```

### Support Ticket Confirmation

```typescript
import { sendSupportTicketConfirmationLazy } from "@/lib/email/email-service-lazy";

try {
  await sendSupportTicketConfirmationLazy({
    ticketId: "TICKET-123",
    subject: "ACCOUNT",
    name: "John Doe",
    email: "john@example.com",
  });
} catch (emailError) {
  console.error("Ticket confirmation failed:", emailError);
}
```

### Order Notifications

```typescript
import {
  sendOrderNotificationLazy,
  sendOrderConfirmationLazy
} from "@/lib/email/email-service-lazy";

// To farmer
await sendOrderNotificationLazy(farmerEmail, {
  orderNumber: "ORD-12345",
  customerName: "Jane Doe",
  farmName: "Green Acres",
  total: 45.99,
  items: [
    { name: "Tomatoes", quantity: 2, price: 5.99 },
    { name: "Lettuce", quantity: 1, price: 3.49 },
  ],
  pickupDate: "2025-02-01",
});

// To customer
await sendOrderConfirmationLazy(customerEmail, {
  orderNumber: "ORD-12345",
  customerName: "Jane Doe",
  farmName: "Green Acres",
  total: 45.99,
  items: [...],
  pickupDate: "2025-02-01",
});
```

### Batch Emails

```typescript
import { sendBatchEmailsLazy } from "@/lib/email/email-service-lazy";

const emails = users.map((user) => ({
  to: user.email,
  subject: "Newsletter",
  html: generateNewsletterHTML(user),
  text: generateNewsletterText(user),
}));

const results = await sendBatchEmailsLazy(emails);
console.log(`Sent ${results.filter((r) => r).length} emails`);
```

**Bundle Savings**: ~80 KB per route

---

## 🔍 Tracing Lazy Loading

### Basic Tracing

```typescript
import { traceIfEnabled } from "@/lib/tracing/lazy-tracer";
import { AgriculturalOperation } from "@/lib/tracing/agricultural-tracer";

export async function GET(request: NextRequest) {
  const result = await traceIfEnabled(
    AgriculturalOperation.CROP_PLANNING,
    {
      "http.method": "GET",
      "http.route": "/api/farms",
      "agricultural.resource": "farms",
      "db.operation": "findMany",
    },
    async () => {
      // Your traced operation here
      return await database.farm.findMany({ ... });
    }
  );

  return NextResponse.json({ data: result });
}
```

### Tracing with Timing

```typescript
import { traceWithTiming } from "@/lib/tracing/lazy-tracer";

const { result, durationMs, timestamp } = await traceWithTiming(
  AgriculturalOperation.HARVEST_PROCESSING,
  { "farm.id": farmId },
  async () => {
    return await processHarvest(farmId);
  },
);

console.log(`Operation completed in ${durationMs}ms`);
```

### Conditional Span

```typescript
import { conditionalSpan } from "@/lib/tracing/lazy-tracer";

const span = await conditionalSpan("database-query", {
  "db.table": "farm",
  "db.operation": "findMany",
});

try {
  const result = await database.farm.findMany({ ... });
  span.setStatus({ code: 0 }); // Success
  return result;
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: 1, message: error.message });
  throw error;
} finally {
  span.end();
}
```

### Seasonal Tracing

```typescript
import { traceSeasonalOperation } from "@/lib/tracing/lazy-tracer";

const result = await traceSeasonalOperation(
  AgriculturalOperation.PLANTING,
  "SPRING",
  async () => {
    return await plantCrops(farmId);
  },
);
```

**Bundle Savings**: ~50 KB per route (when tracing disabled)

---

## 🎨 Component Lazy Loading

### Basic Dynamic Component

```typescript
// components/admin/FarmsTableDynamic.tsx
import dynamic from "next/dynamic";

const FarmsTable = dynamic(
  () => import("./FarmsTable").then(mod => mod.FarmsTable),
  {
    loading: () => <div>Loading farms table...</div>,
    ssr: true, // or false for client-only
  }
);

export default FarmsTable;
```

### Usage in Page

```typescript
// app/admin/farms/page.tsx
import FarmsTable from "@/components/admin/FarmsTableDynamic";

export default function AdminFarmsPage() {
  return (
    <div>
      <h1>Farms Management</h1>
      <FarmsTable />
    </div>
  );
}
```

### Multiple Dynamic Components

```typescript
import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("@/components/admin/AdminDashboard"));
const AdminMetrics = dynamic(() => import("@/components/admin/AdminMetrics"));
const AdminOrders = dynamic(() => import("@/components/admin/AdminOrders"));

export default function AdminPage() {
  return (
    <>
      <AdminDashboard />
      <AdminMetrics />
      <AdminOrders />
    </>
  );
}
```

### With Loading State

```typescript
const HeavyChart = dynamic(
  () => import("@/components/charts/HeavyChart"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    ),
    ssr: false, // Client-side only
  }
);
```

**Bundle Savings**: ~30-50 KB per component

---

## 🔧 Service Lazy Loading

### Create Lazy Service Wrapper

```typescript
// lib/services/heavy-service-lazy.ts

/**
 * Lazy wrapper for HeavyService
 * Bundle savings: ~100 KB
 */

export async function processHeavyOperationLazy(data: any) {
  const { HeavyService } = await import("./heavy-service");
  return HeavyService.process(data);
}

export async function analyzeDataLazy(data: any) {
  const { HeavyService } = await import("./heavy-service");
  return HeavyService.analyze(data);
}

// Export types (no import overhead)
export type { HeavyServiceConfig, HeavyServiceResult } from "./heavy-service";
```

### Usage in API Route

```typescript
import { processHeavyOperationLazy } from "@/lib/services/heavy-service-lazy";

export async function POST(request: NextRequest) {
  const data = await request.json();

  // Heavy service only loaded when needed
  const result = await processHeavyOperationLazy(data);

  return NextResponse.json({ result });
}
```

### Pattern for External Libraries

```typescript
// lib/pdf/pdf-generator-lazy.ts

export async function generatePDFLazy(data: any) {
  // jsPDF is ~200 KB - only load when generating PDF
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF();
  doc.text("Hello world!", 10, 10);
  // ... PDF generation logic

  return doc.output("blob");
}
```

**Bundle Savings**: Varies (50-200 KB depending on library)

---

## 🚦 Middleware Lazy Loading

### Conditional Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast path: public routes
  if (pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  // Admin routes: load heavy auth
  if (pathname.startsWith("/admin")) {
    const { requireAdminAuth } = await import("@/lib/auth/admin-auth-lazy");
    const authResult = await requireAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // API routes: load rate limiter
  if (pathname.startsWith("/api")) {
    const { checkRateLimit } =
      await import("@/lib/middleware/rate-limiter-lazy");
    const rateLimit = await checkRateLimit(request);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Route-Specific Middleware

```typescript
// app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Load admin auth only for this route
  const { requireAdminAuth } = await import("@/lib/auth/admin-auth-lazy");
  const auth = await requireAdminAuth(request);

  if (!auth.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your route logic
  return NextResponse.json({ data: "Admin data" });
}
```

**Bundle Savings**: ~40-80 KB from middleware

---

## 🎯 Common Patterns

### Pattern 1: Non-Blocking Operations

```typescript
// ✅ CORRECT: Don't let optional operations break main flow
try {
  await optionalHeavyOperation();
} catch (error) {
  console.error("Optional operation failed:", error);
  // Continue anyway
}

return successResponse();
```

### Pattern 2: Parallel Lazy Loading

```typescript
// Load multiple heavy dependencies in parallel
const [emailResult, pdfResult, analyticsResult] = await Promise.all([
  sendEmailLazy({ ... }),
  generatePDFLazy(data),
  trackAnalyticsLazy(event),
]);
```

### Pattern 3: Conditional Loading

```typescript
// Only load heavy dependency if condition is met
if (shouldSendEmail) {
  const { sendEmailLazy } = await import("@/lib/email/email-service-lazy");
  await sendEmailLazy({ ... });
}

if (isPremiumUser) {
  const { generatePDFLazy } = await import("@/lib/pdf/pdf-generator-lazy");
  const pdf = await generatePDFLazy(data);
}
```

### Pattern 4: Feature Flags

```typescript
// Load feature only if enabled
if (process.env.ENABLE_ADVANCED_ANALYTICS === "true") {
  const { advancedAnalytics } = await import("@/lib/analytics/advanced-lazy");
  await advancedAnalytics.track(event);
}
```

### Pattern 5: Lazy Service with Cache

```typescript
// Cache loaded module for subsequent calls
let cachedService: any = null;

export async function getServiceLazy() {
  if (!cachedService) {
    const { HeavyService } = await import("./heavy-service");
    cachedService = HeavyService;
  }
  return cachedService;
}

// Usage
const service = await getServiceLazy();
await service.doSomething();
```

---

## 📊 Bundle Impact Reference

```
┌─────────────────────────────────────────────────────────┐
│ Dependency                │ Size    │ Lazy Savings      │
├───────────────────────────┼─────────┼───────────────────┤
│ nodemailer                │ 80 KB   │ 80 KB per route   │
│ OpenTelemetry             │ 50 KB   │ 50 KB per route   │
│ jsPDF                     │ 200 KB  │ 200 KB per route  │
│ Chart.js                  │ 150 KB  │ 150 KB per route  │
│ xlsx                      │ 180 KB  │ 180 KB per route  │
│ Admin components          │ 50 KB   │ 50 KB per page    │
│ Heavy middleware          │ 80 KB   │ 80 KB global      │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ When NOT to Use Lazy Loading

### Don't Lazy Load:

1. **Critical path dependencies** - Needed on every request
2. **Tiny modules** - <5 KB (overhead not worth it)
3. **Database client** - Should be singleton
4. **Core authentication** - Security-critical
5. **Frequently used utilities** - Better to bundle

### Example: Keep Eager

```typescript
// ✅ KEEP EAGER: Always needed
import { database } from "@/lib/database";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

// ❌ DON'T LAZY LOAD THESE: Used everywhere
```

---

## 🧪 Testing Lazy-Loaded Code

### Test Setup

```typescript
// __tests__/lazy-service.test.ts
import { describe, it, expect, jest } from "@jest/globals";

describe("Lazy Service", () => {
  it("should load service dynamically", async () => {
    const { processHeavyOperationLazy } =
      await import("@/lib/services/heavy-service-lazy");

    const result = await processHeavyOperationLazy({ test: "data" });
    expect(result).toBeDefined();
  });

  it("should cache loaded module", async () => {
    const start = performance.now();
    await import("@/lib/services/heavy-service-lazy");
    const firstLoad = performance.now() - start;

    const start2 = performance.now();
    await import("@/lib/services/heavy-service-lazy");
    const secondLoad = performance.now() - start2;

    // Second load should be much faster (cached)
    expect(secondLoad).toBeLessThan(firstLoad / 2);
  });
});
```

---

## 📈 Performance Monitoring

### Measure Lazy Loading Impact

```typescript
export async function GET(request: NextRequest) {
  const start = performance.now();

  // Lazy load heavy dependency
  const { heavyOperation } = await import("@/lib/heavy");
  const loadTime = performance.now() - start;

  console.log(`Module loaded in ${loadTime.toFixed(2)}ms`);

  const result = await heavyOperation();
  const totalTime = performance.now() - start;

  console.log(`Total time: ${totalTime.toFixed(2)}ms`);

  return NextResponse.json({ result });
}
```

---

## 🎓 Best Practices Summary

### ✅ DO:

- Use lazy loading for infrequently-used code (email, PDF, analytics)
- Implement non-blocking error handling
- Cache loaded modules when possible
- Measure and document bundle savings
- Test lazy-loaded code thoroughly

### ❌ DON'T:

- Lazy load critical path dependencies
- Lazy load tiny modules (<5 KB)
- Ignore first-call latency
- Forget error handling
- Skip testing

---

## 🔗 Related Documentation

- **Phase 5B Complete**: `docs/optimization/PHASE_5B_COMPLETE.md`
- **Phase 5C Complete**: `docs/optimization/PHASE_5C_EMAIL_OPTIMIZATION_COMPLETE.md`
- **Complete Summary**: `docs/optimization/PHASE_5_COMPLETE_SUMMARY.md`
- **Email Service**: `src/lib/email/email-service-lazy.ts`
- **Tracing Service**: `src/lib/tracing/lazy-tracer.ts`

---

## 📞 Questions?

- **Bundle too large?** Run `npm run build:analyze`
- **Lazy loading not working?** Check dynamic import syntax
- **Tests failing?** Ensure mocks handle dynamic imports
- **Performance issues?** Measure with `performance.now()`

---

**Last Updated**: 2025-01-XX  
**Status**: Production Ready ✅  
**Bundle Savings Achieved**: 375+ KB across platform
