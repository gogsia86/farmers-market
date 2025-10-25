# 🚀 Phase 1 - Day 1 Quick Start

**Date**: October 25, 2025
**Focus**: Order Processing System - Database & Services
**Estimated Time**: 2-3 hours
**Status**: 🟢 READY TO CODE

---

## ✅ COMPLETED

- [x] Phase 1 execution plan created (500+ lines)
- [x] ACTIVE_SPRINT.md updated with Phase 1 priorities
- [x] Database schema reviewed (Order model exists!)

---

## ⏳ TODAY'S TASKS

### 1. Create Order TypeScript Types (30 minutes)

**File**: `src/types/order.types.ts`

```typescript
// src/types/order.types.ts
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
} from "@prisma/client";

// Complete order with all relations
export type OrderWithRelations = Order & {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  farm: {
    id: string;
    name: string;
  };
  items: OrderItemWithProduct[];
  deliveryAddress?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
};

export type OrderItemWithProduct = OrderItem & {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    images: string[];
  };
};

// Order creation payload
export interface CreateOrderInput {
  customerId: string;
  farmId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddressId?: string;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
}

// Order update payload
export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  updatedBy: string;
  notes?: string;
}

// Order totals calculation
export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  total: number;
  farmerAmount: number;
}

// Order summary for display
export interface OrderSummary {
  id: string;
  orderNumber: string;
  farmName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}
```

**Steps**:

1. Create directory: `mkdir -p src/types`
2. Create file: `src/types/order.types.ts`
3. Copy TypeScript definitions above
4. Save file

---

### 2. Build Order Service Layer (1 hour)

**File**: `src/lib/services/order.service.ts`

```typescript
// src/lib/services/order.service.ts
import { database } from "@/lib/database";
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderWithRelations,
  OrderTotals,
} from "@/types/order.types";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export class OrderService {
  /**
   * Generate unique order number (FM-YYYYMMDD-XXXX)
   */
  static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const prefix = `FM-${year}${month}${day}`;

    // Get count of orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const count = await database.order.count({
      where: {
        createdAt: { gte: startOfDay },
      },
    });

    const sequence = String(count + 1).padStart(4, "0");
    return `${prefix}-${sequence}`;
  }

  /**
   * Calculate order totals
   */
  static async calculateTotals(
    items: Array<{ productId: string; quantity: number }>,
    farmId: string,
    fulfillmentMethod: string
  ): Promise<OrderTotals> {
    // Fetch product prices
    const products = await database.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
      },
      select: { id: true, price: true },
    });

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? Number(product.price) * item.quantity : 0);
    }, 0);

    // Calculate fees
    const deliveryFee = fulfillmentMethod === "DELIVERY" ? 5.0 : 0;
    const platformFee = subtotal * 0.15; // 15% commission
    const tax = (subtotal + deliveryFee) * 0.08; // 8% tax (adjust per region)
    const discount = 0; // TODO: Apply coupons
    const total = subtotal + deliveryFee + tax - discount;
    const farmerAmount = subtotal + deliveryFee - platformFee - tax;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      discount,
      total,
      farmerAmount,
    };
  }

  /**
   * Create new order
   */
  static async createOrder(
    input: CreateOrderInput
  ): Promise<OrderWithRelations> {
    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate totals
    const totals = await this.calculateTotals(
      input.items,
      input.farmId,
      input.fulfillmentMethod
    );

    // Create order with items
    const order = await database.order.create({
      data: {
        orderNumber,
        customerId: input.customerId,
        farmId: input.farmId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        ...totals,
        fulfillmentMethod: input.fulfillmentMethod,
        deliveryAddressId: input.deliveryAddressId,
        scheduledDate: input.scheduledDate,
        scheduledTimeSlot: input.scheduledTimeSlot,
        specialInstructions: input.specialInstructions,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            pricePerUnit: 0, // TODO: Fetch from product
            total: 0, // TODO: Calculate
          })),
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
    });

    return order as OrderWithRelations;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(
    orderId: string
  ): Promise<OrderWithRelations | null> {
    return (await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
    })) as OrderWithRelations | null;
  }

  /**
   * Get customer's orders
   */
  static async getCustomerOrders(
    customerId: string
  ): Promise<OrderWithRelations[]> {
    return (await database.order.findMany({
      where: { customerId },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
      orderBy: { createdAt: "desc" },
    })) as OrderWithRelations[];
  }

  /**
   * Get farm's orders
   */
  static async getFarmOrders(farmId: string): Promise<OrderWithRelations[]> {
    return (await database.order.findMany({
      where: { farmId },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
      orderBy: { createdAt: "desc" },
    })) as OrderWithRelations[];
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    input: UpdateOrderStatusInput
  ): Promise<OrderWithRelations> {
    const order = await database.order.update({
      where: { id: input.orderId },
      data: {
        status: input.status,
        ...(input.status === OrderStatus.CONFIRMED && {
          confirmedAt: new Date(),
        }),
        ...(input.status === OrderStatus.FULFILLED && {
          fulfilledAt: new Date(),
        }),
        ...(input.status === OrderStatus.COMPLETED && {
          completedAt: new Date(),
        }),
        ...(input.status === OrderStatus.CANCELLED && {
          cancelledAt: new Date(),
          cancelledBy: input.updatedBy,
          cancelReason: input.notes,
        }),
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
    });

    return order as OrderWithRelations;
  }

  /**
   * Cancel order
   */
  static async cancelOrder(
    orderId: string,
    cancelledBy: string,
    reason: string
  ): Promise<OrderWithRelations> {
    return await this.updateOrderStatus({
      orderId,
      status: OrderStatus.CANCELLED,
      updatedBy: cancelledBy,
      notes: reason,
    });
  }
}
```

