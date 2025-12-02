# ⚡ IMMEDIATE ACTIONS - Start Here Now!

**Priority**: 🔴 CRITICAL  
**Timeline**: Today - This Week  
**Goal**: Fix blocking issues and set foundation for 100% completion

---

## 🎯 TODAY'S TASKS (1-2 Hours)

### ⚡ Action 1: Fix Type Safety Violation (15 minutes)

**File**: `src/lib/services/farm.service.ts`  
**Line**: 507  
**Issue**: `any` type usage (violates strict type safety)

#### Current Code (Line ~507):
```typescript
protected getDefaultInclude(): any {
  return {
    include: {
      owner: true,
      products: true
    }
  };
}
```

#### Divine Fix:
```typescript
protected getDefaultInclude(): Prisma.FarmInclude {
  return {
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      products: {
        where: { isActive: true },
        take: 10,
        select: {
          id: true,
          name: true,
          price: true,
          images: true
        }
      },
      _count: {
        select: {
          products: true,
          orders: true
        }
      }
    }
  };
}
```

#### Steps:
1. Open `src/lib/services/farm.service.ts`
2. Find line 507 (search for `getDefaultInclude`)
3. Change return type from `any` to `Prisma.FarmInclude`
4. Add proper typing to include object
5. Run `npm run type-check` to verify
6. Commit: `fix: remove any type usage in farm service for strict type safety`

**Verification**:
```bash
npm run type-check  # Should show 0 errors
npm run lint        # Should show 0 warnings in farm.service.ts
```

---

### 📋 Action 2: Run Full Diagnostics (5 minutes)

Check current project health:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test

# Check for any types
grep -r ":\s*any" src/ --include="*.ts" --include="*.tsx"
```

**Document findings** in a file called `DIAGNOSTICS_REPORT.md`:

```markdown
# Project Diagnostics - [DATE]

## Type Safety
- [ ] Zero TypeScript errors
- [ ] Zero `any` types found
- [ ] All imports use proper types

## Code Quality
- [ ] Zero ESLint errors
- [ ] Zero ESLint warnings (or document acceptable ones)

## Tests
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Coverage >= 80%

## Issues Found
[List any issues here]

## Action Items
[List what needs fixing]
```

---

### 🏗️ Action 3: Create Base Repository (2-3 hours)

**Priority**: Foundation for kilo-scale architecture

#### Step 1: Create Directory
```bash
mkdir -p "src/lib/repositories"
```

#### Step 2: Create Base Repository File

**File**: `src/lib/repositories/base.repository.ts`

```typescript
/**
 * 🏗️ BASE REPOSITORY - DIVINE KILO-SCALE PATTERN
 * 
 * Foundation for all entity repositories following divine architecture.
 * Separates database concerns from business logic.
 * 
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

import { PrismaClient } from "@prisma/client";
import { database } from "@/lib/database";

export interface RepositoryOptions {
  tx?: PrismaClient | any;
  include?: any;
}

/**
 * Base Repository implementing CRUD operations with quantum consciousness
 * 
 * @template TEntity - The entity type (e.g., Farm, Product)
 * @template TCreateData - Data required to create entity
 * @template TUpdateData - Data allowed for updates
 */
export abstract class BaseRepository<
  TEntity,
  TCreateData = any,
  TUpdateData = any
