// scripts/test-retry-system.ts
/**
 * 🧪 Enhanced Retry System Test Suite
 *
 * Tests all retry system features:
 * - Basic retry functionality
 * - Error classification
 * - Exponential backoff
 * - Circuit breaker
 * - Different retry strategies
 *
 * Usage: npx tsx scripts/test-retry-system.ts
 */

import {
  EnhancedRetrySystem,
  ErrorClassifier,
  withRetry,
  withAggressiveRetry,
  withFastRetry,
  globalRetrySystem,
  type ErrorType,
} from "../src/lib/monitoring/retry/enhanced-retry";

// ============================================================================
// Test Utilities
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;

function logTest(name: string, passed: boolean, message?: string) {
  if (passed) {
    testsPassed++;
    console.log(`✅ ${name}`);
    if (message) console.log(`   ${message}`);
  } else {
    testsFailed++;
    console.log(`❌ ${name}`);
    if (message) console.log(`   ${message}`);
  }
}

function logSection(name: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${name}`);
  console.log(`${"=".repeat(60)}\n`);
}

// ============================================================================
// Mock Operations
// ============================================================================

class TestOperations {
  private callCount = 0;

  reset() {
    this.callCount = 0;
  }

  // Always succeeds
  async successfulOperation(): Promise<string> {
    return "Success!";
  }

  // Succeeds on 3rd attempt
  async eventuallySuccessful(): Promise<string> {
    this.callCount++;
    if (this.callCount < 3) {
      throw new Error("Temporary failure");
    }
    return "Success after retries!";
  }

  // Always fails with transient error
  async alwaysFailsTransient(): Promise<string> {
    throw new Error("500 Internal Server Error");
  }

  // Always fails with permanent error
  async alwaysFailsPermanent(): Promise<string> {
    throw new Error("400 Bad Request");
  }

  // Network error
  async networkError(): Promise<string> {
    throw new Error("ECONNREFUSED: Connection refused");
  }

  // Timeout error
  async timeoutError(): Promise<string> {
    throw new Error("Operation timed out");
  }

  // Rate limit error
  async rateLimitError(): Promise<string> {
    throw new Error("429 Too Many Requests");
  }

  // Random failure (50% chance)
  async randomFailure(): Promise<string> {
    if (Math.random() < 0.5) {
      throw new Error("Random transient error");
    }
    return "Success!";
  }
}

const ops = new TestOperations();

// ============================================================================
// Test 1: Error Classification
// ============================================================================

async function testErrorClassification() {
  logSection("Test 1: Error Classification");

  // Test network errors
  const networkError = new Error("ECONNREFUSED connection refused");
  const networkClass = ErrorClassifier.classify(networkError);
  logTest(
    "Network Error Classification",
    networkClass.type === "NETWORK" && networkClass.retryable === true,
    `Type: ${networkClass.type}, Retryable: ${networkClass.retryable}`,
  );

  // Test timeout errors
  const timeoutError = new Error("Operation timed out");
  const timeoutClass = ErrorClassifier.classify(timeoutError);
  logTest(
    "Timeout Error Classification",
    timeoutClass.type === "TIMEOUT" && timeoutClass.retryable === true,
    `Type: ${timeoutClass.type}, Retryable: ${timeoutClass.retryable}`,
  );

  // Test rate limit errors
  const rateLimitError = new Error("429 Too Many Requests");
  const rateLimitClass = ErrorClassifier.classify(rateLimitError);
  logTest(
    "Rate Limit Error Classification",
    rateLimitClass.type === "RATE_LIMIT" && rateLimitClass.retryable === true,
    `Type: ${rateLimitClass.type}, Retryable: ${rateLimitClass.retryable}`,
  );

  // Test transient errors
  const transientError = new Error("500 Internal Server Error");
  const transientClass = ErrorClassifier.classify(transientError);
  logTest(
    "Transient Error Classification",
    transientClass.type === "TRANSIENT" && transientClass.retryable === true,
    `Type: ${transientClass.type}, Retryable: ${transientClass.retryable}`,
  );

  // Test permanent errors
  const permanentError = new Error("400 Bad Request");
  const permanentClass = ErrorClassifier.classify(permanentError);
  logTest(
    "Permanent Error Classification",
    permanentClass.type === "PERMANENT" && permanentClass.retryable === false,
    `Type: ${permanentClass.type}, Retryable: ${permanentClass.retryable}`,
  );

  // Test unknown errors
  const unknownError = new Error("Something weird happened");
  const unknownClass = ErrorClassifier.classify(unknownError);
  logTest(
    "Unknown Error Classification",
    unknownClass.type === "UNKNOWN" && unknownClass.retryable === true,
    `Type: ${unknownClass.type}, Retryable: ${unknownClass.retryable}`,
  );
}

// ============================================================================
// Test 2: Basic Retry Functionality
// ============================================================================

async function testBasicRetry() {
  logSection("Test 2: Basic Retry Functionality");

  // Test successful operation (no retry needed)
  const result1 = await withRetry(
    () => ops.successfulOperation(),
    "successful-operation",
  );
  logTest(
    "Successful Operation (No Retry)",
    result1.success === true && result1.attempts === 1,
    `Success: ${result1.success}, Attempts: ${result1.attempts}`,
  );

  // Test eventually successful operation
  ops.reset();
  const result2 = await withRetry(
    () => ops.eventuallySuccessful(),
    "eventually-successful",
  );
  logTest(
    "Eventually Successful (With Retries)",
    result2.success === true && result2.attempts === 3,
    `Success: ${result2.success}, Attempts: ${result2.attempts}`,
  );

  // Test operation that always fails (transient)
  const result3 = await withRetry(
    () => ops.alwaysFailsTransient(),
    "always-fails-transient",
  );
  logTest(
    "Always Fails (Transient) - Retries Exhausted",
    result3.success === false && result3.attempts === 3,
    `Success: ${result3.success}, Attempts: ${result3.attempts}, Error: ${result3.errorType}`,
  );

  // Test operation that always fails (permanent)
  const result4 = await withRetry(
    () => ops.alwaysFailsPermanent(),
    "always-fails-permanent",
  );
  logTest(
    "Always Fails (Permanent) - No Retry",
    result4.success === false && result4.attempts === 1,
    `Success: ${result4.success}, Attempts: ${result4.attempts}, Error: ${result4.errorType}`,
  );
}

// ============================================================================
// Test 3: Retry Strategies
// ============================================================================

async function testRetryStrategies() {
  logSection("Test 3: Retry Strategies");

  // Test default retry
  ops.reset();
  const result1 = await withRetry(
    () => ops.eventuallySuccessful(),
    "default-retry",
  );
  logTest(
    "Default Retry Strategy",
    result1.success === true && result1.attempts <= 3,
    `Attempts: ${result1.attempts}, Duration: ${result1.totalDurationMs}ms`,
  );

  // Test aggressive retry (more attempts)
  ops.reset();
  const result2 = await withAggressiveRetry(
    () => ops.eventuallySuccessful(),
    "aggressive-retry",
  );
  logTest(
    "Aggressive Retry Strategy",
    result2.success === true,
    `Attempts: ${result2.attempts}, Duration: ${result2.totalDurationMs}ms`,
  );

  // Test fast retry (fewer attempts, shorter delays)
  ops.reset();
  const result3 = await withFastRetry(
    () => ops.eventuallySuccessful(),
    "fast-retry",
  );
  logTest(
    "Fast Retry Strategy",
    result3.attempts <= 2, // Fast retry has max 2 attempts
    `Attempts: ${result3.attempts}, Duration: ${result3.totalDurationMs}ms`,
  );

  // Test custom retry configuration
  ops.reset();
  const result4 = await withRetry(
    () => ops.eventuallySuccessful(),
    "custom-retry",
    {
      maxAttempts: 5,
      initialDelayMs: 500,
      backoffMultiplier: 1.5,
    },
  );
  logTest(
    "Custom Retry Configuration",
    result4.success === true,
    `Attempts: ${result4.attempts}, Duration: ${result4.totalDurationMs}ms`,
  );
}

// ============================================================================
// Test 4: Exponential Backoff
// ============================================================================

async function testExponentialBackoff() {
  logSection("Test 4: Exponential Backoff");

  const retrySystem = new EnhancedRetrySystem({
    maxAttempts: 4,
    initialDelayMs: 100,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    jitterFactor: 0,
    enableCircuitBreaker: false,
    circuitBreakerThreshold: 5,
    circuitBreakerResetTimeMs: 60000,
  });

  const startTime = Date.now();
  ops.reset();

  const result = await retrySystem.executeWithRetry(
    () => ops.eventuallySuccessful(),
    "backoff-test",
  );

  const totalTime = Date.now() - startTime;

  // Expected delays: 0ms, 100ms, 200ms = ~300ms minimum
  // With operation time, should be around 300-500ms
  logTest(
    "Exponential Backoff Timing",
    totalTime >= 300 && totalTime < 1000,
    `Total time: ${totalTime}ms, Attempts: ${result.attempts}`,
  );

  logTest(
    "Backoff Success",
    result.success === true && result.attempts === 3,
    `Success: ${result.success}, Attempts: ${result.attempts}`,
  );
}

// ============================================================================
// Test 5: Circuit Breaker
// ============================================================================

async function testCircuitBreaker() {
  logSection("Test 5: Circuit Breaker");

  const retrySystem = new EnhancedRetrySystem({
    maxAttempts: 2,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 3,
    circuitBreakerResetTimeMs: 2000,
  });

  const operationName = "circuit-breaker-test";

  // Cause 3 failures to open circuit
  for (let i = 0; i < 3; i++) {
    await retrySystem.executeWithRetry(
      () => ops.alwaysFailsTransient(),
      operationName,
    );
  }

  // Circuit should be OPEN now
  const state1 = retrySystem.getCircuitBreakerState(operationName);
  logTest(
    "Circuit Breaker Opens After Threshold",
    state1 === "OPEN",
    `Circuit state: ${state1}`,
  );

  // Try to execute - should fail immediately without retries
  const result = await retrySystem.executeWithRetry(
    () => ops.successfulOperation(),
    operationName,
  );
  logTest(
    "Circuit Breaker Blocks Execution When Open",
    result.success === false,
    `Success: ${result.success}`,
  );

  // Wait for reset time
  console.log("   Waiting 2 seconds for circuit breaker reset...");
  await new Promise((resolve) => setTimeout(resolve, 2100));

  // Circuit should transition to HALF_OPEN and allow one attempt
  const result2 = await retrySystem.executeWithRetry(
    () => ops.successfulOperation(),
    operationName,
  );
  const state2 = retrySystem.getCircuitBreakerState(operationName);
  logTest(
    "Circuit Breaker Resets After Timeout",
    result2.success === true && state2 === "CLOSED",
    `Success: ${result2.success}, Circuit state: ${state2}`,
  );

  // Manual reset
  retrySystem.resetCircuitBreaker(operationName);
  const state3 = retrySystem.getCircuitBreakerState(operationName);
  logTest(
    "Manual Circuit Breaker Reset",
    state3 === "CLOSED",
    `Circuit state: ${state3}`,
  );
}

// ============================================================================
// Test 6: Error Type Handling
// ============================================================================

async function testErrorTypeHandling() {
  logSection("Test 6: Error Type Handling");

  // Network error
  const result1 = await withRetry(() => ops.networkError(), "network-error");
  logTest(
    "Network Error Retry",
    result1.success === false && result1.errorType === "NETWORK",
    `Error type: ${result1.errorType}, Attempts: ${result1.attempts}`,
  );

  // Timeout error
  const result2 = await withRetry(() => ops.timeoutError(), "timeout-error");
  logTest(
    "Timeout Error Retry",
    result2.success === false && result2.errorType === "TIMEOUT",
    `Error type: ${result2.errorType}, Attempts: ${result2.attempts}`,
  );

  // Rate limit error
  const result3 = await withRetry(
    () => ops.rateLimitError(),
    "rate-limit-error",
  );
  logTest(
    "Rate Limit Error Retry",
    result3.success === false && result3.errorType === "RATE_LIMIT",
    `Error type: ${result3.errorType}, Attempts: ${result3.attempts}`,
  );

  // Permanent error (should not retry)
  const result4 = await withRetry(
    () => ops.alwaysFailsPermanent(),
    "permanent-error",
  );
  logTest(
    "Permanent Error No Retry",
    result4.success === false &&
      result4.errorType === "PERMANENT" &&
      result4.attempts === 1,
    `Error type: ${result4.errorType}, Attempts: ${result4.attempts}`,
  );
}

// ============================================================================
// Test 7: Concurrent Retries
// ============================================================================

async function testConcurrentRetries() {
  logSection("Test 7: Concurrent Retries");

  const operations = Array.from({ length: 5 }, (_, i) => {
    return withRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (Math.random() < 0.3) {
        throw new Error("Random failure");
      }
      return `Result ${i}`;
    }, `concurrent-operation-${i}`);
  });

  const startTime = Date.now();
  const results = await Promise.all(operations);
  const totalTime = Date.now() - startTime;

  const successCount = results.filter((r) => r.success).length;

  logTest(
    "Concurrent Operations Execute in Parallel",
    totalTime < 1000, // Should be much faster than sequential
    `Total time: ${totalTime}ms`,
  );

  logTest(
    "Concurrent Operations Complete",
    results.length === 5,
    `Completed: ${results.length}/5, Successful: ${successCount}`,
  );
}

// ============================================================================
// Test 8: Retry System Statistics
// ============================================================================

async function testRetryStatistics() {
  logSection("Test 8: Retry System Statistics");

  const retrySystem = new EnhancedRetrySystem({
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 2,
    circuitBreakerResetTimeMs: 60000,
    maxAttempts: 2,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
  });

  // Execute some operations
  await retrySystem.executeWithRetry(
    () => ops.successfulOperation(),
    "stats-test-1",
  );
  await retrySystem.executeWithRetry(
    () => ops.alwaysFailsTransient(),
    "stats-test-2",
  );
  await retrySystem.executeWithRetry(
    () => ops.alwaysFailsTransient(),
    "stats-test-2",
  );

  const stats = retrySystem.getStatistics();

  logTest(
    "Statistics Collection",
    stats.circuitBreakers.length >= 2,
    `Circuit breakers tracked: ${stats.circuitBreakers.length}`,
  );

  console.log("\n   📊 Retry System Statistics:");
  stats.circuitBreakers.forEach((cb) => {
    console.log(`      ${cb.operation}: ${cb.state}`);
  });
}

// ============================================================================
// Test 9: Real-world Scenarios
// ============================================================================

async function testRealWorldScenarios() {
  logSection("Test 9: Real-world Scenarios");

  // Scenario 1: Database connection retry
  let dbAttempts = 0;
  const databaseConnect = async () => {
    dbAttempts++;
    if (dbAttempts < 2) {
      throw new Error("ECONNREFUSED: Database not ready");
    }
    return { connected: true, host: "localhost", port: 5432 };
  };

  dbAttempts = 0;
  const dbResult = await withRetry(databaseConnect, "database-connect");
  logTest(
    "Database Connection Retry",
    dbResult.success === true && dbResult.attempts === 2,
    `Connected: ${dbResult.success}, Attempts: ${dbResult.attempts}`,
  );

  // Scenario 2: API call with rate limiting
  let apiCalls = 0;
  const apiCall = async () => {
    apiCalls++;
    if (apiCalls < 3) {
      throw new Error("429 Too Many Requests");
    }
    return { data: "API response", status: 200 };
  };

  apiCalls = 0;
  const apiResult = await withRetry(apiCall, "api-call");
  logTest(
    "API Rate Limit Handling",
    apiResult.success === true && apiResult.attempts === 3,
    `Success: ${apiResult.success}, Attempts: ${apiResult.attempts}`,
  );

  // Scenario 3: File system operation
  let fsAttempts = 0;
  const fileOperation = async () => {
    fsAttempts++;
    if (fsAttempts === 1) {
      throw new Error("ENOENT: File not found");
    }
    return { read: true, size: 1024 };
  };

  fsAttempts = 0;
  const fsResult = await withRetry(fileOperation, "file-operation");
  logTest(
    "File System Operation Retry",
    fsResult.success === true && fsResult.attempts === 2,
    `Success: ${fsResult.success}, Attempts: ${fsResult.attempts}`,
  );
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     🧪 Enhanced Retry System Test Suite                   ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");

  const startTime = Date.now();

  try {
    await testErrorClassification();
    await testBasicRetry();
    await testRetryStrategies();
    await testExponentialBackoff();
    await testCircuitBreaker();
    await testErrorTypeHandling();
    await testConcurrentRetries();
    await testRetryStatistics();
    await testRealWorldScenarios();

    const duration = Date.now() - startTime;

    // Summary
    console.log("\n");
    console.log("═".repeat(60));
    console.log("📊 Test Summary");
    console.log("═".repeat(60));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(
      `📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`,
    );
    console.log("═".repeat(60));

    if (testsFailed === 0) {
      console.log(
        "\n🎉 All tests passed! Retry system is working perfectly.\n",
      );
      process.exit(0);
    } else {
      console.log(
        `\n⚠️  ${testsFailed} test(s) failed. Please review the output above.\n`,
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Test suite crashed:", error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
