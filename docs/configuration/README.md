# ⚙️ Configuration Documentation

> **Complete environment configuration, setup guides, and integration documentation**
>
> Your comprehensive resource for configuring the Farmers Market Platform

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Directory Contents](#directory-contents)
- [Environment Variables](#environment-variables)
- [Configuration Guides](#configuration-guides)
- [Service Integrations](#service-integrations)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## 🎯 Overview

### Purpose

This directory contains all configuration-related documentation including:

- **Environment Variables** - Complete reference for all env vars
- **Service Integration Guides** - AI, Email, Payments, SSL
- **Configuration Templates** - Ready-to-use configuration files
- **Security Guidelines** - Secrets management and best practices
- **Environment Setup** - Dev, staging, production configurations

### Philosophy

**Configuration Excellence**

- Secure by default (never commit secrets)
- Environment-specific configurations
- Validated configuration (fail fast on startup)
- Well-documented settings
- Easy local development setup
- Production-ready patterns

### Who Should Use This

- 👨‍💻 **Developers** - Local environment setup
- 🚀 **DevOps Engineers** - Production configuration
- 🔐 **Security Team** - Secrets and security settings
- 🧪 **QA Engineers** - Test environment configuration
- 📊 **Product Managers** - Feature flags and integrations

---

## ⚡ Quick Start

### For New Developers

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local with your values
vim .env.local

# 3. Verify configuration
npm run validate:env

# 4. Start development server
npm run dev:turbo
```

### Required Minimum Configuration

```bash
# .env.local (minimum for development)

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmers_market_dev"

# NextAuth
NEXTAUTH_SECRET="your-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"

# That's it! Optional services can be added later
```

---

## 📚 Directory Contents

### Overview

```
configuration/
├── README.md (this file)                    # 📖 Navigation hub
│
├── AI_SETUP_GUIDE.md                        # 🤖 AI/Agent Framework setup
├── EMAIL_CONFIGURATION.md                   # 📧 Email service setup
├── STRIPE_SETUP_GUIDE.md                    # 💳 Payment processing setup
├── SSL_SETUP.md                             # 🔒 SSL/TLS configuration
│
└── Related Files:
    ├── .env.example                         # 📝 Environment template
    ├── .env.local                           # 🔐 Your local config (gitignored)
    ├── .env.production                      # 🏭 Production config (encrypted)
    └── next.config.mjs                      # ⚙️ Next.js configuration

Total: 4 documentation files
```

---

## 🔐 Environment Variables

### Complete Environment Variables Reference

#### Core Application Settings

```bash
# ====================
# APPLICATION
# ====================
NODE_ENV="development"              # development | production | test
PORT=3001                           # Application port (default: 3000)
NEXT_PUBLIC_APP_URL="http://localhost:3001"  # Public URL for client-side
```

---

#### Database Configuration

```bash
# ====================
# DATABASE
# ====================
DATABASE_URL="postgresql://user:password@host:5432/database"

# Connection pool settings (optional)
# Format: DATABASE_URL?connection_limit=10&pool_timeout=20

# Direct connection (for migrations)
DIRECT_URL="${DATABASE_URL}"

# Development
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmers_market_dev"

# Production (example)
# DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/farmers_market_prod?sslmode=require"
```

---

#### Authentication (NextAuth v5)

```bash
# ====================
# AUTHENTICATION
# ====================

# Secret for JWT signing (REQUIRED)
# Generate: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-32-character-minimum-key"

# Application URL (REQUIRED)
NEXTAUTH_URL="http://localhost:3001"

# For production
# NEXTAUTH_URL="https://farmersmarket.com"

# Session settings (optional, defaults provided)
NEXTAUTH_SESSION_MAX_AGE=2592000   # 30 days in seconds
NEXTAUTH_SESSION_UPDATE_AGE=86400  # 24 hours in seconds
```

---

#### Email Configuration

```bash
# ====================
# EMAIL
# ====================

# SMTP Configuration (Resend, SendGrid, etc.)
EMAIL_FROM="noreply@farmersmarket.com"
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="re_xxxxxxxxxxxx"

# Or use Resend API (recommended)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"

# Email templates
EMAIL_TEMPLATES_DIR="./emails/templates"
```

**Reference:** [EMAIL_CONFIGURATION.md](./EMAIL_CONFIGURATION.md)

---

#### Payment Processing (Stripe)

```bash
# ====================
# STRIPE PAYMENTS
# ====================

# Publishable key (safe for client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"

# Secret key (server-side only, NEVER expose)
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"

# Webhook secret (for webhook signature verification)
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"

# Product/Price IDs
STRIPE_PRODUCT_ID="prod_xxxxxxxxxxxxx"
STRIPE_PRICE_ID="price_xxxxxxxxxxxxx"
```

**Reference:** [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)

---

#### AI & Agent Framework

```bash
# ====================
# AI CONFIGURATION
# ====================

# OpenAI
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxx"
OPENAI_MODEL="gpt-4"                # gpt-4, gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7

# Azure OpenAI (alternative)
AZURE_OPENAI_API_KEY="xxxxxxxxxxxxx"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT="gpt-4"

# Microsoft Agent Framework
AGENT_FRAMEWORK_API_KEY="xxxxxxxxxxxxx"
AGENT_FRAMEWORK_ENDPOINT="https://agent-framework.azure.com"

# Agricultural AI Settings
ENABLE_SEASONAL_AI=true
ENABLE_BIODYNAMIC_RECOMMENDATIONS=true
```

**Reference:** [AI_SETUP_GUIDE.md](./AI_SETUP_GUIDE.md)

---

#### Monitoring & Observability

```bash
# ====================
# MONITORING
# ====================

# Azure Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=xxxxxx;..."

# Sentry (Error Tracking)
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
SENTRY_ORG="your-org"
SENTRY_PROJECT="farmers-market"
SENTRY_AUTH_TOKEN="xxxxxxxxxxxxx"

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
OTEL_SERVICE_NAME="farmers-market-platform"
```

---

#### Storage & CDN

```bash
# ====================
# STORAGE
# ====================

# AWS S3 (for images, files)
AWS_ACCESS_KEY_ID="AKIAxxxxxxxxx"
AWS_SECRET_ACCESS_KEY="xxxxxxxxxxxxx"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="farmers-market-assets"

# Or Azure Blob Storage
AZURE_STORAGE_ACCOUNT_NAME="farmersmarket"
AZURE_STORAGE_ACCOUNT_KEY="xxxxxxxxxxxxx"
AZURE_STORAGE_CONTAINER="assets"

# CDN
CDN_URL="https://cdn.farmersmarket.com"
```

---

#### Feature Flags

```bash
# ====================
# FEATURE FLAGS
# ====================

# Core Features
ENABLE_FARMER_REGISTRATION=true
ENABLE_PRODUCT_REVIEWS=true
ENABLE_ORDER_TRACKING=true
ENABLE_NOTIFICATIONS=true

# Payment Methods
ENABLE_CREDIT_CARD_PAYMENTS=true
ENABLE_ACH_PAYMENTS=false
ENABLE_CRYPTO_PAYMENTS=false

# Agricultural Features
ENABLE_SEASONAL_FILTERING=true
ENABLE_BIODYNAMIC_CALENDAR=true
ENABLE_CSA_SUBSCRIPTIONS=false

# Beta Features (production use)
ENABLE_BETA_FEATURES=false
ENABLE_EXPERIMENTAL_AI=false
```

---

#### Development & Debugging

```bash
# ====================
# DEVELOPMENT
# ====================

# Logging
LOG_LEVEL="debug"                  # debug | info | warn | error
ENABLE_QUERY_LOGGING=true
ENABLE_REQUEST_LOGGING=true

# Development Tools
ENABLE_DEV_TOOLS=true
ENABLE_PRISMA_STUDIO=true
ENABLE_DEBUG_TOOLBAR=true

# Testing
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmers_market_test"
SKIP_ENV_VALIDATION=false          # true for CI/CD
```

---

#### Security Settings

```bash
# ====================
# SECURITY
# ====================

# CORS
CORS_ORIGIN="http://localhost:3001,https://farmersmarket.com"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes

# Session Security
SESSION_COOKIE_SECURE=true         # true in production
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE="lax"     # strict | lax | none

# Content Security Policy
CSP_ENABLED=true
CSP_REPORT_URI="https://farmersmarket.report-uri.com/r/d/csp/enforce"
```

---

### Environment Variable Validation

```typescript
// lib/config/env-validation.ts
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Optional services
  RESEND_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

---

## 📖 Configuration Guides

### 1. AI & Agent Framework Setup

**File:** [AI_SETUP_GUIDE.md](./AI_SETUP_GUIDE.md)

**Contents:**

- Microsoft Agent Framework integration
- OpenAI API configuration
- Azure OpenAI setup
- Agent orchestration patterns
- Agricultural AI features
- Seasonal recommendations
- Biodynamic calendar integration

**Quick Setup:**

```bash
# 1. Get OpenAI API key from https://platform.openai.com
OPENAI_API_KEY="sk-xxxxx"

# 2. Configure in .env.local
echo 'OPENAI_API_KEY="sk-xxxxx"' >> .env.local

# 3. Test AI integration
npm run test:ai
```

---

### 2. Email Configuration

**File:** [EMAIL_CONFIGURATION.md](./EMAIL_CONFIGURATION.md)

**Contents:**

- Email service providers (Resend, SendGrid, etc.)
- SMTP configuration
- Email templates
- Transactional emails
- Notification system
- Email testing

**Quick Setup:**

```bash
# Using Resend (recommended)
# 1. Sign up at https://resend.com
# 2. Create API key
# 3. Add to .env.local

RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@farmersmarket.com"

# 4. Test email
npm run test:email
```

---

### 3. Stripe Payment Setup

**File:** [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)

**Contents:**

- Stripe account setup
- API keys configuration
- Webhook configuration
- Payment flow implementation
- Subscription setup
- Testing with test cards
- Production deployment

**Quick Setup:**

```bash
# 1. Create Stripe account at https://stripe.com
# 2. Get test API keys from dashboard
# 3. Add to .env.local

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"

# 4. Setup webhook locally
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# 5. Add webhook secret
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

---

### 4. SSL/TLS Configuration

**File:** [SSL_SETUP.md](./SSL_SETUP.md)

**Contents:**

- SSL certificate setup
- Let's Encrypt integration
- Custom domain configuration
- HTTPS enforcement
- Certificate renewal
- Security headers

**Quick Setup:**

```bash
# For production with Let's Encrypt
# Using Certbot

# 1. Install certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Get certificate
sudo certbot --nginx -d farmersmarket.com -d www.farmersmarket.com

# 3. Auto-renewal (cron job)
sudo certbot renew --dry-run
```

---

## 🌍 Environment-Specific Configuration

### Development (.env.local)

```bash
# Development Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Database - Local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmers_market_dev"

# Auth - Development
NEXTAUTH_SECRET="dev-secret-min-32-chars-long-string"
NEXTAUTH_URL="http://localhost:3001"

# Logging - Verbose
LOG_LEVEL="debug"
ENABLE_QUERY_LOGGING=true

# Features - All enabled for testing
ENABLE_BETA_FEATURES=true
ENABLE_EXPERIMENTAL_AI=true
```

---

### Staging (.env.staging)

```bash
# Staging Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://staging.farmersmarket.com"

# Database - Staging PostgreSQL
DATABASE_URL="postgresql://user:pass@staging-db.example.com:5432/farmers_market_staging?sslmode=require"

# Auth - Production settings
NEXTAUTH_SECRET="${STAGING_NEXTAUTH_SECRET}"  # From secrets manager
NEXTAUTH_URL="https://staging.farmersmarket.com"

# Logging - Info level
LOG_LEVEL="info"
ENABLE_QUERY_LOGGING=false

# Features - Beta testing
ENABLE_BETA_FEATURES=true
ENABLE_EXPERIMENTAL_AI=false
```

---

### Production (.env.production)

```bash
# Production Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://farmersmarket.com"

# Database - Production PostgreSQL (managed)
DATABASE_URL="${DATABASE_URL}"  # From Azure Key Vault / AWS Secrets Manager

# Auth - Production secrets
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"  # From secrets manager
NEXTAUTH_URL="https://farmersmarket.com"

# Monitoring - Full telemetry
APPLICATIONINSIGHTS_CONNECTION_STRING="${APPINSIGHTS_CONNECTION_STRING}"
SENTRY_DSN="${SENTRY_DSN}"

# Logging - Error level only
LOG_LEVEL="error"
ENABLE_QUERY_LOGGING=false

# Features - Stable only
ENABLE_BETA_FEATURES=false
ENABLE_EXPERIMENTAL_AI=false

# Security - Strict
SESSION_COOKIE_SECURE=true
CSP_ENABLED=true
RATE_LIMIT_ENABLED=true
```

---

## 🔒 Security Best Practices

### Secrets Management

#### 1. Never Commit Secrets

```bash
# .gitignore (already configured)
.env.local
.env.production
.env*.local
*.key
*.pem
secrets/
```

#### 2. Use Environment Variables

```typescript
// ❌ BAD - Hardcoded secret
const apiKey = "sk_live_xxxxx";

// ✅ GOOD - Environment variable
const apiKey = process.env.STRIPE_SECRET_KEY;

// ✅ BETTER - Validated environment variable
import { env } from "@/lib/config/env-validation";
const apiKey = env.STRIPE_SECRET_KEY;
```

#### 3. Use Secrets Manager (Production)

```bash
# Azure Key Vault
az keyvault secret set \
  --vault-name "farmers-market-secrets" \
  --name "DATABASE-URL" \
  --value "postgresql://..."

# AWS Secrets Manager
aws secretsmanager create-secret \
  --name farmers-market/database-url \
  --secret-string "postgresql://..."

# Access in application
# Via environment variables injected at runtime
```

#### 4. Rotate Secrets Regularly

```bash
# Generate new secret
openssl rand -base64 32

# Update in all environments
# 1. Development: .env.local
# 2. Staging: Update secrets manager
# 3. Production: Update secrets manager
# 4. Redeploy applications
```

---

### Configuration Security Checklist

- [ ] No secrets committed to Git
- [ ] `.env.local` in `.gitignore`
- [ ] Production secrets in secrets manager (Azure Key Vault / AWS Secrets Manager)
- [ ] Environment variable validation on startup
- [ ] Separate configs for dev/staging/prod
- [ ] API keys have minimum required permissions
- [ ] Database user has minimum required privileges
- [ ] Secrets rotated every 90 days
- [ ] Monitoring for failed authentication attempts
- [ ] Rate limiting configured

---

## 🐛 Troubleshooting

### Common Configuration Issues

#### 1. "Environment variable not found"

**Symptom:** Application crashes on startup

**Solution:**

```bash
# Check .env.local exists
ls -la .env.local

# Verify required variables
grep "DATABASE_URL" .env.local
grep "NEXTAUTH_SECRET" .env.local

# Copy from template if missing
cp .env.example .env.local

# Validate environment
npm run validate:env
```

---

#### 2. "Database connection failed"

**Symptom:** Can't connect to database

**Solution:**

```bash
# Test database connection
psql "${DATABASE_URL}"

# Check database is running
docker ps | grep postgres

# Start database
docker-compose up -d postgres

# Verify DATABASE_URL format
# postgresql://user:password@host:port/database
echo $DATABASE_URL
```

---

#### 3. "Invalid NEXTAUTH_SECRET"

**Symptom:** Authentication errors

**Solution:**

```bash
# Generate new secret (minimum 32 characters)
openssl rand -base64 32

# Add to .env.local
echo 'NEXTAUTH_SECRET="generated-secret-here"' >> .env.local

# Restart application
npm run dev
```

---

#### 4. "Stripe webhook signature verification failed"

**Symptom:** Webhook events rejected

**Solution:**

```bash
# For local development, use Stripe CLI
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Copy webhook signing secret to .env.local
# STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# For production, configure webhook in Stripe dashboard
# https://dashboard.stripe.com/webhooks
```

---

#### 5. "CORS policy error"

**Symptom:** API requests blocked by browser

**Solution:**

```bash
# Add your domain to CORS_ORIGIN
CORS_ORIGIN="http://localhost:3001,https://farmersmarket.com"

# In next.config.mjs
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGIN },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE" },
      ],
    },
  ];
}
```

---

### Configuration Validation

```bash
# Run configuration validation
npm run validate:env

