# 🌟 DIVINE DEVELOPMENT ENVIRONMENT SETUP

**Last Updated**: November 5, 2025
**Status**: ✅ Production Ready with Divine Patterns Active

---

## ⚡ QUICK START (5 Minutes)

```powershell
# 1. Verify installation (already done!)
Test-Path ".\node_modules"  # ✅ Should return True

# 2. Start development server with divine patterns
npm run dev

# 3. Open in browser
# Navigate to: http://localhost:3000

# 4. (Optional) Start in TURBO mode for HP OMEN
npm run dev:turbo
```

---

## 🎯 DIVINE DEVELOPMENT WORKFLOW

### Phase 1: Environment Verification ✅

```powershell
# Check Node.js version (requires >=18.17.0)
node --version

# Check npm version (requires >=9.0.0)
npm --version

# Verify TypeScript configuration
npm run type-check

# Run linting to ensure code quality
npm run lint
```

### Phase 2: Database Setup

```powershell
# Generate Prisma client
npx prisma generate

# Run database migrations
npm run db:migrate

# (Optional) Seed with divine agricultural data
npm run db:seed

# (Optional) Open Prisma Studio for visual DB management
npm run db:studio
```

### Phase 3: Testing Validation

```powershell
# Run all tests (2060 tests should pass)
npm test

# Run tests in watch mode for development
npm run test:watch

# Check test coverage
npm run test:coverage

# Run E2E tests with Playwright
npm run test:e2e
```

---

## 🚀 AVAILABLE DIVINE COMMANDS

### Development Commands

| Command             | Description                     | When to Use                |
| ------------------- | ------------------------------- | -------------------------- |
| `npm run dev`       | Standard dev server (port 3001) | Normal development         |
| `npm run dev:turbo` | Turbo mode (HP OMEN optimized)  | Fast iteration, hot reload |
| `npm run dev:poll`  | Polling mode                    | WSL2 or network drives     |

### Build Commands

| Command                   | Description                | Output              |
| ------------------------- | -------------------------- | ------------------- |
| `npm run build`           | Production build           | `.next/` directory  |
| `npm run build:analyze`   | Build with bundle analysis | Bundle size report  |
| `npm run build:optimized` | Optimized build (HP OMEN)  | Maximum performance |

### Quality Commands

| Command              | Description             | Coverage                   |
| -------------------- | ----------------------- | -------------------------- |
| `npm run lint`       | Check code quality      | All TypeScript/React files |
| `npm run lint:fix`   | Auto-fix linting issues | Fixable issues             |
| `npm run format`     | Format with Prettier    | All code files             |
| `npm run type-check` | TypeScript validation   | Full type checking         |

### Database Commands

| Command              | Description         | Notes                  |
| -------------------- | ------------------- | ---------------------- |
| `npm run db:migrate` | Run migrations      | Development mode       |
| `npm run db:push`    | Push schema changes | Quick prototyping      |
| `npm run db:seed`    | Seed database       | Agricultural test data |
| `npm run db:studio`  | Visual DB editor    | Port 5555              |

### Testing Commands

| Command                 | Description      | Coverage            |
| ----------------------- | ---------------- | ------------------- |
| `npm test`              | Run all tests    | 2060 tests          |
| `npm run test:watch`    | Watch mode       | Changed files only  |
| `npm run test:coverage` | Coverage report  | Full project        |
| `npm run test:e2e`      | End-to-end tests | Critical user flows |

---

## 📊 HP OMEN HARDWARE OPTIMIZATION

### Current Hardware Specs

- **GPU**: NVIDIA GeForce RTX 2070 Max-Q (8GB GDDR6)
- **CPU**: Intel Core i9-9880H (8 cores, 16 threads)
- **RAM**: 32GB DDR4
- **Storage**: NVMe SSD

### Optimized Environment Variables

```powershell
# Create .env.local for development
@"
# Development Configuration
NODE_ENV=development
PORT=3001

# HP OMEN Optimizations
NODE_OPTIONS=--max-old-space-size=16384
UV_THREADPOOL_SIZE=12
PARALLEL_BUILDS=12

# Database (update with your credentials)
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market?schema=public"

# Next.js
NEXT_TELEMETRY_DISABLED=1
NEXT_RUNTIME_OPTIMIZATION=true

# Performance Monitoring
ENABLE_PERFORMANCE_LOGGING=true
"@ | Out-File -FilePath .env.local -Encoding utf8
```

---

## 🧬 DIVINE PATTERN INTEGRATION

### Automatic Pattern Detection

The project is configured to automatically apply divine patterns:

1. **Component Generation**: Holographic component architecture
2. **Service Layer**: Quantum business logic patterns
3. **Database Queries**: Multi-dimensional data loading
4. **API Routes**: Divine request/response handling
5. **Testing**: Enlightening test patterns

