# 🚀 Docker Setup Guide

# Farmers Market Platform - Complete Setup Instructions

**Version**: 3.0  
**Last Updated**: November 27, 2024  
**Difficulty**: Beginner to Intermediate

---

## 📋 Overview

This guide will walk you through setting up the Farmers Market Platform using Docker, from initial installation to running your first development or production environment.

**What You'll Learn:**

- Installing Docker and prerequisites
- Setting up development environment
- Setting up production environment
- Environment configuration
- Database setup and migrations
- Common setup issues and solutions

---

## 🎯 Prerequisites

### System Requirements

**Minimum Requirements:**

- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 8GB (16GB recommended for development)
- **Disk**: 20GB free space (40GB recommended)
- **CPU**: 4 cores (8+ recommended)

**Recommended (HP OMEN Specs):**

- **RAM**: 64GB
- **CPU**: 12 threads
- **GPU**: RTX 2070 Max-Q (for AI features)
- **Disk**: NVMe SSD

### Required Software

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Version: 24.0 or higher
   - Download: https://docs.docker.com/get-docker/

2. **Docker Compose**
   - Version: v2.20 or higher
   - Included with Docker Desktop
   - Linux: Install separately

3. **Git** (for cloning repository)
   - Download: https://git-scm.com/downloads

### Optional but Recommended

- **VS Code** with Docker extension
- **Postman** or similar API testing tool
- **pgAdmin** or **DBeaver** for database management

---

## 📦 Installation

### Step 1: Install Docker

#### Windows

```powershell
# 1. Download Docker Desktop for Windows
# https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

# 2. Run installer and follow prompts

# 3. Enable WSL 2 backend (recommended)

# 4. Verify installation
docker --version
docker-compose --version
```

#### macOS

```bash
# 1. Download Docker Desktop for Mac
# https://desktop.docker.com/mac/main/amd64/Docker.dmg (Intel)
# https://desktop.docker.com/mac/main/arm64/Docker.dmg (Apple Silicon)

# 2. Install by dragging to Applications

# 3. Start Docker Desktop

# 4. Verify installation
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)

```bash
# 1. Update package index
sudo apt-get update

# 2. Install dependencies
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. Add user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker

# 7. Verify installation
docker --version
docker compose version
```

### Step 2: Configure Docker (Optional but Recommended)

#### Increase Resources

**Docker Desktop (Windows/Mac):**

1. Open Docker Desktop
2. Go to Settings → Resources
3. Adjust:
   - **CPUs**: 4-8 cores
   - **Memory**: 8-16GB
   - **Disk**: 40GB+

**Linux:**

```bash
# Docker uses all available resources by default
# Configure individual container limits in docker-compose.yml
```

#### Enable BuildKit (Faster Builds)

```bash
# Add to ~/.bashrc or ~/.zshrc
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

---

## 🛠️ Project Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd "Farmers Market Platform web and app"

# Verify you're in the correct directory
ls -la
# You should see: package.json, docker/, src/, etc.
```

### Step 2: Environment Configuration

#### Development Environment

```bash
# 1. Copy example environment file
cp .env.example .env.local

# 2. Open .env.local and configure basic settings
# Most defaults work for development, but verify:

# Required (use development defaults):
DATABASE_URL="postgresql://postgres:postgres@db:5432/farmersmarket"
NEXTAUTH_SECRET="development-secret-key-min-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
REDIS_PASSWORD="devpassword"

# Optional (add if you want to test):
# STRIPE_SECRET_KEY=your_stripe_test_key
# OPENAI_API_KEY=your_openai_key
```

#### Production Environment

```bash
# 1. Copy example environment file
cp .env.example .env

# 2. Generate secure secrets
# NEXTAUTH_SECRET (generate random 32+ char string)
openssl rand -base64 32

# POSTGRES_PASSWORD (generate secure password)
openssl rand -base64 16

# REDIS_PASSWORD (generate secure password)
openssl rand -base64 16

# 3. Configure production values in .env
nano .env
```

**Required Production Variables:**

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generated-secret-32-chars-min>

# Database
DATABASE_URL=postgresql://<user>:<password>@db:5432/farmersmarket
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generated-secure-password>
POSTGRES_DB=farmersmarket

# Redis
REDIS_URL=redis://:<password>@redis:6379
REDIS_PASSWORD=<generated-secure-password>

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

See `../../.env.example` for complete list with descriptions.

---

## 🚀 Running the Application

### Development Mode

#### Quick Start (Recommended)

```bash
# Navigate to compose directory
cd docker/compose

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Wait for services to be ready (30-60 seconds)
# Look for: "✓ Ready on http://0.0.0.0:3001"
```

#### First-Time Setup

```bash
# 1. Start services
cd docker/compose
docker-compose -f docker-compose.dev.yml up -d

# 2. Wait for database to be ready
docker-compose -f docker-compose.dev.yml logs db | grep "ready to accept connections"

# 3. Run database migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# 4. Seed database with sample data (optional)
docker-compose -f docker-compose.dev.yml exec app npx prisma db seed

