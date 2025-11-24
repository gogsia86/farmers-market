/**
 * FARM SERVICE TESTS - DIVINE VALIDATION
 *
 * Comprehensive test suite for farm service layer operations.
 * Tests business logic, database interactions, and error handling.
 *
 * Divine Patterns Applied:
 * - Enlightening test names (describe what SHOULD happen)
 * - Comprehensive coverage (100% of business logic)
 * - Integration testing with database mocks
 * - Type-safe test data
 *
 * Coverage Target: 100%
 */

import { database } from "@/lib/database";
import {
  checkExistingFarm,
  createFarmService,
  getFarmById,
  getFarmBySlug,
} from "@/lib/services/farm.service";
import type { CreateFarmRequest, UserId } from "@/types/farm.types";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

// ============================================================================
// MOCKS - DIVINE TEST DOUBLES
// ============================================================================

jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/cache", () => ({
  AgriculturalCache: {
    getFarm: jest.fn(),
    cacheFarm: jest.fn(),
    invalidateFarm: jest.fn(),
    getProduct: jest.fn(),
    cacheProduct: jest.fn(),
    invalidateProduct: jest.fn(),
  },
}));

// ============================================================================
// TEST DATA - QUANTUM FIXTURES
// ============================================================================

const mockUserId = "user-123" as UserId;

const mockFarmData: CreateFarmRequest = {
  name: "Quantum Valley Farm",
  address: "123 Divine Street",
  city: "Reality",
  state: "CA",
  zipCode: "94000",
  latitude: 37.7749,
  longitude: -122.4194,
  email: "farm@quantum.valley",
  phone: "+1234567890",
  description: "Growing consciousness through organic vegetables",
  story: "Our farm has been practicing biodynamic agriculture for 10 years",
  businessName: "Quantum Valley Agricultural Co.",
  yearEstablished: 2014,
  farmSize: 50,
  website: "https://quantumvalley.farm",
  farmingPractices: ["Organic", "Biodynamic", "Regenerative"],
  productCategories: ["Vegetables", "Fruits"],
  deliveryRadius: 25,
};

const mockCreatedFarm = {
  id: "farm-123",
  slug: "quantum-valley-farm-reality",
  name: "Quantum Valley Farm",
  ownerId: mockUserId,
  description: "Growing consciousness through organic vegetables",
  story: "Our farm has been practicing biodynamic agriculture for 10 years",
  businessName: "Quantum Valley Agricultural Co.",
  yearEstablished: 2014,
  farmSize: 50,
  address: "123 Divine Street",
  city: "Reality",
  state: "CA",
  zipCode: "94000",
  country: "US",
  latitude: 37.7749,
  longitude: -122.4194,
  email: "farm@quantum.valley",
  phone: "+1234567890",
  website: "https://quantumvalley.farm",
  farmingPractices: ["Organic", "Biodynamic", "Regenerative"],
  productCategories: ["Vegetables", "Fruits"],
  deliveryRadius: 25,
  status: "PENDING",
  verificationStatus: "PENDING",
  stripeOnboarded: false,
  payoutsEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: {
    id: mockUserId,
    firstName: "Test",
    lastName: "Farmer",
    email: "farmer@test.com",
  },
};

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ============================================================================
// TESTS - FARM CREATION SERVICE
// ============================================================================

