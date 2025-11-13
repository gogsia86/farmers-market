---
applyTo: "**/*.{ts,tsx,js,jsx,test.ts,test.tsx,spec.ts,spec.tsx}"
description: "Comprehensive testing strategies, performance monitoring, health checks, caching patterns, and optimization frameworks for enterprise applications"
---

# 13 | TESTING & PERFORMANCE MASTERY

**Enterprise Testing Strategies & Performance Optimization**

## 🔗 Related Divine Instructions

- **[11 | Kilo Scale Architecture](./11_KILO_SCALE_ARCHITECTURE.instructions.md)** - Architecture patterns for testing
- **[12 | Error Handling & Validation](./12_ERROR_HANDLING_VALIDATION.instructions.md)** - Error testing strategies
- **[05 | Testing Security Divinity](./05_TESTING_SECURITY_DIVINITY.instructions.md)** - Security testing focus
- **[03 | Performance Reality Bending](./03_PERFORMANCE_REALITY_BENDING.instructions.md)** - Performance fundamentals

---

## 🧪 COMPREHENSIVE TESTING FRAMEWORK

### Testing Pyramid at Scale

```
          /\
         /E2E\        ← Few (Critical user journeys, smoke tests)
        /------\
       /INTEGRA\      ← Some (API contracts, database interactions)
      /----------\
     /COMPONENT  \    ← More (UI components, hooks, utilities)
    /--------------\
   /UNIT    TESTS  \  ← Many (Business logic, pure functions)
  /------------------\
```

### Unit Testing Excellence

