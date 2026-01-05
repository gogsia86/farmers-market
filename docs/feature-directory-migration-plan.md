# Feature Directory Migration Plan

**Farmers Market Platform - Directory Structure Consolidation**
Version: 1.0
Date: November 15, 2025
Status: READY FOR EXECUTION

---

## Executive Summary

This document outlines a comprehensive plan to consolidate the dual feature directory structure currently present in the codebase. The goal is to establish a single, consistent, domain-driven architecture pattern following divine principles.

### Current Problem

The codebase currently has TWO competing feature directory patterns:

1. **Component-first pattern**: `src/components/features/`
2. **Domain-driven pattern**: `src/features/`

This duplication causes:
- Developer confusion about where to place new code
- Potential for duplicate implementations
- Inconsistent import paths
- Architectural ambiguity
- Maintenance overhead

### Proposed Solution

**Consolidate to domain-driven architecture**: `src/features/` (recommended)

**Rationale**:
- Aligns with agricultural domain consciousness
- Scales better for enterprise (kilo-scale architecture)
- Clearer separation of concerns
- Follows Next.js 15 best practices
- Matches divine instruction patterns

---

## Current State Analysis

### Existing Structure

```
src/
├── components/
│   ├── features/           # ❌ Pattern #1 (to be migrated)
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── farms/
│   │   ├── orders/
│   │   ├── products/
│   │   └── user/
│   └── ui/                 # ✅ Keep (base UI components)
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── features/               # ✅ Pattern #2 (target structure)
│   ├── farm/
│   ├── product/
│   ├── order/
│   ├── user/
│   └── ...
└── lib/                    # ✅ Keep (services, utils)
```

### Impact Analysis

**Files to migrate**: ~50-100 component files
**Import statements to update**: ~200-300 locations
**Estimated effort**: 4-6 hours
**Risk level**: Medium (high test coverage mitigates risk)

---

## Target Architecture

