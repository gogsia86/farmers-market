# 🚀 Deployment Plan - Farmers Market Platform

**Document Owner**: DevOps & Engineering Team
**Date**: October 21, 2025
**Status**: Active
**Version**: 1.0

---

## 📋 Executive Summary

This document provides comprehensive deployment procedures, infrastructure configuration, environment management, monitoring setup, and disaster recovery processes for the Farmers Market platform.

**Current Deployment Status:**

- ✅ **Hosting**: Vercel (Production + Preview)
- ✅ **Database**: Supabase PostgreSQL 16
- ✅ **Storage**: Vercel Blob (Images)
- ✅ **Monitoring**: Sentry (Errors + Performance)
- ✅ **CI/CD**: GitHub Actions
- ✅ **Domain**: Custom domain with SSL

**Purpose:**

- Document deployment architecture and processes
- Establish environment management standards
- Define monitoring and alerting strategies
- Outline disaster recovery procedures
- Guide production deployments and rollbacks

---

## 🏗️ Infrastructure Architecture

### Platform Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Vercel     │─────────│  Supabase    │                 │
│  │   (Next.js)  │         │  (PostgreSQL) │                 │
│  │   Edge+CDN   │         │   Database    │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                         │                          │
│         │                         │                          │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ Vercel Blob  │         │    Sentry    │                 │
│  │   (Images)   │         │  (Monitoring) │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                         │                          │
│         │                         │                          │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │    Stripe    │         │ GitHub Actions│                 │
│  │  (Payments)  │         │    (CI/CD)    │                 │
│  └──────────────┘         └──────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend & API:**

- Next.js 14.2+ (App Router)
- React 18+
- TypeScript 5.3+
- Tailwind CSS 3.4+
- Deployed on Vercel Edge Network

**Database:**

- PostgreSQL 16 (Supabase)
- Prisma ORM 5.x
- Connection pooling enabled
- Automatic backups (daily)

**Storage:**

- Vercel Blob Storage
- CDN-optimized delivery
- Automatic image optimization

**Monitoring:**

- Sentry (Error tracking + Performance)
- Vercel Analytics (Web Vitals)
- Custom logging (Pino)

**CI/CD:**

- GitHub Actions
- Automated testing
- Preview deployments
- Production deployments

---

## 🌍 Environments

### Environment Strategy

**Three-Tier Environment:**

1. **Development** (Local): Developer machines
2. **Preview** (Staging): Vercel Preview Deployments
3. **Production**: Vercel Production Deployment

### Environment Configuration

| Aspect         | Development      | Preview          | Production           |
| -------------- | ---------------- | ---------------- | -------------------- |
| **URL**        | `localhost:3000` | `*.vercel.app`   | `farmers-market.app` |
| **Database**   | Local PostgreSQL | Supabase Dev     | Supabase Prod        |
| **Payments**   | Stripe Test Mode | Stripe Test Mode | Stripe Live Mode     |
| **Monitoring** | Console logs     | Sentry Dev       | Sentry Prod          |
| **Analytics**  | Disabled         | Enabled          | Enabled              |
| **Cache**      | No CDN           | Vercel CDN       | Vercel CDN           |
| **SSL**        | Self-signed      | Auto SSL         | Custom SSL           |

### Environment Variables

**Required Environment Variables:**

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # For migrations

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://farmers-market.app"

# Stripe Payments
STRIPE_PUBLIC_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="..."

