# 🔧 Zod 3.x Migration Notes

**Date**: January 2025
**Zod Version**: 3.25.76 (upgraded from 4.2.1 - which was incorrect)
**Status**: IN PROGRESS

## 🎯 Overview

Zod 3.25+ has stricter type inference, especially around `.default()`, `.optional()`, and `.transform()` chains. This causes TypeScript errors when the output type doesn't match expected types.

## 🚨 Breaking Changes in Zod 3.25+

### 1. `.default()` with `.optional()` produces optional output

```typescript
// ❌ OLD (Zod 3.22 and earlier)
z.string().optional().default("value"); // output: string

// ✅ NEW (Zod 3.25+)
z.string().optional().default("value"); // output: string | undefined
```

### 2. `.transform()` with `.optional()` loses type inference

```typescript
// ❌ BROKEN
z.string()
  .optional()
  .transform((val) => (val ? parseInt(val) : 10));
// output: number | undefined (even with fallback!)

// ✅ FIXED - Use z.coerce for query params
z.coerce.number().int().positive().default(10).catch(10);
// output: number
```

### 3. `.preprocess()` returns `unknown`

```typescript
// ❌ BROKEN
z.preprocess((val) => (val ? val : "default"), z.string());
// output: unknown

// ✅ FIXED - Use .default() or z.coerce
z.string().default("default");
// output: string
```

## 📝 Required Changes

### Query Parameter Schemas

**Before:**

```typescript
const ListFarmsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 1;
      const parsed = parseInt(val);
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 20;
      const parsed = parseInt(val);
      return isNaN(parsed) || parsed < 1 ? 20 : Math.min(parsed, 100);
    }),
});
```

**After:**

```typescript
const ListFarmsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
});
```

**Explanation:**

- `z.coerce.number()` - Coerces string to number automatically
- `.int()` - Ensures integer
- `.min(1)` - Validation
- `.default(1)` - Provides default when undefined
- `.catch(1)` - Provides fallback when parsing fails

### String Fields with Defaults

**Before:**

```typescript
const CreatePaymentIntentSchema = z.object({
  currency: z.string().min(3).max(3).default("usd"),
  // Type: string | undefined ❌
});
```

**After - Option 1 (Make Optional Explicit):**

```typescript
const CreatePaymentIntentSchema = z.object({
  currency: z.string().min(3).max(3).optional(),
});

// Then handle in code:
const { currency = "usd" } = validated;
```

**After - Option 2 (Use Union with Literal):**

```typescript
const CreatePaymentIntentSchema = z.object({
  currency: z
    .union([z.string().min(3).max(3), z.literal(undefined)])
    .transform((val) => val ?? "usd"),
});
```

**After - Option 3 (Separate Input/Output Types):**

```typescript
const CreatePaymentIntentSchema = z
  .object({
    currency: z.string().min(3).max(3),
  })
  .partial({ currency: true })
  .transform((data) => ({
    ...data,
    currency: data.currency ?? "usd",
  }));
```

### Array Fields with Defaults

**Before:**

```typescript
const SyncCartRequestSchema = z.object({
  localItems: z.array(CartItemInputSchema).default([]),
  // Type: CartItem[] | undefined ❌
});
```

**After - Option 1:**

```typescript
const SyncCartRequestSchema = z.object({
  localItems: z.array(CartItemInputSchema),
});

// Handle in code:
const { localItems = [] } = validated;
```

**After - Option 2:**

```typescript
const SyncCartRequestSchema = z
  .object({
    localItems: z.array(CartItemInputSchema).optional(),
  })
  .transform((data) => ({
    localItems: data.localItems ?? [],
  }));
```

## 🛠️ Files Requiring Updates

### ✅ COMPLETED

- None yet

### 🔴 IN PROGRESS

1. **src/app/api/cart/sync/route.ts**
   - Line 37: `localItems` array default
   - Issue: Array with default produces optional type

2. **src/lib/controllers/farm.controller.ts**
   - Lines 86-101: `ListFarmsQuerySchema` page/limit transforms
   - Lines 113-116: `SearchFarmsQuerySchema` limit transform
   - Lines 122-128: `NearbyFarmsQuerySchema` radius transform
   - Issue: Transform with optional loses type

3. **src/lib/services/payment.service.ts**
   - Line 38-42: `currency` default value
   - Issue: String default still produces optional type

4. **src/lib/services/shipping.service.ts**
   - Line 37: `country` default value
   - Issue: String default still produces optional type

## 🎯 Recommended Solution Strategy

### For Query Parameters (Always from URL)

Use `z.coerce` with `.catch()` for safety:

```typescript
// Integer with default
z.coerce.number().int().min(1).default(1).catch(1);

// Float with default
z.coerce.number().positive().default(50).catch(50);

// String with default
z.coerce.string().min(1).default("value").catch("value");
```

### For Request Body Fields (JSON)

Use optional + code-level defaults:

```typescript
// Schema
const schema = z.object({
  field: z.string().optional(),
});

// Code
const validated = schema.parse(input);
const field = validated.field ?? "default";
```

### For Complex Transforms

Use `.transform()` at the end:

```typescript
z.object({
  field: z.string().optional(),
}).transform((data) => ({
  field: data.field ?? "default",
}));
```

## 📚 Reference Links

- [Zod v3.23 Release Notes](https://github.com/colinhacks/zod/releases/tag/v3.23.0)
- [Zod Default Behavior](https://zod.dev/docs/default)
- [Zod Coerce](https://zod.dev/docs/coerce)
- [Zod Transform](https://zod.dev/docs/transform)

## ✅ Testing Checklist

After fixes:

- [ ] `npm run type-check` passes
- [ ] All API routes accept query parameters correctly
- [ ] Default values are applied when fields are missing
- [ ] Validation errors still work properly
- [ ] All tests pass

## 🔄 Rollback Plan

If issues persist:

```bash
# Revert to working package.json
git checkout HEAD~1 package.json package-lock.json

# Reinstall
npm ci

# Or pin to older Zod version
npm install zod@3.22.4
```

## 💡 Future Improvements

1. Consider creating helper functions for common patterns:

```typescript
export const queryNumber = (min = 1, max?: number, defaultVal = 1) =>
  z.coerce
    .number()
    .int()
    .min(min)
    .pipe(max ? z.number().max(max) : z.number())
    .default(defaultVal)
    .catch(defaultVal);

export const queryString = (defaultVal = "") =>
  z.coerce.string().default(defaultVal).catch(defaultVal);

// Usage
const schema = z.object({
  page: queryNumber(1, undefined, 1),
  limit: queryNumber(1, 100, 20),
  search: queryString(""),
});
```

2. Create custom Zod extensions for API schemas

3. Add runtime validation tests for default values

---

**Status**: Type errors remain - need to apply one of the solution strategies above
**Next Step**: Choose solution strategy and systematically apply to all affected files
