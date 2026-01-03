/**
 * 🧪 PAYMENT INTENT API - INTEGRATION TESTS
 * Divine test coverage for Stripe payment intent creation endpoint
 *
 * Test Coverage:
 * - Authentication requirements
 * - Request validation
 * - Payment intent creation
 * - Agricultural metadata handling
 * - Error handling and edge cases
 * - Response format validation
 */

import { NextRequest } from "next/server";

// ============================================================================
// MOCKS - MUST BE BEFORE IMPORTS
// ============================================================================

// Mock auth BEFORE importing the route to prevent NextAuth ESM issues
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/services/checkout.service", () => ({
  checkoutService: {
    createPaymentIntent: jest.fn(),
    retrievePaymentIntent: jest.fn(),
  },
}));

// Mock next-auth providers to prevent ESM import errors
jest.mock("next-auth/providers/credentials", () => ({
  default: jest.fn(() => ({
    id: "credentials",
    name: "Credentials",
    type: "credentials",
    credentials: {},
    authorize: jest.fn(),
  })),
}));

// Now safe to import the route and other dependencies
import { auth } from "@/lib/auth";
import { checkoutService } from "@/lib/services/checkout.service";
import { GET, POST } from "../create-payment-intent/route";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCheckoutService = checkoutService as jest.Mocked<
  typeof checkoutService
>;

// ============================================================================
// TEST HELPERS
// ============================================================================

