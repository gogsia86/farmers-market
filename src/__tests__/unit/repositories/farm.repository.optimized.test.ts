/**
 * 🧪 OPTIMIZED FARM REPOSITORY UNIT TESTS
 *
 * Comprehensive test suite for OptimizedFarmRepository
 * Phase 3: Database optimization integration testing
 *
 * Features Tested:
 * - Optimized query methods (findByIdOptimized, listFarmsOptimized, etc.)
 * - Data mapping functions (mapToListItem, mapToDetail)
 * - Decimal conversion utilities
 * - Pagination calculations
 * - Filter building (buildWhereClause, buildOrderBy)
 * - Type safety and schema alignment
 *
 * Patterns Demonstrated:
 * - Database mocking with typed responses
 * - Decimal field conversion testing
 * - Pagination logic verification
 * - Filter query building validation
 * - Error scenario testing
 *
 * @reference .cursorrules - Testing Patterns (Claude Sonnet 4.5)
 * @reference PHASE_3_TASK_2_COMPLETE.md - Implementation details
 */

import { database } from "@/lib/database";
import {
  optimizedFarmRepository,
  type FarmSearchFilters,
  type OptimizedFarmListItem,
} from "@/lib/repositories/farm.repository.optimized";
import { decimalToNumber } from "@/lib/utils/decimal-converter";
import type { FarmStatus, FarmVerificationStatus } from "@prisma/client";

// ============================================================================
// MOCKS
// ============================================================================

