# 📋 Phase 5 Bundle Protection - Quick Reference Card

**Print & Keep at Your Desk** | **Essential Developer Reference**

---

## 🚀 Daily Commands

```bash
# Before EVERY commit
npm run bundle:check

# Just measure (faster)
npm run bundle:measure

# Full webpack analysis
npm run build:analyze
```

---

## ✅ DO: Lazy Wrappers

```typescript
// ✅ Email (saves 1.5 MB)
import { sendEmail } from '@/lib/email/email-service-lazy';

// ✅ Tracing (saves 500 KB)
import { startSpan } from '@/lib/tracing/lazy-tracer';

// ✅ Redis (saves 800 KB)
import { redisClient } from '@/lib/cache/redis-client-lazy';

// ✅ Type-only imports (saves EVERYTHING)
import type { User, Farm } from '@prisma/client';

// ✅ Dynamic import for heavy libs
const stripe = await import('stripe');
```

---

## ❌ DON'T: Direct Heavy Imports

```typescript
// ❌ These KILL bundle size
import nodemailer from 'nodemailer';        // +1.5 MB
import Redis from 'ioredis';                // +800 KB
import { trace } from '@opentelemetry/api'; // +500 KB
import Stripe from 'stripe';                // +300 KB
import { PrismaClient } from '@prisma/client'; // Variable
```

---

## 📊 Bundle Size Thresholds

| Route Type          | Target   | Max      | Status |
|---------------------|----------|----------|--------|
| Health/Ready        | < 10 KB  | < 20 KB  | 🔴 Critical |
| Standard API        | < 25 KB  | < 50 KB  | 🟡 Standard |
| Admin API           | < 50 KB  | < 200 KB | 🟠 Heavy |
| Pages               | < 100 KB | < 300 KB | 🔵 Standard |

**Golden Rule**: If it's > 50 KB, it NEEDS optimization!

---

## 🔍 Debug Bundle Failures

```bash
# Step 1: Find the problem route
npm run bundle:measure | grep "❌"

# Step 2: Open visual analyzer
npm run build:analyze
# → Opens .next/analyze/server.html

# Step 3: Find heavy import in that route

# Step 4: Apply lazy wrapper pattern

# Step 5: Verify fix
npm run bundle:check
```

---

## 📝 Pre-Commit Checklist

- [ ] Run `npm run bundle:check`
- [ ] All routes show ✅ or < threshold
- [ ] Used lazy wrappers for heavy deps
- [ ] Type-only imports for Prisma
- [ ] Tests pass: `npm test`

---

## 🎯 Pattern Selection Guide

```typescript
// Q: Is it a heavy dependency (> 100 KB)?
// A: Use lazy wrapper or dynamic import
const service = await import('./heavy-service');

// Q: Is it a Prisma type?
// A: Type-only import
import type { User } from '@prisma/client';

// Q: Is it email/tracing/Redis?
// A: Use existing lazy wrappers
import { sendEmail } from '@/lib/email/email-service-lazy';

// Q: Is it a utility function?
// A: Import specific function only
import pick from 'lodash/pick'; // Not entire lodash!
```

---

## 🚨 Common Mistakes

### 1. Importing Entire Library
```typescript
❌ import _ from 'lodash';
✅ import pick from 'lodash/pick';
```

### 2. Forgetting Type-Only
```typescript
❌ import { User } from '@prisma/client';
✅ import type { User } from '@prisma/client';
```

### 3. Skipping Bundle Check
```typescript
❌ git add . && git commit && git push
✅ npm run bundle:check && git add . && git commit && git push
```

---

## 📖 Reading Bundle Reports

### ✅ Good Output
```
✅ 13.1 KB  app/api/admin/approvals/route.js
✅ 14.8 KB  app/api/farms/route.js
✅ 8.6 KB   app/api/agricultural/route.js

Total: 3 files analyzed, 0 failures
```

