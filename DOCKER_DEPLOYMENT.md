# 🐳 Docker Desktop Deployment Guide

**Status:** ✅ Ready to Deploy  
**Platform:** Docker Desktop (Windows/Mac/Linux)  
**Last Updated:** December 25, 2025

---

## 📋 Quick Start

### Option 1: Windows PowerShell (Recommended for Windows)

```powershell
# Full deployment with all services
.\deploy-docker.ps1 -DeployType full

# Quick restart (if already deployed)
.\deploy-docker.ps1 -DeployType quick

# Clean rebuild (remove everything and start fresh)
.\deploy-docker.ps1 -DeployType clean

# With admin tools (PgAdmin, Redis Commander)
.\deploy-docker.ps1 -DeployType full -WithAdmin

# Skip database seeding
.\deploy-docker.ps1 -DeployType full -NoSeed
```

### Option 2: Bash (Linux/Mac/WSL)

```bash
# Make script executable
chmod +x deploy-docker.sh

# Run deployment
./deploy-docker.sh

# Follow interactive prompts to choose deployment type
```

### Option 3: Manual Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# With admin tools
docker-compose --profile admin up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 🏗️ What Gets Deployed

### Core Services (Always)

- **PostgreSQL Database** (port 5432)
  - Production-optimized configuration
  - Persistent data storage
  - Health checks enabled

- **Redis Cache** (port 6379)
  - Session storage
  - Query caching
  - Real-time data

- **Next.js Application** (port 3000)
  - Production build
  - Server-side rendering
  - API routes
  - Health endpoint: `/api/health`

- **Nginx Reverse Proxy** (ports 80/443)
  - Static file serving
  - SSL/TLS termination
  - Load balancing
  - Request routing

### Admin Tools (Optional - with `--profile admin`)

- **PgAdmin** (port 5050)
  - Database management UI
  - Query builder
  - Visual schema explorer

- **Redis Commander** (port 8081)
  - Redis key browser
  - Real-time monitoring
  - Command interface

---

## 📊 Deployment Types

### 1. Full Deployment (Recommended)

**Use when:** First deployment or after major changes

**What it does:**

- ✅ Stops existing containers
- ✅ Cleans build artifacts
- ✅ Builds fresh Docker image
- ✅ Starts all services
- ✅ Runs database migrations
- ✅ (Optional) Seeds sample data
- ✅ Verifies all services healthy

**Time:** ~5-10 minutes (depending on hardware)

### 2. Quick Restart

**Use when:** Minor config changes or quick restart needed

**What it does:**

- ✅ Restarts existing containers
- ✅ Loads new environment variables
- ⚠️ Does NOT rebuild image
- ⚠️ Does NOT run migrations

**Time:** ~30 seconds

### 3. Clean Rebuild

**Use when:** Something is broken or testing from scratch

**What it does:**

- ⚠️ Removes ALL containers
- ⚠️ Removes ALL volumes (data loss!)
- ⚠️ Removes ALL images
- ✅ Rebuilds everything from scratch
- ✅ Fresh database with migrations
- ✅ Clean slate deployment

**Time:** ~10-15 minutes

---

## 🔧 Prerequisites

### Required

- ✅ **Docker Desktop** installed and running
- ✅ **16GB RAM** minimum (32GB recommended)
- ✅ **20GB free disk space** minimum
- ✅ **Internet connection** for first build

### Check Docker Status

```bash
# Test Docker is running
docker info

# Check Docker Compose version
docker-compose --version

# Should be Docker Compose v2.0+
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create or update `.env` file:

```env
# ============================================================================
# REQUIRED - Application
# ============================================================================
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# ============================================================================
# REQUIRED - Database
# ============================================================================
POSTGRES_USER=farmers_user
POSTGRES_PASSWORD=changeme123
POSTGRES_DB=farmers_market
DATABASE_URL=postgresql://farmers_user:changeme123@postgres:5432/farmers_market

# ============================================================================
# REQUIRED - Redis
# ============================================================================
REDIS_PASSWORD=redispass123
REDIS_URL=redis://:redispass123@redis:6379/0

# ============================================================================
# OPTIONAL - Payment Processing
# ============================================================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================================================
# OPTIONAL - Email Service
# ============================================================================
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_...
EMAIL_FROM=noreply@farmersmarket.com

