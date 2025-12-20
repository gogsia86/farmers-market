# 🏗️ Architecture Documentation

> **System Design & Technical Architecture**
>
> Comprehensive guide to the Farmers Market Platform's architecture, design patterns, and system organization.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Architectural Patterns](#architectural-patterns)
- [Directory Structure](#directory-structure)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [API Architecture](#api-architecture)
- [Database Architecture](#database-architecture)
- [Authentication & Authorization](#authentication--authorization)
- [Performance Architecture](#performance-architecture)
- [Security Architecture](#security-architecture)
- [Scalability Patterns](#scalability-patterns)
- [Integration Points](#integration-points)
- [Related Documentation](#related-documentation)

---

## 🎯 Overview

The Farmers Market Platform is built on a **modern, scalable, full-stack architecture** designed to support agricultural commerce from 1 to 1 billion users without fundamental architectural changes.

### Core Principles

1. **🌾 Agricultural Consciousness** - Domain-driven design centered on farming workflows
2. **⚡ Performance-First** - Optimized for speed and scalability
3. **🔒 Security by Default** - Zero-trust security model
4. **🧪 Test-Driven** - Comprehensive test coverage (>80%)
5. **📈 Observable** - Full tracing and monitoring
6. **🚀 Cloud-Native** - Designed for Azure deployment

### Architecture Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│  "Build once, scale infinitely"                             │
│  Every component designed for kilo-scale from day one       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ System Architecture

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser/Mobile)              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ React UI        │  │ Client State    │  │ Local Cache  │ │
│  │ Components      │  │ Management      │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                    PRESENTATION LAYER                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Next.js 15 App Router (RSC)                   │ │
│  ├─────────────────┬─────────────────┬───────────────────┤ │
│  │ Server          │ Client          │ API Routes        │ │
│  │ Components      │ Components      │ (REST/tRPC)       │ │
│  └─────────────────┴─────────────────┴───────────────────┘ │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Service Layer   │  │ Domain Logic    │  │ AI Agents    │ │
│  │ (Business Rules)│  │ (Agricultural)  │  │ (Automation) │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                    DATA ACCESS LAYER                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Prisma ORM      │  │ Query Builder   │  │ Redis Cache  │ │
│  │ (Type-Safe)     │  │ (Optimization)  │  │ (L2 Cache)   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ PostgreSQL      │  │ Blob Storage    │  │ Message Queue│ │
│  │ (Primary DB)    │  │ (Media)         │  │ (Events)     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY LAYER                        │
├───────────────────────────────────────────────────────────────┤
│  OpenTelemetry → Azure App Insights → Monitoring Dashboard   │
└───────────────────────────────────────────────────────────────┘
```

### Agricultural System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                 AGRICULTURAL DOMAIN LAYER                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Farm         │  │ Product      │  │ Seasonal         │   │
│  │ Management   │  │ Catalog      │  │ Intelligence     │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│         │                 │                    │             │
│         ├─────────────────┼────────────────────┘             │
│         │                 │                                  │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────────────────┐   │
│  │ Order       │  │ Inventory   │  │ Harvest          │   │
│  │ Processing  │  │ Management  │  │ Prediction       │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Core Technologies

| Layer           | Technology                | Version | Purpose                    |
| --------------- | ------------------------- | ------- | -------------------------- |
| **Framework**   | Next.js                   | 15.x    | Full-stack React framework |
| **Language**    | TypeScript                | 5.x     | Type-safe development      |
| **Database**    | PostgreSQL                | 14+     | Primary data store         |
| **ORM**         | Prisma                    | 5.x     | Type-safe database access  |
| **Auth**        | NextAuth                  | v5      | Authentication & sessions  |
| **Styling**     | Tailwind CSS              | 3.x     | Utility-first CSS          |
| **Testing**     | Jest + Vitest             | Latest  | Unit & integration tests   |
| **E2E Testing** | Playwright                | Latest  | End-to-end testing         |
| **Validation**  | Zod                       | 3.x     | Runtime type validation    |
| **State**       | React Server Components   | -       | Server-first state         |
| **AI**          | Microsoft Agent Framework | Latest  | Multi-agent automation     |
| **Tracing**     | OpenTelemetry             | Latest  | Distributed tracing        |
| **Cache**       | Redis                     | 7.x     | L2 caching layer           |
| **Storage**     | Azure Blob                | -       | Media storage              |

### Development Tools

```yaml
Package Manager: pnpm (fast, efficient)
Version Control: Git + GitHub
CI/CD: GitHub Actions
Deployment: Azure App Service
Monitoring: Azure Application Insights
Logging: Winston + Azure Monitor
```

---

## 🎨 Architectural Patterns

### 1. Layered Architecture (Primary Pattern)

```typescript
// ✅ DIVINE LAYERED ARCHITECTURE

┌─────────────────────────────────────┐
│    PRESENTATION LAYER               │  ← Next.js Pages/API Routes
│  (Controllers, Routes, UI)          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│    BUSINESS LOGIC LAYER             │  ← Services
│  (Domain Logic, Validation)         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│    DATA ACCESS LAYER                │  ← Prisma Repositories
│  (Database Operations, Queries)     │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│    INFRASTRUCTURE LAYER             │  ← PostgreSQL, Redis, Storage
│  (Database, Cache, Storage)         │
└─────────────────────────────────────┘
```

**Example Implementation:**

```typescript
// LAYER 1: Controller (API Route)
// app/api/farms/route.ts
export async function GET(request: NextRequest) {
  const farmService = new FarmService();
  const farms = await farmService.getAllFarms();
  return NextResponse.json({ success: true, data: farms });
}

// LAYER 2: Service (Business Logic)
// lib/services/farm.service.ts
export class FarmService {
  async getAllFarms(): Promise<Farm[]> {
    // Business logic, validation
    return await farmRepository.findAll();
  }
}

// LAYER 3: Repository (Data Access)
// lib/repositories/farm.repository.ts
export class FarmRepository {
  async findAll(): Promise<Farm[]> {
    return await database.farm.findMany();
  }
}

// LAYER 4: Database (Infrastructure)
// lib/database/index.ts
export const database = new PrismaClient();
```

### 2. Repository Pattern

```typescript
// ✅ REPOSITORY PATTERN - Abstraction over database

export interface IFarmRepository {
  findById(id: string): Promise<Farm | null>;
  findAll(options?: QueryOptions): Promise<Farm[]>;
  create(data: CreateFarmData): Promise<Farm>;
  update(id: string, data: UpdateFarmData): Promise<Farm>;
  delete(id: string): Promise<void>;
}

export class PrismaFarmRepository implements IFarmRepository {
  async findById(id: string): Promise<Farm | null> {
    return await database.farm.findUnique({ where: { id } });
  }
  // ... other methods
}
```

### 3. Service Layer Pattern

```typescript
// ✅ SERVICE LAYER - Business logic encapsulation

export class FarmService {
  constructor(
    private farmRepository: IFarmRepository,
    private validator: FarmValidator,
    private cache: CacheService,
  ) {}

  async createFarm(data: CreateFarmRequest): Promise<Farm> {
    // 1. Validate input
    await this.validator.validateCreateRequest(data);

    // 2. Business logic
    const farmData = this.prepareFarmData(data);

    // 3. Create in database
    const farm = await this.farmRepository.create(farmData);

    // 4. Invalidate cache
    await this.cache.invalidate("farms:list");

    // 5. Return result
    return farm;
  }
}
```

### 4. Factory Pattern

```typescript
// ✅ FACTORY PATTERN - Object creation

export class ServiceFactory {
  static createFarmService(): FarmService {
    const repository = new PrismaFarmRepository();
    const validator = new FarmValidator();
    const cache = new RedisCacheService();

    return new FarmService(repository, validator, cache);
  }
}
```

### 5. Observer Pattern (Event-Driven)

```typescript
// ✅ OBSERVER PATTERN - Event system

export class FarmEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  emit(event: string, data: any) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach((handler) => handler(data));
  }
}

// Usage
farmEvents.on("farm.created", async (farm) => {
  await emailService.sendWelcomeEmail(farm.ownerId);
  await analyticsService.trackFarmCreation(farm);
});
```

### 6. Dependency Injection

```typescript
// ✅ DEPENDENCY INJECTION - Loose coupling

export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private paymentService: IPaymentService,
    private notificationService: INotificationService,
  ) {}

  async processOrder(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    await this.paymentService.processPayment(order.paymentId);
    await this.notificationService.sendOrderConfirmation(order);
  }
}
```

---

## 📁 Directory Structure

### Application Structure

```
Farmers Market Platform web and app/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (admin)/                 # Admin route group (protected)
│   │   │   ├── dashboard/           # Admin dashboard
│   │   │   ├── farms/               # Farm management
│   │   │   └── layout.tsx           # Admin layout
│   │   ├── (customer)/              # Customer route group
│   │   │   ├── browse/              # Browse products
│   │   │   ├── cart/                # Shopping cart
│   │   │   └── orders/              # Order history
│   │   ├── (farmer)/                # Farmer route group
│   │   │   ├── dashboard/           # Farmer dashboard
│   │   │   ├── products/            # Product management
│   │   │   └── analytics/           # Farm analytics
│   │   ├── api/                     # API routes
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   ├── farms/               # Farm CRUD operations
│   │   │   ├── products/            # Product operations
│   │   │   ├── orders/              # Order processing
│   │   │   └── webhooks/            # Webhook handlers
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Homepage
│   │   └── error.tsx                # Error boundary
│   │
│   ├── components/                   # React components
│   │   ├── ui/                      # Base UI components
│   │   │   ├── button.tsx           # Button component
│   │   │   ├── card.tsx             # Card component
│   │   │   ├── input.tsx            # Input component
│   │   │   └── ...
│   │   ├── features/                # Feature components
│   │   │   ├── farm/                # Farm-related components
│   │   │   ├── product/             # Product components
│   │   │   └── order/               # Order components
│   │   └── layout/                  # Layout components
│   │       ├── header.tsx           # Site header
│   │       ├── footer.tsx           # Site footer
│   │       └── sidebar.tsx          # Navigation sidebar
│   │
│   ├── lib/                         # Core business logic
│   │   ├── services/                # Service layer
│   │   │   ├── farm.service.ts      # Farm business logic
│   │   │   ├── product.service.ts   # Product logic
│   │   │   └── order.service.ts     # Order processing
│   │   ├── repositories/            # Data access layer
│   │   │   ├── farm.repository.ts   # Farm data access
│   │   │   └── ...
│   │   ├── database/                # Database configuration
│   │   │   ├── index.ts             # Prisma singleton
│   │   │   └── seed.ts              # Database seeding
│   │   ├── auth/                    # Authentication
│   │   │   ├── config.ts            # NextAuth config
│   │   │   └── middleware.ts        # Auth middleware
│   │   ├── validation/              # Zod schemas
│   │   │   ├── farm.schema.ts       # Farm validation
│   │   │   └── ...
│   │   ├── utils/                   # Utility functions
│   │   │   ├── date.ts              # Date helpers
│   │   │   ├── format.ts            # Formatting utils
│   │   │   └── ...
│   │   └── ai/                      # AI Agent Framework
│   │       ├── agents/              # AI agents
│   │       └── orchestrators/       # Agent orchestration
│   │
│   ├── types/                       # TypeScript types
│   │   ├── farm.types.ts            # Farm types
│   │   ├── product.types.ts         # Product types
│   │   ├── api.types.ts             # API response types
│   │   └── index.ts                 # Type exports
│   │
│   ├── hooks/                       # React hooks
│   │   ├── useFarm.ts               # Farm data hooks
│   │   ├── useAuth.ts               # Authentication hooks
│   │   └── ...
│   │
│   └── styles/                      # Global styles
│       ├── globals.css              # Global CSS + Tailwind
│       └── ...
│
├── prisma/                          # Prisma configuration
│   ├── schema.prisma                # Database schema
│   ├── migrations/                  # Database migrations
│   └── seed.ts                      # Seed data
│
├── public/                          # Static assets
│   ├── images/                      # Images
│   ├── fonts/                       # Custom fonts
│   └── ...
│
├── tests/                           # Test files
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests
│
├── docs/                            # Documentation
│   ├── architecture/                # This directory
│   ├── api/                         # API documentation
│   └── ...
│
├── .github/                         # GitHub configuration
│   ├── workflows/                   # CI/CD workflows
│   └── instructions/                # Divine instructions
│
└── config files
    ├── tsconfig.json                # TypeScript config
    ├── next.config.js               # Next.js config
    ├── tailwind.config.ts           # Tailwind config
    └── ...
```

### Import Path Structure

```typescript
// ✅ CANONICAL IMPORT PATTERNS

// Database (ALWAYS use canonical singleton)
import { database } from "@/lib/database";

// Services
import { FarmService } from "@/lib/services/farm.service";

// Types
import type { Farm, Product } from "@prisma/client";
import type { ApiResponse } from "@/types";

// Components
import { Button } from "@/components/ui/button";
import { FarmCard } from "@/components/features/farm/FarmCard";

// Utilities
import { formatDate } from "@/lib/utils/date";
import { validateFarm } from "@/lib/validation/farm.schema";

// Hooks
import { useFarm } from "@/hooks/useFarm";
```

---

## 🔄 Data Flow

### Request Flow (API)

```
┌─────────────────────────────────────────────────────────────┐
│  1. HTTP Request                                            │
│     ↓                                                       │
│  2. Next.js API Route Handler                              │
│     ↓                                                       │
│  3. Authentication Middleware (if required)                │
│     ↓                                                       │
│  4. Input Validation (Zod Schema)                          │
│     ↓                                                       │
│  5. Service Layer (Business Logic)                         │
│     ↓                                                       │
│  6. Repository Layer (Data Access)                         │
│     ↓                                                       │
│  7. Prisma ORM (Query Builder)                             │
│     ↓                                                       │
│  8. PostgreSQL Database                                    │
│     ↓                                                       │
│  9. Response Transformation                                │
│     ↓                                                       │
│  10. HTTP Response (JSON)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Page Rendering Flow (RSC)

```
┌─────────────────────────────────────────────────────────────┐
│  1. User Navigation / URL Request                          │
│     ↓                                                       │
│  2. Next.js App Router                                     │
│     ↓                                                       │
│  3. Server Component Rendering                             │
│     │                                                       │
│     ├─→ Data Fetching (Direct Database Access)            │
│     │   - No API route needed                              │
│     │   - Parallel data fetching                           │
│     │                                                       │
│     ├─→ Component Tree Building                            │
│     │   - Server components (static)                       │
│     │   - Client components (interactive)                  │
│     │                                                       │
│     └─→ HTML Streaming to Client                           │
│         - Progressive rendering                             │
│         - Suspense boundaries                               │
│     ↓                                                       │
│  4. Client-Side Hydration                                  │
│     - Interactive components only                           │
│     ↓                                                       │
│  5. User Interaction                                       │
│     - Server Actions for mutations                          │
│     - Client state for UI                                   │
└─────────────────────────────────────────────────────────────┘
```

### Server Action Flow (Mutations)

```
┌─────────────────────────────────────────────────────────────┐
│  1. User Interaction (Button Click, Form Submit)           │
│     ↓                                                       │
│  2. Server Action Called                                   │
│     "use server"                                            │
│     ↓                                                       │
│  3. Validation & Authentication                            │
│     ↓                                                       │
│  4. Service Layer Processing                               │
│     ↓                                                       │
│  5. Database Mutation                                      │
│     ↓                                                       │
│  6. Cache Revalidation                                     │
│     revalidatePath() / revalidateTag()                      │
│     ↓                                                       │
│  7. Return Result to Client                                │
│     ↓                                                       │
│  8. Automatic UI Update                                    │
│     - No manual state management needed                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### Component Hierarchy

```typescript
// ✅ COMPONENT ARCHITECTURE

┌──────────────────────────────────────┐
│        Layout Components             │  ← Shells, headers, footers
│  (Server Components - Static)        │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      Feature Components              │  ← Business features
│  (Server + Client Mix)               │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      Composite Components            │  ← Reusable patterns
│  (Client Components - Interactive)   │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      Base UI Components              │  ← Atomic elements
│  (Client Components - Presentational)│
└──────────────────────────────────────┘
```

### Server vs Client Components

```typescript
// ✅ SERVER COMPONENT (Default - No "use client")
// app/farms/[id]/page.tsx
export default async function FarmPage({ params }: { params: { id: string } }) {
  // Direct database access - server only!
  const farm = await database.farm.findUnique({
    where: { id: params.id },
    include: { products: true, owner: true }
  });

  return (
    <main>
      {/* Static content */}
      <FarmHeader farm={farm} />

      {/* Client component for interactivity */}
      <FarmInteractiveMap location={farm.location} />

      {/* More static content */}
      <ProductGrid products={farm.products} />
    </main>
  );
}

// ✅ CLIENT COMPONENT (Needs "use client")
// components/FarmInteractiveMap.tsx
"use client";

import { useState } from "react";

export function FarmInteractiveMap({ location }: { location: Location }) {
  const [zoom, setZoom] = useState(13);

  // Client-side state and interactivity
  return (
    <div>
      <MapComponent location={location} zoom={zoom} />
      <button onClick={() => setZoom(z => z + 1)}>Zoom In</button>
    </div>
  );
}
```

### Component Patterns

```typescript
// ✅ PATTERN 1: Compound Component Pattern
export function FarmCard({ farm }: { farm: Farm }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{farm.name}</Card.Title>
        <Card.Badge status={farm.status} />
      </Card.Header>
      <Card.Body>
        <Card.Description>{farm.description}</Card.Description>
      </Card.Body>
      <Card.Footer>
        <Card.Actions>
          <Button>View Details</Button>
        </Card.Actions>
      </Card.Footer>
    </Card>
  );
}

// ✅ PATTERN 2: Render Props Pattern
export function FarmList({ renderFarm }: { renderFarm: (farm: Farm) => ReactNode }) {
  const { farms } = useFarms();

  return (
    <div>
      {farms.map(farm => renderFarm(farm))}
    </div>
  );
}

// ✅ PATTERN 3: Higher-Order Component Pattern
export function withFarmData<P extends { farm: Farm }>(
  Component: ComponentType<P>
) {
  return function WrappedComponent(props: Omit<P, 'farm'> & { farmId: string }) {
    const { farm } = useFarm(props.farmId);
    return <Component {...props as P} farm={farm} />;
  };
}
```

---

## 🔌 API Architecture

### API Route Structure

```typescript
// ✅ STANDARDIZED API ROUTE PATTERN

// app/api/farms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FarmService } from "@/lib/services/farm.service";
import { CreateFarmSchema } from "@/lib/validation/farm.schema";

// GET /api/farms
export async function GET(request: NextRequest) {
  try {
    const farmService = new FarmService();
    const farms = await farmService.getAllFarms();

    return NextResponse.json({
      success: true,
      data: farms,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARMS_FETCH_ERROR",
          message: error.message,
        },
      },
      { status: 500 },
    );
  }
}

// POST /api/farms
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    // 2. Parse and validate input
    const body = await request.json();
    const validation = CreateFarmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", details: validation.error },
        },
        { status: 400 },
      );
    }

    // 3. Business logic via service
    const farmService = new FarmService();
    const farm = await farmService.createFarm(validation.data);

    // 4. Success response
    return NextResponse.json(
      {
        success: true,
        data: farm,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARM_CREATE_ERROR",
          message: error.message,
        },
      },
      { status: 500 },
    );
  }
}
```

### API Response Format

```typescript
// ✅ STANDARDIZED API RESPONSE

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
    requestId?: string;
    timestamp?: string;
  };
}

