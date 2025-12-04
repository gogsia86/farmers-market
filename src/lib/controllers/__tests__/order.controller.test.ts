/**
 * 🛒 ORDER CONTROLLER TESTS - HTTP REQUEST HANDLER TESTING
 *
 * Comprehensive tests for OrderController with mocked service layer.
 * Tests API request handling, validation, authentication, authorization, and responses.
 *
 * Divine Patterns Applied:
 * - Mock service layer for isolation
 * - Test HTTP request/response handling
 * - Verify authentication & authorization
 * - Test validation schemas
 * - Agricultural consciousness in assertions
 * - State machine validation
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { NextRequest } from "next/server";
import { orderController } from "../order.controller";
import { OrderService } from "@/lib/services/order.service.refactored";
import { auth } from "@/lib/auth";
import type {
  OrderWithDetails,
  GetOrdersResponse,
  OrderStatistics,
} from "@/lib/services/order.service.refactored";

// ============================================
// MOCK SETUP
// ============================================

// Mock the OrderService
jest.mock("@/lib/services/order.service.refactored", () => {
  return {
    OrderService: jest.fn().mockImplementation(() => ({
      createOrder: jest.fn(),
      getOrders: jest.fn(),
      getOrderById: jest.fn(),
      updateOrder: jest.fn(),
      cancelOrder: jest.fn(),
      getOrderStatistics: jest.fn(),
    })),
  };
});

// Mock NextAuth
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// ============================================
// TEST DATA - QUANTUM ORDER FIXTURES
// ============================================

const mockCustomerId = "user_divine_customer_123";
const mockFarmerId = "user_divine_farmer_456";
const mockFarmId = "farm_biodynamic_001";
const mockOrderId = "order_quantum_789";
const mockProductId = "product_organic_tomatoes_001";
const mockAddressId = "address_seattle_001";

const mockCustomerSession = {
  user: {
    id: mockCustomerId,
    email: "customer@divine.farm",
    name: "Divine Customer",
    role: "CUSTOMER",
  },
};

const mockFarmerSession = {
  user: {
    id: mockFarmerId,
    email: "farmer@divine.farm",
    name: "Divine Farmer",
    role: "FARMER",
  },
};

const mockAdminSession = {
  user: {
    id: "user_admin_999",
    email: "admin@divine.farm",
    name: "Divine Admin",
    role: "ADMIN",
  },
};

const mockQuantumOrder: OrderWithDetails = {
  id: mockOrderId,
  orderNumber: "ORD-2024-001",
  customerId: mockCustomerId,
  farmId: mockFarmId,
  status: "CONFIRMED",
  paymentStatus: "PAID",
  fulfillmentMethod: "DELIVERY",
  subtotal: 29.95,
  deliveryFee: 5.0,
  platformFee: 2.5,
  tax: 2.8,
  totalAmount: 40.25,
  farmerAmount: 32.45,
  specialInstructions: "Please leave at front door",
  scheduledDate: new Date("2024-12-20T10:00:00Z"),
  createdAt: new Date("2024-12-15T10:00:00Z"),
  updatedAt: new Date("2024-12-15T10:00:00Z"),
  items: [
    {
      id: "item_001",
      orderId: mockOrderId,
      productId: mockProductId,
      quantity: 5,
      priceAtPurchase: 5.99,
      subtotal: 29.95,
      createdAt: new Date("2024-12-15T10:00:00Z"),
      updatedAt: new Date("2024-12-15T10:00:00Z"),
    },
  ],
  customer: {
    id: mockCustomerId,
    name: "Divine Customer",
    email: "customer@divine.farm",
    image: null,
    emailVerified: null,
    role: "CUSTOMER",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
  farm: {
    id: mockFarmId,
    name: "Divine Acres Farm",
    slug: "divine-acres-seattle",
    description: "Biodynamic farm with quantum consciousness",
    ownerId: mockFarmerId,
    location: {
      address: "123 Farm Lane",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      coordinates: { lat: 47.6062, lng: -122.3321 },
    },
    contactEmail: "contact@divineacres.farm",
    contactPhone: "+1-206-555-0100",
    certifications: ["USDA_ORGANIC"],
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
  fulfillment: null,
};

// Helper to create mock NextRequest
function createMockRequest(
  method: string,
  url: string,
  body?: any,
  searchParams?: Record<string, string>,
): NextRequest {
  const fullUrl = new URL(url, "http://localhost:3000");

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      fullUrl.searchParams.set(key, value);
    });
  }

  return {
    method,
    url: fullUrl.toString(),
    nextUrl: fullUrl,
    json: jest.fn().mockResolvedValue(body || {}),
    headers: new Headers(),
  } as any as NextRequest;
}

// ============================================
// TEST SUITE - ORDER CONTROLLER
// ============================================

describe("OrderController - HTTP Request Handlers", () => {
  let mockOrderService: any;
  let testOrderController: typeof orderController;

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(null);

    // Create mock service instance
    mockOrderService = {
      createOrder: jest.fn(),
      getOrders: jest.fn(),
      getOrderById: jest.fn(),
      updateOrder: jest.fn(),
      cancelOrder: jest.fn(),
      getOrderStatistics: jest.fn(),
    };

    // Create controller with mock service
    const OrderControllerClass = require("../order.controller").OrderController;
    testOrderController = new OrderControllerClass(mockOrderService);
  });

  // ============================================
  // CREATE ORDER - POST /api/orders
  // ============================================

  describe("createOrder - POST /api/orders", () => {
    const validOrderRequest = {
      customerId: mockCustomerId,
      farmId: mockFarmId,
      items: [{ productId: mockProductId, quantity: 5 }],
      fulfillmentMethod: "DELIVERY",
      deliveryAddressId: mockAddressId,
      specialInstructions: "Please leave at front door",
    };

    it("should create order successfully with valid data", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);
      mockOrderService.createOrder = jest
        .fn()
        .mockResolvedValue(mockQuantumOrder);

      const request = createMockRequest(
        "POST",
        "/api/orders",
        validOrderRequest,
      );

      const response = await testOrderController.createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockOrderId);
      expect(data.data.orderNumber).toBe("ORD-2024-001");
      expect(data.meta.message).toBe("Order created successfully");
      expect(data.meta.agricultural?.consciousness).toBe("DIVINE");
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: mockCustomerId,
          farmId: mockFarmId,
          items: [{ productId: mockProductId, quantity: 5 }],
          fulfillmentMethod: "DELIVERY",
        }),
      );
    });

    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "POST",
        "/api/orders",
        validOrderRequest,
      );

      const response = await testOrderController.createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should prevent customers from creating orders for other users", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);

      const requestWithDifferentCustomer = {
        ...validOrderRequest,
        customerId: "user_different_customer_999",
      };

      const request = createMockRequest(
        "POST",
        "/api/orders",
        requestWithDifferentCustomer,
      );

      const response = await testOrderController.createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHORIZATION_FAILED");
      expect(mockOrderService.createOrder).not.toHaveBeenCalled();
    });

    it("should allow admin to create orders for any customer", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      mockOrderService.createOrder = jest
        .fn()
        .mockResolvedValue(mockQuantumOrder);

      const request = createMockRequest(
        "POST",
        "/api/orders",
        validOrderRequest,
      );

      const response = await testOrderController.createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockOrderService.createOrder).toHaveBeenCalled();
    });

    it("should validate request body with Zod schema", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);

      const invalidRequest = {
        customerId: mockCustomerId,
        // Missing required fields: farmId, items, fulfillmentMethod
      };

      const request = createMockRequest("POST", "/api/orders", invalidRequest);

      const response = await testOrderController.createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(mockOrderService.createOrder).not.toHaveBeenCalled();
    });

    it("should require deliveryAddressId for DELIVERY fulfillment method", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);

      const requestWithoutAddress = {
        ...validOrderRequest,
        fulfillmentMethod: "DELIVERY",
        deliveryAddressId: undefined,
      };

      const request = createMockRequest(
        "POST",
        "/api/orders",
        requestWithoutAddress,
      );

      const response = await testOrderController.createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should allow orders without deliveryAddressId for FARM_PICKUP", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);
      mockOrderService.createOrder = jest
        .fn()
        .mockResolvedValue(mockQuantumOrder);

      const pickupRequest = {
        ...validOrderRequest,
        fulfillmentMethod: "FARM_PICKUP",
        deliveryAddressId: undefined,
      };

      const request = createMockRequest("POST", "/api/orders", pickupRequest);

      const response = await testOrderController.createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  // ============================================
  // GET ORDERS - GET /api/orders
  // ============================================

  describe("getOrders - GET /api/orders", () => {
    const mockOrdersResponse: GetOrdersResponse = {
      orders: [mockQuantumOrder],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    it("should return paginated list of orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      mockOrderService.getOrders = jest
        .fn()
        .mockResolvedValue(mockOrdersResponse);

      const request = createMockRequest("GET", "/api/orders");

      const response = await testOrderController.getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe(mockOrderId);
      expect(data.meta.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest("GET", "/api/orders");

      const response = await testOrderController.getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should filter to customer's own orders for CUSTOMER role", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);
      mockOrderService.getOrders = jest
        .fn()
        .mockResolvedValue(mockOrdersResponse);

      const request = createMockRequest("GET", "/api/orders");

      await testOrderController.getOrders(request);

      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: mockCustomerId,
        }),
      );
    });

    it("should allow admin to view all orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      mockOrderService.getOrders = jest
        .fn()
        .mockResolvedValue(mockOrdersResponse);

      const request = createMockRequest("GET", "/api/orders");

      await testOrderController.getOrders(request);

      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      );
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        expect.not.objectContaining({
          customerId: expect.any(String),
        }),
      );
    });

    it("should handle query parameters for filtering", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      mockOrderService.getOrders = jest
        .fn()
        .mockResolvedValue(mockOrdersResponse);

      const request = createMockRequest("GET", "/api/orders", undefined, {
        page: "2",
        limit: "50",
        status: "CONFIRMED",
        farmId: mockFarmId,
        fulfillmentMethod: "DELIVERY",
      });

      await testOrderController.getOrders(request);

      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 50,
          status: "CONFIRMED",
          farmId: mockFarmId,
          fulfillmentMethod: "DELIVERY",
        }),
      );
    });

    it("should validate query parameters", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);

      const request = createMockRequest("GET", "/api/orders", undefined, {
        page: "invalid",
      });

      const response = await testOrderController.getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // GET ORDER BY ID - GET /api/orders/[id]
  // ============================================

  describe("getOrderById - GET /api/orders/[id]", () => {
    it("should return order by ID", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);
      mockOrderService.getOrderById = jest
        .fn()
        .mockResolvedValue(mockQuantumOrder);

      const request = createMockRequest("GET", `/api/orders/${mockOrderId}`);

      const response = await testOrderController.getOrderById(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockOrderId);
      expect(data.data.orderNumber).toBe("ORD-2024-001");
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith(mockOrderId);
    });

    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest("GET", `/api/orders/${mockOrderId}`);

      const response = await testOrderController.getOrderById(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should return 404 if order not found", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);
      mockOrderService.getOrderById = jest.fn().mockResolvedValue(null);

      const request = createMockRequest("GET", `/api/orders/${mockOrderId}`);

      const response = await testOrderController.getOrderById(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("should prevent customers from viewing other customers' orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);

      const otherCustomerOrder = {
        ...mockQuantumOrder,
        customerId: "user_other_customer_999",
      };

      mockOrderService.getOrderById = jest
        .fn()
        .mockResolvedValue(otherCustomerOrder);

      const request = createMockRequest("GET", `/api/orders/${mockOrderId}`);

      const response = await testOrderController.getOrderById(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHORIZATION_FAILED");
    });

    it("should allow admin to view any order", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);

      const otherCustomerOrder = {
        ...mockQuantumOrder,
        customerId: "user_other_customer_999",
      };

      mockOrderService.getOrderById = jest
        .fn()
        .mockResolvedValue(otherCustomerOrder);

      const request = createMockRequest("GET", `/api/orders/${mockOrderId}`);

      const response = await testOrderController.getOrderById(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================
  // GET CUSTOMER ORDERS - GET /api/customers/[customerId]/orders
  // ============================================

  describe("getCustomerOrders - GET /api/customers/[customerId]/orders", () => {
    const mockOrdersResponse: GetOrdersResponse = {
      orders: [mockQuantumOrder],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    it("should return customer's orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);
      mockOrderService.getOrders = jest
        .fn()
        .mockResolvedValue(mockOrdersResponse);

      const request = createMockRequest(
        "GET",
        `/api/customers/${mockCustomerId}/orders`,
      );

      const response = await testOrderController.getCustomerOrders(request, {
        customerId: mockCustomerId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: mockCustomerId,
        }),
      );
    });

    it("should prevent viewing other customer's orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);

      const otherCustomerId = "user_other_customer_999";

      const request = createMockRequest(
        "GET",
        `/api/customers/${otherCustomerId}/orders`,
      );

      const response = await testOrderController.getCustomerOrders(request, {
        customerId: otherCustomerId,
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHORIZATION_FAILED");
    });

    it("should allow admin to view any customer's orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      mockOrderService.getOrders = jest
        .fn()
        .mockResolvedValue(mockOrdersResponse);

      const otherCustomerId = "user_other_customer_999";

      const request = createMockRequest(
        "GET",
        `/api/customers/${otherCustomerId}/orders`,
      );

      const response = await testOrderController.getCustomerOrders(request, {
        customerId: otherCustomerId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================
  // GET FARM ORDERS - GET /api/farms/[farmId]/orders
  // ============================================

  describe("getFarmOrders - GET /api/farms/[farmId]/orders", () => {
    const mockOrdersResponse: GetOrdersResponse = {
      orders: [mockQuantumOrder],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    it("should return farm's orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockFarmerSession);
      mockOrderService.getOrders = jest
        .fn()
        .mockResolvedValue(mockOrdersResponse);

      const request = createMockRequest(
        "GET",
        `/api/farms/${mockFarmId}/orders`,
      );

      const response = await testOrderController.getFarmOrders(request, {
        farmId: mockFarmId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.meta.agricultural?.consciousness).toBe("BIODYNAMIC");
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          farmId: mockFarmId,
        }),
      );
    });

    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "GET",
        `/api/farms/${mockFarmId}/orders`,
      );

      const response = await testOrderController.getFarmOrders(request, {
        farmId: mockFarmId,
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should handle query parameters", async () => {
      (auth as jest.Mock).mockResolvedValue(mockFarmerSession);
      mockOrderService.getOrders = jest
        .fn()
        .mockResolvedValue(mockOrdersResponse);

      const request = createMockRequest(
        "GET",
        `/api/farms/${mockFarmId}/orders`,
        undefined,
        {
          status: "CONFIRMED",
          fulfillmentMethod: "DELIVERY",
        },
      );

      await testOrderController.getFarmOrders(request, {
        farmId: mockFarmId,
      });

      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          farmId: mockFarmId,
          status: "CONFIRMED",
          fulfillmentMethod: "DELIVERY",
        }),
      );
    });
  });

  // ============================================
  // UPDATE ORDER STATUS - PATCH /api/orders/[id]
  // ============================================

  describe("updateOrderStatus - PATCH /api/orders/[id]", () => {
    const validUpdateRequest = {
      status: "PREPARING",
      specialInstructions: "Updated instructions",
    };

    it("should update order status successfully", async () => {
      (auth as jest.Mock).mockResolvedValue(mockFarmerSession);

      const updatedOrder = {
        ...mockQuantumOrder,
        status: "PREPARING",
      };

      mockOrderService.updateOrder = jest.fn().mockResolvedValue(updatedOrder);

      const request = createMockRequest(
        "PATCH",
        `/api/orders/${mockOrderId}`,
        validUpdateRequest,
      );

      const response = await testOrderController.updateOrderStatus(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("PREPARING");
      expect(data.meta.agricultural?.consciousness).toBe("QUANTUM");
      expect(mockOrderService.updateOrder).toHaveBeenCalledWith(
        mockOrderId,
        expect.objectContaining({
          status: "PREPARING",
          specialInstructions: "Updated instructions",
        }),
        mockFarmerSession.user.id,
      );
    });

    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "PATCH",
        `/api/orders/${mockOrderId}`,
        validUpdateRequest,
      );

      const response = await testOrderController.updateOrderStatus(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should validate update request body", async () => {
      (auth as jest.Mock).mockResolvedValue(mockFarmerSession);

      const invalidRequest = {
        status: "INVALID_STATUS",
      };

      const request = createMockRequest(
        "PATCH",
        `/api/orders/${mockOrderId}`,
        invalidRequest,
      );

      const response = await testOrderController.updateOrderStatus(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // CANCEL ORDER - POST /api/orders/[id]/cancel
  // ============================================

  describe("cancelOrder - POST /api/orders/[id]/cancel", () => {
    const validCancelRequest = {
      reason: "Customer requested cancellation due to schedule change",
      cancelledBy: mockCustomerId,
    };

    it("should cancel order successfully", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);

      const cancelledOrder = {
        ...mockQuantumOrder,
        status: "CANCELLED",
      };

      mockOrderService.cancelOrder = jest
        .fn()
        .mockResolvedValue(cancelledOrder);

      const request = createMockRequest(
        "POST",
        `/api/orders/${mockOrderId}/cancel`,
        validCancelRequest,
      );

      const response = await testOrderController.cancelOrder(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("CANCELLED");
      expect(data.meta.message).toBe("Order cancelled successfully");
      expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(
        mockOrderId,
        expect.objectContaining({
          reason: validCancelRequest.reason,
          cancelledBy: mockCustomerId,
        }),
      );
    });

    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "POST",
        `/api/orders/${mockOrderId}/cancel`,
        validCancelRequest,
      );

      const response = await testOrderController.cancelOrder(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should prevent users from cancelling other users' orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);

      const cancelRequestByOtherUser = {
        reason: "Some reason",
        cancelledBy: "user_other_999",
      };

      const request = createMockRequest(
        "POST",
        `/api/orders/${mockOrderId}/cancel`,
        cancelRequestByOtherUser,
      );

      const response = await testOrderController.cancelOrder(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHORIZATION_FAILED");
    });

    it("should allow admin to cancel any order", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);

      const cancelledOrder = {
        ...mockQuantumOrder,
        status: "CANCELLED",
      };

      mockOrderService.cancelOrder = jest
        .fn()
        .mockResolvedValue(cancelledOrder);

      const cancelRequestByAdmin = {
        reason: "Admin cancellation",
        cancelledBy: mockAdminSession.user.id,
      };

      const request = createMockRequest(
        "POST",
        `/api/orders/${mockOrderId}/cancel`,
        cancelRequestByAdmin,
      );

      const response = await testOrderController.cancelOrder(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should validate cancellation reason", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);

      const invalidCancelRequest = {
        reason: "Bad", // Too short
        cancelledBy: mockCustomerId,
      };

      const request = createMockRequest(
        "POST",
        `/api/orders/${mockOrderId}/cancel`,
        invalidCancelRequest,
      );

      const response = await testOrderController.cancelOrder(request, {
        id: mockOrderId,
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // GET ORDER STATISTICS - GET /api/orders/statistics
  // ============================================

  describe("getOrderStatistics - GET /api/orders/statistics", () => {
    const mockStatistics: OrderStatistics = {
      totalOrders: 100,
      totalRevenue: 5000.0,
      averageOrderValue: 50.0,
      ordersByStatus: {
        PENDING: 10,
        CONFIRMED: 20,
        PREPARING: 15,
        READY: 10,
        FULFILLED: 30,
        COMPLETED: 10,
        CANCELLED: 5,
      },
      ordersByFulfillmentMethod: {
        DELIVERY: 60,
        FARM_PICKUP: 30,
        MARKET_PICKUP: 10,
      },
    };

    it("should return order statistics", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      mockOrderService.getOrderStatistics = jest
        .fn()
        .mockResolvedValue(mockStatistics);

      const request = createMockRequest("GET", "/api/orders/statistics");

      const response = await testOrderController.getOrderStatistics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalOrders).toBe(100);
      expect(data.data.totalRevenue).toBe(5000.0);
      expect(data.data.averageOrderValue).toBe(50.0);
      expect(data.meta.agricultural?.consciousness).toBe("QUANTUM");
    });

    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest("GET", "/api/orders/statistics");

      const response = await testOrderController.getOrderStatistics(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should filter statistics to customer's own orders", async () => {
      (auth as jest.Mock).mockResolvedValue(mockCustomerSession);
      mockOrderService.getOrderStatistics = jest
        .fn()
        .mockResolvedValue(mockStatistics);

      const request = createMockRequest("GET", "/api/orders/statistics");

      await testOrderController.getOrderStatistics(request);

      expect(mockOrderService.getOrderStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: mockCustomerId,
        }),
      );
    });

    it("should handle query parameters for filtering", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      mockOrderService.getOrderStatistics = jest
        .fn()
        .mockResolvedValue(mockStatistics);

      const request = createMockRequest(
        "GET",
        "/api/orders/statistics",
        undefined,
        {
          farmId: mockFarmId,
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
        },
      );

      await testOrderController.getOrderStatistics(request);

      expect(mockOrderService.getOrderStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          farmId: mockFarmId,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      );
    });
  });
});
