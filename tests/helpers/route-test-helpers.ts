/**
 * 🧪 API Route Test Helpers
 *
 * Utilities for testing Next.js API routes directly without HTTP fetch
 * This allows integration tests to run without a dev server
 *
 * @pattern Direct Route Handler Testing
 * @reference 17_API_TESTING_TRACING_MOCKS.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Creates a mock NextRequest for testing API routes
 *
 * @example
 * ```typescript
 * const request = createMockRequest({
 *   method: 'GET',
 *   url: '/api/products?page=1&limit=10',
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 * ```
 */
export function createMockRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}): NextRequest {
  const {
    method = "GET",
    url = "http://localhost:3001",
    body,
    headers: customHeaders = {},
    searchParams = {},
  } = options;

  // Build URL with search params
  const urlObj = new URL(
    url.startsWith("http") ? url : `http://localhost:3001${url}`,
  );
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Create request init options (typed for Next.js compatibility)
  const init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  } = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  };

  // Add body if present
  if (body) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  // Create NextRequest (cast to compatible type)
  const request = new NextRequest(urlObj.toString(), init as any);

  return request;
}

/**
 * Extracts JSON response from NextResponse
 *
 * @example
 * ```typescript
 * const response = await GET(request);
 * const data = await extractResponseData(response);
 * ```
 */
