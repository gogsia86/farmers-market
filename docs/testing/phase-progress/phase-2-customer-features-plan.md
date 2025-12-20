# 🛒 Phase 2: Customer Features E2E Implementation Plan

## Farmers Market Platform - Customer Experience Testing

**Created:** January 2025  
**Status:** 🚀 READY TO START  
**Priority:** 🔴 HIGH  
**Based on:** Phase 1 completion and E2E Coverage Analysis

---

## 📋 Executive Summary

Phase 2 focuses on comprehensive end-to-end testing of all customer-facing features in the Farmers Market Platform. This phase will increase overall test coverage from **65%** to an estimated **80%**, with customer flows reaching **90%** coverage.

### Phase 1 Achievements ✅

- ✅ Farmer Analytics (26 tests)
- ✅ Farmer Finances (28 tests)
- ✅ Admin Financial Reports (29 tests)
- ✅ Admin User Management (32 tests)
- ✅ Overall coverage increased to 65%
- ✅ Farmer flows: 85% coverage
- ✅ Admin flows: 70% coverage

### Phase 2 Goals 🎯

- 🎯 Customer Favorites: 25+ tests
- 🎯 Customer Reviews: 30+ tests
- 🎯 Customer Addresses: 22+ tests
- 🎯 Customer Order Tracking: 28+ tests
- 🎯 Customer Profile: 24+ tests
- 🎯 **Total New Tests: 129+**
- 🎯 **Target Coverage: 80% overall, 90% customer flows**

---

## 🏗️ Architecture Overview

### Test Structure

```
tests/e2e/customer/
├── favorites.spec.ts          # Farms & products favorites management
├── reviews.spec.ts            # Reviews & ratings system
├── addresses.spec.ts          # Address management
├── order-tracking.spec.ts     # Order history & tracking
└── profile-management.spec.ts # Profile editing & preferences
```

### Authentication Setup

All customer tests will use the authenticated customer state:

```typescript
// tests/e2e/auth.setup.ts
import { test as setup } from "@playwright/test";

setup("authenticate as customer", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "customer@farmersmarket.app");
  await page.fill('input[name="password"]', "DivineCustomer123!");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
  await page.context().storageState({ path: ".auth/customer.json" });
});
```

### Test Configuration

```typescript
// playwright.config.ts - Customer project
{
  name: 'customer',
  testMatch: ['**/customer/**/*.spec.ts'],
  use: {
    ...devices['Desktop Chrome'],
    storageState: '.auth/customer.json',
  },
  dependencies: ['setup-customer'],
}
```

---

## 📝 Detailed Test Specifications

## 1️⃣ Customer Favorites (`favorites.spec.ts`)

### Test Coverage: 25+ tests

#### A. Favorites Page Navigation (3 tests)

```typescript
test.describe("Favorites Page Navigation", () => {
  test("should navigate to favorites from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('a[href="/dashboard/favorites"]');
    await expect(page).toHaveURL("/dashboard/favorites");
  });

  test("should display correct page title and description", async ({
    page,
  }) => {
    await page.goto("/dashboard/favorites");
    await expect(page.locator("h1")).toContainText("My Favorites");
  });

  test("should show tab navigation for farms and products", async ({
    page,
  }) => {
    await page.goto("/dashboard/favorites");
    await expect(page.locator('button:has-text("Farms")')).toBeVisible();
    await expect(page.locator('button:has-text("Products")')).toBeVisible();
  });
});
```

#### B. Farm Favorites Management (8 tests)

- View list of favorite farms
- Toggle favorite farm (add/remove)
- View farm details from favorites
- Filter/search favorite farms
- Empty state when no favorites
- Remove farm from favorites with confirmation
- Display farm stats (products count, rating)
- Navigate to farm profile page

#### C. Product Favorites Management (8 tests)

