# 🗄️ Database Setup & Configuration Guide

Complete guide for setting up and configuring the Farmers Market Platform database with PostgreSQL and Prisma.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database URLs Explained](#database-urls-explained)
- [Prisma Configuration](#prisma-configuration)
- [Database Client Usage](#database-client-usage)
- [Migrations](#migrations)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Set Up Environment Variables

Create or update your `.env.local` file:

```bash
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# Direct PostgreSQL Connection (for migrations, Prisma Studio, development)
DATABASE_URL="postgres://604c4fe0c73e61a0f3fb05e4130752b835fcddba7f35f5c87f3f636958772303:sk_NOjmSebRnYcwiC9GGWFzV@db.prisma.io:5432/postgres?sslmode=require"

# Prisma Accelerate Connection (for production queries with caching/pooling)
# Only used in production environment
DATABASE_URL_ACCELERATE="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19OT2ptU2ViUm5ZY3dpQzlHR1dGelYiLCJhcGlfa2V5IjoiMDFLQ1dTNzEwWEtROERFOVY2UVhYSFdWQTciLCJ0ZW5hbnRfaWQiOiI2MDRjNGZlMGM3M2U2MWEwZjNmYjA1ZTQxMzA3NTJiODM1ZmNkZGJhN2YzNWY1Yzg3ZjNmNjM2OTU4NzcyMzAzIiwiaW50ZXJuYWxfc2VjcmV0IjoiODhkYzQ0YjAtYjFiMS00YjY0LWFjYjAtYzg0MzhkM2NiZjM0In0.kx13UJDaXpBiWYC93tiaINPUI-FaqW5qkrZzgvn-bps"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev
```

### 5. (Optional) Seed Database

```bash
npx prisma db seed
```

### 6. Verify Setup

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Purpose | Environment |
|----------|---------|-------------|
| `DATABASE_URL` | Direct PostgreSQL connection | All |

### Optional Variables

| Variable | Purpose | Environment |
|----------|---------|-------------|
| `DATABASE_URL_ACCELERATE` | Prisma Accelerate connection | Production |
| `DATABASE_POOL_MAX` | Max connection pool size | Production |
| `DATABASE_POOL_MIN` | Min connection pool size | Production |
| `DATABASE_POOL_TIMEOUT` | Connection timeout (ms) | Production |

### Environment-Specific Files

```
.env                 # Shared variables (committed to git - no secrets!)
.env.local           # Local development (gitignored)
.env.development     # Development overrides
.env.test            # Test environment
.env.production      # Production overrides
```

**⚠️ SECURITY WARNING**: Never commit `.env.local` or any file containing real database credentials!

---

## 📡 Database URLs Explained

### Direct PostgreSQL URL

```
postgres://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?[OPTIONS]
```

**Example:**
```
postgres://user:password@db.prisma.io:5432/mydb?sslmode=require
```

**Components:**
- `user` - Database username
- `password` - Database password
- `db.prisma.io` - Database host
- `5432` - Port (default PostgreSQL port)
- `mydb` - Database name
- `sslmode=require` - SSL configuration

**Used For:**
- ✅ Database migrations (`prisma migrate`)
- ✅ Prisma Studio
- ✅ Local development
- ✅ Direct database queries
- ✅ Database seeding

---

### Prisma Accelerate URL

```
prisma+postgres://accelerate.prisma-data.net/?api_key=[YOUR_API_KEY]
```

**Used For:**
- ✅ Production application queries
- ✅ Connection pooling (prevents connection exhaustion)
- ✅ Query caching (improved performance)
- ✅ Edge runtime compatibility

**Benefits:**
- 🚀 Automatic connection pooling
- 💾 Built-in query caching
- 🌍 Global CDN for low latency
- 📊 Query analytics and monitoring
- 🔒 Secure API key authentication

**Not Used For:**
- ❌ Database migrations (use direct URL)
- ❌ Prisma Studio (use direct URL)
- ❌ Schema changes (use direct URL)

---

## ⚙️ Prisma Configuration

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  directUrl    = env("DATABASE_URL")
  relationMode = "foreignKeys"
}
```

**Configuration Explained:**

- `provider: "prisma-client-js"` - TypeScript/JavaScript client
- `binaryTargets` - Support for local and Docker/serverless environments
- `url` - Runtime database connection (can use Accelerate in production)
- `directUrl` - Direct connection for migrations (always PostgreSQL)
- `relationMode: "foreignKeys"` - Use PostgreSQL foreign keys

---

## 🎯 Database Client Usage

### ✅ CORRECT - Canonical Import

```typescript
// ALWAYS use this import
import { database } from "@/lib/database";

// Query example
const farms = await database.farm.findMany({
  where: { status: 'ACTIVE' },
  include: { owner: true }
});
```

### ✅ CORRECT - Type-Only Imports

```typescript
// Import types from Prisma
import type { Farm, Product, User } from "@prisma/client";
import type { Prisma } from "@prisma/client";

// Use types
const farm: Farm = await database.farm.findUnique({
  where: { id: farmId }
});
```

### ❌ FORBIDDEN - New Prisma Instances

```typescript
// NEVER DO THIS - Creates connection leaks!
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

### Environment-Aware Connection

The database singleton automatically uses the correct connection:

```typescript
// src/lib/database/index.ts
// Automatically switches based on NODE_ENV and available URLs

// Development: Uses DATABASE_URL (direct)
// Production: Uses DATABASE_URL_ACCELERATE if available, else DATABASE_URL
// Test: Uses DATABASE_URL (direct)
```

---

## 🔄 Migrations

### Create a New Migration

```bash
# Create migration from schema changes
npx prisma migrate dev --name add_farm_fields
```

### Apply Migrations (Production)

```bash
# Apply pending migrations
npx prisma migrate deploy
```

### Reset Database (Development Only!)

```bash
# ⚠️ WARNING: Deletes all data!
npx prisma migrate reset
```

### View Migration Status

```bash
npx prisma migrate status
```

### Create Migration Without Applying

```bash
npx prisma migrate dev --create-only
```

---

## 🧪 Database Testing

### Test Environment Setup

Create `.env.test`:

```bash
# Test Database (separate from development)
DATABASE_URL="postgres://user:password@localhost:5432/farmers_market_test?sslmode=disable"
```

### Running Tests

```bash
# Run all tests
npm run test

# Run with database setup/teardown
npm run test:integration
```

### Test Database Best Practices

1. **Use a separate test database** - Never test against development or production
2. **Reset between tests** - Use transactions or reset database
3. **Use factories** - Generate test data programmatically
4. **Mock external services** - Don't hit real APIs in tests

---

## 🔍 Prisma Studio

Prisma Studio is a visual database browser.

### Open Prisma Studio

```bash
npx prisma studio
```

Access at: `http://localhost:5555`

### Features

- 👀 View all database tables
- ✏️ Edit records directly
- 🔍 Search and filter data
- 📊 View relationships
- 🗑️ Delete records

---

## 📊 Database Health Monitoring

### Check Database Health

```typescript
import { checkDatabaseHealth } from "@/lib/database";

const health = await checkDatabaseHealth();
console.log(health);
// { healthy: true, latency: 45, error?: string }
```

### Get Connection Statistics

```typescript
import { getDatabaseStats } from "@/lib/database";

const stats = await getDatabaseStats();
console.log(stats);
// {
//   connections: 5,
//   maxConnections: 100,
//   idleConnections: 2
// }
```

### API Health Endpoint

```bash
# Check application health (includes database)
curl https://your-domain.com/api/health
```

---

## 🚨 Troubleshooting

### Error: "DATABASE_URL environment variable is not set"

**Solution:**
1. Create `.env.local` file in project root
2. Add `DATABASE_URL="postgres://..."`
3. Restart your development server

---

### Error: "Can't reach database server"

**Possible Causes:**
- Database is not running
- Incorrect host/port
- Firewall blocking connection
- SSL/TLS configuration issue

**Solutions:**

```bash
# 1. Check if database is accessible
psql -h db.prisma.io -U your_user -d postgres

# 2. Test connection with Prisma
npx prisma db pull

# 3. Check SSL requirements
# Add to your DATABASE_URL: ?sslmode=require
```

---

### Error: "Too many connections"

**Cause:** Connection pool exhaustion

**Solutions:**

1. **Reduce max connections** (`.env`):
```bash
DATABASE_POOL_MAX=1
```

2. **Use Prisma Accelerate** (production):
```bash
DATABASE_URL_ACCELERATE="prisma+postgres://..."
```

3. **Close connections properly**:
```typescript
// Always await database operations
await database.$disconnect();
```

---

### Error: "Migration failed"

**Common Issues:**

1. **Conflicting changes:**
```bash
# Reset migration history (dev only!)
npx prisma migrate reset
```

2. **Manual database changes:**
```bash
# Pull current database schema
npx prisma db pull

# Create migration from pulled schema
npx prisma migrate dev
```

3. **Locked database:**
```bash
# Wait for other migrations to complete
# Or kill blocking queries in database
```

---

### Error: "Type 'never' cannot be used as an index type"

**Cause:** Prisma event listeners type issue

**Solution:** Use type assertion:
```typescript
client.$on("query" as never, (e: any) => {
  // Handle query event
});
```

---

### Slow Queries

**Check slow query logs:**

The database client automatically logs queries >1 second.

**Solutions:**

1. **Add database indexes:**
```prisma
model Farm {
  id   String @id
  name String

  @@index([name])
}
```

2. **Use select to limit fields:**
```typescript
const farms = await database.farm.findMany({
  select: {
    id: true,
    name: true,
    // Only fetch needed fields
  }
});
```

3. **Use pagination:**
```typescript
const farms = await database.farm.findMany({
  take: 20,
  skip: (page - 1) * 20
});
```

4. **Optimize includes:**
```typescript
// Bad - fetches everything
include: { products: true }

// Good - limit and select
include: {
  products: {
    take: 10,
    select: { id: true, name: true }
  }
}
```

---

## 📚 Additional Resources

### Official Documentation
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate)

### Internal Documentation
- `.cursorrules` - Claude Sonnet 4.5 Database Patterns
- `src/lib/database/index.ts` - Database singleton implementation
- `src/lib/database/config.ts` - Configuration utilities
- `prisma/schema.prisma` - Database schema

### Project-Specific
- Database migrations: `prisma/migrations/`
- Seed scripts: `prisma/seed.ts`
- Repository layer: `src/lib/repositories/`
- Service layer: `src/lib/services/`

---

## ✅ Database Setup Checklist

- [ ] Environment variables configured (`.env.local`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Migrations applied (`npx prisma migrate dev`)
- [ ] Database seeded (optional)
- [ ] Prisma Studio accessible (`npx prisma studio`)
- [ ] Health check passing (`/api/health`)
- [ ] Using canonical import (`@/lib/database`)
- [ ] No new PrismaClient instances created
- [ ] Slow query monitoring configured
- [ ] Production uses Accelerate (if available)

---

## 🎯 Best Practices Summary

### ✅ DO
- Use the canonical `database` import from `@/lib/database`
- Import types from `@prisma/client` with `type` keyword
- Use `DATABASE_URL` for migrations and development
- Use `DATABASE_URL_ACCELERATE` in production
- Close connections in serverless functions
- Monitor query performance
- Use transactions for related operations
- Add database indexes for commonly queried fields

### ❌ DON'T
- Create new PrismaClient instances
- Commit `.env.local` to git
- Run migrations in production without testing
- Use development database for testing
- Ignore slow query warnings
- Mix direct and Accelerate URLs incorrectly
- Forget to await database operations
- Create N+1 query problems

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintained by:** Agricultural Development Team

For questions or issues, please refer to the troubleshooting section or contact the development team.