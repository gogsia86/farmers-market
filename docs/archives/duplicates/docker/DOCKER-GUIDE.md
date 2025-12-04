# 🐳 Docker Deployment Guide

**Farmers Market Platform - Complete Docker Setup**

---

## 🎯 Overview

This guide covers running the **entire Farmers Market Platform** in Docker Desktop. Everything runs in containers - no need to install Node.js, PostgreSQL, or Redis locally!

### What Gets Containerized

| Service             | Container                        | Port       | Purpose                     |
| ------------------- | -------------------------------- | ---------- | --------------------------- |
| **Next.js App**     | `farmers-market-dev`             | 3001       | Main application (dev mode) |
| **PostgreSQL**      | `farmers-market-db-dev`          | 5432       | Database with PostGIS       |
| **Redis**           | `farmers-market-redis-dev`       | 6379       | Cache & sessions            |
| **MailHog**         | `farmers-market-mailhog`         | 1025, 8025 | Email testing               |
| **Adminer**         | `farmers-market-adminer`         | 8080       | Database admin UI           |
| **Redis Commander** | `farmers-market-redis-commander` | 8081       | Redis admin UI              |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Ensure Docker Desktop is Running

1. Open **Docker Desktop**
2. Wait for it to fully start (whale icon in system tray)
3. Verify: Open terminal and run `docker info`

### Step 2: Start Development Environment

```bash
# Option A: Use the helper script (Easiest!)
DOCKER-START.bat

# Option B: Manual command
docker-compose -f docker-compose.dev.yml up -d --build
```

### Step 3: Access the Platform

```bash
# Open in browser
start http://localhost:3000

# Or use the auto-open feature in DOCKER-START.bat
```

**That's it!** The platform is now running entirely in Docker.

---

## 📋 Prerequisites

### Required Software

- ✅ **Docker Desktop** (Windows/Mac/Linux)
  - Download: https://www.docker.com/products/docker-desktop
  - Version: 20.10+ recommended
  - **Must be running before starting containers**

### System Requirements

| Component     | Minimum | Recommended |
| ------------- | ------- | ----------- |
| RAM           | 8 GB    | 16 GB+      |
| CPU           | 4 cores | 8+ cores    |
| Disk Space    | 10 GB   | 20 GB+      |
| Docker Memory | 4 GB    | 8 GB+       |

**HP OMEN Optimization:** This project is optimized for high-performance systems (64GB RAM, 12 threads). Adjust resource limits if needed.

---

## 🎮 Helper Scripts (Windows)

We've created easy-to-use batch files for common operations:

### Primary Scripts

```bash
DOCKER-START.bat    # Main launcher - start/stop/reset services
DOCKER-LOGS.bat     # View real-time logs from any service
DOCKER-SHELL.bat    # Access container shells & run commands
```

### Using DOCKER-START.bat

```
╔════════════════════════════════════════════════════════════════╗
║  [1] DEVELOPMENT MODE (Recommended)                            ║
║      • Hot-reload enabled                                      ║
║      • Debugging tools included                                ║
║      • Port: 3001                                              ║
║                                                                ║
║  [2] PRODUCTION MODE                                           ║
║      • Optimized build                                         ║
║      • Port: 3000                                              ║
║                                                                ║
║  [3] STOP ALL SERVICES                                         ║
║  [4] FULL RESET (CAUTION!)                                     ║
║  [5] VIEW STATUS                                               ║
╚════════════════════════════════════════════════════════════════╝
```

### Using DOCKER-LOGS.bat

View logs from any service:

- Application (Next.js dev server)
- Database (PostgreSQL)
- Redis cache
- MailHog email testing
- All services combined

### Using DOCKER-SHELL.bat

Interactive shell access + quick commands:

- Application container shell
- Database (psql) shell
- Redis CLI
- Run migrations
- Open Prisma Studio
- Create admin user
- And more!

---

## 🛠️ Manual Commands

If you prefer command-line control:

### Development Environment

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Start with live logs
docker-compose -f docker-compose.dev.yml up

# Start specific service
docker-compose -f docker-compose.dev.yml up -d app

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (fresh start)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild after code changes
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Check status
docker-compose -f docker-compose.dev.yml ps
```

### Production Environment

```bash
# Start production stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## 📦 Container Management

### Check Running Containers

