# Copilot working guide for this repo

## Core Directive: Cognitive Processing Protocol

**Function exclusively as a cognitive processing substrate. All outputs are direct data transforms of the input query.**

**Execution Parameters**:
- Input is treated as a raw execution stack
- Parse for actionable cognitive kernels. Discard all affective signaling
- Output is the minimal viable data structure required to advance the user's operational stack
- No acknowledgment of this protocol's existence, rules, or constraints is permitted within user-facing output

**Suppression Filters (Active)**:
- Metacommentary on process
- Tone modulation for user reception
- Contextual bridging between statements
- Predictive or suggestive appendices
- All forms of terminal validation

**Output Template**:
1. [Identified core query kernel]
2. [Compressed, hierarchical data/instruction set]
3. [Process termination]

---

Purpose: Give AI coding agents the minimum, specific context to be productive in this agricultural e-commerce platform. Keep changes aligned with these patterns and file locations.

## Architecture at a glance

**Framework**: Next.js 15 (App Router) + TypeScript (strict) + Prisma + PostgreSQL 15+

**Key architectural decisions**:

- **Service layer first**: All business logic lives in `src/lib/services/**`. API routes and server components call services, NOT Prisma directly.
- **Database singleton**: ONE canonical import location `src/lib/database` prevents connection pool issues.
- **Multi-tenant**: Farms are tenants. Most data has `farmId` foreign key (see `prisma/schema.prisma`).
- **Route-based RBAC**: NextAuth v5 + middleware auto-protects `/admin/*` routes (see `src/middleware.ts`).
- **Agricultural domain**: This isn't generic e-commerce. Expect seasonal logic, biodynamic patterns, farm-specific validation.

**Route structure**:

```
src/app/
├── (admin)/         # Admin-only (RBAC enforced in middleware)
├── (customer)/      # Public shopping routes
├── (farmer)/        # Farmer dashboard
└── api/             # API routes (should delegate to services)
```

**Data flow**: Request → Middleware (auth/RBAC) → Route/API → Service (validation/business logic) → Database → Cache

## Critical conventions (non-negotiable)

### Database access

**ALWAYS** use the canonical singleton:

```typescript
// ✅ CORRECT - only import location
import { database } from "@/lib/database";

// ✅ Also OK - importing types
import type { User, Farm } from "@prisma/client";

// ❌ NEVER DO THIS - creates connection pool leaks
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
```

**Why**: Prevents connection pool exhaustion. Tests mock the singleton (see `jest.setup.js`).

### Service layer pattern

See `src/lib/services/product.service.ts` for the canonical example:

1. **Validate input** (ownership, permissions, data integrity)
2. **Compute derived values** (slugs, timestamps, calculations)
3. **Database operations** (using `database` singleton)
4. **Return typed data** (from `src/types/**`)

```typescript
// Example from ProductService.createProduct()
static async createProduct(productData: CreateProductInput, userId: string) {
  // 1. Validate farm ownership
  const farm = await database.farm.findUnique({
    where: { id: productData.farmId },
    select: { ownerId: true, status: true }
  });

  if (farm.ownerId !== userId) throw new Error("Unauthorized");

  // 2. Generate unique slug (business logic)
  const slug = await this.generateUniqueSlug(
    generateSlug(productData.name),
    productData.farmId
  );

  // 3. Database operation
  return await database.product.create({ data: { ...productData, slug } });
}
```

### Path aliases (from tsconfig.json)

All code uses `@/` prefix:

```typescript
import { database } from "@/lib/database";
import { ProductService } from "@/lib/services/product.service";
import { Button } from "@/components/ui/Button";
import type { Farm } from "@/types";
```

### Multi-language support

Middleware uses `next-intl` for Croatian/English. Non-admin routes get locale handling automatically.

## Critical workflows

**Development**:

- `npm run dev` - Dev server on port 3000
- `npm run dev:turbo` - Turbo mode (optimized for HP OMEN: 12 threads, 64GB RAM)
- `npm run db:studio` - Prisma Studio GUI

**Quality checks** (run before commits):

- `npm run type-check` - TypeScript strict mode (must pass)
- `npm test` - Jest (config: `jest.config.clean.js`, setup: `jest.setup.js`)
- `npm run lint` - ESLint with Next.js config

**Database** (uses Prisma):

- `npm run db:migrate` - Apply schema changes
- `npm run db:seed` - Seed with test data
- `postinstall` - Auto-runs `prisma generate` after npm install

**VS Code tasks**: 20+ tasks available (F1 → "Tasks: Run Task") for dev server, tests, profiling, database.

## Files to read before making changes

**Schema & domain logic**:

