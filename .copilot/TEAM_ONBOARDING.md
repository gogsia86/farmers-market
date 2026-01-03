# 🚀 TEAM ONBOARDING: GODLIKE COPILOT WORKFLOW
## Divine Precision Coding for Farmers Market Platform

---

## 📋 ONBOARDING CHECKLIST

### Day 1: Setup & Configuration ✅

#### Environment Setup
- [ ] **Install Cursor IDE** (or VS Code with GitHub Copilot extension)
- [ ] **Verify GitHub Copilot subscription** is active
  - Go to GitHub.com → Settings → Copilot
  - Ensure subscription status is "Active"
- [ ] **Clone the repository**
  ```bash
  git clone <repo-url>
  cd "Farmers Market Platform web and app"
  ```
- [ ] **Install dependencies**
  ```bash
  npm install
  ```
- [ ] **Verify configuration files exist**
  - `.cursorrules` (root)
  - `.copilot/directives.md`
  - `.copilot/GODLIKE_WORKFLOW.md`
  - `.vscode/settings.json`
  - `.vscode/keybindings.json`
  - `.vscode/typescript.code-snippets`

#### Copilot Activation
- [ ] **Open Cursor/VS Code**
- [ ] **Sign in to GitHub Copilot**
  - `Ctrl+Shift+P` → "Copilot: Sign In"
- [ ] **Verify Copilot is active**
  - Open any `.ts` file
  - Type a comment: `// Function to add two numbers`
  - Press Enter - Copilot should suggest code
- [ ] **Reload window to apply all settings**
  - `Ctrl+Shift+P` → "Developer: Reload Window"

#### Learning Resources
- [ ] **Read `.copilot/directives.md`** (15 min)
- [ ] **Read `.copilot/GODLIKE_WORKFLOW.md`** (30 min)
- [ ] **Review `.cursorrules`** (10 min)
- [ ] **Watch divine instructions videos** (if available)

---

### Day 2: Fundamentals & Practice 🎯

#### Master the Shortcuts
- [ ] **Print out keyboard shortcuts reference**
  - See Appendix A in `GODLIKE_WORKFLOW.md`
- [ ] **Practice core shortcuts** (15 min drill):
  - `Ctrl+Space` - Trigger suggestion (10x)
  - `Alt+Enter` - Accept suggestion (10x)
  - `Alt+[` / `Alt+]` - Navigate suggestions (10x)
  - `Ctrl+Shift+I` - Open chat (5x)
  - `Ctrl+Shift+X` - Reject suggestion (5x)

#### Test Basic Workflows
- [ ] **Generate a simple component**
  - Open Copilot Chat (`Ctrl+Shift+I`)
  - Prompt: "Generate src/components/test/HelloWorld.tsx with TypeScript. Code only."
  - Verify: No explanations, proper imports, TypeScript interface
- [ ] **Generate an API route**
  - Prompt: "Create src/app/api/test/route.ts with GET handler. Use @/lib/database import. Code only."
  - Verify: Proper error handling, auth check, QuantumApiResponse format
- [ ] **Use a snippet**
  - Create new file
  - Type `drc` → Tab
  - Let Copilot fill in the details

#### First Real Task
- [ ] **Choose a starter task** (assigned by team lead)
  - Example: "Add a new badge variant to OrderStatus component"
- [ ] **Complete using godlike workflow**
  1. Plan approach
  2. Craft precision prompt
  3. Generate code with Copilot
  4. Validate output
  5. Commit changes
- [ ] **Get code review feedback**
- [ ] **Iterate based on feedback**

---

### Day 3: Advanced Techniques 🔥

#### Complex Generation
- [ ] **Multi-file feature generation**
  - Prompt: "Generate customer wishlist feature: page, component, API route, service, types. All files."
  - Practice: Verify all imports are correct and files integrate properly
- [ ] **Refactoring with constraints**
  - Select existing component
  - Press `Ctrl+Alt+Shift+O`
  - Verify: Code is optimized, functionality maintained