**Steps**:

1. Create directory: `mkdir -p src/lib/services`
2. Create file: `src/lib/services/order.service.ts`
3. Copy service code above
4. Save file

---

### 3. Create First API Route (30 minutes)

**File**: `src/app/api/orders/route.ts`

```typescript
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order.service";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Validation schema
const CreateOrderSchema = z.object({
  farmId: z.string(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .min(1),
  fulfillmentMethod: z.enum(["DELIVERY", "FARM_PICKUP", "MARKET_PICKUP"]),
  deliveryAddressId: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTimeSlot: z.string().optional(),
  specialInstructions: z.string().optional(),
});

/**
 * POST /api/orders - Create new order
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Create order
    const order = await OrderService.createOrder({
      customerId: session.user.id,
      ...validation.data,
      scheduledDate: validation.data.scheduledDate
        ? new Date(validation.data.scheduledDate)
        : undefined,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders - Get user's orders
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get orders
    const orders = await OrderService.getCustomerOrders(session.user.id);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
```

**Steps**:

1. Create directory: `mkdir -p src/app/api/orders`
2. Create file: `src/app/api/orders/route.ts`
3. Copy API route code above
4. Save file

---

## ✅ VERIFICATION

After completing the above tasks, verify:

1. **TypeScript compiles without errors**:

   ```bash
   npx tsc --noEmit
   ```

2. **Prisma client is up to date**:

   ```bash
   npx prisma generate
   ```

3. **Test API route** (optional, with Thunder Client or Postman):
   - POST to `http://localhost:3000/api/orders`
   - Include auth token
   - Send order payload

---

## 📊 TODAY'S PROGRESS

**Expected Output**:

- ✅ 3 new files created
- ✅ ~500 lines of code written
- ✅ Order service fully functional
- ✅ First API endpoint operational

**Time Investment**: 2-3 hours

---

## 🚀 WHAT'S NEXT (Tomorrow)

- Complete remaining order API routes
- Build order UI components
- Start farmer order dashboard

---

**Status**: 🟢 **READY TO CODE - LET'S BUILD!** 🚀