// Mock the database singleton
jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock logger
jest.mock("@/lib/monitoring/logger", () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Create a raw farm list item from database (with Prisma types)
 */
function createRawFarmListItem(overrides: Partial<any> = {}) {
  return {
    id: "farm_123",
    name: "Green Valley Farm",
    slug: "green-valley-farm",
    city: "Portland",
    state: "OR",
    country: "USA",
    description: "Organic vegetables and sustainable farming",
    status: "ACTIVE" as FarmStatus,
    verificationStatus: "VERIFIED" as FarmVerificationStatus,
    latitude: { toNumber: () => 45.5231 },
    longitude: { toNumber: () => -122.6765 },
    logoUrl: "https://example.com/logo.jpg",
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    averageRating: { toNumber: () => 4.5 },
    reviewCount: 42,
    certificationsArray: ["ORGANIC", "NON_GMO"],
    createdAt: new Date("2024-01-01"),
    _count: {
      products: 25,
      reviews: 42,
    },
    ...overrides,
  };
}

/**
 * Create a raw farm detail from database (with Prisma types)
 */
function createRawFarmDetail(overrides: Partial<any> = {}) {
  return {
    id: "farm_123",
    name: "Green Valley Farm",
    slug: "green-valley-farm",
    description: "Organic vegetables and sustainable farming",
    story: "Our farm has been family-owned for three generations...",
    city: "Portland",
    state: "OR",
    country: "USA",
    zipCode: "97201",
    address: "123 Farm Lane",
    latitude: { toNumber: () => 45.5231 },
    longitude: { toNumber: () => -122.6765 },
    phone: "+15035551234",
    email: "info@greenvalley.com",
    website: "https://greenvalley.com",
    status: "ACTIVE" as FarmStatus,
    verificationStatus: "VERIFIED" as FarmVerificationStatus,
    certificationsArray: ["ORGANIC", "NON_GMO"],
    farmingPractices: ["ORGANIC", "PERMACULTURE"],
    farmSize: { toNumber: () => 50.5 },
    yearEstablished: 1985,
    logoUrl: "https://example.com/logo.jpg",
    bannerUrl: "https://example.com/banner.jpg",
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    averageRating: { toNumber: () => 4.5 },
    reviewCount: 42,
    totalOrdersCount: 150,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    owner: {
      id: "user_123",
      name: "John Farmer",
      email: "john@greenvalley.com",
      avatar: "https://example.com/avatar.jpg",
    },
    photos: [
      {
        id: "photo_1",
        photoUrl: "https://example.com/photo1.jpg",
        caption: "Main field",
        sortOrder: 1,
      },
      {
        id: "photo_2",
        photoUrl: "https://example.com/photo2.jpg",
        caption: "Greenhouse",
        sortOrder: 2,
      },
    ],
    products: [
      {
        id: "product_1",
        name: "Organic Tomatoes",
        slug: "organic-tomatoes",
        price: { toNumber: () => 4.99 },
        unit: "lb",
        category: "VEGETABLES",
        quantityAvailable: 100,
        images: ["https://example.com/tomato.jpg"],
      },
      {
        id: "product_2",
        name: "Fresh Lettuce",
        slug: "fresh-lettuce",
        price: { toNumber: () => 3.49 },
        unit: "head",
        category: "VEGETABLES",
        quantityAvailable: 50,
        images: ["https://example.com/lettuce.jpg"],
      },
    ],
    _count: {
      products: 25,
      reviews: 42,
      orders: 150,
    },
    ...overrides,
  };
}

/**
 * Create expected optimized farm list item (after mapping)
 */
function createExpectedFarmListItem(
  overrides: Partial<OptimizedFarmListItem> = {},
): OptimizedFarmListItem {
  return {
    id: "farm_123",
    name: "Green Valley Farm",
    slug: "green-valley-farm",
    city: "Portland",
    state: "OR",
    country: "USA",
    description: "Organic vegetables and sustainable farming",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    latitude: 45.5231,
    longitude: -122.6765,
    logoUrl: "https://example.com/logo.jpg",
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    productsCount: 25,
    averageRating: 4.5,
    reviewsCount: 42,
    certifications: ["ORGANIC", "NON_GMO"],
    createdAt: new Date("2024-01-01"),
    ...overrides,
  };
}

// ============================================================================
// TESTS: DECIMAL CONVERSION
// ============================================================================

describe("OptimizedFarmRepository - Decimal Conversion", () => {
  it("should convert Decimal-like object to number correctly", () => {
    const decimal = { toNumber: () => 45.5231 };
    const result = decimalToNumber(decimal);
    expect(result).toBe(45.5231);
    expect(typeof result).toBe("number");
  });

  it("should handle null values", () => {
    const result = decimalToNumber(null);
    expect(result).toBeNull();
  });

  it("should handle undefined values", () => {
    const result = decimalToNumber(undefined);
    expect(result).toBeNull();
  });

  it("should handle zero values", () => {
    const decimal = { toNumber: () => 0 };
    const result = decimalToNumber(decimal);
    expect(result).toBe(0);
  });

  it("should handle negative values", () => {
    const decimal = { toNumber: () => -122.6765 };
    const result = decimalToNumber(decimal);
    expect(result).toBe(-122.6765);
  });

  it("should handle large values", () => {
    const decimal = { toNumber: () => 9999999.99 };
    const result = decimalToNumber(decimal);
    expect(result).toBe(9999999.99);
  });
});

// ============================================================================
// TESTS: FIND BY ID OPTIMIZED
// ============================================================================

describe("OptimizedFarmRepository - findByIdOptimized", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and map farm detail by ID", async () => {
    const rawFarm = createRawFarmDetail();

    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      rawFarm,
    );

    const result = await optimizedFarmRepository.findByIdOptimized("farm_123");

    expect(database.farm.findUnique).toHaveBeenCalledWith({
      where: { id: "farm_123" },
      select: expect.objectContaining({
        id: true,
        name: true,
        slug: true,
      }),
    });

    expect(result).toBeDefined();
    expect(result?.id).toBe("farm_123");
    expect(result?.name).toBe("Green Valley Farm");
    expect(result?.latitude).toBe(45.5231);
    expect(result?.longitude).toBe(-122.6765);
    expect(result?.averageRating).toBe(4.5);
    expect(typeof result?.latitude).toBe("number");
  });

  it("should return null when farm not found", async () => {
    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      null,
    );

    const result =
      await optimizedFarmRepository.findByIdOptimized("nonexistent");

    expect(result).toBeNull();
  });

  it("should map owner data correctly", async () => {
    const rawFarm = createRawFarmDetail();

    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      rawFarm,
    );

    const result = await optimizedFarmRepository.findByIdOptimized("farm_123");

    expect(result?.owner).toEqual({
      id: "user_123",
      name: "John Farmer",
      email: "john@greenvalley.com",
      avatar: "https://example.com/avatar.jpg",
    });
  });

  it("should map photos array correctly", async () => {
    const rawFarm = createRawFarmDetail();

    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      rawFarm,
    );

    const result = await optimizedFarmRepository.findByIdOptimized("farm_123");

    expect(result?.photos).toHaveLength(2);
    expect(result?.photos[0]).toEqual({
      id: "photo_1",
      photoUrl: "https://example.com/photo1.jpg",
      caption: "Main field",
      sortOrder: 1,
    });
  });

  it("should map recent products with price conversion", async () => {
    const rawFarm = createRawFarmDetail();

    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      rawFarm,
    );

    const result = await optimizedFarmRepository.findByIdOptimized("farm_123");

    expect(result?.recentProducts).toHaveLength(2);
    expect(result?.recentProducts[0].price).toBe(4.99);
    expect(typeof result?.recentProducts[0].price).toBe("number");
    expect(result?.recentProducts[0].quantityAvailable).toBe(100);
  });

  it("should map stats correctly", async () => {
    const rawFarm = createRawFarmDetail();

    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      rawFarm,
    );

    const result = await optimizedFarmRepository.findByIdOptimized("farm_123");

    expect(result?.stats).toEqual({
      productsCount: 25,
      reviewsCount: 42,
      ordersCount: 150,
    });
  });
});