- View list of favorite products
- Toggle favorite product (add/remove)
- View product details from favorites
- Filter/search favorite products
- Empty state when no favorites
- Remove product from favorites
- Display product info (price, availability)
- Add to cart from favorites

#### D. Favorites Interactions (6 tests)

- Bulk remove favorites
- Share favorites list
- Sync favorites across devices
- Favorites count badge in navigation
- Real-time updates when toggling
- Responsive design (mobile/tablet/desktop)

---

## 2️⃣ Customer Reviews (`reviews.spec.ts`)

### Test Coverage: 30+ tests

#### A. Reviews Page Navigation (3 tests)

```typescript
test.describe("Reviews Page Navigation", () => {
  test("should navigate to reviews from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('a[href="/dashboard/reviews"]');
    await expect(page).toHaveURL("/dashboard/reviews");
  });

  test("should show pending reviews count", async ({ page }) => {
    await page.goto("/dashboard");
    const badge = page.locator('[data-testid="pending-reviews-badge"]');
    const count = await badge.textContent();
    expect(parseInt(count || "0")).toBeGreaterThanOrEqual(0);
  });

  test("should display review history and submission tabs", async ({
    page,
  }) => {
    await page.goto("/dashboard/reviews");
    await expect(page.locator('button:has-text("My Reviews")')).toBeVisible();
    await expect(page.locator('button:has-text("Write Review")')).toBeVisible();
  });
});
```

#### B. Review Submission (10 tests)

- Submit farm review with rating (1-5 stars)
- Submit product review with rating
- Add review text/comment
- Upload review photos (optional)
- Validate required fields (rating, comment min length)
- Preview review before submission
- Success confirmation after submission
- Error handling for submission failures
- Cancel review submission
- Character count for review text

#### C. Review Management (9 tests)

- View all submitted reviews
- Filter reviews by farm/product/date
- Sort reviews (newest, oldest, rating)
- Edit existing review
- Delete review with confirmation
- View review status (pending/approved/rejected)
- Display review metadata (date, order reference)
- View farm/product associated with review
- Empty state when no reviews

#### D. Review Display & Interaction (8 tests)

- Display rating stars correctly
- Show review photos in gallery
- Like/helpful button for reviews
- Report inappropriate review
- View farmer responses to reviews
- Review verification badge (verified purchase)
- Review statistics (total reviews, average rating)
- Responsive review cards

---

## 3️⃣ Customer Addresses (`addresses.spec.ts`)

### Test Coverage: 22+ tests

#### A. Address Management Navigation (3 tests)

```typescript
test.describe("Address Management", () => {
  test("should navigate to addresses from profile", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await page.click('a[href="/dashboard/addresses"]');
    await expect(page).toHaveURL("/dashboard/addresses");
  });

  test("should display saved addresses list", async ({ page }) => {
    await page.goto("/dashboard/addresses");
    await expect(page.locator('[data-testid="addresses-list"]')).toBeVisible();
  });

  test("should show add new address button", async ({ page }) => {
    await page.goto("/dashboard/addresses");
    await expect(
      page.locator('button:has-text("Add New Address")'),
    ).toBeVisible();
  });
});
```

#### B. Add New Address (7 tests)

- Open add address form/modal
- Fill address fields (street, city, state, zip, country)
- Validate required fields
- Validate address format (zip code, phone)
- Set address as default
- Add address label (Home, Work, Other)
- Success confirmation after adding

#### C. Edit Address (5 tests)

- Open edit address form
- Update address fields
- Validate changes
- Save updated address
- Cancel edit without saving

#### D. Delete Address (3 tests)

- Delete address with confirmation
- Prevent deletion of default address
- Empty state when no addresses

#### E. Address Features (4 tests)

- Set/change default address
- Use address during checkout
- Address autocomplete/suggestions
- Display multiple addresses in list

---

## 4️⃣ Customer Order Tracking (`order-tracking.spec.ts`)

### Test Coverage: 28+ tests

#### A. Orders Page Navigation (3 tests)

