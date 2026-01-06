# 🚨 Deployment Troubleshooting Guide

**Last Updated**: January 6, 2026
**Deployment ID**: `57q73Xv7B` (Production - Current)
**Status**: Ready but Missing Files

---

## 📊 Current Situation

### ✅ What's Working
- ✓ NextAuth session endpoint (`/api/auth/session`)
- ✓ Auth providers endpoint (`/api/auth/providers`)
- ✓ Auth CSRF token generation (`/api/auth/csrf`)
- ✓ Deployment marked as "Ready" on Vercel

### ❌ What's Broken
- ✗ Health endpoint returning 404 (`/api/health`)
- ✗ Homepage returning 500 error (`/`)
- ✗ Farms API returning 500 error (`/api/farms`)
- ✗ Products API returning 500 error (`/api/products`)
- ✗ Favicon missing (404)

### 🔍 Root Cause
The current production deployment (`57q73Xv7B`) was built **BEFORE** the health endpoint was added in commit `dc77cf89`. The deployment needs to be refreshed to include recent changes.

---

## 🛠️ Troubleshooting Steps

### Step 1: Verify GitHub-Vercel Integration

**Check if auto-deployments are enabled:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `farmers-market-platform` project
3. Go to **Settings** → **Git**
4. Verify:
   - ✓ Production Branch: `master`
   - ✓ Auto-deploy for Production Branch: **Enabled**
   - ✓ GitHub App installed and connected

**If auto-deploy is disabled:**
- Enable it in Settings → Git → Production Branch
- Save changes

### Step 2: Manual Deployment Options

#### Option A: Redeploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Deployments](https://vercel.com/gogsias-projects/farmers-market-platform)
2. Find the latest deployment
3. Click the **three dots (...)** menu
4. Select **Redeploy**
5. Choose **Use existing Build Cache: No** (force fresh build)
6. Click **Redeploy**

#### Option B: Trigger via Git (Already Attempted)

```bash
# Create empty commit to trigger deployment
git commit --allow-empty -m "chore: trigger deployment"
git push origin master
```

**Status**: Attempted on 2026-01-06, but webhook did not trigger new deployment.

#### Option C: Vercel CLI Deployment (Requires Permissions)

```bash
# Deploy to production
npx vercel --prod

# If you get permission errors, contact team admin
```

**Note**: Currently blocked by permission error:
```
Error: Git author must have access to the team on Vercel
```

#### Option D: GitHub Actions Workflow (Future Solution)

Create `.github/workflows/vercel-deploy.yml`:

```yaml
name: Vercel Production Deployment
on:
  push:
    branches: [master]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Step 3: Verify Environment Variables

Even after redeployment, ensure all environment variables are set:

```bash
# Check production environment variables
./scripts/check-vercel-env.sh production

# Or via Vercel CLI
npx vercel env ls production
```

**Required Variables:**
- `DATABASE_URL` (Vercel Postgres connection string)
- `NEXTAUTH_SECRET` (secure random string)
- `NEXTAUTH_URL` (https://farmers-market-platform.vercel.app)
- `ENABLE_TRACING` (false for production)

**Optional but Recommended:**
- `NODE_ENV` (production)
- `NEXT_PUBLIC_APP_URL` (https://farmers-market-platform.vercel.app)
- `SENTRY_DSN` (if using Sentry)
- `STRIPE_SECRET_KEY` (if using Stripe)

### Step 4: Monitor New Deployment

Once deployment is triggered:

```bash
# Watch deployment status
npx vercel ls --scope gogsias-projects

# Check specific deployment
npx vercel inspect <deployment-url>

# View runtime logs
npx vercel logs <deployment-url>
```

### Step 5: Verify Production Health

After deployment completes:

```bash
# Run comprehensive verification
./scripts/verify-production.sh

# Or manually test endpoints
curl https://farmers-market-platform.vercel.app/api/health
curl https://farmers-market-platform.vercel.app/
curl https://farmers-market-platform.vercel.app/api/farms
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Webhook Not Triggering

**Symptoms:**
- Push to master doesn't create new deployment
- No new entries in Vercel deployments list

**Solutions:**
1. Check GitHub webhook delivery in repo settings:
   - Go to GitHub repo → Settings → Webhooks
   - Find Vercel webhook
   - Check recent deliveries for errors
   - Click "Redeliver" if needed

2. Reinstall GitHub integration:
   - Vercel Dashboard → Settings → Git
   - Disconnect GitHub
   - Reconnect and authorize

3. Manual redeploy via dashboard (Option A above)

### Issue 2: Build Cache Issues

**Symptoms:**
- New code not reflected in deployment
- Old files still serving

**Solutions:**
1. Force fresh build (no cache):
   - Dashboard redeploy with "Use existing Build Cache: No"

