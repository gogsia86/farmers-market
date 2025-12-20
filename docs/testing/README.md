# 🧪 Testing Documentation Hub

> **Divine Agricultural Testing Excellence**  
> Comprehensive testing documentation for the Farmers Market Platform

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Documentation Structure](#documentation-structure)
4. [Testing Types](#testing-types)
5. [Running Tests](#running-tests)
6. [Test Commands Reference](#test-commands-reference)
7. [Coverage Reports](#coverage-reports)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Additional Resources](#additional-resources)

---

## 🎯 Overview

This directory contains all testing documentation for the Farmers Market Platform. Our testing strategy ensures **divine agricultural quality** through comprehensive test coverage across multiple layers:

- **Unit Tests** - Individual function and component testing
- **Integration Tests** - Service and API interaction testing
- **E2E Tests** - Complete user workflow testing
- **Performance Tests** - Load testing and optimization
- **Accessibility Tests** - WCAG 2.1 AA compliance
- **Visual Regression Tests** - UI consistency validation
- **Security Tests** - Authentication and authorization validation

### Current Test Coverage

```
Overall Coverage: ~80%+
├── Statements: 80%+
├── Branches: 75%+
├── Functions: 80%+
└── Lines: 80%+
```

### Tech Stack

```yaml
unit_testing: Jest + Vitest
component_testing: React Testing Library
e2e_testing: Playwright
performance_testing: k6, Artillery
accessibility_testing: axe-core, Pa11y
visual_testing: Playwright Visual Comparisons
api_testing: Supertest
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Ensure you have Node.js 18+ installed
node --version

# Install dependencies
npm install

# Set up test environment
cp .env.example .env.test
```

### Run All Tests

```bash
# Run full test suite
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Run Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Load tests
npm run test:load

# Accessibility tests
npm run test:a11y
```

---

## 📁 Documentation Structure

```
docs/testing/
├── README.md (you are here)
│
├── guides/
│   ├── cart-testing-guide.md           # Shopping cart testing
│   ├── e2e-testing-guide.md            # End-to-end testing guide
│   ├── payment-manual-testing-guide.md # Payment flow testing
│   ├── test-setup-guide.md             # Initial test setup
│   └── testing-guide.md                # General testing principles
│
├── quick-reference/
│   ├── advanced-testing-quick-reference.md  # Advanced patterns
│   ├── e2e-quick-reference.md               # E2E cheat sheet
│   ├── load-testing-quick-reference.md      # Load testing commands
│   ├── npm-scripts-day-18.md                # NPM test scripts (Day 18)
│   ├── npm-scripts-day-20.md                # NPM test scripts (Day 20)
│   ├── stripe-testing-commands.md           # Stripe integration tests
│   ├── stripe-testing-commands-now.md       # Updated Stripe commands
│   ├── stripe-testing-now.md                # Stripe testing guide
│   ├── test-commands.md                     # All test commands
│   └── testing-quick-reference.md           # General quick reference
│
├── daily-progress/
│   ├── day-13-load-testing-performance.md      # Load testing milestone
│   ├── day-16-accessibility-testing-summary.md # Accessibility milestone
│   ├── day-18-advanced-testing-complete.md     # Advanced testing milestone
│   ├── day-18-file-structure.md                # Day 18 structure
│   ├── day-19-quick-reference.md               # Day 19 reference
│   ├── day-19-real-device-chaos-complete.md    # Real device testing
│   ├── day-20-ai-visual-testing-complete.md    # Visual testing milestone
│   ├── day-20-deliverables.md                  # Day 20 deliverables
│   └── day-20-quick-reference.md               # Day 20 reference
│
├── phase-progress/
│   ├── e2e-improvements-summary.md          # E2E improvements tracking
│   ├── e2e-testing-action-plan.md           # E2E action plan
│   ├── phase-2-customer-features-plan.md    # Phase 2 planning
│   ├── phase-2-progress-summary.md          # Phase 2 progress
│   ├── phase-2-quick-start.md               # Phase 2 quick start
│   └── testing-progress-summary.md          # Overall progress
│
├── reports/
│   ├── master-test-report.md                   # Comprehensive test report
│   ├── prisma-7-phase-5-testing-report.md      # Prisma 7 migration testing
│   ├── prisma-7-testing-dashboard.md           # Prisma 7 test dashboard
│   ├── skipped-tests-analysis.md               # Skipped tests tracking
│   ├── test-analysis-final.md                  # Final test analysis
│   └── test-enablement-report.md               # Test enablement tracking
│
└── archive/
    └── old-guides/                             # Historical documentation
        ├── geocoding-service-test-fix.md
        ├── mvp-bot-fixes-applied.md
        ├── mvp-bot-fixes-required.md
        ├── ready-to-test-now.md
        ├── simplified-performance-testing.md
        ├── test-results-historical.txt
        ├── test-setup-readme.md
        ├── testing.md
        └── testing-session-progress.txt
```

---

## 🧬 Testing Types

### 1. Unit Tests

**Location**: `src/**/__tests__/`, `tests/unit/`

**Purpose**: Test individual functions, components, and utilities in isolation.

**Example**:

```typescript
// src/lib/__tests__/validation.test.ts
import { validateEmail } from "@/lib/validation";

describe("validateEmail", () => {
  it("should validate correct email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("should reject invalid email addresses", () => {
    expect(validateEmail("invalid-email")).toBe(false);
  });
});
```

**Run**:

```bash
npm run test:unit
```

### 2. Integration Tests

**Location**: `tests/integration/`, `tests/api/`

**Purpose**: Test interactions between services, APIs, and database operations.

**Example**:

```typescript
// tests/integration/farm.service.test.ts
import { farmService } from "@/lib/services/farm.service";
import { database } from "@/lib/database";

describe("FarmService", () => {
  it("should create a farm with valid data", async () => {
    const farm = await farmService.createFarm({
      name: "Test Farm",
      location: { address: "123 Farm Rd" },
    });

    expect(farm).toBeDefined();
    expect(farm.name).toBe("Test Farm");
  });
});
```

**Run**:

```bash
npm run test:integration
```

### 3. End-to-End Tests

**Location**: `tests/e2e/`

**Purpose**: Test complete user workflows from UI to database.

**Example**:

```typescript
// tests/e2e/customer-journey.spec.ts
import { test, expect } from "@playwright/test";

test("customer can browse farms and add products to cart", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Browse Farms");
  await expect(page).toHaveURL("/farms");

  await page.click('[data-testid="farm-card"]:first-child');
  await page.click('[data-testid="add-to-cart"]');

  await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");
});
```

**Run**:

```bash
npm run test:e2e
```

### 4. Performance Tests

**Location**: `tests/load/`, `tests/performance/`

**Purpose**: Test system performance under load, measure response times.

**Run**:

```bash
npm run test:load
npm run test:perf
```

See: [load-testing-quick-reference.md](quick-reference/load-testing-quick-reference.md)

### 5. Accessibility Tests

**Location**: `tests/accessibility/`

**Purpose**: Ensure WCAG 2.1 AA compliance and keyboard navigation.

**Run**:

```bash
npm run test:a11y
```

See: [day-16-accessibility-testing-summary.md](daily-progress/day-16-accessibility-testing-summary.md)

### 6. Visual Regression Tests

**Location**: `tests/visual/`

**Purpose**: Detect unintended UI changes through screenshot comparisons.

**Run**:

```bash
npm run test:visual
```

See: [day-20-ai-visual-testing-complete.md](daily-progress/day-20-ai-visual-testing-complete.md)

### 7. Security Tests

**Location**: `tests/security/`

**Purpose**: Test authentication, authorization, and security vulnerabilities.

**Run**:

```bash
npm run test:security
```

---

## 🏃 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (re-run on changes)
npm run test:watch

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Farm"
```

### CI/CD Testing

```bash
# Run CI test suite (no watch, with coverage)
npm run test:ci

# Pre-deploy validation
npm run validate
```

### Test Database

```bash
# Reset test database
npm run db:reset:test

# Seed test data
npm run db:seed:test

# Run migrations on test DB
npm run db:migrate:test
```

### Debugging Tests

```bash
# Run tests in debug mode
npm run test:debug

# Run single test file with debugger
node --inspect-brk node_modules/.bin/jest path/to/test.test.ts

# Playwright debug mode
npm run test:e2e:debug
```

---

## 📚 Test Commands Reference

### Complete Command List

For a comprehensive list of all test commands, see:

- [test-commands.md](quick-reference/test-commands.md) - All available commands
- [testing-quick-reference.md](quick-reference/testing-quick-reference.md) - Most used commands
- [npm-scripts-day-20.md](quick-reference/npm-scripts-day-20.md) - Latest NPM scripts

### Most Used Commands

```bash
# Development
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage

# Specific Test Types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e           # E2E tests
npm run test:e2e:ui        # E2E with UI

# CI/CD
npm run test:ci            # CI test suite
npm run validate           # Pre-deploy validation

# Coverage
npm run coverage:open      # Open coverage report
npm run coverage:ci        # Generate coverage for CI

# Performance
npm run test:load          # Load tests
npm run test:perf          # Performance benchmarks

# Accessibility
npm run test:a11y          # Accessibility tests

# Visual
npm run test:visual        # Visual regression
npm run test:visual:update # Update baselines
```

---

## 📊 Coverage Reports

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open in browser
npm run coverage:open
```

### Coverage Locations

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Format**: `coverage/lcov.info`
- **JSON Format**: `coverage/coverage-final.json`

### Coverage Thresholds

Configured in `jest.config.js` and `vitest.config.ts`:

```javascript
coverageThreshold: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  }
}
```

### CI Coverage Reports

Coverage reports are automatically generated in CI and uploaded to:

- GitHub Actions artifacts
- Codecov (if configured)
- SonarQube (if configured)

---

## 🎯 Best Practices

### 1. Test Naming

```typescript
// ✅ GOOD - Descriptive test names
describe("FarmService", () => {
  describe("createFarm", () => {
    it("should create a farm with valid data", async () => {
      // Test implementation
    });

    it("should throw ValidationError when farm name is too short", async () => {
      // Test implementation
    });

    it("should assign PENDING_VERIFICATION status to new farms", async () => {
      // Test implementation
    });
  });
});

// ❌ BAD - Vague test names
describe("FarmService", () => {
  it("test1", () => {
    // What does this test?
  });

  it("should work", () => {
    // Too generic
  });
});
```

### 2. Test Organization

```typescript
// ✅ GOOD - Arrange, Act, Assert pattern
it("should create a farm with valid data", async () => {
  // Arrange - Set up test data
  const farmData = {
    name: "Test Farm",
    location: { address: "123 Farm Rd" },
  };

  // Act - Execute the function
  const farm = await farmService.createFarm(farmData);

  // Assert - Verify results
  expect(farm).toBeDefined();
  expect(farm.name).toBe("Test Farm");
  expect(farm.status).toBe("PENDING_VERIFICATION");
});
```

### 3. Test Isolation

```typescript
// ✅ GOOD - Each test is independent
describe("FarmService", () => {
  beforeEach(async () => {
    // Reset database for each test
    await database.$executeRaw`TRUNCATE TABLE "Farm" CASCADE`;
  });

  it("should create a farm", async () => {
    const farm = await farmService.createFarm(testData);
    expect(farm).toBeDefined();
  });

  it("should find farms by owner", async () => {
    await farmService.createFarm(testData);
    const farms = await farmService.findFarmsByOwner(ownerId);
    expect(farms).toHaveLength(1);
  });
});
```

### 4. Mock External Services

```typescript
// ✅ GOOD - Mock external APIs
import { geocodingService } from "@/lib/services/geocoding.service";

jest.mock("@/lib/services/geocoding.service");

describe("FarmService", () => {
  it("should geocode farm address", async () => {
    // Mock the geocoding service
    (geocodingService.geocode as jest.Mock).mockResolvedValue({
      lat: 40.7128,
      lng: -74.006,
    });

    const farm = await farmService.createFarm(farmData);

    expect(geocodingService.geocode).toHaveBeenCalledWith(
      farmData.location.address,
    );
    expect(farm.location.coordinates).toEqual({ lat: 40.7128, lng: -74.006 });
  });
});
```

### 5. Test Data Factories

```typescript
// ✅ GOOD - Use factories for test data
// tests/factories/farm.factory.ts
export const createTestFarm = (overrides = {}) => ({
  name: "Test Farm",
  description: "A test farm",
  location: {
    address: "123 Farm Rd",
    city: "Farmville",
    state: "CA",
    zip: "12345",
  },
  ...overrides,
});

// Usage in tests
it("should create a farm", async () => {
  const farmData = createTestFarm({ name: "Custom Farm" });
  const farm = await farmService.createFarm(farmData);
  expect(farm.name).toBe("Custom Farm");
});
```

### 6. Async Testing

```typescript
// ✅ GOOD - Proper async/await usage
it("should create a farm asynchronously", async () => {
  const farm = await farmService.createFarm(farmData);
  expect(farm).toBeDefined();
});

// ❌ BAD - Missing await
it("should create a farm", () => {
  const farm = farmService.createFarm(farmData); // This returns a Promise!
  expect(farm).toBeDefined(); // This will fail
});
```

### 7. Error Testing

```typescript
// ✅ GOOD - Test error conditions
it("should throw ValidationError for invalid data", async () => {
  const invalidData = { name: "AB" }; // Too short

  await expect(farmService.createFarm(invalidData)).rejects.toThrow(
    ValidationError,
  );
});

// ✅ ALSO GOOD - Detailed error assertions
it("should throw detailed validation error", async () => {
  try {
    await farmService.createFarm(invalidData);
    fail("Expected ValidationError to be thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toContain("Farm name must be at least 3 characters");
    expect(error.field).toBe("name");
  }
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Tests Failing Locally But Pass in CI

**Cause**: Different environment variables or database state.

**Solution**:

```bash
# Ensure test environment is set up correctly
cp .env.example .env.test

# Reset test database
npm run db:reset:test

# Clear Jest cache
npm run test:clear-cache
```

#### 2. Flaky E2E Tests

**Cause**: Race conditions, network timing issues.

**Solution**:

```typescript
// Use proper waits in Playwright
await page.waitForSelector('[data-testid="farm-card"]');
await page.waitForLoadState("networkidle");

// Increase timeout for slow operations
test.setTimeout(30000);
```

#### 3. Coverage Not Generated

**Cause**: Incorrect configuration or missing files.

**Solution**:

```bash
# Verify coverage configuration
cat jest.config.js | grep coverage

# Run with verbose output
npm run test:coverage -- --verbose
```

#### 4. Out of Memory Errors

**Cause**: Large test suite, insufficient Node memory.

**Solution**:

```bash
# Increase Node memory
export NODE_OPTIONS=--max_old_space_size=4096

# Or add to package.json scripts
"test": "NODE_OPTIONS=--max_old_space_size=4096 jest"
```

#### 5. Database Connection Issues

**Cause**: Test database not running or wrong connection string.

**Solution**:

```bash
# Check DATABASE_URL in .env.test
cat .env.test | grep DATABASE_URL

# Ensure test database exists
npm run db:create:test

# Run migrations
npm run db:migrate:test
```

### Getting Help

- **Check Guides**: See [guides/](guides/) for detailed testing guides
- **Quick Reference**: See [quick-reference/](quick-reference/) for command cheat sheets
- **Reports**: See [reports/](reports/) for test analysis and coverage reports
- **Team**: Ask in `#testing` Slack channel or create GitHub issue

---

## 📖 Additional Resources

### Internal Documentation

- **[Testing Guide](guides/testing-guide.md)** - Comprehensive testing principles
- **[E2E Testing Guide](guides/e2e-testing-guide.md)** - End-to-end testing details
- **[Cart Testing Guide](guides/cart-testing-guide.md)** - Shopping cart testing
- **[Payment Testing Guide](guides/payment-manual-testing-guide.md)** - Payment flow testing
- **[Master Test Report](reports/master-test-report.md)** - Complete test status

### Daily Progress

Track testing milestones:

- [Day 13: Load Testing](daily-progress/day-13-load-testing-performance.md)
- [Day 16: Accessibility](daily-progress/day-16-accessibility-testing-summary.md)
- [Day 18: Advanced Testing](daily-progress/day-18-advanced-testing-complete.md)
- [Day 19: Real Device Testing](daily-progress/day-19-real-device-chaos-complete.md)
- [Day 20: Visual Testing](daily-progress/day-20-ai-visual-testing-complete.md)

### Phase Progress

Track feature testing progress:

- [Phase 2 Progress](phase-progress/phase-2-progress-summary.md)
- [E2E Improvements](phase-progress/e2e-improvements-summary.md)
- [Testing Progress Summary](phase-progress/testing-progress-summary.md)

### External Resources

- **[Jest Documentation](https://jestjs.io/)** - Unit testing framework
- **[Vitest Documentation](https://vitest.dev/)** - Vite-native testing
- **[Playwright Documentation](https://playwright.dev/)** - E2E testing
- **[React Testing Library](https://testing-library.com/react)** - Component testing
- **[k6 Documentation](https://k6.io/docs/)** - Load testing
- **[axe-core](https://github.com/dequelabs/axe-core)** - Accessibility testing

---

## 🎓 Learning Path

### For New Team Members

1. **Start Here**: Read this README
2. **Setup**: Follow [test-setup-guide.md](guides/test-setup-guide.md)
3. **Basics**: Study [testing-guide.md](guides/testing-guide.md)
4. **Practice**: Run example tests in `tests/example.test.ts`
5. **Write Tests**: Start with unit tests for new features
6. **Advanced**: Progress to integration and E2E tests

### For Experienced Developers

1. **Quick Reference**: Use [testing-quick-reference.md](quick-reference/testing-quick-reference.md)
2. **Advanced Patterns**: See [advanced-testing-quick-reference.md](quick-reference/advanced-testing-quick-reference.md)
3. **Performance**: Review [load-testing-quick-reference.md](quick-reference/load-testing-quick-reference.md)
4. **Reports**: Check [master-test-report.md](reports/master-test-report.md) for current status

---

## 📈 Current Status

### Test Metrics (Last Updated: Dec 2024)

```
Total Tests: 500+
├── Unit Tests: 300+
├── Integration Tests: 100+
├── E2E Tests: 50+
├── Performance Tests: 25+
├── Accessibility Tests: 20+
└── Visual Tests: 15+

Test Coverage: 80%+
Test Success Rate: 95%+
Average Test Duration: 2-3 minutes
CI/CD Pipeline: Fully Automated
```

### Recent Achievements

- ✅ Achieved 80%+ test coverage
- ✅ Implemented comprehensive E2E test suite
- ✅ Added load testing with k6
- ✅ Integrated accessibility testing
- ✅ Set up visual regression testing
- ✅ Automated CI/CD test pipeline
- ✅ Implemented real device testing

### Upcoming Improvements

- 🎯 Increase coverage to 85%+
- 🎯 Add contract testing
- 🎯 Implement mutation testing
- 🎯 Enhance performance benchmarks
- 🎯 Add chaos engineering tests

---

## 🌟 Divine Agricultural Testing Philosophy

> _"Test with agricultural consciousness, validate with divine precision, deliver with quantum confidence."_

Our testing approach embodies:

- **Comprehensive Coverage** - Test all layers, from units to user journeys
- **Agricultural Awareness** - Understand domain-specific validation needs
- **Performance Excellence** - Optimize for HP OMEN hardware (12 threads, 64GB RAM)
- **Continuous Quality** - Automated CI/CD with instant feedback
- **Documentation** - Every test tells a story
- **Maintainability** - Clear, readable, and well-organized tests

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Production Ready  
**Maintained By**: Farmers Market Platform Team

_For questions or improvements, please contact the testing team or create a GitHub issue._
