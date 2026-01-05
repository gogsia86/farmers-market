# Developer Quickstart Guide

**Farmers Market Platform - Get Started in Minutes**
Version: 1.0
Last Updated: November 15, 2025

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

Ensure you have these installed:
- **Node.js**: v18.17.0 or higher (v22.x recommended)
- **npm**: v10.x or higher
- **PostgreSQL**: v14 or higher
- **Git**: Latest version

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/gogsia86/farmers-market.git
cd farmers-market

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
# Required variables:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

**Minimum `.env` configuration:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# Auth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional but recommended
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database with test data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000)** - You're ready to code!

---

## 📁 Project Structure

```
farmers-market/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (admin)/           # Admin routes (protected)
│   │   ├── (customer)/        # Customer routes
│   │   ├── (farmer)/          # Farmer routes
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # React components
│   │   └── ui/               # Base UI components (Button, Card, etc.)
│   │
│   ├── features/              # Domain-driven feature modules
│   │   ├── auth/             # Authentication
│   │   ├── farm/             # Farm management
│   │   ├── product/          # Product catalog
│   │   ├── order/            # Order processing
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout flow
│   │   └── user/             # User profiles
│   │
│   ├── lib/                   # Core business logic
│   │   ├── services/         # Business logic layer
│   │   ├── database/         # Database singleton
│   │   ├── auth/             # Auth configuration
│   │   ├── utils/            # Helper functions
│   │   └── ai/               # AI Agent Framework
│   │
│   ├── types/                 # TypeScript types
│   └── hooks/                 # React hooks
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts              # Seed data
│
├── public/                    # Static assets
├── docs/                      # Documentation
└── .github/                   # GitHub workflows & templates
```

---

## 🛠️ Common Commands

### Development

```bash
# Start dev server
npm run dev

# Start with turbopack (faster)
npm run dev:turbo

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Database

```bash
# Generate Prisma client (after schema changes)
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# View database schema
npx prisma db pull
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- path/to/test.test.ts
```

### Building

```bash
# Production build
npm run build

# Start production server
npm run start

# Build and start
npm run build && npm run start
```

---

## 🎯 Your First Feature

### Example: Add a New Feature Module

Let's create a new "reviews" feature:

#### 1. Create Directory Structure

```bash
mkdir -p src/features/review/{components,hooks,actions,types}
```

#### 2. Create Types

```typescript
// src/features/review/types/review.types.ts
export interface Review {
  id: string;
  rating: number;
  comment: string;
  productId: string;
  userId: string;
  createdAt: Date;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
  productId: string;
}
```

#### 3. Create Server Action

```typescript
// src/features/review/actions/createReview.action.ts
"use server";

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { revalidatePath } from "next/cache";

export async function createReview(data: CreateReviewRequest) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const review = await database.review.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    revalidatePath(`/products/${data.productId}`);
    return { success: true, review };
  } catch (error) {
    return { success: false, error: "Failed to create review" };
  }
}
```

#### 4. Create Component

```typescript
// src/features/review/components/ReviewForm.tsx
"use client";

import { useState } from "react";
import { createReview } from "../actions/createReview.action";
import { Button } from "@/components/ui/button";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createReview({ productId, rating, comment });

    if (result.success) {
      setComment("");
      alert("Review submitted!");
    } else {
      alert(result.error);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={loading}>
        Submit Review
      </Button>
    </form>
  );
}
```

#### 5. Create Barrel Export

```typescript
// src/features/review/index.ts
export * from "./components/ReviewForm";
export * from "./actions/createReview.action";
export * from "./types/review.types";
```

#### 6. Use in App

```typescript
// src/app/(customer)/products/[id]/page.tsx
import { ReviewForm } from "@/features/review";

export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* Product details */}
      <ReviewForm productId={params.id} />
    </div>
  );
}
```

---

## 🎨 UI Component Usage

### Using Base Components

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button variant="default">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Button Variants

```typescript
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

---

## 🔐 Authentication Patterns

### Protected Page (Server Component)

```typescript
// app/(customer)/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Protected API Route

```typescript
// app/api/profile/route.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({ user: session.user });
}
```

### Client Component with Session

```typescript
"use client";

import { useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <a href="/auth/signin">Sign In</a>;
  }

  return <div>Hello, {session.user.name}</div>;
}
```

---

## 🗄️ Database Patterns

### Always Use Canonical Import

```typescript
// ✅ CORRECT
import { database } from "@/lib/database";

// ❌ WRONG - Don't create new instances
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(); // Don't do this!
```

### CRUD Operations

```typescript
// Create
const farm = await database.farm.create({
  data: {
    name: "Green Valley Farm",
    ownerId: userId,
  },
});

// Read
const farm = await database.farm.findUnique({
  where: { id: farmId },
  include: { products: true },
});

// Update
const updated = await database.farm.update({
  where: { id: farmId },
  data: { name: "Updated Name" },
});

// Delete
await database.farm.delete({
  where: { id: farmId },
});
```

### Query Optimization

```typescript
// ✅ GOOD - Parallel queries
const [farms, count] = await Promise.all([
  database.farm.findMany({ take: 10 }),
  database.farm.count(),
]);

