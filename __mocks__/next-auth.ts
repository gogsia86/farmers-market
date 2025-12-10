/**
 * 🧪 NEXT-AUTH MOCK
 * Jest module mock for next-auth to avoid ESM import issues
 * Location: __mocks__/next-auth.ts
 */

interface CredentialsConfig {
  name?: string;
  credentials?: Record<string, unknown>;
  authorize?: (...args: unknown[]) => unknown;
}

const mockCredentialsProvider = jest.fn((config: CredentialsConfig) => ({
  id: "credentials",
  name: config?.name || "Credentials",
  type: "credentials",
  credentials: config?.credentials || {},
  authorize: config?.authorize || jest.fn(),
}));

export default jest.fn();

export const getServerSession = jest.fn();

export const SessionProvider = ({ children }: { children: React.ReactNode }) =>
  children;

export const useSession = jest.fn(() => ({
  data: null,
  status: "unauthenticated" as const,
}));

export const signIn = jest.fn();
export const signOut = jest.fn();
export const getCsrfToken = jest.fn();
export const getProviders = jest.fn();

// For next-auth/providers/credentials
export const CredentialsProvider = mockCredentialsProvider;
