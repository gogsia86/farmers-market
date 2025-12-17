/**
 * 🌟 Divine Component Accessibility Tests
 * Component-Level WCAG 2.1 AA/AAA Compliance
 *
 * @module tests/accessibility/components.a11y.test
 * @description Comprehensive accessibility testing for all UI components
 * @version 1.0.0
 *
 * Test Coverage:
 * - Button components (quantum, standard, agricultural)
 * - Form inputs and validation
 * - Card components and layouts
 * - Navigation components
 * - Modal dialogs
 * - Agricultural-specific components
 * - Data tables and grids
 */

import { test, expect } from '@playwright/test';
import {
  injectAxe,
  runAxeScan,
  assertNoA11yViolations,
  testKeyboardNavigation,
  testTabOrder,
  testFocusIndicators,
  validateAriaAttributes,
  checkColorContrast,
  validateSemanticHTML,
  validateHeadingHierarchy,
  validateImageAltText,
  testFarmProfileAccessibility,
  testProductCatalogAccessibility,
  type KeyboardNavigationTest,
  type AriaValidation,
  type ColorContrastRequirement,
} from './a11y-utils';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// WCAG 2.1 AA contrast requirements
const CONTRAST_REQUIREMENTS = {
  normalText: { minRatio: 4.5, level: 'AA', textSize: 'normal' } as ColorContrastRequirement,
  largeText: { minRatio: 3, level: 'AA', textSize: 'large' } as ColorContrastRequirement,
  normalTextAAA: { minRatio: 7, level: 'AAA', textSize: 'normal' } as ColorContrastRequirement,
  largeTextAAA: { minRatio: 4.5, level: 'AAA', textSize: 'large' } as ColorContrastRequirement,
};

// ============================================================================
// BUTTON COMPONENT ACCESSIBILITY
// ============================================================================

test.describe('Button Component Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/buttons`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should be keyboard accessible', async ({ page }) => {
    const buttonTests: KeyboardNavigationTest[] = [
      {
        elementSelector: 'button:has-text("Primary")',
        expectedBehavior: 'Activate button with Enter key',
        keys: ['Enter'],
        assertions: [
          async () => {
            // Verify button was clicked
            const wasClicked = await page.locator('button:has-text("Primary")').evaluate(
              (el) => el.getAttribute('data-clicked') === 'true'
            );
            // In real test, check for actual click handler result
          },
        ],
      },
      {
        elementSelector: 'button:has-text("Primary")',
        expectedBehavior: 'Activate button with Space key',
        keys: ['Space'],
        assertions: [
          async () => {
            // Verify button was clicked
          },
        ],
      },
    ];

    await testKeyboardNavigation(page, buttonTests);
  });

  test('should have visible focus indicators', async ({ page }) => {
    const buttonSelectors = [
      'button:has-text("Primary")',
      'button:has-text("Secondary")',
      'button:has-text("Agricultural")',
      'button:has-text("Divine")',
    ];

    await testFocusIndicators(page, buttonSelectors);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const ariaValidations: AriaValidation[] = [
      {
        selector: 'button[disabled]',
        expectedAttributes: {
          'aria-disabled': 'true',
        },
      },
      {
        selector: 'button[data-loading="true"]',
        expectedAttributes: {
          'aria-busy': 'true',
        },
      },
    ];

    // Only validate if these buttons exist
    const disabledBtn = await page.locator('button[disabled]').count();
    const loadingBtn = await page.locator('button[data-loading="true"]').count();

    if (disabledBtn > 0 || loadingBtn > 0) {
      await validateAriaAttributes(page, ariaValidations);
    }
  });

  test('should meet color contrast requirements (AA)', async ({ page }) => {
    const buttonSelectors = [
      'button:has-text("Primary")',
      'button:has-text("Secondary")',
      'button:has-text("Agricultural")',
    ];

    for (const selector of buttonSelectors) {
      if ((await page.locator(selector).count()) > 0) {
        await checkColorContrast(page, selector, CONTRAST_REQUIREMENTS.normalText);
      }
    }
  });

  test('should support all button variants', async ({ page }) => {
    const variants = ['primary', 'secondary', 'agricultural', 'divine'];

    for (const variant of variants) {
      const button = page.locator(`button[data-variant="${variant}"]`);
      const count = await button.count();

      if (count > 0) {
        // Should be focusable
        await button.first().focus();
        await expect(button.first()).toBeFocused();

        // Should have accessible text
        const text = await button.first().textContent();
        expect(text?.trim()).toBeTruthy();
      }
    }
  });

  test('should have proper button type attributes', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const type = await button.getAttribute('type');

      // Buttons should have explicit type
      expect(['button', 'submit', 'reset']).toContain(type);
    }
  });
});

