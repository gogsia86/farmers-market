# 🚀 Quick Reference Card - Farmers Market Platform

## 🎯 Common Patterns - Copy & Paste Ready

### Database Access

```typescript
// ✅ ALWAYS use canonical import
import { database } from "@/lib/database";

// Example: Fetch farm by ID
const farm = await database.farm.findUnique({
  where: { id: farmId },
  include: { owner: true, products: true }
});

// Example: Create with transaction
const result = await database.$transaction(async (tx) => {
  const farm = await tx.farm.create({ data: farmData });
  const product = await tx.product.create({ data: productData });
  return { farm, product };
});
```

---

### Cache Usage

```typescript
import { cacheService } from "@/lib/cache/cache-service";

// Get from cache (with fallback to database)
const farm = await cacheService.get<Farm>(`farm:${id}`) ?? 
  await database.farm.findUnique({ where: { id } });

// Set cache with TTL
await cacheService.set(`farm:${id}`, farm, {
  ttl: 600, // 10 minutes
  tags: [`farm:${id}`, `user:${ownerId}`]
});

// Invalidate by tags
await cacheService.invalidateByTags([`farm:${farmId}`]);

// Get cache stats
const stats = cacheService.getStats();
console.log(`Hit rate: ${stats.hits / (stats.hits + stats.misses)}`);
```

**Common TTLs**:
- User profile: 300s (5 min)
- Farm profile: 600s (10 min)
- Product: 180s (3 min)
- Order: 60s (1 min)
- Categories: 3600s (1 hour)

---

### Rate Limiting

```typescript
import { 
  checkRateLimit, 
  LOGIN_RATE_LIMIT,
  API_RATE_LIMIT,
  SENSITIVE_RATE_LIMIT,
  getClientIp 
} from "@/lib/middleware/rate-limiter";

// IP-based rate limiting (public endpoints)
const clientIp = getClientIp(request);
const rateLimit = await checkRateLimit(LOGIN_RATE_LIMIT(clientIp));

// User-based rate limiting (authenticated)
const rateLimit = await checkRateLimit(API_RATE_LIMIT(userId));

// Check result
if (!rateLimit.success) {
  return NextResponse.json(
    { error: "Rate limit exceeded", resetInSeconds: rateLimit.resetInSeconds },
    { 
      status: 429,
      headers: {
        "X-RateLimit-Limit": rateLimit.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": rateLimit.reset.toString(),
        "Retry-After": rateLimit.resetInSeconds.toString()
      }
    }
  );
}
```

**Pre-configured Limits**:
- `LOGIN_RATE_LIMIT`: 5 per 15 min (IP-based)
- `API_RATE_LIMIT`: 100 per 1 min (user-based)
- `SENSITIVE_RATE_LIMIT`: 10 per 1 hour (user-based)

---

### API Route Pattern

```typescript
// app/api/farms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { cacheService } from "@/lib/cache/cache-service";
import { checkRateLimit, API_RATE_LIMIT } from "@/lib/middleware/rate-limiter";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limiting
  const rateLimit = await checkRateLimit(API_RATE_LIMIT(session.user.id));
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  // 3. Cache check
  const cacheKey = `farm:${params.id}`;
  let farm = await cacheService.get<Farm>(cacheKey);

  if (!farm) {
    // 4. Database fetch
    farm = await database.farm.findUnique({
      where: { id: params.id },
      include: { owner: true, products: true }
    });

    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    // 5. Cache the result
    await cacheService.set(cacheKey, farm, {
      ttl: 600,
      tags: [`farm:${params.id}`, `user:${farm.ownerId}`]
    });
  }

  // 6. Return response
  return NextResponse.json({ success: true, data: farm });
}
```

---

### Server Action Pattern

```typescript
// app/actions/farm.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { cacheService } from "@/lib/cache/cache-service";

export async function createFarm(formData: FormData) {
  // 1. Authentication
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Extract data
  const farmData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    zipCode: formData.get("zipCode") as string,
    location: formData.get("location") as string,
    ownerId: session.user.id,
  };

  try {
    // 3. Create in database
    const farm = await database.farm.create({ data: farmData });

    // 4. Cache the new farm
    await cacheService.set(`farm:${farm.id}`, farm, {
      ttl: 600,
      tags: [`farm:${farm.id}`, `user:${session.user.id}`]
    });

    // 5. Invalidate related caches
    await cacheService.invalidateByTags([`user:${session.user.id}`]);

    // 6. Revalidate Next.js cache
    revalidatePath("/farms");

    return { success: true, farm };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create farm" 
    };
  }
}
```

---

### Component Pattern (Server)

