# 🐳 Docker Deployment - Quick Reference

## Prerequisites

```powershell
# Check Docker is installed
docker --version
docker-compose --version

# Start Docker Desktop (if not running)
```

## One-Command Deploy

```powershell
# Full deployment with database seeding
.\deploy-docker.ps1 -Action start
.\deploy-docker.ps1 -Action seed
```

## Quick Commands

| Command                               | Description      |
| ------------------------------------- | ---------------- |
| `.\deploy-docker.ps1 -Action build`   | Build images     |
| `.\deploy-docker.ps1 -Action start`   | Start containers |
| `.\deploy-docker.ps1 -Action stop`    | Stop containers  |
| `.\deploy-docker.ps1 -Action restart` | Restart all      |
| `.\deploy-docker.ps1 -Action logs`    | View logs        |
| `.\deploy-docker.ps1 -Action status`  | Check status     |
| `.\deploy-docker.ps1 -Action seed`    | Seed database    |
| `.\deploy-docker.ps1 -Action clean`   | Remove all       |

## Docker Compose Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f app

# Status
docker-compose ps

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## Access URLs

| Service          | URL                                |
| ---------------- | ---------------------------------- |
| **Application**  | <http://localhost:3000>            |
| **Adminer**      | <http://localhost:8080>            |
| **Health Check** | <http://localhost:3000/api/health> |

## Database Commands

```powershell
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npx prisma db seed

# Open Prisma Studio
docker-compose exec app npx prisma studio

# Access PostgreSQL
docker-compose exec postgres psql -U farmersmarket
```

## Test Credentials

| Role     | Email                     | Password             |
| -------- | ------------------------- | -------------------- |
| Admin    | `admin@farmersmarket.app` | `DivineAdmin123!`    |
| Farmer   | `ana.romana@email.com`    | `FarmLife2024!`      |
| Consumer | `divna.kapica@email.com`  | `HealthyEating2024!` |

## Troubleshooting

```powershell
# Check logs
docker-compose logs app

# Restart specific service
docker-compose restart app

# Check health
curl http://localhost:3000/api/health

# Clean and rebuild
.\deploy-docker.ps1 -Action clean
.\deploy-docker.ps1 -Action build
.\deploy-docker.ps1 -Action start
```

## Environment Setup

```powershell
# Create environment file
Copy-Item .env.example .env.docker

# Edit configuration
notepad .env.docker

# Required: NEXTAUTH_SECRET
openssl rand -base64 32
```

## Common Issues

### Port Already in Use

```powershell
# Edit .env.docker
APP_PORT=3001
POSTGRES_PORT=5433

# Restart
docker-compose down
docker-compose up -d
```

### Database Connection Failed

```powershell
# Check database is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U farmersmarket -d farmersmarket -c "SELECT 1;"
```

### Container Won't Start

```powershell
# View logs
docker-compose logs app

# Rebuild
docker-compose build --no-cache app
docker-compose up -d
```

## Backup & Restore

```powershell
# Backup database
docker-compose exec postgres pg_dump -U farmersmarket farmersmarket > backup.sql

# Restore database
docker-compose exec -T postgres psql -U farmersmarket farmersmarket < backup.sql
```

## Monitoring

```powershell
# Resource usage
docker stats

# Disk usage
docker system df

# Container info
docker inspect farmers-market-app
```

---

**Full Documentation**: `docs/deployment/DOCKER_DEPLOYMENT.md`
