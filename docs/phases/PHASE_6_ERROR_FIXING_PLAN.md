# 🔧 Phase 6 - Error Fixing Plan

## Systematic Approach to Resolve Monitoring & TypeScript Errors

**Version**: 1.0  
**Date**: 2025  
**Status**: READY FOR EXECUTION  
**Estimated Total Time**: 4-6 hours  
**Priority**: HIGH - Blocking production build and bundle analysis

---

## 📊 Executive Summary

A comprehensive TypeScript error analysis reveals **~150 errors** blocking the production build. These fall into 4 main categories:

1. **Schema Mismatch Issues** (~80 errors) - Fields referenced in code don't match Prisma schema
2. **Monitoring System Type Issues** (~45 errors) - Type mismatches in monitoring modules
3. **Enum/Status Type Issues** (~15 errors) - Invalid enum values
4. **Minor Issues** (~10 errors) - Unused variables, null checks

**Critical Path**: Fix schema mismatches first → Fix monitoring types → Fix enums → Clean up minor issues

---

## 🎯 Error Categories & Analysis

### Category 1: Schema Mismatch Issues (CRITICAL)

**Impact**: Blocks production build  
**Affected Files**: 15+ files  
**Estimated Time**: 2-3 hours

#### Subcategory 1A: Order Model Issues

**Files Affected**:

- `src/app/(admin)/admin/financial/page.tsx`
- `src/app/(farmer)/farmer/dashboard/page.tsx`
- `src/app/(farmer)/farmer/orders/[id]/page.tsx`

**Missing/Wrong Fields**:

```typescript
// ❌ CURRENT CODE (WRONG)
order.totalAmount; // Property doesn't exist
order.payments; // Property doesn't exist
order.items; // Property doesn't exist
order.fulfillment; // Should be 'fulfilledAt'
order.customer; // Should be included in query

// ✅ NEEDS TO BE (CORRECT)
// 1. Add 'include' to Prisma queries:
const order = await database.order.findUnique({
  where: { id },
  include: {
    items: true, // OrderItem[]
    customer: true, // User
    payments: true, // Payment[]
    // Calculate totalAmount from items
  },
});

// 2. Calculate totalAmount:
const totalAmount = order.items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
);
```

**Action Items**:

- [ ] Review Prisma schema for Order model relationships
- [ ] Add proper `include` clauses to all Order queries
- [ ] Replace `order.totalAmount` with calculated value
- [ ] Replace `order.fulfillment` with `order.fulfilledAt`
- [ ] Replace `order.customer` references with included relation

---

#### Subcategory 1B: Product Model Issues

**Files Affected**:

- `src/app/(admin)/admin/products/page.tsx`
- `src/app/(farmer)/farmer/dashboard/page.tsx`

**Missing/Wrong Fields**:

```typescript
// ❌ CURRENT CODE (WRONG)
product.category; // Should use ProductCategory enum directly
product.stockQuantity; // Property doesn't exist
product.farm; // Not included in query

// ✅ NEEDS TO BE (CORRECT)
const products = await database.product.findMany({
  include: {
    farm: true, // Include farm relation
    inventory: true, // Include inventory for stock
  },
});

// Access stock via inventory relation
const stockQuantity = product.inventory?.quantity ?? 0;
```

**Action Items**:

- [ ] Add `farm` include to Product queries
- [ ] Add `inventory` include for stock data
- [ ] Update category handling (already enum, no `.name` needed)
- [ ] Replace `product.stockQuantity` with `product.inventory?.quantity`

---

#### Subcategory 1C: Farm Model Issues

**Files Affected**:

- `src/app/(farmer)/farmer/dashboard/page.tsx`
- `src/app/(farmer)/farmer/settings/page.tsx`

**Missing/Wrong Fields**:

```typescript
// ❌ CURRENT CODE (WRONG)
farm.products; // Not included in query
farm.contactEmail; // Property doesn't exist
farm.contactPhone; // Property doesn't exist

// ✅ NEEDS TO BE (CORRECT)
const farm = await database.farm.findUnique({
  where: { id },
  include: {
    products: true, // Include products relation
  },
});

// Use existing fields:
const contactEmail = farm.email; // Use 'email' field
const contactPhone = farm.phone; // Use 'phone' field
```

