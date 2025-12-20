# 🧪 Testing Documentation

> **Comprehensive Testing Guide**
>
> Everything you need to write, run, and maintain tests for the Farmers Market Platform.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Patterns](#test-patterns)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

---

## 🎯 Overview

The Farmers Market Platform maintains **enterprise-grade test coverage** (>80%) across all layers of the application, ensuring reliability, performance, and agricultural consciousness.

### Testing Philosophy

```
┌─────────────────────────────────────────────────────────┐
│  "Test early, test often, test everything"             │
│  Every feature ships with comprehensive tests           │
└─────────────────────────────────────────────────────────┘
```

### Current Test Metrics

```yaml
Overall Coverage: 82%
├── Unit Tests: 1,247 tests (passing)
├── Integration Tests: 342 tests (passing)
├── E2E Tests: 87 scenarios (passing)
├── Performance Tests: 23 benchmarks (passing)
└── Total Execution Time: ~5 minutes
```

### Technology Stack

| Test Type         | Framework             | Purpose                          |
| ----------------- | --------------------- | -------------------------------- |
| **Unit**          | Jest + Vitest         | Functions, utilities, components |
| **Component**     | React Testing Library | React component testing          |
| **Integration**   | Jest + Supertest      | API routes, services             |
| **E2E**           | Playwright            | User workflows                   |
| **Performance**   | k6, Lighthouse        | Load & speed testing             |
| **Accessibility** | axe-core              | WCAG compliance                  |
| **Visual**        | Playwright Snapshots  | UI consistency                   |

---

## 🎨 Testing Strategy

### Test Pyramid

```
                    ┌──────────┐
                    │   E2E    │  ← Few (slow, expensive)
                    │  Tests   │
                ┌───┴──────────┴───┐
                │   Integration    │  ← Some (medium speed)
                │      Tests       │
            ┌───┴──────────────────┴───┐
            │      Unit Tests          │  ← Many (fast, cheap)
            │   (70% of test suite)    │
        ┌───┴──────────────────────────┴───┐
        │      Static Analysis             │
        │  (TypeScript, ESLint, Prettier)  │
        └──────────────────────────────────┘
```

### Coverage Strategy

```typescript
// ✅ COMPREHENSIVE COVERAGE TARGETS

Unit Tests (70% of suite):
  - Pure functions: 100% coverage
  - Utility functions: 100% coverage
  - Services: 95% coverage
  - Repositories: 90% coverage
  - Components: 85% coverage

Integration Tests (25% of suite):
  - API routes: 100% of endpoints
  - Service integration: Critical paths
  - Database operations: All CRUD operations
  - Authentication flows: All scenarios

E2E Tests (5% of suite):
  - Critical user journeys: 100%
  - Happy paths: All features
  - Error scenarios: Critical failures
  - Cross-browser: Chrome, Firefox, Safari
```

---

## 🧪 Test Types

### 1. Unit Tests

**Purpose**: Test individual functions, methods, and components in isolation.

**Location**: `tests/unit/` or `__tests__/` directories

**Example**:

```typescript
// lib/utils/__tests__/date.test.ts
import { formatDate, parseDate } from "../date";

describe("Date Utils", () => {
  describe("formatDate", () => {
    it("should format date in ISO format", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      expect(formatDate(date)).toBe("2024-01-15");
    });

    it("should handle invalid dates", () => {
      expect(() => formatDate(null as any)).toThrow("Invalid date");
    });
  });

  describe("parseDate", () => {
    it("should parse ISO date string", () => {
      const result = parseDate("2024-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
    });
  });
});
```

### 2. Component Tests

**Purpose**: Test React components with user interactions.

**Location**: `components/**/__tests__/`

**Example**:

```typescript
// components/features/farm/__tests__/FarmCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FarmCard } from '../FarmCard';

describe('FarmCard', () => {
  const mockFarm = {
    id: '1',
    name: 'Green Valley Farm',
    description: 'Organic vegetables',
    status: 'ACTIVE'
  };

  it('should render farm information', () => {
    render(<FarmCard farm={mockFarm} />);

    expect(screen.getByText('Green Valley Farm')).toBeInTheDocument();
    expect(screen.getByText('Organic vegetables')).toBeInTheDocument();
  });

  it('should call onFavorite when favorite button clicked', async () => {
    const onFavorite = jest.fn();
    render(<FarmCard farm={mockFarm} onFavorite={onFavorite} />);

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);

    expect(onFavorite).toHaveBeenCalledWith(mockFarm.id);
  });

  it('should display status badge', () => {
    render(<FarmCard farm={mockFarm} />);

    const badge = screen.getByText('ACTIVE');
    expect(badge).toHaveClass('badge-success');
  });
});
```

### 3. Integration Tests

**Purpose**: Test interaction between multiple components/services.

**Location**: `tests/integration/`

**Example**:

```typescript
// tests/integration/api/farms.test.ts
import { createMocks } from "node-mocks-http";
import { GET, POST } from "@/app/api/farms/route";
import { database } from "@/lib/database";

jest.mock("@/lib/database");

describe("Farms API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/farms", () => {
    it("should return list of farms", async () => {
      const mockFarms = [
        { id: "1", name: "Farm 1", status: "ACTIVE" },
        { id: "2", name: "Farm 2", status: "ACTIVE" },
      ];

      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);

      const { req } = createMocks({ method: "GET" });
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
    });
  });

  describe("POST /api/farms", () => {
    it("should create a new farm", async () => {
      const farmData = {
        name: "New Farm",
        description: "Test farm",
        location: { city: "Seattle", state: "WA" },
      };

      const mockFarm = { id: "1", ...farmData, status: "PENDING" };
      (database.farm.create as jest.Mock).mockResolvedValue(mockFarm);

      const { req } = createMocks({
        method: "POST",
        body: farmData,
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("New Farm");
    });

    it("should validate required fields", async () => {
      const { req } = createMocks({
        method: "POST",
        body: { name: "" }, // Invalid - name too short
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
```

### 4. E2E Tests

**Purpose**: Test complete user workflows in real browser.

**Location**: `tests/e2e/`

**Example**:

```typescript
// tests/e2e/farm-creation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Farm Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as farmer
    await page.goto("/login");
    await page.fill('[name="email"]', "farmer@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("should create a new farm successfully", async ({ page }) => {
    // Navigate to create farm page
    await page.click("text=Create Farm");
    await expect(page).toHaveURL("/dashboard/farms/create");

    // Fill in farm details
    await page.fill('[name="name"]', "Green Valley Farm");
    await page.fill('[name="description"]', "Organic vegetables and fruits");
    await page.fill('[name="location.city"]', "Seattle");
    await page.fill('[name="location.state"]', "WA");

    // Submit form
    await page.click('button:has-text("Create Farm")');

    // Verify success
    await expect(page).toHaveURL(/\/dashboard\/farms\/[a-z0-9]+/);
    await expect(page.locator("text=Green Valley Farm")).toBeVisible();
    await expect(page.locator(".toast-success")).toBeVisible();
  });

  test("should show validation errors for invalid input", async ({ page }) => {
    await page.goto("/dashboard/farms/create");

    // Try to submit without filling required fields
    await page.click('button:has-text("Create Farm")');

    // Check for validation messages
    await expect(page.locator("text=Name is required")).toBeVisible();
    await expect(page.locator("text=Location is required")).toBeVisible();
  });
});
```

### 5. Performance Tests

**Purpose**: Test application performance under load.

**Location**: `tests/performance/`

**Example**:

```javascript
// tests/performance/api-load.test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 50 }, // Ramp up to 50 users
    { duration: "3m", target: 50 }, // Stay at 50 users
    { duration: "1m", target: 100 }, // Ramp up to 100 users
    { duration: "3m", target: 100 }, // Stay at 100 users
    { duration: "1m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests < 500ms
    http_req_failed: ["rate<0.01"], // <1% error rate
  },
};

export default function () {
  const response = http.get("http://localhost:3000/api/farms");

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### 6. Accessibility Tests

**Purpose**: Ensure WCAG 2.1 AA compliance.

**Example**:

```typescript
// tests/accessibility/farm-page.test.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Farm Page Accessibility", () => {
  test("should not have accessibility violations", async ({ page }) => {
    await page.goto("/farms/farm-id-123");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/farms/farm-id-123");

    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    // Should be able to activate buttons with Enter
    await page.keyboard.press("Enter");
  });
});
```

---

## 🚀 Running Tests

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode (development)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run specific test types
pnpm test:unit           # Unit tests only
pnpm test:integration    # Integration tests only
pnpm test:e2e            # E2E tests only
pnpm test:performance    # Performance tests

# Run tests for specific file/pattern
pnpm test farm.test.ts
pnpm test --testPathPattern=farm
pnpm test --grep="Farm"

# Run tests in CI mode (no watch, no color)
pnpm test:ci

# Update snapshots
pnpm test -u
```

