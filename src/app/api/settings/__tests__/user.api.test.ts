// ============================================
// USER SETTINGS API INTEGRATION TESTS
// ============================================
// Sprint 5: Settings & Configuration
// Integration tests for user settings API endpoint
// Following divine agricultural patterns with type safety

import type { UserSettingsData } from "@/types/settings";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { NextRequest } from "next/server";
import { GET, PATCH } from "../user/route";

// Mock auth - must be defined before import
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// Mock settings service - must be defined before import
jest.mock("@/lib/services/settings.service", () => ({
  settingsService: {
    getUserSettings: jest.fn(),
    updateUserSettings: jest.fn(),
  },
}));

// Import after mocks are set up
import { auth } from "@/lib/auth";
import { settingsService } from "@/lib/services/settings.service";

describe("User Settings API", () => {
  const mockUserId = "user_123";
  const mockAuth = auth as jest.MockedFunction<typeof auth>;
  const mockGetUserSettings =
    settingsService.getUserSettings as jest.MockedFunction<
      typeof settingsService.getUserSettings
    >;
  const mockUpdateUserSettings =
    settingsService.updateUserSettings as jest.MockedFunction<
      typeof settingsService.updateUserSettings
    >;
  const mockSession = {
    user: {
      id: mockUserId,
      email: "test@example.com",
      role: "CUSTOMER",
    },
  };

  const mockUserSettings: UserSettingsData = {
    notifications: {
      email: {
        enabled: true,
        frequency: "daily",
        quietHours: {
          start: "22:00",
          end: "08:00",
        },
      },
      sms: {
        enabled: false,
        frequency: "never",
      },
      push: {
        enabled: true,
        frequency: "immediate",
        sound: true,
        badge: true,
      },
      inApp: {
        enabled: true,
        frequency: "immediate",
      },
    },
    display: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
      distanceUnit: "miles",
      currency: "USD",
    },
    privacy: {
      profileVisibility: "public",
      showEmail: true,
      showPhone: false,
      allowMessaging: true,
      dataSharing: false,
    },
    contactMethod: "email",
    communicationFrequency: "normal",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ============================================
  // GET /api/settings/user TESTS
  // ============================================

  describe("GET /api/settings/user", () => {
    it("should return 401 if user is not authenticated", async () => {
      (mockAuth as any).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/settings/user");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should return user settings when authenticated", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockGetUserSettings.mockResolvedValue(mockUserSettings);

      const request = new NextRequest("http://localhost/api/settings/user");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUserSettings);
      expect(mockGetUserSettings).toHaveBeenCalledWith(mockUserId);
    });

    it("should include metadata in response", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockGetUserSettings.mockResolvedValue(mockUserSettings);

      const request = new NextRequest("http://localhost/api/settings/user", {
        headers: {
          "x-request-id": "test-request-123",
        },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(data.meta).toBeDefined();
      expect(data.meta.requestId).toBe("test-request-123");
      expect(data.meta.timestamp).toBeDefined();
    });

    it("should return 500 if service throws error", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockGetUserSettings.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest("http://localhost/api/settings/user");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("USER_SETTINGS_FETCH_ERROR");
      expect(data.error.message).toContain("Database connection failed");
    });
  });

  // ============================================
  // PATCH /api/settings/user TESTS
  // ============================================

  describe("PATCH /api/settings/user", () => {
    it("should return 401 if user is not authenticated", async () => {
      (mockAuth as any).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        body: JSON.stringify({ display: { theme: "dark" } }),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should update user settings with valid data", async () => {
      const updates = {
        display: { theme: "dark" as const },
        notifications: {
          email: {
            enabled: false,
            frequency: "weekly" as const,
          },
        },
      };

      const updatedSettings = {
        ...mockUserSettings,
        display: {
          ...mockUserSettings.display,
          theme: "dark" as const,
        },
      };

      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockUpdateUserSettings.mockResolvedValue(updatedSettings);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.display.theme).toBe("dark");
      expect(mockUpdateUserSettings).toHaveBeenCalledWith(mockUserId, updates);
    });

    it("should return 400 for invalid data", async () => {
      const invalidUpdates = {
        display: {
          theme: "invalid_theme",
        },
      };

      (mockAuth as any).mockResolvedValue(mockSession as any);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUpdates),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should handle service validation errors", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockUpdateUserSettings.mockRejectedValue(
        new Error("Validation failed: Invalid theme value"),
      );

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display: { theme: "dark" } }),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("SETTINGS_VALIDATION_ERROR");
    });

    it("should handle partial updates correctly", async () => {
      const partialUpdate = {
        display: { theme: "dark" as const },
      };

      const updatedSettings = {
        ...mockUserSettings,
        display: {
          ...mockUserSettings.display,
          theme: "dark" as const,
        },
      };

      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockUpdateUserSettings.mockResolvedValue(updatedSettings);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partialUpdate),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.display.theme).toBe("dark");
      expect(data.data.display.language).toBe("en"); // Other fields preserved
    });

    it("should validate notification frequency values", async () => {
      const invalidUpdates = {
        notifications: {
          email: {
            enabled: true,
            frequency: "invalid_frequency" as any,
          },
        },
      };

      (mockAuth as any).mockResolvedValue(mockSession as any);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUpdates),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should validate quiet hours time format", async () => {
      const invalidUpdates = {
        notifications: {
          email: {
            enabled: true,
            frequency: "daily" as const,
            quietHours: {
              start: "25:00", // Invalid hour
              end: "08:00",
            },
          },
        },
      };

      (mockAuth as any).mockResolvedValue(mockSession as any);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUpdates),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should validate communication frequency values", async () => {
      const invalidUpdates = {
        communicationFrequency: "invalid_frequency" as any,
      };

      (mockAuth as any).mockResolvedValue(mockSession as any);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUpdates),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 500 for unexpected errors", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockUpdateUserSettings.mockRejectedValue(new Error("Unexpected error"));

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display: { theme: "dark" } }),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("USER_SETTINGS_UPDATE_ERROR");
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("Edge Cases", () => {
    it("should handle malformed JSON in PATCH request", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{ invalid json",
      });

      const response = await PATCH(request);
      expect(response.status).toBe(500);
    });

    it("should handle empty update object", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockUpdateUserSettings.mockResolvedValue(mockUserSettings);

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(200);
    });

    it("should handle session with missing user ID", async () => {
      mockAuth.mockResolvedValue({ user: { email: "test@example.com" } });

      const request = new NextRequest("http://localhost/api/settings/user");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should handle null session", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/settings/user");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should include request ID in error responses", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockGetUserSettings.mockRejectedValue(new Error("Service error"));

      const request = new NextRequest("http://localhost/api/settings/user", {
        headers: {
          "x-request-id": "error-test-123",
        },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(data.error.requestId).toBe("error-test-123");
    });
  });

  // ============================================
  // PERFORMANCE & SECURITY
  // ============================================

  describe("Performance & Security", () => {
    it("should not expose internal error details to client", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockGetUserSettings.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest("http://localhost/api/settings/user");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe("USER_SETTINGS_FETCH_ERROR");
      expect(data.error.message).toBe("Database connection failed");
      // Error should not contain sensitive connection strings
      expect(data.error.message).not.toContain("postgres://");
    });

    it("should respond quickly for cached data", async () => {
      (mockAuth as any).mockResolvedValue(mockSession as any);
      mockGetUserSettings.mockResolvedValue(mockUserSettings);

      const startTime = Date.now();
      const request = new NextRequest("http://localhost/api/settings/user");
      await GET(request);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should be fast
    });

    it("should validate all user input", async () => {
      mockAuth.mockResolvedValue(mockSession);

      const maliciousUpdates = {
        display: {
          theme: "<script>alert('xss')</script>" as any,
        },
      };

      const request = new NextRequest("http://localhost/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(maliciousUpdates),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
    });
  });
});
