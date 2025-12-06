# 🔴 Redis Configuration Guide

## Overview

Redis is an optional caching layer for the Farmers Market Platform. This guide explains how to configure Redis for different environments.

---

## 🏠 Local Development (Recommended: Disabled)

For local development, Redis is **disabled by default** to simplify setup. The platform uses an in-memory cache fallback.

### How to Disable Redis Locally

Add to your `.env.local` file:

```bash
# Disable Redis for local development (use memory cache only)
REDIS_ENABLED=false
```

Or simply **don't set** `REDIS_ENABLED` - it defaults to disabled.

### Benefits of Disabling Redis Locally
- ✅ No need to run Redis server
- ✅ Faster startup
- ✅ Simpler development environment
- ✅ Memory cache is sufficient for single-developer usage

---

## 🔌 Enable Redis Locally (Optional)

If you want to test Redis-specific features locally:

### Step 1: Install Redis

**Windows (using Chocolatey):**
```bash
choco install redis-64
```

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### Step 2: Configure Environment

Add to your `.env.local` file:

```bash
# Enable Redis
REDIS_ENABLED=true

# Redis connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=fm:

# Connection settings
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=1000
```

### Step 3: Verify Connection

Start your dev server:
```bash
npm run dev
```

You should see in the logs:
```
[info] Redis cache connected { host: 'localhost', port: 6379 }
```

---

## 🐳 Docker Development

Redis is automatically configured in Docker Compose:

```bash
# Start all services (includes Redis)
docker-compose up -d

# Redis will be available at:
# - Inside Docker: redis:6379
# - From host: localhost:6379
```

Environment variables for Docker (already in `.env`):
```bash
REDIS_ENABLED=true
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=quantum_cache_password
REDIS_URL=redis://:quantum_cache_password@redis:6379
```

---

## 🚀 Production

### Requirements
- Redis server (managed service recommended)
- Secure password
- Connection pooling

### Configuration

Set in production environment variables:

```bash
# Enable Redis (REQUIRED in production)
REDIS_ENABLED=true

# Connection (use managed service URL)
REDIS_URL=redis://:YOUR_PASSWORD@your-redis-host:6379

# Performance settings
REDIS_MAX_RETRIES=5
REDIS_RETRY_DELAY=2000
REDIS_POOL_SIZE=20
```

### Recommended Managed Redis Services
- **AWS ElastiCache** (Redis)
- **Azure Cache for Redis**
- **Google Cloud Memorystore**
- **Redis Cloud** (Redis Labs)
- **Upstash** (Serverless Redis)

---

## 🔧 Configuration Reference

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_ENABLED` | `false` | Enable/disable Redis cache |
| `REDIS_HOST` | `localhost` | Redis server hostname |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | (none) | Redis authentication password |
| `REDIS_URL` | (none) | Full Redis connection URL |
| `REDIS_KEY_PREFIX` | `fm:` | Prefix for all cache keys |
| `REDIS_MAX_RETRIES` | `3` | Max connection retry attempts |
| `REDIS_RETRY_DELAY` | `1000` | Delay between retries (ms) |
| `REDIS_MAX_MEMORY` | `2gb` | Max memory (Docker only) |

---

## 🎯 Cache Behavior

### With Redis Enabled
```
Request → Memory Cache (L1) → Redis Cache (L2) → Database
```

- **Fastest**: Memory cache (L1) - ~1ms
- **Fast**: Redis cache (L2) - ~5ms
- **Slower**: Database - ~50-200ms

### With Redis Disabled
```
Request → Memory Cache → Database
```

- **Fast**: Memory cache - ~1ms
- **Slower**: Database - ~50-200ms

---

## 🐛 Troubleshooting

### Error: `ENOTFOUND redis`

**Problem**: App trying to connect to hostname "redis" (Docker name) but not running in Docker.

**Solution**: Disable Redis in `.env.local`:
```bash
REDIS_ENABLED=false
```

### Error: `ECONNREFUSED localhost:6379`

**Problem**: Redis server not running.

**Solutions**:
1. **Option A**: Disable Redis (recommended for dev):
   ```bash
   REDIS_ENABLED=false
   ```

2. **Option B**: Start Redis server:
   ```bash
   # macOS
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   
   # Windows
   redis-server
   ```

### Error: `Redis cache error` spam in logs

**Problem**: Redis trying to connect but failing repeatedly.

**Solution**: Ensure `REDIS_ENABLED=false` in `.env.local`

---

## 🧪 Testing Cache

### Test Memory Cache (No Redis)
```bash
# .env.local
REDIS_ENABLED=false

# Run dev server
npm run dev

# Cache will use memory only
```

### Test Redis Cache
```bash
# .env.local
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379

# Start Redis
brew services start redis  # or equivalent

# Run dev server
npm run dev

# Check logs for "Redis cache connected"
```

---

## 📊 Monitoring

### View Cache Keys (Redis CLI)
```bash
# Connect to Redis
redis-cli

# List all keys
KEYS fm:*

# Get a value
GET fm:farm:123

# Monitor commands in real-time
MONITOR
```

### View Cache Stats
```bash
# Memory info
redis-cli INFO memory

# Stats
redis-cli INFO stats
```

---

## 🎓 Best Practices

### Development
- ✅ **Disable Redis** - simpler setup
- ✅ Use memory cache - sufficient for dev
- ✅ Only enable Redis when testing distributed features

### Staging/Production
- ✅ **Enable Redis** - required for multi-instance
- ✅ Use managed Redis service
- ✅ Set strong password
- ✅ Configure connection pooling
- ✅ Monitor memory usage
- ✅ Set eviction policy (allkeys-lru recommended)

---

## 📝 Quick Start Commands

### Local Development (No Redis)
```bash
# Add to .env.local
echo "REDIS_ENABLED=false" >> .env.local

# Start dev server
npm run dev
```

### Local Development (With Redis)
```bash
# Install Redis
brew install redis  # macOS
# or: choco install redis-64  # Windows
# or: sudo apt install redis-server  # Linux

# Start Redis
brew services start redis  # macOS
# or: redis-server  # Windows/Linux

# Add to .env.local
echo "REDIS_ENABLED=true" >> .env.local
echo "REDIS_URL=redis://localhost:6379" >> .env.local

# Start dev server
npm run dev
```

### Docker (With Redis)
```bash
# Start all services
docker-compose up -d

# Redis automatically configured
```

---

## 🔗 Resources

- [Redis Official Documentation](https://redis.io/documentation)
- [ioredis Client Library](https://github.com/luin/ioredis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Caching Strategies](https://redis.io/docs/manual/client-side-caching/)

---

**Last Updated**: 2025-12-06  
**Version**: 1.0.0