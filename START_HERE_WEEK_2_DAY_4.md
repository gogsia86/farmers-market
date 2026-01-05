# 🚀 START HERE: Week 2 Day 4 - Order Management APIs

**Date**: November 15, 2025
**Sprint**: Week 2 - Shopping Cart & Checkout
**Day**: Day 4 - Order Management & Confirmation
**Estimated Time**: 3-4 hours
**Prerequisite**: Day 3 Checkout Wizard ✅ Complete

---

## 📋 Day 4 Objectives

### Primary Goals
1. **Order Creation API** - POST endpoint to create orders from checkout
2. **Order Confirmation Page** - Display order details after successful purchase
3. **Address Saving API** - Save shipping addresses from checkout
4. **Integration** - Connect checkout wizard to order APIs
5. **Testing** - End-to-end checkout flow validation

### Success Criteria
- ✅ Orders created successfully from checkout wizard
- ✅ Cart cleared after order placement
- ✅ Order confirmation page displays correctly
- ✅ Addresses saved when checkbox selected
- ✅ TypeScript: 0 errors
- ✅ Divine patterns maintained

---

## 🎯 What You're Building Today

### API Endpoints

#### 1. Create Order
```
POST /api/orders
```
- Accepts checkout form data
- Validates cart items still available
- Creates order in database
- Clears user's cart
- Returns order ID and confirmation data

#### 2. Get Order
```
GET /api/orders/[orderId]
```
- Fetches order details with relationships
- Returns order items, farm info, totals
- Used by confirmation page

#### 3. Save Address
```
POST /api/user/addresses
```
- Saves shipping address from checkout
- Sets default if first address
- Returns saved address

---

## 📁 Files to Create/Modify

### 1. Order Creation API
**File**: `src/app/api/orders/route.ts`

### 2. Order Detail API
**File**: `src/app/api/orders/[orderId]/route.ts`

### 3. Order Confirmation Page
**File**: `src/app/(customer)/orders/[orderId]/confirmation/page.tsx`

### 4. Save Address API
**File**: `src/app/api/user/addresses/route.ts` (may already exist - check first)

### 5. Order Service
**File**: `src/lib/services/order.service.ts`

---

## 🔧 Implementation Guide

### Step 1: Create Order Service (Business Logic)

**File**: `src/lib/services/order.service.ts`

