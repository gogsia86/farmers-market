// 🗄️ INDEXEDDB UTILITIES - Offline Order Queue Management
// 📚 Reference: Service Worker offline support
// 🌾 Domain: Agricultural E-Commerce Offline-First
// ⚡ Performance: Fast local storage with IndexedDB

/**
 * IndexedDB Configuration
 */
const DB_NAME = "farmers-market-offline";
const DB_VERSION = 1;
const STORES = {
  PENDING_ORDERS: "pendingOrders",
  FAILED_REQUESTS: "failedRequests",
  CACHED_DATA: "cachedData",
};

/**
 * Initialize IndexedDB with proper schema
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("[IndexedDB] Failed to open database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create pending orders store
      if (!db.objectStoreNames.contains(STORES.PENDING_ORDERS)) {
        const ordersStore = db.createObjectStore(STORES.PENDING_ORDERS, {
          keyPath: "id",
          autoIncrement: true,
        });

        // Create indexes for efficient querying
        ordersStore.createIndex("timestamp", "timestamp", { unique: false });
        ordersStore.createIndex("status", "status", { unique: false });
        ordersStore.createIndex("customerId", "customerId", { unique: false });

        console.log("[IndexedDB] Created pending orders store");
      }

      // Create failed requests store
      if (!db.objectStoreNames.contains(STORES.FAILED_REQUESTS)) {
        const requestsStore = db.createObjectStore(STORES.FAILED_REQUESTS, {
          keyPath: "id",
          autoIncrement: true,
        });

        requestsStore.createIndex("timestamp", "timestamp", { unique: false });
        requestsStore.createIndex("url", "url", { unique: false });

        console.log("[IndexedDB] Created failed requests store");
      }

      // Create cached data store (for offline access)
      if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
        const cacheStore = db.createObjectStore(STORES.CACHED_DATA, {
          keyPath: "key",
        });

        cacheStore.createIndex("expiry", "expiry", { unique: false });

        console.log("[IndexedDB] Created cached data store");
      }
    };
  });
}

// =============================================================================
// PENDING ORDERS OPERATIONS
// =============================================================================

/**
 * Add a pending order to the offline queue
 * @param {Object} orderData - Order data to store
 * @returns {Promise<number>} - Generated order ID
 */
