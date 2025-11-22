/**
 * BUSINESS LOGIC ERROR
 * For domain-specific business rule violations
 */

import { ApplicationError } from "./ApplicationError";

export class BusinessLogicError extends ApplicationError {
  constructor(
    message: string,
    operation: string,
    details: Record<string, any> = {}
  ) {
    super(message, "BUSINESS_LOGIC_ERROR", `BUSINESS.${operation}`, details);
  }
}
