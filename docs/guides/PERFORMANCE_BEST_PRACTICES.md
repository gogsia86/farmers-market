# ⚡ Performance Best Practices

> **Comprehensive performance optimization standards for the Farmers Market Platform**  
> **Version:** 1.0.0  
> **Last Updated:** January 2025  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Performance Philosophy](#performance-philosophy)
3. [Database Performance](#database-performance)
4. [Caching Strategies](#caching-strategies)
5. [Frontend Performance](#frontend-performance)
6. [API Optimization](#api-optimization)
7. [Bundle Optimization](#bundle-optimization)
8. [Image Optimization](#image-optimization)
9. [Network Performance](#network-performance)
10. [Server-Side Rendering (SSR) Optimization](#server-side-rendering-optimization)
11. [Database Query Optimization](#database-query-optimization)
12. [Monitoring & Profiling](#monitoring--profiling)
13. [Performance Checklist](#performance-checklist)
14. [Quick Reference](#quick-reference)

---

## 🎯 Overview

### Purpose

This document establishes comprehensive performance standards for the Farmers Market Platform, ensuring:

- **Fast Load Times**: < 2s initial page load
- **Optimal Performance**: 90+ Lighthouse score
- **Efficient Database**: Query times < 100ms
- **Scalability**: Handle 10k+ concurrent users
- **Cost Efficiency**: Minimize resource usage

### Performance Stack

```yaml
framework: Next.js 15 (App Router, RSC)
rendering: Server Components + Streaming
caching: Redis (L1) + In-memory (L2) + CDN (L3)
database: PostgreSQL 16 + Prisma 7
bundling: Next.js + SWC + Turbopack
image_optimization: Next.js Image + Cloudflare
cdn: Vercel Edge Network
monitoring: Vercel Analytics + Sentry Performance
profiling: Chrome DevTools + Lighthouse
metrics: OpenTelemetry + Sentry Performance
```

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Performance Principles](#performance-principles)
3. [Database Optimization](#database-optimization)
4. [Caching Strategies](#caching-strategies)
5. [Frontend Performance](#frontend-performance)
6. [API Optimization](#api-optimization)
7. [Bundle Size Optimization](#bundle-optimization)
8. [Image Optimization](#image-optimization)
9. [React Performance](#react-performance)
10. [Network Optimization](#network-optimization)
11. [Monitoring & Metrics](#monitoring--metrics)
12. [Performance Checklist](#performance-checklist)
13. [Quick Reference](#quick-reference)

---

## 🎯 Overview

### Purpose

This document establishes comprehensive performance standards for the Farmers Market Platform, ensuring:

- **Fast Load Times**: < 2s First Contentful Paint (FCP)
- **Responsive UI**: < 100ms Time to Interactive (TTI)
- **Efficient APIs**: < 200ms average response time
- **Scalability**: Handle 10,000+ concurrent users
- **Cost Efficiency**: Optimize resource usage

### Performance Stack

```yaml
frontend: Next.js 15 (App Router, RSC)
rendering: SSR + ISR + Edge Functions
bundling: Turbopack + SWC
caching: Redis (L1) + React Cache (L2)
database: Prisma + Connection pooling
cdn: Vercel Edge Network
images: Next.js Image Optimization
monitoring: Sentry + Vercel Analytics + Custom metrics
profiling: React DevTools Profiler + Chrome DevTools
load_testing: k6 + Artillery
```

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Performance Principles](#performance-principles)
3. [Database Optimization](#database-optimization)
4. [Caching Strategies](#caching-strategies)
5. [API Performance](#api-performance)
6. [Frontend Performance](#frontend-performance)
7. [Image Optimization](#image-optimization)
8. [Bundle Optimization](#bundle-optimization)
9. [Network Performance](#network-performance)
10. [Monitoring & Observability](#monitoring--observability)
11. [Performance Budgets](#performance-budgets)
12. [Load Testing](#load-testing)
13. [Performance Checklist](#performance-checklist)
14. [Quick Reference](#quick-reference)

---

## 🎯 Overview

### Purpose

This document establishes comprehensive performance standards for the Farmers Market Platform, ensuring:

- **Fast Load Times**: Sub-2s initial page loads
- **Optimal User Experience**: 60fps interactions, instant feedback
- **Scalability**: Handle 10,000+ concurrent users
- **Efficiency**: Minimize resource usage and costs
- **Reliability**: Consistent performance under load

### Performance Stack

```yaml
framework: Next.js 15 (App Router, RSC)
caching: Redis (Upstash) + React Cache
database: Prisma + PostgreSQL with connection pooling
cdn: Vercel Edge Network
image_optimization: Next.js Image Optimization
monitoring: Vercel Analytics + Sentry Performance
profiling: React DevTools Profiler + Chrome DevTools
bundling: SWC + Turbopack
```

### Performance Targets

| Metric                             | Target  | Critical |
| ---------------------------------- | ------- | -------- |
| **First Contentful Paint (FCP)**   | < 1.8s  | < 1.0s   |
| **Largest Contentful Paint (LCP)** | < 2.5s  | < 1.5s   |
| **First Input Delay (FID)**        | < 100ms | < 50ms   |
| **Cumulative Layout Shift (CLS)**  | < 0.1   | < 0.05   |
| **Time to Interactive (TTI)**      | < 3.5s  | < 2s     |
| **Total Blocking Time (TBT)**      | < 300ms | < 200ms  |
| **API Response Time (p95)**        | < 500ms | < 200ms  |
| **Database Query Time**            | < 100ms | < 50ms   |

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Performance Principles](#performance-principles)
3. [Database Optimization](#database-optimization)
4. [Caching Strategies](#caching-strategies)
5. [Bundle Optimization](#bundle-optimization)
6. [Image Optimization](#image-optimization)
7. [API Performance](#api-performance)
8. [React Performance](#react-performance)
9. [Network Optimization](#network-optimization)
10. [Monitoring & Profiling](#monitoring--profiling)
11. [Performance Checklist](#performance-checklist)
12. [Quick Reference](#quick-reference)

---

## 🎯 Overview

### Purpose

This document establishes comprehensive performance standards for the Farmers Market Platform, ensuring:

- **Fast Load Times**: < 3s First Contentful Paint (FCP)
- **Responsive UX**: Smooth interactions, no jank
- **Scalability**: Handle 10,000+ concurrent users
- **Efficiency**: Minimal resource consumption
- **Cost Optimization**: Efficient use of infrastructure

### Performance Stack

```yaml
framework: Next.js 15 (App Router) - Edge runtime
bundler: Turbopack (dev), Webpack (production)
caching: Redis + In-memory LRU + HTTP caching
database: Prisma + PostgreSQL with connection pooling
cdn: Vercel Edge Network
image_optimization: Next.js Image Optimization
code_splitting: Automatic with Next.js
monitoring: Sentry Performance + Custom metrics
profiling: React DevTools Profiler + Chrome DevTools
```

### Performance Targets

| Metric                             | Target  | Critical Threshold |
| ---------------------------------- | ------- | ------------------ |
| **First Contentful Paint (FCP)**   | < 1.5s  | < 2.5s             |
| **Largest Contentful Paint (LCP)** | < 2.5s  | < 4.0s             |
| **Time to Interactive (TTI)**      | < 3.5s  | < 5s               |
| **Cumulative Layout Shift (CLS)**  | < 0.1   | < 0.25             |
| **First Input Delay (FID)**        | < 100ms | < 300ms            |
| **Time to First Byte (TTFB)**      | < 200ms | < 600ms            |
| **API Response Time (p95)**        | < 500ms | < 1000ms           |
| **Database Query Time (p95)**      | < 100ms | < 300ms            |

---

## 🗄️ Database Performance

### Query Optimization

#### N+1 Query Prevention

```typescript
// ❌ BAD: N+1 query problem
async function getFarmsWithProducts() {
  const farms = await database.farm.findMany();

  // This runs 1 query per farm!
  for (const farm of farms) {
    farm.products = await database.product.findMany({
      where: { farmId: farm.id },
    });
  }

  return farms;
}

// ✅ GOOD: Single query with includes
async function getFarmsWithProducts() {
  return await database.farm.findMany({
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

// ✅ BETTER: Parallel queries
async function getFarmsWithProducts(farmIds: string[]) {
  const [farms, products] = await Promise.all([
    database.farm.findMany({
      where: { id: { in: farmIds } },
    }),
    database.product.findMany({
      where: { farmId: { in: farmIds } },
    }),
  ]);

  // Group products by farm
  const productsByFarm = products.reduce(
    (acc, product) => {
      if (!acc[product.farmId]) acc[product.farmId] = [];
      acc[product.farmId].push(product);
      return acc;
    },
    {} as Record<string, typeof products>,
  );

  return farms.map((farm) => ({
    ...farm,
    products: productsByFarm[farm.id] || [],
  }));
}
```

#### Select Only Needed Fields

```typescript
// ❌ BAD: Select all fields
const users = await database.user.findMany({
  include: {
    orders: true,
    sessions: true,
    apiKeys: true,
    password: true, // ⚠️ Security risk!
  },
});

// ✅ GOOD: Select specific fields
const users = await database.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    avatar: true,
    _count: {
      select: {
        orders: true,
      },
    },
  },
});

// ✅ GOOD: Use projection for large text fields
const products = await database.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    // Omit large description field for list view
    // description: true
  },
});
```

#### Efficient Pagination

```typescript
// ❌ BAD: Offset pagination (slow for large datasets)
async function getProducts(page: number, pageSize: number) {
  return await database.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
  // Gets slower as page number increases
}

// ✅ GOOD: Cursor-based pagination
async function getProducts(cursor?: string, pageSize: number = 20) {
  return await database.product.findMany({
    take: pageSize,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

// Usage
const firstPage = await getProducts(undefined, 20);
const nextPage = await getProducts(firstPage[firstPage.length - 1].id, 20);
```

#### Batch Operations

```typescript
// ❌ BAD: Sequential updates
async function updateManyProducts(updates: ProductUpdate[]) {
  for (const update of updates) {
    await database.product.update({
      where: { id: update.id },
      data: update.data,
    });
  }
}

// ✅ GOOD: Batch update with transaction
async function updateManyProducts(updates: ProductUpdate[]) {
  await database.$transaction(
    updates.map((update) =>
      database.product.update({
        where: { id: update.id },
        data: update.data,
      }),
    ),
  );
}

// ✅ BETTER: Use updateMany when possible
async function updateProductPrices(farmId: string, priceMultiplier: number) {
  await database.$executeRaw`
    UPDATE "Product"
    SET price = price * ${priceMultiplier}
    WHERE "farmId" = ${farmId}
  `;
}
```

### Database Indexing

```prisma
// prisma/schema.prisma

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique // ✅ Automatic index
  price       Decimal
  stock       Int
  farmId      String
  categoryId  String
  status      String
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  farm     Farm     @relation(fields: [farmId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  // ✅ Composite indexes for common queries
  @@index([farmId, status])           // Farm's active products
  @@index([categoryId, status])       // Category's active products
  @@index([featured, status])         // Featured products
  @@index([status, createdAt])        // Recent active products
  @@index([farmId, createdAt])        // Farm's recent products

  // ✅ Full-text search index
  @@index([name, slug])
}

model Order {
  id          String   @id @default(cuid())
  userId      String
  status      String
  total       Decimal
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  // ✅ Index for user's orders
  @@index([userId, createdAt])

  // ✅ Index for order status filtering
  @@index([status, createdAt])
}
```

### Connection Pooling

```typescript
// lib/database/index.ts
import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],

    // ✅ Connection pool configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// ✅ Singleton pattern with proper cleanup
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const database = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}

// ✅ Query monitoring
database.$on("query", (e) => {
  if (e.duration > 1000) {
    console.warn("⚠️ Slow query detected:", {
      query: e.query,
      duration: `${e.duration}ms`,
      params: e.params,
    });
  }
});

// ✅ Graceful shutdown
process.on("beforeExit", async () => {
  await database.$disconnect();
});
```

---

## 💾 Caching Strategies

### Multi-Layer Cache Architecture

```typescript
// lib/cache/multi-layer.cache.ts
import { Redis } from "@upstash/redis";
import { LRUCache } from "lru-cache";

// L1: In-memory cache (fastest)
const memoryCache = new LRUCache<string, any>({
  max: 10000,
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
  updateAgeOnHas: true,
  allowStale: false,
});

// L2: Redis cache (shared across instances)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export class MultiLayerCache {
  /**
   * Get from cache (L1 → L2 → Source)
   */
  async get<T>(key: string): Promise<T | null> {
    // L1: Check memory
    const memCached = memoryCache.get(key);
    if (memCached !== undefined) {
      return memCached as T;
    }

    // L2: Check Redis
    const redisCached = await redis.get(key);
    if (redisCached) {
      // Populate L1 for next time
      memoryCache.set(key, redisCached);
      return redisCached as T;
    }

    return null;
  }

  /**
   * Set in both cache layers
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    // Set in both layers
    memoryCache.set(key, value);
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  /**
   * Invalidate across all layers
   */
  async invalidate(pattern: string): Promise<void> {
    // L1: Clear memory
    if (pattern.includes("*")) {
      memoryCache.clear();
    } else {
      memoryCache.delete(pattern);
    }

    // L2: Clear Redis
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  /**
   * Cache wrapper with automatic fetching
   */
  async wrap<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Cache it
    await this.set(key, fresh, ttl);

    return fresh;
  }
}

export const cache = new MultiLayerCache();
```

### Cache Patterns

#### Cache-Aside Pattern

```typescript
// lib/services/product.service.ts
export class ProductService {
  async getProduct(id: string): Promise<Product> {
    return await cache.wrap(
      `product:${id}`,
      async () => {
        return await database.product.findUnique({
          where: { id },
          include: { farm: true, category: true },
        });
      },
      3600, // 1 hour TTL
    );
  }

  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const updated = await database.product.update({
      where: { id },
      data,
    });

    // Invalidate cache
    await cache.invalidate(`product:${id}`);
    await cache.invalidate(`farm:${updated.farmId}:products`);

    return updated;
  }
}
```

#### Write-Through Pattern

```typescript
export class FarmService {
  async createFarm(data: CreateFarmData): Promise<Farm> {
    const farm = await database.farm.create({ data });

    // Immediately cache the new farm
    await cache.set(`farm:${farm.id}`, farm, 3600);

    // Invalidate list caches
    await cache.invalidate("farms:list:*");

    return farm;
  }
}
```

#### Cache Warming

```typescript
// lib/cache/warming.ts
export async function warmCache() {
  console.log("🔥 Warming cache...");

  // Pre-cache featured products
  const featured = await database.product.findMany({
    where: { featured: true, status: "ACTIVE" },
    take: 20,
  });

  await cache.set("products:featured", featured, 3600);

  // Pre-cache popular farms
  const popularFarms = await database.farm.findMany({
    where: { status: "ACTIVE" },
    orderBy: { viewCount: "desc" },
    take: 50,
  });

  for (const farm of popularFarms) {
    await cache.set(`farm:${farm.id}`, farm, 3600);
  }

  console.log("✅ Cache warmed");
}

// Run on server startup
if (process.env.NODE_ENV === "production") {
  warmCache().catch(console.error);
}
```

### React Server Components Caching

```typescript
// app/farms/[id]/page.tsx
import { cache } from 'react';

// ✅ Request-level deduplication
const getFarm = cache(async (id: string) => {
  return await database.farm.findUnique({
    where: { id },
    include: { products: true, owner: true }
  });
});

export default async function FarmPage({ params }: Props) {
  // Multiple calls to getFarm with same ID will only execute once
  const farm = await getFarm(params.id);
  const sameFarm = await getFarm(params.id); // Uses cached result

  return <FarmDetails farm={farm} />;
}

// ✅ Route segment caching
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static'; // Static generation

// ✅ Fetch with caching
const response = await fetch('https://api.example.com/data', {
  next: {
    revalidate: 3600,
    tags: ['products']
  }
});
```

---

## 📦 Bundle Optimization

### Code Splitting

```typescript
// ✅ Dynamic imports for route components
import dynamic from 'next/dynamic';

const FarmMap = dynamic(() => import('@/components/FarmMap'), {
  ssr: false,
  loading: () => <MapSkeleton />
});

const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
  ssr: false,
  loading: () => <DashboardSkeleton />
});

// ✅ Lazy load heavy components
const Chart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
  ssr: false
});

// ✅ Conditional loading
export function ProductPage({ product }: Props) {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <div>
      <ProductDetails product={product} />

      <button onClick={() => setShowReviews(true)}>
        Show Reviews
      </button>

      {showReviews && (
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsSection productId={product.id} />
        </Suspense>
      )}
    </div>
  );
}
```

### Webpack Configuration

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // ✅ Bundle analyzer (development only)
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: "./bundle-analysis.html",
          openAnalyzer: false,
        }),
      );
    }

    // ✅ Optimize chunks
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          // Vendor chunk for stable caching
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            reuseExistingChunk: true,
          },
          // Common chunk for shared code
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
          // Large libraries in separate chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            priority: 20,
          },
        },
      },
    };

    return config;
  },

  // ✅ Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ✅ Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,

  // ✅ Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
};

export default nextConfig;
```

### Tree Shaking

```typescript
// ✅ GOOD: Named imports (tree-shakeable)
import { Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";

// ❌ BAD: Default imports (not tree-shakeable)
import utils from "@/lib/utils";
import * as UI from "@/components/ui";

// ✅ GOOD: Side-effect free imports
import type { User } from "@prisma/client";

// ❌ BAD: Side-effect imports
import "@/styles/global.css"; // CSS is side-effect
```

---

## 🖼️ Image Optimization

### Next.js Image Component

```tsx
// components/OptimizedImage.tsx
import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85} // Optimal quality/size ratio
        placeholder="blur"
        blurDataURL={getBlurDataURL(width, height)}
        onLoadingComplete={() => setIsLoading(false)}
        className={`
          duration-300 ease-in-out
          ${isLoading ? "scale-110 blur-sm" : "scale-100 blur-0"}
        `}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

function getBlurDataURL(width: number, height: number): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
    </svg>
  `;
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
```

### Responsive Images

```tsx
// ✅ Responsive image with multiple sizes
<Image
  src="/farm-photo.jpg"
  alt="Farm"
  width={1200}
  height={800}
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  priority={false}
/>

// ✅ Use appropriate image formats
// AVIF > WebP > JPEG for photos
// SVG for icons and logos
// PNG for screenshots with text
```

### Image CDN Configuration

```typescript
// next.config.mjs
export default {
  images: {
    domains: ["cdn.farmersmarket.com"],
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

// lib/image-loader.ts
export default function cloudinaryLoader({ src, width, quality }) {
  const params = ["f_auto", "c_limit", `w_${width}`, `q_${quality || "auto"}`];
  return `https://res.cloudinary.com/farmersmarket/image/upload/${params.join(",")}${src}`;
}
```

---

## ⚡ API Performance

### Request/Response Optimization

```typescript
// ✅ Stream large responses
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const products = await database.product.findMany();

      for (const product of products) {
        const chunk = JSON.stringify(product) + '\n';
        controller.enqueue(new TextEncoder().encode(chunk));
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' }
  });
}

// ✅ Compress responses
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function GET() {
  const data = await getL argeDataset();
  const json = JSON.stringify(data);

  const compressed = await gzipAsync(json);

  return new Response(compressed, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip'
    }
  });
}

// ✅ Parallel data fetching
export async function GET() {
  const [farms, products, orders] = await Promise.all([
    database.farm.findMany(),
    database.product.findMany(),
    database.order.findMany()
  ]);

  return NextResponse.json({ farms, products, orders });
}
```

### GraphQL DataLoader Pattern

```typescript
// lib/dataloaders/product.loader.ts
import DataLoader from "dataloader";

export const productLoader = new DataLoader<string, Product>(
  async (ids: readonly string[]) => {
    const products = await database.product.findMany({
      where: { id: { in: [...ids] } },
    });

    // Return in same order as requested
    const productMap = new Map(products.map((p) => [p.id, p]));
    return ids.map((id) => productMap.get(id)!);
  },
  {
    // Batch multiple requests within 10ms
    batchScheduleFn: (callback) => setTimeout(callback, 10),
  },
);

// Usage: Prevents N+1 queries
const products = await Promise.all([
  productLoader.load("prod_1"),
  productLoader.load("prod_2"),
  productLoader.load("prod_3"),
]);
// Only 1 database query executed!
```

---

## 📊 Monitoring & Observability

### Performance Monitoring

```typescript
// lib/monitoring/performance.ts
import * as Sentry from "@sentry/nextjs";

export class PerformanceMonitor {
  /**
   * Track API endpoint performance
   */
  static async trackAPICall<T>(
    endpoint: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const transaction = Sentry.startTransaction({
      op: "api.request",
      name: endpoint,
    });

    const start = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - start;

      transaction.setStatus("ok");
      transaction.setTag("duration", duration);

      // Log slow requests
      if (duration > 1000) {
        console.warn(`⚠️ Slow API call: ${endpoint} took ${duration}ms`);

        Sentry.captureMessage(`Slow API: ${endpoint}`, {
          level: "warning",
          extra: { duration, endpoint },
        });
      }

      return result;
    } catch (error) {
      transaction.setStatus("internal_error");
      throw error;
    } finally {
      transaction.finish();
    }
  }

  /**
   * Track database query performance
   */
  static async trackQuery<T>(
    query: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const span = Sentry.getCurrentHub()
      .getScope()
      ?.getTransaction()
      ?.startChild({
        op: "db.query",
        description: query,
      });

    const start = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - start;

      span?.setData("duration", duration);

      if (duration > 100) {
        console.warn(`⚠️ Slow query: ${query} took ${duration}ms`);
      }

      return result;
    } finally {
      span?.finish();
    }
  }
}

// Usage
export async function GET(request: NextRequest) {
  return await PerformanceMonitor.trackAPICall(
    "GET /api/v1/farms",
    async () => {
      const farms = await database.farm.findMany();
      return NextResponse.json({ success: true, data: farms });
    },
  );
}
```

### Custom Metrics

```typescript
// lib/monitoring/metrics.ts
export class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Record metric value
   */
  record(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  /**
   * Get percentile
   */
  getPercentile(name: string, percentile: number): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;

    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Get summary statistics
   */
  getSummary(name: string) {
    const values = this.metrics.get(name) || [];

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: this.getPercentile(name, 50),
      p95: this.getPercentile(name, 95),
      p99: this.getPercentile(name, 99),
    };
  }
}

export const metrics = new MetricsCollector();

// Usage
const start = Date.now();
await database.product.findMany();
metrics.record("db.query.product.findMany", Date.now() - start);
```

---

## ✅ Performance Checklist

### Development

- [ ] Database queries use proper indexes
- [ ] N+1 queries prevented
- [ ] Only necessary fields selected in queries
- [ ] Cursor-based pagination for large lists
- [ ] Multi-layer caching implemented
- [ ] Cache invalidation strategy defined
- [ ] Dynamic imports for heavy components
- [ ] Images optimized (Next.js Image component)
- [ ] Bundle size monitored
- [ ] Code splitting implemented

### Pre-Deployment

- [ ] Lighthouse score > 90
- [ ] Bundle analyzer report reviewed
- [ ] Database connection pooling configured
- [ ] Redis cache configured
- [ ] CDN configured for static assets
- [ ] Image CDN configured
- [ ] Gzip/Brotli compression enabled
- [ ] Database indexes created
- [ ] Query performance tested
- [ ] Load testing completed

### Production

- [ ] Performance monitoring active
- [ ] Slow query alerts configured
- [ ] Cache hit rate monitored
- [ ] API response times tracked
- [ ] Database query times tracked
- [ ] Error rate monitored
- [ ] Weekly performance review
- [ ] Monthly optimization sprint

---

## 📚 Quick Reference

### Performance Commands

```bash
# Bundle analysis
npm run build
npm run analyze

# Database query analysis
npm run db:analyze

# Performance testing
npm run test:performance

# Lighthouse audit
npx lighthouse https://farmersmarket.com --view

# Load testing
npx artillery run load-test.yml
```

### Common Performance Issues & Fixes

```typescript
// ❌ N+1 Query
for (const farm of farms) {
  farm.products = await db.product.findMany({ where: { farmId: farm.id } });
}

// ✅ Fix: Include in original query
const farms = await db.farm.findMany({ include: { products: true } });

// ❌ Missing Index
await db.product.findMany({ where: { farmId: '123', status: 'ACTIVE' } });
// No index on (farmId, status)

// ✅ Fix: Add composite index
@@index([farmId, status])

// ❌ Over-fetching
const user = await db.user.findUnique({
  where: { id },
  include: { orders: true, sessions: true }
});

// ✅ Fix: Select only needed fields
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true }
});

// ❌ No caching
const products = await db.product.findMany();

// ✅ Fix: Add caching
const products = await cache.wrap('products:all',
  () => db.product.findMany(),
  3600
);
```

---

## 📞 Support & Resources

### Internal Resources

- [Performance Monitoring Dashboard](/monitoring/performance)
- [Query Performance Guide](/docs/database/performance.md)
- [Caching Strategy](/docs/architecture/CACHE_PATTERNS.md)

### External Resources

- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Size Budget](https://web.dev/performance-budgets-101/)

---

**Version History:**

- 1.0.0 (2025-01-10): Initial comprehensive performance best practices

**Status:** ✅ Production Ready
