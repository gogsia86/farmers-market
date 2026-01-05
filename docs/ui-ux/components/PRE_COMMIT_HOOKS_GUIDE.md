# 🎣 Pre-Commit Hooks Guide

## Automated Code Quality Enforcement

**Status**: ✅ Active  
**Last Updated**: 2024-11-15  
**Maintainer**: Development Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What Gets Checked](#what-gets-checked)
3. [Installation](#installation)
4. [How It Works](#how-it-works)
5. [Troubleshooting](#troubleshooting)
6. [Bypassing Hooks (Emergency Only)](#bypassing-hooks)
7. [Configuration](#configuration)
8. [Examples](#examples)

---

## 🎯 Overview

Pre-commit hooks are automated checks that run before each commit to ensure code quality and prevent TypeScript errors from entering the repository.

### Why Pre-Commit Hooks?

✅ **Catch errors early** - Find issues before they reach the repository  
✅ **Consistent quality** - Enforce standards automatically  
✅ **Faster reviews** - Less time fixing basic issues  
✅ **TypeScript safety** - Prevent type errors from being committed  
✅ **Team alignment** - Everyone follows the same rules

### Tools Used

- **Husky** - Git hooks manager
- **lint-staged** - Run linters on staged files only
- **TypeScript** - Type checking
- **ESLint** - Code linting (when available)
- **Prettier** - Code formatting

---

## 🔍 What Gets Checked

### Pre-Commit (Before Commit)

When you run `git commit`, the following checks run automatically:

#### 1. TypeScript Type Checking ⚡

```bash
npx tsc --noEmit
```

- ✅ Ensures no TypeScript errors
- ✅ Validates all type annotations
- ✅ Catches type mismatches
- ❌ Blocks commit if errors found

#### 2. ESLint (Code Linting) 🔍

```bash
npx eslint <files> --fix --max-warnings=0
```

- ✅ Checks code style and best practices
- ✅ Auto-fixes issues when possible
- ✅ Enforces coding standards
- ❌ Blocks commit if unfixable errors

#### 3. Prettier (Code Formatting) 💅

```bash
npx prettier --write <files>
```

- ✅ Formats code consistently
- ✅ Auto-fixes formatting
- ✅ Maintains code style
- ✅ Always succeeds (auto-fixes)

#### 4. Prisma Schema Validation (if schema changed) 🗄️

```bash
npx prisma format
npx prisma validate
```

- ✅ Validates Prisma schema syntax
- ✅ Formats schema file
- ✅ Checks for schema errors

### Commit Message Validation 📝

After you write your commit message, it's validated against conventional commits format:

**Required Format**:

```
<type>(<scope>): <subject>

Examples:
✅ feat(farms): add farm verification workflow
✅ fix(auth): resolve login redirect issue
✅ docs(readme): update setup instructions
✅ perf(database): optimize farm queries
```

**Valid Types**:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Revert previous commit

---

## 📦 Installation

### First Time Setup

Pre-commit hooks are automatically set up when you run:

```bash
npm install
```

This triggers the `prepare` script in `package.json` which runs:

```bash
npm run prepare  # Runs: husky
```

### Verify Installation

Check that hooks are installed:

```bash
ls -la .husky/
```

You should see:

- `.husky/pre-commit` - Runs before commit
- `.husky/commit-msg` - Validates commit message
- `.husky/_/` - Husky internal files

### Manual Installation (if needed)

If hooks aren't working:

```bash
# Reinstall husky
npm install husky --save-dev

# Initialize husky
npx husky init

# Restore hook files (if missing)
git checkout .husky/pre-commit
git checkout .husky/commit-msg
```

---

## ⚙️ How It Works

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Developer makes changes and stages files                     │
│ $ git add src/lib/auth/config.ts                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Developer commits                                            │
│ $ git commit -m "fix(auth): resolve type error"             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 🎣 PRE-COMMIT HOOK TRIGGERED                                │
│ .husky/pre-commit runs lint-staged                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 🔍 LINT-STAGED RUNS CHECKS                                  │
│                                                              │
│ For *.ts, *.tsx files:                                       │
│ 1. TypeScript type check: npx tsc --noEmit                  │
│ 2. ESLint: npx eslint --fix                                 │
│ 3. Prettier: npx prettier --write                           │
│                                                              │
│ For *.json files:                                            │
│ 1. Prettier: npx prettier --write                           │
│                                                              │
│ For prisma/schema.prisma:                                    │
│ 1. Format: npx prisma format                                │
│ 2. Validate: npx prisma validate                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                   ┌──────┴──────┐
                   │   Success?  │
                   └──────┬──────┘
                          │
              ┌───────────┼───────────┐
              │ YES                   │ NO
              ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│ Continue with commit    │ │ ❌ BLOCK COMMIT         │
└─────────┬───────────────┘ │ Show errors to fix      │
          │                 └─────────────────────────┘
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 📝 COMMIT-MSG HOOK TRIGGERED                                │
│ .husky/commit-msg validates message format                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                   ┌──────┴──────┐
                   │   Valid?    │
                   └──────┬──────┘
                          │
              ┌───────────┼───────────┐
              │ YES                   │ NO
              ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│ ✅ COMMIT SUCCESS       │ │ ❌ REJECT COMMIT        │
│ Changes committed       │ │ Fix commit message      │
└─────────────────────────┘ └─────────────────────────┘
```

### What Happens Behind the Scenes

1. **Git triggers pre-commit hook** when you run `git commit`
2. **Husky executes** `.husky/pre-commit` script
3. **lint-staged reads** `.lintstagedrc.js` configuration
4. **Filters staged files** by extension (`.ts`, `.tsx`, `.js`, etc.)
5. **Runs checks** on filtered files only (not entire codebase)
6. **Auto-fixes** issues when possible (formatting, simple lints)
7. **Reports errors** if auto-fix not possible
8. **Blocks commit** if any check fails
9. **Validates commit message** format
10. **Allows commit** if all checks pass

---

## 🔧 Troubleshooting

### Issue: Pre-commit hook not running

**Symptoms**: Changes commit without any checks

**Solution**:

```bash
# Check if hooks are installed
ls -la .husky/

# Reinstall hooks
npm run prepare

# Make hooks executable (Unix/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Check Git hooks path
git config core.hooksPath
# Should output: .husky
```

### Issue: TypeScript errors on commit

**Symptoms**:

```
❌ Pre-commit checks failed!
src/lib/auth/config.ts:42:5 - error TS2322: Type 'string' is not assignable to type 'never'
```

**Solution**:

```bash
# Fix the TypeScript errors first
npx tsc --noEmit

# Then commit again
git commit -m "fix: resolve type errors"
```

**Pro Tip**: Don't try to bypass! Fix the errors - they would break CI anyway.

### Issue: ESLint errors blocking commit

**Symptoms**:

```
❌ 3 linting errors found
  src/components/FarmCard.tsx:15:7 - 'farm' is never used
```

**Solution**:

```bash
# Try auto-fix first
npx eslint src/components/FarmCard.tsx --fix

# If still errors, fix manually
# Remove unused variables, fix issues

# Then commit
git commit -m "fix(components): remove unused variable"
```

### Issue: Commit message rejected

**Symptoms**:

```
❌ Invalid commit message format!

Your commit message:
  fixed the bug
```

**Solution**:

```bash
# Use conventional commit format
git commit -m "fix(auth): resolve authentication bug"

# Include scope when possible
git commit -m "feat(farms): add farm search functionality"
```

### Issue: Hooks run too slow

**Symptoms**: Commit takes 30+ seconds

**Causes & Solutions**:

1. **Too many files staged**:

   ```bash
   # Commit in smaller batches
   git add src/lib/auth/
   git commit -m "fix(auth): update auth config"

   git add src/components/
   git commit -m "feat(ui): add new components"
   ```

2. **TypeScript check is slow**:

   ```bash
   # Ensure tsconfig.json excludes unnecessary files
   # Check: "exclude": ["node_modules", "dist", ".next"]
   ```

3. **Large codebase**:
   ```bash
   # lint-staged only runs on staged files (this is already optimized)
   # Consider using --maxWorkers in TypeScript if needed
   ```

### Issue: False positives in type checking

**Symptoms**: TypeScript errors that don't make sense

**Solution**:

```bash
# Clear TypeScript cache
rm -rf .next/
rm -rf node_modules/.cache/

# Regenerate Prisma client
npx prisma generate

# Try commit again
git commit -m "fix: your fix"
```

### Issue: Hooks fail on Windows

**Symptoms**: `/bin/sh: not found` or similar errors

**Solution**:

```bash
# Install Git Bash (comes with Git for Windows)
# Or use WSL (Windows Subsystem for Linux)

# Ensure husky scripts use Unix line endings
git config core.autocrlf false

# Reinstall
rm -rf .husky
npm run prepare
```

---

## 🚨 Bypassing Hooks (Emergency Only)

### When to Bypass

⚠️ **ONLY in emergencies**:

- Critical hotfix needed immediately
- CI/CD is down and needs urgent fix
- Working on experimental branch (not main)
- Infrastructure changes that break type checking temporarily

❌ **NEVER bypass**:

- "I'll fix it later" - You won't, and it will break CI
- "It's just a small change" - Small changes can have big impacts
- "The errors don't matter" - They always matter
- "I'm in a hurry" - Take 2 minutes to fix the issues

### How to Bypass (Use Responsibly)

#### Skip Pre-Commit Checks

```bash
git commit --no-verify -m "fix: emergency hotfix"
# or
git commit -n -m "fix: emergency hotfix"
```

#### Skip Commit Message Validation

```bash
# Same as above - --no-verify skips all hooks
git commit --no-verify -m "quick fix"
```

### After Bypassing

1. **Create follow-up ticket** to fix the issues
2. **Fix issues in next commit** as soon as possible
3. **Don't make it a habit** - bypassing defeats the purpose

---

## 📝 Configuration

### lint-staged Configuration

**File**: `.lintstagedrc.js`

```javascript
module.exports = {
  // TypeScript files
  "**/*.{ts,tsx}": (filenames) => [
    "npx tsc --noEmit", // Type check
    `npx eslint ${filenames} --fix`, // Lint & auto-fix
    `npx prettier --write ${filenames}`, // Format
  ],

  // JavaScript files
  "**/*.{js,jsx}": (filenames) => [
    `npx eslint ${filenames} --fix`,
    `npx prettier --write ${filenames}`,
  ],

  // JSON files
  "**/*.json": (filenames) => [`npx prettier --write ${filenames}`],

  // Prisma schema
  "prisma/schema.prisma": () => ["npx prisma format", "npx prisma validate"],
};
```

### Customizing Checks

#### Add New File Type

```javascript
// In .lintstagedrc.js
module.exports = {
  // ... existing rules ...

  // Add CSS linting
  "**/*.css": (filenames) => [
    `npx stylelint ${filenames} --fix`,
    `npx prettier --write ${filenames}`,
  ],
};
```

#### Disable Specific Check

```javascript
// Remove type checking (not recommended!)
'**/*.{ts,tsx}': (filenames) => [
  // 'npx tsc --noEmit',  // ❌ Commented out
  `npx eslint ${filenames} --fix`,
  `npx prettier --write ${filenames}`,
],
```

#### Add Test Running

```javascript
// Run tests for changed files
'**/*.test.{ts,tsx}': (filenames) => [
  `npm test -- --findRelatedTests ${filenames.join(' ')}`,
],
```

### Husky Configuration

#### Pre-Commit Hook

**File**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."
npx lint-staged
```

#### Commit-Msg Hook

**File**: `.husky/commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validate commit message format
commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

if echo "$commit_msg" | grep -qE "^(feat|fix|docs|...)(\(.+\))?: .{3,}"; then
  exit 0
fi

echo "❌ Invalid commit message format!"
exit 1
```

### Adding New Hooks

#### Pre-Push Hook (runs before push)

```bash
# Create file
touch .husky/pre-push

# Make executable
chmod +x .husky/pre-push

# Add content
cat > .husky/pre-push << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."
npm test
EOF
```

#### Post-Commit Hook (runs after successful commit)

```bash
# Create file
touch .husky/post-commit
chmod +x .husky/post-commit

# Add content
cat > .husky/post-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "✅ Commit successful!"
echo "📊 Running quick stats..."
git log --oneline -5
EOF
```

---

## 📚 Examples

### Example 1: Successful Commit

```bash
$ git add src/lib/auth/config.ts

$ git commit -m "fix(auth): resolve type error in auth config"

🔍 Running pre-commit checks...

✔ Preparing lint-staged...
✔ Running tasks for staged files...
  ✔ **/*.{ts,tsx}
    ✔ npx tsc --noEmit
    ✔ npx eslint --fix
    ✔ npx prettier --write
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...

✅ Pre-commit checks passed!
✅ Commit message format is valid

[main abc1234] fix(auth): resolve type error in auth config
 1 file changed, 5 insertions(+), 2 deletions(-)
```

### Example 2: TypeScript Error Blocking Commit

```bash
$ git add src/lib/database/index.ts

$ git commit -m "feat(db): add new database helper"

🔍 Running pre-commit checks...

✖ Running tasks for staged files...
  ✖ **/*.{ts,tsx}
    ✖ npx tsc --noEmit
      src/lib/database/index.ts:27:5 - error TS2322:
      Type 'string | undefined' is not assignable to type 'string'

❌ Pre-commit checks failed!
💡 Fix the errors above and try again.

# Fix the error
$ vim src/lib/database/index.ts

# Try again
$ git commit -m "feat(db): add new database helper"
✅ Success!
```

### Example 3: Invalid Commit Message

```bash
$ git add README.md

$ git commit -m "updated readme"

🔍 Running pre-commit checks...
✅ Pre-commit checks passed!

❌ Invalid commit message format!

📋 Divine Commit Message Format:
   <type>(<scope>): <subject>

📝 Examples:
   docs(readme): update setup instructions

Your commit message:
   updated readme

# Fix the message
$ git commit -m "docs(readme): update setup instructions"
✅ Success!
```

### Example 4: Auto-Fixed Formatting

```bash
$ git add src/components/FarmCard.tsx

$ git commit -m "feat(ui): add farm card component"

🔍 Running pre-commit checks...

✔ Running tasks for staged files...
  ✔ **/*.{ts,tsx}
    ✔ npx tsc --noEmit
    ✔ npx eslint --fix (2 issues auto-fixed)
    ✔ npx prettier --write (formatted)

✅ Pre-commit checks passed!

[main def5678] feat(ui): add farm card component
 1 file changed, 50 insertions(+)
```

---

## 🎓 Best Practices

### 1. Commit Often, Commit Small

```bash
# ✅ Good - Small, focused commits
git commit -m "feat(auth): add login form validation"
git commit -m "feat(auth): implement JWT token refresh"
git commit -m "feat(auth): add logout functionality"

# ❌ Bad - One huge commit
git commit -m "feat(auth): complete auth system"
```

### 2. Stage Related Files Only

```bash
# ✅ Good - Related changes together
git add src/lib/auth/config.ts src/lib/auth/types.ts
git commit -m "fix(auth): update auth configuration types"

# ❌ Bad - Unrelated files
git add src/lib/auth/config.ts src/components/FarmCard.tsx
git commit -m "fix: various fixes"
```

### 3. Fix Issues Before Committing

```bash
# ✅ Good workflow
npx tsc --noEmit  # Check for errors
npm test          # Run tests
git add .
git commit -m "feat: add new feature"

# ❌ Bad workflow
git add .
git commit -m "feat: add new feature" # Hope it works!
```

### 4. Use Descriptive Commit Messages

```bash
# ✅ Good - Clear and descriptive
git commit -m "fix(database): resolve connection timeout in production"
git commit -m "perf(api): optimize farm search query by 50%"
git commit -m "feat(farms): add farm verification workflow with email notifications"

# ❌ Bad - Vague and unhelpful
git commit -m "fix stuff"
git commit -m "update"
git commit -m "changes"
```

### 5. Review Changes Before Committing

```bash
# Check what you're about to commit
git diff --staged

# Review status
git status

# Then commit
git commit -m "fix(auth): your fix"
```

---

## 🚀 Advanced Usage

### Running Checks Manually

```bash
# Run lint-staged on all staged files
npx lint-staged

# Check TypeScript without committing
npx tsc --noEmit

# Format all files
npx prettier --write .

# Lint specific file
npx eslint src/lib/auth/config.ts --fix
```

### Testing Hooks Without Committing

```bash
# Test pre-commit hook
.husky/pre-commit

# Test commit-msg hook
echo "feat(test): testing hook" > /tmp/test-msg
.husky/commit-msg /tmp/test-msg
```

### Debugging Hooks

```bash
# Add debug output to hooks
# In .husky/pre-commit:
set -x  # Enable debug mode
npx lint-staged
set +x  # Disable debug mode
```

---

## 📊 Metrics & Monitoring

### Check Hook Performance

```bash
# Add timing to pre-commit hook
time npx lint-staged

# Example output:
# real    0m2.543s
# user    0m3.123s
# sys     0m0.234s
```

### Track Blocked Commits

```bash
# See how many times commits were blocked
git reflog | grep -c "commit (amend)"
```

---

## 🆘 Getting Help

### Common Commands

```bash
# View hook logs
cat .husky/pre-commit

# Check lint-staged config
cat .lintstagedrc.js

# Test TypeScript
npx tsc --noEmit

# Format all files
npx prettier --write .

# Check ESLint
npx eslint . --ext .ts,.tsx
```

### Resources

- **Husky Docs**: https://typicode.github.io/husky/
- **lint-staged Docs**: https://github.com/okonet/lint-staged
- **Conventional Commits**: https://www.conventionalcommits.org/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Internal Docs**: `docs/TYPESCRIPT_IMPROVEMENT_PLAN.md`

### Getting Support

1. Check this guide first
2. Check TypeScript errors with `npx tsc --noEmit`
3. Review `.lintstagedrc.js` configuration
4. Ask team members
5. Check Husky/lint-staged GitHub issues

---

## ✅ Checklist: Is Everything Working?

- [ ] Hooks run automatically on `git commit`
- [ ] TypeScript errors block commits
- [ ] Commit messages are validated
- [ ] Code is auto-formatted
- [ ] ESLint auto-fixes issues
- [ ] Prisma schema is validated
- [ ] Team members have hooks installed
- [ ] CI/CD has same checks as local hooks

---

**Last Updated**: 2024-11-15  
**Version**: 1.0  
**Status**: Active & Enforced ✅
