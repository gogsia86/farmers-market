/**
 * Database Mock
 * Provides mock Prisma client for testing
 */

// PrismaClient type is available but not directly used - mock uses 'any' for flexibility
export const mockPrismaClient: any = {
  farm: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn((callback: (client: any) => any) =>
    callback(mockPrismaClient),
  ),
  $queryRaw: jest.fn(),
};

// Mock database module
jest.mock("@/lib/database", () => ({
  database: mockPrismaClient,
}));

export { mockPrismaClient as database };
