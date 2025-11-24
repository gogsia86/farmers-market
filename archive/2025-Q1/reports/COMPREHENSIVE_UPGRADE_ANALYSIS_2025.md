# 🌾 Comprehensive Repository Analysis & Upgrade Recommendations 2025

**Generated:** January 2025  
**Platform:** Farmers Market Divine Agricultural E-Commerce Platform  
**Status:** Production-Ready with Optimization Opportunities  
**Analysis Scope:** Complete codebase, dependencies, architecture, security, performance

---

## 📊 Executive Summary

### Current State: ✅ EXCELLENT

- **Test Coverage:** 100% passing (414/414 unit tests)
- **Build Status:** ✅ Stable
- **Architecture:** Modern, scalable, well-structured
- **Tech Stack:** Cutting-edge (Next.js 15, React 19, Prisma 7)
- **Repository Size:** 2.3GB
- **Documentation:** 2,229 markdown files (excessive - needs cleanup)

### Priority Matrix

```
HIGH PRIORITY   ⚡ 12 items - Security, Performance, Dependencies
MEDIUM PRIORITY 🔶 15 items - Code Quality, Features, Documentation
LOW PRIORITY    🟢 8 items  - Nice-to-haves, Future enhancements
```

---

## 🎯 CRITICAL PRIORITIES (Address Immediately)

### 1. ⚠️ TypeScript Errors - HIGH PRIORITY

**Current Issues:** 37 TypeScript errors across 6 files

**Affected Files:**

```
❌ src/app/api/platform/stats/route.ts         - 9 errors
❌ src/app/api/featured/farms/route.ts         - 10 errors
❌ src/app/api/search/suggest/route.ts         - 10 errors
❌ src/app/api/products/bulk/route.ts          - 5 errors
❌ src/components/homepage/SearchAutocomplete.tsx - 2 errors, 1 warning
❌ src/app/page.tsx                            - 1 error
⚠️ src/app/farmer-dashboard/products/bulk-upload/page.tsx - 2 warnings
```

**Action Plan:**

```bash
# Run diagnostics on each file
npm run type-check

# Fix errors systematically
1. Review type imports and database schema alignment
2. Fix API route response types
3. Update component prop types
4. Ensure Prisma client types are current
```

**Estimated Time:** 2-4 hours  
**Impact:** Prevents production runtime errors

---

### 2. 🔄 Dependency Upgrades - HIGH PRIORITY

#### Critical Updates Available

| Package              | Current       | Latest           | Priority | Breaking Changes |
| -------------------- | ------------- | ---------------- | -------- | ---------------- |
| **React**            | 19.0.0        | 19.2.0           | HIGH     | No               |
| **React DOM**        | 19.0.0        | 19.2.0           | HIGH     | No               |
| **@types/react**     | 19.0.0        | 19.2.6           | HIGH     | No               |
| **@types/react-dom** | 19.0.0        | 19.2.3           | HIGH     | No               |
| **Tailwind CSS**     | 3.4.18        | 4.1.17           | MEDIUM   | **YES** ⚠️       |
| **Next Auth**        | 5.0.0-beta.30 | 4.24.13 (stable) | MEDIUM   | Evaluate         |

#### Upgrade Strategy

```bash
# Phase 1: Safe React Updates (No Breaking Changes)
npm install react@19.2.0 react-dom@19.2.0
npm install -D @types/react@19.2.6 @types/react-dom@19.2.3

# Phase 2: Test thoroughly
npm run test:all
npm run build

# Phase 3: Consider Tailwind 4 (BREAKING - Separate PR)
# Review migration guide first: https://tailwindcss.com/docs/upgrade-guide
# Estimated effort: 8-16 hours for full migration

# Phase 4: Next Auth - Stay on v5 beta (Auth.js)
# v5 is recommended for Next.js 15, v4 is legacy
# Current choice is correct
```

**Notes:**

- ⚠️ `critters@0.0.25` shows as "Current: 0.0.25, Latest: 0.0.23" - this is correct (you have newer)
- Next Auth v5 beta is the right choice for Next.js 15

---

### 3. 🔒 Security Hardening - HIGH PRIORITY

#### A. Environment Variable Security

**Current Issues:**

