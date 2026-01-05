# 🚀 ServiceResponse Pattern - Quick Reference Guide

**For:** Farmers Market Platform Development Team  
**Version:** 1.0  
**Last Updated:** November 15, 2024

---

## 📖 Overview

All backend services now use the **ServiceResponse** pattern - a discriminated union type that provides type-safe error handling and consistent API responses.

---

## 🎯 Core Pattern

### Type Definition

```typescript
export type ServiceResponse<T> =
  | ServiceSuccessResponse<T>
  | ServiceErrorResponse;

export interface ServiceSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ResponseMetadata;
}

export interface ServiceErrorResponse {
  success: false;
  error: ServiceError;
  meta?: ResponseMetadata;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## ✅ Usage Examples

### 1. Service Method (Backend)

```typescript
// ✅ CORRECT - Return ServiceResponse<T>
async createOrder(request: CreateOrderRequest): Promise<ServiceResponse<Order>> {
  return await this.traced("createOrder", async () => {
    // Validate
    const validated = await this.validate(CreateOrderSchema, request);

    // Business logic
    const order = await database.order.create({ data: validated });

    // Success response
    return this.success(order);
  });
}
```

### 2. API Route Handler (Backend)

```typescript
export async function POST(request: NextRequest) {
  const result = await checkoutService.createOrder(data);

  // ✅ CORRECT - Check success first (discriminated union)
  if (!result.success) {
    // TypeScript knows result.error exists here
    return NextResponse.json(
      {
        success: false,
        error: result.error.message,
      },
      { status: 400 },
    );
  }

  // TypeScript knows result.data exists here
  return NextResponse.json(
    {
      success: true,
      order: result.data,
    },
    { status: 201 },
  );
}
```

### 3. Frontend API Client

```typescript
// ✅ CORRECT - Handle discriminated union
async function createOrder(orderData: CreateOrderData) {
  const response = await fetch("/api/checkout/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  const result = await response.json();

  if (!result.success) {
    // Handle error
    throw new Error(result.error || "Failed to create order");
  }

  // Use data
  return result.order;
}
```

### 4. React Hook

```typescript
export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: CreateOrderData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to create order");
        return null;
      }

      return result.order;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}
```

---

## 🎨 Pattern Comparison

### ❌ OLD PATTERN (Don't Use)

```typescript
// ❌ OLD - Direct return, no error handling
async function createOrder(data: CreateOrderData): Promise<Order> {
  const order = await database.order.create({ data });
  return order; // What about errors?
}

// ❌ OLD - Inconsistent error handling
async function createOrder(data: CreateOrderData): Promise<Order | null> {
  try {
    const order = await database.order.create({ data });
    return order;
  } catch (error) {
    console.error(error); // Lost error information
    return null; // No error details for caller
  }
}
```

### ✅ NEW PATTERN (Always Use)

```typescript
// ✅ NEW - ServiceResponse with type safety
async function createOrder(
  data: CreateOrderData,
): Promise<ServiceResponse<Order>> {
  return await this.traced("createOrder", async () => {
    try {
      // Validate
      const validated = await this.validate(CreateOrderSchema, data);

      // Business logic
      const order = await database.order.create({ data: validated });

      // Success with data
      return this.success(order);
    } catch (error) {
      // Error with details
      return this.error(
        "ORDER_CREATION_FAILED",
        error instanceof Error ? error.message : "Failed to create order",
      );
    }
  });
}
```

---

## 🔍 Type Safety Benefits

### Discriminated Union Magic

```typescript
const result = await service.createOrder(data);

// Before checking success
result.data; // ❌ TypeScript error: might not exist
result.error; // ❌ TypeScript error: might not exist

// After checking success
if (!result.success) {
  result.error; // ✅ TypeScript knows this exists
  result.data; // ❌ TypeScript error: doesn't exist in error response
  return;
}

// In success path
result.data; // ✅ TypeScript knows this exists
result.error; // ❌ TypeScript error: doesn't exist in success response
```

---

## 🛠️ Common Patterns

### Pattern 1: Simple Success

```typescript
async getData(): Promise<ServiceResponse<Data>> {
  const data = await database.data.findMany();
  return this.success(data);
}
```

### Pattern 2: Not Found Error

```typescript
async getById(id: string): Promise<ServiceResponse<Data>> {
  const data = await database.data.findUnique({ where: { id } });

  if (!data) {
    return this.error("NOT_FOUND", `Data with ID ${id} not found`);
  }

  return this.success(data);
}
```

### Pattern 3: Validation Error

```typescript
async create(request: CreateRequest): Promise<ServiceResponse<Data>> {
  // Automatic validation error handling
  const validated = await this.validate(CreateSchema, request);

  const data = await database.data.create({ data: validated });
  return this.success(data);
}
```

### Pattern 4: Multiple Error Checks

```typescript
async processOrder(orderId: string): Promise<ServiceResponse<Order>> {
  const order = await database.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return this.error("NOT_FOUND", "Order not found");
  }

  if (order.status === "CANCELLED") {
    return this.error("INVALID_STATE", "Cannot process cancelled order");
  }

  if (order.paymentStatus !== "PAID") {
    return this.error("PAYMENT_REQUIRED", "Order must be paid before processing");
  }

  // Process order...
  return this.success(updatedOrder);
}
```

### Pattern 5: With Metadata

```typescript
async getPaginatedData(page: number, limit: number): Promise<ServiceResponse<PaginatedData<Item>>> {
  const items = await database.item.findMany({ skip: (page - 1) * limit, take: limit });
  const total = await database.item.count();

  return this.success(
    {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      }
    },
    {
      cached: false,
      timestamp: new Date().toISOString(),
    }
  );
}
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Checking both success and data

