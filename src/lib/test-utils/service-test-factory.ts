/**
 * SERVICE TEST FACTORY - Testing utilities for BaseService
 */

import { BaseService } from "@/lib/services/base.service";
import type { ServiceResponse } from "@/lib/types/service-response";

export interface ServiceTestConfig<TEntity = any> {
  ServiceClass: new (...args: any[]) => BaseService;
  serviceName: string;
  testCache?: boolean;
  testErrorHandling?: boolean;
}

export function expectSuccess<T>(
  response: ServiceResponse<T>,
): asserts response is { success: true; data: T } {
  expect(response.success).toBe(true);
  if (!response.success) {
    throw new Error(
      `Expected success but got error: ${response.error.message}`,
    );
  }
}

export function expectError<T>(
  response: ServiceResponse<T>,
): asserts response is { success: false; error: any } {
  expect(response.success).toBe(false);
  if (response.success) {
    throw new Error("Expected error but got success");
  }
}

export function expectErrorCode<T>(
  response: ServiceResponse<T>,
  code: string,
): void {
  expectError(response);
  expect(response.error.code).toBe(code);
}
