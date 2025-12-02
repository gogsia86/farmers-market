/**
 * 🔬 CONSOLIDATED TRACING MOCKS
 * Reusable OpenTelemetry and Agricultural Tracer mocks for API route testing
 *
 * CRITICAL FIXES APPLIED:
 * 1. startActiveSpan MUST await and return the callback result
 * 2. Supports both (name, fn) and (name, options, fn) signatures
 * 3. Agricultural tracer calls fn() WITHOUT passing span (matches real implementation)
 * 4. All objects use inline factories to work with Jest hoisting
 *
 * USAGE:
 * ```typescript
 * // At top of test file (before imports)
 * jest.mock("@opentelemetry/api", () => {
 *   return require("../../__mocks__/tracing-mocks").mockOpenTelemetryApi;
 * });
 *
 * jest.mock("@/lib/tracing/agricultural-tracer", () => {
 *   return require("../../__mocks__/tracing-mocks").mockAgriculturalTracer;
 * });
 * ```
 */

/**
 * ✅ ACTUAL MOCK EXPORTS
 * These can be used in jest.mock() calls with require()
 */

// Create mock span object
const mockSpan = {
  setStatus () {},
  setAttributes () {},
  setAttribute () {},
  addEvent () {},
  recordException () {},
  end () {},
  isRecording () {
    return true;
  },
  spanContext () {
    return {
      traceId: "mock-trace-id-12345678",
      spanId: "mock-span-id-87654321",
      traceFlags: 1,
    };
  },
};

/**
 * Mock OpenTelemetry API module
 * Use with: jest.mock("@opentelemetry/api", () => require("./tracing-mocks").mockOpenTelemetryApi)
 */
