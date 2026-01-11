# 📚 Scripts Reference Guide

**Last Updated**: January 2025  
**Purpose**: Complete reference for all npm scripts, including those moved from package.json for clarity

---

## 🎯 Quick Reference: Core Commands

These are the **only scripts you need for 95% of development work**:

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run dev:webpack      # Start dev server (Webpack - fallback)

# Building
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Lint and auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript validation

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:ci          # Run tests for CI
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI

# Database
npm run db:migrate       # Run migrations
npm run db:push          # Push schema changes
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database and reseed
```

---

## 📦 Tier 1: Core Development Scripts

### Development Servers

#### `npm run dev`

**Default development server with Turbopack (recommended)**

```bash
next dev --turbo -p 3001
```

- Uses Turbopack for fastest HMR
- Runs on port 3001
- Memory limit: 16GB (handles large codebase)

#### `npm run dev:webpack`

**Fallback development server with Webpack**

```bash
next dev --webpack -p 3001
```

- Use when Turbopack has issues
- Better debugging in some edge cases
- Slightly slower HMR

### Production

#### `npm run build`

**Production build (used by Vercel)**

```bash
prisma generate && next build
```

- Generates Prisma Client
- Builds optimized production bundle
- Runs type-checking via `prebuild` locally

#### `npm run start`

**Start production server locally**

```bash
next start -p 3001
```

- Requires `npm run build` first
- Test production behavior locally

#### `npm run build:analyze`

**Production build with bundle analysis**

```bash
cross-env ANALYZE=true next build --webpack
```

- Generates bundle size report
- Opens visualization in browser
- Use to optimize bundle size

---

## 🧪 Tier 2: Testing Scripts

### Unit Tests (Jest)

#### `npm test`

**Run all unit tests**

```bash
jest --maxWorkers=6
```

- Parallelized across 6 workers
- Tests in `src/__tests__/`

#### `npm run test:watch`

**Run tests in watch mode**

```bash
jest --watch --maxWorkers=4
```

- Re-runs tests on file changes
- Reduced workers for interactive mode

#### `npm run test:coverage`

**Generate coverage report**

```bash
jest --coverage --maxWorkers=6
```

- Generates HTML report in `coverage/`
- Shows line/branch coverage

### E2E Tests (Playwright)

#### `npm run test:e2e`

**Run E2E tests headless**

```bash
playwright test --workers=6
```

- Runs all Playwright tests
- Parallelized across 6 workers

#### `npm run test:e2e:ui`

**Run E2E tests with UI**

```bash
playwright test --ui
```

- Interactive test explorer
- Best for debugging

#### `npm run test:e2e:headed`

**Run E2E tests with visible browser**

```bash
playwright test --headed --workers=4
```

- See tests execute in real browser
- Slower, use for debugging

### Advanced Testing Shortcuts

#### `npm run test:visual`

**Visual regression tests**

```bash
playwright test tests/visual --workers=6
```

- Compares screenshots
- Detects visual changes

#### `npm run test:mobile`

**Mobile device tests**

```bash
playwright test tests/mobile --workers=4
```

- Tests mobile viewports
- iOS and Android emulation

#### `npm run test:a11y`

**Accessibility tests**

```bash
playwright test tests/accessibility --workers=6
```

- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader compatibility

#### `npm run test:load`

**Load testing with k6**

```bash
k6 run tests/load/comprehensive-load-test.ts
```

- Stress tests API endpoints
- Simulates concurrent users

#### `npm run test:security`

**Security vulnerability scan**

```bash
jest tests/security --runInBand
```

- SQL injection tests
- XSS vulnerability checks
- CSRF protection validation

---

## 🗄️ Tier 3: Database Scripts

### Migrations

#### `npm run db:migrate`

**Create and apply migration**

```bash
prisma migrate dev
```

- Creates migration file
- Applies to database
- Updates Prisma Client

#### `npm run db:push`

**Push schema changes without migration**

```bash
prisma db push
```

- Quick prototyping
- No migration file created
- Use in development only

### Seeding

#### `npm run db:seed`

**Seed database with test data**

```bash
prisma db seed
```

- Runs `prisma/seed.ts`
- Populates test users, farms, products

#### `npm run db:seed:basic`

**Basic seed for local testing**

```bash
tsx prisma/seed-basic.ts
```

- Minimal data set
- Faster than full seed

### Management

#### `npm run db:studio`

**Open Prisma Studio**

```bash
prisma studio
```

- Visual database browser
- Edit data in UI
- Opens on http://localhost:5555

#### `npm run db:reset`

**Reset database completely**

```bash
prisma db push --force-reset && npm run db:seed
```

- ⚠️ **DESTRUCTIVE**: Drops all data
- Recreates schema
- Runs seed script

---

## 🔍 Tier 4: Code Quality Scripts

### Linting

#### `npm run lint`

**Lint all code**

```bash
eslint . --ext .js,.jsx,.ts,.tsx
```

- Checks JavaScript/TypeScript files
- Reports errors and warnings

#### `npm run lint:fix`

**Auto-fix linting issues**

```bash
eslint . --ext .js,.jsx,.ts,.tsx --fix
```

- Fixes auto-fixable issues
- Reports remaining problems

### Formatting

#### `npm run format`

**Format all code with Prettier**

```bash
prettier --write .
```

- Formats all supported files
- Consistent code style

#### `npm run format:check`

**Check formatting without changes**

```bash
prettier --check .
```

- CI-safe check
- Exits with error if formatting needed

### Type Checking

#### `npm run type-check`

**Validate TypeScript types**

```bash
tsc --noEmit
```

- Checks all TypeScript files
- No output files generated
- Reports type errors

#### `npm run type-check:watch`

**Watch mode type checking**

```bash
tsc --noEmit --watch
```

- Re-checks on file changes
- Continuous feedback

---

## 🚀 Tier 5: Deployment & CI Scripts

### Vercel

#### `npm run vercel-build`

**Vercel production build command**

```bash
prisma generate && next build
```

- Called automatically by Vercel
- Generates Prisma Client
- Builds Next.js app

#### `npm run vercel:preflight`

**Pre-deployment validation**

```bash
node scripts/vercel-preflight.js
```

- Validates environment
- Checks dependencies
- Ensures build readiness

### Build Hooks

#### `postinstall`

**Auto-runs after `npm install`**

```bash
prisma generate || echo 'Prisma generate skipped'
```

- Generates Prisma Client
- Fails gracefully in CI

#### `prebuild`

**Runs before `npm run build`**

```bash
tsc --noEmit || exit 0
```

- Type-checks in development
- Skipped in CI/Vercel

---

## 🐳 Docker Scripts (5 Core Commands)

### Basic Operations

#### `npm run docker:build`

**Build production Docker image**

```bash
docker build -t farmers-market:latest -f docker/Dockerfile .
```

#### `npm run docker:up`

**Start all services**

```bash
docker-compose up -d
```

#### `npm run docker:down`

**Stop all services**

```bash
docker-compose down
```

#### `npm run docker:logs`

**View logs from all services**

```bash
docker-compose logs -f
```

#### `npm run docker:clean`

**Clean up Docker resources**

```bash
docker-compose down -v && docker system prune -f
```

### Advanced Docker Commands

For detailed Docker operations, see [DOCKER.md](./DOCKER.md).

---

## 🤖 Advanced Testing Suites (Moved from package.json)

These are **specialized testing commands** not run in typical development:

### Visual Regression

```bash
# Run all visual tests
playwright test tests/visual --workers=6