# ============================================================================
# OPTIONAL - Maps & Analytics
# ============================================================================
GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_ANALYTICS_ID=G-...

# ============================================================================
# OPTIONAL - Image Upload
# ============================================================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================================================
# OPTIONAL - AI Features
# ============================================================================
OPENAI_API_KEY=sk-...

# ============================================================================
# OPTIONAL - Monitoring
# ============================================================================
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### 2. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET (Linux/Mac/WSL)
openssl rand -base64 32

# Generate NEXTAUTH_SECRET (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🚀 Deployment Steps

### Step 1: Pre-deployment Checklist

```bash
# 1. Ensure Docker Desktop is running
docker info

# 2. Check current directory
pwd  # Should be in project root

# 3. Verify .env file exists
ls -la .env

# 4. Verify docker-compose.yml exists
ls -la docker-compose.yml
```

### Step 2: Run Deployment Script

**Windows (PowerShell):**

```powershell
.\deploy-docker.ps1 -DeployType full
```

**Linux/Mac/WSL (Bash):**

```bash
./deploy-docker.sh
# Select option 1 (Full deployment)
```

### Step 3: Wait for Completion

The script will:

1. ✅ Check Docker is running
2. ✅ Verify .env configuration
3. ✅ Stop existing containers
4. ✅ Clean build artifacts
5. ✅ Build production Docker image (~5-8 min)
6. ✅ Start all services
7. ✅ Wait for health checks
8. ✅ Run database migrations
9. ✅ (Optional) Seed sample data
10. ✅ Display access URLs

### Step 4: Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Should show:
# - farmers-market-db       (healthy)
# - farmers-market-redis    (healthy)
# - farmers-market-app      (healthy)
# - farmers-market-nginx    (healthy)

# Check application logs
docker-compose logs app

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## 🌐 Access Your Application

### Main Application

```
🌐 URL: http://localhost:3000
🌐 URL: http://localhost (via Nginx)
```

### Admin Tools (if deployed with `--profile admin`)

```
🔧 PgAdmin:       http://localhost:5050
   Email:         admin@farmersmarket.com
   Password:      admin123

📊 Redis Commander: http://localhost:8081
   Username:      admin
   Password:      admin123
```

### Test Accounts

```
👨‍🌾 Farmer:
   Email:    farmer@example.com
   Password: password123

👤 Customer:
   Email:    customer@example.com
   Password: password123

👑 Admin:
   Email:    admin@example.com
   Password: password123
```

---

## 📋 Common Commands

### Container Management

```bash
# View all containers
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f app
docker-compose logs -f postgres

# Restart a service
docker-compose restart app

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ DATA LOSS!)
docker-compose down -v
```

### Database Operations

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U farmers_user -d farmers_market

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run db:seed

# Reset database (⚠️ DATA LOSS!)
docker-compose exec app npx prisma migrate reset --force

# Create database backup
docker-compose exec postgres pg_dump -U farmers_user farmers_market > backup.sql

# Restore database backup
cat backup.sql | docker-compose exec -T postgres psql -U farmers_user -d farmers_market
```

### Application Operations

```bash
# Rebuild application (after code changes)
docker-compose build app
docker-compose up -d app

# Access application shell
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm run test
docker-compose exec app npm run lint

# Clear application cache
docker-compose exec app rm -rf .next
docker-compose restart app
```

### Redis Operations

```bash
# Access Redis CLI
docker-compose exec redis redis-cli -a redispass123

# Clear Redis cache
docker-compose exec redis redis-cli -a redispass123 FLUSHALL

# Monitor Redis commands
docker-compose exec redis redis-cli -a redispass123 MONITOR
```

---

## 🐛 Troubleshooting

### Issue: Docker not running

```bash
# Error: Cannot connect to Docker daemon

# Solution: Start Docker Desktop
# Windows: Open Docker Desktop application
# Mac: Open Docker Desktop application
# Linux: sudo systemctl start docker
```

### Issue: Port already in use

```bash
# Error: Bind for 0.0.0.0:3000 failed: port is already allocated

# Solution 1: Stop conflicting service
# Find what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux

# Kill the process
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                  # Mac/Linux

# Solution 2: Change port in docker-compose.yml
# Edit ports section:
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Issue: Build fails

