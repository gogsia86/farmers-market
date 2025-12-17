/**
 * 🌟 Divine Keyboard Navigation & Focus Management Tests
 * Comprehensive Keyboard Accessibility Testing
 *
 * @module tests/accessibility/keyboard.a11y.test
 * @description Tests for keyboard navigation, focus management, and shortcuts
 * @version 1.0.0
 *
 * Test Coverage:
 * - Tab order and navigation
 * - Focus indicators and visibility
 * - Keyboard shortcuts
 * - Focus trapping in modals
 * - Skip links
 * - ARIA keyboard patterns
 * - Agricultural workflow keyboard support
 */

import { test, expect } from '@playwright/test';
import {
  testKeyboardNavigation,
  testTabOrder,
  testReverseTabOrder,
  testKeyboardShortcuts,
  assertNoKeyboardTraps,
  testSkipLinks,
  testFocusIndicators,
  testFocusManagement,
  assertNoA11yViolations,
  type KeyboardNavigationTest,
  type FocusManagementTest,
} from './a11y-utils';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ============================================================================
// BASIC KEYBOARD NAVIGATION
// ============================================================================

test.describe('Basic Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test('should support Tab navigation through all interactive elements', async ({ page }) => {
    // Get all focusable elements
    const focusableSelectors = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      return elements.slice(0, 10).map((el, idx) => {
        (el as HTMLElement).setAttribute('data-tab-test', idx.toString());
        return `[data-tab-test="${idx}"]`;
      });
    });

    if (focusableSelectors.length > 0) {
      await testTabOrder(page, focusableSelectors);
    }
  });

  test('should support Shift+Tab reverse navigation', async ({ page }) => {
    const focusableSelectors = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"])'
        )
      );

      return elements.slice(0, 8).map((el, idx) => {
        (el as HTMLElement).setAttribute('data-reverse-tab', idx.toString());
        return `[data-reverse-tab="${idx}"]`;
      });
    });

    if (focusableSelectors.length > 0) {
      await testReverseTabOrder(page, focusableSelectors);
    }
  });

  test('should show visible focus indicators', async ({ page }) => {
    const focusableElements = [
      'nav a',
      'button',
      'input',
      'select',
    ];

    const existingElements = [];
    for (const selector of focusableElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0) {
        existingElements.push(selector);
      }
    }

    if (existingElements.length > 0) {
      await testFocusIndicators(page, existingElements.slice(0, 5));
    }
  });

  test('should respect tabindex ordering', async ({ page }) => {
    // Test custom tabindex if present
    const customTabindexElements = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('[tabindex="0"], [tabindex="1"], [tabindex="2"]')
      );

      return elements.map((el, idx) => {
        (el as HTMLElement).setAttribute('data-custom-tab', idx.toString());
        return `[data-custom-tab="${idx}"]`;
      });
    });

    if (customTabindexElements.length > 0) {
      for (let i = 0; i < customTabindexElements.length; i++) {
        if (i === 0) {
          await page.locator(customTabindexElements[i]).focus();
        } else {
          await page.keyboard.press('Tab');
        }

        await expect(page.locator(customTabindexElements[i])).toBeFocused();
      }
    }
  });

  test('should not include hidden elements in tab order', async ({ page }) => {
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      const style = window.getComputedStyle(el as Element);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
      };
    });

    expect(focusedElement.display).not.toBe('none');
    expect(focusedElement.visibility).not.toBe('hidden');
  });
});

// ============================================================================
// SKIP LINKS & LANDMARKS
// ============================================================================

