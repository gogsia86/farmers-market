# 🐳 Docker Restart Guide - After Repository Cleanup
## Farmers Market Platform - Fresh Start Instructions

**Last Updated**: January 2025  
**Purpose**: Clean restart of Docker environment after repository cleanup  
**Estimated Time**: 10-15 minutes  

---

## 📋 PRE-RESTART CHECKLIST

Before restarting Docker, ensure:

- ✅ Repository cleanup completed (`scripts/cleanup-docs.sh`)
- ✅ Backup files removed (`scripts/remove-backups.sh`)
- ✅ Changes committed to git
- ✅ Environment variables configured (`.env` file)
- ✅ Docker Desktop is running (if using Docker Desktop)

---

## 🧹 STEP 1: COMPLETE CLEANUP

### Stop All Running Containers

```bash
# Stop all project containers
docker-compose down -v

# Stop development containers
docker-compose -f docker-compose.dev.yml down -v

# Verify nothing is running
docker ps -a | grep farmers-market
```

### Clean Docker System (Optional - Aggressive)

```bash
# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# OR: Clean everything at once (CAUTION: affects all Docker projects)
docker system prune -a --volumes -f
```

### Clean Build Caches

```bash
# Clean Next.js build cache
npm run clean:cache

# OR manually
rm -rf .next .jest-cache dist

# Clean node_modules if needed (will require reinstall)
# rm -rf node_modules
# npm install
```

---

## ⚙️ STEP 2: ENVIRONMENT CONFIGURATION

### Create/Update .env File

```bash
# Copy example if .env doesn't exist
cp .env.example .env

# Edit .env with your values
nano .env
# OR
code .env
```

### Required Environment Variables

**Minimum Required:**
```env
# Database
DATABASE_URL=postgresql://farmers_user:changeme123@postgres:5432/farmers_market?schema=public

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl
NEXTAUTH_URL=http://localhost:3000

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (optional - defaults to console logging)
EMAIL_PROVIDER=console
EMAIL_FROM=noreply@farmersmarket.local
```

**Generate Secrets:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate additional secrets if needed
openssl rand -hex 32
```

---

## 🚀 STEP 3: DEVELOPMENT RESTART

### Option A: Quick Start (Recommended for Development)

```bash
# Start development environment
npm run docker:up-build-dev

# This runs: docker-compose -f docker-compose.dev.yml up --build
```

### Option B: Step-by-Step Development Start

```bash
# 1. Build images
docker-compose -f docker-compose.dev.yml build

# 2. Start services
docker-compose -f docker-compose.dev.yml up -d

# 3. Watch logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Option C: Manual Development Commands

```bash
# Start with specific services
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for services to be healthy (30 seconds)
sleep 30

# Start app
docker-compose -f docker-compose.dev.yml up app
```

---

## 🏭 STEP 4: PRODUCTION RESTART

### Option A: Quick Production Start

```bash
# Start production environment
npm run docker:up-build

# This runs: docker-compose up --build -d
```

### Option B: Step-by-Step Production Start

```bash
# 1. Build production image
docker-compose build --no-cache

# 2. Start all services
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f app
```

---

## 🗄️ STEP 5: DATABASE SETUP

### Run Migrations

```bash
# Development
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy

# Production
docker-compose exec app npx prisma migrate deploy
```

### Seed Database (Optional)

```bash
# Development
docker-compose -f docker-compose.dev.yml exec app npm run db:seed

# Production
docker-compose exec app npm run db:seed
```

### Verify Database

```bash
# Check database connection
docker-compose exec postgres psql -U farmers_user -d farmers_market -c "SELECT 1;"

# List tables
docker-compose exec postgres psql -U farmers_user -d farmers_market -c "\dt"

# Check Prisma Studio (optional)
docker-compose exec app npx prisma studio
# Visit: http://localhost:5555
```

---

## ✅ STEP 6: VERIFICATION

### Health Checks

```bash
# Check all services
docker-compose ps

# Expected output:
# NAME                  STATUS              PORTS
# farmers-market-app    Up (healthy)        0.0.0.0:3000->3000/tcp
# farmers-market-db     Up (healthy)        0.0.0.0:5432->5432/tcp
# farmers-market-redis  Up (healthy)        0.0.0.0:6379->6379/tcp
```

### Service Health Endpoints

```bash
# App health check
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Database check
docker-compose exec postgres pg_isready -U farmers_user
# Expected: postgres:5432 - accepting connections

# Redis check
docker-compose exec redis redis-cli ping
# Expected: PONG
```

### Access Services

- **Application**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (if running)
- **PgAdmin** (if enabled): http://localhost:5050
- **Redis Commander** (if enabled): http://localhost:8081

---

## 🔍 STEP 7: TESTING

### Run Tests Inside Container

```bash
# Unit tests
docker-compose exec app npm run test:unit

# Integration tests
docker-compose exec app npm run test:integration

# E2E tests
docker-compose exec app npm run test:e2e
```

### Test API Endpoints

