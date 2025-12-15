# 🚀 Package Upgrade Commands Quick Reference

**Quick access to all upgrade commands and procedures**

---

## 📋 Pre-Upgrade Commands

### Check Current Versions

```bash
# Show all outdated packages
npm outdated

# Show detailed information
npm outdated --long

# Check specific package
npm list [package-name]

# Check for security vulnerabilities
npm audit

# Check for major version updates only
npm outdated | grep -E "MAJOR|Package"
```

### Backup Current State

```bash
# Create git backup
git add -A
git commit -m "chore: backup before [package] upgrade"
git tag backup-before-[package]-upgrade

# Backup package files
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
```

---

## 🔄 Upgrade Commands by Package

### 1. Anthropic SDK (0.20.9 → 0.71.2)

```bash
# Create feature branch
git checkout -b feature/anthropic-sdk-upgrade

# Upgrade to latest
npm install @anthropic-ai/sdk@latest

# Verify
npm run type-check
npm run build
npm run test

# Test AI features
npm run test -- --grep "anthropic|claude"
```

### 2. LangChain Ecosystem (0.3.x → 1.1.x)

```bash
# Create feature branch
git checkout -b feature/langchain-v1-upgrade

# Upgrade core first
npm install @langchain/core@latest

# Then upgrade openai provider
npm install @langchain/openai@latest

# Verify
npm run type-check
npm run build
npm run test

# Test AI features
npm run test -- --grep "langchain|agent"
```

### 3. OpenAI SDK (4.104.0 → 6.10.0) - STAGED

```bash
# Create feature branch
git checkout -b feature/openai-v5-upgrade

# STAGE 1: Upgrade to v5
npm install openai@5

# Test thoroughly
npm run type-check
npm run build
npm run test
npm run dev  # Manual testing

# If successful, commit
git add -A
git commit -m "chore: upgrade openai SDK to v5"

# STAGE 2: Upgrade to v6
git checkout -b feature/openai-v6-upgrade
npm install openai@6

# Test thoroughly again
npm run type-check
npm run build
npm run test
npm run dev  # Manual testing
```

### 4. Tailwind CSS (3.4.18 → 4.1.17)

```bash
# Create feature branch
git checkout -b feature/tailwind-v4-upgrade

# Upgrade tailwind and plugins
npm install tailwindcss@latest
npm install prettier-plugin-tailwindcss@latest
npm install @tailwindcss/forms@latest
npm install @tailwindcss/typography@latest

# Run automated migration (if available)
npx @tailwindcss/upgrade

# Verify
npm run type-check
npm run build
npm run dev  # Visual testing required

# Test all pages manually
```

---

## ✅ Verification Commands

### Type Checking

```bash
# Full type check
npm run type-check

# Watch mode (during development)
npm run type-check -- --watch
```

### Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- [test-file-path]

# Run tests with coverage
npm run test -- --coverage

# E2E tests
npm run test:e2e

# Watch mode
npm run test -- --watch
```

### Build Verification

```bash
# Clean build
npm run clean
npm run build

# Check build size
npm run build -- --analyze

# Production build test
NODE_ENV=production npm run build
```

### Development Server

```bash
# Start dev server
npm run dev

# Start with debugging
NODE_OPTIONS='--inspect' npm run dev

# Check for console errors/warnings
npm run dev 2>&1 | tee dev-server.log
```

---

## 🔍 Diagnostic Commands

### Dependency Analysis

```bash
# Show dependency tree
npm list

# Show specific package dependencies
npm list [package-name]

# Find duplicate packages
npm dedupe --dry-run

# Check for peer dependency issues
npm install --dry-run
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npx depcheck

# Find large dependencies
npx webpack-bundle-analyzer
```

### Performance Checks

```bash
# Check build performance
time npm run build

# Check test performance
time npm run test

# Profile build
npm run build -- --profile
```

---

## 🚨 Rollback Commands

### Quick Rollback

```bash
# Restore from backup tag
git checkout backup-before-[package]-upgrade

# Discard feature branch
git branch -D feature/[package]-upgrade

# Restore package files
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# Reinstall
npm install

# Verify
npm run type-check
npm run build
npm run test
```

### Selective Rollback (Single Package)

```bash
# Downgrade specific package
npm install [package-name]@[previous-version]

# Example: Rollback OpenAI SDK
npm install openai@4.104.0

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🔧 Cleanup Commands

### Before Upgrade

```bash
# Clean node_modules
rm -rf node_modules
npm install

# Clear npm cache
npm cache clean --force

# Clear Next.js cache
rm -rf .next

# Clear Prisma cache
rm -rf node_modules/.prisma
npx prisma generate
```

### After Upgrade

```bash
# Dedupe dependencies
npm dedupe

# Prune unused packages
npm prune

# Update lock file
npm install --package-lock-only

# Audit and fix
npm audit fix
```

---

## 📊 Monitoring Commands

### During Upgrade

```bash
# Watch for file changes
npm run dev

# Monitor build output
npm run build 2>&1 | tee build.log

# Watch test results
npm run test -- --watch

# Check memory usage
node --max-old-space-size=4096 npm run build
```

### Post-Upgrade Health Checks

```bash
# Database health
npm run db:health

# API health
curl http://localhost:3000/api/health

# Full system check
npm run health-check

# Check for deprecation warnings
npm run dev 2>&1 | grep -i "deprecat"
```

---

## 🎯 Complete Upgrade Workflow

### Standard Upgrade Process

```bash
# 1. Prepare
git checkout -b feature/[package]-upgrade
npm outdated
cp package.json package.json.backup

# 2. Upgrade
npm install [package]@latest

# 3. Verify types
npm run type-check

# 4. Fix any type errors
# (manual code changes)

# 5. Build
npm run build

# 6. Test
npm run test
npm run test:e2e

# 7. Dev test
npm run dev
# (manual testing)

# 8. Commit
git add -A
git commit -m "chore: upgrade [package] to [version]"

# 9. Push and create PR
git push origin feature/[package]-upgrade
```

---

## 📝 Useful Aliases (Add to package.json)

```json
{
  "scripts": {
    "upgrade:check": "npm outdated",
    "upgrade:audit": "npm audit",
    "upgrade:clean": "rm -rf node_modules package-lock.json && npm install",
    "upgrade:backup": "cp package.json package.json.backup && cp package-lock.json package-lock.json.backup",
    "upgrade:restore": "cp package.json.backup package.json && cp package-lock.json.backup package-lock.json && npm install",
    "upgrade:verify": "npm run type-check && npm run build && npm run test",
    "upgrade:anthropic": "npm install @anthropic-ai/sdk@latest && npm run upgrade:verify",
    "upgrade:langchain": "npm install @langchain/core@latest @langchain/openai@latest && npm run upgrade:verify",
    "health-check": "npm run type-check && npm run db:health && curl http://localhost:3000/api/health"
  }
}
```

---

## 🔗 Related Documentation

- [MAJOR_UPGRADES_PLAN.md](./MAJOR_UPGRADES_PLAN.md) - Detailed upgrade strategy
- [Safe Upgrade Script](../scripts/safe-upgrade.sh) - Automated upgrade tool
- [Status Reports](./status-reports/) - Progress tracking

---

**Last Updated:** December 6, 2025  
**Maintained By:** Development Team

**Quick Start:**

```bash
# Check what needs upgrading
npm outdated

# Follow MAJOR_UPGRADES_PLAN.md for strategy
# Use commands above for execution
# Test thoroughly at each step
```
