/**
 * 🧪 FARM SERVICE UNIT TESTS
 *
 * Comprehensive unit tests for FarmService with agricultural consciousness.
 * Tests business logic, validation, caching, and error handling.
 *
 * @pattern Divine Testing with Agricultural Consciousness
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
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

// Create the mock span factory - this will be called when the mock is used
const createMockSpan = () => ({
  setAttribute: jest.fn(),
  setAttributes: jest.fn(),
  setStatus: jest.fn(),
  end: jest.fn(),
  recordException: jest.fn(),
  addEvent: jest.fn(),
});

// Mock the service-tracer module - use mockImplementation to avoid hoisting issues
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

describe("🚜 FarmService - Divine Agricultural Business Logic", () => {
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

    it("should create a farm with valid data", async () => {
      const farmRequest = createValidFarmRequest();
      const mockCreatedFarm = createMockFarm();

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result).toBeDefined();
      expect(result.farm).toEqual(mockCreatedFarm);
      expect(result.slug).toBeDefined();
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

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.slug).toMatch(/sunny-hills-farm-portland/);
    });

    it("should throw ConflictError if user already has a farm", async () => {
      const farmRequest = createValidFarmRequest();
      const existingFarm = createMockFarm({ ownerId: TEST_USER_ID });

      mockRepository.findByOwnerId.mockResolvedValue([existingFarm]);

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ConflictError);

      expect(mockRepository.manifestFarm).not.toHaveBeenCalled();
    });

    it("should throw ValidationError if farm name is too short", async () => {
      const farmRequest = createValidFarmRequest({ name: "Ab" });

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ValidationError);

      expect(mockRepository.manifestFarm).not.toHaveBeenCalled();
    });

    it("should throw ValidationError if userId is missing", async () => {
      const farmRequest = createValidFarmRequest();

      await expect(farmService.createFarm("", farmRequest)).rejects.toThrow(
        ValidationError,
      );

      expect(mockRepository.manifestFarm).not.toHaveBeenCalled();
    });

    it("should throw ValidationError for invalid email format", async () => {
      const farmRequest = createValidFarmRequest({ email: "invalid-email" });

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ValidationError);

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

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm).toEqual(mockCreatedFarm);
      expect(mockRepository.isSlugAvailable).toHaveBeenCalledTimes(2);
    });

    it("should set default status to PENDING for new farms", async () => {
      const farmRequest = createValidFarmRequest();
      const mockCreatedFarm = createMockFarm({ status: "PENDING" });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.status).toBe("PENDING");
    });

    it("should create farm with optional fields omitted", async () => {
      const minimalFarmRequest: CreateFarmRequest = {
        name: "Minimal Farm",
        address: "456 Basic Road",
        city: "Tacoma",
        state: "WA",
        zipCode: "98401",
        latitude: 47.2529,
        longitude: -122.4443,
      };
      const mockCreatedFarm = createMockFarm({
        name: "Minimal Farm",
        description: null,
        website: null,
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(
        TEST_USER_ID,
        minimalFarmRequest,
      );

      expect(result.farm).toEqual(mockCreatedFarm);
    });

    it("should throw ValidationError for invalid latitude", async () => {
      const farmRequest = createValidFarmRequest({
        latitude: 100, // Invalid: > 90
      });

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for invalid longitude", async () => {
      const farmRequest = createValidFarmRequest({
        longitude: -200, // Invalid: < -180
      });

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for negative delivery radius", async () => {
      const farmRequest = createValidFarmRequest({
        deliveryRadius: -10,
      });

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ConflictError when max slug attempts exceeded", async () => {
      const farmRequest = createValidFarmRequest();

      // All slugs are taken
      mockRepository.isSlugAvailable.mockResolvedValue(false);

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ConflictError);
    });
  });

  // ==========================================================================
  // FARM RETRIEVAL TESTS
  // ==========================================================================
  describe("📖 Farm Retrieval", () => {
    describe("getFarmById", () => {
      it("should return farm by ID", async () => {
        const mockFarm = createMockFarm();
        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findById.mockResolvedValue(mockFarm);

        const result = await farmService.getFarmById(TEST_FARM_ID);

        expect(result).toEqual(mockFarm);
        expect(mockRepository.findById).toHaveBeenCalledWith(TEST_FARM_ID);
      });

      it("should return cached farm if available", async () => {
        const mockFarm = createMockFarm();
        mockCache.getFarm.mockResolvedValue(mockFarm);

        const result = await farmService.getFarmById(TEST_FARM_ID);

        expect(result).toEqual(mockFarm);
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });

      it("should return null for non-existent farm ID", async () => {
        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findById.mockResolvedValue(null);

        const result = await farmService.getFarmById("non-existent-id");

        expect(result).toBeNull();
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
      it("should return farm by slug", async () => {
        const mockFarm = createMockFarm();
        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findBySlug.mockResolvedValue(mockFarm);

        const result = await farmService.getFarmBySlug(
          "divine-acres-biodynamic-farm-seattle",
        );

        expect(result).toEqual(mockFarm);
      });

      it("should return cached farm by slug if available", async () => {
        const mockFarm = createMockFarm();
        mockCache.getFarm.mockResolvedValue(mockFarm);

        const result = await farmService.getFarmBySlug("divine-acres");

        expect(result).toEqual(mockFarm);
        expect(mockRepository.findBySlug).not.toHaveBeenCalled();
      });

      it("should return null for non-existent slug", async () => {
        mockCache.getFarm.mockResolvedValue(null);
        mockRepository.findBySlug.mockResolvedValue(null);

        const result = await farmService.getFarmBySlug("non-existent-slug");

        expect(result).toBeNull();
      });
    });

    describe("getFarmsByOwnerId", () => {
      it("should return farms owned by user", async () => {
        const mockFarms = [createMockFarm({ id: "farm-1" })];
        mockRepository.findByOwnerId.mockResolvedValue(mockFarms);

        const result = await farmService.getFarmsByOwnerId(TEST_USER_ID);

        expect(result).toEqual(mockFarms);
        expect(mockRepository.findByOwnerId).toHaveBeenCalledWith(TEST_USER_ID);
      });

      it("should return empty array if user has no farms", async () => {
        mockRepository.findByOwnerId.mockResolvedValue([]);

        const result = await farmService.getFarmsByOwnerId(TEST_USER_ID);

        expect(result).toEqual([]);
      });
    });

    describe("getActiveFarmsWithProducts", () => {
      it("should return active farms with their products", async () => {
        const mockFarmsWithProducts = [
          createMockFarm({
            status: "ACTIVE",
            products: [{ id: "prod-1", name: "Tomatoes" }],
          }),
        ];
        mockRepository.findActiveWithProducts.mockResolvedValue(
          mockFarmsWithProducts,
        );

        const result = await farmService.getActiveFarmsWithProducts();

        expect(result).toEqual(mockFarmsWithProducts);
        expect(mockRepository.findActiveWithProducts).toHaveBeenCalled();
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
  // FARM UPDATE TESTS
  // ==========================================================================
  describe("📝 Farm Updates", () => {
    it("should update farm with valid data", async () => {
      const farmId = TEST_FARM_ID;
      const updateData = {
        name: "Updated Divine Acres",
        description: "New description",
      };
      const existingFarm = createMockFarm({ id: farmId });
      const updatedFarm = createMockFarm({
        id: farmId,
        name: "Updated Divine Acres",
        description: "New description",
      });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(updatedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const result = await farmService.updateFarm(
        farmId,
        TEST_USER_ID,
        updateData,
      );

      expect(result.name).toBe("Updated Divine Acres");
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should throw NotFoundError when updating non-existent farm", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        farmService.updateFarm("non-existent", TEST_USER_ID, { name: "Test" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw AuthorizationError when user does not own the farm", async () => {
      const existingFarm = createMockFarm({ ownerId: "different-user-id" });
      mockRepository.findById.mockResolvedValue(existingFarm);

      await expect(
        farmService.updateFarm(TEST_FARM_ID, TEST_USER_ID, { name: "Test" }),
      ).rejects.toThrow(AuthorizationError);
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
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const result = await farmService.updateFarm(farmId, TEST_USER_ID, {
        phone: "555-9999",
      });

      expect(result.phone).toBe("555-9999");
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
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const result = await farmService.updateFarm(farmId, TEST_USER_ID, {
        latitude: 48.0,
        longitude: -123.0,
      });

      expect(result.latitude).toBe(48.0);
      expect(result.longitude).toBe(-123.0);
    });

    it("should update farming practices array", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const updatedFarm = createMockFarm({
        id: farmId,
        farmingPractices: ["ORGANIC", "REGENERATIVE", "NO_TILL"],
      });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(updatedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const result = await farmService.updateFarm(farmId, TEST_USER_ID, {
        farmingPractices: ["ORGANIC", "REGENERATIVE", "NO_TILL"],
      });

      expect(result.farmingPractices).toContain("REGENERATIVE");
    });
  });

  // ==========================================================================
  // FARM STATUS UPDATE TESTS
  // ==========================================================================
  describe("🔄 Farm Status Updates", () => {
    it("should update farm status to ACTIVE", async () => {
      const farmId = TEST_FARM_ID;
      const updatedFarm = createMockFarm({ id: farmId, status: "ACTIVE" });

      mockRepository.updateStatus.mockResolvedValue(updatedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const result = await farmService.updateFarmStatus(farmId, "ACTIVE");

      expect(result.status).toBe("ACTIVE");
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        farmId,
        "ACTIVE",
        undefined,
      );
      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should update farm status to SUSPENDED", async () => {
      const farmId = TEST_FARM_ID;
      const updatedFarm = createMockFarm({ id: farmId, status: "SUSPENDED" });

      mockRepository.updateStatus.mockResolvedValue(updatedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      const result = await farmService.updateFarmStatus(farmId, "SUSPENDED");

      expect(result.status).toBe("SUSPENDED");
    });
  });

  // ==========================================================================
  // FARM DELETION TESTS
  // ==========================================================================
  describe("🗑️ Farm Deletion", () => {
    it("should soft delete farm by setting status to INACTIVE", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(undefined);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      await farmService.deleteFarm(farmId, TEST_USER_ID);

      expect(mockRepository.update).toHaveBeenCalledWith(farmId, {
        status: "INACTIVE",
      });
      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should throw NotFoundError when deleting non-existent farm", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        farmService.deleteFarm("non-existent-id", TEST_USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw AuthorizationError when user does not own the farm", async () => {
      const existingFarm = createMockFarm({ ownerId: "different-user-id" });
      mockRepository.findById.mockResolvedValue(existingFarm);

      await expect(
        farmService.deleteFarm(TEST_FARM_ID, TEST_USER_ID),
      ).rejects.toThrow(AuthorizationError);
    });
  });

  // ==========================================================================
  // FARM LISTING TESTS
  // ==========================================================================
  describe("📋 Farm Listing", () => {
    it("should list farms with pagination", async () => {
      const mockFarms = [createMockFarm({ id: "farm-1" })];
      mockRepository.findMany.mockResolvedValue(mockFarms);
      mockRepository.count.mockResolvedValue(1);

      const result = await farmService.listFarms({ page: 1, limit: 10 });

      expect(result.farms).toEqual(mockFarms);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it("should filter farms by city", async () => {
      const seattleFarms = [createMockFarm({ city: "Seattle" })];
      mockRepository.findMany.mockResolvedValue(seattleFarms);
      mockRepository.count.mockResolvedValue(1);

      const result = await farmService.listFarms({ city: "Seattle" });

      expect(result.farms).toEqual(seattleFarms);
    });

    it("should filter farms by state", async () => {
      const waFarms = [createMockFarm({ state: "WA" })];
      mockRepository.findMany.mockResolvedValue(waFarms);
      mockRepository.count.mockResolvedValue(1);

      const result = await farmService.listFarms({ state: "WA" });

      expect(result.farms).toEqual(waFarms);
    });

    it("should sort farms by name ascending", async () => {
      const mockFarms = [
        createMockFarm({ name: "Alpha Farm" }),
        createMockFarm({ name: "Beta Farm" }),
      ];
      mockRepository.findMany.mockResolvedValue(mockFarms);
      mockRepository.count.mockResolvedValue(2);

      const result = await farmService.listFarms({
        sortBy: "name",
        sortOrder: "asc",
      });

      expect(result.farms).toEqual(mockFarms);
    });

    it("should use default pagination values", async () => {
      mockRepository.findMany.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const result = await farmService.listFarms();

      expect(result.page).toBe(1);
    });
  });

  // ==========================================================================
  // FARM SEARCH TESTS
  // ==========================================================================
  describe("🔍 Farm Search", () => {
    it("should search farms by query", async () => {
      const mockFarms = [createMockFarm({ name: "Organic Valley Farm" })];
      mockRepository.searchFarms.mockResolvedValue(mockFarms);

      const result = await farmService.searchFarms({ query: "organic" });

      expect(result).toEqual(mockFarms);
      expect(mockRepository.searchFarms).toHaveBeenCalledWith("organic", {
        take: 10,
      });
    });

    it("should limit search results", async () => {
      const mockFarms = [createMockFarm()];
      mockRepository.searchFarms.mockResolvedValue(mockFarms);

      await farmService.searchFarms({ query: "farm", limit: 5 });

      expect(mockRepository.searchFarms).toHaveBeenCalledWith("farm", {
        take: 5,
      });
    });
  });

  // ==========================================================================
  // LOCATION-BASED QUERY TESTS
  // ==========================================================================
  describe("📍 Location-Based Queries", () => {
    describe("getFarmsByCity", () => {
      it("should return farms in a specific city", async () => {
        const seattleFarms = [
          createMockFarm({ city: "Seattle", id: "seattle-farm-1" }),
          createMockFarm({ city: "Seattle", id: "seattle-farm-2" }),
        ];
        mockRepository.findByCity.mockResolvedValue(seattleFarms);

        const result = await farmService.getFarmsByCity("Seattle");

        expect(result).toEqual(seattleFarms);
      });
    });

    describe("getFarmsByState", () => {
      it("should return farms in a specific state", async () => {
        const waFarms = [createMockFarm({ state: "WA" })];
        mockRepository.findByState.mockResolvedValue(waFarms);

        const result = await farmService.getFarmsByState("WA");

        expect(result).toEqual(waFarms);
        expect(mockRepository.findByState).toHaveBeenCalledWith("WA");
      });
    });

    describe("findNearbyFarms", () => {
      it("should return farms within radius", async () => {
        const nearbyFarms = [createMockFarm()];
        mockRepository.findNearLocation.mockResolvedValue(nearbyFarms);

        const result = await farmService.findNearbyFarms(
          47.6062,
          -122.3321,
          50,
        );

        expect(result).toEqual(nearbyFarms);
        expect(mockRepository.findNearLocation).toHaveBeenCalledWith(
          47.6062,
          -122.3321,
          50,
        );
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
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(mockCreatedFarm.id);
    });

    it("should invalidate cache after farm update", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const updatedFarm = createMockFarm({ id: farmId, name: "Updated Farm" });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.update.mockResolvedValue(updatedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      await farmService.updateFarm(farmId, TEST_USER_ID, {
        name: "Updated Farm",
      });

      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should invalidate cache after farm deletion", async () => {
      const farmId = TEST_FARM_ID;
      const existingFarm = createMockFarm({ id: farmId });
      const deletedFarm = createMockFarm({ id: farmId, status: "INACTIVE" });

      mockRepository.findById.mockResolvedValue(existingFarm);
      mockRepository.updateStatus.mockResolvedValue(deletedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

      await farmService.deleteFarm(farmId, TEST_USER_ID);

      expect(mockCache.invalidateFarm).toHaveBeenCalledWith(farmId);
    });

    it("should invalidate cache after status update", async () => {
      const farmId = TEST_FARM_ID;
      const updatedFarm = createMockFarm({ id: farmId, status: "ACTIVE" });

      mockRepository.updateStatus.mockResolvedValue(updatedFarm);
      mockCache.invalidateFarm.mockResolvedValue(undefined);

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

      await expect(farmService.getFarmById(TEST_FARM_ID)).rejects.toThrow(
        "Database error",
      );
    });

    it("should throw ValidationError for missing required city", async () => {
      const farmRequest = createValidFarmRequest({
        city: "",
      });

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for missing required address", async () => {
      const farmRequest = createValidFarmRequest({
        address: "",
      });

      await expect(
        farmService.createFarm(TEST_USER_ID, farmRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  // ==========================================================================
  // AGRICULTURAL CONSCIOUSNESS TESTS
  // ==========================================================================
  describe("🌾 Agricultural Consciousness", () => {
    beforeEach(() => {
      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockCache.invalidateFarm.mockResolvedValue(undefined);
    });

    it("should store farming practices as array", async () => {
      const farmRequest = createValidFarmRequest({
        farmingPractices: ["ORGANIC", "BIODYNAMIC", "REGENERATIVE"],
      });
      const mockCreatedFarm = createMockFarm({
        farmingPractices: ["ORGANIC", "BIODYNAMIC", "REGENERATIVE"],
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.farmingPractices).toContain("ORGANIC");
      expect(result.farm.farmingPractices).toContain("BIODYNAMIC");
      expect(result.farm.farmingPractices).toContain("REGENERATIVE");
    });

    it("should store product categories for farms", async () => {
      const farmRequest = createValidFarmRequest({
        productCategories: ["VEGETABLES", "FRUITS", "DAIRY"],
      });
      const mockCreatedFarm = createMockFarm({
        productCategories: ["VEGETABLES", "FRUITS", "DAIRY"],
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.productCategories).toContain("VEGETABLES");
      expect(result.farm.productCategories).toContain("DAIRY");
    });

    it("should handle farm year established for legacy farms", async () => {
      const farmRequest = createValidFarmRequest({
        yearEstablished: 1920,
      });
      const mockCreatedFarm = createMockFarm({
        yearEstablished: 1920,
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.yearEstablished).toBe(1920);
    });

    it("should handle delivery radius for local farms", async () => {
      const farmRequest = createValidFarmRequest({
        deliveryRadius: 25,
      });
      const mockCreatedFarm = createMockFarm({
        deliveryRadius: 25,
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.deliveryRadius).toBe(25);
    });
  });

  // ==========================================================================
  // EDGE CASE TESTS
  // ==========================================================================
  describe("🔬 Edge Cases", () => {
    beforeEach(() => {
      mockRepository.findByOwnerId.mockResolvedValue([]);
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockCache.invalidateFarm.mockResolvedValue(undefined);
    });

    it("should handle empty farming practices array", async () => {
      const farmRequest = createValidFarmRequest({
        farmingPractices: [],
      });
      const mockCreatedFarm = createMockFarm({
        farmingPractices: [],
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.farmingPractices).toEqual([]);
    });

    it("should handle farm name with special characters in slug generation", async () => {
      const farmRequest = createValidFarmRequest({
        name: "John's Farm & Garden!!! @#$%",
        city: "New York",
      });
      const mockCreatedFarm = createMockFarm({
        name: "John's Farm & Garden!!! @#$%",
        slug: "johns-farm-garden-new-york",
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.slug).not.toContain("!");
      expect(result.slug).not.toContain("@");
      expect(result.slug).not.toContain("'");
    });

    it("should handle very long farm descriptions", async () => {
      const longDescription = "A".repeat(5000);
      const farmRequest = createValidFarmRequest({
        description: longDescription,
      });
      const mockCreatedFarm = createMockFarm({
        description: longDescription,
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.description).toBe(longDescription);
    });

    it("should handle coordinates at boundary values", async () => {
      const farmRequest = createValidFarmRequest({
        latitude: 90, // Max valid
        longitude: -180, // Min valid
      });
      const mockCreatedFarm = createMockFarm({
        latitude: 90,
        longitude: -180,
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.latitude).toBe(90);
      expect(result.farm.longitude).toBe(-180);
    });

    it("should handle unicode characters in farm name", async () => {
      const farmRequest = createValidFarmRequest({
        name: "农场 Ferme 農場 مزرعة",
        city: "Seattle",
      });
      const mockCreatedFarm = createMockFarm({
        name: "农场 Ferme 農場 مزرعة",
        slug: "ferme-seattle",
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.name).toBe("农场 Ferme 農場 مزرعة");
    });

    it("should handle zero farm size", async () => {
      const farmRequest = createValidFarmRequest({
        farmSize: 0,
      });
      const mockCreatedFarm = createMockFarm({
        farmSize: 0,
      });

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm.farmSize).toBe(0);
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

      mockRepository.manifestFarm.mockResolvedValue(mockCreatedFarm);

      const result = await farmService.createFarm(TEST_USER_ID, farmRequest);

      expect(result.farm).toBeDefined();
    });
  });
});
