# 🔄 CI/CD Improvements & Additional Workflows

**Purpose**: Enhance your GitHub Actions automation
**Time Required**: 1-2 hours
**Skill Level**: Intermediate-Advanced
**Value**: Catch bugs early, automate repetitive tasks

---

## 🎯 Current CI/CD Status

### ✅ What You Already Have

1. **Main CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

   - ✅ Automated testing on push
   - ✅ Security scanning
   - ✅ Docker builds
   - ✅ Deployment to staging/production
   - ✅ All actions updated to v4

2. **Performance Testing** (`.github/workflows/performance-testing.yml`)
   - ✅ Daily performance tests
   - ✅ Load testing with k6
   - ✅ Performance regression detection
   - ✅ Fixed deprecation warnings

---

## 🚀 Recommended Additional Workflows

### 1. Dependency Updates (Dependabot)

Automatically update dependencies and create PRs.

**Create**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    commit-message:
      prefix: "chore"
      prefix-development: "chore"
      include: "scope"
    labels:
      - "dependencies"
      - "automated"
    reviewers:
      - "Gogzia"
    assignees:
      - "Gogzia"

  # GitHub Actions updates
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    commit-message:
      prefix: "ci"
    labels:
      - "github-actions"
      - "automated"
```

### 2. Code Quality Checks

**Create**: `.github/workflows/code-quality.yml`

```yaml
name: Code Quality

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  code-quality:
    name: Code Quality Checks
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for better analysis

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint -- --format json --output-file eslint-report.json
        continue-on-error: true

      - name: Run Prettier Check
        run: npm run format:check

      - name: TypeScript Type Check
        run: npx tsc --noEmit

      - name: Check for console.log
        run: |
          if grep -r "console\\.log" src/ --exclude-dir=node_modules; then
            echo "❌ Found console.log statements. Please remove them."
            exit 1
          fi

      - name: Check bundle size
        run: |
          npm run build
          npx bundlesize

      - name: Upload ESLint Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: eslint-report
          path: eslint-report.json
```

### 3. Automated Testing Suite

**Create**: `.github/workflows/test-suite.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          flags: unit

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: unit-tests

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Setup database
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db
        run: |
          npx prisma migrate deploy
          npx prisma db seed

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/integration-coverage.json
          flags: integration

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: integration-tests

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### 4. Lighthouse CI (Performance Audits)

**Create**: `.github/workflows/lighthouse.yml`

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    name: Lighthouse Audit
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/farms
            http://localhost:3000/products
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('.lighthouseci/manifest.json', 'utf8'));
            // Post lighthouse results to PR
```

### 5. Security Scanning

**Create**: `.github/workflows/security.yml`

```yaml
name: Security Scanning

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0" # Weekly on Sunday

jobs:
  security-scan:
    name: Security Vulnerability Scan
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: "farmers-market"
          path: "."
          format: "HTML"

      - name: Upload dependency check results
        uses: actions/upload-artifact@v4
        with:
          name: dependency-check-report
          path: reports/
```

### 6. Database Migration Check

**Create**: `.github/workflows/db-migration-check.yml`

```yaml
name: Database Migration Check

on:
  pull_request:
    paths:
      - "prisma/schema.prisma"
      - "prisma/migrations/**"

jobs:
  migration-check:
    name: Validate Database Migration
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: migration_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Get full history for migration comparison

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Check for migration conflicts
        run: |
          # Check if schema changed but no migration created
          if git diff --name-only origin/main...HEAD | grep "prisma/schema.prisma"; then
            if ! git diff --name-only origin/main...HEAD | grep "prisma/migrations"; then
              echo "❌ Schema changed but no migration created!"
              echo "Run: npx prisma migrate dev --name your_migration_name"
              exit 1
            fi
          fi

      - name: Run migrations
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/migration_test
        run: npx prisma migrate deploy

      - name: Validate schema
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/migration_test
        run: npx prisma validate

      - name: Check for drift
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/migration_test
        run: npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma
```

### 7. Auto-labeling PRs

**Create**: `.github/workflows/auto-label.yml`

```yaml
name: Auto Label PRs

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  label:
    name: Auto Label
    runs-on: ubuntu-latest

    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          configuration-path: .github/labeler.yml
```

**Create**: `.github/labeler.yml`

```yaml
# Auto-label based on changed files

"database":
  - prisma/**/*
  - src/lib/database/**/*

"api":
  - src/app/api/**/*

"ui":
  - src/components/**/*
  - src/app/**/page.tsx

"documentation":
  - docs/**/*
  - "*.md"

"tests":
  - src/**/*.test.ts
  - src/**/*.test.tsx
  - e2e/**/*

"dependencies":
  - package.json
  - package-lock.json

"ci/cd":
  - .github/workflows/**/*
```

### 8. Stale Issue Management

**Create**: `.github/workflows/stale.yml`

```yaml
name: Close Stale Issues

on:
  schedule:
    - cron: "0 0 * * *" # Daily

