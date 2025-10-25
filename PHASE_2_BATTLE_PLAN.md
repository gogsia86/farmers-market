# ⚔️ PHASE 2 BATTLE PLAN - Systematic Error Elimination

**Status**: 🔥 ACTIVE
**Started**: October 25, 2025 (Evening)
**Current Errors**: 268
**Goal**: 0-20 errors (85-90/100 health score)

---

## 📊 ERROR ANALYSIS

### **Infrastructure Fixes Completed** ✅

1. ✅ Deleted duplicate `Farmers-Market/node_modules/`
2. ✅ Installed missing dependencies (react-hook-form, @hookform/resolvers, zod, sonner)

**Result**: Error count increased 206 → 268 (new dependencies revealed hidden issues)

---

### **Error Distribution by Type**

| Error Code  | Count | Description              | Priority | Strategy                   |
| ----------- | ----- | ------------------------ | -------- | -------------------------- |
| **TS2322**  | 81    | Type not assignable      | P2       | framer-motion type updates |
| **TS2339**  | 74    | Property does not exist  | P1       | Prisma schema alignment    |
| **TS6133**  | 23    | Unused variables         | P3       | Easy cleanup               |
| **TS2353**  | 17    | Unknown properties       | P1       | Schema mismatches          |
| **TS2307**  | 16    | Cannot find module       | P0       | Missing imports            |
| **TS2304**  | 11    | Cannot find name         | P2       | Type definitions           |
| **TS18047** | 10    | Possibly null            | P2       | Null checks                |
| **TS2367**  | 10    | Unintentional comparison | P2       | Type alignments            |
| Other       | 46    | Various                  | P3       | Case-by-case               |

---

## 🎯 PHASE 2B: Schema Alignment (45 min)

### **Priority 1: Prisma Schema Updates** 🔴 CRITICAL

**Problem**: Code expects fields that don't exist in Prisma schema

**Required Schema Changes**:

1. **User Model** (40+ errors)
   - Add `name` field (currently split as firstName/lastName)
   - Add `name` field to User model OR update all code to use firstName/lastName

2. **Farm Model** (15+ errors)
   - Add `location` JSON field
   - Add `certifications` String[] field
   - Add `images` String[] field

3. **Product Model** (10+ errors)
   - Add `inStock` Boolean field
   - Add `images` String[] field
   - Add `featured` Boolean field

4. **Admin Actions** (6+ errors)
   - Table name: `adminActionLog` → `adminAction` (code mismatch)

**Decision Required**: Update schema OR update code?

**Recommendation**: Update schema (more aligned with requirements)

---

## 🎯 PHASE 2C: Quick Wins (30 min)

### **Priority 2: Easy Cleanup** 🟢 LOW EFFORT, HIGH IMPACT

**TS6133 - Unused Variables** (23 errors)

Easy fixes - just remove or prefix with `_`:

```typescript
// Before
const unusedVar = something;

// After (if truly unused)
// Remove entirely

// After (if needed for function signature)
const _unusedVar = something;
```

**Files affected**:

- jest.setup.ts (multiple)
- GPU files (multiple)
- Admin pages (multiple)

**Estimated Time**: 15 minutes

---

### **Priority 3: Missing Module Imports** 🟠 MEDIUM

**TS2307 - Cannot Find Module** (16 errors)

**Missing**:

- `react-hot-toast` → Need to install OR use `sonner` instead
- `@/lib/auth/password` → Need to create
- `@/lib/utils/seasonal` → Need to create OR remove import
- `../../src/generated/prisma` → Wrong path, should use `@prisma/client`

**Action**: Install missing OR refactor to use existing alternatives

---

## 🎯 PHASE 2D: Type Alignments (45 min)

### **Priority 4: Agricultural Type Mismatches** 🟡 MEDIUM

**Season Type Issues** (10+ errors)

**Problem**: Code uses `"AUTUMN"`, type defines `"FALL"`

**Solution**: Standardize to `"FALL"` throughout codebase

**Files affected**:

- `src/lib/ai/AgriculturalConsciousness.ts`
- `components/navigation/QuantumNavigation.tsx`
- Various season-aware components

---

### **Priority 5: Framer Motion Type Issues** 🟡 MEDIUM (Low Priority)

**TS2322 - motion.div type assignability** (81 errors)

**Problem**: Framer Motion v10.18 has stricter TypeScript types

**Options**:

1. Update framer-motion to latest version
2. Add explicit type assertions
3. Suppress errors with `// @ts-expect-error` (not ideal)

**Decision**: Low priority - fix if time allows

---

## ⚡ EXECUTION PLAN

### **Immediate Next Steps** (Next 2 hours)

**Step 1**: Create missing utility files (15 min)

- Create `src/lib/auth/password.ts`
- Create `src/lib/utils/seasonal.ts` OR remove imports
- Fix Prisma import paths

**Step 2**: Clean up unused variables (15 min)

- Remove or prefix with `_` all TS6133 errors
- Run type-check to verify

**Step 3**: Schema alignment decision (10 min)

- Decide: Update Prisma schema OR update code
- If schema: Update prisma/schema.prisma
- If code: Create type adapters

**Step 4**: Implement schema/code alignment (45 min)

- Apply chosen strategy
- Update affected files
- Re-generate Prisma client if needed

**Step 5**: Fix agricultural type mismatches (30 min)

- Standardize Season type usage
- Fix LunarPhase alignments
- Update NavigationPattern interface

**Step 6**: Final validation (15 min)

- Run full type-check
- Run health check
- Document remaining issues

---

## 🎲 DECISION POINTS

### **Decision 1: User `name` field**

**Option A**: Add `name` to schema (quick, breaks existing data)
**Option B**: Update all code to use `firstName`/`lastName` (thorough, preserves data)

**Recommendation**: Option B (better long-term)

---

### **Decision 2**: Farm/Product schema updates

**Option A**: Add missing fields to schema (proper solution)
**Option B**: Use JSON fields or type adapters (quick fix)

**Recommendation**: Option A (aligns with requirements)

---

### **Decision 3**: Framer Motion errors

**Option A**: Fix now (81 errors, time-consuming)
**Option B**: Defer to future sprint (focus on functional errors)

**Recommendation**: Option B (defer framer-motion to future)

---

## 📈 SUCCESS METRICS

**Target**: 268 → 0-20 errors

**Expected Reductions**:

- Unused variables: -23 errors
- Missing modules: -16 errors
- Schema alignments: -74 errors (TS2339)
- Schema property issues: -17 errors (TS2353)
- Type alignments: -10 errors (TS2367)

**Total Expected**: ~140 errors fixed = **128 remaining**

**Framer Motion deferred**: -81 errors (future sprint)

**Final Expected**: **~47 errors remaining** (acceptable for 85/100 health)

---

## 🚀 LET'S GO!

**Ready to execute?** Awaiting your confirmation to proceed with Step 1!

---

**Last Updated**: October 25, 2025 - After infrastructure fixes
