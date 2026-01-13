# 🔐 Environment Variables Setup Guide

**Version:** 4.0  
**Last Updated:** January 13, 2025  
**Platform:** Farmers Market Platform

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Files Overview](#environment-files-overview)
3. [Required Variables](#required-variables)
4. [Optional Variables](#optional-variables)
5. [Environment-Specific Setup](#environment-specific-setup)
6. [API Keys & Services](#api-keys--services)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Validation & Testing](#validation--testing)

---

## 🚀 Quick Start

### 1. Copy the Example File

```bash
# Copy the example file
cp .env.example .env.local

# For production
cp .env.example .env.production
```

### 2. Fill in Required Variables

At minimum, you need:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-character-secret-here
```

### 3. Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 32

# Windows PowerShell alternative
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 4. Validate Configuration

```bash
# Start the development server
npm run dev

# The env-validator will check your configuration
# Fix any reported errors
```

---

## 📂 Environment Files Overview

### File Structure

```
.
├── .env                    # ❌ Git-ignored - DO NOT COMMIT
├── .env.local              # ❌ Git-ignored - Local overrides
├── .env.production         # ❌ Git-ignored - Production secrets
├── .env.example            # ✅ Git-tracked - Template file
├── .env.docker             # ✅ Git-tracked - Docker configuration
├── .env.redis              # ✅ Git-tracked - Redis configuration
├── .env.test               # ✅ Git-tracked - Test environment
├── .env.vercel             # ✅ Git-tracked - Vercel template
└── .env.vercel.local       # ❌ Git-ignored - Local Vercel config
```

### Load Priority (Next.js)

Next.js loads environment files in this order (later overrides earlier):

1. `.env` - All environments
2. `.env.local` - Overrides for local development (git-ignored)
3. `.env.[NODE_ENV]` - Environment-specific (e.g., `.env.production`)
4. `.env.[NODE_ENV].local` - Environment-specific overrides (git-ignored)

### Which File to Use?

| Scenario | File to Use |
|----------|------------|
| Local Development | `.env.local` |
| Docker Development | `.env.docker` |
| Testing | `.env.test` |
| Production (Vercel) | Vercel Dashboard Environment Variables |
| Production (Self-hosted) | `.env.production` |

---

## ✅ Required Variables

### Core Application Settings

```env
# Application Environment
NODE_ENV=development

# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/farmersmarket

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-min-32-chars
```

### ⚠️ Production Requirements

For production, you MUST also configure:

```env
# Use PostgreSQL (not SQLite)
DATABASE_URL=postgresql://user:password@production-host:5432/farmersmarket

# Secure secret (32+ characters)
NEXTAUTH_SECRET=<generated-secure-secret>

# Production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

---

## ⭐ Optional Variables

### Payment Processing (Stripe)

Required if you want to accept payments:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Get Keys:** https://dashboard.stripe.com/apikeys

### Email Service (SendGrid)

Required for sending emails:

```env
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

**Get API Key:** https://app.sendgrid.com/settings/api_keys

### Cloud Storage (Cloudinary)

Required for image uploads:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Get Credentials:** https://cloudinary.com/console

### Caching (Redis)

Highly recommended for production:

```env
# Option 1: Redis URL
REDIS_URL=redis://localhost:6379

# Option 2: Upstash (Serverless)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

**Get Upstash:** https://console.upstash.com/

### Error Tracking (Sentry)

Recommended for production:

```env
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Get DSN:** https://sentry.io/settings/projects/

### AI Features (OpenAI)

Optional - for AI-powered features:

```env
OPENAI_API_KEY=sk-your_api_key
```

**Get API Key:** https://platform.openai.com/api-keys

---

## 🌍 Environment-Specific Setup

### Local Development

**File:** `.env.local`

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-change-in-production-min-32-chars

# Optional: Use test Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Docker Development

**File:** `.env.docker`

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
DATABASE_URL=postgresql://divine_user:quantum_password@postgres:5432/farmers_market
REDIS_URL=redis://redis:6379
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=docker-secret-change-in-production-min-32-chars
```

### Testing

**File:** `.env.test`

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:test_password@localhost:5433/farmersmarket_test
NEXTAUTH_SECRET=test-secret-key-for-e2e-testing-minimum-32-characters-long
SKIP_ENV_VALIDATION=true
```

### Production (Vercel)

**Do NOT use files!** Configure in Vercel Dashboard:

1. Go to your project: https://vercel.com/your-org/your-project
2. Settings → Environment Variables
3. Add each variable with appropriate scope:
   - **Production** - Only production deployments
   - **Preview** - Preview deployments
   - **Development** - Local development with `vercel dev`

**Required Production Variables:**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
DATABASE_URL=postgresql://... (from Vercel Postgres or Supabase)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<secure-random-32-chars>
STRIPE_SECRET_KEY=sk_live_... (use LIVE keys!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production (Self-Hosted)

**File:** `.env.production`

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:password@db-host:5432/farmersmarket
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<secure-random-32-chars>
REDIS_URL=redis://:password@redis-host:6379
SENTRY_DSN=https://...@sentry.io/...

# Use LIVE keys for production!
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🔑 API Keys & Services

### Database Services

#### Option 1: Vercel Postgres (Recommended for Vercel)

1. Go to: https://vercel.com/dashboard/stores
2. Create Postgres database
3. Copy `DATABASE_URL` to environment variables

#### Option 2: Supabase (Free Tier Available)

1. Sign up: https://supabase.com/
2. Create new project
3. Go to Settings → Database
4. Copy connection string (use pooler for production)

```env
DATABASE_URL=postgresql://postgres.[xxx]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### Option 3: Neon (Serverless Postgres)

1. Sign up: https://neon.tech/
2. Create project
3. Copy connection string

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
```

### Payment Processing

#### Stripe Setup

1. **Create Account:** https://dashboard.stripe.com/register
2. **Get API Keys:** https://dashboard.stripe.com/apikeys
3. **Enable Webhooks:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy webhook secret

**Test vs Live Keys:**
- Development: Use `pk_test_...` and `sk_test_...`
- Production: Use `pk_live_...` and `sk_live_...`

### Email Service

#### SendGrid Setup

1. **Create Account:** https://signup.sendgrid.com/
2. **Create API Key:**
   - Settings → API Keys → Create API Key
   - Choose "Full Access"
   - Copy key immediately (shown only once!)
3. **Verify Sender:**
   - Settings → Sender Authentication
   - Verify your email or domain

```env
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

#### Alternative: SMTP (Gmail, Outlook, etc.)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@yourdomain.com
```

**Gmail App Password:** https://myaccount.google.com/apppasswords

### Cloud Storage

#### Cloudinary Setup

1. **Create Account:** https://cloudinary.com/users/register/free
2. **Get Credentials:**
   - Dashboard → Account Details
   - Copy: Cloud Name, API Key, API Secret

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret
```

### Caching

#### Upstash Redis (Serverless)

1. **Create Account:** https://console.upstash.com/
2. **Create Database:**
   - Choose region closest to your deployment
   - Copy REST URL and Token

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

#### Redis Labs (Cloud Redis)

1. **Create Account:** https://redis.com/try-free/
2. **Create Database**
3. **Copy Connection String**

```env
REDIS_URL=redis://default:password@host:port
```

### Error Tracking

#### Sentry Setup

1. **Create Account:** https://sentry.io/signup/
2. **Create Project:**
   - Choose Next.js
   - Copy DSN
3. **Add to Environment:**

```env
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

**✅ DO:**
- Keep `.env`, `.env.local`, `.env.production` in `.gitignore`
- Use `.env.example` as a template
- Store production secrets in Vercel Dashboard or secure vault

**❌ DON'T:**
- Commit any `.env` file with actual values
- Share secrets via Slack/Email
- Use the same secrets across environments

### 2. Use Strong Secrets

```bash
# Generate secure random strings
openssl rand -base64 32

# Or use a password manager
# 1Password, LastPass, Bitwarden, etc.
```

**Requirements:**
- `NEXTAUTH_SECRET`: Minimum 32 characters
- `JWT_SECRET`: Minimum 32 characters
- Database passwords: Minimum 16 characters, alphanumeric + symbols

### 3. Rotate Secrets Regularly

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| `NEXTAUTH_SECRET` | Every 90 days |
| Database passwords | Every 180 days |
| API keys | When exposed or annually |
| Stripe webhook secrets | When exposed |

### 4. Use Environment-Specific Keys

| Environment | Stripe Keys | Database | Email |
|-------------|------------|----------|-------|
| Development | `pk_test_...` | SQLite or local PG | Test mode |
| Staging | `pk_test_...` | Staging DB | Test mode |
| Production | `pk_live_...` | Production DB | Live mode |

### 5. Restrict API Key Permissions

- **Stripe:** Use restricted API keys when possible
- **Cloudinary:** Limit to specific operations
- **Database:** Use separate credentials for app vs migrations

### 6. Monitor for Exposed Secrets

```bash
# Check git history for accidentally committed secrets
git log --all --full-history -- "**/.env*"

# Use tools like:
# - GitHub Secret Scanning
# - GitGuardian
# - TruffleHog
```

### 7. Use Vercel Environment Variables

For production on Vercel:

1. **Never use `.env` files in production**
2. **Add all secrets to Vercel Dashboard**
3. **Use scoped variables:**
   - Production-only variables for prod
   - Preview-only for staging

---

## 🐛 Troubleshooting

### Error: "NEXTAUTH_SECRET must be at least 32 characters"

**Solution:**
```bash
# Generate a new secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=<generated-secret>
```

### Error: "DATABASE_URL is required"

**Solution:**
```env
# For local development (SQLite)
DATABASE_URL=file:./dev.db

# For production (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Error: "Cannot connect to database"

**Checklist:**
1. ✅ Database server is running
2. ✅ Connection string is correct
3. ✅ Username and password are correct
4. ✅ Database exists
5. ✅ Firewall allows connection
6. ✅ SSL mode is correct (for cloud databases)

**Test connection:**
```bash
# Test PostgreSQL connection
npm run db:test

# Or manually with psql
psql "postgresql://user:password@host:5432/database"
```

### Error: "Stripe key mismatch"

**Problem:** Mixing test and live keys

**Solution:**
```env
# Development: Use TEST keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Production: Use LIVE keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Error: "Redis connection failed"

**Solutions:**

1. **Check Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

2. **Check connection string:**
```env
# Local
REDIS_URL=redis://localhost:6379

# With password
REDIS_URL=redis://:password@host:6379

# Upstash (use REST API instead)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Vercel Deployment Issues

**Problem:** Environment variables not loading

**Solutions:**

1. **Check variable scope:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure variables are enabled for "Production"

2. **Redeploy:**
   - Environment variables require redeployment
   - Go to Deployments → Redeploy

3. **Check variable names:**
   - Must match exactly (case-sensitive)
   - Public variables must start with `NEXT_PUBLIC_`

---

## ✅ Validation & Testing

### Automatic Validation

The platform includes automatic environment validation at startup:

```typescript
// Runs automatically in src/instrumentation.ts
import { validateEnv } from '@/lib/env-validator';

validateEnv();
```

**Features:**
- ✅ Validates required variables
- ✅ Checks secret strength
- ✅ Validates URL formats
- ✅ Detects test credentials in production
- ✅ Validates Stripe key consistency

### Manual Testing

#### 1. Test Database Connection

```bash
npm run db:test
```

#### 2. Test Redis Connection

```bash
npm run redis:test
```

#### 3. Test Email Service

Create a test script or use the admin panel to send a test email.

#### 4. Test Stripe Integration

```bash
# Use Stripe CLI to test webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Environment Checklist

Use this before deploying:

```bash
# ✅ Required Variables
[ ] NODE_ENV is set
[ ] NEXT_PUBLIC_APP_URL is correct
[ ] DATABASE_URL is configured
[ ] NEXTAUTH_URL matches app URL
[ ] NEXTAUTH_SECRET is 32+ characters

# ✅ Production Security
[ ] Using PostgreSQL (not SQLite)
[ ] Using strong, unique secrets
[ ] Using production API keys (pk_live_, sk_live_)
[ ] Secrets are in Vercel Dashboard (not .env files)
[ ] .env files are in .gitignore

# ✅ Recommended Services
[ ] Redis is configured (performance)
[ ] Sentry is configured (error tracking)
[ ] Email service is configured
[ ] Cloudinary is configured (image uploads)

# ✅ Testing
[ ] Database connection tested
[ ] Email sending tested
[ ] Payment processing tested
[ ] Redis caching tested
```

---

## 📚 Additional Resources

### Documentation

- **Next.js Environment Variables:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **Vercel Environment Variables:** https://vercel.com/docs/environment-variables
- **Prisma Connection Strings:** https://www.prisma.io/docs/reference/database-reference/connection-urls

### Related Guides

- [Deployment Guide](./DEPLOYMENT.md)
- [Security Best Practices](../security/SECURITY.md)
- [Docker Setup](./DOCKER-COMPLETE-GUIDE.md)
- [API Documentation](../api/API-REFERENCE.md)

### Support

- **GitHub Issues:** https://github.com/yourusername/farmers-market/issues
- **Documentation:** See `docs/` directory
- **Discord Community:** [Your Discord Link]

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Copy template
cp .env.example .env.local

# Generate secrets
openssl rand -base64 32

# Test database
npm run db:test

# Test Redis
npm run redis:test

# Validate environment
npm run dev

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variable Prefixes

| Prefix | Usage | Example |
|--------|-------|---------|
| `NEXT_PUBLIC_` | Client-side accessible | `NEXT_PUBLIC_APP_URL` |
| (none) | Server-side only | `DATABASE_URL` |

### Need Help?

1. Check this guide first
2. Review `.env.example` file
3. Check [Troubleshooting](#troubleshooting) section
4. Search GitHub Issues
5. Create a new issue with details

---

**Last Updated:** January 13, 2025  
**Maintained by:** Farmers Market Platform Team  
**License:** MIT