# 🚀 Getting Started with Farmers Market Platform

**Welcome to the Divine Agricultural Intelligence Platform!** This guide will help you set up your development environment and start contributing to the world's most advanced agricultural e-commerce platform.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Quick Start (5 Minutes)](#-quick-start-5-minutes)
- [Detailed Setup](#-detailed-setup)
- [First Steps](#-first-steps)
- [Development Workflow](#-development-workflow)
- [Common Tasks](#-common-tasks)
- [Learning Paths](#-learning-paths)
- [Troubleshooting](#-troubleshooting)
- [Next Steps](#-next-steps)

---

## 🎯 Overview

The Farmers Market Platform is an enterprise-grade Next.js 15 application that connects farmers directly with consumers. Built with divine consciousness and agricultural awareness, it demonstrates world-class patterns in:

- **Full-Stack TypeScript**: 100% type-safe from database to UI
- **Next.js 15 App Router**: Server Components, Server Actions, and streaming
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **NextAuth v5**: Enterprise authentication and authorization
- **Comprehensive Testing**: 2,700+ tests with 82%+ coverage
- **AI Integration**: Microsoft Agent Framework for intelligent features

### Architecture Highlights

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│   Next.js 15 App Router + Server Components + RSC       │
├─────────────────────────────────────────────────────────┤
│                  Service Layer (Business Logic)          │
│   Farm • Product • Order • Cart • Payment Services      │
├─────────────────────────────────────────────────────────┤
│                   Data Layer (Prisma)                    │
│   PostgreSQL with connection pooling & migrations       │
├─────────────────────────────────────────────────────────┤
│              Infrastructure (Production)                 │
│   Vercel/Azure • Docker • Kubernetes • Redis Cache      │
└─────────────────────────────────────────────────────────┘
```

**Key Stats**:
- **2,700+** passing tests (98.2% success rate)
- **82%+** code coverage
- **Zero** TypeScript errors in production code
- **100%** ServiceResponse pattern compliance
- **<100ms** average API response time

---

## ✅ Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.17+ or 20+ | Runtime environment |
| **pnpm** | 8.0+ | Package manager (faster than npm) |
| **PostgreSQL** | 14+ | Database |
| **Git** | 2.30+ | Version control |

### Optional Tools

- **VS Code** - Recommended IDE with extensions configured
- **Docker Desktop** - For containerized development
- **Prisma Studio** - Visual database browser
- **Postman/Insomnia** - API testing

### System Requirements

**Minimum**:
- RAM: 8GB
- Storage: 20GB free space
- CPU: 4 cores

**Recommended (HP OMEN optimized)**:
- RAM: 64GB (enables aggressive caching)
- Storage: 100GB+ SSD
- CPU: 12 threads (Intel i7/i9 or AMD Ryzen 7/9)
- GPU: RTX 2070 Max-Q or better (for AI features)

---

## ⚡ Quick Start (5 Minutes)

Get the platform running in 5 minutes or less:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/farmers-market-platform.git
cd farmers-market-platform

# 2. Install dependencies (pnpm is REQUIRED)
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Set up database (requires PostgreSQL running)
pnpm db:setup

# 5. Start development server
pnpm dev
```

**Access the platform**:
- 🌐 **App**: http://localhost:3000
- 📊 **Database Studio**: Run `pnpm db:studio` → http://localhost:5555

That's it! The platform is now running with seed data including test users, farms, and products.

---

## 🛠️ Detailed Setup

### Step 1: Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/your-org/farmers-market-platform.git

# Using SSH (recommended)
git clone git@github.com:your-org/farmers-market-platform.git

cd farmers-market-platform
```

### Step 2: Install Dependencies

**Important**: This project uses `pnpm` for package management. Do NOT use `npm` or `yarn`.

```bash
# Install pnpm globally if you haven't already
npm install -g pnpm

# Install project dependencies
pnpm install

# Verify installation
pnpm --version  # Should show 8.0+
```

### Step 3: Environment Configuration

Create your local environment file:

```bash
cp .env.example .env.local
```

**Configure required variables** in `.env.local`:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-here"  # Generate with: openssl rand -base64 32

# Optional: Payment Integration
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Optional: AI Features
OPENAI_API_KEY="sk-your-openai-key"
AZURE_OPENAI_API_KEY="your-azure-key"
```

**Security Note**: NEVER commit `.env.local` to version control. It's already in `.gitignore`.

### Step 4: Database Setup

Ensure PostgreSQL is running, then:

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm db:migrate

# Seed with test data (optional but recommended)
pnpm db:seed
```

**Using Docker** (alternative):

```bash
# Start PostgreSQL in Docker
docker-compose up -d db

# Then proceed with migrations
pnpm db:setup
```

### Step 5: Start Development Server

```bash
# Standard development mode
pnpm dev

# HP OMEN optimized mode (uses all 12 threads)
pnpm dev:omen

# Safe mode (if you encounter issues)
pnpm dev:safe
```

The server will start at **http://localhost:3000** with hot-reload enabled.

### Step 6: Verify Installation

Open http://localhost:3000 and you should see:

✅ Homepage loads without errors
✅ You can navigate to `/auth/signin`
✅ Database connection is working
✅ Seed data is visible (farms, products)

**Test Accounts** (if you ran `pnpm db:seed`):
- Admin: `admin@farmersmarket.com` / `admin123`
- Farmer: `farmer@farmersmarket.com` / `farmer123`
- Customer: `customer@farmersmarket.com` / `customer123`

---

## 🎓 First Steps

### Step 1: Explore the Codebase

Familiarize yourself with the project structure:

```
src/
├── app/                    # Next.js App Router (pages & API routes)
│   ├── (admin)/           # Admin dashboard routes
│   ├── (customer)/        # Customer-facing routes
│   ├── (farmer)/          # Farmer dashboard routes
│   └── api/               # API endpoints
├── components/            # React components
│   ├── ui/               # Base UI components (buttons, cards)
│   └── features/         # Feature-specific components
├── lib/                   # Core business logic
│   ├── services/         # Service layer (Farm, Product, Order)
│   ├── database/         # Database singleton
│   ├── auth/             # Authentication utilities
│   └── utils/            # Helper functions
├── types/                 # TypeScript type definitions
└── hooks/                 # React hooks
```

**Key Files to Review**:
- `src/lib/database/index.ts` - Canonical database import
- `src/lib/auth/index.ts` - Authentication utilities
- `src/types/index.ts` - Shared TypeScript types
- `.cursorrules` - Divine coding standards

### Step 2: Run the Tests

Verify everything is working:

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests
pnpm test:e2e              # End-to-end tests

# Watch mode (re-runs on file changes)
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

**Expected Results**:
- ✅ 2,700+ tests passing
- ✅ 98%+ success rate
- ✅ 82%+ code coverage

### Step 3: Check Code Quality

Run linting and type checking:

```bash
# Check TypeScript types
pnpm type-check

# Run ESLint
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format
```

**Expected**: Zero errors, zero warnings.

### Step 4: Explore Documentation

Read the essential guides:

- **[Development Guide](../development/README.md)** - Development workflow and patterns
- **[Testing Guide](../development/testing-guide.md)** - Comprehensive testing documentation
- **[Deployment Guide](../deployment/README.md)** - Deployment procedures
- **[API Documentation](../api/README.md)** - API reference

### Step 5: Make Your First Change

Try a simple component modification:

1. Open `src/app/page.tsx`
2. Modify the homepage hero text
3. Save and see hot-reload in action
4. Run `pnpm test` to ensure nothing broke
5. Commit with a clear message: `git commit -m "Update homepage hero text"`

---

## 🔄 Development Workflow

### Standard Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes with hot-reload
pnpm dev

# 3. Run tests continuously
pnpm test:watch

# 4. Check code quality
pnpm lint && pnpm type-check

# 5. Commit changes
git add .
git commit -m "feat: add your feature"

# 6. Push and create PR
git push origin feature/your-feature-name
```

### Daily Commands

```bash
# Start your day
pnpm dev                    # Start dev server
pnpm db:studio             # Open database browser

# During development
pnpm test:watch            # Continuous testing
pnpm type-check            # Type safety verification

# Before committing
pnpm lint:fix              # Fix linting issues
pnpm test                  # Full test suite
```

---

## 📚 Common Tasks

### Database Operations

```bash
# View database in browser
pnpm db:studio

# Create new migration
pnpm prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
pnpm db:reset

# Re-seed database
pnpm db:seed

# Generate Prisma client (after schema changes)
pnpm prisma generate
```

### Adding a New Feature

```bash
# 1. Create service layer
touch src/lib/services/your-feature.service.ts

# 2. Create API route
mkdir -p src/app/api/your-feature
touch src/app/api/your-feature/route.ts

# 3. Create UI components
mkdir -p src/components/features/your-feature
touch src/components/features/your-feature/YourComponent.tsx

# 4. Add tests
mkdir -p src/__tests__/services
touch src/__tests__/services/your-feature.service.test.ts
```

### Component Development

```bash
# Generate component with tests (if using generator)
pnpm generate:component YourComponent

# Manual creation
mkdir -p src/components/features/your-feature
touch src/components/features/your-feature/YourComponent.tsx
touch src/components/features/your-feature/YourComponent.test.tsx
```

---

## 🎓 Learning Paths

### For Frontend Developers

**Week 1: Fundamentals**
1. Study Next.js 15 App Router patterns in `src/app/`
2. Review existing components in `src/components/`
3. Understand Server vs Client Components
4. Complete: Build a simple product listing page

**Week 2: Advanced Topics**
1. Server Actions in `src/app/actions/`
2. Form handling with `react-hook-form` + Zod
3. State management with Zustand
4. Complete: Build a shopping cart feature

**Week 3: Production Ready**
1. Testing with React Testing Library
2. Accessibility best practices
3. Performance optimization
4. Complete: Optimize an existing feature

### For Backend Developers

**Week 1: Architecture**
1. Review service layer patterns in `src/lib/services/`
2. Study Prisma schema in `prisma/schema.prisma`
3. Understand ServiceResponse<T> pattern
4. Complete: Add a new API endpoint

**Week 2: Advanced Features**
1. Authentication with NextAuth v5
2. Authorization and RBAC patterns
3. Database optimization techniques
4. Complete: Implement a complex business rule

**Week 3: Quality & Testing**
1. Service layer testing patterns
2. Integration test strategies
3. API contract testing
4. Complete: Achieve 90%+ test coverage on your feature

### For Full-Stack Developers

Follow both paths above, focusing on integration between layers.

---

## 🔧 Troubleshooting

### Issue: Database Connection Failed

**Symptoms**: `Error: Can't reach database server at localhost:5432`

**Solutions**:
```bash
# 1. Check if PostgreSQL is running
psql --version
pg_isready

# 2. Start PostgreSQL (macOS)
brew services start postgresql@14

# 3. Start PostgreSQL (Linux)
sudo systemctl start postgresql

# 4. Using Docker
docker-compose up -d db

# 5. Verify DATABASE_URL in .env.local
```

### Issue: Port 3000 Already in Use

**Symptoms**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Kill process on port 3000
pnpm kill-server

# Or manually (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or manually (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Use different port
PORT=3001 pnpm dev
```

### Issue: Prisma Client Not Generated

**Symptoms**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
# Regenerate Prisma client
pnpm prisma generate

# Clear cache and regenerate
rm -rf node_modules/.prisma
pnpm prisma generate
```

### Issue: Module Not Found Errors

**Symptoms**: `Cannot find module '@/lib/database'`

**Solutions**:
```bash
# 1. Verify path aliases in tsconfig.json
# Should have: "@/*": ["./src/*"]

# 2. Clear Next.js cache
rm -rf .next
pnpm dev

# 3. Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Getting Help

- **Documentation**: Check [docs/](../) for comprehensive guides
- **GitHub Issues**: Search existing issues or create new one
- **Team Chat**: Ask in #farmers-market-platform channel
- **Stack Overflow**: Tag questions with `farmers-market-platform`

---

## 🚀 Next Steps

### Immediate Actions

1. ✅ Complete setup verification
2. ✅ Read the [Development Guide](../development/README.md)
3. ✅ Review the [Testing Guide](../development/testing-guide.md)
4. ✅ Explore the codebase structure
5. ✅ Make your first contribution

### Recommended Reading

- **Architecture**: [docs/architecture/](../architecture/) - System design and patterns
- **API Guide**: [docs/api/](../api/) - API reference and examples
- **Testing**: [docs/development/testing-guide.md](../development/testing-guide.md) - Testing strategies
- **Deployment**: [docs/deployment/](../deployment/) - Production deployment
- **Divine Instructions**: `.github/instructions/` - Advanced patterns

### Community Resources

- **GitHub**: https://github.com/your-org/farmers-market-platform
- **Documentation**: https://docs.farmersmarket.com
- **Discord**: https://discord.gg/farmers-market
- **Twitter**: @FarmersMarketPlatform

---

## 🌟 Welcome to the Team!

You're now ready to contribute to the Farmers Market Platform! Remember:

- **Code with agricultural consciousness** 🌾
- **Architect with divine precision** ⚡
- **Test comprehensively** ✅
- **Document thoroughly** 📚
- **Ask questions** 💬

**Happy coding!** 🚀

---

**Last Updated**: January 2025
**Version**: 3.0 - Divine Agricultural Edition
**Maintainers**: Development Team
