/**
 * 🧪 PAYPAL SERVICE UNIT TESTS
 * Divine Test Coverage for PayPal Integration
 *
 * Test Coverage:
 * - Order creation
 * - Payment capture
 * - Refund processing
 * - Error handling
 * - Token management
 * - Fee calculations
 *
 * @divine-pattern Comprehensive Testing
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { database } from "@/lib/database";
import { PayPalService } from "../paypal.service";

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================

// Set mock PayPal credentials for testing
process.env.PAYPAL_CLIENT_ID = "test_client_id";
process.env.PAYPAL_CLIENT_SECRET = "test_client_secret";
process.env.PAYPAL_MODE = "sandbox";

// ============================================================================
// MOCKS
// ============================================================================

// Mock database
jest.mock("@/lib/database", () => ({
  database: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

// ============================================================================
// TEST DATA
// ============================================================================

const mockOrder = {
  id: "order_123",
  orderNumber: "FM-2025-0001",
  customerId: "customer_123",
  farmId: "farm_123",
  total: 125.5,
  subtotal: 100.0,
  tax: 10.0,
  deliveryFee: 15.5,
  status: "PENDING",
  paymentStatus: "PENDING",
  paymentIntentId: null,
  customer: {
    id: "customer_123",
    email: "customer@example.com",
  },
  farm: {
    id: "farm_123",
    name: "Green Valley Farm",
  },
  items: [
    {
      id: "item_1",
      productId: "product_1",
      quantity: 2,
      unitPrice: 25.0,
      subtotal: 50.0,
      product: {
        name: "Organic Tomatoes",
        description: "Fresh organic tomatoes",
      },
    },
    {
      id: "item_2",
      productId: "product_2",
      quantity: 1,
      unitPrice: 50.0,
      subtotal: 50.0,
      product: {
        name: "Farm Fresh Eggs",
        description: "Free-range eggs",
      },
    },
  ],
};

const mockPayPalOrder = {
  id: "PAYPAL123456",
  status: "CREATED",
  links: [
    {
      href: "https://www.paypal.com/checkoutnow?token=PAYPAL123456",
      rel: "approve",
      method: "GET",
    },
  ],
};

const mockPayPalCapture = {
  id: "PAYPAL123456",
  status: "COMPLETED",
  purchase_units: [
    {
      payments: {
        captures: [
          {
            id: "CAPTURE123",
            amount: {
              currency_code: "USD",
              value: "125.50",
            },
            create_time: "2025-01-15T10:30:00Z",
          },
        ],
      },
    },
  ],
  payer: {
    email_address: "payer@example.com",
    name: {
      given_name: "John",
      surname: "Doe",
    },
  },
};

const mockAccessToken = {
  access_token: "A21AABcdefghijklmnop",
  token_type: "Bearer",
  expires_in: 32400,
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe("PayPalService", () => {
  let paypalService: PayPalService;

  beforeEach(() => {
    jest.clearAllMocks();
    paypalService = new PayPalService();
  });

  // ==========================================================================
  // CONSTRUCTOR TESTS
  // ==========================================================================

  describe("Constructor", () => {
    it("should throw error if credentials are missing", async () => {
      const originalClientId = process.env.PAYPAL_CLIENT_ID;
      const originalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

      delete process.env.PAYPAL_CLIENT_ID;
      delete process.env.PAYPAL_CLIENT_SECRET;

      const service = new PayPalService();
      const mockRequest: PayPalOrderRequest = {
        orderId: "test-order",
        amount: 100,
        currency: "USD",
      };

      // Calling a method triggers lazy initialization which validates credentials
      await expect(service.createOrder(mockRequest)).rejects.toThrow(
        "PayPal credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are required",
      );

      process.env.PAYPAL_CLIENT_ID = originalClientId;
      process.env.PAYPAL_CLIENT_SECRET = originalClientSecret;
    });

    it("should initialize with correct environment", () => {
      expect(paypalService).toBeInstanceOf(PayPalService);
    });
  });

  // ==========================================================================
  // CREATE ORDER TESTS
  // ==========================================================================

  describe("createOrder", () => {
    beforeEach(() => {
      // Mock access token
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessToken,
      });
    });

    it("should create PayPal order successfully", async () => {
      // Mock database response
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      // Mock PayPal API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayPalOrder,
      });

      // Mock database update
      (database.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        paymentIntentId: mockPayPalOrder.id,
      });

      const result = await paypalService.createOrder({
        orderId: "order_123",
        amount: 125.5,
        currency: "USD",
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockPayPalOrder.id);
      expect(result.data?.approvalUrl).toContain("paypal.com");
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order_123" },
        data: {
          paymentIntentId: mockPayPalOrder.id,
          paymentStatus: "PENDING",
        },
      });
    });

    it("should return error if order not found", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await paypalService.createOrder({
        orderId: "order_123",
        amount: 125.5,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORDER_NOT_FOUND");
    });

    it("should validate amount matches order total", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await paypalService.createOrder({
        orderId: "order_123",
        amount: 999.99, // Wrong amount
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("AMOUNT_MISMATCH");
    });

    it("should handle PayPal API errors", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: "Invalid request",
        }),
      });

      const result = await paypalService.createOrder({
        orderId: "order_123",
        amount: 125.5,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYPAL_ORDER_CREATION_FAILED");
    });

    it("should handle missing approval URL", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "PAYPAL123",
          status: "CREATED",
          links: [], // No approval link
        }),
      });

      const result = await paypalService.createOrder({
        orderId: "order_123",
        amount: 125.5,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("APPROVAL_URL_NOT_FOUND");
    });
  });

  // ==========================================================================
  // CAPTURE ORDER TESTS
  // ==========================================================================

  describe("captureOrder", () => {
    beforeEach(() => {
      // Mock access token
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessToken,
      });
    });

    it("should capture PayPal order successfully", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayPalCapture,
      });

      (database.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "PAID",
      });

      const result = await paypalService.captureOrder({
        paypalOrderId: "PAYPAL123456",
        orderId: "order_123",
        expectedAmount: 125.5,
      });

      expect(result.success).toBe(true);
      expect(result.data?.captureId).toBe("CAPTURE123");
      expect(result.data?.status).toBe("COMPLETED");
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order_123" },
        data: {
          paymentStatus: "PAID",
          paidAt: expect.any(Date),
          status: "CONFIRMED",
          paymentIntentId: "PAYPAL123456",
        },
      });
    });

    it("should return error if order not found", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await paypalService.captureOrder({
        paypalOrderId: "PAYPAL123456",
        orderId: "order_123",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORDER_NOT_FOUND");
    });

    it("should validate captured amount", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPayPalCapture,
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    id: "CAPTURE123",
                    amount: {
                      currency_code: "USD",
                      value: "999.99", // Wrong amount
                    },
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await paypalService.captureOrder({
        paypalOrderId: "PAYPAL123456",
        orderId: "order_123",
        expectedAmount: 125.5,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("AMOUNT_MISMATCH");
    });

    it("should handle PayPal capture errors", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: "Capture failed",
        }),
      });

      const result = await paypalService.captureOrder({
        paypalOrderId: "PAYPAL123456",
        orderId: "order_123",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYPAL_CAPTURE_FAILED");
    });

    it("should extract payer information", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayPalCapture,
      });

      (database.order.update as jest.Mock).mockResolvedValue(mockOrder);

      const result = await paypalService.captureOrder({
        paypalOrderId: "PAYPAL123456",
        orderId: "order_123",
      });

      expect(result.success).toBe(true);
      expect(result.data?.payerEmail).toBe("payer@example.com");
      expect(result.data?.payerName).toBe("John Doe");
    });
  });

  // ==========================================================================
  // GET ORDER DETAILS TESTS
  // ==========================================================================

  describe("getOrderDetails", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessToken,
      });
    });

    it("should get PayPal order details successfully", async () => {
      const mockDetails = {
        id: "PAYPAL123456",
        status: "APPROVED",
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "125.50",
            },
          },
        ],
        create_time: "2025-01-15T10:00:00Z",
        update_time: "2025-01-15T10:30:00Z",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetails,
      });

      const result = await paypalService.getOrderDetails("PAYPAL123456");

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("PAYPAL123456");
      expect(result.data?.status).toBe("APPROVED");
    });

    it("should handle API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Order not found" }),
      });

      const result = await paypalService.getOrderDetails("INVALID_ID");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYPAL_ORDER_FETCH_FAILED");
    });
  });

  // ==========================================================================
  // REFUND TESTS
  // ==========================================================================

  describe("refundCapture", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessToken,
      });
    });

    it("should process full refund successfully", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const mockRefund = {
        id: "REFUND123",
        status: "COMPLETED",
        amount: {
          currency_code: "USD",
          value: "125.50",
        },
        create_time: "2025-01-15T11:00:00Z",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefund,
      });

      (database.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "REFUNDED",
      });

      const result = await paypalService.refundCapture({
        captureId: "CAPTURE123",
        orderId: "order_123",
        amount: 125.5,
        currency: "USD",
        reason: "Customer request",
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("REFUND123");
      expect(result.data?.status).toBe("COMPLETED");
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order_123" },
        data: {
          paymentStatus: "REFUNDED",
          status: "CANCELLED",
        },
      });
    });

    it("should process partial refund successfully", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const mockRefund = {
        id: "REFUND123",
        status: "COMPLETED",
        amount: {
          currency_code: "USD",
          value: "50.00", // Partial refund
        },
        create_time: "2025-01-15T11:00:00Z",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefund,
      });

      (database.order.update as jest.Mock).mockResolvedValue(mockOrder);

      const result = await paypalService.refundCapture({
        captureId: "CAPTURE123",
        orderId: "order_123",
        amount: 50.0,
        currency: "USD",
      });

      expect(result.success).toBe(true);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order_123" },
        data: {
          paymentStatus: "PARTIALLY_REFUNDED",
          status: mockOrder.status,
        },
      });
    });

    it("should return error if order not found", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await paypalService.refundCapture({
        captureId: "CAPTURE123",
        orderId: "order_123",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORDER_NOT_FOUND");
    });
  });

  // ==========================================================================
  // FEE CALCULATION TESTS
  // ==========================================================================

  describe("Fee Calculations", () => {
    it("should calculate PayPal fee correctly", () => {
      expect(paypalService.calculateFee(100)).toBe(3.2); // 2.9% + $0.30
      expect(paypalService.calculateFee(50)).toBeCloseTo(1.75, 2); // 50 * 0.029 + 0.30 = 1.75
      expect(paypalService.calculateFee(10)).toBeCloseTo(0.59, 2); // 10 * 0.029 + 0.30 = 0.59
    });

    it("should calculate net amount correctly", () => {
      expect(paypalService.calculateNet(100)).toBe(96.8);
      expect(paypalService.calculateNet(50)).toBeCloseTo(48.25, 2); // 50 - 1.75 = 48.25
      expect(paypalService.calculateNet(10)).toBeCloseTo(9.41, 2);
    });

    it("should handle edge cases", () => {
      expect(paypalService.calculateFee(0)).toBe(0.3);
      expect(paypalService.calculateNet(0)).toBe(-0.3);
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      // Mock access token success first
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessToken,
      });

      // Then fail on order creation
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result = await paypalService.createOrder({
        orderId: "order_123",
        amount: 125.5,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYPAL_ORDER_ERROR");
    });

    it("should handle authentication failures", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "invalid_client" }),
      });

      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await paypalService.createOrder({
        orderId: "order_123",
        amount: 125.5,
      });

      expect(result.success).toBe(false);
    });
  });
});