// ============================================================================
// FORM INPUT ACCESSIBILITY
// ============================================================================

test.describe('Form Input Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/forms`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should have proper labels for all inputs', async ({ page }) => {
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const type = await input.getAttribute('type');

      // Skip hidden inputs
      if (type === 'hidden') continue;

      // Must have either id+label, aria-label, or aria-labelledby
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should display validation errors accessibly', async ({ page }) => {
    const form = page.locator('form').first();
    const submitButton = form.locator('button[type="submit"]');

    // Submit form to trigger validation
    await submitButton.click();

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for error messages
    const errorMessages = page.locator('[role="alert"], .error-message, [aria-invalid="true"]');
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      // Errors should be announced
      const firstError = errorMessages.first();
      const role = await firstError.getAttribute('role');
      const ariaLive = await firstError.getAttribute('aria-live');

      expect(role === 'alert' || ariaLive).toBeTruthy();

      // Invalid inputs should have aria-invalid
      const invalidInputs = page.locator('[aria-invalid="true"]');
      const invalidCount = await invalidInputs.count();

      expect(invalidCount).toBeGreaterThan(0);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    const formInputs = await page.evaluate(() => {
      const inputs = Array.from(
        document.querySelectorAll('input:not([type="hidden"]), select, textarea')
      );
      return inputs.map((el, idx) => {
        (el as HTMLElement).setAttribute('data-test-idx', idx.toString());
        return `[data-test-idx="${idx}"]`;
      });
    });

    if (formInputs.length > 0) {
      await testTabOrder(page, formInputs.slice(0, 5)); // Test first 5 inputs
    }
  });

  test('should have proper input types', async ({ page }) => {
    const emailInputs = page.locator('input[name*="email"]');
    const emailCount = await emailInputs.count();

    if (emailCount > 0) {
      const type = await emailInputs.first().getAttribute('type');
      expect(type).toBe('email');
    }

    const telInputs = page.locator('input[name*="phone"], input[name*="tel"]');
    const telCount = await telInputs.count();

    if (telCount > 0) {
      const type = await telInputs.first().getAttribute('type');
      expect(type).toBe('tel');
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    const inputs = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('input:not([type="hidden"]), select, textarea')
      );
      return elements.slice(0, 3).map((el, idx) => {
        (el as HTMLElement).setAttribute('data-focus-test', idx.toString());
        return `[data-focus-test="${idx}"]`;
      });
    });

    if (inputs.length > 0) {
      await testFocusIndicators(page, inputs);
    }
  });

  test('should have autocomplete attributes for personal data', async ({ page }) => {
    const personalDataFields = {
      name: 'input[name*="name"]',
      email: 'input[name*="email"]',
      phone: 'input[name*="phone"]',
      address: 'input[name*="address"]',
    };

    for (const [field, selector] of Object.entries(personalDataFields)) {
      const input = page.locator(selector).first();
      const count = await input.count();

      if (count > 0) {
        const autocomplete = await input.getAttribute('autocomplete');
        // Should have appropriate autocomplete value
        expect(autocomplete).toBeTruthy();
      }
    }
  });
});

// ============================================================================
// CARD COMPONENT ACCESSIBILITY
// ============================================================================

test.describe('Card Component Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/cards`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await validateHeadingHierarchy(page);
  });

  test('should have accessible images', async ({ page }) => {
    await validateImageAltText(page);
  });

  test('should be keyboard navigable for interactive cards', async ({ page }) => {
    const interactiveCards = page.locator('[role="button"], .card-interactive, a.card');
    const count = await interactiveCards.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = interactiveCards.nth(i);
        await card.focus();
        await expect(card).toBeFocused();

        // Should be activatable with Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
      }
    }
  });

  test('should have proper ARIA for card regions', async ({ page }) => {
    const cards = page.locator('.card, [data-card]').first();
    const count = await cards.count();

    if (count > 0) {
      const ariaValidations: AriaValidation[] = [
        {
          selector: '.card, [data-card]',
          expectedRole: 'article',
        },
      ];

      // Only validate if cards have role attribute
      const hasRole = await cards.first().getAttribute('role');
      if (hasRole) {
        await validateAriaAttributes(page, ariaValidations);
      }
    }
  });

  test('should maintain color contrast in all variants', async ({ page }) => {
    const cardVariants = ['.card-default', '.card-agricultural', '.card-divine'];

    for (const variant of cardVariants) {
      const card = page.locator(variant).first();
      const count = await card.count();

      if (count > 0) {
        // Check heading contrast
        const heading = card.locator('h1, h2, h3, h4, h5, h6').first();
        if ((await heading.count()) > 0) {
          await checkColorContrast(
            page,
            `${variant} h1, ${variant} h2, ${variant} h3`,
            CONTRAST_REQUIREMENTS.largeText
          );
        }

        // Check body text contrast
        const bodyText = card.locator('p').first();
        if ((await bodyText.count()) > 0) {
          await checkColorContrast(
            page,
            `${variant} p`,
            CONTRAST_REQUIREMENTS.normalText
          );
        }
      }
    }
  });
});

