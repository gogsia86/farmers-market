/**
 * DATABASE ERROR
 * For database operation failures
 */

import { ApplicationError } from "./ApplicationError";

export class DatabaseError extends ApplicationError {
  public readonly operation: string;
  public readonly originalError: Error;

  constructor(
    operation: string,
    originalError: Error,
    details: Record<string, any> = {}
  ) {
    super(
      `Database operation failed: ${operation}`,
      "DATABASE_ERROR",
      "DATABASE",
      { operation, originalMessage: originalError.message, ...details }
    );
    this.operation = operation;
    this.originalError = originalError;
  }
}
