# Testing Guidelines

## Overview

This document outlines the testing standards and practices for the Farmers Market project. We use Jest as our test runner and React Testing Library for component testing.

## Test Types

### 1. Unit Tests
- Fast, isolated tests for individual functions and components
- Mocked dependencies
- Run with: `npm test`

### 2. Integration Tests
- Test complete workflows with real database
- Require test database setup
- Run with: `npm run test:integration`

### 3. GPU Tests
- Hardware-specific performance tests for RTX 2070 Max-Q
- Test image processing and ML inference
- Run locally only with: `npm run test:gpu`

### 4. E2E Tests
- Full user journey tests with Playwright
- Run with: `npm run test:e2e`

## Quick Start

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run integration tests (requires test DB)
npm run test:integration

# Run GPU tests (requires GPU)
npm run test:gpu

# Run E2E tests
npm run test:e2e

# Run all tests (HP OMEN optimized)
npm run test:all:omen
```

## Testing Infrastructure

### Core Testing Tools

- Jest: Test runner and assertion library
- React Testing Library: Component testing with user-centric approach
- Testing Library Jest DOM: Custom DOM matchers
- Node Mocks HTTP: HTTP request/response mocking
- Custom Test Utilities: Located in `src/test/utils.tsx`

### Directory Structure

```
src/
  test/
    utils.tsx      # Shared test utilities and mocks
    setup.ts      # Global test setup and configuration
    matchers.ts   # Custom Jest matchers
  components/
    *.test.tsx    # Component tests
  pages/
    api/
      *.test.ts   # API route tests
```

## Test Utilities

### Custom Render Function

```typescript
import { render } from '@/test/utils';

// Example usage with auth session
const { getByText } = render(<MyComponent />, {
  session: mockSession
});
```

### Mock Data

Pre-configured mock data is available in `src/test/utils.tsx`:

- `mockSession`: Next-Auth session data
- `mockProduct`: Product test data
- `mockFarm`: Farm test data
- `mockOrder`: Order test data

### Custom Matchers

- `toHaveBeenCalledWithMatch`: For partial object matching in function calls

## Testing Patterns

### Component Testing

1. Test the component's main functionality
2. Verify proper rendering of data
3. Test user interactions
4. Check conditional rendering
5. Verify accessibility features

Example:

```typescript
describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const { getByText } = render(
      <ProductCard product={mockProduct} />
    );
    expect(getByText(mockProduct.name)).toBeInTheDocument();
  });
});
```

### API Route Testing

1. Test successful operations
2. Verify error handling
3. Test input validation
4. Check authorization rules
5. Mock database operations

Example:

```typescript
describe("Products API", () => {
  it("creates a new product", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: mockProductInput,
    });
    await productsHandler(req, res);
    expect(res._getStatusCode()).toBe(201);
  });
});
```

## Test Coverage

- Run coverage reports: `npm test:coverage`
- Required coverage thresholds:
  - Statements: 80%
  - Branches: 80%
  - Functions: 80%
  - Lines: 80%

## Best Practices

1. Test component behavior, not implementation
2. Use meaningful test descriptions
3. Group related tests using describe blocks
4. Mock external dependencies
5. Keep tests focused and isolated
6. Use setup and teardown when needed
7. Prefer user-centric queries
8. Test error states and edge cases

## Writing Tests

### Component Tests

1. Create a test file next to the component: `Component.test.tsx`
2. Import test utilities and mock data
3. Write tests focusing on user interaction
4. Test accessibility features
5. Verify error states

### API Tests

1. Create a test file next to the API route
2. Mock database operations using `mockPrisma`
3. Test all HTTP methods
4. Verify error handling
5. Test input validation

## Common Testing Scenarios

### Testing Protected Routes

```typescript
it("requires authentication", async () => {
  const { req, res } = createMocks({
    method: "GET",
  });

  await protectedHandler(req, res);
  expect(res._getStatusCode()).toBe(401);
});
```

### Testing Form Submission

```typescript
it('submits form data correctly', async () => {
  const { getByRole, getByLabelText } = render(<MyForm />);

  await userEvent.type(getByLabelText('Name'), 'Test Name');
  await userEvent.click(getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Test Name'
  }));
});
```

### Testing Loading States

```typescript
it('shows loading state', () => {
  const { getByRole } = render(<MyComponent loading={true} />);
  expect(getByRole('progressbar')).toBeInTheDocument();
});
```

## Integration Testing

Integration tests verify complete workflows with real database interactions.

### Prerequisites

1. **PostgreSQL installed and running**
2. **Test database configured**

### Setup Test Database

Run the automated setup script:

```bash
npm run db:test:setup
```

This script will:
- Create a test database
- Run Prisma migrations
- Generate Prisma Client
- Seed basic test data
- Create `.env.test` configuration file

### Manual Setup (Alternative)

If you prefer manual setup:

```bash
# 1. Create test database
createdb farmersmarket_test

