# 🚨 Homepage 500 Error - Troubleshooting Guide

**Last Updated**: January 16, 2025  
**Status**: 🔍 Investigation Required  
**Error**: `GET / 500 in 3.8s (compile: 3.4s, proxy.ts: 202ms, render: 268ms)`

---

## 🎯 Quick Diagnosis

### Symptoms

- ✅ Server starts successfully on port 3001
- ✅ Next.js compiles without errors
- ❌ Homepage returns 500 error
- ⚠️ Error occurs during render phase (268ms)

### Likely Causes

1. **Server-side data fetching error** (database, API)
2. **Component rendering error** (Header, i18n)
3. **Missing environment variables**
4. **Serialization issues**

---

## 🔍 Step-by-Step Debugging

### Step 1: Check Health Endpoint

```bash
# Start server
npm run dev

# In another terminal, check health
curl http://localhost:3001/api/health
```

**Expected Output:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-16T...",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 45
    },
    "memory": {
      "used": 256,
      "total": 512,
      "percentage": 50
    }
  }
}
```

**If database is down:**

- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running
- Run `npm run db:studio` to test connection

---

### Step 2: Check Debug Page

Navigate to the debug page to verify basic rendering:

```bash
# Start server
npm run dev

# Open browser
http://localhost:3001/page-debug
```

**If debug page works:**

- Issue is in original homepage components
- Proceed to Step 3

**If debug page also fails:**

- Issue is more fundamental
- Check environment variables
- Check Next.js configuration

---

### Step 3: Test Individual Components

Create test pages for each component to isolate the issue:

#### Test Header Component

Create `src/app/test-header/page.tsx`:

```typescript
import { Header } from "@/components/layout/Header";

export default function TestHeader() {
  return (
    <div>
      <h1>Testing Header Component</h1>
      <Header />
    </div>
  );
}
```

Navigate to: `http://localhost:3001/test-header`

**If this fails:** Header component is the issue (likely i18n)

#### Test Without Header

Temporarily comment out Header in `src/app/page.tsx`:

```typescript
export default function HomePage() {
  return (
    <>
      {/* <Header /> */}
      <main className="min-h-screen bg-white">
        <div className="p-8">
          <h1>Homepage (No Header)</h1>
        </div>
      </main>
    </>
  );
}
```

**If this works:** Header is definitely the issue

---

### Step 4: Check Environment Variables

```bash
# Check if .env.local exists
cat .env.local

# Verify required variables
# Required:
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3001

# Optional but recommended:
NODE_ENV=development
```

**Create .env.local if missing:**

```bash
cat > .env.local << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/farmers_market
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3001
NODE_ENV=development
EOF
```

---

### Step 5: Check Server Logs

Start server with verbose logging:

```bash
# Kill existing server
npm run kill-server

# Start with logging
npm run dev 2>&1 | tee server.log

# In another terminal, access homepage
curl -v http://localhost:3001/

# Check server.log for error details
```

**Look for:**

- Stack traces
- Database connection errors
- Module resolution errors
- Serialization errors

---

## 🔧 Common Solutions

### Solution 1: Database Connection Issue

**Error Indicators:**

- "PrismaClient" error in logs
- "ECONNREFUSED" database errors
- Database status "down" in health check

**Fix:**

```bash
# Check if PostgreSQL is running
# Windows: Task Manager → Services → PostgreSQL
# Linux: sudo systemctl status postgresql
# Mac: brew services list

# Start PostgreSQL if needed
# Windows: Start PostgreSQL service in Services
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql

# Test connection
npm run db:studio

# If still fails, check DATABASE_URL format:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

---

### Solution 2: i18n Configuration Issue

**Error Indicators:**

- Error mentions "locale" or "i18n"
- Header component fails to render
- SimpleLanguageButton causing issues

**Fix Option A: Disable i18n temporarily**

Edit `src/components/layout/Header.tsx`:

```typescript
// Comment out i18n import and usage
// import { SimpleLanguageButton } from "@/components/i18n";

