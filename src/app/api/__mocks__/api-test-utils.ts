/**
 * 🧪 API ROUTE TEST UTILITIES
 * Divine test helpers for Next.js API routes with agricultural consciousness
 */

import { NextRequest } from "next/server";

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockNextRequest(options: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  searchParams?: Record<string, string>;
}): NextRequest {
  const {
    url,
    method = "GET",
    headers = {},
    body,
    searchParams = {},
  } = options;

  // Build full URL with search params
  const urlObj = new URL(url, "http://localhost:3000");
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET" && method !== "HEAD") {
    requestInit.body = JSON.stringify(body);
  }

  const request = new NextRequest(urlObj.toString(), requestInit);

  // Add custom properties for testing
  Object.defineProperty(request, "ip", {
    value: headers["x-forwarded-for"] || "127.0.0.1",
    writable: true,
  });

  return request;
}

/**
 * Parse JSON response from NextResponse
 */
export async function parseJsonResponse(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Create mock authentication session
 */
export function createMockSession(
  role: "CUSTOMER" | "FARMER" | "ADMIN" = "CUSTOMER",
) {
  return {
    user: {
      id: `user-${role.toLowerCase()}-test-id`,
      email: `test-${role.toLowerCase()}@example.com`,
      name: `Test ${role}`,
      role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Mock headers for authenticated requests
 */
export function createAuthHeaders(
  sessionToken = "mock-session-token",
): Record<string, string> {
  return {
    Cookie: `next-auth.session-token=${sessionToken}`,
    Authorization: `Bearer ${sessionToken}`,
  };
}

/**
 * Create mock agricultural context
 */
export function createAgriculturalContext() {
  return {
    season: "SPRING" as const,
    lunarPhase: "WAXING_CRESCENT" as const,
    consciousness: "DIVINE" as const,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Mock database farm data
 */
export function createMockFarm(overrides: Partial<any> = {}) {
  return {
    id: "farm-test-id",
    name: "Test Divine Farm",
    description: "A farm with agricultural consciousness",
    address: "123 Farm Road, Sacramento, CA 95814",
    latitude: 38.5816,
    longitude: -121.4944,
    status: "ACTIVE",
    ownerId: "owner-test-id",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    seasonalAlignment: "SPRING",
    biodynamicCertified: true,
    owner: {
      id: "owner-test-id",
      name: "Test Farmer",
      email: "farmer@test.com",
    },
    products: [],
    _count: {
      products: 0,
      reviews: 0,
    },
    ...overrides,
  };
}

/**
 * Mock database product data
 */
export function createMockProduct(overrides: Partial<any> = {}) {
  return {
    id: "product-test-id",
    name: "Organic Tomatoes",
    description: "Fresh organic tomatoes from divine farm",
    price: 4.99,
    unit: "lb",
    inStock: true,
    stockQuantity: 100,
    farmId: "farm-test-id",
    category: "VEGETABLES",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    farm: createMockFarm(),
    ...overrides,
  };
}

/**
 * Mock database order data
 */
export function createMockOrder(overrides: Partial<any> = {}) {
  return {
    id: "order-test-id",
    customerId: "customer-test-id",
    status: "PENDING",
    totalAmount: 49.99,
    items: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Assert API response structure
 */
export function assertSuccessResponse(response: any) {
  expect(response).toHaveProperty("success", true);
  expect(response).toHaveProperty("data");
}

export function assertErrorResponse(response: any, expectedCode?: string) {
  expect(response).toHaveProperty("success", false);
  expect(response).toHaveProperty("error");

  if (expectedCode) {
    expect(response.error).toMatch(expectedCode);
  }
}

/**
 * Assert agricultural consciousness in response
 */
export function assertAgriculturalConsciousness(response: any) {
  if (response.meta) {
    expect(response.meta).toHaveProperty("agriculturalConsciousness");
  }
}

/**
 * Mock rate limiter that always succeeds
 */
export function mockRateLimiterSuccess() {
  return {
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
  };
}

/**
 * Mock rate limiter that fails
 */
export function mockRateLimiterFailure() {
  return {
    success: false,
    limit: 100,
    remaining: 0,
    reset: Date.now() + 60000,
  };
}

/**
 * Create mock Next.js headers
 */
export function createMockHeaders(headers: Record<string, string> = {}) {
  return new Headers({
    "Content-Type": "application/json",
    ...headers,
  });
}

/**
 * Wait for async operations (useful in tests)
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock search params
 */
export function createSearchParams(
  params: Record<string, string>,
): URLSearchParams {
  return new URLSearchParams(params);
}

/**
 * Mock tracing span for OpenTelemetry
 */
export function createMockSpan() {
  return {
    setStatus: jest.fn(),
    setAttributes: jest.fn(),
    setAttribute: jest.fn(),
    addEvent: jest.fn(),
    recordException: jest.fn(),
    end: jest.fn(),
    isRecording: () => true,
    spanContext: () => ({
      traceId: "mock-trace-id",
      spanId: "mock-span-id",
      traceFlags: 1,
    }),
  };
}

/**
 * Mock tracer for OpenTelemetry
 */
export function createMockTracer() {
  const mockSpan = createMockSpan();

  return {
    startSpan: jest.fn().mockReturnValue(mockSpan),
    startActiveSpan: jest.fn(
      async (name: string, fnOrOptions: any, maybeFn?: any) => {
        // Handle both (name, fn) and (name, options, fn) signatures
        const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
        if (typeof fn === "function") {
          const result = await fn(mockSpan);
          return result;
        }
        return mockSpan;
      },
    ),
  };
}

/**
 * Setup complete OpenTelemetry mocks for testing
 * This should be called in jest.mock() at the top of test files
 */
export function setupOpenTelemetryMocks() {
  const mockSpan = createMockSpan();

  return {
    trace: {
      getTracer: jest.fn().mockReturnValue({
        startSpan: jest.fn().mockReturnValue(mockSpan),
        startActiveSpan: jest.fn(
          async (name: string, fnOrOptions: any, maybeFn?: any) => {
            // Handle both (name, fn) and (name, options, fn) signatures
            const fn =
              typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
            if (typeof fn === "function") {
              const result = await fn(mockSpan);
              return result;
            }
            return mockSpan;
          },
        ),
      }),
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
 * Setup agricultural tracer mocks for testing
 */
export function setupAgriculturalTracerMocks() {
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
        if (typeof fn === "function") {
          const result = await fn(mockSpan);
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
 * Setup database mocks for API tests
 */
export function setupDatabaseMocks() {
  const mockDb = {
    farm: {
      findMany: jest.fn(),
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
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  };

  return mockDb;
}

/**
 * Create mock Prisma transaction
 */
export function createMockTransaction() {
  return setupDatabaseMocks();
}

/**
 * Assert response headers
 */
export function assertResponseHeaders(
  response: Response,
  expectedHeaders: Record<string, string>,
) {
  Object.entries(expectedHeaders).forEach(([key, value]) => {
    expect(response.headers.get(key)).toBe(value);
  });
}

/**
 * Assert HTTP status code
 */
export function assertStatusCode(response: Response, expectedStatus: number) {
  expect(response.status).toBe(expectedStatus);
}

/**
 * Create mock validation error
 */
export function createMockValidationError(field: string, message: string) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: `Validation failed: ${field}`,
      details: {
        field,
        message,
      },
    },
  };
}
