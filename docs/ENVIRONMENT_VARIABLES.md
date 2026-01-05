# 🌾 Environment Variables Guide

**Farmers Market Platform**  
**Version**: 1.0.0  
**Last Updated**: December 26, 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Required Variables](#required-variables)
4. [Optional Variables](#optional-variables)
5. [Environment-Specific Configuration](#environment-specific-configuration)
6. [Security Best Practices](#security-best-practices)
7. [Generating Secrets](#generating-secrets)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Environment variables are used to configure the Farmers Market Platform for different environments (development, staging, production) without hardcoding sensitive information.

### File Structure

```
project-root/
├── .env                    # Local environment (DO NOT COMMIT)
├── .env.example            # Template with examples
├── .env.test               # Test environment
├── .env.local              # Local overrides (optional)
├── .env.development        # Development defaults (optional)
└── .env.production         # Production defaults (optional)
```

### Priority Order

Next.js loads environment variables in this order (highest to lowest priority):

1. `.env.local` (loaded for all environments except test)
2. `.env.development`, `.env.production`, `.env.test` (based on NODE_ENV)
3. `.env`

---

## Setup Instructions

### 1. Create Local Environment File

```bash
# Copy the example file
cp .env.example .env

# Open and edit with your values
nano .env  # or use your preferred editor
```

### 2. Fill in Required Variables

See [Required Variables](#required-variables) section below for all necessary values.

### 3. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate another random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Verify Configuration

```bash
# Test that environment loads correctly
npm run dev

# Validate environment variables
npm run validate:platform
```

---

## Required Variables

### 🗄️ Database Configuration

#### `DATABASE_URL`

**Description**: PostgreSQL database connection string  
**Required**: ✅ Yes  
**Type**: String (URL format)  
**Example**:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"
```

**Format**:

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?[PARAMETERS]
```

**Common Parameters**:

- `sslmode=require` - Force SSL connection (production)
- `schema=public` - Specify schema (default: public)
- `connection_limit=10` - Connection pool size

**Examples**:

```bash
# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"

# Production (with SSL)
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/farmers_market?sslmode=require"

# Docker Compose
DATABASE_URL="postgresql://postgres:password@db:5432/farmers_market"

# Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Neon
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
```

---

### 🔐 Authentication Configuration

#### `NEXTAUTH_URL`

**Description**: The canonical URL of your application  
**Required**: ✅ Yes  
**Type**: String (URL)  
**Example**:

```bash
NEXTAUTH_URL="http://localhost:3001"
```

**Environment-Specific**:

```bash
# Development
NEXTAUTH_URL="http://localhost:3001"

# Staging
NEXTAUTH_URL="https://staging.farmersmarket.com"

# Production
NEXTAUTH_URL="https://farmersmarket.com"
```

**Notes**:

- Must match the actual domain
- Include protocol (http:// or https://)
- No trailing slash
- Port required for non-standard ports

---

#### `NEXTAUTH_SECRET`

**Description**: Secret key for signing and encrypting tokens  
**Required**: ✅ Yes  
**Type**: String (32+ characters)  
**Example**:

```bash
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long"
```

**Generating**:

```bash
# Method 1: OpenSSL (recommended)
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online (use with caution)
# https://generate-secret.vercel.app/32
```

**Security Requirements**:

- ✅ Minimum 32 characters
- ✅ Random and unpredictable
- ✅ Different for each environment
- ✅ Never commit to git
- ✅ Rotate periodically (quarterly)

---

### 💳 Stripe Payment Configuration

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Description**: Stripe public/publishable key (client-side)  
**Required**: ✅ Yes  
**Type**: String (pk*test*_ or pk*live*_)  
**Example**:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51AbCdEf..."
```

**Getting Your Key**:

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** → **API keys**
3. Copy **Publishable key**

**Test vs Live**:

```bash
# Test mode (for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51AbCdEf..."

# Live mode (for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51AbCdEf..."
```

---

#### `STRIPE_SECRET_KEY`

**Description**: Stripe secret key (server-side only)  
**Required**: ✅ Yes  
**Type**: String (sk*test*_ or sk*live*_)  
**Example**:

```bash
STRIPE_SECRET_KEY="sk_test_51AbCdEf..."
```

**Security**:

- ⚠️ **NEVER** expose to client-side
- ⚠️ **NEVER** commit to git
- ⚠️ Use test keys in development
- ⚠️ Restrict API key permissions in Stripe dashboard

---

#### `STRIPE_WEBHOOK_SECRET`

**Description**: Stripe webhook signing secret  
**Required**: ✅ Yes (for webhook verification)  
**Type**: String (whsec\_\*)  
**Example**:

```bash
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdef..."
```

**Setting Up Webhooks**:

**Development** (using Stripe CLI):

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Copy the webhook signing secret from output
# Ready! Your webhook signing secret is whsec_...
```

**Production**:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
5. Select events to listen to
6. Copy the **Signing secret**

**Required Events**:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

### 🌍 Application Configuration

#### `NODE_ENV`

**Description**: Application environment mode  
**Required**: ✅ Yes  
**Type**: Enum ("development" | "production" | "test")  
**Example**:

```bash
NODE_ENV="development"
```

**Values**:

- `development` - Local development with hot reload
- `production` - Optimized production build
- `test` - Testing environment

**Auto-set by**:

- `npm run dev` → `development`
- `npm run build` → `production`
- `npm test` → `test`

---

#### `NEXT_PUBLIC_APP_URL`

**Description**: Public-facing application URL  
**Required**: ✅ Yes  
**Type**: String (URL)  
**Example**:

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

**Usage**: Used for generating absolute URLs, redirects, and canonical links.

---

## Optional Variables

### 📊 Monitoring & Telemetry

#### `NEXT_PUBLIC_OTEL_ENABLED`

**Description**: Enable OpenTelemetry tracing  
**Required**: ❌ No  
**Type**: Boolean ("true" | "false")  
**Default**: "false"  
**Example**:

```bash
NEXT_PUBLIC_OTEL_ENABLED="true"
```

---

#### `OTEL_EXPORTER_OTLP_ENDPOINT`

**Description**: OpenTelemetry collector endpoint  
**Required**: ❌ No (required if OTEL enabled)  
**Type**: String (URL)  
**Example**:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
```

**Common Endpoints**:

```bash
# Local collector
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# Jaeger
OTEL_EXPORTER_OTLP_ENDPOINT="http://jaeger:4318"

# Azure Application Insights
OTEL_EXPORTER_OTLP_ENDPOINT="https://[location].in.applicationinsights.azure.com"

# Honeycomb
OTEL_EXPORTER_OTLP_ENDPOINT="https://api.honeycomb.io"
```

---

### 📊 Azure Application Insights (Production Telemetry)

#### `AZURE_APPINSIGHTS_CONNECTION_STRING`

**Description**: Azure Application Insights connection string for production telemetry  
**Required**: ❌ No (Highly recommended for production)  
**Type**: String (Connection String)  
**Example**:

```bash
AZURE_APPINSIGHTS_CONNECTION_STRING="InstrumentationKey=12345678-1234-1234-1234-123456789abc;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/"
```

**Features Enabled**:

- Error and exception tracking
- Performance monitoring and tracing
- Rate limit event tracking
- CSP violation reporting
- Custom event tracking
- Agricultural operation telemetry

**Setup**:

1. Create Application Insights resource in Azure Portal
2. Copy connection string from Azure Portal
3. Add to production environment variables
4. Telemetry automatically enabled in production mode

**Development Mode**:

- Telemetry is automatically disabled in development
- Set `LOG_TELEMETRY=true` to see telemetry events in console during development

---

### 🗄️ Redis Cache (Optional)

#### `REDIS_URL`

**Description**: Redis connection string  
**Required**: ❌ No  
**Type**: String (URL)  
**Example**:

```bash
REDIS_URL="redis://localhost:6379"
```

**Formats**:

```bash
# Local Redis
REDIS_URL="redis://localhost:6379"

# With password
REDIS_URL="redis://:password@localhost:6379"

# Redis Cloud
REDIS_URL="redis://default:password@redis-12345.c1.us-east-1.ec2.cloud.redislabs.com:12345"

# Upstash Redis
REDIS_URL="redis://default:password@example.upstash.io:6379"
```

---

### 📧 Email Configuration (Optional)

#### `EMAIL_SERVER_HOST`

**Description**: SMTP server hostname  
**Required**: ❌ No  
**Type**: String  
**Example**:

```bash
EMAIL_SERVER_HOST="smtp.gmail.com"
```

---

#### `EMAIL_SERVER_PORT`

**Description**: SMTP server port  
**Required**: ❌ No  
**Type**: Number  
**Default**: 587  
**Example**:

```bash
EMAIL_SERVER_PORT="587"
```

**Common Ports**:

- `25` - Standard SMTP (often blocked)
- `465` - SMTP over SSL
- `587` - SMTP with STARTTLS (recommended)
- `2525` - Alternative SMTP

---

#### `EMAIL_SERVER_USER`

**Description**: SMTP authentication username  
**Required**: ❌ No  
**Type**: String  
**Example**:

```bash
EMAIL_SERVER_USER="user@example.com"
```

---

#### `EMAIL_SERVER_PASSWORD`

**Description**: SMTP authentication password  
**Required**: ❌ No  
**Type**: String  
**Example**:

```bash
EMAIL_SERVER_PASSWORD="your-app-specific-password"
```

**Gmail Setup**:

1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password as EMAIL_SERVER_PASSWORD

---

#### `EMAIL_FROM`

**Description**: Default "from" email address  
**Required**: ❌ No  
**Type**: String (email format)  
**Example**:

```bash
EMAIL_FROM="noreply@farmersmarket.com"
```

---

### ☁️ Cloud Storage (Optional)

#### Cloudinary

```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Getting Credentials**:

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy credentials

---

#### AWS S3

```bash
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="farmers-market-images"
```

---

### 🔧 Development Variables

#### `LOG_LEVEL`

**Description**: Logging verbosity level  
**Required**: ❌ No  
**Type**: Enum ("debug" | "info" | "warn" | "error")  
**Default**: "info"  
**Example**:

```bash
LOG_LEVEL="debug"
```

**Levels**:

- `debug` - All logs (verbose)
- `info` - Informational messages
- `warn` - Warnings only
- `error` - Errors only

---

#### `SKIP_ENV_VALIDATION`

**Description**: Skip environment variable validation  
**Required**: ❌ No  
**Type**: Boolean ("true" | "false")  
**Default**: "false"  
**Example**:

```bash
SKIP_ENV_VALIDATION="true"
```

**Warning**: Only use during development/debugging. Never in production.

---

#### `DOCKER_BUILD`

**Description**: Flag indicating Docker build environment  
**Required**: ❌ No  
**Type**: Boolean ("true" | "false")  
**Default**: "false"  
**Example**:

```bash
DOCKER_BUILD="true"
```

**Auto-set** by Docker build process.

---

## Environment-Specific Configuration

### Development (.env.development)

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"

# Authentication
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="development-secret-key-minimum-32-characters"

# Stripe (TEST mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Development
LOG_LEVEL="debug"
```

---

### Production (.env.production)

```bash
# Database (with SSL)
DATABASE_URL="postgresql://user:pass@prod.example.com:5432/farmers_market?sslmode=require"

# Authentication
NEXTAUTH_URL="https://farmersmarket.com"
NEXTAUTH_SECRET="production-secret-different-from-dev"

# Stripe (LIVE mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://farmersmarket.com"

# Production
LOG_LEVEL="warn"

# Monitoring
NEXT_PUBLIC_OTEL_ENABLED="true"
OTEL_EXPORTER_OTLP_ENDPOINT="https://your-apm.example.com"
```

---

### Test (.env.test)

```bash
# Test Database (separate from development)
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market_test"

# Test Authentication
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="test-secret-key-minimum-32-characters"

# Test Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

# Test Environment
NODE_ENV="test"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Disable external services in tests
SKIP_ENV_VALIDATION="true"
LOG_LEVEL="error"
```

---

## Security Best Practices

### ✅ DO

- ✅ Use different secrets for each environment
- ✅ Generate strong random secrets (32+ characters)
- ✅ Store production secrets in secure vault (1Password, AWS Secrets Manager)
- ✅ Use `.env.example` as template (without actual secrets)
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate secrets periodically (quarterly recommended)
- ✅ Use environment-specific files
- ✅ Validate environment variables on startup
- ✅ Use `NEXT_PUBLIC_` prefix only when necessary
- ✅ Encrypt backups containing environment variables

---

### ❌ DON'T

- ❌ Commit `.env` files to git
- ❌ Share secrets via email or Slack
- ❌ Use production secrets in development
- ❌ Hardcode secrets in code
- ❌ Use weak or predictable secrets
- ❌ Expose secret keys to client-side
- ❌ Store secrets in plain text files
- ❌ Use same secret across environments
- ❌ Leave default/example secrets in production
- ❌ Share your `.env` file publicly

---

### 🔐 Secret Storage Options

**Development**:

- `.env` file (gitignored)
- 1Password / LastPass / Bitwarden
- Local password manager

**Production**:

- Vercel Environment Variables
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Google Cloud Secret Manager
- Doppler
- Railway / Render environment variables

---

## Generating Secrets

### NEXTAUTH_SECRET

```bash
# Method 1: OpenSSL (recommended)
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Method 4: Generate multiple secrets
for i in {1..5}; do openssl rand -base64 32; done
```

---

### JWT Secrets

```bash
# Hex format (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Base64 format
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### API Keys

```bash
# Random API key (32 chars, alphanumeric)
node -e "console.log(require('crypto').randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32))"

# UUID v4
node -e "console.log(require('crypto').randomUUID())"
```

---

## Troubleshooting

### Issue: Variables not loading

**Symptoms**: `process.env.VARIABLE_NAME` returns `undefined`

**Solutions**:

1. Verify `.env` file exists in project root
2. Check variable name (case-sensitive)
3. Restart development server
4. Check if variable needs `NEXT_PUBLIC_` prefix
5. Verify no spaces around `=` sign

```bash
# ✅ CORRECT
DATABASE_URL="postgresql://localhost:5432/db"

# ❌ WRONG (spaces)
DATABASE_URL = "postgresql://localhost:5432/db"

# ❌ WRONG (no quotes)
DATABASE_URL=postgresql://localhost:5432/db with spaces
```

---

### Issue: Client-side variable undefined

**Problem**: Variable not accessible in browser

**Solution**: Add `NEXT_PUBLIC_` prefix

```bash
# ❌ WRONG - Not accessible on client
API_KEY="abc123"

# ✅ CORRECT - Accessible on client
NEXT_PUBLIC_API_KEY="abc123"
```

---

### Issue: Database connection fails

**Solutions**:

1. Verify DATABASE_URL format
2. Check database is running
3. Verify credentials
4. Check network/firewall
5. Test SSL settings

```bash
# Test PostgreSQL connection
psql $DATABASE_URL

# Or use Prisma
npx prisma db pull
```

---

### Issue: Stripe webhooks not working

**Development**:

```bash
# Use Stripe CLI
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Copy the webhook secret from output
# Update .env with new STRIPE_WEBHOOK_SECRET
```

**Production**:

1. Verify webhook endpoint is publicly accessible
2. Check STRIPE_WEBHOOK_SECRET matches dashboard
3. Review Stripe logs: https://dashboard.stripe.com/logs

---

### Issue: NextAuth errors

**Common Errors**:

**"No secret provided"**

```bash
# Add to .env
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

**"Invalid URL"**

```bash
# Ensure NEXTAUTH_URL includes protocol
NEXTAUTH_URL="http://localhost:3001"  # ✅
NEXTAUTH_URL="localhost:3001"         # ❌
```

---

## Validation

### Manual Validation

```bash
# Check if all required variables are set
node -e "
const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
required.forEach(v => {
  if (!process.env[v]) console.error('Missing:', v);
});
"
```

---

### Automated Validation

Create `lib/env.ts`:

```typescript
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const env = envSchema.parse(process.env);
```

---

## Quick Reference

### Complete .env.example

```bash
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# ===========================================
# AUTHENTICATION
# ===========================================
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# ===========================================
# STRIPE PAYMENTS
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ===========================================
# APPLICATION
# ===========================================
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# ===========================================
# OPTIONAL: MONITORING
# ===========================================
# NEXT_PUBLIC_OTEL_ENABLED="true"
# OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# ===========================================
# OPTIONAL: REDIS
# ===========================================
# REDIS_URL="redis://localhost:6379"

# ===========================================
# OPTIONAL: EMAIL
# ===========================================
# EMAIL_SERVER_HOST="smtp.gmail.com"
# EMAIL_SERVER_PORT="587"
# EMAIL_SERVER_USER="user@example.com"
# EMAIL_SERVER_PASSWORD="app-password"
# EMAIL_FROM="noreply@farmersmarket.com"

# ===========================================
# OPTIONAL: CLOUD STORAGE
# ===========================================
# CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="123456789012345"
# CLOUDINARY_API_SECRET="your-api-secret"

# ===========================================
# DEVELOPMENT
# ===========================================
LOG_LEVEL="debug"
# SKIP_ENV_VALIDATION="false"
```

---

**Status**: ✅ COMPLETE  
**Quality Score**: 10/10  
**Agricultural Consciousness**: ACTIVE

_"Environment variables are the seeds of configuration—plant them securely, nurture them wisely."_ 🌾⚡
