# 🧪 Human Testing Guide - Farmers Market Platform

## Overview

This guide provides instructions for testing the Farmers Market Platform the way real humans would use it. We have multiple testing approaches available:

---

## 🎯 Quick Start - Run the Website Locally

### 1. Start Development Server

```bash
npm run dev
```

This starts the website at `http://localhost:3001`

### 2. Open in Browser

Navigate to `http://localhost:3001` and explore the site manually.

---

## 🤖 Automated Human-Like Testing (E2E Tests)

We use **Playwright** for end-to-end testing that simulates real user interactions.

### Available Test Suites

#### 🔥 Critical User Flows

```bash
npm run test:e2e
```

Tests the most important user journeys:

- Authentication (login, registration)
- Product browsing
- Shopping cart operations
- Checkout process

#### 🎨 Visual Testing

```bash
npm run test:visual
```

Tests how the website looks across different:

- Browsers (Chrome, Firefox, Safari)
- Screen sizes (Desktop, Tablet, Mobile)
- Themes (Light/Dark mode)

#### 📱 Mobile Testing

```bash
npm run test:mobile
```

Tests mobile-specific functionality:

- Touch interactions
- Responsive design
- Mobile navigation
- PWA features (offline mode, install prompts)

#### ♿ Accessibility Testing

```bash
npm run test:a11y
```

Tests that the website is usable by everyone:

- Screen reader compatibility
- Keyboard navigation
- Color contrast
- ARIA labels
- WCAG compliance

#### 🔒 Security Testing

```bash
npm run security:full
```

Tests security vulnerabilities:

- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF protection
- Authentication/Authorization
- Secure headers

#### 💪 Chaos Testing

```bash
npm run test:chaos
```

Tests how the website handles problems:

- Network failures
- Server crashes
- Database issues
- High traffic spikes

---

## 🎭 Test with Different User Roles

### Test Users Available

The platform has pre-configured test users:

```javascript
// Admin User
Email: admin@farmersmarket.app
Password: [Check your .env or seed data]

// Farmer User
Email: farmer@farmersmarket.app
Password: [Check your .env or seed data]

// Customer User
Email: customer@farmersmarket.app
Password: [Check your .env or seed data]
```

### Test Scenarios by Role

#### 👨‍🌾 Farmer Journey

```bash
npm run test:integration:farmer
```

1. Login as farmer
2. Create new farm
3. Add products
4. Manage inventory
5. View orders
6. Process payments

#### 🛒 Customer Journey

```bash
npm run test:integration:customer
```

1. Browse farms/products
2. Search and filter
3. Add items to cart
4. Checkout
5. Track order
6. Leave reviews

---

## 🎪 Interactive Testing (Watch Mode)

### Run Tests with UI

```bash
npm run test:e2e:ui
```

Opens Playwright's visual test runner where you can:

- See tests run in real-time
- Pause and inspect at any step
- Debug failures interactively
- Time travel through test execution

### Run Tests with Browser Visible (Headed Mode)

```bash
npm run test:e2e:headed
```

Runs tests with browser windows visible so you can watch what's happening.

### Debug a Specific Test

```bash
npm run test:e2e:debug
```

Runs tests in debug mode with Playwright Inspector for step-by-step debugging.

---

## 📊 Performance Testing

### Load Testing

```bash
# Standard load test
npm run test:load

# Smoke test (quick validation)
npm run test:load:smoke

# Stress test (push to limits)
npm run test:load:stress

# Spike test (sudden traffic increase)
npm run test:load:spike
```

### Performance Benchmarks

```bash
# Run performance benchmark
npm run perf:benchmark

# Compare against baseline
npm run perf:compare

# View performance history
npm run perf:history
```

---

## 🎯 Specific Feature Testing

### Shopping & Checkout

```bash
npm run test:e2e -- tests/e2e/shopping/complete-purchase.spec.ts
```

### Stripe Payment Integration

```bash
npm run test:contracts:stripe
```

