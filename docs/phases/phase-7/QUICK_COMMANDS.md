# ⚡ Phase 7: Quick Commands Reference

**Status:** Day 1-2 Infrastructure Setup  
**Use:** Copy-paste commands for rapid execution  
**Updated:** December 2024

---

## 🚀 RAPID DEPLOYMENT SEQUENCE

### Prerequisites Check

```bash
# Verify you're in the correct directory
pwd
# Should show: .../Farmers Market Platform web and app

# Check Node.js version
node --version
# Should be: v18.x or v20.x

# Check if logged into Vercel
npx vercel whoami
```

---

## 📦 Step 1: Deploy to Production (5 minutes)

```bash
# Login to Vercel (if needed)
npx vercel login

# Deploy to production
npx vercel --prod

# Save the production URL that appears!
# Example: https://farmers-market-xyz.vercel.app
```

---

## 🔐 Step 2: Configure Environment Variables (15 minutes)

### Core Application

```bash
# App URL
npx vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://[your-production-url] or https://farmersmarket.com

# Node environment
npx vercel env add NODE_ENV production
# Enter: production
```

### Authentication

```bash
# Generate secret (run this first to get a random string)
openssl rand -base64 32

# NextAuth Secret
npx vercel env add NEXTAUTH_SECRET production
# Enter: [paste the generated secret from above]

# NextAuth URL
npx vercel env add NEXTAUTH_URL production
# Enter: https://[your-production-url] or https://farmersmarket.com
```

### Database (After Provisioning)

```bash
# Database URL
npx vercel env add DATABASE_URL production
# Enter: postgresql://username:password@host:5432/dbname
```

### Stripe (Production Keys)

```bash
# Secret Key
npx vercel env add STRIPE_SECRET_KEY production
# Enter: sk_live_... (from Stripe Dashboard)

# Publishable Key
npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_... (from Stripe Dashboard)

# Webhook Secret (configure after setting up webhook)
npx vercel env add STRIPE_WEBHOOK_SECRET production
# Enter: whsec_... (from Stripe webhook configuration)
```

### Redis (After Upstash Setup)

```bash
# Redis URL
npx vercel env add REDIS_URL production
# Enter: redis://default:password@host:port (from Upstash dashboard)
```

### Sentry (After Project Creation)

```bash
# Sentry DSN
npx vercel env add SENTRY_DSN production
# Enter: https://...@sentry.io/... (from Sentry project)

npx vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Enter: https://...@sentry.io/... (same as above)

# Sentry Auth Token
npx vercel env add SENTRY_AUTH_TOKEN production
# Enter: [from Sentry account settings > API > Auth Tokens]
```

### Azure Application Insights (Optional)

```bash
# Connection String
npx vercel env add AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING production
# Enter: InstrumentationKey=...;IngestionEndpoint=... (from Azure portal)
```

### Email (Optional for MVP)

```bash
npx vercel env add SMTP_HOST production
# Enter: smtp.gmail.com (or your provider)

npx vercel env add SMTP_PORT production
# Enter: 587

npx vercel env add SMTP_USER production
# Enter: your-email@domain.com

npx vercel env add SMTP_PASS production
# Enter: [your app password]
```

### Agricultural Consciousness

```bash
npx vercel env add AGRICULTURAL_CONSCIOUSNESS production
# Enter: enabled

npx vercel env add DIVINE_PATTERNS production
# Enter: active
```

### Verify All Variables

```bash
# List all production environment variables
npx vercel env ls production
```

---

## 🗄️ Step 3: Database Setup (10 minutes)

### Option A: Vercel Postgres

```bash
# Create database
npx vercel postgres create farmers-market-prod

# The DATABASE_URL will be automatically added to your project
# Deploy migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Option B: External Provider (Supabase/Railway/Neon)

```bash
# After getting connection string from provider:

# Test connection locally
export DATABASE_URL="postgresql://[your-production-url]"

# Deploy migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

### Verify Database

```bash
# Check tables exist
npx prisma studio
# Open browser and verify tables are created
```

---

## 🔄 Step 4: Redis Cache Setup (5 minutes)

