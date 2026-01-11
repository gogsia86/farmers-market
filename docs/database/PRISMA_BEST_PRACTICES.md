# 🗄️ Prisma Best Practices Guide

**Version:** 1.0.0  
**Last Updated:** January 10, 2025  
**Status:** ✅ Production Ready  
**Audience:** All Developers

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Singleton Pattern](#database-singleton-pattern)
3. [Query Optimization](#query-optimization)
4. [N+1 Query Prevention](#n1-query-prevention)
5. [Transaction Management](#transaction-management)
6. [Connection Pooling](#connection-pooling)
7. [Migration Strategies](#migration-strategies)
8. [Schema Best Practices](#schema-best-practices)
9. [Type Safety Integration](#type-safety-integration)
10. [Error Handling](#error-handling)
11. [Testing with Prisma](#testing-with-prisma)
12. [Performance Monitoring](#performance-monitoring)
13. [Security Considerations](#security-considerations)
14. [Common Pitfalls](#common-pitfalls)

---

## 📖 Overview

This guide documents best practices for using Prisma ORM in the Farmers Market Platform. Follow these patterns to ensure optimal performance, maintainability, and type safety.

### Core Principles

1. **Single Database Instance:** Always use the singleton pattern
2. **Query Optimization:** Avoid N+1 queries, use select/include wisely
3. **Type Safety:** Leverage Prisma's TypeScript integration
4. **Transaction Management:** Use transactions for atomic operations
5. **Migration Discipline:** Always test migrations in development first

---

## 🔐 Database Singleton Pattern

### ❌ NEVER Create Multiple Instances

```typescript
// ❌ FORBIDDEN - Creates multiple connections
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

### ✅ ALWAYS Use the Singleton

```typescript
// ✅ CORRECT - Use singleton
import { database } from "@/lib/database";

// All queries use this singleton
const farms = await database.farm.findMany();
```

### Singleton Implementation

```typescript
// lib/database/index.ts
import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/monitoring/logger";

const createPrismaClient = () => {
  return new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "event" },
      { level: "warn", emit: "event" },
    ],
    errorFormat: "pretty",
  });
};

// Singleton with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const database = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}

// Query logging for slow queries
database.$on("query", (e) => {
  if (e.duration > 1000) {
    logger.warn("Slow query detected", {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});

// Error handling
database.$on("error", (e) => {
  logger.error("Database error", { error: e });
});
```

---

## ⚡ Query Optimization

### Select Only Required Fields

```typescript
// ❌ BAD - Fetches all fields (including large text fields)
const farms = await database.farm.findMany();

// ✅ GOOD - Select specific fields
const farms = await database.farm.findMany({
  select: {
    id: true,
    name: true,
    slug: true,
    status: true,
    location: {
      select: {
        city: true,
        state: true,
        coordinates: true,
      },
    },
  },
});

// ✅ EXCELLENT - Reusable select pattern
const farmSummarySelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  imageUrl: true,
  location: {
    select: {
      city: true,
      state: true,
    },
  },
  _count: {
    select: {
      products: true,
      reviews: true,
    },
  },
} as const;

const farms = await database.farm.findMany({
  select: farmSummarySelect,
});
```

### Use Include Strategically

```typescript
// ❌ BAD - Includes everything unnecessarily
const farm = await database.farm.findUnique({
  where: { id },
  include: {
    owner: true,
    products: true,
    reviews: true,
    orders: true,
    location: true,
  },
});

// ✅ GOOD - Include only what's needed
const farm = await database.farm.findUnique({
  where: { id },
  include: {
    owner: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    location: true,
    _count: {
      select: {
        products: true,
        reviews: true,
      },
    },
  },
});

// ✅ EXCELLENT - Conditional includes
async function getFarm(id: string, includeProducts: boolean = false) {
  return await database.farm.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      location: true,
      ...(includeProducts && {
        products: {
          where: { status: "ACTIVE" },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      }),
    },
  });
}
```

### Parallel Queries with Promise.all

```typescript
// ❌ BAD - Sequential queries (slow)
const farms = await database.farm.findMany({ where, take, skip });
const totalCount = await database.farm.count({ where });
const categories = await database.category.findMany({
  where: { active: true },
});

// ✅ GOOD - Parallel queries (fast)
const [farms, totalCount, categories] = await Promise.all([
  database.farm.findMany({ where, take, skip }),
  database.farm.count({ where }),
  database.category.findMany({ where: { active: true } }),
]);
```

### Cursor-Based Pagination (Large Datasets)

```typescript
// ❌ BAD - Offset pagination gets slower with large offsets
const page = 1000; // Very slow!
const pageSize = 20;
const farms = await database.farm.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

// ✅ GOOD - Cursor-based pagination
async function getFarmsPaginated(cursor?: string, pageSize: number = 20) {
  const farms = await database.farm.findMany({
    take: pageSize,
    skip: cursor ? 1 : 0, // Skip the cursor
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return {
    items: farms,
    nextCursor:
      farms.length === pageSize ? farms[farms.length - 1]?.id : undefined,
    hasMore: farms.length === pageSize,
  };
}
```

---

## 🚫 N+1 Query Prevention

### The N+1 Problem

```typescript
// ❌ BAD - N+1 queries (1 query for farms + N queries for products)
const farms = await database.farm.findMany();

for (const farm of farms) {
  // This creates a separate query for EACH farm!
  const products = await database.product.findMany({
    where: { farmId: farm.id },
  });
  console.log(farm.name, products.length);
}
```

### Solution 1: Use Include

```typescript
// ✅ GOOD - Single query with join
const farms = await database.farm.findMany({
  include: {
    products: {
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 10,
    },
  },
});

farms.forEach((farm) => {
  console.log(farm.name, farm.products.length);
});
```

### Solution 2: Batch Loading

```typescript
// ✅ EXCELLENT - Batch loading pattern
async function getFarmsWithProductCounts(farmIds: string[]) {
  // Single query to get all farms
  const farms = await database.farm.findMany({
    where: { id: { in: farmIds } },
  });

  // Single query to get all product counts
  const productCounts = await database.product.groupBy({
    by: ["farmId"],
    where: { farmId: { in: farmIds } },
    _count: { id: true },
  });

  // Map counts to farms
  const countMap = new Map(
    productCounts.map((pc) => [pc.farmId, pc._count.id]),
  );

  return farms.map((farm) => ({
    ...farm,
    productCount: countMap.get(farm.id) ?? 0,
  }));
}
```

### Solution 3: DataLoader Pattern

```typescript
// ✅ ADVANCED - DataLoader for batching and caching
import DataLoader from "dataloader";

const productLoader = new DataLoader<string, Product[]>(
  async (farmIds: readonly string[]) => {
    const products = await database.product.findMany({
      where: { farmId: { in: [...farmIds] } },
    });

    // Group by farmId
    const productsByFarm = new Map<string, Product[]>();
    products.forEach((product) => {
      const existing = productsByFarm.get(product.farmId) ?? [];
      productsByFarm.set(product.farmId, [...existing, product]);
    });

    // Return in same order as input
    return farmIds.map((id) => productsByFarm.get(id) ?? []);
  },
);

// Usage - automatically batches and caches
const [farm1Products, farm2Products] = await Promise.all([
  productLoader.load("farm_1"),
  productLoader.load("farm_2"),
]);
```

---

## 🔄 Transaction Management

### Basic Transaction

```typescript
// ✅ Sequential transaction
async function transferInventory(
  fromProductId: string,
  toProductId: string,
  quantity: number,
) {
  return await database.$transaction(async (tx) => {
    // Decrement source
    const fromProduct = await tx.product.update({
      where: { id: fromProductId },
      data: { quantityAvailable: { decrement: quantity } },
    });

    if (fromProduct.quantityAvailable < 0) {
      throw new Error("Insufficient inventory");
    }

    // Increment destination
    await tx.product.update({
      where: { id: toProductId },
      data: { quantityAvailable: { increment: quantity } },
    });

    return { success: true };
  });
}
```

### Batch Transaction

```typescript
// ✅ Batch operations in transaction
async function updateMultiplePrices(
  updates: Array<{ id: string; price: number }>,
) {
  return await database.$transaction(
    updates.map((update) =>
      database.product.update({
        where: { id: update.id },
        data: { price: update.price },
      }),
    ),
  );
}
```

### Complex Multi-Step Transaction

```typescript
// ✅ Complex business logic in transaction
async function processOrder(orderId: string) {
  return await database.$transaction(
    async (tx) => {
      // 1. Get order with items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // 2. Validate and update inventory
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.quantityAvailable < item.quantity) {
          throw new Error(`Insufficient inventory for ${item.productId}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { quantityAvailable: { decrement: item.quantity } },
        });
      }

      // 3. Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "PROCESSING" },
      });

      // 4. Create notification
      await tx.notification.create({
        data: {
          userId: order.customerId,
          type: "ORDER_CONFIRMED",
          message: `Your order ${orderId} has been confirmed`,
        },
      });

      return updatedOrder;
    },
    {
      maxWait: 5000, // Max time to wait for transaction
      timeout: 10000, // Max time transaction can run
    },
  );
}
```

### Transaction Isolation Levels

```typescript
// ✅ Custom isolation level
await database.$transaction(
  async (tx) => {
    // Critical operations
  },
  {
    isolationLevel: "Serializable", // Strongest isolation
  },
);
```

---

## 🔌 Connection Pooling

### Optimal Configuration

```typescript
// DATABASE_URL configuration
// postgresql://user:password@localhost:5432/dbname?schema=public&connection_limit=10&pool_timeout=20

// Or in Prisma datasource
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Connection Pool Best Practices

```typescript
// ✅ Monitor active connections
database.$on("query", (e) => {
  // Track query duration
  metrics.histogram("db.query.duration", e.duration);
});

// ✅ Graceful shutdown
async function gracefulShutdown() {
  await database.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
```

### Connection Pool Sizing

```
Recommended formula:
connections = (core_count * 2) + effective_spindle_count

For most apps:
- Development: 5-10 connections
- Production: 10-20 connections per instance
- High traffic: 20-50 connections per instance
```

---

## 🔄 Migration Strategies

### Development Workflow

```bash
# 1. Make schema changes
# Edit schema.prisma

# 2. Create migration
npm run db:migrate:dev -- --name add_farm_certifications

# 3. Review migration SQL
# Check prisma/migrations/[timestamp]_add_farm_certifications/migration.sql

# 4. Test migration
npm run db:migrate:reset  # Reset and replay all migrations

# 5. Commit migration files
git add prisma/migrations/
git commit -m "Add farm certifications"
```

### Production Deployment

```bash
# ✅ CORRECT - Production migration workflow

# 1. Backup database first!
pg_dump dbname > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy migration
npm run db:migrate:deploy

# 3. Verify migration
npm run db:migrate:status

# 4. Monitor application
# Watch for errors, performance issues
```

### Zero-Downtime Migrations

```typescript
// ✅ Pattern: Add column with default
// Step 1: Add nullable column
model Farm {
  id          String   @id
  name        String
  description String?  // New optional column
}

// Step 2: Deploy, backfill data
await database.farm.updateMany({
  where: { description: null },
  data: { description: '' }
});

// Step 3: Make required in next deployment
model Farm {
  id          String   @id
  name        String
  description String   @default("") // Now required
}
```

### Migration Rollback Strategy

```typescript
// ✅ Keep rollback SQL ready
/*
  Rollback SQL for migration: 20250110_add_certifications
  
  -- Undo changes
  ALTER TABLE "Farm" DROP COLUMN "certifications";
  
  -- Restore data from backup if needed
  -- pg_restore -d dbname backup.sql
*/
```

---

## 📐 Schema Best Practices

### Naming Conventions

```prisma
// ✅ GOOD - Clear, consistent naming
model Farm {
  id          String   @id @default(cuid())
  name        String   @db.VarChar(100)
  slug        String   @unique @db.VarChar(120)
  description String   @db.Text
  status      FarmStatus @default(PENDING_VERIFICATION)

  // Foreign keys use model name + Id
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations (plural)
  products    Product[]
  orders      Order[]

  @@index([ownerId])
  @@index([status])
  @@map("farms") // Table name in database
}
```

### Enum Best Practices

```prisma
// ✅ GOOD - Descriptive enums
enum FarmStatus {
  DRAFT
  PENDING_VERIFICATION
  UNDER_REVIEW
  ACTIVE
  SUSPENDED
  REJECTED
  ARCHIVED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

### Index Strategy

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  farmId      String
  categoryId  String
  status      ProductStatus
  price       Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now())

  // Single-column indexes for foreign keys
  @@index([farmId])
  @@index([categoryId])

  // Index for filtering
  @@index([status])

  // Composite index for common queries
  @@index([farmId, status])
  @@index([categoryId, status])

  // Full-text search (PostgreSQL)
  @@index([name], type: Hash)
}
```

### JSON Fields (Use Sparingly)

```prisma
model Farm {
  id       String @id
  name     String

  // ⚠️ JSON for flexible, non-queryable data only
  metadata Json?  // Settings, preferences, etc.

  // ✅ Prefer typed relations for queryable data
  location Location?
}

model Location {
  id         String @id
  farmId     String @unique
  farm       Farm   @relation(fields: [farmId], references: [id])

  address    String
  city       String
  state      String
  zipCode    String

  // Structured data is better than JSON
  coordinates Json?  // { lat: number, lng: number }
}
```

---

## 🔒 Type Safety Integration

### Always Use Type-Only Imports

```typescript
// ✅ CORRECT - Type-only imports
import type { Farm, Product, User, Prisma } from "@prisma/client";

// ❌ NEVER import PrismaClient directly
// import { PrismaClient } from "@prisma/client";
```

### Prisma Type Utilities

```typescript
// Get payload type with relations
type FarmWithProducts = Prisma.FarmGetPayload<{
  include: { products: true };
}>;

type FarmSummary = Prisma.FarmGetPayload<{
  select: {
    id: true;
    name: true;
    status: true;
  };
}>;

// Input types
type CreateFarmInput = Prisma.FarmCreateInput;
type UpdateFarmInput = Prisma.FarmUpdateInput;
type FarmWhereInput = Prisma.FarmWhereInput;

// Use in functions
async function createFarm(data: CreateFarmInput): Promise<Farm> {
  return await database.farm.create({ data });
}

async function findFarms(where: FarmWhereInput): Promise<Farm[]> {
  return await database.farm.findMany({ where });
}
```

---

## 🚨 Error Handling

### Handle Prisma Errors

```typescript
import { Prisma } from "@prisma/client";

async function createFarm(data: CreateFarmInput): Promise<Farm> {
  try {
    return await database.farm.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation
      if (error.code === "P2002") {
        throw new Error(`Farm with this ${error.meta?.target} already exists`);
      }

      // Foreign key constraint violation
      if (error.code === "P2003") {
        throw new Error("Invalid reference to related record");
      }

      // Record not found
      if (error.code === "P2025") {
        throw new Error("Farm not found");
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new Error("Invalid data provided");
    }

    // Unknown error
    logger.error("Database error", { error });
    throw new Error("An unexpected database error occurred");
  }
}
```

### Common Prisma Error Codes

```typescript
const PRISMA_ERROR_CODES = {
  P2002: "Unique constraint violation",
  P2003: "Foreign key constraint violation",
  P2025: "Record not found",
  P2014: "Relation violation",
  P2021: "Table does not exist",
  P2022: "Column does not exist",
} as const;
```

---

## 🧪 Testing with Prisma

### Test Database Setup

```typescript
// tests/helpers/database.ts
import { PrismaClient } from "@prisma/client";

let testDb: PrismaClient;

export async function createTestDatabase() {
  testDb = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL,
      },
    },
  });

  // Clean database
  await testDb.$executeRawUnsafe('TRUNCATE TABLE "Farm" CASCADE');
  await testDb.$executeRawUnsafe('TRUNCATE TABLE "Product" CASCADE');

  return testDb;
}

export async function cleanupTestDatabase() {
  await testDb.$disconnect();
}
```

### Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDatabase, cleanupTestDatabase } from "./helpers/database";

describe("FarmRepository", () => {
  let testDb: PrismaClient;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it("should create a farm", async () => {
    const farm = await testDb.farm.create({
      data: {
        name: "Test Farm",
        slug: "test-farm",
        ownerId: "user_123",
        status: "ACTIVE",
      },
    });

    expect(farm.name).toBe("Test Farm");
    expect(farm.status).toBe("ACTIVE");
  });

  it("should enforce unique constraint", async () => {
    await expect(
      testDb.farm.create({
        data: {
          name: "Duplicate",
          slug: "test-farm", // Same slug
          ownerId: "user_123",
          status: "ACTIVE",
        },
      }),
    ).rejects.toThrow();
  });
});
```

---

## 📊 Performance Monitoring

### Query Logging

```typescript
// Enable query logging
database.$on("query", (e) => {
  logger.debug("Query executed", {
    query: e.query,
    params: e.params,
    duration: e.duration,
    target: e.target,
  });
});
```

### Slow Query Detection

```typescript
database.$on("query", (e) => {
  if (e.duration > 1000) {
    logger.warn("Slow query detected", {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });

    // Send to monitoring service
    metrics.increment("db.slow_queries");
    metrics.histogram("db.query.duration", e.duration);
  }
});
```

### Connection Monitoring

```typescript
async function monitorConnections() {
  const result = await database.$queryRaw`
    SELECT count(*) as connection_count
    FROM pg_stat_activity
    WHERE datname = current_database()
  `;

  const count = result[0].connection_count;
  metrics.gauge("db.connections.active", count);

  if (count > 15) {
    logger.warn("High connection count", { count });
  }
}

// Run every 30 seconds
setInterval(monitorConnections, 30000);
```

---

## 🔐 Security Considerations

### Prevent SQL Injection

```typescript
// ✅ SAFE - Parameterized queries (Prisma default)
const farms = await database.farm.findMany({
  where: { name: { contains: userInput } },
});

// ✅ SAFE - Raw queries with parameters
const result = await database.$queryRaw`
  SELECT * FROM "Farm"
  WHERE name ILIKE ${`%${userInput}%`}
`;

// ❌ DANGEROUS - String concatenation
const result = await database.$queryRawUnsafe(
  `SELECT * FROM "Farm" WHERE name = '${userInput}'`,
); // SQL injection risk!
```

### Row-Level Security

```typescript
// ✅ Always filter by user context
async function getFarms(userId: string) {
  return await database.farm.findMany({
    where: { ownerId: userId }, // User can only see their farms
  });
}

// ✅ Validate ownership before updates
async function updateFarm(
  farmId: string,
  userId: string,
  data: UpdateFarmInput,
) {
  const farm = await database.farm.findUnique({
    where: { id: farmId },
  });

  if (farm?.ownerId !== userId) {
    throw new Error("Unauthorized");
  }

  return await database.farm.update({
    where: { id: farmId },
    data,
  });
}
```

---

## ⚠️ Common Pitfalls

### 1. Forgetting to Await

```typescript
// ❌ BAD - Missing await
const farms = database.farm.findMany(); // Returns Promise!
console.log(farms.length); // undefined

// ✅ GOOD
const farms = await database.farm.findMany();
console.log(farms.length); // Correct
```

### 2. Not Handling Null Results

```typescript
// ❌ BAD - Might throw if not found
const farm = await database.farm.findUnique({ where: { id } });
console.log(farm.name); // Error if null!

// ✅ GOOD - Handle null
const farm = await database.farm.findUnique({ where: { id } });
if (!farm) {
  throw new Error("Farm not found");
}
console.log(farm.name); // Safe
```

### 3. Inefficient Counting

```typescript
// ❌ BAD - Fetches all records to count
const farms = await database.farm.findMany();
const count = farms.length; // Wasteful!

// ✅ GOOD - Use count
const count = await database.farm.count();
```

### 4. Not Using Transactions

```typescript
// ❌ BAD - No transaction, can leave inconsistent state
await database.product.update({
  where: { id: productId },
  data: { quantityAvailable: { decrement: quantity } },
});
// If this fails, inventory is already decremented!
await database.order.create({ data: orderData });

// ✅ GOOD - Use transaction
await database.$transaction(async (tx) => {
  await tx.product.update({
    where: { id: productId },
    data: { quantityAvailable: { decrement: quantity } },
  });
  await tx.order.create({ data: orderData });
});
```

### 5. Over-Fetching Relations

```typescript
// ❌ BAD - Fetches everything
const farms = await database.farm.findMany({
  include: {
    owner: true,
    products: true,
    orders: true,
    reviews: true,
  },
});

// ✅ GOOD - Only what's needed
const farms = await database.farm.findMany({
  include: {
    owner: {
      select: { id: true, name: true },
    },
    _count: {
      select: { products: true },
    },
  },
});
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Database Singleton](../lib/database/index.ts)
- [TypeScript Patterns](../development/TYPESCRIPT_PATTERNS.md)
- [.cursorrules](../../.cursorrules)

---

**Last Updated:** January 10, 2025  
**Maintained By:** Engineering Team  
**Version:** 1.0.0

_"Query with precision, optimize with purpose, scale with confidence."_ 🗄️⚡