- Multiple `.env` files in repository (8 files detected)
- Potential exposure of sensitive data

**Recommendations:**

```bash
# 1. Audit .gitignore
echo "Verify these are ignored:"
cat .gitignore | grep -E "\.env"

# 2. Remove committed .env files (if any)
git rm --cached .env .env.local .env.production
git commit -m "security: Remove committed environment files"

# 3. Use .env.example as template only
# Keep: .env.example, .env.docker.example, .env.omen.example
# Remove from git: .env, .env.local, .env.production

# 4. Implement secret scanning
npm install --save-dev @vercel/git-hooks
```

**Secret Management Upgrade:**

```typescript
// lib/config/secrets.ts
import { getSecret } from "@vercel/secrets";

export async function getSecureConfig() {
  if (process.env.NODE_ENV === "production") {
    // Use Vercel Secrets in production
    return {
      databaseUrl: await getSecret("DATABASE_URL"),
      stripeKey: await getSecret("STRIPE_SECRET_KEY"),
    };
  }
  return {
    databaseUrl: process.env.DATABASE_URL,
    stripeKey: process.env.STRIPE_SECRET_KEY,
  };
}
```

#### B. Security Headers Enhancement

**Current:** Good baseline CSP in `next.config.mjs`  
**Upgrade to:** More restrictive CSP with nonce support

```javascript
// next.config.mjs - Enhanced CSP
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        // Add COEP/COOP for better isolation
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'credentialless'
        },
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin'
        },
        // Strengthen existing CSP
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: http://localhost:*",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https://api.stripe.com https://*.stripe.com http://localhost:* ws://localhost:*",
            "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
            "block-all-mixed-content", // New: Block mixed content
          ].join('; ')
        },
        // Add Permissions Policy (replaces Feature-Policy)
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self), payment=(self), usb=()'
        }
      ]
    }
  ];
}
```

#### C. Implement Rate Limiting at Edge

**Current:** Application-level rate limiting ✅  
**Upgrade:** Add Vercel Edge middleware rate limiting

```typescript
// middleware.ts - Add edge rate limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  }

  return NextResponse.next();
}
```

**Required Package:**

```bash
npm install @upstash/ratelimit @upstash/redis
```

---

### 4. 📚 Documentation Cleanup - MEDIUM-HIGH PRIORITY

**Issue:** 2,229 markdown files causing repository bloat

**Identified Redundant Documentation:**

```
✅ Keep (Essential):
- README.md
- DEPLOY.md, DEPLOYMENT_CHECKLIST.md
- E2E_TESTING_GUIDE.md
- DOCKER_DEPLOYMENT_GUIDE.md
- .github/instructions/* (Divine guidelines)
- docs/* (Architecture docs)

❌ Archive or Delete (Redundant):
- Multiple "FINAL" reports (10+ files)
- Multiple "ACHIEVEMENT" files (8+ files)
- Multiple "STATUS" reports (12+ files)
- Duplicate deployment guides (3+ versions)
- Historical "UPGRADE" reports (outdated)
- Victory/celebration files (15+ files)
```

**Cleanup Script:**

```bash
# Create archive directory
mkdir -p archive/historical-reports

# Move redundant files
mv *ACHIEVEMENT*.md archive/historical-reports/
mv *FINAL*.md archive/historical-reports/
mv *STATUS*.md archive/historical-reports/
mv *VICTORY*.md archive/historical-reports/
mv *COMPLETE*.md archive/historical-reports/
mv *SUCCESS*.md archive/historical-reports/

# Keep only latest of each type
git rm OPERATION_100_*.md
git rm PLATFORM_100_*.md
git rm MISSION_*.md

# Consolidate guides
# Keep: README.md, DEPLOY.md, E2E_TESTING_GUIDE.md
# Archive others to docs/guides/
```

**Expected Result:** Reduce to ~50 essential docs (96% reduction)

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### 5. Database Query Optimization - MEDIUM PRIORITY

#### A. Add Missing Indexes

**Analysis:** Review Prisma schema for frequently queried fields

