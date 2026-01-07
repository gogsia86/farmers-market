/**
 * 🌾 PAYPAL WEBHOOK HANDLER SERVICE
 * Divine PayPal Event Processing & Order Synchronization
 *
 * Features:
 * - PayPal webhook event processing
 * - Signature verification for security
 * - Order status synchronization
 * - Payment status updates
 * - Refund event handling
 * - Event logging and monitoring
 * - Retry logic for failed processing
 * - Agricultural consciousness in event handling
 *
 * @divine-pattern Quantum Event Processing
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference PayPal Webhooks documentation
 */

import { database } from "@/lib/database";
import { paypalService } from "@/lib/payments/paypal/paypal.service";

import { logger } from '@/lib/monitoring/logger';

import type { ServiceResponse } from "@/lib/types/service.types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * PayPal webhook event types
 */
export enum PayPalWebhookEventType {
  // Payment events
  PAYMENT_CAPTURE_COMPLETED = "PAYMENT.CAPTURE.COMPLETED",
  PAYMENT_CAPTURE_DECLINED = "PAYMENT.CAPTURE.DECLINED",
  PAYMENT_CAPTURE_PENDING = "PAYMENT.CAPTURE.PENDING",
  PAYMENT_CAPTURE_REFUNDED = "PAYMENT.CAPTURE.REFUNDED",
  PAYMENT_CAPTURE_REVERSED = "PAYMENT.CAPTURE.REVERSED",

  // Order events
  CHECKOUT_ORDER_APPROVED = "CHECKOUT.ORDER.APPROVED",
  CHECKOUT_ORDER_COMPLETED = "CHECKOUT.ORDER.COMPLETED",
  CHECKOUT_ORDER_SAVED = "CHECKOUT.ORDER.SAVED",

  // Refund events
  PAYMENT_REFUND_COMPLETED = "PAYMENT.REFUND.COMPLETED",
  PAYMENT_REFUND_FAILED = "PAYMENT.REFUND.FAILED",

  // Dispute events
  CUSTOMER_DISPUTE_CREATED = "CUSTOMER.DISPUTE.CREATED",
  CUSTOMER_DISPUTE_RESOLVED = "CUSTOMER.DISPUTE.RESOLVED",
  CUSTOMER_DISPUTE_UPDATED = "CUSTOMER.DISPUTE.UPDATED",
}

/**
 * PayPal webhook event structure
 */
export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  event_version: string;
  resource_type: string;
  resource_version?: string;
  summary: string;
  resource: any;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  create_time: string;
}

/**
 * Webhook processing result
 */
export interface WebhookProcessingResult {
  eventId: string;
  eventType: string;
  processed: boolean;
  orderId?: string;
  action: string;
  message: string;
  timestamp: string;
}

/**
 * Event handler function type
 */
type EventHandler = (
  event: PayPalWebhookEvent,
) => Promise<ServiceResponse<WebhookProcessingResult>>;

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class WebhookProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "WebhookProcessingError";
  }
}

export class WebhookVerificationError extends WebhookProcessingError {
  constructor(message: string = "Webhook signature verification failed") {
    super(message, "WEBHOOK_VERIFICATION_FAILED");
    this.name = "WebhookVerificationError";
  }
}

// ============================================================================
// PAYPAL WEBHOOK HANDLER SERVICE
// ============================================================================

export class PayPalWebhookHandler {
  private eventHandlers: Map<string, EventHandler>;

  constructor() {
    this.eventHandlers = new Map();
    this.registerEventHandlers();
  }

