# 🗄️ Test Database Setup Guide
## Quick Start for Integration Testing

**Purpose**: Set up a dedicated PostgreSQL test database for running integration tests.

**Time Required**: ~10 minutes

---

## 📋 Prerequisites

- PostgreSQL 16+ installed (or Docker)
- Node.js 20+ installed
- Project dependencies installed (`npm install`)

---

## 🚀 Quick Setup (Choose One Method)

### Method A: Docker (Recommended)

**Fastest and most isolated approach**

```bash
# 1. Start PostgreSQL test container
docker run -d \
  --name farmers-market-test-db \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=farmers_market_test \
  -p 5433:5432 \
  postgres:16-alpine

# 2. Verify container is running
docker ps | grep farmers-market-test-db

# 3. Test connection
docker exec farmers-market-test-db psql -U test -d farmers_market_test -c "SELECT 1;"
```

**Environment Configuration**:
```bash
# .env.test (create or update)
DATABASE_URL="postgresql://test:test@localhost:5433/farmers_market_test"
NODE_ENV="test"
```

---

### Method B: Local PostgreSQL Instance

**Use existing PostgreSQL installation**

```bash
# 1. Create test database
createdb farmers_market_test

# 2. Create test user (if doesn't exist)
psql -d postgres -c "CREATE USER test WITH PASSWORD 'test';"

# 3. Grant privileges
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE farmers_market_test TO test;"

# 4. Test connection
psql -U test -d farmers_market_test -c "SELECT 1;"
```

**Environment Configuration**:
```bash
# .env.test (create or update)
DATABASE_URL="postgresql://test:test@localhost:5432/farmers_market_test"
NODE_ENV="test"
```

---

### Method C: Separate Schema in Existing Database

**Use existing database with separate schema**

```bash
# 1. Connect to existing database
psql -U your_user -d farmers_market

# 2. Create test schema
CREATE SCHEMA IF NOT EXISTS test;

# 3. Grant permissions
GRANT ALL ON SCHEMA test TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA test TO your_user;
```

**Environment Configuration**:
```bash
# .env.test
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/farmers_market?schema=test"
NODE_ENV="test"
```

---

## 🔧 Database Migration Setup

After creating the test database, run Prisma migrations:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Run migrations on test database
npm run prisma:migrate:test
# OR manually:
DATABASE_URL="postgresql://test:test@localhost:5433/farmers_market_test" \
  npx prisma migrate deploy

# 3. Verify tables were created
docker exec farmers-market-test-db psql -U test -d farmers_market_test -c "\dt"
```

**Expected Output**:
```
                List of relations
 Schema |        Name         | Type  | Owner 
--------+---------------------+-------+-------
 public | User                | table | test
 public | Farm                | table | test
 public | Product             | table | test
 public | Order               | table | test
 public | OrderItem           | table | test
 public | CartItem            | table | test
 public | UserAddress         | table | test
 public | _prisma_migrations  | table | test