```typescript
/**
 * COMPREHENSIVE UNIT TEST PATTERN
 * Tests business logic with full isolation
 */
describe("FarmService", () => {
  let farmService: FarmService;
  let mockFarmRepository: jest.Mocked<FarmRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockGeoService: jest.Mocked<GeocodingService>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockLogger: jest.Mocked<StructuredLogger>;

  beforeEach(() => {
    // Create all mocks
    mockFarmRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByNameAndLocation: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findWithPagination: jest.fn(),
    } as jest.Mocked<FarmRepository>;

    mockUserRepository = {
      findById: jest.fn(),
      incrementFarmCount: jest.fn(),
      findMany: jest.fn(),
    } as jest.Mocked<UserRepository>;

    mockGeoService = {
      geocodeAddress: jest.fn(),
    } as jest.Mocked<GeocodingService>;

    mockNotificationService = {
      notifyAdminOfNewFarm: jest.fn(),
    } as jest.Mocked<NotificationService>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<StructuredLogger>;

    // Create service instance
    farmService = new FarmService(
      mockFarmRepository,
      mockUserRepository,
      mockGeoService,
      mockNotificationService,
      mockLogger,
    );
  });

  describe("createFarm", () => {
    const validFarmData: CreateFarmRequest = {
      name: "Test Farm",
      description: "A test farm",
      address: "123 Farm Lane, Farmville, CA 90210",
      ownerId: "user-123",
    };

    const mockUser: User = {
      id: "user-123",
      name: "John Farmer",
      email: "john@example.com",
      role: "FARMER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCoordinates: Coordinates = { lat: 34.0522, lng: -118.2437 };

    const expectedFarm: Farm = {
      id: "farm-123",
      ...validFarmData,
      coordinates: mockCoordinates,
      status: "PENDING_VERIFICATION",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      // Setup default successful responses
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockFarmRepository.findByNameAndLocation.mockResolvedValue(null);
      mockGeoService.geocodeAddress.mockResolvedValue(mockCoordinates);
      mockFarmRepository.create.mockResolvedValue(expectedFarm);
      mockNotificationService.notifyAdminOfNewFarm.mockResolvedValue(undefined);
      mockUserRepository.incrementFarmCount.mockResolvedValue(undefined);
    });

    it("should create a farm with valid data", async () => {
      // Act
      const result = await farmService.createFarm(validFarmData);

      // Assert
      expect(result).toEqual(expectedFarm);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
      expect(mockGeoService.geocodeAddress).toHaveBeenCalledWith(
        validFarmData.address,
      );
      expect(mockFarmRepository.create).toHaveBeenCalledWith({
        ...validFarmData,
        coordinates: mockCoordinates,
        status: "PENDING_VERIFICATION",
        createdAt: expect.any(Date),
      });
      expect(mockNotificationService.notifyAdminOfNewFarm).toHaveBeenCalledWith(
        expectedFarm,
      );
      expect(mockUserRepository.incrementFarmCount).toHaveBeenCalledWith(
        "user-123",
      );
    });

    it("should throw ValidationError when user not found", async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(farmService.createFarm(validFarmData)).rejects.toThrow(
        ValidationError,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
      expect(mockFarmRepository.create).not.toHaveBeenCalled();
    });

    it("should throw ValidationError when user is not a farmer", async () => {
      // Arrange
      const nonFarmerUser = { ...mockUser, role: "CUSTOMER" as const };
      mockUserRepository.findById.mockResolvedValue(nonFarmerUser);

      // Act & Assert
      await expect(farmService.createFarm(validFarmData)).rejects.toThrow(
        ValidationError,
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Only farmers can create farms"),
        expect.any(Object),
      );
    });

    it("should throw ValidationError when farm name already exists in location", async () => {
      // Arrange
      const existingFarm = { ...expectedFarm, id: "existing-farm" };
      mockFarmRepository.findByNameAndLocation.mockResolvedValue(existingFarm);

      // Act & Assert
      await expect(farmService.createFarm(validFarmData)).rejects.toThrow(
        ValidationError,
      );

      expect(mockFarmRepository.findByNameAndLocation).toHaveBeenCalledWith(
        validFarmData.name,
        validFarmData.address,
      );
    });

    it("should handle geocoding service failure", async () => {
      // Arrange
      const geocodingError = new Error("Geocoding service unavailable");
      mockGeoService.geocodeAddress.mockRejectedValue(geocodingError);

      // Act & Assert
      await expect(farmService.createFarm(validFarmData)).rejects.toThrow(
        FarmServiceError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Farm creation failed",
        expect.objectContaining({
          farmData: validFarmData,
          error: geocodingError,
        }),
      );
    });

    it("should handle database creation failure", async () => {
      // Arrange
      const dbError = new DatabaseError("create", new Error("Connection lost"));
      mockFarmRepository.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(farmService.createFarm(validFarmData)).rejects.toThrow(
        FarmServiceError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Farm creation failed",
        expect.objectContaining({
          farmData: validFarmData,
          error: dbError,
        }),
      );
    });

    it("should continue even if side effects fail", async () => {
      // Arrange
      mockNotificationService.notifyAdminOfNewFarm.mockRejectedValue(
        new Error("Notification service down"),
      );

      // Act
      const result = await farmService.createFarm(validFarmData);

      // Assert
      expect(result).toEqual(expectedFarm);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Failed to notify admin"),
        expect.any(Object),
      );
    });
  });

  describe("getFarmById", () => {
    it("should return farm when found", async () => {
      // Arrange
      const farmId = "farm-123";
      const expectedFarm: Farm = {
        id: farmId,
        name: "Test Farm",
        description: "A test farm",
        address: "123 Farm Lane",
        ownerId: "user-123",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockFarmRepository.findById.mockResolvedValue(expectedFarm);

      // Act
      const result = await farmService.getFarmById(farmId);

      // Assert
      expect(result).toEqual(expectedFarm);
      expect(mockFarmRepository.findById).toHaveBeenCalledWith(farmId);
    });

    it("should return null when farm not found", async () => {
      // Arrange
      mockFarmRepository.findById.mockResolvedValue(null);

      // Act
      const result = await farmService.getFarmById("nonexistent-id");

      // Assert
      expect(result).toBeNull();
    });

    it("should throw FarmServiceError on database error", async () => {
      // Arrange
      const dbError = new DatabaseError(
        "findById",
        new Error("Connection timeout"),
      );
      mockFarmRepository.findById.mockRejectedValue(dbError);

      // Act & Assert
      await expect(farmService.getFarmById("farm-123")).rejects.toThrow(
        FarmServiceError,
      );
    });
  });
});
```

