/**
 * 🗄️ DATABASE MOCK
 *
 * Mock database client for testing purposes
 * Provides consistent mock for Prisma database operations
 */

// ============================================================================
// MOCK DATABASE CLIENT
// ============================================================================

export const database = {
  // User model
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },

  // Farm model
  farm: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },

  // Product model
  product: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    updateMany: jest.fn(),
  },

  // Order model
  order: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },

  // OrderItem model
  orderItem: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    createMany: jest.fn(),
  },

  // Cart model
  cart: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },

  // CartItem model
  cartItem: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },

  // Review model
  review: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Category model
  category: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Transaction support
  $transaction: jest.fn((callback) => {
    if (typeof callback === "function") {
      return callback(database);
    }
    return Promise.all(callback);
  }),

  // Connection management
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),

  // Raw queries
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

// ============================================================================
// RESET HELPER
// ============================================================================

export function resetDatabaseMocks() {
  // Reset all model mocks
  const models = [
    "user",
    "farm",
    "product",
    "order",
    "orderItem",
    "cart",
    "cartItem",
    "review",
    "category",
  ] as const;

  models.forEach((model) => {
    Object.values(database[model]).forEach((mock) => {
      if (typeof mock === "function" && "mockReset" in mock) {
        (mock as jest.Mock).mockReset();
      }
    });
  });

  // Reset transaction mock
  database.$transaction.mockReset();
  database.$transaction.mockImplementation((callback) => {
    if (typeof callback === "function") {
      return callback(database);
    }
    return Promise.all(callback);
  });

  // Reset connection mocks
  database.$connect.mockReset();
  database.$connect.mockResolvedValue(undefined);
  database.$disconnect.mockReset();
  database.$disconnect.mockResolvedValue(undefined);

  // Reset raw query mocks
  database.$queryRaw.mockReset();
  database.$executeRaw.mockReset();
}

// ============================================================================
// MOCK SETUP HELPERS
// ============================================================================

export function mockDatabaseFindUnique<T>(
  model: keyof typeof database,
  data: T,
) {
  if (model in database && "findUnique" in (database[model] as any)) {
    (database[model] as any).findUnique.mockResolvedValue(data);
  }
}

export function mockDatabaseFindMany<T>(
  model: keyof typeof database,
  data: T[],
) {
  if (model in database && "findMany" in (database[model] as any)) {
    (database[model] as any).findMany.mockResolvedValue(data);
  }
}

export function mockDatabaseCreate<T>(model: keyof typeof database, data: T) {
  if (model in database && "create" in (database[model] as any)) {
    (database[model] as any).create.mockResolvedValue(data);
  }
}

export function mockDatabaseUpdate<T>(model: keyof typeof database, data: T) {
  if (model in database && "update" in (database[model] as any)) {
    (database[model] as any).update.mockResolvedValue(data);
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  database,
  resetDatabaseMocks,
  mockDatabaseFindUnique,
  mockDatabaseFindMany,
  mockDatabaseCreate,
  mockDatabaseUpdate,
};
