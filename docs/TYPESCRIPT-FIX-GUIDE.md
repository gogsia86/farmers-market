# 🔧 TypeScript Fix Guide
## Incremental Improvements for Farmers Market Platform

**Purpose**: Step-by-step guide to fix remaining TypeScript errors  
**Strategy**: Prioritize by impact, fix incrementally  
**Timeline**: Can be done over multiple sprints  

---

## 📊 Quick Stats

- **Total Errors**: 532
- **Critical**: 0 (all fixed ✅)
- **High Priority**: ~50 (user-facing pages)
- **Medium Priority**: ~100 (admin/API)
- **Low Priority**: ~382 (module resolution, inferred types)

---

## 🎯 Priority Matrix

### Priority 1: User-Facing Pages (Critical Path)
**Impact**: Direct user experience  
**Effort**: 2-3 hours  
**Files**: 5 files, ~20 errors

### Priority 2: Admin Dashboard
**Impact**: Internal tools  
**Effort**: 1-2 hours  
**Files**: 3 files, ~15 errors

### Priority 3: API Routes & Actions
**Impact**: Backend logic  
**Effort**: 3-4 hours  
**Files**: 10 files, ~50 errors

### Priority 4: Module Resolution
**Impact**: IDE experience only  
**Effort**: 2-3 hours  
**Files**: Global configuration

---

## 🛠️ Fix Patterns

### Pattern 1: Array Method Type Annotations

**Problem**: `Parameter 'item' implicitly has an 'any' type`

**Before**:
```typescript
const items = products.map(product => ({
  id: product.id,
  name: product.name
}));
```

**After**:
```typescript
const items = products.map((product: Product) => ({
  id: product.id,
  name: product.name
}));
```

**Alternative** (Type inference):
```typescript
interface ProductSummary {
  id: string;
  name: string;
}

const items: ProductSummary[] = products.map(product => ({
  id: product.id,
  name: product.name
}));
```

---

### Pattern 2: Reduce Type Annotations

**Problem**: `Parameter 'sum' implicitly has an 'any' type`

**Before**:
```typescript
const total = orders.reduce((sum, order) => sum + order.total, 0);
```

**After**:
```typescript
const total = orders.reduce(
  (sum: number, order: Order) => sum + order.total,
  0
);
```

**Best Practice**:
```typescript
type OrderTotal = { total: number };
const total = orders.reduce<number>(
  (sum, order: OrderTotal) => sum + order.total,
  0
);
```

---

### Pattern 3: Destructuring Type Annotations

**Problem**: `Binding element 'status' implicitly has an 'any' type`

**Before**:
```typescript
const grouped = data.reduce((acc, { status, _count }) => {
  acc[status] = _count;
  return acc;
}, {});
```

**After**:
```typescript
interface StatusCount {
  status: string;
  _count: { status: number };
}

const grouped = data.reduce(
  (acc: Record<string, number>, { status, _count }: StatusCount) => {
    acc[status] = _count.status;
    return acc;
  },
  {} as Record<string, number>
);
```

---

### Pattern 4: Prisma Type Imports

**Problem**: `Could not find a declaration file for module '@prisma/client'`

**Solution 1** (Local import):
```typescript
// At top of file
import type { Product, Farm, User } from "@prisma/client";

// In code
const products: Product[] = await database.product.findMany();
```

**Solution 2** (Global declaration) - Already added in `src/types/global.d.ts`:
```typescript
// This is already done - just import normally
import { database } from "@/lib/database";
const products = await database.product.findMany();
```

---

### Pattern 5: CartItem Type Issues

**Problem**: `Property 'quantity' does not exist on type 'CartItemWithProduct'`

**Root Cause**: CartItemWithProduct extends Prisma CartItem which has `Decimal` type

**Fix in type definition** (`src/lib/services/cart.service.ts`):
```typescript
export interface CartItemWithProduct extends CartItem {
  product: Product & {
    farm: {
      id: string;
      name: string;
      slug: string;
    };
  };
  // Explicitly declare Decimal fields for better IDE support
  quantity: Decimal;
  priceAtAdd: Decimal;
}
```

**Fix in usage**:
```typescript
import { Decimal } from "decimal.js";

// Convert Decimal to number for calculations
const quantity = Number(item.quantity);
const price = Number(item.priceAtAdd);
const subtotal = quantity * price;
```

---

### Pattern 6: Optional Chaining & Type Guards

**Problem**: `Expression is possibly 'undefined'`

**Before**:
```typescript
const image = product.images[0];
```

**After**:
```typescript
const image = product.images?.[0];
// or
const image = product.images && product.images.length > 0 
  ? product.images[0] 
  : null;
```

**Type Guard Pattern**:
```typescript
function hasImages(product: Product): product is Product & { images: string[] } {
  return product.images !== null && product.images.length > 0;
}

if (hasImages(product)) {
  const image = product.images[0]; // Type safe!
}
```

---

## 📝 File-by-File Fix Guide

### Priority 1: Customer Cart Page

**File**: `src/app/(customer)/cart/page.tsx`  
**Errors**: 2  
**Time**: 15 minutes