  /**
   * Process PayPal webhook event
   */
  async processWebhook(
    event: PayPalWebhookEvent,
    headers: Record<string, string>,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    try {
      // Log incoming webhook
      logger.info(`📥 PayPal Webhook received:`, {
        eventId: event.id,
        eventType: event.event_type,
        summary: event.summary,
        timestamp: event.create_time,
      });

      // Verify webhook signature
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      if (webhookId) {
        const isValid = await paypalService.verifyWebhookSignature(
          webhookId,
          headers,
          JSON.stringify(event),
        );

        if (!isValid) {
          logger.error("❌ Webhook signature verification failed");
          return {
            success: false,
            error: {
              code: "WEBHOOK_VERIFICATION_FAILED",
              message: "Invalid webhook signature",
              details: { eventId: event.id },
            },
          };
        }
      } else {
        logger.warn(
          "⚠️ PAYPAL_WEBHOOK_ID not configured, skipping verification",
        );
      }

      // Check if event already processed
      const existingEvent = await database.webhookEvent.findUnique({
        where: { eventId: event.id },
      });

      if (existingEvent && existingEvent.processed) {
        logger.info(`✅ Event ${event.id} already processed, { data: skipping` });
        return {
          success: true,
          data: {
            eventId: event.id,
            eventType: event.event_type,
            processed: true,
            action: "SKIPPED",
            message: "Event already processed",
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Get event handler
      const handler = this.eventHandlers.get(event.event_type);

      if (!handler) {
        logger.warn(`⚠️ No handler for event type: ${event.event_type}`);

        // Log unhandled event
        await this.logWebhookEvent(event, false, "No handler registered");

        return {
          success: true,
          data: {
            eventId: event.id,
            eventType: event.event_type,
            processed: false,
            action: "IGNORED",
            message: `No handler registered for ${event.event_type}`,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Process event with handler
      const result = await handler(event);

      if (result.success) {
        // Log successful processing
        await this.logWebhookEvent(event, true);

        logger.info(`✅ Event processed successfully:`, {
          eventId: event.id,
          eventType: event.event_type,
          orderId: result.data?.orderId,
          action: result.data?.action,
        });
      } else {
        // Log failed processing
        await this.logWebhookEvent(
          event,
          false,
          result.error?.message || "Processing failed",
        );

        logger.error(`❌ Event processing failed:`, result.error);
      }

      return result;
    } catch (error) {
      logger.error("Error processing webhook:", {
      error: error instanceof Error ? error.message : String(error),
    });

      // Log error
      await this.logWebhookEvent(
        event,
        false,
        error instanceof Error ? error.message : "Unknown error",
      );

      return {
        success: false,
        error: {
          code: "WEBHOOK_PROCESSING_ERROR",
          message: "Failed to process webhook event",
          details: {
            eventId: event.id,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Register all event handlers
   */
  private registerEventHandlers(): void {
    // Payment capture completed
    this.eventHandlers.set(
      PayPalWebhookEventType.PAYMENT_CAPTURE_COMPLETED,
      this.handlePaymentCaptureCompleted.bind(this),
    );

    // Payment capture declined
    this.eventHandlers.set(
      PayPalWebhookEventType.PAYMENT_CAPTURE_DECLINED,
      this.handlePaymentCaptureDeclined.bind(this),
    );

    // Payment capture pending
    this.eventHandlers.set(
      PayPalWebhookEventType.PAYMENT_CAPTURE_PENDING,
      this.handlePaymentCapturePending.bind(this),
    );

    // Payment capture refunded
    this.eventHandlers.set(
      PayPalWebhookEventType.PAYMENT_CAPTURE_REFUNDED,
      this.handlePaymentCaptureRefunded.bind(this),
    );

    // Order approved
    this.eventHandlers.set(
      PayPalWebhookEventType.CHECKOUT_ORDER_APPROVED,
      this.handleOrderApproved.bind(this),
    );

    // Order completed
    this.eventHandlers.set(
      PayPalWebhookEventType.CHECKOUT_ORDER_COMPLETED,
      this.handleOrderCompleted.bind(this),
    );

    // Refund completed
    this.eventHandlers.set(
      PayPalWebhookEventType.PAYMENT_REFUND_COMPLETED,
      this.handleRefundCompleted.bind(this),
    );

    // Dispute created
    this.eventHandlers.set(
      PayPalWebhookEventType.CUSTOMER_DISPUTE_CREATED,
      this.handleDisputeCreated.bind(this),
    );
  }

  /**
   * Handle PAYMENT.CAPTURE.COMPLETED event
   */
  private async handlePaymentCaptureCompleted(
    event: PayPalWebhookEvent,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    const capture = event.resource;
    const orderId = capture.custom_id || capture.invoice_id;

    if (!orderId) {
      return {
        success: false,
        error: {
          code: "ORDER_ID_NOT_FOUND",
          message: "Order ID not found in capture resource",
          details: { captureId: capture.id },
        },
      };
    }

    // Find order by payment intent ID or order number
    const order = await database.order.findFirst({
      where: {
        OR: [
          {
            paymentIntentId: capture.supplementary_data?.related_ids?.order_id,
          },
          { orderNumber: orderId },
          { id: orderId },
        ],
      },
    });

    if (!order) {
      logger.warn(`⚠️ Order not found for capture ${capture.id}`);
      return {
        success: true,
        data: {
          eventId: event.id,
          eventType: event.event_type,
          processed: true,
          action: "ORDER_NOT_FOUND",
          message: "Order not found in database",
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Update order status
    await database.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(capture.create_time),
        status: "CONFIRMED",
      },
    });

    return {
      success: true,
      data: {
        eventId: event.id,
        eventType: event.event_type,
        processed: true,
        orderId: order.id,
        action: "PAYMENT_CONFIRMED",
        message: `Order ${order.orderNumber} payment confirmed`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle PAYMENT.CAPTURE.DECLINED event
   */
  private async handlePaymentCaptureDeclined(
    event: PayPalWebhookEvent,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    const capture = event.resource;
    const orderId = capture.custom_id || capture.invoice_id;

    if (!orderId) {
      return {
        success: false,
        error: {
          code: "ORDER_ID_NOT_FOUND",
          message: "Order ID not found in capture resource",
        },
      };
    }

    const order = await database.order.findFirst({
      where: {
        OR: [{ orderNumber: orderId }, { id: orderId }],
      },
    });

    if (order) {
      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });
    }

    return {
      success: true,
      data: {
        eventId: event.id,
        eventType: event.event_type,
        processed: true,
        orderId: order?.id,
        action: "PAYMENT_DECLINED",
        message: "Payment capture declined",
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle PAYMENT.CAPTURE.PENDING event
   */
  private async handlePaymentCapturePending(
    event: PayPalWebhookEvent,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    const capture = event.resource;

    return {
      success: true,
      data: {
        eventId: event.id,
        eventType: event.event_type,
        processed: true,
        action: "PAYMENT_PENDING",
        message: "Payment capture is pending",
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle PAYMENT.CAPTURE.REFUNDED event
   */
  private async handlePaymentCaptureRefunded(
    event: PayPalWebhookEvent,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    const capture = event.resource;
    const orderId = capture.custom_id || capture.invoice_id;

    if (!orderId) {
      return {
        success: false,
        error: {
          code: "ORDER_ID_NOT_FOUND",
          message: "Order ID not found in capture resource",
        },
      };
    }

    const order = await database.order.findFirst({
      where: {
        OR: [{ orderNumber: orderId }, { id: orderId }],
      },
    });

    if (order) {
      // Determine if partial or full refund
      const captureAmount = parseFloat(capture.amount.value);
      const orderTotal = Number(order.total);
      const isFullRefund = Math.abs(captureAmount - orderTotal) < 0.01;

      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
          status: isFullRefund ? "CANCELLED" : order.status,
        },
      });
    }

    return {
      success: true,
      data: {
        eventId: event.id,
        eventType: event.event_type,
        processed: true,
        orderId: order?.id,
        action: "PAYMENT_REFUNDED",
        message: "Payment refunded",
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle CHECKOUT.ORDER.APPROVED event
   */
  private async handleOrderApproved(
    event: PayPalWebhookEvent,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    const paypalOrder = event.resource;

    // Find order by PayPal order ID
    const order = await database.order.findFirst({
      where: {
        paymentIntentId: paypalOrder.id,
      },
    });

    if (order) {
      // Update order to indicate PayPal approval
      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PENDING", // Still pending capture
        },
      });
    }

    return {
      success: true,
      data: {
        eventId: event.id,
        eventType: event.event_type,
        processed: true,
        orderId: order?.id,
        action: "ORDER_APPROVED",
        message: "PayPal order approved by customer",
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle CHECKOUT.ORDER.COMPLETED event
   */
  private async handleOrderCompleted(
    event: PayPalWebhookEvent,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    const paypalOrder = event.resource;

    const order = await database.order.findFirst({
      where: {
        paymentIntentId: paypalOrder.id,
      },
    });

    if (order && order.paymentStatus !== "PAID") {
      await database.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          status: "CONFIRMED",
        },
      });
    }

    return {
      success: true,
      data: {
        eventId: event.id,
        eventType: event.event_type,
        processed: true,
        orderId: order?.id,
        action: "ORDER_COMPLETED",
        message: "PayPal order completed",
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle PAYMENT.REFUND.COMPLETED event
   */
  private async handleRefundCompleted(
    event: PayPalWebhookEvent,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    const refund = event.resource;

    return {
      success: true,
      data: {
        eventId: event.id,
        eventType: event.event_type,
        processed: true,
        action: "REFUND_COMPLETED",
        message: "Refund completed successfully",
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle CUSTOMER.DISPUTE.CREATED event
   */
  private async handleDisputeCreated(
    event: PayPalWebhookEvent,
  ): Promise<ServiceResponse<WebhookProcessingResult>> {
    const dispute = event.resource;

    // Log dispute for admin attention
    logger.warn(`⚠️ PayPal dispute created:`, {
      disputeId: dispute.dispute_id,
      reason: dispute.reason,
      amount: dispute.dispute_amount,
    });

    // TODO: Send notification to admin
    // TODO: Create dispute record in database

    return {
      success: true,
      data: {
        eventId: event.id,
        eventType: event.event_type,
        processed: true,
        action: "DISPUTE_LOGGED",
        message: "Dispute logged for admin review",
        timestamp: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Log webhook event to database
   */
  private async logWebhookEvent(
    event: PayPalWebhookEvent,
    processed: boolean,
    error?: string,
  ): Promise<void> {
    try {
      await database.webhookEvent.upsert({
        where: { eventId: event.id },
        create: {
          eventId: event.id,
          provider: "PAYPAL",
          eventType: event.event_type,
          payload: event as any,
          processed,
          processedAt: processed ? new Date() : null,
          attempts: 1,
          lastAttemptAt: new Date(),
          error: error || null,
        },
        update: {
          processed,
          processedAt: processed ? new Date() : undefined,
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          error: error || null,
        },
      });
    } catch (error) {
      logger.error("Failed to log webhook event:", {
      error: error instanceof Error ? error.message : String(error),
    });
    }
  }

  /**
   * Retry failed webhook processing
   */
  async retryFailedWebhooks(maxRetries: number = 3): Promise<number> {
    const failedEvents = await database.webhookEvent.findMany({
      where: {
        provider: "PAYPAL",
        processed: false,
        attempts: {
          lt: maxRetries,
        },
      },
      take: 10,
    });

    let successCount = 0;

    for (const webhookEvent of failedEvents) {
      try {
        const event = webhookEvent.payload as unknown as PayPalWebhookEvent;
        const result = await this.processWebhook(event, {});

        if (result.success) {
          successCount++;
        }
      } catch (error) {
        logger.error(`Failed to retry webhook ${webhookEvent.id}:`, {
      error: error instanceof Error ? error.message : String(error),
    });
      }
    }

    return successCount;
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    total: number;
    processed: number;
    failed: number;
    pending: number;
  }> {
    const where: any = {
      provider: "PAYPAL",
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, processed, failed] = await Promise.all([
      database.webhookEvent.count({ where }),
      database.webhookEvent.count({ where: { ...where, processed: true } }),
      database.webhookEvent.count({
        where: { ...where, processed: false, attempts: { gte: 3 } },
      }),
    ]);

    return {
      total,
      processed,
      failed,
      pending: total - processed - failed,
    };
  }
}

// ============================================================================
// SERVICE INSTANCE EXPORT
// ============================================================================

export const paypalWebhookHandler = new PayPalWebhookHandler();
