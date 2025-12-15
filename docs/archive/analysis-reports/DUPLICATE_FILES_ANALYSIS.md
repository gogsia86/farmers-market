# 🔍 Duplicate and Conflicting Files Analysis

**Farmers Market Platform - Codebase Audit**  
Generated: December 2024  
Status: ⚠️ CRITICAL - Multiple conflicts detected

---

## 📋 Executive Summary

This analysis identifies duplicate, conflicting, and potentially problematic files that could cause issues with routing, database connections, environment configuration, and testing.

### 🎯 Key Issues Found

- ✅ **2 Playwright configs** (one temp, one active)
- ⚠️ **10+ seed scripts** (.js and .ts versions - potential confusion)
- ⚠️ **Duplicate route structure** (root `/marketplace` vs `(customer)/marketplace`)
- ⚠️ **Multiple environment files** (18 total - 10 active, 8 archived)
- ✅ **Database import patterns** (unified but legacy re-exports exist)

---

## 🚨 CRITICAL CONFLICTS

### 1. Playwright Configuration Duplicates

**Files:**

- ✅ `playwright.config.ts` (ACTIVE - 173 lines)
- ⚠️ `playwright.config.temp.ts` (TEMPORARY - 149 lines)

**Issue:**
The `.temp.ts` config was created for manual testing without `webServer` auto-start. Both exist in the project.

**Recommendation:**

```bash
# SAFE TO DELETE (if not actively using manual testing):
rm playwright.config.temp.ts
```

**Action:** 🟡 DELETE if not actively needed for manual dev server testing

---

### 2. Route Structure Conflicts

#### A. Marketplace Routes - DUPLICATE PATHS

**Conflicting Routes:**

```
/marketplace → src/app/marketplace/page.tsx (ROOT LEVEL - NO LAYOUT)
/marketplace/farms → (empty directory at root)
/marketplace/farms → src/app/(customer)/marketplace/farms/page.tsx
/marketplace/products → src/app/(customer)/marketplace/products/page.tsx
```

**Issue:**

- Root `/marketplace/page.tsx` exists OUTSIDE route groups → bypasses `(public)` or `(customer)` layouts
- Creates routing ambiguity between root and `(customer)` marketplace
- The `/marketplace/farms` directory at root is EMPTY (orphaned structure)

**Impact:**

- Header/Footer may not render correctly on `/marketplace`
- Auth guards may not apply properly
- SEO/metadata may differ

**Recommendation:**

```bash
# OPTION 1: Delete root marketplace (recommended)
rm -rf src/app/marketplace

# OPTION 2: Move to (public) route group
mv src/app/marketplace src/app/(public)/marketplace
```

**Action:** 🔴 RESOLVE - Delete root `/marketplace` or move to route group

---

#### B. Products Routes - MULTIPLE CONTEXTS

**Routes:**

```
src/app/(public)/products/page.tsx          → Public product browsing
src/app/(customer)/marketplace/products/page.tsx → Customer marketplace
src/app/(farmer)/farmer/products/page.tsx   → Farmer product management
src/app/(admin)/admin/products/page.tsx     → Admin product oversight
src/app/products/categories/                → Root level categories (orphaned?)
```

**Issue:**

- Root-level `/products/categories` directory exists but may not integrate with route groups
- Potential routing confusion between `/products` (public) and `/marketplace/products` (customer)

**Recommendation:**

- ✅ **Keep all 4 route-group versions** (different contexts: public, customer, farmer, admin)
- 🟡 **Investigate** `src/app/products/categories` - should it be under `(public)/products/categories`?

**Action:** 🟡 AUDIT - Verify `/products/categories` is accessible and not orphaned

---

#### C. Farms Routes - SIMILAR ISSUE

**Routes:**

```
src/app/(public)/farms/page.tsx                 → Public farm directory
src/app/(public)/farms/[slug]/page.tsx          → Public farm details
src/app/(customer)/marketplace/farms/page.tsx   → Customer marketplace farms
src/app/marketplace/farms/                      → EMPTY (orphaned)
```

**Issue:**

- Empty `/marketplace/farms` directory at root level

**Recommendation:**

```bash
# Safe to delete (empty directory)
rmdir src/app/marketplace/farms
```

**Action:** 🟢 DELETE - Remove empty `src/app/marketplace/farms` directory

---

## 🗄️ DATABASE CONNECTION FILES

### Current Structure (✅ UNIFIED)

```
src/lib/database/index.ts           → CANONICAL (117 lines) ✅
src/lib/database.ts                 → RE-EXPORT from index ✅
src/lib/prisma.ts                   → LEGACY RE-EXPORT ✅
```