**Error 1**: Line 225 - `Property 'quantity' does not exist`
```typescript
// Fix:
const quantity = Number(item.quantity);
```

**Error 2**: Line 309 - `Property 'id' does not exist`
```typescript
// Fix: Add type assertion
const itemId = (item as CartItem).id;
// or check type definition
```

---

### Priority 1: Products Detail Page

**File**: `src/app/(customer)/products/[slug]/page.tsx`  
**Errors**: 4  
**Time**: 20 minutes

**Fix All**: Add explicit types to array methods
```typescript
// Line 264: Tags map
{product.tags?.map((tag: string, index: number) => (
  <Badge key={index}>{tag}</Badge>
))}

// Line 310: Images map
{product.images?.map((image: string, index: number) => (
  <img key={index} src={image} alt={`${product.name} ${index + 1}`} />
))}

// Line 391: Related tags
{product.tags?.map((tag: string, index: number) => (
  <span key={index}>{tag}</span>
))}
```

---

### Priority 1: Orders Page

**File**: `src/app/(customer)/orders/page.tsx`  
**Errors**: 2  
**Time**: 10 minutes

```typescript
// Line 230: Order map
{orders.map((order: Order) => (
  <OrderCard key={order.id} order={order} />
))}

// Line 288: Items map
{order.items.map((item: OrderItem) => (
  <OrderItemRow key={item.id} item={item} />
))}
```

---

### Priority 2: Admin Orders Page

**File**: `src/app/(admin)/admin/orders/page.tsx`  
**Errors**: 5  
**Time**: 20 minutes

```typescript
// Line 69: Revenue calculation
const totalRevenue = orders.reduce(
  (sum: number, order: { total: number }) => sum + order.total,
  0
);

// Line 187: Order map
{orders.map((order: Order) => (
  <tr key={order.id}>...</tr>
))}

// Line 207: Items map
{order.items.map((item: OrderItem, i: number) => (
  <div key={i}>...</div>
))}
```

---

### Priority 3: Cart Actions

**File**: `src/app/actions/cart.actions.ts`  
**Errors**: 4  
**Time**: 15 minutes

```typescript
import { Decimal } from "decimal.js";
import type { CartItem } from "@prisma/client";

// Add type for cart items
interface CartItemResponse extends CartItem {
  quantity: Decimal;
  priceAtAdd: Decimal;
}

// In functions, use:
const quantity = Number(item.quantity);
const price = Number(item.priceAtAdd);
```

---

## 🚀 Quick Fix Scripts

### Fix All Map/Filter/Reduce in Single File

```bash
# Create a fix script
cat > fix-array-methods.sh << 'EOF'
#!/bin/bash
FILE=$1

# Add type annotations to common patterns
sed -i 's/\.map((\s*\([a-zA-Z_][a-zA-Z0-9_]*\)\s*)/\.map((\1: any)/g' "$FILE"
sed -i 's/\.filter((\s*\([a-zA-Z_][a-zA-Z0-9_]*\)\s*)/\.filter((\1: any)/g' "$FILE"
sed -i 's/\.reduce((\s*\([a-zA-Z_][a-zA-Z0-9_]*\),\s*\([a-zA-Z_][a-zA-Z0-9_]*\)\s*)/\.reduce((\1: any, \2: any)/g' "$FILE"

echo "Fixed: $FILE"
EOF

chmod +x fix-array-methods.sh

# Run on specific file
./fix-array-methods.sh src/app/(customer)/orders/page.tsx
```

**Note**: This adds `any` types temporarily. Replace with proper types manually.

---

## 📚 Type Definition Reference

### Common Prisma Types

```typescript
import type {
  User,
  Farm,
  Product,
  Order,
  OrderItem,
  CartItem,
  Notification,
  Review,
  Category,
  Address,
} from "@prisma/client";

// With relations
import type { Prisma } from "@prisma/client";

type ProductWithFarm = Prisma.ProductGetPayload<{
  include: { farm: true };
}>;

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } } };
}>;
```

### Custom Type Utilities

```typescript
// Already defined in src/types/global.d.ts
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// Add these to global.d.ts if needed:
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;
```

---

## ⚡ Batch Fix Strategy

### Week 1: User-Facing Pages
- [ ] Cart page (15 min)
- [ ] Products detail (20 min)
- [ ] Orders page (10 min)
- [ ] Checkout page (15 min)
- [ ] Settings page (10 min)

**Total**: 70 minutes  
**Impact**: 🔴 HIGH

### Week 2: Admin Pages
- [ ] Admin orders (20 min)
- [ ] Admin farms (15 min)
- [ ] Admin analytics (already done ✅)
- [ ] Admin notifications (already done ✅)

**Total**: 35 minutes  
**Impact**: 🟡 MEDIUM

### Week 3: Farmer Pages
- [ ] Farmer dashboard (30 min)
- [ ] Farm detail page (25 min)
- [ ] Farm orders page (20 min)

**Total**: 75 minutes  
**Impact**: 🟡 MEDIUM

### Week 4: API Routes
- [ ] Cart actions (15 min)
- [ ] Product actions (10 min)
- [ ] Order API (20 min)
- [ ] Analytics API (already done ✅)

