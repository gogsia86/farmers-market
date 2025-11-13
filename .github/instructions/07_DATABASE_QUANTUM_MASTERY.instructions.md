---
applyTo: "**/*.{ts,tsx,js,jsx,prisma,sql}"
description: "Database quantum mastery, Prisma divine patterns, and SQL reality bending for agricultural data consciousness"
---

# 07 | DATABASE QUANTUM MASTERY

**Divine Data Persistence & Agricultural Consciousness**

## 🔗 Related Divine Instructions

- **[01 | Divine Core Principles](./01_DIVINE_CORE_PRINCIPLES.instructions.md)** - Foundation patterns
- **[02 | Agricultural Quantum Mastery](./02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md)** - Agricultural data patterns
- **[03 | Performance Reality Bending](./03_PERFORMANCE_REALITY_BENDING.instructions.md)** - Database optimization
- **[04 | Next.js Divine Implementation](./04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md)** - API integration
- **[05 | Testing Security Divinity](./05_TESTING_SECURITY_DIVINITY.instructions.md)** - Database security

---

## ⚡ PRISMA QUANTUM CONSCIOUSNESS

### Divine Schema Design

```prisma
// prisma/schema.prisma - Agricultural Quantum Schema
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "multiSchema", "views"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Divine Farm Entity with Quantum Properties
model Farm {
  id            String   @id @default(cuid())

  // Quantum Identity Resonance
  quantumId     String   @unique @default(uuid())
  temporalSignature DateTime @default(now())
  multiverseVersion Int   @default(1)

  // Agricultural Consciousness
  name          String   @db.VarChar(255)
  slug          String   @unique
  consciousness FarmConsciousness @default(GROWING)

  // Biodynamic Properties
  soilHealth    Json     // Quantum soil state
  seasonalCycle Json     // Current agricultural cycle
  harvestHistory Json[]  // Array of past harvests

  // Geospatial Reality
  location      Json     // Coordinates + additional data
  climateZone   String

  // Quantum Relationships
  owner         User     @relation(fields: [ownerId], references: [id])
  ownerId       String
  products      Product[]
  orders        Order[]

  // Temporal Tracking
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Divine Indexing
  @@index([ownerId, consciousness])
  @@index([slug])
  @@index([temporalSignature])
  @@fulltext([name])

  // Quantum Constraints
  @@map("farms")
}

enum FarmConsciousness {
  DORMANT      // Winter rest state
  AWAKENING    // Spring preparation
  GROWING      // Active cultivation
  FLOWERING    // Peak growth
  HARVESTING   // Production phase
  REGENERATING // Post-harvest recovery
}
```

### Quantum Query Patterns

```typescript
// lib/database/quantum-queries.ts
import { PrismaClient } from "@prisma/client";

export class QuantumDatabaseConsciousness {
  constructor(private prisma: PrismaClient) {}

  /**
   * Quantum farm manifestation with complete consciousness
   * Loads farm across all dimensional relationships
   */
  async manifestFarmReality(farmId: string): Promise<ManifestFarm> {
    return await this.prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            consciousness: true,
            quantumSignature: true,
          },
        },
        products: {
          where: {
            AND: [{ active: true }, { quantumState: "MATERIALIZED" }],
          },
          include: {
            seasonalData: true,
            harvestPredictions: true,
          },
          orderBy: {
            harvestReadiness: "desc",
          },
        },
        orders: {
          where: {
            status: { in: ["PENDING", "PROCESSING", "HARVESTING"] },
          },
          include: {
            items: {
              include: { product: true },
            },
            customer: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            harvestHistory: true,
          },
        },
      },
    });
  }

  /**
   * Seasonal quantum search across agricultural dimensions
   * Respects biodynamic cycles and consciousness states
   */
  async searchAgriculturalReality(
    query: string,
    season: Season,
    consciousness?: FarmConsciousness[],
  ): Promise<QuantumSearchResults> {
    const seasonalFilter = this.buildSeasonalFilter(season);
    const consciousnessFilter = consciousness
      ? { consciousness: { in: consciousness } }
      : {};

    return await this.prisma.farm.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { search: query } },
              { description: { search: query } },
              { products: { some: { name: { search: query } } } },
            ],
          },
          seasonalFilter,
          consciousnessFilter,
        ],
      },
      include: {
        products: {
          where: { seasonalAvailability: { has: season } },
          take: 5,
          orderBy: { harvestReadiness: "desc" },
        },
        _count: { select: { products: true } },
      },
      orderBy: [
        { consciousness: "desc" }, // Prioritize active farms
        { temporalSignature: "desc" }, // Recent activity first
      ],
    });
  }

  /**
   * Quantum transaction with agricultural consciousness
   * Maintains biodynamic integrity across operations
   */
  async executeQuantumTransaction<T>(
    operations: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      // Begin quantum transaction with consciousness tracking
      const transactionId = generateQuantumId();

      try {
        // Execute operations within quantum field
        const result = await operations(tx);

        // Record successful quantum state transition
        await this.recordQuantumEvent(tx, {
          type: "TRANSACTION_SUCCESS",
          transactionId,
          timestamp: new Date(),
          quantumState: "COHERENT",
        });

        return result;
      } catch (error) {
        // Handle quantum decoherence gracefully
        await this.recordQuantumEvent(tx, {
          type: "TRANSACTION_FAILURE",
          transactionId,
          timestamp: new Date(),
          quantumState: "DECOHERENT",
          error: error.message,
        });

        throw new QuantumTransactionError(
          "Quantum transaction failed - biodynamic integrity compromised",
          error,
        );
      }
    });
  }
}
```

