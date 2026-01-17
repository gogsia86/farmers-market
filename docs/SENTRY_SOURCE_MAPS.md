# 🗺️ Sentry Source Maps Configuration

**Status**: ⚠️ **DISABLED** (Deployment fix applied)  
**Reason**: Invalid/expired auth token causing deployment failures  
**Impact**: Sentry works, but stack traces won't show original source code  
**Priority**: Re-enable when valid production token is available

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current Status](#current-status)
3. [Why Source Maps Were Disabled](#why-source-maps-were-disabled)
4. [Re-Enabling Source Maps](#re-enabling-source-maps)
5. [Vercel Environment Variables](#vercel-environment-variables)
6. [Testing Source Map Uploads](#testing-source-map-uploads)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Source maps allow Sentry to show readable stack traces by mapping minified production code back to original source code. This is essential for debugging production errors.

### What Works Without Source Maps

✅ Error capturing  
✅ Performance monitoring  
✅ User context tracking  
✅ Breadcrumbs  
✅ All Sentry features

### What's Missing Without Source Maps

❌ Readable file names in stack traces  
❌ Original line numbers  
❌ Function names in production code  
❌ Source code snippets in Sentry UI

---

## Current Status

### Configuration Applied (Jan 2025)

Source map uploads have been **disabled** in `next.config.mjs` to fix deployment failures:

```javascript
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: "medicis-gang",
  project: "farmers-market-prod",

  // DISABLED SOURCE MAP UPLOADS
  silent: true,
  disableLogger: true,
  sourcemaps: {
    disable: true,
  },
  
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,

  webpack: {
    treeshake: {
      removeDebugLogging: process.env.NODE_ENV === "production",
    },
    reactComponentAnnotation: {
      enabled: true,
    },
  },
});
```

### Deployment Error (Fixed)

**Before fix**:
```
❌ Sentry upload error: Invalid token (http status: 401)
```

**After fix**:
✅ Deployment succeeds  
✅ Sentry captures errors  
⚠️ Stack traces show minified code

---

## Why Source Maps Were Disabled

### The Problem

During Vercel deployment, Sentry's webpack plugin attempted to upload source maps using an authentication token. The error indicated:

```
error: API request failed
  sentry reported an error: Invalid token (http status: 401)
```

### Root Causes

1. **Missing Token**: `SENTRY_AUTH_TOKEN` not set in Vercel environment variables
2. **Expired Token**: Token may have expired or been revoked
3. **Wrong Token**: Development/test token used instead of production token
4. **Permissions**: Token doesn't have `project:releases` permission

### Why Disable vs Fix Immediately

- **Deployment Priority**: Blocking deployments is worse than missing source maps
- **Sentry Still Works**: Error tracking continues without source maps
- **Token Acquisition**: Production tokens need proper security review
- **Graceful Degradation**: Better to have some monitoring than none

---

## Re-Enabling Source Maps

### Step 1: Get a Valid Sentry Auth Token

1. **Log in to Sentry**: https://sentry.io
2. **Navigate to**: Settings → Account → Auth Tokens
3. **Create New Token**:
   - **Name**: `Vercel Production Deployments`
   - **Scopes Required**:
     - ✅ `project:read`
     - ✅ `project:releases`
     - ✅ `org:read`
   - **Projects**: Select `farmers-market-prod`
4. **Copy Token**: Save securely (shown only once!)

### Step 2: Add Token to Vercel

```bash
# Via Vercel CLI
vercel env add SENTRY_AUTH_TOKEN production
# Paste your token when prompted

# Via Vercel Dashboard
# 1. Go to your project settings
# 2. Navigate to: Settings → Environment Variables
# 3. Add new variable:
#    Name: SENTRY_AUTH_TOKEN
#    Value: [your-token]
#    Environment: Production, Preview, Development
```

### Step 3: Update next.config.mjs

Replace the disabled configuration with:

```javascript
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: "medicis-gang",
  project: "farmers-market-prod",

  // Enable verbose logging for initial testing
  silent: false,

  // Source map configuration
  include: ".next",
  ignore: ["node_modules", ".next/cache"],
  urlPrefix: "~/_next",

  // Auto-detect source maps
  sourcemaps: {
    assets: [
      ".next/static/chunks/**",
      ".next/server/**",
      ".next/static/css/**",
    ],
    deleteAfterUpload: true, // Clean up after upload
  },

  // Error handling - log but don't fail build
  errorHandler: (err) => {
    console.warn("⚠️ Sentry upload warning:", err.message);
  },

  // Git integration
  setCommits: {
    auto: true,
    ignoreMissing: true,
    ignoreEmpty: true,
  },

  // Deployment tracking
  deploy: {
    env: process.env.VERCEL_ENV || "production",
  },

  // Release naming (uses git SHA from Vercel)
  release: {
    name: process.env.VERCEL_GIT_COMMIT_SHA,
  },

  // Auth token from environment
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload more source maps for better traces
  widenClientFileUpload: true,

  // Route browser requests through Next.js
  tunnelRoute: "/monitoring",

  // Keep source maps accessible to Sentry
  hideSourceMaps: false,

  // Webpack-specific configurations
  webpack: {
    treeshake: {
      removeDebugLogging: process.env.NODE_ENV === "production",
    },
    reactComponentAnnotation: {
      enabled: true,
    },
  },
});
```

### Step 4: Test Deployment

```bash
# Commit changes
git add next.config.mjs
git commit -m "feat: re-enable Sentry source map uploads"
git push origin master

# Monitor Vercel deployment logs
# Look for: "✓ Sentry source maps uploaded successfully"
```

### Step 5: Verify in Sentry

1. Trigger a test error after deployment
2. Go to Sentry dashboard → Issues
3. Click on the error
4. Check stack trace:
   - ✅ Should show original file names (e.g., `checkout.service.ts`)
   - ✅ Should show correct line numbers
   - ✅ Should show function names
   - ✅ Should show source code snippets

---

## Vercel Environment Variables

### Required Variables

```env
# Sentry DSN (public, safe to expose)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]

# Sentry Auth Token (SECRET - never commit!)
SENTRY_AUTH_TOKEN=sntrys_[your-secret-token]

# Sentry Organization
SENTRY_ORG=medicis-gang

# Sentry Project
SENTRY_PROJECT=farmers-market-prod

# Environment
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

### Setting Variables

**Via Vercel Dashboard**:
1. Project Settings → Environment Variables
2. Add each variable
3. Select environments: Production, Preview, Development
4. Save

**Via Vercel CLI**:
```bash
vercel env add SENTRY_AUTH_TOKEN
# Paste token when prompted
# Select: Production, Preview, Development
```

### Security Best Practices

- ✅ Store `SENTRY_AUTH_TOKEN` in Vercel secrets
- ✅ Never commit tokens to git
- ✅ Use different tokens for dev/staging/prod
- ✅ Rotate tokens periodically
- ✅ Use minimal required scopes
- ❌ Never expose tokens in logs
- ❌ Never share tokens between teams

---

## Testing Source Map Uploads

### Local Testing

Source map uploads only work during production builds:

```bash
# Set auth token locally (temporary)
export SENTRY_AUTH_TOKEN="your-token"

# Build with source map upload
npm run build

# Look for output:
# ✓ Sentry source maps uploaded successfully
# Release: [git-sha]
# Uploaded: 42 source maps
```

### Vercel Testing

1. **Deploy to Preview**:
   ```bash
   git push origin feature/test-sourcemaps
   ```

2. **Check Deployment Logs**:
   - Look for Sentry upload messages
   - Verify no 401 errors
   - Confirm source maps uploaded

3. **Trigger Test Error**:
   ```javascript
   // Add temporary error trigger
   if (typeof window !== 'undefined' && window.location.search.includes('test-sentry')) {
     throw new Error('Test error for source map verification');
   }
   ```

4. **Visit**: `https://your-preview-url.vercel.app?test-sentry=true`

5. **Check Sentry**:
   - Error should appear in dashboard
   - Stack trace should show original code
   - File names should be readable

---

## Troubleshooting

### Source Maps Not Uploading

**Symptom**: Build succeeds but no source maps in Sentry

**Solutions**:

1. **Check Token**:
   ```bash
   # Verify token is set in Vercel
   vercel env ls
   # Should show SENTRY_AUTH_TOKEN
   ```

2. **Check Token Scopes**:
   - Go to Sentry → Settings → Auth Tokens
   - Verify token has `project:releases` scope

3. **Check Organization/Project**:
   ```javascript
   // In next.config.mjs
   org: "medicis-gang",  // Must match your Sentry org
   project: "farmers-market-prod",  // Must match your Sentry project
   ```

4. **Enable Verbose Logging**:
   ```javascript
   silent: false,  // See upload progress
   ```

### 401 Unauthorized Errors

**Symptom**: `Invalid token (http status: 401)`

**Solutions**:

1. **Regenerate Token**: Old token may have expired
2. **Check Environment**: Token set for correct environment?
3. **Verify Scopes**: Token needs `project:releases` permission
4. **Check Organization**: Token belongs to correct Sentry org?

### Source Maps Not Applied to Errors

**Symptom**: Uploads work but errors still show minified code

**Solutions**:

1. **Check Release Matching**:
   ```javascript
   // Sentry config should use same release as runtime
   release: {
     name: process.env.VERCEL_GIT_COMMIT_SHA,
   },
   ```

2. **Verify Upload Path**:
   ```javascript
   urlPrefix: "~/_next",  // Must match actual URL structure
   ```

3. **Check Source Map Files**:
   ```javascript
   sourcemaps: {
     assets: [
       ".next/static/chunks/**",  // Include all relevant paths
       ".next/server/**",
     ],
   },
   ```

4. **Wait for Processing**: Source maps take 1-2 minutes to process

### Build Performance Issues

**Symptom**: Builds are slower after enabling uploads

**Solutions**:

1. **Delete After Upload**:
   ```javascript
   sourcemaps: {
     deleteAfterUpload: true,  // Clean up large files
   },
   ```

2. **Limit Upload Scope**:
   ```javascript
   ignore: [
     "node_modules",
     ".next/cache",
     ".next/static/chunks/framework-*",  // Ignore frameworks
   ],
   ```

3. **Optimize Asset Matching**:
   ```javascript
   sourcemaps: {
     assets: [
       ".next/static/chunks/pages/**",  // Only upload app code
       ".next/server/pages/**",
     ],
   },
   ```

---

## Quick Reference

### Current Status Check

```bash
# Check if source maps are enabled
grep -A 5 "sourcemaps:" next.config.mjs

# If you see:
sourcemaps: { disable: true }
# Then source maps are DISABLED

# If you see:
sourcemaps: { assets: [...] }
# Then source maps are ENABLED
```

### Re-Enable Checklist

- [ ] Get valid Sentry auth token
- [ ] Add `SENTRY_AUTH_TOKEN` to Vercel environment variables
- [ ] Update `next.config.mjs` with full configuration
- [ ] Commit and push changes
- [ ] Deploy and check logs for upload success
- [ ] Trigger test error
- [ ] Verify readable stack traces in Sentry
- [ ] Document token location for team
- [ ] Set up token rotation reminder

---

## Additional Resources

- **Sentry Source Maps Docs**: https://docs.sentry.io/platforms/javascript/sourcemaps/
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Sentry Auth Tokens**: https://docs.sentry.io/product/accounts/auth-tokens/

---

## Summary

**Current State**: Source maps disabled to fix deployment  
**Impact**: Sentry works, but stack traces show minified code  
**Next Action**: Get valid production token and re-enable  
**Priority**: Medium (after critical feature work)

When ready to re-enable:
1. Get token from Sentry dashboard
2. Add to Vercel environment variables
3. Update `next.config.mjs` with full config
4. Test deployment
5. Verify in Sentry dashboard

---

*Last Updated: January 2025*  
*Status: Source maps disabled, deployment fixed*