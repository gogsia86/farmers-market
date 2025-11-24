# 📚 Farmers Market Platform - Documentation Index

**Last Updated:** January 2025  
**Purpose:** Master navigation guide for all project documentation

---

## 🚀 Quick Start (New Contributors)

Start here if you're new to the project:

1. **[README.md](./README.md)** - Project overview and setup instructions
2. **[PROJECT_STATUS_2025.md](./PROJECT_STATUS_2025.md)** - Current platform status and health metrics
3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Essential commands and patterns
4. **[E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)** - How to run and write tests

---

## 📖 Core Documentation (Root Directory)

### Essential Files (Keep These Handy)

#### Project Overview
- **[README.md](./README.md)** - Main project documentation
- **[PROJECT_STATUS_2025.md](./PROJECT_STATUS_2025.md)** - Comprehensive current status
- **[LICENSE](./LICENSE)** - MIT License

#### Development Guides
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Developer quick reference
- **[E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)** - Testing guidelines and best practices
- **[DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)** - Docker setup and deployment

#### Deployment & Operations
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - Detailed production checklist

#### Planning & Roadmap
- **[CLEANUP_AND_IMPROVEMENTS_PLAN.md](./CLEANUP_AND_IMPROVEMENTS_PLAN.md)** - Comprehensive 5-phase improvement roadmap
- **[CLEANUP_COMPLETED_SUMMARY.md](./CLEANUP_COMPLETED_SUMMARY.md)** - Phase 1 completion report
- **[TEST_FIX_SUCCESS_SUMMARY.md](./TEST_FIX_SUCCESS_SUMMARY.md)** - Recent test fixes documentation

---

## 🏗️ Technical Documentation

### Architecture & Standards
Located in `.github/instructions/` - See **Divine Instructions** section below.

### Database
- **[prisma/schema.prisma](./prisma/schema.prisma)** - Complete database schema
- Run `npm run db:studio` to explore database visually

### API Documentation
- API routes in `src/app/api/*/route.ts`
- See **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for API patterns

---

## 🌟 Divine Instructions (.github/instructions/)

Comprehensive coding guidelines organized by layer:

### Foundation Layer
1. **[01_DIVINE_CORE_PRINCIPLES.instructions.md](.github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md)**
   - Architecture foundation
   - Quantum patterns
   - Cosmic conventions

2. **[02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md](.github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md)**
   - Biodynamic consciousness
   - Farming domain intelligence

3. **[03_PERFORMANCE_REALITY_BENDING.instructions.md](.github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md)**
   - Temporal optimization
   - Quantum performance alchemy

### Implementation Layer
4. **[04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md](.github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md)**
   - Full-stack patterns
   - React quantum components

5. **[05_TESTING_SECURITY_DIVINITY.instructions.md](.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md)**
   - Quality assurance
   - Security fortress patterns

6. **[06_AUTOMATION_INFRASTRUCTURE.instructions.md](.github/instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md)**
   - CI/CD divinity
   - Deployment excellence

### Data & Design Layer
7. **[07_DATABASE_QUANTUM_MASTERY.instructions.md](.github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md)**
   - Prisma consciousness
   - SQL reality bending

8. **[08_UX_DESIGN_CONSCIOUSNESS.instructions.md](.github/instructions/08_UX_DESIGN_CONSCIOUSNESS.instructions.md)**
   - Agricultural interface patterns
   - Biodynamic design

### Intelligence Layer
9. **[09_AI_WORKFLOW_AUTOMATION.instructions.md](.github/instructions/09_AI_WORKFLOW_AUTOMATION.instructions.md)**
   - Copilot consciousness
   - AI agricultural patterns

10. **[10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md](.github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md)**
    - Farm components
    - Product catalogs
    - Order flows

### Kilo-Scale Enterprise Layer
11. **[11_KILO_SCALE_ARCHITECTURE.instructions.md](.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md)**
    - Enterprise architecture
    - Thousand-line codebase patterns

12. **[12_ERROR_HANDLING_VALIDATION.instructions.md](.github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md)**
    - Enterprise error management
    - Validation frameworks

13. **[13_TESTING_PERFORMANCE_MASTERY.instructions.md](.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md)**
    - Comprehensive testing
    - Performance monitoring

14. **[14_CONFIGURATION_DEPLOYMENT.instructions.md](.github/instructions/14_CONFIGURATION_DEPLOYMENT.instructions.md)**
    - Enterprise deployment
    - Configuration management

15. **[15_KILO_CODE_DIVINE_INTEGRATION.instructions.md](.github/instructions/15_KILO_CODE_DIVINE_INTEGRATION.instructions.md)**
    - Master integration guide

16. **[16_KILO_QUICK_REFERENCE.instructions.md](.github/instructions/16_KILO_QUICK_REFERENCE.instructions.md)**
    - Instant copy-paste patterns

---

## 📂 Historical Documentation (Archived)

All historical achievement reports, status files, and outdated guides have been moved to:

```
archive/docs-historical/
├── status-reports/          # Historical status and progress reports
├── achievement-reports/     # Test coverage and milestone celebrations
├── optimization-guides/     # GPU, HP OMEN, and performance guides
├── deployment-guides/       # Legacy deployment documentation
└── test-coverage-sessions/  # Epic test coverage push sessions
```

### Why Archived?
These documents represent the project's journey and achievements but are no longer needed for day-to-day development. They remain available for historical reference.

---

## 🔧 Development Workflows

### Daily Development
```bash
# Start development
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

### Before Committing
```bash
# Full health check
npm run test:ci && npm run type-check && npm run lint

