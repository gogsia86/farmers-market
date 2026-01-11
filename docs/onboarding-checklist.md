# Developer Onboarding Checklist

**Farmers Market Platform - New Developer Onboarding**
Welcome to the team! 🌾⚡

---

## Week 1: Setup & Orientation

### Day 1: Environment Setup ⚙️

- [ ] **Access & Accounts**
  - [ ] GitHub account added to repository
  - [ ] Vercel account access (if applicable)
  - [ ] Database access credentials received
  - [ ] Slack/Discord/Communication channel access
  - [ ] Email added to team distribution list

- [ ] **Local Development Setup**
  - [ ] Install Node.js v18.17+ (v22.x recommended)
  - [ ] Install npm v10.x+
  - [ ] Install PostgreSQL v14+
  - [ ] Install Git
  - [ ] Install VSCode (or preferred IDE)
  - [ ] Clone repository: `git clone https://github.com/gogsia86/farmers-market.git`
  - [ ] Run `npm install` successfully
  - [ ] Create `.env` file from `.env.example`
  - [ ] Configure database connection
  - [ ] Run `npx prisma migrate dev`
  - [ ] Start dev server: `npm run dev`
  - [ ] Access http://localhost:3000 successfully

- [ ] **IDE Configuration**
  - [ ] Install recommended VSCode extensions (see `.vscode/extensions.json`)
  - [ ] Configure ESLint
  - [ ] Configure Prettier
  - [ ] Enable TypeScript checking
  - [ ] Set up Git hooks (if applicable)

### Day 2: Codebase Exploration 🔍

- [ ] **Read Core Documentation**
  - [ ] `README.md` - Project overview
  - [ ] `docs/developer-quickstart.md` - Quick reference guide
  - [ ] `docs/dependencies.md` - Understand all dependencies
  - [ ] `.cursorrules` - Divine coding standards
  - [ ] `docs/feature-directory-migration-plan.md` - Architecture patterns

- [ ] **Understand Project Structure**
  - [ ] Explore `src/app/` - Next.js App Router pages
  - [ ] Explore `src/components/` - UI components
  - [ ] Explore `src/features/` - Domain-driven features
  - [ ] Explore `src/lib/` - Core business logic
  - [ ] Review `prisma/schema.prisma` - Database schema
  - [ ] Check `.github/workflows/` - CI/CD pipelines

- [ ] **Run All Scripts**
  - [ ] `npm run dev` - Development server
  - [ ] `npm run build` - Production build
  - [ ] `npm run lint` - Linting
  - [ ] `npm run type-check` - TypeScript validation
  - [ ] `npm run test` - Test suite
  - [ ] `npx prisma studio` - Database GUI

### Day 3: Divine Instructions Study 📚

- [ ] **Read Divine Instruction Files** (in `.github/instructions/`)
  - [ ] `01_DIVINE_CORE_PRINCIPLES.instructions.md`
  - [ ] `02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md`
  - [ ] `04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md`
  - [ ] `07_DATABASE_QUANTUM_MASTERY.instructions.md`
  - [ ] `10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md`
  - [ ] `16_KILO_QUICK_REFERENCE.instructions.md`

- [ ] **Understand Key Patterns**
  - [ ] Server Components vs Client Components
  - [ ] Server Actions pattern
  - [ ] Database access via `@/lib/database`
  - [ ] Authentication with NextAuth v5
  - [ ] Feature module structure
  - [ ] Prisma Decimal serialization

### Day 4-5: First Contributions 🚀

- [ ] **Small Tasks**
  - [ ] Fix a typo in documentation
  - [ ] Add a comment to complex code
  - [ ] Update a TypeScript type
  - [ ] Create a test PR to understand workflow

- [ ] **Code Review Practice**
  - [ ] Review recent PRs (closed and merged)
  - [ ] Understand PR templates and conventions
  - [ ] Note code review feedback patterns
  - [ ] Ask questions about decisions made

- [ ] **Testing Practice**
  - [ ] Run existing tests: `npm run test`
  - [ ] Write a simple component test
  - [ ] Write a simple API route test
  - [ ] Understand test coverage requirements (>80%)

---

## Week 2: Domain Knowledge

### Domain Understanding 🌾

- [ ] **Agricultural Concepts**
  - [ ] Understand farm management workflow
  - [ ] Learn product catalog patterns
  - [ ] Study order processing flow
  - [ ] Explore seasonal awareness features

- [ ] **User Roles**
  - [ ] Customer role and permissions
  - [ ] Farmer role and capabilities
  - [ ] Admin role and responsibilities
  - [ ] Authentication & authorization patterns