### Final Directory Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (admin)/
│   ├── (customer)/
│   ├── (farmer)/
│   └── api/
│
├── components/                    # Shared UI components only
│   └── ui/                       # Base components (Button, Card, etc.)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── features/                      # Domain-driven feature modules
│   ├── auth/                     # Authentication domain
│   │   ├── components/           # Auth-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── SessionProvider.tsx
│   │   ├── hooks/                # Auth-specific hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useSession.ts
│   │   ├── actions/              # Server actions
│   │   │   ├── login.action.ts
│   │   │   └── register.action.ts
│   │   ├── types/                # Domain types
│   │   │   └── auth.types.ts
│   │   └── index.ts              # Public API exports
│   │
│   ├── farm/                     # Farm management domain
│   │   ├── components/
│   │   │   ├── FarmCard.tsx
│   │   │   ├── FarmGrid.tsx
│   │   │   ├── FarmProfile.tsx
│   │   │   └── FarmManagementDashboard.tsx
│   │   ├── hooks/
│   │   │   ├── useFarm.ts
│   │   │   └── useFarmList.ts
│   │   ├── actions/
│   │   │   ├── createFarm.action.ts
│   │   │   └── updateFarm.action.ts
│   │   ├── types/
│   │   │   └── farm.types.ts
│   │   └── index.ts
│   │
│   ├── product/                  # Product catalog domain
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   └── ProductForm.tsx
│   │   ├── hooks/
│   │   │   ├── useProduct.ts
│   │   │   └── useProductSearch.ts
│   │   ├── actions/
│   │   │   ├── createProduct.action.ts
│   │   │   └── updateProduct.action.ts
│   │   ├── types/
│   │   │   └── product.types.ts
│   │   └── index.ts
│   │
│   ├── order/                    # Order processing domain
│   │   ├── components/
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderList.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useOrder.ts
│   │   │   └── useOrderHistory.ts
│   │   ├── actions/
│   │   │   ├── createOrder.action.ts
│   │   │   └── updateOrderStatus.action.ts
│   │   ├── types/
│   │   │   └── order.types.ts
│   │   └── index.ts
│   │
│   ├── cart/                     # Shopping cart domain
│   │   ├── components/
│   │   │   ├── CartSheet.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── hooks/
│   │   │   ├── useCart.ts
│   │   │   └── useCartTotal.ts
│   │   ├── store/                # Cart state management
│   │   │   └── cartStore.ts
│   │   ├── types/
│   │   │   └── cart.types.ts
│   │   └── index.ts
│   │
│   ├── checkout/                 # Checkout flow domain
│   │   ├── components/
│   │   │   ├── CheckoutWizard.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── ShippingForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── hooks/
│   │   │   ├── useCheckout.ts
│   │   │   └── usePaymentIntent.ts
│   │   ├── actions/
│   │   │   ├── createPaymentIntent.action.ts
│   │   │   └── completeCheckout.action.ts
│   │   ├── types/
│   │   │   └── checkout.types.ts
│   │   └── index.ts
│   │
│   └── user/                     # User profile domain
│       ├── components/
│       │   ├── UserProfile.tsx
│       │   ├── UserAvatar.tsx
│       │   └── UserSettings.tsx
│       ├── hooks/
│       │   ├── useUser.ts
│       │   └── useUserProfile.ts
│       ├── actions/
│       │   ├── updateProfile.action.ts
│       │   └── uploadAvatar.action.ts
│       ├── types/
│       │   └── user.types.ts
│       └── index.ts
│
├── lib/                          # Core business logic & utilities
│   ├── services/                 # Business logic services
│   ├── database/                 # Database singleton
│   ├── auth/                     # Auth configuration
│   ├── utils/                    # Helper functions
│   └── ai/                       # AI Agent Framework
│
├── types/                        # Global TypeScript types
└── hooks/                        # Global React hooks
```

### Feature Module Structure (Template)

Each feature module follows this structure:

```
features/<domain>/
├── components/           # Domain-specific React components
│   ├── <Feature>Card.tsx
│   ├── <Feature>List.tsx
│   ├── <Feature>Form.tsx
│   └── <Feature>Detail.tsx
│
├── hooks/               # Domain-specific React hooks
│   ├── use<Feature>.ts
│   └── use<Feature>List.ts
│
├── actions/             # Server actions (Next.js App Router)
│   ├── create<Feature>.action.ts
│   ├── update<Feature>.action.ts
│   └── delete<Feature>.action.ts
│
├── types/               # TypeScript type definitions
│   └── <domain>.types.ts
│
├── constants/           # Domain constants (optional)
│   └── <domain>.constants.ts
│
├── utils/               # Domain-specific utilities (optional)
│   └── <domain>.utils.ts
│
└── index.ts            # Public API (barrel export)
```

---

## Migration Strategy

### Phase 1: Pre-Migration (Day 1, Morning)

**Duration**: 2 hours

#### 1.1 Create Backup Branch
```bash
git checkout -b backup/pre-features-migration
git push origin backup/pre-features-migration
git checkout phase-4-api-consolidation  # or main/master
git checkout -b feature/consolidate-features-directory
```

#### 1.2 Audit Current State
```bash
# Find all files in components/features
find src/components/features -type f -name "*.tsx" -o -name "*.ts"