# Generate Prisma client (if schema changed)
npm run db:generate
```

### Deployment Preparation
See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete checklist.

---

## 🧪 Testing Documentation

### Test Guides
- **[E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)** - Comprehensive testing guide
- **[TEST_FIX_SUCCESS_SUMMARY.md](./TEST_FIX_SUCCESS_SUMMARY.md)** - Recent test fixes

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch

# CI mode (non-interactive)
npm run test:ci
```

### Test Coverage Targets
- **Minimum:** 95%
- **Current:** 98.6%
- **Goal:** Maintain >95% on all PRs

---

## 🚢 Deployment Documentation

### Production Deployment
1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Main deployment guide
2. **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - Detailed checklist

### Docker Deployment
- **[DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)** - Docker setup
- Scripts: `docker-deploy.ps1`, `docker-manager.ps1`

### Environment Setup
- See `.env.example` for required variables
- Vercel-specific: Run `setup-vercel-env.ps1`

---

## 🤖 AI & Automation

### AI Integration
- Microsoft Agent Framework integration
- Ollama local LLM support
- OpenTelemetry tracing

### Setup Guides
- **[OLLAMA_QUICK_START.md](./OLLAMA_QUICK_START.md)** - Local LLM setup
- **[TRACING_SETUP_GUIDE.md](./TRACING_SETUP_GUIDE.md)** - OpenTelemetry configuration

---

## 📊 Monitoring & Analytics

### Observability
- **Sentry** - Error tracking
- **OpenTelemetry** - Distributed tracing
- **Azure Application Insights** - Performance monitoring

### Configuration Files
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`

---

## 🔒 Security Documentation

### Best Practices
- Input validation with Zod schemas
- NextAuth v5 authentication
- Role-based authorization (Customer, Farmer, Admin)
- Environment variable protection

### Security Checklist
See Phase 5 in **[CLEANUP_AND_IMPROVEMENTS_PLAN.md](./CLEANUP_AND_IMPROVEMENTS_PLAN.md)**.

---

## 🎨 UI/UX Documentation

### Design System
- Tailwind CSS configuration: `tailwind.config.ts`
- Component library: `src/components/ui/`
- Agricultural interface patterns in divine instructions

### Styling Guidelines
See **[08_UX_DESIGN_CONSCIOUSNESS.instructions.md](.github/instructions/08_UX_DESIGN_CONSCIOUSNESS.instructions.md)**.

---

## 📦 Package & Dependency Management

### Package.json Scripts
See **[PROJECT_STATUS_2025.md](./PROJECT_STATUS_2025.md#-package-scripts-reference)** for complete script reference.

### Dependency Management
```bash
# Install dependencies
npm install

# Check for outdated packages
npm outdated

# Audit security
npm audit

# Clean install
npm run clean:all && npm install
```

---

## 🗂️ Project Structure

```
Farmers Market Platform/
├── .github/
│   ├── instructions/          # Divine coding guidelines
│   └── workflows/             # GitHub Actions CI/CD
├── src/
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── lib/                   # Business logic & utilities
│   ├── types/                 # TypeScript type definitions
│   └── hooks/                 # React hooks
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding
├── tests/                     # E2E tests (Playwright)
├── public/                    # Static assets
├── archive/                   # Historical documentation
└── [Essential docs]           # README, guides, etc.
```

---

## 🎯 Finding What You Need

### I want to...

#### ...get started with development
→ Read **[README.md](./README.md)** → **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**

#### ...understand current project status
→ Read **[PROJECT_STATUS_2025.md](./PROJECT_STATUS_2025.md)**

#### ...deploy to production
→ Follow **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

#### ...run tests
→ Follow **[E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)**

#### ...understand the architecture
→ Read divine instructions starting with **[01_DIVINE_CORE_PRINCIPLES.instructions.md](.github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md)**

#### ...contribute code
→ Review **[.cursorrules](.cursorrules)** and divine instructions

#### ...find historical context
→ Browse **[archive/docs-historical/](./archive/docs-historical/)**

#### ...configure Docker
→ Follow **[DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)**

#### ...set up AI features
→ Follow **[OLLAMA_QUICK_START.md](./OLLAMA_QUICK_START.md)**

#### ...understand database schema
→ Open `prisma/schema.prisma` or run `npm run db:studio`

---

## 📞 Getting Help

### Resources
1. Check this documentation index first
2. Search divine instructions for specific patterns
3. Review test files for examples
4. Check GitHub Issues for known problems

### Common Issues
- **Build errors:** Run `npm run clean:all && npm install`
- **Test failures:** Check **[TEST_FIX_SUCCESS_SUMMARY.md](./TEST_FIX_SUCCESS_SUMMARY.md)**
- **Database issues:** Run `npm run db:generate && npm run db:push`
- **Type errors:** Run `npm run type-check` for detailed diagnostics

---

## 🔄 Maintenance

### Regular Updates
- **Weekly:** Run `npm audit` and address security issues
- **Monthly:** Review and update dependencies
- **Quarterly:** Review and archive outdated documentation
- **Per PR:** Ensure tests pass and coverage maintained

### Documentation Updates
This index should be updated whenever:
- New major documentation is added
- Documentation structure changes
- Guides are archived or consolidated
- New features require documentation

---

## 🏆 Project Philosophy

> **"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."**

All documentation follows these principles:
- **Clarity** - Easy to understand and follow
- **Completeness** - All necessary information included
- **Currency** - Kept up-to-date
- **Consciousness** - Agricultural and divine awareness

---

**Quick Health Check:**
```bash
npm run test:ci && npm run type-check && npm run lint
```

**Questions?** Review the relevant guide above or check divine instructions.

---

_Last updated: January 2025 | Status: ✅ Production Ready_