- [ ] **Test generation**
  - Select a service class
  - Press `Ctrl+Alt+Shift+T`
  - Verify: Comprehensive tests, mocks, edge cases

#### Master Custom Actions
- [ ] **Practice all custom shortcuts** (with selection):
  - `Ctrl+Alt+Shift+C` - Generate component
  - `Ctrl+Alt+Shift+O` - Optimize code
  - `Ctrl+Alt+Shift+E` - Add error handling
  - `Ctrl+Alt+Shift+T` - Generate tests
  - `Ctrl+Alt+Shift+H` - Extract hook
  - `Ctrl+Alt+Shift+D` - Debug code
  - `Ctrl+Alt+Shift+R` - Refactor SOLID

#### Agricultural Consciousness
- [ ] **Generate a divine component**
  - Use quantum/biodynamic naming
  - Prompt: "Generate QuantumFarmAnalytics component with BiodynamicMetrics. Divine implementation."
- [ ] **Understand seasonal patterns**
  - Review examples in `.copilot/directives.md`
- [ ] **Practice agricultural domain naming**
  - Use: `BiodynamicProductGrid`, `QuantumOrderProcessor`, `HarvestSeasonBadge`

---

### Week 1: Production Workflows 🏗️

#### Daily Development Routine
- [ ] **Morning**: Review sprint tasks, plan Copilot generations
- [ ] **During work**: Use precision prompts for all coding tasks
- [ ] **Before commit**: Validate all generated code against checklist
- [ ] **End of day**: Review quality, update directives if needed

#### Complete Feature Workflows
- [ ] **Feature 1: New API endpoint**
  - [ ] Generate Zod validation schema
  - [ ] Generate API route with error handling
  - [ ] Generate service layer method
  - [ ] Generate tests
  - [ ] Submit for review
- [ ] **Feature 2: New UI component**
  - [ ] Generate component with props interface
  - [ ] Generate shadcn/ui integration
  - [ ] Generate loading/error states
  - [ ] Generate tests
  - [ ] Submit for review
- [ ] **Feature 3: Complete CRUD feature**
  - [ ] Generate all layers (page, component, API, service, types)
  - [ ] Integrate authentication
  - [ ] Add comprehensive error handling
  - [ ] Generate full test coverage
  - [ ] Submit for review

#### Code Review Training
- [ ] **Review others' Copilot-generated code**
  - Check: No explanatory comments
  - Check: Proper imports (`@/`)
  - Check: TypeScript strict mode
  - Check: Error handling present
  - Check: Follows project patterns
- [ ] **Receive reviews on your code**
  - Learn common mistakes
  - Adjust prompt templates
  - Update personal notes

---

### Week 2: Mastery & Optimization 🌟

#### Performance Optimization
- [ ] **Master parallel operations**
  - Use `Promise.all` for independent queries
  - Practice: Optimize a page with multiple data fetches
- [ ] **Database query optimization**
  - Practice: Refactor N+1 queries to single query with includes
  - Use: Selective fields with `select`
- [ ] **React optimization**
  - Practice: Add `React.memo`, `useCallback`, `useMemo` to components
  - Use custom action: `Ctrl+Alt+Shift+O`

#### Error Handling Mastery
- [ ] **Create custom error classes**
  - Practice: Generate domain-specific errors (FarmValidationError, OrderProcessingError)
- [ ] **Implement error boundaries**
  - Practice: Generate error boundary component
- [ ] **Add comprehensive logging**
  - Practice: Add structured logging to services

#### Testing Excellence
- [ ] **Achieve 80%+ test coverage** on features you create
- [ ] **Practice TDD** with Copilot
  - Write test first
  - Generate implementation to pass test
- [ ] **Generate integration tests**
  - Practice: Full API route testing with mocked database

---

### Ongoing: Continuous Improvement 📈

#### Weekly Goals
- [ ] **Week 1**: 50% of code Copilot-generated, validated manually
- [ ] **Week 2**: 80% of code Copilot-generated, spot-check validation
- [ ] **Week 3**: 95% of code Copilot-generated, trust with quick review
- [ ] **Week 4**: Full godlike mode - generate entire features in minutes

