# 🐋 Docker Scripts - Farmers Market Platform

Divine Agricultural Docker Deployment & Development Scripts

## 📋 Overview

This directory contains helper scripts for managing the Farmers Market Platform Docker environment with divine agricultural consciousness.

## 📁 Scripts

### 🚀 `docker-deploy.sh` - Production Deployment

Comprehensive production deployment script with health checks and validation.

**Features:**

- ✅ Prerequisites checking (Docker, Docker Compose)
- ✅ Environment variable validation
- ✅ Service health monitoring
- ✅ Database migration automation
- ✅ Deployment verification
- ✅ Rollback on failure

**Usage:**

```bash
# Standard production deployment
./docker-scripts/docker-deploy.sh

# Skip building (use existing images)
./docker-scripts/docker-deploy.sh --skip-build

# Skip migrations
./docker-scripts/docker-deploy.sh --skip-migrations

# Show help
./docker-scripts/docker-deploy.sh --help
```

**Requirements:**

- `.env.production` file configured
- Docker Engine 24.0+
- Docker Compose V2

---

### 🛠️ `docker-dev.sh` - Development Environment

Quick setup for local development with hot-reload and debugging tools.

**Features:**

- ✅ Automatic environment setup
- ✅ Hot-reload configuration
- ✅ Database seeding option
- ✅ Management tools (Adminer, MailHog, Redis Commander)
- ✅ Advanced tools profile (PgAdmin)
- ✅ Log following

**Usage:**

```bash
# Start development environment
./docker-scripts/docker-dev.sh

# Start with database seeding
./docker-scripts/docker-dev.sh --seed

# Start and follow logs
./docker-scripts/docker-dev.sh --logs

# Start with advanced tools (PgAdmin)
./docker-scripts/docker-dev.sh --advanced

# Start with Nginx proxy
./docker-scripts/docker-dev.sh --proxy

# Stop services
./docker-scripts/docker-dev.sh stop

# Stop and remove volumes (clean slate)
./docker-scripts/docker-dev.sh stop --clean

# Restart services
./docker-scripts/docker-dev.sh restart

# Show help
./docker-scripts/docker-dev.sh --help
```

**Development URLs:**

- Next.js App: http://localhost:3000
- Prisma Studio: http://localhost:5555
- Adminer: http://localhost:8080
- MailHog: http://localhost:8025
- Redis Commander: http://localhost:8081
- PgAdmin: http://localhost:8082 (with `--advanced`)

---

## 🎯 Quick Start Examples

### Development Workflow

```bash
# 1. Start development environment with seeding
./docker-scripts/docker-dev.sh --seed --logs

# 2. In another terminal, run migrations
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# 3. Run tests
docker compose -f docker-compose.dev.yml exec app npm test

# 4. Install new package
docker compose -f docker-compose.dev.yml exec app npm install <package-name>

# 5. Stop when done
./docker-scripts/docker-dev.sh stop
```

### Production Deployment

```bash
# 1. Configure environment
cp .env.example .env.production
nano .env.production  # Edit with production values

# 2. Deploy
./docker-scripts/docker-deploy.sh

# 3. Verify deployment
curl http://localhost:3000/api/health

# 4. Monitor logs
docker compose logs -f app
```

### Clean Restart (Development)

```bash
# Stop and remove all data
./docker-scripts/docker-dev.sh stop --clean

# Start fresh
./docker-scripts/docker-dev.sh --seed
```

---

## 🔧 Troubleshooting

### Script Won't Execute

**Linux/Mac:**

```bash
# Make script executable
chmod +x docker-scripts/*.sh

# Run script
./docker-scripts/docker-dev.sh
```

**Windows (Git Bash):**

```bash
bash docker-scripts/docker-dev.sh
```

**Windows (PowerShell):**
Use Docker Compose commands directly:

```powershell
docker compose -f docker-compose.dev.yml up -d
```

### Permission Denied Errors

```bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod +x docker-scripts/*.sh
```

### Script Errors

```bash
# Enable debug mode
bash -x docker-scripts/docker-dev.sh

# Check prerequisites
docker --version
docker compose version
docker info
```

---

## 📊 Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app
```

### Database Operations

```bash
# Run migrations (development)
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Deploy migrations (production)
docker compose exec app npx prisma migrate deploy

# Seed database
docker compose exec app npx prisma db seed

# Open Prisma Studio
docker compose exec app npx prisma studio
```

### Service Management

```bash
# Restart specific service
docker compose restart app

# Stop all services
docker compose down

# Remove volumes (data loss!)
docker compose down -v

# Rebuild specific service
docker compose up -d --build app
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Service status
docker compose ps

# Inspect service
docker inspect farmers-market-app
```

---

## 🔒 Security Notes

### Environment Files

- ✅ **DO**: Keep `.env.production` secure and never commit to Git
- ✅ **DO**: Use strong, unique passwords for all services
- ✅ **DO**: Rotate secrets regularly
- ❌ **DON'T**: Use default passwords in production
- ❌ **DON'T**: Commit `.env` files to version control

### Secret Generation

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate passwords
openssl rand -base64 24

# Generate UUID
uuidgen
```

---

## 📚 Additional Resources

### Docker Compose Files

- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration
- `docker-compose.override.yml` - Local overrides (optional)

### Documentation

- [Complete Docker Deployment Guide](../DOCKER_DEPLOYMENT_GUIDE.md)
- [Environment Variables Reference](../DOCKER_DEPLOYMENT_GUIDE.md#environment-variables)
- [Troubleshooting Guide](../DOCKER_DEPLOYMENT_GUIDE.md#troubleshooting)

### Key Commands Reference

```bash
# Development
./docker-scripts/docker-dev.sh [start|stop|restart] [OPTIONS]

# Production
./docker-scripts/docker-deploy.sh [OPTIONS]

# Manual Docker Compose
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.yml up -d
```

---

## 🌾 Divine Agricultural Patterns

These scripts follow divine agricultural consciousness principles:

- **🌱 Biodynamic Setup**: Holistic environment initialization
- **⚡ Quantum Performance**: HP OMEN optimizations built-in
- **🔮 Agricultural Awareness**: Context-aware logging and monitoring
- **🎯 Divine Validation**: Comprehensive health checks and verification

---

## 💬 Support

For issues, questions, or contributions:

- Check logs: `docker compose logs -f`
- Review documentation: [DOCKER_DEPLOYMENT_GUIDE.md](../DOCKER_DEPLOYMENT_GUIDE.md)
- Open GitHub issue with script output

---

**Version**: 3.0  
**Status**: Production Ready with Divine Agricultural Consciousness  
**Last Updated**: 2024

🌾⚡ _"Script with agricultural consciousness, deploy with divine precision."_
