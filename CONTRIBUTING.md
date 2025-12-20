# 🤝 Contributing to Farmers Market Platform

> **Welcome! We're excited that you want to contribute to making local agriculture more accessible.**

Thank you for considering contributing to the Farmers Market Platform! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Community](#community)

---

## 🌟 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and considerate in all interactions.

### Our Standards

**Positive behaviors include:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behaviors include:**

- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct that would be inappropriate in a professional setting

### Enforcement

Violations of the code of conduct may result in temporary or permanent bans from the project. Report issues to: conduct@farmersmarket.com

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/farmers-market.git
cd "Farmers Market Platform web and app"

# Add upstream remote
git remote add upstream https://github.com/gogsia86/farmers-market.git
```

### 2. Setup Development Environment

Follow our [Quick Start Guide](./QUICK_START.md) to set up your local development environment.

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup
npm run db:seed

# Start development server
npm run dev
```

### 3. Create Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout master
git merge upstream/master

# Create feature branch
git checkout -b feature/your-feature-name
```

---

## 🔄 Development Workflow

### Branch Naming Convention

Use clear, descriptive branch names following these patterns:

```
feature/   - New features
fix/       - Bug fixes
docs/      - Documentation updates
refactor/  - Code refactoring
test/      - Test additions/updates
chore/     - Maintenance tasks
perf/      - Performance improvements
style/     - Code style changes
```

**Examples:**

```
feature/farmer-subscription-tiers
fix/payment-webhook-validation
docs/api-endpoint-examples
refactor/order-service-architecture
test/farm-profile-e2e
```

### Development Process

1. **Create Issue First** (for non-trivial changes)
   - Describe the problem or feature
   - Discuss approach with maintainers
   - Get approval before starting work

2. **Write Code**
   - Follow coding standards (see below)
   - Write tests for new code
   - Update documentation

3. **Test Thoroughly**
   - Run all tests: `npm test`
   - Check types: `npm run type-check`
   - Lint code: `npm run lint`
   - Test manually in browser

4. **Commit Changes**
   - Follow commit guidelines (see below)
   - Keep commits atomic and focused
   - Write clear commit messages

5. **Submit Pull Request**
   - Follow PR template
   - Request review from maintainers
   - Address feedback promptly

---

## 📏 Coding Standards

### Divine Agricultural Patterns

This project follows the **Divine Agricultural Patterns** defined in our [.cursorrules](./.cursorrules) and [.github/instructions/](./.github/instructions/). Please familiarize yourself with these guidelines.

### TypeScript Best Practices

#### ✅ DO: Use Strict Type Safety

```typescript
// ✅ GOOD - Proper types
interface CreateFarmRequest {
  name: string;
  location: Location;
  ownerId: string;
}

async function createFarm(request: CreateFarmRequest): Promise<Farm> {
  // Implementation
}

// ❌ BAD - Using 'any'
async function createFarm(request: any): Promise<any> {
  // Type safety lost
}
```

#### ✅ DO: Use Path Aliases

```typescript
// ✅ GOOD - Using configured aliases
import { database } from "@/lib/database";
import { FarmService } from "@/lib/services/farm.service";
import type { Farm } from "@/types";

// ❌ BAD - Relative paths
import { database } from "../../../../lib/database";
```

#### ✅ DO: Use Canonical Database Import

```typescript
// ✅ GOOD - Canonical import
import { database } from "@/lib/database";

// ❌ BAD - Creating new instances
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(); // DON'T DO THIS
```

### Component Patterns

#### Server Components (Default)

```typescript
// app/farms/[id]/page.tsx
export default async function FarmPage({
  params
}: {
  params: { id: string }
}) {
  // Direct database access - runs on server
  const farm = await database.farm.findUnique({
    where: { id: params.id },
    include: { products: true }
  });

  return <FarmProfile farm={farm} />;
}
```

#### Client Components

```typescript
// components/InteractiveMap.tsx
"use client";

import { useState } from "react";

export function InteractiveMap({ location }: { location: Location }) {
  const [zoom, setZoom] = useState(13);
  // Client-side interactivity
  return <Map location={location} zoom={zoom} />;
}
```

### Service Layer Pattern

```typescript
// lib/services/farm.service.ts
export class FarmService {
  async createFarm(farmData: CreateFarmRequest): Promise<Farm> {
    // Validation
    await this.validateFarmData(farmData);

    // Database operation
    const farm = await database.farm.create({
      data: {
        ...farmData,
        slug: generateSlug(farmData.name),
        status: "PENDING_VERIFICATION",
      },
    });

    return farm;
  }

  private async validateFarmData(data: CreateFarmRequest): Promise<void> {
    // Validation logic
  }
}
```

### Error Handling

```typescript
// ✅ GOOD - Descriptive errors
export class FarmValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any,
  ) {
    super(message);
    this.name = "FarmValidationError";
  }
}

