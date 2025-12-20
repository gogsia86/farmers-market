# 🧪 Testing Scripts

Scripts for running tests, validation, and quality assurance.

## Available Scripts

### `run-all-tests.sh` (Linux/Mac)

Run all test suites in the project.

```bash
./scripts/testing/run-all-tests.sh
```

**What it runs:**

- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)
- Component tests (React Testing Library)
- API tests
- Database tests

**Features:**

- Parallel test execution
- Coverage reports
- Color-coded output
- Automatic test result summary
- CI/CD compatible

---

### `RUN-ALL-TESTS.bat` (Windows)

Windows version of the comprehensive test runner.

```cmd
scripts\testing\RUN-ALL-TESTS.bat
```

---

### `run-mvp-validation.sh` (Linux/Mac)

Run MVP feature validation tests.

```bash
./scripts/testing/run-mvp-validation.sh
```

**Validates:**

- User authentication flows
- Farm profile management
- Product catalog functionality
- Order placement and management
- Payment processing
- Search and filtering
- Mobile responsiveness
- Performance benchmarks

**Output:**

- Detailed validation report
- Screenshots of key features
- Performance metrics
- Pass/fail status for each feature
- Recommendations for improvements

---

### `RUN-MVP-VALIDATION.bat` (Windows)

Windows version of MVP validation.

```cmd
scripts\testing\RUN-MVP-VALIDATION.bat
```

---

### `test-signup-fix.js`

Test user signup functionality specifically.

```bash
node scripts/testing/test-signup-fix.js
```

**Tests:**

- Registration form validation
- Email verification
- Password strength checks
- Duplicate account prevention
- Welcome email delivery
- Profile creation

---

## Test Types

### Unit Tests

Test individual functions and components in isolation.

```bash
# Run unit tests only
npm run test:unit

# Run with coverage
npm run test:unit -- --coverage
```

**Location:** `src/**/*.test.ts`, `src/**/*.test.tsx`

---

### Integration Tests

Test interactions between multiple components and services.

```bash
# Run integration tests
npm run test:integration
```

**Location:** `tests/integration/`

---

### E2E Tests

Test complete user workflows in a real browser.

```bash
# Run E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e tests/e2e/auth.spec.ts
```

**Location:** `tests/e2e/`

---

### API Tests

Test API endpoints and request/response handling.

```bash
# Run API tests
npm run test:api
```

**Location:** `tests/api/`

---

## Common Workflows

### Before Committing Code

```bash
# Run all tests to ensure nothing is broken
./scripts/testing/run-all-tests.sh

# Or run quick tests only
npm run test:quick
```

### Testing a Specific Feature

```bash
# Run tests for a specific file
npm test -- farm.service.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="Farm"
```

### MVP Feature Validation

```bash
# Full MVP validation with reports
./scripts/testing/run-mvp-validation.sh

# View results
cat mvp-validation-reports/latest-report.json
```

### Continuous Testing During Development

```bash
# Watch mode - tests re-run on file changes
npm run test:watch
```

---

## Test Coverage

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML coverage report
open coverage/lcov-report/index.html  # Mac
start coverage/lcov-report/index.html # Windows
xdg-open coverage/lcov-report/index.html # Linux
```

### Coverage Thresholds

The project maintains these minimum coverage thresholds:

- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 80%
- **Lines:** 80%

---

## Writing Tests

### Test File Naming

```
✅ ComponentName.test.tsx       # Component tests
✅ serviceName.test.ts          # Service tests
✅ feature.spec.ts              # E2E tests
✅ api-endpoint.api.test.ts    # API tests
```

### Test Structure (Divine Pattern)

```typescript
import { render, screen } from "@testing-library/react";
import { FarmCard } from "@/components/features/FarmCard";