const createMockRequest = (
  body: any,
  url = "http://localhost:3000/api/checkout/create-payment-intent",
) => {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

const createMockGetRequest = (searchParams: Record<string, string> = {}) => {
  const url = new URL(
    "http://localhost:3000/api/checkout/create-payment-intent",
  );
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return new NextRequest(url.toString(), {
    method: "GET",
  });
};

const createMockSession = (overrides = {}) => ({
  user: {
    id: "user_123",
    email: "test@example.com",
    name: "Test User",
    role: "CUSTOMER",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("POST /api/checkout/create-payment-intent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // AUTHENTICATION TESTS
  // ==========================================================================

  describe("Authentication", () => {
    it("should require authentication", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Authentication required");
    });

    it("should reject requests without user ID", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {},
        expires: new Date().toISOString(),
      } as any);

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should accept valid session", async () => {
      const mockSession = createMockSession();
      mockAuth.mockResolvedValueOnce(mockSession);

      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: true,
        data: {
          id: "pi_test_123",
          clientSecret: "pi_test_123_secret_456",
          amount: 49.99,
          currency: "usd",
          status: "requires_payment_method",
        },
      });

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ==========================================================================
  // REQUEST VALIDATION TESTS
  // ==========================================================================

  describe("Request Validation", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(createMockSession());
    });

    it("should validate required amount field", async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid request data");
      expect(data.details).toBeDefined();
    });

    it("should reject negative amounts", async () => {
      const request = createMockRequest({
        amount: -10.0,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid request data");
    });

    it("should reject zero amount", async () => {
      const request = createMockRequest({
        amount: 0,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should reject excessively large amounts", async () => {
      const request = createMockRequest({
        amount: 10000000.0,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should accept valid amount", async () => {
      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: true,
        data: {
          id: "pi_test_123",
          clientSecret: "pi_test_123_secret_456",
          amount: 49.99,
          currency: "usd",
          status: "requires_payment_method",
        },
      });

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should accept optional metadata", async () => {
      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: true,
        data: {
          id: "pi_test_123",
          clientSecret: "pi_test_123_secret_456",
          amount: 49.99,
          currency: "usd",
          status: "requires_payment_method",
        },
      });

      const request = createMockRequest({
        amount: 49.99,
        metadata: {
          farmId: "farm_123",
          farmName: "Divine Acres",
          farmCount: 2,
          itemCount: 5,
          season: "FALL",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ==========================================================================
  // PAYMENT INTENT CREATION TESTS
  // ==========================================================================

  describe("Payment Intent Creation", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(createMockSession());
    });

    it("should create payment intent successfully", async () => {
      const mockPaymentIntent = {
        id: "pi_test_123",
        clientSecret: "pi_test_123_secret_456",
        amount: 49.99,
        currency: "usd",
        status: "requires_payment_method",
      };

      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: true,
        data: mockPaymentIntent,
      });

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.paymentIntent).toEqual(mockPaymentIntent);
      expect(mockCheckoutService.createPaymentIntent).toHaveBeenCalledWith(
        "user_123",
        49.99,
        expect.objectContaining({
          platform: "Farmers Market Platform",
          consciousness: "BIODYNAMIC",
        }),
      );
    });

    it("should include agricultural metadata in service call", async () => {
      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: true,
        data: {
          id: "pi_test_123",
          clientSecret: "pi_test_123_secret_456",
          amount: 49.99,
          currency: "usd",
          status: "requires_payment_method",
        },
      });

      const request = createMockRequest({
        amount: 49.99,
        metadata: {
          farmId: "farm_123",
          farmName: "Divine Acres Farm",
          farmCount: 3,
          itemCount: 7,
          season: "SUMMER",
        },
      });

      await POST(request);

      expect(mockCheckoutService.createPaymentIntent).toHaveBeenCalledWith(
        "user_123",
        49.99,
        expect.objectContaining({
          platform: "Farmers Market Platform",
          consciousness: "BIODYNAMIC",
          farmId: "farm_123",
          farmName: "Divine Acres Farm",
          farmCount: "3",
          itemCount: "7",
          season: "SUMMER",
        }),
      );
    });

    it("should handle service errors gracefully", async () => {
      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: false,
        error: "Stripe API error: Invalid currency",
      });

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Failed to create payment intent");
    });

    it("should handle missing payment intent in response", async () => {
      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: false,
        error: {
          code: "PAYMENT_INTENT_FAILED",
          message: "Failed to create payment intent",
        },
      });

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to create payment intent");
    });

    it("should handle unexpected exceptions", async () => {
      mockCheckoutService.createPaymentIntent.mockRejectedValueOnce(
        new Error("Network timeout"),
      );

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Network timeout");
    });

    it("should handle non-Error exceptions", async () => {
      mockCheckoutService.createPaymentIntent.mockRejectedValueOnce(
        "Something went wrong",
      );

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain("unexpected error occurred");
    });
  });

  // ==========================================================================
  // AGRICULTURAL METADATA TESTS
  // ==========================================================================

  describe("Agricultural Metadata", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(createMockSession());
      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: true,
        data: {
          id: "pi_test_123",
          clientSecret: "pi_test_123_secret_456",
          amount: 49.99,
          currency: "usd",
          status: "requires_payment_method",
        },
      });
    });

    it("should include biodynamic consciousness in metadata", async () => {
      const request = createMockRequest({
        amount: 49.99,
      });

      await POST(request);

      expect(mockCheckoutService.createPaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        expect.objectContaining({
          consciousness: "BIODYNAMIC",
        }),
      );
    });

    it("should include platform identification", async () => {
      const request = createMockRequest({
        amount: 49.99,
      });

      await POST(request);

      expect(mockCheckoutService.createPaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        expect.objectContaining({
          platform: "Farmers Market Platform",
        }),
      );
    });

    it("should convert numeric metadata to strings", async () => {
      const request = createMockRequest({
        amount: 49.99,
        metadata: {
          farmCount: 5,
          itemCount: 12,
        },
      });

      await POST(request);

      expect(mockCheckoutService.createPaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        expect.objectContaining({
          farmCount: "5",
          itemCount: "12",
        }),
      );
    });

    it("should use defaults for missing metadata fields", async () => {
      const request = createMockRequest({
        amount: 49.99,
      });

      await POST(request);

      expect(mockCheckoutService.createPaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        expect.objectContaining({
          farmCount: "0",
          itemCount: "0",
          season: "CURRENT",
          farmId: "",
          farmName: "",
        }),
      );
    });
  });

  // ==========================================================================
  // RESPONSE FORMAT TESTS
  // ==========================================================================

  describe("Response Format", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(createMockSession());
    });

    it("should return correct success response structure", async () => {
      const mockPaymentIntent = {
        id: "pi_test_789",
        clientSecret: "pi_test_789_secret_abc",
        amount: 125.0,
        currency: "usd",
        status: "requires_payment_method",
      };

      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: true,
        data: mockPaymentIntent,
      });

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("paymentIntent");
      expect(data.paymentIntent).toHaveProperty("id");
      expect(data.paymentIntent).toHaveProperty("clientSecret");
      expect(data.paymentIntent).toHaveProperty("amount");
      expect(data.paymentIntent).toHaveProperty("currency");
      expect(data.paymentIntent).toHaveProperty("status");
    });

    it("should return correct error response structure", async () => {
      mockCheckoutService.createPaymentIntent.mockResolvedValueOnce({
        success: false,
        error: "Payment processing failed",
      });

      const request = createMockRequest({
        amount: 49.99,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty("success", false);
      expect(data).toHaveProperty("error");
      expect(typeof data.error).toBe("string");
    });

    it("should return correct validation error structure", async () => {
      const request = createMockRequest({
        amount: -10,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty("success", false);
      expect(data).toHaveProperty("error");
      expect(data).toHaveProperty("details");
      expect(Array.isArray(data.details)).toBe(true);
    });
  });
});

