# 🔍 Vercel Deployment Monitoring Guide

**Farmers Market Platform - Build Optimization Deployment**  
**Commit:** `1c7aa4ab`  
**Status:** 🚀 **DEPLOYING**  
**Time:** ~5-10 minutes

---

## 📋 Real-Time Monitoring Checklist

### **Step 1: Vercel Dashboard (Immediate)**

**URL:** https://vercel.com/dashboard

**What to check:**
- [ ] Deployment appears in "Deployments" tab
- [ ] Status shows "Building" → "Deploying" → "Ready"
- [ ] Build logs are accessible (click deployment)
- [ ] No critical errors in build output

**Expected build time:** 1:30-1:45 minutes (down from 2:00)

---

### **Step 2: Build Logs Analysis**

**Click on deployment → "View Function Logs" or "Build Logs"**

#### **✅ SUCCESS INDICATORS:**

```
✅ No "Invalid next.config.mjs options detected"
✅ No "engines: { node: '>=20.x' } will auto-upgrade"
✅ No "[@sentry/nextjs] DEPRECATION WARNING: disableLogger"
✅ No "[@sentry/nextjs] DEPRECATION WARNING: reactComponentAnnotation"
✅ Build completes successfully
✅ Cache upload ~220-250 MB (down from 337 MB)
```

#### **⚠️ EXPECTED WARNINGS (IGNORE THESE):**

```
⚠️ "could not determine a source map reference"
   → 250+ warnings for *_client-reference-manifest.js files
   → THIS IS NORMAL - These are React Server Component metadata
   → Your actual page chunks (.js files) have source maps
   → Action: No fix needed
```

#### **❌ FAILURE INDICATORS:**

```
❌ Build fails with TypeScript errors
❌ Build fails with dependency errors
❌ Deployment shows "Error" status
❌ Site returns 500 errors
```

**If failure occurs:** See "Emergency Rollback" section below

---

### **Step 3: Sentry Source Maps Verification**

**URL:** https://sentry.io/organizations/medicis-gang/releases/

**Wait:** 2-3 minutes after deployment completes

**Steps:**
1. [ ] Find release with commit SHA `1c7aa4ab`
2. [ ] Click on the release
3. [ ] Navigate to "Artifacts" tab
4. [ ] Verify `.js.map` files are present (should see 50-100+)
5. [ ] Check file sizes (should be reasonable, not 0 bytes)

**Expected artifacts:**
- `.next/static/chunks/**/*.js.map`
- `.next/server/**/*.js.map`
- `.next/static/css/**/*.css.map`

**What success looks like:**
```
✅ 50-100+ source map artifacts uploaded
✅ File sizes: 10KB - 500KB each
✅ Upload timestamp matches deployment time
✅ Release status: "Active"
```

---

### **Step 4: Production Site Testing**