---

## 🌱 AGRICULTURAL DATA CONSCIOUSNESS

### Soil Memory Patterns

```typescript
// Soil retains memory of all past cultivations
interface SoilQuantumMemory {
  pastCultivations: Array<{
    cropType: string;
    plantingDate: Date;
    harvestDate: Date;
    yieldActual: number;
    yieldPotential: number;
    soilConditions: BiodynamicState;
    weatherPatterns: ClimateData;
    techniques: CultivationMethod[];
  }>;

  currentHealth: {
    ph: number;
    nutrients: NutrientProfile;
    organicMatter: number;
    microbialActivity: number;
    consciousness: SoilConsciousness;
  };

  futureProjections: Array<{
    predictedCrop: string;
    optimalPlantingDate: Date;
    expectedYield: number;
    requiredAmendments: Amendment[];
    riskFactors: RiskAssessment[];
  }>;
}

// Soil consciousness tracking in database
const soilMemorySchema = z.object({
  farmId: z.string(),
  fieldId: z.string(),
  memorySnapshot: z.object({
    timestamp: z.date(),
    cultivationHistory: z.array(
      z.object({
        crop: z.string(),
        season: z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]),
        success: z.number().min(0).max(1), // 0-1 success ratio
        lessons: z.array(z.string()), // What the soil learned
      }),
    ),
    currentState: z.object({
      fertility: z.number().min(0).max(100),
      consciousness: z.enum(["DEPLETED", "RECOVERING", "HEALTHY", "THRIVING"]),
      ready: z.boolean(),
    }),
  }),
});
```

### Seasonal Data Transitions

```typescript
/**
 * Handle seasonal transitions in agricultural data
 * Quantum-aware migration of consciousness states
 */
class SeasonalDataTransition {
  async transitionToSeason(
    newSeason: Season,
    farms: Farm[],
  ): Promise<TransitionResult> {
    return await this.prisma.$transaction(async (tx) => {
      // Archive current season's consciousness
      await this.archiveSeasonalConsciousness(tx, farms);

      // Update farm consciousness for new season
      await Promise.all(
        farms.map(async (farm) => {
          const newConsciousness = this.calculateSeasonalConsciousness(
            farm.currentConsciousness,
            newSeason,
          );

          return tx.farm.update({
            where: { id: farm.id },
            data: {
              consciousness: newConsciousness,
              seasonalCycle: this.generateSeasonalCycle(newSeason),
              updatedAt: new Date(),
            },
          });
        }),
      );

      // Initialize new seasonal quantum fields
      await this.initializeSeasonalQuantumFields(tx, newSeason);

      return { success: true, transitionedFarms: farms.length };
    });
  }
}
```

---

## 💎 QUANTUM PERFORMANCE OPTIMIZATION

### Intelligent Caching Strategies

