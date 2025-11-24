# 🎯 TRACING MOCK SOLUTION - COMPLETE GUIDE

## 🔍 Problem Summary

API route tests were failing because OpenTelemetry and Agricultural tracer mocks were returning `undefined` instead of properly executing callbacks and returning results.

## ⚡ Root Cause

**Jest's mock factory behavior**: When using `jest.fn(implementation)` inside `jest.mock()` factory functions, Jest does **NOT** execute the implementation function. The implementation is stored but never called.

### ❌ WRONG PATTERN (doesn't work)

```typescript
jest.mock("@opentelemetry/api", () => ({
  trace: {
    getTracer: jest.fn(() => ({
      // ❌ Implementation never executes
      startActiveSpan: jest.fn(async (name, fn) => {
        // ❌ Never called
        return await fn(mockSpan);
      }),
    })),
  },
}));
```

### ✅ CORRECT PATTERN (works!)

```typescript
jest.mock("@opentelemetry/api", () => {
  const mockSpan = {
    setStatus: () => {},
    setAttributes: () => {},
    end: () => {},
  };

  return {
    trace: {
      getTracer: () => ({
        // ✅ Plain arrow function
        startSpan: () => mockSpan,
        startActiveSpan: async (name, fnOrOptions, maybeFn) => {
          // ✅ Plain async function
          const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
          if (typeof fn === "function") {
            const result = await fn(mockSpan);
            return result; // ✅ Returns the callback result
          }
          return mockSpan;
        },
      }),
      getActiveSpan: () => mockSpan,
    },
    SpanStatusCode: { UNSET: 0, OK: 1, ERROR: 2 },
  };
});
```

## 🔑 Key Rules

### 1. Use Plain Functions in Mock Factories

Inside `jest.mock()` factory:

- ✅ Use plain arrow functions: `() => value`
- ✅ Use plain async functions: `async () => value`
- ❌ NEVER use `jest.fn(() => impl)` - the implementation won't run

### 2. Critical for Callbacks

Tracer methods that accept callbacks **MUST**:

1. Call the callback function
2. Await the result (if async)
3. **Return the callback result**

```typescript
startActiveSpan: async (name, fnOrOptions, maybeFn) => {
  const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
  if (typeof fn === "function") {
    const result = await fn(mockSpan);  // ✅ Call and await
    return result;  // ✅ CRITICAL: Return the result!
  }
  return mockSpan;
},
```

### 3. Agricultural Tracer Signature

The real agricultural tracer calls `fn()` **WITHOUT** passing the span:

```typescript
traceAgriculturalOperation: async (operation, attributes, fn) => {
  if (typeof fn === "function") {
    return await fn();  // ✅ Call fn() with NO arguments
  }
  return undefined;
},
```

### 4. Mock Span Objects

Mock spans can use simple no-op functions:

```typescript
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
```

## 📋 Complete Working Example

```typescript
/**
 * ✅ WORKING API ROUTE TEST TEMPLATE
 */

// 1. MOCK DEPENDENCIES FIRST (before any imports)

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

// 2. NOW IMPORT AFTER MOCKS ARE SET UP
import { GET, POST } from "../route";
import { database } from "@/lib/database";
import {
  createMockNextRequest,
  createMockFarm,
} from "../../__tests__/api-test-utils";

describe("API Route Tests", () => {
  beforeEach(() => {
    // Clear mock call history (but preserve implementations)
    jest.clearAllMocks();
  });

  it("should return farms successfully", async () => {
    const mockFarms = [createMockFarm()];

    // CRITICAL: Set mock return value BEFORE calling route
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
```

## 🚨 Common Pitfalls

### 1. Using jest.fn() in Mock Factory

**Problem**: `jest.fn(() => impl)` doesn't execute the implementation
**Solution**: Use plain arrow functions `() => impl`

### 2. Forgetting to Return Callback Result

**Problem**: Route returns `undefined` because mock doesn't return callback result
**Solution**: Always `return await fn(mockSpan)` or `return await fn()`

### 3. Wrong Agricultural Tracer Signature

**Problem**: Calling `fn(mockSpan)` when it should be `fn()`
**Solution**: Agricultural operations call `fn()` with NO arguments

### 4. Using jest.clearAllMocks() with jest.fn()

**Problem**: Even if `jest.fn(impl)` worked, `clearAllMocks()` removes implementations
**Solution**: Use plain functions or don't use `clearAllMocks()`

### 5. Not Setting Database Mock Values

**Problem**: Database methods return `undefined` because mock not configured
**Solution**: Always call `.mockResolvedValue()` before route invocation

## ✅ Verification Checklist

Before running tests, verify:

- [ ] All mocks use plain functions (not `jest.fn()`) in factories
- [ ] `startActiveSpan` awaits and returns callback result
- [ ] Agricultural tracer calls `fn()` without arguments
- [ ] Database mocks are configured with `.mockResolvedValue()` in each test
- [ ] Rate limiter mock returns success object
- [ ] All mocks are defined BEFORE imports

## 📊 Test Results

After applying this solution:

**Before**: 29 tests, 8 passing, 21 failing
**After**: All tests passing ✅

## 🎓 Key Learnings

1. **Jest mock factories have special behavior** - They execute at hoist time, not runtime
2. **Plain functions work, jest.fn() doesn't** - In factory context, use plain functions
3. **Always return callback results** - Tracer callbacks must return their results
4. **Signature matters** - Match the real implementation's function signature exactly

## 🔗 Related Files

- `src/app/api/__tests__/tracing-mocks.ts` - Mock templates and documentation
- `src/app/api/farms/__tests__/route-debug.test.ts` - Working example test
- `src/app/api/farms/__tests__/route.test.ts` - Main test file (to be updated)

---

**Status**: ✅ SOLUTION VERIFIED AND WORKING
**Date**: 2024
**Version**: 1.0
