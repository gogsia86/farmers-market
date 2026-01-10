/**
 * 🌟 Error Type Definitions - Divine Agricultural Error Consciousness
 *
 * Comprehensive error types following kilo-scale architecture and
 * agricultural consciousness patterns.
 *
 * @module lib/errors/types
 */

// ============================================================================
// BASE ERROR TYPES
// ============================================================================

/**
 * Error severity levels for prioritization and alerting
 */
export enum ErrorSeverity {
  /** Informational - no action needed */
  INFO = "INFO",
  /** Warning - attention recommended */
  WARNING = "WARNING",
  /** Error - action required */
  ERROR = "ERROR",
  /** Critical - immediate action required */
  CRITICAL = "CRITICAL",
  /** Fatal - system integrity compromised */
  FATAL = "FATAL",
}

/**
 * Error categories for classification and routing
 */
export enum ErrorCategory {
  // Technical Errors
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NETWORK = "NETWORK",
  DATABASE = "DATABASE",
  API = "API",

  // Business Logic Errors
  BUSINESS_LOGIC = "BUSINESS_LOGIC",
  PAYMENT = "PAYMENT",
  INVENTORY = "INVENTORY",

  // Agricultural Errors
  SEASONAL = "SEASONAL",
  BIODYNAMIC = "BIODYNAMIC",
  AGRICULTURAL = "AGRICULTURAL",

  // System Errors
  UNKNOWN = "UNKNOWN",
  SYSTEM = "SYSTEM",
  CONFIGURATION = "CONFIGURATION",
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  /** Retry the operation */
  RETRY = "RETRY",
  /** Use cached/fallback data */
  FALLBACK = "FALLBACK",
  /** Redirect to safe page */
  REDIRECT = "REDIRECT",
  /** Show error UI but continue */
  CONTINUE = "CONTINUE",
  /** Refresh the page */
  REFRESH = "REFRESH",
  /** Logout and re-authenticate */
  REAUTH = "REAUTH",
  /** Contact support */
  SUPPORT = "SUPPORT",
  /** No recovery available */
  NONE = "NONE",
}

// ============================================================================
// ERROR METADATA
// ============================================================================

/**
 * Error metadata for tracing and debugging
 */
export interface ErrorMetadata {
  /** Unique error ID for tracking */
  errorId: string;
  /** Timestamp when error occurred */
  timestamp: string;
  /** Request ID for correlation */
  requestId?: string;
  /** User ID if authenticated */
  userId?: string;
  /** Session ID */
  sessionId?: string;
  /** URL where error occurred */
  url?: string;
  /** User agent */
  userAgent?: string;
  /** Additional context data */
  context?: Record<string, any>;
  /** Stack trace */
  stack?: string;
  /** Component where error occurred */
  component?: string;
  /** Operation that failed */
  operation?: string;
}

/**
 * Recovery action for user guidance
 */
export interface RecoveryAction {
  /** Action label */
  label: string;
  /** Action handler */
  action: () => void | Promise<void>;
  /** Action type */
  type: "primary" | "secondary" | "tertiary";
  /** Icon name */
  icon?: string;
}

/**
 * User-friendly error details
 */
export interface UserErrorDetails {
  /** Short user-facing title */
  title: string;
  /** Detailed explanation */
  message: string;
  /** Suggested actions */
  suggestions?: string[];
  /** Recovery actions */
  actions?: RecoveryAction[];
  /** Help article link */
  helpLink?: string;
}

// ============================================================================
// BASE APPLICATION ERROR
// ============================================================================

/**
 * Base application error class with full context
 */
export class AppError extends Error {
  public readonly errorId: string;
  public readonly timestamp: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly metadata: ErrorMetadata;
  public readonly userDetails: UserErrorDetails;
  public readonly recoveryStrategy: RecoveryStrategy;
  public readonly retryable: boolean;
  public readonly originalError?: Error;