### Environment-Specific Testing

```bash
# Development environment
NODE_ENV=development pnpm test

# Test environment (default)
NODE_ENV=test pnpm test

# Production build testing
NODE_ENV=production pnpm build && pnpm test:e2e
```

### Parallel Testing

```bash
# Run tests in parallel (faster)
pnpm test --maxWorkers=4

# Run tests serially (debugging)
pnpm test --runInBand

# Run E2E tests in parallel across browsers
pnpm test:e2e --workers=3
```

---

## ✍️ Writing Tests

### Test File Structure

```typescript
// ✅ RECOMMENDED TEST STRUCTURE

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

describe("ComponentName / FunctionName", () => {
  // Setup
  beforeEach(() => {
    // Common setup code
  });

  afterEach(() => {
    // Cleanup
  });

  // Group related tests
  describe("method/feature name", () => {
    it("should do something specific", () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });

    it("should handle edge case", () => {
      // Test edge cases
    });

    it("should throw error for invalid input", () => {
      expect(() => functionUnderTest(null)).toThrow("Expected error");
    });
  });
});
```

### Test Naming Conventions

```typescript
// ✅ GOOD TEST NAMES - Descriptive and specific

describe("FarmService", () => {
  describe("createFarm", () => {
    it("should create a farm with valid data", () => {});
    it("should throw ValidationError when name is too short", () => {});
    it("should throw ValidationError when name is too long", () => {});
    it("should generate unique slug from farm name", () => {});
    it("should set status to PENDING_VERIFICATION by default", () => {});
    it("should associate farm with current user", () => {});
  });
});

// ❌ BAD TEST NAMES - Vague and unclear

describe("FarmService", () => {
  it("should work", () => {});
  it("test farm creation", () => {});
  it("should create farm", () => {}); // Too vague
});
```

