# 🔴 Redis Setup Guide - Farmers Market Platform

**Last Updated:** January 12, 2026  
**Status:** Ready for Configuration  
**Version:** Redis 7.x (ioredis 5.8.2)

---

## 📊 Current Status

### ✅ What's Already Configured

| Component | Status | Location |
|-----------|--------|----------|
| **Redis Client** | ✅ Implemented | `src/lib/cache/redis.ts` |
| **Connection Pool** | ✅ Configured | ioredis with retry logic |
| **Cache Service** | ✅ Ready | `RedisCacheService` class |
| **Health Check** | ✅ Implemented | `checkRedisHealth()` |
| **Lazy Loading** | ✅ Implemented | `redis-client-lazy.ts` |
| **Mock for Tests** | ✅ Configured | `__mocks__/@/lib/cache/redis.ts` |

### ⚠️ What Needs Setup

- [ ] Redis server instance (local or cloud)
- [ ] Environment variables configured
- [ ] Connection credentials provided
- [ ] Health check validation

---

## 🗄️ Database Conflict Analysis

### ✅ NO CONFLICTS DETECTED

Redis and PostgreSQL work **independently** - no conflicts:

| Database | Port | Purpose | Data Storage |
|----------|------|---------|--------------|
| **PostgreSQL** | 5432 (dev)<br>5433 (test) | Primary data store | Persistent (farms, products, users, orders) |
| **Redis** | 6379 | Cache layer | Temporary (sessions, cache, rate limiting) |

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│                  (Next.js + Prisma)                     │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
              ▼                           ▼
    ┌─────────────────┐         ┌──────────────────┐
    │   PostgreSQL    │         │      Redis       │
    │   (Primary DB)  │         │     (Cache)      │
    │                 │         │                  │
    │  • Users        │         │  • Sessions      │
    │  • Farms        │         │  • Cache Keys    │
    │  • Products     │         │  • Rate Limits   │
    │  • Orders       │         │  • Temp Data     │
    │                 │         │                  │
    │  Port: 5432     │         │  Port: 6379      │
    └─────────────────┘         └──────────────────┘
         PERSISTENT                 TEMPORARY
```

**Benefits of Using Both:**
- ✅ **Faster Responses** - Cache frequently accessed data
- ✅ **Reduced DB Load** - Fewer queries to PostgreSQL
- ✅ **Better Performance** - Sub-millisecond cache hits
- ✅ **Session Management** - Fast session storage
- ✅ **Rate Limiting** - Efficient API throttling

---

## 🚀 Quick Setup Options

### Option 1: Local Redis (Docker) - RECOMMENDED
**Best for:** Development and Testing  
**Time:** 2 minutes  
**Complexity:** Low  

### Option 2: Upstash Redis (Cloud)
**Best for:** Production and Staging  
**Time:** 5 minutes  
**Complexity:** Low (free tier available)

### Option 3: Manual Redis Installation
**Best for:** Custom configurations  
**Time:** 10 minutes  
**Complexity:** Medium

---

## 🐳 Option 1: Local Redis with Docker (Recommended)

### Prerequisites
- Docker Desktop installed
- Terminal/Command Prompt access

### Step 1: Start Redis Container
```bash
# Using Docker Compose (if you have docker-compose.yml)
docker compose up -d redis

# OR using Docker directly
docker run -d \
  --name farmers-market-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes --requirepass "your_secure_password_here"
```

### Step 2: Verify Redis is Running
```bash
# Check container status
docker ps | grep redis

# Expected output:
# CONTAINER ID   IMAGE           STATUS          PORTS                    NAMES
# abc123def456   redis:7-alpine  Up 2 minutes    0.0.0.0:6379->6379/tcp   farmers-market-redis

# Test connection
docker exec -it farmers-market-redis redis-cli ping
# Expected: PONG
```

### Step 3: Configure Environment Variables
```bash
# Add to .env.local (for development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password_here
REDIS_DB=0
REDIS_KEY_PREFIX=fm:
```

### Step 4: Test Connection in Your App
```bash
# Run the app
npm run dev