# 5. Access application
# - App: http://localhost:3001
# - Prisma Studio: http://localhost:5555
# - Adminer: http://localhost:8082
```

#### Hot Reload Development

The development setup includes:

- ✅ Hot module replacement (HMR)
- ✅ Turbopack for faster builds
- ✅ File watching with polling (Docker-compatible)
- ✅ Node.js debugger on port 9229

**Make changes and see them live:**

```bash
# Edit any file in src/
# Changes will automatically reload in the browser

# View live logs
docker-compose -f docker-compose.dev.yml logs -f app
```

### Production Mode

#### Build and Start

```bash
# 1. Navigate to compose directory
cd docker/compose

# 2. Build production images
docker-compose build app

# 3. Start all services (without management tools)
docker-compose up -d

# 4. Run database migrations
docker-compose exec app npx prisma migrate deploy

# 5. Verify health
docker-compose ps
curl http://localhost:3000/api/health

# 6. View logs
docker-compose logs -f app
```

#### With Management Tools (Adminer, Redis Commander)

```bash
# Start with management profile
docker-compose --profile management up -d

# Access:
# - App: http://localhost:3000
# - Adminer: http://localhost:8082
# - Redis Commander: http://localhost:8081
```

---

## 🗄️ Database Setup

### Initial Migration

```bash
# Development
cd docker/compose
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Production
docker-compose exec app npx prisma migrate deploy
```

### Seed Sample Data

```bash
# Development
docker-compose -f docker-compose.dev.yml exec app npx prisma db seed

# Production (not recommended)
docker-compose exec app npx prisma db seed
```

### Database Management

#### Using Prisma Studio

```bash
# Development (already exposed on port 5555)
# Open http://localhost:5555

# Production (start studio temporarily)
docker-compose exec app npx prisma studio
```

#### Using Adminer

```bash
# Already included in dev stack
# Open http://localhost:8082

# Login with:
# System: PostgreSQL
# Server: db
# Username: postgres
# Password: postgres (dev) or your production password
# Database: farmersmarket
```

#### Direct Database Access

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d farmersmarket

# Run SQL queries
\dt  # List tables
\d users  # Describe users table
SELECT * FROM farms LIMIT 5;
```

---

## 🔧 Advanced Configuration

### Custom Ports

Create `docker-compose.override.yml` in `docker/compose/`:

```yaml
services:
  app:
    ports:
      - "3002:3000" # Custom port

  db:
    ports:
      - "5433:5432" # Custom PostgreSQL port
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect farmers-market-postgres-data

# Backup volume
docker run --rm -v farmers-market-postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v farmers-market-postgres-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

### Multi-Stage Build Optimization

```bash
# Build with cache
cd docker/dockerfiles
docker build -f Dockerfile -t farmers-market:latest ../..

# Build without cache (clean build)
docker build --no-cache -f Dockerfile -t farmers-market:latest ../..

# Build with BuildKit (faster)
DOCKER_BUILDKIT=1 docker build -f Dockerfile -t farmers-market:latest ../..
```

---

## 🔍 Verification & Testing

### Health Checks

```bash
# Check all services
docker-compose ps

# Check application health
curl http://localhost:3000/api/health

# Check database
docker-compose exec db pg_isready -U postgres

# Check Redis
docker-compose exec redis redis-cli -a <password> ping
```

### Service Status

```bash
# View running containers
docker-compose ps

# View resource usage
docker stats

# View logs
docker-compose logs -f

# Inspect specific service
docker inspect farmers-market-app
```

---

## 🛑 Stopping & Cleaning Up

### Stop Services

```bash
# Stop all services (preserves data)
docker-compose down

# Stop specific service
docker-compose stop app
```

### Remove Everything (including data)

```bash
# ⚠️ WARNING: This will delete all data!

# Stop and remove containers, networks
docker-compose down

# Remove volumes (deletes database!)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

### Clean Rebuild

```bash
# When you need a fresh start
cd docker/compose

# Development
docker-compose -f docker-compose.dev.yml down -v
docker builder prune -af
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose down -v
docker builder prune -af
docker-compose build --no-cache
docker-compose up -d
```

---

## 🎓 Next Steps

After setup, explore:

1. **Development Guide**: `../../docs/QUICK-START.md`
2. **Deployment Guide**: `DEPLOYMENT-GUIDE.md`
3. **API Documentation**: `../../docs/api/`
4. **Troubleshooting**: `TROUBLESHOOTING.md`

---

## 📚 Additional Resources

- **Docker README**: `../README.md`
- **Environment Guide**: `../../docs/deployment/ENV-SETUP-GUIDE.md`
- **Main README**: `../../README.md`
- **Docker Scripts**: `../../scripts/docker/`

---

## 💡 Quick Tips

```bash
# Restart service quickly
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build app

# Follow logs
docker-compose logs -f app

# Execute commands in container
docker-compose exec app sh

# Run migrations
docker-compose exec app npx prisma migrate dev

# Open database shell
docker-compose exec db psql -U postgres -d farmersmarket
```

---

**Setup Guide Version**: 3.0  
**Last Updated**: November 27, 2024  
**Status**: ✅ Complete

_For troubleshooting, see `TROUBLESHOOTING.md`_
