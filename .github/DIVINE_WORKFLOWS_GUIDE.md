# 🌟 DIVINE CI/CD WORKFLOWS

**Ultimate GOD-Tier GitHub Actions Automation**

Version: **Ultimate_1.0** | Reality: **Multi-Dimensional** | Automation: **MAXIMUM**

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Workflow Files](#workflow-files)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Visual Testing](#visual-testing)
5. [Performance Testing](#performance-testing)
6. [Divine Progress Automation](#divine-progress-automation)
7. [Secrets Management](#secrets-management)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 OVERVIEW

This repository uses **4 automated GitHub Actions workflows** for continuous integration, deployment, visual regression testing, performance monitoring, and progress tracking.

### Workflow Summary

| Workflow                                                      | Purpose              | Trigger                | Duration  | Critical  |
| ------------------------------------------------------------- | -------------------- | ---------------------- | --------- | --------- |
| **[ci.yml](#cicd-pipeline)**                                  | Build, test, deploy  | Push/PR                | ~5-10 min | 🔴 YES    |
| **[chromatic.yml](#visual-testing)**                          | Visual regression    | PR (component changes) | ~5 min    | 🟠 MEDIUM |
| **[performance-tests.yml](#performance-testing)**             | k6 load testing      | Push to main, manual   | ~3-5 min  | 🟠 MEDIUM |
| **[update-divine-progress.yml](#divine-progress-automation)** | Auto-update progress | Every 4 hours, manual  | <1 min    | 🟢 LOW    |

### Quick Links

- **[06 | Automation Infrastructure](./instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md)** - Divine CI/CD patterns
- **[05 | Testing Security Divinity](./instructions/05_TESTING_SECURITY_DIVINITY.instructions.md)** - Automated testing
- **[03 | Performance Reality Bending](./instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md)** - Performance optimization

---

## 🔄 WORKFLOW FILES

### Current Structure

```
.github/workflows/
├── ci.yml                      # 🔴 CRITICAL - Main CI/CD pipeline
├── chromatic.yml               # 🟠 Visual regression testing
├── performance-tests.yml       # 🟠 k6 performance tests
└── update-divine-progress.yml  # 🟢 Progress tracking automation
```

---

## 🚀 CI/CD PIPELINE

**File**: `ci.yml`

### Purpose

Complete continuous integration and deployment pipeline with:

- **Build validation** (TypeScript compilation, linting)
- **Test execution** (unit, integration, E2E)
- **Production deployment** (main branch only)
- **SSL certificate configuration**
- **Environment-specific builds**

### Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**When it runs**:

- Every push to `main` or `develop` branches
- Every pull request targeting `main` or `develop`

### Jobs Overview

#### 1. **Build Job** (Runs on all branches)

```yaml
build:
  runs-on: ubuntu-latest
  steps:
    - Checkout code
    - Setup Node.js 20 with npm cache
    - Install dependencies (npm ci)
    - Run linting (ESLint)
    - Run tests (Jest/Vitest)
    - Build project (Next.js production build)
```

**Success Criteria**:

- ✅ Zero lint errors
- ✅ All tests pass (2,000/2,000)
- ✅ Build completes without errors

#### 2. **Deploy Job** (Main branch only)

```yaml
deploy:
  needs: build
  if: github.ref == 'refs/heads/main'
  environment: production
  steps:
    - Checkout code
    - Setup Node.js 20
    - Install dependencies
    - Build with production secrets
    - Configure SSL certificates
    - Deploy to production
```

**Production Secrets Required**:

- `PROD_DATABASE_URL` - PostgreSQL connection string
- `PROD_NEXTAUTH_URL` - Authentication callback URL
- `PROD_NEXTAUTH_SECRET` - NextAuth session secret
- `PROD_REDIS_URL` - Redis cache connection
- `PROD_WEATHER_API_KEY` - Weather service API
- `PROD_ML_SERVICE_API_KEY` - Machine learning service
- `PROD_SENTRY_DSN` - Error tracking endpoint
- `PROD_SSL_PRIVATE_KEY` - SSL private key
- `PROD_SSL_CERTIFICATE` - SSL certificate
- `PROD_SSL_CA` - SSL certificate authority

### Optimization Opportunities

🟠 **MEDIUM PRIORITY - Consider Adding**:

1. **Dependency Caching** - Improve build speed

   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

2. **Parallel Test Execution** - Reduce test time

   ```yaml
   strategy:
     matrix:
       test-group: [unit, integration, e2e]
   ```

3. **Build Artifacts** - Share between jobs

   ```yaml
   - uses: actions/upload-artifact@v3
     with:
       name: next-build
       path: .next
   ```

4. **Deployment Strategy** - Zero-downtime
   - Consider: Blue-green deployment
   - Consider: Canary releases
   - Consider: Rollback automation

**Reference**: [06 Automation Infrastructure - CI/CD Divine Automation](./instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md#cicd-divine-automation)

---

## 🎨 VISUAL TESTING

**File**: `chromatic.yml`

### Purpose

Automated visual regression testing for React components using **Chromatic**:

- Detects unintended visual changes
- Side-by-side visual diffs
- Component snapshot library
- PR comments with review links

### Triggers

```yaml
on:
  pull_request:
    branches: [main, develop]
    paths:
      - "farmers-market/src/components/**/*.tsx"
      - "farmers-market/src/components/**/*.stories.tsx"
      - "farmers-market/.storybook/**"
      - "farmers-market/src/app/globals.css"
      - "farmers-market/tailwind.config.ts"
  workflow_dispatch: # Manual trigger
```

**When it runs**:

- ✅ Only when component or styling files change
- ✅ Only on pull requests (saves resources)
- ✅ Manual trigger available

### Workflow Steps

1. **Checkout** - Full git history (required for Chromatic)
2. **Setup Node.js** - With npm caching
3. **Install dependencies** - `npm ci --legacy-peer-deps`
4. **Run Chromatic** - Visual snapshot comparison
5. **Comment on PR** - Link to visual diff review

### Chromatic Configuration

```yaml
npx chromatic \
--project-token=$CHROMATIC_PROJECT_TOKEN \
--auto-accept-changes="main" \
--exit-zero-on-changes \
--only-changed
```

**Flags Explained**:

- `--auto-accept-changes="main"` - Auto-approve changes merged to main
- `--exit-zero-on-changes` - Don't fail workflow on visual changes
- `--only-changed` - Only test changed components (faster)

### PR Comment Template

The workflow automatically posts a comment on PRs with:

```markdown
## 🎨 Chromatic Visual Testing Results

Visual regression testing has been completed for this PR!

### 📊 Review Changes

🔗 [View Visual Diffs in Chromatic](<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9)

### ✅ What to do next:

1. Click the link above to view side-by-side visual comparisons
2. Review any detected changes - Red/green highlights show differences
3. Approve changes if intentional (✅ Accept button)
4. Request fixes if changes are unexpected (💬 Comment)

### 📚 Resources

- Component Usage Guide
- Team Onboarding Guide
- Live Storybook
```

### Secrets Required

- `CHROMATIC_PROJECT_TOKEN` - Chromatic project API token

### Live Resources

- **Chromatic Project**: [View Builds](<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9)
- **Live Storybook**: [Component Library](<https://68f10cd1bcfc5fb270e8f489-dhablktkwp.chromatic.com>/)

**Reference**: [05 Testing Security Divinity - E2E Test Transcendence](./instructions/05_TESTING_SECURITY_DIVINITY.instructions.md#e2e-test-transcendence)

---

## ⚡ PERFORMANCE TESTING

**File**: `performance-tests.yml`

### Purpose

Automated load and performance testing using **k6**:

- Load testing (concurrent users)
- Stress testing (breaking points)
- Performance regression detection
- Metrics collection and reporting

### Triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch: # Manual trigger
```

**When it runs**:

- ✅ Every push to `main` (production validation)
- ✅ Pull requests to `main` (pre-merge validation)
- ✅ Manual trigger available

### Workflow Steps

1. **Checkout code**
2. **Setup Node.js 20** - With npm cache
3. **Install dependencies** - `npm ci`
4. **Install k6** - Load testing tool
5. **Build TypeScript** - Compile test files
6. **Run k6 tests** - Execute performance tests
7. **Upload results** - Store metrics (14-day retention)

### k6 Installation

```bash
# Add k6 GPG key
sudo gpg --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69

# Add k6 repository
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] <https://dl.k6.io/deb> stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list

# Install k6
sudo apt-get update
sudo apt-get install k6
```

### Test Execution

```bash
k6 run dist/performance-tests/*.js
```

### Artifacts Collected

- `k6-summary.json` - Test summary with pass/fail
- `k6-metrics.json` - Detailed performance metrics

**Available for download**: 14 days retention

### Performance Targets

Based on [03 Performance Reality Bending](./instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md):

| Metric                  | Target      | Critical Threshold |
| ----------------------- | ----------- | ------------------ |
| **Response Time (p95)** | <500ms      | >1000ms            |
| **Throughput**          | >1000 req/s | <500 req/s         |
| **Error Rate**          | <0.1%       | >1%                |
| **Concurrent Users**    | 10,000+     | <1,000             |

### Optimization Opportunities

🟠 **MEDIUM PRIORITY - Consider Adding**:

1. **Performance Budgets** - Auto-fail on regression

   ```javascript
   export let options = {
     thresholds: {
       http_req_duration: ["p95<500"], // 95% of requests < 500ms
       http_req_failed: ["rate<0.01"], // Error rate < 1%
     },
   };
   ```

2. **Trend Analysis** - Track performance over time
3. **Slack/Email Notifications** - Alert on failures
4. **Grafana Dashboard** - Real-time metrics visualization

**Reference**: [03 Performance Reality Bending - Monitoring](./instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md#performance-metrics--monitoring)

---

## 📊 DIVINE PROGRESS AUTOMATION

**File**: `update-divine-progress.yml`

### Purpose

Automatically updates progress tracking documents:

- `DIVINE_TODO_MANIFEST.md` - Task status
- `PROGRESS_TRACKER.md` - Milestone tracking

### Triggers

```yaml
on:
  push:
    branches: [main]
    paths:
      - "automation/DIVINE_TODO_MANIFEST.md"
      - "automation/PROGRESS_TRACKER.md"
  schedule:
    - cron: "0 */4 * * *" # Every 4 hours
  workflow_dispatch: # Manual trigger
```

**When it runs**:

- ✅ When progress files are manually updated
- ✅ Every 4 hours (scheduled)
- ✅ Manual trigger available

### Workflow Steps

1. **Checkout code**
2. **Setup Node.js 18**
3. **Install dependencies** - `npm ci`
4. **Update manifest** - Run TypeScript automation script
5. **Commit changes** - Auto-commit with "[skip ci]" tag
6. **Push changes** - Push to current branch

### Automation Script

```bash
npx ts-node automation/updateManifest.ts
```

This script:

- Analyzes TODO items
- Calculates completion percentages
- Updates progress bars
- Generates milestone reports

### Auto-Commit Configuration

```bash
git config --local user.email "github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"
git add automation/DIVINE_TODO_MANIFEST.md automation/PROGRESS_TRACKER.md
git commit -m "🌟 Auto-update divine progress [skip ci]"
```

**Note**: `[skip ci]` prevents infinite loop of CI runs

### Optimization Opportunities

🟢 **LOW PRIORITY - Nice to Have**:

1. **PR Creation** - Auto-create PRs instead of direct push
2. **Changelog Generation** - Auto-update CHANGELOG.md
3. **Milestone Notifications** - Slack/Discord alerts on completion
4. **Analytics Dashboard** - Visualize progress over time

---

## 🔐 SECRETS MANAGEMENT

### Required Secrets

Configure in: **GitHub Repository Settings → Secrets and variables → Actions**

#### Production Deployment Secrets

| Secret Name               | Purpose                | Example                               |
| ------------------------- | ---------------------- | ------------------------------------- |
| `PROD_DATABASE_URL`       | PostgreSQL connection  | `postgresql://user:pass@host:5432/db` |
| `PROD_NEXTAUTH_URL`       | Auth callback URL      | `<https://farmers-market.com`>          |
| `PROD_NEXTAUTH_SECRET`    | Session encryption key | `generated-random-string-32-chars`    |
| `PROD_REDIS_URL`          | Cache connection       | `redis://host:6379`                   |
| `PROD_WEATHER_API_KEY`    | Weather service        | `api-key-from-provider`               |
| `PROD_ML_SERVICE_API_KEY` | ML predictions         | `api-key-from-provider`               |
| `PROD_SENTRY_DSN`         | Error tracking         | `<https://key@sentry.io/project`>       |
| `PROD_SSL_PRIVATE_KEY`    | SSL private key        | `-----BEGIN PRIVATE KEY-----...`      |
| `PROD_SSL_CERTIFICATE`    | SSL certificate        | `-----BEGIN CERTIFICATE-----...`      |
| `PROD_SSL_CA`             | Certificate authority  | `-----BEGIN CERTIFICATE-----...`      |

#### Testing Secrets

| Secret Name               | Purpose        | Example             |
| ------------------------- | -------------- | ------------------- |
| `CHROMATIC_PROJECT_TOKEN` | Visual testing | `chpt_xxxxxxxxxxxx` |

#### Automation Secrets

| Secret Name    | Purpose        | Auto-Provided          |
| -------------- | -------------- | ---------------------- |
| `GITHUB_TOKEN` | Git operations | ✅ YES (auto-injected) |

### Secret Generation Commands

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate SSL private key
openssl genrsa -out private.key 2048

# Generate SSL certificate (self-signed for testing)
openssl req -new -x509 -key private.key -out certificate.crt -days 365
```

### Security Best Practices

✅ **DO**:

- Rotate secrets every 90 days
- Use different secrets for dev/staging/prod
- Never commit secrets to git
- Use environment-specific secret names
- Enable secret scanning on repository

❌ **DON'T**:

- Hardcode secrets in code
- Log secret values
- Share secrets via insecure channels
- Use production secrets in development

**Reference**: [05 Testing Security Divinity - Security Framework](./instructions/05_TESTING_SECURITY_DIVINITY.instructions.md#security-divinity)

---

## 🌟 BEST PRACTICES

### 1. Workflow Optimization

**Cache Dependencies** (Faster builds)

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

**Parallel Jobs** (Faster pipeline)

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
  build:
    runs-on: ubuntu-latest
```

**Conditional Execution** (Save resources)

```yaml
if: github.event_name == 'pull_request'
```

### 2. Error Handling

**Always Upload Artifacts on Failure**

```yaml
- name: Upload test results
  if: always() # Run even if tests fail
  uses: actions/upload-artifact@v3
```

**Set Appropriate Timeouts**

```yaml
timeout-minutes: 15 # Prevent hanging workflows
```

### 3. Cost Optimization

**Only Run When Needed**

```yaml
on:
  push:
    paths:
      - "src/**"
      - "package.json"
```

**Use Appropriate Runners**

- `ubuntu-latest` - Most cost-effective
- `macos-latest` - For macOS-specific needs
- `windows-latest` - For Windows-specific needs

### 4. Security

**Pin Action Versions**

```yaml
- uses: actions/checkout@v4 # ✅ Good - pinned version
- uses: actions/checkout@latest # ❌ Bad - unpredictable
```

**Limit Permissions**

```yaml
permissions:
  contents: read
  pull-requests: write
```

**Reference**: [06 Automation Infrastructure - DevOps Excellence](./instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md)

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### 1. **Build Failing on Dependencies**

**Error**: `npm ci` fails with dependency conflicts

**Solution**:

```yaml
- run: npm ci --legacy-peer-deps
```

#### 2. **Timeout on Long Tests**

**Error**: Job exceeds time limit

**Solution**: Increase timeout or split tests

```yaml
timeout-minutes: 30 # Increase from default 15
```

#### 3. **Chromatic Token Invalid**

**Error**: `Authentication failed`

**Solution**: Regenerate token in Chromatic dashboard

1. Go to [Chromatic Project Settings](<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9)
2. Navigate to "Manage" → "Configure"
3. Copy new project token
4. Update GitHub secret `CHROMATIC_PROJECT_TOKEN`

#### 4. **Deployment Secrets Missing**

**Error**: `Error: Input required and not supplied: PROD_DATABASE_URL`

**Solution**: Add secrets to GitHub repository

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add all required production secrets

#### 5. **k6 Tests Not Found**

**Error**: `no such file or directory: dist/performance-tests/*.js`

**Solution**: Ensure TypeScript builds correctly

```yaml
- name: Build TypeScript files
  run: npm run build # Must compile TS to JS first
```

### Debugging Workflows

**Enable Debug Logging**:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add `ACTIONS_STEP_DEBUG` = `true`
3. Re-run workflow to see detailed logs

**Local Testing** (Using `act`):

```bash
# Install act (GitHub Actions local runner)
brew install act

# Run workflow locally
act -j build
```

---

## 📚 RELATED RESOURCES

### Divine Instructions

- **[06 | Automation Infrastructure](./instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md)** - Complete CI/CD patterns
- **[05 | Testing Security Divinity](./instructions/05_TESTING_SECURITY_DIVINITY.instructions.md)** - Testing automation
- **[03 | Performance Reality Bending](./instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md)** - Performance optimization
- **[01 | Divine Core Principles](./instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md)** - Quality standards

### External Resources

- [GitHub Actions Documentation](<https://docs.github.com/en/action>s)
- [Chromatic Documentation](<https://www.chromatic.com/docs>/)
- [k6 Performance Testing](<https://k6.io/docs>/)
- [Next.js Deployment](<https://nextjs.org/docs/deploymen>t)

### Project Documentation

- **[Divine Software Engineering Consultant](./DIVINE_SOFTWARE_ENGINEERING_CONSULTANT.md)** - Complete project analysis framework
- **[Quick Reference Guide](./instructions/QUICK_REFERENCE_GUIDE.md)** - Fast pattern lookup

---

## ✅ WORKFLOW HEALTH CHECKLIST

Use this checklist to validate workflow health:

### CI/CD Pipeline

- [ ] Build job completes in <10 minutes
- [ ] All linting checks pass
- [ ] All tests pass (2,000/2,000)
- [ ] Production deployment successful
- [ ] SSL certificates configured correctly
- [ ] All secrets available in production

### Visual Testing

- [ ] Chromatic runs on component changes
- [ ] PR comments posted successfully
- [ ] Visual diffs reviewable
- [ ] Storybook builds correctly

### Performance Testing

- [ ] k6 tests execute successfully
- [ ] Performance metrics within targets
- [ ] Artifacts uploaded and accessible
- [ ] No performance regressions detected

### Progress Automation

- [ ] Updates run every 4 hours
- [ ] Commits pushed successfully
- [ ] No infinite CI loops
- [ ] Progress files accurate

### Security

- [ ] All secrets rotated within 90 days
- [ ] No secrets in logs
- [ ] Dependency scanning enabled
- [ ] Permissions minimized

---

**🌟 Divine Automation Ensures Continuous Excellence 🌟**

_"Automate the repetitive, elevate the essential."_
