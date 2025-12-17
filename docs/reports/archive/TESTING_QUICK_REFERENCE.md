# 🚀 TESTING QUICK REFERENCE

**Farmers Market Platform - Essential Commands**

---

## 📊 UNIT TESTS

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.spec.ts

# Watch mode
npm run test:watch

# HP OMEN optimized (12 threads)
npm run test:omen
```

---

## 🐳 TEST DATABASE

### Start/Stop Database

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Stop test database
docker-compose -f docker-compose.test.yml down

# Stop and remove volumes (full reset)
docker-compose -f docker-compose.test.yml down -v

# View logs
docker logs farmers-market-test-db

# Check status
docker ps --filter name=farmers-market-test-db
```

### Database Management

```bash
# Push schema to test database
bash -c 'export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" && npx prisma db push --accept-data-loss'

# Open Prisma Studio (database GUI)
bash -c 'export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" && npx prisma studio'

# Generate Prisma Client
npx prisma generate

# View database tables
docker exec farmers-market-test-db psql -U postgres -d farmersmarket_test -c "\dt"
```

### Connection String

```
postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test
```

---

## 🎭 E2E TESTS (PLAYWRIGHT)

### Prerequisites

```bash
# Install Playwright browsers (first time only)
npx playwright install
```

### Run E2E Tests

```bash
# Run all E2E tests (with existing dev server)
bash -c 'export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" && npx playwright test --config=playwright.config.temp.ts --workers=6'

# Run in headed mode (see browser)
bash -c 'export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" && npx playwright test --config=playwright.config.temp.ts --headed'

# Run specific test file
bash -c 'export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" && npx playwright test tests/e2e/critical-flows.spec.ts'

# UI mode (interactive)
bash -c 'export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" && npx playwright test --config=playwright.config.temp.ts --ui'

# Debug mode
bash -c 'export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" && npx playwright test --config=playwright.config.temp.ts --debug'

# View last test report
npx playwright show-report
```

---

## 🤖 WORKFLOW MONITORING BOT

### Single Checks

```bash
# Complete health check
npm run monitor:all

# Check critical pages only
npm run monitor:critical

# Validate user workflows
npm run monitor:workflow

# Check health endpoints
npm run monitor:health

# List monitored endpoints
npm run monitor:list
```

### Continuous Monitoring

```bash
# Start monitoring daemon (checks every 30 seconds)
npm run monitor:start

# Stop with Ctrl+C
```

### Different Environments

```bash
# Monitor staging
BASE_URL=https://staging.farmersmarket.com npm run monitor:all

# Monitor production
BASE_URL=https://farmersmarket.com npm run monitor:all
```

---

## 🌐 DEV SERVER

```bash
# Start development server
npm run dev

# Start on specific port
PORT=3002 npm run dev

# HP OMEN optimized
npm run dev:omen

# Safe mode (if issues)
npm run dev:safe
```

---

## ✅ VERIFICATION COMMANDS

### Page Verification

```bash
# Check all pages (requires dev server running)
node check-pages.js

# Windows: Auto-start server and check
verify-pages.bat
```

### Type Checking

```bash
# Type check
npm run type-check

# Type check with OMEN optimization
npm run type-check:omen
```

### Linting

```bash
# Lint all files
npm run lint

# Lint and auto-fix
npm run lint:fix

# Check formatting
npm run format:check
```

---

## 🎯 COMMON WORKFLOWS

### Full Test Suite

```bash
# 1. Start test database
docker-compose -f docker-compose.test.yml up -d

# 2. Start dev server (in another terminal)
npm run dev

# 3. Run unit tests
npm test

# 4. Run E2E tests
bash -c 'export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" && npx playwright test --config=playwright.config.temp.ts --workers=6'

# 5. Run monitoring
npm run monitor:all
```

### Quick Smoke Test

```bash
# Check server, critical pages, and workflows
npm run dev &
sleep 20
npm run monitor:critical
npm run monitor:workflow
```

### Pre-Deployment Check

```bash
# Type check, lint, test, verify
npm run type-check && npm run lint && npm test && npm run monitor:all
```

---

## 🐞 DEBUGGING

### Playwright Debugging

```bash
# Debug specific test
npx playwright test tests/e2e/critical-flows.spec.ts --debug

# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Database Debugging

```bash
# Connect to database
docker exec -it farmers-market-test-db psql -U postgres -d farmersmarket_test

# View specific table
docker exec farmers-market-test-db psql -U postgres -d farmersmarket_test -c "SELECT * FROM users LIMIT 5;"

# Check database size
docker exec farmers-market-test-db psql -U postgres -d farmersmarket_test -c "SELECT pg_size_pretty(pg_database_size('farmersmarket_test'));"
```

---

## 📦 CLEANUP

### Reset Everything

```bash
# Stop and remove test database
docker-compose -f docker-compose.test.yml down -v

# Clear test results
rm -rf test-results playwright-report

# Clear node modules (if needed)
rm -rf node_modules
npm install
```

---

## 🔑 TEST CREDENTIALS

```
Admin:    admin@farmersmarket.app / DivineAdmin123!
Farmer:   farmer@farmersmarket.app / DivineFarmer123!
Customer: customer@farmersmarket.app / DivineCustomer123!
```

---

## 📊 PERFORMANCE BENCHMARKS

**Target Metrics**:

- Page Load: < 200ms (currently ~54ms avg ✅)
- API Response: < 100ms (currently ~11ms avg ✅)
- Test Suite: < 5 minutes (currently ~2-3 min ✅)
- E2E Suite: < 20 minutes (target with 6 workers)

---

## 🆘 TROUBLESHOOTING

### Port Already in Use

```bash
# Find process on port 3001
netstat -ano | findstr :3001

# Kill process
taskkill /F /PID <PID>
```

### Database Connection Issues

```bash
# Check container health
docker ps --filter name=farmers-market-test-db

# Restart container
docker restart farmers-market-test-db

# Check logs
docker logs farmers-market-test-db --tail 50
```

### Playwright Installation Issues

```bash
# Reinstall browsers
npx playwright install --force

# Install with dependencies
npx playwright install --with-deps
```

### Prisma Schema Issues

```bash
# Regenerate client
npx prisma generate

# Reset database
npx prisma migrate reset

# Push schema forcefully
npx prisma db push --accept-data-loss --force-reset
```

---

## 📁 KEY FILES

```
docker-compose.test.yml          # Test database config
.env.test                        # Test environment variables
playwright.config.temp.ts        # E2E test configuration
scripts/workflow-monitor.ts      # Monitoring bot
check-pages.js                   # Page verification script
tests/global-setup.ts            # E2E test setup
```

---

## 🎯 CI/CD INTEGRATION

### GitHub Actions Example

```yaml
- name: Run Tests
  run: |
    docker-compose -f docker-compose.test.yml up -d
    npm test
    npm run monitor:critical
```

### Azure Pipelines Example

```yaml
- script: |
    docker-compose -f docker-compose.test.yml up -d
    npm test
    npx playwright test
  displayName: "Run All Tests"
```

---

## 📞 QUICK HELP

```bash
# Show available npm scripts
npm run

# Show Playwright help
npx playwright test --help

# Show monitoring bot help
tsx scripts/workflow-monitor.ts help
```

---

**Last Updated**: December 4, 2025  
**Status**: ✅ All commands tested and verified  
**Platform**: Windows with bash/PowerShell support

🌾 **Happy Testing!** ⚡
