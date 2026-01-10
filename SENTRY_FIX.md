# 🔧 Sentry Source Maps Fix - Complete Guide
**Issue**: Sentry cannot auto-detect Turbopack source maps  
**Impact**: Production errors don't show line numbers  
**Fix Time**: 15 minutes  
**Difficulty**: Easy ⭐

---

## 🎯 The Problem

Your Vercel build log shows:
```
warning: could not determine a source map reference
(Could not auto-detect referenced sourcemap for ~/09f0cf9ff974ff87.js)
```

**Why this happens**: 
- Next.js 14+ uses Turbopack instead of Webpack
- Turbopack generates source maps differently
- Sentry CLI can't find them with default settings

---

## ✅ Solution: Update next.config.mjs

### **Step 1: Open `next.config.mjs`**

Find your current Sentry configuration and update it with these settings:

```javascript
// next.config.mjs
import { withSentryConfig } from "@sentry/nextjs";

// Your existing Next.js config
const nextConfig = {
  // ✅ ADD THIS: Enable source maps in production
  productionBrowserSourceMaps: true,
  
  // Your existing Turbopack config
  experimental: {
    turbo: {
      memoryBasedWorkersCount: true,
      optimizeCss: true,
      scrollRestoration: true,
      
      // ✅ ADD THIS: Ensure source maps are generated correctly
      rules: {
        "*.tsx": {
          loaders: ["@next/swc-loader"],
          as: "*.tsx",
        },
        "*.ts": {
          loaders: ["@next/swc-loader"],
          as: "*.ts",
        },
      },
    },
  },
  
  // ... rest of your config
};

// ✅ UPDATE THIS: Enhanced Sentry plugin options
const sentryWebpackPluginOptions = {
  org: "medicis-gang",
  project: "farmers-market-prod",
  
  // === CRITICAL FIXES FOR TURBOPACK ===
  
  // 1. Enable verbose logging
  silent: false,
  dryRun: false,
  
  // 2. Source map configuration
  include: ".next",
  ignore: ["node_modules", ".next/cache"],
  urlPrefix: "~/_next",
  
  // 3. Auto-detect source maps (KEY FIX)
  sourcemaps: {
    assets: [
      ".next/static/chunks/**",
      ".next/server/**",
      ".next/static/css/**",
    ],
    deleteAfterUpload: false, // Keep for debugging
    filesToDeleteAfterUpload: [],
  },
  
  // 4. Error handling
  errorHandler: (err, invokeErr, compilation) => {
    console.error("❌ Sentry upload error:", err.message);
    // Don't fail build on Sentry errors
    return false;
  },
  
  // 5. Git integration
  setCommits: {
    auto: true,
    ignoreMissing: true,
    ignoreEmpty: true,
  },
  
  // 6. Deployment tracking
  deploy: {
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || "production",
  },
  
  // 7. Release naming
  release: {
    name: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    uploadLegacySourcemaps: true,
  },
  
  // 8. Additional options
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: false, // Set to true to hide from DevTools
  widenClientFileUpload: true,
  disableLogger: false,
  
  // 9. Webpack-specific (for fallback compatibility)
  webpack: {
    hideSourceMaps: false,
  },
};

// Export with Sentry wrapper
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions, {
  // Build-time configuration options
  
  // Suppresses source map uploading logs during build
  silent: false,
  
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  
  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,
  
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
  
  // Hides source maps from generated client bundles
  hideSourceMaps: false,
  
  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },
  
  // Uncomment to route browser requests to Sentry through a Next.js rewrite
  // tunnelRoute: "/monitoring",
  
  // Uncomment to not send user IP addresses to Sentry
  // autoInstrumentServerFunctions: false,
});
```

---

## 🔐 Step 2: Verify Environment Variables

### **In Vercel Dashboard:**

Go to: **Project Settings → Environment Variables**

Ensure these are set:

```env
# Required
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENTRY_ORG=medicis-gang
SENTRY_PROJECT=farmers-market-prod

# Should already exist
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### **To get SENTRY_AUTH_TOKEN:**

1. Go to: https://sentry.io/settings/medicis-gang/auth-tokens/
2. Click "Create New Token"
3. Name: "Vercel Deployment"
4. Scopes required:
   - ✅ `project:read`
   - ✅ `project:write`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Copy the token and add to Vercel

---

## 🧪 Step 3: Test the Fix

### **Option A: Trigger a Deployment**

```bash
# Make a small change and commit
git add next.config.mjs
git commit -m "fix: enable Sentry source maps for Turbopack"
git push origin main
```

### **Option B: Manual Test**

Watch the Vercel build log for:

✅ **Success indicators:**
```
Creating an optimized production build ...
✓ Compiled successfully
Sentry: Creating release...
Sentry: Uploading source maps...
✓ Source maps uploaded to Sentry
```

❌ **If still failing:**
```
warning: could not determine a source map reference
```

---

## 🔍 Step 4: Verify in Sentry

### **Test Error Tracking:**

1. Add a test error to your code:
```typescript
// In any page or API route
if (typeof window !== 'undefined') {
  // Client-side test error
  setTimeout(() => {
    throw new Error('TEST: Sentry source map verification');
  }, 2000);
}
```

2. Deploy to production
3. Visit the page
4. Check Sentry: https://sentry.io/organizations/medicis-gang/issues/

### **What to look for:**

✅ **Working correctly:**
```
Error: TEST: Sentry source map verification
  at HomePage (app/page.tsx:42:11)  ← Shows ACTUAL line numbers!
  at renderWithHooks (react-dom.js:123:45)
```

❌ **Still broken:**
```
Error: TEST: Sentry source map verification
  at HomePage (09f0cf9ff974ff87.js:1:1234)  ← Minified, no line numbers
```

---

## 🐛 Troubleshooting

### **Issue 1: Source maps still not uploading**

**Check build logs for:**
```
Sentry CLI not found
```

**Fix:**
```bash
npm install @sentry/nextjs@latest
```

---

### **Issue 2: Auth token not working**

**Error in logs:**
```
401 Unauthorized
```

**Fix:**
1. Regenerate token in Sentry with correct scopes
2. Update in Vercel environment variables
3. Redeploy

---

### **Issue 3: Wrong organization/project**

**Error in logs:**
```
Project not found: medicis-gang/farmers-market-prod
```

**Fix:**
Verify in Sentry dashboard:
- Organization slug: `medicis-gang`
- Project slug: `farmers-market-prod`

Update in `next.config.mjs` if different.

---

## 📊 Expected Results

### **Before Fix:**
- ❌ Errors show minified code: `09f0cf9ff974ff87.js:1:1234`
- ❌ No file names or line numbers
- ❌ Debugging is nearly impossible

### **After Fix:**
- ✅ Errors show actual files: `app/page.tsx:42`
- ✅ Full stack traces with line numbers
- ✅ Easy to debug production issues

---

## 🎯 Alternative: Manual Upload Script

If automatic upload still fails, use manual upload as fallback:

```javascript
// scripts/upload-sourcemaps.js
const { exec } = require('child_process');

const release = process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
const org = 'medicis-gang';
const project = 'farmers-market-prod';

exec(`
  sentry-cli sourcemaps upload \\
    --org ${org} \\
    --project ${project} \\
    --release ${release} \\
    --url-prefix "~/_next" \\
    --validate \\
    .next/static/chunks
`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Source map upload failed:', error);
    return;
  }
  console.log('✅ Source maps uploaded:', stdout);
});
```

Add to `package.json`:
```json
{
  "scripts": {
    "sentry:sourcemaps": "node scripts/upload-sourcemaps.js"
  }
}
```

---

## 📚 References

- **Sentry Next.js Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Source Maps Guide**: https://docs.sentry.io/platforms/javascript/sourcemaps/
- **Turbopack Issues**: https://github.com/vercel/next.js/discussions/48748
- **Sentry CLI**: https://docs.sentry.io/product/cli/

---

## ✅ Checklist

- [ ] Updated `next.config.mjs` with new Sentry configuration
- [ ] Added `productionBrowserSourceMaps: true`
- [ ] Configured `sourcemaps` object in Sentry options
- [ ] Verified `SENTRY_AUTH_TOKEN` in Vercel
- [ ] Verified `SENTRY_ORG` and `SENTRY_PROJECT` in Vercel
- [ ] Committed and pushed changes
- [ ] Monitored Vercel build logs for "Source maps uploaded"
- [ ] Tested with intentional error in production
- [ ] Verified error shows line numbers in Sentry dashboard
- [ ] Removed test error from code

---

**Status**: Ready to implement ✅  
**Risk Level**: Low (safe to deploy)  
**Rollback**: Simply revert commit if issues occur  
**Support**: Check Sentry docs or Vercel logs for errors