```prisma
// prisma/schema.prisma - Add strategic indexes

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  farmId      String
  category    ProductCategory
  status      ProductStatus
  createdAt   DateTime @default(now())

  // Add composite indexes for common queries
  @@index([farmId, status]) // Farm's active products
  @@index([category, status]) // Category browsing
  @@index([createdAt(sort: Desc)]) // Recent products
  @@index([farmId, createdAt(sort: Desc)]) // Farm's recent products
  @@fulltext([name, description]) // Full-text search
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  farmId      String
  status      OrderStatus
  createdAt   DateTime    @default(now())

  // Optimize order queries
  @@index([userId, createdAt(sort: Desc)]) // User's orders
  @@index([farmId, status]) // Farm's pending orders
  @@index([createdAt(sort: Desc), status]) // Recent orders by status
}

model Farm {
  id              String     @id @default(cuid())
  slug            String     @unique
  status          FarmStatus
  verificationStatus FarmVerificationStatus

  // Optimize farm discovery
  @@index([status, verificationStatus]) // Active verified farms
  @@index([createdAt(sort: Desc)]) // Recent farms
  @@fulltext([name, description]) // Search
}
```

**Migration:**

```bash
npx prisma migrate dev --name add_performance_indexes
npx prisma migrate deploy # Production
```

**Expected Impact:** 30-50% faster query performance

#### B. Implement Query Result Caching

```typescript
// lib/cache/query-cache.ts
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 300, // 5 minutes default
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  // Execute query
  const result = await queryFn();

  // Cache result
  await redis.setex(key, ttl, JSON.stringify(result));

  return result;
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const farms = await getCachedQuery(
    "featured-farms",
    async () => {
      return await database.farm.findMany({
        where: { status: "ACTIVE", verificationStatus: "VERIFIED" },
        take: 10,
        include: { products: { take: 5 } },
      });
    },
    600, // Cache for 10 minutes
  );

  return NextResponse.json(farms);
}
```

---

### 6. Frontend Performance - MEDIUM PRIORITY

#### A. Implement Code Splitting

```typescript
// app/page.tsx - Dynamic imports for heavy components
import dynamic from 'next/dynamic';

// Lazy load non-critical components
const FeaturedFarms = dynamic(() => import('@/components/homepage/FeaturedFarms'), {
  loading: () => <FeaturedFarmsSkeleton />,
  ssr: false // Client-side only if not needed for SEO
});

const ProductShowcase = dynamic(() => import('@/components/homepage/ProductShowcase'), {
  loading: () => <ProductShowcaseSkeleton />
});

const TestimonialsSection = dynamic(
  () => import('@/components/homepage/Testimonials'),
  { ssr: false } // Below fold, no SEO value
);
```

#### B. Image Optimization Upgrade

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

export function OptimizedImage({ src, alt, priority = false }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,..." // Generate blur placeholder
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      format="webp"
    />
  );
}
```

#### C. Bundle Size Optimization

```javascript
// next.config.mjs - Add bundle analysis
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // ... existing config

  // Add package-specific optimizations
  transpilePackages: ["@tensorflow/tfjs", "@tensorflow/tfjs-node-gpu"],

  // Optimize font loading
  optimizeFonts: true,

  // Compress images more aggressively
  images: {
    minimumCacheTTL: 86400, // 24 hours
    formats: ["image/avif", "image/webp"],
  },
});
```

**Run Analysis:**

```bash
ANALYZE=true npm run build
# Review bundle-analyzer output at localhost:8888
```

---

## 🏗️ ARCHITECTURE IMPROVEMENTS

### 7. Implement API Versioning - MEDIUM PRIORITY

**Current:** Single API version  
**Recommended:** Versioned APIs for backward compatibility

```typescript
// app/api/v1/farms/route.ts
export async function GET(request: NextRequest) {
  // Version 1 implementation
}

// app/api/v2/farms/route.ts
export async function GET(request: NextRequest) {
  // Version 2 with breaking changes
}

// middleware.ts - API version routing
export function middleware(request: NextRequest) {
  const apiVersion = request.headers.get("X-API-Version") || "v1";

  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Rewrite to versioned endpoint
    const url = request.nextUrl.clone();
    url.pathname = `/api/${apiVersion}${url.pathname.replace("/api", "")}`;
    return NextResponse.rewrite(url);
  }
}
```

---

### 8. Implement Background Job Processing - HIGH PRIORITY

**Issue:** Long-running tasks blocking API responses

**Solution:** Add BullMQ for background jobs

```bash
npm install bullmq ioredis
```

```typescript
// lib/queues/email-queue.ts
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis(process.env.REDIS_URL);