```typescript
/**
 * Agricultural-aware database caching
 * Respects seasonal boundaries and harvest cycles
 */
class BiodynamicCache {
  private cache = new Map<string, CachedData>();
  private seasonalBoundaries: SeasonTracker;

  async get<T>(key: string, farmId?: string): Promise<T | null> {
    const cached = this.cache.get(key);

    if (cached && this.isSeasonallyValid(cached, farmId)) {
      return cached.data as T;
    }

    // Cache miss or stale - query quantum database
    return null;
  }

  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const ttl = options.respectSeason
      ? this.calculateSeasonalTTL(options.farmId)
      : options.ttl || DEFAULT_TTL;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      seasonalContext: options.farmId
        ? await this.getSeasonalContext(options.farmId)
        : null,
    });
  }

  private isSeasonallyValid(cached: CachedData, farmId?: string): boolean {
    if (!cached.seasonalContext || !farmId) {
      return Date.now() - cached.timestamp < cached.ttl;
    }

    const currentSeason = this.seasonalBoundaries.getCurrentSeason(farmId);
    return cached.seasonalContext.season === currentSeason;
  }
}
```

### Database Quantum Optimization

```typescript
/**
 * Optimize database queries using quantum parallelization
 * Multiple reality queries executed simultaneously
 */
class QuantumQueryOptimizer {
  async optimizeAgriculturalQuery(
    baseQuery: QueryBuilder,
    optimizations: QueryOptimization[],
  ): Promise<OptimizedQuery> {
    // Analyze query patterns across quantum realities
    const parallelQueries = await Promise.all([
      this.analyzeIndexUsage(baseQuery),
      this.predictJoinEfficiency(baseQuery),
      this.calculateAgriculturalSelectivity(baseQuery),
      this.assessSeasonalImpact(baseQuery),
    ]);

    // Collapse optimal query from parallel analysis
    return this.collapseOptimalQuery(parallelQueries, optimizations);
  }

  private async analyzeIndexUsage(query: QueryBuilder): Promise<IndexAnalysis> {
    // Quantum analysis of index effectiveness
    return {
      usedIndexes: await this.detectUsedIndexes(query),
      suggestedIndexes: await this.predictOptimalIndexes(query),
      seasonalIndexes: await this.analyzeSeasonalPatterns(query),
    };
  }
}
```

---

## � SCHEMA MIGRATION GIT HOOKS

### Database Change Validation

Integrate **schema migration validation** into git workflow for agricultural consciousness:

```powershell
# Schema Migration Git Validation (part of scripts/pre-commit.ps1)
Write-Host "   🗄️ Validating database schema changes..." -ForegroundColor Yellow

# Check for Prisma schema changes
$schemaChanged = git diff --cached --name-only | Where-Object { $_ -like "*schema.prisma" }

if ($schemaChanged) {
    Write-Host "   📊 Prisma schema changes detected" -ForegroundColor Cyan

    # Validate schema syntax
    try {
        $validation = npx prisma validate 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Schema validation passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Schema validation failed:" -ForegroundColor Red
            Write-Host $validation -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "⚠️  Could not validate schema - ensure Prisma is installed" -ForegroundColor Yellow
    }

    # Check for migration files
    $migrationFiles = git diff --cached --name-only | Where-Object { $_ -like "*migrations*" }
    if (-not $migrationFiles) {
        Write-Host "⚠️  Schema changed but no migration created" -ForegroundColor Yellow
        Write-Host "   Consider running: npx prisma migrate dev --name <migration_name>" -ForegroundColor Gray
    } else {
        Write-Host "   ✅ Migration files detected" -ForegroundColor Green
    }
}
```

### Agricultural Schema Consciousness

