// src/lib/monitoring/retry/enhanced-retry.ts
/**
 * 🔄 Enhanced Retry System with Quantum Consciousness
 *
 * Implements intelligent retry logic with:
 * - Exponential backoff
 * - Error classification (transient vs permanent)
 * - Jitter to prevent thundering herd
 * - Circuit breaker pattern
 * - Agricultural consciousness
 *
 * @version 2.0.0
 * @divine-pattern RETRY_CONSCIOUSNESS
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ErrorType = "TRANSIENT" | "PERMANENT" | "RATE_LIMIT" | "TIMEOUT" | "NETWORK" | "UNKNOWN";

export interface ErrorClassification {
  type: ErrorType;
  retryable: boolean;
  suggestedDelay?: number;
  reason: string;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerResetTimeMs: number;
}

export interface RetryContext {
  attemptNumber: number;
  totalAttempts: number;
  lastError?: Error;
  lastErrorType?: ErrorType;
  elapsedTimeMs: number;
  nextRetryDelayMs?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDurationMs: number;
  errorType?: ErrorType;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,
  circuitBreakerResetTimeMs: 60000,
};

// ============================================================================
// Error Classification System
// ============================================================================

export class ErrorClassifier {
  /**
   * Classifies an error to determine if it's retryable and what type it is
   */
  static classify(error: Error | unknown): ErrorClassification {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const errorName = error instanceof Error ? error.name : "UnknownError";

    // Network errors (retryable)
    if (
      errorMessage.includes("econnrefused") ||
      errorMessage.includes("enotfound") ||
      errorMessage.includes("etimedout") ||
      errorMessage.includes("network") ||
      errorMessage.includes("socket hang up") ||
      errorName === "NetworkError"
    ) {
      return {
        type: "NETWORK",
        retryable: true,
        suggestedDelay: 2000,
        reason: "Network connectivity issue",
      };
    }

    // Timeout errors (retryable)
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("timed out") ||
      errorName === "TimeoutError"
    ) {
      return {
        type: "TIMEOUT",
        retryable: true,
        suggestedDelay: 3000,
        reason: "Operation timed out",
      };
    }

    // Rate limiting (retryable with longer delay)
    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("429") ||
      errorName === "RateLimitError"
    ) {
      return {
        type: "RATE_LIMIT",
        retryable: true,
        suggestedDelay: 10000,
        reason: "Rate limit exceeded",
      };
    }

    // Transient server errors (retryable)
    if (
      errorMessage.includes("500") ||
      errorMessage.includes("502") ||
      errorMessage.includes("503") ||
      errorMessage.includes("504") ||
      errorMessage.includes("internal server error") ||
      errorMessage.includes("bad gateway") ||
      errorMessage.includes("service unavailable") ||
      errorMessage.includes("gateway timeout")
    ) {
      return {
        type: "TRANSIENT",
        retryable: true,
        suggestedDelay: 5000,
        reason: "Temporary server error",
      };
    }

    // Permanent errors (not retryable)
    if (
      errorMessage.includes("400") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("404") ||
      errorMessage.includes("405") ||
      errorMessage.includes("bad request") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("forbidden") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("validation") ||
      errorMessage.includes("invalid")
    ) {
      return {
        type: "PERMANENT",
        retryable: false,
        reason: "Non-retryable client error",
      };
    }

    // Unknown errors (cautiously retryable)
    return {
      type: "UNKNOWN",
      retryable: true,
      suggestedDelay: 2000,
      reason: "Unknown error type, will retry cautiously",
    };
  }
}

// ============================================================================
// Circuit Breaker
// ============================================================================

class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private threshold: number,
    private resetTimeMs: number
  ) {}

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = "OPEN";
    }
  }

  canAttempt(): boolean {
    if (this.state === "CLOSED") {
      return true;
    }

    if (this.state === "OPEN") {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.resetTimeMs) {
        this.state = "HALF_OPEN";
        return true;
      }
      return false;
    }

    // HALF_OPEN state - allow one attempt
    return true;
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
    this.lastFailureTime = 0;
  }
}

// ============================================================================
// Enhanced Retry System
// ============================================================================

export class EnhancedRetrySystem {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private tracer = trace.getTracer("enhanced-retry-system");

  constructor(private config: RetryConfig = DEFAULT_RETRY_CONFIG) {}

