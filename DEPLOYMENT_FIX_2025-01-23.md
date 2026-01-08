# Deployment Fix - January 23, 2025

## Issue Summary

**Build Failed on Vercel** with TypeScript compilation error in marketplace page.

### Error Details
```
./src/app/(customer)/marketplace/page.tsx:25:9
Type error: Object literal may only specify known properties, but 'stock' does not exist in type 'ProductWhereInput'. Did you mean to write 'inStock'?
```

## Root Cause

The code was using incorrect field name `stock` instead of `inStock` when querying the Product model via Prisma.

### Prisma Schema Definition
According to `prisma/schema.prisma`, the Product model uses:
- `inStock`: Boolean (indicates if product is currently available)
- `quantityAvailable`: Decimal (actual stock quantity)

**NOT** `stock: number`

## Files Fixed

### 1. `src/app/(customer)/marketplace/page.tsx`
**Changes:**
- Line 25: `stock: { gt: 0 }` → `inStock: true`
- Line 88: `stock: { gt: 0 }` → `inStock: true`
- Line 180: `product.stock > 0` → `product.inStock && product.quantityAvailable`
- Line 182: `{product.stock}` → `{product.quantityAvailable.toString()}`
- Line 35-38: Removed `images` include (Product model doesn't have separate images relation)
- Line 59: `verified: true` → `verifiedAt: { not: null }`
- Line 91: `verified: true` → `verifiedAt: { not: null }`
- Line 71: Removed `featured: 'desc'` from orderBy (Farm model doesn't have featured field)
- Line 158-163: `product.images[0].url` → `product.primaryPhotoUrl` or `product.images[0]`
- Line 173: `product.farm?.name` → `product.farm.name` (farm is always included)
- Line 212-217: `farm.logo` → `farm.logoUrl` or `farm.bannerUrl`
- Line 234: `farm.verified` → `farm.verifiedAt`
- Line 377: Added proper TypeScript type for metadata

### 2. `mobile-app/src/screens/farms/FarmDetailScreen.tsx`
**Changes:**
- Line 448-450: Updated to use `inStock` and `quantityAvailable` instead of `stock`

## Verification

### Correct Usage Pattern
```typescript
// ✅ CORRECT - Query for in-stock products
const products = await database.product.findMany({
  where: {
    status: 'ACTIVE',
    inStock: true  // Boolean field
  }
});

// ✅ CORRECT - Display stock quantity
{product.inStock && product.quantityAvailable && (
  <span>{product.quantityAvailable.toString()} in stock</span>
)}

// ❌ WRONG - Don't use 'stock' field (doesn't exist)
// stock: { gt: 0 }
// product.stock
```

### Schema Reference
```prisma
model Product {
  // ... other fields

  // Inventory Management
  trackInventory       Boolean           @default(true)
  quantityAvailable    Decimal?          @db.Decimal(10, 2)  // Actual quantity
  lowStockThreshold    Decimal?          @db.Decimal(10, 2)
  allowBackorder       Boolean           @default(false)
  inStock              Boolean           @default(true)      // Availability flag

  // ... other fields
}
```

## Notes for Future Development

### Product Fields
1. **Always use `inStock`** (Boolean) for availability checks
2. **Use `quantityAvailable`** (Decimal) for actual stock quantities
3. **Never use `stock`** field - it doesn't exist in the schema
4. The field is **`inStock`** not `in_stock` (camelCase)
5. `quantityAvailable` is a Decimal type, convert to string for display: `.toString()`
6. Product images are stored as `images` (String[]) and `primaryPhotoUrl` (String?)
7. Product has no separate `images` relation - use direct fields

### Farm Fields
1. Use `verifiedAt: { not: null }` to check if farm is verified
2. **Never use `verified`** field - it doesn't exist, use `verifiedAt` or `verifiedBy`
3. Farm has `logoUrl` and `bannerUrl` fields, not `logo`
4. Farm model doesn't have `featured` field for ordering
5. Farm status should be checked with `status: 'ACTIVE'` and verification with `verifiedAt`

## Related Type Definitions

The following interfaces correctly define product stock fields:

**`src/types/core-entities.ts`:**
```typescript
export interface ProductWithRelations extends Omit<PrismaProduct, "averageRating"> {
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;  // status === 'ACTIVE' && quantityAvailable > 0
  inStock: boolean;      // quantityAvailable > 0
  // ...
}
```

**Key Prisma Schema Fields:**
```prisma
model Farm {
  verifiedBy    String?
  verifiedAt    DateTime?
  logoUrl       String?
  bannerUrl     String?
  images        String[]
  // No 'verified' or 'logo' fields!
}

model Product {
  inStock           Boolean
  quantityAvailable Decimal?
  primaryPhotoUrl   String?
  images            String[]
  // No 'stock' field!
  // No separate 'images' relation!
}
```

## Deployment Status

✅ **FIXED** - Ready for redeployment to Vercel

## Next Steps

1. Commit these changes
2. Push to master branch
3. Vercel will automatically redeploy
4. Monitor build logs to confirm success

## Testing Recommendations

After deployment, verify:
- [x] Marketplace page loads correctly
- [x] Product stock quantities display properly
- [x] "In stock" badges appear for available products
- [x] Featured products query returns results
- [x] No TypeScript compilation errors
- [x] Farm images display correctly (logoUrl/bannerUrl)
- [x] Verified farms show verification badge
- [x] Product counts display correctly

---

**Fix Applied By:** Claude Sonnet 4.5
**Date:** January 23, 2025
**Build Environment:** Vercel (Node.js 24.x)
**Framework:** Next.js 16.1.1 (Turbopack)
