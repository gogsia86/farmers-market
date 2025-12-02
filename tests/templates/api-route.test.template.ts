/**
 * API ROUTE TEST TEMPLATE
 *
 * This template provides a comprehensive testing structure for Next.js API routes.
 * Copy this file and customize for your specific endpoint.
 *
 * Usage:
 * 1. Copy this file to your test location
 * 2. Update the imports to match your route
 * 3. Customize test cases for your specific logic
 * 4. Run: npm run test
 */

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "@/app/api/REPLACE_WITH_YOUR_ROUTE/route";

// Mock dependencies
jest.mock("@/lib/database", () => ({
  prisma: {
    // Add your Prisma mocks here
    model: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

import { prisma } from "@/lib/database";
import { auth, requireAuth, requireRole } from "@/lib/auth";

describe("API: /api/YOUR_ENDPOINT", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET ENDPOINT TESTS
  // ============================================
  describe("GET", () => {
    it("returns 200 with valid request", async () => {
      // Mock authentication
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "CONSUMER" },
      });

      // Mock database response
      (prisma.model.findMany as jest.Mock).mockResolvedValue([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      // Create request
      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT");

      // Execute
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
    });

    it("returns 401 when not authenticated", async () => {
      // Mock no authentication
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Unauthorized");
    });

    it("handles query parameters correctly", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "CONSUMER" },
      });

      (prisma.model.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/YOUR_ENDPOINT?limit=10&offset=0&sort=name",
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
          orderBy: { name: "asc" },
        }),
      );
    });

    it("validates query parameters", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "CONSUMER" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/YOUR_ENDPOINT?limit=invalid",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid");
    });

    it("handles database errors gracefully", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "CONSUMER" },
      });

      (prisma.model.findMany as jest.Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Internal server error");
    });

    it("respects role-based access control", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "CONSUMER" },
      });

      (requireRole as jest.Mock).mockRejectedValue(
        new Error("Insufficient permissions"),
      );

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty("error");
    });
  });

  // ============================================
  // POST ENDPOINT TESTS
  // ============================================
  describe("POST", () => {
    it("creates resource successfully", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      const newItem = { id: "new_1", name: "New Item" };
      (prisma.model.create as jest.Mock).mockResolvedValue(newItem);

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT", {
        method: "POST",
        body: JSON.stringify({ name: "New Item" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newItem);
      expect(prisma.model.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: "New Item" }),
      });
    });

    it("validates request body", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT", {
        method: "POST",
        body: JSON.stringify({}), // Empty body
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("validation");
    });

    it("prevents duplicate entries", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      (prisma.model.create as jest.Mock).mockRejectedValue({
        code: "P2002",
        meta: { target: ["name"] },
      });

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT", {
        method: "POST",
        body: JSON.stringify({ name: "Duplicate Item" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("already exists");
    });

    it("sanitizes user input", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      (prisma.model.create as jest.Mock).mockResolvedValue({
        id: "new_1",
        name: "Clean Input",
      });

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT", {
        method: "POST",
        body: JSON.stringify({
          name: '<script>alert("xss")</script>Clean Input',
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.model.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: expect.not.stringContaining("<script>"),
        }),
      });
    });
  });

  // ============================================
  // PUT ENDPOINT TESTS
  // ============================================
  describe("PUT", () => {
    it("updates resource successfully", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      const updatedItem = { id: "item_1", name: "Updated Item" };
      (prisma.model.update as jest.Mock).mockResolvedValue(updatedItem);

      const request = new NextRequest(
        "http://localhost:3000/api/YOUR_ENDPOINT/item_1",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Updated Item" }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await PUT(request, { params: { id: "item_1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedItem);
    });

    it("returns 404 for non-existent resource", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      (prisma.model.update as jest.Mock).mockRejectedValue({
        code: "P2025",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/YOUR_ENDPOINT/nonexistent",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Updated Item" }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await PUT(request, { params: { id: "nonexistent" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty("error");
    });

    it("prevents unauthorized updates", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_2", email: "other@example.com", role: "FARMER" },
      });

      (prisma.model.findUnique as jest.Mock).mockResolvedValue({
        id: "item_1",
        userId: "user_1", // Different user
      });

      const request = new NextRequest(
        "http://localhost:3000/api/YOUR_ENDPOINT/item_1",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Updated Item" }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await PUT(request, { params: { id: "item_1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty("error");
    });
  });

  // ============================================
  // DELETE ENDPOINT TESTS
  // ============================================
  describe("DELETE", () => {
    it("deletes resource successfully", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "ADMIN" },
      });

      (prisma.model.delete as jest.Mock).mockResolvedValue({
        id: "item_1",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/YOUR_ENDPOINT/item_1",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request, { params: { id: "item_1" } });

      expect(response.status).toBe(204);
      expect(prisma.model.delete).toHaveBeenCalledWith({
        where: { id: "item_1" },
      });
    });

    it("returns 404 for non-existent resource", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "ADMIN" },
      });

      (prisma.model.delete as jest.Mock).mockRejectedValue({
        code: "P2025",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/YOUR_ENDPOINT/nonexistent",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request, { params: { id: "nonexistent" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty("error");
    });

    it("requires admin role for deletion", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "CONSUMER" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/YOUR_ENDPOINT/item_1",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request, { params: { id: "item_1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty("error");
    });
  });

  // ============================================
  // EDGE CASES & ERROR HANDLING
  // ============================================
  describe("Edge Cases", () => {
    it("handles malformed JSON", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT", {
        method: "POST",
        body: "invalid json",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    it("handles missing Content-Type header", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await POST(request);

      // Should still work or return appropriate error
      expect([200, 201, 400, 415]).toContain(response.status);
    });

    it("handles very large payloads", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "FARMER" },
      });

      const largePayload = {
        name: "A".repeat(10000),
        description: "B".repeat(50000),
      };

      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT", {
        method: "POST",
        body: JSON.stringify(largePayload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);

      // Should reject or handle appropriately
      expect(response.status).toBeLessThan(500);
    });

    it("handles concurrent requests", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "CONSUMER" },
      });

      (prisma.model.findMany as jest.Mock).mockResolvedValue([]);

      const requests = Array(10)
        .fill(null)
        .map(() =>
          GET(new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT")),
        );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  // ============================================
  // PERFORMANCE TESTS
  // ============================================
  describe("Performance", () => {
    it("responds within acceptable time", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: "user_1", email: "test@example.com", role: "CONSUMER" },
      });

      (prisma.model.findMany as jest.Mock).mockResolvedValue([]);

      const start = Date.now();
      const request = new NextRequest("http://localhost:3000/api/YOUR_ENDPOINT");
      await GET(request);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // 1 second max
    });
  });
});