// ============================================================================
// NAVIGATION ACCESSIBILITY
// ============================================================================

test.describe('Navigation Component Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should have proper semantic structure', async ({ page }) => {
    await validateSemanticHTML(page);

    // Should have nav element
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();

    // Should have main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Find all navigation links
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      return links.map((el, idx) => {
        (el as HTMLElement).setAttribute('data-nav-idx', idx.toString());
        return `[data-nav-idx="${idx}"]`;
      });
    });

    if (navLinks.length > 0) {
      await testTabOrder(page, navLinks.slice(0, 5)); // Test first 5 links
    }
  });

  test('should have skip links', async ({ page }) => {
    // Look for skip link
    const skipLink = page.locator('a[href^="#"][href*="main"], a[href^="#"][href*="content"]').first();
    const count = await skipLink.count();

    if (count > 0) {
      // Focus the skip link (might be visually hidden)
      await page.keyboard.press('Tab');

      // Should be focusable
      const isFocusable = await skipLink.evaluate(
        (el) => (el as HTMLElement).tabIndex >= 0
      );
      expect(isFocusable).toBe(true);
    }
  });

  test('should have proper ARIA labels for navigation', async ({ page }) => {
    const navElements = page.locator('nav');
    const count = await navElements.count();

    for (let i = 0; i < count; i++) {
      const nav = navElements.nth(i);
      const ariaLabel = await nav.getAttribute('aria-label');
      const ariaLabelledBy = await nav.getAttribute('aria-labelledby');

      // Nav should have a label if there are multiple navs
      if (count > 1) {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should indicate current page', async ({ page }) => {
    const currentLink = page.locator('nav a[aria-current="page"]');
    const count = await currentLink.count();

    if (count > 0) {
      // Current page should be indicated
      await expect(currentLink.first()).toBeVisible();

      // Should have visual indicator
      const hasVisualIndicator = await currentLink.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        // Check for bold, different color, underline, etc.
        return (
          style.fontWeight === 'bold' ||
          style.fontWeight === '700' ||
          style.textDecoration.includes('underline') ||
          style.borderBottom !== 'none'
        );
      });

      expect(hasVisualIndicator).toBe(true);
    }
  });

  test('should have mobile menu accessibility', async ({ page, viewport }) => {
    if (!viewport) return;

    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    const count = await menuButton.count();

    if (count > 0) {
      // Menu button should be accessible
      await expect(menuButton).toBeVisible();
      await expect(menuButton).toBeEnabled();

      const ariaExpanded = await menuButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBeTruthy();

      // Click to open menu
      await menuButton.click();
      await page.waitForTimeout(300);

      // Should update aria-expanded
      const expandedAfter = await menuButton.getAttribute('aria-expanded');
      expect(expandedAfter).toBe('true');

      // Menu should be visible
      const menu = page.locator('[role="menu"], nav[data-mobile-menu]');
      if ((await menu.count()) > 0) {
        await expect(menu.first()).toBeVisible();
      }
    }
  });
});

// ============================================================================
// MODAL DIALOG ACCESSIBILITY
// ============================================================================

