# 🧪 Testing Database Setup Guide

**Purpose**: Configure test database for running integration tests  
**Audience**: Developers, QA Engineers, CI/CD Pipeline  
**Status**: Phase 3 - Integration Testing Ready

---

## 📋 Overview

Integration tests require a separate test database to avoid contaminating production or development data. This guide covers:

1. Local test database setup
2. Environment configuration
3. Running migrations
4. Executing tests
5. Troubleshooting
6. CI/CD integration

---

## 🗄️ Test Database Requirements

### Minimum Requirements
- **PostgreSQL**: 14+ (Recommended: 16+)
- **Extensions**: `pg_trgm` (for text search)
- **Memory**: 512MB minimum
- **Storage**: 1GB minimum

### Recommended Setup
- **PostgreSQL**: 16.x
- **Memory**: 2GB
- **Storage**: 5GB
- **Dedicated test instance** (separate from dev/prod)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Create Test Database

**Option A: Using psql (Command Line)**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE farmers_market_test;

# Create test user (optional but recommended)
CREATE USER test_user WITH PASSWORD 'test_password_123';
GRANT ALL PRIVILEGES ON DATABASE farmers_market_test TO test_user;

# Exit psql
\q
```

**Option B: Using pgAdmin (GUI)**
1. Right-click "Databases" → "Create" → "Database"
2. Name: `farmers_market_test`
3. Owner: `postgres` (or create dedicated test user)
4. Click "Save"

**Option C: Using Docker**
```bash
# Run PostgreSQL in Docker container
docker run --name postgres-test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password_123 \
  -e POSTGRES_DB=farmers_market_test \
  -p 5433:5432 \
  -d postgres:16

# Wait for container to be ready
docker logs -f postgres-test
# Wait until you see: "database system is ready to accept connections"
```

### Step 2: Configure Environment

Create or update `.env.test` file:

```bash
# .env.test - Test Environment Configuration

# Database - Test Instance
DATABASE_URL="postgresql://test_user:test_password_123@localhost:5432/farmers_market_test"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="test-secret-key-for-testing-only-min-32-chars"

# Redis (Optional - tests use mocked cache)
UPSTASH_REDIS_REST_URL="http://localhost:6379"
UPSTASH_REDIS_REST_TOKEN="test-token"

# Disable external services in tests
NODE_ENV="test"
SKIP_ENV_VALIDATION="true"

# Test-specific settings
TEST_DATABASE_URL="postgresql://test_user:test_password_123@localhost:5432/farmers_market_test"
```

**Important Notes**:
- Use **different port** if dev database is on 5432 (e.g., 5433 for test)
- Use **different credentials** from production/dev
- **Never** point to production database!

### Step 3: Run Migrations

```bash
# Set test database URL
export DATABASE_URL="postgresql://test_user:test_password_123@localhost:5432/farmers_market_test"

# Or on Windows PowerShell
$env:DATABASE_URL="postgresql://test_user:test_password_123@localhost:5432/farmers_market_test"

# Run migrations
npx prisma migrate deploy

# Verify migrations
npx prisma db push --skip-generate

# Generate Prisma Client
npx prisma generate
```

### Step 4: Enable Required Extensions

```bash
# Connect to test database
psql -U test_user -d farmers_market_test

# Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

# Verify extensions
\dx

# Exit
\q
```

### Step 5: Run Tests

```bash
# Run all integration tests
npm test -- src/__tests__/integration/ --no-coverage

# Run specific test file
npm test -- src/__tests__/integration/api/farms.integration.test.ts --no-coverage

# Run with coverage
npm test -- src/__tests__/integration/
```

---

## 🔧 Detailed Configuration

### Database Connection String Format

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?[OPTIONS]
```

**Examples**:

```bash
# Local PostgreSQL (default port)
postgresql://postgres:password@localhost:5432/farmers_market_test

# Local PostgreSQL (custom port)
postgresql://test_user:test_pass@localhost:5433/farmers_market_test

# Docker container
postgresql://test_user:test_pass@localhost:5433/farmers_market_test

# Remote test server
postgresql://test_user:test_pass@test-db.example.com:5432/farmers_market_test

# With SSL (production-like testing)
postgresql://user:pass@localhost:5432/test_db?sslmode=require

# Connection pooling (for parallel tests)
postgresql://user:pass@localhost:5432/test_db?connection_limit=10
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | Test database connection string |
| `TEST_DATABASE_URL` | ⚠️ Optional | Same as DATABASE_URL | Explicit test DB URL |
| `NODE_ENV` | ✅ Yes | `test` | Must be "test" |
| `NEXTAUTH_URL` | ✅ Yes | - | Auth callback URL |
| `NEXTAUTH_SECRET` | ✅ Yes | - | JWT signing secret |
| `UPSTASH_REDIS_REST_URL` | ❌ No | - | Redis (mocked in tests) |
| `SKIP_ENV_VALIDATION` | ❌ No | `false` | Skip env validation |

---

## 🐳 Docker Setup (Recommended for CI/CD)

### Docker Compose Configuration

Create `docker-compose.test.yml`:

```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:16-alpine
    container_name: farmers-market-test-db
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password_123
      POSTGRES_DB: farmers_market_test
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5433:5432"
    volumes:
      - test-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user -d farmers_market_test"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  test-postgres-data:
    driver: local
