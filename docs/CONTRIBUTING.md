# 🤝 Contributing to Farmers Market

Thank you for considering contributing to the Farmers Market project! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## 🌟 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions
- Report unacceptable behavior to maintainers

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub first, then:
git clone <https://github.com/YOUR-USERNAME/farmers-market.git>
cd farmers-market/farmers-market
npm install
```

### 2. Create a Branch

```bash
# Create a branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements
- `chore/description` - Maintenance tasks

### 3. Set Up Environment

```bash
# Copy environment file
cp .env.local.example .env.local

# Set up database
npm run db:push
npm run db:seed
```

## 🔄 Development Workflow

### 1. Make Your Changes

- Write clean, readable code
- Follow existing code patterns
- Add comments for complex logic
- Keep commits focused and atomic

### 2. Run Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- path/to/test.ts

# Run with coverage
npm run test:coverage
```

### 3. Check Code Quality

```bash
# Lint your code
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Format code
npm run format
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing new feature"
```

See [Commit Message Guidelines](#commit-message-guidelines) below.

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🎨 Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Prefer `interface` over `type` for object types
- Use `const` for immutable values, `let` for mutable
- Avoid `any` - use `unknown` if type is truly unknown
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Good

```typescript
interface User {
  id: string;
  name: string;
  email?: string;
}

const user: User = {
  id: "123",
  name: "John Doe",
};

const email = user.email ?? "no-email@example.com";
```

### Avoid

```typescript
const user: any = {
  /* ... */
}; // Don't use 'any'
let name: string = "John"; // Use 'const' if not reassigned
```

### React Components

- Use functional components with hooks
- Extract complex logic into custom hooks
- Keep components small and focused
- Use descriptive prop names
- Document props with JSDoc comments

### Good

```typescript
interface ProductCardProps {
  /** Unique product identifier */
  productId: string;
  /** Product display name */
  name: string;
  /** Price in cents */
  price: number;
  /** Optional callback when clicked */
  onClick?: () => void;
}

export function ProductCard({
  productId,
  name,
  price,
  onClick,
}: ProductCardProps) {
  const formattedPrice = usePriceFormatter(price);

  return (
    <div onClick={onClick}>
      <h3>{name}</h3>
      <p>{formattedPrice}</p>
    </div>
  );
}
```

### File Organization

- One component per file
- Co-locate related files (component + styles + tests)
- Use index files to simplify imports
- Keep folder structure flat when possible

```text
components/
├── ProductCard/
│   ├── ProductCard.tsx
│   ├── ProductCard.test.tsx
│   ├── ProductCard.stories.tsx
│   └── index.ts
```

### Naming Conventions

- **Components**: PascalCase (`ProductCard`)
- **Functions**: camelCase (`calculateTotal`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Files**: Match the export name
- **CSS Classes**: kebab-case (`product-card`)

## 📝 Commit Message Guidelines

We follow [Conventional Commits](<https://www.conventionalcommits.org>/) specification.

### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Simple feature
git commit -m "feat: add product search functionality"

# Bug fix with scope
git commit -m "fix(auth): resolve login redirect issue"

# Breaking change
git commit -m "feat!: redesign product API

BREAKING CHANGE: Product API now returns nested categories"

# With ticket reference
git commit -m "fix(cart): correct total calculation

Fixes #123"
```

### Rules

- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- Don't capitalize first letter of subject
- No period at the end of subject
- Limit subject line to 72 characters
- Separate subject from body with blank line
- Reference issues in footer

## 🔀 Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm run test`)
2. ✅ No linting errors (`npm run lint`)
3. ✅ TypeScript compiles (`npm run type-check`)
4. ✅ Code is formatted (`npm run format`)
5. ✅ Branch is up to date with main
6. ✅ Commit messages follow convention

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Screenshots (if applicable)

Add screenshots for UI changes

## Related Issues

Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: At least one approval required
3. **Address Feedback**: Make requested changes
4. **Approval**: Maintainer approves PR
5. **Merge**: Squash and merge to main

### Tips for Getting PR Approved

- Keep PRs small and focused (< 400 lines)
- Write clear descriptions
- Add tests for new functionality
- Update documentation
- Respond to feedback promptly
- Be open to suggestions

## 🧪 Testing Requirements

### What to Test

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Critical user flows

### Test Coverage Requirements

- **Minimum**: 80% coverage for new code
- **Target**: 90% coverage overall
- **Critical Paths**: 100% coverage (authentication, payments)

### Writing Good Tests

```typescript
// ✅ Good: Descriptive, focused, isolated
describe("ProductCard", () => {
  it("should display product name and price", () => {
    const { getByText } = render(<ProductCard name="Apple" price={299} />);

    expect(getByText("Apple")).toBeInTheDocument();
    expect(getByText("$2.99")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <ProductCard name="Apple" onClick={handleClick} />
    );

    fireEvent.click(getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Specific file
npm run test -- ProductCard.test.tsx

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📚 Documentation

### When to Update Docs

- Adding new features
- Changing APIs
- Modifying configuration
- Fixing bugs that affect usage
- Adding dependencies

### Where to Update

- **README.md**: Project overview and setup
- **docs/guides/**: Detailed guides
- **docs/api/**: API endpoint documentation
- **Code Comments**: Complex logic explanation
- **JSDoc**: Function and component documentation

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI features
- Keep it up to date
- Link to related docs

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try the latest version
3. Verify it's reproducible

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

### Environment

- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node version: [e.g. 20.10.0]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if it already exists
2. Describe the use case
3. Explain why it's valuable
4. Provide examples if possible

## 🎓 Learning Resources

- [Next.js Documentation](<https://nextjs.org/doc>s)
- [React Documentation](<https://react.de>v)
- [Prisma Documentation](<https://www.prisma.io/doc>s)
- [TypeScript Handbook](<https://www.typescriptlang.org/doc>s)
- [Testing Library](<https://testing-library.com/docs>/)

## ❓ Questions

- Check the [Development Guide](./guides/DEVELOPMENT.md)
- Search [GitHub Discussions](<https://github.com/your-org/farmers-market/discussion>s)
- Ask in team chat
- Create an issue with the `question` label

## 🏆 Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- Monthly team updates

Thank you for contributing! 🙏

---

**Happy Coding!** 🚀
