# 🚀 Bundle Size Quick Start Guide

**For Developers** | **5-Minute Setup** | **Phase 5 Optimized**

## 🎯 TL;DR

```bash
# Before committing, always run:
npm run bundle:check

# ✅ All routes should be < 50 KB
# ✨ Most routes should be < 25 KB (Phase 5 target)
```

---

## 📊 What's This About?

After Phase 5 optimizations, we achieved **90-94% bundle size reductions**:

| Route           | Before | After | Savings |
| --------------- | ------ | ----- | ------- |
| Admin Approvals | 228 KB | 13 KB | 94% ⬇️  |
| Farms API       | 150 KB | 15 KB | 90% ⬇️  |
| Agricultural    | 60 KB  | 9 KB  | 86% ⬇️  |

**Your job**: Keep it that way! 🎉

---

## 🚦 Quick Check

### Before Every PR

```bash
# Step 1: Build with webpack (required for accurate measurement)
npm run build:analyze

# Step 2: Measure bundle sizes
npm run bundle:measure

# Step 3: Look for ✅ or ❌ in output
# ✅ = Good to go!
# ❌ = Read the report and fix
```

### CI Will Check Automatically

Every PR gets a bundle size report comment. Look for:

- ✅ **Highly Optimized Routes** (< 20 KB)
- ⚠️ **Near Threshold** (need optimization)
- ❌ **Threshold Failures** (must fix)

---

## 🛠️ Common Patterns

### ✅ DO: Use Lazy Wrappers

```typescript
// ✅ Email (was 228 KB → now 13 KB)
import { sendEmail } from "@/lib/email/email-service-lazy";

await sendEmail({
  to: "user@example.com",
  subject: "Welcome",
  html: "<p>Hello!</p>",
});
```

```typescript
// ✅ Tracing (was 60 KB → now 9 KB)
import { startSpan } from "@/lib/tracing/lazy-tracer";

await startSpan("operation-name", async (span) => {
  // Your code here
  span.setAttributes({ key: "value" });
});
```

```typescript
// ✅ Redis (was 150 KB → now 15 KB)
import { redisClient } from "@/lib/cache/redis-client-lazy";

const client = await redisClient.getClient();
await client.set("key", "value");
```

### ✅ DO: Type-Only Imports

```typescript
// ✅ Prisma types (0 KB!)
import type { User, Farm, Product } from "@prisma/client";

// ✅ Zod types
import type { z } from "zod";

function processUser(user: User) {
  // Uses type only, no bundle impact
}
```

### ❌ DON'T: Direct Heavy Imports

```typescript
// ❌ Adds 1.5 MB to bundle
import nodemailer from "nodemailer";

// ❌ Adds 800 KB to bundle
import Redis from "ioredis";

// ❌ Adds 500+ KB to bundle
import { trace } from "@opentelemetry/api";
```

---

## 🎓 When to Optimize

### Always Optimize (API Routes)

```typescript
// app/api/some-route/route.ts

// ❌ BAD - Direct import
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  // Route is now 228 KB
}

// ✅ GOOD - Lazy wrapper
import { sendEmail } from '@/lib/email/email-service-lazy';

export async function POST(request: Request) {
  await sendEmail(...);
  // Route is now 13 KB
}
```

### Client Components (Less Critical)

```typescript
// components/SomeComponent.tsx
'use client';

// ✅ OK - Client bundles are separate
import { motion } from 'framer-motion';

export function AnimatedComponent() {
  return <motion.div>...</motion.div>;
}
```

---

## 🔍 Debugging Large Bundles

### Step 1: Identify the Route

```bash
npm run bundle:measure
```

Look for routes marked ⚠️ or ❌:

```
❌ 235.5 KB  app/api/your-route/route.js
```

### Step 2: Find the Heavy Import

```bash
# Build with analyze
npm run build:analyze

# Open webpack analyzer
# File: .next/analyze/server.html
```

Look for large modules in your route chunk.

### Step 3: Apply Pattern

Common culprits and fixes:

