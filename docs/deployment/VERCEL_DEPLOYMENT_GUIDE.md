# 🚀 Vercel Deployment Guide - Farmers Market Platform

**Last Updated:** December 2024  
**Status:** Production Ready ✅  
**Current Vercel Project:** `farmers-market` (gogsias-projects)

---

## 📊 Current Deployment Status

```yaml
Project ID: prj_Pu6Yt5RBgMQMivgovJKNJvAXmPkP
Organization: gogsias-projects
Project Name: farmers-market
GitHub Repo: gogsia86/farmers-market
Branch: master

Production Deployments:
  Status: ✅ Ready (4 days ago)
  URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app
  Build Time: 4-5 minutes
  Last Successful: 4 days ago

Recent Preview Deployments:
  Status: ❌ Error
  Issue: Build failures in preview environment
  Action Required: See troubleshooting section
```

---

## 🎯 Quick Deploy (Recommended Method)

Since your GitHub repo is already connected to Vercel, deployments happen automatically:

### Method 1: Automatic Deployment (Easiest)

```bash
# 1. Ensure all changes are committed and pushed
git add -A
git commit -m "feat: your feature description"
git push origin master

# 2. Vercel automatically deploys master branch to production
# Monitor at: https://vercel.com/gogsias-projects/farmers-market
```

**Deployment Flow:**

1. Push to `master` → Triggers production build
2. Push to other branches → Triggers preview build
3. Open PR → Creates preview deployment with unique URL

---

## 🛠️ Manual Deployment via CLI

If automatic deployment fails, use CLI:

### Prerequisites

```bash
# Verify Vercel CLI is installed
vercel --version
# Should show: Vercel CLI 48.9.0 or higher

# Login to Vercel (if not already)
vercel login
```

### Deploy to Production

```bash
# Option A: Deploy with automatic promotion to production
vercel --prod

# Option B: Deploy to preview first, then promote
vercel                    # Deploy to preview
vercel promote <url>      # Promote preview to production
```

### Deploy to Preview/Staging

```bash
# Deploy to preview environment (for testing)
vercel

# Deploy specific branch
git checkout feature-branch
vercel
```

---

## 🔧 Environment Variables Setup

### Required Variables (MUST SET IN VERCEL DASHBOARD)

Navigate to: `Vercel Dashboard → farmers-market → Settings → Environment Variables`

#### 1. Database Configuration

```bash
# Production Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# Alternative: Use Vercel Postgres
# Vercel Dashboard → Storage → Create Postgres Database
```

#### 2. Authentication (NextAuth v5)

```bash
# REQUIRED - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters

# REQUIRED - Your production domain
NEXTAUTH_URL=https://your-production-domain.vercel.app

# Auth providers (if using OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
```

#### 3. Payment Processing (Stripe)

```bash
# REQUIRED for payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# For testing (use test keys)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### 4. Email Service

```bash
# SMTP Configuration (for order confirmations, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

#### 5. File Storage (Optional)

```bash
# AWS S3 (for product images)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Or use Vercel Blob Storage
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

#### 6. Monitoring & Analytics

```bash
# Sentry (Error Tracking)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-sentry-token

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics
NEXT_PUBLIC_GA_ID=G-...
```

#### 7. Redis/Caching (Optional but Recommended)

```bash
# Upstash Redis (for caching)
REDIS_URL=redis://...
REDIS_TOKEN=your-redis-token

