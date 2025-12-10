# 🧪 Unit Tests

This directory contains **unit tests** that use mocking to test logic, transformations, and component behavior in isolation.

## 📁 Directory Structure

```
src/__tests__/unit/
├── README.md                           # This file
├── cart-api.unit.test.ts               # Cart API route handler tests (mocked DB)
├── order-workflow.unit.test.ts         # Order workflow tests (mocked DB)
└── product-api/                        # Product API tests
    └── product-list.integration.test.ts # Product list tests (conditionally uses real DB)
```

## ⚡ Key Characteristics

| Aspect       | Unit Tests (This Directory)                            |
| ------------ | ------------------------------------------------------ |
| Database     | **Mocked** (`jest.mock("@/lib/database")`)             |
| Speed        | **Fast** (~1-10ms per test)                            |
| Dependencies | **None** (no Docker, no external services)             |
| Coverage     | Logic, transformations, error handling, route handlers |
| Isolation    | **Complete** (all external calls mocked)               |

## 🚀 Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm test -- cart-api.unit.test.ts

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📝 Test Naming Convention

**Previous naming (deprecated):**

- `*.integration.test.ts` - Was misleading as these tests mock the database

**Current naming (preferred):**

- `*.unit.test.ts` - Clearly indicates these are unit tests with mocked dependencies
- `*.test.ts` - General tests (assumed to be unit tests)

## ✍️ Writing Unit Tests

### Mocking the Database

```typescript
// Mock the database BEFORE imports
jest.mock("@/lib/database", () => ({
  database: {
    cartItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    // ... other models
  },
}));

import { database } from "@/lib/database";

const mockDatabase = database as jest.Mocked<typeof database>;

describe("Cart API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return cart items", async () => {
    // Arrange
    mockDatabase.cartItem.findMany.mockResolvedValue([
      { id: "item-1", quantity: 2 },
    ]);

    // Act
    const result = await getCartItems(userId);

    // Assert
    expect(result).toHaveLength(1);
    expect(mockDatabase.cartItem.findMany).toHaveBeenCalledWith({
      where: { userId },
    });
  });
});
```

### Mocking Authentication

```typescript
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
  getServerSession: jest.fn(),
}));

import { auth } from "@/lib/auth";

const mockAuth = auth as jest.MockedFunction<typeof auth>;

it("should require authentication", async () => {
  mockAuth.mockResolvedValue(null); // No session

  const result = await protectedOperation();

  expect(result.success).toBe(false);
  expect(result.status).toBe(401);
});
```

### Testing Route Handlers

```typescript
import { createMockRequest } from "@/tests/helpers/route-test-helpers";

it("should handle POST /api/cart", async () => {
  const request = createMockRequest({
    method: "POST",
    body: { productId: "prod-1", quantity: 2 },
  });

  const response = await POST(request);

  expect(response.status).toBe(200);
});
```

## 🔄 Comparison: Unit vs Integration Tests

|          | Unit Tests (`src/__tests__/unit/`) | Integration Tests (`tests/integration/`) |
| -------- | ---------------------------------- | ---------------------------------------- |
| Location | `src/__tests__/unit/`              | `tests/integration/db/`                  |
| Database | Mocked                             | Real PostgreSQL (testcontainers)         |
| Speed    | ~1-10ms per test                   | ~100-500ms per test                      |
| Docker   | Not required                       | **Required**                             |
| Use Case | Logic, transformations             | DB operations, constraints, queries      |

## 📋 What to Test Here

✅ **Good candidates for unit tests:**

- Input validation logic
- Data transformations
- Error handling paths
- Business logic calculations
- Component rendering
- Route handler flow (with mocked services)

❌ **Better suited for integration tests:**

- Actual database queries
- Foreign key constraints
- Transaction behavior
- Complex joins and aggregations

## 🔧 Mocking traceServiceOperation (OpenTelemetry)

Many services use `traceServiceOperation` from `@/lib/tracing/service-tracer` to wrap operations with OpenTelemetry tracing. This requires special handling due to Jest hoisting.

### The Problem

Jest hoists `jest.mock()` calls to the top of the file. If your mock references variables defined below it, they'll be `undefined` when the mock executes.

```typescript
// ❌ WRONG - mockTraceServiceOperation is undefined when jest.mock runs
const mockTraceServiceOperation = jest.fn();

jest.mock("@/lib/tracing/service-tracer", () => ({
  traceServiceOperation: mockTraceServiceOperation, // ReferenceError!
}));
```

### The Solution

Define mock functions **before** `jest.mock()`, and set their implementation in `beforeEach`:

```typescript
// ✅ CORRECT - Define mock function BEFORE jest.mock
const mockTraceServiceOperation = jest.fn();

// Mock the tracing module
jest.mock("@/lib/tracing/service-tracer", () => ({
  traceServiceOperation: (...args: unknown[]) =>
    mockTraceServiceOperation(...args),
}));

// Import your service AFTER the mock
import { MyService } from "../my.service";

describe("MyService", () => {
  let service: MyService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the mock to execute the traced callback and return its result
    mockTraceServiceOperation.mockImplementation(
      async <T>(
        _serviceName: string,
        _operationName: string,
        fn: (span: any) => Promise<T>,
      ): Promise<T> => {
        // Create a fake span object
        const fakeSpan = {
          setAttributes: jest.fn(),
          setStatus: jest.fn(),
          end: jest.fn(),
          recordException: jest.fn(),
        };
        // Execute and return the callback result
        return await fn(fakeSpan);
      },
    );

    service = new MyService();
  });

  it("should create an item", async () => {
    // Your test - the traced callback will be executed correctly
    const result = await service.createItem({ name: "Test" });
    expect(result).toBeDefined();
  });
});
```

### Key Points

1. **Define mock functions before `jest.mock()`** - This avoids hoisting issues
2. **Use arrow function wrapper in mock factory** - `(...args) => mockFn(...args)` ensures the mock is called at runtime
3. **Set implementation in `beforeEach`** - Keeps mocks fresh for each test
4. **Execute the callback** - The mock must call `fn(span)` and return its result, otherwise your service methods return `undefined`
5. **Provide a fake span** - Include mock methods like `setAttributes`, `setStatus`, etc.

### Complete Example (FarmService)

See `src/lib/services/__tests__/farm.service.test.ts` for a complete working example of this pattern.

## 🔗 Related

- **Integration Tests**: `tests/integration/README.md`
- **E2E Tests**: `tests/e2e/`
- **Test Helpers**: `tests/helpers/`
