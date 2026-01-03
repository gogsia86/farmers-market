# 🎯 Sprint 7 - Phase 4: Order Tracking & Management

## Technical Specifications

**Sprint Duration**: 2 weeks
**Status**: ACTIVE
**Priority**: HIGH - Core Business Feature
**Dependencies**: Sprint 6 (Order Management & Payment) - COMPLETE

---

## 📋 Executive Summary

Phase 4 completes the order lifecycle by implementing real-time order tracking, status management, farmer fulfillment workflows, and customer notification systems. This phase transforms our payment-enabled platform into a fully operational marketplace with end-to-end order management.

### Business Value

- **Customer Experience**: Real-time order visibility and updates
- **Farmer Efficiency**: Streamlined order fulfillment workflow
- **Operational Excellence**: Complete order lifecycle management
- **Scalability**: Foundation for 1000+ concurrent orders

---

## 🏗️ Architecture Overview

### System Components

```typescript
┌─────────────────────────────────────────────────────────────┐
│                    ORDER TRACKING SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Customer   │  │   Farmer     │  │    Admin     │      │
│  │  Dashboard   │  │  Dashboard   │  │   Console    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│              ┌─────────────▼─────────────┐                  │
│              │  Order Status Controller  │                  │
│              └─────────────┬─────────────┘                  │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼────┐       ┌────▼────┐       ┌────▼────┐        │
│    │ Status  │       │ Notif   │       │ History │        │
│    │ Service │       │ Service │       │ Service │        │
│    └────┬────┘       └────┬────┘       └────┬────┘        │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│              ┌─────────────▼─────────────┐                  │
│              │   Real-time Event Bus     │                  │
│              │    (WebSocket/SSE)        │                  │
│              └─────────────┬─────────────┘                  │
│                            │                                 │
│              ┌─────────────▼─────────────┐                  │
│              │   Database Layer          │                  │
│              │   (Prisma + PostgreSQL)   │                  │
│              └───────────────────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Extensions

### Order Status Tracking

```prisma
// prisma/schema.prisma

enum OrderStatus {
  PENDING           // Initial state after payment
  CONFIRMED         // Farmer confirmed order
  PREPARING         // Farmer is preparing items
  READY_FOR_PICKUP  // Ready for customer pickup
  OUT_FOR_DELIVERY  // In transit (if delivery)
  COMPLETED         // Order fulfilled
  CANCELLED         // Order cancelled
  REFUNDED          // Payment refunded
}

enum FulfillmentType {
  PICKUP
  DELIVERY
  SHIPPING
}

model Order {
  id                String            @id @default(cuid())
  orderNumber       String            @unique @default(cuid())
  status            OrderStatus       @default(PENDING)
  fulfillmentType   FulfillmentType   @default(PICKUP)

  // Existing fields...
  customerId        String
  farmId            String
  totalAmount       Decimal           @db.Decimal(10, 2)

  // New tracking fields
  confirmedAt       DateTime?
  preparingAt       DateTime?
  readyAt           DateTime?
  completedAt       DateTime?
  cancelledAt       DateTime?

  // Estimated times
  estimatedReadyAt  DateTime?
  estimatedPickupAt DateTime?

  // Fulfillment details
  pickupLocation    String?
  pickupInstructions String?
  deliveryAddress   Json?
  deliveryNotes     String?

  // Relations
  customer          User              @relation("CustomerOrders", fields: [customerId], references: [id])
  farm              Farm              @relation(fields: [farmId], references: [id])
  items             OrderItem[]
  statusHistory     OrderStatusHistory[]
  notifications     OrderNotification[]

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([customerId])
  @@index([farmId])
  @@index([status])
  @@index([orderNumber])
}

model OrderStatusHistory {
  id          String      @id @default(cuid())
  orderId     String
  order       Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)

  fromStatus  OrderStatus?
  toStatus    OrderStatus
  changedBy   String      // userId who made the change
  reason      String?     // Optional reason for status change
  metadata    Json?       // Additional context

  createdAt   DateTime    @default(now())

  @@index([orderId])
  @@index([createdAt])
}