### Authentication

```bash
npm run test:e2e -- tests/e2e/auth/
```

### Product Management

```bash
npm run test:e2e -- tests/e2e/products/
```

---

## 🌐 Cross-Browser Testing

### Test on Chromium

```bash
npm run test:e2e:direct -- --project=chromium
```

### Test on Firefox

```bash
npm run test:e2e:direct -- --project=firefox
```

### Test on WebKit (Safari)

```bash
npm run test:e2e:direct -- --project=webkit
```

### Test on All Mobile Devices

```bash
npm run test:mobile:devices
```

---

## 📱 Real Device Testing

### Test on iOS Devices

```bash
npm run test:mobile:ios
```

### Test on Android Devices

```bash
npm run test:mobile:android
```

### Test Critical Journeys on Real Devices

```bash
npm run test:real-device:journeys
```

---

## 🔍 Manual Testing Checklist

### Homepage Testing

- [ ] Page loads correctly
- [ ] Featured farms are displayed
- [ ] Search bar works
- [ ] Navigation menu is accessible
- [ ] Footer links work
- [ ] Images load properly
- [ ] Responsive on mobile

### Product Browsing

- [ ] Products list loads
- [ ] Filters work (category, price, etc.)
- [ ] Sorting works (price, rating, etc.)
- [ ] Search functionality works
- [ ] Product images display
- [ ] Product details page opens
- [ ] Add to cart button works

### Shopping Cart

- [ ] Items appear in cart
- [ ] Quantity can be updated
- [ ] Items can be removed
- [ ] Cart total calculates correctly
- [ ] Proceed to checkout works
- [ ] Cart persists on page reload

### Checkout Process

- [ ] Shipping address form works
- [ ] Payment form appears
- [ ] Stripe integration works
- [ ] Order confirmation displays
- [ ] Confirmation email sent
- [ ] Order appears in dashboard

### User Account

- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Profile can be updated
- [ ] Password can be changed
- [ ] Order history displays

### Farmer Dashboard

- [ ] Login as farmer
- [ ] Dashboard displays stats
- [ ] Can create new products
- [ ] Can edit products
- [ ] Can view orders
- [ ] Can update order status
- [ ] Can manage farm details

---

## 🐛 Debug Mode - Watch Tests Execute

### Watch Specific Test File

```bash
npm run test:watch
```

### Run Single Test

```bash
npx playwright test tests/e2e/critical-flows.spec.ts --debug
```

### Generate Test Report

```bash
# Run tests
npm run test:e2e

# View report
npx playwright show-report
```

---

## 📸 Visual Regression Testing

### Update Visual Baselines (After UI Changes)

```bash
npm run test:visual:update
```

### Test Against Baselines

```bash
npm run test:visual
```

### Review Visual Differences

```bash
npm run visual:report
```

---

## 🚀 Comprehensive Testing Flow

### Full Test Suite (Before Deploy)

```bash
# 1. Run all unit tests
npm run test

# 2. Run integration tests
npm run test:integration

# 3. Run E2E tests
npm run test:e2e

# 4. Run security tests
npm run security:full

# 5. Run accessibility tests
npm run test:a11y

# 6. Run visual tests
npm run test:visual

# 7. Run mobile tests
npm run test:mobile
```

### Quick Validation

```bash
npm run test:all
```

### Divine Mode (Maximum Power)

```bash
npm run test:all:omen
```

---

## 💡 Tips for Manual Testing

### 1. Test Different Scenarios

- Try with slow internet connection
- Test with browser developer tools open
- Try on different screen sizes
- Test with ad blockers enabled
- Try with JavaScript disabled

### 2. Test Edge Cases

- Empty cart checkout
- Invalid form inputs
- Expired sessions
- Network interruptions
- Very long product names

### 3. Test User Flows

- Complete purchase as guest
- Complete purchase as logged-in user
- Abandon cart and return
- Browse from mobile, checkout from desktop
- Use browser back button