# Monitoring
SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."
SENTRY_ORG="..."
SENTRY_PROJECT="..."

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_REVIEWS="false"
NEXT_PUBLIC_ENABLE_MESSAGING="false"

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."
```

**Environment Variable Management:**

- **Development**: `.env.local` (git-ignored)
- **Preview**: Vercel Dashboard (automatically applied)
- **Production**: Vercel Dashboard (encrypted, access-controlled)

---

## 🔄 Deployment Process

### Automated Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   Deployment Workflow                         │
└─────────────────────────────────────────────────────────────┘

1. Developer pushes code to GitHub
   ↓
2. GitHub Actions triggered
   ↓
3. Run automated tests
   │  ├─ Unit tests
   │  ├─ Integration tests
   │  └─ E2E tests (on main branch only)
   ↓
4. Build Next.js application
   ↓
5. Deploy based on branch:
   │
   ├─ Feature branch → Vercel Preview Deployment
   │  └─ Unique URL: https://farmers-market-git-feature-xyz.vercel.app
   │
   ├─ develop branch → Vercel Preview Deployment (Staging)
   │  └─ URL: https://farmers-market-git-develop.vercel.app
   │
   └─ main branch → Vercel Production Deployment
      └─ URL: https://farmers-market.app
   ↓
6. Run post-deployment checks
   │  ├─ Health check
   │  ├─ Smoke tests
   │  └─ Database connection test
   ↓
7. Notify team (Slack/Discord)
   ↓
8. Monitor for errors (Sentry)
```

### Manual Deployment Steps

**For Production Hotfixes:**

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/critical-bug-fix

# 3. Make changes and test locally
npm run dev
npm run test

# 4. Commit and push
git add .
git commit -m "fix: critical bug in checkout flow"
git push origin hotfix/critical-bug-fix

# 5. Create PR to main
# GitHub Actions will run tests on PR

# 6. After PR approval and merge:
# Vercel automatically deploys to production

# 7. Verify deployment
curl https://farmers-market.app/api/health
```

### Deployment Checklist

**Pre-Deployment:**

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] Database migrations prepared (if any)
- [ ] Environment variables configured
- [ ] Feature flags set appropriately
- [ ] Changelog/release notes prepared
- [ ] Rollback plan documented

**During Deployment:**

- [ ] Monitor deployment progress in Vercel Dashboard
- [ ] Check build logs for errors
- [ ] Verify deployment completes successfully
- [ ] Automatic health checks pass

**Post-Deployment:**

- [ ] Smoke test critical user flows
- [ ] Verify database migrations applied
- [ ] Check Sentry for new errors
- [ ] Monitor performance metrics
- [ ] Verify CDN cache invalidation
- [ ] Announce deployment to team

---

## 🗄️ Database Migrations

### Migration Strategy

**Prisma Migration Workflow:**

```bash
# Development: Create and apply migration
npx prisma migrate dev --name add_product_tags

# Preview: Apply migrations automatically
# (Vercel runs migrations on build)

# Production: Apply migrations
npx prisma migrate deploy
```

### Migration Best Practices

**Safe Migration Guidelines:**

1. **Backward Compatible Migrations:**

   - Add new columns as nullable initially
   - Backfill data before making columns required
   - Avoid renaming tables/columns in single migration

2. **Multi-Step Migrations:**

   ```
   Step 1: Add new column (nullable)
   Step 2: Deploy code using new column
   Step 3: Backfill existing data
   Step 4: Make column non-nullable (new migration)
   ```

3. **Zero-Downtime Migrations:**
   - Always test migrations on staging first
   - Use transactions for data migrations
   - Avoid long-running migrations during peak hours
   - Have rollback SQL ready

### Migration Rollback

**Rollback Process:**

```bash
# 1. Identify migration to rollback to
npx prisma migrate status

# 2. Reset to specific migration (DESTRUCTIVE)
# Only for development!
npx prisma migrate reset

# 3. Production rollback (manual)
# Execute rollback SQL script
psql $DATABASE_URL < rollback-migration-20251021.sql

# 4. Rollback application code
# Deploy previous version via Vercel Dashboard
```

**Rollback SQL Template:**

```sql
-- Rollback migration: add_product_tags (20251021_123456)

BEGIN;

-- Remove the tags column
ALTER TABLE "Product" DROP COLUMN IF EXISTS "tags";

-- Recreate indexes if removed
-- (None in this case)