### Integration Testing Excellence

```typescript
/**
 * INTEGRATION TEST PATTERN
 * Tests actual API endpoints with real database
 */
describe("Farm API Integration", () => {
  let app: NextApiHandler;
  let testDb: TestDatabase;
  let testUser: User;
  let authToken: string;

  beforeAll(async () => {
    // Setup test database
    testDb = await setupTestDatabase();
    app = createTestApp(testDb);

    // Create test user
    testUser = await testDb.user.create({
      data: {
        name: "Test Farmer",
        email: "farmer@test.com",
        role: "FARMER",
        password: await hashPassword("testpassword123"),
      },
    });

    // Generate auth token
    authToken = generateTestToken({ userId: testUser.id, role: testUser.role });
  });

  afterAll(async () => {
    await teardownTestDatabase(testDb);
  });

  beforeEach(async () => {
    // Clean up farms table before each test
    await testDb.farm.deleteMany();
  });

  describe("POST /api/farms", () => {
    const validFarmData = {
      name: "Integration Test Farm",
      description: "A farm created during integration testing",
      address: "123 Test Street, Test City, CA 90210",
    };

    it("should create a farm and return 201", async () => {
      // Act
      const response = await request(app)
        .post("/api/farms")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validFarmData)
        .expect(201);

      // Assert response structure
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          name: validFarmData.name,
          description: validFarmData.description,
          address: validFarmData.address,
          ownerId: testUser.id,
          status: "PENDING_VERIFICATION",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });

      // Verify database state
      const createdFarm = await testDb.farm.findUnique({
        where: { id: response.body.data.id },
      });

      expect(createdFarm).toBeTruthy();
      expect(createdFarm!.name).toBe(validFarmData.name);
      expect(createdFarm!.ownerId).toBe(testUser.id);
    });

    it("should return 400 for invalid data", async () => {
      // Arrange
      const invalidData = {
        name: "", // Empty name should fail validation
        address: validFarmData.address,
      };

      // Act
      const response = await request(app)
        .post("/api/farms")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR_AGGREGATE",
          message: expect.stringContaining("Validation failed"),
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: "name",
                message: expect.any(String),
              }),
            ]),
          },
        },
      });

      // Verify no farm was created
      const farmCount = await testDb.farm.count();
      expect(farmCount).toBe(0);
    });

    it("should return 401 without authentication", async () => {
      // Act
      const response = await request(app)
        .post("/api/farms")
        .send(validFarmData)
        .expect(401);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: expect.any(String),
          message: expect.stringContaining("Authentication required"),
        },
      });
    });

    it("should return 403 for non-farmer users", async () => {
      // Arrange
      const customerUser = await testDb.user.create({
        data: {
          name: "Test Customer",
          email: "customer@test.com",
          role: "CUSTOMER",
          password: await hashPassword("testpassword123"),
        },
      });

      const customerToken = generateTestToken({
        userId: customerUser.id,
        role: customerUser.role,
      });

      // Act
      const response = await request(app)
        .post("/api/farms")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(validFarmData)
        .expect(403);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: expect.any(String),
          message: expect.stringContaining("Only farmers can create farms"),
        },
      });
    });
  });

  describe("GET /api/farms/:id", () => {
    let testFarm: Farm;

    beforeEach(async () => {
      testFarm = await testDb.farm.create({
        data: {
          name: "Test Farm for GET",
          description: "A farm for testing GET endpoint",
          address: "456 Test Avenue",
          ownerId: testUser.id,
          status: "ACTIVE",
        },
      });
    });

    it("should return farm when found", async () => {
      // Act
      const response = await request(app)
        .get(`/api/farms/${testFarm.id}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testFarm.id,
          name: testFarm.name,
          description: testFarm.description,
          address: testFarm.address,
          ownerId: testFarm.ownerId,
          status: testFarm.status,
        },
      });
    });

    it("should return 404 for non-existent farm", async () => {
      // Act
      const response = await request(app)
        .get("/api/farms/non-existent-id")
        .expect(404);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "NOT_FOUND_ERROR",
          message: expect.stringContaining("not found"),
        },
      });
    });
  });
});
```

### Component Testing Excellence

```typescript
/**
 * REACT COMPONENT TESTING PATTERN
 * Tests UI components with user interactions
 */
