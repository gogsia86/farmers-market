# 🚀 DEVELOPER QUICK REFERENCE CARD

## Farmers Market Platform - Backend Controllers

**Last Updated**: December 2024  
**Status**: Production Ready ✅  
**Quick Start Guide for New Developers**

---

## 📋 QUICK STATUS CHECK

```bash
# Check TypeScript errors
npm run type-check
# Expected: ✅ 0 errors

# Run all controller tests
npm test -- --testPathPatterns="controller" --no-coverage
# Expected: ✅ 104/104 passing

# Run full test suite
npm test -- --no-coverage
# Expected: ✅ 2745+ passing
```

---

## 🎯 CORE PATTERN: ServiceResponse<T>

### The Golden Rule

**ALL service methods MUST return ServiceResponse<T>**

```typescript
interface ServiceResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    agricultural?: AgriculturalMetadata;
  };
}
```

### Controller Pattern (ALWAYS USE THIS)

```typescript
// ✅ CORRECT - Check success, access data
async createFarm(request: NextRequest): Promise<NextResponse> {
  return this.handleAuthenticatedRequest(request, async (session) => {
    // 1. Validate input
    const validated = CreateFarmSchema.parse(body);

    // 2. Call service
    const result = await farmService.createFarm(userId, validated);

    // 3. Check success
    if (!result.success) {
      return this.internalError(result.error.message);
    }

    // 4. Access data
    return this.created(result.data, { message: "Success" });
  });
}

// ❌ WRONG - Direct data access
async createFarm(request: NextRequest): Promise<NextResponse> {
  const farm = await farmService.createFarm(userId, validated);
  return this.created(farm, { message: "Success" }); // BREAKS!
}
```

### Test Pattern (ALWAYS USE THIS)

```typescript
// ✅ CORRECT - Wrap in ServiceResponse
mockFarmService.createFarm = jest.fn().mockResolvedValue({
  success: true,
  data: mockFarm,
});

// ❌ WRONG - Raw data
mockFarmService.createFarm = jest.fn().mockResolvedValue(mockFarm);
```

---

## 🏗️ ARCHITECTURE LAYERS

```
┌─────────────────────────────────────────┐
│   API Route (app/api/farms/route.ts)   │
│   - HTTP handling only                  │
│   - Calls controller                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Controller (lib/controllers/*.ts)     │
│   - Thin orchestration layer            │
│   - Auth & validation                   │
│   - Calls service                       │
│   - Checks result.success               │
│   - Accesses result.data                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Service (lib/services/*.ts)           │
│   - Business logic                      │
│   - Returns ServiceResponse<T>          │
│   - Calls repository                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Repository (lib/repositories/*.ts)    │
│   - Data access only                    │
│   - Prisma queries                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Database (Prisma + PostgreSQL)        │
└─────────────────────────────────────────┘
```

---

## 📁 FILE STRUCTURE

```
src/
├── app/
│   └── api/
│       ├── farms/route.ts          # Farm API routes
│       ├── products/route.ts       # Product API routes
│       └── orders/route.ts         # Order API routes
│
├── lib/
│   ├── controllers/
│   │   ├── farm.controller.ts      # Farm controller
│   │   ├── product.controller.ts   # Product controller
│   │   ├── order.controller.ts     # Order controller
│   │   ├── base.controller.ts      # Base controller class
│   │   └── __tests__/              # Controller tests
│   │
│   ├── services/
│   │   ├── farm.service.ts         # Farm service
│   │   ├── product.service.ts      # Product service
│   │   ├── order.service.ts        # Order service
│   │   └── __tests__/              # Service tests
│   │
│   ├── repositories/
│   │   ├── farm.repository.ts      # Farm data access
│   │   ├── product.repository.ts   # Product data access
│   │   └── order.repository.ts     # Order data access
│   │
│   ├── validations/
│   │   ├── farm.ts                 # Farm Zod schemas
│   │   ├── product.ts              # Product Zod schemas
│   │   └── order.ts                # Order Zod schemas
│   │
│   ├── database/
│   │   └── index.ts                # Database singleton
│   │
│   └── auth/
│       └── index.ts                # Authentication
│
└── types/
    └── index.ts                    # TypeScript types
```

