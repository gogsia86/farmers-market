# 🧪 Deployment Testing Workflow

**Farmers Market Platform - Complete Testing Bot**  
**Version:** 1.0.0  
**Created:** January 2025  
**Status:** ✅ Ready for Production

---

## 📋 Overview

This document provides a complete workflow for testing Vercel deployments of the Farmers Market Platform. All tools and scripts are automated and ready to use.

---

## 🚀 Quick Start

### 1. Test Current Deployment

```bash
# Test production deployment
bash scripts/test-deployment.sh

# Test specific URL
DEPLOYMENT_URL=https://your-preview.vercel.app bash scripts/test-deployment.sh

# Include local build test
RUN_LOCAL_BUILD=true bash scripts/test-deployment.sh
```

### 2. Verify Deployment with Node.js

```bash
# Run Node.js verification script
node scripts/verify-deployment.js

# Test specific deployment
DEPLOYMENT_URL=https://your-preview.vercel.app node scripts/verify-deployment.js
```

### 3. Check Health Endpoint

```bash
# Quick health check
curl https://farmers-market-platform.vercel.app/api/health

# Formatted output
curl -s https://farmers-market-platform.vercel.app/api/health | jq
```

---

## 🤖 Automated Testing Tools

### 1. GitHub Actions Workflow (`.github/workflows/vercel-deploy.yml`)

**Automatic Triggers:**
- ✅ Push to `main` → Production deployment + tests
- ✅ Pull requests → Preview deployment + tests
- ✅ Push to `develop` → Development preview + tests

**What it does:**
1. **Pre-Deployment Checks**
   - Node.js and npm version verification
   - Clean dependency installation
   - TypeScript type checking
   - ESLint code quality checks
   - Prisma schema validation
   - Local build test

2. **Deployment**
   - Deploys to Vercel (Preview or Production)
   - Generates deployment URL
   - Comments on PR with preview link

3. **Post-Deployment Tests**
   - Health endpoint verification
   - API route testing
   - Page accessibility checks
   - Response time validation

4. **Monitoring**
   - Production health checks
   - Error rate monitoring
   - Performance metrics tracking

**Usage:**
```bash
# Trigger via GitHub
git push origin main  # Production
git push origin feature/xyz  # Preview (via PR)

# View workflow status
# Visit: GitHub → Actions tab
```

---

### 2. Bash Test Script (`scripts/test-deployment.sh`)

**Comprehensive Test Suite:**
- ✅ Pre-deployment checks (Node, npm, package.json)
- ✅ Local build test (optional)
- ✅ Deployment health checks
- ✅ API endpoint testing
- ✅ Page content validation
- ✅ Security headers verification
- ✅ Response time analysis
- ✅ Vercel deployment info
- ✅ Test report generation

**Usage:**
```bash
# Basic usage
bash scripts/test-deployment.sh

# Custom deployment URL
DEPLOYMENT_URL=https://preview-abc123.vercel.app bash scripts/test-deployment.sh

# Include local build test
RUN_LOCAL_BUILD=true bash scripts/test-deployment.sh

# Silent mode (minimal output)
bash scripts/test-deployment.sh > deployment-test.log 2>&1
```

**Output:**
```
╔═══════════════════════════════════════════════════════╗
║   FARMERS MARKET PLATFORM - DEPLOYMENT TEST SUITE    ║
║              Complete Workflow Testing               ║
╚═══════════════════════════════════════════════════════╝

========================================
PRE-DEPLOYMENT CHECKS
========================================

✅ Node.js v20.11.0 installed
✅ npm 10.2.4 installed
✅ package.json found
✅ Prisma schema found

========================================
DEPLOYMENT HEALTH CHECKS
========================================

✅ Homepage accessibility - HTTP 200
✅ Login page - HTTP 200
✅ Farmer dashboard - HTTP 302
✅ API health endpoint - HTTP 200

========================================
TEST SUMMARY REPORT
========================================

Total Tests:  25
Passed:       24
Failed:       1
Success Rate: 96%

🎉 ALL TESTS PASSED! Deployment is healthy.
```

---

### 3. Node.js Verification Script (`scripts/verify-deployment.js`)

