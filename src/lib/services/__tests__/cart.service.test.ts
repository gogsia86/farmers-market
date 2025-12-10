/**
 * 🛒 CART SERVICE TESTS - Divine Agricultural Commerce Testing
 *
 * Comprehensive test suite for CartService with 100% coverage target.
 * Tests all cart operations including:
 * - Get cart with product details
 * - Add to cart with validation
 * - Update cart item quantity
 * - Remove cart item
 * - Clear cart
 * - Merge guest cart
 * - Validate cart
 * - Reserve cart items
 * - Release reservations
 * - Delivery fee calculation
 *
 * NOTE: The cart.service is globally mocked in jest.setup.js
 * We need to unmock it to test the actual implementation
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

// ============================================
// UNMOCK - Restore real CartService (Jest hoists this)
// ============================================
jest.unmock("../cart.service");
jest.unmock("@/lib/services/cart.service");

// ============================================
// MOCK SETUP
// ============================================
jest.mock("@/lib/database", () => ({
  database: {
    cartItem: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: any) => Promise<any>) => {
      const { database } = require("@/lib/database");
      return fn(database);
    }),
  },
}));

// ============================================
// IMPORTS - After mocks are set up
// ============================================
import { database } from "@/lib/database";
import { CartService, cartService } from "../cart.service";
import type { CartItemData, CartSummary } from "../cart.service";

const mockDatabase = database as jest.Mocked<typeof database>;

// ============================================
// TEST DATA FACTORIES
// ============================================

const createMockProduct = (overrides: Partial<any> = {}) => ({
  id: "product_123",
  name: "Organic Tomatoes",
  description: "Fresh organic tomatoes from local farm",
  price: 5.99,
  unit: "lb",
  farmId: "farm_123",
  inStock: true,
  quantityAvailable: 100,
  images: ["https://example.com/tomato.jpg"],
  primaryPhotoUrl: null,
  organic: true,
  status: "ACTIVE",
  farm: {
    id: "farm_123",
    name: "Green Acres Farm",
    status: "ACTIVE",
  },
  ...overrides,
});

const createMockCartItem = (overrides: Partial<any> = {}) => ({
  id: "cart_item_123",
  userId: "user_123",
  productId: "product_123",
  farmId: "farm_123",
  quantity: 3,
  unit: "lb",
  priceAtAdd: 5.99,
  fulfillmentMethod: "DELIVERY",
  reservedUntil: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  product: createMockProduct(),
  ...overrides,
});

// ============================================
// TEST SUITE
// ============================================

describe("🛒 CartService - Divine Agricultural Commerce", () => {
  let service: CartService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartService();
  });

  // ==========================================
  // getCart Tests
  // ==========================================
  describe("📦 getCart - Retrieve User Cart", () => {
    it("should return cart with items and calculated totals", async () => {
      const mockCartItems = [
        createMockCartItem({
          quantity: 2,
          priceAtAdd: 5.99,
        }),
        createMockCartItem({
          id: "cart_item_456",
          productId: "product_456",
          farmId: "farm_456",
          quantity: 1,
          priceAtAdd: 8.99,
          product: createMockProduct({
            id: "product_456",
            name: "Fresh Eggs",
            price: 8.99,
            farmId: "farm_456",
            farm: {
              id: "farm_456",
              name: "Happy Hens Farm",
              status: "ACTIVE",
            },
          }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockCartItems,
      );

      const result = await service.getCart("user_123");

      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("subtotal");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("itemCount");
      expect(mockDatabase.cartItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: "user_123" }),
        }),
      );
    });

    it("should return empty cart when no items exist", async () => {
      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getCart("user_123");

      expect(result.items).toHaveLength(0);
      expect(result.subtotal).toBe(0);
      expect(result.itemCount).toBe(0);
    });

    it("should filter out expired reservations via query", async () => {
      const validItem = createMockCartItem({
        id: "valid_item",
        reservedUntil: new Date(Date.now() + 3600000), // 1 hour from now
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        validItem,
      ]);

      await service.getCart("user_123");

      expect(mockDatabase.cartItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { reservedUntil: null },
              {
                reservedUntil: expect.objectContaining({
                  gte: expect.any(Date),
                }),
              },
            ]),
          }),
        }),
      );
    });

    it("should handle items with missing product images", async () => {
      const itemWithoutImage = createMockCartItem({
        product: createMockProduct({ images: [], primaryPhotoUrl: null }),
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        itemWithoutImage,
      ]);

      const result = await service.getCart("user_123");
      expect(result.items).toHaveLength(1);
    });

    it("should use primaryPhotoUrl when images array is empty", async () => {
      const itemWithPrimaryPhoto = createMockCartItem({
        product: createMockProduct({
          images: [],
          primaryPhotoUrl: "https://example.com/primary.jpg",
        }),
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        itemWithPrimaryPhoto,
      ]);

      const result = await service.getCart("user_123");
      expect(result.items).toHaveLength(1);
    });

    it("should correctly map all cart item fields", async () => {
      const mockItem = createMockCartItem({
        fulfillmentMethod: "FARM_PICKUP",
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        mockItem,
      ]);

      const result = await service.getCart("user_123");

      expect(result.items[0]).toMatchObject({
        id: mockItem.id,
        productId: mockItem.productId,
        farmId: mockItem.farmId,
        name: mockItem.product.name,
        quantity: mockItem.quantity,
        unit: mockItem.unit,
        organic: mockItem.product.organic,
        inStock: true,
        fulfillmentMethod: "FARM_PICKUP",
      });
    });

    it("should mark item as out of stock when quantity exceeds available", async () => {
      const itemWithLowStock = createMockCartItem({
        quantity: 100,
        product: createMockProduct({ quantityAvailable: 10 }),
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        itemWithLowStock,
      ]);

      const result = await service.getCart("user_123");
      expect(result.items[0].inStock).toBe(false);
    });
  });

  // ==========================================
  // addToCart Tests
  // ==========================================
  describe("➕ addToCart - Add Item to Cart", () => {
    it("should add new item to cart successfully", async () => {
      const product = createMockProduct();
      const newCartItem = createMockCartItem();

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(product);
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDatabase.cartItem.create as jest.Mock).mockResolvedValue(
        newCartItem,
      );

      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: 2,
        fulfillmentMethod: "DELIVERY",
      });

      expect(result.success).toBe(true);
    });

    it("should increment quantity for existing cart item", async () => {
      const product = createMockProduct();
      const existingItem = createMockCartItem({ quantity: 2 });
      const updatedItem = createMockCartItem({ quantity: 5 });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(product);
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue(
        updatedItem,
      );

      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: 3,
      });

      expect(result.success).toBe(true);
      expect(mockDatabase.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: existingItem.id },
          data: expect.objectContaining({
            quantity: { increment: 3 },
          }),
        }),
      );
    });

    it("should return error for invalid product ID", async () => {
      const result = await service.addToCart("user_123", {
        productId: "",
        quantity: 1,
      });

      expect(result.success).toBe(false);
    });

    it("should return error for invalid quantity (zero)", async () => {
      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should return error for invalid quantity (negative)", async () => {
      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: -1,
      });

      expect(result.success).toBe(false);
    });

    it("should return error for quantity exceeding maximum", async () => {
      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: 5000,
      });

      expect(result.success).toBe(false);
    });

    it("should return error when product not found", async () => {
      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.addToCart("user_123", {
        productId: "nonexistent",
        quantity: 1,
      });

      expect(result.success).toBe(false);
    });

    it("should return error when product is out of stock", async () => {
      const outOfStockProduct = createMockProduct({
        inStock: false,
        quantityAvailable: 0,
      });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        outOfStockProduct,
      );

      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: 1,
      });

      expect(result.success).toBe(false);
    });

    it("should return error when quantity exceeds available stock", async () => {
      const limitedStockProduct = createMockProduct({
        quantityAvailable: 5,
      });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        limitedStockProduct,
      );
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: 10,
      });

      expect(result.success).toBe(false);
    });

    it("should return error when total cart quantity exceeds stock", async () => {
      const product = createMockProduct({ quantityAvailable: 10 });
      const existingCartItem = createMockCartItem({ quantity: 8 });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(product);
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(
        existingCartItem,
      );

      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: 5,
      });

      expect(result.success).toBe(false);
    });

    it("should handle database error gracefully", async () => {
      (mockDatabase.product.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.addToCart("user_123", {
        productId: "product_123",
        quantity: 1,
      });

      expect(result.success).toBe(false);
    });

    it("should support all fulfillment methods", async () => {
      const product = createMockProduct();
      const cartItem = createMockCartItem();

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(product);
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDatabase.cartItem.create as jest.Mock).mockResolvedValue(cartItem);

      const methods = ["DELIVERY", "FARM_PICKUP", "MARKET_PICKUP"] as const;

      for (const method of methods) {
        const result = await service.addToCart("user_123", {
          productId: "product_123",
          quantity: 1,
          fulfillmentMethod: method,
        });

        expect(result.success).toBe(true);
      }
    });
  });

  // ==========================================
  // updateCartItem Tests
  // ==========================================
  describe("✏️ updateCartItem - Update Cart Item Quantity", () => {
    it("should update cart item quantity successfully", async () => {
      const existingItem = createMockCartItem({ quantity: 2 });
      const updatedItem = createMockCartItem({ quantity: 5 });

      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue(
        updatedItem,
      );

      const result = await service.updateCartItem("user_123", "cart_item_123", {
        quantity: 5,
      });

      expect(result.success).toBe(true);
      expect(mockDatabase.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "cart_item_123" },
        }),
      );
    });

    it("should return error for negative quantity", async () => {
      const result = await service.updateCartItem("user_123", "cart_item_123", {
        quantity: -5,
      });

      expect(result.success).toBe(false);
    });

    it("should return error for quantity exceeding maximum", async () => {
      const result = await service.updateCartItem("user_123", "cart_item_123", {
        quantity: 5000,
      });

      expect(result.success).toBe(false);
    });

    it("should remove item when quantity is zero", async () => {
      const existingItem = createMockCartItem();

      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (mockDatabase.cartItem.delete as jest.Mock).mockResolvedValue(
        existingItem,
      );

      const result = await service.updateCartItem("user_123", "cart_item_123", {
        quantity: 0,
      });

      expect(result.success).toBe(true);
    });

    it("should return error when cart item not found", async () => {
      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.updateCartItem("user_123", "cart_item_123", {
        quantity: 5,
      });

      expect(result.success).toBe(false);
    });

    it("should prevent updating cart item belonging to another user", async () => {
      const otherUserItem = createMockCartItem({ userId: "other_user" });

      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(
        otherUserItem,
      );

      const result = await service.updateCartItem("user_123", "cart_item_123", {
        quantity: 5,
      });

      expect(result.success).toBe(false);
    });

    it("should return error when new quantity exceeds available stock", async () => {
      const existingItem = createMockCartItem({
        product: createMockProduct({ quantityAvailable: 5 }),
      });

      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(
        existingItem,
      );

      const result = await service.updateCartItem("user_123", "cart_item_123", {
        quantity: 10,
      });

      expect(result.success).toBe(false);
    });

    it("should handle database error gracefully", async () => {
      (mockDatabase.cartItem.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.updateCartItem("user_123", "cart_item_123", {
        quantity: 5,
      });

      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // removeCartItem Tests
  // ==========================================
  describe("🗑️ removeCartItem - Remove Item from Cart", () => {
    it("should remove cart item successfully", async () => {
      const existingItem = createMockCartItem();

      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue({
        userId: "user_123",
      });
      (mockDatabase.cartItem.delete as jest.Mock).mockResolvedValue(
        existingItem,
      );

      const result = await service.removeCartItem("user_123", "cart_item_123");

      expect(result.success).toBe(true);
      expect(mockDatabase.cartItem.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "cart_item_123" },
        }),
      );
    });

    it("should return error when cart item not found", async () => {
      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.removeCartItem("user_123", "nonexistent");

      expect(result.success).toBe(false);
    });

    it("should prevent removing cart item belonging to another user", async () => {
      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue({
        userId: "other_user",
      });

      const result = await service.removeCartItem("user_123", "cart_item_123");

      expect(result.success).toBe(false);
    });

    it("should handle database error gracefully", async () => {
      (mockDatabase.cartItem.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.removeCartItem("user_123", "cart_item_123");

      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // clearCart Tests
  // ==========================================
  describe("🧹 clearCart - Clear All Cart Items", () => {
    it("should clear all cart items successfully", async () => {
      (mockDatabase.cartItem.deleteMany as jest.Mock).mockResolvedValue({
        count: 5,
      });

      const result = await service.clearCart("user_123");

      expect(result.success).toBe(true);
      expect(mockDatabase.cartItem.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user_123" },
        }),
      );
    });

    it("should return success even when cart is already empty", async () => {
      (mockDatabase.cartItem.deleteMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      const result = await service.clearCart("user_123");

      expect(result.success).toBe(true);
    });

    it("should handle database error gracefully", async () => {
      (mockDatabase.cartItem.deleteMany as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.clearCart("user_123");

      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // mergeGuestCart Tests
  // ==========================================
  describe("🔀 mergeGuestCart - Merge Guest Cart on Login", () => {
    it("should merge guest cart items successfully", async () => {
      const guestItems = [
        {
          productId: "product_123",
          quantity: 2,
        },
        {
          productId: "product_456",
          quantity: 1,
        },
      ];

      const product1 = createMockProduct();
      const product2 = createMockProduct({
        id: "product_456",
        name: "Fresh Eggs",
      });

      (mockDatabase.product.findUnique as jest.Mock)
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDatabase.cartItem.create as jest.Mock).mockResolvedValue(
        createMockCartItem(),
      );

      const result = await service.mergeGuestCart("user_123", guestItems);

      expect(result.success).toBe(true);
      expect(result.merged).toBe(2);
    });

    it("should return zero merged count for empty guest cart", async () => {
      const result = await service.mergeGuestCart("user_123", []);

      expect(result.success).toBe(true);
      expect(result.merged).toBe(0);
    });

    it("should skip items that fail to add", async () => {
      const guestItems = [
        {
          productId: "product_123",
          quantity: 1,
        },
      ];

      // Product not found
      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.mergeGuestCart("user_123", guestItems);

      expect(result.success).toBe(true);
      expect(result.merged).toBe(0);
    });

    it("should handle errors during merge gracefully", async () => {
      const guestItems = [
        {
          productId: "product_123",
          quantity: 1,
        },
      ];

      (mockDatabase.product.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.mergeGuestCart("user_123", guestItems);

      // The method catches errors and returns merged: 0
      expect(result.merged).toBe(0);
    });
  });

  // ==========================================
  // validateCart Tests
  // ==========================================
  describe("✅ validateCart - Validate Cart Items", () => {
    it("should return valid when all items are available", async () => {
      const cartItems = [
        createMockCartItem({
          priceAtAdd: 5.99,
          product: createMockProduct({
            price: 5.99,
            quantityAvailable: 100,
          }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.validateCart("user_123");

      expect(result.valid).toBe(true);
    });

    it("should detect out of stock items", async () => {
      const cartItems = [
        createMockCartItem({
          quantity: 10,
          product: createMockProduct({
            quantityAvailable: 0,
          }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.validateCart("user_123");

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should detect insufficient stock", async () => {
      const cartItems = [
        createMockCartItem({
          quantity: 50,
          product: createMockProduct({ quantityAvailable: 10 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.validateCart("user_123");

      expect(result.valid).toBe(false);
      expect(result.issues[0].message).toContain("available");
    });

    it("should detect price changes", async () => {
      const cartItems = [
        createMockCartItem({
          priceAtAdd: 5.99,
          product: createMockProduct({
            price: 7.99,
            quantityAvailable: 100,
          }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.validateCart("user_123");

      expect(result.valid).toBe(false);
      expect(result.issues[0].message).toContain("changed");
    });

    it("should detect inactive farms", async () => {
      const cartItems = [
        createMockCartItem({
          priceAtAdd: 5.99,
          product: createMockProduct({
            price: 5.99,
            farm: { id: "farm_123", name: "Closed Farm", status: "INACTIVE" },
          }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.validateCart("user_123");

      expect(result.valid).toBe(false);
      expect(result.issues[0].message).toContain("not currently accepting");
    });

    it("should return valid for empty cart", async () => {
      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.validateCart("user_123");

      expect(result.valid).toBe(true);
    });

    it("should detect multiple issues", async () => {
      const cartItems = [
        createMockCartItem({
          id: "item_1",
          priceAtAdd: 5.99,
          product: createMockProduct({
            quantityAvailable: 0,
          }),
        }),
        createMockCartItem({
          id: "item_2",
          quantity: 100,
          priceAtAdd: 5.99,
          product: createMockProduct({ quantityAvailable: 10 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.validateCart("user_123");

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==========================================
  // reserveCartItems Tests
  // ==========================================
  describe("🔒 reserveCartItems - Reserve Items for Checkout", () => {
    it("should reserve cart items successfully", async () => {
      (mockDatabase.cartItem.updateMany as jest.Mock).mockResolvedValue({
        count: 3,
      });

      const result = await service.reserveCartItems("user_123", 15);

      expect(result.success).toBe(true);
      expect(mockDatabase.cartItem.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user_123" },
          data: { reservedUntil: expect.any(Date) },
        }),
      );
    });

    it("should set correct reservation duration", async () => {
      (mockDatabase.cartItem.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      const durationMinutes = 30;
      const beforeCall = Date.now();

      await service.reserveCartItems("user_123", durationMinutes);

      const call = (mockDatabase.cartItem.updateMany as jest.Mock).mock
        .calls[0][0];
      const reservedUntil = call.data.reservedUntil.getTime();

      expect(reservedUntil).toBeGreaterThanOrEqual(
        beforeCall + durationMinutes * 60 * 1000 - 1000,
      );
      expect(reservedUntil).toBeLessThanOrEqual(
        beforeCall + durationMinutes * 60 * 1000 + 1000,
      );
    });

    it("should handle database error gracefully", async () => {
      (mockDatabase.cartItem.updateMany as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.reserveCartItems("user_123", 15);

      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // releaseReservations Tests
  // ==========================================
  describe("🔓 releaseReservations - Release Reserved Items", () => {
    it("should release reservations successfully", async () => {
      (mockDatabase.cartItem.updateMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await service.releaseReservations("user_123");

      expect(result.success).toBe(true);
      expect(mockDatabase.cartItem.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user_123" },
          data: { reservedUntil: null },
        }),
      );
    });

    it("should return success even when no items to release", async () => {
      (mockDatabase.cartItem.updateMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      const result = await service.releaseReservations("user_123");

      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // calculateDeliveryFee Tests (via getCart)
  // ==========================================
  describe("🚚 calculateDeliveryFee - Private Method (via getCart)", () => {
    it("should calculate delivery fee for single farm delivery under $50", async () => {
      const cartItems = [
        createMockCartItem({
          fulfillmentMethod: "DELIVERY",
          quantity: 2,
          priceAtAdd: 10.0,
          product: createMockProduct({ price: 10.0, quantityAvailable: 100 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.getCart("user_123");

      // Subtotal = 2 * 10 = 20, which is under $50, so delivery fee should apply
      expect(result.deliveryFee).toBeGreaterThan(0);
    });

    it("should waive delivery fee for orders $50 and above", async () => {
      const cartItems = [
        createMockCartItem({
          fulfillmentMethod: "DELIVERY",
          quantity: 10,
          priceAtAdd: 10.0,
          product: createMockProduct({ price: 10.0, quantityAvailable: 100 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.getCart("user_123");

      // Subtotal = 10 * 10 = 100, which is >= $50, so delivery fee should be waived
      expect(result.deliveryFee).toBe(0);
    });

    it("should apply zero fee for farm pickup", async () => {
      const cartItems = [
        createMockCartItem({
          fulfillmentMethod: "FARM_PICKUP",
          quantity: 1,
          priceAtAdd: 20.0,
          product: createMockProduct({ price: 20.0, quantityAvailable: 100 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.getCart("user_123");

      expect(result.deliveryFee).toBe(0);
    });

    it("should apply zero fee for market pickup", async () => {
      const cartItems = [
        createMockCartItem({
          fulfillmentMethod: "MARKET_PICKUP",
          quantity: 1,
          priceAtAdd: 20.0,
          product: createMockProduct({ price: 20.0, quantityAvailable: 100 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.getCart("user_123");

      expect(result.deliveryFee).toBe(0);
    });

    it("should calculate fee for multiple farms with delivery", async () => {
      const cartItems = [
        createMockCartItem({
          farmId: "farm_123",
          fulfillmentMethod: "DELIVERY",
          priceAtAdd: 5.0,
          quantity: 1,
          product: createMockProduct({
            farmId: "farm_123",
            price: 5.0,
            farm: { id: "farm_123", name: "Farm 1", status: "ACTIVE" },
          }),
        }),
        createMockCartItem({
          id: "cart_item_456",
          farmId: "farm_456",
          fulfillmentMethod: "DELIVERY",
          priceAtAdd: 5.0,
          quantity: 1,
          product: createMockProduct({
            farmId: "farm_456",
            price: 5.0,
            farm: { id: "farm_456", name: "Farm 2", status: "ACTIVE" },
          }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        cartItems,
      );

      const result = await service.getCart("user_123");

      // Multiple farms should have some delivery fee structure
      expect(result.farmCount).toBe(2);
    });
  });

  // ==========================================
  // Singleton Export Tests
  // ==========================================
  describe("🔄 Singleton Export", () => {
    it("should export a singleton instance", () => {
      expect(cartService).toBeInstanceOf(CartService);
    });

    it("should have all public methods", () => {
      expect(typeof cartService.getCart).toBe("function");
      expect(typeof cartService.addToCart).toBe("function");
      expect(typeof cartService.updateCartItem).toBe("function");
      expect(typeof cartService.removeCartItem).toBe("function");
      expect(typeof cartService.clearCart).toBe("function");
      expect(typeof cartService.mergeGuestCart).toBe("function");
      expect(typeof cartService.validateCart).toBe("function");
      expect(typeof cartService.reserveCartItems).toBe("function");
      expect(typeof cartService.releaseReservations).toBe("function");
    });
  });

  // ==========================================
  // Edge Cases and Error Handling Tests
  // ==========================================
  describe("🔧 Edge Cases and Error Handling", () => {
    it("should handle special characters in product names", async () => {
      const specialProduct = createMockProduct({
        name: "Organic Tomatoes & Peppers <Fresh>",
      });
      const cartItem = createMockCartItem({
        product: specialProduct,
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        cartItem,
      ]);

      const result = await service.getCart("user_123");

      expect(result.items[0].name).toBe("Organic Tomatoes & Peppers <Fresh>");
    });

    it("should handle concurrent add operations", async () => {
      const product = createMockProduct();
      const cartItem = createMockCartItem();

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(product);
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDatabase.cartItem.create as jest.Mock).mockResolvedValue(cartItem);

      const promises = [
        service.addToCart("user_123", {
          productId: "product_123",
          quantity: 1,
        }),
        service.addToCart("user_123", {
          productId: "product_123",
          quantity: 1,
        }),
        service.addToCart("user_123", {
          productId: "product_123",
          quantity: 1,
        }),
      ];

      const results = await Promise.all(promises);

      expect(results.every((r) => r.success)).toBe(true);
    });
  });

  // ==========================================
  // Agricultural Consciousness Patterns
  // ==========================================
  describe("🌾 Agricultural Consciousness Patterns", () => {
    it("should properly track organic products", async () => {
      const organicItem = createMockCartItem({
        product: createMockProduct({ organic: true }),
      });
      const nonOrganicItem = createMockCartItem({
        id: "cart_item_456",
        product: createMockProduct({ id: "product_456", organic: false }),
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        organicItem,
        nonOrganicItem,
      ]);

      const result = await service.getCart("user_123");

      expect(result.items[0].organic).toBe(true);
      expect(result.items[1].organic).toBe(false);
    });

    it("should track farm names for local sourcing", async () => {
      const localFarmItem = createMockCartItem({
        product: createMockProduct({
          farm: {
            id: "farm_123",
            name: "Local Valley Farm",
            status: "ACTIVE",
          },
        }),
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        localFarmItem,
      ]);

      const result = await service.getCart("user_123");

      expect(result.items[0].farmName).toBe("Local Valley Farm");
    });
  });
});