# Or Vercel KV
# KV_REST_API_URL=https://...
# KV_REST_API_TOKEN=...
```

---

## 📋 Pre-Deployment Checklist

### Before Every Deployment

- [ ] ✅ All tests passing (`npm test`)
- [ ] ✅ TypeScript compiles (`npx tsc --noEmit`)
- [ ] ✅ ESLint passing (`npm run lint`)
- [ ] ✅ Build succeeds locally (`npm run build`)
- [ ] ✅ Environment variables set in Vercel
- [ ] ✅ Database migrations applied (`npm run db:push` or `prisma migrate deploy`)
- [ ] ✅ Latest code pushed to GitHub
- [ ] ✅ No console errors in browser
- [ ] ✅ API routes tested

### First-Time Deployment Only

- [ ] Domain configured (Vercel Dashboard → Domains)
- [ ] SSL certificate active (automatic via Vercel)
- [ ] Database created and accessible
- [ ] Stripe webhooks configured
- [ ] Email service tested
- [ ] File storage bucket created
- [ ] Monitoring tools connected

---

## 🔍 Troubleshooting Recent Deployment Errors

### Issue: Preview Deployments Failing (Current)

**Symptoms:**

```
Status: ● Error
Recent deployments: All preview builds failing
Production deployments: Working (4 days ago)
```

**Possible Causes & Fixes:**

#### 1. Environment Variable Missing

```bash
# Check Vercel Dashboard → Environment Variables
# Ensure all required vars are set for "Preview" environment
# Common issue: DATABASE_URL only set for Production
```

**Fix:**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. For each variable, check "Preview" checkbox in addition to "Production"
3. Redeploy

#### 2. Build Command Issues

**Check `vercel.json` build command:**

```json
{
  "buildCommand": "npm run vercel-build"
}
```

**Verify script exists in `package.json`:**

```json
{
  "scripts": {
    "vercel-build": "bash scripts/vercel-build.sh || (prisma generate && next build)"
  }
}
```

**Fix:** Ensure `scripts/vercel-build.sh` is executable:

```bash
chmod +x scripts/vercel-build.sh
git add scripts/vercel-build.sh
git commit -m "fix: ensure build script is executable"
git push
```

#### 3. Node.js Memory Issues

**Symptoms:** Build fails with "JavaScript heap out of memory"

**Fix:** Update `vercel.json`:

```json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=8192"
    }
  }
}
```

#### 4. Prisma Generation Failure

**Symptoms:** "Prisma Client not generated"

**Fix:** Ensure `postinstall` script runs:

```json
{
  "scripts": {
    "postinstall": "prisma generate || true"
  }
}
```

#### 5. TypeScript Compilation Errors

**Check locally:**

```bash
npx tsc --noEmit
```

**Fix any errors, then:**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors"
git push
```

#### 6. Dependency Installation Issues

**Check for:**

- Package lock file conflicts
- Peer dependency warnings
- Missing dependencies

**Fix:**

```bash
# Clean install locally
rm -rf node_modules package-lock.json
npm install
npm run build  # Test locally

# If successful, commit updated lock file
git add package-lock.json
git commit -m "fix: update package lock file"
git push
```

---

## 🚦 Force Redeployment

If automatic deployment isn't triggering:

### Method 1: Via Vercel Dashboard

1. Go to https://vercel.com/gogsias-projects/farmers-market
2. Click "Deployments" tab
3. Find latest deployment → Click "..." → "Redeploy"
4. Select "Use existing Build Cache" or "Rebuild"

### Method 2: Via Git (Trigger New Build)

```bash
# Create empty commit to trigger rebuild
git commit --allow-empty -m "chore: trigger Vercel rebuild"
git push origin master
```

### Method 3: Via CLI

```bash
# Redeploy latest commit
vercel --prod --force
```

---

## 📊 Monitoring Deployment

### Real-Time Build Logs

**Via Dashboard:**

1. https://vercel.com/gogsias-projects/farmers-market
2. Click on deployment
3. View "Building" logs in real-time

**Via CLI:**

```bash
# List recent deployments
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>

# View logs (once deployment completes)
vercel logs <deployment-url>
```

### Build Time Expectations

```yaml
Normal Build:
  Duration: 4-5 minutes
  Steps:
    - Install dependencies: 1-2 min
    - Prisma generate: 30 sec
    - Next.js build: 2-3 min
    - Optimize output: 30 sec

Slow Build (Warning):
  Duration: >10 minutes
  Likely Cause: Memory issues, large dependencies, or cold cache
```

---

## 🎯 Deployment Best Practices

### 1. Use Git Tags for Releases

```bash
# Tag major releases
git tag -a v1.0.0 -m "Release v1.0.0: MVP Launch"
git push origin v1.0.0

# Vercel creates deployment from tag
```

### 2. Preview Deployments for Features

```bash
# Create feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature

# Vercel creates preview URL automatically
# Share with team for testing before merging
```

### 3. Gradual Rollout

```bash
# Deploy to preview first
vercel

# Test preview URL thoroughly
# curl, Playwright tests, manual QA

# Promote to production only after validation
vercel promote <preview-url>
```

### 4. Monitor Post-Deployment

**Immediate Checks (First 5 Minutes):**

