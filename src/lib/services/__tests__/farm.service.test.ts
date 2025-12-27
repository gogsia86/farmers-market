/**
 * 🧪 FARM SERVICE UNIT TESTS - SERVICE RESPONSE EDITION
 *
 * Comprehensive unit tests for FarmService with ServiceResponse pattern.
 * Tests business logic, validation, caching, error handling, and agricultural consciousness.
 *
 * @pattern Divine Testing with ServiceResponse Types
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 * @reference .github/instructions/15_KILO_CODE_DIVINE_INTEGRATION.instructions.md
 */

import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from "@/lib/errors";

// ============================================================================
// MOCK SETUP - Must be defined before imports
// ============================================================================

// Create the mock span factory
const createMockSpan = () => ({
  setAttribute: jest.fn(),
  setAttributes: jest.fn(),
  setStatus: jest.fn(),
  end: jest.fn(),
  recordException: jest.fn(),
  addEvent: jest.fn(),
});

// Mock the service-tracer module
const mockTraceServiceOperation = jest.fn();
const mockAddSpanEvent = jest.fn();
const mockSetSpanAttributes = jest.fn();

jest.mock("@/lib/tracing/service-tracer", () => ({
  traceServiceOperation: (...args: any[]) => mockTraceServiceOperation(...args),
  traceDatabaseOperation: jest.fn(),
  traceCacheOperation: jest.fn(),
  createChildSpan: jest.fn(),
  addAgriculturalContext: jest.fn(),
  addSpanEvent: (...args: any[]) => mockAddSpanEvent(...args),
  setSpanAttributes: (...args: any[]) => mockSetSpanAttributes(...args),
  recordSpanException: jest.fn(),
  measureOperation: jest.fn(),
}));

// Mock repository with all methods
const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  manifestFarm: jest.fn(),
  findBySlug: jest.fn(),
  findByOwnerId: jest.fn(),
  findActiveWithProducts: jest.fn(),
  findNearLocation: jest.fn(),
  isSlugAvailable: jest.fn(),
  findByCity: jest.fn(),
  findByState: jest.fn(),
  findByFarmingPractices: jest.fn(),
  searchFarms: jest.fn(),
  updateStatus: jest.fn(),
};

// Mock cache functions
const mockCache = {
  getFarm: jest.fn(),
  cacheFarm: jest.fn(),
  invalidateFarm: jest.fn(),
  getProduct: jest.fn(),
  cacheProduct: jest.fn(),
  invalidateProduct: jest.fn(),
  cacheSeasonalData: jest.fn(),
  getSeasonalData: jest.fn(),
};

// Mock agricultural cache module
jest.mock("@/lib/cache/agricultural-cache", () => ({
  AgriculturalCache: mockCache,
}));

// Mock the farm repository module
jest.mock("@/lib/repositories/farm.repository", () => ({
  farmRepository: mockRepository,
  QuantumFarmRepository: jest.fn(),
}));

// Now import the service after mocks are set up
import { FarmService } from "../farm.service";
import type { CreateFarmRequest } from "../farm.service";

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const TEST_USER_ID = "test-user-id-123";
const TEST_FARM_ID = "farm-id-123";

const createValidFarmRequest = (
  overrides: Partial<CreateFarmRequest> = {},
): CreateFarmRequest => ({
  name: "Divine Acres Biodynamic Farm",
  address: "123 Farm Road",
  city: "Seattle",
  state: "WA",
  zipCode: "98101",
  latitude: 47.6062,
  longitude: -122.3321,
  description: "A beautiful organic farm practicing biodynamic methods",
  story: "Founded in 2020 with a vision for sustainable agriculture",
  businessName: "Divine Acres LLC",
  yearEstablished: 2020,
  farmSize: 50,
  email: "farm@divineacres.com",
  phone: "555-0123",
  website: "https://divineacres.com",
  farmingPractices: ["ORGANIC", "BIODYNAMIC"],
  productCategories: ["VEGETABLES", "FRUITS"],
  deliveryRadius: 50,
  ...overrides,
});

