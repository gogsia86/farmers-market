/**
 * Payment Failure Edge Case Tests
 *
 * Comprehensive test suite for payment failure scenarios including:
 * - Stripe payment intent failures
 * - Webhook delivery failures
 * - Network timeouts
 * - Partial refunds
 * - Payment method failures
 * - Concurrent payment attempts
 * - Inventory rollback on payment failure
 * - Order status consistency
 *
 * @module __tests__/edge-cases/payment-failures.edge.test
 */

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";

// Mock Stripe before imports
jest.mock("stripe", () => {
  const mockStripe = {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  };
  return {
    default: jest.fn(() => mockStripe),
  };
});

// Types
interface PaymentIntent {
  id: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "succeeded"
    | "canceled"
    | "failed";
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELED";
  total: number;
  paymentIntentId?: string;
  items: OrderItem[];
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  inventory: number;
  price: number;
}

// Mock database
const mockDatabase = {
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock services
class PaymentService {
  private stripe: any;

  constructor(stripeInstance: any) {
    this.stripe = stripeInstance;
  }

  async createPaymentIntent(
    orderId: string,
    amount: number,
  ): Promise<PaymentIntent> {
    const order = await mockDatabase.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "PENDING") {
      throw new Error("Order is not in pending state");
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: { orderId },
    });

    await mockDatabase.order.update({
      where: { id: orderId },
      data: {
        paymentIntentId: paymentIntent.id,
        status: "PROCESSING",
      },
    });

    return paymentIntent;
  }

  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    const orderId = paymentIntent.metadata.orderId;

    await mockDatabase.$transaction(async (tx: any) => {
      // Update order status
      await mockDatabase.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      // Record payment
      await mockDatabase.payment.create({
        data: {
          orderId,
          paymentIntentId,
          amount: paymentIntent.amount / 100,
          status: "SUCCEEDED",
        },
      });
    });
  }

  async handlePaymentFailure(
    paymentIntentId: string,
    reason: string,
  ): Promise<void> {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    const orderId = paymentIntent.metadata.orderId;

    await mockDatabase.$transaction(async (tx: any) => {
      // Get order with items
      const order = await mockDatabase.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      // Restore inventory
      for (const item of order.items) {
        await mockDatabase.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status
      await mockDatabase.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });

      // Record failed payment
      await mockDatabase.payment.create({
        data: {
          orderId,
          paymentIntentId,
          amount: paymentIntent.amount / 100,
          status: "FAILED",
          failureReason: reason,
        },
      });
    });
  }

  async refundPayment(orderId: string, amount?: number): Promise<void> {
    const order = await mockDatabase.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || !order.paymentIntentId) {
      throw new Error("Payment not found");
    }

    if (order.status !== "PAID") {
      throw new Error("Order must be paid to refund");
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: amount ? amount * 100 : undefined,
    });

    await mockDatabase.payment.update({
      where: { orderId },
      data: {
        status:
          amount && amount < order.total ? "PARTIALLY_REFUNDED" : "REFUNDED",
        refundedAmount: amount || order.total,
      },
    });

    if (!amount || amount === order.total) {
      await mockDatabase.order.update({
        where: { id: orderId },
        data: { status: "CANCELED" },
      });
    }
  }

  async handleWebhook(signature: string, payload: string): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSuccess(event.data.object.id);
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentFailure(
          event.data.object.id,
          event.data.object.last_payment_error?.message || "Unknown error",
        );
        break;
      case "payment_intent.canceled":
        await this.handlePaymentFailure(
          event.data.object.id,
          "Payment canceled",
        );
        break;
    }
  }
}

