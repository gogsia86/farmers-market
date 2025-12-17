# 🎨 Visual Regression Testing

Automated screenshot testing for the Farmers Market Platform with pixel-perfect baseline comparison, multi-viewport validation, and agricultural consciousness.

---

## 🚀 QUICK START

### First Time Setup

```bash
# 1. Install dependencies (already done if you ran npm install)
npm install

# 2. Create initial baselines
npm run test:visual:update

# 3. Verify baselines created
npm run baseline:list
```

### Running Tests

```bash
# Run all visual tests
npm run test:visual

# View HTML report
npm run visual:report
```

---

## 📁 DIRECTORY STRUCTURE

```
tests/visual/
├── README.md                    # This file
├── .gitignore                   # Git ignore rules
│
├── visual-regression.spec.ts    # Main test suite (1,049 lines)
├── baseline-manager.ts          # Baseline management CLI (733 lines)
│
├── baselines/                   # Git-tracked baseline screenshots
│   ├── homepage-desktop_desktop-1920x1080_chromium.png
│   ├── farm-listings_mobile-375x667_chromium.png
│   ├── ...
│   ├── .metadata/              # JSON metadata for each baseline
│   │   ├── homepage-desktop_desktop-1920x1080_chromium.json
│   │   └── ...
│   └── .archive/               # Archived old baselines (gitignored)
│
├── current/                     # Current test run screenshots (gitignored)
│   └── *.png                   # Regenerated each test run
│
└── diffs/                       # Diff images on failures (gitignored)
    ├── .gitignore              # Auto-generated
    └── *.png                   # Red/yellow highlighted differences
```

---

## 🎯 AVAILABLE COMMANDS

### Running Tests

```bash
npm run test:visual              # All tests (6 parallel workers)
npm run test:visual:ui           # Interactive UI mode
npm run test:visual:headed       # See browser during tests
npm run test:visual:debug        # Step-by-step debugging
npm run test:visual:chromium     # Chromium only
npm run test:visual:firefox      # Firefox only
npm run test:visual:webkit       # WebKit only
npm run test:visual:mobile       # Mobile devices only
npm run test:visual:dark         # Dark mode tests only
```

### Baseline Management

```bash
npm run baseline:list            # List all baselines with metadata
npm run baseline:update-all      # Update all baselines (use after UI changes)
npm run baseline:validate        # Validate agricultural consciousness
npm run baseline:archive         # Archive baselines older than 30 days
```

### Reports

```bash
npm run visual:report            # View HTML test report
npm run visual:report:open       # Open report in browser (Windows)
```

---

## 📊 TEST COVERAGE

### 19 Test Scenarios

1. **Homepage Tests** (3)
   - Desktop baseline
   - Mobile baseline
   - Seasonal theme

2. **Farm Listings** (3)
   - Multi-viewport pages
   - Hover states
   - Detail pages

3. **Product Catalog** (3)
   - Grid layout
   - Seasonal badges
   - Filter sidebar

4. **Shopping Cart** (2)
   - Empty state
   - Checkout form

5. **Admin Dashboard** (1)
   - Dashboard layout

6. **Dark Mode** (2)
   - Homepage dark theme
   - Products dark theme

7. **Accessibility** (2)
   - Focus indicators
   - Button states

8. **Images** (1)
   - Responsive loading

9. **Agricultural** (2)
   - Seasonal colors
   - Biodynamic badges

### Total: 84 Visual Checks

- 19 tests × 3 browsers × ~1.5 viewports = 84 checks

---

## 🎨 WRITING TESTS

### Basic Pattern

```typescript
import { test, expect } from "@playwright/test";

test("should match [component] baseline", async ({ page, browserName }) => {
  const utils = new VisualTestingUtils();

  await page.goto("/your-page");
  await page.waitForSelector('[data-testid="content"]');
  await utils.waitForAnimations(page);

  const currentPath = utils.getScreenshotPath(
    "test-name",
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await page.screenshot({ path: currentPath, fullPage: true });

  const baselinePath = utils.getScreenshotPath(
    "test-name",
    "desktop-1920x1080",
    browserName,
    "baseline",
  );
  const diffPath = utils.getScreenshotPath(
    "test-name",
    "desktop-1920x1080",
    browserName,
    "diff",
  );

  const result = await utils.compareScreenshots(
    baselinePath,
    currentPath,
    diffPath,
    0.1, // 0.1% threshold
  );

  expect(result.passed).toBeTruthy();
});
```

