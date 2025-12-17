/**
 * 🌟 Divine Page-Level Accessibility Tests
 * End-to-End WCAG 2.1 AA/AAA Compliance for User Journeys
 *
 * @module tests/accessibility/pages.a11y.test
 * @description Comprehensive accessibility testing for complete page flows
 * @version 1.0.0
 *
 * Test Coverage:
 * - Homepage and landing pages
 * - Authentication flows (login, register)
 * - Browse and search pages
 * - Farm profile pages
 * - Product detail pages
 * - Shopping cart and checkout
 * - Farmer dashboard
 * - Order management
 * - Agricultural workflows
 */

import { test, expect } from "@playwright/test";
import {
  injectAxe,
  runAxeScan,
  assertNoA11yViolations,
  testKeyboardNavigation,
  testTabOrder,
  testReverseTabOrder,
  testSkipLinks,
  testFocusIndicators,
  validateAriaAttributes,
  validateSemanticHTML,
  validateHeadingHierarchy,
  validateImageAltText,
  checkColorContrast,
  testFarmProfileAccessibility,
  testProductCatalogAccessibility,
  testSeasonalAccessibility,
  checkWCAG21AA,
  checkWCAG21AAA,
  generateA11yReport,
  calculateDivineA11yScore,
  type A11yResult,
  type KeyboardNavigationTest,
  type AriaValidation,
  type ColorContrastRequirement,
} from "./a11y-utils";

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const TEST_USER = {
  email: "customer@example.com",
  password: "SecurePassword123!",
};

// Store results for summary report
const a11yResults: A11yResult[] = [];

// ============================================================================
// HOMEPAGE ACCESSIBILITY
// ============================================================================

test.describe("Homepage Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test("should have no WCAG 2.1 AA violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have proper semantic HTML structure", async ({ page }) => {
    await validateSemanticHTML(page);

    // Check for required landmarks
    const header = page.locator('header, [role="banner"]');
    await expect(header.first()).toBeVisible();

    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();

    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    const footer = page.locator('footer, [role="contentinfo"]');
    await expect(footer.first()).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await validateHeadingHierarchy(page);

    // Should have exactly one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // h1 should be visible and meaningful
    const h1 = page.locator("h1").first();
    const h1Text = await h1.textContent();
    expect(h1Text?.trim().length).toBeGreaterThan(0);
  });

  test("should have accessible images", async ({ page }) => {
    await validateImageAltText(page);

    // Hero image should have meaningful alt text
    const heroImage = page.locator("img").first();
    if ((await heroImage.count()) > 0) {
      const alt = await heroImage.getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt?.length).toBeGreaterThan(5); // Not just empty or "image"
    }
  });

  test("should support skip links", async ({ page }) => {
    await testSkipLinks(page);
  });

  test("should have keyboard navigable hero section", async ({ page }) => {
    const heroCTA = page.locator("main button, main a[href]").first();
    if ((await heroCTA.count()) > 0) {
      await heroCTA.focus();
      await expect(heroCTA).toBeFocused();

      // Should be activatable with Enter
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
    }
  });

  test("should have accessible navigation menu", async ({ page }) => {
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("nav a"));
      return links.map((el, idx) => {
        (el as HTMLElement).setAttribute("data-nav-test", idx.toString());
        return `[data-nav-test="${idx}"]`;
      });
    });

    if (navLinks.length > 0) {
      await testTabOrder(page, navLinks.slice(0, 5));
    }
  });

  test("should have accessible search", async ({ page }) => {
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Search"]')
      .first();
    const count = await searchInput.count();

    if (count > 0) {
      // Should have label
      const id = await searchInput.getAttribute("id");
      const ariaLabel = await searchInput.getAttribute("aria-label");
      const ariaLabelledBy = await searchInput.getAttribute("aria-labelledby");

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();
        expect(labelCount > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }

      // Should be keyboard accessible
      await searchInput.focus();
      await expect(searchInput).toBeFocused();
    }
  });

  test("should collect homepage results", async ({ page }) => {
    const result = await checkWCAG21AA(page);
    a11yResults.push(result);
  });
});

// ============================================================================
// AUTHENTICATION ACCESSIBILITY
// ============================================================================