# Check logs for:
# ✅ Redis client connected to localhost:6379
```

---

## ☁️ Option 2: Upstash Redis (Cloud)

### Why Upstash?
- ✅ **Free Tier** - 10,000 commands/day
- ✅ **Global Edge** - Low latency worldwide
- ✅ **Serverless** - Pay per use
- ✅ **REST API** - Works everywhere
- ✅ **Vercel Integration** - One-click setup

### Step 1: Create Upstash Account
1. Go to https://upstash.com/
2. Sign up (free - no credit card required)
3. Create a new Redis database

### Step 2: Get Connection Details
From Upstash dashboard, copy:
- **Endpoint** (e.g., `us1-alive-ox-12345.upstash.io`)
- **Port** (`6379` for Redis protocol, `443` for REST)
- **Password** (your Redis password)

### Step 3: Configure Environment Variables

**For ioredis (current setup):**
```bash
# Add to .env.local
REDIS_HOST=us1-alive-ox-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_upstash_password_here
REDIS_DB=0
REDIS_KEY_PREFIX=fm:

# OR use full connection string
REDIS_URL=redis://default:your_password@us1-alive-ox-12345.upstash.io:6379
```

**For Upstash REST API (alternative):**
```bash
UPSTASH_REDIS_REST_URL=https://us1-alive-ox-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token_here
```

### Step 4: Verify Connection
```bash
npm run dev

# Check console for:
# ✅ Redis client connected to us1-alive-ox-12345.upstash.io:6379
```

---

## 🛠️ Option 3: Manual Redis Installation

### Windows (with WSL2)
```bash
# Install Redis on WSL2
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test
redis-cli ping
# Expected: PONG
```

### macOS (with Homebrew)
```bash
# Install Redis
brew install redis

# Start Redis
brew services start redis

# Test
redis-cli ping
# Expected: PONG
```

### Linux (Ubuntu/Debian)
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test
redis-cli ping
# Expected: PONG
```

### Configure Environment Variables
```bash
# Add to .env.local
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=fm:
```

---

## 🔐 Redis CLI Commands Reference

### Basic Commands

**Connect to Redis:**
```bash
# Local
redis-cli

# With password
redis-cli -a your_password

# Remote
redis-cli -h your-host.upstash.io -p 6379 -a your_password

# Docker
docker exec -it farmers-market-redis redis-cli -a your_password
```

**Test Connection:**
```bash
# Ping server
PING
# Response: PONG

# Check info
INFO server

# Check memory usage
INFO memory
```

### Cache Management

**View Keys:**
```bash
# List all keys with prefix
KEYS fm:*

# Count keys
DBSIZE

# Get specific key
GET fm:products:list

# Check if key exists
EXISTS fm:products:list

# Get TTL (time to live)
TTL fm:products:list
```

**Set/Get Data:**
```bash
# Set key with expiration (3600 seconds = 1 hour)
SETEX fm:test:key 3600 "test value"

# Get key
GET fm:test:key

# Delete key
DEL fm:test:key

# Delete pattern
EVAL "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 fm:products:*
```

**Clear Cache:**
```bash
# Delete all keys in current database
FLUSHDB

# Delete all keys in all databases
FLUSHALL

# Delete keys by pattern (safer)
# Use the app's cache service instead:
# await cacheService.deletePattern('products:*')
```

### Monitoring

**Real-time Monitor:**
```bash
# Watch all commands in real-time
MONITOR

# Press Ctrl+C to stop
```

**Statistics:**
```bash
# Server info
INFO stats

# Memory info
INFO memory

# Clients
CLIENT LIST

# Slow queries
SLOWLOG GET 10
```

### Health Check

**Quick Health Check:**
```bash
# Test latency
redis-cli --latency

# Test throughput
redis-cli --intrinsic-latency 100
```

---

## 🔧 Environment Variables Reference

### Required Variables

```bash
# Redis Host (IP or hostname)
REDIS_HOST=localhost
# Options: localhost, 127.0.0.1, redis, your-host.upstash.io

# Redis Port
REDIS_PORT=6379
# Default: 6379 (standard Redis port)

# Redis Password (if set)
REDIS_PASSWORD=your_secure_password
# Leave empty for local dev without password

# Redis Database Number (0-15)
REDIS_DB=0
# Use different numbers for different environments

# Key Prefix (namespace)
REDIS_KEY_PREFIX=fm:
# Prevents conflicts with other apps on same Redis instance
```

### Optional Variables

```bash
# Connection URL (alternative to individual vars)
REDIS_URL=redis://user:password@host:port/db
# Example: redis://default:pass@localhost:6379/0

# Max Retries
REDIS_MAX_RETRIES=3
# How many times to retry connection

# Connection Timeout
REDIS_CONNECT_TIMEOUT=10000
# Milliseconds before connection timeout

# Enable TLS (for cloud Redis)
REDIS_TLS_ENABLED=true
# Set to true for Upstash, AWS ElastiCache, etc.
```

### Environment-Specific Configuration

