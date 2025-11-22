/**
 * VALIDATION ERROR
 * For input validation failures
 */

import { ApplicationError } from "./ApplicationError";

export class ValidationError extends ApplicationError {
  public readonly field: string;
  public readonly value: any;

  constructor(
    field: string,
    message: string,
    value?: any,
    details: Record<string, any> = {}
  ) {
    super(
      `Validation failed for ${field}: ${message}`,
      "VALIDATION_ERROR",
      "VALIDATION",
      { field, value, ...details }
    );
    this.field = field;
    this.value = value;
  }
}
