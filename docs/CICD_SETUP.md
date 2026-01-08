# 🚀 CI/CD Setup Guide - Farmers Market Platform

**Last Updated:** January 8, 2026
**Status:** Production Ready
**Framework:** Unified Bot Framework (UBF)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [Workflow Files](#workflow-files)
5. [Enabling CI/CD](#enabling-cicd)
6. [Testing Locally](#testing-locally)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

---

## 🎯 Overview

The Farmers Market Platform uses the **Unified Bot Framework (UBF)** for automated testing in CI/CD pipelines. The workflow is configured to:

- ✅ Run critical tests on every PR
- ✅ Run full test suite on schedule (daily)
- ✅ Support manual test runs with custom configurations
- ✅ Generate detailed reports and artifacts
- ✅ Comment test results on pull requests
- ✅ Support multi-branch strategies (master, main, develop)

### CI/CD Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Trigger                    │
│  • Push to master/main/develop                              │
│  • Pull Request                                             │
│  • Daily Schedule (2 AM UTC)                                │
│  • Manual Dispatch                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Environment Setup                          │
│  • Node.js 18                                               │
│  • Install dependencies                                     │
│  • Install Playwright browsers                              │
│  • Setup test database                                      │
│  • Build application                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution                            │
│  Critical Tests (PR/Push):                                  │
│    → Health Checks (13 tests)                               │
│    → Auth Flow (farmer login)                               │
│                                                              │
│  Matrix Tests (Scheduled):                                  │
│    → Health                                                 │
│    → Marketplace                                            │
│    → Checkout                                               │
│    → Auth                                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Results & Artifacts                         │
│  • Generate JSON/Markdown/HTML reports                      │
│  • Upload test reports (30 days retention)                  │
│  • Upload screenshots on failure (7 days)                   │
│  • Comment PR with results                                  │
│  • Send notifications on failure                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Prerequisites

### Required Software
- GitHub repository with Actions enabled
- Node.js 18+ (specified in workflow)
- PostgreSQL database (for test environment)
- npm or yarn package manager

### Required Permissions
- Repository admin access (to add secrets)
- GitHub Actions enabled for the repository
- Write permissions for bot to comment on PRs

---

## 🔐 GitHub Secrets Configuration

### Step 1: Navigate to Repository Settings

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Step 2: Add Required Secrets

#### Database Configuration

**`TEST_DATABASE_URL`** (Required)
```
postgresql://username:password@host:5432/farmers_market_test
```
- **Purpose:** Test database connection string
- **Format:** PostgreSQL connection URL
- **Example:** `postgresql://postgres:secret@localhost:5432/fm_test`

**Best Practice:** Use a dedicated test database, NOT your production database!

#### Authentication Secrets

**`NEXTAUTH_SECRET`** (Required)
```
openssl rand -base64 32
```
- **Purpose:** NextAuth.js encryption key
- **Generate:** Run `openssl rand -base64 32` in terminal
- **Example:** `IYu8QvBh0LfKJxMT5wPNnZ9kF2rXmGcA3jDsVbUe4tE=`

**`NEXTAUTH_URL`** (Optional but Recommended)
```
http://localhost:3001
```
- **Purpose:** Base URL for authentication callbacks
- **CI/CD Value:** `http://localhost:3001`
- **Production:** `https://yourdomain.com`

#### Optional Secrets (for full functionality)

**`STRIPE_SECRET_KEY`** (For payment tests)
```
sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Use Stripe test mode keys only!
- Get from: https://dashboard.stripe.com/test/apikeys

**`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`** (For OAuth tests)
- Required only if testing Google authentication
- Get from: https://console.cloud.google.com/

**`SENTRY_DSN`** (For error monitoring)
- Optional: Only if using Sentry in tests
- Get from: https://sentry.io/

### Step 3: Verify Secrets

After adding secrets, verify they appear in the secrets list (values are hidden for security).

---

## 📁 Workflow Files

### Primary Workflow: `ubf-tests.yml`

**Location:** `.github/workflows/ubf-tests.yml`

**Triggers:**
- Push to `master`, `main`, or `develop` → Runs critical tests
- Pull requests → Runs critical tests + comments results
- Daily at 2 AM UTC → Runs full test suite
- Manual dispatch → Runs specified test suite

**Jobs:**

1. **`critical-tests`** (Runs on push/PR)
   - Health checks
   - Authentication flows
   - Fast execution (~2-3 minutes)

2. **`matrix-tests`** (Runs on schedule)
   - Parallel execution across multiple suites
   - Health, Marketplace, Checkout, Auth
   - Full coverage (~10-15 minutes)

3. **`manual-tests`** (Manual trigger only)
   - Choose specific suite to run
   - Choose configuration preset
   - Flexible for debugging

4. **`aggregate-results`** (After matrix tests)
   - Combines results from all suites
   - Generates comprehensive summary
   - Posts to GitHub Actions summary

5. **`cleanup`** (Always runs)
   - Removes artifacts older than 30 days
   - Keeps repository clean

### Supporting Workflows

**`pr-checks.yml`** - Quick validation on PRs
**`ci-cd.yml`** - Main CI/CD pipeline (integrates with UBF)
**`e2e-tests.yml`** - Additional E2E tests

---

## ✅ Enabling CI/CD

### Option 1: Enable for All Pushes (Recommended)

The workflow is **already enabled** for:
- Push to `master`, `main`, `develop`
- All pull requests
- Daily scheduled runs

**No action needed!** Just push your code:

```bash
git add -A
git commit -m "feat: Add new feature"
git push origin master
```

The workflow will automatically trigger.

### Option 2: Manual Trigger (On-Demand)

1. Go to **Actions** tab in your repository
2. Select **🤖 UBF Tests** workflow
3. Click **Run workflow** button
4. Choose:
   - **Branch:** Which branch to test
   - **Suite:** Which tests to run (critical/health/marketplace/etc.)
   - **Preset:** Configuration (quick/ci/mvp)
5. Click **Run workflow**

### Option 3: Disable Automatic Runs

If you want to disable automatic runs temporarily:

1. Go to **Actions** tab
2. Select **🤖 UBF Tests** workflow
3. Click **"..."** menu → **Disable workflow**

To re-enable, click **Enable workflow**.

---

## 🧪 Testing Locally

Before pushing to CI/CD, test the workflow locally:

### Step 1: Set Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/fm_test"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"
```

### Step 2: Install Dependencies

```bash
npm install
npx playwright install --with-deps chromium
```

### Step 3: Setup Test Database

```bash
npx prisma db push --skip-generate
npm run db:seed
```

### Step 4: Start Application

```bash
npm run build
npm run start
```

Wait for server to start on port 3001.

### Step 5: Run Tests

```bash
# Critical tests (same as CI/CD)
npm run bot:test:critical -- --baseUrl=http://localhost:3001 --headless

# Full suite
npm run bot:test:all -- --baseUrl=http://localhost:3001 --headless

# Specific module
npm run bot:test:health -- --baseUrl=http://localhost:3001 --headless
npm run bot:test:marketplace -- --baseUrl=http://localhost:3001 --headless
npm run bot:test:checkout -- --baseUrl=http://localhost:3001 --headless
npm run bot:test:auth -- --baseUrl=http://localhost:3001 --headless
```

### Step 6: Review Results

Check the `reports/` directory for:
- `test-report-[timestamp].json` - Machine-readable results
- `test-report-[timestamp].md` - Human-readable summary
- `test-report-[timestamp].html` - Visual report

---

## 📊 Monitoring & Alerts

### GitHub Actions Dashboard

**View Test Results:**
1. Go to **Actions** tab
2. Click on a workflow run
3. Click on a job (e.g., "Critical Tests")
4. View logs and summary

### PR Comments

When tests run on a pull request, a bot will automatically comment with:
- ✅/❌ Overall status
- Pass/fail counts
- Success rate percentage
- Duration
- Link to full report

Example:
```markdown
## ✅ UBF Critical Tests

| Metric | Value |
|--------|-------|
| Total Tests | 13 |
| Passed | 13 |
| Failed | 0 |
| Success Rate | 100% |
| Duration | 5.06s |

### ✅ All tests passed!

[View full report](https://github.com/owner/repo/actions/runs/123456)
```

### Email Notifications

GitHub Actions sends email notifications for:
- Workflow failures
- First failure after success
- Success after failure

**Configure:**
1. Go to GitHub Settings → Notifications
2. Adjust "Actions" notification preferences

### Slack Integration (Optional)

Add to workflow file:

```yaml
- name: 📢 Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "🚨 UBF Tests Failed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Tests failed on `${{ github.ref }}`*\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Results>"
            }
          }
        ]
      }
```

Add `SLACK_WEBHOOK_URL` to repository secrets.

---

## 🔍 Troubleshooting

### Common Issues

#### Issue: "Database connection failed"

**Symptoms:**
```
Error: Connection refused at localhost:5432
```

**Solutions:**
1. Verify `TEST_DATABASE_URL` secret is set correctly
2. Ensure database server is accessible from GitHub Actions runners
3. Use a cloud-hosted test database (e.g., Railway, Supabase)
4. Check database credentials are correct

**Alternative:** Use SQLite for tests:
```bash
DATABASE_URL="file:./test.db"
```

---

#### Issue: "Playwright browser not found"

**Symptoms:**
```
Error: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium-1097/chrome-linux/chrome
```

**Solutions:**
1. Ensure workflow includes: `npx playwright install --with-deps chromium`
2. Update Playwright version: `npm install -D @playwright/test@latest`
3. Clear GitHub Actions cache

---

#### Issue: "Tests timeout"

**Symptoms:**
```
Test exceeded timeout of 60000ms
```

**Solutions:**
1. Increase `wait-on` timeout in workflow:
   ```bash
   npx wait-on http://localhost:3001 --timeout 120000
   ```
2. Optimize application startup time
3. Increase test timeouts in test modules
4. Use `npm run build && npm run start` instead of `npm run dev`

---

#### Issue: "Secret not found"

**Symptoms:**
```
Error: Secret NEXTAUTH_SECRET not found
```

**Solutions:**
1. Verify secret name matches exactly (case-sensitive)
2. Re-add the secret in GitHub Settings
3. Check secret is added at repository level (not organization)
4. Wait 1-2 minutes after adding secret (GitHub caches)

---

#### Issue: "Application not starting"

**Symptoms:**
```
wait-on: Timeout waiting for http://localhost:3001
```

**Solutions:**
1. Check build errors in workflow logs
2. Verify `PORT=3001` in environment
3. Use `next start -p 3001` explicitly:
   ```bash
   npm run build
   npx next start -p 3001 &
   ```
4. Add debug output:
   ```bash
   npm run build
   npm run start &
   echo "Waiting for server..."
   sleep 10
   curl http://localhost:3001 || echo "Server not responding"
   ```

---

#### Issue: "Tests pass locally but fail in CI"

**Symptoms:**
Tests work on local machine but fail in GitHub Actions

**Solutions:**
1. Check environment differences (Node version, OS)
2. Verify all dependencies are in `package.json` (not global)
3. Use `npm ci` instead of `npm install` locally to match CI
4. Check for hardcoded paths or localhost references
5. Review timing issues (add waits where needed)

---

### Debug Mode

Enable verbose logging in workflow:

```yaml
- name: 🧪 Run tests (Debug Mode)
  run: npm run bot:test:critical -- --baseUrl=${{ env.BASE_URL }} --headless --debug
  env:
    DEBUG: "pw:api"  # Playwright debug
    VERBOSE: "true"   # UBF verbose mode
```

---

## 🚀 Advanced Configuration

### Custom Test Matrix

Run tests across multiple configurations:

```yaml
strategy:
  matrix:
    node-version: [18, 20]
    os: [ubuntu-latest, windows-latest]
    suite: [health, marketplace]
```

### Conditional Test Execution

Run specific tests based on changed files:

```yaml
- name: 🔍 Check changed files
  uses: dorny/paths-filter@v2
  id: filter
  with:
    filters: |
      marketplace:
        - 'src/app/(customer)/products/**'
        - 'src/app/(customer)/marketplace/**'
      cart:
        - 'src/app/(customer)/cart/**'
        - 'src/components/features/cart/**'

- name: 🧪 Run marketplace tests
  if: steps.filter.outputs.marketplace == 'true'
  run: npm run bot:test:marketplace
```

### Parallel Test Execution

Speed up tests by running in parallel:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
  max-parallel: 4

steps:
  - name: 🧪 Run tests (Shard ${{ matrix.shard }}/4)
    run: npm run bot:test:all -- --shard=${{ matrix.shard }}/4
```

### Test Data Management

Seed different data for different test suites:

```yaml
- name: 🗄️ Seed test data
  run: |
    if [ "${{ matrix.suite }}" == "marketplace" ]; then
      npm run db:seed:products
    elif [ "${{ matrix.suite }}" == "auth" ]; then
      npm run db:seed:users
    else
      npm run db:seed
    fi
```

### Performance Benchmarking

Track test performance over time:

```yaml
- name: 📊 Benchmark performance
  run: |
    DURATION=$(jq '.summary.totalDuration' reports/latest.json)
    echo "test_duration_ms{suite=\"critical\"} $DURATION" >> metrics.txt

- name: 📈 Upload metrics
  uses: actions/upload-artifact@v4
  with:
    name: performance-metrics
    path: metrics.txt
```

### Status Badges

Add test status badges to README:

```markdown
[![UBF Tests](https://github.com/owner/repo/actions/workflows/ubf-tests.yml/badge.svg)](https://github.com/owner/repo/actions/workflows/ubf-tests.yml)
```

---

## 📝 Best Practices

### 1. Keep Tests Fast
- Critical tests should complete in < 5 minutes
- Use test database with minimal seed data
- Run full suite on schedule, not on every push

### 2. Handle Flaky Tests
- Add retries (UBF supports 2 retries by default)
- Use proper waits instead of hard sleeps
- Isolate tests (don't depend on previous test state)

### 3. Secure Secrets
- Never commit secrets to repository
- Use GitHub secrets for all sensitive data
- Rotate secrets regularly
- Use minimal permissions

### 4. Monitor Test Health
- Review failed tests immediately
- Track test duration trends
- Update tests when application changes
- Keep dependencies updated

### 5. Documentation
- Document test failures and resolutions
- Update this guide when adding new tests
- Comment complex test logic
- Keep test data realistic but minimal

---

## 📚 Additional Resources

### UBF Documentation
- [UBF Status Report](./testing/UBF_STATUS_2026-01-08.md)
- [Session Completion](./testing/SESSION_COMPLETE_2026-01-08.md)
- [Test Modules](../src/lib/testing/modules/)

### GitHub Actions
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### Playwright
- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD Guide](https://playwright.dev/docs/ci)

---

## 🎯 Quick Start Checklist

- [ ] Add `TEST_DATABASE_URL` secret
- [ ] Add `NEXTAUTH_SECRET` secret
- [ ] Add `NEXTAUTH_URL` secret
- [ ] Verify workflow file is in `.github/workflows/`
- [ ] Test locally with `npm run bot:test:critical`
- [ ] Enable GitHub Actions (if disabled)
- [ ] Make a test commit to trigger workflow
- [ ] Review first workflow run results
- [ ] Add status badge to README (optional)
- [ ] Configure notifications (optional)

---

## 🆘 Support

**Issues with CI/CD:**
- Check [Troubleshooting](#troubleshooting) section
- Review workflow logs in GitHub Actions
- Test locally to isolate CI-specific issues

**Issues with Tests:**
- Review test reports in `reports/` directory
- Check screenshots (if tests failed)
- Run tests with `--debug` flag locally

**Need Help?**
- Create an issue in the repository
- Contact the development team
- Review UBF documentation

---

**Last Updated:** January 8, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready

*This guide is maintained as part of the Farmers Market Platform documentation.*
