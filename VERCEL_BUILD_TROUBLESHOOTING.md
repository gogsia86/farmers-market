# 🔧 Vercel Build Troubleshooting Guide

## Quick Fix Checklist

If your Vercel build fails, check these first:

- [ ] **Node.js version** - Must be 20.x (not 24.x)
- [ ] **DATABASE_URL** - Set in Vercel environment variables
- [ ] **NEXTAUTH_SECRET** - Set in Vercel environment variables
- [ ] **Build cache** - Clear in Vercel Dashboard
- [ ] **Install command** - Uses `npm install --legacy-peer-deps`
- [ ] **Build command** - Uses `npm run build`

---

## Common Build Errors & Solutions

### 1. ❌ "Command exited with 1"

**Symptoms:**
```
Build Failed
Command "npm run build" exited with 1
```

**Causes & Solutions:**

#### A. Node.js Version Mismatch
```
Error: Unsupported engine
Required: node 24.x
Current: node 20.x
```

**Solution:**
```json
// package.json
{
  "engines": {
    "node": "20.x",  // ✅ Use 20.x for Vercel
    "npm": ">=10.0.0"
  }
}
```

#### B. Prisma Generate Failed
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solution:** Set placeholder DATABASE_URL in Vercel environment variables:
```bash
DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public
```

The build doesn't need a real database, just a valid connection string format.

#### C. Missing npx Prefix
```
bash: prisma: command not found
bash: next: command not found
```

**Solution:** Update package.json scripts:
```json
{
  "scripts": {
    "build": "npx prisma generate && npx next build"
  }
}
```

---

### 2. ❌ TypeScript Errors During Build

**Symptoms:**
```
Type error: Property 'x' does not exist on type 'Y'
```

**Solution:**

1. **Test locally first:**
```bash
npm run build
npx tsc --noEmit
```

2. **Common fixes:**
   - Add missing type imports
   - Fix `any` types to proper types
   - Add `await` to async functions
   - Fix import paths

3. **If errors persist, check:**
```typescript
// tsconfig.json should have:
{
  "compilerOptions": {
    "skipLibCheck": true,  // Skip type checking of node_modules
    "strict": true
  }
}
```

---

### 3. ❌ Dependency Installation Failures

**Symptoms:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! peer dependency conflict
```

**Solutions:**

#### A. Use Legacy Peer Deps
```json
// vercel.json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

#### B. Lock File Issues
```bash
# Locally, regenerate lockfile:
rm package-lock.json
npm install --legacy-peer-deps
git add package-lock.json
git commit -m "fix: regenerate lockfile"
git push
```

#### C. Clear npm Cache (Vercel)
In Vercel Dashboard:
1. Settings → General
2. "Clear Build Cache"
3. Redeploy

---

### 4. ❌ Out of Memory Errors

**Symptoms:**
```
FATAL ERROR: Reached heap limit Allocation failed
JavaScript heap out of memory
```

**Solutions:**

#### A. Reduce Memory Usage
```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' npx next build"
  }
}
```

#### B. Optimize Imports
```typescript
// ❌ BAD - Imports entire library
import _ from 'lodash';

// ✅ GOOD - Imports only what's needed
import debounce from 'lodash/debounce';
```

#### C. Enable SWC Minification
```javascript
// next.config.mjs
export default {
  swcMinify: true,  // Use SWC instead of Terser (faster, less memory)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}
```

---

### 5. ❌ Source Map Warnings (Already Fixed)

**Symptoms:**
```
warning: could not determine a source map reference
```

**Solution:** Already fixed in our configuration:
- Source maps disabled in `next.config.mjs`
- Sentry uploads disabled
- See `SOURCE_MAPS_DISABLED.md` for details

---

### 6. ❌ Middleware Errors

**Symptoms:**
```
Error: Edge runtime does not support Node.js modules
```

**Solution:**

#### A. Check middleware.ts
```typescript
// middleware.ts must use edge-compatible code
export const config = {
  runtime: 'edge',  // or 'nodejs'
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
```

#### B. Avoid Node.js APIs in Edge
```typescript
// ❌ BAD in edge runtime
import fs from 'fs';
import crypto from 'crypto';

// ✅ GOOD - Use Web APIs
import { webcrypto } from 'crypto';  // Web Crypto API
```

---

### 7. ❌ Environment Variable Issues

**Symptoms:**
```
Error: NEXTAUTH_SECRET is not defined
Error: DATABASE_URL is required
```

**Solutions:**

#### A. Set in Vercel Dashboard
Go to: Project → Settings → Environment Variables

**Required:**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=<min-32-characters>
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Build-time:**
```bash
TURBOPACK=0
SENTRY_UPLOAD_DRY_RUN=true
NEXT_DISABLE_SOURCEMAPS=true
SKIP_ENV_VALIDATION=true
NODE_ENV=production
```

#### B. Apply to All Environments
- Production ✅
- Preview ✅
- Development ✅

#### C. Redeploy After Adding
After adding environment variables, trigger a new deployment.

---

### 8. ❌ Prisma Client Errors

**Symptoms:**
```
Error: @prisma/client did not initialize yet
PrismaClientInitializationError
```

