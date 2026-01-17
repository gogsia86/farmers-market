# Test Triage Plan - Farmers Market Platform
**Generated:** January 17, 2025  
**Current Status:** 482 failures out of 3,178 tests (80.4% pass rate)  
**Target:** 95%+ pass rate

---

## 📊 Executive Summary

**Current Test Results:**
- **Total Tests:** 3,178
- **Passed:** 2,555 (80.4%)
- **Failed:** 482 (15.2%)
- **Skipped:** 141 (4.4%)
- **Test Suites:** 30 failed, 4 skipped, 48 passed (78 total)

**Key Finding:** The majority of failures (estimated 60-70%) are due to **test environment misconfiguration** (missing jsdom), not actual code issues.

---

## 🔍 Failure Categories & Analysis

### Category 1: Test Environment Issues (jsdom) 🔴 **CRITICAL**
**Estimated Impact:** ~300-350 failures (60-70% of total failures)

**Root Cause:**
Tests using React hooks (`renderHook`) or components that rely on browser APIs (`document`, `window`, `localStorage`, `navigator`) are failing with:
```
ReferenceError: document is not defined
The error below may be caused by using the wrong test environment
Consider using the "jsdom" test environment.
```

**Affected Test Files (Confirmed):**
- `src/stores/__tests__/checkoutStore.test.ts` (ALL 47 tests failing)
- `src/stores/__tests__/*.test.ts` (likely ALL Zustand store tests)
- Any component test using `@testing-library/react`
- Tests with `renderHook()` calls

**Solution:** Add jsdom environment directive to affected files:
```typescript
/**
 * @jest-environment jsdom
 */
```

**Estimated Fix Time:** 2-3 hours
**Priority:** P0 (Blocks 60-70% of failures)

---

### Category 2: Module Resolution / Import Errors 🟠 **HIGH**
**Estimated Impact:** ~50-80 failures (10-15% of total)

**Root Cause:**
- Missing path aliases in jest.config
- Incorrect import statements
- Module not found errors

**Common Patterns:**
```
Cannot find module '@/some/path'
Module not found: Can't resolve 'package-name'
```

**Solution:**
- Review jest.config.mjs moduleNameMapper
- Fix import paths in test files
- Ensure all dependencies are installed

**Estimated Fix Time:** 3-4 hours
**Priority:** P1 (After jsdom fixes)

---

### Category 3: Assertion Failures 🟡 **MEDIUM**
**Estimated Impact:** ~30-50 failures (6-10% of total)

**Root Cause:**
- Actual logic errors in tests or code
- Incorrect mock implementations
- Changed behavior not reflected in tests

**Common Patterns:**
```
expect(received).toBe(expected)
expect(received).toHaveBeenCalledWith(...)
```

**Solution:**
- Review each assertion failure individually
- Update test expectations to match current behavior
- Fix actual bugs if tests are correct

**Estimated Fix Time:** 4-6 hours
**Priority:** P2 (After environment and module fixes)

---

### Category 4: Database/Prisma Issues 🟡 **MEDIUM**
**Estimated Impact:** ~20-40 failures (4-8% of total)

**Root Cause:**
- Prisma client not properly mocked
- Database connection issues in test environment
- Missing test data setup

**Common Patterns:**
```
PrismaClient is not available
Database connection failed
relation "Table" does not exist
```

**Solution:**
- Verify jest.setup.cjs Prisma mocks
- Ensure test database is running (postgres:5433)
- Review database seeding for tests

**Estimated Fix Time:** 2-3 hours
**Priority:** P2 (Parallel with assertion fixes)

---

### Category 5: Timeout Issues 🟢 **LOW**
**Estimated Impact:** ~10-20 failures (2-4% of total)

**Root Cause:**
- Tests taking too long (async operations not properly awaited)
- Infinite loops or hanging promises
- Test timeout set too low

**Solution:**
- Increase timeout for specific slow tests
- Review async/await patterns
- Add proper cleanup in afterEach

**Estimated Fix Time:** 1-2 hours
**Priority:** P3 (After major issues resolved)

---

## 🎯 Action Plan (Phased Approach)

### Phase 1: Quick Wins (jsdom fixes) - **Target: 350+ tests fixed**
**Timeline:** Day 1 (2-3 hours)

1. **Identify all affected test files:**
   ```bash
   npm run test:unit 2>&1 | grep "jsdom" -B 5 | grep "FAIL" | awk '{print $3}'
   ```

2. **Batch add jsdom environment:**
   - Create script to add `@jest-environment jsdom` to all React/hook test files
   - Focus on these directories:
     - `src/stores/__tests__/`
     - `src/components/__tests__/`
     - `src/hooks/__tests__/`

3. **Verify fixes:**
   ```bash
   npm run test:unit -- --testPathPattern="stores|components|hooks"
   ```

