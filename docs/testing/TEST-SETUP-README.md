# 🧪 Test Setup - Quick Start Guide

## Status: ✅ COMPLETE & READY TO USE

This repository now includes comprehensive test setup automation for:

- ✅ **Integration Tests** (with real database)
- ✅ **GPU Performance Tests** (RTX 2070 Max-Q)
- ✅ **Automated Database Setup**
- ✅ **Cross-Platform Support** (Windows, macOS, Linux)

---

## Quick Start (3 Steps)

### Step 1: Set Up Test Database (One-Time)

Choose your platform:

```bash
# Option A: Automated TypeScript Script (Recommended - All Platforms)
npm run db:test:setup

# Option B: Unix/macOS/Linux Shell Script
bash scripts/setup-test-db.sh

# Option C: Windows Batch Script
scripts\setup-test-db.bat
```

**What it does:**

- Creates PostgreSQL test database
- Pushes Prisma schema
- Generates Prisma Client
- Seeds test data
- Creates `.env.test` configuration

### Step 2: Run Integration Tests

```bash
npm run test:integration
```

### Step 3: Run GPU Tests (Optional - Requires NVIDIA GPU)

```bash
npm run test:gpu
```

---

## All Test Commands

```bash
# Unit Tests (No Setup Required)
npm test                     # Run all unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report

# Integration Tests (Requires Test Database)
npm run db:test:setup       # Setup test database (one-time)
npm run test:integration    # Run integration tests

# GPU Tests (Requires NVIDIA GPU)
npm run test:gpu            # Run GPU benchmarks
npm run test:gpu:watch      # GPU tests in watch mode

# E2E Tests
npm run test:e2e            # Run Playwright E2E tests

# HP OMEN Optimized (12 threads, 64GB RAM)
npm run test:omen           # Unit tests optimized
npm run test:all:omen       # All tests optimized
```

---

## What Was Added

### 1. NPM Scripts

- `test:integration` - Run integration tests with real database
- `test:gpu` - Run GPU performance benchmarks
- `test:gpu:watch` - GPU tests in watch mode
- `db:test:setup` - Automated test database setup

### 2. Setup Scripts

- `scripts/setup-test-db.ts` - TypeScript setup script (cross-platform)
- `scripts/setup-test-db.sh` - Unix/macOS/Linux shell script
- `scripts/setup-test-db.bat` - Windows batch script

### 3. Documentation

- `docs/TESTING.md` - Comprehensive testing guide (updated)
- `docs/TEST-SETUP-GUIDE.md` - Quick reference with commands
- `docs/TEST-SETUP-IMPLEMENTATION.md` - Implementation details

### 4. Test Configuration

- Integration tests skip automatically when DB not configured
- GPU tests skip by default (no GPU in CI)
- Clear error messages and troubleshooting

---

## Prerequisites

### For Integration Tests

- PostgreSQL 12+ installed and running
- Node.js 20+ and npm 10+
- ~100MB disk space for test database

### For GPU Tests

- NVIDIA GPU (RTX 2070 Max-Q or compatible)
- CUDA drivers installed
- Test fixtures in `tests/fixtures/`

---

## Environment Variables

The setup script creates `.env.test` automatically with:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"
NODE_ENV="test"
SKIP_INTEGRATION_TESTS="false"
NEXTAUTH_SECRET="divine-test-secret-for-quantum-authentication"
# ... and more
```

### Custom Database Configuration

Set before running setup:

```bash
export TEST_DB_HOST="localhost"
export TEST_DB_PORT="5432"
export TEST_DB_NAME="farmersmarket_test"
export TEST_DB_USER="postgres"
export TEST_DB_PASSWORD="postgres"
```

---

## Troubleshooting

### Database Connection Failed

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

### Database Does Not Exist

```bash
# Run setup script again
npm run db:test:setup

# Or create manually
createdb farmersmarket_test
```

### Schema Out of Sync

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"
npx prisma db push
npx prisma generate
```

### GPU Not Available

```bash
# Check GPU status
nvidia-smi

# Check CUDA drivers
nvcc --version

# GPU tests will skip automatically if no GPU found
```

---

## Test Execution Matrix

| Test Type         | Command                    | DB Required | GPU Required | Duration | CI  |
| ----------------- | -------------------------- | ----------- | ------------ | -------- | --- |
| Unit Tests        | `npm test`                 | ❌          | ❌           | ~30s     | ✅  |
| Integration Tests | `npm run test:integration` | ✅          | ❌           | ~2-5min  | ❌  |
| GPU Tests         | `npm run test:gpu`         | ❌          | ✅           | ~1-3min  | ❌  |
| E2E Tests         | `npm run test:e2e`         | ❌          | ❌           | ~5-10min | ✅  |