model OrderNotification {
  id          String              @id @default(cuid())
  orderId     String
  order       Order               @relation(fields: [orderId], references: [id], onDelete: Cascade)

  userId      String
  user        User                @relation(fields: [userId], references: [id])

  type        NotificationType
  channel     NotificationChannel
  title       String
  message     String
  metadata    Json?

  sentAt      DateTime?
  readAt      DateTime?

  createdAt   DateTime            @default(now())

  @@index([orderId])
  @@index([userId])
  @@index([sentAt])
}

enum NotificationType {
  ORDER_CONFIRMED
  ORDER_PREPARING
  ORDER_READY
  ORDER_COMPLETED
  ORDER_CANCELLED
  ORDER_DELAYED
  ORDER_REMINDER
}

enum NotificationChannel {
  EMAIL
  SMS
  PUSH
  IN_APP
}
```

### Migration Strategy

```typescript
// prisma/migrations/YYYYMMDD_phase4_order_tracking/migration.sql

-- Add new columns to existing Order table
ALTER TABLE "Order" ADD COLUMN "fulfillmentType" TEXT NOT NULL DEFAULT 'PICKUP';
ALTER TABLE "Order" ADD COLUMN "confirmedAt" TIMESTAMP;
ALTER TABLE "Order" ADD COLUMN "preparingAt" TIMESTAMP;
ALTER TABLE "Order" ADD COLUMN "readyAt" TIMESTAMP;
ALTER TABLE "Order" ADD COLUMN "completedAt" TIMESTAMP;
ALTER TABLE "Order" ADD COLUMN "cancelledAt" TIMESTAMP;
ALTER TABLE "Order" ADD COLUMN "estimatedReadyAt" TIMESTAMP;
ALTER TABLE "Order" ADD COLUMN "estimatedPickupAt" TIMESTAMP;
ALTER TABLE "Order" ADD COLUMN "pickupLocation" TEXT;
ALTER TABLE "Order" ADD COLUMN "pickupInstructions" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryAddress" JSONB;
ALTER TABLE "Order" ADD COLUMN "deliveryNotes" TEXT;

-- Create OrderStatusHistory table
CREATE TABLE "OrderStatusHistory" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  "changedBy" TEXT NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE
);

CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

-- Create OrderNotification table
CREATE TABLE "OrderNotification" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "sentAt" TIMESTAMP,
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX "OrderNotification_orderId_idx" ON "OrderNotification"("orderId");
CREATE INDEX "OrderNotification_userId_idx" ON "OrderNotification"("userId");
CREATE INDEX "OrderNotification_sentAt_idx" ON "OrderNotification"("sentAt");

-- Migrate existing orders to PENDING status if needed
UPDATE "Order" SET "status" = 'PENDING' WHERE "status" IS NULL;
```

---

## 🔧 Service Layer Implementation

### 1. Order Status Service

```typescript
// src/lib/services/order-status.service.ts

import { database } from "@/lib/database";
import type { Order, OrderStatus, User } from "@prisma/client";
import { trace } from "@opentelemetry/api";
import { OrderNotificationService } from "./order-notification.service";

interface StatusTransition {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  allowedRoles: string[];
  validations: ((order: Order) => Promise<boolean>)[];
}

export class OrderStatusService {
  private notificationService: OrderNotificationService;

  // Status state machine
  private readonly transitions: StatusTransition[] = [
    {
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      allowedRoles: ["FARMER", "ADMIN"],
      validations: [this.validateFarmOwnership],
    },
    {
      fromStatus: "CONFIRMED",
      toStatus: "PREPARING",
      allowedRoles: ["FARMER", "ADMIN"],
      validations: [this.validateFarmOwnership],
    },
    {
      fromStatus: "PREPARING",
      toStatus: "READY_FOR_PICKUP",
      allowedRoles: ["FARMER", "ADMIN"],
      validations: [this.validateFarmOwnership, this.validateAllItemsPrepared],
    },
    {
      fromStatus: "READY_FOR_PICKUP",
      toStatus: "COMPLETED",
      allowedRoles: ["FARMER", "CUSTOMER", "ADMIN"],
      validations: [],
    },
    {
      fromStatus: "PENDING",
      toStatus: "CANCELLED",
      allowedRoles: ["CUSTOMER", "FARMER", "ADMIN"],
      validations: [this.validateCancellationWindow],
    },
    // ... more transitions
  ];