async function addPendingOrder(orderData) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_ORDERS], "readwrite");
    const store = transaction.objectStore(STORES.PENDING_ORDERS);

    const order = {
      ...orderData,
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
      createdOffline: true,
    };

    const request = store.add(order);

    request.onsuccess = () => {
      console.log("[IndexedDB] Order added to queue:", request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("[IndexedDB] Failed to add order:", request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all pending orders from the queue
 * @returns {Promise<Array>} - Array of pending orders
 */
async function getPendingOrders() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_ORDERS], "readonly");
    const store = transaction.objectStore(STORES.PENDING_ORDERS);
    const index = store.index("status");

    const request = index.getAll("pending");

    request.onsuccess = () => {
      console.log(
        "[IndexedDB] Retrieved pending orders:",
        request.result.length,
      );
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("[IndexedDB] Failed to get orders:", request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get a specific pending order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object|null>} - Order object or null
 */
async function getPendingOrderById(orderId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_ORDERS], "readonly");
    const store = transaction.objectStore(STORES.PENDING_ORDERS);

    const request = store.get(orderId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error("[IndexedDB] Failed to get order:", request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Update a pending order's status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
async function updateOrderStatus(orderId, status) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_ORDERS], "readwrite");
    const store = transaction.objectStore(STORES.PENDING_ORDERS);

    const getRequest = store.get(orderId);

    getRequest.onsuccess = () => {
      const order = getRequest.result;

      if (!order) {
        reject(new Error("Order not found"));
        return;
      }

      order.status = status;
      order.lastUpdated = Date.now();

      const updateRequest = store.put(order);

      updateRequest.onsuccess = () => {
        console.log("[IndexedDB] Order status updated:", orderId, status);
        resolve();
      };

      updateRequest.onerror = () => {
        console.error(
          "[IndexedDB] Failed to update order:",
          updateRequest.error,
        );
        reject(updateRequest.error);
      };
    };

    getRequest.onerror = () => {
      console.error("[IndexedDB] Failed to get order:", getRequest.error);
      reject(getRequest.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Increment retry count for a pending order
 * @param {number} orderId - Order ID
 * @returns {Promise<number>} - New retry count
 */
async function incrementRetryCount(orderId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_ORDERS], "readwrite");
    const store = transaction.objectStore(STORES.PENDING_ORDERS);

    const getRequest = store.get(orderId);

    getRequest.onsuccess = () => {
      const order = getRequest.result;

      if (!order) {
        reject(new Error("Order not found"));
        return;
      }

      order.retryCount = (order.retryCount || 0) + 1;
      order.lastRetry = Date.now();

      const updateRequest = store.put(order);

      updateRequest.onsuccess = () => {
        console.log(
          "[IndexedDB] Retry count incremented:",
          orderId,
          order.retryCount,
        );
        resolve(order.retryCount);
      };

      updateRequest.onerror = () => {
        reject(updateRequest.error);
      };
    };

    getRequest.onerror = () => {
      reject(getRequest.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Remove a pending order from the queue
 * @param {number} orderId - Order ID to remove
 * @returns {Promise<void>}
 */
async function removePendingOrder(orderId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_ORDERS], "readwrite");
    const store = transaction.objectStore(STORES.PENDING_ORDERS);

    const request = store.delete(orderId);

    request.onsuccess = () => {
      console.log("[IndexedDB] Order removed from queue:", orderId);
      resolve();
    };

    request.onerror = () => {
      console.error("[IndexedDB] Failed to remove order:", request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Clear all pending orders (use with caution)
 * @returns {Promise<void>}
 */
async function clearAllPendingOrders() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_ORDERS], "readwrite");
    const store = transaction.objectStore(STORES.PENDING_ORDERS);

    const request = store.clear();

    request.onsuccess = () => {
      console.log("[IndexedDB] All pending orders cleared");
      resolve();
    };

    request.onerror = () => {
      console.error("[IndexedDB] Failed to clear orders:", request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get count of pending orders
 * @returns {Promise<number>}
 */
async function getPendingOrderCount() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_ORDERS], "readonly");
    const store = transaction.objectStore(STORES.PENDING_ORDERS);
    const index = store.index("status");

    const request = index.count("pending");

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// =============================================================================
// FAILED REQUESTS OPERATIONS
// =============================================================================

/**
 * Save a failed request for later retry
 * @param {Object} requestData - Request data to store
 * @returns {Promise<number>}
 */
async function saveFailedRequest(requestData) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.FAILED_REQUESTS], "readwrite");
    const store = transaction.objectStore(STORES.FAILED_REQUESTS);

    const request = {
      ...requestData,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const addRequest = store.add(request);

    addRequest.onsuccess = () => {
      console.log("[IndexedDB] Failed request saved:", addRequest.result);
      resolve(addRequest.result);
    };

    addRequest.onerror = () => {
      reject(addRequest.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all failed requests
 * @returns {Promise<Array>}
 */
async function getFailedRequests() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.FAILED_REQUESTS], "readonly");
    const store = transaction.objectStore(STORES.FAILED_REQUESTS);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Remove a failed request
 * @param {number} requestId
 * @returns {Promise<void>}
 */
async function removeFailedRequest(requestId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.FAILED_REQUESTS], "readwrite");
    const store = transaction.objectStore(STORES.FAILED_REQUESTS);

    const request = store.delete(requestId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// =============================================================================
// CACHED DATA OPERATIONS
// =============================================================================

/**
 * Store data in cache with expiry
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<void>}
 */
async function setCachedData(key, data, ttl = 3600000) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_DATA], "readwrite");
    const store = transaction.objectStore(STORES.CACHED_DATA);

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };

    const request = store.put(cacheEntry);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get cached data by key
 * @param {string} key - Cache key
 * @returns {Promise<*|null>} - Cached data or null if expired/not found
 */