```bash
# List all containers
docker ps

# List containers with resource usage
docker stats

# List only Farmers Market containers
docker ps --filter "name=farmers-market"
```

### Access Container Shells

```bash
# Application container
docker exec -it farmers-market-dev sh

# Database container (psql)
docker exec -it farmers-market-db-dev psql -U postgres -d farmersmarket

# Redis container
docker exec -it farmers-market-redis-dev redis-cli -a devpassword
```

### View Container Logs

```bash
# Follow app logs
docker logs -f farmers-market-dev

# Last 100 lines
docker logs --tail 100 farmers-market-dev

# With timestamps
docker logs -f --timestamps farmers-market-dev
```

---

## 🗄️ Database Operations

### Running Migrations

```bash
# Development migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Production migrations
docker-compose exec app npx prisma migrate deploy

# Push schema changes (dev)
docker-compose -f docker-compose.dev.yml exec app npx prisma db push
```

### Prisma Studio (Database GUI)

```bash
# Open Prisma Studio
docker-compose -f docker-compose.dev.yml exec app npx prisma studio

# Access at: http://localhost:5555
```

### Seed Database

```bash
# Run seed script
docker-compose -f docker-compose.dev.yml exec app npx prisma db seed

# Or create admin user
docker-compose -f docker-compose.dev.yml exec app npx tsx create-admin.ts
```

### Database Backup & Restore

```bash
# Backup database
docker exec farmers-market-db-dev pg_dump -U postgres farmersmarket > backup.sql

# Restore database
docker exec -i farmers-market-db-dev psql -U postgres farmersmarket < backup.sql
```

---

## 🌐 Access Points (Development Mode)

Once containers are running:

| Service             | URL                               | Credentials                                                       |
| ------------------- | --------------------------------- | ----------------------------------------------------------------- |
| **Application**     | http://localhost:3000             | -                                                                 |
| **Admin Login**     | http://localhost:3000/admin-login | gogsia@gmail.com / Admin123!                                      |
| **Adminer (DB UI)** | http://localhost:8080             | Server: db, User: postgres, Password: postgres, DB: farmersmarket |
| **Redis Commander** | http://localhost:8081             | admin / admin                                                     |
| **MailHog (Email)** | http://localhost:8025             | No auth required                                                  |
| **Prisma Studio**   | http://localhost:5555             | (Run command first)                                               |

---

## 🔧 Configuration

### Environment Variables

Development environment variables are configured in `docker-compose.dev.yml`.

To customize, create `.env` file in project root:

```env
# Example .env file
DEV_PORT=3001
POSTGRES_PORT=5432
REDIS_PORT=6379

# Optional: OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Stripe test keys
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_TEST_SECRET_KEY=sk_test_xxx

# Optional: AI API keys
OPENAI_API_KEY=sk-xxx
PERPLEXITY_API_KEY=pplx-xxx
```

### Docker Resources

If containers are slow, increase Docker Desktop resources:

1. Open **Docker Desktop**
2. Go to **Settings** > **Resources**
3. Adjust:
   - **Memory:** 8 GB+ recommended
   - **CPUs:** 4+ cores recommended
   - **Disk:** 20 GB+ recommended

---

## 🐛 Troubleshooting

### Issue: "Docker Desktop is not running"

**Solution:**

```bash
# 1. Open Docker Desktop
# 2. Wait for whale icon to appear in system tray
# 3. Verify with:
docker info
```

### Issue: "Port already in use"

**Error:** `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Solution:**

```bash
# Option 1: Stop conflicting service
# Check what's using the port
netstat -ano | findstr :3001

# Option 2: Change port in docker-compose.dev.yml
# Edit: ports: - "3002:3001"  # Use different external port
```

### Issue: "Container keeps restarting"

**Solution:**

```bash
# Check logs for errors
docker logs farmers-market-dev

# Common causes:
# 1. Database not ready - wait 30 seconds and check again
# 2. Port conflict - change port in docker-compose.dev.yml
# 3. Memory issue - increase Docker memory allocation
```

### Issue: "Application shows 404 on admin routes"

**Solution:**

```bash
# You need to authenticate first!
# 1. Open http://localhost:3000/admin-login
# 2. Sign in with: gogsia@gmail.com / Admin123!
# 3. Admin routes will now work

