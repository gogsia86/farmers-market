# 🚀 Next Steps: Repository Refactor Action Plan

**Date**: December 2024  
**Status**: Ready to Execute  
**Prerequisites**: ✅ All TypeScript errors resolved  
**Estimated Time**: 12-18 hours total

---

## 📋 Overview

With all TypeScript errors now resolved, we can proceed with the architectural improvements outlined in the original plan. This document provides a detailed, step-by-step guide for implementing the repository pattern throughout the application.

---

## 🎯 Immediate Priority Tasks

### Task 1: Refactor FarmService ⭐ **START HERE**
**Priority**: HIGH  
**Estimated Time**: 2-3 hours  
**Complexity**: Medium

#### Objective
Remove direct database calls from FarmService and use the repository layer instead.

#### Current State
```typescript
// src/lib/services/farm.service.ts (BEFORE)
export class FarmService {
  async getFarmBySlug(slug: string) {
    // ❌ Direct database access
    const farm = await database.farm.findUnique({
      where: { slug },
      include: { owner: true, products: true }
    });
    return farm;
  }
}
```

#### Target State
```typescript
// src/lib/services/farm.service.ts (AFTER)
import { farmRepository } from "@/lib/repositories";

export class FarmService {
  async getFarmBySlug(slug: string) {
    // ✅ Use repository
    const farm = await farmRepository.findBySlug(slug);
    return farm;
  }
}
```

#### Steps

1. **Import Repository** (5 min)
   ```typescript
   import { farmRepository } from "@/lib/repositories";
   ```

2. **Replace CRUD Operations** (30 min)
   - `database.farm.findUnique` → `farmRepository.findById` or `farmRepository.findBySlug`
   - `database.farm.findMany` → `farmRepository.findAll` with filters
   - `database.farm.create` → `farmRepository.create`
   - `database.farm.update` → `farmRepository.update`
   - `database.farm.delete` → `farmRepository.delete`

3. **Replace Complex Queries** (45 min)
   - Search operations → `farmRepository.search`
   - Nearby farms → `farmRepository.findNearby`
   - Active farms → `farmRepository.findActive`
   - Status updates → Use repository methods

4. **Update Business Logic** (30 min)
   - Keep validation logic in service
   - Keep business rules in service
   - Delegate data access to repository

5. **Test Refactored Methods** (30 min)
   ```bash
   npm run test -- farm.service
   ```

#### Files to Modify
- `src/lib/services/farm.service.ts` (Primary)
- Update any imports in route handlers if needed

#### Success Criteria
- ✅ No direct `database.farm.*` calls in FarmService
- ✅ All tests pass
- ✅ TypeScript compiles without errors
- ✅ API routes continue to work

---

### Task 2: Implement BaseController
**Priority**: HIGH  
**Estimated Time**: 4-5 hours  
**Complexity**: Medium-High

#### Objective
Create a controller layer to handle HTTP requests, separating concerns from route handlers.

#### Implementation Plan

##### Step 1: Create BaseController (1 hour)

**File**: `src/lib/controllers/base.controller.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp?: string;
    requestId?: string;
  };
}

export abstract class BaseController {
  /**
   * Handle successful response
   */
  protected success<T>(
    data: T,
    meta?: ApiResponse<T>["meta"],
    status: number = 200
  ): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          ...meta,
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse<T>,
      { status }
    );
  }

  /**
   * Handle error response
   */
  protected error(
    message: string,
    code: string = "INTERNAL_ERROR",
    status: number = 500,
    details?: any
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          details,
        },
      } as ApiResponse,
      { status }
    );
  }

  /**
   * Handle validation errors
   */
  protected validationError(
    errors: z.ZodError
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors.issues,
        },
      } as ApiResponse,
      { status: 400 }
    );
  }

  /**
   * Parse and validate request body
   */
  protected async parseBody<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
    try {
      const body = await request.json();
      const validation = schema.safeParse(body);

      if (!validation.success) {
        return {
          success: false,
          error: this.validationError(validation.error),
        };
      }

      return { success: true, data: validation.data };
    } catch (error) {
      return {
        success: false,
        error: this.error("Invalid JSON body", "PARSE_ERROR", 400),
      };
    }
  }

  /**
   * Handle async operation with error catching
   */
  protected async handleAsync<T>(
    operation: () => Promise<T>
  ): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      console.error("Controller error:", error);
      
      const message = error instanceof Error ? error.message : "Unknown error";
      const code = (error as any).code || "INTERNAL_ERROR";
      
      return {
        success: false,
        error: this.error(message, code),
      };
    }
  }
}
```

##### Step 2: Create FarmController (2 hours)

**File**: `src/lib/controllers/farm.controller.ts`