// Success response
{
  "success": true,
  "data": { /* payload */ },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2024-12-15T10:30:00Z"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { /* error details */ }
  }
}
```

---

## 🗄️ Database Architecture

### Prisma Schema Organization

```prisma
// prisma/schema.prisma

// ✅ USER & AUTHENTICATION
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          UserRole  @default(CUSTOMER)

  // Relations
  farms         Farm[]
  orders        Order[]

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([role])
}

enum UserRole {
  CUSTOMER
  FARMER
  ADMIN
}

// ✅ FARM DOMAIN
model Farm {
  id            String       @id @default(cuid())
  name          String
  slug          String       @unique
  description   String?
  status        FarmStatus   @default(PENDING_VERIFICATION)

  // Location (JSON field for flexibility)
  location      Json

  // Relations
  ownerId       String
  owner         User         @relation(fields: [ownerId], references: [id])
  products      Product[]

  // Timestamps
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([ownerId])
  @@index([status])
  @@index([slug])
}

enum FarmStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  INACTIVE
}

// ✅ PRODUCT CATALOG
model Product {
  id            String         @id @default(cuid())
  name          String
  description   String?
  price         Decimal        @db.Decimal(10, 2)
  unit          String         // kg, lb, bunch, etc.
  category      ProductCategory
  status        ProductStatus  @default(AVAILABLE)

  // Inventory
  stockQuantity Int            @default(0)

  // Relations
  farmId        String
  farm          Farm           @relation(fields: [farmId], references: [id])
  orderItems    OrderItem[]

  // Timestamps
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([farmId])
  @@index([category])
  @@index([status])
}

