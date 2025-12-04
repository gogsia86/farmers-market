# 🚀 Phase 6 Quick Start Guide

**Phase**: Deployment & Production Readiness  
**Goal**: Deploy Farmers Market Platform to production with full observability  
**Time**: 2-3 weeks

---

## 📋 What is Phase 6?

Phase 6 takes the fully tested application from Phase 5 and deploys it to production with:

- ✅ Automated CI/CD pipeline
- ✅ Staging and production environments
- ✅ Health monitoring and observability
- ✅ Error tracking and alerting
- ✅ API documentation
- ✅ Deployment runbooks

---

## ⚡ Quick Start (5 Minutes)

### 1. Check Prerequisites

```bash
# Verify Phase 5 is complete
cat PHASE5_COMPLETE.md

# Ensure all tests pass
npm run test:all

# Verify build succeeds
npm run build
```

### 2. Review Phase 6 Files

```bash
# Main plan
cat PHASE6_PLAN.md

# Deployment runbook
cat docs/DEPLOYMENT_RUNBOOK.md

# Completion checklist
cat PHASE6_CHECKLIST.md
```

### 3. Test Health Endpoints Locally

```bash
# Start dev server
npm run dev

# In another terminal, test health check
curl http://localhost:3001/api/health

# Test readiness probe
curl http://localhost:3001/api/ready
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-12-02T...",
  "version": "1.0.0",
  "uptime": 123.45,
  "checks": {
    "database": { "status": "up", "responseTime": 45 },
    "memory": { "used": 128, "total": 512, "percentage": 25 }
  }
}
```

---

## 🏗️ Infrastructure Setup

### Step 1: Create Vercel Projects

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

Follow prompts:

- **Scope**: Select your team
- **Link to existing project?**: No
- **Project name**: farmers-market-platform
- **Directory**: ./

### Step 2: Configure Staging Environment

```bash
# Add environment variables to Vercel
vercel env add DATABASE_URL staging
# Paste: postgresql://user:pass@host:5432/farmersmarket_staging

vercel env add NEXTAUTH_SECRET staging
# Generate: openssl rand -base64 32

vercel env add NEXTAUTH_URL staging
# Enter: https://your-staging-url.vercel.app

vercel env add NODE_ENV staging
# Enter: production
```

### Step 3: Configure Production Environment

```bash
# Repeat for production
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add NODE_ENV production
```

### Step 4: Configure Monitoring (Optional)

```bash
# Add Azure Application Insights (if available)
vercel env add APPLICATIONINSIGHTS_CONNECTION_STRING staging
vercel env add APPLICATIONINSIGHTS_CONNECTION_STRING production

# Add Sentry DSN (if not already configured)
vercel env add SENTRY_DSN staging
vercel env add SENTRY_DSN production
```

---

## 🚀 First Deployment

### Deploy to Staging

```bash
# Deploy to staging
vercel

# Or push to main branch (auto-deploys via GitHub Actions)
git push origin main
```

### Verify Staging Deployment

```bash
# Get deployment URL from Vercel output
STAGING_URL="https://your-app-staging.vercel.app"

# Test health check
curl $STAGING_URL/api/health

# Test API endpoint
curl $STAGING_URL/api/products?limit=5

# Open in browser
open $STAGING_URL
```

### Deploy to Production

```bash
# Deploy to production (requires --prod flag)
vercel --prod

# Or use GitHub Actions with manual approval
# Go to: https://github.com/your-org/farmers-market/actions
# Trigger: "Production Deployment Pipeline"
```

---

## 🔍 Monitoring Setup

### View Deployment Logs

```bash
# View logs for latest deployment
vercel logs

# Or view specific deployment
vercel logs [deployment-url]
```

### Check Application Insights (if configured)

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to Application Insights resource
3. View Live Metrics, Logs, and Traces

### Check Sentry for Errors

1. Go to Sentry dashboard: https://sentry.io
2. Select farmers-market project
3. Review error reports

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] **Health check returns 200**

  ```bash
  curl https://your-app.vercel.app/api/health
  ```

- [ ] **Readiness probe returns 200**

  ```bash
  curl https://your-app.vercel.app/api/ready
  ```

- [ ] **Homepage loads**
  - Open in browser
  - Check for console errors
  - Verify images load

- [ ] **API endpoints work**

  ```bash
  curl https://your-app.vercel.app/api/products
  ```

- [ ] **Authentication works**
  - Test login
  - Verify session persists

- [ ] **Database connected**
  - Check health endpoint shows "database": "up"

- [ ] **No errors in Sentry**
  - Check Sentry dashboard
  - Verify no error spikes

---

## 🔧 CI/CD Pipeline

### GitHub Actions Workflow

The pipeline automatically:

1. **Quality Gate**: TypeScript, ESLint, tests
2. **Build**: Create production bundle
3. **Deploy Staging**: Auto-deploy to staging
4. **E2E Tests**: Run smoke tests
5. **Deploy Production**: Manual approval required
6. **Monitor**: Post-deployment health checks

### View Pipeline Status

```bash
# Go to GitHub Actions
open https://github.com/your-org/farmers-market/actions

# Or check locally
gh workflow view production-deployment
```

