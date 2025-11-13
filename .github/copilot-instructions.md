# Copilot working guide for this repo

Purpose: give AI coding agents the minimum, specific context to be productive here. Keep changes aligned with these patterns and file locations.

## Architecture at a glance

- Framework: Next.js (App Router) + TypeScript (strict) + Prisma (PostgreSQL).
- App routes: `src/app/` with route groups `(admin)`, `(customer)`, `(farmer)`, API handlers in `src/app/api/**`.
- Service layer (business logic): `src/lib/services/**` (e.g., `product.service.ts`, `order.service.ts`). Prefer calling services from API routes and server components, not Prisma directly.
- Data layer: Prisma Client singleton via `src/lib/database/index.ts` (alias `database`). Avoid creating new `PrismaClient` instances; do NOT import from `@prisma/client` in feature code.
- Auth/RBAC: NextAuth v5 configured in `src/lib/auth/config.ts` with JWT sessions; admin-only via `src/middleware.ts` and route group `(admin)`. Admin login at `/admin-login`.
- Domain: multi-tenant (farms as tenants), rich enums and relations in `prisma/schema.prisma` (PostgreSQL 15+).
- Integrations: payments (`src/lib/payment/stripe.ts`, `paypal.ts`), caching/logging/monitoring under `src/lib/**`, AI utilities at `src/lib/ai/perplexity.ts`.

## Conventions and imports

- **Path aliases** (tsconfig, next.config): use `@/…`
  - Examples: `@/lib/services/product.service`, `@/lib/database`, `@/components/ui/Button`.
- **Database access**: ALWAYS use `import { database } from "@/lib/database";` (canonical location: `src/lib/database/index.ts`)
  - ✅ Correct: `import { database } from "@/lib/database";`
  - ❌ Wrong: `new PrismaClient()` or importing from `@/lib/prisma`
  - ℹ️ Note: Importing **types** from `@prisma/client` is OK (e.g., `import type { User, Farm } from "@prisma/client";`)
- **Services** return typed data from `src/types/**` and encapsulate validation/slugging (see `ProductService.createProduct()` uses `generateSlug`, validation, and `database`).
- **Testing** relies on Jest mocks in `jest.setup.js` (Next.js APIs and Prisma are mocked). Import `database` to benefit from mocks in tests.
- **Keep Prisma usage server-only**. From UI/components, call API routes or server actions that delegate to services.

## Critical workflows

- Dev server (port 3001): `npm run dev` (or `npm run dev:turbo`).
- Build: `npm run build` (Next.js 15; output: standalone). Analyze: `npm run build:analyze`.
- Tests: `npm test` (Jest; config `jest.config.clean.js`). Watch: `npm run test:watch`. Coverage: `npm run test:coverage`.
- Types/Lint/Format: `npm run type-check`, `npm run lint`, `npm run lint:fix`, `npm run format`.
- Database (Prisma): `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`. Postinstall runs `prisma generate`.
- VS Code tasks exist for one-click runs (see workspace tasks for dev, tests, migrations, Prisma Studio).

## Files to study before changes

- Schema & roles: `prisma/schema.prisma` (UserRole, Farm*, Product*, Order*, Payment* enums and relations).
- Auth & access control: `src/lib/auth/config.ts`, `src/middleware.ts` (ADMIN, SUPER_ADMIN, MODERATOR handling, `/admin` protection).
- Example service patterns: `src/lib/services/product.service.ts` (validation → slugging → derived fields → `database.*`).
- Testing setup: `jest.setup.js` (what’s mocked), `jest.config.clean.js` (roots, moduleNameMapper).
- Next config and aliases: `next.config.mjs`, `tsconfig.json`.

## When adding features

- Place domain logic in a service under `src/lib/services`. Expose small methods (validate → compute → `database` ops). Re-use types in `src/types/**` and helpers in `src/lib/utils/**`.
- Access DB via `import { database } from "@/lib/database";` only. Do not instantiate `new PrismaClient()`.
- For admin-only features, locate pages in `src/app/(admin)/…` and rely on existing middleware checks.
- Add tests under `src/**/__tests__/**` or co-locate `*.test.ts(x)`; use RTL for React, mock external services; avoid real Prisma by importing `database`.

## Environment & integrations

- Required env (local): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Stripe keys if payments, `PERPLEXITY_API_KEY` for `src/lib/ai/perplexity.ts` (optional).
- Images/domains and headers configured in `next.config.mjs`. Port is 3001 by default.

## Examples

**Service layer:**

```typescript
// ✅ Correct pattern
import { ProductService } from "@/lib/services/product.service";
import { database } from "@/lib/database";

export class ProductService {
  static async createProduct(input: CreateProductInput) {
    // Validation → Business logic → Database
    const farm = await database.farm.findUnique({
      where: { id: input.farmId },
    });
    // ...
  }
}
```

**Database imports:**

```typescript
// ✅ Correct - use canonical location
import { database } from "@/lib/database";

// ✅ Also correct - importing types
import type { User, Farm, Product } from "@prisma/client";

// ❌ Wrong - don't create new instances
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(); // DON'T DO THIS
```

**Admin routes:**

- Place pages in `src/app/(admin)/…` - middleware automatically enforces RBAC
- Example: `src/app/(admin)/farms/page.tsx` requires ADMIN/SUPER_ADMIN/MODERATOR role

## References for deeper context

- High-level project README: `README.md` (quick start, structure).
- Divine instruction set and patterns: `.github/instructions/README.md`.
- Copilot daily context and shortcuts: `.copilot/README.md`.

> Keep changes small and typed, favor service-layer additions over ad-hoc DB calls, and align with RBAC + multi-tenant constraints in the Prisma schema.