### Arrange-Act-Assert Pattern

```typescript
// ✅ CLEAR AAA PATTERN

it("should calculate order total correctly", () => {
  // Arrange - Set up test data
  const orderItems = [
    { productId: "1", quantity: 2, price: 10.0 },
    { productId: "2", quantity: 1, price: 15.0 },
  ];
  const orderService = new OrderService();

  // Act - Execute the function
  const total = orderService.calculateTotal(orderItems);

  // Assert - Verify the result
  expect(total).toBe(35.0);
});
```

---

## 🎯 Test Patterns

### 1. Mocking Database Calls

```typescript
// ✅ MOCK DATABASE PATTERN

import { database } from "@/lib/database";

jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("FarmService", () => {
  it("should fetch farm by id", async () => {
    const mockFarm = { id: "1", name: "Test Farm" };
    (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);

    const service = new FarmService();
    const result = await service.getFarmById("1");

    expect(database.farm.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(result).toEqual(mockFarm);
  });
});
```

### 2. Testing Async Operations

```typescript
// ✅ ASYNC TEST PATTERNS

// Pattern 1: async/await
it("should fetch data asynchronously", async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// Pattern 2: resolves matcher
it("should resolve with data", () => {
  return expect(fetchData()).resolves.toBeDefined();
});

// Pattern 3: rejects matcher
it("should reject with error", () => {
  return expect(fetchInvalidData()).rejects.toThrow("Error");
});
```

