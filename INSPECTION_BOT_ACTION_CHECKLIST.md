# 🚨 INSPECTION BOT - IMMEDIATE ACTION CHECKLIST

**Date**: January 13, 2026  
**Health Score**: 5.1% (CRITICAL)  
**Status**: 🔴 PRODUCTION EMERGENCY

---

## ⚡ EMERGENCY RESPONSE - DO THIS NOW

### 🔥 Step 1: Verify Production Status (5 minutes)

```bash
# Check if site is actually down or just bot issues
curl -I https://farmers-market-platform.vercel.app
curl -I https://farmers-market-platform.vercel.app/marketplace
curl -I https://farmers-market-platform.vercel.app/login

# Check Vercel deployment status
vercel list

# View real-time logs
vercel logs --follow
```

**Expected Output**: Look for 200 status codes vs 500 errors

---

### 🔥 Step 2: Check Recent Deployments (2 minutes)

```bash
# List recent deployments
vercel list --limit 10

# Check if recent deploy broke things
# Compare timestamps with last working version
```

**Action**: If recent deploy is bad, rollback immediately:
```bash
# Rollback to previous deployment
vercel rollback [previous-deployment-url]
```

---

### 🔥 Step 3: Database Connection Test (3 minutes)

```bash
# Test database connection
npm run db:test

# If fails, check environment variables
vercel env ls

# Pull production env vars
vercel env pull .env.production
```

**Check These Variables**:
- [ ] `DATABASE_URL` - Is it set?
- [ ] `NEXTAUTH_URL` - Matches production URL?
- [ ] `NEXTAUTH_SECRET` - Is it set?
- [ ] `REDIS_URL` - Is it set?

---

### 🔥 Step 4: Create Production Test Users (5 minutes)

```bash
# Create test users in production database
npm run test:users:production

# Verify users were created
npm run check-vercel-users
```

**Expected Test Users**:
```
✅ test@example.com (Customer)
✅ farmer@example.com (Farmer)
✅ admin@example.com (Admin)
```

---

## 🛠️ CRITICAL FIXES - PRIORITY ORDER

### Priority 1: Fix Page Crashes (13 pages) ⏱️ 2-4 hours

#### Issue: Pages crashing on load
**Affected**: `/contact`, `/faq`, `/marketplace`, `/products`, `/farms`, `/login`, `/register`, etc.

#### Diagnosis Steps:

1. **Check Build Logs**
```bash
cd "Farmers Market Platform web and app"

# Clean and rebuild
rm -rf .next
npm run build 2>&1 | tee build.log

# Look for errors in build.log
grep -i "error" build.log
grep -i "failed" build.log
```

2. **Check for JavaScript Errors**
```bash
# Run dev server and test locally
npm run dev

# Open each crashing page in browser console
# Check for JavaScript errors
```

3. **Check Server Component Issues**
```bash
# Search for common async/await issues
grep -r "use client" src/app --include="*.tsx"
grep -r "async" src/app --include="*.tsx" | grep -v "use server"
```

#### Common Causes & Fixes:

**Cause A: Missing Database Connection**
```typescript
// ❌ BAD - Creating new Prisma instances
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ GOOD - Use singleton
import { database } from '@/lib/database';
```

**Fix**: Search and replace all Prisma instances
```bash
# Find all PrismaClient instantiations
grep -r "new PrismaClient()" src/

# Replace with database import
# (Do this manually in each file)
```

**Cause B: Async Component Without Proper Error Boundary**
```typescript
// ❌ BAD - No error handling
export default async function Page() {
  const data = await fetchData(); // Can throw
  return <div>{data}</div>;
}

// ✅ GOOD - With error boundary
export default async function Page() {
  try {
    const data = await fetchData();
    return <div>{data}</div>;
  } catch (error) {
    return <ErrorState error={error} />;
  }
}
```

**Cause C: Environment Variable Missing**
```typescript
// Check if required env vars exist
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'REDIS_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing: ${varName}`);
  }
});
```

#### Quick Fix Script:

```bash
# Run validation
npm run validate:env
npm run validate:db

# Test each crashing route locally
npm run dev

# Then visit:
# http://localhost:3001/contact
# http://localhost:3001/marketplace
# http://localhost:3001/products
# etc.
```

---

### Priority 2: Fix Authentication (24 routes) ⏱️ 1-2 hours

#### Issue: All protected routes failing authentication

#### Diagnosis Steps:

1. **Verify Test Users Exist**
```bash
# Check production database
npm run check-vercel-users

# If no users, create them
npm run test:users:production
```

2. **Check NextAuth Configuration**
```bash
# Verify auth route exists
cat src/app/api/auth/[...nextauth]/route.ts

# Check middleware
cat middleware.ts
```

3. **Test Authentication Flow**
```bash
# Run auth debug script
npm run debug-auth

# Check session handling
npm run debug-nextauth
```

#### Common Causes & Fixes:

**Cause A: Test Users Don't Exist**
```bash
# Solution: Create test users
npm run test:users:production

# Verify
npm run check-vercel-users
```

**Cause B: NEXTAUTH_SECRET Mismatch**
```bash
# Check if secret is set
vercel env ls | grep NEXTAUTH_SECRET

# If missing, add it
vercel env add NEXTAUTH_SECRET

# Enter a secure random string
openssl rand -base64 32
```

**Cause C: NEXTAUTH_URL Wrong**
```bash
# Should be production URL
vercel env add NEXTAUTH_URL
# Enter: https://farmers-market-platform.vercel.app
```

**Cause D: Session Cookie Issues**
```typescript
// Check auth options in route.ts
export const authOptions: NextAuthOptions = {
  // ...
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true // Must be true in production
      }
    }
  }
};
```

#### Quick Fix Commands:

```bash
# 1. Create test users
npm run test:users:production

