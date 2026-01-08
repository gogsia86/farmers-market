# 🤖 Bot System - Quick Reference Card

**Farmers Market Platform** | **Updated**: January 8, 2026

---

## 🚀 Quick Start Commands

```bash
# Health Check (30 seconds)
npm run bot:health

# Full Validation (2-3 minutes)
npm run bot:check

# MVP Validation (3-5 minutes)
TEST_USER_PASSWORD=YourPassword123! npm run bot:mvp

# Continuous Monitoring (background)
npm run bot:watch

# Critical Endpoints Only (1 minute)
npm run bot:critical
```

---

## 📊 Available Bots

| Bot | Purpose | Runtime | Command |
|-----|---------|---------|---------|
| **Workflow Monitor** | Health & uptime monitoring | 30s | `npm run bot:run` |
| **MVP Validator** | End-to-end feature validation | 3-5m | `npm run bot:mvp` |
| **Website Checker** | Endpoint coverage testing | 2-3m | `npm run bot:check` |
| **GitHub Actions** | CI/CD automated checks | 8-12m | Automatic |

---

## 🎯 Bot Features

### Workflow Monitor Bot
- ✅ Real-time health checks
- ✅ Performance metrics
- ✅ Database connectivity
- ✅ API validation
- ✅ Auto-retry (3 attempts)

**Monitors**:
- Health: `/api/health`, `/api/ready`
- Pages: `/`, `/login`, `/marketplace`
- Dashboards: `/dashboard`, `/farmer/dashboard`

### MVP Validation Bot
- ✅ Complete user journeys
- ✅ E-commerce flows
- ✅ Stripe payment testing
- ✅ Email notifications
- ✅ Mobile responsiveness
- ✅ Security validation

**Validates**: 15 critical MVP requirements

### Enhanced Website Checker
- ✅ 95%+ endpoint coverage
- ✅ 53 unique endpoints
- ✅ Authentication flows
- ✅ File uploads
- ✅ Webhook simulation
- ✅ Performance benchmarking

### GitHub Actions Workflow
- ✅ 27 automated checks
- ✅ Code quality validation
- ✅ Security scanning
- ✅ Build verification
- ✅ Type safety checks

---

## 💻 Command Reference

### Workflow Monitor
```bash
# Single check
npm run bot:run

# Continuous monitoring (30s intervals)
npm run bot:watch

# Critical endpoints only
npm run bot:critical

# Health check only
npm run bot:health

# List all monitored endpoints
npx tsx scripts/workflow-monitor.ts list

# Custom URL
BASE_URL=https://staging.app npm run bot:run
```

### MVP Validation
```bash
# Full MVP validation
TEST_USER_PASSWORD=YourPassword123! npm run bot:mvp

# Headed mode (see browser)
TEST_USER_PASSWORD=YourPassword123! npm run bot:mvp:headed

# Specific checks only
npm run bot:mvp:only

# Custom base URL
BASE_URL=https://staging.app TEST_USER_PASSWORD=XXX npm run bot:mvp
```

### Website Checker
```bash
# Run all checks
npm run bot:check

# Continuous mode
npm run bot:watch

# Development mode
npm run bot:check:dev

# Specific workflow
npm run bot:workflows
```

### GitHub Actions
```bash
# Trigger manually
gh workflow run "Divine Workflow Bot"

# View latest run
gh run list --workflow="Divine Workflow Bot"

# Watch run in progress
gh run watch
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Base URLs
BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Test Credentials
TEST_USER_PASSWORD=YourPassword123!
ADMIN_TEST_EMAIL=admin@farmersmarket.test
FARMER_TEST_EMAIL=farmer@farmersmarket.test
CUSTOMER_TEST_EMAIL=customer@farmersmarket.test

# Stripe Testing
STRIPE_SECRET_KEY=sk_test_xxxxx

# Bot Behavior
HEADLESS=true              # Run headless browsers
BOT_TIMEOUT=60000          # 60 second timeout
BOT_RETRIES=3              # Retry failed checks 3x
```

### Configuration Files
- `scripts/workflow-monitor.ts` - Monitor bot config
- `scripts/mvp-validation-bot.ts` - MVP bot config
- `scripts/enhanced-website-checker.ts` - Checker config
- `.github/workflows/divine-workflow-bot.yml` - CI/CD config

---

## 📈 Success Metrics

### Good Health Indicators
- ✅ Success rate > 95%
- ✅ Avg response time < 500ms
- ✅ Zero critical failures
- ✅ All GitHub checks pass

