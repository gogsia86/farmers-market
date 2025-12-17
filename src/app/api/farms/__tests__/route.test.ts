/**
 * 🌾 FARMS API ENDPOINT TESTS
 * Comprehensive testing for farm management API routes
 */

// Mock dependencies FIRST (before imports)
jest.mock("next-auth/providers/credentials", () => {
  const mockProvider = jest.fn(() => ({
    id: "credentials",
    name: "Credentials",
    type: "credentials",
    credentials: {},
    authorize: jest.fn(),
  }));
  return {
    __esModule: true,
    default: mockProvider,
  };
});

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}));

// Mock middleware to avoid test interference
jest.mock("@/lib/middleware/compression", () => ({
  withCompression: (handler: any) => handler,
}));

jest.mock("@/lib/middleware/api-cache", () => ({
  withApiCache: (handler: any) => handler,
  invalidateCacheByTag: jest.fn(),
}));

jest.mock("@/lib/auth/config", () => ({
  __esModule: true,
  authConfig: {
    providers: [],
    callbacks: {
      jwt: jest.fn(),
      session: jest.fn(),
    },
    pages: {
      signIn: "/auth/signin",
      signOut: "/auth/signout",
      error: "/auth/error",
    },
  },
  handlers: { GET: jest.fn(), POST: jest.fn() },
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@opentelemetry/api", () => {
  return require("../../__mocks__/tracing-mocks").mockOpenTelemetryApi;
});

jest.mock("@/lib/tracing/agricultural-tracer", () => {
  return require("../../__mocks__/tracing-mocks").mockAgriculturalTracer;
});

jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/rate-limiter", () => ({
  rateLimiters: {
    public: {
      check: jest.fn(),
    },
    api: {
      check: jest.fn(),
    },
  },
  createRateLimitResponse: jest.fn(),
}));

jest.mock("@/lib/controllers", () => ({
  farmController: {
    listFarms: jest.fn(),
    createFarm: jest.fn(),
  },
}));

// Now import after mocks are set up
import { GET, POST } from "../route";
import { farmController } from "@/lib/controllers";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import {
  createMockNextRequest,
  createMockFarm,
} from "../../__mocks__/api-test-utils";