enum ProductCategory {
  VEGETABLES
  FRUITS
  HERBS
  DAIRY
  MEAT
  EGGS
  OTHER
}

enum ProductStatus {
  AVAILABLE
  OUT_OF_STOCK
  DISCONTINUED
}

// ✅ ORDER PROCESSING
model Order {
  id            String       @id @default(cuid())
  orderNumber   String       @unique
  status        OrderStatus  @default(PENDING)
  totalAmount   Decimal      @db.Decimal(10, 2)

  // Relations
  customerId    String
  customer      User         @relation(fields: [customerId], references: [id])
  items         OrderItem[]

  // Timestamps
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([customerId])
  @@index([status])
  @@index([orderNumber])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  READY_FOR_PICKUP
  COMPLETED
  CANCELLED
}

model OrderItem {
  id            String    @id @default(cuid())
  quantity      Int
  price         Decimal   @db.Decimal(10, 2)

  // Relations
  orderId       String
  order         Order     @relation(fields: [orderId], references: [id])
  productId     String
  product       Product   @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@index([productId])
}
```

### Database Query Patterns

```typescript
// ✅ QUERY PATTERN 1: Simple Find
const farm = await database.farm.findUnique({
  where: { id: farmId },
});

// ✅ QUERY PATTERN 2: Find with Relations
const farm = await database.farm.findUnique({
  where: { id: farmId },
  include: {
    owner: true,
    products: {
      where: { status: "AVAILABLE" },
    },
  },
});

