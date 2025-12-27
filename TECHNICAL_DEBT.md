# 🔧 Technical Debt Tracker

**Last Updated:** December 26, 2024  
**Status:** 🎯 ACTIVE TRACKING  
**Total Items:** 23  
**Critical:** 2 | **High:** 6 | **Medium:** 9 | **Low:** 6

---

## 📊 Overview

This document tracks all known technical debt, workarounds, and improvement opportunities in the Farmers Market Platform. Items are prioritized and assigned to refactoring phases.

---

## 🔴 CRITICAL Priority (Blocking Production Quality)

### CRIT-001: TypeScript Build Errors Artificially Ignored ✅ READY TO FIX
**Category:** Configuration  
**File:** `next.config.mjs`  
**Issue:**
```javascript
typescript: {
  ignoreBuildErrors: true,  // ❌ Hides potential type errors
}
```

**Impact:**
- Potential runtime type errors not caught at build time
- False sense of type safety
- Bad practice in production code

**Root Cause:**
- Originally added to bypass OpenTelemetry version mismatch errors
- Errors have since been resolved

**Evidence:**
```bash
$ npx tsc --noEmit
# Returns: No errors (verified December 26, 2024)
```

**Solution:**
1. Set `ignoreBuildErrors: false`
2. Verify build still passes
3. Add pre-commit hook to prevent re-enabling

**Assigned To:** Phase 1 - Week 1  
**Estimated Effort:** 1 hour  
**Risk Level:** LOW (verified no actual errors exist)  
**Status:** ✅ VERIFIED SAFE TO FIX

---

### CRIT-002: Security Vulnerabilities in Dependencies
**Category:** Security  
**Severity:** 6 vulnerabilities (1 low, 2 moderate, 1 high, 2 critical)  
**Affected Package:** `markdown-pdf@11.0.0`

**Details:**
```
├── form-data <2.5.4 (CRITICAL)
├── tough-cookie <4.1.3 (MODERATE)
├── tmp <=0.2.3 (CRITICAL)
├── request (HIGH)
└── phantomjs-prebuilt (obsolete)
```

**Impact:**
- Development dependency only (NOT in production bundle)
- Used for PDF generation from markdown
- Actual risk: LOW (dev-only tool)

**Investigation Needed:**
- [ ] Check usage: `grep -r "markdown-pdf" . --exclude-dir=node_modules`
- [ ] Verify if actively used in scripts
- [ ] Check if needed for documentation pipeline

**Solution Options:**
1. **Remove if unused** (preferred)
   - Check `scripts/` directory
   - Remove from `package.json`
   - Update documentation workflow

2. **Replace with modern alternative**
   - `@marp-team/marp-cli` (actively maintained)
   - `mdpdf` (smaller footprint)
   - `pandoc` via CLI (universal converter)

3. **Keep if critical**
   - Accept risk (dev-only)
   - Add to risk register
   - Monitor for updates

**Assigned To:** Phase 1 - Week 1  
**Estimated Effort:** 2-4 hours  
**Risk Level:** LOW (dev dependency only)  
**Status:** 🔄 INVESTIGATION REQUIRED

---

## 🟠 HIGH Priority (Impacts Maintainability)

### HIGH-001: Hardware-Specific Optimizations Hardcoded
**Category:** Configuration  
**Files:** `next.config.mjs`, `package.json`, `.cursorrules`, `tsconfig.json`

**Issue:**
```javascript
// next.config.mjs - Lines 15-21
// ============================================
// HP OMEN ULTIMATE OPTIMIZATION
// ============================================
// System: 64GB RAM, 12 threads, RTX 2070 Max-Q 8GB
// Target: Maximum performance and parallelization
```

**Problems:**
1. Not portable to other development machines
2. CI/CD environments won't have same specs
3. New developers will be confused
4. Performance expectations misaligned

**Examples:**
- `HP_OMEN_RAM_GB: "64"` in env vars
- `parallelism: 12` hardcoded
- "HP OMEN Optimization: ENABLED" in logs
- Comments throughout assuming specific hardware

