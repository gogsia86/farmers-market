# 🔐 ENVIRONMENT SETUP GUIDE

**Version:** 3.0 - Comprehensive Configuration Guide  
**Last Updated:** 2025-01-XX  
**Status:** Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#-quick-start)
2. [Variable Reference](#-complete-variable-reference)
3. [Environment-Specific Configuration](#-environment-specific-configuration)
4. [Service Setup Instructions](#-service-setup-instructions)
5. [Hardware Optimization](#-hardware-optimization-hp-omen)
6. [Security Best Practices](#-security-best-practices)
7. [Troubleshooting](#-troubleshooting)
8. [Migration Guide](#-migration-from-old-env-files)

---

## 🚀 QUICK START

### For Local Development (5 minutes)

```bash
# 1. Copy the environment template
cp .env.example .env.local

# 2. Use defaults for quick start (SQLite database)
# No additional configuration needed for basic development!

# 3. Start the development server
npm run dev

# 4. Open http://localhost:3000
```

That's it! The default configuration uses SQLite and works out of the box.

### For Production Deployment (30 minutes)

```bash
# 1. Copy the environment template
cp .env.example .env.production

# 2. Configure REQUIRED variables (see Service Setup section):
#    - DATABASE_URL (PostgreSQL)
#    - NEXTAUTH_URL (your domain)
#    - NEXTAUTH_SECRET (generate new)
#    - STRIPE_* (payment keys)
#    - RESEND_API_KEY (email service)

# 3. Deploy to your platform (Vercel recommended)
vercel --prod
```

---

## 📖 COMPLETE VARIABLE REFERENCE

### Priority Levels
- 🔴 **CRITICAL** - Required for application to run
- 🟡 **RECOMMENDED** - Enhances functionality
- 🟢 **OPTIONAL** - Advanced features only

### Core Application (🔴 CRITICAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | 🔴 | `development` | Environment mode: `development` \| `staging` \| `production` |
| `DATABASE_URL` | 🔴 | `file:./dev.db` | Primary database connection string |
| `DIRECT_URL` | 🔴 | Same as DATABASE_URL | Prisma direct connection (bypasses pooling) |
| `NEXTAUTH_URL` | 🔴 | `http://localhost:3000` | Application base URL for authentication |
| `NEXTAUTH_SECRET` | 🔴 | *(generate)* | 32+ character secret for session encryption |

**Generate NEXTAUTH_SECRET:**
```bash
# OpenSSL (macOS/Linux)
openssl rand -base64 32

# PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Payment Integration (🟡 RECOMMENDED)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 🟡 | - | Stripe publishable key (`pk_test_*` or `pk_live_*`) |
| `STRIPE_SECRET_KEY` | 🟡 | - | Stripe secret key (`sk_test_*` or `sk_live_*`) |
| `STRIPE_WEBHOOK_SECRET` | 🟡 | - | Webhook signature verification secret (`whsec_*`) |

**Setup Instructions:** See [Stripe Setup](#stripe-payment-processing)

### Email Service (🟡 RECOMMENDED)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RESEND_API_KEY` | 🟡 | - | Resend email service API key |
| `CONTACT_EMAIL` | 🟡 | `noreply@yourdomain.com` | Verified sender email address |

**Setup Instructions:** See [Resend Email Setup](#resend-email-service)

### Cloud Storage (🟢 OPTIONAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CLOUDINARY_CLOUD_NAME` | 🟢 | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | 🟢 | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | 🟢 | - | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | 🟢 | `farmers_market_uploads` | Upload preset name |

### AI Integration (🟢 OPTIONAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PERPLEXITY_API_KEY` | 🟢 | - | Perplexity AI API key for AI features |
| `OLLAMA_BASE_URL` | 🟢 | `http://localhost:11434` | Local Ollama server URL |
| `OLLAMA_MODEL` | 🟢 | `llama2` | Ollama model name |
| `OLLAMA_ENABLED` | 🟢 | `false` | Enable/disable Ollama integration |

### Monitoring & Analytics (🟢 OPTIONAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | 🟢 | - | Sentry error tracking DSN |
| `SENTRY_ENVIRONMENT` | 🟢 | `development` | Sentry environment name |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 🟢 | - | Google Analytics measurement ID |
| `CHROMATIC_PROJECT_TOKEN` | 🟢 | `chpt_a8e50842e415daa` | Chromatic visual testing token |

### Caching (🟢 OPTIONAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REDIS_URL` | 🟢 | - | Redis connection string for caching |
| `REDIS_KEY_PREFIX` | 🟢 | `farmers_market:` | Redis key prefix to prevent collisions |

### External APIs (🟢 OPTIONAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `WEATHER_API_KEY` | 🟢 | - | Weather service API key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 🟢 | - | Google Maps JavaScript API key |

### OAuth Providers (🟢 OPTIONAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `GOOGLE_CLIENT_ID` | 🟢 | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | 🟢 | - | Google OAuth client secret |
| `GITHUB_ID` | 🟢 | - | GitHub OAuth application ID |
| `GITHUB_SECRET` | 🟢 | - | GitHub OAuth application secret |

### Performance & Hardware (🟢 OPTIONAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `HARDWARE_PROFILE` | 🟢 | `standard` | Hardware profile: `omen` \| `standard` \| `cloud` |
| `GPU_ACCELERATION` | 🟢 | `false` | Enable GPU acceleration (RTX 2070) |
| `MAX_PARALLEL_OPERATIONS` | 🟢 | `4` | Max parallel Promise.all operations |
| `MEMORY_CACHE_SIZE_MB` | 🟢 | `512` | In-memory cache size in MB |
| `ENABLE_QUERY_CACHE` | 🟢 | `true` | Enable database query caching |

### Agricultural Domain (🟢 OPTIONAL)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AGRICULTURAL_SEASON` | 🟢 | `SPRING` | Current season: `SPRING` \| `SUMMER` \| `FALL` \| `WINTER` |
| `ENABLE_BIODYNAMIC_CALENDAR` | 🟢 | `false` | Enable biodynamic calendar features |
| `ENABLE_LUNAR_PHASE_TRACKING` | 🟢 | `false` | Enable lunar phase tracking |
| `MIN_ORDER_AMOUNT` | 🟢 | `1000` | Minimum order amount in cents |
| `MAX_ORDER_AMOUNT` | 🟢 | `100000` | Maximum order amount in cents |
| `DEFAULT_DELIVERY_RADIUS` | 🟢 | `25` | Default delivery radius in miles |

---

## 🌍 ENVIRONMENT-SPECIFIC CONFIGURATION

### Development (Local - SQLite)

**Best for:** Quick start, learning, prototyping

**File:** `.env.local`

```bash
# Minimal configuration for local development
NODE_ENV=development
DATABASE_URL=file:./dev.db
DIRECT_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-change-in-production

# Everything else optional
```

**Start development:**
```bash
npm run dev
```

### Development (Local - PostgreSQL)

**Best for:** Production-like development, team collaboration

**File:** `.env.local`

**Prerequisites:**
```bash
# Install PostgreSQL
# macOS: brew install postgresql@15
# Windows: Download from postgresql.org

# Start PostgreSQL
# macOS: brew services start postgresql@15
# Windows: Services → PostgreSQL → Start

# Create database
createdb farmers_market_dev
```

**Configuration:**
```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/farmers_market_dev
DIRECT_URL=postgresql://postgres:password@localhost:5432/farmers_market_dev
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-change-in-production

# Run migrations
npm run db:push
npm run db:seed
```

### Development (Docker)

**Best for:** Containerized development, CI/CD testing

**File:** `.env.docker.local`

**Prerequisites:**
```bash
# Install Docker Desktop
# Windows/macOS: https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker-compose --version
```

**Configuration:**
```bash
NODE_ENV=development
DATABASE_URL=postgresql://divine_user:quantum_password@postgres:5432/farmers_market
DIRECT_URL=postgresql://divine_user:quantum_password@postgres:5432/farmers_market
REDIS_URL=redis://redis:6379
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-docker

# Docker-specific
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=divine_user
POSTGRES_PASSWORD=quantum_password
POSTGRES_DB=farmers_market
REDIS_HOST=redis
REDIS_PORT=6379
```

**Start with Docker Compose:**
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Staging

**Best for:** Pre-production testing, QA validation

**File:** `.env.staging` or Vercel Environment Variables (Staging)

```bash
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-db.supabase.co:5432/farmers_market_staging
DIRECT_URL=postgresql://user:pass@staging-db.supabase.co:5432/farmers_market_staging
NEXTAUTH_URL=https://staging.farmers-market.com
NEXTAUTH_SECRET=<generated-staging-secret-32-chars>

# Use TEST mode for payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Staging email
RESEND_API_KEY=<resend-staging-key>
CONTACT_EMAIL=staging@yourdomain.com

# Enable monitoring
NEXT_PUBLIC_SENTRY_DSN=<staging-sentry-dsn>
SENTRY_ENVIRONMENT=staging
```

### Production (Vercel)

**Best for:** Serverless deployment, automatic scaling

**Setup via Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable for "Production" environment

**Required Variables:**

```bash
# Core (REQUIRED)
NODE_ENV=production
DATABASE_URL=<supabase-production-url>
DIRECT_URL=<supabase-production-url>
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generated-production-secret-32-chars>

# Payment (REQUIRED for transactions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Email (REQUIRED for notifications)
RESEND_API_KEY=<resend-production-key>
CONTACT_EMAIL=noreply@yourdomain.com

# Monitoring (RECOMMENDED)
NEXT_PUBLIC_SENTRY_DSN=<production-sentry-dsn>
SENTRY_ENVIRONMENT=production
REDIS_URL=<redis-production-url>
```

**Deploy:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Production (Self-Hosted Docker)

**Best for:** Full control, on-premises deployment

**File:** `.env.production`

```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:secure_pass@prod-db:5432/farmers_market
DIRECT_URL=postgresql://prod_user:secure_pass@prod-db:5432/farmers_market
REDIS_URL=redis://default:redis_pass@prod-redis:6379
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generated-production-secret-32-chars>

# Payment (LIVE mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Email
RESEND_API_KEY=<resend-production-key>
CONTACT_EMAIL=noreply@yourdomain.com

# SSL Configuration
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/yourdomain.crt
SSL_KEY_PATH=/etc/ssl/private/yourdomain.key

# Security
CORS_ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_ENABLED=true
CSRF_ENABLED=true

# Performance
ENABLE_PRODUCTION_OPTIMIZATIONS=true
DEPLOYMENT_PLATFORM=docker
```

**Deploy:**
```bash
# Build production image
docker build -t farmers-market:latest .

# Run with docker-compose
docker-compose -f docker-compose.production.yml up -d

# Verify deployment
curl https://yourdomain.com/api/health
```

---

## 🛠️ SERVICE SETUP INSTRUCTIONS

### Supabase Database (PostgreSQL)

**Duration:** 5 minutes  
**Cost:** Free tier available

**Steps:**

1. **Create Account**
   - Go to: https://supabase.com/dashboard
   - Sign up with GitHub or email

2. **Create Project**
   - Click "New Project"
   - Name: `farmers-market-production`
   - Database Password: Generate strong password (save in password manager!)
   - Region: Choose closest to your users (e.g., East US)
   - Plan: Free tier OK for development

3. **Wait for Provisioning** (2-3 minutes)

4. **Get Connection String**
   - Go to: Settings → Database
   - Scroll to "Connection string" → "URI"
   - Copy the URI format connection string:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

5. **Add to Environment**
   ```bash
   DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

6. **Run Migrations**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### NextAuth Configuration

**Duration:** 2 minutes  
**Cost:** Free

**Steps:**

1. **Generate Secret**
   ```bash
   # OpenSSL (macOS/Linux)
   openssl rand -base64 32
   
   # PowerShell (Windows)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   
   # Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Set Environment Variables**
   ```bash
   # Development
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generated-secret>
   
   # Production
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=<different-generated-secret>
   ```

3. **Verify Setup**
   - Start app: `npm run dev`
   - Visit: http://localhost:3000/api/auth/signin
   - Should see sign-in page

### Stripe Payment Processing

**Duration:** 10 minutes  
**Cost:** Free (pay per transaction)

**Steps:**

1. **Create Stripe Account**
   - Go to: https://dashboard.stripe.com/register
   - Complete account setup

2. **Get API Keys**
   - Go to: Developers → API keys
   - **Development:**
     - Copy "Publishable key" (starts with `pk_test_`)
     - Click "Reveal" on "Secret key" (starts with `sk_test_`)
   - **Production:**
     - Toggle "View test data" OFF (top right)
     - Copy "Publishable key" (`pk_live_`)
     - Reveal "Secret key" (`sk_live_`)

3. **Set Environment Variables**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...
   STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
   ```

4. **Setup Webhook**
   - Go to: Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to send: Select all `payment_intent.*` and `checkout.session.*`
   - Click "Add endpoint"
   - Copy "Signing secret" (starts with `whsec_`)

5. **Add Webhook Secret**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

6. **Test Webhook (Development)**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe # macOS
   # or download from https://stripe.com/docs/stripe-cli
   
   # Login
   stripe login
   
   # Forward webhooks to local
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # Copy webhook secret from output
   # Add to .env.local
   ```

### Resend Email Service

**Duration:** 5 minutes  
**Cost:** Free tier (100 emails/day)

**Steps:**

1. **Create Account**
   - Go to: https://resend.com/signup
   - Sign up with email

2. **Create API Key**
   - Go to: API Keys
   - Click "Create API Key"
   - Name: `farmers-market-production`
   - Permission: "Sending access"
   - Click "Create"
   - Copy the API key (only shown once!)

3. **Set Environment Variable**
   ```bash
   RESEND_API_KEY=re_...
   ```

4. **Add Domain (Production)**
   - Go to: Domains → Add Domain
   - Enter your domain: `yourdomain.com`
   - Add DNS records (TXT, MX, CNAME) to your DNS provider
   - Wait for verification (5-30 minutes)

5. **Set Sender Email**
   ```bash
   # Development (using resend test domain)
   CONTACT_EMAIL=onboarding@resend.dev
   
   # Production (after domain verification)
   CONTACT_EMAIL=noreply@yourdomain.com
   ```

6. **Test Email Sending**
   ```bash
   # Create test API route: pages/api/test-email.ts
   # Send test email via http://localhost:3000/api/test-email
   ```

### Cloudinary Image Storage

**Duration:** 5 minutes  
**Cost:** Free tier (25 GB storage, 25 GB bandwidth/month)

**Steps:**

1. **Create Account**
   - Go to: https://cloudinary.com/users/register/free
   - Sign up with email

2. **Get Credentials**
   - Dashboard shows your credentials
   - Cloud name
   - API Key
   - API Secret (click "Reveal")

3. **Set Environment Variables**
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234
   ```

4. **Create Upload Preset (Optional)**
   - Go to: Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Preset name: `farmers_market_uploads`
   - Signing mode: "Unsigned" (for client-side uploads)
   - Save

5. **Add Preset to Environment**
   ```bash
   CLOUDINARY_UPLOAD_PRESET=farmers_market_uploads
   ```

### Sentry Error Monitoring

**Duration:** 5 minutes  
**Cost:** Free tier (5K errors/month)

**Steps:**

1. **Create Account**
   - Go to: https://sentry.io/signup/
   - Sign up with GitHub or email

2. **Create Project**
   - Platform: Next.js
   - Project name: `farmers-market`
   - Alert frequency: Choose your preference

3. **Get DSN**
   - Copy the DSN from setup page
   - Format: `https://abc123@o123456.ingest.sentry.io/789012`

4. **Set Environment Variable**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012
   SENTRY_ENVIRONMENT=production
   ```

5. **Install Sentry SDK**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

### Redis Caching (Optional)

**Duration:** 5 minutes  
**Cost:** Free tier available

**Options:**

#### Option A: Upstash Redis (Recommended for Vercel)

1. **Create Account**
   - Go to: https://upstash.com/
   - Sign up with GitHub

2. **Create Database**
   - Click "Create Database"
   - Name: `farmers-market-cache`
   - Type: Regional
   - Region: Choose closest to your deployment
   - Click "Create"

3. **Get Connection String**
   - Copy the Redis URL
   - Format: `redis://default:password@host.upstash.io:6379`

4. **Set Environment Variable**
   ```bash
   REDIS_URL=redis://default:password@host.upstash.io:6379
   ```

#### Option B: Local Redis (Development)

```bash
# Install Redis
# macOS: brew install redis
# Windows: Download from https://redis.io/download

# Start Redis
# macOS: brew services start redis
# Windows: redis-server.exe

# Set environment variable
REDIS_URL=redis://localhost:6379
```

---

## ⚡ HARDWARE OPTIMIZATION (HP OMEN)

### HP OMEN Specifications
- **CPU:** Intel Core (12 threads)
- **GPU:** NVIDIA RTX 2070 Max-Q (2304 CUDA cores)
- **RAM:** 64GB
- **Storage:** NVMe SSD

### Optimized Configuration

**File:** `.env.local` (add these settings)

```bash
# Hardware Profile
HARDWARE_PROFILE=omen

# GPU Acceleration
GPU_ACCELERATION=true

# Parallel Operations (matches CPU threads)
MAX_PARALLEL_OPERATIONS=12

# Memory Cache (utilize 64GB RAM)
MEMORY_CACHE_SIZE_MB=4096

# Query Caching
ENABLE_QUERY_CACHE=true

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=true
```

### Performance Tips

1. **Database Pooling**
   ```bash
   # Add connection pool settings to DATABASE_URL
   DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
   ```

2. **Parallel Processing**
   ```typescript
   // Leverage 12 threads for parallel operations
   const results = await Promise.all(
     items.map(async (item) => processItem(item))
   );
   ```

3. **Memory Caching**
   ```typescript
   // Utilize 64GB RAM for in-memory caching
   const cache = new Map<string, any>();
   // Cache large datasets for instant access
   ```

4. **GPU Acceleration (when applicable)**
   ```bash
   # Enable GPU.js for parallel computations
   npm install gpu.js
   ```

### Benchmarking

```bash
# Run performance tests
npm run test:performance

# Check hardware utilization
# Windows: Task Manager → Performance
# Monitor CPU, GPU, RAM, Disk usage
```

---

## 🔒 SECURITY BEST PRACTICES

### Secret Management

#### ✅ DO

- ✅ Use different secrets for dev/staging/prod
- ✅ Generate strong secrets (32+ characters)
- ✅ Rotate secrets every 90 days
- ✅ Store secrets in password manager
- ✅ Use environment variables, never hardcode
- ✅ Enable 2FA on all service accounts
- ✅ Limit API key permissions to minimum required

#### ❌ DON'T

- ❌ Never commit `.env` files to Git
- ❌ Never share secrets via email/chat
- ❌ Never use production secrets in development
- ❌ Never expose secrets in client-side code
- ❌ Never log secrets to console/files
- ❌ Never use weak secrets (e.g., "password123")

### .gitignore Configuration

Verify these entries exist in `.gitignore`:

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.docker.local
.env.*.local

# Keep examples
!.env.example
```

### Check for Leaked Secrets

```bash
# Search Git history for leaked secrets
git log -S "sk_live" --all      # Stripe secret keys
git log -S "postgres://" --all   # Database URLs
git log -S "NEXTAUTH_SECRET" --all

# Install GitGuardian for automated scanning
# https://www.gitguardian.com/
```

### Environment-Specific Keys

| Environment | Database | Stripe Keys | Email | Secrets |
|------------|----------|-------------|-------|---------|
| Development | SQLite or local PostgreSQL | `pk_test_*`, `sk_test_*` | Test domain | Weak OK |
| Staging | Staging PostgreSQL | `pk_test_*`, `sk_test_*` | Staging domain | Medium strength |
| Production | Production PostgreSQL | `pk_live_*`, `sk_live_*` | Verified domain | Strong (32+ chars) |

### CORS Configuration

```bash
# Development - Allow all origins
CORS_ALLOWED_ORIGINS=*

# Production - Restrict to your domains
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Rate Limiting

```bash
# Enable rate limiting (recommended for production)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100      # Requests per window
RATE_LIMIT_WINDOW_MS=60000       # Window in milliseconds (1 minute)
```

---

## 🐛 TROUBLESHOOTING

### Common Issues

#### Database Connection Failed

**Symptoms:**
```
Error: P1001 Can't reach database server at `localhost:5432`
```

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list | grep postgresql
   brew services start postgresql@15
   
   # Windows
   # Services → PostgreSQL → Start
   ```

2. Verify connection string:
   ```bash
   # Test connection
   psql "postgresql://user:password@localhost:5432/farmers_market_dev"
   ```

3. Check firewall settings (allow port 5432)

#### Authentication Not Working

**Symptoms:**
- Can't sign in
- Session expires immediately
- "Invalid session" errors

**Solutions:**
1. Regenerate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

2. Verify NEXTAUTH_URL matches your domain:
   ```bash
   # Development
   NEXTAUTH_URL=http://localhost:3000
   
   # Production
   NEXTAUTH_URL=https://yourdomain.com  # No trailing slash!
   ```

3. Clear browser cookies and try again

4. Check for HTTPS in production (required for secure cookies)

#### Stripe Webhook Errors

**Symptoms:**
```
Webhook Error: No signatures found matching the expected signature
```

**Solutions:**
1. Verify webhook secret is correct:
   ```bash
   # Check in Stripe Dashboard → Webhooks → [Your endpoint] → Signing secret
   ```

2. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   # Copy the webhook secret from output
   ```

3. Ensure webhook URL is correct in Stripe dashboard

#### Email Sending Failed

**Symptoms:**
```
Error: Invalid API key
```

**Solutions:**
1. Verify Resend API key:
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"onboarding@resend.dev","to":"test@example.com","subject":"Test","html":"Test"}'
   ```

2. Check sender email is verified (production only)

3. Verify domain DNS records are configured correctly

#### Redis Connection Failed

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**
1. Check Redis is running:
   ```bash
   # macOS
   brew services list | grep redis
   brew services start redis
   
   # Test connection
   redis-cli ping  # Should return PONG
   ```

2. Verify REDIS_URL is correct:
   ```bash
   # Local
   REDIS_URL=redis://localhost:6379
   
   # Upstash
   REDIS_URL=redis://default:password@host.upstash.io:6379
   ```

3. Make REDIS_URL optional if not critical:
   ```typescript
   // In your code, check if Redis is available
   const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
   ```

### Environment Variable Debugging

#### Check if variables are loaded:

Create temporary test endpoint: `app/api/debug-env/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  // NEVER expose actual values in production!
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    STRIPE_SECRET: !!process.env.STRIPE_SECRET_KEY,
    RESEND_API: !!process.env.RESEND_API_KEY,
  };

  return NextResponse.json({
    loaded: envCheck,
    allPresent: Object.values(envCheck).every((v) => v === true || typeof v === 'string'),
  });
}
```

Visit: `http://localhost:3000/api/debug-env`

**⚠️ DELETE THIS ENDPOINT AFTER DEBUGGING!**

#### Restart after changing .env files:

```bash
# Kill the dev server (Ctrl+C)
# Restart
npm run dev

# Or use nodemon for auto-restart
npm install -D nodemon
# Add to package.json scripts:
# "dev:watch": "nodemon --watch .env.local --exec 'next dev'"
```

### Vercel-Specific Issues

#### Environment variables not updating:

1. **Clear build cache:**
   ```bash
   vercel --force  # Forces rebuild
   ```

2. **Check variable scope:**
   - Ensure variables are added to correct environment (Production/Preview/Development)

3. **Redeploy:**
   ```bash
   # Trigger new deployment
   git commit --allow-empty -m "Force Vercel redeploy"
   git push
   ```

#### Webhook URLs not working:

1. **Verify deployment URL:**
   - Vercel provides preview URLs for branches
   - Production URL only available after merging to main

2. **Update webhook endpoints:**
   - Stripe: Update webhook URL to Vercel production URL
   - Use Vercel preview URL for testing branches

---

## 🔄 MIGRATION FROM OLD ENV FILES

If you were using the old separate `.env.*.example` files, here's how to migrate:

### Migration Checklist

- [ ] Backup current `.env` files
- [ ] Copy new `.env.example` to appropriate file
- [ ] Transfer unique variables from old files
- [ ] Update any custom configurations
- [ ] Test application with new configuration
- [ ] Delete old `.env.*.example` files (now archived)

### Old File Mapping

| Old File | New Configuration | Notes |
|----------|-------------------|-------|
| `.env.development.example` | `.env.local` | Local development settings |
| `.env.docker.example` | `.env.docker.local` | Docker-specific settings included in main `.env.example` |
| `.env.production.example` | `.env.production` or Vercel | Production settings |
| `.env.cloudinary.example` | `.env.example` (Cloudinary section) | Now part of main file |
| `.env.perplexity.example` | `.env.example` (AI section) | Now part of main file |
| `.env.omen.example` | `.env.example` (Performance section) | Now part of main file |

### Step-by-Step Migration

```bash
# 1. Backup existing configuration
cp .env.local .env.local.backup

# 2. Copy new example file
cp .env.example .env.local

# 3. If you had custom variables, add them to .env.local
nano .env.local  # or your preferred editor

# 4. Test the application
npm run dev

# 5. If everything works, you can delete old example files
# (They're already archived in docs/archives/duplicates/environment/)
```

---

## 📞 SUPPORT & RESOURCES

### Documentation

- **Quick Start:** `docs/QUICK-START.md`
- **Deployment Guide:** `docs/deployment/DEPLOYMENT-COMPLETE.md`
- **Docker Guide:** `docs/deployment/DOCKER-COMPLETE-GUIDE.md`
- **API Documentation:** `docs/API_DOCUMENTATION.md`

### Service Dashboards

| Service | Dashboard URL | Purpose |
|---------|--------------|---------|
| Vercel | https://vercel.com/dashboard | Deployment & environment variables |
| Supabase | https://supabase.com/dashboard | Database management |
| Stripe | https://dashboard.stripe.com | Payment processing |
| Resend | https://resend.com/dashboard | Email delivery |
| Cloudinary | https://cloudinary.com/console | Image storage |
| Sentry | https://sentry.io | Error monitoring |
| Chromatic | https://www.chromatic.com | Visual testing |

### Getting Help

1. **Check documentation** - Most issues are covered in guides
2. **Search GitHub issues** - Someone may have encountered same issue
3. **Check service status pages** - Verify third-party services are operational
4. **Community support** - Join project Discord/Slack (if available)
5. **Create GitHub issue** - For bugs or feature requests

### Useful Commands Reference

```bash
# Development
npm run dev                    # Start development server
npm run type-check            # Check TypeScript errors
npm run lint                  # Run ESLint
npm test                      # Run tests

# Database
npx prisma db push            # Push schema changes
npx prisma db seed            # Seed database
npx prisma studio             # Open Prisma Studio
npx prisma migrate dev        # Create migration
npx prisma generate           # Regenerate Prisma Client

# Build & Deploy
npm run build                 # Build for production
npm run start                 # Start production server
vercel                        # Deploy to Vercel (preview)
vercel --prod                 # Deploy to Vercel (production)

# Docker
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose ps             # List running services
```

---

## ✅ VERIFICATION CHECKLIST

### Before Going to Production

- [ ] All CRITICAL variables configured
- [ ] NEXTAUTH_SECRET generated (32+ characters)
- [ ] Database connection successful
- [ ] Stripe payment flow tested (test mode)
- [ ] Email sending verified
- [ ] Environment variables added to Vercel
- [ ] Webhook endpoints configured
- [ ] SSL certificate installed (self-hosted)
- [ ] Domain DNS configured
- [ ] Error monitoring enabled (Sentry)
- [ ] Backup strategy implemented
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Documentation updated

### Security Verification

- [ ] No `.env` files in Git
- [ ] All secrets are strong (32+ characters)
- [ ] Different secrets for staging/production
- [ ] 2FA enabled on all service accounts
- [ ] API keys have minimum required permissions
- [ ] CORS restricted to actual domains
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] SSL/HTTPS enforced in production

---

**Ready to deploy?** 🚀  
See `docs/deployment/DEPLOYMENT-COMPLETE.md` for full deployment guide!

_Generated with agricultural consciousness and divine precision_ 🌾⚡