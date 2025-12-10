/**
 * 🔐 NEXT-AUTH MOCK
 *
 * Mock authentication for testing purposes
 * Provides consistent mock session and auth helpers
 */

import type { Session } from "next-auth";

// ============================================================================
// MOCK SESSION DATA
// ============================================================================

export const mockSession: Session = {
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    role: "CUSTOMER",
    image: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

export const mockFarmerSession: Session = {
  user: {
    id: "test-farmer-id",
    name: "Test Farmer",
    email: "farmer@example.com",
    role: "FARMER",
    image: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockAdminSession: Session = {
  user: {
    id: "test-admin-id",
    name: "Test Admin",
    email: "admin@example.com",
    role: "ADMIN",
    image: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// ============================================================================
// MOCK AUTH FUNCTION
// ============================================================================

export const mockAuth = jest.fn().mockResolvedValue(mockSession);

export const mockAuthAsCustomer = () => {
  mockAuth.mockResolvedValue(mockSession);
};

export const mockAuthAsFarmer = () => {
  mockAuth.mockResolvedValue(mockFarmerSession);
};

export const mockAuthAsAdmin = () => {
  mockAuth.mockResolvedValue(mockAdminSession);
};

export const mockAuthAsUnauthenticated = () => {
  mockAuth.mockResolvedValue(null);
};

// ============================================================================
// MOCK SIGN IN/OUT
// ============================================================================

export const mockSignIn = jest
  .fn()
  .mockResolvedValue({ ok: true, error: null });
export const mockSignOut = jest.fn().mockResolvedValue({ url: "/" });

// ============================================================================
// RESET HELPERS
// ============================================================================

export function resetAuthMocks() {
  mockAuth.mockReset();
  mockAuth.mockResolvedValue(mockSession);
  mockSignIn.mockReset();
  mockSignIn.mockResolvedValue({ ok: true, error: null });
  mockSignOut.mockReset();
  mockSignOut.mockResolvedValue({ url: "/" });
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  mockSession,
  mockFarmerSession,
  mockAdminSession,
  mockAuth,
  mockAuthAsCustomer,
  mockAuthAsFarmer,
  mockAuthAsAdmin,
  mockAuthAsUnauthenticated,
  mockSignIn,
  mockSignOut,
  resetAuthMocks,
};