```typescript
test.describe("Order Tracking", () => {
  test("should navigate to orders from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('a[href="/dashboard/orders"]');
    await expect(page).toHaveURL("/dashboard/orders");
  });

  test("should display order tabs (Active, Completed, Cancelled)", async ({
    page,
  }) => {
    await page.goto("/dashboard/orders");
    await expect(page.locator('button:has-text("Active")')).toBeVisible();
    await expect(page.locator('button:has-text("Completed")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancelled")')).toBeVisible();
  });

  test("should show active orders count badge", async ({ page }) => {
    await page.goto("/dashboard");
    const badge = page.locator('[data-testid="active-orders-badge"]');
    await expect(badge).toBeVisible();
  });
});
```

#### B. Order List Display (7 tests)

- View all orders in list/grid
- Filter orders by status (active, completed, cancelled)
- Sort orders (date, total, status)
- Display order summary cards (items, total, status)
- Pagination for large order lists
- Search orders by order number
- Empty states for each tab

#### C. Order Details (9 tests)

- View detailed order information
- Display order items with images
- Show order timeline/status updates
- Display delivery address
- Show payment information
- Display farmer contact info
- View order total breakdown (subtotal, tax, delivery)
- Print order receipt
- Download order invoice

#### D. Order Actions (9 tests)

- Track order status in real-time
- Contact farmer about order
- Cancel order (if allowed)
- Request refund/return
- Re-order previous items
- Leave review after delivery
- Report order issue
- View estimated delivery time
- Receive order status notifications

---

## 5️⃣ Customer Profile Management (`profile-management.spec.ts`)

### Test Coverage: 24+ tests

#### A. Profile Navigation & Display (4 tests)

```typescript
test.describe("Profile Management", () => {
  test("should navigate to profile from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('a[href="/dashboard/profile"]');
    await expect(page).toHaveURL("/dashboard/profile");
  });

  test("should display current profile information", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await expect(page.locator('input[name="name"]')).toHaveValue(/.+/);
    await expect(page.locator('input[name="email"]')).toHaveValue(/.+/);
  });

  test("should show profile avatar/photo", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
  });

  test("should display profile stats (orders, favorites, reviews)", async ({
    page,
  }) => {
    await page.goto("/dashboard/profile");
    await expect(page.locator('[data-testid="profile-stats"]')).toBeVisible();
  });
});
```

#### B. Edit Profile Information (8 tests)

- Update name
- Update email (with verification)
- Update phone number
- Update bio/description
- Validate email format
- Validate phone format
- Save profile changes
- Cancel changes without saving

#### C. Avatar/Photo Management (4 tests)

- Upload new avatar
- Preview avatar before upload
- Crop/resize avatar
- Remove avatar

#### D. Password & Security (4 tests)

- Change password (current + new + confirm)
- Validate password strength
- Success confirmation after password change
- Enable two-factor authentication

#### E. Preferences & Settings (4 tests)

- Update notification preferences
- Set language/locale
- Set timezone
- Update communication preferences (email, SMS)

---

## 🎨 Divine Pattern Implementation

### Agricultural Consciousness

All tests will embody agricultural consciousness:

```typescript
/**
 * 🌾 CUSTOMER FAVORITES E2E TESTS
 * Divine Agricultural Commerce - Consumer Favorites Management
 *
 * Features tested:
 * - Farm favorites with seasonal awareness
 * - Product favorites with biodynamic consciousness
 * - Real-time synchronization across quantum states
 * - Agricultural UI patterns and interactions
 */

test.describe("🌾 Divine Favorites Manifestation", () => {
  test("manifests farm favorite with complete agricultural context", async ({
    page,
  }) => {
    // Agricultural consciousness implementation
  });
});
```

### Helper Functions Pattern

