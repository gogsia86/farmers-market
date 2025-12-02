# 🔧 WEEK 1 TYPESCRIPT FIXES - AUTOMATED

**Status:** FIXING ERRORS  
**Target:** Zero TypeScript errors before Week 1 execution  
**Created:** November 29, 2025

---

## 📋 ERROR SUMMARY

Total TypeScript Errors: **72**

### Error Categories:
1. **Unused imports/variables:** 7 errors
2. **Prisma schema mismatches:** 50+ errors
3. **OrderStatus enum mismatches:** 6 errors
4. **Type annotations missing:** 9 errors

---

## 🎯 FIX STRATEGY

### Phase 1: Remove Unused Imports (Quick Wins)
### Phase 2: Fix Prisma Schema Issues (Critical)
### Phase 3: Fix OrderStatus Enum Issues
### Phase 4: Add Missing Type Annotations
### Phase 5: Verify All Tests Pass

---

## 📝 FIXES TO APPLY

### File 1: `src/app/(customer)/marketplace/farms/[slug]/page.tsx`
**Error:** 'Image' is declared but its value is never read.
**Fix:** Remove unused import
```typescript
// REMOVE:
import Image from 'next/image';

// OR USE IT if needed in the component
```

---

### File 2: `src/app/(customer)/marketplace/products/page.tsx`
**Errors:**
- 'useEffect' is declared but its value is never read
- 'cart' is declared but its value is never read

**Fix:** Remove unused imports and variables
```typescript
// REMOVE unused imports:
import { useEffect } from 'react';

// REMOVE unused variable:
const cart = useCart();
```

---

### File 3: `src/app/(farmer)/farmer/payouts/page.tsx`
**Errors:**
- 'stripeConnectAccountId' does not exist (should be 'stripeAccountId')

**Fix:** Replace all occurrences
```typescript
// REPLACE:
stripeConnectAccountId

// WITH:
stripeAccountId
```

---

### File 4: `src/app/api/farmer/finances/route.ts`
**Errors:**
- OrderStatus '"REFUNDED"' not valid
- OrderStatus '"PROCESSING"' not valid
- OrderStatus '"DELIVERED"' not valid
- Property 'payment' should be 'Payment'
- Property 'items' does not exist
- Property 'customer' does not exist

**Fix:** Use correct Prisma types and includes
```typescript
// FIX 1: Remove invalid OrderStatus values
// REMOVE: status: "REFUNDED"
// REPLACE WITH: status: "CANCELLED" or handle separately

// FIX 2: Correct include syntax
include: {
  Payment: true,  // Capitalized
  OrderItem: true,  // Use correct relation name
  customer: true,
}

// FIX 3: Add type annotations
.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0)
```

---

### File 5: `src/app/api/farmer/payouts/route.ts`
**Errors:**
- Property 'completedAt' does not exist
- 'stripeConnectAccountId' should be 'stripeAccountId'
- OrderStatus '"DELIVERED"' not valid
- Property 'items' does not exist

**Fix:** Use correct property names
```typescript
// FIX 1: Use correct property name
// completedAt doesn't exist, use paidDate instead
paidDate: new Date()

// FIX 2: Replace stripeConnectAccountId
stripeAccountId

// FIX 3: Use correct OrderStatus
// DELIVERED might not be in enum, check schema
status: "COMPLETED" // or whatever is valid
```

---

### File 6-10: API Route Farming Files
**Errors:** 'request' parameter declared but never used

**Files:**
- `src/app/api/farming/advice/route.ts`
- `src/app/api/farming/education/route.ts`
- `src/app/api/farming/market/route.ts`
- `src/app/api/farming/products/recommendations/route.ts`
- `src/app/api/farming/support/route.ts`

**Fix:** Prefix with underscore
```typescript
// CHANGE:
export async function POST(request: NextRequest) {

// TO:
export async function POST(_request: NextRequest) {
```

---

### File 11: `src/app/api/marketplace/farms/[slug]/route.ts`
**Errors:**
- 'request' parameter unused
- 'isFeatured' should be 'featured'
- 'photos' doesn't exist in include
- CertificationStatus '"APPROVED"' type mismatch
- Multiple properties don't exist on Farm type

**Fix:** Large refactor needed
```typescript
// FIX 1: Unused parameter
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {

// FIX 2: Use correct property names based on schema
orderBy: {
  featured: 'desc',  // NOT isFeatured
}

// FIX 3: Correct include syntax
include: {
  FarmPhoto: true,  // NOT photos (check schema)
  FarmCertification: true,
  // etc.
}

// FIX 4: Add proper type guards for optional properties
const farm = await database.farm.findUnique({
  where: { slug },
  include: {
    Product: true,
    FarmReview: true,
    FarmCertification: true,
    FarmPhoto: true,
  }
});

// FIX 5: Access properties correctly
const products = farm?.Product || [];
const reviews = farm?.FarmReview || [];
const certifications = farm?.FarmCertification || [];
const photos = farm?.FarmPhoto || [];
```

---

