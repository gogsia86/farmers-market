#!/usr/bin/env tsx

/**
 * 🔴 REDIS CONNECTION TEST & VALIDATION
 *
 * Tests Redis Cloud connection and validates all cache operations.
 * Provides detailed diagnostics for troubleshooting.
 *
 * Usage:
 *   npm run redis:test
 *   tsx scripts/test-redis-connection.ts
 *
 * Environment Variables Required:
 *   REDIS_HOST
 *   REDIS_PORT
 *   REDIS_PASSWORD
 *   REDIS_TLS_ENABLED (should be 'true' for Redis Cloud)
 */

import { checkRedisHealth, getRedisCache } from "@/lib/cache/redis";
import "dotenv/config";

// ============================================================================
// COLORS & FORMATTING
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(
  message: string,
  level: "info" | "success" | "error" | "warn" = "info"
) {
  const icons = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    warn: "⚠️",
  };
  const levelColors = {
    info: colors.blue,
    success: colors.green,
    error: colors.red,
    warn: colors.yellow,
  };

  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ${icons[level]} ${levelColors[level]}${message}${colors.reset}`
  );
}

function logSection(title: string) {
  console.log("\n" + "═".repeat(80));
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log("═".repeat(80));
}

function logSubsection(title: string) {
  console.log(`\n${colors.bright}${colors.magenta}${title}${colors.reset}`);
  console.log("─".repeat(80));
}

// ============================================================================
// CONFIGURATION CHECK
// ============================================================================

function checkConfiguration(): boolean {
  logSection("🔧 CONFIGURATION CHECK");

  const requiredVars = [
    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_PASSWORD",
    "REDIS_TLS_ENABLED",
  ];

  let allPresent = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      log(`Missing: ${varName}`, "error");
      allPresent = false;
    } else {
      // Mask password for security
      const displayValue =
        varName === "REDIS_PASSWORD" ? "***" + value.slice(-4) : value;
      log(`${varName}: ${displayValue}`, "success");
    }
  }

  // Optional vars
  const optionalVars = ["REDIS_DB", "REDIS_KEY_PREFIX", "REDIS_USERNAME"];
  console.log(`\n${colors.dim}Optional Variables:${colors.reset}`);
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      log(`${varName}: ${value}`, "info");
    } else {
      log(`${varName}: (using default)`, "warn");
    }
  }

  return allPresent;
}

// ============================================================================
// CONNECTION TEST
// ============================================================================

async function testConnection(): Promise<boolean> {
  logSection("🔌 CONNECTION TEST");

  try {
    log("Attempting to connect to Redis Cloud...", "info");

    const redis = getRedisCache();

    // Try to get the underlying client to test connection
    log("Initializing Redis client...", "info");

    // Set a test value
    const testKey = "test:connection:timestamp";
    const testValue = { timestamp: Date.now(), message: "Connection test" };

    log("Sending test write command...", "info");
    await redis.set(testKey, testValue, { ttl: 60 });
    log("Write successful!", "success");

    log("Sending test read command...", "info");
    const result = await redis.get<typeof testValue>(testKey);

    if (result && result.message === testValue.message) {
      log("Read successful! Data matches.", "success");
      log(
        `Received: ${JSON.stringify(result, null, 2)}`,
        "success"
      );
    } else {
      log("Read failed! Data mismatch.", "error");
      return false;
    }

    // Clean up test key
    await redis.delete(testKey);
    log("Cleanup successful", "success");

    return true;
  } catch (error) {
    log(`Connection failed: ${error}`, "error");
    if (error instanceof Error) {
      console.error(`${colors.red}Details: ${error.message}${colors.reset}`);
      if (error.stack) {
        console.error(`${colors.dim}${error.stack}${colors.reset}`);
      }
    }
    return false;
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

async function testHealthCheck(): Promise<boolean> {
  logSection("🏥 HEALTH CHECK");

  try {
    log("Running health check...", "info");
    const isHealthy = await checkRedisHealth();

    if (isHealthy) {
      log("Health check passed!", "success");
      return true;
    } else {
      log("Health check failed!", "error");
      return false;
    }
  } catch (error) {
    log(`Health check error: ${error}`, "error");
    return false;
  }
}

// ============================================================================
// CACHE OPERATIONS TEST
// ============================================================================

async function testCacheOperations(): Promise<boolean> {
  logSection("📦 CACHE OPERATIONS TEST");

  const redis = getRedisCache();
  let allPassed = true;

  // Test 1: Set and Get
  logSubsection("Test 1: Set and Get");
  try {
    const key = "test:operations:simple";
    const value = { id: 1, name: "Test Product", price: 19.99 };

    await redis.set(key, value, { ttl: 60 });
    log("Set operation: OK", "success");

    const retrieved = await redis.get<typeof value>(key);
    if (retrieved && retrieved.id === value.id) {
      log("Get operation: OK", "success");
    } else {
      log("Get operation: FAILED", "error");
      allPassed = false;
    }

    await redis.delete(key);
  } catch (error) {
    log(`Test 1 failed: ${error}`, "error");
    allPassed = false;
  }

  // Test 2: TTL Check
  logSubsection("Test 2: TTL (Time To Live)");
  try {
    const key = "test:operations:ttl";
    const value = "temporary data";

    await redis.set(key, value, { ttl: 30 });
    log("Set with TTL: OK", "success");

    const ttl = await redis.ttl(key);
    if (ttl > 0 && ttl <= 30) {
      log(`TTL check: OK (${ttl} seconds remaining)`, "success");
    } else {
      log(`TTL check: FAILED (got ${ttl})`, "error");
      allPassed = false;
    }

    await redis.delete(key);
  } catch (error) {
    log(`Test 2 failed: ${error}`, "error");
    allPassed = false;
  }

  // Test 3: Exists Check
  logSubsection("Test 3: Key Existence Check");
  try {
    const key = "test:operations:exists";
    const value = "test value";

    await redis.set(key, value, { ttl: 60 });

    const exists = await redis.exists(key);
    if (exists) {
      log("Exists check (present): OK", "success");
    } else {
      log("Exists check (present): FAILED", "error");
      allPassed = false;
    }

    await redis.delete(key);

    const notExists = await redis.exists(key);
    if (!notExists) {
      log("Exists check (deleted): OK", "success");
    } else {
      log("Exists check (deleted): FAILED", "error");
      allPassed = false;
    }
  } catch (error) {
    log(`Test 3 failed: ${error}`, "error");
    allPassed = false;
  }

  // Test 4: Pattern Deletion
  logSubsection("Test 4: Pattern Deletion");
  try {
    // Create multiple keys
    await redis.set("test:pattern:1", "value1", { ttl: 60 });
    await redis.set("test:pattern:2", "value2", { ttl: 60 });
    await redis.set("test:pattern:3", "value3", { ttl: 60 });
    log("Created 3 test keys", "success");

    // Delete by pattern
    const deleted = await redis.deletePattern("test:pattern:*");
    if (deleted === 3) {
      log(`Pattern deletion: OK (deleted ${deleted} keys)`, "success");
    } else {
      log(`Pattern deletion: WARNING (deleted ${deleted} keys, expected 3)`, "warn");
    }
  } catch (error) {
    log(`Test 4 failed: ${error}`, "error");
    allPassed = false;
  }

  // Test 5: Counter Increment
  logSubsection("Test 5: Counter Increment");
  try {
    const key = "test:operations:counter";

    const count1 = await redis.increment(key, 1);
    const count2 = await redis.increment(key, 5);
    const count3 = await redis.increment(key, 10);

    if (count1 === 1 && count2 === 6 && count3 === 16) {
      log(`Counter increment: OK (1 -> 6 -> 16)`, "success");
    } else {
      log(
        `Counter increment: FAILED (got ${count1}, ${count2}, ${count3})`,
        "error"
      );
      allPassed = false;
    }

    await redis.delete(key);
  } catch (error) {
    log(`Test 5 failed: ${error}`, "error");
    allPassed = false;
  }

  // Test 6: GetOrSet Pattern
  logSubsection("Test 6: GetOrSet Pattern (Cache Miss & Hit)");
  try {
    const key = "test:operations:getorset";
    let factoryCalls = 0;

    const factory = async () => {
      factoryCalls++;
      log(`Factory called (call #${factoryCalls})`, "info");
      return { data: "expensive computation result" };
    };

    // First call - cache miss
    const result1 = await redis.getOrSet(key, factory, { ttl: 60 });
    if (factoryCalls === 1) {
      log("GetOrSet (miss): OK - Factory called", "success");
    } else {
      log("GetOrSet (miss): FAILED", "error");
      allPassed = false;
    }

    // Second call - cache hit
    const result2 = await redis.getOrSet(key, factory, { ttl: 60 });
    if (factoryCalls === 1) {
      log("GetOrSet (hit): OK - Factory not called", "success");
    } else {
      log("GetOrSet (hit): FAILED - Factory called again", "error");
      allPassed = false;
    }

    await redis.delete(key);
  } catch (error) {
    log(`Test 6 failed: ${error}`, "error");
    allPassed = false;
  }

  return allPassed;
}

