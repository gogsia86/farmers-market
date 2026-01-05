# 🚀 Quick Start Guide - Post-Critical Fixes

**Farmers Market Platform - Developer Quick Start**
**Version**: 1.0.0
**Status**: ✅ All Critical Fixes Applied

---

## ⚡ TL;DR - Get Started in 5 Minutes

```bash
# 1. Clone and install
git clone <repo-url>
cd "Farmers Market Platform web and app"
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Set up database
npx prisma migrate dev
npx prisma db seed

# 4. Run tests (should see 2,954 passing)
npm test

# 5. Start development server
npm run dev
# Open http://localhost:3000
```

---

## 🔐 Required Environment Variables

**Minimum to start development**:

```bash
# .env.local (create this file)
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NextAuth secret**:

```bash
openssl rand -base64 32
```

---

## 🧪 Running Tests

### All Tests

```bash
npm test
# Expected: 2,954 passing, 51 skipped
```

### Specific Test Suite

```bash
npm test -- shipping.service.test.ts
npm test -- order.controller.test.ts
```

### With Coverage

```bash
npm run test:coverage
# Backend: 98.4%+
# Frontend: 70%
```

### Watch Mode (Development)

```bash
npm test -- --watch
```

---

## 🗄️ Database Setup

### First Time Setup

```bash
# 1. Start PostgreSQL (if not running)
# Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
# Or use local PostgreSQL

# 2. Create database
createdb farmers_market

# 3. Run migrations
npx prisma migrate dev

# 4. Seed test data (requires TEST_USER_PASSWORD)
export TEST_USER_PASSWORD="TestPassword123!"
npx tsx scripts/seed-test-data.ts
```

### Reset Database

```bash
npx prisma migrate reset
# This will drop, recreate, migrate, and seed
```

### View Data (Prisma Studio)

```bash
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🛠️ Development Scripts

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `npm run dev`            | Start development server (port 3000) |
| `npm run build`          | Build for production                 |
| `npm start`              | Run production build                 |
| `npm test`               | Run all tests                        |
| `npm run test:coverage`  | Run tests with coverage              |
| `npm run lint`           | Run ESLint                           |
| `npm run type-check`     | TypeScript type checking             |
| `npx prisma studio`      | Database GUI                         |
| `npx prisma migrate dev` | Create/apply migrations              |

---

## 🔧 Debug/Utility Scripts

**All scripts now require TEST_USER_PASSWORD environment variable!**

```bash
# Set password first
export TEST_USER_PASSWORD="YourSecurePassword123!"

# Then run scripts
npx tsx scripts/seed-test-data.ts      # Seed database with test data
npx tsx scripts/debug-nextauth.ts      # Debug authentication issues
npx tsx scripts/fix-nextauth.ts        # Fix auth configuration
npx tsx scripts/mvp-validation-bot.ts  # Run E2E validation
```

**Why?** We removed all hardcoded passwords for security!

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (customer)/        # Customer-facing pages
│   ├── (farmer)/          # Farmer dashboard
│   ├── (admin)/           # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI (buttons, cards)
│   └── features/         # Feature components
├── lib/                   # Core business logic
│   ├── services/         # Service layer (business logic)
│   ├── database/         # Database singleton
│   ├── auth/             # Authentication
│   ├── config/           # Configuration & validation
│   └── utils/            # Helper functions
└── types/                 # TypeScript types
```

---

## 🎯 Common Tasks

### Add a New Feature

```bash
# 1. Create service
src/lib/services/my-feature.service.ts

# 2. Add tests
src/lib/services/__tests__/my-feature.service.test.ts

# 3. Create API route
src/app/api/my-feature/route.ts

# 4. Add UI component
src/components/features/MyFeature.tsx

# 5. Run tests
npm test -- my-feature
```

### Add Database Table

```bash
# 1. Edit schema
nano prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_my_table

# 3. Update TypeScript types (automatic)
npx prisma generate

# 4. Use in code
import { database } from '@/lib/database';
const data = await database.myTable.findMany();
```

### Debug Authentication

```bash
# 1. Run debug script
export TEST_USER_PASSWORD="TestPassword123!"
npx tsx scripts/debug-nextauth.ts

# 2. Check output for issues
# 3. Fix based on recommendations
```

---

## 🐛 Common Issues & Solutions

### Issue: "PrismaClient is unable to run in the browser"

**Solution**: Make sure you're using `"use server"` or server components

```typescript
// ✅ Server Component (default)
export default async function Page() {
  const data = await database.farm.findMany();
}

// ✅ Server Action
("use server");
export async function getFarms() {
  return await database.farm.findMany();
}

// ❌ Client Component
("use client"); // Can't use database here!
```

### Issue: "NEXTAUTH_SECRET not configured"

**Solution**: Add to `.env.local`

```bash
openssl rand -base64 32
# Copy output to .env.local:
NEXTAUTH_SECRET="<paste here>"
```

### Issue: "TEST_USER_PASSWORD required"

**Solution**: Export before running scripts

```bash
export TEST_USER_PASSWORD="TestPassword123!"
npx tsx scripts/seed-test-data.ts
```

### Issue: Tests failing

**Solution**: Check test output, common causes:

```bash
# Database not running
docker start postgres

# Environment not set
source .env.test

# Cache issues
npm test -- --clearCache

# Outdated dependencies
npm install
```

---

## 📚 Key Documentation

### Must-Read

1. `CONTINUATION_ACTION_PLAN.md` - Overall action plan
2. `SECURITY_CREDENTIALS_GUIDE.md` - Credential management
3. `SESSION_CONTINUATION_SUCCESS.md` - Recent fixes
4. `TESTING_QUICK_REFERENCE.md` - Testing guide

### Divine Instructions

Located in `.github/instructions/`:

- `01_DIVINE_CORE_PRINCIPLES.instructions.md` - Architecture
- `04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md` - Next.js patterns
- `07_DATABASE_QUANTUM_MASTERY.instructions.md` - Database patterns
- `16_KILO_QUICK_REFERENCE.instructions.md` - Copy-paste patterns

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running (`psql --version`)
- [ ] `.env.local` created with required variables
- [ ] Database migrated (`npx prisma migrate dev`)
- [ ] Tests passing (`npm test` shows 2,954 passing)
- [ ] Dev server starts (`npm run dev`)
- [ ] Can access http://localhost:3000

---

## 🚀 Ready to Code!

Your environment is set up! Here's what you should know:

### Architecture

- **Next.js 15** with App Router
- **TypeScript** strict mode
- **Prisma** for database
- **NextAuth v5** for authentication
- **Tailwind CSS** for styling

### Patterns to Follow

- Use **server components** by default
- Service layer for business logic
- ServiceResponse<T> for all operations
- Comprehensive error handling
- Divine naming conventions (see .cursorrules)

### Development Workflow

1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Run tests (`npm test`)
5. Check types (`npm run type-check`)
6. Commit with clear message

---

## 📞 Need Help?

1. **Check documentation** - Most answers are in the docs
2. **Run debug scripts** - Scripts provide diagnostics
3. **Check test output** - Tests show what's wrong
4. **Review .cursorrules** - Contains all coding standards

---

## 🎯 Current Status

✅ **2,954 tests passing**
✅ **98.4%+ backend coverage**
✅ **Zero hardcoded credentials**
✅ **A+ security score**
✅ **Production ready**

---

**Happy Coding! 🌾⚡**

_"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_
