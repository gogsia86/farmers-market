# 🔐 ENVIRONMENT VARIABLES DOCUMENTATION

## Farmers Market Platform - Security & Configuration

**Last Updated**: November 2025  
**Status**: Production Ready

---

## 🚀 REQUIRED ENVIRONMENT VARIABLES

### Database Configuration

```bash
# PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@localhost:5432/farmersmarket"

# Prisma Database URL (for migrations)
DIRECT_URL="postgresql://user:password@localhost:5432/farmersmarket"
```

### Authentication (NextAuth v5)

```bash
# NextAuth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-secret-key-here"

# NextAuth URL (your application URL)
NEXTAUTH_URL="http://localhost:3001"
```

### Stripe Payment Integration

```bash
# Stripe Publishable Key (client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe Secret Key (server-side)
STRIPE_SECRET_KEY="sk_test_..."

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 🔒 SECURITY FEATURES (NEW!)

### Demo Routes Protection

```bash
# Enable/disable demo routes (default: disabled in production)
# Set to "true" to enable demos in production (NOT RECOMMENDED)
ENABLE_DEMOS="false"
```

**Usage**: Controls access to `/demos/*` routes

- **Development**: Demos accessible to admin users
- **Production**: Demos blocked unless `ENABLE_DEMOS=true`
- **Recommendation**: Keep `false` in production

### Monitoring Routes Protection

```bash
# Enable/disable monitoring routes (default: disabled in production)
# Set to "true" to enable monitoring in production
ENABLE_MONITORING="true"
```

**Usage**: Controls access to `/monitoring` routes

- **Development**: Monitoring accessible to admin users
- **Production**: Monitoring blocked unless `ENABLE_MONITORING=true`
- **Recommendation**: Set `true` for production monitoring

### Diagnostic Tools Protection

```bash
# Diagnostic routes are always admin-only
# No environment variable needed - protected by authentication
```

**Usage**: Controls access to `/diagnostic` route

- Always requires admin authentication
- No public access allowed
- Automatically protected

---

## 📧 EMAIL CONFIGURATION

### SMTP Settings (Optional)

```bash
# Email Service Provider
EMAIL_FROM="noreply@farmersmarket.com"
EMAIL_SERVER="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

---

## 🤖 AI INTEGRATION (Optional)

### OpenAI Configuration

```bash
# OpenAI API Key (for AI features)
OPENAI_API_KEY="sk-..."

# Model Selection
OPENAI_MODEL="gpt-4-turbo-preview"
```

### Perplexity AI (Optional)

```bash
# Perplexity API Key
PERPLEXITY_API_KEY="pplx-..."
```

---

## 📊 MONITORING & ANALYTICS

### Application Insights (Optional)

```bash
# Azure Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=..."
```

### Sentry Error Tracking (Optional)

```bash
# Sentry DSN
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="farmers-market"
```

### Vercel Analytics (Optional)

```bash
# Automatically enabled on Vercel
# No configuration needed
```

---

## 🗺️ GEOCODING & MAPS (Optional)

### Google Maps

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
```

### Mapbox (Alternative)

```bash
# Mapbox Access Token
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1..."
```

---

## 📦 FILE STORAGE (Optional)

### Cloudinary

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### AWS S3 (Alternative)

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="farmers-market-uploads"
```

---

## 🔧 APPLICATION CONFIGURATION

### Node Environment

```bash
# Environment Mode
NODE_ENV="development"  # or "production" or "test"
```

### Application Settings

```bash
# Application Port (default: 3001)
PORT="3001"

# Base URL for the application
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# API Base URL (if separate)
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### Feature Flags

```bash
# Enable beta features
ENABLE_BETA_FEATURES="false"

# Enable experimental features
ENABLE_EXPERIMENTAL="false"

# Enable maintenance mode
MAINTENANCE_MODE="false"
```

---

## 📝 COMPLETE .env.example TEMPLATE

```bash
# ═══════════════════════════════════════════════════════════
# 🌾 FARMERS MARKET PLATFORM - ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────
# 🗄️ DATABASE CONFIGURATION (REQUIRED)
# ───────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket"

# ───────────────────────────────────────────────────────────
# 🔐 AUTHENTICATION (REQUIRED)
# ───────────────────────────────────────────────────────────
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3001"

# ───────────────────────────────────────────────────────────
# 💳 STRIPE PAYMENTS (REQUIRED FOR CHECKOUT)
# ───────────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ───────────────────────────────────────────────────────────
# 🔒 SECURITY FEATURES (PRODUCTION)
# ───────────────────────────────────────────────────────────
# Demo routes protection (keep false in production)
ENABLE_DEMOS="false"

# Monitoring routes (set true for production monitoring)
ENABLE_MONITORING="true"

# ───────────────────────────────────────────────────────────
# 📧 EMAIL CONFIGURATION (OPTIONAL)
# ───────────────────────────────────────────────────────────
EMAIL_FROM="noreply@farmersmarket.com"
EMAIL_SERVER="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER=""
EMAIL_PASSWORD=""

# ───────────────────────────────────────────────────────────
# 🤖 AI INTEGRATION (OPTIONAL)
# ───────────────────────────────────────────────────────────
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4-turbo-preview"
PERPLEXITY_API_KEY=""

# ───────────────────────────────────────────────────────────
# 📊 MONITORING & ANALYTICS (OPTIONAL)
# ───────────────────────────────────────────────────────────
APPLICATIONINSIGHTS_CONNECTION_STRING=""
SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT="farmers-market"

# ───────────────────────────────────────────────────────────
# 🗺️ MAPS & GEOCODING (OPTIONAL)
# ───────────────────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
NEXT_PUBLIC_MAPBOX_TOKEN=""

# ───────────────────────────────────────────────────────────
# 📦 FILE STORAGE (OPTIONAL)
# ───────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# ───────────────────────────────────────────────────────────
# 🔧 APPLICATION SETTINGS
# ───────────────────────────────────────────────────────────
NODE_ENV="development"
PORT="3001"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# ───────────────────────────────────────────────────────────
# 🎛️ FEATURE FLAGS (OPTIONAL)
# ───────────────────────────────────────────────────────────
ENABLE_BETA_FEATURES="false"
ENABLE_EXPERIMENTAL="false"
MAINTENANCE_MODE="false"
```

---

## 🚀 DEPLOYMENT ENVIRONMENTS

### Development (.env.development)

```bash
NODE_ENV="development"
ENABLE_DEMOS="true"        # Allow demos in dev
ENABLE_MONITORING="true"   # Allow monitoring in dev
```

### Staging (.env.staging)

```bash
NODE_ENV="production"
ENABLE_DEMOS="false"       # Block demos in staging
ENABLE_MONITORING="true"   # Allow monitoring in staging
```

### Production (.env.production)

```bash
NODE_ENV="production"
ENABLE_DEMOS="false"       # ⚠️ BLOCK demos in production
ENABLE_MONITORING="true"   # Allow admin monitoring
```

---

## 🔐 SECURITY BEST PRACTICES

### 1. Secret Generation

```bash
# Generate secure random secrets
openssl rand -base64 32

# Generate AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)
```

### 2. Never Commit Secrets

```bash
# ❌ NEVER commit these files:
.env
.env.local
.env.production.local

# ✅ ALWAYS commit:
.env.example  (without real secrets)
```

### 3. Environment-Specific Files

```bash
# Local development (not committed)
.env.local

# Production secrets (use hosting provider's env vars)
# Vercel: Project Settings → Environment Variables
# Railway: Project Settings → Variables
# AWS: Systems Manager → Parameter Store
```

### 4. Rotation Schedule

- **AUTH_SECRET**: Rotate every 90 days
- **API Keys**: Rotate when team member leaves
- **Database passwords**: Rotate quarterly
- **Webhook secrets**: Rotate after security incident

---

## 🧪 TESTING ENVIRONMENTS

### Test Environment (.env.test)

```bash
NODE_ENV="test"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"
ENABLE_DEMOS="true"
ENABLE_MONITORING="true"
```

### CI/CD Environment

```bash
# GitHub Actions / CI/CD
# Set these in repository secrets:
# - DATABASE_URL
# - AUTH_SECRET
# - STRIPE_SECRET_KEY (test keys)
```

---

## 📋 VALIDATION CHECKLIST

Before deploying to production, verify:

- [ ] All REQUIRED variables are set
- [ ] `ENABLE_DEMOS` is `false` in production
- [ ] `AUTH_SECRET` is a strong random value (32+ characters)
- [ ] Database URL points to production database
- [ ] Stripe keys are production keys (not test keys)
- [ ] Email configuration is tested
- [ ] Monitoring is enabled (`ENABLE_MONITORING=true`)
- [ ] All secrets are stored securely (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] Environment-specific variables are correct

---

## 🆘 TROUBLESHOOTING

### Issue: "Auth Secret Not Configured"

**Solution**: Generate and set `AUTH_SECRET`

```bash
export AUTH_SECRET=$(openssl rand -base64 32)
```

### Issue: "Database Connection Failed"

**Solution**: Check `DATABASE_URL` format and credentials

```bash
# Correct format:
postgresql://user:password@host:5432/database
```

### Issue: "Demo Routes Still Accessible in Production"

**Solution**: Ensure `ENABLE_DEMOS=false` in production environment

```bash
# Check current value
echo $ENABLE_DEMOS

# Set to false
export ENABLE_DEMOS=false
```

### Issue: "Stripe Payments Not Working"

**Solution**: Verify Stripe keys are for correct environment

```bash
# Test keys start with:
pk_test_... (publishable)
sk_test_... (secret)

# Live keys start with:
pk_live_... (publishable)
sk_live_... (secret)
```

---

## 📞 SUPPORT

For environment configuration help:

- Review: `docs/deployment/DEPLOY_CHECKLIST.md`
- Check: `docs/quick-reference/` for setup guides
- See: `.github/instructions/` for divine patterns

---

**Last Updated**: November 2025  
**Version**: 2.0 (Security Enhanced)  
**Status**: ✅ Production Ready
