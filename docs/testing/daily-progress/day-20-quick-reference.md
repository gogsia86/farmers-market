# 🤖 Day 20: AI Visual Testing - Quick Reference

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready 🚀

---

## 🚀 Quick Start (5 Minutes)

### 1. Setup Environment Variables

```bash
# .env.local
AI_PROVIDER=openai                    # or anthropic
OPENAI_API_KEY=sk-proj-...           # Your OpenAI key
AI_MODEL=gpt-4-vision-preview        # or claude-3-opus-20240229
VISUAL_AUTO_HEAL=true                # Enable self-healing
```

### 2. Discover Components

```bash
npm run ai:visual:discover https://localhost:3001/farms
```

### 3. Generate Tests

```bash
npm run ai:visual:generate https://localhost:3001/products
```

### 4. Run Tests

```bash
npm run test:visual:ai
```

### 5. Auto-Heal Failures

```bash
npm run ai:visual:heal
```

**Done!** You now have AI-powered visual testing.

---

## 📋 Common Commands

### AI Operations

```bash
# Discover components
npm run ai:visual:discover <url>

# Generate test scenarios
npm run ai:visual:generate <url> --context '{"season":"SUMMER"}'

# Self-heal baselines
npm run ai:visual:heal

# Analyze specific failure
npm run ai:visual:analyze <test-name>
```

### Run Tests

```bash
# All AI-generated tests
npm run test:visual:ai

# With UI mode
npm run test:visual:ai:ui

# Advanced algorithms
npm run test:visual:advanced

# SSIM only
npm run test:visual:ssim

# Perceptual diff only
npm run test:visual:perceptual
```

### Baseline Management

```bash
# Update all baselines
npm run test:visual:update

# List baselines
npm run baseline:list

# Validate agricultural consciousness
npm run baseline:validate

# View report
npm run visual:report
```

---

## 💻 Code Examples

### Example 1: Basic AI Test Generation

```typescript
import { AIVisualTestGenerator } from "./ai-visual-test-generator";
import { chromium } from "@playwright/test";

const generator = new AIVisualTestGenerator({
  provider: "openai",
  model: "gpt-4-vision-preview",
  apiKey: process.env.OPENAI_API_KEY!,
});

const browser = await chromium.launch();
const page = await browser.newPage();

// Generate test scenarios
const scenarios = await generator.generateTestScenarios(
  page,
  "https://localhost:3001/farms",
  {
    pageType: "farm-listings",
    season: "SUMMER",
    agriculturalFeatures: ["farm-cards", "seasonal-badges"],
  },
);

// Generate test file
const testFile = await generator.generateTestFile(
  scenarios,
  "farm-listings.spec.ts",
);

console.log(`Generated ${scenarios.length} test scenarios`);
console.log(`Test file: ${testFile.filePath}`);

await browser.close();
```

### Example 2: Component Discovery

```typescript
import { AIVisualTestGenerator } from "./ai-visual-test-generator";
import { chromium } from "@playwright/test";

const generator = new AIVisualTestGenerator({
  provider: "anthropic",
  model: "claude-3-opus-20240229",
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const browser = await chromium.launch();
const page = await browser.newPage();

// Discover components
const components = await generator.discoverComponents(
  page,
  "https://localhost:3001/products",
);

console.log(`Discovered ${components.length} components:`);

components.forEach((comp) => {
  console.log(`
  - ${comp.name}
    Selector: ${comp.selector}
    Type: ${comp.type}
    Importance: ${comp.importance}
    States: ${comp.states.join(", ")}
    Agricultural: ${comp.agriculturalContext?.farmRelated ? "Yes" : "No"}
  `);
});

await browser.close();
```

### Example 3: Advanced Visual Comparison

