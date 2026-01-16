# Session 3 Type Errors Audit

**Date**: January 2025  
**Audit Type**: TypeScript Type Errors in `src/lib/testing/`  
**Total Errors Found**: 111 errors in source code (excluding node_modules)

---

## 📊 Error Summary

### By File
| File | Error Count | Primary Issues |
|------|-------------|----------------|
| `src/lib/testing/modules/auth/login.module.ts` | 42 | Property access, type mismatches, method names |
| `src/lib/testing/seed-data.ts` | 15 | Type inference, property assignments |
| `src/lib/testing/utils/screenshots.ts` | 8 | Type safety, error handling |
| `src/lib/testing/cli/index.ts` | 11 | Property access on BotConfig |
| `src/lib/testing/core/report-generator.ts` | 11 | Property access on BotConfig/BotResult |
| `src/lib/testing/core/test-runner.ts` | 3 | Optional property access |
| `src/lib/testing/config/bot-config.ts` | 3 | Type assignment mismatches |
| `src/lib/testing/modules/pages/new-pages.module.ts` | 6 | TestCategory type mismatches |
| `src/lib/testing/modules/marketplace/browse.module.ts` | 1 | TestCategory type mismatch |
| `src/types/global.d.ts` | 11 | Type declaration conflicts |

---

## 🔍 Error Categories

### 1. BotConfig Property Access Issues (15 errors)
**Problem**: Code tries to access nested properties at root level

**Examples**:
```typescript
// ❌ ERROR: Property 'headless' does not exist on type 'BotConfig'
config.headless

// ✅ CORRECT: Should be
config.browser.headless
```

**Affected Properties**:
- `config.headless` → should be `config.browser.headless`
- `config.timeout` → should be `config.browser.timeout`
- `config.reportDir` → should be `config.reporting.outputDir`
- `config.continueOnFailure` → should be `config.execution.continueOnFailure`
- `config.screenshot` → should be `config.reporting.screenshotOnFailure`
- `config.testUsers` → should be `config.testData?.credentials`

**Files Affected**:
- `src/lib/testing/cli/index.ts` (lines 204, 208, 216, 220, 501, 534, 587)
- `src/lib/testing/core/report-generator.ts` (lines 268, 270, 271)

---

### 2. BotResult Missing 'screenshot' Property (9 errors)
**Problem**: BotResult interface doesn't include optional screenshot property

**Current BotResult Interface** (lines 207-222):
```typescript
export interface BotResult {
  moduleId: string;
  moduleName: string;
  status: "success" | "failure" | "skipped";
  startTime: Date;
  endTime: Date;
  duration: number;
  error?: string;
  metrics?: {
    totalTests?: number;
    passedTests?: number;
    failedTests?: number;
    skippedTests?: number;
    successRate?: number;
    results?: any[];
  };
  logs?: string[];
}
```

**Fix Needed**: Add optional screenshot property
```typescript
export interface BotResult {
  // ... existing properties ...
  screenshot?: string; // Path to screenshot file
}
```

**Files Affected**:
- `src/lib/testing/cli/index.ts` (lines 454, 456)
- `src/lib/testing/core/report-generator.ts` (lines 224, 225, 493, 549, 550)
- `src/lib/testing/modules/auth/login.module.ts` (lines 57, 84, 158, 180, 267, 345, 434, 446)

---

### 3. BrowserManager Method Name Mismatches (8 errors)
**Problem**: Code calls methods that don't exist on BrowserManager

**Incorrect Method Calls**:
```typescript
// ❌ ERROR: Property 'navigateTo' does not exist
browserManager.navigateTo(url)

// ❌ ERROR: Property 'takeScreenshot' does not exist
browserManager.takeScreenshot(name)
```

**Correct Method Names**:
```typescript
// ✅ CORRECT:
browserManager.navigate(url)
browserManager.screenshot(name)
```

**Files Affected**:
- `src/lib/testing/modules/auth/login.module.ts` (lines 38, 149, 246, 328, 109, 206, 293, 406)

---