### 4. Test Performance

- Multiple tabs open
- Large cart (50+ items)
- Many filter selections
- Rapid clicking/scrolling

---

## 📊 Test Reports & Monitoring

### View Latest Test Results

```bash
# E2E test report
npx playwright show-report

# Mobile test report
npm run mobile:report

# Accessibility report
npm run a11y:report

# Visual test report
npm run visual:report
```

### Performance Reports

```bash
# View load test results
npm run test:load:results

# View performance history
npm run perf:history

# View resource monitoring report
npm run perf:monitor:report
```

---

## 🎓 Learning Resources

### Test File Locations

- **E2E Tests**: `tests/e2e/`
- **Integration Tests**: `tests/integration/`
- **Mobile Tests**: `tests/mobile/`
- **Visual Tests**: `tests/visual/`
- **Security Tests**: `tests/security/`
- **Load Tests**: `tests/load/`

### Documentation Files

- `tests/DAY_18_ADVANCED_TESTING_COMPLETE.md` - Advanced testing guide
- `tests/DAY_19_QUICK_REFERENCE.md` - Real device & chaos testing
- `tests/DAY_20_QUICK_REFERENCE.md` - AI & visual testing
- `tests/TESTING_PROGRESS_SUMMARY.md` - Overall testing status

---

## 🆘 Troubleshooting

### Tests Fail to Start

```bash
# Check if port 3001 is available
netstat -an | grep 3001

# Kill process on port 3001 (if needed)
npx kill-port 3001

# Clear test cache
npm run clean:cache
```

### Database Issues

```bash
# Reset test database
npm run db:test:setup

# Seed test data
npm run seed
```

### Browser Issues

```bash
# Reinstall Playwright browsers
npx playwright install
```

### Clear Everything

```bash
npm run clean:all
npm install
```

---

## ✅ Best Practices

1. **Always test on multiple browsers** - Chrome, Firefox, Safari
2. **Test mobile experience** - Most users are on mobile
3. **Test with real data** - Use seed scripts to populate realistic data
4. **Test accessibility** - Use keyboard navigation, screen readers
5. **Test error states** - What happens when things go wrong?
6. **Test performance** - How fast does it feel?
7. **Test security** - Can users access things they shouldn't?
8. **Document issues** - Take screenshots, note steps to reproduce

---

## 🎯 Daily Testing Routine

### Quick Smoke Test (5 minutes)

```bash
npm run test:load:smoke
npm run test:e2e -- tests/e2e/critical-flows.spec.ts
```

### Pre-Commit Testing (15 minutes)

```bash
npm run test
npm run test:e2e
```

### Pre-Deploy Testing (30 minutes)

```bash
npm run test:full
npm run test:a11y
npm run security:full
```

---

## 📞 Getting Help

If tests are failing or you need help:

1. Check test reports: `npx playwright show-report`
2. Run tests in debug mode: `npm run test:e2e:debug`
3. Check logs in `tests/` directory
4. Review error screenshots in `test-results/`
5. Check the test documentation files listed above

---

## 🌟 Pro Tips

### Speed Up Tests

```bash
# Run only what changed
npm run test:e2e -- --grep="checkout"

# Run specific browser only
npm run test:e2e:direct -- --project=chromium

# Run in parallel
npm run test:e2e:omen  # Uses 10 workers
```

### Better Debugging

```bash
# Run with headed browser
npm run test:e2e:headed

# Run with UI
npm run test:e2e:ui

# Generate detailed trace
PWDEBUG=1 npm run test:e2e
```

### Continuous Testing

```bash
# Watch mode - reruns on file changes
npm run test:watch

# Visual test watch
npm run test:visual:ui
```

---

## 🎉 Happy Testing!

Remember: **Good testing leads to confident deployments and happy users!** 🚀

The goal is to catch bugs before real users do, ensure the site is accessible to everyone, and maintain high performance under load.

**Test often, test thoroughly, deploy confidently!** ✨
