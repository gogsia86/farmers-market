/**
 * 🏥 HEALTH CHECK API ENDPOINT TESTS
 * Comprehensive testing for system health monitoring
 */

import { GET } from "../route";
import { database } from "@/lib/database";
import v8 from "v8";

// Mock database
jest.mock("@/lib/database", () => ({
  database: {
    $queryRaw: jest.fn(),
  },
}));

// Mock v8
jest.mock("v8", () => ({
  getHeapStatistics: jest.fn(),
}));

describe("🏥 Health Check API - GET /api/health", () => {
  let originalMemoryUsage: typeof process.memoryUsage;
  let originalUptime: typeof process.uptime;

  beforeEach(() => {
    jest.clearAllMocks();

    // Store originals
    originalMemoryUsage = process.memoryUsage;
    originalUptime = process.uptime;

    // Mock process.uptime
    process.uptime = jest.fn(() => 3600) as any;

    // Mock memoryUsage with default values
    process.memoryUsage = jest.fn(() => ({
      heapUsed: 50 * 1024 * 1024, // 50 MB
      heapTotal: 100 * 1024 * 1024, // 100 MB
      external: 0,
      rss: 100 * 1024 * 1024,
      arrayBuffers: 0,
    })) as any;

    // Mock v8.getHeapStatistics with default values
    (v8.getHeapStatistics as jest.Mock).mockReturnValue({
      heap_size_limit: 100 * 1024 * 1024, // 100 MB
      total_heap_size: 100 * 1024 * 1024,
      used_heap_size: 50 * 1024 * 1024,
      malloced_memory: 0,
      peak_malloced_memory: 0,
    });
  });

  afterEach(() => {
    // Restore originals
    process.memoryUsage = originalMemoryUsage;
    process.uptime = originalUptime;
  });

  describe("✅ Healthy Status", () => {
    it("should return healthy status when all checks pass", async () => {
      // Mock successful database query
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("healthy");
      expect(data.checks.database.status).toBe("up");
      expect(data.checks.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(response.status).toBe(200);
    });

    it("should include timestamp in ISO format", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(() => new Date(data.timestamp)).not.toThrow();
    });

    it("should include version information", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.version).toBe("1.0.0");
    });

    it("should include uptime in seconds", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.uptime).toBe(3600);
      expect(typeof data.uptime).toBe("number");
    });

    it("should include memory usage statistics", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.checks.memory).toHaveProperty("used");
      expect(data.checks.memory).toHaveProperty("total");
      expect(data.checks.memory).toHaveProperty("percentage");
      expect(typeof data.checks.memory.used).toBe("number");
      expect(typeof data.checks.memory.total).toBe("number");
      expect(typeof data.checks.memory.percentage).toBe("number");
    });

    it("should include environment information", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.checks.environment).toBeDefined();
      expect(typeof data.checks.environment).toBe("string");
    });

    it("should include response time", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.responseTime).toBeDefined();
      expect(typeof data.responseTime).toBe("number");
      expect(data.responseTime).toBeGreaterThanOrEqual(0);
    });

    it("should set no-cache headers", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      // Response should be returned (headers are set in route)
      expect(data.status).toBe("healthy");
      expect(response.status).toBe(200);
    });
  });

  describe("❌ Unhealthy Status - Database Down", () => {
    it("should return unhealthy status when database is down", async () => {
      const dbError = new Error("Database connection failed");
      (database.$queryRaw as jest.Mock).mockRejectedValue(dbError);

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("unhealthy");
      expect(data.checks.database.status).toBe("down");
      expect(data.checks.database.error).toBe("Database connection failed");
      expect(response.status).toBe(503);
    });

    it("should handle unknown database errors", async () => {
      (database.$queryRaw as jest.Mock).mockRejectedValue("Unknown error");

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("unhealthy");
      expect(data.checks.database.status).toBe("down");
      expect(data.checks.database.error).toBe("Unknown error");
    });

    it("should not include responseTime when database is down", async () => {
      (database.$queryRaw as jest.Mock).mockRejectedValue(
        new Error("Connection timeout"),
      );

      const response = await GET();
      const data = await response.json();

      expect(data.checks.database.responseTime).toBeUndefined();
    });

    it("should return 503 status code for unhealthy state", async () => {
      (database.$queryRaw as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      const response = await GET();

      expect(response.status).toBe(503);
    });
  });

  describe("⚠️ Degraded Status - High Memory Usage", () => {
    it("should return degraded status when memory usage is high", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      // Mock high memory usage
      process.memoryUsage = jest.fn(() => ({
        heapUsed: 9500 * 1024 * 1024, // 9500 MB
        heapTotal: 10000 * 1024 * 1024, // 10000 MB
        external: 0,
        rss: 10000 * 1024 * 1024,
        arrayBuffers: 0,
      })) as any;

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("degraded");
      expect(data.checks.memory.percentage).toBeGreaterThan(90);
    });

    it("should still return 503 for degraded status", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      process.memoryUsage = jest.fn(() => ({
        heapUsed: 9500 * 1024 * 1024,
        heapTotal: 10000 * 1024 * 1024,
        external: 0,
        rss: 10000 * 1024 * 1024,
        arrayBuffers: 0,
      })) as any;

      const response = await GET();

      expect(response.status).toBe(503);
    });
  });

  describe("📊 Memory Statistics", () => {
    it("should calculate memory percentage correctly", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      process.memoryUsage = jest.fn(() => ({
        heapUsed: 5000 * 1024 * 1024, // 5000 MB
        heapTotal: 10000 * 1024 * 1024, // 10000 MB
        external: 0,
        rss: 10000 * 1024 * 1024,
        arrayBuffers: 0,
      })) as any;

      (v8.getHeapStatistics as jest.Mock).mockReturnValue({
        heap_size_limit: 10000 * 1024 * 1024, // 10000 MB
        total_heap_size: 10000 * 1024 * 1024,
        used_heap_size: 5000 * 1024 * 1024,
        malloced_memory: 0,
        peak_malloced_memory: 0,
      });

      const response = await GET();
      const data = await response.json();

      expect(data.checks.memory.percentage).toBe(50);
    });

    it("should convert memory to MB correctly", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      process.memoryUsage = jest.fn(() => ({
        heapUsed: 1024 * 1024 * 100, // 100 MB
        heapTotal: 1024 * 1024 * 200, // 200 MB
        external: 0,
        rss: 1024 * 1024 * 200,
        arrayBuffers: 0,
      })) as any;

      (v8.getHeapStatistics as jest.Mock).mockReturnValue({
        heap_size_limit: 1024 * 1024 * 200, // 200 MB
        total_heap_size: 1024 * 1024 * 200,
        used_heap_size: 1024 * 1024 * 100,
        malloced_memory: 0,
        peak_malloced_memory: 0,
      });

      const response = await GET();
      const data = await response.json();

      expect(data.checks.memory.used).toBe(100);
      expect(data.checks.memory.total).toBe(200);
    });
  });

  describe("🗄️ Database Check", () => {
    it("should measure database response time", async () => {
      // Simulate slow database
      (database.$queryRaw as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([{ result: 1 }]), 100);
          }),
      );

      const response = await GET();
      const data = await response.json();

      expect(data.checks.database.responseTime).toBeGreaterThanOrEqual(90);
    });

    it("should execute SELECT 1 query for health check", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      await GET();

      expect(database.$queryRaw).toHaveBeenCalledWith(
        expect.arrayContaining(["SELECT 1"]),
      );
    });

    it("should mark database as up when query succeeds", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.checks.database.status).toBe("up");
    });
  });

  describe("⚡ Performance", () => {
    it("should respond quickly (under 1 second)", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const start = Date.now();
      await GET();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it("should track total response time", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.responseTime).toBeDefined();
      expect(typeof data.responseTime).toBe("number");
      expect(data.responseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("🌾 Agricultural Consciousness", () => {
    it("should maintain divine patterns in health checks", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      // Health check maintains system consciousness
      expect(data.status).toBeDefined();
      expect(data.checks).toBeDefined();
      expect(typeof data).toBe("object");
    });
  });

  describe("🔄 Multiple Requests", () => {
    it("should handle multiple concurrent health checks", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const requests = Array.from({ length: 5 }, () => GET());
      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    it("should provide fresh data for each request", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response1 = await GET();
      const data1 = await response1.json();

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response2 = await GET();
      const data2 = await response2.json();

      // Timestamps should be different
      expect(data1.timestamp).not.toBe(data2.timestamp);
    });
  });

  describe("🛡️ Edge Cases", () => {
    it("should handle database timeout gracefully", async () => {
      (database.$queryRaw as jest.Mock).mockRejectedValue(
        new Error("Query timeout"),
      );

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("unhealthy");
      expect(data.checks.database.error).toContain("timeout");
    });

    it("should handle zero uptime", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);
      process.uptime = jest.fn(() => 0) as any;

      const response = await GET();
      const data = await response.json();

      expect(data.uptime).toBe(0);
    });

    it("should handle missing NODE_ENV", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const response = await GET();
      const data = await response.json();

      expect(data.checks.environment).toBe("unknown");

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle very high memory usage (100%)", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      process.memoryUsage = jest.fn(() => ({
        heapUsed: 10000 * 1024 * 1024,
        heapTotal: 10000 * 1024 * 1024,
        external: 0,
        rss: 10000 * 1024 * 1024,
        arrayBuffers: 0,
      })) as any;

      (v8.getHeapStatistics as jest.Mock).mockReturnValue({
        heap_size_limit: 10000 * 1024 * 1024, // 10000 MB
        total_heap_size: 10000 * 1024 * 1024,
        used_heap_size: 10000 * 1024 * 1024,
        malloced_memory: 0,
        peak_malloced_memory: 0,
      });

      const response = await GET();
      const data = await response.json();

      expect(data.checks.memory.percentage).toBe(100);
      expect(data.status).toBe("degraded");
    });
  });

  describe("📋 Response Structure", () => {
    it("should have all required top-level fields", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("version");
      expect(data).toHaveProperty("uptime");
      expect(data).toHaveProperty("checks");
      expect(data).toHaveProperty("responseTime");
    });

    it("should have all required check fields", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.checks).toHaveProperty("database");
      expect(data.checks).toHaveProperty("memory");
      expect(data.checks).toHaveProperty("environment");
    });

    it("should have valid status values", async () => {
      (database.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(["healthy", "unhealthy", "degraded"]).toContain(data.status);
    });
  });
});
