# 🗂️ Workspace Index

**Farmers Market Platform - File Organization Reference**

Last Updated: 2025-01-XX

---

## 📁 Project Structure Overview

```
farmers-market-platform/
├── 📂 .github/              # GitHub templates & workflows
│   ├── workflows/          # CI/CD workflows
│   └── PULL_REQUEST_TEMPLATE.md
├── 📂 .husky/               # Git hooks
├── 📂 .vscode/              # VSCode settings
├── 📂 docs/                 # 📚 ALL DOCUMENTATION
│   ├── deployment/         # 🚢 Deployment guides
│   ├── quick-start/        # 🚀 Getting started
│   ├── api/                # API documentation
│   ├── architecture/       # System architecture
│   ├── development/        # Development guides
│   ├── guides/             # How-to guides
│   ├── testing/            # Testing documentation
│   └── troubleshooting/    # Problem solving
├── 📂 prisma/              # Database schema & migrations
│   ├── migrations/        # Database migrations
│   ├── seeds/             # Database seeds
│   └── schema.prisma      # Prisma schema
├── 📂 public/              # Static assets
│   ├── images/            # Image files
│   └── fonts/             # Font files
├── 📂 scripts/             # 🔧 Utility scripts
│   ├── maintenance/       # Cleanup & health checks
│   ├── database/          # Database scripts
│   ├── deployment/        # Deployment scripts
│   ├── development/       # Dev helper scripts
│   ├── monitoring/        # Monitoring scripts
│   └── testing/           # Test helper scripts
├── 📂 src/                 # 💻 Source code
│   ├── app/               # Next.js App Router
│   │   ├── (admin)/      # Admin routes
│   │   ├── (customer)/   # Customer routes
│   │   ├── (farmer)/     # Farmer routes
│   │   ├── api/          # API routes
│   │   └── ...           # Layouts, pages
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   └── features/     # Feature components
│   ├── lib/               # Core libraries
│   │   ├── services/     # Business logic services
│   │   ├── database/     # Database utilities
│   │   ├── auth/         # Authentication
│   │   ├── utils/        # Helper functions
│   │   └── ai/           # AI & Agent Framework
│   ├── types/             # TypeScript types
│   └── hooks/             # React hooks
├── 📂 tests/               # Test files
│   ├── e2e/               # End-to-end tests
│   ├── integration/       # Integration tests
│   └── unit/              # Unit tests
├── 📂 types/               # Shared type definitions
├── 📄 .cursorrules         # Cursor AI rules
├── 📄 .dockerignore        # Docker ignore patterns
├── 📄 .gitignore           # Git ignore patterns
├── 📄 .vercelignore        # Vercel ignore patterns
├── 📄 docker-compose.yml   # Docker configuration
├── 📄 eslint.config.mjs    # ESLint configuration
├── 📄 jest.config.js       # Jest configuration
├── 📄 next.config.mjs      # Next.js configuration
├── 📄 package.json         # Dependencies & scripts
├── 📄 playwright.config.ts # Playwright configuration
├── 📄 README.md            # Main project README
├── 📄 tailwind.config.ts   # Tailwind configuration
├── 📄 tsconfig.json        # TypeScript configuration
└── 📄 vercel.json          # Vercel deployment config
```

---

## 🚀 Quick Access Guide

### 📚 Documentation

#### Getting Started

- **New Developer Start:** [`docs/quick-start/START_HERE.md`](./docs/quick-start/START_HERE.md)
- **Quick Setup Guide:** [`docs/quick-start/QUICK_START_GUIDE.md`](./docs/quick-start/QUICK_START_GUIDE.md)
- **TL;DR Guide:** [`docs/quick-start/QUICK_START.md`](./docs/quick-start/QUICK_START.md)
- **Main Documentation:** [`docs/README.md`](./docs/README.md)

#### Deployment

