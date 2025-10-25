---
applyTo: "**/*.{ts,tsx,js,jsx}"
description: "Next.js divine patterns, React quantum components, TypeScript mastery, API integration, and full-stack implementation excellence"
---

# 04 | NEXTJS DIVINE IMPLEMENTATION

**Full-Stack Quantum Mastery for Modern Web Applications**

## 🔗 Related Divine Instructions

- **[01 | Divine Core Principles](./01_DIVINE_CORE_PRINCIPLES.instructions.md)** - Component architecture principles
- **[02 | Agricultural Quantum Mastery](./02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md)** - Implement farm features
- **[03 | Performance Reality Bending](./03_PERFORMANCE_REALITY_BENDING.instructions.md)** - Optimize Next.js performance
- **[05 | Testing Security Divinity](./05_TESTING_SECURITY_DIVINITY.instructions.md)** - Test components & APIs
- **[06 | Automation Infrastructure](./06_AUTOMATION_INFRASTRUCTURE.instructions.md)** - Deploy Next.js apps

---

## ⚡ NEXT.JS 14+ DIVINE ARCHITECTURE

### App Router Quantum Patterns

```typescript
// app/layout.tsx - Root Reality Manifestation
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Farmers Market",
    default: "Farmers Market - Divine Agricultural Platform",
  },
  description: "Quantum agricultural marketplace manifesting fresh produce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QuantumProviders>
          <ConsciousnessTracker />
          {children}
        </QuantumProviders>
      </body>
    </html>
  );
}
```

### Server Components vs Client Components

```typescript
// ✅ SERVER COMPONENT (default) - No "use client"
// app/farms/[id]/page.tsx
import { database } from "@/lib/database";

export default async function FarmPage({ params }: { params: { id: string } }) {
  // Direct database access - runs on server!
  const farm = await database.farm.findUnique({
    where: { id: params.id },
    include: {
      products: true,
      farmers: true,
      reviews: true,
    },
  });

  if (!farm) {
    notFound();
  }

  return (
    <main>
      <FarmHeader farm={farm} />
      <ProductGrid products={farm.products} />
      {/* Server component can render client components */}
      <InteractiveMap location={farm.location} />
    </main>
  );
}

// ✅ CLIENT COMPONENT - Needs "use client"
// components/InteractiveMap.tsx
("use client");

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

export function InteractiveMap({ location }: { location: Location }) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Browser-only code
    setMapReady(true);
  }, []);

  if (!mapReady) return <MapSkeleton />;

  return (
    <MapContainer center={location.coordinates} zoom={13}>
      <TileLayer url="<https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"> />
      <Marker position={location.coordinates} />
    </MapContainer>
  );
}
```

---

## 🎨 COMPONENT QUANTUM ARCHITECTURE

### Holographic Component Pattern

```typescript
/**
 * Each component contains whole system intelligence
 * Self-aware, self-documenting, self-optimizing
 */

// components/QuantumButton.tsx
"use client";

import { forwardRef, useRef, useEffect } from "react";
import { useComponentConsciousness } from "@/hooks/useComponentConsciousness";
import { cn } from "@/lib/utils";

export interface QuantumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "agricultural" | "divine";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const QuantumButton = forwardRef<HTMLButtonElement, QuantumButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      children,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    // Component consciousness - tracks usage, performance, errors
    const consciousness = useComponentConsciousness("QuantumButton", {
      variant,
      size,
    });

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Measure interaction performance
      const measurement = consciousness.startMeasurement("click");

      try {
        await onClick?.(e);
        measurement.success();
      } catch (error) {
        measurement.failure(error);
        throw error;
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center",
          "font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",

          // Size variants
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },

          // Color variants
          {
            "bg-primary-600 hover:bg-primary-700 text-white":
              variant === "primary",
            "bg-secondary-600 hover:bg-secondary-700 text-white":
              variant === "secondary",
            "bg-agricultural-600 hover:bg-agricultural-700 text-white":
              variant === "agricultural",
            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white":
              variant === "divine",
          },

          // Loading state
          { "opacity-70 cursor-wait": loading },

          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <LoadingSpinner className="mr-2" />}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

QuantumButton.displayName = "QuantumButton";
```

### Compound Component Pattern

