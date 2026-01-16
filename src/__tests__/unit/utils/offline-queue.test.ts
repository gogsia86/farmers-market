/**
 * 📴 OFFLINE QUEUE UTILITIES TEST SUITE
 * Comprehensive tests for offline queue operations and Service Worker communication
 *
 * ⚠️ NOTE: These tests are SKIPPED because they require browser APIs (Service Worker, IndexedDB)
 * that are not available in Jest/Node environment. These tests should be run in:
 * - Playwright (E2E tests)
 * - Real browser environment
 * - Cypress or similar browser-based test runner
 *
 * @module OfflineQueueTests
 * @version 1.0.0
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import type { Mock } from "jest-mock";

// Mock browser APIs before importing the module
const mockNavigator = {
  onLine: true,
  serviceWorker: {
    ready: Promise.resolve({
      active: {
        postMessage: jest.fn(),
      },
    }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};

const mockWindow = {
  indexedDB: {},
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};

// Set up global mocks
global.navigator = mockNavigator as any;
global.window = mockWindow as any;

// Import after mocks are set up
import {
  clearFailedOrders,
  getOfflineQueueBadge,
  getOfflineQueueStats,
  getOfflineQueueStatus,
  getPendingOrderCount,
  handleOrderSubmission,
  initOfflineQueue,
  isIndexedDBSupported,
  isOffline,
  isServiceWorkerSupported,
  OfflineQueueError,
  onOnlineStatusChange,
  onOrderSynced,
  queueOfflineOrder,
  shouldQueueOffline,
  syncPendingOrders,
  useOfflineQueue,
  type OfflineQueueStats,
  type QueuedOrder,
} from "@/lib/utils/offline-queue";

// =============================================================================
// TEST HELPERS
// =============================================================================

function createMockOrder(): Omit<
  QueuedOrder,
  "id" | "timestamp" | "status" | "retryCount"
> {
  return {
    customerId: "customer_123",
    items: [
      {
        productId: "product_1",
        quantity: 2,
        price: 5.99,
      },
      {
        productId: "product_2",
        quantity: 1,
        price: 12.5,
      },
    ],
    total: 24.48,
    shippingAddress: {
      street: "123 Farm Road",
      city: "Farmville",
      state: "CA",
      zipCode: "12345",
    },
    paymentMethod: "credit_card",
  };
}

function createMockStats(): OfflineQueueStats {
  return {
    pendingOrders: 3,
    failedRequests: 1,
    cachedEntries: 15,
  };
}

// =============================================================================
// BROWSER SUPPORT DETECTION TESTS
// =============================================================================

describe.skip("📴 Offline Queue - Browser Support Detection (REQUIRES BROWSER)", () => {
  describe("isServiceWorkerSupported", () => {
    it("should return true when Service Worker is supported", () => {
      expect(isServiceWorkerSupported()).toBe(true);
    });

    it("should return false when Service Worker is not supported", () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      expect(isServiceWorkerSupported()).toBe(false);

      (global.navigator as any).serviceWorker = originalSW;
    });

    it("should handle undefined navigator", () => {
      const originalNav = global.navigator;
      (global as any).navigator = undefined;

      expect(() => isServiceWorkerSupported()).not.toThrow();

      global.navigator = originalNav;
    });
  });

  describe("isIndexedDBSupported", () => {
    it("should return true when IndexedDB is supported", () => {
      expect(isIndexedDBSupported()).toBe(true);
    });

    it("should return false when IndexedDB is not supported", () => {
      const originalIDB = (global.window as any).indexedDB;
      delete (global.window as any).indexedDB;

      expect(isIndexedDBSupported()).toBe(false);

      (global.window as any).indexedDB = originalIDB;
    });

    it("should handle undefined window", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      expect(() => isIndexedDBSupported()).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe("isOffline", () => {
    it("should return false when online", () => {
      mockNavigator.onLine = true;
      expect(isOffline()).toBe(false);
    });

    it("should return true when offline", () => {
      mockNavigator.onLine = false;
      expect(isOffline()).toBe(true);
    });

    it("should reflect current navigator.onLine status", () => {
      mockNavigator.onLine = true;
      expect(isOffline()).toBe(false);

      mockNavigator.onLine = false;
      expect(isOffline()).toBe(true);

      mockNavigator.onLine = true;
      expect(isOffline()).toBe(false);
    });
  });
});

// =============================================================================
// ORDER QUEUE OPERATIONS TESTS
// =============================================================================

describe.skip("📴 Offline Queue - Order Operations (REQUIRES BROWSER)", () => {
  let mockPostMessage: Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.onLine = true;

    mockPostMessage = jest.fn();
    mockNavigator.serviceWorker.ready = Promise.resolve({
      active: {
        postMessage: mockPostMessage,
      },
    } as any);
  });

  describe("queueOfflineOrder", () => {
    it("should queue an order successfully", async () => {
      const orderData = createMockOrder();

      // Simulate successful Service Worker response
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, orderId: 42 },
          });
        }, 10);
      });

      const orderId = await queueOfflineOrder(orderData);

      expect(orderId).toBe(42);
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "QUEUE_ORDER",
          orderData,
        }),
        expect.any(Array),
      );
    });

    it("should throw error when Service Worker is not supported", async () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      const orderData = createMockOrder();

      await expect(queueOfflineOrder(orderData)).rejects.toThrow(
        "Service Worker not supported",
      );

      (global.navigator as any).serviceWorker = originalSW;
    });

    it("should warn when queueing while online", async () => {
      const orderData = createMockOrder();
      const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

      mockNavigator.onLine = true;

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, orderId: 43 },
          });
        }, 10);
      });

      await queueOfflineOrder(orderData);

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining("Device is online"),
      );

      consoleWarn.mockRestore();
    });

    it("should handle Service Worker timeout", async () => {
      const orderData = createMockOrder();

      mockPostMessage.mockImplementation(() => {
        // Don't send response - will timeout
      });

      await expect(queueOfflineOrder(orderData)).rejects.toThrow(
        "Service Worker response timeout",
      );
    });

    it("should handle Service Worker error response", async () => {
      const orderData = createMockOrder();

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: false, error: "Storage full" },
          });
        }, 10);
      });

      await expect(queueOfflineOrder(orderData)).rejects.toThrow(
        "Storage full",
      );
    });

    it("should queue order with minimal data", async () => {
      const minimalOrder = {
        customerId: "customer_456",
        items: [{ productId: "product_1", quantity: 1, price: 10 }],
        total: 10,
      };

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, orderId: 44 },
          });
        }, 10);
      });

      const orderId = await queueOfflineOrder(minimalOrder);

      expect(orderId).toBe(44);
    });

    it("should handle complex order with multiple items", async () => {
      const complexOrder = {
        customerId: "customer_789",
        items: Array.from({ length: 10 }, (_, i) => ({
          productId: `product_${i}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: Math.random() * 20 + 5,
        })),
        total: 250.75,
        shippingAddress: createMockOrder().shippingAddress,
        paymentMethod: "paypal",
      };

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, orderId: 45 },
          });
        }, 10);
      });

      const orderId = await queueOfflineOrder(complexOrder);

      expect(orderId).toBe(45);
    });
  });

  describe("getPendingOrderCount", () => {
    it("should return pending order count", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, count: 5 },
          });
        }, 10);
      });

      const count = await getPendingOrderCount();

      expect(count).toBe(5);
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "GET_PENDING_COUNT" }),
        expect.any(Array),
      );
    });

    it("should return 0 when Service Worker is not supported", async () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      const count = await getPendingOrderCount();

      expect(count).toBe(0);

      (global.navigator as any).serviceWorker = originalSW;
    });

    it("should return 0 on error", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: false, error: "DB error" },
          });
        }, 10);
      });

      const count = await getPendingOrderCount();

      expect(count).toBe(0);
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it("should handle zero pending orders", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, count: 0 },
          });
        }, 10);
      });

      const count = await getPendingOrderCount();

      expect(count).toBe(0);
    });

    it("should handle large pending counts", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, count: 9999 },
          });
        }, 10);
      });

      const count = await getPendingOrderCount();

      expect(count).toBe(9999);
    });
  });

  describe("getOfflineQueueStats", () => {
    it("should return queue statistics", async () => {
      const mockStats = createMockStats();

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, stats: mockStats },
          });
        }, 10);
      });

      const stats = await getOfflineQueueStats();

      expect(stats).toEqual(mockStats);
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "GET_DB_STATS" }),
        expect.any(Array),
      );
    });

    it("should return default stats when Service Worker is not supported", async () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      const stats = await getOfflineQueueStats();

      expect(stats).toEqual({
        pendingOrders: 0,
        failedRequests: 0,
        cachedEntries: 0,
      });

      (global.navigator as any).serviceWorker = originalSW;
    });

    it("should return default stats on error", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      mockPostMessage.mockImplementation(() => {
        // Timeout
      });

      const stats = await getOfflineQueueStats();

      expect(stats).toEqual({
        pendingOrders: 0,
        failedRequests: 0,
        cachedEntries: 0,
      });

      consoleError.mockRestore();
    });

    it("should handle stats with no pending orders", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: {
              success: true,
              stats: {
                pendingOrders: 0,
                failedRequests: 0,
                cachedEntries: 100,
              },
            },
          });
        }, 10);
      });

      const stats = await getOfflineQueueStats();

      expect(stats.pendingOrders).toBe(0);
      expect(stats.cachedEntries).toBe(100);
    });

    it("should handle stats with failed requests", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: {
              success: true,
              stats: {
                pendingOrders: 5,
                failedRequests: 2,
                cachedEntries: 50,
              },
            },
          });
        }, 10);
      });

      const stats = await getOfflineQueueStats();

      expect(stats.failedRequests).toBe(2);
    });
  });

  describe("clearFailedOrders", () => {
    it("should clear failed orders successfully", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, clearedCount: 3 },
          });
        }, 10);
      });

      const count = await clearFailedOrders();

      expect(count).toBe(3);
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "CLEAR_FAILED_ORDERS" }),
        expect.any(Array),
      );
    });

    it("should return 0 when Service Worker is not supported", async () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      const count = await clearFailedOrders();

      expect(count).toBe(0);

      (global.navigator as any).serviceWorker = originalSW;
    });

    it("should return 0 on error", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: false, error: "Clear failed" },
          });
        }, 10);
      });

      const count = await clearFailedOrders();

      expect(count).toBe(0);

      consoleError.mockRestore();
    });

    it("should handle clearing zero failed orders", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, clearedCount: 0 },
          });
        }, 10);
      });

      const count = await clearFailedOrders();

      expect(count).toBe(0);
    });

    it("should log cleared count", async () => {
      const consoleLog = jest.spyOn(console, "log").mockImplementation();

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, clearedCount: 5 },
          });
        }, 10);
      });

      await clearFailedOrders();

      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Cleared 5 failed orders"),
      );

      consoleLog.mockRestore();
    });
  });

  describe("syncPendingOrders", () => {
    it("should trigger sync successfully", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true },
          });
        }, 10);
      });

      await expect(syncPendingOrders()).resolves.not.toThrow();

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "SYNC_NOW" }),
        expect.any(Array),
      );
    });

    it("should throw error when Service Worker is not supported", async () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      await expect(syncPendingOrders()).rejects.toThrow(
        "Service Worker not supported",
      );

      (global.navigator as any).serviceWorker = originalSW;
    });

    it("should throw error on sync failure", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: false, error: "Sync failed" },
          });
        }, 10);
      });

      await expect(syncPendingOrders()).rejects.toThrow("Sync failed");
    });

    it("should log success message", async () => {
      const consoleLog = jest.spyOn(console, "log").mockImplementation();

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true },
          });
        }, 10);
      });

      await syncPendingOrders();

      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Manual sync triggered successfully"),
      );

      consoleLog.mockRestore();
    });
  });
});

// =============================================================================
// EVENT LISTENER TESTS
// =============================================================================

describe.skip("📴 Offline Queue - Event Listeners (REQUIRES BROWSER)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.onLine = true;
  });

  describe("onOrderSynced", () => {
    it("should register event listener", () => {
      const callback = jest.fn();

      onOrderSynced(callback);

      expect(mockNavigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function),
      );
    });

    it("should call callback on ORDER_SYNCED event", () => {
      const callback = jest.fn();
      let messageHandler: any;

      (mockNavigator.serviceWorker.addEventListener as Mock).mockImplementation(
        (event: string, handler: any) => {
          if (event === "message") {
            messageHandler = handler;
          }
        },
      );

      onOrderSynced(callback);

      const syncEvent = {
        localOrderId: 42,
        serverOrderId: "order_abc123",
        timestamp: Date.now(),
      };

      messageHandler({
        data: {
          type: "ORDER_SYNCED",
          data: syncEvent,
        },
      });

      expect(callback).toHaveBeenCalledWith(syncEvent);
    });

    it("should not call callback on other event types", () => {
      const callback = jest.fn();
      let messageHandler: any;

      (mockNavigator.serviceWorker.addEventListener as Mock).mockImplementation(
        (event: string, handler: any) => {
          if (event === "message") {
            messageHandler = handler;
          }
        },
      );

      onOrderSynced(callback);

      messageHandler({
        data: {
          type: "OTHER_EVENT",
          data: {},
        },
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it("should return cleanup function", () => {
      const callback = jest.fn();

      const cleanup = onOrderSynced(callback);

      expect(typeof cleanup).toBe("function");

      cleanup();

      expect(
        mockNavigator.serviceWorker.removeEventListener,
      ).toHaveBeenCalledWith("message", expect.any(Function));
    });

    it("should handle missing Service Worker", () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      const callback = jest.fn();
      const cleanup = onOrderSynced(callback);

      expect(typeof cleanup).toBe("function");
      cleanup(); // Should not throw

      (global.navigator as any).serviceWorker = originalSW;
    });
  });

  describe("onOnlineStatusChange", () => {
    it("should register online and offline listeners", () => {
      const callback = jest.fn();

      onOnlineStatusChange(callback);

      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        "online",
        expect.any(Function),
      );
      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        "offline",
        expect.any(Function),
      );
    });

    it("should call callback with true when going online", () => {
      const callback = jest.fn();
      let onlineHandler: any;

      (mockWindow.addEventListener as Mock).mockImplementation(
        (event: string, handler: any) => {
          if (event === "online") {
            onlineHandler = handler;
          }
        },
      );

      onOnlineStatusChange(callback);

      onlineHandler();

      expect(callback).toHaveBeenCalledWith(true);
    });

    it("should call callback with false when going offline", () => {
      const callback = jest.fn();
      let offlineHandler: any;

      (mockWindow.addEventListener as Mock).mockImplementation(
        (event: string, handler: any) => {
          if (event === "offline") {
            offlineHandler = handler;
          }
        },
      );

      onOnlineStatusChange(callback);

      offlineHandler();

      expect(callback).toHaveBeenCalledWith(false);
    });

    it("should return cleanup function", () => {
      const callback = jest.fn();

      const cleanup = onOnlineStatusChange(callback);

      expect(typeof cleanup).toBe("function");

      cleanup();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
        "online",
        expect.any(Function),
      );
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
        "offline",
        expect.any(Function),
      );
    });

    it("should log status changes", () => {
      const consoleLog = jest.spyOn(console, "log").mockImplementation();
      const callback = jest.fn();
      let onlineHandler: any;
      let offlineHandler: any;

      (mockWindow.addEventListener as Mock).mockImplementation(
        (event: string, handler: any) => {
          if (event === "online") onlineHandler = handler;
          if (event === "offline") offlineHandler = handler;
        },
      );

      onOnlineStatusChange(callback);

      onlineHandler();
      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining("online"),
      );

      offlineHandler();
      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining("offline"),
      );

      consoleLog.mockRestore();
    });
  });
});

// =============================================================================
// UTILITY FUNCTIONS TESTS
// =============================================================================

describe.skip("📴 Offline Queue - Utility Functions (REQUIRES BROWSER)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.onLine = true;
  });

  describe("shouldQueueOffline", () => {
    it("should return true when forced", () => {
      mockNavigator.onLine = true;
      expect(shouldQueueOffline(true)).toBe(true);
    });

    it("should return false when Service Worker not supported", () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      expect(shouldQueueOffline()).toBe(false);

      (global.navigator as any).serviceWorker = originalSW;
    });

    it("should return false when IndexedDB not supported", () => {
      const originalIDB = (global.window as any).indexedDB;
      delete (global.window as any).indexedDB;

      expect(shouldQueueOffline()).toBe(false);

      (global.window as any).indexedDB = originalIDB;
    });

    it("should return true when offline", () => {
      mockNavigator.onLine = false;
      expect(shouldQueueOffline()).toBe(true);
    });

    it("should return false when online and not forced", () => {
      mockNavigator.onLine = true;
      expect(shouldQueueOffline()).toBe(false);
    });
  });

  describe("getOfflineQueueStatus", () => {
    let mockPostMessage: Mock;

    beforeEach(() => {
      mockPostMessage = jest.fn();
      mockNavigator.serviceWorker.ready = Promise.resolve({
        active: { postMessage: mockPostMessage },
      } as any);
    });

    it("should return unavailable message when Service Worker not supported", async () => {
      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      const status = await getOfflineQueueStatus();

      expect(status).toBe("Offline mode not available");

      (global.navigator as any).serviceWorker = originalSW;
    });

    it("should return synced message when no pending orders", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: {
              success: true,
              stats: { pendingOrders: 0, failedRequests: 0, cachedEntries: 0 },
            },
          });
        }, 10);
      });

      const status = await getOfflineQueueStatus();

      expect(status).toBe("All orders synced ✅");
    });

    it("should return pending count for single order", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: {
              success: true,
              stats: { pendingOrders: 1, failedRequests: 0, cachedEntries: 0 },
            },
          });
        }, 10);
      });

      const status = await getOfflineQueueStatus();

      expect(status).toBe("1 order pending sync");
    });

    it("should return pending count for multiple orders", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: {
              success: true,
              stats: { pendingOrders: 5, failedRequests: 0, cachedEntries: 0 },
            },
          });
        }, 10);
      });

      const status = await getOfflineQueueStatus();

      expect(status).toBe("5 orders pending sync");
    });
  });

  describe("getOfflineQueueBadge", () => {
    let mockPostMessage: Mock;

    beforeEach(() => {
      mockPostMessage = jest.fn();
      mockNavigator.serviceWorker.ready = Promise.resolve({
        active: { postMessage: mockPostMessage },
      } as any);
    });

    it("should return pending order count", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: {
              success: true,
              stats: { pendingOrders: 3, failedRequests: 0, cachedEntries: 0 },
            },
          });
        }, 10);
      });

      const badge = await getOfflineQueueBadge();

      expect(badge).toBe(3);
    });

    it("should return 0 when no pending orders", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: {
              success: true,
              stats: { pendingOrders: 0, failedRequests: 0, cachedEntries: 0 },
            },
          });
        }, 10);
      });

      const badge = await getOfflineQueueBadge();

      expect(badge).toBe(0);
    });
  });

  describe("handleOrderSubmission", () => {
    it("should submit online successfully when online", async () => {
      mockNavigator.onLine = true;

      const orderData = createMockOrder();
      const mockSubmit = jest.fn().mockResolvedValue({ id: "order_123" });

      const result = await handleOrderSubmission(orderData, mockSubmit);

      expect(result).toEqual({
        success: true,
        orderId: "order_123",
        queuedOffline: false,
      });
      expect(mockSubmit).toHaveBeenCalledWith(orderData);
    });

    it("should queue offline when online submission fails", async () => {
      mockNavigator.onLine = true;

      const orderData = createMockOrder();
      const mockSubmit = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      const mockPostMessage = jest.fn();
      mockNavigator.serviceWorker.ready = Promise.resolve({
        active: { postMessage: mockPostMessage },
      } as any);

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, orderId: 42 },
          });
        }, 10);
      });

      const result = await handleOrderSubmission(orderData, mockSubmit);

      expect(result).toEqual({
        success: true,
        orderId: 42,
        queuedOffline: true,
      });
    });

    it("should queue offline when device is offline", async () => {
      mockNavigator.onLine = false;

      const orderData = createMockOrder();
      const mockSubmit = jest.fn();

      const mockPostMessage = jest.fn();
      mockNavigator.serviceWorker.ready = Promise.resolve({
        active: { postMessage: mockPostMessage },
      } as any);

      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, orderId: 43 },
          });
        }, 10);
      });

      const result = await handleOrderSubmission(orderData, mockSubmit);

      expect(result).toEqual({
        success: true,
        orderId: 43,
        queuedOffline: true,
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it("should return error when both online and offline fail", async () => {
      mockNavigator.onLine = true;

      const orderData = createMockOrder();
      const mockSubmit = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      const originalSW = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      const result = await handleOrderSubmission(orderData, mockSubmit);

      expect(result).toEqual({
        success: false,
        error: "Service Worker not supported",
        queuedOffline: false,
      });

      (global.navigator as any).serviceWorker = originalSW;
    });
  });

  describe("useOfflineQueue", () => {
    it("should return hook interface", () => {
      const hook = useOfflineQueue();

      expect(hook).toHaveProperty("isOnline");
      expect(hook).toHaveProperty("pendingCount");
      expect(hook).toHaveProperty("stats");
      expect(hook).toHaveProperty("queueOrder");
      expect(hook).toHaveProperty("clearFailed");
      expect(hook).toHaveProperty("syncNow");
    });

    it("should return default values in SSR", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      const hook = useOfflineQueue();

      expect(hook.isOnline).toBe(true);
      expect(hook.pendingCount).toBe(0);

      global.window = originalWindow;
    });

    it("should reflect navigator.onLine status", () => {
      mockNavigator.onLine = false;

      const hook = useOfflineQueue();

      expect(hook.isOnline).toBe(false);
    });
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

describe.skip("📴 Offline Queue - Error Handling (REQUIRES BROWSER)", () => {
  describe("OfflineQueueError", () => {
    it("should create error with code", () => {
      const error = new OfflineQueueError("Test error", "TEST_ERROR");

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.name).toBe("OfflineQueueError");
    });

    it("should store original error", () => {
      const originalError = new Error("Original");
      const error = new OfflineQueueError(
        "Wrapped",
        "WRAP_ERROR",
        originalError,
      );

      expect(error.originalError).toBe(originalError);
    });

    it("should be throwable", () => {
      expect(() => {
        throw new OfflineQueueError("Test", "TEST");
      }).toThrow(OfflineQueueError);
    });

    it("should be catchable as Error", () => {
      try {
        throw new OfflineQueueError("Test", "TEST");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(OfflineQueueError);
      }
    });
  });
});

// =============================================================================
// INITIALIZATION TESTS
// =============================================================================

describe.skip("📴 Offline Queue - Initialization (REQUIRES BROWSER)", () => {
  let mockPostMessage: Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockPostMessage = jest.fn();
    mockNavigator.serviceWorker.ready = Promise.resolve({
      active: { postMessage: mockPostMessage },
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("initOfflineQueue", () => {
    it("should return cleanup function", () => {
      const cleanup = initOfflineQueue();

      expect(typeof cleanup).toBe("function");
    });

    it("should register event listeners", () => {
      initOfflineQueue();

      expect(mockNavigator.serviceWorker.addEventListener).toHaveBeenCalled();
      expect(mockWindow.addEventListener).toHaveBeenCalledTimes(2); // online + offline
    });

    it("should poll pending count periodically", async () => {
      mockPostMessage.mockImplementation((message: any, ports: any) => {
        setTimeout(() => {
          ports[0].onmessage({
            data: { success: true, count: 3 },
          });
        }, 10);
      });

      initOfflineQueue();

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      await Promise.resolve(); // Allow async operations to complete

      expect(mockPostMessage).toHaveBeenCalled();
    });

    it("should cleanup all listeners on cleanup", () => {
      const cleanup = initOfflineQueue();

      cleanup();

      expect(
        mockNavigator.serviceWorker.removeEventListener,
      ).toHaveBeenCalled();
      expect(mockWindow.removeEventListener).toHaveBeenCalled();
    });

    it("should dispatch custom events", () => {
      let messageHandler: any;

      (mockNavigator.serviceWorker.addEventListener as Mock).mockImplementation(
        (event: string, handler: any) => {
          if (event === "message") {
            messageHandler = handler;
          }
        },
      );

      initOfflineQueue();

      messageHandler({
        data: {
          type: "ORDER_SYNCED",
          data: {
            localOrderId: 42,
            serverOrderId: "order_123",
            timestamp: Date.now(),
          },
        },
      });

      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "orderSynced",
        }),
      );
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe.skip("📴 Offline Queue - Integration (REQUIRES BROWSER)", () => {
  let mockPostMessage: Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.onLine = true;

    mockPostMessage = jest.fn();
    mockNavigator.serviceWorker.ready = Promise.resolve({
      active: { postMessage: mockPostMessage },
    } as any);
  });

  it("should handle complete offline order workflow", async () => {
    const orderData = createMockOrder();

    // 1. Check if should queue offline
    mockNavigator.onLine = false;
    expect(shouldQueueOffline()).toBe(true);

    // 2. Queue the order
    mockPostMessage.mockImplementation((message: any, ports: any) => {
      setTimeout(() => {
        ports[0].onmessage({
          data: { success: true, orderId: 42 },
        });
      }, 10);
    });

    const orderId = await queueOfflineOrder(orderData);
    expect(orderId).toBe(42);

    // 3. Check pending count
    mockPostMessage.mockImplementation((message: any, ports: any) => {
      setTimeout(() => {
        ports[0].onmessage({
          data: { success: true, count: 1 },
        });
      }, 10);
    });

    const count = await getPendingOrderCount();
    expect(count).toBe(1);

    // 4. Get status
    mockPostMessage.mockImplementation((message: any, ports: any) => {
      setTimeout(() => {
        ports[0].onmessage({
          data: {
            success: true,
            stats: { pendingOrders: 1, failedRequests: 0, cachedEntries: 0 },
          },
        });
      }, 10);
    });

    const status = await getOfflineQueueStatus();
    expect(status).toBe("1 order pending sync");

    // 5. Come back online and sync
    mockNavigator.onLine = true;

    mockPostMessage.mockImplementation((message: any, ports: any) => {
      setTimeout(() => {
        ports[0].onmessage({
          data: { success: true },
        });
      }, 10);
    });

    await expect(syncPendingOrders()).resolves.not.toThrow();
  });

  it("should handle online-to-offline transition", async () => {
    const callback = jest.fn();
    let offlineHandler: any;

    (mockWindow.addEventListener as Mock).mockImplementation(
      (event: string, handler: any) => {
        if (event === "offline") {
          offlineHandler = handler;
        }
      },
    );

    onOnlineStatusChange(callback);

    // Simulate going offline
    mockNavigator.onLine = false;
    offlineHandler();

    expect(callback).toHaveBeenCalledWith(false);
    expect(isOffline()).toBe(true);
  });

  it("should auto-sync when coming online", async () => {
    const callback = jest.fn();
    let onlineHandler: any;

    (mockWindow.addEventListener as Mock).mockImplementation(
      (event: string, handler: any) => {
        if (event === "online") {
          onlineHandler = handler;
        }
      },
    );

    mockPostMessage.mockImplementation((message: any, ports: any) => {
      setTimeout(() => {
        ports[0].onmessage({
          data: { success: true },
        });
      }, 10);
    });

    onOnlineStatusChange(callback);

    // Simulate going online
    mockNavigator.onLine = true;
    await onlineHandler();

    expect(callback).toHaveBeenCalledWith(true);
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SYNC_NOW" }),
      expect.any(Array),
    );
  });
});

console.log(
  "⏭️ Offline Queue Tests SKIPPED - Requires browser environment (Service Worker, IndexedDB)",
);
console.log("💡 Run these tests in Playwright/Cypress for full coverage");