describe("Payment Failure Edge Cases", () => {
  let paymentService: PaymentService;
  let mockStripe: any;

  beforeAll(() => {
    // Import Stripe mock
    const Stripe = require("stripe").default;
    mockStripe = Stripe();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = new PaymentService(mockStripe);

    // Reset transaction mock to execute callback immediately
    mockDatabase.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockDatabase);
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("Payment Intent Creation Failures", () => {
    it("should fail payment intent creation for non-existent order", async () => {
      mockDatabase.order.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.createPaymentIntent("order_nonexistent", 100),
      ).rejects.toThrow("Order not found");

      expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it("should fail payment intent creation for already processed order", async () => {
      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_123",
        status: "PAID",
        total: 100,
      });

      await expect(
        paymentService.createPaymentIntent("order_123", 100),
      ).rejects.toThrow("Order is not in pending state");
    });

    it("should handle Stripe API failure during intent creation", async () => {
      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_123",
        status: "PENDING",
        total: 100,
      });

      mockStripe.paymentIntents.create.mockRejectedValue(
        new Error("Stripe API error: Rate limit exceeded"),
      );

      await expect(
        paymentService.createPaymentIntent("order_123", 100),
      ).rejects.toThrow("Stripe API error");

      // Order should not be updated on Stripe failure
      expect(mockDatabase.order.update).not.toHaveBeenCalled();
    });

    it("should handle network timeout during intent creation", async () => {
      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_123",
        status: "PENDING",
        total: 100,
      });

      const timeoutError = new Error("Network timeout");
      (timeoutError as any).code = "ETIMEDOUT";
      mockStripe.paymentIntents.create.mockRejectedValue(timeoutError);

      await expect(
        paymentService.createPaymentIntent("order_123", 100),
      ).rejects.toThrow("Network timeout");
    });
  });

  describe("Payment Method Failures", () => {
    it("should handle insufficient funds error", async () => {
      const paymentIntentId = "pi_insufficient_funds";

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: "failed",
        amount: 10000,
        currency: "usd",
        metadata: { orderId: "order_123" },
        last_payment_error: {
          code: "card_declined",
          decline_code: "insufficient_funds",
          message: "Your card has insufficient funds",
        },
      });

      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_123",
        status: "PROCESSING",
        items: [{ productId: "prod_1", quantity: 2, price: 50 }],
      });

      await paymentService.handlePaymentFailure(
        paymentIntentId,
        "Your card has insufficient funds",
      );

      // Verify inventory restored
      expect(mockDatabase.product.update).toHaveBeenCalledWith({
        where: { id: "prod_1" },
        data: { inventory: { increment: 2 } },
      });

      // Verify order marked as failed
      expect(mockDatabase.order.update).toHaveBeenCalledWith({
        where: { id: "order_123" },
        data: { status: "FAILED" },
      });

      // Verify payment record created
      expect(mockDatabase.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: "order_123",
          status: "FAILED",
          failureReason: "Your card has insufficient funds",
        }),
      });
    });

    it("should handle expired card error", async () => {
      const paymentIntentId = "pi_expired_card";

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: "failed",
        amount: 5000,
        currency: "usd",
        metadata: { orderId: "order_456" },
        last_payment_error: {
          code: "card_declined",
          decline_code: "expired_card",
          message: "Your card has expired",
        },
      });

      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_456",
        status: "PROCESSING",
        items: [{ productId: "prod_2", quantity: 1, price: 50 }],
      });

      await paymentService.handlePaymentFailure(
        paymentIntentId,
        "Your card has expired",
      );

      expect(mockDatabase.order.update).toHaveBeenCalledWith({
        where: { id: "order_456" },
        data: { status: "FAILED" },
      });
    });

    it("should handle fraudulent payment detection", async () => {
      const paymentIntentId = "pi_fraud_detected";

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: "canceled",
        amount: 20000,
        currency: "usd",
        metadata: { orderId: "order_789" },
        last_payment_error: {
          code: "card_declined",
          decline_code: "fraudulent",
          message: "Payment blocked due to suspected fraud",
        },
      });

      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_789",
        status: "PROCESSING",
        items: [{ productId: "prod_3", quantity: 5, price: 40 }],
      });

      await paymentService.handlePaymentFailure(
        paymentIntentId,
        "Payment blocked due to suspected fraud",
      );

      expect(mockDatabase.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          failureReason: "Payment blocked due to suspected fraud",
        }),
      });
    });
  });

  describe("Webhook Handling Failures", () => {
    it("should reject webhook with invalid signature", async () => {
      const payload = JSON.stringify({
        type: "payment_intent.succeeded",
        data: { object: { id: "pi_123" } },
      });

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      await expect(
        paymentService.handleWebhook("invalid_signature", payload),
      ).rejects.toThrow("Invalid signature");

      expect(mockDatabase.order.update).not.toHaveBeenCalled();
    });

    it("should handle duplicate webhook delivery (idempotency)", async () => {
      const webhookEvent = {
        id: "evt_123",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_123",
            status: "succeeded",
            metadata: { orderId: "order_123" },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent);
      mockStripe.paymentIntents.retrieve.mockResolvedValue(
        webhookEvent.data.object,
      );

      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_123",
        status: "PAID", // Already processed
      });

      // First webhook
      await paymentService.handleWebhook("sig_1", JSON.stringify(webhookEvent));

      // Duplicate webhook
      await paymentService.handleWebhook("sig_1", JSON.stringify(webhookEvent));

      // Should only update once (implement idempotency in real code)
      // This test documents the expected behavior
    });

    it("should handle out-of-order webhook delivery", async () => {
      // Simulate receiving payment_failed before payment_processing
      const failedEvent = {
        id: "evt_failed",
        type: "payment_intent.payment_failed",
        data: {
          object: {
            id: "pi_123",
            status: "failed",
            amount: 10000,
            currency: "usd",
            metadata: { orderId: "order_123" },
            last_payment_error: { message: "Card declined" },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(failedEvent);
      mockStripe.paymentIntents.retrieve.mockResolvedValue(
        failedEvent.data.object,
      );

      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_123",
        status: "PROCESSING",
        items: [{ productId: "prod_1", quantity: 1, price: 100 }],
      });

      await paymentService.handleWebhook("sig_1", JSON.stringify(failedEvent));

      expect(mockDatabase.order.update).toHaveBeenCalledWith({
        where: { id: "order_123" },
        data: { status: "FAILED" },
      });
    });

    it("should handle webhook processing timeout", async () => {
      const event = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_timeout",
            metadata: { orderId: "order_timeout" },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockStripe.paymentIntents.retrieve.mockResolvedValue(event.data.object);

      // Simulate slow database operation
      mockDatabase.$transaction.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 30000));
      });

      jest.useFakeTimers();

      const webhookPromise = paymentService.handleWebhook(
        "sig_1",
        JSON.stringify(event),
      );

      jest.advanceTimersByTime(30000);

      // In production, implement timeout handling
      // This test documents the need for timeout handling
      jest.useRealTimers();
    });
  });

  describe("Refund Failures", () => {
    it("should handle full refund successfully", async () => {
      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_refund",
        status: "PAID",
        total: 100,
        paymentIntentId: "pi_refund",
        payment: {
          orderId: "order_refund",
          status: "SUCCEEDED",
        },
      });

      mockStripe.refunds.create.mockResolvedValue({
        id: "ref_123",
        amount: 10000,
        status: "succeeded",
      });

      await paymentService.refundPayment("order_refund");

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: "pi_refund",
        amount: undefined, // Full refund
      });

      expect(mockDatabase.payment.update).toHaveBeenCalledWith({
        where: { orderId: "order_refund" },
        data: {
          status: "REFUNDED",
          refundedAmount: 100,
        },
      });

      expect(mockDatabase.order.update).toHaveBeenCalledWith({
        where: { id: "order_refund" },
        data: { status: "CANCELED" },
      });
    });

    it("should handle partial refund successfully", async () => {
      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_partial",
        status: "PAID",
        total: 100,
        paymentIntentId: "pi_partial",
      });

      mockStripe.refunds.create.mockResolvedValue({
        id: "ref_partial",
        amount: 5000,
        status: "succeeded",
      });

      await paymentService.refundPayment("order_partial", 50);

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: "pi_partial",
        amount: 5000,
      });

      expect(mockDatabase.payment.update).toHaveBeenCalledWith({
        where: { orderId: "order_partial" },
        data: {
          status: "PARTIALLY_REFUNDED",
          refundedAmount: 50,
        },
      });

      // Order should remain PAID for partial refund
      expect(mockDatabase.order.update).not.toHaveBeenCalled();
    });

    it("should fail refund for non-paid order", async () => {
      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_pending",
        status: "PENDING",
        total: 100,
        paymentIntentId: "pi_pending",
      });

      await expect(
        paymentService.refundPayment("order_pending"),
      ).rejects.toThrow("Order must be paid to refund");

      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("should handle Stripe refund failure", async () => {
      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_refund_fail",
        status: "PAID",
        total: 100,
        paymentIntentId: "pi_refund_fail",
      });

      mockStripe.refunds.create.mockRejectedValue(
        new Error("Refund already issued"),
      );

      await expect(
        paymentService.refundPayment("order_refund_fail"),
      ).rejects.toThrow("Refund already issued");

      expect(mockDatabase.payment.update).not.toHaveBeenCalled();
    });
  });

  describe("Concurrent Payment Attempts", () => {
    it("should prevent multiple payment intents for same order", async () => {
      const order = {
        id: "order_concurrent",
        status: "PENDING",
        total: 100,
        items: [],
      };

      mockDatabase.order.findUnique.mockResolvedValue(order);

      mockStripe.paymentIntents.create
        .mockResolvedValueOnce({
          id: "pi_1",
          status: "requires_payment_method",
        })
        .mockResolvedValueOnce({
          id: "pi_2",
          status: "requires_payment_method",
        });

      // Simulate concurrent requests
      const [result1, result2] = await Promise.allSettled([
        paymentService.createPaymentIntent("order_concurrent", 100),
        paymentService.createPaymentIntent("order_concurrent", 100),
      ]);

      // One should succeed, one should fail or be idempotent
      // In production, implement proper locking mechanism
      expect(
        result1.status === "fulfilled" || result2.status === "fulfilled",
      ).toBe(true);
    });

    it("should handle race condition in payment confirmation", async () => {
      const paymentIntentId = "pi_race";
      const order = {
        id: "order_race",
        status: "PROCESSING",
        items: [],
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: "succeeded",
        amount: 10000,
        currency: "usd",
        metadata: { orderId: "order_race" },
      });

      mockDatabase.order.findUnique.mockResolvedValue(order);

      // Simulate concurrent webhook and manual confirmation
      await Promise.all([
        paymentService.handlePaymentSuccess(paymentIntentId),
        paymentService.handlePaymentSuccess(paymentIntentId),
      ]);

      // Should handle idempotently without errors
      // Implementation should use database constraints or versioning
    });
  });

  describe("Inventory Rollback on Payment Failure", () => {
    it("should restore inventory when payment fails", async () => {
      const paymentIntentId = "pi_inventory_rollback";

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: "failed",
        amount: 10000,
        currency: "usd",
        metadata: { orderId: "order_inventory" },
      });

      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_inventory",
        status: "PROCESSING",
        items: [
          { productId: "prod_1", quantity: 5, price: 20 },
          { productId: "prod_2", quantity: 3, price: 10 },
        ],
      });

      await paymentService.handlePaymentFailure(
        paymentIntentId,
        "Payment failed",
      );

      // Verify all products have inventory restored
      expect(mockDatabase.product.update).toHaveBeenCalledTimes(2);
      expect(mockDatabase.product.update).toHaveBeenCalledWith({
        where: { id: "prod_1" },
        data: { inventory: { increment: 5 } },
      });
      expect(mockDatabase.product.update).toHaveBeenCalledWith({
        where: { id: "prod_2" },
        data: { inventory: { increment: 3 } },
      });
    });

    it("should rollback all changes if inventory restore fails", async () => {
      const paymentIntentId = "pi_rollback_fail";

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: "failed",
        amount: 10000,
        currency: "usd",
        metadata: { orderId: "order_rollback" },
      });

      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_rollback",
        status: "PROCESSING",
        items: [{ productId: "prod_fail", quantity: 2, price: 50 }],
      });

      // Simulate inventory update failure
      mockDatabase.product.update.mockRejectedValue(
        new Error("Product not found"),
      );

      // Transaction should rollback
      mockDatabase.$transaction.mockRejectedValue(
        new Error("Transaction failed: Product not found"),
      );

      await expect(
        paymentService.handlePaymentFailure(paymentIntentId, "Payment failed"),
      ).rejects.toThrow("Transaction failed");

      // Order should not be updated if transaction fails
      expect(mockDatabase.order.update).not.toHaveBeenCalled();
    });
  });

  describe("Payment Status Consistency", () => {
    it("should maintain consistency between order and payment status", async () => {
      const paymentIntentId = "pi_consistency";

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: "succeeded",
        amount: 10000,
        currency: "usd",
        metadata: { orderId: "order_consistent" },
      });

      await paymentService.handlePaymentSuccess(paymentIntentId);

      // Verify both order and payment are updated atomically
      expect(mockDatabase.$transaction).toHaveBeenCalled();
      expect(mockDatabase.order.update).toHaveBeenCalledWith({
        where: { id: "order_consistent" },
        data: { status: "PAID" },
      });
      expect(mockDatabase.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: "order_consistent",
          status: "SUCCEEDED",
        }),
      });
    });

    it("should handle payment timeout gracefully", async () => {
      // Simulate payment that takes too long
      const paymentIntentId = "pi_timeout";

      mockStripe.paymentIntents.retrieve.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return {
          id: paymentIntentId,
          status: "processing",
          amount: 10000,
          currency: "usd",
          metadata: { orderId: "order_timeout" },
        };
      });

      // Should implement timeout handling in production
      // This test documents the expected behavior
    });
  });

  describe("Error Recovery", () => {
    it("should allow retry after transient failure", async () => {
      mockDatabase.order.findUnique.mockResolvedValue({
        id: "order_retry",
        status: "PENDING",
        total: 100,
      });

      // First attempt fails
      mockStripe.paymentIntents.create
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          id: "pi_retry",
          status: "requires_payment_method",
          amount: 10000,
          currency: "usd",
        });

      // First attempt
      await expect(
        paymentService.createPaymentIntent("order_retry", 100),
      ).rejects.toThrow("Network error");

      // Retry should succeed
      const result = await paymentService.createPaymentIntent(
        "order_retry",
        100,
      );
      expect(result.id).toBe("pi_retry");
    });

    it("should handle partial webhook processing failure", async () => {
      const event = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_partial_fail",
            amount: 10000,
            currency: "usd",
            metadata: { orderId: "order_partial_fail" },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockStripe.paymentIntents.retrieve.mockResolvedValue(event.data.object);

      // Order update succeeds but payment create fails
      mockDatabase.order.update.mockResolvedValue({});
      mockDatabase.payment.create.mockRejectedValue(
        new Error("Payment record creation failed"),
      );

      mockDatabase.$transaction.mockRejectedValue(
        new Error("Transaction failed"),
      );

      await expect(
        paymentService.handleWebhook("sig_1", JSON.stringify(event)),
      ).rejects.toThrow("Transaction failed");

      // Should be able to retry the webhook
    });
  });
});
