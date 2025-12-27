# 🧪 TESTING PATTERNS - QUICK REFERENCE GUIDE

**Last Updated:** December 27, 2024  
**Status:** Production Ready ✅  
**Audience:** Backend Developers, QA Engineers

---

## 🎯 Purpose

This guide provides copy-paste patterns for common testing scenarios in the Farmers Market Platform. All patterns follow the ServiceResponse convention and divine agricultural principles.

---

## 📦 ServiceResponse Pattern

### Basic Structure
```typescript
interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMetadata;
  };
}
```

### Success Response
```typescript
return {
  success: true,
  data: result,
  meta: {
    timestamp: new Date().toISOString(),
  },
};
```

### Error Response
```typescript
return {
  success: false,
  error: {
    code: "OPERATION_FAILED",
    message: "Detailed error message",
  },
  meta: {
    timestamp: new Date().toISOString(),
  },
};
```

---

## 🔄 Transaction Mock Pattern

### Setup (Module Level)
```typescript
import { database } from "@/lib/database";

jest.mock("@/lib/database");

const mockDatabase = database as jest.Mocked<typeof database>;

// Initialize mock (must be defined at module level)
(mockDatabase as any).$transaction = jest.fn();
```

### Reset (beforeEach)
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  
  // CRITICAL: Reset implementation in beforeEach
  (mockDatabase as any).$transaction.mockImplementation(
    async (callback: any) => {
      return await callback(mockDatabase);
    },
  );
  
  // Create service instance AFTER mock setup
  service = new YourService();
});
```

### Why This Pattern?
1. **Module-level mock** defines the jest mock function
2. **beforeEach reset** ensures implementation runs for each test
3. **Async/await** properly handles promises
4. **Service creation** happens after mock is ready

---

## 🏗️ Service Mock Patterns

### Basic Service Mock
```typescript
// Mock the entire service module
jest.mock("../other.service");

const mockOtherService = otherService as jest.Mocked<typeof otherService>;

// Mock method with ServiceResponse
mockOtherService.someMethod.mockResolvedValueOnce({
  success: true,
  data: mockData,
});
```

### Cart Service Mock (Common Pattern)
```typescript
mockCartService.getCart.mockResolvedValueOnce({
  success: true,
  data: {
    items: [mockCartItem],
    subtotal: 10.00,
    tax: 0.80,
    deliveryFee: 5.00,
    total: 15.80,
    itemCount: 1,
    farmCount: 1,
  },
});

mockCartService.validateCart.mockResolvedValueOnce({
  success: true,
  data: {
    valid: true,
    issues: [],
  },
});

mockCartService.clearCart.mockResolvedValueOnce({
  success: true,
  data: undefined,
});
```

---

## 🧪 Test Structure Template

### Complete Test File Template
```typescript
/**
 * 🧪 SERVICE NAME - UNIT TESTS
 * Description of what this service does
 */

import { ServiceClass } from "../service-name.service";
import { database } from "@/lib/database";

// ============================================================================
// MOCKS
// ============================================================================

jest.mock("@/lib/database");

const mockDatabase = database as jest.Mocked<typeof database>;

