# 🎯 CONTROLLER PATTERN QUICK REFERENCE

**For**: Farmers Market Platform Developers  
**Purpose**: Quick guide to using the new controller pattern  
**Updated**: January 2025

---

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Creating a New Controller](#creating-a-new-controller)
3. [Using Controllers in Routes](#using-controllers-in-routes)
4. [Response Methods](#response-methods)
5. [Validation Examples](#validation-examples)
6. [Error Handling](#error-handling)
7. [Authentication Patterns](#authentication-patterns)
8. [Common Patterns](#common-patterns)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│         HTTP Request (Client)           │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  API Route (/app/api/*/route.ts)        │
│  - Rate limiting                        │
│  - Calls controller                     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Controller (/lib/controllers/*.ts)     │
│  - Request validation                   │
│  - Auth/authorization                   │
│  - Response formatting                  │
│  - Calls service                        │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Service (/lib/services/*.ts)           │
│  - Business logic                       │
│  - Validation rules                     │
│  - Calls repository                     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Repository (/lib/repositories/*.ts)    │
│  - Database operations                  │
│  - Query building                       │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Database (Prisma + PostgreSQL)  │
└─────────────────────────────────────────┘
```

---

## 🆕 Creating a New Controller

### Step 1: Define Validation Schemas

```typescript
// src/lib/controllers/product.controller.ts
import { z } from "zod";

const CreateProductSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  category: z.string(),
  description: z.string().optional(),
});

const UpdateProductSchema = CreateProductSchema.partial();

const ListProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  category: z.string().optional(),
});
```

### Step 2: Create Controller Class

```typescript
import { BaseController } from "./base.controller";
import { productService } from "@/lib/services/product.service";
import { NextRequest, NextResponse } from "next/server";

export class ProductController extends BaseController {
  constructor() {
    super("ProductController");
  }

  // List products (public endpoint)
  async listProducts(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      // Parse and validate query params
      const queryParams = this.validateQuery(request, ListProductsQuerySchema);

      // Call service
      const result = await productService.listProducts(queryParams);

      // Return success response with pagination
      return this.successWithPagination(result.products, {
        page: result.page,
        limit: queryParams.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    });
  }

  // Create product (authenticated, FARMER role required)
  async createProduct(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthorizedRequest(
      request,
      ["FARMER", "ADMIN"],
      async (session) => {
        // Validate request body
        const productData = await this.validateBody(
          request,
          CreateProductSchema,
        );
        if (!productData) {
          return this.badRequest("Invalid product data");
        }

        // Call service
        const product = await productService.createProduct(
          session.user.id,
          productData,
        );

        // Return created response (201)
        return this.created(product);
      },
    );
  }

  // Get single product (public)
  async getProduct(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const product = await productService.getProductById(params.id);

      if (!product) {
        return this.notFound("Product", params.id);
      }

      return this.success(product);
    });
  }

  // Update product (owner only)
  async updateProduct(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const updateData = await this.validateBody(request, UpdateProductSchema);
      if (!updateData) {
        return this.badRequest("Invalid update data");
      }

      const product = await productService.updateProduct(
        params.id,
        session.user.id,
        updateData,
      );

      return this.success(product);
    });
  }

  // Delete product (owner only)
  async deleteProduct(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      await productService.deleteProduct(params.id, session.user.id);
      return this.noContent();
    });
  }
}

// Export singleton
export const productController = new ProductController();
```

### Step 3: Export from Index

```typescript
// src/lib/controllers/index.ts
export { ProductController, productController } from "./product.controller";
```

---

## 🔌 Using Controllers in Routes

### Simple Route (GET/POST)

```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { productController } from "@/lib/controllers";
import {
  rateLimiters,
  createRateLimitResponse,
} from "@/lib/middleware/rate-limiter";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimit = await rateLimiters.public.check(request);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  // Delegate to controller
  return productController.listProducts(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimit = await rateLimiters.api.check(request);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  return productController.createProduct(request);
}
```

### Dynamic Route (with params)

```typescript
// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { productController } from "@/lib/controllers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  return productController.getProduct(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  return productController.updateProduct(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  return productController.deleteProduct(request, params);
}
```

---

## ✅ Response Methods

### Success Responses

```typescript
// Simple success (200)
return this.success(data);

// Success with metadata
return this.success(data, {
  count: data.length,
  customField: "value",
});

// Success with agricultural consciousness
return this.success(
  data,
  { count: data.length },
  {
    consciousness: "DIVINE",
    operation: "FARM_HARVEST",
  },
);

// Paginated success (200)
return this.successWithPagination(items, {
  page: 1,
  limit: 20,
  total: 100,
  totalPages: 5,
});

// Created (201)
return this.created(newResource);

// No content (204)
return this.noContent();
```

### Error Responses

```typescript
// Bad request (400)
return this.badRequest("Invalid input");

// Validation error (400)
return this.validationError(zodError);

// Unauthorized (401)
return this.unauthorized("Please log in");

// Forbidden (403)
return this.forbidden("Insufficient permissions", "ADMIN");

// Not found (404)
return this.notFound("Product", productId);

// Conflict (409)
return this.conflict("Product already exists", { name: "..." });

// Internal error (500)
return this.internalError("Something went wrong", error);

// Generic error
return this.error(new DivineError(...));
```

---

## 🔍 Validation Examples

### Body Validation

```typescript
async createResource(request: NextRequest): Promise<NextResponse> {
  return this.handleRequest(request, async () => {
    // Validate body with Zod schema
    const data = await this.validateBody(request, CreateResourceSchema);
    if (!data) {
      return this.badRequest("Invalid request body");
    }

    // data is now typed and validated!
    const resource = await service.create(data);
    return this.created(resource);
  });
}
```

### Query Parameter Validation

```typescript
async listResources(request: NextRequest): Promise<NextResponse> {
  return this.handleRequest(request, async () => {
    // Validate query parameters
    const params = this.validateQuery(request, ListResourcesQuerySchema);

    // params is now typed: { page: number, limit: number, ... }
    const results = await service.list(params);
    return this.success(results);
  });
}
```

### Pagination Helper

```typescript
async listResources(request: NextRequest): Promise<NextResponse> {
  return this.handleRequest(request, async () => {
    // Parse pagination from query params
    const { page, limit, skip } = this.parsePagination(
      request,
      1,    // default page
      20,   // default limit
      100   // max limit
    );

    const results = await service.list({ skip, take: limit });
    return this.successWithPagination(results.items, {
      page,
      limit,
      total: results.total,
      totalPages: Math.ceil(results.total / limit)
    });
  });
}
```

---

## ❌ Error Handling

### Automatic Error Catching

```typescript
// All errors are automatically caught and formatted
async someMethod(request: NextRequest): Promise<NextResponse> {
  return this.handleRequest(request, async () => {
    // If this throws, it's automatically caught and formatted as error response
    const data = await service.riskyOperation();
    return this.success(data);
  });
}
```

### Custom Error Handling

```typescript
async someMethod(request: NextRequest): Promise<NextResponse> {
  return this.handleRequest(request, async () => {
    try {
      const data = await service.riskyOperation();
      return this.success(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        return this.validationError(error.context.errors);
      }
      if (error instanceof NotFoundError) {
        return this.notFound(error.context.resource, error.context.id);
      }
      // Let base handler deal with unknown errors
      throw error;
    }
  });
}
```

---

## 🔐 Authentication Patterns

### Public Endpoint (No Auth)

```typescript
async getPublicData(request: NextRequest): Promise<NextResponse> {
  return this.handleRequest(request, async () => {
    const data = await service.getPublicData();
    return this.success(data);
  });
}
```

### Authenticated Endpoint (Any Logged-in User)

```typescript
async getMyProfile(request: NextRequest): Promise<NextResponse> {
  return this.handleAuthenticatedRequest(request, async (session) => {
    // session.user is guaranteed to exist
    const profile = await service.getProfile(session.user.id);
    return this.success(profile);
  });
}
```

### Role-Based Endpoint (Specific Role Required)

```typescript
async adminAction(request: NextRequest): Promise<NextResponse> {
  return this.handleAuthorizedRequest(
    request,
    "ADMIN", // Single role
    async (session) => {
      // User is guaranteed to be ADMIN
      const result = await service.adminOperation();
      return this.success(result);
    }
  );
}

async farmerOrAdminAction(request: NextRequest): Promise<NextResponse> {
  return this.handleAuthorizedRequest(
    request,
    ["FARMER", "ADMIN"], // Multiple roles allowed
    async (session) => {
      // User has one of these roles
      const result = await service.operation(session.user.id);
      return this.success(result);
    }
  );
}
```

### Ownership Check

```typescript
async updateResource(
  request: NextRequest,
  params: { id: string }
): Promise<NextResponse> {
  return this.handleAuthenticatedRequest(request, async (session) => {
    const updateData = await this.validateBody(request, UpdateSchema);

    // Service layer handles ownership check
    // If user doesn't own resource, service throws AuthorizationError
    const resource = await service.updateResource(
      params.id,
      session.user.id,
      updateData
    );

    return this.success(resource);
  });
}
```

---

## 🎨 Common Patterns

### List with Pagination

```typescript
async listItems(request: NextRequest): Promise<NextResponse> {
  return this.handleRequest(request, async () => {
    const { page, limit } = this.parsePagination(request);
    const result = await service.listItems({ page, limit });

    return this.successWithPagination(result.items, {
      page: result.page,
      limit,
      total: result.total,
      totalPages: result.totalPages
    });
  });
}
```

### Search Endpoint

```typescript
async searchItems(request: NextRequest): Promise<NextResponse> {
  return this.handleRequest(request, async () => {
    const params = this.validateQuery(request, SearchQuerySchema);
    const items = await service.search(params);

    return this.success(items, {
      count: items.length,
      searchQuery: params.query
    });
  });
}
```

### Batch Operations

```typescript
async batchCreate(request: NextRequest): Promise<NextResponse> {
  return this.handleAuthenticatedRequest(request, async (session) => {
    const items = await this.validateBody(request, BatchCreateSchema);
    if (!items) {
      return this.badRequest("Invalid batch data");
    }

    const results = await service.batchCreate(session.user.id, items);

    return this.created(results, {
      count: results.length,
      successful: results.filter(r => r.success).length
    });
  });
}
```

### Soft Delete

```typescript
async deleteItem(
  request: NextRequest,
  params: { id: string }
): Promise<NextResponse> {
  return this.handleAuthenticatedRequest(request, async (session) => {
    await service.softDelete(params.id, session.user.id);
    return this.noContent();
  });
}
```

### File Upload

```typescript
async uploadPhoto(
  request: NextRequest,
  params: { farmId: string }
): Promise<NextResponse> {
  return this.handleAuthenticatedRequest(request, async (session) => {
    const formData = await request.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return this.badRequest("No file provided");
    }

    const photo = await service.uploadPhoto(
      params.farmId,
      session.user.id,
      file
    );

    return this.created(photo);
  });
}
```

---

## 📊 Response Format Examples

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "farm-123",
    "name": "Divine Acres",
    "city": "Seattle",
    "state": "WA"
  },
  "meta": {
    "timestamp": "2025-01-15T12:00:00Z"
  },
  "agricultural": {
    "consciousness": "DIVINE",
    "operation": "FARM_RETRIEVAL"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...items],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "timestamp": "2025-01-15T12:00:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "validationErrors": [
      {
        "field": "name",
        "message": "Name must be at least 3 characters",
        "code": "too_small"
      }
    ],
    "resolutionSteps": [
      "Check the input data against the schema",
      "Ensure all required fields are provided",
      "Verify data types match expectations"
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T12:00:00Z"
  }
}
```

---

## 🧪 Testing Example

```typescript
// __tests__/controllers/product.controller.test.ts
import { ProductController } from "@/lib/controllers/product.controller";
import { NextRequest } from "next/server";

describe("ProductController", () => {
  let controller: ProductController;

  beforeEach(() => {
    controller = new ProductController();
  });

  describe("listProducts", () => {
    it("should return paginated products", async () => {
      const request = new NextRequest(
        "http://localhost/api/products?page=1&limit=20",
      );
      const response = await controller.listProducts(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.meta.pagination).toBeDefined();
    });
  });
});
```

---

## 🎯 Best Practices

### ✅ DO

- **Use appropriate handler methods** (`handleRequest`, `handleAuthenticatedRequest`, `handleAuthorizedRequest`)
- **Validate all inputs** with Zod schemas
- **Return consistent response formats** using base methods
- **Handle errors gracefully** with proper status codes
- **Log important operations** for monitoring
- **Use type-safe parameters** throughout

### ❌ DON'T

- **Don't access database directly** from controllers
- **Don't put business logic** in controllers (that's what services are for)
- **Don't return raw data** without using response methods
- **Don't ignore validation errors**
- **Don't catch all errors** without re-throwing or properly handling

---

## 📚 Additional Resources

- **Full Documentation**: `TASK_1_2_COMPLETION_REFACTOR_CONTROLLER.md`
- **Base Controller**: `src/lib/controllers/base.controller.ts`
- **Farm Controller Example**: `src/lib/controllers/farm.controller.ts`
- **Error Classes**: `src/lib/errors.ts`
- **Divine Instructions**: `.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md`

---

**Last Updated**: January 2025  
**Status**: Production Ready  
**Divine Score**: 💯/100

🌟 **Happy Coding with Divine Agricultural Consciousness!** 🚜✨
