# 🤖 Farmers Market Platform - Bot System Documentation

> **Version**: 2.0.0  
> **Last Updated**: January 2025  
> **Platform**: https://farmers-market-platform.vercel.app

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Bot Components](#bot-components)
5. [Analysis Modules](#analysis-modules)
6. [Usage Guide](#usage-guide)
7. [Configuration](#configuration)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Farmers Market Platform uses a **Unified Bot Framework** for automated testing, monitoring, and analysis. This system provides:

| Feature | Description |
|---------|-------------|
| **🎯 MVP Validation** | Complete feature verification for production readiness |
| **🤖 Automation Testing** | User journey automation (farmers, customers, admins) |
| **🔍 Health Monitoring** | Continuous endpoint and flow validation |
| **📊 Analysis** | Performance, SEO, accessibility, and structure analysis |
| **📈 Reporting** | JSON, Markdown, and Console reports |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BOT CLI (Entry Point)                        │
│                      scripts/bot-cli.ts                             │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐
│  MVP Validation │   │ MVP Automation  │   │  Website Checker Bot    │
│      Bot        │   │      Bot        │   │  (Health Monitoring)    │
│                 │   │                 │   │                         │
│ • Full MVP test │   │ • User flows    │   │ • Endpoint health       │
│ • Feature verify│   │ • E2E journeys  │   │ • Performance checks    │
│ • Security check│   │ • Auth flows    │   │ • Continuous monitor    │
└────────┬────────┘   └────────┬────────┘   └────────────┬────────────┘
         │                     │                         │
         └─────────────────────┴─────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CORE LIBRARIES                               │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│  lib/testing/       │  lib/monitoring/    │  lib/testing/config/    │
│  core/bot-engine.ts │  bot.ts             │  bot-config.ts          │
│                     │                     │                         │
│  • Module execution │  • Workflow monitor │  • Default settings     │
│  • Event handling   │  • Report generator │  • Credentials          │
│  • Retry logic      │  • Notifications    │  • Browser options      │
└─────────────────────┴─────────────────────┴─────────────────────────┘
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Run the Bot

```bash
# Using npm script
npm run bot -- test mvp

# Or directly with tsx
npx tsx scripts/bot-cli.ts test mvp
```

### 3. View Reports

```bash
# Check generated reports
cat bot-reports/latest.json

# Or open HTML report
npm run bot -- report --format=html
```

---

## Bot Components

### 📁 File Structure

```
scripts/
├── bot-cli.ts              # 🎮 Main CLI entry point
├── bot-cli.js              # JS wrapper for CLI
├── mvp-validation-bot.ts   # 🎯 Complete MVP feature tests
├── mvp-automation-bot.ts   # 🤖 User journey automation
├── website-checker-bot.ts  # 🔍 Health & monitoring checks
├── seed-for-bot.ts         # 🌱 Database seeding for tests
├── start-server-and-bot.ts # 🚀 Server + bot startup
└── run-mvp-bot-with-check.ts # ✅ Server health wrapper

src/lib/
├── testing/
│   ├── core/
│   │   └── bot-engine.ts   # ⚙️ Core execution engine
│   ├── config/
│   │   └── bot-config.ts   # ⚙️ Configuration management
│   └── types/              # TypeScript definitions
└── monitoring/
    └── bot.ts              # 📊 Workflow monitoring bot
```

### 🤖 Bot Descriptions

#### 1. **bot-cli.ts** - Unified CLI Interface
The main entry point for all bot operations.

**Commands:**
| Command | Description | Example |
|---------|-------------|---------|
| `test [suite]` | Run test suite | `bot test mvp` |
| `monitor` | Start continuous monitoring | `bot monitor --interval=60` |
| `report` | Generate report | `bot report --format=html` |
| `list` | List available suites | `bot list` |
| `config` | Show configuration | `bot config` |
| `seed` | Seed test data | `bot seed` |
| `server` | Start server + tests | `bot server mvp` |

#### 2. **mvp-validation-bot.ts** - MVP Feature Validation
Validates ALL MVP requirements for production readiness:

- ✅ Farmers can register and get approved
- ✅ Farmers can add/edit products with photos
- ✅ Customers can browse and search products
- ✅ Customers can add to cart and checkout
- ✅ Payments process successfully via Stripe
- ✅ Orders appear in farmer dashboard
- ✅ Email notifications work
- ✅ Admin can manage farms and orders
- ✅ Site works on mobile phones
- ✅ All critical security measures in place

#### 3. **mvp-automation-bot.ts** - User Journey Automation
Tests complete user flows:

- 🛒 **Customer Flow**: Browse → Search → Cart → Checkout
- 🚜 **Farmer Flow**: Register → Farm Setup → Product Listing
- 👨‍💼 **Admin Flow**: User Management → Farm Verification
- 🔌 **API Flow**: Endpoint health checks

#### 4. **website-checker-bot.ts** - Health Monitoring
Continuous monitoring and validation:

- 🏥 Health check endpoints
- ⚡ Performance monitoring
- 🔗 Critical flow validation
- 💾 Database connectivity
- 📡 API endpoint testing

---

## Analysis Modules

The bot system includes **10 analysis modules**:

### 📊 Module Overview

| # | Module | Checks |
|---|--------|--------|
| 1 | ⚡ **Performance** | Load time, FCP, LCP, resource metrics |
| 2 | 🏗️ **Structure** | Navigation, headings, sections, layout |
| 3 | 🚜 **Farmer Features** | Dashboard, forms, product management, authentication |
| 4 | 🛒 **Customer Features** | Search, products, cart, filters, checkout |
| 5 | 📦 **Product Pages** | Details, pricing, images, descriptions, availability |
| 6 | 🔍 **SEO** | Meta tags, H1s, structured data, OG tags, robots |
| 7 | ♿ **Accessibility** | Alt text, labels, heading hierarchy, ARIA |
| 8 | 🔌 **API Health** | Endpoint status, response times, error rates |
| 9 | 📱 **Responsiveness** | Mobile, tablet, desktop viewport tests |
| 10 | 📋 **Forms** | Count, fields, validation, submission |

### 📈 Output Formats

**Console Output:**
```
📊 Analyzing Performance...
✅ Load time: 1234ms
✅ FCP: 450ms
✅ LCP: 890ms

🛒 Analyzing Customer Features...
✅ Search: ✓
✅ Products: ✓
✅ Filters: ✓
✅ Cart: ✓
```

**JSON Report:**
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "url": "https://farmers-market-platform.vercel.app",
  "performance": {
    "loadTime": "1234ms",
    "fcp": "450ms",
    "lcp": "890ms",
    "status": "✅ Good"
  },
  "customerFeatures": {
    "hasSearchBar": true,
    "hasCart": true,
    "hasFilters": true,
    "productCount": 24
  },
  "seo": {
    "title": "Farmers Market Platform",
    "description": "Fresh local produce...",
    "hasH1": true,
    "issues": []
  },
  "accessibility": {
    "score": 95,
    "issues": 2,
    "warnings": 5
  }
}
```

---

## Usage Guide

### Basic Commands

```bash
# Run MVP validation tests
npm run bot -- test mvp

# Run quick health check
npm run bot -- test health

# Run with visible browser (debugging)
npm run bot -- test mvp --headless=false

# Run specific modules
npm run bot -- test --modules=auth,cart

# Start continuous monitoring (every 60 seconds)
npm run bot -- monitor --interval=60

# Test against production
npm run bot -- test mvp --baseUrl=https://farmers-market-platform.vercel.app
```

### Environment Variables

```bash
# Required
TEST_USER_PASSWORD=YourSecurePassword123!

# Optional
BASE_URL=http://localhost:3001
HEADLESS=true
SLOW_MO=500
ADMIN_EMAIL=admin@farmersmarket.app
ADMIN_PASSWORD=AdminPassword123!
```

### NPM Scripts

```json
{
  "bot": "tsx scripts/bot-cli.ts",
  "bot:mvp": "tsx scripts/mvp-validation-bot.ts",
  "bot:auto": "tsx scripts/mvp-automation-bot.ts",
  "bot:check": "tsx scripts/website-checker-bot.ts",
  "bot:seed": "tsx scripts/seed-for-bot.ts",
  "bot:server": "tsx scripts/start-server-and-bot.ts"
}
```

---

## Configuration

### Default Configuration (`src/lib/testing/config/bot-config.ts`)

```typescript
export const DEFAULT_BOT_CONFIG: BotConfig = {
  // Core settings
  name: "Unified Bot Framework",
  version: "1.0.0",
  baseUrl: process.env.BASE_URL || "http://localhost:3001",

  // Browser settings
  browser: {
    headless: process.env.HEADLESS !== "false",
    slowMo: parseInt(process.env.SLOW_MO || "0"),
    timeout: 60000,
    viewport: { width: 1920, height: 1080 },
  },

  // Execution settings
  execution: {
    mode: "suite",
    parallel: false,
    retries: 2,
    retryDelay: 2000,
    continueOnFailure: true,
  },

  // Reporting settings
  reporting: {
    enabled: true,
    formats: ["json", "markdown", "console"],
    outputDir: "./bot-reports",
    screenshotOnFailure: true,
  },
};
```

### Test Data Configuration

```typescript
testData: {
  credentials: {
    admin: {
      email: "admin@farmersmarket.app",
      password: process.env.ADMIN_PASSWORD || "DivineAdmin123!",
    },
    farmer: {
      email: "farmer.existing@farmersmarket.test",
      password: process.env.TEST_USER_PASSWORD,
    },
    customer: {
      email: "", // Generated dynamically
      password: process.env.TEST_USER_PASSWORD,
    },
  },
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/bot-tests.yml
name: Bot Tests

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  bot-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install chromium
      
      - name: Seed database
        run: npm run bot -- seed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Run bot tests
        run: npm run bot -- test mvp
        env:
          BASE_URL: https://farmers-market-platform.vercel.app
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          HEADLESS: true
      
      - name: Upload reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: bot-reports
          path: |
            bot-reports/
            mvp-validation-reports/
            mvp-validation-screenshots/
```

### Vercel Deployment Hook

```bash
# Post-deployment test
curl -X POST \
  https://your-server.com/api/webhooks/vercel \
  -H "Content-Type: application/json" \
  -d '{"event": "deployment.succeeded", "url": "https://farmers-market-platform.vercel.app"}'
```

### Cron Job (Daily Monitoring)

```bash
# crontab -e
# Run every day at 9 AM
0 9 * * * cd /path/to/project && npm run bot -- test health >> /var/log/bot.log 2>&1
```

---

## Troubleshooting

### Common Issues

#### 1. Server Not Running
```bash
❌ ERROR: Server not responding at http://localhost:3001

# Solution: Start the server first
npm run dev

# Or use the combined script
npm run bot -- server mvp
```

#### 2. Missing Test Password
```bash
❌ ERROR: TEST_USER_PASSWORD environment variable is required

# Solution: Set the password
export TEST_USER_PASSWORD="YourPassword123!"
# Or use .env.local file
```

#### 3. Browser Not Found
```bash
❌ ERROR: Executable doesn't exist at chromium-xxx

# Solution: Install browsers
npx playwright install chromium
```

#### 4. Timeout Errors
```bash
⚠️ Test timed out after 60000ms

# Solution: Increase timeout or check network
npm run bot -- test mvp --timeout=120000
```

#### 5. Database Connection Failed
```bash
❌ ERROR: Can't reach database server

# Solution: Check DATABASE_URL
echo $DATABASE_URL
# Ensure PostgreSQL is running
```

### Debug Mode

```bash
# Run with visible browser and slow motion
npm run bot -- test mvp --headless=false --slowMo=1000

# Enable verbose logging
DEBUG=bot:* npm run bot -- test mvp

# Take screenshots on every step
SCREENSHOT_ALL=true npm run bot -- test mvp
```

### Logs Location

```
bot-reports/
├── latest.json              # Latest test results
├── logs/
│   └── bot.log             # Execution logs
└── screenshots/            # Failure screenshots

mvp-validation-reports/      # MVP validation reports
mvp-validation-screenshots/  # MVP test screenshots
```

---

## 🎯 Best Practices

### 1. Before Deployment
```bash
# Run full MVP validation
npm run bot -- test mvp
```

### 2. After Deployment
```bash
# Quick health check
npm run bot -- test health --baseUrl=https://your-production-url.com
```

### 3. Continuous Monitoring
```bash
# Start monitoring daemon
npm run bot -- monitor --interval=300
```

### 4. Debug Failed Tests
```bash
# Run specific test with debugging
npm run bot -- test auth --headless=false --slowMo=500
```

---

## 📚 Related Documentation

- [Testing & Performance Mastery](.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md)
- [CI/CD Pipeline](.github/workflows/ci.yml)
- [Playwright Configuration](playwright.config.ts)
- [Project Rules](.cursorrules)

---

## 🤝 Contributing

When adding new bot modules:

1. Create module in `src/lib/testing/modules/`
2. Register in `bot-engine.ts`
3. Add CLI command in `bot-cli.ts`
4. Update this documentation
5. Add tests for the module

---

**🌾 Happy Testing! May your tests be green and your deployments smooth. 🌾**