/**
 * ⚡ DIVINE JEST SETUP - TEST ENVIRONMENT CONFIGURATION
 * Enterprise-grade test setup with agricultural consciousness
 * HP OMEN Optimized: 64GB RAM, 12 threads
 */

// ============================================
// ENVIRONMENT CONFIGURATION - LOAD TEST ENV FIRST
// ============================================
const dotenv = require("dotenv");
const path = require("path");

// Load .env.test for integration tests
const envTestPath = path.resolve(__dirname, ".env.test");
const envResult = dotenv.config({ path: envTestPath });

if (envResult.error) {
  console.warn("⚠️  No .env.test file found, using default .env");
  // Fallback to default .env
  dotenv.config();
} else {
  console.log("✅ Loaded test environment from .env.test");
}

// ============================================
// TEXT ENCODER/DECODER POLYFILL - FIX FOR PRISMA/PG
// ============================================
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ============================================
// TESTING LIBRARY SETUP
// ============================================
require("@testing-library/jest-dom");

// ============================================
// GLOBAL TEST CONFIGURATION
// ============================================
jest.setTimeout(30000);

// Global agricultural consciousness
global.agriculturalConsciousness = {
  testSeason: "FALL",
  biodynamicMode: true,
  quantumCoherence: 0.95,
};

// ============================================
// ENVIRONMENT VARIABLES - TEST REALITY
// ============================================
process.env.NODE_ENV = "test";
// Only set DATABASE_URL if not already set by jest.env.js from .env.test
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  console.warn("⚠️  Using fallback DATABASE_URL - no .env.test found");
}
// Only set auth secrets if not already set
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "divine-test-secret-for-quantum-authentication";
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "http://localhost:3001";
}
process.env.PAYPAL_CLIENT_ID = "test-paypal-client-id";
process.env.PAYPAL_CLIENT_SECRET = "test-paypal-client-secret";
process.env.STRIPE_SECRET_KEY = "test-stripe-secret-key";
process.env.STRIPE_PUBLISHABLE_KEY = "test-stripe-publishable-key";

// ============================================
// WEB API POLYFILLS - NEXT.JS COMPATIBILITY
// ============================================

// Global fetch mock for Stripe and other HTTP clients
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: new Headers(),
  }),
);

// ============================================
// BROWSER API MOCKS - DOM COMPATIBILITY
// ============================================

// Mock window.matchMedia for accessibility hooks (useReducedMotion)
// Need to mock on both window and global for different test scenarios
const matchMediaMock = jest.fn().mockImplementation(query => {
  const listeners = [];
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(cb => {
      if (cb) listeners.push(cb);
    }), // Deprecated - Safari < 14
    removeListener: jest.fn(cb => {
      const index = listeners.indexOf(cb);
      if (index > -1) listeners.splice(index, 1);
    }), // Deprecated - Safari < 14
    addEventListener: jest.fn((event, cb) => {
      if (event === 'change' && cb) listeners.push(cb);
    }),
    removeEventListener: jest.fn((event, cb) => {
      if (event === 'change') {
        const index = listeners.indexOf(cb);
        if (index > -1) listeners.splice(index, 1);
      }
    }),
    dispatchEvent: jest.fn(event => {
      listeners.forEach(cb => cb(event));
      return true;
    }),
  };
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

Object.defineProperty(global, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Mock IntersectionObserver for lazy loading components
global.IntersectionObserver = class IntersectionObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  takeRecords() {
    return [];
  }
  unobserve() { }
};

// Mock ResizeObserver for responsive components
global.ResizeObserver = class ResizeObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  unobserve() { }
};

// Mock localStorage for persistence tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock NextResponse for Next.js API route testing
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init) => {
      const response = {
        status: init?.status || 200,
        headers: init?.headers || {},
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        json: async () => data,
        text: async () => JSON.stringify(data),
      };
      return response;
    },
    redirect: (url) => ({
      status: 307,
      headers: { Location: url },
      url,
    }),
  },
  NextRequest: class NextRequest extends Request {
    constructor(input, init) {
      super(input, init);
      this.nextUrl = new URL(input);
    }
  },
}));

