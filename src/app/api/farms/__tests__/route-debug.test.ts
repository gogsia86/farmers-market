/**
 * 🔍 DEBUG TEST - Isolate tracing mock issue
 */

// Mock FIRST - with inline definitions using plain functions (NOT jest.fn())
jest.mock("@opentelemetry/api", () => {
  const mockSpan = {
    setStatus: () => {},
    setAttributes: () => {},
    setAttribute: () => {},
    addEvent: () => {},
    recordException: () => {},
    end: () => {},
    isRecording: () => true,
    spanContext: () => ({
      traceId: "mock-trace-id",
      spanId: "mock-span-id",
      traceFlags: 1,
    }),
  };

  return {
    trace: {
      getTracer: () => ({
        startSpan: () => mockSpan,
        startActiveSpan: async (name, fnOrOptions, maybeFn) => {
          const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
          if (typeof fn === "function") {
            try {
              const result = await fn(mockSpan);
              return result;
            } catch (error) {
              mockSpan.recordException(error);
              mockSpan.setStatus({ code: 2, message: error.message });
              throw error;
            }
          }
          return mockSpan;
        },
      }),
      getActiveSpan: () => mockSpan,
    },
    SpanStatusCode: { UNSET: 0, OK: 1, ERROR: 2 },
  };
});

jest.mock("@/lib/tracing/agricultural-tracer", () => ({
  AgriculturalOperation: {
    CROP_PLANNING: "crop.planning",
    PLANTING: "crop.planting",
    HARVESTING: "crop.harvesting",
    SOIL_ANALYSIS: "soil.analysis",
    WEATHER_PREDICTION: "weather.prediction",
    LUNAR_CALCULATION: "lunar.calculation",
    CONSCIOUSNESS_MEASUREMENT: "consciousness.measurement",
    BIODYNAMIC_ASSESSMENT: "biodynamic.assessment",
  },
  setAgriculturalAttributes: async (attributes) => {
    console.log("🔍 setAgriculturalAttributes called");
  },
  addAgriculturalEvent: async (name, attributes) => {
    console.log("🔍 addAgriculturalEvent called");
  },
  traceAgriculturalOperation: async (operation, attributes, fn) => {
    console.log("🔍 MOCK traceAgriculturalOperation called!");
    console.log("  - operation:", operation);
    console.log("  - attributes:", attributes);
    console.log("  - fn type:", typeof fn);
    if (typeof fn === "function") {
      console.log("  - Calling fn()...");
      const result = await fn();
      console.log("  - Result from fn():", result);
      return result;
    }
    console.log("  - No function provided, returning undefined");
    return undefined;
  },
  traceSeasonalOperation: async (season, operation, fn) => {
    if (typeof fn === "function") {
      const result = await fn();
      return result;
    }
    return undefined;
  },
  traceLunarOperation: async (phase, fn) => {
    if (typeof fn === "function") {
      const result = await fn();
      return result;
    }
    return undefined;
  },
  traceConsciousnessMeasurement: async (level, fn) => {
    if (typeof fn === "function") {
      const result = await fn();
      return result;
    }
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
      check: async () => ({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      }),
    },
  },
  createRateLimitResponse: () => {},
}));

// Now import after mocks are set up
import { GET, POST } from "../route";
import { database } from "@/lib/database";
import {
  createMockNextRequest,
  createMockFarm,
} from "../../__mocks__/api-test-utils";

describe("🔍 DEBUG - Farms API", () => {
  beforeEach(() => {
    // DON'T use clearAllMocks() - it removes implementations!
    // Just clear call history for database mocks
    const { database } = require("@/lib/database");
    if (database.farm.findMany.mockClear) {
      database.farm.findMany.mockClear();
    }
    if (database.farm.create.mockClear) {
      database.farm.create.mockClear();
    }
  });

  it("DEBUG: should check if GET returns anything", async () => {
    console.log("=== DEBUG TEST START ===");

    const mockFarms = [createMockFarm({ name: "Test Farm" })];
    console.log("Mock farms created:", mockFarms.length, "farms");

    (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
    console.log("Database mock configured");

    const request = createMockNextRequest({
      url: "/api/farms",
      method: "GET",
    });
    console.log("Request created:", request.url);

    console.log("Calling GET...");
    const response = await GET(request);
    console.log("GET returned:", typeof response);
    console.log("Response defined?", response !== undefined);
    console.log("Response null?", response === null);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();

    if (response) {
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data success:", data.success);
      console.log("Response data count:", data.data?.length);

      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockFarms);
    }
  });

  it("DEBUG: should check database mock is called", async () => {
    const mockFarms = [createMockFarm()];
    (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);

    const request = createMockNextRequest({
      url: "/api/farms",
      method: "GET",
    });

    await GET(request);

    console.log(
      "Database.farm.findMany called:",
      (database.farm.findMany as jest.Mock).mock.calls.length,
    );
    console.log("Call args:", (database.farm.findMany as jest.Mock).mock.calls);

    expect(database.farm.findMany).toHaveBeenCalled();
  });

  it("DEBUG: test tracer mock directly", async () => {
    const { trace } = require("@opentelemetry/api");

    console.log("trace object:", typeof trace);
    console.log("getTracer:", typeof trace.getTracer);

    const tracer = trace.getTracer("test");
    console.log("tracer:", typeof tracer);
    console.log("startActiveSpan:", typeof tracer.startActiveSpan);

    // Test that startActiveSpan returns callback result
    const result = await tracer.startActiveSpan(
      "test-span",
      async (span: any) => {
        console.log("Inside callback, span:", typeof span);
        return { success: true, value: 42 };
      },
    );

    console.log("Callback result:", result);
    expect(result).toEqual({ success: true, value: 42 });
  });

  it("DEBUG: test agricultural tracer mock", async () => {
    console.log("\n=== TESTING AGRICULTURAL TRACER MOCK ===");

    // Don't use require - use import from top of file
    const { traceAgriculturalOperation } = jest.requireMock(
      "@/lib/tracing/agricultural-tracer",
    );

    console.log(
      "traceAgriculturalOperation:",
      typeof traceAgriculturalOperation,
    );
    console.log(
      "traceAgriculturalOperation mock?",
      jest.isMockFunction(traceAgriculturalOperation),
    );
    console.log(
      "traceAgriculturalOperation calls:",
      (traceAgriculturalOperation as any).mock?.calls?.length || 0,
    );

    // Check if it has an implementation
    const impl = (traceAgriculturalOperation as any).getMockImplementation?.();
    console.log("Has mock implementation?", impl !== undefined);

    // Call it directly to see what happens
    const testCallback = async () => {
      console.log("🎯 Inside test callback");
      return { data: "test" };
    };

    console.log("\n📞 Calling traceAgriculturalOperation...");
    const result = await traceAgriculturalOperation(
      "test-op",
      { attr: "value" },
      testCallback,
    );

    console.log("\n📊 Agricultural operation result:", result);
    console.log("Result type:", typeof result);

    // If still undefined, the mock implementation isn't being called
    // This means jest.clearAllMocks() is removing it
    expect(result).toEqual({ data: "test" });
  });

  it("DEBUG: full integration test", async () => {
    const mockFarms = [
      createMockFarm({ id: "farm-1", name: "Farm One" }),
      createMockFarm({ id: "farm-2", name: "Farm Two" }),
    ];

    (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);

    const request = createMockNextRequest({
      url: "/api/farms",
      method: "GET",
    });

    const response = await GET(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].name).toBe("Farm One");
    expect(data.data[1].name).toBe("Farm Two");
    expect(data.meta.count).toBe(2);
  });
});
