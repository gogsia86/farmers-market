/**
 * 🧪 ENHANCED FARM SERVICE UNIT TESTS
 *
 * Comprehensive test suite for EnhancedBiodynamicFarmService
 * Phase 3: Service layer integration testing
 *
 * Features Tested:
 * - Farm creation with validation
 * - Optimized read operations (getFarmById, listFarms, searchFarms, etc.)
 * - Update and delete operations
 * - Verification workflow (approve/reject)
 * - Authorization (verifyFarmOwnership)
 * - Validation logic (validateFarmData, generateUniqueSlug)
 * - Error handling and custom errors
 *
 * Patterns Demonstrated:
 * - Repository mocking (optimized + standard)
 * - Async testing with proper error handling
 * - Type-safe mocks
 * - Input validation testing
 * - Authorization testing
 *
 * @reference .cursorrules - Testing Patterns (Claude Sonnet 4.5)
 * @reference PHASE_3_TASK_2_COMPLETE.md - Implementation details
 */

import {
  enhancedFarmService,
  FarmValidationError,
  type CreateFarmRequest,
  type UpdateFarmRequest,
} from "@/lib/services/farm.service.enhanced";
import type { Farm } from "@prisma/client";

// ============================================================================
// MOCKS
// ============================================================================

// Mock the standard farm repository (for writes)
jest.mock("@/lib/repositories/farm.repository", () => ({
  farmRepository: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    count: jest.fn(),
  },
}));

// Mock the optimized farm repository (for reads)
jest.mock("@/lib/repositories/farm.repository.optimized", () => ({
  optimizedFarmRepository: {
    findByIdOptimized: jest.fn(),
    findBySlugOptimized: jest.fn(),
    listFarmsOptimized: jest.fn(),
    searchFarmsOptimized: jest.fn(),
    findNearLocationOptimized: jest.fn(),
    findByOwnerIdOptimized: jest.fn(),
    findVerifiedActiveFarmsOptimized: jest.fn(),
    getFarmStats: jest.fn(),
    existsBySlug: jest.fn(),
    existsById: jest.fn(),
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

// Mock nanoid
jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "test-request-id-123"),
}));

// Import mocked repositories after mocks are defined
import { farmRepository } from "@/lib/repositories/farm.repository";
import { optimizedFarmRepository } from "@/lib/repositories/farm.repository.optimized";

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Create a mock farm object
 */