// ✅ QUERY PATTERN 3: Filtered List with Pagination
const farms = await database.farm.findMany({
  where: {
    status: "ACTIVE",
    location: { path: ["city"], equals: "Seattle" },
  },
  include: {
    products: { take: 5 },
  },
  orderBy: { createdAt: "desc" },
  take: 20,
  skip: page * 20,
});

// ✅ QUERY PATTERN 4: Aggregation
const stats = await database.product.aggregate({
  where: { farmId },
  _count: true,
  _sum: { stockQuantity: true },
  _avg: { price: true },
});

// ✅ QUERY PATTERN 5: Transaction
const result = await database.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });

  for (const item of orderItems) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { decrement: item.quantity } },
    });
  }

  return order;
});
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

```typescript
// ✅ NEXTAUTH V5 CONFIGURATION

// lib/auth/config.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { database } from "@/lib/database";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(database),
  providers: [
    // Email/Password
    Credentials({
      async authorize(credentials) {
        // Custom authentication logic
        const user = await verifyCredentials(credentials);
        return user;
      },
    }),
    // OAuth providers
    Google({ clientId: process.env.GOOGLE_CLIENT_ID }),
    GitHub({ clientId: process.env.GITHUB_CLIENT_ID }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user role to session
      session.user.role = user.role;
      return session;
    },
  },
});
```