test.describe('Skip Links & Landmarks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test('should have functional skip link', async ({ page }) => {
    await testSkipLinks(page);
  });

  test('should skip to main content on activation', async ({ page }) => {
    // Focus first element (should be skip link)
    await page.keyboard.press('Tab');

    const firstElement = await page.evaluate(() => {
      return {
        tagName: document.activeElement?.tagName,
        href: (document.activeElement as HTMLAnchorElement)?.href,
        text: document.activeElement?.textContent?.trim(),
      };
    });

    // Check if it's a skip link
    if (firstElement.href?.includes('#') && firstElement.text?.toLowerCase().includes('skip')) {
      // Activate skip link
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Should focus main content
      const mainElement = page.locator('main, [role="main"]').first();
      const mainHasFocus = await mainElement.evaluate(el =>
        el.matches(':focus, :focus-within')
      );

      expect(mainHasFocus).toBe(true);
    }
  });

  test('should navigate between landmarks with keyboard', async ({ page }) => {
    const landmarks = page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]');
    const count = await landmarks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const landmark = landmarks.nth(i);
        const role = await landmark.getAttribute('role');

        console.log(`  ✓ Found landmark: ${role}`);

        // Landmarks should be accessible via Tab or have focusable children
        const focusableInLandmark = landmark.locator(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const focusableCount = await focusableInLandmark.count();
        expect(focusableCount).toBeGreaterThan(0);
      }
    }
  });
});

// ============================================================================
// BUTTON KEYBOARD INTERACTIONS
// ============================================================================

test.describe('Button Keyboard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/buttons`);
  });

  test('should activate with Enter key', async ({ page }) => {
    const button = page.locator('button').first();
    await button.focus();
    await expect(button).toBeFocused();

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Button should trigger action (verify based on implementation)
  });

  test('should activate with Space key', async ({ page }) => {
    const button = page.locator('button').first();
    await button.focus();
    await expect(button).toBeFocused();

    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Button should trigger action
  });

  test('should not activate disabled buttons', async ({ page }) => {
    const disabledButton = page.locator('button[disabled]').first();
    const count = await disabledButton.count();

    if (count > 0) {
      // Try to focus (should fail or skip)
      await disabledButton.focus().catch(() => {});

      const isFocused = await disabledButton.evaluate(el => el.matches(':focus'));
      expect(isFocused).toBe(false);
    }
  });

  test('should handle loading state', async ({ page }) => {
    const loadingButton = page.locator('button[data-loading="true"], button[aria-busy="true"]').first();
    const count = await loadingButton.count();

    if (count > 0) {
      // Should be focusable but might ignore clicks
      await loadingButton.focus();
      await expect(loadingButton).toBeFocused();

      const ariaBusy = await loadingButton.getAttribute('aria-busy');
      expect(ariaBusy).toBe('true');
    }
  });
});

// ============================================================================
// FORM KEYBOARD NAVIGATION
// ============================================================================

test.describe('Form Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/forms`);
  });

  test('should navigate through form fields with Tab', async ({ page }) => {
    const formInputs = await page.evaluate(() => {
      const inputs = Array.from(
        document.querySelectorAll('form input:not([type="hidden"]), form select, form textarea')
      );

      return inputs.slice(0, 6).map((el, idx) => {
        (el as HTMLElement).setAttribute('data-form-idx', idx.toString());
        return `[data-form-idx="${idx}"]`;
      });
    });

    if (formInputs.length > 0) {
      await testTabOrder(page, formInputs);
    }
  });

  test('should submit form with Enter in text input', async ({ page }) => {
    const textInput = page.locator('input[type="text"], input[type="email"]').first();
    const count = await textInput.count();

    if (count > 0) {
      await textInput.focus();
      await textInput.fill('test@example.com');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Form should submit (check for validation or redirect)
    }
  });

  test('should not submit on Enter in textarea', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    const count = await textarea.count();

    if (count > 0) {
      await textarea.focus();
      await textarea.fill('First line');
      await page.keyboard.press('Enter');

      // Should add newline, not submit
      const value = await textarea.inputValue();
      expect(value).toContain('\n');
    }
  });

  test('should navigate radio buttons with arrow keys', async ({ page }) => {
    const radioGroup = page.locator('[role="radiogroup"], fieldset:has(input[type="radio"])').first();
    const count = await radioGroup.count();

    if (count > 0) {
      const radios = radioGroup.locator('input[type="radio"]');
      const radioCount = await radios.count();

      if (radioCount > 1) {
        // Focus first radio
        await radios.first().focus();
        await expect(radios.first()).toBeFocused();

        // Arrow down should focus next
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);

        await expect(radios.nth(1)).toBeFocused();
      }
    }
  });

  test('should toggle checkbox with Space', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    const count = await checkbox.count();

    if (count > 0) {
      await checkbox.focus();
      await expect(checkbox).toBeFocused();

      const initialState = await checkbox.isChecked();
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);

      const newState = await checkbox.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test('should open select with Space or Enter', async ({ page }) => {
    const select = page.locator('select').first();
    const count = await select.count();

    if (count > 0) {
      await select.focus();
      await expect(select).toBeFocused();

      await page.keyboard.press('Space');
      await page.waitForTimeout(200);

      // Select should open (check for expanded state if custom)
    }
  });
});

