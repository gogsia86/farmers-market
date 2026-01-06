# 🚀 QUICK START GUIDE - Refactored Architecture

**Last Updated:** January 2025
**For Developers:** Using the new Claude Sonnet 4.5 architecture

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Key Changes](#key-changes)
3. [Quick Examples](#quick-examples)
4. [Common Patterns](#common-patterns)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide helps you quickly understand and use the new architectural patterns implemented across the Farmers Market Platform.

**What Changed:**
- ✅ Service → Repository → Database pattern (was: Service → Database)
- ✅ Multi-layer caching (L1 memory + L2 Redis)
- ✅ Centralized Zod validation
- ✅ Standardized API responses with request tracking
- ✅ Query performance monitoring
- ✅ Enhanced error handling

---

## 🔑 Key Changes

### 1. Import Paths You'll Use

```typescript
// Validation
import { CreateFarmSchema, UpdateFarmSchema, FarmQuerySchema } from '@/lib/validators/farm.validators';

// Services (business logic)
import { farmService } from '@/lib/services/farm.service';

// Repositories (data access) - rarely used directly
import { farmRepository } from '@/lib/repositories/farm.repository';

// API Response Handlers
import {
  createRequestContext,
  successResponse,
  createdResponse,
  errorResponse,
  handleApiError,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  paginatedResponse,
} from '@/lib/api/response-handlers';

// Caching
import { multiLayerCache, CacheKeys, CacheTTL } from '@/lib/cache/multi-layer.cache';

// Logging
import { logger, createLogger } from '@/lib/monitoring/logger';

// Rate Limiting
import { checkRateLimit, getClientIp, API_RATE_LIMIT } from '@/lib/rate-limit';
```

---

## 💡 Quick Examples

### Example 1: Create API Route (The New Way)

```typescript
// app/api/farms/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { farmService } from '@/lib/services/farm.service';
import { CreateFarmSchema } from '@/lib/validators/farm.validators';
import {
  createRequestContext,
  createdResponse,
  unauthorizedResponse,
  handleApiError,
} from '@/lib/api/response-handlers';

export async function POST(request: NextRequest) {
  // 1. Create request context (generates requestId, tracks time)
  const ctx = createRequestContext();

  try {
    // 2. Check authentication
    const session = await auth();
    if (!session?.user) {
      return unauthorizedResponse('Authentication required', ctx);
    }

    // 3. Parse and validate input
    const body = await request.json();
    const validated = CreateFarmSchema.parse(body);

    // 4. Call service (handles caching, transactions, logging)
    const farm = await farmService.createFarm({
      ...validated,
      ownerId: session.user.id,
    });

    // 5. Return standardized response (includes requestId, duration, timestamp)
    return createdResponse(farm, ctx);

  } catch (error) {
    // 6. Automatic error handling (converts to appropriate HTTP response)
    return handleApiError(error, ctx);
  }
}
```

**What You Get:**
- ✅ Automatic validation with helpful error messages
- ✅ Request tracking with unique ID
- ✅ Performance timing
- ✅ Caching (if service implements it)
- ✅ Proper HTTP status codes
- ✅ Consistent response format
- ✅ Security-safe error messages

---

### Example 2: Use Service with Caching

```typescript
// In your component or API route
import { farmService } from '@/lib/services/farm.service';

// Get farm by ID (automatically cached)
const farm = await farmService.getFarmById('farm_123');

// Get farm by slug (automatically cached)
const farm = await farmService.getFarmBySlug('organic-acres-seattle');

// List farms (with pagination, cached)
const result = await farmService.getAllFarms({
  page: 1,
  limit: 20,
  status: 'ACTIVE',
  city: 'Seattle',
  searchQuery: 'organic',
});

// result = {
//   farms: [...],
//   total: 150,
//   hasMore: true,
//   page: 1,
//   pageSize: 20,
// }
```

---

### Example 3: Manual Cache Usage

```typescript
import { multiLayerCache, CacheKeys, CacheTTL } from '@/lib/cache/multi-layer.cache';

// Get or set pattern (most common)
const farm = await multiLayerCache.getOrSet(
  CacheKeys.farm(farmId),
  async () => {
    // This function only runs on cache miss
    return await farmRepository.findById(farmId);
  },
  { ttl: CacheTTL.LONG } // 2 hours
);

// Manual cache operations
await multiLayerCache.set('my-key', data, { ttl: CacheTTL.SHORT });
const cached = await multiLayerCache.get('my-key');
await multiLayerCache.delete('my-key');

// Pattern-based invalidation
await multiLayerCache.invalidatePattern('farms:*'); // Clear all farm caches
await multiLayerCache.invalidatePattern(`farms:owner:${userId}*`);

// Get cache statistics
const stats = multiLayerCache.getStats();
console.log(stats.l1.hitRate, stats.l2.hitRate);
```

---

### Example 4: Create Custom Validation Schema

```typescript
// lib/validators/product.validators.ts
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must not exceed 100 characters')
    .trim(),

  price: z
    .number()
    .positive('Price must be positive')
    .max(10000, 'Price must not exceed $10,000'),

  category: z.enum(['VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'OTHER']),

  inStock: z.boolean().default(true),

  farmId: z.string().uuid('Invalid farm ID'),
});

// Type inference (no duplicate type definitions!)
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// Use in API
const validated = CreateProductSchema.parse(body);
// validated is now type-safe CreateProductInput
```

---

### Example 5: Structured Logging

```typescript
import { createLogger } from '@/lib/monitoring/logger';

// Create logger with context
const logger = createLogger('ProductService', { module: 'products' });

// Log operations
logger.info('Creating product', { farmId, productName: 'Organic Tomatoes' });
logger.debug('Cache hit', { key: 'product:123', layer: 'L1' });
logger.warn('Slow operation detected', { operation: 'getProducts', duration: 1500 });
logger.error('Product creation failed', { farmId, error: error.message });

// All logs include:
// - Timestamp
// - Log level
// - Context (ProductService)
// - Custom metadata
```

---

## 🎨 Common Patterns

### Pattern 1: API Route with Rate Limiting

```typescript
export async function POST(request: NextRequest) {
  const ctx = createRequestContext();

  // Check rate limit
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, API_RATE_LIMIT);

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetTime, ctx);
  }

  // Continue with request...
}
```

### Pattern 2: Paginated Response

```typescript
export async function GET(request: NextRequest) {
  const ctx = createRequestContext();

  try {
    const result = await farmService.getAllFarms({ page: 1, limit: 20 });

    return paginatedResponse(
      result.farms,
      {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.total,
      },
      ctx
    );
  } catch (error) {
    return handleApiError(error, ctx);
  }
}
```

### Pattern 3: Service with Transactions

```typescript
// In your service
async createFarmWithProducts(farmData, productsData) {
  const requestId = logger.generateRequestId();

  return await farmRepository.withTransaction(async (tx) => {
    // All operations use same transaction
    const farm = await farmRepository.create(farmData, { tx });

    const products = await Promise.all(
      productsData.map(p =>
        productRepository.create({ ...p, farmId: farm.id }, { tx })
      )
    );

    // If any operation fails, all are rolled back
    return { farm, products };
  });
}
```

### Pattern 4: Cache Invalidation on Update

```typescript
async updateFarm(farmId: string, updates: UpdateFarmInput) {
  const requestId = logger.generateRequestId();

  try {
    // Update farm
    const farm = await farmRepository.update(farmId, updates);

    // Invalidate related caches
    await Promise.all([
      multiLayerCache.delete(CacheKeys.farm(farmId)),
      multiLayerCache.delete(CacheKeys.farmBySlug(farm.slug)),
      multiLayerCache.invalidatePattern(`farms:owner:${farm.ownerId}*`),
      multiLayerCache.invalidatePattern('farms:list:*'),
    ]);

    return farm;
  } catch (error) {
    logger.error('Farm update failed', { requestId, farmId, error });
    throw error;
  }
}
```

---

## 🔧 Troubleshooting

### Issue: Validation Errors Not Showing

**Problem:** Getting generic validation error instead of field-specific errors.

**Solution:** Use `validationErrorResponse` for Zod errors:

```typescript
try {
  const validated = CreateFarmSchema.parse(body);
} catch (error) {
  if (error instanceof ZodError) {
    return validationErrorResponse(error, ctx);
  }
  throw error;
}
```

### Issue: Cache Not Working

**Problem:** Redis cache not being used.

**Check:**
1. Is `REDIS_HOST` environment variable set?
2. Is Redis running? Test: `redis-cli ping`
3. Check logs for "Redis connected" message

**Fallback:** System automatically falls back to L1 (memory) cache if Redis unavailable.

### Issue: Slow Queries

**Problem:** Seeing "Slow query detected" warnings in logs.

**Steps:**
1. Check which query is slow (in logs)
2. Add database index if needed
3. Optimize query (reduce includes, use select)
4. Add caching for frequently accessed data

```typescript
// Before (slow)
const farms = await database.farm.findMany({
  include: { products: true, reviews: true, orders: true }
});

// After (fast)
const farms = await database.farm.findMany({
  select: { id: true, name: true, slug: true } // Only needed fields
});
```

### Issue: Request ID Not in Logs

**Problem:** Request tracking not working.

**Solution:** Always create context at start of route:

```typescript
export async function POST(request: NextRequest) {
  const ctx = createRequestContext(); // ← Do this first!

  // Use ctx in all response functions
  return successResponse(data, ctx);
}
```

### Issue: Type Errors with Validation

**Problem:** TypeScript errors when using validated data.

**Solution:** Import and use the inferred type:

```typescript
import { CreateFarmSchema, type CreateFarmInput } from '@/lib/validators/farm.validators';

function handleFarmData(data: CreateFarmInput) {
  // data is fully typed
  console.log(data.name, data.email, data.latitude);
}

const validated = CreateFarmSchema.parse(body);
handleFarmData(validated); // ✅ Type-safe
```

---

## 📚 Additional Resources

- **Full Implementation Details:** See `IMPLEMENTATION_COMPLETE_SUMMARY.md`
- **Architecture Analysis:** See `CLAUDE_SONNET_45_ARCHITECTURAL_ANALYSIS.md`
- **Development Guidelines:** See `.cursorrules`
- **Code Examples:** Check `src/app/api/farms/route.ts` for complete API route example

---

## 🎓 Learning Path

**Day 1: Basics**
1. Read this guide
2. Look at `src/app/api/farms/route.ts` (reference implementation)
3. Try creating a simple API route with validation

**Day 2: Services & Caching**
1. Study `src/lib/services/farm.service.ts`
2. Understand cache key patterns in `CacheKeys`
3. Add caching to an existing service method

**Day 3: Advanced Patterns**
1. Learn transaction patterns in repositories
2. Study error handling in `response-handlers.ts`
3. Implement custom validation schema

---

## ✅ Checklist for New API Routes

When creating a new API route, make sure you:

- [ ] Import and use `createRequestContext()`
- [ ] Validate input with Zod schema
- [ ] Use service layer (not direct database access)
- [ ] Return standardized responses (successResponse, etc.)
- [ ] Use `handleApiError` in catch block
- [ ] Add rate limiting for POST/PUT/DELETE
- [ ] Add logging for important operations
- [ ] Consider caching for GET requests
- [ ] Write tests (unit + integration)

---

## 🎉 You're Ready!

You now know the essentials of the new architecture. Start with simple changes and gradually adopt more patterns.

**Need Help?**
- Check the full implementation summary
- Look at existing code examples
- Review Zod documentation for validation
- Check logs for performance insights

**Divine agricultural consciousness achieved** ✨🌾

---

**Last Updated:** January 2025
**Architecture Version:** Claude Sonnet 4.5 - v4.0 Ultimate Edition