```typescript
// tests/e2e/helpers/customer-helpers.ts

export async function addFarmToFavorites(page: Page, farmName: string) {
  await page.goto("/farms");
  const farmCard = page.locator(`[data-testid="farm-card-${farmName}"]`);
  await farmCard.locator('button[aria-label="Add to favorites"]').click();
  await expect(farmCard.locator('[data-testid="favorite-icon"]')).toHaveClass(
    /active/,
  );
}

export async function submitProductReview(
  page: Page,
  productId: string,
  rating: number,
  comment: string,
) {
  await page.goto(`/dashboard/reviews`);
  await page.click('button:has-text("Write Review")');
  await page.selectOption('select[name="product"]', productId);
  await page.click(`[data-testid="star-rating-${rating}"]`);
  await page.fill('textarea[name="comment"]', comment);
  await page.click('button[type="submit"]:has-text("Submit Review")');
  await expect(page.locator(".success-message")).toBeVisible();
}

export async function addDeliveryAddress(
  page: Page,
  address: {
    label: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    isDefault?: boolean;
  },
) {
  await page.goto("/dashboard/addresses");
  await page.click('button:has-text("Add New Address")');
  await page.fill('input[name="label"]', address.label);
  await page.fill('input[name="street"]', address.street);
  await page.fill('input[name="city"]', address.city);
  await page.fill('input[name="state"]', address.state);
  await page.fill('input[name="zip"]', address.zip);

  if (address.isDefault) {
    await page.check('input[name="isDefault"]');
  }

  await page.click('button[type="submit"]:has-text("Save Address")');
  await expect(page.locator(".success-message")).toBeVisible();
}
```

### Robust Error Handling

```typescript
test("should handle network errors gracefully", async ({ page }) => {
  // Simulate network failure
  await page.route("**/api/favorites/**", (route) => route.abort());

  await page.goto("/dashboard/favorites");
  await page.click('[data-testid="toggle-favorite-farm-1"]');

  // Verify error message
  await expect(page.locator(".error-message")).toContainText(
    "Unable to update favorites. Please try again.",
  );

  // Verify retry mechanism
  await expect(page.locator('button:has-text("Retry")')).toBeVisible();
});
```

### Responsive Design Testing

```typescript
test.describe("Responsive Design", () => {
  test("should display favorites correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/dashboard/favorites");

    // Mobile-specific assertions
    await expect(page.locator(".mobile-tab-bar")).toBeVisible();
    await expect(page.locator(".favorites-grid")).toHaveCSS(
      "grid-template-columns",
      "1fr",
    );
  });

  test("should display favorites correctly on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto("/dashboard/favorites");

    // Tablet-specific assertions
    await expect(page.locator(".favorites-grid")).toHaveCSS(
      "grid-template-columns",
      "repeat(2, 1fr)",
    );
  });

  test("should display favorites correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/dashboard/favorites");

    // Desktop-specific assertions
    await expect(page.locator(".favorites-grid")).toHaveCSS(
      "grid-template-columns",
      "repeat(3, 1fr)",
    );
  });
});
```

---

## 📊 Implementation Timeline

### Week 1: Favorites & Reviews

**Days 1-2:** Customer Favorites

- Create `favorites.spec.ts`
- Implement 25+ tests
- Test on multiple viewports
- Document patterns

**Days 3-5:** Customer Reviews

- Create `reviews.spec.ts`
- Implement 30+ tests
- Test review submission flow
- Test review management

### Week 2: Addresses & Orders

**Days 1-2:** Address Management

- Create `addresses.spec.ts`
- Implement 22+ tests
- Test CRUD operations
- Test address validation

**Days 3-5:** Order Tracking

- Create `order-tracking.spec.ts`
- Implement 28+ tests
- Test order status updates
- Test order actions

### Week 3: Profile & Integration

**Days 1-2:** Profile Management

- Create `profile-management.spec.ts`
- Implement 24+ tests
- Test profile updates
- Test security features

**Days 3-5:** Integration & Polish

- Run full test suite
- Fix any issues
- Update documentation
- Generate coverage reports