```typescript
import { AdvancedVisualUtils } from "./advanced-visual-utils";

const utils = new AdvancedVisualUtils();

// Multi-algorithm comparison
const result = await utils.compareImages(
  "baselines/homepage.png",
  "current/homepage.png",
  "diffs/homepage.png",
  {
    threshold: 0.1,
    includeAA: false,
    perceptual: true,
    ignoreAntialiasing: true,
    ssimWindow: 11,
  },
);

console.log(`
Comparison Results:
------------------
Passed: ${result.passed}
Similarity: ${(result.similarity * 100).toFixed(2)}%
SSIM: ${result.ssim.toFixed(4)}
Perceptual Diff: ${result.perceptualDiff.toFixed(2)}%
Pixel Diff: ${result.pixelDiff.toFixed(2)}%
Anti-Aliasing: ${result.antiAliasing ? "Detected" : "None"}

Diff Regions: ${result.regions.length}
  ${result.regions
    .slice(0, 3)
    .map((r) => `- ${r.severity}: ${r.description}`)
    .join("\n  ")}

Color Differences: ${result.colorDifferences.length}
  ${result.colorDifferences
    .slice(0, 3)
    .map(
      (cd) =>
        `- ΔE=${cd.deltaE.toFixed(2)} at (${cd.location.x},${cd.location.y})`,
    )
    .join("\n  ")}
`);
```

### Example 4: Self-Healing

```typescript
import { AIVisualTestGenerator } from "./ai-visual-test-generator";

const generator = new AIVisualTestGenerator({
  provider: "openai",
  model: "gpt-4-vision-preview",
  apiKey: process.env.OPENAI_API_KEY!,
});

// Heal single baseline
const healed = await generator.autoHealBaseline(
  "product-catalog-grid",
  "baselines/product-catalog-grid.png",
  "current/product-catalog-grid.png",
  "diffs/product-catalog-grid.png",
);

if (healed) {
  console.log("✅ Baseline auto-healed successfully");
} else {
  console.log("⚠️  Manual review required");
}

// Batch healing
const failedTests = [
  {
    testName: "homepage-desktop",
    baselineImage: "baselines/homepage-desktop.png",
    currentImage: "current/homepage-desktop.png",
    diffImage: "diffs/homepage-desktop.png",
  },
  {
    testName: "farm-listings",
    baselineImage: "baselines/farm-listings.png",
    currentImage: "current/farm-listings.png",
    diffImage: "diffs/farm-listings.png",
  },
  // ... more tests
];

const report = await generator.batchHealBaselines(failedTests);

console.log(`
Self-Healing Report:
-------------------
✅ Healed: ${report.healed} tests
⚠️  Manual Review: ${report.failed} tests
⏭️  Skipped: ${report.skipped} tests

Details:
${report.details
  .map(
    (d) => `
  ${d.status === "healed" ? "✅" : d.status === "failed" ? "⚠️" : "⏭️"} ${d.testName}
     Reason: ${d.reason}
     Confidence: ${d.confidence}%
`,
  )
  .join("")}
`);
```

### Example 5: Smart Element Comparison

```typescript
import { SmartElementComparison } from "./advanced-visual-utils";
import { chromium } from "@playwright/test";

const comparison = new SmartElementComparison();
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("https://localhost:3001/products");

// Compare specific element
const result = await comparison.compareElements(
  page,
  "[data-testid='product-grid']",
  "baselines/product-grid-element.png",
  {
    threshold: 0.1,
    perceptual: true,
  },
);

console.log(`Element comparison: ${result.passed ? "PASSED" : "FAILED"}`);
console.log(`Similarity: ${(result.similarity * 100).toFixed(2)}%`);

// Compare with retry (handles animations)
const resultWithRetry = await comparison.compareWithRetry(
  "baselines/animated-button.png",
  "current/animated-button.png",
  "diffs/animated-button.png",
  { threshold: 0.1 },
  3, // max retries
);

await browser.close();
```

### Example 6: AI Visual Analysis

