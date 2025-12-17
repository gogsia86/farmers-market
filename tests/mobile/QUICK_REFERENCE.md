# 🚀 Mobile Testing Quick Reference

**Quick copy-paste examples for common mobile testing scenarios**

---

## 📱 Basic Setup

```typescript
import { test, expect } from "@playwright/test";
import { createMobileHelper } from "./mobile-utils";

test("my mobile test", async ({ page, context }) => {
  const mobile = createMobileHelper(page, context);

  // Your test code here
});
```

---

## 🔧 Device Setup

### Set iPhone 12

```typescript
await mobile.viewport.setDevice("iPhone 12");
await page.goto("/");
```

### Set Android Phone

```typescript
await mobile.viewport.setDevice("Pixel 5");
await page.goto("/");
```

### Set Tablet

```typescript
await mobile.viewport.setDevice("iPad Mini");
await page.goto("/");
```

### Custom Viewport

```typescript
await mobile.viewport.setCustomViewport(375, 667);
await page.goto("/");
```

### Mobile Breakpoint

```typescript
await mobile.viewport.setBreakpoint("mobile");
await page.goto("/");
```

---

## 👆 Touch Interactions

### Basic Tap

```typescript
await mobile.touch.tap("button");
```

### Tap with Selector

```typescript
await mobile.touch.tap("[data-product-card]");
await mobile.touch.tap('button:has-text("Add to Cart")');
```

### Double Tap

```typescript
await mobile.touch.doubleTap(".product-image");
```

### Swipe Left

```typescript
await mobile.touch.swipe(".carousel", "left", 200);
```

### Swipe Right

```typescript
await mobile.touch.swipe(".carousel", "right", 200);
```

### Swipe Up (Scroll Down)

```typescript
await mobile.touch.swipe(".content", "up", 300);
```

### Swipe Down (Scroll Up)

```typescript
await mobile.touch.swipe(".content", "down", 300);
```

### Long Press

```typescript
await mobile.touch.longPress(".menu-item", 1000); // 1 second
```

### Pull to Refresh

```typescript
await mobile.touch.pullToRefresh();
```

### Pinch Zoom In

```typescript
await mobile.touch.pinchZoom(".image", 2); // 2x zoom
```

### Pinch Zoom Out

```typescript
await mobile.touch.pinchZoom(".image", 0.5); // 0.5x zoom
```

### Scroll to Element

```typescript
await mobile.touch.scrollToElement(".footer");
```

---

## 🔌 PWA Testing

### Check Service Worker

```typescript
const isRegistered = await mobile.pwa.isServiceWorkerRegistered();
expect(isRegistered).toBe(true);
```

### Wait for Service Worker Active

```typescript
const isActive = await mobile.pwa.waitForServiceWorkerActive(10000);
expect(isActive).toBe(true);
```

### Check Manifest

```typescript
const hasManifest = await mobile.pwa.hasManifest();
expect(hasManifest).toBe(true);
```

### Get Manifest Data

```typescript
const manifest = await mobile.pwa.getManifest();
expect(manifest.name).toBeTruthy();
expect(manifest.icons.length).toBeGreaterThan(0);
```

### Go Offline

```typescript
await mobile.pwa.goOffline();
// Test offline functionality
await mobile.pwa.goOnline();
```

### Test Offline Functionality

```typescript
const result = await mobile.pwa.testOfflineFunctionality("/products");
expect(result.canLoadOffline).toBe(true);
expect(result.hasCachedContent).toBe(true);
```

### Get Cached Resources

```typescript
const cachedUrls = await mobile.pwa.getCachedResources();
expect(cachedUrls.length).toBeGreaterThan(0);
```

---

## ⚡ Performance Testing

### Measure Page Load

```typescript
const perf = await mobile.performance.measurePageLoad("/");

expect(perf.totalTime).toBeLessThan(5000);
expect(perf.firstContentfulPaint).toBeLessThan(2500);
expect(perf.domContentLoaded).toBeLessThan(3000);

console.log("Performance:", {
  totalTime: `${perf.totalTime}ms`,
  fcp: `${perf.firstContentfulPaint}ms`,
  dcl: `${perf.domContentLoaded}ms`,
});
```

### Measure Time to Interactive

```typescript
const tti = await mobile.performance.measureTTI();
expect(tti).toBeLessThan(7000);
```

### Measure CLS (Cumulative Layout Shift)

```typescript
const cls = await mobile.performance.measureCLS();
expect(cls).toBeLessThan(0.1);
console.log("CLS:", cls.toFixed(3));
```

### Get Resource Timings

```typescript
const resources = await mobile.performance.getResourceTimings();

console.log("Resources:", {
  scripts: `${resources.scripts.toFixed(2)}ms`,
  stylesheets: `${resources.stylesheets.toFixed(2)}ms`,
  images: `${resources.images.toFixed(2)}ms`,
  total: `${resources.total.toFixed(2)}ms`,
});
```

### Measure JS Execution Time

```typescript
const jsTime = await mobile.performance.measureJSExecutionTime();
expect(jsTime).toBeLessThan(3000);
```