### 3. Testing React Hooks

```typescript
// ✅ CUSTOM HOOK TESTING

import { renderHook, waitFor } from "@testing-library/react";
import { useFarm } from "../useFarm";

describe("useFarm", () => {
  it("should fetch farm data", async () => {
    const { result } = renderHook(() => useFarm("farm-id"));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.farm).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.farm).toBeDefined();
    expect(result.current.farm?.id).toBe("farm-id");
  });

  it("should handle errors", async () => {
    const { result } = renderHook(() => useFarm("invalid-id"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.farm).toBeNull();
  });
});
```

### 4. Testing Server Actions

```typescript
// ✅ SERVER ACTION TESTING

import { createFarm } from "@/app/actions/farm.actions";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({
    user: { id: "user-1", role: "FARMER" },
  }),
}));

describe("Farm Server Actions", () => {
  it("should create farm with valid data", async () => {
    const formData = new FormData();
    formData.append("name", "New Farm");
    formData.append("location", JSON.stringify({ city: "Seattle" }));

    const result = await createFarm(formData);

    expect(result.success).toBe(true);
    expect(result.farm?.name).toBe("New Farm");
  });

  it("should require authentication", async () => {
    jest.mocked(auth).mockResolvedValue(null);

    const result = await createFarm(new FormData());

    expect(result.success).toBe(false);
    expect(result.error).toBe("Authentication required");
  });
});
```

### 5. Testing Error Boundaries

```typescript
// ✅ ERROR BOUNDARY TESTING

import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('should catch and display errors', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
```

---

## 📊 Coverage Requirements

### Coverage Targets

```yaml
Overall: 80% minimum
├── Statements: 80%
├── Branches: 75%
├── Functions: 80%
└── Lines: 80%

Critical Paths: 100%
├── Authentication
├── Payment processing
├── Order creation
├── Data validation
└── Security functions
```

### Viewing Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html

# View in terminal
pnpm test:coverage --verbose
```

### Coverage Report Structure

```
coverage/
├── index.html              # Main coverage report
├── lcov.info              # LCOV format (for CI)
├── coverage-summary.json  # JSON summary
└── lcov-report/          # Detailed HTML reports
    ├── index.html
    └── src/
        ├── lib/
        │   └── services/
        │       └── farm.service.ts.html
        └── components/
            └── features/
                └── farm/
                    └── FarmCard.tsx.html
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Generate coverage report
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Tests Timing Out

```typescript
// ✅ INCREASE TIMEOUT
it("should complete slow operation", async () => {
  // Increase timeout to 10 seconds
  jest.setTimeout(10000);

  const result = await slowOperation();
  expect(result).toBeDefined();
}, 10000); // Or set timeout per test
```

#### 2. Database Connection Issues

```typescript
// ✅ MOCK DATABASE FOR UNIT TESTS
jest.mock("@/lib/database");

// ✅ USE TEST DATABASE FOR INTEGRATION TESTS
beforeAll(async () => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  await database.$connect();
});

afterAll(async () => {
  await database.$disconnect();
});
```

#### 3. Flaky Tests

```typescript
// ✅ USE PROPER ASYNC HANDLING
import { waitFor } from "@testing-library/react";

it("should update state", async () => {
  // Don't rely on arbitrary timeouts
  await waitFor(() => {
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });
});
```

#### 4. Module Not Found Errors

```typescript
// ✅ CONFIGURE PATH ALIASES IN JEST
// jest.config.js
module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

---

## 🌟 Best Practices

### 1. Test Independence

```typescript
// ✅ GOOD - Each test is independent
describe("FarmService", () => {
  let farmService: FarmService;

  beforeEach(() => {
    farmService = new FarmService();
    // Fresh instance for each test
  });

  it("test 1", () => {
    /* ... */
  });
  it("test 2", () => {
    /* ... */
  });
});

