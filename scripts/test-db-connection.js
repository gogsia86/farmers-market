#!/usr/bin/env node

/**
 * 🗄️ DATABASE CONNECTION TEST SCRIPT
 * Tests database connectivity and displays connection info
 */

const { Client } = require('pg');
require('dotenv/config');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🗄️  DATABASE CONNECTION TEST');
  console.log('='.repeat(60) + '\n');

  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    log('red', '❌ ERROR: DATABASE_URL environment variable is not set!');
    console.log('\nPlease set DATABASE_URL in your .env file:');
    console.log('DATABASE_URL="postgresql://farmers_user:changeme123@localhost:5432/farmers_market"\n');
    process.exit(1);
  }

  // Parse DATABASE_URL
  let urlInfo;
  try {
    const url = new URL(databaseUrl);
    urlInfo = {
      protocol: url.protocol,
      username: url.username,
      password: url.password ? '***' : 'none',
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.substring(1),
    };

    log('blue', '📋 Connection Details:');
    console.log(`   Host:     ${urlInfo.host}:${urlInfo.port}`);
    console.log(`   Database: ${urlInfo.database}`);
    console.log(`   Username: ${urlInfo.username}`);
    console.log(`   Password: ${urlInfo.password}\n`);
  } catch (error) {
    log('red', '❌ ERROR: Invalid DATABASE_URL format!');
    console.log(`   URL: ${databaseUrl}\n`);
    process.exit(1);
  }

  // Test connection
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    log('yellow', '⏳ Attempting to connect...');
    await client.connect();
    log('green', '✅ Successfully connected to database!\n');

    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    log('blue', '📊 Database Information:');
    console.log(`   ${versionResult.rows[0].version}\n`);

    // Check if database has tables
    const tablesResult = await client.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tablesResult.rows[0].table_count);

    if (tableCount > 0) {
      log('green', `✅ Database has ${tableCount} tables`);
    } else {
      log('yellow', '⚠️  Database is empty (no tables found)');
      console.log('   Run: npm run db:push');
      console.log('   Then: npm run seed\n');
    }

    // List tables if any exist
    if (tableCount > 0) {
      const listTablesResult = await client.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
        LIMIT 10
      `);

      log('blue', '\n📋 Database Tables:');
      listTablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.tablename}`);
      });

      if (tableCount > 10) {
        console.log(`   ... and ${tableCount - 10} more tables\n`);
      } else {
        console.log('');
      }
    }

    log('green', '✅ Connection test successful!\n');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    log('red', '\n❌ Connection failed!');
    console.log(`   Error: ${error.message}\n`);

    if (error.code === 'ECONNREFUSED') {
      log('yellow', '💡 Troubleshooting:');
      console.log('   1. Check if Docker containers are running:');
      console.log('      docker ps | grep farmers-market\n');
      console.log('   2. Start database with:');
      console.log('      docker-compose -f docker-compose.dev.yml up -d postgres-dev\n');
      console.log('   3. Verify DATABASE_URL in .env matches Docker settings:');
      console.log('      DATABASE_URL="postgresql://farmers_user:changeme123@localhost:5432/farmers_market"\n');
    } else if (error.code === 'ENOTFOUND') {
      log('yellow', '💡 Check your DATABASE_URL host setting');
    } else if (error.code === '28P01') {
      log('yellow', '💡 Authentication failed - check username/password');
    } else if (error.code === '3D000') {
      log('yellow', '💡 Database does not exist - create it first');
    }

    console.log('='.repeat(60) + '\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the test
testConnection().catch((error) => {
  log('red', `\n❌ Unexpected error: ${error.message}\n`);
  process.exit(1);
});
