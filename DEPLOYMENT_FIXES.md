# Vercel Deployment Error Fixes & Warnings Resolution

**Date:** January 14, 2025  
**Build Status:** ✅ Successful (with errors in post-build tasks)  
**Deployment ID:** iad1  

---

## 📋 Table of Contents

1. [Critical Errors](#critical-errors)
2. [Warnings](#warnings)
3. [Code Fixes](#code-fixes)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Testing & Verification](#testing--verification)

---

## 🔴 CRITICAL ERRORS

### 1. Sentry Upload Failures (HTTP 401 Unauthorized)

**Error Log:**
```
❌ Sentry upload error: Command failed: sentry-cli releases new 5ad71fce9dba73a44ef0316a68c64c99823ccdc8
error: API request failed
Caused by: sentry reported an error: Invalid token (http status: 401)
```

**Impact:**
- Source maps won't be uploaded to Sentry
- Stack traces in production errors will be minified/unreadable
- Error monitoring degraded

**Root Cause:**
Invalid or expired `SENTRY_AUTH_TOKEN` in Vercel environment variables.

**Fix Steps:**

#### Option A: Update Sentry Auth Token (Recommended)

1. **Generate New Token:**
   - Go to [Sentry Dashboard](https://sentry.io/) → Settings → Account → API → Auth Tokens
   - Click "Create New Token"
   - Name: `vercel-farmers-market-uploads`
   - Scopes required:
     - ✅ `project:read`
     - ✅ `project:releases`
     - ✅ `org:read`
     - ✅ `project:write` (for source maps)
   - Click "Create Token"
   - **Copy the token immediately** (shown only once)

2. **Update Vercel Environment Variables:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project: `farmers-market`
   - Navigate to: Settings → Environment Variables
   - Find `SENTRY_AUTH_TOKEN` and click "Edit"
   - Paste the new token
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

3. **Verify Sentry Configuration:**
   ```bash
   # In your local project
   npx @sentry/wizard --integration=nextjs --platform=nextjs
   ```

4. **Redeploy:**
   ```bash
   git commit --allow-empty -m "Trigger redeploy with updated Sentry token"
   git push origin master
   ```

#### Option B: Disable Sentry Uploads (Temporary)

If you need to deploy immediately without Sentry:

1. **Update `next.config.mjs`:**
   ```javascript
   export default withSentryConfig(withBundleAnalyzer(nextConfig), {
     // ... existing config ...
     
     // Add this to skip uploads in CI
     dryRun: process.env.CI === 'true' || process.env.SKIP_SENTRY_UPLOAD === 'true',
     
     // ... rest of config ...
   });
   ```

2. **Add Environment Variable in Vercel:**
   - Name: `SKIP_SENTRY_UPLOAD`
   - Value: `true`
   - Environment: Production only (temporary)

---

### 2. Upstash Redis URL/Token Contains Whitespace

**Error Log:**
```
[Upstash Redis] The redis url contains whitespace or newline, which can cause errors!
[Upstash Redis] The redis token contains whitespace or newline, which can cause errors!
```

**Impact:**
- Redis connection failures at runtime
- Rate limiting won't work
- Cache operations will fail
- Potential production downtime

**Root Cause:**
Environment variables have trailing/leading whitespace or newline characters.

**Fix Steps:**

1. **Update Vercel Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Find `UPSTASH_REDIS_REST_URL`
   - Click "Edit"
   - **Carefully copy the value, trim any whitespace**
   - Original: `https://your-redis.upstash.io  ` ❌
   - Fixed: `https://your-redis.upstash.io` ✅
   - Save

   - Find `UPSTASH_REDIS_REST_TOKEN`
   - Click "Edit"
   - **Trim any whitespace from the token**
   - Save

2. **Add Defensive Code (Apply this fix):**

Create a new utility file:

```typescript
// src/lib/utils/env.ts
export function getCleanEnvVar(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  
  // Remove whitespace, newlines, and tabs
  const cleaned = value.trim().replace(/[\r\n\t]/g, '');
  
  if (cleaned !== value) {
    console.warn(`[ENV] Cleaned whitespace from ${key}`);
  }
  
  return cleaned;
}
```

3. **Update Redis Initialization Files:**

Update these files to use the utility:

**File: `src/lib/cache/page-cache.ts`**
```typescript
import { getCleanEnvVar } from '@/lib/utils/env';

if (
  !redis &&
  getCleanEnvVar('UPSTASH_REDIS_REST_URL') &&
  getCleanEnvVar('UPSTASH_REDIS_REST_TOKEN')
) {
  try {
    redis = new Redis({
      url: getCleanEnvVar('UPSTASH_REDIS_REST_URL')!,
      token: getCleanEnvVar('UPSTASH_REDIS_REST_TOKEN')!,
    });
  } catch (error) {
    // ... error handling
  }
}
```

**File: `src/lib/rate-limit/index.ts`**
```typescript
import { getCleanEnvVar } from '@/lib/utils/env';

if (getCleanEnvVar('UPSTASH_REDIS_REST_URL') && getCleanEnvVar('UPSTASH_REDIS_REST_TOKEN')) {
  const { Redis } = await import("@upstash/redis");
  redisClient = new Redis({
    url: getCleanEnvVar('UPSTASH_REDIS_REST_URL')!,
    token: getCleanEnvVar('UPSTASH_REDIS_REST_TOKEN')!,
  });
}
```

**File: `src/lib/security/rate-limiter.ts`**
```typescript
import { getCleanEnvVar } from '@/lib/utils/env';

if (
  !getCleanEnvVar('UPSTASH_REDIS_REST_URL') ||
  !getCleanEnvVar('UPSTASH_REDIS_REST_TOKEN')
) {
  throw new Error('Redis configuration missing');
}

redis = new Redis({
  url: getCleanEnvVar('UPSTASH_REDIS_REST_URL')!,
  token: getCleanEnvVar('UPSTASH_REDIS_REST_TOKEN')!,
});
```

---

## ⚠️ WARNINGS

### 3. Node.js Version Mismatch

**Warning Log:**
```
Warning: Due to "engines": { "node": "20.18.0" } in your `package.json` file, 
the Node.js Version defined in your Project Settings ("24.x") will not apply, 
Node.js Version "20.x" will be used instead.

Warning: Detected "engines": { "node": "20.18.0" } in your `package.json` 
with major.minor.patch, but only major Node.js Version can be selected.
```

**Impact:**
- Vercel ignores project settings and uses `package.json` engines field
- Minor version mismatch (20.18.0 vs 20.20.0) could cause subtle bugs
- Inconsistent behavior between local and production

**Fix:**

Update `package.json`:

```json
{
  "engines": {
    "node": ">=20.18.0 <21.0.0",
    "npm": ">=10.0.0"
  }
}
```

**Alternative (if you need exact version):**
```json
{
  "engines": {
    "node": "20.x",
    "npm": ">=10.0.0"
  }
}
```

**Why this works:**
- Vercel only supports major version selection (20.x, not 20.18.0)
- Using range allows flexibility while ensuring compatibility
- Removes the EBADENGINE warning

---

### 4. Engine Version Warning (EBADENGINE)

**Warning Log:**
```
npm warn EBADENGINE Unsupported engine {
  package: 'farmers-market@1.1.0',
  required: { node: '20.18.0', npm: '>=10.0.0' },
  current: { node: 'v20.20.0', npm: '10.8.2' }
}
```

**Fix:**
Same as #3 above - update `package.json` engines field to use version ranges.

---

### 5. Prisma Version Update Available

**Info Log:**
```
┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.2 -> 7.2.0                       │
│  This is a major update - please follow the guide       │
└─────────────────────────────────────────────────────────┘
```

**Impact:**
- Currently on stable v6.19.2
- v7.x has breaking changes
- Not urgent, but should be planned

**Action:**
- **Do NOT upgrade during critical deployment**
- Plan upgrade during maintenance window
- Review migration guide: https://pris.ly/d/major-version-upgrade
- Current version is stable and production-ready

---

### 6. Edge Runtime Static Generation Warning

**Warning Log:**
```
⚠ Using edge runtime on a page currently disables static generation for that page
```

**Impact:**
- Pages using Edge Runtime won't be statically generated
- Slightly higher latency for first request
- Increased function invocations (cost)

**Pages Affected:**
Check for files with `export const runtime = 'edge'`

**Fix (if needed):**
```typescript
// Only use Edge Runtime for truly dynamic routes
// Remove this line for pages that can be static:
export const runtime = 'edge'; // ❌ Remove if not needed

// Or switch to Node.js runtime:
export const runtime = 'nodejs'; // ✅ Better for static generation
```

---

## 🛠️ CODE FIXES TO APPLY

### Fix #1: Create Environment Variable Utility

```bash
# Create the utility file
touch src/lib/utils/env.ts
```

**File: `src/lib/utils/env.ts`**
```typescript
/**
 * Safely retrieves and cleans environment variables
 * Removes whitespace, newlines, and tabs that can cause connection errors
 */

export function getCleanEnvVar(key: string): string | undefined {
  const value = process.env[key];
  
  if (!value) {
    return undefined;
  }
  
  // Remove all types of whitespace
  const cleaned = value
    .trim()
    .replace(/[\r\n\t]/g, '')
    .replace(/\s+/g, ' ');
  
  // Log warning if we had to clean the value
  if (cleaned !== value && process.env.NODE_ENV !== 'production') {
    console.warn(`[ENV] Cleaned whitespace from ${key}`);
  }
  
  return cleaned;
}

export function getRequiredEnvVar(key: string): string {
  const value = getCleanEnvVar(key);
  
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  
  return value;
}

// Redis-specific helpers
export function getRedisConfig() {
  const url = getCleanEnvVar('UPSTASH_REDIS_REST_URL');
  const token = getCleanEnvVar('UPSTASH_REDIS_REST_TOKEN');
  
  if (!url || !token) {
    console.warn('[Redis] Configuration not available, using fallback');
    return null;
  }
  
  return { url, token };
}
```

---

### Fix #2: Update package.json

```json
{
  "name": "farmers-market",
  "version": "1.1.0",
  "engines": {
    "node": ">=20.18.0 <21.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

### Fix #3: Add Sentry Error Handling Enhancement

**File: `next.config.mjs`** (Already has errorHandler, but enhance it)

The current config already has:
```javascript
errorHandler: (err, invokeErr, compilation) => {
  console.error("❌ Sentry upload error:", err.message);
  return false; // Don't fail build
}
```

This is correct ✅ - Build continues even if Sentry fails.

---

## 🔧 ENVIRONMENT VARIABLES SETUP

### Required Variables in Vercel

Go to **Vercel Dashboard → Settings → Environment Variables** and verify/update:

| Variable Name | Example Value | Notes |
|--------------|---------------|-------|
| `SENTRY_AUTH_TOKEN` | `sntrys_xxxxx...` | Generate new token from Sentry |
| `UPSTASH_REDIS_REST_URL` | `https://xxx.upstash.io` | **Remove all whitespace!** |
| `UPSTASH_REDIS_REST_TOKEN` | `AxxxxxxxxxxxYyy=` | **Remove all whitespace!** |
| `DATABASE_URL` | `postgresql://...` | Check for whitespace |
| `NEXTAUTH_SECRET` | `random-string-here` | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-domain.com` | Production URL |

### How to Clean Environment Variables

1. Copy the variable value to a text editor
2. Check for:
   - Leading/trailing spaces
   - Newline characters at the end
   - Tab characters
3. Use this command to verify (in terminal):
   ```bash
   echo "YOUR_VALUE_HERE" | cat -A
   # Should NOT show $ at the end (indicates newline)
   ```
4. Paste the cleaned value back into Vercel

---

## ✅ TESTING & VERIFICATION

### After Applying Fixes

1. **Test Locally:**
   ```bash
   # Clean install
   rm -rf node_modules .next
   npm install
   
   # Build locally
   npm run build
   
   # Check for errors
   npm run type-check
   npm run lint
   ```

2. **Test Redis Connection:**
   ```bash
   npm run redis:test
   ```

3. **Commit and Push:**
   ```bash
   git add .
   git commit -m "fix: resolve Sentry auth and Redis whitespace issues"
   git push origin master
   ```

4. **Monitor Vercel Deployment:**
   - Watch the build logs
   - Look for: ✅ No Sentry 401 errors
   - Look for: ✅ No Redis whitespace warnings

5. **Verify Production:**
   ```bash
   # Check health endpoint
   curl https://your-domain.com/api/health
   
   # Check Redis
   curl https://your-domain.com/api/health/database
   ```

6. **Verify Sentry:**
   - Go to Sentry Dashboard
   - Check if latest release appears: `5ad71fce...`
   - Trigger a test error to verify source maps

---

## 📝 DEPLOYMENT CHECKLIST

- [ ] Update `SENTRY_AUTH_TOKEN` in Vercel
- [ ] Clean `UPSTASH_REDIS_REST_URL` (remove whitespace)
- [ ] Clean `UPSTASH_REDIS_REST_TOKEN` (remove whitespace)
- [ ] Update `package.json` engines field
- [ ] Create `src/lib/utils/env.ts` utility
- [ ] Update Redis initialization files to use `getCleanEnvVar()`
- [ ] Test locally: `npm run build`
- [ ] Commit and push changes
- [ ] Monitor Vercel deployment logs
- [ ] Verify production health endpoints
- [ ] Check Sentry for new release
- [ ] Test Redis functionality (rate limiting, cache)

---

## 🎯 SUMMARY

**Critical Issues:** 2
- Sentry authentication (affects error monitoring)
- Redis whitespace (affects runtime stability)

**Warnings:** 4
- Node.js version (cosmetic, no impact)
- Prisma update (informational)
- Edge runtime (expected behavior)
- npm optional dependencies (safe to ignore)

**Time to Fix:** 15-20 minutes

**Deployment Status After Fixes:** Should be error-free ✅

---

## 📞 SUPPORT

If issues persist:

1. **Check Vercel Logs:**
   ```bash
   vercel logs your-deployment-url
   ```

2. **Check Sentry Integration:**
   - Verify org: `medicis-gang`
   - Verify project: `farmers-market-prod`

3. **Test Redis Locally:**
   ```bash
   npm run redis:test
   ```

4. **Contact Support:**
   - Vercel: https://vercel.com/support
   - Sentry: https://sentry.io/support/
   - Upstash: https://upstash.com/docs

---

**Last Updated:** January 14, 2025  
**Status:** Ready for implementation  
**Priority:** High (affects production monitoring and stability)