- [ ] **Core Features**
  - [ ] Farm profiles and management
  - [ ] Product catalog and inventory
  - [ ] Shopping cart functionality
  - [ ] Checkout and payment flow (Stripe)
  - [ ] Order management system
  - [ ] User profiles and settings

### Technical Deep Dive 🔧

- [ ] **Next.js 15 Patterns**
  - [ ] App Router architecture
  - [ ] Server Components benefits
  - [ ] Client Components use cases
  - [ ] Server Actions for mutations
  - [ ] Dynamic rendering (`force-dynamic`)
  - [ ] Route groups: (admin), (customer), (farmer)

- [ ] **Database & Prisma**
  - [ ] Understand schema relationships
  - [ ] Learn migration workflow
  - [ ] Practice CRUD operations
  - [ ] Use Prisma Studio for exploration
  - [ ] Understand Decimal type handling
  - [ ] Query optimization techniques

- [ ] **Authentication (NextAuth v5)**
  - [ ] App Router integration
  - [ ] Session management
  - [ ] Protected routes pattern
  - [ ] Role-based access control
  - [ ] Credentials provider setup

### First Real Feature 🎯

- [ ] **Choose a Starter Task**
  - [ ] Pick from "good first issue" labels
  - [ ] Discuss approach with mentor
  - [ ] Create feature branch
  - [ ] Implement following divine patterns
  - [ ] Write tests (component + integration)
  - [ ] Submit PR for review
  - [ ] Address review feedback
  - [ ] Celebrate first merge! 🎉

---

## Week 3-4: Advanced Topics

### AI & Automation 🤖

- [ ] **Microsoft Agent Framework**
  - [ ] Understand multi-agent orchestration
  - [ ] Review farm management agents
  - [ ] Learn tracing integration
  - [ ] Explore AI-powered features

### Observability 📊

- [ ] **OpenTelemetry**
  - [ ] Understand distributed tracing
  - [ ] Review instrumentation patterns
  - [ ] Access Azure Application Insights
  - [ ] Learn to debug with traces

### Performance Optimization ⚡

- [ ] **Hardware Awareness**
  - [ ] Understand HP OMEN optimization (12 threads, 64GB RAM)
  - [ ] Learn parallel processing patterns
  - [ ] Study caching strategies
  - [ ] Review performance monitoring

### Security Best Practices 🔒

- [ ] **Security Patterns**
  - [ ] Input validation with Zod
  - [ ] Authentication checks
  - [ ] Authorization patterns
  - [ ] Environment variable security
  - [ ] API route protection
  - [ ] SQL injection prevention (Prisma)

---

## Ongoing: Best Practices

### Daily Habits ✅

- [ ] Pull latest changes: `git pull origin master`
- [ ] Check for dependency updates: `npm outdated`
- [ ] Run tests before committing: `npm run test`
- [ ] Type-check before pushing: `npm run type-check`
- [ ] Lint code: `npm run lint`
- [ ] Write meaningful commit messages

### Weekly Tasks 📅

- [ ] Review team PRs and provide feedback
- [ ] Update documentation for changes made
- [ ] Run security audit: `npm audit`
- [ ] Check for outdated dependencies
- [ ] Participate in team meetings/standups
- [ ] Share learnings with team

### Code Quality Standards 💎

- [ ] **TypeScript Strict Mode**
  - [ ] No `any` types (use `unknown`)
  - [ ] Proper type imports
  - [ ] Type all function parameters and returns

- [ ] **Component Patterns**
  - [ ] Server Components by default
  - [ ] "use client" only when necessary
  - [ ] Props interface for all components
  - [ ] Proper error boundaries

- [ ] **Testing Requirements**
  - [ ] Unit tests for business logic
  - [ ] Component tests for UI
  - [ ] Integration tests for API routes
  - [ ] > 80% test coverage

- [ ] **Database Best Practices**
  - [ ] Always use `@/lib/database` import
  - [ ] Never create new PrismaClient instances
  - [ ] Optimize queries (avoid N+1)
  - [ ] Use transactions for multi-step operations

- [ ] **Documentation**
  - [ ] JSDoc comments for complex functions
  - [ ] README updates for new features
  - [ ] Type definitions for public APIs
  - [ ] Update CHANGELOG.md

---

## Resources & References 📚

### Internal Documentation

- [Developer Quickstart](./developer-quickstart.md)
- [Dependencies Guide](./dependencies.md)
- [Feature Migration Plan](./feature-directory-migration-plan.md)
- [Task Completion Summary](./task-completion-summary.md)

