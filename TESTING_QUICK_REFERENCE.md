# 🧪 Testing Quick Reference Guide

## 🚀 Quick Commands

```bash
# Kill any running dev servers (if port conflict)
npm run kill-server

# Run all tests (standard)
npm run test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run HP OMEN optimized tests (10 workers)
npm run test:omen

# Run E2E tests (requires server running)
npm run test:e2e

# Run all tests (unit + E2E)
npm run test:all
```

---

## 📦 Common Test Scenarios

### 1️⃣ Development Workflow

```bash
# Terminal 1: Watch mode for active development
npm run test:watch

# Press 'p' to filter by filename
# Press 't' to filter by test name
# Press 'a' to run all tests
# Press 'q' to quit
```

### 2️⃣ Before Committing

```bash
# Run quality checks + tests
npm run quality     # TypeScript, lint, format
npm run test        # All unit/integration tests

# Or combined
npm run prebuild    # Runs quality + builds
```

### 3️⃣ Full Test Suite

```bash
# Step 0: Clear any existing processes (if needed)
npm run kill-server

# Terminal 1: Start the dev server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e

# Or use the combined command (if server already running)
npm run test:all
```

### 4️⃣ Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
# Navigate to: coverage/lcov-report/index.html
```

---

## 🎯 Test File Patterns

### Unit Tests

```typescript
// Component test
src/components/__tests__/MyComponent.test.tsx

// Service test
src/lib/services/__tests__/my.service.test.ts

// Hook test
src/hooks/__tests__/useMyHook.test.ts

// Utility test
src/lib/utils/__tests__/myUtil.test.ts
```

### Integration Tests

```typescript
// API route test
src/app/api/__tests__/my-route.test.ts

// Workflow test
src/__tests__/integration/my-workflow.integration.test.ts
```

### E2E Tests

```typescript
// Playwright E2E test
tests/e2e/my-feature.spec.ts
```

---

## 📝 Writing Tests

### Basic Component Test

```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Service Test with Mocks

```typescript
import { database } from "@/lib/database";
import { MyService } from "../my.service";

// Mock database is automatically available from jest.setup.js
jest.mock("@/lib/database");

describe("MyService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data", async () => {
    const mockData = { id: "1", name: "Test" };
    (database.myModel.findUnique as jest.Mock).mockResolvedValue(mockData);

    const result = await MyService.getById("1");

    expect(result).toEqual(mockData);
    expect(database.myModel.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });
});
```

### Using Global Test Helpers

```typescript
describe("My Test Suite", () => {
  it("should work with test data", () => {
    // Global helpers from jest.setup.js
    const user = createTestUser({ name: "John" });
    const farm = createTestFarm({ ownerId: user.id });
    const product = createTestProduct({ farmId: farm.id });

    expect(user.name).toBe("John");
    expect(farm.ownerId).toBe(user.id);
    expect(product.farmId).toBe(farm.id);
  });
});
```

---

## 🔍 Debugging Tests

### Debug Single Test

```bash
# Run specific test file
npm test -- src/lib/services/__tests__/farm.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create farm"
```

### Debug with Node Inspector

```bash
# Debug in Chrome DevTools
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome
```

### View Console Output

```typescript
describe("My Test", () => {
  it("should log debug info", () => {
    console.log("Debug:", myVariable);
    // Console output will show in test results
  });
});
```

---

## 🐛 Common Issues & Solutions

### Issue: Port Already in Use

```bash
# Quick fix: Kill all dev server processes
npm run kill-server

# Then start fresh
npm run dev
```

### Issue: Tests Failing Locally

```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm run test
```

### Issue: Module Not Found

```bash
# Check TypeScript paths are correct
npm run type-check

# Ensure path aliases match tsconfig.json
# @/ -> ./src/*
```

### Issue: Database Mocks Not Working

```typescript
// Import from canonical location
import { database } from "@/lib/database";

// NOT from @prisma/client
// import { PrismaClient } from "@prisma/client"; // ❌ Don't do this
```

### Issue: E2E Tests Timing Out

```bash
# Increase timeout in playwright.config.ts
timeout: 300 * 1000, // 5 minutes

# Or per-test
test('my test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

---

## 📊 Test Coverage

### Coverage Thresholds

```javascript
// In jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### View Coverage Report

```bash
# Generate and view coverage
npm run test:coverage

# Open in browser
open coverage/lcov-report/index.html   # macOS
start coverage/lcov-report/index.html  # Windows
xdg-open coverage/lcov-report/index.html  # Linux
```

### Coverage Tips

- Focus on business logic (services, utilities)
- Don't stress about 100% on UI components
- Integration tests increase coverage significantly
- Aim for 80%+ on critical paths

---

## ⚡ Performance Tips

### Faster Test Runs

```bash
# Use HP OMEN optimized config (10 workers)
npm run test:omen

# Run only changed tests
npm test -- --onlyChanged

# Run tests in specific directory
npm test -- src/lib/services
```

### Parallel Execution

```javascript
// jest.config.js is already optimized for HP OMEN
maxWorkers: 10,              // 10 parallel workers
workerIdleMemoryLimit: "2GB", // 2GB per worker
```

---

## 🎨 Test Output

### Verbose Output

```bash
# See detailed test results
npm test -- --verbose
```

### Silent Output

```bash
# Minimal output
npm test -- --silent
```

### Watch Mode Options

```
Watch Usage
 › Press a to run all tests.
 › Press f to run only failed tests.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```

---

## 🌾 Agricultural Consciousness

### Divine Test Patterns

```typescript
// Use divine naming
describe("Farm Consciousness Manifestation", () => {
  it("manifests new farm with complete profile", async () => {
    // Test implementation
  });
});

// Agricultural context
global.agriculturalConsciousness = {
  testSeason: "FALL",
  biodynamicMode: true,
  quantumCoherence: 0.95,
};
```

### Test Console Messages

```
🌾 Divine Test Environment Initialized
⚡ Agricultural Consciousness: ACTIVE
🎯 HP OMEN Optimization: ENABLED
```

---

## 📚 Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [Divine Instructions](.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md)

### Configuration Files
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup
- `playwright.config.ts` - E2E configuration
- `tsconfig.json` - TypeScript config

### Test Results

```
✅ Status: All tests passing
📊 Total Tests: 430
✅ Passing: 414 (96%)
⏭️  Skipped: 16
⏱️  Execution Time: ~9 seconds
```

---

## 🚨 Emergency Commands

```bash
# Kill all dev servers on ports 3000/3001
npm run kill-server

# Nuclear option: Full reset
rm -rf node_modules .next coverage .jest-cache
npm install
npm run test

# Clear all caches
npm test -- --clearCache
rm -rf .next

# Force rebuild
npm run build:optimized
```

---

**Last Updated**: January 2025  
**Status**: ✅ FULLY OPERATIONAL  
**Divine Level**: MAXIMUM TESTING POWER 🌾⚡