# 🔧 CLEANUP ACTION PLAN - IMMEDIATE FIXES

**Farmers Market Platform - Pre-Deployment Cleanup**

**Created:** January 2025  
**Target:** Complete before Week 1 staging deployment  
**Estimated Time:** 3-5 days focused work

---

## 🎯 EXECUTION ORDER

This plan is ordered by **priority and dependency**. Complete each phase before moving to the next.

---

## 📋 PHASE 1: TYPESCRIPT FIXES (P0 - BLOCKING)

**Time:** 4-6 hours  
**Status:** 🔴 BLOCKING DEPLOYMENT

### Step 1.1: Run Type Check and Capture Errors

```bash
npm run type-check 2>&1 | tee typescript-errors-full.log
```

### Step 1.2: Fix Unused Imports/Variables (Quick Wins)

**Files to fix:**

```bash
# Remove unused imports
src/app/(customer)/marketplace/farms/[slug]/page.tsx
src/app/(customer)/marketplace/products/page.tsx
```

**Commands:**

```bash
# Auto-fix with ESLint
npm run lint -- --fix

# Manual verification
npm run type-check
```

### Step 1.3: Fix Prisma Schema Mismatches

**Common pattern:**

```typescript
# FIND & REPLACE across codebase:
stripeConnectAccountId → stripeAccountId
completedAt → paidDate (for orders)
include: { items: true } → include: { OrderItem: true }
include: { payment: true } → include: { Payment: true }
```

**Commands:**

```bash
# Global search and replace (use with caution!)
find src -type f -name "*.ts" -exec sed -i 's/stripeConnectAccountId/stripeAccountId/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/completedAt/paidDate/g' {} +

# Verify changes
git diff
```

### Step 1.4: Fix OrderStatus Enum Issues

**Files affected:**

- `src/app/api/farmer/finances/route.ts`
- `src/app/api/farmer/payouts/route.ts`

**Fix pattern:**

```typescript
// REMOVE invalid statuses:
// ❌ "REFUNDED"
// ❌ "PROCESSING"
// ❌ "DELIVERED"

// CHECK schema for valid values:
npx prisma studio
# Navigate to OrderStatus enum

// UPDATE code to use valid values from schema
```

### Step 1.5: Fix Unused Request Parameters

**Files to fix (prefix with underscore):**

```bash
src/app/api/farming/advice/route.ts
src/app/api/farming/education/route.ts
src/app/api/farming/market/route.ts
src/app/api/farming/products/recommendations/route.ts
src/app/api/farming/support/route.ts
```

**Find & Replace:**

```typescript
export async function POST(request: NextRequest)
↓
export async function POST(_request: NextRequest)
```

### Step 1.6: Verify All Tests Pass

```bash
npm run test
npm run test:integration
```

**✅ Phase 1 Complete When:**

- [ ] `npm run type-check` shows 0 errors
- [ ] All tests still passing
- [ ] No build errors

---

## 📦 PHASE 2: CONSOLIDATE VALIDATIONS (P1 - HIGH)

**Time:** 2-3 hours  
**Status:** 🟡 HIGH PRIORITY

### Step 2.1: Audit Both Validation Folders

```bash
# Compare contents
ls -la src/lib/validation/
ls -la src/lib/validations/

# Check for duplicate logic
diff src/lib/validation/product.validation.ts src/lib/validations/product.ts
```

### Step 2.2: Create Consolidated Structure

```bash
# Keep src/lib/validations/ (plural)
# Move files from validation/ to validations/

mv src/lib/validation/agricultural-validation.ts src/lib/validations/agricultural.ts
mv src/lib/validation/farm.validation.ts src/lib/validations/farm.ts

# Merge product validations (manual merge required)
# Review both files and combine unique logic
```

### Step 2.3: Create Central Export

**Create:** `src/lib/validations/index.ts`