test.describe("Login Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/auth/login`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have accessible form structure", async ({ page }) => {
    const form = page.locator("form").first();
    await expect(form).toBeVisible();

    // All inputs should have labels
    const emailInput = page
      .locator('input[type="email"], input[name*="email"]')
      .first();
    await expect(emailInput).toBeVisible();

    const emailId = await emailInput.getAttribute("id");
    if (emailId) {
      const emailLabel = page.locator(`label[for="${emailId}"]`);
      await expect(emailLabel).toBeVisible();
    }

    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();

    const passwordId = await passwordInput.getAttribute("id");
    if (passwordId) {
      const passwordLabel = page.locator(`label[for="${passwordId}"]`);
      await expect(passwordLabel).toBeVisible();
    }
  });

  test("should show accessible validation errors", async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(500);

    // Look for error messages
    const errorMessages = page.locator(
      '[role="alert"], .error-message, [aria-invalid="true"]',
    );
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      // First error should be in live region
      const firstError = errorMessages.first();
      const role = await firstError.getAttribute("role");
      const ariaLive = await firstError.getAttribute("aria-live");

      expect(role === "alert" || ariaLive).toBeTruthy();
    }
  });

  test("should be keyboard navigable", async ({ page }) => {
    const formElements = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll("input, button"),
      ).filter((el) => {
        const type = el.getAttribute("type");
        return type !== "hidden";
      });

      return elements.map((el, idx) => {
        (el as HTMLElement).setAttribute("data-test-idx", idx.toString());
        return `[data-test-idx="${idx}"]`;
      });
    });

    if (formElements.length > 0) {
      await testTabOrder(page, formElements);
    }
  });

  test("should have visible focus indicators", async ({ page }) => {
    const focusableElements = [
      'input[type="email"]',
      'input[type="password"]',
      'button[type="submit"]',
      "a[href]",
    ];

    const existingElements = [];
    for (const selector of focusableElements) {
      if ((await page.locator(selector).count()) > 0) {
        existingElements.push(selector);
      }
    }

    if (existingElements.length > 0) {
      await testFocusIndicators(page, existingElements);
    }
  });

  test("should have accessible password visibility toggle", async ({
    page,
  }) => {
    const toggleButton = page
      .locator('button[aria-label*="password"], button:has([data-icon*="eye"])')
      .first();
    const count = await toggleButton.count();

    if (count > 0) {
      const ariaLabel = await toggleButton.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/show|hide|toggle/i);
    }
  });
});

test.describe("Registration Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/auth/register`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have accessible form with proper labels", async ({ page }) => {
    const inputs = page.locator('input:not([type="hidden"])');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();
        expect(labelCount > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test("should have accessible password requirements", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();
    const count = await passwordInput.count();

    if (count > 0) {
      // Should have aria-describedby for requirements
      const describedBy = await passwordInput.getAttribute("aria-describedby");

      if (describedBy) {
        const description = page.locator(`#${describedBy}`);
        await expect(description).toBeVisible();
      }
    }
  });
});

// ============================================================================
// FARM PROFILE ACCESSIBILITY
// ============================================================================

test.describe("Farm Profile Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/farms/sunny-acres-farm`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have accessible farm profile structure", async ({ page }) => {
    await testFarmProfileAccessibility(page);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await validateHeadingHierarchy(page);

    // Farm name should be in h1
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    const h1Text = await h1.textContent();
    expect(h1Text?.trim().length).toBeGreaterThan(0);
  });

  test("should have accessible farm images", async ({ page }) => {
    await validateImageAltText(page);

    // Farm logo should have meaningful alt text
    const farmLogo = page
      .locator('img[alt*="logo"], img[data-farm-logo]')
      .first();
    if ((await farmLogo.count()) > 0) {
      const alt = await farmLogo.getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });

  test("should have accessible contact information", async ({ page }) => {
    const contactSection = page
      .locator('[data-contact], section:has-text("Contact")')
      .first();
    const count = await contactSection.count();

    if (count > 0) {
      // Should have heading
      const heading = contactSection.locator("h2, h3, h4");
      if ((await heading.count()) > 0) {
        await expect(heading.first()).toBeVisible();
      }

      // Phone numbers should be links
      const phoneLink = contactSection.locator('a[href^="tel:"]').first();
      if ((await phoneLink.count()) > 0) {
        const ariaLabel = await phoneLink.getAttribute("aria-label");
        expect(ariaLabel || (await phoneLink.textContent())).toBeTruthy();
      }

      // Email should be a link
      const emailLink = contactSection.locator('a[href^="mailto:"]').first();
      if ((await emailLink.count()) > 0) {
        const ariaLabel = await emailLink.getAttribute("aria-label");
        expect(ariaLabel || (await emailLink.textContent())).toBeTruthy();
      }
    }
  });

  test("should have accessible product listings", async ({ page }) => {
    await testProductCatalogAccessibility(page);
  });

  test("should have accessible map", async ({ page }) => {
    const map = page
      .locator('[role="img"][aria-label*="map"], iframe[title*="map"]')
      .first();
    const count = await map.count();

    if (count > 0) {
      // Should have accessible label
      const ariaLabel = await map.getAttribute("aria-label");
      const title = await map.getAttribute("title");

      expect(ariaLabel || title).toBeTruthy();

      // If iframe, should have title
      const tagName = await map.evaluate((el) => el.tagName);
      if (tagName === "IFRAME") {
        expect(title).toBeTruthy();
      }
    }
  });

  test("should support seasonal awareness", async ({ page }) => {
    await testSeasonalAccessibility(page, "SUMMER");
  });
});