**Detailed Testing:**
- ✅ Core endpoints (homepage, login, dashboard)
- ✅ Farmer routes (dashboard, products, orders)
- ✅ Customer routes (farms, products, cart)
- ✅ API routes (health, auth, farms)
- ✅ Static assets (favicon, robots.txt)
- ✅ Content validation
- ✅ Security headers check
- ✅ Performance metrics

**Usage:**
```bash
# Run verification
node scripts/verify-deployment.js

# Test specific URL
DEPLOYMENT_URL=https://preview.vercel.app node scripts/verify-deployment.js
```

**Features:**
- Colored console output
- Retry logic for failed requests
- Timeout handling (30s default)
- Detailed test results
- Success rate calculation

---

### 4. API Health Endpoint (`/api/health`)

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "api": {
      "status": "healthy",
      "responseTime": "15ms"
    },
    "database": {
      "status": "healthy",
      "latency": "8ms"
    }
  },
  "environment": {
    "nodeVersion": "v20.11.0",
    "platform": "linux",
    "env": "production"
  },
  "version": "1.0.0"
}
```

**Status Codes:**
- `200` - All systems healthy
- `503` - Degraded (database issue)

**Usage:**
```bash
# Basic check
curl https://farmers-market-platform.vercel.app/api/health

# HEAD request (lightweight)
curl -I https://farmers-market-platform.vercel.app/api/health

# Continuous monitoring
watch -n 5 'curl -s https://farmers-market-platform.vercel.app/api/health | jq'
```

---

## 📊 Test Coverage

### Endpoints Tested

| Category | Endpoint | Status Check | Content Check |
|----------|----------|--------------|---------------|
| **Core** | `/` | ✅ | ✅ |
| | `/about` | ✅ | ❌ |
| | `/login` | ✅ | ❌ |
| | `/dashboard` | ✅ | ❌ |
| **Farmer** | `/farmer/dashboard` | ✅ | ❌ |
| | `/farmer/products` | ✅ | ❌ |
| | `/farmer/orders` | ✅ | ❌ |
| **Customer** | `/farms` | ✅ | ❌ |
| | `/products` | ✅ | ❌ |
| | `/cart` | ✅ | ❌ |
| **API** | `/api/health` | ✅ | ✅ |
| | `/api/auth/signin` | ✅ | ❌ |
| | `/api/v1/farms` | ✅ | ❌ |
| **Static** | `/favicon.ico` | ✅ | ❌ |
| | `/robots.txt` | ✅ | ❌ |

### Quality Checks

- ✅ HTTP status codes
- ✅ Response times
- ✅ Content validation
- ✅ Security headers
- ✅ Database connectivity
- ✅ API health status
- ✅ Error handling

---

## 🔄 Deployment Workflow

### Development Flow

```
┌─────────────────────────────────────────────────────┐
│  1. LOCAL DEVELOPMENT                               │
│     ├─ Make changes                                 │
│     ├─ Test locally (npm run dev)                   │
│     └─ Run tests (npm test)                         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  2. PRE-DEPLOYMENT CHECKS                           │
│     ├─ Type check (npm run type-check)              │
│     ├─ Lint (npm run lint)                          │
│     ├─ Build test (npm run build)                   │
│     └─ Prisma validate (npx prisma validate)        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  3. CREATE PULL REQUEST                             │
│     ├─ Push to feature branch                       │
│     ├─ Create PR on GitHub                          │
│     └─ Wait for checks to pass                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  4. AUTOMATED PREVIEW DEPLOYMENT                    │
│     ├─ GitHub Actions triggered                     │
│     ├─ Deploy to Vercel Preview                     │
│     ├─ Run automated tests                          │
│     └─ Comment PR with preview URL                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  5. MANUAL TESTING                                  │
│     ├─ Test preview deployment                      │
│     ├─ Verify all features work                     │
│     └─ Get team approval                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  6. MERGE TO MAIN                                   │
│     ├─ Merge PR                                     │
│     └─ Trigger production deployment                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  7. PRODUCTION DEPLOYMENT                           │
│     ├─ Deploy to Vercel Production                  │
│     ├─ Run post-deployment tests                    │
│     └─ Monitor for issues                           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  8. POST-DEPLOYMENT MONITORING                      │
│     ├─ Check health endpoint                        │
│     ├─ Monitor error rates                          │
│     ├─ Verify performance metrics                   │
│     └─ Test critical user flows                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Testing Strategies

