# 🎯 Prisma Schema Quick Reference Card

**Last Updated**: November 15, 2025
**Version**: 2.0 - Post Schema Alignment
**Purpose**: Quick lookup for correct field names, relations, and enums

---

## 📦 Order Model

### ✅ Correct Field Names
```typescript
order.id                    // string (cuid)
order.orderNumber           // string (unique)
order.customerId            // string
order.farmId                // string
order.status                // OrderStatus enum
order.paymentStatus         // PaymentStatus enum
order.subtotal              // Decimal ✓ NOT totalPrice!
order.deliveryFee           // Decimal
order.platformFee           // Decimal
order.tax                   // Decimal
order.discount              // Decimal
order.total                 // Decimal ✓ NOT totalPrice!
order.farmerAmount          // Decimal
order.fulfillmentMethod     // FulfillmentMethod enum
order.createdAt             // DateTime
order.updatedAt             // DateTime
```

### ✅ Correct Relations
```typescript
// In queries/includes:
include: {
  customer: true,           // ✓ User relation
  farm: true,               // ✓ Farm relation
  items: true,              // ✓ NOT orderItems!
  Payment: true,            // ✓ Capital P! NOT payment!
  deliveryAddress: true,    // ✓ UserAddress relation
  refunds: true,            // ✓ Refund[] array
  reviews: true             // ✓ Review[] array
}
```

### ❌ Common Mistakes
```typescript
order.totalPrice     // ✗ WRONG - use order.total
order.orderItems     // ✗ WRONG - use order.items
order.payment        // ✗ WRONG - use order.Payment (capital P)
order.user           // ✗ WRONG - use order.customer
```

---

## 💳 Payment Model

### ✅ Correct Field Names
```typescript
payment.id                      // string (cuid)
payment.orderId                 // string (unique)
payment.amount                  // Decimal
payment.currency                // string
payment.status                  // PaymentStatus enum
payment.paymentMethod           // string
payment.stripePaymentIntentId   // string | null
payment.paidAt                  // DateTime | null
payment.failureReason           // string | null
payment.receiptUrl              // string | null
payment.createdAt               // DateTime
payment.updatedAt               // DateTime
```

### ⚠️ Fields That DON'T Exist
```typescript
payment.refundAmount    // ✗ Use Refund model instead
payment.refundedAt      // ✗ Use Refund model instead
payment.metadata        // ✗ Not in Payment model
```

### ✅ Correct Relations
```typescript
include: {
  order: true    // ✓ Order relation
}
```

---

## 🔄 Refund Model (Separate from Payment!)

### ✅ Correct Field Names
```typescript
refund.id              // string (cuid)
refund.orderId         // string
refund.amount          // Decimal
refund.reason          // string
refund.notes           // string | null
refund.stripeRefundId  // string | null
refund.status          // string
refund.processedAt     // DateTime | null
refund.createdAt       // DateTime
```

### ✅ Usage Pattern
```typescript
// Create refund record
await database.refund.create({
  data: {
    orderId: order.id,
    amount: refundAmount,
    reason: "Customer request",
    stripeRefundId: stripeRefund.id,
    status: "COMPLETED",
    processedAt: new Date()
  }
});

// Calculate total refunded
const totalRefunded = await database.refund.aggregate({
  where: { orderId: order.id },
  _sum: { amount: true }
});

// Update payment status based on refunds
const isFullRefund = totalRefunded._sum.amount >= order.total;
await database.payment.update({
  where: { orderId: order.id },
  data: {
    status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED"
  }
});
```

---

## 📝 OrderItem Model

### ✅ Correct Field Names
```typescript
orderItem.id              // string (cuid)
orderItem.orderId         // string
orderItem.productId       // string
orderItem.productName     // string
orderItem.quantity        // Decimal ✓ NOT number!
orderItem.unit            // string
orderItem.unitPrice       // Decimal ✓ NOT price!
orderItem.subtotal        // Decimal
orderItem.productSnapshot // Json | null
```

### ❌ Common Mistakes
```typescript
orderItem.price    // ✗ WRONG - use orderItem.unitPrice
orderItem.qty      // ✗ WRONG - use orderItem.quantity
orderItem.total    // ✗ WRONG - use orderItem.subtotal
```

### ✅ Correct Relations
```typescript
include: {
  order: true,     // ✓ Order relation
  product: true    // ✓ Product relation
}
```

---

## ⭐ Review Model

