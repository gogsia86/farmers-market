# 🗄️ Cache Patterns & Best Practices

## Overview

The Farmers Market Platform implements a sophisticated multi-layer caching system optimized for high-performance agricultural data access. This document provides comprehensive guidelines for using the cache effectively.

## Architecture

### Cache Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  L1 Cache (Memory)                                           │
│  - In-process Map<K,V>                                       │
│  - Instant access (< 1ms)                                    │
│  - Limited by available RAM (64GB HP OMEN)                   │
│  - Automatic eviction on expiry                              │
├─────────────────────────────────────────────────────────────┤
│  L2 Cache (Redis)                                            │
│  - Distributed key-value store                               │
│  - Fast access (~2-5ms local, ~10-20ms network)              │
│  - Shared across application instances                       │
│  - Persistent across restarts                                │
├─────────────────────────────────────────────────────────────┤
│  L3 Database (PostgreSQL)                                    │
│  - Source of truth                                           │
│  - Slower access (~50-200ms with queries)                    │
│  - Always consistent                                         │
└─────────────────────────────────────────────────────────────┘
```

## Cache Service API

### Basic Operations

#### 1. Set Cache Value

```typescript
import { cacheService } from "@/lib/cache/cache-service";

// Simple set with default TTL (5 minutes)
await cacheService.set("user:123", userData);

// Set with custom TTL (1 hour)
await cacheService.set("farm:456", farmData, {
  ttl: 3600,
});

// Set with tags for group invalidation
await cacheService.set("product:789", productData, {
  ttl: 1800,
  tags: ["farm:456", "category:vegetables"],
});

// Set with metadata
await cacheService.set("order:101", orderData, {
  ttl: 600,
  tags: ["user:123", "farm:456"],
  metadata: {
    created: new Date().toISOString(),
    version: "v2",
  },
});
```

#### 2. Get Cache Value

```typescript
// Simple get (returns null if not found or expired)
const user = await cacheService.get<User>("user:123");

if (!user) {
  // Cache miss - fetch from database
  const user = await database.user.findUnique({ where: { id: "123" } });
  await cacheService.set("user:123", user);
}

// Type-safe get with interface
interface Farm {
  id: string;
  name: string;
  location: string;
}

const farm = await cacheService.get<Farm>("farm:456");
```

#### 3. Invalidate Cache

```typescript
// Invalidate single key
await cacheService.invalidate("user:123");

// Invalidate by tags (bulk invalidation)
const invalidatedCount = await cacheService.invalidateByTags([
  "farm:456",
  "category:vegetables",
]);

console.log(`Invalidated ${invalidatedCount} cache entries`);
```

#### 4. Check Cache Statistics

```typescript
const stats = cacheService.getStats();

console.log(`
  Hits: ${stats.hits}
  Misses: ${stats.misses}
  Hit Rate: ${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)}%
  Sets: ${stats.sets}
  Deletes: ${stats.deletes}
  Size: ${stats.size} entries
`);
```

## Cache Key Naming Conventions

### Standard Format

```
<entity>:<id>[:<sub-entity>][:<filter>]
```

### Examples

```typescript
// User caches
"user:123"                          // User profile
"user:123:farms"                    // User's farms list
"user:123:orders"                   // User's orders list
"user:123:favorites"                // User's favorite farms

// Farm caches
"farm:456"                          // Farm profile
"farm:456:products"                 // Farm's products
"farm:456:products:active"          // Farm's active products only
"farm:456:orders:pending"           // Farm's pending orders
"farm:456:stats"                    // Farm statistics

// Product caches
"product:789"                       // Single product
"products:featured"                 // Featured products list
"products:category:vegetables"      // Products by category
"products:search:tomato"            // Search results

// Order caches
"order:101"                         // Single order
"orders:user:123:recent"            // User's recent orders
"orders:farm:456:pending"           // Farm's pending orders