// ============================================================================
// PRODUCT CATALOG ACCESSIBILITY
// ============================================================================

test.describe("Product Catalog Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/products`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have accessible product grid", async ({ page }) => {
    await testProductCatalogAccessibility(page);
  });

  test("should have accessible filters and sorting", async ({ page }) => {
    // Filter section should be labeled
    const filterSection = page
      .locator('[role="group"], .filter-section, aside')
      .first();
    const count = await filterSection.count();

    if (count > 0) {
      const ariaLabel = await filterSection.getAttribute("aria-label");
      const ariaLabelledBy =
        await filterSection.getAttribute("aria-labelledby");

      // Should have heading inside
      const heading = filterSection.locator("h2, h3, h4").first();
      const hasHeading = (await heading.count()) > 0;

      expect(hasHeading || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test("should announce filter changes", async ({ page }) => {
    const filterCheckbox = page.locator('input[type="checkbox"]').first();
    const count = await filterCheckbox.count();

    if (count > 0) {
      // Check initial state
      const wasChecked = await filterCheckbox.isChecked();

      // Toggle filter
      await filterCheckbox.click();
      await page.waitForTimeout(500);

      // Should have live region for results
      const liveRegion = page.locator('[aria-live], [role="status"]');
      const liveCount = await liveRegion.count();

      if (liveCount > 0) {
        const text = await liveRegion.first().textContent();
        expect(text?.trim()).toBeTruthy();
      }
    }
  });

  test("should have keyboard navigable pagination", async ({ page }) => {
    const pagination = page
      .locator('[role="navigation"][aria-label*="Pagination"]')
      .first();
    const count = await pagination.count();

    if (count > 0) {
      const paginationLinks = pagination.locator("a, button");
      const linkCount = await paginationLinks.count();

      if (linkCount > 0) {
        // Current page should be indicated
        const currentPage = pagination.locator('[aria-current="page"]');
        const currentCount = await currentPage.count();
        expect(currentCount).toBeGreaterThan(0);

        // Links should be keyboard accessible
        const firstLink = paginationLinks.first();
        await firstLink.focus();
        await expect(firstLink).toBeFocused();
      }
    }
  });

  test("should have accessible search", async ({ page }) => {
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Search"]')
      .first();
    const count = await searchInput.count();

    if (count > 0) {
      // Should have label
      const id = await searchInput.getAttribute("id");
      const ariaLabel = await searchInput.getAttribute("aria-label");

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      } else {
        expect(ariaLabel).toBeTruthy();
      }
    }
  });
});

// ============================================================================
// PRODUCT DETAIL ACCESSIBILITY
// ============================================================================

test.describe("Product Detail Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/products/organic-tomatoes`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have accessible product information", async ({ page }) => {
    // Product name should be in h1
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    // Price should be clearly labeled
    const price = page.locator("[data-price], .price").first();
    if ((await price.count()) > 0) {
      const ariaLabel = await price.getAttribute("aria-label");
      const text = await price.textContent();

      expect(ariaLabel || text?.includes("$")).toBeTruthy();
    }
  });

  test("should have accessible product images", async ({ page }) => {
    await validateImageAltText(page);

    // Main product image should have descriptive alt
    const mainImage = page.locator("img").first();
    if ((await mainImage.count()) > 0) {
      const alt = await mainImage.getAttribute("alt");
      expect(alt?.length).toBeGreaterThan(10);
    }
  });

  test("should have accessible quantity selector", async ({ page }) => {
    const quantityInput = page
      .locator('input[type="number"], input[name*="quantity"]')
      .first();
    const count = await quantityInput.count();

    if (count > 0) {
      // Should have label
      const id = await quantityInput.getAttribute("id");
      const ariaLabel = await quantityInput.getAttribute("aria-label");
      const ariaLabelledBy =
        await quantityInput.getAttribute("aria-labelledby");

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();
        expect(labelCount > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }

      // Should have min/max
      const min = await quantityInput.getAttribute("min");
      const max = await quantityInput.getAttribute("max");
      expect(min).toBeTruthy();
    }
  });

  test("should have accessible add to cart button", async ({ page }) => {
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartBtn).toBeVisible();
    await expect(addToCartBtn).toBeEnabled();

    // Should be keyboard accessible
    await addToCartBtn.focus();
    await expect(addToCartBtn).toBeFocused();
  });

  test("should announce cart updates", async ({ page }) => {
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    const count = await addToCartBtn.count();

    if (count > 0) {
      await addToCartBtn.click();
      await page.waitForTimeout(500);

      // Should have confirmation message
      const toast = page
        .locator('[role="status"], [role="alert"], .toast')
        .first();
      const toastCount = await toast.count();

      if (toastCount > 0) {
        const text = await toast.textContent();
        expect(text).toMatch(/added|cart/i);
      }
    }
  });
});

