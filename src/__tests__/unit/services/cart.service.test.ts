/**
 * 🧪 CART SERVICE UNIT TESTS - COMPREHENSIVE TEST SUITE
 *
 * Test suite for the CartService demonstrating best practices
 *
 * Features Tested:
 * - Cart creation and initialization
 * - Adding items to cart
 * - Removing items from cart
 * - Updating item quantities
 * - Cart total calculations
 * - Cart clearing
 * - Cart expiration handling
 * - Error handling
 *
 * Patterns Demonstrated:
 * - Database mocking
 * - Cache mocking
 * - Async testing
 * - Error scenario testing
 * - Type-safe mocks
 * - Comprehensive coverage
 *
 * @reference .cursorrules - Testing Patterns
 */

import { multiLayerCache } from "@/lib/cache/multi-layer.cache";
import { database } from "@/lib/database";
import { CartService } from "@/lib/services/cart.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Cart, CartItem, Product } from "@prisma/client";

// ============================================================================
// MOCKS
// ============================================================================

// Mock the database
jest.mock("@/lib/database", () => ({
  database: {
    cart: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    cartItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock the cache
jest.mock("@/lib/cache/multi-layer.cache", () => ({
  multiLayerCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    invalidatePattern: jest.fn(),
  },
  CacheTTL: {
    SHORT: 300,
    MEDIUM: 1800,
    LONG: 7200,
  },
}));

// Mock the logger
jest.mock("@/lib/monitoring/logger", () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Create a mock cart object
 */
function createMockCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: "cart_123",
    userId: "user_123",
    sessionId: "session_123",
    totalItems: 2,
    subtotal: 25.0,
    tax: 2.5,
    total: 27.5,
    currency: "USD",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
    ...overrides,
  } as Cart;
}

/**
 * Create mock cart items
 */
function createMockCartItems(): CartItem[] {
  return [
    {
      id: "item_1",
      cartId: "cart_123",
      productId: "prod_1",
      quantity: 2,
      price: 10.0,
      subtotal: 20.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as CartItem,
    {
      id: "item_2",
      cartId: "cart_123",
      productId: "prod_2",
      quantity: 1,
      price: 5.0,
      subtotal: 5.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as CartItem,
  ];
}

/**
 * Create a mock product
 */
function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod_1",
    name: "Organic Tomatoes",
    slug: "organic-tomatoes",
    description: "Fresh organic tomatoes",
    category: "VEGETABLES",
    farmId: "farm_123",
    price: 10.0,
    unit: "lb",
    quantityAvailable: 100,
    images: ["https://example.com/tomato.jpg"],
    tags: ["organic", "fresh"],
    organic: true,
    harvestDate: new Date("2025-01-10"),
    storageInstructions: "Store in cool place",
    status: "ACTIVE",
    viewsCount: 50,
    cartAddsCount: 10,
    purchaseCount: 5,
    wishlistCount: 3,
    reviewCount: 2,
    averageRating: 4.5,
    sku: "TOM-ORG-001",
    barcode: null,
    weight: null,
    dimensions: null,
    shippingClass: null,
    taxClass: null,
    featured: false,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-15"),
    deletedAt: null,
    ...overrides,
  } as Product;
}

// ============================================================================
// TESTS
// ============================================================================

describe("CartService", () => {
  let cartService: CartService;

  beforeEach(() => {
    jest.clearAllMocks();
    cartService = new CartService();
  });

  // ==========================================================================
  // GET OR CREATE CART TESTS
  // ==========================================================================

  describe("getOrCreateCart", () => {
    it("should return existing cart if found", async () => {
      // Arrange
      const userId = "user_123";
      const existingCart = createMockCart({ userId });

      jest.mocked(database.cart.findFirst).mockResolvedValue(existingCart);

      // Act
      const result = await cartService.getOrCreateCart(userId);

      // Assert
      expect(result).toEqual(existingCart);
      expect(database.cart.findFirst).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Object),
      });
    });

    it("should create new cart if not found", async () => {
      // Arrange
      const userId = "user_123";
      const newCart = createMockCart({ userId });

      jest.mocked(database.cart.findFirst).mockResolvedValue(null);
      jest.mocked(database.cart.create).mockResolvedValue(newCart);

      // Act
      const result = await cartService.getOrCreateCart(userId);

      // Assert
      expect(result).toEqual(newCart);
      expect(database.cart.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          totalItems: 0,
          subtotal: 0,
          total: 0,
        }),
      });
    });

    it("should set expiration date for new cart", async () => {
      // Arrange
      const userId = "user_123";
      const newCart = createMockCart({ userId });

      jest.mocked(database.cart.findFirst).mockResolvedValue(null);
      jest.mocked(database.cart.create).mockResolvedValue(newCart);

      // Act
      await cartService.getOrCreateCart(userId);

      // Assert
      expect(database.cart.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      });
    });

    it("should handle session-based carts", async () => {
      // Arrange
      const sessionId = "session_123";
      const existingCart = createMockCart({ sessionId, userId: null });

      jest.mocked(database.cart.findFirst).mockResolvedValue(existingCart);

      // Act
      const result = await cartService.getOrCreateCart(null, sessionId);

      // Assert
      expect(result).toEqual(existingCart);
      expect(database.cart.findFirst).toHaveBeenCalledWith({
        where: { sessionId },
        include: expect.any(Object),
      });
    });
  });

  // ==========================================================================
  // ADD TO CART TESTS
  // ==========================================================================

  describe("addToCart", () => {
    it("should add new item to cart successfully", async () => {
      // Arrange
      const userId = "user_123";
      const productId = "prod_1";
      const quantity = 2;
      const cart = createMockCart({ userId });
      const product = createMockProduct({ id: productId, price: 10.0 });
      const newCartItem = {
        id: "item_1",
        cartId: cart.id,
        productId,
        quantity,
        price: 10.0,
        subtotal: 20.0,
      } as CartItem;

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.product.findUnique).mockResolvedValue(product);
      jest.mocked(database.cartItem.findFirst).mockResolvedValue(null);
      jest.mocked(database.cartItem.create).mockResolvedValue(newCartItem);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      const result = await cartService.addToCart(userId, productId, quantity);

      // Assert
      expect(database.cartItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
        }),
      });
    });

    it("should update existing item quantity if item already in cart", async () => {
      // Arrange
      const userId = "user_123";
      const productId = "prod_1";
      const quantity = 2;
      const cart = createMockCart({ userId });
      const product = createMockProduct({ id: productId, price: 10.0 });
      const existingItem = {
        id: "item_1",
        cartId: cart.id,
        productId,
        quantity: 3,
        price: 10.0,
        subtotal: 30.0,
      } as CartItem;
      const updatedItem = { ...existingItem, quantity: 5, subtotal: 50.0 };

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.product.findUnique).mockResolvedValue(product);
      jest.mocked(database.cartItem.findFirst).mockResolvedValue(existingItem);
      jest.mocked(database.cartItem.update).mockResolvedValue(updatedItem);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.addToCart(userId, productId, quantity);

      // Assert
      expect(database.cartItem.update).toHaveBeenCalledWith({
        where: { id: existingItem.id },
        data: expect.objectContaining({
          quantity: existingItem.quantity + quantity,
          subtotal: (existingItem.quantity + quantity) * product.price,
        }),
      });
    });

    it("should throw error if product not found", async () => {
      // Arrange
      const userId = "user_123";
      const productId = "nonexistent";
      const quantity = 2;
      const cart = createMockCart({ userId });

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.product.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        cartService.addToCart(userId, productId, quantity)
      ).rejects.toThrow();
    });

    it("should throw error if product is out of stock", async () => {
      // Arrange
      const userId = "user_123";
      const productId = "prod_1";
      const quantity = 10;
      const cart = createMockCart({ userId });
      const product = createMockProduct({
        id: productId,
        quantityAvailable: 5,
      });

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.product.findUnique).mockResolvedValue(product);

      // Act & Assert
      await expect(
        cartService.addToCart(userId, productId, quantity)
      ).rejects.toThrow();
    });

    it("should validate quantity is positive", async () => {
      // Arrange
      const userId = "user_123";
      const productId = "prod_1";
      const quantity = -2;

      // Act & Assert
      await expect(
        cartService.addToCart(userId, productId, quantity)
      ).rejects.toThrow();
    });

    it("should update cart totals after adding item", async () => {
      // Arrange
      const userId = "user_123";
      const productId = "prod_1";
      const quantity = 2;
      const cart = createMockCart({ userId, totalItems: 1, subtotal: 10.0 });
      const product = createMockProduct({ id: productId, price: 10.0 });
      const newCartItem = {
        id: "item_1",
        cartId: cart.id,
        productId,
        quantity,
        price: 10.0,
        subtotal: 20.0,
      } as CartItem;

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.product.findUnique).mockResolvedValue(product);
      jest.mocked(database.cartItem.findFirst).mockResolvedValue(null);
      jest.mocked(database.cartItem.create).mockResolvedValue(newCartItem);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.addToCart(userId, productId, quantity);

      // Assert
      expect(database.cart.update).toHaveBeenCalledWith({
        where: { id: cart.id },
        data: expect.objectContaining({
          totalItems: expect.any(Number),
          subtotal: expect.any(Number),
          total: expect.any(Number),
        }),
      });
    });

    it("should invalidate cart cache after adding item", async () => {
      // Arrange
      const userId = "user_123";
      const productId = "prod_1";
      const quantity = 2;
      const cart = createMockCart({ userId });
      const product = createMockProduct({ id: productId });

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.product.findUnique).mockResolvedValue(product);
      jest.mocked(database.cartItem.findFirst).mockResolvedValue(null);
      jest.mocked(database.cartItem.create).mockResolvedValue({} as CartItem);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.addToCart(userId, productId, quantity);

      // Assert
      expect(multiLayerCache.invalidatePattern).toHaveBeenCalledWith(
        expect.stringContaining("cart")
      );
    });
  });

  // ==========================================================================
  // UPDATE CART ITEM TESTS
  // ==========================================================================

  describe("updateCartItemQuantity", () => {
    it("should update item quantity successfully", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "item_1";
      const newQuantity = 5;
      const cart = createMockCart({ userId });
      const existingItem = {
        id: itemId,
        cartId: cart.id,
        productId: "prod_1",
        quantity: 2,
        price: 10.0,
        subtotal: 20.0,
      } as CartItem;
      const updatedItem = { ...existingItem, quantity: newQuantity, subtotal: 50.0 };

      jest.mocked(database.cartItem.findUnique).mockResolvedValue(existingItem);
      jest.mocked(database.cartItem.update).mockResolvedValue(updatedItem);
      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      const result = await cartService.updateCartItemQuantity(
        userId,
        itemId,
        newQuantity
      );

      // Assert
      expect(result).toEqual(updatedItem);
      expect(database.cartItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: expect.objectContaining({
          quantity: newQuantity,
          subtotal: newQuantity * existingItem.price,
        }),
      });
    });

    it("should remove item if quantity is zero", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "item_1";
      const newQuantity = 0;
      const cart = createMockCart({ userId });
      const existingItem = {
        id: itemId,
        cartId: cart.id,
        productId: "prod_1",
        quantity: 2,
        price: 10.0,
        subtotal: 20.0,
      } as CartItem;

      jest.mocked(database.cartItem.findUnique).mockResolvedValue(existingItem);
      jest.mocked(database.cartItem.delete).mockResolvedValue(existingItem);
      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.updateCartItemQuantity(userId, itemId, newQuantity);

      // Assert
      expect(database.cartItem.delete).toHaveBeenCalledWith({
        where: { id: itemId },
      });
    });

    it("should throw error if item not found", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "nonexistent";
      const newQuantity = 5;

      jest.mocked(database.cartItem.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        cartService.updateCartItemQuantity(userId, itemId, newQuantity)
      ).rejects.toThrow();
    });

    it("should validate quantity is not negative", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "item_1";
      const newQuantity = -5;

      // Act & Assert
      await expect(
        cartService.updateCartItemQuantity(userId, itemId, newQuantity)
      ).rejects.toThrow();
    });

    it("should update cart totals after updating item", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "item_1";
      const newQuantity = 5;
      const cart = createMockCart({ userId });
      const existingItem = {
        id: itemId,
        cartId: cart.id,
        quantity: 2,
        price: 10.0,
      } as CartItem;

      jest.mocked(database.cartItem.findUnique).mockResolvedValue(existingItem);
      jest.mocked(database.cartItem.update).mockResolvedValue(existingItem);
      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.updateCartItemQuantity(userId, itemId, newQuantity);

      // Assert
      expect(database.cart.update).toHaveBeenCalledWith({
        where: { id: cart.id },
        data: expect.objectContaining({
          totalItems: expect.any(Number),
          subtotal: expect.any(Number),
          total: expect.any(Number),
        }),
      });
    });
  });

  // ==========================================================================
  // REMOVE FROM CART TESTS
  // ==========================================================================

  describe("removeFromCart", () => {
    it("should remove item from cart successfully", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "item_1";
      const cart = createMockCart({ userId });
      const existingItem = {
        id: itemId,
        cartId: cart.id,
        productId: "prod_1",
        quantity: 2,
        price: 10.0,
        subtotal: 20.0,
      } as CartItem;

      jest.mocked(database.cartItem.findUnique).mockResolvedValue(existingItem);
      jest.mocked(database.cartItem.delete).mockResolvedValue(existingItem);
      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.removeFromCart(userId, itemId);

      // Assert
      expect(database.cartItem.delete).toHaveBeenCalledWith({
        where: { id: itemId },
      });
    });

    it("should throw error if item not found", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "nonexistent";

      jest.mocked(database.cartItem.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.removeFromCart(userId, itemId)).rejects.toThrow();
    });

    it("should update cart totals after removing item", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "item_1";
      const cart = createMockCart({ userId, totalItems: 3, subtotal: 50.0 });
      const existingItem = {
        id: itemId,
        cartId: cart.id,
        quantity: 2,
        price: 10.0,
        subtotal: 20.0,
      } as CartItem;

      jest.mocked(database.cartItem.findUnique).mockResolvedValue(existingItem);
      jest.mocked(database.cartItem.delete).mockResolvedValue(existingItem);
      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.removeFromCart(userId, itemId);

      // Assert
      expect(database.cart.update).toHaveBeenCalledWith({
        where: { id: cart.id },
        data: expect.objectContaining({
          totalItems: expect.any(Number),
          subtotal: expect.any(Number),
          total: expect.any(Number),
        }),
      });
    });

    it("should invalidate cart cache after removing item", async () => {
      // Arrange
      const userId = "user_123";
      const itemId = "item_1";
      const cart = createMockCart({ userId });
      const existingItem = { id: itemId, cartId: cart.id } as CartItem;

      jest.mocked(database.cartItem.findUnique).mockResolvedValue(existingItem);
      jest.mocked(database.cartItem.delete).mockResolvedValue(existingItem);
      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.removeFromCart(userId, itemId);

      // Assert
      expect(multiLayerCache.invalidatePattern).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // CLEAR CART TESTS
  // ==========================================================================

  describe("clearCart", () => {
    it("should clear all items from cart", async () => {
      // Arrange
      const userId = "user_123";
      const cart = createMockCart({ userId });

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.cartItem.deleteMany).mockResolvedValue({ count: 2 });
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.clearCart(userId);

      // Assert
      expect(database.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: cart.id },
      });
    });

    it("should reset cart totals to zero", async () => {
      // Arrange
      const userId = "user_123";
      const cart = createMockCart({ userId, totalItems: 5, subtotal: 100.0 });

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);
      jest.mocked(database.cartItem.deleteMany).mockResolvedValue({ count: 5 });
      jest.mocked(database.cart.update).mockResolvedValue(cart);

      // Act
      await cartService.clearCart(userId);

      // Assert
      expect(database.cart.update).toHaveBeenCalledWith({
        where: { id: cart.id },
        data: {
          totalItems: 0,
          subtotal: 0,
          tax: 0,
          total: 0,
        },
      });
    });

    it("should throw error if cart not found", async () => {
      // Arrange
      const userId = "user_123";

      jest.mocked(database.cart.findFirst).mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.clearCart(userId)).rejects.toThrow();
    });
  });

  // ==========================================================================
  // GET CART TESTS
  // ==========================================================================

  describe("getCart", () => {
    it("should return cart with items", async () => {
      // Arrange
      const userId = "user_123";
      const cart = createMockCart({ userId });

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);

      // Act
      const result = await cartService.getCart(userId);

      // Assert
      expect(result).toEqual(cart);
      expect(database.cart.findFirst).toHaveBeenCalledWith({
        where: { userId },
        include: expect.objectContaining({
          items: expect.any(Object),
        }),
      });
    });

    it("should return null if cart not found", async () => {
      // Arrange
      const userId = "user_123";

      jest.mocked(database.cart.findFirst).mockResolvedValue(null);

      // Act
      const result = await cartService.getCart(userId);

      // Assert
      expect(result).toBeNull();
    });

    it("should include product details in cart items", async () => {
      // Arrange
      const userId = "user_123";
      const cart = createMockCart({ userId });

      jest.mocked(database.cart.findFirst).mockResolvedValue(cart);

      // Act
      await cartService.getCart(userId);

      // Assert
      expect(database.cart.findFirst).toHaveBeenCalledWith({
        where: { userId },
        include: expect.objectContaining({
          items: expect.objectContaining({
            include: expect.objectContaining({
              product: true,
            }),
          }),
        }),
      });
    });
  });

  // ==========================================================================
  // CART EXPIRATION TESTS
  // ==========================================================================

  describe("cleanupExpiredCarts", () => {
    it("should delete expired carts", async () => {
      // Arrange
      const expiredCarts = [
        createMockCart({ id: "cart_1", expiresAt: new Date(Date.now() - 1000) }),
        createMockCart({ id: "cart_2", expiresAt: new Date(Date.now() - 2000) }),
      ];

      jest.mocked(database.cart.findMany).mockResolvedValue(expiredCarts);
      jest.mocked(database.cart.delete).mockResolvedValue({} as Cart);

      // Act
      await cartService.cleanupExpiredCarts();

      // Assert
      expect(database.cart.delete).toHaveBeenCalledTimes(2);
    });

    it("should not delete active carts", async () => {
      // Arrange
      jest.mocked(database.cart.findMany).mockResolvedValue([]);

      // Act
      await cartService.cleanupExpiredCarts();

      // Assert
      expect(database.cart.delete).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // MERGE CARTS TESTS
  // ==========================================================================

  describe("mergeCarts", () => {
    it("should merge guest cart into user cart", async () => {
      // Arrange
      const userId = "user_123";
      const sessionId = "session_123";
      const userCart = createMockCart({ userId, id: "cart_user" });
      const guestCart = createMockCart({
        sessionId,
        userId: null,
        id: "cart_guest",
      });
      const guestItems = createMockCartItems();

      jest
        .mocked(database.cart.findFirst)
        .mockResolvedValueOnce(userCart)
        .mockResolvedValueOnce(guestCart);
      jest.mocked(database.cartItem.findMany).mockResolvedValue(guestItems);
      jest.mocked(database.cartItem.update).mockResolvedValue({} as CartItem);
      jest.mocked(database.cart.delete).mockResolvedValue(guestCart);
      jest.mocked(database.cart.update).mockResolvedValue(userCart);

      // Act
      await cartService.mergeCarts(userId, sessionId);

      // Assert
      expect(database.cartItem.update).toHaveBeenCalled();
      expect(database.cart.delete).toHaveBeenCalledWith({
        where: { id: guestCart.id },
      });
    });

    it("should handle duplicate items when merging", async () => {
      // Arrange
      const userId = "user_123";
      const sessionId = "session_123";
      const userCart = createMockCart({ userId });
      const guestCart = createMockCart({ sessionId, userId: null });
      const guestItems = createMockCartItems();
      const existingItem = {
        id: "item_existing",
        cartId: userCart.id,
        productId: "prod_1",
        quantity: 2,
      } as CartItem;

      jest
        .mocked(database.cart.findFirst)
        .mockResolvedValueOnce(userCart)
        .mockResolvedValueOnce(guestCart);
      jest.mocked(database.cartItem.findMany).mockResolvedValue(guestItems);
      jest.mocked(database.cartItem.findFirst).mockResolvedValue(existingItem);
      jest.mocked(database.cartItem.update).mockResolvedValue(existingItem);
      jest.mocked(database.cart.delete).mockResolvedValue(guestCart);
      jest.mocked(database.cart.update).mockResolvedValue(userCart);

      // Act
      await cartService.mergeCarts(userId, sessionId);

      // Assert
      expect(database.cartItem.update).toHaveBeenCalledWith({
        where: { id: existingItem.id },
        data: expect.objectContaining({
          quantity: expect.any(Number),
        }),
      });
    });
  });
});
