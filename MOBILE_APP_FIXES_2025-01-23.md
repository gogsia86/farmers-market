# Mobile App Fixes - January 23, 2025

## Overview

Fixed all mobile app TypeScript errors related to Prisma schema field name inconsistencies. The mobile app was using outdated field names that didn't match the current database schema.

---

## Issues Fixed

### 1. Product Interface - Stock Field Mismatch ✅

**Problem:** Mobile app used `stock: number` but Prisma schema uses `inStock: boolean` and `quantityAvailable: Decimal`.

**Files Fixed:**
- `mobile-app/src/screens/farms/FarmDetailScreen.tsx`
- `mobile-app/src/screens/products/ProductDetailScreen.tsx`
- `mobile-app/src/screens/products/ProductListScreen.tsx`
- `mobile-app/src/services/api.ts`

**Changes:**
```typescript
// ❌ OLD - Incorrect field
interface Product {
  stock: number;
}

// ✅ NEW - Matches Prisma schema
interface Product {
  inStock: boolean;
  quantityAvailable: number | null;
}
```

### 2. API Client Import ✅

**Problem:** Incorrect named import for `apiClient` in FarmDetailScreen.

**Fix:**
```typescript
// ❌ OLD
import { apiClient } from '../../services/api';

// ✅ NEW
import apiClient from '../../services/api';
```

### 3. Theme Color References ✅

**Problem:** Accessing non-existent `.main` property on theme color objects.

**Fix:**
```typescript
// ❌ OLD
color: theme.colors.primary.main

// ✅ NEW
color: theme.colors.primary[600]
```

**Locations Fixed:**
- Line 645: `activeTab` border color
- Line 653: `activeTabText` color
- Line 702: `practiceIcon` color
- Line 756: `productPrice` color

### 4. Navigation Type Safety ✅

**Problem:** Navigation using `as never` type assertions causing TypeScript errors.

**Fix:**
```typescript
// ❌ OLD - Unsafe type casting
const navigation = useNavigation();
navigation.navigate('ProductDetail' as never, { productId } as never);

// ✅ NEW - Proper TypeScript types
type RootStackParamList = {
  FarmDetail: { farmId: string };
  ProductDetail: { productId: string };
  Cart: undefined;
  Home: undefined;
};

type FarmDetailRouteProp = RouteProp<RootStackParamList, 'FarmDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const navigation = useNavigation<NavigationProp>();
const route = useRoute<FarmDetailRouteProp>();
navigation.navigate('ProductDetail', { productId });
```

### 5. API Method - Farm Products ✅

**Problem:** `apiClient.farms.getProducts()` doesn't exist.

**Fix:**
```typescript
// ❌ OLD - Non-existent method
const productsResponse = await apiClient.farms.getProducts(farmId);

// ✅ NEW - Use products endpoint with farmId filter
const productsResponse = await apiClient.products.getAll({
  farmId: farmId,
  inStock: true
});
```

### 6. Product Data Mapping ✅

**Problem:** Mapping API response data using old field names.

**Fix:**
```typescript
// ❌ OLD
const productsData = productsResponse.data.map((product: any) => ({
  image: product.image || null,
  stock: product.stock || 0,
  isOrganic: product.isOrganic || false,
}));

// ✅ NEW
const productsData = productsResponse.data.map((product: any) => ({
  image: product.primaryPhotoUrl || product.images?.[0] || null,
  inStock: product.inStock ?? true,
  quantityAvailable: product.quantityAvailable ?? null,
  isOrganic: product.organic || false,
}));
```

---

## API Service Updates

### ProductQueryParams Enhancement

Added `farmId` parameter to support filtering products by farm:

```typescript
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  farmId?: string; // ✅ NEW - Filter by farm
}
```

---

## Testing Checklist

After these fixes, verify the following in the mobile app:

- [x] FarmDetailScreen loads without TypeScript errors
- [x] Farm products display correctly with stock information
- [x] Product stock shows as "X available" not just a number
- [x] Navigation to ProductDetail works from FarmDetailScreen
- [x] ProductDetailScreen loads without errors
- [x] Product stock quantity displays correctly
- [x] Add to cart respects quantityAvailable limits
- [x] ProductListScreen loads without errors
- [x] Product listings show correct stock information
- [x] Theme colors display correctly (primary[600])
- [x] All TypeScript compilation errors resolved

---

## Schema Reference

### Prisma Product Model

```prisma
model Product {
  // ... other fields

  // Inventory fields
  trackInventory       Boolean           @default(true)
  quantityAvailable    Decimal?          @db.Decimal(10, 2)  // Actual quantity
  lowStockThreshold    Decimal?          @db.Decimal(10, 2)
  allowBackorder       Boolean           @default(false)
  inStock              Boolean           @default(true)      // Availability flag

  // Image fields
  primaryPhotoUrl      String?           @db.VarChar(500)
  images               String[]          // Array of image URLs

  // ... other fields
}
```

### Field Usage Guidelines

**Stock/Inventory:**
- Use `inStock` (Boolean) for availability checks
- Use `quantityAvailable` (Decimal/number) for actual quantity
- Display: `quantityAvailable || 0` (with null coalescing)

**Images:**
- Primary image: `primaryPhotoUrl`
- Fallback: `images[0]`
- Check both for best coverage

**Organic Flag:**
- Schema field: `organic` (Boolean)
- Not `isOrganic` (mobile app convention)

---

## Related Files Changed

### Mobile App
1. `mobile-app/src/screens/farms/FarmDetailScreen.tsx`
2. `mobile-app/src/screens/products/ProductDetailScreen.tsx`
3. `mobile-app/src/screens/products/ProductListScreen.tsx`
4. `mobile-app/src/services/api.ts`

### Web App (Previous Fix)
1. `src/app/(customer)/marketplace/page.tsx`

---

## Diagnostic Status

**Before Fixes:**
- FarmDetailScreen.tsx: 9 errors ❌
- ProductDetailScreen.tsx: Multiple type errors ❌
- ProductListScreen.tsx: Type mismatches ❌

**After Fixes:**
- FarmDetailScreen.tsx: 0 errors ✅
- ProductDetailScreen.tsx: 0 errors ✅
- ProductListScreen.tsx: 0 errors ✅

**Remaining (Non-Critical):**
- tsconfig.json: 6 missing type definition warnings (dev dependencies)
- mobile-app/tsconfig.json: 4 missing type definition warnings (dev dependencies)

These warnings don't affect runtime or builds - they're just TypeScript looking for `@types/*` packages for testing libraries.

---

## Best Practices Established

1. **Always match Prisma schema** - Keep mobile app types in sync with backend
2. **Use proper TypeScript types** - No `as never` casting for navigation
3. **Null coalescing** - Use `??` for proper null/undefined handling
4. **Type imports** - Import navigation types properly
5. **API consistency** - Mobile and web should use same field names
6. **Theme structure** - Access theme colors via indexed properties `[600]` not `.main`

---

## Future Maintenance

**When Prisma Schema Changes:**
1. Update `src/types/core-entities.ts` (web)
2. Update screen interfaces in mobile app
3. Update API response mapping in both platforms
4. Update `mobile-app/src/services/api.ts` types
5. Run TypeScript check: `npm run type-check`

**Staying in Sync:**
- Web and mobile should use same field names
- Reference Prisma schema as source of truth
- Document breaking changes in migration files

---

**Fixed By:** Claude Sonnet 4.5
**Date:** January 23, 2025
**Platform:** React Native Mobile App
**Related:** DEPLOYMENT_FIX_2025-01-23.md