global.Request = class Request {
  constructor(input, init = {}) {
    this.url = typeof input === "string" ? input : input.url;
    this.method = init.method || "GET";
    this.headers = new Headers(init.headers || {});
    this.body = init.body;
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return String(this.body);
  }
};

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || "OK";
    this.headers = new Headers(init.headers || {});
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return String(this.body);
  }
};

global.Headers = class Headers {
  constructor(init = {}) {
    this.map = new Map();
    if (init instanceof Headers) {
      init.forEach((value, key) => this.map.set(key.toLowerCase(), value));
    } else if (Array.isArray(init)) {
      init.forEach(([key, value]) => this.map.set(key.toLowerCase(), value));
    } else if (init && typeof init === "object") {
      Object.entries(init).forEach(([key, value]) => {
        this.map.set(key.toLowerCase(), value);
      });
    }
  }

  get(name) {
    return this.map.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this.map.set(name.toLowerCase(), value);
  }

  has(name) {
    return this.map.has(name.toLowerCase());
  }

  delete(name) {
    this.map.delete(name.toLowerCase());
  }

  forEach(callback) {
    this.map.forEach((value, key) => callback(value, key, this));
  }

  entries() {
    return this.map.entries();
  }

  keys() {
    return this.map.keys();
  }

  values() {
    return this.map.values();
  }
};

global.TransformStream = class TransformStream {
  constructor() {
    this.readable = {};
    this.writable = {};
  }
};

global.ReadableStream = class ReadableStream {
  constructor() { }
};

global.WritableStream = class WritableStream {
  constructor() { }
};

// ============================================
// PRISMA DATABASE QUANTUM MOCKS
// ============================================

const mockDatabase = {
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
  product: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  orderItem: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createMany: jest.fn(),
    count: jest.fn(),
  },
  payment: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  userAddress: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  cartItem: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn((callback) => callback(mockDatabase)),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockDatabase),
}));

jest.mock(
  "./src/lib/database",
  () => ({
    database: mockDatabase,
    prisma: mockDatabase,
    default: mockDatabase,
    isDatabaseConnected: jest.fn(() => true),
  }),
  { virtual: true },
);

// Global helper for test database queries
global.mockQueryFirst = (model, result) => {
  if (mockDatabase[model]) {
    mockDatabase[model].findFirst.mockResolvedValueOnce(result);
  }
};

// ============================================
// CART SERVICE MOCKS
// ============================================

const mockCartService = {
  getCart: jest.fn(),
  addItem: jest.fn(),
  updateItemQuantity: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
  validateCart: jest.fn(),
  reserveCartItems: jest.fn(),
  releaseReservations: jest.fn(),
};

jest.mock(
  "./src/lib/services/cart.service",
  () => ({
    cartService: mockCartService,
    CartService: jest.fn().mockImplementation(() => mockCartService),
  }),
  { virtual: true },
);

global.mockCartService = mockCartService;

// ============================================
// STRUCTURED LOGGER MOCK - MUST BE BEFORE DATABASE
// ============================================

// Create a factory that always returns a working logger
const createMockLogger = () => {
  const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    businessEvent: jest.fn(),
    child: jest.fn(),
  };
  // Make child return a new logger instance
  logger.child.mockImplementation(() => createMockLogger());
  return logger;
};

// Create global instance
const mockLoggerInstance = createMockLogger();

// Mock the module BEFORE any other mocks
jest.mock(
  "@/lib/monitoring/StructuredLogger",
  () => ({
    StructuredLogger: jest.fn().mockImplementation(() => createMockLogger()),
    LoggerFactory: {
      getLogger: jest.fn().mockImplementation(() => createMockLogger()),
      createRequestLogger: jest
        .fn()
        .mockImplementation(() => createMockLogger()),
    },
  }),
  { virtual: true },
);

global.mockLogger = mockLoggerInstance;
global.createMockLogger = createMockLogger;

// ============================================
// PRISMA DATABASE QUANTUM MOCKS
// ============================================

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: "/",
    query: {},
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    toString: jest.fn(() => ""),
  })),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

jest.mock("next/link", () => {
  return ({ children, href }) => {
    const React = require("react");
    return React.createElement("a", { href }, children);
  };
});

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => new Map()),
}));

// ============================================
// NEXT-AUTH MOCKS
// ============================================

// Mock @auth/prisma-adapter to avoid ESM import issues
jest.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: jest.fn(() => ({})),
}));