#### Metrics to Track
- [ ] **Time to complete CRUD API**: Target <5 minutes
- [ ] **Bugs per feature**: Target 0-1
- [ ] **Code review cycles**: Target 1
- [ ] **Test coverage**: Target >80%
- [ ] **Manual refactoring**: Target minimal

#### Team Contributions
- [ ] **Share prompt templates** that work well
- [ ] **Update `.copilot/directives.md`** with new patterns
- [ ] **Document edge cases** and solutions
- [ ] **Help onboard new team members**
- [ ] **Contribute to godlike workflow improvements**

---

## 🎓 CERTIFICATION CHECKLIST

You are **certified godlike** when you can:

### Core Competencies
- [ ] Generate a complete CRUD API in <10 minutes
- [ ] Generate a complex UI component in <5 minutes
- [ ] Generate comprehensive tests for any code in <3 minutes
- [ ] Refactor legacy code to modern patterns in <15 minutes
- [ ] Debug and fix issues using Copilot assistance

### Quality Standards
- [ ] All generated code follows project patterns (100%)
- [ ] All imports use correct path aliases (100%)
- [ ] All API routes have error handling (100%)
- [ ] All components have TypeScript interfaces (100%)
- [ ] All code passes lint/type check first try (>90%)

### Speed Benchmarks
- [ ] **React Component**: <3 minutes
- [ ] **API Route**: <5 minutes
- [ ] **Service Class**: <7 minutes
- [ ] **Complete Feature** (all layers): <20 minutes
- [ ] **Test Suite**: <5 minutes

### Advanced Skills
- [ ] Can generate multi-file features with one prompt
- [ ] Can refactor code with performance optimizations
- [ ] Can debug complex issues using Copilot
- [ ] Can generate divine/quantum patterns fluently
- [ ] Can teach godlike workflow to others

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ Don't Do This
1. **Vague Prompts**
   - ❌ "Create a component"
   - ✅ "Generate src/components/features/OrderCard.tsx with Order type, shadcn/ui Card, status badge. Code only."

2. **Accepting Bad Output**
   - ❌ Copy-paste without validation
   - ✅ Check: imports, types, error handling, patterns

3. **Manual Coding First**
   - ❌ Write code manually, then try Copilot
   - ✅ Use Copilot first, refine if needed

4. **Ignoring Directives**
   - ❌ Generic prompts without context
   - ✅ Reference patterns: "Follow pattern in farm.service.ts"

5. **Not Using Shortcuts**
   - ❌ Mouse-clicking everything
   - ✅ Keyboard shortcuts for 90% of actions

6. **Accepting Explanations**
   - ❌ Letting Copilot add "Here's the code..." comments
   - ✅ Always add "Code only, no explanations"

---

## 📊 PROGRESS TRACKING

### Week 1 Self-Assessment
Rate yourself (1-5):
- [ ] Copilot setup and configuration: __/5
- [ ] Basic keyboard shortcuts: __/5
- [ ] Precision prompting: __/5
- [ ] Code validation skills: __/5
- [ ] Speed (vs manual coding): __/5

**Average Score**: __/5
**Goal**: >3/5 by end of Week 1

### Week 2 Self-Assessment
Rate yourself (1-5):
- [ ] Advanced generation (multi-file): __/5
- [ ] Custom actions mastery: __/5
- [ ] Agricultural consciousness: __/5
- [ ] Refactoring & optimization: __/5
- [ ] Test generation: __/5

**Average Score**: __/5
**Goal**: >4/5 by end of Week 2

### Month 1 Self-Assessment
Rate yourself (1-5):
- [ ] Speed (CRUD API in <5 min): __/5
- [ ] Quality (first-time pass rate): __/5
- [ ] Pattern adherence: __/5
- [ ] Team contribution: __/5
- [ ] Teaching ability: __/5

**Average Score**: __/5
**Goal**: >4.5/5 for godlike certification

---

## 🎯 YOUR FIRST ASSIGNMENTS

