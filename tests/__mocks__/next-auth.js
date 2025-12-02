/**
 * Mock for next-auth to avoid ESM import issues in Jest tests
 */

const mockCredentialsProvider = jest.fn((config) => ({
  id: "credentials",
  name: config?.name || "Credentials",
  type: "credentials",
  credentials: config?.credentials || {},
  authorize: config?.authorize || jest.fn(),
}));

module.exports = {
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
  SessionProvider: ({ children }) => children,
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
};

// Export as CommonJS for next-auth/providers/credentials
module.exports.providers = {
  credentials: mockCredentialsProvider,
};

// Make it work as both default and named export
module.exports.CredentialsProvider = mockCredentialsProvider;

// For default import from next-auth/providers/credentials
if (typeof module.exports.default === "undefined") {
  Object.defineProperty(module.exports, "default", {
    get: () => mockCredentialsProvider,
    enumerable: true,
  });
}