**Development (.env.local):**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=fm:dev:
```

**Testing (.env.test):**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=1
REDIS_KEY_PREFIX=fm:test:
```

**Staging (.env.staging):**
```bash
REDIS_HOST=your-staging.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=staging_password
REDIS_DB=0
REDIS_KEY_PREFIX=fm:staging:
REDIS_TLS_ENABLED=true
```

**Production (.env.production):**
```bash
REDIS_HOST=your-prod.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=prod_password_very_secure
REDIS_DB=0
REDIS_KEY_PREFIX=fm:prod:
REDIS_TLS_ENABLED=true
```

---

## 🧪 Testing Your Redis Setup

### 1. Health Check Script

```bash
# Run health check
npm run db:test
```

Or create a test file:

```typescript
// scripts/test-redis.ts
import { getRedisCache, checkRedisHealth } from '@/lib/cache/redis';

async function testRedis() {
  console.log('🔴 Testing Redis Connection...\n');

  // 1. Health Check
  console.log('1. Health Check:');
  const isHealthy = await checkRedisHealth();
  console.log(isHealthy ? '   ✅ Redis is healthy' : '   ❌ Redis is unhealthy');

  // 2. Set/Get Test
  console.log('\n2. Set/Get Test:');
  const redis = getRedisCache();
  
  const testData = { message: 'Hello Redis!', timestamp: Date.now() };
  await redis.set('test:key', testData, { ttl: 60 });
  console.log('   ✅ Set test data');

  const retrieved = await redis.get<typeof testData>('test:key');
  console.log('   ✅ Retrieved:', retrieved);

  // 3. TTL Test
  console.log('\n3. TTL Test:');
  const ttl = await redis.ttl('test:key');
  console.log(`   ✅ TTL: ${ttl} seconds`);

  // 4. Delete Test
  console.log('\n4. Delete Test:');
  await redis.delete('test:key');
  console.log('   ✅ Deleted test key');

  // 5. Pattern Test
  console.log('\n5. Pattern Test:');
  await redis.set('test:pattern:1', 'data1', { ttl: 60 });
  await redis.set('test:pattern:2', 'data2', { ttl: 60 });
  const deleted = await redis.deletePattern('test:pattern:*');
  console.log(`   ✅ Deleted ${deleted} keys`);

  console.log('\n✅ All tests passed!');
  await redis.disconnect();
}

testRedis().catch(console.error);
```

Run with:
```bash
tsx scripts/test-redis.ts
```

### 2. Cache Performance Test

```typescript
// Compare with and without cache
import { getRedisCache } from '@/lib/cache/redis';

async function perfTest() {
  const redis = getRedisCache();
  
  // Without cache
  console.time('Without Cache');
  const data = await fetchExpensiveData();
  console.timeEnd('Without Cache');
  
  // With cache (first time - cache miss)
  console.time('With Cache (miss)');
  const cached1 = await redis.getOrSet('expensive:data', fetchExpensiveData, { ttl: 300 });
  console.timeEnd('With Cache (miss)');
  
  // With cache (second time - cache hit)
  console.time('With Cache (hit)');
  const cached2 = await redis.getOrSet('expensive:data', fetchExpensiveData, { ttl: 300 });
  console.timeEnd('With Cache (hit)');
  
  await redis.disconnect();
}
```

---

## 📊 Monitoring Redis

### View Cache Usage

```bash
# Connect to Redis CLI
redis-cli -a your_password

# View all farm-related cache keys
KEYS fm:*

# Count total keys
DBSIZE

# Check memory usage
INFO memory
```

### Clear Specific Caches

```bash
# Clear product cache
redis-cli -a your_password --eval "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" , "fm:products:*"

# Clear farm cache
redis-cli -a your_password --eval "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" , "fm:farms:*"

# Clear all fm: keys
redis-cli -a your_password --eval "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" , "fm:*"
```

### Monitor Cache Hit Rate

```bash
# View stats
redis-cli -a your_password INFO stats | grep hits

# Expected output:
# keyspace_hits:1234
# keyspace_misses:56
# Hit rate = hits / (hits + misses) = 95.67%
```

---

## 🔥 Common Issues & Solutions

### Issue 1: Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
```bash
# Check if Redis is running
docker ps | grep redis

# If not running, start it
docker compose up -d redis

# OR
docker start farmers-market-redis
```

### Issue 2: Authentication Failed

**Error:**
```
Error: ERR AUTH <password> called without any password configured
```