**URL:** Your production URL (e.g., https://farmers-market.vercel.app)

**Basic checks:**
- [ ] Homepage loads without errors
- [ ] Navigation works (click around)
- [ ] Images load correctly
- [ ] No console errors (F12 → Console tab)
- [ ] API endpoints respond (if applicable)

**Advanced checks:**
- [ ] Test user authentication/login
- [ ] Test creating/viewing a farm
- [ ] Test adding products to cart
- [ ] Test checkout flow (if safe to do so)

---

### **Step 5: Sentry Error Tracking Test**

**Optional but recommended:**

1. Open browser console (F12) on your production site
2. Run test error:
   ```javascript
   throw new Error("Test error - Sentry verification [" + new Date().toISOString() + "]");
   ```
3. Go to Sentry → Issues
4. Find your test error (should appear within 30 seconds)
5. Click on the error
6. **Verify:**
   - [ ] Stack trace shows real file names (not minified)
   - [ ] Line numbers are accurate
   - [ ] Can click through to source code view
   - [ ] Context shows variable values

**Success example:**
```
Error: Test error - Sentry verification
  at HomePage (app/page.tsx:42:11)
  at Component (components/Layout.tsx:156:9)
```

**Failure example (before fix):**
```
Error: Test error
  at a (chunk-ABC123.js:1:234)
  at b (chunk-DEF456.js:1:567)
```

---

## 📊 Performance Metrics Tracking

### **Build Time Comparison**

| Metric | Before | Target | Actual | Status |
|--------|--------|--------|--------|--------|
| Build Duration | 2:00 min | 1:30-1:45 min | ___ min | ⬜ |
| Cache Upload | 337 MB | ~220 MB | ___ MB | ⬜ |
| Config Warnings | 5 | 0 | ___ | ⬜ |
| Deprecation Warnings | 2 | 0 | ___ | ⬜ |

**How to find actual values:**
1. Check Vercel build logs
2. Look for "Build Duration" at end
3. Find "Cache upload" size in logs
4. Count warnings (Ctrl+F "warning")

---

## 🚨 Troubleshooting

### **Issue: Build takes longer than expected (>2:30)**

**Possible causes:**
- First build after config changes (cache rebuild)
- Vercel platform issues
- Network latency

**Actions:**
1. Wait for completion (first build can be slower)
2. Check Vercel status page: https://www.vercel-status.com/
3. If >5 minutes, contact Vercel support

---

### **Issue: Still seeing deprecation warnings**

**Possible causes:**
- Vercel cache not cleared
- Changes didn't deploy correctly
- Old build artifacts

**Actions:**
1. Verify commit `1c7aa4ab` is the one being deployed
2. Check GitHub that changes are in master branch
3. Clear Vercel build cache:
   - Settings → General → Clear Build Cache
4. Trigger new deployment

---

### **Issue: Sentry not uploading source maps**

**Possible causes:**
- `SENTRY_AUTH_TOKEN` not set in Vercel
- Sentry project settings incorrect
- Network issues during upload

**Actions:**
1. Verify environment variables in Vercel:
   - Settings → Environment Variables
   - Check: `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`
2. Review build logs for Sentry upload section
3. Look for errors like "Authentication failed" or "Project not found"
4. See [SENTRY_FIX.md](./SENTRY_FIX.md) for detailed troubleshooting

---

### **Issue: Production site returns errors**

**Possible causes:**
- Database connection issues
- Missing environment variables
- Breaking changes in code

**Actions:**
1. Check Vercel Function Logs for error details
2. Verify all environment variables are set
3. Test specific API endpoints directly
4. Consider rollback (see below)

---

## 🔄 Emergency Rollback Procedure

**If deployment causes critical issues:**

### **Option 1: Vercel Dashboard (Fastest)**
1. Go to Vercel → Deployments
2. Find previous successful deployment (before `1c7aa4ab`)
3. Click "⋯" menu
4. Select "Promote to Production"
5. Wait 30 seconds for rollback

### **Option 2: Git Revert (Recommended)**
```bash
git revert HEAD
git push origin master
```
This creates a new commit that undoes changes (preserves history)

### **Option 3: Hard Reset (Emergency Only)**
```bash
git reset --hard 825d1c97  # Previous commit
git push --force origin master
```
⚠️ **Warning:** This rewrites history - use only if absolutely necessary

---

## ✅ Success Checklist

Mark each item as you verify:

### **Build & Deployment**
- [ ] Vercel deployment status: "Ready"
- [ ] Build completed in 1:30-1:45 minutes
- [ ] No config warnings in logs
- [ ] No deprecation warnings in logs
- [ ] Cache upload ~220-250 MB

### **Sentry Integration**
- [ ] Release appears in Sentry dashboard
- [ ] 50-100+ source map artifacts uploaded
- [ ] Test error shows proper stack trace
- [ ] Line numbers are accurate
- [ ] Can navigate to source code

### **Production Site**
- [ ] Homepage loads successfully
- [ ] Navigation works correctly
- [ ] No console errors
- [ ] Images load properly
- [ ] API endpoints respond

### **Performance**
- [ ] Build time reduced (vs. previous)
- [ ] Cache size reduced (vs. previous)
- [ ] Site loads quickly
- [ ] No degradation in user experience

---

## 📈 Expected Improvements

### **What You Should See:**

✅ **Build Logs:**
```
Building...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (123/123)
✓ Collecting build traces
✓ Finalizing page optimization

Build completed in 1m 34s
Cache upload: 224.5 MB
```

✅ **Sentry Artifacts:**
```
Release: 1c7aa4ab
Artifacts: 87 source maps
Total size: 12.4 MB
Status: Active
```

✅ **Performance:**
```
Build time: -25% (2:00 → 1:30)
Cache size: -35% (337 MB → 220 MB)
Warnings: -100% (5 → 0 config/deprecation)
```

---

## 📞 Support & Next Steps

### **If Everything Looks Good:**
1. ✅ Mark all checklist items complete
2. ✅ Document actual metrics in tracking table
3. ✅ Notify team of successful optimization
4. ✅ Monitor for 24 hours for any issues
5. ✅ Update this document with actual results

### **If Issues Occur:**
1. Document the issue in detail
2. Check troubleshooting section
3. Review full documentation:
   - [VERCEL_BUILD_OPTIMIZATION.md](./VERCEL_BUILD_OPTIMIZATION.md)
   - [DEPLOY_BUILD_FIXES.md](./DEPLOY_BUILD_FIXES.md)
4. Consider rollback if critical
5. Seek additional help if needed

---

## 📊 Post-Deployment Metrics

**Fill in after 24 hours:**

| Metric | Value | Status |
|--------|-------|--------|
| **Build Success Rate** | ___% | ⬜ |
| **Average Build Time** | ___ min | ⬜ |
| **Cache Hit Rate** | ___% | ⬜ |
| **Error Rate (24h)** | ___% | ⬜ |
| **Sentry Events Tracked** | ___ | ⬜ |
| **Production Incidents** | ___ | ⬜ |

---

## 🎉 Deployment Complete Criteria

**Your deployment is SUCCESSFUL when:**

✅ All checklist items marked complete  
✅ Build time is 1:30-1:45 minutes  
✅ Cache size is ~220-250 MB  
✅ Zero config/deprecation warnings  
✅ Sentry has 50-100+ source map artifacts  
✅ Production site loads correctly  
✅ Test error shows proper stack traces  
✅ No critical issues for 24 hours

---

**Deployment Started:** ___________  
**Deployment Completed:** ___________  
**Verified By:** ___________  
**Status:** 🚀 Monitoring in Progress

---

## 🔗 Related Documentation

- [BUILD_OPTIMIZATION_SUMMARY.md](./BUILD_OPTIMIZATION_SUMMARY.md) - Executive summary
- [VERCEL_BUILD_OPTIMIZATION.md](./VERCEL_BUILD_OPTIMIZATION.md) - Technical details
- [DEPLOY_BUILD_FIXES.md](./DEPLOY_BUILD_FIXES.md) - Deployment guide
- [SENTRY_FIX.md](./SENTRY_FIX.md) - Sentry configuration

---

**Last Updated:** January 2025  
**Monitoring Duration:** 24 hours minimum  
**Next Review:** After 24 hours of stable operation