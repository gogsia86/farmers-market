# 🌟 MASTER DEVELOPMENT GUIDE

**Comprehensive Development Reference for Farmers Market Platform**

Last Updated: October 17, 2025 | Status: Production Ready | Tests: 2060/2060 Passing

---

## 📖 TABLE OF CONTENTS

1. [Quick Start](#-quick-start)
2. [Project Architecture](#-project-architecture)
3. [Development Workflows](#-development-workflows)
4. [Tech Stack Reference](#-tech-stack-reference)
5. [Environment Setup](#-environment-setup)
6. [Database Management](#-database-management)
7. [API Reference](#-api-reference)
8. [Component Library](#-component-library)
9. [Design System](#-design-system)
10. [Troubleshooting](#-troubleshooting)

---

## ⚡ QUICK START

### First Time Setup (15 minutes)

```powershell
# 1. Clone repository
git clone <repository-url>
cd Farmers-Market

# 2. Install dependencies
cd farmers-market
npm install

# 3. Set up environment
copy .env.example .env.local
# Edit .env.local with your values

# 4. Initialize database
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev
# Open http://localhost:3000
```

### Daily Development Workflow

```powershell
# Start dev server
npm run dev

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npx prettier --write .
```

---

## 🏗️ PROJECT ARCHITECTURE

### Directory Structure

```
farmers-market/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── (routes)/     # Route groups
│   │   ├── api/          # API endpoints
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   ├── forms/       # Form components
│   │   ├── shop/        # E-commerce components
│   │   └── agricultural/ # Farm-specific components
│   ├── lib/             # Utilities & configs
│   │   ├── auth/        # Authentication
│   │   ├── db/          # Database client
│   │   ├── api/         # API clients
│   │   └── utils/       # Helper functions
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   └── types/           # TypeScript types
├── prisma/              # Database schema
├── public/              # Static assets
├── test/                # Test suites
└── scripts/             # Automation scripts
```

### Critical Files

| File                                  | Purpose                    | Status        |
| ------------------------------------- | -------------------------- | ------------- |
| `app/layout.tsx`                      | Root layout with providers | ✅ Production |
| `app/page.tsx`                        | Homepage                   | ✅ Production |
| `app/api/auth/[...nextauth]/route.ts` | Authentication             | ✅ Production |
| `prisma/schema.prisma`                | Database schema            | ✅ Production |
| `middleware.ts`                       | Request middleware         | ✅ Production |
| `next.config.js`                      | Next.js configuration      | ✅ Production |
| `tailwind.config.ts`                  | Tailwind CSS theme         | ✅ Production |

---

## 🔄 DEVELOPMENT WORKFLOWS

### Component Development

1. **Create Component**

   ```powershell
   # Create component file
   code src/components/feature/MyComponent.tsx
   ```

2. **Write Component**

   ```typescript
   // src/components/feature/MyComponent.tsx
   "use client";

   interface MyComponentProps {
     title: string;
     description?: string;
   }

   export function MyComponent({ title, description }: MyComponentProps) {
     return (
       <div className="p-4">
         <h2 className="text-2xl font-bold">{title}</h2>
         {description && <p className="text-gray-600">{description}</p>}
       </div>
     );
   }
   ```

3. **Create Test**

   ```typescript
   // src/components/feature/__tests__/MyComponent.test.tsx
   import { render, screen } from "@testing-library/react";
   import { MyComponent } from "../MyComponent";

   describe("MyComponent", () => {
     it("renders title correctly", () => {
       render(<MyComponent title="Test Title" />);
       expect(screen.getByText("Test Title")).toBeInTheDocument();
     });
   });
   ```

4. **Run Tests**
   ```powershell
   npm test MyComponent.test.tsx
   ```

### API Development

1. **Create API Route**

   ```typescript
   // app/api/farms/route.ts
   import { NextRequest, NextResponse } from "next/server";
   import { prisma } from "@/lib/db";

   export async function GET(request: NextRequest) {
     try {
       const farms = await prisma.farm.findMany();
       return NextResponse.json(farms);
     } catch (error) {
       return NextResponse.json(
         { error: "Failed to fetch farms" },
         { status: 500 }
       );
     }
   }
   ```

2. **Test API Locally**

   ```powershell
   # Start dev server
   npm run dev

   # Test endpoint
   curl http://localhost:3000/api/farms
   ```

### Database Changes

1. **Modify Schema**

   ```prisma
   // prisma/schema.prisma
   model Farm {
     id          String   @id @default(cuid())
     name        String
     description String?
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
   ```

2. **Apply Changes**

   ```powershell
   # Generate Prisma Client
   npx prisma generate

   # Push to database
   npx prisma db push

   # Or create migration
   npx prisma migrate dev --name add_farm_model
   ```

---

## 💻 TECH STACK REFERENCE

### Core Technologies

| Technology       | Version | Purpose                         |
| ---------------- | ------- | ------------------------------- |
| **Next.js**      | 14.2.0  | React framework with App Router |
| **React**        | 18.3.0  | UI library                      |
| **TypeScript**   | 5.4.5   | Type-safe JavaScript            |
| **Tailwind CSS** | 3.4.1   | Utility-first CSS               |
| **Prisma**       | 5.x     | Database ORM                    |
| **NextAuth.js**  | 5.x     | Authentication                  |

### Development Tools

| Tool                      | Purpose                |
| ------------------------- | ---------------------- |
| **Jest**                  | Unit testing framework |
| **React Testing Library** | Component testing      |
| **Playwright**            | E2E testing            |
| **ESLint**                | Code linting           |
| **Prettier**              | Code formatting        |
| **TypeScript**            | Static type checking   |

### Production Services

| Service           | Purpose              | Dashboard                                            |
| ----------------- | -------------------- | ---------------------------------------------------- |
| **Vercel**        | Hosting & deployment | [vercel.com/dashboard](<https://vercel.com/dashboar>d) |
| **Neon/Supabase** | PostgreSQL database  | Service-specific                                     |
| **Stripe**        | Payment processing   | [dashboard.stripe.com](<https://dashboard.stripe.co>m) |
| **Resend**        | Email service        | [resend.com/dashboard](<https://resend.com/dashboar>d) |

---

## 🔐 ENVIRONMENT SETUP

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# Payments (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (optional)
RESEND_API_KEY="re_..."
```

### Environment Setup Steps

1. **Create .env.local**

   ```powershell
   copy .env.example .env.local
   ```

2. **Set up Database**

   - Create PostgreSQL database on Neon or Supabase
   - Copy connection string to `DATABASE_URL`

3. **Generate NextAuth Secret**

   ```powershell
   openssl rand -base64 32
   ```

4. **Configure OAuth (Optional)**
   - Google: [console.cloud.google.com](<https://console.cloud.google.co>m)
   - GitHub: [github.com/settings/developers](<https://github.com/settings/developer>s)

---

## 🗄️ DATABASE MANAGEMENT

### Prisma Commands

```powershell
# Generate Prisma Client
npx prisma generate

# Push schema to database (dev)
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (visual editor)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Common Queries

```typescript
// Find all farms
const farms = await prisma.farm.findMany();

// Find specific farm
const farm = await prisma.farm.findUnique({
  where: { id: farmId },
});

// Create farm
const farm = await prisma.farm.create({
  data: {
    name: "New Farm",
    description: "Description",
  },
});

// Update farm
const farm = await prisma.farm.update({
  where: { id: farmId },
  data: { name: "Updated Name" },
});

// Delete farm
await prisma.farm.delete({
  where: { id: farmId },
});

// Complex query with relations
const farms = await prisma.farm.findMany({
  include: {
    products: true,
    owner: {
      select: {
        name: true,
        email: true,
      },
    },
  },
  where: {
    products: {
      some: {
        inStock: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 10,
});
```

---

## 🔌 API REFERENCE

### Core API Endpoints

| Endpoint                  | Method | Purpose          | Auth Required |
| ------------------------- | ------ | ---------------- | ------------- |
| `/api/health`             | GET    | Health check     | ❌            |
| `/api/farms`              | GET    | List farms       | ❌            |
| `/api/farms/:id`          | GET    | Get farm details | ❌            |
| `/api/farms`              | POST   | Create farm      | ✅            |
| `/api/products`           | GET    | List products    | ❌            |
| `/api/products/:id`       | GET    | Get product      | ❌            |
| `/api/cart`               | GET    | Get cart         | ✅            |
| `/api/cart`               | POST   | Add to cart      | ✅            |
| `/api/orders`             | POST   | Create order     | ✅            |
| `/api/auth/[...nextauth]` | \*     | Authentication   | -             |

### API Client Usage

```typescript
// Fetch farms
const response = await fetch("/api/farms");
const farms = await response.json();

// Create farm (authenticated)
const response = await fetch("/api/farms", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "My Farm",
    description: "Farm description",
  }),
});
```

---

## 🎨 COMPONENT LIBRARY

### Base UI Components

Located in `src/components/ui/`

```typescript
// Button
import { Button } from "@/components/ui/button";
<Button variant="primary" size="lg">
  Click Me
</Button>;

// Card
import { Card, CardHeader, CardContent } from "@/components/ui/card";
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>;

// Input
import { Input } from "@/components/ui/input";
<Input type="text" placeholder="Enter text" />;

// Badge
import { Badge } from "@/components/ui/badge";
<Badge variant="success">Active</Badge>;
```

### Agricultural Components

Located in `src/components/agricultural/`

- `FarmCard` - Farm display card
- `ProductCard` - Product display card
- `FarmStatistics` - Farm metrics dashboard
- `SeasonalBadge` - Seasonal indicators
- `FarmerProfile` - Farmer information display

---

## 🎨 DESIGN SYSTEM

### Color Palette

```typescript
// Agricultural theme colors
const colors = {
  agricultural: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // Primary
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
};
```

### Typography

```typescript
// Font sizes
text-xs    // 0.75rem (12px)
text-sm    // 0.875rem (14px)
text-base  // 1rem (16px)
text-lg    // 1.125rem (18px)
text-xl    // 1.25rem (20px)
text-2xl   // 1.5rem (24px)
text-3xl   // 1.875rem (30px)
text-4xl   // 2.25rem (36px)

// Font weights
font-normal   // 400
font-medium   // 500
font-semibold // 600
font-bold     // 700
```

### Spacing

```typescript
// Tailwind spacing scale
p - 1; // 0.25rem (4px)
p - 2; // 0.5rem (8px)
p - 4; // 1rem (16px)
p - 6; // 1.5rem (24px)
p - 8; // 2rem (32px)
```

---

## 🐛 TROUBLESHOOTING

### Common Issues

#### Build Errors

**Problem**: TypeScript errors during build
**Solution**:

```powershell
# Check for type errors
npm run type-check

# Generate Prisma Client
npx prisma generate
```

#### Test Failures

**Problem**: Tests failing unexpectedly
**Solution**:

```powershell
# Clear Jest cache
npm test -- --clearCache

# Run specific test
npm test -- MyComponent.test.tsx

# Update snapshots
npm test -- -u
```

#### Database Issues

**Problem**: Prisma can't connect to database
**Solution**:

```powershell
# Verify DATABASE_URL in .env.local
# Check database is running
# Regenerate Prisma Client
npx prisma generate
```

#### Port Already in Use

**Problem**: Port 3000 already in use
**Solution**:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### Debug Modes

```powershell
# Enable Next.js debug logging
set DEBUG=* && npm run dev

# Verbose test output
npm test -- --verbose

# Profile build performance
npm run build -- --profile
```

---

## 📚 ADDITIONAL RESOURCES

### Internal Documentation

- [Master Test Report](../testing/MASTER_TEST_REPORT.md) - Complete testing guide
- [Master Profiling Guide](../profiling/MASTER_PROFILING_GUIDE.md) - Performance optimization
- [Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md) - Production deployment
- [Divine Instructions](../../.github/instructions/) - Code patterns & best practices

### External Resources

- [Next.js Documentation](<https://nextjs.org/doc>s)
- [React Documentation](<https://react.de>v)
- [Tailwind CSS Documentation](<https://tailwindcss.com/doc>s)
- [Prisma Documentation](<https://www.prisma.io/doc>s)
- [TypeScript Handbook](<https://www.typescriptlang.org/docs/handbook/intro.htm>l)

---

## 🎯 DEVELOPMENT CHECKLIST

Before committing code:

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npx prettier --write .`)
- [ ] Changes documented
- [ ] Environment variables updated (if needed)
- [ ] Database migrations created (if schema changed)

---

**Status**: Production Ready | **Tests**: 2060/2060 Passing | **Coverage**: 100%

_"Divine code flows from clear understanding."_
