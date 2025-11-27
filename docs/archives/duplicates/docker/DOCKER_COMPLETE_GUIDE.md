# ============================================================================
# FARMERS MARKET PLATFORM - COMPLETE DOCKER GUIDE
# Divine Agricultural E-Commerce Platform
# Comprehensive Docker Deployment and Management Documentation
# ============================================================================

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Environment](#development-environment)
- [Production Deployment](#production-deployment)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Database Management](#database-management)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Performance Optimization](#performance-optimization)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

---

## 🌟 Overview

The Farmers Market Platform uses Docker and Docker Compose to provide consistent, reproducible environments for development and production deployment. This guide covers everything you need to know about running the platform with Docker.

### Key Features

- 🚀 **Multi-stage builds** for optimized production images
- 🔄 **Hot-reload** development environment
- 🗄️ **PostgreSQL with PostGIS** for geospatial features
- ⚡ **Redis caching** for performance
- 📧 **MailHog** for email testing (dev)
- 🔍 **Database management tools** (Adminer, PgAdmin)
- 🔒 **Nginx reverse proxy** with SSL support
- 💾 **Automated backups** for production
- 📊 **Monitoring and health checks**

---

## 📦 Prerequisites

### Required Software

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Version: 20.10.0 or higher
   - Download: https://docs.docker.com/get-docker/

2. **Docker Compose**
   - Version: 2.0.0 or higher
   - Usually included with Docker Desktop

### System Requirements

#### Development
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 20GB free space
- **CPU**: 4 cores minimum

#### Production
- **RAM**: 4GB minimum, 8GB+ recommended
- **Disk Space**: 50GB+ for data and backups
- **CPU**: 2 cores minimum, 4+ recommended

### Verify Installation

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Verify Docker is running
docker info
```

---

## 🚀 Quick Start

### Development (Fastest Way)

```bash
# 1. Clone the repository
git clone <repository-url>
cd "Farmers Market Platform web and app"

# 2. Create environment file
cp .env.development.example .env.local

# 3. Start development environment
chmod +x docker-start-dev.sh
./docker-start-dev.sh

# 4. Access the application
# App: http://localhost:3000
# MailHog: http://localhost:8025
# Adminer: http://localhost:8080
```

### Production (Quick Deploy)

```bash
# 1. Create production environment file
cp .env.production.example .env.production

# 2. Update .env.production with your actual values
nano .env.production

# 3. Start production environment
chmod +x docker-start-prod.sh
./docker-start-prod.sh

# 4. Access the application
# App: http://localhost:3000
```

---

## 🛠️ Development Environment

### Starting Development

#### Option 1: Using Helper Script (Recommended)

```bash
# Start with default services
./docker-start-dev.sh

# Start with PgAdmin
./docker-start-dev.sh --profile advanced

# Start with Nginx proxy
./docker-start-dev.sh --profile proxy

# Force rebuild
./docker-start-dev.sh --build

# Show logs after starting
./docker-start-dev.sh --logs
```

#### Option 2: Using Docker Compose Directly

```bash
# Start all development services
docker-compose -f docker-compose.dev.yml up -d

# Start with rebuild
docker-compose -f docker-compose.dev.yml up -d --build

# Start in foreground (see logs)
docker-compose -f docker-compose.dev.yml up
```

### Development Services

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **app** | 3001 | Next.js application with hot-reload | http://localhost:3000 |
| **db** | 5432 | PostgreSQL 16 with PostGIS | localhost:5432 |
| **redis** | 6379 | Redis cache | localhost:6379 |
| **mailhog** | 8025 | Email testing UI | http://localhost:8025 |
| **adminer** | 8080 | Database management | http://localhost:8080 |
| **redis-commander** | 8081 | Redis management | http://localhost:8081 |
| **pgadmin** | 8082 | Advanced DB management | http://localhost:8082 |
| **debugger** | 9229 | Node.js debugger | chrome://inspect |

### Database Connection (Development)

```yaml
Host: localhost
Port: 5432
Username: postgres
Password: postgres
Database: farmersmarket
```

### Common Development Tasks

#### Run Database Migrations

```bash
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev
```

#### Seed Database

```bash
docker-compose -f docker-compose.dev.yml exec app npx prisma db seed
```

#### Open Prisma Studio

```bash
docker-compose -f docker-compose.dev.yml exec app npx prisma studio
# Access at http://localhost:5555
```

#### Run Tests

```bash
# Unit tests
docker-compose -f docker-compose.dev.yml exec app npm test

# E2E tests
docker-compose -f docker-compose.dev.yml exec app npm run test:e2e

# With coverage
docker-compose -f docker-compose.dev.yml exec app npm run test:coverage
```

#### Install New Package

```bash
docker-compose -f docker-compose.dev.yml exec app npm install <package-name>

# Don't forget to rebuild after adding dependencies
docker-compose -f docker-compose.dev.yml up -d --build
```

#### Shell Access

```bash
# Access app container
docker-compose -f docker-compose.dev.yml exec app sh

# Access database
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d farmersmarket
```

#### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f app

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 app
```

#### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.dev.yml restart

# Restart specific service
docker-compose -f docker-compose.dev.yml restart app
```

#### Stop Development Environment

```bash
# Stop services (keep data)
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.dev.yml down -v

# Stop and remove everything
docker-compose -f docker-compose.dev.yml down -v --rmi all
```

### Hot Reload Configuration

The development environment supports hot-reload for:
- ✅ React components (`.tsx`, `.jsx`)
- ✅ TypeScript files (`.ts`)
- ✅ CSS/Tailwind styles
- ✅ API routes
- ✅ Next.js configuration

Files are synced via Docker volumes with the `delegated` consistency mode for optimal performance.

### Debugging in VSCode

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "protocol": "inspector",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Then:
1. Start development environment: `./docker-start-dev.sh`
2. In VSCode, press F5 or go to Run → Start Debugging
3. Set breakpoints in your code
4. Refresh the browser to trigger breakpoints

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] **Environment Configuration**
  - [ ] Create `.env.production` from template
  - [ ] Update all placeholder values
  - [ ] Set strong, unique passwords
  - [ ] Configure database credentials
  - [ ] Set NextAuth secret (32+ characters)
  - [ ] Configure email SMTP settings
  - [ ] Add Stripe production keys (if applicable)

- [ ] **Security**
  - [ ] Change default passwords
  - [ ] Configure SSL certificates
  - [ ] Review CORS settings
  - [ ] Set up firewall rules
  - [ ] Enable rate limiting

- [ ] **Infrastructure**
  - [ ] Ensure adequate server resources
  - [ ] Configure backup storage
  - [ ] Set up monitoring tools
  - [ ] Configure log aggregation
  - [ ] Set up alerts

### Deployment Steps

#### 1. Prepare Environment

```bash
# Copy and configure environment
cp .env.production.example .env.production
nano .env.production
```

**Critical Variables to Update:**

```bash
# Application URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# Database Security
POSTGRES_PASSWORD=<strong-unique-password>
DATABASE_URL=postgresql://postgres:<password>@db:5432/farmersmarket

# Redis Security
REDIS_PASSWORD=<strong-unique-password>

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=<random-32-character-string>

# Stripe (Production Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

#### 2. Deploy Using Script (Recommended)

```bash
# Make script executable
chmod +x docker-start-prod.sh

# Deploy to production
./docker-start-prod.sh

# Deploy with management tools (for initial setup)
./docker-start-prod.sh --with-management

# Deploy and show logs
./docker-start-prod.sh --logs
```

#### 3. Manual Deployment

```bash
# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Check health
curl http://localhost:3000/api/health
```

#### 4. Configure SSL/TLS

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your SSL certificates
cp /path/to/cert.pem nginx/ssl/
cp /path/to/key.pem nginx/ssl/

# Update nginx.conf with your domain
nano nginx/nginx.conf

# Restart nginx
docker-compose restart nginx
```

#### 5. Verify Deployment

```bash
# Check all services are healthy
docker-compose ps

# View application logs
docker-compose logs -f app

# Test health endpoint
curl https://yourdomain.com/api/health

# Check database connection
docker-compose exec app npx prisma db execute --stdin < /dev/null
```

### Production Services

| Service | Port | Description | Access |
|---------|------|-------------|--------|
| **app** | 3000 | Next.js application | Internal only |
| **nginx** | 80, 443 | Reverse proxy | Public |
| **db** | 5432 | PostgreSQL database | Internal only |
| **redis** | 6379 | Redis cache | Internal only |
| **db-backup** | - | Automated backups | Background |

### Scaling Production

#### Horizontal Scaling (Multiple App Instances)

Update `docker-compose.yml`:

```yaml
services:
  app:
    # ... existing config
    deploy:
      replicas: 3  # Run 3 instances
```

Or scale dynamically:

```bash
docker-compose up -d --scale app=3
```

Nginx will automatically load balance between instances.

#### Vertical Scaling (Resource Limits)

Add resource limits to `docker-compose.yml`:

```yaml
services:
  app:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### Production Management

#### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build app

# Run new migrations
docker-compose exec app npx prisma migrate deploy
```

#### Zero-Downtime Updates

```bash
# Scale up with new version
docker-compose up -d --scale app=6 --no-recreate

# Wait for new instances to be healthy
sleep 30

# Scale down old instances
docker-compose up -d --scale app=3

# Remove old containers
docker-compose up -d
```

#### Database Backup

```bash
# Manual backup
docker-compose exec db pg_dump -U postgres farmersmarket > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backups run daily (configured in docker-compose.yml)
# View backups
docker-compose exec db-backup ls -lh /backups
```

#### Restore Database

```bash
# From backup file
cat backup_20250115.sql | docker-compose exec -T db psql -U postgres -d farmersmarket

# From automated backup
docker-compose exec db psql -U postgres -d farmersmarket < /backups/latest.sql
```

---

## 🏗️ Architecture

### Docker Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     External Network                        │
│                    (Internet/Users)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   NGINX (Port 80/443)│
              │   Reverse Proxy       │
              │   SSL Termination     │
              │   Load Balancing      │
              └──────────┬────────────┘
                         │
        ┌────────────────┼────────────────┐
        │    Docker Bridge Network        │
        │    (farmers-network)            │
        │                                 │
        │  ┌─────────────────────┐       │
        │  │  Next.js App (3000) │       │
        │  │  ├─ Server Actions   │       │
        │  │  ├─ API Routes       │       │
        │  │  ├─ SSR/SSG          │       │
        │  │  └─ Static Assets    │       │
        │  └──────┬──────┬────────┘       │
        │         │      │                │
        │    ┌────▼──┐ ┌─▼────────┐      │
        │    │ Redis │ │PostgreSQL│      │
        │    │(6379) │ │  (5432)  │      │
        │    │       │ │ PostGIS  │      │
        │    └───────┘ └──────────┘      │
        └─────────────────────────────────┘
```

### Container Communication

- **App → Database**: Direct connection via Docker network
- **App → Redis**: Direct connection via Docker network
- **External → App**: Through Nginx reverse proxy
- **App → External APIs**: Via Docker host network

### Volume Mounts

#### Development
```
./src          → /app/src          (source code)
./public       → /app/public       (static assets)
./prisma       → /app/prisma       (database schema)
node_modules   → /app/node_modules (dependencies, volume)
postgres-data  → /var/lib/postgresql/data
redis-data     → /data
```

#### Production
```
postgres-data    → /var/lib/postgresql/data
postgres-backups → /backups
redis-data       → /data
uploads-data     → /app/public/uploads
logs-data        → /app/logs
nginx-cache      → /var/cache/nginx
```

---

## ⚙️ Configuration

### Environment Variables

#### Development (.env.local)

```bash
# Core
NODE_ENV=development
PORT=3001

# Database (localhost or docker service name)
DATABASE_URL=postgresql://postgres:postgres@db:5432/farmersmarket

# Redis
REDIS_URL=redis://:devpassword@redis:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-min-32-chars

# Development Features
ENABLE_EXPERIMENTAL_FEATURES=true
DEBUG=*
```

#### Production (.env.production)

```bash
# Core
NODE_ENV=production
PORT=3000

# Public URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# Database (use strong passwords!)
POSTGRES_PASSWORD=<secure-password>
DATABASE_URL=postgresql://postgres:<secure-password>@db:5432/farmersmarket

# Redis (use strong password!)
REDIS_PASSWORD=<secure-password>
REDIS_URL=redis://:<secure-password>@redis:6379

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=<random-32-char-string>

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<app-password>

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
```

### Docker Compose Configuration

#### Override for Local Development

Create `docker-compose.override.yml`:

```yaml
services:
  app:
    environment:
      - CUSTOM_ENV_VAR=value
    ports:
      - "4000:3001"  # Use different port
```

#### Environment-Specific Configs

```bash
# Use specific compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🗄️ Database Management

### Prisma Operations

#### Generate Client

```bash
docker-compose exec app npx prisma generate
```

#### Create Migration

```bash
docker-compose exec app npx prisma migrate dev --name add_new_feature
```

#### Deploy Migrations (Production)

```bash
docker-compose exec app npx prisma migrate deploy
```

#### Reset Database (Development Only)

```bash
docker-compose exec app npx prisma migrate reset
```

#### Seed Database

```bash
docker-compose exec app npx prisma db seed
```

#### Open Prisma Studio

```bash
docker-compose exec app npx prisma studio
# Access at http://localhost:5555
```

### Direct PostgreSQL Access

#### Connect via psql

```bash
docker-compose exec db psql -U postgres -d farmersmarket
```

#### Execute SQL File

```bash
docker-compose exec -T db psql -U postgres -d farmersmarket < schema.sql
```

#### Dump Database

```bash
docker-compose exec db pg_dump -U postgres farmersmarket > backup.sql
```

#### Restore Database

```bash
cat backup.sql | docker-compose exec -T db psql -U postgres -d farmersmarket
```

### Database Optimization

#### Analyze Tables

```sql
-- In psql
ANALYZE;
ANALYZE VERBOSE your_table_name;
```

#### Vacuum Database

```sql
-- In psql
VACUUM ANALYZE;
```

#### Check Database Size

```bash
docker-compose exec db psql -U postgres -d farmersmarket -c "SELECT pg_size_pretty(pg_database_size('farmersmarket'));"
```

---

## 📊 Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last N lines
docker-compose logs --tail=100 app

# Since specific time
docker-compose logs --since 2024-01-15T10:00:00 app

# Save logs to file
docker-compose logs app > app_logs.txt
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Test application health endpoint
curl http://localhost:3000/api/health

# Detailed container inspection
docker inspect farmers-market-app
```

### Resource Usage

```bash
# Real-time resource monitoring
docker stats

# Specific container
docker stats farmers-market-app

# One-time snapshot
docker stats --no-stream
```

### Log Rotation

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker daemon:

```bash
sudo systemctl restart docker
```

### Application Insights

Access container metrics:

```bash
# CPU and memory
docker stats farmers-market-app --no-stream

# Disk usage
docker system df

# Network usage
docker network inspect farmers-network
```

---

## 💾 Backup & Recovery

### Automated Backups

The production setup includes automated PostgreSQL backups via `prodrigestivill/postgres-backup-local`.

**Configuration** (in docker-compose.yml):
```yaml
BACKUP_SCHEDULE: "@daily"       # Daily backups
BACKUP_KEEP_DAYS: 7            # Keep daily for 7 days
BACKUP_KEEP_WEEKS: 4           # Keep weekly for 4 weeks
BACKUP_KEEP_MONTHS: 6          # Keep monthly for 6 months
```

### Manual Backup

#### Database Backup

```bash
# Full database dump
docker-compose exec db pg_dump -U postgres farmersmarket > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker-compose exec db pg_dump -U postgres farmersmarket | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema only
docker-compose exec db pg_dump -U postgres --schema-only farmersmarket > schema_backup.sql

# Data only
docker-compose exec db pg_dump -U postgres --data-only farmersmarket > data_backup.sql
```

#### Application Data Backup

```bash
# Backup uploads directory
docker cp farmers-market-app:/app/public/uploads ./backups/uploads_$(date +%Y%m%d)

# Backup environment configuration
cp .env.production ./backups/.env.production.$(date +%Y%m%d)

# Backup Docker volumes
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

### Recovery Procedures

#### Restore Database

```bash
# Stop application
docker-compose stop app

# Restore from backup
cat backup_20250115.sql | docker-compose exec -T db psql -U postgres -d farmersmarket

# Or from compressed
gunzip -c backup_20250115.sql.gz | docker-compose exec -T db psql -U postgres -d farmersmarket

# Restart application
docker-compose start app
```

#### Restore Complete System

```bash
# Stop all services
docker-compose down

# Restore database volume
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/postgres_backup.tar.gz --strip 1"

# Restore uploads
docker cp ./backups/uploads_20250115 farmers-market-app:/app/public/uploads

# Start services
docker-compose up -d
```

### Disaster Recovery Plan

1. **Immediate Actions**
   - Stop affected services
   - Assess damage and data loss
   - Notify stakeholders

2. **Recovery Steps**
   - Restore from most recent backup
   - Verify data integrity
   - Run application tests
   - Check all services are operational

3. **Post-Recovery**
   - Document incident
   - Review backup strategy
   - Update recovery procedures
   - Test recovery process regularly

---

## ⚡ Performance Optimization

### Docker Configuration

#### Docker Daemon Optimization

Edit `/etc/docker/daemon.json`:

```json
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
```

#### Build Performance

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Build with cache
docker-compose build --parallel

# Clear build cache if needed
docker builder prune
```

### Application Performance

#### Node.js Optimization (Already Configured)

The `NODE_OPTIONS` in docker-compose files are optimized for HP OMEN:

```yaml
# For 64GB RAM system
NODE_OPTIONS: "--max-old-space-size=16384 --max-semi-space-size=512"
```

#### PostgreSQL Tuning

Update `docker-compose.yml` PostgreSQL command section:

```yaml
command:
  - "postgres"
  - "-c"
  - "shared_buffers=256MB"      # 25% of RAM
  - "-c"
  - "effective_cache_size=1GB"  # 50-75% of RAM
  - "-c"
  - "maintenance_work_mem=64MB"
  - "-c"
  - "max_connections=200"
  - "-c"
  - "work_mem=2MB"
```

#### Redis Optimization

```yaml
command: >
  redis-server
  --maxmemory 2gb
  --maxmemory-policy allkeys-lru
  --save 900 1
  --save 300 10
```

### Monitoring Performance

```bash
# Container resource usage
docker stats

# Application response time
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:3000

# Database query performance
docker-compose exec db psql -U postgres -d farmersmarket -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

---

## 🔒 Security Best Practices

### Container Security

#### 1. Run as Non-Root User

Already implemented in Dockerfiles:

```dockerfile
USER nextjs  # Non-root user
```

#### 2. Read-Only Filesystem

Add to docker-compose.yml:

```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next/cache
```

#### 3. Security Scanning

```bash
# Scan images for vulnerabilities
docker scan farmers-market-app:latest

# Use Trivy for comprehensive scanning
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image farmers-market-app:latest
```

### Network Security

#### 1. Internal Network Isolation

```yaml
networks:
  farmers-network:
    internal: true  # No external access
  public:
    internal: false  # Only nginx on public network
```

#### 2. Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 5432/tcp  # Block external PostgreSQL access
sudo ufw deny 6379/tcp  # Block external Redis access
```

### Secrets Management

#### 1. Use Docker Secrets (Swarm)

```bash
# Create secret
echo "my-secret-password" | docker secret create db_password -

# Use in compose
services:
  db:
    secrets:
      - db_password
```

#### 2. Environment File Permissions

```bash
# Restrict access to environment files
chmod 600 .env.production
chown $USER:$USER .env.production
```

#### 3. Never Commit Secrets

```bash
# Ensure in .gitignore
echo ".env*" >> .gitignore
echo "!.env.*.example" >> .gitignore
```

### SSL/TLS Configuration

#### 1. Generate Self-Signed Certificate (Development)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

#### 2. Let's Encrypt (Production)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy to nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

#### 3. Auto-Renewal

```bash
# Add to crontab
0 0 1 * * certbot renew && docker-compose restart nginx
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong, unique passwords (32+ characters)
- [ ] Enable SSL/TLS for production
- [ ] Configure firewall rules
- [ ] Implement rate limiting (already in nginx.conf)
- [ ] Enable CORS properly
- [ ] Set secure HTTP headers (already in nginx.conf)
- [ ] Restrict file upload sizes
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Implement intrusion detection
- [ ] Regular security audits
- [ ] Backup encryption
- [ ] Secure API endpoints
- [ ] Input validation
- [ ] SQL injection prevention (Prisma handles this)

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check specific error
docker logs farmers-market-app

# Inspect container
docker inspect farmers-market-app
```

**Common Causes:**
- Port already in use
- Missing environment variables
- Database not ready
- Volume permission issues

**Solutions:**
```bash
# Check port usage
netstat -tlnp | grep 3000

# Kill process using port
kill -9 $(lsof -ti:3000)

# Remove and recreate containers
docker-compose down -v
docker-compose up -d
```

#### Issue: Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# Test connection
docker-compose exec db pg_isready -U postgres

# Check logs
docker-compose logs db
```

**Solutions:**
```bash
# Restart database
docker-compose restart db

# Check connection string in .env
echo $DATABASE_URL

# Wait for database to be ready
sleep 10 && docker-compose restart app
```

#### Issue: Hot Reload Not Working (Development)

**Causes:**
- Volume mount issues
- File watching disabled
- Docker Desktop resource limits

**Solutions:**
```bash
# Enable polling in .env.local
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true

# Increase Docker Desktop resources
# Docker Desktop → Settings → Resources → Advanced
# Memory: 8GB+
# CPUs: 4+

# Restart Docker Desktop
```

#### Issue: Build Fails

```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test -f Dockerfile .
```

#### Issue: Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

#### Issue: Permission Denied

```bash
# Fix volume permissions
docker-compose exec app chown -R nextjs:nodejs /app

# Or run as root temporarily
docker-compose exec -u root app chown -R nextjs:nodejs /app
```

#### Issue: Slow Performance

**Diagnosis:**
```bash
# Check resource usage
docker stats

# Check logs for errors
docker-compose logs --tail=100
```

**Solutions:**
```bash
# Increase resources in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
      cpus: '2'

# Optimize PostgreSQL
docker-compose exec db psql -U postgres -c "VACUUM ANALYZE;"

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### Debug Mode

Enable detailed logging:

```bash
# Add to .env
DEBUG=*
LOG_LEVEL=debug

# Restart with logs
docker-compose restart app
docker-compose logs -f app
```

### Health Check Failures

```bash
# Check health status
docker-compose ps

# Manual health check
curl -v http://localhost:3000/api/health

# Check internal health
docker-compose exec app wget -O- http://localhost:3000/api/health
```

### Network Issues

```bash
# List networks
docker network ls

# Inspect network
docker network inspect farmers-network

# Test connectivity
docker-compose exec app ping db
docker-compose exec app ping redis
```

---

## 🎓 Advanced Topics

### Multi-Stage Builds

Our Dockerfile uses multi-stage builds for optimization:

```dockerfile
FROM node:20-alpine AS deps        # Install dependencies
FROM node:20-alpine AS build-deps  # Install build deps
FROM node:20-alpine AS builder     # Build application
FROM node:20-alpine AS runner      # Final lightweight image
```

**Benefits:**
- Smaller final image (only runtime dependencies)
- Faster builds (better caching)
- More secure (no build tools in production)

### Docker Compose Profiles

Use profiles for conditional services:

```yaml
services:
  pgadmin:
    profiles:
      - advanced
```

```bash
# Start with profile
docker-compose --profile advanced up -d
```

### Health Checks

Custom health check in Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

### Custom Networks

Create isolated networks:

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access
```

### Volume Drivers

Use different volume drivers:

```yaml
volumes:
  postgres-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=nfs-server,rw
      device: ":/path/to/dir"
```

### Docker Swarm Deployment

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml farmersmarket

# List services
docker service ls

# Scale service
docker service scale farmersmarket_app=3
```

### Kubernetes Deployment

Convert Docker Compose to Kubernetes:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.26.0/kompose-linux-amd64 -o kompose

# Convert
kompose convert -f docker-compose.yml

# Deploy to Kubernetes
kubectl apply -f .
```

### CI/CD Integration

#### GitHub Actions

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build Docker image
        run: docker-compose build

      - name: Run tests
        run: docker-compose run app npm test

      - name: Deploy
        run: |
          docker-compose down
          docker-compose up -d
```

### Monitoring Stack

Add monitoring services:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 📚 Additional Resources

### Official Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

### Best Practices

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Security Best Practices](https://docs.docker.com/engine/security/)
- [Node.js in Docker](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

### Community

- [Docker Community Forums](https://forums.docker.com/)
- [Stack Overflow - Docker](https://stackoverflow.com/questions/tagged/docker)
- [Next.js Discord](https://nextjs.org/discord)

---

## 🆘 Getting Help

### Project-Specific Help

1. Check this documentation
2. Review error logs: `docker-compose logs -f`
3. Check container status: `docker-compose ps`
4. Inspect configuration: `docker-compose config`

### Community Support

- GitHub Issues: Report bugs and request features
- Discord/Slack: Real-time community support
- Stack Overflow: Technical questions

### Professional Support

For production deployments and enterprise support, consider:
- Docker Enterprise Support
- Managed hosting providers (AWS ECS, Azure Container Instances, Google Cloud Run)
- Professional DevOps consulting

---

## 📝 Changelog

### Version 1.0.0 (2025-01-15)
- Initial comprehensive Docker setup
- Development and production configurations
- Complete documentation
- Helper scripts for easy deployment
- Security best practices
- Monitoring and backup strategies

---

## 🌟 Conclusion

This guide provides everything you need to deploy and manage the Farmers Market Platform with Docker. From development to production, you now have the tools and knowledge to:

- ✅ Set up local development environment
- ✅ Deploy to production securely
- ✅ Monitor and maintain services
- ✅ Backup and restore data
- ✅ Troubleshoot common issues
- ✅ Optimize performance
- ✅ Scale horizontally

**Happy Divine Agricultural Docker Deployment! 🌾⚡**

---

_For questions, issues, or contributions, please refer to the project repository._