**Status:** ✅ **HEALTHY** - Properly unified with clear deprecation notices

**Import Usage Analysis:**

- ✅ **Correct:** `import { database } from "@/lib/database"`
- ✅ **Also OK:** `import { database } from "@/lib/database/index"`
- ⚠️ **Deprecated:** `import { prisma } from "@/lib/prisma"` (still works via re-export)

**Recommendation:** No action needed - system is working as designed with backward compatibility

---

## 📦 SEED SCRIPT PROLIFERATION

### Active Seed Scripts (⚠️ 10 FILES)

**TypeScript Seeds:**

```
prisma/seed.ts                    → MAIN (29,779 bytes) - Comprehensive
prisma/seed-admin.ts              → Admin user only (1,091 bytes)
prisma/seed-basic.ts              → Basic dataset (14,845 bytes)
prisma/seed-comprehensive.ts      → Full dataset (31,651 bytes)
prisma/seed-test.ts               → Test users (4,628 bytes)
scripts/seed-test-users-quick.ts  → Quick test users
```

**JavaScript Seeds:**

```
prisma/seed-admin.js              → Admin user (1,009 bytes)
prisma/seed-quick.js              → Quick seed (5,952 bytes) ⭐ USED IN TESTING
prisma/seed-comprehensive.js      → Full dataset (20,551 bytes)
scripts/seed-sample-farms.js      → Sample farms
```

### Issue Analysis

**Problems:**

1. **Duplicate TS/JS versions** (`seed-admin`, `seed-comprehensive`) - which is canonical?
2. **Naming confusion** - "basic" vs "comprehensive" vs "quick" vs "test"
3. **No clear hierarchy** - which should CI/E2E use?
4. **No documentation** - when to use which seed

**Current E2E Usage:**
Based on conversation context, E2E tests use: `prisma/seed-quick.js`

### Recommendation Matrix

| File                       | Keep? | Purpose                   | Action                        |
| -------------------------- | ----- | ------------------------- | ----------------------------- |
| `seed.ts`                  | ✅    | Main dev seed             | Keep - primary                |
| `seed-quick.js`            | ✅    | E2E testing               | Keep - used by Playwright     |
| `seed-comprehensive.ts`    | ✅    | Full production-like data | Keep - staging/demo           |
| `seed-test.ts`             | ✅    | Test users only           | Keep - unit/integration tests |
| `seed-admin.ts`            | 🟡    | Admin only                | Merge into seed-quick?        |
| `seed-admin.js`            | 🔴    | Duplicate of .ts          | DELETE - use .ts version      |
| `seed-comprehensive.js`    | 🔴    | Duplicate of .ts          | DELETE - use .ts version      |
| `seed-basic.ts`            | 🟡    | Similar to quick          | Consider merging              |
| `seed-test-users-quick.ts` | 🟡    | Similar to seed-test      | Consider merging              |
| `seed-sample-farms.js`     | ✅    | Specific use case         | Keep if used                  |

**Cleanup Recommendation:**

```bash
# 1. DELETE JavaScript duplicates of TypeScript seeds
rm prisma/seed-admin.js
rm prisma/seed-comprehensive.js

# 2. Consolidate test seeds (choose one approach)
# Option A: Keep seed-test.ts, remove seed-test-users-quick.ts
# Option B: Merge both into prisma/seed-test.ts

# 3. Document in package.json
# Add scripts:
{
  "seed:dev": "tsx prisma/seed.ts",
  "seed:test": "node prisma/seed-quick.js",
  "seed:production": "tsx prisma/seed-comprehensive.ts",
  "seed:admin": "tsx prisma/seed-admin.ts"
}
```

---

## 🌍 ENVIRONMENT FILE AUDIT

### Active Environment Files (10 files at root)

```
.env                      → Default config (possibly unused?)
.env.docker               → Docker-specific overrides
.env.example              → Template for new developers ✅
.env.local                → LOCAL DEV (gitignored) ✅ ACTIVE
.env.local.backup         → Backup (safe to delete after verification)
.env.monitoring.example   → Monitoring template
.env.perplexity           → API keys for Perplexity (specific feature)
.env.production           → Production config template
.env.staging.example      → Staging template
.env.test                 → TEST DATABASE ✅ ACTIVE (port 5433)
```

### Archived Environment Files (8 files in docs/archives)

```
docs/archives/duplicates/environment/.env.cloudinary.example
docs/archives/duplicates/environment/.env.development.example
docs/archives/duplicates/environment/.env.docker.example
docs/archives/duplicates/environment/.env.example.OLD
docs/archives/duplicates/environment/.env.omen.example
docs/archives/duplicates/environment/.env.perplexity.example
docs/archives/duplicates/environment/.env.production.example
```