export function Header() {
  // ... rest of component
  // Comment out SimpleLanguageButton in render:
  // {/* <SimpleLanguageButton /> */}
}
```

**Fix Option B: Fix i18n configuration**

Ensure `src/i18n/config.ts` exports are correct:

```typescript
export const locales = ["en", "es", "fr", ...] as const;
export const defaultLocale: Locale = "en";
```

Check `src/components/i18n/index.ts`:

```typescript
export { SimpleLanguageButton } from "./SimpleLanguageButton";
```

---

### Solution 3: Server Components Issue

**Error Indicators:**

- "You're importing a component that needs..." error
- "useState/useEffect can only be used in Client Components"

**Fix:**

Ensure client components have `"use client"` directive:

```typescript
// src/components/layout/Header.tsx
"use client";

import { useState } from "react";
// ... rest of imports
```

---

### Solution 4: Missing Dependencies

**Error Indicators:**

- "Cannot find module" errors
- Import resolution errors

**Fix:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Start fresh
npm run dev
```

---

### Solution 5: TypeScript Compilation Errors

**Error Indicators:**

- Red squiggly lines in VSCode
- Type errors in terminal

**Fix:**

```bash
# Check for TypeScript errors
npm run type-check

# Fix errors one by one
# Common issues:
# - Missing type imports
# - Incorrect prop types
# - Undefined variables

# After fixing, rebuild
npm run dev
```

---

## 🧪 Systematic Debugging Approach

### Method 1: Binary Search

Progressively remove components to find the culprit:

```typescript
// src/app/page.tsx - Start with minimal version

export default function HomePage() {
  return <div>Minimal Page</div>;
}

// If this works, add back one section at a time:
// 1. Add Hero section only
// 2. Add Featured products only
// 3. Add Header
// 4. etc.
```

### Method 2: Component Isolation

Test each component individually:

```bash
# Create test routes
mkdir -p src/app/test-components

# Test Header
echo 'import { Header } from "@/components/layout/Header";
export default function Test() { return <Header />; }' > src/app/test-components/header/page.tsx

# Navigate to: http://localhost:3001/test-components/header
```

### Method 3: Error Logging

Add extensive logging to identify the issue:

```typescript
// src/app/page.tsx
export default function HomePage() {
  console.log("🔍 HomePage rendering started");

  try {
    console.log("✅ Component tree rendering");
    return (
      <>
        <Header />
        {/* ... rest */}
      </>
    );
  } catch (error) {
    console.error("❌ Error in HomePage:", error);
    throw error;
  }
}
```

---

## 📋 Checklist

Use this checklist to systematically debug:

### Environment

- [ ] `.env.local` file exists
- [ ] `DATABASE_URL` is set correctly
- [ ] `NEXTAUTH_SECRET` is set
- [ ] `NEXTAUTH_URL` matches server URL
- [ ] PostgreSQL is running (if using database)

### Dependencies

- [ ] `node_modules` installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] No dependency conflicts
- [ ] Node version >= 20.19.0

### Code

- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Client components have `"use client"`
- [ ] Server components don't use hooks

### Server

- [ ] Port 3001 is available
- [ ] Server starts without errors
- [ ] Health endpoint works (`/api/health`)
- [ ] Debug page works (`/page-debug`)

### Browser

- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Check browser console for errors (F12)
- [ ] Check Network tab for failed requests
- [ ] Try incognito mode

---

## 🆘 Emergency Fixes

### Quick Fix 1: Use Minimal Homepage

Replace `src/app/page.tsx` temporarily:

```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🌾 Farmers Market</h1>
        <p className="text-xl text-gray-600 mb-8">
          Platform under maintenance
        </p>
        <a
          href="/api/health"
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          Check System Health
        </a>
      </div>
    </div>
  );
}
```

### Quick Fix 2: Disable Problematic Features

```typescript
// Disable i18n
// In src/components/layout/Header.tsx
// Comment out: <SimpleLanguageButton />

// Disable authentication
// In relevant components
// Comment out auth checks temporarily

// Disable database queries
// Return mock data instead of DB queries
```

