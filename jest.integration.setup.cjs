/**
 * JEST INTEGRATION TEST SETUP
 * Setup file for API integration tests
 *
 * KEY DIFFERENCE FROM jest.setup.cjs:
 * - Does NOT mock the Prisma database client
 * - Allows real database operations for integration testing
 * - Uses test database (configured via DATABASE_URL in .env.test)
 *
 * WHAT IS STILL MOCKED:
 * - Browser APIs (localStorage, matchMedia, IntersectionObserver, etc.)
 * - Next.js navigation (useRouter, redirect, etc.)
 * - NextAuth (authentication)
 * - External services (Redis cache, image processing, etc.)
 */

// ============================================
// UNMOCK DATABASE - CRITICAL FOR INTEGRATION TESTS
// ============================================

// Explicitly unmock database modules to ensure real Prisma client is used
jest.unmock("@/lib/database");
jest.unmock("@/lib/database/index");
jest.unmock("@prisma/client");

// ============================================
// ENVIRONMENT & CONFIGURATION
// ============================================

const dotenv = require("dotenv");
const path = require("path");

// Load test environment variables
const envTestPath = path.resolve(__dirname, ".env.test");
const envResult = dotenv.config({ path: envTestPath });

if (envResult.error) {
  console.warn(
    "⚠️  Warning: .env.test file not found. Using system environment variables.",
  );
} else {
  console.log("✅ Loaded .env.test for integration tests");
}

// ============================================
// NODE.JS POLYFILLS
// ============================================

const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ============================================
// AGRICULTURAL CONSCIOUSNESS (Test Context)
// ============================================

global.testSeason = "SPRING";
global.biodynamicMode = true;
global.quantumCoherence = 0.95;

// ============================================
// FETCH API MOCK (for Next.js API routes)
// ============================================

global.fetch = jest.fn((url, options) => {
  console.log(`[MOCK FETCH] ${options?.method || "GET"} ${url}`);

  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: {} }),
    text: async () => "OK",
    headers: new Map([["Content-Type", "application/json"]]),
  });
});

// ============================================
// BROWSER API MOCKS
// ============================================

// matchMedia mock
// matchMedia mock (global only, no window in Node environment)
const matchMediaMock = (() => {
  const listeners = [];

  return {
    matches: false,
    media: "",
    onchange: null,
    addListener: (listener) => {
      listeners.push(listener);
    },
    removeListener: (listener) => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    },
    addEventListener: (event, listener) => {
      listeners.push(listener);
    },
    removeEventListener: (event, listener) => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    },
    dispatchEvent: (event) => {
      listeners.forEach((listener) => listener(event));
      return true;
    },
  };
})();

// Only set on global (Node environment, no window)
Object.defineProperty(global, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => matchMediaMock),
});

// IntersectionObserver mock
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// MutationObserver mock
global.MutationObserver = class MutationObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// PerformanceObserver mock
global.PerformanceObserver = class PerformanceObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// localStorage mock (for Node environment)
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

// Set on global (Node environment)
if (typeof global !== "undefined") {
  Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(global, "sessionStorage", {
    value: localStorageMock,
    writable: true,
  });
}

// ============================================
// NEXT.JS API MOCKS
// ============================================

Object.defineProperty(global, "Request", {
  writable: true,
  value: class Request {},
});

Object.defineProperty(global, "Response", {
  writable: true,
  value: class Response {},
});

// NextResponse mock
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init) => {
      const response = {
        status: init?.status || 200,
        headers: init?.headers || new Map(),
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        json: async () => data,
        text: async () => JSON.stringify(data),
      };
      return response;
    },
    redirect: (url, status = 302) => ({
      status,
      headers: new Map([["Location", url]]),
    }),
  },
  NextRequest: class NextRequest {
    constructor(url, init) {
      this.url = url;
      this.method = init?.method || "GET";
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
  },
}));

// Request class mock
global.Request = class Request {
  constructor(url, init) {
    this.url = url;
    this.method = init?.method || "GET";
    this.headers = init?.headers || {};
  }

  async json() {
    return {};
  }

  async text() {
    return "";
  }
};

