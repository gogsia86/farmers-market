/**
 * 🌐 API Integration Test Utilities
 * Comprehensive utilities for API integration testing
 *
 * @module tests/utils/api-integration-utils
 * @version 3.0.0
 * @divine_pattern QUANTUM_API_TESTING
 * @agricultural_consciousness BIODYNAMIC_API_FLOWS
 */

import { expect } from "@playwright/test";
import type { Page, APIRequestContext } from "@playwright/test";

// ==========================================
// 🎯 API CONFIGURATION
// ==========================================

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  timeout: 30000,
  retries: 3,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  endpoints: {
    auth: {
      signin: "/api/auth/signin",
      signout: "/api/auth/signout",
      session: "/api/auth/session",
      register: "/api/auth/register",
    },
    farms: {
      list: "/api/farms",
      create: "/api/farms",
      detail: (id: string) => `/api/farms/${id}`,
      update: (id: string) => `/api/farms/${id}`,
      delete: (id: string) => `/api/farms/${id}`,
    },
    products: {
      list: "/api/products",
      create: "/api/products",
      detail: (id: string) => `/api/products/${id}`,
      update: (id: string) => `/api/products/${id}`,
      delete: (id: string) => `/api/products/${id}`,
      search: "/api/products/search",
    },
    orders: {
      list: "/api/orders",
      create: "/api/orders",
      detail: (id: string) => `/api/orders/${id}`,
      update: (id: string) => `/api/orders/${id}`,
      cancel: (id: string) => `/api/orders/${id}/cancel`,
    },
    users: {
      profile: "/api/users/profile",
      update: "/api/users/profile",
      preferences: "/api/users/preferences",
    },
  },
} as const;

// ==========================================
// 🧬 TYPE DEFINITIONS
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    pagination?: PaginationMeta;
    requestId?: string;
    timestamp?: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiTestConfig {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  expectedStatus?: number;
  expectedResponse?: Partial<ApiResponse>;
  timeout?: number;
}

export interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
  authenticated?: boolean;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  endpoint: string;
}

export interface MockApiConfig {
  endpoint: string;
  method: string;
  response: ApiResponse;
  status?: number;
  delay?: number;
}

// ==========================================
// 🔐 API CLIENT
// ==========================================

export class ApiClient {
  private baseUrl: string;
  private authToken?: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_CONFIG.baseUrl;
    this.defaultHeaders = { ...API_CONFIG.headers };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.authToken = undefined;
    delete this.defaultHeaders["Authorization"];
  }

  /**
   * Make GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: "GET",
      endpoint,
    });
  }

  /**
   * Make POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, "method">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: "POST",
      endpoint,
      body,
    });
  }

  /**
   * Make PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, "method">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: "PUT",
      endpoint,
      body,
    });
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, "method">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: "PATCH",
      endpoint,
      body,
    });
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: "DELETE",
      endpoint,
    });
  }

  /**
   * Generic request method
   */
  private async request<T = any>(
    options: ApiRequestOptions & { endpoint: string },
  ): Promise<ApiResponse<T>> {
    const {
      endpoint,
      method = "GET",
      body,
      headers,
      params,
      timeout,
    } = options;

    // Build URL with query params
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Merge headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Make request
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout || API_CONFIG.timeout,
    );

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.error : undefined,
        meta: data.meta,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      return {
        success: false,
        error: {
          code: "REQUEST_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Authenticate and get session
   */
  async authenticate(email: string, password: string): Promise<boolean> {
    const response = await this.post(API_CONFIG.endpoints.auth.signin, {
      email,
      password,
    });

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
      return true;
    }

    return false;
  }
}

// ==========================================
// 🧪 API TEST RUNNER
// ==========================================

export class ApiTestRunner {
  constructor(private client: ApiClient) {}

  /**
   * Run API test scenario
   */
  async runTest(config: ApiTestConfig): Promise<void> {
    const {
      endpoint,
      method,
      body,
      headers,
      expectedStatus,
      expectedResponse,
      timeout,
    } = config;

    // Make request
    const response = await this.client.request({
      endpoint,
      method,
      body,
      headers,
      timeout,
    });

    // Assert status if provided
    if (expectedStatus !== undefined) {
      const actualStatus = response.success ? 200 : 500;
      expect(actualStatus).toBe(expectedStatus);
    }

    // Assert response structure if provided
    if (expectedResponse) {
      if (expectedResponse.success !== undefined) {
        expect(response.success).toBe(expectedResponse.success);
      }

      if (expectedResponse.data) {
        expect(response.data).toMatchObject(expectedResponse.data);
      }

      if (expectedResponse.error) {
        expect(response.error).toMatchObject(expectedResponse.error);
      }
    }
  }

