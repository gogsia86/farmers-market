# 🌾 Farmers Market Platform - Quick Reference Card

**Last Updated:** January 2025  
**Version:** 1.1.0  
**Status:** Pre-Production (85% Complete)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Set up database
npm run db:migrate
npm run db:seed

# 4. Start development
npm run dev
# → http://localhost:3001
```

---

## 📋 Essential Commands

### Development
```bash
npm run dev              # Start dev server (Turbo + custom server)
npm run dev:next         # Start dev server (Turbo only)
npm run dev:webpack      # Start dev server (Webpack)
npm run build            # Build for production
npm start                # Start production server
npm run kill-server      # Kill stuck dev server
```

### Code Quality
```bash
npm run lint             # Check code with ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking
npm run quality          # Run all checks (type + lint + format)
```

### Testing
```bash
npm test                 # Run all unit tests (Jest)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:a11y        # Run accessibility tests
```

### Database
```bash
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes (dev only)
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (⚠️ deletes all data)
npm run db:studio        # Open Prisma Studio GUI
npm run db:validate      # Validate Prisma schema
```

### Docker
```bash
npm run docker:build     # Build Docker image
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View container logs
npm run docker:clean     # Clean up containers & volumes
```

### Deployment
```bash
npm run vercel-build     # Build for Vercel
vercel                   # Deploy preview
vercel --prod            # Deploy to production
npm run deploy:phase3:1  # Phase 3 deployment (step 1)
```

---

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin portal routes
│   ├── (farmer)/          # Farmer portal routes
│   ├── (customer)/        # Customer portal routes
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── farms/         # Farm management
│   │   ├── products/      # Product catalog
│   │   ├── orders/        # Order processing
│   │   └── payments/      # Payment processing
│   └── actions/           # Server Actions
├── lib/                    # Core business logic
│   ├── services/          # Service layer (business logic)
│   ├── repositories/      # Data access layer
│   ├── database/          # Database client & utilities
│   ├── auth/              # Authentication config
│   ├── cache/             # Multi-layer caching
│   ├── validation/        # Input validation
│   └── utils/             # Utility functions
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── features/         # Feature-specific components
│   └── layouts/          # Layout components
└── types/                 # TypeScript type definitions
```

---

## 🔑 Environment Variables (Essential)

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/farmers_market"

# Auth (NextAuth v5)
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3001"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Redis/Upstash
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Sentry (Error Tracking)
SENTRY_AUTH_TOKEN="..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Optional: AI Features
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

See `docs/ENVIRONMENT_VARIABLES.md` for complete list.

---

## 🚪 Portal Access

### Admin Portal
- **URL:** http://localhost:3001/admin
- **Login:** admin@example.com / Admin123!
- **Features:** User management, farm approval, analytics

### Farmer Portal
- **URL:** http://localhost:3001/farmer
- **Login:** farmer@example.com / Farmer123!
- **Features:** Farm profile, products, orders, analytics

### Customer Portal
- **URL:** http://localhost:3001/customer
- **Login:** customer@example.com / Customer123!
- **Features:** Browse, cart, checkout, order history

---

## 🔧 Common Tasks

### Add a New Feature
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Create files
mkdir -p src/features/my-feature
touch src/features/my-feature/index.ts
touch src/features/my-feature/MyFeature.tsx
touch src/features/my-feature/__tests__/MyFeature.test.tsx

# 3. Write code + tests

# 4. Run quality checks
npm run quality
npm test

# 5. Commit and push
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### Fix a Bug
```bash
# 1. Create fix branch
git checkout -b fix/bug-description

# 2. Write test that reproduces bug
# 3. Fix the bug
# 4. Verify test passes
npm test

# 5. Run quality checks
npm run quality

# 6. Commit and push
git commit -m "fix: description of fix"
git push origin fix/bug-description
```

### Add a Database Model
```bash
# 1. Edit prisma/schema.prisma
# Add your model

# 2. Create migration
npm run db:migrate -- --name add_my_model

# 3. Generate Prisma client
npx prisma generate

# 4. Test migration
npm run db:reset
npm run test
```

### Debug Production Issues
```bash
# 1. Check Sentry for errors
# → https://sentry.io

# 2. Check Vercel logs
vercel logs

# 3. Check health endpoint
curl https://your-domain.vercel.app/api/health

# 4. Check specific API
curl https://your-domain.vercel.app/api/farms

# 5. Reproduce locally
NODE_ENV=production npm run build
npm start
```