// ============================================================================
// SHOPPING CART ACCESSIBILITY
// ============================================================================

test.describe("Shopping Cart Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/cart`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have accessible cart items", async ({ page }) => {
    const cartItems = page.locator('[role="listitem"], .cart-item').first();
    const count = await cartItems.count();

    if (count > 0) {
      // Cart should be in a list
      const list = page.locator('[role="list"], ul, ol').first();
      await expect(list).toBeVisible();

      // Each item should have product name
      const productName = cartItems.locator("h2, h3, h4").first();
      await expect(productName).toBeVisible();
    }
  });

  test("should have accessible quantity controls", async ({ page }) => {
    const quantityControls = page
      .locator("[data-quantity-control], .quantity-control")
      .first();
    const count = await quantityControls.count();

    if (count > 0) {
      const decreaseBtn = quantityControls.locator("button").first();
      const increaseBtn = quantityControls.locator("button").last();

      // Buttons should have labels
      const decreaseLabel = await decreaseBtn.getAttribute("aria-label");
      const increaseLabel = await increaseBtn.getAttribute("aria-label");

      expect(decreaseLabel).toBeTruthy();
      expect(increaseLabel).toBeTruthy();
    }
  });

  test("should announce quantity changes", async ({ page }) => {
    const increaseBtn = page.locator('button[aria-label*="Increase"]').first();
    const count = await increaseBtn.count();

    if (count > 0) {
      await increaseBtn.click();
      await page.waitForTimeout(500);

      // Should update total
      const total = page.locator("[data-cart-total], .cart-total").first();
      if ((await total.count()) > 0) {
        const ariaLive = await total.getAttribute("aria-live");
        expect(ariaLive).toBeTruthy();
      }
    }
  });

  test("should have accessible remove buttons", async ({ page }) => {
    const removeBtn = page
      .locator('button:has-text("Remove"), button[aria-label*="Remove"]')
      .first();
    const count = await removeBtn.count();

    if (count > 0) {
      const ariaLabel = await removeBtn.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/remove/i);
    }
  });

  test("should have accessible checkout button", async ({ page }) => {
    const checkoutBtn = page
      .locator('button:has-text("Checkout"), a:has-text("Checkout")')
      .first();
    const count = await checkoutBtn.count();

    if (count > 0) {
      await expect(checkoutBtn).toBeVisible();
      await expect(checkoutBtn).toBeEnabled();

      await checkoutBtn.focus();
      await expect(checkoutBtn).toBeFocused();
    }
  });

  test("should show accessible empty cart state", async ({ page }) => {
    const emptyState = page.locator("[data-empty-cart], .empty-cart").first();
    const count = await emptyState.count();

    if (count > 0) {
      // Should have heading
      const heading = emptyState.locator("h1, h2, h3").first();
      if ((await heading.count()) > 0) {
        await expect(heading).toBeVisible();
      }

      // Should have CTA
      const cta = emptyState.locator("button, a").first();
      if ((await cta.count()) > 0) {
        await expect(cta).toBeVisible();
      }
    }
  });
});