### Authorization Patterns

```typescript
// ✅ PATTERN 1: Route Protection (Middleware)
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session?.user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// ✅ PATTERN 2: API Route Authorization
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "FARMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with authorized action
}

// ✅ PATTERN 3: Resource-Level Authorization
export async function deleteFarm(
  farmId: string,
  userId: string,
): Promise<void> {
  const farm = await database.farm.findUnique({ where: { id: farmId } });

  if (!farm) {
    throw new NotFoundError("Farm not found");
  }

  if (farm.ownerId !== userId) {
    throw new ForbiddenError("You don't have permission to delete this farm");
  }

  await database.farm.delete({ where: { id: farmId } });
}

// ✅ PATTERN 4: Role-Based Access Control (RBAC)
const PERMISSIONS = {
  ADMIN: ["*"],
  FARMER: ["farm:create", "farm:update", "farm:delete", "product:*"],
  CUSTOMER: ["product:view", "order:create", "order:view"],
};

function can(role: UserRole, permission: string): boolean {
  const rolePermissions = PERMISSIONS[role];
  return rolePermissions.some(
    (p) =>
      p === "*" ||
      p === permission ||
      (p.endsWith(":*") && permission.startsWith(p.split(":")[0])),
  );
}
```

---

## ⚡ Performance Architecture

