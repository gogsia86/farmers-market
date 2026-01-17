#!/usr/bin/env tsx

/**
 * 🔄 TEST DATABASE SCHEMA SYNC SCRIPT
 *
 * Synchronizes test database schema with the current Prisma schema
 * Ensures E2E and accessibility tests have up-to-date database structure
 *
 * Features:
 * - Detects schema drift
 * - Runs migrations or pushes schema
 * - Seeds test data
 * - Validates schema after sync
 * - Safe for CI/CD pipelines
 *
 * Usage:
 *   npm run sync:test-db
 *   tsx scripts/sync-test-db.ts
 *   tsx scripts/sync-test-db.ts --seed
 *   tsx scripts/sync-test-db.ts --force-push
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ARGS = process.argv.slice(2);
const SHOULD_SEED = ARGS.includes('--seed');
const FORCE_PUSH = ARGS.includes('--force-push');
const VERBOSE = ARGS.includes('--verbose');

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Execute command with proper error handling
 */
function exec(command: string, options: { silent?: boolean } = {}): string {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: TEST_DATABASE_URL
      }
    });

    return result;
  } catch (error: any) {
    if (!options.silent) {
      console.error(`❌ Command failed: ${command}`);
      console.error(error.message);
    }
    throw error;
  }
}

/**
 * Log with timestamp
 */
