# 🚨 Payment Integration Schema Mismatch Report

**Status**: TypeScript errors detected - Schema alignment needed
**Date**: Current Session
**Phase**: Priority 4 - Payment Integration

---

## ⚠️ Issues Detected

### **TypeScript Compilation Errors**: 16 total

**Summary**: The payment integration APIs were written assuming a different database schema than what actually exists in the project.

---

## 🔍 Schema Mismatches Identified

### **1. Products Table**

**Expected** (in code):

```prisma
model products {
  quantity    Int       // Stock quantity
  farmId      String    // Vendor farm reference
  isActive    Boolean   // Active status flag
  farms       farms     // Relation to farms table
}
```

**Actual** (in schema):

```prisma
model products {
  status      ProductStatus // ACTIVE/INACTIVE enum instead
  vendorId    String        // Direct vendor reference
  vendors     vendors       // Relation to vendors table, not farms
  // NO quantity field
  // NO farmId field
  // NO isActive field
  // NO farms relation
}
```

**Impact**: Cannot validate stock, cannot group by farm

---

### **2. Orders Table**

**Expected** (in code):

```prisma
model orders {
  customerId      String
  vendorId        String
  totalAmount     Decimal
  customerName    String
  customerEmail   String
  customerPhone   String
  paymentMethod   PaymentMethod enum
}
```

**Actual** (in schema):

```prisma
model orders {
  userId          String        // NOT customerId
  // NO vendorId field
  subtotal        Decimal?
  tax             Decimal?
  total           Decimal       // NOT totalAmount
  paymentMethod   String?       // NOT enum, nullable String
  // NO customerName field
  // NO customerEmail field
  // NO customerPhone field
}
```

**Impact**: Cannot create orders with vendor assignment, no customer contact fields

---

### **3. Order Items Table**

**Expected** (in code):

```prisma
model order_items {
  productName String
  subtotal    Decimal
}
```

**Actual** (in schema):

```prisma
model order_items {
  id          String    @id
  orderId     String
  productId   String
  quantity    Int
  price       Decimal
  createdAt   DateTime
  updatedAt   DateTime
  // NO productName field
  // NO subtotal field
}
```

**Impact**: Cannot store product name snapshot, no subtotal tracking

---

### **4. Payments Table**

**Expected** (in code):

```prisma
status PaymentStatus // enum like PENDING, SUCCEEDED
```

**Actual** (in schema):

```prisma
enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  CANCELED
  REFUNDED
}
```

**Status**: ✅ Actually correct, but TypeScript error suggests type issue

---

## 📋 Files Affected

1. `src/app/api/checkout/create-order/route.ts` - 13 errors
2. `src/app/api/checkout/confirm-payment/route.ts` - 3 errors
3. `src/app/checkout/success/page.tsx` - 2 errors (null checks)

---

## 🛠️ Resolution Options

### **Option A: Modify Database Schema** (Recommended for full features)

**Add to schema**:

```prisma
model products {
  // ... existing fields
  stockQuantity Int @default(0) // Track inventory
}

model orders {
  // ... existing fields
  vendorId      String?  // Optional vendor assignment
  customerName  String?  // Customer contact info
  customerEmail String?
  customerPhone String?
}

model order_items {
  // ... existing fields
  productName String   // Snapshot of product name
  subtotal    Decimal  // Line item subtotal
}
```

**Then**: Run `npx prisma migrate dev --name add-payment-fields`

---

### **Option B: Simplify API to Match Current Schema** (Faster, works now)

**Changes needed**:

1. Remove stock validation (no quantity field)
2. Use `userId` instead of `customerId`
3. Store customer info in notes/metadata
4. Calculate subtotal in app, don't store in order_items
5. Don't group by vendor (no vendorId)
6. Single order per checkout

**Pros**: Works immediately with existing schema
**Cons**: Limited features (no inventory, no multi-vendor)

---

### **Option C: Use Inventory System** (If it exists)

Check if `inventory_items` table can track stock:

```prisma
model inventory_items {
  id        String   @id
  productId String   @unique
  quantity  Int
  // ... other fields
}
```

If this table exists and tracks quantity, we can:

- Query `inventory_items` for stock validation
- Update `inventory_items` after purchase
- Avoid modifying `products` table

---

## 🎯 Recommended Action Plan

### **Immediate (Next 30 minutes)**

1. **Choose Option B** - Simplify APIs to match schema
2. Fix the 16 TypeScript errors
3. Get payment flow working with current schema
4. Document limitations

### **Short-term (Next session)**

1. Evaluate if `inventory_items` table is being used
2. If yes, integrate inventory tracking
3. If no, propose schema migration
4. Add customer contact fields to orders

### **Long-term (Future sprint)**

1. Multi-vendor order support (add `vendorId`)
2. Product name snapshots in order_items
3. Comprehensive inventory management
4. Vendor-specific order views

---

## 📝 Quick Fix Code Changes

### **For `create-order/route.ts`**

```typescript
// Remove stock validation section (lines 67-82)
// Change customerId → userId
// Remove vendor grouping logic
// Remove farms/farmId references
// Use simple single-order creation
// Store customer info in metadata
```

### **For `confirm-payment/route.ts`**

```typescript
// Change customerId → userId (line 74)
// Fix PaymentStatus type (line 95)
// Remove quantity decrement (no quantity field)
```

### **For `checkout/success/page.tsx`**

```typescript
// Add null checks for searchParams
const order = searchParams?.get("order");
const payment = searchParams?.get("payment");
```

---

## 🚀 Next Steps

**Do you want me to**:

A. **Fix TypeScript errors** with Option B (simplified APIs matching current schema)?
B. **Create schema migration** with Option A (add missing fields)?
C. **Investigate inventory_items** table first with Option C?

**Recommendation**: Start with **Option A** (fix errors quickly), then evaluate **Option C** (inventory) in next session.

---

**Status**: Awaiting direction on schema alignment approach 🎯
