# 🚀 VALIDATION QUICK REFERENCE

**One-Page Guide for Platform Validation & Common Fixes**

---

## ⚡ QUICK COMMANDS

```bash
# Daily Pre-Commit
npm run validate:quick          # 2 min - TypeScript + tests

# Weekly Health Check
npm run validate:all            # 10 min - Full validation

# Specific Checks
npm run validate:platform       # Architecture & capabilities
npm run validate:errors         # Error detection
npm run type-check             # TypeScript only
npm test                       # Unit tests
npm run test:coverage          # With coverage report
```

---

## 📊 INTERPRETING SCORES

| Score | Meaning | Action |
|-------|---------|--------|
| 90-100% | ✅ Excellent | Maintain quality |
| 70-89% | 🟡 Good | Minor improvements |
| 50-69% | 🟠 Fair | Needs work |
| <50% | 🔴 Poor | Critical fixes needed |

**Current Platform Score: 92.3%** ✅

---

## 🔧 COMMON FIXES

### 1. Canonical Database Import

```typescript
// ❌ WRONG
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ CORRECT
import { database } from '@/lib/database';
```

**Find violations:**
```bash
grep -r "new PrismaClient" src/ --exclude-dir=prisma
```

### 2. Canonical Service Import

```typescript
// ❌ WRONG
import { FarmService } from '../services/farm.service';

// ✅ CORRECT
import { farmService } from '@/lib/services';
```

**Update all imports:**
```bash
find src -name "*.ts" -exec sed -i '' \
  's|from.*services/farm.service|from "@/lib/services"|g' {} \;
```

### 3. Add Error Handling to Services

```typescript
// ❌ WRONG
async createFarm(data: FarmData) {
  return await database.farm.create({ data });
}

// ✅ CORRECT
async createFarm(data: FarmData): Promise<Farm> {
  try {
    const farm = await database.farm.create({ data });
    return farm;
  } catch (error) {
    throw new Error(`Failed to create farm: ${error.message}`);
  }
}
```

### 4. Export Services from Barrel

```typescript
// src/lib/services/index.ts
export { farmService } from './farm.service';
export { productService } from './product.service';
export { orderService } from './order.service';
export { cartService } from './cart.service';
// Add all services here
```

### 5. Fix TypeScript Errors

```bash
# Watch mode for live feedback
npx tsc --noEmit --watch

# See all errors
npx tsc --noEmit 2>&1 | tee typescript-errors.log

# Fix from first to last (cascading)
```

---

## 🧪 TESTING CHECKLIST

### Add Service Test
```typescript
// src/lib/services/__tests__/farm.service.test.ts
import { farmService } from '../farm.service';
import { database } from '@/lib/database';

describe('FarmService', () => {
  it('should create farm with valid data', async () => {
    const farmData = { name: 'Test Farm' };
    const farm = await farmService.createFarm(farmData);
    expect(farm.name).toBe('Test Farm');
  });
});
```

### Add API Test
```typescript
// src/app/api/__tests__/farms.test.ts
import { POST } from '../farms/route';

describe('Farms API', () => {
  it('should create farm', async () => {
    const request = new Request('http://localhost/api/farms', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' })
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

---

## 📋 PRE-COMMIT CHECKLIST

```bash
# 1. Format code
npm run format

# 2. Fix linting
npm run lint:fix

# 3. Type check
npm run type-check

# 4. Run tests
npm test

# 5. Quick validation
npm run validate:quick

# 6. Stage and commit
git add -A
git commit -m "fix: description"
```

---

## 🚨 FIXING VALIDATION FAILURES

### Architecture: FAIL
```bash
# Missing layer detected
mkdir -p src/lib/services
touch src/lib/services/index.ts
```

### Route Groups: FAIL
```bash
# Missing critical route group
mkdir -p "src/app/(admin)"
touch "src/app/(admin)/layout.tsx"
touch "src/app/(admin)/page.tsx"
```

### API Integration: WARNING
```bash
# Missing service for API
touch src/lib/services/marketplace.service.ts
# Add to src/lib/services/index.ts
```

### Database: WARNING
```bash
# Fix singleton pattern in src/lib/database.ts
# Ensure it uses global caching
```

### Services: WARNING
```bash
# Update service to use canonical imports
# Replace PrismaClient with @/lib/database
```

### TypeScript: FAIL
```bash
# Run and fix iteratively
npx tsc --noEmit --watch
```

### Test Coverage: WARNING
```bash
# Add tests to reach 30%+ coverage
npm run test:coverage
```

---

## 📈 VALIDATION WORKFLOW

### Daily (Pre-Commit)
```bash
npm run validate:quick && git commit
```

### Weekly (Health Check)
```bash
npm run validate:all > validation-$(date +%Y%m%d).log
cat platform-validation-report.md
```

### Pre-Merge
```bash
npm run validate:all
npm run test:all
npm run build
git push
```

### After Major Changes
```bash
npm run validate:all
npm run test:coverage
npm run build:analyze
```

---

## 🎯 PRIORITY FIXES (Right Now)

1. **TypeScript Errors (27)** - Run `npx tsc --noEmit --watch`
2. **Test Coverage (4.1%)** - Add tests for services
3. **Canonical Imports** - Update farm.service.ts, geocoding.service.ts
4. **Missing Services** - Create marketplace.service.ts, farmer.service.ts
5. **Error Handling** - Add try-catch to all services

---

## 💡 TIPS & TRICKS

### Find All TypeScript Errors
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

### Check Import Pattern Usage
```bash
# Database imports
grep -r "@/lib/database" src/ | wc -l

# Service imports
grep -r "@/lib/services" src/ | wc -l
```

### List All Services
```bash
ls -la src/lib/services/*.service.ts
```

### Check Test Coverage by Directory
```bash
npm run test:coverage -- --collectCoverageFrom="src/lib/services/**"
```

### Find Files Without Tests
```bash
find src/lib/services -name "*.service.ts" ! -path "*__tests__*"
```

---

## 🔗 QUICK LINKS

- **Full Guide**: [PLATFORM_VALIDATION_GUIDE.md](./PLATFORM_VALIDATION_GUIDE.md)
- **Latest Report**: [platform-validation-report.md](./platform-validation-report.md)
- **Summary**: [VALIDATION_SUMMARY.md](./VALIDATION_SUMMARY.md)
- **Divine Rules**: [.cursorrules](./.cursorrules)

---

## 📞 HELP

**Validation failing?**
1. Read error messages carefully
2. Check `platform-validation-report.md`
3. Review `error-detection-report.json`
4. Consult [PLATFORM_VALIDATION_GUIDE.md](./PLATFORM_VALIDATION_GUIDE.md)

**TypeScript errors?**
1. Run `npx tsc --noEmit`
2. Fix first error
3. Re-run (errors often cascade)
4. Repeat until clean

**Tests failing?**
1. Run `npm test -- --verbose`
2. Check test setup in `jest.setup.js`
3. Verify mocks in `__mocks__/`
4. Run single test: `npm test -- path/to/test.ts`

---

## ✅ SUCCESS = GREEN VALIDATION

```
📊 SUMMARY STATISTICS
================================================================================
✅ PASS: 11
⚠️  WARNING: 2
❌ FAIL: 0
📈 OVERALL SCORE: 92.3%
```

**Target: All PASS, 0 WARNINGS, 0 FAILS, 95%+ Score**

---

*Keep this file handy for daily validation and fixes!* 🚀