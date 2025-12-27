/**
 * Tests for BaseService abstract class
 */

import { BaseService } from "../base.service";
import type { ServiceResponse } from "@/lib/types/service-response";
import { expectSuccess, expectError } from "@/lib/test-utils/service-test-factory";

// Test service implementation
class TestService extends BaseService<{ id: string; name: string }> {
  protected readonly cacheTTL = 300;
  protected readonly cachePrefix = "test";

  async testSuccessResponse(data: any): Promise<ServiceResponse<any>> {
    return this.success(data);
  }

  async testErrorResponse(): Promise<ServiceResponse<any>> {
    return this.error("TEST_ERROR", "Test error message");
  }

  async testNotFoundResponse(): Promise<ServiceResponse<any>> {
    return this.notFound("TestEntity", "123");
  }

  async testCachedOperation(key: string, value: any): Promise<any> {
    return await this.getCached(key, async () => value);
  }

  async testInvalidateCache(pattern: string): Promise<void> {
    await this.invalidateCache(pattern);
  }
}

describe("BaseService", () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  describe("Instantiation", () => {
    it("should create service instance", () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(BaseService);
    });

    it("should initialize with default config", () => {
      expect(service["serviceName"]).toBe("TestService");
      expect(service["cacheTTL"]).toBe(300);
      expect(service["cachePrefix"]).toBe("test");
    });
  });

  describe("Response Builders", () => {
    it("should create success response", async () => {
      const data = { id: "123", name: "Test" };
      const response = await service.testSuccessResponse(data);

      expectSuccess(response);
      expect(response.data).toEqual(data);
      expect(response.meta?.timestamp).toBeDefined();
    });

    it("should create error response", async () => {
      const response = await service.testErrorResponse();

      expectError(response);
      expect(response.error.code).toBe("TEST_ERROR");
      expect(response.error.message).toBe("Test error message");
      expect(response.meta?.timestamp).toBeDefined();
    });

    it("should create not found response", async () => {
      const response = await service.testNotFoundResponse();

      expectError(response);
      expect(response.error.code).toBe("RESOURCE_NOT_FOUND");
      expect(response.error.message).toContain("TestEntity");
      expect(response.error.message).toContain("123");
    });

    it("should create paginated response", () => {
      const items = [{ id: "1" }, { id: "2" }];
      const response = service["paginated"](items, 1, 10, 25);

      expectSuccess(response);
      expect(response.data.items).toEqual(items);
      expect(response.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrevious: false,
        startIndex: 0,
        endIndex: 9,
      });
    });
  });

  describe("Cache Management", () => {
    it("should cache and retrieve values", async () => {
      const key = "test-key";
      const value = { id: "123", name: "Cached" };

      // First call should cache
      const result1 = await service.testCachedOperation(key, value);
      expect(result1).toEqual(value);

      // Second call should retrieve from cache
      const result2 = await service.testCachedOperation(key, {
        id: "999",
        name: "Different",
      });
      expect(result2).toEqual(value); // Should still be original cached value
    });

    it("should use fallback on cache miss", async () => {
      const key = "non-existent";
      const fallback = { id: "456", name: "Fallback" };

      const result = await service.testCachedOperation(key, fallback);
      expect(result).toEqual(fallback);
    });

    it("should invalidate cache by pattern", async () => {
      await service.testCachedOperation("test:1", { id: "1" });
      await service.testCachedOperation("test:2", { id: "2" });

      await service.testInvalidateCache("test:*");

      // After invalidation, should use fallback
      const result = await service.testCachedOperation("test:1", { id: "999" });
      expect(result.id).toBe("999");
    });
  });

  describe("Utility Methods", () => {
    it("should generate unique request IDs", () => {
      const id1 = service["generateRequestId"]();
      const id2 = service["generateRequestId"]();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toContain("testservice");
    });

    it("should measure operation duration", async () => {
      const { result, duration } = await service["measureDuration"](async () => {
        await service["sleep"](10);
        return "completed";
      });

      expect(result).toBe("completed");
      expect(duration).toBeGreaterThanOrEqual(10);
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Agricultural Consciousness", () => {
    it("should return undefined when consciousness disabled", () => {
      const metadata = service["getAgriculturalMetadata"]();
      expect(metadata).toBeUndefined();
    });

    it("should return season metadata when consciousness enabled", () => {
      const serviceWithConsciousness = new TestService({
        enableAgriculturalConsciousness: true,
      });

      const metadata = serviceWithConsciousness["getAgriculturalMetadata"]();
      expect(metadata).toBeDefined();
      expect(metadata?.season).toMatch(/SPRING|SUMMER|FALL|WINTER/);
      expect(metadata?.consciousness).toBe("DIVINE");
    });
  });
});
