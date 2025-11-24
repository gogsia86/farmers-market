/**
 * APPLICATION ERROR - Base Error Class
 * Foundation for all custom errors in the system
 */

export abstract class ApplicationError extends Error {
  public readonly code: string;
  public readonly details: Record<string, any>;
  public readonly timestamp: string;
  public readonly context: string;

  constructor(
    message: string,
    code: string,
    context: string = "UNKNOWN",
    details: Record<string, any> = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}
