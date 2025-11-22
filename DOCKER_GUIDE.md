# Docker Development Guide

## Getting Started

## Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Git installed

## Quick Start

### Start the Application

```powershell
# Navigate to project directory
cd "M:\Repo\Farmers Market Platform web and app"

# Start all services (Database + App)
docker-compose -f docker-compose.dev.yml up --build
```

**What this does:**

1. Builds the Next.js application
2. Starts PostgreSQL database
3. Starts Redis cache
4. Runs database migrations
5. Seeds the database with admin user
6. Starts dev server on http://localhost:3000

### Access the Application

- **App**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin-login
  - Email: `admin@farmersmarket.app`
  - Password: `DivineAdmin123!`
- **pgAdmin** (Database UI): http://localhost:5050
  - Email: `dev@farmersmarket.local`
  - Password: `dev123`

---

## 🛠️ Common Commands

### Start Services (Detached Mode)

```powershell
docker-compose -f docker-compose.dev.yml up -d
```

### View Logs

```powershell
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f app-dev
```

### Stop Services

```powershell
docker-compose -f docker-compose.dev.yml down
```

### Stop and Remove Volumes (Fresh Start)

```powershell
docker-compose -f docker-compose.dev.yml down -v
```

### Rebuild Containers

```powershell
docker-compose -f docker-compose.dev.yml up --build --force-recreate
```

### Access Database CLI

```powershell
docker exec -it farmers-market-db-dev psql -U postgres -d farmers_market
```

---

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 is in use:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
Stop-Process -Id <PID> -Force
```

### Database Connection Issues

```powershell
# Check if database is healthy
docker ps

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Clear All Data and Start Fresh

```powershell
# Stop all services
docker-compose -f docker-compose.dev.yml down -v

# Remove all containers
docker container prune -f

# Remove all images
docker image prune -a -f

# Start fresh
docker-compose -f docker-compose.dev.yml up --build
```

---

## 📊 Service Ports

| Service     | Port | URL                   |
| ----------- | ---- | --------------------- |
| Next.js App | 3000 | http://localhost:3000 |
| PostgreSQL  | 5432 | localhost:5432        |
| Redis       | 6379 | localhost:6379        |
| pgAdmin     | 5050 | http://localhost:5050 |

---

## 🗄️ Database Info

**Connection String:**

```
postgresql://postgres:postgres@localhost:5432/farmers_market
```

**pgAdmin Connection:**

1. Open http://localhost:5050
2. Login with credentials above
3. Add New Server:
   - **Name**: Farmers Market Dev
   - **Host**: postgres
   - **Port**: 5432
   - **Username**: postgres
   - **Password**: postgres
   - **Database**: farmers_market

---

## 🔄 Hot Reload

The development setup supports hot reload:

- Changes to code are automatically detected
- Browser auto-refreshes on save
- No need to restart containers

---

## 🎯 Quick Commands

```powershell
# One-line start
docker-compose -f docker-compose.dev.yml up --build -d && docker-compose -f docker-compose.dev.yml logs -f app-dev

# One-line stop
docker-compose -f docker-compose.dev.yml down

# Fresh restart
docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up --build
```

---

## 📝 Environment Variables

The Docker setup uses these environment variables (already configured):

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/farmers_market
SHADOW_DATABASE_URL=postgresql://postgres:postgres@postgres:5432/farmers_market_shadow
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-not-for-production
NODE_ENV=development
PORT=3000
```

---

## ✅ Verify Setup

After starting, verify everything is running:

```powershell
# Check running containers
docker ps

# Should see 4 containers:
# - farmers-market-app-dev
# - farmers-market-db-dev
# - farmers-market-redis-dev
# - farmers-market-pgadmin-dev
```

---

## 🚀 Production Deployment

For production, use the main docker-compose.yml:

```powershell
docker-compose up --build -d
```

This uses optimized production builds and security settings.

---

**Status**: Ready for Docker development! 🐳✨
