/**
 * 💳 Stripe Payment Mock Service
 *
 * Mock Stripe payment processing for integration testing.
 * Simulates payment intents, webhooks, and refunds.
 *
 * @module tests/integration/mocks/stripe
 * @version 1.0.0
 *
 * Divine Pattern: External service mocking with agricultural consciousness
 * Agricultural Context: Payment processing for farm-to-table transactions
 */

import { randomUUID } from "crypto";

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
  customer?: string;
  payment_method?: string;
}

interface PaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "succeeded"
    | "canceled"
    | "failed";
  metadata: Record<string, unknown>;
  customer: string | null;
  payment_method: string | null;
  created: number;
  updated: number;
}

interface RefundRequest {
  payment_intent: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  metadata?: Record<string, unknown>;
}

interface Refund {
  id: string;
  object: "refund";
  amount: number;
  payment_intent: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  reason: string | null;
  created: number;
}

interface WebhookEvent {
  id: string;
  object: "event";
  type: string;
  data: {
    object: PaymentIntent | Refund | Record<string, unknown>;
  };
  created: number;
}

class StripePaymentMock {
  private paymentIntents: Map<string, PaymentIntent> = new Map();
  private refunds: Map<string, Refund> = new Map();
  private webhookEvents: WebhookEvent[] = [];
  private nextPaymentStatus: PaymentIntent["status"] | null = null;
  private failureCount: number = 0;
  private initialized: boolean = false;

  /**
   * Initialize the mock service
   */
  initialize(): void {
    this.initialized = true;
    this.reset();
    console.log("✅ Stripe Payment Mock initialized");
  }

  /**
   * Reset all mock data
   */
  reset(): void {
    this.paymentIntents.clear();
    this.refunds.clear();
    this.webhookEvents = [];
    this.nextPaymentStatus = null;
    this.failureCount = 0;
  }

  /**
   * Set the status for the next payment (for testing failures)
   */
  setNextPaymentStatus(status: PaymentIntent["status"]): void {
    this.nextPaymentStatus = status;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    request: PaymentIntentRequest,
  ): Promise<PaymentIntent> {
    if (!this.initialized) {
      throw new Error("Stripe mock not initialized. Call initialize() first.");
    }

    const now = Math.floor(Date.now() / 1000);
    const id = `pi_mock_${randomUUID().replace(/-/g, "")}`;

    let status: PaymentIntent["status"] = "processing";

    // Use custom status if set
    if (this.nextPaymentStatus) {
      status = this.nextPaymentStatus;
      this.nextPaymentStatus = null; // Reset after use
    } else {
      // Default success behavior
      status = "succeeded";
    }

    const paymentIntent: PaymentIntent = {
      id,
      object: "payment_intent",
      amount: request.amount,
      currency: request.currency,
      status,
      metadata: request.metadata || {},
      customer: request.customer || null,
      payment_method:
        request.payment_method || `pm_mock_${randomUUID().slice(0, 8)}`,
      created: now,
      updated: now,
    };

    this.paymentIntents.set(id, paymentIntent);

    // Emit webhook event
    this.emitWebhookEvent("payment_intent.created", paymentIntent);

    if (status === "succeeded") {
      this.emitWebhookEvent("payment_intent.succeeded", paymentIntent);
    } else if (status === "failed") {
      this.failureCount++;
      this.emitWebhookEvent("payment_intent.payment_failed", paymentIntent);
    }

    return paymentIntent;
  }

  /**
   * Retrieve a payment intent
   */
  async retrievePaymentIntent(id: string): Promise<PaymentIntent | null> {
    return this.paymentIntents.get(id) || null;
  }

  /**
   * Update a payment intent
   */
  async updatePaymentIntent(
    id: string,
    updates: Partial<Pick<PaymentIntent, "metadata" | "status">>,
  ): Promise<PaymentIntent | null> {
    const intent = this.paymentIntents.get(id);
    if (!intent) {
      return null;
    }

    const updated: PaymentIntent = {
      ...intent,
      ...updates,
      updated: Math.floor(Date.now() / 1000),
    };

    this.paymentIntents.set(id, updated);
    this.emitWebhookEvent("payment_intent.updated", updated);

    return updated;
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(id: string): Promise<PaymentIntent | null> {
    const intent = this.paymentIntents.get(id);
    if (!intent) {
      return null;
    }

    const canceled: PaymentIntent = {
      ...intent,
      status: "canceled",
      updated: Math.floor(Date.now() / 1000),
    };

    this.paymentIntents.set(id, canceled);
    this.emitWebhookEvent("payment_intent.canceled", canceled);

    return canceled;
  }

  /**
   * Create a refund
   */
  async createRefund(request: RefundRequest): Promise<Refund> {
    const paymentIntent = this.paymentIntents.get(request.payment_intent);
    if (!paymentIntent) {
      throw new Error(`Payment intent ${request.payment_intent} not found`);
    }

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Cannot refund a payment that hasn't succeeded");
    }

    const now = Math.floor(Date.now() / 1000);
    const id = `re_mock_${randomUUID().replace(/-/g, "")}`;

    const refund: Refund = {
      id,
      object: "refund",
      amount: request.amount || paymentIntent.amount,
      payment_intent: request.payment_intent,
      status: "succeeded",
      reason: request.reason || null,
      created: now,
    };

    this.refunds.set(id, refund);
    this.emitWebhookEvent("charge.refunded", {
      ...paymentIntent,
      refunded: true,
      amount_refunded: refund.amount,
    });

    return refund;
  }