// Setup transaction mock
(mockDatabase as any).$transaction = jest.fn();

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createMockEntity = (overrides = {}) => ({
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Test Entity",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("ServiceClass", () => {
  let service: ServiceClass;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset transaction mock implementation
    (mockDatabase as any).$transaction.mockImplementation(
      async (callback: any) => {
        return await callback(mockDatabase);
      },
    );
    
    service = new ServiceClass();
  });

  describe("methodName", () => {
    it("should perform operation successfully", async () => {
      // Arrange
      const input = { /* test data */ };
      const expected = createMockEntity();
      
      mockDatabase.entity.create.mockResolvedValueOnce(expected as any);
      
      // Act
      const result = await service.methodName(input);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expected);
      expect(mockDatabase.entity.create).toHaveBeenCalledWith({
        data: expect.objectContaining(input),
      });
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      mockDatabase.entity.create.mockRejectedValueOnce(
        new Error("Database error"),
      );
      
      // Act
      const result = await service.methodName({});
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("OPERATION_FAILED");
      expect(result.error?.message).toContain("Database error");
    });
  });
});
```

---

## 🎭 Mock Data Factories

### UUID Generation
```typescript
// Use valid UUIDs for all IDs (required by Zod validation)
const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
const mockProductId = "423e4567-e89b-12d3-a456-426614174000";
const mockFarmId = "523e4567-e89b-12d3-a456-426614174000";
```

### Factory Pattern
```typescript
const createMockProduct = (overrides = {}) => ({
  id: "423e4567-e89b-12d3-a456-426614174000",
  name: "Organic Tomatoes",
  description: "Fresh organic tomatoes",
  price: 4.99,
  farmId: "523e4567-e89b-12d3-a456-426614174000",
  category: "VEGETABLES",
  season: "SUMMER",
  stock: 100,
  unit: "lb",
  available: true,
  purchaseCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides, // Allow test-specific overrides
});
```

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Undefined Result from Transaction
**Problem:**
```typescript
const result = await service.methodUsingTransaction(data);
// result is undefined
```

**Solution:**
Ensure transaction mock is reset in `beforeEach`:
```typescript
beforeEach(() => {
  (mockDatabase as any).$transaction.mockImplementation(
    async (callback: any) => {
      return await callback(mockDatabase);
    },
  );
});
```

### Pitfall 2: Wrong Response Structure
**Problem:**
```typescript
mockService.getCart.mockResolvedValueOnce(mockCart); // ❌ Wrong
```

**Solution:**
```typescript
mockService.getCart.mockResolvedValueOnce({
  success: true,
  data: mockCart, // ✅ Correct - wrapped in ServiceResponse
});
```

### Pitfall 3: Accessing Wrong Property
**Problem:**
```typescript
expect(result.order).toBeDefined(); // ❌ Wrong property
```

**Solution:**
```typescript
expect(result.data).toBeDefined(); // ✅ Always use result.data
```

### Pitfall 4: Missing Mock Reset
**Problem:**
```typescript
describe("test suite", () => {
  let service;
  
  beforeEach(() => {
    // ❌ Missing jest.clearAllMocks()
    service = new Service();
  });
});
```

**Solution:**
```typescript
beforeEach(() => {
  jest.clearAllMocks(); // ✅ Always reset mocks
  service = new Service();
});
```

---

## 📊 Assertion Patterns

### Success Response Assertions
```typescript
expect(result).toBeDefined();
expect(result.success).toBe(true);
expect(result.data).toBeDefined();
expect(result.error).toBeUndefined();
```

### Error Response Assertions
```typescript
expect(result).toBeDefined();
expect(result.success).toBe(false);
expect(result.error).toBeDefined();
expect(result.error?.code).toBe("ERROR_CODE");
expect(result.error?.message).toContain("error text");
expect(result.data).toBeUndefined();
```

### Mock Call Verification
```typescript
expect(mockDatabase.entity.create).toHaveBeenCalledTimes(1);
expect(mockDatabase.entity.create).toHaveBeenCalledWith(
  expect.objectContaining({
    data: expect.objectContaining({
      field: expectedValue,
    }),
  }),
);
```

### Array/Object Matching
```typescript
expect(result.data).toMatchObject({
  id: expect.any(String),
  name: "Expected Name",
  items: expect.arrayContaining([
    expect.objectContaining({
      id: expect.any(String),
    }),
  ]),
});
```

---

## 🛡️ Error Handling in Services

### Pattern in Service Implementation
```typescript
async createEntity(data: CreateEntityRequest): Promise<ServiceResponse<Entity>> {
  return await this.traced("createEntity", async () => {
    // Validate input
    const validation = CreateEntitySchema.safeParse(data);
    if (!validation.success) {
      return this.validationError(
        validation.error.issues.map((e) => e.message).join(", ")
      );
    }

    // Wrap transaction in try-catch
    try {
      return await this.withTransaction(async (tx) => {
        const entity = await tx.entity.create({ data });
        return this.success(entity);
      });
    } catch (error) {
      this.logger.error("Failed to create entity", error);
      return this.error(
        "ENTITY_CREATION_FAILED",
        error instanceof Error ? error.message : "Failed to create entity"
      );
    }
  });
}
```

### Testing Error Handling
```typescript
it("should handle database errors gracefully", async () => {
  mockDatabase.entity.create.mockRejectedValueOnce(
    new Error("Database constraint violation")
  );

  const result = await service.createEntity(validData);

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("ENTITY_CREATION_FAILED");
  expect(result.error?.message).toContain("Database constraint violation");
});
```

---

## 🎯 Test Organization

### Describe Block Hierarchy
```typescript
describe("ServiceName", () => {
  // Setup and factories
  
  describe("methodName", () => {
    it("should handle success case", async () => {});
    it("should handle error case", async () => {});
    it("should validate input", async () => {});
  });
  
  describe("anotherMethod", () => {
    it("should ...", async () => {});
  });
});
```

### Test Naming Convention
```typescript
// ✅ Good - Descriptive, action-oriented
it("should create order successfully with existing address", async () => {});
it("should fail when cart is empty", async () => {});
it("should update product purchase count", async () => {});

// ❌ Avoid - Vague or implementation-focused
it("works", async () => {});
it("test createOrder", async () => {});
it("calls database.order.create", async () => {});
```

---

## 📚 Reference Documentation

### Related Files
- `.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md`
- `.github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md`
- `.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md`
- `CHECKOUT_TEST_COMPLETION_REPORT.md`

### Example Test Files
- `src/lib/services/__tests__/checkout.service.test.ts` - Full transaction testing
- `src/lib/services/__tests__/cart.service.test.ts` - Service mock patterns
- `src/lib/services/__tests__/farm.service.test.ts` - CRUD operations

---

## 🌟 Divine Testing Principles

1. **Test Behavior, Not Implementation** - Focus on what the service does, not how
2. **Isolate Units** - Each test should be independent
3. **Mock External Dependencies** - Database, APIs, other services
4. **Use Descriptive Names** - Tests are documentation
5. **Follow AAA Pattern** - Arrange, Act, Assert
6. **Test Edge Cases** - Empty data, invalid input, errors
7. **Reset State** - Clear mocks between tests
8. **Verify Mock Calls** - Ensure dependencies are called correctly

---

## 🚀 Quick Checklist

Before submitting tests, verify:

- [ ] All mocks reset in `beforeEach`
- [ ] Transaction mock uses `mockImplementation` in `beforeEach`
- [ ] ServiceResponse pattern used for all mocks
- [ ] Test accesses `result.data`, not custom properties
- [ ] Error cases return `{ success: false, error: {...} }`
- [ ] UUIDs are valid format for all IDs
- [ ] Tests are independent (can run in any order)
- [ ] Descriptive test names
- [ ] Mock calls verified
- [ ] Edge cases covered

---

**Remember:** Well-tested code is divine code. May your tests pass with agricultural consciousness. 🌾✨