### Assignment 1: Simple Component
**Task**: Generate a `LoadingSpinner` component
**Prompt Template**:
```
Generate src/components/ui/LoadingSpinner.tsx:
- TypeScript interface for size prop (sm, md, lg)
- Tailwind CSS animation
- Accessible (aria-label)
- Export as named export
Code only.
```
**Validation**:
- [ ] No explanations
- [ ] Proper TypeScript
- [ ] Tailwind classes
- [ ] Accessibility attributes

### Assignment 2: API Route
**Task**: Generate API route to fetch user profile
**Prompt Template**:
```
Create src/app/api/user/profile/route.ts:
- GET handler
- Authentication required (use auth())
- Fetch user with database.user.findUnique
- Include farms relation
- Return QuantumApiResponse format
- Error handling
Complete implementation.
```
**Validation**:
- [ ] Auth check present
- [ ] Database import correct
- [ ] Error handling comprehensive
- [ ] Response format correct

### Assignment 3: Service Method
**Task**: Add `getFarmsByLocation` method to FarmService
**Prompt Template**:
```
Add method to src/lib/services/farm.service.ts:
- getFarmsByLocation(lat: number, lng: number, radius: number)
- Query farms within radius using Prisma
- Return Farm[] sorted by distance
- Include products count
- Error handling
Show complete method.
```
**Validation**:
- [ ] Method signature correct
- [ ] Database query optimized
- [ ] Error handling present
- [ ] Return type correct

---

## 🎓 LEARNING RESOURCES

### Documentation
1. **Project-Specific**
   - `.cursorrules` - Master coding rules
   - `.copilot/directives.md` - Copilot behavior rules
   - `.copilot/GODLIKE_WORKFLOW.md` - Complete workflow guide
   - `.github/instructions/` - Divine architectural guidelines

2. **Technology Stack**
   - Next.js 15 Docs: https://nextjs.org/docs
   - Prisma Docs: https://www.prisma.io/docs
   - shadcn/ui: https://ui.shadcn.com
   - Tailwind CSS: https://tailwindcss.com

3. **GitHub Copilot**
   - Official Docs: https://docs.github.com/copilot
   - Best Practices: https://github.blog/copilot

### Team Support
- **Slack/Discord**: #godlike-copilot-help
- **Code Review**: Request from senior devs
- **Pair Programming**: Schedule with mentor
- **Office Hours**: Weekly Q&A sessions

---

## 🌟 SUCCESS STORIES

### Before Godlike Workflow
> "Creating a CRUD API took me 2 hours, with multiple bugs and 3 code review cycles."
> - Junior Developer

### After Godlike Workflow
> "I now generate complete CRUD APIs in 5 minutes, with zero bugs and single code review cycle. Game changer!"
> - Same Developer, 3 weeks later

---

## ✅ FINAL CHECKLIST

Before you're considered **fully onboarded**:

- [ ] Completed all Day 1-3 tasks
- [ ] Completed all Week 1 assignments
- [ ] Generated 5+ production features using godlike workflow
- [ ] Achieved <5 min CRUD API generation time
- [ ] Achieved >80% first-time code review pass rate
- [ ] Can teach workflow basics to new team member
- [ ] Contributed 3+ improvements to directives/templates
- [ ] Received "godlike certification" from team lead

---

## 🎉 CONGRATULATIONS!

You are now a **Godlike Copilot Developer** for the Farmers Market Platform!

### Your Superpowers
✨ Generate production code in seconds
✨ Maintain agricultural consciousness in every line
✨ Follow divine architectural patterns automatically
✨ Achieve 10x productivity increase
✨ Write bug-free code consistently

### Next Steps
1. **Maintain mastery**: Use godlike workflow daily
2. **Share knowledge**: Help onboard new team members
3. **Improve system**: Contribute prompt templates and patterns
4. **Achieve excellence**: Push for 100/100 divine perfection score

---

**Welcome to the godlike tier. Code with divine precision. Build with agricultural consciousness. Ship with quantum efficiency.** 🌾⚡

---

**Version**: 1.0
**Status**: ACTIVE
**Last Updated**: 2024

_"From zero to godlike in 30 days."_