```

---

## ✅ Verification

### 1. Test Database Connection

Run the infrastructure debug test:

```bash
npm run test:integration -- __simple-db-test__
```

**Expected Result**: Tests should PASS ✅

```
PASS INTEGRATION TESTS src/__tests__/integration/__simple-db-test__.test.ts
  Simple Database Test
    ✓ should return a result from raw query (NOT undefined) (45 ms)
    ✓ should count users table (12 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

### 2. Run Full Debug Test

```bash
npm run test:integration -- __debug__
```

**Expected Result**: 13 tests PASS ✅

```
PASS INTEGRATION TESTS src/__tests__/integration/__debug__.test.ts
  Integration Test Infrastructure Debug
    Database Connection
      ✓ should connect to the database
      ✓ should have access to Prisma models
    Test Helpers
      ✓ should create a test user with real database
      ✓ should read the created user from database
      ✓ should create a test farm with real database
      ✓ should read the created farm from database
      ✓ should count records in database
      ✓ should update a record in database
      ✓ should delete records from database
    Database Operations
      ✓ should handle transactions
      ✓ should handle complex queries with includes
    Environment Verification
      ✓ should have test database URL configured
      ✓ should be running in test environment

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

---

## 🧹 Database Maintenance

### Reset Test Database

```bash
# Complete reset (drops all data and re-runs migrations)
DATABASE_URL="postgresql://test:test@localhost:5433/farmers_market_test" \
  npx prisma migrate reset --force --skip-seed
```

### Clean Test Data

```bash
# Soft clean (deletes test data, keeps schema)
npm run test:integration -- --testNamePattern="emergency cleanup"
```

### Docker Container Management

```bash
# Stop test database
docker stop farmers-market-test-db

# Start test database
docker start farmers-market-test-db

# Remove test database (loses all data)
docker rm -f farmers-market-test-db

# View logs
docker logs farmers-market-test-db
```

---

## 🐛 Troubleshooting

### Issue: "Authentication failed"

**Cause**: Incorrect credentials or user doesn't exist

**Solution**:
```bash
# Docker: Recreate container with correct credentials
docker rm -f farmers-market-test-db
docker run -d --name farmers-market-test-db \
  -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=farmers_market_test -p 5433:5432 postgres:16-alpine

# Local: Reset user password
psql -d postgres -c "ALTER USER test WITH PASSWORD 'test';"
```

### Issue: "Database does not exist"

**Cause**: Database not created

**Solution**:
```bash
# Docker: Database created automatically on first run
# Just ensure DATABASE_URL matches container port (5433)

# Local: Create database manually
createdb farmers_market_test
```

### Issue: "Port already in use"

**Cause**: Another PostgreSQL instance using port 5432/5433

**Solution**:
```bash
# Option 1: Use different port
docker run -d --name farmers-market-test-db \
  -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=farmers_market_test -p 5434:5432 postgres:16-alpine

# Update .env.test
DATABASE_URL="postgresql://test:test@localhost:5434/farmers_market_test"

# Option 2: Stop conflicting service
docker stop $(docker ps -q --filter "publish=5433")
```

### Issue: "Migration failed"

**Cause**: Schema mismatch or migration history issues

**Solution**:
```bash
# Hard reset (caution: deletes all data)
DATABASE_URL="postgresql://test:test@localhost:5433/farmers_market_test" \
  npx prisma migrate reset --force

# Then re-run migrations
DATABASE_URL="postgresql://test:test@localhost:5433/farmers_market_test" \
  npx prisma migrate deploy
```

### Issue: Tests still returning `undefined`

**Cause**: Using wrong Jest config (unit config instead of integration)

**Solution**:
```bash
# WRONG (uses mocked database)
npm run test -- integration

# CORRECT (uses real database)
npm run test:integration
```

---

## 📊 Database Connection Info

### Development Database
- **URL**: `postgresql://postgres:password@localhost:5432/farmers_market`
- **Purpose**: Local development
- **Used by**: `npm run dev`

### Test Database (Docker)
- **URL**: `postgresql://test:test@localhost:5433/farmers_market_test`
- **Purpose**: Integration testing
- **Used by**: `npm run test:integration`
- **Isolated**: ✅ Different port, separate container

### Test Database (Local)
- **URL**: `postgresql://test:test@localhost:5432/farmers_market_test`
- **Purpose**: Integration testing
- **Used by**: `npm run test:integration`
- **Isolated**: ✅ Different database name

---

## 🔐 Security Notes

### Test Database Credentials

**Default credentials** (for local testing only):
- User: `test`
- Password: `test`
- Database: `farmers_market_test`

⚠️ **NEVER use these credentials in production!**

### CI/CD Credentials

For CI/CD environments (GitHub Actions, GitLab CI, etc.):
```yaml
env:
  DATABASE_URL: "postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/ci_test_db"
```

---

## 🚀 Next Steps

Once test database is set up:

1. ✅ **Run integration tests**:
   ```bash
   npm run test:integration
   ```

2. ✅ **Generate coverage report**:
   ```bash
   npm run test:integration:coverage
   ```

3. ✅ **Watch mode for TDD**:
   ```bash
   npm run test:integration:watch
   ```

4. ✅ **Run all tests** (unit + integration):
   ```bash
   npm run test:all
   ```

---

## 📚 Related Documentation

- [Session 9 Summary](./TEST_COVERAGE_SESSION_9_SUMMARY.md) - Infrastructure fix details
- [Integration Test Helpers](../tests/helpers/integration-helpers.ts) - Test data utilities
- [Jest Integration Config](../jest.integration.config.cjs) - Test configuration
- [Prisma Schema](../prisma/schema.prisma) - Database schema

---

## 💡 Pro Tips

1. **Use Docker for isolation**: Prevents conflicts with dev database
2. **Different port (5433)**: Allows dev and test DBs to run simultaneously
3. **Auto-cleanup**: Integration test helpers track and clean up test data
4. **Reset between test runs**: Ensures clean state for each test suite
5. **Separate CI database**: Use ephemeral database in CI/CD pipelines

---

**Ready to test?** 🎯

```bash
# Complete setup in 3 commands
docker run -d --name farmers-market-test-db \
  -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=farmers_market_test -p 5433:5432 postgres:16-alpine

DATABASE_URL="postgresql://test:test@localhost:5433/farmers_market_test" \
  npx prisma migrate deploy

npm run test:integration -- __debug__
```

**Expected**: ✅ 13 tests pass, coverage ready to jump to 83-85%!

---

*Built with ❤️ by the Farmers Market Platform Team*
*Using Claude Sonnet 4.5 — Following .cursorrules Best Practices*