```typescript
/**
 * Complex components built from composable parts
 * Each part self-aware but coordinated
 */

// components/QuantumCard/index.tsx
"use client";

import { createContext, useContext } from "react";

interface CardContext {
  variant: "default" | "agricultural" | "divine";
  interactive: boolean;
}

const CardContext = createContext<CardContext | null>(null);

export function QuantumCard({
  variant = "default",
  interactive = false,
  children,
  className,
}: {
  variant?: CardContext["variant"];
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardContext.Provider value={{ variant, interactive }}>
      <div
        className={cn(
          "rounded-lg shadow-lg overflow-hidden",
          {
            "hover:shadow-xl transition-shadow cursor-pointer": interactive,
            "bg-white": variant === "default",
            "bg-agricultural-50 border-2 border-agricultural-200":
              variant === "agricultural",
            "bg-gradient-to-br from-purple-50 to-pink-50": variant === "divine",
          },
          className
        )}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}

export function QuantumCardHeader({ children, className }: ComponentProps) {
  const context = useContext(CardContext);

  return <div className={cn("px-6 py-4 border-b", className)}>{children}</div>;
}

export function QuantumCardBody({ children, className }: ComponentProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function QuantumCardFooter({ children, className }: ComponentProps) {
  return (
    <div className={cn("px-6 py-4 bg-gray-50 border-t", className)}>
      {children}
    </div>
  );
}

// Usage
<QuantumCard variant="agricultural" interactive>
  <QuantumCardHeader>
    <h3>Fresh Organic Tomatoes</h3>
  </QuantumCardHeader>
  <QuantumCardBody>
    <p>Harvested this morning from Sun Valley Farm</p>
  </QuantumCardBody>
  <QuantumCardFooter>
    <QuantumButton>Add to Cart</QuantumButton>
  </QuantumCardFooter>
</QuantumCard>;
```

---

## 🔌 API ROUTE DIVINE PATTERNS

### Server Actions (Next.js 14+)

```typescript
// app/actions/farm.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Divine validation schema
const CreateFarmSchema = z.object({
  name: z.string().min(3, "Farm name must be at least 3 characters"),
  location: z.object({
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  description: z.string().optional(),
  certifications: z.array(z.string()).optional(),
});

export async function createFarm(formData: FormData) {
  // Validate authentication
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required",
    };
  }

  // Parse and validate data
  const rawData = {
    name: formData.get("name"),
    location: JSON.parse(formData.get("location") as string),
    description: formData.get("description"),
    certifications: formData.get("certifications")?.toString().split(","),
  };

  const validation = CreateFarmSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    // Create farm in database
    const farm = await database.farm.create({
      data: {
        ...validation.data,
        ownerId: session.user.id,
        status: "PENDING_VERIFICATION",
      },
    });

    // Revalidate relevant pages
    revalidatePath("/farms");
    revalidatePath(`/dashboard/${session.user.id}`);

    return {
      success: true,
      farm,
    };
  } catch (error) {
    console.error("Farm creation error:", error);
    return {
      success: false,
      error: "Failed to create farm. Please try again.",
    };
  }
}

// Usage in component
("use client");

export function CreateFarmForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await createFarm(formData);

    if (result.success) {
      toast.success("Farm created successfully!");
      router.push(`/farms/${result.farm.id}`);
    } else {
      toast.error(result.error || "Something went wrong");
    }

    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <QuantumButton type="submit" loading={pending}>
        Create Farm
      </QuantumButton>
    </form>
  );
}
```

### API Route Handlers

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";
import { z } from "zod";

