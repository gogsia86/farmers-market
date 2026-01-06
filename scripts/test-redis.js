/**
 * 🔧 Redis Connection Test Script
 * Tests Redis connectivity and basic operations
 *
 * Usage:
 *   node scripts/test-redis.js
 *
 * Environment Variables Required:
 *   REDIS_HOST
 *   REDIS_PORT
 *   REDIS_PASSWORD
 */

const Redis = require('ioredis');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, COLORS.bright + COLORS.cyan);
  console.log('='.repeat(60));
}

async function testRedisConnection() {
  logSection('🔍 Redis Connection Test');

  // Check environment variables
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD;

  log('\n📋 Configuration:', COLORS.cyan);
  log(`   Host: ${host || '❌ NOT SET'}`);
  log(`   Port: ${port}`);
  log(`   Password: ${password ? '✅ SET (hidden)' : '❌ NOT SET'}`);

  if (!host) {
    log('\n❌ REDIS_HOST is not set in environment variables', COLORS.red);
    log('   Add to .env.local:', COLORS.yellow);
    log('   REDIS_HOST=your-redis-host.com');
    process.exit(1);
  }

  if (!password) {
    log('\n⚠️  REDIS_PASSWORD is not set', COLORS.yellow);
    log('   Redis may require authentication');
  }

  // Create Redis client
  log('\n🔌 Connecting to Redis...', COLORS.cyan);

  const redis = new Redis({
    host,
    port: parseInt(port),
    password,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 10000,
    retryStrategy: (times) => {
      if (times > 3) {
        log('❌ Max retry attempts reached', COLORS.red);
        return null;
      }
      const delay = Math.min(times * 200, 2000);
      log(`   Retry attempt ${times}/3 in ${delay}ms...`, COLORS.yellow);
      return delay;
    },
  });

  // Connection event handlers
  redis.on('connect', () => {
    log('✅ TCP connection established', COLORS.green);
  });

  redis.on('ready', () => {
    log('✅ Redis client ready', COLORS.green);
  });

  redis.on('error', (error) => {
    log(`❌ Redis Error: ${error.message}`, COLORS.red);
  });

  redis.on('close', () => {
    log('🔌 Connection closed', COLORS.yellow);
  });

  redis.on('reconnecting', () => {
    log('🔄 Reconnecting...', COLORS.yellow);
  });

  try {
    // Connect to Redis
    await redis.connect();
    log('✅ Successfully connected to Redis!', COLORS.green);

    // Test 1: PING
    logSection('🏓 Test 1: PING Command');
    const pingResult = await redis.ping();
    log(`   Response: ${pingResult}`, COLORS.green);
    log('   ✅ PING test passed');

    // Test 2: SET
    logSection('💾 Test 2: SET Command');
    const testKey = 'test:connection:' + Date.now();
    const testValue = JSON.stringify({
      timestamp: new Date().toISOString(),
      message: 'Redis connection test successful',
      app: 'farmers-market'
    });

    await redis.set(testKey, testValue, 'EX', 60); // Expire in 60 seconds
    log(`   Key: ${testKey}`, COLORS.cyan);
    log('   ✅ SET test passed');

    // Test 3: GET
    logSection('📖 Test 3: GET Command');
    const getValue = await redis.get(testKey);
    const parsedValue = JSON.parse(getValue);
    log(`   Retrieved value:`, COLORS.cyan);
    log(`   ${JSON.stringify(parsedValue, null, 2)}`);
    log('   ✅ GET test passed');

    // Test 4: DELETE
    logSection('🗑️  Test 4: DEL Command');
    const delResult = await redis.del(testKey);
    log(`   Keys deleted: ${delResult}`, COLORS.cyan);
    log('   ✅ DEL test passed');

    // Test 5: Redis Info
    logSection('ℹ️  Test 5: Server Info');
    const info = await redis.info('server');
    const lines = info.split('\n').filter(line =>
      line && !line.startsWith('#') && line.includes(':')
    );

    const serverInfo = {};
    lines.forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        serverInfo[key.trim()] = value.trim();
      }
    });

    log(`   Redis Version: ${serverInfo.redis_version || 'Unknown'}`, COLORS.cyan);
    log(`   OS: ${serverInfo.os || 'Unknown'}`, COLORS.cyan);
    log(`   Uptime: ${serverInfo.uptime_in_days || 'Unknown'} days`, COLORS.cyan);
    log('   ✅ INFO test passed');

    // Test 6: Memory Usage
    logSection('💾 Test 6: Memory Info');
    const memInfo = await redis.info('memory');
    const memLines = memInfo.split('\n').filter(line =>
      line && !line.startsWith('#') && line.includes(':')
    );

    memLines.slice(0, 5).forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        log(`   ${key.trim()}: ${value.trim()}`, COLORS.cyan);
      }
    });
    log('   ✅ Memory info retrieved');

    // Test 7: Cache Pattern Test
    logSection('🧪 Test 7: Cache Pattern');
    const cacheKey = 'cache:test:farm:123';
    const farmData = {
      id: '123',
      name: 'Test Farm',
      location: 'Seattle, WA',
      products: ['Tomatoes', 'Lettuce', 'Carrots']
    };

    // Set with 5 minute expiry
    await redis.setex(cacheKey, 300, JSON.stringify(farmData));
    log('   ✅ Cached farm data');

    // Retrieve from cache
    const cachedData = await redis.get(cacheKey);
    const parsedCache = JSON.parse(cachedData);
    log(`   Retrieved: ${parsedCache.name} (${parsedCache.location})`, COLORS.cyan);

    // Check TTL
    const ttl = await redis.ttl(cacheKey);
    log(`   TTL remaining: ${ttl} seconds`, COLORS.cyan);

    // Cleanup
    await redis.del(cacheKey);
    log('   ✅ Cache pattern test passed');

    // Final Summary
    logSection('✅ All Tests Passed!');
    log('\n   Your Redis connection is working correctly.', COLORS.green);
    log('   You can use Redis for:', COLORS.cyan);
    log('   • Session caching');
    log('   • API response caching');
    log('   • Rate limiting');
    log('   • Real-time features');
    log('\n   Connection String (for .env):', COLORS.yellow);
    log(`   REDIS_HOST=${host}`);
    log(`   REDIS_PORT=${port}`);
    log(`   REDIS_PASSWORD=<your-password>`);

  } catch (error) {
    logSection('❌ Test Failed');
    log(`\nError: ${error.message}`, COLORS.red);

    if (error.message.includes('ENOTFOUND')) {
      log('\n💡 Troubleshooting:', COLORS.yellow);
      log('   • Check if REDIS_HOST is correct');
      log('   • Verify your internet connection');
      log('   • Ensure Redis server is accessible');
    } else if (error.message.includes('ECONNREFUSED')) {
      log('\n💡 Troubleshooting:', COLORS.yellow);
      log('   • Redis server may be down');
      log('   • Check REDIS_PORT is correct');
      log('   • Verify firewall settings');
    } else if (error.message.includes('NOAUTH') || error.message.includes('invalid password')) {
      log('\n💡 Troubleshooting:', COLORS.yellow);
      log('   • REDIS_PASSWORD is incorrect');
      log('   • Verify password in Redis Labs dashboard');
    } else if (error.message.includes('WRONGPASS')) {
      log('\n💡 Troubleshooting:', COLORS.yellow);
      log('   • Authentication failed');
      log('   • Check REDIS_PASSWORD value');
    }

    process.exit(1);
  } finally {
    // Cleanup
    redis.disconnect();
    log('\n🔌 Disconnected from Redis\n', COLORS.cyan);
  }
}

// Run tests
testRedisConnection().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