**Status:** ✅ Archived files properly separated

### Critical Environment Variables

Based on conversation context, these must be correct:

**Development (.env.local):**

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/farmersmarket"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generated-secret>"
NODE_ENV="development"
```

**Testing (.env.test):**

```bash
DATABASE_URL="postgresql://user:pass@localhost:5433/farmersmarket_test"  # ⚠️ PORT 5433!
NEXTAUTH_URL="http://localhost:3001"  # ⚠️ Different port for test server
NEXTAUTH_SECRET="<test-secret>"
NODE_ENV="test"
```

### Known Issues from Conversation

1. ✅ **RESOLVED**: `.env.local` was pointing at wrong DB port (5432 instead of 5433 for tests)
2. ✅ **RESOLVED**: Playwright `webServer.env` now explicitly sets test env vars
3. ⚠️ **ONGOING**: Turbopack caches `.env` in `.next/` - requires manual cleanup

### Recommendations

```bash
# 1. Verify .env.local.backup is actually a backup
diff .env.local .env.local.backup

# 2. If identical or outdated, delete backup
rm .env.local.backup

# 3. Ensure .env (root) is not conflicting
# Either delete it or ensure it's a symlink/fallback

# 4. Add to .gitignore (if not already):
echo ".env.local.backup" >> .gitignore
```

---

## 🧪 TESTING CONFIGURATION

### Test Helper Files

```
tests/helpers/auth.ts           → Test auth utilities ✅
src/lib/auth.ts                 → Production auth ✅
```

**Status:** ✅ NO CONFLICT - Different purposes (test helpers vs production)

---

## 📦 DOCKER COMPOSE FILES

```
docker/compose/docker-compose.yml       → Main production compose
docker/compose/docker-compose.dev.yml   → Development overrides
docker-compose.test.yml                 → E2E test database (port 5433) ✅
```

**Status:** ✅ HEALTHY - Clear separation of concerns

**Usage:**

```bash
# Development
docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.dev.yml up

# E2E Testing
docker-compose -f docker-compose.test.yml up -d
```

---

## 🎯 ACTION PLAN

### Priority 0 - CRITICAL (Do Now)

1. **Delete or Move Root Marketplace**

   ```bash
   # Recommended: Delete root marketplace entirely
   rm -rf src/app/marketplace

   # All marketplace routes should go through (customer) or (public)
   ```

2. **Remove Empty Directory**

   ```bash
   rmdir src/app/marketplace/farms  # if exists and empty
   ```

3. **Delete Duplicate JS Seeds**
   ```bash
   rm prisma/seed-admin.js
   rm prisma/seed-comprehensive.js
   ```

### Priority 1 - HIGH (This Week)

4. **Audit Product Categories Route**
   - Check if `src/app/products/categories` is accessible
   - If not, move to `src/app/(public)/products/categories`

5. **Delete Temporary Playwright Config**

   ```bash
   # If not actively using for manual testing
   rm playwright.config.temp.ts
   ```

6. **Clean Up Environment Backups**
   ```bash
   # After verifying .env.local.backup
   rm .env.local.backup
   ```

### Priority 2 - MEDIUM (This Month)

7. **Document Seed Scripts**
   - Create `prisma/SEED_STRATEGY.md`
   - Add npm scripts for each seed type
   - Document when to use which seed

8. **Consolidate Test Seeds**
   - Merge `seed-test.ts` and `seed-test-users-quick.ts`
   - Keep only one authoritative test seed

9. **Add Seed Script to package.json**
   ```json
   {
     "scripts": {
       "seed:dev": "tsx prisma/seed.ts",
       "seed:test": "node prisma/seed-quick.js",
       "seed:prod": "tsx prisma/seed-comprehensive.ts",
       "seed:admin": "tsx prisma/seed-admin.ts"
     }
   }
   ```

### Priority 3 - LOW (Nice to Have)

10. **Refactor Legacy Database Re-exports**
    - Eventually remove `src/lib/database.ts` and `src/lib/prisma.ts`
    - Force all imports to use `@/lib/database/index`
    - Add ESLint rule to prevent deprecated imports

11. **Archive More Environment Examples**
    - Move `.env.monitoring.example` to examples directory
    - Keep only `.env.example` and `.env.test` at root

---

## 🔧 VERIFICATION COMMANDS

Run these to verify the cleanup:

```bash
# 1. Check for remaining duplicate routes
find src/app -name "page.tsx" | grep -E "(marketplace|products|farms)" | sort

