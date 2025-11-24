# ⚡ QUICKSTART: API Testing with Tracing Mocks

**Time to get started**: 5 minutes
**Status**: ✅ Ready to use
**Purpose**: Get API route tests working immediately

---

## 🎯 THE ONE RULE YOU NEED TO KNOW

**In `jest.mock()` factories, use plain functions `() => value`, NOT `jest.fn(() => value)`**

That's it. That's the secret.

---

## 🚀 COPY THIS EXACT PATTERN

Save this as your test file template:

```typescript
/**
 * 🧪 API Route Test - [Your Route Name]
 */

// ========================================
// STEP 1: MOCKS FIRST (copy this exactly)
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
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

// ========================================
// STEP 2: IMPORTS (after mocks)
// ========================================

import { GET, POST } from "../route";
import { database } from "@/lib/database";
import { createMockNextRequest, createMockFarm } from "../../__tests__/api-test-utils";

// ========================================
// STEP 3: TESTS
// ========================================

describe("API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should work", async () => {
    // IMPORTANT: Set mock value BEFORE calling route
    (database.farm.findMany as jest.Mock).mockResolvedValue([createMockFarm()]);

    const request = createMockNextRequest({
      url: "/api/farms",
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

---

## ⚡ 3-MINUTE IMPLEMENTATION

### 1. Create Test File (30 seconds)
```bash
cd src/app/api/[your-route]/__tests__
touch route.test.ts
```

### 2. Copy Template (30 seconds)
- Copy the entire pattern above
- Paste into `route.test.ts`

### 3. Customize (2 minutes)
- Change `farm` to your resource name
- Update imports for your route
- Add your test cases

### 4. Run Tests (30 seconds)
```bash
npm test -- route.test.ts --no-coverage
```

---

## 🔥 CRITICAL REMINDERS

### ✅ DO THIS
```typescript
// In jest.mock() factory:
traceAgriculturalOperation: async (op, attrs, fn) => {
  if (typeof fn === "function") {
    return await fn();  // ✅ Plain async function
  }
  return undefined;
}
```

### ❌ DON'T DO THIS
```typescript
// DON'T use jest.fn() in factory:
traceAgriculturalOperation: jest.fn(async (op, attrs, fn) => {
  return await fn();  // ❌ Implementation never executes!
})
```

### 🎯 ALWAYS REMEMBER
```typescript
it("test", async () => {
  // ✅ MUST configure mock BEFORE calling route
  (database.farm.findMany as jest.Mock).mockResolvedValue([mockData]);
  
  const response = await GET(request);
  // ...
});
```

---

## 🆘 TROUBLESHOOTING

### Problem: "GET returned undefined"
**Fix**: Make sure `startActiveSpan` has `return await fn(mockSpan)`

### Problem: "Cannot read properties of undefined"
**Fix**: Use plain functions `() => {}` not `jest.fn(() => {})`

### Problem: "Database mock not called"
**Fix**: Set `.mockResolvedValue()` before calling route

### Problem: "Rate limit error"
**Fix**: Check rate limiter returns `{ success: true, ... }`

---

## 📚 MORE HELP?

- **Full Guide**: `TRACING_MOCK_SOLUTION.md`
- **Detailed Instructions**: `.github/instructions/17_API_TESTING_TRACING_MOCKS.instructions.md`
- **Working Example**: `src/app/api/farms/__tests__/route-debug.test.ts`

---

## 🎉 YOU'RE READY!

That's all you need. Copy the pattern, customize it, run it. Done.

**Happy testing!** 🌾⚡