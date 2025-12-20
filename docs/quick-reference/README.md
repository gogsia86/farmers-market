# ⚡ Quick Reference Hub

**Instant access to commands, patterns, and solutions** — Copy-paste ready references for daily development on the Farmers Market Platform.

---

## 🎯 Quick Navigation

| Category          | References                      | Quick Links                                                                        |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| **⌨️ Commands**   | npm, git, docker, prisma        | [npm Scripts](#-npm-scripts) • [Git](#-git-commands) • [Docker](#-docker-commands) |
| **🔧 Setup**      | Environment, database, services | [Quick Setup](#-quick-setup) • [Environment](#environment-variables)               |
| **🐛 Fixes**      | Common issues, solutions        | [Quick Fixes](#-quick-fixes) • [Troubleshooting](#troubleshooting-commands)        |
| **🧪 Testing**    | Test commands, patterns         | [Test Commands](#-testing-commands) • [Coverage](#test-coverage)                   |
| **🚢 Deployment** | Deploy commands, verification   | [Deploy](#-deployment-commands) • [Verify](#deployment-verification)               |
| **📊 Monitoring** | Health checks, metrics, logs    | [Health](#-health-checks) • [Logs](#viewing-logs)                                  |

**Total Commands:** 200+ copy-paste ready • **Categories:** 10+ organized sections

---

## 🚀 Quick Setup

### One-Command Setup

```bash
# Complete setup in one line (new project)
git clone <repo-url> && cd farmers-market-platform && npm install && cp .env.example .env.local && npx prisma generate && npx prisma db push && npx prisma db seed && npm run dev
```

### Step-by-Step Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd farmers-market-platform

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Start development server
npm run dev
```

### Environment Variables Quick Setup

```bash
# .env.local (minimal required)
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"
NEXTAUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 📦 npm Scripts

### Development

```bash
# Start development server
npm run dev

# Start with debugging
npm run dev:debug

# Start with turbopack (faster)
npm run dev:turbo

# Start on different port
PORT=3001 npm run dev
```

### Building

```bash
# Production build
npm run build

# Build with verbose output
npm run build:verbose

# Analyze bundle size
npm run build:analyze

# Type check only (no build)
npm run type-check
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E in headed mode
npm run test:e2e:headed

# Run specific test file
npm test -- farm.test.ts
```

### Code Quality

```bash
# Lint code
npm run lint

# Lint and fix
npm run lint:fix

# Format code
npm run format

# Format check only
npm run format:check

# Type check
npm run type-check

# Check everything (lint + format + types)
npm run check
```

### Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

### Cleaning

```bash
# Clean all caches and builds
npm run clean

# Clean Next.js cache only
rm -rf .next

# Clean node_modules
rm -rf node_modules package-lock.json
npm install

# Clean everything (nuclear option)
npm run clean:all
rm -rf node_modules package-lock.json .next
npm install
```

---

## 🗄️ Prisma Commands

### Schema Management

```bash
# Generate Prisma client
npx prisma generate

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

### Database Operations

```bash
# Push schema changes (development)
npx prisma db push

# Push with force reset (careful!)
npx prisma db push --force-reset

# Pull schema from database
npx prisma db pull

# Execute SQL
npx prisma db execute --stdin <<< "SELECT * FROM \"User\" LIMIT 5"
```

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_farm_status

# Apply migrations (production)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset database (development only!)
npx prisma migrate reset

# Resolve failed migration
npx prisma migrate resolve --applied 20231201_migration_name
npx prisma migrate resolve --rolled-back 20231201_migration_name
```

### Data Management

```bash
# Seed database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Studio on different port
npx prisma studio --port 5556
```

---

## 🐳 Docker Commands

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f postgres

# Restart service
docker-compose restart postgres

# Rebuild and start
docker-compose up -d --build
```

### Docker Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>

# Remove all stopped containers
docker container prune

# View container logs
docker logs <container_id>

# Follow container logs
docker logs -f <container_id>

# Execute command in container
docker exec -it <container_id> bash

# Connect to PostgreSQL in container
docker exec -it postgres_container psql -U postgres -d farmers_market
```

### Docker Image Management

```bash
# Build image
docker build -t farmers-market-platform .

# Build with no cache
docker build --no-cache -t farmers-market-platform .

# List images
docker images

# Remove image
docker rmi <image_id>

# Remove unused images
docker image prune

# Remove all images
docker image prune -a
```

### Docker System

```bash
# View disk usage
docker system df

# Clean up everything
docker system prune -a --volumes

# View Docker info
docker info

# View Docker version
docker version
```

---

## 🔀 Git Commands

### Daily Workflow

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/farm-details

# Stage changes
git add .

# Commit changes
git commit -m "feat: add farm details page"

# Push to remote
git push origin feature/farm-details

# Create PR (GitHub CLI)
gh pr create --title "Add farm details page" --body "Description"
```

### Branch Management

```bash
# List branches
git branch

# List remote branches
git branch -r

# Create and switch to branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Rename current branch
git branch -m new-branch-name
```

### Stashing

```bash
# Stash changes
git stash

# Stash with message
git stash save "work in progress"

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Drop stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

### Undoing Changes

```bash
# Discard changes in file
git checkout -- file.ts

# Discard all changes
git checkout -- .

# Unstage file
git reset HEAD file.ts

# Undo last commit (keep changes)
git reset --soft HEAD^

# Undo last commit (discard changes)
git reset --hard HEAD^

# Amend last commit
git commit --amend
```

### History & Logs

```bash
# View commit history
git log

# View compact history
git log --oneline

# View history with graph
git log --oneline --graph --all

# View file history
git log --follow file.ts

# View changes in commit
git show <commit_hash>

# View who changed what
git blame file.ts
```

---

## 🔧 Quick Fixes

### Port Already in Use

```bash
# Find process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Issues

```bash
# 1. Check database is running
docker ps | grep postgres

# 2. Start database
docker-compose up -d postgres

# 3. Verify connection
npx prisma db execute --stdin <<< "SELECT 1"

# 4. Regenerate Prisma client
npx prisma generate

# 5. Test health endpoint
curl http://localhost:3000/api/health/db
```

### Module Not Found

```bash
# 1. Clear caches
rm -rf .next node_modules package-lock.json

# 2. Reinstall
npm install

# 3. Regenerate Prisma
npx prisma generate

# 4. Restart dev server
npm run dev
```

### TypeScript Errors

```bash
# 1. Regenerate Prisma types
npx prisma generate

# 2. Restart TypeScript server (VS Code)
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# 3. Type check
npm run type-check

# 4. Clear TypeScript cache
rm -rf .next
```

### Build Failing

```bash
# 1. Clean everything
npm run clean

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Regenerate Prisma
npx prisma generate

# 4. Try build
npm run build
```

---

## 🧪 Testing Commands

### Unit Tests

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Single file
npm test -- farm.service.test.ts

# Pattern matching
npm test -- --testNamePattern="createFarm"

# Update snapshots
npm test -- -u
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Single integration test
npm run test:integration -- api.test.ts

# With coverage
npm run test:integration:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Specific file
npm run test:e2e -- login.spec.ts

# Update snapshots
npm run test:e2e -- --update-snapshots
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Check coverage thresholds
npm run test:coverage -- --coverage
```

---

## 🚢 Deployment Commands

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

### Docker Production

```bash
# Build production image
docker build -t farmers-market:latest .

# Run production container
docker run -p 3000:3000 --env-file .env.production farmers-market:latest

# With docker-compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Deployment Verification

```bash
# Health check
curl https://yourdomain.com/api/health

# Database health
curl https://yourdomain.com/api/health/db

# Check all services
curl https://yourdomain.com/api/health/all

# Performance check
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com
```

---

## 📊 Health Checks

### Application Health

```bash
# Basic health check
curl http://localhost:3000/api/health

# Database connection
curl http://localhost:3000/api/health/db

# All services
curl http://localhost:3000/api/health/all

# Detailed response
curl -v http://localhost:3000/api/health
```

### Database Health

```bash
# PostgreSQL connection test
psql -h localhost -U postgres -d farmers_market -c "SELECT 1"

# Inside Docker container
docker exec -it postgres_container psql -U postgres -d farmers_market -c "SELECT NOW()"

# Prisma health check
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\""
```

### Service Health

```bash
# Redis health
redis-cli ping

# Docker health
docker ps

# All containers health
docker-compose ps

# System resources
docker stats
```

---

## 📝 Viewing Logs

### Application Logs

```bash
# Development server logs
# (Visible in terminal where npm run dev is running)

# Production logs (PM2)
pm2 logs farmers-market

# Vercel logs
vercel logs

# Docker logs
docker logs -f <container_name>
```

### Database Logs

```bash
# PostgreSQL logs (Docker)
docker logs postgres_container

# Follow logs
docker logs -f postgres_container

# Last 100 lines
docker logs --tail 100 postgres_container
```

### Test Logs

```bash
# Verbose test output
npm test -- --verbose

# Debug test
DEBUG=* npm test

# Playwright debug
DEBUG=pw:api npm run test:e2e
```

---

## 🔍 Debugging Commands

### Node.js Debugging

```bash
# Start with inspector
node --inspect node_modules/.bin/next dev

# Start with break on first line
node --inspect-brk node_modules/.bin/next dev

# Chrome DevTools
# Navigate to: chrome://inspect
```

### Database Debugging

```bash
# Open Prisma Studio
npx prisma studio

# View query logs
# Add to .env.local:
# DEBUG="prisma:query"

# Execute raw SQL
npx prisma db execute --stdin <<< "
  SELECT * FROM \"Farm\"
  WHERE status = 'ACTIVE'
  LIMIT 10
"
```

### Network Debugging

```bash
# Test endpoint
curl -v http://localhost:3000/api/farms

# With authentication
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/farms

# POST request
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farm"}' \
  http://localhost:3000/api/farms
```

---

## 🛠️ System Commands

### Process Management

```bash
# Find Node.js processes
ps aux | grep node

# Kill process by PID
kill -9 <PID>

# Kill all Node.js processes
pkill -f node

# Find process using port
lsof -i :3000
```

### File System

```bash
# Check disk space
df -h

# Check directory size
du -sh .

# Find large files
find . -type f -size +100M

# Count files in directory
find . -type f | wc -l
```

### Performance

```bash
# Monitor system resources
top  # or htop

# Monitor specific process
top -pid <PID>

# Memory usage
free -h  # Linux
vm_stat  # macOS
```

---

## 📚 Related Quick References

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** — General quick reference
- **[QUICK_SETUP_COMMANDS.md](./QUICK_SETUP_COMMANDS.md)** — Setup commands
- **[QUICK_FIX_REFERENCE.md](./QUICK_FIX_REFERENCE.md)** — Common fixes
- **[QUICK_START_CARD.md](./QUICK_START_CARD.md)** — Quick start guide
- **[SECURITY_TESTING_QUICKREF.md](./SECURITY_TESTING_QUICKREF.md)** — Security testing
- **[VISUAL_TESTING_QUICK_REFERENCE.md](./VISUAL_TESTING_QUICK_REFERENCE.md)** — Visual testing
- **[BOT_COVERAGE_QUICK_REFERENCE.md](./BOT_COVERAGE_QUICK_REFERENCE.md)** — Bot commands

---

## 💡 Pro Tips

### Aliases for Common Commands

```bash
# Add to ~/.bashrc or ~/.zshrc

# Development
alias dev="npm run dev"
alias build="npm run build"
alias test="npm test"

# Git
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push"
alias gl="git log --oneline --graph"

# Docker
alias dcu="docker-compose up -d"
alias dcd="docker-compose down"
alias dcl="docker-compose logs -f"

# Prisma
alias pg="npx prisma generate"
alias ps="npx prisma studio"
alias pm="npx prisma migrate dev"
```

### VS Code Shortcuts

```yaml
Cmd+Shift+P: Command palette
Cmd+P: Quick file open
Cmd+Shift+F: Search in files
Cmd+`: Toggle terminal
Cmd+B: Toggle sidebar
Cmd+/: Toggle comment
F12: Go to definition
Shift+F12: Find references
```

### Keyboard Shortcuts

```yaml
Terminal:
  Ctrl+C: Stop process
  Ctrl+Z: Suspend process
  Ctrl+A: Start of line
  Ctrl+E: End of line
  Ctrl+R: Search history
  Ctrl+L: Clear screen
```

---

## 🔗 Related Documentation

- **[Troubleshooting Hub](../troubleshooting/README.md)** — Detailed problem solving
- **[Development Guide](../development/README.md)** — Development workflows
- **[Testing Guide](../testing/README.md)** — Testing procedures
- **[Deployment Guide](../deployment/README.md)** — Deployment instructions

---

**Last Updated:** December 2024  
**Maintained By:** Platform Engineering Team  
**Status:** ✅ Complete Command Reference

⚡ **Quick commands for divine agricultural development!** 🚀✨
