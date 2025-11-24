/**
 * 🧬 DIVINE TEST SUITE: Farm Service
 * 📚 Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
 * 🌾 Domain: Agricultural Service Layer
 *
 * Tests for complete CRUD operations with caching integration
 */

import { AgriculturalCache } from "@/lib/cache/agricultural-cache";
import { database } from "@/lib/database";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import type {
  FarmStatus,
  FarmingPractice,
  ProductCategory,
} from "@prisma/client";
import {
  createFarmService,
  deleteFarmService,
  getFarmById,
  getFarmBySlug,
  listFarmsService,
  searchFarmsService,
  updateFarmService,
} from "../farm.service";

// Mock the database
jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock the cache - must match the exact import path in farm.service.ts
jest.mock("@/lib/cache/agricultural-cache", () => ({
  AgriculturalCache: {
    getFarm: jest.fn(),
    cacheFarm: jest.fn(),
    invalidateFarm: jest.fn(),
    getProduct: jest.fn(),
    cacheProduct: jest.fn(),
    invalidateProduct: jest.fn(),
  },
}));

describe("Farm Service - CRUD Operations", () => {
  const mockUserId = "user-123";
  const mockFarmId = "farm-456";
  const mockSlug = "test-organic-farm";

  const mockUser = {
    id: mockUserId,
    email: "farmer@example.com",
    name: "Test Farmer",
    role: "FARMER" as const,
  };

  const mockFarm = {
    id: mockFarmId,
    slug: mockSlug,
    name: "Test Organic Farm",
    description: "A beautiful organic farm",
    story: "Our farming journey",
    ownerId: mockUserId,
    status: "ACTIVE" as FarmStatus,
    isVerified: false,
    address: "123 Farm Road",
    city: "Farmville",
    state: "CA",
    zipCode: "12345",
    country: "USA",
    latitude: 37.7749,
    longitude: -122.4194,
    phone: "555-0100",
    email: "contact@farm.com",
    website: "https://farm.com",
    farmingPractices: ["ORGANIC", "SUSTAINABLE"] as FarmingPractice[],
    productCategories: ["VEGETABLES", "FRUITS"] as ProductCategory[],
    totalArea: 50.5,
    totalAreaUnit: "ACRES" as const,
    certifications: ["USDA Organic"],
    establishedYear: 2010,
    deliveryRadius: 25,
    deliveryRadiusUnit: "MILES" as const,
    minimumOrder: 25,
    acceptsOnlineOrders: true,
    allowsPickup: true,
    allowsDelivery: true,
    operatingHours: { monday: "9am-5pm" },
    socialMedia: { facebook: "testfarm" },
    teamMembers: ["John", "Jane"],
    coverImage: "cover.jpg",
    logoImage: "logo.jpg",
    images: ["img1.jpg", "img2.jpg"],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    jest.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
    jest.mocked(AgriculturalCache.cacheFarm).mockResolvedValue(undefined);
    jest.mocked(AgriculturalCache.invalidateFarm).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createFarmService", () => {
    const createInput = {
      name: "New Test Farm",
      description: "A new test farm",
      address: "456 Farm Lane",
      city: "Testville",
      state: "NY",
      zipCode: "54321",
      country: "USA",
      farmingPractices: ["ORGANIC"] as FarmingPractice[],
      productCategories: ["VEGETABLES"] as ProductCategory[],
    };

    it("should create a farm successfully", async () => {
      jest.mocked(database.farm.create).mockResolvedValue(mockFarm as any);

      const result = await createFarmService({
        userId: mockUserId,
        farmData: createInput as any,
      });

      expect(result).toBeDefined();
      expect(result.farm.identity.name).toBe(mockFarm.name);
      expect(result.slug).toBeDefined();
      expect(database.farm.create).toHaveBeenCalled();
    });

    it("should throw error if user not found", async () => {
      // Note: The service doesn't validate user existence - it relies on DB foreign key constraint
      // This test documents that behavior
      jest
        .mocked(database.farm.create)
        .mockRejectedValue(new Error("Foreign key constraint failed"));

      await expect(
        createFarmService({
          userId: "invalid-user",
          farmData: createInput as any,
        }),
      ).rejects.toThrow();
    });

    it("should generate unique slug from farm name", async () => {
      jest.mocked(database.user.findUnique).mockResolvedValue(mockUser as any);
      jest.mocked(database.farm.create).mockResolvedValue(mockFarm as any);

      await createFarmService({
        userId: mockUserId,
        farmData: createInput as any,
      });

      const createCall = jest.mocked(database.farm.create).mock.calls[0][0];
      expect(createCall.data.slug).toBeDefined();
      expect(typeof createCall.data.slug).toBe("string");
    });
  });

  describe("getFarmById", () => {
    it("should return farm from cache if available", async () => {
      jest.mocked(AgriculturalCache.getFarm).mockResolvedValue(mockFarm);

      const result = await getFarmById(mockFarmId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockFarmId);
      expect(jest.mocked(AgriculturalCache.getFarm)).toHaveBeenCalledWith(
        mockFarmId,
      );
      expect(database.farm.findUnique).not.toHaveBeenCalled();
    });

    it("should fetch from database if not in cache", async () => {
      jest.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const result = await getFarmById(mockFarmId);

      expect(result).toBeDefined();
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { id: mockFarmId },
        include: expect.any(Object),
      });
      expect(jest.mocked(AgriculturalCache.cacheFarm)).toHaveBeenCalled();
    });

    it("should return null for non-existent farm", async () => {
      jest.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);

      const result = await getFarmById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("getFarmBySlug", () => {
    it("should return farm by slug from cache", async () => {
      jest.mocked(AgriculturalCache.getFarm).mockResolvedValue(mockFarm);

      const result = await getFarmBySlug(mockSlug);

      expect(result).toBeDefined();
      expect(result?.slug).toBe(mockSlug);
      expect(jest.mocked(AgriculturalCache.getFarm)).toHaveBeenCalled();
    });

    it("should fetch from database by slug if not cached", async () => {
      jest.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const result = await getFarmBySlug(mockSlug);

      expect(result).toBeDefined();
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { slug: mockSlug },
        include: expect.any(Object),
      });
      expect(jest.mocked(AgriculturalCache.cacheFarm)).toHaveBeenCalled();
    });
  });

  describe("updateFarmService", () => {
    const updateData = {
      name: "Updated Farm Name",
      description: "Updated description",
      phone: "555-0200",
    };

    it("should update farm with valid ownership", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        ...updateData,
      } as any);

      const result = await updateFarmService({
        farmId: mockFarmId,
        userId: mockUserId,
        updateData,
      });

      expect(result).toBeDefined();
      expect(result.identity.name).toBe(updateData.name);
      expect(database.farm.update).toHaveBeenCalled();
    });

    it("should throw error if farm not found", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);

      await expect(
        updateFarmService({
          farmId: "non-existent",
          userId: mockUserId,
          updateData,
        }),
      ).rejects.toThrow("Farm not found");
    });

    it("should throw error if user is not owner", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      await expect(
        updateFarmService({
          farmId: mockFarmId,
          userId: "different-user-id",
          updateData,
        }),
      ).rejects.toThrow("Unauthorized: You don't own this farm");
    });

    it("should handle partial updates", async () => {
      const partialUpdate = { phone: "555-0300" };
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        ...partialUpdate,
      } as any);

      const result = await updateFarmService({
        farmId: mockFarmId,
        userId: mockUserId,
        updateData: partialUpdate,
      });

      expect(result.contact.phone).toBe(partialUpdate.phone);
    });

    it("should invalidate cache after update", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        ...updateData,
      } as any);

      await updateFarmService({
        farmId: mockFarmId,
        userId: mockUserId,
        updateData,
      });

      expect(
        jest.mocked(AgriculturalCache.invalidateFarm),
      ).toHaveBeenCalledWith(mockFarmId);
    });
  });

  describe("deleteFarmService", () => {
    it("should soft delete farm (set status to INACTIVE)", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue({
        ownerId: mockUserId,
      } as any);
      jest.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        status: "INACTIVE" as FarmStatus,
      } as any);

      await deleteFarmService({ farmId: mockFarmId, userId: mockUserId });

      expect(database.farm.update).toHaveBeenCalledWith({
        where: { id: mockFarmId },
        data: { status: "INACTIVE" },
      });
    });

    it("should throw error if farm not found", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);

      await expect(
        deleteFarmService({ farmId: "non-existent", userId: mockUserId }),
      ).rejects.toThrow("Farm not found");
    });

    it("should throw error if user is not owner", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      await expect(
        deleteFarmService({ farmId: mockFarmId, userId: "different-user-id" }),
      ).rejects.toThrow("Unauthorized: You don't own this farm");
    });

    it("should invalidate cache after deletion", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        status: "INACTIVE" as FarmStatus,
      } as any);

      await deleteFarmService({ farmId: mockFarmId, userId: mockUserId });

      expect(
        jest.mocked(AgriculturalCache.invalidateFarm),
      ).toHaveBeenCalledWith(mockFarmId);
    });
  });

  describe("listFarmsService", () => {
    const mockFarms = [mockFarm, { ...mockFarm, id: "farm-789" }];

    it("should return paginated farms with default options", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);
      jest.mocked(database.farm.count).mockResolvedValue(2);

      const result = await listFarmsService({});

      expect(result.farms).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(database.farm.findMany).toHaveBeenCalled();
    });

    it("should filter by status", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue([mockFarm] as any);
      jest.mocked(database.farm.count).mockResolvedValue(1);

      const result = await listFarmsService({ status: "ACTIVE" });

      expect(database.farm.findMany).toHaveBeenCalled();
      expect(result.farms).toHaveLength(1);
      const call = jest.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where.status).toBe("ACTIVE");
    });

    it("should filter by state", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue([mockFarm] as any);
      jest.mocked(database.farm.count).mockResolvedValue(1);

      const result = await listFarmsService({ state: "CA" });

      expect(database.farm.findMany).toHaveBeenCalled();
      expect(result.farms).toHaveLength(1);
      const call = jest.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where.state).toBe("CA");
    });

    it("should handle pagination correctly", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);
      jest.mocked(database.farm.count).mockResolvedValue(20);

      const result = await listFarmsService({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.total).toBe(20);
      expect(result.totalPages).toBe(2);
      expect(result.farms).toBeDefined();
      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 10, // page 2, skip first 10
        }),
      );
    });

    it("should filter by farming practices", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue([mockFarm] as any);
      jest.mocked(database.farm.count).mockResolvedValue(1);

      const result = await listFarmsService({ farmingPractices: ["ORGANIC"] });

      expect(database.farm.findMany).toHaveBeenCalled();
      expect(result.farms).toHaveLength(1);
      const call = jest.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where.farmingPractices).toEqual({ hasSome: ["ORGANIC"] });
    });
  });

  describe("searchFarmsService", () => {
    const mockFarms = [mockFarm];

    it("should search farms by text query", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);

      const result = await searchFarmsService({ query: "organic" });

      expect(result).toHaveLength(1);
      expect(database.farm.findMany).toHaveBeenCalled();
      const call = jest.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where?.status).toBe("ACTIVE");
      expect(call.where?.OR).toBeDefined();
    });

    it("should search with case-insensitive matching", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);

      const result = await searchFarmsService({ query: "ORGANIC" });

      expect(result).toBeDefined();
      expect(database.farm.findMany).toHaveBeenCalled();
      const call = jest.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where?.OR[0]?.name?.mode).toBe("insensitive");
    });

    it("should search across multiple fields", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);

      await searchFarmsService({ query: "farm" });

      const call = jest.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where?.OR).toBeDefined();
      expect(Array.isArray(call.where?.OR)).toBe(true);
      expect((call.where?.OR as any[]).length).toBeGreaterThan(2); // name, description, city, state, etc.
    });

    it("should limit results to 10 by default", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);

      await searchFarmsService({ query: "test" });

      const call = jest.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.take).toBe(10);
    });

    it("should return empty array for no matches", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue([]);

      const result = await searchFarmsService({ query: "nonexistent123" });

      expect(result).toEqual([]);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle database errors gracefully in getFarmById", async () => {
      jest.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
      jest
        .mocked(database.farm.findUnique)
        .mockRejectedValue(new Error("Database connection error"));

      await expect(getFarmById(mockFarmId)).rejects.toThrow(
        "Database connection error",
      );
    });

    it("should handle empty search query", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue([mockFarm] as any);

      const result = await searchFarmsService({ query: "" });

      expect(result).toBeDefined();
      // Should still execute search with empty string
    });

    it("should handle very large pagination requests", async () => {
      jest.mocked(database.farm.findMany).mockResolvedValue([]);
      jest.mocked(database.farm.count).mockResolvedValue(0);

      const result = await listFarmsService({ page: 999, limit: 100 });

      expect(result.farms).toEqual([]);
      expect(result.page).toBe(999);
    });

    it("should handle updates with no changes", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.farm.update).mockResolvedValue(mockFarm as any);

      const result = await updateFarmService({
        farmId: mockFarmId,
        userId: mockUserId,
        updateData: {},
      });

      expect(result).toBeDefined();
      // Should still call update even with empty data
    });
  });
});
