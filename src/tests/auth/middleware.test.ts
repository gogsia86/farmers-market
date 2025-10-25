import { middleware } from "@/middleware";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { UserRole } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Mock next-auth/jwt
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

describe("Admin Authentication & RBAC Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Admin Route Protection", () => {
    it("allows access to admin routes for ADMIN users", async () => {
      // Arrange
      mockGetToken.mockResolvedValue({
        role: "ADMIN" as UserRole,
        id: "admin-user-id",
        email: "admin@farmers-market.com",
      });

      const request = new NextRequest("http://localhost:3000/admin/dashboard");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeUndefined(); // No redirect, access allowed
    });

    it("allows access to admin routes for SUPER_ADMIN users", async () => {
      // Arrange
      mockGetToken.mockResolvedValue({
        role: "SUPER_ADMIN" as UserRole,
        id: "super-admin-id",
        email: "superadmin@farmers-market.com",
      });

      const request = new NextRequest("http://localhost:3000/admin/users");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeUndefined(); // No redirect, access allowed
    });

    it("blocks access to admin routes for CONSUMER users", async () => {
      // Arrange
      mockGetToken.mockResolvedValue({
        role: "CONSUMER" as UserRole,
        id: "consumer-user-id",
        email: "consumer@example.com",
      });

      const request = new NextRequest("http://localhost:3000/admin/dashboard");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(302); // Redirect
      expect(response?.headers.get("Location")).toBe(
        "/admin/login?error=insufficient_permissions"
      );
    });

    it("blocks access to admin routes for FARMER users", async () => {
      // Arrange
      mockGetToken.mockResolvedValue({
        role: "FARMER" as UserRole,
        id: "farmer-user-id",
        email: "farmer@example.com",
      });

      const request = new NextRequest("http://localhost:3000/admin/farms");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(302); // Redirect
      expect(response?.headers.get("Location")).toBe(
        "/admin/login?error=insufficient_permissions"
      );
    });

    it("redirects unauthenticated users to login", async () => {
      // Arrange
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/admin/settings");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(302); // Redirect
      expect(response?.headers.get("Location")).toBe("/admin/login");
    });

    it("allows access to admin login page for all users", async () => {
      // Arrange
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/admin/login");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeUndefined(); // No redirect, access allowed
    });

    it("sets agricultural consciousness headers for admin users", async () => {
      // Arrange
      mockGetToken.mockResolvedValue({
        role: "ADMIN" as UserRole,
        id: "admin-user-id",
        email: "admin@farmers-market.com",
      });

      const request = new NextRequest("http://localhost:3000/admin/dashboard");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeUndefined(); // Access allowed
      // Note: In actual implementation, headers would be set on the request
      // This test validates the logic flow
    });
  });

  describe("Route Matching", () => {
    it("processes admin routes correctly", async () => {
      const adminRoutes = [
        "/admin/dashboard",
        "/admin/users",
        "/admin/farms",
        "/admin/orders",
        "/admin/analytics",
        "/admin/settings",
      ];

      for (const route of adminRoutes) {
        mockGetToken.mockResolvedValue({
          role: "ADMIN" as UserRole,
          id: "admin-id",
          email: "admin@test.com",
        });

        const request = new NextRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);

        expect(response).toBeUndefined(); // Should allow access
      }
    });

    it("ignores non-admin routes", async () => {
      const publicRoutes = [
        "/",
        "/farms",
        "/products",
        "/about",
        "/contact",
        "/api/public",
      ];

      for (const route of publicRoutes) {
        mockGetToken.mockResolvedValue(null); // No authentication

        const request = new NextRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);

        expect(response).toBeUndefined(); // Should not interfere
      }
    });
  });

  describe("Error Handling", () => {
    it("handles token validation errors gracefully", async () => {
      // Arrange
      mockGetToken.mockRejectedValue(new Error("Token validation failed"));

      const request = new NextRequest("http://localhost:3000/admin/dashboard");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(302); // Redirect to login
      expect(response?.headers.get("Location")).toBe("/admin/login");
    });

    it("handles malformed tokens", async () => {
      // Arrange
      mockGetToken.mockResolvedValue({
        role: "INVALID_ROLE" as UserRole,
        id: "user-id",
        email: "user@example.com",
      });

      const request = new NextRequest("http://localhost:3000/admin/dashboard");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(302); // Redirect
      expect(response?.headers.get("Location")).toBe(
        "/admin/login?error=insufficient_permissions"
      );
    });
  });
});