  /**
   * Test multiple endpoints in sequence
   */
  async runSequence(tests: ApiTestConfig[]): Promise<void> {
    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test multiple endpoints in parallel
   */
  async runParallel(tests: ApiTestConfig[]): Promise<void> {
    await Promise.all(tests.map((test) => this.runTest(test)));
  }
}

// ==========================================
// 🎯 API ASSERTION HELPERS
// ==========================================

export class ApiAssertions {
  /**
   * Assert successful response
   */
  static assertSuccess<T = any>(response: ApiResponse<T>): void {
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.error).toBeUndefined();
  }

  /**
   * Assert error response
   */
  static assertError(
    response: ApiResponse,
    expectedCode?: string,
    expectedMessage?: string,
  ): void {
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();

    if (expectedCode) {
      expect(response.error?.code).toBe(expectedCode);
    }

    if (expectedMessage) {
      expect(response.error?.message).toContain(expectedMessage);
    }
  }

  /**
   * Assert pagination metadata
   */
  static assertPagination(
    meta: PaginationMeta | undefined,
    expected: Partial<PaginationMeta>,
  ): void {
    expect(meta).toBeDefined();

    if (expected.total !== undefined) {
      expect(meta?.total).toBe(expected.total);
    }

    if (expected.page !== undefined) {
      expect(meta?.page).toBe(expected.page);
    }

    if (expected.pageSize !== undefined) {
      expect(meta?.pageSize).toBe(expected.pageSize);
    }
  }

  /**
   * Assert response time
   */
  static async assertResponseTime(
    requestFn: () => Promise<any>,
    maxTime: number,
  ): Promise<void> {
    const startTime = Date.now();
    await requestFn();
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThanOrEqual(maxTime);
  }

  /**
   * Assert data structure
   */
  static assertStructure<T = any>(
    data: T,
    structure: Partial<Record<keyof T, string>>,
  ): void {
    Object.entries(structure).forEach(([key, type]) => {
      expect(data).toHaveProperty(key);
      expect(typeof data[key as keyof T]).toBe(type);
    });
  }

  /**
   * Assert array response
   */
  static assertArray<T = any>(
    data: T[] | undefined,
    minLength?: number,
    maxLength?: number,
  ): void {
    expect(Array.isArray(data)).toBe(true);

    if (minLength !== undefined) {
      expect(data!.length).toBeGreaterThanOrEqual(minLength);
    }

    if (maxLength !== undefined) {
      expect(data!.length).toBeLessThanOrEqual(maxLength);
    }
  }

  /**
   * Assert field validation error
   */
  static assertValidationError(
    response: ApiResponse,
    field: string,
    expectedMessage?: string,
  ): void {
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error?.code).toBe("VALIDATION_ERROR");

    if (expectedMessage) {
      const fieldError = response.error?.details?.[field];
      expect(fieldError).toContain(expectedMessage);
    }
  }
}

// ==========================================
// 🔄 RATE LIMIT TESTER
// ==========================================

export class RateLimitTester {
  constructor(private client: ApiClient) {}

  /**
   * Test rate limiting
   */
  async testRateLimit(config: RateLimitConfig): Promise<{
    allowed: number;
    blocked: number;
    rateLimitWorking: boolean;
  }> {
    const { maxRequests, windowMs, endpoint } = config;
    const requests: Promise<ApiResponse>[] = [];

    // Make requests beyond limit
    for (let i = 0; i < maxRequests + 5; i++) {
      requests.push(this.client.get(endpoint));
    }

    const responses = await Promise.all(requests);

    const allowed = responses.filter((r) => r.success).length;
    const blocked = responses.filter((r) => !r.success).length;

    return {
      allowed,
      blocked,
      rateLimitWorking: blocked > 0 && allowed <= maxRequests,
    };
  }

  /**
   * Test rate limit recovery
   */
  async testRateLimitRecovery(config: RateLimitConfig): Promise<boolean> {
    // Exhaust rate limit
    await this.testRateLimit(config);

    // Wait for window to reset
    await new Promise((resolve) => setTimeout(resolve, config.windowMs + 1000));

    // Try request again
    const response = await this.client.get(config.endpoint);
    return response.success;
  }
}

// ==========================================
// 🎭 API MOCK CONTROLLER
// ==========================================

export class ApiMockController {
  private mocks: Map<string, MockApiConfig> = new Map();

  constructor(private page: Page) {}

