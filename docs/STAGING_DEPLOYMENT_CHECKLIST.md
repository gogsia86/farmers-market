# 🚀 Staging Deployment Checklist

**Target Environment**: Staging  
**Date**: January 2025  
**Version**: 1.0.0  
**Status**: Ready for Deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Code Quality & Testing

- [x] **All tests passing** (2749/2749 - 100%)
- [x] **CheckoutService tests** (36/36 passing)
- [x] **CartService tests** (61/61 passing)
- [x] **ServiceResponse pattern** implemented across all services
- [x] **TypeScript strict mode** enabled and passing
- [x] **No console errors** in development build
- [x] **Linting passes** without errors
- [ ] **Security audit** completed (`npm audit`)
- [ ] **Dependency updates** reviewed and tested

### ✅ Database

- [ ] **Staging database** provisioned (PostgreSQL)
- [ ] **Database migrations** ready
  ```bash
  npx prisma migrate deploy
  ```
- [ ] **Seed data** prepared for staging
  ```bash
  npx prisma db seed
  ```
- [ ] **Database backups** configured
- [ ] **Connection pooling** configured (e.g., PgBouncer)
- [ ] **Read replicas** configured (if needed)
- [ ] **Database indexes** optimized

### ✅ Environment Configuration

#### Required Environment Variables

**Core Application**:

- [ ] `NODE_ENV=staging`
- [ ] `NEXT_PUBLIC_APP_URL` (staging URL)
- [ ] `DATABASE_URL` (staging PostgreSQL connection string)
- [ ] `NEXTAUTH_URL` (staging auth URL)
- [ ] `NEXTAUTH_SECRET` (unique secret for staging)

**Authentication**:

- [ ] `GOOGLE_CLIENT_ID` (OAuth)
- [ ] `GOOGLE_CLIENT_SECRET` (OAuth)
- [ ] `FACEBOOK_CLIENT_ID` (OAuth - if applicable)
- [ ] `FACEBOOK_CLIENT_SECRET` (OAuth - if applicable)

**Payment Processing**:

- [ ] `STRIPE_SECRET_KEY` (test mode key)
- [ ] `STRIPE_PUBLISHABLE_KEY` (test mode key)
- [ ] `STRIPE_WEBHOOK_SECRET` (staging webhook secret)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Email Service**:

- [ ] `SENDGRID_API_KEY` (or other email provider)
- [ ] `EMAIL_FROM` (sender email)
- [ ] `EMAIL_REPLY_TO`

**Storage**:

- [ ] `AWS_ACCESS_KEY_ID` (S3 for images)
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION`
- [ ] `AWS_S3_BUCKET_NAME`

**Monitoring & Logging**:

- [ ] `AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING`
- [ ] `SENTRY_DSN` (error tracking - if applicable)
- [ ] `LOG_LEVEL=debug` (verbose logging for staging)

**Caching & Performance**:

- [ ] `REDIS_URL` (staging Redis instance)
- [ ] `REDIS_PASSWORD`

**API Keys**:

- [ ] `GOOGLE_MAPS_API_KEY` (for location services)
- [ ] Any third-party API keys

#### Environment File Example

```env
# Application
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.farmersmarket.com
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@staging-db.postgres.database.azure.com:5432/farmers_market_staging?schema=public

# Authentication
NEXTAUTH_URL=https://staging.farmersmarket.com
NEXTAUTH_SECRET=staging_secret_generate_unique_value_here
GOOGLE_CLIENT_ID=your_staging_google_client_id
GOOGLE_CLIENT_SECRET=your_staging_google_client_secret

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# AWS S3
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=farmers-market-staging

# Redis
REDIS_URL=redis://staging-redis.redis.cache.windows.net:6380
REDIS_PASSWORD=xxxxxxxxxxxxxxxx

