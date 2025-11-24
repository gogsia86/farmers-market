/**
 * NextAuth Mock
 * Provides mock implementations for NextAuth functions
 */

export const mockSession = {
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    role: "FARMER" as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockAuth = jest.fn().mockResolvedValue(mockSession);

// Mock next-auth module
jest.mock("next-auth", () => ({
  default: jest.fn(),
}));

jest.mock("next-auth/next", () => ({
  getServerSession: mockAuth,
}));
