# 🎯 Middleware Usage Guide

**Farmers Market Platform - Advanced Request Processing**

---

## 📖 Overview

The platform includes production-ready middleware for optimizing API responses and enhancing performance:

- **API Caching**: Redis-powered response caching with stale-while-revalidate
- **Response Compression**: Brotli/Gzip compression for bandwidth optimization
- **Rate Limiting**: Request throttling and abuse prevention
- **Route Protection**: RBAC and authentication middleware

All middleware is **opt-in** via environment variables and can be enabled per-route or globally.

---

## 🚀 Quick Start

### 1. Enable Middleware (Environment Variables)

Add to your `.env` file:

```bash
# Enable API caching middleware (Redis required)
ENABLE_CACHE_MIDDLEWARE=true

# Enable response compression middleware
ENABLE_COMPRESSION_MIDDLEWARE=true

# Redis configuration (required for caching)
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### 2. Use in API Routes

```typescript
// app/api/farms/route.ts
import { withApiCache, withCompression } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export const GET = withApiCache(
  withCompression(async (request: NextRequest) => {
    const farms = await farmService.getAllFarms();
    return NextResponse.json({ success: true, data: farms });
  })
);
```

---

## 🎨 Available Middleware

### 1. API Caching (`withApiCache`)

Caches GET requests in Redis with intelligent TTL and stale-while-revalidate.

#### Features:
- ✅ Automatic Redis caching
- ✅ ETag generation for conditional requests
- ✅ Stale-while-revalidate pattern
- ✅ Seasonal awareness (shorter TTL during harvest)
- ✅ Cache invalidation by tag or pattern
- ✅ Cache-Control headers

#### Basic Usage:

```typescript
import { withApiCache } from "@/lib/middleware";

export const GET = withApiCache(async (request) => {
  // Your handler logic
  return NextResponse.json({ data: "..." });
});
```

#### Route-Specific Configuration:

The middleware automatically applies different cache strategies based on route:

```typescript
// Configured in src/lib/middleware/api-cache.ts
const ROUTE_CACHE_CONFIGS = {
  "/api/farms": {
    ttl: 600,                    // 10 minutes
    staleWhileRevalidate: 120,   // 2 minutes stale
    tags: ["farms", "public"],
    seasonal: false,
  },
  "/api/products": {
    ttl: 300,                    // 5 minutes
    staleWhileRevalidate: 60,    // 1 minute stale
    tags: ["products", "public"],
    seasonal: true,              // Shorter TTL during harvest
  },
  // ... more routes
};
```

#### Cache Invalidation:

```typescript
import { invalidateCacheByTag, invalidateCacheByPattern } from "@/lib/middleware";

// After creating a new farm
await invalidateCacheByTag("farms");

// Invalidate specific pattern
await invalidateCacheByPattern("api:/api/farms/*");
```

#### Cache Statistics:

```typescript
import { getCacheStats } from "@/lib/middleware";

const stats = getCacheStats();
console.log(stats);
// {
//   hits: 150,
//   misses: 25,
//   hitRate: "85.71%"
// }
```

---

### 2. Response Compression (`withCompression`)

Compresses responses with Brotli (preferred) or Gzip fallback.

#### Features:
- ✅ Automatic Brotli compression (23% better than gzip)
- ✅ Gzip fallback for older clients
- ✅ Smart threshold (1KB minimum)
- ✅ Content-type aware
- ✅ Compression statistics tracking

#### Basic Usage:

```typescript
import { withCompression } from "@/lib/middleware";

export const GET = withCompression(async (request) => {
  const largeData = await fetchLargeDataset();
  return NextResponse.json(largeData);
});
```

#### Custom Configuration:

```typescript
export const GET = withCompression(
  async (request) => {
    // Handler logic
  },
  {
    threshold: 512,      // Compress responses > 512 bytes
    level: 6,            // Compression level (1-9 for gzip)
    compressibleTypes: [ // MIME types to compress
      "application/json",
      "text/html",
      // ... more types
    ],
  }
);
```

#### Manual Compression:

```typescript
import { createCompressedResponse } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  const data = await fetchData();
  
  // Automatically compress based on Accept-Encoding
  return createCompressedResponse(data, request);
}
```

#### Compression Statistics:

```typescript
import { getCompressionStats } from "@/lib/middleware";

