/**
 * 🧪 CHECKOUT API INTEGRATION TESTS
 * Comprehensive integration tests for order creation and checkout flow
 *
 * Test Coverage:
 * - Order creation endpoint validation
 * - Authentication and authorization
 * - Input validation (shippingAddress, fulfillmentMethod)
 * - CheckoutService integration
 * - Error handling
 * - Multiple order creation (one per farm)
 *
 * @divine-pattern Quantum Testing Consciousness
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference 13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { auth } from "@/lib/auth";
import { checkoutService } from "@/lib/services/checkout.service";
import { NextRequest } from "next/server";
import { GET, POST } from "../create-order/route";

// ============================================================================
// MOCKS
// ============================================================================

// Mock NextAuth
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// Mock CheckoutService
jest.mock("@/lib/services/checkout.service", () => ({
  checkoutService: {
    createOrderFromCheckout: jest.fn(),
    getCheckoutStatus: jest.fn(),
  },
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockUser = {
  id: "user-123",
  email: "customer@example.com",
  name: "Test Customer",
  role: "CUSTOMER",
};

const mockSession = {
  user: mockUser,
};

const mockShippingAddress = {
  street: "123 Farm Road",
  street2: "Apt 4",
  city: "Portland",
  state: "OR",
  zipCode: "97201",
  country: "US",
};

const mockOrder = {
  id: "order-123",
  orderNumber: "ORD-2025-001",
  farmId: "farm-1",
  customerId: "user-123",
  status: "PENDING",
  paymentStatus: "PENDING",
  fulfillmentMethod: "DELIVERY",
  total: 56.97,
  subtotal: 45.99,
  tax: 3.68,
  deliveryFee: 5.0,
  platformFee: 2.3,
  totalAmount: 56.97,
  farmerAmount: 48.99,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: "item-1",
      orderId: "order-123",
      productId: "prod-1",
      quantity: 2,
      priceAtPurchase: 12.99,
      subtotal: 25.98,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  farm: {
    id: "farm-1",
    name: "Sunshine Farms",
    slug: "sunshine-farms",
    description: "Organic farm",
    ownerId: "farmer-1",
    location: { address: "Farm Location", city: "Portland", state: "OR" },
    contactEmail: "farm@example.com",
    contactPhone: "555-0100",
    certifications: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  customer: mockUser,
  deliveryAddress: {
    id: "addr-123",
    userId: "user-123",
    type: "HOME",
    label: "Home",
    street: "123 Farm Road",
    street2: "Apt 4",
    city: "Portland",
    state: "OR",
    zipCode: "97201",
    country: "US",
    latitude: 45.5152,
    longitude: -122.6784,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const mockMultipleOrders = [
  mockOrder,
  {
    ...mockOrder,
    id: "order-124",
    orderNumber: "ORD-2025-002",
    farmId: "farm-2",
    farm: {
      ...mockOrder.farm,
      id: "farm-2",
      name: "Green Valley Farm",
    },
  },
];

// Helper to create mock NextRequest
function createMockRequest(body: any): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers(),
    nextUrl: new URL("http://localhost:3000/api/checkout/create-order"),
  } as any as NextRequest;
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe("POST /api/checkout/create-order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  describe("Authentication", () => {
    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Authentication required");
    });

    it("should accept authenticated requests", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder,
      });

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  // ==========================================================================
  // INPUT VALIDATION
  // ==========================================================================

  describe("Input Validation", () => {
    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
    });

    it("should validate required fulfillmentMethod", async () => {
      const request = createMockRequest({
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid request data");
    });

    it("should require shippingAddress or shippingAddressId for DELIVERY", async () => {
      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Shipping address is required for delivery");
    });

    it("should accept PICKUP without shipping address", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockOrder, fulfillmentMethod: "PICKUP" },
      });

      const request = createMockRequest({
        fulfillmentMethod: "PICKUP",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it("should validate fulfillmentMethod enum", async () => {
      const request = createMockRequest({
        fulfillmentMethod: "INVALID_METHOD",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should accept shippingAddressId", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder,
      });

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddressId: "addr-123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(checkoutService.createOrderFromCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          shippingAddressId: "addr-123",
        }),
      );
    });

    it("should validate shippingAddress fields", async () => {
      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: {
          street: "", // Invalid - empty
          city: "Portland",
          state: "OR",
          zipCode: "97201",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should allow optional fields", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder,
      });

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
        deliveryInstructions: "Leave at door",
        specialInstructions: "Call on arrival",
        paymentMethodId: "pm_123",
        stripePaymentIntentId: "pi_123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(checkoutService.createOrderFromCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryInstructions: "Leave at door",
          specialInstructions: "Call on arrival",
          paymentMethodId: "pm_123",
          stripePaymentIntentId: "pi_123",
        }),
      );
    });
  });

  // ==========================================================================
  // ORDER CREATION
  // ==========================================================================

  describe("Order Creation", () => {
    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
    });

    it("should create single order successfully", async () => {
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder,
      });

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.order).toEqual({
        id: mockOrder.id,
        orderNumber: mockOrder.orderNumber,
        status: mockOrder.status,
        total: mockOrder.total,
        itemCount: mockOrder.items.length,
        farmCount: 1,
      });
      expect(data.message).toBe("Order created successfully");
    });

    it("should handle multiple orders (one per farm)", async () => {
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMultipleOrders,
      });

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.order.farmCount).toBe(2);
      expect(data.orders).toHaveLength(2);
      expect(data.message).toBe("2 orders created successfully");
      expect(data.orders[0]).toEqual({
        id: mockMultipleOrders[0].id,
        orderNumber: mockMultipleOrders[0].orderNumber,
        farmId: mockMultipleOrders[0].farmId,
        farmName: mockMultipleOrders[0].farm.name,
        total: mockMultipleOrders[0].total,
        itemCount: mockMultipleOrders[0].items.length,
      });
    });

    it("should call checkoutService with correct parameters", async () => {
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder,
      });

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
        deliveryInstructions: "Leave at door",
        specialInstructions: "Organic only",
      });

      await POST(request);

      expect(checkoutService.createOrderFromCheckout).toHaveBeenCalledWith({
        userId: mockUser.id,
        shippingAddressId: undefined,
        shippingAddress: mockShippingAddress,
        fulfillmentMethod: "DELIVERY",
        deliveryInstructions: "Leave at door",
        specialInstructions: "Organic only",
        paymentMethodId: undefined,
        stripePaymentIntentId: undefined,
      });
    });

    it("should handle service errors", async () => {
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          code: "CART_EMPTY",
          message: "Cart is empty",
        },
      });

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Cart is empty");
    });

    it("should handle missing order data", async () => {
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      });

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("No order data returned");
    });

    it("should handle unexpected errors", async () => {
      (checkoutService.createOrderFromCheckout as jest.Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        "An unexpected error occurred while creating your order",
      );
      expect(data.details).toBe("Database connection failed");
    });
  });

  // ==========================================================================
  // FULFILLMENT METHODS
  // ==========================================================================

  describe("Fulfillment Methods", () => {
    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (checkoutService.createOrderFromCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder,
      });
    });

    it("should handle DELIVERY fulfillment", async () => {
      const request = createMockRequest({
        fulfillmentMethod: "DELIVERY",
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(checkoutService.createOrderFromCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          fulfillmentMethod: "DELIVERY",
        }),
      );
    });

    it("should handle PICKUP fulfillment", async () => {
      const request = createMockRequest({
        fulfillmentMethod: "PICKUP",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(checkoutService.createOrderFromCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          fulfillmentMethod: "PICKUP",
        }),
      );
    });
  });
});

// ============================================================================
// GET CHECKOUT STATUS TESTS
// ============================================================================

describe("GET /api/checkout/create-order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = {} as NextRequest;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Authentication required");
  });

  it("should return checkout status", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);
    (checkoutService.getCheckoutStatus as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        hasActiveCart: true,
        itemCount: 5,
        total: 56.97,
      },
    });

    const request = {} as NextRequest;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.status).toEqual({
      hasActiveCart: true,
      itemCount: 5,
      total: 56.97,
    });
  });

  it("should handle service errors", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);
    (checkoutService.getCheckoutStatus as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        code: "SERVICE_ERROR",
        message: "Failed to fetch status",
      },
    });

    const request = {} as NextRequest;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch status");
  });

  it("should handle unexpected errors", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);
    (checkoutService.getCheckoutStatus as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );

    const request = {} as NextRequest;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to get checkout status");
  });
});