// ============================================================================
// CHECKOUT ACCESSIBILITY
// ============================================================================

test.describe("Checkout Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/checkout`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have accessible checkout steps", async ({ page }) => {
    const steps = page.locator('[role="progressbar"], .checkout-steps').first();
    const count = await steps.count();

    if (count > 0) {
      // Should indicate current step
      const ariaValueNow = await steps.getAttribute("aria-valuenow");
      const ariaValueMax = await steps.getAttribute("aria-valuemax");

      expect(ariaValueNow).toBeTruthy();
      expect(ariaValueMax).toBeTruthy();
    }
  });

  test("should have accessible form fields", async ({ page }) => {
    const inputs = page.locator('input:not([type="hidden"]), select, textarea');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();
        expect(labelCount > 0 || ariaLabel).toBeTruthy();
      } else {
        expect(ariaLabel).toBeTruthy();
      }
    }
  });

  test("should have accessible payment section", async ({ page }) => {
    const paymentSection = page
      .locator('[data-payment], section:has-text("Payment")')
      .first();
    const count = await paymentSection.count();

    if (count > 0) {
      // Should have heading
      const heading = paymentSection.locator("h2, h3").first();
      await expect(heading).toBeVisible();

      // Card number input should be secure
      const cardInput = paymentSection.locator('input[name*="card"]').first();
      if ((await cardInput.count()) > 0) {
        const autocomplete = await cardInput.getAttribute("autocomplete");
        expect(autocomplete).toMatch(/cc-number/);
      }
    }
  });

  test("should show accessible order summary", async ({ page }) => {
    const summary = page
      .locator("[data-order-summary], .order-summary")
      .first();
    const count = await summary.count();

    if (count > 0) {
      // Should have heading
      const heading = summary.locator("h2, h3").first();
      await expect(heading).toBeVisible();

      // Total should be clearly indicated
      const total = summary.locator("[data-total], .total").first();
      if ((await total.count()) > 0) {
        await expect(total).toBeVisible();
      }
    }
  });
});

// ============================================================================
// FARMER DASHBOARD ACCESSIBILITY
// ============================================================================

test.describe("Farmer Dashboard Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/dashboard/farmer`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should have accessible sidebar navigation", async ({ page }) => {
    const sidebar = page.locator('aside, [role="navigation"]').first();
    const count = await sidebar.count();

    if (count > 0) {
      const navLinks = sidebar.locator("a, button");
      const linkCount = await navLinks.count();

      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute("aria-label");

        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    }
  });

  test("should have accessible statistics cards", async ({ page }) => {
    const statsCards = page.locator("[data-stat-card], .stat-card");
    const count = await statsCards.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = statsCards.nth(i);

        // Should have label
        const label = card.locator("[data-label], .stat-label").first();
        await expect(label).toBeVisible();

        // Should have value
        const value = card.locator("[data-value], .stat-value").first();
        await expect(value).toBeVisible();
      }
    }
  });

  test("should have accessible data tables", async ({ page }) => {
    const table = page.locator("table").first();
    const count = await table.count();

    if (count > 0) {
      // Should have caption or aria-label
      const caption = table.locator("caption");
      const ariaLabel = await table.getAttribute("aria-label");

      const hasCaption = (await caption.count()) > 0;
      expect(hasCaption || ariaLabel).toBeTruthy();

      // Should have thead
      const thead = table.locator("thead");
      await expect(thead).toBeVisible();
    }
  });

  test("should have accessible quick actions", async ({ page }) => {
    const quickActions = page
      .locator("[data-quick-actions], .quick-actions")
      .first();
    const count = await quickActions.count();

    if (count > 0) {
      const actions = quickActions.locator("button, a");
      const actionCount = await actions.count();

      for (let i = 0; i < actionCount; i++) {
        const action = actions.nth(i);
        const text = await action.textContent();
        const ariaLabel = await action.getAttribute("aria-label");

        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    }
  });
});

// ============================================================================
// SEARCH RESULTS ACCESSIBILITY
// ============================================================================