// ❌ BAD - Tests depend on each other
let farm: Farm;

it("should create farm", () => {
  farm = createFarm(); // Sets shared state
});

it("should update farm", () => {
  updateFarm(farm); // Depends on previous test
});
```

### 2. Test Data Factories

```typescript
// ✅ USE FACTORIES FOR TEST DATA

// tests/factories/farm.factory.ts
export function createMockFarm(overrides?: Partial<Farm>): Farm {
  return {
    id: "farm-1",
    name: "Test Farm",
    slug: "test-farm",
    description: "A test farm",
    status: "ACTIVE",
    location: { city: "Seattle", state: "WA" },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Usage
const activeFarm = createMockFarm();
const pendingFarm = createMockFarm({ status: "PENDING_VERIFICATION" });
```

### 3. Avoid Testing Implementation Details

```typescript
// ❌ BAD - Testing implementation
it('should update internal state', () => {
  const component = new Component();
  component.handleClick();
  expect(component.state.clicked).toBe(true); // Internal state
});

// ✅ GOOD - Testing behavior
it('should show success message after click', () => {
  render(<Component />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Success!')).toBeVisible();
});
```

### 4. Descriptive Error Messages

```typescript
// ✅ CUSTOM ERROR MESSAGES
expect(result.length).toBe(5, `Expected 5 farms but got ${result.length}`);

expect(response.status).toBe(
  200,
  `API returned ${response.status}: ${response.body.error}`,
);
```

### 5. Test Cleanup

```typescript
// ✅ PROPER CLEANUP
afterEach(() => {
  jest.clearAllMocks(); // Clear mock data
  cleanup(); // Unmount React components
});

afterAll(async () => {
  await database.$disconnect(); // Close connections
});
```

---

## 📚 Related Documentation

### Testing Guides

- **[Quick Reference](./quick-reference/TESTING_QUICK_REFERENCE.md)** - Common patterns
- **[Test Reports](./reports/)** - Historical test results
- **[Daily Progress](./daily-progress/)** - Testing progress tracking

### Divine Instructions

- **[Testing Divinity](../../.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md)** - Comprehensive testing guide
- **[Testing Performance Mastery](../../.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md)** - Advanced testing patterns

### Related Guides

- **[Getting Started](../getting-started/README.md)** - Setup and onboarding
- **[Architecture](../architecture/README.md)** - System architecture
- **[API Documentation](../api/README.md)** - API reference
- **[Database Guide](../database/README.md)** - Database testing

---

## 🛠️ Useful Commands

### Test Development

```bash
# Watch specific test file
pnpm test:watch FarmCard.test.tsx

# Run tests matching pattern
pnpm test --testNamePattern="should create"

# Run tests for changed files only
pnpm test --onlyChanged

# Run tests with coverage for specific file
pnpm test --coverage --collectCoverageFrom="src/lib/services/farm.service.ts"

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Coverage Analysis

```bash
# Generate and open coverage report
pnpm test:coverage && open coverage/index.html

# Check coverage thresholds
pnpm test:coverage --coverageThreshold='{"global":{"branches":80}}'

# View uncovered lines
pnpm test:coverage --verbose
```

---

## 📞 Support

### Getting Help

- **Testing Questions**: testing@farmersmarket.com
- **QA Team**: Weekly testing office hours (Wednesdays 2pm)
- **Documentation**: This guide + divine instructions

### Contributing to Tests

1. Write tests for all new features
2. Maintain >80% coverage
3. Follow naming conventions
4. Use test factories for data
5. Document complex test scenarios

---

**Last Updated**: December 2024  
**Maintained By**: QA Team  
**Status**: ✅ Active & Complete  
**Coverage**: 82% (Target: 80%+)

**Quick Navigation**:

- [← Back to Documentation Hub](../README.md)
- [→ Getting Started](../getting-started/README.md)
- [→ Architecture Guide](../architecture/README.md)
- [→ API Documentation](../api/README.md)
