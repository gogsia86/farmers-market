#!/usr/bin/env node
/**
 * Database Readiness Check Script
 * Verifies that the database is ready for performance optimizations
 *
 * Usage:
 *   npx tsx scripts/check-db-readiness.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const checks: CheckResult[] = [];

function logCheck(result: CheckResult): void {
  const emoji = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
  console.log(`${emoji} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
}

async function checkDatabaseConnection(): Promise<CheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      name: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to database'
    };
  } catch (error) {
    return {
      name: 'Database Connection',
      status: 'fail',
      message: 'Failed to connect to database',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkPostgresVersion(): Promise<CheckResult> {
  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version()
    `;
    const version = result[0].version;
    const versionMatch = version.match(/PostgreSQL (\d+)/);

    if (versionMatch) {
      const majorVersion = parseInt(versionMatch[1]);
      if (majorVersion >= 14) {
        return {
          name: 'PostgreSQL Version',
          status: 'pass',
          message: `PostgreSQL ${majorVersion} detected (optimal)`,
          details: version
        };
      } else if (majorVersion >= 12) {
        return {
          name: 'PostgreSQL Version',
          status: 'warning',
          message: `PostgreSQL ${majorVersion} detected (acceptable, but 14+ recommended)`,
          details: version
        };
      } else {
        return {
          name: 'PostgreSQL Version',
          status: 'fail',
          message: `PostgreSQL ${majorVersion} detected (version 12+ required)`,
          details: version
        };
      }
    }

    return {
      name: 'PostgreSQL Version',
      status: 'warning',
      message: 'Could not parse PostgreSQL version',
      details: version
    };
  } catch (error) {
    return {
      name: 'PostgreSQL Version',
      status: 'fail',
      message: 'Failed to check PostgreSQL version',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkDiskSpace(): Promise<CheckResult> {
  try {
    const result = await prisma.$queryRaw<Array<{
      database_size: string;
      available: boolean;
    }>>`
      SELECT
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        true as available
    `;

    const size = result[0].database_size;

    return {
      name: 'Database Size',
      status: 'pass',
      message: `Current database size: ${size}`,
      details: 'Ensure you have ~20% additional space for new indexes'
    };
  } catch (error) {
    return {
      name: 'Database Size',
      status: 'warning',
      message: 'Could not check database size',
      details: 'Proceed with caution - ensure sufficient disk space'
    };
  }
}

async function checkExistingIndexes(): Promise<CheckResult> {
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
    `;

    const count = Number(result[0].count);

    if (count > 0) {
      return {
        name: 'Existing Optimization Indexes',
        status: 'warning',
        message: `Found ${count} optimization indexes already created`,
        details: 'Some indexes may already exist - script will skip duplicates'
      };
    } else {
      return {
        name: 'Existing Optimization Indexes',
        status: 'pass',
        message: 'No optimization indexes found (ready for fresh installation)'
      };
    }
  } catch (error) {
    return {
      name: 'Existing Optimization Indexes',
      status: 'warning',
      message: 'Could not check existing indexes',
      details: 'Script will attempt to create indexes safely'
    };
  }
}

async function checkRequiredTables(): Promise<CheckResult> {
  try {
    const requiredTables = ['farms', 'products', 'users', 'orders', 'reviews'];
    const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = ANY(${requiredTables})
    `;

    const foundTables = result.map(r => r.tablename);
    const missingTables = requiredTables.filter(t => !foundTables.includes(t));

    if (missingTables.length === 0) {
      return {
        name: 'Required Tables',
        status: 'pass',
        message: `All ${requiredTables.length} required tables exist`
      };
    } else {
      return {
        name: 'Required Tables',
        status: 'fail',
        message: `Missing tables: ${missingTables.join(', ')}`,
        details: 'Run Prisma migrations first: npx prisma migrate deploy'
      };
    }
  } catch (error) {
    return {
      name: 'Required Tables',
      status: 'fail',
      message: 'Failed to check required tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkExtensions(): Promise<CheckResult> {
  try {
    const result = await prisma.$queryRaw<Array<{ extname: string }>>`
      SELECT extname
      FROM pg_extension
      WHERE extname IN ('pg_trgm', 'pg_stat_statements')
    `;

    const installedExtensions = result.map(r => r.extname);
    const requiredExtensions = ['pg_trgm', 'pg_stat_statements'];
    const missingExtensions = requiredExtensions.filter(e => !installedExtensions.includes(e));

    if (missingExtensions.length === 0) {
      return {
        name: 'PostgreSQL Extensions',
        status: 'pass',
        message: 'All required extensions are installed',
        details: `Installed: ${installedExtensions.join(', ')}`
      };
    } else {
      return {
        name: 'PostgreSQL Extensions',
        status: 'warning',
        message: `Missing extensions: ${missingExtensions.join(', ')}`,
        details: 'Optimization script will attempt to install them (requires SUPERUSER)'
      };
    }
  } catch (error) {
    return {
      name: 'PostgreSQL Extensions',
      status: 'warning',
      message: 'Could not check extensions',
      details: 'Optimization script will attempt to install required extensions'
    };
  }
}

async function checkDatabasePermissions(): Promise<CheckResult> {
  try {
    // Check if we can create an index
    const testTableResult = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'farms'
      ) as exists
    `;

    if (!testTableResult[0].exists) {
      return {
        name: 'Database Permissions',
        status: 'fail',
        message: 'Cannot access required tables',
        details: 'Check database user permissions'
      };
    }

    // Check if we have CREATE privilege
    const privResult = await prisma.$queryRaw<Array<{ has_create: boolean }>>`
      SELECT has_schema_privilege('public', 'CREATE') as has_create
    `;

    if (privResult[0].has_create) {
      return {
        name: 'Database Permissions',
        status: 'pass',
        message: 'Sufficient permissions for index creation'
      };
    } else {
      return {
        name: 'Database Permissions',
        status: 'fail',
        message: 'Insufficient permissions to create indexes',
        details: 'Contact your DBA to grant CREATE privilege on schema public'
      };
    }
  } catch (error) {
    return {
      name: 'Database Permissions',
      status: 'warning',
      message: 'Could not verify permissions',
      details: 'Proceed with caution - may encounter permission errors'
    };
  }
}

async function checkTableStatistics(): Promise<CheckResult> {
  try {
    const result = await prisma.$queryRaw<Array<{
      tablename: string;
      row_count: number;
    }>>`
      SELECT
        tablename,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND tablename IN ('farms', 'products', 'users', 'orders')
      ORDER BY n_live_tup DESC
    `;

    const totalRows = result.reduce((sum, r) => sum + r.row_count, 0);

    if (totalRows === 0) {
      return {
        name: 'Table Statistics',
        status: 'warning',
        message: 'Database appears to be empty',
        details: 'Indexes will be created but benefits will be minimal without data'
      };
    }

    const details = result.map(r => `${r.tablename}: ${r.row_count.toLocaleString()} rows`).join('\n   ');

    return {
      name: 'Table Statistics',
      status: 'pass',
      message: `Database contains ${totalRows.toLocaleString()} rows`,
      details
    };
  } catch (error) {
    return {
      name: 'Table Statistics',
      status: 'warning',
      message: 'Could not gather table statistics',
      details: 'Run ANALYZE manually before optimization'
    };
  }
}

async function checkDatabaseLoad(): Promise<CheckResult> {
  try {
    const result = await prisma.$queryRaw<Array<{
      active_connections: number;
      max_connections: number;
    }>>`
      SELECT
        COUNT(*) as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      FROM pg_stat_activity
      WHERE state = 'active'
    `;

    const active = result[0].active_connections;
    const max = result[0].max_connections;
    const percentage = (active / max) * 100;

    if (percentage < 50) {
      return {
        name: 'Database Load',
        status: 'pass',
        message: `Low load: ${active}/${max} connections (${percentage.toFixed(1)}%)`,
        details: 'Good time to run optimizations'
      };
    } else if (percentage < 80) {
      return {
        name: 'Database Load',
        status: 'warning',
        message: `Moderate load: ${active}/${max} connections (${percentage.toFixed(1)}%)`,
        details: 'Consider running optimizations during off-peak hours'
      };
    } else {
      return {
        name: 'Database Load',
        status: 'fail',
        message: `High load: ${active}/${max} connections (${percentage.toFixed(1)}%)`,
        details: 'Wait for lower traffic before running optimizations'
      };
    }
  } catch (error) {
    return {
      name: 'Database Load',
      status: 'warning',
      message: 'Could not check database load',
      details: 'Proceed with caution during peak hours'
    };
  }
}

async function runAllChecks(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         DATABASE READINESS CHECK FOR OPTIMIZATIONS            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('🔍 Running pre-optimization checks...\n');

  // Run all checks
  checks.push(await checkDatabaseConnection());
  if (checks[checks.length - 1].status === 'fail') {
    logCheck(checks[checks.length - 1]);
    console.log('\n❌ Cannot proceed without database connection\n');
    process.exit(1);
  }
  logCheck(checks[checks.length - 1]);

  checks.push(await checkPostgresVersion());
  logCheck(checks[checks.length - 1]);

  checks.push(await checkRequiredTables());
  logCheck(checks[checks.length - 1]);

  checks.push(await checkDatabasePermissions());
  logCheck(checks[checks.length - 1]);

  checks.push(await checkExtensions());
  logCheck(checks[checks.length - 1]);

  checks.push(await checkExistingIndexes());
  logCheck(checks[checks.length - 1]);

  checks.push(await checkTableStatistics());
  logCheck(checks[checks.length - 1]);

  checks.push(await checkDiskSpace());
  logCheck(checks[checks.length - 1]);

  checks.push(await checkDatabaseLoad());
  logCheck(checks[checks.length - 1]);

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                          SUMMARY                              ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passCount = checks.filter(c => c.status === 'pass').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  console.log(`✅ Passed:   ${passCount}/${checks.length}`);
  console.log(`⚠️  Warnings: ${warningCount}/${checks.length}`);
  console.log(`❌ Failed:   ${failCount}/${checks.length}\n`);

  if (failCount > 0) {
    console.log('❌ READINESS: NOT READY');
    console.log('\n🔧 Action Required:');
    console.log('   Fix the failed checks above before running optimizations.\n');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('⚠️  READINESS: PROCEED WITH CAUTION');
    console.log('\n💡 Recommendations:');
    console.log('   Review warnings above and proceed carefully.');
    console.log('   Have a rollback plan ready.\n');
    process.exit(0);
  } else {
    console.log('✅ READINESS: READY TO OPTIMIZE');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run: npx tsx scripts/apply-db-optimizations.ts');
    console.log('   2. Monitor logs for any errors');
    console.log('   3. Verify indexes with: SELECT * FROM pg_indexes WHERE schemaname = \'public\';\n');
    process.exit(0);
  }
}

// Main execution
runAllChecks()
  .catch((error) => {
    console.error('\n❌ Unexpected error during readiness check:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