function log(message: string, emoji = '📝') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${emoji} [${timestamp}] ${message}`);
}

/**
 * Check if migrations directory exists
 */
function hasMigrations(): boolean {
  const migrationsPath = join(process.cwd(), 'prisma', 'migrations');
  return existsSync(migrationsPath);
}

// ============================================================================
// SCHEMA SYNC FUNCTIONS
// ============================================================================

/**
 * Validate DATABASE_URL is set
 */
function validateEnvironment() {
  log('Validating environment...', '🔍');

  if (!TEST_DATABASE_URL) {
    console.error('❌ TEST_DATABASE_URL or DATABASE_URL environment variable is required');
    console.error('');
    console.error('Set one of:');
    console.error('  export TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/test_db"');
    console.error('  export DATABASE_URL="postgresql://user:pass@localhost:5432/test_db"');
    process.exit(1);
  }

  // Check if it's a test database (safety check)
  if (!TEST_DATABASE_URL.includes('test') && !FORCE_PUSH) {
    console.warn('⚠️  WARNING: DATABASE_URL does not contain "test"');
    console.warn('   This might not be a test database!');
    console.warn('   Use --force-push to override this check');
    console.warn('');
    console.warn(`   Current URL: ${TEST_DATABASE_URL.replace(/:([^:@]+)@/, ':****@')}`);
    process.exit(1);
  }

  log(`Using database: ${TEST_DATABASE_URL.replace(/:([^:@]+)@/, ':****@')}`, '✅');
}

/**
 * Generate Prisma Client
 */
function generatePrismaClient() {
  log('Generating Prisma Client...', '⚙️');

  try {
    exec('npx prisma generate', { silent: !VERBOSE });
    log('Prisma Client generated', '✅');
  } catch (error) {
    console.error('❌ Failed to generate Prisma Client');
    throw error;
  }
}

/**
 * Check schema drift
 */
function checkSchemaDrift(): boolean {
  log('Checking for schema drift...', '🔍');

  try {
    // Try prisma migrate status - if migrations exist
    if (hasMigrations()) {
      const output = exec('npx prisma migrate status', { silent: true });

      if (output.includes('Database schema is up to date')) {
        log('Schema is up to date', '✅');
        return false;
      }

      if (output.includes('following migration have not yet been applied')) {
        log('Schema drift detected - migrations pending', '⚠️');
        return true;
      }
    }

    // If no migrations or status check inconclusive, try db pull
    log('Checking schema with db pull...', '🔍');
    const pullOutput = exec('npx prisma db pull --print', { silent: true });

    // If db pull succeeds and schema matches, no drift
    log('Assuming schema drift exists (safe approach)', '⚠️');
    return true;
  } catch (error: any) {
    // If status check fails, assume drift exists to be safe
    log('Could not determine schema status, will sync to be safe', '⚠️');
    return true;
  }
}

/**
 * Deploy migrations
 */
function deployMigrations() {
  log('Deploying migrations...', '🚀');

  try {
    if (!hasMigrations()) {
      log('No migrations found, will use db push instead', '⚠️');
      return false;
    }

    exec('npx prisma migrate deploy', { silent: !VERBOSE });
    log('Migrations deployed successfully', '✅');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy migrations');
    console.error('   Will attempt db push as fallback...');
    return false;
  }
}

/**
 * Push schema (alternative to migrations)
 */
function pushSchema() {
  log('Pushing schema to database...', '🚀');

  try {
    exec('npx prisma db push --accept-data-loss', { silent: !VERBOSE });
    log('Schema pushed successfully', '✅');
    return true;
  } catch (error) {
    console.error('❌ Failed to push schema');
    throw error;
  }
}

/**
 * Seed test database
 */
async function seedDatabase() {
  log('Seeding test database...', '🌱');

  try {
    // Check if seed script exists
    const seedScript = join(process.cwd(), 'tests', 'global-setup.ts');

    if (!existsSync(seedScript)) {
      log('No test seed script found at tests/global-setup.ts', '⚠️');
      return;
    }

    exec('tsx tests/global-setup.ts', { silent: !VERBOSE });
    log('Test database seeded successfully', '✅');
  } catch (error) {
    console.error('⚠️  Seeding failed (non-fatal)');
    if (VERBOSE) {
      console.error(error);
    }
  }
}

/**
 * Validate schema after sync
 */
async function validateSchema() {
  log('Validating schema...', '🔍');

  try {
    // Import database after schema is synced
    const { database } = await import('@/lib/database');

    // Check if we can connect
    await database.$connect();
    log('Database connection successful', '✅');

    // Check core tables exist
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
      console.error(`❌ Missing required tables: ${missingTables.join(', ')}`);
      console.error(`   Found tables: ${tableNames.join(', ')}`);
      process.exit(1);
    }

    log(`All ${requiredTables.length} required tables exist`, '✅');

    // Check column schema for known issues
    log('Checking for known schema issues...', '🔍');

    // Check Product table for isOrganic vs organic column issue
    const productColumns = await database.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Product'
      AND table_schema = 'public'
    `;

    const productColumnNames = productColumns.map(c => c.column_name);

    if (productColumnNames.includes('isOrganic') && !productColumnNames.includes('organic')) {
      console.warn('⚠️  Found old column "isOrganic" - schema may need migration');
    } else if (productColumnNames.includes('organic')) {
      log('Product table schema is up to date', '✅');
    }

    await database.$disconnect();

    log('Schema validation completed', '✅');
  } catch (error) {
    console.error('❌ Schema validation failed');
    throw error;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const startTime = Date.now();

  console.log('');
  console.log('🔄 TEST DATABASE SCHEMA SYNC');
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'test'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Seed data: ${SHOULD_SEED ? 'Yes' : 'No'}`);
  console.log(`Force push: ${FORCE_PUSH ? 'Yes' : 'No'}`);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Validate environment
    validateEnvironment();
    console.log('');

    // Step 2: Generate Prisma Client
    generatePrismaClient();
    console.log('');

    // Step 3: Check for schema drift
    const hasDrift = checkSchemaDrift();
    console.log('');

    if (!hasDrift && !SHOULD_SEED) {
      log('Schema is already up to date, nothing to do', '✅');
      console.log('');
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Completed in ${duration}s`);
      console.log('');
      process.exit(0);
    }

    // Step 4: Sync schema (migrations or push)
    if (hasDrift) {
      let syncSuccess = false;

      if (!FORCE_PUSH) {
        // Try migrations first
        syncSuccess = deployMigrations();
      }

      if (!syncSuccess || FORCE_PUSH) {
        // Fall back to db push
        pushSchema();
      }

      console.log('');
    }

    // Step 5: Seed database (if requested)
    if (SHOULD_SEED) {
      await seedDatabase();
      console.log('');
    }

    // Step 6: Validate schema
    await validateSchema();
    console.log('');

    // Success summary
    console.log('='.repeat(60));
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Test database sync completed successfully in ${duration}s`, '✅');
    console.log('='.repeat(60));
    console.log('');

    console.log('📋 NEXT STEPS:');
    console.log('  - Run E2E tests: npm run test:e2e');
    console.log('  - Run accessibility tests: npm run test:a11y');
    console.log('  - Run Playwright tests: npx playwright test');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ TEST DATABASE SYNC FAILED');
    console.error('='.repeat(60));

    if (error instanceof Error) {
      console.error(error.message);
      if (VERBOSE && error.stack) {
        console.error('');
        console.error('Stack trace:');
        console.error(error.stack);
      }
    }

    console.error('');
    console.error('💡 TROUBLESHOOTING:');
    console.error('  1. Verify TEST_DATABASE_URL is correct');
    console.error('  2. Ensure PostgreSQL is running');
    console.error('  3. Check database permissions');
    console.error('  4. Try --force-push to use db push instead of migrations');
    console.error('  5. Use --verbose for detailed output');
    console.error('');

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as syncTestDatabase };
