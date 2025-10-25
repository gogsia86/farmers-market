// src/__tests__/services/payment.service.test.ts
import { database } from "@/lib/database";
import { PaymentService } from "@/lib/services/payment.service";
import type { CreatePaymentInput } from "@/types/payment.types";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock database
vi.mock("@/lib/database");
vi.mock("@/lib/payment/stripe");
vi.mock("@/lib/payment/paypal");

describe("PaymentService - Divine Payment Orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPaymentIntent - Manifest Payment Reality", () => {
    it("creates Stripe payment intent with quantum precision", async () => {
      const input: CreatePaymentInput = {
        orderId: "order-123",
        amount: 5000, // $50.00
        currency: "USD",
        provider: "STRIPE",
      };

      const mockIntent = {
        id: "pi_123",
        clientSecret: "secret_123",
        amount: 5000,
        currency: "usd",
        status: "requires_payment_method",
      };

      const mockStripe = {
        createPaymentIntent: vi.fn().mockResolvedValue(mockIntent),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      const result = await PaymentService.createPaymentIntent(input);

      expect(result.clientSecret).toBe("secret_123");
      expect(result.amount).toBe(5000);
    });

    it("creates PayPal order with agricultural consciousness", async () => {
      const input: CreatePaymentInput = {
        orderId: "farm-order-456",
        amount: 7500,
        currency: "USD",
        provider: "PAYPAL",
      };

      const mockPayPalOrder = {
        id: "PAYPAL-789",
        status: "CREATED",
        approvalUrl: "https://paypal.com/approve/789",
      };

      const mockPayPal = {
        createOrder: vi.fn().mockResolvedValue(mockPayPalOrder),
      };

      vi.mocked(require("@/lib/payment/paypal").paypalClient).mockReturnValue(
        mockPayPal
      );

      const result = await PaymentService.createPaymentIntent(input);

      expect(result.id).toBe("PAYPAL-789");
      expect(result.status).toBe("CREATED");
    });

    it("validates amount boundaries with divine wisdom", async () => {
      const invalidInput: CreatePaymentInput = {
        orderId: "order-invalid",
        amount: -100, // Negative amount
        currency: "USD",
        provider: "STRIPE",
      };

      await expect(
        PaymentService.createPaymentIntent(invalidInput)
      ).rejects.toThrow("Amount must be positive");
    });

    it("enforces minimum payment threshold", async () => {
      const tooSmallInput: CreatePaymentInput = {
        orderId: "order-small",
        amount: 25, // $0.25 - below $0.50 minimum
        currency: "USD",
        provider: "STRIPE",
      };

      await expect(
        PaymentService.createPaymentIntent(tooSmallInput)
      ).rejects.toThrow("Amount below minimum");
    });
  });

  describe("confirmPayment - Collapse Payment Quantum State", () => {
    it("confirms Stripe payment with temporal tracking", async () => {
      const mockConfirmation = {
        id: "pi_confirmed_123",
        status: "succeeded",
        amount: 5000,
        chargeId: "ch_123",
      };

      const mockStripe = {
        confirmPayment: vi.fn().mockResolvedValue(mockConfirmation),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      (database.payment.create as any) = vi.fn().mockResolvedValue({
        id: "payment-1",
        status: "COMPLETED",
      });

      const result = await PaymentService.confirmPayment(
        "pi_confirmed_123",
        "STRIPE"
      );

      expect(result.status).toBe("succeeded");
      expect(database.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "COMPLETED",
            provider: "STRIPE",
          }),
        })
      );
    });

    it("handles PayPal payment capture with agricultural precision", async () => {
      const mockCapture = {
        id: "PAYPAL-captured-456",
        status: "COMPLETED",
        amount: { value: "75.00" },
      };

      const mockPayPal = {
        capturePayment: vi.fn().mockResolvedValue(mockCapture),
      };

      vi.mocked(require("@/lib/payment/paypal").paypalClient).mockReturnValue(
        mockPayPal
      );

      const result = await PaymentService.confirmPayment(
        "PAYPAL-captured-456",
        "PAYPAL"
      );

      expect(result.status).toBe("COMPLETED");
    });

    it("handles payment failures with enlightening errors", async () => {
      const mockFailure = {
        error: {
          code: "card_declined",
          message: "Your card was declined",
        },
      };

      const mockStripe = {
        confirmPayment: vi.fn().mockRejectedValue(mockFailure),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      await expect(
        PaymentService.confirmPayment("pi_fail_123", "STRIPE")
      ).rejects.toThrow("Your card was declined");
    });
  });

  describe("refundPayment - Reverse Payment Reality", () => {
    it("processes full refund with quantum reversal", async () => {
      const mockRefund = {
        id: "re_123",
        status: "succeeded",
        amount: 5000,
        paymentIntentId: "pi_123",
      };

      const mockStripe = {
        createRefund: vi.fn().mockResolvedValue(mockRefund),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      (database.refund.create as any) = vi.fn().mockResolvedValue({
        id: "refund-1",
        status: "COMPLETED",
      });

      const result = await PaymentService.refundPayment({
        paymentId: "payment-123",
        amount: 5000,
        reason: "Customer request",
      });

      expect(result.status).toBe("succeeded");
      expect(database.refund.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 5000,
            reason: "Customer request",
          }),
        })
      );
    });

    it("processes partial refund with divine precision", async () => {
      const mockPartialRefund = {
        id: "re_partial_456",
        status: "succeeded",
        amount: 2500, // Half refund
        paymentIntentId: "pi_456",
      };

      const mockStripe = {
        createRefund: vi.fn().mockResolvedValue(mockPartialRefund),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      const result = await PaymentService.refundPayment({
        paymentId: "payment-456",
        amount: 2500,
        reason: "Partial order cancellation",
      });

      expect(result.amount).toBe(2500);
    });

    it("validates refund amount does not exceed original", async () => {
      (database.payment.findUnique as any) = vi.fn().mockResolvedValue({
        id: "payment-1",
        amount: 5000,
      });

      await expect(
        PaymentService.refundPayment({
          paymentId: "payment-1",
          amount: 6000, // Exceeds original
          reason: "Over-refund attempt",
        })
      ).rejects.toThrow("Refund amount exceeds payment");
    });
  });

  describe("getPaymentHistory - Retrieve Payment Consciousness", () => {
    it("retrieves user payment history with temporal ordering", async () => {
      const mockPayments = [
        {
          id: "payment-1",
          userId: "user-123",
          amount: 5000,
          status: "COMPLETED",
          createdAt: new Date("2025-01-02"),
        },
        {
          id: "payment-2",
          userId: "user-123",
          amount: 3000,
          status: "COMPLETED",
          createdAt: new Date("2025-01-01"),
        },
      ];

      (database.payment.findMany as any) = vi
        .fn()
        .mockResolvedValue(mockPayments);

      const result = await PaymentService.getPaymentHistory("user-123", {
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockPayments);
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].createdAt.getTime()).toBeGreaterThan(
        result[1].createdAt.getTime()
      );
    });

    it("filters by payment status with divine clarity", async () => {
      (database.payment.findMany as any) = vi.fn().mockResolvedValue([]);

      await PaymentService.getPaymentHistory("user-123", {
        status: "FAILED",
        limit: 20,
        offset: 0,
      });

      expect(database.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: "user-123",
            status: "FAILED",
          },
        })
      );
    });
  });

  describe("Webhook Processing - Event Reality Manifestation", () => {
    it("processes Stripe webhook with signature verification", async () => {
      const mockEvent = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_webhook_123",
            amount: 5000,
            status: "succeeded",
          },
        },
      };

      const mockStripe = {
        constructWebhookEvent: vi.fn().mockReturnValue(mockEvent),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      (database.payment.update as any) = vi.fn().mockResolvedValue({
        id: "payment-webhook-1",
        status: "COMPLETED",
      });

      await PaymentService.processWebhook({
        provider: "STRIPE",
        signature: "whsec_123",
        payload: JSON.stringify(mockEvent),
      });

      expect(database.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { providerPaymentId: "pi_webhook_123" },
          data: { status: "COMPLETED" },
        })
      );
    });

    it("handles refund webhook events with quantum precision", async () => {
      const mockRefundEvent = {
        type: "charge.refunded",
        data: {
          object: {
            id: "ch_refund_456",
            refunds: {
              data: [{ id: "re_456", amount: 2500 }],
            },
          },
        },
      };

      const mockStripe = {
        constructWebhookEvent: vi.fn().mockReturnValue(mockRefundEvent),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      await PaymentService.processWebhook({
        provider: "STRIPE",
        signature: "whsec_refund",
        payload: JSON.stringify(mockRefundEvent),
      });

      expect(database.refund.create).toHaveBeenCalled();
    });

    it("rejects invalid webhook signatures", async () => {
      const mockStripe = {
        constructWebhookEvent: vi.fn().mockImplementation(() => {
          throw new Error("Invalid signature");
        }),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      await expect(
        PaymentService.processWebhook({
          provider: "STRIPE",
          signature: "invalid_sig",
          payload: "{}",
        })
      ).rejects.toThrow("Invalid signature");
    });
  });

  describe("Agricultural Payment Patterns - Farm-Specific Logic", () => {
    it("applies farm-to-table payment consciousness", async () => {
      const farmInput: CreatePaymentInput = {
        orderId: "farm-direct-order-789",
        amount: 12500, // $125.00
        currency: "USD",
        provider: "STRIPE",
        metadata: {
          farmId: "organic-valley-farm",
          deliveryMethod: "FARM_PICKUP",
          agriculturalConsciousness: "biodynamic",
        },
      };

      const mockIntent = {
        id: "pi_farm_123",
        clientSecret: "farm_secret_123",
        metadata: farmInput.metadata,
      };

      const mockStripe = {
        createPaymentIntent: vi.fn().mockResolvedValue(mockIntent),
      };

      vi.mocked(require("@/lib/payment/stripe").stripeClient).mockReturnValue(
        mockStripe
      );

      const result = await PaymentService.createPaymentIntent(farmInput);

      expect(result.metadata?.farmId).toBe("organic-valley-farm");
      expect(result.metadata?.agriculturalConsciousness).toBe("biodynamic");
    });
  });
});
