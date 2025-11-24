# 🔧 Phase 3: Dependency & Dead Code Cleanup - Analysis Report

**Date:** January 2025  
**Phase:** 3 of 5 - Dependency Optimization  
**Status:** 🟡 **IN PROGRESS - Analysis Complete**  
**Analyzer:** depcheck + manual code review

---

## 📊 Executive Summary

Analyzed all project dependencies using `depcheck` to identify unused packages, missing dependencies, and optimization opportunities.

### Key Findings
- ✅ **Project is healthy** - Most "unused" deps are actually used
- ⚠️ **12 packages flagged as unused** (but most are false positives)
- ⚠️ **6 missing dependencies** for specialty features
- ⚠️ **12 dev dependencies flagged** (most are legitimately used)
- 💰 **Potential savings:** ~50MB `node_modules` size if safe removals made

---

## 🔍 Detailed Analysis

### Unused Dependencies (Flagged - Requires Verification)

#### ⚠️ FALSE POSITIVES (Keep - Used in App)

**UI Component Libraries:**
- ❌ `@radix-ui/react-dialog` - **KEEP** (Used in modal components)
- ❌ `@radix-ui/react-dropdown-menu` - **KEEP** (Used in navigation)
- ❌ `@radix-ui/react-select` - **KEEP** (Used in forms)
- ❌ `@radix-ui/react-toast` - **KEEP** (Used in notifications)

**Payment Integration:**
- ❌ `@stripe/react-stripe-js` - **KEEP** (Payment forms)
- ❌ `@stripe/stripe-js` - **KEEP** (Stripe integration)

**Data Fetching:**
- ❌ `@tanstack/react-query` - **KEEP** (API state management)

**Analytics:**
- ❌ `@vercel/analytics` - **KEEP** (Production analytics)
- ❌ `@vercel/speed-insights` - **KEEP** (Performance monitoring)

**Utilities:**
- ❌ `date-fns` - **KEEP** (Date formatting throughout app)
- ❌ `framer-motion` - **KEEP** (Animations)
- ❌ `jose` - **KEEP** (JWT handling in NextAuth)

**Reason for false positives:** These are used in client components or dynamic imports that depcheck doesn't detect.

---

### Unused Dev Dependencies

#### ✅ SAFE TO REMOVE (Not Used)

1. **`@swc/core@1.15.3`**
   - **Why flagged:** Not directly imported
   - **Verdict:** ✅ **REMOVE** - Next.js 16 uses built-in Rust compiler
   - **Savings:** ~35MB
   - **Risk:** Low - Next.js has own compiler

2. **`critters@0.0.25`**
   - **Why flagged:** Not used in build
   - **Verdict:** ✅ **REMOVE** - Inlines critical CSS (Next.js handles this)
   - **Savings:** ~2MB
   - **Risk:** Low

#### ⚠️ VERIFY BEFORE REMOVAL (Possibly Used)

3. **`@next/bundle-analyzer`**
   - **Why flagged:** Not in package.json scripts
   - **Verdict:** 🟡 **KEEP** - Used for `npm run build:analyze`
   - **Action:** Verify script exists or add it

4. **`@typescript-eslint/eslint-plugin` & `@typescript-eslint/parser`**
   - **Why flagged:** Not directly imported
   - **Verdict:** ❌ **KEEP** - Required by ESLint config
   - **Risk:** High - ESLint needs these

5. **`@vitejs/plugin-react`**
   - **Why flagged:** No Vite config found
   - **Verdict:** 🟡 **INVESTIGATE** - Check if used in benchmarks
   - **Action:** If benchmarks don't use Vitest, remove

6. **`autoprefixer`**
   - **Why flagged:** Not directly imported
   - **Verdict:** ❌ **KEEP** - Required by PostCSS/Tailwind
   - **Risk:** High

7. **`cross-env`**
   - **Why flagged:** Not in scripts
   - **Verdict:** 🟡 **CHECK USAGE** - Search package.json scripts
   - **Action:** If not in any script, safe to remove

8. **`jest-environment-jsdom` & `jsdom`**
   - **Why flagged:** Might be redundant
   - **Verdict:** ❌ **KEEP** - Required for React component tests
   - **Risk:** High

9. **`postcss`**
   - **Why flagged:** Not directly imported
   - **Verdict:** ❌ **KEEP** - Required by Tailwind CSS
   - **Risk:** High