```typescript
// Central validation export
export * from "./agricultural";
export * from "./farm";
export * from "./product";
export * from "./cart";
export * from "./crop";
export * from "./order";
export * from "./user";
export * from "./payment";

// Re-export commonly used schemas
export { farmSchema, createFarmSchema, updateFarmSchema } from "./farm";

export {
  productSchema,
  createProductSchema,
  updateProductSchema,
} from "./product";
```

### Step 2.4: Update All Imports

```bash
# Find all validation imports
grep -r "from '@/lib/validation/" src/ | wc -l
grep -r "from '@/lib/validations/" src/ | wc -l

# Update imports (manual or script)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|@/lib/validation/|@/lib/validations/|g" {} +
```

### Step 2.5: Delete Old Folder

```bash
# After verifying all imports updated
rm -rf src/lib/validation/

# Verify no broken imports
npm run type-check
```

**✅ Phase 2 Complete When:**

- [ ] Only one validation folder exists
- [ ] All imports updated
- [ ] No TypeScript errors
- [ ] All tests passing

---

## 🚨 PHASE 3: CONSOLIDATE ERROR HANDLING (P1 - HIGH)

**Time:** 2-3 hours  
**Status:** 🟡 HIGH PRIORITY

### Step 3.1: Audit Error Implementations

```bash
# Check main error file
wc -l src/lib/errors.ts

# Check errors folder
ls -la src/lib/errors/

# Find usage patterns
grep -r "from '@/lib/errors'" src/ | wc -l
grep -r "from '@/lib/errors/" src/ | wc -l
```

### Step 3.2: Identify Unique Logic in errors/ Folder

**Review each file:**

```bash
src/lib/errors/
├── ApplicationError.ts      # Check for unique logic
├── BusinessLogicError.ts    # Check for unique logic
├── DatabaseError.ts         # Already in errors.ts
├── NotFoundError.ts         # Already in errors.ts
├── ValidationError.ts       # Already in errors.ts
└── security.errors.ts       # Check for unique logic
```

### Step 3.3: Merge Unique Logic

**If unique logic found:**

```typescript
// Add to src/lib/errors.ts

// Example: If security.errors.ts has unique patterns
export class SecurityError extends DivineError {
  constructor(
    message: string,
    code: string = "SECURITY_VIOLATION",
    context?: Record<string, unknown>,
  ) {
    super(message, code, 403, context, [
      "Review security policies",
      "Check authentication status",
      "Contact security team",
    ]);
    this.name = "SecurityError";
  }
}
```

### Step 3.4: Update All Error Imports

```bash
# Find all imports from errors/ folder
grep -r "from '@/lib/errors/" src/ > error-imports.txt

# Update to import from errors.ts
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|@/lib/errors/[^"]*"|@/lib/errors"|g' {} +
```

### Step 3.5: Delete errors/ Folder

```bash
# After verifying all imports work
rm -rf src/lib/errors/

# Verify
npm run type-check
npm run test
```

**✅ Phase 3 Complete When:**

- [ ] Single error handling file (errors.ts)
- [ ] All unique logic preserved
- [ ] All imports updated
- [ ] Tests passing

---

## 🗂️ PHASE 4: RESTRUCTURE API ROUTES (P2 - MEDIUM)

**Time:** 4-6 hours  
**Status:** 🟢 MEDIUM PRIORITY

### Step 4.1: Create Migration Plan

```bash
# Document current routes
find src/app/api -name "route.ts" > current-routes.txt

# Plan new structure
cat > api-restructure-plan.txt << EOF
MOVES REQUIRED:
/api/farmer/finances → /api/farmers/finances
/api/farmer/payouts → /api/farmers/payouts
/api/farmer/payout-accounts → /api/farmers/payout-accounts
/api/farming/* → /api/agricultural/*
/api/farming/products/recommendations → /api/products/recommendations
EOF
```

### Step 4.2: Move Farmer Routes

```bash
# Move individual farmer routes to farmers/
mv src/app/api/farmer/finances src/app/api/farmers/
mv src/app/api/farmer/payouts src/app/api/farmers/
mv src/app/api/farmer/payout-accounts src/app/api/farmers/

# Delete empty farmer/ folder
rmdir src/app/api/farmer
```