// Usage
if (farmName.length < 3) {
  throw new FarmValidationError(
    "Farm name must be at least 3 characters",
    "name",
    farmName,
  );
}
```

---

## 🧪 Testing Requirements

### Test Coverage Requirements

- **Unit Tests:** Business logic must have >80% coverage
- **Integration Tests:** All API routes must be tested
- **E2E Tests:** Critical user flows must be covered

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- farm.service.test.ts

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

#### Unit Test Example

```typescript
// lib/services/farm.service.test.ts
describe("FarmService", () => {
  describe("createFarm", () => {
    it("should create a farm with valid data", async () => {
      const farmData = {
        name: "Test Farm",
        location: { address: "123 Farm Rd" },
        ownerId: "user123",
      };

      const farm = await farmService.createFarm(farmData);

      expect(farm).toBeDefined();
      expect(farm.name).toBe("Test Farm");
      expect(farm.status).toBe("PENDING_VERIFICATION");
    });

    it("should throw ValidationError when name is too short", async () => {
      const farmData = {
        name: "AB",
        location: { address: "123 Farm Rd" },
        ownerId: "user123",
      };

      await expect(farmService.createFarm(farmData)).rejects.toThrow(
        FarmValidationError,
      );
    });
  });
});
```

#### Integration Test Example

```typescript
// app/api/farms/route.test.ts
describe("POST /api/farms", () => {
  it("should create a new farm", async () => {
    const response = await fetch("/api/farms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        name: "Test Farm",
        location: { address: "123 Farm Rd" },
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.farm.name).toBe("Test Farm");
  });
});
```

---

## 💬 Commit Guidelines

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type       | Description             | Example                                           |
| ---------- | ----------------------- | ------------------------------------------------- |
| `feat`     | New feature             | `feat(farms): add biodynamic certification badge` |
| `fix`      | Bug fix                 | `fix(payment): resolve Stripe webhook validation` |
| `docs`     | Documentation           | `docs(testing): update E2E testing guide`         |
| `style`    | Code style/formatting   | `style(components): format with Prettier`         |
| `refactor` | Code restructuring      | `refactor(orders): simplify order processing`     |
| `perf`     | Performance improvement | `perf(search): optimize farm query`               |
| `test`     | Test additions/updates  | `test(orders): add cancellation tests`            |
| `chore`    | Maintenance tasks       | `chore(deps): update dependencies`                |
| `ci`       | CI/CD changes           | `ci(github): add test workflow`                   |
| `build`    | Build system changes    | `build(webpack): optimize bundle size`            |

### Commit Message Examples

**Good:**

```
feat(farms): add organic certification verification

- Add certification upload form
- Implement verification workflow
- Send notification to admin
- Update farm profile UI