jobs:
  stale:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/stale@v9
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}

          # Issues config
          stale-issue-message: "This issue has been automatically marked as stale because it has not had recent activity. It will be closed if no further activity occurs. Thank you for your contributions."
          close-issue-message: "This issue has been automatically closed due to inactivity. Feel free to reopen if needed."
          days-before-issue-stale: 30
          days-before-issue-close: 7
          stale-issue-label: "stale"
          exempt-issue-labels: "pinned,security,bug"

          # PRs config
          stale-pr-message: "This PR has been automatically marked as stale. Please update or close."
          close-pr-message: "This PR has been automatically closed due to inactivity."
          days-before-pr-stale: 14
          days-before-pr-close: 7
          stale-pr-label: "stale"
          exempt-pr-labels: "pinned,security"
```

---

## 🔐 Required Secrets

To enable all workflows, add these secrets to your GitHub repository:

### Settings → Secrets and variables → Actions → New repository secret

```plaintext
CODECOV_TOKEN
- Get from: <<https://codecov.i>o>
- Purpose: Upload test coverage

SNYK_TOKEN
- Get from: <<https://snyk.i>o>
- Purpose: Security vulnerability scanning

VERCEL_TOKEN
- Get from: <<https://vercel.com/account/token>s>
- Purpose: Deploy to Vercel from CI

VERCEL_ORG_ID
- Get from: Vercel project settings
- Purpose: Identify your Vercel organization

VERCEL_PROJECT_ID
- Get from: Vercel project settings
- Purpose: Identify your Vercel project

SLACK_WEBHOOK_URL (optional)
- Create in Slack
- Purpose: Deployment notifications
```

---

## 📊 Workflow Triggers Overview

| Workflow      | Trigger             | Frequency           |
| ------------- | ------------------- | ------------------- |
| CI/CD         | Push, PR            | Every commit        |
| Code Quality  | Push, PR            | Every commit        |
| Test Suite    | Push, PR            | Every commit        |
| Security Scan | Push, PR, Schedule  | Weekly              |
| Performance   | Push, Schedule      | Daily               |
| Lighthouse    | PR only             | On PR               |
| DB Migration  | PR (schema changes) | When schema changes |
| Stale Issues  | Schedule            | Daily               |

---

## 🎯 Workflow Best Practices

### 1. Fast Feedback Loop

- Run linting/type-check first (fastest)
- Run unit tests before integration tests
- Run E2E tests last (slowest)

### 2. Fail Fast

```yaml
jobs:
  lint:
    # Quick checks first

  test:
    needs: lint # Don't test if lint fails

  build:
    needs: test # Don't build if tests fail

  deploy:
    needs: build # Don't deploy if build fails
```

### 3. Parallel Execution

```yaml
jobs:
  lint:
    # Runs in parallel

  type-check:
    # Runs in parallel

  unit-tests:
    # Runs in parallel
```

### 4. Conditional Execution

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

### 5. Caching

```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

---

## 📈 Monitoring Workflows

### View Workflow Runs

1. Go to repository → "Actions" tab
2. See all workflow runs
3. Click on run to view details
4. Download artifacts if needed

### Workflow Badges

Add to your README.md:

```markdown
![CI/CD](<https://github.com/Gogzia/farmers-market/workflows/Agricultural%20Consciousness%20CI/CD/badge.sv>g)
![Tests](<https://github.com/Gogzia/farmers-market/workflows/Test%20Suite/badge.sv>g)
![Security](<https://github.com/Gogzia/farmers-market/workflows/Security%20Scanning/badge.sv>g)
```

---

## 🔄 Continuous Improvement

### Weekly Reviews

Every week, review:

- [ ] Failed workflow runs
- [ ] Test coverage trends
- [ ] Performance metrics
- [ ] Security scan results
- [ ] Dependency updates

### Monthly Optimization

Every month:

- [ ] Review workflow execution times
- [ ] Optimize slow tests
- [ ] Update GitHub Actions
- [ ] Review and merge Dependabot PRs

---

## ✅ Implementation Checklist

- [ ] Create `dependabot.yml` for automatic updates
- [ ] Add code quality workflow
- [ ] Set up automated testing suite
- [ ] Enable Lighthouse CI for performance
- [ ] Configure security scanning
- [ ] Add database migration checks
- [ ] Set up auto-labeling
- [ ] Configure stale issue management
- [ ] Add required secrets to GitHub
- [ ] Add workflow badges to README
- [ ] Test all workflows with a test PR

---

## 🎉 Benefits

After implementing these workflows, you'll have:

✅ **Automated Quality Gates** - Prevent bad code from merging
✅ **Security Monitoring** - Catch vulnerabilities early
✅ **Performance Tracking** - Prevent performance regressions
✅ **Dependency Management** - Stay up-to-date automatically
✅ **Better Visibility** - Know project health at a glance
✅ **Time Savings** - Automation handles repetitive tasks

---

**Your CI/CD pipeline will be world-class!** 🚀

---

_Last Updated: October 21, 2025_
_Questions? Check GitHub Actions documentation or ask for help!_
