# 🚀 Quality Workflow Quick Reference

> One-page cheat sheet for all quality commands

---

## 📦 Essential Commands

### Quality Checks

```bash
npm run quality              # ✅ Run ALL checks (type + lint + format)
npm run quality:fix          # 🔧 Run all + auto-fix issues
npm run quality:omen         # ⚡ HP OMEN optimized (12 threads)
```

### Individual Checks

```bash
npm run type-check           # 🔍 TypeScript type checking
npm run lint                 # 🧹 ESLint (check only)
npm run lint:fix             # 🔧 ESLint with auto-fix
npm run format:check         # 💅 Prettier (check only)
npm run format               # 💅 Prettier format all files
```

### Testing

```bash
npm run test                 # 🧪 Unit tests
npm run test:watch           # 👀 Tests in watch mode
npm run test:coverage        # 📊 Tests with coverage
npm run test:omen            # ⚡ HP OMEN (10 workers)
npm run test:e2e             # 🎭 E2E tests (Playwright)
npm run test:all             # 🔄 All tests (unit + e2e)
```

### Building

```bash
npm run build                # 🏗️ Production build (lint skipped)
npm run build:optimized      # 🚀 Optimized build
npm run build:omen           # ⚡ HP OMEN beast mode build
npm run build:analyze        # 📊 Build with bundle analyzer
```

---

## 🔄 Workflow Patterns

### Before Starting Work

```bash
git pull origin main
npm ci
npx prisma generate
npm run quality
```

### During Development

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Watch tests
npm run test:watch
```

### Before Committing

```bash
npm run quality:fix          # Auto-fix issues
npm run test                 # Run tests
git add .
git commit -m "feat: description"
```

### Before Pushing

```bash
npm run quality              # Final quality check
npm run test:all             # All tests
npm run build                # Verify build
git push origin feature/branch
```

---

## ⚡ HP OMEN Commands (12 threads, 64GB RAM)

```bash
npm run quality:omen         # Quality checks (3x faster)
npm run test:omen            # Tests (2.6x faster)
npm run test:e2e:omen        # E2E tests (10 browsers)
npm run build:omen           # Build (2x faster)
npm run type-check:omen      # Type check (12 threads)
```

**Performance:** ~2.4x faster than standard commands

---

## 🐛 Quick Fixes

### Fix All Auto-Fixable Issues

```bash
npm run quality:fix
```

### Fix Specific Issues

```bash
npm run lint:fix             # Fix ESLint issues
npm run format               # Fix formatting
```

### Type Errors (Manual Fix Required)

```bash
npm run type-check
# Read errors and fix in code
```

### Test Failures

```bash
npm run test:watch           # Debug in watch mode
npm run test -- --verbose    # More details
```

---

## 🚨 Common Issues

### "Pre-build hook slows development"

```bash
npm run build --ignore-scripts
```

### "Type check fails in CI but not locally"

```bash
rm -rf node_modules .next
npm ci
npx prisma generate
npm run type-check
```

### "Too many lint errors"

```bash
npm run lint:quiet           # See errors only
npm run lint:fix             # Auto-fix first
```

---

## 📊 Check Status

### Coverage Report

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Bundle Size

```bash
npm run build:analyze
# Opens in browser
```

### Type Coverage

```bash
npm run type-check
```

---

## 🎯 CI/CD Pipeline

### GitHub Actions Jobs (Parallel)

1. ✅ **type-check** - TypeScript validation
2. ✅ **lint** - ESLint code quality
3. ✅ **format-check** - Prettier formatting
4. ✅ **unit-tests** - Jest + coverage
5. ✅ **build-check** - Next.js build
6. ✅ **e2e-tests** - Playwright (main branch only)
7. ✅ **quality-gate** - Final verification

**Trigger:** Push to `main`/`develop` or Pull Request

---

## ✅ Pre-commit Checklist

- [ ] `npm run quality:fix` - Fix all issues
- [ ] `npm run test` - Tests pass
- [ ] Code reviewed
- [ ] Changes documented
- [ ] No console.logs/debugger
- [ ] Commit message follows convention

---

## 📚 Configuration Files

| File                   | Purpose                            |
| ---------------------- | ---------------------------------- |
| `next.config.mjs`      | ESLint: `ignoreDuringBuilds: true` |
| `.eslintrc.json`       | ESLint rules                       |
| `.prettierrc`          | Prettier config                    |
| `tsconfig.json`        | TypeScript config                  |
| `jest.config.js`       | Jest test config                   |
| `playwright.config.ts` | E2E test config                    |

---

## 🎓 Best Practices

### ✅ DO

- Run `npm run quality` before every commit
- Fix issues incrementally
- Use HP OMEN commands for speed
- Monitor test coverage (keep > 80%)
- Write meaningful commit messages

### ❌ DON'T

- Skip quality checks
- Use `@ts-ignore` or `eslint-disable` unnecessarily
- Commit failing tests
- Push without running `npm run quality`
- Ignore type errors

---

## 🆘 Need Help?

1. **Read error messages** - They're descriptive
2. **Check logs** - `npm run <command> -- --verbose`
3. **Search docs** - See `docs/QUALITY_WORKFLOW.md`
4. **Ask team** - We're here to help

---

## 📞 Quick Links

- [Full Documentation](./QUALITY_WORKFLOW.md)
- [Divine Instructions](.github/instructions/)
- [Testing Guide](.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md)
- [Error Handling](.github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md)

---

## 🌟 One-Liner Commands

```bash
# Full check before commit
npm run quality:fix && npm run test

# Full check before push (standard)
npm run quality && npm run test:all && npm run build

# Full check before push (HP OMEN)
npm run quality:omen && npm run test:all:omen && npm run build:omen

# CI/CD simulation (local)
npm run quality && npm run test:coverage && npm run build

# Emergency fix
npm run lint:fix && npm run format && git add -A

# Check everything is working
npm run quality && npm run test && npm run build && echo "✅ ALL GOOD!"
```

---

_Last Updated: 2024-11-15_  
_Version: 3.0.0_  
_Status: FULLY OPERATIONAL 🌾⚡_