  constructor() {
    this.notificationService = new OrderNotificationService();
  }

  /**
   * Update order status with validation and history tracking
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userId: string,
    reason?: string,
  ): Promise<Order> {
    const tracer = trace.getTracer("order-status-service");

    return await tracer.startActiveSpan("updateOrderStatus", async (span) => {
      span.setAttributes({
        "order.id": orderId,
        "order.new_status": newStatus,
        "user.id": userId,
      });

      try {
        // Get current order
        const order = await database.order.findUnique({
          where: { id: orderId },
          include: {
            farm: true,
            customer: true,
            items: true,
          },
        });

        if (!order) {
          throw new Error(`Order ${orderId} not found`);
        }

        // Validate transition
        await this.validateStatusTransition(
          order,
          order.status,
          newStatus,
          userId,
        );

        // Update order in transaction
        const updatedOrder = await database.$transaction(async (tx) => {
          // Update order status and timestamp
          const updated = await tx.order.update({
            where: { id: orderId },
            data: {
              status: newStatus,
              ...this.getStatusTimestamps(newStatus),
            },
            include: {
              farm: true,
              customer: true,
              items: { include: { product: true } },
            },
          });

          // Create status history entry
          await tx.orderStatusHistory.create({
            data: {
              orderId,
              fromStatus: order.status,
              toStatus: newStatus,
              changedBy: userId,
              reason,
            },
          });

          return updated;
        });

        // Send notifications (async, don't wait)
        this.notificationService
          .sendStatusUpdateNotifications(updatedOrder, newStatus)
          .catch((err) => {
            console.error("Failed to send notifications:", err);
          });

        span.setStatus({ code: 1 }); // OK
        return updatedOrder;
      } catch (error) {
        span.setStatus({ code: 2, message: error.message }); // ERROR
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Get order status history
   */
  async getOrderStatusHistory(orderId: string) {
    return await database.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Get orders by status for a farm
   */
  async getOrdersByStatus(
    farmId: string,
    status: OrderStatus | OrderStatus[],
  ): Promise<Order[]> {
    const statusArray = Array.isArray(status) ? status : [status];

    return await database.order.findMany({
      where: {
        farmId,
        status: { in: statusArray },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Bulk status update (admin only)
   */
  async bulkUpdateStatus(
    orderIds: string[],
    newStatus: OrderStatus,
    adminUserId: string,
    reason?: string,
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const orderId of orderIds) {
      try {
        await this.updateOrderStatus(orderId, newStatus, adminUserId, reason);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          orderId,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Private helper methods

  private async validateStatusTransition(
    order: Order,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    userId: string,
  ): Promise<void> {
    const transition = this.transitions.find(
      (t) => t.fromStatus === fromStatus && t.toStatus === toStatus,
    );

    if (!transition) {
      throw new Error(
        `Invalid status transition from ${fromStatus} to ${toStatus}`,
      );
    }

    // Check user role authorization
    const user = await database.user.findUnique({
      where: { id: userId },
    });

    if (!user || !transition.allowedRoles.includes(user.role)) {
      throw new Error(
        `User role ${user?.role} not authorized for this status change`,
      );
    }

    // Run custom validations
    for (const validation of transition.validations) {
      const isValid = await validation.call(this, order);
      if (!isValid) {
        throw new Error(`Validation failed for status transition`);
      }
    }
  }

  private async validateFarmOwnership(order: Order): Promise<boolean> {
    // Implementation: check if user owns the farm
    return true;
  }

  private async validateAllItemsPrepared(order: Order): Promise<boolean> {
    // Implementation: check if all items are ready
    return true;
  }

  private async validateCancellationWindow(order: Order): Promise<boolean> {
    // Implementation: check if within cancellation window
    const hoursSinceCreation =
      (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation < 24; // 24-hour cancellation window
  }

  private getStatusTimestamps(status: OrderStatus): Partial<Order> {
    const now = new Date();
    const timestamps: any = {};

    switch (status) {
      case "CONFIRMED":
        timestamps.confirmedAt = now;
        break;
      case "PREPARING":
        timestamps.preparingAt = now;
        break;
      case "READY_FOR_PICKUP":
        timestamps.readyAt = now;
        break;
      case "COMPLETED":
        timestamps.completedAt = now;
        break;
      case "CANCELLED":
        timestamps.cancelledAt = now;
        break;
    }

    return timestamps;
  }
}
```

### 2. Order Notification Service

```typescript
// src/lib/services/order-notification.service.ts

import { database } from "@/lib/database";
import type {
  Order,
  OrderStatus,
  NotificationType,
  NotificationChannel,
} from "@prisma/client";
import { Resend } from "resend";
import { trace } from "@opentelemetry/api";

interface NotificationConfig {
  type: NotificationType;
  channels: NotificationChannel[];
  template: (order: Order) => { title: string; message: string };
  recipients: (order: Order) => string[]; // userIds
}

export class OrderNotificationService {
  private resend: Resend;

  private readonly notificationConfigs: Record<
    OrderStatus,
    NotificationConfig
  > = {
    CONFIRMED: {
      type: "ORDER_CONFIRMED",
      channels: ["EMAIL", "IN_APP"],
      template: (order) => ({
        title: "Order Confirmed! 🎉",
        message: `Your order #${order.orderNumber} has been confirmed by the farm and is being prepared.`,
      }),
      recipients: (order) => [order.customerId],
    },
    PREPARING: {
      type: "ORDER_PREPARING",
      channels: ["IN_APP"],
      template: (order) => ({
        title: "Order Being Prepared 👨‍🌾",
        message: `Your order #${order.orderNumber} is now being prepared. It will be ready soon!`,
      }),
      recipients: (order) => [order.customerId],
    },
    READY_FOR_PICKUP: {
      type: "ORDER_READY",
      channels: ["EMAIL", "SMS", "PUSH", "IN_APP"],
      template: (order) => ({
        title: "Order Ready for Pickup! ✅",
        message: `Your order #${order.orderNumber} is ready for pickup at ${order.pickupLocation}. ${order.pickupInstructions || ""}`,
      }),
      recipients: (order) => [order.customerId],
    },
    COMPLETED: {
      type: "ORDER_COMPLETED",
      channels: ["EMAIL", "IN_APP"],
      template: (order) => ({
        title: "Order Completed 🌟",
        message: `Thank you for your order! We hope you enjoy your fresh farm products. Please consider leaving a review.`,
      }),
      recipients: (order) => [order.customerId],
    },
    CANCELLED: {
      type: "ORDER_CANCELLED",
      channels: ["EMAIL", "IN_APP"],
      template: (order) => ({
        title: "Order Cancelled",
        message: `Your order #${order.orderNumber} has been cancelled. A refund will be processed within 3-5 business days.`,
      }),
      recipients: (order) => [order.customerId],
    },
  };

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Send notifications for order status updates
   */
  async sendStatusUpdateNotifications(
    order: Order,
    newStatus: OrderStatus,
  ): Promise<void> {
    const tracer = trace.getTracer("notification-service");

    await tracer.startActiveSpan(
      "sendStatusUpdateNotifications",
      async (span) => {
        span.setAttributes({
          "order.id": order.id,
          "order.status": newStatus,
        });

        try {
          const config = this.notificationConfigs[newStatus];
          if (!config) {
            console.log(`No notification config for status: ${newStatus}`);
            return;
          }

          const { title, message } = config.template(order);
          const recipientIds = config.recipients(order);

          // Send through all configured channels
          await Promise.all(
            config.channels.map((channel) =>
              this.sendNotification(
                order.id,
                recipientIds,
                config.type,
                channel,
                title,
                message,
              ),
            ),
          );

          span.setStatus({ code: 1 }); // OK
        } catch (error) {
          span.setStatus({ code: 2, message: error.message }); // ERROR
          console.error("Notification sending failed:", error);
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Send notification through specific channel
   */
  private async sendNotification(
    orderId: string,
    userIds: string[],
    type: NotificationType,
    channel: NotificationChannel,
    title: string,
    message: string,
  ): Promise<void> {
    for (const userId of userIds) {
      // Create notification record
      const notification = await database.orderNotification.create({
        data: {
          orderId,
          userId,
          type,
          channel,
          title,
          message,
        },
      });

      // Send through channel
      try {
        switch (channel) {
          case "EMAIL":
            await this.sendEmail(userId, title, message, orderId);
            break;
          case "SMS":
            await this.sendSMS(userId, message);
            break;
          case "PUSH":
            await this.sendPushNotification(userId, title, message);
            break;
          case "IN_APP":
            // In-app notifications are stored in DB, no external call needed
            break;
        }

        // Mark as sent
        await database.orderNotification.update({
          where: { id: notification.id },
          data: { sentAt: new Date() },
        });
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }
  }

  private async sendEmail(
    userId: string,
    title: string,
    message: string,
    orderId: string,
  ): Promise<void> {
    const user = await database.user.findUnique({
      where: { id: userId },
    });

    if (!user?.email) return;

    await this.resend.emails.send({
      from: "orders@farmersmarket.com",
      to: user.email,
      subject: title,
      html: `
        <h2>${title}</h2>
        <p>${message}</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}">
            View Order Details
          </a>
        </p>
      `,
    });
  }

  private async sendSMS(userId: string, message: string): Promise<void> {
    // TODO: Implement with Twilio
    console.log("SMS notification:", message);
  }

  private async sendPushNotification(
    userId: string,
    title: string,
    message: string,
  ): Promise<void> {
    // TODO: Implement with Firebase Cloud Messaging
    console.log("Push notification:", title, message);
  }

  /**
   * Get unread notifications for user
   */
  async getUnreadNotifications(userId: string) {
    return await database.orderNotification.findMany({
      where: {
        userId,
        readAt: null,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await database.orderNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }
}
```

### 3. Real-time Event Service

```typescript
// src/lib/services/order-events.service.ts

import { EventEmitter } from "events";
import type { Order, OrderStatus } from "@prisma/client";

interface OrderEvent {
  type: "STATUS_CHANGE" | "NEW_ORDER" | "ORDER_UPDATE";
  orderId: string;
  farmId: string;
  customerId: string;
  data: any;
  timestamp: Date;
}

export class OrderEventService extends EventEmitter {
  private static instance: OrderEventService;

  private constructor() {
    super();
    this.setMaxListeners(100); // Support many concurrent listeners
  }

  static getInstance(): OrderEventService {
    if (!OrderEventService.instance) {
      OrderEventService.instance = new OrderEventService();
    }
    return OrderEventService.instance;
  }

  /**
   * Emit order status change event
   */
  emitStatusChange(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const event: OrderEvent = {
      type: "STATUS_CHANGE",
      orderId: order.id,
      farmId: order.farmId,
      customerId: order.customerId,
      data: {
        previousStatus,
        newStatus,
        order,
      },
      timestamp: new Date(),
    };

    // Emit to general listeners
    this.emit("orderStatusChange", event);

    // Emit to specific order listeners
    this.emit(`order:${order.id}:statusChange`, event);

    // Emit to farm-specific listeners
    this.emit(`farm:${order.farmId}:orderStatusChange`, event);

    // Emit to customer-specific listeners
    this.emit(`customer:${order.customerId}:orderStatusChange`, event);
  }

  /**
   * Emit new order event
   */
  emitNewOrder(order: Order): void {
    const event: OrderEvent = {
      type: "NEW_ORDER",
      orderId: order.id,
      farmId: order.farmId,
      customerId: order.customerId,
      data: { order },
      timestamp: new Date(),
    };

    this.emit("newOrder", event);
    this.emit(`farm:${order.farmId}:newOrder`, event);
  }

  /**
   * Subscribe to order updates for a specific order
   */
  subscribeToOrder(
    orderId: string,
    callback: (event: OrderEvent) => void,
  ): () => void {
    this.on(`order:${orderId}:statusChange`, callback);

    // Return unsubscribe function
    return () => {
      this.off(`order:${orderId}:statusChange`, callback);
    };
  }

  /**
   * Subscribe to all orders for a farm
   */
  subscribeToFarmOrders(
    farmId: string,
    callback: (event: OrderEvent) => void,
  ): () => void {
    const statusChangeHandler = (event: OrderEvent) => callback(event);
    const newOrderHandler = (event: OrderEvent) => callback(event);

    this.on(`farm:${farmId}:orderStatusChange`, statusChangeHandler);
    this.on(`farm:${farmId}:newOrder`, newOrderHandler);

    return () => {
      this.off(`farm:${farmId}:orderStatusChange`, statusChangeHandler);
      this.off(`farm:${farmId}:newOrder`, newOrderHandler);
    };
  }

  /**
   * Subscribe to orders for a customer
   */
  subscribeToCustomerOrders(
    customerId: string,
    callback: (event: OrderEvent) => void,
  ): () => void {
    this.on(`customer:${customerId}:orderStatusChange`, callback);

    return () => {
      this.off(`customer:${customerId}:orderStatusChange`, callback);
    };
  }
}
```

---

## 🎨 Frontend Components

### 1. Order Status Timeline

```typescript
// src/components/features/orders/OrderStatusTimeline.tsx

"use client";

import { Check, Clock, Package, Truck, MapPin } from "lucide-react";
import type { Order, OrderStatus } from "@prisma/client";

interface StatusStep {
  status: OrderStatus;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  {
    status: "PENDING",
    label: "Order Placed",
    icon: Clock,
    description: "Awaiting farm confirmation"
  },
  {
    status: "CONFIRMED",
    label: "Confirmed",
    icon: Check,
    description: "Farm has confirmed your order"
  },
  {
    status: "PREPARING",
    label: "Preparing",
    icon: Package,
    description: "Your order is being prepared"
  },
  {
    status: "READY_FOR_PICKUP",
    label: "Ready",
    icon: MapPin,
    description: "Ready for pickup"
  },
  {
    status: "COMPLETED",
    label: "Completed",
    icon: Check,
    description: "Order fulfilled"
  }
];

export function OrderStatusTimeline({ order }: { order: Order }) {
  const currentStatusIndex = STATUS_STEPS.findIndex(
    step => step.status === order.status
  );

  return (
    <div className="w-full py-6">
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-0 top-5 h-0.5 w-full bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Status steps */}
        <div className="relative flex justify-between">
          {STATUS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <div
                key={step.status}
                className="flex flex-col items-center"
              >
                {/* Icon circle */}
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full
                    border-2 bg-white transition-all duration-300
                    ${
                      isCompleted
                        ? "border-green-500 text-green-600"
                        : "border-gray-300 text-gray-400"
                    }
                    ${isCurrent ? "ring-4 ring-green-100 scale-110" : ""}
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${isCompleted ? "text-green-600" : "text-gray-500"}
                    `}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 max-w-[100px]">
                    {step.description}
                  </p>
                </div>

                {/* Timestamp */}
                {isCompleted && (
                  <p className="mt-1 text-xs text-gray-400">
                    {getTimestampForStatus(order, step.status)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getTimestampForStatus(order: Order, status: OrderStatus): string {
  const timestamps: Record<OrderStatus, Date | null> = {
    PENDING: order.createdAt,
    CONFIRMED: order.confirmedAt,
    PREPARING: order.preparingAt,
    READY_FOR_PICKUP: order.readyAt,
    OUT_FOR_DELIVERY: null,
    COMPLETED: order.completedAt,
    CANCELLED: order.cancelledAt,
    REFUNDED: null
  };

  const timestamp = timestamps[status];
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}
```

### 2. Farmer Order Management Dashboard

```typescript
// src/components/features/farmer/OrderManagementDashboard.tsx

"use client";

import { useState, useEffect } from "react";
import { OrderEventService } from "@/lib/services/order-events.service";
import { OrderStatusService } from "@/lib/services/order-status.service";
import type { Order, OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface OrderManagementDashboardProps {
  farmId: string;
  initialOrders: Order[];
}

export function OrderManagementDashboard({
  farmId,
  initialOrders
}: OrderManagementDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const statusService = new OrderStatusService();
  const eventService = OrderEventService.getInstance();

  // Real-time order updates
  useEffect(() => {
    const unsubscribe = eventService.subscribeToFarmOrders(
      farmId,
      (event) => {
        if (event.type === "NEW_ORDER") {
          setOrders(prev => [event.data.order, ...prev]);
        } else if (event.type === "STATUS_CHANGE") {
          setOrders(prev =>
            prev.map(order =>
              order.id === event.orderId
                ? { ...order, status: event.data.newStatus }
                : order
            )
          );
        }
      }
    );

    return () => unsubscribe();
  }, [farmId]);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setIsUpdating(orderId);
    try {
      await statusService.updateOrderStatus(orderId, newStatus, farmId);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status");
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredOrders = orders.filter(
    order => selectedStatus === "ALL" || order.status === selectedStatus
  );

  const orderCounts = {
    PENDING: orders.filter(o => o.status === "PENDING").length,
    CONFIRMED: orders.filter(o => o.status === "CONFIRMED").length,
    PREPARING: orders.filter(o => o.status === "PREPARING").length,
    READY_FOR_PICKUP: orders.filter(o => o.status === "READY_FOR_PICKUP").length
  };

  return (
    <div className="space-y-6">
      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStatus === "ALL" ? "primary" : "outline"}
          onClick={() => setSelectedStatus("ALL")}
        >
          All Orders ({orders.length})
        </Button>
        <Button
          variant={selectedStatus === "PENDING" ? "primary" : "outline"}
          onClick={() => setSelectedStatus("PENDING")}
        >
          Pending ({orderCounts.PENDING})
        </Button>
        <Button
          variant={selectedStatus === "CONFIRMED" ? "primary" : "outline"}
          onClick={() => setSelectedStatus("CONFIRMED")}
        >
          Confirmed ({orderCounts.CONFIRMED})
        </Button>
        <Button
          variant={selectedStatus === "PREPARING" ? "primary" : "outline"}
          onClick={() => setSelectedStatus("PREPARING")}
        >
          Preparing ({orderCounts.PREPARING})
        </Button>
        <Button
          variant={selectedStatus === "READY_FOR_PICKUP" ? "primary" : "outline"}
          onClick={() => setSelectedStatus("READY_FOR_PICKUP")}
        >
          Ready ({orderCounts.READY_FOR_PICKUP})
        </Button>
      </div>

      {/* Order cards */}
      <div className="grid gap-4">
        {filteredOrders.map(order => (
          <Card key={order.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  Order #{order.orderNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  {order.customer.name} • {order.items.length} items
                </p>
                <p className="text-lg font-bold mt-2">
                  ${order.totalAmount.toString()}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status}
                </Badge>

                {/* Action buttons based on current status */}
                {order.status === "PENDING" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, "CONFIRMED")}
                    disabled={isUpdating === order.id}
                  >
                    Confirm Order
                  </Button>
                )}
                {order.status === "CONFIRMED" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, "PREPARING")}
                    disabled={isUpdating === order.id}
                  >
                    Start Preparing
                  </Button>
                )}
                {order.status === "PREPARING" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, "READY_FOR_PICKUP")}
                    disabled={isUpdating === order.id}
                  >
                    Mark Ready
                  </Button>
                )}
                {order.status === "READY_FOR_PICKUP" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                    disabled={isUpdating === order.id}
                  >
                    Complete Order
                  </Button>
                )}
              </div>
            </div>

            {/* Order items */}
            <div className="mt-4 space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="font-medium">${item.price.toString()}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getStatusVariant(status: OrderStatus): string {
  const variants: Record<OrderStatus, string> = {
    PENDING: "warning",
    CONFIRMED: "info",
    PREPARING: "info",
    READY_FOR_PICKUP: "success",
    OUT_FOR_DELIVERY: "info",
    COMPLETED: "success",
    CANCELLED: "destructive",
    REFUNDED: "secondary"
  };

  return variants[status] || "default";
}
```

---

## 🔌 API Routes

### Order Status Update API

```typescript
// src/app/api/orders/[orderId]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OrderStatusService } from "@/lib/services/order-status.service";
import { OrderEventService } from "@/lib/services/order-events.service";
import { z } from "zod";

const UpdateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ]),
  reason: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Validation
    const body = await request.json();
    const validation = UpdateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error,
        },
        { status: 400 },
      );
    }

    const { status, reason } = validation.data;

    // Update status
    const statusService = new OrderStatusService();
    const updatedOrder = await statusService.updateOrderStatus(
      params.orderId,
      status,
      session.user.id,
      reason,
    );

    // Emit real-time event
    const eventService = OrderEventService.getInstance();
    eventService.emitStatusChange(updatedOrder, updatedOrder.status, status);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Order status update failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update order status",
      },
      { status: 500 },
    );
  }
}

// Get order status history
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const statusService = new OrderStatusService();
    const history = await statusService.getOrderStatusHistory(params.orderId);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Failed to fetch status history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch status history",
      },
      { status: 500 },
    );
  }
}
```

### Real-time Order Updates API (Server-Sent Events)

```typescript
// src/app/api/orders/events/route.ts

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { OrderEventService } from "@/lib/services/order-events.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId");
    const customerId = searchParams.get("customerId");

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const eventService = OrderEventService.getInstance();

        // Subscribe to relevant events
        let unsubscribe: () => void;

        if (farmId) {
          unsubscribe = eventService.subscribeToFarmOrders(farmId, (event) => {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          });
        } else if (customerId) {
          unsubscribe = eventService.subscribeToCustomerOrders(
            customerId,
            (event) => {
              const data = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(data));
            },
          );
        } else {
          controller.close();
          return;
        }

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 30000);

        // Cleanup on close
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          unsubscribe();
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("SSE connection failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
```

---

## 📊 Performance Targets

### Response Times

- Order status update: < 200ms (P95)
- Status history fetch: < 100ms (P95)
- Real-time event delivery: < 50ms (P95)
- Notification sending: < 500ms (P95)

### Scalability

- Support 1000+ concurrent SSE connections
- Handle 100+ order status updates per second
- Process 10,000+ notifications per minute
- Maintain < 1% notification failure rate

### Database

- < 5ms average query time
- Proper indexing on status, orderId, userId
- Efficient pagination for history

---

## 🧪 Testing Requirements

### Unit Tests (80%+ Coverage)

- OrderStatusService validation logic
- Status transition state machine
- Notification template generation
- Event emission and subscription

### Integration Tests

- Status update workflow end-to-end
- Notification delivery across channels
- Real-time event propagation
- Database transaction integrity

### E2E Tests

- Farmer confirms order → Customer receives notification
- Order progresses through all statuses
- Real-time dashboard updates
- Cancellation and refund flow

---

## 📈 Success Metrics

### Technical

- ✅ All status transitions implemented
- ✅ Real-time updates working
- ✅ 95%+ notification delivery rate
- ✅ < 200ms average response time
- ✅ Zero data inconsistencies

### Business

- ✅ Reduced customer support inquiries
- ✅ Improved farmer workflow efficiency
- ✅ Higher customer satisfaction scores
- ✅ Increased order completion rate

---

## 🚀 Deployment Strategy

### Phase 1: Database Migration (Day 1)

- Run Prisma migrations
- Backfill existing orders with default values
- Verify data integrity

### Phase 2: Service Layer (Days 2-3)

- Deploy OrderStatusService
- Deploy OrderNotificationService
- Deploy OrderEventService
- Integration testing

### Phase 3: API & Frontend (Days 4-5)

- Deploy API routes
- Deploy farmer dashboard
- Deploy customer order tracking
- Real-time features testing

### Phase 4: Monitoring & Optimization (Days 6-7)

- Set up performance monitoring
- Configure alerts
- Load testing
- Bug fixes and optimization

---

## 📚 Documentation Requirements

- [ ] API documentation for status endpoints
- [ ] Service layer architecture diagram
- [ ] Status transition state machine documentation
- [ ] Notification system documentation
- [ ] Real-time events documentation
- [ ] Farmer user guide
- [ ] Customer user guide

---

**Status**: Ready for Implementation
**Estimated Effort**: 2 weeks
**Team Size**: 2-3 developers
**Priority**: HIGH - Core marketplace feature

---

_Last Updated: Sprint 7 Kickoff_
_Next Review: Mid-sprint checkpoint (Day 7)_
