# 🚀 Phase 5: Server Bundle Optimization Plan

**Current Status**: Server bundle is 871 KB (target: <700 KB)  
**Reduction Required**: ~171 KB (20% reduction)  
**Build Date**: November 24, 2025

---

## 📊 Bundle Analysis Results

### Current Bundle Sizes

- **Client Bundle**: 419 KB ✅ (within target)
- **Server Bundle**: 871 KB ❌ (exceeds 700 KB target by 171 KB)
- **Edge Bundle**: 269 KB ✅ (within target)

### Largest Server Files Identified

| File                           | Size   | Issue                              | Priority    |
| ------------------------------ | ------ | ---------------------------------- | ----------- |
| `chunks/1295.js`               | 357 KB | Shared dependencies bundle         | 🔴 Critical |
| `middleware.js`                | 258 KB | Next.js generated middleware       | 🔴 Critical |
| `admin/farms/page.js`          | 250 KB | Heavy admin page with all deps     | 🔴 Critical |
| `api/admin/approvals/route.js` | 228 KB | Email service (nodemailer) bundled | 🟡 High     |
| `chunks/6745.js`               | 169 KB | Unknown shared chunk               | 🟡 High     |
| `api/farms/route.js`           | 151 KB | OpenTelemetry tracing overhead     | 🟡 High     |
| `chunks/134.js`                | 149 KB | Unknown shared chunk               | 🟢 Medium   |

---

## 🎯 Optimization Strategy

### Phase 5A: Quick Wins (Target: 100-150 KB reduction)

#### 1. Dynamic Import Heavy Libraries in API Routes

**Problem**: Email service (`nodemailer`) is being bundled in every API route that imports it.

**Files to Fix**:

- `src/lib/email/email-service.ts` - Refactor to use dynamic imports
- `src/app/api/admin/approvals/route.ts` - Lazy load email service

**Pattern**:

```typescript
// ❌ BEFORE - Bundled at build time
import { emailService } from "@/lib/email/email-service";

// ✅ AFTER - Loaded on demand
const sendEmail = async (options) => {
  const { emailService } = await import("@/lib/email/email-service");
  return emailService.sendEmail(options);
};
```

**Expected Savings**: ~80-100 KB

---

#### 2. Lazy Load OpenTelemetry in Non-Critical Routes

**Problem**: Every traced API route bundles full OpenTelemetry SDK.

**Files to Fix**:

- `src/lib/tracing/agricultural-tracer.ts` - Add lazy loading wrapper
- `src/app/api/farms/route.ts` - Use conditional tracing
- `src/app/api/products/route.ts` - Use conditional tracing

**Pattern**:

```typescript
// ❌ BEFORE - Always bundled
import { trace } from "@opentelemetry/api";
import { traceAgriculturalOperation } from "@/lib/tracing/agricultural-tracer";

// ✅ AFTER - Lazy loaded for traced operations
async function withOptionalTracing<T>(
  operation: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (process.env.ENABLE_TRACING !== "true") {
    return fn(); // Skip tracing overhead
  }

  const { traceAgriculturalOperation } = await import(
    "@/lib/tracing/agricultural-tracer"
  );
  return traceAgriculturalOperation(operation, {}, fn);
}
```

**Expected Savings**: ~40-60 KB

---

#### 3. Optimize Admin Pages with Dynamic Components

**Problem**: Admin pages bundle all UI components even if user never visits.

**Files to Fix**:

- `src/app/(admin)/admin/farms/page.tsx` - Extract heavy tables to dynamic components
- `src/app/(admin)/admin/settings/page.tsx` - Lazy load settings forms

**Pattern**:

```typescript
// ✅ Create dynamic wrapper
// src/components/admin/FarmsTableDynamic.tsx
import dynamic from 'next/dynamic';

export const FarmsTableDynamic = dynamic(
  () => import('./FarmsTable').then(mod => ({ default: mod.FarmsTable })),
  {
    loading: () => <TableSkeleton />,
    ssr: false // Admin pages don't need SSR
  }
);

// Use in page
import { FarmsTableDynamic } from '@/components/admin/FarmsTableDynamic';

export default async function AdminFarmsPage() {
  const farms = await getFarms();
  return <FarmsTableDynamic farms={farms} />;
}
```

**Expected Savings**: ~30-40 KB

---

### Phase 5B: Advanced Optimizations (Target: 50-80 KB reduction)

#### 4. Code Splitting for Validation Libraries

**Problem**: Zod and validation schemas bundled in every API route.

**Solution**: Create lazy validation wrapper

**Pattern**:

```typescript
// src/lib/validation/lazy-validator.ts
export async function validateWithSchema<T>(
  schemaName: string,
  data: unknown,
): Promise<T> {
  const schemas = await import(`./schemas/${schemaName}`);
  return schemas.default.parse(data);
}
```

**Expected Savings**: ~20-30 KB

---

#### 5. Defer Non-Critical Middleware

**Problem**: Middleware.js is 258 KB and includes everything.

**Solution**: Extract rate limiting and auth to edge functions

**Files to Create**:

- `src/middleware-edge.ts` - Minimal edge middleware
- `src/lib/middleware/lazy-rate-limiter.ts` - Dynamic rate limiter

**Pattern**:

```typescript
// middleware-edge.ts - Minimal routing only
export function middleware(request: NextRequest) {
  // Only critical path checks here
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Defer rate limiting to API route level
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
```

**Expected Savings**: ~40-50 KB

---

#### 6. Remove Unused Dependencies from Server Chunks

**Action Items**:

- [ ] Analyze `chunks/1295.js` to identify unused exports
- [ ] Use `next-unused` to find dead code
- [ ] Tree-shake unused Prisma client methods

**Commands**:

```bash
# Find unused exports
npx next-unused

# Analyze bundle composition
npx webpack-bundle-analyzer .next/server/chunks-analysis.json
```

**Expected Savings**: ~20-40 KB

---

## 📋 Implementation Checklist

### Priority 1: Critical (Do First)

- [ ] **Task 1.1**: Refactor email service to use dynamic imports
  - File: `src/lib/email/email-service-lazy.ts`
  - Update: `src/app/api/admin/approvals/route.ts`
  - Test: Email sending still works
  - Expected: -80 KB

- [ ] **Task 1.2**: Create lazy OpenTelemetry wrapper
  - File: `src/lib/tracing/lazy-tracer.ts`
  - Update: All API routes using tracing
  - Test: Tracing works when enabled
  - Expected: -50 KB

- [ ] **Task 1.3**: Dynamic admin table components
  - File: `src/components/admin/FarmsTableDynamic.tsx`
  - Update: `src/app/(admin)/admin/farms/page.tsx`
  - Test: Admin UI loads correctly
  - Expected: -35 KB

**Subtotal Phase 1**: -165 KB (Target achieved! ✅)

### Priority 2: Polish (Nice to Have)

- [ ] **Task 2.1**: Lazy validation schemas
  - Expected: -25 KB

- [ ] **Task 2.2**: Optimize middleware
  - Expected: -45 KB

- [ ] **Task 2.3**: Tree-shake dead code
  - Expected: -30 KB

**Total Possible Savings**: -265 KB (871 KB → 606 KB)

---

## 🛠️ Implementation Scripts

### Script 1: Create Lazy Email Service

```typescript
// src/lib/email/email-service-lazy.ts
export async function sendEmailLazy(options: EmailOptions) {
  const { emailService } = await import("./email-service");
  return emailService.sendEmail(options);
}

export async function sendFarmerWelcomeEmailLazy(data: FarmerWelcomeData) {
  const { emailService } = await import("./email-service");
  return emailService.sendFarmerWelcomeEmail(data);
}
```

### Script 2: Create Lazy Tracer

```typescript
// src/lib/tracing/lazy-tracer.ts
export async function traceIfEnabled<T>(
  operation: string,
  attributes: Record<string, any>,
  fn: () => Promise<T>,
): Promise<T> {
  // Skip tracing in production to reduce bundle
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.ENABLE_PRODUCTION_TRACING
  ) {
    return fn();
  }

  // Lazy load tracing only when needed
  const { traceAgriculturalOperation } = await import("./agricultural-tracer");
  return traceAgriculturalOperation(operation, attributes, fn);
}
```

### Script 3: Bundle Analysis Command

```bash
# Run after each optimization
npm run build:analyze
echo "Server bundle size:"
du -sh .next/server
echo "Target: <700 KB"
```

---

## 📈 Success Metrics

### Bundle Size Targets

- [x] Client: <500 KB (Current: 419 KB ✅)
- [ ] Server: <700 KB (Current: 871 KB ❌ → Target: 600-650 KB ✅)
- [x] Edge: <300 KB (Current: 269 KB ✅)

### Performance Targets

- API route cold start: <200ms
- Admin page load: <1s
- Email sending: <500ms
- Database queries: <100ms

### Code Quality

- TypeScript: 0 errors ✅
- Test coverage: >98% ✅
- Build time: <30s ✅
- Zero vulnerabilities ✅

---

## 🚀 Next Steps

1. **Immediate Action**: Implement Priority 1 tasks (email + tracing + admin tables)
2. **Validate**: Run `npm run build:analyze` after each change
3. **Test**: Ensure all features still work with lazy loading
4. **Document**: Update this file with actual savings achieved
5. **Monitor**: Add bundle size CI check to prevent regressions

---

## 📝 Notes

### Why These Optimizations Work

1. **Dynamic Imports**: Defers loading until code execution (not build time)
2. **Lazy Services**: Heavy libraries only loaded when actually used
3. **Code Splitting**: Webpack separates chunks by route boundaries
4. **Tree Shaking**: Removes unused code paths from bundles

### Trade-offs

- **Slight Runtime Overhead**: First call to lazy-loaded function is slower (~10-50ms)
- **Complexity**: More files and indirection in codebase
- **Testing**: Need to ensure lazy loading doesn't break functionality

### When to Avoid Dynamic Imports

- ❌ Core authentication logic (security critical)
- ❌ Database connection (needed everywhere)
- ❌ Error handling utilities (needed for reliability)
- ✅ Email services (used infrequently)
- ✅ Heavy telemetry (optional feature)
- ✅ Admin-only UI components (small user base)

---

**Last Updated**: November 24, 2025  
**Status**: Ready for Implementation  
**Estimated Time**: 2-3 hours for Priority 1 tasks  
**Confidence**: High (proven patterns from Next.js docs)