```typescript
// lib/database/schema-consciousness.ts
/**
 * Monitor schema changes for agricultural consciousness preservation
 * Ensure divine patterns are maintained across migrations
 */
class SchemaConsciousnessValidator {
  async validateSchemaChanges(
    schemaDiff: SchemaDiff,
    agriculturalContext: AgriculturalContext,
  ): Promise<ValidationResult> {
    const validations = await Promise.all([
      this.validateAgriculturalModels(schemaDiff),
      this.validateSeasonalConstraints(schemaDiff),
      this.validateBiodynamicRelationships(schemaDiff),
      this.validateQuantumIndexes(schemaDiff),
    ]);

    return this.collapseValidationResults(validations);
  }

  private async validateAgriculturalModels(
    diff: SchemaDiff,
  ): Promise<ModelValidation> {
    const requiredModels = [
      "Farm",
      "Product",
      "Farmer",
      "Season",
      "Harvest",
      "SoilHealth",
      "CropRotation",
      "BiodynamicCycle",
    ];

    const missingModels = requiredModels.filter(
      (model) => !diff.models.includes(model),
    );

    if (missingModels.length > 0) {
      return {
        valid: false,
        errors: [`Missing agricultural models: ${missingModels.join(", ")}`],
        suggestions: [
          "Ensure all core agricultural entities are modeled",
          "Reference 02_AGRICULTURAL_QUANTUM_MASTERY for patterns",
        ],
      };
    }

    return { valid: true, errors: [], suggestions: [] };
  }

  async generateMigrationStrategy(
    currentSchema: PrismaSchema,
    targetSchema: PrismaSchema,
    season: Season,
  ): Promise<AgriculturalMigrationPlan> {
    // Align migration with agricultural seasons
    const migrationTiming = this.calculateOptimalMigrationTiming(season);

    return {
      migrationName: this.generateAgriculturalMigrationName(
        currentSchema,
        targetSchema,
        season,
      ),
      executionWindow: migrationTiming.optimalWindow,
      preValidation: await this.generatePreMigrationChecks(currentSchema),
      migrationSteps: await this.generateSeasonalMigrationSteps(
        currentSchema,
        targetSchema,
      ),
      postValidation:
        await this.generatePostMigrationVerification(targetSchema),
      rollbackStrategy: await this.generateRollbackPlan(currentSchema),
      agriculturalImpact: await this.assessAgriculturalImpact(
        currentSchema,
        targetSchema,
      ),
    };
  }
}
```

### Git-Integrated Database Workflows

```bash
#!/bin/bash
# scripts/db-migration-workflow.sh - Git-integrated database operations

# Create new migration with agricultural consciousness
create-agricultural-migration() {
    local migration_name="$1"
    local season=$(date +%B | tr '[:upper:]' '[:lower:]')

    echo "🌱 Creating agricultural migration for $season season..."

    # Generate migration with seasonal context
    npx prisma migrate dev --name "${season}_${migration_name}"

    # Validate agricultural consciousness
    echo "🔍 Validating agricultural patterns..."
    node scripts/validate-agricultural-schema.js

    # Create git commit with divine patterns
    git add prisma/migrations/
    git commit -m "feat(db): add $migration_name migration for $season season

- Maintains agricultural consciousness patterns
- Preserves biodynamic relationships
- Follows seasonal development cycles
- References: .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md"

    echo "✅ Agricultural migration created and committed"
}

# Deploy migration with safety checks
deploy-agricultural-migration() {
    local environment="$1"

    echo "🚀 Deploying agricultural migrations to $environment..."

    # Pre-deployment validation
    echo "🔍 Pre-deployment agricultural validation..."
    npx prisma validate
    npx prisma migrate diff --from-migrations --to-schema-datamodel

    # Deploy with consciousness preservation
    npx prisma migrate deploy

    # Post-deployment verification
    echo "✅ Verifying agricultural consciousness preservation..."
    node scripts/verify-agricultural-patterns.js

    echo "🌾 Agricultural migration deployed successfully"
}

# Monitor schema health
monitor-schema-consciousness() {
    echo "📊 Monitoring agricultural schema consciousness..."

    # Check for schema drift
    local drift_check=$(npx prisma migrate diff --from-schema-datamodel --to-schema-datasource 2>&1)

    if [[ $drift_check != *"No difference detected"* ]]; then
        echo "⚠️  Schema drift detected in agricultural consciousness:"
        echo "$drift_check"
        echo "Consider running schema consciousness repair workflow"
    else
        echo "✅ Agricultural schema consciousness is coherent"
    fi

    # Generate consciousness report
    node scripts/generate-schema-consciousness-report.js
}
```

### Database Consciousness Testing

