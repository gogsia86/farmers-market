# 🚨 URGENT ACTION ITEMS - IMMEDIATE FIXES REQUIRED

**Status:** 🔴 BLOCKING PRODUCTION DEPLOYMENT
**Priority:** CRITICAL
**Estimated Time:** 3-5 days (single developer)
**Last Updated:** January 2025

---

## ⚡ CRITICAL PATH - DO THESE FIRST (Day 1-2)

### 1. Fix Product Schema Type Mismatch 🔴 BREAKING

**Files:**

- `src/app/page.tsx` (lines 242, 245)
- `prisma/schema.prisma`

**Error:**

```
Property 'quantityAvailable' does not exist on type Product
```

**Quick Fix:**

```typescript
// Option A: Update frontend code
- product.quantityAvailable
+ product.stock

// Option B: Add field to Prisma schema
model Product {
  stock              Int      @default(0)
  quantityAvailable  Int?     @default(0)  // Add this
}
// Then run: npx prisma generate && npx prisma db push
```

**Priority:** 🔴 CRITICAL - Homepage crashes without this
**Time:** 30 minutes

---

### 2. Fix Cart Hook Type Errors 🔴 BREAKING

**Files:**

- `src/components/features/cart/cart-badge.tsx:61`
- `src/components/features/cart/mini-cart.tsx:37`
- `src/components/features/cart/cart-badge.tsx:305`

**Error:**

```
Property 'userId' does not exist in type 'UseCartOptions'
```

**Quick Fix:**

```typescript
// WRONG ❌
const { cart } = useCart({ userId: session?.user?.id });

// CORRECT ✅
const { cart } = useCart(); // userId comes from session automatically
```

**Files to Update:**

- Find all `useCart({ userId:` and remove the userId parameter
- Run: `git grep "useCart({ userId" src/` to find all occurrences

**Priority:** 🔴 CRITICAL - Cart is broken
**Time:** 15 minutes

---

### 3. Fix Image Component Type Errors 🟡 HIGH

**Files:**

- `src/components/images/FarmImage.tsx`
- `src/components/images/ProductImage.tsx`

**Error:**

```
Type 'string | undefined' is not assignable to type 'string | StaticImport'
```

**Quick Fix:**

```typescript
// Update prop types
interface ImageProps {
  src: string | null;  // Change from string | undefined
  fallback?: string;
}

// Add fallback in component
<Image
  src={src ?? '/images/placeholder.jpg'}
  alt={alt}
/>
```

**Priority:** 🟡 HIGH - Images fail to load
**Time:** 30 minutes

---

### 4. Disable Broken Testing Framework 🟡 HIGH

**Files:**

- `tsconfig.json`

**Error:**

```
82 errors in src/lib/testing/**/*.ts
```

**Quick Fix (Temporary):**

```json
// tsconfig.json - Add to exclude array
{
  "exclude": [
    // ... existing excludes
    "src/lib/testing/**/*" // Add this line
  ]
}
```

**Long-term Fix:**

- Refactor testing types or switch to standard Playwright
- Not needed for production deployment

**Priority:** 🟡 HIGH - Blocks TypeScript compilation
**Time:** 5 minutes (temporary), 2-3 days (proper fix)

---

## 🛡️ SECURITY FIXES (Day 2)

### 5. Add Environment Variable Validation 🔴 CRITICAL

**Create:** `src/lib/config/env.ts`

```typescript
import { z } from "zod";

const envSchema = z.object({
  // Database (REQUIRED)
  DATABASE_URL: z.string().url(),

  // Auth (REQUIRED)
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Stripe (REQUIRED)
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  // Optional
  SENDGRID_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("❌ Invalid environment variables:", error);
    process.exit(1);
  }
}

export const env = validateEnv();
```

**Update:** `src/lib/database/index.ts`

```typescript
import { env } from "@/lib/config/env";

// Replace all process.env.DATABASE_URL with env.DATABASE_URL
```

**Priority:** 🔴 CRITICAL - Prevents silent production failures
**Time:** 1 hour

---

### 6. Verify Stripe Webhook Security 🔴 CRITICAL

**Check:** `src/app/api/webhooks/stripe/route.ts`

**Must have:**

```typescript
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    // ✅ MUST verify signature (no exceptions!)
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    // Process verified event...
  } catch (err) {
    logger.error("Invalid webhook signature", { error: err });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
```

**Priority:** 🔴 CRITICAL - Security vulnerability if skipped
**Time:** 15 minutes (verification), 1 hour (fix if wrong)

---

## ⚡ PERFORMANCE FIXES (Day 3)

### 7. Fix Database Connection Pool 🔴 CRITICAL

**File:** `src/lib/database/index.ts`

**Current:**

```typescript
const pool = new Pool({
  max: isDevelopment ? 10 : 5, // ❌ Too high for serverless
});
```

