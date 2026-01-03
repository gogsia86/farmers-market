# 🏗️ Sprint 7 Technical Design Document

## Order Tracking & Management System Architecture

**Version**: 1.0  
**Sprint**: 7 - Order Tracking & Production Deployment  
**Status**: ACTIVE  
**Last Updated**: Sprint 7 Kickoff

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Data Models](#data-models)
4. [Service Layer Design](#service-layer-design)
5. [API Design](#api-design)
6. [Real-time Architecture](#real-time-architecture)
7. [Notification System](#notification-system)
8. [Frontend Architecture](#frontend-architecture)
9. [Security & Authorization](#security--authorization)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring & Observability](#monitoring--observability)
12. [Testing Strategy](#testing-strategy)
13. [Deployment Architecture](#deployment-architecture)

---

## 📊 Executive Summary

### Purpose

Design and implement a comprehensive order tracking and management system that enables real-time status updates, multi-channel notifications, and efficient farmer workflows.

### Key Components

- **Order Status Management**: State machine-based status transitions
- **Real-time Updates**: Server-Sent Events (SSE) for live order tracking
- **Notification System**: Multi-channel (email, SMS, push, in-app) notifications
- **Farmer Dashboard**: Order queue management and fulfillment workflows
- **Admin Console**: Platform-wide order oversight and intervention tools

### Success Criteria

- ✅ Real-time order status updates (<500ms latency)
- ✅ 95%+ notification delivery rate
- ✅ Support 1000+ concurrent orders
- ✅ <200ms API response time (P95)
- ✅ 95%+ test coverage

---

## 🏗️ System Architecture

### High-Level Architecture

```typescript
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Customer App  │  Farmer Dashboard  │  Admin Console  │  Mobile │
└────────┬────────────────┬────────────────┬──────────────────────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │      API Gateway (Next.js)      │
         │  /api/orders/[id]/status       │
         │  /api/orders/events (SSE)      │
         │  /api/notifications            │
         └────────────────┬────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │      APPLICATION LAYER          │
         ├─────────────────────────────────┤
         │  OrderStatusService             │
         │  OrderNotificationService       │
         │  OrderEventService              │
         │  OrderAnalyticsService          │
         └────────────────┬────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │       DATA LAYER                │
         ├─────────────────────────────────┤
         │  PostgreSQL (Prisma)            │
         │    - Orders                     │
         │    - OrderStatusHistory         │
         │    - OrderNotifications         │
         ├─────────────────────────────────┤
         │  Redis Cache                    │
         │    - Order cache                │
         │    - Session store              │
         ├─────────────────────────────────┤
         │  Event Bus (In-Memory/Redis)    │
         │    - Status changes             │
         │    - Real-time events           │
         └─────────────────────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │    EXTERNAL SERVICES            │
         ├─────────────────────────────────┤
         │  Email: Resend/SendGrid         │
         │  SMS: Twilio                    │
         │  Push: Firebase/OneSignal       │
         │  Monitoring: Azure App Insights │
         └─────────────────────────────────┘
```

### Component Interaction Flow

```typescript
// Order Status Update Flow
Customer/Farmer Action
  → API Request (PUT /api/orders/[id]/status)
    → Authentication & Authorization
      → OrderStatusService.updateOrderStatus()
        → Validate Transition (State Machine)
          → Database Transaction
            ├─ Update Order Status
            ├─ Create Status History Entry
            └─ Commit Transaction
          → OrderEventService.emitStatusChange()
            → SSE Event Broadcasting
            → Connected Clients Receive Update
          → OrderNotificationService.sendNotifications()
            ├─ Email Notification (Async)
            ├─ SMS Notification (Async)
            ├─ Push Notification (Async)
            └─ In-App Notification (DB + SSE)
      → Return Updated Order
    → Client Receives Response
  → UI Updates Automatically
```

---

## 🗄️ Data Models

### Order Status Enum

```typescript
enum OrderStatus {
  // Pre-fulfillment
  PENDING           // Order created, awaiting farm confirmation
  CONFIRMED         // Farm confirmed, preparing to start

  // Fulfillment in progress
  PREPARING         // Farm actively preparing order
  READY_FOR_PICKUP  // Ready for customer pickup
  OUT_FOR_DELIVERY  // In transit to customer (delivery orders)

  // Completed states
  COMPLETED         // Order successfully fulfilled

  // Error states
  CANCELLED         // Order cancelled by customer or farm
  REFUNDED          // Payment refunded to customer
}
```

### Status State Machine

```typescript
type StatusTransition = {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: UserRole[];
  validators: TransitionValidator[];
  notifications: NotificationType[];
};

const STATUS_TRANSITIONS: StatusTransition[] = [
  {
    from: "PENDING",
    to: "CONFIRMED",
    allowedRoles: ["FARMER", "ADMIN"],
    validators: [validateFarmOwnership, validateOrderNotExpired],
    notifications: ["ORDER_CONFIRMED"],
  },
  {
    from: "CONFIRMED",
    to: "PREPARING",
    allowedRoles: ["FARMER", "ADMIN"],
    validators: [validateFarmOwnership],
    notifications: ["ORDER_PREPARING"],
  },
  {
    from: "PREPARING",
    to: "READY_FOR_PICKUP",
    allowedRoles: ["FARMER", "ADMIN"],
    validators: [validateFarmOwnership, validateAllItemsReady],
    notifications: ["ORDER_READY"],
  },
  {
    from: "READY_FOR_PICKUP",
    to: "COMPLETED",
    allowedRoles: ["FARMER", "CUSTOMER", "ADMIN"],
    validators: [validateAuthorization],
    notifications: ["ORDER_COMPLETED"],
  },
  {
    from: "PENDING",
    to: "CANCELLED",
    allowedRoles: ["CUSTOMER", "FARMER", "ADMIN"],
    validators: [validateCancellationWindow],
    notifications: ["ORDER_CANCELLED"],
  },
  {
    from: "CONFIRMED",
    to: "CANCELLED",
    allowedRoles: ["CUSTOMER", "FARMER", "ADMIN"],
    validators: [validateCancellationWindow],
    notifications: ["ORDER_CANCELLED"],
  },
  {
    from: "PREPARING",
    to: "CANCELLED",
    allowedRoles: ["FARMER", "ADMIN"],
    validators: [validateFarmOwnership, validateCancellationReason],
    notifications: ["ORDER_CANCELLED"],
  },
  {
    from: "CANCELLED",
    to: "REFUNDED",
    allowedRoles: ["ADMIN"],
    validators: [validatePaymentExists],
    notifications: ["ORDER_REFUNDED"],
  },
];
```

### Database Schema

```prisma
// Extended Order model
model Order {
  id                String            @id @default(cuid())
  orderNumber       String            @unique
  status            OrderStatus       @default(PENDING)
  fulfillmentType   FulfillmentType   @default(PICKUP)

  // Core order data
  customerId        String
  farmId            String
  totalAmount       Decimal           @db.Decimal(10, 2)
  paymentIntentId   String?

  // Status timestamps
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

  // Metadata
  metadata          Json?

  // Relations
  customer          User              @relation("CustomerOrders", fields: [customerId], references: [id])
  farm              Farm              @relation(fields: [farmId], references: [id])
  items             OrderItem[]
  statusHistory     OrderStatusHistory[]
  notifications     OrderNotification[]

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  // Indexes for performance
  @@index([customerId])
  @@index([farmId])
  @@index([status])
  @@index([orderNumber])
  @@index([createdAt])
  @@index([farmId, status]) // Composite for farm dashboard
}

// Order status history tracking
model OrderStatusHistory {
  id          String      @id @default(cuid())
  orderId     String
  order       Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)

  fromStatus  OrderStatus?
  toStatus    OrderStatus

  changedBy   String      // User ID who made the change
  changedByRole String    // Role at time of change (for audit)
  reason      String?     // Optional reason for status change
  metadata    Json?       // Additional context (e.g., cancellation details)

  ipAddress   String?     // For audit trail
  userAgent   String?     // For audit trail

  createdAt   DateTime    @default(now())

  @@index([orderId])
  @@index([createdAt])
  @@index([changedBy])
}

// Notification tracking
model OrderNotification {
  id          String              @id @default(cuid())
  orderId     String
  order       Order               @relation(fields: [orderId], references: [id], onDelete: Cascade)

  userId      String
  user        User                @relation(fields: [userId], references: [id])

  type        NotificationType
  channel     NotificationChannel

  title       String
  message     String              @db.Text
  metadata    Json?

  // Delivery tracking
  sentAt      DateTime?
  deliveredAt DateTime?
  readAt      DateTime?
  failedAt    DateTime?
  failureReason String?

  // Retry tracking
  retryCount  Int                 @default(0)
  maxRetries  Int                 @default(3)

  createdAt   DateTime            @default(now())

  @@index([orderId])
  @@index([userId])
  @@index([sentAt])
  @@index([type])
  @@index([channel])
}

enum NotificationType {
  ORDER_CONFIRMED
  ORDER_PREPARING
  ORDER_READY
  ORDER_COMPLETED
  ORDER_CANCELLED
  ORDER_DELAYED
  ORDER_REMINDER
  ORDER_ISSUE
}

enum NotificationChannel {
  EMAIL
  SMS
  PUSH
  IN_APP
}

enum FulfillmentType {
  PICKUP
  DELIVERY
  SHIPPING
}
```

---

## 🔧 Service Layer Design

### 1. OrderStatusService

```typescript
// src/lib/services/order-status.service.ts

import { database } from "@/lib/database";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import type { Order, OrderStatus, Prisma } from "@prisma/client";

export interface StatusUpdateRequest {
  orderId: string;
  newStatus: OrderStatus;
  userId: string;
  userRole: string;
  reason?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface StatusUpdateResult {
  order: Order;
  statusHistory: OrderStatusHistory;
  notifications: OrderNotification[];
}

export class OrderStatusService {
  private readonly tracer = trace.getTracer("order-status-service");

  /**
   * Update order status with full validation and history tracking
   */
  async updateStatus(
    request: StatusUpdateRequest,
  ): Promise<StatusUpdateResult> {
    return await this.tracer.startActiveSpan(
      "updateOrderStatus",
      async (span) => {
        span.setAttributes({
          "order.id": request.orderId,
          "order.new_status": request.newStatus,
          "user.id": request.userId,
          "user.role": request.userRole,
        });

        try {
          // 1. Fetch current order with all relations
          const order = await this.getOrderWithRelations(request.orderId);

          if (!order) {
            throw new OrderNotFoundError(request.orderId);
          }

          // 2. Validate status transition
          await this.validateTransition(
            order,
            order.status,
            request.newStatus,
            request.userId,
            request.userRole,
          );

          // 3. Execute status update in transaction
          const result = await database.$transaction(async (tx) => {
            // Update order status
            const updatedOrder = await tx.order.update({
              where: { id: request.orderId },
              data: {
                status: request.newStatus,
                ...this.getStatusTimestamps(request.newStatus),
                updatedAt: new Date(),
              },
              include: {
                farm: true,
                customer: true,
                items: { include: { product: true } },
              },
            });

            // Create status history entry
            const historyEntry = await tx.orderStatusHistory.create({
              data: {
                orderId: request.orderId,
                fromStatus: order.status,
                toStatus: request.newStatus,
                changedBy: request.userId,
                changedByRole: request.userRole,
                reason: request.reason,
                metadata: request.metadata,
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
              },
            });

            return { order: updatedOrder, statusHistory: historyEntry };
          });

          // 4. Emit events and send notifications (async, non-blocking)
          this.emitStatusChangeEvent(
            result.order,
            order.status,
            request.newStatus,
          );
          const notifications = await this.scheduleNotifications(
            result.order,
            request.newStatus,
          );

          span.setStatus({ code: SpanStatusCode.OK });

          return {
            ...result,
            notifications,
          };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.recordException(error);
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Validate status transition according to state machine rules
   */
  private async validateTransition(
    order: Order,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    userId: string,
    userRole: string,
  ): Promise<void> {
    // Find valid transition
    const transition = STATUS_TRANSITIONS.find(
      (t) => t.from === fromStatus && t.to === toStatus,
    );

    if (!transition) {
      throw new InvalidStatusTransitionError(fromStatus, toStatus);
    }

    // Check role authorization
    if (!transition.allowedRoles.includes(userRole)) {
      throw new UnauthorizedStatusChangeError(userRole, fromStatus, toStatus);
    }

    // Run custom validators
    for (const validator of transition.validators) {
      const isValid = await validator(order, userId, userRole);
      if (!isValid) {
        throw new StatusValidationError(`Validation failed: ${validator.name}`);
      }
    }
  }

  /**
   * Get timestamps to update based on new status
   */
  private getStatusTimestamps(status: OrderStatus): Partial<Order> {
    const now = new Date();
    const timestamps: any = {};

    switch (status) {
      case "CONFIRMED":
        timestamps.confirmedAt = now;
        // Estimate ready time (2 hours from confirmation)
        timestamps.estimatedReadyAt = new Date(
          now.getTime() + 2 * 60 * 60 * 1000,
        );
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

  /**
   * Get order with all necessary relations
   */
  private async getOrderWithRelations(orderId: string) {
    return await database.order.findUnique({
      where: { id: orderId },
      include: {
        farm: true,
        customer: true,
        items: { include: { product: true } },
      },
    });
  }

  /**
   * Emit status change event to event bus
   */
  private emitStatusChangeEvent(
    order: Order,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): void {
    const eventService = OrderEventService.getInstance();
    eventService.emitStatusChange(order, fromStatus, toStatus);
  }

  /**
   * Schedule notifications for status change
   */
  private async scheduleNotifications(
    order: Order,
    newStatus: OrderStatus,
  ): Promise<OrderNotification[]> {
    const notificationService = new OrderNotificationService();
    return await notificationService.sendStatusUpdateNotifications(
      order,
      newStatus,
    );
  }

  /**
   * Get order status history
   */
  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return await database.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Get orders by status for a farm (farmer dashboard)
   */
  async getOrdersByStatus(
    farmId: string,
    statuses: OrderStatus | OrderStatus[],
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: "createdAt" | "totalAmount";
      sortOrder?: "asc" | "desc";
    },
  ): Promise<{ orders: Order[]; total: number }> {
    const statusArray = Array.isArray(statuses) ? statuses : [statuses];
    const {
      limit = 50,
      offset = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options || {};

    const [orders, total] = await Promise.all([
      database.order.findMany({
        where: {
          farmId,
          status: { in: statusArray },
        },
        include: {
          customer: {
            select: { id: true, name: true, email: true, image: true },
          },
          items: {
            include: { product: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      database.order.count({
        where: {
          farmId,
          status: { in: statusArray },
        },
      }),
    ]);

    return { orders, total };
  }

  /**
   * Bulk status update (admin only)
   */
  async bulkUpdateStatus(
    orderIds: string[],
    newStatus: OrderStatus,
    userId: string,
    userRole: string,
    reason?: string,
  ): Promise<BulkUpdateResult> {
    if (userRole !== "ADMIN") {
      throw new UnauthorizedError("Bulk updates require admin role");
    }

    const results: BulkUpdateResult = {
      successful: [],
      failed: [],
    };

    // Process updates in parallel with concurrency limit
    const concurrency = 5;
    for (let i = 0; i < orderIds.length; i += concurrency) {
      const batch = orderIds.slice(i, i + concurrency);

      await Promise.allSettled(
        batch.map(async (orderId) => {
          try {
            const result = await this.updateStatus({
              orderId,
              newStatus,
              userId,
              userRole,
              reason,
            });
            results.successful.push({
              orderId,
              order: result.order,
            });
          } catch (error) {
            results.failed.push({
              orderId,
              error: error.message,
            });
          }
        }),
      );
    }

    return results;
  }
}

// Custom error classes
export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order ${orderId} not found`);
    this.name = "OrderNotFoundError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Invalid status transition from ${from} to ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export class UnauthorizedStatusChangeError extends Error {
  constructor(role: string, from: OrderStatus, to: OrderStatus) {
    super(`Role ${role} not authorized to change status from ${from} to ${to}`);
    this.name = "UnauthorizedStatusChangeError";
  }
}

export class StatusValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatusValidationError";
  }
}
```

### 2. OrderNotificationService

```typescript
// src/lib/services/order-notification.service.ts

import { database } from "@/lib/database";
import { Resend } from "resend";
import type {
  Order,
  OrderStatus,
  NotificationType,
  NotificationChannel,
} from "@prisma/client";

interface NotificationTemplate {
  title: string;
  message: string;
  emailSubject: string;
  emailHtml: string;
  smsMessage: string;
}

export class OrderNotificationService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Send notifications for order status update
   */
  async sendStatusUpdateNotifications(
    order: Order,
    newStatus: OrderStatus,
  ): Promise<OrderNotification[]> {
    const config = this.getNotificationConfig(newStatus);
    if (!config) return [];

    const template = this.generateTemplate(order, newStatus);
    const recipients = this.getRecipients(order, newStatus);
    const notifications: OrderNotification[] = [];

    for (const channel of config.channels) {
      for (const userId of recipients) {
        const notification = await this.sendNotification({
          orderId: order.id,
          userId,
          type: config.type,
          channel,
          title: template.title,
          message: template.message,
          template,
        });

        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Send notification through specific channel
   */
  private async sendNotification(params: {
    orderId: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
    template: NotificationTemplate;
  }): Promise<OrderNotification> {
    // Create notification record
    const notification = await database.orderNotification.create({
      data: {
        orderId: params.orderId,
        userId: params.userId,
        type: params.type,
        channel: params.channel,
        title: params.title,
        message: params.message,
      },
    });

    // Send through channel (async, don't wait)
    this.deliverNotification(notification, params.template)
      .then(() => {
        database.orderNotification.update({
          where: { id: notification.id },
          data: {
            sentAt: new Date(),
            deliveredAt: new Date(),
          },
        });
      })
      .catch((error) => {
        database.orderNotification.update({
          where: { id: notification.id },
          data: {
            failedAt: new Date(),
            failureReason: error.message,
            retryCount: { increment: 1 },
          },
        });
      });

    return notification;
  }

  /**
   * Deliver notification through channel
   */
  private async deliverNotification(
    notification: OrderNotification,
    template: NotificationTemplate,
  ): Promise<void> {
    const user = await database.user.findUnique({
      where: { id: notification.userId },
    });

    if (!user) return;

    switch (notification.channel) {
      case "EMAIL":
        await this.sendEmail(user.email, template);
        break;
      case "SMS":
        if (user.phone) {
          await this.sendSMS(user.phone, template.smsMessage);
        }
        break;
      case "PUSH":
        await this.sendPushNotification(
          user.id,
          notification.title,
          notification.message,
        );
        break;
      case "IN_APP":
        // In-app notifications are handled via database + SSE
        break;
    }
  }

  /**
   * Generate notification template based on status
   */
  private generateTemplate(
    order: Order,
    status: OrderStatus,
  ): NotificationTemplate {
    const templates: Record<OrderStatus, NotificationTemplate> = {
      CONFIRMED: {
        title: "Order Confirmed! 🎉",
        message: `Your order #${order.orderNumber} has been confirmed by ${order.farm.name} and will be prepared soon.`,
        emailSubject: `Order #${order.orderNumber} Confirmed`,
        emailHtml: this.generateEmailHtml(order, "confirmed"),
        smsMessage: `Order #${order.orderNumber} confirmed! Ready at ${order.estimatedReadyAt || "soon"}.`,
      },
      PREPARING: {
        title: "Order Being Prepared 👨‍🌾",
        message: `Your order #${order.orderNumber} is now being prepared by ${order.farm.name}.`,
        emailSubject: `Order #${order.orderNumber} - Being Prepared`,
        emailHtml: this.generateEmailHtml(order, "preparing"),
        smsMessage: `Your order #${order.orderNumber} is being prepared!`,
      },
      READY_FOR_PICKUP: {
        title: "Order Ready for Pickup! ✅",
        message: `Your order #${order.orderNumber} is ready! Pickup at ${order.pickupLocation}. ${order.pickupInstructions || ""}`,
        emailSubject: `Order #${order.orderNumber} - Ready for Pickup!`,
        emailHtml: this.generateEmailHtml(order, "ready"),
        smsMessage: `Order #${order.orderNumber} ready at ${order.pickupLocation}!`,
      },
      COMPLETED: {
        title: "Order Completed 🌟",
        message: `Thank you for your order! We hope you enjoyed your fresh farm products from ${order.farm.name}.`,
        emailSubject: `Order #${order.orderNumber} - Completed`,
        emailHtml: this.generateEmailHtml(order, "completed"),
        smsMessage: `Thanks for your order! Please leave a review.`,
      },
      CANCELLED: {
        title: "Order Cancelled",
        message: `Your order #${order.orderNumber} has been cancelled. A refund will be processed within 3-5 business days.`,
        emailSubject: `Order #${order.orderNumber} - Cancelled`,
        emailHtml: this.generateEmailHtml(order, "cancelled"),
        smsMessage: `Order #${order.orderNumber} cancelled. Refund processing.`,
      },
    };

    return templates[status] || templates.CONFIRMED;
  }

  private generateEmailHtml(order: Order, status: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 Farmers Market</h1>
            </div>
            <div class="content">
              <h2>Order #${order.orderNumber}</h2>
              <p>Status: <strong>${status.toUpperCase()}</strong></p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Farm:</strong> ${order.farm.name}</p>
                <p><strong>Total:</strong> $${order.totalAmount.toString()}</p>
                <p><strong>Items:</strong> ${order.items.length} products</p>
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">
                View Order Details
              </a>
            </div>
            <div class="footer">
              <p>© 2024 Farmers Market. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private async sendEmail(
    to: string,
    template: NotificationTemplate,
  ): Promise<void> {
    await this.resend.emails.send({
      from: "orders@farmersmarket.com",
      to,
      subject: template.emailSubject,
      html: template.emailHtml,
    });
  }

  private async sendSMS(to: string, message: string): Promise<void> {
    // TODO: Implement with Twilio
    console.log(`SMS to ${to}: ${message}`);
  }

  private async sendPushNotification(
    userId: string,
    title: string,
    message: string,
  ): Promise<void> {
    // TODO: Implement with Firebase Cloud Messaging
    console.log(`Push to ${userId}: ${title} - ${message}`);
  }

  private getNotificationConfig(status: OrderStatus) {
    // Configuration for which channels to use per status
    const configs = {
      CONFIRMED: { type: "ORDER_CONFIRMED", channels: ["EMAIL", "IN_APP"] },
      PREPARING: { type: "ORDER_PREPARING", channels: ["IN_APP"] },
      READY_FOR_PICKUP: {
        type: "ORDER_READY",
        channels: ["EMAIL", "SMS", "PUSH", "IN_APP"],
      },
      COMPLETED: { type: "ORDER_COMPLETED", channels: ["EMAIL", "IN_APP"] },
      CANCELLED: { type: "ORDER_CANCELLED", channels: ["EMAIL", "IN_APP"] },
    };

    return configs[status];
  }

  private getRecipients(order: Order, status: OrderStatus): string[] {
    // For most statuses, notify the customer
    const recipients = [order.customerId];

    // For new orders, also notify farmer
    if (status === "PENDING") {
      recipients.push(order.farm.ownerId);
    }

    return recipients;
  }
}
```

---

## 🔌 API Design

### REST Endpoints

```typescript
// Order Status Management
PUT / api / orders / [orderId] / status; // Update order status
GET / api / orders / [orderId] / status; // Get status history
POST / api / orders / [orderId] / cancel; // Cancel order
POST / api / orders / bulk / status; // Bulk status update (admin)

// Order Tracking
GET / api / orders / [orderId] / track; // Get order tracking details
GET / api / orders / [orderId] / timeline; // Get order timeline

// Notifications
GET / api / notifications; // Get user notifications
PUT / api / notifications / [id] / read; // Mark notification as read
PUT / api / notifications / read - all; // Mark all as read
GET / api / notifications / preferences; // Get notification preferences
PUT / api / notifications / preferences; // Update preferences

// Real-time
GET / api / orders / events; // SSE event stream
```

### API Request/Response Formats

```typescript
// Update Order Status Request
interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
  metadata?: Record<string, any>;
}

// Update Order Status Response
interface UpdateOrderStatusResponse {
  success: boolean;
  data?: {
    order: Order;
    statusHistory: OrderStatusHistory;
    estimatedReadyAt?: Date;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Get Order Tracking Response
interface OrderTrackingResponse {
  success: boolean;
  data?: {
    order: Order;
    currentStatus: OrderStatus;
    statusHistory: OrderStatusHistory[];
    estimatedReadyAt?: Date;
    estimatedPickupAt?: Date;
    notifications: OrderNotification[];
  };
}

// SSE Event Format
interface OrderEvent {
  event: "statusChange" | "newOrder" | "orderUpdate";
  data: {
    orderId: string;
    orderNumber: string;
    status: OrderStatus;
    previousStatus?: OrderStatus;
    timestamp: string;
    order?: Partial<Order>;
  };
}
```

---

## 🚀 Real-time Architecture

### Server-Sent Events (SSE) Implementation

```typescript
// src/app/api/orders/events/route.ts

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { OrderEventService } from "@/lib/services/order-events.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const farmId = searchParams.get("farmId");
  const customerId = searchParams.get("customerId");

  const encoder = new TextEncoder();
  const eventService = OrderEventService.getInstance();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`),
      );

      // Subscribe to events
      const unsubscribe = farmId
        ? eventService.subscribeToFarmOrders(farmId, (event) => {
            const message = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(message));
          })
        : eventService.subscribeToCustomerOrders(customerId!, (event) => {
            const message = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(message));
          });

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 30000);

      // Cleanup on disconnect
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
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
```

### Client-Side SSE Hook

```typescript
// src/hooks/useOrderEvents.ts

import { useEffect, useState } from "react";

interface OrderEvent {
  type: string;
  orderId: string;
  status: string;
  timestamp: string;
}

export function useOrderEvents(params: {
  farmId?: string;
  customerId?: string;
}) {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (params.farmId) searchParams.set("farmId", params.farmId);
    if (params.customerId) searchParams.set("customerId", params.customerId);

    const eventSource = new EventSource(`/api/orders/events?${searchParams}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "connected") {
        setEvents((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 events
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [params.farmId, params.customerId]);

  return { events, isConnected };
}
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
Order Tracking Page
├── OrderStatusTimeline
│   ├── StatusStep (repeated)
│   └── StatusConnection (progress line)
├── OrderDetails
│   ├── OrderHeader
│   ├── OrderItems
│   └── OrderTotal
├── DeliveryInfo
│   ├── PickupLocation
│   └── PickupInstructions
└── OrderActions
    ├── CancelOrderButton
    ├── ContactFarmButton
    └── HelpButton

Farmer Dashboard
├── OrderFilters
│   ├── StatusFilter
│   ├── DateFilter
│   └── SearchBar
├── OrderStats
│   ├── PendingCount
│   ├── PreparingCount
│   └── ReadyCount
├── OrderList
│   ├── OrderCard (repeated)
│   │   ├── OrderHeader
│   │   ├── OrderItems
│   │   ├── CustomerInfo
│   │   └── QuickActions
│   └── BulkActions
└── OrderDetailsModal
    ├── FullOrderInfo
    ├── StatusHistory
    └── CustomerContact
```

### State Management

```typescript
// Use React Server Components + Server Actions for state
// Optimistic updates with useOptimistic

// Example: Order status update with optimistic UI
"use client";

import { useOptimistic } from "react";
import { updateOrderStatus } from "@/app/actions/orders";

export function OrderStatusButton({ order }) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    order.status,
    (state, newStatus) => newStatus
  );

  async function handleStatusUpdate(newStatus) {
    setOptimisticStatus(newStatus);
    await updateOrderStatus(order.id, newStatus);
  }

  return (
    <button onClick={() => handleStatusUpdate("PREPARING")}>
      Start Preparing (Current: {optimisticStatus})
    </button>
  );
}
```

---

## 🔒 Security & Authorization

### Role-Based Access Control

```typescript
// Authorization matrix
const AUTHORIZATION_MATRIX = {
  viewOrder: ["CUSTOMER", "FARMER", "ADMIN"],
  updateStatus: {
    PENDING_TO_CONFIRMED: ["FARMER", "ADMIN"],
    CONFIRMED_TO_PREPARING: ["FARMER", "ADMIN"],
    PREPARING_TO_READY: ["FARMER", "ADMIN"],
    READY_TO_COMPLETED: ["FARMER", "CUSTOMER", "ADMIN"],
    ANY_TO_CANCELLED: ["CUSTOMER", "FARMER", "ADMIN"],
    CANCELLED_TO_REFUNDED: ["ADMIN"],
  },
  cancelOrder: ["CUSTOMER", "FARMER", "ADMIN"],
  refundOrder: ["ADMIN"],
  bulkUpdate: ["ADMIN"],
};

// Authorization middleware
async function authorizeOrderAccess(
  orderId: string,
  userId: string,
  action: string,
): Promise<boolean> {
  const order = await database.order.findUnique({
    where: { id: orderId },
    include: { farm: true },
  });

  const user = await database.user.findUnique({
    where: { id: userId },
  });

  if (!order || !user) return false;

  // Check ownership
  if (order.customerId === userId) return true;
  if (order.farm.ownerId === userId) return true;
  if (user.role === "ADMIN") return true;

  return false;
}
```

### Data Protection

```typescript
// Sensitive data filtering
function sanitizeOrderForClient(order: Order, userId: string): Partial<Order> {
  const isCustomer = order.customerId === userId;
  const isFarmer = order.farm.ownerId === userId;
  const isAdmin = /* check admin role */;

  if (isCustomer || isFarmer || isAdmin) {
    return order; // Full access
  }

  // Limited public view
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt
    // Hide customer info, payment details, etc.
  };
}
```

---

## ⚡ Performance Optimization

### Caching Strategy

```typescript
// Multi-layer caching
export class OrderCacheService {
  // L1: In-memory cache (very fast, limited size)
  private memoryCache = new Map<string, Order>();

  // L2: Redis cache (fast, larger capacity)
  async get(orderId: string): Promise<Order | null> {
    // Check memory cache
    if (this.memoryCache.has(orderId)) {
      return this.memoryCache.get(orderId)!;
    }

    // Check Redis
    const cached = await redis.get(`order:${orderId}`);
    if (cached) {
      const order = JSON.parse(cached);
      this.memoryCache.set(orderId, order);
      return order;
    }

    // Fetch from database
    const order = await database.order.findUnique({
      where: { id: orderId },
    });

    if (order) {
      // Cache for 5 minutes
      await redis.set(`order:${orderId}`, JSON.stringify(order), { ex: 300 });
      this.memoryCache.set(orderId, order);
    }

    return order;
  }

  async invalidate(orderId: string): Promise<void> {
    this.memoryCache.delete(orderId);
    await redis.del(`order:${orderId}`);
  }
}
```

### Database Optimization

```typescript
// Optimized queries with proper indexing
// Already defined in schema:
// @@index([farmId, status]) - For farmer dashboard
// @@index([customerId]) - For customer orders
// @@index([status]) - For status-based filtering

// Use connection pooling
const DATABASE_CONFIG = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    },
  },
};

// Use read replicas for heavy read operations
async function getOrdersForDashboard(farmId: string) {
  // Use read replica for dashboard queries
  return await database.$queryRaw`
    SELECT * FROM "Order"
    WHERE "farmId" = ${farmId}
    ORDER BY "createdAt" DESC
    LIMIT 100
  `;
}
```

---

## 📊 Monitoring & Observability

### OpenTelemetry Instrumentation

```typescript
// Comprehensive tracing
import { trace, SpanStatusCode } from "@opentelemetry/api";

async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const tracer = trace.getTracer("order-service");

  return await tracer.startActiveSpan("updateOrderStatus", async (span) => {
    span.setAttributes({
      "order.id": orderId,
      "order.new_status": newStatus,
      "service.name": "order-status-service",
    });

    try {
      // Business logic
      const result = await performUpdate();

      span.setStatus({ code: SpanStatusCode.OK });
      span.setAttributes({
        "order.updated": true,
        "order.previous_status": result.previousStatus,
      });

      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Key Metrics to Track

```typescript
// Custom metrics
const metrics = {
  // Performance metrics
  "order.status.update.duration": histogram(),
  "order.notification.send.duration": histogram(),
  "order.api.response.time": histogram(),

  // Business metrics
  "order.status.changes": counter(),
  "order.notifications.sent": counter(),
  "order.notifications.failed": counter(),
  "order.cancellations": counter(),

  // System metrics
  "sse.connections.active": gauge(),
  "database.connections.active": gauge(),
  "cache.hit.rate": gauge(),
};
```

### Alert Configuration

```yaml
alerts:
  - name: High Order Update Latency
    condition: order.status.update.duration.p95 > 500ms
    severity: warning

  - name: Notification Delivery Failure
    condition: order.notifications.failed / order.notifications.sent > 0.05
    severity: critical

  - name: Database Connection Pool Exhaustion
    condition: database.connections.active >= 9
    severity: warning

  - name: SSE Connection Drop Rate
    condition: sse.connections.dropped / sse.connections.total > 0.1
    severity: warning
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Example: OrderStatusService tests
describe("OrderStatusService", () => {
  describe("updateStatus", () => {
    it("should update order status with valid transition", async () => {
      const service = new OrderStatusService();
      const order = createMockOrder({ status: "PENDING" });

      const result = await service.updateStatus({
        orderId: order.id,
        newStatus: "CONFIRMED",
        userId: "farmer-123",
        userRole: "FARMER",
      });

      expect(result.order.status).toBe("CONFIRMED");
      expect(result.order.confirmedAt).toBeDefined();
      expect(result.statusHistory).toBeDefined();
    });

    it("should throw error for invalid transition", async () => {
      const service = new OrderStatusService();
      const order = createMockOrder({ status: "COMPLETED" });

      await expect(
        service.updateStatus({
          orderId: order.id,
          newStatus: "PENDING",
          userId: "farmer-123",
          userRole: "FARMER",
        }),
      ).rejects.toThrow(InvalidStatusTransitionError);
    });

    it("should enforce role-based authorization", async () => {
      const service = new OrderStatusService();
      const order = createMockOrder({ status: "PENDING" });

      await expect(
        service.updateStatus({
          orderId: order.id,
          newStatus: "CONFIRMED",
          userId: "customer-123",
          userRole: "CUSTOMER",
        }),
      ).rejects.toThrow(UnauthorizedStatusChangeError);
    });
  });
});
```

### Integration Tests

```typescript
// Example: Status update integration test
describe("Order Status Update Integration", () => {
  it("should complete full status update flow", async () => {
    // Create test order
    const order = await createTestOrder();

    // Farmer confirms order
    const response1 = await fetch(`/api/orders/${order.id}/status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });

    expect(response1.status).toBe(200);
    const data1 = await response1.json();
    expect(data1.data.order.status).toBe("CONFIRMED");

    // Verify notification was sent
    const notifications = await database.orderNotification.findMany({
      where: { orderId: order.id, type: "ORDER_CONFIRMED" },
    });
    expect(notifications.length).toBeGreaterThan(0);

    // Verify status history was created
    const history = await database.orderStatusHistory.findMany({
      where: { orderId: order.id },
    });
    expect(history).toHaveLength(1);
    expect(history[0].toStatus).toBe("CONFIRMED");
  });
});
```

### E2E Tests

```typescript
// Example: Complete order lifecycle E2E test
test("complete order lifecycle from placement to completion", async ({
  page,
}) => {
  // Customer places order
  await page.goto("/farms/test-farm");
  await page.click('[data-testid="add-to-cart"]');
  await page.goto("/cart");
  await page.click('[data-testid="checkout"]');
  await fillPaymentDetails(page);
  await page.click('[data-testid="place-order"]');

  // Wait for order confirmation
  await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  const orderNumber = await page
    .locator('[data-testid="order-number"]')
    .textContent();

  // Farmer confirms order
  await loginAsFarmer(page);
  await page.goto("/farmer/orders");
  await page.click(`[data-order="${orderNumber}"] [data-action="confirm"]`);
  await expect(
    page.locator(`[data-order="${orderNumber}"] [data-status="CONFIRMED"]`),
  ).toBeVisible();

  // Farmer marks as preparing
  await page.click(`[data-order="${orderNumber}"] [data-action="prepare"]`);
  await expect(
    page.locator(`[data-order="${orderNumber}"] [data-status="PREPARING"]`),
  ).toBeVisible();

  // Farmer marks as ready
  await page.click(`[data-order="${orderNumber}"] [data-action="ready"]`);
  await expect(
    page.locator(
      `[data-order="${orderNumber}"] [data-status="READY_FOR_PICKUP"]`,
    ),
  ).toBeVisible();

  // Customer views order
  await loginAsCustomer(page);
  await page.goto("/orders");
  await expect(
    page.locator(
      `[data-order="${orderNumber}"] [data-status="READY_FOR_PICKUP"]`,
    ),
  ).toBeVisible();

  // Verify notification
  await page.click('[data-testid="notifications"]');
  await expect(
    page.locator(`text="Order #${orderNumber} is ready"`),
  ).toBeVisible();
});
```

---

## 🚀 Deployment Architecture

### Infrastructure Components

```yaml
# Production deployment architecture
services:
  web:
    image: farmersmarket/web:latest
    replicas: 3
    resources:
      limits: { cpu: 1, memory: 2Gi }
      requests: { cpu: 0.5, memory: 1Gi }
    env:
      - DATABASE_URL
      - REDIS_URL
      - RESEND_API_KEY
    healthcheck:
      path: /api/health
      interval: 30s
      timeout: 10s
      retries: 3

  database:
    image: postgres:16
    replicas: 1
    resources:
      limits: { cpu: 2, memory: 4Gi }
    volumes:
      - postgres-data:/var/lib/postgresql/data
    backup:
      schedule: "0 2 * * *" # Daily at 2 AM
      retention: 30 days

  redis:
    image: redis:7
    replicas: 1
    resources:
      limits: { cpu: 1, memory: 2Gi }
    persistence: enabled

  monitoring:
    - azure-app-insights
    - opentelemetry-collector
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Tests
        run: |
          npm ci
          npm run test:all
          npm run test:e2e

      - name: Build
        run: |
          npm run build

      - name: Run Migrations
        run: |
          npx prisma migrate deploy

      - name: Deploy to Production
        run: |
          vercel deploy --prod

      - name: Health Check
        run: |
          curl -f https://farmersmarket.com/api/health || exit 1

      - name: Smoke Tests
        run: |
          npm run test:smoke
```

---

## 📈 Success Metrics

### Technical Metrics

- ✅ API response time: <200ms (P95)
- ✅ Database query time: <50ms (P95)
- ✅ SSE event delivery: <500ms
- ✅ Notification delivery rate: >98%
- ✅ Test coverage: >95%
- ✅ Zero data inconsistencies
- ✅ System uptime: 99.9%

### Business Metrics

- ✅ Order fulfillment time: -30% reduction
- ✅ Customer satisfaction: >4.5/5
- ✅ Farmer efficiency: +25% improvement
- ✅ Support ticket volume: -40% reduction
- ✅ Order completion rate: >95%

---

**Status**: READY FOR IMPLEMENTATION  
**Estimated Timeline**: 2 weeks  
**Team Requirements**: 2-3 full-stack developers  
**Agricultural Consciousness**: 🌾 MAXIMUM  
**Divine Precision**: ⚡ ENGAGED