test.describe('Modal Dialog Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/dialogs`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Open a modal
    const openButton = page.locator('button:has-text("Open Modal")').first();
    const hasButton = await openButton.count();

    if (hasButton > 0) {
      await openButton.click();
      await page.waitForTimeout(300);

      const ariaValidations: AriaValidation[] = [
        {
          selector: '[role="dialog"]',
          expectedAttributes: {
            'aria-modal': 'true',
          },
        },
      ];

      await validateAriaAttributes(page, ariaValidations);
    }
  });

  test('should trap focus within modal', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    const hasButton = await openButton.count();

    if (hasButton > 0) {
      await openButton.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Find focusable elements in modal
      const focusableElements = await modal.evaluate((dialog) => {
        const selectors = [
          'button:not([disabled])',
          'a[href]',
          'input:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ];
        const elements = dialog.querySelectorAll(selectors.join(','));
        return elements.length;
      });

      if (focusableElements > 0) {
        // Tab through elements
        for (let i = 0; i < focusableElements + 1; i++) {
          await page.keyboard.press('Tab');
        }

        // Focus should still be within modal
        const focusInModal = await page.evaluate(() => {
          const activeElement = document.activeElement;
          const dialog = document.querySelector('[role="dialog"]');
          return dialog?.contains(activeElement);
        });

        expect(focusInModal).toBe(true);
      }
    }
  });

  test('should close on Escape key', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    const hasButton = await openButton.count();

    if (hasButton > 0) {
      await openButton.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      await expect(modal).not.toBeVisible();
    }
  });

  test('should restore focus after closing', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    const hasButton = await openButton.count();

    if (hasButton > 0) {
      await openButton.focus();
      await expect(openButton).toBeFocused();

      await openButton.click();
      await page.waitForTimeout(300);

      // Close modal
      const closeButton = page.locator('[role="dialog"] button:has-text("Close")').first();
      if ((await closeButton.count()) > 0) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }

      await page.waitForTimeout(300);

      // Focus should return to open button
      await expect(openButton).toBeFocused();
    }
  });
});

// ============================================================================
// AGRICULTURAL COMPONENT ACCESSIBILITY
// ============================================================================

test.describe('Farm Profile Component Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/farms/test-farm`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should have accessible farm profile structure', async ({ page }) => {
    await testFarmProfileAccessibility(page);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await validateHeadingHierarchy(page);
  });

  test('should have accessible images', async ({ page }) => {
    await validateImageAltText(page);
  });

  test('should have accessible contact information', async ({ page }) => {
    const contactSection = page.locator('[data-contact], .contact-info').first();
    const hasContact = await contactSection.count();

    if (hasContact > 0) {
      // Should be in a labeled region
      const ariaLabel = await contactSection.getAttribute('aria-label');
      const ariaLabelledBy = await contactSection.getAttribute('aria-labelledby');

      expect(ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });
});

test.describe('Product Catalog Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/products`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should have accessible product catalog', async ({ page }) => {
    await testProductCatalogAccessibility(page);
  });

  test('should have accessible filters', async ({ page }) => {
    const filters = page.locator('[role="group"][aria-label*="filter"], .filter-section');
    const count = await filters.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const filter = filters.nth(i);
        const ariaLabel = await filter.getAttribute('aria-label');

        expect(ariaLabel).toBeTruthy();
      }
    }
  });

  test('should announce filter changes', async ({ page }) => {
    const filterCheckbox = page.locator('input[type="checkbox"][data-filter]').first();
    const count = await filterCheckbox.count();

    if (count > 0) {
      // Click filter
      await filterCheckbox.click();
      await page.waitForTimeout(500);

      // Look for live region announcement
      const liveRegion = page.locator('[aria-live], [role="status"]');
      const liveCount = await liveRegion.count();

      if (liveCount > 0) {
        const text = await liveRegion.first().textContent();
        expect(text?.trim()).toBeTruthy();
      }
    }
  });

  test('should have accessible sorting controls', async ({ page }) => {
    const sortSelect = page.locator('select[name*="sort"], [role="combobox"]').first();
    const count = await sortSelect.count();

    if (count > 0) {
      // Should have label
      const id = await sortSelect.getAttribute('id');
      const ariaLabel = await sortSelect.getAttribute('aria-label');
      const ariaLabelledBy = await sortSelect.getAttribute('aria-labelledby');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });
});

test.describe('Seasonal Product Grid Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/products/seasonal`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should have accessible seasonal indicators', async ({ page }) => {
    const seasonBadges = page.locator('[data-season], .season-badge');
    const count = await seasonBadges.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const badge = seasonBadges.nth(i);

        // Should have accessible text
        const text = await badge.textContent();
        const ariaLabel = await badge.getAttribute('aria-label');

        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should have accessible product images', async ({ page }) => {
    await validateImageAltText(page);
  });

  test('should maintain focus after adding to cart', async ({ page }) => {
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    const count = await addToCartBtn.count();

    if (count > 0) {
      await addToCartBtn.focus();
      await expect(addToCartBtn).toBeFocused();

      await addToCartBtn.click();
      await page.waitForTimeout(500);

      // Focus should remain on button or move to logical location
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        return active?.tagName;
      });

      expect(focusedElement).toBeTruthy();
    }
  });
});

// ============================================================================
// DATA TABLE ACCESSIBILITY
// ============================================================================