function createMockFarm(overrides: Partial<Farm> = {}): Farm {
  return {
    id: "farm_123",
    name: "Green Valley Farm",
    slug: "green-valley-farm",
    description: "Organic vegetables and sustainable farming",
    story: "Founded in 2010",
    address: "123 Farm Road",
    city: "Portland",
    state: "OR",
    zipCode: "97201",
    country: "USA",
    latitude: 45.5231,
    longitude: -122.6765,
    phone: "+15035551234",
    email: "info@greenvalley.farm",
    website: "https://greenvalley.farm",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    certificationsArray: ["ORGANIC", "NON_GMO"],
    farmingPractices: ["ORGANIC", "PERMACULTURE"],
    deliveryRadius: 25,
    businessName: "Green Valley Farms LLC",
    taxId: "12-3456789",
    businessType: "LLC",
    yearEstablished: 2010,
    farmSize: 50,
    logoUrl: "https://example.com/logo.jpg",
    bannerUrl: "https://example.com/banner.jpg",
    images: ["https://example.com/img1.jpg"],
    averageRating: 4.5,
    reviewCount: 42,
    totalOrdersCount: 150,
    totalRevenueUSD: 15000.5,
    ownerId: "user_123",
    verifiedAt: new Date("2024-01-10"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    location: null,
    ...overrides,
  } as Farm;
}

/**
 * Create a mock optimized farm list item
 */
function createMockOptimizedFarmListItem(overrides: any = {}) {
  return {
    id: "farm_123",
    name: "Green Valley Farm",
    slug: "green-valley-farm",
    city: "Portland",
    state: "OR",
    country: "USA",
    description: "Organic vegetables",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    latitude: 45.5231,
    longitude: -122.6765,
    logoUrl: "https://example.com/logo.jpg",
    images: ["https://example.com/img1.jpg"],
    productsCount: 25,
    averageRating: 4.5,
    reviewsCount: 42,
    certifications: ["ORGANIC"],
    createdAt: new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Create a mock optimized farm detail
 */
function createMockOptimizedFarmDetail(overrides: any = {}) {
  return {
    ...createMockOptimizedFarmListItem(),
    story: "Founded in 2010",
    zipCode: "97201",
    address: "123 Farm Road",
    phone: "+15035551234",
    email: "info@greenvalley.farm",
    website: "https://greenvalley.farm",
    farmingPractices: ["ORGANIC"],
    farmSize: 50,
    yearEstablished: 2010,
    bannerUrl: "https://example.com/banner.jpg",
    reviewCount: 42,
    totalOrdersCount: 150,
    updatedAt: new Date("2024-01-15"),
    owner: {
      id: "user_123",
      name: "John Farmer",
      email: "john@greenvalley.farm",
      avatar: "https://example.com/avatar.jpg",
    },
    photos: [],
    recentProducts: [],
    stats: {
      productsCount: 25,
      reviewsCount: 42,
      ordersCount: 150,
    },
    ...overrides,
  };
}

/**
 * Create a valid farm creation request
 */
function createValidFarmRequest(
  overrides: Partial<CreateFarmRequest> = {},
): CreateFarmRequest {
  return {
    name: "Green Valley Farm",
    description: "Organic vegetables and sustainable farming practices",
    address: "123 Farm Road",
    city: "Portland",
    state: "OR",
    zipCode: "97201",
    country: "USA",
    latitude: 45.5231,
    longitude: -122.6765,
    phone: "+15035551234",
    email: "info@greenvalley.farm",
    website: "https://greenvalley.farm",
    certificationsArray: ["ORGANIC"],
    farmingPractices: ["ORGANIC"],
    yearEstablished: 2010,
    farmSize: 50,
    ownerId: "user_123",
    ...overrides,
  };
}

// ============================================================================
// TESTS: CREATE FARM
// ============================================================================

describe("EnhancedFarmService - createFarm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a farm with valid data", async () => {
    const request = createValidFarmRequest();
    const mockFarm = createMockFarm();

    (
      optimizedFarmRepository.existsBySlug as jest.MockedFunction<any>
    ).mockResolvedValue(false);
    (farmRepository.create as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    const result = await enhancedFarmService.createFarm(request);

    expect(farmRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: request.name,
        description: request.description,
        status: "PENDING",
      }),
    );

    expect(result).toEqual(mockFarm);
    expect(result.id).toBe("farm_123");
  });

  it("should generate unique slug from farm name", async () => {
    const request = createValidFarmRequest({ name: "Green Valley Farm!" });
    const mockFarm = createMockFarm();

    (
      optimizedFarmRepository.existsBySlug as jest.MockedFunction<any>
    ).mockResolvedValue(false);
    (farmRepository.create as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    await enhancedFarmService.createFarm(request);

    expect(farmRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: expect.stringMatching(/^green-valley-farm/),
      }),
    );
  });

  it("should use provided slug if valid", async () => {
    const request = createValidFarmRequest({ slug: "custom-slug" });
    const mockFarm = createMockFarm();

    (
      optimizedFarmRepository.existsBySlug as jest.MockedFunction<any>
    ).mockResolvedValue(false);
    (farmRepository.create as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    await enhancedFarmService.createFarm(request);

    expect(farmRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "custom-slug",
      }),
    );
  });

  it("should throw validation error for short name", async () => {
    const request = createValidFarmRequest({ name: "AB" });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      FarmValidationError,
    );

    expect(farmRepository.create).not.toHaveBeenCalled();
  });

  it("should throw validation error for invalid email", async () => {
    const request = createValidFarmRequest({ email: "invalid-email" });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      FarmValidationError,
    );

    expect(farmRepository.create).not.toHaveBeenCalled();
  });

  it("should throw validation error for invalid latitude", async () => {
    const request = createValidFarmRequest({ latitude: 100 });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      FarmValidationError,
    );
  });

  it("should throw validation error for invalid longitude", async () => {
    const request = createValidFarmRequest({ longitude: -200 });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      FarmValidationError,
    );
  });

  it("should set default status to PENDING", async () => {
    const request = createValidFarmRequest();
    const mockFarm = createMockFarm();

    (
      optimizedFarmRepository.existsBySlug as jest.MockedFunction<any>
    ).mockResolvedValue(false);
    (farmRepository.create as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    await enhancedFarmService.createFarm(request);

    expect(farmRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "PENDING",
      }),
    );
  });

  it("should provide default values for optional fields", async () => {
    const request = createValidFarmRequest({
      latitude: undefined,
      longitude: undefined,
      phone: undefined,
      email: undefined,
    });
    const mockFarm = createMockFarm();

    (
      optimizedFarmRepository.existsBySlug as jest.MockedFunction<any>
    ).mockResolvedValue(false);
    (farmRepository.create as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    await enhancedFarmService.createFarm(request);

    expect(farmRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 0,
        longitude: 0,
        phone: "",
        email: "",
      }),
    );
  });
});