// Define queue
export const emailQueue = new Queue("emails", { connection });

// Define worker
export const emailWorker = new Worker(
  "emails",
  async (job) => {
    const { to, subject, body } = job.data;
    await sendEmail(to, subject, body);
  },
  { connection },
);

// Usage in API route
import { emailQueue } from "@/lib/queues/email-queue";

export async function POST(request: NextRequest) {
  // Add job to queue instead of blocking
  await emailQueue.add("welcome-email", {
    to: user.email,
    subject: "Welcome to Farmers Market",
    body: renderWelcomeEmail(user),
  });

  return NextResponse.json({ message: "Email queued" });
}
```

**Use Cases:**

- Email notifications
- Image processing (thumbnails, optimization)
- Report generation
- Data exports
- Webhook retries

---

### 9. Add API Request/Response Logging - MEDIUM PRIORITY

```typescript
// lib/middleware/api-logger.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function apiLogger(request: NextRequest, handler: Function) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Log request
  console.log({
    type: "API_REQUEST",
    requestId,
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
    timestamp: new Date().toISOString(),
  });

  // Execute handler
  const response = await handler(request);

  // Log response
  const duration = Date.now() - startTime;
  console.log({
    type: "API_RESPONSE",
    requestId,
    status: response.status,
    duration,
    timestamp: new Date().toISOString(),
  });

  // Add request ID to response headers
  response.headers.set("X-Request-ID", requestId);

  return response;
}
```

---

## 🧪 TESTING ENHANCEMENTS

### 10. Add E2E Test Coverage - HIGH PRIORITY

**Current:** Unit tests at 100%, E2E tests require manual server start  
**Recommendation:** Automate E2E testing in CI/CD

#### A. Update Playwright Configuration

```typescript
// playwright.config.ts - Enhanced configuration
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 12, // HP OMEN optimization

  // Automatic server management
  webServer: {
    command: "npm run build && npm start",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },

  // Add visual regression testing
  use: {
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },

  // Test sharding for CI
  shard: process.env.CI
    ? {
        current: parseInt(process.env.SHARD_INDEX || "1"),
        total: parseInt(process.env.SHARD_TOTAL || "4"),
      }
    : undefined,
});
```

#### B. Add Critical User Journey Tests

```typescript
// tests/e2e/critical-flows.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Critical User Journeys", () => {
  test("Complete purchase flow", async ({ page }) => {
    // 1. Browse products
    await page.goto("/");
    await page.click("text=View Products");

    // 2. Add to cart
    await page.click('button:has-text("Add to Cart")').first();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");

    // 3. Checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click("text=Checkout");

    // 4. Fill shipping info
    await page.fill('[name="address"]', "123 Farm Road");
    await page.fill('[name="city"]', "Farmville");

    // 5. Payment (test mode)
    await page.click("text=Complete Order");

    // 6. Verify success
    await expect(page.locator("h1")).toContainText("Order Confirmed");
  });

  test("Farmer dashboard workflow", async ({ page }) => {
    // Login as farmer
    await page.goto("/login");
    await page.fill('[name="email"]', "farmer@test.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Add product
    await page.goto("/farmer-dashboard/products");
    await page.click("text=Add Product");
    await page.fill('[name="name"]', "Fresh Tomatoes");
    await page.fill('[name="price"]', "4.99");
    await page.click('button:has-text("Save")');

    // Verify product appears
    await expect(page.locator("text=Fresh Tomatoes")).toBeVisible();
  });
});
```

#### C. Add Visual Regression Testing

```bash
npm install -D @playwright/test pixelmatch
```

```typescript
// tests/e2e/visual-regression.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("Homepage renders correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("homepage.png", {
      fullPage: true,
      threshold: 0.2, // 20% tolerance
    });
  });

  test("Product card matches design", async ({ page }) => {
    await page.goto("/products");
    const productCard = page.locator('[data-testid="product-card"]').first();
    await expect(productCard).toHaveScreenshot("product-card.png");
  });
});
```

---

### 11. Add Load Testing - MEDIUM PRIORITY

```bash
npm install -D artillery
```

```yaml
# artillery/load-test.yml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Browse and purchase"
    flow:
      - get:
          url: "/"
      - get:
          url: "/products"
      - get:
          url: "/products/{{ productId }}"
      - post:
          url: "/api/cart/add"
          json:
            productId: "{{ productId }}"
            quantity: 1