export async function extractResponseData<T = any>(
  response: NextResponse,
): Promise<T> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Failed to parse response: ${text}`);
  }
}

/**
 * Creates an authenticated mock request with JWT token
 *
 * @example
 * ```typescript
 * const request = createAuthenticatedRequest({
 *   url: '/api/products',
 *   method: 'POST',
 *   userId: 'user_123',
 *   role: 'FARMER'
 * });
 * ```
 */
export function createAuthenticatedRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  searchParams?: Record<string, string>;
  userId: string;
  role?: string;
  email?: string;
}): NextRequest {
  const {
    userId,
    role = "CONSUMER",
    email = "test@example.com",
    ...requestOptions
  } = options;

  // Create a mock JWT token (for testing only)
  const mockToken = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64");

  return createMockRequest({
    ...requestOptions,
    headers: {
      Authorization: `Bearer ${mockToken}`,
      ...(requestOptions.body && { "Content-Type": "application/json" }),
    },
  });
}

/**
 * Response helper assertions
 */
export const ResponseHelpers = {
  /**
   * Assert response is successful
   */
  expectSuccess: (response: NextResponse) => {
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
  },

  /**
   * Assert response has specific status code
   */
  expectStatus: (response: NextResponse, status: number) => {
    expect(response.status).toBe(status);
  },

  /**
   * Assert response is 404
   */
  expectNotFound: (response: NextResponse) => {
    expect(response.status).toBe(404);
  },

  /**
   * Assert response is 401 Unauthorized
   */
  expectUnauthorized: (response: NextResponse) => {
    expect(response.status).toBe(401);
  },

  /**
   * Assert response is 403 Forbidden
   */
  expectForbidden: (response: NextResponse) => {
    expect(response.status).toBe(403);
  },

  /**
   * Assert response is 400 Bad Request
   */
  expectBadRequest: (response: NextResponse) => {
    expect(response.status).toBe(400);
  },

  /**
   * Assert response is 500 Internal Server Error
   */
  expectServerError: (response: NextResponse) => {
    expect(response.status).toBe(500);
  },
};

/**
 * Test API route with direct import
 *
 * @example
 * ```typescript
 * import { GET } from '@/app/api/products/route';
 *
 * const response = await testApiRoute(GET, {
 *   searchParams: { page: '1', limit: '10' }
 * });
 *
 * const data = await extractResponseData(response);
 * expect(data.success).toBe(true);
 * ```
 */
export async function testApiRoute(
  routeHandler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    method?: string;
    url?: string;
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {},
): Promise<NextResponse> {
  const request = createMockRequest(options);
  return await routeHandler(request);
}

/**
 * Test authenticated API route
 *
 * @example
 * ```typescript
 * import { POST } from '@/app/api/products/route';
 *
 * const response = await testAuthenticatedApiRoute(POST, {
 *   userId: 'user_123',
 *   role: 'FARMER',
 *   body: { name: 'Tomatoes', farmId: 'farm_123' }
 * });
 * ```
 */
export async function testAuthenticatedApiRoute(
  routeHandler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    method?: string;
    url?: string;
    body?: any;
    searchParams?: Record<string, string>;
    userId: string;
    role?: string;
    email?: string;
  },
): Promise<NextResponse> {
  const request = createAuthenticatedRequest(options);
  return await routeHandler(request);
}

/**
 * Integration test pattern for API routes
 *
 * @example
 * ```typescript
 * describe('Product API Integration Tests', () => {
 *   it('should list products', async () => {
 *     const { GET } = await import('@/app/api/products/route');
 *
 *     const response = await testApiRoute(GET, {
 *       searchParams: { page: '1', limit: '10' }
 *     });
 *
 *     ResponseHelpers.expectSuccess(response);
 *
 *     const data = await extractResponseData(response);
 *     expect(data.success).toBe(true);
 *     expect(Array.isArray(data.data)).toBe(true);
 *   });
 * });
 * ```
 */

/**
 * Mock NextAuth session for route testing
 *
 * This should be used in jest.setup.js or individual test files
 */
export function mockNextAuthSession(
  session: {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
    };
  } | null,
) {
  // Mock the auth() function from next-auth
  jest.mock("next-auth", () => ({
    auth: jest.fn().mockResolvedValue(session),
  }));
}

/**
 * API response type helpers
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Type-safe response data extraction
 */
export async function extractApiResponse<T = any>(
  response: NextResponse,
): Promise<ApiResponse<T>> {
  const data = await extractResponseData<ApiResponse<T>>(response);
  return data;
}

/**
 * Assert API response is successful and return data
 */
export async function expectApiSuccess<T = any>(
  response: NextResponse,
): Promise<T> {
  ResponseHelpers.expectSuccess(response);

  const apiResponse = await extractApiResponse<T>(response);

  expect(apiResponse.success).toBe(true);

  if (!apiResponse.success) {
    throw new Error(
      `Expected success response but got error: ${apiResponse.error.message}`,
    );
  }

  return apiResponse.data;
}

/**
 * Assert API response is error and return error details
 */
export async function expectApiError(
  response: NextResponse,
  expectedCode?: string,
): Promise<ApiErrorResponse["error"]> {
  const apiResponse = await extractApiResponse(response);

  expect(apiResponse.success).toBe(false);

  if (apiResponse.success) {
    throw new Error("Expected error response but got success");
  }

  if (expectedCode) {
    expect(apiResponse.error.code).toBe(expectedCode);
  }

  return apiResponse.error;
}

/**
 * Batch test multiple API routes
 *
 * @example
 * ```typescript
 * const results = await batchTestApiRoutes([
 *   { handler: GET, options: { searchParams: { page: '1' } } },
 *   { handler: GET, options: { searchParams: { page: '2' } } },
 * ]);
 *
 * results.forEach(response => {
 *   ResponseHelpers.expectSuccess(response);
 * });
 * ```
 */
export async function batchTestApiRoutes(
  tests: Array<{
    handler: (request: NextRequest) => Promise<NextResponse>;
    options?: Parameters<typeof testApiRoute>[1];
  }>,
): Promise<NextResponse[]> {
  return Promise.all(
    tests.map(({ handler, options }) => testApiRoute(handler, options)),
  );
}

/**
 * Performance timing helpers
 */
export class ApiPerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;

  start(): void {
    this.startTime = performance.now();
  }

  stop(): void {
    this.endTime = performance.now();
  }

  getDuration(): number {
    return this.endTime - this.startTime;
  }

  expectUnder(milliseconds: number): void {
    const duration = this.getDuration();
    expect(duration).toBeLessThan(milliseconds);
  }
}

/**
 * Test API route with performance tracking
 *
 * @example
 * ```typescript
 * const { response, duration } = await testApiRouteWithTiming(GET, {
 *   searchParams: { page: '1' }
 * });
 *
 * expect(duration).toBeLessThan(100); // Should respond in <100ms
 * ```
 */
export async function testApiRouteWithTiming(
  routeHandler: (request: NextRequest) => Promise<NextResponse>,
  options: Parameters<typeof testApiRoute>[1] = {},
): Promise<{ response: NextResponse; duration: number }> {
  const timer = new ApiPerformanceTimer();

  timer.start();
  const response = await testApiRoute(routeHandler, options);
  timer.stop();

  return {
    response,
    duration: timer.getDuration(),
  };
}