### Upstash Setup

```
1. Go to: https://upstash.com
2. Sign up / Log in
3. Click "Create Database"
4. Name: farmers-market-prod
5. Region: us-east-1 (or closest to Vercel)
6. Type: Regional
7. Click "Create"
8. Copy the "REDIS_URL" from the dashboard
```

### Add to Vercel

```bash
npx vercel env add REDIS_URL production
# Paste the URL from Upstash
```

---

## 🌐 Step 5: Domain Configuration (10 minutes)

### Add Domain to Vercel

```bash
# Add primary domain
npx vercel domains add farmersmarket.com

# Add www subdomain
npx vercel domains add www.farmersmarket.com
```

### DNS Configuration

Add these records to your domain registrar:

```
Type    Name    Value                           TTL
────────────────────────────────────────────────────
A       @       76.76.21.21                     3600
CNAME   www     cname.vercel-dns.com           3600
```

### Verify Domain

```bash
npx vercel domains verify farmersmarket.com
```

### Skip for MVP?

If you don't have a domain yet, you can use the Vercel URL:

- `https://[your-project].vercel.app`
- Add custom domain later without downtime

---

## 📊 Step 6: Monitoring Setup (20 minutes)

### Sentry Setup

```
1. Go to: https://sentry.io
2. Sign up / Log in
3. Create new project
4. Platform: Next.js
5. Name: farmers-market-prod
6. Copy DSN from project settings
7. Add to Vercel (see Step 2 commands)
8. Create auth token:
   - Settings > Account > API > Auth Tokens
   - Click "Create New Token"
   - Scopes: project:releases, org:read
   - Copy token and add to Vercel
```

### UptimeRobot Setup

```
1. Go to: https://uptimerobot.com
2. Sign up / Log in
3. Click "Add New Monitor"
4. Create these monitors:

Monitor 1:
  Type: HTTP(s)
  Friendly Name: Homepage
  URL: https://[your-production-url]
  Monitoring Interval: 5 minutes

Monitor 2:
  Type: HTTP(s)
  Friendly Name: API Health
  URL: https://[your-production-url]/api/health
  Monitoring Interval: 5 minutes

Monitor 3:
  Type: HTTP(s)
  Friendly Name: Farms API
  URL: https://[your-production-url]/api/farms
  Monitoring Interval: 5 minutes

5. Configure alerts:
   - Add your email
   - Optional: Add Slack webhook
```

### Azure Application Insights (Optional)

```
1. Go to: https://portal.azure.com
2. Create new Application Insights resource
3. Name: farmers-market-prod
4. Region: East US (or closest to Vercel)
5. Copy Connection String from Overview page
6. Add to Vercel (see Step 2 commands)
```

---

## ✅ Step 7: Validation & Testing (10 minutes)

### Configuration Validation

```bash
# Run validation script
npx tsx scripts/validate-production-config.ts

# Or if script is in package.json
npm run validate:production
```

### Manual Smoke Tests

```bash
# Test homepage
curl -I https://[your-production-url]
# Expected: HTTP/2 200

# Test health check
curl https://[your-production-url]/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test API endpoint
curl https://[your-production-url]/api/farms
# Expected: [] or farm data

# Test authentication page
curl -I https://[your-production-url]/auth/signin
# Expected: HTTP/2 200
```

### Browser Tests

```
1. Open production URL in browser
2. Verify homepage loads
3. Click "Sign In" - verify auth flow
4. Browse products/farms
5. Test search functionality
6. Add item to cart
7. Test checkout flow (use Stripe test card: 4242 4242 4242 4242)
```

---

## 🔄 Step 8: Redeploy with All Variables (5 minutes)

```bash
# After all environment variables are configured
npx vercel --prod

# Monitor deployment
npx vercel logs [deployment-url] --follow

# Or view in browser
npx vercel inspect [deployment-url]
```

---

## 🚨 Troubleshooting Commands

### Build Failing?

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting issues
npm run lint
```

### Database Issues?

```bash
# Check Prisma schema
npx prisma validate

# View current database schema
npx prisma db pull