// ============================================================================
// TESTS: GET FARM BY ID
// ============================================================================

describe("EnhancedFarmService - getFarmById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch farm by ID using optimized repository", async () => {
    const mockFarm = createMockOptimizedFarmDetail();

    (
      optimizedFarmRepository.findByIdOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockFarm);

    const result = await enhancedFarmService.getFarmById("farm_123");

    expect(optimizedFarmRepository.findByIdOptimized).toHaveBeenCalledWith(
      "farm_123",
    );
    expect(result).toEqual(mockFarm);
  });

  it("should return null when farm not found", async () => {
    (
      optimizedFarmRepository.findByIdOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(null);

    const result = await enhancedFarmService.getFarmById("nonexistent");

    expect(result).toBeNull();
  });
});

// ============================================================================
// TESTS: GET FARM BY SLUG
// ============================================================================

describe("EnhancedFarmService - getFarmBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch farm by slug using optimized repository", async () => {
    const mockFarm = createMockOptimizedFarmDetail();

    (
      optimizedFarmRepository.findBySlugOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockFarm);

    const result = await enhancedFarmService.getFarmBySlug("green-valley-farm");

    expect(optimizedFarmRepository.findBySlugOptimized).toHaveBeenCalledWith(
      "green-valley-farm",
    );
    expect(result).toEqual(mockFarm);
  });

  it("should return null when slug not found", async () => {
    (
      optimizedFarmRepository.findBySlugOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(null);

    const result = await enhancedFarmService.getFarmBySlug("nonexistent");

    expect(result).toBeNull();
  });
});

// ============================================================================
// TESTS: LIST FARMS
// ============================================================================

describe("EnhancedFarmService - listFarms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list farms with default pagination", async () => {
    const mockResult = {
      items: [createMockOptimizedFarmListItem()],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };

    (
      optimizedFarmRepository.listFarmsOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockResult);

    const result = await enhancedFarmService.listFarms();

    expect(optimizedFarmRepository.listFarmsOptimized).toHaveBeenCalledWith(
      {},
      { page: 1, pageSize: 20 },
    );
    expect(result).toEqual(mockResult);
  });

  it("should apply filters", async () => {
    const mockResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };

    (
      optimizedFarmRepository.listFarmsOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockResult);

    const filters = { status: "ACTIVE" as const, state: "OR" };

    await enhancedFarmService.listFarms(filters, { page: 1, pageSize: 20 });

    expect(optimizedFarmRepository.listFarmsOptimized).toHaveBeenCalledWith(
      filters,
      { page: 1, pageSize: 20 },
    );
  });
});

// ============================================================================
// TESTS: SEARCH FARMS
// ============================================================================

describe("EnhancedFarmService - searchFarms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should search farms with query", async () => {
    const mockResult = {
      items: [createMockOptimizedFarmListItem()],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };

    (
      optimizedFarmRepository.searchFarmsOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockResult);

    const result = await enhancedFarmService.searchFarms("organic");

    expect(optimizedFarmRepository.searchFarmsOptimized).toHaveBeenCalledWith(
      "organic",
      { page: 1, pageSize: 20 },
    );
    expect(result).toEqual(mockResult);
  });

  it("should support custom pagination", async () => {
    const mockResult = {
      items: [],
      total: 0,
      page: 2,
      pageSize: 10,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };

    (
      optimizedFarmRepository.searchFarmsOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockResult);

    await enhancedFarmService.searchFarms("test", { page: 2, pageSize: 10 });

    expect(optimizedFarmRepository.searchFarmsOptimized).toHaveBeenCalledWith(
      "test",
      { page: 2, pageSize: 10 },
    );
  });
});

// ============================================================================
// TESTS: FIND FARMS NEAR LOCATION
// ============================================================================