```typescript
import { NextRequest } from "next/server";
import { z } from "zod";
import { BaseController } from "./base.controller";
import { farmService } from "@/lib/services/farm.service";

// Validation schemas
const GetFarmsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED", "INACTIVE"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  search: z.string().optional(),
});

const CreateFarmSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

const UpdateFarmSchema = CreateFarmSchema.partial();

export class FarmController extends BaseController {
  /**
   * GET /api/farms
   * List all farms with pagination and filters
   */
  async list(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const queryValidation = GetFarmsQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      city: searchParams.get("city"),
      state: searchParams.get("state"),
      search: searchParams.get("search"),
    });

    if (!queryValidation.success) {
      return this.validationError(queryValidation.error);
    }

    const result = await this.handleAsync(async () => {
      return await farmService.getFarms(queryValidation.data);
    });

    if (!result.success) {
      return result.error;
    }

    return this.success(result.data, {
      pagination: {
        page: queryValidation.data.page,
        limit: queryValidation.data.limit,
        total: result.data.total,
        totalPages: Math.ceil(result.data.total / queryValidation.data.limit),
      },
    });
  }

  /**
   * GET /api/farms/[slug]
   * Get single farm by slug
   */
  async getBySlug(slug: string) {
    if (!slug) {
      return this.error("Slug is required", "SLUG_REQUIRED", 400);
    }

    const result = await this.handleAsync(async () => {
      return await farmService.getFarmBySlug(slug);
    });

    if (!result.success) {
      return result.error;
    }

    if (!result.data) {
      return this.error("Farm not found", "FARM_NOT_FOUND", 404);
    }

    return this.success(result.data);
  }

  /**
   * POST /api/farms
   * Create new farm
   */
  async create(request: NextRequest) {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session?.user) return this.error("Unauthorized", "AUTH_REQUIRED", 401);

    const bodyResult = await this.parseBody(request, CreateFarmSchema);
    if (!bodyResult.success) {
      return bodyResult.error;
    }

    const result = await this.handleAsync(async () => {
      return await farmService.createFarm(bodyResult.data);
    });

    if (!result.success) {
      return result.error;
    }

    return this.success(result.data, undefined, 201);
  }

  /**
   * PATCH /api/farms/[id]
   * Update farm
   */
  async update(id: string, request: NextRequest) {
    if (!id) {
      return this.error("Farm ID is required", "ID_REQUIRED", 400);
    }

    const bodyResult = await this.parseBody(request, UpdateFarmSchema);
    if (!bodyResult.success) {
      return bodyResult.error;
    }

    const result = await this.handleAsync(async () => {
      return await farmService.updateFarm(id, bodyResult.data);
    });

    if (!result.success) {
      return result.error;
    }

    return this.success(result.data);
  }

  /**
   * DELETE /api/farms/[id]
   * Delete farm
   */
  async delete(id: string) {
    if (!id) {
      return this.error("Farm ID is required", "ID_REQUIRED", 400);
    }

    const result = await this.handleAsync(async () => {
      return await farmService.deleteFarm(id);
    });

    if (!result.success) {
      return result.error;
    }

    return this.success({ deleted: true });
  }
}

// Export singleton instance
export const farmController = new FarmController();
```

##### Step 3: Refactor Route Handler (1 hour)

**File**: `src/app/api/farms/[slug]/route.ts`

```typescript
// BEFORE (Direct service calls in route)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const farm = await farmService.getFarmBySlug(params.slug);
    if (!farm) {
      return NextResponse.json(
        { error: "Farm not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, farm });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}

// AFTER (Use controller)
import { farmController } from "@/lib/controllers/farm.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return await farmController.getBySlug(params.slug);
}
```

##### Step 4: Create Controller Index (15 min)

**File**: `src/lib/controllers/index.ts`

```typescript
export { BaseController } from "./base.controller";
export { farmController } from "./farm.controller";
export type { ApiResponse } from "./base.controller";
```

#### Files to Create
- ✅ `src/lib/controllers/base.controller.ts`
- ✅ `src/lib/controllers/farm.controller.ts`
- ✅ `src/lib/controllers/index.ts`

#### Files to Modify
- ✅ `src/app/api/farms/[slug]/route.ts`
- ✅ `src/app/api/farms/route.ts` (if exists)

#### Success Criteria
- ✅ BaseController provides reusable response methods
- ✅ FarmController handles all farm-related HTTP operations
- ✅ Route handlers are thin wrappers around controllers
- ✅ Consistent API response format across all endpoints
- ✅ All tests pass

---

### Task 3: Add Repository Tests
**Priority**: HIGH  
**Estimated Time**: 6-8 hours  
**Complexity**: Medium

#### Test Structure

```
src/lib/repositories/__tests__/
├── farm.repository.test.ts
├── product.repository.test.ts
├── order.repository.test.ts
└── user.repository.test.ts
```

#### Example Test File

**File**: `src/lib/repositories/__tests__/farm.repository.test.ts`