---

## 🐛 Troubleshooting

### Dev Server Won't Start
```bash
# Kill any running processes
npm run kill-server

# Clear cache
rm -rf .next node_modules/.cache

# Reinstall
npm install

# Try again
npm run dev
```

### Database Connection Issues
```bash
# Test connection
npm run db:test

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Reset database
npm run db:reset
```

### Redis Connection Issues
```bash
# Test connection
npm run redis:test

# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis (if not running)
redis-server
```

### Build Errors
```bash
# Clear build cache
rm -rf .next

# Check for TypeScript errors
npm run type-check

# Check for ESLint errors
npm run lint

# Try building again
npm run build
```

### Test Failures
```bash
# Run single test file
npm test -- path/to/test.test.ts

# Run tests in watch mode
npm run test:watch

# Clear Jest cache
npm run clean:cache
npm test
```

---

## 📚 Documentation

| Topic | Location |
|-------|----------|
| **Getting Started** | `docs/getting-started/QUICK_START_GUIDE.md` |
| **Architecture** | `docs/architecture/README.md` |
| **API Reference** | `docs/api/README.md` |
| **Testing Guide** | `docs/testing/README.md` |
| **Deployment** | `docs/deployment/README.md` |
| **Environment Vars** | `docs/ENVIRONMENT_VARIABLES.md` |
| **Contributing** | `CONTRIBUTING.md` |
| **TODO List** | `TODO.md` |

---

## 🆘 Getting Help

### Check Documentation
```bash
# Open docs in browser
open docs/README.md
```

### Search Codebase
```bash
# Find files
npm run find-path -- "**/*farm*"

# Search content
npm run grep -- "pattern" --include-pattern "src/**/*.ts"
```

### Common Issues
1. **Port 3001 in use** → `npm run kill-server`
2. **Database migration failed** → `npm run db:reset`
3. **Tests failing** → `npm run clean:cache && npm test`
4. **Build failing** → `rm -rf .next && npm run build`
5. **TypeScript errors** → `npm run type-check`

### Ask the Team
- 💬 **Slack:** #farmers-market-dev
- 📧 **Email:** dev-team@farmersmarket.app
- 🐛 **Issues:** https://github.com/your-repo/issues
- 📖 **Docs:** https://docs.farmersmarket.app

---

## 🎯 Current Focus (Phase 1)

### Critical Blockers (This Week)
- [ ] **1.1** Fix Vercel deployment (P0, 4h)
- [ ] **1.2** Fix Sentry configuration (P0, 2h)
- [ ] **1.3** Verify test suite execution (P0, 3h)
- [ ] **1.4** Security audit - source maps (P0, 2h)
- [ ] **1.5** Environment variable audit (P1, 2h)
- [ ] **1.6** Database connection verification (P1, 1h)
- [ ] **1.7** Redis connection verification (P1, 1h)
- [ ] **1.8** API endpoint smoke tests (P1, 2h)

**See `TODO.md` for complete task list**

---

## 📊 Key Metrics

| Metric | Current | Target |
|--------|---------|--------|
| **Test Coverage** | ~85% | 90% |
| **TypeScript Errors** | 0 ✅ | 0 |
| **ESLint Warnings** | 0 ✅ | 0 |
| **Lighthouse Score** | TBD | >90 |
| **API Response Time** | TBD | <500ms |
| **Uptime** | TBD | >99.9% |

---

## 🔗 Quick Links

- **Production:** https://farmers-market-platform.vercel.app
- **Staging:** https://farmers-market-staging.vercel.app
- **Docs:** https://docs.farmersmarket.app
- **Storybook:** https://storybook.farmersmarket.app
- **Prisma Studio:** http://localhost:5555
- **Swagger API Docs:** http://localhost:3001/api-docs

---

## 💡 Pro Tips

1. **Use aliases in imports:**
   ```typescript
   import { Button } from '@/components/ui/button'
   import { database } from '@/lib/database'
   ```

2. **Run quality checks before committing:**
   ```bash
   npm run quality
   ```

3. **Use Prisma Studio for database inspection:**
   ```bash
   npm run db:studio
   ```

4. **Check API docs before writing code:**
   ```bash
   open http://localhost:3001/api-docs
   ```

5. **Use VS Code tasks (Cmd/Ctrl+Shift+P):**
   - "Run Task" → "dev"
   - "Run Task" → "test"

---

**🌾 Happy Coding! 🚜**

*Keep this reference card handy for daily development tasks.*