---

## What Gets Created

When you run `npm run db:test:setup`:

1. ✅ PostgreSQL database: `farmersmarket_test`
2. ✅ Prisma schema pushed to database
3. ✅ Prisma Client generated
4. ✅ Test data seeded (optional)
5. ✅ `.env.test` configuration file

---

## File Structure

```
Farmers Market Platform web and app/
├── scripts/
│   ├── setup-test-db.ts          # TypeScript setup (recommended)
│   ├── setup-test-db.sh          # Unix/macOS/Linux setup
│   └── setup-test-db.bat         # Windows setup
├── docs/
│   ├── TESTING.md                # Comprehensive guide
│   ├── TEST-SETUP-GUIDE.md       # Quick reference
│   └── TEST-SETUP-IMPLEMENTATION.md  # Implementation details
├── src/__tests__/
│   └── integration/
│       └── order-workflow.integration.test.ts  # Integration tests
├── tests/
│   └── performance/
│       └── gpu-benchmark.test.ts # GPU performance tests
├── .env.test                     # Generated by setup script
└── TEST-SETUP-README.md         # This file
```

---

## CI/CD Behavior

### Current CI Pipeline (GitHub Actions)

- ✅ Unit tests run (mocked database)
- ✅ E2E tests run (Playwright)
- ⏭️ Integration tests skip (no database)
- ⏭️ GPU tests skip (no GPU)

This is intentional! Integration and GPU tests are for local development and require specific infrastructure.

---

## Integration Test Coverage

Current integration tests verify:

- ✅ Complete order workflow (create → pay → ship → deliver)
- ✅ Inventory management and reservations
- ✅ Multi-service coordination (Order, Payment, Shipping, Product)
- ✅ Database transaction handling
- ✅ Error recovery and rollback

**Total**: ~5 integration tests covering end-to-end workflows

---

## GPU Test Coverage

GPU tests validate:

- ✅ Image processing speed (< 100ms target)
- ✅ Batch processing throughput
- ✅ ML model training on GPU
- ✅ Inference latency (< 50ms target)
- ✅ VRAM usage and memory leak detection
- ✅ RTX 2070 Max-Q optimization

**Total**: ~8 GPU tests covering hardware acceleration

---

## Performance Optimization

### HP OMEN Hardware (64GB RAM, 12 threads)

```bash
# Optimized test runs
npm run test:omen           # 10 workers, 16GB memory
npm run test:e2e:omen       # 10 parallel browsers
npm run test:all:omen       # Full suite optimized
```

### Why Serial Execution?

- Integration tests use `--runInBand` to prevent database connection pool exhaustion
- GPU tests use `--runInBand` to avoid GPU resource contention
- Unit tests run in parallel with 10 workers

---

## Development Workflow

### Daily Development

```bash
npm run test:watch          # Unit tests in watch mode
npm run test:integration    # Verify database changes
```

### Before Commit

```bash
npm run quality            # Type-check + lint + format
npm test                   # Unit tests
npm run test:integration   # Integration tests
```

### Before Deploy

```bash
npm run test:coverage      # Full coverage report
npm run test:e2e          # E2E tests
npm run test:integration   # Integration tests
```

---

## Need Help?

### Documentation

- **Comprehensive Guide**: [docs/TESTING.md](./docs/TESTING.md)
- **Quick Reference**: [docs/TEST-SETUP-GUIDE.md](./docs/TEST-SETUP-GUIDE.md)
- **Implementation Details**: [docs/TEST-SETUP-IMPLEMENTATION.md](./docs/TEST-SETUP-IMPLEMENTATION.md)

### External Resources

- [Jest Documentation](https://jestjs.io/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [TensorFlow.js GPU Guide](https://www.tensorflow.org/js/guide/platform_environment)
- [Playwright Documentation](https://playwright.dev/)

---

## Success Metrics

All requirements met:

- ✅ Test database setup automated
- ✅ Integration tests conditional (skip when DB not available)
- ✅ GPU tests local-only (skip by default)
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ Comprehensive documentation
- ✅ Clear error messages
- ✅ Quick reference guides
- ✅ Environment configuration automated

---

## Summary

**You can now:**

1. ✅ Set up test database with one command: `npm run db:test:setup`
2. ✅ Run integration tests: `npm run test:integration`
3. ✅ Run GPU tests: `npm run test:gpu`
4. ✅ Access comprehensive documentation in `docs/` folder
5. ✅ Troubleshoot issues with detailed guides

**Status**: 🚀 **FULLY OPERATIONAL AND READY FOR USE**

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Platform**: Farmers Market Platform - Divine Agricultural E-Commerce  
**Test Framework**: Jest + Prisma + TensorFlow.js
