/**
 * 🧪 DATABASE MOCK - For Jest Testing
 *
 * Comprehensive mock of the Prisma database client
 * Prevents actual database connections during unit tests
 */

// Mock Prisma Client methods
const createMockPrismaModel = () => ({
  create: jest.fn(),
  createMany: jest.fn(),
  findUnique: jest.fn(),
  findUniqueOrThrow: jest.fn(),
  findFirst: jest.fn(),
  findFirstOrThrow: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
});

// Create mock database with all models
export const database = {
  // Models
  user: createMockPrismaModel(),
  farm: createMockPrismaModel(),
  product: createMockPrismaModel(),
  order: createMockPrismaModel(),
  orderItem: createMockPrismaModel(),
  cart: createMockPrismaModel(),
  cartItem: createMockPrismaModel(),
  review: createMockPrismaModel(),
  notification: createMockPrismaModel(),
  favorite: createMockPrismaModel(),
  category: createMockPrismaModel(),
  tag: createMockPrismaModel(),
  location: createMockPrismaModel(),
  payment: createMockPrismaModel(),
  message: createMockPrismaModel(),
  subscription: createMockPrismaModel(),
  session: createMockPrismaModel(),
  verificationToken: createMockPrismaModel(),
  account: createMockPrismaModel(),
  webhookEvent: createMockPrismaModel(),

  // Prisma special methods
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn().mockImplementation((callback) => {
    if (typeof callback === 'function') {
      return callback(database);
    }
    return Promise.all(callback);
  }),
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $on: jest.fn(),
  $use: jest.fn(),
  $extends: jest.fn(),
};

// Helper to reset all mocks
export const resetDatabaseMocks = () => {
  Object.keys(database).forEach((key) => {
    const model = (database as any)[key];
    if (model && typeof model === 'object') {
      Object.keys(model).forEach((method) => {
        if (typeof model[method]?.mockReset === 'function') {
          model[method].mockReset();
        }
      });
    }
  });
};

export default database;
