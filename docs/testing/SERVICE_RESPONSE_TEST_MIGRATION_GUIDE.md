# 🧪 Service Response Test Migration Guide

**Purpose:** Guide for updating unit tests after service migration to BaseService pattern with ServiceResponse  
**Audience:** Developers updating test suites for migrated services  
**Last Updated:** 2024-11-15

---

## 📋 Overview

When services are migrated to the BaseService pattern, they return `ServiceResponse<T>` instead of custom response objects. This requires updating test mocks and expectations to match the new pattern.

---

## 🔄 Pattern Changes

### Before Migration (Legacy Pattern)

```typescript
// Service method
async getCart(userId: string): Promise<CartSummary> {
  const items = await database.cartItem.findMany({ where: { userId } });
  return { items, subtotal: 0, total: 0, ... };
}

// Test mock
mockCartService.getCart.mockResolvedValueOnce(mockCart);

// Test expectation
const result = await cartService.getCart(userId);
expect(result.items).toHaveLength(2);
expect(result.subtotal).toBe(19.98);
```

### After Migration (ServiceResponse Pattern)

```typescript
// Service method
async getCart(userId: string): Promise<ServiceResponse<CartSummary>> {
  const items = await database.cartItem.findMany({ where: { userId } });
  return this.success({ items, subtotal: 0, total: 0, ... });
}

// Test mock
mockCartService.getCart.mockResolvedValueOnce({
  success: true,
  data: mockCart
});

// Test expectation
const result = await cartService.getCart(userId);
expect(result.success).toBe(true);
expect(result.data?.items).toHaveLength(2);
expect(result.data?.subtotal).toBe(19.98);
```

---

## 🎯 ServiceResponse Structure

```typescript
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}
```

### Success Response
```typescript
{
  success: true,
  data: <your data here>,
  timestamp: "2024-11-15T10:30:00.000Z",
  metadata: { /* optional */ }
}
```

### Error Response
```typescript
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE_CONSTANT",
  timestamp: "2024-11-15T10:30:00.000Z"
}
```

---

## 📝 Step-by-Step Migration Guide

### Step 1: Update Service Mocks

#### Before
```typescript
mockCartService.getCart.mockResolvedValueOnce(mockCart);
mockCartService.validateCart.mockResolvedValueOnce({
  valid: true,
  issues: []
});
```

#### After
```typescript
mockCartService.getCart.mockResolvedValueOnce({
  success: true,
  data: mockCart
});

mockCartService.validateCart.mockResolvedValueOnce({
  success: true,
  data: {
    valid: true,
    issues: []
  }
});
```

### Step 2: Update Test Expectations

#### Before
```typescript
const result = await checkoutService.initializeCheckout(userId);

expect(result.success).toBe(true);
expect(result.session).toBeDefined();
expect(result.session?.userId).toBe(userId);
expect(result.preview).toBeDefined();
```

#### After
```typescript
const result = await checkoutService.initializeCheckout(userId);

expect(result.success).toBe(true);
expect(result.data).toBeDefined();
expect(result.data?.session).toBeDefined();
expect(result.data?.session.userId).toBe(userId);
expect(result.data?.preview).toBeDefined();
```

### Step 3: Update Error Test Cases

#### Before
```typescript
mockCartService.getCart.mockRejectedValueOnce(
  new Error("Database error")
);

const result = await checkoutService.initializeCheckout(userId);

expect(result.success).toBe(false);
expect(result.error).toContain("Failed to initialize checkout");
```

#### After (No change in service under test, but dependency mocks change)
```typescript
// Mock the dependency to return error ServiceResponse
mockCartService.getCart.mockResolvedValueOnce({
  success: false,
  error: "Database error",
  code: "CART_FETCH_ERROR"
});

const result = await checkoutService.initializeCheckout(userId);

expect(result.success).toBe(false);
expect(result.error).toContain("Failed to fetch cart");
expect(result.code).toBe("CART_FETCH_ERROR");
```

---

## 🔍 Common Patterns

### Pattern 1: Simple Data Return

#### Before
```typescript
it("should return user data", async () => {
  const mockUser = { id: "123", name: "Test" };
  mockUserService.getUser.mockResolvedValueOnce(mockUser);
  
  const result = await service.doSomething();
  expect(result.name).toBe("Test");
});
```

#### After
```typescript
it("should return user data", async () => {
  const mockUser = { id: "123", name: "Test" };
  mockUserService.getUser.mockResolvedValueOnce({
    success: true,
    data: mockUser
  });
  
  const result = await service.doSomething();
  expect(result.success).toBe(true);
  expect(result.data?.name).toBe("Test");
});
```

### Pattern 2: Validation Response

#### Before
```typescript
mockCartService.validateCart.mockResolvedValueOnce({
  valid: true,
  issues: []
});
```