describe('FarmCard Component', () => {
  const mockFarm: Farm = {
    id: 'farm-123',
    name: 'Sunny Acres Farm',
    description: 'A beautiful organic farm specializing in vegetables',
    address: '123 Farm Road, Farmville, CA',
    ownerId: 'user-123',
    status: 'ACTIVE',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    owner: {
      id: 'user-123',
      name: 'John Farmer',
      email: 'john@example.com'
    },
    products: [],
    certifications: ['ORGANIC', 'NON_GMO'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const defaultProps = {
    farm: mockFarm,
    onFarmClick: jest.fn(),
    onFavoriteClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render farm information correctly', () => {
    // Act
    render(<FarmCard {...defaultProps} />);

    // Assert
    expect(screen.getByText('Sunny Acres Farm')).toBeInTheDocument();
    expect(screen.getByText('A beautiful organic farm specializing in vegetables')).toBeInTheDocument();
    expect(screen.getByText('123 Farm Road, Farmville, CA')).toBeInTheDocument();
    expect(screen.getByText('John Farmer')).toBeInTheDocument();
  });

  it('should display certifications as badges', () => {
    // Act
    render(<FarmCard {...defaultProps} />);

    // Assert
    expect(screen.getByText('ORGANIC')).toBeInTheDocument();
    expect(screen.getByText('NON_GMO')).toBeInTheDocument();

    const organicBadge = screen.getByText('ORGANIC').closest('.badge');
    expect(organicBadge).toHaveClass('badge-organic');
  });

  it('should handle farm click events', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FarmCard {...defaultProps} />);

    // Act
    await user.click(screen.getByRole('button', { name: /view farm/i }));

    // Assert
    expect(defaultProps.onFarmClick).toHaveBeenCalledWith(mockFarm);
    expect(defaultProps.onFarmClick).toHaveBeenCalledTimes(1);
  });

  it('should handle favorite toggle', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FarmCard {...defaultProps} />);

    // Act
    await user.click(screen.getByRole('button', { name: /add to favorites/i }));

    // Assert
    expect(defaultProps.onFavoriteClick).toHaveBeenCalledWith(mockFarm.id);
    expect(defaultProps.onFavoriteClick).toHaveBeenCalledTimes(1);
  });

  it('should show favorite state when farm is favorited', () => {
    // Arrange
    const favoriteProps = {
      ...defaultProps,
      isFavorite: true
    };

    // Act
    render(<FarmCard {...favoriteProps} />);

    // Assert
    const favoriteButton = screen.getByRole('button', { name: /remove from favorites/i });
    expect(favoriteButton).toBeInTheDocument();
    expect(favoriteButton).toHaveClass('favorite-active');
  });

  it('should handle loading state', () => {
    // Arrange
    const loadingProps = {
      ...defaultProps,
      isLoading: true
    };

    // Act
    render(<FarmCard {...loadingProps} />);

    // Assert
    expect(screen.getByTestId('farm-card-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Sunny Acres Farm')).not.toBeInTheDocument();
  });

  it('should be accessible', async () => {
    // Act
    const { container } = render(<FarmCard {...defaultProps} />);

    // Assert
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle keyboard navigation', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FarmCard {...defaultProps} />);

    // Act
    const farmButton = screen.getByRole('button', { name: /view farm/i });
    farmButton.focus();
    await user.keyboard('{Enter}');

    // Assert
    expect(defaultProps.onFarmClick).toHaveBeenCalledWith(mockFarm);
  });
});
```

---

## 📊 PERFORMANCE MONITORING EXCELLENCE

### Performance Metrics Framework

```typescript
/**
 * PERFORMANCE MONITORING SYSTEM
 * Comprehensive performance tracking and optimization
 */