# Check specific configuration
npm run config:check

# Test database connection
npm run db:test

# Test email configuration
npm run email:test

# Verify all integrations
npm run integrations:verify
```

---

## 🔗 Related Documentation

### Essential Reading

- 📖 **[AI Setup Guide](./AI_SETUP_GUIDE.md)** - AI and Agent Framework
- 📧 **[Email Configuration](./EMAIL_CONFIGURATION.md)** - Email service setup
- 💳 **[Stripe Setup](./STRIPE_SETUP_GUIDE.md)** - Payment processing
- 🔒 **[SSL Setup](./SSL_SETUP.md)** - SSL/TLS configuration

### Setup & Deployment

- 🚀 **[Getting Started](../getting-started/README.md)** - Initial setup
- 🐳 **[Docker Setup](../docker/README.md)** - Container configuration
- 🚢 **[Deployment](../deployment/README.md)** - Production deployment
- 🗄️ **[Database](../database/README.md)** - Database configuration

### Development

- 💻 **[Development Guide](../development/README.md)** - Development workflow
- 🏗️ **[Architecture](../architecture/README.md)** - System architecture
- 🧪 **[Testing](../testing/README.md)** - Test configuration

### Operations

- 📊 **[Monitoring](../monitoring/)** - Application monitoring
- 🔍 **[Troubleshooting](../troubleshooting/)** - Common issues

---

## 📊 Directory Statistics

```yaml
Total Files: 4
Documentation Lines: ~3,000+
Configuration Files: 6+ (.env templates, configs)
Integrations Documented: 4 (AI, Email, Stripe, SSL)