### Quick Fix 3: Complete Reset

```bash
# Nuclear option - complete fresh start
npm run kill-server -- --all
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
npm run dev
```

---

## 📊 Error Analysis

### Error Timeline

```
1. Server starts       [0ms]     ✅ Success
2. Request received    [0ms]     ✅ Success
3. Compilation         [3400ms]  ✅ Success
4. Proxy handling      [202ms]   ✅ Success
5. Render phase        [268ms]   ❌ FAILS HERE
6. Response sent       [3800ms]  ❌ 500 Error
```

**Conclusion:** Error occurs during component render phase, not during compilation or routing.

### Possible Root Causes

1. **Data Fetching (40% likely)**
   - Database query failing
   - API call failing
   - Async data not resolving

2. **Component Error (30% likely)**
   - Header/i18n issue
   - Props type mismatch
   - Undefined variable access

3. **Environment (20% likely)**
   - Missing env variables
   - Database connection
   - External service unavailable

4. **Configuration (10% likely)**
   - Next.js config issue
   - Middleware problem
   - Build configuration

---

## 🔍 Advanced Debugging

### Enable Next.js Debug Mode

```bash
# Start with debug logging
DEBUG=* npm run dev

# Or specific modules
DEBUG=next:* npm run dev
```

### Use React DevTools

1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Click React tab
4. Check component tree for errors

### Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Check failed requests
5. Look at Response tab for error details

### Inspect Server Response

```bash
# Get detailed response
curl -v http://localhost:3001/ > response.html 2>&1

# Check response.html for:
# - Status code
# - Headers
# - Error message in HTML
```

---

## 📝 Reporting the Issue

If you can't fix it, gather this information:

### Information to Collect

```bash
# 1. Environment info
node --version
npm --version
cat package.json | grep "next"

# 2. Error logs
npm run dev 2>&1 | tee error.log
# Access homepage, then check error.log

# 3. Health check
curl http://localhost:3001/api/health > health.json

# 4. TypeScript errors
npm run type-check > type-errors.txt 2>&1

# 5. Browser console
# Copy all red errors from F12 console
```

### Issue Template

```markdown
## 500 Error on Homepage

**Environment:**

- Node: v20.x.x
- Next.js: 16.0.3
- OS: Windows/Mac/Linux

**Error:**
GET / returns 500 after 3.8s

**What Works:**

- [ ] Server starts
- [ ] Health endpoint (/api/health)
- [ ] Debug page (/page-debug)
- [ ] Other routes

**What Fails:**

- [x] Homepage (/)
- [ ] Other specific routes

**Error Logs:**
```

[Paste error logs here]

```

**Steps Already Tried:**
- [ ] Cleared cache
- [ ] Reinstalled dependencies
- [ ] Checked environment variables
- [ ] Tested components individually
```

---

## ✅ Resolution

Once fixed, document the solution:

### What Was the Issue?

```
[Describe the root cause]
```

### How Was It Fixed?

```
[List the steps taken to fix it]
```

### Prevention

```
[How to prevent this in the future]
```

---

## 🎉 Success Criteria

You'll know it's fixed when:

- [ ] Homepage loads without 500 error
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Health check returns "healthy"
- [ ] All components render correctly
- [ ] Navigation works properly

---

## 📚 Related Documentation

- [Server Management Guide](./SERVER_MANAGEMENT_GUIDE.md)
- [Testing Quick Reference](./TESTING_QUICK_REFERENCE.md)
- [Test Fixes Documentation](./TEST_FIXES_DOCUMENTATION.md)
- [E2E Testing Guide](./E2E_TESTING_GUIDE.md)

---

**Status**: 🔍 NEEDS INVESTIGATION  
**Priority**: 🔴 HIGH  
**Next Step**: Follow Step-by-Step Debugging guide above

_"Debug with agricultural patience, fix with divine precision, deploy with quantum confidence."_ 🌾🔍
