# 🚀 Accessibility Testing Quick Reference

**Fast access to common patterns, commands, and test examples**

---

## ⚡ Quick Commands

### Run Tests

```bash
# Run all accessibility tests
npm run test:a11y

# Test specific suite
npm run test:a11y:components    # Component tests only
npm run test:a11y:pages         # Page tests only
npm run test:a11y:keyboard      # Keyboard tests only

# Development
npm run test:a11y:ui            # Interactive UI mode
npm run test:a11y:headed        # Visible browser
npm run test:a11y:watch         # Watch mode

# Debugging
npm run test:a11y:debug         # Playwright inspector
npm run test:a11y:verbose       # Detailed output

# Reporting
npm run test:a11y:report        # Generate HTML report
npm run test:a11y:ci            # CI/CD mode
```

### Test Specific Scenarios

```bash
# Test by name
npm run test:a11y -- --grep "Button"
npm run test:a11y -- --grep "Homepage"
npm run test:a11y -- --grep "Keyboard"

# Test single file
npx playwright test tests/accessibility/components.a11y.test.ts

# Test with trace
npx playwright test tests/accessibility/ --trace on
```

---

## 📋 Copy-Paste Test Templates

### Basic WCAG Test

```typescript
import { test, expect } from "@playwright/test";
import { assertNoA11yViolations } from "./a11y-utils";

test.describe("My Component Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/my-page");
  });

  test("should have no WCAG violations", async ({ page }) => {
    await assertNoA11yViolations(page, { wcagLevel: "AA" });
  });
});
```

### Keyboard Navigation Test

```typescript
import { testTabOrder } from "./a11y-utils";

test("should support Tab navigation", async ({ page }) => {
  const selectors = [
    'input[name="email"]',
    'input[name="password"]',
    'button[type="submit"]',
  ];

  await testTabOrder(page, selectors);
});
```

### Focus Indicator Test

```typescript
import { testFocusIndicators } from "./a11y-utils";

test("should have visible focus indicators", async ({ page }) => {
  const elements = ["button", "a[href]", "input"];

  await testFocusIndicators(page, elements);
});
```

### Color Contrast Test

```typescript
import { checkColorContrast } from "./a11y-utils";

test("should meet color contrast requirements", async ({ page }) => {
  await checkColorContrast(page, "button", {
    minRatio: 4.5,
    level: "AA",
    textSize: "normal",
  });
});
```

### ARIA Validation Test

```typescript
import { validateAriaAttributes } from "./a11y-utils";

test("should have proper ARIA attributes", async ({ page }) => {
  await validateAriaAttributes(page, [
    {
      selector: '[role="dialog"]',
      expectedAttributes: {
        "aria-modal": "true",
        "aria-labelledby": "dialog-title",
      },
    },
  ]);
});
```

### Modal Focus Trap Test

```typescript
import { assertNoKeyboardTraps } from "./a11y-utils";

test("should trap focus within modal", async ({ page }) => {
  const openButton = page.locator('button:has-text("Open")');
  await openButton.click();

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  await assertNoKeyboardTraps(page, '[role="dialog"]');
});
```

### Semantic HTML Test

```typescript
import { validateSemanticHTML, validateHeadingHierarchy } from "./a11y-utils";

test("should have proper semantic structure", async ({ page }) => {
  await validateSemanticHTML(page);
  await validateHeadingHierarchy(page);

  const header = page.locator("header");
  await expect(header).toBeVisible();

  const main = page.locator("main");
  await expect(main).toBeVisible();
});
```

### Image Alt Text Test

```typescript
import { validateImageAltText } from "./a11y-utils";

test("should have accessible images", async ({ page }) => {
  await validateImageAltText(page);
});
```

---

## 🎯 Common Assertions

### Basic Expectations

```typescript
// Element is visible
await expect(page.locator("button")).toBeVisible();

// Element is focused
await expect(page.locator("input")).toBeFocused();

// Element has attribute
await expect(page.locator('[role="dialog"]')).toHaveAttribute(
  "aria-modal",
  "true",
);

// Element has text
await expect(page.locator("h1")).toContainText("Homepage");

// Element is enabled
await expect(page.locator("button")).toBeEnabled();
```

### Keyboard Actions

```typescript
// Tab forward
await page.keyboard.press("Tab");

// Tab backward
await page.keyboard.press("Shift+Tab");

// Activate with Enter
await page.keyboard.press("Enter");

// Activate with Space
await page.keyboard.press("Space");

// Arrow navigation
await page.keyboard.press("ArrowDown");
await page.keyboard.press("ArrowUp");

// Escape key
await page.keyboard.press("Escape");

// Keyboard shortcut
await page.keyboard.press("Control+KeyK");
```

### Focus Management

```typescript
// Focus element
await page.locator("button").focus();

// Check focused element
const focused = await page.evaluate(() => document.activeElement?.tagName);
expect(focused).toBe("BUTTON");

// Wait for focus
await page.waitForTimeout(100);
await expect(page.locator("input")).toBeFocused();
```

---

## 🏷️ ARIA Patterns

### Button

```tsx
<button type="button" aria-label="Close dialog" aria-pressed="false">
  <CloseIcon aria-hidden="true" />
</button>
```

### Form Input

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid="false"
  aria-describedby="email-hint"
/>
<span id="email-hint">We'll never share your email</span>
```

### Modal Dialog

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
  <button>Confirm</button>
  <button>Cancel</button>
</div>
```

### Navigation

```tsx
<nav aria-label="Main navigation">
  <ul>
    <li>
      <a href="/" aria-current="page">
        Home
      </a>
    </li>
    <li>
      <a href="/products">Products</a>
    </li>
  </ul>
</nav>
```

### Live Region