---

## 🛠️ COMMON TASKS

### Create New Controller Method

```typescript
// 1. Add method to controller
async getItemById(
  request: NextRequest,
  params: { id: string }
): Promise<NextResponse> {
  return this.handleAuthenticatedRequest(request, async (session) => {
    // Validate
    const validated = IdParamSchema.parse(params);

    // Call service
    const result = await itemService.getById(validated.id);

    // Check success
    if (!result.success) {
      return this.internalError(result.error.message);
    }

    // Check not found
    if (!result.data) {
      return this.notFound("Item", validated.id);
    }

    // Return success
    return this.success(result.data);
  });
}

// 2. Add test
it("should return item by ID", async () => {
  mockItemService.getById = jest.fn().mockResolvedValue({
    success: true,
    data: mockItem
  });

  const response = await controller.getItemById(request, { id: "123" });
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(data.data.id).toBe("123");
});
```

### Create New Service Method

```typescript
// Service method MUST return ServiceResponse<T>
async getById(id: string): Promise<ServiceResponse<Item | null>> {
  try {
    const item = await database.item.findUnique({
      where: { id }
    });

    return {
      success: true,
      data: item
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: "ITEM_FETCH_ERROR"
      }
    };
  }
}
```

---

## ✅ TESTING CHECKLIST

### Before Committing

```bash
# 1. Type check
npm run type-check
# Must show: ✅ 0 errors

# 2. Run tests
npm test
# Must show: ✅ All passing

# 3. Lint
npm run lint
# Must show: ✅ No errors

# 4. Format
npm run format
# Auto-fixes formatting
```

### Writing Tests

```typescript
describe("YourController", () => {
  let mockService: any;
  let testController: YourController;

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(null);

    // Create mock service
    mockService = {
      methodName: jest.fn(),
    };

    // Create controller with mock
    testController = new YourController(mockService);
  });

  it("should do something", async () => {
    // Setup
    (auth as jest.Mock).mockResolvedValue(mockSession);
    mockService.methodName = jest.fn().mockResolvedValue({
      success: true,
      data: mockData, // ALWAYS wrap in ServiceResponse!
    });

    // Execute
    const response = await testController.methodName(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockData);
  });
});
```

---

## 🔒 AUTHENTICATION & AUTHORIZATION

### Require Authentication

```typescript
// All protected routes use this pattern
return this.handleAuthenticatedRequest(request, async (session) => {
  // session.user.id - User ID
  // session.user.role - User role (CUSTOMER, FARMER, ADMIN)
  // Your logic here
});
```

### Check Authorization

```typescript
// Role-based
if (session.user.role !== "ADMIN") {
  return this.forbidden("Admin access required", session.user.role);
}

// Ownership-based
if (resource.ownerId !== session.user.id && session.user.role !== "ADMIN") {
  return this.forbidden("You don't own this resource", session.user.role);
}
```

---

## 🎨 RESPONSE HELPERS

```typescript
// Success (200)
return this.success(data, { message: "Success" });

// Created (201)
return this.created(data, { message: "Created" });

// No Content (204)
return this.noContent();

// Bad Request (400)
return this.badRequest("Invalid input");

// Unauthorized (401)
return this.unauthorized("Authentication required");

// Forbidden (403)
return this.forbidden("Insufficient permissions", userRole);

// Not Found (404)
return this.notFound("Resource", resourceId);

// Internal Error (500)
return this.internalError(error.message);

// With Pagination
return this.successWithPagination(items, paginationMeta);
```

---

## 🚫 COMMON MISTAKES TO AVOID

### ❌ DON'T: Access service data directly

```typescript
const farm = await farmService.createFarm(data);
return this.created(farm); // WRONG!
```

### ✅ DO: Check success and access data

```typescript
const result = await farmService.createFarm(data);
if (!result.success) {
  return this.internalError(result.error.message);
}
return this.created(result.data); // CORRECT!
```

### ❌ DON'T: Return raw data from mocks

```typescript
mockService.getFarm = jest.fn().mockResolvedValue(mockFarm); // WRONG!
```

### ✅ DO: Wrap mock data in ServiceResponse

