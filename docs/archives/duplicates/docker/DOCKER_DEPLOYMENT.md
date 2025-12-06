# 🐳 Docker Deployment Guide

## Quick Start

### 1. Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Docker Compose** v2.0 or higher
- **4GB RAM** minimum (8GB recommended)
- **10GB disk space**

### 2. Setup Environment

```powershell
# Copy and configure environment file
Copy-Item .env.example .env.docker

# Edit .env.docker with your configuration
notepad .env.docker
```

**Required Settings**:

- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `POSTGRES_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Redis password (if using authentication)

### 3. Deploy

```powershell
# Using PowerShell script (recommended)
.\deploy-docker.ps1 -Action start

# Or using docker-compose directly
docker-compose up -d
```

### 4. Initialize Database

```powershell
# Run migrations and seed data
.\deploy-docker.ps1 -Action seed
```

### 5. Access Application

- **Application**: http://localhost:3000
- **Database Admin (Adminer)**: http://localhost:8080
- **Health Check**: http://localhost:3000/api/health

---

## Deployment Commands

### Using PowerShell Script (Recommended)

```powershell
# Build images
.\deploy-docker.ps1 -Action build

# Start containers
.\deploy-docker.ps1 -Action start

# Stop containers
.\deploy-docker.ps1 -Action stop

# Restart containers
.\deploy-docker.ps1 -Action restart

# View logs
.\deploy-docker.ps1 -Action logs

# Check status
.\deploy-docker.ps1 -Action status

# Seed database
.\deploy-docker.ps1 -Action seed

# Clean everything
.\deploy-docker.ps1 -Action clean
```

### Using Docker Compose Directly

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart specific service
docker-compose restart app

# Execute commands in container
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

---

## Architecture

### Services

The platform runs four Docker containers:

#### 1. **PostgreSQL Database** (`postgres`)

- Image: `postgis/postgis:16-3.4-alpine`
- Port: `5432`
- Volume: `farmers-market-postgres-data`
- Health Check: `pg_isready`

#### 2. **Redis Cache** (`redis`)

- Image: `redis:7-alpine`
- Port: `6379`
- Volume: `farmers-market-redis-data`
- Health Check: `redis-cli ping`

#### 3. **Next.js Application** (`app`)

- Built from local Dockerfile
- Port: `3000`
- Volume: `farmers-market-uploads` (for file uploads)
- Health Check: HTTP `/api/health` endpoint

#### 4. **Adminer** (`adminer`)

- Image: `adminer:latest`
- Port: `8080`
- Database management UI

### Network

All services run on a dedicated Docker network: `farmers-market-network`

### Volumes

```
farmers-market-postgres-data  # Database persistence
farmers-market-redis-data     # Cache persistence
farmers-market-uploads        # User uploaded files
```

---

## Configuration

### Environment Variables

Edit `.env.docker` to configure:

#### Database

```bash
POSTGRES_USER=farmersmarket
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=farmersmarket
```

#### Application

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_char_secret
```

#### Ports

```bash
APP_PORT=3000        # Application port
POSTGRES_PORT=5432   # Database port
REDIS_PORT=6379      # Redis port
ADMINER_PORT=8080    # Adminer port
```

#### Optional Services

```bash
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=your_password

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# AI Services
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
```

---

## Database Management

### Migrations

```powershell
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# View migration status
docker-compose exec app npx prisma migrate status
```

### Seed Data

```powershell
# Seed database
docker-compose exec app npx prisma db seed
```

### Database Studio

```powershell
# Open Prisma Studio
docker-compose exec app npx prisma studio

# Or use Adminer at http://localhost:8080
# Server: postgres
# Username: farmersmarket
# Password: [from .env.docker]
# Database: farmersmarket
```

### Backup and Restore

```powershell
# Backup database
docker-compose exec postgres pg_dump -U farmersmarket farmersmarket > backup.sql

# Restore database
docker-compose exec -T postgres psql -U farmersmarket farmersmarket < backup.sql
```

---

## Monitoring

### Health Checks

```powershell
# Check application health
curl http://localhost:3000/api/health

# Check all services
.\deploy-docker.ps1 -Action status
```

### Logs

```powershell
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 app
```

### Resource Usage