// Global/aggregate caches
"farms:all"                         // All farms list
"farms:verified"                    // Verified farms only
"categories:all"                    // All categories
"stats:daily:2024-01-15"            // Daily statistics
```

## Cache TTL Strategy

### Recommended TTL Values

```typescript
export const CACHE_TTL = {
  // User data - moderate changes
  USER_PROFILE: 300,              // 5 minutes
  USER_PREFERENCES: 600,          // 10 minutes
  USER_FAVORITES: 180,            // 3 minutes

  // Farm data - infrequent changes
  FARM_PROFILE: 600,              // 10 minutes
  FARM_VERIFICATION: 3600,        // 1 hour
  FARM_STATS: 300,                // 5 minutes

  // Product data - frequent updates
  PRODUCT: 180,                   // 3 minutes
  PRODUCT_LIST: 120,              // 2 minutes
  PRODUCT_SEARCH: 60,             // 1 minute
  PRODUCT_AVAILABILITY: 30,       // 30 seconds

  // Order data - real-time
  ORDER_DETAILS: 60,              // 1 minute
  ORDER_STATUS: 30,               // 30 seconds
  PENDING_ORDERS: 30,             // 30 seconds

  // Static/reference data - rare changes
  CATEGORIES: 3600,               // 1 hour
  CERTIFICATIONS: 7200,           // 2 hours
  SYSTEM_CONFIG: 1800,            // 30 minutes

  // Computed/aggregate data
  STATISTICS: 300,                // 5 minutes
  REPORTS: 600,                   // 10 minutes
  SEARCH_RESULTS: 60,             // 1 minute

  // Session data
  SESSION: 900,                   // 15 minutes
  AUTH_TOKEN: 3600,               // 1 hour
} as const;
```

## Tag-Based Invalidation

### Tag Naming Convention

```
<entity>:<id>
```

### Example: Farm Product Update

```typescript
// When creating a product
async function createProduct(farmId: string, productData: CreateProductRequest) {
  const product = await database.product.create({
    data: {
      ...productData,
      farmId,
    },
  });

  // Cache the product with tags
  await cacheService.set(`product:${product.id}`, product, {
    ttl: CACHE_TTL.PRODUCT,
    tags: [
      `farm:${farmId}`,                     // Farm relationship
      `category:${product.category}`,       // Category relationship
      `products`,                           // Global products tag
    ],
  });

  // Invalidate related caches
  await cacheService.invalidateByTags([
    `farm:${farmId}`,                       // Invalidate all farm-related caches
  ]);

  return product;
}

// When updating a product
async function updateProduct(productId: string, updates: UpdateProductRequest) {
  const product = await database.product.update({
    where: { id: productId },
    data: updates,
  });

  // Invalidate product cache and related farm caches
  await cacheService.invalidate(`product:${productId}`);
  await cacheService.invalidateByTags([
    `farm:${product.farmId}`,
    `category:${product.category}`,
  ]);

  return product;
}