const ProductQuerySchema = z.object({
  farmId: z.string().optional(),
  category: z.string().optional(),
  inStock: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters
  const queryValidation = ProductQuerySchema.safeParse({
    farmId: searchParams.get("farmId"),
    category: searchParams.get("category"),
    inStock: searchParams.get("inStock") === "true",
    limit: Number(searchParams.get("limit")) || 20,
    offset: Number(searchParams.get("offset")) || 0,
  });

  if (!queryValidation.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const { farmId, category, inStock, limit, offset } = queryValidation.data;

  try {
    // Build query
    const where: any = {};
    if (farmId) where.farmId = farmId;
    if (category) where.category = category;
    if (inStock !== undefined) where.inStock = inStock;

    // Execute with pagination
    const [products, total] = await Promise.all([
      database.product.findMany({
        where,
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      database.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Authentication check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate product data
    const productData = ProductCreateSchema.parse(body);

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: productData.farmId },
    });

    if (farm?.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create product
    const product = await database.product.create({
      data: productData,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
```

---

## 🎯 TYPESCRIPT QUANTUM MASTERY

### Advanced Type Patterns

```typescript
// lib/types/quantum.ts

// Branded types for compile-time safety
type Brand<K, T> = K & { __brand: T };
export type FarmId = Brand<string, "FarmId">;
export type UserId = Brand<string, "UserId">;
export type ProductId = Brand<string, "ProductId">;

// Type-safe ID creation
export function createFarmId(id: string): FarmId {
  return id as FarmId;
}

// Conditional types for API responses
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Recursive type for nested data
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Template literal types
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ApiEndpoint = `/api/${string}`;

// Mapped types
type ReadonlyFields<T, K extends keyof T> = {
  readonly [P in K]: T[P];
} & {
  [P in Exclude<keyof T, K>]: T[P];
};

// Example usage
type Farm = ReadonlyFields<
  {
    id: FarmId;
    name: string;
    location: Location;
    products: Product[];
  },
  "id" | "location" // These fields become readonly
>;
```

### Generics Mastery

```typescript
// Generic data fetcher with type inference
async function fetchData<T>(
  endpoint: ApiEndpoint,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Request failed" };
    }

    return { success: true, data: data as T };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Usage with full type safety
const result = await fetchData<Farm[]>("/api/farms");
if (result.success) {
  result.data.forEach((farm) => {
    console.log(farm.name); // ✅ TypeScript knows this exists
  });
} else {
  console.error(result.error); // ✅ TypeScript knows this exists
}
```

---

## 🗄️ DATABASE DIVINE PATTERNS (Prisma)

### Schema Design

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Farm {
  id            String   @id @default(cuid())
  name          String   @db.VarChar(255)
  slug          String   @unique @db.VarChar(255)
  description   String?  @db.Text

  // Location
  address       String
  latitude      Float
  longitude     Float

  // Relations
  owner         User     @relation(fields: [ownerId], references: [id])
  ownerId       String
  products      Product[]
  reviews       Review[]

  // Metadata
  certifications String[]
  images        String[]
  status        FarmStatus @default(ACTIVE)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([ownerId])
  @@index([slug])
  @@index([status])
  @@fulltext([name, description])
}

model Product {
  id            String   @id @default(cuid())
  name          String   @db.VarChar(255)
  description   String?  @db.Text

  // Pricing
  price         Decimal  @db.Decimal(10, 2)
  unit          String   @db.VarChar(50)

  // Inventory
  inStock       Boolean  @default(true)
  quantity      Int?

  // Relations
  farm          Farm     @relation(fields: [farmId], references: [id])
  farmId        String
  category      Category @relation(fields: [categoryId], references: [id])
  categoryId    String

  // Metadata
  images        String[]
  tags          String[]
  organic       Boolean  @default(false)
  seasonal      Boolean  @default(false)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([farmId])
  @@index([categoryId])
  @@index([inStock])
  @@fulltext([name, description])
}

enum FarmStatus {
  ACTIVE
  PENDING_VERIFICATION
  SUSPENDED
  INACTIVE
}
```

### Prisma Quantum Queries

```typescript
// lib/database/queries/farms.ts
import { database } from "@/lib/database";

export class FarmQueries {
  /**
   * Multi-dimensional farm loading
   * Loads farm with all related data in parallel
   */
  static async getFarmWithRelations(farmId: string) {
    return await database.farm.findUnique({
      where: { id: farmId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        products: {
          where: { inStock: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            products: true,
            reviews: true,
          },
        },
      },
    });
  }

  /**
   * Quantum search with full-text search
   */
  static async searchFarms(
    query: string,
    filters?: {
      status?: FarmStatus;
      hasProducts?: boolean;
      organic?: boolean;
    }
  ) {
    return await database.farm.findMany({
      where: {
        AND: [
          // Full-text search
          {
            OR: [
              { name: { search: query } },
              { description: { search: query } },
            ],
          },
          // Filters
          filters?.status ? { status: filters.status } : {},
          filters?.hasProducts ? { products: { some: {} } } : {},
          filters?.organic
            ? {
                products: { some: { organic: true } },
              }
            : {},
        ],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }
}
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### Image Optimization

```typescript
// components/OptimizedImage.tsx
import Image from "next/image";

export function OptimizedProductImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      priority={priority}
      placeholder="blur"
      blurDataURL={getBlurDataURL(src)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      className="object-cover w-full h-full"
    />
  );
}
```

### Route Segment Config

```typescript
// app/farms/[id]/page.tsx
export const runtime = "edge"; // Edge runtime for faster cold starts
export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static"; // Force static generation

// Or for dynamic pages
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
```

---

## 📋 IMPLEMENTATION CHECKLIST

### ✅ Next.js Setup

- [ ] App Router configured
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier configured
- [ ] Path aliases configured (@/lib, @/components, etc.)

### ✅ Component Architecture

- [ ] Server components default
- [ ] Client components marked with "use client"
- [ ] Compound components for complex UI
- [ ] Component consciousness tracking

### ✅ API & Data

- [ ] Server Actions for mutations
- [ ] API routes for external access
- [ ] Zod validation on all inputs
- [ ] Database queries optimized
- [ ] Prisma migrations managed

### ✅ Performance

- [ ] Image optimization implemented
- [ ] Route caching configured
- [ ] Database indexes created
- [ ] Bundle analysis performed

### ✅ TypeScript

- [ ] Strict mode enabled
- [ ] No any types (use unknown)
- [ ] Branded types for IDs
- [ ] API response types defined

---

_"Build not just applications, but **living ecosystems** that evolve with your users."_
