#!/usr/bin/env tsx

/**
 * 🔍 DATABASE HEALTH DIAGNOSTIC SCRIPT
 *
 * Comprehensive database connectivity and health diagnostics
 * for the Farmers Market Platform
 *
 * Features:
 * - Connection string validation
 * - Network connectivity tests
 * - Query performance tests
 * - Schema validation
 * - Connection pool monitoring
 * - Detailed error diagnostics
 *
 * Usage:
 *   npm run diagnose:db
 *   tsx scripts/diagnose-database.ts
 *   tsx scripts/diagnose-database.ts --verbose
 */

import { database } from '@/lib/database';

// ============================================================================
// TYPES
// ============================================================================

interface DiagnosticResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: unknown;
  duration?: number;
}

interface DatabaseConfig {
  url: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  sslMode?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const VERBOSE = process.argv.includes('--verbose');
const TIMEOUT_MS = 10000; // 10 seconds

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse DATABASE_URL to extract components
 */
function parseDatabaseUrl(url: string): DatabaseConfig {
  try {
    // Remove password for safe logging
    const safeUrl = url.replace(/:([^:@]+)@/, ':****@');

    const urlObj = new URL(url);

    return {
      url: safeUrl,
      host: urlObj.hostname,
      port: urlObj.port ? parseInt(urlObj.port) : 5432,
      database: urlObj.pathname.slice(1),
      user: urlObj.username,
      sslMode: urlObj.searchParams.get('sslmode') || urlObj.searchParams.get('ssl') || 'prefer'
    };
  } catch (error) {
    return {
      url: 'INVALID_URL',
      host: 'unknown',
      port: 5432,
      database: 'unknown',
      user: 'unknown'
    };
  }
}

/**
 * Run a diagnostic test with timeout
 */
async function runDiagnostic(
  testName: string,
  testFn: () => Promise<DiagnosticResult>
): Promise<DiagnosticResult> {
  const startTime = Date.now();

  try {
    const timeoutPromise = new Promise<DiagnosticResult>((_, reject) => {
      setTimeout(() => reject(new Error('Test timeout')), TIMEOUT_MS);
    });

    const result = await Promise.race([testFn(), timeoutPromise]);
    result.duration = Date.now() - startTime;

    return result;
  } catch (error) {
    return {
      test: testName,
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      details: VERBOSE ? error : undefined
    };
  }
}

/**
 * Print diagnostic result
 */
function printResult(result: DiagnosticResult) {
  const emoji = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
  const duration = result.duration ? ` (${result.duration}ms)` : '';

  console.log(`${emoji} ${result.test}${duration}`);
  console.log(`   ${result.message}`);

  if (VERBOSE && result.details) {
    console.log(`   Details:`, result.details);
  }

  console.log('');
}

// ============================================================================
// DIAGNOSTIC TESTS
// ============================================================================

/**
 * Test 1: Environment Configuration
 */
async function testEnvironmentConfig(): Promise<DiagnosticResult> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      test: 'Environment Configuration',
      status: 'FAIL',
      message: 'DATABASE_URL environment variable is not set',
      details: {
        availableVars: Object.keys(process.env).filter(k => k.includes('DATABASE'))
      }
    };
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    return {
      test: 'Environment Configuration',
      status: 'FAIL',
      message: 'DATABASE_URL does not appear to be a valid PostgreSQL connection string',
      details: { starts_with: databaseUrl.substring(0, 15) }
    };
  }

  const config = parseDatabaseUrl(databaseUrl);

  return {
    test: 'Environment Configuration',
    status: 'PASS',
    message: 'DATABASE_URL is properly configured',
    details: config
  };
}

/**
 * Test 2: Database Connection
 */