// When deleting a product
async function deleteProduct(productId: string) {
  const product = await database.product.findUnique({
    where: { id: productId },
  });

  await database.product.delete({ where: { id: productId } });

  // Clean up cache
  await cacheService.invalidate(`product:${productId}`);
  await cacheService.invalidateByTags([
    `farm:${product.farmId}`,
    `category:${product.category}`,
  ]);
}
```

## Cache Patterns

### Pattern 1: Cache-Aside (Lazy Loading)

**Use case**: Most common pattern - fetch on demand, cache for future requests.

```typescript
async function getFarmById(farmId: string): Promise<Farm | null> {
  const cacheKey = `farm:${farmId}`;

  // 1. Try to get from cache
  let farm = await cacheService.get<Farm>(cacheKey);

  if (farm) {
    // Cache hit - return immediately
    return farm;
  }

  // 2. Cache miss - fetch from database
  farm = await database.farm.findUnique({
    where: { id: farmId },
    include: {
      owner: true,
      products: true,
    },
  });

  if (!farm) {
    return null;
  }

  // 3. Store in cache for future requests
  await cacheService.set(cacheKey, farm, {
    ttl: CACHE_TTL.FARM_PROFILE,
    tags: [`farm:${farmId}`, `user:${farm.ownerId}`],
  });

  return farm;
}
```

### Pattern 2: Write-Through

**Use case**: Critical data that must always be cached immediately after write.

```typescript
async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  // 1. Write to database
  const order = await database.order.create({
    data: orderData,
    include: {
      customer: true,
      farm: true,
      items: true,
    },
  });

  // 2. Immediately cache (write-through)
  await cacheService.set(`order:${order.id}`, order, {
    ttl: CACHE_TTL.ORDER_DETAILS,
    tags: [
      `user:${order.customerId}`,
      `farm:${order.farmId}`,
      `orders`,
    ],
  });

  // 3. Invalidate related list caches
  await cacheService.invalidateByTags([
    `user:${order.customerId}`,
    `farm:${order.farmId}`,
  ]);

  return order;
}
```

### Pattern 3: Cache Warming

**Use case**: Pre-populate cache for known hot data.

```typescript
async function warmFeaturedProductsCache() {
  // Fetch featured products
  const products = await database.product.findMany({
    where: {
      featured: true,
      status: "ACTIVE",
    },
    include: {
      farm: true,
    },
    take: 20,
  });

  // Cache each product individually
  await Promise.all(
    products.map((product) =>
      cacheService.set(`product:${product.id}`, product, {
        ttl: CACHE_TTL.PRODUCT,
        tags: [`farm:${product.farmId}`, `category:${product.category}`],
      })
    )
  );

  // Cache the featured list
  await cacheService.set("products:featured", products, {
    ttl: CACHE_TTL.PRODUCT_LIST,
    tags: ["products"],
  });

  console.log(`✅ Warmed cache with ${products.length} featured products`);
}

// Run cache warming on application startup or scheduled job
```

### Pattern 4: Refresh-Ahead

**Use case**: Proactively refresh cache before expiration for critical data.

```typescript
async function getFarmWithRefresh(farmId: string): Promise<Farm | null> {
  const cacheKey = `farm:${farmId}`;

  // Get from cache
  const cached = await cacheService.get<Farm>(cacheKey);

  if (cached) {
    // Check if cache is about to expire (< 10% TTL remaining)
    const entry = await redis.ttl(cacheKey);
    const remainingTTL = entry;
    const configuredTTL = CACHE_TTL.FARM_PROFILE;

    if (remainingTTL < configuredTTL * 0.1) {
      // Refresh cache in background (don't await)
      refreshFarmCache(farmId).catch((err) =>
        console.error("Cache refresh failed:", err)
      );
    }

    return cached;
  }

  // Cache miss - fetch and cache
  return await refreshFarmCache(farmId);
}

async function refreshFarmCache(farmId: string): Promise<Farm | null> {
  const farm = await database.farm.findUnique({
    where: { id: farmId },
    include: { owner: true, products: true },
  });

  if (farm) {
    await cacheService.set(`farm:${farmId}`, farm, {
      ttl: CACHE_TTL.FARM_PROFILE,
      tags: [`farm:${farmId}`, `user:${farm.ownerId}`],
    });
  }

  return farm;
}
```

### Pattern 5: Cache Stampede Prevention

**Use case**: Prevent multiple simultaneous cache misses from overwhelming the database.

```typescript
const pendingFetches = new Map<string, Promise<any>>();