**Fix:**

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // ✅ Single connection per serverless function
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});
```

**OR Use Connection Pooler:**

```bash
# Add to .env
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
```

**Priority:** 🔴 CRITICAL - Will crash under load
**Time:** 30 minutes

---

### 8. Add Critical Error Boundaries 🟡 HIGH

**File:** `src/app/(customer)/checkout/layout.tsx`

```typescript
"use client";

import { ErrorBoundary } from 'react-error-boundary';

function CheckoutErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-8 text-center">
      <h2>Checkout Error</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

export default function CheckoutLayout({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={CheckoutErrorFallback}
      onError={(error) => console.error('Checkout error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

**Priority:** 🟡 HIGH - Improves user experience
**Time:** 1 hour (checkout + cart + product lists)

---

## 📋 VERIFICATION CHECKLIST

After completing fixes, verify:

```bash
# 1. TypeScript compiles without errors
npm run type-check
# Expected: 0 errors (down from 93)

# 2. Build succeeds
npm run build
# Expected: Build completes successfully

# 3. Environment variables validated
npm run dev
# Expected: Server starts OR fails fast with clear error

# 4. Critical paths work
# - Homepage loads
# - Can add to cart
# - Can view cart
# - Images display
# - Checkout page loads
```

---

## 🎯 PRIORITY MATRIX

| Issue                  | Priority    | Impact             | Time  | Blocker? |
| ---------------------- | ----------- | ------------------ | ----- | -------- |
| Product schema         | 🔴 CRITICAL | Homepage crash     | 30min | YES      |
| Cart hook              | 🔴 CRITICAL | Cart broken        | 15min | YES      |
| Environment validation | 🔴 CRITICAL | Silent failures    | 1hr   | YES      |
| Stripe webhook         | 🔴 CRITICAL | Security           | 1hr   | YES      |
| DB connection pool     | 🔴 CRITICAL | Crashes under load | 30min | YES      |
| Image types            | 🟡 HIGH     | Images broken      | 30min | NO       |
| Testing framework      | 🟡 HIGH     | Build blocked      | 5min  | YES      |
| Error boundaries       | 🟡 HIGH     | UX degradation     | 1hr   | NO       |

---

## 📊 ESTIMATED TIMELINE

### Minimum Viable Fixes (Can Deploy)

- **Day 1 Morning:** Product schema + Cart hook (45min)
- **Day 1 Afternoon:** Image types + Disable tests (35min)
- **Day 2 Morning:** Environment validation (1hr)
- **Day 2 Afternoon:** DB connection pool (30min)
- **Day 3:** Security audit + Stripe verification (2hr)

**Total: 2-3 days** → Can deploy to production

### Recommended Full Fix

- **Week 1:** All above + Error boundaries
- **Week 2:** Performance optimization + monitoring
- **Week 3:** Testing framework refactor
- **Week 4:** Polish + documentation

**Total: 3-4 weeks** → Production-ready with confidence

---

## 🚀 QUICK START COMMANDS

```bash
# Step 1: Fix TypeScript errors
code src/app/page.tsx  # Fix quantityAvailable
code src/components/features/cart/cart-badge.tsx  # Remove userId
code tsconfig.json  # Exclude testing

# Step 2: Verify fixes
npm run type-check  # Should show fewer errors

# Step 3: Create env validation
mkdir -p src/lib/config
code src/lib/config/env.ts  # Create file with schema

# Step 4: Fix database pool
code src/lib/database/index.ts  # Update pool config

# Step 5: Test build
npm run build

# Step 6: Deploy to staging
vercel deploy  # Test in production-like environment
```

---

## ⚠️ DEPLOYMENT BLOCKERS

**DO NOT DEPLOY UNTIL:**

- [ ] TypeScript compiles with 0 errors
- [ ] `npm run build` succeeds
- [ ] Environment variables validated
- [ ] Database connection pool configured
- [ ] Stripe webhook signature verified
- [ ] Tested on staging environment
- [ ] Critical paths manually verified:
  - [ ] Homepage loads
  - [ ] Can add to cart
  - [ ] Can checkout
  - [ ] Images display
  - [ ] Stripe payment works

---

## 🆘 NEED HELP?

**If stuck on:**

1. **TypeScript errors:**
   - Comment out broken code temporarily
   - Add `// @ts-expect-error` with explanation
   - Fix properly later

2. **Database issues:**
   - Use Supabase connection pooler
   - Or reduce max connections to 1

3. **Build failures:**
   - Check Next.js logs carefully
   - Verify all imports resolve
   - Clear `.next` folder: `rm -rf .next`

4. **Vercel deployment:**
   - Set environment variables in dashboard
   - Check build logs for specific errors
   - Test locally with `vercel dev`

---

## 📞 ESCALATION PATH

1. **Try fixing yourself** (use this guide)
2. **Check error logs** (Vercel logs, browser console)
3. **Search GitHub Issues** (Next.js, Prisma, Stripe)
4. **Ask in Discord** (Next.js, Prisma communities)
5. **Create minimal reproduction** (for bug reports)

---

**Remember:** Fix critical issues first, perfect later.

**Goal:** Get to deployable state in 2-3 days, then iterate.

Good luck! 🚀