# Count import statements
grep -r "from.*components/features" src/ | wc -l
grep -r "from.*@/components/features" src/ | wc -l
```

#### 1.3 Run Full Test Suite
```bash
npm run test
npm run type-check
npm run lint
```

**Checkpoint**: All tests passing, no TypeScript errors

#### 1.4 Document Current Imports
Create a mapping file for reference:
```bash
# Generate import map
find src/components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec echo {} \; > migration-map.txt
```

---

### Phase 2: Directory Structure Creation (Day 1, Afternoon)

**Duration**: 1 hour

#### 2.1 Create Target Feature Directories

```bash
# Create feature module structure
mkdir -p src/features/auth/{components,hooks,actions,types}
mkdir -p src/features/farm/{components,hooks,actions,types}
mkdir -p src/features/product/{components,hooks,actions,types}
mkdir -p src/features/order/{components,hooks,actions,types}
mkdir -p src/features/cart/{components,hooks,store,types}
mkdir -p src/features/checkout/{components,hooks,actions,types}
mkdir -p src/features/user/{components,hooks,actions,types}
```

#### 2.2 Create Index Files (Barrel Exports)

Create `src/features/<domain>/index.ts` for each domain:

```typescript
// src/features/farm/index.ts
export * from "./components";
export * from "./hooks";
export * from "./actions";
export * from "./types";
```

---

### Phase 3: File Migration (Day 1-2)

**Duration**: 3-4 hours

#### 3.1 Migration Order (by dependency)

1. **Types first** (no dependencies)
2. **Utilities & constants** (minimal dependencies)
3. **Hooks** (depend on types)
4. **Actions** (depend on types, services)
5. **Components** (depend on all above)

#### 3.2 Migration Script (Automated)

```bash
#!/bin/bash
# migrate-features.sh

# Define source and target paths
SOURCE_BASE="src/components/features"
TARGET_BASE="src/features"

# Migrate each domain
declare -A DOMAIN_MAP=(
  ["auth"]="auth"
  ["farms"]="farm"
  ["products"]="product"
  ["orders"]="order"
  ["cart"]="cart"
  ["checkout"]="checkout"
  ["user"]="user"
)

for source_dir in "${!DOMAIN_MAP[@]}"; do
  target_dir="${DOMAIN_MAP[$source_dir]}"

  echo "Migrating $source_dir -> $target_dir"

  # Move files to appropriate subdirectories
  # This is a template - adjust based on actual structure

  if [ -d "$SOURCE_BASE/$source_dir" ]; then
    # Move components
    find "$SOURCE_BASE/$source_dir" -name "*.tsx" -exec mv {} "$TARGET_BASE/$target_dir/components/" \;

    # Move hooks
    find "$SOURCE_BASE/$source_dir" -name "use*.ts" -exec mv {} "$TARGET_BASE/$target_dir/hooks/" \;

    # Move types
    find "$SOURCE_BASE/$source_dir" -name "*.types.ts" -exec mv {} "$TARGET_BASE/$target_dir/types/" \;
  fi
done

