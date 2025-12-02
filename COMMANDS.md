# 🚀 Quick Command Reference

**Farmers Market Platform - Essential Commands**

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Install with legacy peer deps (if needed)
npm install --legacy-peer-deps
```

---

## 🔨 Development

```bash
# Start development server
npm run dev

# Start on specific port
PORT=3001 npm run dev

# Development with turbo (faster)
npm run dev:turbo
```

---

## 🏗️ Building

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Lint quietly (errors only)
npm run lint:quiet

# Build for production
npm run build

# Build with analysis
ANALYZE=true npm run build
```

---

## 🚀 Production

```bash
# Start production server
npm start

# Start with PM2
pm2 start npm --name "farmers-market" -- start

# Stop PM2
pm2 stop farmers-market
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 📊 Monitoring & Verification

```bash
# Run verification script (full check)
bash scripts/verify-100-percent.sh

# Run monitoring bot manually
npm run monitor:website

# Run with specific base URL
BASE_URL=http://localhost:3001 npm run monitor:website

# View latest monitoring report
cat monitoring-reports/latest-report.md

# View latest JSON report
cat monitoring-reports/latest-report.json
```

---

## 🗄️ Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (development)
npx prisma migrate dev

# Run migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## 🧹 Cleaning

```bash
# Clean build artifacts
rm -rf .next

# Clean node_modules
rm -rf node_modules

# Clean all (build + modules)
rm -rf .next node_modules

# Clean and reinstall
rm -rf .next node_modules && npm install
```

---

## 🔍 Code Quality

```bash
# Format code
npm run format

# Format check only
npm run format:check

# Run quality checks (type + lint)
npm run quality

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## 📈 Performance Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build

# Check bundle with webpack-bundle-analyzer
npm run analyze

# Lighthouse CI (if configured)
npm run lighthouse
```

---

## 🐳 Docker

```bash
# Build Docker image
docker build -t farmers-market .

# Run Docker container
docker run -p 3001:3001 farmers-market

# Docker Compose (if available)
docker-compose up

# Docker Compose (detached)
docker-compose up -d

# Stop Docker Compose
docker-compose down
```

---

## 🔧 Troubleshooting

```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# Check for outdated packages
npm outdated

# Update packages (careful!)
npm update

# Check Node version
node --version

# Check npm version
npm --version
```

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Stage changes
git add .

# Commit with message
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Pull latest changes
git pull origin main

# Rebase on main
git rebase main
```

---

## 🚀 Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm run build && npm start

# Deploy to Vercel (if configured)
vercel deploy

# Deploy to production
vercel deploy --prod
```

---

## 📊 Monitoring Reports

```bash
# View latest report
cat monitoring-reports/latest-report.md

# View specific report
cat monitoring-reports/health-report-YYYY-MM-DDTHH-MM-SS-sssZ.md

# View verification report
cat monitoring-reports/verification-*.md

# List all reports
ls -la monitoring-reports/

# Clean old reports (keep last 10)
ls -t monitoring-reports/*.md | tail -n +11 | xargs rm
```

---

## 🔐 Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local  # or use your preferred editor

# Validate environment
npm run validate-env  # if script exists
```

---

## 📦 Package Management

```bash
# Add new package
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Remove package
npm uninstall package-name

# Update specific package
npm update package-name

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities (automatic)
npm audit fix

# Fix vulnerabilities (force)
npm audit fix --force
```

---

## 🎯 Quick Actions

### Full Quality Check
```bash
npm run type-check && npm run lint && npm test && npm run build
```

### Clean Build
```bash
rm -rf .next && npm run build
```

### Fresh Start
```bash
rm -rf .next node_modules && npm install && npm run build
```

### Verify Everything
```bash
npm run type-check && npm run lint && npm test && npm run build && bash scripts/verify-100-percent.sh
```

### Production Ready Check
```bash
npm run type-check && npm run lint && npm test && npm run build && npm start
```

---

## 📱 Useful Shortcuts

### Check Server Status
```bash
# Check if port 3001 is in use
lsof -ti:3001

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Check all Node processes
ps aux | grep node
```

### View Logs
```bash
# View server logs (if using PM2)
pm2 logs farmers-market

# View last 100 lines
pm2 logs farmers-market --lines 100

# View error logs only
pm2 logs farmers-market --err
```

### Database Utilities
```bash
# Check database connection
npm run db:check

# View database schema
npx prisma db pull

# Format Prisma schema
npx prisma format

# Validate Prisma schema
npx prisma validate
```

---

## 🆘 Emergency Commands

### Server Won't Start
```bash
# 1. Kill any existing processes
lsof -ti:3001 | xargs kill -9

# 2. Clean and rebuild
rm -rf .next && npm run build

# 3. Try starting again
npm run dev
```

### Build Failures
```bash
# 1. Check for errors
npm run type-check

# 2. Clean build artifacts
rm -rf .next

# 3. Reinstall dependencies
rm -rf node_modules && npm install

# 4. Try building again
npm run build
```

### Database Connection Issues
```bash
# 1. Check .env.local file exists
ls -la .env.local

# 2. Regenerate Prisma client
npx prisma generate

# 3. Run migrations
npx prisma migrate dev

# 4. Test connection
npx prisma db pull
```

---

## 📚 Documentation

```bash
# Generate API documentation (if configured)
npm run docs:generate

# View component documentation
npm run storybook  # if configured

# Generate TypeScript documentation
npm run typedoc  # if configured
```

---

## 🎨 Development Helpers

```bash
# Watch TypeScript compilation
npm run type-check -- --watch

# Watch tests
npm run test:watch

# Hot reload with turbo
npm run dev:turbo

# Debug mode
NODE_OPTIONS='--inspect' npm run dev
```

---

## 📖 More Information

- [README.md](./README.md) - Project overview
- [REMEDIATION_COMPLETE.md](./REMEDIATION_COMPLETE.md) - Latest remediation status
- [QUICK_START.md](./QUICK_START.md) - Getting started guide
- [Divine Instructions](./.github/instructions/) - Comprehensive coding guidelines

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