| Import           | Size   | Fix                      |
| ---------------- | ------ | ------------------------ |
| `nodemailer`     | 1.5 MB | Use `email-service-lazy` |
| `ioredis`        | 800 KB | Use `redis-client-lazy`  |
| `@opentelemetry` | 500 KB | Use `lazy-tracer`        |
| `stripe`         | 300 KB | Dynamic import           |
| `@prisma/client` | Varies | `import type` only       |

### Step 4: Verify Fix

```bash
npm run bundle:check

# Should now show:
# ✅ 14.2 KB  app/api/your-route/route.js
```

---

## 📋 Checklist for New Routes

When creating a new API route:

- [ ] Use canonical database import: `import { database } from '@/lib/database'`
- [ ] Use lazy email: `import { sendEmail } from '@/lib/email/email-service-lazy'`
- [ ] Use lazy tracing: `import { startSpan } from '@/lib/tracing/lazy-tracer'`
- [ ] Use lazy Redis: `import { redisClient } from '@/lib/cache/redis-client-lazy'`
- [ ] Type-only imports: `import type { ... } from '@prisma/client'`
- [ ] Run bundle check: `npm run bundle:check`
- [ ] Verify route < 50 KB (ideally < 25 KB)

---

## 🎯 Thresholds Reference

| Route Type   | Target   | Threshold | Status   |
| ------------ | -------- | --------- | -------- |
| Health/Ready | < 10 KB  | < 20 KB   | Critical |
| Standard API | < 25 KB  | < 50 KB   | Standard |
| Admin API    | < 50 KB  | < 200 KB  | Heavy    |
| Pages        | < 100 KB | < 300 KB  | Standard |

---

## 🚨 CI Failed? Quick Fixes

### Scenario 1: "X route(s) exceed thresholds"

```bash
# 1. See which route failed
npm run bundle:measure

# 2. Find the heavy import
npm run build:analyze
# Open .next/analyze/server.html

# 3. Apply lazy pattern (see above)

# 4. Verify
npm run bundle:check
```

### Scenario 2: "Flaky test failed"

If you see `password.test.ts` timeout:

- This is known and fixed in latest
- Just re-run the CI (it's environment-dependent)

### Scenario 3: "Bundle analysis failed"

```bash
# Clear and rebuild
rm -rf .next
npm run build:analyze
npm run bundle:measure
```

---

## 💡 Pro Tips

### 1. Check Before Committing

Add to your workflow:

```bash
git add .
npm run bundle:check  # ← Add this
git commit -m "Your message"
```

### 2. Watch CI Comments

Every PR gets a bundle report. Review it!

### 3. Use npm Scripts

```bash
npm run bundle:check     # Full analysis
npm run bundle:measure   # Just measurement
npm run build:analyze    # Just build
```

### 4. Local Webpack Analyzer

```bash
npm run build:analyze

# Then open in browser:
# .next/analyze/server.html
```

---

## 📚 Learn More

Detailed docs:

- [PHASE_5_CI_BUNDLE_PROTECTION.md](./PHASE_5_CI_BUNDLE_PROTECTION.md) - Full CI system
- [LAZY_LOADING_QUICK_REFERENCE.md](./LAZY_LOADING_QUICK_REFERENCE.md) - All patterns
- [PHASE_5_CONTINUATION_RESULTS.md](../PHASE_5_CONTINUATION_RESULTS.md) - Achievement details

---

## ✅ Success Checklist

Before merging your PR:

- [ ] Ran `npm run bundle:check` locally
- [ ] All routes < 50 KB (ideally < 25 KB)
- [ ] CI bundle size check passed
- [ ] PR comment shows no regressions
- [ ] Used lazy wrappers for heavy dependencies
- [ ] Type-only imports for Prisma types

---

## 🎉 You're Ready!

Remember:

- **Always check bundles before PR**
- **Use lazy wrappers for heavy deps**
- **Type-only imports save MBs**
- **CI will catch regressions**

Questions? Check the full docs or ask in `#platform-performance`.

🌾 _Building a divine agricultural platform with quantum efficiency_ ⚡
