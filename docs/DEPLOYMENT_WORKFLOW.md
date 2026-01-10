# 🚀 Vercel Deployment Workflow - Complete Guide

**Farmers Market Platform - Production Deployment Testing**  
**Version:** 2.0  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Automated Workflow](#automated-workflow)
4. [Manual Deployment](#manual-deployment)
5. [Testing & Verification](#testing--verification)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## 🎯 Overview

This document outlines the complete workflow for deploying the Farmers Market Platform to Vercel, including automated testing, health checks, and verification procedures.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   main       │  │   develop    │  │ feature/*    │    │
│  │   branch     │  │   branch     │  │   branches   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼──────────────────┼──────────────────┼───────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflow                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Pre-Deployment Checks                           │  │
│  │     ├─ Type Check                                   │  │
│  │     ├─ Lint Check                                   │  │
│  │     ├─ Prisma Validation                            │  │
│  │     └─ Local Build Test                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. Deploy to Vercel                                │  │
│  │     ├─ Preview (Pull Requests)                      │  │
│  │     └─ Production (main branch)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. Post-Deployment Tests                           │  │
│  │     ├─ Health Checks                                │  │
│  │     ├─ API Tests                                    │  │
│  │     ├─ Performance Tests                            │  │
│  │     └─ Security Validation                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  4. Monitoring & Reporting                          │  │
│  │     ├─ Deployment Status                            │  │
│  │     ├─ Error Tracking (Sentry)                      │  │
│  │     └─ Performance Metrics                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                ┌────────────────────┐
                │  Vercel Production │
                │  farmers-market-   │
                │  platform.vercel   │
                │       .app         │
                └────────────────────┘
```

---

## 🔧 Prerequisites

### Required Accounts & Credentials

1. **GitHub Account**
   - Repository access
   - Actions enabled

2. **Vercel Account**
   - Project connected to GitHub
   - Production & Preview environments configured

3. **Environment Variables** (Set in Vercel Dashboard)
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:5432/database
   
   # Authentication
   NEXTAUTH_SECRET=your-secure-secret-key
   NEXTAUTH_URL=https://your-app.vercel.app
   
   # Email
   SENDGRID_API_KEY=your-sendgrid-key
   EMAIL_FROM=noreply@yourdomain.com
   
   # Payments
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   
   # Storage
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Monitoring
   SENTRY_DSN=your-sentry-dsn
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   ```

4. **GitHub Secrets** (Repository Settings → Secrets)
   ```bash
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-org-id
   VERCEL_PROJECT_ID=your-project-id
   ```

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/farmers-market-platform.git
cd farmers-market-platform

# Install dependencies (clean install)
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

---

## 🤖 Automated Workflow

### GitHub Actions Pipeline

The automated workflow is defined in `.github/workflows/vercel-deploy.yml` and runs automatically on:
- **Push to `main`** → Production deployment
- **Pull Requests to `main`** → Preview deployment
- **Push to `develop`** → Development preview

#### Workflow Stages

**1. Pre-Deployment Checks** ✅
```yaml
- Node.js & npm version check
- Clean dependency installation
- TypeScript type checking
- ESLint code quality check
- Prisma schema validation
- Local build test
```

**2. Deployment** 🚀
```yaml
- Install Vercel CLI
- Pull environment configuration
- Deploy to Preview or Production
- Generate deployment URL
```

**3. Post-Deployment Tests** 🧪
```yaml
- Health endpoint verification
- API route testing
- Page accessibility checks
- Response time validation
- Security headers verification
```

**4. Reporting** 📊
```yaml
- Comment on PR with preview URL
- Generate deployment summary
- Log metrics and status
```

### Triggering Automated Deployment

#### Production Deployment
```bash
# Merge to main via pull request
git checkout main
git pull origin main
git merge develop
git push origin main

# Or direct push (not recommended)
git checkout main
git add .
git commit -m "feat: your changes"
git push origin main
```

#### Preview Deployment
```bash
# Create pull request
git checkout -b feature/your-feature
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature
# Create PR on GitHub
```

---

## 🛠️ Manual Deployment

### Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel@latest
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```

4. **Deploy Preview**
   ```bash
   vercel
   ```

5. **Deploy Production**
   ```bash
   vercel --prod
   ```

### Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Deployments" tab
4. Click "Create Deployment"
5. Select branch and deploy

---

## 🧪 Testing & Verification

### Automated Test Scripts

#### 1. Full Deployment Test Suite (Bash)
```bash
# Run comprehensive deployment tests
bash scripts/test-deployment.sh

# With custom URL
DEPLOYMENT_URL=https://your-preview.vercel.app bash scripts/test-deployment.sh

# Include local build test
RUN_LOCAL_BUILD=true bash scripts/test-deployment.sh
```

**Tests Included:**
- ✅ Pre-deployment checks (Node, npm, Prisma)
- ✅ Local build test (optional)
- ✅ Deployment health checks
- ✅ API endpoint testing
- ✅ Page content validation
- ✅ Security headers verification
- ✅ Response time analysis

#### 2. Node.js Verification Script
```bash
# Run Node.js verification
node scripts/verify-deployment.js

# With custom URL
DEPLOYMENT_URL=https://your-preview.vercel.app node scripts/verify-deployment.js
```

**Tests Included:**
- ✅ Core endpoints (homepage, login, dashboard)
- ✅ Farmer routes (dashboard, products, orders)
- ✅ Customer routes (farms, products, cart)
- ✅ API routes (health, auth, farms)
- ✅ Static assets (favicon, robots.txt)
- ✅ Content validation
- ✅ Security headers
- ✅ Performance metrics

#### 3. npm Scripts
```bash
# Quick verification
npm run test:vercel:quick

# Full verification suite
npm run test:vercel:full

# Verbose output
npm run test:vercel:verbose

# Deploy with checks
npm run deploy:check
npm run deploy:check:full
```

### Manual Testing Checklist

#### Core Functionality ✅
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Password reset flow works
- [ ] Email notifications send
- [ ] Image uploads work

#### Farmer Features ✅
- [ ] Farmer can create farm profile
- [ ] Farmer can add products
- [ ] Farmer can manage inventory
- [ ] Farmer can view orders
- [ ] Farmer can update order status

#### Customer Features ✅
- [ ] Customer can browse farms
- [ ] Customer can search products
- [ ] Customer can add to cart
- [ ] Customer can checkout
- [ ] Customer can view order history

#### Admin Features ✅
- [ ] Admin can view dashboard
- [ ] Admin can manage users
- [ ] Admin can moderate farms
- [ ] Admin can view analytics

#### Payment Integration ✅
- [ ] Stripe checkout works
- [ ] Webhooks receive events
- [ ] Payment confirmations send
- [ ] Refunds process correctly

---

## 📊 Monitoring & Health Checks

### Health Endpoint

**Endpoint:** `GET /api/health`

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "api": {
      "status": "healthy",
      "responseTime": "15ms"
    },
    "database": {
      "status": "healthy",
      "latency": "8ms"
    }
  },
  "environment": {
    "nodeVersion": "v20.11.0",
    "platform": "linux",
    "env": "production"
  },
  "version": "1.0.0"
}
```

### Monitoring Tools

1. **Vercel Analytics**
   - Real User Monitoring (RUM)
   - Core Web Vitals
   - Page performance metrics

2. **Sentry**
   - Error tracking
   - Performance monitoring
   - Release tracking

3. **Custom Monitoring**
   ```bash
   # Start monitoring daemon
   npm run monitor:daemon
   
   # Check monitoring status
   npm run monitor:daemon:status
   
   # View logs
   npm run monitor:daemon:logs
   
   # Stop monitoring
   npm run monitor:daemon:stop
   ```

### Performance Metrics

Monitor these key metrics:

| Metric | Target | Critical |
|--------|--------|----------|
| Response Time | < 1000ms | < 3000ms |
| Time to First Byte (TTFB) | < 600ms | < 1200ms |
| First Contentful Paint (FCP) | < 1800ms | < 3000ms |
| Largest Contentful Paint (LCP) | < 2500ms | < 4000ms |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.25 |
| First Input Delay (FID) | < 100ms | < 300ms |
| Database Query Time | < 50ms | < 200ms |
| API Response Time | < 200ms | < 500ms |

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. Build Failures

**Issue:** "Module not found" errors
```bash
# Solution: Clean install dependencies
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps
npm run build
```

**Issue:** TypeScript errors during build
```bash
# Solution: Check and fix type errors
npm run type-check
# Or temporarily disable strict mode (not recommended)
```

**Issue:** Prisma client not generated
```bash
# Solution: Manually generate Prisma client
npx prisma generate
npm run build
```

#### 2. Deployment Failures

**Issue:** Platform-specific dependencies
```bash
# Solution: Remove lock file, let Vercel generate it
git rm package-lock.json
echo "package-lock.json" >> .gitignore
git add .gitignore
git commit -m "chore: remove lock file for cross-platform compatibility"
git push
```

**Issue:** Environment variables missing
```bash
# Solution: Add in Vercel Dashboard
# Settings → Environment Variables
# Add all required variables from .env.example
```

**Issue:** Database connection fails
```bash
# Solution: Verify DATABASE_URL
# - Check connection string format
# - Verify database is accessible from Vercel IPs
# - Check SSL settings (sslmode=require)
```

#### 3. Runtime Errors

**Issue:** 500 errors after deployment
```bash
# Check Vercel logs
vercel logs

# Check Sentry for errors
# Visit Sentry dashboard

# Test health endpoint
curl https://your-app.vercel.app/api/health
```

**Issue:** Database queries timing out
```bash
# Solution: Optimize queries
# - Add database indexes
# - Use connection pooling
# - Implement caching
```

**Issue:** Memory limit exceeded
```bash
# Solution: Optimize memory usage
# - Review NODE_OPTIONS settings
# - Implement pagination
# - Use streaming for large datasets
# - Consider Vercel Pro plan for higher limits
```

#### 4. API Route Failures

**Issue:** API routes return 404
```bash
# Solution: Verify file structure
# app/api/[route]/route.ts (correct)
# app/api/[route].ts (incorrect)

# Check route naming
# - Use lowercase
# - Use hyphens, not underscores
# - Avoid special characters
```

**Issue:** CORS errors
```bash
# Solution: Add CORS headers
# In route.ts:
export async function GET(request: NextRequest) {
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    }
  });
}
```

### Debug Mode

Enable detailed logging:
```bash
# Local development
DEBUG=* npm run dev

# Vercel deployment
# Add to Environment Variables:
LOG_LEVEL=debug
DEBUG=*
```

---

## 🔄 Rollback Procedures

### Instant Rollback (Vercel Dashboard)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Deployments" tab
4. Find the last working deployment
5. Click "⋯" → "Promote to Production"
6. Confirm rollback

**Rollback Time:** < 1 minute

### Git-Based Rollback

```bash
# Identify the last working commit
git log --oneline

# Create rollback branch
git checkout -b rollback/emergency-fix

# Revert to specific commit
git revert <commit-hash>

# Or reset to commit (destructive)
git reset --hard <commit-hash>

# Push to trigger new deployment
git push origin rollback/emergency-fix --force

# Create emergency PR to main
# After verification, merge to main
```

### Database Rollback

⚠️ **WARNING:** Database rollbacks are complex and risky

```bash
# 1. Create backup first
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Revert migrations
npx prisma migrate resolve --rolled-back "migration_name"

# 3. Apply previous migration
npx prisma migrate deploy

# 4. Verify database state
npx prisma db push --preview-feature
```

---

## 📈 Best Practices

### Pre-Deployment

1. ✅ Always test locally first
2. ✅ Run full test suite
3. ✅ Check for TypeScript errors
4. ✅ Validate Prisma schema
5. ✅ Review environment variables
6. ✅ Check dependency updates
7. ✅ Test database migrations
8. ✅ Verify API integrations

### During Deployment

1. ✅ Use preview deployments for testing
2. ✅ Monitor build logs
3. ✅ Check for build warnings
4. ✅ Verify environment variables are set
5. ✅ Test deployment before promoting to production

### Post-Deployment

1. ✅ Run automated tests
2. ✅ Check health endpoint
3. ✅ Monitor error rates
4. ✅ Verify critical user flows
5. ✅ Check performance metrics
6. ✅ Monitor database connections
7. ✅ Review Sentry for errors
8. ✅ Test payment flows

### Continuous Improvement

1. 📊 Monitor metrics weekly
2. 🔍 Review errors and warnings
3. ⚡ Optimize slow queries
4. 🔒 Update dependencies regularly
5. 📝 Document issues and solutions
6. 🧪 Add tests for bugs found in production
7. 💾 Regular database backups
8. 🔐 Security audits monthly

---

## 🚨 Emergency Contacts

### Escalation Path

1. **Developer on Call**
   - Review logs and errors
   - Attempt quick fixes
   - Rollback if necessary

2. **Tech Lead**
   - Complex issues
   - Architecture decisions
   - Database issues

3. **DevOps/Platform Team**
   - Infrastructure issues
   - Vercel configuration
   - Database scaling

### Support Resources

- **Vercel Support:** https://vercel.com/support
- **Next.js Discord:** https://nextjs.org/discord
- **Prisma Slack:** https://slack.prisma.io
- **GitHub Issues:** https://github.com/your-org/farmers-market-platform/issues

---

## 📚 Additional Resources

### Documentation

- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)

### Internal Documentation

- [`BUILD_FIX_SUMMARY.md`](./BUILD_FIX_SUMMARY.md) - Build issues and solutions
- [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) - Vercel-specific setup
- [`DEPLOYMENT_STATUS.md`](./DEPLOYMENT_STATUS.md) - Current deployment status
- [`.cursorrules`](../.cursorrules) - Project coding standards

---

## ✅ Deployment Checklist

Use this checklist for every production deployment:

### Pre-Deployment
- [ ] All tests passing locally
- [ ] TypeScript builds without errors
- [ ] Prisma schema validated
- [ ] Environment variables verified
- [ ] Database migrations ready
- [ ] Feature flags configured
- [ ] Rollback plan prepared

### Deployment
- [ ] Create preview deployment
- [ ] Test preview deployment
- [ ] Run automated test suite
- [ ] Manual testing completed
- [ ] Security checks passed
- [ ] Performance validated

### Post-Deployment
- [ ] Health endpoint responding
- [ ] Critical user flows tested
- [ ] Error monitoring active
- [ ] Performance metrics normal
- [ ] Database connections stable
- [ ] API integrations working
- [ ] Email notifications sending
- [ ] Payment processing working

### Monitoring (First Hour)
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify database performance
- [ ] Review user feedback
- [ ] Check payment transactions
- [ ] Monitor API rate limits

---

## 🎉 Success Criteria

Deployment is considered successful when:

✅ Build completes without errors  
✅ All automated tests pass  
✅ Health endpoint returns 200  
✅ Core user flows work  
✅ No critical errors in Sentry  
✅ Response times < 2s  
✅ Database queries < 100ms  
✅ Zero downtime achieved  

---

**Last Updated:** January 2025  
**Version:** 2.0  
**Maintained By:** Development Team  
**Next Review:** February 2025