// ============================================================================
// PERFORMANCE TEST
// ============================================================================

async function testPerformance(): Promise<void> {
  logSection("⚡ PERFORMANCE TEST");

  const redis = getRedisCache();

  // Test 1: Write Performance
  logSubsection("Test 1: Write Performance (100 operations)");
  try {
    const iterations = 100;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await redis.set(`test:perf:write:${i}`, { index: i, data: "test" }, {
        ttl: 60,
      });
    }

    const duration = Date.now() - startTime;
    const opsPerSecond = Math.round((iterations / duration) * 1000);

    log(`Completed ${iterations} writes in ${duration}ms`, "success");
    log(`Performance: ${opsPerSecond} ops/second`, "success");

    // Cleanup
    await redis.deletePattern("test:perf:write:*");
  } catch (error) {
    log(`Write performance test failed: ${error}`, "error");
  }

  // Test 2: Read Performance
  logSubsection("Test 2: Read Performance (100 operations)");
  try {
    const key = "test:perf:read";
    await redis.set(key, { data: "test data" }, { ttl: 60 });

    const iterations = 100;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await redis.get(key);
    }

    const duration = Date.now() - startTime;
    const opsPerSecond = Math.round((iterations / duration) * 1000);

    log(`Completed ${iterations} reads in ${duration}ms`, "success");
    log(`Performance: ${opsPerSecond} ops/second`, "success");

    await redis.delete(key);
  } catch (error) {
    log(`Read performance test failed: ${error}`, "error");
  }

  // Test 3: Latency Test
  logSubsection("Test 3: Round-Trip Latency (10 samples)");
  try {
    const key = "test:perf:latency";
    const latencies: number[] = [];

    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await redis.set(key, { sample: i }, { ttl: 60 });
      await redis.get(key);
      const latency = Date.now() - start;
      latencies.push(latency);
    }

    const avgLatency = Math.round(
      latencies.reduce((a, b) => a + b, 0) / latencies.length
    );
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);

    log(`Average latency: ${avgLatency}ms`, "success");
    log(`Min latency: ${minLatency}ms`, "success");
    log(`Max latency: ${maxLatency}ms`, "success");

    if (avgLatency < 50) {
      log("Latency: EXCELLENT (< 50ms)", "success");
    } else if (avgLatency < 100) {
      log("Latency: GOOD (50-100ms)", "success");
    } else if (avgLatency < 200) {
      log("Latency: ACCEPTABLE (100-200ms)", "warn");
    } else {
      log("Latency: SLOW (> 200ms)", "warn");
    }

    await redis.delete(key);
  } catch (error) {
    log(`Latency test failed: ${error}`, "error");
  }
}

