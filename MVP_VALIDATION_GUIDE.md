# 🎯 MVP Validation Bot - Complete Guide

## Overview

The **MVP Validation Bot** is an automated testing system that verifies all critical features of your Farmers Market Platform are working correctly before production launch. It simulates real user journeys and validates the entire MVP checklist.

---

## 🚀 Quick Start

### Prerequisites

1. **Server Running**: Your development or production server must be running

   ```bash
   npm run dev
   # OR
   npm run build && npm start
   ```

2. **Database Ready**: PostgreSQL database must be accessible and seeded

3. **Admin Account**: Admin credentials must be configured in `.env`
   ```env
   ADMIN_EMAIL=admin@farmersmarket.test
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

### Run the Bot

**Windows:**

```cmd
RUN-MVP-VALIDATION.bat
```

**Linux/Mac:**

```bash
chmod +x run-mvp-validation.sh
./run-mvp-validation.sh
```

**NPM Command:**

```bash
npm run bot:mvp
```

**With Visible Browser (Debug Mode):**

```bash
npm run bot:mvp:headed
# OR
./run-mvp-validation.sh headed
```

---

## 📋 What the Bot Validates

The bot performs **13 comprehensive checks** covering all MVP requirements:

### ✅ Critical Checks (Must Pass for Launch)

| #   | Check                              | Description                   | What It Tests                                         |
| --- | ---------------------------------- | ----------------------------- | ----------------------------------------------------- |
| 1   | **Farmer Registration & Approval** | Complete farmer onboarding    | User signup, farm profile creation, approval workflow |
| 2   | **Admin Farm Approval**            | Admin can approve farms       | Admin dashboard access, farm approval functionality   |
| 3   | **Product Management**             | Farmers can add/edit products | Product CRUD, photo upload, inventory tracking        |
| 4   | **Browse & Search**                | Customers can find products   | Product listing, search, filtering, categories        |
| 5   | **Shopping Cart & Checkout**       | Cart functionality works      | Add to cart, cart persistence, checkout flow          |
| 6   | **Stripe Payment**                 | Payment processing            | Stripe integration, payment form validation           |
| 7   | **Farmer Order Dashboard**         | Orders appear for farmers     | Order management, farmer dashboard                    |
| 9   | **Admin Management**               | Admin can manage platform     | Admin access to farms, orders, users                  |
| 11  | **Security Measures**              | Critical security in place    | HTTPS, auth protection, password validation           |

### 🟡 High Priority Checks (Should Pass)

| #   | Check                     | Description               | What It Tests                      |
| --- | ------------------------- | ------------------------- | ---------------------------------- |
| 8   | **Email Notifications**   | Email service configured  | SMTP/email service setup           |
| 10  | **Mobile Responsiveness** | Site works on phones      | Mobile viewport, responsive design |
| 12  | **Legal Pages**           | Terms & Privacy available | Legal compliance pages             |

### 🔵 Medium Priority Checks (Nice to Have)

| #   | Check                | Description               | What It Tests               |
| --- | -------------------- | ------------------------- | --------------------------- |
| 13  | **Customer Support** | Support contact available | Contact page, support email |

---

## 📊 Understanding the Results

### Exit Codes

- **0** = All critical checks passed, MVP ready for launch
- **1** = One or more critical checks failed, review needed

### Check Statuses

- ✅ **PASSED** - Feature works perfectly
- ❌ **FAILED** - Feature is broken (critical issue)
- ⚠️ **WARNING** - Feature needs attention (not blocking)
- ⏭️ **SKIPPED** - Check was skipped (usually intentional)

### Report Output

After running, you'll find:

**Console Output:**

- Real-time progress with colored status indicators
- Summary table showing pass/fail counts
- Success rate percentage
- MVP readiness determination

**JSON Report:**

```
mvp-validation-reports/mvp-report-[timestamp].json
```

- Complete test results with timing data
- Error messages and stack traces
- Screenshot paths

**Markdown Report:**

```
mvp-validation-reports/mvp-report-[timestamp].md
```

- Human-readable test results
- Detailed findings for each check
- Recommendations for fixes

**Screenshots:**

```
mvp-validation-screenshots/
```

- Visual evidence of each test step
- Failure screenshots for debugging

---

## 🔧 Configuration

### Environment Variables

```env
# Base URL (default: http://localhost:3001)
BASE_URL=http://localhost:3001

