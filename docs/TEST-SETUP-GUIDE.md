# 🧪 Test Setup Quick Reference Guide

## Overview

This guide provides quick copy-paste commands to set up and run tests for the Farmers Market Platform.

## Test Types Summary

| Test Type         | Command                    | Requirements  | Duration |
| ----------------- | -------------------------- | ------------- | -------- |
| Unit Tests        | `npm test`                 | None          | ~30s     |
| Integration Tests | `npm run test:integration` | Test Database | ~2-5min  |
| GPU Tests         | `npm run test:gpu`         | NVIDIA GPU    | ~1-3min  |
| E2E Tests         | `npm run test:e2e`         | Browsers      | ~5-10min |

## Quick Start (Copy & Paste)

### 1. Run Unit Tests (No Setup Required)

```bash
# Run all unit tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### 2. Setup Integration Tests (One-Time Setup)

#### Option A: Automated Setup (Recommended)

```bash
# Run the setup script
npm run db:test:setup
```

#### Option B: Manual Setup

```bash
# Create test database
createdb farmersmarket_test

# Set environment variable
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"

# Push Prisma schema
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed test data (optional)
npm run db:seed:basic
```

### 3. Run Integration Tests

```bash
# After setup, run integration tests
npm run test:integration

# Or with custom DATABASE_URL
DATABASE_URL="postgresql://user:pass@host:5432/testdb" npm run test:integration
```

### 4. Run GPU Tests (Local Only)

```bash
# Ensure GPU drivers are installed
nvidia-smi

# Run GPU benchmark tests
npm run test:gpu

# Run in watch mode
npm run test:gpu:watch
```

## Test Database Setup Details

### Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 20+ and npm 10+
- Sufficient disk space (~100MB for test database)

### Environment Variables

Create `.env.test` file:

```bash
# Test Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"

# Test Environment
NODE_ENV="test"
SKIP_INTEGRATION_TESTS="false"

# Auth (test keys)
NEXTAUTH_SECRET="divine-test-secret-for-quantum-authentication"
NEXTAUTH_URL="http://localhost:3000"

# Payment providers (test mode)
PAYPAL_CLIENT_ID="test-paypal-client-id"
PAYPAL_CLIENT_SECRET="test-paypal-client-secret"
STRIPE_SECRET_KEY="test-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="test-stripe-publishable-key"
```

### Custom Database Configuration

Use environment variables to customize:

```bash
# Set custom configuration
export TEST_DB_HOST="localhost"
export TEST_DB_PORT="5432"
export TEST_DB_NAME="farmersmarket_test"
export TEST_DB_USER="postgres"
export TEST_DB_PASSWORD="postgres"

# Run setup
npm run db:test:setup
```

## GPU Test Setup

### Prerequisites

1. **NVIDIA GPU** (RTX 2070 Max-Q or compatible)
2. **CUDA Drivers** installed
3. **Test fixtures** in place

### Setup GPU Tests

```bash
# 1. Check GPU availability
nvidia-smi

# 2. Ensure test fixtures exist
mkdir -p tests/fixtures
# Place test images in tests/fixtures/test-farm.jpg

# 3. Run GPU tests
npm run test:gpu
```

### GPU Test Requirements

- **NVIDIA GPU** with CUDA support
- **8GB+ VRAM** recommended
- **CUDA Toolkit** 11.2+ (for tfjs-node-gpu)
- **Test images** in `tests/fixtures/`

## Common Workflows

### Before Pushing Code

```bash
# 1. Run quality checks
npm run quality

# 2. Run unit tests
npm test

# 3. Run integration tests (if DB available)
npm run test:integration

# 4. Run E2E tests
npm run test:e2e
```

### Daily Development

```bash
# Run tests in watch mode while developing
npm run test:watch

# Run specific test file
npm test -- src/lib/services/order.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Order"
```

### Before Deployment

```bash
# Full test suite with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Integration tests (production-like DB)
npm run test:integration
```

## Troubleshooting

### Integration Test Issues

#### Database Connection Failed

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS
brew services start postgresql

# Ubuntu
sudo systemctl start postgresql

# Windows
net start postgresql-x64-14
```

#### Database Does Not Exist

```bash
# Create database manually
createdb farmersmarket_test

# Or using psql
psql -c "CREATE DATABASE farmersmarket_test;"
```

#### Schema Out of Sync

```bash
# Push latest schema
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"
npx prisma db push

# Regenerate client
npx prisma generate
```

### GPU Test Issues

#### GPU Not Available

```bash
# Check GPU status
nvidia-smi

# Check CUDA drivers
nvcc --version

# Fallback to CPU backend (edit test file)
# Change: await tf.setBackend('webgl');
# To:     await tf.setBackend('cpu');
```