```typescript
// app/farms/[id]/page.tsx
import { database } from "@/lib/database";
import { cacheService } from "@/lib/cache/cache-service";
import { FarmHeader } from "@/components/features/FarmHeader";
import { ProductGrid } from "@/components/features/ProductGrid";

export default async function FarmPage({ params }: { params: { id: string } }) {
  // Server component - can access database directly
  const cacheKey = `farm:${params.id}`;
  
  let farm = await cacheService.get<Farm>(cacheKey);
  
  if (!farm) {
    farm = await database.farm.findUnique({
      where: { id: params.id },
      include: { owner: true, products: true }
    });
    
    if (farm) {
      await cacheService.set(cacheKey, farm, { ttl: 600 });
    }
  }

  if (!farm) {
    return <div>Farm not found</div>;
  }

  return (
    <main>
      <FarmHeader farm={farm} />
      <ProductGrid products={farm.products} />
    </main>
  );
}
```

---

### Component Pattern (Client)

```typescript
// components/features/FarmCard.tsx
"use client";

import { useState } from "react";
import type { Farm } from "@prisma/client";

interface FarmCardProps {
  farm: Farm;
  onFavorite?: (farmId: string) => void;
}

export function FarmCard({ farm, onFavorite }: FarmCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(farm.id);
  };

  return (
    <div className="farm-card">
      <h2>{farm.name}</h2>
      <p>{farm.description}</p>
      <button onClick={handleFavorite}>
        {isFavorited ? "❤️" : "🤍"} Favorite
      </button>
    </div>
  );
}
```

---

### Error Handling

```typescript
// Standard error response
try {
  const result = await performOperation();
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error("Operation failed:", error);
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "OPERATION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }
    },
    { status: 500 }
  );
}

// Validation error
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
});

const validation = schema.safeParse(data);
if (!validation.success) {
  return NextResponse.json(
    { 
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validation.error.errors
      }
    },
    { status: 400 }
  );
}
```

---

### OpenTelemetry Tracing

```typescript
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("farm-service");

await tracer.startActiveSpan("createFarm", async (span) => {
  span.setAttributes({
    "farm.name": farmData.name,
    "farm.owner_id": farmData.ownerId
  });

  try {
    const farm = await database.farm.create({ data: farmData });
    
    span.setStatus({ code: SpanStatusCode.OK });
    span.setAttribute("farm.id", farm.id);
    
    return farm;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : "Unknown error"
    });
    throw error;
  } finally {
    span.end();
  }
});
```

---

## 🔧 Common Commands

### Development
```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Run type check
npm run type-check

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Format code
npm run format
```

### Database
```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npm run seed
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start

# Run in Docker
docker-compose up -d
```

---

## 🚨 Common Gotchas

### ❌ DON'T
```typescript
// ❌ Don't create new Prisma instances
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// ❌ Don't use 'any' type
const data: any = fetchData();

// ❌ Don't cache without TTL
await cacheService.set(key, data); // Uses default

// ❌ Don't forget rate limiting
export async function POST(request: NextRequest) {
  // Missing rate limit check!
  const data = await processRequest();
}

// ❌ Don't hardcode API keys
const API_KEY = "sk_live_abc123"; // Never do this!
```

### ✅ DO
```typescript
// ✅ Use canonical database import
import { database } from "@/lib/database";

// ✅ Use proper types
const data: User = await fetchUser();

// ✅ Always specify TTL
await cacheService.set(key, data, { ttl: 600 });

// ✅ Always rate limit
const rateLimit = await checkRateLimit(API_RATE_LIMIT(userId));
if (!rateLimit.success) return error429();

// ✅ Use environment variables
const apiKey = process.env.API_KEY;
```

---

## 📚 Documentation Links

- **Cache Patterns**: `docs/CACHE_PATTERNS.md`
- **Rate Limiter**: `docs/RATE_LIMITER_PATTERNS.md`
- **Pre-commit Setup**: `docs/PRE_COMMIT_HOOKS_GUIDE.md`
- **TypeScript Cleanup**: `docs/TYPESCRIPT_CLEANUP_COMPLETE.md`
- **PR Description**: `docs/PR_DESCRIPTION.md`

---

## 🆘 Troubleshooting

### TypeScript Errors
```bash
# Check errors
npx tsc --noEmit

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Cache Issues
```bash
# Check Redis connection
redis-cli ping

# Clear all cache
redis-cli FLUSHDB

# Check cache stats in code
const stats = cacheService.getStats();
console.log(stats);
```

### Rate Limit Issues
```bash
# Reset specific rate limit
await resetRateLimit("user:123");

# Clear all rate limits
await resetAllRateLimits();

# Check current status
const status = await getRateLimitStatus("user:123");
```

### Test Failures
```bash
# Run single test file
npm test -- path/to/test.ts

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u

# Clear Jest cache
npx jest --clearCache
```

---

## 🌾 Agricultural Consciousness

Remember the core principles:
- **🌱 Growth**: Write code that scales
- **💧 Irrigation**: Cache flows to speed
- **🛡️ Protection**: Rate limits guard the gates
- **🌍 Sustainability**: Types ensure longevity

_"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_ 🌾⚡

---

**Version**: 1.0  
**Last Updated**: January 15, 2024  
**Status**: ✅ PRODUCTION READY