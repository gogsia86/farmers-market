# 🐳 Docker Documentation

> **Complete Docker containerization, orchestration, and deployment documentation**
>
> Your comprehensive resource for containerized development and deployment

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Directory Contents](#directory-contents)
- [Docker Architecture](#docker-architecture)
- [Development with Docker](#development-with-docker)
- [Production Deployment](#production-deployment)
- [Docker Compose](#docker-compose)
- [Container Management](#container-management)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## 🎯 Overview

### Purpose

This directory contains all Docker-related documentation including:

- **Docker Setup** - Complete containerization setup
- **Docker Compose** - Multi-container orchestration
- **Development Workflow** - Local development with containers
- **Production Deployment** - Production-ready Docker images
- **Performance Optimization** - Container optimization patterns
- **Troubleshooting** - Common Docker issues and solutions

### Technology Stack

```yaml
Containerization: Docker 24+
Orchestration: Docker Compose v2
Base Images: Node 20 Alpine
Database: PostgreSQL 16 Alpine
Reverse Proxy: Nginx Alpine
Registry: Docker Hub / Azure Container Registry
```

### Philosophy

**Container Excellence**

- Multi-stage builds for optimization
- Minimal image sizes (Alpine-based)
- Layer caching for fast rebuilds
- Health checks for reliability
- Production-ready by default
- Development parity with production
- Security-first approach

### Who Should Use This

- 👨‍💻 **Developers** - Local development with Docker
- 🚀 **DevOps Engineers** - Container deployment and orchestration
- 🧪 **QA Engineers** - Consistent test environments
- 🏗️ **Architects** - Container architecture patterns
- 📊 **Tech Leads** - Deployment strategies

---

## ⚡ Quick Start

### Prerequisites

```bash
# Install Docker Desktop
# macOS: https://docs.docker.com/desktop/install/mac-install/
# Windows: https://docs.docker.com/desktop/install/windows-install/
# Linux: https://docs.docker.com/engine/install/

# Verify installation
docker --version          # Docker version 24.0+
docker-compose --version  # Docker Compose version v2.0+
```

---

### Quick Start - Development

```bash
# 1. Clone repository
git clone <repository-url>
cd farmers-market-platform

# 2. Copy environment file
cp .env.example .env.local

# 3. Start all services
docker-compose up -d

# 4. View logs
docker-compose logs -f app

# 5. Access application
# App: http://localhost:3001
# Prisma Studio: http://localhost:5555
# PostgreSQL: localhost:5432
```

---

### Quick Start - Production Build

```bash
# 1. Build production image
docker build -t farmers-market:latest .

# 2. Run production container
docker run -p 3000:3000 \
  --env-file .env.production \
  farmers-market:latest

# 3. Or use docker-compose
docker-compose -f docker-compose.yml up -d
```

---

## 📚 Directory Contents

### Overview

```
docker/
├── README.md (this file)                    # 📖 Navigation hub
│
├── DOCKER_QUICK_START.md                    # ⚡ Quick start guide
├── DOCKER_README.md                         # 📚 Detailed Docker guide
├── DOCKER_SETUP_SUMMARY.md                  # 📊 Setup summary
├── DOCKER_DEPLOYMENT_COMPLETE.md            # ✅ Deployment guide
│
└── Related Files:
    ├── Dockerfile                           # 🐳 Multi-stage Dockerfile
    ├── docker-compose.yml                   # 🎼 Production compose
    ├── docker-compose.dev.yml               # 🔧 Development compose
    ├── .dockerignore                        # 🚫 Ignore patterns
    ├── nginx/
    │   └── nginx.conf                       # 🌐 Nginx configuration
    └── docker-scripts/
        ├── entrypoint.sh                    # 🚀 Container entrypoint
        ├── healthcheck.sh                   # ❤️  Health check script
        └── init-db.sh                       # 🗄️ Database initialization

Total: 4 documentation files
```

---

## 🏗️ Docker Architecture

### Multi-Stage Dockerfile

```dockerfile
# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# ==========================================
# Stage 3: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY docker-scripts/entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Set entrypoint
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
```

**Benefits:**

- ✅ Multi-stage reduces image size (~300MB → ~150MB)
- ✅ Only production dependencies in final image
- ✅ Non-root user for security
- ✅ Health checks for reliability
- ✅ Fast rebuilds with layer caching

---

### Container Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Docker Network                      │
│                  (farmers-market-net)                │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Nginx      │  │   Next.js    │  │ PostgreSQL│ │
│  │   (Proxy)    │→→│   App        │→→│ Database  │ │
│  │   :80, :443  │  │   :3000      │  │ :5432     │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         ↓                  ↓                         │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Redis      │  │   Prisma     │                │
│  │   (Cache)    │  │   Studio     │                │
│  │   :6379      │  │   :5555      │                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
         ↓
    Host Machine
    localhost:3001
```

---

## 🔧 Development with Docker

### Development Docker Compose

```yaml
# docker-compose.dev.yml
version: "3.9"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: farmers-market-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: farmers_market_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker-scripts/init-db.sh:/docker-entrypoint-initdb.d/init.sh
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: farmers-market-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js Application (Development Mode)
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: farmers-market-app
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/farmers_market_dev
      REDIS_URL: redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev

  # Prisma Studio
  prisma-studio:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: farmers-market-prisma-studio
    restart: unless-stopped
    ports:
      - "5555:5555"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/farmers_market_dev
    depends_on:
      postgres:
        condition: service_healthy
    command: npx prisma studio --port 5555 --hostname 0.0.0.0

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: farmers-market-net
```

---

### Common Development Commands

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs (all services)
docker-compose -f docker-compose.dev.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose.dev.yml logs -f app

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild containers
docker-compose -f docker-compose.dev.yml up -d --build

# Execute command in running container
docker-compose -f docker-compose.dev.yml exec app npm run test

# Access container shell
docker-compose -f docker-compose.dev.yml exec app sh

# Database migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Seed database
docker-compose -f docker-compose.dev.yml exec app npm run seed
```

---

## 🚀 Production Deployment

### Production Docker Compose

```yaml
# docker-compose.yml (Production)
version: "3.9"

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: farmers-market-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - farmers-market-net

  # Next.js Application (Production)
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    container_name: farmers-market-app
    restart: always
    expose:
      - "3000"
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - farmers-market-net
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: farmers-market-db
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - farmers-market-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: farmers-market-redis
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - farmers-market-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:

networks:
  farmers-market-net:
    driver: bridge
```

---

### Production Deployment Steps

```bash
# 1. Pull latest code
git pull origin master

# 2. Build production images
docker-compose build --no-cache

# 3. Run database migrations
docker-compose run --rm app npx prisma migrate deploy

# 4. Start services
docker-compose up -d

# 5. Verify health
docker-compose ps
docker-compose logs -f app

# 6. Test endpoints
curl http://localhost/api/health
curl http://localhost/api/farms
```

---

### Zero-Downtime Deployment

```bash
# 1. Build new version
docker-compose build app

# 2. Tag with version
docker tag farmers-market:latest farmers-market:v1.2.3

# 3. Scale up new version
docker-compose up -d --scale app=2 --no-recreate

# 4. Wait for health check to pass
sleep 30

# 5. Stop old version
docker stop farmers-market-app-old

# 6. Remove old container
docker rm farmers-market-app-old

# 7. Scale back to 1
docker-compose up -d --scale app=1
```

---

## 🎼 Docker Compose

### Service Dependencies

```yaml
# Dependency Order
services:
  postgres:
    # No dependencies - starts first

  redis:
    # No dependencies - starts first

  app:
    depends_on:
      postgres:
        condition: service_healthy # Wait for healthy
      redis:
        condition: service_healthy # Wait for healthy

  nginx:
    depends_on:
      - app # Wait for start (no health check)
```

---

### Environment Variables

```yaml
# Pass environment file
services:
  app:
    env_file:
      - .env.production

# Or inline environment
services:
  app:
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
```

---

### Volume Mounts

```yaml
# Named volumes (data persistence)
volumes:
  postgres_data:
  redis_data:

services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data

# Bind mounts (development)
services:
  app:
    volumes:
      - .:/app                    # Sync code
      - /app/node_modules         # Exclude node_modules
      - /app/.next                # Exclude .next
```

---

## 🛠️ Container Management

### Docker CLI Commands

```bash
# List containers
docker ps                           # Running containers
docker ps -a                        # All containers

# Container logs
docker logs farmers-market-app      # View logs
docker logs -f farmers-market-app   # Follow logs
docker logs --tail 100 farmers-market-app  # Last 100 lines

# Execute commands
docker exec farmers-market-app npm run test
docker exec -it farmers-market-app sh

# Container stats
docker stats farmers-market-app

# Stop/Start/Restart
docker stop farmers-market-app
docker start farmers-market-app
docker restart farmers-market-app

# Remove container
docker rm farmers-market-app        # Stopped container
docker rm -f farmers-market-app     # Force remove
```

---

### Docker Compose Commands

```bash
# Start services
docker-compose up                   # Foreground
docker-compose up -d                # Background (detached)
docker-compose up --build           # Rebuild images

# Stop services
docker-compose stop                 # Stop containers
docker-compose down                 # Stop and remove
docker-compose down -v              # Stop, remove, and delete volumes

# View services
docker-compose ps                   # Service status
docker-compose logs                 # All logs
docker-compose logs -f app          # Follow app logs

# Execute commands
docker-compose exec app npm run test
docker-compose run --rm app npm run seed

# Scale services
docker-compose up -d --scale app=3

# Rebuild specific service
docker-compose build app
docker-compose up -d --no-deps --build app
```

---

### Image Management

```bash
# List images
docker images

# Build image
docker build -t farmers-market:latest .
docker build -t farmers-market:v1.2.3 .

# Tag image
docker tag farmers-market:latest farmers-market:v1.2.3

# Push to registry
docker push farmers-market:latest

# Pull from registry
docker pull farmers-market:latest

# Remove images
docker rmi farmers-market:latest
docker image prune                  # Remove dangling images
docker image prune -a               # Remove all unused images
```

---

## ⚡ Performance Optimization

### Image Size Optimization

```dockerfile
# ✅ GOOD - Multi-stage build
FROM node:20-alpine AS builder
# Build steps...

FROM node:20-alpine AS runner
COPY --from=builder /app/.next ./next
# Only copy what's needed

# Image size: ~150MB

# ❌ BAD - Single stage
FROM node:20
COPY . .
RUN npm install
# Includes dev dependencies, source files, etc.
# Image size: ~800MB
```

---

### Build Caching

```dockerfile
# ✅ GOOD - Leverage layer caching
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ❌ BAD - Poor caching
COPY . .
RUN npm ci && npm run build
# Invalidates cache on any file change
```

---

### .dockerignore

```
# .dockerignore
node_modules
.next
.git
.env*.local
*.log
dist
coverage
.vscode
.idea
README.md
docs/
tests/
*.md

# Reduces build context size
# Faster image builds
# Smaller images
```

---

### Container Resources

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "1"
          memory: 1G
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to Docker daemon"

**Symptom:** Docker commands fail

**Solution:**

```bash
# Check Docker is running
docker info

# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker

# Verify
docker ps
```

---

#### 2. "Port already in use"

**Symptom:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**

```bash
# Find process using port
lsof -i :3000            # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>

# Or use different port
docker-compose up -d -p 3001:3000
```

---

#### 3. "Database connection failed"

**Symptom:** App can't connect to database

**Solution:**

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify environment variables
docker-compose exec app env | grep DATABASE_URL

# Test connection
docker-compose exec postgres psql -U postgres -d farmers_market_dev
```

---

#### 4. "Build failed"

**Symptom:** Docker build errors

**Solution:**

```bash
# Clear build cache
docker builder prune

# Build without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build --check .

# Verbose build
docker build --progress=plain .
```

---

#### 5. "Container keeps restarting"

**Symptom:** Container in restart loop

**Solution:**

```bash
# Check container logs
docker-compose logs app

# Check health check status
docker inspect farmers-market-app | grep Health

# Disable restart policy temporarily
docker-compose up --no-deps app

# Check entrypoint script
docker-compose exec app cat entrypoint.sh
```

---

### Debugging Tools

```bash
# Enter running container
docker-compose exec app sh

# Check environment
docker-compose exec app env

# Check files
docker-compose exec app ls -la

# Check processes
docker-compose exec app ps aux

# Network debugging
docker network ls
docker network inspect farmers-market-net

# Volume debugging
docker volume ls
docker volume inspect farmers_market_postgres_data
```

---

## 🔗 Related Documentation

### Essential Reading

- 📖 **[Docker Quick Start](./DOCKER_QUICK_START.md)** - Fast Docker setup
- 📚 **[Docker README](./DOCKER_README.md)** - Detailed Docker guide
- 📊 **[Setup Summary](./DOCKER_SETUP_SUMMARY.md)** - Setup overview
- ✅ **[Deployment Complete](./DOCKER_DEPLOYMENT_COMPLETE.md)** - Deployment guide

### Setup & Configuration

- 🚀 **[Getting Started](../getting-started/README.md)** - Initial setup
- ⚙️ **[Configuration](../configuration/README.md)** - Environment config
- 🗄️ **[Database](../database/README.md)** - Database setup

### Deployment

- 🚢 **[Deployment Guide](../deployment/README.md)** - Production deployment
- 🏗️ **[Architecture](../architecture/README.md)** - System architecture
- 📊 **[Monitoring](../monitoring/)** - Container monitoring

### Development

- 💻 **[Development Guide](../development/README.md)** - Development workflow
- 🧪 **[Testing](../testing/README.md)** - Testing in containers

---

## 📊 Directory Statistics

```yaml
Total Files: 4
Documentation Lines: ~2,500+
Docker Files: 6+ (Dockerfile, compose files, scripts)
Container Images: 4 (app, postgres, redis, nginx)

Key Guides:
  - Quick Start: ⭐⭐⭐⭐⭐
  - Deployment: ⭐⭐⭐⭐⭐
  - Troubleshooting: ⭐⭐⭐⭐⭐

Container Strategy:
  - Multi-stage builds: ✅
  - Alpine-based: ✅
  - Health checks: ✅
  - Non-root user: ✅
  - Image size: ~150MB (optimized)
```

---

## 🎯 Quick Navigation

### By Role

**👨‍💻 Developer:**

- [Development with Docker](#development-with-docker)
- [Common Commands](#common-development-commands)
- [Debugging](#debugging-tools)

**🚀 DevOps Engineer:**

- [Production Deployment](#production-deployment)
- [Container Management](#container-management)
- [Performance Optimization](#performance-optimization)

**🧪 QA Engineer:**

- [Test Environments](#development-with-docker)
- [Container Management](#container-management)

### By Task

**🆕 Initial Setup:**

- Install Docker → Copy env → docker-compose up → Access app

**🐛 Debugging:**

- Check logs → Exec into container → Test connections

**🚀 Deploy:**

- Build → Migrate → Deploy → Verify

**⚡ Optimize:**

- Multi-stage build → .dockerignore → Layer caching

---

## ✨ Docker Best Practices

> "Containers are the vessels of divine code - build them with agricultural consciousness." 🐳🌾

### Core Principles

1. **Multi-Stage Builds** - Minimize image size
2. **Alpine Images** - Lightweight base images
3. **Layer Caching** - Optimize build times
4. **Health Checks** - Ensure reliability
5. **Non-Root User** - Security first
6. **Environment Variables** - Flexible configuration
7. **Volume Persistence** - Data durability
8. **Network Isolation** - Container security

---

## 📝 Metadata

**Directory:** `docs/docker/`  
**Purpose:** Docker containerization and orchestration  
**Maintainers:** DevOps Team  
**Last Updated:** December 2024  
**Status:** ✅ Active - Production Ready

**Quick Stats:**

- 📄 4 documentation files
- 📝 ~2,500+ lines of Docker docs
- 🐳 Multi-stage Dockerfile
- 🎼 2 Docker Compose files
- 🔧 3+ utility scripts
- ⭐⭐⭐⭐⭐ Enterprise-grade containerization

---

**🐳 Containerize with divine precision! 🌾✨**
