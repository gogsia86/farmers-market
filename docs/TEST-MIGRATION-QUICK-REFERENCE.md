# 🧪 Test Migration Quick Reference Guide
## ServiceResponse Pattern Testing

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Purpose:** Quick copy-paste patterns for migrating tests to ServiceResponse

---

## 📚 Table of Contents

1. [Basic Test Setup](#basic-test-setup)
2. [Success Response Testing](#success-response-testing)
3. [Error Response Testing](#error-response-testing)
4. [Common Patterns](#common-patterns)
5. [Payment Service Examples](#payment-service-examples)
6. [Shipping Service Examples](#shipping-service-examples)
7. [Mocking Patterns](#mocking-patterns)

---

## Basic Test Setup

### Before (Static Methods)
```typescript
describe("MyService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should do something", async () => {
    const result = await MyService.doSomething(param1, param2);
    expect(result).toBeDefined();
  });
});
```

### After (Instance Methods with ServiceResponse)
```typescript
import type { ServiceResponse } from "@/lib/types/service-response";

describe("MyService with ServiceResponse", () => {
  let myService: MyService;

  beforeEach(() => {
    jest.clearAllMocks();
    myService = new MyService();
  });

  it("should do something with ServiceResponse", async () => {
    const result = await myService.doSomething({
      param1: "value1",
      param2: "value2"
    });

    // Always check ServiceResponse structure first
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();

    // Then check actual data
    expect(result.data).toMatchObject({
      expectedField: "expectedValue"
    });
  });
});
```

---

## Success Response Testing

### Pattern 1: Simple Success
```typescript
it("should return success response", async () => {
  const result = await service.operation({ param: "value" });

  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  expect(result.error).toBeUndefined();
});
```

### Pattern 2: Success with Data Validation
```typescript
it("should return valid data structure", async () => {
  const result = await service.operation({ param: "value" });

  expect(result.success).toBe(true);
  expect(result.data).toMatchObject({
    id: expect.any(String),
    name: expect.any(String),
    createdAt: expect.any(Date)
  });
});
```

### Pattern 3: Success with Array Data
```typescript
it("should return array of items", async () => {
  const result = await service.getAll();

  expect(result.success).toBe(true);
  expect(Array.isArray(result.data)).toBe(true);
  expect(result.data).toHaveLength(3);
  expect(result.data![0]).toHaveProperty("id");
});
```

### Pattern 4: Success with Void Return
```typescript
it("should complete operation successfully", async () => {
  const result = await service.deleteItem({ id: "123" });

  expect(result.success).toBe(true);
  expect(result.data).toBeUndefined(); // Void operations have no data
  expect(result.error).toBeUndefined();
});
```

---

## Error Response Testing

### Pattern 1: Expected Error
```typescript
// ❌ OLD (Exception-based)
it("should throw error if not found", async () => {
  await expect(
    MyService.findById("invalid")
  ).rejects.toThrow("Not found");
});

// ✅ NEW (ServiceResponse)
it("should return error if not found", async () => {
  const result = await myService.findById("invalid");

  expect(result.success).toBe(false);
  expect(result.data).toBeUndefined();
  expect(result.error).toBeDefined();
  expect(result.error?.code).toBe("NOT_FOUND");
  expect(result.error?.message).toContain("not found");
});
```

### Pattern 2: Validation Error
```typescript
it("should return validation error for invalid input", async () => {
  const result = await service.create({
    name: "", // Invalid - empty name
    amount: -10 // Invalid - negative amount
  });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("VALIDATION_ERROR");
  expect(result.error?.details).toBeDefined();
});
```

### Pattern 3: Database Error
```typescript
it("should handle database errors gracefully", async () => {
  jest
    .mocked(database.model.create)
    .mockRejectedValue(new Error("Connection lost"));

  const result = await service.create({ name: "Test" });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("DATABASE_ERROR");
  expect(result.error?.message).toContain("Connection lost");
});
```

### Pattern 4: Configuration Error
```typescript
it("should return error if configuration missing", async () => {
  delete process.env.API_KEY;
  const newService = new MyService();

  const result = await newService.operation({ param: "value" });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("CONFIGURATION_ERROR");
  expect(result.error?.message).toContain("API_KEY");
});
```

---

## Common Patterns

### Testing Optional Parameters
```typescript
describe("Optional Parameters", () => {
  it("should work with minimal parameters", async () => {
    const result = await service.create({
      requiredField: "value"
      // Optional fields omitted
    });

    expect(result.success).toBe(true);
  });

  it("should work with all parameters", async () => {
    const result = await service.create({
      requiredField: "value",
      optionalField1: "optional1",
      optionalField2: "optional2"
    });

    expect(result.success).toBe(true);
    expect(result.data?.optionalField1).toBe("optional1");
  });
});
```

### Testing Multiple Scenarios
```typescript
describe("Different Scenarios", () => {
  const scenarios = [
    { input: { status: "PENDING" }, expected: true },
    { input: { status: "CONFIRMED" }, expected: true },
    { input: { status: "INVALID" }, expected: false }
  ];

  scenarios.forEach(({ input, expected }) => {
    it(`should ${expected ? "succeed" : "fail"} for status ${input.status}`, async () => {
      const result = await service.updateStatus(input);

      expect(result.success).toBe(expected);
      
      if (expected) {
        expect(result.data).toBeDefined();
      } else {
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      }
    });
  });
});
```

### Testing Database Calls
```typescript
it("should call database with correct parameters", async () => {
  await service.create({
    name: "Test Item",
    price: 99.99
  });

  expect(database.model.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      name: "Test Item",
      price: 99.99
    })
  });
});
```

---

## Payment Service Examples

### Create Payment Intent
```typescript
it("should create payment intent successfully", async () => {
  const mockPaymentIntent = createMockPaymentIntent({
    id: "pi_123",
    amount: 9999,
    currency: "usd",
    status: "requires_payment_method"
  });

  jest
    .mocked(database.order.findUnique)
    .mockResolvedValue(mockOrder as unknown as Order);
  mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
  jest
    .mocked(database.order.update)
    .mockResolvedValue(mockOrder as unknown as Order);

  const result = await paymentService.createPaymentIntent({
    orderId: "order-123",
    amount: 99.99
  });

  expect(result.success).toBe(true);
  expect(result.data).toMatchObject({
    id: "pi_123",
    amount: 99.99,
    currency: "usd",
    status: "requires_payment_method"
  });
});
```

### Handle Payment Success
```typescript
it("should update order to PAID status", async () => {
  const mockPaymentIntent = {
    id: "pi_123",
    amount: 9999,
    metadata: { orderId: "order-123" }
  };

  jest
    .mocked(database.order.findFirst)
    .mockResolvedValue(mockOrder as unknown as Order);
  jest
    .mocked(database.order.update)
    .mockResolvedValue({ ...mockOrder, paymentStatus: "PAID" } as unknown as Order);

  const result = await paymentService.handlePaymentSuccess(mockPaymentIntent as any);

  expect(result.success).toBe(true);
  expect(database.order.update).toHaveBeenCalledWith({
    where: { id: "order-123" },
    data: expect.objectContaining({
      paymentStatus: "PAID",
      paidAt: expect.any(Date),
      status: "CONFIRMED"
    })
  });
});
```

### Webhook Verification
```typescript
it("should verify valid webhook signature", async () => {
  const mockEvent = createMockEvent();
  const payload = JSON.stringify(mockEvent);
  const signature = "valid_signature";

  mockWebhooksConstructEvent.mockReturnValue(mockEvent);

  const result = await paymentService.verifyWebhookSignature({
    payload,
    signature
  });

  expect(result.success).toBe(true);
  expect(result.data).toEqual(mockEvent);
});
```

---

## Shipping Service Examples

### Calculate Shipping Rates
```typescript
it("should return shipping rates with ServiceResponse", async () => {
  const result = await shippingService.calculateShippingRates({
    orderId: "order-123",
    destination: {
      street: "123 Farm Lane",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "US"
    }
  });

  expect(result.success).toBe(true);
  expect(result.data).toHaveLength(3);
  expect(result.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ service: "STANDARD" }),
      expect.objectContaining({ service: "EXPRESS" }),
      expect.objectContaining({ service: "OVERNIGHT" })
    ])
  );
});
```

### Create Shipping Label
```typescript
it("should create shipping label successfully", async () => {
  jest.mocked(database.order.update).mockResolvedValue({
    id: "order-123",
    status: "PREPARING",
    trackingNumber: "TRACK123",
    shippingService: "STANDARD"
  } as unknown as Order);

  const result = await shippingService.createShippingLabel({
    orderId: "order-123",
    service: "STANDARD",
    destination: {
      street: "123 Farm Lane",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "US"
    }
  });

  expect(result.success).toBe(true);
  expect(result.data).toMatchObject({
    labelId: expect.any(String),
    trackingNumber: expect.any(String),
    carrier: expect.any(String)
  });
});
```

### Get Tracking Info
```typescript
it("should return tracking info for valid tracking number", async () => {
  const mockOrder = {
    id: "order-123",
    status: "PREPARING",
    trackingNumber: "TRACK123"
  };

  jest
    .mocked(database.order.findFirst)
    .mockResolvedValue(mockOrder as unknown as Order);

  const result = await shippingService.getTrackingInfo({
    trackingNumber: "TRACK123"
  });

  expect(result.success).toBe(true);
  expect(result.data).toMatchObject({
    orderId: "order-123",
    trackingNumber: "TRACK123",
    status: "PREPARING",
    currentLocation: expect.any(String),
    events: expect.any(Array)
  });
});
```

---

## Mocking Patterns

### Mock Database Operations
```typescript
beforeEach(() => {
  // Success scenario
  jest.mocked(database.model.create).mockResolvedValue(mockData as any);
  jest.mocked(database.model.findUnique).mockResolvedValue(mockData as any);
  jest.mocked(database.model.update).mockResolvedValue(mockData as any);
});

it("should handle database errors", async () => {
  // Override for specific test
  jest
    .mocked(database.model.create)
    .mockRejectedValue(new Error("Database error"));

  const result = await service.create({ data: "test" });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("DATABASE_ERROR");
});
```

### Mock External API Calls
```typescript
// Stripe mock example
beforeEach(() => {
  mockPaymentIntentsCreate.mockResolvedValue({
    id: "pi_123",
    amount: 9999,
    currency: "usd",
    status: "requires_payment_method"
  });
});

it("should handle Stripe API errors", async () => {
  mockPaymentIntentsCreate.mockRejectedValue(
    new Error("Stripe API error")
  );

  const result = await paymentService.createPaymentIntent({
    orderId: "order-123",
    amount: 99.99
  });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("PAYMENT_INTENT_ERROR");
});
```

### Mock Environment Variables
```typescript
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    API_KEY: "test_key_123",
    WEBHOOK_SECRET: "test_secret_456"
  };
});

afterEach(() => {
  process.env = originalEnv;
});

it("should handle missing configuration", async () => {
  delete process.env.API_KEY;
  const newService = new MyService();

  const result = await newService.operation({ param: "value" });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("CONFIGURATION_ERROR");
});
```

---

## Type Safety Tips

### Import Types Correctly
```typescript
// ✅ Import types
import type { ServiceResponse } from "@/lib/types/service-response";
import type { User, Order } from "@prisma/client";
import type { PaymentIntent, RefundResult } from "@/lib/services/payment.service";

// ✅ Use type assertions for mocks
jest
  .mocked(database.order.findUnique)
  .mockResolvedValue(mockOrder as unknown as Order);
```

### Handle Optional Data
```typescript
it("should handle optional data safely", async () => {
  const result = await service.findById("123");

  expect(result.success).toBe(true);
  
  // Use optional chaining
  expect(result.data?.id).toBe("123");
  expect(result.data?.optionalField).toBeUndefined();

  // Or non-null assertion when success is guaranteed
  const data = result.data!;
  expect(data.id).toBe("123");
});
```

---

## Common Mistakes to Avoid

### ❌ Don't Skip ServiceResponse Validation
```typescript
// ❌ BAD - Directly accessing data without checking success
it("bad test", async () => {
  const result = await service.operation({ param: "value" });
  expect(result.data.id).toBe("123"); // Will fail if operation errors
});

// ✅ GOOD - Always check success first
it("good test", async () => {
  const result = await service.operation({ param: "value" });
  
  expect(result.success).toBe(true);
  expect(result.data?.id).toBe("123");
});
```

### ❌ Don't Use Old Exception Testing
```typescript
// ❌ BAD - Services no longer throw
it("bad test", async () => {
  await expect(service.operation({ param: "invalid" }))
    .rejects.toThrow("Validation failed");
});

// ✅ GOOD - Check error in response
it("good test", async () => {
  const result = await service.operation({ param: "invalid" });
  
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("VALIDATION_ERROR");
});
```

### ❌ Don't Forget to Test Error Cases
```typescript
// ✅ GOOD - Test both success and error paths
describe("Complete Testing", () => {
  it("should succeed with valid input", async () => {
    const result = await service.create({ name: "Valid" });
    expect(result.success).toBe(true);
  });

  it("should fail with invalid input", async () => {
    const result = await service.create({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should handle database errors", async () => {
    jest.mocked(database.model.create).mockRejectedValue(new Error());
    const result = await service.create({ name: "Valid" });
    expect(result.success).toBe(false);
  });
});
```

---

## Checklist for Test Migration

- [ ] Change from static to instance method calls
- [ ] Wrap parameters in request objects
- [ ] Add ServiceResponse structure validation
- [ ] Replace exception testing with error response testing
- [ ] Update mock return values to match new signatures
- [ ] Add optional field tests (currency, metadata, etc.)
- [ ] Test error scenarios with error codes
- [ ] Validate data structure in success cases
- [ ] Check database/API calls use correct parameters
- [ ] Import types correctly (use `type` keyword)

---

## Additional Resources

- **Full Documentation:** `/docs/phase3-week2-COMPLETION-SUMMARY.md`
- **Divine Instructions:** `/.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md`
- **Service Examples:** `/src/lib/services/*.service.ts`
- **Test Examples:** `/src/lib/services/__tests__/*.test.ts`

---

**🧪 "Test with divine precision, validate with agricultural wisdom, ensure quantum reliability." 🧪**