```typescript
import { AIVisualTestGenerator } from "./ai-visual-test-generator";

const generator = new AIVisualTestGenerator({
  provider: "anthropic",
  model: "claude-3-opus-20240229",
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Analyze visual difference
const analysis = await generator.analyzeVisualDifference(
  "baselines/checkout-form.png",
  "current/checkout-form.png",
  "diffs/checkout-form.png",
);

console.log(`
AI Visual Analysis:
------------------
Description: ${analysis.description}

Detected Elements:
${analysis.detectedElements.map((e) => `  - ${e}`).join("\n")}

Visual Bugs (${analysis.visualBugs.length}):
${analysis.visualBugs
  .map(
    (bug) => `
  ${bug.severity.toUpperCase()}: ${bug.type}
  Location: ${bug.location}
  Description: ${bug.description}
  Fix: ${bug.suggestedFix || "N/A"}
`,
  )
  .join("")}

Accessibility Issues (${analysis.accessibility.length}):
${analysis.accessibility
  .map(
    (issue) => `
  ${issue.severity.toUpperCase()}: ${issue.type}
  Element: ${issue.element}
  Description: ${issue.description}
  WCAG: ${issue.wcagCriteria}
`,
  )
  .join("")}

Suggestions:
${analysis.suggestions.map((s) => `  - ${s}`).join("\n")}

Agricultural Features:
${analysis.agriculturalFeatures.map((f) => `  - ${f}`).join("\n")}

Confidence: ${analysis.confidence}%
`);
```

---

## 🔧 Configuration Snippets

### OpenAI Configuration

```typescript
// tests/visual/config.ts
export const openAIConfig = {
  provider: "openai" as const,
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4-vision-preview",
  maxTokens: 4096,
  temperature: 0.7,
};
```

### Anthropic Configuration

```typescript
// tests/visual/config.ts
export const anthropicConfig = {
  provider: "anthropic" as const,
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-3-opus-20240229",
  maxTokens: 4096,
  temperature: 0.7,
};
```

### Visual Comparison Options

```typescript
// tests/visual/config.ts
export const visualOptions = {
  // Pixel-perfect (for logos, icons)
  pixelPerfect: {
    threshold: 0.01,
    includeAA: false,
    alpha: 0.1,
  },

  // Standard (for most UI)
  standard: {
    threshold: 0.1,
    includeAA: false,
    alpha: 0.1,
    perceptual: true,
    ignoreAntialiasing: true,
  },

  // Relaxed (for animations)
  relaxed: {
    threshold: 0.2,
    includeAA: false,
    alpha: 0.2,
    perceptual: true,
    ignoreAntialiasing: true,
    ssimWindow: 7,
  },

  // Color-focused
  colorAccuracy: {
    threshold: 0.05,
    perceptual: true,
    algorithm: "deltaE",
  },
};
```

### Self-Healing Configuration

```typescript
// tests/visual/config.ts
export const selfHealingConfig = {
  enabled: true,
  confidenceThreshold: 85,
  requireManualReview: [
    "checkout",
    "payment",
    "authentication",
    "critical-user-journey",
  ],
  backupBaselines: true,
  notifyTeam: true,
  slackWebhook: process.env.SLACK_WEBHOOK_URL,
  maxAutoHeals: 50, // Per run
};
```

---

## 🚨 Troubleshooting

### Issue: AI API Key Not Working

```bash
Error: Invalid API key
```

**Solution:**

```bash
# Check environment variable
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Set in .env.local
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Restart dev server
npm run dev
```

### Issue: Rate Limit Exceeded

```bash
Error: Rate limit exceeded (429)
```

**Solution:**

```typescript
// Add retry logic with exponential backoff
async function callAIWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Use it
const scenarios = await callAIWithRetry(() =>
  generator.generateTestScenarios(page, url, context),
);
```

### Issue: High False Positive Rate

```bash
Test: product-grid
Status: FAILED (but looks identical)
```

**Solution:**

