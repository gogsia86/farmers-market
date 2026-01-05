# 🐳 DOCKER QUICK START GUIDE

**Farmers Market Platform - Get Running in 5 Minutes**

---

## 🚀 Super Quick Start (Development)

```bash
# 1. Copy environment file
cp .env.example .env.local

# 2. Start everything
npm run docker:up-build-dev

# 3. Wait ~30 seconds, then open
open http://localhost:3000
```

**That's it! You're running! 🎉**

---

## 📋 Common Commands

### Start & Stop

```bash
# Development
npm run docker:up-dev              # Start dev environment
npm run docker:down-dev            # Stop dev environment
npm run docker:logs-dev            # View dev logs

# Production
npm run docker:up                  # Start production
npm run docker:down                # Stop production
npm run docker:logs                # View logs
```

### Database

```bash
# Run migrations
npm run docker:migrate

# Seed database
npm run docker:seed

# Open Prisma Studio
npm run docker:prisma-studio
# Then open http://localhost:5555

# Database shell
npm run docker:db-shell
```

### Monitoring

```bash
# View running containers
npm run docker:ps

# View logs
npm run docker:logs-app        # App logs only
npm run docker:logs-db         # Database logs only
npm run docker:logs            # All logs

# Check health
npm run docker:health          # App health
npm run docker:health-db       # Database health
npm run docker:health-redis    # Redis health

# Resource usage
npm run docker:stats
```

### Testing

```bash
# Run tests in Docker
npm run docker:test

# Run E2E tests
npm run docker:test-e2e

# Lint code
npm run docker:lint
```

### Maintenance

```bash
# Restart services
npm run docker:restart

# Restart just app
npm run docker:restart-app

# Rebuild and restart
npm run docker:up-build-dev

# Clean up
npm run docker:clean            # Remove containers & volumes
npm run docker:clean-all        # Remove EVERYTHING (nuclear option)
```

---

## 🌐 Access URLs

### Development

- **Application**: http://localhost:3000
- **pgAdmin**: http://localhost:5051
  - Email: `dev@farmersmarket.local`
  - Password: `dev_admin123`
- **Mailhog** (Email Testing): http://localhost:8025
- **Redis Commander**: http://localhost:8082
- **Prisma Studio**: http://localhost:5555 (after running `npm run docker:prisma-studio`)

### Production

- **Application**: https://localhost:443
- **pgAdmin**: http://localhost:5050

---

## 🔧 Troubleshooting

### Container won't start?

```bash
# Check what's wrong
npm run docker:logs

# Try rebuilding
npm run docker:down
npm run docker:up-build-dev
```

### Database connection error?

```bash
# Check if database is ready
npm run docker:health-db

# View database logs
npm run docker:logs-db

# Restart database
docker-compose restart postgres
```

### Port already in use?

```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti :3000 | xargs kill -9

# Or change port in .env.local
PORT=3001
```

### Out of disk space?

```bash
# Check usage
docker system df

# Clean up
npm run docker:clean
```

### Everything broken?

```bash
# Nuclear option - reset everything
npm run docker:clean-all

# Then start fresh
npm run docker:up-build-dev
```

---

## 📝 Environment Setup

### Development (.env.local)

Minimum required variables:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev_secret_key_min_32_chars_required_change_in_prod
DATABASE_URL=postgresql://dev_user:dev_password@postgres:5432/farmers_market_dev
```

### Production (.env.production)

**CRITICAL**: Change all passwords and secrets!

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://farmersmarket.com
NEXTAUTH_URL=https://farmersmarket.com
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
DATABASE_URL=postgresql://farmers_user:STRONG_PASSWORD@postgres:5432/farmers_market
```

Generate secure secret:

```bash
openssl rand -base64 32
```

---

## 🎯 Common Tasks

### Initialize Fresh Database

```bash
npm run docker:up-dev
npm run docker:migrate
npm run docker:seed
```

### Access Database Directly

```bash
# Method 1: Shell
npm run docker:db-shell

# Method 2: pgAdmin
open http://localhost:5051
```

### View Application Logs

```bash
# All logs
npm run docker:logs

# Just errors
npm run docker:logs | grep -i error

# Last 50 lines
docker-compose logs --tail=50
```

### Backup Database

```bash
npm run docker:backup-db
# Creates: backup_YYYYMMDD_HHMMSS.sql
```

### Execute Commands in Container

```bash
# Open shell
npm run docker:exec

# Run single command
docker-compose exec app npm run build
```

---

## 📊 File Structure

```
docker/
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── nginx/
│   ├── nginx.conf         # Nginx configuration
│   └── ssl/               # SSL certificates
├── postgres/
│   └── init.sql           # Database initialization
└── scripts/
    ├── docker-entrypoint.sh   # Container startup
    ├── healthcheck.sh         # Health checks
    └── wait-for-db.sh         # Database wait logic

docker-compose.yml         # Production compose
docker-compose.dev.yml     # Development compose
.dockerignore             # Build exclusions
```

---

## 🎓 Learning More

- **Full Guide**: See `DOCKER_DEPLOYMENT_COMPLETE.md`
- **Production Deploy**: See "Production Deployment" section in full guide
- **Nginx Config**: Check `docker/nginx/nginx.conf`
- **Environment Vars**: See `.env.example`

---

## ⚡ Power User Commands

```bash
# View real-time resource usage
docker stats

# Execute command in container
docker-compose exec app npm run [command]

# View all containers (including stopped)
docker ps -a

# Remove specific volume
docker volume rm farmers-market_postgres_data

# Export container logs
docker-compose logs > all_logs.txt

# Check container health
docker inspect --format='{{.State.Health.Status}}' farmers-market-app
```

---

## 🆘 Emergency Commands

```bash
# Stop everything immediately
docker-compose down

# Kill all containers
docker kill $(docker ps -q)

# Remove all containers
docker rm -f $(docker ps -aq)

# Remove all volumes (CAUTION: Deletes all data!)
docker volume rm $(docker volume ls -q)

# Complete system reset
docker system prune -a --volumes -f
```

---

## ✅ Verification Checklist

After starting Docker services:

- [ ] Containers running: `npm run docker:ps`
- [ ] App accessible: http://localhost:3000
- [ ] Health check passing: `npm run docker:health`
- [ ] Database connected: `npm run docker:health-db`
- [ ] No errors in logs: `npm run docker:logs`

---

## 🎉 Success!

If you can access http://localhost:3000 and see the application, you're all set!

### Next Steps:

1. Register a test user
2. Create a test farm
3. Add some products
4. Test the checkout flow

### Need Help?

- Check logs: `npm run docker:logs`
- View diagnostics: `npm run diagnose:api`
- Read full guide: `DOCKER_DEPLOYMENT_COMPLETE.md`

---

**Pro Tip**: Bookmark these commands:

```bash
# Daily workflow
npm run docker:up-dev          # Start day
npm run docker:logs -f         # Watch logs
npm run docker:down-dev        # End day

# When things break
npm run docker:logs            # See what's wrong
npm run docker:restart         # Try restart
npm run docker:clean           # Last resort
```

---

**Status**: ✅ Ready to Rock! 🚀

_Built with divine agricultural consciousness_ 🌾✨