Closes #123
```

**Bad:**

```
update stuff
```

### Commit Best Practices

- ✅ Use present tense ("add feature" not "added feature")
- ✅ Use imperative mood ("move cursor to..." not "moves cursor to...")
- ✅ Keep subject line under 72 characters
- ✅ Reference issues and PRs in footer
- ✅ Explain _what_ and _why_, not _how_

---

## 🔍 Pull Request Process

### Before Submitting

**Checklist:**

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code follows style guidelines
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention
- [ ] Branch is up to date with `master`
- [ ] Self-reviewed the changes
- [ ] Added tests for new functionality

### PR Template

When creating a PR, use this template:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that breaks existing functionality)
- [ ] Documentation update

## Related Issues

Closes #123
Relates to #456

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manually tested

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process

1. **Automated Checks:** CI/CD runs tests, linting, type-checking
2. **Code Review:** 1+ maintainer reviews code
3. **Feedback:** Address comments and suggestions
4. **Approval:** Maintainer approves PR
5. **Merge:** PR merged to `master`

### Review Response Time

- **Initial Review:** Within 48 hours
- **Follow-up:** Within 24 hours
- **Merge:** After approval and passing checks

---

## 📚 Documentation

### When to Update Documentation

Update documentation when you:

- Add new features
- Change API endpoints
- Modify configuration
- Fix significant bugs
- Add new dependencies
- Change deployment process

### Documentation Standards

**Be Clear and Concise:**

```markdown
✅ GOOD:

## Installation

Run `npm install` to install dependencies.

❌ BAD:

## Installation

You might want to possibly consider running the npm install command
if you want to maybe install the dependencies for the project.
```

**Include Code Examples:**

````markdown
✅ GOOD:

### Create a Farm

```typescript
const farm = await farmService.createFarm({
  name: "Green Valley Farm",
  location: { address: "123 Farm Rd" },
});
```
````

❌ BAD:

### Create a Farm

Use the farm service to create a farm.

````

**Add Screenshots for UI Changes:**
```markdown
✅ GOOD:
### New Farmer Dashboard
![Farmer Dashboard](./images/farmer-dashboard.png)

The new dashboard includes:
- Real-time order notifications
- Revenue analytics chart
- Quick actions menu
````

### Documentation Locations

| Type         | Location             |
| ------------ | -------------------- |
| Quick Start  | `QUICK_START.md`     |
| Contributing | `CONTRIBUTING.md`    |
| Changelog    | `CHANGELOG.md`       |
| API Docs     | `docs/api/`          |
| Guides       | `docs/guides/`       |
| Architecture | `docs/architecture/` |
| Testing      | `docs/testing/`      |

---

## 🎓 Resources

### Essential Reading

- [Quick Start Guide](./QUICK_START.md) - Get up and running
- [Divine Instructions](./.github/instructions/) - Coding patterns
- [Testing Guide](./docs/testing/README.md) - Testing strategies
- [API Documentation](./docs/api/README.md) - API reference

### External Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe API Reference](https://stripe.com/docs/api)

### Learning Path

1. **Week 1:** Setup environment, explore codebase
2. **Week 2:** Fix small bugs, write tests
3. **Week 3:** Implement minor features
4. **Week 4+:** Tackle major features

---

## 💬 Community & Getting Help

### Communication Channels

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions and general discussion
- **Discord:** Real-time chat (coming soon)
- **Email:** dev@farmersmarket.com

### Asking Questions

**Good Question:**

```
Title: How to implement custom farm certification types?

I'm trying to add support for custom certification types beyond
the built-in ones (organic, biodynamic). I've looked at:
- FarmCertification model in schema.prisma
- CertificationService in lib/services/
- Certification form in components/farm/

Should I extend the enum or use a flexible string field?
What's the preferred approach?
```

**Needs Improvement:**

```
Title: Help!

My code doesn't work. What's wrong?
```

### Response Times

- **Critical Bugs:** Within 24 hours
- **General Questions:** Within 48 hours
- **Feature Requests:** Evaluated during planning

---

## 🏆 Recognition

### Contributors

All contributors are recognized in:

- [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- GitHub contributors graph
- Release notes

### Types of Contributions

We value all contributions:

- 💻 Code contributions
- 📚 Documentation improvements
- 🐛 Bug reports
- 💡 Feature suggestions
- 🎨 Design contributions
- 🌍 Translations
- 📣 Community support

---

## 📜 License

By contributing to Farmers Market Platform, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make local agriculture more accessible. Thank you for being part of this mission!

---

## 📞 Contact

- **Project Lead:** Gogsi (gogsia86@github)
- **Email:** dev@farmersmarket.com
- **GitHub:** [@gogsia86](https://github.com/gogsia86)

---

**🌾 Happy Contributing! 🌾**

_"From farm to table, with code in between."_

---

**Last Updated:** December 20, 2024  
**Version:** 1.0.0