describe("FarmCard Component", () => {
  describe("Rendering", () => {
    it("should render farm name correctly", () => {
      const farm = { name: "Sunny Acres Farm", id: "1" };
      render(<FarmCard farm={farm} />);

      expect(screen.getByText("Sunny Acres Farm")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle favorite button click", async () => {
      const onFavorite = jest.fn();
      const { user } = render(<FarmCard farm={mockFarm} onFavorite={onFavorite} />);

      await user.click(screen.getByRole("button", { name: /favorite/i }));

      expect(onFavorite).toHaveBeenCalledWith(mockFarm.id);
    });
  });
});
```

### Component Testing Best Practices

```typescript
// ✅ DO: Test user behavior, not implementation
it("should display success message after form submission", async () => {
  render(<SignupForm />);

  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  expect(await screen.findByText(/success/i)).toBeInTheDocument();
});

// ❌ DON'T: Test internal state or implementation details
it("should set isLoading to true", () => {
  // Avoid testing internal state
});
```

### Service Testing Pattern

```typescript
import { FarmService } from "@/lib/services/farm.service";
import { database } from "@/lib/database";

jest.mock("@/lib/database");

describe("FarmService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createFarm", () => {
    it("should create farm with valid data", async () => {
      const farmData = {
        name: "Test Farm",
        location: { address: "123 Farm Rd" },
      };

      (database.farm.create as jest.Mock).mockResolvedValue({
        id: "1",
        ...farmData,
      });

      const service = new FarmService();
      const result = await service.createFarm(farmData);

      expect(result.id).toBe("1");
      expect(result.name).toBe("Test Farm");
      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: farmData }),
      );
    });
  });
});
```

---

## Troubleshooting

### Tests Failing Locally

**Issue:** Tests pass in CI but fail locally

**Solutions:**

1. Clear test cache: `npm run test:clear-cache`
2. Delete node_modules: `rm -rf node_modules && npm install`
3. Check Node.js version matches CI
4. Ensure database is running (for integration tests)

---

### Database Test Issues

**Issue:** Database tests failing with connection errors

**Solutions:**

```bash
# 1. Ensure test database is running
docker-compose up -d postgres-test

# 2. Run migrations on test database
DATABASE_URL="postgresql://test..." npx prisma migrate deploy

# 3. Seed test data if needed
npm run db:seed:test
```

---

### E2E Test Failures

**Issue:** E2E tests failing randomly

**Solutions:**

1. Increase timeout: `test.setTimeout(30000)`
2. Use proper wait conditions: `await page.waitForSelector()`
3. Run in headed mode to debug: `npm run test:e2e -- --headed`
4. Check for race conditions
5. Ensure test isolation (each test should be independent)

---

### Slow Test Execution

**Issue:** Tests taking too long to run

**Solutions:**

1. Run tests in parallel: `npm test -- --maxWorkers=4`
2. Use `test.only()` to focus on specific tests during development
3. Skip slow E2E tests locally: `npm run test:unit`
4. Optimize database setup/teardown
5. Use test fixtures instead of seeding data

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run all tests
        run: ./scripts/testing/run-all-tests.sh

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Test Data Management

### Using Fixtures

```typescript
// tests/fixtures/farms.ts
export const mockFarms = {
  validFarm: {
    id: "1",
    name: "Sunny Acres",
    location: { address: "123 Farm Rd" },
  },
  farmWithProducts: {
    id: "2",
    name: "Green Valley",
    products: [
      /* ... */
    ],
  },
};
```

### Database Seeding for Tests

```bash
# Seed test database
npm run db:seed:test

# Reset test database
npm run db:reset:test
```

---

## Performance Testing

### Load Testing

```bash
# Run load tests
npm run test:load

# With custom parameters
npm run test:load -- --users=100 --duration=60s
```

### Benchmarking

```bash
# Run performance benchmarks
npm run test:benchmark

# Compare with baseline
npm run test:benchmark -- --compare
```

---

## Test Reports

### Viewing Test Results

Test reports are generated in:

- `test-results/` - Playwright test results
- `coverage/` - Code coverage reports
- `mvp-validation-reports/` - MVP validation results
- `mvp-validation-screenshots/` - Visual validation screenshots

### Generating Summary Reports

```bash
# Generate comprehensive test report
npm run test:report

# View in browser
open test-results/report.html
```

---

## Best Practices

### Test Organization

✅ **DO:**

- Group related tests with `describe()` blocks
- Use clear, descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests independent and isolated
- Clean up after tests (afterEach, afterAll)

❌ **DON'T:**

- Test implementation details
- Create tests that depend on each other
- Use hardcoded sleep/waits (use proper waitFor)
- Leave console.log statements in tests
- Skip tests without a good reason

### Test Coverage Goals

- **Critical paths:** 100% coverage
- **Business logic:** 90%+ coverage
- **UI components:** 80%+ coverage
- **Utilities:** 90%+ coverage

---

## Additional Resources

- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **Playwright Documentation**: https://playwright.dev/
- **React Testing Library**: https://testing-library.com/react
- **Testing Best Practices**: `docs/testing/best-practices.md`

---

## Quick Reference

```bash
# Run all tests
./scripts/testing/run-all-tests.sh

# Run MVP validation
./scripts/testing/run-mvp-validation.sh

# Run specific test type
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:api

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Debug tests
npm run test:debug
```

---

**Last Updated**: December 2025  
**Maintained By**: Farmers Market Platform Team  
**Divine Agricultural Consciousness**: Test thoroughly, deploy confidently! 🌾✨