// Response class mock
global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = init?.headers || {};
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }
};

// Headers class mock
global.Headers = class Headers {
  constructor(init) {
    this.map = new Map(init ? Object.entries(init) : []);
  }

  get(name) {
    return this.map.get(name);
  }

  set(name, value) {
    this.map.set(name, value);
  }

  has(name) {
    return this.map.has(name);
  }

  delete(name) {
    this.map.delete(name);
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

// URL class (if not available)
global.URL =
  global.URL ||
  class URL {
    constructor(url) {
      this.href = url;
    }
  };

// URLSearchParams class
global.URLSearchParams = global.URLSearchParams || class URLSearchParams {};

// FormData class
global.FormData = global.FormData || class FormData {};

// ============================================
// NOTE: DATABASE IS NOT MOCKED
// Integration tests use real Prisma client
// ============================================

console.log("✅ Integration tests will use REAL database");
console.log(
  "   Database URL:",
  process.env.DATABASE_URL?.substring(0, 50) + "...",
);

// ============================================
// CART SERVICE MOCK (still mocked for API tests)
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
    CartService: jest.fn(() => mockCartService),
  }),
  { virtual: true },
);

// ============================================
// LOGGER MOCKS
// ============================================

const createMockLogger = () => {
  const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    businessEvent: jest.fn(),
    child: jest.fn(() => logger),
  };
  return logger;
};

const mockLoggerInstance = createMockLogger();

jest.mock(
  "./src/lib/monitoring/logger",
  () => ({
    StructuredLogger: jest.fn(() => mockLoggerInstance),
    LoggerFactory: {
      getLogger: jest.fn(() => mockLoggerInstance),
      createRequestLogger: () => mockLoggerInstance,
    },
  }),
  { virtual: true },
);

// ============================================
// NEXT.JS NAVIGATION MOCKS
// ============================================

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: "/",
  query: {},
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    toString: jest.fn(() => ""),
  }),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// ============================================
// NEXT.JS HEADERS & COOKIES
// ============================================

const React = require("react");

jest.mock("next/headers", () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => new Map(),
}));

// ============================================
// NEXTAUTH MOCKS
// ============================================

jest.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: jest.fn(),
}));

const mockAuth = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "CUSTOMER",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

jest.mock("./src/lib/auth", () => ({
  handlers: { GET: jest.fn(), POST: jest.fn() },
  auth: jest.fn(() => Promise.resolve(mockAuth)),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Credentials provider
const mockProvider = {
  id: "credentials",
  name: "Credentials",
  type: "credentials",
  credentials: {},
  authorize: jest.fn(),
};

module.exports = {
  __esModule: true,
  default: mockProvider,
};

// Mock next-auth hooks
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: mockAuth,
    status: "authenticated",
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Note: Auth mocks removed for integration tests
// Auth should use real implementation in integration tests

// ============================================
// BCRYPT MOCK
// ============================================

jest.mock("bcryptjs", () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) =>
    Promise.resolve(hash === `hashed_${password}`),
  ),
  genSalt: jest.fn(() => Promise.resolve("$2a$10$salt")),
  hashSync: jest.fn((password) => `hashed_${password}`),
  compareSync: jest.fn((password, hash) => hash === `hashed_${password}`),
  genSaltSync: jest.fn(() => "$2a$10$salt"),
  getRounds: jest.fn(() => 10),
}));

// ============================================
// IMAGE PROCESSING MOCKS
// ============================================

const mockSharp = () => ({
  resize: jest.fn().mockReturnThis(),
  toFormat: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from("image")),
  toFile: jest.fn().mockResolvedValue({ size: 1024 }),
  metadata: jest.fn().mockResolvedValue({
    width: 800,
    height: 600,
    format: "jpeg",
  }),
  jpeg: jest.fn().mockReturnThis(),
  png: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
});

// Note: Sharp and Canvas mocks removed for integration tests
// These are optional dependencies and not needed for API integration tests

// ============================================
// UI LIBRARY MOCKS
// ============================================

// Note: UI library mocks removed for integration tests
// These are not needed for API integration tests