**Action Items**:

- [ ] Add `products` include to Farm queries
- [ ] Replace `farm.contactEmail` with `farm.email`
- [ ] Replace `farm.contactPhone` with `farm.phone`

---

#### Subcategory 1D: User Model Issues

**Files Affected**:

- `src/app/(farmer)/farmer/orders/[id]/page.tsx`
- `src/app/(farmer)/farmer/settings/page.tsx`

**Missing/Wrong Fields**:

```typescript
// ❌ CURRENT CODE (WRONG)
user.image; // Property doesn't exist

// ✅ NEEDS TO BE (CORRECT)
user.avatar; // Use 'avatar' field from schema
```

**Action Items**:

- [ ] Replace all `user.image` with `user.avatar`
- [ ] Update User select/include statements

---

#### Subcategory 1E: Payment/Payout Model Issues

**Files Affected**:

- `src/app/(admin)/admin/financial/page.tsx`

**Missing/Wrong Fields**:

```typescript
// ❌ CURRENT CODE (WRONG)
payment.method; // Property doesn't exist
payout.farmer; // Should be 'farm'
payout.paidAt; // Should be 'paidDate'

// ✅ NEEDS TO BE (CORRECT)
// Check Prisma schema for actual Payment/Payout fields
const payments = await database.payment.findMany({
  include: {
    order: {
      include: {
        customer: true,
      },
    },
  },
});

// For payouts:
payout.farm; // Use correct relation name
payout.paidDate; // Use correct field name
```

**Action Items**:

- [ ] Review Payment model schema for available fields
- [ ] Replace `payment.method` with correct field
- [ ] Replace `payout.farmer` with `payout.farm`
- [ ] Replace `payout.paidAt` with `payout.paidDate`

---

### Category 2: Monitoring System Type Issues (HIGH PRIORITY)

**Impact**: Blocks production build  
**Affected Files**: 8 monitoring modules  
**Estimated Time**: 2 hours

#### Subcategory 2A: Duplicate Functions

**File**: `src/lib/monitoring/bot.ts`

**Issues**:

```typescript
// ❌ DUPLICATE IMPLEMENTATIONS (Lines ~259 and ~303)
function duplicateFunction() { ... }
function duplicateFunction() { ... }  // ERROR!
```

**Action Items**:

- [ ] Identify duplicate function implementations at lines 259 and 303
- [ ] Remove or merge duplicate implementations
- [ ] Ensure consistent function signatures

---

#### Subcategory 2B: Export Conflicts

**File**: `src/lib/monitoring/notifiers/index.ts`

**Issues**:

```typescript
// ❌ CONFLICTING EXPORTS
export interface NotificationResult { ... }
export type NotificationResult = ...;  // CONFLICT!

export interface NotificationManagerConfig { ... }
export type NotificationManagerConfig = ...;  // CONFLICT!
```

**Action Items**:

- [ ] Review export statements at line 541
- [ ] Consolidate to single export per name
- [ ] Use either `interface` or `type`, not both

---

#### Subcategory 2C: Type Mismatches in Storage

**File**: `src/lib/monitoring/storage/database.storage.ts`

**Issues**:

```typescript
// ❌ CURRENT CODE (WRONG)
result.steps.passedSteps; // Property doesn't exist on array
result.steps.failedSteps; // Property doesn't exist on array
result.steps.totalSteps; // Property doesn't exist on array

healthCheck.databaseHealthy; // Property doesn't exist
healthCheck.apiHealthy; // Should be 'healthy'
healthCheck.cacheHealthy; // Property doesn't exist

// ✅ NEEDS TO BE (CORRECT)
const passedSteps = result.steps.filter((s) => s.status === "passed").length;
const failedSteps = result.steps.filter((s) => s.status === "failed").length;
const totalSteps = result.steps.length;

// Use correct HealthCheckResult type structure
const isHealthy = healthCheck.healthy;
```

**Action Items**:

- [ ] Review `WorkflowStepResult[]` type definition
- [ ] Calculate step counts instead of accessing as properties
- [ ] Review `HealthCheckResult` interface
- [ ] Update health check property access
- [ ] Fix metadata JSON type casting issues (line 127)

