# 🎯 Next Session: Quick Action Plan

**Current Status:** 134/233 passing (57.5%)  
**Target:** 180/233 passing (77.2%)  
**Gap:** 46 tests to fix

---

## 🚨 Critical Blocker to Resolve First

### Issue: API Route Handler Testing Pattern

**Problem:** Direct invocation of Next.js route handlers fails because `request.json()` returns undefined.

**Current Failing Pattern:**
```typescript
const request = new Request("http://localhost:3000/api/cart", {
  method: "POST",
  body: JSON.stringify(data),
});
const response = await POST(request as any);
// ❌ Inside handler: await request.json() returns undefined
```

**Affected Test Suites:**
- Cart API (11 failing tests)
- Products API (unknown count)
- Orders API (unknown count)

**Solution Options:**

### Option 1: Mock request.json() (RECOMMENDED - Fast)
```typescript
// Before calling the route
const mockRequest = {
  json: jest.fn().mockResolvedValue(itemData),
  method: 'POST',
  headers: new Headers({ 'Content-Type': 'application/json' }),
} as any;

const response = await POST(mockRequest);
```

### Option 2: Test Service Layer Directly (PREFERRED - Clean)
```typescript
// Instead of testing route handler, test the service
import { cartService } from '@/lib/services/cart.service';

const result = await cartService.addToCart(
  testCustomer.id,
  {
    productId: testProduct2.id,
    quantity: 3,
    fulfillmentMethod: 'DELIVERY'
  }
);

expect(result.success).toBe(true);
```

### Option 3: Use node-mocks-http (COMPREHENSIVE)
```bash
npm install --save-dev node-mocks-http
```

```typescript
import { createMocks } from 'node-mocks-http';

const { req, res } = createMocks({
  method: 'POST',
  body: itemData,
});

await POST(req as any, res as any);
```

**Recommendation:** Start with Option 2 (service layer testing) as it:
- Matches the successful farms test pattern
- Tests business logic directly
- Avoids Next.js mocking complexity
- Is faster and more reliable

---

## 📋 Step-by-Step Execution Plan

### Phase 1: Fix Cart Tests (30 minutes)