# Monitoring
AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@farmersmarket.com
```

### ✅ Build & Compilation

- [ ] **Production build succeeds**
  ```bash
  npm run build
  ```
- [ ] **Build output verified** (check `.next/` directory)
- [ ] **Static assets optimized** (images, CSS, JS)
- [ ] **Bundle size acceptable** (<500KB initial load)
- [ ] **No build warnings** (or documented)

### ✅ Infrastructure

- [ ] **Hosting platform** configured (Vercel/Azure/AWS)
- [ ] **Domain/subdomain** configured (staging.farmersmarket.com)
- [ ] **SSL certificate** provisioned and active
- [ ] **CDN** configured (Cloudflare/CloudFront)
- [ ] **Load balancer** configured (if applicable)
- [ ] **Auto-scaling** rules configured
- [ ] **Health check endpoints** configured (`/api/health`)

---

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] **Security headers** configured
  - [ ] Content-Security-Policy
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] Strict-Transport-Security
  - [ ] Referrer-Policy: strict-origin-when-cross-origin

- [ ] **CORS** properly configured
- [ ] **Rate limiting** enabled on API routes
- [ ] **Authentication** middleware verified
- [ ] **Authorization** checks in place
- [ ] **Input validation** using Zod schemas
- [ ] **SQL injection** prevention (Prisma parameterized queries)
- [ ] **XSS protection** in place
- [ ] **CSRF tokens** implemented (NextAuth handles this)
- [ ] **API keys** not exposed in client-side code
- [ ] **Environment secrets** stored securely (Azure Key Vault / AWS Secrets Manager)

### Security Testing

- [ ] **OWASP Top 10** vulnerabilities checked
- [ ] **Dependency vulnerabilities** scanned (`npm audit`)
- [ ] **Authentication flows** tested
- [ ] **Authorization boundaries** tested
- [ ] **Payment security** verified (PCI compliance)

---

## 📊 Monitoring & Observability

### Monitoring Setup

- [ ] **Application Insights** configured
  - [ ] Custom events tracking
  - [ ] Performance metrics
  - [ ] Error tracking
  - [ ] User flow analytics

- [ ] **OpenTelemetry** tracing active
  - [ ] Service traces
  - [ ] Database query traces
  - [ ] External API call traces

- [ ] **Log aggregation** configured
  - [ ] Structured logging
  - [ ] Log levels appropriate for staging
  - [ ] Log retention policy

- [ ] **Uptime monitoring** configured
  - [ ] Ping tests every 5 minutes
  - [ ] Alert thresholds set

- [ ] **Performance monitoring**
  - [ ] Page load times
  - [ ] API response times
  - [ ] Database query performance

### Alert Configuration

- [ ] **Error rate alerts** (>1% error rate)
- [ ] **Response time alerts** (>2 second average)
- [ ] **Database connection alerts**
- [ ] **Payment failure alerts**
- [ ] **Security incident alerts**
- [ ] **Alert recipients** configured (email/Slack)

### Dashboards

- [ ] **Application dashboard** created
  - [ ] Request volume
  - [ ] Error rates
  - [ ] Response times
  - [ ] Active users

- [ ] **Business metrics dashboard**
  - [ ] Order completion rate
  - [ ] Cart abandonment rate
  - [ ] Payment success rate
  - [ ] Average order value

---

## 🧪 Testing in Staging

### Functional Testing

- [ ] **User registration** flow tested
- [ ] **User login** flow tested
- [ ] **Browse products** functionality tested
- [ ] **Add to cart** functionality tested
- [ ] **Checkout flow** end-to-end tested
- [ ] **Payment processing** tested (Stripe test mode)
- [ ] **Order confirmation** emails tested
- [ ] **User profile** management tested
- [ ] **Farm listings** tested
- [ ] **Search functionality** tested
- [ ] **Filters and sorting** tested
- [ ] **Mobile responsiveness** verified

### Performance Testing

- [ ] **Load testing** completed
  - [ ] 100 concurrent users
  - [ ] 1000 requests/minute
  - [ ] Checkout flow under load

- [ ] **Database performance** verified
  - [ ] Query times < 100ms
  - [ ] No N+1 queries
  - [ ] Connection pool stable

- [ ] **API response times** acceptable
  - [ ] < 200ms for read operations
  - [ ] < 500ms for write operations
  - [ ] < 1s for complex operations

- [ ] **Caching effectiveness** verified
  - [ ] Cache hit rate > 80%
  - [ ] Cache invalidation working

### Integration Testing

- [ ] **Stripe payment** integration tested
  - [ ] Successful payments
  - [ ] Failed payments
  - [ ] Webhook handling
  - [ ] Refund processing

- [ ] **Email delivery** tested
  - [ ] Order confirmation
  - [ ] Password reset
  - [ ] Account verification
  - [ ] Order status updates

- [ ] **File upload** tested (product images)
- [ ] **Map integration** tested (farm locations)
- [ ] **OAuth providers** tested (Google, Facebook)

### Chaos Testing

- [ ] **Database connection failure** handling
- [ ] **Redis connection failure** handling
- [ ] **Stripe API failure** handling
- [ ] **Email service failure** handling
- [ ] **High traffic spike** handling

---

## 📦 Deployment Steps

### 1. Pre-Deployment Backup

```bash
# Backup current staging database (if exists)
pg_dump $DATABASE_URL > staging_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup environment configuration
cp .env.staging .env.staging.backup
```

### 2. Code Deployment

**Option A: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel --prod --env staging

# Or use GitHub integration (automatic on push to staging branch)
```

**Option B: Azure App Service**

```bash
# Login to Azure
az login

# Deploy to staging slot
az webapp deployment source config-zip \
  --resource-group farmers-market-rg \
  --name farmers-market-staging \
  --src ./build.zip
```

**Option C: Docker + Kubernetes**

```bash
# Build Docker image
docker build -t farmers-market:staging .

# Push to container registry
docker tag farmers-market:staging registry.azurecr.io/farmers-market:staging
docker push registry.azurecr.io/farmers-market:staging

# Deploy to Kubernetes
kubectl apply -f k8s/staging/
kubectl rollout status deployment/farmers-market-staging
```

### 3. Database Migration

```bash
# Run Prisma migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status

# Generate Prisma client (if needed)
npx prisma generate

# Seed staging data (if needed)
npx prisma db seed
```