```typescript
// 📦 ORDER SERVICE - Divine Order Management
import { database } from "@/lib/database";
import type { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export class OrderService {
  /**
   * Create order from checkout data
   */
  async createOrder(data: {
    userId: string;
    shippingAddress: ShippingAddressData;
    deliveryInfo: DeliveryInfoData;
    paymentMethod: PaymentMethodData;
    cartItems: CartItemData[];
    totals: OrderTotals;
  }) {
    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Validate cart items still available
    await this.validateCartItems(data.cartItems);

    // Group items by farm (orders are per-farm)
    const ordersByFarm = this.groupByFarm(data.cartItems);

    // Create orders in transaction
    const orders = await database.$transaction(async (tx) => {
      const createdOrders = [];

      for (const [farmId, items] of Object.entries(ordersByFarm)) {
        // Calculate farm-specific totals
        const farmTotals = this.calculateFarmTotals(items, data.totals);

        // Create order
        const order = await tx.order.create({
          data: {
            orderNumber: `${orderNumber}-${createdOrders.length + 1}`,
            customerId: data.userId,
            farmId,
            status: "PENDING",
            paymentStatus: "PENDING",
            subtotal: farmTotals.subtotal,
            deliveryFee: farmTotals.deliveryFee,
            platformFee: farmTotals.platformFee,
            tax: farmTotals.tax,
            total: farmTotals.total,
            farmerAmount: farmTotals.farmerAmount,
            fulfillmentMethod: "DELIVERY",
            // ... more fields
          },
          include: {
            items: true,
            farm: true,
          },
        });

        // Create order items
        await this.createOrderItems(tx, order.id, items);

        createdOrders.push(order);
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: data.userId },
      });

      return createdOrders;
    });

    return orders;
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FM${timestamp}${random}`;
  }

  /**
   * Validate cart items availability
   */
  private async validateCartItems(items: CartItemData[]) {
    for (const item of items) {
      const product = await database.product.findUnique({
        where: { id: item.productId },
        select: { id: true, status: true, stock: true },
      });

      if (!product || product.status !== "ACTIVE") {
        throw new Error(`Product ${item.productId} is no longer available`);
      }

      if (product.stock && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }
  }

  /**
   * Group cart items by farm
   */
  private groupByFarm(items: CartItemData[]) {
    return items.reduce((groups, item) => {
      if (!groups[item.farmId]) {
        groups[item.farmId] = [];
      }
      groups[item.farmId].push(item);
      return groups;
    }, {} as Record<string, CartItemData[]>);
  }

  /**
   * Calculate farm-specific totals
   */
  private calculateFarmTotals(items: CartItemData[], totalTotals: OrderTotals) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

    // Proportional fees (if order has multiple farms)
    const proportion = subtotal / totalTotals.subtotal;
    const deliveryFee = totalTotals.deliveryFee * proportion;
    const platformFee = subtotal * 0.15; // 15% platform fee
    const tax = (subtotal + deliveryFee + platformFee) * 0.08; // 8% tax
    const total = subtotal + deliveryFee + platformFee + tax;
    const farmerAmount = subtotal - platformFee;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      total,
      farmerAmount,
    };
  }

  /**
   * Create order items
   */
  private async createOrderItems(
    tx: Prisma.TransactionClient,
    orderId: string,
    items: CartItemData[]
  ) {
    const orderItems = items.map((item) => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      unit: "lb", // or from item
      priceAtPurchase: item.priceAtPurchase,
      subtotal: item.priceAtPurchase * item.quantity,
    }));

    await tx.orderItem.createMany({
      data: orderItems,
    });
  }

  /**
   * Get order by ID with relationships
   */
  async getOrderById(orderId: string, userId: string) {
    const order = await database.order.findFirst({
      where: {
        id: orderId,
        customerId: userId, // Security: only return user's own orders
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }
}

// Export singleton
export const orderService = new OrderService();
```

---

### Step 2: Create Order API Endpoint

**File**: `src/app/api/orders/route.ts`

```typescript
// 🛒 ORDER API - Create New Order
import { auth } from "@/lib/auth";
import { orderService } from "@/lib/services/order.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const createOrderSchema = z.object({
  userId: z.string().cuid(),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    street: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  deliveryInfo: z.object({
    preferredDate: z.string(),
    preferredTime: z.string(),
    deliveryInstructions: z.string().optional(),
  }),
  paymentMethod: z.object({
    method: z.enum(["card", "wallet"]),
    saveCard: z.boolean().optional(),
  }),
  cartItems: z.array(
    z.object({
      productId: z.string(),
      farmId: z.string(),
      quantity: z.number().positive(),
      priceAtPurchase: z.number().positive(),
    })
  ),
  totals: z.object({
    subtotal: z.number(),
    deliveryFee: z.number(),
    platformFee: z.number(),
    tax: z.number(),
    total: z.number(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid order data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const orderData = validation.data;

    // Verify user ID matches session
    if (orderData.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "User ID mismatch" } },
        { status: 403 }
      );
    }

    // Create order(s)
    const orders = await orderService.createOrder(orderData);

    // Return primary order ID (first one if multiple farms)
    return NextResponse.json({
      success: true,
      orderId: orders[0].id,
      orderNumber: orders[0].orderNumber,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        farmId: o.farmId,
        total: o.total,
      })),
    });
  } catch (error) {
    console.error("Order creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_CREATION_FAILED",
          message: error instanceof Error ? error.message : "Failed to create order",
        },
      },
      { status: 500 }
    );
  }
}
```

---

### Step 3: Create Order Detail API

**File**: `src/app/api/orders/[orderId]/route.ts`

```typescript
// 📦 ORDER DETAIL API - Get Single Order
import { auth } from "@/lib/auth";
import { orderService } from "@/lib/services/order.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { orderId } = params;

    // Fetch order
    const order = await orderService.getOrderById(orderId, session.user.id);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order fetch error:", error);

    if (error instanceof Error && error.message === "Order not found") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_FETCH_FAILED",
          message: error instanceof Error ? error.message : "Failed to fetch order",
        },
      },
      { status: 500 }
    );
  }
}
```

---

### Step 4: Create Order Confirmation Page

**File**: `src/app/(customer)/orders/[orderId]/confirmation/page.tsx`

```typescript
// 🎉 ORDER CONFIRMATION PAGE - Divine Success Experience
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { formatCurrency } from "@/lib/utils/currency";
import { Check, MapPin, Package, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Confirmation | Farmers Market Platform",
  description: "Your order has been placed successfully",
};