  constructor(config: {
    message: string;
    code: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    userDetails: UserErrorDetails;
    recoveryStrategy?: RecoveryStrategy;
    retryable?: boolean;
    metadata?: Partial<ErrorMetadata>;
    originalError?: Error;
  }) {
    super(config.message);

    this.name = "AppError";
    this.errorId = config.metadata?.errorId || generateErrorId();
    this.timestamp = config.metadata?.timestamp || new Date().toISOString();
    this.severity = config.severity;
    this.category = config.category;
    this.code = config.code;
    this.recoveryStrategy = config.recoveryStrategy || RecoveryStrategy.NONE;
    this.retryable = config.retryable ?? false;
    this.originalError = config.originalError;
    this.userDetails = config.userDetails;

    this.metadata = {
      errorId: this.errorId,
      timestamp: this.timestamp,
      ...config.metadata,
      stack: this.stack,
    };

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert to JSON for logging/transmission
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errorId: this.errorId,
      timestamp: this.timestamp,
      severity: this.severity,
      category: this.category,
      code: this.code,
      recoveryStrategy: this.recoveryStrategy,
      retryable: this.retryable,
      metadata: this.metadata,
      userDetails: this.userDetails,
    };
  }
}

// ============================================================================
// SPECIFIC ERROR TYPES
// ============================================================================

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly validationErrors: ValidationErrorDetail[];

  constructor(config: {
    message: string;
    field?: string;
    validationErrors: ValidationErrorDetail[];
    metadata?: Partial<ErrorMetadata>;
  }) {
    super({
      message: config.message,
      code: "VALIDATION_ERROR",
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.VALIDATION,
      userDetails: {
        title: "Validation Error",
        message: config.message,
        suggestions: [
          "Please check the highlighted fields",
          "Ensure all required information is provided",
          "Follow the format guidelines shown",
        ],
      },
      recoveryStrategy: RecoveryStrategy.CONTINUE,
      retryable: true,
      metadata: config.metadata,
    });

    this.name = "ValidationError";
    this.field = config.field;
    this.validationErrors = config.validationErrors;
  }
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(config: {
    message: string;
    code?: string;
    metadata?: Partial<ErrorMetadata>;
  }) {
    super({
      message: config.message,
      code: config.code || "AUTH_REQUIRED",
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.AUTHENTICATION,
      userDetails: {
        title: "Authentication Required",
        message: "Please sign in to continue",
        suggestions: [
          "Sign in with your existing account",
          "Create a new account if you don't have one",
          "Reset your password if you forgot it",
        ],
      },
      recoveryStrategy: RecoveryStrategy.REAUTH,
      retryable: true,
      metadata: config.metadata,
    });

    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error (permission denied)
 */
export class AuthorizationError extends AppError {
  public readonly requiredPermission?: string;

  constructor(config: {
    message: string;
    requiredPermission?: string;
    metadata?: Partial<ErrorMetadata>;
  }) {
    super({
      message: config.message,
      code: "PERMISSION_DENIED",
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.AUTHORIZATION,
      userDetails: {
        title: "Permission Denied",
        message: "You don't have permission to perform this action",
        suggestions: [
          "Contact your administrator for access",
          "Switch to an account with appropriate permissions",
          "Return to the previous page",
        ],
      },
      recoveryStrategy: RecoveryStrategy.REDIRECT,
      retryable: false,
      metadata: config.metadata,
    });

    this.name = "AuthorizationError";
    this.requiredPermission = config.requiredPermission;
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(config: {
    message: string;
    statusCode?: number;
    endpoint?: string;
    metadata?: Partial<ErrorMetadata>;
  }) {
    super({
      message: config.message,
      code: `NETWORK_ERROR_${config.statusCode || "UNKNOWN"}`,
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.NETWORK,
      userDetails: {
        title: "Connection Error",
        message: "Unable to connect to the server",
        suggestions: [
          "Check your internet connection",
          "Try refreshing the page",
          "Wait a moment and try again",
        ],
      },
      recoveryStrategy: RecoveryStrategy.RETRY,
      retryable: true,
      metadata: config.metadata,
    });

    this.name = "NetworkError";
    this.statusCode = config.statusCode;
    this.endpoint = config.endpoint;
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  public readonly query?: string;
  public readonly operation?: string;

  constructor(config: {
    message: string;
    query?: string;
    operation?: string;
    metadata?: Partial<ErrorMetadata>;
    originalError?: Error;
  }) {
    super({
      message: config.message,
      code: "DATABASE_ERROR",
      severity: ErrorSeverity.CRITICAL,
      category: ErrorCategory.DATABASE,
      userDetails: {
        title: "Service Unavailable",
        message: "We're experiencing technical difficulties",
        suggestions: [
          "Please try again in a few moments",
          "Your data has been saved",
          "Contact support if the problem persists",
        ],
      },
      recoveryStrategy: RecoveryStrategy.RETRY,
      retryable: true,
      metadata: config.metadata,
      originalError: config.originalError,
    });

    this.name = "DatabaseError";
    this.query = config.query;
    this.operation = config.operation;
  }
}

/**
 * API error (external service)
 */
export class ApiError extends AppError {
  public readonly statusCode: number;
  public readonly endpoint: string;
  public readonly response?: any;

  constructor(config: {
    message: string;
    statusCode: number;
    endpoint: string;
    response?: any;
    metadata?: Partial<ErrorMetadata>;
    originalError?: Error;
  }) {
    super({
      message: config.message,
      code: `API_ERROR_${config.statusCode}`,
      severity: config.statusCode >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
      category: ErrorCategory.API,
      userDetails: {
        title: "Service Error",
        message: config.statusCode >= 500
          ? "The service is temporarily unavailable"
          : "Unable to process your request",
        suggestions: [
          "Please try again",
          config.statusCode >= 500 ? "Check service status page" : "Verify your input",
          "Contact support if the issue continues",
        ],
      },
      recoveryStrategy: config.statusCode >= 500 ? RecoveryStrategy.RETRY : RecoveryStrategy.CONTINUE,
      retryable: config.statusCode >= 500,
      metadata: config.metadata,
      originalError: config.originalError,
    });

    this.name = "ApiError";
    this.statusCode = config.statusCode;
    this.endpoint = config.endpoint;
    this.response = config.response;
  }
}

/**
 * Payment error
 */
export class PaymentError extends AppError {
  public readonly paymentMethod?: string;
  public readonly declineCode?: string;

  constructor(config: {
    message: string;
    paymentMethod?: string;
    declineCode?: string;
    metadata?: Partial<ErrorMetadata>;
  }) {
    super({
      message: config.message,
      code: config.declineCode || "PAYMENT_FAILED",
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.PAYMENT,
      userDetails: {
        title: "Payment Failed",
        message: config.message,
        suggestions: [
          "Try a different payment method",
          "Check your card details",
          "Contact your bank if the problem continues",
        ],
      },
      recoveryStrategy: RecoveryStrategy.CONTINUE,
      retryable: true,
      metadata: config.metadata,
    });

    this.name = "PaymentError";
    this.paymentMethod = config.paymentMethod;
    this.declineCode = config.declineCode;
  }
}

// ============================================================================
// AGRICULTURAL ERROR TYPES (Divine Pattern)
// ============================================================================

/**
 * Seasonal violation error
 */
export class SeasonalViolationError extends AppError {
  public readonly currentSeason: string;
  public readonly requiredSeason: string;
  public readonly operation: string;

  constructor(config: {
    message: string;
    currentSeason: string;
    requiredSeason: string;
    operation: string;
    metadata?: Partial<ErrorMetadata>;
  }) {
    super({
      message: config.message,
      code: "SEASONAL_VIOLATION",
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.SEASONAL,
      userDetails: {
        title: "Seasonal Restriction",
        message: `${config.operation} is not available during ${config.currentSeason}`,
        suggestions: [
          `This operation is available during ${config.requiredSeason}`,
          "Check the seasonal calendar for availability",
          "Consider planning for the appropriate season",
        ],
      },
      recoveryStrategy: RecoveryStrategy.CONTINUE,
      retryable: false,
      metadata: config.metadata,
    });

    this.name = "SeasonalViolationError";
    this.currentSeason = config.currentSeason;
    this.requiredSeason = config.requiredSeason;
    this.operation = config.operation;
  }
}

/**
 * Biodynamic error (agricultural consciousness)
 */
export class BiodynamicError extends AppError {
  public readonly farmId?: string;
  public readonly practiceType?: string;

  constructor(config: {
    message: string;
    farmId?: string;
    practiceType?: string;
    metadata?: Partial<ErrorMetadata>;
  }) {
    super({
      message: config.message,
      code: "BIODYNAMIC_ERROR",
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.BIODYNAMIC,
      userDetails: {
        title: "Biodynamic Practice Constraint",
        message: config.message,
        suggestions: [
          "Review biodynamic farming guidelines",
          "Consult with an agricultural advisor",
          "Adjust your farming practices",
        ],
      },
      recoveryStrategy: RecoveryStrategy.CONTINUE,
      retryable: false,
      metadata: config.metadata,
    });

    this.name = "BiodynamicError";
    this.farmId = config.farmId;
    this.practiceType = config.practiceType;
  }
}

/**
 * Inventory error
 */
export class InventoryError extends AppError {
  public readonly productId: string;
  public readonly requestedQuantity: number;
  public readonly availableQuantity: number;

  constructor(config: {
    message: string;
    productId: string;
    requestedQuantity: number;
    availableQuantity: number;
    metadata?: Partial<ErrorMetadata>;
  }) {
    super({
      message: config.message,
      code: "INSUFFICIENT_INVENTORY",
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.INVENTORY,
      userDetails: {
        title: "Limited Stock",
        message: `Only ${config.availableQuantity} items available`,
        suggestions: [
          "Reduce the quantity",
          "Check back later for restocking",
          "Browse similar products",
        ],
      },
      recoveryStrategy: RecoveryStrategy.CONTINUE,
      retryable: false,
      metadata: config.metadata,
    });

    this.name = "InventoryError";
    this.productId = config.productId;
    this.requestedQuantity = config.requestedQuantity;
    this.availableQuantity = config.availableQuantity;
  }
}

// ============================================================================
// DIVINE ERROR (Enlightening Error Pattern)
// ============================================================================

/**
 * Divine quantum coherence error with enlightening guidance
 */
export class QuantumCoherenceError extends AppError {
  public readonly currentState: any;
  public readonly expectedState: any;
  public readonly resolutionPath: string[];

  constructor(config: {
    message: string;
    currentState: any;
    expectedState: any;
    resolutionPath: string[];
    metadata?: Partial<ErrorMetadata>;
  }) {
    const enlighteningMessage = `
╔════════════════════════════════════════════════════════════╗
║ ⚡ QUANTUM COHERENCE DISRUPTION DETECTED                   ║
╠════════════════════════════════════════════════════════════╣
║ 🔮 WHAT HAPPENED: ${config.message}
║
║ 🧬 CURRENT STATE: ${JSON.stringify(config.currentState, null, 2)}
║
║ 🎯 EXPECTED REALITY: ${JSON.stringify(config.expectedState, null, 2)}
║
║ 🛠️  PATH TO ENLIGHTENMENT:
║    ${config.resolutionPath.map((step: any, i: any) => `${i + 1}. ${step}`).join('\n║    ')}
╚════════════════════════════════════════════════════════════╝
    `.trim();

    super({
      message: enlighteningMessage,
      code: "QUANTUM_COHERENCE_ERROR",
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.SYSTEM,
      userDetails: {
        title: "System State Error",
        message: "The system encountered an unexpected state",
        suggestions: config.resolutionPath,
      },
      recoveryStrategy: RecoveryStrategy.REFRESH,
      retryable: true,
      metadata: config.metadata,
    });

    this.name = "QuantumCoherenceError";
    this.currentState = config.currentState;
    this.expectedState = config.expectedState;
    this.resolutionPath = config.resolutionPath;
  }
}

// ============================================================================
// API ERROR RESPONSE TYPE
// ============================================================================

/**
 * Standardized API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
    errorId: string;
    retryable?: boolean;
  };
  agricultural?: {
    season?: string;
    consciousness?: string;
  };
}

// ============================================================================
// ERROR BOUNDARY STATE
// ============================================================================

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
  recoveryAttempts: number;
  lastRecoveryAttempt: Date | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard for validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard for authentication error
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Type guard for authorization error
 */
export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

/**
 * Type guard for network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard for payment error
 */
export function isPaymentError(error: unknown): error is PaymentError {
  return error instanceof PaymentError;
}

/**
 * Type guard for seasonal error
 */
export function isSeasonalError(error: unknown): error is SeasonalViolationError {
  return error instanceof SeasonalViolationError;
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "An unknown error occurred";
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown, defaultCategory: ErrorCategory = ErrorCategory.UNKNOWN): AppError {
  if (isAppError(error)) {
    return error;
  }

  const message = getErrorMessage(error);
  const originalError = error instanceof Error ? error : undefined;

  return new AppError({
    message,
    code: "UNKNOWN_ERROR",
    severity: ErrorSeverity.ERROR,
    category: defaultCategory,
    userDetails: {
      title: "An Error Occurred",
      message: "Something went wrong. Please try again.",
      suggestions: [
        "Refresh the page",
        "Try again in a few moments",
        "Contact support if the problem persists",
      ],
    },
    recoveryStrategy: RecoveryStrategy.REFRESH,
    retryable: true,
    originalError,
  });
}