```typescript
// Option 1: Increase threshold
const result = await utils.compareImages(baseline, current, diff, {
  threshold: 0.2, // Was 0.1
  ssimThreshold: 0.93, // Was 0.95
});

// Option 2: Enable anti-aliasing detection
const result = await utils.compareImages(baseline, current, diff, {
  ignoreAntialiasing: true,
  includeAA: false,
});

// Option 3: Use perceptual diff
const result = await utils.compareImages(baseline, current, diff, {
  perceptual: true,
  algorithm: "ssim",
});

// Option 4: Hide dynamic content
await page.evaluate(() => {
  document.querySelectorAll("[data-testid='timestamp']").forEach((el) => {
    (el as HTMLElement).style.visibility = "hidden";
  });
});
```

### Issue: SSIM Calculation Slow

```bash
SSIM: 2.5s per image (too slow)
```

**Solution:**

```typescript
// Option 1: Reduce window size
const result = await utils.compareImages(baseline, current, diff, {
  ssimWindow: 7, // Was 11
});

// Option 2: Skip SSIM for non-critical tests
if (test.priority < 7) {
  // Use basic pixelmatch only
  const result = await basicCompare(baseline, current, diff);
} else {
  // Use full multi-algorithm
  const result = await utils.compareImages(baseline, current, diff);
}

// Option 3: Cache SSIM results
const cacheKey = `${baselineHash}-${currentHash}`;
if (ssimCache.has(cacheKey)) {
  return ssimCache.get(cacheKey);
}
```

### Issue: Self-Healing Updated Wrong Baseline

```bash
Auto-healed: checkout-form
But: Actual bug was introduced!
```

**Solution:**

```typescript
// Option 1: Increase confidence threshold
selfHealingConfig.confidenceThreshold = 90; // Was 85

// Option 2: Require manual review for critical paths
selfHealingConfig.requireManualReview.push("checkout-form");

// Option 3: Enable team notifications
if (healed && test.importance === "critical") {
  await notifySlack({
    message: `🩹 Auto-healed CRITICAL test: ${test.name}`,
    attachments: [
      { title: "Baseline", image_url: baselineUrl },
      { title: "Current", image_url: currentUrl },
      { title: "Diff", image_url: diffUrl },
    ],
  });
}

// Option 4: Always create backups
selfHealingConfig.backupBaselines = true;

// Option 5: Add review step
if (healed) {
  await createGitHubIssue({
    title: `Review auto-healed baseline: ${test.name}`,
    labels: ["visual-testing", "needs-review"],
  });
}
```

### Issue: AI Generated Low Quality Tests

```bash
Generated tests are too generic
```

**Solution:**

```typescript
// Provide better context
const scenarios = await generator.generateTestScenarios(page, url, {
  pageType: "checkout-flow", // Specific page type
  importance: "critical", // Priority level
  season: "SUMMER", // Agricultural context
  agriculturalFeatures: [
    "seasonal-products",
    "farm-cards",
    "biodynamic-badges",
  ],
  userJourney: "purchase-flow", // Journey context
  testFocus: [
    // What to focus on
    "form-validation",
    "payment-security",
    "order-confirmation",
  ],
});

// Or use more detailed prompts
const customPrompt = `
Analyze this e-commerce checkout page and generate comprehensive test scenarios.

Focus Areas:
1. Form field validation (all states)
2. Payment method selection
3. Shipping address validation
4. Order summary accuracy
5. Tax calculation display
6. Coupon code application
7. Submit button states

Generate 10 high-priority test scenarios covering these areas.
`;
```

### Issue: Out of Memory

```bash
Error: JavaScript heap out of memory
```

**Solution:**

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=8192 npm run test:visual:ai

# Or in package.json
"test:visual:ai": "cross-env NODE_OPTIONS=--max-old-space-size=8192 playwright test tests/visual/ai-generated"

# Reduce parallel workers
npm run test:visual:ai -- --workers=4