### Step 4.3: Rename Farming to Agricultural

```bash
# Rename folder
mv src/app/api/farming src/app/api/agricultural

# Update imports in code
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|/api/farming/|/api/agricultural/|g' {} +
```

### Step 4.4: Move Product Recommendations

```bash
# Move farming products to main products
mv src/app/api/agricultural/products/recommendations src/app/api/products/

# Clean up empty folders
find src/app/api/agricultural -type d -empty -delete
```

### Step 4.5: Update Frontend API Calls

```bash
# Find all API calls in frontend
grep -r "fetch.*'/api/farmer" src/
grep -r "fetch.*'/api/farming" src/

# Update to new routes (manual)
# Example:
# /api/farmer/finances → /api/farmers/finances
# /api/farming/advice → /api/agricultural/advice
```

### Step 4.6: Update API Documentation

```bash
# Update any API docs to reflect new structure
# Update Swagger/OpenAPI specs if they exist
# Update README with new route structure
```

**✅ Phase 4 Complete When:**

- [ ] Farmer routes consolidated under /api/farmers/
- [ ] Farming renamed to /api/agricultural/
- [ ] Product routes consolidated
- [ ] Frontend updated
- [ ] Tests passing

---

## 🏠 PHASE 5: CONSOLIDATE DASHBOARDS (P2 - MEDIUM)

**Time:** 3-4 hours  
**Status:** 🟢 MEDIUM PRIORITY

### Step 5.1: Audit Dashboard Routes

```bash
# Find all dashboard routes
find src/app -type d -name "*dashboard*"

# Result:
# src/app/dashboard/
# src/app/farmer-dashboard/
# src/app/(farmer)/dashboard/
# src/app/api/analytics/dashboard/
# src/app/api/farmers/dashboard/
# src/app/api/monitoring/dashboard/
# src/app/api/users/dashboard/
```

### Step 5.2: Keep Route Group Structure

**Decision:** Use route groups (best practice)

```bash
# KEEP:
src/app/(customer)/dashboard/    # Customer dashboard
src/app/(farmer)/dashboard/      # Farmer dashboard (rename from farmer/dashboard)
src/app/(admin)/dashboard/       # Admin dashboard

# MIGRATE CONTENT:
# Move farmer-dashboard/* → (farmer)/dashboard/*
# Move dashboard/* → (customer)/dashboard/* (if customer-specific)
```

### Step 5.3: Move Farmer Dashboard

```bash
# Check if (farmer)/dashboard exists
ls src/app/\(farmer\)/farmer/dashboard/

# If it's under farmer/dashboard, move up one level
mv src/app/\(farmer\)/farmer/dashboard/* src/app/\(farmer\)/dashboard/
rmdir src/app/\(farmer\)/farmer/dashboard/

# Delete standalone farmer-dashboard
# (after migrating any unique content)
rm -rf src/app/farmer-dashboard/
```

### Step 5.4: Consolidate API Dashboard Routes

```bash
# Create central dashboard API
mkdir -p src/app/api/dashboard

# Move analytics
mv src/app/api/analytics/dashboard src/app/api/dashboard/analytics

# Move monitoring
mv src/app/api/monitoring/dashboard src/app/api/dashboard/monitoring

# Create role-specific routes
mkdir -p src/app/api/dashboard/[role]
# Migrate farmers/dashboard → dashboard/farmer
# Migrate users/dashboard → dashboard/user
```

### Step 5.5: Update Navigation Links

```bash
# Find all dashboard links in components
grep -r "href=\"/dashboard\"" src/
grep -r "href=\"/farmer-dashboard\"" src/

# Update to route group structure
# /farmer-dashboard → /farmer/dashboard (route group URL)
# /dashboard → /customer/dashboard (if role-specific)
```

**✅ Phase 5 Complete When:**

