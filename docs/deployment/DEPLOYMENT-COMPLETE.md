# 🚀 DEPLOYMENT COMPLETE GUIDE - Farmers Market Platform

**Divine Agricultural E-Commerce Platform - Comprehensive Deployment Documentation**

**Last Updated:** January 2025  
**Version:** 3.0 - Consolidated Edition  
**Status:** ✅ PRODUCTION READY

---

## 📋 TABLE OF CONTENTS

- [Quick Start (5 Minutes)](#-quick-start-5-minutes)
- [Pre-Deployment Checklist](#-pre-deployment-checklist)
- [Deployment Platforms](#-deployment-platforms)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Docker Self-Hosted](#docker-self-hosted)
  - [AWS Deployment](#aws-deployment)
  - [Azure Deployment](#azure-deployment)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Post-Deployment Validation](#-post-deployment-validation)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Security Hardening](#-security-hardening)
- [Performance Optimization](#-performance-optimization)
- [Monitoring & Observability](#-monitoring--observability)
- [Troubleshooting](#-troubleshooting)
- [Rollback Procedures](#-rollback-procedures)

---

## ⚡ QUICK START (5 MINUTES)

### Vercel Quick Deploy

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod
```

**That's it!** Your app is live. Configure environment variables in Vercel Dashboard.

> 📖 **Environment Configuration Guide:** See `docs/deployment/ENV-SETUP-GUIDE.md` for complete setup instructions

### Docker Quick Deploy

```bash
# 1. Pull image from Docker Hub
docker pull gogsiasdocker/farmers-market-app:latest

# 2. Run container
docker run -d \
  --name farmers-market-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  gogsiasdocker/farmers-market-app:latest

# 3. Access application
# http://localhost:3000
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code Quality Gates

- [ ] **All Tests Passing**: 414/414 unit tests ✅
- [ ] **E2E Tests**: Playwright tests executed successfully
- [ ] **TypeScript**: Zero compilation errors (`npm run type-check`)
- [ ] **ESLint**: No critical linting errors (`npm run lint`)
- [ ] **Code Coverage**: > 80% coverage achieved
- [ ] **Build Success**: Production build completes (`npm run build`)

### Security Verification

- [ ] **Environment Variables**: All secrets configured (no hardcoded values)
- [ ] **NEXTAUTH_SECRET**: Generated (minimum 32 characters)
- [ ] **Database Credentials**: Strong passwords set
- [ ] **API Keys**: Production keys configured (Stripe, SendGrid, etc.)
- [ ] **CORS**: Origins properly configured
- [ ] **Rate Limiting**: Enabled and tested
- [ ] **Security Headers**: CSP, HSTS, X-Frame-Options configured

### Infrastructure Ready

- [ ] **Database**: PostgreSQL 15+ instance provisioned
- [ ] **Redis**: Cache instance available (optional but recommended)
- [ ] **Domain**: DNS configured (if using custom domain)
- [ ] **SSL Certificate**: Ready (or using platform-managed SSL)
- [ ] **Backup Strategy**: Automated backups configured
- [ ] **Monitoring**: Error tracking setup (Sentry, etc.)

### Documentation

- [ ] **API Documentation**: Up to date
- [ ] **README**: Reflects current state
- [ ] **Environment Variables**: Documented in `.env.example`
- [ ] **Migration Scripts**: Reviewed and tested
- [ ] **Rollback Plan**: Documented and accessible

### Team Approval

- [ ] **Code Review**: All PRs approved by 2+ reviewers
- [ ] **QA Sign-off**: Manual testing completed
- [ ] **Product Owner**: Feature set approved
- [ ] **DevOps Team**: Infrastructure ready
- [ ] **Stakeholders**: Deployment window approved

---

## 🌐 DEPLOYMENT PLATFORMS

---

## Vercel (Recommended)

**Best for:** Next.js applications, serverless architecture, automatic scaling

### Why Vercel?

✅ **Optimized for Next.js** - Built by Next.js creators  
✅ **Zero Configuration** - Auto-detects Next.js settings  
✅ **Global CDN** - Edge network for fast delivery  
✅ **Automatic SSL** - Free HTTPS certificates  
✅ **Preview Deployments** - Every PR gets a URL  
✅ **Serverless Functions** - Auto-scaling API routes  
✅ **Analytics Built-in** - Real-time performance metrics

### Vercel Setup Steps

#### 1. Create GitHub Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub
# Go to: https://github.com/new

# Push to GitHub
git remote add origin https://github.com/YOUR-USERNAME/farmers-market-platform.git
git branch -M main
git push -u origin main
```

#### 2. Connect to Vercel

1. Visit https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Framework Preset: **Next.js** (auto-detected)
5. Click **"Deploy"**

⚠️ **First deployment will fail** - Environment variables needed

#### 3. Configure Environment Variables

> 📖 **Comprehensive Guide:** See `docs/deployment/ENV-SETUP-GUIDE.md` for detailed configuration instructions

**In Vercel Dashboard → Settings → Environment Variables:**

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://user:password@host:5432/farmers_market?sslmode=require

# ============================================
# AUTHENTICATION (NextAuth v5)
# ============================================
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-project.vercel.app
AUTH_TRUST_HOST=true

# ============================================
# STRIPE PAYMENT PROCESSING
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# REDIS CACHE (Optional but recommended)
# ============================================
REDIS_URL=redis://default:password@host:6379

# ============================================
# FILE STORAGE
# ============================================
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# ============================================
# EMAIL SERVICE
# ============================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key
SMTP_FROM=noreply@your-domain.com

# ============================================
# MONITORING & ANALYTICS
# ============================================
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# ============================================
# APPLICATION
# ============================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### 4. Generate Required Secrets

```bash
# NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 5. Database Options for Vercel

**Option A: Vercel Postgres (Easiest)**

- Dashboard → Storage → Create Database → Postgres
- Automatic integration with environment variables
- Built-in connection pooling

**Option B: Neon (Serverless Postgres)**

```bash
# 1. Sign up: https://neon.tech
# 2. Create database
# 3. Copy connection string
# 4. Add to Vercel environment variables
```

**Option C: Supabase (Full Backend)**

```bash
# 1. Sign up: https://supabase.com
# 2. Create project
# 3. Get connection string from Settings → Database
# 4. Add to Vercel environment variables
```

#### 6. Redeploy with Environment Variables

1. Go to **Deployments** tab
2. Click latest deployment → **⋮ menu** → **Redeploy**
3. Wait 2-3 minutes
4. ✅ Deployment successful!

#### 7. Run Database Migrations

```bash
# Install Vercel CLI
npm install -g vercel

# Link to project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

#### 8. Configure Custom Domain (Optional)

1. Vercel Dashboard → **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Configure DNS (Vercel provides instructions)
4. Wait for DNS propagation (5-30 minutes)
5. Automatic SSL certificate issued

**DNS Configuration:**

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Docker Self-Hosted

**Best for:** Full control, self-hosted infrastructure, custom requirements

### Prerequisites

- Docker 24+ and Docker Compose 2+
- Linux server (Ubuntu 22.04 recommended)
- 4GB RAM minimum, 8GB recommended
- 2 CPU cores minimum, 4 recommended
- 50GB disk space

### Docker Hub Quick Deploy

#### Option 1: Using Pre-Built Image

```bash
# 1. Pull from Docker Hub
docker pull gogsiasdocker/farmers-market-app:latest

# 2. Create environment file
cat > .env.production <<EOF
DATABASE_URL=postgresql://user:password@db:5432/farmers_market
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=production
EOF

# 3. Run with docker-compose
cat > docker-compose.yml <<EOF
version: '3.9'
services:
  app:
    image: gogsiasdocker/farmers-market-app:latest
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgis/postgis:16-3.4-alpine
    environment:
      POSTGRES_DB: farmers_market
      POSTGRES_USER: farmuser
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

# 4. Start services
docker-compose up -d

# 5. Run migrations
docker-compose exec app npx prisma migrate deploy
```

#### Option 2: Build from Source

```bash
# 1. Clone repository
git clone https://github.com/YOUR-USERNAME/farmers-market-platform.git
cd farmers-market-platform

# 2. Copy environment template
cp .env.example .env.production

# 3. Edit environment variables
nano .env.production
# See docs/deployment/ENV-SETUP-GUIDE.md for all configuration options

# 4. Build and start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 5. Run migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### Production Docker Compose Configuration

See `docs/deployment/DOCKER-COMPLETE-GUIDE.md` for comprehensive Docker documentation.

---

## AWS Deployment

**Best for:** Enterprise, scalable infrastructure, AWS ecosystem

### Option A: AWS Amplify

```bash
# 1. Install Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configure Amplify
amplify configure

# 3. Initialize project
amplify init

# 4. Add hosting
amplify add hosting

# 5. Publish
amplify publish
```

### Option B: AWS ECS (Fargate)

**1. Push Docker Image to ECR**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name farmers-market

# Tag and push
docker tag farmers-market:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/farmers-market:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/farmers-market:latest
```

**2. Create ECS Task Definition**

```json
{
  "family": "farmers-market",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/farmers-market:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:account-id:secret:db-url"
        }
      ]
    }
  ]
}
```

**3. Deploy to ECS**

```bash
# Create cluster
aws ecs create-cluster --cluster-name farmers-market-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster farmers-market-cluster \
  --service-name farmers-market \
  --task-definition farmers-market \
  --desired-count 2 \
  --launch-type FARGATE
```

---

## Azure Deployment

**Best for:** Microsoft ecosystem, Azure services integration

### Azure App Service

```bash
# 1. Login to Azure
az login

# 2. Create resource group
az group create --name farmers-market-rg --location eastus

# 3. Create App Service plan
az appservice plan create \
  --name farmers-market-plan \
  --resource-group farmers-market-rg \
  --sku B1 \
  --is-linux

# 4. Create web app
az webapp create \
  --resource-group farmers-market-rg \
  --plan farmers-market-plan \
  --name farmers-market-app \
  --runtime "NODE:20-lts"

# 5. Configure deployment
az webapp deployment source config \
  --name farmers-market-app \
  --resource-group farmers-market-rg \
  --repo-url https://github.com/YOUR-USERNAME/farmers-market-platform \
  --branch main

# 6. Set environment variables
az webapp config appsettings set \
  --resource-group farmers-market-rg \
  --name farmers-market-app \
  --settings DATABASE_URL="postgresql://..." NEXTAUTH_SECRET="..."
```

---

## 🔧 ENVIRONMENT CONFIGURATION

### Complete Environment Variables Reference

> 📖 **Master Reference:** See `docs/deployment/ENV-SETUP-GUIDE.md` for comprehensive variable documentation, service setup instructions, and troubleshooting

```bash
# ============================================
# CORE APPLICATION
# ============================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
PORT=3000

# ============================================
# DATABASE (PostgreSQL 15+)
# ============================================
DATABASE_URL=postgresql://user:password@host:5432/farmers_market?sslmode=require
DIRECT_URL=postgresql://user:password@host:5432/farmers_market?sslmode=require

# ============================================
# AUTHENTICATION (NextAuth v5)
# ============================================
NEXTAUTH_SECRET=your-super-secret-32-char-minimum
NEXTAUTH_URL=https://your-domain.com
AUTH_TRUST_HOST=true

# ============================================
# PAYMENT PROCESSING (Stripe)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# CACHE (Redis - Optional)
# ============================================
REDIS_URL=redis://default:password@host:6379
REDIS_HOST=host
REDIS_PORT=6379
REDIS_PASSWORD=password

# ============================================
# FILE STORAGE
# ============================================
# Option A: Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Option B: AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=farmers-market-uploads

# Option C: Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_STORAGE_CONTAINER=uploads

# ============================================
# EMAIL SERVICE
# ============================================
# Option A: SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key
SMTP_FROM=noreply@your-domain.com

# Option B: AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_FROM=noreply@your-domain.com

# Option C: Resend
RESEND_API_KEY=re_...
RESEND_FROM=noreply@your-domain.com

# ============================================
# MONITORING & ERROR TRACKING
# ============================================
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-auth-token

# ============================================
# ANALYTICS
# ============================================
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_RATE_LIMITING=true
ENABLE_CACHING=true
ENABLE_MONITORING=true
```

### Environment-Specific Configurations

**Development:**

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmersmarket
```

**Staging:**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
DATABASE_URL=postgresql://user:pass@staging-db:5432/farmers_market
```

**Production:**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@prod-db:5432/farmers_market
```

---

## 🗄️ DATABASE SETUP

### PostgreSQL Requirements

- **Version:** PostgreSQL 15+ (16 recommended)
- **Extensions:** PostGIS (for geospatial features)
- **Collation:** UTF8
- **Timezone:** UTC

### Database Provider Options

#### Option 1: Neon (Serverless - Recommended)

```bash
# 1. Sign up: https://neon.tech
# 2. Create project
# 3. Create database
# 4. Enable PostGIS extension
# 5. Copy connection string
```

**Connection String Format:**

```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/farmers_market?sslmode=require
```

#### Option 2: Supabase

```bash
# 1. Sign up: https://supabase.com
# 2. Create project
# 3. Enable PostGIS (SQL Editor):
CREATE EXTENSION IF NOT EXISTS postgis;

# 4. Get connection string from Settings → Database
```

#### Option 3: AWS RDS

```bash
# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier farmers-market-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

### Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name initial_schema

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Database Backup Strategy

**Automated Backups (Recommended):**

```bash
# Neon: Automatic daily backups (14-day retention)
# Supabase: Automatic daily backups (7-day retention)
# AWS RDS: Configure automated backups
aws rds modify-db-instance \
  --db-instance-identifier farmers-market-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"
```

**Manual Backup:**

```bash
# Backup database
pg_dump -h host -U user -d farmers_market > backup-$(date +%Y%m%d).sql

# Restore database
psql -h host -U user -d farmers_market < backup-20250115.sql
```

---

## ✅ POST-DEPLOYMENT VALIDATION

### Automated Health Checks

```bash
# 1. Application health
curl https://your-domain.com/api/health
# Expected: {"status":"ok","timestamp":"..."}

# 2. Database connectivity
curl https://your-domain.com/api/health/db
# Expected: {"database":"connected"}

# 3. Authentication
curl https://your-domain.com/api/auth/session
# Expected: Session data or null

# 4. API endpoints
curl https://your-domain.com/api/farms
# Expected: JSON response with farms data
```

### Manual Validation Checklist

- [ ] **Homepage loads** - Visit root URL, no errors
- [ ] **Authentication works** - Login/logout functional
- [ ] **Database queries succeed** - Data displays correctly
- [ ] **File uploads work** - Test image upload
- [ ] **Payment test transaction** - Stripe test mode
- [ ] **Email sending** - Test email functionality
- [ ] **Search functionality** - Test search features
- [ ] **Mobile responsive** - Test on mobile devices
- [ ] **SSL certificate** - HTTPS enabled, no warnings
- [ ] **Performance** - Page load < 3 seconds

### Performance Benchmarks

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Expected scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+

# Load testing (Artillery)
npm install -g artillery
artillery quick --count 10 --num 100 https://your-domain.com

# Expected:
# Response time p95: < 500ms
# Error rate: < 1%
```

### Security Scan

```bash
# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-domain.com

# Check SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Security headers check
curl -I https://your-domain.com
# Verify: X-Frame-Options, X-Content-Type-Options, CSP headers
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"

      - name: Run migrations
        run: |
          npm install -g vercel
          vercel env pull .env.production
          npx prisma migrate deploy
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Required GitHub Secrets

```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=team_xxx
VERCEL_PROJECT_ID=prj_xxx
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
```

---

## 🔒 SECURITY HARDENING

### Security Headers (Next.js Config)

```javascript
// next.config.js
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

### Environment Security

- ✅ **Never commit `.env` files** to version control (see `docs/deployment/ENV-SETUP-GUIDE.md` for best practices)
- ✅ **Use strong secrets** (minimum 32 characters)
- ✅ **Rotate secrets regularly** (every 90 days)
- ✅ **Use separate credentials** per environment
- ✅ **Implement rate limiting** on all API routes
- ✅ **Enable CORS** with specific origins only
- ✅ **Use HTTPS** everywhere (no HTTP)
- ✅ **Validate all inputs** on server-side

### Rate Limiting Configuration

```typescript
// src/lib/rate-limit.ts
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: "Too many login attempts",
});
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Next.js Optimization

```javascript
// next.config.js
module.exports = {
  // Enable React strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ["your-cdn.com"],
    formats: ["image/avif", "image/webp"],
  },

  // Enable SWC minification (faster)
  swcMinify: true,

  // Compress static files
  compress: true,

  // Standalone output for Docker
  output: "standalone",

  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};
```

### Caching Strategy

```typescript
// Cache control headers
export const revalidate = 3600; // Revalidate every hour

// ISR pages
export async function generateStaticParams() {
  const farms = await prisma.farm.findMany();
  return farms.map((farm) => ({
    id: farm.id,
  }));
}

// Redis caching
import { redis } from "@/lib/redis";

export async function getCachedData(key: string) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchData();
  await redis.setex(key, 3600, JSON.stringify(data));
  return data;
}
```

### Database Query Optimization

```typescript
// Use indexes
@@index([farmId, status])

// Select only needed fields
const farms = await prisma.farm.findMany({
  select: {
    id: true,
    name: true,
    location: true,
  }
})

// Parallel queries
const [farms, products] = await Promise.all([
  prisma.farm.findMany(),
  prisma.product.findMany()
])

// Connection pooling (Prisma)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 📊 MONITORING & OBSERVABILITY

### Sentry Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Vercel Analytics

```javascript
// app/layout.tsx
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

### Custom Logging

```typescript
// src/lib/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
```

---

## 🆘 TROUBLESHOOTING

### Common Deployment Issues

#### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build

# Check TypeScript errors
npm run type-check

# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Database Connection Fails

```bash
# Test connection
npx prisma db pull

# Check connection string format
echo $DATABASE_URL

# Verify SSL mode
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Check firewall/security groups
# Allow inbound traffic on port 5432
```

#### Environment Variables Not Loaded

```bash
# Vercel: Check Settings → Environment Variables
# Ensure variables are set for Production environment

# Docker: Verify .env file exists
ls -la .env.production

# Check variable names (case-sensitive)
docker-compose exec app env | grep DATABASE_URL
```

#### 500 Internal Server Error

```bash
# Check server logs
vercel logs  # For Vercel
docker logs farmers-market-app  # For Docker

# Enable detailed error pages (dev only)
NODE_ENV=development npm run dev

# Check Sentry for error details
```

---

## 🔄 ROLLBACK PROCEDURES

### Vercel Rollback

```bash
# Via Dashboard:
# 1. Go to Deployments
# 2. Find last working deployment
# 3. Click ⋮ → "Promote to Production"

# Via CLI:
vercel rollback
```

### Docker Rollback

```bash
# Pull previous image version
docker pull gogsiasdocker/farmers-market-app:v1.0.0

# Update compose file with specific version
image: gogsiasdocker/farmers-market-app:v1.0.0

# Restart services
docker-compose up -d --force-recreate
```

### Database Rollback

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back 20250115_migration_name

# Restore from backup
psql -h host -U user -d farmers_market < backup-20250115.sql
```

---

## 📞 SUPPORT & RESOURCES

### Documentation

- [Development Guide](../DEVELOPMENT_GUIDE.md)
- [Docker Complete Guide](DOCKER-COMPLETE-GUIDE.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Database Schema](../DATABASE_SCHEMA.md)
- [Quick Reference](../QUICK-REFERENCE.md)

### External Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Docker Documentation](https://docs.docker.com/)

---

## 🎉 DEPLOYMENT SUCCESS!

**Your Farmers Market Platform is now live with divine agricultural consciousness! 🌾✨**

### Next Steps

1. ✅ Monitor application performance
2. ✅ Set up automated backups
3. ✅ Configure custom domain (if applicable)
4. ✅ Enable analytics and monitoring
5. ✅ Plan scaling strategy
6. ✅ Schedule regular security audits

### Post-Launch Checklist

- [ ] Announce launch to stakeholders
- [ ] Monitor error rates (first 24 hours)
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan next iteration

---

**Built with 💚 by farmers, for farmers, deployed with divine precision**

**Status:** ✅ PRODUCTION READY  
**Last Updated:** January 2025  
**Maintainer:** Farmers Market Platform Team  
**Version:** 3.0 - Consolidated Edition