# Update baselines after intentional changes
cross-env UPDATE_BASELINES=true playwright test tests/visual

# Test specific browser
playwright test tests/visual --project=chromium
playwright test tests/visual --project=firefox
playwright test tests/visual --project=webkit

# Mobile visual tests
playwright test tests/visual --project="Mobile Chrome" --project="Mobile Safari"

# Dark mode visual tests
cross-env THEME=dark playwright test tests/visual
```

### Load Testing

```bash
# Standard load test
k6 run tests/load/comprehensive-load-test.ts

# Specific scenarios
k6 run -e SCENARIO=smoke tests/load/comprehensive-load-test.ts
k6 run -e SCENARIO=spike tests/load/comprehensive-load-test.ts
k6 run -e SCENARIO=stress tests/load/comprehensive-load-test.ts
k6 run -e SCENARIO=soak tests/load/comprehensive-load-test.ts

# API-specific load tests
k6 run tests/load/api-stress-test.js
k6 run tests/load/marketplace-load.js
```

### Security Testing

```bash
# Full security scan
jest tests/security/security-scanner.test.ts --runInBand

# Specific security tests
jest tests/security --runInBand --testNamePattern="SQL Injection"
jest tests/security --runInBand --testNamePattern="XSS"
jest tests/security --runInBand --testNamePattern="CSRF"
jest tests/security --runInBand --testNamePattern="Security Headers"

# Penetration testing
playwright test tests/security/penetration-tests.ts --workers=1
```

### Chaos Engineering

```bash
# All chaos tests
playwright test tests/chaos --workers=4

# Specific chaos scenarios
playwright test tests/chaos --grep="Network Disruption"
playwright test tests/chaos --grep="Server Failures"
playwright test tests/chaos --grep="Database Failures"
playwright test tests/chaos --grep="Cascading Failures"
playwright test tests/chaos --grep="Traffic Spikes"
```

### Mobile & PWA Testing

```bash
# Mobile navigation tests
playwright test tests/mobile/mobile-navigation.spec.ts --workers=4

# Mobile performance
playwright test tests/mobile/mobile-performance.spec.ts --workers=4

# PWA functionality
playwright test tests/mobile/pwa-functionality.spec.ts --workers=2

