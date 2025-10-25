# 🚀 FARMERS MARKET - PRODUCTION DEPLOYMENT GUIDE

**Status:** Option C - Production Deployment (2-3 hours)
**Target Platform:** Vercel (Recommended) or AWS/Docker
**Date:** October 16, 2025

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Database Migration Strategy](#database-migration-strategy)
4. [Vercel Deployment](#vercel-deployment)
5. [Domain & SSL Configuration](#domain--ssl-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Analytics Setup](#monitoring--analytics-setup)
8. [Troubleshooting](#troubleshooting)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### **1. Code Quality Verification**

```powershell
# Navigate to project directory
cd v:\Projects\Farmers-Market\farmers-market

# Run all quality checks
npm run type-check        # TypeScript validation (must be 0 errors)
npm run lint              # ESLint checks
npm run test:ci           # Run all tests (286 tests must pass)
npm run build             # Test production build
```
### Expected Results
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 critical errors (warnings acceptable)
- ✅ Tests: 286/286 passing (100%)
- ✅ Build: Success with no errors

### **2. Database Schema Verification**

```powershell
# Generate Prisma client
npm run db:generate

# Verify schema is valid
npx prisma validate
```

### **3. Dependencies Audit**

```powershell
# Check for critical vulnerabilities
npm audit --audit-level=high

# Fix non-breaking vulnerabilities
npm audit fix
```

### **4. Environment Files Review**

Ensure these files exist:

- ✅ `.env.production.example` (template for production)
- ✅ `.env.local` (development only - DO NOT deploy)
- ✅ `.gitignore` includes `.env.production`

---

## 🔐 ENVIRONMENT VARIABLES SETUP

### **Required Environment Variables**

Create these in Vercel Dashboard (Settings → Environment Variables):

#### **1. Database Configuration (CRITICAL)**

| Variable       | Value                                 | Environment         | Notes                            |
| -------------- | ------------------------------------- | ------------------- | -------------------------------- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Production, Preview | Primary database connection      |
| `DIRECT_URL`   | `postgresql://user:pass@host:5432/db` | Production          | Direct connection for migrations |
### Database Provider Options
- **Supabase** (Recommended): Free tier, managed PostgreSQL
- **Neon**: Serverless PostgreSQL with autoscaling
- **PlanetScale**: MySQL (requires schema changes)
- **Railway**: Simple PostgreSQL hosting
### Setup Supabase Database
1. Go to <<https://supabase.com/dashboar>d>
2. Create new project: "farmers-market-production"
3. Copy connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### **2. Authentication (CRITICAL)**

| Variable          | Value                                    | Environment         | Notes               |
| ----------------- | ---------------------------------------- | ------------------- | ------------------- |
| `NEXTAUTH_URL`    | `<https://yourdomain.com`>                 | Production          | Your production URL |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Production, Preview | Min 32 chars        |
### Generate NEXTAUTH_SECRET
```powershell
# On Windows PowerShell
$bytes = [byte[]]::new(32); (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)
```

#### **3. Stripe Payment (REQUIRED for E-Commerce)**

| Variable                             | Value         | Environment | Notes                           |
| ------------------------------------ | ------------- | ----------- | ------------------------------- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production  | Public key (visible in browser) |
| `STRIPE_SECRET_KEY`                  | `sk_live_...` | Production  | Secret key (server-only)        |
| `STRIPE_WEBHOOK_SECRET`              | `whsec_...`   | Production  | Webhook signature secret        |
### Setup Stripe
1. Go to <<https://dashboard.stripe.com/apikey>s>
2. Switch to "Live mode" (toggle in top-right)
3. Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Reveal and copy "Secret key" → `STRIPE_SECRET_KEY`
5. Go to Developers → Webhooks → Add endpoint
   - Endpoint URL: `<https://yourdomain.com/api/webhooks/stripe`>
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
6. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

#### **4. Email Service (REQUIRED)**

| Variable         | Value                    | Environment | Notes                   |
| ---------------- | ------------------------ | ----------- | ----------------------- |
| `RESEND_API_KEY` | `re_...`                 | Production  | Transactional email API |
| `CONTACT_EMAIL`  | `noreply@yourdomain.com` | Production  | Sender email address    |
### Setup Resend
1. Go to <<https://resend.com/api-key>s>
2. Create API key: "farmers-market-production"
3. Copy key → `RESEND_API_KEY`
4. Add and verify your domain (Settings → Domains)

#### **5. Optional but Recommended**

| Variable                  | Value                       | Environment | Notes                         |
| ------------------------- | --------------------------- | ----------- | ----------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`  | `<https://...@sentry.io/...`> | Production  | Error monitoring              |
| `CHROMATIC_PROJECT_TOKEN` | `chpt_...`                  | Production  | Visual testing (already have) |
| `REDIS_URL`               | `redis://...`               | Production  | Session caching (optional)    |

### **Environment Variables in Vercel**
### Add variables via Vercel Dashboard
1. Go to <<https://vercel.com/dashboar>d>
2. Select your project → Settings → Environment Variables
3. Add each variable with appropriate environment selection:
   - **Production**: Live site only
   - **Preview**: PR deployments
   - **Development**: Local development (use `.env.local` instead)
### Or use Vercel CLI
```powershell
# Install Vercel CLI
npm i -g vercel

# Add single variable
vercel env add DATABASE_URL production

# Import from .env file (BE CAREFUL - only use .env.production)
# vercel env pull .env.vercel.local
```

---

## 💾 DATABASE MIGRATION STRATEGY

### **Pre-Migration Checklist**

1. ✅ Database backup (automatic with managed services)
2. ✅ Schema validation (`npx prisma validate`)
3. ✅ Test migrations in staging first
4. ✅ Have rollback plan ready

### **Option 1: Fresh Database (Recommended for First Deploy)**

```powershell
# Generate migration files
npx prisma migrate dev --name initial_production_schema

# This creates: prisma/migrations/[timestamp]_initial_production_schema/migration.sql
```
### In Vercel Project Settings
1. Add build command override:

   ```
   npm run db:generate && npx prisma migrate deploy && npm run build
   ```

2. Or create `vercel.json`:

   ```json
   {
     "buildCommand": "npm run db:generate && npx prisma migrate deploy && npm run build"
   }
   ```

### **Option 2: Migrate Existing Database**

If you have existing production data:

```powershell
# Create migration without applying
npx prisma migrate dev --create-only --name production_update

# Review generated SQL in prisma/migrations/[timestamp]_production_update/migration.sql

# Apply migration manually
npx prisma migrate deploy
```

### **Database Seeding (Optional)**

Create initial data for production:

```powershell
# Create seed script: prisma/seed.ts
# Add to package.json:
# "prisma": { "seed": "ts-node prisma/seed.ts" }

# Run seeding
npm run db:seed
```

**Seed Script Example** (`prisma/seed.ts`):

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default categories
  await prisma.categories.createMany({
    data: [
      { id: "1", name: "Vegetables", description: "Fresh farm vegetables" },
      { id: "2", name: "Fruits", description: "Seasonal fruits" },
      { id: "3", name: "Dairy", description: "Farm-fresh dairy products" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

### **Migration Rollback Plan**

```powershell
# If migration fails, rollback:
npx prisma migrate resolve --rolled-back [migration-name]

# Or reset database (DANGER - deletes all data):
npx prisma migrate reset --force
```

---

## 🌐 VERCEL DEPLOYMENT

### **Step 1: Install Vercel CLI (Optional)**

```powershell
npm install -g vercel
vercel login
```

### **Step 2: Connect GitHub Repository**
### Via Vercel Dashboard (Recommended)
1. Go to <<https://vercel.com/ne>w>
2. Click "Import Project"
3. Connect GitHub account
4. Select repository: `Farmers-Market`
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `farmers-market`
   - **Build Command**: `npm run build` (or custom with migrations)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install --legacy-peer-deps`

### **Step 3: Configure Build Settings**

Create `vercel.json` in `farmers-market/` directory:

```json
{
  "version": 2,
  "buildCommand": "npm run db:generate && npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production",
    "NEXT_TELEMETRY_DISABLED": "1"
  },
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "true"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### **Step 4: Add Environment Variables**

1. In Vercel Dashboard → Project Settings → Environment Variables
2. Add all variables from [Environment Variables Setup](#environment-variables-setup)
3. Set environment for each:
   - Production only: Database credentials, API keys
   - Production + Preview: Non-sensitive config
   - Development: Use `.env.local` instead

### **Step 5: Deploy**
### Via Dashboard
- Push to `main` branch → Auto-deploys to production
- Push to other branches → Auto-deploys to preview URLs
### Via CLI
```powershell
cd farmers-market

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### **Step 6: Verify Deployment**

1. Check deployment logs in Vercel Dashboard
2. Visit deployment URL (e.g., `farmers-market-xyz.vercel.app`)
3. Test critical paths:
   - ✅ Homepage loads
   - ✅ Authentication works
   - ✅ Database connection successful
   - ✅ API routes respond
   - ✅ Storybook deployed (if enabled)

---

## 🌍 DOMAIN & SSL CONFIGURATION

### **Option 1: Use Vercel Domain**

Free `*.vercel.app` domain provided automatically:

- Format: `your-project-name.vercel.app`
- SSL certificate auto-provisioned
- No configuration needed

### **Option 2: Custom Domain**
### Prerequisites
- Own a domain (buy from Namecheap, GoDaddy, Google Domains, etc.)
- Access to domain DNS settings
### Setup Steps
1. **Add Domain in Vercel:**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your domain: `farmers-market.com`
   - Click "Add"

2. **Configure DNS Records:**

   **Option A: Vercel Nameservers (Recommended)**
   - Vercel provides nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
   - Update nameservers at your domain registrar
   - Wait 24-48 hours for DNS propagation

   **Option B: A/CNAME Records**
   - Add A record: `@` → `76.76.21.21` (Vercel IP)
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - SSL may take 10-15 minutes to provision

3. **Verify Domain:**
   - Vercel automatically checks DNS records
   - Once verified, SSL certificate issued (Let's Encrypt)
   - Force HTTPS enabled by default

4. **Set Production Domain:**
   - In Vercel Dashboard → Domains
   - Click "..." next to your domain → "Mark as Primary"
   - Update `NEXTAUTH_URL` environment variable to your domain

### **SSL Certificate Details**

- **Provider**: Let's Encrypt (free, auto-renewing)
- **Renewal**: Automatic every 90 days
- **Protocols**: TLS 1.2+, HTTP/2, HTTP/3 (QUIC)
- **Grade**: A+ on SSL Labs
### Test SSL Configuration
```powershell
# Check SSL certificate
curl -I <https://yourdomain.com>

# Full SSL test
# Visit: <https://www.ssllabs.com/ssltest/>
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### **1. Smoke Tests**

Run through critical user journeys:

```powershell
# Health check endpoint
curl <https://yourdomain.com/api/health>

# Expected response:
# { "status": "ok", "timestamp": "2025-10-16T12:00:00Z" }
```
### Manual Testing Checklist
- [ ] **Homepage**: Loads within 2 seconds
- [ ] **Authentication**:
  - [ ] Sign up new user
  - [ ] Sign in existing user
  - [ ] Sign out
  - [ ] Password reset flow
- [ ] **E-Commerce**:
  - [ ] Browse products
  - [ ] Add to cart
  - [ ] Checkout flow
  - [ ] Stripe payment (test mode first!)
  - [ ] Order confirmation email
- [ ] **Dashboard**:
  - [ ] Farm dashboard loads
  - [ ] Metric cards display data
  - [ ] Charts render correctly
- [ ] **Mobile**:
  - [ ] Bottom navigation works
  - [ ] Mobile drawer opens
  - [ ] Touch targets are 44px+
  - [ ] PWA install prompt appears
- [ ] **API Routes**:
  - [ ] `/api/health` returns 200
  - [ ] `/api/auth/session` returns session
  - [ ] `/api/products` returns products
  - [ ] `/api/vendor/orders` (authenticated)

### **2. Performance Testing**

```powershell
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse audit
lhci autorun --url=<https://yourdomain.com>
```
### Target Scores
- Performance: 90+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100
- PWA: 100 (if PWA enabled)

### **3. Security Testing**

- [ ] **HTTPS**: All traffic redirected to HTTPS
- [ ] **Headers**: Security headers present (X-Frame-Options, CSP, etc.)
- [ ] **Secrets**: No API keys exposed in browser console
- [ ] **Authentication**: Session cookies have `httpOnly` and `secure` flags
- [ ] **CORS**: Only allowed origins can access APIs
### Test Security Headers
```powershell
curl -I <https://yourdomain.com> | findstr /i "X-Frame-Options X-Content-Type-Options"
```

### **4. Database Verification**

```powershell
# Connect to production database (use DATABASE_URL)
npx prisma studio

# Verify:
# - All tables created
# - Migrations applied
# - Seed data present (if applicable)
```

### **5. Error Monitoring Verification**

If using Sentry:

1. Trigger test error: Visit `/api/test-error` (create this endpoint)
2. Check Sentry dashboard for error report
3. Verify source maps uploaded (for stack traces)

---

## 📊 MONITORING & ANALYTICS SETUP

### **1. Vercel Analytics (Built-in)**
### Enable in Vercel Dashboard
1. Project Settings → Analytics
2. Click "Enable Analytics"
3. Free tier: 100k events/month
### Metrics Tracked
- Page views
- Unique visitors
- Core Web Vitals (LCP, FID, CLS)
- Top pages
- Traffic sources
### View Analytics
```typescript
// Add to app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### **2. Sentry Error Monitoring (Optional)**
### Setup
```powershell
# Install Sentry
npm install @sentry/nextjs --legacy-peer-deps

# Initialize
npx @sentry/wizard@latest -i nextjs
```
### Configure (`sentry.client.config.ts`)
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```
### Add Environment Variable
- `NEXT_PUBLIC_SENTRY_DSN`: Get from Sentry project settings

### **3. Database Monitoring**
### Supabase Dashboard
- Database size
- Active connections
- Query performance
- Disk usage
### Alerts
- Disk usage > 80%
- Connection pool exhausted
- Long-running queries > 5 seconds

### **4. Uptime Monitoring (Optional)**
### Options
- **UptimeRobot** (free): <<https://uptimerobot.co>m>
- **Pingdom** (paid): <<https://www.pingdom.co>m>
- **Better Uptime** (free tier): <<https://betteruptime.co>m>
### Setup
1. Create account
2. Add monitor: `<https://yourdomain.com/api/health`>
3. Set check interval: 5 minutes
4. Configure alerts (email, Slack)

### **5. Log Management**
### Vercel Logs
- Real-time logs in Vercel Dashboard
- Search and filter by function, status code
- Retention: 1 hour (free), longer on paid plans
### External Logging (Optional)
- **Logtail**: <<https://logtail.co>m>
- **Datadog**: <<https://www.datadoghq.co>m>
- **New Relic**: <<https://newrelic.co>m>

---

## 🔧 TROUBLESHOOTING

### **Common Deployment Issues**

#### **1. Build Fails: Module Not Found**
### Error
```
Error: Cannot find module 'ajv'
```
### Fix
```powershell
# Install missing dependency
npm install ajv --legacy-peer-deps

# Rebuild
npm run build
```

#### **2. Database Connection Fails**
### Error
```
Error: P1001: Can't reach database server at `localhost:5432`
```
### Fix
- ✅ Verify `DATABASE_URL` environment variable is set in Vercel
- ✅ Check database is accessible from public internet (not localhost)
- ✅ Verify database firewall allows Vercel IPs
- ✅ Test connection: `npx prisma db pull` with production URL

#### **3. NextAuth Session Not Persisting**
### Error
- User logs in but immediately logged out
- Session not saved
### Fix
- ✅ Verify `NEXTAUTH_SECRET` is set (min 32 characters)
- ✅ Verify `NEXTAUTH_URL` matches production domain (no trailing slash)
- ✅ Check cookies are set with `secure` flag in production
- ✅ Verify database has `sessions` table

#### **4. Stripe Webhook Fails**
### Error
```
Error: No signatures found matching the expected signature for payload
```
### Fix
- ✅ Verify `STRIPE_WEBHOOK_SECRET` matches webhook endpoint secret
- ✅ Test webhook: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`
- ✅ Check webhook endpoint URL in Stripe Dashboard
- ✅ Verify webhook signature validation in API route

#### **5. Environment Variables Not Loading**
### Error
- `process.env.VARIABLE_NAME` is `undefined`
### Fix
- ✅ Verify variable added in Vercel Dashboard → Environment Variables
- ✅ Check variable is set for correct environment (Production/Preview)
- ✅ Redeploy after adding variables (changes require redeployment)
- ✅ Public variables must start with `NEXT_PUBLIC_`

#### **6. Build Exceeds Time Limit**
### Error
```
Error: Build exceeded maximum time limit (45 minutes)
```
### Fix
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 60
      }
    }
  ]
}
```

Or optimize build:

```powershell
# Reduce bundle size
npm run analyze:bundle

# Remove unused dependencies
npm prune --production
```

#### **7. API Route 500 Error**
### Error
- API routes return 500 Internal Server Error
### Fix
- ✅ Check Vercel Function Logs for error details
- ✅ Verify all environment variables are set
- ✅ Check database connection
- ✅ Add error handling to API routes:

```typescript
// pages/api/example.ts
export default async function handler(req, res) {
  try {
    // Your logic here
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
```

### **Performance Issues**

#### **Slow Page Load**
### Optimize
- ✅ Enable Image Optimization (Next.js Image component)
- ✅ Implement lazy loading for below-the-fold content
- ✅ Use static generation (`getStaticProps`) where possible
- ✅ Enable Vercel Edge Network (automatic)
- ✅ Minimize client-side JavaScript

```typescript
// Use dynamic imports for heavy components
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable server-side rendering if not needed
});
```

#### **High Database Load**
### Optimize
- ✅ Add database indexes on frequently queried fields
- ✅ Implement Redis caching for repeated queries
- ✅ Use connection pooling (PgBouncer)
- ✅ Optimize N+1 queries with `include` in Prisma

```prisma
// Add indexes to schema.prisma
model products {
  id       String @id
  name     String
  category String

  @@index([category])
  @@index([name])
}
```

---

## 📝 DEPLOYMENT CHECKLIST

### **Pre-Deployment**

- [ ] All tests passing (286/286)
- [ ] TypeScript 0 errors
- [ ] Production build successful
- [ ] Environment variables documented
- [ ] Database schema validated
- [ ] Security audit passed

### **Deployment**

- [ ] Environment variables added to Vercel
- [ ] Database migrated successfully
- [ ] Domain configured and SSL active
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] First production deployment successful

### **Post-Deployment**

- [ ] Smoke tests completed
- [ ] Performance scores meet targets (90+)
- [ ] Security headers verified
- [ ] Analytics tracking confirmed
- [ ] Error monitoring configured
- [ ] Uptime monitoring setup
- [ ] Team notified of production URL

---

## 🎯 SUCCESS CRITERIA

✅ **Deployment Successful When:**

- Production URL accessible: `<https://yourdomain.com`>
- All critical paths working (auth, checkout, dashboard)
- Performance scores: 90+ (Lighthouse)
- Security: HTTPS enforced, headers present
- Monitoring: Analytics + error tracking active
- Documentation: Team has access credentials

---

## 📚 RESOURCES

- **Vercel Docs**: <<https://vercel.com/doc>s>
- **Next.js Deployment**: <<https://nextjs.org/docs/deploymen>t>
- **Prisma Deploy**: <<https://www.prisma.io/docs/guides/deploymen>t>
- **Stripe Production**: <<https://stripe.com/docs/key>s>
- **Supabase Setup**: <<https://supabase.com/docs/guides/getting-starte>d>

---

**Next Steps:** Run through this guide step-by-step to deploy Farmers Market to production! 🚀🌱

_Generated with agricultural consciousness on October 16, 2025_
