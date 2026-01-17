# 🎯 Sentry Integration for Critical Paths
## Comprehensive Monitoring Guide for High-Impact Features

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Critical Paths to Monitor](#critical-paths-to-monitor)
3. [Integration Patterns](#integration-patterns)
4. [Service-Specific Examples](#service-specific-examples)
5. [API Route Integration](#api-route-integration)
6. [Error Tracking Best Practices](#error-tracking-best-practices)
7. [Performance Monitoring](#performance-monitoring)
8. [Checklist](#checklist)

---

## Overview

This guide provides patterns and examples for integrating Sentry monitoring into critical business paths. The goal is to have comprehensive visibility into errors, performance issues, and user experience problems in high-impact features.

### Critical Success Metrics

- **Error Detection Rate**: 100% of errors in critical paths captured
- **Performance Visibility**: All key transactions tracked
- **Context Richness**: Every event includes user, transaction, and business context
- **Alert Actionability**: Alerts include enough context for immediate action

---

## Critical Paths to Monitor

### 🔴 Tier 1: Revenue-Critical (Highest Priority)

1. **Payment Processing**
   - Payment intent creation
   - Payment confirmation
   - Refund processing
   - Payment method updates

2. **Order Management**
   - Order creation
   - Order status updates
   - Order cancellation
   - Order fulfillment

3. **Checkout Flow**
   - Cart validation
   - Checkout session creation
   - Order submission
   - Payment completion

### 🟡 Tier 2: User Experience Critical

4. **Authentication**
   - Login/logout
   - Registration
   - Password reset
   - Session management

5. **Product Management**
   - Product creation (farmers)
   - Product updates
   - Inventory management
   - Product search

6. **Farm Management**
   - Farm registration
   - Farm profile updates
   - Verification process

### 🟢 Tier 3: Operational

7. **Email Notifications**
   - Order confirmations
   - Status updates
   - Marketing emails

8. **Background Jobs**
   - Inventory sync
   - Report generation
   - Data cleanup

---

## Integration Patterns

### Pattern 1: Service Layer Integration

For business logic in service classes:

```typescript
// lib/services/example.service.ts
import {
  addBreadcrumb,
  trackError,
  trackDatabaseError,
  withPerformanceTracking,
} from "@/lib/monitoring/sentry-utils";
import * as Sentry from "@sentry/nextjs";

export class ExampleService {
  /**
   * Critical business operation with comprehensive tracking
   */
  async performCriticalOperation(data: OperationData): Promise<Result> {
    return withPerformanceTracking(
      "service.operation.critical",
      async () => {
        try {
          // Add breadcrumb at operation start
          addBreadcrumb({
            category: "business_logic",
            message: "Starting critical operation",
            level: "info",
            data: {
              operationId: data.id,
              userId: data.userId,
            },
          });

          // Perform validation
          const validation = this.validate(data);
          if (!validation.isValid) {
            addBreadcrumb({
              category: "validation",
              message: "Validation failed",
              level: "warning",
              data: { errors: validation.errors },
            });

            throw new ValidationError("Invalid data", validation.errors);
          }

          // Database operations with error tracking
          const result = await this.executeOperation(data);

          // Success breadcrumb
          addBreadcrumb({
            category: "business_logic",
            message: "Critical operation completed",
            level: "info",
            data: { resultId: result.id },
          });

          // Track important success metrics
          Sentry.captureMessage("Critical operation successful", {
            level: "info",
            tags: {
              feature: "critical_feature",
              action: "operation_completed",
            },
            contexts: {
              operation: {
                id: result.id,
                duration: Date.now() - startTime,
                itemCount: data.items.length,
              },
            },
          });

          return result;
        } catch (error) {
          // Track the error with full context
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            trackDatabaseError(error, "ExampleService.performCriticalOperation", {
              operation: "critical_operation",
              data: data.id,
            });
          } else {
            trackError(error as Error, {
              feature: "critical_feature",
              action: "operation_failed",
              data: data.id,
            });
          }

          // Re-throw after tracking
          throw error;
        }
      },
      {
        tags: {
          feature: "critical_feature",
          service: "example",
        },
      },
    );
  }

  private async executeOperation(data: OperationData): Promise<Result> {
    try {
      const result = await database.model.create({ data });
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        trackDatabaseError(error, "executeOperation", { dataId: data.id });
      }
      throw error;
    }
  }
}
```

### Pattern 2: API Route Integration

For Next.js API routes:

```typescript
// app/api/critical-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  addBreadcrumb,
  setUserContext,
  trackApiError,
  withPerformanceTracking,
} from "@/lib/monitoring/sentry-utils";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withPerformanceTracking(
    "api.critical-endpoint.post",
    async () => {
      try {
        // 1. Authentication
        const session = await auth();

        if (!session?.user?.id) {
          addBreadcrumb({
            category: "auth",
            message: "Unauthorized access attempt",
            level: "warning",
          });

          return NextResponse.json(
            {
              success: false,
              error: { code: "UNAUTHORIZED", message: "Authentication required" },
            },
            { status: 401 },
          );
        }

        // 2. Set user context for all subsequent events
        setUserContext({
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        });

        addBreadcrumb({
          category: "api",
          message: "API request started",
          level: "info",
          data: { endpoint: "critical-endpoint", userId: session.user.id },
        });

        // 3. Validation
        const body = await request.json();
        const validation = RequestSchema.safeParse(body);

        if (!validation.success) {
          addBreadcrumb({
            category: "validation",
            message: "Request validation failed",
            level: "warning",
            data: { errors: validation.error.errors },
          });

          trackApiError(
            new Error("Validation failed"),
            request,
            {
              errorCode: "VALIDATION_ERROR",
              validationErrors: validation.error.errors,
            },
          );

          return NextResponse.json(
            {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request",
                details: validation.error.errors,
              },
            },
            { status: 400 },
          );
        }

        // 4. Business logic
        const result = await service.performOperation(validation.data);

        // 5. Success tracking
        Sentry.captureMessage("Critical endpoint success", {
          level: "info",
          tags: {
            endpoint: "critical-endpoint",
            action: "success",
          },
          contexts: {
            operation: {
              userId: session.user.id,
              resultId: result.id,
            },
          },
        });

        return NextResponse.json({
          success: true,
          data: result,
        });
      } catch (error) {
        // 6. Error tracking
        trackApiError(
          error instanceof Error ? error : new Error(String(error)),
          request,
          {
            errorCode: "OPERATION_FAILED",
            feature: "critical_feature",
          },
        );

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INTERNAL_ERROR",
              message: error instanceof Error ? error.message : "Operation failed",
            },
          },
          { status: 500 },
        );
      }
    },
    { tags: { endpoint: "critical-endpoint", method: "POST" } },
  );
}
```

### Pattern 3: Server Action Integration

For Next.js server actions:

```typescript
// app/actions/critical.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  addBreadcrumb,
  setUserContext,
  trackError,
  withPerformanceTracking,
} from "@/lib/monitoring/sentry-utils";
import * as Sentry from "@sentry/nextjs";

export async function performCriticalAction(formData: FormData) {
  return withPerformanceTracking(
    "action.critical",
    async () => {
      try {
        // 1. Auth
        const session = await auth();
        if (!session?.user) {
          return {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Login required" },
          };
        }

        setUserContext({
          id: session.user.id,
          email: session.user.email,
        });

        addBreadcrumb({
          category: "action",
          message: "Server action started",
          level: "info",
        });

        // 2. Extract and validate
        const data = extractFormData(formData);
        const validation = Schema.safeParse(data);

        if (!validation.success) {
          trackError(new Error("Server action validation failed"), {
            validationErrors: validation.error.errors,
          });

          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              details: validation.error.errors,
            },
          };
        }

        // 3. Execute
        const result = await service.execute(validation.data);

        // 4. Revalidate cache
        revalidatePath("/critical-path");

        // 5. Track success
        Sentry.captureMessage("Server action completed", {
          level: "info",
          tags: { action: "critical_action" },
        });

        return { success: true, data: result };
      } catch (error) {
        trackError(error as Error, { action: "critical_action" });
        return {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Action failed" },
        };
      }
    },
    { tags: { action: "critical" } },
  );
}
```

---

## Service-Specific Examples

### Order Service Integration

```typescript
// lib/services/order.service.ts
import {
  addBreadcrumb,
  trackError,
  trackDatabaseError,
  withPerformanceTracking,
} from "@/lib/monitoring/sentry-utils";
import * as Sentry from "@sentry/nextjs";

export class OrderService {
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    return withPerformanceTracking(
      "order.create",
      async () => {
        try {
          addBreadcrumb({
            category: "order",
            message: "Order creation started",
            level: "info",
            data: {
              customerId: request.customerId,
              farmId: request.farmId,
              itemCount: request.items.length,
              total: request.total,
            },
          });

          // Validate inventory
          const inventoryCheck = await this.validateInventory(request.items);
          if (!inventoryCheck.available) {
            addBreadcrumb({
              category: "inventory",
              message: "Insufficient inventory",
              level: "warning",
              data: { unavailableItems: inventoryCheck.unavailable },
            });

            throw new ValidationError("Insufficient inventory");
          }

          // Create order in transaction
          const order = await database.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
              data: {
                customerId: request.customerId,
                farmId: request.farmId,
                status: "PENDING",
                total: request.total,
                items: {
                  create: request.items,
                },
              },
              include: { items: true, customer: true, farm: true },
            });

            // Update inventory
            await this.decrementInventory(tx, request.items);

            return newOrder;
          });

          // Track success with business metrics
          Sentry.captureMessage("Order created", {
            level: "info",
            tags: {
              feature: "orders",
              action: "created",
              farmId: request.farmId,
            },
            contexts: {
              order: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                total: order.total,
                itemCount: order.items.length,
              },
            },
          });

          addBreadcrumb({
            category: "order",
            message: "Order created successfully",
            level: "info",
            data: { orderId: order.id, orderNumber: order.orderNumber },
          });

          // Send confirmation email (non-blocking)
          this.sendOrderConfirmation(order).catch((error) => {
            trackError(error, {
              feature: "orders",
              action: "confirmation_email_failed",
              orderId: order.id,
            });
          });

          return order;
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            trackDatabaseError(error, "OrderService.createOrder", {
              customerId: request.customerId,
              farmId: request.farmId,
            });
          } else {
            trackError(error as Error, {
              feature: "orders",
              action: "create_failed",
              customerId: request.customerId,
            });
          }

          throw error;
        }
      },
      {
        tags: {
          feature: "orders",
          service: "order",
          action: "create",
        },
      },
    );
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userId: string,
  ): Promise<Order> {
    return withPerformanceTracking(
      "order.updateStatus",
      async () => {
        try {
          addBreadcrumb({
            category: "order",
            message: "Updating order status",
            level: "info",
            data: { orderId, newStatus, userId },
          });

          const order = await database.order.findUnique({
            where: { id: orderId },
            include: { customer: true, farm: true },
          });

          if (!order) {
            throw new NotFoundError("Order not found");
          }

          // Validate status transition
          if (!this.isValidStatusTransition(order.status, newStatus)) {
            addBreadcrumb({
              category: "validation",
              message: "Invalid status transition",
              level: "warning",
              data: {
                orderId,
                currentStatus: order.status,
                newStatus,
              },
            });

            throw new ValidationError(
              `Cannot transition from ${order.status} to ${newStatus}`,
            );
          }

          const updated = await database.order.update({
            where: { id: orderId },
            data: { status: newStatus },
            include: { items: true, customer: true, farm: true },
          });

          // Track status change
          Sentry.captureMessage("Order status updated", {
            level: "info",
            tags: {
              feature: "orders",
              action: "status_updated",
              newStatus,
            },
            contexts: {
              order: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                previousStatus: order.status,
                newStatus,
              },
            },
          });

          // Send notification
          await this.sendStatusUpdateEmail(updated);

          return updated;
        } catch (error) {
          trackError(error as Error, {
            feature: "orders",
            action: "status_update_failed",
            orderId,
            newStatus,
          });

          throw error;
        }
      },
      {
        tags: {
          feature: "orders",
          action: "updateStatus",
        },
      },
    );
  }

  async cancelOrder(orderId: string, reason: string, userId: string): Promise<Order> {
    return withPerformanceTracking(
      "order.cancel",
      async () => {
        try {
          addBreadcrumb({
            category: "order",
            message: "Cancelling order",
            level: "info",
            data: { orderId, reason, userId },
          });

          const order = await database.order.findUnique({
            where: { id: orderId },
            include: { items: true, farm: true },
          });

          if (!order) {
            throw new NotFoundError("Order not found");
          }

          // Restore inventory in transaction
          const cancelled = await database.$transaction(async (tx) => {
            await this.restoreInventory(tx, order.items);

            return await tx.order.update({
              where: { id: orderId },
              data: {
                status: "CANCELLED",
                cancellationReason: reason,
                cancelledAt: new Date(),
              },
            });
          });

          // Track cancellation with reason
          Sentry.captureMessage("Order cancelled", {
            level: "info",
            tags: {
              feature: "orders",
              action: "cancelled",
              reason: reason.substring(0, 50), // Truncate for tag
            },
            contexts: {
              order: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                total: order.total,
                reason,
              },
            },
          });

          return cancelled;
        } catch (error) {
          trackError(error as Error, {
            feature: "orders",
            action: "cancel_failed",
            orderId,
          });

          throw error;
        }
      },
      { tags: { feature: "orders", action: "cancel" } },
    );
  }
}
```

### Checkout Service Integration

```typescript
// lib/services/checkout.service.ts
import {
  addBreadcrumb,
  trackError,
  withPerformanceTracking,
} from "@/lib/monitoring/sentry-utils";
import * as Sentry from "@sentry/nextjs";

export class CheckoutService {
  async createCheckoutSession(
    request: CheckoutSessionRequest,
  ): Promise<CheckoutSession> {
    return withPerformanceTracking(
      "checkout.createSession",
      async () => {
        try {
          addBreadcrumb({
            category: "checkout",
            message: "Creating checkout session",
            level: "info",
            data: {
              userId: request.userId,
              fulfillmentMethod: request.fulfillmentMethod,
            },
          });

          // Validate cart
          const validation = await cartService.validateCart(request.userId);
          if (!validation.isValid) {
            addBreadcrumb({
              category: "validation",
              message: "Cart validation failed",
              level: "warning",
              data: { errors: validation.errors },
            });

            throw new ValidationError(
              `Cart invalid: ${validation.errors.map((e) => e.message).join(", ")}`,
            );
          }

          const session = await this.processCheckout(request);

          Sentry.captureMessage("Checkout session created", {
            level: "info",
            tags: {
              feature: "checkout",
              action: "session_created",
            },
            contexts: {
              checkout: {
                sessionId: session.id,
                itemCount: session.items.length,
                total: session.totals.total,
              },
            },
          });

          return session;
        } catch (error) {
          trackError(error as Error, {
            feature: "checkout",
            action: "session_creation_failed",
            userId: request.userId,
          });

          throw error;
        }
      },
      { tags: { feature: "checkout", action: "createSession" } },
    );
  }

  async createOrdersFromSession(
    request: CreateOrdersRequest,
  ): Promise<CreateOrdersResult> {
    return withPerformanceTracking(
      "checkout.createOrders",
      async () => {
        try {
          addBreadcrumb({
            category: "checkout",
            message: "Creating orders from checkout session",
            level: "info",
            data: {
              sessionId: request.sessionId,
              paymentIntentId: request.paymentIntentId,
            },
          });

          const session = this.sessions.get(request.sessionId);
          if (!session) {
            throw new Error("Checkout session not found or expired");
          }

          const orders = await this.createOrders(session, request.paymentIntentId);

          // Clear session after successful order creation
          this.sessions.delete(request.sessionId);

          Sentry.captureMessage("Orders created from checkout", {
            level: "info",
            tags: {
              feature: "checkout",
              action: "orders_created",
            },
            contexts: {
              checkout: {
                sessionId: request.sessionId,
                orderCount: orders.length,
                totalAmount: orders.reduce((sum, o) => sum + o.total, 0),
              },
            },
          });

          return {
            orders,
            orderCount: orders.length,
            totalAmount: orders.reduce((sum, o) => sum + o.total, 0),
          };
        } catch (error) {
          trackError(error as Error, {
            feature: "checkout",
            action: "order_creation_failed",
            sessionId: request.sessionId,
          });

          throw error;
        }
      },
      { tags: { feature: "checkout", action: "createOrders" } },
    );
  }
}
```

### Payment Service Integration

```typescript
// lib/services/stripe.service.ts
import {
  addBreadcrumb,
  trackError,
  withPerformanceTracking,
} from "@/lib/monitoring/sentry-utils";
import * as Sentry from "@sentry/nextjs";

export class StripeService {
  async createPaymentIntent(
    request: CreatePaymentIntentRequest,
  ): Promise<PaymentIntent> {
    return withPerformanceTracking(
      "payment.createIntent",
      async () => {
        try {
          addBreadcrumb({
            category: "payment",
            message: "Creating payment intent",
            level: "info",
            data: {
              amount: request.amount,
              currency: request.currency,
              customerId: request.customerId,
            },
          });

          const intent = await stripe.paymentIntents.create({
            amount: request.amount,
            currency: request.currency,
            customer: request.customerId,
            metadata: request.metadata,
          });

          Sentry.captureMessage("Payment intent created", {
            level: "info",
            tags: {
              feature: "payment",
              action: "intent_created",
            },
            contexts: {
              payment: {
                paymentIntentId: intent.id,
                amount: request.amount,
                currency: request.currency,
              },
            },
          });

          return this.mapPaymentIntent(intent);
        } catch (error) {
          trackError(error as Error, {
            feature: "payment",
            action: "intent_creation_failed",
            amount: request.amount,
            customerId: request.customerId,
          });

          throw error;
        }
      },
      { tags: { feature: "payment", provider: "stripe" } },
    );
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentStatus> {
    return withPerformanceTracking(
      "payment.confirm",
      async () => {
        try {
          addBreadcrumb({
            category: "payment",
            message: "Confirming payment",
            level: "info",
            data: { paymentIntentId },
          });

          const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

          if (intent.status === "succeeded") {
            Sentry.captureMessage("Payment confirmed", {
              level: "info",
              tags: {
                feature: "payment",
                action: "payment_confirmed",
              },
              contexts: {
                payment: {
                  paymentIntentId,
                  amount: intent.amount,
                  status: intent.status,
                },
              },
            });
          } else {
            addBreadcrumb({
              category: "payment",
              message: "Payment not yet confirmed",
              level: "warning",
              data: { paymentIntentId, status: intent.status },
            });
          }

          return {
            paymentIntentId: intent.id,
            status: intent.status,
            amount: intent.amount,
          };
        } catch (error) {
          trackError(error as Error, {
            feature: "payment",
            action: "confirmation_failed",
            paymentIntentId,
          });

          throw error;
        }
      },
      { tags: { feature: "payment", action: "confirm" } },
    );
  }
}
```

---

## Error Tracking Best Practices

### 1. Always Add Context

```typescript
// ❌ BAD - No context
try {
  await dangerousOperation();
} catch (error) {
  Sentry.captureException(error);
}

// ✅ GOOD - Rich context
try {
  await dangerousOperation();
} catch (error) {
  trackError(error as Error, {
    feature: "checkout",
    action: "dangerous_operation",
    userId: user.id,
    orderId: order.id,
  });
}
```

### 2. Use Breadcrumbs for Flow Tracking

```typescript
// Track user journey
addBreadcrumb({
  category: "navigation",
  message: "User navigated to checkout",
  level: "info",
});

addBreadcrumb({
  category: "form",
  message: "User entered shipping address",
  level: "info",
});

addBreadcrumb({
  category: "payment",
  message: "User clicked pay button",
  level: "info",
});

// If error occurs, Sentry will show full breadcrumb trail
```

### 3. Track Business Events (Not Just Errors)

```typescript
// Track important milestones
Sentry.captureMessage("First order from new customer", {
  level: "info",
  tags: {
    feature: "orders",
    milestone: "first_order",
  },
  contexts: {
    customer: {
      customerId: customer.id,
      registrationDate: customer.createdAt,
    },
  },
});
```

### 4. Sanitize Sensitive Data

```typescript
// ❌ BAD - PII in error
trackError(error, {
  email: user.email, // PII!
  creditCard: payment.cardNumber, // PII!
});

// ✅ GOOD - IDs only
trackError(error, {
  userId: user.id,
  paymentMethodId: payment.methodId,
});
```

---

## Performance Monitoring

### Transaction Naming

```typescript
// ✅ Consistent, hierarchical naming
withPerformanceTracking("order.create", ...);
withPerformanceTracking("order.update", ...);
withPerformanceTracking("order.cancel", ...);
withPerformanceTracking("payment.intent.create", ...);
withPerformanceTracking("checkout.session.create", ...);
```

### Performance Thresholds

Set up alerts for:
- Payment intent creation > 2s
- Order creation > 3s
- Checkout session > 1s
- Database queries > 500ms

---

## Checklist

### Service Integration Checklist

- [ ] Import Sentry utilities at top of file
- [ ] Wrap critical operations with `withPerformanceTracking`
- [ ] Add breadcrumbs at key decision points
- [ ] Track errors with `trackError` or `trackDatabaseError`
- [ ] Track success events for important operations
- [ ] Set user context in authenticated flows
- [ ] Add feature/action tags to all events
- [ ] Sanitize PII before tracking
- [ ] Test error tracking in development
- [ ] Configure performance thresholds

### API Route Integration Checklist

- [ ] Wrap handler with `withPerformanceTracking`
- [ ] Set user context after authentication
- [ ] Add breadcrumb for request start
- [ ] Track validation errors
- [ ] Track authorization failures
- [ ] Track business logic errors
- [ ] Track success events
- [ ] Include request context in errors
- [ ] Test with `npm run sentry:send-test`

### Testing Checklist

- [ ] Run `npm run sentry:test` to verify config
- [ ] Trigger test error with `npm run sentry:send-test`
- [ ] Verify events appear in Sentry dashboard
- [ ] Check breadcrumbs are visible
- [ ] Verify user context is attached
- [ ] Confirm PII is properly sanitized
- [ ] Test performance tracking appears
- [ ] Verify tags are applied correctly

---

## Quick Reference

### Common Patterns

```typescript
// Start of operation
addBreadcrumb({
  category: "feature",
  message: "Operation started",
  level: "info",
  data: { key: "value" },
});

// Error occurred
trackError(error, {
  feature: "feature_name",
  action: "action_name",
  customContext: "value",
});

// Database error
trackDatabaseError(error, "ServiceName.methodName", {
  operation: "create",
  id: recordId,
});

// API error
trackApiError(error, request, {
  errorCode: "ERROR_CODE",
  feature: "feature_name",
});

// Success event
Sentry.captureMessage("Operation succeeded", {
  level: "info",
  tags: { feature: "name", action: "success" },
  contexts: { operation: { id: "value" } },
});

// Performance tracking
withPerformanceTracking(
  "transaction.name",
  async () => {
    // your code
  },
  { tags: { key: "value" } },
);
```

---

## Support

For questions or issues:
1. Check Sentry dashboard: https://sentry.io
2. Review `docs/SENTRY_INTEGRATION.md` for setup details
3. Test with: `npm run sentry:test`
4. Send test event: `npm run sentry:send-test`

---

**Next Steps**:
1. Integrate Sentry into Tier 1 critical paths (payments, orders, checkout)
2. Test all integrations in development
3. Deploy to staging and verify events
4. Configure alerts for critical errors
5. Monitor performance metrics
6. Expand to Tier 2 and Tier 3 paths

---

*Last updated: January 2025*