const mockAuth = jest.fn().mockResolvedValue({
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "CUSTOMER",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

jest.mock("next-auth", () => ({
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: mockAuth,
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}));

jest.mock("next-auth/providers/credentials", () => {
  const mockProvider = jest.fn(() => ({
    id: "credentials",
    name: "Credentials",
    type: "credentials",
    credentials: {},
    authorize: jest.fn(),
  }));
  return {
    __esModule: true,
    default: mockProvider,
  };
});

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

jest.mock(
  "./src/lib/auth",
  () => ({
    auth: mockAuth,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
  { virtual: true },
);

// Mock the entire auth config module to avoid next-auth provider issues
jest.mock(
  "./src/lib/auth/config",
  () => ({
    __esModule: true,
    authConfig: {
      providers: [],
      callbacks: {
        jwt: jest.fn(),
        session: jest.fn(),
      },
      pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error",
      },
    },
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: mockAuth,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
  { virtual: true },
);

global.mockAuth = mockAuth;

// ============================================
// NATIVE MODULE MOCKS - C++ DEPENDENCIES
// ============================================

jest.mock(
  "bcrypt",
  () => ({
    hash: jest.fn().mockResolvedValue("$2b$12$hashedpassword"),
    compare: jest.fn().mockResolvedValue(true),
    genSalt: jest.fn().mockResolvedValue("$2b$12$"),
    hashSync: jest.fn().mockReturnValue("$2b$12$hashedpassword"),
    compareSync: jest.fn().mockReturnValue(true),
    genSaltSync: jest.fn().mockReturnValue("$2b$12$"),
    getRounds: jest.fn().mockReturnValue(12),
  }),
  { virtual: true },
);

jest.mock(
  "sharp",
  () => {
    const mockSharp = jest.fn(() => ({
      resize: jest.fn().mockReturnThis(),
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from("mock-image")),
      toFile: jest.fn().mockResolvedValue({ size: 1024 }),
      metadata: jest
        .fn()
        .mockResolvedValue({ width: 800, height: 600, format: "jpeg" }),
      jpeg: jest.fn().mockReturnThis(),
      png: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
    }));
    return mockSharp;
  },
  { virtual: true },
);

jest.mock(
  "canvas",
  () => ({
    createCanvas: jest.fn(() => ({
      getContext: jest.fn(() => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 100 })),
        drawImage: jest.fn(),
      })),
      toBuffer: jest.fn(() => Buffer.from("mock-canvas")),
    })),
    loadImage: jest.fn().mockResolvedValue({}),
    registerFont: jest.fn(),
  }),
  { virtual: true },
);

// ============================================
// THIRD-PARTY LIBRARY MOCKS
// ============================================

jest.mock(
  "react-hot-toast",
  () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      loading: jest.fn(),
      custom: jest.fn(),
    },
    Toaster: () => null,
  }),
  { virtual: true },
);

jest.mock(
  "axios",
  () => ({
    default: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      })),
    },
  }),
  { virtual: true },
);

jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(" ")),
  formatNumber: jest.fn((num, locale = "en-US") =>
    new Intl.NumberFormat(locale).format(num),
  ),
  formatPrice: jest.fn((price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price),
  ),
  truncate: jest.fn((text, length) => {
    if (text.length <= length) return text;
    return `${text.slice(0, length)}...`;
  }),
  sleep: jest.fn((_ms) => Promise.resolve()),
  debounce: jest.fn((func, wait) => {
    let timeout = null;
    return (...args) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }),
  generateId: jest.fn(() => Math.random().toString(36).substring(2, 15)),
}));

// ============================================
// CONSOLE SUPPRESSION - CLEANER TEST OUTPUT
// ============================================

const originalConsole = { ...console };

global.console = {
  ...console,
  error: jest.fn((...args) => {
    // Only log actual errors, suppress expected warnings
    if (
      !args[0]?.includes?.("Warning:") &&
      !args[0]?.includes?.("Not implemented:")
    ) {
      originalConsole.error(...args);
    }
  }),
  warn: jest.fn((...args) => {
    // Suppress certain warnings in tests
    if (!args[0]?.includes?.("componentWillReceiveProps")) {
      originalConsole.warn(...args);
    }
  }),
};