```bash
# Test farm endpoints
curl http://localhost:3000/api/farms

# Test health endpoint
curl http://localhost:3000/api/health

# Test with authentication (after creating user)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/farms
```

---

## 📊 STEP 8: MONITORING

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 app
```

### Monitor Resources

```bash
# Real-time stats
docker stats

# Service resource usage
docker-compose top
```

### Database Monitoring

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U farmers_user -d farmers_market

# Check active connections
docker-compose exec postgres psql -U farmers_user -d farmers_market -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
docker-compose exec postgres psql -U farmers_user -d farmers_market -c "SELECT pg_size_pretty(pg_database_size('farmers_market'));"
```

---

## 🐛 TROUBLESHOOTING

### Issue: Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in docker-compose.yml
# ports:
#   - "3001:3000"  # Use port 3001 instead
```

### Issue: Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Restart PostgreSQL
docker-compose restart postgres

# Wait for health check
docker-compose ps | grep postgres
```

### Issue: Build Failures

```bash
# Clear Docker build cache
docker builder prune -a -f

# Rebuild without cache
docker-compose build --no-cache

# Check Docker disk space
docker system df

# Clean up space if needed
docker system prune -a --volumes -f
```

### Issue: Permission Errors

```bash
# Fix ownership (Linux/macOS)
sudo chown -R $USER:$USER .

# On Windows, run Docker Desktop as administrator
```

### Issue: App Won't Start

```bash
# Check app logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep -E "(DATABASE|NEXTAUTH|NODE_ENV)"

# Restart app service
docker-compose restart app

# Rebuild app
docker-compose up --build app
```

---

## 🔄 COMMON OPERATIONS

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart postgres
```

### Rebuild After Code Changes

```bash
# Development (hot reload enabled)
# No rebuild needed - just save files!

# Production (requires rebuild)
docker-compose up --build -d app
```

### Access Container Shell

```bash
# Access app container
docker-compose exec app sh

# Access database container
docker-compose exec postgres bash

# Access Redis container
docker-compose exec redis sh
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U farmers_user farmers_market > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T postgres psql -U farmers_user farmers_market < backup_20250115_120000.sql
```

---

## 🛑 SHUTDOWN

### Graceful Shutdown

```bash
# Stop services (keep volumes)
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# Stop and remove everything
docker-compose down -v --rmi all
```

### Emergency Stop

```bash
# Force stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)
```

---

## 📈 PERFORMANCE OPTIMIZATION

### For HP OMEN (12 threads, 64GB RAM)

Update `docker-compose.yml` resources:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "8"        # Use 8 of 12 cores
          memory: 8G       # Use 8GB of 64GB
        reservations:
          cpus: "4"
          memory: 4G
```

### Build Performance

```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
echo 'export COMPOSE_DOCKER_CLI_BUILD=1' >> ~/.bashrc
```

---

## ✅ SUCCESS CHECKLIST

After restart, verify:

- [ ] All services show "Up (healthy)" status
- [ ] Application accessible at http://localhost:3000
- [ ] Health endpoint returns 200 OK
- [ ] Database migrations completed
- [ ] Database seeded (if applicable)
- [ ] Redis cache working
- [ ] Logs show no errors
- [ ] Tests pass inside containers
- [ ] API endpoints responding

---

## 📞 QUICK COMMANDS REFERENCE

```bash
# Start
npm run docker:up-build-dev     # Development
npm run docker:up-build         # Production

# Stop
npm run docker:down             # Graceful stop
npm run docker:down-volumes     # Stop + remove data

# Logs
npm run docker:logs             # All services
npm run docker:logs-app         # App only
npm run docker:logs-db          # Database only

# Health
docker-compose ps               # Service status
curl http://localhost:3000/api/health  # App health

# Database
npm run docker:migrate          # Run migrations
npm run docker:seed             # Seed database
npm run docker:prisma-studio    # Open Prisma Studio

# Cleanup
npm run docker:clean            # Remove containers
npm run docker:clean-all        # Nuclear option
```

---

## 🎓 BEST PRACTICES

1. **Always use docker-compose commands** - Don't mix `docker` and `docker-compose`
2. **Check logs regularly** - `docker-compose logs -f`
3. **Use health checks** - Wait for services to be healthy
4. **Backup before major changes** - Database and volumes
5. **Keep .env file secure** - Never commit secrets
6. **Clean up periodically** - `docker system prune` weekly
7. **Monitor resources** - `docker stats` to check usage
8. **Use specific versions** - Pin image versions in production

---

## 🚀 NEXT STEPS

After successful Docker restart:

1. **Deploy to staging** - See `docs/deployment/STAGING_DEPLOYMENT_QUICKSTART.md`
2. **Run integration tests** - `npm run test:integration`
3. **Load test data** - `npm run db:seed`
4. **Configure monitoring** - Set up logging and alerts
5. **Documentation review** - Check `docs/INDEX.md`

---

**Status**: ✅ READY FOR USE  
**Environment**: Development & Production  
**Maintenance**: Keep updated with docker-compose changes  

---

*"Clean restart, clean slate, clean code - the Docker way!"* 🐳✨🚀