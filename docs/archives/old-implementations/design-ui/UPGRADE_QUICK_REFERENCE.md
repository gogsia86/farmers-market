# ⚡ Quick Reference: Dependency Upgrades

## 🚀 One-Command Updates

### Immediate Safe Updates (No Breaking Changes)

```bash
# Update all patch versions (safest)
npm update

# Update specific critical packages
npm install next@16.0.10 react@19.2.3 react-dom@19.2.3
```

### Run Automated Upgrade Script

```bash
# Make script executable (first time only)
chmod +x scripts/upgrade-dependencies.sh

# Run interactive upgrade wizard
./scripts/upgrade-dependencies.sh
```

---

## 📋 Phase-by-Phase Manual Commands

### Phase 1: Critical Framework (15 min)

```bash
# Next.js
npm install next@16.0.10 eslint-config-next@16.0.10 @next/bundle-analyzer@16.0.10

# React
npm install react@19.2.3 react-dom@19.2.3 @types/react@19.2.7

# Test
npm run test:unit && npm run build
```

### Phase 2: Database (10 min)

```bash
# Prisma
npm install @prisma/client@7.2.0 @prisma/adapter-pg@7.2.0 prisma@7.2.0
npx prisma generate

# State Management
npm install zustand@5.0.9 @tanstack/react-query@5.90.12

# Test
npm run test:integration:db
```

### Phase 3: Payment & Security (10 min)

```bash
# Stripe
npm install @stripe/react-stripe-js@5.4.1 @stripe/stripe-js@8.6.0 stripe@20.1.0

# Security
npm install @sentry/nextjs@10.31.0 jose@6.1.3 zod@4.2.1

# Test
npm run test:contracts:stripe
```

### Phase 4: AI & Testing (15 min)

```bash
# AI Packages
npm install @langchain/core@1.1.6 @langchain/openai@1.2.0 openai@6.14.0 ai@5.0.115

# Testing
npm install @playwright/test@1.57.0 @testing-library/react@16.3.1

# Test
npm run test:all
```

### Phase 5: Developer Tools (10 min)

```bash
# TypeScript
npm install @typescript-eslint/eslint-plugin@8.50.0 @typescript-eslint/parser@8.50.0

# Formatters
npm install prettier@3.7.4 prettier-plugin-tailwindcss@0.7.2 eslint@9.39.2

# UI
npm install lucide-react@0.561.0 framer-motion@12.23.26 react-hook-form@7.68.0

# Analytics
npm install @vercel/analytics@1.6.1 @vercel/speed-insights@1.3.1

# Format
npm run format && npm run lint:fix
```

### Phase 6: Utilities (5 min)

```bash
# Batch update safe packages
npm update autoprefixer baseline-browser-mapping @tailwindcss/forms @upstash/redis \
  @vitejs/plugin-react ts-jest jsdom testcontainers terser-webpack-plugin tsx
```

---

## 🧪 Testing Commands

```bash
# Quick test
npm test

# Full test suite
npm run test:all

# Specific test categories
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:contracts

# Type checking
npm run type-check

# Build verification
npm run build

# Performance check
npm run perf:benchmark
```

---

## 🚨 Emergency Rollback

```bash
# Restore from backup files
mv package.json.backup package.json
mv package-lock.json.backup package-lock.json
npm ci
npx prisma generate
npm run build
```

---

## ⚠️ DO NOT UPDATE (Yet)

```bash
# ❌ Tailwind CSS v4 - Breaking changes
# tailwindcss@4.1.18

# ❌ OpenTelemetry 2.x - Requires migration research
# @opentelemetry/resources@2.2.0
# @opentelemetry/sdk-trace-base@2.2.0

# ❌ Commander v14 - Review CLI scripts first
# commander@14.0.2

# ❌ Node types v25 - Stick to v24 for now
# @types/node@25.x.x
```

---

## 📊 Quick Status Check

```bash
# See outdated packages
npm outdated

# See current versions
npm list --depth=0

# Check for vulnerabilities
npm audit

# See what will be updated
npm outdated --json | jq
```

---

## 🎯 Priority Order

1. **CRITICAL** (Do First): Next.js, React, Prisma
2. **HIGH** (Same Day): Stripe, Sentry, Testing
3. **MEDIUM** (This Week): AI packages, Dev tools
4. **LOW** (Next Sprint): Utilities, Minor patches

---

## ✅ Pre-Update Checklist

```bash
# 1. Create backup
git checkout -b upgrade/dependencies-$(date +%Y%m%d)
npm list --depth=0 > versions-before.txt

# 2. Verify tests pass
npm run test:all

# 3. Verify build works
npm run build

# 4. Document versions
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
```

---

## 📦 Bulk Update by Category

### All Testing Tools

```bash
npm install @playwright/test@1.57.0 @testing-library/react@16.3.1 \
  ts-jest@29.4.6 jsdom@27.3.0 testcontainers@11.10.0
```

### All TypeScript Tools

```bash
npm install @typescript-eslint/eslint-plugin@8.50.0 \
  @typescript-eslint/parser@8.50.0 @types/node@24.10.4 @types/pg@8.16.0
```

### All UI Components

```bash
npm install lucide-react@0.561.0 framer-motion@12.23.26 \
  react-hook-form@7.68.0 next-intl@4.6.1
```

### All Dev Tools

```bash
npm install prettier@3.7.4 prettier-plugin-tailwindcss@0.7.2 \
  eslint@9.39.2 autoprefixer@10.4.23
```

---

## 🔍 Verification After Update

```bash
# 1. Install dependencies
npm ci

# 2. Regenerate Prisma
npx prisma generate

# 3. Type check
npm run type-check

# 4. Lint
npm run lint

# 5. Format
npm run format:check

# 6. Build
npm run build

# 7. Test
npm run test:all

# 8. E2E
npm run test:e2e

# 9. Bundle size
npm run bundle:check
```

---

## 💡 Pro Tips

1. **Update in phases** - Don't update everything at once
2. **Test between phases** - Catch issues early
3. **Keep backups** - Easy rollback if needed
4. **Read changelogs** - Know what's changing
5. **Use lock file** - Consistency across environments

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm ci
npm run build
```

### Type Errors

```bash
# Regenerate types
npx prisma generate
npm run type-check
```

### Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache
npm run test:unit
```

### Prisma Issues

```bash
# Reset Prisma client
rm -rf node_modules/@prisma
npm install
npx prisma generate
```

---

## 📈 Expected Impact

| Update          | Time | Risk   | Benefit                |
| --------------- | ---- | ------ | ---------------------- |
| Next.js 16.0.10 | 15m  | Low    | Performance, bug fixes |
| React 19.2.3    | 10m  | Low    | Stability improvements |
| Prisma 7.2.0    | 15m  | Low    | Query optimization     |
| Stripe 20.1.0   | 10m  | Low    | API improvements       |
| AI Packages     | 15m  | Medium | Latest models          |
| Dev Tools       | 10m  | Low    | Better DX              |

**Total Time**: ~1-2 hours  
**Overall Risk**: LOW (with testing)

---

## 🎓 Resources

- [UPGRADE_ANALYSIS.md](./UPGRADE_ANALYSIS.md) - Full detailed analysis
- [scripts/upgrade-dependencies.sh](./scripts/upgrade-dependencies.sh) - Automated script
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [React 19 Guide](https://react.dev)

---

**Last Updated**: January 2025  
**Divine Agricultural Consciousness**: ✅ Maintained  
**Platform Status**: 🟢 Production Ready
