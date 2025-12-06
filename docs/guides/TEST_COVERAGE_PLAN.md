# 🧪 Test Coverage Improvement Plan
## From 13% to 90% Coverage

**Created:** January 2025  
**Current Coverage:** 13.29% statements  
**Target Coverage:** 90% statements  
**Timeline:** 12 weeks (3 months)  
**Status:** ✅ Ready for Execution

---

## 📊 Current State Analysis

### Coverage Breakdown
```
Statements:   13.29% (Target: 90%)
Branches:     67.55% (Target: 90%)
Functions:    47.36% (Target: 90%)
Lines:        13.29% (Target: 90%)
```

### Test Suite Status
- **Total Tests:** 2,235
- **Passing:** 2,190 (98% pass rate) ✅
- **Skipped:** 45
- **Failed:** 0 ✅

### Files with 0% Coverage (Priority Targets)
1. `src/lib/utils/metadata.ts` (557 lines)
2. `src/lib/validations/agricultural.ts` (208 lines)
3. `src/lib/validations/farm.ts` (206 lines)
4. `src/stores/checkoutStore.ts` (486 lines)
5. `src/lib/services/biodynamic-calendar.service.ts`
6. Multiple validation schemas

---

## 🎯 4-Phase Coverage Strategy

### Phase 1: Critical Security & Validation (Weeks 1-3)
**Goal:** 13% → 35% coverage  
**Focus:** Input validation, security-critical code

### Phase 2: Business Logic & Services (Weeks 4-6)
**Goal:** 35% → 60% coverage  
**Focus:** Service layer, business rules

### Phase 3: API Routes & Integration (Weeks 7-9)
**Goal:** 60% → 80% coverage  
**Focus:** API endpoints, integration tests

### Phase 4: Complete & Polish (Weeks 10-12)
**Goal:** 80% → 90%+ coverage  
**Focus:** Edge cases, error handling, utilities

---

## 📅 Week-by-Week Execution Plan

## PHASE 1: CRITICAL SECURITY (Weeks 1-3)

### Week 1: Validation Layer Foundation
**Target:** +8% coverage (13% → 21%)  
**Effort:** 40 hours

#### Day 1-2: Farm Validation Tests
**File:** `src/lib/validations/__tests__/farm.validation.test.ts` (NEW)

```typescript
import { z } from "zod";
import {
  createFarmSchema,
  updateFarmSchema,
  farmLocationSchema,
} from "@/lib/validations/farm";

describe("Farm Validation", () => {
  describe("createFarmSchema", () => {
    it("should accept valid farm data", () => {
      const validData = {
        name: "Sunny Acres Farm",
        address: "123 Farm Road",
        city: "Farmville",
        state: "CA",
        zipCode: "12345",
        latitude: 37.7749,
        longitude: -122.4194,
      };
      
      expect(() => createFarmSchema.parse(validData)).not.toThrow();
    });

    it("should reject farm with name too short", () => {
      const invalidData = { name: "AB" };
      expect(() => createFarmSchema.parse(invalidData)).toThrow();
    });

    it("should validate latitude range (-90 to 90)", () => {
      const invalidData = { 
        name: "Test Farm",
        latitude: 91, 
        longitude: -122 
      };
      expect(() => createFarmSchema.parse(invalidData)).toThrow();
    });

    it("should validate longitude range (-180 to 180)", () => {
      const invalidData = { 
        name: "Test Farm",
        latitude: 37, 
        longitude: 181 
      };
      expect(() => createFarmSchema.parse(invalidData)).toThrow();
    });

    it("should require address for DELIVERY fulfillment", () => {
      // Test implementation
    });

    it("should validate email format if provided", () => {
      // Test implementation
    });

    it("should validate phone format if provided", () => {
      // Test implementation
    });

    it("should validate zip code format", () => {
      // Test implementation
    });
  });

  describe("farmLocationSchema", () => {
    it("should accept valid coordinates", () => {
      // Test implementation
    });

    it("should reject coordinates outside valid ranges", () => {
      // Test implementation
    });
  });

  describe("updateFarmSchema", () => {
    it("should allow partial updates", () => {
      // Test implementation
    });

    it("should validate updated fields", () => {
      // Test implementation
    });
  });
});
```

**Expected Coverage:** farm.ts 0% → 85%