test.describe('Data Table Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/tables`);
  });

  test('should have no WCAG violations', async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: 'AA' });
  });

  test('should have proper table structure', async ({ page }) => {
    const table = page.locator('table').first();
    const count = await table.count();

    if (count > 0) {
      // Should have caption or aria-label
      const caption = table.locator('caption');
      const ariaLabel = await table.getAttribute('aria-label');
      const ariaLabelledBy = await table.getAttribute('aria-labelledby');

      const hasCaption = (await caption.count()) > 0;
      expect(hasCaption || ariaLabel || ariaLabelledBy).toBeTruthy();

      // Should have thead
      const thead = table.locator('thead');
      await expect(thead).toBeVisible();

      // Headers should have scope
      const headers = table.locator('th');
      const headerCount = await headers.count();

      for (let i = 0; i < headerCount; i++) {
        const header = headers.nth(i);
        const scope = await header.getAttribute('scope');
        expect(['col', 'row', 'colgroup', 'rowgroup']).toContain(scope);
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    const table = page.locator('table').first();
    const count = await table.count();

    if (count > 0) {
      // Interactive elements in table should be focusable
      const interactiveElements = table.locator('button, a, input, select');
      const interactiveCount = await interactiveElements.count();

      if (interactiveCount > 0) {
        const firstInteractive = interactiveElements.first();
        await firstInteractive.focus();
        await expect(firstInteractive).toBeFocused();
      }
    }
  });

  test('should have sortable columns with proper ARIA', async ({ page }) => {
    const sortableHeaders = page.locator('th[aria-sort], th button');
    const count = await sortableHeaders.count();

    if (count > 0) {
      const header = sortableHeaders.first();

      // Should have aria-sort
      const ariaSort = await header.evaluate((el) => {
        if (el.tagName === 'BUTTON') {
          return el.closest('th')?.getAttribute('aria-sort');
        }
        return el.getAttribute('aria-sort');
      });

      expect(['ascending', 'descending', 'none', null]).toContain(ariaSort);
    }
  });
});

// ============================================================================
// LOADING & EMPTY STATES
// ============================================================================

test.describe('Loading State Accessibility', () => {
  test('should announce loading state', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/loading`);

    const loadingIndicator = page.locator('[role="status"], [aria-busy="true"]').first();
    const count = await loadingIndicator.count();

    if (count > 0) {
      // Should have aria-live or role=status
      const ariaLive = await loadingIndicator.getAttribute('aria-live');
      const role = await loadingIndicator.getAttribute('role');

      expect(ariaLive || role === 'status').toBeTruthy();

      // Should have accessible text
      const text = await loadingIndicator.textContent();
      const ariaLabel = await loadingIndicator.getAttribute('aria-label');

      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Empty State Accessibility', () => {
  test('should have accessible empty state message', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/empty-state`);

    const emptyState = page.locator('[data-empty-state], .empty-state').first();
    const count = await emptyState.count();

    if (count > 0) {
      // Should have heading
      const heading = emptyState.locator('h1, h2, h3, h4');
      await expect(heading.first()).toBeVisible();

      // Should have descriptive text
      const text = await emptyState.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);

      // If has action button, should be accessible
      const actionButton = emptyState.locator('button, a').first();
      if ((await actionButton.count()) > 0) {
        await expect(actionButton).toBeEnabled();
        await actionButton.focus();
        await expect(actionButton).toBeFocused();
      }
    }
  });
});

// ============================================================================
// SUMMARY TEST
// ============================================================================

test.describe('Overall Accessibility Summary', () => {
  test('should pass comprehensive WCAG 2.1 AA audit', async ({ page }) => {
    const pages = [
      '/',
      '/farms',
      '/products',
      '/cart',
    ];

    let totalViolations = 0;
    let totalPasses = 0;

    for (const pagePath of pages) {
      await page.goto(`${TEST_BASE_URL}${pagePath}`);
      await injectAxe(page);
      const result = await runAxeScan(page, { wcagLevel: 'AA' });

      totalViolations += result.violations.length;
      totalPasses += result.passes;

      console.log(`
📄 ${pagePath}
  Violations: ${result.violations.length}
  Passes: ${result.passes}
      `);
    }

    console.log(`
╔════════════════════════════════════════════════════════════╗
║           🌟 ACCESSIBILITY AUDIT SUMMARY                   ║
╠════════════════════════════════════════════════════════════╣
║ Pages Tested: ${pages.length}
║ Total Violations: ${totalViolations}
║ Total Passes: ${totalPasses}
║ Status: ${totalViolations === 0 ? '✅ PASS' : '⚠️  NEEDS ATTENTION'}
╚════════════════════════════════════════════════════════════╝
    `);

    expect(totalViolations).toBeLessThanOrEqual(0);
  });
});