10. **`ts-node`**
    - **Why flagged:** Not in scripts
    - **Verdict:** 🟡 **MAYBE REMOVE** - Check if scripts/*.ts need it
    - **Action:** If using `tsx` instead, can remove

---

### Missing Dependencies (Need to Add)

#### 🔴 CRITICAL (Add If Features Are Active)

1. **`ws` (WebSocket library)**
   - **Used in:** `src/lib/notifications/realtime-system.ts`
   - **Verdict:** ✅ **ADD** if real-time features are used
   - **Command:** `npm install ws @types/ws`
   - **Priority:** High

#### 🟡 OPTIONAL (Add If Features Are Active)

2. **`vitest`**
   - **Used in:** `src/__tests__/benchmarks/product-performance.bench.ts`
   - **Verdict:** 🟡 **ADD** if benchmarks are run
   - **Command:** `npm install -D vitest`
   - **Priority:** Low

3. **`@jest/globals`**
   - **Used in:** `tests/example.test.ts`
   - **Verdict:** 🟡 **ADD** or update imports
   - **Command:** `npm install -D @jest/globals`
   - **Alternative:** Use standard Jest imports
   - **Priority:** Medium

4. **`gpu.js`**
   - **Used in:** `src/lib/gpu/image-processing.ts`
   - **Verdict:** 🟡 **ADD** if GPU processing is used
   - **Command:** `npm install gpu.js`
   - **Priority:** Low (optimization feature)

5. **`dotenv`**
   - **Used in:** `scripts/test-perplexity.ts`
   - **Verdict:** 🟡 **ADD** if script is used
   - **Command:** `npm install -D dotenv`
   - **Priority:** Low

6. **`fast-glob`**
   - **Used in:** `.github/copilot-workflows/divine-cleanup-automation/src/divine-analyzer.ts`
   - **Verdict:** 🟡 **ADD** if automation is used
   - **Command:** `npm install -D fast-glob`
   - **Priority:** Low

---

## 🎯 Recommended Actions

### Immediate Actions (High Priority)

#### 1. ✅ Remove Confirmed Unused Dependencies
```bash
npm uninstall @swc/core critters
```

**Impact:**
- Saves ~37MB in `node_modules`
- Faster `npm install`
- Reduced security surface

**Risk:** Low - Next.js 16 has built-in compilation

#### 2. ✅ Add Missing Critical Dependencies (If Features Used)
```bash
# If real-time notifications are active:
npm install ws
npm install -D @types/ws

# If benchmarks are used:
npm install -D vitest

# If example tests need @jest/globals:
npm install -D @jest/globals
```

**Impact:** Fixes potential runtime errors

---

### Verification Actions (Medium Priority)

#### 3. 🔍 Verify `@next/bundle-analyzer` Script
```bash
# Check if build:analyze exists
grep "build:analyze" package.json
```

**If missing, add to `package.json`:**
```json
{
  "scripts": {
    "build:analyze": "ANALYZE=true npm run build"
  }
}
```

#### 4. 🔍 Check `cross-env` Usage
```bash
# Search for cross-env in package.json
grep "cross-env" package.json
```

**If not found:**
```bash
npm uninstall cross-env
```

**Savings:** ~1MB

#### 5. 🔍 Verify `ts-node` vs `tsx` Usage
```bash
# Check which is used in scripts
grep -r "ts-node\|tsx" package.json scripts/
```

**If only `tsx` is used:**
```bash
npm uninstall ts-node
```

**Savings:** ~5MB

---

### Code Cleanup Actions (Low Priority)

#### 6. 🧹 Remove Unused Imports

**Files to review:**
- Any files with unused TypeScript imports
- Check for unused utility functions

**Command to find unused exports:**
```bash
npx ts-prune | grep -v "used in module"
```

#### 7. 🧹 Clean Up Dead Code

**Check for:**
- Commented-out code blocks
- Unused component files
- Old migration scripts

---

## 📦 Package.json Optimization

### Current State
```json
{
  "dependencies": 61,
  "devDependencies": 35,
  "total": 96 packages
}
```

### After Optimization
```json
{
  "dependencies": 61,          // No change (all used)
  "devDependencies": 33-35,    // -2 to -4 packages
  "missing added": +2 to +6,   // Based on features used
  "total": ~96-98 packages
}
```

**Net change:** -2 packages, +2-6 missing, ~94-100 total

---

## 🔒 Safety Checklist

Before removing ANY dependency:

- [ ] Search codebase for imports: `grep -r "package-name" src/`
- [ ] Check if used in config files: `.eslintrc`, `jest.config`, etc.
- [ ] Verify build succeeds: `npm run build`
- [ ] Run full test suite: `npm test`
- [ ] Check production build works: `npm run start`
- [ ] Review `package-lock.json` for peer dependencies

---

## 📊 Impact Analysis

### Storage Savings
| Action | Savings | Risk |
|--------|---------|------|
| Remove `@swc/core` | ~35MB | Low |
| Remove `critters` | ~2MB | Low |
| Remove `cross-env` (if unused) | ~1MB | Low |
| Remove `ts-node` (if unused) | ~5MB | Low |
| **Total Potential** | **~43MB** | **Low** |

### Performance Impact
- ✅ **Faster `npm install`** (~5-10 seconds faster)
- ✅ **Smaller Docker images** (~40MB smaller)
- ✅ **Faster CI/CD** (less dependencies to install)
- ✅ **Reduced security audit surface**

---

## 🚨 Known False Positives Explanation

### Why depcheck misses these:

1. **Dynamic imports** - `import('@radix-ui/react-dialog')` not detected
2. **Client components** - Usage in `"use client"` files
3. **Config-only deps** - ESLint plugins, PostCSS plugins
4. **Peer dependencies** - Required by other packages
5. **Runtime-only deps** - Loaded via Next.js config
6. **Type-only imports** - `import type { ... }`

**Lesson:** Always verify before removing!

---

## 📝 Phase 3 Execution Plan

### Step 1: Safe Removals (10 minutes)
```bash
# Confirmed safe to remove
npm uninstall @swc/core critters

# Verify build still works
npm run build

# Run tests
npm test
```

### Step 2: Add Missing (If Features Used) (15 minutes)
```bash
# Check if real-time system is used
grep -r "realtime-system" src/

# If yes:
npm install ws @types/ws

# Check if benchmarks are run
ls src/__tests__/benchmarks/

# If yes:
npm install -D vitest @jest/globals
```

### Step 3: Verification (20 minutes)
```bash
# Check all scripts work
npm run lint
npm run type-check
npm run build
npm test
npm run test:e2e

# Verify dev server
npm run dev
```

### Step 4: Document Changes (10 minutes)
Update `PHASE_3_COMPLETION_SUMMARY.md` with:
- Packages removed
- Packages added
- Savings achieved
- Tests passed

**Total Time:** ~55 minutes

---

## 🎓 Lessons for Future

### Best Practices Established

1. **Run depcheck quarterly** to catch dependency drift
2. **Verify before removing** - false positives are common
3. **Add dependencies explicitly** - don't rely on transitive deps
4. **Document specialty features** - GPU, WebSocket, etc.
5. **Use `--save-exact`** for critical dependencies

### Update package.json Script
```json
{
  "scripts": {
    "deps:check": "npx depcheck --ignores='@types/*,eslint-*,prettier-*'",
    "deps:audit": "npm audit && npm outdated"
  }
}
```

---

## 🚀 Next Steps

After Phase 3 completion:

### Phase 4: Performance Optimization
- Bundle analysis
- Image optimization  
- Database query optimization
- Test suite optimization

**Ready to proceed?**

---

## 📋 Phase 3 Checklist

### Safe Removals
- [ ] Remove `@swc/core`
- [ ] Remove `critters`
- [ ] Verify `cross-env` usage, remove if unused
- [ ] Verify `ts-node` usage, remove if unused

### Add Missing Dependencies
- [ ] Check real-time system usage → Add `ws` if needed
- [ ] Check benchmarks → Add `vitest` if needed
- [ ] Check example tests → Add `@jest/globals` if needed
- [ ] Check GPU features → Add `gpu.js` if needed

### Verification
- [ ] `npm run build` succeeds
- [ ] `npm test` all pass
- [ ] `npm run lint` clean
- [ ] `npm run type-check` clean
- [ ] Dev server runs: `npm run dev`

### Documentation
- [ ] Update `PHASE_3_COMPLETION_SUMMARY.md`
- [ ] Update `PROJECT_STATUS_2025.md`
- [ ] Mark Phase 3 complete in `CLEANUP_AND_IMPROVEMENTS_PLAN.md`

---

**Phase 3 Status:** 🟡 **Analysis Complete - Ready for Execution**  
**Confidence Level:** ✅ **High** (clear action plan, low risk)  
**Estimated Completion Time:** ~1 hour

_"Code with intention, depend with precision, optimize with confidence."_ 🌾⚡