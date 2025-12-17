# 🎨 VISUAL REGRESSION TESTING - QUICK REFERENCE GUIDE

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: PRODUCTION READY

---

## 🚀 QUICK START (3 STEPS)

```bash
# 1. Create initial baselines (first time only)
npm run test:visual:update

# 2. Run visual tests
npm run test:visual

# 3. View results
npm run visual:report
```

---

## 📋 COMMON COMMANDS

### Running Tests

```bash
# Run all visual tests (6 parallel workers)
npm run test:visual

# Run with UI mode (interactive debugging)
npm run test:visual:ui

# Run in headed mode (see browser)
npm run test:visual:headed

# Debug specific test
npm run test:visual:debug

# Run specific browser
npm run test:visual:chromium
npm run test:visual:firefox
npm run test:visual:webkit

# Mobile-only tests
npm run test:visual:mobile

# Dark mode tests
npm run test:visual:dark
```

### Baseline Management

```bash
# List all baselines
npm run baseline:list

# Update ALL baselines (use after intentional UI changes)
npm run test:visual:update

# Validate agricultural consciousness
npm run baseline:validate

# Archive old baselines (30+ days)
npm run baseline:archive
```

### Reports

```bash
# View HTML report
npm run visual:report

# Open report in browser (Windows)
npm run visual:report:open
```

---

## 🎯 COPY-PASTE TEST PATTERNS

### Pattern 1: Basic Full-Page Screenshot