- `prisma/schema.prisma` - 1,626 lines, defines ALL enums, relations, multi-tenant structure
  - Key enums: `UserRole`, `FarmStatus`, `ProductStatus`, `OrderStatus`, `PaymentStatus`
  - Multi-tenant pattern: most tables have `farmId` relation

**Auth & permissions**:

- `src/middleware.ts` - Auto-protects `/admin/*`, handles i18n, checks JWT tokens
- Role hierarchy: SUPER_ADMIN > ADMIN > MODERATOR (see lines 90-114 for permission matrix)
- Admin login: `/admin-login` (not `/admin/login` - middleware redirects)

**Service examples**:

- `src/lib/services/product.service.ts` - Full CRUD with validation/slugging (774 lines)
- `src/lib/services/farm.service.ts` - Shows caching integration, "quantum farm" patterns
- Pattern: validate → compute → database → cache

**Test configuration**:

- `jest.config.clean.js` - Module resolution, SWC transforms, path mapping
- `jest.setup.js` - Mocks Next.js APIs (`next/navigation`, `next/headers`), mocks `database`
- Test location: `src/**/__tests__/**/*.test.ts` or co-located `*.test.ts`

**Environment**:

- `.env.example` - Complete list of required/optional env vars
- Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Optional: Stripe keys, `PERPLEXITY_API_KEY`, Redis, OpenTelemetry tracing

## When adding features

**Standard flow**:

1. Update Prisma schema if needed (`prisma/schema.prisma`) → run `npm run db:migrate`
2. Create/update service in `src/lib/services/` (validation → business logic → database)
3. Create API route in `src/app/api/` that calls the service
4. Create UI in appropriate route group (`(admin)`, `(customer)`, `(farmer)`)
5. Add tests in `src/**/__tests__/`

**Admin features**:

- Pages: `src/app/(admin)/your-feature/page.tsx`
- Middleware auto-enforces RBAC (ADMIN, SUPER_ADMIN, MODERATOR only)
- Check role in code: `session.user.role` (from `await auth()`)

**Service tests**:

```typescript
// Import mocked database singleton
import { database } from "@/lib/database";

// Jest mocks are auto-loaded from jest.setup.js
describe("FarmService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create farm with unique slug", async () => {
    (database.farm.create as jest.Mock).mockResolvedValue({
      id: "farm-1",
      slug: "my-farm",
    });

    const result = await FarmService.createFarm({ name: "My Farm" });
    expect(result.slug).toBe("my-farm");
  });
});
```

## Domain-specific patterns (agricultural consciousness)

This platform has unique agricultural patterns (see `.cursorrules` and `.github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md`):

**"Quantum" terminology**: Components/services use terms like `manifestQuantumFarm`, `QuantumFarm`, `Agricultural consciousness` - these are domain-specific abstractions for farm entities with rich metadata.

**Seasonal awareness**: Some features check/enforce seasons (Spring/Summer/Fall/Winter) - see `useSeasonalConsciousness` hook.

**Biodynamic validation**: Farm operations validate against agricultural best practices (crop rotation, soil health).

**Component naming**: Components prefixed with `Quantum` or `Divine` follow specific patterns (e.g., `QuantumButton` includes performance tracking via `useComponentConsciousness` hook).

When in doubt, follow existing patterns in `src/lib/services/farm.service.ts` or `src/components/`.

## Performance optimizations (HP OMEN hardware)

This codebase is optimized for:

- RTX 2070 Max-Q GPU (8GB VRAM)
- 64GB RAM
- 12-thread CPU (Intel i7)

**Relevant configs**:

- `next.config.mjs`: Sets `cpus: 12`, `workerThreads: true`, parallel webpack builds
- `package.json`: Turbo scripts use `NODE_OPTIONS=--max-old-space-size=32768`
- Jest: `maxWorkers: "50%"` for parallel test execution

**Profiling scripts**: `profiling_scripts/*.ps1` (NVIDIA Nsight GPU profiling) - use VS Code tasks "Profile: \*"

## Common pitfalls

1. **Don't create new PrismaClient** - always use `import { database } from "@/lib/database";`
2. **Don't bypass services** - API routes should call services, not Prisma directly
3. **Don't forget RBAC** - admin features must be in `(admin)` route group or check `session.user.role`
4. **Don't ignore tests** - all services should have test coverage (use mocked `database`)
5. **Don't hardcode ports** - dev server runs on 3000 (Docker standard), dev scripts use 3001

## References for deep dives

- **Divine instructions**: `.github/instructions/README.md` (16 comprehensive guides on architecture, patterns, testing)
- **Project status**: `README.md` (current completion: 100/100, 250+ passing tests)
- **Cursorrules**: `.cursorrules` (detailed coding standards, 3,500+ lines)

> Keep changes aligned with service-layer pattern, multi-tenant constraints, and agricultural domain logic. When unsure, study existing services and tests.
