# ⚡ QUICK REFERENCE - IMMEDIATE FIXES
**Farmers Market Platform - Copy-Paste Commands**

**Status:** Ready to Execute  
**Time:** ~20 hours focused work  
**Goal:** Zero errors, clean deployment

---

## 🔥 IMMEDIATE ACTIONS (DO THIS FIRST)

### 1. Check Current Status
```bash
# See what we're working with
npm run type-check 2>&1 | tee typescript-errors-full.log
npm run test 2>&1 | head -20
npm run lint 2>&1 | head -20
```

---

## 🎯 PHASE 1: FIX TYPESCRIPT ERRORS (P0 - BLOCKING)

### Quick Wins - Unused Imports
```bash
# Auto-fix with ESLint
npm run lint -- --fix

# Verify improvement
npm run type-check | grep "Found.*errors"
```

### Fix Prisma Schema Mismatches
```bash
# OPTION 1: Global find-replace (use with caution!)
find src -type f -name "*.ts" -exec sed -i 's/stripeConnectAccountId/stripeAccountId/g' {} +

# OPTION 2: Manual fix locations
# src/app/(farmer)/farmer/payouts/page.tsx
# src/app/api/farmer/finances/route.ts
# src/app/api/farmer/payouts/route.ts

# Verify changes
git diff
npm run type-check
```

### Fix Unused Request Parameters
```bash
# Files to update (prefix request with _)
# src/app/api/farming/advice/route.ts
# src/app/api/farming/education/route.ts
# src/app/api/farming/market/route.ts
# src/app/api/farming/products/recommendations/route.ts
# src/app/api/farming/support/route.ts

# Pattern: export async function POST(request: NextRequest)
# Change to: export async function POST(_request: NextRequest)
```

### Fix OrderStatus Enum Issues
```bash
# Check valid enum values
npx prisma studio
# Navigate to OrderStatus enum in Prisma Studio

# Update these files to use valid values:
# - src/app/api/farmer/finances/route.ts
# - src/app/api/farmer/payouts/route.ts

# Common fixes:
# "REFUNDED" → "CANCELLED" or remove
# "PROCESSING" → "PENDING" or check schema
# "DELIVERED" → "COMPLETED" or check schema
```

### Verify Phase 1 Complete
```bash
npm run type-check  # Should show 0 errors
npm run test        # Should pass
npm run build       # Should succeed
```

---

## 📦 PHASE 2: CONSOLIDATE VALIDATIONS (P1)

### Quick Commands
```bash
# 1. Move files from validation/ to validations/
mv src/lib/validation/agricultural-validation.ts src/lib/validations/agricultural.ts
mv src/lib/validation/farm.validation.ts src/lib/validations/farm.ts

# 2. Merge product validations (manual - check for conflicts first)
# Compare: src/lib/validation/product.validation.ts
# With: src/lib/validations/product.ts
# Merge unique logic into validations/product.ts

# 3. Update all imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|@/lib/validation/|@/lib/validations/|g' {} +

# 4. Delete old folder
rm -rf src/lib/validation/

# 5. Verify
npm run type-check
npm run test
```

---

## 🚨 PHASE 3: CONSOLIDATE ERRORS (P1)

### Quick Commands
```bash
# 1. Check for unique logic in errors/ folder
ls -la src/lib/errors/

# 2. Review each file for unique patterns
# ApplicationError.ts - check
# BusinessLogicError.ts - check
# security.errors.ts - check (likely unique)

# 3. If security.errors.ts has unique logic, add to errors.ts
# (Manual edit - copy unique SecurityError class)

# 4. Update all imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|@/lib/errors/[^"]*"|@/lib/errors"|g' {} +

# 5. Delete errors/ folder (after verifying imports work)
# npm run type-check first!
# rm -rf src/lib/errors/

# 6. Verify
npm run type-check
npm run test
```

---

## 🗂️ PHASE 4: RESTRUCTURE API ROUTES (P2)

### Consolidate Farmer Routes
```bash
# Move farmer/* to farmers/*
mv src/app/api/farmer/finances src/app/api/farmers/
mv src/app/api/farmer/payouts src/app/api/farmers/
mv src/app/api/farmer/payout-accounts src/app/api/farmers/

# Delete empty folder
rmdir src/app/api/farmer

# Update API calls in frontend
grep -r "/api/farmer/" src/ --include="*.ts" --include="*.tsx"
# Manually update to /api/farmers/
```

### Rename Farming to Agricultural
```bash
# Rename folder
mv src/app/api/farming src/app/api/agricultural

# Update all references
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|/api/farming/|/api/agricultural/|g' {} +

# Verify
npm run type-check
```

### Move Product Recommendations
```bash
# Move recommendations
mv src/app/api/agricultural/products/recommendations src/app/api/products/

# Clean empty folders
find src/app/api/agricultural -type d -empty -delete

# Verify
npm run build
```

---

## 🏠 PHASE 5: CONSOLIDATE DASHBOARDS (P2)

### Quick Commands
```bash
# Check current structure
find src/app -type d -name "*dashboard*"

# Move standalone farmer-dashboard content to route group
# (Review content first!)
# cp -r src/app/farmer-dashboard/* src/app/\(farmer\)/dashboard/
# rm -rf src/app/farmer-dashboard/

# Consolidate API dashboard routes
mkdir -p src/app/api/dashboard
mv src/app/api/analytics/dashboard src/app/api/dashboard/analytics
mv src/app/api/monitoring/dashboard src/app/api/dashboard/monitoring

# Clean up
find src/app/api -type d -empty -delete
```