```typescript
import { test, expect } from "@playwright/test";

test("should match [page-name] baseline", async ({ page, browserName }) => {
  const utils = new VisualTestingUtils();
  const viewport = VIEWPORTS.desktop;

  await page.setViewportSize(viewport);
  await page.goto("/your-page");

  // Wait for main content
  await page.waitForSelector('[data-testid="main-content"]');
  await utils.waitForAnimations(page);

  // Take screenshot
  const currentPath = utils.getScreenshotPath(
    "page-name",
    viewport.name,
    browserName,
    "current",
  );
  await page.screenshot({ path: currentPath, fullPage: true });

  // Compare with baseline
  const baselinePath = utils.getScreenshotPath(
    "page-name",
    viewport.name,
    browserName,
    "baseline",
  );
  const diffPath = utils.getScreenshotPath(
    "page-name",
    viewport.name,
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

### Pattern 2: Component Screenshot

```typescript
test("should match [component-name] appearance", async ({
  page,
  browserName,
}) => {
  const utils = new VisualTestingUtils();

  await page.goto("/page-with-component");
  await page.waitForSelector('[data-testid="component"]');

  // Screenshot just the component
  const component = page.locator('[data-testid="component"]').first();
  const currentPath = utils.getScreenshotPath(
    "component-name",
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await component.screenshot({ path: currentPath });

  const result = await utils.compareScreenshots(
    utils.getScreenshotPath(
      "component-name",
      "desktop-1920x1080",
      browserName,
      "baseline",
    ),
    currentPath,
    utils.getScreenshotPath(
      "component-name",
      "desktop-1920x1080",
      browserName,
      "diff",
    ),
  );

  expect(result.passed).toBeTruthy();
});
```

### Pattern 3: Interactive State Capture (Hover/Focus)

```typescript
test("should match [element] hover state", async ({ page, browserName }) => {
  const utils = new VisualTestingUtils();

  await page.goto("/page");
  await page.waitForSelector('[data-testid="interactive-element"]');

  const element = page.locator('[data-testid="interactive-element"]').first();

  // Hover over element
  await element.hover();
  await page.waitForTimeout(500); // Wait for hover animation

  const currentPath = utils.getScreenshotPath(
    "element-hover",
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await element.screenshot({ path: currentPath });

  const result = await utils.compareScreenshots(
    utils.getScreenshotPath(
      "element-hover",
      "desktop-1920x1080",
      browserName,
      "baseline",
    ),
    currentPath,
    utils.getScreenshotPath(
      "element-hover",
      "desktop-1920x1080",
      browserName,
      "diff",
    ),
  );

  expect(result.passed).toBeTruthy();
});
```

### Pattern 4: Multi-Viewport Testing

```typescript
test("should match [page] across all viewports", async ({
  page,
  browserName,
}) => {
  const utils = new VisualTestingUtils();
  const viewportsToTest = [
    VIEWPORTS.desktop,
    VIEWPORTS.tabletLandscape,
    VIEWPORTS.mobile,
  ];

  for (const viewport of viewportsToTest) {
    await page.setViewportSize(viewport);
    await page.goto("/page");

    await page.waitForSelector('[data-testid="content"]');
    await utils.waitForAnimations(page);

    const currentPath = utils.getScreenshotPath(
      "page-name",
      viewport.name,
      browserName,
      "current",
    );
    await page.screenshot({ path: currentPath, fullPage: true });

    const result = await utils.compareScreenshots(
      utils.getScreenshotPath(
        "page-name",
        viewport.name,
        browserName,
        "baseline",
      ),
      currentPath,
      utils.getScreenshotPath("page-name", viewport.name, browserName, "diff"),
    );

    expect(result.passed).toBeTruthy();
  }
});
```

### Pattern 5: Dark Mode Testing

```typescript
test("should match [page] in dark mode", async ({ page, browserName }) => {
  const utils = new VisualTestingUtils();

  // Enable dark mode
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/page");

  await page.waitForSelector('[data-testid="content"]');
  await utils.waitForAnimations(page);

  const currentPath = utils.getScreenshotPath(
    "page-dark-mode",
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await page.screenshot({ path: currentPath, fullPage: true });

  const result = await utils.compareScreenshots(
    utils.getScreenshotPath(
      "page-dark-mode",
      "desktop-1920x1080",
      browserName,
      "baseline",
    ),
    currentPath,
    utils.getScreenshotPath(
      "page-dark-mode",
      "desktop-1920x1080",
      browserName,
      "diff",
    ),
  );

  expect(result.passed).toBeTruthy();
});
```

### Pattern 6: Hide Dynamic Content

```typescript
test("should match [page] with stable content", async ({
  page,
  browserName,
}) => {
  const utils = new VisualTestingUtils();

  await page.goto("/page");
  await page.waitForSelector('[data-testid="content"]');
  await utils.waitForAnimations(page);

  // Hide timestamps, counters, and other dynamic content
  await utils.hideDynamicContent(page, [
    '[data-testid="timestamp"]',
    '[data-testid="online-counter"]',
    '[data-testid="live-updates"]',
    ".real-time-data",
  ]);

  const currentPath = utils.getScreenshotPath(
    "page-stable",
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await page.screenshot({ path: currentPath, fullPage: true });

  const result = await utils.compareScreenshots(
    utils.getScreenshotPath(
      "page-stable",
      "desktop-1920x1080",
      browserName,
      "baseline",
    ),
    currentPath,
    utils.getScreenshotPath(
      "page-stable",
      "desktop-1920x1080",
      browserName,
      "diff",
    ),
  );

  expect(result.passed).toBeTruthy();
});
```

### Pattern 7: Mask Sensitive Data

```typescript
test("should match [page] with masked sensitive data", async ({
  page,
  browserName,
}) => {
  const utils = new VisualTestingUtils();

  await page.goto("/profile");
  await page.waitForSelector('[data-testid="profile-content"]');

  // Mask emails, phone numbers, addresses
  await utils.maskContent(page, [
    '[data-testid="email"]',
    '[data-testid="phone"]',
    '[data-testid="address"]',
    'input[type="email"]',
    'input[type="tel"]',
  ]);

  const currentPath = utils.getScreenshotPath(
    "profile-masked",
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await page.screenshot({ path: currentPath, fullPage: true });

  const result = await utils.compareScreenshots(
    utils.getScreenshotPath(
      "profile-masked",
      "desktop-1920x1080",
      browserName,
      "baseline",
    ),
    currentPath,
    utils.getScreenshotPath(
      "profile-masked",
      "desktop-1920x1080",
      browserName,
      "diff",
    ),
  );

  expect(result.passed).toBeTruthy();
});
```

### Pattern 8: Seasonal Theme Testing

```typescript
test("should match [page] with seasonal theme", async ({
  page,
  browserName,
}) => {
  const utils = new VisualTestingUtils();
  const season = utils.getCurrentSeason(); // Auto-detects SPRING/SUMMER/FALL/WINTER

  await page.goto("/page");
  await page.waitForSelector('[data-testid="content"]');
  await utils.waitForAnimations(page);

  // Verify seasonal indicator is present
  const seasonalBadge = page.locator('[data-testid="seasonal-indicator"]');
  if (await seasonalBadge.isVisible()) {
    await expect(seasonalBadge).toContainText(season);
  }

  const currentPath = utils.getScreenshotPath(
    `page-seasonal-${season.toLowerCase()}`,
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await page.screenshot({ path: currentPath, fullPage: true });

  const result = await utils.compareScreenshots(
    utils.getScreenshotPath(
      `page-seasonal-${season.toLowerCase()}`,
      "desktop-1920x1080",
      browserName,
      "baseline",
    ),
    currentPath,
    utils.getScreenshotPath(
      `page-seasonal-${season.toLowerCase()}`,
      "desktop-1920x1080",
      browserName,
      "diff",
    ),
  );

  expect(result.passed).toBeTruthy();
});
```

### Pattern 9: Accessibility Focus Indicators

```typescript
test("should match focus indicators on [element]", async ({
  page,
  browserName,
}) => {
  const utils = new VisualTestingUtils();

  await page.goto("/page");

  // Tab to focus element
  await page.keyboard.press("Tab");
  await page.waitForTimeout(300); // Wait for focus styles

  const currentPath = utils.getScreenshotPath(
    "element-focus",
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await page.screenshot({ path: currentPath });

  const result = await utils.compareScreenshots(
    utils.getScreenshotPath(
      "element-focus",
      "desktop-1920x1080",
      browserName,
      "baseline",
    ),
    currentPath,
    utils.getScreenshotPath(
      "element-focus",
      "desktop-1920x1080",
      browserName,
      "diff",
    ),
  );

  expect(result.passed).toBeTruthy();
});
```

### Pattern 10: Disable Animations for Stable Screenshots

```typescript
test("should match [page] with disabled animations", async ({
  page,
  browserName,
}) => {
  const utils = new VisualTestingUtils();

  await page.goto("/page");

  // Disable all animations and transitions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });

  await page.waitForSelector('[data-testid="content"]');

  const currentPath = utils.getScreenshotPath(
    "page-no-animations",
    "desktop-1920x1080",
    browserName,
    "current",
  );
  await page.screenshot({ path: currentPath, fullPage: true });

  const result = await utils.compareScreenshots(
    utils.getScreenshotPath(
      "page-no-animations",
      "desktop-1920x1080",
      browserName,
      "baseline",
    ),
    currentPath,
    utils.getScreenshotPath(
      "page-no-animations",
      "desktop-1920x1080",
      browserName,
      "diff",
    ),
  );

  expect(result.passed).toBeTruthy();
});
```

---

## 🛠️ UTILITY FUNCTIONS

### VisualTestingUtils Class

```typescript
import { Page } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import * as fs from "fs";
import * as path from "path";

class VisualTestingUtils {
  private baselineDir: string;
  private diffsDir: string;
  private currentDir: string;

  constructor() {
    this.baselineDir = path.join(__dirname, "baselines");
    this.diffsDir = path.join(__dirname, "diffs");
    this.currentDir = path.join(__dirname, "current");
  }

  getScreenshotPath(
    testName: string,
    viewport: string,
    browser: string,
    type: "baseline" | "current" | "diff",
  ): string {
    const sanitizedName = testName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const filename = `${sanitizedName}_${viewport}_${browser}.png`;

    switch (type) {
      case "baseline":
        return path.join(this.baselineDir, filename);
      case "current":
        return path.join(this.currentDir, filename);
      case "diff":
        return path.join(this.diffsDir, filename);
    }
  }

  async compareScreenshots(
    baselinePath: string,
    currentPath: string,
    diffPath: string,
    threshold: number = 0.1,
  ): Promise<{ passed: boolean; diffPercentage: number; diffPath?: string }> {
    if (!fs.existsSync(baselinePath)) {
      fs.copyFileSync(currentPath, baselinePath);
      return { passed: true, diffPercentage: 0 };
    }

    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    const currentImg = PNG.sync.read(fs.readFileSync(currentPath));
    const { width, height } = baselineImg;
    const diffImg = new PNG({ width, height });

    const diffPixels = pixelmatch(
      baselineImg.data,
      currentImg.data,
      diffImg.data,
      width,
      height,
      { threshold },
    );

    const totalPixels = width * height;
    const diffPercentage = (diffPixels / totalPixels) * 100;

    if (diffPixels > 0) {
      fs.writeFileSync(diffPath, PNG.sync.write(diffImg));
    }

    return {
      passed: diffPercentage <= threshold,
      diffPercentage,
      diffPath: diffPixels > 0 ? diffPath : undefined,
    };
  }

  async waitForAnimations(page: Page): Promise<void> {
    await page.evaluate(() => {
      return Promise.all(
        document.getAnimations().map((animation) => animation.finished),
      );
    });
  }

  async hideDynamicContent(page: Page, selectors: string[]): Promise<void> {
    for (const selector of selectors) {
      await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        elements.forEach((el) => {
          (el as HTMLElement).style.visibility = "hidden";
        });
      }, selector);
    }
  }

  async maskContent(page: Page, selectors: string[]): Promise<void> {
    for (const selector of selectors) {
      await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        elements.forEach((el) => {
          (el as HTMLElement).style.filter = "blur(8px)";
        });
      }, selector);
    }
  }

  getCurrentSeason(): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }
}
```

---

## 🎨 VIEWPORT CONFIGURATIONS

```typescript
const VIEWPORTS = {
  // Desktop
  desktop: { width: 1920, height: 1080, name: "desktop-1920x1080" },
  desktopLarge: { width: 2560, height: 1440, name: "desktop-2560x1440" },
  laptop: { width: 1366, height: 768, name: "laptop-1366x768" },

  // Tablet
  tabletLandscape: { width: 1024, height: 768, name: "tablet-landscape" },
  tabletPortrait: { width: 768, height: 1024, name: "tablet-portrait" },
  ipadPro: { width: 1024, height: 1366, name: "ipad-pro" },

  // Mobile
  mobile: { width: 375, height: 667, name: "mobile-375x667" },
  mobileLarge: { width: 414, height: 896, name: "mobile-414x896" },
  mobileSmall: { width: 320, height: 568, name: "mobile-320x568" },
};
```

---

## 🔧 BASELINE MANAGEMENT CLI

### List Baselines

```bash
npm run baseline:list
```

**Output**:

```
Found 45 baselines
  - homepage-desktop (desktop-1920x1080, chromium)
  - homepage-mobile (mobile-375x667, chromium)
  - farm-listings (desktop-1920x1080, firefox)
  ...
```

### Update All Baselines

```bash
npm run baseline:update-all
# or
npm run baseline:update-all ./tests/visual/current
```

**Output**:

```
╔════════════════════════════════════════════════════════════╗
║ 🌾 BASELINE UPDATE REPORT                                  ║
╠════════════════════════════════════════════════════════════╣
║ Total Baselines: 48
║ Added: 3
║ Modified: 5
║ Removed: 0
║ Unchanged: 40
║
║ Agricultural Consciousness Score: 100/100 🌾
╚════════════════════════════════════════════════════════════╝
```

### Validate Agricultural Consciousness

```bash
npm run baseline:validate
```

**Output**:

```
🌾 Agricultural Consciousness Score: 95/100

⚠️  Issues found:
  - checkout-form: Missing biodynamic mode in agricultural context
  - admin-dashboard: Missing seasonal awareness
```

### Archive Old Baselines

```bash
npm run baseline:archive       # Archives baselines older than 30 days
npm run baseline:archive 60    # Archives baselines older than 60 days
```

**Output**:

```
📦 Archived 12 baselines older than 30 days
```

---

## 🚨 TROUBLESHOOTING

### Flaky Tests

**Problem**: Tests pass/fail randomly

**Solutions**:

```typescript
// 1. Wait for animations
await utils.waitForAnimations(page);

// 2. Disable animations
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
  `,
});

// 3. Hide dynamic content
await utils.hideDynamicContent(page, [
  '[data-testid="timestamp"]',
  '[data-testid="live-counter"]',
]);

// 4. Wait for network idle
await page.waitForLoadState("networkidle");
```

### Dimension Mismatch

**Problem**: `Image dimensions mismatch: baseline 1920x1080 vs current 1920x1079`

**Solutions**:

```bash
# Option 1: Update specific baseline
npm run test:visual:update -- --grep "failing-test-name"

# Option 2: Update all baselines
npm run baseline:update-all

# Option 3: Delete and recreate baseline
rm tests/visual/baselines/failing-test_*.png
npm run test:visual:update
```

### Font Rendering Differences

**Problem**: Text appears different between local and CI

**Solutions**:

```bash
# Install consistent fonts in CI (add to Dockerfile or GitHub Actions)
apt-get install -y fonts-liberation fonts-noto-color-emoji

# Or use Playwright's font installation
npx playwright install --with-deps
```

### Large Diff Directory

**Problem**: `tests/visual/diffs/` growing large

**Solutions**:

```bash
# Clean diffs (they're gitignored)
rm -rf tests/visual/diffs/*.png

# Archive old baselines
npm run baseline:archive 7
```

---

## 📊 CI/CD INTEGRATION

### GitHub Actions Example

```yaml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main, develop]

jobs:
  visual-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run visual tests
        run: npm run test:visual:ci

      - name: Upload diffs on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: tests/visual/diffs/
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm run test:visual:chromium || {
  echo "❌ Visual tests failed. Check: tests/visual/diffs/"
  exit 1
}
```

---

## 🎯 BEST PRACTICES

### ✅ DO

- Wait for animations to complete
- Hide timestamps and counters
- Mask sensitive data (emails, phones)
- Use meaningful test names
- Review diff images before updating baselines
- Test critical user journeys
- Use approval workflow for important changes

### ❌ DON'T

- Screenshot rapidly changing content
- Include random data in screenshots
- Test every viewport combination
- Update baselines blindly
- Commit diff images to Git
- Skip animation waits
- Test in production

---

## 📚 CHEAT SHEET

| Task                  | Command                        |
| --------------------- | ------------------------------ |
| Run all tests         | `npm run test:visual`          |
| Update baselines      | `npm run test:visual:update`   |
| View report           | `npm run visual:report`        |
| List baselines        | `npm run baseline:list`        |
| Validate baselines    | `npm run baseline:validate`    |
| Archive old baselines | `npm run baseline:archive`     |
| Debug test            | `npm run test:visual:debug`    |
| Chromium only         | `npm run test:visual:chromium` |
| Mobile only           | `npm run test:visual:mobile`   |
| Dark mode             | `npm run test:visual:dark`     |

---

## 🌾 AGRICULTURAL CONSCIOUSNESS

### Seasonal Testing

```typescript
const season = utils.getCurrentSeason(); // Auto-detects season

test(`should display ${season} theme`, async ({ page }) => {
  await page.goto("/");
  const badge = page.locator('[data-testid="seasonal-indicator"]');
  await expect(badge).toContainText(season);
});
```

### Biodynamic Pattern Validation

```typescript
test("should show biodynamic certification badge", async ({ page }) => {
  await page.goto("/farms?biodynamic=true");
  const badge = page.locator('[data-testid="biodynamic-badge"]').first();
  await expect(badge).toBeVisible();
});
```

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: PRODUCTION READY 🎨🌾