#### Day 3-4: Agricultural Validation Tests
**File:** `src/lib/validations/__tests__/agricultural.validation.test.ts` (NEW)

```typescript
describe("Agricultural Validation", () => {
  describe("Season Validation", () => {
    it("should accept valid seasons", () => {
      expect(validateSeason("SPRING")).toBe(true);
      expect(validateSeason("SUMMER")).toBe(true);
      expect(validateSeason("FALL")).toBe(true);
      expect(validateSeason("WINTER")).toBe(true);
    });

    it("should reject invalid seasons", () => {
      expect(validateSeason("AUTUMN")).toBe(false);
    });
  });

  describe("Crop Validation", () => {
    it("should validate crop planting dates", () => {
      // Test seasonal appropriateness
    });

    it("should validate growing zones", () => {
      // Test USDA hardiness zones
    });
  });

  describe("Organic Certification", () => {
    it("should validate certification numbers", () => {
      // Test format
    });

    it("should validate expiration dates", () => {
      // Test dates in future
    });
  });
});
```

**Expected Coverage:** agricultural.ts 0% → 80%

#### Day 5: Product & Order Validation
**Files:** 
- `src/lib/validations/__tests__/product.validation.test.ts`
- `src/lib/validations/__tests__/order.validation.test.ts`

**Coverage:** product.ts 100% → maintain, order.ts 91% → 95%

---

### Week 2: State Management & Stores
**Target:** +7% coverage (21% → 28%)  
**Effort:** 40 hours

#### Day 1-3: Checkout Store Tests
**File:** `src/stores/__tests__/checkoutStore.test.ts` (NEW)

```typescript
import { checkoutStore } from "@/stores/checkoutStore";

describe("CheckoutStore", () => {
  beforeEach(() => {
    // Reset store state
    checkoutStore.reset();
  });

  describe("Cart Management", () => {
    it("should add items to cart", () => {
      checkoutStore.addItem({
        productId: "prod_123",
        quantity: 2,
        price: 10.99,
      });

      expect(checkoutStore.items).toHaveLength(1);
      expect(checkoutStore.items[0].quantity).toBe(2);
    });

    it("should update item quantity", () => {
      checkoutStore.addItem({ productId: "prod_123", quantity: 1 });
      checkoutStore.updateQuantity("prod_123", 3);

      expect(checkoutStore.items[0].quantity).toBe(3);
    });

    it("should remove items from cart", () => {
      checkoutStore.addItem({ productId: "prod_123", quantity: 1 });
      checkoutStore.removeItem("prod_123");

      expect(checkoutStore.items).toHaveLength(0);
    });
  });

  describe("Price Calculations", () => {
    it("should calculate subtotal correctly", () => {
      checkoutStore.addItem({ productId: "1", quantity: 2, price: 10 });
      checkoutStore.addItem({ productId: "2", quantity: 1, price: 15 });

      expect(checkoutStore.subtotal).toBe(35);
    });

    it("should calculate tax correctly", () => {
      checkoutStore.addItem({ productId: "1", quantity: 1, price: 100 });
      checkoutStore.setTaxRate(0.0875); // 8.75%

      expect(checkoutStore.tax).toBe(8.75);
    });

    it("should calculate total with tax and shipping", () => {
      checkoutStore.addItem({ productId: "1", quantity: 1, price: 100 });
      checkoutStore.setTaxRate(0.0875);
      checkoutStore.setShippingCost(10);

      expect(checkoutStore.total).toBe(118.75);
    });
  });

  describe("Shipping Address", () => {
    it("should set shipping address", () => {
      const address = {
        street: "123 Main St",
        city: "Farmville",
        state: "CA",
        zipCode: "12345",
      };

      checkoutStore.setShippingAddress(address);
      expect(checkoutStore.shippingAddress).toEqual(address);
    });

    it("should validate required address fields", () => {
      expect(() => {
        checkoutStore.setShippingAddress({} as any);
      }).toThrow();
    });
  });

  describe("Payment Method", () => {
    it("should set payment method", () => {
      checkoutStore.setPaymentMethod("CREDIT_CARD");
      expect(checkoutStore.paymentMethod).toBe("CREDIT_CARD");
    });

    it("should only accept valid payment methods", () => {
      expect(() => {
        checkoutStore.setPaymentMethod("BITCOIN" as any);
      }).toThrow();
    });
  });

  describe("Checkout Validation", () => {
    it("should require items in cart", () => {
      const validation = checkoutStore.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Cart is empty");
    });

    it("should require shipping address for delivery", () => {
      checkoutStore.addItem({ productId: "1", quantity: 1, price: 10 });
      checkoutStore.setFulfillmentMethod("DELIVERY");

      const validation = checkoutStore.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Shipping address required");
    });

    it("should require payment method", () => {
      checkoutStore.addItem({ productId: "1", quantity: 1, price: 10 });
      checkoutStore.setShippingAddress(validAddress);

      const validation = checkoutStore.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payment method required");
    });

    it("should validate successfully with all required fields", () => {
      checkoutStore.addItem({ productId: "1", quantity: 1, price: 10 });
      checkoutStore.setShippingAddress(validAddress);
      checkoutStore.setPaymentMethod("CREDIT_CARD");

      const validation = checkoutStore.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });
});
```