export interface PerformanceMetrics {
  operationName: string;
  duration: number;
  timestamp: Date;
  metadata: Record<string, any>;
  tags: string[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly logger: StructuredLogger;

  constructor() {
    this.logger = LoggerFactory.getLogger("PerformanceMonitor");
  }

  /**
   * MEASURE OPERATION PERFORMANCE
   * Track duration and metadata for any operation
   */
  async measure<T>(
    operationName: string,
    operation: () => Promise<T>,
    tags: string[] = [],
    metadata: Record<string, any> = {},
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;

      // Record metrics
      const metric: PerformanceMetrics = {
        operationName,
        duration,
        timestamp: new Date(),
        metadata: {
          ...metadata,
          memoryUsed,
          success: true,
        },
        tags: [...tags, "success"],
      };

      this.recordMetric(metric);

      // Log performance warnings
      if (duration > 1000) {
        // > 1 second
        this.logger.warn("Slow operation detected", {
          operation: operationName,
          duration,
          threshold: 1000,
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;

      // Record failure metrics
      const metric: PerformanceMetrics = {
        operationName,
        duration,
        timestamp: new Date(),
        metadata: {
          ...metadata,
          memoryUsed,
          success: false,
          error: (error as Error).message,
        },
        tags: [...tags, "error"],
      };

      this.recordMetric(metric);
      throw error;
    }
  }

  /**
   * GET PERFORMANCE STATISTICS
   * Analyze collected metrics
   */
  getStatistics(
    operationName?: string,
    timeWindow?: number,
  ): PerformanceStatistics {
    let relevantMetrics = this.metrics;

    if (operationName) {
      relevantMetrics = relevantMetrics.filter(
        (m) => m.operationName === operationName,
      );
    }

    if (timeWindow) {
      const cutoff = new Date(Date.now() - timeWindow);
      relevantMetrics = relevantMetrics.filter((m) => m.timestamp > cutoff);
    }

    if (relevantMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        successRate: 0,
      };
    }

    const durations = relevantMetrics.map((m) => m.duration);
    const successCount = relevantMetrics.filter(
      (m) => m.metadata.success,
    ).length;

    durations.sort((a, b) => a - b);

    return {
      count: relevantMetrics.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p50: this.percentile(durations, 50),
      p95: this.percentile(durations, 95),
      p99: this.percentile(durations, 99),
      successRate: (successCount / relevantMetrics.length) * 100,
    };
  }

  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only last 10,000 metrics in memory
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }

    // Log to external monitoring service
    this.logger.info(
      "Performance metric recorded",
      {
        operation: metric.operationName,
        duration: metric.duration,
        tags: metric.tags,
      },
      metric.metadata,
    );
  }

  private percentile(sortedValues: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }
}

/**
 * DATABASE QUERY PERFORMANCE MONITORING
 * Specific monitoring for database operations
 */
export class DatabasePerformanceMonitor {
  private readonly performanceMonitor: PerformanceMonitor;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
  }

  async monitorQuery<T>(
    queryName: string,
    query: () => Promise<T>,
    parameters?: Record<string, any>,
  ): Promise<T> {
    return await this.performanceMonitor.measure(
      `db.${queryName}`,
      query,
      ["database", "query"],
      { parameters },
    );
  }

  async monitorTransaction<T>(
    transactionName: string,
    transaction: () => Promise<T>,
  ): Promise<T> {
    return await this.performanceMonitor.measure(
      `db.transaction.${transactionName}`,
      transaction,
      ["database", "transaction"],
    );
  }

  getDatabaseStatistics(
    timeWindow?: number,
  ): Record<string, PerformanceStatistics> {
    // Get all database operation statistics
    const operations = ["create", "read", "update", "delete", "transaction"];
    const stats: Record<string, PerformanceStatistics> = {};

    for (const operation of operations) {
      stats[operation] = this.performanceMonitor.getStatistics(
        `db.${operation}`,
        timeWindow,
      );
    }

    return stats;
  }
}
```

### Caching Performance Framework

```typescript
/**
 * MULTI-LAYER CACHING SYSTEM
 * Performance optimization through intelligent caching
 */