---

#### Subcategory 2D: Alert Rules Engine Issues

**File**: `src/lib/monitoring/alerts/alert-rules-engine.ts`

**Issues**:

```typescript
// ❌ CURRENT CODE (WRONG)
result.workflow; // Should be 'workflowId'
report.totalWorkflows; // Property doesn't exist
report.passedWorkflows; // Property doesn't exist
report.failedWorkflows; // Property doesn't exist

// ✅ NEEDS TO BE (CORRECT)
result.workflowId; // Use correct property
// Calculate from results array:
const totalWorkflows = results.length;
const passedWorkflows = results.filter((r) => r.status === "passed").length;
const failedWorkflows = results.filter((r) => r.status === "failed").length;
```

**Action Items**:

- [ ] Replace `result.workflow` with `result.workflowId`
- [ ] Calculate workflow counts from results array
- [ ] Update MonitoringReport type to match usage
- [ ] Fix AlertSeverity undefined issue (line 576)

---

#### Subcategory 2E: Monitoring Dashboard Route Issues

**File**: `src/app/(monitoring)/monitoring/page.tsx`

**Issues**:

```typescript
// ❌ CURRENT CODE (WRONG)
select: {
  workflowId: true;
} // Field doesn't exist in WorkflowExecution
select: {
  healthy: true;
} // Field doesn't exist in SystemHealthCheck
select: {
  type: true;
} // Field doesn't exist in NotificationLog

// ✅ NEEDS TO BE (CORRECT)
// Review Prisma schema for WorkflowExecution, SystemHealthCheck, NotificationLog models
// Use actual field names from schema
```

**Action Items**:

- [ ] Review Prisma schema for monitoring models
- [ ] Update select/include clauses to match schema
- [ ] Fix property access for `healthy`, `priority` fields

---

#### Subcategory 2F: Channel/Enum Issues

**File**: `src/lib/monitoring/notifiers/index.ts`

**Issues**:

```typescript
// ❌ CURRENT CODE (WRONG)
channel: "ALL"; // Not in NotificationChannel enum

// ✅ NEEDS TO BE (CORRECT)
// Either add "ALL" to enum or use different approach:
type NotificationChannel = "EMAIL" | "SLACK" | "DISCORD" | "SMS" | "ALL";
// OR use array: channels: ["EMAIL", "SLACK", "DISCORD", "SMS"]
```

**Action Items**:

- [ ] Review NotificationChannel enum definition
- [ ] Add "ALL" to enum or refactor to use array
- [ ] Update all 5 occurrences (lines 110, 164, 213, 268, 316)

---

#### Subcategory 2G: Unused Import Issues

**Files**:

- `src/lib/monitoring/notifiers/discord.notifier.ts`
- `src/lib/monitoring/notifiers/slack.notifier.ts`
- `src/lib/monitoring/reporter.ts`
- `src/lib/monitoring/storage/database.storage.ts`

**Action Items**:

- [ ] Remove unused `Notification` import (if truly unused)
- [ ] Remove unused variables: `emoji`, `color`, `notification`
- [ ] Remove unused type imports: `PrismaWorkflowMetrics`, `PrismaSystemHealthCheck`, `PrismaNotificationLog`
- [ ] Or add `@ts-expect-error` comments if intentionally unused

---

### Category 3: Enum/Status Type Issues (MEDIUM PRIORITY)

**Impact**: Type safety violations  
**Affected Files**: 5 files  
**Estimated Time**: 1 hour

#### Issue 3A: OrderStatus Enum Mismatches

**Files**:

- `src/app/(admin)/admin/financial/page.tsx` - "DELIVERED"
- `src/app/(farmer)/farmer/dashboard/page.tsx` - "READY_FOR_PICKUP"

**Action Items**:

- [ ] Check Prisma schema for `OrderStatus` enum definition
- [ ] Replace invalid status strings with valid enum values
- [ ] Example mapping:
  ```typescript
  // If schema has: COMPLETED, PENDING, CANCELLED
  "DELIVERED" → "COMPLETED"
  "READY_FOR_PICKUP" → "READY" (or whatever schema has)
  ```