### Warning Signs
- ⚠️ Success rate 85-95%
- ⚠️ Response times 500ms-1s
- ⚠️ 1-2 critical failures
- ⚠️ Some GitHub checks failing

### Action Required
- ❌ Success rate < 85%
- ❌ Response times > 1s
- ❌ 3+ critical failures
- ❌ Build failing

---

## 🎯 Common Use Cases

### 1. Pre-Commit Check
```bash
# Before committing changes
npm run bot:check
```

### 2. Development Monitoring
```bash
# Keep running in background
npm run bot:watch
```

### 3. Pre-Deployment Validation
```bash
# Validate staging before production
BASE_URL=https://staging.app npm run bot:mvp
```

### 4. Production Monitoring
```bash
# Monitor live site
BASE_URL=https://farmersmarket.app npm run bot:watch
```

### 5. CI/CD Pipeline
```bash
# Automatic on push/PR
git push origin feature/my-feature
# GitHub Actions runs automatically
```

---

## 🐛 Troubleshooting

### Bot Won't Start
```bash
# Check dependencies
npm install

# Regenerate Prisma client
npx prisma generate

# Check database connection
npm run db:studio
```

### Tests Failing
```bash
# Check server is running
curl http://localhost:3001/api/health

# Check database seeded
npm run db:seed:basic

# Review error logs
cat mvp-validation-screenshots/*.png
```

### Timeouts
```bash
# Increase timeout
BOT_TIMEOUT=120000 npm run bot:check

# Check network/database latency
npm run bot:health
```

### Authentication Issues
```bash
# Verify credentials
echo $TEST_USER_PASSWORD

# Check users exist
npx prisma studio
# Navigate to User table

# Reset test users
npm run db:seed:basic
```

---

## 📊 Output Interpretation

### Workflow Monitor Output
```
✅ Health Check: /api/health (145ms)
✅ Critical Page: / (523ms)
❌ Dashboard: /dashboard (TIMEOUT)
```
- **✅ Green** = Success (< 400 status code)
- **⚠️ Yellow** = Warning (400-499 status)
- **❌ Red** = Failure (500+ or timeout)

### MVP Validation Output
```
✅ [CRITICAL] Farmer Registration (2345ms)
⚠️ [HIGH] Email Notification (5678ms)
❌ [MEDIUM] Product Search (FAILED)
```
- **CRITICAL** = Must pass for MVP
- **HIGH** = Important but not blocking
- **MEDIUM/LOW** = Nice to have

### Website Checker Output
```
Overall: HEALTHY ✅
Success Rate: 96.2%
Coverage: 95.3%
```
- **HEALTHY** = 95%+ success rate
- **DEGRADED** = 80-95% success rate
- **DOWN** = < 80% success rate

---

## 🔗 Related Resources

### Documentation
- [Full Bot Analysis](./WORKFLOW_BOT_ANALYSIS.md)
- [Database Setup](./DATABASE_FIX_SUMMARY.md)
- [Test Results](./TEST_RESULTS.md)

### Scripts
- `scripts/workflow-monitor.ts`
- `scripts/mvp-validation-bot.ts`
- `scripts/enhanced-website-checker.ts`

### GitHub
- `.github/workflows/divine-workflow-bot.yml`

---

## 📞 Support

### Common Issues
1. **Server not running**: `npm run dev`
2. **Database not connected**: `docker-compose up -d`
3. **Missing credentials**: Check `.env.local`
4. **Outdated dependencies**: `npm install`

### Getting Help
1. Check error messages in terminal
2. Review screenshots in `./mvp-validation-screenshots/`
3. Check logs: `docker-compose logs`
4. Consult [WORKFLOW_BOT_ANALYSIS.md](./WORKFLOW_BOT_ANALYSIS.md)

---

## ✅ Pre-Deployment Checklist

```
□ All bots passing locally
□ GitHub Actions all green
□ MVP validation 100% pass rate
□ Website checker >95% success rate
□ Performance benchmarks met
□ Security scan completed
□ Mobile testing completed
□ Payment flows tested
□ Email notifications working
□ Database backups verified
```

---

## 🎉 Quick Success Check

**Run this one-liner to validate everything**:

```bash
npm run bot:health && \
npm run bot:check && \
TEST_USER_PASSWORD=YourPassword123! npm run bot:mvp && \
echo "✅ ALL BOTS PASSED - READY FOR PRODUCTION! 🚀"
```

---

**Last Updated**: January 8, 2026
**Status**: ✅ All Bots Operational
**Maintained By**: Development Team