### Hide Dynamic Content

```typescript
await utils.hideDynamicContent(page, [
  '[data-testid="timestamp"]',
  '[data-testid="online-counter"]',
  '[data-testid="live-updates"]',
]);
```

### Mask Sensitive Data

```typescript
await utils.maskContent(page, [
  '[data-testid="email"]',
  '[data-testid="phone"]',
  'input[type="email"]',
]);
```

---

## 🛠️ UPDATING BASELINES

### When UI Changes Are Intentional

```bash
# 1. Make your UI changes
# 2. Run tests (they will fail)
npm run test:visual

# 3. Review diff images in tests/visual/diffs/
# Check each diff carefully!

# 4. If changes look correct, update baselines
npm run test:visual:update

# 5. Commit updated baselines to Git
git add tests/visual/baselines/
git commit -m "chore: update visual baselines after [feature]"
```

### Update Specific Tests Only

```bash
# Update only failing tests matching pattern
npm run test:visual:update -- --grep "homepage"
```

---

## 🌾 AGRICULTURAL CONSCIOUSNESS

### Seasonal Testing

Tests automatically detect current season:

- **SPRING**: March - May
- **SUMMER**: June - August
- **FALL**: September - November
- **WINTER**: December - February

### Validate Consciousness

```bash
npm run baseline:validate

# Output:
# 🌾 Agricultural Consciousness Score: 95/100
# ⚠️  Issues found:
#   - checkout-form: Missing biodynamic mode
```

---

## 🚨 TROUBLESHOOTING

### Tests Failing Unexpectedly

**Problem**: Tests pass locally but fail in CI

**Solution**:

```bash
# Ensure consistent fonts
npx playwright install --with-deps
```

**Problem**: Flaky tests due to animations

**Solution**:

```typescript
// Add animation wait
await utils.waitForAnimations(page);

// Or disable animations
await page.addStyleTag({
  content: `
    * { 
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
  `,
});
```

**Problem**: Dynamic content causing failures

**Solution**:

```typescript
// Hide timestamps, counters, etc.
await utils.hideDynamicContent(page, [
  '[data-testid="timestamp"]',
  '[data-testid="live-counter"]',
]);
```

### Large Diff Directory

```bash
# Clean diffs (they're gitignored)
rm -rf tests/visual/diffs/*.png

# Archive old baselines
npm run baseline:archive 30
```

---

## 📈 METRICS

### Performance

- Single screenshot: 50-200ms
- Full-page screenshot: 200-500ms
- Image comparison: 10-50ms
- Full suite: 2-5 minutes (6 workers)

### Coverage

- **Visual Tests**: 19 scenarios
- **Viewports**: 9 configurations
- **Browsers**: 5 combinations
- **Total Checks**: 84 validations

---

## 🔗 RELATED DOCUMENTATION

- [Complete Implementation Report](../../docs/DAY_12_VISUAL_REGRESSION_TESTING.md)
- [Quick Reference Guide](../../docs/VISUAL_TESTING_QUICK_REFERENCE.md)
- [Playwright Configuration](../../playwright.config.ts)

---

## 🎯 BEST PRACTICES

### ✅ DO

- Wait for animations before screenshots
- Hide timestamps and dynamic counters
- Mask sensitive data (emails, phones)
- Use meaningful test names
- Review diffs before updating baselines
- Test critical user journeys
- Commit baselines to Git

### ❌ DON'T

- Screenshot rapidly changing content
- Include random test data
- Test every viewport combination
- Update baselines blindly
- Commit diff images to Git
- Skip animation waits
- Test in production

---

## 🤝 CONTRIBUTING

When adding new visual tests:

1. Follow existing test patterns
2. Use appropriate viewport configurations
3. Add agricultural consciousness where relevant
4. Update this README if needed
5. Include test in appropriate describe block
6. Add meaningful assertions

---

## 📞 SUPPORT

For questions or issues:

- Review [Troubleshooting Guide](../../docs/DAY_12_VISUAL_REGRESSION_TESTING.md#troubleshooting)
- Check [Quick Reference](../../docs/VISUAL_TESTING_QUICK_REFERENCE.md)
- Run: `npm run baseline:validate` for consciousness check

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: PRODUCTION READY 🎨🌾