async function testDatabaseConnection(): Promise<DiagnosticResult> {
  try {
    await database.$connect();

    return {
      test: 'Database Connection',
      status: 'PASS',
      message: 'Successfully connected to database'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Parse common connection errors
    let details = {};
    if (errorMessage.includes('ECONNREFUSED')) {
      details = {
        issue: 'Connection refused - database server may be down or unreachable',
        suggestions: [
          'Check if PostgreSQL server is running',
          'Verify host and port are correct',
          'Check firewall rules'
        ]
      };
    } else if (errorMessage.includes('ENOTFOUND')) {
      details = {
        issue: 'Host not found - DNS resolution failed',
        suggestions: [
          'Verify hostname in DATABASE_URL',
          'Check network connectivity',
          'Confirm DNS is resolving correctly'
        ]
      };
    } else if (errorMessage.includes('authentication failed')) {
      details = {
        issue: 'Authentication failed - incorrect credentials',
        suggestions: [
          'Verify username and password',
          'Check database user permissions',
          'Confirm database exists'
        ]
      };
    } else if (errorMessage.includes('timeout')) {
      details = {
        issue: 'Connection timeout - network or server issues',
        suggestions: [
          'Check network latency',
          'Verify firewall allows connections',
          'Increase connection timeout if needed'
        ]
      };
    }

    return {
      test: 'Database Connection',
      status: 'FAIL',
      message: `Failed to connect: ${errorMessage}`,
      details
    };
  }
}

/**
 * Test 3: Basic Query Execution
 */
async function testBasicQuery(): Promise<DiagnosticResult> {
  try {
    const result = await database.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;

    if (result[0]?.result === 1) {
      return {
        test: 'Basic Query Execution',
        status: 'PASS',
        message: 'Successfully executed test query'
      };
    }

    return {
      test: 'Basic Query Execution',
      status: 'WARN',
      message: 'Query executed but returned unexpected result',
      details: { result }
    };
  } catch (error) {
    return {
      test: 'Basic Query Execution',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Query execution failed',
      details: VERBOSE ? error : undefined
    };
  }
}

/**
 * Test 4: Schema Validation
 */
async function testSchemaValidation(): Promise<DiagnosticResult> {
  try {
    // Check if core tables exist
    const tables = await database.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    const tableNames = tables.map(t => t.tablename);
    const requiredTables = ['User', 'Farm', 'Product', 'Order'];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      return {
        test: 'Schema Validation',
        status: 'FAIL',
        message: `Missing required tables: ${missingTables.join(', ')}`,
        details: {
          foundTables: tableNames,
          missingTables,
          suggestions: [
            'Run database migrations: npx prisma migrate deploy',
            'Or push schema: npx prisma db push'
          ]
        }
      };
    }

    return {
      test: 'Schema Validation',
      status: 'PASS',
      message: `All ${requiredTables.length} required tables exist`,
      details: { tables: tableNames }
    };
  } catch (error) {
    return {
      test: 'Schema Validation',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Schema validation failed',
      details: VERBOSE ? error : undefined
    };
  }
}

/**
 * Test 5: Query Performance
 */
async function testQueryPerformance(): Promise<DiagnosticResult> {
  try {
    const queries = [
      { name: 'Simple SELECT', query: database.$queryRaw`SELECT 1` },
      { name: 'Table Count', query: database.farm.count() },
      { name: 'Complex Query', query: database.farm.findMany({ take: 10, include: { owner: true } }) }
    ];

    const results = await Promise.all(
      queries.map(async ({ name, query }) => {
        const start = Date.now();
        await query;
        return { name, duration: Date.now() - start };
      })
    );

    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    if (avgDuration > 1000) {
      return {
        test: 'Query Performance',
        status: 'WARN',
        message: `Average query time is high (${avgDuration.toFixed(0)}ms)`,
        details: { results }
      };
    }

    return {
      test: 'Query Performance',
      status: 'PASS',
      message: `Good performance (avg ${avgDuration.toFixed(0)}ms)`,
      details: { results }
    };
  } catch (error) {
    return {
      test: 'Query Performance',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Performance test failed',
      details: VERBOSE ? error : undefined
    };
  }
}

/**
 * Test 6: Connection Pool Health
 */
async function testConnectionPool(): Promise<DiagnosticResult> {
  try {
    // Execute multiple queries in parallel to test connection pool
    const parallelQueries = Array(5).fill(null).map(() =>
      database.$queryRaw`SELECT pg_sleep(0.1), 1 as result`
    );

    const start = Date.now();
    await Promise.all(parallelQueries);
    const duration = Date.now() - start;

    // If it takes significantly longer than 100ms, pool might be limited
    if (duration > 600) {
      return {
        test: 'Connection Pool Health',
        status: 'WARN',
        message: `Connection pool may be limited (${duration}ms for 5 parallel queries)`,
        details: {
          duration,
          suggestion: 'Consider increasing connection pool size in DATABASE_URL'
        }
      };
    }

    return {
      test: 'Connection Pool Health',
      status: 'PASS',
      message: `Connection pool is healthy (${duration}ms for 5 parallel queries)`,
      details: { duration }
    };
  } catch (error) {
    return {
      test: 'Connection Pool Health',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Pool test failed',
      details: VERBOSE ? error : undefined
    };
  }
}

/**
 * Test 7: Write Operations
 */