// ============================================================================
// REAL-WORLD SIMULATION
// ============================================================================

async function testRealWorldScenarios(): Promise<void> {
  logSection("🌍 REAL-WORLD SCENARIOS");

  const redis = getRedisCache();

  // Scenario 1: Product Listing Cache
  logSubsection("Scenario 1: Product Listing Cache");
  try {
    const products = [
      { id: 1, name: "Organic Tomatoes", price: 5.99, inStock: true },
      { id: 2, name: "Fresh Eggs", price: 6.99, inStock: true },
      { id: 3, name: "Organic Lettuce", price: 3.99, inStock: true },
    ];

    // Cache product list
    await redis.set("products:featured", products, { ttl: 300 });
    log("Cached product listing (5 min TTL)", "success");

    // Retrieve from cache
    const cached = await redis.get<typeof products>("products:featured");
    if (cached && cached.length === 3) {
      log("Retrieved product listing from cache", "success");
    }

    await redis.delete("products:featured");
  } catch (error) {
    log(`Scenario 1 failed: ${error}`, "error");
  }

  // Scenario 2: User Session
  logSubsection("Scenario 2: User Session Management");
  try {
    const sessionId = "session:user123";
    const sessionData = {
      userId: "user123",
      email: "test@example.com",
      role: "CUSTOMER",
      loginAt: Date.now(),
    };

    // Store session (24 hour TTL)
    await redis.set(sessionId, sessionData, { ttl: 86400 });
    log("Stored user session (24h TTL)", "success");

    // Retrieve session
    const session = await redis.get<typeof sessionData>(sessionId);
    if (session && session.userId === "user123") {
      log("Retrieved user session", "success");
    }

    await redis.delete(sessionId);
  } catch (error) {
    log(`Scenario 2 failed: ${error}`, "error");
  }

  // Scenario 3: Rate Limiting
  logSubsection("Scenario 3: Rate Limiting Simulation");
  try {
    const rateLimitKey = "ratelimit:api:user123";
    const limit = 10;
    let requests = 0;

    // Simulate 15 API requests
    for (let i = 0; i < 15; i++) {
      const count = await redis.increment(rateLimitKey, 1);

      if (count <= limit) {
        requests++;
      } else {
        log(`Request ${i + 1}: Rate limited (${count}/${limit})`, "warn");
        break;
      }
    }

    if (requests === limit) {
      log(`Rate limiting works! Allowed ${requests}/${limit} requests`, "success");
    }

    await redis.delete(rateLimitKey);
  } catch (error) {
    log(`Scenario 3 failed: ${error}`, "error");
  }
}