### Divine Instructions

- `.github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md`
- `.github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md`
- `.github/instructions/16_KILO_QUICK_REFERENCE.instructions.md`

### External Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://authjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Team Communication

- GitHub Issues - Bug reports and feature requests
- Pull Requests - Code reviews and discussions
- Team Chat - Daily communication
- Documentation - Source of truth

---

## Mentorship & Support 🤝

### Your Mentor

- **Name**: **\*\***\_**\*\***
- **Contact**: **\*\***\_**\*\***
- **Availability**: **\*\***\_**\*\***
- **Focus Areas**: **\*\***\_**\*\***

### Key Contacts

- **Tech Lead**: **\*\***\_**\*\***
- **Product Owner**: **\*\***\_**\*\***
- **DevOps**: **\*\***\_**\*\***
- **QA**: **\*\***\_**\*\***

### Getting Help

1. **Search first**: Documentation, codebase, previous PRs
2. **Ask your mentor**: Dedicated 1-on-1 time
3. **Team chat**: Quick questions
4. **Team meeting**: Complex discussions
5. **GitHub Issues**: Track problems/features

### Questions to Ask

Good questions to ask your mentor:

- What are the current sprint priorities?
- Which areas of the codebase need the most work?
- What are common pitfalls to avoid?
- How do we handle deployment to production?
- What's the PR review process?
- How do we handle hotfixes?

---

## 30-Day Goals 🎯

By the end of your first month, you should:

- [ ] ✅ Have merged at least 3 PRs
- [ ] ✅ Understand the core codebase structure
- [ ] ✅ Be comfortable with the development workflow
- [ ] ✅ Know when to use Server vs Client Components
- [ ] ✅ Write tests for your features
- [ ] ✅ Participate in code reviews
- [ ] ✅ Understand agricultural domain concepts
- [ ] ✅ Follow divine coding patterns
- [ ] ✅ Be productive without constant guidance
- [ ] ✅ Feel like part of the team! 🎉

---

## 60-Day Goals 🚀

By the end of two months:

- [ ] ✅ Lead development of a complete feature
- [ ] ✅ Conduct code reviews for others
- [ ] ✅ Contribute to architecture decisions
- [ ] ✅ Mentor newer developers
- [ ] ✅ Identify and implement improvements
- [ ] ✅ Present work in team demos
- [ ] ✅ Understand the full product lifecycle
- [ ] ✅ Be a fully autonomous contributor

---

## 90-Day Goals 🌟

By the end of three months:

- [ ] ✅ Own a major feature or domain area
- [ ] ✅ Contribute to technical roadmap
- [ ] ✅ Lead architectural discussions
- [ ] ✅ Improve team processes and tools
- [ ] ✅ Share knowledge through documentation
- [ ] ✅ Identify optimization opportunities
- [ ] ✅ Be considered a subject matter expert in one area
- [ ] ✅ Help shape the future of the platform

---

## Feedback & Continuous Improvement 📈

### Weekly Self-Assessment

Rate yourself weekly (1-5):

- **Technical Understanding**: \_\_\_/5
- **Code Quality**: \_\_\_/5
- **Communication**: \_\_\_/5
- **Productivity**: \_\_\_/5
- **Team Collaboration**: \_\_\_/5

### Monthly Check-ins

- [ ] Week 4: First month retrospective
- [ ] Week 8: Second month review
- [ ] Week 12: 90-day performance review

### Areas for Growth

Personal development goals:

1. ***
2. ***
3. ***

---

## Completion Certificate 🏆

When you've completed this checklist:

**I, **\*\*\*\*\***\*\_\_\_\_\*\***\*\*\*\*\*\*, have completed the Farmers Market Platform developer onboarding and am ready to contribute at full capacity with agricultural consciousness and divine precision.\*\*

**Date**: **\*\***\_\_\_**\*\***
**Mentor Signature**: **\*\***\_\_\_**\*\***
**Tech Lead Signature**: **\*\***\_\_\_**\*\***

---

## Welcome to the Team! 🎉

You're now part of building a divine agricultural platform that will revolutionize how farmers and customers connect. Your contributions matter, and we're excited to have you here!

Remember:

- 🌾 **Agricultural consciousness** in every feature
- ⚡ **Divine precision** in every line of code
- 🚀 **Quantum efficiency** in every optimization
- 🤝 **Team collaboration** in every decision

Happy coding! 🌟

---

**Version**: 1.0
**Last Updated**: November 15, 2025
**Maintained By**: Development Team

_"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_ 🌾⚡
