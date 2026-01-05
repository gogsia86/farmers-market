# 🚀 STAGING DEPLOYMENT GUIDE

**Farmers Market Platform - Complete Staging Deployment**  
**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Production-Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Configuration](#database-configuration)
5. [Vercel Deployment](#vercel-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring Setup](#monitoring-setup)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## 🎯 Overview

This guide walks you through deploying the Farmers Market Platform to a staging environment on Vercel with PostgreSQL database, payment integrations, and monitoring.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STAGING ENVIRONMENT                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐     ┌──────────┐  │
│  │   Vercel     │◄────►│  PostgreSQL  │◄───►│  Redis   │  │
│  │   Next.js    │      │   Database   │     │  Cache   │  │
│  └──────┬───────┘      └──────────────┘     └──────────┘  │
│         │                                                   │
│         ├──────────► AWS S3 (Storage)                      │
│         ├──────────► Stripe (Test Mode)                    │
│         ├──────────► SendGrid/Resend (Email)               │
│         ├──────────► Sentry (Error Tracking)               │
│         └──────────► OpenTelemetry (Monitoring)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### Required Accounts

- [ ] **Vercel Account** - Free or Pro tier
- [ ] **Database** - PostgreSQL 14+ (Vercel Postgres, Supabase, or Railway)
- [ ] **Stripe Account** - Test mode enabled
- [ ] **AWS Account** - For S3 storage
- [ ] **Sentry Account** - Error tracking
- [ ] **SendGrid/Resend** - Email service

### Required Tools

- [ ] Node.js 20.19.0+
- [ ] npm 10.0.0+
- [ ] Git
- [ ] Vercel CLI (`npm install -g vercel`)
- [ ] Prisma CLI (included in project)

### Required Access

- [ ] GitHub repository access
- [ ] Domain name (e.g., `staging.farmersmarket.com`)
- [ ] DNS management access
- [ ] Team access to credential storage (1Password, AWS Secrets Manager, etc.)

---

## 🌍 Environment Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/farmers-market-platform.git
cd farmers-market-platform

# Checkout main branch
git checkout main

# Install dependencies
npm install
```

### Step 2: Create Environment File

```bash
# Copy staging environment template
cp .env.staging.example .env.staging

# Edit with your actual values
nano .env.staging
```

### Step 3: Configure Environment Variables

**Required Variables** (Must be set):

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Authentication
NEXTAUTH_URL="https://staging.farmersmarket.com"
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"

# Stripe (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AWS S3
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_BUCKET_NAME="farmersmarket-staging"

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@staging.farmersmarket.com"

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
```

**Generate Secure Secrets**:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate secure password
openssl rand -hex 16
```

---

## 🗄️ Database Configuration

### Option A: Vercel Postgres (Recommended for Vercel)

```bash
# Install Vercel Postgres
vercel postgres create farmersmarket-staging

# Get connection string
vercel postgres connect farmersmarket-staging

# Copy DATABASE_URL from output
```

### Option B: Supabase

1. Go to https://supabase.com
2. Create new project: `farmersmarket-staging`
3. Copy connection string from Settings → Database
4. Use "Transaction" pooling mode for DATABASE_URL
5. Use "Session" pooling mode for DIRECT_URL

### Option C: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create PostgreSQL database
railway add postgresql

# Get connection string
railway variables
```

### Step 4: Run Database Migrations

```bash
# Set staging database URL
export STAGING_DATABASE_URL="postgresql://user:pass@host:5432/db"

# Make migration script executable
chmod +x scripts/staging-migration.sh

# Run migration (full setup)
./scripts/staging-migration.sh

# Or run specific operations
./scripts/staging-migration.sh --migrate-only  # Just migrations
./scripts/staging-migration.sh --seed-only     # Just seed data
./scripts/staging-migration.sh --verify        # Verify setup
```

**Expected Output**:

```
================================
🚀 Farmers Market Platform - Staging Migration
================================

✅ Database connection verified
✅ Migrations deployed successfully
✅ Database seeded successfully
✅ Schema validation passed

Test accounts created:
  → Customer: test.customer@staging.farmersmarket.com
  → Farmer: test.farmer@staging.farmersmarket.com
  → Admin: test.admin@staging.farmersmarket.com
  → Password: StagingTest123!
```

---

## ☁️ Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Link Project

```bash
# Link to Vercel project
vercel link

# Follow prompts:
# - Select your team/account
# - Link to existing project or create new
# - Name: farmersmarket-staging
```

### Step 3: Configure Environment Variables

**Option A: Via Vercel CLI**

```bash
# Add all environment variables
vercel env add DATABASE_URL staging
# Paste your database URL when prompted

vercel env add NEXTAUTH_SECRET staging
# Paste your secret

vercel env add STRIPE_SECRET_KEY staging
# Paste your Stripe key

# Repeat for all required variables
```

**Option B: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
   - Environment: `Preview`

### Step 4: Deploy to Staging

```bash
# Deploy to staging (preview)
vercel deploy

# Or deploy with environment
vercel deploy --env=staging

# Deploy with build logs
vercel deploy --debug
```

**Expected Output**:

```
🔍 Inspect: https://vercel.com/...
✅ Preview: https://farmersmarket-staging-xyz123.vercel.app
```

### Step 5: Configure Custom Domain

```bash
# Add staging domain
vercel domains add staging.farmersmarket.com

# Configure DNS (add to your DNS provider):
# Type: CNAME
# Name: staging
# Value: cname.vercel-dns.com
```

---

## ✅ Post-Deployment Verification

### Step 1: Health Check

```bash
# Check application health
curl https://staging.farmersmarket.com/api/health

# Expected response:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2025-01-..."
# }
```

### Step 2: Manual Testing Checklist

```markdown
## 🧪 Manual Testing Checklist

### Homepage & Navigation

- [ ] Homepage loads (https://staging.farmersmarket.com)
- [ ] Navigation menu works
- [ ] Mobile menu functions
- [ ] All links work

### Authentication

- [ ] Registration page loads
- [ ] Can create new customer account
- [ ] Email validation works
- [ ] Login with test account succeeds
- [ ] Logout works

### Marketplace

- [ ] Browse farms page loads
- [ ] Browse products page loads
- [ ] Product filters work
- [ ] Search functionality works
- [ ] Farm profiles display correctly

### Shopping Flow

- [ ] Add product to cart
- [ ] Cart updates correctly
- [ ] Checkout page loads
- [ ] Address form validates
- [ ] Stripe test payment works (4242 4242 4242 4242)

### Dashboard

- [ ] Customer dashboard loads
- [ ] Order history displays
- [ ] Account settings accessible
- [ ] Profile editing works

### API Endpoints

- [ ] GET /api/farms returns data
- [ ] GET /api/products returns data
- [ ] POST /api/orders (protected) works
- [ ] Authentication required for protected routes
```

### Step 3: Run E2E Tests

```bash
# Run E2E tests against staging
BASE_URL=https://staging.farmersmarket.com npm run test:e2e

# Run specific test suite
BASE_URL=https://staging.farmersmarket.com npx playwright test tests/e2e/auth/

# Run with UI
BASE_URL=https://staging.farmersmarket.com npm run test:e2e:ui
```

### Step 4: Performance Testing

```bash
# Run Lighthouse audit
npx lighthouse https://staging.farmersmarket.com --view

# Expected scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >95
# - SEO: >95
```

---

## 📊 Monitoring Setup

### Sentry Error Tracking

1. **Create Sentry Project**:
   - Go to https://sentry.io
   - Create new project: "farmersmarket-staging"
   - Copy DSN

2. **Configure Environment**:

   ```bash
   vercel env add SENTRY_DSN staging
   vercel env add NEXT_PUBLIC_SENTRY_DSN staging
   ```

3. **Verify Errors are Tracked**:

   ```bash
   # Trigger test error
   curl https://staging.farmersmarket.com/api/test-error

   # Check Sentry dashboard for error
   ```

### OpenTelemetry Tracing

```bash
# Set up tracing endpoint
vercel env add OTEL_EXPORTER_OTLP_ENDPOINT staging

# Verify traces
curl https://staging.farmersmarket.com/api/products
# Check trace in your APM tool (Datadog, New Relic, etc.)
```

### Vercel Analytics

```bash
# Enable Vercel Analytics
vercel analytics enable

# View analytics
vercel analytics
```

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Symptoms**: Vercel build fails with TypeScript errors

**Solution**:

```bash
# Test build locally first
npm run build

# Check for type errors
npm run type-check

# Fix errors and redeploy
vercel deploy
```

### Issue: Database Connection Failed

**Symptoms**: App loads but shows database errors

**Solution**:

```bash
# Verify DATABASE_URL is set
vercel env pull .env.local
cat .env.local | grep DATABASE_URL

# Test connection
DATABASE_URL="postgresql://..." npx prisma db execute --stdin <<< "SELECT 1;"

# Check if IP is whitelisted (for cloud databases)
# Add Vercel IPs to database firewall
```

### Issue: Environment Variables Not Loading

**Symptoms**: Features don't work, missing API keys

**Solution**:

```bash
# Pull latest environment variables
vercel env pull

# Verify all required vars are set
vercel env ls

# Redeploy to apply changes
vercel deploy --force
```

### Issue: Stripe Payments Fail

**Symptoms**: Checkout completes but payment fails

**Solution**:

```bash
# Verify Stripe test mode keys
echo $STRIPE_SECRET_KEY | grep "sk_test"

# Check webhook endpoint
curl https://staging.farmersmarket.com/api/webhooks/stripe

# Update webhook URL in Stripe dashboard:
# https://dashboard.stripe.com/test/webhooks
# Endpoint: https://staging.farmersmarket.com/api/webhooks/stripe
```

### Issue: Images Not Uploading

**Symptoms**: Product images fail to upload

**Solution**:

```bash
# Verify AWS credentials
vercel env ls | grep AWS

# Test S3 upload
aws s3 ls s3://farmersmarket-staging --profile staging

# Check bucket CORS configuration
# Allow origin: https://staging.farmersmarket.com
```

### Issue: Slow Performance

**Symptoms**: Pages load slowly

**Solution**:

```bash
# Check database query performance
# Enable Prisma query logging
vercel env add DEBUG "prisma:query" staging

# Check bundle size
npm run build:analyze

# Enable Redis caching
vercel env add REDIS_URL staging
```

---

## 🔄 Rollback Procedures

### Quick Rollback (Last Deployment)

```bash
# Rollback to previous deployment
vercel rollback

# Or specify deployment URL
vercel rollback https://farmersmarket-staging-abc123.vercel.app
```

### Database Rollback

```bash
# If you have a backup
psql $STAGING_DATABASE_URL < backup-staging-20250115.sql

# Or rollback migrations
npx prisma migrate resolve --rolled-back <migration-name>
```

### Complete Environment Rollback

```bash
# 1. Rollback application
vercel rollback

# 2. Rollback database (if needed)
./scripts/staging-migration.sh --reset

# 3. Verify rollback
curl https://staging.farmersmarket.com/api/health
```

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally
- [ ] Test coverage >98%
- [ ] TypeScript builds without errors
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Backup strategy in place

### Deployment

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] Application deployed
- [ ] Custom domain configured
- [ ] SSL certificate active

### Post-Deployment

- [ ] Health check passes
- [ ] Manual testing complete
- [ ] E2E tests passing
- [ ] Error tracking operational
- [ ] Performance acceptable
- [ ] Team notified

### Monitoring

- [ ] Sentry receiving errors
- [ ] Analytics tracking pageviews
- [ ] Logs accessible
- [ ] Alerts configured
- [ ] Uptime monitoring active

---

## 🔗 Useful Commands

```bash
# Deploy
vercel deploy                    # Deploy to staging
vercel deploy --prod            # Deploy to production
vercel deploy --debug           # Deploy with debug logs

# Environment Variables
vercel env ls                   # List all variables
vercel env add VAR staging      # Add variable
vercel env rm VAR staging       # Remove variable
vercel env pull                 # Download to .env.local

# Logs
vercel logs                     # View deployment logs
vercel logs --follow            # Stream logs
vercel logs <deployment-url>    # Logs for specific deployment

# Domains
vercel domains ls               # List domains
vercel domains add staging.farmersmarket.com
vercel domains rm staging.farmersmarket.com

# Projects
vercel ls                       # List deployments
vercel inspect <url>            # Inspect deployment
vercel remove <deployment-id>   # Remove deployment

# Database
npx prisma migrate deploy       # Run migrations
npx prisma db push             # Push schema changes
npx prisma db seed             # Seed database
npx prisma studio              # Open Prisma Studio
```

---

## 📞 Support & Resources

### Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

### Project Documentation

- `README.md` - Project overview
- `TASKS_COMPLETION_SUMMARY.md` - Recent implementation details
- `DASHBOARD_ACCOUNT_DISTINCTION.md` - Feature documentation
- `.github/instructions/` - Divine coding patterns

### Getting Help

- **Team Chat**: [Your team Slack/Discord]
- **Issue Tracker**: [GitHub Issues]
- **Emergency Contact**: [On-call engineer contact]

---

## 🎉 Success Criteria

Your staging deployment is successful when:

- ✅ Application loads at `https://staging.farmersmarket.com`
- ✅ All E2E tests pass
- ✅ Health check returns `200 OK`
- ✅ Test payment completes successfully
- ✅ Errors appear in Sentry
- ✅ Performance score >90
- ✅ No console errors
- ✅ Mobile responsive
- ✅ All API endpoints functional
- ✅ Database operations working

---

## 🚀 Next Steps After Staging

1. **User Acceptance Testing** (2-3 days)
   - Invite team members to test
   - Collect feedback
   - Fix critical issues

2. **Performance Optimization** (1-2 days)
   - Monitor staging metrics
   - Optimize slow queries
   - Improve load times

3. **Security Audit** (1 day)
   - Review authentication flows
   - Test authorization
   - Check for vulnerabilities

4. **Documentation Review** (1 day)
   - Update API docs
   - Review user guides
   - Update README

5. **Production Preparation** (1 week)
   - Create production environment
   - Configure production secrets
   - Set up production monitoring
   - Plan production deployment

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: ✅ READY FOR DEPLOYMENT

_"Deploy with confidence, monitor with consciousness, scale with divine precision."_ 🌾🚀✨