// ✅ GOOD - Select specific fields
const farms = await database.farm.findMany({
  select: {
    id: true,
    name: true,
    location: true,
  },
});

// ❌ BAD - N+1 queries
for (const farm of farms) {
  const products = await database.product.findMany({
    where: { farmId: farm.id },
  });
}

// ✅ BETTER - Single query with include
const farms = await database.farm.findMany({
  include: { products: true },
});
```

---

## 🧪 Testing Guidelines

### Component Test

```typescript
// components/FarmCard.test.tsx
import { render, screen } from "@testing-library/react";
import { FarmCard } from "./FarmCard";

describe("FarmCard", () => {
  it("renders farm information", () => {
    const farm = {
      id: "1",
      name: "Test Farm",
      description: "A test farm",
    };

    render(<FarmCard farm={farm} />);

    expect(screen.getByText("Test Farm")).toBeInTheDocument();
    expect(screen.getByText("A test farm")).toBeInTheDocument();
  });
});
```

### API Route Test

```typescript
// app/api/farms/route.test.ts
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("/api/farms", () => {
  it("returns list of farms", async () => {
    const request = new NextRequest("http://localhost:3000/api/farms");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

---

## 🐛 Debugging Tips

### Enable Debug Logging

```bash
# Next.js debug mode
DEBUG=* npm run dev

# Prisma query logging
DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=0&connect_timeout=0"
```

### Common Issues & Solutions

#### Issue: "Module not found"
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### Issue: Prisma client out of sync
```bash
npx prisma generate
```

#### Issue: Database connection errors
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Test connection:
npx prisma db pull
```

#### Issue: Type errors after schema change
```bash
npx prisma generate
npm run type-check
```

---

## 📚 Key Documentation Files

Must-read documents:
1. **[dependencies.md](./dependencies.md)** - All project dependencies explained
2. **[feature-directory-migration-plan.md](./feature-directory-migration-plan.md)** - Architecture patterns
3. **[.cursorrules](../.cursorrules)** - Divine coding standards
4. **[.github/instructions/](../.github/instructions/)** - Comprehensive coding guidelines

---

## 🎯 Code Style & Conventions

### Naming Conventions

```typescript
// Components - PascalCase
export function FarmCard() {}

// Files - PascalCase for components
FarmCard.tsx

// Hooks - camelCase with 'use' prefix
export function useFarm() {}

// Server Actions - camelCase with '.action' suffix
createFarm.action.ts

// Types - PascalCase
export interface Farm {}

// Constants - UPPER_SNAKE_CASE
export const MAX_UPLOAD_SIZE = 5_000_000;
```

### Import Order

```typescript
// 1. External dependencies
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal absolute imports
import { database } from "@/lib/database";
import { FarmCard } from "@/features/farm";

// 3. Types
import type { Farm } from "@/types";

// 4. Relative imports (avoid if possible)
import { helper } from "./utils";
```

### File Structure

```typescript
// 1. Imports
import { ... } from "...";

// 2. Types
interface Props {}

// 3. Constants
const CONFIG = {};

// 4. Component/Function
export function Component() {
  // 4a. Hooks
  const [state, setState] = useState();

  // 4b. Handlers
  function handleClick() {}

  // 4c. Effects
  useEffect(() => {}, []);

  // 4d. Render
  return <div>...</div>;
}
```

---

## 🚀 Performance Tips

### 1. Use Server Components by Default

```typescript
// ✅ Server Component (default - no "use client")
export default async function Page() {
  const data = await database.farm.findMany();
  return <div>{data.map(...)}</div>;
}

// Only use "use client" when needed:
// - useState, useEffect, etc.
// - Event handlers
// - Browser APIs
```

### 2. Optimize Images

```typescript
import Image from "next/image";

<Image
  src="/farm.jpg"
  alt="Farm"
  width={800}
  height={600}
  priority={false} // Only true for above-the-fold images
/>
```

### 3. Use Dynamic Imports for Heavy Components

```typescript
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR if not needed
});
```

---

## 🔗 Useful Links

- **Next.js 15 Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://authjs.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/primitives
- **TypeScript Handbook**: https://www.typescriptlang.org/docs

---

## 🆘 Getting Help

### In Order of Preference:

1. **Search the codebase** - Similar patterns exist
2. **Check documentation** - `docs/` folder and `.github/instructions/`
3. **Read error messages** - They're usually helpful
4. **Ask the team** - We're here to help!
5. **GitHub Issues** - For bugs and features

### Before Asking:

- ✅ Have you tried restarting the dev server?
- ✅ Have you run `npx prisma generate` after schema changes?
- ✅ Have you checked your `.env` file?
- ✅ Have you cleared `.next` cache?
- ✅ Have you read the error message carefully?

---

## 🎉 You're Ready!

You now have everything you need to start contributing to the Farmers Market Platform. Remember:

- 🌾 **Agricultural consciousness** - Think about farm domains
- ⚡ **Divine patterns** - Follow the established conventions
- 🧪 **Test your code** - Write tests for new features
- 📚 **Document changes** - Update docs when needed
- 🤝 **Ask questions** - Better to ask than assume

Happy coding! 🚀

---

**Version**: 1.0
**Last Updated**: November 15, 2025
**Maintained By**: Development Team

_"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_ 🌾⚡