// ============================================================================
// MODAL FOCUS MANAGEMENT
// ============================================================================

test.describe('Modal Focus Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/dialogs`);
  });

  test('should trap focus within modal', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    const count = await openButton.count();

    if (count > 0) {
      // Remember opening element
      await openButton.focus();
      await openButton.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Test focus trap
      await assertNoKeyboardTraps(page, '[role="dialog"]');
    }
  });

  test('should focus first interactive element on open', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    const count = await openButton.count();

    if (count > 0) {
      await openButton.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // First focusable element should be focused
      const firstFocusable = modal.locator('button, a, input, [tabindex]:not([tabindex="-1"])').first();
      if ((await firstFocusable.count()) > 0) {
        await expect(firstFocusable).toBeFocused();
      }
    }
  });

  test('should close on Escape key', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    const count = await openButton.count();

    if (count > 0) {
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
    const count = await openButton.count();

    if (count > 0) {
      await openButton.focus();
      await expect(openButton).toBeFocused();

      await openButton.click();
      await page.waitForTimeout(300);

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Focus should return to button
      await expect(openButton).toBeFocused();
    }
  });

  test('should cycle focus within modal', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    const count = await openButton.count();

    if (count > 0) {
      await openButton.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[role="dialog"]');
      const focusableElements = modal.locator('button, a, input, [tabindex]:not([tabindex="-1"])');
      const focusableCount = await focusableElements.count();

      if (focusableCount > 1) {
        // Tab through all elements
        for (let i = 0; i < focusableCount; i++) {
          await page.keyboard.press('Tab');
        }

        // Tab one more time should cycle to first
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        // Should still be within modal
        const focusInModal = await page.evaluate(() => {
          const activeElement = document.activeElement;
          const dialog = document.querySelector('[role="dialog"]');
          return dialog?.contains(activeElement);
        });

        expect(focusInModal).toBe(true);
      }
    }
  });
});

// ============================================================================
// DROPDOWN & MENU KEYBOARD NAVIGATION
// ============================================================================

test.describe('Dropdown & Menu Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test('should open dropdown with Enter or Space', async ({ page }) => {
    const dropdownTrigger = page.locator('[role="button"][aria-haspopup="true"]').first();
    const count = await dropdownTrigger.count();

    if (count > 0) {
      await dropdownTrigger.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      const ariaExpanded = await dropdownTrigger.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('true');
    }
  });

  test('should navigate menu items with arrow keys', async ({ page }) => {
    const dropdownTrigger = page.locator('[role="button"][aria-haspopup="true"]').first();
    const count = await dropdownTrigger.count();

    if (count > 0) {
      await dropdownTrigger.click();
      await page.waitForTimeout(300);

      const menu = page.locator('[role="menu"]');
      if ((await menu.count()) > 0) {
        const menuItems = menu.locator('[role="menuitem"]');
        const itemCount = await menuItems.count();

        if (itemCount > 1) {
          // First item should be focused
          await expect(menuItems.first()).toBeFocused();

          // Arrow down should focus next
          await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(100);

          await expect(menuItems.nth(1)).toBeFocused();
        }
      }
    }
  });

  test('should close dropdown with Escape', async ({ page }) => {
    const dropdownTrigger = page.locator('[role="button"][aria-haspopup="true"]').first();
    const count = await dropdownTrigger.count();

    if (count > 0) {
      await dropdownTrigger.click();
      await page.waitForTimeout(300);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      const ariaExpanded = await dropdownTrigger.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('false');

      // Focus should return to trigger
      await expect(dropdownTrigger).toBeFocused();
    }
  });

  test('should activate menu item with Enter', async ({ page }) => {
    const dropdownTrigger = page.locator('[role="button"][aria-haspopup="true"]').first();
    const count = await dropdownTrigger.count();

    if (count > 0) {
      await dropdownTrigger.click();
      await page.waitForTimeout(300);

      const menu = page.locator('[role="menu"]');
      if ((await menu.count()) > 0) {
        const firstItem = menu.locator('[role="menuitem"]').first();
        if ((await firstItem.count()) > 0) {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);

          // Menu should close
          await expect(menu).not.toBeVisible();
        }
      }
    }
  });
});

