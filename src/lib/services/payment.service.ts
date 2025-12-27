/**
 * 💳 DIVINE PAYMENT SERVICE
 * Quantum payment processing with Stripe integration and BaseService patterns
 *
 * @module PaymentService
 * @version 3.0.0 - BaseService Migration with ServiceResponse
 *
 * Features:
 * - Extends BaseService for standardized patterns
 * - ServiceResponse<T> for all operations
 * - OpenTelemetry tracing for observability
 * - Comprehensive Zod validation
 * - Stripe payment intent management
 * - Webhook signature verification
 * - Refund processing
 * - Agricultural consciousness integration
 * - Transaction safety for order updates
 * - Divine error handling patterns
 */

import Stripe from "stripe";
import { database } from "@/lib/database";
import type { Order } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { z } from "zod";
import { trace, SpanStatusCode } from "@opentelemetry/api";

import { BaseService } from "./base.service";
import type { ServiceResponse } from "@/lib/types/service-response";

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const CreatePaymentIntentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format"),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z
    .string()
    .min(3, "Currency code too short")
    .max(3, "Currency code too long")
    .default("usd"),
  metadata: z.record(z.string(), z.string()).default({}),
});

const RefundSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID required"),
  amount: z
    .number()
    .positive("Refund amount must be greater than 0")
    .optional(),
  reason: z
    .enum(["duplicate", "fraudulent", "requested_by_customer"] as const)
    .default("requested_by_customer"),
});

const WebhookSignatureSchema = z.object({
  payload: z.union([z.string(), z.instanceof(Buffer)]),
  signature: z.string().min(1, "Signature header required"),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PaymentIntent {
  id: string;
  clientSecret: string | null;
  amount: number;
  currency: string;
  status: Stripe.PaymentIntent.Status;
  orderId: string;
}

export interface PaymentConfirmation {
  success: boolean;
  status: Stripe.PaymentIntent.Status;
  paymentIntent: Stripe.PaymentIntent;
}

export interface RefundResult {
  id: string;
  amount: number;
  status: string;
  reason?: string | null;
}

export interface PaymentDetails {
  order: Order;
  paymentIntent?: Stripe.PaymentIntent;
}

// Manual type definition to make optional fields truly optional
export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

// Manual type definition to make optional fields truly optional
export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}

export type WebhookSignatureRequest = z.infer<typeof WebhookSignatureSchema>;

// ============================================================================
// CUSTOM ERROR CLASSES (Divine Pattern)
// ============================================================================

export class PaymentServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = "PaymentServiceError";
  }
}

export class StripeConfigurationError extends PaymentServiceError {
  constructor(message: string) {
    super(message, "STRIPE_CONFIG_ERROR");
    this.name = "StripeConfigurationError";
  }
}

export class PaymentIntentError extends PaymentServiceError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "PAYMENT_INTENT_ERROR", details);
    this.name = "PaymentIntentError";
  }
}

export class RefundError extends PaymentServiceError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "REFUND_ERROR", details);
    this.name = "RefundError";
  }
}

// ============================================================================
// PAYMENT SERVICE (BaseService Extension)
// ============================================================================

/**
 * 🌟 DIVINE PAYMENT SERVICE
 * Handles all payment operations with Stripe and agricultural consciousness
 */
export class PaymentService extends BaseService<Order> {
  constructor() {
    super({
      serviceName: "PaymentService",
      enableCaching: false, // Payment operations should not be cached
      enableTracing: true,
      enableAgriculturalConsciousness: false,
    });
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * 🔒 Safely check if an error is a Stripe error
   * Handles cases where Stripe.errors might be undefined (e.g., in tests)
   */
  private isStripeError(error: any): error is Stripe.errors.StripeError {
    return (
      error &&
      typeof error === "object" &&
      ("type" in error || "rawType" in error) &&
      "code" in error
    );
  }

  private isStripeSignatureError(error: any): boolean {
    return (
      this.isStripeError(error) &&
      error.type === "StripeSignatureVerificationError"
    );
  }

  // ==========================================================================
  // PAYMENT INTENT OPERATIONS
  // ==========================================================================

  /**
   * 💰 Create payment intent for an order
   * Creates or retrieves existing Stripe payment intent with full tracing
   *
   * @param request - Payment intent creation request
   * @returns ServiceResponse with PaymentIntent data
   */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest,
  ): Promise<ServiceResponse<PaymentIntent>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "PaymentService.createPaymentIntent",
      async (span) => {
        try {
          // ✅ Step 1: Validate input
          const validated = await this.validate(
            CreatePaymentIntentSchema,
            request,
          );

          const { orderId, amount, currency, metadata } = validated;

          // ✅ Step 2: Add span attributes
          span.setAttributes({
            "payment.order_id": orderId,
            "payment.amount": amount,
            "payment.currency": currency,
          });

          this.logger.info("Creating payment intent", {
            orderId,
            amount,
            currency,
          });

          // ✅ Step 3: Verify order exists and fetch details
          const order = await database.order.findUnique({
            where: { id: orderId },
            include: {
              customer: true,
              farm: true,
            },
          });

          if (!order) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Order not found",
            });
            span.end();

