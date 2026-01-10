# 🔐 Vercel Environment Variables Checklist
**Farmers Market Platform - Production Deployment**  
**Date**: January 10, 2025

---

## 🎯 Required Sentry Environment Variables

These environment variables **MUST** be set in your Vercel project for Sentry source maps to work:

### **Go to Vercel Dashboard:**
1. Open: https://vercel.com/dashboard
2. Select your project: **Farmers Market Platform**
3. Go to: **Settings → Environment Variables**

---

## ✅ Required Variables

### **1. SENTRY_AUTH_TOKEN** 🔴 **CRITICAL**
```
Variable Name: SENTRY_AUTH_TOKEN
Value: sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environment: Production, Preview, Development (all)
```

**How to get this:**
1. Go to: https://sentry.io/settings/medicis-gang/auth-tokens/
2. Click **"Create New Token"**
3. Name: `Vercel Deployment`
4. **Required Scopes:**
   - ✅ `project:read`
   - ✅ `project:write`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click **"Create Token"**
6. Copy the token (starts with `sntrys_`)
7. Paste into Vercel environment variables

⚠️ **Important**: This token is only shown ONCE. Save it securely!

---

### **2. SENTRY_ORG**
```
Variable Name: SENTRY_ORG
Value: medicis-gang
Environment: Production, Preview, Development (all)
```

---

### **3. SENTRY_PROJECT**
```
Variable Name: SENTRY_PROJECT
Value: farmers-market-prod
Environment: Production, Preview, Development (all)
```

---

### **4. NEXT_PUBLIC_SENTRY_DSN** (Should already exist)
```
Variable Name: NEXT_PUBLIC_SENTRY_DSN
Value: https://xxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx
Environment: Production, Preview, Development (all)
```

**How to get this:**
1. Go to: https://sentry.io/organizations/medicis-gang/projects/
2. Click on **farmers-market-prod**
3. Go to: **Settings → Client Keys (DSN)**
4. Copy the **DSN** value

---

### **5. SENTRY_DSN** (Server-side)
```
Variable Name: SENTRY_DSN
Value: (same as NEXT_PUBLIC_SENTRY_DSN)
Environment: Production, Preview, Development (all)
```

---

## 📋 Complete Checklist

### **In Vercel Dashboard:**

- [ ] Navigate to project settings
- [ ] Go to **Environment Variables** tab
- [ ] Verify/Add **SENTRY_AUTH_TOKEN**
  - [ ] Value starts with `sntrys_`
  - [ ] Has all required scopes (project:read, project:write, project:releases, org:read)
  - [ ] Applied to: Production ✓
  - [ ] Applied to: Preview ✓
  - [ ] Applied to: Development ✓
- [ ] Verify/Add **SENTRY_ORG** = `medicis-gang`
- [ ] Verify/Add **SENTRY_PROJECT** = `farmers-market-prod`
- [ ] Verify **NEXT_PUBLIC_SENTRY_DSN** exists
- [ ] Verify **SENTRY_DSN** exists (same value as NEXT_PUBLIC_SENTRY_DSN)

---

## 🧪 Testing After Setup

### **1. Redeploy to trigger build:**
```bash
git add next.config.mjs
git commit -m "fix: enable Sentry source maps for Turbopack"
git push origin main
```

### **2. Watch Vercel Build Logs**

Look for these success indicators:

✅ **Success:**
```
Creating an optimized production build ...
✓ Compiled successfully
Sentry: Creating release...
Sentry: Uploading source maps...
✓ Source maps uploaded to Sentry
```

❌ **If you see this (means auth token is missing):**
```
Error: SENTRY_AUTH_TOKEN is not set
```
→ Go back and add the auth token in Vercel

❌ **If you see this (means wrong credentials):**
```
401 Unauthorized
```
→ Regenerate the Sentry auth token with correct scopes

---

## 🔍 Verify in Sentry Dashboard

### **After successful deployment:**

1. Go to: https://sentry.io/organizations/medicis-gang/releases/
2. Look for your latest release (should match `VERCEL_GIT_COMMIT_SHA`)
3. Click on the release
4. Check **"Artifacts"** tab
5. You should see source maps listed:
   ```
   ~/static/chunks/[hash].js
   ~/static/chunks/[hash].js.map
   ```

---

## 🐛 Test Error Tracking

### **Create a test error:**

Add this to any page temporarily:
```typescript
// app/page.tsx (or any client component)
'use client';

useEffect(() => {
  setTimeout(() => {
    throw new Error('TEST: Sentry source map verification - DELETE ME');
  }, 2000);
}, []);
```

### **Verify in Sentry:**

1. Deploy the change
2. Visit the page in production
3. Go to: https://sentry.io/organizations/medicis-gang/issues/
4. Find the test error
5. Click on it

**✅ Success - Source maps working:**
```
Error: TEST: Sentry source map verification
  at HomePage (app/page.tsx:42:11)  ← Shows ACTUAL file and line!
  at renderWithHooks (react-dom.js:123:45)
```

**❌ Failure - Source maps not working:**
```
Error: TEST: Sentry source map verification
  at HomePage (09f0cf9ff974ff87.js:1:1234)  ← Minified, no line numbers
```

### **Clean up:**
```bash
# Remove the test error
git add app/page.tsx
git commit -m "chore: remove Sentry test error"
git push
```

---

## 🆘 Troubleshooting

### **Problem: "SENTRY_AUTH_TOKEN is not set"**
**Solution**: Add the auth token in Vercel environment variables (see step 1 above)

---

### **Problem: "401 Unauthorized"**
**Solution**: 
1. Regenerate token in Sentry with correct scopes
2. Update in Vercel
3. Redeploy

---

### **Problem: "Organization not found: medicis-gang"**
**Solution**: 
1. Verify organization slug in Sentry dashboard
2. Update `SENTRY_ORG` if different
3. Update `next.config.mjs` org value if needed

---

### **Problem: "Project not found: farmers-market-prod"**
**Solution**: 
1. Verify project slug in Sentry dashboard
2. Update `SENTRY_PROJECT` if different
3. Update `next.config.mjs` project value if needed

---

### **Problem: Source maps still not uploading**
**Check build logs for specific error message:**
- Missing auth token → Add to Vercel
- Wrong org/project → Update values
- Network error → Retry deployment
- File not found → Check `.next` directory structure

---

## 📊 Expected Results After Fix

| Metric | Before | After |
|--------|--------|-------|
| **Error Visibility** | ❌ Minified code only | ✅ Full file paths & line numbers |
| **Debug Time** | 🐌 30+ minutes | ⚡ 2-3 minutes |
| **Production Confidence** | 😰 Blind debugging | 😎 Full visibility |
| **Stack Traces** | Useless | Actionable |

---

## 🎉 Success Criteria

You'll know it's working when:

- ✅ Vercel build shows "Source maps uploaded to Sentry"
- ✅ Sentry releases page shows your latest deployment
- ✅ Sentry issues show actual file names (not minified)
- ✅ Stack traces point to exact line numbers
- ✅ No warnings in Vercel build logs about source maps

---

## 📞 Support

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Vercel Env Vars**: https://vercel.com/docs/concepts/projects/environment-variables
- **Sentry Auth Tokens**: https://docs.sentry.io/product/accounts/auth-tokens/

---

**Status**: Ready for verification ✅  
**Estimated Time**: 5 minutes to set up  
**Priority**: CRITICAL 🔴