```powershell
# Container resource usage
docker stats

# Disk usage
docker system df

# Detailed info
docker-compose ps
docker inspect farmers-market-app
```

---

## Troubleshooting

### Container Won't Start

```powershell
# Check logs
docker-compose logs app

# Rebuild container
docker-compose build --no-cache app
docker-compose up -d

# Check health status
docker inspect farmers-market-app --format='{{.State.Health.Status}}'
```

### Database Connection Issues

```powershell
# Test database connection
docker-compose exec postgres psql -U farmersmarket -d farmersmarket -c "SELECT version();"

# Check database logs
docker-compose logs postgres

# Verify environment variables
docker-compose exec app env | grep DATABASE_URL
```

### Port Conflicts

```powershell
# Change ports in .env.docker
APP_PORT=3001
POSTGRES_PORT=5433
REDIS_PORT=6380
ADMINER_PORT=8081

# Restart containers
docker-compose down
docker-compose up -d
```

### Out of Memory

```powershell
# Increase Docker memory in Docker Desktop settings
# Recommended: 4GB minimum, 8GB for development

# Or edit docker-compose.yml to add memory limits:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Clear Everything and Start Fresh

```powershell
# Stop and remove everything
.\deploy-docker.ps1 -Action clean

# Or manually
docker-compose down -v
docker system prune -af --volumes

# Rebuild
.\deploy-docker.ps1 -Action build
.\deploy-docker.ps1 -Action start
.\deploy-docker.ps1 -Action seed
```

---

## Production Deployment

### Security Checklist

- [ ] Change default passwords in `.env.docker`
- [ ] Generate strong `NEXTAUTH_SECRET` (minimum 32 characters)
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Enable Redis password authentication
- [ ] Configure SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Enable Docker security scanning
- [ ] Use Docker secrets for sensitive data
- [ ] Regular security updates

### Performance Optimization

```yaml
# docker-compose.yml optimizations
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4G
        reservations:
          cpus: "1"
          memory: 2G

  postgres:
    command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Using Docker Secrets

```yaml
# docker-compose.yml
services:
  app:
    secrets:
      - nextauth_secret
      - postgres_password

secrets:
  nextauth_secret:
    file: ./secrets/nextauth_secret.txt
  postgres_password:
    file: ./secrets/postgres_password.txt
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name farmersmarket.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker-compose build

      - name: Push to registry
        run: |
          docker tag farmers-market-app:latest registry.example.com/farmers-market:latest
          docker push registry.example.com/farmers-market:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app/farmers-market
            docker-compose pull
            docker-compose up -d
            docker-compose exec app npx prisma migrate deploy
```

---

## Maintenance

### Regular Tasks

```powershell
# Weekly: Update images
docker-compose pull
docker-compose up -d

# Weekly: Backup database
docker-compose exec postgres pg_dump -U farmersmarket farmersmarket > backup_$(Get-Date -Format 'yyyyMMdd').sql

# Monthly: Clean unused resources
docker system prune -a

# Monthly: Check logs size
docker-compose logs --tail=0 | Measure-Object -Line
```

### Updates

```powershell
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

---

## Support

### Test Credentials

After seeding the database:

| Role         | Email                   | Password           |
| ------------ | ----------------------- | ------------------ |
| **Admin**    | admin@farmersmarket.app | DivineAdmin123!    |
| **Farmer**   | ana.romana@email.com    | FarmLife2024!      |
| **Consumer** | divna.kapica@email.com  | HealthyEating2024! |

### Useful Commands

```powershell
# Shell into container
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm run build
docker-compose exec app npm test

# Access PostgreSQL CLI
docker-compose exec postgres psql -U farmersmarket

# Access Redis CLI
docker-compose exec redis redis-cli
```

---

## Next Steps

1. ✅ Start containers: `.\deploy-docker.ps1 -Action start`
2. ✅ Seed database: `.\deploy-docker.ps1 -Action seed`
3. ✅ Access app: http://localhost:3000
4. ✅ Login with test credentials
5. ✅ Configure production settings
6. ✅ Set up monitoring
7. ✅ Configure backups
8. ✅ Enable SSL/TLS

---

**Last Updated**: November 12, 2025  
**Docker Version**: 24.0+  
**Docker Compose Version**: 2.0+