// ============================================================================
// TESTS: FIND BY SLUG OPTIMIZED
// ============================================================================

describe("OptimizedFarmRepository - findBySlugOptimized", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch farm by slug", async () => {
    const rawFarm = createRawFarmDetail();

    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      rawFarm,
    );

    const result =
      await optimizedFarmRepository.findBySlugOptimized("green-valley-farm");

    expect(database.farm.findUnique).toHaveBeenCalledWith({
      where: { slug: "green-valley-farm" },
      select: expect.any(Object),
    });

    expect(result).toBeDefined();
    expect(result?.slug).toBe("green-valley-farm");
  });

  it("should return null for non-existent slug", async () => {
    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      null,
    );

    const result =
      await optimizedFarmRepository.findBySlugOptimized("nonexistent");

    expect(result).toBeNull();
  });
});

// ============================================================================
// TESTS: LIST FARMS OPTIMIZED
// ============================================================================

describe("OptimizedFarmRepository - listFarmsOptimized", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list farms with default pagination", async () => {
    const rawFarms = [
      createRawFarmListItem(),
      createRawFarmListItem({ id: "farm_456", name: "Sunny Acres" }),
    ];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(2);

    const result = await optimizedFarmRepository.listFarmsOptimized(
      {},
      { page: 1, pageSize: 20 },
    );

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
  });

  it("should calculate pagination correctly", async () => {
    const rawFarms = Array(15)
      .fill(null)
      .map((_, i) => createRawFarmListItem({ id: `farm_${i}` }));

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms.slice(0, 10),
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(15);

    const result = await optimizedFarmRepository.listFarmsOptimized(
      {},
      { page: 1, pageSize: 10 },
    );

    expect(result.items).toHaveLength(10);
    expect(result.total).toBe(15);
    expect(result.totalPages).toBe(2);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(false);
  });

  it("should handle page 2 pagination", async () => {
    const rawFarms = Array(5)
      .fill(null)
      .map((_, i) => createRawFarmListItem({ id: `farm_${i + 10}` }));

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(15);

    const result = await optimizedFarmRepository.listFarmsOptimized(
      {},
      { page: 2, pageSize: 10 },
    );

    expect(result.items).toHaveLength(5);
    expect(result.page).toBe(2);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(true);
  });

  it("should apply status filter", async () => {
    const rawFarms = [createRawFarmListItem()];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const filters: FarmSearchFilters = { status: "ACTIVE" };

    await optimizedFarmRepository.listFarmsOptimized(filters, {
      page: 1,
      pageSize: 20,
    });

    expect(database.farm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "ACTIVE",
        }),
      }),
    );
  });

  it("should apply search filter", async () => {
    const rawFarms = [createRawFarmListItem()];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const filters: FarmSearchFilters = { search: "green" };

    await optimizedFarmRepository.listFarmsOptimized(filters, {
      page: 1,
      pageSize: 20,
    });

    expect(database.farm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              name: { contains: "green", mode: "insensitive" },
            }),
          ]),
        }),
      }),
    );
  });

  it("should map list items correctly", async () => {
    const rawFarms = [createRawFarmListItem()];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const result = await optimizedFarmRepository.listFarmsOptimized(
      {},
      { page: 1, pageSize: 20 },
    );

    const item = result.items[0];
    expect(item.id).toBe("farm_123");
    expect(item.name).toBe("Green Valley Farm");
    expect(item.latitude).toBe(45.5231);
    expect(typeof item.latitude).toBe("number");
    expect(item.productsCount).toBe(25);
    expect(item.reviewsCount).toBe(42);
  });
});