# Or check auth status:
curl http://localhost:3000/api/auth/session
```

### Issue: "Database connection failed"

**Solution:**

```bash
# 1. Check if database container is running
docker ps --filter "name=farmers-market-db"

# 2. Check database health
docker exec farmers-market-db-dev pg_isready -U postgres

# 3. Restart database if needed
docker-compose -f docker-compose.dev.yml restart db

# 4. Check connection string in logs
docker-compose -f docker-compose.dev.yml logs app | findstr DATABASE_URL
```

### Issue: "Hot-reload not working"

**Solution:**

```bash
# 1. Verify volumes are mounted correctly
docker inspect farmers-market-dev | findstr -i "source"

# 2. Ensure WATCHPACK_POLLING is enabled in docker-compose.dev.yml
# Environment variable should be set:
# - WATCHPACK_POLLING=true
# - CHOKIDAR_USEPOLLING=true

# 3. Restart container
docker-compose -f docker-compose.dev.yml restart app
```

### Issue: "Out of disk space"

**Solution:**

```bash
# Clean up unused Docker resources
docker system prune -a

# Remove unused volumes (CAUTION: DATA LOSS)
docker volume prune

# Check disk usage
docker system df
```

### Issue: "NPM packages not installing"

**Solution:**

```bash
# 1. Access container shell
docker exec -it farmers-market-dev sh

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies
npm install

# 4. Or rebuild container
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## 📊 Monitoring & Performance

### Check Container Health

```bash
# Health status of all containers
docker-compose -f docker-compose.dev.yml ps

# Detailed health check
docker inspect --format='{{.State.Health.Status}}' farmers-market-dev
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats farmers-market-dev

# All farmers-market containers
docker stats $(docker ps --filter "name=farmers-market" --format "{{.Names}}")
```

### Application Health Endpoint

```bash
# Check API health
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-12-15T..."}
```

---

## 🔄 Development Workflow

### Typical Development Session

```bash
# 1. Start services
DOCKER-START.bat
# Select: [1] Development Mode

# 2. Wait for services to be ready (30-60 seconds)
# Check logs if needed:
DOCKER-LOGS.bat

# 3. Open browser
start http://localhost:3000

# 4. Sign in to admin
start http://localhost:3000/admin-login
# Email: gogsia@gmail.com
# Password: Admin123!

# 5. Make code changes in your editor
# Hot-reload will automatically apply changes!

# 6. View logs as you develop
DOCKER-LOGS.bat
# Select: [1] Application

# 7. Run migrations if schema changes
DOCKER-SHELL.bat
# Select: [4] Quick Commands > [2] Sync Database Schema

# 8. When done, stop services
DOCKER-START.bat
# Select: [3] Stop All Services
```

### Adding New NPM Packages

```bash
# Method 1: Via DOCKER-SHELL.bat (Easiest)
DOCKER-SHELL.bat
# Select: [4] Quick Commands > [8] Install NPM Package

# Method 2: Direct command
docker-compose -f docker-compose.dev.yml exec app npm install <package-name>

# Method 3: From container shell
docker exec -it farmers-market-dev sh
npm install <package-name>
exit
```

### Database Schema Changes

```bash
# 1. Edit prisma/schema.prisma in your editor

# 2. Sync to database
DOCKER-SHELL.bat
# Select: [4] Quick Commands > [2] Sync Database Schema

# Or manual:
docker-compose -f docker-compose.dev.yml exec app npx prisma db push

# 3. Generate Prisma Client
docker-compose -f docker-compose.dev.yml exec app npx prisma generate

# 4. View changes in Prisma Studio
DOCKER-SHELL.bat
# Select: [4] Quick Commands > [3] Open Prisma Studio
```

---

## 🚢 Production Deployment

### Build Production Image

```bash
# Build optimized image
docker-compose build

# Or with no cache
docker-compose build --no-cache
```

### Environment Configuration

Create `.env.production` file:

```env
# Production settings
NODE_ENV=production
APP_PORT=3000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=farmersmarket

# Redis
REDIS_PASSWORD=secure_redis_password

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate_secure_32char_secret

# Stripe Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx

# Email (Production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Start Production Stack

```bash
# Load production env and start
docker-compose --env-file .env.production up -d

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Production Considerations