describe("🌾 Farms API - GET /api/farms", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock farmController.listFarms to return NextResponse
    (farmController.listFarms as jest.Mock).mockImplementation(async () => {
      const mockFarms = [createMockFarm(), createMockFarm()];
      return NextResponse.json({
        success: true,
        data: mockFarms,
        meta: { total: mockFarms.length },
      });
    });

    // Get the mocked module and reset
    const {
      rateLimiters,
      createRateLimitResponse,
    } = require("@/lib/middleware/rate-limiter");

    // Reset rate limiter mocks to success by default
    (rateLimiters.public.check as jest.Mock).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });

    (rateLimiters.api.check as jest.Mock).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });

    (createRateLimitResponse as jest.Mock).mockImplementation((rateLimit) => ({
      json: async () => ({
        success: false,
        error: "Rate limit exceeded",
        rateLimit,
      }),
      status: 429,
      headers: new Headers(),
    }));
  });

  describe("✅ Successful Retrieval", () => {
    it("should fetch all farms successfully", async () => {
      const mockFarms = [
        createMockFarm({ id: "farm-1", name: "Farm One" }),
        createMockFarm({ id: "farm-2", name: "Farm Two" }),
      ];

      (farmController.listFarms as jest.Mock).mockResolvedValue(
        NextResponse.json({
          success: true,
          data: mockFarms,
        }),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      const response = await GET(request);

      if (!response) {
        throw new Error("GET returned undefined");
      }

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].name).toBe("Farm One");
      expect(data.data[1].name).toBe("Farm Two");
      expect(farmController.listFarms).toHaveBeenCalledWith(request);
    });

    it("should delegate to farmController", async () => {
      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      await GET(request);

      expect(farmController.listFarms).toHaveBeenCalledWith(request);
      expect(farmController.listFarms).toHaveBeenCalledTimes(1);
    });

    it("should return successful response with farms data", async () => {
      const mockFarms = [createMockFarm(), createMockFarm()];

      (farmController.listFarms as jest.Mock).mockResolvedValue(
        NextResponse.json({
          success: true,
          data: mockFarms,
          meta: { count: 2 },
        }),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
    });

    it("should handle empty results from controller", async () => {
      (farmController.listFarms as jest.Mock).mockResolvedValue(
        NextResponse.json({
          success: true,
          data: [],
          meta: { count: 0 },
        }),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });
  });

  describe("❌ Error Handling", () => {
    it("should handle controller errors gracefully", async () => {
      (farmController.listFarms as jest.Mock).mockResolvedValue(
        NextResponse.json(
          {
            success: false,
            error: "Failed to fetch farms",
          },
          { status: 500 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe("🚦 Rate Limiting", () => {
    it("should apply rate limiting to GET requests", async () => {
      const { rateLimiters } = require("@/lib/middleware/rate-limiter");
      (database.farm.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      await GET(request);

      expect(rateLimiters.public.check).toHaveBeenCalledWith(request);
    });

    it("should return 429 when rate limit exceeded", async () => {
      const {
        rateLimiters,
        createRateLimitResponse,
      } = require("@/lib/middleware/rate-limiter");

      (rateLimiters.public.check as jest.Mock).mockResolvedValueOnce({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      const response = await GET(request);

      expect(createRateLimitResponse).toHaveBeenCalled();
    });
  });

  describe("🔒 Rate Limiting", () => {
    it("should apply rate limiting before processing request", async () => {
      const { rateLimiters } = require("@/lib/middleware/rate-limiter");

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      await GET(request);

      expect(rateLimiters.public.check).toHaveBeenCalledWith(request);
      expect(farmController.listFarms).toHaveBeenCalledWith(request);
    });

    it("should return 429 when rate limit exceeded", async () => {
      const {
        rateLimiters,
        createRateLimitResponse,
      } = require("@/lib/middleware/rate-limiter");

      (rateLimiters.public.check as jest.Mock).mockResolvedValue({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      (createRateLimitResponse as jest.Mock).mockReturnValue(
        NextResponse.json(
          { success: false, error: "Rate limit exceeded" },
          { status: 429 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      const response = await GET(request);

      expect(response.status).toBe(429);
      expect(farmController.listFarms).not.toHaveBeenCalled();
    });
  });
});

describe("🌾 Farms API - POST /api/farms", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Get the mocked module and reset
    const { rateLimiters } = require("@/lib/middleware/rate-limiter");

    // Reset rate limiter mocks to success by default
    (rateLimiters.public.check as jest.Mock).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });

    (rateLimiters.api.check as jest.Mock).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });

    // Mock farmController.createFarm to return NextResponse
    (farmController.createFarm as jest.Mock).mockImplementation(async () => {
      const mockFarm = createMockFarm();
      return NextResponse.json(
        {
          success: true,
          data: mockFarm,
          message: "Farm manifested with divine consciousness",
        },
        { status: 201 },
      );
    });
  });

  describe("✅ Successful Creation", () => {
    it("should create a new farm successfully", async () => {
      const newFarm = createMockFarm({ name: "New Farm" });

      (farmController.createFarm as jest.Mock).mockResolvedValue(
        NextResponse.json(
          {
            success: true,
            data: newFarm,
            message: "Farm manifested with divine consciousness",
          },
          { status: 201 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "POST",
        body: {
          name: "New Farm",
          description: "A farm with consciousness",
          address: "123 Farm Road",
          ownerId: "owner-123",
          coordinates: { lat: 38.5816, lng: -121.4944 },
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.name).toBe("New Farm");
      expect(data.message).toContain("consciousness");
      expect(response.status).toBe(201);
      expect(farmController.createFarm).toHaveBeenCalledWith(request);
    });

    it("should delegate to farmController", async () => {
      const request = createMockNextRequest({
        url: "/api/farms",
        method: "POST",
        body: {
          name: "New Farm",
          description: "A farm with consciousness",
          address: "123 Farm Road",
          ownerId: "owner-123",
        },
      });

      await POST(request);

      expect(farmController.createFarm).toHaveBeenCalledWith(request);
      expect(farmController.createFarm).toHaveBeenCalledTimes(1);
    });

    it("should return 201 status for successful creation", async () => {
      const newFarm = createMockFarm({ name: "Complete Farm" });

      (farmController.createFarm as jest.Mock).mockResolvedValue(
        NextResponse.json(
          {
            success: true,
            data: newFarm,
            message: "Farm created successfully",
          },
          { status: 201 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "POST",
        body: {
          name: "Complete Farm",
          description: "A complete farm with all fields",
          address: "456 Complete Road",
          ownerId: "owner-123",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(farmController.createFarm).toHaveBeenCalledWith(request);
    });
  });

  describe("❌ Error Handling", () => {
    it("should handle controller errors during creation", async () => {
      (farmController.createFarm as jest.Mock).mockResolvedValue(
        NextResponse.json(
          {
            success: false,
            error: "Failed to create farm",
          },
          { status: 500 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "POST",
        body: {
          name: "Test Farm",
          address: "Test Address",
          ownerId: "owner-123",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe("🔒 Rate Limiting", () => {
    it("should apply API rate limiting for POST requests", async () => {
      const { rateLimiters } = require("@/lib/middleware/rate-limiter");

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "POST",
        body: {
          name: "Test Farm",
          address: "123 Test St",
          ownerId: "owner-123",
        },
      });

      await POST(request);

      expect(rateLimiters.api.check).toHaveBeenCalledWith(request);
      expect(farmController.createFarm).toHaveBeenCalledWith(request);
    });

    it("should return 429 when API rate limit exceeded", async () => {
      const {
        rateLimiters,
        createRateLimitResponse,
      } = require("@/lib/middleware/rate-limiter");

      (rateLimiters.api.check as jest.Mock).mockResolvedValue({
        success: false,
        limit: 50,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      (createRateLimitResponse as jest.Mock).mockReturnValue(
        NextResponse.json(
          { success: false, error: "Rate limit exceeded" },
          { status: 429 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "POST",
        body: {
          name: "Test Farm",
          address: "123 Test St",
          ownerId: "owner-123",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
      expect(farmController.createFarm).not.toHaveBeenCalled();
    });
  });
});