- [ ] Route groups used for dashboards
- [ ] No duplicate dashboard folders
- [ ] API dashboard routes consolidated
- [ ] Navigation updated
- [ ] Tests passing

---

## 📚 PHASE 6: ORGANIZE DOCUMENTATION (P3 - LOW)

**Time:** 2-3 hours  
**Status:** 🔵 LOW PRIORITY

### Step 6.1: Create docs/ Structure

```bash
mkdir -p docs/{guides/{setup,testing,deployment},phases,architecture,status}
```

### Step 6.2: Move Phase Documentation

```bash
# Move phase summaries
mv PHASE_*_*.md docs/phases/
mv IMPLEMENTATION_COMPLETE_*.md docs/phases/
mv *_SUMMARY.md docs/status/
```

### Step 6.3: Move Setup Guides

```bash
# Move setup documents
mv DATABASE_AND_AUTH_SETUP_GUIDE.md docs/guides/setup/
mv STRIPE_*.md docs/guides/testing/
mv *_TESTING_*.md docs/guides/testing/
mv PRISMA_7_*.md docs/guides/setup/
```

### Step 6.4: Move Execution Plans

```bash
# Move planning docs
mv WEEK_1_*.md docs/phases/phase-7-week-1/
mv *_PLAN*.md docs/phases/
mv *_CHECKLIST.md docs/guides/deployment/
```

### Step 6.5: Create Single Entry Point

**Create:** `docs/00-START-HERE.md`

```bash
cat > docs/00-START-HERE.md << 'EOF'
# 🌾 Farmers Market Platform - Documentation Hub

**Welcome!** This is your single entry point to all platform documentation.

## 🚀 Quick Start
- New Developer? → [Setup Guide](guides/setup/database-setup.md)
- Deploying? → [Deployment Checklist](guides/deployment/checklist.md)
- Testing? → [Testing Guide](guides/testing/overview.md)

## 📊 Project Status
- [Current Status](status/current-status.md)
- [Next Steps](status/next-steps.md)

## 📖 Documentation Index
- [Setup Guides](guides/setup/)
- [Testing Guides](guides/testing/)
- [Deployment Guides](guides/deployment/)
- [Architecture](architecture/)
- [Phase History](phases/)

EOF
```

### Step 6.6: Update Root README

**Update:** `README.md`

```markdown
# Add to README.md:

## 📚 Documentation

All documentation has been organized in the `docs/` directory.

**Start here:** [docs/00-START-HERE.md](docs/00-START-HERE.md)
```

### Step 6.7: Clean Up Root

```bash
# Keep only essentials in root:
# - README.md
# - LICENSE
# - package.json
# - Configuration files (.eslintrc, tsconfig.json, etc)
# - .env.example

# Everything else should be in docs/
```

**✅ Phase 6 Complete When:**

- [ ] docs/ structure created
- [ ] All documentation moved
- [ ] Single entry point created
- [ ] Root directory clean
- [ ] README updated

---

## 🧪 PHASE 7: STANDARDIZE API RESPONSES (P2 - MEDIUM)

**Time:** 6-8 hours  
**Status:** 🟢 MEDIUM PRIORITY

### Step 7.1: Create Response Helpers

**Create:** `src/lib/api/response-helpers.ts`

```typescript
import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    requestId?: string;
  };
}

export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>["meta"],
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    meta,
  });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: Record<string, any>,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status },
  );
}
```

### Step 7.2: Audit Current API Routes

```bash
# Find all API route handlers
find src/app/api -name "route.ts" > api-routes.txt

# Check each for response format
grep -n "NextResponse.json" src/app/api/**/*.ts
```

### Step 7.3: Update API Routes

**Pattern to apply:**

```typescript
// BEFORE:
export async function GET() {
  const farms = await getFarms();
  return NextResponse.json(farms);
}

// AFTER:
import { successResponse, errorResponse } from "@/lib/api/response-helpers";

export async function GET() {
  try {
    const farms = await getFarms();
    return successResponse(farms);
  } catch (error) {
    return errorResponse("FARMS_FETCH_ERROR", error.message, 500);
  }
}
```