async function testWriteOperations(): Promise<DiagnosticResult> {
  try {
    // Try to create and delete a test record
    const testData = {
      email: `test-${Date.now()}@test.com`,
      name: 'Database Test User',
      password: 'test-password-hash'
    };

    const created = await database.user.create({
      data: testData
    });

    await database.user.delete({
      where: { id: created.id }
    });

    return {
      test: 'Write Operations',
      status: 'PASS',
      message: 'Successfully created and deleted test record'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('read-only')) {
      return {
        test: 'Write Operations',
        status: 'WARN',
        message: 'Database is in read-only mode',
        details: {
          suggestion: 'Check database permissions and read-replica configuration'
        }
      };
    }

    return {
      test: 'Write Operations',
      status: 'FAIL',
      message: `Write operation failed: ${errorMessage}`,
      details: VERBOSE ? error : undefined
    };
  }
}

/**
 * Test 8: Database Metrics
 */
async function testDatabaseMetrics(): Promise<DiagnosticResult> {
  try {
    const metrics = await database.$queryRaw<Array<{
      database_size: string;
      active_connections: bigint;
      max_connections: number;
    }>>`
      SELECT
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        COUNT(*) FILTER (WHERE state = 'active') as active_connections,
        current_setting('max_connections')::int as max_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY max_connections
    `;

    const metric = metrics[0];

    if (!metric) {
      return {
        test: 'Database Metrics',
        status: 'WARN',
        message: 'Could not retrieve database metrics',
        details: { metrics }
      };
    }

    const activeConnections = Number(metric.active_connections);
    const maxConnections = metric.max_connections;
    const connectionUsage = (activeConnections / maxConnections) * 100;

    let status: 'PASS' | 'WARN' = 'PASS';
    let message = `Database size: ${metric.database_size}, Connections: ${activeConnections}/${maxConnections}`;

    if (connectionUsage > 80) {
      status = 'WARN';
      message += ` (${connectionUsage.toFixed(0)}% usage - consider increasing max_connections)`;
    }

    return {
      test: 'Database Metrics',
      status,
      message,
      details: {
        databaseSize: metric.database_size,
        activeConnections,
        maxConnections,
        connectionUsagePercent: connectionUsage.toFixed(2)
      }
    };
  } catch (error) {
    return {
      test: 'Database Metrics',
      status: 'WARN',
      message: 'Could not retrieve metrics (may require elevated permissions)',
      details: VERBOSE ? error : undefined
    };
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🔍 DATABASE HEALTH DIAGNOSTICS');
  console.log('=' .repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Verbose: ${VERBOSE ? 'Yes' : 'No'}`);
  console.log('=' .repeat(60));
  console.log('');

  const tests = [
    { name: 'Environment Configuration', fn: testEnvironmentConfig },
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Basic Query Execution', fn: testBasicQuery },
    { name: 'Schema Validation', fn: testSchemaValidation },
    { name: 'Query Performance', fn: testQueryPerformance },
    { name: 'Connection Pool Health', fn: testConnectionPool },
    { name: 'Write Operations', fn: testWriteOperations },
    { name: 'Database Metrics', fn: testDatabaseMetrics }
  ];

  const results: DiagnosticResult[] = [];

  for (const test of tests) {
    const result = await runDiagnostic(test.name, test.fn);
    results.push(result);
    printResult(result);
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('SUMMARY');
  console.log('=' .repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');

  const overallStatus = failed > 0 ? 'CRITICAL' : warned > 0 ? 'WARNING' : 'HEALTHY';
  const statusEmoji = overallStatus === 'HEALTHY' ? '✅' : overallStatus === 'WARNING' ? '⚠️' : '❌';

  console.log(`${statusEmoji} Overall Status: ${overallStatus}`);
  console.log('');

  // Action items
  if (failed > 0 || warned > 0) {
    console.log('📋 RECOMMENDED ACTIONS:');
    console.log('-'.repeat(60));

    const failedTests = results.filter(r => r.status === 'FAIL' || r.status === 'WARN');
    failedTests.forEach(test => {
      console.log(`\n• ${test.test}:`);
      console.log(`  ${test.message}`);

      if (test.details && typeof test.details === 'object' && 'suggestions' in test.details) {
        const suggestions = (test.details as { suggestions: string[] }).suggestions;
        suggestions.forEach(s => console.log(`    - ${s}`));
      }
    });

    console.log('');
  }

  // Disconnect
  await database.$disconnect();

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Diagnostic script failed:', error);
    process.exit(1);
  });
}

export { main as diagnoseDatabaseHealth };