// ============================================
// TEST LIFECYCLE HOOKS
// ============================================

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks();
});

// ============================================
// DIVINE TESTING UTILITIES
// ============================================

// Helper to create test data
global.createTestUser = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  role: "CUSTOMER",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

global.createTestFarm = (overrides = {}) => ({
  id: "test-farm-id",
  name: "Divine Test Farm",
  description: "A test farm with agricultural consciousness",
  location: "Test Location",
  ownerId: "test-user-id",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

global.createTestProduct = (overrides = {}) => ({
  id: "test-product-id",
  name: "Test Product",
  description: "A divine test product",
  price: 9.99,
  farmId: "test-farm-id",
  category: "VEGETABLES",
  season: "FALL",
  stock: 100,
  unit: "lb",
  available: true,
  purchaseCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

global.createTestCartItem = (overrides = {}) => ({
  id: "test-cart-item-id",
  userId: "test-user-id",
  productId: "test-product-id",
  quantity: 1,
  addedAt: new Date(),
  reservedUntil: null,
  product: global.createTestProduct(),
  ...overrides,
});

global.createTestCart = (items = [global.createTestCartItem()]) => ({
  items,
  subtotal: items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  ),
  itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  farmCount: new Set(items.map((item) => item.product?.farmId)).size,
});

global.createTestAddress = (overrides = {}) => ({
  id: "test-address-id",
  userId: "test-user-id",
  type: "HOME",
  street: "123 Test St",
  city: "Test City",
  state: "TS",
  zipCode: "12345",
  country: "US",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

global.createTestOrder = (overrides = {}) => ({
  id: "test-order-id",
  orderNumber: "FM-TEST-123456",
  customerId: "test-user-id",
  farmId: "test-farm-id",
  status: "PENDING",
  paymentStatus: "PENDING",
  fulfillmentMethod: "DELIVERY",
  subtotal: 9.99,
  deliveryFee: 5.0,
  tax: 1.2,
  platformFee: 0.5,
  discount: 0,
  total: 16.69,
  farmerAmount: 14.49,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  ...overrides,
});

// ============================================
// REDIS CACHE QUANTUM MOCK
// ============================================

const mockRedisCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  deletePattern: jest.fn(),
  exists: jest.fn(),
  ttl: jest.fn(),
  getOrSet: jest.fn(),
  increment: jest.fn(),
  flushAll: jest.fn(),
  disconnect: jest.fn(),
};

// Mock Redis cache module globally - use relative path like other mocks
jest.mock(
  "./src/lib/cache/redis",
  () => ({
    getRedisCache: jest.fn(() => mockRedisCache),
    checkRedisHealth: jest.fn(async () => true),
    RedisCacheService: jest.fn().mockImplementation(() => mockRedisCache),
  }),
  { virtual: true },
);

global.mockRedisCache = mockRedisCache;

// ============================================
// RESTORE MOCKS AFTER JEST CLEARS THEM
// ============================================
// Jest config has resetMocks: true which clears mock implementations
// We need to restore our browser API mocks in beforeEach

beforeEach(() => {
  // Restore matchMedia mock implementation
  // This is needed because resetMocks: true in jest.config.js clears it
  if (jest.isMockFunction(window.matchMedia)) {
    window.matchMedia.mockImplementation((query) => {
      const listeners = [];
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(cb => {
          if (cb) listeners.push(cb);
        }),
        removeListener: jest.fn(cb => {
          const index = listeners.indexOf(cb);
          if (index > -1) listeners.splice(index, 1);
        }),
        addEventListener: jest.fn((event, cb) => {
          if (event === 'change' && cb) listeners.push(cb);
        }),
        removeEventListener: jest.fn((event, cb) => {
          if (event === 'change') {
            const index = listeners.indexOf(cb);
            if (index > -1) listeners.splice(index, 1);
          }
        }),
        dispatchEvent: jest.fn(event => {
          listeners.forEach(cb => cb(event));
          return true;
        }),
      };
    });
  }
});

// ============================================
// AGRICULTURAL CONSCIOUSNESS
// ============================================
console.log("🌾 Divine Test Environment Initialized");
console.log("⚡ Agricultural Consciousness: ACTIVE");
console.log("🎯 HP OMEN Optimization: ENABLED");
