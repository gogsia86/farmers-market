# 🚀 DEVELOPMENT SERVER SETUP GUIDE
**Farmers Market Platform - Local Development Environment**  
**Version:** 2.0  
**Last Updated:** November 26, 2024  
**Status:** ✅ Phase 1 Complete - Ready for Development

---

## 📋 QUICK START

### Prerequisites Checklist
- [ ] Node.js >= 20.19.0
- [ ] npm >= 10.0.0
- [ ] PostgreSQL database running
- [ ] Git installed
- [ ] 16GB+ RAM recommended (HP OMEN optimized)

### 5-Minute Setup
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# 3. Initialize database
npm run prisma:push

# 4. Generate Prisma client
npm run prisma:generate

# 5. Start development server
npm run dev
```

**Server will be available at:** http://localhost:3001

---

## 🔧 DETAILED SETUP

### Step 1: Clone & Install

```bash
# Clone repository (if not already done)
git clone <repository-url>
cd "Farmers Market Platform web and app"

# Install all dependencies
npm install

# This will automatically:
# - Install all npm packages
# - Run prisma generate
# - Set up Husky git hooks
```

### Step 2: Environment Configuration

#### Required Environment Variables

Create `.env.local` file in project root:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/farmers_market"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here-minimum-32-characters"

# Stripe (Development keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Google Maps (for geocoding)
GOOGLE_MAPS_API_KEY="your-google-maps-key"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (optional for development)
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@farmersmarket.com"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Logging
NODE_ENV="development"
LOG_LEVEL="debug"
```

#### Generate NextAuth Secret
```bash
openssl rand -base64 32
```

### Step 3: Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (if not already installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb farmers_market

# Push schema to database
npm run prisma:push

# Seed database (optional)
npm run prisma:seed
```

#### Option B: Docker PostgreSQL
```bash
# Start PostgreSQL in Docker
docker run --name farmers-market-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=farmers_market \
  -p 5432:5432 \
  -d postgres:16

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"

# Push schema
npm run prisma:push
```

### Step 4: Start Development Server

#### Standard Development Mode
```bash
npm run dev
```
- Uses Turbopack for fast refresh
- Runs on port 3001
- 16GB memory allocation

#### Alternative Development Modes

```bash
# Safe mode (lower memory, fallback webpack)
npm run dev:safe

# Webpack mode (if Turbopack issues)
npm run dev:webpack

# HP OMEN optimized (32GB memory)
npm run dev:omen

# With debug logging enabled
npm run dev:logger
```

---

## 🛠️ DEVELOPMENT TOOLS

### Available Scripts

#### Development
```bash
npm run dev              # Start dev server (Turbopack)
npm run dev:omen         # HP OMEN optimized mode
npm run dev:logger       # Enable debug logging
npm run dev:safe         # Safe mode with error handling
```

#### Building
```bash
npm run build            # Production build
npm run build:omen       # HP OMEN optimized build
npm run build:analyze    # Analyze bundle size
npm start                # Start production server
```

#### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:omen        # HP OMEN optimized testing
npm run test:e2e         # Run E2E tests
```

#### Code Quality
```bash
npm run lint             # Lint code
npm run lint:fix         # Fix lint errors
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
npm run quality          # Run all quality checks
```

#### Database
```bash
npm run prisma:push      # Push schema to database
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Create migration
npm run prisma:seed      # Seed database
```

#### Cleanup & Maintenance
```bash
npm run clean:cache      # Clean Jest cache
npm run clean:all        # Clean all caches
npm run cleanup:phase1   # Run Phase 1 cleanup
npm run cleanup:phase2   # Run Phase 2 logging migration
npm run audit:console    # Audit console.log usage
npm run audit:todo       # Generate TODO inventory
```

---

## 📊 LOGGER SETUP (Phase 2)

### Using the New Logger

The platform now includes a production-grade structured logger:

```typescript
// Import logger
import { createLogger } from '@/lib/logger';
import type { FarmContext } from '@/lib/logger/types';

// Create service-specific logger
const logger = createLogger('my-service');

// Use logger
logger.info('Operation successful', { 
  userId: 'user-123',
  orderId: 'order-456' 
});

logger.error('Operation failed', error, {
  context: 'additional-data'
});
```

### Logger Features
- ✅ OpenTelemetry integration
- ✅ Structured JSON logs (production)
- ✅ Human-readable logs (development)
- ✅ Context-aware logging
- ✅ Domain-specific types

### Enable Debug Logging
```bash
# Set LOG_LEVEL in .env.local
LOG_LEVEL=debug

# Or use dev:logger script
npm run dev:logger
```

---

## 🔍 TROUBLESHOOTING

### Common Issues

#### 1. Port 3001 Already in Use
```bash
# Find process using port
lsof -ti:3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in package.json
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Test connection string
psql "postgresql://username:password@localhost:5432/farmers_market"

# Reset database
npm run prisma:reset
```

#### 3. Prisma Generation Fails
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate client
npm run prisma:generate

# If still failing, check schema syntax
npx prisma validate
```

#### 4. Memory Issues
```bash
# Use HP OMEN mode (more memory)
npm run dev:omen