// ============================================================================
// TESTS: SEARCH FARMS OPTIMIZED
// ============================================================================

describe("OptimizedFarmRepository - searchFarmsOptimized", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should search farms with query", async () => {
    const rawFarms = [createRawFarmListItem()];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const result = await optimizedFarmRepository.searchFarmsOptimized(
      "organic",
      { page: 1, pageSize: 20 },
    );

    expect(database.farm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.any(Array),
            }),
          ]),
        }),
      }),
    );

    expect(result.items).toHaveLength(1);
  });

  it("should include status filter in search", async () => {
    const rawFarms = [createRawFarmListItem()];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    await optimizedFarmRepository.searchFarmsOptimized("organic", {
      page: 1,
      pageSize: 20,
    });

    expect(database.farm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              status: "ACTIVE",
            }),
          ]),
        }),
      }),
    );
  });
});

// ============================================================================
// TESTS: FIND NEAR LOCATION OPTIMIZED
// ============================================================================

describe("OptimizedFarmRepository - findNearLocationOptimized", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should find farms near location", async () => {
    const rawFarms = [createRawFarmListItem()];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const result = await optimizedFarmRepository.findNearLocationOptimized(
      45.5231,
      -122.6765,
      50,
      { page: 1, pageSize: 20 },
    );

    expect(database.farm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "ACTIVE",
          latitude: expect.objectContaining({
            gte: expect.any(Number),
            lte: expect.any(Number),
          }),
          longitude: expect.objectContaining({
            gte: expect.any(Number),
            lte: expect.any(Number),
          }),
        }),
      }),
    );

    expect(result.items).toHaveLength(1);
  });

  it("should calculate bounding box correctly", async () => {
    const rawFarms = [createRawFarmListItem()];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const latitude = 45.5231;
    const longitude = -122.6765;
    const radiusKm = 50;

    await optimizedFarmRepository.findNearLocationOptimized(
      latitude,
      longitude,
      radiusKm,
      { page: 1, pageSize: 20 },
    );

    const mockCall = (database.farm.findMany as jest.MockedFunction<any>).mock
      .calls[0][0];
    const where = mockCall.where;

    expect(where.latitude.gte).toBeLessThan(latitude);
    expect(where.latitude.lte).toBeGreaterThan(latitude);
    expect(where.longitude.gte).toBeLessThan(longitude);
    expect(where.longitude.lte).toBeGreaterThan(longitude);
  });
});