---

## ✅ Mobile Assertions

### Assert Visible in Viewport

```typescript
await mobile.assert.assertVisibleInViewport(".hero-section");
```

### Assert Touch Target Size

```typescript
await mobile.assert.assertTouchTargetSize("button", 44); // 44x44px minimum
```

### Assert Readable Text

```typescript
await mobile.assert.assertReadableText("p", 16); // 16px minimum
```

### Assert No Horizontal Scroll

```typescript
await mobile.assert.assertNoHorizontalScroll();
```

### Assert Responsive Images

```typescript
await mobile.assert.assertResponsiveImages("img");
```

### Assert Mobile Navigation

```typescript
await mobile.assert.assertMobileNavigation();
```

---

## 🌾 Agricultural Mobile Patterns

### Test Farm Geolocation

```typescript
import { AgriculturalMobileHelper } from "./mobile-utils";

const agMobile = new AgriculturalMobileHelper(page);
const result = await agMobile.testFarmGeolocation("farm-123");

expect(result.hasLocation).toBe(true);
expect(result.canNavigate).toBe(true);
```

### Test Mobile Product Catalog

```typescript
const catalog = await agMobile.testMobileProductCatalog();

expect(catalog.hasSearch).toBe(true);
expect(catalog.hasFilters).toBe(true);
expect(catalog.hasInfiniteScroll).toBe(true);
```

### Test Mobile Checkout

```typescript
const checkout = await agMobile.testMobileCheckout();

expect(checkout.isMobileFriendly).toBe(true);
expect(checkout.hasAutocomplete).toBe(true);
expect(checkout.hasPaymentMethods).toBe(true);
```

---

## 📊 Capture Metrics

### Capture Mobile Metrics

```typescript
import { captureMobileMetrics } from "./mobile-utils";

const metrics = await captureMobileMetrics(page);

console.log("Mobile Metrics:", {
  viewport: metrics.viewport,
  devicePixelRatio: metrics.devicePixelRatio,
  touchSupport: metrics.touchSupport,
  orientation: metrics.orientation,
  connection: metrics.connection,
});
```

---

## 🔄 Complete Test Examples

### Example 1: Mobile Navigation Test

```typescript
test("mobile navigation flow", async ({ page, context }) => {
  const mobile = createMobileHelper(page, context);

  // Set device
  await mobile.viewport.setDevice("iPhone 12");
  await page.goto("/");

  // Open mobile menu
  await mobile.touch.tap("[data-mobile-menu]");
  await page.waitForTimeout(300);

  // Navigate to products
  await mobile.touch.tap('a:has-text("Products")');
  await page.waitForLoadState("domcontentloaded");

  // Verify no horizontal scroll
  await mobile.assert.assertNoHorizontalScroll();

  // Check performance
  const perf = await mobile.performance.measurePageLoad(page.url());
  expect(perf.totalTime).toBeLessThan(5000);
});
```

### Example 2: PWA Offline Test

```typescript
test("PWA offline functionality", async ({ page, context }) => {
  const mobile = createMobileHelper(page, context);

  // Load page online
  await page.goto("/products");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Go offline
  await mobile.pwa.goOffline();

  // Navigate offline
  await page.goto("/products");

  // Verify cached content
  const hasContent = await page.evaluate(() => {
    return document.body.textContent.length > 100;
  });
  expect(hasContent).toBe(true);

  // Go back online
  await mobile.pwa.goOnline();
});
```

### Example 3: Touch Interaction Test

```typescript
test("product carousel swipe", async ({ page, context }) => {
  const mobile = createMobileHelper(page, context);

  await mobile.viewport.setBreakpoint("mobile");
  await page.goto("/");

  // Swipe carousel
  await mobile.touch.swipe(".carousel", "left", 200);
  await page.waitForTimeout(500);

  // Verify carousel moved
  const position = await page.evaluate(() => {
    const carousel = document.querySelector(".carousel");
    return carousel?.scrollLeft || 0;
  });

  expect(position).toBeGreaterThan(0);
});
```

### Example 4: Multi-Device Test

```typescript
const devices = ["iPhone 12", "Pixel 5", "iPad Mini"] as const;

for (const deviceName of devices) {
  test(`works on ${deviceName}`, async ({ page, context }) => {
    const mobile = createMobileHelper(page, context);

    await mobile.viewport.setDevice(deviceName);
    await page.goto("/");

    // Verify touch targets
    await mobile.assert.assertTouchTargetSize("button", 44);

    // Verify text readability
    await mobile.assert.assertReadableText("p", 16);

    // Check performance
    const perf = await mobile.performance.measurePageLoad("/");
    expect(perf.totalTime).toBeLessThan(6000);
  });
}
```

### Example 5: Complete Mobile Flow

