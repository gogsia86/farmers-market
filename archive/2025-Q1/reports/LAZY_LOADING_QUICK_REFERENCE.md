# ⚡ Lazy-Loading Quick Reference

## Copy-Paste Patterns for Bundle Optimization

**Purpose**: Reduce server bundle sizes by deferring heavy dependency loading  
**When to Use**: Any dependency >50 KB or optional/environment-specific code  
**Status**: ✅ Production-Ready Patterns

---

## 📋 Quick Decision Tree

```
Is the dependency > 50 KB?
  └─ YES → Create lazy wrapper (see patterns below)
  └─ NO → Normal import is fine

Is the dependency optional/feature-flagged?
  └─ YES → Create lazy wrapper with fallback
  └─ NO → Consider if it could be made optional

Is the dependency environment-specific?
  └─ YES → Create lazy wrapper with conditional loading
  └─ NO → Normal import is fine
```

---

## 🎯 Pattern 1: Lazy Service with Fallback

**Use Case**: Optional services (email, tracing, analytics)  
**Bundle Savings**: 50-100 KB per route  
**Example**: Email Service, Redis Client, Tracing

```typescript
// ✅ GOOD - src/lib/services/heavy-service-lazy.ts

/**
 * Lazy wrapper for heavy service
 * Bundle savings: ~XX KB per route
 */

// Define interface (matches original service)
interface IHeavyService {
  doSomething(data: string): Promise<boolean>;
  doSomethingElse(): Promise<void>;
}

// Optional: Fallback implementation
class FallbackService implements IHeavyService {
  async doSomething(data: string): Promise<boolean> {
    console.log("Fallback: doSomething called with", data);
    return true;
  }

  async doSomethingElse(): Promise<void> {
    console.log("Fallback: doSomethingElse called");
  }
}

let fallbackInstance: FallbackService | null = null;
let cachedService: IHeavyService | null = null;

// Check if service should be loaded
function shouldLoadService(): boolean {
  return process.env.ENABLE_SERVICE === "true";
}

// Get service (lazy-loaded)
async function getService(): Promise<IHeavyService> {
  // Fast path: Service disabled, use fallback
  if (!shouldLoadService()) {
    if (!fallbackInstance) {
      fallbackInstance = new FallbackService();
    }
    return fallbackInstance;
  }

  // Lazy load actual service
  if (!cachedService) {
    const { heavyService } = await import("./heavy-service");
    cachedService = heavyService;
  }

  return cachedService;
}

// Export lazy wrapper
export const heavyServiceLazy: IHeavyService = {
  async doSomething(data: string): Promise<boolean> {
    const service = await getService();
    return service.doSomething(data);
  },

  async doSomethingElse(): Promise<void> {
    const service = await getService();
    return service.doSomethingElse();
  },
};

// Optional: Helper functions
export async function doSomethingLazy(data: string): Promise<boolean> {
  return heavyServiceLazy.doSomething(data);
}
```

**Usage**:

```typescript
// ❌ BEFORE (eager import)
import { heavyService } from "@/lib/services/heavy-service";
await heavyService.doSomething("data");

// ✅ AFTER (lazy import)
import { heavyServiceLazy } from "@/lib/services/heavy-service-lazy";
await heavyServiceLazy.doSomething("data");
```

---

## 🎯 Pattern 2: Conditional Execution

**Use Case**: Feature-flagged operations (tracing, debugging, analytics)  
**Bundle Savings**: 30-50 KB per route  
**Example**: Tracing, Performance Monitoring

```typescript
// ✅ GOOD - src/lib/features/conditional-feature-lazy.ts

/**
 * Execute function with optional feature loading
 */

function isFeatureEnabled(): boolean {
  return process.env.ENABLE_FEATURE === "true";
}

export async function executeWithFeature<T>(
  operationType: string,
  metadata: Record<string, any>,
  fn: () => Promise<T>,
): Promise<T> {
  // Fast path: Feature disabled, execute directly
  if (!isFeatureEnabled()) {
    return fn();
  }

  // Lazy load feature infrastructure
  try {
    const { featureExecutor } = await import("./feature-executor");
    return await featureExecutor.execute(operationType, metadata, fn);
  } catch (error) {
    console.warn("Feature loading failed, executing without feature:", error);
    return fn();
  }
}

// With timing fallback
export async function executeWithTiming<T>(
  operationType: string,
  metadata: Record<string, any>,
  fn: () => Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  const startTime = performance.now();
  const result = await executeWithFeature(operationType, metadata, fn);
  const durationMs = performance.now() - startTime;

  return { result, durationMs };
}
```