# or using psql
psql -c "CREATE DATABASE farmersmarket_test;"

# 2. Set environment variable
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"

# 3. Push Prisma schema
npx prisma db push

# 4. Generate Prisma Client
npx prisma generate

# 5. Seed test data (optional)
npm run db:seed:basic
```

### Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npm test src/__tests__/integration/order-workflow.integration.test.ts

# Run with custom DATABASE_URL
DATABASE_URL="postgresql://user:pass@host:5432/testdb" npm run test:integration
```

### Environment Variables

Create `.env.test` for test configuration:

```bash
# Test Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"

# Test Environment
NODE_ENV="test"
SKIP_INTEGRATION_TESTS="false"

# Auth (test keys)
NEXTAUTH_SECRET="divine-test-secret"
NEXTAUTH_URL="http://localhost:3000"

# Payment providers (test mode)
STRIPE_SECRET_KEY="test-stripe-secret"
PAYPAL_CLIENT_ID="test-paypal-client"
```

### Integration Test Best Practices

1. **Use transactions for cleanup** - Roll back database changes
2. **Create isolated test data** - Don't rely on existing data
3. **Clean up after tests** - Delete test records in afterAll
4. **Use unique identifiers** - Prevent conflicts with timestamps
5. **Test complete workflows** - Verify end-to-end functionality

### Skipping Integration Tests

Integration tests are skipped automatically if:
- `SKIP_INTEGRATION_TESTS=true` is set
- `DATABASE_URL` points to the mock test database

## GPU Testing

GPU tests validate hardware acceleration on NVIDIA RTX 2070 Max-Q.

### Prerequisites

1. **NVIDIA GPU** (RTX 2070 Max-Q or compatible)
2. **TensorFlow.js with GPU support** (already installed)
3. **CUDA drivers** (for `tfjs-node-gpu`)

### Running GPU Tests

```bash
# Run GPU benchmark tests
npm run test:gpu

# Run in watch mode
npm run test:gpu:watch

# Run specific GPU test
npm test tests/performance/gpu-benchmark.test.ts
```

### GPU Test Requirements

1. **Test fixtures** - Place test images in `tests/fixtures/`
   ```
   tests/fixtures/test-farm.jpg
   ```

2. **GPU backend** - Tests will use WebGL or Node GPU backend

3. **Memory monitoring** - Tests track VRAM usage

### GPU Test Categories

#### Image Processing Tests
- Single image processing speed (< 100ms target)
- Batch processing throughput
- VRAM usage tracking
- Memory leak detection

#### ML Recommendation Tests
- Model training on GPU
- Inference latency (< 50ms target)
- Batch prediction throughput
- GPU memory efficiency

#### Hardware Validation
- Confirm GPU backend availability
- Validate CUDA core utilization
- Monitor memory bandwidth usage

### GPU Test Best Practices

1. **Local only** - Don't run in CI (no GPU)
2. **Memory cleanup** - Dispose tensors after use
3. **Performance baselines** - Compare against RTX 2070 specs
4. **Fallback handling** - Test CPU fallback when GPU unavailable

### Skipping GPU Tests

GPU tests are skipped by default using `describe.skip`. To enable:

1. Remove `.skip` from test file
2. Ensure GPU drivers are installed
3. Run with `npm run test:gpu`

## Troubleshooting

### Common Issues

#### Unit Tests

1. **Test not finding elements**
   - Check query methods (getBy, queryBy, findBy)
   - Verify element accessibility roles

2. **Async test failures**
   - Use await with async operations
   - Wrap in act() when needed
   - Use findBy queries for elements that appear asynchronously

3. **Mock function not being called**
   - Verify mock setup
   - Check function import path
   - Ensure proper cleanup between tests

