# 🌾 CI/CD Standards Implementation Guide

## 📋 Overview

**Purpose:** Implement automated checks from Phase 3 documentation standards into our CI/CD pipeline.

**Timeline:** 2-3 weeks  
**Priority:** High  
**Status:** 🟡 In Progress

**Goals:**

1. ✅ Enforce code quality standards automatically
2. ✅ Prevent regressions and common mistakes
3. ✅ Reduce manual review burden
4. ✅ Ensure security best practices
5. ✅ Maintain performance standards

---

## 🎯 Implementation Roadmap

### Phase 1: Critical Checks (Week 1)

**Focus:** Security, Type Safety, Tests

- [ ] TypeScript strict mode enforcement
- [ ] Security scanning (Snyk/npm audit)
- [ ] Test coverage thresholds
- [ ] Linting and formatting

### Phase 2: Quality Checks (Week 2)

**Focus:** Code Quality, Standards

- [ ] Code review checklist automation
- [ ] Bundle size monitoring
- [ ] Performance budgets
- [ ] Database query validation

### Phase 3: Advanced Checks (Week 3)

**Focus:** Documentation, Metrics

- [ ] Documentation coverage
- [ ] API breaking change detection
- [ ] Dependency updates
- [ ] Automated reporting

---

## 🔧 Implementation Details

## 1. TypeScript & Linting Checks

### 1.1 TypeScript Strict Mode Enforcement

**File:** `.github/workflows/typescript-check.yml`

```yaml
name: TypeScript Strict Mode Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  typescript-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: TypeScript type check
        run: npm run type-check

      - name: Verify strict mode
        run: |
          if ! grep -q '"strict": true' tsconfig.json; then
            echo "❌ TypeScript strict mode is not enabled!"
            exit 1
          fi
          echo "✅ TypeScript strict mode is enabled"

      - name: Check for 'any' types
        run: |
          ANY_COUNT=$(grep -r ":\s*any" src/ --include="*.ts" --include="*.tsx" | wc -l)
          if [ $ANY_COUNT -gt 50 ]; then
            echo "⚠️ Warning: Found $ANY_COUNT uses of 'any' type (threshold: 50)"
            exit 1
          fi
          echo "✅ 'any' type usage is acceptable ($ANY_COUNT uses)"
```

**Related Standard:** [TypeScript Patterns](./typescript/TYPESCRIPT_PATTERNS.md)

**Success Criteria:**

- ✅ No TypeScript errors
- ✅ Strict mode enabled
- ✅ Minimal use of `any` type (<50 occurrences)

---

### 1.2 ESLint & Prettier Enforcement

**File:** `.github/workflows/lint-check.yml`

```yaml
name: Lint & Format Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Verify no console.log in production
        run: |
          CONSOLE_COUNT=$(grep -r "console\.log\|console\.debug" src/ --include="*.ts" --include="*.tsx" --exclude="*.test.*" | wc -l)
          if [ $CONSOLE_COUNT -gt 0 ]; then
            echo "❌ Found $CONSOLE_COUNT console.log statements in production code!"
            grep -rn "console\.log\|console\.debug" src/ --include="*.ts" --include="*.tsx" --exclude="*.test.*"
            exit 1
          fi
          echo "✅ No console.log in production code"
```

**Related Standard:** [Code Review Standards](./code-review/CODE_REVIEW_STANDARDS.md)

---

## 2. Testing & Coverage Checks

### 2.1 Test Coverage Enforcement

**File:** `.github/workflows/test-coverage.yml`

```yaml
name: Test Coverage

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npm run test:coverage

      - name: Check coverage thresholds
        run: |
          COVERAGE=$(npm run test:coverage -- --json --silent | jq -r '.coverageMap.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "❌ Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
          echo "✅ Coverage $COVERAGE% meets threshold"

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

**Coverage Thresholds (from Testing Standards):**

- Unit Tests: 80% minimum
- Integration Tests: 60% minimum
- Critical paths: 90%+ minimum

**Related Standard:** [Testing Standards](./testing/TESTING_STANDARDS.md)

---

### 2.2 Test Quality Checks

**File:** `.github/workflows/test-quality.yml`

```yaml
name: Test Quality

on:
  pull_request:
    branches: [main, develop]