**Total**: 45 minutes  
**Impact**: 🟢 LOW (backend)

### Week 5: Module Resolution
- [ ] Investigate Prisma type path
- [ ] Update global.d.ts
- [ ] Test on multiple environments

**Total**: 2-3 hours  
**Impact**: 🟢 LOW (IDE only)

---

## 🧪 Testing After Fixes

### After Each Fix

```bash
# 1. Type check the specific file
npx tsc --noEmit src/app/(customer)/cart/page.tsx

# 2. Lint the file
npm run lint -- src/app/(customer)/cart/page.tsx

# 3. Test in browser (dev mode)
npm run dev
# Navigate to the page and test functionality
```

### After Batch Fixes

```bash
# 1. Full type check
npx tsc --noEmit

# 2. Full lint
npm run lint

# 3. Build test
npm run build

# 4. Start production mode locally
npm run start
```

---

## 📊 Progress Tracking

### Checklist Template

```markdown
## TypeScript Cleanup Progress

### Priority 1: User-Facing (Target: Week 1)
- [ ] `cart/page.tsx` (2 errors) - ETA: 15 min
- [ ] `products/[slug]/page.tsx` (4 errors) - ETA: 20 min
- [ ] `orders/page.tsx` (2 errors) - ETA: 10 min
- [ ] `checkout/page.tsx` (1 error) - ETA: 15 min
- [ ] `settings/page.tsx` (1 error) - ETA: 10 min

**Status**: 0/5 complete | 0/10 errors fixed

### Priority 2: Admin (Target: Week 2)
- [ ] `admin/orders/page.tsx` (5 errors) - ETA: 20 min
- [ ] `admin/farms/page.tsx` (1 error) - ETA: 15 min

**Status**: 0/2 complete | 0/6 errors fixed

### Priority 3: Farmer (Target: Week 3)
- [ ] `farmer/dashboard/page.tsx` (6 errors) - ETA: 30 min
- [ ] `farmer/farms/[farmId]/page.tsx` (8 errors) - ETA: 25 min
- [ ] `farmer/farms/[farmId]/orders/page.tsx` (4 errors) - ETA: 20 min

**Status**: 0/3 complete | 0/18 errors fixed

### Total Progress
**Files Fixed**: 0/10  
**Errors Fixed**: 0/34 high-priority errors  
**Time Spent**: 0 hours  
**Remaining**: ~3.5 hours
```

---

## 🎓 Learning Resources

### TypeScript Best Practices
- [TypeScript Handbook - Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Prisma TypeScript Guide](https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety)

### Prisma Type Safety
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries)
- [Generated Types](https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/operating-against-partial-structures-of-model-types)

### Next.js 15 Types
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [App Router Types](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#typescript)

---

## 🔄 CI/CD Integration

### Add Type Check to CI (Future)

```yaml
# .github/workflows/type-check.yml
name: TypeScript Type Check

on: [pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx prisma generate
      - run: npx tsc --noEmit --incremental false
```

**Note**: Only enable after fixing high-priority errors.

---

## 💡 Pro Tips

1. **Fix One File at a Time**
   - Easier to test
   - Smaller commits
   - Less chance of breaking changes

2. **Use IDE Auto-Fix**
   - VSCode can infer types in many cases
   - Use "Add inferred type" quick fix
   - Hover over variables to see inferred types

3. **Leverage Type Inference**
   - TypeScript is smart - let it infer when possible
   - Only add explicit types when inference fails
   - Use return type annotations for functions

4. **Test After Each Fix**
   - Don't accumulate changes
   - Verify functionality still works
   - Check for unintended side effects

5. **Document Tricky Fixes**
   - Add comments for non-obvious type assertions
   - Explain why certain types are needed
   - Link to Prisma/Next.js docs when relevant

---

## 🎯 Success Criteria

### Definition of Done (per file)
- [ ] Zero TypeScript errors in file
- [ ] All tests passing
- [ ] ESLint passing
- [ ] Code review approved
- [ ] Functionality verified in browser
- [ ] Committed with descriptive message

### Overall Success
- [ ] High-priority files (Priority 1) = 0 errors
- [ ] Medium-priority files (Priority 2) = 0 errors
- [ ] Low-priority files (Priority 3) = 0 errors
- [ ] Module resolution issues resolved
- [ ] CI/CD type checking enabled
- [ ] Documentation updated

---

## 📞 Getting Help

### Stuck on a Type Error?

1. **Read the error message carefully**
   - TypeScript errors are usually descriptive
   - Look for the expected vs actual type

2. **Check Prisma Schema**
   - Verify field names and types
   - Look at relationships
   - Check for nullable fields

3. **Search the codebase**
   ```bash
   # Find similar patterns
   git grep "reduce.*sum.*order"
   
   # Find type definitions
   git grep "interface.*Cart"
   ```

4. **Ask for help**
   - Include the full error message
   - Show the code context (10 lines before/after)
   - Mention what you've tried

---

**Last Updated**: January 10, 2025  
**Status**: Ready to use  
**Estimated Total Time**: 8-10 hours across 5 weeks