# 🔴 Redis Setup Guide

## ⚠️ SECURITY WARNING

**Your Redis credentials were exposed in the conversation history!**

You shared:

- Host: `redis-18095.crce198.eu-central-1-3.ec2.cloud.redislabs.com`
- Port: `18095`
- Password: `9MaIaT7jeI8L7cmS0PUDbTWI2RQ3o0kK` ⚠️

**ACTION REQUIRED:** Reset your Redis password immediately!

---

## 🔒 Step 1: Rotate Your Redis Password (URGENT!)

1. Go to [Redis Labs Dashboard](https://app.redislabs.com/)
2. Navigate to your database: `redis-18095`
3. Click **Configuration** → **Security**
4. Click **Reset Password** or **Change Password**
5. Save the new password securely (use a password manager)

---

## 📝 Step 2: Add Redis to Environment Variables

### Local Development (.env.local)

After resetting your password, add these variables to `.env.local`:

```env
# Redis Configuration (Redis Labs)
REDIS_HOST=redis-18095.crce198.eu-central-1-3.ec2.cloud.redislabs.com
REDIS_PORT=18095
REDIS_PASSWORD=YOUR_NEW_PASSWORD_HERE
```

### Vercel Deployment

Add the same variables in Vercel Dashboard:

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add each variable:
   - **REDIS_HOST**: `redis-18095.crce198.eu-central-1-3.ec2.cloud.redislabs.com`
   - **REDIS_PORT**: `18095`
   - **REDIS_PASSWORD**: `<your-new-password>`
3. Apply to: **Production**, **Preview**, and **Development**
4. Redeploy your application

---

## 🧪 Step 3: Test Redis Connection

### Method 1: Using the Test Script

```bash
# Run the Redis connection test
node scripts/test-redis.js
```

Expected output:

```
✅ Successfully connected to Redis!
✅ PING test passed
✅ SET test passed
✅ GET test passed
✅ All Tests Passed!
```

### Method 2: Using Redis CLI (if installed)

```bash
# Install Redis CLI (Windows with Chocolatey)
choco install redis

# Or download from: https://github.com/microsoftarchive/redis/releases

# Test connection
redis-cli -h redis-18095.crce198.eu-central-1-3.ec2.cloud.redislabs.com -p 18095 -a YOUR_NEW_PASSWORD ping
```

### Method 3: Test via API

```bash
# Start your Next.js app
npm run dev

# Test the cache health endpoint
curl http://localhost:3000/api/health/cache
```

Expected response:

```json
{
  "status": "healthy",
  "redis": {
    "connected": true,
    "latency": 45
  }
}
```

---

## 🔍 Troubleshooting

### ❌ Connection Refused

**Error:** `ECONNREFUSED`

**Solutions:**

- Verify `REDIS_HOST` and `REDIS_PORT` are correct
- Check Redis Labs dashboard - database must be active
- Verify your IP is not blocked (Redis Labs has IP whitelisting)

### ❌ Authentication Failed

**Error:** `NOAUTH` or `ERR invalid password`

**Solutions:**

- Verify `REDIS_PASSWORD` is correct (copy-paste to avoid typos)
- Ensure you've reset the password after exposure
- Check for extra spaces in environment variable value

### ❌ Timeout

**Error:** `Connection timeout`

**Solutions:**

- Check your internet connection
- Verify Redis Labs database is in "Active" state
- Try increasing connection timeout in Redis config

### ❌ Host Not Found

**Error:** `ENOTFOUND`

**Solutions:**

- Double-check `REDIS_HOST` spelling
- Ensure DNS resolution is working
- Try pinging the host: `ping redis-18095.crce198.eu-central-1-3.ec2.cloud.redislabs.com`

---

## 🏗️ Redis Usage in the App

### Caching Service

```typescript
// lib/cache/index.ts
import { Redis } from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

// Set cache
await redis.setex("key", 3600, JSON.stringify(data));

// Get cache
const cached = await redis.get("key");
```

### Use Cases in Farmers Market App

1. **Session Caching**
   - Store user sessions
   - JWT token blacklisting

2. **API Response Caching**
   - Cache farm listings
   - Cache product searches
   - Cache user profiles

3. **Rate Limiting**
   - Limit API requests per user
   - Prevent abuse

4. **Real-time Features**
   - Order status updates
   - Inventory tracking
   - Live notifications

---

## 🔐 Security Best Practices

### ✅ DO:

- Store credentials in `.env.local` (never commit)
- Use environment variables in Vercel
- Reset passwords if exposed
- Use TLS/SSL connections (Redis Labs provides this by default)
- Implement rate limiting on Redis operations
- Set appropriate TTL (expiration) on cached data

### ❌ DON'T:

- Commit `.env.local` to Git
- Share credentials in chat, tickets, or emails
- Use default passwords
- Store sensitive data in Redis without encryption
- Leave Redis exposed without authentication

---

## 📊 Monitoring Redis

### Redis Labs Dashboard

Monitor your database at: https://app.redislabs.com/

Key metrics to watch:

- **Memory Usage**: Should stay below 80% of limit
- **Operations/sec**: Track request rate
- **Connected Clients**: Monitor connections
- **Hit Rate**: Cache effectiveness

### App-level Monitoring

```typescript
// Check Redis health
const health = await redis.ping();
const info = await redis.info();
const memory = await redis.info("memory");
```

---

## 🚀 Performance Optimization

### Connection Pooling

```typescript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  // Connection pool settings
  retryStrategy: (times) => Math.min(times * 50, 2000),
  reconnectOnError: (err) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});
```

### Multi-layer Caching

```typescript
// L1: In-memory (fastest)
const memoryCache = new Map();

// L2: Redis (fast, shared)
const redis = new Redis(config);

async function get(key) {
  // Check memory first
  if (memoryCache.has(key)) return memoryCache.get(key);

  // Check Redis
  const cached = await redis.get(key);
  if (cached) {
    memoryCache.set(key, cached);
    return cached;
  }

  return null;
}
```

---

## 📚 Additional Resources

- [Redis Labs Documentation](https://docs.redis.com/)
- [ioredis GitHub](https://github.com/luin/ioredis)
- [Redis Commands Reference](https://redis.io/commands)
- [Caching Best Practices](https://redis.io/docs/manual/patterns/)

---

## ✅ Checklist

Before deploying:

- [ ] Redis password has been reset after exposure
- [ ] New credentials added to `.env.local`
- [ ] Redis credentials added to Vercel environment variables
- [ ] Connection tested with `node scripts/test-redis.js`
- [ ] `/api/health/cache` endpoint returns success
- [ ] Redis Labs dashboard shows active connections
- [ ] Caching service works in the app

---

## 🆘 Need Help?

If Redis connection still fails after following this guide:

1. Check the test script output: `node scripts/test-redis.js`
2. Verify environment variables: Visit `/debug/env-check`
3. Check Redis Labs dashboard for database status
4. Review Vercel function logs for connection errors
5. Contact Redis Labs support if database is unreachable

---

**Remember:** Keep your Redis credentials secure and never share them publicly!
