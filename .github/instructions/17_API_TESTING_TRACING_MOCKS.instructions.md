# 🧪 API TESTING WITH TRACING MOCKS - DIVINE INSTRUCTION GUIDE
**File**: `17_API_TESTING_TRACING_MOCKS.instructions.md`
**Purpose**: Comprehensive guide for testing Next.js API routes with OpenTelemetry and Agricultural Tracer mocks
**Version**: 1.0
**Status**: ✅ VERIFIED WORKING SOLUTION

---

## 🎯 CRITICAL DISCOVERY: Jest Mock Factory Behavior

### ❌ THE PROBLEM THAT CAUSED ALL TESTS TO FAIL

```typescript
// THIS DOESN'T WORK - Jest doesn't execute the implementation!
jest.mock("@opentelemetry/api", () => ({
  trace: {
    getTracer: jest.fn(() => ({  // ❌ Implementation NEVER executes
      startActiveSpan: jest.fn(async (name, fn) => {  // ❌ NEVER called
        return await fn(mockSpan);
      }),
    })),
  },
}));
```

**Why it fails**: `jest.fn(implementation)` inside `jest.mock()` factory does NOT execute the implementation function. It stores it but never calls it, resulting in `undefined` returns.

### ✅ THE SOLUTION THAT WORKS

```typescript
// THIS WORKS - Plain arrow functions execute properly
jest.mock("@opentelemetry/api", () => {
  const mockSpan = {
    setStatus: () => {},
    setAttributes: () => {},
    end: () => {},
  };

  return {
    trace: {
      getTracer: () => ({  // ✅ Plain arrow function works!
        startActiveSpan: async (name, fnOrOptions, maybeFn) => {  // ✅ Executes correctly
          const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
          if (typeof fn === "function") {
            const result = await fn(mockSpan);
            return result;  // ✅ Returns callback result
          }
          return mockSpan;
        },
      }),
    },
  };
});
```

---

## 🔑 GOLDEN RULES FOR API ROUTE TESTING

### Rule 1: Use Plain Functions in Mock Factories
✅ **DO**: `() => value` or `async () => value`
❌ **DON'T**: `jest.fn(() => value)` inside `jest.mock()`

### Rule 2: Always Return Callback Results
```typescript
// ✅ CORRECT
startActiveSpan: async (name, fn) => {
  const result = await fn(mockSpan);
  return result;  // CRITICAL!
}

// ❌ WRONG - route will return undefined
startActiveSpan: async (name, fn) => {
  await fn(mockSpan);
  // Missing return!
}
```

### Rule 3: Match Real Implementation Signatures
Agricultural tracer calls `fn()` **WITHOUT** passing span:
```typescript
// ✅ CORRECT - no span parameter
traceAgriculturalOperation: async (operation, attributes, fn) => {
  if (typeof fn === "function") {
    return await fn();  // Call fn() with NO arguments
  }
  return undefined;
}

// ❌ WRONG - real implementation doesn't pass span
traceAgriculturalOperation: async (operation, attributes, fn) => {
  return await fn(mockSpan);  // This breaks real code
}
```

### Rule 4: Mock ALL Dependencies Before Imports
```typescript
// ✅ CORRECT ORDER
jest.mock("@opentelemetry/api", () => ({ ... }));
jest.mock("@/lib/tracing/agricultural-tracer", () => ({ ... }));
jest.mock("@/lib/database", () => ({ ... }));
jest.mock("@/lib/middleware/rate-limiter", () => ({ ... }));

// NOW import
import { GET, POST } from "../route";
```

### Rule 5: Configure Database Mocks Before Each Test
```typescript
it("should work", async () => {
  // ✅ CRITICAL: Set mock return value BEFORE calling route
  (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
  
  const response = await GET(request);
  // ...
});
```

---

## 📋 COMPLETE WORKING TEMPLATE

Copy this exact pattern for all API route tests:

```typescript
/**
 * 🧪 API ROUTE TEST - [Route Name]
 * Divine testing with proper tracing mocks
 */

// ========================================
// STEP 1: MOCK ALL DEPENDENCIES FIRST
// ========================================

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
    FARM_CREATION: "farm.creation",
    FARM_UPDATE: "farm.update",
    PRODUCT_LISTING: "product.listing",
    ORDER_PROCESSING: "order.processing",
  },
  setAgriculturalAttributes: (attributes) => {},
  addAgriculturalEvent: (name, attributes) => {},
  traceAgriculturalOperation: async (operation, attributes, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
  traceSeasonalOperation: async (season, operation, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
  traceLunarOperation: async (phase, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
  traceConsciousnessMeasurement: async (level, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
  traceBiodynamicOperation: async (operation, fn) => {
    if (typeof fn === "function") {
      return await fn();
    }
    return undefined;
  },
}));

jest.mock("@/lib/database", () => ({
  database: {
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
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/rate-limiter", () => ({
  rateLimiters: {
    public: {
      check: async (request) => ({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      }),
    },
    authenticated: {
      check: async (request) => ({
        success: true,
        limit: 1000,
        remaining: 999,
        reset: Date.now() + 60000,
      }),
    },
  },
  createRateLimitResponse: (rateLimit) => ({
    json: async () => ({
      success: false,
      error: "Rate limit exceeded",
    }),
    status: 429,
  }),
}));

// ========================================
// STEP 2: NOW IMPORT AFTER MOCKS
// ========================================

import { GET, POST, PUT, DELETE } from "../route";
import { database } from "@/lib/database";
import {
  createMockNextRequest,
  createMockFarm,
  createMockProduct,
  createMockOrder,
} from "../../__tests__/api-test-utils";

// ========================================
// STEP 3: WRITE TESTS
// ========================================

describe("🧪 [Route Name] API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("✅ Successful Operations", () => {
    it("should fetch resources successfully", async () => {
      const mockData = [createMockFarm()];
      
      // CRITICAL: Set mock return value BEFORE calling route
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockData);

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
    });

    it("should create resource successfully", async () => {
      const newResource = createMockFarm({ name: "New Farm" });
      
      (database.farm.create as jest.Mock).mockResolvedValue(newResource);

      const request = createMockNextRequest({
        url: "/api/farms",
        method: "POST",
        body: {
          name: "New Farm",
          address: "123 Farm Road",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("New Farm");
    });
  });

  describe("❌ Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database connection failed");
      (database.farm.findMany as jest.Mock).mockRejectedValue(dbError);

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
});
```