const stats = getCompressionStats();
console.log(stats);
// {
//   totalRequests: 500,
//   originalSize: "2.5 MB",
//   compressedSize: "450 KB",
//   savedBytes: "2.05 MB",
//   averageRatio: "18%",
//   averageTimeMs: 12.5
// }
```

---

### 3. Rate Limiting (`withRateLimit`)

Throttle requests to prevent abuse.

#### Basic Usage:

```typescript
import { withRateLimit } from "@/lib/middleware";

export const POST = withRateLimit(
  async (request) => {
    // Handler logic
  },
  {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  }
);
```

#### Predefined Rate Limiters:

```typescript
import { rateLimiters } from "@/lib/middleware";

// Strict rate limiting for sensitive endpoints
export const POST = rateLimiters.strict(async (request) => {
  // Handler logic
});

// Available: strict, moderate, relaxed, api
```

---

### 4. Middleware Composition

Combine multiple middleware using `composeMiddleware`:

```typescript
import { composeMiddleware, withApiCache, withCompression } from "@/lib/middleware";

const optimizedMiddleware = composeMiddleware(
  withApiCache,
  withCompression
);

export const GET = optimizedMiddleware(async (request) => {
  // Handler logic with both caching and compression
});
```

---

## 🎯 Configuration Presets

Use predefined presets for common scenarios:

```typescript
import { applyMiddleware, MIDDLEWARE_PRESETS } from "@/lib/middleware";

// Public API endpoint (10 min cache, compression)
export const GET = applyMiddleware(
  async (request) => { /* ... */ },
  { 
    cache: true, 
    compression: MIDDLEWARE_PRESETS.publicApi.compression 
  }
);

// Private API (1 min cache, auth-aware)
export const GET = applyMiddleware(
  async (request) => { /* ... */ },
  { 
    cache: true,
    compression: MIDDLEWARE_PRESETS.privateApi.compression 
  }
);

// Dynamic content (30 sec cache, fast compression)
export const GET = applyMiddleware(
  async (request) => { /* ... */ },
  { 
    cache: true,
    compression: MIDDLEWARE_PRESETS.dynamic.compression 
  }
);

// Compression only (no caching)
export const GET = applyMiddleware(
  async (request) => { /* ... */ },
  { 
    compression: MIDDLEWARE_PRESETS.compressionOnly.compression 
  }
);
```

---

## 🔒 Route Protection

Use route configuration helpers for RBAC:

```typescript
import { 
  isPublicRoute, 
  getRequiredRoles, 
  hasRequiredRole 
} from "@/lib/middleware";

// Check if route is public
if (isPublicRoute("/marketplace")) {
  // Allow access
}

// Get required roles for a route
const roles = getRequiredRoles("/admin/dashboard");
// Returns: ["ADMIN", "SUPER_ADMIN", "MODERATOR"]

// Check user access
const userRole = session.user.role;
if (hasRequiredRole(userRole, "/admin/dashboard")) {
  // User has access
}
```

---

## 📊 Monitoring & Analytics

### Cache Performance

```typescript
import { getCacheStats, resetCacheStats } from "@/lib/middleware";

// Get current statistics
const cacheStats = getCacheStats();
console.log(`Cache hit rate: ${cacheStats.hitRate}`);

// Reset statistics (useful for periodic reporting)
resetCacheStats();
```

### Compression Efficiency

```typescript
import { getCompressionStats } from "@/lib/middleware";

const compressionStats = getCompressionStats();
console.log(`Bandwidth saved: ${compressionStats.savedBytes}`);
console.log(`Average compression: ${compressionStats.averageRatio}`);
```

---

## 🐛 Debugging

### Enable Debug Headers

Middleware adds debug headers in responses:

```http
X-Cache: HIT|MISS|STALE
X-Cache-Age: 45
X-Cache-Key: api:/api/farms:page=1
X-Compression: brotli
X-Original-Size: 52400
X-Compressed-Size: 9458
X-Compression-Ratio: 18.05%
X-Compression-Time: 12.5ms
```

### Disable Caching for Testing

```typescript
// Send Cache-Control: no-cache header in request
fetch("/api/farms", {
  headers: {
    "Cache-Control": "no-cache"
  }
});
```

### View Cache Keys

```bash
# In Redis CLI
redis-cli KEYS "api:*"
```

---

## ⚙️ Advanced Configuration

### Custom Cache Configuration

Edit `src/lib/middleware/api-cache.ts` to add custom routes:

```typescript
const ROUTE_CACHE_CONFIGS: Record<string, CacheConfig> = {
  "/api/my-custom-route": {
    ttl: 300,                      // 5 minutes
    staleWhileRevalidate: 60,      // 1 minute stale
    tags: ["custom"],              // Cache tags
    varyBy: ["authorization"],     // Vary cache by headers
    seasonal: false,               // Seasonal awareness
  },
};
```

### Custom Compression Profiles

```typescript
import { withCompression } from "@/lib/middleware";