export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  strategy: "LRU" | "LFU" | "FIFO";
}

export class PerformanceCache<K, V> {
  private readonly cache = new Map<string, CacheEntry<V>>();
  private readonly accessCount = new Map<string, number>();
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly logger: StructuredLogger;

  constructor(
    private readonly config: CacheConfig,
    private readonly keySerializer: (key: K) => string = JSON.stringify,
  ) {
    this.performanceMonitor = new PerformanceMonitor();
    this.logger = LoggerFactory.getLogger("PerformanceCache");
  }

  async get(key: K): Promise<V | null> {
    return await this.performanceMonitor.measure(
      "cache.get",
      async () => {
        const serializedKey = this.keySerializer(key);
        const entry = this.cache.get(serializedKey);

        if (!entry) {
          this.logger.debug("Cache miss", { key: serializedKey });
          return null;
        }

        if (this.isExpired(entry)) {
          this.cache.delete(serializedKey);
          this.logger.debug("Cache entry expired", { key: serializedKey });
          return null;
        }

        // Update access tracking
        this.updateAccess(serializedKey);

        this.logger.debug("Cache hit", { key: serializedKey });
        return entry.value;
      },
      ["cache", "read"],
      { key: this.keySerializer(key) },
    );
  }

  async set(key: K, value: V, ttl?: number): Promise<void> {
    return await this.performanceMonitor.measure(
      "cache.set",
      async () => {
        const serializedKey = this.keySerializer(key);
        const entry: CacheEntry<V> = {
          value,
          timestamp: Date.now(),
          ttl: ttl || this.config.defaultTTL,
          accessCount: 1,
        };

        // Check if we need to evict entries
        if (this.cache.size >= this.config.maxSize) {
          this.evictEntries();
        }

        this.cache.set(serializedKey, entry);
        this.accessCount.set(serializedKey, 1);

        this.logger.debug("Cache entry set", {
          key: serializedKey,
          ttl: entry.ttl,
          cacheSize: this.cache.size,
        });
      },
      ["cache", "write"],
      { key: this.keySerializer(key) },
    );
  }

  async getOrSet(key: K, factory: () => Promise<V>, ttl?: number): Promise<V> {
    const cachedValue = await this.get(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  getCacheStatistics(): CacheStatistics {
    const totalEntries = this.cache.size;
    const expiredEntries = Array.from(this.cache.values()).filter((entry) =>
      this.isExpired(entry),
    ).length;

    return {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      averageAccessCount: this.calculateAverageAccessCount(),
    };
  }

  private isExpired(entry: CacheEntry<V>): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }

  private updateAccess(key: string): void {
    const current = this.accessCount.get(key) || 0;
    this.accessCount.set(key, current + 1);

    const entry = this.cache.get(key);
    if (entry) {
      entry.accessCount = current + 1;
    }
  }

  private evictEntries(): void {
    const entriesToEvict = Math.ceil(this.config.maxSize * 0.1); // Evict 10%

    switch (this.config.strategy) {
      case "LRU":
        this.evictLRU(entriesToEvict);
        break;
      case "LFU":
        this.evictLFU(entriesToEvict);
        break;
      case "FIFO":
        this.evictFIFO(entriesToEvict);
        break;
    }
  }

  private evictLRU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, count);

    for (const [key] of entries) {
      this.cache.delete(key);
      this.accessCount.delete(key);
    }