---

#### Issue 3B: PaymentStatus Enum Mismatch

**File**: `src/app/(admin)/admin/financial/page.tsx`

**Action Items**:

- [ ] Check Prisma schema for `PaymentStatus` enum
- [ ] Replace "COMPLETED" with valid enum value (likely "SUCCEEDED" or similar)

---

#### Issue 3C: FarmStatus Enum Mismatch

**File**: `src/app/(farmer)/farmer/settings/page.tsx`

**Action Items**:

- [ ] Check Prisma schema for `FarmStatus` enum
- [ ] Replace "PENDING_VERIFICATION" with valid enum value (likely "PENDING")

---

#### Issue 3D: ProductCategory Enum Usage

**File**: `src/app/(admin)/admin/products/page.tsx`

**Issue**:

```typescript
// ❌ WRONG
product.category.name; // category IS the enum, doesn't have .name

// ✅ CORRECT
product.category; // Already a string enum value
```

**Action Items**:

- [ ] Remove `.name` access from category enum
- [ ] Use enum value directly

---

### Category 4: Minor Issues (LOW PRIORITY)

**Impact**: Code quality  
**Estimated Time**: 30 minutes

#### Unused Variables

**Action Items**:

- [ ] Add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` for:
  - `ArrowTrendingDownIcon` (admin/financial/page.tsx)
  - `session` (multiple files)
  - `startOfYear` (farmer/analytics/page.tsx)
  - `baseUrl` (workflow-executor.ts)

#### Possibly Undefined Checks

**Action Items**:

- [ ] Add null checks for:
  - `step` variable (farmer/orders/[id]/page.tsx) - multiple occurrences
  - `revenue._sum` (farmer/dashboard/page.tsx)
  - `farm.products` (farmer/dashboard/page.tsx)

#### Image Type Issues

**File**: `src/app/(admin)/admin/products/page.tsx`

**Action Items**:

- [ ] Add fallback for undefined image:
  ```typescript
  image={product.images[0] ?? '/placeholder.jpg'}
  ```

---

## 🚀 Execution Plan

### Phase 1: Schema Investigation (30 minutes)

**Goal**: Understand actual Prisma schema structure

```bash
# 1. Generate fresh Prisma types
npx prisma generate

# 2. Review schema file
cat prisma/schema.prisma | grep -A 20 "model Order"
cat prisma/schema.prisma | grep -A 20 "model Product"
cat prisma/schema.prisma | grep -A 20 "model Farm"
cat prisma/schema.prisma | grep -A 20 "model Payment"
cat prisma/schema.prisma | grep -A 20 "model WorkflowExecution"
cat prisma/schema.prisma | grep -A 20 "model SystemHealthCheck"

# 3. Review enums
cat prisma/schema.prisma | grep "enum"
```

**Deliverable**: Schema reference document with all models and fields

---

### Phase 2: Fix Schema Mismatches (2-3 hours)

**Priority Order**:

1. **Admin Financial Page** (45 min)
   - Fix Order queries (add includes)
   - Fix Payment/Payout references
   - Fix enum values

2. **Farmer Dashboard** (30 min)
   - Fix Farm product includes
   - Fix Order queries
   - Fix revenue calculations

3. **Farmer Orders Detail Page** (30 min)
   - Fix Order includes (items, customer)
   - Fix fulfillment references
   - Add null checks for step variable

4. **Admin Products Page** (20 min)
   - Fix Product includes (farm, inventory)
   - Fix category enum usage
   - Fix image fallback

5. **Farmer Settings Page** (15 min)
   - Fix User avatar references
   - Fix Farm contact fields
   - Fix status enum

6. **Admin Users Page** (10 min)
   - Remove unused session variable

---

### Phase 3: Fix Monitoring System (2 hours)

**Priority Order**:

1. **Storage Layer** (45 min)
   - File: `src/lib/monitoring/storage/database.storage.ts`
   - Fix step count calculations
   - Fix health check properties
   - Fix metadata JSON casting
   - Remove unused type imports

2. **Alert Rules Engine** (30 min)
   - File: `src/lib/monitoring/alerts/alert-rules-engine.ts`
   - Fix workflow property access
   - Fix report calculations
   - Fix AlertSeverity undefined

3. **Notifiers** (30 min)
   - Fix export conflicts in `notifiers/index.ts`
   - Add "ALL" to NotificationChannel enum
   - Remove unused imports

4. **Bot Module** (15 min)
   - File: `src/lib/monitoring/bot.ts`
   - Remove duplicate functions

---

### Phase 4: Fix Enums (30 minutes)

1. **Create Enum Mapping Document**

   ```typescript
   // docs/ENUM_MAPPINGS.md
   OrderStatus: PENDING |
     CONFIRMED |
     PROCESSING |
     READY |
     COMPLETED |
     CANCELLED;
   PaymentStatus: PENDING | PROCESSING | SUCCEEDED | FAILED | REFUNDED;
   FarmStatus: DRAFT | PENDING | ACTIVE | SUSPENDED | INACTIVE;
   ```

2. **Update All Enum References**
   - Search for invalid enum strings
   - Replace with valid values
   - Add type assertions where needed

---

### Phase 5: Clean Up Minor Issues (30 minutes)

1. **Add Unused Variable Suppressions**

   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const unusedVar = ...;
   ```