### 1. Pre-Deployment Testing (Local)

```bash
# Full local test suite
npm run type-check      # TypeScript
npm run lint            # Code quality
npm run build           # Build test
npm test                # Unit tests
npm run test:e2e        # E2E tests (optional)
```

### 2. Preview Deployment Testing

```bash
# After PR is created and preview URL is available
DEPLOYMENT_URL=https://preview-xyz.vercel.app bash scripts/test-deployment.sh
```

### 3. Production Deployment Testing

```bash
# After deployment to production
bash scripts/test-deployment.sh
node scripts/verify-deployment.js
```

### 4. Continuous Monitoring

```bash
# Set up monitoring
npm run monitor:daemon

# Check status
npm run monitor:health

# View logs
npm run monitor:daemon:logs
```

---

## 🔍 Troubleshooting

### Test Failures

**If tests fail:**

1. **Check the error message**
   ```bash
   # Review test output
   bash scripts/test-deployment.sh 2>&1 | tee test-output.log
   ```

2. **Verify endpoint manually**
   ```bash
   curl -v https://your-app.vercel.app/api/health
   ```

3. **Check Vercel logs**
   ```bash
   vercel logs
   ```

4. **Review Sentry errors**
   - Visit Sentry dashboard
   - Check for recent errors

### Common Issues

**Health endpoint returns 503:**
- Check database connection
- Verify DATABASE_URL environment variable
- Check database firewall rules

**Tests timeout:**
- Check deployment URL
- Verify network connectivity
- Increase timeout value

**Authentication tests fail:**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches deployment URL

---

## 📈 Success Metrics

### Deployment Quality

**Healthy Deployment:**
- ✅ 100% endpoint availability
- ✅ Response times < 2s
- ✅ Zero critical errors
- ✅ All tests passing
- ✅ Database latency < 100ms

**Acceptable Deployment:**
- ⚠️ 95%+ endpoint availability
- ⚠️ Response times < 5s
- ⚠️ No critical errors
- ⚠️ 90%+ tests passing

**Failed Deployment:**
- ❌ < 95% endpoint availability
- ❌ Response times > 5s
- ❌ Critical errors present
- ❌ < 90% tests passing
- 🔄 **Action: Rollback immediately**

---

## 🚨 Emergency Procedures

### Immediate Rollback

**If deployment fails critical tests:**

1. **Vercel Dashboard (< 1 minute)**
   - Go to https://vercel.com/dashboard
   - Select project → Deployments
   - Find last working deployment
   - Click "⋯" → "Promote to Production"

2. **CLI Rollback**
   ```bash
   vercel ls
   vercel promote <previous-deployment-url>
   ```

3. **Verify rollback**
   ```bash
   bash scripts/test-deployment.sh
   ```

---

## 📚 Documentation

### Related Documents

- **Complete Workflow:** `docs/DEPLOYMENT_WORKFLOW.md`
- **Quick Reference:** `DEPLOYMENT_QUICK_START.md`
- **Build Fixes:** `docs/BUILD_FIX_SUMMARY.md`
- **Vercel Setup:** `docs/VERCEL_DEPLOYMENT.md`
- **Coding Standards:** `.cursorrules`

### External Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## ✅ Checklist

### Before Each Deployment

- [ ] All tests pass locally
- [ ] TypeScript builds without errors
- [ ] Preview deployment tested
- [ ] Team approval received
- [ ] Environment variables verified
- [ ] Database migrations ready
- [ ] Rollback plan prepared

### After Each Deployment

- [ ] Health endpoint returns 200
- [ ] Run automated test suite
- [ ] Manual smoke testing complete
- [ ] Error monitoring active
- [ ] Performance metrics normal
- [ ] Team notified of deployment

---

## 🎉 Summary

**You now have:**

✅ **Automated GitHub Actions workflow** for CI/CD  
✅ **Comprehensive bash test script** for full verification  
✅ **Node.js verification script** for detailed testing  
✅ **Health endpoint** for real-time monitoring  
✅ **Complete documentation** for all workflows  
✅ **Emergency procedures** for quick rollback  

**Ready to deploy with confidence!** 🚀

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Maintained By:** Development Team