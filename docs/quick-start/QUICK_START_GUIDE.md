# 🚀 Quick Start Guide - New Features

**Farmers Market Platform - Load Testing, Auth Fix & Notifications**

---

## 📊 1. Run Load Test

### Quick Test (3 minutes)

```bash
"C:\Program Files\k6\k6.exe" run --vus 25 --duration 3m tests/load/marketplace-load.js
```

### Full Test (10 minutes)

```bash
"C:\Program Files\k6\k6.exe" run tests/load/marketplace-load.js
```

### View Results

```bash
# Results saved to:
tests/load/results/marketplace-summary.json

# Full report:
LOAD_TEST_RESULTS.md
```

---

## 🔐 2. Run E2E Tests with Authentication

### Run All Tests (Recommended)

```bash
run-e2e-with-auth.bat
```

### Run Specific Browser

```bash
run-e2e-with-auth.bat --browser chromium
```

### Run in Headed Mode (Watch Tests)

```bash
run-e2e-with-auth.bat --headed
```

### Run Specific Tests

```bash
run-e2e-with-auth.bat --grep "marketplace"
```

### View Test Report

```bash
npx playwright show-report
```

---

## 📢 3. Send Slack Notifications

### Setup (One-time, 5 minutes)

1. **Create Webhook**
   - Go to: https://api.slack.com/messaging/webhooks
   - Create app: "Farmers Market Bot"
   - Enable Incoming Webhooks
   - Add to channel: `#ci-notifications`
   - Copy webhook URL

2. **Set Environment Variable**

   ```bash
   # Add to .env.local
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. **For GitHub Actions**

   ```
   Settings → Secrets and variables → Actions
   → New repository secret

   Name:  SLACK_WEBHOOK_URL
   Value: your-webhook-url
   ```

### Send Test Notification

```bash
npx ts-node scripts/slack-notify.ts "Test notification 🚀"
```

### From Code

```typescript
import { createSlackNotifier } from "./scripts/slack-notify";

const notifier = createSlackNotifier();

// Success
await notifier.sendSuccess("Deploy Complete", "Version 1.2.3 live");

// Error
await notifier.sendError("Build Failed", new Error("Compilation error"));

// Test Results
await notifier.sendTestResults({
  passed: 420,
  failed: 15,
  skipped: 5,
  total: 435,
  duration: 150000,
});
```

---

## 📁 Important Files

### Documentation

- `LOAD_TEST_RESULTS.md` - Performance analysis (559 lines)
- `SLACK_NOTIFICATION_SETUP.md` - Slack setup guide (562 lines)
- `TASK_COMPLETION_SUMMARY.md` - What was completed

### Scripts

- `run-e2e-with-auth.bat` - Run E2E tests with auth
- `scripts/slack-notify.ts` - Slack notification helper

### Configuration

- `playwright.config.temp.ts` - Enhanced Playwright config
- `tests/e2e/auth.setup.ts` - Auth setup tests
- `tests/helpers/auth.ts` - Auth helper functions

### Load Testing

- `tests/load/marketplace-load.js` - Main load test
- `tests/load/api-stress-test.js` - API stress test
- `tests/load/results/` - Test results directory

---

## ⚡ Quick Wins

### Fix Performance Issues (P0)

1. **Add Database Indexes** (1-2 hours)

   ```sql
   CREATE INDEX idx_products_name ON "Product"(name);
   CREATE INDEX idx_products_category ON "Product"(category);
   CREATE INDEX idx_products_farm_id ON "Product"("farmId");
   CREATE INDEX idx_farms_slug ON "Farm"(slug);
   CREATE INDEX idx_orders_user_id ON "Order"("userId");
   ```

2. **Parallel Data Fetching** (30 minutes)

   ```typescript
   // Replace sequential with parallel
   const [farm, products, reviews] = await Promise.all([
     database.farm.findUnique({ where: { id } }),
     database.product.findMany({ where: { farmId: id } }),
     database.review.findMany({ where: { farmId: id } }),
   ]);
   ```

3. **Add Redis Caching** (2-3 hours)
   ```typescript
   const products = await getCachedData(
     "products:featured",
     () => database.product.findMany({ where: { featured: true } }),
     300, // 5 min TTL
   );
   ```

### Verify E2E Improvements

```bash
# Run tests
run-e2e-with-auth.bat

# Expected results:
# Before: 56/435 passed (13%)
# After:  390+/435 passed (90%+)
```

---

## 🔍 Check Status

### Load Test Health

```bash
# View last results
cat tests/load/results/marketplace-summary.json

# Key metrics:
# - http_req_duration.avg < 2000ms ✅
# - http_req_failed.rate < 0.01 ✅
# - successful_requests.rate > 0.95 ✅
```

### E2E Test Health

```bash
# Run tests
npx playwright test --config=playwright.config.temp.ts