1. **Create Cart Service** (if doesn't exist)
   ```typescript
   // lib/services/cart.service.ts
   export class CartService {
     async addToCart(userId: string, data: AddToCartInput) { }
     async getCart(userId: string) { }
     async updateCartItem(userId: string, productId: string, quantity: number) { }
     async removeFromCart(userId: string, productId: string) { }
   }
   ```

2. **Update Cart Tests**
   - Change from route handler to service testing
   - Remove request mocking
   - Test business logic directly

3. **Expected Result:** 11 more tests passing

### Phase 2: Fix Products API Tests (30 minutes)

1. **Identify Issues**
   ```bash
   npm run test:integration -- src/__tests__/integration/api/products.api.integration.test.ts
   ```

2. **Common Fixes Needed:**
   - ProductCategory enum usage
   - ProductStatus enum usage
   - Decimal field assertions
   - Required field additions

3. **Expected Result:** 8-10 more tests passing

### Phase 3: Fix Orders API Tests (45 minutes)

1. **Check Order Schema Requirements**
   ```typescript
   // Ensure all required fields for Order creation
   - userId, farmId, status
   - totalAmount, subtotal
   - deliveryAddress or pickupLocation
   - orderItems array
   ```

2. **Create Order Test Helper**
   ```typescript
   export async function createTestOrder(
     userId: string,
     farmId: string,
     items: OrderItemInput[]
   ): Promise<Order>
   ```

3. **Expected Result:** 10-12 more tests passing

### Phase 4: Fix Farms Service Tests (20 minutes)

**Current:** 3/5 passing (60%)

**Remaining Issues:**
- Pagination test expects 10 but gets 20
- Farm ownership validation failing

**Fixes:**
```typescript
// Fix pagination
const result = await farmService.listFarms({ 
  page: 1, 
  pageSize: 10  // Explicitly set page size
});
expect(result.farms.length).toBe(10);

// Fix ownership check
const ownedFarms = await farmService.getFarmsByOwner(testFarmer.id);
expect(ownedFarms.every(f => f.ownerId === testFarmer.id)).toBe(true);
```

**Expected Result:** 2 more tests passing

### Phase 5: Quick Webhook Fixes (15 minutes)

**Current:** 1/? passing

**Fix:** Mock Stripe webhook signature verification
```typescript
jest.mock('stripe', () => ({
  webhooks: {
    constructEvent: jest.fn((payload, sig, secret) => {
      if (sig === 'invalid') throw new Error('Invalid signature');
      return JSON.parse(payload);
    })
  }
}));
```

**Expected Result:** 3-5 more tests passing

---

## 📊 Progress Tracking

| Phase | Tests to Fix | Time Est. | Priority |
|-------|--------------|-----------|----------|
| Cart Tests | 11 | 30 min | 🔴 Critical |
| Products API | 10 | 30 min | 🔴 High |
| Orders API | 12 | 45 min | 🟡 High |
| Farms Service | 2 | 20 min | 🟡 Medium |
| Webhooks | 5 | 15 min | 🟢 Low |
| **TOTAL** | **40** | **2.5 hrs** | - |

**Target Achievement:** 134 + 40 = 174 tests passing (74.7%)

---

## 🎯 Session Goals

### Minimum (Must Complete)
- ✅ Fix cart tests using service layer pattern
- ✅ Fix products API tests  
- ✅ Document chosen testing pattern
- **Result:** ~155 tests passing (66.5%)

### Target (Should Complete)
- ✅ All Phase 1-3 items
- ✅ Farms service fixes
- **Result:** ~167 tests passing (71.7%)

### Stretch (Nice to Have)
- ✅ All Phase 1-5 items
- ✅ Start on journey tests
- **Result:** 174+ tests passing (74.7%+)

---

## 🛠️ Pre-Session Checklist

Before starting, ensure:
- [ ] Database is running (port 5433)
- [ ] All dependencies installed
- [ ] `.env.test` is configured
- [ ] Previous session changes are committed
- [ ] Fresh terminal/IDE restart

---

## 📝 Commands to Run

```bash
# Run all integration tests
npm run test:integration

# Run specific suite
npm run test:integration -- src/__tests__/integration/api/cart.api.integration.test.ts

# Watch mode for iterative fixing
npm run test:integration -- --watch

# Coverage report
npm run test:integration -- --coverage
```

---

## 🚫 What NOT to Do

1. **Don't tackle journey tests yet** - Too complex, save for later
2. **Don't try to fix everything at once** - Focus on one suite at a time
3. **Don't change the schema** - Work with existing schema
4. **Don't skip documentation** - Update session notes as you go

---

## 📚 Reference Files

**Successful Pattern Examples:**
- `src/__tests__/integration/api/farms.integration.test.ts` - Service layer testing
- `tests/integration/db/product.repository.integration.test.ts` - Repository testing
- `tests/helpers/api-test-helpers.ts` - Test data factories

**Enum Definitions:**
- `prisma/schema.prisma` - Lines 1859-1880 (ProductCategory, ProductStatus)

**Helper Functions:**
- `tests/helpers/integration-helpers.ts` - Cleanup utilities
- `tests/helpers/api-test-helpers.ts` - Data factories

---

## 💡 Pro Tips

1. **Fix one test suite completely before moving to next**
   - More satisfying
   - Easier to track progress
   - Less context switching

2. **Run tests frequently**
   - After each fix, run the suite
   - Catch regressions immediately
   - Maintain momentum with quick wins

3. **Copy-paste working patterns**
   - Use farms test as template
   - Consistent patterns = maintainable tests

4. **Log liberally during debugging**
   - `console.log()` is your friend
   - Remove logs after fix is confirmed

---

## 🎉 Success Criteria

**Session is successful if:**
- ✅ 20+ more tests passing
- ✅ Testing pattern decision documented
- ✅ Cart and products tests fixed
- ✅ Pass rate above 66%

**Bonus points if:**
- ✅ Orders tests fixed
- ✅ Pass rate above 72%
- ✅ All API tests using consistent pattern

---

## 📞 Need Help?

**Common Issues & Solutions:**

1. **"Cannot read property 'id' of undefined"**
   - Check that test data was created successfully
   - Verify no cleanup ran prematurely
   - Ensure relationships are included in queries

2. **"Invalid enum value"**
   - Import enum from @prisma/client
   - Use `ProductCategory.VEGETABLES` not `"VEGETABLES"`

3. **"Decimal comparison fails"**
   - Use `.toString()` for Decimal fields
   - Example: `expect(price.toString()).toBe("5.99")`

4. **"Required argument missing"**
   - Check Prisma schema for required fields
   - Add missing fields to test data

---

**Ready? Let's make testing history! 🚀**

*Last Updated: January 2025*
*Session 12 Complete - Session 13 Ready to Go*