```typescript
test("complete mobile shopping flow", async ({ page, context }) => {
  const mobile = createMobileHelper(page, context);
  const agMobile = new AgriculturalMobileHelper(page);

  // Setup
  await mobile.viewport.setDevice("iPhone 12");
  await page.goto("/");

  // Browse products
  await mobile.touch.tap('a:has-text("Products")');
  await page.waitForLoadState("domcontentloaded");

  // Add to cart
  await mobile.touch.tap('button:has-text("Add to Cart")');
  await page.waitForTimeout(500);

  // Go to cart
  await mobile.touch.tap("[data-cart-icon]");
  await page.waitForTimeout(500);

  // Verify cart
  const cartItems = await page.locator("[data-cart-item]").count();
  expect(cartItems).toBeGreaterThan(0);

  // Test offline cart persistence
  await mobile.pwa.goOffline();
  await page.reload();

  const offlineCartItems = await page.locator("[data-cart-item]").count();
  expect(offlineCartItems).toBe(cartItems);

  await mobile.pwa.goOnline();

  // Check performance
  const perf = await mobile.performance.measurePageLoad(page.url());
  expect(perf.totalTime).toBeLessThan(5000);
});
```

---

## 📱 Device Profiles Available

```typescript
// iOS
"iPhone SE";
"iPhone 12";
"iPhone 12 Pro";
"iPhone 13";
"iPhone 14";
"iPhone 14 Pro Max";
"iPad Mini";
"iPad Pro";

// Android
"Pixel 5";
"Pixel 7";
"Galaxy S9+";
"Galaxy S21";
"Galaxy Tab S7";
```

---

## 🎯 Viewport Breakpoints

```typescript
"mobile"; // 375 x 667
"mobileLarge"; // 428 x 926
"tablet"; // 768 x 1024
"tabletLandscape"; // 1024 x 768
"desktop"; // 1280 x 720
"desktopLarge"; // 1920 x 1080
```

---

## 🚀 NPM Scripts

```bash
# Run all mobile tests
npm run test:mobile

# Run specific suites
npm run test:mobile:navigation
npm run test:mobile:performance
npm run test:mobile:pwa

# Device-specific
npm run test:mobile:ios
npm run test:mobile:android
npm run test:mobile:devices

# PWA tests
npm run test:pwa
npm run test:pwa:offline
npm run test:pwa:sw
npm run test:pwa:manifest

# Development
npm run test:mobile:ui
npm run test:mobile:headed
npm run test:mobile:debug

# Reports
npm run mobile:report
npm run mobile:audit
npm run pwa:audit
```

---

## 💡 Pro Tips

### 1. Wait for Mobile Ready

```typescript
import { waitForMobileReady } from "./mobile-utils";

test.beforeEach(async ({ page }) => {
  await waitForMobileReady(page);
});
```

### 2. Check Viewport Type

```typescript
if (mobile.viewport.isMobile()) {
  // Mobile-specific test
}

if (mobile.viewport.isTablet()) {
  // Tablet-specific test
}
```

### 3. Rotate Device

```typescript
// Test portrait
await mobile.viewport.setBreakpoint("mobile");
await page.goto("/");

// Test landscape
await mobile.viewport.rotate();
await page.waitForTimeout(500);
```

### 4. Test Orientation Changes

```typescript
const metrics = await captureMobileMetrics(page);
expect(metrics.orientation).toBe("portrait");

await mobile.viewport.rotate();

const landscapeMetrics = await captureMobileMetrics(page);
expect(landscapeMetrics.orientation).toBe("landscape");
```

### 5. Verify Service Worker Active

```typescript
const swActive = await mobile.pwa.waitForServiceWorkerActive(10000);
if (!swActive) {
  console.warn("Service worker not active - offline tests may fail");
}
```

---

## 🎨 Common Patterns

### Mobile Menu Test

```typescript
await mobile.viewport.setBreakpoint("mobile");
await page.goto("/");

const menuButton = page.locator("[data-mobile-menu]");
await expect(menuButton).toBeVisible();

await mobile.touch.tap("[data-mobile-menu]");
await page.waitForTimeout(300);

const menu = page.locator("[data-mobile-menu-content]");
await expect(menu).toBeVisible();
```

### Offline Cart Test

```typescript
await page.goto("/cart");
const onlineItems = await page.locator("[data-cart-item]").count();

await mobile.pwa.goOffline();
await page.reload();

const offlineItems = await page.locator("[data-cart-item]").count();
expect(offlineItems).toBe(onlineItems);

await mobile.pwa.goOnline();
```

### Performance Budget Test

```typescript
const BUDGET = {
  totalTime: 5000,
  fcp: 2500,
  cls: 0.1,
};

const perf = await mobile.performance.measurePageLoad("/");
expect(perf.totalTime).toBeLessThan(BUDGET.totalTime);
expect(perf.firstContentfulPaint).toBeLessThan(BUDGET.fcp);

const cls = await mobile.performance.measureCLS();
expect(cls).toBeLessThan(BUDGET.cls);
```

---

## 📚 Related Documentation

- [Full README](./README.md)
- [Mobile Utilities](./mobile-utils.ts)
- [Day 17 Completion](../../DAY_17_MOBILE_PWA_COMPLETION.md)

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: Day 17 Implementation  
_Mobile testing made simple. Copy, paste, test._ 🚀📱