### Trigger Manual Deployment

```bash
# Via GitHub CLI
gh workflow run production-deployment.yml \
  -f environment=staging

# Or via GitHub UI
# Actions → Production Deployment Pipeline → Run workflow
```

---

## 📊 Monitoring Dashboards

### Health Monitoring

**Endpoint**: `/api/health`

Monitors:

- Database connectivity
- Memory usage
- System uptime
- Environment status

**Frequency**: Every 30 seconds (recommended)

### Readiness Probe

**Endpoint**: `/api/ready`

Checks:

- Database available
- Prisma client initialized
- All dependencies ready

**Use**: Load balancer health checks

### Custom Metrics

Track in your application:

- API response times
- Error rates
- User activity
- Business metrics (orders, revenue)

---

## 🚨 Troubleshooting

### Deployment Fails

```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Check for missing environment variables
vercel env ls
```

### Health Check Fails

```bash
# Check deployment logs
vercel logs [deployment-url]

# Test database connection
# Verify DATABASE_URL is correct

# Check Prisma client
npm run postinstall
```

### High Error Rate

```bash
# Check Sentry
# Review error messages and stack traces

# Check Application Insights
# Review exception logs

# Rollback if critical
vercel rollback [deployment-url]
```

### Slow Performance

```bash
# Check database queries
# Review slow query logs

# Check Vercel function limits
# Memory: 1GB default
# Timeout: 10s default

# Consider optimization:
# - Database indexes
# - Query optimization
# - Caching layer
```

---

## 📚 Key Files

### Configuration

- `.github/workflows/production-deployment.yml` - CI/CD pipeline
- `vercel.json` - Vercel configuration
- `instrumentation.ts` - Telemetry setup

### Monitoring

- `src/app/api/health/route.ts` - Health check endpoint
- `src/app/api/ready/route.ts` - Readiness probe
- `src/lib/telemetry/config.ts` - OpenTelemetry config
- `src/lib/telemetry/tracing.ts` - Tracing utilities

### Documentation

- `docs/DEPLOYMENT_RUNBOOK.md` - Deployment procedures
- `docs/openapi-products.yaml` - API documentation
- `PHASE6_CHECKLIST.md` - Completion checklist
- `PHASE6_PLAN.md` - Detailed phase plan

---

## 🎯 Success Criteria

Phase 6 is complete when:

1. ✅ Application deployed to staging
2. ✅ Application deployed to production
3. ✅ CI/CD pipeline working
4. ✅ Health monitoring active
5. ✅ Error tracking functional
6. ✅ Rollback tested
7. ✅ Team trained
8. ✅ Documentation complete

---

## 🔄 Common Commands

```bash
# Deploy to staging
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Rollback deployment
vercel rollback [deployment-url]

# View environment variables
vercel env ls

# Run health check
curl $(vercel inspect --wait)/api/health

# Run tests before deployment
npm run test:all

# Check deployment status
vercel inspect [deployment-url]
```

---

## 📞 Getting Help

### Documentation

- [PHASE6_PLAN.md](./PHASE6_PLAN.md) - Complete phase documentation
- [DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) - Step-by-step deployment guide
- [Vercel Docs](https://vercel.com/docs) - Official Vercel documentation

### Support Channels

- **Slack**: #phase6-deployment
- **GitHub Issues**: Tag with `phase-6` label
- **On-call**: @devops-oncall

### Common Issues

See `docs/DEPLOYMENT_RUNBOOK.md` → Troubleshooting section

---

## 🎉 Next Steps After Phase 6

Once Phase 6 is complete:

1. **Phase 7**: Feature expansion (orders, notifications)
2. **Phase 8**: Mobile app development
3. **Phase 9**: Advanced features (AI recommendations)
4. **Phase 10**: Scale optimization (multi-region)

---

## 📈 Monitoring Best Practices

### Daily Checks

- [ ] Review Sentry for new errors
- [ ] Check Application Insights metrics
- [ ] Verify health endpoint responding
- [ ] Monitor deployment success rate

### Weekly Reviews

- [ ] Performance benchmarks
- [ ] Error rate trends
- [ ] User feedback analysis
- [ ] Infrastructure costs

### Monthly Audits

- [ ] Security updates
- [ ] Dependency updates
- [ ] Documentation updates
- [ ] Team retrospectives

---

## 🔒 Security Checklist

Before production:

- [ ] All secrets in environment variables (not hardcoded)
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS policy defined
- [ ] Authentication tested
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

---

## 🎓 Resources

### Essential Reading

1. **Phase 6 Plan** - Complete overview
2. **Deployment Runbook** - Step-by-step procedures
3. **Vercel Docs** - Platform-specific guides
4. **Next.js Deployment** - Framework best practices

### Video Tutorials

- Vercel Deployment Walkthrough
- OpenTelemetry Setup Guide
- CI/CD Pipeline Configuration

### Community

- Vercel Discord
- Next.js GitHub Discussions
- Farmers Market Platform Slack

---

**Remember**:

- Test thoroughly in staging first
- Always have a rollback plan
- Monitor closely after deployment
- Document everything you learn

_"Deploy with confidence, monitor with precision, respond with speed."_ 🚀
