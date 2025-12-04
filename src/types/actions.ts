// 🌟 Divine Action Types - Base Infrastructure for Server Actions
// Farmers Market Platform - Action Response Patterns
// Version: 1.0 - Divine Action Foundation

/**
 * Standard action result interface for all server actions
 * Provides consistent response structure across the application
 */
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp?: string;
    requestId?: string;
  };
}

/**
 * Divine Action Error class for structured error handling
 * Extends Error with additional context for agricultural consciousness
 */
export class ActionError extends Error {
  constructor(
    public code: string,
    message: string,
    public field?: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "ActionError";
    Object.setPrototypeOf(this, ActionError.prototype);
  }
}

/**
 * Common error codes for consistent error handling
 */
export const ActionErrorCode = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Database
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  DATABASE_ERROR: "DATABASE_ERROR",

  // Business Logic
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",

  // External Services
  UPLOAD_FAILED: "UPLOAD_FAILED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  NOTIFICATION_FAILED: "NOTIFICATION_FAILED",

  // Generic
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ActionErrorCodeType =
  (typeof ActionErrorCode)[keyof typeof ActionErrorCode];

/**
 * Helper function to create success result
 */
export function createSuccessResult<T>(
  data: T,
  meta?: ActionResult["meta"],
): ActionResult<T> {
  return {
    success: true,
    data,
    meta,
  };
}

/**
 * Helper function to create error result
 */
export function createErrorResult(
  code: string,
  message: string,
  field?: string,
  details?: Record<string, any>,
): ActionResult<never> {
  return {
    success: false,
    error: {
      code,
      message,
      field,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Type guard to check if result is success
 */
export function isSuccessResult<T>(
  result: ActionResult<T>,
): result is ActionResult<T> & { success: true; data: T } {
  return result.success === true && result.data !== undefined;
}

/**
 * Type guard to check if result is error
 */
export function isErrorResult(
  result: ActionResult,
): result is ActionResult & {
  success: false;
  error: NonNullable<ActionResult["error"]>;
} {
  return result.success === false && result.error !== undefined;
}