# Process in batches
npm run test:visual:ai -- --shard=1/3
npm run test:visual:ai -- --shard=2/3
npm run test:visual:ai -- --shard=3/3
```

---

## 📊 Performance Tips

### Optimize AI Costs

```typescript
// 1. Cache AI responses
const cache = new Map<string, any>();

async function getCachedAIResponse(key: string, fn: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await fn();
  cache.set(key, result);
  return result;
}

// 2. Batch analysis
const failedTests = testResults.filter((t) => !t.passed);
const report = await generator.batchHealBaselines(failedTests);

// 3. Limit API calls per run
let apiCallCount = 0;
const MAX_API_CALLS = 50;

if (apiCallCount >= MAX_API_CALLS) {
  console.log("API limit reached. Using basic comparison.");
  useBasicComparison();
} else {
  apiCallCount++;
  await aiAnalysis();
}

// 4. Use cheaper models for simple tasks
const cheapConfig = {
  provider: "openai",
  model: "gpt-4-turbo", // Cheaper than gpt-4-vision-preview
};
```

### Optimize Comparison Speed

```typescript
// 1. Use element-level comparison
const comparison = new SmartElementComparison();
await comparison.compareElements(
  page,
  "[data-testid='product-grid']",
  baseline,
);

// 2. Skip SSIM for low-priority tests
if (test.priority < 5) {
  options.algorithms = ["pixelmatch"]; // Skip SSIM, PDiff
}

// 3. Parallel processing
const results = await Promise.all(
  tests.map((test) =>
    utils.compareImages(test.baseline, test.current, test.diff),
  ),
);

// 4. Sample instead of full scan
const sampledResult = await utils.compareImages(baseline, current, diff, {
  ssimWindow: 7, // Smaller window
  sampleRate: 0.5, // Sample 50%
});
```

---

## 🎯 Best Practices Checklist

### Test Generation

- [ ] Provide detailed context to AI
- [ ] Set appropriate importance levels
- [ ] Include agricultural context
- [ ] Review generated tests before committing
- [ ] Organize by priority (critical, high, medium, low)

### Visual Comparison

- [ ] Use appropriate algorithm for test type
- [ ] Set realistic thresholds
- [ ] Enable anti-aliasing detection
- [ ] Hide dynamic content (timestamps, counters)
- [ ] Mask sensitive data

### Self-Healing

- [ ] Set conservative confidence threshold (85%+)
- [ ] Require manual review for critical paths
- [ ] Always backup baselines
- [ ] Notify team of auto-heals
- [ ] Log healing decisions

### Cost Optimization

- [ ] Cache AI responses
- [ ] Batch analysis operations
- [ ] Limit API calls per run
- [ ] Use cheaper models when possible
- [ ] Only use AI for failed tests

### Maintenance

- [ ] Review AI-generated tests weekly
- [ ] Update baselines after intentional changes
- [ ] Archive old baselines (30+ days)
- [ ] Monitor false positive/negative rates
- [ ] Keep AI models updated

---

## 📞 Quick Help

### Get Component List

```bash
npm run ai:visual:discover <url>
```

### Generate New Tests

```bash
npm run ai:visual:generate <url>
```

### Fix Failed Tests

```bash
npm run ai:visual:heal
```

### Analyze Failure

```bash
npm run ai:visual:analyze <test-name>
```

### Update Baselines

```bash
npm run test:visual:update
```

### View Report

```bash
npm run visual:report
```

---

## 🔗 Resources

- **Full Documentation**: `tests/DAY_20_AI_VISUAL_TESTING_COMPLETE.md`
- **Visual Testing Basics**: `tests/visual/README.md`
- **API Reference**: `tests/visual/ai-visual-test-generator.ts`
- **Algorithms Deep Dive**: `tests/visual/advanced-visual-utils.ts`

---

**Status**: 🚀 Production Ready  
**Support**: Check documentation or create GitHub issue  
**Version**: 2.0.0 - AI Visual Testing Excellence
