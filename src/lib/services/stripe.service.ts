// 💳 QUANTUM STRIPE SERVICE - Divine Payment Processing Orchestration
// Manages Stripe payment intents and webhook events with agricultural consciousness

import Stripe from "stripe";

// ============================================================================
// STRIPE CONFIGURATION
// ============================================================================

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in dollars (will be converted to cents)
  currency?: string;
  customerId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface CreatePaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface RefundPaymentRequest {
  paymentIntentId: string;
  amount?: number; // Partial refund amount in dollars (optional)
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  metadata?: Record<string, string>;
}

export interface RefundPaymentResult {
  refundId: string;
  amount: number;
  status: string;
  reason?: string;
}

export interface PaymentStatus {
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
  customerId?: string;
  paymentMethodId?: string;
  chargeId?: string;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export interface WebhookEventResult {
  eventId: string;
  eventType: string;
  handled: boolean;
  data?: any;
}

// ============================================================================
// STRIPE SERVICE - QUANTUM PAYMENT ORCHESTRATOR
// ============================================================================

export class QuantumStripeService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  // ==========================================================================
  // PAYMENT INTENT OPERATIONS
  // ==========================================================================

  /**
   * 💳 Create payment intent
   */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResult> {
    const {
      amount,
      currency = "usd",
      customerId,
      customerEmail,
      metadata = {},
      description = "Farmers Market Platform Order",
    } = request;

    // Validate amount
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Convert dollars to cents
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      description,
      metadata: {
        ...metadata,
        customerId,
        customerEmail,
        platform: "farmers-market",
        timestamp: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      amount: amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  /**
   * ✅ Confirm payment intent
   */
  async confirmPayment(
    request: ConfirmPaymentRequest
  ): Promise<PaymentStatus> {
    const { paymentIntentId, paymentMethodId } = request;

    const confirmParams: Stripe.PaymentIntentConfirmParams = {};

    if (paymentMethodId) {
      confirmParams.payment_method = paymentMethodId;
    }

    const paymentIntent = await this.stripe.paymentIntents.confirm(
      paymentIntentId,
      confirmParams
    );

    return this.mapPaymentIntentToStatus(paymentIntent);
  }

  /**
   * 📊 Get payment intent status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    return this.mapPaymentIntentToStatus(paymentIntent);
  }

  /**
   * 🔄 Update payment intent
   */
  async updatePaymentIntent(
    paymentIntentId: string,
    updates: {
      amount?: number;
      metadata?: Record<string, string>;
      description?: string;
    }
  ): Promise<PaymentStatus> {
    const updateParams: Stripe.PaymentIntentUpdateParams = {};

    if (updates.amount !== undefined) {
      updateParams.amount = Math.round(updates.amount * 100);
    }

    if (updates.metadata) {
      updateParams.metadata = updates.metadata;
    }

    if (updates.description) {
      updateParams.description = updates.description;
    }

    const paymentIntent = await this.stripe.paymentIntents.update(
      paymentIntentId,
      updateParams
    );

    return this.mapPaymentIntentToStatus(paymentIntent);
  }

  /**
   * ❌ Cancel payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentStatus> {
    const paymentIntent = await this.stripe.paymentIntents.cancel(
      paymentIntentId
    );

    return this.mapPaymentIntentToStatus(paymentIntent);
  }

  // ==========================================================================
  // REFUND OPERATIONS
  // ==========================================================================

  /**
   * 💸 Refund payment
   */
  async refundPayment(
    request: RefundPaymentRequest
  ): Promise<RefundPaymentResult> {
    const { paymentIntentId, amount, reason, metadata = {} } = request;

    // Get payment intent to get charge ID
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    if (!paymentIntent.latest_charge) {
      throw new Error("No charge found for this payment intent");
    }

    const chargeId = typeof paymentIntent.latest_charge === 'string'
      ? paymentIntent.latest_charge
      : paymentIntent.latest_charge.id;

    // Create refund
    const refundParams: Stripe.RefundCreateParams = {
      charge: chargeId,
      metadata: {
        ...metadata,
        paymentIntentId,
        timestamp: new Date().toISOString(),
      },
    };

    if (amount !== undefined) {
      refundParams.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await this.stripe.refunds.create(refundParams);

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status || "unknown",
      reason: refund.reason || undefined,
    };
  }

  /**
   * 📊 Get refund status
   */
  async getRefundStatus(refundId: string): Promise<RefundPaymentResult> {
    const refund = await this.stripe.refunds.retrieve(refundId);

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status || "unknown",
      reason: refund.reason || undefined,
    };
  }

  // ==========================================================================
  // CUSTOMER OPERATIONS
  // ==========================================================================

  /**
   * 👤 Create Stripe customer
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<string> {
    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    });

    return customer.id;
  }

  /**
   * 👤 Get or create customer
   */
  async getOrCreateCustomer(params: {
    email: string;
    name?: string;
    userId?: string;
  }): Promise<string> {
    // Search for existing customer
    const customers = await this.stripe.customers.list({
      email: params.email,
      limit: 1,
    });

    if (customers.data.length > 0 && customers.data[0]) {
      return customers.data[0].id;
    }

    // Create new customer
    return this.createCustomer({
      email: params.email,
      name: params.name,
      metadata: {
        userId: params.userId || "",
      },
    });
  }

  /**
   * 💳 Get customer payment methods
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return paymentMethods.data;
  }

  // ==========================================================================
  // WEBHOOK HANDLING
  // ==========================================================================

  /**
   * 🎣 Construct webhook event from request
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (error) {
      throw new Error(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * 🎯 Handle webhook event
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<WebhookEventResult> {
    const eventId = event.id;
    const eventType = event.type;

    console.log(`Processing Stripe webhook: ${eventType} (${eventId})`);

    let handled = false;
    let data: any = undefined;

    switch (eventType) {
      case "payment_intent.succeeded":
        data = await this.handlePaymentIntentSucceeded(event);
        handled = true;
        break;

      case "payment_intent.payment_failed":
        data = await this.handlePaymentIntentFailed(event);
        handled = true;
        break;

      case "payment_intent.canceled":
        data = await this.handlePaymentIntentCanceled(event);
        handled = true;
        break;

      case "charge.refunded":
        data = await this.handleChargeRefunded(event);
        handled = true;
        break;

      case "customer.created":
        data = await this.handleCustomerCreated(event);
        handled = true;
        break;

      case "payment_method.attached":
        data = await this.handlePaymentMethodAttached(event);
        handled = true;
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
        handled = false;
    }

    return {
      eventId,
      eventType,
      handled,
      data,
    };
  }

  // ==========================================================================
  // WEBHOOK EVENT HANDLERS
  // ==========================================================================

  /**
   * ✅ Handle payment intent succeeded
   */
  private async handlePaymentIntentSucceeded(
    event: Stripe.Event
  ): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log(`Payment succeeded: ${paymentIntent.id}`);
    console.log(`Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
    console.log(`Customer: ${paymentIntent.customer}`);
    console.log(`Metadata:`, paymentIntent.metadata);

    // Return data for external processing (e.g., order creation)
    return {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      customerId: paymentIntent.metadata.customerId,
      metadata: paymentIntent.metadata,
    };
  }

  /**
   * ❌ Handle payment intent failed
   */
  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.error(`Payment failed: ${paymentIntent.id}`);
    console.error(`Reason: ${paymentIntent.last_payment_error?.message}`);

    return {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
      customerId: paymentIntent.metadata.customerId,
    };
  }

  /**
   * 🚫 Handle payment intent canceled
   */
  private async handlePaymentIntentCanceled(
    event: Stripe.Event
  ): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log(`Payment canceled: ${paymentIntent.id}`);

    return {
      paymentIntentId: paymentIntent.id,
      customerId: paymentIntent.metadata.customerId,
    };
  }

  /**
   * 💸 Handle charge refunded
   */
  private async handleChargeRefunded(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;

    console.log(`Charge refunded: ${charge.id}`);
    console.log(`Payment Intent: ${charge.payment_intent}`);
    console.log(`Refund Amount: ${charge.amount_refunded / 100}`);

    return {
      chargeId: charge.id,
      paymentIntentId: charge.payment_intent,
      refundedAmount: charge.amount_refunded / 100,
    };
  }

  /**
   * 👤 Handle customer created
   */
  private async handleCustomerCreated(event: Stripe.Event): Promise<any> {
    const customer = event.data.object as Stripe.Customer;

    console.log(`Customer created: ${customer.id}`);
    console.log(`Email: ${customer.email}`);

    return {
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
    };
  }

  /**
   * 💳 Handle payment method attached
   */
  private async handlePaymentMethodAttached(
    event: Stripe.Event
  ): Promise<any> {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;

    console.log(`Payment method attached: ${paymentMethod.id}`);
    console.log(`Customer: ${paymentMethod.customer}`);

    return {
      paymentMethodId: paymentMethod.id,
      customerId: paymentMethod.customer,
      type: paymentMethod.type,
    };
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * 🔄 Map Stripe payment intent to payment status
   */
  private mapPaymentIntentToStatus(
    paymentIntent: Stripe.PaymentIntent
  ): PaymentStatus {
    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer as string | undefined,
      paymentMethodId: paymentIntent.payment_method as string | undefined,
      chargeId: paymentIntent.latest_charge as string | undefined,
      createdAt: new Date(paymentIntent.created * 1000),
      metadata: paymentIntent.metadata,
    };
  }

  /**
   * 💰 Convert dollars to cents
   */
  dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
  }

  /**
   * 💵 Convert cents to dollars
   */
  centsToDollars(cents: number): number {
    return cents / 100;
  }

  /**
   * ✅ Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): boolean {
    try {
      this.constructWebhookEvent(payload, signature, webhookSecret);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const stripeService = new QuantumStripeService();