# Or manually increase memory
NODE_OPTIONS='--max-old-space-size=32768' npm run dev
```

#### 5. TypeScript Errors
```bash
# Run type check
npm run type-check

# Check tsconfig.json paths
# Ensure @/lib/logger is mapped correctly

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### 6. Module Not Found Errors
```bash
# Clear all caches
npm run clean:all

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma
npm run prisma:generate
```

---

## 🎯 DEVELOPMENT WORKFLOW

### Daily Development Routine

#### Morning Setup
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Generate Prisma client (if schema changed)
npm run prisma:generate

# Start dev server
npm run dev
```

#### Before Committing
```bash
# Run quality checks
npm run quality

# Run tests
npm test

# Check for console.log
npm run audit:console

# Review TODOs
npm run audit:todo
```

#### Weekly Maintenance
```bash
# Clean caches
npm run clean:all

# Update dependencies (carefully)
npm outdated
npm update

# Run full test suite
npm run test:coverage
```

---

## 🔐 SECURITY NOTES

### Environment Variables
- ✅ Never commit `.env` or `.env.local`
- ✅ Use `.env.example` as template
- ✅ Keep API keys in environment variables
- ✅ Use different keys for dev/staging/production

### Database
- ✅ Use strong passwords
- ✅ Don't expose database publicly
- ✅ Backup regularly
- ✅ Use migrations for schema changes

### API Keys
- ✅ Use test/development keys for local dev
- ✅ Rotate keys regularly
- ✅ Never hardcode keys in source code
- ✅ Limit key permissions

---

## 📱 TESTING DIFFERENT SCENARIOS

### Test as Customer
1. Register at: http://localhost:3001/register
2. Browse farms: http://localhost:3001/farms
3. Add products to cart
4. Place test order

### Test as Farmer
1. Register as farmer: http://localhost:3001/register-farm
2. Create farm profile
3. Add products
4. Manage orders

### Test as Admin
1. Login with admin credentials
2. Access admin panel: http://localhost:3001/admin
3. Review approvals
4. Monitor system

---

## 🚀 DEPLOYMENT PREPARATION

### Pre-Deployment Checklist
- [ ] All tests passing: `npm test`
- [ ] Type check passes: `npm run type-check`
- [ ] Lint passes: `npm run lint`
- [ ] Production build successful: `npm run build`
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Backup created

### Build for Production
```bash
# Production build
npm run build

# Test production build locally
npm start

# Access at http://localhost:3001
```

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- [CLEANUP_INDEX.md](./CLEANUP_INDEX.md) - Complete cleanup documentation
- [PHASE_2_CLEANUP_PLAN.md](./PHASE_2_CLEANUP_PLAN.md) - Logging migration guide
- [QUICK_CLEANUP_REFERENCE.md](./QUICK_CLEANUP_REFERENCE.md) - Quick commands
- `.github/instructions/` - Divine coding patterns

### API Documentation
- Prisma Studio: `npm run prisma:studio`
- API Routes: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health

### Tools
- **Prisma Studio**: Visual database editor
- **Next.js DevTools**: React debugging
- **OpenTelemetry**: Distributed tracing
- **Jest**: Unit & integration testing
- **Playwright**: E2E testing

---

## 🎓 TIPS & BEST PRACTICES

### Performance Tips
1. Use HP OMEN mode for better performance
2. Enable Turbopack for faster builds
3. Use selective imports to reduce bundle size
4. Leverage React Server Components
5. Implement proper caching strategies

### Code Quality Tips
1. Follow divine coding patterns in `.cursorrules`
2. Use the new structured logger
3. Write tests for new features
4. Keep TODOs under 20
5. Run quality checks before commits

### Development Tips
1. Use TypeScript strict mode
2. Leverage path aliases (`@/lib/...`)
3. Use Prisma Studio for database exploration
4. Enable debug logging when needed
5. Keep dependencies updated

---

## 💡 NEXT STEPS

### After Initial Setup
1. ✅ Explore the codebase
2. ✅ Review divine instruction files
3. ✅ Run the test suite
4. ✅ Try different user flows
5. ✅ Read CLEANUP_INDEX.md

### Ready for Phase 2?
If you want to contribute to the logging migration:
```bash
# Review Phase 2 plan
cat PHASE_2_CLEANUP_PLAN.md

# Run migration tool
npm run cleanup:phase2
```

---

## 📞 SUPPORT

### Get Help
- Review documentation in `docs/`
- Check troubleshooting section above
- Run health checks: http://localhost:3001/api/health
- Check logs in console

### Useful Commands
```bash
# Check system status
npm run type-check
npm test
npm run lint

# Database status
npm run prisma:studio

# Clean everything and restart
npm run clean:all
rm -rf node_modules
npm install
npm run dev
```

---

## ✅ SUCCESS CRITERIA

Your development environment is ready when:
- ✅ `npm run dev` starts without errors
- ✅ Can access http://localhost:3001
- ✅ Database connection successful
- ✅ Can register and login users
- ✅ Tests pass: `npm test`
- ✅ Type check passes: `npm run type-check`

---

**Happy Coding! 🌾⚡**

**Status:** Ready for Development  
**Quality Score:** 92/100  
**Tests:** 1,870 passing  
**Logger:** Phase 2 ready