**Expected Outcome:** Pass rate jumps from 80.4% → ~91-92%

---

### Phase 2: Module Resolution - **Target: 80+ tests fixed**
**Timeline:** Day 2 (3-4 hours)

1. **Analyze import errors:**
   ```bash
   npm run test:unit 2>&1 | grep "Cannot find module" -A 3
   ```

2. **Fix jest.config.mjs if needed:**
   - Verify all path aliases map correctly
   - Add missing module mocks

3. **Fix individual import statements**

**Expected Outcome:** Pass rate jumps to ~93-94%

---

### Phase 3: Assertion & Logic Fixes - **Target: 50+ tests fixed**
**Timeline:** Day 3-4 (4-6 hours)

1. **Categorize assertion failures by component/feature**
2. **Fix in logical groups:**
   - Auth tests
   - Farm management tests
   - Product tests
   - Order/checkout tests
   - API route tests

3. **Update snapshots if needed**

**Expected Outcome:** Pass rate jumps to ~95%+

---

### Phase 4: Database & Cleanup - **Target: Remaining failures**
**Timeline:** Day 5 (2-3 hours)

1. Fix Prisma/database test issues
2. Address timeout issues
3. Clean up skipped tests
4. Final verification

**Expected Outcome:** Pass rate reaches 95-97%+

---

## 🛠️ Implementation Scripts

### Script 1: Identify jsdom Candidates
```bash
# Find all test files that use renderHook or render
grep -r "renderHook\|from '@testing-library/react'" src --include="*.test.ts" --include="*.test.tsx" -l
```

### Script 2: Add jsdom Environment (Semi-automated)
```typescript
// scripts/add-jsdom-to-tests.ts
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const testFiles = glob.sync('src/**/*.test.ts{,x}');

for (const file of testFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Check if file uses React Testing Library
  if (content.includes('@testing-library/react') && 
      !content.includes('@jest-environment jsdom')) {
    
    // Add jsdom directive at top
    const newContent = `/**
 * @jest-environment jsdom
 */

${content}`;
    
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`✅ Added jsdom to: ${file}`);
  }
}
```

### Script 3: Run Specific Test Categories
```bash
# Test only stores
npm run test:unit -- --testPathPattern="stores"

# Test only components
npm run test:unit -- --testPathPattern="components"

# Test only hooks
npm run test:unit -- --testPathPattern="hooks"

# Test only API routes
npm run test:unit -- --testPathPattern="api"
```

---

## 📈 Progress Tracking

### Checkpoints
- [ ] **Phase 1 Complete:** Pass rate ≥ 91%
- [ ] **Phase 2 Complete:** Pass rate ≥ 93%
- [ ] **Phase 3 Complete:** Pass rate ≥ 95%
- [ ] **Phase 4 Complete:** Pass rate ≥ 97%
- [ ] **Final Verification:** All critical paths have passing tests
- [ ] **Documentation:** Update test docs with findings

### Daily Progress Log
```
Day 1 (Target): Fix jsdom issues → 91%+ pass rate
Day 2 (Target): Fix module issues → 93%+ pass rate
Day 3 (Target): Fix assertions → 95%+ pass rate
Day 4 (Target): Polish & cleanup → 97%+ pass rate
```

---

## 🚨 Known Issues to Monitor

1. **Pre-existing skipped tests (141):** Review why these are skipped
2. **Test performance:** Some suites take 50+ seconds (optimize if needed)
3. **Flaky tests:** Monitor for intermittent failures
4. **Coverage gaps:** Identify areas with low test coverage

---

## 📚 Resources

### Key Files
- `jest.config.mjs` - Jest configuration
- `jest.setup.cjs` - Test environment setup
- `jest.env.cjs` - Custom test environment
- `package.json` - Test scripts

### Useful Commands
```bash
# Run single test file
npm run test:unit -- checkoutStore.test.ts

# Run tests matching pattern
npm run test:unit -- --testNamePattern="should initialize"

# Update snapshots
npm run test:unit -- -u

# Run with coverage
npm run test:unit -- --coverage

# Run in watch mode
npm run test:unit -- --watch

# Verbose output
npm run test:unit -- --verbose
```

---

## 🎯 Success Criteria

✅ **Primary Goal:** Achieve 95%+ pass rate  
✅ **Secondary Goal:** 0 environment-related failures  
✅ **Tertiary Goal:** All skipped tests reviewed and either fixed or documented

---

## 🔄 Next Steps

1. **Immediate:** Run the jsdom identification script
2. **Within 1 hour:** Start Phase 1 (jsdom fixes)
3. **Within 4 hours:** Complete Phase 1, verify progress
4. **Within 24 hours:** Complete Phase 2
5. **Within 48 hours:** Reach 95%+ pass rate

---

**Author:** Claude Sonnet 4.5  
**Status:** Ready for implementation  
**Last Updated:** January 17, 2025