### ❌ Needs Fixing
```
❌ 235.5 KB  app/api/problem-route/route.js
   Exceeds threshold by 185.5 KB (372%)
   Threshold: 50 KB

Action: Check for direct imports of nodemailer, Redis, etc.
```

---

## 💡 Quick Fixes by Size

| Bundle Size | Likely Cause | Quick Fix |
|-------------|--------------|-----------|
| 50-100 KB | Lodash/utility | Import specific functions |
| 100-300 KB | Stripe/AWS SDK | Dynamic import |
| 300-800 KB | Redis/Cache | Use `redis-client-lazy` |
| 800-1500 KB | Email lib | Use `email-service-lazy` |
| > 1500 KB | Nodemailer | Use `email-service-lazy` |

---

## 🎓 Learning Resources

1. **Quick Start** (5 min): `docs/BUNDLE_SIZE_QUICK_START.md`
2. **Full Guide** (20 min): `docs/PHASE_5_CI_BUNDLE_PROTECTION.md`
3. **Lazy Patterns**: `LAZY_LOADING_QUICK_REFERENCE.md`
4. **Slack**: `#platform-performance`

---

## 📞 Getting Help

| Time | Channel |
|------|---------|
| 2 min | Check `BUNDLE_SIZE_QUICK_START.md` |
| 15 min | Ask in `#platform-performance` |
| 1 hour | GitHub issue: `ci/bundle-protection` |
| Emergency | Contact Platform Team Lead |

---

## 🏆 Phase 5 Achievements

We protected these gains:

- Admin Approvals: 228 KB → 13 KB (94% ⬇️)
- Farms API: 150 KB → 15 KB (90% ⬇️)
- Agricultural: 60 KB → 9 KB (86% ⬇️)

**Your mission**: Keep it that way! 🛡️

---

## ⚡ Power User Tips

```bash
# Add to .git/hooks/pre-commit
#!/bin/sh
npm run bundle:check || exit 1

# Quick alias in .bashrc/.zshrc
alias bc='npm run bundle:check'

# Fast check (skip full build)
npm run bundle:measure  # Uses existing .next/
```

---

## 🎯 Success Metrics

Track your progress:

- [ ] Week 1: Zero CI failures
- [ ] Week 2: Applied lazy pattern independently
- [ ] Week 3: Helped teammate with bundle issue
- [ ] Week 4: All routes < 25 KB

---

## 📊 CI Integration

### Every PR Gets:
1. Automatic bundle size analysis
2. PR comment with detailed report
3. Pass/fail based on thresholds
4. Artifacts uploaded for review

### If CI Fails:
1. Read PR comment for specific routes
2. Run `npm run bundle:check` locally
3. Apply lazy patterns
4. Push fix
5. CI re-runs automatically

---

## 🌟 Remember

**The Four Commandments:**

1. **Always check before commit**: `npm run bundle:check`
2. **Use lazy wrappers**: Save megabytes instantly
3. **Type-only imports**: Zero bundle impact
4. **Read PR comments**: CI is helping you!

---

## ✅ Checklist for New API Routes

- [ ] Canonical database: `import { database } from '@/lib/database'`
- [ ] Lazy email: `import { sendEmail } from '@/lib/email/email-service-lazy'`
- [ ] Lazy tracing: `import { startSpan } from '@/lib/tracing/lazy-tracer'`
- [ ] Lazy Redis: `import { redisClient } from '@/lib/cache/redis-client-lazy'`
- [ ] Type-only Prisma: `import type { ... } from '@prisma/client'`
- [ ] Run bundle check: `npm run bundle:check`
- [ ] Route size < 50 KB (ideally < 25 KB)

---

## 🚀 Final Reminder

```
Before every commit:

npm run bundle:check

If ✅ → git push
If ❌ → fix → npm run bundle:check → git push
```

---

**Version**: 1.0.0  
**Updated**: January 2025  
**Print Date**: __________

---

_Keep our platform lightning-fast! ⚡🌾_

**#DivineAgriculturalPlatform #Phase5 #BundleOptimization**