# Specific mobile devices
playwright test tests/mobile --project="Mobile Safari"  # iOS
playwright test tests/mobile --project="Mobile Chrome"  # Android
```

### Accessibility (A11y)

```bash
# All accessibility tests
playwright test tests/accessibility --workers=6

# Specific a11y tests
playwright test tests/accessibility/component-accessibility.spec.ts
playwright test tests/accessibility/page-accessibility.spec.ts
playwright test tests/accessibility/keyboard-navigation.spec.ts

# WCAG compliance
playwright test tests/accessibility --grep="WCAG"

# ARIA validation
playwright test tests/accessibility --grep="ARIA"

# Contrast checking
playwright test tests/accessibility --grep="contrast"
```

### Performance Benchmarking

```bash
# Run performance benchmarks
tsx tests/load/performance-benchmark.ts --run

# Set baseline
tsx tests/load/performance-benchmark.ts --baseline

# Compare against baseline
tsx tests/load/performance-benchmark.ts --compare

# View historical data
tsx tests/load/performance-benchmark.ts --history
```

---

## 🔧 Internal Tooling Scripts (Moved to Documentation)

These are **specialized internal tools** not run in typical workflows:

### Code Maintenance

```bash
# Repository cleanup
bash scripts/maintenance/godclean.sh
bash scripts/maintenance/godclean.sh --dry-run  # Preview only

# Repository analysis
ts-node scripts/maintenance/quantum-repository-surgeon.ts
ts-node scripts/maintenance/quantum-repository-surgeon.ts --dry-run

# Audit console.log statements
bash scripts/audit-console-logs.sh

# Generate TODO inventory
bash scripts/generate-todo-inventory.sh
```

### Validation & Diagnostics

```bash
# Platform validation
tsx scripts/validate-platform.ts

# Error detection
tsx scripts/detect-errors.ts

# Quick validation
tsc --noEmit && npm test

# API diagnostics
tsx scripts/diagnose-api-issue.ts

# Database verification
tsx scripts/verify-db.ts
```

### Monitoring & Health Checks

```bash
# Website health monitor
tsx scripts/monitoring/enhanced-website-monitor.ts

# Deployment health check
tsx scripts/deployment-health-monitor.ts --full

# Workflow monitoring
tsx scripts/workflow-monitor.ts all
tsx scripts/workflow-monitor.ts critical
tsx scripts/workflow-monitor.ts health
```

### OpenAPI Documentation

```bash
# Convert YAML to JSON
node scripts/convert-openapi.js

# Validate OpenAPI spec
npx @redocly/cli lint docs/api/swagger/openapi.yaml

# Build complete API docs
npm run openapi:convert && npm run openapi:validate
```

---

## 🧹 Cleanup & Maintenance

### Cache Cleanup

```bash
# Clean test caches
npm run clean:cache
# Equivalent to: rm -rf .jest-cache coverage playwright-report

# Clean all caches including node_modules cache
npm run clean:all
# Equivalent to: rm -rf .jest-cache coverage playwright-report node_modules/.cache
```

### Dependency Management

```bash
# Audit dependencies
npm audit --audit-level=moderate

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Install with legacy peer deps (required)
npm install --legacy-peer-deps
```

---

## 📋 CI/CD Integration

### Scripts Used in GitHub Actions

**ci.yml workflow uses**:

- `npm run lint`
- `npm run format:check`
- `npm run type-check`
- `npm test`
- `npm run test:coverage`

**e2e-tests.yml workflow uses**:

- `npm run test:e2e`
- `npm run test:visual` (optional)
- `npm run test:mobile` (optional)

**Vercel deployment uses**:

- `npm run vercel-build` (or just `npm run build`)

### Running CI Checks Locally

```bash
# Run all CI checks
npm run lint && npm run format:check && npm run type-check && npm test

# Shorthand (if quality script exists)
npm run quality
```

---

## 🎓 Learning Resources

### Next.js 16 + Turbopack

- [Next.js Documentation](https://nextjs.org/docs)
- [Turbopack Documentation](https://turbo.build/pack/docs)

### Testing

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Documentation](https://k6.io/docs/)

### Database

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🚨 Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Prisma Client errors

```bash
npx prisma generate
```

### Port 3001 already in use

```bash
# Windows
npx kill-port 3001

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Type errors in build

```bash
npm run type-check
# Fix reported errors, then rebuild
```

### Docker issues

```bash
docker-compose down -v
docker system prune -a --volumes -f
npm run docker:build
npm run docker:up
```

---

## 📞 Support

- **Internal Documentation**: `/docs` directory
- **API Documentation**: `/docs/api/swagger`
- **GitHub Issues**: Report bugs and request features
- **Team Channel**: Discuss with team members

---

**Note**: This document is generated from the package.json cleanup initiative (January 2025). If you find scripts missing or have questions, please open an issue or contact the development team.