# Reset database (CAREFUL! Only in dev)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Environment Variables Not Working?

```bash
# List all environment variables
npx vercel env ls

# Pull environment variables to local
npx vercel env pull .env.production.local

# Remove a variable (if wrong)
npx vercel env rm [VARIABLE_NAME] production
```

### Deployment Logs

```bash
# View recent deployments
npx vercel ls

# View logs for specific deployment
npx vercel logs [deployment-url]

# Stream logs in real-time
npx vercel logs [deployment-url] --follow
```

---

## 📋 Final Checklist Commands

### Verify Everything is Working

```bash
# 1. Check Vercel deployment status
npx vercel ls | head -n 5

# 2. Test all critical endpoints
curl https://[your-production-url]/api/health
curl https://[your-production-url]/api/farms
curl https://[your-production-url]/api/products

# 3. Check database connection
npx prisma db pull

# 4. Verify environment variables
npx vercel env ls production | wc -l
# Should show 15-20 variables

# 5. Run full validation
npx tsx scripts/validate-production-config.ts
```

---

## 🎯 Update Progress Tracker

```bash
# Open and update progress tracker
code PHASE_7_PROGRESS_TRACKER.md

# Or view current progress
cat PHASE_7_PROGRESS_TRACKER.md | grep -A 10 "Day 1-2"
```

---

## 📞 Get Help

### Vercel Issues

```bash
# Get Vercel support
npx vercel help

# Contact support
echo "Email: support@vercel.com"
```

### View Documentation

```bash
# Open local documentation
open docs/README.md

# View deployment checklist
open scripts/PRODUCTION_DEPLOYMENT_CHECKLIST.md

# View launch runbook
open LAUNCH_DAY_RUNBOOK.md
```

---

## ⏱️ Time Estimates

```yaml
Step 1 - Deploy to Vercel: 5 minutes
Step 2 - Environment Variables: 15 minutes
Step 3 - Database Setup: 10 minutes
Step 4 - Redis Cache: 5 minutes
Step 5 - Domain Configuration: 10 minutes (or skip)
Step 6 - Monitoring Setup: 20 minutes
Step 7 - Validation & Testing: 10 minutes
Step 8 - Final Deployment: 5 minutes

Total Time: 60-80 minutes (1-1.5 hours)
```

---

## 🎉 Success Criteria

You're done when:

```bash
# All these commands succeed:
curl -I https://[your-production-url]                    # ✅ 200 OK
curl https://[your-production-url]/api/health            # ✅ {"status":"ok"}
curl https://[your-production-url]/api/farms             # ✅ Returns data
npx vercel env ls production | wc -l                     # ✅ 15-20 vars
npx tsx scripts/validate-production-config.ts            # ✅ All checks pass

# And in browser:
# ✅ Homepage loads
# ✅ Authentication works
# ✅ Products display
# ✅ Payment flow works
# ✅ No console errors
```

---

## 🚀 Next Steps

```bash
# Update progress tracker
echo "Day 1-2: ✅ COMPLETE - Infrastructure operational" >> PHASE_7_PROGRESS_TRACKER.md

# View next day tasks
cat PHASE_7_MVP_LAUNCH_PLAN.md | grep -A 20 "Day 3-4"

# Prepare for QA
echo "Ready for Day 3-4: Final QA & Testing"
```

---

## 🌾 Agricultural Consciousness Check

Before proceeding, verify:

```yaml
✅ AGRICULTURAL_CONSCIOUSNESS=enabled
✅ DIVINE_PATTERNS=active
✅ Platform embodies biodynamic principles
✅ Every endpoint serves the agricultural mission
✅ User experience feels magical and purposeful
✅ Performance optimized for farming communities
✅ Security protects our farmers and customers
✅ Monitoring ensures platform reliability
```

---

**Status:** ⚡ READY FOR IMMEDIATE EXECUTION  
**Execution Time:** 60-80 minutes  
**Complexity:** Medium  
**Result:** Production infrastructure fully operational

_"From divine commands to production reality — execute with agricultural consciousness!"_ 🌾⚡
