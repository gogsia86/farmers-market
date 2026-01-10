# 🚀 Development Guide

## Quick Start

Get the Farmers Market Platform running locally in 5 minutes:

### Prerequisites

- **Node.js 20.x** (use [nvm](https://github.com/nvm-sh/nvm) for easy version management)
- **npm 10.x** or higher
- **PostgreSQL 15+** with PostGIS extension
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd farmers-market-platform

# 2. Use the correct Node version
nvm use 20
# If you don't have Node 20: nvm install 20

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 5. Set up the database
npm run db:push
npm run db:seed

# 6. Start the development server
npm run dev
```

🎉 **Done!** Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Core Commands

### Development

```bash
npm run dev              # Start dev server (Turbopack, recommended)
npm run dev:webpack      # Start dev server (Webpack, fallback)
```

### Building

```bash
npm run build            # Production build
npm run start            # Start production server
npm run build:analyze    # Build with bundle analysis
```

### Code Quality

```bash
npm run lint             # Lint code
npm run lint:fix         # Lint and auto-fix
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript validation
npm run quality          # Run all quality checks
```

### Testing

```bash
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI
```

### Database

```bash
npm run db:migrate       # Create and apply migration
npm run db:push          # Push schema changes (dev only)
npm run db:seed          # Seed with test data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (⚠️ destructive)
```

### Advanced Testing

```bash
npm run test:visual      # Visual regression tests
npm run test:mobile      # Mobile device tests
npm run test:a11y        # Accessibility tests
npm run test:load        # Load testing (k6)
npm run test:security    # Security vulnerability scan
```

**📚 For complete script reference**, see [`docs/SCRIPTS_REFERENCE.md`](./docs/SCRIPTS_REFERENCE.md)

---

## Environment Variables

### Required Variables

Create a `.env.local` file with these variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmersmarket"
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/farmersmarket?pgbouncer=true"

# Authentication
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (use test keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (optional for local dev)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@farmersmarket.com"

# Sentry (optional)
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="your-token"

# Redis (optional, for caching/queues)
REDIS_URL="redis://localhost:6379"
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-id"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Firebase (for push notifications)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account-email"
FIREBASE_PRIVATE_KEY="your-private-key"
```

---

## Project Structure

```
farmers-market-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (admin)/           # Admin route group
│   │   ├── (customer)/        # Customer route group
│   │   ├── (farmer)/          # Farmer route group
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives
│   │   ├── features/         # Feature components
│   │   └── layouts/          # Layout components
│   ├── lib/                   # Core business logic
│   │   ├── database/         # Database singleton
│   │   ├── services/         # Business logic layer
│   │   ├── repositories/     # Data access layer
│   │   ├── auth/             # Authentication
│   │   └── utils/            # Utilities
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed.ts                # Seed script
├── tests/
│   ├── unit/                  # Unit tests (Jest)
│   ├── integration/           # Integration tests
│   ├── e2e/                   # E2E tests (Playwright)
│   ├── visual/                # Visual regression tests
│   ├── mobile/                # Mobile tests
│   ├── accessibility/         # A11y tests
│   ├── load/                  # Load tests (k6)
│   └── security/              # Security tests
├── public/                    # Static assets
├── docs/                      # Documentation
│   ├── SCRIPTS_REFERENCE.md   # Complete script reference
│   ├── TESTING.md             # Testing guide
│   └── DOCKER.md              # Docker reference
├── scripts/                   # Utility scripts
├── docker/                    # Docker configs
├── .github/                   # GitHub workflows
├── next.config.mjs            # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS config
├── prisma.config.ts           # Prisma configuration
└── package.json               # Dependencies & scripts
```

---

## Tech Stack

### Core

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Prisma 7** - ORM & database toolkit
- **PostgreSQL 16** - Database (with PostGIS)

### UI & Styling

- **Tailwind CSS 3.4** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Authentication & Security

- **NextAuth v5** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

### Testing

- **Jest 30** - Unit testing
- **Playwright 1.57** - E2E testing
- **Testing Library** - Component testing
- **k6** - Load testing

### Infrastructure

- **Vercel** - Deployment platform
- **Sentry** - Error tracking
- **Stripe** - Payments
- **Cloudinary** - Image hosting
- **Redis** - Caching & queues

### Monitoring & Observability

- **OpenTelemetry** - Distributed tracing
- **Azure Monitor** - Application insights
- **Pino** - Structured logging

---

## Development Workflow

### 1. Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes
# ... code, code, code ...

# 3. Run quality checks
npm run quality

# 4. Run tests
npm test

# 5. Commit changes
git add .
git commit -m "feat: add your feature"

# 6. Push and create PR
git push origin feature/your-feature-name
```

### 2. Database Changes

```bash
# 1. Modify prisma/schema.prisma
# ... edit schema ...

# 2. Create migration
npm run db:migrate
# Follow the prompts to name your migration

# 3. Migration files created in prisma/migrations/
# 4. Prisma Client auto-regenerated

# 5. Update seed script if needed
# Edit prisma/seed.ts

# 6. Test migration on fresh database
npm run db:reset
```

### 3. Running Tests

```bash
# Unit tests (fast, run frequently)
npm test

# E2E tests (slower, run before PR)
npm run test:e2e

# Visual tests (run after UI changes)
npm run test:visual

# All tests (run before merge)
npm test && npm run test:e2e
```

---

## Common Tasks

### Adding a New API Route

```typescript
// src/app/api/your-route/route.ts
import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const data = await database.yourModel.findMany();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Adding a New Page

```typescript
// src/app/your-page/page.tsx
export default async function YourPage() {
  // Server Component - can fetch data directly
  const data = await fetchData();

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Your Page</h1>
      {/* ... */}
    </main>
  );
}

// Metadata for SEO
export const metadata = {
  title: "Your Page | Farmers Market",
  description: "Your page description",
};
```

### Adding a New Database Model

```prisma
// prisma/schema.prisma
model YourModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("your_models")
}
```

```bash
# Create migration
npm run db:migrate

# Generate Prisma Client
npx prisma generate
```

---

## Troubleshooting

### Port 3001 Already in Use

```bash
# Windows
npx kill-port 3001

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Module Not Found Errors

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Prisma Client Errors

```bash
npx prisma generate
```

### Build Fails

```bash
# Check environment variables
npm run vercel:preflight

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Database Connection Issues

```bash
# Verify PostgreSQL is running
# Mac: brew services list
# Linux: systemctl status postgresql
# Windows: Check Services app

# Test connection
npx prisma db push
```

---

## IDE Setup

### VS Code (Recommended)

Install these extensions:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Prisma** - Prisma syntax highlighting
- **TypeScript Error Translator** - Better error messages

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Performance Tips

### Development

- **Use Turbopack**: `npm run dev` (default, faster HMR)
- **Increase memory**: Already configured in scripts (16GB)
- **Use `skipLibCheck: true`**: Already enabled in tsconfig
- **Selective imports**: Import only what you need from large libraries

### Production

- **Enable compression**: Already enabled in next.config
- **Optimize images**: Use Next.js `<Image>` component
- **Minimize client-side JS**: Use Server Components when possible
- **Enable caching**: Redis for API responses

---

## Contributing

1. **Read the guidelines**: Check `CONTRIBUTING.md`
2. **Follow the code style**: Run `npm run quality` before committing
3. **Write tests**: Maintain >80% coverage
4. **Update docs**: Document new features/APIs
5. **Small PRs**: One feature per PR when possible

---

## Resources

- **Documentation**: [`/docs`](./docs) directory
- **API Docs**: [`/docs/api/swagger`](./docs/api/swagger)
- **Scripts Reference**: [`docs/SCRIPTS_REFERENCE.md`](./docs/SCRIPTS_REFERENCE.md)
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Playwright Docs**: https://playwright.dev

---

## Getting Help

- **GitHub Issues**: Report bugs and request features
- **Team Chat**: #engineering channel
- **Documentation**: Check `/docs` first
- **Stack Overflow**: Tag with `nextjs`, `prisma`, `typescript`

---

**Happy coding! 🌾✨**