### Caching Strategy

```typescript
// ✅ MULTI-LAYER CACHING ARCHITECTURE

// Layer 1: In-Memory Cache (Fastest)
const memoryCache = new Map<string, any>();

// Layer 2: Redis Cache (Fast)
import { Redis } from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

// Layer 3: Database (Source of Truth)
import { database } from "@/lib/database";

// Unified Cache Service
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    // L1: Check memory
    if (memoryCache.has(key)) {
      return memoryCache.get(key) as T;
    }

    // L2: Check Redis
    const cached = await redis.get(key);
    if (cached) {
      const value = JSON.parse(cached);
      memoryCache.set(key, value);
      return value;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    // Store in both layers
    memoryCache.set(key, value);
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    // Clear matching keys from both layers
    memoryCache.clear();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### Query Optimization

```typescript
// ✅ OPTIMIZED QUERY PATTERNS

// ❌ BAD: N+1 Query Problem
async function getFarmsWithProducts() {
  const farms = await database.farm.findMany();

  for (const farm of farms) {
    farm.products = await database.product.findMany({
      where: { farmId: farm.id },
    });
  }

  return farms;
}

// ✅ GOOD: Single Query with Include
async function getFarmsWithProducts() {
  return await database.farm.findMany({
    include: {
      products: {
        where: { status: "AVAILABLE" },
        take: 10,
      },
    },
  });
}

// ✅ BETTER: Parallel Queries
async function getDashboardData() {
  const [farms, products, orders] = await Promise.all([
    database.farm.findMany({ take: 10 }),
    database.product.findMany({ take: 20 }),
    database.order.findMany({ take: 50 }),
  ]);

  return { farms, products, orders };
}

