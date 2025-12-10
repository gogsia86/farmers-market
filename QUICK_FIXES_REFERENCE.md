# 🚀 Quick Fixes Reference Card

**Last Updated:** December 6, 2025  
**Status:** Ready to Execute  
**Estimated Time:** 1-2 hours

---

## 🎯 Critical Fixes (Do These First)

### 1. Start Development Server ⚡

```bash
# For HP OMEN hardware (optimized)
npm run dev:omen

# Or standard mode
npm run dev
```

**Why:** Enables workflow validation and runtime testing  
**Time:** Immediate

---

### 2. Apply Automated Fixes ✅

```bash
# Run the fix script
npx tsx scripts/fix-test-failures.ts

# Verify fixes
npm test
```

**Fixes Applied:**

- ✅ Product controller import
- ✅ Repository mocks created
- ✅ Farmer service tests updated
- ✅ Test helpers generated
- ✅ Documentation created

**Time:** 5 minutes

---

### 3. Update Product Service Tests 🛒

**File:** `src/lib/services/__tests__/product.service.test.ts`

**Add at top of file:**

```typescript
import {
  mockProductRepository,
  resetAllRepositoryMocks,
} from "@/__tests__/mocks/repositories";

jest.mock("@/lib/repositories/product.repository", () => ({
  productRepository: mockProductRepository,
}));

describe("ProductService", () => {
  beforeEach(() => {
    resetAllRepositoryMocks();
  });

  // ... existing tests
});
```

**Time:** 30 minutes

---

### 4. Fix Geocoding Service Tests 🗺️

**File:** `src/lib/services/__tests__/geocoding.service.test.ts`

**Option A - Use Instance:**

```typescript
// Change from:
import { GeocodingService } from '@/lib/services/geocoding.service';
const distance = GeocodingService.calculateDistance(...);

// To:
import { geocodingService } from '@/lib/services/geocoding.service';
const distance = await geocodingService.calculateDistance(...);
```

**Option B - Mock Properly:**

```typescript
jest.mock("@/lib/services/geocoding.service", () => ({
  geocodingService: {
    calculateDistance: jest.fn(),
    geocodeAddress: jest.fn(),
  },
}));
```

**Time:** 20 minutes

---

### 5. Add Missing Mock for Dashboard Stats 📊

**File:** `src/lib/services/__tests__/farmer.service.test.ts`

**In mock setup, add:**

```typescript
jest.mock("@/lib/database", () => ({
  database: {
    user: {
      /* existing mocks */
    },
    farm: {
      /* existing mocks */
    },
    product: {
      count: jest.fn(),
      findUnique: jest.fn(), // <-- ADD THIS
      findMany: jest.fn(),
    },
    order: {
      /* existing mocks */
    },
  },
}));
```

**Time:** 5 minutes

---

## 📋 Test Coverage Improvement Plan

### Phase 1: Service Layer (Target: 90%)

```bash
# Create test for each service
src/lib/services/
├── cart.service.test.ts          ✅ EXISTS
├── checkout.service.test.ts      ❌ CREATE
├── farm.service.test.ts          ❌ CREATE
├── order.service.test.ts         ❌ CREATE
├── payment.service.test.ts       ❌ CREATE
└── notification.service.test.ts  ❌ CREATE
```

**Template:**

```typescript
import { ServiceName } from "../service-name.service";
import { database } from "@/lib/database";

jest.mock("@/lib/database");

describe("ServiceName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("methodName", () => {
    it("should perform operation successfully", async () => {
      // Arrange
      const mockData = {
        /* test data */
      };
      (database.model.method as jest.Mock).mockResolvedValue(mockData);

      // Act
      const result = await service.method(params);

      // Assert
      expect(result).toEqual(expected);
      expect(database.model.method).toHaveBeenCalledWith(expected);
    });
  });
});
```

---

### Phase 2: API Routes (Target: 80%)

```bash
# Create test for each route
src/app/api/
├── products/route.test.ts        ❌ CREATE
├── farms/route.test.ts           ❌ CREATE
├── orders/route.test.ts          ❌ CREATE
└── payments/route.test.ts        ❌ CREATE
```

**Template:**

```typescript
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/services/service-name");

describe("API /api/endpoint", () => {
  describe("GET", () => {
    it("should return 200 with data", async () => {
      const request = new NextRequest("http://localhost:3000/api/endpoint");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
```

---

### Phase 3: Components (Target: 70%)

```bash
# Test critical UI components
src/components/
├── product-card.test.tsx         ❌ CREATE
├── cart-item.test.tsx            ❌ CREATE
├── farm-card.test.tsx            ❌ CREATE
└── checkout-form.test.tsx        ❌ CREATE
```

**Template:**

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## 🔧 Quick Commands

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test farmer.service.test.ts

# Watch mode
npm run test:watch

# HP OMEN optimized
npm run test:omen
```

### Validation

```bash
# Validate entire platform
npm run validate:platform

# Type checking
npm run type-check

# Linting
npm run lint

# Full quality check
npm run quality
```

### Development

```bash
# Start development (HP OMEN)
npm run dev:omen

# Start with logging
npm run dev:logger

# Kill stuck server
npm run kill-server

# Database setup
npm run db:setup
```

---

## 📊 Progress Tracking

### Immediate Fixes Status

- [x] Automated fixes script created
- [x] Repository mocks created
- [x] Farmer service validation fixed
- [x] Product controller import fixed
- [ ] Product service tests updated
- [ ] Geocoding tests fixed
- [ ] Dashboard stats mock added

### Coverage Goals

- Current: 4.4%
- Week 1 Target: 30%
- Week 2 Target: 60%
- Final Target: 80%+

---

## 🎯 Success Criteria

### All Tests Passing ✅

```bash
npm test
# Expected: 2,173 passed, 0 failed
```

### Coverage Target Met ✅

```bash
npm run test:coverage
# Expected: >80% coverage
```

### Server Running ✅

```bash
npm run dev:omen
# Expected: Server running on http://localhost:3001
```

### Workflow Validation ✅

```bash
npm run bot:run
# Expected: 100% success rate
```

---

## 📚 Quick Links

- **Full Analysis:** [ANALYSIS_AND_RECOMMENDATIONS.md](./ANALYSIS_AND_RECOMMENDATIONS.md)
- **Executive Summary:** [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)
- **Task Report:** [TASK_COMPLETION_REPORT.md](./TASK_COMPLETION_REPORT.md)
- **Divine Instructions:** [.github/instructions/](./.github/instructions/)

---

## 🆘 Need Help?

### Test Failures

1. Check mock setup matches service implementation
2. Verify imports are correct
3. Review [ANALYSIS_AND_RECOMMENDATIONS.md](./ANALYSIS_AND_RECOMMENDATIONS.md) for detailed fixes

### Coverage Issues

1. Use `npm run test:coverage` to see gaps
2. Follow test templates above
3. Aim for 90% on services, 80% on routes

### Server Issues

1. Kill stuck processes: `npm run kill-server`
2. Clear cache: `npm run clean:all`
3. Restart: `npm run dev:omen`

---

**Remember:** Fix in order - automated fixes first, then manual updates! 🚀

_Generated with Agricultural Consciousness_ 🌾⚡