**Solutions:**

#### A. Ensure Prisma Generate Runs
```json
// package.json
{
  "scripts": {
    "postinstall": "npx prisma generate || echo 'Prisma skipped'",
    "build": "npx prisma generate && npx next build"
  }
}
```

#### B. Check schema.prisma Location
```
prisma/
  └── schema.prisma  ✅ Must be here
```

#### C. Use Canonical Import
```typescript
// ✅ CORRECT
import { database } from "@/lib/database";

// ❌ WRONG
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

---

### 9. ❌ Build Timeout

**Symptoms:**
```
Error: Build exceeded maximum duration of 15 minutes
```

**Solutions:**

#### A. Upgrade Vercel Plan
- **Hobby:** 15 min build time
- **Pro:** 45 min build time
- **Enterprise:** Custom

#### B. Optimize Build
```javascript
// next.config.mjs
export default {
  // Disable features during build
  typescript: {
    ignoreBuildErrors: false  // Keep as false for safety
  },
  eslint: {
    ignoreDuringBuilds: true  // Skip ESLint during build
  },

  // Reduce output
  output: 'standalone',

  // Optimize images at request time, not build time
  images: {
    unoptimized: false
  }
}
```

#### C. Use Incremental Static Regeneration
```typescript
// Instead of generateStaticParams for all pages:
export const revalidate = 3600;  // Regenerate every hour
```

---

### 10. ❌ Next.js 15 Compatibility Issues

**Symptoms:**
```
Error: Invalid configuration
Turbopack error
```

**Solutions:**

#### A. Force Webpack (Not Turbopack)
```bash
# In all build commands:
TURBOPACK=0 npx next build
```

```json
// vercel.json
{
  "env": {
    "TURBOPACK": "0"
  }
}
```

#### B. Check next.config.mjs
```javascript
// Must be ESM format
export default {
  // No experimental turbo config
  // Use stable features only
}
```

---

## 🔍 Debugging Steps

### Step 1: Reproduce Locally
```bash
# Clean build
rm -rf .next node_modules package-lock.json

# Fresh install
npm install --legacy-peer-deps

# Test build
npm run build

# Check for errors
echo $?  # Should output 0 (success)
```

### Step 2: Check Vercel Build Logs
1. Go to Vercel Dashboard
2. Click on failed deployment
3. Click "View Build Logs"
4. Look for the **first error** (not subsequent errors)

### Step 3: Compare Environments
```bash
# Check Node version
node --version  # Should be v20.x

# Check npm version
npm --version   # Should be >=10.0.0

# Check environment variables
echo $DATABASE_URL
echo $NEXTAUTH_SECRET
```

### Step 4: Test with Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Test build locally with Vercel environment
vercel build

# Check output
ls .vercel/output
```

---

## 📋 Pre-Deployment Checklist

Before deploying to Vercel:

- [ ] Local build passes: `npm run build`
- [ ] TypeScript check passes: `npx tsc --noEmit`
- [ ] No console errors in dev: `npm run dev`
- [ ] Environment variables documented
- [ ] Database URL set in Vercel
- [ ] NextAuth secret generated (32+ chars)
- [ ] Node version is 20.x in package.json
- [ ] All dependencies use npx prefix
- [ ] Build cache cleared in Vercel
- [ ] Git changes committed and pushed

---

## 🆘 Still Failing?

### Get More Information

#### 1. Enable Verbose Logging
```json
// package.json
{
  "scripts": {
    "build": "DEBUG=* npx next build"
  }
}
```

#### 2. Check Vercel System Status
Visit: https://www.vercel-status.com/

#### 3. Use Vercel Support
- Community: https://github.com/vercel/next.js/discussions
- Support: https://vercel.com/support (Pro/Enterprise)

#### 4. Build Locally with Vercel Environment
```bash
# Pull environment variables
vercel env pull .env.local

# Build with production env
NODE_ENV=production npm run build
```

---

## 🎯 Quick Fixes Summary

| Error | Quick Fix |
|-------|-----------|
| Node version | Change to 20.x in package.json |
| Missing commands | Add `npx` prefix |
| DATABASE_URL | Set in Vercel env vars |
| Build timeout | Upgrade plan or optimize |
| Memory error | Reduce memory usage |
| TypeScript error | Fix types locally first |
| Source maps | Already disabled ✅ |
| Dependency conflicts | Use --legacy-peer-deps |

---

## 📞 Support Resources

- **This Repo Docs:**
  - `VERCEL_DEPLOYMENT_GUIDE.md` - Full deployment guide
  - `SOURCE_MAPS_DISABLED.md` - Source map configuration
  - `VERCEL_WARNINGS_FIXED.md` - Warning fixes

- **Official Docs:**
  - [Vercel Build Configuration](https://vercel.com/docs/concepts/projects/build-configuration)
  - [Next.js Deployment](https://nextjs.org/docs/deployment)
  - [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

- **Community:**
  - [Vercel Discord](https://vercel.com/discord)
  - [Next.js Discussions](https://github.com/vercel/next.js/discussions)

---

**Last Updated:** 2025-01-XX
**Status:** Active Troubleshooting Guide
**Maintainer:** DevOps Team