// Aggressive compression for large responses
export const GET = withCompression(
  async (request) => { /* ... */ },
  {
    threshold: 256,     // Compress even small responses
    level: 9,           // Maximum compression
  }
);

// Fast compression for real-time APIs
export const GET = withCompression(
  async (request) => { /* ... */ },
  {
    threshold: 2048,    // Only compress large responses
    level: 1,           // Fastest compression
  }
);
```

---

## 🚨 Best Practices

### 1. **Don't Cache User-Specific Data**

```typescript
// ❌ BAD - Will cache user-specific cart
export const GET = withApiCache(async (request) => {
  const userId = getUserId(request);
  return NextResponse.json({ cart: getUserCart(userId) });
});

// ✅ GOOD - User-specific data not cached
export const GET = async (request: NextRequest) => {
  const userId = getUserId(request);
  return NextResponse.json({ cart: getUserCart(userId) });
};
```

### 2. **Invalidate Cache on Mutations**

```typescript
// After creating/updating/deleting
export const POST = async (request: NextRequest) => {
  const farm = await farmService.createFarm(data);
  
  // Invalidate related caches
  await invalidateCacheByTag("farms");
  
  return NextResponse.json({ success: true, data: farm });
};
```

### 3. **Use Appropriate TTL**

```typescript
// Static content - long cache
"/api/categories": { ttl: 3600 }      // 1 hour

// Dynamic content - short cache
"/api/products": { ttl: 300 }         // 5 minutes

// Real-time data - very short or no cache
"/api/orders": { ttl: 30 }            // 30 seconds
```

### 4. **Compression for Large Responses Only**

```typescript
// ❌ Don't compress tiny responses
export const GET = withCompression(
  async () => NextResponse.json({ ok: true }),
  { threshold: 0 }  // BAD
);

// ✅ Use sensible threshold
export const GET = withCompression(
  async () => NextResponse.json(largeDataset),
  { threshold: 1024 }  // GOOD - 1KB minimum
);
```

---

## 📚 Related Documentation

- [API Caching Implementation](../src/lib/middleware/api-cache.ts)
- [Compression Implementation](../src/lib/middleware/compression.ts)
- [Rate Limiting Implementation](../src/lib/middleware/rate-limiter.ts)
- [Route Configuration](../src/lib/middleware/route-config.ts)
- [Cache Service](../src/lib/cache/cache-service.ts)

---

## 🎉 Examples

### Complete Example: Optimized Public API

```typescript
// app/api/v1/public/farms/route.ts
import { withApiCache, withCompression, applyMiddleware } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";
import { farmService } from "@/lib/services/farm.service";

export const GET = applyMiddleware(
  async (request: NextRequest) => {
    try {
      const farms = await farmService.getAllPublicFarms();
      
      return NextResponse.json({
        success: true,
        data: farms,
        meta: {
          count: farms.length,
          cached: true,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch farms" },
        { status: 500 }
      );
    }
  },
  {
    cache: true,
    compression: true,
  }
);

export const POST = async (request: NextRequest) => {
  // Mutations don't use caching
  const data = await request.json();
  const farm = await farmService.createFarm(data);
  
  // Invalidate cache after mutation
  await invalidateCacheByTag("farms");
  
  return NextResponse.json({ success: true, data: farm });
};
```

---

## ✅ Checklist

Before enabling middleware in production:

- [ ] Redis is configured and running (for caching)
- [ ] Environment variables are set correctly
- [ ] Cache invalidation is implemented for mutations
- [ ] Appropriate TTL values configured per route
- [ ] Compression threshold is sensible (>= 1KB)
- [ ] User-specific data is NOT cached
- [ ] Rate limiting is configured for sensitive endpoints
- [ ] Monitoring and logging are in place
- [ ] Cache hit rates are tracked
- [ ] Debug headers reviewed in staging

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** Production Ready  
**Maintainer:** Platform Team