#### After
```typescript
mockCartService.validateCart.mockResolvedValueOnce({
  success: true,
  data: {
    valid: true,
    issues: []
  }
});
```

### Pattern 3: Void/Success Only

#### Before
```typescript
mockCartService.clearCart.mockResolvedValueOnce();
```

#### After
```typescript
mockCartService.clearCart.mockResolvedValueOnce({
  success: true,
  data: undefined
});

// Or more concisely
mockCartService.clearCart.mockResolvedValueOnce({
  success: true
});
```

### Pattern 4: Error Cases

#### Before
```typescript
mockService.doSomething.mockRejectedValueOnce(
  new Error("Something failed")
);
```

#### After (when mocking migrated services)
```typescript
mockService.doSomething.mockResolvedValueOnce({
  success: false,
  error: "Something failed",
  code: "OPERATION_FAILED"
});
```

### Pattern 5: Chained Service Calls

#### Before
```typescript
const cart = await cartService.getCart(userId);
if (!cart.items.length) {
  return { success: false, error: "Empty cart" };
}
```

#### After
```typescript
const cartResponse = await cartService.getCart(userId);
if (!cartResponse.success || !cartResponse.data) {
  return this.error("CART_FETCH_ERROR", "Failed to fetch cart");
}

const cart = cartResponse.data;
if (!cart.items.length) {
  return this.error("EMPTY_CART", "Cart is empty");
}
```

---

## 🧪 Complete Example: CheckoutService Test

### Before Migration
```typescript
describe("CheckoutService", () => {
  it("should initialize checkout with valid cart", async () => {
    const userId = "user_123";
    const mockCart = createMockCart([createMockCartItem()]);

    mockCartService.getCart.mockResolvedValue(mockCart);
    mockCartService.validateCart.mockResolvedValueOnce({
      valid: true,
      issues: []
    });

    const result = await checkoutService.initializeCheckout(userId);

    expect(result.success).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.preview).toBeDefined();
  });

  it("should fail when cart is empty", async () => {
    const userId = "user_123";
    const emptyCart = createMockCart([]);

    mockCartService.getCart.mockResolvedValueOnce(emptyCart);

    const result = await checkoutService.initializeCheckout(userId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Cart is empty");
  });
});
```

### After Migration
```typescript
describe("CheckoutService", () => {
  it("should initialize checkout with valid cart", async () => {
    const userId = "user_123";
    const mockCart = createMockCart([createMockCartItem()]);

    // ✅ Wrap in ServiceResponse
    mockCartService.getCart.mockResolvedValue({
      success: true,
      data: mockCart
    });
    
    mockCartService.validateCart.mockResolvedValueOnce({
      success: true,
      data: {
        valid: true,
        issues: []
      }
    });

    const result = await checkoutService.initializeCheckout(userId);

    // ✅ Check success first, then data
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.session).toBeDefined();
    expect(result.data?.preview).toBeDefined();
  });

  it("should fail when cart is empty", async () => {
    const userId = "user_123";
    const emptyCart = createMockCart([]);

    // ✅ Wrap in ServiceResponse
    mockCartService.getCart.mockResolvedValueOnce({
      success: true,
      data: emptyCart
    });

    const result = await checkoutService.initializeCheckout(userId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Cart is empty");
    expect(result.code).toBe("EMPTY_CART");
  });
});
```

---

## 🔧 Utility Functions for Tests

### Helper: Create Success Response
```typescript
function createSuccessResponse<T>(data: T): ServiceResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

// Usage
mockService.getData.mockResolvedValueOnce(
  createSuccessResponse(mockData)
);
```

### Helper: Create Error Response
```typescript
function createErrorResponse(
  code: string,
  error: string
): ServiceResponse<never> {
  return {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  };
}

// Usage
mockService.getData.mockResolvedValueOnce(
  createErrorResponse("DATA_NOT_FOUND", "Data not found")
);
```

### Helper: Mock Service Response
```typescript
function mockServiceResponse<T>(
  mockFn: jest.Mock,
  data: T | null,
  error?: { code: string; message: string }
) {
  if (error) {
    mockFn.mockResolvedValueOnce({
      success: false,
      error: error.message,
      code: error.code
    });
  } else {
    mockFn.mockResolvedValueOnce({
      success: true,
      data
    });
  }
}

// Usage
mockServiceResponse(mockCartService.getCart, mockCart);
mockServiceResponse(mockCartService.getCart, null, {
  code: "CART_NOT_FOUND",
  message: "Cart not found"
});
```

---

## ✅ Checklist for Test Migration

### For Each Test File:

