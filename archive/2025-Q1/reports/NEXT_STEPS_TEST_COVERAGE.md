# 🎯 Next Steps: Complete Test Coverage Push

**Current Status**: 8 passing tests in farms API (was 0 before fix)  
**Core Issue**: ✅ **RESOLVED** - OpenTelemetry tracer mocks now work correctly  
**Date**: 2024-01-15

---

## 🚀 What Was Fixed

### ✅ Core Problem Solved

**Issue**: `tracer.startActiveSpan()` was returning `undefined` instead of the API response.

**Solution**: Fixed async callback handling in OpenTelemetry mocks:

```typescript
// ✅ CORRECT - Awaits and returns the callback result
startActiveSpan: async (name, fnOrOptions, maybeFn) => {
  const fn = typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
  if (typeof fn === "function") {
    return await fn(mockSpan); // KEY: await and return!
  }
  return mockSpan;
};
```

### ✅ Files Modified

1. **`src/app/api/farms/__tests__/route.test.ts`**
   - Fixed OpenTelemetry mock
   - Fixed agricultural tracer mock
   - Result: 8 passing tests (up from 3)

2. **`src/app/api/__tests__/api-test-utils.ts`**
   - Added `setupOpenTelemetryMocks()` helper
   - Added `setupAgriculturalTracerMocks()` helper
   - Enhanced mock utilities

3. **`OPENTELEMETRY_TRACING_FIX_COMPLETE.md`**
   - Complete documentation of the fix
   - Patterns and examples
   - Copy-paste templates

---

## 📋 Immediate Next Steps (30 Minutes)

### Step 1: Fix Remaining Farms API Tests (20 failing)

**Problem**: Tests don't set up mock database responses, so they get `undefined`.

**Solution**: Add `mockResolvedValue()` before each test.

**Example**:

```typescript
it("should filter farms by status", async () => {
  const mockFarms = [createMockFarm({ status: "ACTIVE" })];

  // ✅ ADD THIS LINE to each failing test
  (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);

  const request = createMockNextRequest({
    url: "/api/farms",
    method: "GET",
    searchParams: { status: "ACTIVE" },
  });

  const response = await GET(request);
  const data = await response.json();

  expect(data.success).toBe(true);
  expect(data.data).toEqual(mockFarms);
});
```

**Tests to Fix** (in `src/app/api/farms/__tests__/route.test.ts`):

- ❌ should filter farms by status
- ❌ should filter farms by season
- ❌ should include owner information
- ❌ should include product count
- ❌ should limit results to 20 farms
- ❌ should order farms by createdAt desc
- ❌ should only fetch in-stock products
- ❌ should limit products to 5 per farm
- ❌ should handle database errors gracefully
- ❌ should handle unknown errors
- ❌ should handle database errors during creation
- ❌ should handle malformed JSON body
- ❌ should handle unknown errors (POST)
- ❌ should trace farm creation operation
- ❌ should set agricultural attributes
- ❌ should manifest farm with divine message
- ❌ should preserve all input data
- ❌ should handle missing coordinates
- ❌ should include all required farm fields

**Command to test**:

```bash
npm test -- "src/app/api/farms/__tests__/route.test.ts" --no-coverage
```

---

## 🔥 Quick Wins (Next 2 Hours)

### Step 2: Apply Fix to Products API (60 min)

**File**: `src/app/api/products/__tests__/route.test.ts`

**Actions**:

1. Copy the OpenTelemetry mock setup from farms test
2. Copy the agricultural tracer mock setup
3. Ensure all tests have `mockResolvedValue()` calls
4. Run tests: `npm test -- "src/app/api/products/__tests__/route.test.ts"`

**Expected Result**: ~60 tests passing

---

### Step 3: Apply Fix to Health API (30 min)

**File**: `src/app/api/health/__tests__/route.test.ts`

**Actions**:

1. Apply the same tracer mock pattern
2. Run tests: `npm test -- "src/app/api/health/__tests__/route.test.ts"`

**Expected Result**: All 31 tests passing

---

### Step 4: Create Reusable Mock Setup (30 min)

**File**: `src/app/api/__tests__/tracing-mocks.ts` (new file)

**Content**:

```typescript
/**
 * 🧪 REUSABLE TRACING MOCKS
 * Standardized OpenTelemetry and Agricultural Tracer mocks for API tests
 */

export function createTracerMock() {
  const mockSpan = {
    setStatus: jest.fn(),
    setAttributes: jest.fn(),
    setAttribute: jest.fn(),
    addEvent: jest.fn(),
    recordException: jest.fn(),
    end: jest.fn(),
  };

  return {
    mockSpan,
    openTelemetryMock: {
      trace: {
        getTracer: jest.fn(() => ({
          startActiveSpan: async (name, fnOrOptions, maybeFn) => {
            const fn =
              typeof fnOrOptions === "function" ? fnOrOptions : maybeFn;
            if (typeof fn === "function") {
              return await fn(mockSpan);
            }
            return mockSpan;
          },
        })),
        getActiveSpan: jest.fn().mockReturnValue(mockSpan),
      },
      SpanStatusCode: { OK: 1, ERROR: 2, UNSET: 0 },
    },
    agriculturalTracerMock: {
      AgriculturalOperation: {
        CROP_PLANNING: "crop.planning",
        PLANTING: "crop.planting",
        HARVESTING: "crop.harvesting",
      },
      setAgriculturalAttributes: jest.fn(),
      traceAgriculturalOperation: jest.fn(async (op, attrs, fn) => {
        if (typeof fn === "function") return await fn();
        return undefined;
      }),
    },
  };
}
```

**Usage**:

```typescript
import { createTracerMock } from "../../__tests__/tracing-mocks";

const { openTelemetryMock, agriculturalTracerMock } = createTracerMock();

jest.mock("@opentelemetry/api", () => openTelemetryMock);
jest.mock("@/lib/tracing/agricultural-tracer", () => agriculturalTracerMock);
```

---

## 🎯 Medium Priority (Next Week)

### Other API Routes (4-6 hours)

Apply the same pattern to:

- ✅ `/api/auth/*` - Authentication endpoints
- ✅ `/api/search/*` - Search endpoints
- ✅ `/api/admin/*` - Admin endpoints
- ✅ `/api/notifications/*` - Notification endpoints
- ✅ `/api/platform/*` - Platform stats
- ✅ `/api/agricultural/*` - Agricultural endpoints
- ✅ `/api/ai/*` - AI endpoints

**Template** (copy this for each route):

```typescript
import { createTracerMock } from "../../__tests__/tracing-mocks";

const { openTelemetryMock, agriculturalTracerMock } = createTracerMock();

jest.mock("@opentelemetry/api", () => openTelemetryMock);
jest.mock("@/lib/tracing/agricultural-tracer", () => agriculturalTracerMock);
jest.mock("@/lib/database", () => ({
  database: {
    entity: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("API Route Tests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should work", async () => {
    const mockData = [{ id: "1" }];
    (database.entity.findMany as jest.Mock).mockResolvedValue(mockData);

    const response = await GET(request);
    expect(response).toBeDefined();
  });
});
```

---

## 🏗️ Long-Term (Next Month)

### Service Layer Tests (8-12 hours)

Files to test:

- `src/lib/services/farm.service.ts`
- `src/lib/services/product.service.ts`
- `src/lib/services/order.service.ts`
- `src/lib/services/payment.service.ts`
- `src/lib/services/shipping.service.ts`

**Mock Pattern**:

```typescript
jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("FarmService", () => {
  let farmService: FarmService;

  beforeEach(() => {
    jest.clearAllMocks();
    farmService = new FarmService();
  });

  it("should create farm", async () => {
    const mockFarm = { id: "1", name: "Test Farm" };
    (database.farm.create as jest.Mock).mockResolvedValue(mockFarm);

    const result = await farmService.createFarm({ name: "Test Farm" });

    expect(result).toEqual(mockFarm);
    expect(database.farm.create).toHaveBeenCalled();
  });
});
```

---

### AI Module Tests (6-8 hours)

Files to test:

- `src/lib/ai/ollama.ts`
- `src/lib/ai/perplexity.ts`
- `src/lib/ai/AgriculturalConsciousness.ts`

**Mock Pattern**:

```typescript
jest.mock("ollama", () => ({
  Ollama: jest.fn().mockImplementation(() => ({
    chat: jest.fn().mockResolvedValue({
      message: { content: "Test response" },
    }),
  })),
}));

describe("Ollama Integration", () => {
  it("should generate response", async () => {
    const result = await generateResponse("Test prompt");
    expect(result).toContain("Test response");
  });
});
```

---

### UI Component Tests (20-40 hours)

Files to test:

- All components in `src/components/*`
- All feature components in `src/features/*`

**Pattern**:

```typescript
import { render, screen } from "@testing-library/react";
import { FarmCard } from "./FarmCard";

describe("FarmCard", () => {
  it("should render farm information", () => {
    const farm = { id: "1", name: "Test Farm" };
    render(<FarmCard farm={farm} />);

    expect(screen.getByText("Test Farm")).toBeInTheDocument();
  });
});
```

---

## 📊 Coverage Goals

| Area       | Current | Goal | Priority  |
| ---------- | ------- | ---- | --------- |
| API Routes | ~10%    | 80%  | 🔥 HIGH   |
| Services   | ~5%     | 70%  | 🔥 HIGH   |
| Utilities  | ~60%    | 90%  | ⚡ MEDIUM |
| Components | ~0%     | 60%  | 🔷 LOW    |
| E2E        | 0%      | 20%  | 🔷 LOW    |

---

## 🛠️ Commands Reference

```bash
# Run all tests
npm test

# Run specific test file
npm test -- "path/to/file.test.ts"

# Run with coverage
npm test -- --coverage

# Run only changed files
npm test -- --onlyChanged

# Run in watch mode
npm test -- --watch

# Run specific test by name
npm test -- -t "test name"

# Run with max workers (faster)
npm test -- --maxWorkers=6

# Run without coverage (faster)
npm test -- --no-coverage
```

---

## ✅ Definition of Done

For each API route test file:

- [ ] OpenTelemetry mock properly set up
- [ ] Agricultural tracer mock properly set up
- [ ] All database operations mocked
- [ ] All tests have `mockResolvedValue()` calls
- [ ] All tests pass
- [ ] No `undefined` responses
- [ ] No "Number of calls: 0" errors

---

## 🎓 Key Patterns to Remember

### 1. Always Await in Tracer Mock

```typescript
// ✅ CORRECT
return await fn(mockSpan);

// ❌ WRONG
return fn(mockSpan);
```

### 2. Don't Pass Span to Agricultural Tracer Callback

```typescript
// ✅ CORRECT
traceAgriculturalOperation: jest.fn(async (op, attrs, fn) => {
  return await fn(); // No parameters!
});

// ❌ WRONG
traceAgriculturalOperation: jest.fn(async (op, attrs, fn) => {
  return await fn(mockSpan); // Span not expected
});
```

### 3. Always Mock Database Before Test

```typescript
// ✅ CORRECT
it("should work", async () => {
  (database.entity.method as jest.Mock).mockResolvedValue(data);
  const response = await GET(request);
  expect(response).toBeDefined();
});

// ❌ WRONG
it("should work", async () => {
  const response = await GET(request); // database returns undefined!
  expect(response).toBeDefined();
});
```

---

## 📚 Resources

- **Main Documentation**: `OPENTELEMETRY_TRACING_FIX_COMPLETE.md`
- **Test Utilities**: `src/app/api/__tests__/api-test-utils.ts`
- **Working Example**: `src/app/api/farms/__tests__/route.test.ts`
- **Project Rules**: `.cursorrules`

---

## 🎉 Success Criteria

**Short Term** (This Week):

- ✅ Farms API: 29/29 tests passing
- ✅ Products API: All tests passing
- ✅ Health API: 31/31 tests passing

**Medium Term** (This Month):

- ✅ All API routes: 80% coverage
- ✅ Service layer: 70% coverage
- ✅ Utilities: 90% coverage

**Long Term** (Next Quarter):

- ✅ Overall project: 80% coverage
- ✅ Components: 60% coverage
- ✅ E2E tests: 20 critical flows

---

**Status**: 🟢 READY TO PROCEED  
**Blocker**: ✅ NONE - Core issue resolved  
**Next Action**: Fix remaining 20 farms API tests by adding `mockResolvedValue()` calls

---

_"The hardest part is done. Now we just need to apply the pattern consistently across all tests."_ 🚀
