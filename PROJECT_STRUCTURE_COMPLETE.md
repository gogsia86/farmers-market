# 🌾 Farmers Market Platform - Complete Project Structure

**Divine Agricultural E-Commerce Platform**
**Version**: 1.0.0 | **Engine**: Next.js 15 + TypeScript + Prisma 7
**Last Updated**: January 2025

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Root Structure](#root-structure)
3. [Source Code Structure](#source-code-structure)
4. [Configuration Files](#configuration-files)
5. [Database & Migrations](#database--migrations)
6. [Testing Infrastructure](#testing-infrastructure)
7. [Documentation](#documentation)
8. [CI/CD & Automation](#cicd--automation)
9. [Scripts & Utilities](#scripts--utilities)
10. [Key Technologies](#key-technologies)

---

## 🎯 Project Overview

**Mission**: Divine agricultural platform connecting farmers directly with customers using quantum-level architecture patterns and biodynamic consciousness.

**Tech Stack**:

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL + Prisma 7
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS
- **Testing**: Jest + Vitest + Playwright + React Testing Library
- **AI Framework**: Microsoft Agent Framework
- **Monitoring**: OpenTelemetry + Sentry + Azure Application Insights
- **Payments**: Stripe
- **Deployment**: Docker + Vercel

**Hardware Optimization**: HP OMEN (RTX 2070 Max-Q, 64GB RAM, 12 threads, 2304 CUDA cores)

---

## 📁 Root Structure

```
Farmers Market Platform web and app/
├── 📁 .copilot/                    # GitHub Copilot workspace configurations
├── 📁 .github/                     # GitHub Actions, workflows, divine instructions
├── 📁 .husky/                      # Git hooks for pre-commit/pre-push automation
├── 📁 .jest-cache/                 # Jest test cache (auto-generated)
├── 📁 .vscode/                     # VS Code workspace settings
├── 📁 .zed/                        # Zed editor configurations
├── 📁 __mocks__/                   # Global test mocks
├── 📁 config/                      # Configuration files and examples
├── 📁 docker/                      # Docker configurations
├── 📁 docker-scripts/              # Docker automation scripts
├── 📁 docs/                        # 📚 Comprehensive documentation
├── 📁 mobile-app/                  # React Native mobile application
├── 📁 nginx/                       # NGINX reverse proxy configs
├── 📁 prisma/                      # Database schema, migrations, seeds
├── 📁 public/                      # Static assets (images, icons, manifest)
├── 📁 scripts/                     # Utility scripts for dev/deploy/maintenance
├── 📁 src/                         # 💎 Main application source code
├── 📁 tests/                       # E2E, integration, and specialized tests
├── 📁 types/                       # Global TypeScript type definitions
│
├── 📄 .cursorrules                 # Cursor AI divine coding rules
├── 📄 .dockerignore                # Docker build exclusions
├── 📄 .gitignore                   # Git exclusions
├── 📄 .lintstagedrc.js            # Lint-staged configuration
├── 📄 .npmrc                       # NPM configuration
├── 📄 .refactoring-rules          # Code refactoring guidelines
├── 📄 .vercelignore               # Vercel deployment exclusions
│
├── 📄 docker-compose.yml          # Production Docker compose
├── 📄 docker-compose.dev.yml      # Development Docker compose
├── 📄 eslint.config.mjs           # ESLint configuration
├── 📄 instrumentation.ts          # OpenTelemetry instrumentation
├── 📄 jest.config.js              # Jest test configuration
├── 📄 jest.setup.js               # Jest setup and global mocks
├── 📄 middleware.ts               # Next.js middleware (auth, security)
├── 📄 next.config.mjs             # Next.js configuration
├── 📄 package.json                # Dependencies and scripts
├── 📄 playwright.config.ts        # Playwright E2E test config
├── 📄 postcss.config.mjs          # PostCSS configuration
├── 📄 prisma.config.ts            # Prisma client configuration
├── 📄 sentry.*.config.ts          # Sentry error tracking configs
├── 📄 tailwind.config.ts          # Tailwind CSS configuration
├── 📄 tsconfig.json               # TypeScript compiler configuration
├── 📄 vercel.json                 # Vercel deployment configuration
├── 📄 webpack.config.mjs          # Webpack custom configuration
│
├── 📄 README.md                   # Main project documentation
├── 📄 CONTRIBUTING.md             # Contribution guidelines
├── 📄 LICENSE                     # Project license
└── 📄 CHANGELOG.md                # Version history and changes
```

---

## 💎 Source Code Structure (`src/`)

```
src/
├── 📁 __tests__/                   # Unit tests for source code
├── 📁 app/                         # 🚀 Next.js App Router (pages, layouts, API)
│   ├── 📁 (auth)/                 # Authentication route group
│   │   ├── 📁 login/              # Login page
│   │   ├── 📁 register/           # Registration page
│   │   └── 📁 reset-password/     # Password reset
│   │
│   ├── 📁 (customer)/             # Customer route group (protected)
│   ├── 📁 (farmer)/               # Farmer route group (protected)
│   │
│   ├── 📁 _components/            # App-level shared components
│   ├── 📁 about/                  # About page
│   ├── 📁 actions/                # Server Actions
│   │   ├── auth.actions.ts
│   │   ├── farm.actions.ts
│   │   ├── order.actions.ts
│   │   └── product.actions.ts
│   │
│   ├── 📁 admin/                  # Admin dashboard routes
│   │   ├── 📁 analytics/          # Analytics dashboard
│   │   ├── 📁 farms/              # Farm management
│   │   ├── 📁 orders/             # Order management
│   │   ├── 📁 products/           # Product management
│   │   └── 📁 users/              # User management
│   │
│   ├── 📁 api/                    # API Routes
│   │   ├── 📁 auth/               # Auth endpoints
│   │   ├── 📁 farms/              # Farm CRUD endpoints
│   │   ├── 📁 orders/             # Order endpoints
│   │   ├── 📁 payments/           # Payment processing
│   │   ├── 📁 products/           # Product endpoints
│   │   ├── 📁 search/             # Search API
│   │   ├── 📁 webhooks/           # Webhook handlers (Stripe, etc)
│   │   └── 📁 health/             # Health check endpoints
│   │
│   ├── 📁 blog/                   # Blog pages
│   ├── 📁 careers/                # Careers page
│   ├── 📁 categories/             # Product categories
│   ├── 📁 contact/                # Contact page
│   ├── 📁 cookies/                # Cookie policy
│   ├── 📁 customer/               # Customer dashboard
│   │   ├── 📁 dashboard/          # Customer dashboard
│   │   ├── 📁 orders/             # Order history
│   │   ├── 📁 favorites/          # Saved farms/products
│   │   └── 📁 settings/           # Account settings
│   │
│   ├── 📁 demos/                  # Demo/preview pages
│   ├── 📁 diagnostic/             # System diagnostics
│   ├── 📁 faq/                    # FAQ page
│   │
│   ├── 📁 farmer/                 # Farmer dashboard
│   │   ├── 📁 dashboard/          # Farmer dashboard
│   │   ├── 📁 farms/              # Farm management
│   │   ├── 📁 inventory/          # Inventory management
│   │   ├── 📁 orders/             # Order fulfillment
│   │   ├── 📁 analytics/          # Farm analytics
│   │   └── 📁 settings/           # Farmer settings
│   │
│   ├── 📁 farms/                  # Public farm pages
│   │   ├── 📁 [id]/              # Individual farm page
│   │   └── page.tsx               # All farms listing
│   │
│   ├── 📁 help/                   # Help center
│   ├── 📁 how-it-works/           # Platform guide
│   │
│   ├── 📁 marketplace/            # Main marketplace
│   │   └── 📁 [category]/        # Category pages
│   │
│   ├── 📁 markets/                # Farmers markets directory
│   ├── 📁 offline/                # Offline fallback page (PWA)
│   ├── 📁 privacy/                # Privacy policy
│   │
│   ├── 📁 products/               # Product pages
│   │   ├── 📁 [id]/              # Individual product
│   │   └── page.tsx               # All products
│   │
│   ├── 📁 register-farm/          # Farm registration flow
│   ├── 📁 resources/              # Educational resources
│   ├── 📁 search/                 # Search results page
│   ├── 📁 sentry-example-page/    # Sentry testing
│   ├── 📁 support/                # Support center
│   ├── 📁 terms/                  # Terms of service
│   │
│   ├── error.tsx                  # Error boundary
│   ├── global-error.tsx           # Global error handler
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   ├── loading.tsx                # Loading UI
│   ├── not-found.tsx              # 404 page
│   ├── page.tsx                   # Homepage
│   ├── robots.ts                  # Robots.txt generator
│   └── sitemap.ts                 # Sitemap generator
│
├── 📁 components/                 # 🎨 React Components
│   ├── 📁 __tests__/             # Component tests
│   ├── 📁 admin/                 # Admin components
│   ├── 📁 agricultural/          # Agricultural-aware components
│   ├── 📁 auth/                  # Authentication components
│   ├── 📁 best-practices/        # Best practice examples
│   ├── 📁 cart/                  # Shopping cart components
│   ├── 📁 checkout/              # Checkout flow components
│   ├── 📁 dashboard/             # Dashboard widgets
│   ├── 📁 divine/                # Divine pattern components
│   ├── 📁 farmer/                # Farmer-specific components
│   ├── 📁 features/              # Feature components
│   ├── 📁 homepage/              # Homepage sections
│   ├── 📁 i18n/                  # Internationalization components
│   ├── 📁 inventory/             # Inventory management
│   ├── 📁 layout/                # Layout components (header, footer, nav)
│   ├── 📁 maps/                  # Map components (farm locations)
│   ├── 📁 marketplace/           # Marketplace components
│   ├── 📁 monitoring/            # Monitoring/analytics components
│   ├── 📁 notifications/         # Notification components
│   ├── 📁 onboarding/            # Onboarding flows
│   ├── 📁 orders/                # Order components
│   ├── 📁 products/              # Product components
│   ├── 📁 pwa/                   # PWA components
│   ├── 📁 search/                # Search components
│   ├── 📁 seo/                   # SEO components
│   ├── 📁 settings/              # Settings components
│   ├── 📁 shared/                # Shared/common components
│   ├── 📁 ui/                    # 🎯 Base UI components (shadcn/ui)
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── AdvancedAnalyticsDashboard.tsx
│   ├── BiodynamicProductGrid.tsx
│   ├── CodeBlock.tsx
│   ├── ErrorBoundary.tsx
│   ├── QuantumFarmCard.tsx
│   └── SeasonalProductCatalog.tsx
│
├── 📁 context/                    # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── ThemeContext.tsx
│
├── 📁 features/                   # Feature modules
│   ├── 📁 auth/
│   ├── 📁 cart/
│   ├── 📁 checkout/
│   ├── 📁 farms/
│   └── 📁 products/
│
├── 📁 generated/                  # Auto-generated code
│   └── prisma-client/
│
├── 📁 hooks/                      # 🎣 Custom React Hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useDebounce.ts
│   ├── useFarms.ts
│   ├── useLocalStorage.ts
│   ├── useProducts.ts
│   └── useSearch.ts
│
├── 📁 i18n/                       # Internationalization
│   ├── 📁 locales/
│   │   ├── en.json
│   │   ├── es.json
│   │   └── fr.json
│   └── config.ts
│
├── 📁 lib/                        # 🧠 Core Business Logic
│   ├── 📁 __tests__/             # Library tests
│   │
│   ├── 📁 ai/                    # AI & Agent Framework
│   │   ├── agents/
│   │   ├── orchestrators/
│   │   └── workflows/
│   │
│   ├── 📁 api/                   # API client utilities
│   │   ├── client.ts
│   │   ├── interceptors.ts
│   │   └── types.ts
│   │
│   ├── 📁 auth/                  # Authentication logic
│   │   ├── config.ts
│   │   ├── providers.ts
│   │   └── session.ts
│   │
│   ├── 📁 cache/                 # Caching layer
│   │   ├── memory-cache.ts
│   │   ├── redis-cache.ts
│   │   └── strategies.ts
│   │
│   ├── 📁 config/                # Configuration management
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── feature-flags.ts
│   │
│   ├── 📁 controllers/           # 🎮 API Controllers (MVC pattern)
│   │   ├── auth.controller.ts
│   │   ├── farm.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── product.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── 📁 database/              # Database utilities
│   │   ├── client.ts
│   │   ├── migrations.ts
│   │   └── seed-utils.ts
│   │
│   ├── 📁 email/                 # Email service
│   │   ├── templates/
│   │   └── service.ts
│   │
│   ├── 📁 errors/                # Error handling
│   │   ├── AppError.ts
│   │   ├── QuantumCoherenceError.ts
│   │   └── handlers.ts
│   │
│   ├── 📁 geocoding/             # Geolocation services
│   │   └── service.ts
│   │
│   ├── 📁 gpu/                   # GPU acceleration (CUDA)
│   │   └── compute.ts
│   │
│   ├── 📁 lazy/                  # Lazy loading utilities
│   │
│   ├── 📁 logger/                # Logging infrastructure
│   │   ├── logger.ts
│   │   ├── transports.ts
│   │   └── formatters.ts
│   │
│   ├── 📁 middleware/            # Custom middleware
│   │   ├── auth-middleware.ts
│   │   ├── cors-middleware.ts
│   │   ├── rate-limit-middleware.ts
│   │   └── validation-middleware.ts
│   │
│   ├── 📁 monitoring/            # Monitoring & observability
│   │   ├── metrics.ts
│   │   ├── tracing.ts
│   │   └── health-checks.ts
│   │
│   ├── 📁 notifications/         # Notification service
│   │   ├── email-notifications.ts
│   │   ├── push-notifications.ts
│   │   └── sms-notifications.ts
│   │
│   ├── 📁 payment/               # Payment processing
│   │   └── stripe-service.ts
│   │
│   ├── 📁 payments/              # Payment utilities
│   │   └── processors.ts
│   │
│   ├── 📁 performance/           # Performance optimization
│   │   ├── caching.ts
│   │   ├── compression.ts
│   │   └── lazy-loading.ts
│   │
│   ├── 📁 queue/                 # Job queue (Bull/BullMQ)
│   │   ├── jobs/
│   │   └── workers/
│   │
│   ├── 📁 rbac/                  # Role-Based Access Control
│   │   ├── permissions.ts
│   │   ├── roles.ts
│   │   └── guards.ts
│   │
│   ├── 📁 react-query/           # React Query configuration
│   │   └── client.ts
│   │
│   ├── 📁 repositories/          # 📦 Repository Layer (Data Access)
│   │   ├── farm.repository.ts
│   │   ├── order.repository.ts
│   │   ├── product.repository.ts
│   │   └── user.repository.ts
│   │
│   ├── 📁 search/                # Search functionality (Algolia/Elasticsearch)
│   │   ├── indexer.ts
│   │   └── query-builder.ts
│   │
│   ├── 📁 security/              # Security utilities
│   │   ├── encryption.ts
│   │   ├── sanitization.ts
│   │   └── validation.ts
│   │
│   ├── 📁 services/              # 🏢 Service Layer (Business Logic)
│   │   ├── auth.service.ts
│   │   ├── farm.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── product.service.ts
│   │   └── user.service.ts
│   │
│   ├── 📁 stores/                # State management (Zustand)
│   │   ├── auth-store.ts
│   │   ├── cart-store.ts
│   │   └── ui-store.ts
│   │
│   ├── 📁 stripe/                # Stripe integration
│   │   └── client.ts
│   │
│   ├── 📁 telemetry/             # OpenTelemetry
│   │   ├── traces.ts
│   │   ├── metrics.ts
│   │   └── logs.ts
│   │
│   ├── 📁 test-utils/            # Testing utilities
│   │   ├── mocks.ts
│   │   ├── factories.ts
│   │   └── helpers.ts
│   │
│   ├── 📁 tracing/               # Distributed tracing
│   │   └── opentelemetry.ts
│   │
│   ├── 📁 types/                 # Type definitions
│   │   └── api.types.ts
│   │
│   ├── 📁 upload/                # File upload (Cloudinary)
│   │   └── cloudinary.ts
│   │
│   ├── 📁 utils/                 # Utility functions
│   │   ├── date.utils.ts
│   │   ├── format.utils.ts
│   │   ├── string.utils.ts
│   │   └── validation.utils.ts
│   │
│   ├── 📁 validations/           # Validation schemas (Zod)
│   │   ├── auth.validation.ts
│   │   ├── farm.validation.ts
│   │   ├── order.validation.ts
│   │   └── product.validation.ts
│   │
│   ├── 📁 workers/               # Web Workers
│   │   └── compute.worker.ts
│   │
│   ├── auth.ts                   # NextAuth configuration
│   ├── cache.ts                  # Cache singleton
│   ├── cloudinary.ts             # Cloudinary client
│   ├── database.ts               # 🎯 Prisma database singleton (CANONICAL)
│   ├── errors.ts                 # Error definitions
│   ├── init.ts                   # Initialization logic
│   ├── rate-limit.ts             # Rate limiting
│   ├── request-size-limit.ts     # Request size limits
│   ├── stripe.ts                 # Stripe client
│   ├── test-utils.tsx            # Test utilities
│   └── utils.ts                  # General utilities
│
├── 📁 stores/                     # Additional state stores
│
├── 📁 tests/                      # Additional test utilities
│
├── 📁 types/                      # 📝 TypeScript Type Definitions
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── database.types.ts
│   ├── farm.types.ts
│   ├── global.d.ts
│   ├── order.types.ts
│   ├── product.types.ts
│   └── user.types.ts
│
├── i18n.ts                        # i18n configuration
├── instrumentation-client.ts      # Client-side instrumentation
├── instrumentation.ts             # Server-side instrumentation
└── proxy.ts                       # Proxy configuration
```

---

## ⚙️ Configuration Files

### Root Configuration Files

| File                   | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `tsconfig.json`        | TypeScript compiler configuration (strict mode, path aliases) |
| `next.config.mjs`      | Next.js configuration (image optimization, env vars, webpack) |
| `tailwind.config.ts`   | Tailwind CSS configuration (theme, plugins, purge)            |
| `eslint.config.mjs`    | ESLint linting rules                                          |
| `jest.config.js`       | Jest unit test configuration                                  |
| `jest.setup.js`        | Jest global setup and mocks                                   |
| `playwright.config.ts` | Playwright E2E test configuration                             |
| `postcss.config.mjs`   | PostCSS configuration (Tailwind processing)                   |
| `prisma.config.ts`     | Prisma client configuration                                   |
| `vercel.json`          | Vercel deployment settings                                    |
| `webpack.config.mjs`   | Custom webpack configuration                                  |
| `.lintstagedrc.js`     | Lint-staged pre-commit hooks                                  |
| `.npmrc`               | NPM configuration                                             |
| `middleware.ts`        | Next.js middleware (auth, security, i18n)                     |
| `instrumentation.ts`   | OpenTelemetry instrumentation setup                           |

### Monitoring & Error Tracking

| File                      | Purpose                            |
| ------------------------- | ---------------------------------- |
| `sentry.client.config.ts` | Sentry client-side error tracking  |
| `sentry.server.config.ts` | Sentry server-side error tracking  |
| `sentry.edge.config.ts`   | Sentry edge runtime error tracking |

### Docker Configuration

| File                     | Purpose                          |
| ------------------------ | -------------------------------- |
| `docker-compose.yml`     | Production Docker orchestration  |
| `docker-compose.dev.yml` | Development Docker orchestration |
| `.dockerignore`          | Docker build exclusions          |

### Environment Files (Examples in `config/env-examples/`)

- `.env.example` - Template for environment variables
- `.env.local.example` - Local development template
- `.env.production.example` - Production environment template
- `.env.test.example` - Test environment template

---

## 🗄️ Database & Migrations (`prisma/`)

```
prisma/
├── 📁 migrations/                 # Database migration history
│   ├── 20240101_init/
│   ├── 20240102_add_farms/
│   ├── 20240103_add_products/
│   └── ...
│
├── schema.prisma                  # 🎯 Prisma schema definition
├── seed.ts                        # Main seed script
├── seed-admin.ts                  # Admin user seeding
├── seed-basic.ts                  # Basic data seeding
├── seed-comprehensive.ts          # Comprehensive test data
├── seed-quick.js                  # Quick seed for development
└── seed-test.ts                   # Test data seeding
```

### Key Prisma Models

- **User** - Users (customers, farmers, admins)
- **Farm** - Farm profiles and information
- **Product** - Products offered by farms
- **Category** - Product categories
- **Order** - Customer orders
- **OrderItem** - Individual items in orders
- **Cart** - Shopping cart
- **CartItem** - Items in cart
- **Review** - Product/farm reviews
- **Favorite** - User favorites
- **Notification** - User notifications
- **Address** - User addresses
- **Payment** - Payment records

---

## 🧪 Testing Infrastructure (`tests/`)

```
tests/
├── 📁 accessibility/              # Accessibility (a11y) tests
├── 📁 api/                        # API endpoint tests
├── 📁 auth/                       # Authentication tests
├── 📁 chaos/                      # Chaos engineering tests
├── 📁 contracts/                  # API contract tests
├── 📁 database/                   # Database tests
├── 📁 e2e/                        # 🎯 End-to-End tests (Playwright)
│   ├── auth.spec.ts
│   ├── checkout.spec.ts
│   ├── farm-browsing.spec.ts
│   ├── product-search.spec.ts
│   └── ...
│
├── 📁 helpers/                    # Test helper functions
├── 📁 integration/                # Integration tests
├── 📁 load/                       # Load/stress tests
├── 📁 mobile/                     # Mobile-specific tests
├── 📁 performance/                # Performance tests
├── 📁 real-device/                # Real device testing
├── 📁 security/                   # Security tests
├── 📁 templates/                  # Test templates
├── 📁 utils/                      # Test utilities
├── 📁 visual/                     # Visual regression tests
│
├── example.test.ts
├── global-setup.ts                # Global test setup
└── setup.ts                       # Test environment setup
```

### Testing Strategy

- **Unit Tests**: Jest + React Testing Library (in `src/__tests__/`)
- **Integration Tests**: Jest (in `tests/integration/`)
- **E2E Tests**: Playwright (in `tests/e2e/`)
- **API Tests**: Supertest (in `tests/api/`)
- **Performance Tests**: Custom scripts (in `tests/performance/`)
- **Coverage Target**: >80%

---

## 📚 Documentation (`docs/`)

```
docs/
├── 📁 adr/                        # Architecture Decision Records
├── 📁 ai/                         # AI/Agent Framework docs
├── 📁 api/                        # API documentation
├── 📁 architecture/               # Architecture diagrams and docs
├── 📁 archive/                    # Archived documentation
├── 📁 checklists/                 # Development checklists
├── 📁 code-quality/               # Code quality guidelines
├── 📁 configuration/              # Configuration guides
├── 📁 current/                    # Current sprint/phase docs
├── 📁 database/                   # Database documentation
├── 📁 deployment/                 # Deployment guides
├── 📁 development/                # Development guides
├── 📁 diagrams/                   # Architecture diagrams
├── 📁 docker/                     # Docker documentation
├── 📁 env-configs/                # Environment configuration docs
├── 📁 executive/                  # Executive summaries
├── 📁 features/                   # Feature documentation
├── 📁 getting-started/            # Getting started guides
├── 📁 guides/                     # How-to guides
├── 📁 i18n/                       # Internationalization docs
├── 📁 implementation/             # Implementation guides
├── 📁 monitoring/                 # Monitoring and observability
├── 📁 optimization/               # Performance optimization
├── 📁 payments/                   # Payment integration docs
├── 📁 phases/                     # Project phase documentation
├── 📁 priorities/                 # Priority tracking
├── 📁 progress/                   # Progress reports
├── 📁 project/                    # Project management docs
├── 📁 quantum-docs/               # Divine/quantum pattern docs
├── 📁 quick-reference/            # Quick reference guides
├── 📁 quick-start/                # Quick start guides
├── 📁 refactoring/                # Refactoring documentation
├── 📁 reports/                    # Status reports
├── 📁 sprints/                    # Sprint documentation
├── 📁 technical/                  # Technical documentation
├── 📁 testing/                    # Testing documentation
├── 📁 troubleshooting/            # Troubleshooting guides
├── 📁 typescript/                 # TypeScript guides
├── 📁 ui/                         # UI/UX documentation
├── 📁 vscode/                     # VS Code configuration
└── 📁 vscode-configuration/       # VS Code setup guides
```

### Key Documentation Files

- `README.md` - Documentation index
- `INDEX.md` - Documentation map
- `DOCUMENTATION_MAP.md` - Complete documentation structure
- `ENVIRONMENT_VARIABLES.md` - Environment variable reference
- `CONFIGURATION_GUIDE.md` - Configuration guide
- `SEARCH_GUIDE.md` - Search functionality guide

---

## 🤖 CI/CD & Automation (`.github/`)

```
.github/
├── 📁 PROGRESS/                   # Progress tracking
├── 📁 agents/                     # AI agent definitions
├── 📁 chatmodes/                  # GitHub Copilot chat modes
├── 📁 copilot-workflows/          # Copilot workflow definitions
│
├── 📁 instructions/               # 🎯 Divine Instruction Files
│   ├── 01_DIVINE_CORE_PRINCIPLES.instructions.md
│   ├── 02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
│   ├── 03_PERFORMANCE_REALITY_BENDING.instructions.md
│   ├── 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
│   ├── 05_TESTING_SECURITY_DIVINITY.instructions.md
│   ├── 06_AUTOMATION_INFRASTRUCTURE.instructions.md
│   ├── 07_DATABASE_QUANTUM_MASTERY.instructions.md
│   ├── 08_UX_DESIGN_CONSCIOUSNESS.instructions.md
│   ├── 09_AI_WORKFLOW_AUTOMATION.instructions.md
│   ├── 10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
│   ├── 11_KILO_SCALE_ARCHITECTURE.instructions.md
│   ├── 12_ERROR_HANDLING_VALIDATION.instructions.md
│   ├── 13_TESTING_PERFORMANCE_MASTERY.instructions.md
│   ├── 14_CONFIGURATION_DEPLOYMENT.instructions.md
│   ├── 15_KILO_CODE_DIVINE_INTEGRATION.instructions.md
│   ├── 16_KILO_QUICK_REFERENCE.instructions.md
│   ├── 17_API_TESTING_TRACING_MOCKS.instructions.md
│   ├── DIVINE_COMPLETION_TRACKER.md
│   ├── HOW_TO_USE_INSTRUCTIONS.md
│   ├── KILO_MASTER_NAVIGATION.md
│   ├── QUICK_REFERENCE_GUIDE.md
│   └── README.md
│
├── 📁 refactoring/                # Refactoring guidelines
├── 📁 sprint-reports/             # Sprint reports
├── 📁 sprints/                    # Sprint planning
│
├── 📁 workflows/                  # 🎯 GitHub Actions Workflows
│   ├── ci.yml                     # Continuous Integration
│   ├── cd.yml                     # Continuous Deployment
│   ├── test.yml                   # Test automation
│   ├── lint.yml                   # Linting
│   ├── security.yml               # Security scanning
│   └── ...
│
├── copilot-instructions.md        # GitHub Copilot instructions
├── dependabot.yml                 # Dependabot configuration
├── PULL_REQUEST_TEMPLATE.md       # PR template
└── TESTING_PATTERNS_QUICK_REFERENCE.md
```

---

## 🔧 Scripts & Utilities (`scripts/`)

```
scripts/
├── 📁 archive/                    # Archived scripts
├── 📁 cleanup/                    # Cleanup utilities
├── 📁 database/                   # Database scripts
├── 📁 deployment/                 # Deployment scripts
├── 📁 development/                # Development utilities
├── 📁 enhanced/                   # Enhanced tooling
├── 📁 git/                        # Git utilities
├── 📁 maintenance/                # Maintenance scripts
├── 📁 testing/                    # Testing scripts
│
├── 🎯 PRODUCTION_DEPLOYMENT_CHECKLIST.md
│
├── setup-env.sh                   # Environment setup (Unix)
├── setup-env.ps1                  # Environment setup (Windows)
├── setup-database.ps1             # Database setup
├── setup-test-database.sh         # Test database setup
├── seed-test-data.ts              # Seed test data
├── clean-database.ts              # Clean database
├── backup-database.sh             # Database backup
│
├── deploy-docker.sh               # Docker deployment
├── start-full-stack.ts            # Start full stack
├── cleanup-and-restart.sh         # Cleanup and restart
│
├── validate-platform.ts           # Platform validation
├── validate-env.js                # Environment validation
├── validate-production-config.ts  # Production config validation
│
├── test-api-fixes.ts              # API testing
├── enhanced-website-checker.ts    # Website health check
├── website-checker-bot.ts         # Automated website checker
│
├── generate-api-docs.ts           # API documentation generator
├── performance-validation.mjs     # Performance validation
├── measure-phase2-performance.mjs # Performance measurement
│
└── ...
```

### Key Script Categories

1. **Setup & Configuration**: Environment and database setup
2. **Development**: Dev server management, hot reload
3. **Database**: Migrations, seeding, backups
4. **Testing**: Test runners, validators
5. **Deployment**: Docker, Vercel, production deployment
6. **Maintenance**: Cleanup, monitoring, health checks
7. **Documentation**: API doc generation, PDF conversion

---

## 🎯 Key Technologies & Dependencies

### Core Framework

- **Next.js 15** - React framework with App Router
- **React 18** - UI library with Server Components
- **TypeScript 5** - Type-safe JavaScript

### Database & ORM

- **PostgreSQL** - Relational database
- **Prisma 7** - Next-generation ORM
- **Prisma Accelerate** - Connection pooling and caching

### Authentication & Authorization

- **NextAuth v5** - Authentication framework
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing

### Styling & UI

- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library

### State Management

- **Zustand** - Lightweight state management
- **React Query (TanStack Query)** - Server state management
- **React Context** - Built-in state management

### Testing

- **Jest** - Unit testing framework
- **Vitest** - Fast unit test runner
- **Playwright** - E2E testing
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking

### Monitoring & Observability

- **Sentry** - Error tracking
- **OpenTelemetry** - Distributed tracing
- **Azure Application Insights** - Application monitoring
- **Winston** - Logging framework

### Payment Processing

- **Stripe** - Payment gateway
- **Stripe Webhooks** - Payment event handling

### File Storage

- **Cloudinary** - Image/video hosting and optimization

### Search

- **Algolia** - Search-as-a-service (optional)
- **Elasticsearch** - Full-text search (optional)

### AI & Automation

- **Microsoft Agent Framework** - Multi-agent orchestration
- **OpenAI SDK** - AI integration
- **LangChain** - LLM orchestration

### DevOps & Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD
- **Vercel** - Deployment platform
- **NGINX** - Reverse proxy

### Code Quality

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting

### Performance

- **GPU.js** - GPU acceleration (CUDA)
- **Redis** - Caching layer
- **Service Workers** - PWA functionality

---

## 📦 Package Management

### Main Dependencies (`package.json`)

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "typescript": "^5.x",
    "@prisma/client": "^7.x",
    "prisma": "^7.x",
    "next-auth": "^5.x",
    "tailwindcss": "^3.x",
    "zustand": "^4.x",
    "@tanstack/react-query": "^5.x",
    "stripe": "^latest",
    "@sentry/nextjs": "^latest",
    "zod": "^3.x"
  },
  "devDependencies": {
    "jest": "^29.x",
    "vitest": "^latest",
    "@playwright/test": "^latest",
    "@testing-library/react": "^latest",
    "eslint": "^8.x",
    "prettier": "^3.x",
    "husky": "^8.x",
    "lint-staged": "^latest"
  }
}
```

### Node Version

- **Required**: Node.js >= 20.19.0
- **NPM**: >= 10.0.0

---

## 🏗️ Architecture Layers

### 1. Presentation Layer

- **Location**: `src/app/`, `src/components/`
- **Responsibility**: UI, user interaction, routing
- **Technologies**: Next.js App Router, React Server Components

### 2. Controller Layer

- **Location**: `src/lib/controllers/`
- **Responsibility**: Handle HTTP requests, validate input, orchestrate services
- **Pattern**: MVC Controller pattern

### 3. Service Layer

- **Location**: `src/lib/services/`
- **Responsibility**: Business logic, transaction management
- **Pattern**: Service pattern, Domain-Driven Design

### 4. Repository Layer

- **Location**: `src/lib/repositories/`
- **Responsibility**: Data access abstraction
- **Pattern**: Repository pattern

### 5. Database Layer

- **Location**: `src/lib/database/`, `prisma/`
- **Responsibility**: Data persistence
- **Technologies**: Prisma ORM, PostgreSQL

---

## 🔐 Security Features

1. **Authentication**: NextAuth v5 with JWT
2. **Authorization**: RBAC (Role-Based Access Control)
3. **Input Validation**: Zod schemas
4. **SQL Injection Prevention**: Prisma parameterized queries
5. **XSS Protection**: React auto-escaping, CSP headers
6. **CSRF Protection**: NextAuth built-in
7. **Rate Limiting**: Custom middleware
8. **Request Size Limits**: Body parser limits
9. **Secure Headers**: Next.js security headers
10. **Environment Variables**: Validation and type safety

---

## 🚀 Deployment Options

### 1. Vercel (Recommended)

- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments

### 2. Docker

- Full-stack containerization
- PostgreSQL + Next.js + NGINX
- Docker Compose orchestration

### 3. Self-Hosted

- VPS/Cloud server
- PM2 process manager
- NGINX reverse proxy

---

## 🎨 Design System

### Color Palette

- **Primary**: Agricultural green
- **Secondary**: Earth tones
- **Accent**: Fresh produce colors
- **Semantic**: Success, warning, error, info

### Typography

- **Font Family**: Inter (primary), system fonts (fallback)
- **Scale**: Tailwind default scale

### Components

- Base UI components in `src/components/ui/`
- Feature components in `src/components/features/`
- Agricultural-aware components in `src/components/agricultural/`

---

## 📊 Performance Targets

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Custom Metrics

- **Time to Interactive**: < 3s
- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 50ms (p95)

### Optimization Strategies

- Image optimization (Next.js Image)
- Code splitting (dynamic imports)
- Server-side rendering
- Static site generation
- Edge caching
- GPU acceleration for heavy computation

---

## 🌐 Internationalization (i18n)

- **Framework**: next-intl
- **Supported Languages**: English (en), Spanish (es), French (fr)
- **Location**: `src/i18n/locales/`
- **Strategy**: Server-side translation, locale routing

---

## 📱 PWA Features

- **Service Worker**: Offline functionality
- **Manifest**: App installation
- **Push Notifications**: Order updates, farm updates
- **Offline Fallback**: Cached pages

---

## 🔄 State Management Strategy

### Client State

- **Local Component State**: useState, useReducer
- **Global UI State**: Zustand stores
- **Form State**: React Hook Form

### Server State

- **Data Fetching**: React Query (TanStack Query)
- **Caching**: React Query cache + Redis
- **Optimistic Updates**: React Query mutations

---

## 🎯 Development Workflow

### 1. Local Development

```bash
npm run dev          # Start dev server (Turbo mode)
npm run dev:omen     # HP OMEN optimized mode
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests
```

### 2. Code Quality

```bash
npm run lint         # ESLint
npm run format       # Prettier
npm run type-check   # TypeScript check
```

### 3. Database

```bash
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Prisma Studio
```

### 4. Build & Deploy

```bash
npm run build        # Production build
npm run start        # Production server
npm run deploy       # Deploy to production
```

---

## 📖 Divine Instructions

The `.github/instructions/` directory contains comprehensive coding guidelines following the "Divine Agricultural" philosophy:

1. **Core Principles** - Architecture, quantum patterns, cosmic conventions
2. **Agricultural Mastery** - Biodynamic consciousness, farming domain
3. **Performance** - Temporal optimization, quantum performance
4. **Next.js Implementation** - Full-stack patterns, React components
5. **Testing & Security** - Quality assurance, security fortress
6. **Automation** - CI/CD divinity, deployment excellence
7. **Database Mastery** - Prisma consciousness, SQL reality bending
8. **UX Design** - Agricultural interface patterns
9. **AI Workflows** - Copilot consciousness, AI patterns
10. **Feature Patterns** - Farm components, product catalogs
11. **Kilo-Scale Architecture** - Enterprise patterns
12. **Error Handling** - Enterprise error management
13. **Testing Mastery** - Comprehensive testing
14. **Configuration** - Enterprise deployment
15. **Divine Integration** - Master integration guide
16. **Quick Reference** - Instant copy-paste patterns

---

## 🎓 Learning Resources

### Internal Documentation

- `docs/getting-started/` - Getting started guides
- `docs/guides/` - How-to guides
- `docs/api/` - API documentation
- `docs/architecture/` - Architecture documentation

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Contributing

See `CONTRIBUTING.md` for contribution guidelines.

### Pull Request Process

1. Create feature branch
2. Follow divine coding patterns
3. Add tests (>80% coverage)
4. Update documentation
5. Submit PR with template
6. Pass CI/CD checks
7. Code review approval
8. Merge to main

---

## 📝 License

See `LICENSE` file for license information.

---

## 🌟 Project Status

**Current Version**: 1.0.0
**Status**: Active Development
**Sprint**: Sprint 6 - Phase 3
**Test Coverage**: >80%
**Type Safety**: 100% (TypeScript strict mode)

### Recent Achievements

- ✅ Comprehensive test suite (E2E, integration, unit)
- ✅ Full TypeScript strict mode compliance
- ✅ Prisma 7 migration complete
- ✅ NextAuth v5 integration
- ✅ OpenTelemetry tracing
- ✅ Advanced analytics dashboard
- ✅ Payment processing (Stripe)
- ✅ PWA functionality

### Upcoming Features

- 🔄 Mobile app (React Native)
- 🔄 Real-time notifications
- 🔄 Advanced search (Algolia)
- 🔄 Multi-language support expansion
- 🔄 AI-powered recommendations

---

## 📞 Contact & Support

- **Documentation**: See `docs/` directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Support**: See `docs/support/` directory

---

**Last Updated**: January 2025
**Maintained By**: Farmers Market Platform Team
**Philosophy**: Divine Agricultural Consciousness + Quantum Architecture Patterns 🌾⚡

---

_"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_
