# 📋 Code Review Standards & Guidelines

**Last Updated:** January 10, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Standard  
**Applies To:** All pull requests and code contributions

---

## 📋 Table of Contents

- [Overview](#overview)
- [Code Review Philosophy](#code-review-philosophy)
- [Review Process](#review-process)
- [Review Checklist](#review-checklist)
- [What to Look For](#what-to-look-for)
- [How to Give Feedback](#how-to-give-feedback)
- [How to Receive Feedback](#how-to-receive-feedback)
- [Response Time Guidelines](#response-time-guidelines)
- [PR Templates](#pr-templates)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Anti-Patterns](#anti-patterns)
- [Examples](#examples)

---

## 🎯 Overview

Code reviews are a critical part of maintaining code quality, sharing knowledge, and ensuring the long-term health of the Farmers Market Platform. This guide establishes standards for conducting and participating in code reviews.

### Goals of Code Review

1. **Quality Assurance** - Catch bugs and issues early
2. **Knowledge Sharing** - Spread understanding across the team
3. **Consistency** - Maintain coding standards and patterns
4. **Learning** - Grow skills for both reviewer and author
5. **Documentation** - Capture decisions and context
6. **Team Building** - Foster collaboration and trust

### Core Principles

- 🤝 **Respectful** - Critique code, not people
- 🎯 **Constructive** - Provide actionable feedback
- 📚 **Educational** - Share knowledge and context
- ⚡ **Timely** - Review promptly to unblock work
- 🔍 **Thorough** - Don't rubber-stamp approvals
- 💡 **Collaborative** - Work together to find solutions

---

## 🧠 Code Review Philosophy

### The Farmers Market Way

> "Every code review is an opportunity to elevate the codebase and grow as a team."

**We believe:**
- Code reviews are a conversation, not a gate
- Teaching is more valuable than finding fault
- Small, frequent PRs are better than large, rare ones
- Context and "why" matter as much as "what"
- It's okay to ask questions and admit uncertainty

**We avoid:**
- Nitpicking minor style issues (use automated tools)
- Blocking PRs for personal preferences
- Rewriting code in our own style
- Harsh or dismissive language
- Leaving PRs unreviewed for extended periods

---

## 🔄 Review Process

### PR Lifecycle

```
┌─────────────────┐
│  Author Creates │
│       PR        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CI/CD Checks   │
│      Run        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Reviewers     │
│    Assigned     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Review       │
│   Conducted     │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────┐
│Needs│   │  ✅  │
│Work │   │Approved
└──┬──┘   └──┬──┘
   │         │
   ▼         ▼
┌─────────────────┐
│  Author Fixes   │
│   or Merges     │
└─────────────────┘
```

### Required Reviewers

| PR Type | Required Approvals | Reviewers |
|---------|-------------------|-----------|
| Feature | 2 | Any senior+ developers |
| Bugfix | 1 | Any developer |
| Hotfix | 1 | Tech lead or senior |
| Docs | 1 | Any team member |
| Refactor | 2 | Senior+ developers |
| Breaking Change | 3 | Tech lead + 2 seniors |

### Review Stages

#### Stage 1: Automated Checks (1-3 minutes)
- ✅ TypeScript type checking
- ✅ ESLint rules
- ✅ Prettier formatting
- ✅ Unit tests pass
- ✅ Integration tests pass
- ✅ Build succeeds

**If any fail:** Fix before requesting review

#### Stage 2: Self-Review (5-10 minutes)
**Author reviews their own PR:**
- Re-read all changed code
- Check commit messages
- Verify PR description is complete
- Test locally one more time
- Add screenshots/videos if UI changes
- Ensure tests are included

#### Stage 3: Peer Review (15-30 minutes)
**Reviewers conduct thorough review:**
- Read PR description and context
- Review code changes
- Check tests
- Verify documentation
- Test locally if needed
- Provide feedback

#### Stage 4: Response (varies)
**Author addresses feedback:**
- Respond to all comments
- Make requested changes
- Mark resolved conversations
- Re-request review if needed

#### Stage 5: Approval & Merge
**After approval:**
- Ensure CI is green
- Squash or rebase as needed
- Merge to main
- Delete branch
- Close related issues

---

## ✅ Review Checklist

### For Reviewers

Copy this checklist into your review:

```markdown
## Code Review Checklist

### Functionality
- [ ] Code does what the PR says it does
- [ ] Edge cases are handled
- [ ] Error handling is comprehensive
- [ ] No obvious bugs or logic errors

### Architecture & Design
- [ ] Follows project patterns and conventions
- [ ] Code is in the right place (proper directory)
- [ ] Appropriate level of abstraction
- [ ] No unnecessary complexity
- [ ] Follows SOLID principles

### Code Quality
- [ ] Code is readable and self-documenting
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Proper naming (clear, descriptive)
- [ ] Comments explain "why", not "what"

### TypeScript
- [ ] No `any` types (use `unknown` if needed)
- [ ] Proper type definitions
- [ ] Type-only imports used (`import type`)
- [ ] No TypeScript errors or warnings
- [ ] Generic types used appropriately

### React/Next.js
- [ ] Server Components used by default
- [ ] `"use client"` only when necessary
- [ ] No prop drilling (use context if needed)
- [ ] Proper async/await handling
- [ ] Server Actions used for mutations
- [ ] No useEffect for data fetching

### Database (Prisma)
- [ ] Uses `@/lib/database` import (not new PrismaClient)
- [ ] Queries are optimized (no N+1)
- [ ] Proper error handling
- [ ] Transactions used where appropriate
- [ ] Migrations included if schema changed

### Security
- [ ] Input validation (Zod schemas)
- [ ] Authentication checks present
- [ ] Authorization verified
- [ ] No sensitive data in logs/responses
- [ ] SQL injection prevented (Prisma handles this)
- [ ] XSS prevention (React handles this)

### Performance
- [ ] No unnecessary re-renders
- [ ] Queries are efficient
- [ ] Large lists are paginated
- [ ] Images are optimized
- [ ] Code splitting used appropriately
- [ ] Caching implemented where beneficial

### Testing
- [ ] Unit tests for business logic
- [ ] Component tests for UI
- [ ] Integration tests for API routes
- [ ] Tests are meaningful (not just coverage)
- [ ] Test coverage ≥ 80%
- [ ] Edge cases tested

### Documentation
- [ ] PR description is clear and complete
- [ ] Complex code has JSDoc comments
- [ ] README updated if needed
- [ ] API docs updated (OpenAPI spec)
- [ ] Breaking changes documented
- [ ] Migration guide included if needed

### Git Hygiene
- [ ] Commit messages are descriptive
- [ ] No merge commits (rebase instead)
- [ ] No debug/console.log statements
- [ ] No commented-out code
- [ ] No unused imports
- [ ] Branch is up to date with main
```

---

## 🔍 What to Look For

### Critical Issues (Must Fix)

**🔴 P0 - Block Merge**
- Security vulnerabilities
- Data loss risks
- Performance regressions
- Breaking changes without migration
- Failing tests
- TypeScript errors
- Logic errors or bugs

### Important Issues (Should Fix)

**🟠 P1 - Should Address**
- Code duplication
- Poor error handling
- Missing tests
- Poor naming
- Unclear logic
- Missing documentation
- Accessibility issues

### Suggestions (Nice to Have)

**🟡 P2 - Consider**
- Performance optimizations
- Refactoring opportunities
- Alternative approaches
- Best practice improvements
- Code simplification

### Nitpicks (Optional)

**🔵 P3 - Optional**
- Minor style preferences
- Naming suggestions
- Code organization
- Comment clarity

**Note:** Use automated tools (ESLint, Prettier) for style, not PR reviews.

---

## 💬 How to Give Feedback

### Feedback Framework

Use this structure for comments:

```
[Type] [Severity] Issue/Observation

Explanation of why this matters.

Suggested solution or alternative.
```

**Example:**
```
🔴 P0 - Security: Unvalidated user input

This endpoint accepts user input without validation, which could lead to 
SQL injection or XSS attacks.

Suggestion: Add Zod schema validation before processing input.
```

### Comment Types

#### 1. Questions
```
❓ Question: Why is this using client component?

I see this is marked "use client" but I don't see any hooks or 
interactivity. Could this be a server component?
```

#### 2. Suggestions
```
💡 Suggestion: Consider using Promise.all for parallel queries

These queries don't depend on each other. Running them in parallel 
with Promise.all would improve performance.

const [farms, products] = await Promise.all([
  getFarms(),
  getProducts()
]);
```

#### 3. Observations
```
👀 Observation: This pattern is used elsewhere

I noticed we're solving this problem differently in the products 
feature. Should we align these approaches?

See: src/features/products/hooks/useProducts.ts
```

#### 4. Learning
```
🎓 Learning: TypeScript discriminated unions

Great use of discriminated unions here! This ensures type safety 
at runtime. For others reading: this is the pattern to use for 
state machines.
```

#### 5. Nitpicks
```
🔵 Nitpick: Naming could be more descriptive

Consider `getUserActiveFarms` instead of `getFarms` to clarify 
that this only returns active farms for the current user.
```

### Language Guidelines

#### ✅ Do Use:
- "What do you think about...?"
- "Have you considered...?"
- "Could we...?"
- "I'm wondering if..."
- "This could be clearer by..."
- "Let's discuss..."

#### ❌ Avoid:
- "You should..."
- "This is wrong"
- "Why didn't you...?"
- "Obviously..."
- "Just..."
- "Everyone knows..."

### Praise Good Code

**Always acknowledge good work:**
```
✨ Great work on the error handling here! This covers all the edge 
cases I can think of, and the error messages are really helpful 
for debugging.
```

```
🎯 Perfect use of server components. This will be much faster than 
the old client-side approach.
```

```
📚 Excellent documentation! The JSDoc comments make it really clear 
how to use this function.
```

---

## 🎯 How to Receive Feedback

### Mindset

- ✅ Feedback is a gift, not criticism
- ✅ Questions are opportunities to clarify
- ✅ Disagreement is healthy and productive
- ✅ Learning is more important than being right
- ✅ Multiple approaches can be valid

### Responding to Comments

#### 1. Acknowledge and Act
```
Good catch! I'll add the validation schema.
```

#### 2. Explain Your Reasoning
```
I chose client component here because we'll be adding real-time 
updates via WebSocket in the next sprint. Want to avoid the 
refactor later.
```

#### 3. Ask for Clarification
```
Can you elaborate on the concern about performance? I'm not seeing 
where the bottleneck would be.
```

#### 4. Propose Alternatives
```
That's a valid point. What if we:
1. Extract this to a hook
2. Add caching

Would that address the concern?
```

#### 5. Defer if Appropriate
```
Great idea! This is out of scope for this PR, but I'll create an 
issue to track it.

Issue: #123
```

### When to Push Back

**It's okay to disagree when:**
- Feedback is based on personal preference, not standards
- Alternative approach has clear tradeoffs you've considered
- Suggestion would increase complexity without benefit
- Change is out of scope for the PR

**How to push back respectfully:**
```
I understand your concern about X. However, I chose Y because:
1. Reason 1
2. Reason 2

I'm open to discussing further, but I believe Y is the right 
approach here because [explain tradeoffs].
```

---

## ⏱️ Response Time Guidelines

### For Reviewers

| PR Type | Response Time | Target |
|---------|--------------|--------|
| Hotfix | 1 hour | Critical bugs |
| Small (<100 lines) | 4 hours | Same day |
| Medium (<500 lines) | 1 day | Next day |
| Large (>500 lines) | 2 days | Within week |

**If you can't review in time:**
- Comment with expected review time
- Suggest alternative reviewer
- Remove yourself as reviewer

### For Authors

| Action | Response Time |
|--------|--------------|
| Answer questions | Same day |
| Address blocking feedback | Same day |
| Address suggestions | 2 days |
| Re-request review | After all changes |

---

## 📝 PR Templates

### Feature PR Template

```markdown
## 🎯 What

Brief description of what this PR does.

## 🤔 Why

Why is this change needed? What problem does it solve?

Closes #123

## 🔨 Changes

- Change 1
- Change 2
- Change 3

## 🧪 Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manually tested locally
- [ ] Tested in production-like environment

## 📸 Screenshots

Before:
[screenshot]

After:
[screenshot]

## 🚀 Deployment

- [ ] No breaking changes
- [ ] Database migrations included
- [ ] Environment variables documented
- [ ] Feature flag added (if applicable)

## 📚 Documentation

- [ ] README updated
- [ ] API docs updated
- [ ] Code comments added
- [ ] Migration guide written (if breaking)

## ✅ Checklist

- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] No TypeScript errors
- [ ] Self-reviewed PR
- [ ] PR description is complete
```

### Bugfix PR Template

```markdown
## 🐛 Bug

Describe the bug being fixed.

Fixes #123

## 🔍 Root Cause

What was causing the bug?

## ✅ Solution

How does this fix it?

## 🧪 Testing

- [ ] Added regression test
- [ ] Verified fix locally
- [ ] Tested related functionality

## 📊 Impact

- Who is affected?
- Severity: [Low/Medium/High/Critical]
- Workaround exists: [Yes/No]
```

### Refactor PR Template

```markdown
## ♻️ Refactor

What is being refactored?

## 🎯 Goals

- Goal 1
- Goal 2
- Goal 3

## 🔄 Changes

- Before: [description]
- After: [description]

## ✅ Verification

- [ ] Functionality unchanged
- [ ] Tests still pass
- [ ] Performance not degraded
- [ ] No breaking changes

## 📊 Metrics

- Lines changed: X
- Test coverage: X%
- Performance impact: [None/Improved/Same]
```

---

## 🎯 Best Practices

### For Authors

#### Before Creating PR

1. **Self-review thoroughly**
   ```bash
   git diff main...your-branch
   ```

2. **Run all checks locally**
   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run build
   ```

3. **Write clear PR description**
   - What changed
   - Why it changed
   - How to test
   - Impact and risks

4. **Keep PRs small**
   - Target: <300 lines changed
   - Max: <500 lines
   - Break large changes into multiple PRs

5. **Include tests**
   - Unit tests for logic
   - Component tests for UI
   - Integration tests for APIs

#### During Review

1. **Respond promptly**
   - Within same day for questions
   - Within 2 days for changes

2. **Engage constructively**
   - Thank reviewers for feedback
   - Explain your reasoning
   - Ask questions if unclear

3. **Don't take it personally**
   - Feedback is about code, not you
   - Use it as learning opportunity

4. **Mark conversations resolved**
   - After addressing feedback
   - Leave comment explaining what you did

### For Reviewers

#### Review Strategy

1. **Start with PR description**
   - Understand what and why
   - Check if approach makes sense

2. **Review at different levels**
   - Architecture (high-level)
   - Implementation (code-level)
   - Details (edge cases)

3. **Test locally for complex changes**
   ```bash
   git fetch origin
   git checkout origin/branch-name
   npm install
   npm run dev
   ```

4. **Use GitHub features**
   - Suggest changes for small fixes
   - Start review (don't comment individually)
   - Use line comments for specific issues
   - Use PR comments for general feedback

#### Review Efficiency

**Quick Review (<100 lines):**
- Focus on logic and correctness
- Check tests exist
- Verify no security issues
- 10-15 minutes

**Standard Review (100-300 lines):**
- Check architecture
- Review implementation
- Verify tests are comprehensive
- Test locally if UI changes
- 20-30 minutes

**Deep Review (>300 lines):**
- Request PR be split if possible
- Schedule dedicated review time
- Test thoroughly
- May require multiple review sessions
- 1+ hour

---

## 🏗️ Common Patterns

### Database Access Pattern

**✅ Correct:**
```typescript
// Always use the database singleton
import { database } from "@/lib/database";

export async function getFarm(id: string) {
  return await database.farm.findUnique({
    where: { id },
    include: { owner: true, products: true }
  });
}
```

**❌ Incorrect:**
```typescript
// Never create new PrismaClient instances
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getFarm(id: string) {
  return await prisma.farm.findUnique({ where: { id } });
}
```

### Server vs Client Components

**✅ Correct:**
```typescript
// Server component by default
export default async function FarmPage({ params }: Props) {
  const farm = await getFarm(params.id);
  return <FarmDetails farm={farm} />;
}

// Client only when needed
"use client";
export function InteractiveMap({ location }: Props) {
  const [zoom, setZoom] = useState(13);
  // Interactive logic
}
```

**❌ Incorrect:**
```typescript
// Unnecessary "use client"
"use client";
export default function FarmPage({ params }: Props) {
  // No hooks, no interactivity - should be server component
  return <div>{params.id}</div>;
}
```

### Error Handling

**✅ Correct:**
```typescript
export async function createFarm(data: CreateFarmInput) {
  try {
    const validated = CreateFarmSchema.parse(data);
    const farm = await database.farm.create({ data: validated });
    return { success: true, data: farm };
  } catch (error) {
    if (error instanceof ZodError) {
      return { 
        success: false, 
        error: { code: 'VALIDATION_ERROR', details: error.flatten() }
      };
    }
    logger.error('Farm creation failed', { error });
    return { 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create farm' }
    };
  }
}
```

**❌ Incorrect:**
```typescript
export async function createFarm(data: any) {
  // No try-catch
  // No validation
  // No error handling
  const farm = await database.farm.create({ data });
  return farm;
}
```

---

## 🚫 Anti-Patterns

### Code Smells to Flag

1. **Large Functions**
   ```typescript
   // ❌ Function doing too much (>50 lines)
   function processOrder() {
     // 200 lines of logic
   }
   
   // ✅ Break into smaller functions
   function processOrder() {
     validateOrder();
     calculateTotal();
     processPayment();
     createShipment();
     sendNotification();
   }
   ```

2. **Nested Callbacks**
   ```typescript
   // ❌ Callback hell
   getData((data) => {
     process(data, (result) => {
       save(result, (saved) => {
         notify(saved);
       });
     });
   });
   
   // ✅ Use async/await
   const data = await getData();
   const result = await process(data);
   const saved = await save(result);
   await notify(saved);
   ```

3. **Magic Numbers**
   ```typescript
   // ❌ Magic numbers
   if (items.length > 100) {
     paginate();
   }
   
   // ✅ Named constants
   const MAX_ITEMS_PER_PAGE = 100;
   if (items.length > MAX_ITEMS_PER_PAGE) {
     paginate();
   }
   ```

4. **God Objects**
   ```typescript
   // ❌ Class doing everything
   class FarmManager {
     createFarm() {}
     updateFarm() {}
     deleteFarm() {}
     addProduct() {}
     removeProduct() {}
     processOrder() {}
     sendNotification() {}
     // 50 more methods...
   }
   
   // ✅ Single Responsibility
   class FarmService {
     create() {}
     update() {}
     delete() {}
   }
   class ProductService {
     add() {}
     remove() {}
   }
   ```

5. **Premature Optimization**
   ```typescript
   // ❌ Complex caching before measuring
   const cache = new LRU({ max: 1000 });
   const memoized = memoize(expensiveFunction, {
     maxAge: 5000,
     normalizer: customNormalizer
   });
   
   // ✅ Start simple, optimize if needed
   async function getFarm(id: string) {
     return await database.farm.findUnique({ where: { id } });
   }
   // Add caching only if profiling shows it's needed
   ```

---

## 📚 Examples

### Example 1: Security Issue

**Code:**
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const user = await database.user.create({ data: body });
  return Response.json({ user });
}
```

**Review Comment:**
```
🔴 P0 - Security: Unvalidated user input

This endpoint accepts raw JSON without validation, which could allow:
1. Mass assignment attacks (user setting admin=true)
2. Type confusion errors
3. SQL injection via malformed input

Suggestion: Add Zod validation before database operation:

import { CreateUserSchema } from '@/lib/validators/user.validator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateUserSchema.parse(body);
    const user = await database.user.create({ data: validated });
    return Response.json({ success: true, user });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { success: false, error: error.flatten() },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### Example 2: Performance Issue

**Code:**
```typescript
export async function getFarmsWithProducts() {
  const farms = await database.farm.findMany();
  
  for (const farm of farms) {
    farm.products = await database.product.findMany({
      where: { farmId: farm.id }
    });
  }
  
  return farms;
}
```

**Review Comment:**
```
🟠 P1 - Performance: N+1 query pattern

This creates N+1 queries (1 for farms, then 1 for each farm's products).
For 100 farms, that's 101 database round trips.

Suggestion: Use Prisma's include to fetch in single query:

export async function getFarmsWithProducts() {
  return await database.farm.findMany({
    include: {
      products: {
        where: { status: 'ACTIVE' },
        take: 10
      }
    }
  });
}

This reduces to 1 query with a JOIN, significantly faster.
```

### Example 3: Good Code Praise

**Code:**
```typescript
export async function processRefund(orderId: string) {
  return await database.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' }
    });
    
    await tx.payment.create({
      data: {
        orderId,
        amount: -order.total,
        type: 'REFUND'
      }
    });
    
    await tx.inventory.updateMany({
      where: { orderId },
      data: { status: 'RETURNED' }
    });
    
    return order;
  });
}
```

**Review Comment:**
```
✨ Excellent use of transactions!

This properly handles the atomicity requirement for refunds:
1. Updates order status
2. Records refund payment
3. Returns inventory

If any step fails, everything rolls back. This prevents partial 
refunds which would be a nightmare to debug. Great work! 💯
```

---

## 🎓 Learning Resources

### Internal Resources
- [Developer Onboarding](./DEVELOPER_ONBOARDING.md)
- [Architecture Overview](../architecture/OVERVIEW.md)
- [Testing Standards](../testing/STANDARDS.md)
- [Coding Standards](../../.cursorrules)

### External Resources
- [Google Code Review Guidelines](https://google.github.io/eng-practices/review/)
- [Conventional Comments](https://conventionalcomments.org/)
- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/)

---

## ✅ Checklist for This Document

Use this document as a reference when:
- [ ] Conducting a code review
- [ ] Submitting a pull request
- [ ] Responding to review feedback
- [ ] Onboarding new team members
- [ ] Establishing team norms
- [ ] Resolving review conflicts

---

## 🎯 Success Metrics

We track code review effectiveness through:

| Metric | Target | Actual |
|--------|--------|--------|
| Review response time | <24h | - |
| PR cycle time | <3 days | - |
| Bugs caught in review | >80% | - |
| PRs merged first time | >60% | - |
| Review iterations | <3 | - |

---

## 📞 Questions?

If you have questions about these standards:

1. Ask in team chat
2. Bring up in team meetings
3. Create an issue for clarification
4. Suggest improvements via PR

**These standards are living documents.** Please help improve them!

---

**Remember:**

> "The goal of code review is not to find someone to blame, but to find ways to improve the code and the team." 🌾

---

**Version:** 1.0.0  
**Last Updated:** January 10, 2025  
**Maintained By:** Development Team  
**Next Review:** April 2025