# 2. Verify environment
npm run validate:env

# 3. Test authentication
npm run debug-auth

# 4. Redeploy if config changed
vercel --prod
```

---

### Priority 3: Fix Homepage Performance ⏱️ 30 minutes

#### Issue: Homepage loading in 10+ seconds

#### Quick Wins:

1. **Enable Image Optimization**
```typescript
// next.config.mjs
export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  }
}
```

2. **Add Loading States**
```typescript
// app/page.tsx
export default async function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
```

3. **Defer Non-Critical Scripts**
```typescript
// Move heavy components to client
'use client';
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
});
```

4. **Check for Large Dependencies**
```bash
# Analyze bundle
npm run build:analyze

# Look for large chunks
# Consider code splitting
```

---

### Priority 4: Fix Accessibility Issues ⏱️ 15 minutes

#### Issue: Buttons without accessible labels

#### Fix:

```bash
# Find all icon-only buttons
grep -r "<button>" src/ --include="*.tsx" | grep -v "aria-label"

# Add aria-labels
```

**Example Fixes**:
```tsx
// ❌ BAD
<button onClick={handleClick}>
  <MenuIcon />
</button>

// ✅ GOOD - Option 1: Add aria-label
<button onClick={handleClick} aria-label="Open menu">
  <MenuIcon />
</button>

// ✅ GOOD - Option 2: Add visible text
<button onClick={handleClick}>
  <MenuIcon />
  <span>Menu</span>
</button>

// ✅ GOOD - Option 3: Add visually hidden text
<button onClick={handleClick}>
  <MenuIcon />
  <span className="sr-only">Menu</span>
</button>
```

**Quick Fix**:
```bash
# Run accessibility migration
npm run migrate:testid

# Or manually update
# src/components/Navigation.tsx
# src/components/Header.tsx
```

---

## 📋 VERIFICATION CHECKLIST

After implementing fixes, verify each item:

### ✅ Page Crash Fixes
```bash
# Test each previously crashing page
curl -I https://farmers-market-platform.vercel.app/contact
curl -I https://farmers-market-platform.vercel.app/marketplace
curl -I https://farmers-market-platform.vercel.app/products
curl -I https://farmers-market-platform.vercel.app/farms
curl -I https://farmers-market-platform.vercel.app/login

# All should return 200 OK
```

### ✅ Authentication Fixes
```bash
# Run bot with test users
npm run bot:production

# Should show successful authentication
```

### ✅ Performance Fixes
```bash
# Run Lighthouse on homepage
npx lighthouse https://farmers-market-platform.vercel.app --view

# Target: FCP < 2.5s
```

### ✅ Accessibility Fixes
```bash
# Run a11y tests
npm run test:a11y

# Should have zero critical issues
```

---

## 🔄 RE-RUN INSPECTION BOT

After all fixes are deployed:

```bash
# Full inspection
npm run inspect:website

# Quick check
npm run inspect:website:quick

# Or specific portals
npm run inspect:public
npm run inspect:customer
npm run inspect:farmer
npm run inspect:admin
```

**Target Metrics**:
- ✅ Success Rate: >95%
- ✅ Page Crashes: 0
- ✅ Auth Failures: 0
- ✅ Load Time: <3s
- ✅ A11y Issues: 0

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying fixes:

- [ ] All changes tested locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Lint passes (`npm run lint`)
- [ ] Environment variables verified
- [ ] Database migrations run (if needed)
- [ ] Backup created (if needed)

Deploy:
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Monitor logs
vercel logs --follow
```

---

## 📊 SUCCESS CRITERIA

### Before Fixes
- ❌ Health Score: 5.1%
- ❌ Successful Pages: 0/39
- ❌ Page Crashes: 13
- ❌ Auth Failures: 24
- ❌ Homepage Load: 10s

### After Fixes (Target)
- ✅ Health Score: >95%
- ✅ Successful Pages: 37+/39
- ✅ Page Crashes: 0
- ✅ Auth Failures: 0
- ✅ Homepage Load: <3s

---

## 🆘 IF NOTHING WORKS

### Nuclear Options

1. **Rollback to Last Known Good State**
```bash
# Find last working deployment
vercel list --limit 20

# Rollback
vercel rollback [working-deployment-url]
```

2. **Fresh Deploy**
```bash
# Clean everything
rm -rf .next node_modules
npm ci
npm run build
vercel --prod --force
```

3. **Check Vercel Status**
```bash
# Visit https://www.vercel-status.com/
# Check if there's a platform issue
```

4. **Contact Support**
- Vercel Support: https://vercel.com/support
- Check GitHub Issues: Look for similar problems
- Review Vercel Logs: Download and analyze

---

## 📞 EMERGENCY CONTACTS

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Database (Vercel Postgres)**: Check Vercel Dashboard → Storage
- **Redis (Vercel KV)**: Check Vercel Dashboard → Storage
- **Logs**: https://vercel.com/[team]/[project]/logs

---

## 📝 POST-FIX TASKS

After emergency fixes:

1. **Document What Went Wrong**
   - Create incident report
   - Document root cause
   - Document fix applied

2. **Prevent Future Issues**
   - Add monitoring alerts
   - Implement automated testing
   - Set up canary deployments

3. **Update Runbooks**
   - Document troubleshooting steps
   - Update deployment checklist
   - Create rollback procedures

---

**REMEMBER**: 
- 🚨 Production is down, act fast but carefully
- 📝 Document everything you do
- 🔄 Test changes locally first
- 🎯 Focus on critical user flows first
- 💾 Backup before major changes

**NEXT ACTION**: Start with Step 1 (Verify Production Status) above ⬆️