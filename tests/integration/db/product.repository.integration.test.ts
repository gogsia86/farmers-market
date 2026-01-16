/**
 * 🧪 PRODUCT REPOSITORY INTEGRATION TESTS
 *
 * True integration tests that run against a real PostgreSQL database.
 * Tests actual Prisma operations, database constraints, and data persistence.
 *
 * @pattern True Integration Testing with Testcontainers
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { PrismaClient, ProductCategory, ProductStatus } from "@prisma/client";
import {
  getTestPrismaClient,
  cleanTestDatabase,
} from "../setup/testcontainers";
import { TEST_IDS, seedMinimalTestData } from "../fixtures/seed";

// Test database client
let prisma: PrismaClient;

describe("🔗 Product Repository Integration Tests", () => {
  beforeAll(async () => {
    // Get the test Prisma client (connected to testcontainer)
    prisma = await getTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean and reseed before each test for isolation
    await cleanTestDatabase();
    await seedMinimalTestData(prisma);
  });

  afterAll(async () => {
    // Cleanup handled by global teardown
  });

  describe("📦 Product Creation", () => {
    it("should create a product with all fields in the database", async () => {
      // Arrange
      const productData = {
        name: "Integration Test Apples",
        slug: `integration-test-apples-${Date.now()}`,
        description: "Fresh organic apples for integration testing",
        farmId: TEST_IDS.FARM_1,
        category: "FRUITS" as ProductCategory,
        price: 5.99,
        unit: "lb",
        quantityAvailable: 150,
        inStock: true,
        organic: true,
        seasonal: true,
      };

      // Act
      const createdProduct = await prisma.product.create({
        data: productData,
        include: {
          farm: true,
        },
      });

      // Assert - Verify product was created
      expect(createdProduct).toBeDefined();
      expect(createdProduct.id).toBeDefined();
      expect(createdProduct.name).toBe(productData.name);
      expect(createdProduct.slug).toBe(productData.slug);
      expect(createdProduct.price.toString()).toBe(
        productData.price.toString(),
      );
      expect(createdProduct.category).toBe("FRUITS");
      expect(createdProduct.organic).toBe(true);

      // Assert - Verify relationship
      expect(createdProduct.farm).toBeDefined();
      expect(createdProduct.farm.id).toBe(TEST_IDS.FARM_1);

      // Assert - Verify data persisted to database
      const retrievedProduct = await prisma.product.findUnique({
        where: { id: createdProduct.id },
      });

      expect(retrievedProduct).not.toBeNull();
      expect(retrievedProduct?.name).toBe(productData.name);
    });

    it("should enforce unique slug constraint", async () => {
      // Arrange - Create first product
      const slug = `unique-slug-test-${Date.now()}`;
      await prisma.product.create({
        data: {
          name: "First Product",
          slug,
          farmId: TEST_IDS.FARM_1,
          category: ProductCategory.VEGETABLES,
          price: 4.99,
          unit: "lb",
          quantityAvailable: 50,
          inStock: true,
          status: ProductStatus.ACTIVE,
        },
      });

      // Act & Assert - Creating with same slug should fail
      await expect(
        prisma.product.create({
          data: {
            name: "Second Product",
            slug, // Same slug
            farmId: TEST_IDS.FARM_1,
            category: ProductCategory.VEGETABLES,
            price: 3.99,
            unit: "lb",
            quantityAvailable: 30,
            inStock: true,
            status: ProductStatus.ACTIVE,
          },
        }),
      ).rejects.toThrow();
    });

    it("should enforce foreign key constraint for farm", async () => {
      // Arrange
      const invalidFarmId = "non-existent-farm-id-12345";

      // Act & Assert
      await expect(
        prisma.product.create({
          data: {
            name: "Invalid Farm Product",
            slug: `invalid-farm-product-${Date.now()}`,
            farmId: invalidFarmId,
            category: "VEGETABLES",
            price: 4.99,
            unit: "lb",
            quantityAvailable: 50,
            inStock: true,
            status: "ACTIVE",
          },
        }),
      ).rejects.toThrow();
    });

    it("should set default values correctly", async () => {
      // Act
      const product = await prisma.product.create({
        data: {
          name: "Default Values Test",
          slug: `default-values-test-${Date.now()}`,
          farmId: TEST_IDS.FARM_1,
          category: "VEGETABLES",
          price: 4.99,
          unit: "lb",
          quantityAvailable: 50,
          inStock: true,
          status: "ACTIVE",
        },
      });

      // Assert
      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
      expect(product.id).toBeDefined();
    });
  });

  describe("📖 Product Retrieval", () => {
    it("should find product by ID with farm relationship", async () => {
      // Act
      const product = await prisma.product.findUnique({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
        include: {
          farm: {
            include: {
              owner: true,
            },
          },
        },
      });

      // Assert
      expect(product).not.toBeNull();
      expect(product?.name).toBe("Test Organic Tomatoes");
      expect(product?.farm).toBeDefined();
      expect(product?.farm.name).toBe("Integration Test Farm Alpha");
      expect(product?.farm.owner).toBeDefined();
    });

    it("should find product by slug", async () => {
      // Act - Use composite key (farmId + slug)
      const product = await prisma.product.findUnique({
        where: {
          farmId_slug: {
            farmId: TEST_IDS.FARM_1,
            slug: "test-organic-tomatoes",
          },
        },
      });

      // Assert
      expect(product).not.toBeNull();
      expect(product?.id).toBe(TEST_IDS.PRODUCT_TOMATOES);
    });

    it("should find products by farm ID", async () => {
      // Act
      const products = await prisma.product.findMany({
        where: { farmId: TEST_IDS.FARM_1 },
        orderBy: { name: "asc" },
      });

      // Assert
      expect(products.length).toBeGreaterThanOrEqual(3);
      products.forEach((product) => {
        expect(product.farmId).toBe(TEST_IDS.FARM_1);
      });
    });

    it("should find products by category", async () => {
      // Act
      const vegetables = await prisma.product.findMany({
        where: { category: ProductCategory.VEGETABLES },
      });

      const dairy = await prisma.product.findMany({
        where: { category: "DAIRY" },
      });

      // Assert
      expect(vegetables.length).toBeGreaterThanOrEqual(3);
      vegetables.forEach((product) => {
        expect(product.category).toBe(ProductCategory.VEGETABLES);
      });

      expect(dairy.length).toBeGreaterThanOrEqual(1);
      dairy.forEach((product) => {
        expect(product.category).toBe("DAIRY");
      });
    });

    it("should find in-stock products only", async () => {
      // Act
      const inStockProducts = await prisma.product.findMany({
        where: { inStock: true },
      });

      const outOfStockProducts = await prisma.product.findMany({
        where: { inStock: false },
      });

      // Assert
      expect(inStockProducts.length).toBeGreaterThanOrEqual(5);
      inStockProducts.forEach((product) => {
        expect(product.inStock).toBe(true);
      });

      expect(outOfStockProducts.length).toBeGreaterThanOrEqual(1);
      outOfStockProducts.forEach((product) => {
        expect(product.inStock).toBe(false);
      });
    });

    it("should find organic products", async () => {
      // Act
      const organicProducts = await prisma.product.findMany({
        where: { organic: true },
      });

      // Assert
      expect(organicProducts.length).toBeGreaterThanOrEqual(1);
      organicProducts.forEach((product) => {
        expect(product.organic).toBe(true);
      });
    });

    it("should return null for non-existent product ID", async () => {
      // Act
      const product = await prisma.product.findUnique({
        where: { id: "non-existent-product-id-12345" },
      });

      // Assert
      expect(product).toBeNull();
    });
  });

  describe("🔍 Product Search & Filtering", () => {
    it("should search products by name (case-insensitive)", async () => {
      // Act
      const products = await prisma.product.findMany({
        where: {
          name: {
            contains: "tomato",
            mode: "insensitive",
          },
        },
      });

      // Assert
      expect(products.length).toBeGreaterThanOrEqual(1);
      products.forEach((product) => {
        expect(product.name.toLowerCase()).toContain("tomato");
      });
    });

    it("should filter products by price range", async () => {
      // Act
      const affordableProducts = await prisma.product.findMany({
        where: {
          price: {
            gte: 2.0,
            lte: 5.0,
          },
        },
        orderBy: { price: "asc" },
      });

      // Assert
      expect(affordableProducts.length).toBeGreaterThanOrEqual(1);
      affordableProducts.forEach((product) => {
        const priceNum = parseFloat(product.price.toString());
        expect(priceNum).toBeGreaterThanOrEqual(2.0);
        expect(priceNum).toBeLessThanOrEqual(5.0);
      });
    });

    it("should apply multiple filters", async () => {
      // Act
      const filteredProducts = await prisma.product.findMany({
        where: {
          category: ProductCategory.VEGETABLES,
          inStock: true,
          organic: true,
          price: {
            lte: 10.0,
          },
        },
      });

      // Assert
      filteredProducts.forEach((product) => {
        expect(product.category).toBe(ProductCategory.VEGETABLES);
        expect(product.inStock).toBe(true);
        expect(product.organic).toBe(true);
        const priceNum = parseFloat(product.price.toString());
        expect(priceNum).toBeLessThanOrEqual(10.0);
      });
    });

    it("should sort products by price ascending", async () => {
      // Act
      const products = await prisma.product.findMany({
        where: { farmId: TEST_IDS.FARM_1 },
        orderBy: { price: "asc" },
      });

      // Assert
      for (let i = 1; i < products.length; i++) {
        const currentPrice = parseFloat(products[i].price.toString());
        const prevPrice = parseFloat(products[i - 1].price.toString());
        expect(currentPrice).toBeGreaterThanOrEqual(prevPrice);
      }
    });

    it("should sort products by price descending", async () => {
      // Act
      const products = await prisma.product.findMany({
        where: { farmId: TEST_IDS.FARM_1 },
        orderBy: { price: "desc" },
      });

      // Assert
      for (let i = 1; i < products.length; i++) {
        const currentPrice = parseFloat(products[i].price.toString());
        const prevPrice = parseFloat(products[i - 1].price.toString());
        expect(currentPrice).toBeLessThanOrEqual(prevPrice);
      }
    });

    it("should paginate products correctly", async () => {
      // Act
      const page1 = await prisma.product.findMany({
        take: 2,
        skip: 0,
        orderBy: { createdAt: "desc" },
      });

      const page2 = await prisma.product.findMany({
        take: 2,
        skip: 2,
        orderBy: { createdAt: "desc" },
      });

      // Assert
      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);

      // Ensure no overlap
      const page1Ids = new Set(page1.map((p) => p.id));
      page2.forEach((p) => {
        expect(page1Ids.has(p.id)).toBe(false);
      });
    });
  });

  describe("📝 Product Updates", () => {
    it("should update product price", async () => {
      // Arrange
      const newPrice = 6.99;

      // Act
      const updatedProduct = await prisma.product.update({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
        data: { price: newPrice },
      });

      // Assert
      expect(updatedProduct.price.toString()).toBe("6.99");

      // Verify persistence
      const retrieved = await prisma.product.findUnique({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
      });
      expect(retrieved?.price.toString()).toBe(newPrice.toString());
    });

    it("should update product stock", async () => {
      // Act
      const updatedProduct = await prisma.product.update({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
        data: {
          quantityAvailable: 200,
          inStock: true,
        },
      });

      // Assert
      expect(updatedProduct.quantityAvailable?.toString()).toBe("200");
      expect(updatedProduct.inStock).toBe(true);
    });

    it("should mark product as out of stock", async () => {
      // Act
      const updatedProduct = await prisma.product.update({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
        data: {
          quantityAvailable: 0,
          inStock: false,
        },
      });

      // Assert
      expect(updatedProduct.quantityAvailable?.toString()).toBe("0");
      expect(updatedProduct.inStock).toBe(false);
    });

    it("should update multiple fields atomically", async () => {
      // Act
      const updatedProduct = await prisma.product.update({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
        data: {
          name: "Premium Organic Tomatoes",
          price: 7.99,
          description: "Updated description for integration test",
        },
      });

      // Assert
      expect(updatedProduct.name).toBe("Premium Organic Tomatoes");
      expect(updatedProduct.price.toString()).toBe("7.99");
      expect(updatedProduct.description).toBe(
        "Updated description for integration test",
      );
    });

    it("should update updatedAt timestamp on modification", async () => {
      // Arrange
      const originalProduct = await prisma.product.findUnique({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
      });

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Act
      const updatedProduct = await prisma.product.update({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
        data: { price: 5.49 },
      });

      // Assert
      expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(
        originalProduct!.updatedAt.getTime(),
      );
    });

    it("should throw error when updating non-existent product", async () => {
      // Act & Assert
      await expect(
        prisma.product.update({
          where: { id: "non-existent-product-id" },
          data: { price: 9.99 },
        }),
      ).rejects.toThrow();
    });
  });

  describe("🗑️ Product Deletion", () => {
    it("should delete product from database", async () => {
      // Arrange - Create a product to delete
      const productToDelete = await prisma.product.create({
        data: {
          name: "Product To Delete",
          slug: `product-to-delete-${Date.now()}`,
          farmId: TEST_IDS.FARM_1,
          category: ProductCategory.VEGETABLES,
          price: 3.49,
          unit: "lb",
          quantityAvailable: 50,
          inStock: true,
          status: ProductStatus.ARCHIVED,
        },
      });

      // Act
      await prisma.product.delete({
        where: { id: productToDelete.id },
      });

      // Assert
      const deletedProduct = await prisma.product.findUnique({
        where: { id: productToDelete.id },
      });
      expect(deletedProduct).toBeNull();
    });

    it("should throw error when deleting non-existent product", async () => {
      // Act & Assert
      await expect(
        prisma.product.delete({
          where: { id: "non-existent-product-id" },
        }),
      ).rejects.toThrow();
    });

    it("should soft delete product by updating status", async () => {
      // Act
      const softDeletedProduct = await prisma.product.update({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
        data: {
          status: ProductStatus.ARCHIVED,
          inStock: false,
        },
      });

      // Assert
      expect(softDeletedProduct.status).toBe(ProductStatus.ARCHIVED);
      expect(softDeletedProduct.inStock).toBe(false);

      // Product still exists in database
      const retrieved = await prisma.product.findUnique({
        where: { id: TEST_IDS.PRODUCT_TOMATOES },
      });
      expect(retrieved).not.toBeNull();
    });
  });

  describe("📊 Product Aggregations", () => {
    it("should count products by category", async () => {
      // Act
      const vegetableCount = await prisma.product.count({
        where: { category: ProductCategory.VEGETABLES },
      });

      const dairyCount = await prisma.product.count({
        where: { category: ProductCategory.DAIRY },
      });

      // Assert
      expect(vegetableCount).toBeGreaterThanOrEqual(3);
      expect(dairyCount).toBeGreaterThanOrEqual(1);
    });

    it("should count products by farm", async () => {
      // Act
      const farm1Count = await prisma.product.count({
        where: { farmId: TEST_IDS.FARM_1 },
      });

      const farm2Count = await prisma.product.count({
        where: { farmId: TEST_IDS.FARM_2 },
      });

      // Assert
      expect(farm1Count).toBeGreaterThanOrEqual(3);
      expect(farm2Count).toBeGreaterThanOrEqual(2);
    });

    it("should aggregate product prices", async () => {
      // Act
      const aggregation = await prisma.product.aggregate({
        where: {
          farmId: TEST_IDS.FARM_1,
          inStock: true,
        },
        _avg: {
          price: true,
        },
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
        _sum: {
          quantityAvailable: true,
        },
        _count: true,
      });

      // Assert
      expect(aggregation._count).toBeGreaterThanOrEqual(1);
      const avgPrice = parseFloat(aggregation._avg.price?.toString() || "0");
      const minPrice = parseFloat(aggregation._min.price?.toString() || "0");
      const maxPrice = parseFloat(aggregation._max.price?.toString() || "0");
      expect(avgPrice).toBeGreaterThan(0);
      expect(minPrice).toBeLessThanOrEqual(maxPrice);
    });

    it("should group products by category", async () => {
      // Act
      const groupedProducts = await prisma.product.groupBy({
        by: ["category"],
        _count: {
          id: true,
        },
        _avg: {
          price: true,
        },
      });

      // Assert
      expect(groupedProducts.length).toBeGreaterThanOrEqual(1);
      groupedProducts.forEach((group) => {
        expect(group.category).toBeDefined();
        expect(group._count.id).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("🔒 Transaction Support", () => {
    it("should create product and update farm in a transaction", async () => {
      // Act
      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: "Transaction Test Product",
            slug: `transaction-test-product-${Date.now()}`,
            farmId: TEST_IDS.FARM_1,
            category: ProductCategory.VEGETABLES,
            price: 2.99,
            unit: "lb",
            quantityAvailable: 100,
            inStock: true,
            status: ProductStatus.ACTIVE,
          },
        });

        // Verify farm exists
        const farm = await tx.farm.findUnique({
          where: { id: TEST_IDS.FARM_1 },
        });

        return { product, farm };
      });

      // Assert
      expect(result.product.id).toBeDefined();
      expect(result.farm).toBeDefined();

      // Verify persistence
      const product = await prisma.product.findUnique({
        where: { id: result.product.id },
      });
      expect(product).not.toBeNull();
    });

    it("should rollback transaction on error", async () => {
      // Arrange
      const productSlug = `rollback-test-${Date.now()}`;

      // Act
      try {
        await prisma.$transaction(async (tx) => {
          await tx.product.create({
            data: {
              name: "Rollback Test Product",
              slug: productSlug,
              farmId: TEST_IDS.FARM_1,
              category: ProductCategory.VEGETABLES,
              price: 4.99,
              unit: "lb",
              quantityAvailable: 50,
              inStock: true,
              status: ProductStatus.ACTIVE,
            },
          });

          // Force an error
          throw new Error("Intentional rollback for testing");
        });
      } catch (error) {
        // Expected
      }

      // Assert - Product should not exist due to rollback
      const product = await prisma.product.findFirst({
        where: { slug: productSlug },
      });
      expect(product).toBeNull();
    });
  });

  describe("⚡ Performance Tests", () => {
    it("should handle bulk product creation efficiently", async () => {
      // Arrange
      const productCount = 100;
      const products = Array.from({ length: productCount }, (_, i) => ({
        name: `Bulk Product ${i}`,
        slug: `bulk-product-${Date.now()}-${i}`,
        farmId: TEST_IDS.FARM_1,
        category: ProductCategory.VEGETABLES,
        price: Math.random() * 20 + 1,
        unit: "lb",
        quantityAvailable: Math.floor(Math.random() * 100) + 10,
        inStock: true,
        status: ProductStatus.ACTIVE,
      }));

      // Act
      const startTime = performance.now();
      await prisma.product.createMany({
        data: products,
      });
      const duration = performance.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(10000); // Should complete in < 10 seconds

      const count = await prisma.product.count({
        where: {
          slug: {
            startsWith: "bulk-product-",
          },
        },
      });
      expect(count).toBe(productCount);
    });

    it("should efficiently query with complex filters", async () => {
      // Act
      const startTime = performance.now();

      const products = await prisma.product.findMany({
        where: {
          inStock: true,
          price: {
            gte: 1.0,
            lte: 20.0,
          },
          farm: {
            status: "ACTIVE",
          },
        },
        include: {
          farm: true,
        },
        orderBy: {
          price: "asc",
        },
        take: 20,
      });

      const duration = performance.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
      expect(products.length).toBeLessThanOrEqual(20);
    });
  });

  describe("🌾 Agricultural Consciousness Tests", () => {
    it("should correctly categorize products", async () => {
      // Arrange
      const categories: ProductCategory[] = [
        "VEGETABLES",
        "FRUITS",
        "DAIRY",
        "MEAT",
        "PANTRY",
      ];

      // Act & Assert
      for (const category of categories) {
        const products = await prisma.product.findMany({
          where: { category },
        });

        products.forEach((product) => {
          expect(product.category).toBe(category);
        });
      }
    });

    it("should track organic products accurately", async () => {
      // Act
      const organicProducts = await prisma.product.findMany({
        where: { organic: true },
      });

      const nonOrganicProducts = await prisma.product.findMany({
        where: { organic: false },
      });

      // Assert
      organicProducts.forEach((product) => {
        expect(product.organic).toBe(true);
      });

      nonOrganicProducts.forEach((product) => {
        expect(product.organic).toBe(false);
      });
    });
  });
});
