# 🧪 TEST COMMANDS - QUICK REFERENCE

**Farmers Market Platform - Testing Quick Reference**  
**Last Updated**: November 15, 2024

---

## 🚀 QUICK START

```bash
# Run all passing tests
npm test -- client.test.ts

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 📋 UNIT TESTS

### Stripe Client Tests (✅ ALL PASSING)
```bash
# Run all Stripe client tests
npm test -- client.test.ts

# Run with coverage
npm test -- client.test.ts --coverage

# Watch mode
npm test -- client.test.ts --watch

# Verbose output
npm test -- client.test.ts --verbose
```

### Checkout Service Tests (⚠️ NEEDS FIXES)
```bash
# Run all checkout service tests
npm test -- checkout.service.test.ts

# Run specific test suite
npm test -- checkout.service.test.ts -t "initializeCheckout"

# Run specific test
npm test -- checkout.service.test.ts -t "should initialize checkout with valid cart"

# With coverage
npm test -- checkout.service.test.ts --coverage
```

### Run All Unit Tests
```bash
# All unit tests
npm test

# Only changed files
npm test -- --onlyChanged

# Update snapshots
npm test -- --updateSnapshot

# Bail on first failure
npm test -- --bail
```

---

## 🔗 INTEGRATION TESTS

### Payment Intent API Tests
```bash
# Run all API tests
npm test -- create-payment-intent.test.ts

# Run POST tests only
npm test -- create-payment-intent.test.ts -t "POST"

# Run GET tests only
npm test -- create-payment-intent.test.ts -t "GET"

# With verbose output
npm test -- create-payment-intent.test.ts --verbose
```

### All Integration Tests
```bash
# All API tests
npm test -- api/__tests__

# Specific API route
npm test -- checkout/__tests__
```

---

## 🎭 END-TO-END TESTS

### Checkout Flow E2E
```bash
# Run all E2E tests
npm run test:e2e

# Run checkout tests only
npx playwright test checkout-stripe-flow

# Run in headed mode (see browser)
npx playwright test checkout-stripe-flow --headed

# Run specific test
npx playwright test -g "complete full checkout flow"

# Debug mode
npx playwright test checkout-stripe-flow --debug

# Specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### E2E Test Reports
```bash
# Generate HTML report
npx playwright test --reporter=html

# Open report
npx playwright show-report

# List all tests
npx playwright test --list

# Run with UI
npx playwright test --ui
```

---

## 📊 COVERAGE REPORTS

### Generate Coverage
```bash
# Basic coverage
npm run test:coverage

# HTML report
npm test -- --coverage --coverageReporters=html

# JSON for CI
npm test -- --coverage --coverageReporters=json

# Multiple formats
npm test -- --coverage --coverageReporters=html --coverageReporters=lcov

# Open HTML report
# macOS
open coverage/index.html

# Windows
start coverage/index.html

# Linux
xdg-open coverage/index.html
```

### Coverage for Specific Files
```bash
# Stripe client only
npm test -- client.test.ts --coverage --collectCoverageFrom="src/lib/stripe/**/*.ts"

# Checkout service only
npm test -- checkout.service.test.ts --coverage --collectCoverageFrom="src/lib/services/checkout.service.ts"

# All checkout files
npm test -- --coverage --collectCoverageFrom="src/app/(customer)/checkout/**/*.{ts,tsx}"
```

---

## 🔍 DEBUGGING TESTS

### Debug Unit Tests
```bash
# Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand client.test.ts

# VS Code debug config (add to .vscode/launch.json)
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "${file}"],
  "console": "integratedTerminal"
}
```

### Debug E2E Tests
```bash
# Playwright inspector
npx playwright test checkout-stripe-flow --debug

# Step through test
npx playwright test checkout-stripe-flow --debug --headed

# Pause on failure
npx playwright test checkout-stripe-flow --headed --pause-on-failure

# Record test
npx playwright codegen http://localhost:3000/checkout
```

---

## 🛠️ MAINTENANCE COMMANDS

### Clear Caches
```bash
# Clear Jest cache
npm test -- --clearCache

# Clear Playwright cache
npx playwright cache clear

# Remove all caches
rm -rf node_modules/.cache
rm -rf .jest-cache
rm -rf .next
```

### Update Test Dependencies
```bash
# Update Jest
npm update jest ts-jest @types/jest

# Update Testing Library
npm update @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Update Playwright
npm update @playwright/test
npx playwright install
```

### Reinstall Everything
```bash
# Full reinstall
rm -rf node_modules
rm -rf .jest-cache
npm install
```

---

## 🎯 SPECIFIC TEST SCENARIOS

### Test Stripe Integration
```bash
# With test keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... npm test -- client.test.ts

# E2E with Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... npm run test:e2e
```

### Test Authentication
```bash
# Auth-related tests
npm test -- -t "authentication"
npm test -- -t "auth"

# Protected routes
npm test -- -t "requires authentication"
```