- **Deployment Checklist:** [`docs/deployment/DEPLOYMENT_CHECKLIST.md`](./docs/deployment/DEPLOYMENT_CHECKLIST.md)
- **Deployment Summary:** [`docs/deployment/DEPLOYMENT_SUMMARY.md`](./docs/deployment/DEPLOYMENT_SUMMARY.md)
- **Vercel Analysis:** [`docs/deployment/VERCEL_DEPLOYMENT_ANALYSIS.md`](./docs/deployment/VERCEL_DEPLOYMENT_ANALYSIS.md)
- **Quick Reference:** [`docs/deployment/DEPLOY_QUICK_REFERENCE.md`](./docs/deployment/DEPLOY_QUICK_REFERENCE.md)
- **Troubleshooting:** [`docs/deployment/VERCEL_TROUBLESHOOTING.md`](./docs/deployment/VERCEL_TROUBLESHOOTING.md)

#### Project Info

- **Main README:** [`README.md`](./README.md)
- **Coding Standards:** [`.cursorrules`](./.cursorrules)
- **License:** [`LICENSE`](./LICENSE)
- **Cleanup Guide:** [`CLEANUP_GUIDE.md`](./CLEANUP_GUIDE.md)

---

## ⚙️ Configuration Files

### Core Configuration

| File              | Purpose                    | Location |
| ----------------- | -------------------------- | -------- |
| `package.json`    | Dependencies & npm scripts | Root     |
| `tsconfig.json`   | TypeScript configuration   | Root     |
| `next.config.mjs` | Next.js configuration      | Root     |
| `vercel.json`     | Vercel deployment settings | Root     |

### Database

| File                   | Purpose              | Location  |
| ---------------------- | -------------------- | --------- |
| `prisma/schema.prisma` | Database schema      | `prisma/` |
| `prisma.config.ts`     | Prisma client config | Root      |

### Testing

| File                   | Purpose                 | Location |
| ---------------------- | ----------------------- | -------- |
| `jest.config.js`       | Jest test configuration | Root     |
| `jest.setup.js`        | Jest setup & globals    | Root     |
| `playwright.config.ts` | E2E test configuration  | Root     |

### Styling

| File                 | Purpose               | Location |
| -------------------- | --------------------- | -------- |
| `tailwind.config.ts` | Tailwind CSS config   | Root     |
| `postcss.config.mjs` | PostCSS configuration | Root     |

### Code Quality

| File                | Purpose              | Location |
| ------------------- | -------------------- | -------- |
| `eslint.config.mjs` | ESLint linting rules | Root     |
| `.lintstagedrc.js`  | Lint-staged config   | Root     |

### Monitoring & Observability

| File                      | Purpose              | Location |
| ------------------------- | -------------------- | -------- |
| `instrumentation.ts`      | OpenTelemetry setup  | Root     |
| `sentry.client.config.ts` | Sentry client config | Root     |
| `sentry.edge.config.ts`   | Sentry edge config   | Root     |
| `sentry.server.config.ts` | Sentry server config | Root     |

### Docker

| File                 | Purpose                | Location |
| -------------------- | ---------------------- | -------- |
| `docker-compose.yml` | Docker services        | Root     |
| `.dockerignore`      | Docker ignore patterns | Root     |

### Git & CI/CD

| File                 | Purpose             | Location   |
| -------------------- | ------------------- | ---------- |
| `.gitignore`         | Git ignore patterns | Root       |
| `.github/workflows/` | GitHub Actions      | `.github/` |
| `.husky/`            | Git hooks           | `.husky/`  |

---

## 🔧 NPM Scripts Quick Reference

### Development

```bash
npm run dev              # Start development server (localhost:3000)
npm run dev:debug        # Start with Node.js debugging
npm run dev:turbo        # Start with Turbopack (faster HMR)
```

### Building

```bash
npm run build            # Build for production
npm run start            # Start production server
npm run analyze          # Analyze bundle size
```

### Database

```bash
npm run db:setup         # Setup database (migrate + seed)
npm run db:migrate       # Run Prisma migrations
npm run db:migrate:dev   # Create & apply dev migration
npm run db:reset         # Reset database (dangerous!)
npm run db:seed          # Seed database with data
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:generate      # Generate Prisma Client
```

### Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript checks
npm run format           # Format code with Prettier
npm run quality          # Run all quality checks
```

### Cleanup

```bash
npm run clean            # Clean build artifacts
npm run clean:all        # Deep clean (includes node_modules)
npm run clean:cache      # Clean all caches
```

---

## 📂 Directory Deep Dive

### `/src` - Source Code

#### `/src/app` - Next.js App Router

- **(admin)/** - Admin dashboard routes (role-protected)
- **(customer)/** - Customer-facing routes
- **(farmer)/** - Farmer management routes
- **api/** - API route handlers
- **layout.tsx** - Root layout component
- **page.tsx** - Homepage component

#### `/src/components` - React Components

- **ui/** - Reusable UI components (buttons, cards, inputs)
- **features/** - Feature-specific components (farm cards, product listings)

#### `/src/lib` - Core Libraries

- **services/** - Business logic layer (farmService, productService, etc.)
- **database/** - Database connection & utilities
- **auth/** - Authentication & authorization
- **utils/** - Helper functions & utilities
- **ai/** - AI Agent Framework integration

#### `/src/types` - TypeScript Types

- Type definitions for the application
- Shared interfaces and types

#### `/src/hooks` - React Hooks

- Custom React hooks for state & logic reuse

---

### `/prisma` - Database

#### `/prisma/migrations` - Database Migrations

- Timestamped migration files
- SQL DDL statements
- Managed by Prisma Migrate

#### `/prisma/seeds` - Database Seeds

- Sample data for development
- Test data for staging
- Initial data scripts

#### `/prisma/schema.prisma` - Database Schema

- Complete database schema definition
- Model definitions
- Relations and constraints

---

### `/docs` - Documentation

#### `/docs/quick-start/` - Getting Started

- New developer onboarding
- Setup guides
- Quick reference materials

#### `/docs/deployment/` - Deployment

- Production deployment guides
- Vercel-specific documentation
- Environment configuration
- Troubleshooting guides

#### `/docs/api/` - API Documentation

- API endpoint documentation
- Request/response examples
- Authentication guides

#### `/docs/architecture/` - Architecture

- System design documents
- Architecture decisions (ADRs)
- Technical specifications

#### `/docs/testing/` - Testing

- Testing strategies
- Test organization
- Quality assurance guides

---

### `/scripts` - Utility Scripts

#### `/scripts/maintenance/` - Maintenance

- Cleanup utilities
- Health check scripts
- Optimization tools

#### `/scripts/database/` - Database

- Database setup scripts
- Migration utilities
- Seed data generators

#### `/scripts/deployment/` - Deployment

- Deployment automation
- Pre-deploy checks
- Post-deploy verification

#### `/scripts/development/` - Development

- Dev environment tools
- Code generation
- Development utilities

#### `/scripts/testing/` - Testing

- Test utilities
- Mock data generators
- Test environment setup

---

## 🎯 Common Tasks

### Starting Development

```bash
# 1. Clone repository
git clone <repo-url>
cd farmers-market-platform

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Setup database
npm run db:setup

# 5. Start dev server
npm run dev
```

### Running Tests

```bash
# All tests
npm test

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# With coverage
npm run test:coverage
```

### Database Operations

```bash
# Create new migration
npm run db:migrate:dev -- --name describe_change

# Apply migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Deploying to Production

```bash
# 1. Run quality checks
npm run quality

# 2. Build production
npm run build

# 3. Deploy to Vercel
vercel --prod
```

---

## 🔍 Finding Files

### By Purpose

**Authentication:**

- NextAuth config: `src/lib/auth/`
- Auth API routes: `src/app/api/auth/`
- Middleware: `src/middleware.ts`

**Database:**

- Prisma schema: `prisma/schema.prisma`
- Database singleton: `src/lib/database/index.ts`
- Migrations: `prisma/migrations/`

**Components:**

- UI components: `src/components/ui/`
- Feature components: `src/components/features/`
- Page components: `src/app/**/page.tsx`

**API Routes:**

- All API routes: `src/app/api/`
- Farm endpoints: `src/app/api/farms/`
- Product endpoints: `src/app/api/products/`
- Order endpoints: `src/app/api/orders/`

**Services (Business Logic):**

- All services: `src/lib/services/`
- Farm service: `src/lib/services/farm.service.ts`
- Product service: `src/lib/services/product.service.ts`

**Tests:**

- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`

---

## 📝 File Naming Conventions

### Source Code

- **Components:** PascalCase (e.g., `FarmCard.tsx`, `ProductList.tsx`)
- **Services:** camelCase with `.service` (e.g., `farm.service.ts`)
- **Utilities:** camelCase (e.g., `formatDate.ts`, `validation.ts`)
- **Types:** camelCase with `.types` (e.g., `farm.types.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `useFarm.ts`)

### Documentation

- **Guides:** UPPERCASE with underscores (e.g., `QUICK_START.md`)
- **References:** UPPERCASE with underscores (e.g., `API_REFERENCE.md`)
- **READMEs:** Always `README.md`

### Scripts

- **Bash scripts:** kebab-case with `.sh` (e.g., `setup-db.sh`)
- **PowerShell:** kebab-case with `.ps1` (e.g., `setup-db.ps1`)
- **Node scripts:** kebab-case with `.js`/`.ts` (e.g., `seed-data.ts`)

### Configuration

- **Config files:** lowercase with dots (e.g., `next.config.mjs`)
- **Ignore files:** lowercase with dot prefix (e.g., `.gitignore`)

---

## 🌟 Key Features Location

### Feature Implementation Map

| Feature             | Components                      | API Routes          | Services                          | Tests                         |
| ------------------- | ------------------------------- | ------------------- | --------------------------------- | ----------------------------- |
| **Farm Management** | `components/features/farm/`     | `app/api/farms/`    | `lib/services/farm.service.ts`    | `tests/integration/farm/`     |
| **Product Catalog** | `components/features/products/` | `app/api/products/` | `lib/services/product.service.ts` | `tests/integration/products/` |
| **Orders**          | `components/features/orders/`   | `app/api/orders/`   | `lib/services/order.service.ts`   | `tests/integration/orders/`   |
| **Authentication**  | `components/auth/`              | `app/api/auth/`     | `lib/auth/`                       | `tests/integration/auth/`     |
| **User Profiles**   | `components/features/profile/`  | `app/api/users/`    | `lib/services/user.service.ts`    | `tests/integration/users/`    |
| **Search**          | `components/features/search/`   | `app/api/search/`   | `lib/services/search.service.ts`  | `tests/integration/search/`   |

---

## 🆘 Need Help?

### Troubleshooting Steps

1. **Check Documentation**
   - Start with [`docs/quick-start/START_HERE.md`](./docs/quick-start/START_HERE.md)
   - Review [`docs/troubleshooting/`](./docs/troubleshooting/)

2. **Check Configuration**
   - Verify `.env.local` exists and is configured
   - Check `DATABASE_URL` is set
   - Verify `NEXTAUTH_SECRET` is set

3. **Clean & Rebuild**

   ```bash
   npm run clean:all
   npm install
   npm run db:setup
   npm run build
   ```

4. **Check Logs**
   - Development server logs in terminal
   - Prisma logs in database operations
   - Test logs in test output

5. **Ask for Help**
   - Open GitHub issue
   - Check existing issues
   - Refer to troubleshooting docs

---

## 📊 Project Metrics

### Codebase Size

- **TypeScript:** ~90% of codebase
- **React Components:** 100+ components
- **API Routes:** 50+ endpoints
- **Database Models:** 20+ Prisma models
- **Test Coverage:** Target 80%+

### Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth v4
- **Styling:** Tailwind CSS
- **Testing:** Jest + Playwright
- **Deployment:** Vercel

---

## 🔄 Maintenance Schedule

### Daily

- Monitor application health
- Check error logs (Sentry)
- Review performance metrics

### Weekly

- Update dependencies (security)
- Review and merge PRs
- Run full test suite

### Monthly

- Dependency updates (all)
- Performance optimization review
- Documentation updates

### Quarterly

- Major version upgrades
- Architecture review
- Security audit

---

## 🎯 Git Workflow

### Branch Strategy

- **main** - Production branch
- **develop** - Development branch
- **feature/** - Feature branches
- **fix/** - Bug fix branches
- **hotfix/** - Production hotfixes

### Commit Convention

```
type(scope): description

[optional body]

[optional footer]
```

**Types:** feat, fix, docs, style, refactor, test, chore

---

**Last Updated:** 2025-01-XX  
**Maintained By:** Development Team  
**Status:** ✅ Active & Maintained

🌾 **"Organized code, organized mind, divine productivity."** ⚡
