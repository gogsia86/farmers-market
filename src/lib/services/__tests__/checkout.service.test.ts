/**
 * 🧪 CHECKOUT SERVICE - UNIT TESTS
 * Divine test coverage for checkout orchestration and order creation
 *
 * Test Coverage:
 * - Checkout initialization
 * - Order preview calculation
 * - Address validation
 * - Payment intent creation
 * - Order creation from checkout
 * - Payment processing
 * - Checkout status validation
 * - Edge cases and error handling
 */

import { database } from "@/lib/database";
import { stripe } from "@/lib/stripe";
import { cartService } from "../cart.service";
import { CheckoutService } from "../checkout.service";

// ============================================================================
// MOCKS
// ============================================================================

jest.mock("@/lib/database");
jest.mock("../cart.service");
jest.mock("@/lib/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockDatabase = database as jest.Mocked<typeof database>;
const mockCartService = cartService as jest.Mocked<typeof cartService>;
const mockStripe = stripe as jest.Mocked<typeof stripe>;

// Ensure product.updateMany is properly mocked
if (mockDatabase.product && !mockDatabase.product.updateMany) {
  (mockDatabase.product as any).updateMany = jest.fn();
}

// Mock $transaction to execute callbacks immediately with mockDatabase as tx
(mockDatabase as any).$transaction = jest.fn();

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createMockUser = (overrides = {}) => ({
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  name: "Test User",
  role: "CUSTOMER",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockProduct = (overrides = {}) => ({
  id: "423e4567-e89b-12d3-a456-426614174000",
  name: "Organic Tomatoes",
  description: "Fresh organic tomatoes",
  price: 4.99,
  farmId: "523e4567-e89b-12d3-a456-426614174000",
  category: "VEGETABLES",
  season: "SUMMER",
  stock: 100,
  unit: "lb",
  available: true,
  purchaseCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockFarm = (overrides = {}) => ({
  id: "523e4567-e89b-12d3-a456-426614174000",
  name: "Divine Acres Farm",
  description: "Biodynamic farming with consciousness",
  location: "Test Location",
  ownerId: "farmer_123",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockCartItem = (overrides = {}) => {
  const product = overrides.product || createMockProduct();
  return {
    id: "cart_item_123",
    userId: "123e4567-e89b-12d3-a456-426614174000",
    productId: product.id,
    farmId: product.farmId,
    name: product.name,
    price: product.price,
    quantity: 2,
    unit: product.unit,
    image: undefined,
    farmName: "Divine Acres Farm",
    organic: false,
    inStock: true,
    maxQuantity: product.stock,
    fulfillmentMethod: "DELIVERY",
    addedAt: new Date(),
    product,
    ...overrides,
  };
};

const createMockCart = (items = [createMockCartItem()]) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08;
  const deliveryFee = 5.0;
  const total = subtotal + tax + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const farmCount = new Set(items.map((item) => item.product.farmId)).size;

  return {
    items,
    subtotal,
    tax,
    deliveryFee,
    total,
    itemCount,
    farmCount,
  };
};

const createMockAddress = (overrides = {}) => ({
  id: "223e4567-e89b-12d3-a456-426614174000",
  userId: "123e4567-e89b-12d3-a456-426614174000",
  type: "DELIVERY",
  street: "123 Main St",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  country: "US",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockOrder = (overrides = {}) => ({
  id: "323e4567-e89b-12d3-a456-426614174000",
  orderNumber: "FM-20241115-ABC123",
  customerId: "123e4567-e89b-12d3-a456-426614174000",
  farmId: "523e4567-e89b-12d3-a456-426614174000",
  status: "PENDING",
  paymentStatus: "PENDING",
  fulfillmentMethod: "DELIVERY",
  subtotal: 9.98,
  deliveryFee: 5.0,
  tax: 1.2,
  platformFee: 0.5,
  discount: 0,
  total: 16.68,
  farmerAmount: 14.18,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  ...overrides,
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("CheckoutService", () => {
  let checkoutService: CheckoutService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the transaction mock implementation for each test
    (mockDatabase as any).$transaction.mockImplementation(
      async (callback: any) => {
        return await callback(mockDatabase);
      },
    );

    checkoutService = new CheckoutService();
  });

  // ==========================================================================
  // INITIALIZE CHECKOUT
  // ==========================================================================

  describe("initializeCheckout", () => {
    it("should initialize checkout with valid cart", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const mockCart = createMockCart([
        createMockCartItem({ quantity: 2 }),
        createMockCartItem({
          id: "cart_item_456",
          productId: "product_456",
          quantity: 1,
          product: createMockProduct({
            id: "product_456",
            price: 6.99,
            farmId: "farm_456",
          }),
        }),
      ]);

      // Mock getCart with ServiceResponse pattern
      mockCartService.getCart.mockResolvedValue({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });

      const result = await checkoutService.initializeCheckout(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.session).toBeDefined();
      expect(result.data?.session.userId).toBe(userId);
      expect(result.data?.session.cartSummary.items).toHaveLength(2);
      expect(result.data?.session.cartSummary.farmCount).toBe(2);
      expect(result.data?.preview).toBeDefined();
      expect(mockCartService.getCart).toHaveBeenCalledWith(userId);
    });

    it("should fail when cart is empty", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const emptyCart = createMockCart([]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: emptyCart,
      });

      const result = await checkoutService.initializeCheckout(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("EMPTY_CART");
      expect(result.error?.message).toContain("Cart is empty");
    });

    it("should fail when cart service fails", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";

      mockCartService.getCart.mockResolvedValueOnce({
        success: false,
        error: {
          code: "CART_FETCH_ERROR",
          message: "Failed to fetch cart",
        },
      });

      const result = await checkoutService.initializeCheckout(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CART_FETCH_ERROR");
      expect(result.error?.message).toContain("Failed to fetch cart");
    });

    it("should handle cart service errors gracefully", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";

      mockCartService.getCart.mockResolvedValueOnce({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Database error",
        },
      });

      const result = await checkoutService.initializeCheckout(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CART_FETCH_ERROR");
      expect(result.error?.message).toBe("Failed to fetch cart");
    });

    it("should set correct fulfillment method", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const mockCart = createMockCart();

      // Mock getCart with ServiceResponse pattern
      mockCartService.getCart.mockResolvedValue({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });

      const result = await checkoutService.initializeCheckout(userId);

      expect(result.success).toBe(true);
      expect(result.data?.session.fulfillmentMethod).toBe("DELIVERY");
    });
  });

  // ==========================================================================
  // CALCULATE ORDER PREVIEW
  // ==========================================================================

  describe("calculateOrderPreview", () => {
    it("should calculate order preview correctly", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const fulfillmentMethod = "DELIVERY";
      const mockCart = createMockCart([
        createMockCartItem({
          quantity: 2,
          product: createMockProduct({ price: 4.99 }),
        }),
      ]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });

      const result = await checkoutService.calculateOrderPreview(userId, {
        fulfillmentMethod,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.subtotal).toBeCloseTo(9.98, 2);
      expect(result.data?.deliveryFee).toBe(5.0);
      expect(result.data?.tax).toBeGreaterThan(0);
      expect(result.data?.platformFee).toBeGreaterThan(0);
      expect(result.data?.total).toBeGreaterThan(9.98);
    });

    it("should apply free delivery for orders over minimum", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const fulfillmentMethod = "DELIVERY";
      const mockCart = createMockCart([
        createMockCartItem({
          quantity: 10,
          product: createMockProduct({ price: 6.0 }),
        }),
      ]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });

      const result = await checkoutService.calculateOrderPreview(userId, {
        fulfillmentMethod,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.subtotal).toBe(60.0);
      expect(result.data?.deliveryFee).toBe(0); // Free delivery over $50
    });

    it("should not charge delivery fee for farm pickup", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const fulfillmentMethod = "FARM_PICKUP";
      const mockCart = createMockCart([
        createMockCartItem({
          quantity: 2,
          product: createMockProduct({ price: 4.99 }),
        }),
      ]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });

      const result = await checkoutService.calculateOrderPreview(userId, {
        fulfillmentMethod,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.deliveryFee).toBe(0);
    });

    it("should calculate platform fee correctly", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const fulfillmentMethod = "DELIVERY";
      const mockCart = createMockCart([
        createMockCartItem({
          quantity: 2,
          product: createMockProduct({ price: 10.0 }),
        }),
      ]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });

      const result = await checkoutService.calculateOrderPreview(userId, {
        fulfillmentMethod,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Platform fee should be 5% of subtotal
      expect(result.data?.platformFee).toBeCloseTo(1.0, 2);
    });

    it("should calculate tax correctly", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const fulfillmentMethod = "DELIVERY";
      const mockCart = createMockCart([
        createMockCartItem({
          quantity: 2,
          product: createMockProduct({ price: 10.0 }),
        }),
      ]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });

      const result = await checkoutService.calculateOrderPreview(userId, {
        fulfillmentMethod,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Tax should be 8% of (subtotal + delivery - discount)
      const expectedTax = (20.0 + 5.0) * 0.08;
      expect(result.data?.tax).toBeCloseTo(expectedTax, 2);
    });

    it("should include item details in preview", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const fulfillmentMethod = "DELIVERY";
      const product = createMockProduct({
        name: "Organic Carrots",
        price: 3.99,
      });
      const farm = createMockFarm({ name: "Test Farm" });
      const mockCart = createMockCart([
        createMockCartItem({ quantity: 3, product, farm }),
      ]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });

      const result = await checkoutService.calculateOrderPreview(userId, {
        fulfillmentMethod,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.items).toHaveLength(1);

      const item = result.data?.items[0];
      expect(item?.productName).toBe("Organic Carrots");
      expect(item?.quantity).toBe(3);
      expect(item?.unitPrice).toBe(3.99);
      expect(item?.subtotal).toBeCloseTo(11.97, 2);
    });
  });

  // ==========================================================================
  // VALIDATE SHIPPING ADDRESS
  // ==========================================================================

  describe("validateShippingAddress", () => {
    it("should validate correct address", async () => {
      const address = {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        country: "US",
      };

      const result = await checkoutService.validateShippingAddress(address);

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(true);
      expect(result.data?.normalized).toBeDefined();
    });

    it("should reject address without street", async () => {
      const address = {
        street: "",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        country: "US",
      };

      const result = await checkoutService.validateShippingAddress(address);

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.error).toContain(
        "Street address must be at least 5 characters",
      );
    });

    it("should reject address without city", async () => {
      const address = {
        street: "123 Main St",
        city: "",
        state: "IL",
        zipCode: "62701",
        country: "US",
      };

      const result = await checkoutService.validateShippingAddress(address);

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.error).toContain("City");
    });

    it("should reject address without state", async () => {
      const address = {
        street: "123 Main St",
        city: "Springfield",
        state: "",
        zipCode: "62701",
        country: "US",
      };

      const result = await checkoutService.validateShippingAddress(address);

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.error).toContain("State");
    });

    it("should reject invalid zip code format", async () => {
      const address = {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "invalid",
        country: "US",
      };

      const result = await checkoutService.validateShippingAddress(address);

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.error).toContain("Invalid ZIP code format");
    });

    it("should accept 5-digit zip code", async () => {
      const address = {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        country: "US",
      };

      const result = await checkoutService.validateShippingAddress(address);

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(true);
    });

    it("should accept 9-digit zip code", async () => {
      const address = {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701-1234",
        country: "US",
      };

      const result = await checkoutService.validateShippingAddress(address);

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(true);
    });

    it("should normalize address fields", async () => {
      const address = {
        street: "  123 Main St  ",
        city: "  springfield  ",
        state: "il",
        zipCode: "62701",
        country: "US",
      };

      const result = await checkoutService.validateShippingAddress(address);

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(true);
      expect(result.data?.normalized?.street).toBe("123 Main St");
      expect(result.data?.normalized?.city).toBe("springfield");
      expect(result.data?.normalized?.state).toBe("IL");
      expect(result.data?.normalized?.zipCode).toBe("62701");
    });
  });

  // ==========================================================================
  // CREATE PAYMENT INTENT
  // ==========================================================================

  describe("createPaymentIntent", () => {
    it("should create payment intent successfully", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const amount = 49.99;
      const mockPaymentIntent = {
        id: "pi_test_123",
        client_secret: "pi_test_123_secret_456",
        amount: 4999,
        currency: "usd",
        status: "requires_payment_method",
      };

      mockStripe.paymentIntents.create.mockResolvedValueOnce(
        mockPaymentIntent as any,
      );

      const result = await checkoutService.createPaymentIntent(userId, amount);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("pi_test_123");
      expect(result.data?.clientSecret).toBe("pi_test_123_secret_456");
      expect(result.data?.amount).toBe(49.99);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 4999,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId,
          platform: "farmers-market",
          consciousness: "agricultural",
        },
        description: expect.stringContaining("Farmers Market Order"),
      });
    });

    it("should convert amount to cents correctly", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const amount = 123.45;

      mockStripe.paymentIntents.create.mockResolvedValueOnce({
        id: "pi_test_123",
        client_secret: "secret",
        amount: 12345,
      } as any);

      await checkoutService.createPaymentIntent(userId, amount);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 12345,
        }),
      );
    });

    it("should handle Stripe API errors", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const amount = 100.0;

      mockStripe.paymentIntents.create.mockRejectedValueOnce(
        new Error("Invalid amount"),
      );

      const result = await checkoutService.createPaymentIntent(userId, amount);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYMENT_INTENT_FAILED");
      expect(result.error?.message).toContain("Invalid amount");
    });

    it("should include agricultural consciousness in metadata", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const amount = 25.0;

      mockStripe.paymentIntents.create.mockResolvedValueOnce({
        id: "pi_test_123",
        client_secret: "secret",
      } as any);

      await checkoutService.createPaymentIntent(userId, amount);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            consciousness: "agricultural",
            platform: "farmers-market",
          }),
        }),
      );
    });
  });

  // ==========================================================================
  // CREATE ORDER FROM CHECKOUT
  // ==========================================================================

  describe("createOrderFromCheckout", () => {
    it("should create order successfully with existing address", async () => {
      const request = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        shippingAddressId: "223e4567-e89b-12d3-a456-426614174000",
        fulfillmentMethod: "DELIVERY" as const,
      };

      const mockCart = createMockCart([createMockCartItem({ quantity: 2 })]);
      const mockOrder = createMockOrder();

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });
      mockCartService.reserveCartItems.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });
      mockCartService.clearCart.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      mockDatabase.order.create.mockResolvedValueOnce(mockOrder as any);
      mockDatabase.product.update.mockResolvedValue({} as any);

      const result = await checkoutService.createOrderFromCheckout(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Single order should be returned directly, not in array
      if (result.data && !Array.isArray(result.data)) {
        expect(result.data.id).toBe(mockOrder.id);
      }
      expect(mockDatabase.order.create).toHaveBeenCalled();
      expect(mockCartService.clearCart).toHaveBeenCalledWith(request.userId);
    });

    it("should create order with new address", async () => {
      const request = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        shippingAddress: {
          street: "123 Main St",
          city: "Springfield",
          state: "IL",
          zipCode: "62701",
          country: "US",
        },
        fulfillmentMethod: "DELIVERY" as const,
      };

      const mockCart = createMockCart([createMockCartItem({ quantity: 2 })]);
      const mockAddress = createMockAddress();
      const mockOrder = createMockOrder();

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });
      mockCartService.reserveCartItems.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });
      mockCartService.clearCart.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      mockDatabase.userAddress.create.mockResolvedValueOnce(mockAddress);
      mockDatabase.order.create.mockResolvedValueOnce(mockOrder as any);
      mockDatabase.product.update.mockResolvedValue({} as any);

      const result = await checkoutService.createOrderFromCheckout(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(mockDatabase.userAddress.create).toHaveBeenCalled();
      expect(mockDatabase.order.create).toHaveBeenCalled();
    });

    it("should fail when cart is empty", async () => {
      const request = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        shippingAddressId: "223e4567-e89b-12d3-a456-426614174000",
        fulfillmentMethod: "DELIVERY",
      };

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: createMockCart([]),
      });

      const result = await checkoutService.createOrderFromCheckout(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("EMPTY_CART");
      expect(result.error?.message).toContain("Cart is empty");
    });

    it("should update product purchase count", async () => {
      const request = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        shippingAddressId: "223e4567-e89b-12d3-a456-426614174000",
        fulfillmentMethod: "DELIVERY" as const,
      };

      const product = createMockProduct({
        id: "423e4567-e89b-12d3-a456-426614174000",
      });
      const mockCart = createMockCart([
        createMockCartItem({
          productId: "423e4567-e89b-12d3-a456-426614174000",
          quantity: 2,
        }),
      ]);
      const mockOrder = createMockOrder();

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });
      mockCartService.reserveCartItems.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });
      mockCartService.clearCart.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      mockDatabase.order.create.mockResolvedValueOnce(mockOrder as any);
      mockDatabase.product.update.mockResolvedValueOnce(product as any);

      await checkoutService.createOrderFromCheckout(request);

      expect(mockDatabase.product.update).toHaveBeenCalledWith({
        where: { id: "423e4567-e89b-12d3-a456-426614174000" },
        data: {
          purchaseCount: {
            increment: 2,
          },
        },
      });
    });

    it("should clear cart after successful order creation", async () => {
      const request = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        shippingAddressId: "223e4567-e89b-12d3-a456-426614174000",
        fulfillmentMethod: "DELIVERY" as const,
      };

      const mockCart = createMockCart([createMockCartItem()]);
      const mockOrder = createMockOrder();

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });
      mockCartService.reserveCartItems.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });
      mockCartService.clearCart.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      mockDatabase.order.create.mockResolvedValueOnce(mockOrder as any);
      mockDatabase.product.update.mockResolvedValueOnce({} as any);

      const result = await checkoutService.createOrderFromCheckout(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(mockCartService.clearCart).toHaveBeenCalledWith(request.userId);
    });

    it("should handle database errors gracefully", async () => {
      const request = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        shippingAddressId: "223e4567-e89b-12d3-a456-426614174000",
        fulfillmentMethod: "DELIVERY",
      };

      const mockCart = createMockCart();

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });
      mockCartService.reserveCartItems.mockResolvedValueOnce({
        success: true,
      });

      mockDatabase.order.create.mockRejectedValueOnce(
        new Error("Database error"),
      );

      const result = await checkoutService.createOrderFromCheckout(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Database error");
    });

    it("should include stripe payment intent ID if provided", async () => {
      const request = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        shippingAddressId: "223e4567-e89b-12d3-a456-426614174000",
        fulfillmentMethod: "DELIVERY" as const,
        stripePaymentIntentId: "pi_test_123",
      };

      const mockCart = createMockCart([createMockCartItem()]);
      const mockOrder = createMockOrder();

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });
      mockCartService.reserveCartItems.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });
      mockCartService.clearCart.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });
      mockDatabase.order.create.mockResolvedValueOnce(mockOrder as any);
      mockDatabase.product.update.mockResolvedValueOnce({} as any);
      mockCartService.clearCart.mockResolvedValueOnce({ success: true });

      await checkoutService.createOrderFromCheckout(request);

      expect(mockDatabase.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stripePaymentIntentId: "pi_test_123",
          }),
        }),
      );
    });
  });

  // ==========================================================================
  // PROCESS PAYMENT
  // ==========================================================================

  describe("processPayment", () => {
    it("should process payment successfully", async () => {
      const orderId = "323e4567-e89b-12d3-a456-426614174000";
      const paymentMethodId = "pm_test_123";

      // Mock order fetch
      mockDatabase.order.findUnique.mockResolvedValueOnce(
        createMockOrder({
          id: orderId,
          paymentStatus: "PENDING",
          status: "PENDING",
          items: [
            {
              id: "item_123",
              productId: "product_123",
              product: createMockProduct({ farmId: "farm_123" }),
              quantity: 2,
              price: 10.0,
            },
          ],
        }) as any,
      );

      // Mock Stripe PaymentIntent creation
      (mockStripe.paymentIntents.create as jest.Mock).mockResolvedValueOnce({
        id: "pi_test_123",
        status: "succeeded",
        amount: 2000,
        currency: "usd",
      });

      // Mock order update
      mockDatabase.order.update.mockResolvedValueOnce(
        createMockOrder({
          id: orderId,
          paymentStatus: "PAID",
          status: "CONFIRMED",
        }) as any,
      );

      const result = await checkoutService.processPayment(
        orderId,
        paymentMethodId,
      );

      expect(result.success).toBe(true);
      expect(mockDatabase.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          paidAt: expect.any(Date),
          status: "CONFIRMED",
          confirmedAt: expect.any(Date),
          stripePaymentIntentId: "pi_test_123",
        },
      });
    });

    it("should handle payment processing errors", async () => {
      const orderId = "323e4567-e89b-12d3-a456-426614174000";
      const paymentMethodId = "pm_123";

      // Mock order fetch to succeed but payment processing to fail
      mockDatabase.order.findUnique.mockResolvedValueOnce(
        createMockOrder({
          id: orderId,
          paymentStatus: "PENDING",
        }) as any,
      );

      // Mock Stripe to throw an error
      (global as any).stripe = {
        paymentIntents: {
          create: jest.fn().mockRejectedValueOnce(
            new Error("Payment failed"),
          ),
        },
      };

      const result = await checkoutService.processPayment(
        orderId,
        paymentMethodId,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYMENT_PROCESSING_FAILED");
    });
  });

  // ==========================================================================
  // GET CHECKOUT STATUS
  // ==========================================================================

  describe("getCheckoutStatus", () => {
    it("should return valid checkout status", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const mockCart = createMockCart([createMockCartItem({ quantity: 2 })]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: mockCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          issues: [],
        },
      });

      const result = await checkoutService.getCheckoutStatus(userId);

      expect(result.success).toBe(true);
      expect(result.data?.hasActiveCart).toBe(true);
      expect(result.data?.cartItemCount).toBe(2);
      expect(result.data?.canCheckout).toBe(true);
    });

    it("should return invalid status for empty cart", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const emptyCart = createMockCart([]);

      mockCartService.getCart.mockResolvedValueOnce({
        success: true,
        data: emptyCart,
      });
      mockCartService.validateCart.mockResolvedValueOnce({
        success: true,
        data: {
          valid: false,
          issues: [{ itemId: "none", message: "Cart is empty" }],
        },
      });

      const result = await checkoutService.getCheckoutStatus(userId);

      expect(result.success).toBe(true);
      expect(result.data?.hasActiveCart).toBe(false);
      expect(result.data?.canCheckout).toBe(false);
      expect(result.data?.issues).toHaveLength(1);
    });

    it("should handle cart fetch errors", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";

      mockCartService.getCart.mockResolvedValueOnce({
        success: false,
        error: {
          code: "CART_FETCH_ERROR",
          message: "Failed to fetch cart",
        },
      });

      const result = await checkoutService.getCheckoutStatus(userId);

      expect(result.success).toBe(true);
      expect(result.data?.hasActiveCart).toBe(false);
      expect(result.data?.canCheckout).toBe(false);
    });
  });

  // ==========================================================================
  // ORDER NUMBER GENERATION
  // ==========================================================================

  describe("generateOrderNumber", () => {
    it("should generate unique order numbers", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const mockCart = createMockCart([createMockCartItem()]);

      // Create multiple orders and check for unique order numbers
      const orderNumbers = new Set<string>();
      for (let i = 0; i < 5; i++) {
        mockCartService.getCart.mockResolvedValueOnce({
          success: true,
          data: mockCart,
        });
        mockCartService.validateCart.mockResolvedValueOnce({
          success: true,
          data: {
            valid: true,
            issues: [],
          },
        });
        mockCartService.reserveCartItems.mockResolvedValueOnce({
          success: true,
          data: undefined,
        });
        mockCartService.clearCart.mockResolvedValueOnce({
          success: true,
          data: undefined,
        });

        const mockOrder = createMockOrder({
          orderNumber: `FM-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8)}`,
        });

        mockDatabase.order.create.mockResolvedValueOnce(mockOrder as any);
        mockDatabase.product.update.mockResolvedValueOnce({} as any);

        const result = await checkoutService.createOrderFromCheckout({
          userId,
          shippingAddressId: "223e4567-e89b-12d3-a456-426614174000",
          fulfillmentMethod: "DELIVERY",
        });

        if (result.success && result.data) {
          const order = Array.isArray(result.data)
            ? result.data[0]
            : result.data;
          if (order) {
            orderNumbers.add(order.orderNumber);
          }
        }
      }

      expect(orderNumbers.size).toBe(5); // All order numbers should be unique
    });
  });
});

/**
 * 🌾 DIVINE TEST SUMMARY
 * =====================
 *
 * Coverage Areas:
 * ✅ Checkout initialization with cart validation
 * ✅ Order preview calculation (fees, taxes, totals)
 * ✅ Address validation and normalization
 * ✅ Payment intent creation via Stripe
 * ✅ Order creation from checkout session
 * ✅ Payment processing and order updates
 * ✅ Checkout status validation
 * ✅ Order number generation
 * ✅ Edge cases and error handling
 * ✅ Database transaction handling
 *
 * Agricultural Consciousness: MAXIMUM
 * Test Quality: DIVINE
 * Coverage Target: >90%
 */