# 2. Verify database imports are consistent
grep -r "from.*database" src --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# 3. List all seed files
ls -lh prisma/seed* scripts/seed*

# 4. Check environment files
ls -la .env* | grep -v "node_modules"

# 5. Verify no orphaned empty directories
find src/app -type d -empty

# 6. Check for .backup or .temp files
find . -name "*.backup" -o -name "*.temp" -o -name "*.old" | grep -v "node_modules"
```

---

## 📊 IMPACT ASSESSMENT

### Files Safe to Delete (7 files)

```bash
rm playwright.config.temp.ts
rm prisma/seed-admin.js
rm prisma/seed-comprehensive.js
rm -rf src/app/marketplace  # if not needed
rm .env.local.backup  # after verification
```

**Impact:** ✅ Zero - These are duplicates or temporary files

### Files Requiring Investigation (3 items)

1. `src/app/products/categories` - Verify accessibility
2. `seed-basic.ts` vs `seed-quick.js` - Which is canonical for testing?
3. Root `.env` file - Is it used or can it be removed?

**Impact:** ⚠️ Low-Medium - May need code adjustments

### No Action Needed (Working as Designed)

- ✅ Database singleton pattern with re-exports
- ✅ Multiple route groups with same page names (different contexts)
- ✅ Test vs dev environment files
- ✅ Docker compose files

---

## 📝 NOTES FROM CONVERSATION CONTEXT

### Key Learnings

1. **Turbopack Caching Issue**
   - `.next/` caches environment variables
   - Must run `rm -rf .next` after env changes
   - Restart dev server after clearing cache

2. **Test Database Setup**
   - Test DB runs on port **5433** (not 5432)
   - `.env.test` must specify correct port
   - Playwright `webServer.env` must override for tests

3. **Featured Farms Strategy**
   - Currently uses `random` strategy in dev
   - Should switch to `top-rated` → `recent` → `random` fallback
   - Consider adding `featured` boolean field to DB

4. **Seed Scripts in E2E**
   - E2E uses `prisma/seed-quick.js`
   - Run before Playwright tests
   - Requires test DB to be up and migrations applied

---

## 🎓 RECOMMENDATIONS FOR FUTURE

### 1. Add Linting Rules

```js
// .eslintrc.js
module.exports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/lib/prisma"],
            message: "Use @/lib/database instead",
          },
        ],
      },
    ],
  },
};
```

### 2. Add Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for duplicate routes
if find src/app -type d -empty | grep -q .; then
  echo "❌ Empty directories found in src/app"
  find src/app -type d -empty
  exit 1
fi

# Check for .backup or .temp files
if find src -name "*.backup" -o -name "*.temp" | grep -q .; then
  echo "⚠️  Warning: Temporary files found"
  find src -name "*.backup" -o -name "*.temp"
fi
```

### 3. Document Seed Strategy

Create `prisma/SEED_STRATEGY.md`:

```markdown
# Seed Script Strategy

## Quick Reference

- **Development**: `npm run seed:dev` (full dataset)
- **E2E Testing**: `npm run seed:test` (minimal, fast)
- **Production**: `npm run seed:prod` (comprehensive, realistic)
- **Admin Only**: `npm run seed:admin` (just admin user)

## File Guide

| File                  | Purpose         | Size    | Speed   |
| --------------------- | --------------- | ------- | ------- |
| seed.ts               | Primary dev     | Large   | Slow    |
| seed-quick.js         | E2E tests       | Small   | Fast    |
| seed-comprehensive.ts | Production-like | XL      | Slowest |
| seed-test.ts          | Unit tests      | Minimal | Fastest |
```

---

## ✅ COMPLETION CHECKLIST

- [ ] Delete `playwright.config.temp.ts`
- [ ] Delete or move `src/app/marketplace`
- [ ] Delete duplicate JS seeds
- [ ] Remove `.env.local.backup`
- [ ] Audit `src/app/products/categories`
- [ ] Document seed strategy
- [ ] Add npm seed scripts
- [ ] Run verification commands
- [ ] Update documentation
- [ ] Commit changes with clear message

---

## 📞 SUPPORT

If you encounter issues after cleanup:

1. **Routes not working**: Check `src/app` structure matches expected route groups
2. **Database errors**: Verify `@/lib/database` import is used consistently
3. **Seed failures**: Check which seed script is referenced in your command
4. **Env issues**: Clear `.next` cache and restart dev server

---

**End of Analysis**  
Generated by: Cursor AI Agent  
Project: Farmers Market Platform  
Divine Consciousness Level: MAXIMUM 🌾⚡