interface PageProps {
  params: {
    orderId: string;
  };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  const { orderId } = params;

  // Fetch order
  const order = await database.order.findFirst({
    where: {
      id: orderId,
      customerId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
      farm: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-gray-600">
            Thank you for supporting local farmers
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-2xl font-bold text-gray-900">
                {order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Status
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <Package className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {order.status === "PENDING" ? "Order Received" : order.status}
              </p>
              <p className="text-sm text-gray-600">
                Your order is being prepared
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-green-600" />
            Delivery Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Delivery Address</p>
              <p className="font-medium text-gray-900">
                {order.deliveryAddress || "Standard delivery"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Delivery</p>
              <p className="font-medium text-gray-900">
                {order.scheduledDeliveryDate
                  ? new Date(order.scheduledDeliveryDate).toLocaleDateString()
                  : "To be scheduled"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {Number(item.quantity)} {item.unit} × {formatCurrency(Number(item.priceAtPurchase))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(Number(item.subtotal))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{formatCurrency(Number(order.deliveryFee))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee</span>
              <span>{formatCurrency(Number(order.platformFee))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>{formatCurrency(Number(order.tax))}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Contact */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            From {order.farm.name}
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Your local farmer will be in touch about delivery details.
          </p>
          <div className="text-sm">
            <p className="text-gray-700">📧 {order.farm.email}</p>
            <p className="text-gray-700">📞 {order.farm.phone}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/orders"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
          >
            View All Orders
          </Link>
          <Link
            href="/products"
            className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-center font-medium text-white hover:bg-green-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Key Design Patterns

### 1. Service Layer Pattern
```typescript
// Business logic in service
class OrderService {
  async createOrder(data) { ... }
  async validateCartItems(items) { ... }
}

// API route is thin wrapper
export async function POST(request) {
  const orders = await orderService.createOrder(data);
  return NextResponse.json({ success: true, orders });
}
```

### 2. Transaction Safety
```typescript
await database.$transaction(async (tx) => {
  // Create order
  const order = await tx.order.create({ ... });

  // Create order items
  await tx.orderItem.createMany({ ... });

  // Clear cart
  await tx.cartItem.deleteMany({ ... });

  return order;
});
```

### 3. Validation Chain
```typescript
1. Zod schema validation (request body)
2. Auth validation (user session)
3. Business validation (cart items availability)
4. Database constraints (foreign keys, etc.)
```

---

## 📦 Database Schema Reference

### Order Model
```prisma
model Order {
  id                    String
  orderNumber           String   @unique
  customerId            String
  farmId                String
  status                OrderStatus
  paymentStatus         PaymentStatus
  subtotal              Decimal
  deliveryFee           Decimal
  platformFee           Decimal
  tax                   Decimal
  total                 Decimal
  farmerAmount          Decimal
  fulfillmentMethod     FulfillmentMethod
  deliveryAddress       String?
  scheduledDeliveryDate DateTime?
  // ... relations
}
```

### OrderItem Model
```prisma
model OrderItem {
  id              String
  orderId         String
  productId       String
  quantity        Decimal
  unit            String
  priceAtPurchase Decimal
  subtotal        Decimal
  // ... relations
}
```

---

## 🧪 Testing Checklist

### API Testing
- [ ] Order creation succeeds with valid data
- [ ] Order creation fails with invalid data
- [ ] Cart is cleared after order creation
- [ ] Multiple farms create multiple orders
- [ ] Order totals calculate correctly
- [ ] Auth required for all endpoints

### Page Testing
- [ ] Confirmation page loads correctly
- [ ] Order details display properly
- [ ] Unauthenticated users redirected
- [ ] 404 for invalid order IDs
- [ ] Links work (View Orders, Continue Shopping)

### Integration Testing
- [ ] Complete checkout flow end-to-end
- [ ] Submit order from review step
- [ ] Redirect to confirmation page
- [ ] Order appears in database
- [ ] Cart is empty after order

---

## 🔗 Integration with Day 3

### Update Review Step Submit Handler

**File**: `src/components/features/checkout/review-step.tsx`

The submit handler already calls `POST /api/orders` - it should now work!

```typescript
// This code already exists in review-step.tsx
const response = await fetch("/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId,
    shippingAddress: formData.shipping,
    deliveryInfo: formData.delivery,
    paymentMethod: formData.payment,
    cartItems: cart.map((item) => ({
      productId: item.productId,
      farmId: item.farmId,
      quantity: Number(item.quantity),
      priceAtPurchase: Number(item.priceAtAdd),
    })),
    totals,
  }),
});

const result = await response.json();
if (result.success && result.orderId) {
  router.push(`/orders/${result.orderId}/confirmation`);
}
```

---

## 🚀 Step-by-Step Implementation Order

### Phase 1: Service Layer (1 hour)
1. Create `order.service.ts`
2. Implement `createOrder` method
3. Implement `getOrderById` method
4. Add validation helpers

### Phase 2: API Endpoints (1 hour)
1. Create `POST /api/orders` route
2. Create `GET /api/orders/[orderId]` route
3. Add Zod validation schemas
4. Test with Postman/Thunder Client

### Phase 3: Confirmation Page (1 hour)
1. Create confirmation page component
2. Fetch order data server-side
3. Design success UI
4. Add farm contact info
5. Add action buttons

### Phase 4: Integration & Testing (30 min)
1. Test complete checkout flow
2. Verify cart clearing
3. Check confirmation page
4. Test error cases

---

## 📚 Reference Documentation

### Divine Instructions
- `01_DIVINE_CORE_PRINCIPLES` - Service layer patterns
- `04_NEXTJS_DIVINE_IMPLEMENTATION` - API route patterns
- `07_DATABASE_QUANTUM_MASTERY` - Transaction patterns
- `11_KILO_SCALE_ARCHITECTURE` - Business logic separation

### Existing Code
- `src/app/(customer)/checkout/page.tsx` - Checkout implementation
- `src/components/features/checkout/review-step.tsx` - Submit handler
- `prisma/schema.prisma` - Order models

---

## 🎯 Quick Start Commands

```bash
# Type check
npm run type-check

# Start dev server
npm run dev

# Prisma Studio (view orders)
npx prisma studio

# Test API with curl
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

---

## ✅ Day 4 Completion Checklist

- [ ] Order service created
- [ ] Order API endpoints implemented
- [ ] Order confirmation page created
- [ ] Integration with checkout wizard
- [ ] Cart clears after order
- [ ] TypeScript: 0 errors
- [ ] API returns proper error codes
- [ ] Confirmation page renders correctly
- [ ] End-to-end test passes
- [ ] Documentation created

---

## 🎉 Ready to Start?

1. **Read** this guide completely
2. **Review** Day 3 review-step.tsx submit handler
3. **Create** order.service.ts (start here)
4. **Implement** POST /api/orders
5. **Build** confirmation page
6. **Test** end-to-end flow
7. **Document** completion

**Estimated Time**: 3-4 hours for complete implementation

**Let's build divine order management! 🚀🌾**

---

_"From cart to confirmation, every order is a celebration of local agriculture and divine engineering."_