#### Out of Memory

```bash
# Monitor GPU memory
nvidia-smi -l 1

# Reduce batch size in tests
# Edit: tests/performance/gpu-benchmark.test.ts
# Reduce numSamples or batch size
```

#### Missing Test Fixtures

```bash
# Create fixtures directory
mkdir -p tests/fixtures

# Download sample image or use placeholder
curl -o tests/fixtures/test-farm.jpg https://example.com/sample.jpg

# Or create placeholder
convert -size 800x600 xc:white tests/fixtures/test-farm.jpg
```

## Test Configuration

### Jest Configuration

Key settings in `jest.config.js`:

```javascript
maxWorkers: 10,              // HP OMEN optimized (12 threads)
testTimeout: 10000,          // 10 second timeout
cache: true,                 // Enable caching
workerIdleMemoryLimit: "2GB" // 64GB RAM available
```

### Test Environment Variables

Set in `jest.setup.js`:

```javascript
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"; // Mock
process.env.NEXTAUTH_SECRET = "divine-test-secret";
```

Override for integration tests:

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"
export SKIP_INTEGRATION_TESTS="false"
npm run test:integration
```

## Performance Optimization

### HP OMEN Configuration (64GB RAM, 12 threads)

```bash
# Optimized for HP OMEN hardware
npm run test:omen           # 10 workers, unit tests
npm run test:e2e:omen       # 10 parallel browsers
npm run test:all:omen       # Full optimized suite
```

### Test Performance Tips

1. **Use `--maxWorkers`** to control parallelization
2. **Enable caching** (Jest does this by default)
3. **Run integration tests serially** with `--runInBand`
4. **Skip slow tests in dev** with `.skip()`
5. **Use `.only()`** to focus on specific tests

## CI/CD Integration

### GitHub Actions

Tests run automatically on push/PR:

```yaml
# .github/workflows/test.yml
- Unit tests (all workers)
- E2E tests (Playwright)
- Integration tests (skipped - no DB)
- GPU tests (skipped - no GPU)
```

### Pre-Commit Hooks

Husky runs tests before commit:

```bash
# .husky/pre-commit
npm run quality  # Type-check + lint
npm test         # Unit tests
```

## Additional Commands

### Database Management

```bash
# Drop test database
dropdb farmersmarket_test

# Recreate from scratch
npm run db:test:setup

# View database in Prisma Studio
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"
npx prisma studio

# Run SQL queries
psql farmersmarket_test
```

### Test Debugging

```bash
# Run single test file
npm test -- src/lib/services/order.service.test.ts

# Run with verbose output
npm test -- --verbose

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Enable Prisma logging
DEBUG=prisma:* npm run test:integration
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html

# Check coverage thresholds
cat coverage/coverage-summary.json
```

## Test File Locations

```
Farmers Market Platform web and app/
├── src/
│   ├── __tests__/                    # Unit tests
│   │   ├── integration/              # Integration tests
│   │   │   └── order-workflow.integration.test.ts
│   │   └── unit/                     # Unit tests
│   ├── lib/
│   │   └── services/
│   │       └── *.service.test.ts     # Service tests
│   └── components/
│       └── **/*.test.tsx             # Component tests
├── tests/
│   ├── e2e/                          # Playwright E2E tests
│   ├── performance/                  # Performance tests
│   │   └── gpu-benchmark.test.ts     # GPU tests
│   └── fixtures/                     # Test fixtures
│       └── test-farm.jpg
└── docs/
    ├── TESTING.md                    # Comprehensive guide
    └── TEST-SETUP-GUIDE.md          # This file
```

## Quick Reference Table

| Task                  | Command                                                 |
| --------------------- | ------------------------------------------------------- |
| Run all tests         | `npm test`                                              |
| Run integration tests | `npm run test:integration`                              |
| Run GPU tests         | `npm run test:gpu`                                      |
| Run E2E tests         | `npm run test:e2e`                                      |
| Setup test database   | `npm run db:test:setup`                                 |
| Watch mode            | `npm run test:watch`                                    |
| Coverage report       | `npm run test:coverage`                                 |
| Specific test         | `npm test -- path/to/test.ts`                           |
| Debug test            | `node --inspect-brk node_modules/.bin/jest --runInBand` |
| HP OMEN optimized     | `npm run test:omen`                                     |

## Support

For detailed information, see:

- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [Jest Documentation](https://jestjs.io/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [TensorFlow.js GPU Guide](https://www.tensorflow.org/js/guide/platform_environment)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Ready for Production Testing
