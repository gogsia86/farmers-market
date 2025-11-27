# 🗄️ Prisma Schema Reference
## Quick Reference for TypeScript Error Fixes

**Generated**: 2025  
**Prisma Version**: 6.19.0  
**Purpose**: Fast lookup for correct field names and relations

---

## 📊 Key Models

### Order Model

**Fields**:
```typescript
{
  id: string
  orderNumber: string
  customerId: string
  farmId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: Decimal
  deliveryFee: Decimal
  platformFee: Decimal
  tax: Decimal
  discount: Decimal
  total: Decimal              // ✅ Use 'total' not 'totalAmount'
  farmerAmount: Decimal
  fulfillmentMethod: FulfillmentMethod
  deliveryAddressId: string?
  scheduledDate: DateTime?
  scheduledTimeSlot: string?
  fulfillmentNotes: string?
  stripePaymentIntentId: string?
  stripeChargeId: string?
  stripeTransferId: string?
  paymentIntentId: string?
  paidAt: DateTime?
  trackingNumber: string?
  shippingService: string?
  shippingAddress: Json?
  deliverySlotId: string?
  specialInstructions: string?
  createdAt: DateTime
  updatedAt: DateTime
  confirmedAt: DateTime?
  fulfilledAt: DateTime?      // ✅ Use 'fulfilledAt' not 'fulfillment.date'
  completedAt: DateTime?
  cancelledAt: DateTime?
  cancelledBy: string?
  cancelReason: string?
}
```

**Relations** (must use `include`):
```typescript
{
  fulfillment: Fulfillment?       // ✅ Relation exists!
  messages: Message[]
  items: OrderItem[]              // ✅ Must include to access
  customer: User                  // ✅ Must include to access
  deliveryAddress: UserAddress?
  farm: Farm
  Payment: Payment?
  qualityIssues: QualityIssue[]
  refunds: Refund[]
  reviews: Review[]
}
```

**Common Include Pattern**:
```typescript
const order = await database.order.findUnique({
  where: { id },
  include: {
    items: true,           // For order.items
    customer: true,        // For order.customer
    fulfillment: true,     // For order.fulfillment
    Payment: true,         // For order.Payment
  }
});
```

---

### Product Model

**Fields**:
```typescript
{
  id: string
  farmId: string
  name: string
  slug: string
  description: string?
  category: ProductCategory        // ✅ Enum, not relation!
  status: ProductStatus
  price: Decimal
  compareAtPrice: Decimal?
  unit: string
  trackInventory: boolean
  quantityAvailable: Decimal?      // ✅ Use this, not 'stockQuantity'
  lowStockThreshold: Decimal?
  allowBackorder: boolean
  inStock: boolean
  organic: boolean
  seasonal: boolean
  featured: boolean
  seasonalStart: DateTime?
  seasonalEnd: DateTime?
  harvestDate: DateTime?
  storageInstructions: string?
  primaryPhotoUrl: string?
  photoUrls: Json?
  images: string[]
  hasVariants: boolean
  variants: Json?
  tags: Json?
  pricing: Json?
  inventory: Json?
  attributes: Json?
  scheduledPublishAt: DateTime?
  scheduledUnpublishAt: DateTime?
  publishedAt: DateTime?
  viewsCount: number
  cartAddsCount: number
  purchaseCount: number
  wishlistCount: number
  averageRating: Decimal?
  reviewCount: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relations**:
```typescript
{
  cartItems: CartItem[]
  harvestSchedules: HarvestSchedule[]
  Inventory: Inventory[]         // ✅ For stock info
  inventoryLogs: InventoryLog[]
  orderItems: OrderItem[]
  farm: Farm                     // ✅ Must include to access
  reviews: Review[]
  SeasonalCycle: SeasonalCycle[]
}
```

**Common Include Pattern**:
```typescript
const product = await database.product.findUnique({
  where: { id },
  include: {
    farm: true,              // For product.farm
    Inventory: true,         // For stock data
    reviews: true,
  }
});