echo "Migration complete!"
```

#### 3.3 Manual Migration Steps (if script not suitable)

For each domain:

1. **Copy files** to new location (don't delete yet)
2. **Update internal imports** within the module
3. **Test the module** in isolation
4. **Update external imports** in app/pages
5. **Verify no broken imports**
6. **Delete old files** after confirmation

**Example: Farm domain migration**

```bash
# Step 1: Copy files
cp -r src/components/features/farms/* src/features/farm/components/

# Step 2: Update imports in copied files
# Find and replace:
# @/components/features/farms → @/features/farm
# @/components/ui → @/components/ui (no change)

# Step 3: Test
npm run type-check
npm run test -- farm

# Step 4: Update external imports
# Use VSCode Find & Replace:
# Find: @/components/features/farms
# Replace: @/features/farm
```

---

### Phase 4: Import Path Updates (Day 2)

**Duration**: 2 hours

#### 4.1 Global Find & Replace

Use VSCode or sed to update import paths:

```bash
# Update auth imports
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|@/components/features/auth|@/features/auth|g' {} +

# Update farm imports
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|@/components/features/farms|@/features/farm|g' {} +

# Update product imports
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|@/components/features/products|@/features/product|g' {} +

# Update order imports
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|@/components/features/orders|@/features/order|g' {} +

# Update cart imports
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|@/components/features/cart|@/features/cart|g' {} +

# Update checkout imports
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|@/components/features/checkout|@/features/checkout|g' {} +

# Update user imports
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|@/components/features/user|@/features/user|g' {} +
```

#### 4.2 Update Path Aliases (tsconfig.json)

Ensure path aliases support new structure:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

---

### Phase 5: Verification & Testing (Day 2)

**Duration**: 2 hours

#### 5.1 TypeScript Verification
```bash
npm run type-check
```
**Expected**: No TypeScript errors

#### 5.2 ESLint Check
```bash
npm run lint
```
**Expected**: No linting errors (or only minor warnings)

#### 5.3 Test Suite Execution
```bash
# Run all tests
npm run test

# Run specific domain tests
npm run test -- farm
npm run test -- product
npm run test -- order
npm run test -- checkout
```
**Expected**: All tests passing

#### 5.4 Manual Testing Checklist

- [ ] Home page loads
- [ ] Product listing works
- [ ] Product detail page renders
- [ ] Farm profile page works
- [ ] Shopping cart functionality
- [ ] Checkout flow complete
- [ ] Order creation succeeds
- [ ] User authentication works
- [ ] User profile page loads
- [ ] Admin dashboard accessible

#### 5.5 Build Verification
```bash
npm run build
```
**Expected**: Successful production build

---

### Phase 6: Cleanup (Day 2, End)

**Duration**: 30 minutes

#### 6.1 Remove Old Directory
```bash
# After confirming everything works
rm -rf src/components/features
```

#### 6.2 Update Documentation

Update these files:
- [ ] `README.md` - Update architecture section
- [ ] `.cursorrules` - Update directory references
- [ ] `.github/instructions/*.md` - Update import patterns
- [ ] `docs/dependencies.md` - Update if needed

#### 6.3 Commit Changes
```bash
git add .
git commit -m "feat: consolidate features directory to domain-driven architecture

- Migrate all features from components/features to features/
- Update all import paths across codebase
- Organize by domain: auth, farm, product, order, cart, checkout, user
- Each domain follows consistent structure: components, hooks, actions, types
- Remove old components/features directory
- Update documentation and configuration

BREAKING CHANGE: Import paths changed from @/components/features/* to @/features/*"

git push origin feature/consolidate-features-directory
```

---

## Rollback Plan

If critical issues arise during migration:

### Immediate Rollback
```bash
# Discard all changes
git reset --hard HEAD
git clean -fd

# Or switch to backup branch
git checkout backup/pre-features-migration
```

### Partial Rollback
```bash
# Revert specific commits
git revert <commit-hash>

# Restore specific files
git checkout HEAD~1 -- src/components/features
```

---

## Post-Migration Tasks

### 1. Update Developer Documentation

Create `docs/architecture/features.md`:
- Explain domain-driven feature structure
- Provide templates for new features
- Document naming conventions
- Include code examples

### 2. Create Feature Template Script

```bash
#!/bin/bash
# create-feature.sh
# Usage: ./create-feature.sh <domain-name>

DOMAIN=$1
FEATURE_DIR="src/features/$DOMAIN"

mkdir -p "$FEATURE_DIR"/{components,hooks,actions,types}

# Create index.ts
cat > "$FEATURE_DIR/index.ts" << EOF
export * from "./components";
export * from "./hooks";
export * from "./actions";
export * from "./types";
EOF

# Create types file
cat > "$FEATURE_DIR/types/$DOMAIN.types.ts" << EOF
// ${DOMAIN^} domain types
export interface ${DOMAIN^} {
  id: string;
  // Add fields
}
EOF

echo "✅ Feature '$DOMAIN' created at $FEATURE_DIR"
```

### 3. Add ESLint Rules

Prevent imports from old location:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/components/features/*"],
            message: "Import from @/features/* instead"
          }
        ]
      }
    ]
  }
};
```

### 4. Update CI/CD Pipeline

Add validation step:

```yaml
# .github/workflows/validate-structure.yml
name: Validate Structure

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for deprecated paths
        run: |
          if [ -d "src/components/features" ]; then
            echo "❌ Error: src/components/features should not exist"
            exit 1
          fi
          echo "✅ Directory structure valid"
```

---

## Success Criteria

Migration is considered successful when:

- ✅ All files moved to `src/features/*` structure
- ✅ Zero references to `@/components/features/*` in codebase
- ✅ All TypeScript checks pass (`npm run type-check`)
- ✅ All tests pass (`npm run test`)
- ✅ Production build succeeds (`npm run build`)
- ✅ Manual testing checklist complete
- ✅ Old directory removed
- ✅ Documentation updated
- ✅ ESLint rules prevent future violations

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Broken imports | Medium | High | Automated testing, thorough verification |
| Type errors | Low | Medium | TypeScript strict mode, incremental migration |
| Test failures | Low | High | Run tests frequently during migration |
| Production issues | Low | High | Staging deployment, rollback plan ready |
| Developer confusion | Medium | Low | Clear documentation, team communication |

---

## Timeline

| Phase | Duration | Dependencies | Deliverable |
|-------|----------|--------------|-------------|
| Pre-Migration | 2 hours | None | Backup, audit, baseline |
| Structure Creation | 1 hour | Pre-Migration | New directories |
| File Migration | 3-4 hours | Structure Creation | Files in new location |
| Import Updates | 2 hours | File Migration | Updated imports |
| Verification | 2 hours | Import Updates | All tests passing |
| Cleanup | 30 min | Verification | Old directory removed |
| **Total** | **10-11 hours** | | **Complete migration** |

---

## Team Communication

### Before Migration
- [ ] Notify team of upcoming migration
- [ ] Schedule migration during low-traffic period
- [ ] Assign migration owner
- [ ] Prepare rollback contacts

### During Migration
- [ ] Post updates in team chat
- [ ] Block new PRs to affected directories
- [ ] Monitor for issues

### After Migration
- [ ] Announce completion
- [ ] Share new import patterns
- [ ] Conduct team walkthrough
- [ ] Update onboarding docs

---

## Appendix A: Import Pattern Examples

### Before (Old Pattern)
```typescript
// ❌ OLD - Don't use anymore
import { FarmCard } from "@/components/features/farms/FarmCard";
import { ProductGrid } from "@/components/features/products/ProductGrid";
import { useCart } from "@/components/features/cart/useCart";
```

### After (New Pattern)
```typescript
// ✅ NEW - Use this pattern
import { FarmCard } from "@/features/farm/components/FarmCard";
import { ProductGrid } from "@/features/product/components/ProductGrid";
import { useCart } from "@/features/cart/hooks/useCart";

// ✅ EVEN BETTER - Use barrel exports
import { FarmCard } from "@/features/farm";
import { ProductGrid } from "@/features/product";
import { useCart } from "@/features/cart";
```

---

## Appendix B: Divine Consciousness Integration

### Agricultural Feature Naming
```typescript
// ✅ Divine consciousness in new structure
// src/features/farm/components/QuantumFarmCard.tsx
export function QuantumFarmCard({ farm }: QuantumFarmCardProps) {
  const consciousness = useComponentConsciousness("QuantumFarmCard");
  const { season } = useAgriculturalContext();

  return (
    <Card className="farm-quantum-card">
      {/* Component with agricultural awareness */}
    </Card>
  );
}
```

### Seasonal Context Integration
```typescript
// ✅ Domain features aware of agricultural cycles
// src/features/farm/hooks/useSeasonalFarm.ts
export function useSeasonalFarm(farmId: string) {
  const { season } = useAgriculturalContext();
  const farm = useFarm(farmId);

  return {
    farm,
    seasonalProducts: farm?.products.filter(p =>
      isSeasonallyAppropriate(p, season)
    ),
    currentSeason: season
  };
}
```

---

**Migration Owner**: Development Team
**Last Updated**: November 15, 2025
**Status**: Ready for Execution
**Approval Required**: Yes (Team Lead)

---

_"Organize with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_ 🌾⚡