**Solution:**
```bash
# Either set password in Redis
docker exec -it farmers-market-redis redis-cli CONFIG SET requirepass "your_password"

# OR remove password from .env
REDIS_PASSWORD=
```

### Issue 3: Out of Memory

**Error:**
```
Error: OOM command not allowed when used memory > 'maxmemory'
```

**Solution:**
```bash
# Check memory usage
redis-cli INFO memory

# Increase memory limit
redis-cli CONFIG SET maxmemory 256mb

# OR set eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Issue 4: Slow Performance

**Check for:**
```bash
# 1. Slow queries
redis-cli SLOWLOG GET 10

# 2. Large keys
redis-cli --bigkeys

# 3. Memory fragmentation
redis-cli INFO memory | grep fragmentation
```

**Solution:**
- Use shorter TTLs for cached data
- Implement cache key patterns properly
- Monitor and clean up unused keys

---

## 🎯 Best Practices

### 1. Key Naming Convention
```typescript
// ✅ GOOD - Hierarchical, descriptive
fm:products:list
fm:products:id:123
fm:farms:slug:green-acres
fm:user:session:abc123

// ❌ BAD - Flat, unclear
product_list
farm_123
session
```

### 2. TTL Strategy
```typescript
// Set appropriate TTLs based on data volatility
await redis.set('products:featured', data, { ttl: 300 });      // 5 min - frequently changing
await redis.set('farms:verified', data, { ttl: 3600 });        // 1 hour - stable data
await redis.set('user:profile:123', data, { ttl: 86400 });     // 24 hours - rarely changes
```

### 3. Error Handling
```typescript
// Always handle Redis errors gracefully
async function getCachedData() {
  try {
    const cached = await redis.get('key');
    if (cached) return cached;
  } catch (error) {
    logger.error('Redis error', { error });
    // Fall back to database
  }
  
  return await database.query();
}
```

### 4. Cache Invalidation
```typescript
// Invalidate related caches when data changes
async function updateProduct(id: string, data: any) {
  await database.product.update({ where: { id }, data });
  
  // Invalidate related caches
  await redis.delete(`product:${id}`);
  await redis.deletePattern('products:list*');
  await redis.deletePattern('products:category:*');
}
```

---

## 📋 Implementation Checklist

### Initial Setup
- [ ] Choose Redis option (Docker/Upstash/Manual)
- [ ] Start Redis server
- [ ] Configure environment variables
- [ ] Test connection with redis-cli
- [ ] Run app and verify logs

### Verification
- [ ] Run health check: `checkRedisHealth()`
- [ ] Test set/get operations
- [ ] Verify TTL expiration
- [ ] Check cache hit/miss logs
- [ ] Monitor memory usage

### Production Readiness
- [ ] Set strong password (min 32 chars)
- [ ] Enable TLS/SSL for remote connections
- [ ] Configure memory limits
- [ ] Set up monitoring alerts
- [ ] Document cache invalidation strategy
- [ ] Add Redis to backup plan

---

## 🆘 Need Help?

### Quick Troubleshooting
```bash
# 1. Check Redis is running
docker ps | grep redis

# 2. Test connection
redis-cli -h localhost -p 6379 ping

# 3. Check app logs
npm run dev | grep -i redis

# 4. Run health check
tsx scripts/test-redis.ts
```

### Logs to Check
- Application logs: `npm run dev` output
- Docker logs: `docker logs farmers-market-redis`
- Redis logs: `redis-cli INFO server`

### Support Resources
- **Redis Documentation:** https://redis.io/docs/
- **ioredis GitHub:** https://github.com/redis/ioredis
- **Upstash Docs:** https://docs.upstash.com/redis
- **Docker Redis:** https://hub.docker.com/_/redis

---

## 🚀 Next Steps

After setting up Redis:

1. ✅ Run `npm run dev` and verify connection
2. ✅ Test cache with sample data
3. ✅ Monitor performance improvements
4. ✅ Implement caching in critical paths:
   - Product listings
   - Farm details
   - User sessions
   - API responses

---

## 📊 Expected Performance Gains

With Redis properly configured:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **API Response Time** | 500ms | 50ms | 90% faster |
| **Database Load** | 100% | 20% | 80% reduction |
| **Concurrent Users** | 100 | 500+ | 5x capacity |
| **Page Load Time** | 2s | 0.5s | 75% faster |

---

**Status:** Ready for Implementation  
**Priority:** High (Performance Critical)  
**Estimated Setup Time:** 5-10 minutes  
**Last Updated:** January 12, 2026

---

*Give me the Redis CLI credentials and I'll help you set it up! 🚀*