```typescript
mockService.getFarm = jest.fn().mockResolvedValue({
  success: true,
  data: mockFarm,
}); // CORRECT!
```

### ❌ DON'T: Create new Prisma instances

```typescript
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(); // WRONG!
```

### ✅ DO: Use the canonical database import

```typescript
import { database } from "@/lib/database"; // CORRECT!
```

---

## 📚 KEY IMPORTS

```typescript
// Controllers
import { BaseController } from "@/lib/controllers/base.controller";

// Services (singleton instances)
import { farmService } from "@/lib/services/farm.service";
import { productService } from "@/lib/services/product.service";
import { orderService } from "@/lib/services/order.service";

// Database (singleton)
import { database } from "@/lib/database";

// Authentication
import { auth } from "@/lib/auth";

// Validation schemas
import { CreateFarmSchema } from "@/lib/validations/farm";

// Types
import type { ServiceResponse } from "@/lib/types";
```

---

## 🐛 DEBUGGING TIPS

### Tests Failing?

```bash
# 1. Check if mock returns ServiceResponse
mockService.method = jest.fn().mockResolvedValue({
  success: true,
  data: mockData  # ← Must be wrapped!
});

# 2. Check parameter count in expectations
expect(mockService.method).toHaveBeenCalledWith(
  param1,
  param2,
  param3  # ← Don't miss parameters!
);

# 3. Run single test file
npm test -- --testPathPatterns="your-file"
```

### TypeScript Errors?

```bash
# 1. Run type check
npm run type-check

# 2. Check imports
import type { Type } from "...";  # Use 'type' imports

# 3. Check for 'any' types
# Search and replace with proper types
```

---

## 🎯 QUICK WINS

### Need to add a new endpoint?

1. Add controller method (check .success, access .data)
2. Add test (wrap mock in ServiceResponse)
3. Add API route (call controller method)
4. Run tests ✅

### Need to fix a failing test?

1. Check if mock returns ServiceResponse
2. Check parameter count matches call signature
3. Check response structure expectations
4. Run test again ✅

### Need to add validation?

1. Create Zod schema in validations/
2. Parse in controller: `Schema.parse(data)`
3. Test with invalid data
4. Verify 400 response ✅

---

## 📞 NEED HELP?

### Documentation References

- `FINAL_CONTROLLER_STATUS_REPORT.md` - Comprehensive status
- `CONTROLLER_VICTORY_SUMMARY.md` - Quick victory reference
- `NEXT_STEPS_ACTION_PLAN.md` - Future roadmap
- `.github/instructions/` - Divine instruction guides

### Quick Commands

```bash
# Full test suite
npm test

# Single test file
npm test -- --testPathPatterns="controller-name"

# Watch mode
npm test -- --watch

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

---

## ✨ DIVINE PATTERNS

### Agricultural Consciousness

```typescript
// Include agricultural metadata in responses
return this.success(farm, {
  message: "Farm retrieved successfully",
  agricultural: {
    consciousness: "BIODYNAMIC",
    season: this.getCurrentSeason(),
    operation: "FARM_MANIFESTATION",
  },
});
```

### Enlightening Errors

```typescript
// Provide helpful error messages
if (
  !validated.deliveryAddressId &&
  validated.fulfillmentMethod === "DELIVERY"
) {
  return this.badRequest(
    "Delivery address is required for delivery orders. " +
      "Please provide a deliveryAddressId or choose FARM_PICKUP.",
  );
}
```

---

## 🎉 FINAL CHECKLIST

Before pushing code:

- [ ] TypeScript errors: 0
- [ ] All tests passing
- [ ] ServiceResponse<T> pattern used
- [ ] Tests wrap mocks in ServiceResponse
- [ ] Authentication checked
- [ ] Authorization verified
- [ ] Input validation added
- [ ] Helpful error messages
- [ ] Code formatted
- [ ] Documentation updated

---

**Remember**:

- Check `.success` before accessing `.data`
- Wrap test mocks in `ServiceResponse`
- Use `database` singleton, not new `PrismaClient()`
- Agricultural consciousness in all responses 🌾

**You're ready to build divine agricultural features! ⚡🚀**

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Status**: PRODUCTION READY ✅
