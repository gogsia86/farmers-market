/**
 * MINIMAL DEBUG TEST
 * Isolate the tracer mock issue with absolute minimal setup
 */

// Mock dependencies FIRST
jest.mock("@opentelemetry/api", () => {
  const mockSpan = {
    setStatus: function () {},
    setAttributes: function () {},
    setAttribute: function () {},
    addEvent: function () {},
    recordException: function () {},
    end: function () {},
    isRecording: function () {
      return true;
    },
    spanContext: function () {
      return {
        traceId: "mock-trace-id",
        spanId: "mock-span-id",
        traceFlags: 1,
      };
    },
  };

  return {
    trace: {
      getTracer: function () {
        console.log("🔍 getTracer called - returning tracer object");
        return {
          startSpan: function () {
            return mockSpan;
          },
          startActiveSpan: async function (
            name: string,
            fnOrOptions: any,
            maybeFn?: any,
          ) {
            console.log("🔍 startActiveSpan called with:", name);
            const fn =
              typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
            if (typeof fn === "function") {
              console.log("🔍 Executing callback...");
              try {
                const result = await fn(mockSpan);
                console.log("🔍 Callback result:", result);
                return result;
              } catch (error: any) {
                console.log("🔍 Callback error:", error);
                mockSpan.recordException(error);
                mockSpan.setStatus({ code: 2, message: error.message });
                throw error;
              }
            }
            console.log("🔍 No callback, returning span");
            return mockSpan;
          },
        };
      },
      getActiveSpan: function () {
        return mockSpan;
      },
      setSpan: function () {},
      getSpan: function () {
        return mockSpan;
      },
    },
    context: {
      active: function () {
        return {};
      },
      with: function (ctx: any, fn: any) {
        return fn();
      },
    },
    SpanStatusCode: {
      UNSET: 0,
      OK: 1,
      ERROR: 2,
    },
    SpanKind: {
      INTERNAL: 0,
      SERVER: 1,
      CLIENT: 2,
      PRODUCER: 3,
      CONSUMER: 4,
    },
  };
});

jest.mock("@/lib/tracing/agricultural-tracer", () => ({
  AgriculturalOperation: {
    CROP_PLANNING: "crop.planning",
    PLANTING: "crop.planting",
    HARVESTING: "crop.harvesting",
  },
  setAgriculturalAttributes: function (attrs: any) {
    console.log("🌾 setAgriculturalAttributes called:", attrs);
  },
  addAgriculturalEvent: function () {},
  traceAgriculturalOperation: async function (
    operation: string,
    attributes: any,
    fn: any,
  ) {
    console.log("🌾 traceAgriculturalOperation called:", operation);
    if (typeof fn === "function") {
      console.log("🌾 Executing operation callback...");
      const result = await fn();
      console.log("🌾 Operation result:", result);
      return result;
    }
    console.log("🌾 No callback provided");
    return undefined;
  },
}));

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
  },
  createRateLimitResponse: jest.fn(),
}));

// Import after mocks
import { GET, POST } from "../route";
import { database } from "@/lib/database";
import { NextRequest } from "next/server";
import { trace } from "@opentelemetry/api";
import { traceAgriculturalOperation } from "@/lib/tracing/agricultural-tracer";

describe("🔬 Minimal Debug Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup rate limiter mock to return success
    const { rateLimiters } = require("@/lib/middleware/rate-limiter");
    (rateLimiters.public.check as jest.Mock).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });

    console.log("🔍 Verifying mocks are in place:");
    console.log("🔍 trace.getTracer type:", typeof trace.getTracer);
    console.log(
      "🔍 traceAgriculturalOperation type:",
      typeof traceAgriculturalOperation,
    );
    console.log(
      "🔍 database.farm.findMany is mock?",
      jest.isMockFunction(database.farm.findMany),
    );
  });

  it("should trace through startActiveSpan correctly", async () => {
    console.log("\n\n🚀 TEST STARTING\n");

    // Verify tracer mock
    const tracer = trace.getTracer("farms-api", "1.0.0");
    console.log("🔍 Got tracer:", tracer);
    console.log(
      "🔍 Tracer keys:",
      tracer ? Object.keys(tracer) : "null/undefined",
    );
    if (tracer) {
      console.log(
        "🔍 tracer.startActiveSpan type:",
        typeof tracer.startActiveSpan,
      );
    }

    // Setup mock data
    const mockFarms = [
      {
        id: "farm-1",
        name: "Test Farm",
        description: "A test farm",
        address: "123 Farm Road",
        latitude: 40.7128,
        longitude: -74.006,
        ownerId: "owner-1",
        status: "ACTIVE",
        seasonalAlignment: "SPRING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log("📦 Mock farms:", mockFarms);

    // Configure database mock
    (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
    console.log("✅ Database mock configured");

    // Create request
    const request = new NextRequest("http://localhost:3000/api/farms", {
      method: "GET",
    });
    console.log("📨 Request created");

    // Call the route
    console.log("🎯 Calling GET route...\n");
    const response = await GET(request);

    console.log("\n📥 Response received:", response);
    console.log("📥 Response type:", typeof response);
    console.log("📥 Response is null?", response === null);
    console.log("📥 Response is undefined?", response === undefined);

    // Assertions
    expect(response).toBeDefined();
    expect(response).not.toBeNull();

    if (response) {
      const data = await response.json();
      console.log("📊 Response data:", data);

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe("Test Farm");
    }
  });

  it("should handle POST request correctly", async () => {
    console.log("\n\n🚀 POST TEST STARTING\n");

    const newFarm = {
      id: "farm-new",
      name: "New Farm",
      description: "A new farm",
      address: "456 New Farm Road",
      latitude: 40.7128,
      longitude: -74.006,
      ownerId: "owner-1",
      status: "PENDING_VERIFICATION",
      seasonalAlignment: "SPRING",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (database.farm.create as jest.Mock).mockResolvedValue(newFarm);
    console.log("✅ Database mock configured for POST");

    const request = new NextRequest("http://localhost:3000/api/farms", {
      method: "POST",
      body: JSON.stringify({
        name: "New Farm",
        description: "A new farm",
        address: "456 New Farm Road",
        ownerId: "owner-1",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("🎯 Calling POST route...\n");
    const response = await POST(request);

    console.log("\n📥 Response received:", response);
    console.log("📥 Response type:", typeof response);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();

    if (response) {
      const data = await response.json();
      console.log("📊 Response data:", data);

      expect(data.success).toBe(true);
      expect(data.data.name).toBe("New Farm");
    }
  });
});