### 4. TestCategory Type Mismatches (7 errors)
**Problem**: Using lowercase string instead of enum value

**Error Example**:
```typescript
// ❌ ERROR: Type '"auth"' is not assignable to type 'TestCategory'
category: "auth"
```

**Fix**: Use uppercase enum value
```typescript
// ✅ CORRECT:
category: "AUTH" as TestCategory
```

**TestCategory enum values** (lines 22-35):
- "HEALTH_CHECK"
- "AUTH"
- "MARKETPLACE"
- "CART"
- "CHECKOUT"
- "FARMER_DASHBOARD"
- "ADMIN"
- "MONITORING"
- "INTEGRATION"
- "E2E"
- "PERFORMANCE"
- "SECURITY"

**Files Affected**:
- `src/lib/testing/modules/auth/login.module.ts` (lines 21, 129, 226, 311, 388)
- `src/lib/testing/modules/pages/new-pages.module.ts` (lines 29, 145, 227, 306, 390, 493)
- `src/lib/testing/modules/marketplace/browse.module.ts` (line 31)

---

### 5. BotResult.metrics Extended Properties (9 errors)
**Problem**: Trying to add properties not in metrics type definition

**Current metrics type**:
```typescript
metrics?: {
  totalTests?: number;
  passedTests?: number;
  failedTests?: number;
  skippedTests?: number;
  successRate?: number;
  results?: any[];
}
```

**Properties being added but not defined**:
- `titleCheck`
- `email`
- `url`
- `currentUrl`
- `farmName`

**Fix Options**:
1. Add these to the metrics type definition
2. Use a more flexible type like `Record<string, any>`
3. Create a separate `metadata` field

**Files Affected**:
- `src/lib/testing/modules/auth/login.module.ts` (lines 47, 98, 117, 194, 214, 299, 355)

---

### 6. Optional Properties in Config (3 errors)
**Problem**: Assigning optional properties to required properties

**Error in bot-config.ts**:
```typescript
// Line 310: monitoring property is optional but being assigned with optional fields
monitoring: {
  enabled?: boolean;  // Should be: enabled: boolean
  interval?: number;  // Should be: interval: number
  alertThreshold?: number;  // Should be: alertThreshold: number
}

// Line 318: testData property
testData: {
  useSeededData?: boolean;  // Should be: useSeededData: boolean
  generateDynamic?: boolean;  // Should be: generateDynamic: boolean
}

// Line 378: string | undefined assigned to string
baseUrl: process.env.BASE_URL  // Should have fallback
```

**Files Affected**:
- `src/lib/testing/config/bot-config.ts` (lines 310, 318, 378)

---

### 7. Error Type Issues (3 errors)
**Problem**: Passing `unknown` to logger expecting `Error | LogContext`

**Error Example**:
```typescript
logger.error("Message", error);  // error is 'unknown'
```

**Fix**: Type guard or cast
```typescript
logger.error("Message", error instanceof Error ? error : new Error(String(error)));
```

**Files Affected**:
- `src/lib/testing/core/report-generator.ts` (lines 78, 651)
- `src/lib/testing/modules/auth/login.module.ts` (lines 107, 204, 290, 371, 453)

---

### 8. Optional Property Access (3 errors)
**Problem**: Accessing properties that might be undefined

**Error Example**:
```typescript
// ❌ ERROR: 'm.tags' is possibly 'undefined'
module.tags.includes(tag)
```

**Fix**: Use optional chaining
```typescript
// ✅ CORRECT:
module.tags?.includes(tag)
```

**Files Affected**:
- `src/lib/testing/core/test-runner.ts` (lines 379, 398)
- `src/lib/testing/cli/index.ts` (line 358)

---

### 9. Property Does Not Exist (2 errors)
**Problem**: Accessing properties that don't exist on interface

**Examples**:
```typescript
// ❌ ERROR: Property 'tests' does not exist on type 'BotModule'
module.tests

// ❌ ERROR: Property 'farmName' does not exist
testUsers.farmer.farmName
```