# Run with visible browser
HEADLESS=false

# Admin credentials for testing
ADMIN_EMAIL=admin@farmersmarket.test
ADMIN_PASSWORD=YourSecurePassword123!

# Email service (for notification checks)
EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
# OR
RESEND_API_KEY=re_your_api_key_here
```

### Test Data

The bot automatically generates unique test data for each run:

- **Test Farmer**: `farmer.[timestamp]@farmersmarket.test`
- **Test Customer**: `customer.[timestamp]@farmersmarket.test`
- **Test Farm**: `Test Farm [timestamp]`
- **Test Product**: `Fresh Organic Tomatoes`

You can customize test data in `scripts/mvp-validation-bot.ts` config section.

---

## 🎬 Detailed Test Flow

### 1. Farmer Registration & Approval Workflow

**Steps:**

1. Navigate to signup page
2. Fill registration form with farmer details
3. Select "FARMER" role
4. Submit registration
5. Create farm profile
6. Fill farm details (name, description, address)
7. Submit farm creation
8. Verify pending approval status

**Validates:**

- User registration works
- Role selection works
- Farm profile creation works
- Approval workflow exists

---

### 2. Admin Farm Approval

**Steps:**

1. Logout farmer
2. Login as admin
3. Navigate to admin farms page
4. Find pending farms
5. Click approve button
6. Confirm approval

**Validates:**

- Admin authentication works
- Admin can access farm management
- Approval functionality works
- UI updates after approval

---

### 3. Farmer Product Management

**Steps:**

1. Logout admin
2. Login as farmer
3. Navigate to product creation
4. Fill product form (name, price, stock, description)
5. Select category
6. Check for photo upload field
7. Submit product
8. Verify product appears
9. Test edit functionality

**Validates:**

- Farmers can create products
- All product fields work
- Photo upload exists
- Product editing works

---

### 4. Customer Browse & Search

**Steps:**

1. Navigate to public products page
2. Count displayed products
3. Test search input with query "tomato"
4. Check search results
5. Verify category filters exist

**Validates:**

- Products display publicly
- Search functionality works
- Category filtering available
- No authentication required for browsing

---

### 5. Shopping Cart & Checkout

**Steps:**

1. Register new customer account
2. Navigate to products
3. Click "Add to Cart" on first product
4. Verify cart notification
5. Navigate to cart page
6. Verify cart contains items
7. Click checkout button
8. Verify redirected to checkout

**Validates:**

- Customer registration works
- Add to cart works
- Cart persists
- Checkout flow exists

---

### 6. Stripe Payment Processing

**Steps:**

1. On checkout page from previous test
2. Verify Stripe payment iframe exists
3. Check for payment form fields
4. Fill shipping/billing information

**Validates:**

- Stripe integration present
- Payment form loads
- Checkout page layout correct

**Note:** Full payment processing requires manual testing with Stripe test cards.

---

### 7. Farmer Order Dashboard

**Steps:**

1. Logout customer
2. Login as farmer
3. Navigate to farmer orders page
4. Verify orders section exists
5. Check for orders list/table

**Validates:**

- Farmer dashboard accessible
- Orders section exists
- UI ready for order management

---

### 8. Email Notifications

**Steps:**

1. Check environment variables for email config
2. Verify SMTP or email service configured
3. Navigate to admin settings
4. Look for email template management

**Validates:**

- Email service configured
- Environment properly set up

**Note:** Actual email delivery requires manual verification.

---

### 9. Admin Management Capabilities

**Steps:**

1. Login as admin
2. Navigate to admin dashboard
3. Check access to farms management
4. Check access to orders management
5. Check access to users management
6. Verify all sections accessible

**Validates:**

- Admin dashboard works
- Farms management accessible
- Orders management accessible
- Users management accessible

---

### 10. Mobile Responsiveness

**Steps:**

1. Set viewport to mobile size (375x667 - iPhone SE)
2. Load homepage on mobile
3. Check for mobile menu
4. Load products page on mobile
5. Verify products display correctly
6. Load cart on mobile

**Validates:**

- Site is responsive
- Mobile navigation works
- Content adapts to mobile screen
- No horizontal scroll

---

### 11. Security Measures

**Steps:**

1. Check HTTPS usage (production only)
2. Verify security headers (X-Frame-Options, etc.)
3. Test protected route authentication
4. Logout and try accessing farmer dashboard
5. Verify redirect to login
6. Check password input validation

**Validates:**

- HTTPS enabled (production)
- Security headers present
- Routes properly protected
- Authentication required
- Password validation exists

---

### 12. Legal Pages (Terms & Privacy)

**Steps:**

1. Navigate to /terms
2. Verify page loads successfully
3. Navigate to /privacy
4. Verify page loads successfully
5. Check homepage footer for legal links

**Validates:**

- Terms of Service page exists
- Privacy Policy page exists
- Legal links accessible in footer
- Compliance ready

---

### 13. Customer Support Contact

**Steps:**

1. Navigate to /contact
2. Check if contact page exists
3. Look for mailto: links
4. Verify support email in footer/header

**Validates:**

- Contact page exists
- Support email configured
- Users can reach support

---

## 🐛 Troubleshooting

### Bot Won't Start

**Error: "Node.js is not installed"**

- Install Node.js from https://nodejs.org/
- Use Node.js 20.19.0 or higher

**Error: "node_modules not found"**

```bash
npm install
```

**Error: "Server is not running"**

```bash
# Start the server first
npm run dev
```

---

### Tests Failing

**Farmer Registration Fails**

- Check if signup page route exists: `/auth/signup`
- Verify role selection works
- Check database connection

**Admin Login Fails**

- Verify admin credentials in `.env`
- Check if admin user exists in database
- Seed database: `npm run seed`

**Products Not Found**

- Ensure products are seeded
- Check product API: `GET /api/products`
- Verify database has product data

**Stripe Not Detected**

- Verify Stripe keys in `.env`
- Check checkout page has Stripe component
- Ensure Stripe SDK loaded

**Security Checks Fail**

- Add security headers in `next.config.mjs`
- Enable authentication middleware
- Verify protected routes use auth

---

### Screenshot Issues

**No Screenshots Generated**

- Check disk space
- Verify write permissions on project folder
- Screenshots save to: `./mvp-validation-screenshots/`

---

## 🎨 Customization

### Adding New Checks

Edit `scripts/mvp-validation-bot.ts` and add a new method:

```typescript
async checkMyNewFeature(): Promise<MVPCheck> {
  const start = Date.now();
  const checkName = 'My New Feature Check';

  try {
    if (!this.page) throw new Error('Page not initialized');

    log('\n🔍 Testing my new feature...', 'blue');

    // Your test logic here
    await this.page.goto(`${CONFIG.baseUrl}/my-feature`);
    const featureExists = await this.page.locator('.my-feature').count() > 0;

    if (!featureExists) {
      throw new Error('Feature not found');
    }

    const screenshot = await takeScreenshot(this.page, 'my-new-feature');

    return {
      id: 'mvp-14',
      name: checkName,
      category: 'MEDIUM',
      status: 'PASSED',
      duration: Date.now() - start,
      message: 'My new feature works!',
      screenshot,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    const screenshot = this.page ?
      await takeScreenshot(this.page, 'my-feature-error') : undefined;

    return {
      id: 'mvp-14',
      name: checkName,
      category: 'MEDIUM',
      status: 'FAILED',
      duration: Date.now() - start,
      message: 'My new feature failed',
      error: error instanceof Error ? error.message : String(error),
      screenshot,
      timestamp: new Date().toISOString(),
    };
  }
}
```

Then add to `runAllChecks()`:

```typescript
this.checks.push(await this.checkMyNewFeature());
```

---

### Modifying Test Data

Edit the `CONFIG.testData` section:

```typescript
const CONFIG = {
  // ...
  testData: {
    farmer: {
      email: "custom.farmer@example.com",
      password: "CustomPassword123!",
      farmName: "Custom Farm Name",
      // ...
    },
    // ...
  },
};
```

---

### Changing Timeouts

```typescript
const CONFIG = {
  timeout: 120000, // 2 minutes instead of 1
  // ...
};
```

---

## 📈 CI/CD Integration

### GitHub Actions

Add to `.github/workflows/mvp-validation.yml`:

```yaml
name: MVP Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-mvp:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Setup database
        run: |
          npm run prisma:generate
          npm run prisma:migrate
          npm run seed

      - name: Build application
        run: npm run build

      - name: Start server
        run: npm start &
        env:
          NODE_ENV: production
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Wait for server
        run: npx wait-on http://localhost:3001

      - name: Run MVP validation
        run: npm run bot:mvp
        env:
          BASE_URL: http://localhost:3001
          ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: mvp-validation-reports
          path: mvp-validation-reports/

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: mvp-validation-screenshots
          path: mvp-validation-screenshots/
```

---

## 🏆 Best Practices

### Before Running

1. **Fresh Environment**: Test on a clean database state
2. **Server Warm**: Let server fully start before running bot
3. **No Active Sessions**: Clear browser cookies if testing manually before

### During Development

1. **Run Frequently**: Validate after each major feature
2. **Debug Mode**: Use `headed` mode to watch tests live
3. **Check Screenshots**: Review failure screenshots immediately

### Before Production

1. **Full Validation**: Run complete suite multiple times
2. **Different Environments**: Test on staging, then production-like setup
3. **Manual Verification**: Bot validates existence, manually verify quality
4. **Document Failures**: Track which checks fail and why

---

## 📞 Support

### Questions?

- Check logs in: `./mvp-validation-reports/`
- Review screenshots: `./mvp-validation-screenshots/`
- Search error messages online
- Check project issues on GitHub

### Contributing

Found a bug or want to improve the bot?

1. Fork the repository
2. Create feature branch: `git checkout -b improve-mvp-bot`
3. Make your changes to `scripts/mvp-validation-bot.ts`
4. Test thoroughly
5. Submit pull request

---

## 📝 Changelog

### v1.0.0 (Current)

- ✅ 13 comprehensive MVP checks
- ✅ Automatic screenshot capture
- ✅ JSON and Markdown reports
- ✅ Farmer registration workflow
- ✅ Admin approval workflow
- ✅ Product management validation
- ✅ Cart and checkout flow
- ✅ Stripe payment verification
- ✅ Security checks
- ✅ Mobile responsiveness
- ✅ Legal pages validation
- ✅ Support contact check

---

## 🎯 Success Criteria

Your MVP is **READY FOR LAUNCH** when:

- ✅ All 9 CRITICAL checks pass
- ✅ At least 10/13 total checks pass
- ✅ Success rate ≥ 85%
- ✅ No blocker issues reported
- ✅ All screenshots show correct UI
- ✅ Manual spot-checks confirm quality

---

## 🚀 After Validation Passes

1. **Review Reports**: Read through detailed findings
2. **Manual Testing**: Perform final human QA
3. **Security Audit**: Run security scan
4. **Performance Test**: Check load times
5. **Deploy**: Push to production!

---

**Made with ❤️ for Farmers Market Platform**

_Last Updated: January 2025_
