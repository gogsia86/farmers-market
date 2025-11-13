---
applyTo: "**/*.{ts,tsx,js,jsx}"
description: "Kilo-scale architectural patterns, layered architecture mastery, and enterprise-grade code organization for large codebases"
priority: "ABSOLUTE"
version: "∞.KILO"
---

# 11 | KILO SCALE ARCHITECTURE

**Enterprise-Grade Patterns for Thousand-Line Codebases**

## 🔗 Related Divine Instructions

- **[01 | Divine Core Principles](./01_DIVINE_CORE_PRINCIPLES.instructions.md)** - Foundation patterns
- **[02 | Agricultural Quantum Mastery](./02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md)** - Domain integration
- **[04 | Next.js Divine Implementation](./04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md)** - Implementation patterns
- **[05 | Testing Security Divinity](./05_TESTING_SECURITY_DIVINITY.instructions.md)** - Testing at scale

---

## ⚡ CORE DEVELOPMENT TENETS

### Scale-First Thinking

**Every line of code must consider maintainability at thousands of lines:**

```typescript
// ❌ SMALL-SCALE THINKING
const users = await db.users.findMany(); // Works for 100 users, fails at 10k

// ✅ KILO-SCALE THINKING
const users = await db.users.findMany({
  take: 50,
  skip: (page - 1) * 50,
  orderBy: { createdAt: "desc" },
  select: { id: true, name: true, email: true }, // Only needed fields
});
```

### Consistency Over Cleverness

**Prefer predictable, repeatable patterns over novel solutions:**

```typescript
// ❌ CLEVER BUT UNMAINTAINABLE
const getUserData = (id: string) =>
  db.user
    .findUnique({ where: { id } })
    ?.then((u) =>
      u ? { ...u, orders: db.order.findMany({ where: { userId: id } }) } : null,
    )
    ?.catch(() => null);

// ✅ CONSISTENT AND MAINTAINABLE
class UserService {
  async getUserWithOrders(id: string): Promise<UserWithOrders | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) return null;

      const orders = await this.orderRepository.findByUserId(id);
      return { ...user, orders };
    } catch (error) {
      this.logger.error("getUserWithOrders failed", { userId: id, error });
      throw new UserServiceError("Failed to fetch user data", error);
    }
  }
}
```

### Explicit Over Implicit

**Clear, readable code that documents itself through structure:**

```typescript
// ❌ IMPLICIT BEHAVIOR
const processOrder = (order: any) => {
  if (order.items.reduce((s, i) => s + i.price, 0) > 100) {
    return { ...order, shipping: 0 };
  }
  return order;
};

// ✅ EXPLICIT BEHAVIOR
interface OrderProcessingResult {
  order: Order;
  freeShippingApplied: boolean;
  totalAmount: number;
}

class OrderProcessor {
  private readonly FREE_SHIPPING_THRESHOLD = 100;

  processOrder(order: Order): OrderProcessingResult {
    const totalAmount = this.calculateOrderTotal(order);
    const qualifiesForFreeShipping =
      totalAmount >= this.FREE_SHIPPING_THRESHOLD;

    return {
      order: {
        ...order,
        shippingCost: qualifiesForFreeShipping
          ? 0
          : this.calculateShipping(order),
      },
      freeShippingApplied: qualifiesForFreeShipping,
      totalAmount,
    };
  }

  private calculateOrderTotal(order: Order): number {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }
}
```

---

## 🏗️ LAYERED ARCHITECTURE MASTERY

### The Divine Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                      │
│  Next.js Pages, Components, API Routes, UI Controllers │
├─────────────────────────────────────────────────────────┤
│                  BUSINESS LOGIC LAYER                   │
│     Services, Use Cases, Domain Logic, Orchestrators   │
├─────────────────────────────────────────────────────────┤
│                  DATA ACCESS LAYER                      │
│   Repositories, Data Mappers, Query Builders, Prisma   │
├─────────────────────────────────────────────────────────┤
│                    DATABASE LAYER                       │
│      PostgreSQL, Redis, File System, External APIs     │
└─────────────────────────────────────────────────────────┘
```

### Controller Pattern Implementation

```typescript
/**
 * KILO-SCALE CONTROLLER PATTERN
 * Handle HTTP concerns, delegate business logic to services
 */