async function getFarmWithStampedeProtection(
  farmId: string
): Promise<Farm | null> {
  const cacheKey = `farm:${farmId}`;

  // Try cache first
  const cached = await cacheService.get<Farm>(cacheKey);
  if (cached) return cached;

  // Check if fetch is already in progress
  if (pendingFetches.has(cacheKey)) {
    return await pendingFetches.get(cacheKey);
  }

  // Start new fetch
  const fetchPromise = (async () => {
    try {
      const farm = await database.farm.findUnique({
        where: { id: farmId },
        include: { owner: true, products: true },
      });

      if (farm) {
        await cacheService.set(cacheKey, farm, {
          ttl: CACHE_TTL.FARM_PROFILE,
          tags: [`farm:${farmId}`, `user:${farm.ownerId}`],
        });
      }

      return farm;
    } finally {
      // Clean up pending fetch
      pendingFetches.delete(cacheKey);
    }
  })();

  pendingFetches.set(cacheKey, fetchPromise);
  return await fetchPromise;
}
```

## Multi-Layer Cache Usage

```typescript
import { MultiLayerCache } from "@/lib/cache/multi-layer-cache";

const multiCache = new MultiLayerCache();

// L1 (memory) → L2 (Redis) → Database
async function getProductWithMultiLayer(productId: string): Promise<Product | null> {
  const cacheKey = `product:${productId}`;

  // Check L1 (memory) → L2 (Redis)
  let product = await multiCache.get<Product>(cacheKey);

  if (product) {
    // Cache hit (either L1 or L2)
    // If L2 hit, automatically promoted to L1
    return product;
  }

  // Cache miss - fetch from database
  product = await database.product.findUnique({
    where: { id: productId },
    include: { farm: true },
  });

  if (product) {
    // Store in both L1 and L2
    await multiCache.set(cacheKey, product, {
      ttl: CACHE_TTL.PRODUCT,
      tags: [`farm:${product.farmId}`, `category:${product.category}`],
    });
  }

  return product;
}
```

## Monitoring & Debugging

### Cache Hit Rate Monitoring

```typescript
// Middleware to track cache performance
export async function cacheMetricsMiddleware(
  request: NextRequest
): Promise<Response> {
  const startStats = cacheService.getStats();

  // Handle request
  const response = await handleRequest(request);

  const endStats = cacheService.getStats();

  // Calculate hit rate for this request
  const hits = endStats.hits - startStats.hits;
  const misses = endStats.misses - startStats.misses;
  const total = hits + misses;

  if (total > 0) {
    const hitRate = (hits / total) * 100;
    console.log(`Cache hit rate: ${hitRate.toFixed(2)}%`);
  }

  return response;
}
```

### Cache Debugging

```typescript
// Enable cache debugging in development
if (process.env.NODE_ENV === "development") {
  // Log all cache operations
  const originalGet = cacheService.get.bind(cacheService);
  cacheService.get = async function <T>(key: string): Promise<T | null> {
    const result = await originalGet<T>(key);
    console.log(`[CACHE GET] ${key}:`, result ? "HIT" : "MISS");
    return result;
  };

  const originalSet = cacheService.set.bind(cacheService);
  cacheService.set = async function <T>(
    key: string,
    value: T,
    options?: any
  ): Promise<void> {
    console.log(`[CACHE SET] ${key}`, { ttl: options?.ttl, tags: options?.tags });
    await originalSet(key, value, options);
  };
}
```

## Best Practices

### ✅ DO

1. **Use consistent key naming conventions**
   ```typescript
   ✅ "user:123"
   ✅ "farm:456:products"
   ❌ "User_123"
   ❌ "farm_products_456"
   ```

2. **Always specify TTL based on data volatility**
   ```typescript
   ✅ await cacheService.set(key, data, { ttl: CACHE_TTL.FARM_PROFILE });
   ❌ await cacheService.set(key, data); // Uses default, may not be appropriate
   ```

3. **Tag caches for easy invalidation**
   ```typescript
   ✅ tags: [`farm:${farmId}`, `category:${category}`]
   ❌ No tags (hard to invalidate related data)
   ```

4. **Invalidate related caches on updates**
   ```typescript
   ✅ await cacheService.invalidateByTags([`farm:${farmId}`]);
   ❌ Forgot to invalidate (stale data)
   ```

5. **Handle cache misses gracefully**
   ```typescript
   ✅ const data = await cache.get(key) ?? await fetchFromDB();
   ❌ Assume cache always has data
   ```

### ❌ DON'T

1. **Don't cache sensitive data without encryption**
   ```typescript
   ❌ await cacheService.set("user:123:password", hashedPassword);
   ✅ Don't cache passwords at all
   ```

2. **Don't cache data that changes frequently**
   ```typescript
   ❌ await cacheService.set("order:123:status", status, { ttl: 3600 });
   ✅ Use short TTL or don't cache real-time data
   ```

3. **Don't set TTL too long for dynamic data**
   ```typescript
   ❌ await cacheService.set("products:search:tomato", results, { ttl: 86400 });
   ✅ await cacheService.set("products:search:tomato", results, { ttl: 60 });
   ```

4. **Don't cache errors or null values**
   ```typescript
   ❌ await cacheService.set(key, null);
   ✅ if (data) await cacheService.set(key, data);
   ```

5. **Don't forget to handle Redis unavailability**
   ```typescript
   ✅ Cache service automatically falls back to memory
   ❌ Assuming Redis is always available
   ```

## Performance Tips

### 1. Batch Cache Operations

```typescript
// ❌ Slow - sequential operations
for (const farm of farms) {
  await cacheService.set(`farm:${farm.id}`, farm);
}