- [ ] Homepage loads
- [ ] API health check: `curl https://your-domain.vercel.app/api/health`
- [ ] Authentication works
- [ ] Database connection active
- [ ] No 500 errors in Vercel logs

**Short-Term Checks (First Hour):**

- [ ] Check Sentry for errors
- [ ] Monitor Vercel Analytics for traffic
- [ ] Test critical user flows (signup, login, checkout)
- [ ] Verify webhooks receiving events
- [ ] Check email delivery

---

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Add Domain in Vercel:**
   - Dashboard → Domains → Add Domain
   - Enter: `yourdomain.com`

2. **Configure DNS:**

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Update Environment Variables:**
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

### Custom Build Settings

**In `vercel.json`:**

```json
{
  "buildCommand": "npm run vercel-build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### Cron Jobs

**In `vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-sessions",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/send-daily-reports",
      "schedule": "0 8 * * *"
    }
  ]
}
```

---

## 🆘 Emergency Rollback

If production deployment causes critical issues:

### Method 1: Instant Rollback (Dashboard)

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment (4 days ago)
3. Click "..." → "Promote to Production"
4. Confirm rollback

### Method 2: Via CLI

```bash
# List production deployments
vercel ls --prod

# Promote previous deployment
vercel promote <previous-deployment-url> --scope=gogsias-projects
```

### Method 3: Git Revert

```bash
# Revert to previous commit
git revert HEAD
git push origin master

# Vercel auto-deploys reverted state
```

---

## 📞 Support & Resources

### Vercel Documentation

- **Deployments:** https://vercel.com/docs/deployments
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Build Configuration:** https://vercel.com/docs/build-step

### Project-Specific Resources

- **Build Script:** `scripts/vercel-build.sh`
- **Vercel Config:** `vercel.json`
- **Package Scripts:** `package.json` (see `vercel-build`)
- **Architecture Docs:** `FULL_ARCHITECTURE_DIAGRAM.md`

### Quick Links

- **Vercel Dashboard:** https://vercel.com/gogsias-projects/farmers-market
- **GitHub Repo:** https://github.com/gogsia86/farmers-market
- **Production URL:** https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app

---

## ✅ Post-Deployment Verification Script

Run this after every deployment:

```bash
#!/bin/bash
# save as: scripts/verify-deployment.sh

DEPLOYMENT_URL="https://your-domain.vercel.app"

echo "🔍 Verifying deployment at: $DEPLOYMENT_URL"
echo ""

# 1. Check homepage
echo "1. Testing homepage..."
if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" | grep -q "200"; then
  echo "   ✅ Homepage: OK"
else
  echo "   ❌ Homepage: FAILED"
fi

# 2. Check API health
echo "2. Testing API health..."
if curl -s "$DEPLOYMENT_URL/api/health" | grep -q "healthy"; then
  echo "   ✅ API Health: OK"
else
  echo "   ❌ API Health: FAILED"
fi

# 3. Check static assets
echo "3. Testing static assets..."
if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/_next/static" | grep -q "200"; then
  echo "   ✅ Static Assets: OK"
else
  echo "   ❌ Static Assets: FAILED"
fi

# 4. Check API routes
echo "4. Testing API routes..."
if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/farms" | grep -q -E "200|401"; then
  echo "   ✅ API Routes: OK"
else
  echo "   ❌ API Routes: FAILED"
fi

echo ""
echo "✅ Verification complete!"
```

**Usage:**

```bash
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

---

## 🎯 Next Steps

### Immediate Actions (Fix Current Errors)

1. **Check Environment Variables:**

   ```bash
   # Verify all required vars are set for Preview environment
   # Vercel Dashboard → Settings → Environment Variables
   ```

2. **Verify Build Script:**

   ```bash
   # Test locally
   bash scripts/vercel-build.sh
   ```

3. **Force Redeploy:**
   ```bash
   git commit --allow-empty -m "chore: trigger rebuild"
   git push origin master
   ```

### Long-Term Improvements

- [ ] Set up Vercel Postgres for database
- [ ] Configure custom domain
- [ ] Add performance monitoring
- [ ] Set up preview deployments for all PRs
- [ ] Configure deployment protection (require approval)
- [ ] Add deployment notifications (Slack/Discord)
- [ ] Set up edge functions for performance
- [ ] Enable Vercel Analytics

---

**End of Deployment Guide**

_For issues or questions, check Vercel docs or contact team._