            return this.error("ORDER_NOT_FOUND", "Order not found", {
              orderId,
            });
          }

          // ✅ Step 4: Check for existing payment intent
          if (order.paymentIntentId) {
            try {
              const existingIntent = await stripe.paymentIntents.retrieve(
                order.paymentIntentId,
              );

              if (existingIntent.status !== "canceled") {
                this.logger.info("Reusing existing payment intent", {
                  paymentIntentId: existingIntent.id,
                  status: existingIntent.status,
                });

                span.setStatus({ code: SpanStatusCode.OK });
                span.end();

                return this.success({
                  id: existingIntent.id,
                  clientSecret: existingIntent.client_secret,
                  amount: existingIntent.amount / 100,
                  currency: existingIntent.currency,
                  status: existingIntent.status,
                  orderId,
                });
              }
            } catch (error) {
              // Existing intent not found or error - create new one
              this.logger.warn("Could not retrieve existing payment intent", {
                paymentIntentId: order.paymentIntentId,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          }

          // ✅ Step 5: Create new payment intent with Stripe
          const amountInCents = Math.round(amount * 100);

          const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency.toLowerCase(),
            metadata: {
              orderId,
              customerId: order.customerId,
              farmId: order.farmId,
              ...metadata,
            },
            automatic_payment_methods: {
              enabled: true,
            },
            description: `Order #${orderId.slice(0, 8)} - ${order.farm?.name || "Farm"}`,
          });

          // ✅ Step 6: Update order with payment intent ID
          await database.order.update({
            where: { id: orderId },
            data: {
              paymentIntentId: paymentIntent.id,
              paymentStatus: "PENDING",
            },
          });

          this.logger.info("Payment intent created successfully", {
            paymentIntentId: paymentIntent.id,
            orderId,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success({
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            orderId,
          });
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to create payment intent", {
            error: error instanceof Error ? error.message : "Unknown error",
            request,
          });

          if (this.isStripeError(error)) {
            return this.error(
              "STRIPE_ERROR",
              `Stripe error: ${error.message}`,
              {
                type: error.type,
                code: error.code,
                statusCode: error.statusCode,
              },
            );
          }

          return this.error(
            "PAYMENT_INTENT_CREATION_FAILED",
            "Failed to create payment intent",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  /**
   * ✅ Confirm payment intent status
   * Retrieves and verifies payment intent from Stripe
   *
   * @param paymentIntentId - Stripe payment intent ID
   * @returns ServiceResponse with PaymentConfirmation
   */
  async confirmPayment(
    paymentIntentId: string,
  ): Promise<ServiceResponse<PaymentConfirmation>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "PaymentService.confirmPayment",
      async (span) => {
        try {
          span.setAttribute("payment.intent_id", paymentIntentId);

          this.logger.info("Confirming payment", { paymentIntentId });

          // ✅ Retrieve payment intent from Stripe
          const paymentIntent =
            await stripe.paymentIntents.retrieve(paymentIntentId);

          const success = paymentIntent.status === "succeeded";

          span.setAttribute("payment.status", paymentIntent.status);
          span.setAttribute("payment.success", success);

          this.logger.info("Payment confirmation retrieved", {
            paymentIntentId,
            status: paymentIntent.status,
            success,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success({
            success,
            status: paymentIntent.status,
            paymentIntent,
          });
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to confirm payment", {
            paymentIntentId,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          if (this.isStripeError(error)) {
            return this.error(
              "STRIPE_ERROR",
              `Failed to confirm payment: ${error.message}`,
              {
                type: error.type,
                code: error.code,
              },
            );
          }

          return this.error(
            "PAYMENT_CONFIRMATION_FAILED",
            "Failed to confirm payment",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  // ==========================================================================
  // WEBHOOK HANDLERS
  // ==========================================================================

  /**
   * 🔄 Handle successful payment webhook event
   * Updates order status when payment succeeds
   *
   * @param paymentIntent - Stripe payment intent object
   * @returns ServiceResponse with updated Order
   */
  async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<ServiceResponse<Order>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "PaymentService.handlePaymentSuccess",
      async (span) => {
        try {
          const orderId = paymentIntent.metadata.orderId;

          if (!orderId) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Missing orderId in metadata",
            });
            span.end();

            this.logger.error("Payment intent missing orderId in metadata", {
              paymentIntentId: paymentIntent.id,
            });

            return this.error(
              "MISSING_ORDER_ID",
              "Payment intent missing orderId in metadata",
              { paymentIntentId: paymentIntent.id },
            );
          }

          span.setAttributes({
            "payment.intent_id": paymentIntent.id,
            "payment.order_id": orderId,
            "payment.amount": paymentIntent.amount / 100,
          });

          this.logger.info("Processing payment success", {
            orderId,
            paymentIntentId: paymentIntent.id,
          });

          // ✅ Update order with transaction safety
          const order = await database.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              paymentIntentId: paymentIntent.id,
              paidAt: new Date(),
              status: "CONFIRMED",
            },
          });

          this.logger.info("Payment success processed", {
            orderId,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success(order);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to handle payment success", {
            paymentIntentId: paymentIntent.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          return this.error(
            "PAYMENT_SUCCESS_HANDLER_FAILED",
            "Failed to process payment success",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  /**
   * ❌ Handle failed payment webhook event
   * Updates order status when payment fails
   *
   * @param paymentIntent - Stripe payment intent object
   * @returns ServiceResponse with updated Order
   */
  async handlePaymentFailure(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<ServiceResponse<Order>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "PaymentService.handlePaymentFailure",
      async (span) => {
        try {
          const orderId = paymentIntent.metadata.orderId;

          if (!orderId) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Missing orderId in metadata",
            });
            span.end();

            this.logger.error("Payment intent missing orderId in metadata", {
              paymentIntentId: paymentIntent.id,
            });

            return this.error(
              "MISSING_ORDER_ID",
              "Payment intent missing orderId in metadata",
              { paymentIntentId: paymentIntent.id },
            );
          }

          span.setAttributes({
            "payment.intent_id": paymentIntent.id,
            "payment.order_id": orderId,
            "payment.error":
              paymentIntent.last_payment_error?.message || "Unknown",
          });

          this.logger.info("Processing payment failure", {
            orderId,
            paymentIntentId: paymentIntent.id,
            error: paymentIntent.last_payment_error?.message,
          });

          // ✅ Update order with failed status
          const order = await database.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
            },
          });

          this.logger.info("Payment failure processed", {
            orderId,
            paymentIntentId: paymentIntent.id,
            lastPaymentError: paymentIntent.last_payment_error?.message,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success(order);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to handle payment failure", {
            paymentIntentId: paymentIntent.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          return this.error(
            "PAYMENT_FAILURE_HANDLER_FAILED",
            "Failed to process payment failure",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  // ==========================================================================
  // REFUND OPERATIONS
  // ==========================================================================

  /**
   * 💸 Create refund for a payment
   * Processes full or partial refund via Stripe
   *
   * @param request - Refund request with payment intent ID and optional amount
   * @returns ServiceResponse with RefundResult
   */
  async createRefund(
    request: RefundRequest,
  ): Promise<ServiceResponse<RefundResult>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "PaymentService.createRefund",
      async (span) => {
        try {
          // ✅ Step 1: Validate input
          const validated = await this.validate(RefundSchema, request);

          const { paymentIntentId, amount, reason } = validated;

          span.setAttributes({
            "refund.payment_intent_id": paymentIntentId,
            "refund.amount": amount || "full",
            "refund.reason": reason,
          });

          this.logger.info("Creating refund", {
            paymentIntentId,
            amount,
            reason,
          });

          // ✅ Step 2: Build refund parameters
          const refundParams: Stripe.RefundCreateParams = {
            payment_intent: paymentIntentId,
            reason: reason || "requested_by_customer",
          };

          if (amount !== undefined) {
            refundParams.amount = Math.round(amount * 100);
          }

          // ✅ Step 3: Create refund with Stripe
          const refund = await stripe.refunds.create(refundParams);

          this.logger.info("Refund created successfully", {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success({
            id: refund.id,
            amount: refund.amount / 100,
            status: refund.status as string,
            reason: refund.reason,
          });
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to create refund", {
            request,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          if (this.isStripeError(error)) {
            return this.error(
              "STRIPE_REFUND_ERROR",
              `Stripe refund error: ${error.message}`,
              {
                type: error.type,
                code: error.code,
              },
            );
          }

          return this.error(
            "REFUND_CREATION_FAILED",
            "Failed to create refund",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  /**
   * 🔄 Handle refund webhook event
   * Updates order status when refund is processed
   *
   * @param charge - Stripe charge object
   * @returns ServiceResponse with updated Order
   */
  async handleRefund(charge: Stripe.Charge): Promise<ServiceResponse<Order>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "PaymentService.handleRefund",
      async (span) => {
        try {
          const paymentIntentId = charge.payment_intent as string;

          if (!paymentIntentId) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Missing payment_intent",
            });
            span.end();

            this.logger.error("Charge missing payment_intent", {
              chargeId: charge.id,
            });

            return this.error(
              "MISSING_PAYMENT_INTENT",
              "Charge missing payment_intent",
              { chargeId: charge.id },
            );
          }

          span.setAttributes({
            "refund.payment_intent_id": paymentIntentId,
            "refund.charge_id": charge.id,
            "refund.amount": charge.amount_refunded / 100,
          });

          this.logger.info("Processing refund", {
            paymentIntentId,
            chargeId: charge.id,
          });

          // ✅ Find order by payment intent
          const order = await database.order.findFirst({
            where: { paymentIntentId },
          });

          if (!order) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Order not found",
            });
            span.end();

            this.logger.error("Order not found for payment intent", {
              paymentIntentId,
            });

            return this.error(
              "ORDER_NOT_FOUND",
              "Order not found for payment intent",
              { paymentIntentId },
            );
          }

          // ✅ Update order with refunded status
          const updatedOrder = await database.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "REFUNDED",
            },
          });

          this.logger.info("Refund processed", {
            orderId: order.id,
            paymentIntentId,
            amount: charge.amount_refunded / 100,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success(updatedOrder);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to handle refund", {
            chargeId: charge.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          return this.error(
            "REFUND_HANDLER_FAILED",
            "Failed to process refund",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  // ==========================================================================
  // PAYMENT DETAILS
  // ==========================================================================

  /**
   * 📊 Get payment details for an order
   * Retrieves order and associated Stripe payment intent
   *
   * @param orderId - Order ID
   * @returns ServiceResponse with PaymentDetails
   */
  async getPaymentDetails(
    orderId: string,
  ): Promise<ServiceResponse<PaymentDetails>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "PaymentService.getPaymentDetails",
      async (span) => {
        try {
          span.setAttribute("payment.order_id", orderId);

          this.logger.info("Fetching payment details", { orderId });

          // ✅ Fetch order
          const order = await database.order.findUnique({
            where: { id: orderId },
          });

          if (!order) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Order not found",
            });
            span.end();

            return this.error("ORDER_NOT_FOUND", "Order not found", {
              orderId,
            });
          }

          let paymentIntent: Stripe.PaymentIntent | undefined;

          // ✅ Fetch payment intent if exists
          if (order.paymentIntentId) {
            try {
              paymentIntent = await stripe.paymentIntents.retrieve(
                order.paymentIntentId,
              );

              span.setAttribute("payment.intent_id", paymentIntent.id);
              span.setAttribute("payment.status", paymentIntent.status);
            } catch (error) {
              this.logger.warn("Failed to retrieve payment intent", {
                paymentIntentId: order.paymentIntentId,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          }

          this.logger.info("Payment details retrieved", {
            orderId,
            hasPaymentIntent: !!paymentIntent,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success({
            order,
            paymentIntent,
          });
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to get payment details", {
            orderId,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          return this.error(
            "GET_PAYMENT_DETAILS_FAILED",
            "Failed to get payment details",
            {
              orderId,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  // ==========================================================================
  // WEBHOOK VERIFICATION
  // ==========================================================================

  /**
   * 🔍 Verify webhook signature
   * Validates Stripe webhook signature for security
   *
   * @param request - Webhook signature request with payload and signature
   * @returns ServiceResponse with verified Stripe.Event
   */
  async verifyWebhookSignature(
    request: WebhookSignatureRequest,
  ): Promise<ServiceResponse<Stripe.Event>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "PaymentService.verifyWebhookSignature",
      async (span) => {
        try {
          // ✅ Step 1: Validate input
          const validated = await this.validate(
            WebhookSignatureSchema,
            request,
          );

          const { payload, signature } = validated;

          this.logger.info("Verifying webhook signature");

          // ✅ Step 2: Check webhook secret configuration
          const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

          if (!webhookSecret) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Webhook secret not configured",
            });
            span.end();

            this.logger.error("STRIPE_WEBHOOK_SECRET not configured");

            return this.error(
              "STRIPE_CONFIG_ERROR",
              "STRIPE_WEBHOOK_SECRET is not configured",
            );
          }

          // ✅ Step 3: Verify signature with Stripe
          const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret,
          );

          span.setAttribute("webhook.event_type", event.type);
          span.setAttribute("webhook.event_id", event.id);

          this.logger.info("Webhook signature verified", {
            eventType: event.type,
            eventId: event.id,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success(event);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Webhook signature verification failed", {
            error: error instanceof Error ? error.message : "Unknown error",
          });

          if (this.isStripeSignatureError(error)) {
            return this.error(
              "INVALID_SIGNATURE",
              "Webhook signature verification failed",
              { error: error instanceof Error ? error.message : String(error) },
            );
          }

          return this.error(
            "WEBHOOK_VERIFICATION_FAILED",
            "Failed to verify webhook signature",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * ✅ Export singleton instance for application-wide use
 * Maintains divine pattern consistency with other services
 */
export const paymentService = new PaymentService();