    this.logger.info("LRU cache eviction completed", {
      evictedCount: entries.length,
      remainingEntries: this.cache.size,
    });
  }

  private evictLFU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)
      .slice(0, count);

    for (const [key] of entries) {
      this.cache.delete(key);
      this.accessCount.delete(key);
    }

    this.logger.info("LFU cache eviction completed", {
      evictedCount: entries.length,
    });
  }

  private evictFIFO(count: number): void {
    const entries = Array.from(this.cache.keys()).slice(0, count);

    for (const key of entries) {
      this.cache.delete(key);
      this.accessCount.delete(key);
    }

    this.logger.info("FIFO cache eviction completed", {
      evictedCount: entries.length,
    });
  }

  private calculateHitRate(): number {
    // This would require tracking hits/misses over time
    // Simplified implementation
    return 0.8; // Placeholder
  }

  private calculateAverageAccessCount(): number {
    const accessCounts = Array.from(this.accessCount.values());
    if (accessCounts.length === 0) return 0;

    return (
      accessCounts.reduce((sum, count) => sum + count, 0) / accessCounts.length
    );
  }
}

interface CacheEntry<V> {
  value: V;
  timestamp: number;
  ttl: number;
  accessCount: number;
}

interface CacheStatistics {
  totalEntries: number;
  expiredEntries: number;
  activeEntries: number;
  maxSize: number;
  hitRate: number;
  averageAccessCount: number;
}
```

---

## 🏥 HEALTH CHECK SYSTEM

### Comprehensive Health Monitoring

```typescript
/**
 * HEALTH CHECK SYSTEM
 * Monitor all aspects of application health
 */
export interface HealthCheckResult {
  healthy: boolean;
  responseTime?: number;
  message: string;
  details?: Record<string, any>;
  lastChecked: Date;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  version: string;
  environment: string;
  checks: Record<string, HealthCheckResult>;
  uptime: number;
}

export class HealthCheckService {
  private readonly logger: StructuredLogger;
  private readonly checks = new Map<string, () => Promise<HealthCheckResult>>();

  constructor() {
    this.logger = LoggerFactory.getLogger("HealthCheck");
    this.registerDefaultChecks();
  }

  registerCheck(name: string, check: () => Promise<HealthCheckResult>): void {
    this.checks.set(name, check);
    this.logger.info("Health check registered", { checkName: name });
  }

