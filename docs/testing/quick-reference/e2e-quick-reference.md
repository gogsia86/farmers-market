# 🧪 E2E Testing Quick Reference

## Setup (First Time Only)

```bash
# Install Playwright browsers
npx playwright install

# Setup test database
npm run db:test:setup
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/critical-flows.spec.ts

# Run specific test by name
npx playwright test -g "Admin can login"
```

## Test Credentials

| Role         | Email                     | Password             |
| ------------ | ------------------------- | -------------------- |
| **Admin**    | `admin@farmersmarket.app` | `DivineAdmin123!`    |
| **Farmer**   | `ana.romana@email.com`    | `FarmLife2024!`      |
| **Consumer** | `divna.kapica@email.com`  | `HealthyEating2024!` |

## Before Running Tests

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
npm run test:e2e
```

## Troubleshooting

### Tests can't find elements

```bash
# Verify database is seeded
npm run db:test:setup

# Check dev server is running
curl http://localhost:3000
```

### Authentication failures

```bash
# Reset database and seed
npm run db:test:setup

# Verify environment variables
cat .env | grep NEXTAUTH
```

### Port already in use

```bash
# Kill process on port 3000 (Windows PowerShell)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9
```

## Available Test IDs

```typescript
// Navigation
"cart-button"; // Cart link in header
"cart-count"; // Cart item count badge
"mobile-menu-button"; // Mobile menu toggle
"mobile-menu"; // Mobile menu container
"browse-farms-link"; // Farms navigation link

// Products
"add-to-cart"; // Add to cart button
'data-category="..."'; // Category filter buttons

// Farms
"farm-card"; // Farm listing card

// Cart
"cart-item"; // Cart item row
```

## Quick Commands

```bash
# Full test workflow
npm run db:test:setup && npm run dev & npm run test:e2e

# Reset and test
npm run db:test:setup && npm run test:e2e

# View last test report
npx playwright show-report
```

## Test Coverage

✅ **Passing**: 334/348 tests (96%)  
⚠️ **Failing**: 14/348 tests (4% - E2E only)

---

**Need Help?** See `docs/testing/E2E_TESTING_GUIDE.md` for full documentation.
