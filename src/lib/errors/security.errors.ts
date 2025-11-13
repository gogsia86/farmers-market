/**
 * SECURITY ERROR TYPES
 * Custom error classes for security-related exceptions
 */

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

export class RateLimitExceededError extends SecurityError {
  constructor(message: string = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitExceededError";
  }
}

export class InvalidCSRFTokenError extends SecurityError {
  constructor(message: string = "Invalid CSRF token") {
    super(message);
    this.name = "InvalidCSRFTokenError";
  }
}

export class InvalidOriginError extends SecurityError {
  constructor(message: string = "Invalid request origin") {
    super(message);
    this.name = "InvalidOriginError";
  }
}

export class BotDetectedError extends SecurityError {
  constructor(message: string = "Bot activity detected") {
    super(message);
    this.name = "BotDetectedError";
  }
}

export class SecurityConfigurationError extends SecurityError {
  constructor(message: string = "Invalid security configuration") {
    super(message);
    this.name = "SecurityConfigurationError";
  }
}

export class EncryptionError extends SecurityError {
  constructor(message: string = "Encryption operation failed") {
    super(message);
    this.name = "EncryptionError";
  }
}

export class AuditLogError extends SecurityError {
  constructor(message: string = "Audit logging failed") {
    super(message);
    this.name = "AuditLogError";
  }
}

export class AuthorizationError extends SecurityError {
  constructor(message: string = "Authorization failed") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class DataValidationError extends SecurityError {
  constructor(message: string = "Data validation failed") {
    super(message);
    this.name = "DataValidationError";
  }
}

export class SecurityHeaderError extends SecurityError {
  constructor(message: string = "Security header configuration error") {
    super(message);
    this.name = "SecurityHeaderError";
  }
}