2. **Add Null Checks**

   ```typescript
   if (!step) continue;
   const sum = revenue._sum?.total ?? 0;
   ```

3. **Add Image Fallbacks**
   ```typescript
   image={product.images?.[0] ?? '/placeholder.jpg'}
   ```

---

### Phase 6: Verification (30 minutes)

1. **TypeScript Check**

   ```bash
   npx tsc --noEmit
   # Should show 0 errors
   ```

2. **Production Build**

   ```bash
   rm -rf .next
   npm run build
   # Should complete successfully
   ```

3. **Bundle Analysis**

   ```bash
   npm run build:analyze
   # Opens analyzer reports
   ```

4. **Document Results**
   - Update PHASE_6_DAY_3_PROGRESS.md
   - Record bundle size improvements
   - Create completion document

---

## 📋 Verification Checklist

### Pre-Fix Verification

- [ ] Count total TypeScript errors: `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l`
- [ ] Document baseline: ~150 errors
- [ ] Create git branch: `git checkout -b fix/phase-6-typescript-errors`

### Post-Category Verification

- [ ] After Schema Fixes: Run `npx tsc --noEmit` (expect ~70 remaining)
- [ ] After Monitoring Fixes: Run `npx tsc --noEmit` (expect ~10 remaining)
- [ ] After Enum Fixes: Run `npx tsc --noEmit` (expect ~5 remaining)
- [ ] After Minor Fixes: Run `npx tsc --noEmit` (expect 0 errors)

### Final Verification

- [ ] `npx tsc --noEmit` shows 0 errors
- [ ] `npm run build` completes successfully
- [ ] `npm run build:analyze` generates reports
- [ ] `.next/analyze/nodejs.html` opens without errors
- [ ] `.next/analyze/client.html` opens without errors
- [ ] Dev server runs: `npm run dev`
- [ ] No console errors in browser
- [ ] All critical pages load correctly

---

## 🎯 Success Criteria

### Must Have (Critical)

- ✅ Zero TypeScript compilation errors
- ✅ Production build completes successfully
- ✅ Bundle analyzer reports generated
- ✅ All admin pages compile without errors
- ✅ All farmer pages compile without errors
- ✅ All monitoring modules compile without errors

### Should Have (Important)

- ✅ All Prisma queries use proper includes
- ✅ All enum values are valid
- ✅ No type assertions or `any` types
- ✅ Proper null/undefined handling
- ✅ No unused variables warnings

### Nice to Have (Quality)

- ✅ Consistent error handling patterns
- ✅ Documentation for schema mappings
- ✅ Enum reference documentation
- ✅ Comments explaining complex fixes

---

## 📊 Time Estimates

| Phase     | Task                  | Time        |
| --------- | --------------------- | ----------- |
| 1         | Schema Investigation  | 30 min      |
| 2         | Fix Schema Mismatches | 2-3 hrs     |
| 3         | Fix Monitoring System | 2 hrs       |
| 4         | Fix Enums             | 30 min      |
| 5         | Clean Up Minor Issues | 30 min      |
| 6         | Verification          | 30 min      |
| **TOTAL** |                       | **6-7 hrs** |