- [ ] Identify all service mocks that need updating
- [ ] Update mocks to return ServiceResponse pattern
- [ ] Update test expectations to check `.success` first
- [ ] Update test expectations to access `.data` property
- [ ] Update error test cases to check `.code` and `.error`
- [ ] Add TypeScript type assertions where needed
- [ ] Run tests and fix any type errors
- [ ] Verify all tests pass
- [ ] Check test coverage hasn't decreased
- [ ] Update test descriptions if needed

### Common Gotchas:

- ✅ Don't forget to wrap ALL dependency mock responses
- ✅ Check for null/undefined: `result.data?.property`
- ✅ Update both success and error paths
- ✅ Remember to update `.resolvedValue()` AND `.resolvedValueOnce()`
- ✅ Check for mock reset/clear in `beforeEach`

---

## 🎯 Testing Best Practices

### 1. Test Success Path First
```typescript
it("should successfully create order", async () => {
  // Setup mocks with success responses
  mockCartService.getCart.mockResolvedValueOnce({
    success: true,
    data: mockCart
  });
  
  const result = await service.createOrder(request);
  
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
});
```

### 2. Test Each Error Code
```typescript
it("should return CART_EMPTY error when cart is empty", async () => {
  mockCartService.getCart.mockResolvedValueOnce({
    success: true,
    data: emptyCart
  });
  
  const result = await service.createOrder(request);
  
  expect(result.success).toBe(false);
  expect(result.code).toBe("CART_EMPTY");
  expect(result.error).toContain("Cart is empty");
});
```

### 3. Test Dependency Failures
```typescript
it("should handle cart service failure gracefully", async () => {
  mockCartService.getCart.mockResolvedValueOnce({
    success: false,
    error: "Database connection failed",
    code: "DB_CONNECTION_ERROR"
  });
  
  const result = await service.createOrder(request);
  
  expect(result.success).toBe(false);
  expect(result.error).toContain("Failed to fetch cart");
});
```

### 4. Test Data Transformation
```typescript
it("should transform cart items correctly", async () => {
  mockCartService.getCart.mockResolvedValueOnce({
    success: true,
    data: mockCart
  });
  
  const result = await service.createOrder(request);
  
  expect(result.success).toBe(true);
  expect(result.data?.items).toHaveLength(mockCart.items.length);
  expect(result.data?.items[0].productId).toBe(mockCart.items[0].productId);
});
```

---

## 🚨 Common Errors and Solutions

### Error 1: Type Error on `.data`
```typescript
// ❌ Error: Property 'items' does not exist on type 'CartSummary | undefined'
expect(result.data.items).toHaveLength(2);

// ✅ Solution: Use optional chaining
expect(result.data?.items).toHaveLength(2);

// ✅ Or assert non-null
expect(result.data).toBeDefined();
expect(result.data!.items).toHaveLength(2);
```

### Error 2: Mock Not Wrapped
```typescript
// ❌ Mock returns raw data
mockService.getData.mockResolvedValueOnce(mockData);

// ✅ Wrap in ServiceResponse
mockService.getData.mockResolvedValueOnce({
  success: true,
  data: mockData
});
```

### Error 3: Missing Success Check
```typescript
// ❌ Accessing data without checking success
const items = result.data.items;

// ✅ Check success first
expect(result.success).toBe(true);
const items = result.data?.items || [];
```

### Error 4: Outdated Error Testing
```typescript
// ❌ Old pattern: expecting exception
await expect(service.doSomething()).rejects.toThrow();

// ✅ New pattern: expecting error response
const result = await service.doSomething();
expect(result.success).toBe(false);
expect(result.error).toBeDefined();
```

---

## 📚 Reference: Migration Status

### Migrated Services (Use ServiceResponse Pattern)
- ✅ BaseService (abstract)
- ✅ FarmService
- ✅ ProductService
- ✅ OrderService
- ✅ CartService
- ✅ CheckoutService

### Pending Migration (Use Old Pattern for Now)
- ⏳ PaymentService
- ⏳ ShippingService
- ⏳ NotificationService
- ⏳ EmailService
- ⏳ AnalyticsService
- ⏳ RecommendationService

---

## 🎉 Summary

**Key Changes:**
1. All service methods return `ServiceResponse<T>`
2. Success responses have `success: true` and `data: T`
3. Error responses have `success: false`, `error: string`, and `code: string`
4. Test mocks must wrap data in ServiceResponse structure
5. Test expectations must check `.success` and access `.data`

**Benefits:**
- Consistent response structure across all services
- Better error handling with error codes
- Improved type safety
- Easier debugging with structured responses
- Better observability with metadata

**Migration Time:**
- Simple test file: ~30 minutes
- Complex test file: ~1-2 hours
- API route tests: ~15 minutes per route

---

**Last Updated:** 2024-11-15  
**Version:** 1.0  
**Maintained By:** Platform Engineering Team

_"Transform tests with divine precision, maintain coverage with agricultural consciousness."_ 🧪✨