**Expected Coverage:** checkoutStore.ts 0% → 90%

#### Day 4-5: Cart Store Tests
**File:** `src/stores/__tests__/cartStore.test.ts` (existing, enhance)

**Coverage:** cartStore.ts 100% → maintain

---

### Week 3: Utility Functions
**Target:** +7% coverage (28% → 35%)  
**Effort:** 40 hours

#### Day 1-3: Metadata Utilities
**File:** `src/lib/utils/__tests__/metadata.test.ts` (NEW)

```typescript
import {
  generatePageMetadata,
  generateOpenGraph,
  generateTwitterCard,
  generateCanonicalUrl,
} from "@/lib/utils/metadata";

describe("Metadata Utilities", () => {
  describe("generatePageMetadata", () => {
    it("should generate basic page metadata", () => {
      const metadata = generatePageMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.title).toBe("Test Page | Farmers Market");
      expect(metadata.description).toBe("Test description");
    });

    it("should include OpenGraph tags", () => {
      const metadata = generatePageMetadata({
        title: "Test Page",
        image: "/test-image.jpg",
      });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph.title).toBe("Test Page");
      expect(metadata.openGraph.images).toContain("/test-image.jpg");
    });

    it("should include Twitter card", () => {
      const metadata = generatePageMetadata({
        title: "Test Page",
      });

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter.card).toBe("summary_large_image");
    });
  });

  describe("generateOpenGraph", () => {
    it("should generate OpenGraph tags for product", () => {
      const og = generateOpenGraph({
        type: "product",
        title: "Fresh Tomatoes",
        description: "Organic tomatoes from Sunny Acres",
        image: "/products/tomatoes.jpg",
        price: 4.99,
      });

      expect(og.type).toBe("product");
      expect(og.product?.price).toBe(4.99);
    });

    it("should generate OpenGraph tags for farm", () => {
      const og = generateOpenGraph({
        type: "farm",
        title: "Sunny Acres Farm",
        description: "Family-owned organic farm",
      });

      expect(og.type).toBe("farm");
    });
  });

  describe("generateCanonicalUrl", () => {
    it("should generate canonical URL from path", () => {
      const url = generateCanonicalUrl("/farms/sunny-acres");
      expect(url).toBe("https://farmersmarket.com/farms/sunny-acres");
    });

    it("should handle trailing slashes", () => {
      const url = generateCanonicalUrl("/farms/sunny-acres/");
      expect(url).toBe("https://farmersmarket.com/farms/sunny-acres");
    });
  });
});
```

**Expected Coverage:** metadata.ts 0% → 85%

#### Day 4-5: Other Utility Functions
- Currency formatting tests
- Date utility tests
- Slug generation tests
- Quantum utility tests

**Coverage:** Various utilities 34% → 70%

---

## PHASE 2: BUSINESS LOGIC (Weeks 4-6)

### Week 4: Service Layer - Farm & Product
**Target:** +10% coverage (35% → 45%)

#### Farm Service Tests
**File:** `src/lib/services/__tests__/farm.service.test.ts` (enhance existing)