  /**
   * Executes an operation with intelligent retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<RetryResult<T>> {
    const config = { ...this.config, ...customConfig };
    const startTime = Date.now();
    let lastError: Error | undefined;
    let lastErrorType: ErrorType | undefined;

    return await this.tracer.startActiveSpan(
      `retry:${operationName}`,
      async (span) => {
        span.setAttributes({
          "retry.operation": operationName,
          "retry.max_attempts": config.maxAttempts,
        });

        try {
          // Check circuit breaker
          if (config.enableCircuitBreaker) {
            const circuitBreaker = this.getCircuitBreaker(operationName, config);
            if (!circuitBreaker.canAttempt()) {
              throw new Error(
                `Circuit breaker is OPEN for ${operationName}. Too many recent failures.`
              );
            }
          }

          // Execute with retries
          for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
              span.setAttributes({
                "retry.attempt": attempt,
              });

              const result = await operation();

              // Success! Record and return
              if (config.enableCircuitBreaker) {
                this.getCircuitBreaker(operationName, config).recordSuccess();
              }

              span.setStatus({ code: SpanStatusCode.OK });
              span.setAttributes({
                "retry.success": true,
                "retry.attempts_used": attempt,
              });

              return {
                success: true,
                data: result,
                attempts: attempt,
                totalDurationMs: Date.now() - startTime,
              };
            } catch (error) {
              lastError = error instanceof Error ? error : new Error(String(error));
              const classification = ErrorClassifier.classify(error);
              lastErrorType = classification.type;

              span.addEvent("retry_attempt_failed", {
                attempt,
                error_type: classification.type,
                error_message: lastError.message,
                retryable: classification.retryable,
              });

              // If not retryable, fail immediately
              if (!classification.retryable) {
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: `Non-retryable error: ${classification.reason}`,
                });

                if (config.enableCircuitBreaker) {
                  this.getCircuitBreaker(operationName, config).recordFailure();
                }

                return {
                  success: false,
                  error: lastError,
                  attempts: attempt,
                  totalDurationMs: Date.now() - startTime,
                  errorType: lastErrorType,
                };
              }

              // If this was the last attempt, fail
              if (attempt >= config.maxAttempts) {
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: `Max retry attempts (${config.maxAttempts}) exceeded`,
                });

                if (config.enableCircuitBreaker) {
                  this.getCircuitBreaker(operationName, config).recordFailure();
                }

                return {
                  success: false,
                  error: lastError,
                  attempts: attempt,
                  totalDurationMs: Date.now() - startTime,
                  errorType: lastErrorType,
                };
              }

              // Calculate delay with exponential backoff and jitter
              const delay = this.calculateDelay(
                attempt,
                config,
                classification.suggestedDelay
              );

              span.addEvent("retry_waiting", {
                attempt,
                delay_ms: delay,
                next_attempt: attempt + 1,
              });

              await this.sleep(delay);
            }
          }

          // Should never reach here, but TypeScript needs it
          throw lastError || new Error("Unknown error in retry logic");
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });

          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
            attempts: config.maxAttempts,
            totalDurationMs: Date.now() - startTime,
            errorType: lastErrorType,
          };
        } finally {
          span.end();
        }
      }
    );
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(
    attempt: number,
    config: RetryConfig,
    suggestedDelay?: number
  ): number {
    // Use suggested delay if provided, otherwise exponential backoff
    const baseDelay = suggestedDelay ||
      config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);

    // Cap at max delay
    const cappedDelay = Math.min(baseDelay, config.maxDelayMs);

    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * config.jitterFactor * Math.random();

    return Math.floor(cappedDelay + jitter);
  }

  /**
   * Get or create circuit breaker for an operation
   */
  private getCircuitBreaker(operationName: string, config: RetryConfig): CircuitBreaker {
    if (!this.circuitBreakers.has(operationName)) {
      this.circuitBreakers.set(
        operationName,
        new CircuitBreaker(
          config.circuitBreakerThreshold,
          config.circuitBreakerResetTimeMs
        )
      );
    }
    return this.circuitBreakers.get(operationName)!;
  }

  /**
   * Reset circuit breaker for an operation
   */
  resetCircuitBreaker(operationName: string): void {
    this.circuitBreakers.get(operationName)?.reset();
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(operationName: string): string | null {
    return this.circuitBreakers.get(operationName)?.getState() || null;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics for monitoring
   */
  getStatistics(): {
    circuitBreakers: Array<{ operation: string; state: string }>;
  } {
    return {
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(
        ([operation, breaker]) => ({
          operation,
          state: breaker.getState(),
        })
      ),
    };
  }
}

// ============================================================================
// Global Retry System Instance
// ============================================================================

export const globalRetrySystem = new EnhancedRetrySystem();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Execute operation with default retry configuration
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  config?: Partial<RetryConfig>
): Promise<RetryResult<T>> {
  return globalRetrySystem.executeWithRetry(operation, operationName, config);
}

/**
 * Execute operation with aggressive retry (more attempts, longer delays)
 */
export async function withAggressiveRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<RetryResult<T>> {
  return globalRetrySystem.executeWithRetry(operation, operationName, {
    maxAttempts: 5,
    initialDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 3,
  });
}

/**
 * Execute operation with fast retry (fewer attempts, shorter delays)
 */
export async function withFastRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<RetryResult<T>> {
  return globalRetrySystem.executeWithRetry(operation, operationName, {
    maxAttempts: 2,
    initialDelayMs: 500,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
  });
}

// ============================================================================
// Export Everything
// ============================================================================

export default EnhancedRetrySystem;