jobs:
  test-quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run all tests
        run: npm run test:all

      - name: Check for .only in tests
        run: |
          if grep -r "\.only\|fdescribe\|fit" tests/ src/ --include="*.test.ts" --include="*.test.tsx" --include="*.spec.ts"; then
            echo "❌ Found .only or focused tests!"
            exit 1
          fi
          echo "✅ No focused tests found"

      - name: Check for skipped tests
        run: |
          SKIP_COUNT=$(grep -r "\.skip\|xdescribe\|xit" tests/ src/ --include="*.test.ts" --include="*.test.tsx" --include="*.spec.ts" | wc -l)
          if [ $SKIP_COUNT -gt 5 ]; then
            echo "⚠️ Warning: Found $SKIP_COUNT skipped tests (threshold: 5)"
            exit 1
          fi
          echo "✅ Acceptable number of skipped tests ($SKIP_COUNT)"

      - name: Verify test file naming
        run: |
          INVALID_TESTS=$(find tests/ src/ -type f -name "*.test.*" -o -name "*.spec.*" | grep -v "\\.test\\.tsx\?$" | grep -v "\\.spec\\.tsx\?$")
          if [ -n "$INVALID_TESTS" ]; then
            echo "❌ Invalid test file naming found:"
            echo "$INVALID_TESTS"
            exit 1
          fi
          echo "✅ All test files follow naming convention"
```

---

## 3. Security Checks

### 3.1 Dependency Vulnerability Scanning

**File:** `.github/workflows/security-scan.yml`

```yaml
name: Security Scan

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]
  schedule:
    - cron: "0 0 * * 1" # Weekly on Mondays

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Check for hardcoded secrets
        run: |
          if grep -r -E "(password|secret|key|token)\s*=\s*['\"][^'\"]+['\"]" src/ --include="*.ts" --include="*.tsx" --exclude="*.test.*" | grep -v "process.env"; then
            echo "❌ Potential hardcoded secrets found!"
            exit 1
          fi
          echo "✅ No hardcoded secrets detected"
```

**Related Standard:** [Security Best Practices](./guides/SECURITY_BEST_PRACTICES.md)

---

### 3.2 Authentication & Authorization Checks

**File:** `.github/workflows/auth-validation.yml`

```yaml
name: Auth & Security Validation

on:
  pull_request:
    paths:
      - "src/app/api/**"
      - "src/lib/auth/**"
      - "middleware.ts"

jobs:
  auth-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Verify API route protection
        run: |
          # Check that API routes use auth middleware
          UNPROTECTED=$(grep -r "export async function" src/app/api --include="*.ts" -A 5 | grep -v "auth()\|requireAuth\|getServerSession" | wc -l)
          if [ $UNPROTECTED -gt 10 ]; then
            echo "⚠️ Warning: Potentially unprotected API routes found"
            echo "Review authentication implementation"
          fi

      - name: Check for SQL injection vulnerabilities
        run: |
          if grep -r "\$queryRaw\|\$executeRaw" src/ --include="*.ts" -B 2 | grep -v "Prisma.sql\|\\\$"; then
            echo "❌ Potential SQL injection vulnerability!"
            echo "Use parameterized queries or Prisma.sql template"
            exit 1
          fi
          echo "✅ No SQL injection vulnerabilities detected"

      - name: Verify input validation
        run: |
          # Check that API routes use Zod validation
          ROUTES_WITHOUT_VALIDATION=$(grep -r "export async function POST\|PUT\|PATCH" src/app/api --include="*.ts" -A 10 | grep -v "\.parse\|\.safeParse\|\.validate" | wc -l)
          if [ $ROUTES_WITHOUT_VALIDATION -gt 5 ]; then
            echo "⚠️ Warning: API routes may be missing input validation"
          fi