  async checkHealth(): Promise<SystemHealth> {
    const startTime = Date.now();
    const checks: Record<string, HealthCheckResult> = {};

    this.logger.debug("Starting health check");

    // Run all health checks in parallel
    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, check]) => {
        try {
          const result = await Promise.race([
            check(),
            this.timeoutPromise(10000), // 10 second timeout
          ]);
          checks[name] = result;
        } catch (error) {
          checks[name] = {
            healthy: false,
            message: `Health check failed: ${(error as Error).message}`,
            lastChecked: new Date(),
            details: { error: (error as Error).message },
          };
        }
      },
    );

    await Promise.all(checkPromises);

    // Determine overall status
    const allHealthy = Object.values(checks).every((check) => check.healthy);
    const someHealthy = Object.values(checks).some((check) => check.healthy);

    let status: SystemHealth["status"];
    if (allHealthy) {
      status = "healthy";
    } else if (someHealthy) {
      status = "degraded";
    } else {
      status = "unhealthy";
    }

    const result: SystemHealth = {
      status,
      timestamp: new Date(),
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks,
      uptime: process.uptime(),
    };

    const checkDuration = Date.now() - startTime;
    this.logger.info("Health check completed", {
      status,
      duration: checkDuration,
      checksCount: Object.keys(checks).length,
    });

    return result;
  }

  private registerDefaultChecks(): void {
    // Database health check
    this.registerCheck("database", async () => {
      const startTime = Date.now();
      try {
        await prisma.$queryRaw`SELECT 1`;
        const responseTime = Date.now() - startTime;

        return {
          healthy: true,
          responseTime,
          message: "Database connection is healthy",
          lastChecked: new Date(),
        };
      } catch (error) {
        return {
          healthy: false,
          responseTime: Date.now() - startTime,
          message: `Database connection failed: ${(error as Error).message}`,
          lastChecked: new Date(),
          details: { error: (error as Error).message },
        };
      }
    });

    // Memory health check
    this.registerCheck("memory", async () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
      const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100;

      const healthy = memoryUsagePercent < 90; // Alert if > 90% memory usage

      return {
        healthy,
        message: healthy
          ? `Memory usage is normal (${memoryUsagePercent.toFixed(1)}%)`
          : `High memory usage detected (${memoryUsagePercent.toFixed(1)}%)`,
        lastChecked: new Date(),
        details: {
          heapUsedMB: Math.round(heapUsedMB),
          heapTotalMB: Math.round(heapTotalMB),
          memoryUsagePercent: Math.round(memoryUsagePercent),
        },
      };
    });

    // Disk space health check
    this.registerCheck("diskSpace", async () => {
      try {
        const stats = await import("fs").then((fs) =>
          fs.promises.stat(process.cwd()),
        );

        // This is a simplified check - in production, you'd check actual disk usage
        return {
          helpful: true,
          message: "Disk space check completed",
          lastChecked: new Date(),
          details: {
            currentWorkingDirectory: process.cwd(),
          },
        };
      } catch (error) {
        return {
          healthy: false,
          message: `Disk space check failed: ${(error as Error).message}`,
          lastChecked: new Date(),
        };
      }
    });

    // External services health check
    this.registerCheck("externalServices", async () => {
      const services = [
        { name: "payment", url: process.env.PAYMENT_SERVICE_URL },
        { name: "email", url: process.env.EMAIL_SERVICE_URL },
      ];

      const results = await Promise.allSettled(
        services.map(async (service) => {
          if (!service.url)
            return {
              name: service.name,
              healthy: true,
              message: "Service not configured",
            };

          try {
            const response = await fetch(`${service.url}/health`, {
              method: "GET",
              timeout: 5000,
            });

            return {
              name: service.name,
              healthy: response.ok,
              message: response.ok
                ? "Service is healthy"
                : `Service returned ${response.status}`,
            };
          } catch (error) {
            return {
              name: service.name,
              healthy: false,
              message: `Service unreachable: ${(error as Error).message}`,
            };
          }
        }),
      );

      const serviceResults = results.map((result) =>
        result.status === "fulfilled"
          ? result.value
          : {
              name: "unknown",
              healthy: false,
              message: "Service check failed",
            },
      );

      const allHealthy = serviceResults.every((result) => result.healthy);

      return {
        healthy: allHealthy,
        message: allHealthy
          ? "All external services are healthy"
          : "Some external services are unhealthy",
        lastChecked: new Date(),
        details: { services: serviceResults },
      };
    });
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Health check timeout after ${ms}ms`)),
        ms,
      );
    });
  }
}
```

---

## ✅ TESTING & PERFORMANCE IMPLEMENTATION CHECKLIST

### Unit Testing

- [ ] Business logic fully covered (>90% coverage)
- [ ] All edge cases tested
- [ ] Mock dependencies properly
- [ ] Test error scenarios
- [ ] Use descriptive test names

### Integration Testing

- [ ] API endpoints tested with real database
- [ ] Authentication and authorization tested
- [ ] Error responses validated
- [ ] Database state verified
- [ ] Happy path and edge cases covered

### Component Testing

- [ ] User interactions tested
- [ ] Accessibility validated
- [ ] Loading and error states tested
- [ ] Props validation covered
- [ ] Keyboard navigation tested

### Performance Monitoring

- [ ] Operation duration tracking
- [ ] Memory usage monitoring
- [ ] Database query performance
- [ ] Cache hit/miss ratios
- [ ] Error rate tracking

### Caching Strategy

- [ ] Multi-layer caching implemented
- [ ] Cache invalidation strategy
- [ ] Performance metrics tracked
- [ ] Eviction policies configured
- [ ] Cache size limits enforced

### Health Checks

- [ ] Database connectivity check
- [ ] Memory usage monitoring
- [ ] Disk space validation
- [ ] External service health
- [ ] Overall system status

---

**Remember**: Testing and performance monitoring are not afterthoughts - they're integral parts of the development process that ensure reliability and user satisfaction.

_"Performance is a feature, and testing is the safety net that lets you move fast without breaking things."_