```

### Using Docker Compose

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Wait for database to be ready
docker-compose -f docker-compose.test.yml ps

# Run migrations
DATABASE_URL="postgresql://test_user:test_password_123@localhost:5433/farmers_market_test" \
  npx prisma migrate deploy

# Run tests
npm test -- src/__tests__/integration/

# Stop and remove test database
docker-compose -f docker-compose.test.yml down

# Stop and remove with data cleanup
docker-compose -f docker-compose.test.yml down -v
```

---

## 📝 Test Database Management

### Reset Test Database

```bash
# Option 1: Drop and recreate (clean slate)
psql -U postgres -c "DROP DATABASE IF EXISTS farmers_market_test;"
psql -U postgres -c "CREATE DATABASE farmers_market_test;"

# Option 2: Prisma migrate reset
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/farmers_market_test" \
  npx prisma migrate reset --skip-seed

# Option 3: Delete all data (keep schema)
npm run test:db:clean
```

### Seed Test Data (Optional)

Create `prisma/seed.test.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test database...');

  // Create test users
  const testFarmer = await prisma.user.create({
    data: {
      email: 'test-farmer@example.com',
      name: 'Test Farmer',
      password: await hash('TestPassword123!', 10),
      role: 'FARMER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // Create test farm
  await prisma.farm.create({
    data: {
      name: 'Test Farm',
      slug: 'test-farm',
      description: 'A test farm for integration testing',
      ownerId: testFarmer.id,
      email: 'test-farm@example.com',
      phone: '+15551234567',
      address: '123 Test Road',
      city: 'Test City',
      state: 'CA',
      zipCode: '95616',
      country: 'US',
      latitude: 38.5449,
      longitude: -121.7405,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Test data seeded successfully');
}

seedTestData()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/farmers_market_test" \
  npx tsx prisma/seed.test.ts
```

---

## 🧹 Cleanup Strategies

### After Each Test

Tests should clean up their own data:

```typescript
afterEach(async () => {
  // Delete test data created in this test
  await database.farm.deleteMany({
    where: { slug: { startsWith: 'test-' } }
  });
});
```

### After All Tests

```typescript
afterAll(async () => {
  // Delete all test data
  await database.farm.deleteMany({});
  await database.user.deleteMany({});
  
  // Disconnect
  await database.$disconnect();
});
```

### Full Database Cleanup Script

Create `scripts/clean-test-db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

async function cleanTestDatabase() {
  console.log('🧹 Cleaning test database...');

  // Delete in correct order (respect foreign keys)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.review.deleteMany();
  await prisma.farmPhoto.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Test database cleaned');
}

cleanTestDatabase()
  .catch((e) => {
    console.error('❌ Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run cleanup:
```bash
npm run test:db:clean
```

Add to `package.json`:
```json
{
  "scripts": {
    "test:db:clean": "tsx scripts/clean-test-db.ts"
  }
}
```

---

## 🔍 Verification & Health Checks

### Verify Database Connection

```bash
# Check connection
psql -U test_user -d farmers_market_test -c "SELECT version();"

# Check tables
psql -U test_user -d farmers_market_test -c "\dt"

# Check extensions
psql -U test_user -d farmers_market_test -c "\dx"

# Check row counts
psql -U test_user -d farmers_market_test -c "
  SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
  FROM pg_stat_user_tables
  ORDER BY n_live_tup DESC;