// ============================================================================
// TESTS: FIND BY OWNER ID OPTIMIZED
// ============================================================================

describe("OptimizedFarmRepository - findByOwnerIdOptimized", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should find farms by owner ID", async () => {
    const rawFarms = [
      createRawFarmListItem(),
      createRawFarmListItem({ id: "farm_456" }),
    ];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(2);

    const result = await optimizedFarmRepository.findByOwnerIdOptimized(
      "user_123",
      { page: 1, pageSize: 20 },
    );

    expect(database.farm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: "user_123" },
      }),
    );

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });
});

// ============================================================================
// TESTS: FIND VERIFIED ACTIVE FARMS OPTIMIZED
// ============================================================================

describe("OptimizedFarmRepository - findVerifiedActiveFarmsOptimized", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should find verified active farms", async () => {
    const rawFarms = [createRawFarmListItem()];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const result =
      await optimizedFarmRepository.findVerifiedActiveFarmsOptimized({
        page: 1,
        pageSize: 10,
      });

    expect(database.farm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
        },
        orderBy: { averageRating: "desc" },
      }),
    );

    expect(result.items).toHaveLength(1);
  });

  it("should order by rating descending", async () => {
    const rawFarms = [
      createRawFarmListItem({ averageRating: { toNumber: () => 4.8 } }),
      createRawFarmListItem({ averageRating: { toNumber: () => 4.2 } }),
    ];

    (database.farm.findMany as jest.MockedFunction<any>).mockResolvedValue(
      rawFarms,
    );
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(2);

    await optimizedFarmRepository.findVerifiedActiveFarmsOptimized({
      page: 1,
      pageSize: 10,
    });

    expect(database.farm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { averageRating: "desc" },
      }),
    );
  });
});

// ============================================================================
// TESTS: GET FARM STATS
// ============================================================================

describe("OptimizedFarmRepository - getFarmStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get farm statistics", async () => {
    const rawFarm = {
      averageRating: { toNumber: () => 4.5 },
      totalRevenueUSD: { toNumber: () => 15000.5 },
      _count: {
        products: 25,
        reviews: 42,
        orders: 150,
      },
    };

    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      rawFarm,
    );

    const result = await optimizedFarmRepository.getFarmStats("farm_123");

    expect(result.productsCount).toBe(25);
    expect(result.reviewsCount).toBe(42);
    expect(result.ordersCount).toBe(150);
    expect(result.averageRating).toBe(4.5);
    expect(result.totalRevenue).toBe(15000.5);
  });

  it("should return null if farm not found", async () => {
    (database.farm.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      null,
    );

    const result = await optimizedFarmRepository.getFarmStats("nonexistent");
    expect(result).toBeNull();
  });
});

// ============================================================================
// TESTS: EXISTS BY SLUG
// ============================================================================

describe("OptimizedFarmRepository - existsBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if slug exists", async () => {
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const result =
      await optimizedFarmRepository.existsBySlug("green-valley-farm");

    expect(result).toBe(true);
    expect(database.farm.count).toHaveBeenCalledWith({
      where: { slug: "green-valley-farm" },
    });
  });

  it("should return false if slug does not exist", async () => {
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(0);

    const result =
      await optimizedFarmRepository.existsBySlug("nonexistent-slug");

    expect(result).toBe(false);
  });
});

// ============================================================================
// TESTS: EXISTS BY ID
// ============================================================================

describe("OptimizedFarmRepository - existsById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if ID exists", async () => {
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(1);

    const result = await optimizedFarmRepository.existsById("farm_123");

    expect(result).toBe(true);
    expect(database.farm.count).toHaveBeenCalledWith({
      where: { id: "farm_123" },
    });
  });

  it("should return false if ID does not exist", async () => {
    (database.farm.count as jest.MockedFunction<any>).mockResolvedValue(0);

    const result = await optimizedFarmRepository.existsById("nonexistent");

    expect(result).toBe(false);
  });
});
