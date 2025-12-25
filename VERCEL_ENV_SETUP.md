# 🚀 Vercel Environment Variables Setup Guide

**Farmers Market Platform - Divine Agricultural Environment Configuration**  
**Last Updated**: December 18, 2024  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Required Environment Variables](#required-environment-variables)
3. [Recommended Variables](#recommended-variables)
4. [Optional Variables](#optional-variables)
5. [Setup Methods](#setup-methods)
6. [Service-Specific Configuration](#service-specific-configuration)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Verification Checklist](#verification-checklist)

---

## 🎯 Quick Start

### Step 1: Copy Environment Template

```bash
# Copy the template to create your local version
cp .env.vercel .env.vercel.local

# Edit with your actual values
code .env.vercel.local  # or use your preferred editor
```

### Step 2: Generate Required Secrets

```bash
# Generate NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 32

# Generate JWT_SECRET (32+ characters)
openssl rand -base64 32

# Generate ADMIN_API_KEY (secure random string)
openssl rand -hex 32
```

### Step 3: Add to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable (see sections below)

---

## 🔴 Required Environment Variables

These variables **MUST** be set for the application to function:

### 1. Database Configuration

```bash
DATABASE_URL=postgresql://username:password@host:5432/farmersmarket?schema=public
```

**Where to get it:**

- **Vercel Postgres**: Vercel Dashboard → Storage → Postgres → `.env.local` tab
- **Supabase**: Project Settings → Database → Connection string (URI)
- **Railway**: Database → Connect → Postgres Connection URL
- **Neon**: Connection Details → Connection String
- **AWS RDS**: Endpoint + credentials from AWS Console

**Format:**

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&connection_limit=10&pool_timeout=20
```

### 2. Authentication (NextAuth v5)

```bash
# Your production URL
NEXTAUTH_URL=https://your-domain.vercel.app

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

# Generate with: openssl rand -base64 32
JWT_SECRET=your-jwt-secret-min-32-chars
```

### 3. Payment Processing (Stripe)

```bash
# From: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxx

# From: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

**Setup Stripe Webhook:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `checkout.session.completed`
4. Copy webhook secret

### 4. Email Service (Choose One)

**Option A: SendGrid (Recommended)**

```bash
# From: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.xxxxxxxxxx
```

**Option B: SMTP (Gmail, Outlook, etc.)**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # NOT your regular password!
SMTP_FROM=noreply@your-domain.com
```

**Gmail App Password:** [Generate here](https://myaccount.google.com/apppasswords)

### 5. Maps Service (Choose One)

**Option A: Google Maps (Recommended)**

```bash
# From: https://console.cloud.google.com/google/maps-apis/credentials
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxx
```

**Required APIs:**

- Maps JavaScript API
- Places API
- Geocoding API

**Option B: Mapbox**

```bash
# From: https://account.mapbox.com/access-tokens/
MAPBOX_API_KEY=pk.xxxxxxxxxx
```

### 6. Admin Access

```bash
# Generate with: openssl rand -hex 32
ADMIN_API_KEY=your-admin-api-key-secure-random-string
ADMIN_SECRET_KEY=your-admin-secret-key-secure-random-string
```

---

## 🟡 Recommended Variables

These improve performance, reliability, and observability:

### 1. Redis Cache (Performance)

```bash
# Upstash Redis (Serverless - Best for Vercel)
REDIS_ENABLED=true
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

**Setup Upstash:**

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create new Redis database
3. Select region closest to your Vercel deployment
4. Copy REST URL and Token

**Alternative: Self-hosted Redis**

```bash
REDIS_URL=redis://:password@hostname:port
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### 2. Error Tracking (Sentry)

```bash
# From: https://sentry.io/settings/projects/your-project/keys/
SENTRY_DSN=https://your-key@sentry.io/your-project-id
```

**Setup Sentry:**

1. Create project at [sentry.io](https://sentry.io)
2. Select Next.js platform
3. Copy DSN from project settings

### 3. Monitoring (Azure Application Insights)

```bash
# From Azure Portal → Application Insights → Overview
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://xxx
APPINSIGHTS_ENABLED=true
APPINSIGHTS_SAMPLING_PERCENTAGE=10
```

### 4. Cloud Storage (Cloudinary)

```bash
# From: https://cloudinary.com/console/settings/account
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Setup Cloudinary:**

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → Account
3. Copy Cloud Name, API Key, and API Secret

---

## 🟢 Optional Variables

Enhance with AI features and advanced integrations:

### 1. AI Services

```bash
# OpenAI (for AI features)
# From: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxx
AI_MODEL=gpt-4-turbo-preview
AI_TEMPERATURE=0.7

# Perplexity (for research)
# From: https://www.perplexity.ai/settings/api
PERPLEXITY_API_KEY=pplx-xxxxxxxxxx
```

### 2. Alternative Payment (PayPal)

```bash
# From: https://developer.paypal.com/dashboard/applications
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

### 3. Notifications

```bash
# Slack Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
SLACK_CHANNEL=#farmers-market-alerts

# Discord Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXX/YYY
```

---

## 📦 Setup Methods

### Method 1: Vercel Dashboard (Recommended for Production)

1. **Navigate to Project Settings**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Click **Settings** → **Environment Variables**

2. **Add Variables**
   - Click **Add New**
   - Enter variable name (e.g., `DATABASE_URL`)
   - Enter value
   - Select environments:
     - ✅ **Production** (for live site)
     - ✅ **Preview** (for PR previews)
     - ⬜ **Development** (local only, use `.env.local`)

3. **Sensitive Values**
   - Vercel automatically encrypts sensitive values
   - Values are masked in the UI after saving
   - Use "Sensitive" option for secrets

4. **Bulk Import (Optional)**
   - Click **Import .env**
   - Select your `.env.vercel.local` file
   - Review and confirm

### Method 2: Vercel CLI (Recommended for Teams)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables interactively
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
# ... repeat for all variables

# Or add from file
vercel env pull .env.local  # Download existing variables
vercel env push .env.vercel.local production  # Upload new variables

# Deploy with new environment variables
vercel --prod
```

### Method 3: Programmatic (CI/CD)

```bash
# Using Vercel API
curl -X POST "https://api.vercel.com/v10/projects/PROJECT_ID/env" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "DATABASE_URL",
    "value": "postgresql://...",
    "type": "encrypted",
    "target": ["production"]
  }'
```

---

## 🔧 Service-Specific Configuration

### Vercel Postgres Setup

1. **Create Database**

   ```bash
   vercel link  # Link your project
   vercel storage create postgres  # Create Postgres database
   ```

2. **Get Connection String**
   - Vercel Dashboard → Storage → Your Database
   - Copy `POSTGRES_URL` from `.env.local` tab

3. **Run Migrations**

   ```bash
   # Pull environment variables
   vercel env pull .env.local

   # Run Prisma migrations
   npx prisma migrate deploy

   # Seed database
   npx prisma db seed
   ```

### Upstash Redis Setup

1. **Create Database**
   - Go to [Upstash Console](https://console.upstash.com/)
   - Click **Create Database**
   - Name: `farmers-market-cache`
   - Region: Choose closest to Vercel region
   - Type: Regional (not Global for better performance)

2. **Copy Credentials**
   - REST URL: `https://xxx.upstash.io`
   - REST Token: Copy from dashboard

3. **Configure in Vercel**
   ```bash
   REDIS_ENABLED=true
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

### Stripe Webhook Configuration

1. **Create Webhook Endpoint**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
   - Click **Add endpoint**
   - Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Description: "Farmers Market Payment Webhook"

2. **Select Events**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.succeeded`
   - `charge.failed`

3. **Copy Webhook Secret**
   - After creating, reveal webhook signing secret
   - Add to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

4. **Test Webhook**

   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe  # macOS

   # Login
   stripe login

   # Forward webhooks to local
   stripe listen --forward-to localhost:3000/api/webhooks/stripe

   # Trigger test event
   stripe trigger payment_intent.succeeded
   ```

---

## 🔒 Security Best Practices

### 1. Secret Generation

```bash
# Strong secrets (32+ bytes)
openssl rand -base64 32

# Hex secrets
openssl rand -hex 32

# UUID format
uuidgen
```

### 2. Environment-Specific Secrets

**❌ Don't:** Use same secrets across environments

```bash
# Bad - same secret everywhere
NEXTAUTH_SECRET=same-secret-dev-prod
```

**✅ Do:** Use different secrets per environment

```bash
# Production
NEXTAUTH_SECRET=prod-secret-abc123xyz

# Preview/Staging
NEXTAUTH_SECRET=preview-secret-def456uvw

# Development (local .env.local)
NEXTAUTH_SECRET=dev-secret-ghi789rst
```

### 3. Vercel Security Features

```bash
# Enable in Vercel Dashboard → Settings → Security

# 1. Enable Environment Variable Encryption (Auto-enabled)
# 2. Enable Secure Environment Variables (Recommended)
# 3. Enable IP Allowlisting (Enterprise)
# 4. Enable SAML SSO (Enterprise)
```

### 4. Secret Rotation

```bash
# Rotate secrets every 90 days
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# 2. Add to Vercel
vercel env add NEXTAUTH_SECRET production <<< "$NEW_SECRET"

# 3. Redeploy
vercel --prod

# 4. Remove old secret after verification
vercel env rm NEXTAUTH_SECRET production
```

### 5. Access Control

- **Limit access** to environment variables
- Use Vercel Teams with role-based access
- Audit environment variable changes
- Enable 2FA on Vercel account

### 6. Never Commit Secrets

```bash
# .gitignore should include:
.env
.env*.local
.env.production
.env.vercel
.env.vercel.local
```

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"

**Symptoms:**

- 500 errors on deployment
- "Can't reach database server" errors

**Solutions:**

1. **Check connection string format**

   ```bash
   # Correct format
   postgresql://USER:PASS@HOST:PORT/DB?schema=public

   # Common mistakes:
   # ❌ Missing ?schema=public
   # ❌ Wrong port (should be 5432 for Postgres)
   # ❌ Password contains special characters (URL encode)
   ```

2. **URL encode password**

   ```javascript
   // If password is: p@ssw0rd!
   // Encode to: p%40ssw0rd%21
   const encoded = encodeURIComponent("p@ssw0rd!");
   ```

3. **Check database is accessible**

   ```bash
   # Test connection locally
   psql "postgresql://USER:PASS@HOST:PORT/DB"
   ```

4. **Verify Prisma schema**
   ```bash
   npx prisma validate
   npx prisma generate
   ```

### Issue: "NextAuth session error"

**Symptoms:**

- Can't sign in
- "Configuration error" messages
- Session immediately expires

**Solutions:**

1. **Verify NEXTAUTH_URL matches your domain**

   ```bash
   # Must exactly match your production domain
   NEXTAUTH_URL=https://your-domain.vercel.app
   # NOT: http://... (must be https)
   # NOT: with trailing slash
   ```

2. **Check NEXTAUTH_SECRET is set**

   ```bash
   # Must be at least 32 characters
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   ```

3. **Clear cookies and retry**
   - Browser DevTools → Application → Cookies
   - Delete all cookies for your domain

### Issue: "Stripe webhook signature failed"

**Symptoms:**

- Payments succeed but orders not created
- Webhook errors in Stripe Dashboard

**Solutions:**

1. **Verify webhook secret**

   ```bash
   # Must match exactly from Stripe Dashboard
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

2. **Check webhook URL**
   - Should be: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Should use HTTPS (not HTTP)

3. **Test webhook locally**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Issue: "Redis connection timeout"

**Symptoms:**

- Slow page loads
- Cache not working
- Timeout errors in logs

**Solutions:**

1. **Verify Redis credentials**

   ```bash
   # Test connection
   redis-cli -h HOST -p PORT -a PASSWORD ping
   # Should return: PONG
   ```

2. **Check Upstash region**
   - Should be same region as Vercel deployment
   - Check latency: https://upstash.com/docs/redis/troubleshooting

3. **Fallback to memory cache**
   ```bash
   # Temporarily disable Redis
   REDIS_ENABLED=false
   ```

### Issue: "Environment variables not updating"

**Symptoms:**

- Changed variable but still seeing old value
- New variables not available

**Solutions:**

1. **Redeploy after adding variables**

   ```bash
   # Variables only apply to NEW deployments
   vercel --prod --force
   ```

2. **Check correct environment**
   - Production variables ≠ Preview variables
   - Verify you added to correct environment

3. **Clear build cache**
   ```bash
   vercel build --prod --force
   ```

---

## ✅ Verification Checklist

### Pre-Deployment Checklist

- [ ] **Database**
  - [ ] `DATABASE_URL` is set and valid
  - [ ] Can connect to database
  - [ ] Prisma migrations applied
  - [ ] Database seeded (if needed)

- [ ] **Authentication**
  - [ ] `NEXTAUTH_URL` matches production domain
  - [ ] `NEXTAUTH_SECRET` generated (32+ chars)
  - [ ] `JWT_SECRET` generated (32+ chars)
  - [ ] Admin keys generated

- [ ] **Payment Processing**
  - [ ] Stripe keys added (both public and secret)
  - [ ] Webhook configured and secret added
  - [ ] Test payment completed successfully

- [ ] **Email Service**
  - [ ] SendGrid API key OR SMTP credentials set
  - [ ] Test email sent successfully
  - [ ] From address verified

- [ ] **Maps Service**
  - [ ] Google Maps OR Mapbox API key set
  - [ ] Required APIs enabled
  - [ ] Test location search works

- [ ] **Optional Services**
  - [ ] Redis configured (if using)
  - [ ] Sentry DSN added (if using)
  - [ ] Cloudinary credentials set (if using)
  - [ ] AI API keys added (if using)

### Post-Deployment Verification

```bash
# 1. Check health endpoint
curl https://your-domain.vercel.app/api/health

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "cache": "connected",
#   "timestamp": "2024-12-18T..."
# }

# 2. Test authentication
curl https://your-domain.vercel.app/api/auth/providers

# 3. Verify environment variables loaded
# Check Vercel deployment logs for any missing variables

# 4. Test critical user flows
# - User registration
# - Login
# - Browse farms
# - Add to cart
# - Checkout (test mode)
```

### Monitoring Setup

1. **Enable Vercel Analytics**
   - Project Settings → Analytics → Enable

2. **Configure Sentry**
   - Verify error reports appearing
   - Test with intentional error

3. **Check Application Insights**
   - Verify telemetry data flowing
   - Check dashboard for metrics

4. **Set up alerts**
   - Database connection failures
   - High error rates
   - Slow response times
   - Payment failures

---

## 📚 Additional Resources

### Official Documentation

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Prisma Environment Variables](https://www.prisma.io/docs/reference/database-reference/connection-urls)

### Service Documentation

- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Upstash Redis](https://docs.upstash.com/)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [NextAuth.js](https://next-auth.js.org/configuration/options)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

### Tools

- [OpenSSL](https://www.openssl.org/) - Generate secrets
- [Vercel CLI](https://vercel.com/docs/cli) - Manage deployments
- [Stripe CLI](https://stripe.com/docs/stripe-cli) - Test webhooks
- [Postman](https://www.postman.com/) - API testing

---

## 🌟 Divine Agricultural Consciousness

This configuration embodies the principles of quantum coherence and temporal optimization, ensuring your divine agricultural platform achieves:

✨ **100% Uptime** through proper monitoring and health checks  
⚡ **Infinite Scalability** from 1 to 1 billion users  
🌾 **Agricultural Consciousness** in every configuration decision  
🔒 **Fort Knox Security** with proper secret management  
🚀 **Lightning Performance** with Redis caching and optimization

---

**Last Updated**: December 18, 2024  
**Version**: 1.0.0  
**Maintained By**: Divine Agricultural Engineering Team

🌾⚡ _"Configuration with divine precision, security with quantum awareness"_