```typescript
describe("FarmService", () => {
  describe("createFarm", () => {
    it("should create farm with valid data", async () => {
      const farmData = {
        name: "Test Farm",
        ownerId: "user_123",
        address: "123 Farm Rd",
        city: "Farmville",
        state: "CA",
        zipCode: "12345",
        latitude: 37.7749,
        longitude: -122.4194,
      };

      const farm = await farmService.createFarm(farmData);

      expect(farm).toBeDefined();
      expect(farm.name).toBe("Test Farm");
      expect(farm.slug).toBe("test-farm");
    });

    it("should generate unique slug when name conflicts", async () => {
      // Create first farm
      await farmService.createFarm({ name: "Test Farm", ownerId: "user_1" });
      
      // Create second farm with same name
      const farm2 = await farmService.createFarm({ 
        name: "Test Farm", 
        ownerId: "user_2" 
      });

      expect(farm2.slug).toMatch(/test-farm-\d+/);
    });

    it("should validate farm location coordinates", async () => {
      await expect(
        farmService.createFarm({
          name: "Test Farm",
          latitude: 91, // Invalid
          longitude: -122,
        })
      ).rejects.toThrow("Invalid coordinates");
    });

    it("should set default values for optional fields", async () => {
      const farm = await farmService.createFarm({
        name: "Test Farm",
        ownerId: "user_123",
      });

      expect(farm.status).toBe("PENDING_VERIFICATION");
      expect(farm.deliveryRadius).toBe(25); // Default
    });
  });

  describe("updateFarm", () => {
    it("should update farm details", async () => {
      // Test implementation
    });

    it("should require ownership to update", async () => {
      // Test implementation
    });
  });

  describe("verifyFarm", () => {
    it("should verify farm when admin approves", async () => {
      // Test implementation
    });

    it("should send notification on verification", async () => {
      // Test implementation
    });
  });

  describe("getFarmsByLocation", () => {
    it("should return farms within radius", async () => {
      // Test implementation with various distances
    });
  });
});
```

#### Product Service Tests
**File:** `src/lib/services/__tests__/product.service.test.ts` (enhance)

```typescript
describe("ProductService", () => {
  describe("createProduct", () => {
    it("should create product with valid data", async () => {
      // Test implementation
    });

    it("should generate unique slug", async () => {
      // Test implementation
    });

    it("should validate farm ownership", async () => {
      // Test unauthorized creation
    });

    it("should calculate inventory values correctly", async () => {
      // Test availableQuantity = quantity - reservedQuantity
    });

    it("should set isLowStock flag correctly", async () => {
      // Test low stock threshold
    });
  });

  describe("updateProduct", () => {
    it("should update product details", async () => {
      // Test implementation
    });

    it("should recalculate inventory on update", async () => {
      // Test implementation
    });
  });

  describe("listProducts", () => {
    it("should filter by category", async () => {
      // Test implementation
    });

    it("should filter by farm", async () => {
      // Test implementation
    });

    it("should paginate results", async () => {
      // Test implementation
    });

    it("should sort by various fields", async () => {
      // Test sorting by price, name, date
    });
  });

  describe("searchProducts", () => {
    it("should search by name", async () => {
      // Test implementation
    });

    it("should search by description", async () => {
      // Test implementation
    });

    it("should rank results by relevance", async () => {
      // Test implementation
    });
  });
});
```

---

### Week 5: Service Layer - Orders & Payments
**Target:** +10% coverage (45% → 55%)

#### Order Service Tests
**File:** `src/lib/services/__tests__/order.service.test.ts` (enhance)

```typescript
describe("OrderService", () => {
  describe("createOrder", () => {
    it("should create order from cart", async () => {
      const cart = {
        items: [
          { productId: "prod_1", quantity: 2, price: 10 },
        ],
        customerId: "user_123",
        farmId: "farm_123",
      };

      const order = await orderService.createOrder(cart);

      expect(order.status).toBe("PENDING");
      expect(order.items).toHaveLength(1);
      expect(order.total).toBe(20);
    });

    it("should validate product availability", async () => {
      // Test out of stock handling
    });

    it("should reserve inventory on order creation", async () => {
      // Test inventory reservation
    });

    it("should calculate delivery date", async () => {
      // Test delivery date calculation
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status", async () => {
      // Test status transitions
    });

    it("should validate status transitions", async () => {
      // Test invalid transitions (e.g., COMPLETED -> PENDING)
    });

    it("should send notifications on status change", async () => {
      // Test customer notifications
    });
  });

  describe("cancelOrder", () => {
    it("should cancel pending order", async () => {
      // Test cancellation
    });

    it("should release inventory on cancellation", async () => {
      // Test inventory release
    });

    it("should initiate refund if paid", async () => {
      // Test payment refund
    });

    it("should not cancel completed orders", async () => {
      // Test cancellation restrictions
    });
  });
});
```