Key Guides:
  - AI Setup: ⭐⭐⭐⭐⭐
  - Email Config: ⭐⭐⭐⭐⭐
  - Stripe Setup: ⭐⭐⭐⭐⭐
  - SSL Setup: ⭐⭐⭐⭐⭐

Security:
  - Secrets Management: Enterprise-grade
  - Environment Isolation: Complete
  - Validation: Automated
```

---

## 🎯 Quick Navigation

### By Role

**👨‍💻 Developer:**

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Development Config](#development-envlocal)

**🚀 DevOps Engineer:**

- [Production Config](#production-envproduction)
- [Secrets Management](#secrets-management)
- [Security Checklist](#configuration-security-checklist)

**🔐 Security Team:**

- [Security Best Practices](#security-best-practices)
- [Secrets Rotation](#secrets-management)
- [Configuration Security](#configuration-security-checklist)

### By Task

**🆕 Initial Setup:**

- Copy .env.example → Edit .env.local → Validate → Start

**🔧 Add Integration:**

- Choose service → Read guide → Get API keys → Configure → Test

**🐛 Debug Config:**

- Check .env.local → Validate → Test connection → Restart

**🚀 Production Deploy:**

- Secrets manager → Environment vars → Validate → Deploy

---

## ✨ Configuration Best Practices

> "Configuration is the bridge between code and reality - secure it with divine precision." 🔐⚡

### Core Principles

1. **Security First** - Never commit secrets, use secrets managers
2. **Environment Isolation** - Separate configs for dev/staging/prod
3. **Validation** - Validate on startup, fail fast
4. **Documentation** - Document every environment variable
5. **Defaults** - Provide sensible defaults for development
6. **Secrets Rotation** - Regular rotation of sensitive credentials
7. **Minimal Permissions** - Grant only required access
8. **Monitoring** - Track configuration changes and access

---

## 📝 Metadata

**Directory:** `docs/configuration/`  
**Purpose:** Environment configuration and service integration  
**Maintainers:** DevOps Team + Development Team  
**Last Updated:** December 2024  
**Status:** ✅ Active - Continuously Updated

**Quick Stats:**

- 📄 4 documentation files
- 📝 ~3,000+ lines of configuration docs
- 🔐 50+ environment variables documented
- 🔌 4 major integrations (AI, Email, Payments, SSL)
- ⭐⭐⭐⭐⭐ Enterprise-grade security

---

**⚙️ Secure configuration with divine precision! 🔐✨**