### ✅ Correct Field Names
```typescript
review.id                 // string (cuid)
review.farmId             // string
review.productId          // string | null
review.customerId         // string ✓ NOT userId!
review.orderId            // string | null
review.rating             // number (1-5)
review.reviewText         // string | null
review.status             // ReviewStatus enum
review.flaggedReason      // string | null ✓ NOT moderationReason!
review.flaggedAt          // DateTime | null
review.moderatedBy        // string | null
review.moderatedAt        // DateTime | null
review.createdAt          // DateTime
review.updatedAt          // DateTime
```

### ❌ Fields That DON'T Exist
```typescript
review.userId             // ✗ WRONG - use review.customerId
review.moderationReason   // ✗ WRONG - use review.flaggedReason
review.rejectedReason     // ✗ WRONG - use review.flaggedReason
```

### ✅ Correct Relations
```typescript
include: {
  customer: true,  // ✓ User relation (NOT user!)
  farm: true,      // ✓ Farm relation
  product: true,   // ✓ Product relation
  order: true      // ✓ Order relation
}
```

---

## 👮 AdminAction Model

### ✅ Correct Field Names
```typescript
adminAction.id          // string (cuid)
adminAction.type        // AdminActionType enum ✓ NOT actionType!
adminAction.adminId     // string
adminAction.targetId    // string | null
adminAction.targetType  // string | null
adminAction.description // string ✓ REQUIRED!
adminAction.metadata    // Json | null ✓ NOT details!
adminAction.ipAddress   // string | null
adminAction.userAgent   // string | null
adminAction.createdAt   // DateTime
```

### ❌ Common Mistakes
```typescript
adminAction.actionType  // ✗ WRONG - use adminAction.type
adminAction.details     // ✗ WRONG - use adminAction.metadata
adminAction.reason      // ✗ WRONG - use adminAction.description
```

### ✅ Usage Pattern
```typescript
await database.adminAction.create({
  data: {
    adminId: session.user.id,
    type: "USER_SUSPENDED",        // ✓ Use 'type' not 'actionType'
    targetType: "USER",
    targetId: userId,
    description: "User violated terms", // ✓ REQUIRED field
    metadata: {                     // ✓ Use 'metadata' not 'details'
      reason: "Spam content",
      duration: "30 days"
    }
  }
});
```

---

## 📊 Enums Reference

### OrderStatus
```typescript
enum OrderStatus {
  PENDING    // ✓ Initial state
  CONFIRMED  // ✓ Order confirmed
  PREPARING  // ✓ Being prepared (NOT "PROCESSING"!)
  READY      // ✓ Ready for pickup/delivery
  FULFILLED  // ✓ Picked up or delivered
  COMPLETED  // ✓ Completed (NOT "DELIVERED"!)
  CANCELLED  // ✓ Cancelled
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING              // ✓ Awaiting payment
  PROCESSING           // ✓ Processing payment
  PAID                 // ✓ Successfully paid
  FAILED               // ✓ Payment failed
  REFUNDED             // ✓ Fully refunded
  PARTIALLY_REFUNDED   // ✓ Partially refunded
}
```

### ReviewStatus
```typescript
enum ReviewStatus {
  PENDING   // ✓ Awaiting moderation
  APPROVED  // ✓ Approved by moderator
  FLAGGED   // ✓ Flagged for review (NOT "REJECTED"!)
  REMOVED   // ✓ Removed from platform
}
```

### AdminActionType
```typescript
enum AdminActionType {
  USER_APPROVED
  USER_SUSPENDED
  USER_DELETED
  USER_REACTIVATED
  USER_ACTIVATED
  USER_PROMOTED_ADMIN
  USER_DEMOTED_ADMIN
  USER_PASSWORD_RESET
  FARM_VERIFIED
  FARM_REJECTED
  FARM_SUSPENDED
  ORDER_REFUNDED
  PRODUCT_REMOVED
  SETTING_CHANGED
  ANNOUNCEMENT_CREATED
}
```

### UserStatus
```typescript
enum UserStatus {
  ACTIVE     // ✓ Active user
  SUSPENDED  // ✓ Suspended (NOT "INACTIVE"!)
  DELETED    // ✓ Deleted account
}
```

---

## 🔗 Relation Name Gotchas

### Capital vs Lowercase Matters!

```typescript
// Order model has:
model Order {
  Payment Payment?  // ✓ Relation name is "Payment" (capital P)
}

// Must use in queries:
include: { Payment: true }  // ✓ CORRECT
include: { payment: true }  // ✗ TypeScript error!
```

### Other Important Relations