2. Clear build cache via CLI:
   ```bash
   npx vercel --prod --force
   ```

3. Add build timestamp to force rebuild:
   ```bash
   echo "BUILD_TIME=$(date +%s)" >> .env.production
   git commit -am "chore: force rebuild"
   git push
   ```

### Issue 3: Missing Files in Deployment

**Symptoms:**
- 404 errors for routes that exist in code
- Files present locally but not in production

**Solutions:**
1. Verify files are committed:
   ```bash
   git ls-files src/app/api/health/route.ts
   ```

2. Check `.vercelignore` doesn't exclude files:
   ```bash
   cat .vercelignore
   ```

3. Verify Next.js app directory structure:
   ```
   src/app/
   ├── api/
   │   ├── health/
   │   │   └── route.ts    ← Must be named 'route.ts'
   ```

4. Check build output includes route:
   ```bash
   # After local build
   npm run build
   ls -la .next/server/app/api/health/
   ```

### Issue 4: Runtime 500 Errors

**Symptoms:**
- Endpoints return 500 status
- "Application error" message
- API returns error status but empty/incomplete data

**Solutions:**
1. Check runtime logs immediately:
   ```bash
   npx vercel logs https://farmers-market-platform.vercel.app
   ```

2. Verify database connection:
   - Ensure `DATABASE_URL` is set and correct
   - Check database is accessible (IP allowlist, credentials)
   - Test connection from Vercel serverless function region

3. Check environment variable format:
   ```bash
   # DATABASE_URL should be in correct format
   postgresql://user:pass@host:5432/dbname?sslmode=require
   ```

4. Enable debug logging temporarily:
   ```bash
   npx vercel env add DEBUG production
   # Value: "*" or "prisma:*"
   ```

### Issue 5: Permission Errors

**Symptoms:**
```
Error: Git author must have access to the team
```

**Solutions:**
1. Verify team membership:
   - Vercel Dashboard → Settings → Members
   - Ensure your account is listed

2. Contact team owner to grant access

3. Use personal account instead of team:
   ```bash
   npx vercel --scope your-personal-username
   ```

4. Use Vercel dashboard manual redeploy (doesn't require CLI permissions)

---

## 📋 Verification Checklist

After each deployment attempt:

- [ ] New deployment appears in `npx vercel ls`
- [ ] Deployment status shows "Ready" (not "Error")
- [ ] Health endpoint returns 200: `curl /api/health`
- [ ] Homepage loads without 500: `curl /`
- [ ] API endpoints return data: `curl /api/farms`
- [ ] No errors in runtime logs: `npx vercel logs`
- [ ] All environment variables present: `./scripts/check-vercel-env.sh`
- [ ] Database connection working (check health endpoint response)
- [ ] Auth system functional: `curl /api/auth/session`

---

## 🎯 Quick Command Reference

```bash
# Check deployments
npx vercel ls --scope gogsias-projects

# Inspect specific deployment
npx vercel inspect dpl_57q73Xv7BTrne7hsNkaWQZEXsTEq

# View logs
npx vercel logs https://farmers-market-platform.vercel.app

# Test production endpoints
./scripts/verify-production.sh

# Check environment variables
./scripts/check-vercel-env.sh production
npx vercel env ls production

# Manual deployment (if permissions allow)
npx vercel --prod

# Force rebuild
npx vercel --prod --force

# Deploy specific branch
npx vercel --prod --branch master
```

---

## 📞 When to Escalate

Contact Vercel support if:
- Deployments consistently fail after 3+ attempts
- Webhook deliveries show errors in GitHub
- Build cache cannot be cleared
- Permission issues persist after team owner verification
- Database connectivity issues from Vercel regions
- Deployment takes longer than 10 minutes

**Vercel Support**: support@vercel.com
**Documentation**: https://vercel.com/docs/deployments/troubleshoot

---

## 📚 Related Documentation

- [Vercel Deployment Issues](./DEPLOYMENT_FIX_CHECKLIST.md)
- [Environment Variables Setup](./ADD_ENV_VARS.md)
- [Build Fixes Applied](./VERCEL_BUILD_FIXES.md)
- [Next Steps Guide](./NEXT_STEPS.md)

---

## 🔄 Status Updates

### 2026-01-06 01:30 UTC
- **Action**: Pushed commit `6801d3ea` to trigger deployment
- **Expected**: New deployment to appear in 2-5 minutes
- **Actual**: No new deployment triggered after 90+ seconds
- **Next**: Manual redeploy via Vercel dashboard required

### Awaiting Update
- [ ] Manual redeploy initiated
- [ ] New deployment URL: _______________
- [ ] Verification script passed
- [ ] Production fully operational

---

**Remember**: The fastest solution is usually **Option A: Manual Redeploy via Vercel Dashboard** ✨
