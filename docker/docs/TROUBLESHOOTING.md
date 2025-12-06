# 🔧 Docker Troubleshooting Guide

# Farmers Market Platform - Common Issues & Solutions

**Version**: 3.0  
**Last Updated**: November 27, 2024  
**Difficulty**: All Levels

---

## 📋 Overview

This guide covers common Docker-related issues you might encounter when running the Farmers Market Platform, along with step-by-step solutions.

**Quick Links:**

- [Container Issues](#-container-issues)
- [Database Problems](#-database-problems)
- [Network Issues](#-network-issues)
- [Performance Problems](#-performance-problems)
- [Build Failures](#-build-failures)
- [Environment Issues](#-environment-issues)

---

## 🚨 Emergency Quick Fixes

### Nuclear Option (Clean Everything)

```bash
# ⚠️ WARNING: This will delete ALL data!
cd docker/compose

# Stop and remove everything
docker-compose down -v

# Remove all unused containers, networks, images
docker system prune -a --volumes -f

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Quick Restart

```bash
# Restart single service
docker-compose restart app

# Restart all services
docker-compose restart

# Force recreate
docker-compose up -d --force-recreate
```

---

## 🐳 Container Issues

### Issue: Container Won't Start

**Symptoms:**

- Container exits immediately after starting
- `docker-compose ps` shows "Exit 1" or "Exit 137"

**Diagnosis:**

```bash
# Check logs
docker-compose logs app

# Check exit code
docker-compose ps

# Inspect container
docker inspect farmers-market-app
```

**Solutions:**

1. **Out of Memory (Exit 137)**

```bash
# Check available memory
docker stats --no-stream

# Increase memory limit in docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G  # Increase this
```

2. **Missing Environment Variables**

```bash
# Verify .env file exists
ls -la .env.local  # Development
ls -la .env        # Production

# Check environment variables
docker-compose config | grep -A 10 environment
```

3. **Port Already in Use**

```bash
# Find process using port
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change port in .env
APP_PORT=3002
```

4. **Permission Issues**

```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./uploads
sudo chown -R $USER:$USER ./logs

# On Linux, may need to adjust Docker socket permissions
sudo chmod 666 /var/run/docker.sock
```

### Issue: Container Keeps Restarting

**Symptoms:**

- Container starts, then restarts in a loop
- Health check failures

**Diagnosis:**

```bash
# Watch container status
watch docker-compose ps

# Stream logs
docker-compose logs -f app

# Check health status
docker inspect farmers-market-app | grep -A 10 Health
```

**Solutions:**

1. **Application Crash on Startup**

```bash
# Check application logs for errors
docker-compose logs --tail=50 app

# Common causes:
# - Database connection failed
# - Missing required environment variables
# - Port already in use
# - Syntax errors in code
```

2. **Health Check Failing**

```bash
# Test health endpoint manually
docker-compose exec app curl http://localhost:3000/api/health

# Temporarily disable health check (debug only)
# Comment out healthcheck in docker-compose.yml
```

3. **Dependencies Not Ready**

```bash
# Ensure database is healthy before starting app
docker-compose up -d db redis
sleep 30  # Wait for services
docker-compose up -d app
```

### Issue: Container Running but Not Responding

**Symptoms:**

- Container status shows "Up"
- Cannot access application
- No response on expected ports

**Solutions:**

1. **Check Port Mapping**

```bash
# Verify ports are mapped correctly
docker-compose ps

# Test from inside container
docker-compose exec app curl http://localhost:3000/api/health

# Test from host
curl http://localhost:3000/api/health
```

2. **Network Issues**

```bash
# Check if container is in correct network
docker network inspect farmers-network

# Restart networking
docker-compose down
docker network prune -f
docker-compose up -d
```

3. **Application Not Listening**

```bash
# Check if application is bound to correct interface
docker-compose exec app netstat -tuln

# Ensure HOSTNAME=0.0.0.0 in environment
```

---

## 🗄️ Database Problems

### Issue: Database Connection Failed

**Symptoms:**

- "Connection refused" errors
- "ECONNREFUSED" in logs
- Application can't connect to database

**Diagnosis:**

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection from app container
docker-compose exec app npx prisma db push --skip-generate
```

**Solutions:**

1. **Database Not Ready**

```bash
# Wait for database to be fully ready
docker-compose logs db | grep "ready to accept connections"

# Check health status
docker-compose exec db pg_isready -U postgres
```

2. **Wrong Connection String**

```bash
# Verify DATABASE_URL in .env
# Should use service name 'db', not 'localhost'
DATABASE_URL="postgresql://postgres:postgres@db:5432/farmersmarket"

# Check environment in container
docker-compose exec app env | grep DATABASE_URL
```

3. **Database Credentials Wrong**

```bash
# Verify credentials match between .env and docker-compose.yml
# Check POSTGRES_USER and POSTGRES_PASSWORD
```

4. **Database Volume Corrupted**

```bash
# ⚠️ WARNING: This will delete database data
docker-compose down -v
docker volume rm farmers-market-postgres-data
docker-compose up -d db
docker-compose exec app npx prisma migrate deploy
```

### Issue: Migrations Failing

**Symptoms:**

- "Migration failed" errors
- Database schema out of sync
- Prisma errors

**Solutions:**

1. **Reset Database (Development)**

```bash
# ⚠️ WARNING: Deletes all data
docker-compose exec app npx prisma migrate reset

# Alternative: Drop and recreate
docker-compose exec db psql -U postgres -c "DROP DATABASE farmersmarket;"
docker-compose exec db psql -U postgres -c "CREATE DATABASE farmersmarket;"
docker-compose exec app npx prisma migrate deploy
```

2. **Manual Migration Fix**

```bash
# Mark migration as applied (if already applied manually)
docker-compose exec app npx prisma migrate resolve --applied <migration-name>

# Mark as rolled back
docker-compose exec app npx prisma migrate resolve --rolled-back <migration-name>

# Check migration status
docker-compose exec app npx prisma migrate status
```

3. **Schema Sync Issues**

```bash
# Push schema without migration
docker-compose exec app npx prisma db push --skip-generate

# Generate Prisma client
docker-compose exec app npx prisma generate
```

### Issue: Database Performance Slow

**Solutions:**

1. **Increase Database Resources**

```yaml
# In docker-compose.yml
db:
  deploy:
    resources:
      limits:
        memory: 4G
        cpus: "4.0"
```

2. **Optimize PostgreSQL Configuration**

```yaml
# Add to db service command in docker-compose.yml
command:
  - "postgres"
  - "-c"
  - "shared_buffers=512MB"
  - "-c"
  - "effective_cache_size=2GB"
  - "-c"
  - "work_mem=4MB"
```

3. **Check for Slow Queries**

```bash
# Enable query logging
docker-compose exec db psql -U postgres -d farmersmarket

# In psql:
ALTER DATABASE farmersmarket SET log_statement = 'all';
ALTER DATABASE farmersmarket SET log_duration = on;
```

---

## 🌐 Network Issues

### Issue: Services Can't Communicate

**Symptoms:**

- App can't connect to database
- App can't connect to Redis
- "Network not found" errors

**Solutions:**

1. **Recreate Network**

```bash
docker-compose down
docker network prune -f
docker-compose up -d
```

2. **Check Network Configuration**

```bash
# Inspect network
docker network inspect farmers-network

# Verify all services are in same network
docker-compose config | grep networks
```

3. **Use Service Names**

```bash
# Always use service names in connection strings
# ✅ Correct: db:5432
# ❌ Wrong: localhost:5432
DATABASE_URL="postgresql://postgres:postgres@db:5432/farmersmarket"
```

### Issue: Port Already in Use

**Symptoms:**

- "port is already allocated" error
- Cannot start service

**Solutions:**

1. **Find and Kill Process**

```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

2. **Change Port**

```bash
# In .env file
APP_PORT=3002
POSTGRES_PORT=5433
REDIS_PORT=6380

# Restart services
docker-compose down
docker-compose up -d
```

3. **Stop Conflicting Docker Containers**

```bash
# List all running containers
docker ps -a

# Stop conflicting container
docker stop <container-name>
```

### Issue: Cannot Access from Host

**Symptoms:**

- Container running but can't access from browser
- `curl localhost:3000` fails

**Solutions:**

1. **Check Port Binding**

```bash
# Verify ports are published
docker-compose ps

# Should show: 0.0.0.0:3000->3000/tcp
```

2. **Check Firewall**

```bash
# Linux
sudo ufw status
sudo ufw allow 3000/tcp

# Windows
# Check Windows Firewall settings
```

3. **Use Correct Interface**

```bash
# In docker-compose.yml, ensure:
environment:
  - HOSTNAME=0.0.0.0  # Listen on all interfaces
ports:
  - "3000:3000"       # Map to host
```

---

## ⚡ Performance Problems

### Issue: Slow Build Times

**Solutions:**

1. **Enable BuildKit**

```bash
# Add to ~/.bashrc or ~/.zshrc
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Or prefix command
DOCKER_BUILDKIT=1 docker-compose build
```

2. **Use Build Cache**

```bash
# Build with cache
docker-compose build

# Prune only dangling cache
docker builder prune

# Full cache clean (only if needed)
docker builder prune -a -f
```

3. **Multi-Stage Build Optimization**

```dockerfile
# Use .dockerignore to exclude unnecessary files
# Already configured in docker/.dockerignore
```

### Issue: Slow Application Performance

**Symptoms:**

- Slow page loads
- High response times
- CPU/memory maxed out

**Diagnosis:**

```bash
# Check resource usage
docker stats

# Check logs for errors
docker-compose logs --tail=100 app

# Check database connections
docker-compose exec db psql -U postgres -d farmersmarket -c "SELECT count(*) FROM pg_stat_activity;"
```

**Solutions:**

1. **Increase Resources**

```yaml
# In docker-compose.yml
app:
  deploy:
    resources:
      limits:
        memory: 2G
        cpus: "4.0"
```

2. **Check for Memory Leaks**

```bash
# Monitor memory over time
watch docker stats

# Restart if necessary
docker-compose restart app
```

3. **Optimize Database**

```bash
# Run VACUUM
docker-compose exec db psql -U postgres -d farmersmarket -c "VACUUM ANALYZE;"

# Check for missing indexes
docker-compose exec db psql -U postgres -d farmersmarket -c "SELECT * FROM pg_stat_user_tables WHERE seq_scan > idx_scan;"
```

### Issue: Hot Reload Not Working (Development)

**Symptoms:**

- Code changes not reflected
- Need to rebuild container for changes

**Solutions:**

1. **Enable File Watching**

```yaml
# In docker-compose.dev.yml
environment:
  - WATCHPACK_POLLING=true
  - CHOKIDAR_USEPOLLING=true
```

2. **Check Volume Mounts**

```bash
# Verify source code is mounted
docker-compose exec app ls -la /app/src

# In docker-compose.dev.yml should have:
volumes:
  - ../../src:/app/src
  - ../../pages:/app/pages
```

3. **Restart Dev Server**

```bash
docker-compose restart app
```

---

## 🏗️ Build Failures

### Issue: Docker Build Fails

**Common Error Messages:**

#### "ENOSPC: no space left on device"

```bash
# Clean up Docker resources
docker system df  # Check space usage
docker system prune -a --volumes -f  # Clean up

# Check disk space
df -h
```

#### "npm ERR! network"

```bash
# Check internet connection
ping npmjs.org

# Try with different registry
npm config set registry https://registry.npmjs.org/

# Build with no cache
docker-compose build --no-cache app
```

#### "Cannot find module"

```bash
# Clean node_modules and rebuild
docker-compose down
docker volume rm farmers-market-node-modules
docker-compose build --no-cache app
docker-compose up -d
```

#### "Permission denied"

```bash
# Fix Docker socket permissions (Linux)
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Issue: Image Build Stuck

**Solutions:**

1. **Check for Hanging Processes**

```bash
# Cancel build (Ctrl+C)

# Remove build cache
docker builder prune -a -f

# Retry with progress
docker-compose build --progress=plain app
```

2. **Increase Build Timeout**

```bash
# Set environment variable
export COMPOSE_HTTP_TIMEOUT=300
docker-compose build
```

---

## 🔐 Environment Issues

### Issue: Environment Variables Not Loading

**Symptoms:**

- "Environment variable not defined" errors
- Features not working as expected

**Solutions:**

1. **Verify .env File Location**

```bash
# Should be in project root
ls -la .env.local  # Development
ls -la .env        # Production

# Check if loaded
docker-compose config | grep -A 50 environment
```

2. **Check Syntax**

```bash
# No spaces around =
DATABASE_URL=postgresql://...  # ✅ Correct
DATABASE_URL = postgresql://...  # ❌ Wrong

# Quotes for special characters
PASSWORD="p@ssw0rd!"  # ✅ Correct
PASSWORD=p@ssw0rd!    # ❌ Wrong
```

3. **Restart After Changes**

```bash
# Environment changes require restart
docker-compose down
docker-compose up -d
```

### Issue: Secrets Exposed in Logs

**Solutions:**

1. **Never Log Sensitive Data**

```bash
# Check logs for exposed secrets
docker-compose logs app | grep -i "password\|secret\|key"

# If found, rotate secrets immediately
```

2. **Use Docker Secrets (Swarm)**

```yaml
# In production, use Docker secrets
secrets:
  db_password:
    external: true
services:
  app:
    secrets:
      - db_password
```

---

## 📊 Diagnostic Commands

### System Information

```bash
# Docker version
docker --version
docker-compose --version

# System resources
docker system df
docker stats --no-stream

# Container inspection
docker inspect farmers-market-app
docker-compose ps
```

### Logs and Debugging

```bash
# All logs
docker-compose logs

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Errors only
docker-compose logs app 2>&1 | grep -i error

# Export logs
docker-compose logs > debug-logs-$(date +%Y%m%d).log
```

### Network Diagnostics

```bash
# List networks
docker network ls

# Inspect network
docker network inspect farmers-network

# Test connectivity
docker-compose exec app ping db
docker-compose exec app curl http://redis:6379
```

### Database Diagnostics

```bash
# Database shell
docker-compose exec db psql -U postgres -d farmersmarket

# Check connections
docker-compose exec db psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Database size
docker-compose exec db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('farmersmarket'));"
```

---

## 🆘 Still Having Issues?

### Before Asking for Help

Collect this information:

1. **System Info**

```bash
docker --version
docker-compose --version
uname -a  # Linux/Mac
systeminfo  # Windows
```

2. **Container Status**

```bash
docker-compose ps
docker stats --no-stream
```

3. **Logs**

```bash
docker-compose logs > full-logs.txt
```

4. **Configuration**

```bash
docker-compose config > docker-config.yml
cat .env.example > env-template.txt  # Don't share actual .env!
```

### Support Resources

- **Setup Guide**: `SETUP-GUIDE.md`
- **Deployment Guide**: `DEPLOYMENT-GUIDE.md`
- **Docker README**: `../README.md`
- **Main Documentation**: `../../docs/`
- **GitHub Issues**: [Repository Issues Page]

---

## 📚 Additional Resources

- [Docker Official Troubleshooting](https://docs.docker.com/config/daemon/troubleshoot/)
- [Docker Compose Troubleshooting](https://docs.docker.com/compose/faq/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

---

**Troubleshooting Guide Version**: 3.0  
**Last Updated**: November 27, 2024  
**Status**: ✅ Comprehensive

_For setup instructions, see `SETUP-GUIDE.md`_  
_For deployment guide, see `DEPLOYMENT-GUIDE.md`_