```typescript
// Order relations (note the names):
order.customer       // ✓ User (not 'user')
order.items          // ✓ OrderItem[] (not 'orderItems')
order.Payment        // ✓ Payment (capital P, not 'payment')
order.farm           // ✓ Farm
order.deliveryAddress // ✓ UserAddress

// Review relations:
review.customer      // ✓ User (not 'user')
review.farm          // ✓ Farm
review.product       // ✓ Product
review.order         // ✓ Order

// Product relations:
product.farm         // ✓ Farm
product.orderItems   // ✓ OrderItem[] (here it IS orderItems!)
product.reviews      // ✓ Review[]
```

---

## 💡 Common Patterns

### Pattern 1: Fetch Order with Relations
```typescript
const order = await database.order.findUnique({
  where: { id: orderId },
  include: {
    customer: {
      select: {
        id: true,
        email: true,
        name: true
      }
    },
    farm: true,
    items: {
      include: {
        product: true
      }
    },
    Payment: true,          // Capital P!
    deliveryAddress: true,
    refunds: true
  }
});

// Access fields:
order.total             // ✓ NOT totalPrice
order.items             // ✓ NOT orderItems
order.Payment           // ✓ Capital P
order.customer.email    // ✓ NOT order.user
```

### Pattern 2: Handle Decimal Types
```typescript
// Convert Decimal to number for calculations
const totalAmount = order.total.toNumber();
const subtotalAmount = parseFloat(order.subtotal.toString());

// For comparisons
const refundedAmount = totalRefunded._sum.amount
  ? (typeof totalRefunded._sum.amount === 'number'
      ? totalRefunded._sum.amount
      : totalRefunded._sum.amount.toNumber())
  : 0;
```

### Pattern 3: Create with Relations
```typescript
await database.order.create({
  data: {
    orderNumber: generateOrderNumber(),
    customerId: userId,        // ✓ NOT userId
    farmId: farmId,
    status: "PENDING",
    paymentStatus: "PENDING",
    subtotal: 100.00,
    total: 105.00,            // ✓ NOT totalPrice
    farmerAmount: 95.00,
    platformFee: 5.00,
    fulfillmentMethod: "DELIVERY",
    items: {                  // ✓ NOT orderItems
      create: [
        {
          productId: product.id,
          productName: product.name,
          quantity: 2,
          unit: "kg",
          unitPrice: 50.00,    // ✓ NOT price
          subtotal: 100.00
        }
      ]
    }
  }
});
```

### Pattern 4: Separate Customer Fetch for Performance
```typescript
// Instead of nested include (can be slow):
const orders = await database.order.findMany({
  select: {
    id: true,
    total: true,
    customerId: true  // Just the ID
  }
});

// Fetch customers separately:
const customerIds = [...new Set(orders.map(o => o.customerId))];
const customers = await database.user.findMany({
  where: { id: { in: customerIds } },
  select: { id: true, email: true, name: true }
});

// Create lookup map:
const customerMap = new Map(customers.map(c => [c.id, c]));

// Combine:
const ordersWithCustomers = orders.map(order => ({
  ...order,
  customer: customerMap.get(order.customerId)
}));
```

---

## 🚨 Critical Reminders

### 1. Always Check Prisma Schema First!
Before writing any query, open `prisma/schema.prisma` and verify:
- Exact field names (case-sensitive)
- Relation names (can differ from model names)
- Enum values
- Required vs optional fields

### 2. Run TypeScript Check Frequently
```bash
npx tsc --noEmit
```
Catches schema mismatches immediately!

### 3. Use Prisma Studio for Exploration
```bash
npx prisma studio
```
Visual interface to explore your schema and data.

### 4. Generate Fresh Prisma Client After Schema Changes
```bash
npx prisma generate
```
Updates TypeScript types to match schema.

---

## 🔍 Quick Search Patterns

### Find All Uses of a Field
```bash
# In PowerShell/CMD:
grep -r "totalPrice" src/

# Should return 0 results - we use 'total' now!
```

### Find Incorrect Relation Names
```bash
grep -r "order\.payment\b" src/
# Should be order.Payment (capital P)

grep -r "order\.orderItems" src/
# Should be order.items

grep -r "order\.user\b" src/
# Should be order.customer
```

---

## 📚 Additional Resources

- **Prisma Schema**: `prisma/schema.prisma`
- **Schema Alignment Doc**: `docs/CONTINUOUS_SESSION_05_SCHEMA_ALIGNMENT.md`
- **API Reference**: `docs/API_REFERENCE_FINAL.md`
- **Prisma Docs**: https://www.prisma.io/docs

---

**Last Verified**: November 15, 2025
**Status**: ✅ All field names and relations verified against actual schema
**TypeScript Compliance**: ✅ 100% (zero type errors)

---

_Keep this reference handy while coding! 🎯_
