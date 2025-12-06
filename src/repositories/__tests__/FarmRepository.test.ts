/**
 * 🧪 FARM REPOSITORY TEST SUITE
 * Comprehensive tests for FarmRepository data access layer
 * Coverage: CRUD operations, pagination, filters, aggregates, error handling
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";

// Mock logger - MUST be before imports that use it
const createMockLogger = () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    businessEvent: jest.fn(),
    child: jest.fn(),
  };
  mockLogger.child.mockImplementation(() => createMockLogger());
  return mockLogger;
};

// Create a mock logger instance
const mockLoggerInstance = createMockLogger();

jest.mock("@/lib/monitoring/StructuredLogger", () => ({
  StructuredLogger: jest.fn().mockImplementation(() => mockLoggerInstance),
  LoggerFactory: {
    getLogger: jest.fn().mockReturnValue(mockLoggerInstance),
    createRequestLogger: jest.fn().mockReturnValue(mockLoggerInstance),
  },
}));

// Mock database - MUST be before imports that use it
jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

// Now import the modules that use the mocks
import { FarmRepository } from "../FarmRepository";
import { database } from "@/lib/database";
import type {
  CreateFarmRequest,
  UpdateFarmRequest,
  FarmFilters,
} from "@/types/api/farm.types";
import { DatabaseError } from "@/lib/errors/DatabaseError";

describe("FarmRepository", () => {
  let repository: FarmRepository;

  // Mock data
  const mockUserId = "user_123abc";
  const mockFarmId = "farm_456def";

  const mockFarm = {
    id: mockFarmId,
    name: "Green Valley Farm",
    slug: "green-valley-farm",
    description: "Organic vegetables and fruits",
    address: "123 Farm Road",
    city: "Farmville",
    state: "CA",
    zipCode: "12345",
    email: "contact@greenvalley.com",
    phone: "555-0100",
    ownerId: mockUserId,
    latitude: 37.7749,
    longitude: -122.4194,
    images: ["image1.jpg", "image2.jpg"],
    status: "ACTIVE" as const,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    owner: {
      id: mockUserId,
      name: "John Farmer",
      email: "john@example.com",
    },
    _count: {
      products: 10,
      orders: 25,
    },
  };

  const mockCreateRequest: CreateFarmRequest = {
    name: "New Farm",
    description: "A brand new farm",
    address: "456 New Road",
    city: "Newtown",
    state: "NY",
    zipCode: "54321",
    email: "new@farm.com",
    phone: "555-0200",
    ownerId: mockUserId,
    coordinates: { lat: 40.7128, lng: -74.006 },
    images: ["new-image.jpg"],
    certifications: ["USDA Organic"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new FarmRepository(mockLoggerInstance);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ==================== FIND BY ID TESTS ====================
  describe("findById", () => {
    it("should retrieve farm by ID with relations", async () => {
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);

      const result = await repository.findById(mockFarmId);

      expect(result).toEqual(mockFarm);
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { id: mockFarmId },
        include: expect.objectContaining({
          owner: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
    });

    it("should return null when farm not found", async () => {
      (database.farm.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById("nonexistent_id");

      expect(result).toBeNull();
      expect(database.farm.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "nonexistent_id" },
        }),
      );
    });

    it("should throw DatabaseError on database failure", async () => {
      const dbError = new Error("Database connection failed");
      (database.farm.findUnique as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.findById(mockFarmId)).rejects.toThrow(
        DatabaseError,
      );
    });

    it("should include default relations in query", async () => {
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);

      await repository.findById(mockFarmId);

      expect(database.farm.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                products: true,
                orders: true,
              },
            },
          }),
        }),
      );
    });
  });

  // ==================== FIND WITH PAGINATION TESTS ====================
  describe("findWithPagination", () => {
    const mockFarms = [
      mockFarm,
      { ...mockFarm, id: "farm_789ghi", name: "Another Farm" },
    ];

    it("should retrieve farms with pagination", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(50);

      const filters: FarmFilters = { status: "ACTIVE" };
      const options = { page: 1, limit: 10 };

      const result = await repository.findWithPagination(filters, options);

      expect(result.farms).toEqual(mockFarms);
      expect(result.total).toBe(50);
      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it("should calculate correct skip value for different pages", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(50);

      await repository.findWithPagination({}, { page: 3, limit: 10 });

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3 - 1) * 10
          take: 10,
        }),
      );
    });

    it("should apply custom sorting", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(50);

      await repository.findWithPagination(
        {},
        { page: 1, limit: 10, sortBy: "name", sortOrder: "asc" },
      );

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: "asc" },
        }),
      );
    });

    it("should default to sorting by createdAt desc", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(50);

      await repository.findWithPagination({}, { page: 1, limit: 10 });

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
    });

    it("should filter by status", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(10);

      await repository.findWithPagination(
        { status: "ACTIVE" },
        { page: 1, limit: 10 },
      );

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "ACTIVE" }),
        }),
      );
    });

    it("should filter by owner ID", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(5);

      await repository.findWithPagination(
        { ownerId: mockUserId },
        { page: 1, limit: 10 },
      );

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ ownerId: mockUserId }),
        }),
      );
    });

    it("should apply search term to multiple fields", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(3);

      await repository.findWithPagination(
        { searchTerm: "organic" },
        { page: 1, limit: 10 },
      );

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: "organic", mode: "insensitive" } },
              { description: { contains: "organic", mode: "insensitive" } },
              { address: { contains: "organic", mode: "insensitive" } },
            ]),
          }),
        }),
      );
    });

    it("should filter by certified farms", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(15);

      await repository.findWithPagination(
        { certified: true },
        { page: 1, limit: 10 },
      );

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            certifications: { some: {} },
          }),
        }),
      );
    });

    it("should filter by farms with products", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(20);

      await repository.findWithPagination(
        { hasProducts: true },
        { page: 1, limit: 10 },
      );

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            products: { some: {} },
          }),
        }),
      );
    });

    it("should combine multiple filters", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(2);

      await repository.findWithPagination(
        {
          status: "ACTIVE",
          ownerId: mockUserId,
          certified: true,
          hasProducts: true,
        },
        { page: 1, limit: 10 },
      );

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "ACTIVE",
            ownerId: mockUserId,
            certifications: { some: {} },
            products: { some: {} },
          }),
        }),
      );
    });

    it("should throw DatabaseError on query failure", async () => {
      const dbError = new Error("Query failed");
      (database.farm.findMany as jest.Mock).mockRejectedValue(dbError);

      await expect(
        repository.findWithPagination({}, { page: 1, limit: 10 }),
      ).rejects.toThrow(DatabaseError);
    });
  });

  // ==================== CREATE TESTS ====================
  describe("create", () => {
    const createdFarm = {
      ...mockFarm,
      id: "new_farm_id",
      name: mockCreateRequest.name,
    };

    it("should create farm with all required fields", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(createdFarm);

      const result = await repository.create(mockCreateRequest);

      expect(result).toEqual(createdFarm);
      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: mockCreateRequest.name,
            description: mockCreateRequest.description,
            address: mockCreateRequest.address,
            ownerId: mockCreateRequest.ownerId,
            status: "PENDING",
          }),
        }),
      );
    });

    it("should generate slug from farm name", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(createdFarm);

      await repository.create(mockCreateRequest);

      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: "new-farm",
          }),
        }),
      );
    });

    it("should handle farm names with special characters in slug", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(createdFarm);

      const requestWithSpecialChars = {
        ...mockCreateRequest,
        name: "Farm @ Valley's Best!",
      };

      await repository.create(requestWithSpecialChars);

      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: "farm-valley-s-best",
          }),
        }),
      );
    });

    it("should store coordinates correctly", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(createdFarm);

      await repository.create(mockCreateRequest);

      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            latitude: 40.7128,
            longitude: -74.006,
          }),
        }),
      );
    });

    it("should default coordinates to 0 when not provided", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(createdFarm);

      const requestWithoutCoords = {
        ...mockCreateRequest,
        coordinates: undefined,
      };
      await repository.create(requestWithoutCoords);

      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            latitude: 0,
            longitude: 0,
          }),
        }),
      );
    });

    it("should create certifications when provided", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(createdFarm);

      await repository.create(mockCreateRequest);

      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            certifications: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  type: "ORGANIC",
                  certifierName: "USDA Organic",
                  status: "PENDING",
                }),
              ]),
            },
          }),
        }),
      );
    });

    it("should not create certifications when none provided", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(createdFarm);

      const requestWithoutCerts = { ...mockCreateRequest, certifications: [] };
      await repository.create(requestWithoutCerts);

      const callArgs = (database.farm.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.certifications).toBeUndefined();
    });

    it("should include default relations in created farm", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(createdFarm);

      await repository.create(mockCreateRequest);

      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            owner: expect.any(Object),
            _count: expect.any(Object),
          }),
        }),
      );
    });

    it("should throw DatabaseError on creation failure", async () => {
      const dbError = new Error("Unique constraint violation");
      (database.farm.create as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.create(mockCreateRequest)).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  // ==================== UPDATE TESTS ====================
  describe("update", () => {
    const updateRequest: UpdateFarmRequest = {
      name: "Updated Farm Name",
      description: "Updated description",
      status: "ACTIVE",
    };

    const updatedFarm = { ...mockFarm, ...updateRequest };

    it("should update farm with provided fields", async () => {
      (database.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      const result = await repository.update(mockFarmId, updateRequest);

      expect(result).toEqual(updatedFarm);
      expect(database.farm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockFarmId },
          data: expect.objectContaining({
            name: "Updated Farm Name",
            description: "Updated description",
            status: "ACTIVE",
          }),
        }),
      );
    });

    it("should regenerate slug when name is updated", async () => {
      (database.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      await repository.update(mockFarmId, { name: "New Farm Name" });

      expect(database.farm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "New Farm Name",
            slug: "new-farm-name",
          }),
        }),
      );
    });

    it("should update coordinates when provided", async () => {
      (database.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      await repository.update(mockFarmId, {
        coordinates: { lat: 35.6762, lng: 139.6503 },
      });

      expect(database.farm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            latitude: 35.6762,
            longitude: 139.6503,
          }),
        }),
      );
    });

    it("should update images when provided", async () => {
      (database.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      const newImages = ["new1.jpg", "new2.jpg", "new3.jpg"];
      await repository.update(mockFarmId, { images: newImages });

      expect(database.farm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            images: newImages,
          }),
        }),
      );
    });

    it("should handle partial updates correctly", async () => {
      (database.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      await repository.update(mockFarmId, {
        description: "Only description update",
      });

      expect(database.farm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: "Only description update",
            updatedAt: expect.any(Date),
          }),
        }),
      );
    });

    it("should update certifications when provided", async () => {
      (database.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      await repository.update(mockFarmId, {
        certifications: ["New Organic", "Fair Trade"],
      });

      expect(database.farm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            certifications: {
              deleteMany: {},
              create: expect.arrayContaining([
                expect.objectContaining({
                  certifierName: "New Organic",
                  status: "VERIFIED",
                }),
                expect.objectContaining({
                  certifierName: "Fair Trade",
                  status: "VERIFIED",
                }),
              ]),
            },
          }),
        }),
      );
    });

    it("should include updatedAt timestamp", async () => {
      (database.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      await repository.update(mockFarmId, updateRequest);

      expect(database.farm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            updatedAt: expect.any(Date),
          }),
        }),
      );
    });

    it("should throw DatabaseError on update failure", async () => {
      const dbError = new Error("Farm not found");
      (database.farm.update as jest.Mock).mockRejectedValue(dbError);

      await expect(
        repository.update(mockFarmId, updateRequest),
      ).rejects.toThrow(DatabaseError);
    });
  });

  // ==================== DELETE TESTS ====================
  describe("delete", () => {
    it("should delete farm by ID", async () => {
      (database.farm.delete as jest.Mock).mockResolvedValue(mockFarm);

      await repository.delete(mockFarmId);

      expect(database.farm.delete).toHaveBeenCalledWith({
        where: { id: mockFarmId },
      });
    });

    it("should not throw when deletion succeeds", async () => {
      (database.farm.delete as jest.Mock).mockResolvedValue(mockFarm);

      await expect(repository.delete(mockFarmId)).resolves.not.toThrow();
    });

    it("should throw DatabaseError when farm not found", async () => {
      const dbError = new Error("Farm not found");
      (database.farm.delete as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.delete("nonexistent_id")).rejects.toThrow(
        DatabaseError,
      );
    });

    it("should throw DatabaseError on deletion failure", async () => {
      const dbError = new Error("Foreign key constraint violation");
      (database.farm.delete as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.delete(mockFarmId)).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  // ==================== COUNT BY STATUS TESTS ====================
  describe("countByStatus", () => {
    it("should return farm counts grouped by status", async () => {
      const mockGroupBy = [
        { status: "ACTIVE", _count: 25 },
        { status: "PENDING", _count: 10 },
        { status: "INACTIVE", _count: 5 },
      ];
      (database.farm.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);

      const result = await repository.countByStatus();

      expect(result).toEqual({
        ACTIVE: 25,
        PENDING: 10,
        INACTIVE: 5,
      });
      expect(database.farm.groupBy).toHaveBeenCalledWith({
        by: ["status"],
        _count: true,
      });
    });

    it("should return empty object when no farms exist", async () => {
      (database.farm.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await repository.countByStatus();

      expect(result).toEqual({});
    });

    it("should throw DatabaseError on groupBy failure", async () => {
      const dbError = new Error("GroupBy failed");
      (database.farm.groupBy as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.countByStatus()).rejects.toThrow(DatabaseError);
    });
  });

  // ==================== FIND BY NAME AND OWNER TESTS ====================
  describe("findByNameAndOwner", () => {
    it("should find farm by name and owner ID", async () => {
      (database.farm.findFirst as jest.Mock).mockResolvedValue(mockFarm);

      const result = await repository.findByNameAndOwner(
        "Green Valley Farm",
        mockUserId,
      );

      expect(result).toEqual(mockFarm);
      expect(database.farm.findFirst).toHaveBeenCalledWith({
        where: {
          name: "Green Valley Farm",
          ownerId: mockUserId,
        },
      });
    });

    it("should return null when no matching farm found", async () => {
      (database.farm.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByNameAndOwner(
        "Nonexistent Farm",
        mockUserId,
      );

      expect(result).toBeNull();
    });

    it("should be case-sensitive for name matching", async () => {
      (database.farm.findFirst as jest.Mock).mockResolvedValue(null);

      await repository.findByNameAndOwner("green valley farm", mockUserId);

      expect(database.farm.findFirst).toHaveBeenCalledWith({
        where: {
          name: "green valley farm",
          ownerId: mockUserId,
        },
      });
    });

    it("should throw DatabaseError on query failure", async () => {
      const dbError = new Error("Query failed");
      (database.farm.findFirst as jest.Mock).mockRejectedValue(dbError);

      await expect(
        repository.findByNameAndOwner("Farm Name", mockUserId),
      ).rejects.toThrow(DatabaseError);
    });
  });

  // ==================== EDGE CASES AND INTEGRATION ====================
  describe("edge cases and integration scenarios", () => {
    it("should handle empty string search term", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue([mockFarm]);
      (database.farm.count as jest.Mock).mockResolvedValue(1);

      await repository.findWithPagination(
        { searchTerm: "" },
        { page: 1, limit: 10 },
      );

      // Empty string should be treated as no search term
      expect(database.farm.findMany).toHaveBeenCalled();
    });

    it("should handle very long farm names in slug generation", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(mockFarm);

      const longName = "A".repeat(300);
      await repository.create({ ...mockCreateRequest, name: longName });

      const callArgs = (database.farm.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.slug).toBe("a".repeat(300).toLowerCase());
    });

    it("should handle farms with no owner relation", async () => {
      const farmWithoutOwner = { ...mockFarm, owner: null };
      (database.farm.findUnique as jest.Mock).mockResolvedValue(
        farmWithoutOwner,
      );

      const result = await repository.findById(mockFarmId);

      expect(result).toEqual(farmWithoutOwner);
    });

    it("should handle large pagination offsets", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue([]);
      (database.farm.count as jest.Mock).mockResolvedValue(1000);

      await repository.findWithPagination({}, { page: 100, limit: 10 });

      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 990, // (100 - 1) * 10
        }),
      );
    });

    it("should preserve special characters in farm description", async () => {
      (database.farm.create as jest.Mock).mockResolvedValue(mockFarm);

      const specialDescription = "Farm with émojis 🌾 and symbols: @#$%";
      await repository.create({
        ...mockCreateRequest,
        description: specialDescription,
      });

      expect(database.farm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: specialDescription,
          }),
        }),
      );
    });
  });
});