const createMockFarm = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: TEST_FARM_ID,
  name: "Divine Acres Biodynamic Farm",
  slug: "divine-acres-biodynamic-farm-seattle",
  description: "A beautiful organic farm",
  story: "Founded in 2020",
  businessName: "Divine Acres LLC",
  address: "123 Farm Road",
  city: "Seattle",
  state: "WA",
  zipCode: "98101",
  country: "US",
  latitude: 47.6062,
  longitude: -122.3321,
  email: "farm@divineacres.com",
  phone: "555-0123",
  website: "https://divineacres.com",
  yearEstablished: 2020,
  farmSize: 50,
  farmingPractices: ["ORGANIC", "BIODYNAMIC"],
  productCategories: ["VEGETABLES", "FRUITS"],
  deliveryRadius: 50,
  status: "PENDING",
  verificationStatus: "PENDING",
  stripeOnboarded: false,
  payoutsEnabled: false,
  ownerId: TEST_USER_ID,
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  owner: {
    id: TEST_USER_ID,
    name: "Test Farmer",
    email: "farmer@test.com",
    image: null,
  },
  products: [],
  _count: { products: 0, orders: 0 },
  ...overrides,
});

// ============================================================================
// TEST SUITES
// ============================================================================

describe("🚜 FarmService - Divine Agricultural Business Logic (ServiceResponse Edition)", () => {
  let farmService: FarmService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the traceServiceOperation mock to execute the callback and return result
    mockTraceServiceOperation.mockImplementation(
      async (
        _serviceName: any,
        _operationName: any,
        _attributes: any,
        fn: any,
      ) => {
        const span = createMockSpan();
        return await fn(span);
      },
    );

    // Create service with injected mock repository
    farmService = new FarmService(mockRepository as any);
  });

  // ==========================================================================
  // FARM CREATION TESTS
  // ==========================================================================
  describe("📦 Farm Creation (createFarm)", () => {
    beforeEach(() => {
      // Default setup for successful farm creation
      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockCache.invalidateFarm.mockResolvedValue(undefined);
    });

    it("should create a farm with valid data and return ServiceResponse", async () => {
      const farmRequest = createValidFarmRequest();
      const mockCreatedFarm = createMockFarm();

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      // Verify ServiceResponse structure
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.farm).toEqual(mockCreatedFarm);
      expect(response.data?.slug).toBeDefined();
      expect(response.meta?.message).toBe("Farm created successfully");
      expect(response.meta?.agricultural).toBeDefined();
      expect(response.meta?.agricultural?.consciousness).toBe("DIVINE");

      // Verify repository interactions
      expect(mockRepository.manifestFarm).toHaveBeenCalled();
      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(mockCreatedFarm.id);
    });

    it("should generate unique slug from farm name and city", async () => {
      const farmRequest = createValidFarmRequest({
        name: "Sunny Hills Farm",
        city: "Portland",
      });
      const mockCreatedFarm = createMockFarm({
        name: "Sunny Hills Farm",
        slug: "sunny-hills-farm-portland",
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.slug).toMatch(/sunny-hills-farm-portland/);
    });

    it("should return error response if user already has a farm", async () => {
      const farmRequest = createValidFarmRequest();
      const existingFarm = createMockFarm({ ownerId: TEST_USER_ID });

      mockRepository.findByOwnerId.mockResolvedValue([existingFarm]);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      // Verify error response structure
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe("RESOURCE_EXISTS");
      expect(response.error?.message).toContain("already has a farm");

      expect(mockRepository.manifestFarm).not.toHaveBeenCalled();
    });

    it("should return validation error if farm name is too short", async () => {
      const farmRequest = createValidFarmRequest({ name: "Ab" });

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
      expect(response.error?.message).toContain("at least 3 characters");

      expect(mockRepository.manifestFarm).not.toHaveBeenCalled();
    });

    it("should return validation error if userId is missing", async () => {
      const farmRequest = createValidFarmRequest();

      const response = await farmService.createFarm("", farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");

      expect(mockRepository.manifestFarm).not.toHaveBeenCalled();
    });

    it("should return validation error for invalid email format", async () => {
      const farmRequest = createValidFarmRequest({ email: "invalid-email" });

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
      expect(response.error?.message).toContain("Invalid email");

      expect(mockRepository.manifestFarm).not.toHaveBeenCalled();
    });

    it("should handle slug collision with retry", async () => {
      const farmRequest = createValidFarmRequest();
      const mockCreatedFarm = createMockFarm({
        slug: "divine-acres-biodynamic-farm-seattle-1",
      });

      // First slug is taken, second is available
      mockRepository.isSlugAvailable
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm).toEqual(mockCreatedFarm);
      expect(mockRepository.isSlugAvailable).toHaveBeenCalledTimes(2);
    });

    it("should set default status to PENDING for new farms", async () => {
      const farmRequest = createValidFarmRequest();
      const mockCreatedFarm = createMockFarm({ status: "PENDING" });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.status).toBe("PENDING");
    });

    it("should create farm with optional fields omitted", async () => {
      const minimalFarmRequest: CreateFarmRequest = {
        name: "Simple Farm",
        address: "123 Main St",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
        latitude: 45.5152,
        longitude: -122.6784,
      };

      const mockCreatedFarm = createMockFarm({
        name: "Simple Farm",
        description: null,
        website: null,
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(
        TEST_USER_ID,
        minimalFarmRequest,
      );

      expect(response.success).toBe(true);
      expect(response.data?.farm).toBeDefined();
      expect(mockRepository.manifestFarm).toHaveBeenCalled();
    });

    it("should return validation error for invalid latitude", async () => {
      const farmRequest = createValidFarmRequest({ latitude: 100 });

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
    });

    it("should return validation error for invalid longitude", async () => {
      const farmRequest = createValidFarmRequest({ longitude: 200 });

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
    });

    it("should return validation error for negative delivery radius", async () => {
      const farmRequest = createValidFarmRequest({ deliveryRadius: -10 });

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
    });

    it("should return conflict error when max slug attempts exceeded", async () => {
      const farmRequest = createValidFarmRequest();

      // All slug attempts fail
      mockRepository.isSlugAvailable.mockResolvedValue(false);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("RESOURCE_EXISTS");
      expect(mockRepository.isSlugAvailable).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // FARM RETRIEVAL TESTS
  // ==========================================================================
  describe("📖 Farm Retrieval", () => {
    describe("getFarmById", () => {
      it("should return farm by ID with ServiceResponse", async () => {
        const mockFarm = createMockFarm();

        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findById.mockResolvedValue(mockFarm);
        mockCache.cacheFarm.mockResolvedValue(undefined);

        const response = await farmService.getFarmById(TEST_FARM_ID);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockFarm);
        expect(response.meta?.message).toContain("retrieved successfully");
        expect(mockRepository.findById).toHaveBeenCalledWith(TEST_FARM_ID);
        expect(mockCache.cacheFarm).toHaveBeenCalled();
      });

      it("should return cached farm if available", async () => {
        const mockFarm = createMockFarm();

        mockCache.getFarm.mockResolvedValue(mockFarm);

        const response = await farmService.getFarmById(TEST_FARM_ID);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockFarm);
        expect(response.meta?.message).toContain("from cache");
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });

      it("should return null in success response for non-existent farm ID", async () => {
        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findById.mockResolvedValue(null);

        const response = await farmService.getFarmById("non-existent-id");

        expect(response.success).toBe(true);
        expect(response.data).toBeNull();
        expect(response.meta?.message).toContain("not found");
      });

      it("should cache the farm after fetching from repository", async () => {
        const mockFarm = createMockFarm();

        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findById.mockResolvedValue(mockFarm);

        await farmService.getFarmById(TEST_FARM_ID);

        expect(mockCache.cacheFarm).toHaveBeenCalledWith(
          TEST_FARM_ID,
          mockFarm,
        );
      });
    });

    describe("getFarmBySlug", () => {
      it("should return farm by slug with ServiceResponse", async () => {
        const mockFarm = createMockFarm();

        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findBySlug.mockResolvedValue(mockFarm);
        mockCache.cacheFarm.mockResolvedValue(undefined);

        const response = await farmService.getFarmBySlug(
          "divine-acres-biodynamic-farm-seattle",
        );

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockFarm);
        expect(mockRepository.findBySlug).toHaveBeenCalled();
      });

      it("should return cached farm by slug if available", async () => {
        const mockFarm = createMockFarm();

        mockCache.getFarm.mockResolvedValue(mockFarm);

        const response = await farmService.getFarmBySlug("test-slug");

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockFarm);
        expect(mockRepository.findBySlug).not.toHaveBeenCalled();
      });

      it("should return null in success response for non-existent slug", async () => {
        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findBySlug.mockResolvedValue(null);

        const response = await farmService.getFarmBySlug("non-existent-slug");

        expect(response.success).toBe(true);
        expect(response.data).toBeNull();
      });
    });

    describe("getFarmsByOwnerId", () => {
      it("should return farms owned by user with ServiceResponse", async () => {
        const mockFarms = [createMockFarm({ id: "farm-1" })];

        mockRepository.findByOwnerId.mockResolvedValue(mockFarms);

        const response = await farmService.getFarmsByOwnerId(TEST_USER_ID);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockFarms);
        expect(response.data).toHaveLength(1);
      });

      it("should return empty array if user has no farms", async () => {
        mockRepository.findByOwnerId.mockResolvedValue([]);

        const response = await farmService.getFarmsByOwnerId(TEST_USER_ID);

        expect(response.success).toBe(true);
        expect(response.data).toEqual([]);
      });
    });

    describe("getActiveFarmsWithProducts", () => {
      it("should return active farms with their products and agricultural metadata", async () => {
        const mockFarmsWithProducts = [
          createMockFarm({
            status: "ACTIVE",
            products: [{ id: "prod-1", name: "Tomatoes" }],
          }),
        ];

        mockRepository.findActiveWithProducts.mockResolvedValue(
          mockFarmsWithProducts,
        );

        const response = await farmService.getActiveFarmsWithProducts();

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockFarmsWithProducts);
        expect(response.meta?.agricultural).toBeDefined();
        expect(response.meta?.agricultural?.season).toBeDefined();
      });
    });

    describe("checkExistingFarm", () => {
      it("should return exists: true if user has a farm", async () => {
        const mockFarm = createMockFarm();

        mockRepository.findByOwnerId.mockResolvedValue([mockFarm]);

        const result = await farmService.checkExistingFarm(TEST_USER_ID);

        expect(result.exists).toBe(true);
        expect(result.farm?.id).toBe(mockFarm.id);
      });

      it("should return exists: false if user has no farm", async () => {
        mockRepository.findByOwnerId.mockResolvedValue([]);

        const result = await farmService.checkExistingFarm(TEST_USER_ID);

        expect(result.exists).toBe(false);
      });
    });
  });

  // ==========================================================================
  // FARM UPDATES TESTS
  // ==========================================================================
  describe("📝 Farm Updates", () => {
    it("should update farm with valid data and return ServiceResponse", async () => {
      const farmId = TEST_FARM_ID;
      const updateData = {
        name: "Updated Farm Name",
        description: "Updated description",
      };
      const existingFarm = createMockFarm({ id: farmId });
      const updatedFarm = createMockFarm({
        id: farmId,
        name: "Updated Farm Name",
        description: "Updated description",
      });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(updatedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const response = await farmService.updateFarm(
        farmId,
        TEST_USER_ID,
        updateData,
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updatedFarm);
      expect(response.meta?.message).toContain("updated successfully");
      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should return not found error when updating non-existent farm", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const response = await farmService.updateFarm(
        "non-existent-id",
        TEST_USER_ID,
        { name: "New Name" },
      );

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("NOT_FOUND");
    });

    it("should return forbidden error when user does not own the farm", async () => {
      const existingFarm = createMockFarm({ ownerId: "different-user-id" });

      mockRepository.findById.mockResolvedValue(existingFarm);

      const response = await farmService.updateFarm(
        TEST_FARM_ID,
        TEST_USER_ID,
        { name: "New Name" },
      );

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("FORBIDDEN_ACTION");
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should update partial farm data", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const updatedFarm = createMockFarm({
        id: farmId,
        phone: "555-9999",
      });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(updatedFarm);

      const response = await farmService.updateFarm(farmId, TEST_USER_ID, {
        phone: "555-9999",
      });

      expect(response.success).toBe(true);
      expect(response.data?.phone).toBe("555-9999");
    });

    it("should update farm location coordinates", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const updatedFarm = createMockFarm({
        id: farmId,
        latitude: 48.0,
        longitude: -123.0,
      });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(updatedFarm);

      const response = await farmService.updateFarm(farmId, TEST_USER_ID, {
        latitude: 48.0,
        longitude: -123.0,
      });

      expect(response.success).toBe(true);
      expect(response.data?.latitude).toBe(48.0);
      expect(response.data?.longitude).toBe(-123.0);
    });

    it("should update farming practices array", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const updatedFarm = createMockFarm({
        id: farmId,
        farmingPractices: ["ORGANIC", "PERMACULTURE"],
      });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(updatedFarm);

      const response = await farmService.updateFarm(farmId, TEST_USER_ID, {
        farmingPractices: ["ORGANIC", "PERMACULTURE"],
      });

      expect(response.success).toBe(true);
      expect(response.data?.farmingPractices).toEqual([
        "ORGANIC",
        "PERMACULTURE",
      ]);
    });
  });

  // ==========================================================================
  // FARM STATUS UPDATES TESTS
  // ==========================================================================
  describe("🔄 Farm Status Updates", () => {
    it("should update farm status to ACTIVE with ServiceResponse", async () => {
      const farmId = TEST_FARM_ID;
      const updatedFarm = createMockFarm({ id: farmId, status: "ACTIVE" });

      mockRepository.updateStatus.mockResolvedValue(updatedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const response = await farmService.updateFarmStatus(farmId, "ACTIVE");

      expect(response.success).toBe(true);
      expect(response.data?.status).toBe("ACTIVE");
      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should update farm status to SUSPENDED", async () => {
      const farmId = TEST_FARM_ID;
      const updatedFarm = createMockFarm({ id: farmId, status: "SUSPENDED" });

      mockRepository.updateStatus.mockResolvedValue(updatedFarm);

      const response = await farmService.updateFarmStatus(farmId, "SUSPENDED");

      expect(response.success).toBe(true);
      expect(response.data?.status).toBe("SUSPENDED");
    });
  });

  // ==========================================================================
  // FARM DELETION TESTS
  // ==========================================================================
  describe("🗑️ Farm Deletion", () => {
    it("should soft delete farm by setting status to INACTIVE", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const deletedFarm = createMockFarm({ id: farmId, status: "INACTIVE" });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(deletedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const response = await farmService.deleteFarm(farmId, TEST_USER_ID);

      expect(response.success).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(farmId, {
        status: "INACTIVE",
      });
    });

    it("should return not found error when deleting non-existent farm", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const response = await farmService.deleteFarm(
        "non-existent-id",
        TEST_USER_ID,
      );

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("NOT_FOUND");
    });

    it("should return forbidden error when user does not own the farm", async () => {
      const existingFarm = createMockFarm({ ownerId: "different-user-id" });

      mockRepository.findById.mockResolvedValue(existingFarm);

      const response = await farmService.deleteFarm(TEST_FARM_ID, TEST_USER_ID);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("FORBIDDEN_ACTION");
    });
  });

  // ==========================================================================
  // FARM LISTING TESTS
  // ==========================================================================
  describe("📋 Farm Listing", () => {
    it("should list farms with pagination using PaginatedResponse", async () => {
      const mockFarms = [createMockFarm({ id: "farm-1" })];

      mockRepository.findMany.mockResolvedValue(mockFarms);
      mockRepository.count.mockResolvedValue(1);

      const response = await farmService.listFarms({ page: 1, limit: 20 });

      expect(response.success).toBe(true);
      expect(response.data?.items).toEqual(mockFarms);
      expect(response.data?.pagination).toBeDefined();
      expect(response.data?.pagination.page).toBe(1);
      expect(response.data?.pagination.limit).toBe(20);
      expect(response.data?.pagination.total).toBe(1);
      expect(response.data?.pagination.totalPages).toBe(1);
    });

    it("should filter farms by city", async () => {
      const seattleFarms = [createMockFarm({ city: "Seattle" })];

      mockRepository.findMany.mockResolvedValue(seattleFarms);
      mockRepository.count.mockResolvedValue(1);

      const response = await farmService.listFarms({ city: "Seattle" });

      expect(response.success).toBe(true);
      expect(response.data?.items).toEqual(seattleFarms);
    });

    it("should filter farms by state", async () => {
      const waFarms = [createMockFarm({ state: "WA" })];

      mockRepository.findMany.mockResolvedValue(waFarms);
      mockRepository.count.mockResolvedValue(1);

      const response = await farmService.listFarms({ state: "WA" });

      expect(response.success).toBe(true);
      expect(response.data?.items).toEqual(waFarms);
    });

    it("should sort farms by name ascending", async () => {
      const mockFarms = [
        createMockFarm({ name: "Apple Farm" }),
        createMockFarm({ name: "Banana Farm" }),
      ];

      mockRepository.findMany.mockResolvedValue(mockFarms);
      mockRepository.count.mockResolvedValue(2);

      const response = await farmService.listFarms({
        sortBy: "name",
        sortOrder: "asc",
      });

      expect(response.success).toBe(true);
      expect(response.data?.items).toEqual(mockFarms);
    });

    it("should use default pagination values", async () => {
      mockRepository.findMany.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const response = await farmService.listFarms({});

      expect(response.success).toBe(true);
      expect(response.data?.pagination.page).toBe(1);
      expect(response.data?.pagination.limit).toBe(20);
    });
  });

  // ==========================================================================
  // FARM SEARCH TESTS
  // ==========================================================================
  describe("🔍 Farm Search", () => {
    it("should search farms by query with ServiceResponse", async () => {
      const mockFarms = [createMockFarm({ name: "Organic Farm" })];

      mockRepository.searchFarms.mockResolvedValue(mockFarms);

      const response = await farmService.searchFarms({ query: "organic" });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockFarms);
      expect(mockRepository.searchFarms).toHaveBeenCalledWith("organic", {
        take: 10,
      });
    });

    it("should limit search results", async () => {
      const mockFarms = [createMockFarm()];

      mockRepository.searchFarms.mockResolvedValue(mockFarms);

      await farmService.searchFarms({ query: "test", limit: 5 });

      expect(mockRepository.searchFarms).toHaveBeenCalledWith("test", {
        take: 5,
      });
    });
  });

  // ==========================================================================
  // LOCATION-BASED QUERIES TESTS
  // ==========================================================================
  describe("📍 Location-Based Queries", () => {
    describe("getFarmsByCity", () => {
      it("should return farms in a specific city with ServiceResponse", async () => {
        const seattleFarms = [
          createMockFarm({ city: "Seattle", id: "farm-1" }),
          createMockFarm({ city: "Seattle", id: "farm-2" }),
        ];

        mockRepository.findByCity.mockResolvedValue(seattleFarms);

        const response = await farmService.getFarmsByCity("Seattle");

        expect(response.success).toBe(true);
        expect(response.data).toEqual(seattleFarms);
      });
    });

    describe("getFarmsByState", () => {
      it("should return farms in a specific state with ServiceResponse", async () => {
        const waFarms = [createMockFarm({ state: "WA" })];

        mockRepository.findByState.mockResolvedValue(waFarms);

        const response = await farmService.getFarmsByState("WA");

        expect(response.success).toBe(true);
        expect(response.data).toEqual(waFarms);
      });
    });

    describe("findNearbyFarms", () => {
      it("should return farms within radius with ServiceResponse", async () => {
        const nearbyFarms = [createMockFarm()];

        mockRepository.findNearLocation.mockResolvedValue(nearbyFarms);

        const response = await farmService.findNearbyFarms(
          47.6062,
          -122.3321,
          50,
        );

        expect(response.success).toBe(true);
        expect(response.data).toEqual(nearbyFarms);
        expect(response.meta?.agricultural).toBeDefined();
      });

      it("should use default radius when not specified", async () => {
        const nearbyFarms = [createMockFarm()];

        mockRepository.findNearLocation.mockResolvedValue(nearbyFarms);

        await farmService.findNearbyFarms(47.6062, -122.3321);

        expect(mockRepository.findNearLocation).toHaveBeenCalledWith(
          47.6062,
          -122.3321,
          50,
        );
      });
    });
  });

  // ==========================================================================
  // CACHE BEHAVIOR TESTS
  // ==========================================================================
  describe("💾 Cache Behavior", () => {
    it("should invalidate cache after farm creation", async () => {
      const farmRequest = createValidFarmRequest();
      const mockCreatedFarm = createMockFarm();

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(mockCreatedFarm.id);
    });

    it("should invalidate cache after farm update", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const updatedFarm = createMockFarm({ id: farmId, name: "Updated" });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(updatedFarm);

      await farmService.updateFarm(farmId, TEST_USER_ID, { name: "Updated" });

      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should invalidate cache after farm deletion", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const deletedFarm = createMockFarm({ id: farmId, status: "INACTIVE" });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(deletedFarm);

      await farmService.deleteFarm(farmId, TEST_USER_ID);

      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should invalidate cache after status update", async () => {
      const farmId = TEST_FARM_ID;
      const updatedFarm = createMockFarm({ id: farmId, status: "ACTIVE" });

      mockRepository.updateStatus.mockResolvedValue(updatedFarm);

      await farmService.updateFarmStatus(farmId, "ACTIVE");

      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================
  describe("⚠️ Error Handling", () => {
    it("should handle repository errors gracefully", async () => {
      mockCache.getFarm.mockResolvedValue(null);
      mockRepository.findById.mockRejectedValue(new Error("Database error"));

      const response = await farmService.getFarmById(TEST_FARM_ID);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should return validation error for missing required city", async () => {
      const farmRequest = createValidFarmRequest({ city: "" });

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
    });

    it("should return validation error for missing required address", async () => {
      const farmRequest = createValidFarmRequest({ address: "" });

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  // ==========================================================================
  // AGRICULTURAL CONSCIOUSNESS TESTS
  // ==========================================================================
  describe("🌾 Agricultural Consciousness", () => {
    it("should include agricultural metadata in farm creation response", async () => {
      const farmRequest = createValidFarmRequest();
      const mockCreatedFarm = createMockFarm();

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.meta?.agricultural).toBeDefined();
      expect(response.meta?.agricultural?.season).toBeDefined();
      expect(response.meta?.agricultural?.consciousness).toBe("DIVINE");
      expect(response.meta?.agricultural?.entityType).toBe("farm");
    });

    it("should store farming practices as array", async () => {
      const farmRequest = createValidFarmRequest({
        farmingPractices: ["ORGANIC", "BIODYNAMIC"],
      });
      const mockCreatedFarm = createMockFarm({
        farmingPractices: ["ORGANIC", "BIODYNAMIC"],
      });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.farmingPractices).toEqual([
        "ORGANIC",
        "BIODYNAMIC",
      ]);
    });

    it("should store product categories for farms", async () => {
      const farmRequest = createValidFarmRequest({
        productCategories: ["VEGETABLES", "FRUITS"],
      });
      const mockCreatedFarm = createMockFarm({
        productCategories: ["VEGETABLES", "FRUITS"],
      });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.productCategories).toEqual([
        "VEGETABLES",
        "FRUITS",
      ]);
    });

    it("should handle farm year established for legacy farms", async () => {
      const farmRequest = createValidFarmRequest({ yearEstablished: 1950 });
      const mockCreatedFarm = createMockFarm({ yearEstablished: 1950 });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.yearEstablished).toBe(1950);
    });

    it("should handle delivery radius for local farms", async () => {
      const farmRequest = createValidFarmRequest({ deliveryRadius: 25 });
      const mockCreatedFarm = createMockFarm({ deliveryRadius: 25 });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.deliveryRadius).toBe(25);
    });
  });

  // ==========================================================================
  // EDGE CASES TESTS
  // ==========================================================================
  describe("🔬 Edge Cases", () => {
    it("should handle empty farming practices array", async () => {
      const farmRequest = createValidFarmRequest({ farmingPractices: [] });
      const mockCreatedFarm = createMockFarm({ farmingPractices: [] });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.farmingPractices).toEqual([]);
    });

    it("should handle farm name with special characters in slug generation", async () => {
      const farmRequest = createValidFarmRequest({
        name: "Green & Fresh Farm!",
        city: "Portland",
      });
      const mockCreatedFarm = createMockFarm({
        name: "Green & Fresh Farm!",
        slug: "green-fresh-farm-portland",
      });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.slug).toMatch(/green-fresh-farm-portland/);
    });

    it("should handle very long farm descriptions", async () => {
      const longDescription = "A".repeat(5000);
      const farmRequest = createValidFarmRequest({
        description: longDescription,
      });
      const mockCreatedFarm = createMockFarm({ description: longDescription });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.description).toHaveLength(5000);
    });

    it("should handle coordinates at boundary values", async () => {
      const farmRequest = createValidFarmRequest({
        latitude: 90,
        longitude: 180,
      });
      const mockCreatedFarm = createMockFarm({
        latitude: 90,
        longitude: 180,
      });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.latitude).toBe(90);
      expect(response.data?.farm.longitude).toBe(180);
    });

    it("should handle unicode characters in farm name", async () => {
      const farmRequest = createValidFarmRequest({
        name: "🌾 Divine Organic Farm 🌱",
        city: "Seattle",
      });
      const mockCreatedFarm = createMockFarm({
        name: "🌾 Divine Organic Farm 🌱",
        slug: "divine-organic-farm-seattle",
      });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.name).toContain("🌾");
    });

    it("should handle zero farm size", async () => {
      const farmRequest = createValidFarmRequest({ farmSize: 0 });
      const mockCreatedFarm = createMockFarm({ farmSize: 0 });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
      expect(response.data?.farm.farmSize).toBe(0);
    });

    it("should handle null optional fields", async () => {
      const farmRequest = createValidFarmRequest({
        description: undefined,
        story: undefined,
        businessName: undefined,
        website: undefined,
      });
      const mockCreatedFarm = createMockFarm({
        description: null,
        story: null,
        businessName: null,
        website: null,
      });

      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const response = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(response.success).toBe(true);
    });
  });
});