### Test Error Handling
```bash
# Error scenarios
npm test -- -t "error"
npm test -- -t "should handle"

# Edge cases
npm test -- -t "edge case"
npm test -- -t "should reject"
```

---

## 📈 CI/CD COMMANDS

### Run in CI Mode
```bash
# CI test run
CI=true npm test -- --ci --coverage --maxWorkers=2

# E2E in CI
CI=true npm run test:e2e -- --project=chromium
```

### Generate Test Report
```bash
# JUnit report
npm test -- --reporters=default --reporters=jest-junit

# JSON report
npm test -- --json --outputFile=test-results.json

# Coverage report for CI
npm test -- --coverage --coverageReporters=lcov --coverageReporters=json-summary
```

---

## 🔧 TROUBLESHOOTING COMMANDS

### When Tests Timeout
```bash
# Increase timeout
npm test -- --testTimeout=60000

# Run serially
npm test -- --runInBand
```

### When Tests Are Flaky
```bash
# Run multiple times
npm test -- --testNamePattern="flaky test" --runInBand --verbose

# Retry failed tests
npm test -- --maxWorkers=1 --onlyFailures
```

### When Coverage Is Missing
```bash
# Force coverage collection
npm test -- --coverage --collectCoverageFrom="src/**/*.{ts,tsx}" --coveragePathIgnorePatterns=[]

# Clear cache and rerun
npm test -- --clearCache
npm test -- --coverage
```

---

## 📚 COMMON PATTERNS

### Run Specific Test Files
```bash
# By name
npm test -- client.test.ts
npm test -- checkout.service.test.ts

# By pattern
npm test -- "**/stripe/**/*.test.ts"
npm test -- "**/__tests__/**/*.test.ts"

# Multiple files
npm test -- client.test.ts checkout.service.test.ts
```

### Run Tests by Description
```bash
# Match test description
npm test -- -t "should create payment"
npm test -- -t "authentication"
npm test -- -t "success"

# Regex pattern
npm test -- -t "should (create|update|delete)"
```

### Watch Mode Filters
```bash
# Watch mode
npm test -- --watch

# In watch mode, press:
# p - filter by filename pattern
# t - filter by test name pattern
# a - run all tests
# o - run only changed tests
# q - quit watch mode
```

---

## 🌟 RECOMMENDED WORKFLOWS

### Before Committing
```bash
# 1. Run changed tests
npm test -- --onlyChanged

# 2. Run linter
npm run lint

# 3. Type check
npm run type-check

# 4. If all pass, commit
git commit -m "feat: add new feature"
```

### Before Pull Request
```bash
# 1. Run all tests
npm test

# 2. Generate coverage
npm run test:coverage

# 3. Run E2E tests
npm run test:e2e

# 4. Check coverage threshold
# Should be >90%
```

### Before Deployment
```bash
# 1. Full test suite
npm test

# 2. E2E tests all browsers
npx playwright test

# 3. Performance tests
# (if implemented)

# 4. Security scan
npm audit
```

---

## 💡 PRO TIPS

### Speed Up Tests
```bash
# Use more workers (HP OMEN has 12 threads)
npm test -- --maxWorkers=10

# Skip slow tests in development
npm test -- --testPathIgnorePatterns=e2e

# Only run fast tests
npm test -- --testPathPattern="unit"
```

### Better Output
```bash
# Verbose with colors
npm test -- --verbose --colors

# Show test structure
npm test -- --listTests

# Notify on completion (macOS)
npm test && osascript -e 'display notification "Tests passed!" with title "Jest"'
```

### Custom Test Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "test:unit": "jest --testPathIgnorePatterns=e2e",
    "test:integration": "jest api/__tests__",
    "test:watch": "jest --watch",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:stripe": "jest stripe",
    "test:checkout": "jest checkout"
  }
}
```

---

## 📞 GETTING HELP

### Documentation
- Jest: https://jestjs.io/docs/cli
- Playwright: https://playwright.dev/docs/test-cli
- Testing Library: https://testing-library.com/docs/

### Internal Docs
- `CHECKOUT_TESTING_GUIDE.md` - Comprehensive guide
- `SESSION_SUMMARY_TESTING_IMPLEMENTATION.md` - Implementation details
- `STRIPE_INTEGRATION_COMPLETE.md` - Stripe testing

### Test Status
```bash
# Check what tests exist
npx jest --listTests

# Check test coverage
npm run test:coverage

# See what's passing
npm test -- --verbose
```

---

## 🎯 CURRENT STATUS

```bash
# ✅ PASSING
npm test -- client.test.ts              # 34/34 tests

# ⚠️ NEEDS FIXES
npm test -- checkout.service.test.ts    # 14/36 tests

# ✅ READY TO RUN
npm test -- create-payment-intent.test.ts
npx playwright test checkout-stripe-flow
```

---

**Last Updated**: November 15, 2024  
**Maintained by**: Development Team  
**Questions?**: See `CHECKOUT_TESTING_GUIDE.md`