describe("EnhancedFarmService - findFarmsNearLocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should find farms near location", async () => {
    const mockResult = {
      items: [createMockOptimizedFarmListItem()],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };

    (
      optimizedFarmRepository.findNearLocationOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockResult);

    const result = await enhancedFarmService.findFarmsNearLocation(
      45.5231,
      -122.6765,
    );

    expect(
      optimizedFarmRepository.findNearLocationOptimized,
    ).toHaveBeenCalledWith(45.5231, -122.6765, 50, { page: 1, pageSize: 20 });
    expect(result).toEqual(mockResult);
  });

  it("should support custom radius", async () => {
    const mockResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };

    (
      optimizedFarmRepository.findNearLocationOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockResult);

    await enhancedFarmService.findFarmsNearLocation(45.5231, -122.6765, 100);

    expect(
      optimizedFarmRepository.findNearLocationOptimized,
    ).toHaveBeenCalledWith(45.5231, -122.6765, 100, { page: 1, pageSize: 20 });
  });
});

// ============================================================================
// TESTS: GET FEATURED FARMS
// ============================================================================

describe("EnhancedFarmService - getFeaturedFarms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get featured farms", async () => {
    const mockResult = {
      items: [createMockOptimizedFarmListItem()],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };

    (
      optimizedFarmRepository.findVerifiedActiveFarmsOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockResult);

    const result = await enhancedFarmService.getFeaturedFarms();

    expect(
      optimizedFarmRepository.findVerifiedActiveFarmsOptimized,
    ).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });
    expect(result).toEqual(mockResult.items);
  });

  it("should support custom limit", async () => {
    const mockResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 5,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };

    (
      optimizedFarmRepository.findVerifiedActiveFarmsOptimized as jest.MockedFunction<any>
    ).mockResolvedValue(mockResult);

    await enhancedFarmService.getFeaturedFarms(5);

    expect(
      optimizedFarmRepository.findVerifiedActiveFarmsOptimized,
    ).toHaveBeenCalledWith({
      page: 1,
      pageSize: 5,
    });
  });
});

// ============================================================================
// TESTS: UPDATE FARM
// ============================================================================

describe("EnhancedFarmService - updateFarm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update farm with valid data", async () => {
    const updates: UpdateFarmRequest = {
      name: "Updated Farm Name",
      description: "Updated description with more than 10 characters",
    };
    const mockFarm = createMockFarm(updates);

    (farmRepository.update as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    const result = await enhancedFarmService.updateFarm("farm_123", updates);

    expect(farmRepository.update).toHaveBeenCalledWith(
      "farm_123",
      expect.objectContaining({
        name: updates.name,
        description: updates.description,
        updatedAt: expect.any(Date),
      }),
    );
    expect(result).toEqual(mockFarm);
  });

  it("should validate update data", async () => {
    const updates: UpdateFarmRequest = {
      name: "AB", // Too short
    };

    await expect(
      enhancedFarmService.updateFarm("farm_123", updates),
    ).rejects.toThrow(FarmValidationError);

    expect(farmRepository.update).not.toHaveBeenCalled();
  });
});

// ============================================================================
// TESTS: DELETE FARM
// ============================================================================

describe("EnhancedFarmService - deleteFarm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should soft delete farm by setting status to INACTIVE", async () => {
    const mockFarm = createMockFarm({ status: "INACTIVE" });

    (farmRepository.update as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    await enhancedFarmService.deleteFarm("farm_123");

    expect(farmRepository.update).toHaveBeenCalledWith(
      "farm_123",
      expect.objectContaining({
        status: "INACTIVE",
        updatedAt: expect.any(Date),
      }),
    );
  });
});

// ============================================================================
// TESTS: APPROVE FARM
// ============================================================================