**Optimistic**: 5 hours (if schema is well-documented)  
**Realistic**: 6 hours (some investigation needed)  
**Pessimistic**: 8 hours (complex schema changes needed)

---

## 🔄 Alternative Approaches

### Approach A: Full Fix (Recommended)

**Pros**: Clean codebase, no technical debt  
**Cons**: Takes 6-7 hours  
**Use When**: Have dedicated time for quality

### Approach B: Critical Path Only

**Focus**: Fix only admin & farmer pages (skip monitoring)  
**Time**: 3-4 hours  
**Pros**: Faster to production  
**Cons**: Monitoring errors remain  
**Use When**: Need quick production deploy

### Approach C: Stub & Continue

**Action**: Temporarily exclude monitoring from build  
**Time**: 30 minutes  
**Pros**: Bundle analysis available today  
**Cons**: Technical debt, monitoring broken  
**Use When**: Bundle analysis is urgent priority

---

## 📝 Documentation Updates Needed

After completion, update:

1. **PHASE_6_DAY_3_COMPLETE.md**
   - Add error fixing completion
   - Include before/after error counts
   - Document any schema changes made

2. **PHASE_6_DAY_3_PROGRESS.md**
   - Update status to "Errors Fixed"
   - Add bundle analysis results
   - Include actual vs. theoretical savings

3. **docs/SCHEMA_REFERENCE.md** (NEW)
   - Document all Prisma model relationships
   - Document proper include patterns
   - Document enum values

4. **docs/ENUM_MAPPINGS.md** (NEW)
   - List all enums with valid values
   - Document any custom mappings
   - Include usage examples

---

## 🎓 Lessons Learned (Post-Fix)

To be filled after execution:

1. **Schema Patterns**
   - [ ] What include patterns are most common?
   - [ ] What relationships were missing?
   - [ ] What calculated fields are needed?

2. **Type Safety**
   - [ ] What type patterns caused most errors?
   - [ ] What generics need better constraints?
   - [ ] What type guards are needed?

3. **Monitoring System**
   - [ ] What monitoring types need better docs?
   - [ ] What interfaces need consolidation?
   - [ ] What exports need cleanup?

4. **Prevention**
   - [ ] What CI checks would have caught these?
   - [ ] What pre-commit hooks are needed?
   - [ ] What developer docs are missing?

---

## 🚦 Status Tracking

| Category          | Status             | Errors   | Time     | Assignee |
| ----------------- | ------------------ | -------- | -------- | -------- |
| Schema Mismatches | 🔴 Not Started     | ~80      | 2-3h     | TBD      |
| Monitoring Types  | 🔴 Not Started     | ~45      | 2h       | TBD      |
| Enum Issues       | 🔴 Not Started     | ~15      | 30m      | TBD      |
| Minor Issues      | 🔴 Not Started     | ~10      | 30m      | TBD      |
| **TOTAL**         | 🔴 **Not Started** | **~150** | **6-7h** | **TBD**  |

**Status Legend**:

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⚠️ Blocked

---

## 🎯 Next Steps

### Immediate (Choose One)

1. **Option A**: Execute full plan (6-7 hours for complete fix)
2. **Option B**: Execute critical path only (3-4 hours, skip monitoring)
3. **Option C**: Stub monitoring temporarily (30 min, technical debt)

### After Error Fix

1. Run bundle analyzer
2. Measure actual lazy-loading savings
3. Document improvements in Day 3 Complete document
4. Commit and push to phase-6 branch
5. Create PR with before/after metrics

### Prevention for Future

1. Add `npm run type-check` to pre-commit hooks
2. Add `npm run build` to CI pipeline
3. Create schema reference documentation
4. Create developer onboarding guide
5. Add bundle size monitoring to CI

---

**Ready to Execute**: Choose approach and begin Phase 1 (Schema Investigation)

_"Fix with divine precision, test with agricultural consciousness, document with quantum clarity."_ 🌾⚡