> {
  constructor(
    protected readonly model: { name: string },
    protected readonly repositoryName: string
  ) {}

  /**
   * Get database instance (allows dependency injection)
   */
  protected get db(): PrismaClient {
    return database;
  }

  /**
   * Create a new entity
   */
  async create(
    data: TCreateData,
    options: RepositoryOptions = {}
  ): Promise<TEntity> {
    try {
      const db = options.tx || this.db;
      const entity = await (db as any)[this.model.name].create({
        data,
        ...this.getDefaultInclude(),
        ...options
      });

      this.logOperation('create', { entityId: (entity as any).id });
      return entity;
    } catch (error) {
      throw this.handleDatabaseError('create', error);
    }
  }

  /**
   * Find entity by ID
   */
  async findById(
    id: string,
    options: RepositoryOptions = {}
  ): Promise<TEntity | null> {
    try {
      const db = options.tx || this.db;
      return await (db as any)[this.model.name].findUnique({
        where: { id },
        ...this.getDefaultInclude(),
        ...options
      });
    } catch (error) {
      throw this.handleDatabaseError('findById', error);
    }
  }

  /**
   * Find many entities by criteria
   */
  async findMany(
    where: any = {},
    options: RepositoryOptions = {}
  ): Promise<TEntity[]> {
    try {
      const db = options.tx || this.db;
      return await (db as any)[this.model.name].findMany({
        where,
        ...this.getDefaultInclude(),
        ...options
      });
    } catch (error) {
      throw this.handleDatabaseError('findMany', error);
    }
  }

  /**
   * Update entity by ID
   */
  async update(
    id: string,
    data: TUpdateData,
    options: RepositoryOptions = {}
  ): Promise<TEntity> {
    try {
      const db = options.tx || this.db;
      const entity = await (db as any)[this.model.name].update({
        where: { id },
        data,
        ...this.getDefaultInclude(),
        ...options
      });

      this.logOperation('update', { entityId: id });
      return entity;
    } catch (error) {
      throw this.handleDatabaseError('update', error);
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(
    id: string,
    options: RepositoryOptions = {}
  ): Promise<void> {
    try {
      const db = options.tx || this.db;
      await (db as any)[this.model.name].delete({
        where: { id }
      });

      this.logOperation('delete', { entityId: id });
    } catch (error) {
      throw this.handleDatabaseError('delete', error);
    }
  }

  /**
   * Count entities by criteria
   */
  async count(
    where: any = {},
    options: RepositoryOptions = {}
  ): Promise<number> {
    try {
      const db = options.tx || this.db;
      return await (db as any)[this.model.name].count({
        where
      });
    } catch (error) {
      throw this.handleDatabaseError('count', error);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string, options: RepositoryOptions = {}): Promise<boolean> {
    const entity = await this.findById(id, options);
    return entity !== null;
  }

  /**
   * Abstract method for default include relations
   * Each repository must define its own
   */
  protected abstract getDefaultInclude(): any;

  /**
   * Handle database errors with enlightening messages
   */
  protected handleDatabaseError(operation: string, error: unknown): Error {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const errorMessage = `${this.repositoryName}.${operation} failed: ${message}`;
    
    // Log for debugging
    console.error(`🚨 [${this.repositoryName}] ${operation} error:`, error);
    
    return new Error(errorMessage);
  }

  /**
   * Log successful operations (for debugging/monitoring)
   */
  protected logOperation(operation: string, meta: any = {}): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [${this.repositoryName}] ${operation}`, meta);
    }
  }

  /**
   * Execute operations within a transaction
   */
  async withTransaction<T>(
    callback: (tx: any) => Promise<T>
  ): Promise<T> {
    return await this.db.$transaction(async (tx) => {
      return await callback(tx);
    });
  }
}
```

#### Step 3: Create Farm Repository

**File**: `src/lib/repositories/farm.repository.ts`

```typescript
/**
 * 🚜 FARM REPOSITORY - QUANTUM DATABASE OPERATIONS
 * 
 * Handles all farm entity database operations with agricultural consciousness.
 * 
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { BaseRepository, type RepositoryOptions } from "./base.repository";
import type { Farm, Prisma } from "@prisma/client";

/**
 * Quantum Farm with all relations loaded
 */
export type QuantumFarm = Farm & {
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    images: string[];
    isActive: boolean;
  }>;
  _count: {
    products: number;
    orders: number;
  };
};

/**
 * Farm Repository with quantum consciousness
 */
export class QuantumFarmRepository extends BaseRepository<
  QuantumFarm,
  Prisma.FarmCreateInput,
  Prisma.FarmUpdateInput
> {
  constructor() {
    super({ name: "farm" }, "QuantumFarmRepository");
  }

  /**
   * Manifest a new farm into reality
   * (Divine naming for farm creation)
   */
  async manifestFarm(
    data: Prisma.FarmCreateInput,
    options: RepositoryOptions = {}
  ): Promise<QuantumFarm> {
    return await this.create(data, options);
  }

  /**
   * Find farm by unique slug
   */
  async findBySlug(
    slug: string,
    options: RepositoryOptions = {}
  ): Promise<QuantumFarm | null> {
    try {
      const db = options.tx || this.db;
      return await db.farm.findUnique({
        where: { slug },
        ...this.getDefaultInclude()
      }) as QuantumFarm | null;
    } catch (error) {
      throw this.handleDatabaseError('findBySlug', error);
    }
  }

  /**
   * Find all farms owned by a user
   */
  async findByOwnerId(
    ownerId: string,
    options: RepositoryOptions = {}
  ): Promise<QuantumFarm[]> {
    return await this.findMany({ ownerId }, options);
  }

  /**
   * Find active farms with products
   */
  async findActiveWithProducts(
    options: RepositoryOptions = {}
  ): Promise<QuantumFarm[]> {
    return await this.findMany(
      {
        isActive: true,
        products: {
          some: { isActive: true }
        }
      },
      options
    );
  }

  /**
   * Find farms near coordinates (for location-based search)
   */
  async findNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    options: RepositoryOptions = {}
  ): Promise<QuantumFarm[]> {
    // Simplified distance calculation
    // In production, use PostGIS or similar
    try {
      const db = options.tx || this.db;
      const farms = await db.farm.findMany({
        where: {
          isActive: true,
          latitude: { not: null },
          longitude: { not: null }
        },
        ...this.getDefaultInclude()
      }) as QuantumFarm[];

      // Filter by distance (basic implementation)
      return farms.filter(farm => {
        if (!farm.latitude || !farm.longitude) return false;
        const distance = this.calculateDistance(
          latitude,
          longitude,
          farm.latitude,
          farm.longitude
        );
        return distance <= radiusKm;
      });
    } catch (error) {
      throw this.handleDatabaseError('findNearLocation', error);
    }
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.findBySlug(slug);
    return existing === null;
  }

  /**
   * Default relations to include with farm queries
   */
  protected getDefaultInclude(): Prisma.FarmInclude {
    return {
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      products: {
        where: { isActive: true },
        take: 10,
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          isActive: true
        }
      },
      _count: {
        select: {
          products: true,
          orders: true
        }
      }
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const farmRepository = new QuantumFarmRepository();
```

#### Step 4: Create Repository Index

**File**: `src/lib/repositories/index.ts`

```typescript
/**
 * 🏗️ REPOSITORY LAYER - DIVINE EXPORTS
 * 
 * Central export point for all repositories following kilo-scale architecture.
 */

export { BaseRepository, type RepositoryOptions } from "./base.repository";
export {
  QuantumFarmRepository,
  farmRepository,
  type QuantumFarm
} from "./farm.repository";

// Add more repositories as they are created:
// export { ProductRepository, productRepository } from "./product.repository";
// export { OrderRepository, orderRepository } from "./order.repository";
```

#### Step 5: Write Tests

**File**: `src/lib/repositories/__tests__/farm.repository.test.ts`

```typescript
/**
 * 🧪 FARM REPOSITORY TESTS
 */

import { QuantumFarmRepository } from "../farm.repository";
import { database } from "@/lib/database";

describe("QuantumFarmRepository", () => {
  let repository: QuantumFarmRepository;

  beforeEach(() => {
    repository = new QuantumFarmRepository();
  });

  describe("manifestFarm", () => {
    it("should create a farm with all required fields", async () => {
      const farmData = {
        name: "Test Divine Farm",
        slug: "test-divine-farm-" + Date.now(),
        ownerId: "test-owner-id",
        city: "Seattle",
        state: "WA",
        country: "USA",
        isActive: true
      };

      const farm = await repository.manifestFarm(farmData);

      expect(farm).toBeDefined();
      expect(farm.name).toBe(farmData.name);
      expect(farm.slug).toBe(farmData.slug);
      expect(farm.ownerId).toBe(farmData.ownerId);
    });
  });

  describe("findBySlug", () => {
    it("should find farm by slug", async () => {
      // Assuming a farm exists in test database
      const farm = await repository.findBySlug("test-farm");
      
      if (farm) {
        expect(farm.slug).toBe("test-farm");
        expect(farm.owner).toBeDefined();
        expect(farm.products).toBeInstanceOf(Array);
      }
    });

    it("should return null for non-existent slug", async () => {
      const farm = await repository.findBySlug("non-existent-farm-xyz");
      expect(farm).toBeNull();
    });
  });

  describe("isSlugAvailable", () => {
    it("should return true for available slug", async () => {
      const available = await repository.isSlugAvailable(
        "new-unique-slug-" + Date.now()
      );
      expect(available).toBe(true);
    });
  });
});
```

---

## 🚀 VERIFICATION STEPS

After completing all actions:

### 1. Type Check
```bash
npm run type-check
# Expected: 0 errors
```

### 2. Lint Check
```bash
npm run lint
# Expected: 0 errors, minimal warnings
```

### 3. Test Repositories
```bash
npm test -- repositories
# Expected: All tests passing
```

### 4. Build Project
```bash
npm run build
# Expected: Successful build
```

---

## 📝 COMMIT CHECKLIST

Before committing:
- [ ] All TypeScript errors fixed
- [ ] Zero `any` types in modified files
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Pre-commit hooks passing

### Commit Messages:
```bash
# For type safety fix
git commit -m "fix: remove any type usage in farm service for strict type safety"

# For repository layer
git commit -m "feat: implement base repository and farm repository for kilo-scale architecture

- Add BaseRepository with CRUD operations
- Add QuantumFarmRepository with agricultural consciousness
- Add comprehensive tests for repository layer
- Follows 11_KILO_SCALE_ARCHITECTURE patterns"
```

---

## 🎯 SUCCESS CRITERIA

You've completed today's tasks when:
- ✅ Zero `any` types in codebase
- ✅ BaseRepository class created and tested
- ✅ FarmRepository implemented with tests
- ✅ All tests passing
- ✅ TypeScript strict mode passing
- ✅ Code committed with divine commit messages

---

## 📞 NEED HELP?

### Common Issues:

**Issue**: TypeScript errors after changing `any` to `Prisma.FarmInclude`
```bash
# Solution: Install Prisma types
npm install @prisma/client@latest
npx prisma generate
```

**Issue**: Tests failing due to database connection
```bash
# Solution: Ensure PostgreSQL is running
# Check DATABASE_URL in .env
# Run migrations: npx prisma migrate dev
```

**Issue**: Import errors for repositories
```bash
# Solution: Check tsconfig.json has correct paths
# Restart TypeScript server in VS Code: Cmd+Shift+P -> "Restart TS Server"
```

---

## 🔜 NEXT STEPS (Tomorrow)

After completing today's tasks:

1. **Update Farm Service** to use FarmRepository
2. **Create ProductRepository** following same pattern
3. **Implement BaseController** class
4. **Start Controller Layer** implementation

See `COMPREHENSIVE_REVIEW_AND_ACTION_PLAN.md` for full roadmap.

---

**Time to Complete**: 2-4 hours  
**Difficulty**: ⭐⭐⭐ (Intermediate)  
**Impact**: 🔥🔥🔥 (High - Foundation for 100% completion)

_"Every divine journey begins with a single quantum commit."_ 🌾⚡