```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Dropdown Menu

```tsx
<button
  aria-haspopup="true"
  aria-expanded={isOpen}
  aria-controls="menu-1"
>
  Menu
</button>
<ul
  id="menu-1"
  role="menu"
  hidden={!isOpen}
>
  <li role="menuitem"><a href="/profile">Profile</a></li>
  <li role="menuitem"><a href="/settings">Settings</a></li>
</ul>
```

### Tab Panel

```tsx
<div role="tablist">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="panel-1"
    id="tab-1"
  >
    Tab 1
  </button>
</div>
<div
  role="tabpanel"
  aria-labelledby="tab-1"
  id="panel-1"
>
  Content
</div>
```

---

## 🎨 CSS Focus Styles

### Visible Focus Indicator

```css
/* Basic focus style */
button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Custom focus style with shadow */
button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.5);
}

/* Agricultural theme focus */
.agricultural-button:focus {
  outline: 3px solid #4caf50;
  outline-offset: 3px;
}

/* High contrast focus */
@media (prefers-contrast: high) {
  button:focus {
    outline: 3px solid currentColor;
  }
}
```

---

## 🔍 WCAG Contrast Ratios

| Text Type               | Level AA | Level AAA |
| ----------------------- | -------- | --------- |
| Normal text (< 18px)    | 4.5:1    | 7:1       |
| Large text (≥ 18px)     | 3:1      | 4.5:1     |
| Bold text (≥ 14px bold) | 3:1      | 4.5:1     |
| UI Components           | 3:1      | -         |
| Graphical Objects       | 3:1      | -         |

### Color Contrast Examples

```typescript
// AA Normal text: 4.5:1
{ text: '#000000', background: '#FFFFFF' } // 21:1 ✅
{ text: '#595959', background: '#FFFFFF' } // 4.6:1 ✅
{ text: '#767676', background: '#FFFFFF' } // 4.5:1 ✅
{ text: '#777777', background: '#FFFFFF' } // 4.48:1 ❌

// AAA Normal text: 7:1
{ text: '#000000', background: '#FFFFFF' } // 21:1 ✅
{ text: '#595959', background: '#FFFFFF' } // 4.6:1 ❌

// AA Large text: 3:1
{ text: '#959595', background: '#FFFFFF' } // 3.05:1 ✅
{ text: '#999999', background: '#FFFFFF' } // 2.85:1 ❌
```

---

## 🌾 Agricultural Domain Patterns

### Farm Profile Test

```typescript
import { testFarmProfileAccessibility } from "./a11y-utils";

test("should have accessible farm profile", async ({ page }) => {
  await page.goto("/farms/sunny-acres");
  await testFarmProfileAccessibility(page);
});
```

### Product Catalog Test

```typescript
import { testProductCatalogAccessibility } from "./a11y-utils";

test("should have accessible product catalog", async ({ page }) => {
  await page.goto("/products");
  await testProductCatalogAccessibility(page);
});
```

### Seasonal Accessibility Test

```typescript
import { testSeasonalAccessibility } from "./a11y-utils";

test("should support seasonal patterns", async ({ page }) => {
  await page.goto("/products/seasonal");
  await testSeasonalAccessibility(page, "SUMMER");
});
```

---

## 🐛 Common Issues & Fixes

### Issue: Missing Alt Text

```tsx
// ❌ Bad
<img src="/farm.jpg" />

// ✅ Good
<img src="/farm.jpg" alt="Sunny Acres organic farm with green fields" />

// ✅ Decorative
<img src="/decoration.png" alt="" />
```

### Issue: Missing Form Labels

```tsx
// ❌ Bad
<input type="email" placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Alternative with aria-label
<input type="email" aria-label="Email address" />
```

### Issue: Poor Focus Indicator

```css
/* ❌ Bad - removes outline without replacement */
button:focus {
  outline: none;
}

/* ✅ Good - visible alternative */
button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### Issue: Insufficient Color Contrast

```css
/* ❌ Bad - insufficient contrast (2.5:1) */
.text {
  color: #999999;
  background: #ffffff;
}

/* ✅ Good - sufficient contrast (4.6:1) */
.text {
  color: #595959;
  background: #ffffff;
}
```

### Issue: Keyboard Trap

```tsx
// ❌ Bad - no way to escape
<Modal>
  {/* No close button, no Escape handler */}
</Modal>

// ✅ Good - can escape with Escape key
<Modal onClose={handleClose}>
  <button onClick={handleClose}>Close</button>
</Modal>

// In component:
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

---

## 📊 Test Report Interpretation

### Axe Violation Levels

- **Critical**: Must fix immediately (blocks screen readers)
- **Serious**: Must fix (significant accessibility barrier)
- **Moderate**: Should fix (noticeable impact)
- **Minor**: Nice to fix (minor inconvenience)

### Common Violations

```
color-contrast: Text color contrast is insufficient
button-name: Buttons must have accessible text
label: Form inputs must have labels
link-name: Links must have accessible text
image-alt: Images must have alt text
aria-required-parent: ARIA role requires parent role
heading-order: Heading levels should increase by one
```

---

## 🎯 Checklist for New Components

- [ ] No WCAG violations (run `assertNoA11yViolations`)
- [ ] Keyboard navigable (Tab, Enter, Space work)
- [ ] Focus indicators visible
- [ ] ARIA attributes correct (role, label, state)
- [ ] Color contrast meets AA (4.5:1 normal, 3:1 large)
- [ ] Semantic HTML used (button, nav, main, etc.)
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Error messages accessible
- [ ] Focus managed properly (modals, navigation)

---

## 🔗 Quick Links

- [Full Documentation](./README.md)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

---

**Last Updated**: Day 16 - Accessibility Testing  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
