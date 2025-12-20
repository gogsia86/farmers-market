# 🚀 Deployment Documentation

> **Production Deployment Guide**
>
> Complete guide to deploying the Farmers Market Platform to production environments.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Deployment Environments](#deployment-environments)
- [Prerequisites](#prerequisites)
- [Deployment Process](#deployment-process)
- [Azure Deployment](#azure-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migrations](#database-migrations)
- [Post-Deployment](#post-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## 🎯 Overview

The Farmers Market Platform supports multiple deployment targets with CI/CD automation, zero-downtime deployments, and automatic rollback capabilities.

### Deployment Philosophy

```
┌─────────────────────────────────────────────────────────┐
│  "Deploy with confidence, monitor with precision"       │
│  Every deployment is tested, tracked, and reversible    │
└─────────────────────────────────────────────────────────┘
```

### Supported Platforms

| Platform              | Environment     | Purpose            | Status       |
| --------------------- | --------------- | ------------------ | ------------ |
| **Azure App Service** | Production      | Primary hosting    | ✅ Active    |
| **Vercel**            | Preview/Staging | Branch previews    | ✅ Active    |
| **Docker**            | Self-hosted     | Custom deployments | ✅ Available |
| **Local**             | Development     | Local testing      | ✅ Active    |

---

## 🌍 Deployment Environments

### Environment Structure

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
│  • URL: https://farmersmarket.com                       │
│  • Database: Azure PostgreSQL (Production)              │
│  • Auto-scaling: Enabled                                │
│  • Monitoring: Full observability                       │
└──────────────────────────────────────────────────────────┘
                         ▲
                         │ Promote
┌──────────────────────────────────────────────────────────┐
│                     STAGING                              │
│  • URL: https://staging.farmersmarket.com               │
│  • Database: Azure PostgreSQL (Staging)                 │
│  • Auto-deploy: main branch                             │
│  • Testing: Pre-production validation                   │
└──────────────────────────────────────────────────────────┘
                         ▲
                         │ Merge
┌──────────────────────────────────────────────────────────┐
│                  PREVIEW (Vercel)                        │
│  • URL: https://pr-123.vercel.app                       │
│  • Database: Staging database                           │
│  • Auto-deploy: Every PR                                │
│  • Purpose: PR review & testing                         │
└──────────────────────────────────────────────────────────┘
                         ▲
                         │ Push
┌──────────────────────────────────────────────────────────┐
│                  DEVELOPMENT                             │
│  • URL: http://localhost:3000                           │
│  • Database: Local PostgreSQL                           │
│  • Purpose: Local development                           │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### Required Tools

```bash
# Install required CLI tools
npm install -g vercel
npm install -g @azure/static-web-apps-cli

# Azure CLI (for Azure deployments)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Docker (for containerized deployments)
# Install from https://docs.docker.com/get-docker/
```

### Required Accounts & Access

- ✅ GitHub account with repository access
- ✅ Azure account with deployment permissions
- ✅ Vercel account (for preview deployments)
- ✅ Database credentials (production & staging)
- ✅ Environment variables and secrets

### Pre-Deployment Checklist

```bash
# 1. Run all tests
pnpm test

# 2. Build production bundle
pnpm build

# 3. Check for TypeScript errors
pnpm type-check

# 4. Run linter
pnpm lint

# 5. Verify database migrations
pnpm prisma migrate status

# 6. Check environment variables
pnpm run check:env

# 7. Run security audit
pnpm audit

# 8. Generate deployment report
pnpm run deploy:report
```

---

## 🔄 Deployment Process

### Standard Deployment Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. Create Feature Branch                               │
│     git checkout -b feat/new-feature                    │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  2. Develop & Test Locally                              │
│     pnpm dev                                            │
│     pnpm test                                           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  3. Push & Create PR                                    │
│     git push origin feat/new-feature                    │
│     → Triggers preview deployment on Vercel             │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  4. Review & Test Preview                               │
│     → Automated tests run in CI                         │
│     → Manual testing on preview URL                     │
│     → Code review by team                               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  5. Merge to Main                                       │
│     → Auto-deploy to Staging                            │
│     → Smoke tests run automatically                     │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  6. Promote to Production                               │
│     → Manual approval required                          │
│     → Database migrations applied                       │
│     → Zero-downtime deployment                          │
│     → Health checks verified                            │
└─────────────────────────────────────────────────────────┘
```

### Quick Deployment Commands

```bash
# Deploy to staging (automatic on merge to main)
git push origin main

# Deploy to production (via GitHub Actions)
gh workflow run deploy-production.yml

# Deploy specific version
gh workflow run deploy-production.yml -f version=v1.2.3

# Emergency hotfix deployment
pnpm run deploy:hotfix
```

---

## ☁️ Azure Deployment

### Azure App Service Deployment

```bash
# 1. Login to Azure
az login

# 2. Set subscription
az account set --subscription "Your-Subscription-Name"

# 3. Create resource group (first time only)
az group create --name farmers-market-prod --location eastus

# 4. Create App Service plan (first time only)
az appservice plan create \
  --name farmers-market-plan \
  --resource-group farmers-market-prod \
  --sku P1V2 \
  --is-linux

# 5. Create Web App (first time only)
az webapp create \
  --resource-group farmers-market-prod \
  --plan farmers-market-plan \
  --name farmers-market-platform \
  --runtime "NODE|20-lts"

# 6. Configure environment variables
az webapp config appsettings set \
  --resource-group farmers-market-prod \
  --name farmers-market-platform \
  --settings \
    DATABASE_URL="postgresql://..." \
    NEXTAUTH_URL="https://farmersmarket.com" \
    NEXTAUTH_SECRET="your-secret"

# 7. Enable continuous deployment from GitHub
az webapp deployment source config \
  --name farmers-market-platform \
  --resource-group farmers-market-prod \
  --repo-url https://github.com/your-org/farmers-market-platform \
  --branch main \
  --manual-integration

# 8. Deploy
git push azure main
```

### Azure Database Setup

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group farmers-market-prod \
  --name farmers-market-db \
  --location eastus \
  --admin-user dbadmin \
  --admin-password 'SecurePassword123!' \
  --sku-name Standard_D2s_v3 \
  --tier GeneralPurpose \
  --storage-size 128

# Create database
az postgres flexible-server db create \
  --resource-group farmers-market-prod \
  --server-name farmers-market-db \
  --database-name farmers_market_prod

# Configure firewall (allow Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group farmers-market-prod \
  --name farmers-market-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## 🔷 Vercel Deployment

### Vercel Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project (first time only)
vercel link

# 4. Configure environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# 5. Deploy to production
vercel --prod

# 6. Deploy preview (automatic on PR)
vercel
```

### Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_URL": "@nextauth-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "regions": ["iad1"],
  "github": {
    "silent": true,
    "autoAlias": true
  }
}
```

### Preview Deployments

Every pull request automatically gets a preview deployment:

- **URL Format**: `https://farmers-market-pr-{number}.vercel.app`
- **Auto-updated**: On every commit to PR
- **Isolated**: Separate from production/staging
- **Temporary**: Deleted after PR merge/close

---

## 🐳 Docker Deployment

### Docker Setup

```dockerfile
# Dockerfile (production-optimized)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=farmers_market
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres-data:
```

### Docker Deployment Commands

```bash
# Build image
docker build -t farmers-market-platform:latest .

# Run locally
docker-compose up -d

# Deploy to registry
docker tag farmers-market-platform:latest registry.example.com/farmers-market:latest
docker push registry.example.com/farmers-market:latest

# Deploy to production server
ssh user@production-server "docker pull registry.example.com/farmers-market:latest && docker-compose up -d"
```

---

## ⚙️ Environment Configuration

### Environment Variables

```bash
# .env.production
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="https://farmersmarket.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Features (optional)
AZURE_OPENAI_API_KEY="your-openai-key"
AZURE_OPENAI_ENDPOINT="https://your-instance.openai.azure.com"

# Storage
AZURE_STORAGE_CONNECTION_STRING="your-storage-connection-string"
AZURE_STORAGE_CONTAINER_NAME="product-images"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@farmersmarket.com"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
AZURE_APPINSIGHTS_INSTRUMENTATION_KEY="your-app-insights-key"

# Feature Flags
ENABLE_AI_FEATURES="true"
ENABLE_PAYMENTS="true"
ENABLE_NOTIFICATIONS="true"
```

### Secrets Management

```bash
# Azure Key Vault
az keyvault create \
  --name farmers-market-vault \
  --resource-group farmers-market-prod \
  --location eastus

# Store secrets
az keyvault secret set \
  --vault-name farmers-market-vault \
  --name database-url \
  --value "postgresql://..."

# Retrieve secrets in deployment
az keyvault secret show \
  --vault-name farmers-market-vault \
  --name database-url \
  --query value -o tsv
```

---

## 🗄️ Database Migrations

### Migration Process

```bash
# 1. Create migration (in development)
pnpm prisma migrate dev --name add_user_profile

# 2. Review migration files
cat prisma/migrations/*/migration.sql

# 3. Test migration locally
pnpm prisma migrate reset
pnpm prisma db seed

# 4. Deploy to staging
DATABASE_URL=$STAGING_DATABASE_URL pnpm prisma migrate deploy

# 5. Verify staging
pnpm prisma studio --browser none

# 6. Deploy to production (during deployment)
DATABASE_URL=$PRODUCTION_DATABASE_URL pnpm prisma migrate deploy

# 7. Verify production
DATABASE_URL=$PRODUCTION_DATABASE_URL pnpm prisma studio --browser none
```

### Migration Safety

```bash
# Check migration status
pnpm prisma migrate status

# Dry run (preview changes)
pnpm prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource $DATABASE_URL \
  --script

# Rollback last migration (if needed)
pnpm prisma migrate resolve --rolled-back "migration_name"
```

---

## 🎬 Post-Deployment

### Verification Checklist

```bash
# 1. Health check
curl https://farmersmarket.com/api/health

# 2. Database connectivity
curl https://farmersmarket.com/api/health/db

# 3. Authentication
curl https://farmersmarket.com/api/auth/session

# 4. Core functionality
# Test user login
# Test farm creation
# Test product browsing
# Test order placement

# 5. Performance check
curl -w "@curl-format.txt" -o /dev/null -s https://farmersmarket.com

# 6. Monitor logs
az webapp log tail --name farmers-market-platform --resource-group farmers-market-prod

# 7. Check error rate
# View Azure Application Insights
# Check Sentry error tracking
```

### Smoke Tests

```bash
# Run automated smoke tests
pnpm test:smoke

# Run E2E tests against production
PLAYWRIGHT_BASE_URL=https://farmersmarket.com pnpm test:e2e --grep @smoke
```

---

## ⏮️ Rollback Procedures

### Quick Rollback

```bash
# Azure App Service - Rollback to previous version
az webapp deployment slot swap \
  --resource-group farmers-market-prod \
  --name farmers-market-platform \
  --slot staging \
  --target-slot production

# Vercel - Rollback via dashboard or CLI
vercel rollback

# Docker - Redeploy previous version
docker pull registry.example.com/farmers-market:v1.2.2
docker-compose up -d
```

### Database Rollback

```bash
# Rollback last migration
pnpm prisma migrate resolve --rolled-back "20240115_migration_name"

# Restore from backup (if needed)
az postgres flexible-server restore \
  --resource-group farmers-market-prod \
  --name farmers-market-db-restored \
  --source-server farmers-market-db \
  --restore-time "2024-01-15T10:00:00Z"
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
  });
}

// app/api/health/db/route.ts
export async function GET() {
  try {
    await database.$queryRaw`SELECT 1`;
    return Response.json({ status: "healthy", database: "connected" });
  } catch (error) {
    return Response.json(
      { status: "unhealthy", database: "disconnected" },
      { status: 500 },
    );
  }
}
```

### Monitoring Setup

```bash
# Azure Application Insights
az monitor app-insights component create \
  --app farmers-market-insights \
  --location eastus \
  --resource-group farmers-market-prod

# Configure alerts
az monitor metrics alert create \
  --name high-error-rate \
  --resource-group farmers-market-prod \
  --scopes /subscriptions/.../farmers-market-platform \
  --condition "avg exceptions/server > 10" \
  --window-size 5m
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Deployment Fails with Build Error

```bash
# Check build logs
az webapp log download --name farmers-market-platform --resource-group farmers-market-prod

# Test build locally
pnpm build

# Clear Next.js cache
rm -rf .next
pnpm build
```

#### 2. Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group farmers-market-prod \
  --name farmers-market-db

# Verify connection string
echo $DATABASE_URL
```

#### 3. Environment Variables Not Loaded

```bash
# List current settings
az webapp config appsettings list \
  --name farmers-market-platform \
  --resource-group farmers-market-prod

# Update specific variable
az webapp config appsettings set \
  --resource-group farmers-market-prod \
  --name farmers-market-platform \
  --settings NEXTAUTH_SECRET="new-secret"

# Restart app
az webapp restart --name farmers-market-platform --resource-group farmers-market-prod
```

#### 4. Slow Performance

```bash
# Check instance size
az appservice plan show --name farmers-market-plan --resource-group farmers-market-prod

# Scale up (increase resources)
az appservice plan update \
  --name farmers-market-plan \
  --resource-group farmers-market-prod \
  --sku P2V2

# Scale out (increase instances)
az appservice plan update \
  --name farmers-market-plan \
  --resource-group farmers-market-prod \
  --number-of-workers 3
```

---

## 📚 Related Documentation

### Deployment Guides

- **[CI/CD Setup](./CI_CD_SETUP.md)** - Continuous integration/deployment
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Docker Guide](./DOCKER-COMPLETE-GUIDE.md)** - Docker deployment details
- **[Environment Setup](./ENV-SETUP-GUIDE.md)** - Environment configuration
- **[Production Readiness](./PRODUCTION_READINESS_HUB.md)** - Production checklist

### Related Documentation

- **[Getting Started](../getting-started/README.md)** - Setup and onboarding
- **[Architecture](../architecture/README.md)** - System architecture
- **[Testing](../testing/README.md)** - Test strategies
- **[Monitoring](../monitoring/README.md)** - Observability setup

---

## 🌟 Best Practices

### 1. Always Test Before Deploy

```bash
# Full test suite
pnpm test && pnpm build && pnpm start
```

### 2. Use Feature Flags

```typescript
// Enable features gradually
if (process.env.ENABLE_NEW_FEATURE === "true") {
  // New feature code
}
```

### 3. Deploy During Low Traffic

- Best time: Weekday mornings (8-10 AM)
- Avoid: Friday afternoons, weekends
- Have rollback plan ready

### 4. Monitor After Deployment

- Watch error rates for 1 hour
- Check performance metrics
- Monitor user feedback
- Keep communication channels open

### 5. Document Every Deployment

```markdown
## Deployment Log

**Date**: 2024-01-15  
**Version**: v1.2.3  
**Deployed By**: John Doe  
**Changes**: Added farm verification flow  
**Migration**: Added verification_status column  
**Rollback Plan**: Revert to v1.2.2  
**Issues**: None  
**Status**: ✅ Success
```

---

## 📞 Support

### Deployment Team Contacts

- **DevOps Lead**: devops@farmersmarket.com
- **On-Call**: +1-555-0100 (24/7)
- **Slack Channel**: #deployments
- **Incident Management**: incidents@farmersmarket.com

### Emergency Procedures

1. **Contact on-call engineer**
2. **Assess impact and severity**
3. **Execute rollback if critical**
4. **Document incident**
5. **Post-mortem review**

---

**Last Updated**: December 2024  
**Maintained By**: DevOps Team  
**Status**: ✅ Active & Complete  
**Production URL**: https://farmersmarket.com

**Quick Navigation**:

- [← Back to Documentation Hub](../README.md)
- [→ Getting Started](../getting-started/README.md)
- [→ Architecture Guide](../architecture/README.md)
- [→ Testing Guide](../testing/README.md)