// ✅ Fast - parallel operations
await Promise.all(
  farms.map((farm) => cacheService.set(`farm:${farm.id}`, farm))
);
```

### 2. Optimize Cache Key Size

```typescript
// ❌ Large key (Redis has memory overhead per key)
const key = `very_long_descriptive_key_name_with_lots_of_details:${id}`;

// ✅ Compact key
const key = `f:${id}`; // Use abbreviations for high-volume caches
```

### 3. Use Appropriate Data Structures

```typescript
// ❌ Cache entire array for small updates
await cacheService.set("farm:123:products", allProducts);

// ✅ Cache individual products + list of IDs
await cacheService.set("farm:123:product-ids", productIds);
await Promise.all(
  products.map((p) => cacheService.set(`product:${p.id}`, p))
);
```

## Troubleshooting

### Issue: Low Cache Hit Rate

**Symptoms**: Cache stats show < 50% hit rate

**Causes & Solutions**:
1. TTL too short → Increase TTL for stable data
2. Keys not consistent → Review key naming convention
3. Cache invalidation too aggressive → Use tag-based invalidation more selectively
4. Cold cache → Implement cache warming

### Issue: Stale Data

**Symptoms**: Users seeing outdated information

**Causes & Solutions**:
1. Missing invalidation → Add invalidation on updates/deletes
2. TTL too long → Reduce TTL for dynamic data
3. Tags not comprehensive → Review and add missing tags

### Issue: Memory Pressure

**Symptoms**: Redis memory usage high, evictions occurring

**Causes & Solutions**:
1. No TTL set → Always specify appropriate TTL
2. Large objects cached → Cache only necessary fields
3. Too many keys → Review and consolidate cache keys

## Migration Guide

### From Direct Redis to Cache Service

```typescript
// ❌ Before: Direct Redis usage
import { redis } from "@/lib/cache/redis-client";

const data = await redis.get("farm:123");
await redis.set("farm:123", JSON.stringify(farm), "EX", 600);

// ✅ After: Cache Service
import { cacheService } from "@/lib/cache/cache-service";

const data = await cacheService.get<Farm>("farm:123");
await cacheService.set("farm:123", farm, { ttl: 600 });
```

## Agricultural Consciousness 🌾

Remember: Cache is like fertile soil - it stores nutrients (data) for quick access, but must be refreshed regularly to stay healthy. Use caching wisdom to grow a high-performance platform!

---

**Version**: 1.0  
**Last Updated**: 2024-01-15  
**Status**: ✅ PRODUCTION READY  

_"Cache with consciousness, invalidate with precision, scale with agricultural wisdom."_ 🌾⚡