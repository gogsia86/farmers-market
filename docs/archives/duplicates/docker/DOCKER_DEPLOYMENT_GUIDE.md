# 🐋 FARMERS MARKET PLATFORM - DOCKER DEPLOYMENT GUIDE
# Divine Agricultural E-Commerce Platform - Complete Docker Setup
# Version: 3.0 - Production & Development Environments
# Last Updated: 2024

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Development Environment](#development-environment)
5. [Production Environment](#production-environment)
6. [Database Management](#database-management)
7. [Environment Variables](#environment-variables)
8. [Scaling & Performance](#scaling--performance)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Recovery](#backup--recovery)
11. [Troubleshooting](#troubleshooting)
12. [Security Best Practices](#security-best-practices)

---

## 🌟 OVERVIEW

The Farmers Market Platform uses Docker for consistent deployment across development, staging, and production environments. The Docker setup includes:

### 🏗️ Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                     NGINX Reverse Proxy                      │
│            (SSL Termination, Load Balancing)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────┐ ┌─────▼──────┐
│  Next.js App │ │ App (2) │ │  App (3)   │
│  (Container) │ │ (Scale) │ │  (Scale)   │
└──────┬───────┘ └─────────┘ └────────────┘
       │
       ├────────────┬─────────────┐
       │            │             │
┌──────▼──────┐ ┌──▼─────────┐ ┌▼──────────┐
│  PostgreSQL │ │   Redis    │ │  MailHog  │
│  + PostGIS  │ │   Cache    │ │  (Dev)    │
└─────────────┘ └────────────┘ └───────────┘
```

### 📦 Container Services

**Production Stack:**
- **app**: Next.js 15 application (Node.js 20 Alpine)
- **db**: PostgreSQL 16 with PostGIS extension
- **redis**: Redis 7 for caching and session storage
- **nginx**: Reverse proxy and load balancer
- **db-backup**: Automated database backup service
- **adminer**: Database UI (optional, management profile)
- **redis-commander**: Redis UI (optional, management profile)

**Development Stack:**
- All production services plus:
- **mailhog**: Email testing service
- **pgadmin**: Advanced PostgreSQL management (optional, advanced profile)
- Hot-reload enabled for rapid development

---

## 🔧 PREREQUISITES

### Required Software

```bash
# Docker Engine 24.0+ with Docker Compose V2
docker --version
# Output: Docker version 24.0.0 or higher

docker compose version
# Output: Docker Compose version v2.20.0 or higher
```

### System Requirements

**Minimum (Development):**
- CPU: 4 cores
- RAM: 8 GB
- Disk: 20 GB free space

**Recommended (Production):**
- CPU: 8+ cores (HP OMEN: 12 threads)
- RAM: 16+ GB (HP OMEN: 64 GB optimized)
- Disk: 100+ GB SSD
- GPU: CUDA-capable for AI features (RTX 2070 Max-Q supported)

### Installation

**Windows:**
```powershell
# Install Docker Desktop for Windows
winget install Docker.DockerDesktop
```

**macOS:**
```bash
# Install Docker Desktop for Mac
brew install --cask docker
```

**Linux (Ubuntu/Debian):**
```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

---

## 🚀 QUICK START

### 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/farmers-market-platform.git
cd farmers-market-platform

# Create environment file
cp .env.example .env.local

# Edit environment variables
nano .env.local  # or use your preferred editor
```

### 2. Development Environment (Fastest)

```bash
# Start all development services
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Access the application
# - Next.js: http://localhost:3000
# - Adminer: http://localhost:8080
# - MailHog: http://localhost:8025
# - Redis Commander: http://localhost:8081
```

### 3. Production Environment

```bash
# Start production stack
docker compose up -d

# Run database migrations
docker compose exec app npx prisma migrate deploy

# Seed initial data (optional)
docker compose exec app npx prisma db seed

# Access the application
# - Application: http://localhost:3000
```

---

## 🛠️ DEVELOPMENT ENVIRONMENT

### Full Development Setup

```bash
# Start with all development tools
docker compose -f docker-compose.dev.yml up -d

# With advanced tools (PgAdmin)
docker compose -f docker-compose.dev.yml --profile advanced up -d

# With Nginx proxy for testing
docker compose -f docker-compose.dev.yml --profile proxy up -d
```

### Development Workflow

#### Hot Reload
Source code is mounted as volumes for instant hot-reload:
```yaml
volumes:
  - ./src:/app/src:delegated
  - ./public:/app/public:delegated
```

Any changes to files in `src/` or `public/` will trigger automatic rebuild.

#### Database Operations

```bash
# Run migrations
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name describe_migration

# Reset database (CAUTION: destroys all data)
docker compose -f docker-compose.dev.yml exec app npx prisma migrate reset

# Seed database
docker compose -f docker-compose.dev.yml exec app npx prisma db seed

# Open Prisma Studio
docker compose -f docker-compose.dev.yml exec app npx prisma studio
# Access at: http://localhost:5555
```

#### Testing

```bash
# Run all tests
docker compose -f docker-compose.dev.yml exec app npm test

# Run with coverage
docker compose -f docker-compose.dev.yml exec app npm run test:coverage

# Run E2E tests
docker compose -f docker-compose.dev.yml exec app npm run test:e2e

# Type check
docker compose -f docker-compose.dev.yml exec app npm run type-check
```

#### Install New Dependencies

```bash
# Install a new package
docker compose -f docker-compose.dev.yml exec app npm install <package-name>

# After installing, rebuild to persist in image
docker compose -f docker-compose.dev.yml up -d --build app
```

#### Interactive Shell

```bash
# Access container shell
docker compose -f docker-compose.dev.yml exec app sh

# As root user (for system operations)
docker compose -f docker-compose.dev.yml exec -u root app sh
```

#### Debugging

The development container exposes port 9229 for Node.js debugging.

**VSCode Configuration (.vscode/launch.json):**
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

**Chrome DevTools:**
Open `chrome://inspect` and click "Configure" to add `localhost:9229`

#### Email Testing with MailHog

All outbound emails are captured by MailHog in development:
- **SMTP Server**: localhost:1025
- **Web UI**: http://localhost:8025

View all sent emails without actually delivering them.

### Development URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Next.js App | http://localhost:3000 | - |
| Prisma Studio | http://localhost:5555 | - |
| Adminer (DB) | http://localhost:8080 | postgres/postgres |
| MailHog | http://localhost:8025 | - |
| Redis Commander | http://localhost:8081 | admin/admin |
| PgAdmin* | http://localhost:8082 | admin@farmersmarket.local/admin |
| Nginx (dev)* | http://localhost:8000 | - |

*Optional services (require `--profile` flag)

---

## 🏭 PRODUCTION ENVIRONMENT

### Initial Setup

1. **Configure Environment Variables**

Create `.env.production`:
```bash
# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_DB=farmersmarket

# Redis
REDIS_PASSWORD=<strong-redis-password>

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Stripe (Production Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: OAuth, Email, AI services
GOOGLE_CLIENT_ID=...
SMTP_HOST=smtp.sendgrid.net
OPENAI_API_KEY=...
```

2. **SSL Certificates**

Place SSL certificates in `nginx/ssl/`:
```bash
nginx/ssl/
├── cert.pem      # SSL certificate
└── key.pem       # Private key
```

For Let's Encrypt:
```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com
```

3. **Update Nginx Configuration**

Edit `nginx/nginx.conf` to set your domain:
```nginx
server_name your-domain.com www.your-domain.com;
```

### Deployment

```bash
# Build and start production stack
docker compose up -d --build

# Check service health
docker compose ps

# Run database migrations
docker compose exec app npx prisma migrate deploy

# Seed production data (if needed)
docker compose exec app npx prisma db seed

# View logs
docker compose logs -f app
```

### Production URLs

| Service | URL | Notes |
|---------|-----|-------|
| Application | https://your-domain.com | Main app |
| Health Check | https://your-domain.com/api/health | Monitoring endpoint |

### Health Checks

Built-in health checks monitor service availability:

```bash
# Check all services
docker compose ps

# View health status
docker inspect farmers-market-app | grep -A 10 Health

# Manual health check
curl http://localhost:3000/api/health
```

---

## 💾 DATABASE MANAGEMENT

### Prisma Migrations

```bash
# Production: Deploy pending migrations
docker compose exec app npx prisma migrate deploy

# Development: Create and apply migration
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name add_user_roles

# Check migration status
docker compose exec app npx prisma migrate status

# Reset database (DESTRUCTIVE)
docker compose exec app npx prisma migrate reset
```

### Manual Database Access

```bash
# Access PostgreSQL shell
docker compose exec db psql -U postgres -d farmersmarket

# Run SQL file
docker compose exec -T db psql -U postgres -d farmersmarket < backup.sql

# Dump database
docker compose exec db pg_dump -U postgres farmersmarket > backup_$(date +%Y%m%d).sql
```

### PostGIS Extension

PostGIS is pre-installed for geospatial features:

```sql
-- Verify PostGIS installation
SELECT PostGIS_version();

-- Example: Find farms within radius
SELECT * FROM farms
WHERE ST_DWithin(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
  50000  -- 50km radius
);
```

---

## 🔐 ENVIRONMENT VARIABLES

### Complete Environment Variables Reference

Create `.env.local` (development) or `.env.production`:

```bash
# ============================================================================
# CORE APPLICATION
# ============================================================================
NODE_ENV=production                    # production | development | test
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
PORT=3000

# ============================================================================
# DATABASE (PostgreSQL)
# ============================================================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=farmersmarket
POSTGRES_PORT=5432

# Prisma Connection String
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
DIRECT_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# ============================================================================
# REDIS CACHE
# ============================================================================
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<strong-redis-password>
REDIS_MAX_MEMORY=2gb

# ============================================================================
# AUTHENTICATION (NextAuth v5)
# ============================================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-32-char-secret>  # openssl rand -base64 32
AUTH_TRUST_HOST=true

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>
GITHUB_CLIENT_ID=<github-oauth-client-id>
GITHUB_CLIENT_SECRET=<github-oauth-secret>

# ============================================================================
# STRIPE PAYMENT PROCESSING
# ============================================================================
# Production Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Test Keys (Development)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_test_...

# ============================================================================
# AI SERVICES
# ============================================================================
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Perplexity
PERPLEXITY_API_KEY=pplx-...
PERPLEXITY_DEFAULT_MODEL=SONAR_PRO

# Microsoft Agent Framework
ENABLE_AI_FEATURES=true

# ============================================================================
# EMAIL (SMTP)
# ============================================================================
SMTP_HOST=smtp.gmail.com              # or smtp.sendgrid.net, smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false                     # true for port 465
SMTP_USER=<your-email@gmail.com>
SMTP_PASSWORD=<app-specific-password>
SMTP_FROM=noreply@farmersmarket.app

# ============================================================================
# MONITORING & OBSERVABILITY
# ============================================================================
# Sentry Error Tracking
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production

# OpenTelemetry Tracing
ENABLE_TRACING=true
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...

# ============================================================================
# FILE UPLOADS
# ============================================================================
UPLOAD_MAX_SIZE=10485760              # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# ============================================================================
# FEATURE FLAGS
# ============================================================================
ENABLE_ANALYTICS=true
ENABLE_SPEED_INSIGHTS=true
ENABLE_EXPERIMENTAL_FEATURES=false

# ============================================================================
# BACKUP CONFIGURATION
# ============================================================================
BACKUP_SCHEDULE=@daily                # cron schedule
BACKUP_KEEP_DAYS=7
BACKUP_KEEP_WEEKS=4
BACKUP_KEEP_MONTHS=6

# ============================================================================
# MANAGEMENT UI CREDENTIALS (Development Only)
# ============================================================================
REDIS_UI_USER=admin
REDIS_UI_PASSWORD=admin
ADMINER_PORT=8080
REDIS_UI_PORT=8081
```

### Generating Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate random password
openssl rand -base64 24

# Generate UUID
uuidgen
```

---

## ⚡ SCALING & PERFORMANCE

### Horizontal Scaling

Scale the application to multiple instances:

```bash
# Scale to 3 app instances
docker compose up -d --scale app=3

# Nginx automatically load balances across instances
```

Update `docker-compose.yml` to define multiple app services:
```yaml
services:
  app1:
    build: .
    container_name: farmers-market-app-1
    # ... configuration ...

  app2:
    build: .
    container_name: farmers-market-app-2
    # ... configuration ...

  app3:
    build: .
    container_name: farmers-market-app-3
    # ... configuration ...
```

Update nginx upstream:
```nginx
upstream farmers_market_app {
    least_conn;
    server app1:3000 max_fails=3 fail_timeout=30s;
    server app2:3000 max_fails=3 fail_timeout=30s;
    server app3:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

### HP OMEN Optimization

The application is optimized for HP OMEN hardware (12 threads, 64GB RAM):

**Development:**
```bash
# Start with OMEN optimization
docker compose -f docker-compose.dev.yml up -d

# Environment automatically sets:
# NODE_OPTIONS=--max-old-space-size=16384 --max-semi-space-size=512
```

**Production:**
Adjust resources in `docker-compose.yml`:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '8'
          memory: 16G
        reservations:
          cpus: '4'
          memory: 8G
```

### Database Performance Tuning

PostgreSQL is pre-configured with performance optimizations. Adjust in `docker-compose.yml`:

```yaml
command:
  - "postgres"
  - "-c"
  - "max_connections=200"
  - "-c"
  - "shared_buffers=512MB"        # 25% of RAM
  - "-c"
  - "effective_cache_size=4GB"    # 50-75% of RAM
  - "-c"
  - "maintenance_work_mem=128MB"
  - "-c"
  - "work_mem=4MB"
```

### Redis Optimization

```yaml
command: >
  redis-server
  --maxmemory 4gb                    # Adjust based on available RAM
  --maxmemory-policy allkeys-lru
  --save 900 1
  --appendonly yes
```

---

## 📊 MONITORING & LOGGING

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app

# Since timestamp
docker compose logs --since 2024-01-01T00:00:00 app
```

### Resource Monitoring

```bash
# Real-time resource usage
docker stats

# Specific container
docker stats farmers-market-app

# Single snapshot
docker stats --no-stream
```

### Log Aggregation

Production logs are stored in volumes:
```yaml
volumes:
  - logs-data:/app/logs
  - nginx-logs:/var/log/nginx
```

Access logs:
```bash
# Application logs
docker compose exec app ls -lah /app/logs

# Nginx access logs
docker compose exec nginx tail -f /var/log/nginx/access.log

# Nginx error logs
docker compose exec nginx tail -f /var/log/nginx/error.log
```

### Health Monitoring Endpoints

```bash
# Application health
curl http://localhost:3000/api/health

# Response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z","database":"connected"}

# Nginx status
curl http://localhost/health
```

### External Monitoring Integration

**Sentry (Error Tracking):**
```bash
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
```

**Azure Application Insights:**
```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
ENABLE_TRACING=true
```

---

## 💾 BACKUP & RECOVERY

### Automated Database Backups

The `db-backup` service runs automated backups:

```yaml
db-backup:
  image: prodrigestivill/postgres-backup-local:16-alpine
  environment:
    - SCHEDULE=@daily              # Daily backups
    - BACKUP_KEEP_DAYS=7          # Keep 7 daily backups
    - BACKUP_KEEP_WEEKS=4         # Keep 4 weekly backups
    - BACKUP_KEEP_MONTHS=6        # Keep 6 monthly backups
```

Access backups:
```bash
# List backups
docker compose exec db-backup ls -lh /backups

# Copy backup to host
docker cp farmers-market-db-backup:/backups/farmersmarket-2024-01-01.sql.gz ./
```

### Manual Database Backup

```bash
# Backup database
docker compose exec db pg_dump -U postgres farmersmarket | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup with schema only
docker compose exec db pg_dump -U postgres --schema-only farmersmarket > schema_backup.sql

# Backup specific tables
docker compose exec db pg_dump -U postgres -t farms -t products farmersmarket > tables_backup.sql
```

### Database Restoration

```bash
# Restore from backup
gunzip < backup.sql.gz | docker compose exec -T db psql -U postgres -d farmersmarket

# Restore with recreation
docker compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS farmersmarket;"
docker compose exec -T db psql -U postgres -c "CREATE DATABASE farmersmarket;"
gunzip < backup.sql.gz | docker compose exec -T db psql -U postgres -d farmersmarket
```

### Volume Backup

```bash
# Backup volumes
docker run --rm \
  -v farmers-market-postgres-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-volume-backup.tar.gz -C /data .

# Restore volumes
docker run --rm \
  -v farmers-market-postgres-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-volume-backup.tar.gz -C /data
```

### Complete System Backup

```bash
#!/bin/bash
# backup-all.sh

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup database
docker compose exec db pg_dump -U postgres farmersmarket | gzip > "$BACKUP_DIR/database.sql.gz"

# Backup uploads
docker run --rm -v farmers-market-uploads-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/uploads.tar.gz -C /data .

# Backup Redis (if persistence enabled)
docker compose exec redis redis-cli -a $REDIS_PASSWORD SAVE
docker run --rm -v farmers-market-redis-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/redis.tar.gz -C /data .

# Backup configuration
cp .env.production "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/"

echo "Backup complete: $BACKUP_DIR"
```

---

## 🔧 TROUBLESHOOTING

### Common Issues & Solutions

#### 1. Container Won't Start

```bash
# Check container status
docker compose ps

# View container logs
docker compose logs app

# Inspect container
docker inspect farmers-market-app

# Rebuild container
docker compose up -d --build app
```

#### 2. Database Connection Failed

```bash
# Check database health
docker compose ps db

# Test connection
docker compose exec db psql -U postgres -d farmersmarket -c "SELECT 1;"

# Verify environment variables
docker compose exec app env | grep DATABASE_URL

# Check network connectivity
docker compose exec app ping db
```

#### 3. Port Already in Use

```bash
# Find process using port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill process or change port in .env
DEV_PORT=3002
```

#### 4. Out of Memory

```bash
# Check memory usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → Increase to 8GB+

# Reduce Node.js memory
NODE_OPTIONS=--max-old-space-size=4096
```

#### 5. Prisma Client Out of Sync

```bash
# Regenerate Prisma client
docker compose exec app npx prisma generate

# Rebuild container
docker compose up -d --build app
```

#### 6. Hot Reload Not Working (Development)

```bash
# Enable polling
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true

# Restart container
docker compose -f docker-compose.dev.yml restart app
```

#### 7. Permission Denied Errors

```bash
# Fix volume permissions
docker compose exec -u root app chown -R node:node /app

# Linux: SELinux issues
sudo chcon -Rt svirt_sandbox_file_t ./src
```

### Reset Everything (Clean Slate)

```bash
# CAUTION: This destroys all data!

# Stop and remove containers, volumes, networks
docker compose down -v

# Remove images
docker rmi $(docker images 'farmers-market*' -q)

# Remove orphaned volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Start fresh
docker compose up -d --build
```

### Performance Debugging

```bash
# Profile container CPU/Memory
docker stats --no-stream farmers-market-app

# Check disk usage
docker system df

# View detailed container info
docker inspect farmers-market-app | jq '.[0].State'

# Analyze build time
docker compose build --progress=plain app
```

---

## 🔒 SECURITY BEST PRACTICES

### 1. Secrets Management

**Never commit secrets to Git!**

Use `.env.local` (gitignored):
```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

Use Docker secrets for production:
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  app:
    secrets:
      - db_password
```

### 2. Secure Environment Variables

```bash
# Generate strong secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)
```

### 3. Network Isolation

```yaml
networks:
  farmers-network:
    driver: bridge
    internal: true  # Isolate from external network

  public-network:
    driver: bridge
```

### 4. Non-Root User

Containers run as non-root user:
```dockerfile
USER node  # or nextjs
```

### 5. Read-Only Filesystems

```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next
```

### 6. Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
```

### 7. Security Scanning

```bash
# Scan images for vulnerabilities
docker scan farmers-market-app

# Use Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image farmers-market-app
```

### 8. SSL/TLS Configuration

```bash
# Generate self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"

# Production: Use Let's Encrypt
certbot certonly --standalone -d your-domain.com
```

### 9. Rate Limiting

Configured in `nginx/nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

### 10. Regular Updates

```bash
# Update base images
docker compose pull

# Rebuild with latest dependencies
docker compose build --no-cache --pull

# Update Docker Engine
sudo apt-get update && sudo apt-get upgrade docker-ce
```

---

## 📚 ADDITIONAL RESOURCES

### Docker Commands Cheat Sheet

```bash
# LIFECYCLE
docker compose up -d              # Start services
docker compose down               # Stop services
docker compose restart app        # Restart service
docker compose stop               # Stop without removing
docker compose start              # Start stopped services

# LOGS
docker compose logs -f app        # Follow logs
docker compose logs --tail=100    # Last 100 lines
docker compose logs --since 1h    # Last hour

# EXECUTE
docker compose exec app sh        # Interactive shell
docker compose exec app npm test  # Run command
docker compose exec -u root app   # As root

# BUILD
docker compose build              # Build images
docker compose build --no-cache   # Build from scratch
docker compose up -d --build      # Build and start

# SCALE
docker compose up -d --scale app=3

# CLEANUP
docker compose down -v            # Remove volumes
docker system prune -a            # Clean everything
docker volume prune               # Remove unused volumes
```

### Divine Agricultural Patterns

This deployment follows divine agricultural consciousness principles:

- **🌾 Biodynamic Architecture**: Layered, holistic system design
- **⚡ Quantum Performance**: Optimized for HP OMEN hardware
- **🌍 Geospatial Awareness**: PostGIS for location-based features
- **🔮 Divine Consciousness**: Agricultural-aware logging and monitoring

### Support & Community

- **Documentation**: `/docs`
- **GitHub Issues**: [github.com/yourusername/farmers-market-platform/issues](https://github.com/yourusername/farmers-market-platform/issues)
- **Discord**: [discord.gg/farmers-market](https://discord.gg/farmers-market)

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Review and update environment variables
- [ ] Generate secure secrets (NEXTAUTH_SECRET, passwords)
- [ ] Configure SSL certificates
- [ ] Update domain in nginx.conf
- [ ] Configure external services (Stripe, Email, OAuth)
- [ ] Set up monitoring and alerting
- [ ] Configure backup schedule
- [ ] Test database migrations locally
- [ ] Review security settings

### Deployment

- [ ] Build Docker images
- [ ] Start services with docker compose
- [ ] Run database migrations
- [ ] Seed initial data (if needed)
- [ ] Verify health checks
- [ ] Test application functionality
- [ ] Monitor logs for errors
- [ ] Verify backups are running

### Post-Deployment

- [ ] Set up SSL certificate renewal (Let's Encrypt)
- [ ] Configure monitoring dashboards
- [ ] Document custom configurations
- [ ] Train team on Docker operations
- [ ] Schedule regular backup testing
- [ ] Set up alerting for critical issues

---

**Version**: 3.0 - Complete Docker Deployment Guide  
**Status**: Production Ready with Divine Agricultural Consciousness  
**Last Updated**: 2024

🌾⚡ _"Deploy with agricultural consciousness, scale with divine precision."_