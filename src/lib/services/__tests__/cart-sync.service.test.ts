/**
 * 🧪 CART SYNC SERVICE - UNIT TESTS
 * Comprehensive test coverage for server-side cart persistence and sync
 *
 * Test Coverage:
 * - Cart retrieval and item management
 * - Adding items to cart
 * - Updating item quantities
 * - Removing items from cart
 * - Cart clearing
 * - Cart sync/merge on login (all strategies)
 * - Cart validation
 * - Reservation management
 * - Edge cases and error handling
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { CartSyncService, cartSyncService } from "../cart-sync.service";
import { database } from "@/lib/database";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { BusinessLogicError } from "@/lib/errors/BusinessLogicError";

// ============================================================================
// MOCKS
// ============================================================================

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
      aggregate: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  },
}));

const mockDatabase = database as jest.Mocked<typeof database>;

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createMockProduct = (overrides = {}) => ({
  id: "prod_123",
  name: "Fresh Organic Tomatoes",
  description: "Locally grown organic tomatoes",
  price: 4.99,
  farmId: "farm_456",
  category: "VEGETABLES",
  unit: "lb",
  inStock: true,
  quantityAvailable: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
  farm: {
    id: "farm_456",
    name: "Green Valley Farm",
  },
  ...overrides,
});

const createMockCartItem = (overrides = {}) => ({
  id: "cart_item_123",
  userId: "user_789",
  productId: "prod_123",
  farmId: "farm_456",
  quantity: 2,
  reservedUntil: new Date(Date.now() + 30 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
  product: createMockProduct(),
  ...overrides,
});

const createMockCartItemWithProduct = (overrides = {}) => {
  const cartItem = createMockCartItem(overrides);
  return {
    ...cartItem,
    product: {
      ...cartItem.product,
      farm: {
        id: "farm_456",
        name: "Green Valley Farm",
      },
    },
  };
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe("CartSyncService", () => {
  let service: CartSyncService;

  beforeEach(() => {
    service = new CartSyncService();
    jest.clearAllMocks();
  });

  // ========================================
  // CART RETRIEVAL TESTS
  // ========================================

  describe("getCart", () => {
    it("should retrieve cart with items and calculate totals", async () => {
      const userId = "user_789";
      const mockItems = [
        createMockCartItemWithProduct({ quantity: 2 }),
        createMockCartItemWithProduct({
          id: "cart_item_456",
          productId: "prod_456",
          quantity: 3,
          product: createMockProduct({
            id: "prod_456",
            name: "Organic Apples",
            price: 3.99,
          }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );

      const result = await service.getCart(userId);

      expect(result.items).toHaveLength(2);
      expect(result.totals.itemCount).toBe(5); // 2 + 3
      expect(result.totals.subtotal).toBeCloseTo(21.95, 2); // (4.99 * 2) + (3.99 * 3)
      expect(result.totals.tax).toBeCloseTo(1.76, 2); // 8% tax
      expect(mockDatabase.cartItem.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          product: {
            include: {
              farm: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return empty cart when no items exist", async () => {
      const userId = "user_789";

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getCart(userId);

      expect(result.items).toHaveLength(0);
      expect(result.totals.itemCount).toBe(0);
      expect(result.totals.subtotal).toBe(0);
    });

    it("should apply free shipping for orders over $50", async () => {
      const userId = "user_789";
      const mockItems = [
        createMockCartItemWithProduct({
          quantity: 15,
          product: createMockProduct({ price: 5.0 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );

      const result = await service.getCart(userId);

      expect(result.totals.subtotal).toBe(75); // 15 * 5.00
      expect(result.totals.shipping).toBe(0); // Free shipping over $50
    });
  });

  // ========================================
  // ADD ITEM TESTS
  // ========================================

  describe("addItem", () => {
    it("should add a new item to cart", async () => {
      const userId = "user_789";
      const input = { productId: "prod_123", quantity: 2 };
      const mockProduct = createMockProduct();
      const mockCartItem = createMockCartItemWithProduct();

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDatabase.cartItem.create as jest.Mock).mockResolvedValue({
        id: "cart_item_123",
      });
      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(
        mockCartItem,
      );

      const result = await service.addItem(userId, input);

      expect(result).toBeDefined();
      expect(mockDatabase.cartItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          productId: input.productId,
          quantity: input.quantity,
          farmId: mockProduct.farmId,
        }),
      });
    });

    it("should update quantity when item already exists in cart", async () => {
      const userId = "user_789";
      const input = { productId: "prod_123", quantity: 3 };
      const mockProduct = createMockProduct({ quantityAvailable: 100 });
      const existingItem = createMockCartItem({ quantity: 2 });
      const updatedItem = createMockCartItemWithProduct({ quantity: 5 });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue({
        id: "cart_item_123",
      });
      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(
        updatedItem,
      );

      const result = await service.addItem(userId, input);

      expect(result.quantity).toBe(5);
      expect(mockDatabase.cartItem.update).toHaveBeenCalledWith({
        where: { id: existingItem.id },
        data: expect.objectContaining({
          quantity: 5, // 2 + 3
        }),
      });
    });

    it("should throw NotFoundError when product does not exist", async () => {
      const userId = "user_789";
      const input = { productId: "nonexistent_prod", quantity: 1 };

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addItem(userId, input)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should throw BusinessLogicError when insufficient stock", async () => {
      const userId = "user_789";
      const input = { productId: "prod_123", quantity: 100 };
      const mockProduct = createMockProduct({ quantityAvailable: 10 });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      await expect(service.addItem(userId, input)).rejects.toThrow(
        BusinessLogicError,
      );
    });

    it("should throw BusinessLogicError when product is out of stock", async () => {
      const userId = "user_789";
      const input = { productId: "prod_123", quantity: 1 };
      const mockProduct = createMockProduct({ inStock: false });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      await expect(service.addItem(userId, input)).rejects.toThrow(
        BusinessLogicError,
      );
    });

    it("should throw BusinessLogicError when adding more than available with existing cart", async () => {
      const userId = "user_789";
      const input = { productId: "prod_123", quantity: 8 };
      const mockProduct = createMockProduct({ quantityAvailable: 10 });
      const existingItem = createMockCartItem({ quantity: 5 });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(
        existingItem,
      );

      await expect(service.addItem(userId, input)).rejects.toThrow(
        BusinessLogicError,
      );
    });
  });

  // ========================================
  // UPDATE ITEM QUANTITY TESTS
  // ========================================

  describe("updateItemQuantity", () => {
    it("should update item quantity", async () => {
      const userId = "user_789";
      const itemId = "cart_item_123";
      const newQuantity = 5;
      const existingItem = {
        ...createMockCartItemWithProduct(),
        product: createMockProduct({ quantityAvailable: 100 }),
      };
      const updatedItem = createMockCartItemWithProduct({
        quantity: newQuantity,
      });

      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue(
        updatedItem,
      );

      const result = await service.updateItemQuantity(
        userId,
        itemId,
        newQuantity,
      );

      expect(result?.quantity).toBe(newQuantity);
      expect(mockDatabase.cartItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: expect.objectContaining({ quantity: newQuantity }),
        include: expect.any(Object),
      });
    });

    it("should remove item when quantity is less than 1", async () => {
      const userId = "user_789";
      const itemId = "cart_item_123";
      const existingItem = createMockCartItemWithProduct();

      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (mockDatabase.cartItem.delete as jest.Mock).mockResolvedValue(
        existingItem,
      );

      const result = await service.updateItemQuantity(userId, itemId, 0);

      // Returns the deleted item per new API
      expect(result).toBeDefined();
      expect(mockDatabase.cartItem.delete).toHaveBeenCalled();
    });

    it("should throw NotFoundError when item not found", async () => {
      const userId = "user_789";
      const itemId = "nonexistent_item";

      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateItemQuantity(userId, itemId, 5),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw BusinessLogicError when quantity exceeds stock", async () => {
      const userId = "user_789";
      const itemId = "cart_item_123";
      const existingItem = {
        ...createMockCartItemWithProduct(),
        product: createMockProduct({ quantityAvailable: 10 }),
      };

      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(
        existingItem,
      );

      await expect(
        service.updateItemQuantity(userId, itemId, 15),
      ).rejects.toThrow(BusinessLogicError);
    });
  });

  // ========================================
  // REMOVE ITEM TESTS
  // ========================================

  describe("removeItem", () => {
    it("should remove item from cart", async () => {
      const userId = "user_789";
      const itemId = "cart_item_123";
      const existingItem = createMockCartItem();

      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (mockDatabase.cartItem.delete as jest.Mock).mockResolvedValue(
        existingItem,
      );

      await service.removeItem(userId, itemId);

      expect(mockDatabase.cartItem.delete).toHaveBeenCalledWith({
        where: { id: itemId },
      });
    });

    it("should throw NotFoundError when item not found", async () => {
      const userId = "user_789";
      const itemId = "nonexistent_item";

      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.removeItem(userId, itemId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  // ========================================
  // CLEAR CART TESTS
  // ========================================

  describe("clearCart", () => {
    it("should clear all items from cart", async () => {
      const userId = "user_789";

      (mockDatabase.cartItem.deleteMany as jest.Mock).mockResolvedValue({
        count: 5,
      });

      await service.clearCart(userId);

      expect(mockDatabase.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  // ========================================
  // MERGE LOCAL CART TESTS (formerly syncOnLogin)
  // ========================================

  describe("mergeLocalCart", () => {
    describe("sum conflict resolution strategy", () => {
      it("should sum quantities when item exists in both carts", async () => {
        const userId = "user_789";
        const localItems = [{ productId: "prod_123", quantity: 3 }];
        const serverItem = createMockCartItemWithProduct({ quantity: 2 });

        // Mock getCart to return server items
        (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
          serverItem,
        ]);

        // Mock updateItemQuantity path
        (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue({
          ...serverItem,
          product: createMockProduct({ quantityAvailable: 100 }),
        });
        (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue({
          ...serverItem,
          quantity: 5,
        });

        const result = await service.mergeLocalCart(userId, localItems, {
          conflictResolution: "sum",
          clearLocalAfterMerge: true,
        });

        expect(result.conflicts).toBe(1);
        expect(mockDatabase.cartItem.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ quantity: 5 }), // 2 + 3
          }),
        );
      });
    });

    describe("max conflict resolution strategy", () => {
      it("should use max quantity when item exists in both carts", async () => {
        const userId = "user_789";
        const localItems = [{ productId: "prod_123", quantity: 3 }];
        const serverItem = createMockCartItemWithProduct({ quantity: 5 });

        (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
          serverItem,
        ]);
        (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue({
          ...serverItem,
          product: createMockProduct({ quantityAvailable: 100 }),
        });

        const result = await service.mergeLocalCart(userId, localItems, {
          conflictResolution: "max",
          clearLocalAfterMerge: true,
        });

        expect(result.conflicts).toBe(1);
        // Server quantity is higher (5 > 3), so no update needed
        expect(result.mergedItems).toContainEqual(
          expect.objectContaining({ quantity: 5 }),
        );
      });
    });

    describe("local conflict resolution strategy", () => {
      it("should prefer local quantity over server", async () => {
        const userId = "user_789";
        const localItems = [{ productId: "prod_123", quantity: 10 }];
        const serverItem = createMockCartItemWithProduct({ quantity: 5 });

        (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
          serverItem,
        ]);
        (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue({
          ...serverItem,
          product: createMockProduct({ quantityAvailable: 100 }),
        });
        (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue({
          ...serverItem,
          quantity: 10,
        });

        const result = await service.mergeLocalCart(userId, localItems, {
          conflictResolution: "local",
          clearLocalAfterMerge: true,
        });

        expect(result.conflicts).toBe(1);
        expect(mockDatabase.cartItem.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ quantity: 10 }),
          }),
        );
      });
    });

    describe("server conflict resolution strategy", () => {
      it("should prefer server quantity over local", async () => {
        const userId = "user_789";
        const localItems = [{ productId: "prod_123", quantity: 10 }];
        const serverItem = createMockCartItemWithProduct({ quantity: 5 });

        (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
          serverItem,
        ]);

        const result = await service.mergeLocalCart(userId, localItems, {
          conflictResolution: "server",
          clearLocalAfterMerge: true,
        });

        expect(result.conflicts).toBe(1);
        // Server quantity is kept, no update should be called
        expect(mockDatabase.cartItem.update).not.toHaveBeenCalled();
      });
    });

    it("should add items that only exist locally", async () => {
      const userId = "user_789";
      const localItems = [{ productId: "prod_new", quantity: 2 }];
      const mockProduct = createMockProduct({ id: "prod_new" });
      const newCartItem = createMockCartItemWithProduct({
        productId: "prod_new",
        product: mockProduct,
      });

      // Empty server cart - first call returns empty, second call (after adding) returns the new item
      (mockDatabase.cartItem.findMany as jest.Mock)
        .mockResolvedValueOnce([]) // Initial getCart
        .mockResolvedValueOnce([newCartItem]); // getCart after merge

      // Mock addItem path
      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDatabase.cartItem.create as jest.Mock).mockResolvedValue(
        newCartItem,
      );
      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(
        newCartItem,
      );

      const result = await service.mergeLocalCart(userId, localItems);

      expect(result.addedFromLocal).toBe(1);
      expect(result.mergedItems).toHaveLength(1);
    });

    it("should preserve server items that do not exist locally", async () => {
      const userId = "user_789";
      const localItems: Array<{ productId: string; quantity: number }> = [];
      const serverItem = createMockCartItemWithProduct();

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        serverItem,
      ]);

      const result = await service.mergeLocalCart(userId, localItems);

      expect(result.mergedItems).toContainEqual(serverItem);
    });

    it("should handle stock limitations gracefully during merge", async () => {
      const userId = "user_789";
      const localItems = [{ productId: "prod_123", quantity: 3 }];
      const serverItem = createMockCartItemWithProduct({ quantity: 5 });
      const product = createMockProduct({ quantityAvailable: 10 });
      const updatedItem = createMockCartItemWithProduct({ quantity: 8 }); // 5 + 3 = 8, within limit

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([
        serverItem,
      ]);
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue({
        ...serverItem,
        product,
      });
      // Mock successful update when within stock limits
      (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue(
        updatedItem,
      );

      const result = await service.mergeLocalCart(userId, localItems, {
        conflictResolution: "sum",
        clearLocalAfterMerge: true,
      });

      // Should successfully merge items
      expect(result.conflicts).toBe(1);
      expect(result.updatedFromServer).toBe(1);
    });

    it("should skip local items that cannot be added due to stock", async () => {
      const userId = "user_789";
      const localItems = [{ productId: "prod_out_of_stock", quantity: 5 }];
      const outOfStockProduct = createMockProduct({
        id: "prod_out_of_stock",
        inStock: false,
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue([]);
      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        outOfStockProduct,
      );

      const result = await service.mergeLocalCart(userId, localItems);

      expect(result.addedFromLocal).toBe(0);
      expect(result.mergedItems).toHaveLength(0);
    });
  });

  // ========================================
  // CART VALIDATION TESTS (updated return shape)
  // ========================================

  describe("validateCart", () => {
    it("should return valid: true when all items are in stock", async () => {
      const userId = "user_789";
      const mockItems = [
        createMockCartItemWithProduct({
          quantity: 2,
          product: createMockProduct({ quantityAvailable: 50 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );

      const result = await service.validateCart(userId);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should detect out of stock items", async () => {
      const userId = "user_789";
      const mockItems = [
        createMockCartItemWithProduct({
          quantity: 2,
          product: createMockProduct({ inStock: false, quantityAvailable: 0 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );

      const result = await service.validateCart(userId);

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].issue).toBe("out_of_stock");
    });

    it("should detect insufficient stock and auto-adjust quantity", async () => {
      const userId = "user_789";
      const mockItems = [
        createMockCartItemWithProduct({
          id: "cart_123",
          quantity: 20,
          product: createMockProduct({ quantityAvailable: 10 }),
        }),
      ];
      const adjustedItem = createMockCartItemWithProduct({
        quantity: 10,
        product: createMockProduct({ quantityAvailable: 10 }),
      });

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue({
        ...mockItems[0],
        product: createMockProduct({ quantityAvailable: 10 }),
      });
      (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue(
        adjustedItem,
      );

      const result = await service.validateCart(userId);

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].issue).toBe("insufficient_stock");
      expect(result.issues[0].available).toBe(10);
      expect(mockDatabase.cartItem.update).toHaveBeenCalled();
    });

    it("should detect unavailable products", async () => {
      const userId = "user_789";
      const mockItems = [
        {
          ...createMockCartItem(),
          product: null,
        },
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );

      const result = await service.validateCart(userId);

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].issue).toBe("product_unavailable");
    });

    it("should handle multiple issues across items", async () => {
      const userId = "user_789";
      const mockItems = [
        createMockCartItemWithProduct({
          id: "item_1",
          productId: "prod_1",
          product: createMockProduct({ id: "prod_1", inStock: false }),
        }),
        createMockCartItemWithProduct({
          id: "item_2",
          productId: "prod_2",
          quantity: 50,
          product: createMockProduct({ id: "prod_2", quantityAvailable: 10 }),
        }),
        createMockCartItemWithProduct({
          id: "item_3",
          productId: "prod_3",
          product: createMockProduct({ id: "prod_3", quantityAvailable: 100 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );
      (mockDatabase.cartItem.findFirst as jest.Mock).mockResolvedValue({
        ...mockItems[1],
        product: createMockProduct({ id: "prod_2", quantityAvailable: 10 }),
      });
      (mockDatabase.cartItem.update as jest.Mock).mockResolvedValue({
        ...mockItems[1],
        quantity: 10,
      });

      const result = await service.validateCart(userId);

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(2); // out_of_stock and insufficient_stock
    });
  });

  // ========================================
  // RESERVATION MANAGEMENT TESTS (renamed from refreshReservations)
  // ========================================

  describe("extendReservation", () => {
    it("should update reservation expiry for all user cart items", async () => {
      const userId = "user_789";

      (mockDatabase.cartItem.updateMany as jest.Mock).mockResolvedValue({
        count: 3,
      });

      await service.extendReservation(userId);

      expect(mockDatabase.cartItem.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: {
          reservedUntil: expect.any(Date),
        },
      });
    });
  });

  describe("clearExpiredReservations", () => {
    it("should delete cart items with expired reservations", async () => {
      (mockDatabase.cartItem.deleteMany as jest.Mock).mockResolvedValue({
        count: 5,
      });

      const result = await service.clearExpiredReservations();

      expect(result).toBe(5);
      expect(mockDatabase.cartItem.deleteMany).toHaveBeenCalledWith({
        where: {
          reservedUntil: {
            lt: expect.any(Date),
          },
        },
      });
    });

    it("should return 0 when no expired reservations", async () => {
      (mockDatabase.cartItem.deleteMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      const result = await service.clearExpiredReservations();

      expect(result).toBe(0);
    });
  });

  // ========================================
  // CLIENT FORMAT CONVERSION TESTS
  // ========================================

  describe("toClientFormat", () => {
    it("should convert server cart to client-friendly format", () => {
      const serverCart = {
        items: [
          createMockCartItemWithProduct({
            id: "cart_123",
            productId: "prod_123",
            quantity: 2,
            product: {
              ...createMockProduct(),
              images: ["https://example.com/image.jpg"],
            },
          }),
        ],
        totals: {
          subtotal: 9.98,
          tax: 0.8,
          shipping: 5.99,
          total: 16.77,
          itemCount: 2,
        },
        lastUpdated: new Date(),
      };

      const result = service.toClientFormat(serverCart as any);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: "cart_123",
        productId: "prod_123",
        productName: "Fresh Organic Tomatoes",
        productImage: "https://example.com/image.jpg",
        price: 4.99,
        quantity: 2,
        unit: "lb",
        farmId: "farm_456",
        farmName: "Green Valley Farm",
        stock: 50,
      });
      expect(result.totals).toEqual(serverCart.totals);
    });

    it("should handle items without images", () => {
      const serverCart = {
        items: [createMockCartItemWithProduct()],
        totals: {
          subtotal: 9.98,
          tax: 0.8,
          shipping: 5.99,
          total: 16.77,
          itemCount: 2,
        },
        lastUpdated: new Date(),
      };

      const result = service.toClientFormat(serverCart as any);

      expect(result.items[0].productImage).toBe("");
    });
  });

  // ========================================
  // SINGLETON EXPORT TEST
  // ========================================

  describe("singleton export", () => {
    it("should export a singleton instance", () => {
      expect(cartSyncService).toBeInstanceOf(CartSyncService);
    });
  });

  // ========================================
  // EDGE CASES AND ERROR HANDLING
  // ========================================

  describe("edge cases", () => {
    it("should handle database errors gracefully in getCart", async () => {
      const userId = "user_789";

      (mockDatabase.cartItem.findMany as jest.Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(service.getCart(userId)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle concurrent add operations", async () => {
      const userId = "user_789";
      const input = { productId: "prod_123", quantity: 1 };
      const mockProduct = createMockProduct({ quantityAvailable: 10 });

      (mockDatabase.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (mockDatabase.cartItem.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // First check - no existing item
        .mockResolvedValueOnce(createMockCartItem()); // Second check - item created by concurrent request
      (mockDatabase.cartItem.create as jest.Mock).mockResolvedValue(
        createMockCartItem(),
      );
      (mockDatabase.cartItem.findUnique as jest.Mock).mockResolvedValue(
        createMockCartItemWithProduct(),
      );

      // Should still succeed
      const result = await service.addItem(userId, input);
      expect(result).toBeDefined();
    });

    it("should handle very large quantities in totals calculation", async () => {
      const userId = "user_789";
      const mockItems = [
        createMockCartItemWithProduct({
          quantity: 9999,
          product: createMockProduct({
            price: 999.99,
            quantityAvailable: 10000,
          }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );

      const result = await service.getCart(userId);

      expect(result.totals.subtotal).toBeCloseTo(9998900.01, 2);
      expect(result.totals.shipping).toBe(0); // Free shipping
      expect(result.totals.itemCount).toBe(9999);
    });

    it("should handle zero-priced products", async () => {
      const userId = "user_789";
      const mockItems = [
        createMockCartItemWithProduct({
          quantity: 5,
          product: createMockProduct({ price: 0 }),
        }),
      ];

      (mockDatabase.cartItem.findMany as jest.Mock).mockResolvedValue(
        mockItems,
      );

      const result = await service.getCart(userId);

      expect(result.totals.subtotal).toBe(0);
      expect(result.totals.tax).toBe(0);
      expect(result.totals.shipping).toBe(5.99); // Still charges shipping for < $50
    });
  });
});