**Solution:**
1. Detect system capabilities at runtime
2. Use environment variables for tuning
3. Remove hardware-specific branding
4. Document performance tuning guide separately

**Assigned To:** Phase 2 - Week 3  
**Estimated Effort:** 8 hours  
**Risk Level:** LOW (optimization only, no functionality change)

---

### HIGH-002: Unconventional Naming Convention
**Category:** Code Quality  
**Scope:** Widespread (200+ occurrences)

**Issue:**
"Divine Agricultural Consciousness" metaphorical naming throughout codebase:

| Current Name | Standard Name | Occurrences |
|--------------|---------------|-------------|
| `manifestProduct()` | `createProduct()` | ~15 |
| `quantumCache` | `cache` | ~30 |
| `QuantumProductRepository` | `ProductRepository` | ~10 |
| `divinePatterns` | `patterns` | ~50 |
| `agriculturalConsciousness` | `context` | ~80 |

**Impact:**
- Confusing for new developers
- Harder to search/understand code
- Unprofessional in enterprise context
- Difficult to explain in documentation

**Solution (Gradual Migration):**
```typescript
// Phase 1: Add aliases (backward compatible)
export const cache = quantumCache;
export const createProduct = manifestProduct;

// Phase 2: Update internal usage
// Phase 3: Deprecate old names
// Phase 4: Remove old names (breaking change)
```

**Assigned To:** Phase 3 - Month 2  
**Estimated Effort:** 40 hours (spread over 4 weeks)  
**Risk Level:** MEDIUM (requires careful migration)

---

### HIGH-003: next.config.mjs Too Complex
**Category:** Configuration  
**File:** `next.config.mjs`  
**Current Size:** 500+ lines

**Issues:**
- Single file doing too much
- Hard to understand optimization logic
- Difficult to maintain
- Environment-specific logic mixed in

**Complexity Breakdown:**
- Webpack config: 200 lines
- 15 cache groups (too many)
- Image optimization: 50 lines
- Headers/CSP: 80 lines
- Comments: 120 lines

**Solution:**
Extract to separate modules:
```
config/
├── webpack/
│   ├── cache-groups.js
│   ├── optimization.js
│   └── minimizer.js
├── next/
│   ├── images.js
│   ├── headers.js
│   └── redirects.js
└── index.js
```

**Target:** Reduce to ~250 lines in main config

**Assigned To:** Phase 2 - Week 3-4  
**Estimated Effort:** 12 hours  
**Risk Level:** MEDIUM (config changes need thorough testing)

---

### HIGH-004: Duplicate Payment Modules
**Category:** Code Organization  
**Affected Directories:**
- `src/lib/payment/`
- `src/lib/payments/`
- `src/lib/stripe/`

**Issue:**
Three separate directories handling payment logic:
- Unclear which is canonical
- Potential code duplication
- Confusing for developers

**Investigation Needed:**
```bash
# Check what's in each
ls -la src/lib/payment/
ls -la src/lib/payments/
ls -la src/lib/stripe/

# Check imports
grep -r "from '@/lib/payment" src/
grep -r "from '@/lib/payments" src/
grep -r "from '@/lib/stripe" src/
```

**Solution:**
1. Audit all three directories
2. Identify overlaps and unique features
3. Consolidate to single `src/lib/payment/` directory
4. Update all imports
5. Remove empty directories

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 8 hours  
**Risk Level:** MEDIUM (affects critical payment flows)

---

### HIGH-005: Monitoring Modules Fragmented
**Category:** Code Organization  
**Affected Directories:**
- `src/lib/monitoring/`
- `src/lib/telemetry/`
- `src/lib/tracing/`

**Issue:**
Observability stack split across three directories:
- Similar functionality
- Overlapping concerns
- Hard to maintain consistency