  /**
   * Setup API mock
   */
  async mockEndpoint(config: MockApiConfig): Promise<void> {
    const key = `${config.method}_${config.endpoint}`;
    this.mocks.set(key, config);

    await this.page.route(`**${config.endpoint}*`, async (route) => {
      if (route.request().method() !== config.method) {
        await route.continue();
        return;
      }

      if (config.delay) {
        await new Promise((resolve) => setTimeout(resolve, config.delay));
      }

      await route.fulfill({
        status: config.status || 200,
        contentType: "application/json",
        body: JSON.stringify(config.response),
      });
    });
  }

  /**
   * Mock success response
   */
  async mockSuccess(
    endpoint: string,
    method: string,
    data: any,
  ): Promise<void> {
    await this.mockEndpoint({
      endpoint,
      method,
      response: { success: true, data },
      status: 200,
    });
  }

  /**
   * Mock error response
   */
  async mockError(
    endpoint: string,
    method: string,
    errorCode: string,
    errorMessage: string,
    status = 500,
  ): Promise<void> {
    await this.mockEndpoint({
      endpoint,
      method,
      response: {
        success: false,
        error: { code: errorCode, message: errorMessage },
      },
      status,
    });
  }

  /**
   * Mock slow response
   */
  async mockSlowResponse(
    endpoint: string,
    method: string,
    data: any,
    delay: number,
  ): Promise<void> {
    await this.mockEndpoint({
      endpoint,
      method,
      response: { success: true, data },
      status: 200,
      delay,
    });
  }

  /**
   * Clear all mocks
   */
  async clearMocks(): Promise<void> {
    await this.page.unroute("**/*");
    this.mocks.clear();
  }

  /**
   * Get mock config
   */
  getMock(endpoint: string, method: string): MockApiConfig | undefined {
    return this.mocks.get(`${method}_${endpoint}`);
  }
}

// ==========================================
// 📊 API PERFORMANCE MONITOR
// ==========================================

export class ApiPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Measure API call performance
   */
  async measure(
    endpoint: string,
    requestFn: () => Promise<any>,
  ): Promise<number> {
    const startTime = Date.now();
    await requestFn();
    const duration = Date.now() - startTime;

    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    this.metrics.get(endpoint)!.push(duration);

    return duration;
  }

  /**
   * Get statistics for endpoint
   */
  getStats(endpoint: string): {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    count: number;
  } | null {
    const measurements = this.metrics.get(endpoint);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = sorted.length;

    return {
      min: sorted[0],
      max: sorted[count - 1],
      avg: sorted.reduce((a, b) => a + b, 0) / count,
      median: sorted[Math.floor(count / 2)],
      p95: sorted[Math.floor(count * 0.95)],
      count,
    };
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    let report = "📊 API Performance Report\n\n";

    this.metrics.forEach((measurements, endpoint) => {
      const stats = this.getStats(endpoint);
      if (stats) {
        report += `Endpoint: ${endpoint}\n`;
        report += `  Requests: ${stats.count}\n`;
        report += `  Min: ${stats.min}ms\n`;
        report += `  Max: ${stats.max}ms\n`;
        report += `  Avg: ${stats.avg.toFixed(2)}ms\n`;
        report += `  Median: ${stats.median}ms\n`;
        report += `  P95: ${stats.p95}ms\n\n`;
      }
    });

    return report;
  }
}

// ==========================================
// 🔧 UTILITY FUNCTIONS
// ==========================================

/**
 * Wait for API to be ready
 */
export async function waitForApiReady(
  baseUrl: string,
  healthEndpoint = "/api/health",
  timeout = 30000,
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`${baseUrl}${healthEndpoint}`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Create authenticated API client
 */
export async function createAuthenticatedClient(
  email: string,
  password: string,
  baseUrl?: string,
): Promise<ApiClient> {
  const client = new ApiClient(baseUrl);
  const authenticated = await client.authenticate(email, password);

  if (!authenticated) {
    throw new Error("Failed to authenticate API client");
  }

  return client;
}

/**
 * Retry API call with exponential backoff
 */
export async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, baseDelay * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError!;
}

/**
 * Batch API requests
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  batchSize = 5,
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((req) => req()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Generate test data for API
 */
export function generateApiTestData<T extends Record<string, any>>(
  template: T,
  count: number,
): T[] {
  return Array.from({ length: count }, (_, i) => ({
    ...template,
    id: `test-${i}-${Date.now()}`,
    name: `${template.name} ${i}`,
  }));
}

// ==========================================
// 📤 EXPORTS
// ==========================================

export const ApiIntegrationUtils = {
  ApiClient,
  ApiTestRunner,
  ApiAssertions,
  RateLimitTester,
  ApiMockController,
  ApiPerformanceMonitor,
  waitForApiReady,
  createAuthenticatedClient,
  retryApiCall,
  batchRequests,
  generateApiTestData,
};

export default ApiIntegrationUtils;
