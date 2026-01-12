#!/usr/bin/env tsx

/**
 * 🔍 DATABASE VALIDATION SCRIPT
 *
 * Validates database configuration and connection health
 * Run this script to verify your database setup is correct
 *
 * Usage:
 *   npm run validate:db
 *   tsx scripts/validate-database.ts
 *
 * @reference docs/DATABASE_SETUP.md
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colorMap = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.cyan,
  };

  console.log(`${colorMap[type]}${icons[type]} ${message}${colors.reset}`);
}

function header(text: string) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.white}${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}\n`);
}

interface ValidationResult {
  passed: number;
  failed: number;
  warnings: number;
  tests: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    duration?: number;
  }>;
}

const results: ValidationResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function addResult(
  name: string,
  status: 'pass' | 'fail' | 'warning',
  message: string,
  duration?: number
) {
  results.tests.push({ name, status, message, duration });

  if (status === 'pass') results.passed++;
  if (status === 'fail') results.failed++;
  if (status === 'warning') results.warnings++;
}

// Validation Functions

async function validateEnvironmentVariables(): Promise<void> {
  header('📋 Validating Environment Variables');

  // Check DATABASE_URL
  if (process.env.DATABASE_URL) {
    log('DATABASE_URL is set', 'success');
    addResult('DATABASE_URL', 'pass', 'Environment variable is set');

    // Validate URL format
    const url = process.env.DATABASE_URL;
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
      log('DATABASE_URL format is valid (Direct PostgreSQL)', 'success');
      addResult('DATABASE_URL Format', 'pass', 'Valid PostgreSQL URL');
    } else if (url.startsWith('prisma+postgres://')) {
      log('DATABASE_URL format is valid (Prisma Accelerate)', 'success');
      addResult('DATABASE_URL Format', 'pass', 'Valid Prisma Accelerate URL');
    } else {
      log('DATABASE_URL format is invalid', 'error');
      addResult('DATABASE_URL Format', 'fail', 'Invalid URL format');
    }

    // Redact and display URL
    const redactedUrl = redactDatabaseUrl(url);
    console.log(`   URL: ${colors.cyan}${redactedUrl}${colors.reset}`);
  } else {
    log('DATABASE_URL is NOT set', 'error');
    addResult('DATABASE_URL', 'fail', 'Environment variable is missing');
  }

  // Check DATABASE_URL_ACCELERATE (optional)
  if (process.env.DATABASE_URL_ACCELERATE) {
    log('DATABASE_URL_ACCELERATE is set (optional)', 'success');
    addResult('DATABASE_URL_ACCELERATE', 'pass', 'Accelerate URL is configured');

    const redactedUrl = redactDatabaseUrl(process.env.DATABASE_URL_ACCELERATE);
    console.log(`   URL: ${colors.cyan}${redactedUrl}${colors.reset}`);
  } else {
    log('DATABASE_URL_ACCELERATE is not set (optional for production)', 'warning');
    addResult('DATABASE_URL_ACCELERATE', 'warning', 'Not configured (optional)');
  }

  // Check NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  log(`NODE_ENV: ${nodeEnv}`, 'info');
  console.log(`   Environment: ${colors.cyan}${nodeEnv}${colors.reset}`);
}

function redactDatabaseUrl(url: string): string {
  try {
    if (url.startsWith('prisma+postgres://')) {
      return 'prisma+postgres://accelerate.prisma-data.net/?api_key=[REDACTED]';
    }

    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '[REDACTED]';
    }
    if (parsed.username && parsed.username.length > 20) {
      parsed.username = '[REDACTED]';
    }
    return parsed.toString();
  } catch {
    return '[INVALID_URL]';
  }
}

async function validateDatabaseConnection(): Promise<void> {
  header('🔌 Testing Database Connection');

  if (!process.env.DATABASE_URL) {
    log('Skipping connection test - DATABASE_URL not set', 'error');
    addResult('Database Connection', 'fail', 'Cannot test - URL not set');
    return;
  }

  // Test with pg Pool (direct connection)
  if (process.env.DATABASE_URL.startsWith('postgres')) {
    try {
      log('Testing direct PostgreSQL connection...', 'info');

      const startTime = Date.now();
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        connectionTimeoutMillis: 10000,
      });

      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      client.release();
      await pool.end();

      const duration = Date.now() - startTime;

      log(`Database connection successful (${duration}ms)`, 'success');
      addResult('Direct Connection', 'pass', `Connected in ${duration}ms`, duration);

      console.log(`   Server Time: ${colors.cyan}${result.rows[0].current_time}${colors.reset}`);
      console.log(`   Version: ${colors.cyan}${result.rows[0].version.split(',')[0]}${colors.reset}`);

      // Performance check
      if (duration > 5000) {
        log('Connection is slow (>5 seconds)', 'warning');
        addResult('Connection Speed', 'warning', `Slow connection: ${duration}ms`);
      } else if (duration > 1000) {
        log('Connection latency is moderate (>1 second)', 'warning');
        addResult('Connection Speed', 'warning', `Moderate latency: ${duration}ms`);
      } else {
        log('Connection speed is good', 'success');
        addResult('Connection Speed', 'pass', `Fast connection: ${duration}ms`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Database connection failed: ${message}`, 'error');
      addResult('Direct Connection', 'fail', message);
    }
  }
}

async function validatePrismaClient(): Promise<void> {
  header('🔧 Testing Prisma Client');

  if (!process.env.DATABASE_URL) {
    log('Skipping Prisma test - DATABASE_URL not set', 'error');
    addResult('Prisma Client', 'fail', 'Cannot test - URL not set');
    return;
  }

  try {
    log('Initializing Prisma Client...', 'info');

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    const startTime = Date.now();
    await prisma.$connect();
    const connectDuration = Date.now() - startTime;

    log(`Prisma Client connected (${connectDuration}ms)`, 'success');
    addResult('Prisma Connect', 'pass', `Connected in ${connectDuration}ms`, connectDuration);

    // Test a simple query
    try {
      const queryStart = Date.now();
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      const queryDuration = Date.now() - queryStart;

      log(`Test query successful (${queryDuration}ms)`, 'success');
      addResult('Prisma Query', 'pass', `Query executed in ${queryDuration}ms`, queryDuration);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Test query failed: ${message}`, 'error');
      addResult('Prisma Query', 'fail', message);
    }

    await prisma.$disconnect();
    log('Prisma Client disconnected', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Prisma Client error: ${message}`, 'error');
    addResult('Prisma Client', 'fail', message);
  }
}

async function validateDatabaseSchema(): Promise<void> {
  header('📊 Validating Database Schema');

  if (!process.env.DATABASE_URL) {
    log('Skipping schema validation - DATABASE_URL not set', 'error');
    addResult('Schema Validation', 'fail', 'Cannot test - URL not set');
    return;
  }

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    await prisma.$connect();

    // Check if key tables exist
    const tables = [
      'User',
      'Farm',
      'Product',
      'Order',
      'Session',
    ];

    for (const table of tables) {
      try {
        // Try to query the table
        await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM "${table}" LIMIT 1`);
        log(`Table "${table}" exists`, 'success');
        addResult(`Table: ${table}`, 'pass', 'Table exists and is accessible');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (message.includes('does not exist')) {
          log(`Table "${table}" does not exist`, 'error');
          addResult(`Table: ${table}`, 'fail', 'Table missing - run migrations');
        } else {
          log(`Error checking table "${table}": ${message}`, 'error');
          addResult(`Table: ${table}`, 'fail', message);
        }
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Schema validation error: ${message}`, 'error');
    addResult('Schema Validation', 'fail', message);
  }
}

async function validateConnectionPool(): Promise<void> {
  header('🏊 Testing Connection Pool');

  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgres')) {
    log('Skipping pool test - not using direct PostgreSQL connection', 'warning');
    addResult('Connection Pool', 'warning', 'Not applicable for this connection type');
    return;
  }

  try {
    log('Testing connection pool...', 'info');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
    });

    // Test multiple concurrent connections
    const connections = await Promise.all([
      pool.query('SELECT 1'),
      pool.query('SELECT 2'),
      pool.query('SELECT 3'),
    ]);

    log(`Connection pool handled ${connections.length} concurrent queries`, 'success');
    addResult('Connection Pool', 'pass', `Successfully handled ${connections.length} concurrent connections`);

    await pool.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Connection pool error: ${message}`, 'error');
    addResult('Connection Pool', 'fail', message);
  }
}

function printSummary(): void {
  header('📈 Validation Summary');

  console.log(`${colors.bright}Total Tests: ${results.tests.length}${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}\n`);

  // Show failed tests
  if (results.failed > 0) {
    console.log(`${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
    results.tests
      .filter(t => t.status === 'fail')
      .forEach(test => {
        console.log(`  ${colors.red}❌ ${test.name}: ${test.message}${colors.reset}`);
      });
    console.log();
  }

  // Show warnings
  if (results.warnings > 0) {
    console.log(`${colors.yellow}${colors.bright}Warnings:${colors.reset}`);
    results.tests
      .filter(t => t.status === 'warning')
      .forEach(test => {
        console.log(`  ${colors.yellow}⚠️  ${test.name}: ${test.message}${colors.reset}`);
      });
    console.log();
  }

  // Overall status
  if (results.failed === 0) {
    log('✨ All critical validations passed!', 'success');

    if (results.warnings > 0) {
      log('⚠️  Some warnings were found. Review them above.', 'warning');
    }
  } else {
    log('❌ Some validations failed. Please fix the issues above.', 'error');
  }

  // Next steps
  console.log(`\n${colors.bright}Next Steps:${colors.reset}`);

  if (results.failed > 0) {
    console.log('  1. Fix the failed validations listed above');
    console.log('  2. Check your .env.local file has correct DATABASE_URL');
    console.log('  3. Run migrations: npx prisma migrate dev');
    console.log('  4. Run this script again to verify');
  } else {
    console.log('  ✅ Database is properly configured!');
    console.log('  ✅ You can start developing with: npm run dev');
    console.log('  ✅ Open Prisma Studio with: npx prisma studio');
  }

  console.log(`\n${colors.cyan}📚 For more help, see: docs/DATABASE_SETUP.md${colors.reset}\n`);
}

// Main execution
async function main() {
  console.log(`\n${colors.bright}${colors.blue}🌾 FARMERS MARKET PLATFORM - DATABASE VALIDATION${colors.reset}`);
  console.log(`${colors.cyan}Validating database configuration and connectivity...${colors.reset}\n`);

  try {
    await validateEnvironmentVariables();
    await validateDatabaseConnection();
    await validatePrismaClient();
    await validateDatabaseSchema();
    await validateConnectionPool();

    printSummary();

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Fatal Error:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