**Solution:**
Merge into unified `src/lib/monitoring/`:
```
src/lib/monitoring/
├── index.ts
├── telemetry/
│   ├── metrics.ts
│   └── traces.ts
├── logging/
│   └── structured-logs.ts
└── health/
    └── checks.ts
```

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 6 hours  
**Risk Level:** LOW (observability doesn't affect business logic)

---

### HIGH-006: Controllers Are Thin Wrappers
**Category:** Architecture  
**Affected Directory:** `src/lib/controllers/`

**Issue:**
Controller layer adds little value:
```typescript
// Typical controller
export class ProductController {
  async create(data: CreateProductDTO) {
    return this.productService.create(data); // Just delegates
  }
}
```

**Analysis:**
- Controllers just call services
- No transformation logic
- No request/response handling (that's in API routes)
- Extra layer of indirection

**Solution:**
Merge controllers into services or API routes:
```typescript
// Before: API Route → Controller → Service
// After: API Route → Service
```

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 10 hours  
**Risk Level:** MEDIUM (architectural change, needs careful migration)

---

## 🟡 MEDIUM Priority (Should Fix Soon)

### MED-001: Prisma Query Complexity Workaround
**Category:** Database  
**File:** `src/app/(customer)/marketplace/farms/[slug]/page.tsx`

**Issue:**
Complex nested Prisma query was causing panic errors. Fixed by splitting into 5 sequential queries.

**Current Solution (Workaround):**
```typescript
// Split complex query into 5 parts
const farm = await db.farm.findUnique(...);
const products = await db.product.findMany(...);
const reviews = await db.review.findMany(...);
// ... etc
```

**Root Cause:**
- Prisma 7.x query compiler bug with deeply nested includes
- Reported to Prisma team

**Proper Solution:**
- Monitor Prisma 7.3.0+ releases
- Re-test complex query when fixed
- Revert to single query if stable

**Assigned To:** Monitor for Prisma updates  
**Estimated Effort:** 4 hours (when Prisma fixed)  
**Risk Level:** LOW (current workaround is stable)

---

### MED-002: Source Map Warnings
**Category:** Build  
**Severity:** 10+ warnings during build

**Issue:**
```
Invalid source map warnings (x10)
- Next.js 16/Turbopack issue
- Development-only warnings
- Non-critical
```

**Impact:**
- Clutters build output
- Hard to spot real issues
- No functional impact

**Root Cause:**
- Next.js 16 + Turbopack incompatibility with some libraries
- Upstream issue, not our code

**Solution:**
- Monitor Next.js updates
- Consider disabling source maps in dev if bothersome
- Or suppress warnings in build config

**Assigned To:** Low priority - monitor Next.js releases  
**Estimated Effort:** 2 hours  
**Risk Level:** NONE (cosmetic issue)

---

### MED-003: Test Database Port Different from Dev
**Category:** Testing  
**Issue:**

```
Development: postgresql://localhost:5432/farmers_market_dev
Test:        postgresql://localhost:5433/farmers_market_test
```

**Problems:**
- Schema drift risk between dev and test
- Migrations might behave differently
- Port management complexity

**Solution:**
1. Use same port, different database names
2. Or document why ports differ
3. Add schema comparison tests

**Assigned To:** Phase 1 - Week 2  
**Estimated Effort:** 3 hours  
**Risk Level:** LOW (both databases use same Prisma schema)

---

### MED-004: GPU Acceleration Module Unused
**Category:** Dead Code  
**Directory:** `src/lib/gpu/`

**Investigation Needed:**
```bash
grep -r "from '@/lib/gpu" src/
# If no results → unused module
```

**Solution:**
- Audit usage
- Remove if unused
- Document if keeping for future use

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 1 hour  
**Risk Level:** NONE (removing unused code)

---

### MED-005: React Query Config Could Be Simplified
**Category:** Configuration  
**Directory:** `src/lib/react-query/`

**Issue:**
Dedicated directory for React Query config seems overengineered for a config file.

**Current:**
```
src/lib/react-query/
├── index.ts
└── config.ts
```

**Proposed:**
```
src/lib/react-query.ts  # Single file
```

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 30 minutes  
**Risk Level:** NONE (simple refactor)

---

### MED-006: Lazy Loading Utilities Unclear
**Category:** Code Organization  
**Directory:** `src/lib/lazy/`

**Investigation Needed:**
- What is this for?
- Dynamic imports?
- Code splitting helpers?
- Is it used?

**Solution:**
1. Audit usage and purpose
2. Rename for clarity
3. Or merge into `src/lib/utils/`

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 2 hours  
**Risk Level:** LOW

---

### MED-007: Email and Notifications Overlap
**Category:** Code Organization  
**Directories:**
- `src/lib/email/`
- `src/lib/notifications/`

**Investigation Needed:**
- Do they overlap?
- Email might be one channel of notifications
- Could be unified

**Proposed Structure:**
```
src/lib/notifications/
├── channels/
│   ├── email.ts
│   ├── push.ts
│   └── sms.ts
└── index.ts
```

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 4 hours  
**Risk Level:** LOW

---

### MED-008: Multiple Architecture Documentation Formats
**Category:** Documentation  
**Files:**
- `ARCHITECTURE_DIAGRAM.md` (markdown)
- `FULL_ARCHITECTURE_DIAGRAM.md` (markdown)
- `FULL_ARCHITECTURE_DIAGRAM.pdf` (PDF)
- `architecture-*.mmd` (Mermaid diagrams x6)

**Issue:**
- Redundant formats
- Sync nightmare
- Updates missed

**Solution:**
1. Keep Mermaid source files (.mmd)
2. Keep one comprehensive markdown (ARCHITECTURE.md)
3. Auto-generate PDF from markdown
4. Remove duplicates

**Assigned To:** Phase 6 - Documentation  
**Estimated Effort:** 3 hours  
**Risk Level:** NONE

---

### MED-009: TODO Comments in Mobile App
**Category:** Incomplete Features  
**Count:** 6 TODOs identified

**List:**
1. Guest mode browsing (`LoginScreen.tsx:165`)
2. Promo code validation (`CheckoutScreen.tsx:648`)
3. Favorite products API (`ProductDetailScreen.tsx:601`)
4. Review helpful votes (`ProductDetailScreen.tsx:615`)
5. Image picker implementation (`EditProfileScreen.tsx:322,330`)
6. Account deletion flow (`ProfileScreen.tsx:430`)

**Solution:**
Create tickets for each TODO and implement in Phase 5.

**Assigned To:** Phase 5 - Month 3-4  
**Estimated Effort:** 20 hours total  
**Risk Level:** NONE (new features, not bugs)

---

## 🟢 LOW Priority (Nice to Have)

### LOW-001: Performance Module Could Be Part of Utils
**Category:** Code Organization  
**Directory:** `src/lib/performance/`

**Suggestion:**
Merge into `src/lib/utils/performance.ts`

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 30 minutes  
**Risk Level:** NONE

---

### LOW-002: Config Directory Placement
**Category:** Project Structure  
**Issue:** `src/lib/config/` vs root-level `config/`

**Standard Practice:**
Configuration files typically live at project root:
```
config/
├── database.ts
├── auth.ts
└── cache.ts
```

**Solution:**
- Move to root-level `config/`
- Update imports
- Better separation of concerns

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 2 hours  
**Risk Level:** LOW (imports update needed)

---

### LOW-003: Documentation File Count
**Category:** Documentation  
**Current:** 15+ top-level documentation files

**Target:** 9 core files
- README.md
- QUICK_START.md
- CONTRIBUTING.md
- CHANGELOG.md
- LICENSE
- ARCHITECTURE.md (consolidated)
- DEPLOYMENT.md (consolidated)
- TECHNICAL_DEBT.md (this file)
- REFACTORING_PLAN.md

**Solution:**
Archive others to `docs/archive/`

**Assigned To:** Phase 6 - Ongoing  
**Estimated Effort:** 2 hours  
**Risk Level:** NONE

---

### LOW-004: Cloudinary Config File Placement
**Category:** Code Organization  
**File:** `src/lib/cloudinary.ts`

**Suggestion:**
Move to `src/lib/upload/providers/cloudinary.ts` for better organization.

**Assigned To:** Phase 4 - Month 3  
**Estimated Effort:** 30 minutes  
**Risk Level:** LOW

---

### LOW-005: Prisma Client Wrapper
**Category:** Code Quality  
**Files:** `src/lib/prisma.ts` and `src/lib/database.ts`

**Issue:**
Two similar files for database connection:
- `prisma.ts` - Direct PrismaClient export
- `database.ts` - Canonical wrapper (preferred)

**Solution:**
1. Audit usage of both
2. Standardize on `database.ts`
3. Remove or deprecate `prisma.ts`

**Assigned To:** Phase 3 or 4  
**Estimated Effort:** 2 hours  
**Risk Level:** LOW

---

### LOW-006: Webpack Cache Groups Optimization
**Category:** Performance  
**File:** `next.config.mjs`

**Issue:**
15 webpack cache groups defined - likely over-optimized.

**Analysis Needed:**
- Measure actual bundle splitting benefit
- Some groups might be too granular
- Maintenance overhead vs. performance gain

**Proposed Reduction:**
15 groups → 7 essential groups
- framework
- vendor
- admin/farmer/monitoring (route-based)
- common
- async (all lazy-loaded libs)

**Assigned To:** Phase 2 - Week 4  
**Estimated Effort:** 4 hours  
**Risk Level:** LOW (performance optimization only)

---

## 📈 Technical Debt Metrics

### By Category
- **Configuration:** 5 items
- **Code Organization:** 9 items
- **Security:** 1 item
- **Documentation:** 3 items
- **Architecture:** 2 items
- **Testing:** 1 item
- **Code Quality:** 2 items

### By Priority
- **CRITICAL:** 2 items (both ready to fix)
- **HIGH:** 6 items (Phase 2-4)
- **MEDIUM:** 9 items (Phase 3-5)
- **LOW:** 6 items (Phase 4-6)

### Estimated Total Effort
- **Critical:** 3-5 hours
- **High:** 84 hours
- **Medium:** 45 hours
- **Low:** 11 hours
- **TOTAL:** ~143 hours (~3.5 weeks of dedicated work)

---

## 🔄 Review Cadence

**Weekly Reviews (during refactoring):**
- Update status of in-progress items
- Add newly discovered debt
- Close completed items

**Monthly Reviews:**
- Assess overall debt trend
- Reprioritize based on business needs
- Celebrate reductions

**Quarterly Reviews:**
- Major retrospective
- Update tracking methodology
- Plan next quarter's focus

---

## 📊 Success Criteria

### Phase 1 Success
- [ ] CRIT-001 resolved (ignoreBuildErrors removed)
- [ ] CRIT-002 resolved (security vulnerabilities < 3)
- [ ] All critical items documented

### Overall Success (3 months)
- [ ] Zero critical items
- [ ] High priority items reduced by 80%
- [ ] Medium priority items reduced by 50%
- [ ] Total debt reduced from 23 → <10 items
- [ ] No new critical debt introduced

---

## 🎯 Prevention Strategy

### Pre-commit Hooks
```bash
# Check for new TODO comments
# Check TypeScript errors
# Check for hardcoded credentials
# Check for console.log in production code
```

### Code Review Checklist
- [ ] No new metaphorical naming
- [ ] No hardware-specific code
- [ ] TypeScript errors not ignored
- [ ] Dependencies audited
- [ ] Tests updated

### Documentation Standards
- Document all workarounds with ticket references
- Explain "why" for non-obvious code
- Keep technical debt log updated

---

**Last Updated:** December 26, 2024  
**Next Review:** January 2, 2025  
**Owner:** Development Team  
**Status:** 🎯 ACTIVELY TRACKED

🌾 _"Track it, prioritize it, fix it systematically"_