**Usage**:

```typescript
// ✅ WITH FEATURE
import { executeWithFeature } from "@/lib/features/conditional-feature-lazy";

const result = await executeWithFeature(
  "OPERATION_TYPE",
  { key: "value" },
  async () => {
    // Your operation here
    return await someOperation();
  },
);
```

---

## 🎯 Pattern 3: Type-Only Imports

**Use Case**: Using types from heavy modules  
**Bundle Savings**: Prevents entire module bundling  
**Example**: Prisma types, external library types

```typescript
// ❌ BAD - Bundles entire module
import { HeavyType, someFunction } from "./heavy-module";

// ✅ GOOD - Type only, no runtime bundle
import type { HeavyType } from "./heavy-module";

// ✅ GOOD - Mixed imports (type separate)
import { someFunction } from "./heavy-module";
import type { HeavyType, AnotherType } from "./heavy-module";

// ✅ GOOD - Import type keyword
import { type HeavyType, someFunction } from "./heavy-module";
```

---

## 🎯 Pattern 4: Dynamic Component Loading

**Use Case**: Heavy React components (admin panels, charts, editors)  
**Bundle Savings**: Client-side bundle reduction  
**Example**: Admin tables, rich text editors

```typescript
// ✅ GOOD - src/components/heavy/HeavyComponentDynamic.tsx

'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Lazy load the heavy component
const HeavyComponentLazy = dynamic(
  () => import('./HeavyComponent').then((mod) => mod.HeavyComponent),
  {
    loading: () => <div>Loading...</div>,
    // Note: Don't use ssr: false in Server Components
  }
);

// Export wrapper with same props
export default function HeavyComponentDynamic(
  props: ComponentProps<typeof HeavyComponentLazy>
) {
  return <HeavyComponentLazy {...props} />;
}
```

**Usage in page**:

```typescript
// ❌ BAD - Eager import
import { HeavyComponent } from '@/components/heavy/HeavyComponent';

// ✅ GOOD - Dynamic import
import HeavyComponentDynamic from '@/components/heavy/HeavyComponentDynamic';

export default function Page() {
  return <HeavyComponentDynamic data={data} />;
}
```

---

## 📦 Real-World Examples from Codebase

### Example 1: Email Service (94% reduction)

```typescript
// src/lib/email/email-service-lazy.ts
// Before: 228 KB route
// After:  13 KB route
// Savings: 215 KB (94%)

import { sendEmailLazy } from "@/lib/email/email-service-lazy";

await sendEmailLazy({
  to: "user@example.com",
  subject: "Welcome",
  html: "<h1>Welcome!</h1>",
});
```

### Example 2: Tracing (86% reduction)

```typescript
// src/lib/tracing/lazy-tracer.ts
// Before: ~60 KB route
// After:  8.6 KB route
// Savings: ~51 KB (86%)

import { traceIfEnabled } from "@/lib/tracing/lazy-tracer";

await traceIfEnabled("OPERATION_NAME", { key: "value" }, async () => {
  // Your operation
  return result;
});
```

### Example 3: Redis Client (90% reduction)

```typescript
// src/lib/cache/redis-client-lazy.ts
// Before: 150 KB route
// After:  14.8 KB route
// Savings: 135 KB (90%)

import { redisClientLazy } from "@/lib/cache/redis-client-lazy";

await redisClientLazy.set("key", "value", 3600);
const value = await redisClientLazy.get("key");
```

---

## 🔍 How to Identify Optimization Candidates

### Step 1: Build with Analyzer

```bash
npm run build:analyze
# Opens .next/analyze/nodejs.html in browser
```

### Step 2: Look for Large Routes

```bash
# Find routes larger than 50 KB
find .next/server/app/api -name "route.js" -type f | \
  xargs du -b | \
  awk '$1 > 51200 {printf "%8d bytes (%5.1f KB) %s\n", $1, $1/1024, $2}' | \
  sort -rn
```

### Step 3: Check Dependencies

```bash
# List dependency sizes
npm ls --depth=0
# Or check specific package
npm info <package-name> dist.unpackedSize
```