async function getCachedData(key) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_DATA], "readonly");
    const store = transaction.objectStore(STORES.CACHED_DATA);

    const request = store.get(key);

    request.onsuccess = () => {
      const entry = request.result;

      if (!entry) {
        resolve(null);
        return;
      }

      // Check if expired
      if (entry.expiry < Date.now()) {
        // Remove expired entry
        const deleteTransaction = db.transaction(
          [STORES.CACHED_DATA],
          "readwrite",
        );
        const deleteStore = deleteTransaction.objectStore(STORES.CACHED_DATA);
        deleteStore.delete(key);

        resolve(null);
        return;
      }

      resolve(entry.data);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Clear expired cache entries
 * @returns {Promise<number>} - Number of entries cleared
 */
async function clearExpiredCache() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_DATA], "readwrite");
    const store = transaction.objectStore(STORES.CACHED_DATA);
    const index = store.index("expiry");

    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);

    let count = 0;

    request.onsuccess = (event) => {
      const cursor = event.target.result;

      if (cursor) {
        cursor.delete();
        count++;
        cursor.continue();
      } else {
        console.log("[IndexedDB] Cleared expired cache entries:", count);
        resolve(count);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get database statistics
 * @returns {Promise<Object>}
 */
async function getDatabaseStats() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const stats = {
      pendingOrders: 0,
      failedRequests: 0,
      cachedEntries: 0,
    };

    let completed = 0;
    const total = 3;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        db.close();
        resolve(stats);
      }
    };

    // Count pending orders
    const ordersTx = db.transaction([STORES.PENDING_ORDERS], "readonly");
    const ordersStore = ordersTx.objectStore(STORES.PENDING_ORDERS);
    const ordersCount = ordersStore.count();
    ordersCount.onsuccess = () => {
      stats.pendingOrders = ordersCount.result;
      checkComplete();
    };
    ordersCount.onerror = reject;

    // Count failed requests
    const requestsTx = db.transaction([STORES.FAILED_REQUESTS], "readonly");
    const requestsStore = requestsTx.objectStore(STORES.FAILED_REQUESTS);
    const requestsCount = requestsStore.count();
    requestsCount.onsuccess = () => {
      stats.failedRequests = requestsCount.result;
      checkComplete();
    };
    requestsCount.onerror = reject;

    // Count cached entries
    const cacheTx = db.transaction([STORES.CACHED_DATA], "readonly");
    const cacheStore = cacheTx.objectStore(STORES.CACHED_DATA);
    const cacheCount = cacheStore.count();
    cacheCount.onsuccess = () => {
      stats.cachedEntries = cacheCount.result;
      checkComplete();
    };
    cacheCount.onerror = reject;
  });
}

/**
 * Clear all data from IndexedDB (use with caution)
 * @returns {Promise<void>}
 */
async function clearAllData() {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

    deleteRequest.onsuccess = () => {
      console.log("[IndexedDB] Database deleted successfully");
      resolve();
    };

    deleteRequest.onerror = () => {
      console.error(
        "[IndexedDB] Failed to delete database:",
        deleteRequest.error,
      );
      reject(deleteRequest.error);
    };

    deleteRequest.onblocked = () => {
      console.warn("[IndexedDB] Database deletion blocked");
    };
  });
}

// Export functions (for Service Worker use)
if (
  typeof self !== "undefined" &&
  self.constructor.name === "ServiceWorkerGlobalScope"
) {
  // Service Worker context
  self.dbUtils = {
    // Pending Orders
    addPendingOrder,
    getPendingOrders,
    getPendingOrderById,
    updateOrderStatus,
    incrementRetryCount,
    removePendingOrder,
    clearAllPendingOrders,
    getPendingOrderCount,

    // Failed Requests
    saveFailedRequest,
    getFailedRequests,
    removeFailedRequest,

    // Cached Data
    setCachedData,
    getCachedData,
    clearExpiredCache,

    // Utilities
    getDatabaseStats,
    clearAllData,
    openDatabase,
  };

  console.log("[IndexedDB] Database utilities loaded in Service Worker 🗄️");
}

// For testing in regular browser context
if (typeof window !== "undefined") {
  window.dbUtils = {
    addPendingOrder,
    getPendingOrders,
    getPendingOrderById,
    updateOrderStatus,
    incrementRetryCount,
    removePendingOrder,
    clearAllPendingOrders,
    getPendingOrderCount,
    saveFailedRequest,
    getFailedRequests,
    removeFailedRequest,
    setCachedData,
    getCachedData,
    clearExpiredCache,
    getDatabaseStats,
    clearAllData,
    openDatabase,
  };

  console.log("[IndexedDB] Database utilities loaded in browser context 🗄️");
}