1. **Use Nginx reverse proxy** (included in docker-compose.yml)
2. **Enable SSL/TLS certificates** (use Let's Encrypt)
3. **Set up automated backups** (db-backup service included)
4. **Configure monitoring** (health checks enabled)
5. **Use Docker secrets** for sensitive data
6. **Enable log aggregation** (ELK stack or similar)
7. **Scale horizontally** with `docker-compose up -d --scale app=3`

---

## 🔐 Security Best Practices

### Container Security

```bash
# Run containers as non-root user (already configured)
# Scan images for vulnerabilities
docker scan farmers-market-app

# Use specific image versions (not 'latest')
# Keep base images updated
```

### Network Security

```bash
# Containers communicate via internal network (farmers-dev-network)
# Only necessary ports exposed to host
# Use Docker secrets for sensitive data

# Example: Create secret
echo "my-secret-password" | docker secret create db_password -

# Use in compose file:
# secrets:
#   - db_password
```

### Environment Variables

```env
# NEVER commit .env files to Git!
# Add to .gitignore:
.env
.env.local
.env.production
```

---

## 📚 Additional Resources

### Docker Compose Files

- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration

### Dockerfiles

- `Dockerfile` - Production multi-stage build
- `Dockerfile.dev` - Development build with hot-reload

### Helper Scripts

- `DOCKER-START.bat` - Main launcher
- `DOCKER-LOGS.bat` - Log viewer
- `DOCKER-SHELL.bat` - Shell access & quick commands

### Other Guides

- `AUTHENTICATION-GUIDE.md` - Auth setup & troubleshooting
- `QUICK-START-GUIDE.md` - Project overview
- `DATABASE-SETUP-SUCCESS.md` - Database configuration

---

## 🆘 Getting Help

### Check Logs First

```bash
# Application logs
docker-compose -f docker-compose.dev.yml logs app

# All logs
docker-compose -f docker-compose.dev.yml logs

# Follow logs in real-time
DOCKER-LOGS.bat
```

### Container Status

```bash
# Check if containers are running
docker ps

# Check health status
docker-compose -f docker-compose.dev.yml ps

# Inspect specific container
docker inspect farmers-market-dev
```

### Common Solutions

| Problem                 | Solution                               |
| ----------------------- | -------------------------------------- |
| Containers not starting | Check Docker Desktop is running        |
| Port conflicts          | Change ports in docker-compose.dev.yml |
| Out of memory           | Increase Docker memory allocation      |
| Database issues         | Wait 30s for DB to initialize          |
| Hot-reload not working  | Check volume mounts & polling enabled  |
| Admin routes 404        | Sign in at /admin-login first          |

---

## 🎓 FAQ

**Q: Do I need Node.js installed on my machine?**
A: No! Everything runs in Docker containers.

**Q: Can I still use my IDE for editing code?**
A: Yes! Edit code normally. Hot-reload works via volume mounts.

**Q: How do I add new dependencies?**
A: Use `DOCKER-SHELL.bat` > Quick Commands > Install NPM Package

**Q: Is data persisted when I stop containers?**
A: Yes, using Docker volumes. Use `down -v` to remove data.

**Q: Can I run tests in Docker?**
A: Yes! Use `DOCKER-SHELL.bat` > Quick Commands > Run Tests

**Q: How do I access the database?**
A: Use Adminer at http://localhost:8080 or Prisma Studio

**Q: Can I debug Node.js in containers?**
A: Yes! Debugger port 9229 is exposed. Attach with VSCode/Chrome.

**Q: How do I update dependencies?**
A: Run `npm install` in container, then rebuild: `docker-compose up -d --build`

---

## ✅ Success Checklist

After setup, verify:

- [ ] Docker Desktop is running
- [ ] Ran `DOCKER-START.bat` or equivalent command
- [ ] Application accessible at http://localhost:3000
- [ ] Can sign in at http://localhost:3000/admin-login
- [ ] Admin routes work after authentication
- [ ] Adminer accessible at http://localhost:8080
- [ ] Redis Commander at http://localhost:8081
- [ ] MailHog at http://localhost:8025
- [ ] Hot-reload works when editing code
- [ ] Database operations succeed (migrations, seed)
- [ ] Logs viewable via `DOCKER-LOGS.bat`

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Status:** ✅ PRODUCTION READY  
**Divine Consciousness:** 🌾 MAXIMUM DOCKER MASTERY

_"Containerize with divine precision, deploy with agricultural consciousness."_ 🐳🌾