describe("EnhancedFarmService - approveFarm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should approve farm and set verification status", async () => {
    const mockFarm = createMockFarm({
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
    });

    (farmRepository.update as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    const result = await enhancedFarmService.approveFarm(
      "farm_123",
      "admin_123",
    );

    expect(farmRepository.update).toHaveBeenCalledWith(
      "farm_123",
      expect.objectContaining({
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        verifiedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
    expect(result.status).toBe("ACTIVE");
    expect(result.verificationStatus).toBe("VERIFIED");
  });
});

// ============================================================================
// TESTS: REJECT FARM
// ============================================================================

describe("EnhancedFarmService - rejectFarm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject farm and set status to PENDING", async () => {
    const mockFarm = createMockFarm({
      status: "PENDING",
      verificationStatus: "REJECTED",
    });

    (farmRepository.update as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    const result = await enhancedFarmService.rejectFarm(
      "farm_123",
      "Incomplete information",
    );

    expect(farmRepository.update).toHaveBeenCalledWith(
      "farm_123",
      expect.objectContaining({
        status: "PENDING",
        verificationStatus: "REJECTED",
        updatedAt: expect.any(Date),
      }),
    );
    expect(result.status).toBe("PENDING");
    expect(result.verificationStatus).toBe("REJECTED");
  });
});

// ============================================================================
// TESTS: VERIFY FARM OWNERSHIP
// ============================================================================

describe("EnhancedFarmService - verifyFarmOwnership", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true for farm owner", async () => {
    const mockFarm = createMockFarm({ ownerId: "user_123" });

    (farmRepository.findById as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    const result = await enhancedFarmService.verifyFarmOwnership(
      "farm_123",
      "user_123",
    );

    expect(result).toBe(true);
  });

  it("should return false for non-owner", async () => {
    const mockFarm = createMockFarm({ ownerId: "user_123" });

    (farmRepository.findById as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    const result = await enhancedFarmService.verifyFarmOwnership(
      "farm_123",
      "user_456",
    );

    expect(result).toBe(false);
  });

  it("should return false when farm not found", async () => {
    (farmRepository.findById as jest.MockedFunction<any>).mockResolvedValue(
      null,
    );

    const result = await enhancedFarmService.verifyFarmOwnership(
      "nonexistent",
      "user_123",
    );

    expect(result).toBe(false);
  });
});

// ============================================================================
// TESTS: VALIDATION - validateFarmData
// ============================================================================

describe("EnhancedFarmService - Input Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should accept valid farm name", async () => {
    const request = createValidFarmRequest({ name: "Valid Farm Name" });
    const mockFarm = createMockFarm();

    (
      optimizedFarmRepository.existsBySlug as jest.MockedFunction<any>
    ).mockResolvedValue(false);
    (farmRepository.create as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    await expect(
      enhancedFarmService.createFarm(request),
    ).resolves.toBeDefined();
  });

  it("should reject farm name that is too short", async () => {
    const request = createValidFarmRequest({ name: "AB" });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      "Farm name must be at least 3 characters",
    );
  });

  it("should reject farm name that is too long", async () => {
    const request = createValidFarmRequest({ name: "A".repeat(101) });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      "Farm name must not exceed 100 characters",
    );
  });

  it("should reject description that is too short", async () => {
    const request = createValidFarmRequest({ description: "Short" });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      "Description must be at least 10 characters",
    );
  });

  it("should reject invalid email format", async () => {
    const request = createValidFarmRequest({ email: "not-an-email" });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      "Invalid email address",
    );
  });

  it("should accept valid email format", async () => {
    const request = createValidFarmRequest({ email: "test@example.com" });
    const mockFarm = createMockFarm();

    (
      optimizedFarmRepository.existsBySlug as jest.MockedFunction<any>
    ).mockResolvedValue(false);
    (farmRepository.create as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    await expect(
      enhancedFarmService.createFarm(request),
    ).resolves.toBeDefined();
  });

  it("should reject invalid phone format", async () => {
    const request = createValidFarmRequest({ phone: "123" });

    await expect(enhancedFarmService.createFarm(request)).rejects.toThrow(
      "Invalid phone number format",
    );
  });

  it("should accept valid phone format", async () => {
    const request = createValidFarmRequest({ phone: "+15035551234" });
    const mockFarm = createMockFarm();

    (
      optimizedFarmRepository.existsBySlug as jest.MockedFunction<any>
    ).mockResolvedValue(false);
    (farmRepository.create as jest.MockedFunction<any>).mockResolvedValue(
      mockFarm,
    );

    await expect(
      enhancedFarmService.createFarm(request),
    ).resolves.toBeDefined();
  });
});

// ============================================================================
// TESTS: ERROR HANDLING
// ============================================================================

describe("EnhancedFarmService - Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle database errors gracefully", async () => {
    (
      optimizedFarmRepository.findByIdOptimized as jest.MockedFunction<any>
    ).mockRejectedValue(new Error("Database connection failed"));

    await expect(enhancedFarmService.getFarmById("farm_123")).rejects.toThrow(
      "Database connection failed",
    );
  });

  it("should throw FarmValidationError with field info", async () => {
    const request = createValidFarmRequest({ name: "AB" });

    try {
      await enhancedFarmService.createFarm(request);
      fail("Should have thrown FarmValidationError");
    } catch (error) {
      expect(error).toBeInstanceOf(FarmValidationError);
      expect((error as FarmValidationError).field).toBe("name");
    }
  });
});