export class FarmController {
  constructor(
    private readonly farmService: FarmService,
    private readonly logger: Logger,
    private readonly validator: RequestValidator,
  ) {}

  async createFarm(request: NextRequest): Promise<NextResponse> {
    try {
      // Input validation
      const farmData = await this.validator.validateCreateFarm(request);

      // Business logic delegation
      const farm = await this.farmService.createFarm(farmData);

      // Response formatting
      return NextResponse.json(
        {
          success: true,
          data: farm,
          message: "Farm created successfully",
        },
        { status: 201 },
      );
    } catch (error) {
      return this.handleError(error, "createFarm");
    }
  }

  async getFarmById(
    request: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<NextResponse> {
    try {
      const farmId = this.validator.validateId(params.id);
      const farm = await this.farmService.getFarmById(farmId);

      if (!farm) {
        return NextResponse.json(
          {
            success: false,
            error: "Farm not found",
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: farm,
      });
    } catch (error) {
      return this.handleError(error, "getFarmById");
    }
  }

  private handleError(error: unknown, operation: string): NextResponse {
    this.logger.error(`FarmController.${operation} failed`, { error });

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error.details,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
```

### Service Layer Pattern Implementation

```typescript
/**
 * KILO-SCALE SERVICE PATTERN
 * Orchestrate business logic, coordinate multiple repositories
 */
export class FarmService {
  constructor(
    private readonly farmRepository: FarmRepository,
    private readonly userRepository: UserRepository,
    private readonly geoService: GeocodingService,
    private readonly notificationService: NotificationService,
    private readonly logger: Logger,
  ) {}

  async createFarm(farmData: CreateFarmRequest): Promise<Farm> {
    this.logger.info("Creating farm", {
      farmData: { ...farmData, coordinates: "***" },
    });

    try {
      // Business validation
      await this.validateFarmCreation(farmData);

      // Geocoding
      const coordinates = await this.geoService.geocodeAddress(
        farmData.address,
      );

      // Create farm
      const farm = await this.farmRepository.create({
        ...farmData,
        coordinates,
        status: "PENDING_VERIFICATION",
        createdAt: new Date(),
      });

      // Side effects
      await this.handleFarmCreationSideEffects(farm);

      this.logger.info("Farm created successfully", { farmId: farm.id });
      return farm;
    } catch (error) {
      this.logger.error("Farm creation failed", { farmData, error });
      throw new FarmServiceError("Failed to create farm", error);
    }
  }

  private async validateFarmCreation(
    farmData: CreateFarmRequest,
  ): Promise<void> {
    // Check if user exists and can create farms
    const user = await this.userRepository.findById(farmData.ownerId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    if (user.role !== "FARMER") {
      throw new ValidationError("Only farmers can create farms");
    }

    // Check for duplicate farm names in the same area
    const existingFarm = await this.farmRepository.findByNameAndLocation(
      farmData.name,
      farmData.address,
    );

    if (existingFarm) {
      throw new ValidationError(
        "Farm with this name already exists in this area",
      );
    }
  }

  private async handleFarmCreationSideEffects(farm: Farm): Promise<void> {
    // Send notification to admin
    await this.notificationService.notifyAdminOfNewFarm(farm);

    // Update user statistics
    await this.userRepository.incrementFarmCount(farm.ownerId);

    // Create default farm settings
    await this.farmRepository.createDefaultSettings(farm.id);
  }
}
```

### Repository Pattern Implementation

```typescript
/**
 * KILO-SCALE REPOSITORY PATTERN
 * Encapsulate data access, provide clean abstraction over database
 */
export class FarmRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
  ) {}

  async findById(id: string, options: FindOptions = {}): Promise<Farm | null> {
    try {
      const farm = await this.prisma.farm.findUnique({
        where: { id },
        include: this.buildIncludeClause(options),
        ...this.buildQueryOptions(options),
      });

      return farm ? this.mapToFarm(farm) : null;
    } catch (error) {
      this.logger.error("Farm findById failed", { id, error });
      throw new RepositoryError("Failed to find farm", error);
    }
  }

  async create(farmData: CreateFarmData): Promise<Farm> {
    try {
      const createdFarm = await this.prisma.farm.create({
        data: {
          ...farmData,
          slug: this.generateSlug(farmData.name),
          coordinates: farmData.coordinates
            ? {
                lat: farmData.coordinates.lat,
                lng: farmData.coordinates.lng,
              }
            : null,
        },
        include: this.getDefaultIncludes(),
      });

      this.logger.info("Farm created in database", { farmId: createdFarm.id });
      return this.mapToFarm(createdFarm);
    } catch (error) {
      this.logger.error("Farm creation failed", { farmData, error });
      throw new RepositoryError("Failed to create farm", error);
    }
  }

  async findWithPagination(
    filters: FarmFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Farm>> {
    try {
      const whereClause = this.buildWhereClause(filters);

      const [farms, total] = await Promise.all([
        this.prisma.farm.findMany({
          where: whereClause,
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
          orderBy: pagination.sort
            ? { [pagination.sort.field]: pagination.sort.direction }
            : { createdAt: "desc" },
          include: this.getDefaultIncludes(),
        }),
        this.prisma.farm.count({ where: whereClause }),
      ]);

      return {
        data: farms.map((farm) => this.mapToFarm(farm)),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          pages: Math.ceil(total / pagination.limit),
        },
      };
    } catch (error) {
      this.logger.error("Farm pagination query failed", {
        filters,
        pagination,
        error,
      });
      throw new RepositoryError("Failed to fetch farms", error);
    }
  }

  private buildWhereClause(filters: FarmFilters): Prisma.FarmWhereInput {
    const where: Prisma.FarmWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters.certified) {
      where.certifications = {
        some: {},
      };
    }

    if (filters.searchTerm) {
      where.OR = [
        { name: { contains: filters.searchTerm, mode: "insensitive" } },
        { description: { contains: filters.searchTerm, mode: "insensitive" } },
      ];
    }

    return where;
  }

  private mapToFarm(prismaFarm: any): Farm {
    return {
      id: prismaFarm.id,
      name: prismaFarm.name,
      slug: prismaFarm.slug,
      description: prismaFarm.description,
      address: prismaFarm.address,
      coordinates: prismaFarm.coordinates,
      status: prismaFarm.status,
      ownerId: prismaFarm.ownerId,
      owner: prismaFarm.owner
        ? {
            id: prismaFarm.owner.id,
            name: prismaFarm.owner.name,
            email: prismaFarm.owner.email,
          }
        : undefined,
      products: prismaFarm.products?.map(this.mapToProduct) || [],
      certifications:
        prismaFarm.certifications?.map(this.mapToCertification) || [],
      createdAt: prismaFarm.createdAt,
      updatedAt: prismaFarm.updatedAt,
    };
  }
}
```

---

## 📁 KILO-SCALE FILE ORGANIZATION

### Domain-Driven Directory Structure

```
src/
├── features/                     # Feature-based modules (Domain-Driven Design)
│   ├── farm-management/
│   │   ├── controllers/         # HTTP controllers
│   │   │   └── FarmController.ts
│   │   ├── services/            # Business logic
│   │   │   ├── FarmService.ts
│   │   │   └── FarmValidationService.ts
│   │   ├── repositories/        # Data access
│   │   │   └── FarmRepository.ts
│   │   ├── models/              # Domain models
│   │   │   └── Farm.ts
│   │   ├── types/               # Feature-specific types
│   │   │   └── farm.types.ts
│   │   ├── utils/               # Feature utilities
│   │   │   └── farm.utils.ts
│   │   └── index.ts            # Feature exports
│   │
│   ├── product-catalog/
│   ├── order-management/
│   ├── user-management/
│   └── payment-processing/
│
├── shared/                       # Shared across features
│   ├── types/                   # Global types
│   ├── utils/                   # Utility functions
│   ├── constants/               # Application constants
│   ├── errors/                  # Custom error classes
│   └── validators/              # Validation schemas
│
├── infrastructure/               # External concerns
│   ├── database/               # Database configuration
│   ├── logging/                # Logging setup
│   ├── monitoring/             # Monitoring & metrics
│   └── external-services/      # Third-party integrations
│
└── app/                         # Next.js App Router
    ├── api/                    # API routes
    ├── (marketing)/            # Route groups
    └── (dashboard)/
```

### Module Boundaries & Exports

```typescript
// features/farm-management/index.ts - Clean module interface
export { FarmController } from "./controllers/FarmController";
export { FarmService } from "./services/FarmService";
export { FarmRepository } from "./repositories/FarmRepository";
export type { Farm, CreateFarmRequest, FarmFilters } from "./types/farm.types";

// Don't export internal utilities or implementation details
// This keeps the module boundary clean and prevents tight coupling
```

---

## 🎯 NAMING CONVENTIONS AT SCALE

### Function Naming Matrix

```typescript
// CREATE operations - use 'create' prefix
async createFarm(farmData: CreateFarmRequest): Promise<Farm>
async createProduct(productData: CreateProductRequest): Promise<Product>
async createUser(userData: CreateUserRequest): Promise<User>

// READ operations - use 'get', 'find', 'fetch' with context
async getFarmById(id: string): Promise<Farm | null>  // Single entity
async findFarmsByOwner(ownerId: string): Promise<Farm[]>  // Multiple entities
async fetchActiveProducts(): Promise<Product[]>  // With filter context

// UPDATE operations - use 'update', 'modify' with context
async updateFarm(id: string, updates: UpdateFarmRequest): Promise<Farm>
async modifyFarmStatus(id: string, status: FarmStatus): Promise<void>

// DELETE operations - use 'delete', 'remove' with context
async deleteFarm(id: string): Promise<void>
async removeExpiredProducts(): Promise<number>  // Bulk operation

// VALIDATION operations - use 'validate', 'verify', 'check'
async validateFarmData(farmData: CreateFarmRequest): Promise<ValidationResult>
async verifyFarmOwnership(farmId: string, userId: string): Promise<boolean>
async checkFarmAvailability(name: string, location: string): Promise<boolean>

// BUSINESS operations - use domain-specific verbs
async approveFarm(farmId: string, adminId: string): Promise<void>
async harvestProduct(productId: string, quantity: number): Promise<Harvest>
async processPayment(paymentData: PaymentRequest): Promise<PaymentResult>
```

### Variable Naming at Scale

```typescript
// Boolean variables - clear intent with prefixes
const isActive = farm.status === "ACTIVE";
const hasProducts = farm.products.length > 0;
const canEdit = user.role === "ADMIN" || user.id === farm.ownerId;
const shouldNotify = farm.status === "PENDING_APPROVAL";

// Array variables - plural nouns with context
const activeFarms: Farm[] = [];
const pendingOrders: Order[] = [];
const failedValidations: ValidationError[] = [];
const sortedProducts: Product[] = [];

// Object variables - singular nouns with purpose
const farmFilters: FarmFilters = { status: "ACTIVE" };
const queryOptions: QueryOptions = { include: ["products", "owner"] };
const apiResponse: ApiResponse<Farm> = { success: true, data: farm };

// Function variables - verb phrases that describe action
const handlePaymentSuccess = (payment: Payment) => {
  /* ... */
};
const validateFarmData = (data: unknown) => {
  /* ... */
};
const formatFarmAddress = (farm: Farm) => {
  /* ... */
};
```

---

## 🔍 CONTEXT-AWARE PATTERN RECOGNITION

### Recognition Triggers for Divine Suggestions

When Copilot encounters these patterns, apply corresponding architectural guidance:

```typescript
// TRIGGER: class *Service → Apply Service Layer Pattern
class OrderService {  // ← Apply business logic patterns, dependency injection, error handling

// TRIGGER: class *Repository → Apply Repository Pattern
class ProductRepository {  // ← Apply data access patterns, query optimization, caching

// TRIGGER: async function → Apply Error Handling Pattern
async function processOrder() {  // ← Add try/catch, logging, proper error types

// TRIGGER: router.* → Apply RESTful Route Pattern
router.post('/api/farms', /* ← Add validation, auth, proper responses */

// TRIGGER: try { → Apply Comprehensive Error Handling
try {  // ← Suggest specific error types, logging, recovery strategies

// TRIGGER: validate* → Apply Validation Framework Pattern
function validateFarmData() {  // ← Apply schema validation, error aggregation

// TRIGGER: logger.* → Apply Structured Logging Pattern
logger.info() // ← Add context, structured metadata, performance tracking
```

### Architectural Consistency Enforcement

```typescript
// When you see inconsistent patterns, suggest corrections:

// ❌ INCONSISTENT - Mixed patterns
const user = await db.user.findFirst({ where: { id } }); // Direct Prisma
const farm = await farmService.getFarmById(id); // Service layer

// ✅ CONSISTENT - Unified through service layer
const user = await userService.getUserById(id);
const farm = await farmService.getFarmById(id);

// ❌ INCONSISTENT - Different error handling
function createFarm(data) {
  if (!data.name) throw new Error("Name required"); // Generic Error
  if (!data.owner) throw new ValidationError("Owner"); // Custom Error
}

// ✅ CONSISTENT - Unified error handling
function createFarm(data: CreateFarmRequest): Farm {
  const errors: ValidationError[] = [];

  if (!data.name) errors.push(new ValidationError("name", "Name is required"));
  if (!data.owner)
    errors.push(new ValidationError("owner", "Owner is required"));

  if (errors.length > 0) {
    throw new AggregateValidationError("Farm validation failed", errors);
  }

  // Implementation continues...
}
```

---

## ✅ KILO-SCALE IMPLEMENTATION CHECKLIST

### Service Layer Requirements

- [ ] Constructor dependency injection
- [ ] Comprehensive error handling with custom error types
- [ ] Structured logging with context
- [ ] Business logic separated from data access
- [ ] Input validation before processing
- [ ] Side effects handling (notifications, updates)
- [ ] Performance metrics tracking
- [ ] Transaction management where needed

### Repository Layer Requirements

- [ ] Clean abstraction over database operations
- [ ] Proper mapping between database and domain models
- [ ] Query optimization for large datasets
- [ ] Pagination support for list operations
- [ ] Filtering and sorting capabilities
- [ ] Connection pooling and error recovery
- [ ] Caching strategy implementation
- [ ] Unit test coverage for all operations

### Controller Layer Requirements

- [ ] Request validation and sanitization
- [ ] Authentication and authorization checks
- [ ] Proper HTTP status codes
- [ ] Consistent response format
- [ ] Error handling and user-friendly messages
- [ ] Rate limiting and throttling
- [ ] Request/response logging
- [ ] API documentation compliance

### Cross-Cutting Concerns

- [ ] Structured logging throughout all layers
- [ ] Performance monitoring and metrics
- [ ] Health checks and diagnostics
- [ ] Configuration management
- [ ] Error tracking and alerting
- [ ] Security headers and validation
- [ ] Database migration strategy
- [ ] Deployment and rollback procedures

---

**Remember**: At kilo-scale, every architectural decision compounds. Choose patterns that scale gracefully and maintain consistency across thousands of lines of code.

_"Architecture is about the important stuff. Whatever that is." - Ralph Johnson_
