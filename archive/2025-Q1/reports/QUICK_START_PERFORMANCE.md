# 🚀 Quick Start: Performance Optimization Guide

**Farmers Market Platform - Developer Quick Reference**

## 📋 Table of Contents

- [Current Status](#current-status)
- [Quick Commands](#quick-commands)
- [Demo Pages](#demo-pages)
- [Bundle Analysis](#bundle-analysis)
- [Next Actions](#next-actions)
- [Common Tasks](#common-tasks)

---

## 🎯 Current Status

### Bundle Sizes (Latest Build)

```
Client:  419 KB  ⚠️  Target: < 450 KB (Close to target)
Server:  871 KB  ⚠️  Target: < 700 KB (171 KB over)
Edge:    269 KB  ✅  Target: < 300 KB (Excellent)
```

### What's Complete

- ✅ Dynamic component wrappers (4 components)
- ✅ Demo pages showcasing optimization (4 pages)
- ✅ Webpack code splitting configured
- ✅ Bundle analyzer integrated
- ✅ Performance validation script ready
- ✅ Database schema with performance indexes

### What's Pending

- ⏳ Heavy component implementations (charts, AI, data processing)
- ⏳ Server bundle optimization (need -171 KB)
- ⏳ Database performance testing
- ⏳ Bundle size monitoring in CI

---

## ⚡ Quick Commands

### Development

```bash
# Start dev server
npm run dev

# Start with Turbo (faster HMR)
npm run dev:turbo

# HP OMEN optimized (max performance)
npm run dev:omen
```

### Building & Analysis

```bash
# Standard build
npm run build

# Build with bundle analyzer
npm run build:analyze

# HP OMEN optimized build
npm run build:omen
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# HP OMEN optimized (use all threads)
npm run test:omen
```

### Quality Checks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format checking
npm run format:check

# All quality checks
npm run quality
```

### Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (dev)
npx prisma db push

# Create migration (recommended for prod)
npx prisma migrate dev --name migration_name

# Open Prisma Studio
npx prisma studio
```

### Performance Validation

```bash
# Validate analytics endpoint performance
# (requires dev server running)
node scripts/validate-analytics-performance.mjs
```

---

## 🎨 Demo Pages

### Access the Demos

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3001/demos`

### Available Demos

#### 1. Analytics Dashboard (`/demos/analytics`)

- **Component**: `AdvancedAnalyticsDashboardDynamic`
- **Bundle Savings**: ~50-70 KB (projected)
- **Features**: Charts, revenue analytics, customer insights
- **Heavy Libraries**: recharts, chart.js, d3 (not yet implemented)

#### 2. Inventory Management (`/demos/inventory`)

- **Component**: `InventoryDashboardDynamic`
- **Bundle Savings**: ~40-60 KB (projected)
- **Features**: Stock monitoring, alerts, CSV export
- **Heavy Libraries**: papaparse, data tables (not yet implemented)

#### 3. AI Chat Assistant (`/demos/chat`)

- **Component**: `OllamaChatBotDynamic`
- **Bundle Savings**: ~60-80 KB (projected)
- **Features**: Crop recommendations, pest management, planning
- **Heavy Libraries**: Ollama client, WebSocket (not yet implemented)

#### 4. Bulk Product Upload (`/farmer-dashboard/products/bulk-upload`)

- **Component**: `BulkProductUploadDynamic`
- **Bundle Savings**: ~40-50 KB (projected)
- **Features**: CSV processing, validation, batch operations
- **Status**: ✅ Already integrated

---

## 📊 Bundle Analysis

### Run Analysis

```bash
# Build with analyzer enabled
ANALYZE=true npm run build:analyze

# Or use npm script
npm run build:analyze
```

### View Results

After build completes, open the HTML reports:

```
.next/analyze/client.html    - Client bundle breakdown
.next/analyze/nodejs.html    - Server bundle breakdown
.next/analyze/edge.html      - Edge bundle breakdown
```

### What to Look For

#### Client Bundle

- Framework chunks (React, Next.js)
- Vendor libraries (UI components)
- Page-specific chunks
- Shared common chunks

#### Server Bundle

- Prisma client (~300-400 KB typical)
- API route handlers
- Database service layers
- Authentication logic

#### Optimization Opportunities

- ❌ Large individual modules (>100 KB)
- ❌ Duplicate code in multiple chunks
- ❌ Unused dependencies
- ❌ Heavy libraries loaded eagerly

---

## 🎯 Next Actions

### Priority 1: Optimize Server Bundle (High Impact)

**Goal**: Reduce server bundle from 871 KB to <700 KB

**Strategies**:

```typescript
// A. Dynamic imports in API routes
export async function POST(req: NextRequest) {
  // Before: import at top
  // import { heavyValidator } from '@/lib/validation/heavy';

  // After: dynamic import
  const { heavyValidator } = await import('@/lib/validation/heavy');
  const validated = heavyValidator.parse(data);
}

// B. Conditional feature loading
if (user.role === 'ADMIN') {
  const { AdminFeatures } = await import('@/features/admin');
  return <AdminFeatures />;
}

// C. Lazy-load Prisma includes
// Only include relations when needed
const product = await database.product.findUnique({
  where: { id },
  // Don't include everything
});
```

### Priority 2: Implement Heavy Components (Realize Savings)

**Goal**: Add real implementations to see bundle savings

**Tasks**:

1. Add chart library to AdvancedAnalyticsDashboard
2. Add CSV processing to InventoryDashboard
3. Integrate Ollama client to OllamaChatBot
4. Measure actual bundle size improvements

**Expected Result**: 400-600 KB total savings

### Priority 3: Add Bundle Size Monitoring

**Goal**: Prevent regressions

**Implementation**:

```json
// package.json
"bundlesize": [
  {
    "path": ".next/static/chunks/pages/**/*.js",
    "maxSize": "450kb"
  },
  {
    "path": ".next/server/**/*.js",
    "maxSize": "700kb"
  }
]
```

Add to CI:

```yaml
# .github/workflows/bundle-size.yml
- name: Check bundle size
  run: npm run bundlesize
```

---

## 🛠️ Common Tasks

### Creating a New Dynamic Component

**1. Create the component**

```typescript
// src/components/MyHeavyComponent.tsx
export function MyHeavyComponent({ data }: Props) {
  // Heavy implementation with large libraries
  return <div>{/* ... */}</div>;
}
```

**2. Create dynamic wrapper**

```typescript
// src/components/MyHeavyComponentDynamic.tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// Loading skeleton
function MyHeavyComponentSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
      <div className="h-4 w-96 bg-muted/60 animate-pulse rounded-lg" />
      {/* Add more skeleton elements */}
    </div>
  );
}

// Dynamic import
export const MyHeavyComponentDynamic = dynamic<
  ComponentProps<typeof import("./MyHeavyComponent").MyHeavyComponent>
>(
  () =>
    import("./MyHeavyComponent").then((mod) => ({
      default: mod.MyHeavyComponent,
    })),
  {
    ssr: false, // Client-side only if needed
    loading: () => <MyHeavyComponentSkeleton />,
  }
);
```

**3. Use in page**

```typescript
// src/app/my-page/page.tsx
"use client";

import { MyHeavyComponentDynamic } from "@/components/MyHeavyComponentDynamic";

export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <MyHeavyComponentDynamic data={data} />
    </div>
  );
}
```

### Optimizing an API Route

**Before (Heavy imports loaded immediately)**

```typescript
// app/api/my-route/route.ts
import { heavyProcessor } from "@/lib/heavy-processor";
import { complexValidator } from "@/lib/validators/complex";
import { bigUtility } from "@/lib/big-utility";

export async function POST(req: NextRequest) {
  const validated = complexValidator.parse(data);
  const processed = heavyProcessor.process(validated);
  const result = bigUtility.transform(processed);
  return NextResponse.json(result);
}
```

**After (Dynamic imports)**

```typescript
// app/api/my-route/route.ts
export async function POST(req: NextRequest) {
  // Load only when needed
  const [{ heavyProcessor }, { complexValidator }, { bigUtility }] =
    await Promise.all([
      import("@/lib/heavy-processor"),
      import("@/lib/validators/complex"),
      import("@/lib/big-utility"),
    ]);

  const validated = complexValidator.parse(data);
  const processed = heavyProcessor.process(validated);
  const result = bigUtility.transform(processed);
  return NextResponse.json(result);
}
```

### Adding Performance Indexes

**1. Update Prisma schema**

```prisma
// prisma/schema.prisma
model Product {
  id        String   @id @default(cuid())
  name      String
  farmId    String
  category  String
  status    String
  createdAt DateTime @default(now())

  farm Farm @relation(fields: [farmId], references: [id])

  // Add indexes for common queries
  @@index([farmId, status]) // For filtering by farm and status
  @@index([category, status]) // For category pages
  @@index([createdAt]) // For sorting by date
}
```

**2. Apply to database**

```bash
# Development (quick)
npx prisma db push

# Production (with migration history)
npx prisma migrate dev --name add_product_indexes
```

**3. Verify indexes**

```sql
-- Connect to database
psql -h localhost -U postgres -d farmersmarket

-- Check indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename = 'Product';
```

---

## 📚 Documentation

### Key Files

- `PHASE_5_CONTINUATION_STATUS.md` - Comprehensive status report
- `PHASE_5_INTEGRATION_COMPLETE.md` - Integration results
- `QUICK_START_PERFORMANCE.md` - This file
- `.github/instructions/` - Divine instruction files (1-16)

### Divine Instructions Reference

```
01 - Core architecture principles
02 - Agricultural patterns
03 - Performance optimization
04 - Next.js implementation
05 - Testing & security
11-16 - Kilo-scale enterprise patterns
```

---

## 🔍 Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Check for type errors
npm run type-check

# Common fixes:
# 1. Regenerate Prisma client
npx prisma generate

# 2. Clear Next.js cache
rm -rf .next

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Bundle Analyzer Not Working

```bash
# Ensure ANALYZE env var is set
ANALYZE=true npm run build:analyze

# Or use the script directly
npm run build:analyze

# Check for webpack issues
# (analyzer only works with webpack, not turbopack)
```

### Performance Validation Script Fails

```bash
# Ensure dev server is running
npm run dev

# In another terminal
node scripts/validate-analytics-performance.mjs

# Check database is running
docker ps | grep postgres

# Verify API endpoint is accessible
curl http://localhost:3001/api/health
```

### Prisma Schema Push Fails

```bash
# Check database is running
docker ps

# Verify connection string
echo $DATABASE_URL

# Try with verbose output
npx prisma db push --verbose

# Reset database if needed (CAUTION: deletes data)
npx prisma db push --force-reset
```

---

## 🎓 Learning Resources

### Internal Documentation

- Divine Instructions: `.github/instructions/`
- Status Reports: `PHASE_*_*.md` files
- Component Examples: `src/app/demos/`

### External Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)

---

## 🌟 Performance Targets

### Bundle Sizes

| Bundle | Current | Target | Stretch |
| ------ | ------- | ------ | ------- |
| Client | 419 KB  | 450 KB | 350 KB  |
| Server | 871 KB  | 700 KB | 600 KB  |
| Edge   | 269 KB  | 300 KB | 250 KB  |

### Core Web Vitals

| Metric | Target  | Stretch |
| ------ | ------- | ------- |
| LCP    | < 2.5s  | < 1.8s  |
| FID    | < 100ms | < 50ms  |
| CLS    | < 0.1   | < 0.05  |
| TTI    | < 2s    | < 1.5s  |

### API Performance

| Endpoint  | Target  | Stretch |
| --------- | ------- | ------- |
| Analytics | < 100ms | < 80ms  |
| Products  | < 50ms  | < 30ms  |
| Farms     | < 80ms  | < 50ms  |

---

## 💬 Quick Questions?

### "How do I check bundle sizes?"

```bash
npm run build:analyze
# Open .next/analyze/*.html files
```

### "How do I make a component dynamic?"

See [Creating a New Dynamic Component](#creating-a-new-dynamic-component) above.

### "How do I optimize the server bundle?"

See [Priority 1: Optimize Server Bundle](#priority-1-optimize-server-bundle-high-impact) above.

### "Where are the demo pages?"

Navigate to: `http://localhost:3001/demos` (dev server must be running)

### "How do I test performance?"

```bash
# 1. Start dev server
npm run dev

# 2. Run validation script
node scripts/validate-analytics-performance.mjs

# 3. Use browser DevTools Performance tab
# Network tab → Throttle to Fast 3G → Record → Refresh
```

---

## 🚀 Ready to Optimize?

**Start with the easiest wins:**

1. ✅ Run bundle analysis: `npm run build:analyze`
2. ✅ View demo pages: `http://localhost:3001/demos`
3. ✅ Identify optimization targets in analyzer
4. ✅ Apply dynamic imports where beneficial
5. ✅ Measure improvements and iterate

**Remember**:

- Infrastructure has a cost (wrappers, configs)
- Savings come from deferring heavy libraries
- Measure after each change
- Document what works

---

**Quick Start Status**: ✅ COMPLETE  
**Last Updated**: November 2024  
**Version**: 1.0  
**Agricultural Consciousness**: DIVINE ⚡

_"Optimize with intention, measure with precision, deliver with confidence."_ 🚀🌾