# Open report
npx playwright show-report
```

### Slack Integration Health

```bash
# Test notification
npx ts-node scripts/slack-notify.ts "Health check"

# Check GitHub Actions
# Go to: Actions tab in GitHub
# Verify: Slack notifications appear
```

---

## 🆘 Troubleshooting

### Load Test: "k6: command not found"

```bash
# Use full path
"C:\Program Files\k6\k6.exe" run tests/load/marketplace-load.js
```

### E2E: "Dev server not running"

```bash
# Start dev server first
npm run dev

# Then in another terminal
run-e2e-with-auth.bat
```

### E2E: "Auth files missing"

```bash
# Run setup explicitly
npx playwright test tests/e2e/auth.setup.ts --project=setup

# Verify files created
dir tests\auth\.auth
```

### Slack: "No messages appearing"

```bash
# Verify webhook URL
echo %SLACK_WEBHOOK_URL%

# Test with curl
curl -X POST -H "Content-type: application/json" ^
  --data "{\"text\":\"Test\"}" ^
  YOUR_WEBHOOK_URL
```

---

## 📈 Expected Metrics

### Load Test (After Optimization)

| Metric            | Target |
| ----------------- | ------ |
| Avg Response Time | <500ms |
| P95 Response Time | <2s    |
| Success Rate      | >99%   |
| Requests/Second   | >50    |

### E2E Tests (After Auth Fix)

| Metric      | Target |
| ----------- | ------ |
| Pass Rate   | >90%   |
| Total Tests | 435    |
| Passed      | 390+   |
| Failed      | <45    |

### Notifications

| Event       | Status        |
| ----------- | ------------- |
| E2E Success | ✅ Configured |
| E2E Failure | ✅ Configured |
| Load Tests  | ✅ Configured |
| Monitoring  | ✅ Configured |

---

## 🎯 Daily Workflow

### Morning (Start of Day)

```bash
# 1. Pull latest code
git pull

# 2. Start dev server
npm run dev

# 3. Run quick E2E smoke test
run-e2e-with-auth.bat --grep "homepage"
```

### Before Push

```bash
# 1. Run all E2E tests
run-e2e-with-auth.bat

# 2. Verify >90% pass rate
npx playwright show-report

# 3. Fix any new failures
# 4. Push code
git push
```

### Weekly

```bash
# 1. Run load test
"C:\Program Files\k6\k6.exe" run tests/load/marketplace-load.js

# 2. Review performance
cat tests/load/results/marketplace-summary.json

# 3. Check for regressions
# Compare with baseline in LOAD_TEST_RESULTS.md
```

---

## 🔗 Quick Links

### Documentation

- [Load Test Results](LOAD_TEST_RESULTS.md)
- [Slack Setup](SLACK_NOTIFICATION_SETUP.md)
- [Task Summary](TASK_COMPLETION_SUMMARY.md)

### External

- [K6 Docs](https://k6.io/docs/)
- [Playwright Docs](https://playwright.dev/)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)

### Project Instructions

- [Testing Mastery](.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md)
- [Security & Testing](.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md)
- [CI/CD](.github/instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md)

---

## ✅ Checklist for New Developers

Setting up on a new machine:

- [ ] Clone repository
- [ ] Install Node.js (v22)
- [ ] Run `npm install`
- [ ] Install K6 (`winget install k6`)
- [ ] Install Playwright browsers (`npx playwright install`)
- [ ] Start dev server (`npm run dev`)
- [ ] Run auth setup (`npx playwright test tests/e2e/auth.setup.ts --project=setup`)
- [ ] Run E2E tests (`run-e2e-with-auth.bat`)
- [ ] Configure Slack webhook (optional)
- [ ] Read documentation (`LOAD_TEST_RESULTS.md`, `SLACK_NOTIFICATION_SETUP.md`)

---

## 💡 Pro Tips

1. **Use Headed Mode for Debugging**

   ```bash
   run-e2e-with-auth.bat --headed --browser chromium
   ```

2. **Run Only Failed Tests**

   ```bash
   npx playwright test --last-failed --config=playwright.config.temp.ts
   ```

3. **Update Snapshots**

   ```bash
   npx playwright test --update-snapshots
   ```

4. **Debug Single Test**

   ```bash
   npx playwright test tests/e2e/marketplace.spec.ts --headed --debug
   ```

5. **Load Test with Custom Duration**

   ```bash
   k6 run --duration 5m --vus 50 tests/load/marketplace-load.js
   ```

6. **Batch Slack Notifications**
   ```typescript
   // Instead of multiple calls
   await notifier.sendInfo("Summary", `Test 1: ✅\nTest 2: ✅\nTest 3: ❌`);
   ```

---

**Last Updated:** December 5, 2024  
**Status:** ✅ All Systems Operational  
**Questions?** Check `TASK_COMPLETION_SUMMARY.md` or documentation files