```typescript
// ❌ WRONG - Redundant checks
if (!result.success || !result.data) {
  return error;
}

// ✅ CORRECT - Only check success
if (!result.success) {
  return error;
}
// TypeScript guarantees result.data exists here
```

### ❌ Mistake 2: Using optional chaining unnecessarily

```typescript
// ❌ WRONG - Unnecessary optional chaining
if (result.success) {
  console.log(result.data?.id); // data is guaranteed to exist
}

// ✅ CORRECT - Direct access
if (result.success) {
  console.log(result.data.id); // TypeScript knows data exists
}
```

### ❌ Mistake 3: Accessing error before checking

```typescript
// ❌ WRONG - TypeScript error
const errorMessage = result.error?.message;

// ✅ CORRECT - Check success first
const errorMessage = !result.success ? result.error.message : null;
```

### ❌ Mistake 4: Throwing errors instead of returning

```typescript
// ❌ WRONG - Don't throw in service methods
async createData(): Promise<ServiceResponse<Data>> {
  if (invalid) {
    throw new Error("Invalid data"); // Don't do this
  }
}

// ✅ CORRECT - Return error response
async createData(): Promise<ServiceResponse<Data>> {
  if (invalid) {
    return this.error("INVALID_DATA", "Data validation failed");
  }
}
```

---

## 📋 Checklist for Developers

### When Writing Service Methods

- [ ] Return type is `Promise<ServiceResponse<T>>`
- [ ] Use `this.traced()` for tracing
- [ ] Use `this.validate()` for validation
- [ ] Return `this.success(data)` on success
- [ ] Return `this.error(code, message)` on failure
- [ ] Never throw errors (return error responses)

### When Writing API Routes

- [ ] Check `result.success` first
- [ ] Access `result.error.message` in error path
- [ ] Access `result.data` in success path
- [ ] Return proper HTTP status codes
- [ ] Include error details in response

### When Writing Frontend Code

- [ ] Handle both success and error cases
- [ ] Check `response.success` before accessing data
- [ ] Display `error` or `error.message` to user
- [ ] Add loading and error states
- [ ] Log errors for debugging

### When Writing Tests

- [ ] Assert `result.success` value
- [ ] Check `result.data` in success tests
- [ ] Check `result.error` in error tests
- [ ] Test both success and failure paths
- [ ] Verify error codes and messages

---

## 🎓 Additional Resources

### Internal Documentation

- [Full Migration Guide](./CHECKOUT_SERVICE_MIGRATION_COMPLETE.md)
- [Service Response Types](./src/lib/types/service-response.ts)
- [BaseService Documentation](./src/lib/services/base.service.ts)

### Code Examples

- [CheckoutService](./src/lib/services/checkout.service.ts)
- [PaymentService](./src/lib/services/payment.service.ts)
- [API Routes](./src/app/api/checkout/)

---

## ❓ FAQ

**Q: Why use ServiceResponse instead of throwing errors?**  
A: ServiceResponse provides type-safe error handling, better observability, and consistent API contracts. Throwing errors loses type information and makes error handling unpredictable.

**Q: What if I need to return multiple error types?**  
A: Use different error codes in `ServiceError.code` (e.g., "VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED").

**Q: Can I nest ServiceResponse calls?**  
A: Yes! Check the inner response's success and propagate errors:

```typescript
const cartResult = await cartService.getCart(userId);
if (!cartResult.success) {
  return this.error("CART_ERROR", cartResult.error.message);
}
// Use cartResult.data
```

**Q: How do I handle pagination?**  
A: Use `PaginatedResponse<T>` type and include pagination metadata:

```typescript
return this.success({
  items: items,
  pagination: { page, limit, total, ... }
});
```

**Q: What about legacy code?**  
A: All new code should use ServiceResponse. Legacy code will be migrated gradually.

---

## 🎉 Summary

### Remember These Key Points

1. ✅ **Always** use `ServiceResponse<T>` for service methods
2. ✅ **Check** `result.success` first (discriminated union)
3. ✅ **Return** errors, don't throw them
4. ✅ **Access** `result.data` only after success check
5. ✅ **Provide** clear error codes and messages

### Quick Template

```typescript
async myMethod(input: Input): Promise<ServiceResponse<Output>> {
  return await this.traced("myMethod", async () => {
    // 1. Validate
    const validated = await this.validate(Schema, input);

    // 2. Business logic
    const result = await doSomething(validated);

    // 3. Return success
    return this.success(result);
  });
}
```

---

**Status:** ✅ Active - All new code must follow this pattern  
**Questions?** Contact the engineering team  
**Updates:** Check this document for latest patterns

_Last Updated: November 15, 2024_