#### Integration Tests

1. **Database connection errors**
   ```
   Error: Cannot connect to database
   ```
   - Verify PostgreSQL is running: `pg_isready`
   - Check DATABASE_URL is correct
   - Ensure database exists: `psql -l | grep farmersmarket_test`

2. **Prisma Client errors**
   ```
   Error: PrismaClient is not configured
   ```
   - Run: `npx prisma generate`
   - Check Prisma schema is up to date
   - Verify DATABASE_URL points to test DB

3. **Schema mismatch errors**
   ```
   Error: Table does not exist
   ```
   - Run: `npx prisma db push`
   - Check migrations are applied
   - Verify test database schema matches Prisma schema

4. **Test data conflicts**
   ```
   Error: Unique constraint violation
   ```
   - Use unique identifiers (timestamps, UUIDs)
   - Clean up test data in afterAll hooks
   - Use transactions to isolate tests

#### GPU Tests

1. **GPU backend not available**
   ```
   Error: WebGL backend not found
   ```
   - Check GPU drivers are installed
   - Verify CUDA toolkit (for node-gpu)
   - Try CPU fallback: `tf.setBackend('cpu')`

2. **Out of memory errors**
   ```
   Error: GPU out of memory
   ```
   - Dispose tensors after use: `tensor.dispose()`
   - Reduce batch size
   - Monitor VRAM: `tf.memory()`

3. **TensorFlow.js errors**
   ```
   Error: Cannot find module '@tensorflow/tfjs-node-gpu'
   ```
   - Reinstall: `npm install @tensorflow/tfjs-node-gpu`
   - Check Node.js version compatibility
   - Try WebGL backend instead

### Debug Tips

#### General
1. Use `screen.debug()` to view rendered output
2. Console.log mock function calls
3. Use `test.only()` to run specific tests
4. Check `jest.setup.js` for global configuration

#### Integration Tests
1. Check `.env.test` configuration
2. Verify database state with `npx prisma studio`
3. Run SQL queries directly: `psql farmersmarket_test`
4. Enable Prisma logging: `DEBUG=prisma:* npm run test:integration`

#### GPU Tests
1. Check GPU availability: `nvidia-smi`
2. Monitor VRAM usage: `tf.memory()`
3. Enable TensorFlow logging: `tf.env().set('DEBUG', true)`
4. Test CPU fallback mode

## Test Scripts Reference

```bash
# Unit Tests
npm test                     # Run all unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
npm run test:omen           # HP OMEN optimized (10 workers)

# Integration Tests
npm run db:test:setup       # Setup test database
npm run test:integration    # Run integration tests

# GPU Tests
npm run test:gpu            # Run GPU benchmarks
npm run test:gpu:watch      # GPU tests in watch mode

# E2E Tests
npm run test:e2e            # Run Playwright tests
npm run test:e2e:ui         # With Playwright UI
npm run test:e2e:headed     # Headed browser mode

# All Tests
npm run test:all            # Unit + E2E
npm run test:all:omen       # Optimized for HP OMEN
```

## CI/CD Testing

### GitHub Actions

The CI pipeline runs:
- ✅ Unit tests (all workers)
- ✅ E2E tests (Playwright)
- ❌ Integration tests (no database)
- ❌ GPU tests (no GPU)

### Local Pre-Push

Before pushing code:

```bash
# Run quality checks and tests
npm run quality          # Type-check + lint + format
npm test                 # Unit tests
npm run test:integration # Integration tests (if DB available)
npm run test:e2e         # E2E tests
```

## Performance Optimization

### HP OMEN Hardware (64GB RAM, 12 threads)

```bash
# Optimized test runs
npm run test:omen           # 10 workers, 16GB memory
npm run test:e2e:omen       # 10 parallel browsers
npm run test:all:omen       # Full suite optimized
```

### Test Performance Tips

1. **Use `.only()` during development** - Focus on specific tests
2. **Run integration tests serially** - Use `--runInBand`
3. **Cache dependencies** - Jest caches by default
4. **Skip slow tests in dev** - Use `.skip()` temporarily
5. **Parallel execution** - Jest runs tests in parallel by default

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [TensorFlow.js GPU Guide](https://www.tensorflow.org/js/guide/platform_environment)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