```bash
# Error: Failed to build Docker image

# Solution: Clean rebuild
docker-compose down -v --rmi all
rm -rf .next node_modules/.cache
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Database migration fails

```bash
# Error: Migration failed

# Solution 1: Check database is running
docker-compose ps postgres

# Solution 2: Reset database (⚠️ DATA LOSS!)
docker-compose exec app npx prisma migrate reset --force
docker-compose exec app npx prisma migrate deploy

# Solution 3: Check database logs
docker-compose logs postgres
```

### Issue: Application won't start

```bash
# Error: App container keeps restarting

# Solution: Check logs
docker-compose logs app

# Common causes:
# 1. DATABASE_URL incorrect → Check .env
# 2. Missing NEXTAUTH_SECRET → Generate and add to .env
# 3. Build error → Check build logs
# 4. Database not ready → Wait for postgres healthy status
```

### Issue: Can't access application

```bash
# Error: ERR_CONNECTION_REFUSED

# Check 1: Is application running?
docker-compose ps app

# Check 2: Is health check passing?
curl http://localhost:3000/api/health

# Check 3: Check firewall
# Windows: Check Windows Defender Firewall
# Mac: Check System Preferences → Security → Firewall
# Linux: sudo ufw status

# Check 4: Try direct app access
# Instead of nginx (port 80), try app directly (port 3000)
http://localhost:3000
```

---

## 📊 Performance Tuning

### Database Optimization

Edit `docker-compose.yml` postgres command section:

```yaml
command:
  - "postgres"
  - "-c"
  - "max_connections=200" # Increase for more concurrent users
  - "-c"
  - "shared_buffers=512MB" # Increase for better caching
  - "-c"
  - "effective_cache_size=2GB" # Increase based on available RAM
```

### Application Resources

Edit `docker-compose.yml` app deploy section:

```yaml
deploy:
  resources:
    limits:
      cpus: "4" # Increase for better performance
      memory: 8G # Increase for larger workloads
```

### Redis Memory

Edit `docker-compose.yml` redis command:

```yaml
command: >
  redis-server
  --maxmemory 512mb  # Increase for more caching
```

---

## 🔒 Security Considerations

### Production Deployment

Before deploying to production:

1. ✅ Change ALL default passwords
2. ✅ Use strong NEXTAUTH_SECRET (min 32 chars)
3. ✅ Enable HTTPS with valid SSL certificates
4. ✅ Set up proper firewall rules
5. ✅ Enable security headers in Nginx
6. ✅ Use secrets management (not .env files)
7. ✅ Enable rate limiting
8. ✅ Set up monitoring and alerts
9. ✅ Regular security updates
10. ✅ Database backups configured

### Environment Variables Security

```bash
# Never commit .env to git
git update-index --assume-unchanged .env

# Use secrets management in production
# - Docker Secrets
# - Kubernetes Secrets
# - AWS Secrets Manager
# - Azure Key Vault
# - HashiCorp Vault
```

---

## 📚 Additional Resources

- **Project Documentation:** `README.md`
- **Fix Documentation:** `PRISMA_PANIC_FIX.md`
- **Build Guide:** `BUILD_COMPLETE.md`
- **Quick Reference:** `QUICK_FIX_REFERENCE.md`
- **Docker Docs:** https://docs.docker.com/
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## ✅ Deployment Checklist

### Before Deployment

- [ ] Docker Desktop installed and running
- [ ] .env file configured with all required variables
- [ ] NEXTAUTH_SECRET generated and set
- [ ] Database credentials set (not using defaults in production)
- [ ] Redis password set (not using defaults in production)
- [ ] Sufficient disk space available (20GB+)
- [ ] Sufficient RAM available (16GB+)

### During Deployment

- [ ] Deployment script completes without errors
- [ ] All containers show "healthy" status
- [ ] Database migrations run successfully
- [ ] Application health check passes
- [ ] No error logs in application

### After Deployment

- [ ] Application accessible via browser
- [ ] Login functionality works
- [ ] Database queries responding
- [ ] Images/uploads working
- [ ] API endpoints responding
- [ ] No console errors in browser
- [ ] Performance acceptable

---

**Status:** ✅ READY TO DEPLOY

**Support:** If issues persist, check logs and documentation above.

_"Deploy with confidence - containerized agricultural excellence!"_ 🌾🐳
