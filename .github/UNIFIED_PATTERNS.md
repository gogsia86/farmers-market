# 🎯 Unified Patterns & Anti-Patterns

**Last Updated:** November 5, 2025
**Purpose:** Quick reference for correct import patterns after repository consolidation

---

## ✅ DATABASE ACCESS (Canonical Pattern)

### **DO: Use the canonical database location**

```typescript
// ✅ CORRECT - Canonical import
import { database } from "@/lib/database";

// Use in services, API routes, server components
const user = await database.user.findUnique({ where: { id } });
```

### **DO: Import types from @prisma/client**

```typescript
// ✅ CORRECT - Type imports are fine
import type { User, Farm, Product, Order } from "@prisma/client";
import type { Prisma } from "@prisma/client";

// Use for type annotations
function processUser(user: User) { ... }
```

### **DON'T: Create new PrismaClient instances**

```typescript
// ❌ WRONG - Don't instantiate new clients
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(); // DON'T DO THIS!
```

### **DON'T: Import from legacy locations**

```typescript
// ⚠️ DEPRECATED - Don't use these patterns
import { database } from "@/lib/database.ts"; // ❌ Wrong - .ts extension

// ✅ CORRECT - Use this pattern
import { database } from "@/lib/database"; // Points to database/index.ts
```

---

## ✅ SERVICE LAYER (Business Logic)

### **DO: Place business logic in services**

```typescript
// ✅ CORRECT - Service layer pattern
// src/lib/services/product.service.ts
import { database } from "@/lib/database";
import type { Product, Farm } from "@prisma/client";

export class ProductService {
  static async createProduct(input: CreateProductInput, userId: string) {
    // Validation
    const farm = await database.farm.findUnique({
      where: { id: input.farmId },
    });
    if (!farm) throw new Error("Farm not found");

    // Business logic
    const slug = generateSlug(input.name);

    // Database operation
    return database.product.create({ data: { ...input, slug } });
  }
}
```

### **DO: Call services from API routes**

```typescript
// ✅ CORRECT - API route delegates to service
// src/app/api/products/route.ts
import { ProductService } from "@/lib/services/product.service";

export async function POST(req: Request) {
  const input = await req.json();
  const userId = await getCurrentUserId();

  const product = await ProductService.createProduct(input, userId);
  return Response.json(product);
}
```

### **DON'T: Access database directly from API routes**

```typescript
// ❌ WRONG - Business logic in API route
import { database } from "@/lib/database";

export async function POST(req: Request) {
  const input = await req.json();
  // Validation, slugging, business logic scattered here
  const product = await database.product.create({ data: input });
  return Response.json(product);
}
```

---

## ✅ VALIDATION PATTERNS

### **Two validation directories serve different purposes:**

#### **`lib/validations/` = Zod Schemas (Input Validation)**

```typescript
// ✅ CORRECT - Zod schemas for request validation
// src/lib/validations/product.ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  farmId: z.string().uuid(),
});
```

#### **`lib/validation/` = Business Logic Validators**

```typescript
// ✅ CORRECT - Complex business validation
// src/lib/validation/order.validation.ts
import { database } from "@/lib/database";

export class OrderValidator {
  static async validateOrderCreation(customerId: string, items: OrderItem[]) {
    // Check inventory, farm status, user limits, etc.
    const errors: string[] = [];

    for (const item of items) {
      const product = await database.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) errors.push(`Product ${item.productId} not found`);
      if (product.inventory < item.quantity) {
        errors.push(`Insufficient inventory for ${product.name}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
```

---

## ✅ AUTH & MIDDLEWARE

### **DO: Use auth helpers from lib/auth**

```typescript
// ✅ CORRECT - Use auth helpers
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin(); // Throws if not admin
  // ... admin-only logic
}
```

### **DO: Protect routes with middleware**

```typescript
// ✅ CORRECT - Place admin pages in (admin) route group
// src/app/(admin)/farms/page.tsx
// Middleware automatically protects all /admin/* routes
```

### **DON'T: Implement auth in every route**

```typescript
// ❌ WRONG - Duplicated auth logic
export async function GET() {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  // ... logic
}
```

---

## ✅ PATH ALIASES

All projects use `@/` for `src/`:

```typescript
// ✅ CORRECT
import { database } from "@/lib/database";
import { ProductService } from "@/lib/services/product.service";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/user.types";
```

---

## ✅ TESTING

### **DO: Mock database in tests**

```typescript
// ✅ CORRECT - Jest automatically mocks database
import { database } from "@/lib/database";
import { ProductService } from "@/lib/services/product.service";

jest.mock("@/lib/database");

test("creates product", async () => {
  (database.product.create as jest.Mock).mockResolvedValue(mockProduct);

  const result = await ProductService.createProduct(input, userId);
  expect(result).toEqual(mockProduct);
});
```

---

## 📊 FILE LOCATIONS REFERENCE

| What                | Canonical Location                             | Legacy (Deprecated)                         |
| ------------------- | ---------------------------------------------- | ------------------------------------------- |
| Database client     | `@/lib/database` → `src/lib/database/index.ts` | ~~`@/lib/prisma`~~, ~~`@/lib/database.ts`~~ |
| Auth config         | `@/lib/auth/config`                            | ✅ No duplicates                            |
| Services            | `@/lib/services/*.service.ts`                  | ✅ No duplicates                            |
| Zod schemas         | `@/lib/validations/*.ts`                       | ✅ Different purpose                        |
| Business validation | `@/lib/validation/*.validation.ts`             | ✅ Different purpose                        |

---

## 🔍 QUICK CHECKS

**Before committing, verify:**

1. ✅ No `new PrismaClient()` in feature code
2. ✅ All database imports use `@/lib/database`
3. ✅ Business logic is in services, not API routes
4. ✅ Admin routes are in `src/app/(admin)/`
5. ✅ Tests mock the database singleton

---

## 🚀 MIGRATION GUIDE

**If you have old code using deprecated patterns:**

```typescript
// OLD (still works but deprecated)
import { prisma } from "@/lib/prisma";

// NEW (canonical)
import { database } from "@/lib/database";

// Find & replace:
// prisma.user → database.user
// prisma.farm → database.farm
```

---

**Questions?** See `.github/copilot-instructions.md` for detailed guidance.