// ✅ BEST: Select Only Needed Fields
async function getFarmList() {
  return await database.farm.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      _count: { select: { products: true } },
    },
  });
}
```

### Performance Monitoring

```typescript
// ✅ OPENTELEMETRY TRACING

import { trace, SpanStatusCode } from "@opentelemetry/api";

export class TracedFarmService {
  async createFarm(data: CreateFarmData): Promise<Farm> {
    const tracer = trace.getTracer("farm-service");

    return await tracer.startActiveSpan("createFarm", async (span) => {
      span.setAttributes({
        "farm.name": data.name,
        "farm.owner_id": data.ownerId,
      });

      try {
        const farm = await database.farm.create({ data });
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttributes({ "farm.id": farm.id });
        return farm;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

---

## 🔒 Security Architecture

### Security Layers

```
┌────────────────────────────────────────────────────────┐
│  1. Network Security (Azure WAF, DDoS Protection)      │
├────────────────────────────────────────────────────────┤
│  2. Application Security (Rate Limiting, CORS)         │
├────────────────────────────────────────────────────────┤
│  3. Authentication (NextAuth v5, JWT, Sessions)        │
├────────────────────────────────────────────────────────┤
│  4. Authorization (RBAC, Resource-Level Permissions)   │
├────────────────────────────────────────────────────────┤
│  5. Input Validation (Zod Schemas, Sanitization)       │
├────────────────────────────────────────────────────────┤
│  6. Data Protection (Encryption at Rest/Transit)       │
├────────────────────────────────────────────────────────┤
│  7. Audit Logging (All Security Events)                │
└────────────────────────────────────────────────────────┘
```

### Security Patterns

```typescript
// ✅ INPUT SANITIZATION
import DOMPurify from "isomorphic-dompurify";

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

// ✅ RATE LIMITING
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function POST(request: NextRequest) {
  const identifier = request.ip ?? "anonymous";
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Proceed with request
}

// ✅ CSRF PROTECTION (Built into NextAuth)
// Automatically handled by Next.js for Server Actions

// ✅ SQL INJECTION PREVENTION (Prisma Parameterization)
// Prisma automatically parameterizes all queries
const user = await database.user.findFirst({
  where: { email: userInput }, // Safe - auto-parameterized
});
```

---

## 📈 Scalability Patterns

### Horizontal Scaling Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Load Balancer                       │
└───────────────────┬────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼───┐       ┌───▼───┐       ┌───▼───┐
│App    │       │App    │       │App    │
│Instance│      │Instance│      │Instance│
│  #1   │       │  #2   │       │  #3   │
└───┬───┘       └───┬───┘       └───┬───┘
    │               │               │
    └───────────────┼───────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼────┐      ┌──▼────┐      ┌───▼────┐
│Database│      │Redis  │      │Storage │
│(Primary│      │Cache  │      │(Blob)  │
│+Replica│      │       │      │        │
└────────┘      └───────┘      └────────┘
```

### Stateless Application Design

```typescript
// ✅ STATELESS PATTERN - No in-memory session state

// ❌ BAD: In-memory state (doesn't scale)
let activeUsers = new Map<string, User>();

// ✅ GOOD: Externalized state (Redis/Database)
async function getActiveUsers(): Promise<User[]> {
  const userIds = await redis.smembers("active:users");
  return await database.user.findMany({
    where: { id: { in: userIds } },
  });
}

// ✅ Session stored in database/JWT (via NextAuth)
const session = await auth(); // Stateless token-based auth
```

### Database Scalability

```typescript
// ✅ READ REPLICA PATTERN

// Write to primary
export async function createFarm(data: CreateFarmData): Promise<Farm> {
  return await database.farm.create({ data });
}

// Read from replica (if configured)
export async function getFarms(): Promise<Farm[]> {
  return await database.$queryRaw`
    SELECT * FROM "Farm" WHERE status = 'ACTIVE'
  `;
}

// ✅ DATABASE SHARDING (Future consideration)
// Partition data by geographic region or farm size
```

---

## 🔗 Integration Points

### External Service Integration

```typescript
// ✅ PAYMENT INTEGRATION (Stripe)
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function processPayment(orderId: string): Promise<void> {
  const order = await database.order.findUnique({ where: { id: orderId } });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(order.totalAmount) * 100,
    currency: "usd",
    metadata: { orderId },
  });

  // Store payment intent ID for tracking
}

// ✅ EMAIL INTEGRATION (SendGrid/Resend)
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(order: Order): Promise<void> {
  await resend.emails.send({
    from: "noreply@farmersmarket.com",
    to: order.customer.email,
    subject: `Order Confirmation #${order.orderNumber}`,
    html: renderOrderConfirmationEmail(order),
  });
}

// ✅ FILE STORAGE (Azure Blob)
import { BlobServiceClient } from "@azure/storage-blob";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING,
);

export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<string> {
  const containerClient =
    blobServiceClient.getContainerClient("product-images");
  const blobName = `${productId}/${Date.now()}-${file.name}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(await file.arrayBuffer());
  return blockBlobClient.url;
}
```

---

## 📚 Related Documentation

### Core Architecture Documents

- **[Folder Structure](./FOLDER_STRUCTURE.md)** - Detailed directory organization
- **[File Relationships](./FILE_RELATIONSHIPS.md)** - Component dependencies
- **[Cache Patterns](./CACHE_PATTERNS.md)** - Caching strategies
- **[Rate Limiter Patterns](./RATE_LIMITER_PATTERNS.md)** - API protection
- **[Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md)** - Speed improvements

### Divine Instructions

- **[Core Principles](../../.github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md)** - Architecture foundation
- **[Next.js Implementation](../../.github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md)** - Full-stack patterns
- **[Database Mastery](../../.github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md)** - Prisma patterns
- **[Kilo-Scale Architecture](../../.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md)** - Enterprise patterns

### Related Guides

- **[Getting Started](../getting-started/README.md)** - Setup and onboarding
- **[API Documentation](../api/README.md)** - API reference
- **[Testing Guide](../testing/README.md)** - Test strategies
- **[Deployment Guide](../deployment/README.md)** - Deployment procedures
- **[Database Guide](../database/README.md)** - Database operations

---

## 🎯 Architecture Decision Records (ADRs)

For detailed architectural decisions, see:

- `docs/adr/` - Architecture Decision Records directory
- **ADR-001**: Choice of Next.js 15 with App Router
- **ADR-002**: Prisma as ORM with PostgreSQL
- **ADR-003**: NextAuth v5 for authentication
- **ADR-004**: Layered architecture pattern
- **ADR-005**: Server Components as default

---

## 🛠️ Tools & Resources

### Development Tools

```bash
# View database schema
pnpm prisma studio

# Generate ER diagram
pnpm prisma generate
pnpm prisma-erd-generator

# Analyze bundle size
pnpm build
pnpm analyze

# Check types
pnpm type-check

# Lint architecture
pnpm lint:architecture
```

### Visualization Tools

- **Prisma Studio** - Database visualization
- **Next.js Bundle Analyzer** - Bundle analysis
- **React DevTools** - Component tree inspection
- **Network Tab** - API request monitoring

---

## 🌟 Best Practices

### Architecture Best Practices

1. **✅ Separation of Concerns** - Each layer has single responsibility
2. **✅ Dependency Injection** - Loose coupling between components
3. **✅ Interface-Based Design** - Abstract implementation details
4. **✅ Test-Driven Development** - Architecture supports testing
5. **✅ Performance-First** - Optimize from the start
6. **✅ Security by Default** - Every layer has security
7. **✅ Observable System** - Full tracing and monitoring
8. **✅ Scalable Patterns** - Horizontal scaling support

### Code Organization

```typescript
// ✅ GOOD: Clear layer separation

// Layer 1: Route Handler (Presentation)
export async function POST(request: NextRequest) {
  const farmService = new FarmService();
  const farm = await farmService.createFarm(data);
  return NextResponse.json({ farm });
}

// Layer 2: Service (Business Logic)
export class FarmService {
  async createFarm(data: CreateFarmData): Promise<Farm> {
    await this.validate(data);
    return await this.repository.create(data);
  }
}

// Layer 3: Repository (Data Access)
export class FarmRepository {
  async create(data: CreateFarmData): Promise<Farm> {
    return await database.farm.create({ data });
  }
}
```

---

## 📞 Support & Feedback

### Questions About Architecture?

- **Architecture Team**: architecture@farmersmarket.com
- **Tech Lead**: Review architectural decisions
- **Weekly Architecture Review**: Fridays 2pm

### Proposing Architecture Changes

1. Create Architecture Decision Record (ADR)
2. Open GitHub Discussion
3. Present in architecture review meeting
4. Document decision and implementation plan

---

**Last Updated**: December 2024  
**Maintained By**: Architecture Team  
**Status**: ✅ Active & Complete  
**Version**: 3.0 - Kilo-Scale Edition

**Quick Navigation**:

- [← Back to Documentation Hub](../README.md)
- [→ Getting Started](../getting-started/README.md)
- [→ API Documentation](../api/README.md)
- [→ Database Guide](../database/README.md)