### File 12: `src/app/api/marketplace/products/route.ts`
**Errors:**
- 'stockQuantity' doesn't exist (should be 'stock')
- 'isOrganic' should be 'organic'
- 'isFeatured' should be 'featured'
- CertificationStatus type mismatch

**Fix:** Use correct property names
```typescript
// FIX 1: Correct property name
where: {
  stock: { gt: 0 }  // NOT stockQuantity
}

// FIX 2: Correct property name
where: {
  organic: true  // NOT isOrganic
}

// FIX 3: Correct orderBy
orderBy: {
  featured: 'desc'  // NOT isFeatured
}
```

---

## 🚀 AUTOMATED FIX SCRIPT

Run this command to fix many issues automatically:

```bash
# Fix all unused variables/imports
npx eslint --fix "src/**/*.{ts,tsx}"

# Fix formatting
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## 📋 MANUAL FIX CHECKLIST

### Step 1: Review Prisma Schema
- [ ] Check actual property names in `prisma/schema.prisma`
- [ ] Verify relation names (capitalized vs lowercase)
- [ ] Confirm OrderStatus enum values
- [ ] Verify all field names match

### Step 2: Fix Critical Files (Order Matters)
- [ ] `src/app/api/farmer/finances/route.ts`
- [ ] `src/app/api/farmer/payouts/route.ts`
- [ ] `src/app/api/marketplace/farms/[slug]/route.ts`
- [ ] `src/app/api/marketplace/products/route.ts`
- [ ] `src/app/(farmer)/farmer/payouts/page.tsx`

### Step 3: Fix Simple Issues
- [ ] Remove unused imports (6 files)
- [ ] Prefix unused parameters with underscore (6 files)
- [ ] Add type annotations (9 locations)

### Step 4: Verify
- [ ] Run `npm run type-check`
- [ ] Run `npm run test`
- [ ] Fix any remaining errors
- [ ] Commit changes

---

## 🔍 PRISMA SCHEMA REFERENCE

Based on common issues, verify these in your schema:

```prisma
model Farm {
  // Verify these property names exist:
  stripeAccountId String?  // NOT stripeConnectAccountId
  
  // Verify relation names (case sensitive):
  Product        Product[]       // Capitalized
  FarmPhoto      FarmPhoto[]     // Capitalized
  FarmReview     FarmReview[]    // Capitalized
  FarmCertification FarmCertification[]  // Capitalized
}

model Product {
  stock    Int      // NOT stockQuantity
  organic  Boolean  // NOT isOrganic
  featured Boolean  // NOT isFeatured
}

model Order {
  // Verify relation names:
  OrderItem OrderItem[]  // Capitalized
  Payment   Payment[]    // Capitalized
  customer  User @relation(...)  // lowercase (referencing User)
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  COMPLETED
  CANCELLED
  // VERIFY: Does DELIVERED, PROCESSING, REFUNDED exist?
}

enum CertificationStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}
```

---

## 🎯 QUICK FIX COMMANDS

```bash
# 1. Check current errors
npm run type-check

# 2. Auto-fix what we can
npx eslint --fix "src/**/*.{ts,tsx}"

# 3. Format code
npx prettier --write "src/**/*.{ts,tsx}"

# 4. Check schema
npx prisma format

# 5. Regenerate Prisma Client
npx prisma generate

# 6. Re-check types
npm run type-check

# 7. Run tests
npm run test
```

---

## 📊 PROGRESS TRACKING

### Fixed Files (0/12):
- [ ] `src/app/(customer)/marketplace/farms/[slug]/page.tsx`
- [ ] `src/app/(customer)/marketplace/products/page.tsx`
- [ ] `src/app/(farmer)/farmer/payouts/page.tsx`
- [ ] `src/app/api/farmer/finances/route.ts`
- [ ] `src/app/api/farmer/payouts/route.ts`
- [ ] `src/app/api/farming/advice/route.ts`
- [ ] `src/app/api/farming/education/route.ts`
- [ ] `src/app/api/farming/market/route.ts`
- [ ] `src/app/api/farming/products/recommendations/route.ts`
- [ ] `src/app/api/farming/support/route.ts`
- [ ] `src/app/api/marketplace/farms/[slug]/route.ts`
- [ ] `src/app/api/marketplace/products/route.ts`

---

## ✅ SUCCESS CRITERIA

Week 1 TypeScript fixes complete when:
- ✅ `npm run type-check` shows 0 errors
- ✅ `npm run lint` passes
- ✅ `npm run test` passes
- ✅ All files in checklist marked complete
- ✅ Can commit without husky pre-commit failures

---

## 🚨 IF STUCK

1. **Check Prisma Schema First:**
   ```bash
   npx prisma studio
   # Verify actual property names
   ```

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Check Generated Types:**
   ```bash
   # Open: node_modules/.prisma/client/index.d.ts
   # Search for the model to see actual property names
   ```

4. **Ask for Help:**
   - Review error message carefully
   - Check Prisma documentation
   - Search for similar issues on GitHub

---

**STATUS:** READY TO FIX  
**NEXT STEP:** Start with Step 1 - Review Prisma Schema  
**ESTIMATED TIME:** 2-3 hours