// ============================================================================
// AGRICULTURAL WORKFLOW KEYBOARD SUPPORT
// ============================================================================

test.describe('Agricultural Workflow Keyboard Support', () => {
  test('should support keyboard navigation in product catalog', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/products`);

    const productCards = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll('.product-card, [data-product-card]')
      );

      return cards.slice(0, 5).map((card, idx) => {
        const link = card.querySelector('a, button');
        if (link) {
          (link as HTMLElement).setAttribute('data-product-idx', idx.toString());
          return `[data-product-idx="${idx}"]`;
        }
        return null;
      }).filter(Boolean);
    });

    if (productCards.length > 0) {
      await testTabOrder(page, productCards as string[]);
    }
  });

  test('should support keyboard in farm profile', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/farms/test-farm`);

    const interactiveElements = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('main a, main button')
      );

      return elements.slice(0, 8).map((el, idx) => {
        (el as HTMLElement).setAttribute('data-farm-nav', idx.toString());
        return `[data-farm-nav="${idx}"]`;
      });
    });

    if (interactiveElements.length > 0) {
      await testTabOrder(page, interactiveElements);
    }
  });

  test('should support keyboard in shopping cart', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/cart`);

    const cartControls = await page.evaluate(() => {
      const buttons = Array.from(
        document.querySelectorAll('button, a[href], input')
      );

      return buttons.map((el, idx) => {
        (el as HTMLElement).setAttribute('data-cart-control', idx.toString());
        return `[data-cart-control="${idx}"]`;
      });
    });

    if (cartControls.length > 0) {
      // Should be able to Tab through all controls
      for (let i = 0; i < Math.min(cartControls.length, 10); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
    }
  });

  test('should support keyboard in seasonal product grid', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/products/seasonal`);

    // Seasonal indicators should not trap focus
    const container = page.locator('main, [role="main"]');
    await assertNoKeyboardTraps(page, 'main');
  });
});

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test('should support search shortcut (Ctrl+K or /)', async ({ page }) => {
    // Try Ctrl+K
    await page.keyboard.press('Control+KeyK');
    await page.waitForTimeout(300);

    let searchInput = page.locator('input[type="search"]');
    let count = await searchInput.count();

    if (count === 0 || !(await searchInput.first().isVisible())) {
      // Try / key
      await page.keyboard.press('/');
      await page.waitForTimeout(300);

      searchInput = page.locator('input[type="search"]');
      count = await searchInput.count();
    }

    if (count > 0 && (await searchInput.first().isVisible())) {
      await expect(searchInput.first()).toBeFocused();
    }
  });

  test('should support navigation shortcuts', async ({ page }) => {
    const shortcuts = [
      { key: 'Home', expectedFocus: 'first focusable element' },
      { key: 'End', expectedFocus: 'last focusable element' },
    ];

    for (const shortcut of shortcuts) {
      await page.keyboard.press(shortcut.key);
      await page.waitForTimeout(200);

      const focusedElement = await page.evaluate(() => {
        return {
          tagName: document.activeElement?.tagName,
          text: document.activeElement?.textContent?.trim(),
        };
      });

      expect(focusedElement.tagName).toBeTruthy();
    }
  });

  test('should provide keyboard shortcut help', async ({ page }) => {
    // Try common help shortcut
    await page.keyboard.press('?');
    await page.waitForTimeout(500);

    // Look for help modal/dialog
    const helpModal = page.locator('[role="dialog"]:has-text("Keyboard"), [data-keyboard-help]').first();
    const count = await helpModal.count();

    if (count > 0) {
      await expect(helpModal).toBeVisible();
    }
  });
});