#### Payment Service Tests
**File:** `src/lib/services/__tests__/payment.service.test.ts` (enhance)

```typescript
describe("PaymentService", () => {
  describe("createPaymentIntent", () => {
    it("should create Stripe payment intent", async () => {
      const intent = await paymentService.createPaymentIntent({
        amount: 5000, // $50.00
        orderId: "order_123",
      });

      expect(intent.id).toMatch(/^pi_/);
      expect(intent.amount).toBe(5000);
    });

    it("should include metadata", async () => {
      const intent = await paymentService.createPaymentIntent({
        amount: 5000,
        orderId: "order_123",
        customerId: "user_123",
      });

      expect(intent.metadata.orderId).toBe("order_123");
    });
  });

  describe("processWebhook", () => {
    it("should handle payment_intent.succeeded", async () => {
      // Test webhook handling
    });

    it("should handle payment_intent.failed", async () => {
      // Test failure handling
    });

    it("should validate webhook signature", async () => {
      // Test security
    });
  });

  describe("refundPayment", () => {
    it("should create refund", async () => {
      // Test refund creation
    });

    it("should update order status", async () => {
      // Test order status update
    });
  });
});
```

---

### Week 6: Additional Services
**Target:** +5% coverage (55% → 60%)

- Cart service tests (enhance)
- Checkout service tests (enhance)
- Shipping service tests (new)
- Geocoding service tests (new)
- Biodynamic calendar tests (new)

---

## PHASE 3: API INTEGRATION (Weeks 7-9)

### Week 7: API Routes - Farms & Products
**Target:** +8% coverage (60% → 68%)

#### Farm API Tests
**File:** `src/app/api/farms/__tests__/route.test.ts` (NEW)

```typescript
import { GET, POST } from "@/app/api/farms/route";
import { NextRequest } from "next/server";

describe("Farms API", () => {
  describe("GET /api/farms", () => {
    it("should return list of farms", async () => {
      const request = new NextRequest("http://localhost:3001/api/farms");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should filter by location", async () => {
      const request = new NextRequest(
        "http://localhost:3001/api/farms?lat=37.7749&lng=-122.4194&radius=25"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toBeDefined();
      // All farms should be within 25 miles
    });

    it("should paginate results", async () => {
      const request = new NextRequest(
        "http://localhost:3001/api/farms?page=1&limit=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.meta.pagination.page).toBe(1);
      expect(data.meta.pagination.limit).toBe(10);
    });
  });

  describe("POST /api/farms", () => {
    it("should create farm with valid data", async () => {
      const request = new NextRequest("http://localhost:3001/api/farms", {
        method: "POST",
        body: JSON.stringify({
          name: "Test Farm",
          address: "123 Farm Rd",
          city: "Farmville",
          state: "CA",
          zipCode: "12345",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("Test Farm");
    });

    it("should require authentication", async () => {
      const request = new NextRequest("http://localhost:3001/api/farms", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("should validate input data", async () => {
      const request = new NextRequest("http://localhost:3001/api/farms", {
        method: "POST",
        body: JSON.stringify({ name: "AB" }), // Too short
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
```

#### Product API Tests
- GET /api/products - List products
- POST /api/products - Create product
- GET /api/products/[id] - Get product
- PATCH /api/products/[id] - Update product
- DELETE /api/products/[id] - Delete product

---

### Week 8: API Routes - Orders & Cart
**Target:** +6% coverage (68% → 74%)

#### Order API Tests
- POST /api/orders - Create order
- GET /api/orders - List orders
- GET /api/orders/[id] - Get order details
- PATCH /api/orders/[id] - Update order status
- POST /api/orders/[id]/cancel - Cancel order

#### Cart API Tests
- GET /api/cart - Get cart
- POST /api/cart/items - Add item
- PATCH /api/cart/items/[id] - Update quantity
- DELETE /api/cart/items/[id] - Remove item
- DELETE /api/cart - Clear cart

---

### Week 9: API Routes - Payments & Admin
**Target:** +6% coverage (74% → 80%)

