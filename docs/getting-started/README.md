# 🚀 Getting Started with Farmers Market Platform

> **Quick Start Guide**
>
> Everything you need to get up and running with the Farmers Market Platform in under 30 minutes.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [First Steps](#first-steps)
- [Common Tasks](#common-tasks)
- [Learning Paths](#learning-paths)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)
- [Support](#support)

---

## 🎯 Overview

The Farmers Market Platform is a **divine agricultural marketplace** built with:

- **Next.js 15** (App Router) - Full-stack React framework
- **TypeScript** (Strict Mode) - Type-safe development
- **Prisma** - Database ORM with PostgreSQL
- **NextAuth v5** - Authentication & authorization
- **Tailwind CSS** - Utility-first styling
- **Microsoft Agent Framework** - AI-powered automation

### Architecture Highlights

```
┌─────────────────────────────────────────────────────┐
│                 Next.js 15 App Router               │
├─────────────────────────────────────────────────────┤
│  Client Components  │  Server Components  │  API   │
├─────────────────────────────────────────────────────┤
│              Service Layer (Business Logic)         │
├─────────────────────────────────────────────────────┤
│           Prisma ORM (Database Access Layer)        │
├─────────────────────────────────────────────────────┤
│              PostgreSQL Database                    │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### Required Software

| Software       | Version       | Purpose                     |
| -------------- | ------------- | --------------------------- |
| **Node.js**    | 18.17+ or 20+ | JavaScript runtime          |
| **pnpm**       | 8.0+          | Package manager (preferred) |
| **PostgreSQL** | 14+           | Database                    |
| **Git**        | 2.0+          | Version control             |
| **VS Code**    | Latest        | IDE (recommended)           |

### Optional Tools

- **Docker** - For containerized development
- **Azure CLI** - For cloud deployments
- **Postman** - For API testing

### System Requirements

```yaml
Minimum:
  RAM: 8GB
  Storage: 20GB free space
  CPU: 4 cores

Recommended (HP OMEN):
  RAM: 64GB
  Storage: 100GB+ SSD
  CPU: 12 threads
  GPU: RTX 2070 Max-Q (for AI features)
```

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
# Clone the repo
git clone https://github.com/your-org/farmers-market-platform.git
cd farmers-market-platform

# Checkout main branch
git checkout main
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
code .env.local
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: AI Features
AZURE_OPENAI_API_KEY="your-key"
AZURE_OPENAI_ENDPOINT="your-endpoint"
```

### 4. Database Setup

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database (optional)
pnpm prisma db seed
```

### 5. Start Development Server

```bash
# Start the dev server
pnpm dev

# Server will be available at:
# http://localhost:3000
```

### 6. Verify Installation

Open your browser and navigate to:

- **Homepage**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **Prisma Studio**: Run `pnpm prisma studio`

---

## 🛠️ Development Setup

### VS Code Configuration

1. **Install Recommended Extensions**:

   ```bash
   # Extensions will be suggested automatically
   # Or manually install from .vscode/extensions.json
   ```

   Key extensions:
   - ESLint
   - Prettier
   - Prisma
   - Tailwind CSS IntelliSense
   - GitHub Copilot (optional)

2. **Apply Workspace Settings**:
   ```bash
   # Settings are in .vscode/settings.json
   # They'll apply automatically when you open the workspace
   ```

### Git Configuration

```bash
# Set your identity
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set up commit signing (optional but recommended)
git config commit.gpgsign true
```

### Database GUI Options

```bash
# Option 1: Prisma Studio (built-in)
pnpm prisma studio

# Option 2: pgAdmin (external)
# Download from https://www.pgadmin.org/

# Option 3: DBeaver (external)
# Download from https://dbeaver.io/
```

---

## 🎓 First Steps

### Step 1: Explore the Codebase

```bash
# View project structure
tree -L 2 -I 'node_modules|.next'

# Or use the directory listing
ls -la src/
```

**Key Directories to Know:**

```
src/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── lib/             # Core business logic
│   ├── services/    # Business logic layer
│   ├── database/    # Database singleton
│   └── auth/        # Authentication
├── types/           # TypeScript types
└── hooks/           # React hooks
```

### Step 2: Run the Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Step 3: Check Code Quality

```bash
# Lint the codebase
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

### Step 4: Explore Documentation

**Start with these key docs:**

1. **Architecture Overview**: `docs/architecture/README.md`
2. **API Documentation**: `docs/api/README.md`
3. **Testing Guide**: `docs/testing/README.md`
4. **Deployment Guide**: `docs/deployment/README.md`

**Browse the full documentation:**

```bash
# Open main documentation hub
code docs/README.md

# Use the documentation map
code docs/DOCUMENTATION_MAP.md

# Search documentation
code docs/SEARCH_GUIDE.md
```

### Step 5: Make Your First Change

```bash
# Create a new branch
git checkout -b feat/your-feature-name

# Make changes
# ... edit files ...

# Run quality checks
pnpm lint && pnpm test

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feat/your-feature-name
```

---

## 📚 Common Tasks

### Database Operations

```bash
# View database in browser
pnpm prisma studio

# Create new migration
pnpm prisma migrate dev --name describe-your-changes

# Reset database (CAUTION: deletes all data)
pnpm prisma migrate reset

# Generate Prisma Client after schema changes
pnpm prisma generate

# Seed database
pnpm prisma db seed
```

### Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run linter with auto-fix
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm type-check
```

### Testing Commands

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test.spec.ts

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Component Development

```bash
# Generate new component (if generator is set up)
pnpm generate:component ComponentName

# Or manually create:
# 1. Create component file in src/components/
# 2. Create test file in src/components/__tests__/
# 3. Create storybook file (if using Storybook)
```

---

## 🎓 Learning Paths

### For Frontend Developers

**Week 1: Foundation**

1. ✅ Complete Quick Start
2. 📖 Read `docs/architecture/README.md`
3. 🧩 Study component patterns in `src/components/`
4. 🎨 Review Tailwind CSS setup
5. 🔨 Build your first component

**Week 2: Advanced Patterns**

1. 🔄 Learn Server vs Client Components
2. 🚀 Understand Server Actions
3. 🎣 Explore custom hooks
4. ✅ Write component tests
5. 🔨 Build a feature module

**Week 3: Integration**

1. 🔐 Learn authentication patterns
2. 📡 Work with API routes
3. 🗄️ Understand Prisma operations
4. 🧪 Write integration tests
5. 🔨 Build end-to-end feature

### For Backend Developers

**Week 1: Foundation**

1. ✅ Complete Quick Start
2. 📖 Read `docs/database/README.md`
3. 🗄️ Study Prisma schema
4. 🔧 Explore service layer
5. 🔨 Create a simple service

**Week 2: Advanced Patterns**

1. 🔐 Learn authentication/authorization
2. ✅ Understand validation patterns
3. 🚀 Master transaction handling
4. 📊 Study query optimization
5. 🔨 Build a complex service

**Week 3: Integration**

1. 📡 Create API endpoints
2. 🧪 Write service tests
3. 🔄 Implement caching strategies
4. 📈 Add performance monitoring
5. 🔨 Build complete API feature

### For Full-Stack Developers

**Week 1: Foundation**

1. ✅ Complete Quick Start
2. 📖 Read architecture docs
3. 🔄 Understand data flow
4. 🧩 Study both layers
5. 🔨 Build simple CRUD feature

**Week 2: Advanced Patterns**

1. 🔄 Master Server Components + Actions
2. 🗄️ Advanced Prisma patterns
3. 🔐 Complete auth flow
4. ✅ Comprehensive testing
5. 🔨 Build complex feature

**Week 3: Excellence**

1. 🚀 Performance optimization
2. 🔒 Security hardening
3. 📊 Monitoring & logging
4. 🌐 Deployment pipeline
5. 🔨 Ship production-ready feature

### For DevOps Engineers

**Week 1: Foundation**

1. ✅ Complete Quick Start
2. 📖 Read `docs/deployment/README.md`
3. 🐳 Study Docker setup
4. ☁️ Review Azure configuration
5. 🔨 Deploy to development

**Week 2: CI/CD**

1. 🔄 Understand GitHub Actions
2. 🧪 Review test automation
3. 📦 Study build pipeline
4. 🚀 Master deployment process
5. 🔨 Set up staging environment

**Week 3: Production**

1. 📊 Implement monitoring
2. 🔍 Set up logging
3. 🔒 Security hardening
4. 📈 Performance tuning
5. 🔨 Production deployment

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `Can't reach database server`

**Solutions**:

```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
# macOS:
brew services restart postgresql

# Linux:
sudo systemctl restart postgresql

# Windows:
# Use Services app to restart PostgreSQL

# Verify DATABASE_URL in .env.local
echo $DATABASE_URL
```

#### 2. Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:

```bash
# Generate Prisma Client
pnpm prisma generate

# If still failing, clean and reinstall
rm -rf node_modules .next
pnpm install
pnpm prisma generate
```

#### 3. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:

```bash
# Option 1: Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use different port
PORT=3001 pnpm dev
```

#### 4. Environment Variables Not Loaded

**Error**: `process.env.VARIABLE_NAME is undefined`

**Solution**:

```bash
# Ensure .env.local exists
ls -la .env.local

# Restart dev server after .env changes
# Ctrl+C and run pnpm dev again

# Verify variables are loaded
pnpm dev | grep "Environment"
```

#### 5. Module Not Found Errors

**Error**: `Cannot find module '@/components/...'`

**Solutions**:

```bash
# Check tsconfig.json paths are correct
cat tsconfig.json | grep paths

# Clean Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Getting Help

**Before Asking for Help:**

1. ✅ Check this troubleshooting section
2. 📖 Read relevant documentation
3. 🔍 Search closed issues on GitHub
4. 🧪 Try reproducing in clean environment

**Where to Get Help:**

- 💬 **Team Chat**: Internal Slack/Discord channel
- 🐛 **Bug Reports**: GitHub Issues
- 📧 **Email**: dev-team@example.com
- 📖 **Documentation**: `docs/troubleshooting/README.md`

---

## 🚀 Next Steps

### Immediate Actions

1. **Complete Setup Checklist**:

   ```
   ✅ Prerequisites installed
   ✅ Repository cloned
   ✅ Dependencies installed
   ✅ Environment configured
   ✅ Database initialized
   ✅ Dev server running
   ✅ Tests passing
   ```

2. **Choose Your Learning Path**:
   - Frontend Developer → UI components
   - Backend Developer → Services & APIs
   - Full-Stack Developer → Complete features
   - DevOps Engineer → Deployment pipeline

3. **Join the Team**:
   - Introduce yourself in team chat
   - Attend daily standup
   - Review current sprint board
   - Pick your first task

### Recommended Reading

**Essential Documentation** (Read First):

1. 📖 [Architecture Overview](../architecture/README.md)
2. 🗄️ [Database Guide](../database/README.md)
3. 🔐 [Authentication Guide](../guides/authentication.md)
4. 🧪 [Testing Guide](../testing/README.md)

**Advanced Topics** (Read Later):

1. 🚀 [Performance Optimization](../optimization/README.md)
2. 🤖 [AI Integration Guide](../ai/README.md)
3. 🌐 [Deployment Guide](../deployment/README.md)
4. 📊 [Monitoring & Logging](../monitoring/README.md)

### Community Resources

- **GitHub Discussions**: Ask questions, share ideas
- **Wiki**: Additional guides and tutorials
- **Blog**: Team announcements and articles
- **Contributing Guide**: `CONTRIBUTING.md`

---

## 📞 Support

### Quick Links

| Resource              | Location                         | Purpose                    |
| --------------------- | -------------------------------- | -------------------------- |
| **Documentation Hub** | `docs/README.md`                 | Central navigation         |
| **API Reference**     | `docs/api/README.md`             | API documentation          |
| **Troubleshooting**   | `docs/troubleshooting/README.md` | Common issues              |
| **FAQ**               | `docs/FAQ.md`                    | Frequently asked questions |

### Development Resources

```bash
# View all available commands
pnpm run

# Open documentation in browser
# (if documentation server is set up)
pnpm docs:serve

# Generate API documentation
pnpm docs:generate
```

### Team Contacts

- **Tech Lead**: Review architecture decisions
- **DevOps Lead**: Deployment and infrastructure
- **QA Lead**: Testing strategies
- **Product Owner**: Feature requirements

---

## 🌟 Best Practices

### Development Workflow

1. **Always create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Write tests first (TDD)**

   ```typescript
   // Write failing test
   it("should do something", () => {
     expect(result).toBe(expected);
   });

   // Implement feature
   // Make test pass
   ```

3. **Run quality checks before committing**

   ```bash
   pnpm lint && pnpm test && pnpm type-check
   ```

4. **Write meaningful commit messages**

   ```bash
   # Good
   git commit -m "feat: add farm profile validation"

   # Bad
   git commit -m "fix stuff"
   ```

5. **Keep PRs small and focused**
   - One feature per PR
   - Under 400 lines of changes
   - Clear description and screenshots

### Code Quality Standards

```typescript
// ✅ GOOD: Type-safe, clear intent
export async function getFarmById(farmId: string): Promise<Farm | null> {
  return await database.farm.findUnique({
    where: { id: farmId },
    include: { products: true },
  });
}

// ❌ BAD: No types, unclear intent
export async function getData(id) {
  return await db.farm.findUnique({ where: { id } });
}
```

---

## 📊 Progress Tracking

Use this checklist to track your onboarding progress:

### Week 1: Setup & Basics

- [ ] Complete quick start setup
- [ ] Run dev server successfully
- [ ] Explore codebase structure
- [ ] Read architecture documentation
- [ ] Run tests successfully
- [ ] Make first commit
- [ ] Deploy to local environment

### Week 2: Development

- [ ] Build first component/feature
- [ ] Write tests for your code
- [ ] Create first pull request
- [ ] Review teammate's PR
- [ ] Attend team meetings
- [ ] Complete first task from sprint

### Week 3: Integration

- [ ] Ship feature to staging
- [ ] Participate in code review
- [ ] Fix production bug
- [ ] Improve existing feature
- [ ] Add documentation
- [ ] Mentor new team member

---

## 🎉 Welcome to the Team!

You're now ready to start building divine agricultural features! 🌾

**Remember**:

- 💡 Ask questions early and often
- 🤝 Collaborate with teammates
- 📖 Document as you learn
- 🧪 Test everything
- 🚀 Ship with confidence

**Happy coding!** ⚡

---

**Last Updated**: December 2024  
**Maintained By**: Development Team  
**Status**: ✅ Active & Complete

**Quick Navigation**:

- [← Back to Documentation Hub](../README.md)
- [→ Architecture Guide](../architecture/README.md)
- [→ API Documentation](../api/README.md)
- [→ Testing Guide](../testing/README.md)