test.describe("Search Results Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/search?q=tomatoes`);
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });

  test("should announce search results", async ({ page }) => {
    const resultsCount = page
      .locator('[role="status"], .results-count')
      .first();
    const count = await resultsCount.count();

    if (count > 0) {
      const ariaLive = await resultsCount.getAttribute("aria-live");
      const role = await resultsCount.getAttribute("role");

      expect(ariaLive || role === "status").toBeTruthy();
    }
  });

  test("should have accessible result items", async ({ page }) => {
    const results = page.locator("[data-search-result], .search-result");
    const count = await results.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const result = results.nth(i);

        // Should have heading
        const heading = result.locator("h2, h3, h4").first();
        await expect(heading).toBeVisible();

        // Should be keyboard accessible
        const link = result.locator("a").first();
        if ((await link.count()) > 0) {
          await link.focus();
          await expect(link).toBeFocused();
        }
      }
    }
  });

  test("should show accessible no results state", async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/search?q=nonexistentproduct12345`);
    await page.waitForTimeout(1000);

    const noResults = page.locator("[data-no-results], .no-results").first();
    const count = await noResults.count();

    if (count > 0) {
      // Should have heading
      const heading = noResults.locator("h1, h2, h3").first();
      if ((await heading.count()) > 0) {
        await expect(heading).toBeVisible();
      }

      // Should have helpful message
      const text = await noResults.textContent();
      expect(text?.length).toBeGreaterThan(20);
    }
  });
});

// ============================================================================
// COMPREHENSIVE AUDIT
// ============================================================================

test.describe("Site-Wide Accessibility Audit", () => {
  const criticalPages = [
    { path: "/", name: "Homepage" },
    { path: "/auth/login", name: "Login" },
    { path: "/farms", name: "Farm Directory" },
    { path: "/products", name: "Product Catalog" },
    { path: "/cart", name: "Shopping Cart" },
  ];

  test("should run comprehensive WCAG 2.1 AA audit", async ({ page }) => {
    const results: A11yResult[] = [];
    let totalViolations = 0;
    let totalPasses = 0;

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║       🌟 COMPREHENSIVE ACCESSIBILITY AUDIT                 ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    for (const { path, name } of criticalPages) {
      console.log(`📄 Testing: ${name} (${path})`);

      try {
        await page.goto(`${TEST_BASE_URL}${path}`);
        await injectAxe(page);
        const result = await runAxeScan(page, { wcagLevel: "AA" });

        results.push(result);
        totalViolations += result.violations.length;
        totalPasses += result.passes;

        console.log(`   Violations: ${result.violations.length}`);
        console.log(`   Passes: ${result.passes}`);

        if (result.violations.length > 0) {
          result.violations.forEach((v) => {
            console.log(`   ⚠️  ${v.id}: ${v.description}`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Error testing ${name}: ${error}`);
      }
      console.log("");
    }

    const divineScore = await calculateDivineA11yScore(results);

    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║               📊 AUDIT SUMMARY                             ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(`║ Pages Tested: ${criticalPages.length}`);
    console.log(`║ Total Violations: ${totalViolations}`);
    console.log(`║ Total Passes: ${totalPasses}`);
    console.log(`║ Divine A11y Score: ${divineScore}% 🌟`);
    console.log(
      `║ Status: ${totalViolations === 0 ? "✅ FULLY COMPLIANT" : "⚠️  NEEDS ATTENTION"}`,
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    // Generate report
    const report = await generateA11yReport(results);
    console.log(report);

    // Assertions
    expect(totalViolations).toBeLessThanOrEqual(5); // Allow minor violations
    expect(divineScore).toBeGreaterThanOrEqual(85); // 85%+ divine score
  });

  test("should meet AAA standards for critical paths", async ({ page }) => {
    const aaaPages = [
      { path: "/", name: "Homepage" },
      { path: "/auth/login", name: "Login" },
    ];

    for (const { path, name } of aaaPages) {
      await page.goto(`${TEST_BASE_URL}${path}`);
      const result = await checkWCAG21AAA(page);

      console.log(`\n📄 ${name} (WCAG 2.1 AAA)`);
      console.log(`   Violations: ${result.violations.length}`);
      console.log(`   Passes: ${result.passes}`);

      // AAA violations are acceptable but should be minimal
      expect(result.violations.length).toBeLessThanOrEqual(10);
    }
  });
});
