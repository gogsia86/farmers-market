# ✅ Phase 4.2: CI/CD Integration Checklist

> **Quick-Start Guide for Enabling GitHub Actions Workflow**
> Complete this checklist to activate automated testing in your CI/CD pipeline.

---

## 📋 Pre-Flight Checklist

### Step 1: Validate Local Environment ⏱️ 5 minutes

Run the automated validation script:

```bash
npm run validate:ci
```

**Expected Output:** All checks should pass (✅) or show warnings (⚠️). Fix any failures (❌) before proceeding.

**Quick Fixes:**
```bash
# Auto-fix common issues
npm run validate:ci:fix

# Install Playwright browsers if needed
npx playwright install --with-deps chromium

# Generate Prisma client if needed
npx prisma generate
```

---

### Step 2: Configure GitHub Secrets ⏱️ 10 minutes

#### Required Secrets (MUST CONFIGURE)

Navigate to: **Your Repository → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `TEST_DATABASE_URL` | `postgresql://user:pass@host:5432/db` | See [Database Setup](#database-setup) below |
| `NEXTAUTH_SECRET` | Random 32-byte string | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` | Use localhost for CI |

#### Quick Setup via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Add required secrets
gh secret set TEST_DATABASE_URL --body "postgresql://..."
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set NEXTAUTH_URL --body "http://localhost:3000"

# Verify
gh secret list
```

#### Database Setup

**Option A: Use Cloud Database (Recommended)**

1. Sign up for a free database:
   - [Supabase](https://supabase.com/) (Free tier: 500MB)
   - [Railway](https://railway.app/) (Free trial: $5 credit)
   - [Neon](https://neon.tech/) (Free tier: 1GB)

2. Create a new database project
3. Copy the connection string
4. Set as `TEST_DATABASE_URL` secret

**Option B: Use GitHub Actions Service Container (Alternative)**

If you prefer not to use a cloud database, the workflow already includes a PostgreSQL service container. You'll need to update the workflow to use it instead of an external database.

---

### Step 3: Enable GitHub Actions ⏱️ 2 minutes

1. Go to **Repository Settings**
2. Navigate to **Actions → General**
3. Under **Actions permissions**, select:
   - ✅ **Allow all actions and reusable workflows**
4. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

---

### Step 4: Test Workflow Manually ⏱️ 15 minutes

Trigger your first test run:

#### Via GitHub UI:

1. Go to **Actions** tab in your repository
2. Select **🤖 UBF Tests** workflow
3. Click **Run workflow** button
4. Select:
   - **Branch**: `main` or `develop`
   - **Test suite**: `critical`
   - **Configuration preset**: `ci`
5. Click **Run workflow**
6. Watch the workflow execute (takes ~10-15 minutes)

#### Via GitHub CLI:

```bash
# Run critical tests
gh workflow run ubf-tests.yml \
  --field suite=critical \
  --field preset=ci

# Watch execution
gh run watch

# View results
gh run list --workflow=ubf-tests.yml --limit 5
```

---

### Step 5: Verify First Run ⏱️ 5 minutes

Check that everything works:

- ✅ Workflow completes successfully (green checkmark)
- ✅ All jobs pass (critical-tests, etc.)
- ✅ Artifacts are uploaded (reports, screenshots if any failures)
- ✅ Duration is reasonable (10-20 minutes)

**If the workflow fails:**

1. Click on the failed job
2. View the error logs
3. Check the [Troubleshooting Guide](./CI_CD_SETUP_GUIDE.md#troubleshooting)
4. Common issues:
   - Database connection failed → Verify `TEST_DATABASE_URL` secret
   - Application won't start → Check `NEXTAUTH_SECRET` is set
   - Tests timeout → May need to increase timeout values
   - Playwright installation fails → Check browser installation step

---

### Step 6: Enable Automatic Triggers ⏱️ 1 minute

The workflow is already configured to run on:

- ✅ **Push to `main` or `develop`** → Critical tests only
- ✅ **Pull requests** → Critical tests + PR comment with results
- ✅ **Daily at 2 AM UTC** → Full test suite
- ✅ **Manual dispatch** → Any suite, any time

**Verify triggers:**

```bash
# Push a small change to test push trigger
git checkout -b test/ci-activation
echo "# CI Test" >> .github/CI_TEST.md
git add .github/CI_TEST.md
git commit -m "test: activate CI/CD pipeline"
git push origin test/ci-activation

# Create PR to test PR trigger
gh pr create --title "Test: CI Activation" --body "Testing CI/CD pipeline"

# Watch workflow
gh run watch
```

---

## 🎯 Success Criteria

Your CI/CD is successfully activated when:

- ✅ Manual workflow run completes successfully
- ✅ Push to branch triggers workflow automatically
- ✅ PR shows automated test results in comments
- ✅ Test reports are uploaded as artifacts
- ✅ Failed tests show screenshots (if any)
- ✅ Workflow duration is acceptable (<20 minutes)

---

## 📊 Monitoring Dashboard

### View Recent Runs

```bash
# List recent workflow runs
gh run list --workflow=ubf-tests.yml --limit 10

# View specific run details
gh run view <run-id>

# Download artifacts from a run
gh run download <run-id>
```

### Check Success Rate

```bash
# View last 20 runs with status
gh run list --workflow=ubf-tests.yml --limit 20 --json conclusion,name,createdAt

# Count successes
gh run list --workflow=ubf-tests.yml --limit 20 --json conclusion \
  | jq '[.[] | select(.conclusion == "success")] | length'
```

### View Test Reports

```bash
# Download latest reports
gh run download --name critical-reports

# Parse JSON report
cat reports/latest.json | jq '.summary'

# Extract failed tests
cat reports/latest.json | jq -r '
  .results[]
  | select(.status == "failed")
  | "\(.moduleName): \(.error)"
'
```

---

## 🔧 Maintenance Tasks

### Daily (Automated)

- ✅ Scheduled full test suite runs at 2 AM UTC
- ✅ Automatic artifact cleanup (>30 days old)

### Weekly (Manual)

```bash
# Review failed tests from last 7 days
gh run list \
  --workflow=ubf-tests.yml \
  --created=">$(date -d '7 days ago' +%Y-%m-%d)" \
  --json conclusion,name,createdAt \
  --jq '.[] | select(.conclusion == "failure")'

# Check artifact storage usage
gh api repos/:owner/:repo/actions/artifacts \
  | jq '.total_count, .artifacts | map(.size_in_bytes) | add / 1048576'
```

### Monthly (Manual)

- Review and update test coverage
- Optimize workflow performance
- Update dependencies (Playwright, Next.js, etc.)
- Review and address flaky tests

---

## 🚨 Troubleshooting Quick Reference

### Issue: Workflow Not Triggering

**Solution:**
```bash
# Check workflow syntax
yamllint .github/workflows/ubf-tests.yml

# Verify Actions are enabled
gh api repos/:owner/:repo | jq '.has_actions'

# Manual trigger
gh workflow run ubf-tests.yml
```

### Issue: Database Connection Failed

**Error:** `P1001: Can't reach database server`

**Solution:**
```bash
# Verify secret exists
gh secret list | grep TEST_DATABASE_URL

# Test connection locally
psql "$TEST_DATABASE_URL" -c "SELECT 1;"

# Check firewall rules on cloud database
# Add GitHub Actions IP ranges if needed
```

### Issue: Application Won't Start

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Check if port 3000 is properly freed in workflow. The workflow should handle this, but you can add a cleanup step if needed.

### Issue: Tests Timing Out

**Error:** `Test exceeded timeout of 30000ms`

**Solution:**
```bash
# Increase timeout in CI preset
# Edit: src/lib/testing/presets/ci.preset.ts
# Change: timeout: 60000 (from 30000)
```

### Issue: Playwright Browsers Not Found

**Error:** `browserType.launch: Executable doesn't exist`

**Solution:** The workflow should install browsers automatically. Check the "Install Playwright browsers" step in the workflow logs.

---

## 📚 Additional Resources

- [Full CI/CD Setup Guide](./CI_CD_SETUP_GUIDE.md) - Comprehensive documentation
- [CLI Guide](./CLI_GUIDE.md) - CLI usage and commands
- [Validation Guide](./VALIDATION_GUIDE.md) - Parity validation methodology
- [GitHub Actions Docs](https://docs.github.com/en/actions) - Official GitHub Actions documentation
- [Playwright CI Guide](https://playwright.dev/docs/ci) - Playwright CI best practices

---

## ✅ Completion Checklist

Mark each item as you complete it:

- [ ] Step 1: Local environment validated (`npm run validate:ci` passes)
- [ ] Step 2: GitHub secrets configured (at minimum: TEST_DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
- [ ] Step 3: GitHub Actions enabled in repository settings
- [ ] Step 4: First manual workflow run successful
- [ ] Step 5: Test results verified (reports downloaded, checked)
- [ ] Step 6: Automatic triggers tested (push/PR workflow runs)
- [ ] Team notified about CI/CD activation
- [ ] Documentation shared with team
- [ ] Monitoring dashboard bookmarked

---

## 🎉 Next Steps

Once Phase 4.2 is complete:

1. **Phase 4.3: Team Training** → Schedule demo session for team
2. **Phase 4.4: Validation Results** → Run full parity validation
3. **Phase 5: Farmer Module Migration** → Continue migrating remaining modules
4. **Phase 6: Admin Module Migration** → Migrate admin workflows

---

## 📞 Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](./CI_CD_SETUP_GUIDE.md#troubleshooting)
2. Review workflow logs: `gh run view <run-id> --log`
3. Download and inspect artifacts: `gh run download <run-id>`
4. Check screenshots for failed tests in `screenshots/` directory
5. Review test reports in `reports/latest.json`

---

**Estimated Total Time: ~40 minutes**

**Status:** Ready to activate! 🚀

---

*Last Updated: Phase 4.2 - CI/CD Integration*
*Version: 1.0.0*