### Step 7.4: Update Frontend API Clients

```bash
# Find all fetch calls
grep -r "fetch.*'/api/" src/app src/components src/features

# Update to handle standard response format
```

### Step 7.5: Add TypeScript Types

**Create:** `src/types/api.types.ts`

```typescript
export type { ApiResponse } from "@/lib/api/response-helpers";

// Usage in frontend:
export async function fetchFarms(): Promise<Farm[]> {
  const response = await fetch("/api/farms");
  const json: ApiResponse<Farm[]> = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message || "Unknown error");
  }

  return json.data!;
}
```

**✅ Phase 7 Complete When:**

- [ ] Response helpers created
- [ ] All API routes standardized
- [ ] Frontend updated
- [ ] Types defined
- [ ] Tests passing

---

## ✅ FINAL VERIFICATION

### Pre-Deployment Checklist

```bash
# Run all checks
npm run type-check          # 0 errors
npm run lint                # 0 errors
npm run test                # All passing
npm run test:integration    # All passing
npm run build               # Successful

# Verify structure
ls src/lib/validation       # Should not exist
ls src/lib/validations      # Should exist
ls src/lib/errors           # Should be file, not folder
ls docs/                    # Should be organized

# Check API routes
find src/app/api/farmer     # Should not exist
find src/app/api/farmers    # Should exist
find src/app/api/farming    # Should not exist
find src/app/api/agricultural  # Should exist
```

### Git Commit Strategy

```bash
# Commit after each phase
git add .
git commit -m "phase-1: Fix TypeScript errors"
git commit -m "phase-2: Consolidate validation folders"
git commit -m "phase-3: Merge error handling"
git commit -m "phase-4: Restructure API routes"
git commit -m "phase-5: Consolidate dashboards"
git commit -m "phase-6: Organize documentation"
git commit -m "phase-7: Standardize API responses"

# Create PR for review
git checkout -b cleanup/pre-deployment-fixes
git push origin cleanup/pre-deployment-fixes
```

---

## 📊 PROGRESS TRACKER

**Copy and update as you complete each phase:**

```markdown
## Cleanup Progress

- [ ] Phase 1: TypeScript Fixes (P0) - 0/6 steps
- [ ] Phase 2: Consolidate Validations (P1) - 0/5 steps
- [ ] Phase 3: Consolidate Errors (P1) - 0/5 steps
- [ ] Phase 4: Restructure API Routes (P2) - 0/6 steps
- [ ] Phase 5: Consolidate Dashboards (P2) - 0/5 steps
- [ ] Phase 6: Organize Documentation (P3) - 0/7 steps
- [ ] Phase 7: Standardize Responses (P2) - 0/5 steps

**Overall:** 0/39 steps complete (0%)
**Estimated Time Remaining:** 20-30 hours
```

---

## 🆘 TROUBLESHOOTING

### If TypeScript errors persist:

```bash
# Clear cache
rm -rf .next node_modules
npm install
npx prisma generate
npm run type-check
```

### If tests fail after refactoring:

```bash
# Update test imports
# Check mock implementations
# Verify Prisma test database
npm run test -- --verbose
```

### If build fails:

```bash
# Check Next.js config
# Verify all imports resolve
# Check for circular dependencies
npm run build 2>&1 | tee build-errors.log
```

---

## 🎯 SUCCESS CRITERIA

**Cleanup is complete when:**

✅ Zero TypeScript errors  
✅ All tests passing (1,890+)  
✅ Clean `npm run build`  
✅ No duplicate folders  
✅ API routes logically organized  
✅ Documentation organized in docs/  
✅ Consistent API response format  
✅ Pre-commit hooks enabled and passing  
✅ Ready for staging deployment

---

**Next Step After Cleanup:** Proceed with `WEEK_1_EXECUTION_PLAN.md` for staging deployment.

_"Clean code is divine code."_ 🌾⚡