  /**
   * Retrieve a refund
   */
  async retrieveRefund(id: string): Promise<Refund | null> {
    return this.refunds.get(id) || null;
  }

  /**
   * List refunds for a payment intent
   */
  async listRefunds(paymentIntentId: string): Promise<Refund[]> {
    return Array.from(this.refunds.values()).filter(
      (refund) => refund.payment_intent === paymentIntentId,
    );
  }

  /**
   * Emit a webhook event
   */
  private emitWebhookEvent(
    type: string,
    data: PaymentIntent | Refund | Record<string, unknown>,
  ): void {
    const event: WebhookEvent = {
      id: `evt_mock_${randomUUID().replace(/-/g, "")}`,
      object: "event",
      type,
      data: {
        object: data,
      },
      created: Math.floor(Date.now() / 1000),
    };

    this.webhookEvents.push(event);
  }

  /**
   * Get all webhook events
   */
  getWebhookEvents(): WebhookEvent[] {
    return [...this.webhookEvents];
  }

  /**
   * Get webhook events by type
   */
  getWebhookEventsByType(type: string): WebhookEvent[] {
    return this.webhookEvents.filter((event) => event.type === type);
  }

  /**
   * Clear webhook events
   */
  clearWebhookEvents(): void {
    this.webhookEvents = [];
  }

  /**
   * Get all payment intents
   */
  getAllPaymentIntents(): PaymentIntent[] {
    return Array.from(this.paymentIntents.values());
  }

  /**
   * Get payment intents by status
   */
  getPaymentIntentsByStatus(status: PaymentIntent["status"]): PaymentIntent[] {
    return Array.from(this.paymentIntents.values()).filter(
      (intent) => intent.status === status,
    );
  }

  /**
   * Get total processed amount
   */
  getTotalProcessedAmount(): number {
    return Array.from(this.paymentIntents.values())
      .filter((intent) => intent.status === "succeeded")
      .reduce((sum, intent) => sum + intent.amount, 0);
  }

  /**
   * Get total refunded amount
   */
  getTotalRefundedAmount(): number {
    return Array.from(this.refunds.values())
      .filter((refund) => refund.status === "succeeded")
      .reduce((sum, refund) => sum + refund.amount, 0);
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    const total = this.paymentIntents.size;
    if (total === 0) return 100;

    const succeeded = this.getPaymentIntentsByStatus("succeeded").length;
    return (succeeded / total) * 100;
  }

  /**
   * Simulate webhook delivery
   */
  async simulateWebhook(event: WebhookEvent): Promise<void> {
    // In a real test, this would POST to your webhook endpoint
    // For now, just add to the events list
    this.webhookEvents.push(event);
  }

  /**
   * Get mock statistics
   */
  getStatistics() {
    return {
      totalPaymentIntents: this.paymentIntents.size,
      totalRefunds: this.refunds.size,
      totalWebhookEvents: this.webhookEvents.length,
      totalProcessedAmount: this.getTotalProcessedAmount(),
      totalRefundedAmount: this.getTotalRefundedAmount(),
      successRate: this.getSuccessRate(),
      failureCount: this.failureCount,
      byStatus: {
        succeeded: this.getPaymentIntentsByStatus("succeeded").length,
        failed: this.getPaymentIntentsByStatus("failed").length,
        canceled: this.getPaymentIntentsByStatus("canceled").length,
        processing: this.getPaymentIntentsByStatus("processing").length,
      },
    };
  }
}

// Singleton instance
export const mockStripePayment = new StripePaymentMock();

// Export types
export type {
  PaymentIntent,
  PaymentIntentRequest,
  Refund,
  RefundRequest,
  WebhookEvent,
};
