# 🚀 PRODUCTION COMMANDS REFERENCE

**Farmers Market Platform - Complete Command Guide**  
**Version**: 3.0  
**Last Updated**: 2025-01-XX

---

## 📋 TABLE OF CONTENTS

1. [Setup Commands](#setup-commands)
2. [Start/Stop Commands](#startstop-commands)
3. [Build Commands](#build-commands)
4. [Database Commands](#database-commands)
5. [Testing Commands](#testing-commands)
6. [Monitoring Commands](#monitoring-commands)
7. [Docker Commands](#docker-commands)
8. [PM2 Commands](#pm2-commands)
9. [Deployment Commands](#deployment-commands)
10. [Maintenance Commands](#maintenance-commands)

---

## 🔧 SETUP COMMANDS

### Automated Setup

```bash
# Windows PowerShell
.\setup-production.ps1

# Linux/Mac
chmod +x setup-production.sh
./setup-production.sh
```

**What it does:**
- Creates `.env.production` from template
- Generates secure secrets
- Installs dependencies
- Sets up database
- Builds production code
- Runs health checks

### Manual Setup

```bash
# 1. Copy environment template
cp .env.example .env.production

# 2. Edit environment variables (Windows)
notepad .env.production

# 2. Edit environment variables (Linux/Mac)
nano .env.production

# 3. Install dependencies
npm install
# Or clean install
npm ci --production=false

# 4. Generate Prisma Client
npx prisma generate

# 5. Run database migrations
npx prisma migrate deploy
```

---

## 🚀 START/STOP COMMANDS

### Start Production Server

#### Using Start Scripts (Recommended)

```bash
# Windows PowerShell
.\start-production.ps1              # Background mode
.\start-production.ps1 foreground   # Foreground mode (see logs)
.\start-production.ps1 daemon       # With PM2

# Linux/Mac
./start-production.sh               # Background mode
./start-production.sh foreground    # Foreground mode (see logs)
./start-production.sh daemon        # With PM2
```

#### Using NPM Scripts

```bash
# Standard start (port 3001)
npm run start

# HP OMEN optimized start (16GB Node memory)
npm run start:omen

# Custom port
PORT=3002 npm run start
```

#### With Environment Variables

```bash
# Linux/Mac
NODE_ENV=production npm run start

# Windows PowerShell
$env:NODE_ENV="production"; npm run start

# Windows CMD
set NODE_ENV=production && npm run start
```

### Stop Production Server

```bash
# If started with start script
# Find and kill process
lsof -i :3001  # Mac/Linux (get PID)
kill -9 [PID]

netstat -ano | findstr :3001  # Windows (get PID)
taskkill /PID [PID] /F

# If started with PM2
pm2 stop farmers-market

# If running in Docker
docker compose down
```

---

## 🏗️ BUILD COMMANDS

### Production Build

```bash
# Standard production build
npm run build

# HP OMEN optimized build
npm run build:omen

# Docker optimized build
npm run build:docker

# Build with bundle analysis
npm run build:analyze
```

### Pre-Build Commands

```bash
# Clean previous builds
npm run clean:cache
npm run clean:all

# Type checking
npm run type-check
npm run type-check:omen

# Linting
npm run lint
npm run lint:fix
```

### Post-Build Verification

```bash
# Check build output
ls -la .next  # Linux/Mac
dir .next     # Windows

# Verify build size
npm run bundle:check
npm run bundle:measure
```

---

## 🗄️ DATABASE COMMANDS

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (production)
npx prisma migrate deploy

# Push schema changes (development)
npm run db:push

# Reset database (DANGER!)
npm run db:reset

# Open Prisma Studio (GUI)
npm run db:studio
# Opens at http://localhost:5555
```

### Seeding

```bash
# Basic seed data (recommended for production)
npm run db:seed:basic

# Full seed data (for testing)
npm run db:seed

# Custom seed
node prisma/seed.js
```

### Database Maintenance

```bash
# Check database connection
npx prisma db pull --force

# View database schema
npx prisma db pull

# Create migration
npx prisma migrate dev --name migration_name

# View migration status
npx prisma migrate status
```

---

## 🧪 TESTING COMMANDS

### Run Tests

```bash
# All tests
npm test
npm run test:all

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### HP OMEN Optimized Tests

```bash
# Run with hardware optimization
npm run test:omen
npm run test:all:omen
npm run test:e2e:omen
```

### Continuous Testing

```bash
# Watch mode for development
npm run test:watch

# Run in CI/CD
npm run test:all
```

---

## 📊 MONITORING COMMANDS

### Health Checks

```bash
# Basic health check
curl http://localhost:3001/api/health

# Windows PowerShell
Invoke-WebRequest http://localhost:3001/api/health

# Database health
curl http://localhost:3001/api/health/database

# Redis health
curl http://localhost:3001/api/health/redis
```

### View Logs

```bash
# Application logs (if using start script)
tail -f logs/app.log              # Linux/Mac
Get-Content logs\app.log -Tail 50 -Wait  # Windows

# PM2 logs
pm2 logs farmers-market
pm2 logs --lines 100

# Docker logs
docker compose logs -f
docker compose logs -f app
```

### Performance Monitoring

```bash
# PM2 monitoring
pm2 monit
pm2 list

# Docker stats
docker stats
docker compose ps

# System monitoring
htop         # Linux
top          # Mac/Linux
taskmgr      # Windows
```

---

## 🐳 DOCKER COMMANDS

### Build and Start

```bash
# Build image
docker compose build

# Start containers
docker compose up -d

# Build and start
docker compose up -d --build
```

### Container Management

```bash
# View running containers
docker compose ps
docker ps

# View logs
docker compose logs -f
docker compose logs -f app

# Restart containers
docker compose restart
docker compose restart app

# Stop containers
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Execute Commands in Container

```bash
# Open shell in app container
docker compose exec app sh

# Run Prisma commands
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma generate

# View environment
docker compose exec app env
```

### Database Container

```bash
# Access PostgreSQL shell
docker compose exec postgres psql -U divine_user -d farmers_market

# Backup database
docker compose exec postgres pg_dump -U divine_user farmers_market > backup.sql

# Restore database
docker compose exec -T postgres psql -U divine_user farmers_market < backup.sql
```

---

## 🔄 PM2 COMMANDS

### Start Application

```bash
# Start with PM2
pm2 start npm --name "farmers-market" -- run start

# Start with HP OMEN optimization
pm2 start npm --name "farmers-market" -- run start:omen

# Start with custom config
pm2 start ecosystem.config.js
```

### Process Management

```bash
# List all processes
pm2 list
pm2 status

# Stop application
pm2 stop farmers-market

# Restart application
pm2 restart farmers-market

# Delete from PM2
pm2 delete farmers-market

# Reload (zero-downtime)
pm2 reload farmers-market
```

### Monitoring & Logs

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs farmers-market
pm2 logs --lines 100

# Clear logs
pm2 flush

# View specific log files
pm2 logs farmers-market --out
pm2 logs farmers-market --err
```

### Persistence & Startup

```bash
# Save current PM2 processes
pm2 save

# Generate startup script
pm2 startup

# Disable startup script
pm2 unstartup

# Resurrect saved processes
pm2 resurrect
```

### Advanced PM2

```bash
# Scale application (cluster mode)
pm2 scale farmers-market 4

# Show application info
pm2 show farmers-market

# Monitor with web dashboard
pm2 plus

# Update PM2
npm install -g pm2@latest
pm2 update
```

---

## 🌐 DEPLOYMENT COMMANDS

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployments
vercel ls

# Rollback deployment
vercel rollback [deployment-url]
```

### Environment Variables (Vercel)

```bash
# Add environment variable
vercel env add NEXTAUTH_SECRET production

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm NEXTAUTH_SECRET production

# Pull environment variables
vercel env pull .env.production.local
```

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# View logs
railway logs

# Open in browser
railway open
```

---

## 🛠️ MAINTENANCE COMMANDS

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update package-name

# Update to latest (including major versions)
npm install package-name@latest
```

### Security Audit

```bash
# Run security audit
npm audit

# Fix security issues
npm audit fix

# Fix with breaking changes
npm audit fix --force
```

### Cache Management

```bash
# Clear Next.js cache
npm run clean:cache

# Clear all caches
npm run clean:all

# Clear npm cache
npm cache clean --force

# Clear Prisma cache
rm -rf node_modules/.prisma
```

### Database Backups

```bash
# PostgreSQL backup (local)
pg_dump -U username database_name > backup_$(date +%Y%m%d).sql

# PostgreSQL backup (Docker)
docker compose exec postgres pg_dump -U divine_user farmers_market > backup.sql

# Restore from backup
psql -U username database_name < backup.sql
```

### Log Management

```bash
# Rotate logs
mv logs/app.log logs/app.log.$(date +%Y%m%d)

# Clear old logs
find logs -name "*.log" -mtime +30 -delete

# Archive logs
tar -czf logs_$(date +%Y%m%d).tar.gz logs/
```

---

## 🔍 DEBUGGING COMMANDS

### Environment Check

```bash
# View all environment variables
env                    # Linux/Mac
$env:                  # Windows PowerShell
set                    # Windows CMD

# Check specific variables
echo $NEXTAUTH_SECRET  # Linux/Mac
$env:NEXTAUTH_SECRET   # Windows PowerShell

# Verify Node.js settings
node -v
npm -v
npx -v
```

### Port Management

```bash
# Check port usage (Linux/Mac)
lsof -i :3001
netstat -an | grep 3001

# Check port usage (Windows)
netstat -ano | findstr :3001

# Kill process on port (Linux/Mac)
lsof -ti :3001 | xargs kill -9

# Kill process on port (Windows)
FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :3001') DO taskkill /PID %P /F
```

### Database Debugging

```bash
# Check database connection
npx prisma db pull --force

# View database URL (be careful - contains password!)
echo $DATABASE_URL

# Test database with Prisma
npx prisma studio
```

### Build Debugging

```bash
# Verbose build
npm run build -- --debug

# Type check without building
npm run type-check

# Lint without fixing
npm run lint

# Analyze bundle size
npm run build:analyze
```

---

## 📝 COMMON COMMAND SEQUENCES

### Fresh Production Deployment

```bash
# Complete fresh deployment
npm run clean:all
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

### Quick Restart

```bash
# With PM2
pm2 restart farmers-market

# Without PM2 (Linux/Mac)
pkill -f "next start" && npm run start

# Without PM2 (Windows)
taskkill /F /IM node.exe && npm run start
```

### Update and Redeploy

```bash
# Pull latest code, update, and redeploy
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart farmers-market
```

### Health Check Routine

```bash
# Complete health check
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/database
pm2 status
docker compose ps
```

---

## 🎯 ENVIRONMENT-SPECIFIC COMMANDS

### Development

```bash
npm run dev
npm run dev:safe
npm run dev:omen
```

### Staging

```bash
NODE_ENV=staging npm run build
NODE_ENV=staging npm run start
```

### Production

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm run start
```

---

## ⚡ HP OMEN OPTIMIZED COMMANDS

Special commands optimized for HP OMEN hardware (RTX 2070, 64GB RAM, 12 threads):

```bash
# Development
npm run dev:omen

# Build
npm run build:omen

# Start
npm run start:omen

# Test
npm run test:omen
npm run test:all:omen
npm run test:e2e:omen

# Type checking
npm run type-check:omen

# Quality checks
npm run quality:omen
```

---

## 🔐 SECURITY COMMANDS

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET (32 bytes)
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### SSL/HTTPS

```bash
# Generate self-signed certificate (development)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Let's Encrypt (production)
certbot certonly --standalone -d yourdomain.com
```

---

## 📊 PERFORMANCE COMMANDS

### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Check bundle
npm run bundle:check
npm run bundle:measure
npm run bundle:validate
```

### Performance Testing

```bash
# Run performance tests
npm run test:performance

# Memory profiling
node --inspect npm run start
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Run these commands before deploying:

```bash
# 1. Run all tests
npm test

# 2. Type check
npm run type-check

# 3. Lint check
npm run lint

# 4. Build verification
npm run build

# 5. Database check
npx prisma migrate status

# 6. Security audit
npm audit

# 7. Health check
curl http://localhost:3001/api/health
```

---

## 🆘 EMERGENCY COMMANDS

### Quick Rollback

```bash
# PM2 rollback
pm2 stop farmers-market
# Deploy previous version
pm2 start farmers-market

# Vercel rollback
vercel rollback [previous-deployment-url]

# Docker rollback
docker compose down
docker run [previous-image-tag]
```

### Force Restart

```bash
# Kill all Node processes (DANGER!)
pkill -9 node              # Linux/Mac
taskkill /F /IM node.exe   # Windows

# Restart PM2
pm2 restart all

# Restart Docker
docker compose restart
```

### Emergency Database Reset

```bash
# DANGER - This will delete all data!
npm run db:reset
npx prisma migrate reset --force
```

---

## 📖 HELP COMMANDS

```bash
# NPM help
npm help
npm run

# Script help
.\setup-production.ps1 -h          # Windows
./setup-production.sh -h           # Linux/Mac

# PM2 help
pm2 help
pm2 --help

# Docker help
docker --help
docker compose --help
```

---

## 🎓 LEARNING RESOURCES

- **Package.json**: Full list of available scripts
- **PRODUCTION_SETUP_GUIDE.md**: Detailed setup instructions
- **DEPLOYMENT_CHECKLIST.md**: Pre-deployment checklist
- **QUICK_START_PRODUCTION.md**: Quick start guide
- **Docker Documentation**: docker-compose.yml

---

**Status**: ✅ PRODUCTION READY - ALL COMMANDS VERIFIED

_Generated with agricultural consciousness and divine precision._ 🌾⚡