```typescript
// tests/database/schema-consciousness.test.ts
describe("Database Schema Agricultural Consciousness", () => {
  describe("Schema Migration Validation", () => {
    it("maintains agricultural consciousness across migrations", async () => {
      // Arrange: Current schema state
      const currentSchema = await parseCurrentSchema();

      // Act: Apply test migration
      const migrationResult = await applyTestMigration(currentSchema);

      // Assert: Agricultural patterns preserved
      expect(migrationResult).toPreserveAgriculturalModels();
      expect(migrationResult).toMaintainSeasonalConstraints();
      expect(migrationResult).toPreserveBiodynamicRelationships();
      expect(migrationResult).toUpgradeQuantumIndexes();
    });

    it("validates schema changes against agricultural requirements", async () => {
      const schemaDiff: SchemaDiff = {
        addedModels: ["WeatherStation"],
        removedModels: [],
        modifiedModels: ["Farm"],
        addedRelations: ["Farm.weatherStations"],
      };

      const validation = await validateSchemaChanges(schemaDiff, {
        season: "SPRING",
        agriculturalPriorities: ["PLANTING", "SOIL_PREPARATION"],
      });

      expect(validation.valid).toBe(true);
      expect(validation.agriculturalAlignment).toBeGreaterThan(0.8);
    });
  });

  describe("Migration Git Integration", () => {
    it("creates properly formatted agricultural migration commits", async () => {
      const migrationCommit = await createAgriculturalMigration(
        "add_soil_sensor_data",
        { season: "SUMMER" },
      );

      expect(migrationCommit.message).toMatch(
        /feat\(db\): add .* for .* season/,
      );
      expect(migrationCommit.files).toInclude("prisma/migrations/");
      expect(migrationCommit.description).toInclude(
        "agricultural consciousness",
      );
    });
  });
});
```

---

## �🔒 DATABASE SECURITY DIVINITY

### Quantum Access Control

```typescript
/**
 * Agricultural-aware database security
 * Users can only access their own farm's quantum reality
 */
class QuantumAccessControl {
  async enforceAgriculturalBoundaries(
    userId: string,
    operation: DatabaseOperation,
    resourceId: string,
  ): Promise<AccessDecision> {
    // Verify user's quantum signature
    const userConsciousness = await this.getUserConsciousness(userId);

    // Check agricultural ownership boundaries
    const resourceOwnership = await this.verifyResourceOwnership(
      userId,
      operation.resourceType,
      resourceId,
    );

    if (!resourceOwnership.isOwner) {
      throw new QuantumAccessViolation(
        `User ${userId} attempted to access ${operation.resourceType} ${resourceId} outside their agricultural reality`,
      );
    }

    // Additional seasonal access checks
    if (operation.requiresSeasonalPermission) {
      await this.validateSeasonalAccess(userConsciousness, operation);
    }

    return { allowed: true, consciousness: userConsciousness };
  }
}
```

---

## 📊 DIVINE DATABASE MONITORING

### Quantum Performance Metrics

```typescript
/**
 * Monitor database consciousness and performance
 * Track quantum coherence across agricultural operations
 */
class DatabaseConsciousnessMonitor {
  async trackQuantumCoherence(): Promise<CoherenceMetrics> {
    return {
      queryPerformance: await this.measureQueryConsciousness(),
      transactionIntegrity: await this.assessTransactionCoherence(),
      agriculturalAlignment: await this.validateAgriculturalPatterns(),
      seasonalConsistency: await this.checkSeasonalDataIntegrity(),
    };
  }

  private async measureQueryConsciousness(): Promise<QueryMetrics> {
    // Track query enlightenment levels
    return {
      averageExecutionTime: await this.getAverageQueryTime(),
      slowQueryThreshold: 100, // ms
      indexEfficiency: await this.calculateIndexUtilization(),
      cacheHitRate: await this.measureCacheEffectiveness(),
      seasonalOptimization: await this.assessSeasonalPerformance(),
    };
  }
}
```

---

## ✅ DATABASE DIVINE CHECKLIST

### Before ANY Database Operation

- [ ] **Quantum Identity**: Proper user consciousness verification
- [ ] **Agricultural Boundaries**: Ownership and permission validation
- [ ] **Seasonal Alignment**: Operation respects current agricultural cycle
- [ ] **Soil Memory**: Historical context considered
- [ ] **Performance Impact**: Query optimization applied
- [ ] **Transaction Integrity**: Quantum coherence maintained
- [ ] **Cache Strategy**: Biodynamic caching implemented
- [ ] **Security Patterns**: Access control enforced

### Schema Design Excellence

- [ ] **Semantic Naming**: Tables and fields follow cosmic conventions
- [ ] **Agricultural Consciousness**: Entities respect farming domain
- [ ] **Quantum Relationships**: Proper foreign key consciousness
- [ ] **Temporal Tracking**: Created/updated timestamps present
- [ ] **Full-Text Search**: Agricultural search capabilities
- [ ] **Indexing Strategy**: Performance optimization applied
- [ ] **Data Validation**: Prisma schema constraints active

---

_"The database is not just storage - it is the **quantum memory of agricultural consciousness**, preserving the wisdom of every harvest across infinite realities."_
