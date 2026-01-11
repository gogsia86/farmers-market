# 🚀 CI/CD Setup Guide for UBF Tests

> **Phase 4.2: CI/CD Integration**
> Complete guide for setting up continuous integration and deployment for the Unified Bot Framework

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [GitHub Actions Setup](#github-actions-setup)
- [Secrets Configuration](#secrets-configuration)
- [Workflow Activation](#workflow-activation)
- [Validation Steps](#validation-steps)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The UBF CI/CD pipeline provides:

- **Automated Testing**: Run tests on every push, PR, and scheduled intervals
- **Matrix Testing**: Parallel execution of test suites
- **Artifact Management**: Store reports and screenshots
- **PR Integration**: Automated comments with test results
- **Notification System**: Alerts for failures
- **Manual Triggers**: On-demand test execution

### Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions Trigger                   │
│  (Push / PR / Schedule / Manual Dispatch)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
  ┌─────────┐  ┌─────────┐  ┌──────────┐
  │Critical │  │ Matrix  │  │  Manual  │
  │  Tests  │  │  Tests  │  │   Tests  │
  └────┬────┘  └────┬────┘  └────┬─────┘
       │            │            │
       └────────────┼────────────┘
                    │
          ┌─────────┴─────────┐
          │  Upload Artifacts │
          │  - Reports        │
          │  - Screenshots    │
          └─────────┬─────────┘
                    │
          ┌─────────┴─────────┐
          │  PR Comment       │
          │  - Results        │
          │  - Metrics        │
          └───────────────────┘
```

---

## 📦 Prerequisites

### 1. Repository Requirements

- GitHub repository with Actions enabled
- Next.js application running on port 3000
- PostgreSQL database for testing
- Node.js 18+ environment

### 2. Local Tools

```bash
# Verify Node.js version
node --version  # Should be >= 18.0.0

# Verify npm version
npm --version   # Should be >= 10.0.0

# Verify Playwright
npx playwright --version
```

### 3. Database Setup

You'll need a test database instance. Options:

**Option A: Cloud Database (Recommended)**

```bash
# Use a cloud provider (e.g., Supabase, Railway, Neon)
# Create a dedicated test database
# Copy connection string
```

**Option B: Local Docker Database**

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name ubf-test-db \
  -e POSTGRES_PASSWORD=testpassword \
  -e POSTGRES_DB=farmers_market_test \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option C: GitHub Actions Service Container**

```yaml
# Add to workflow (already configured in ubf-tests.yml)
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: farmers_market_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

---

## 🔐 Secrets Configuration

### Required Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions**

#### 1. Database Secrets

**`TEST_DATABASE_URL`**

```
postgresql://username:password@host:5432/database_name?schema=public
```

Example formats:

```bash
# Cloud provider (Supabase)
postgresql://postgres:password@db.xxxxxxxxxxxx.supabase.co:5432/postgres

# Cloud provider (Railway)
postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway

# Cloud provider (Neon)
postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/dbname

# Local Docker (for testing workflow locally)
postgresql://postgres:testpassword@localhost:5432/farmers_market_test
```

#### 2. Authentication Secrets

**`NEXTAUTH_SECRET`**

```bash
# Generate a secure random string
openssl rand -base64 32
```

Example:

```
dGhpc2lzYXZlcnlzZWN1cmVzZWNyZXRrZXlmb3JuZXh0YXV0aA==
```

**`NEXTAUTH_URL`**

```
http://localhost:3000
```

#### 3. Optional Secrets (if using external services)

**`GOOGLE_CLIENT_ID`** (for OAuth tests)

```
1234567890-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

**`GOOGLE_CLIENT_SECRET`**

```
GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

**`SMTP_HOST`** (for email tests)

```
smtp.gmail.com
```

**`SMTP_PORT`**

```
587
```

**`SMTP_USER`**

```
test@example.com
```

**`SMTP_PASSWORD`**

```
app-specific-password
```

**`STRIPE_SECRET_KEY`** (for payment tests)

```
sk_test_xxxxxxxxxxxxxxxxxxxx
```

### Adding Secrets via GitHub UI

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - **Name**: `TEST_DATABASE_URL`
   - **Value**: Your database connection string
   - Click **Add secret**
6. Repeat for all required secrets

### Adding Secrets via GitHub CLI

```bash
# Install GitHub CLI
# https://cli.github.com/

# Authenticate
gh auth login

# Add secrets
gh secret set TEST_DATABASE_URL --body "postgresql://..."
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set NEXTAUTH_URL --body "http://localhost:3000"

# Verify secrets
gh secret list
```

### Environment Variables in Workflow

The workflow automatically provides these variables:

```yaml
env:
  NODE_VERSION: "18"
  BASE_URL: "http://localhost:3000"
  HEADLESS: "true"
  NODE_ENV: "test"
```

---

## 🏗️ Workflow Activation

### Step 1: Verify Workflow File

Ensure the workflow file exists:

```bash
# Check if workflow exists
ls -la .github/workflows/ubf-tests.yml
```

### Step 2: Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under **Actions permissions**, select:
   - ✅ **Allow all actions and reusable workflows**
3. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

### Step 3: Test Workflow Manually

Trigger a manual test run:

1. Go to **Actions** tab
2. Select **🤖 UBF Tests** workflow
3. Click **Run workflow**
4. Select options:
   - **Branch**: `main` or `develop`
   - **Test suite**: `critical`
   - **Configuration preset**: `ci`
5. Click **Run workflow**

### Step 4: Monitor First Run

Watch the workflow execution:

```bash
# View workflow runs via CLI
gh run list --workflow=ubf-tests.yml

# View specific run
gh run view <run-id> --log

# Watch live
gh run watch
```

### Step 5: Verify Outputs

Check for successful completion:

- ✅ All jobs complete successfully
- ✅ Test reports uploaded as artifacts
- ✅ No red X marks in workflow run
- ✅ Duration is reasonable (typically 5-15 minutes)

---

## 🧪 Validation Steps

### Phase 1: Local Pre-Flight Check

Before pushing to CI, validate locally:

```bash
# 1. Install dependencies
npm ci

# 2. Install Playwright browsers
npx playwright install --with-deps chromium

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma db push

# 5. Seed test data
npm run seed

# 6. Start application
npm run build
npm run start &

# 7. Wait for app to start
npx wait-on http://localhost:3000 --timeout 60000

# 8. Run critical tests
npm run bot:test:critical -- --preset=ci

# 9. Check results
cat reports/latest.json | jq '.summary'

# 10. Stop application
pkill -f "next start"
```

### Phase 2: CI Smoke Test

Push a small change to trigger CI:

```bash
# Create test branch
git checkout -b test/ci-validation

# Make trivial change
echo "# CI Test" >> docs/testing/CI_TEST.md
git add docs/testing/CI_TEST.md
git commit -m "test: CI validation smoke test"

# Push to remote
git push origin test/ci-validation

# Open PR
gh pr create --title "Test: CI Validation" --body "Testing CI/CD pipeline"

# Watch workflow
gh run watch
```

### Phase 3: Full Suite Validation

Run all test suites:

```bash
# Trigger via workflow dispatch
gh workflow run ubf-tests.yml \
  --field suite=full \
  --field preset=ci

# Monitor
gh run watch
```

### Phase 4: Scheduled Run Validation

Wait for scheduled run (2 AM UTC daily) or manually trigger:

```bash
# Check cron schedule
cat .github/workflows/ubf-tests.yml | grep -A 2 "schedule:"

# View scheduled runs
gh run list --workflow=ubf-tests.yml --event=schedule
```

---

## 📊 Monitoring & Maintenance

### Dashboard Views

#### 1. Workflow Overview

```bash
# View recent runs
gh run list --workflow=ubf-tests.yml --limit 10

# View run details
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

#### 2. Success Metrics

Track these KPIs:

| Metric             | Target   | Alert Threshold |
| ------------------ | -------- | --------------- |
| Success Rate       | ≥ 95%    | < 90%           |
| Duration           | < 15 min | > 20 min        |
| Critical Pass Rate | 100%     | < 100%          |
| Flaky Test Rate    | < 5%     | > 10%           |

#### 3. Report Analysis

```bash
# Download latest report
gh run download --name critical-reports

# Parse JSON report
cat reports/latest.json | jq '
  {
    total: .summary.total,
    passed: .summary.passed,
    failed: .summary.failed,
    success_rate: .summary.successRate,
    duration_seconds: (.summary.totalDuration / 1000)
  }
'

# Extract failed tests
cat reports/latest.json | jq -r '
  .results[]
  | select(.status == "failed")
  | "\(.moduleName): \(.error)"
'
```

### Maintenance Tasks

#### Weekly Tasks

1. **Review Failed Tests**

   ```bash
   # Get failure summary from last 7 days
   gh run list \
     --workflow=ubf-tests.yml \
     --created=">$(date -d '7 days ago' +%Y-%m-%d)" \
     --json conclusion,name,createdAt \
     --jq '.[] | select(.conclusion == "failure")'
   ```

2. **Check Artifact Storage**

   ```bash
   # List artifacts
   gh api repos/:owner/:repo/actions/artifacts | jq '
     .artifacts[] |
     {
       name: .name,
       size_mb: (.size_in_bytes / 1048576 | round),
       created_at: .created_at,
       expired: .expired
     }
   '
   ```

3. **Update Dependencies**

   ```bash
   # Check for Playwright updates
   npm outdated @playwright/test

   # Update if needed
   npm update @playwright/test
   npx playwright install
   ```

#### Monthly Tasks

1. **Review Test Coverage**

   ```bash
   # Run coverage report
   npm run bot:test:all -- --coverage

   # Analyze gaps
   cat reports/coverage.json
   ```

2. **Optimize Workflow**
   - Review job durations
   - Identify bottlenecks
   - Consider parallel execution improvements

3. **Clean Up Old Artifacts**
   ```bash
   # The workflow includes automatic cleanup of artifacts > 30 days
   # Verify cleanup job is running
   gh run list --workflow=ubf-tests.yml --job=cleanup
   ```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: Workflow Not Triggering

**Symptoms:**

- Push/PR doesn't start workflow
- Scheduled runs not executing

**Solutions:**

```bash
# Check workflow syntax
yamllint .github/workflows/ubf-tests.yml

# Verify branch protection rules
gh api repos/:owner/:repo/branches/main/protection | jq '.required_status_checks'

# Check if Actions are enabled
gh api repos/:owner/:repo | jq '.has_actions'

# Manual trigger
gh workflow run ubf-tests.yml
```

#### Issue 2: Database Connection Failures

**Symptoms:**

```
Error: P1001: Can't reach database server
```

**Solutions:**

1. Verify secret is set:

   ```bash
   gh secret list | grep TEST_DATABASE_URL
   ```

2. Test connection locally:

   ```bash
   psql "$TEST_DATABASE_URL" -c "SELECT 1;"
   ```

3. Check firewall rules (if using cloud DB):
   - Add GitHub Actions IP ranges
   - Or use connection pooler

4. Use service container (recommended):
   ```yaml
   services:
     postgres:
       image: postgres:16
       env:
         POSTGRES_PASSWORD: testpassword
         POSTGRES_DB: farmers_market_test
   ```

#### Issue 3: Application Won't Start

**Symptoms:**

```
Error: EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. Add port check:

   ```yaml
   - name: Check port availability
     run: |
       if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
         echo "Port 3000 is in use"
         lsof -i :3000
         exit 1
       fi
   ```

2. Use dynamic port:
   ```yaml
   - name: Start application
     run: |
       PORT=$(shuf -i 3000-4000 -n 1)
       npm run start -- -p $PORT &
       echo "BASE_URL=http://localhost:$PORT" >> $GITHUB_ENV
   ```

#### Issue 4: Tests Timing Out

**Symptoms:**

```
Error: Test exceeded timeout of 30000ms
```

**Solutions:**

1. Increase timeout in preset:

   ```typescript
   // src/lib/testing/presets/ci.preset.ts
   export const ciPreset: TestPreset = {
     timeout: 60000, // Increase from 30000
     retries: 2,
   };
   ```

2. Add wait-on with longer timeout:

   ```yaml
   - name: Wait for app
     run: npx wait-on http://localhost:3000 --timeout 120000
   ```

3. Use healthcheck:
   ```yaml
   - name: Health check
     run: |
       for i in {1..30}; do
         if curl -f http://localhost:3000/api/health; then
           echo "App is ready"
           exit 0
         fi
         echo "Waiting for app..."
         sleep 2
       done
       echo "App failed to start"
       exit 1
   ```

#### Issue 5: Playwright Browser Installation Fails

**Symptoms:**

```
Error: browserType.launch: Executable doesn't exist
```

**Solutions:**

```yaml
# Use official action
- name: Install Playwright browsers
  uses: microsoft/playwright-github-action@v1

# Or install with system dependencies
- name: Install Playwright
  run: npx playwright install --with-deps chromium

# Or use Docker image with pre-installed browsers
- name: Run tests
  uses: docker://mcr.microsoft.com/playwright:v1.40.0-focal
  with:
    args: npm run bot:test:critical
```

#### Issue 6: Out of Memory

**Symptoms:**

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions:**

```yaml
- name: Run tests
  run: npm run bot:test:all
  env:
    NODE_OPTIONS: "--max-old-space-size=4096"
```

#### Issue 7: Flaky Tests

**Symptoms:**

- Tests pass/fail inconsistently
- Different results on re-run

**Solutions:**

1. Enable retries:

   ```typescript
   // In test configuration
   {
     retries: 2,
     timeout: 30000
   }
   ```

2. Add wait strategies:

   ```typescript
   // Wait for element to be stable
   await page.waitForSelector("button", {
     state: "visible",
     timeout: 10000,
   });
   await page.waitForTimeout(500); // Stability delay
   ```

3. Use proper assertions:
   ```typescript
   // Instead of page.locator().click()
   await expect(page.locator("button")).toBeVisible();
   await page.locator("button").click();
   ```

### Debug Mode

Enable detailed logging:

```yaml
- name: Run tests with debug
  run: npm run bot:test:critical -- --preset=ci --verbose
  env:
    DEBUG: "pw:api,pw:browser"
    PWDEBUG: "1"
```

### Getting Help

1. **Check Logs**

   ```bash
   gh run view <run-id> --log
   ```

2. **Download Artifacts**

   ```bash
   gh run download <run-id>
   ls -la screenshots/  # Check failure screenshots
   cat reports/latest.json | jq '.results[] | select(.status == "failed")'
   ```

3. **Review PR Comments**
   - Check automated comment for test results
   - Look for error messages and stack traces

4. **Slack/Team Chat**
   - Post in #ci-cd channel
   - Include run ID and error logs

---

## 📈 Advanced Configuration

### Parallel Execution

Run tests faster with parallel jobs:

```yaml
matrix:
  suite: [health, marketplace, checkout, auth]
  shard: [1, 2, 3, 4]

steps:
  - name: Run tests
    run: npm run bot test ${{ matrix.suite }} -- --shard=${{ matrix.shard }}/4
```

### Custom Reporters

Add custom reporting:

```typescript
// src/lib/testing/reporters/custom-reporter.ts
export class CustomReporter implements Reporter {
  onTestComplete(result: TestResult) {
    // Send to external service
    fetch("https://metrics.example.com/tests", {
      method: "POST",
      body: JSON.stringify(result),
    });
  }
}
```

### Performance Monitoring

Track performance metrics:

```yaml
- name: Performance check
  run: |
    npm run bot:test:all -- --preset=ci --performance

    # Extract metrics
    cat reports/performance.json | jq '{
      avg_duration: (.tests | map(.duration) | add / length),
      p95_duration: (.tests | map(.duration) | sort | .[(.tests | length * 0.95 | floor)]),
      slowest: (.tests | sort_by(.duration) | reverse | .[0:5])
    }'
```

### Notification Integrations

#### Slack Notifications

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "UBF Tests failed! Check the run for details."
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Email Notifications

```yaml
- name: Send email report
  if: always()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.MAIL_USERNAME }}
    password: ${{ secrets.MAIL_PASSWORD }}
    subject: UBF Test Report - ${{ github.ref }}
    body: file://reports/latest.md
    to: team@example.com
    from: CI/CD Bot
    attachments: reports/latest.json
```

---

## 🎯 Success Criteria

Your CI/CD is successfully set up when:

- ✅ Workflow triggers on push/PR/schedule
- ✅ All critical tests pass consistently
- ✅ Reports and screenshots are uploaded
- ✅ PR comments show test results
- ✅ Failures trigger notifications
- ✅ Workflow completes in < 15 minutes
- ✅ No flaky tests (< 5% variance)
- ✅ Artifacts are automatically cleaned up

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Next.js Testing Best Practices](https://nextjs.org/docs/testing)
- [UBF CLI Guide](./CLI_GUIDE.md)
- [UBF Validation Guide](./VALIDATION_GUIDE.md)

---

## 🔄 Version History

| Version | Date       | Changes                   |
| ------- | ---------- | ------------------------- |
| 1.0.0   | 2025-01-XX | Initial CI/CD setup guide |

---

**Next Steps:**

1. ✅ Configure secrets in GitHub
2. ✅ Enable GitHub Actions
3. ✅ Run manual test workflow
4. ✅ Verify first run succeeds
5. → Move to [Phase 4.3: Team Training](./TEAM_TRAINING.md)