```

**Run Load Tests:**

```bash
npx artillery run artillery/load-test.yml --output report.json
npx artillery report report.json
```

---

## 🔧 CODE QUALITY IMPROVEMENTS

### 12. Implement Strict ESLint Rules - MEDIUM PRIORITY

```json
// .eslintrc.json - Enhanced rules
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        "allowExpressions": true
      }
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "error",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }
    ]
  }
}
```

---

### 13. Add Pre-commit Hooks - HIGH PRIORITY

**Current:** Husky installed but may need configuration update

```bash
# Update husky hooks
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run quality:fix && npm run test"

# Add commit-msg hook for conventional commits
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting
        "refactor", // Code refactoring
        "perf", // Performance
        "test", // Tests
        "chore", // Maintenance
        "security", // Security fixes
      ],
    ],
  },
};
```

---

### 14. Remove TODO Comments - LOW PRIORITY

**Found:** 15+ TODO/FIXME comments in codebase

**Action Items:**

```bash
# Generate TODO report
grep -r "TODO\|FIXME\|HACK\|XXX\|BUG" src/ --exclude-dir=node_modules > TODO_REPORT.txt

# Convert to GitHub Issues
# Script to automate issue creation from TODOs
node scripts/create-issues-from-todos.js
```

**High-Priority TODOs to Address:**

```typescript
// src/app/api/farmers/dashboard/route.ts
// TODO: Calculate actual revenue change (currently mocked)
// TODO: Calculate actual orders change (currently mocked)
// TODO: Calculate actual new customers (currently mocked)

// src/app/api/notifications/preferences/route.ts
// TODO: NotificationPreferences model needs to be added to schema

// src/app/api/support/tickets/route.ts
// TODO: Store in database when SupportTicket model is added
// TODO: Implement email service for support tickets
```

---

## 🎨 FEATURE ENHANCEMENTS

### 15. Implement Real-time Notifications - MEDIUM PRIORITY

```typescript
// lib/websocket/notifications.ts
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";

export function initializeWebSocket(
  httpServer: ReturnType<typeof createServer>,
) {
  const io = new SocketServer(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL },
  });

  io.on("connection", (socket) => {
    socket.on("subscribe:orders", (farmId) => {
      socket.join(`farm:${farmId}:orders`);
    });

    socket.on("subscribe:notifications", (userId) => {
      socket.join(`user:${userId}:notifications`);
    });
  });

  return io;
}

// Emit notifications
export function notifyNewOrder(farmId: string, order: Order) {
  io.to(`farm:${farmId}:orders`).emit("new-order", order);
}
```

---

### 16. Add Progressive Web App (PWA) Support - LOW PRIORITY

```bash
npm install next-pwa
```

```javascript
// next.config.mjs
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  // ... existing config
});
```

```json
// public/manifest.json
{
  "name": "Farmers Market",
  "short_name": "FarmersMarket",
  "description": "Divine Agricultural E-Commerce Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

### 17. Implement Advanced Analytics - MEDIUM PRIORITY

```typescript
// lib/analytics/events.ts
import { analytics } from '@vercel/analytics';

export const trackEvent = {
  productView: (productId: string) => {
    analytics.track('Product Viewed', { productId });
  },

  addToCart: (productId: string, quantity: number) => {
    analytics.track('Added to Cart', { productId, quantity });
  },

  checkout: (orderValue: number, items: number) => {
    analytics.track('Checkout Started', { orderValue, items });
  },

  purchase: (orderId: string, value: number) => {
    analytics.track('Purchase Completed', { orderId, value });
  }
};

// Usage in components
import { trackEvent } from '@/lib/analytics/events';

function ProductCard({ product }) {
  const handleView = () => {
    trackEvent.productView(product.id);
  };

  return (
    <Link href={`/products/${product.id}`} onClick={handleView}>
      {/* ... */}
    </Link>
  );
}
```

---

## 🚢