### Step 4: Identify Heavy Imports

Look in the large route file for imports from:

- `nodemailer` (~80 KB)
- `ioredis` (~100 KB)
- `@opentelemetry/*` (~50 KB)
- `stripe` (~200 KB)
- `aws-sdk` (~100+ KB)
- Image processing libraries (~50-200 KB)

---

## ✅ Checklist for Adding Lazy Wrapper

- [ ] Check dependency size (>50 KB?)
- [ ] Create `*-lazy.ts` file next to original
- [ ] Define interface matching original service
- [ ] Implement fallback (if service is optional)
- [ ] Create lazy loading function
- [ ] Export wrapper with same interface
- [ ] Update routes to use lazy version
- [ ] Test functionality (ensure no regressions)
- [ ] Build and measure bundle size
- [ ] Document savings in code comments
- [ ] Update team documentation

---

## 🚫 Common Mistakes to Avoid

### Mistake 1: Not providing fallback

```typescript
// ❌ BAD - No fallback, breaks when disabled
async function getService() {
  const { service } = await import("./service");
  return service;
}

// ✅ GOOD - Graceful fallback
async function getService() {
  if (!isEnabled()) {
    return mockService;
  }
  const { service } = await import("./service");
  return service;
}
```

### Mistake 2: Not caching loaded module

```typescript
// ❌ BAD - Re-imports every time (slow)
export const serviceLazy = {
  async doSomething() {
    const { service } = await import("./service");
    return service.doSomething();
  },
};

// ✅ GOOD - Caches after first load
let cached = null;
export const serviceLazy = {
  async doSomething() {
    if (!cached) {
      const { service } = await import("./service");
      cached = service;
    }
    return cached.doSomething();
  },
};
```

### Mistake 3: Not handling errors

```typescript
// ❌ BAD - No error handling
const { service } = await import("./service");

// ✅ GOOD - Graceful error handling
try {
  const { service } = await import("./service");
  return service;
} catch (error) {
  console.warn("Failed to load service:", error);
  return fallbackService;
}
```

---

## 📊 Expected Results

| Dependency Type         | Bundle Size | Expected Savings |
| ----------------------- | ----------- | ---------------- |
| Email (nodemailer)      | ~80 KB      | 85-95%           |
| Redis (ioredis)         | ~100 KB     | 90-95%           |
| Tracing (OpenTelemetry) | ~50 KB      | 80-90%           |
| Payment (Stripe)        | ~200 KB     | 90-95%           |
| AWS SDK                 | ~100+ KB    | 90-95%           |
| Image processing        | ~50-200 KB  | 85-95%           |

**Average reduction**: 85-95% on routes using lazy-loaded dependencies

---

## 🎯 Success Criteria

A lazy-loading implementation is successful when:

- ✅ Route bundle size reduced by >80%
- ✅ All tests still passing
- ✅ Zero behavior changes for users
- ✅ TypeScript errors: 0
- ✅ Fallback works when service disabled
- ✅ Same interface as original
- ✅ Documentation updated

---

## 🔗 Related Documentation

- `OPTIMIZATION_VICTORY_SUMMARY.md` - Overall Phase 5 results
- `PHASE_5_REDIS_OPTIMIZATION_COMPLETE.md` - Redis lazy-loading details
- `PHASE_5_CONTINUATION_RESULTS.md` - Tracing optimization
- `.cursorrules` - Development standards

---

## 💬 Need Help?

### Questions to Ask

1. Is this dependency >50 KB?
2. Is this dependency optional or feature-flagged?
3. Does this dependency have a lightweight fallback?
4. Will lazy-loading break any tests?
5. What's the expected bundle savings?

### Reference Implementations

Look at these files for examples:

- `src/lib/email/email-service-lazy.ts` - Email pattern
- `src/lib/tracing/lazy-tracer.ts` - Tracing pattern
- `src/lib/cache/redis-client-lazy.ts` - Redis pattern

### Copy-Paste Starting Point

Use any of the lazy wrapper files as a template and adapt.

---

**Last Updated**: January 2025  
**Status**: ✅ Production-Ready Patterns  
**Success Rate**: 85-95% bundle reductions achieved

🌾⚡ _"Lazy load heavy, ship light, scale right."_ 🌾⚡