// ============================================================================
// SUMMARY & RECOMMENDATIONS
// ============================================================================

function printSummary(results: {
  config: boolean;
  connection: boolean;
  health: boolean;
  operations: boolean;
}) {
  logSection("📊 TEST SUMMARY");

  const tests = [
    { name: "Configuration Check", passed: results.config },
    { name: "Connection Test", passed: results.connection },
    { name: "Health Check", passed: results.health },
    { name: "Cache Operations", passed: results.operations },
  ];

  console.log(
    `\n${colors.bright}Test Results:${colors.reset}`
  );
  tests.forEach((test) => {
    const icon = test.passed ? "✅" : "❌";
    const status = test.passed ? colors.green : colors.red;
    console.log(`  ${icon} ${status}${test.name}${colors.reset}`);
  });

  const allPassed = Object.values(results).every((v) => v);

  if (allPassed) {
    console.log(
      `\n${colors.green}${colors.bright}🎉 ALL TESTS PASSED!${colors.reset}`
    );
    console.log(
      `\n${colors.cyan}Redis is ready for production use!${colors.reset}`
    );
    console.log(`\n${colors.dim}Next steps:${colors.reset}`);
    console.log(`  1. Copy .env.redis to .env.local`);
    console.log(`  2. Run npm run dev to start the app`);
    console.log(`  3. Monitor cache performance in production`);
  } else {
    console.log(
      `\n${colors.red}${colors.bright}❌ SOME TESTS FAILED${colors.reset}`
    );
    console.log(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
    console.log(
      `  1. Check environment variables in .env.local`
    );
    console.log(`  2. Verify Redis Cloud connection details`);
    console.log(
      `  3. Ensure REDIS_TLS_ENABLED=true for Redis Cloud`
    );
    console.log(`  4. Check firewall/network settings`);
    console.log(
      `  5. Review error messages above for details`
    );
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.clear();
  logSection("🔴 REDIS CONNECTION TEST & VALIDATION");
  console.log(
    `${colors.dim}Testing Redis Cloud connection...${colors.reset}\n`
  );

  const results = {
    config: false,
    connection: false,
    health: false,
    operations: false,
  };

  try {
    // Step 1: Check Configuration
    results.config = checkConfiguration();
    if (!results.config) {
      log(
        "Configuration incomplete. Please set required environment variables.",
        "error"
      );
      printSummary(results);
      process.exit(1);
    }

    // Step 2: Test Connection
    results.connection = await testConnection();
    if (!results.connection) {
      log("Connection failed. Cannot proceed with further tests.", "error");
      printSummary(results);
      process.exit(1);
    }

    // Step 3: Health Check
    results.health = await testHealthCheck();

    // Step 4: Cache Operations
    results.operations = await testCacheOperations();

    // Step 5: Performance Tests (optional, doesn't affect pass/fail)
    await testPerformance();

    // Step 6: Real-world Scenarios (optional, doesn't affect pass/fail)
    await testRealWorldScenarios();

    // Print Summary
    printSummary(results);

    // Cleanup and disconnect
    const redis = getRedisCache();
    await redis.disconnect();
    log("Disconnected from Redis", "info");

    process.exit(results.operations ? 0 : 1);
  } catch (error) {
    log(`Fatal error: ${error}`, "error");
    if (error instanceof Error && error.stack) {
      console.error(`${colors.dim}${error.stack}${colors.reset}`);
    }
    process.exit(1);
  }
}

// Run if executed directly
main();

export { main };