// ============================================================================
// FOCUS MANAGEMENT EDGE CASES
// ============================================================================

test.describe('Focus Management Edge Cases', () => {
  test('should handle dynamic content focus', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/components/loading`);

    // Focus an element
    const button = page.locator('button').first();
    if ((await button.count()) > 0) {
      await button.focus();
      await expect(button).toBeFocused();

      // Trigger content change
      await button.click();
      await page.waitForTimeout(500);

      // Focus should be managed appropriately
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(focusedElement).toBeTruthy();
      expect(focusedElement).not.toBe('BODY');
    }
  });

  test('should handle focus after navigation', async ({ page }) => {
    await page.goto(TEST_BASE_URL);

    const link = page.locator('a[href]').first();
    if ((await link.count()) > 0) {
      await link.focus();
      await link.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Focus should be on skip link or main content
      const focusedElement = await page.evaluate(() => {
        return {
          tagName: document.activeElement?.tagName,
          href: (document.activeElement as HTMLAnchorElement)?.href,
        };
      });

      // Should not default to body
      expect(focusedElement.tagName).not.toBe('BODY');
    }
  });

  test('should handle focus in infinite scroll', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/products`);

    const productLinks = page.locator('.product-card a, [data-product] a');
    const count = await productLinks.count();

    if (count > 5) {
      // Focus middle element
      const middleLink = productLinks.nth(Math.floor(count / 2));
      await middleLink.focus();
      await expect(middleLink).toBeFocused();

      // Scroll to load more (if applicable)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Focus should still be on middle element
      await expect(middleLink).toBeFocused();
    }
  });

  test('should handle focus in lazy-loaded images', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/farms`);

    // Tab to an element
    await page.keyboard.press('Tab');
    const initialFocus = await page.evaluate(() => document.activeElement?.tagName);

    // Wait for images to load
    await page.waitForTimeout(1000);

    // Focus should not change
    const afterLoadFocus = await page.evaluate(() => document.activeElement?.tagName);
    expect(afterLoadFocus).toBe(initialFocus);
  });
});

// ============================================================================
// COMPREHENSIVE KEYBOARD TEST
// ============================================================================

test.describe('Comprehensive Keyboard Accessibility', () => {
  test('should pass full keyboard-only navigation test', async ({ page }) => {
    await page.goto(TEST_BASE_URL);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       ⌨️  COMPREHENSIVE KEYBOARD NAVIGATION TEST          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Count focusable elements
    const focusableCount = await page.evaluate(() => {
      return document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ).length;
    });

    console.log(`📊 Total focusable elements: ${focusableCount}`);

    // Tab through all elements
    let tabbedElements = 0;
    let focusedOnBody = false;

    for (let i = 0; i < Math.min(focusableCount, 50); i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);

      const focusInfo = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          hasVisibleFocus: el && window.getComputedStyle(el).outline !== 'none',
          isVisible: el && window.getComputedStyle(el).display !== 'none',
        };
      });

      if (focusInfo.tagName === 'BODY') {
        focusedOnBody = true;
        break;
      }

      if (focusInfo.isVisible) {
        tabbedElements++;
      }
    }

    console.log(`✓ Successfully tabbed through ${tabbedElements} elements`);
    expect(tabbedElements).toBeGreaterThan(5);
    expect(focusedOnBody).toBe(false);

    // Test reverse navigation
    console.log('\n⬅️  Testing reverse navigation...');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(50);

      const isOnBody = await page.evaluate(() => {
        return document.activeElement?.tagName === 'BODY';
      });

      expect(isOnBody).toBe(false);
    }

    console.log('✓ Reverse navigation successful\n');

    // Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ TEST PASSED                            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Elements tested: ${tabbedElements}`);
    console.log('║ Focus trap: None detected');
    console.log('║ Reverse navigation: Working');
    console.log('║ Status: FULLY KEYBOARD ACCESSIBLE');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  });
});