---

## ✅ Success Criteria

### Test Quality Metrics

- [ ] All tests follow divine pattern conventions
- [ ] 100% TypeScript strict mode compliance
- [ ] Comprehensive error handling in all tests
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Agricultural consciousness in test naming
- [ ] Helper functions for common operations
- [ ] Proper wait strategies (no arbitrary timeouts)

### Coverage Metrics

- [ ] Customer Favorites: 100% coverage
- [ ] Customer Reviews: 100% coverage
- [ ] Customer Addresses: 100% coverage
- [ ] Customer Orders: 100% coverage
- [ ] Customer Profile: 100% coverage
- [ ] Overall E2E coverage: 80%+
- [ ] Customer flows: 90%+

### Performance Metrics

- [ ] All tests complete in < 30 seconds
- [ ] Parallel execution enabled
- [ ] No flaky tests (100% pass rate)
- [ ] CI/CD integration successful

### Documentation Metrics

- [ ] Implementation report generated
- [ ] Quick reference guide created
- [ ] Helper functions documented
- [ ] Troubleshooting guide updated

---

## 🚀 Getting Started

### 1. Review Phase 1 Patterns

```bash
# Study existing test patterns
cat tests/e2e/farmer/analytics.spec.ts
cat tests/e2e/admin/user-management.spec.ts
```

### 2. Setup Customer Auth

```bash
# Ensure customer auth state exists
npx playwright test tests/e2e/auth.setup.ts --project=setup-customer
```

### 3. Create First Test File

```bash
# Start with favorites
touch tests/e2e/customer/favorites.spec.ts
```

### 4. Run Tests Incrementally

```bash
# Test as you build
npx playwright test tests/e2e/customer/favorites.spec.ts --headed
```

### 5. Generate Reports

```bash
# View results
npx playwright show-report
```

---

## 📚 Resources

### Documentation References

- Phase 1 Implementation Reports
- E2E Testing Guide
- Divine Instruction Files (especially #10 - Agricultural Feature Patterns)
- Playwright Best Practices

### Code Examples

- `tests/e2e/farmer/analytics.spec.ts` - Complex dashboard testing
- `tests/e2e/admin/user-management.spec.ts` - CRUD operations
- `tests/e2e/monitoring-dashboard.spec.ts` - Real-time data testing

### Helper Locations

- `tests/e2e/helpers/` - Shared helper functions
- `tests/e2e/auth.setup.ts` - Authentication patterns

---

## 🎯 Next Steps After Phase 2

### Phase 3: Public Pages & Marketplace (Estimated: 2 weeks)

- Homepage E2E tests
- Farm profile pages
- Product detail pages
- Category browsing
- Search functionality
- SEO validation

### Phase 4: Integration & Performance (Estimated: 1 week)

- Email integration tests
- Upload functionality tests
- Webhook tests
- Performance benchmarks
- Load testing

---

## 📞 Support & Questions

### If You Encounter Issues:

1. Review Phase 1 test files for patterns
2. Check helper functions for reusable code
3. Consult divine instruction files
4. Run tests in headed mode for debugging
5. Check Playwright trace viewer

### Common Patterns Reference:

```typescript
// Wait for navigation
await page.waitForURL("/expected-url");

// Wait for element
await page.waitForSelector('[data-testid="element"]');

// Wait for API response
await page.waitForResponse(
  (response) =>
    response.url().includes("/api/favorites") && response.status() === 200,
);

// Handle dialogs
page.on("dialog", (dialog) => dialog.accept());

// Take screenshot for debugging
await page.screenshot({ path: "debug.png" });
```

---

**Status:** 📝 PLAN COMPLETE - READY TO IMPLEMENT  
**Next Action:** Create `tests/e2e/customer/favorites.spec.ts`

_"Test with agricultural consciousness, code with divine precision, deliver with quantum efficiency."_ 🌾⚡