export const mockOpenTelemetryApi = {
  trace: {
    getTracer () {
      return {
        startSpan () {
          return mockSpan;
        },
        async startActiveSpan (
          name: string,
          fnOrOptions: any,
          maybeFn?: any,
        ) {
          const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
          if (typeof fn === "function") {
            try {
              const result = await fn(mockSpan);
              return result;
            } catch (error: any) {
              mockSpan.recordException(error);
              mockSpan.setStatus({ code: 2, message: error.message });
              throw error;
            }
          }
          return mockSpan;
        },
      };
    },
    getActiveSpan () {
      return mockSpan;
    },
    setSpan () {},
    getSpan () {
      return mockSpan;
    },
  },
  context: {
    active () {
      return {};
    },
    with (ctx: any, fn: any) {
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
  propagation: {
    extract () {},
    inject () {},
  },
};

/**
 * Mock Agricultural Tracer module
 * Use with: jest.mock("@/lib/tracing/agricultural-tracer", () => require("./tracing-mocks").mockAgriculturalTracer)
 */
export const mockAgriculturalTracer = {
  AgriculturalOperation: {
    CROP_PLANNING: "crop.planning",
    PLANTING: "crop.planting",
    HARVESTING: "crop.harvesting",
    SOIL_ANALYSIS: "soil.analysis",
    WEATHER_PREDICTION: "weather.prediction",
    LUNAR_CALCULATION: "lunar.calculation",
    CONSCIOUSNESS_MEASUREMENT: "consciousness.measurement",
    BIODYNAMIC_ASSESSMENT: "biodynamic.assessment",
    FARM_CREATION: "farm.creation",
    FARM_UPDATE: "farm.update",
    PRODUCT_LISTING: "product.listing",
    ORDER_PROCESSING: "order.processing",
  },
  setAgriculturalAttributes () {},
  addAgriculturalEvent () {},
  async traceAgriculturalOperation (
    operation: string,
    attributes: any,
    fn: any,
  ) {
    if (typeof fn === "function") {
      return await fn(); // Call WITHOUT span parameter
    }
    return undefined;
  },
  async traceSeasonalOperation (
    season: string,
    operation: string,
    fn: any,
  ) {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
  async traceLunarOperation (phase: string, fn: any) {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
  async traceConsciousnessMeasurement (level: string, fn: any) {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
  async traceBiodynamicOperation (operation: string, fn: any) {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
};

/**
 * Create OpenTelemetry mock - USE THIS INLINE IN jest.mock()
 *
 * Example:
 * ```typescript
 * jest.mock("@opentelemetry/api", () => {
 *   const mockSpan = {
 *     setStatus: jest.fn(),
 *     setAttributes: jest.fn(),
 *     setAttribute: jest.fn(),
 *     addEvent: jest.fn(),
 *     recordException: jest.fn(),
 *     end: jest.fn(),
 *     isRecording: jest.fn().mockReturnValue(true),
 *     spanContext: jest.fn().mockReturnValue({
 *       traceId: "mock-trace-id-12345678",
 *       spanId: "mock-span-id-87654321",
 *       traceFlags: 1,
 *     }),
 *   };
 *
 *   return {
 *     trace: {
 *       getTracer: jest.fn(() => ({
 *         startSpan: jest.fn().mockReturnValue(mockSpan),
 *         startActiveSpan: jest.fn(async (name, fnOrOptions, maybeFn) => {
 *           const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
 *           if (typeof fn === "function") {
 *             try {
 *               const result = await fn(mockSpan);
 *               return result;
 *             } catch (error) {
 *               mockSpan.recordException(error);
 *               mockSpan.setStatus({ code: 2, message: error.message });
 *               throw error;
 *             }
 *           }
 *           return mockSpan;
 *         }),
 *       })),
 *       getActiveSpan: jest.fn(() => mockSpan),
 *       setSpan: jest.fn(),
 *       getSpan: jest.fn(() => mockSpan),
 *     },
 *     context: {
 *       active: jest.fn().mockReturnValue({}),
 *       with: jest.fn((ctx, fn) => fn()),
 *     },
 *     SpanStatusCode: {
 *       UNSET: 0,
 *       OK: 1,
 *       ERROR: 2,
 *     },
 *     SpanKind: {
 *       INTERNAL: 0,
 *       SERVER: 1,
 *       CLIENT: 2,
 *       PRODUCER: 3,
 *       CONSUMER: 4,
 *     },
 *     propagation: {
 *       extract: jest.fn(),
 *       inject: jest.fn(),
 *     },
 *   };
 * });
 * ```
 */
export const OPENTELEMETRY_MOCK_TEMPLATE = `
jest.mock("@opentelemetry/api", () => {
  const mockSpan = {
    setStatus: jest.fn(),
    setAttributes: jest.fn(),
    setAttribute: jest.fn(),
    addEvent: jest.fn(),
    recordException: jest.fn(),
    end: jest.fn(),
    isRecording: jest.fn().mockReturnValue(true),
    spanContext: jest.fn().mockReturnValue({
      traceId: "mock-trace-id",
      spanId: "mock-span-id",
      traceFlags: 1,
    }),
  };

  return {
    trace: {
      getTracer: jest.fn(() => ({
        startSpan: jest.fn().mockReturnValue(mockSpan),
        startActiveSpan: jest.fn(async (name, fnOrOptions, maybeFn) => {
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
        }),
      })),
      getActiveSpan: jest.fn(() => mockSpan),
    },
    SpanStatusCode: { UNSET: 0, OK: 1, ERROR: 2 },
  };
});
`;

/**
 * Create Agricultural Tracer mock - USE THIS INLINE IN jest.mock()
 *
 * CRITICAL: Agricultural operations call fn() WITHOUT passing span parameter!
 *
 * Example:
 * ```typescript
 * jest.mock("@/lib/tracing/agricultural-tracer", () => ({
 *   AgriculturalOperation: {
 *     CROP_PLANNING: "crop.planning",
 *     PLANTING: "crop.planting",
 *     HARVESTING: "crop.harvesting",
 *     SOIL_ANALYSIS: "soil.analysis",
 *     WEATHER_PREDICTION: "weather.prediction",
 *     LUNAR_CALCULATION: "lunar.calculation",
 *     CONSCIOUSNESS_MEASUREMENT: "consciousness.measurement",
 *     BIODYNAMIC_ASSESSMENT: "biodynamic.assessment",
 *     FARM_CREATION: "farm.creation",
 *     FARM_UPDATE: "farm.update",
 *     PRODUCT_LISTING: "product.listing",
 *     ORDER_PROCESSING: "order.processing",
 *   },
 *   setAgriculturalAttributes: jest.fn(),
 *   addAgriculturalEvent: jest.fn(),
 *   traceAgriculturalOperation: jest.fn(async (operation, attributes, fn) => {
 *     if (typeof fn === "function") {
 *       return await fn();
 *     }
 *     return undefined;
 *   }),
 *   traceSeasonalOperation: jest.fn(async (season, operation, fn) => {
 *     if (typeof fn === "function") {
 *       return await fn();
 *     }
 *     return undefined;
 *   }),
 *   traceLunarOperation: jest.fn(async (phase, fn) => {
 *     if (typeof fn === "function") {
 *       return await fn();
 *     }
 *     return undefined;
 *   }),
 *   traceConsciousnessMeasurement: jest.fn(async (level, fn) => {
 *     if (typeof fn === "function") {
 *       return await fn();
 *     }
 *     return undefined;
 *   }),
 *   traceBiodynamicOperation: jest.fn(async (operation, fn) => {
 *     if (typeof fn === "function") {
 *       return await fn();
 *     }
 *     return undefined;
 *   }),
 * }));
 * ```
 */
export const AGRICULTURAL_TRACER_MOCK_TEMPLATE = `
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
    FARM_CREATION: "farm.creation",
    FARM_UPDATE: "farm.update",
    PRODUCT_LISTING: "product.listing",
    ORDER_PROCESSING: "order.processing",
  },
  setAgriculturalAttributes: jest.fn(),
  addAgriculturalEvent: jest.fn(),
  traceAgriculturalOperation: jest.fn(async (operation, attributes, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  }),
  traceSeasonalOperation: jest.fn(async (season, operation, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  }),
  traceLunarOperation: jest.fn(async (phase, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  }),
  traceConsciousnessMeasurement: jest.fn(async (level, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  }),
  traceBiodynamicOperation: jest.fn(async (operation, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  }),
}));
`;

/**
 * COMPLETE EXAMPLE TEST FILE
 * Copy this pattern for your API route tests
 */
export const COMPLETE_TEST_EXAMPLE = `
/**
 * Example API Route Test with Tracing Mocks
 */

// 1. MOCK DEPENDENCIES FIRST (before any imports)
jest.mock("@opentelemetry/api", () => {
  const mockSpan = {
    setStatus: jest.fn(),
    setAttributes: jest.fn(),
    setAttribute: jest.fn(),
    addEvent: jest.fn(),
    recordException: jest.fn(),
    end: jest.fn(),
    isRecording: jest.fn().mockReturnValue(true),
    spanContext: jest.fn().mockReturnValue({
      traceId: "mock-trace-id",
      spanId: "mock-span-id",
      traceFlags: 1,
    }),
  };

  return {
    trace: {
      getTracer: jest.fn(() => ({
        startSpan: jest.fn().mockReturnValue(mockSpan),
        startActiveSpan: jest.fn(async (name, fnOrOptions, maybeFn) => {
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
        }),
      })),
      getActiveSpan: jest.fn(() => mockSpan),
    },
    SpanStatusCode: { UNSET: 0, OK: 1, ERROR: 2 },
  };
});

jest.mock("@/lib/tracing/agricultural-tracer", () => ({
  AgriculturalOperation: {
    CROP_PLANNING: "crop.planning",
    PLANTING: "crop.planting",
    HARVESTING: "crop.harvesting",
  },
  setAgriculturalAttributes: jest.fn(),
  addAgriculturalEvent: jest.fn(),
  traceAgriculturalOperation: jest.fn(async (operation, attributes, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  }),
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
      check: jest.fn().mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      }),
    },
  },
  createRateLimitResponse: jest.fn(),
}));

// 2. NOW IMPORT AFTER MOCKS ARE SET UP
import { GET, POST } from "../route";
import { database } from "@/lib/database";
import { createMockNextRequest, createMockFarm } from "../../__mocks__/api-test-utils";

describe("Example API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should work with tracing mocks", async () => {
    const mockFarms = [createMockFarm()];

    // Set database mock return value BEFORE calling route
    (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);

    const request = createMockNextRequest({
      url: "/api/farms",
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockFarms);
  });
});
`;

/**
 * Documentation: Why this approach works
 */
export const DOCUMENTATION = `
# Tracing Mocks Documentation

## The Problem

Jest hoists \`jest.mock()\` calls to the top of the file before any imports or code execution.
This means:

1. You CANNOT call helper functions inside jest.mock() - they won't exist yet
2. You CANNOT use variables defined outside jest.mock()
3. You MUST define everything inline

## The Solution

Define all mock objects INLINE inside the jest.mock() call using:
- jest.fn() directly (available in mock scope)
- Plain objects and functions
- No external dependencies

## Critical Patterns

### ✅ CORRECT - OpenTelemetry Mock
\`\`\`typescript
jest.mock("@opentelemetry/api", () => {
  const mockSpan = {
    setStatus: jest.fn(),
    setAttributes: jest.fn(),
    // ... more methods
  };

  return {
    trace: {
      getTracer: jest.fn(() => ({
        startActiveSpan: jest.fn(async (name, fnOrOptions, maybeFn) => {
          const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
          if (typeof fn === "function") {
            const result = await fn(mockSpan);
            return result; // CRITICAL: Return the callback result!
          }
          return mockSpan;
        }),
      })),
    },
    SpanStatusCode: { OK: 1, ERROR: 2 },
  };
});
\`\`\`

### ✅ CORRECT - Agricultural Tracer Mock
\`\`\`typescript
jest.mock("@/lib/tracing/agricultural-tracer", () => ({
  traceAgriculturalOperation: jest.fn(async (op, attrs, fn) => {
    if (typeof fn === "function") {
      return await fn(); // CRITICAL: Call fn() without span parameter!
    }
    return undefined;
  }),
}));
\`\`\`

### ❌ WRONG - Using Helper Functions
\`\`\`typescript
// DON'T DO THIS - createMockTracer() won't exist yet!
jest.mock("@opentelemetry/api", () => {
  return require("./tracing-mocks").mockOpenTelemetryApi; // Won't work
});

jest.mock("@opentelemetry/api", () => {
  return createMockTracer(); // ReferenceError!
});
\`\`\`

## Test File Structure

1. All jest.mock() calls at the TOP (before imports)
2. Define mocks inline with jest.fn()
3. Import modules AFTER mocks are defined
4. Set mock return values in beforeEach or individual tests

## Key Points

- startActiveSpan MUST await and return the callback result
- Agricultural tracer calls fn() WITHOUT passing span
- Database mocks need mockResolvedValue() before each test
- Rate limiter must return success: true by default
`;