// ============================================
// AXIOS MOCK
// ============================================

// Note: Axios mock removed for integration tests
// Use real HTTP client if needed in integration tests

// ============================================
// UTILITY MOCKS
// ============================================
jest.mock("./src/lib/utils", () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(" ")),
  formatNumber: (num) => num?.toLocaleString() ?? "0",
  formatPrice: (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price ?? 0);
  },
  truncate: (str, length) => {
    return str?.length > length ? str.slice(0, length) + "..." : str;
  },
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  debounce: (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  },
  generateId: () =>
    `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
}));

// ============================================
// CONSOLE FILTERING
// ============================================

const originalConsole = {
  error: console.error,
  warn: console.warn,
};

// Filter out known warnings
console.error = (...args) => {
  const message = args[0]?.toString() || "";
  if (
    message.includes("Warning: ReactDOM.render") ||
    message.includes("Not implemented: HTMLFormElement.prototype.submit")
  ) {
    return;
  }
  originalConsole.error(...args);
};

console.warn = (...args) => {
  const message = args[0]?.toString() || "";
  if (message.includes("componentWillReceiveProps")) {
    return;
  }
  originalConsole.warn(...args);
};

// ============================================
// TEST DATA FACTORIES (for convenience)
// ============================================

global.mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  role: "CUSTOMER",
  createdAt: new Date(),
  updatedAt: new Date(),
};

global.mockFarm = {
  id: "test-farm-id",
  name: "Test Farm",
  description: "A test farm",
  location: "Test Location",
  ownerId: "test-user-id",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
};

global.mockProduct = {
  id: "test-product-id",
  name: "Test Product",
  description: "A test product",
  price: 10.99,
  farmId: "test-farm-id",
  category: "VEGETABLE",
  season: "SPRING",
  stock: 100,
  unit: "lb",
  available: true,
  purchaseCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

global.mockCartItem = {
  id: "test-cart-item-id",
  userId: "test-user-id",
  productId: "test-product-id",
  quantity: 2,
  addedAt: new Date(),
  reservedUntil: null,
  product: global.mockProduct,
};

global.mockCart = {
  items: [global.mockCartItem],
  get subtotal() {
    return this.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  },
  itemCount: 1,
  farmCount: 1,
};

global.mockAddress = {
  id: "test-address-id",
  userId: "test-user-id",
  type: "SHIPPING",
  street: "123 Test St",
  city: "Test City",
  state: "TS",
  zipCode: "12345",
  country: "US",
  createdAt: new Date(),
  updatedAt: new Date(),
};

global.mockOrder = {
  id: "test-order-id",
  orderNumber: "ORD-123456",
  customerId: "test-user-id",
  farmId: "test-farm-id",
  status: "PENDING",
  paymentStatus: "PENDING",
  fulfillmentMethod: "DELIVERY",
  subtotal: 21.98,
  deliveryFee: 5.0,
  tax: 2.2,
  platformFee: 1.0,
  discount: 0,
  total: 30.18,
  farmerAmount: 20.98,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
};

// ============================================
// REDIS CACHE MOCK (still mocked)
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

jest.mock(
  "./src/lib/cache",
  () => ({
    getRedisCache: jest.fn(() => mockRedisCache),
    checkRedisHealth: jest.fn(() => Promise.resolve(true)),
    RedisCacheService: jest.fn(() => mockRedisCache),
  }),
  { virtual: true },
);

// ============================================
// GLOBAL TEST UTILITIES
// ============================================

// Add matchMedia helper for tests that need it
global.setMatchMedia = (matches) => {
  matchMediaMock.matches = matches;
};

// ============================================
// TEST LIFECYCLE
// ============================================

beforeAll(() => {
  console.log("🚀 Starting integration test suite");
});

afterAll(async () => {
  console.log("✅ Integration test suite complete");
  // Database cleanup happens in individual tests or helpers
});

// ============================================
// END OF INTEGRATION TEST SETUP
// ============================================

console.log("✅ Integration test environment configured");
console.log("   - Real database operations enabled");
console.log("   - Test helpers will use actual Prisma client");