#### Payment API Tests
- POST /api/payments/intent - Create payment intent
- POST /api/webhooks/stripe - Stripe webhook handler
- POST /api/payments/refund - Process refund

#### Admin API Tests
- GET /api/admin/dashboard - Admin dashboard data
- GET /api/admin/users - User management
- PATCH /api/admin/farms/[id]/verify - Farm verification
- GET /api/admin/analytics - Platform analytics

---

## PHASE 4: POLISH & EDGE CASES (Weeks 10-12)

### Week 10: Error Handling & Edge Cases
**Target:** +5% coverage (80% → 85%)

#### Error Scenarios
- Network failures
- Database connection errors
- Invalid authentication tokens
- Rate limiting
- Concurrent operations
- Data race conditions

#### Edge Cases
- Empty datasets
- Maximum value boundaries
- Special characters in input
- Large file uploads
- Pagination edge cases
- Timezone handling

---

### Week 11: Component & Hook Tests
**Target:** +3% coverage (85% → 88%)

#### Component Tests (Enhance existing)
- Form components
- Product cards
- Farm profiles
- Order details
- Search components
- Filter components

#### Hook Tests
- useCart
- useAuth
- useFarms
- useProducts
- useOrders

---

### Week 12: Integration & E2E Enhancement
**Target:** +2% coverage (88% → 90%+)

#### Full User Flows
- User registration → browse → purchase → order tracking
- Farmer onboarding → farm creation → product listing
- Admin verification workflows
- Search and discovery flows
- Payment processing flows

#### Performance Tests
- Load testing coverage
- Stress testing
- Concurrent user scenarios

---

## 🛠️ Testing Infrastructure & Tools

### Test Setup

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/app/layout.tsx',
    '!src/app/**/loading.tsx',
  ],
};
```

#### Test Utilities
```typescript
// src/lib/test-utils.tsx
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

export function renderWithProviders(component: React.ReactElement) {
  return render(
    <SessionProvider session={mockSession}>
      {component}
    </SessionProvider>
  );
}

export const mockSession = {
  user: {
    id: 'user_123',
    email: 'test@example.com',
    role: 'CUSTOMER',
  },
};

export function createMockFarm() {
  return {
    id: 'farm_123',
    name: 'Test Farm',
    slug: 'test-farm',
    ownerId: 'user_123',
    status: 'ACTIVE',
  };
}

export function createMockProduct() {
  return {
    id: 'prod_123',
    name: 'Test Product',
    farmId: 'farm_123',
    price: 10.99,
    inventory: {
      quantity: 100,
      reservedQuantity: 0,
      availableQuantity: 100,
    },
  };
}
```

---

## 📊 Progress Tracking

### Daily Checklist
```markdown
- [ ] Write tests for target files
- [ ] Run coverage report: `npm run test:coverage`
- [ ] Review coverage increase
- [ ] Commit tests with descriptive message
- [ ] Update progress in team channel
```

### Weekly Review
```markdown
- [ ] Calculate coverage gain
- [ ] Identify blockers
- [ ] Adjust plan if needed
- [ ] Present progress to team
- [ ] Plan next week's targets
```

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# Generate HTML report
npm run test:coverage -- --coverageReporters=html

# View report
open coverage/index.html

# Check specific file
npm run test:coverage -- src/lib/services/farm.service.ts
```

---

## 🎯 Success Metrics

### Week-by-Week Targets
| Week | Target Coverage | Focus Area | Key Files |
|------|-----------------|------------|-----------|
| 1 | 21% | Validation | farm.ts, agricultural.ts |
| 2 | 28% | Stores | checkoutStore.ts |
| 3 | 35% | Utils | metadata.ts |
| 4 | 45% | Services | farm.service.ts |
| 5 | 55% | Services | order.service.ts, payment.service.ts |
| 6 | 60% | Services | Additional services |
| 7 | 68% | API | Farms & Products APIs |
| 8 | 74% | API | Orders & Cart APIs |
| 9 | 80% | API | Payments & Admin APIs |
| 10 | 85% | Edge Cases | Error handling |
| 11 | 88% | Components | React components |
| 12 | 90%+ | Integration | E2E flows |

### Quality Gates
- All tests must pass
- No TypeScript errors
- No ESLint errors
- Test execution time < 3 minutes
- Coverage increase every week