```typescript
import { farmRepository } from "../farm.repository";
import { database } from "@/lib/database";

// Mock database
jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("FarmRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a farm with valid data", async () => {
      const mockFarm = {
        id: "farm-1",
        name: "Test Farm",
        slug: "test-farm",
        status: "ACTIVE",
      };

      (database.farm.create as jest.Mock).mockResolvedValue(mockFarm);

      const result = await farmRepository.create({
        name: "Test Farm",
        slug: "test-farm",
        ownerId: "user-1",
      });

      expect(result).toEqual(mockFarm);
      expect(database.farm.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findBySlug", () => {
    it("should find farm by slug", async () => {
      const mockFarm = {
        id: "farm-1",
        name: "Test Farm",
        slug: "test-farm",
      };

      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);

      const result = await farmRepository.findBySlug("test-farm");

      expect(result).toEqual(mockFarm);
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { slug: "test-farm" },
      });
    });

    it("should return null for non-existent slug", async () => {
      (database.farm.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await farmRepository.findBySlug("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findActive", () => {
    it("should return only active farms", async () => {
      const mockFarms = [
        { id: "farm-1", status: "ACTIVE" },
        { id: "farm-2", status: "ACTIVE" },
      ];

      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);

      const result = await farmRepository.findActive();

      expect(result).toEqual(mockFarms);
      expect(database.farm.findMany).toHaveBeenCalledWith({
        where: { status: "ACTIVE" },
      });
    });
  });

  // Add more tests for other methods...
});
```

#### Test Coverage Goals
- ✅ Unit tests for all repository methods
- ✅ Test successful operations
- ✅ Test error conditions
- ✅ Test edge cases (empty results, null values)
- ✅ Test transaction handling
- ✅ Test filter combinations

#### Running Tests
```bash
# Run all repository tests
npm run test -- repositories

# Run specific repository test
npm run test -- farm.repository

# Run with coverage
npm run test:coverage -- repositories
```

---

## 📅 Execution Timeline

### Week 1: Core Refactoring
- **Day 1-2**: Task 1 - Refactor FarmService (2-3 hours)
- **Day 3-4**: Task 2 - Implement BaseController and FarmController (4-5 hours)
- **Day 5**: Testing and fixes (2-3 hours)

### Week 2: Testing & Expansion
- **Day 1-3**: Task 3 - Write repository tests (6-8 hours)
- **Day 4-5**: Expand to ProductService and ProductController (3-4 hours)

### Week 3: Polish & Documentation
- **Day 1-2**: OrderService and UserService refactoring (4-5 hours)
- **Day 3-4**: Integration testing (3-4 hours)
- **Day 5**: Documentation and code review (2-3 hours)

---

## 🎯 Success Metrics

### Code Quality
- ✅ 0 TypeScript errors maintained
- ✅ 80%+ test coverage on repositories
- ✅ 70%+ test coverage on services
- ✅ All linting rules passing

### Architecture
- ✅ No direct database calls in services
- ✅ Consistent API response format
- ✅ Separation of concerns (Controller → Service → Repository → Database)
- ✅ Reusable base classes

### Performance
- ✅ Query optimization with repository layer
- ✅ Caching strategies in place
- ✅ No N+1 query issues

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Over-abstracting
**Problem**: Creating too many layers of abstraction  
**Solution**: Keep it simple - Controller → Service → Repository is enough

### Pitfall 2: Breaking existing functionality
**Problem**: Refactoring breaks working features  
**Solution**: Write tests FIRST, then refactor

### Pitfall 3: Inconsistent patterns
**Problem**: Different controllers/services using different patterns  
**Solution**: Follow BaseController pattern strictly

### Pitfall 4: Missing error handling
**Problem**: Errors not properly caught and returned  
**Solution**: Use `handleAsync` method in BaseController

---

## 📚 Additional Resources

- [Repository Pattern Documentation](./DIVINE_REVIEW_2024/REPOSITORY_QUICK_START.md)
- [TypeScript Fixes Summary](./TYPESCRIPT_FIXES_COMPLETE.md)
- [Divine Instructions](./.github/instructions/)
- [Testing Guide](./TESTING_COMPLETE_SUMMARY.md)

---

## ✅ Checklist

### Pre-Refactor
- [x] All TypeScript errors resolved
- [x] Repository layer implemented
- [x] Documentation reviewed
- [ ] Team alignment on approach

### During Refactor
- [ ] FarmService refactored
- [ ] BaseController implemented
- [ ] FarmController implemented
- [ ] Route handlers updated
- [ ] Tests written for repositories
- [ ] All tests passing

### Post-Refactor
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Performance tested
- [ ] Ready for production

---

## 🎉 Expected Outcome

After completing these tasks, you will have:

1. ✅ **Clean Architecture**
   - Controller layer handling HTTP concerns
   - Service layer handling business logic
   - Repository layer handling data access
   - Clear separation of concerns

2. ✅ **Type Safety**
   - 100% TypeScript coverage
   - No runtime type errors
   - Validated request/response types

3. ✅ **Testability**
   - Unit tests for repositories
   - Unit tests for services
   - Integration tests for controllers
   - High test coverage

4. ✅ **Maintainability**
   - Consistent patterns across codebase
   - Reusable base classes
   - Clear documentation
   - Easy to extend

---

**Ready to Start?** → Begin with **Task 1: Refactor FarmService** ⭐

---

*"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."* 🌾⚡