**Files Affected**:
- `src/lib/testing/cli/index.ts` (line 359)
- `src/lib/testing/modules/auth/login.module.ts` (line 195)

---

### 10. Type Comparison Issues (1 error)
**Problem**: Comparing incompatible types

**Error**:
```typescript
// Line 346: Comparison appears unintentional
if (module.category === "CRITICAL")  // TestCategory doesn't have "CRITICAL"
```

**Files Affected**:
- `src/lib/testing/cli/index.ts` (line 346)

---

### 11. seed-data.ts Issues (15 errors)
**Problem**: Various type inference and assignment issues

**Common patterns**:
- Return type inference issues with Prisma queries
- Optional chaining needed for potentially undefined values
- Type assertions needed for complex nested objects

**Files Affected**:
- `src/lib/testing/seed-data.ts` (lines 99-600, scattered)

---

### 12. screenshots.ts Issues (8 errors)
**Problem**: Type safety in screenshot utility functions

**Common patterns**:
- Optional parameter handling
- Promise type definitions
- Path resolution type safety

**Files Affected**:
- `src/lib/testing/utils/screenshots.ts` (lines 134, 176, 261, 335, 463, 508, 536, 551)

---

### 13. global.d.ts Issues (11 errors)
**Problem**: Type declaration conflicts and redeclarations

**Issues**:
- Duplicate type declarations
- Conflicting global type definitions
- Type incompatibilities with library types

**Files Affected**:
- `src/types/global.d.ts` (lines 13, 45, 46, 51, 78, 179, 199, 222)

---

## 🎯 Fix Strategy

### Phase 1: Update Type Definitions (Foundation)
1. ✅ **Update BotResult interface** - Add `screenshot?: string`
2. ✅ **Extend BotResult.metrics** - Add missing properties or use flexible type
3. ✅ **Review BotModule interface** - Confirm property existence
4. ✅ **Fix global.d.ts** - Resolve type declaration conflicts

### Phase 2: Fix Property Access Patterns
1. ✅ **Create helper functions** for BotConfig nested property access
2. ✅ **Update all `config.headless`** → `config.browser.headless`
3. ✅ **Update all `config.reportDir`** → `config.reporting.outputDir`
4. ✅ **Update all property accesses** to use correct nested paths

### Phase 3: Fix Method Name Mismatches
1. ✅ **Update `navigateTo`** → `navigate`
2. ✅ **Update `takeScreenshot`** → `screenshot`
3. ✅ **Verify BrowserManager interface** matches usage

### Phase 4: Fix TestCategory Usage
1. ✅ **Update all lowercase strings** to uppercase enum values
2. ✅ **Add type assertions** where needed
3. ✅ **Verify enum completeness**

### Phase 5: Fix Type Safety Issues
1. ✅ **Add optional chaining** where needed
2. ✅ **Add type guards** for error handling
3. ✅ **Fix optional property assignments**
4. ✅ **Add proper type assertions** in seed-data.ts and screenshots.ts

### Phase 6: Verification
1. ✅ Run `tsc --noEmit` with testing directory included
2. ✅ Verify 0 errors
3. ✅ Update tsconfig.json to remove exclusion
4. ✅ Run full test suite

---

## 📈 Expected Outcome

**Before**:
- 111 type errors in testing directory
- Testing utilities excluded from type-checking
- Potential runtime errors from type mismatches

**After**:
- 0 type errors
- 100% of codebase type-checked
- Improved code quality and safety
- Better IDE support and autocomplete
- Reduced runtime errors

---

## 🔧 Tools & Commands

**Audit type errors**:
```bash
npx tsc --project tsconfig.testing.json --noEmit 2>&1 | grep "^src/"
```

**Count errors by file**:
```bash
npx tsc --project tsconfig.testing.json --noEmit 2>&1 | grep "^src/" | cut -d':' -f1 | sort | uniq -c | sort -rn
```

**Test specific file**:
```bash
npx tsc --noEmit src/lib/testing/types.ts
```

---

**Next Steps**: Begin Phase 1 - Update Type Definitions