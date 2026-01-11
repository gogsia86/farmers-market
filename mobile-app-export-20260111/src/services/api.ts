/**
 * API Client Service for Farmers Market Mobile App
 *
 * This service handles all HTTP requests to the web platform API.
 * Features:
 * - Automatic token refresh
 * - Request/response interceptors
 * - Error handling
 * - Offline queue
 * - Request retry logic
 */

import NetInfo from "@react-native-community/netinfo";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Environment configuration
const API_BASE_URL = __DEV__
  ? Platform.OS === "android"
    ? "http://10.0.2.2:3001/api" // Android emulator
    : "http://localhost:3001/api" // iOS simulator
  : "https://farmersmarket.com/api"; // Production

// Token storage keys
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Request queue for offline support
interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

class APIClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];
  private offlineQueue: QueuedRequest[] = [];
  private isOnline = true;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "mobile",
        "X-Platform": Platform.OS,
        "X-App-Version": "1.0.0",
      },
    });

    this.setupInterceptors();
    this.setupNetworkListener();
  }

  /**
   * Setup network connectivity listener
   */
  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Process offline queue when coming back online
      if (wasOffline && this.isOnline && this.offlineQueue.length > 0) {
        this.processOfflineQueue();
      }
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Get stored token
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Check if offline for non-GET requests
        if (!this.isOnline && config.method !== "get") {
          return Promise.reject(new Error("OFFLINE"));
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle offline errors
        if (error.message === "OFFLINE") {
          return this.queueOfflineRequest(originalRequest);
        }

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                config: originalRequest,
                resolve,
                reject,
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              this.processQueue(null);
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            await this.clearTokens();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(this.axiosInstance(promise.config));
      }
    });
    this.failedQueue = [];
  }

  /**
   * Queue request for offline processing
   */
  private queueOfflineRequest(config: AxiosRequestConfig): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({ config, resolve, reject });
    });
  }

  /**
   * Process offline queue when back online
   */
  private async processOfflineQueue() {
    console.log(`Processing ${this.offlineQueue.length} offline requests`);

    while (this.offlineQueue.length > 0) {
      const request = this.offlineQueue.shift();
      if (request) {
        try {
          const response = await this.axiosInstance(request.config);
          request.resolve(response);
        } catch (error) {
          request.reject(error);
        }
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      await this.setToken(accessToken);
      if (newRefreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
      }

      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  /**
   * Handle API errors and format them
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as Record<string, unknown>;
      return {
        message: (data?.message as string) || "An error occurred",
        statusCode: error.response.status,
        errors: (data?.errors as string[]) || [],
        code: data?.code as string | undefined,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: "Network error. Please check your connection.",
        statusCode: 0,
        code: "NETWORK_ERROR",
      };
    } else {
      // Error in request setup
      return {
        message: error.message || "An unexpected error occurred",
        statusCode: 0,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  /**
   * Get stored auth token
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  /**
   * Set auth token
   */
  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error setting token:", error);
    }
  }

  /**
   * Set refresh token
   */
  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error("Error setting refresh token:", error);
    }
  }

  /**
   * Clear all tokens (logout)
   */
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // ===================
  // API Methods
  // ===================

  /**
   * Authentication endpoints
   */
  auth = {
    login: async (email: string, password: string) => {
      const response = await this.axiosInstance.post("/auth/login", {
        email,
        password,
      });
      const { accessToken, refreshToken, user } = response.data;
      await this.setToken(accessToken);
      await this.setRefreshToken(refreshToken);
      return { user, accessToken };
    },

    register: async (data: RegisterData) => {
      const response = await this.axiosInstance.post("/auth/register", data);
      const { accessToken, refreshToken, user } = response.data;
      await this.setToken(accessToken);
      await this.setRefreshToken(refreshToken);
      return { user, accessToken };
    },

    logout: async () => {
      try {
        await this.axiosInstance.post("/auth/logout");
      } finally {
        await this.clearTokens();
      }
    },

    forgotPassword: async (email: string) => {
      const response = await this.axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    },

    resetPassword: async (token: string, password: string) => {
      const response = await this.axiosInstance.post("/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    },

    getCurrentUser: async () => {
      const response = await this.axiosInstance.get("/auth/me");
      return response.data;
    },
  };

  /**
   * Products endpoints
   */
  products = {
    getAll: async (params?: ProductQueryParams) => {
      const response = await this.axiosInstance.get("/products", { params });
      return response.data;
    },

    getById: async (id: string) => {
      const response = await this.axiosInstance.get(`/products/${id}`);
      return response.data;
    },

    search: async (query: string, filters?: ProductFilters) => {
      const response = await this.axiosInstance.get("/products/search", {
        params: { q: query, ...filters },
      });
      return response.data;
    },

    getByCategory: async (category: string, params?: ProductQueryParams) => {
      const response = await this.axiosInstance.get(
        `/products/category/${category}`,
        {
          params,
        },
      );
      return response.data;
    },

    getFeatured: async () => {
      const response = await this.axiosInstance.get("/products/featured");
      return response.data;
    },

    create: async (data: CreateProductData) => {
      const response = await this.axiosInstance.post("/products", data);
      return response.data;
    },

    update: async (id: string, data: UpdateProductData) => {
      const response = await this.axiosInstance.put(`/products/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await this.axiosInstance.delete(`/products/${id}`);
      return response.data;
    },
  };

  /**
   * Farms endpoints
   */
  farms = {
    getAll: async (params?: FarmQueryParams) => {
      const response = await this.axiosInstance.get("/farms", { params });
      return response.data;
    },

    getById: async (id: string) => {
      const response = await this.axiosInstance.get(`/farms/${id}`);
      return response.data;
    },

    getNearby: async (
      latitude: number,
      longitude: number,
      radius: number = 50,
    ) => {
      const response = await this.axiosInstance.get("/farms/nearby", {
        params: { lat: latitude, lng: longitude, radius },
      });
      return response.data;
    },

    search: async (query: string) => {
      const response = await this.axiosInstance.get("/farms/search", {
        params: { q: query },
      });
      return response.data;
    },

    getMyFarm: async () => {
      const response = await this.axiosInstance.get("/farms/me");
      return response.data;
    },

    create: async (data: CreateFarmData) => {
      const response = await this.axiosInstance.post("/farms", data);
      return response.data;
    },

    update: async (id: string, data: UpdateFarmData) => {
      const response = await this.axiosInstance.put(`/farms/${id}`, data);
      return response.data;
    },
  };

  /**
   * Cart endpoints
   */
  cart = {
    get: async () => {
      const response = await this.axiosInstance.get("/cart");
      return response.data;
    },

    add: async (productId: string, quantity: number, farmId?: string) => {
      const response = await this.axiosInstance.post("/cart", {
        productId,
        quantity,
        farmId,
      });
      return response.data;
    },

    update: async (itemId: string, quantity: number) => {
      const response = await this.axiosInstance.put(`/cart/${itemId}`, {
        quantity,
      });
      return response.data;
    },

    remove: async (itemId: string) => {
      const response = await this.axiosInstance.delete(`/cart/${itemId}`);
      return response.data;
    },

    clear: async () => {
      const response = await this.axiosInstance.delete("/cart");
      return response.data;
    },

    /**
     * Sync local cart with server cart on login
     * Merges items based on strategy (default: sum quantities)
     */
    sync: async (localItems: CartSyncItem[], strategy?: CartMergeStrategy) => {
      const response = await this.axiosInstance.post("/cart/sync", {
        localItems,
        strategy,
      });
      return response.data;
    },

    /**
     * Validate cart items are still available and in stock
     * Returns validation results and any auto-adjustments made
     */
    validate: async () => {
      const response = await this.axiosInstance.get("/cart/validate");
      return response.data;
    },

    /**
     * Refresh cart item reservations to prevent expiry
     */
    refreshReservations: async () => {
      const response = await this.axiosInstance.post(
        "/cart/refresh-reservations",
      );
      return response.data;
    },
  };

  /**
   * Orders endpoints
   */
  orders = {
    getAll: async (params?: OrderQueryParams) => {
      const response = await this.axiosInstance.get("/orders", { params });
      return response.data;
    },

    getById: async (id: string) => {
      const response = await this.axiosInstance.get(`/orders/${id}`);
      return response.data;
    },

    create: async (data: CreateOrderData) => {
      const response = await this.axiosInstance.post("/orders", data);
      return response.data;
    },

    cancel: async (id: string) => {
      const response = await this.axiosInstance.post(`/orders/${id}/cancel`);
      return response.data;
    },

    track: async (id: string) => {
      const response = await this.axiosInstance.get(`/orders/${id}/track`);
      return response.data;
    },

    updateStatus: async (id: string, status: string) => {
      const response = await this.axiosInstance.put(`/orders/${id}/status`, {
        status,
      });
      return response.data;
    },
  };

  /**
   * Payments endpoints
   * Integrates with Stripe via server-side payment intent creation
   */
  payments = {
    /**
     * Create a payment intent for the given amount
     * @param amount - Amount in cents (e.g., 1000 = $10.00)
     * @param currency - Currency code (default: 'usd')
     * @param metadata - Optional metadata for the payment
     */
    createPaymentIntent: async (
      amount: number,
      currency: string = "usd",
      metadata?: Record<string, string>,
    ) => {
      const response = await this.axiosInstance.post(
        "/checkout/create-payment-intent",
        {
          amount,
          currency,
          metadata,
        },
      );
      return response.data;
    },

    /**
     * Confirm a payment with optional payment method
     */
    confirmPayment: async (
      paymentIntentId: string,
      paymentMethodId?: string,
    ) => {
      const response = await this.axiosInstance.post("/payments/confirm", {
        paymentIntentId,
        paymentMethodId,
      });
      return response.data;
    },

    /**
     * Get saved payment methods for the current user
     */
    getPaymentMethods: async () => {
      const response = await this.axiosInstance.get("/payments/methods");
      return response.data;
    },

    /**
     * Add a new payment method to the user's account
     */
    addPaymentMethod: async (paymentMethodId: string) => {
      const response = await this.axiosInstance.post("/payments/methods", {
        paymentMethodId,
      });
      return response.data;
    },

    /**
     * Remove a saved payment method
     */
    removePaymentMethod: async (id: string) => {
      const response = await this.axiosInstance.delete(
        `/payments/methods/${id}`,
      );
      return response.data;
    },

    /**
     * Set a payment method as the default
     */
    setDefaultPaymentMethod: async (paymentMethodId: string) => {
      const response = await this.axiosInstance.put(
        `/payments/methods/${paymentMethodId}/default`,
      );
      return response.data;
    },

    /**
     * Get customer's Stripe ephemeral key (for Payment Sheet)
     */
    getEphemeralKey: async () => {
      const response = await this.axiosInstance.get("/payments/ephemeral-key");
      return response.data;
    },

    /**
     * Create a setup intent for saving cards without immediate payment
     */
    createSetupIntent: async () => {
      const response = await this.axiosInstance.post("/payments/setup-intent");
      return response.data;
    },
  };

  /**
   * Reviews endpoints
   */
  reviews = {
    getByProduct: async (productId: string) => {
      const response = await this.axiosInstance.get(
        `/products/${productId}/reviews`,
      );
      return response.data;
    },

    getByFarm: async (farmId: string) => {
      const response = await this.axiosInstance.get(`/farms/${farmId}/reviews`);
      return response.data;
    },

    create: async (data: CreateReviewData) => {
      const response = await this.axiosInstance.post("/reviews", data);
      return response.data;
    },

    update: async (id: string, data: UpdateReviewData) => {
      const response = await this.axiosInstance.put(`/reviews/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await this.axiosInstance.delete(`/reviews/${id}`);
      return response.data;
    },
  };

  /**
   * User profile endpoints
   */
  user = {
    getProfile: async () => {
      const response = await this.axiosInstance.get("/users/me");
      return response.data;
    },

    updateProfile: async (data: UpdateProfileData) => {
      const response = await this.axiosInstance.put("/users/me", data);
      return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      const response = await this.axiosInstance.put("/users/me/password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    },

    uploadAvatar: async (imageUri: string) => {
      const formData = new FormData();
      // React Native FormData requires this format for file uploads
      formData.append("avatar", {
        uri: imageUri,
        type: "image/jpeg",
        name: "avatar.jpg",
      } as unknown as Blob);

      const response = await this.axiosInstance.post(
        "/users/me/avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },

    getAddresses: async () => {
      const response = await this.axiosInstance.get("/users/me/addresses");
      return response.data;
    },

    addAddress: async (data: AddressData) => {
      const response = await this.axiosInstance.post(
        "/users/me/addresses",
        data,
      );
      return response.data;
    },

    updateAddress: async (id: string, data: AddressData) => {
      const response = await this.axiosInstance.put(
        `/users/me/addresses/${id}`,
        data,
      );
      return response.data;
    },

    deleteAddress: async (id: string) => {
      const response = await this.axiosInstance.delete(
        `/users/me/addresses/${id}`,
      );
      return response.data;
    },
  };

  /**
   * Notifications endpoints
   */
  notifications = {
    getAll: async () => {
      const response = await this.axiosInstance.get("/notifications");
      return response.data;
    },

    markAsRead: async (id: string) => {
      const response = await this.axiosInstance.put(
        `/notifications/${id}/read`,
      );
      return response.data;
    },

    markAllAsRead: async () => {
      const response = await this.axiosInstance.put("/notifications/read-all");
      return response.data;
    },

    updatePushToken: async (token: string) => {
      const response = await this.axiosInstance.post(
        "/notifications/push-token",
        {
          token,
          platform: Platform.OS,
        },
      );
      return response.data;
    },

    getPreferences: async () => {
      const response = await this.axiosInstance.get(
        "/notifications/preferences",
      );
      return response.data;
    },

    updatePreferences: async (preferences: NotificationPreferences) => {
      const response = await this.axiosInstance.put(
        "/notifications/preferences",
        preferences,
      );
      return response.data;
    },
  };

  /**
   * Analytics endpoints
   */
  analytics = {
    getSalesSummary: async (period: "day" | "week" | "month" | "year") => {
      const response = await this.axiosInstance.get("/analytics/sales", {
        params: { period },
      });
      return response.data;
    },

    getTopProducts: async (limit: number = 10) => {
      const response = await this.axiosInstance.get("/analytics/products/top", {
        params: { limit },
      });
      return response.data;
    },

    getOrderStats: async () => {
      const response = await this.axiosInstance.get("/analytics/orders");
      return response.data;
    },
  };

  /**
   * Upload file (images, etc.)
   */
  upload = {
    image: async (imageUri: string, folder: string = "products") => {
      const formData = new FormData();

      const filename = imageUri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // React Native FormData requires this format for file uploads
      formData.append("file", {
        uri: imageUri,
        type,
        name: filename,
      } as unknown as Blob);

      formData.append("folder", folder);

      const response = await this.axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for upload
      });

      return response.data;
    },
  };
}

// ===================
// Type Definitions
// ===================

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  errors?: string[];
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "CUSTOMER" | "FARMER";
  phone?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  farmId?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  farmId?: string;
  inStock?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
  images: string[];
  farmId: string;
}

export interface UpdateProductData extends Partial<CreateProductData> { }

export interface FarmQueryParams {
  page?: number;
  limit?: number;
  verified?: boolean;
  search?: string;
}

export interface CreateFarmData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
}

export interface UpdateFarmData extends Partial<CreateFarmData> { }

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface CartSyncItem {
  productId: string;
  quantity: number;
  farmId?: string;
}

export interface CartMergeStrategy {
  /** How to handle items that exist in both local and server cart */
  conflictResolution: "local" | "server" | "sum" | "max";
  /** Whether to clear local cart after merge */
  clearLocalAfterMerge: boolean;
}

export interface CartValidationResult {
  valid: boolean;
  cart: {
    items: CartItemWithProduct[];
    totals: CartTotals;
  };
  validation: {
    validItemCount: number;
    issueCount: number;
    hasAdjustments: boolean;
    hasRemovals: boolean;
    issues: CartValidationIssue[];
  };
  recommendations: CartRecommendation[];
}

export interface CartItemWithProduct {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  unit: string;
  farmId: string;
  farmName: string;
  stock: number;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface CartValidationIssue {
  itemId: string;
  productId: string;
  issue: "out_of_stock" | "insufficient_stock" | "product_unavailable";
  available?: number;
}

export interface CartRecommendation {
  type: "warning" | "error" | "info";
  message: string;
  action?: string;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddressId: string;
  paymentMethodId: string;
  notes?: string;
}

export interface CreateReviewData {
  productId?: string;
  farmId?: string;
  rating: number;
  comment: string;
  orderId: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface AddressData {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  newProducts: boolean;
  promotions: boolean;
  farmNews: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Create and export singleton instance
const apiClient = new APIClient();
export default apiClient;