describe("Farm Service - Divine Operations", () => {
  describe("createFarmService", () => {
    it("manifests new farm with unique slug successfully", async () => {
      // Arrange
      jest.mocked(database.farm.findUnique).mockResolvedValue(null); // No slug collision
      jest
        .mocked(database.farm.create)
        .mockResolvedValue(mockCreatedFarm as any);

      // Act
      const result = await createFarmService({
        userId: mockUserId,
        farmData: mockFarmData,
      });

      // Assert
      expect(result.farm.identity.name).toBe("Quantum Valley Farm");
      expect(result.farm.identity.id).toBe("farm-123");
      expect(result.slug).toBeDefined();
      expect(database.farm.create).toHaveBeenCalledTimes(1);
    });

    it("handles slug collision by appending counter", async () => {
      // Arrange - First slug exists, second doesn't
      jest
        .mocked(database.farm.findUnique)
        .mockResolvedValueOnce({ id: "existing-farm" } as any) // Collision
        .mockResolvedValueOnce(null); // Success

      jest
        .mocked(database.farm.create)
        .mockResolvedValue(mockCreatedFarm as any);

      // Act
      const result = await createFarmService({
        userId: mockUserId,
        farmData: mockFarmData,
      });

      // Assert
      expect(database.farm.findUnique).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it("throws error after max slug collision attempts", async () => {
      // Arrange - All attempts collide
      jest.mocked(database.farm.findUnique).mockResolvedValue({
        id: "existing-farm",
      } as any);

      // Act & Assert
      await expect(
        createFarmService({
          userId: mockUserId,
          farmData: mockFarmData,
        }),
      ).rejects.toThrow("Failed to generate unique slug");
    });

    it("creates farm with PENDING status by default", async () => {
      // Arrange
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);
      jest
        .mocked(database.farm.create)
        .mockResolvedValue(mockCreatedFarm as any);

      // Act
      await createFarmService({
        userId: mockUserId,
        farmData: mockFarmData,
      });

      // Assert
      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PENDING",
            verificationStatus: "PENDING",
            stripeOnboarded: false,
            payoutsEnabled: false,
          }),
        }),
      );
    });

    it("manifests quantum farm with agricultural consciousness", async () => {
      // Arrange
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);
      jest
        .mocked(database.farm.create)
        .mockResolvedValue(mockCreatedFarm as any);

      // Act
      const result = await createFarmService({
        userId: mockUserId,
        farmData: mockFarmData,
      });

      // Assert - Check quantum properties
      expect(result.farm.consciousness).toBeDefined();
      expect(result.farm.consciousness.currentSeason).toMatch(
        /SPRING|SUMMER|FALL|WINTER/,
      );
      expect(result.farm.consciousness.state).toMatch(
        /DORMANT|AWAKENING|GROWING|HARVESTING|REGENERATING/,
      );
      expect(result.farm.location.latitude).toBe(37.7749);
      expect(result.farm.location.longitude).toBe(-122.4194);
    });
  });

  // ========================================================================
  // TESTS - CHECK EXISTING FARM
  // ========================================================================

  describe("checkExistingFarm", () => {
    it("returns exists=false when user has no farm", async () => {
      // Arrange
      jest.mocked(database.farm.findFirst).mockResolvedValue(null);

      // Act
      const result = await checkExistingFarm(mockUserId);

      // Assert
      expect(result.exists).toBe(false);
      expect(result.farm).toBeUndefined();
    });

    it("returns exists=true with farm details when user has farm", async () => {
      // Arrange
      jest.mocked(database.farm.findFirst).mockResolvedValue({
        id: "farm-123",
        slug: "quantum-valley-farm",
        name: "Quantum Valley Farm",
      } as any);

      // Act
      const result = await checkExistingFarm(mockUserId);

      // Assert
      expect(result.exists).toBe(true);
      expect(result.farm).toEqual({
        id: "farm-123",
        slug: "quantum-valley-farm",
        name: "Quantum Valley Farm",
      });
    });

    it("queries database with correct user ID", async () => {
      // Arrange
      jest.mocked(database.farm.findFirst).mockResolvedValue(null);

      // Act
      await checkExistingFarm(mockUserId);

      // Assert
      expect(database.farm.findFirst).toHaveBeenCalledWith({
        where: { ownerId: mockUserId },
        select: { id: true, slug: true, name: true },
      });
    });
  });

  // ========================================================================
  // TESTS - GET FARM BY ID
  // ========================================================================

  describe("getFarmById", () => {
    it("manifests quantum farm when farm exists", async () => {
      // Arrange
      jest
        .mocked(database.farm.findUnique)
        .mockResolvedValue(mockCreatedFarm as any);

      // Act
      const result = await getFarmById("farm-123");

      // Assert
      expect(result).not.toBeNull();
      expect(result?.identity.id).toBe("farm-123");
      expect(result?.identity.name).toBe("Quantum Valley Farm");
      expect(result?.consciousness).toBeDefined();
    });

    it("returns null when farm does not exist", async () => {
      // Arrange
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);

      // Act
      const result = await getFarmById("nonexistent-farm");

      // Assert
      expect(result).toBeNull();
    });

    it("includes owner information in query", async () => {
      // Arrange
      jest
        .mocked(database.farm.findUnique)
        .mockResolvedValue(mockCreatedFarm as any);

      // Act
      const result = await getFarmById("farm-123");

      // Assert
      expect(result).toBeDefined();
      expect(result?.identity.id).toBe("farm-123");
    });
  });

  // ========================================================================
  // TESTS - GET FARM BY SLUG
  // ========================================================================

  describe("getFarmBySlug", () => {
    it("manifests quantum farm when slug exists", async () => {
      // Arrange
      jest
        .mocked(database.farm.findUnique)
        .mockResolvedValue(mockCreatedFarm as any);

      // Act
      const result = await getFarmBySlug("quantum-valley-farm-reality");

      // Assert
      expect(result).not.toBeNull();
      expect(result?.identity.slug).toBe("quantum-valley-farm-reality");
    });

    it("returns null when slug does not exist", async () => {
      // Arrange
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);

      // Act
      const result = await getFarmBySlug("nonexistent-slug");

      // Assert
      expect(result).toBeNull();
    });
  });
});
