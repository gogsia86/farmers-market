# 🔧 Analytics Services - Post-Launch Fixes TODO

**Status**: Non-Blocking for Production Deployment
**Priority**: Medium (Post-Launch Phase 2)
**Estimated Effort**: 4-6 hours

## 📋 Overview

The analytics and recommendation engine services have TypeScript errors due to schema mismatches between the code implementation and the actual Prisma schema. These are isolated to advanced ML/recommendation features and **do not affect core platform functionality**.

## 🎯 Core Issue

The analytics services were written expecting:

- Direct `productId` field on `UserInteraction` model
- `action` field on `UserInteraction` model
- Direct `product` relation on `UserInteraction` model
- `isLocal` field on `Farm` model
- `available` field on `Product` model

**Actual Prisma Schema Has:**

- `entityType` + `entityId` (generic approach)
- `type` field (InteractionType enum)
- No direct relations (must query separately)
- No `isLocal` field on Farm
- `status` enum field on Product (not `available` boolean)

## 📁 Files Requiring Updates

### 1. `src/lib/services/analytics/recommendation-engine.service.ts`

**Lines with Errors**: ~60 errors
**Main Issues**:

- Line 166: `productId` doesn't exist - use `entityId` + `entityType: "product"`
- Line 178: `by: ["productId"]` - change to `by: ["entityId"]`
- Line 254: `action` doesn't exist - use `type` field
- Line 266, 267: `interaction.product` - no direct relation, must query separately
- Line 286, 498: `status: "AVAILABLE"` is correct, not `available: true`
- Line 321, 522: `product.farm` - must include farm in query

### 2. `src/lib/services/analytics/personalization.service.ts`

**Lines with Errors**: ~23 errors
**Main Issues**:

- Line 214: `farm.isLocal` doesn't exist - remove or use location-based logic
- Lines 253, 262, 278, 397, 404: `product` relation doesn't exist on UserInteraction
- Line 504: Include clause for non-existent relation
- Lines 526-589: `action` field doesn't exist - use `type`
- Lines 623, 630, 653, 660: `action` in where clause - use `type`
- Lines 821-822: Season type may be undefined

### 3. `src/lib/services/recommendation-engine.service.ts`

**Lines with Errors**: ~27 errors
**Main Issues**:

- Similar issues to analytics/recommendation-engine.service.ts
- Must use `entityType` and `entityId` instead of `productId`
- Must use `type` instead of `action`
- Must query products separately when needed

## 🛠️ Fix Strategy

### Step 1: Update UserInteraction Queries

**Before:**

```typescript
const interactions = await database.userInteraction.findMany({
  where: {
    productId: someId,
    action: { in: ["VIEW", "PURCHASE"] },
  },
  include: { product: true },
});
```

**After:**

```typescript
const interactions = await database.userInteraction.findMany({
  where: {
    entityType: "product",
    entityId: someId,
    type: { in: ["VIEW", "PURCHASE"] },
  },
});

// Query products separately if needed
const productIds = interactions.map((i) => i.entityId);
const products = await database.product.findMany({
  where: { id: { in: productIds } },
  include: { farm: true },
});
```

### Step 2: Update Aggregation Queries

**Before:**

```typescript
const result = await database.userInteraction.groupBy({
  by: ["productId"],
  _count: { productId: true },
  orderBy: { _count: { productId: "desc" } },
});
```

**After:**

```typescript
const result = await database.userInteraction.groupBy({
  by: ["entityId"],
  where: { entityType: "product" },
  _count: { id: true },
  orderBy: { _count: { id: "desc" } },
});
```

### Step 3: Use Utility Functions

Import and use the helper functions from `src/lib/utils/interaction.utils.ts`:

```typescript
import {
  createProductInteractionWhere,
  getInteractionWeight,
  extractProductIdsFromInteractions,
} from "@/lib/utils/interaction.utils";

// Use helper to create where clause
const where = createProductInteractionWhere(productId, ["VIEW", "PURCHASE"]);
const interactions = await database.userInteraction.findMany({ where });

// Extract product IDs
const productIds = extractProductIdsFromInteractions(interactions);

// Get interaction weight
const weight = getInteractionWeight(interaction.type);
```

### Step 4: Handle Farm Fields

**For `isLocal` issue:**

```typescript
// Instead of farm.isLocal (doesn't exist)
// Calculate based on coordinates
const isLocal =
  calculateDistance(farm.latitude, farm.longitude, userLat, userLng) < 50; // within 50km
```

### Step 5: Fix Product Status Checks

**Before:**

```typescript
where: {
  available: true;
}
```

**After:**

```typescript
where: { status: "AVAILABLE", inStock: true }
```

## 📊 Testing Strategy

After fixes:

1. **Unit Tests**: Update test files for affected services

   ```bash
   npm test -- --testPathPattern=recommendation
   npm test -- --testPathPattern=personalization
   ```

2. **Integration Tests**: Test recommendation flows end-to-end

   ```bash
   npm test -- --testPathPattern=analytics
   ```

3. **Type Check**: Verify all TypeScript errors are resolved
   ```bash
   npm run type-check
   ```

## ✅ Acceptance Criteria

- [ ] Zero TypeScript errors in recommendation-engine services
- [ ] Zero TypeScript errors in personalization service
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] No breaking changes to existing APIs
- [ ] Documentation updated

## 🚀 Implementation Plan

### Phase 1: Foundation (1 hour)

- ✅ Create interaction utility functions (DONE)
- Review all affected files and document line-by-line changes needed

### Phase 2: Core Fixes (2-3 hours)

- Update all UserInteraction queries to use entityType/entityId
- Replace `action` with `type` throughout
- Remove non-existent includes
- Add separate product queries where needed

### Phase 3: Advanced Features (1-2 hours)

- Fix collaborative filtering logic
- Update personalization algorithms
- Fix farm-related queries

### Phase 4: Testing & Validation (1 hour)

- Update test files
- Run full test suite
- Verify type safety
- Manual testing of recommendation features

## 📝 Notes

- **Current Status**: Services are stubbed with type-safe implementations
- **Production Impact**: None - these are optional advanced features
- **Core Features**: 100% functional (farms, products, orders, auth)
- **Recommendation**: Fix during Phase 2 development sprint

## 🔗 Related Files

- `src/lib/utils/interaction.utils.ts` - Helper utilities (✅ Created)
- `prisma/schema.prisma` - Source of truth for models
- `.github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md` - DB patterns

## 💡 Quick Wins

If you need recommendations working quickly:

1. **Use simple recommendations first**:
   - Trending products (by view count)
   - Recently added products
   - Products from same farm
   - Seasonal products

2. **Implement full ML later**:
   - Collaborative filtering
   - Personalization
   - Complex scoring algorithms

## 📞 Contact

For questions or assistance:

- Review divine instructions in `.github/instructions/`
- Check Prisma schema documentation
- Refer to this document for detailed fix strategy

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Ready for Implementation
