/**
 * 📦 ORDER CREATION SERVICE TESTS - Divine Order Manifestation
 *
 * Comprehensive tests for order creation operations:
 * - Order validation and preparation
 * - Cart to order transformation
 * - Order number generation
 * - Total calculations
 * - Transaction handling
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import {
  OrderCreationService,
  orderCreationService,
} from "../order-creation.service";
import type {
  CreateOrderRequest,
  OrderItemInput,
  FulfillmentMethod,
  OrderTotals,
  CartToOrderRequest,
  CreatedOrder,
} from "../order-creation.service";

// ============================================
// MOCK SETUP
// ============================================

// Mock the database module
jest.mock("@/lib/database", () => ({
  database: {
    user: {
      findUnique: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
    cartItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { database } from "@/lib/database";

const mockDatabase = database as jest.Mocked<typeof database>;

// ============================================
// TEST DATA FACTORIES
// ============================================

const createMockUser = (overrides: Partial<any> = {}) => ({
  id: "user_123",
  email: "customer@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "CUSTOMER",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockFarm = (overrides: Partial<any> = {}) => ({
  id: "farm_123",
  name: "Green Acres Farm",
  ownerId: "farmer_123",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockProduct = (overrides: Partial<any> = {}) => ({
  id: "product_123",
  name: "Organic Tomatoes",
  description: "Fresh organic tomatoes",
  price: 5.99,
  unit: "lb",
  farmId: "farm_123",
  inStock: true,
  quantityAvailable: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockAddress = (overrides: Partial<any> = {}) => ({
  id: "address_123",
  userId: "user_123",
  street: "123 Main St",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  country: "US",
  ...overrides,
});

const createMockOrder = (overrides: Partial<any> = {}) => ({
  id: "order_123",
  orderNumber: "ORD-ABC123-XYZ",
  customerId: "user_123",
  farmId: "farm_123",
  status: "PENDING",
  paymentStatus: "PENDING",
  fulfillmentMethod: "DELIVERY",
  subtotal: 59.9,
  deliveryFee: 5.99,
  platformFee: 3.0,
  tax: 5.27,
  total: 74.16,
  farmerAmount: 56.9,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockOrderItem = (overrides: Partial<any> = {}) => ({
  id: "order_item_123",
  orderId: "order_123",
  productId: "product_123",
  productName: "Organic Tomatoes",
  quantity: 10,
  unit: "lb",
  unitPrice: 5.99,
  subtotal: 59.9,
  productSnapshot: {},
  ...overrides,
});

const createMockCartItem = (overrides: Partial<any> = {}) => ({
  id: "cart_item_123",
  userId: "user_123",
  productId: "product_123",
  farmId: "farm_123",
  quantity: 5,
  product: createMockProduct(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ============================================
// TEST SUITES
// ============================================

describe("OrderCreationService", () => {
  let service: OrderCreationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrderCreationService();
  });

  // ========================================
  // ORDER VALIDATION TESTS
  // ========================================

  describe("validateOrderRequest", () => {
    it("should return valid result for a valid order request", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "DELIVERY",
        deliveryAddressId: "address_123",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());
      mockDatabase.address.findUnique.mockResolvedValue(createMockAddress());

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return error when customer does not exist", async () => {
      const request: CreateOrderRequest = {
        customerId: "nonexistent_user",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(null);
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "customerId",
          code: "CUSTOMER_NOT_FOUND",
        }),
      );
    });

    it("should return error when farm does not exist", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "nonexistent_farm",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(null);
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "farmId",
          code: "FARM_NOT_FOUND",
        }),
      );
    });

    it("should return error when farm is not verified", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(
        createMockFarm({ status: "PENDING" }),
      );
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "farmId",
          code: "FARM_NOT_ACTIVE",
        }),
      );
    });

    it("should return error when items array is empty", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "items",
          code: "EMPTY_ORDER",
        }),
      );
    });

    it("should return error when product is not found", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "nonexistent_product", quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(null);

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "PRODUCT_NOT_FOUND",
        }),
      );
    });

    it("should return error when product is out of stock", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ inStock: false }),
      );

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "OUT_OF_STOCK",
        }),
      );
    });

    it("should return error when quantity exceeds available stock", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 150 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ quantityAvailable: 100 }),
      );

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "INSUFFICIENT_STOCK",
        }),
      );
    });

    it("should return error when quantity is zero or negative", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 0 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "INVALID_QUANTITY",
        }),
      );
    });

    it("should return warning for low stock items", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 8 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ quantityAvailable: 10 }),
      );

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          severity: "medium",
        }),
      );
    });

    it("should return error when delivery address is missing for DELIVERY fulfillment", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "DELIVERY",
        // No deliveryAddressId provided
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "deliveryAddressId",
          code: "MISSING_DELIVERY_ADDRESS",
        }),
      );
    });

    it("should return error when delivery address does not exist", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "DELIVERY",
        deliveryAddressId: "nonexistent_address",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());
      mockDatabase.address.findUnique.mockResolvedValue(null);

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "deliveryAddressId",
          code: "ADDRESS_NOT_FOUND",
        }),
      );
    });

    it("should return error when address belongs to different user", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "DELIVERY",
        deliveryAddressId: "address_123",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());
      mockDatabase.address.findUnique.mockResolvedValue(
        createMockAddress({ userId: "different_user" }),
      );

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "deliveryAddressId",
          code: "INVALID_ADDRESS_OWNER",
        }),
      );
    });

    it("should return error when scheduled date is in the past", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
        scheduledDate: pastDate,
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "scheduledDate",
          code: "INVALID_SCHEDULED_DATE",
        }),
      );
    });
  });

  // ========================================
  // ORDER TOTALS CALCULATION TESTS
  // ========================================

  describe("calculateOrderTotals", () => {
    it("should calculate correct totals for delivery order", async () => {
      const items: OrderItemInput[] = [
        { productId: "product_1", quantity: 5 },
        { productId: "product_2", quantity: 3 },
      ];

      mockDatabase.product.findUnique
        .mockResolvedValueOnce(
          createMockProduct({ id: "product_1", price: 5.0 }),
        )
        .mockResolvedValueOnce(
          createMockProduct({ id: "product_2", price: 10.0 }),
        );

      const totals = await service.calculateOrderTotals(items, "DELIVERY");

      // Subtotal: (5 * 5.00) + (3 * 10.00) = 25 + 30 = 55
      expect(totals.subtotal).toBe(55);
      // Delivery fee: 0 (since subtotal >= 50, free delivery applies)
      expect(totals.deliveryFee).toBe(0);
      // Platform fee: 55 * 0.05 = 2.75
      expect(totals.platformFee).toBe(2.75);
      // Tax: (55 + 0) * 0.08 = 4.40
      expect(totals.tax).toBe(4.4);
      // Total: 55 + 0 + 2.75 + 4.4 = 62.15
      expect(totals.total).toBe(62.15);
      // Farmer amount: 55 - 2.75 = 52.25
      expect(totals.farmerAmount).toBe(52.25);
    });

    it("should apply free delivery for orders over threshold", async () => {
      const items: OrderItemInput[] = [
        { productId: "product_1", quantity: 10 },
      ];

      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ price: 10.0 }),
      );

      const totals = await service.calculateOrderTotals(items, "DELIVERY");

      // Subtotal: 10 * 10.00 = 100 (over $50 threshold)
      expect(totals.subtotal).toBe(100);
      // Free delivery for orders over $50
      expect(totals.deliveryFee).toBe(0);
    });

    it("should not charge delivery fee for pickup orders", async () => {
      const items: OrderItemInput[] = [{ productId: "product_1", quantity: 2 }];

      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ price: 10.0 }),
      );

      const totals = await service.calculateOrderTotals(items, "FARM_PICKUP");

      expect(totals.subtotal).toBe(20);
      expect(totals.deliveryFee).toBe(0);
    });

    it("should handle market pickup without delivery fee", async () => {
      const items: OrderItemInput[] = [{ productId: "product_1", quantity: 3 }];

      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ price: 8.0 }),
      );

      const totals = await service.calculateOrderTotals(items, "MARKET_PICKUP");

      expect(totals.subtotal).toBe(24);
      expect(totals.deliveryFee).toBe(0);
    });

    it("should handle products with zero price", async () => {
      const items: OrderItemInput[] = [{ productId: "product_1", quantity: 5 }];

      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ price: 0 }),
      );

      const totals = await service.calculateOrderTotals(items, "FARM_PICKUP");

      expect(totals.subtotal).toBe(0);
      expect(totals.total).toBe(0);
    });

    it("should round totals to 2 decimal places", async () => {
      const items: OrderItemInput[] = [{ productId: "product_1", quantity: 3 }];

      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ price: 3.33 }),
      );

      const totals = await service.calculateOrderTotals(items, "FARM_PICKUP");

      // Subtotal: 3 * 3.33 = 9.99
      expect(totals.subtotal).toBe(9.99);
      // All values should have max 2 decimal places
      expect(Number.isInteger(totals.total * 100)).toBe(true);
    });
  });

  // ========================================
  // ORDER CREATION TESTS
  // ========================================

  describe("createOrder", () => {
    const validRequest: CreateOrderRequest = {
      customerId: "user_123",
      farmId: "farm_123",
      items: [{ productId: "product_123", quantity: 5 }],
      fulfillmentMethod: "DELIVERY",
      deliveryAddressId: "address_123",
    };

    beforeEach(() => {
      // Setup default mocks for validation
      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());
      mockDatabase.address.findUnique.mockResolvedValue(createMockAddress());
      mockDatabase.order.findUnique.mockResolvedValue(null); // For unique order number check

      // Setup transaction mock
      mockDatabase.$transaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue(createMockOrder()),
          },
          orderItem: {
            create: jest.fn().mockResolvedValue(createMockOrderItem()),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(createMockProduct()),
            update: jest.fn().mockResolvedValue(createMockProduct()),
          },
        };
        return callback(tx);
      });
    });

    it("should create order successfully with valid request", async () => {
      const result = await service.createOrder(validRequest);

      expect(result).toBeDefined();
      expect(result.orderNumber).toBeDefined();
      expect(mockDatabase.$transaction).toHaveBeenCalled();
    });

    it("should throw ValidationError for invalid request", async () => {
      mockDatabase.user.findUnique.mockResolvedValue(null);

      await expect(service.createOrder(validRequest)).rejects.toThrow();
    });

    it("should create order items in transaction", async () => {
      let orderItemCreateCalled = false;

      mockDatabase.$transaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue(createMockOrder()),
          },
          orderItem: {
            create: jest.fn().mockImplementation(() => {
              orderItemCreateCalled = true;
              return Promise.resolve(createMockOrderItem());
            }),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(createMockProduct()),
            update: jest.fn().mockResolvedValue(createMockProduct()),
          },
        };
        return callback(tx);
      });

      await service.createOrder(validRequest);

      expect(orderItemCreateCalled).toBe(true);
    });

    it("should decrement product stock after order creation", async () => {
      let productUpdateCalled = false;
      let stockDecrement = 0;

      mockDatabase.$transaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue(createMockOrder()),
          },
          orderItem: {
            create: jest.fn().mockResolvedValue(createMockOrderItem()),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(createMockProduct()),
            update: jest.fn().mockImplementation((args) => {
              productUpdateCalled = true;
              stockDecrement = args.data?.quantityAvailable?.decrement || 0;
              return Promise.resolve(createMockProduct());
            }),
          },
        };
        return callback(tx);
      });

      await service.createOrder(validRequest);

      expect(productUpdateCalled).toBe(true);
      expect(stockDecrement).toBe(5);
    });

    it("should handle multiple items in a single order", async () => {
      const multiItemRequest: CreateOrderRequest = {
        ...validRequest,
        items: [
          { productId: "product_1", quantity: 3 },
          { productId: "product_2", quantity: 5 },
          { productId: "product_3", quantity: 2 },
        ],
      };

      let orderItemsCreated = 0;

      mockDatabase.product.findUnique
        .mockResolvedValueOnce(createMockProduct({ id: "product_1" }))
        .mockResolvedValueOnce(createMockProduct({ id: "product_2" }))
        .mockResolvedValueOnce(createMockProduct({ id: "product_3" }));

      mockDatabase.$transaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue(createMockOrder()),
          },
          orderItem: {
            create: jest.fn().mockImplementation(() => {
              orderItemsCreated++;
              return Promise.resolve(createMockOrderItem());
            }),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(createMockProduct()),
            update: jest.fn().mockResolvedValue(createMockProduct()),
          },
        };
        return callback(tx);
      });

      await service.createOrder(multiItemRequest);

      expect(orderItemsCreated).toBe(3);
    });
  });

  // ========================================
  // CART TO ORDER TRANSFORMATION TESTS
  // ========================================

  describe("transformCartToOrder", () => {
    const validCartRequest: CartToOrderRequest = {
      cartId: "cart_123",
      customerId: "user_123",
      farmId: "farm_123",
      fulfillmentMethod: "FARM_PICKUP",
    };

    beforeEach(() => {
      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique.mockResolvedValue(createMockProduct());
      mockDatabase.order.findUnique.mockResolvedValue(null);
    });

    it("should transform cart items to order successfully", async () => {
      const mockCartItems = [
        createMockCartItem({ productId: "product_1", quantity: 3 }),
        createMockCartItem({ productId: "product_2", quantity: 5 }),
      ];

      mockDatabase.cartItem.findMany.mockResolvedValue(mockCartItems);
      mockDatabase.cartItem.deleteMany.mockResolvedValue({ count: 2 });

      mockDatabase.$transaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue(createMockOrder()),
          },
          orderItem: {
            create: jest.fn().mockResolvedValue(createMockOrderItem()),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(createMockProduct()),
            update: jest.fn().mockResolvedValue(createMockProduct()),
          },
        };
        return callback(tx);
      });

      const result = await service.transformCartToOrder(validCartRequest);

      expect(result).toBeDefined();
      expect(mockDatabase.cartItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user_123" },
        }),
      );
    });

    it("should throw BusinessLogicError when cart is empty", async () => {
      mockDatabase.cartItem.findMany.mockResolvedValue([]);

      await expect(
        service.transformCartToOrder(validCartRequest),
      ).rejects.toThrow();
    });

    it("should clear cart after successful order creation", async () => {
      const mockCartItems = [createMockCartItem()];

      mockDatabase.cartItem.findMany.mockResolvedValue(mockCartItems);
      mockDatabase.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      mockDatabase.$transaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue(createMockOrder()),
          },
          orderItem: {
            create: jest.fn().mockResolvedValue(createMockOrderItem()),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(createMockProduct()),
            update: jest.fn().mockResolvedValue(createMockProduct()),
          },
        };
        return callback(tx);
      });

      await service.transformCartToOrder(validCartRequest);

      expect(mockDatabase.cartItem.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user_123" },
        }),
      );
    });
  });

  // ========================================
  // ORDER PREVIEW TESTS
  // ========================================

  describe("getOrderPreview", () => {
    it("should return preview with totals and item details", async () => {
      const items: OrderItemInput[] = [
        { productId: "product_1", quantity: 3 },
        { productId: "product_2", quantity: 2 },
      ];

      mockDatabase.product.findUnique
        .mockResolvedValueOnce(
          createMockProduct({ id: "product_1", name: "Tomatoes", price: 5.0 }),
        )
        .mockResolvedValueOnce(
          createMockProduct({ id: "product_2", name: "Carrots", price: 3.0 }),
        )
        // Called again for item details
        .mockResolvedValueOnce(
          createMockProduct({ id: "product_1", name: "Tomatoes", price: 5.0 }),
        )
        .mockResolvedValueOnce(
          createMockProduct({ id: "product_2", name: "Carrots", price: 3.0 }),
        );

      const preview = await service.getOrderPreview(items, "DELIVERY");

      expect(preview.totals).toBeDefined();
      expect(preview.items).toHaveLength(2);
      expect(preview.items[0].productName).toBe("Tomatoes");
      expect(preview.items[0].subtotal).toBe(15); // 3 * 5.0
      expect(preview.items[1].subtotal).toBe(6); // 2 * 3.0
    });

    it("should handle products not found gracefully in preview", async () => {
      const items: OrderItemInput[] = [
        { productId: "nonexistent", quantity: 1 },
      ];

      mockDatabase.product.findUnique.mockResolvedValue(null);

      const preview = await service.getOrderPreview(items, "FARM_PICKUP");

      expect(preview.items[0].productName).toBe("Unknown Product");
      expect(preview.items[0].unitPrice).toBe(0);
    });
  });

  // ========================================
  // SINGLETON EXPORT TESTS
  // ========================================

  describe("singleton export", () => {
    it("should export a singleton instance of OrderCreationService", () => {
      expect(orderCreationService).toBeInstanceOf(OrderCreationService);
    });

    it("should return the same instance on multiple imports", () => {
      const instance1 = orderCreationService;
      const instance2 = orderCreationService;
      expect(instance1).toBe(instance2);
    });
  });

  // ========================================
  // EDGE CASES AND ERROR HANDLING
  // ========================================

  describe("edge cases", () => {
    it("should handle database errors gracefully in validation", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [{ productId: "product_123", quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(service.validateOrderRequest(request)).rejects.toThrow();
    });

    it("should handle decimal prices correctly", async () => {
      const items: OrderItemInput[] = [{ productId: "product_1", quantity: 7 }];

      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ price: 4.99 }),
      );

      const totals = await service.calculateOrderTotals(items, "FARM_PICKUP");

      // 7 * 4.99 = 34.93
      expect(totals.subtotal).toBe(34.93);
    });

    it("should handle very large quantities", async () => {
      const items: OrderItemInput[] = [
        { productId: "product_1", quantity: 10000 },
      ];

      mockDatabase.product.findUnique.mockResolvedValue(
        createMockProduct({ price: 1.0, quantityAvailable: 10000 }),
      );

      const totals = await service.calculateOrderTotals(items, "DELIVERY");

      expect(totals.subtotal).toBe(10000);
      expect(totals.deliveryFee).toBe(0); // Free delivery for large orders
    });

    it("should validate multiple items with mixed validity", async () => {
      const request: CreateOrderRequest = {
        customerId: "user_123",
        farmId: "farm_123",
        items: [
          { productId: "valid_product", quantity: 5 },
          { productId: "invalid_product", quantity: 3 },
        ],
        fulfillmentMethod: "FARM_PICKUP",
      };

      mockDatabase.user.findUnique.mockResolvedValue(createMockUser());
      mockDatabase.farm.findUnique.mockResolvedValue(createMockFarm());
      mockDatabase.product.findUnique
        .mockResolvedValueOnce(createMockProduct())
        .mockResolvedValueOnce(null);

      const result = await service.validateOrderRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "PRODUCT_NOT_FOUND")).toBe(
        true,
      );
    });
  });
});