---

## 🚀 Quick Start Commands

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- farm.service.test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should create farm"

# Update snapshots
npm run test -- -u

# Run tests with verbose output
npm run test -- --verbose
```

---

## 📝 Test Writing Guidelines

### Good Test Structure
```typescript
describe("Feature/Component Name", () => {
  // Setup
  beforeEach(() => {
    // Reset state
  });

  describe("specific functionality", () => {
    it("should do something specific", () => {
      // Arrange
      const input = createTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Test Naming Convention
```typescript
// ✅ Good
it("should create farm with valid data")
it("should throw error when name is too short")
it("should return 401 when user not authenticated")

// ❌ Bad
it("test farm creation")
it("error test")
it("works")
```

### Coverage vs Quality
- Don't write tests just for coverage percentage
- Focus on testing behavior, not implementation
- Test edge cases and error conditions
- Test user-facing functionality first
- Integration tests provide more confidence than unit tests

---

## 🔄 Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/test-coverage.yml
name: Test Coverage

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - name: Check coverage threshold
        run: |
          COVERAGE=$(npm run test:coverage -- --json | jq '.coverage.total.statements.pct')
          if (( $(echo "$COVERAGE < 90" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 90% threshold"
            exit 1
          fi
```

---

## 💡 Tips & Best Practices

### Mocking Best Practices
```typescript
// Mock external dependencies
jest.mock('@/lib/database');
jest.mock('@/lib/stripe');

// Mock only what you need
jest.mock('@/lib/services/email', () => ({
  sendEmail: jest.fn(),
}));

// Use factory functions
const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  ...overrides,
});
```

### Async Testing
```typescript
// ✅ Use async/await
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// ❌ Don't forget await
it('should fetch data', () => {
  const data = fetchData(); // This returns a Promise!
  expect(data).toBeDefined(); // Will fail
});
```

### Test Isolation
```typescript
// ✅ Clean up after each test
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Reset any global state
});

// ❌ Don't let tests affect each other
let globalState = {}; // Bad! Tests will interfere
```

---

## 📈 Expected Results

### Coverage Progression
```
Week 1:  13% → 21% (+8%)  [Validation]
Week 2:  21% → 28% (+7%)  [Stores]
Week 3:  28% → 35% (+7%)  [Utils]
Week 4:  35% → 45% (+10%) [Services 1]
Week 5:  45% → 55% (+10%) [Services 2]
Week 6:  55% → 60% (+5%)  [Services 3]
Week 7:  60% → 68% (+8%)  [API 1]
Week 8:  68% → 74% (+6%)  [API 2]
Week 9:  74% → 80% (+6%)  [API 3]
Week 10: 80% → 85% (+5%)  [Edge Cases]
Week 11: 85% → 88% (+3%)  [Components]
Week 12: 88% → 90%+ (+2%) [Integration]
```

### Team Capacity
- 1-2 engineers full-time
- 40 hours per week per engineer
- ~480 hours total effort
- Average 50-60 tests per week

---

## ✅ Completion Criteria

### Phase 1 Complete When:
- [ ] All validation schemas have tests
- [ ] Checkout store fully tested
- [ ] Utility functions covered
- [ ] Coverage ≥ 35%

### Phase 2 Complete When:
- [ ] All service classes have tests
- [ ] Business logic validated
- [ ] Error handling tested
- [ ] Coverage ≥ 60%

### Phase 3 Complete When:
- [ ] All API routes have integration tests
- [ ] Auth/authorization tested
- [ ] Request/response formats validated
- [ ] Coverage ≥ 80%

### Phase 4 Complete When:
- [ ] Edge cases covered
- [ ] Component tests enhanced
- [ ] E2E flows validated
- [ ] Coverage ≥ 90%

### Final Checklist:
- [ ] Coverage ≥ 90% for statements
- [ ] Coverage ≥ 90% for branches
- [ ] Coverage ≥ 90% for functions
- [ ] Coverage ≥ 90% for lines
- [ ] All tests passing
- [ ] CI/CD integration complete
- [ ] Documentation updated

---

**Status:** ✅ Ready for Execution  
**Owner:** Development Team  
**Estimated Completion:** Week 12  
**Next Review:** End of Phase 1 (Week 3)

---

_"Test coverage is not about hitting a number—it's about building confidence in our code."_ 🧪