COMMIT;
```

---

## 📊 Monitoring & Alerting

### Error Monitoring (Sentry)

**Sentry Configuration:**

```javascript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || "development",
  tracesSampleRate: 0.1, // 10% of transactions

  // Filter out noise
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],

  // PII filtering
  beforeSend(event, hint) {
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
});
```

**Error Alert Rules:**

| Condition                    | Severity | Notification              |
| ---------------------------- | -------- | ------------------------- |
| Error rate > 1%              | Critical | Slack + Email immediately |
| New error type               | High     | Slack within 5 minutes    |
| Performance degradation >50% | High     | Slack within 10 minutes   |
| Payment failures             | Critical | Slack + Email + SMS       |

### Performance Monitoring

**Vercel Analytics:**

- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Page load performance
- API route performance

**Custom Performance Metrics:**

```typescript
// lib/monitoring/performance.ts
import { performance } from "perf_hooks";

export function measureOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  return operation()
    .then((result) => {
      const duration = performance.now() - start;

      // Log to monitoring service
      console.log(`[PERF] ${operationName}: ${duration}ms`);

      // Send to Sentry
      Sentry.addBreadcrumb({
        category: "performance",
        message: `${operationName} completed`,
        level: "info",
        data: { duration },
      });

      return result;
    })
    .catch((error) => {
      const duration = performance.now() - start;

      Sentry.captureException(error, {
        tags: { operation: operationName },
        extra: { duration },
      });

      throw error;
    });
}
```

### Health Checks

**Health Check Endpoint:**

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: "unknown",
      blobStorage: "unknown",
    },
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = "healthy";
  } catch (error) {
    checks.status = "unhealthy";
    checks.checks.database = "unhealthy";
  }

  // Blob storage check (simple presence check)
  try {
    const { list } = await require("@vercel/blob");
    await list({ limit: 1 });
    checks.checks.blobStorage = "healthy";
  } catch (error) {
    checks.status = "unhealthy";
    checks.checks.blobStorage = "unhealthy";
  }

  const statusCode = checks.status === "healthy" ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
```

**Uptime Monitoring:**

- **Service**: UptimeRobot or Vercel Monitoring
- **Interval**: Check every 5 minutes
- **Endpoints**:
  - `https://farmers-market.app/api/health`
  - `https://farmers-market.app/` (homepage)
- **Alerts**: Email + Slack on downtime

---

## 🔐 Security & Compliance

### SSL/TLS Configuration

**Certificate Management:**

- **Provider**: Vercel Automatic SSL
- **Certificate Type**: Let's Encrypt (auto-renewed)
- **TLS Version**: TLS 1.2+ only
- **HSTS**: Enabled (max-age=31536000)

**Security Headers:**

```typescript
// next.config.js
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
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
    value: "camera=(), microphone=(), geolocation=(self)",
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

### Secrets Management

**Secret Rotation Policy:**

- Database passwords: Every 90 days
- API keys: Every 180 days
- JWT secrets: Every 365 days
- Webhook secrets: On suspected compromise

**Access Control:**

- **Vercel Project Access**: Team members only
- **Database Access**: Restricted to admin IPs
- **Sentry Access**: Role-based (developer, admin)
- **GitHub Repository**: Branch protection enabled

---

## 💾 Backup & Disaster Recovery

### Backup Strategy

**Database Backups:**

| Backup Type   | Frequency             | Retention | Location             |
| ------------- | --------------------- | --------- | -------------------- |
| Automated     | Daily (3 AM UTC)      | 30 days   | Supabase (automatic) |
| Weekly        | Sunday 12 AM UTC      | 12 weeks  | Supabase (automatic) |
| Monthly       | 1st of month          | 12 months | Supabase (automatic) |
| Pre-Migration | Before each migration | 7 days    | Manual snapshot      |

**Backup Verification:**

- **Monthly**: Restore backup to staging environment
- **Quarterly**: Full disaster recovery drill

**Manual Backup:**

```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to secure storage
aws s3 cp backup-$(date +%Y%m%d).sql s3://farmers-market-backups/
```

### Disaster Recovery Plan

**Recovery Time Objective (RTO):** 4 hours
**Recovery Point Objective (RPO):** 24 hours (last daily backup)

**Recovery Scenarios:**

**Scenario 1: Database Corruption**

1. Identify corruption (monitoring alerts)
2. Assess extent of corruption
3. Restore from latest backup (Supabase dashboard)
4. Apply any incremental changes if available
5. Verify data integrity
6. Resume normal operations

**Scenario 2: Complete Platform Outage**

1. Identify root cause (Vercel, Supabase, DNS, etc.)
2. If Vercel: Deploy to backup region/provider
3. If Supabase: Failover to read replica (if available)
4. Update DNS if needed (TTL: 60s for quick updates)
5. Restore from backups if necessary
6. Communicate with users via status page

**Scenario 3: Malicious Data Deletion**

1. Immediately revoke compromised credentials
2. Identify time of deletion
3. Restore database to point before deletion
4. Review access logs for attack vector
5. Patch security vulnerability
6. Notify affected users if personal data involved

**Emergency Contacts:**

- **On-Call Engineer**: [Phone/Slack]
- **DevOps Lead**: [Phone/Slack]
- **CTO**: [Phone/Slack]
- **Vercel Support**: support@vercel.com (Enterprise SLA)
- **Supabase Support**: support@supabase.io (Pro SLA)

---

## 🔄 Rollback Procedures

### Application Rollback

**Instant Rollback (Vercel):**

```bash
# Via Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous stable deployment
# 3. Click "..." → "Promote to Production"
# Result: Instant rollback (< 1 minute)