### 4. Post-Deployment Verification

- [ ] **Application starts** successfully
- [ ] **Health check** returns 200 OK (`/api/health`)
- [ ] **Database connection** verified
- [ ] **Redis connection** verified
- [ ] **Environment variables** loaded correctly
- [ ] **Static assets** loading
- [ ] **Homepage** renders correctly
- [ ] **API routes** responding

### 5. Smoke Tests

```bash
# Run critical path tests against staging
npm run test:staging

# Manual smoke tests:
# 1. Load homepage
# 2. Register new user
# 3. Browse products
# 4. Add to cart
# 5. Complete checkout (test payment)
# 6. Verify order confirmation
```

### 6. Monitoring Verification

- [ ] **Application Insights** receiving telemetry
- [ ] **Error tracking** working
- [ ] **Performance metrics** reporting
- [ ] **Alerts** configured and testable
- [ ] **Logs** aggregating properly

---

## 🔄 Rollback Plan

### If Deployment Fails

**Immediate Actions**:

1. **Stop deployment** process
2. **Assess issue** (logs, errors, monitoring)
3. **Decide**: Fix forward or rollback

**Rollback Steps**:

**Vercel**:

```bash
# Rollback to previous deployment
vercel rollback
```

**Azure**:

```bash
# Swap staging slot back
az webapp deployment slot swap \
  --resource-group farmers-market-rg \
  --name farmers-market-staging \
  --slot staging \
  --action swap
```

**Database Rollback** (if needed):

```bash
# Restore from backup
psql $DATABASE_URL < staging_backup_TIMESTAMP.sql

# Or use Prisma migration rollback
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

**Post-Rollback**:

- [ ] Verify application stability
- [ ] Notify team of rollback
- [ ] Document failure reason
- [ ] Create fix plan

---

## 📞 Support & Escalation

### Contact Information

**DevOps Team**: devops@farmersmarket.com  
**Backend Team**: backend@farmersmarket.com  
**On-Call Engineer**: [Slack channel or phone]

### Issue Escalation

**Severity Levels**:

- **P0 (Critical)**: Site down, payments failing, data loss
- **P1 (High)**: Major feature broken, performance degraded
- **P2 (Medium)**: Minor feature issue, cosmetic bugs
- **P3 (Low)**: Enhancement requests, minor issues

**Escalation Path**:

1. Check monitoring dashboards
2. Review logs and errors
3. Attempt quick fix (if safe)
4. Contact on-call engineer
5. Escalate to team lead if unresolved in 30 minutes

---

## ✅ Post-Deployment Tasks

### Immediate (Within 1 Hour)

- [ ] **Verify core functionality**
  - [ ] User registration/login
  - [ ] Product browsing
  - [ ] Cart operations
  - [ ] Checkout flow
  - [ ] Payment processing

- [ ] **Check monitoring**
  - [ ] No spike in errors
  - [ ] Response times normal
  - [ ] Database performance stable

- [ ] **Review logs**
  - [ ] No unexpected errors
  - [ ] All services healthy

### Short-Term (Within 24 Hours)

- [ ] **Performance analysis**
  - [ ] Review Application Insights data
  - [ ] Check for bottlenecks
  - [ ] Verify caching effectiveness

- [ ] **User testing**
  - [ ] Internal team testing
  - [ ] Beta user testing (if applicable)

- [ ] **Documentation update**
  - [ ] Update deployment notes
  - [ ] Document any issues encountered
  - [ ] Update runbooks

### Medium-Term (Within 1 Week)

- [ ] **Full regression testing**
- [ ] **Performance optimization**
- [ ] **Security audit**
- [ ] **Stakeholder demo**
- [ ] **Prepare for production deployment**

---

## 📝 Deployment Notes

### Deployment Date/Time

**Date**: ******\_\_\_******  
**Time**: ******\_\_\_******  
**Deployed By**: ******\_\_\_******

### Deployment Summary

- **Version**: ******\_\_\_******
- **Git Commit**: ******\_\_\_******
- **Build Number**: ******\_\_\_******
- **Duration**: ******\_\_\_******

### Issues Encountered

_Document any issues during deployment:_

---

### Resolution

_Document how issues were resolved:_

---

### Lessons Learned

_Document improvements for next deployment:_

---

## 🎯 Success Criteria

Deployment is considered successful when:

- [x] All tests passing (100%)
- [ ] Application accessible at staging URL
- [ ] All core features functioning
- [ ] No critical errors in logs
- [ ] Performance metrics within acceptable range
- [ ] Monitoring and alerts active
- [ ] Team notified of successful deployment

---

## 📚 Additional Resources

- **Testing Patterns**: `.github/TESTING_PATTERNS_QUICK_REFERENCE.md`
- **Architecture Guide**: `.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md`
- **Database Guide**: `.github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md`
- **Security Guide**: `.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md`
- **Performance Guide**: `.github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md`

---

**🌾 Divine Agricultural Platform - Staging Deployment Ready ⚡**

**Approved By**: ******\_\_\_******  
**Date**: ******\_\_\_******  
**Next Review**: After staging verification complete