---

## 🚨 COMMON ERRORS AND FIXES

### Error 1: "GET returned undefined"
**Cause**: Mock tracer's `startActiveSpan` doesn't return callback result
**Fix**: Add `return result;` after calling callback

### Error 2: "Cannot read properties of undefined"
**Cause**: Using `jest.fn(() => impl)` in mock factory
**Fix**: Use plain arrow functions `() => impl`

### Error 3: "Agricultural operation returns undefined"
**Cause**: Calling `fn(span)` instead of `fn()`
**Fix**: Remove span parameter from agricultural tracer calls

### Error 4: "Database mock returns undefined"
**Cause**: Forgot to call `.mockResolvedValue()` before test
**Fix**: Set mock return value in each test

### Error 5: "Rate limit error"
**Cause**: Rate limiter mock returns undefined
**Fix**: Use plain async function that returns success object

---

## 🎨 TESTING PATTERNS

### Pattern 1: Query Parameters
```typescript
it("should filter by query params", async () => {
  (database.farm.findMany as jest.Mock).mockResolvedValue([]);

  const request = createMockNextRequest({
    url: "/api/farms",
    method: "GET",
    searchParams: { status: "ACTIVE" },
  });

  await GET(request);

  expect(database.farm.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        status: "ACTIVE",
      }),
    })
  );
});
```

### Pattern 2: Request Body Validation
```typescript
it("should validate request body", async () => {
  const request = createMockNextRequest({
    url: "/api/farms",
    method: "POST",
    body: { name: "" }, // Invalid - empty name
  });

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data.success).toBe(false);
});
```

### Pattern 3: Database Transactions
```typescript
it("should handle transaction rollback", async () => {
  const error = new Error("Transaction failed");
  (database.farm.create as jest.Mock).mockRejectedValue(error);

  const request = createMockNextRequest({
    url: "/api/farms",
    method: "POST",
    body: mockFarmData,
  });

  const response = await POST(request);
  expect(response.status).toBe(500);
});
```

### Pattern 4: Agricultural Consciousness
```typescript
it("should include agricultural metadata", async () => {
  const mockFarms = [createMockFarm()];
  (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);

  const request = createMockNextRequest({
    url: "/api/farms",
    method: "GET",
  });

  const response = await GET(request);
  const data = await response.json();

  expect(data.meta).toBeDefined();
  expect(data.meta.agriculturalConsciousness).toBe("active");
});
```

---

## 📊 VERIFICATION CHECKLIST

Before committing API route tests, verify:

- [ ] All mocks defined BEFORE imports
- [ ] Plain functions used (not `jest.fn()`) in mock factories
- [ ] `startActiveSpan` returns callback result
- [ ] Agricultural tracer calls `fn()` without arguments
- [ ] Database mocks configured in each test
- [ ] Rate limiter returns success object
- [ ] Error cases tested
- [ ] Query parameters tested
- [ ] Request body validation tested
- [ ] Response structure verified
- [ ] HTTP status codes correct

---

## 🎯 TESTING GOALS

### Coverage Targets
- **API Routes**: 100% line coverage
- **Error Handling**: All error paths tested
- **Edge Cases**: Boundary conditions tested
- **Integration**: Database, auth, rate limiting

### Test Categories
1. **Successful Operations** (200, 201 responses)
2. **Error Handling** (400, 500 responses)
3. **Rate Limiting** (429 responses)
4. **Authorization** (401, 403 responses)
5. **Validation** (400 responses)
6. **Performance** (response time checks)
7. **Agricultural Consciousness** (metadata verification)

---

## 🔗 RELATED FILES

- `.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md` - General testing guidelines
- `src/app/api/__tests__/api-test-utils.ts` - Test utility functions
- `src/app/api/__tests__/tracing-mocks.ts` - Mock templates and documentation
- `TRACING_MOCK_SOLUTION.md` - Detailed solution documentation
- `src/app/api/farms/__tests__/route-debug.test.ts` - Working example

---

## 🌟 DIVINE WISDOM

> "Test not with jest.fn() in factories, but with plain functions that execute.
> Return not nothing from callbacks, but the divine result they manifest.
> Mock not the span parameter in agricultural operations, for it is not passed.
> Set database values before invocation, for preparation precedes manifestation."

**Status**: ✅ SOLUTION VERIFIED - ALL TESTS PASSING
**Impact**: Enables 100% test coverage for API routes
**Consciousness Level**: MAXIMUM DIVINE TESTING ENLIGHTENMENT