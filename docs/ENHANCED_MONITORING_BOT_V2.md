# 🌟 ENHANCED MONITORING BOT V2.0 - COMPLETE GUIDE

**Version**: 2.0.0  
**Status**: ✅ PRODUCTION READY  
**Last Updated**: 2024

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [Usage](#usage)
6. [Configuration](#configuration)
7. [Checks & Validations](#checks--validations)
8. [Reports & Alerts](#reports--alerts)
9. [CI/CD Integration](#cicd-integration)
10. [Troubleshooting](#troubleshooting)
11. [API Reference](#api-reference)

---

## 🎯 OVERVIEW

The Enhanced Monitoring Bot V2.0 is a comprehensive website health monitoring system designed specifically for the Farmers Market Platform. It performs automated checks across multiple dimensions including performance, SEO, accessibility, security, and agricultural consciousness.

### What's New in V2.0

- ✅ **Comprehensive Page Checks** - Multi-dimensional validation
- ✅ **Core Web Vitals Monitoring** - LCP, FID, CLS, TTFB, TBT
- ✅ **SEO Validation** - Meta tags, structured data, sitemap
- ✅ **Accessibility Audits** - WCAG 2.1 AA compliance
- ✅ **Image Optimization** - Size, alt text, responsive validation
- ✅ **Link Validation** - Broken link detection
- ✅ **API Health Monitoring** - Endpoint response time tracking
- ✅ **Database Health** - Connection and performance checks
- ✅ **Security Headers** - CSP, HSTS, X-Frame-Options validation
- ✅ **Agricultural Consciousness** - Seasonal content validation
- ✅ **Beautiful Reports** - JSON, Markdown, console output
- ✅ **Automated Alerts** - Threshold-based notifications
- ✅ **CI/CD Ready** - Exit codes for pipeline integration

---

## 🚀 FEATURES

### 1. **Page Availability Monitoring**

- HTTP status code validation
- Response time tracking
- Redirect detection
- Error page identification

### 2. **Performance Monitoring**

- **Core Web Vitals**:
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
  - TTFB (Time to First Byte)
  - TBT (Total Blocking Time)
- Page load time
- DOM content loaded time
- Resource count and size
- Performance budget validation

### 3. **SEO Validation**

- **Meta Tags**:
  - Title (presence, length)
  - Description (presence, length)
  - Keywords
  - Open Graph tags (og:title, og:description, og:image)
  - Canonical URL
  - Robots meta
- **Structured Data**:
  - JSON-LD presence
  - Schema types
  - Validation errors
- **Heading Structure**:
  - H1 count
  - Heading hierarchy

### 4. **Accessibility Audits (WCAG 2.1 AA)**

- Image alt text validation
- Form label validation
- Button accessible names
- HTML lang attribute
- Color contrast (simplified)
- WCAG compliance level
- Accessibility score (0-100)

### 5. **Image Optimization**

- Total image count
- Missing alt text detection
- Oversized image detection
- Display vs actual size comparison
- Optimization recommendations

### 6. **Link Validation**

- Total link count
- Internal vs external links
- Broken link detection (404s)
- Slow link detection (>1s)

### 7. **Security Header Validation**

- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- HTTPS enforcement
- Mixed content detection

### 8. **Agricultural Consciousness**

- Seasonal content detection
- Farm data validation
- Product categorization
- Biodynamic indicators
- Agricultural terminology presence

### 9. **API Endpoint Monitoring**

- Response time tracking
- Status code validation
- Error detection
- Slow endpoint identification

### 10. **Database Health**

- Connection status
- Response time
- Pool size monitoring
- Active connection tracking

---

## 🏗️ ARCHITECTURE

### Component Structure

```
Enhanced Monitoring Bot V2.0
│
├── Website Checker (Core Engine)
│   ├── Browser Automation (Playwright)
│   ├── Performance Monitor
│   ├── SEO Validator
│   ├── Accessibility Checker
│   ├── Image Analyzer
│   ├── Link Validator
│   ├── Security Auditor
│   └── Agricultural Validator
│
├── API Monitor
│   ├── Endpoint Checker
│   └── Response Analyzer
│
├── Database Monitor
│   ├── Connection Checker
│   └── Performance Tracker
│
├── Report Generator
│   ├── JSON Reports
│   ├── Markdown Reports
│   └── Console Output
│
└── Alert System
    ├── Threshold Checks
    └── Notification Handler
```

### Data Flow

```
1. Initialize Browser (Playwright/Chromium)
   ↓
2. For Each Page:
   - Load page
   - Run all checks in parallel
   - Collect metrics
   - Take screenshots (on failure)
   ↓
3. Check API Endpoints
   ↓
4. Check Database Health
   ↓
5. Calculate Summary Statistics
   ↓
6. Generate Reports (JSON + Markdown)
   ↓
7. Check Alert Thresholds
   ↓
8. Output Results & Exit with Status Code
```

---

## 📦 INSTALLATION & SETUP

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Install Playwright browsers
npx playwright install chromium
```

### Installation

```bash
# Install dependencies (already in package.json)
npm install

# Make the script executable (Linux/Mac)
chmod +x scripts/monitoring/enhanced-website-monitor.ts
```

### Environment Variables

Create `.env.local`:

```env
# Base URL to monitor
BASE_URL=http://localhost:3001

# Headless mode (true for CI/CD, false for debugging)
HEADLESS=true

# Alert thresholds (optional)
ALERT_PERFORMANCE_THRESHOLD=3000
ALERT_ACCESSIBILITY_THRESHOLD=80
ALERT_ERROR_RATE_THRESHOLD=0.1
```

---

## 🎮 USAGE

### Quick Start

```bash
# Run monitoring on localhost
npm run monitor:website

# Or use tsx directly
npx tsx scripts/monitoring/enhanced-website-monitor.ts
```

### Monitor Specific Environment

```bash
# Development
BASE_URL=http://localhost:3001 npm run monitor:website

# Staging
BASE_URL=https://staging.farmersmarket.com npm run monitor:website

# Production
BASE_URL=https://farmersmarket.com npm run monitor:website
```

### Debug Mode (Visual Browser)

```bash
# Run with visible browser for debugging
HEADLESS=false npm run monitor:website
```

### Check Specific Pages

Modify `MONITOR_CONFIG.pages` in the script:

```typescript
const MONITOR_CONFIG = {
  pages: [
    "/",
    "/farms",
    "/products",
    // Add more pages here
  ],
};
```

---

## ⚙️ CONFIGURATION

### Performance Budgets

Configure in `MONITOR_CONFIG.performanceBudgets`:

```typescript
performanceBudgets: {
  LCP: 2500,        // Largest Contentful Paint (ms)
  FID: 100,         // First Input Delay (ms)
  CLS: 0.1,         // Cumulative Layout Shift (score)
  TTFB: 800,        // Time to First Byte (ms)
  TBT: 300,         // Total Blocking Time (ms)
  pageLoadTime: 3000, // Complete page load (ms)
}
```

### Alert Thresholds

Configure in `MONITOR_CONFIG.alertThresholds`:

```typescript
alertThresholds: {
  performance: 3000,      // Average page load (ms)
  accessibility: 80,      // Minimum accessibility score
  errorRate: 0.1,         // Maximum failure rate (10%)
}
```

### Pages to Monitor

```typescript
pages: [
  // Public pages
  "/",
  "/about",
  "/farms",
  "/products",

  // Farm detail pages
  "/farms/harvest-moon-farm",
  "/farms/sunny-valley-farm",

  // Marketplace
  "/marketplace/farms",
  "/marketplace/products",

  // Auth pages
  "/auth/login",
  "/auth/register",

  // Static pages
  "/privacy",
  "/terms",
];
```

---

## 🔍 CHECKS & VALIDATIONS

### Availability Check

**What it checks:**

- HTTP status codes (200, 300, 400, 500)
- Page loading success
- Redirect detection

**Pass Criteria:**

- Status code 2xx (200-299)

**Example Output:**

```
✅ Page loaded successfully (200)
⚠️ Redirect detected (301)
❌ HTTP error 500
```

---

### Performance Check

**What it checks:**

- Load time (full page)
- DOM content loaded
- Time to First Byte (TTFB)
- Resource count and total size
- Performance budget violations

**Pass Criteria:**

- Load time < 3000ms (configurable)
- TTFB < 800ms (configurable)
- No critical budget violations

**Example Output:**

```
Performance Metrics:
- Load Time: 2145ms ✅
- TTFB: 654ms ✅
- Resources: 42
- Total Size: 1.2MB

Budget Violations: None
```

---

### SEO Check

**What it checks:**

- **Title Tag**: Presence, length (30-60 chars optimal)
- **Meta Description**: Presence, length (120-160 chars optimal)
- **Open Graph**: Title, description, image
- **Canonical URL**: Presence
- **Structured Data**: JSON-LD presence and validity
- **Heading Structure**: H1 count (should be 1), hierarchy

**Pass Criteria:**

- All critical meta tags present
- Title and description within optimal lengths
- Single H1 tag
- Structured data present

**Example Output:**

```
SEO Validation:
- Title: ✓ (52 chars)
- Description: ✓ (145 chars)
- OG Tags: ✓
- H1 Count: 1 ✅
- Structured Data: ✓ (LocalBusiness)

Issues: None
```

---

### Accessibility Check

**What it checks:**

- Image alt text
- Form input labels
- Button accessible names
- HTML lang attribute
- WCAG 2.1 AA compliance

**Pass Criteria:**

- Score >= 80
- WCAG Level AA or higher
- No critical violations

**Example Output:**

```
Accessibility Audit:
- Score: 92/100 ✅
- WCAG Level: AA ✅
- Violations: 2 minor
  - 2 images missing alt text

Compliance: WCAG 2.1 AA ✅
```

---

### Image Check

**What it checks:**

- Total image count
- Missing alt text
- Oversized images (actual > display size \* 2)
- Optimization opportunities

**Pass Criteria:**

- < 10% missing alt text
- < 20% oversized images

**Example Output:**

```
Image Analysis:
- Total Images: 24
- Optimized: 22 ✅
- Unoptimized: 2 ⚠️
- Missing Alt: 1 ⚠️

Issues:
- 2 images are oversized (should be resized)
- 1 image missing alt text
```

---

### Link Check

**What it checks:**

- Total link count
- Internal vs external links
- Broken links (404s)
- Slow links (>1s response)

**Pass Criteria:**

- No broken links
- < 5% slow links

**Example Output:**

```
Link Validation:
- Total Links: 67
- Internal: 54
- External: 13
- Broken: 0 ✅
- Slow: 2 ⚠️

All links functional ✅
```

---

### Security Check

**What it checks:**

- Content-Security-Policy header
- Strict-Transport-Security header
- X-Frame-Options header
- X-Content-Type-Options header
- Referrer-Policy header
- HTTPS usage
- Mixed content detection

**Pass Criteria:**

- HTTPS enforced
- All critical security headers present
- No mixed content

**Example Output:**

```
Security Audit:
- HTTPS: ✅
- CSP: ✅
- HSTS: ✅
- X-Frame-Options: ✅
- X-Content-Type-Options: ✅
- Mixed Content: None ✅

Security: Strong ✅
```

---

### Agricultural Consciousness Check

**What it checks:**

- Seasonal content (spring, summer, fall, winter)
- Farm data validation (structured data)
- Product categorization
- Biodynamic/organic indicators

**Pass Criteria:**

- Seasonal awareness present
- Agricultural terminology detected

**Example Output:**

```
Agricultural Consciousness:
- Seasonal Content: ✓ (harvest, planting)
- Farm Data: ✓ (LocalBusiness schema)
- Product Categories: ✓
- Biodynamic Indicators: ✓ (organic, sustainable)

Agricultural Consciousness: Validated ✅
```

---

## 📊 REPORTS & ALERTS

### Report Types

#### 1. Console Output (Real-time)

Beautiful, color-coded console output with:

- Progress indicators
- Status icons (✅ ❌ ⚠️)
- Detailed metrics
- Summary tables

#### 2. JSON Report

Full machine-readable report:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "baseUrl": "http://localhost:3001",
  "overallStatus": "HEALTHY",
  "pages": [...],
  "apiEndpoints": [...],
  "database": {...},
  "summary": {
    "totalPages": 15,
    "passed": 14,
    "failed": 0,
    "warnings": 1,
    "avgPerformance": 2145,
    "avgAccessibility": 92,
    "criticalIssues": []
  },
  "duration": 45321
}
```

Saved to:

- `monitoring-reports/health-report-{timestamp}.json`
- `monitoring-reports/latest-report.json` (always latest)

#### 3. Markdown Report

Human-readable report with:

- Overall status
- Summary table
- Page-by-page results
- API endpoint status
- Database health
- Critical issues

Saved to:

- `monitoring-reports/health-report-{timestamp}.md`
- `monitoring-reports/latest-report.md` (always latest)

### Alert System

Alerts are triggered when:

1. **Critical Status**: Overall health is CRITICAL
2. **High Failure Rate**: >10% of pages failing
3. **Slow Performance**: Avg load time >3000ms
4. **Low Accessibility**: Avg score <80
5. **Database Down**: Cannot connect
6. **API Failures**: Any endpoint returning errors

**Alert Output:**

```
╔════════════════════════════════════════════════════════════╗
║                    🚨 ALERTS 🚨                            ║
╚════════════════════════════════════════════════════════════╝

   🚨 CRITICAL: Website health is in critical state!
   ⚡ SLOW PERFORMANCE: Average load time 3245ms exceeds threshold
   🗄️ DATABASE DOWN: Cannot connect to database
```

---

## 🔄 CI/CD INTEGRATION

### GitHub Actions Example

```yaml
name: Website Health Check

on:
  schedule:
    - cron: "0 */6 * * *" # Every 6 hours
  push:
    branches: [main, staging]
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install chromium

      - name: Run health check
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          HEADLESS: true
        run: npm run monitor:website

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: health-reports
          path: monitoring-reports/

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "🚨 Website health check failed!"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Exit Codes

- `0` - All checks passed (HEALTHY or DEGRADED)
- `1` - Critical issues found (CRITICAL)

### Deployment Gates

Use in deployment pipeline:

```yaml
- name: Health check before deployment
  run: |
    BASE_URL=${{ env.STAGING_URL }} npm run monitor:website
    if [ $? -ne 0 ]; then
      echo "Health check failed, aborting deployment"
      exit 1
    fi
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### 1. Browser Launch Failed

**Error:**

```
Error: Failed to launch browser
```

**Solution:**

```bash
# Reinstall Playwright browsers
npx playwright install chromium

# Install system dependencies (Linux)
npx playwright install-deps
```

---

#### 2. Timeout Errors

**Error:**

```
Error: Page.goto: Timeout 30000ms exceeded
```

**Solutions:**

- Increase timeout in config:
  ```typescript
  timeout: 60000, // 60 seconds
  ```
- Check if server is running
- Check network connectivity

---

#### 3. Memory Issues

**Error:**

```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solutions:**

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run monitor:website

# Run pages sequentially instead of parallel
# In config: performance.parallel = false
```

---

#### 4. Permission Denied (Linux)

**Error:**

```
Error: EACCES: permission denied
```

**Solution:**

```bash
# Make script executable
chmod +x scripts/monitoring/enhanced-website-monitor.ts

# Create reports directory
mkdir -p monitoring-reports
chmod 755 monitoring-reports
```

---

#### 5. Port Already in Use

**Error:**

```
Error: Port 3001 is already in use
```

**Solution:**

```bash
# Check what's using the port
lsof -ti:3001

# Kill the process
kill $(lsof -ti:3001)

# Or use a different port
BASE_URL=http://localhost:3002 npm run monitor:website
```

---

## 📚 API REFERENCE

### DivineWebsiteChecker Class

#### Constructor

```typescript
constructor(config: WebsiteCheckConfig)
```

**Config Options:**

```typescript
interface WebsiteCheckConfig {
  baseUrl: string;
  headless?: boolean; // Default: true
  timeout?: number; // Default: 30000ms
  userAgent?: string;
  viewport?: {
    width: number; // Default: 1920
    height: number; // Default: 1080
  };
  enableVisualRegression?: boolean; // Default: false
  performanceBudgets?: PerformanceBudgets;
}
```

#### Methods

##### `initialize(): Promise<void>`

Initialize browser and context.

##### `cleanup(): Promise<void>`

Close browser and clean up resources.

##### `runFullHealthCheck(pages: string[]): Promise<WebsiteHealthReport>`

Run comprehensive health check on specified pages.

##### `checkPage(url: string): Promise<PageCheckResult>`

Check a single page with all validations.

---

### Report Types

#### WebsiteHealthReport

```typescript
interface WebsiteHealthReport {
  timestamp: Date;
  baseUrl: string;
  overallStatus: "HEALTHY" | "DEGRADED" | "CRITICAL";
  pages: PageCheckResult[];
  apiEndpoints: ApiHealthResult[];
  database: DatabaseHealthResult;
  summary: {
    totalPages: number;
    passed: number;
    failed: number;
    warnings: number;
    avgPerformance: number;
    avgAccessibility: number;
    criticalIssues: string[];
  };
  duration: number;
}
```

#### PageCheckResult

```typescript
interface PageCheckResult {
  url: string;
  timestamp: Date;
  status: "PASS" | "FAIL" | "WARN";
  checks: {
    availability: CheckResult;
    performance: PerformanceCheckResult;
    seo: SeoCheckResult;
    accessibility: AccessibilityCheckResult;
    images: ImageCheckResult;
    links: LinkCheckResult;
    security: SecurityCheckResult;
    agricultural: AgriculturalCheckResult;
  };
  duration: number;
  screenshot?: string;
  errors: string[];
  warnings: string[];
}
```

---

## 📈 BEST PRACTICES

### 1. Regular Monitoring

```bash
# Run every 6 hours in production
0 */6 * * * npm run monitor:website

# Run on every deployment
post-deploy: npm run monitor:website
```

### 2. Performance Budgets

Set realistic budgets based on your infrastructure:

- **Good**: LCP <2.5s, TTFB <800ms
- **Needs Improvement**: LCP 2.5-4s, TTFB 800-1.8s
- **Poor**: LCP >4s, TTFB >1.8s

### 3. Accessibility Standards

Target WCAG 2.1 AA compliance:

- Score: >80 (good), >90 (excellent)
- Zero critical violations
- < 5 serious violations

### 4. SEO Optimization

- Title: 50-60 characters
- Description: 150-160 characters
- Always include structured data
- Single H1 per page

### 5. Alert Management

- Review alerts daily
- Investigate CRITICAL alerts immediately
- Track trends over time
- Set up notification channels (Slack, email)

---

## 🎯 NEXT STEPS

### Short-term Enhancements

1. **Visual Regression Testing**
   - Implement screenshot comparison
   - Detect UI changes automatically

2. **Extended Link Checking**
   - Actually fetch and validate each link
   - Check external link health

3. **Enhanced Accessibility**
   - Integrate axe-core library
   - Full WCAG 2.1 AAA validation

4. **Real User Monitoring (RUM)**
   - Collect real user metrics
   - Compare with synthetic monitoring

### Long-term Improvements

1. **Machine Learning**
   - Predict failures before they occur
   - Anomaly detection

2. **Multi-region Testing**
   - Test from different geographic locations
   - CDN performance validation

3. **Load Testing Integration**
   - Combine with k6 or Artillery
   - Performance under load

4. **Historical Trend Analysis**
   - Store reports in database
   - Generate trend charts
   - Performance regression detection

---

## 📞 SUPPORT

### Getting Help

1. **Documentation**: Read this guide thoroughly
2. **GitHub Issues**: Submit bug reports and feature requests
3. **Team Chat**: Reach out in #monitoring channel
4. **Code Review**: Check implementation in `src/lib/monitoring/`

### Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Update documentation
5. Submit a pull request

---

## 📝 CHANGELOG

### Version 2.0.0 (Current)

- ✨ Complete rewrite with comprehensive checks
- ✨ Core Web Vitals monitoring
- ✨ WCAG 2.1 AA accessibility validation
- ✨ Agricultural consciousness checks
- ✨ Beautiful reports (JSON + Markdown)
- ✨ Alert system with thresholds
- ✨ CI/CD integration ready

### Version 1.0.0 (Legacy)

- Basic workflow monitoring
- Simple health checks
- Playwright integration

---

## 📄 LICENSE

This monitoring system is part of the Farmers Market Platform and follows the project's license.

---

**Happy Monitoring! 🌟🚀**

_Built with agricultural consciousness and divine precision._
