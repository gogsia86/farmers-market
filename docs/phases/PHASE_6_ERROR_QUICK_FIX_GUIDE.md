# 🚀 Phase 6 - Quick Fix Guide
## Fast Reference for Common TypeScript Errors

**Version**: 1.0  
**Status**: READY TO USE  
**Purpose**: Copy-paste solutions for most common errors

---

## 🎯 Quick Navigation

- [Order Model Fixes](#order-model-fixes)
- [Product Model Fixes](#product-model-fixes)
- [Farm Model Fixes](#farm-model-fixes)
- [User Model Fixes](#user-model-fixes)
- [Payment/Payout Fixes](#paymentpayout-fixes)
- [Monitoring Type Fixes](#monitoring-type-fixes)
- [Enum Fixes](#enum-fixes)
- [Common Patterns](#common-patterns)

---

## Order Model Fixes

### ❌ Error: `Property 'totalAmount' does not exist`

```typescript
// BEFORE (WRONG)
const total = order.totalAmount;

// AFTER (CORRECT)
// Method 1: Include items and calculate
const order = await database.order.findUnique({
  where: { id },
  include: {
    items: true,
  }
});

const totalAmount = order.items.reduce(
  (sum, item) => sum + (item.price * item.quantity), 
  0
);

// Method 2: Use _sum aggregation
const result = await database.orderItem.aggregate({
  where: { orderId: order.id },
  _sum: {
    total: true  // Assuming there's a 'total' field
  }
});
const totalAmount = result._sum.total ?? 0;
```

---

### ❌ Error: `Property 'items' does not exist`

```typescript
// BEFORE (WRONG)
const items = order.items;

// AFTER (CORRECT)
const order = await database.order.findUnique({
  where: { id },
  include: {
    items: {
      include: {
        product: true,  // Include product details if needed
      }
    }
  }
});

// Now you can access:
const items = order.items;
```

---

### ❌ Error: `Property 'customer' does not exist`

```typescript
// BEFORE (WRONG)
const customerName = order.customer.name;

// AFTER (CORRECT)
const order = await database.order.findUnique({
  where: { id },
  include: {
    customer: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      }
    }
  }
});

// Now you can access:
const customerName = order.customer.name;
```

---

### ❌ Error: `Property 'fulfillment' does not exist`

```typescript
// BEFORE (WRONG)
const fulfillmentDate = order.fulfillment.scheduledDate;

// AFTER (CORRECT)
// Option 1: Use existing field
const fulfillmentDate = order.fulfilledAt;

// Option 2: If you need fulfillment details, check schema for relation
const order = await database.order.findUnique({
  where: { id },
  include: {
    // Check schema for actual fulfillment relation name
  }
});
```

---

### ❌ Error: `Property 'payments' does not exist`

```typescript
// BEFORE (WRONG)
const payments = order.payments;

// AFTER (CORRECT)
const order = await database.order.findUnique({
  where: { id },
  include: {
    payments: true,  // Add to include
  }
});

// Or query separately:
const payments = await database.payment.findMany({
  where: { orderId: order.id }
});
```

---

## Product Model Fixes

### ❌ Error: `Property 'stockQuantity' does not exist`

```typescript
// BEFORE (WRONG)
const stock = product.stockQuantity;

// AFTER (CORRECT)
// Option 1: Include inventory relation
const product = await database.product.findUnique({
  where: { id },
  include: {
    inventory: true,
  }
});
const stock = product.inventory?.quantity ?? 0;

// Option 2: Use direct field if it exists
// Check schema - might be 'availableQuantity' or similar
const stock = product.availableQuantity ?? 0;
```

---

### ❌ Error: `Property 'farm' does not exist`

```typescript
// BEFORE (WRONG)
const farmName = product.farm.name;

// AFTER (CORRECT)
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
    }
  }
});

const farmName = product.farm.name;
```

---

### ❌ Error: `Property 'name' does not exist on type 'ProductCategory'`

```typescript
// BEFORE (WRONG)
const categoryName = product.category.name;

// AFTER (CORRECT)
// category IS the enum value itself
const categoryName = product.category;  // "VEGETABLES", "FRUITS", etc.

// If you want display name:
const categoryDisplayName = {
  VEGETABLES: "Vegetables",
  FRUITS: "Fruits",
  DAIRY: "Dairy Products",
  MEAT: "Meat & Poultry",
  EGGS: "Eggs",
  HONEY: "Honey & Preserves",
  BAKED_GOODS: "Baked Goods",
  OTHER: "Other"
}[product.category];
```

---

### ❌ Error: `Property 'category' does not exist in ProductInclude`

```typescript
// BEFORE (WRONG)
const products = await database.product.findMany({
  include: {
    category: true,  // category is NOT a relation!
  }
});

// AFTER (CORRECT)
const products = await database.product.findMany({
  // No need to include category - it's already on the model
  include: {
    farm: true,      // Include relations only
    inventory: true,
  }
});

// Access category directly:
const category = product.category;
```

---

## Farm Model Fixes

### ❌ Error: `Property 'products' does not exist`

```typescript
// BEFORE (WRONG)
const productCount = farm.products.length;

// AFTER (CORRECT)
const farm = await database.farm.findUnique({
  where: { id },
  include: {
    products: {
      where: { status: 'AVAILABLE' },  // Optional filter
      select: {
        id: true,
        name: true,
        status: true,
      }
    }
  }
});

const productCount = farm.products?.length ?? 0;
```

---

### ❌ Error: `Property 'contactEmail' does not exist`

```typescript
// BEFORE (WRONG)
const contact = farm.contactEmail;

// AFTER (CORRECT)
const contact = farm.email;  // Use 'email' field from schema
```

---

### ❌ Error: `Property 'contactPhone' does not exist`

```typescript
// BEFORE (WRONG)
const phone = farm.contactPhone;

// AFTER (CORRECT)
const phone = farm.phone;  // Use 'phone' field from schema
```

---

## User Model Fixes

### ❌ Error: `Property 'image' does not exist`

```typescript
// BEFORE (WRONG)
const avatar = user.image;

// AFTER (CORRECT)
const avatar = user.avatar;  // Use 'avatar' field from schema

// In queries:
const user = await database.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    avatar: true,  // NOT 'image'
  }
});
```

---

## Payment/Payout Fixes

### ❌ Error: `Property 'method' does not exist on Payment`

```typescript
// BEFORE (WRONG)
const method = payment.method;

// AFTER (CORRECT)
// Check schema for actual field name - might be 'paymentMethod' or similar
const method = payment.paymentMethod;  // Or whatever field exists

// If it doesn't exist, you might need to check Stripe metadata
const method = payment.stripePaymentMethod;
```

---

### ❌ Error: `Property 'farmer' does not exist on Payout`

```typescript
// BEFORE (WRONG)
const farmerName = payout.farmer.name;

// AFTER (CORRECT)
// Relation is likely 'farm' not 'farmer'
const payout = await database.payout.findUnique({
  where: { id },
  include: {
    farm: {
      include: {
        owner: true,  // Get farmer through farm
      }
    }
  }
});

const farmerName = payout.farm.owner.name;
```

---

### ❌ Error: `Property 'paidAt' does not exist`

```typescript
// BEFORE (WRONG)
const date = payout.paidAt;

// AFTER (CORRECT)
const date = payout.paidDate;  // Use 'paidDate' field from schema
```

---

## Monitoring Type Fixes

### ❌ Error: `Property 'passedSteps' does not exist on array`

```typescript
// BEFORE (WRONG)
const passed = result.steps.passedSteps;
const failed = result.steps.failedSteps;
const total = result.steps.totalSteps;

// AFTER (CORRECT)
const steps = result.steps;  // This is an array
const passedSteps = steps.filter(s => s.status === 'passed').length;
const failedSteps = steps.filter(s => s.status === 'failed').length;
const totalSteps = steps.length;
```

---

### ❌ Error: `Property 'workflow' does not exist`

```typescript
// BEFORE (WRONG)
const workflowName = result.workflow.name;

// AFTER (CORRECT)
const workflowId = result.workflowId;

// If you need workflow details, include or query separately:
const result = await database.workflowExecution.findUnique({
  where: { id },
  include: {
    workflow: true,  // If there's a workflow relation
  }
});
```

---

### ❌ Error: `Property 'totalWorkflows' does not exist on MonitoringReport`

```typescript
// BEFORE (WRONG)
const total = report.totalWorkflows;
const passed = report.passedWorkflows;
const failed = report.failedWorkflows;

// AFTER (CORRECT)
// Calculate from results array
const results = report.results;  // Assuming report has results
const totalWorkflows = results.length;
const passedWorkflows = results.filter(r => r.status === 'passed').length;
const failedWorkflows = results.filter(r => r.status === 'failed').length;
```

---

### ❌ Error: `Property 'databaseHealthy' does not exist`

```typescript
// BEFORE (WRONG)
const dbHealth = healthCheck.databaseHealthy;
const apiHealth = healthCheck.apiHealthy;

// AFTER (CORRECT)
// Use general 'healthy' field
const isHealthy = healthCheck.healthy;

// If you need specific checks, access from metadata
const metadata = healthCheck.metadata as {
  database?: { healthy: boolean };
  api?: { healthy: boolean };
};
const dbHealth = metadata.database?.healthy ?? false;
const apiHealth = metadata.api?.healthy ?? false;
```

---

### ❌ Error: `Type 'AlertSeverity | undefined' not assignable`

```typescript
// BEFORE (WRONG)
const severity: AlertSeverity = getSeverity();  // might return undefined

// AFTER (CORRECT)
const severity: AlertSeverity = getSeverity() ?? 'INFO';

// Or use proper type guard:
const severity = getSeverity();
if (!severity) {
  throw new Error('Severity is required');
}
// Now severity is AlertSeverity, not undefined
```

---

### ❌ Error: `Export declaration conflicts`

```typescript
// BEFORE (WRONG)
export interface NotificationResult { ... }
export type NotificationResult = ...;  // CONFLICT!

// AFTER (CORRECT - Choose ONE)
// Option 1: Use interface only
export interface NotificationResult { ... }

// Option 2: Use type only
export type NotificationResult = { ... };

// Option 3: Different names
export interface NotificationResult { ... }
export type NotificationResultType = ...;
```

---

## Enum Fixes

### ❌ Error: `Type "DELIVERED" not assignable to OrderStatus`

```typescript
// BEFORE (WRONG)
const status: OrderStatus = "DELIVERED";

// AFTER (CORRECT)
// Check schema for valid OrderStatus values
// Common values: PENDING, CONFIRMED, PROCESSING, READY, COMPLETED, CANCELLED
const status: OrderStatus = "COMPLETED";  // Use valid enum value

// Create mapping if needed:
const legacyToNew: Record<string, OrderStatus> = {
  "DELIVERED": "COMPLETED",
  "READY_FOR_PICKUP": "READY",
  "IN_PROGRESS": "PROCESSING",
};
```

---

### ❌ Error: `Type "COMPLETED" not assignable to PaymentStatus`

```typescript
// BEFORE (WRONG)
if (payment.status === "COMPLETED") { ... }

// AFTER (CORRECT)
// Check schema for valid PaymentStatus values
// Common values: PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED
if (payment.status === "SUCCEEDED") { ... }
```

---

### ❌ Error: `Type "PENDING_VERIFICATION" not assignable to FarmStatus`

```typescript
// BEFORE (WRONG)
if (farm.status === "PENDING_VERIFICATION") { ... }

// AFTER (CORRECT)
// Check schema for valid FarmStatus values
// Common values: DRAFT, PENDING, ACTIVE, SUSPENDED, INACTIVE
if (farm.status === "PENDING") { ... }
```

---

### ❌ Error: `Type "ALL" not assignable to NotificationChannel`

```typescript
// BEFORE (WRONG)
channel: "ALL"

// AFTER (CORRECT)
// Option 1: Add to enum (in types file)
type NotificationChannel = "EMAIL" | "SLACK" | "DISCORD" | "SMS" | "ALL";

// Option 2: Use array instead
channels: ["EMAIL", "SLACK", "DISCORD", "SMS"]

// Option 3: Use union type
channel: "EMAIL" as NotificationChannel | "ALL"
```

---

## Common Patterns

### Pattern: Safe Aggregation

```typescript
// CORRECT
const result = await database.order.aggregate({
  where: { farmId },
  _sum: { total: true },
  _count: true,
});

const totalRevenue = result._sum?.total ?? 0;  // Safe with ??
const orderCount = result._count ?? 0;
```

---

### Pattern: Null-Safe Array Access

```typescript
// CORRECT
const firstImage = product.images?.[0] ?? '/placeholder.jpg';
const productCount = farm.products?.length ?? 0;
const firstItem = order.items?.[0];
```

---

### Pattern: Type-Safe Enum Mapping

```typescript
// CORRECT
type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info';

const statusVariants: Record<OrderStatus, StatusBadgeVariant> = {
  PENDING: 'info',
  CONFIRMED: 'info',
  PROCESSING: 'warning',
  READY: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const variant = statusVariants[order.status];
```

---

### Pattern: Conditional Includes

```typescript
// CORRECT
const includeProducts = searchParams.get('withProducts') === 'true';

const farm = await database.farm.findUnique({
  where: { id },
  include: {
    owner: true,  // Always include
    ...(includeProducts && {
      products: {
        where: { status: 'AVAILABLE' },
        take: 10,
      }
    }),
  }
});
```

---

### Pattern: Prisma Transaction

```typescript
// CORRECT
const result = await database.$transaction(async (tx) => {
  const order = await tx.order.create({
    data: orderData,
    include: {
      items: true,
      customer: true,
    }
  });

  const payment = await tx.payment.create({
    data: {
      orderId: order.id,
      amount: calculateTotal(order.items),
    }
  });

  return { order, payment };
});
```

---

### Pattern: Type-Safe JSON Field

```typescript
// CORRECT
// Define schema for JSON field
interface FarmMetadata {
  certifications?: string[];
  specialties?: string[];
  deliveryZones?: string[];
}

// Use with type assertion
const metadata = farm.metadata as FarmMetadata | null;
const certifications = metadata?.certifications ?? [];

// Or with Zod validation
import { z } from 'zod';

const FarmMetadataSchema = z.object({
  certifications: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  deliveryZones: z.array(z.string()).optional(),
});

const metadata = FarmMetadataSchema.parse(farm.metadata);
```

---

### Pattern: Unused Variable Suppression

```typescript
// CORRECT - When variable is intentionally unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const session = await auth();

// Or destructure without the unused part
const { products, ...farmWithoutProducts } = farm;
```

---

### Pattern: Possibly Undefined Check

```typescript
// BEFORE (ERROR)
const value = step.value;  // Object is possibly 'undefined'

// AFTER (CORRECT)
if (!step) continue;
const value = step.value;

// Or
const value = step?.value ?? defaultValue;
```

---

## 🔍 Quick Debugging Commands

```bash
# Count total errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Find specific error type
npx tsc --noEmit 2>&1 | grep "does not exist on type"

# Check specific file
npx tsc --noEmit src/app/(admin)/admin/financial/page.tsx

# Generate fresh Prisma types
npx prisma generate

# View Prisma schema models
cat prisma/schema.prisma | grep "model "

# View Prisma enums
cat prisma/schema.prisma | grep "enum "
```

---

## 📚 Quick Reference Tables

### Common Field Name Mappings

| ❌ Wrong Field | ✅ Correct Field | Model |
|---------------|------------------|-------|
| `totalAmount` | Calculate from `items` | Order |
| `image` | `avatar` | User |
| `contactEmail` | `email` | Farm |
| `contactPhone` | `phone` | Farm |
| `fulfillment` | `fulfilledAt` | Order |
| `paidAt` | `paidDate` | Payout |
| `farmer` | `farm.owner` | Payout |
| `stockQuantity` | `inventory.quantity` | Product |

### Common Enum Values

| Enum | Valid Values |
|------|--------------|
| OrderStatus | PENDING, CONFIRMED, PROCESSING, READY, COMPLETED, CANCELLED |
| PaymentStatus | PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED |
| FarmStatus | DRAFT, PENDING, ACTIVE, SUSPENDED, INACTIVE |
| ProductStatus | DRAFT, AVAILABLE, OUT_OF_STOCK, DISCONTINUED |
| UserRole | CONSUMER, FARMER, ADMIN |

---

**Quick Tip**: Always check `prisma/schema.prisma` first before assuming field names!

_"Fix fast with divine precision, verify with agricultural consciousness."_ 🌾⚡