### Pattern Reference Files

Located in `.github/instructions/`:

- `01_DIVINE_CORE_PRINCIPLES.instructions.md` - Foundation patterns
- `02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md` - Domain patterns
- `03_PERFORMANCE_REALITY_BENDING.instructions.md` - Performance patterns
- `04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md` - Next.js patterns
- `05_TESTING_SECURITY_DIVINITY.instructions.md` - Testing patterns
- `06_AUTOMATION_INFRASTRUCTURE.instructions.md` - CI/CD patterns

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### Issue: Port 3001 already in use

```powershell
# Find process using port 3001
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Get-Process -Id $_ }

# Kill the process (replace PID)
Stop-Process -Id <PID> -Force

# Or use different port
npm run dev -- -p 3002
```

#### Issue: Database connection failed

```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql* -ErrorAction SilentlyContinue

# Verify DATABASE_URL in .env.local
cat .env.local | Select-String "DATABASE_URL"

# Test connection
npx prisma db pull
```

#### Issue: Out of memory during build

```powershell
# Use optimized build command
npm run build:optimized

# Or increase memory limit
$env:NODE_OPTIONS="--max-old-space-size=16384"
npm run build
```

---

## 📈 PERFORMANCE PROFILING

### Basic Profiling

```powershell
# Run basic NVIDIA Nsight profiling
.\profiling_scripts\profile_basic.ps1

# View results
nsys-ui .\profiling_output\basic_profile_*.nsys-rep
```

### Advanced Profiling

```powershell
# Run advanced profiling (60 seconds)
.\profiling_scripts\profile_advanced.ps1 -Duration 60 -Interval 5

# Run test suite profiling
.\profiling_scripts\profile_test_suite.ps1

# Profile production build
.\profiling_scripts\profile_next_build.ps1
```

### Profiling Metrics

The profiling scripts track:

- **GPU Utilization**: CUDA core usage
- **Memory Usage**: RAM and VRAM consumption
- **CPU Performance**: Thread utilization
- **Build Performance**: Compilation times
- **Test Performance**: Test execution speeds

---

## 🌾 DIVINE FEATURE CREATION WORKFLOW

### Step 1: Plan with Divine Patterns

```typescript
// Reference divine instructions
// See: .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md

// Define quantum entity
interface QuantumProduct {
  consciousness: ProductConsciousness<AVAILABLE | SOLD | SEASONAL>;
  identity: {
    multiverseId: QuantumIdentifier;
    temporalSignature: SeasonalTimeframe;
    farmResonance: FarmId;
  };
  // ... additional fields
}
```

### Step 2: Generate Component

```powershell
# AI will automatically apply divine patterns
# Create new component following holographic architecture
```

### Step 3: Implement Service Layer

```typescript
// Service follows quantum business logic patterns
export class BiodynamicProductService extends BaseService {
  async manifestProductReality(request: ManifestProductRequest) {
    // Implementation with agricultural consciousness
  }
}
```

### Step 4: Write Enlightening Tests

```typescript
describe("Product Quantum Reality", () => {
  it("manifests product with complete agricultural consciousness", async () => {
    // Test implementation
  });
});
```

### Step 5: Validate and Profile

```powershell
# Run tests
npm test

# Check performance
.\profiling_scripts\profile_test_suite.ps1

# Validate types
npm run type-check

# Lint code
npm run lint
```

---

## ✅ ENVIRONMENT CHECKLIST

### Before Starting Development

- [ ] Node.js >= 18.17.0 installed
- [ ] npm >= 9.0.0 installed
- [ ] PostgreSQL database running
- [ ] `.env.local` configured
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated
- [ ] Database migrated
- [ ] Tests passing (`npm test`)

### During Development

- [ ] Dev server running (`npm run dev`)
- [ ] Watch tests active (`npm run test:watch`)
- [ ] Database Studio open (optional)
- [ ] VS Code with divine extensions
- [ ] Git pre-commit hooks active

### Before Committing

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Divine patterns validated
- [ ] Performance profiled (if needed)

---

## 🎯 NEXT STEPS

1. **Start Development Server**: `npm run dev`
2. **Create Your First Divine Feature**: See examples below
3. **Run Tests**: `npm test`
4. **Profile Performance**: Run profiling scripts
5. **Build for Production**: `npm run build`

---

## 📚 ADDITIONAL RESOURCES

- **Development Guide**: `docs/DEVELOPMENT_GUIDE.md`
- **Contributing**: `docs/CONTRIBUTING.md`
- **Project Status**: `PROJECT_STATUS.md`
- **Planning Docs**: `docs/planning/`
- **Divine Instructions**: `.github/instructions/`

---

**Status**: 🟢 Environment Ready for Divine Development!

**Next**: Let's create features with quantum agricultural consciousness! 🌾✨