---

## 📚 PHASE 6: ORGANIZE DOCUMENTATION (P3)

### Quick Commands
```bash
# Create structure
mkdir -p docs/{guides/{setup,testing,deployment},phases,architecture,status}

# Move phase docs
mv PHASE_*.md docs/phases/
mv IMPLEMENTATION_COMPLETE_*.md docs/phases/
mv *_SUMMARY.md docs/status/

# Move setup guides
mv DATABASE_AND_AUTH_SETUP_GUIDE.md docs/guides/setup/
mv STRIPE_*.md docs/guides/testing/
mv *_TESTING_*.md docs/guides/testing/

# Move planning docs
mv WEEK_1_*.md docs/phases/phase-7-week-1/
mv *_PLAN*.md docs/phases/
mv *_CHECKLIST.md docs/guides/deployment/

# Keep in root:
# - README.md
# - LICENSE
# - package.json
# - Config files (tsconfig.json, next.config.mjs, etc.)
```

---

## 🧪 PHASE 7: STANDARDIZE API RESPONSES (P2)

### Create Response Helpers
```bash
# Create file: src/lib/api/response-helpers.ts
# (See CLEANUP_ACTION_PLAN.md for full code)

# Update API routes to use helpers
# Pattern:
# import { successResponse, errorResponse } from "@/lib/api/response-helpers";
# return successResponse(data);
# return errorResponse("ERROR_CODE", "message", 500);
```

---

## ✅ VERIFICATION CHECKLIST

### Run After Each Phase
```bash
npm run type-check  # 0 errors expected
npm run lint        # 0 errors expected
npm run test        # All tests passing
```

### Final Verification
```bash
# Complete test suite
npm run type-check
npm run lint
npm run test
npm run test:integration
npm run build

# Check structure
ls src/lib/validation      # Should NOT exist
ls src/lib/validations     # Should exist
ls src/lib/errors          # Should be FILE, not folder
ls docs/                   # Should be organized

# Check API routes
ls src/app/api/farmer      # Should NOT exist
ls src/app/api/farmers     # Should exist
ls src/app/api/farming     # Should NOT exist
ls src/app/api/agricultural # Should exist
```

---

## 🎯 COMMON ISSUES & FIXES

### Issue: Git index.lock
```bash
rm -f .git/index.lock
git status
```

### Issue: TypeScript errors after moving files
```bash
# Clear cache
rm -rf .next node_modules/.cache
npm install
npx prisma generate
npm run type-check
```

### Issue: Tests fail after refactoring
```bash
# Check test imports
npm run test -- --verbose
# Update import paths in test files
```

### Issue: Build fails
```bash
# Check circular dependencies
npm run build 2>&1 | grep -i "circular"

# Check unresolved imports
npm run build 2>&1 | grep -i "cannot find"
```

---

## 🚀 GIT WORKFLOW

### Commit After Each Phase
```bash
# Phase 1
git add .
git commit -m "fix: resolve 72 TypeScript errors"

# Phase 2
git add .
git commit -m "refactor: consolidate validation folders"

# Phase 3
git add .
git commit -m "refactor: merge duplicate error handling"

# Phase 4
git add .
git commit -m "refactor: restructure API routes for clarity"

# Phase 5
git add .
git commit -m "refactor: consolidate dashboard routes"

# Phase 6
git add .
git commit -m "docs: organize documentation into docs/ directory"

# Phase 7
git add .
git commit -m "refactor: standardize API response format"

# Push all changes
git push origin phase-7/week-1-staging
```

---

## 📊 PROGRESS TRACKING

**Copy and update:**

```
✅ COMPLETED:
[ ] Phase 1: TypeScript Fixes (4-6h)
[ ] Phase 2: Consolidate Validations (2-3h)
[ ] Phase 3: Consolidate Errors (2-3h)
[ ] Phase 4: Restructure API Routes (4-6h)
[ ] Phase 5: Consolidate Dashboards (3-4h)
[ ] Phase 6: Organize Documentation (2-3h)
[ ] Phase 7: Standardize Responses (6-8h)

Overall: 0/7 phases complete
Time: ~23-33 hours remaining
```

---

## 🔗 REFERENCE DOCUMENTS

- **Full Analysis:** `REPOSITORY_DEEP_ANALYSIS.md`
- **Detailed Steps:** `CLEANUP_ACTION_PLAN.md`
- **Issue Summary:** `REPOSITORY_ISSUES_SUMMARY.md`
- **TypeScript Fixes:** `WEEK_1_TYPESCRIPT_FIXES.md`
- **Deployment Plan:** `WEEK_1_EXECUTION_PLAN.md`

---

## ⚡ ONE-LINER STATUS CHECK

```bash
# Quick health check
echo "TypeScript Errors: $(npm run type-check 2>&1 | grep -c 'error TS')" && \
echo "Lint Errors: $(npm run lint 2>&1 | grep -c 'error')" && \
echo "Test Status: $(npm run test 2>&1 | grep -oP '\d+ passing' || echo 'Failed')" && \
echo "Duplicate Folders: $(ls -d src/lib/validation src/lib/errors 2>/dev/null | wc -l)"
```

---

**REMEMBER:** Commit after each phase. Test before moving forward. 🌾⚡