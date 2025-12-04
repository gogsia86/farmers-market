# 🌾 Farmers Market Platform - Start Here

**Welcome!** This is your entry point for the Farmers Market Platform project.

---

## 🚀 Quick Start

### First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   # Create PostgreSQL database
   createdb farmersmarket
   
   # Push schema
   npm run db:push
   
   # (Optional) Seed data
   npm run db:seed
   ```

3. **Configure Environment**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env with your credentials
   # At minimum, set DATABASE_URL
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   ```
   http://localhost:3000
   ```

---

## 📚 Essential Documentation

### Main Documents (Root Directory)
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current project status, test results, recent achievements
- **[README.md](./README.md)** - Full project overview and detailed setup
- **[.cursorrules](./.cursorrules)** - AI coding assistant rules and patterns

### Developer Guides (docs/)
- **[docs/QUICK_START.md](./docs/QUICK_START.md)** - Quick reference guide
- **[docs/QUICK_START_GUIDE.md](./docs/QUICK_START_GUIDE.md)** - Detailed setup instructions
- **[docs/COMMANDS.md](./docs/COMMANDS.md)** - Common CLI commands
- **[docs/TEST_COMMANDS.md](./docs/TEST_COMMANDS.md)** - Testing commands
- **[docs/CONTROLLER_PATTERN_QUICK_REFERENCE.md](./docs/CONTROLLER_PATTERN_QUICK_REFERENCE.md)** - Architecture patterns

### Divine Instructions (.github/instructions/)
Advanced architectural patterns and best practices:
- `01_DIVINE_CORE_PRINCIPLES.instructions.md` - Core architecture
- `04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md` - Next.js patterns
- `07_DATABASE_QUANTUM_MASTERY.instructions.md` - Database best practices
- `13_TESTING_PERFORMANCE_MASTERY.instructions.md` - Testing strategies
- ...and 12 more instruction files

---

## 🧪 Running Tests

### Quick Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests in watch mode
npm run test:watch

# Run integration tests (requires test database)
npm run test:integration
```

### Test Database Setup

```bash
# Create test database
createdb farmersmarket_test

# Push schema to test database
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket_test"
npx prisma db push

# Tests will automatically use .env.test if it exists
```

---

## 📂 Project Structure

```
├── src/
│   ├── app/              # Next.js App Router (pages & API routes)
│   ├── components/       # React components
│   ├── lib/              # Business logic, services, utilities
│   ├── tests/            # Test utilities and helpers
│   └── types/            # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── docs/                 # Developer documentation
├── .github/              
│   └── instructions/     # 16 divine instruction files
├── PROJECT_STATUS.md     # ⭐ Current status & progress
├── README.md             # Full project documentation
└── START_HERE.md         # 👈 You are here!
```

---

## 🎯 Current Status

**Test Coverage**: 97.5% (2,380+ tests passing)  
**Project Phase**: Phase 5 - Testing & Quality Assurance  
**Next Milestone**: 98% test coverage

See **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** for detailed status and metrics.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7 (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5
- **Payments**: Stripe + PayPal
- **Testing**: Jest + React Testing Library
- **UI**: Tailwind CSS + shadcn/ui

---

## 🔗 Quick Links

### Development
- Local: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api

### External Services
- Database: PostgreSQL (localhost:5432)
- Redis: localhost:6379 (optional)

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://authjs.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

## 💡 Common Tasks

### Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name description

# Open Prisma Studio (DB GUI)
npx prisma studio
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test pattern
npm test -- --testNamePattern="Product"
```

---

## 🆘 Need Help?

1. **Check PROJECT_STATUS.md** for current issues and progress
2. **Check README.md** for detailed documentation
3. **Check .github/instructions/** for architectural patterns
4. **Check docs/** for quick reference guides

---

## 🎉 Ready to Code!

You're all set! Start with:

```bash
npm run dev
```

Then open http://localhost:3000 and start building! 🚀

---

**Last Updated**: January 2025  
**Project Version**: 1.0.0  
**Status**: Active Development