// ============================================================================
// GET ENDPOINT TESTS
// ============================================================================

describe("GET /api/checkout/create-payment-intent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // AUTHENTICATION TESTS
  // ==========================================================================

  describe("Authentication", () => {
    it("should require authentication", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockGetRequest({
        paymentIntentId: "pi_test_123",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Authentication required");
    });

    it("should accept valid session", async () => {
      mockAuth.mockResolvedValueOnce(createMockSession());
      mockCheckoutService.retrievePaymentIntent.mockResolvedValueOnce({
        success: true,
        data: {
          id: "pi_test_123",
          clientSecret: "pi_test_123_secret_abc",
          amount: 100.0,
          currency: "usd",
          status: "requires_payment_method",
        },
      });

      const request = createMockGetRequest({
        paymentIntentId: "pi_test_123",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ==========================================================================
  // PARAMETER VALIDATION
  // ==========================================================================

  describe("Parameter Validation", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(createMockSession());
      mockCheckoutService.retrievePaymentIntent.mockResolvedValue({
        success: true,
        data: {
          id: "pi_test_123",
          clientSecret: "pi_test_123_secret_abc",
          amount: 100.0,
          currency: "usd",
          status: "requires_payment_method",
        },
      });
    });

    it("should require paymentIntentId parameter", async () => {
      const request = createMockGetRequest();

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Payment intent ID is required");
    });

    it("should accept valid paymentIntentId", async () => {
      const request = createMockGetRequest({
        paymentIntentId: "pi_test_123",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.paymentIntent.id).toBe("pi_test_123");
    });
  });

  // ==========================================================================
  // RESPONSE FORMAT
  // ==========================================================================

  describe("Response Format", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue(createMockSession());
      mockCheckoutService.retrievePaymentIntent.mockResolvedValue({
        success: true,
        data: {
          id: "pi_test_123",
          clientSecret: "pi_test_123_secret_abc",
          amount: 100.0,
          currency: "usd",
          status: "requires_payment_method",
        },
      });
    });

    it("should return payment intent status", async () => {
      const request = createMockGetRequest({
        paymentIntentId: "pi_test_123",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("paymentIntent");
      expect(data.paymentIntent).toHaveProperty("id");
      expect(data.paymentIntent).toHaveProperty("status");
    });
  });
});

/**
 * 🌾 DIVINE TEST SUMMARY
 * =====================
 *
 * Coverage Areas:
 * ✅ Authentication requirements (POST & GET)
 * ✅ Request body validation
 * ✅ Amount validation (positive, max limit)
 * ✅ Payment intent creation via service
 * ✅ Agricultural metadata handling
 * ✅ Error handling (service errors, exceptions)
 * ✅ Response format validation
 * ✅ Query parameter validation (GET)
 * ✅ Edge cases and error scenarios
 *
 * Agricultural Consciousness: MAXIMUM
 * Test Quality: DIVINE
 * Coverage Target: >95%
 */