```

---

## 4. Performance Checks

### 4.1 Bundle Size Monitoring

**File:** `.github/workflows/bundle-size.yml`

```yaml
name: Bundle Size Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  bundle-size:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true

      - name: Analyze bundle size
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Check bundle size limits
        run: |
          BUNDLE_SIZE=$(du -sk .next/static | cut -f1)
          MAX_SIZE=5000 # 5MB in KB

          if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
            echo "❌ Bundle size ${BUNDLE_SIZE}KB exceeds limit ${MAX_SIZE}KB"
            exit 1
          fi
          echo "✅ Bundle size ${BUNDLE_SIZE}KB is within limit"

      - name: Check for large dependencies
        run: |
          npm list --all --json | jq -r '.dependencies | to_entries[] | select(.value.version) | "\(.key)@\(.value.version)"' > deps.txt
          echo "📦 Largest dependencies:"
          du -sh node_modules/* | sort -rh | head -10
```

**Performance Budgets (from Performance Standards):**

- Total bundle size: <5MB
- Initial JS: <500KB
- Initial CSS: <50KB
- Time to Interactive: <3s

**Related Standard:** [Performance Best Practices](./guides/PERFORMANCE_BEST_PRACTICES.md)

---

### 4.2 Database Query Performance

**File:** `.github/workflows/db-performance.yml`

```yaml
name: Database Performance Check

on:
  pull_request:
    paths:
      - "src/lib/repositories/**"
      - "prisma/**"

jobs:
  db-performance:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        run: |
          npm run db:push
          npm run db:seed
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

      - name: Check for N+1 queries
        run: |
          if grep -r "for.*await.*findUnique\|for.*await.*findFirst" src/lib/repositories --include="*.ts"; then
            echo "⚠️ Warning: Potential N+1 query detected!"
            echo "Consider using findMany with include or batch queries"
          fi

      - name: Verify query optimization
        run: |
          # Check for missing indexes on foreign keys
          MISSING_INDEXES=$(grep -r "@relation" prisma/schema.prisma | grep -v "@@index")
          if [ -n "$MISSING_INDEXES" ]; then
            echo "⚠️ Warning: Relations may be missing indexes"
          fi
```

---

## 5. Code Review Automation

### 5.1 PR Template Validation

**File:** `.github/workflows/pr-validation.yml`

```yaml
name: PR Validation

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate-pr:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Check PR title format
        run: |
          PR_TITLE="${{ github.event.pull_request.title }}"
          if ! [[ "$PR_TITLE" =~ ^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?:.+ ]]; then
            echo "❌ PR title must follow format: type(scope): description"
            echo "Examples: feat(auth): add login, fix(api): handle errors"
            exit 1
          fi
          echo "✅ PR title format is correct"

      - name: Check PR description
        run: |
          PR_BODY="${{ github.event.pull_request.body }}"

          if [ ${#PR_BODY} -lt 50 ]; then
            echo "❌ PR description is too short (minimum 50 characters)"
            exit 1
          fi

          if ! echo "$PR_BODY" | grep -q "## Changes"; then
            echo "❌ PR must include '## Changes' section"
            exit 1
          fi

          if ! echo "$PR_BODY" | grep -q "## Testing"; then
            echo "❌ PR must include '## Testing' section"
            exit 1
          fi

          echo "✅ PR description includes required sections"

      - name: Check for linked issue
        run: |
          PR_BODY="${{ github.event.pull_request.body }}"
          if ! echo "$PR_BODY" | grep -E "(Closes|Fixes|Resolves) #[0-9]+"; then
            echo "⚠️ Warning: PR should link to an issue"
            echo "Use 'Closes #123' or 'Fixes #123'"
          fi
```

**Related Standard:** [Code Review Standards](./code-review/CODE_REVIEW_STANDARDS.md)

---

### 5.2 Automated Review Comments

**File:** `.github/workflows/auto-review.yml`

```yaml
name: Automated Code Review

on:
  pull_request:
    branches: [main, develop]

jobs:
  auto-review:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Check file size limits
        run: |
          LARGE_FILES=$(find src/ -type f -size +500k)
          if [ -n "$LARGE_FILES" ]; then
            echo "⚠️ Warning: Large files detected:"
            echo "$LARGE_FILES"
            echo "Consider splitting into smaller files"
          fi

      - name: Check for TODO comments
        run: |
          TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" src/ --include="*.ts" --include="*.tsx" | wc -l)
          if [ $TODO_COUNT -gt 20 ]; then
            echo "⚠️ Warning: $TODO_COUNT TODO/FIXME comments found"
            echo "Consider creating issues for long-term tasks"
          fi

      - name: Complexity check
        run: |
          # Install complexity checker
          npm install -g complexity-report

          # Check for high complexity functions
          HIGH_COMPLEXITY=$(complexity-report src/ --format json | jq '.[] | select(.complexity > 10)')
          if [ -n "$HIGH_COMPLEXITY" ]; then
            echo "⚠️ Warning: High complexity functions detected"
            echo "Consider refactoring functions with cyclomatic complexity > 10"
          fi
```

---

## 6. Documentation Checks

### 6.1 Documentation Coverage

**File:** `.github/workflows/docs-check.yml`

```yaml
name: Documentation Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Check for missing README files
        run: |
          # Check for directories without README
          DIRS_WITHOUT_README=$(find src/ -type d -not -path "*/node_modules/*" -exec sh -c '[ ! -f "$1/README.md" ]' _ {} \; -print)
          if [ -n "$DIRS_WITHOUT_README" ]; then
            echo "⚠️ Warning: Directories without README.md:"
            echo "$DIRS_WITHOUT_README"
          fi

      - name: Validate API documentation
        run: |
          # Check that new API routes have JSDoc
          NEW_API_ROUTES=$(git diff --name-only origin/main...HEAD | grep "src/app/api/.*\.ts$")
          for file in $NEW_API_ROUTES; do
            if ! grep -q "/\*\*" "$file"; then
              echo "⚠️ Warning: $file may be missing JSDoc comments"
            fi
          done

      - name: Check for broken links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          use-quiet-mode: "yes"
          config-file: ".github/markdown-link-check.json"
```

---

## 7. Database Migration Checks

### 7.1 Prisma Migration Validation

**File:** `.github/workflows/prisma-check.yml`

```yaml
name: Prisma Schema Validation

on:
  pull_request:
    paths:
      - "prisma/**"

jobs:
  prisma:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Validate Prisma schema
        run: npx prisma validate

      - name: Check for breaking changes
        run: |
          # Check if fields were removed or renamed
          git diff origin/main...HEAD prisma/schema.prisma > schema.diff

          if grep -E "^-\s+(id|name|email)" schema.diff; then
            echo "❌ Potential breaking change detected in schema!"
            echo "Fields may have been removed or renamed"
            exit 1
          fi

      - name: Verify migration files
        run: |
          NEW_MIGRATIONS=$(git diff --name-only origin/main...HEAD | grep "prisma/migrations/.*\.sql$")
          if [ -n "$NEW_MIGRATIONS" ]; then
            echo "✅ New migrations detected:"
            echo "$NEW_MIGRATIONS"
            
            # Check for dangerous operations
            for migration in $NEW_MIGRATIONS; do
              if grep -E "DROP TABLE|DROP COLUMN|TRUNCATE" "$migration"; then
                echo "⚠️ Warning: Destructive operation in $migration"
                echo "Ensure you have backup strategy"
              fi
            done
          fi
```

**Related Standard:** [Prisma Best Practices](./database/PRISMA_BEST_PRACTICES.md)

---

## 📊 Monitoring & Reporting

### Dashboard Setup

**File:** `.github/workflows/quality-report.yml`

```yaml
name: Quality Report

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 0 * * 1" # Weekly on Mondays

jobs:
  quality-report:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Generate quality metrics
        run: |
          echo "## Quality Metrics Report" > quality-report.md
          echo "Generated: $(date)" >> quality-report.md
          echo "" >> quality-report.md

          # Code statistics
          echo "### Code Statistics" >> quality-report.md
          echo "- Total Lines of Code: $(find src/ -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1)" >> quality-report.md
          echo "- Total Files: $(find src/ -name '*.ts' -o -name '*.tsx' | wc -l)" >> quality-report.md

          # Test statistics
          echo "" >> quality-report.md
          echo "### Test Statistics" >> quality-report.md
          echo "- Test Files: $(find tests/ src/ -name '*.test.ts' -o -name '*.spec.ts' | wc -l)" >> quality-report.md

          # TODO count
          echo "" >> quality-report.md
          echo "### Technical Debt" >> quality-report.md
          echo "- TODO Comments: $(grep -r 'TODO' src/ | wc -l)" >> quality-report.md
          echo "- FIXME Comments: $(grep -r 'FIXME' src/ | wc -l)" >> quality-report.md

      - name: Post to Slack
        if: github.event_name == 'schedule'
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Weekly Quality Report Available",
              "attachments": [{
                "color": "#36a64f",
                "title": "Quality Metrics",
                "text": "View the latest quality report in GitHub Actions"
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🚀 Rollout Plan

### Week 1: Critical Checks

**Monday-Tuesday:**

- [ ] Set up TypeScript strict mode check
- [ ] Configure ESLint/Prettier enforcement
- [ ] Test on sample PRs

**Wednesday-Thursday:**

- [ ] Implement security scanning (npm audit, Snyk)
- [ ] Add hardcoded secrets detection
- [ ] Test security alerts

**Friday:**

- [ ] Add test coverage enforcement
- [ ] Configure coverage thresholds
- [ ] Team review and feedback

### Week 2: Quality Checks

**Monday-Tuesday:**

- [ ] Implement PR template validation
- [ ] Add bundle size monitoring
- [ ] Set up performance budgets

**Wednesday-Thursday:**

- [ ] Add database performance checks
- [ ] Implement N+1 query detection
- [ ] Configure automated review comments

**Friday:**

- [ ] Team training session
- [ ] Documentation updates
- [ ] Gather feedback

### Week 3: Advanced Checks

**Monday-Tuesday:**

- [ ] Add documentation coverage checks
- [ ] Implement API breaking change detection
- [ ] Set up quality reporting

**Wednesday-Thursday:**

- [ ] Configure Prisma migration validation
- [ ] Add dependency update automation
- [ ] Fine-tune all checks

**Friday:**

- [ ] Full system test
- [ ] Team retrospective
- [ ] Celebration! 🎉

---

## 📋 Configuration Files

### `.github/markdown-link-check.json`

```json
{
  "ignorePatterns": [
    {
      "pattern": "^http://localhost"
    }
  ],
  "timeout": "20s",
  "retryOn429": true,
  "retryCount": 5,
  "fallbackRetryDelay": "30s"
}
```

### `package.json` scripts to add:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "format:check": "prettier --check .",
    "format": "prettier --write .",
    "test:coverage": "vitest run --coverage",
    "test:all": "npm run test && npm run test:e2e",
    "security:audit": "npm audit --audit-level=moderate",
    "bundle:analyze": "ANALYZE=true npm run build"
  }
}
```

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

**Code Quality:**

- ✅ 0 TypeScript errors in main branch
- ✅ 0 high/critical security vulnerabilities
- ✅ >80% test coverage maintained
- ✅ <5 ESLint warnings per 1000 LOC

**Process Efficiency:**

- ✅ <10 minutes average CI/CD time
- ✅ >90% PR pass rate on first attempt
- ✅ <24 hours from PR open to merge

**Developer Experience:**

- ✅ <5 minutes to identify issues
- ✅ Clear, actionable error messages
- ✅ Minimal false positives (<5%)

---

## 🔧 Troubleshooting

### Common Issues

#### 1. CI/CD Running Too Long

**Problem:** Workflows taking >15 minutes  
**Solution:**

- Use caching for dependencies
- Run jobs in parallel
- Use matrix strategy for different environments
- Consider self-hosted runners

#### 2. Flaky Tests Failing CI

**Problem:** Tests pass locally but fail in CI  
**Solution:**

- Add retry logic for network-dependent tests
- Use proper test isolation
- Mock external dependencies
- Add timeout configurations

#### 3. False Positive Security Alerts

**Problem:** Security scanner flagging dev dependencies  
**Solution:**

- Configure `.snyk` policy file
- Use `npm audit --production`
- Document exceptions with justification
- Regular security review meetings

#### 4. Bundle Size Fluctuations

**Problem:** Bundle size varies between builds  
**Solution:**

- Use deterministic builds
- Lock dependency versions
- Monitor specific route bundles
- Configure size budgets per route

---

## 📚 Related Documentation

- 📋 [Code Review Standards](./code-review/CODE_REVIEW_STANDARDS.md)
- 🧪 [Testing Standards](./testing/TESTING_STANDARDS.md)
- 🔒 [Security Best Practices](./guides/SECURITY_BEST_PRACTICES.md)
- ⚡ [Performance Best Practices](./guides/PERFORMANCE_BEST_PRACTICES.md)
- 📘 [TypeScript Patterns](./typescript/TYPESCRIPT_PATTERNS.md)
- 🗄️ [Prisma Best Practices](./database/PRISMA_BEST_PRACTICES.md)

---

## 📞 Support

**Issues with CI/CD:**

- Slack: #engineering-cicd
- GitHub: [Open issue](https://github.com/org/repo/issues/new?labels=ci/cd)
- Email: devops@farmersmarket.com

**False Positives:**

- Review with team lead
- Document exception in PR
- Update configuration if recurring

**Suggestions for Improvement:**

- Submit PR to this document
- Discuss in engineering meetings
- Use GitHub Discussions

---

## 🎉 Benefits

### For Developers:

- ✅ Catch errors before code review
- ✅ Learn best practices automatically
- ✅ Less manual review burden
- ✅ Faster feedback loops

### For Team Leads:

- ✅ Consistent code quality
- ✅ Reduced review time
- ✅ Security compliance
- ✅ Performance guarantees

### For Organization:

- ✅ Lower technical debt
- ✅ Faster onboarding
- ✅ Better maintainability
- ✅ Improved reliability

---

**Remember:** CI/CD checks are tools to help us, not gatekeepers. They should empower developers to write better code, not slow them down. If a check is causing more friction than value, let's discuss and adjust! 🚀

---

_Last Updated: January 2025_  
_Version: 1.0_  
_Owner: DevOps Team + Technical Lead_