# Via Vercel CLI:
vercel rollback
# Follow prompts to select previous deployment
```

**Git Rollback:**

```bash
# 1. Identify commit to rollback to
git log --oneline

# 2. Revert to specific commit
git revert abc1234

# 3. Push to trigger redeployment
git push origin main
```

### Database Rollback

**Migration Rollback:**

```bash
# 1. Connect to database
psql $DATABASE_URL

# 2. Run rollback script
\i rollback-migration-20251021.sql

# 3. Verify rollback
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;

# 4. Update Prisma state
npx prisma migrate resolve --rolled-back 20251021_add_tags
```

### Rollback Decision Matrix

| Issue Severity                                  | Action                   | Timeline        |
| ----------------------------------------------- | ------------------------ | --------------- |
| **Critical** (P0) - Payment failures, data loss | Immediate rollback       | < 15 minutes    |
| **High** (P1) - Feature completely broken       | Quick rollback or hotfix | < 1 hour        |
| **Medium** (P2) - Partial feature breakage      | Hotfix preferred         | < 4 hours       |
| **Low** (P3) - Minor UI issues                  | Include in next release  | Next deployment |

---

## 📈 Performance Optimization

### CDN Configuration

**Vercel Edge Network:**

- **Regions**: Global (50+ locations)
- **Cache Strategy**: Static assets cached at edge
- **Cache Duration**:
  - Static files: 1 year
  - API routes: No cache (revalidate)
  - Pages: ISR (60s revalidation)

**Cache Headers:**

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};
```

### Database Optimization

**Connection Pooling:**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations

  // Connection pool settings
  poolTimeout = 30
  connectionLimit = 10
}
```

**Query Optimization:**

- Use indexes on frequently queried columns
- Implement pagination for large result sets
- Use `select` to fetch only needed fields
- Avoid N+1 queries with `include` or `select`

### Image Optimization

**Vercel Blob + Next.js Image:**

```typescript
// Automatic optimization
<Image
  src={product.image}
  alt={product.name}
  width={800}
  height={600}
  quality={85}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Optimization Features:**

- Automatic WebP/AVIF conversion
- Responsive images with srcset
- Lazy loading by default
- Blur placeholder support

---

## 🔗 Related Documents

- **[Technical Architecture](../technical/architecture.md)** - System architecture details
- **[QA & Test Plan](./qa-test-plan.md)** - Testing before deployment
- **[Functional Requirements](../product/functional-requirements.md)** - Features being deployed
- **[Launch Checklist](./launch-checklist.md)** - Pre-launch verification

---

## 📝 Document Maintenance

**Review Schedule**: Monthly or after major infrastructure changes
**Next Review**: November 2025
**Owner**: DevOps & Engineering Team

**Update Triggers:**

- Infrastructure changes (new services, providers)
- Deployment process changes
- Security policy updates
- Disaster recovery drills
- Performance optimization changes

---

_Last Updated: October 21, 2025_
_Version: 1.0_
_Status: Active - Vercel + Supabase + Sentry Production Deployment_
