# 🔍 Comprehensive Website Inspection Bot

**Version:** 2.0.0  
**Last Updated:** January 12, 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Inspection Coverage](#inspection-coverage)
6. [Report Types](#report-types)
7. [Configuration](#configuration)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## 🎯 Overview

The Comprehensive Website Inspection Bot is an automated testing tool that systematically inspects all pages of the Farmers Market Platform to detect:

- ✅ Missing pages and routes
- ❌ Errors and exceptions
- ⚠️ Warnings and issues
- 🔗 Broken links
- 📊 Performance problems
- ♿ Accessibility issues
- 🔍 SEO problems
- 📱 Mobile responsiveness

### Why Use This Bot?

**Speed up production** by automating quality assurance across:
- **100+ pages** across all portals
- **3 user roles** (Customer, Farmer, Admin)
- **Multiple categories** (Public, Auth, Legal, API)
- **Full authentication flows**

---

## ✨ Features

### Complete Coverage

- **Public Pages** - Homepage, Marketplace, Farms, About, Contact, FAQ, etc.
- **Authentication Pages** - Login, Register, Signup, Password Reset
- **Customer Portal** - Dashboard, Orders, Cart, Checkout, Favorites, Settings
- **Farmer Portal** - Dashboard, Products, Orders, Analytics, Finances
- **Admin Portal** - Users, Farms, Products, Orders, Reports, Settings
- **Legal Pages** - Terms, Privacy, Cookies, Refund Policy
- **API Documentation** - Swagger, Reference Docs

### Comprehensive Checks

#### 1. Page Availability
- HTTP status codes (200, 404, 500, etc.)
- Page load time measurement
- Network response validation

#### 2. Content Verification
- Critical elements present (header, footer, main, nav)
- Expected components rendered
- Error messages detected

#### 3. Link Validation
- Internal link checking
- Broken link detection
- HTTP status verification

#### 4. SEO Analysis
- Page title (length, presence)
- Meta description (length, presence)
- H1 heading validation
- Image alt text verification

#### 5. Accessibility Checks
- Button labels and aria-labels
- Form input labels
- Color contrast (basic)
- Keyboard navigation elements

#### 6. Performance Metrics
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- DOM Complete
- Load Event End

#### 7. Visual Documentation
- Screenshots of each page
- Error state capture
- Mobile viewport testing

---

## 📦 Installation

### Prerequisites

- Node.js 20+
- npm 10+
- Playwright installed

### Setup

1. **Install dependencies** (already included):
```bash
npm install
```

2. **Configure environment variables** (`.env.test`):
```env
# Test User Credentials
TEST_CUSTOMER_EMAIL=customer@test.com
TEST_CUSTOMER_PASSWORD=Test123!@#

TEST_FARMER_EMAIL=farmer@test.com
TEST_FARMER_PASSWORD=Test123!@#

TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=Test123!@#

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

3. **Ensure test users exist** in your database

---

## 🚀 Usage

### Quick Start

```bash
# Full inspection of all portals
npm run inspect:website

# Quick scan (critical pages only)
npm run inspect:website:quick

# Inspect specific portal
npm run inspect:public
npm run inspect:customer
npm run inspect:farmer
npm run inspect:admin
```

### Advanced Usage

```bash
# Full inspection with all options
npm run inspect:all

# Help and options
npm run inspect:website -- --help
```

### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--portal <portal>` | Specify portal to inspect | `--portal customer` |
| `--quick` | Quick mode (critical pages only) | `--quick` |
| `--help, -h` | Show help message | `--help` |

### Portal Options

- `all` - Inspect all portals (default)
- `public` - Public pages only
- `customer` - Customer portal pages
- `farmer` - Farmer portal pages
- `admin` - Admin portal pages

---

## 📊 Inspection Coverage

### Pages Inspected

#### Public Pages (9 pages)
```
✓ /                    - Homepage
✓ /about               - About Us
✓ /contact             - Contact
✓ /faq                 - FAQ
✓ /how-it-works        - How It Works
✓ /shipping            - Shipping Info
✓ /marketplace         - Marketplace
✓ /products            - Products
✓ /farms               - Farm Directory
```

#### Authentication Pages (5 pages)
```
✓ /login               - Login
✓ /register            - Register
✓ /register-farm       - Farmer Registration
✓ /signup              - Signup
✓ /forgot-password     - Forgot Password
```

#### Customer Portal (8 pages)
```
✓ /customer/dashboard         - Customer Dashboard
✓ /customer/marketplace       - Customer Marketplace
✓ /customer/farms            - Customer Farms
✓ /customer/cart             - Shopping Cart
✓ /customer/orders           - Customer Orders
✓ /customer/favorites        - Favorites
✓ /customer/settings         - Customer Settings
✓ /checkout                  - Checkout
```

#### Farmer Portal (7 pages)
```
✓ /farmer/dashboard                  - Farmer Dashboard
✓ /farmer/farms                      - Farmer Farms
✓ /farmer/products                   - Farmer Products
✓ /farmer/orders                     - Farmer Orders
✓ /farmer/dashboard/analytics        - Analytics
✓ /farmer/dashboard/finances         - Finances
✓ /farmer/dashboard/recommendations  - Recommendations
```

#### Admin Portal (7 pages)
```
✓ /admin                - Admin Dashboard
✓ /admin/users          - User Management
✓ /admin/farms          - Farm Management
✓ /admin/products       - Product Management
✓ /admin/orders         - Order Management
✓ /admin/reports        - Reports
✓ /admin/settings       - Settings
```

#### Legal Pages (2 pages)
```
✓ /legal/terms         - Terms of Service
✓ /legal/privacy       - Privacy Policy
```

#### API Documentation (1 page)
```
✓ /api-docs            - API Documentation
```

**Total Coverage: 39 critical pages + expandable to 100+ routes**

---

## 📈 Report Types

### 1. Console Output

Real-time progress and results displayed in terminal:

```
═══════════════════════════════════════════════════════════════════════
  🔍 STARTING COMPREHENSIVE WEBSITE INSPECTION
═══════════════════════════════════════════════════════════════════════
[10:30:15] ℹ️  Total pages to inspect: 39
[10:30:15] ℹ️  Quick mode: checking critical pages only

═══════════════════════════════════════════════════════════════════════
  📄 PUBLIC PAGES (9)
═══════════════════════════════════════════════════════════════════════
[10:30:16] 🔍 Inspecting: Homepage (/)
[10:30:17] ✅ ✓ Homepage: SUCCESS (1234ms)
[10:30:17] 🔍 Inspecting: About Us (/about)
[10:30:18] ✅ ✓ About Us: SUCCESS (987ms)
...
```

### 2. JSON Report

Detailed machine-readable report:

**Location:** `./inspection-reports/inspection-report-[timestamp].json`

```json
{
  "summary": {
    "totalPages": 39,
    "successful": 35,
    "errors": 2,
    "warnings": 2,
    "missing": 0,
    "totalDuration": 45678,
    "timestamp": "2026-01-12T10:30:00.000Z"
  },
  "results": [
    {
      "path": "/",
      "name": "Homepage",
      "status": "success",
      "statusCode": 200,
      "loadTime": 1234,
      "errors": [],
      "warnings": [],
      "missingElements": [],
      "brokenLinks": [],
      "seoIssues": [],
      "a11yIssues": [],
      "performanceMetrics": {
        "ttfb": 234,
        "fcp": 567
      },
      "screenshot": "./screenshots/public--.png",
      "timestamp": "2026-01-12T10:30:17.000Z"
    }
  ],
  "criticalIssues": [],
  "recommendations": []
}
```

### 3. HTML Report

Beautiful, interactive HTML dashboard:

**Location:** `./inspection-reports/inspection-report-[timestamp].html`

**Features:**
- Summary cards with metrics
- Color-coded status badges
- Detailed results table
- Critical issues section
- Recommendations list
- Filterable and sortable
- Mobile-responsive design

**Preview:**

```
┌─────────────────────────────────────────────────────────┐
│  🔍 Website Inspection Report                           │
│  Generated: Jan 12, 2026, 10:30:00 AM                   │
│  Duration: 45.68s | Base URL: http://localhost:3001    │
└─────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Pages │ Success Rate│  Successful │  Warnings   │
│     39      │    89.7%    │     35      │      2      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### 4. Screenshots

Visual documentation of each page:

**Location:** `./inspection-reports/screenshots/`

**Naming Convention:**
- `public--home.png`
- `customer--dashboard.png`
- `farmer--products.png`
- `admin--users.png`

---

## ⚙️ Configuration

### Environment Variables

```env
# Base URL for inspection
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Test user credentials
TEST_CUSTOMER_EMAIL=customer@test.com
TEST_CUSTOMER_PASSWORD=Test123!@#

TEST_FARMER_EMAIL=farmer@test.com
TEST_FARMER_PASSWORD=Test123!@#

TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=Test123!@#
```

### Script Configuration

Edit `scripts/comprehensive-website-inspector.ts`:

```typescript
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  timeout: 30000,              // 30 seconds per page
  navigationTimeout: 60000,    // 60 seconds for navigation
  headless: true,              // Run in headless mode
  screenshots: true,           // Capture screenshots
  screenshotDir: './inspection-reports/screenshots',
  reportDir: './inspection-reports',
};
```

---

## 💡 Examples

### Example 1: Pre-Deployment Check

```bash
# Before deploying, run full inspection
npm run inspect:website

# Check the report
open inspection-reports/inspection-report-*.html
```

### Example 2: Quick Smoke Test

```bash
# Quick check of critical pages
npm run inspect:website:quick

# Should complete in < 2 minutes
```

### Example 3: Portal-Specific Testing

```bash
# After updating customer features
npm run inspect:customer

# After updating farmer dashboard
npm run inspect:farmer

# After admin panel changes
npm run inspect:admin
```

### Example 4: CI/CD Integration

**GitHub Actions:**

```yaml
name: Website Inspection

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  inspect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run build
      - run: npm run start &
      - run: sleep 10
      
      - name: Run inspection
        run: npm run inspect:website:quick
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: inspection-report
          path: inspection-reports/
```

### Example 5: Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, run inspection
npm run inspect:website

# 3. Fix issues based on report

# 4. Re-run specific portal
npm run inspect:customer

# 5. Commit when all green
git commit -m "fix: resolved customer portal issues"
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Authentication Failed

**Symptom:**
```
⚠️  Skipping customer pages - authentication failed
```

**Solution:**
1. Check test user credentials in `.env.test`
2. Ensure test users exist in database
3. Verify login page is working
4. Check for CSRF token issues

```bash
# Verify test user exists
npm run db:studio
# Navigate to User table and confirm test users
```

#### Issue: Page Timeout

**Symptom:**
```
❌ Farmer Dashboard: ERROR - Navigation timeout exceeded
```

**Solution:**
1. Increase timeout in configuration
2. Check if page has infinite loading
3. Verify database connection
4. Check for slow API responses

```typescript
// Increase timeout
const CONFIG = {
  timeout: 60000,  // 60 seconds
  navigationTimeout: 120000,  // 2 minutes
};
```

#### Issue: Missing Screenshots

**Symptom:**
Screenshots directory is empty

**Solution:**
1. Ensure `screenshots: true` in config
2. Check directory permissions
3. Verify Playwright installation

```bash
# Reinstall Playwright browsers
npx playwright install
```

#### Issue: Connection Refused

**Symptom:**
```
❌ Homepage: ERROR - connect ECONNREFUSED
```

**Solution:**
1. Ensure dev server is running
2. Check correct port (3001)
3. Verify BASE_URL

```bash
# Start dev server first
npm run dev

# In another terminal
npm run inspect:website
```

---

## 🎯 Best Practices

### 1. Run Before Every Deployment

```bash
# Pre-deployment checklist
npm run quality           # Type check, lint, format
npm run test             # Unit tests
npm run inspect:website  # Full inspection
npm run test:e2e         # E2E tests
```

### 2. Quick Checks During Development

```bash
# Quick smoke test
npm run inspect:website:quick

# Portal-specific after changes
npm run inspect:customer  # After customer features
npm run inspect:farmer    # After farmer features
npm run inspect:admin     # After admin features
```

### 3. Monitor Critical Pages

Focus on critical pages marked in the sitemap:
- Homepage (customer entry point)
- Login/Register (authentication)
- Customer Dashboard (user experience)
- Farmer Dashboard (farmer management)
- Checkout (revenue critical)

### 4. Review Reports Regularly

```bash
# Generate weekly reports
npm run inspect:website

# Review trends:
# - Load time increases
# - New broken links
# - SEO issues
# - Accessibility problems
```

### 5. Fix Issues by Priority

**Priority 1 - Critical Issues:**
- Missing pages (404s)
- Authentication failures
- Checkout broken
- Database connection errors

**Priority 2 - High Impact:**
- Slow page loads (>3s)
- Broken critical links
- Missing page titles
- Major accessibility issues

**Priority 3 - Medium Impact:**
- SEO issues
- Minor broken links
- Missing alt text
- Form label issues

**Priority 4 - Low Impact:**
- Performance optimizations
- Minor accessibility improvements
- Code quality issues

### 6. Integrate with CI/CD

Add inspection to your CI/CD pipeline:

```yaml
# Run on every PR
- name: Website Inspection
  run: npm run inspect:website:quick
  
# Fail build if critical issues found
- name: Check for critical issues
  run: |
    if grep -q "CRITICAL" inspection-reports/*.json; then
      echo "Critical issues found"
      exit 1
    fi
```

### 7. Document and Track

Keep a log of inspection results:

```bash
# Save reports with meaningful names
cp inspection-reports/inspection-report-*.html \
   reports/pre-release-v1.2.0.html

# Track in git (optional)
git add reports/
git commit -m "docs: add pre-release inspection report"
```

---

## 📚 Related Documentation

- [Testing Guide](./testing/README.md)
- [E2E Testing](./testing/E2E_TESTING.md)
- [Performance Testing](./testing/PERFORMANCE_TESTING.md)
- [Accessibility Testing](./testing/ACCESSIBILITY_TESTING.md)
- [CI/CD Setup](./deployment/CI_CD_SETUP.md)

---

## 🔄 Continuous Improvement

### Upcoming Features

- [ ] API endpoint testing
- [ ] Form submission testing
- [ ] Database query validation
- [ ] WebSocket connection testing
- [ ] Payment flow testing
- [ ] Email sending verification
- [ ] File upload testing
- [ ] Search functionality testing
- [ ] Filter/sort testing
- [ ] Pagination testing

### Contributing

Found a bug or have a suggestion? Please:

1. Check existing issues
2. Create detailed bug report
3. Submit pull request with fix
4. Update documentation

---

## 📞 Support

For issues or questions:

- Check [Troubleshooting](#troubleshooting) section
- Review [Examples](#examples)
- Consult team documentation
- Open issue in repository

---

## ✅ Quick Reference

### Commands

```bash
# Full inspection
npm run inspect:website

# Quick scan
npm run inspect:website:quick

# By portal
npm run inspect:public
npm run inspect:customer
npm run inspect:farmer
npm run inspect:admin

# All portals
npm run inspect:all

# Help
npm run inspect:website -- --help
```

### Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ SUCCESS | Page loaded correctly | None needed |
| ⚠️ WARNING | Issues detected | Review and fix |
| ❌ ERROR | Page failed to load | Fix immediately |
| 🔍 MISSING | Page not found (404) | Create or fix route |

### Report Locations

| Type | Location |
|------|----------|
| JSON | `./inspection-reports/inspection-report-[timestamp].json` |
| HTML | `./inspection-reports/inspection-report-[timestamp].html` |
| Screenshots | `./inspection-reports/screenshots/` |

---

**Last Updated:** January 12, 2026  
**Version:** 2.0.0  
**Maintainer:** Farmers Market Platform Team  

---

*This documentation is part of the Farmers Market Platform quality assurance system. For more information, see the [main README](../README.md).*