"
```

### Test Database Health Check

Create `scripts/test-db-health.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  try {
    console.log('🏥 Checking test database health...');

    // 1. Check connection
    await prisma.$connect();
    console.log('✅ Database connection: OK');

    // 2. Check schema
    const result = await prisma.$queryRaw`SELECT 1 as health`;
    console.log('✅ Query execution: OK');

    // 3. Check extensions
    const extensions = await prisma.$queryRaw`
      SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';
    `;
    console.log('✅ Extensions: OK', extensions);

    // 4. Check tables
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `;
    console.log('✅ Tables found:', (tables as any[]).length);

    console.log('\n🎉 Test database is healthy and ready!');
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseHealth();
```

Run health check:
```bash
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/farmers_market_test" \
  npx tsx scripts/test-db-health.ts
```

---

## 🚨 Troubleshooting

### Issue: "Connection refused"

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                # macOS
Get-Service postgresql*           # Windows PowerShell

# Start PostgreSQL
sudo systemctl start postgresql   # Linux
brew services start postgresql    # macOS
net start postgresql-x64-16       # Windows

# Check if port is open
netstat -an | grep 5432           # Linux/macOS
netstat -an | findstr 5432        # Windows
```

### Issue: "Database does not exist"

**Problem**: Test database not created

**Solution**:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE farmers_market_test;"

# Verify
psql -U postgres -l | grep farmers_market_test
```

### Issue: "Permission denied"

**Problem**: User lacks permissions

**Solution**:
```bash
# Grant all privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE farmers_market_test TO test_user;"

# Grant schema permissions
psql -U postgres -d farmers_market_test -c "GRANT ALL ON SCHEMA public TO test_user;"
```

### Issue: "Migrations fail"

**Problem**: Schema out of sync

**Solution**:
```bash
# Reset migrations
DATABASE_URL="postgresql://..." npx prisma migrate reset

# Force push schema
DATABASE_URL="postgresql://..." npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

### Issue: "Tests timeout"

**Problem**: Slow database or connection pool exhaustion

**Solutions**:
```bash
# Increase connection pool size
DATABASE_URL="postgresql://user:pass@localhost:5432/test?connection_limit=20"

# Increase test timeout in jest.config.js
module.exports = {
  testTimeout: 30000, // 30 seconds
};

# Run tests serially (not parallel)
npm test -- --runInBand
```

### Issue: "Extension not found"

**Problem**: `pg_trgm` extension not installed

**Solution**:
```bash
# Install PostgreSQL contrib package
sudo apt-get install postgresql-contrib-16  # Ubuntu
brew install postgresql@16                  # macOS

# Enable extension
psql -U postgres -d farmers_market_test -c "CREATE EXTENSION pg_trgm;"
```

---

## 🤖 CI/CD Integration

### GitHub Actions

Create `.github/workflows/integration-tests.yml`:

```yaml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password_123
          POSTGRES_DB: farmers_market_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    env:
      DATABASE_URL: postgresql://test_user:test_password_123@localhost:5432/farmers_market_test
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: test-secret-for-ci-pipeline-min-32-chars
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy

      - name: Enable PostgreSQL extensions
        run: |
          psql -U test_user -d farmers_market_test \
            -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

      - name: Run integration tests
        run: npm test -- src/__tests__/integration/ --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: integration-tests
```

### Vercel (Preview Deployments)

For preview deployments, use ephemeral test database:

```bash
# .vercel/test-db.sh
#!/bin/bash

# Create temporary test database
psql $PREVIEW_DATABASE_URL -c "CREATE DATABASE test_preview_${VERCEL_GIT_COMMIT_SHA};"

# Run migrations
DATABASE_URL="postgresql://...test_preview_${VERCEL_GIT_COMMIT_SHA}" \
  npx prisma migrate deploy

# Run tests
npm test -- src/__tests__/integration/

# Cleanup
psql $PREVIEW_DATABASE_URL -c "DROP DATABASE test_preview_${VERCEL_GIT_COMMIT_SHA};"
```

---

## 📊 Performance Considerations

### Connection Pooling

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool configuration
  log: process.env.NODE_ENV === 'test' ? [] : ['query', 'error', 'warn'],
  // Increase connection pool for parallel tests
  // Default pool size: 10
  // For tests: num_physical_cpus * 2 + 1
});

export { prisma as database };
```

### Parallel Test Execution

```bash
# Run tests in parallel (faster)
npm test -- src/__tests__/integration/ --maxWorkers=4

# Run tests serially (more stable, slower)
npm test -- src/__tests__/integration/ --runInBand

# Auto-detect optimal workers
npm test -- src/__tests__/integration/ --maxWorkers=50%
```

### Test Database Size Limits

```sql
-- Set database size limit (optional)
ALTER DATABASE farmers_market_test 
SET max_connections = 50;

-- Monitor database size
SELECT pg_size_pretty(pg_database_size('farmers_market_test'));
```

---

## ✅ Verification Checklist

Before running integration tests, verify:

- [ ] PostgreSQL 14+ installed and running
- [ ] Test database `farmers_market_test` created
- [ ] Test user with proper permissions
- [ ] `.env.test` file configured with correct `DATABASE_URL`
- [ ] Migrations applied (`npx prisma migrate deploy`)
- [ ] Extensions enabled (`pg_trgm`, `btree_gin`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Database connection verified (health check passes)
- [ ] Test data cleanup strategy in place

---

## 📚 Quick Reference Commands

```bash
# Setup
createdb farmers_market_test
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma generate

# Run Tests
npm test -- src/__tests__/integration/

# Cleanup
npm run test:db:clean
dropdb farmers_market_test

# Health Check
psql -d farmers_market_test -c "SELECT 1;"

# Reset
DATABASE_URL="postgresql://..." npx prisma migrate reset
```

---

## 🎯 Next Steps

After setting up test database:

1. ✅ Run integration tests: `npm test -- src/__tests__/integration/`
2. ✅ Verify all tests pass
3. ✅ Set up CI/CD pipeline with test database
4. ✅ Configure pre-commit hooks to run tests
5. ✅ Add test database to team documentation

---

**Status**: ✅ Ready for Integration Testing  
**Last Updated**: January 2025  
**Maintained By**: Development Team

🌾 **Agricultural Consciousness: Test with Confidence** ⚡