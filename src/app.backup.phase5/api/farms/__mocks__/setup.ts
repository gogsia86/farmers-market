/**
 * 🌾 FARMS API TEST SETUP
 * Centralized mock configuration for farms API route tests
 */

import { createMockSpan } from "../../__mocks__/api-test-utils";

/**
 * Create OpenTelemetry mocks
 */
export function createOpenTelemetryMocks() {
  const mockSpan = createMockSpan();

  const mockStartActiveSpan = async (
    name: string,
    fnOrOptions: any,
    maybeFn?: any,
  ) => {
    // Handle both (name, fn) and (name, options, fn) signatures
    const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
    if (typeof fn === "function") {
      const result = await fn(mockSpan);
      return result;
    }
    return mockSpan;
  };

  return {
    trace: {
      getTracer: jest.fn(() => ({
        startSpan: jest.fn().mockReturnValue(mockSpan),
        startActiveSpan: mockStartActiveSpan,
      })),
      getActiveSpan: jest.fn().mockReturnValue(mockSpan),
    },
    SpanStatusCode: {
      OK: 1,
      ERROR: 2,
      UNSET: 0,
    },
  };
}

/**
 * Create agricultural tracer mocks
 */
export function createAgriculturalTracerMocks() {
  const mockSpan = createMockSpan();

  return {
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
    setAgriculturalAttributes: jest.fn(),
    addAgriculturalEvent: jest.fn(),
    traceAgriculturalOperation: jest.fn(
      async (operation: string, attrs: any, fn: any) => {
        // Call the function without passing span as parameter
        // The span is available through the outer tracer context
        if (typeof fn === "function") {
          const result = await fn();
          return result;
        }
        return undefined;
      },
    ),
    traceSeasonalOperation: jest.fn(
      async (season: string, operation: string, fn: any) => {
        if (typeof fn === "function") {
          const result = await fn();
          return result;
        }
        return undefined;
      },
    ),
    traceLunarOperation: jest.fn(async (phase: string, fn: any) => {
      if (typeof fn === "function") {
        const result = await fn();
        return result;
      }
      return undefined;
    }),
    traceConsciousnessMeasurement: jest.fn(async (level: number, fn: any) => {
      if (typeof fn === "function") {
        const result = await fn();
        return result;
      }
      return undefined;
    }),
  };
}

/**
 * Create database mocks
 */
export function createDatabaseMocks() {
  return {
    database: {
      farm: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    },
  };
}

/**
 * Create rate limiter mocks
 */
export function createRateLimiterMocks() {
  return {
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
    createRateLimitResponse: jest.fn().mockImplementation((rateLimit) => ({
      json: async () => ({
        success: false,
        error: "Rate limit exceeded",
        rateLimit,
      }),
      status: 429,
      headers: new Headers(),
    })),
  };
}

/**
 * Setup all mocks for farms API tests
 */
export function setupFarmsApiMocks() {
  return {
    openTelemetry: createOpenTelemetryMocks(),
    agriculturalTracer: createAgriculturalTracerMocks(),
    database: createDatabaseMocks(),
    rateLimiter: createRateLimiterMocks(),
  };
}