// Access stock:
const stock = product.quantityAvailable ?? 0;
// OR from Inventory relation:
const stock = product.Inventory?.[0]?.quantity ?? 0;
```

---

### Farm Model

**Fields**:
```typescript
{
  id: string
  ownerId: string
  name: string
  slug: string
  description: string?
  story: string?
  email: string                    // ✅ Use 'email' not 'contactEmail'
  phone: string                    // ✅ Use 'phone' not 'contactPhone'
  website: string?
  status: FarmStatus
  verificationStatus: FarmVerificationStatus
  // ... many more fields
}
```

**Relations**:
```typescript
{
  certifications: Certification[]
  harvestSchedules: HarvestSchedule[]
  orders: Order[]
  owner: User
  payouts: Payout[]
  products: Product[]              // ✅ Must include to access
  seasonalCycles: SeasonalCycle[]
  teamMembers: FarmTeamMember[]
  // ... more relations
}
```

**Common Include Pattern**:
```typescript
const farm = await database.farm.findUnique({
  where: { id },
  include: {
    products: {
      where: { status: 'AVAILABLE' }
    },
    owner: true,
    certifications: true,
  }
});
```

---

### User Model

**Fields**:
```typescript
{
  id: string
  email: string
  password: string?
  firstName: string?
  lastName: string?
  name: string?
  phone: string?
  avatar: string?                  // ✅ Use 'avatar' not 'image'
  role: UserRole
  status: UserStatus
  // ... more fields
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relations**:
```typescript
{
  accounts: Account[]
  Address: Address[]
  farms: Farm[]
  orders: Order[]
  reviews: Review[]
  // ... more relations
}
```

---

### Payment Model

**Fields**:
```typescript
{
  id: string
  orderId: string
  status: PaymentStatus
  amount: Decimal
  currency: string
  stripePaymentIntentId: string?
  stripePaymentMethod: string?     // ✅ Check if this is 'method' field
  // ... more fields
}
```

**Relations**:
```typescript
{
  order: Order
}
```

---

### Payout Model

**Fields**:
```typescript
{
  id: string
  farmId: string                   // ✅ Links to Farm, not 'farmer'
  status: string
  amount: Decimal
  currency: string
  scheduledDate: DateTime
  paidDate: DateTime?              // ✅ Use 'paidDate' not 'paidAt'
  periodStart: DateTime
  periodEnd: DateTime
  orderCount: number
  stripePayoutId: string?
  failureReason: string?
  createdAt: DateTime
}
```

**Relations**:
```typescript
{
  farm: Farm                       // ✅ Use 'farm' not 'farmer'
  // Access farmer: payout.farm.owner
}
```

---

## 🎯 Enums Reference

### OrderStatus
```typescript
enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  FULFILLED
  COMPLETED      // ✅ Use this, not "DELIVERED"
  CANCELLED
}
```

**Invalid values to replace**:
- ❌ "DELIVERED" → ✅ "COMPLETED"
- ❌ "READY_FOR_PICKUP" → ✅ "READY"
- ❌ "IN_PROGRESS" → ✅ "PREPARING"

---

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING
  PROCESSING
  PAID           // ✅ Use this, not "COMPLETED" or "SUCCEEDED"
  FAILED
  REFUNDED
}
```

**Invalid values to replace**:
- ❌ "COMPLETED" → ✅ "PAID"
- ❌ "SUCCEEDED" → ✅ "PAID"

---

### FarmStatus
```typescript
enum FarmStatus {
  PENDING        // ✅ Use this, not "PENDING_VERIFICATION"
  ACTIVE
  SUSPENDED
  INACTIVE
}
```

**Invalid values to replace**:
- ❌ "PENDING_VERIFICATION" → ✅ "PENDING"
- ❌ "DRAFT" → ✅ "PENDING" (or check if there's a separate DRAFT status)

---

### ProductStatus
```typescript
enum ProductStatus {
  DRAFT
  AVAILABLE
  OUT_OF_STOCK
  DISCONTINUED
}
```

---

### ProductCategory
```typescript
enum ProductCategory {
  VEGETABLES
  FRUITS
  DAIRY
  MEAT
  EGGS
  HONEY
  BAKED_GOODS
  HERBS
  FLOWERS
  PRESERVES
  BEVERAGES
  CRAFTS
  OTHER
}
```

**Note**: Category is an ENUM, not a relation. No `.name` property!
```typescript
// ❌ WRONG
product.category.name

// ✅ CORRECT
product.category  // Already the string value "VEGETABLES", "FRUITS", etc.
```

---

## 🔍 Common Field Name Mappings

| ❌ Common Mistake | ✅ Correct Field | Model |
|------------------|------------------|-------|
| `totalAmount` | `total` | Order |
| `image` | `avatar` | User |
| `contactEmail` | `email` | Farm |
| `contactPhone` | `phone` | Farm |
| `stockQuantity` | `quantityAvailable` | Product |
| `paidAt` | `paidDate` | Payout |
| `method` | `stripePaymentMethod` | Payment |
| `category.name` | `category` | Product (it's an enum!) |

---

## 🔗 Common Include Patterns

### Order with all details:
```typescript
const order = await database.order.findUnique({
  where: { id },
  include: {
    items: {
      include: {
        product: true
      }
    },
    customer: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      }
    },
    farm: true,
    Payment: true,
    fulfillment: true,
    reviews: true,
  }
});

// Calculate total:
const totalAmount = order.total;  // Already on model!
// Or from items:
const calculatedTotal = order.items.reduce(
  (sum, item) => sum + (item.price * item.quantity), 
  0
);
```

### Product with farm and inventory:
```typescript
const product = await database.product.findUnique({
  where: { id },
  include: {
    farm: {
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      }
    },
    Inventory: true,
    reviews: {
      take: 10,
      orderBy: { createdAt: 'desc' }
    }
  }
});

// Access stock:
const stock = product.quantityAvailable ?? 0;
```

### Farm with products:
```typescript
const farm = await database.farm.findUnique({
  where: { id },
  include: {
    products: {
      where: { 
        status: 'AVAILABLE',
        inStock: true 
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    },
    owner: {
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      }
    },
    certifications: true,
  }
});
```

---

## 💡 Quick Tips

### 1. Always check relations before accessing:
```typescript
// ❌ Will error if not included
const items = order.items;

// ✅ Safe access with include
const order = await database.order.findUnique({
  where: { id },
  include: { items: true }
});
const items = order.items;  // Now safe!
```

### 2. Enums don't have properties:
```typescript
// ❌ WRONG - category IS the enum value
const categoryName = product.category.name;

// ✅ CORRECT
const categoryName = product.category;  // "VEGETABLES"
```

### 3. Use proper field names:
```typescript
// ❌ WRONG
const contact = farm.contactEmail;

// ✅ CORRECT
const contact = farm.email;
```

### 4. Calculate totals when needed:
```typescript
// Order already has 'total' field
const orderTotal = order.total;

// Or calculate from items:
const calculatedTotal = order.items.reduce(
  (sum, item) => sum + (item.price * item.quantity),
  0
);
```

---

**Reference Version**: 1.0  
**Last Updated**: Phase 6 Error Fixing  
**Prisma Schema**: `prisma/schema.prisma`

_"Check the schema first, save debugging time later."_ 🌾⚡