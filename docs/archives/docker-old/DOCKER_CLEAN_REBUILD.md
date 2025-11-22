# 🐳 Docker Clean Rebuild Guide

## What This Does

This script performs a complete clean rebuild of all Docker containers and images:

1. **Stops all containers** - Gracefully shuts down running services
2. **Removes volumes** - Clears all persistent data (database, cache)
3. **Removes images** - Deletes old Docker images
4. **Clears build cache** - Removes 22GB+ of cached layers
5. **Rebuilds from scratch** - Fresh installation with latest code

---

## 🔄 Quick Clean Rebuild

```powershell
# Navigate to project
cd "M:\Repo\Farmers Market Platform web and app"

# Stop and remove everything
docker-compose -f docker-compose.dev.yml down -v --remove-orphans

# Remove old images (replace IMAGE_ID with actual ID from docker images)
docker images | Select-String "farmers"
docker rmi <IMAGE_ID> -f

# Clear build cache
docker builder prune -af

# Rebuild with no cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Start fresh containers
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
docker exec -it farmers-market-app-dev npm run db:migrate

# Seed database
docker exec -it farmers-market-app-dev npm run db:seed
```

---

## 📋 Step-by-Step Detailed Guide

### Step 1: Stop All Services

```powershell
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
```

**What it does:**

- Stops running containers
- Removes volumes (`-v` flag) - **⚠️ This deletes your database!**
- Removes orphaned containers
- Cleans up networks

### Step 2: Remove Old Images

```powershell
# List all images
docker images

# Remove specific image
docker rmi <IMAGE_ID> -f

# Or remove all farmers market images
docker images | Select-String "farmers" | ForEach-Object {
    $imageId = ($_.ToString() -split '\s+')[2]
    docker rmi $imageId -f
}
```

### Step 3: Clear Build Cache (22GB+)

```powershell
docker builder prune -af
```

**Flags:**

- `-a`: Remove all unused build cache (not just dangling)
- `-f`: Force without confirmation

**Expected output:** `Total: 22.24GB` (or similar)

### Step 4: Rebuild Everything Fresh

```powershell
docker-compose -f docker-compose.dev.yml build --no-cache
```

**What happens:**

- Downloads base Node.js image
- Installs all npm dependencies fresh
- Generates Prisma Client
- Creates optimized layers
- Takes 3-5 minutes

**Progress indicators:**

```
[+] Building 87.7s
 => [2/7] WORKDIR /app
 => [3/7] RUN apk add --no-cache libc6-compat openssl
 => [4/7] COPY package*.json ./
 => [5/7] RUN npm install
 => [6/7] COPY . .
 => [7/7] RUN npx prisma generate
```

### Step 5: Start Fresh Containers

```powershell
docker-compose -f docker-compose.dev.yml up -d
```

**Services started:**

- `postgres` - PostgreSQL database (port 5432)
- `redis` - Redis cache (port 6379)
- `app-dev` - Next.js app (port 3000)
- `pgadmin` - Database UI (port 5050)

### Step 6: Initialize Database

```powershell
# Wait 10 seconds for PostgreSQL to be ready
Start-Sleep -Seconds 10

# Run migrations
docker exec -it farmers-market-app-dev npm run db:migrate

# Seed database with admin user and sample data
docker exec -it farmers-market-app-dev npm run db:seed
```

---

## ✅ Verification

### Check Container Status

```powershell
docker ps
```

**Expected output:**

```
CONTAINER ID   IMAGE                  STATUS
abc123         farmers-app            Up 2 minutes (healthy)
def456         postgres:15-alpine     Up 2 minutes (healthy)
ghi789         redis:7-alpine         Up 2 minutes (healthy)
jkl012         pgadmin                Up 2 minutes
```

### Check Application Health

```powershell
# Test homepage
curl http://localhost:3000 -UseBasicParsing

# Test language routes
curl http://localhost:3000/en -UseBasicParsing
curl http://localhost:3000/es -UseBasicParsing
curl http://localhost:3000/fr -UseBasicParsing
```

### Check Database Connection

```powershell
# Access PostgreSQL CLI
docker exec -it farmers-market-db-dev psql -U postgres -d farmers_market

# Inside PostgreSQL:
\dt         # List tables
\q          # Exit
```

### View Logs

```powershell
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f app-dev
```

---

## 🔧 Troubleshooting

### Build Fails

**Issue:** "npm install" fails

**Solution:**

```powershell
# Remove node_modules from host
Remove-Item -Path "node_modules" -Recurse -Force

# Rebuild
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Port Already in Use

**Issue:** "Port 3000 is already allocated"

**Solution:**

```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process (replace PID)
Stop-Process -Id <PID> -Force

# Restart containers
docker-compose -f docker-compose.dev.yml restart
```

### Database Connection Fails

**Issue:** "Can't reach database server"

**Solution:**

```powershell
# Check PostgreSQL is running
docker ps | Select-String "postgres"

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Language Routes 404

**Issue:** Language routes return 404

**Solution:**

```powershell
# Rebuild Next.js
docker exec -it farmers-market-app-dev npm run build

# Or restart container
docker-compose -f docker-compose.dev.yml restart app-dev
```

---

## 🎯 Common Commands

### Start/Stop

```powershell
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Restart specific service
docker-compose -f docker-compose.dev.yml restart app-dev
```

### Logs

```powershell
# Follow all logs
docker-compose -f docker-compose.dev.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100

# Specific service
docker-compose -f docker-compose.dev.yml logs -f app-dev
```

### Execute Commands in Container

```powershell
# Access bash shell
docker exec -it farmers-market-app-dev sh

# Run npm commands
docker exec -it farmers-market-app-dev npm run test
docker exec -it farmers-market-app-dev npm run lint
docker exec -it farmers-market-app-dev npm run type-check
```

### Database Management

```powershell
# PostgreSQL CLI
docker exec -it farmers-market-db-dev psql -U postgres -d farmers_market

# Backup database
docker exec farmers-market-db-dev pg_dump -U postgres farmers_market > backup.sql

# Restore database
docker exec -i farmers-market-db-dev psql -U postgres farmers_market < backup.sql
```

---

## 🚀 Performance Tips

### Speed Up Rebuilds

**Use BuildKit** (enabled by default in newer Docker versions):

```powershell
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.dev.yml build
```

### Optimize Node Modules

Add `.dockerignore` to exclude unnecessary files:

```
node_modules
.next
dist
coverage
*.log
.git
```

### Use Volume Mounts Wisely

The current setup mounts source code for hot reload but excludes `node_modules`:

```yaml
volumes:
  - .:/app
  - /app/node_modules # Don't override container's node_modules
  - /app/.next # Don't override build cache
```

---

## 📊 Disk Space Management

### Check Docker Disk Usage

```powershell
docker system df
```

**Sample output:**

```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          15        3         2.5GB     1.8GB (72%)
Containers      5         2         150MB     100MB (66%)
Local Volumes   3         2         500MB     200MB (40%)
Build Cache     90        0         22GB      22GB (100%)
```

### Clean Everything

```powershell
# Remove all stopped containers
docker container prune -f

# Remove all unused images
docker image prune -a -f

# Remove all unused volumes
docker volume prune -f

# Remove all unused networks
docker network prune -f

# Nuclear option: Remove EVERYTHING
docker system prune -af --volumes
```

---

## 🎓 Understanding the Setup

### Docker Compose Services

```yaml
postgres:
  - Image: postgres:15-alpine
  - Port: 5432
  - User: postgres
  - Database: farmers_market
  - Volume: postgres_dev_data (persistent)

redis:
  - Image: redis:7-alpine
  - Port: 6379
  - No persistence (development mode)

app-dev:
  - Build: Dockerfile.dev
  - Port: 3000
  - Hot reload: Enabled via volume mounts
  - Environment: Development

pgadmin:
  - Image: pgadmin4:latest
  - Port: 5050
  - Web UI for database management
```

### Build Process

1. **Base Image**: `node:20-alpine` (smallest Node.js image)
2. **Dependencies**: Install system libs (`libc6-compat`, `openssl`)
3. **NPM Install**: Install all packages from `package.json`
4. **Copy Code**: Copy entire project to `/app`
5. **Prisma Generate**: Create Prisma Client
6. **Environment**: Set `PORT=3000`, enable hot reload

---

## 📝 Best Practices

### Development Workflow

1. ✅ Use Docker for consistent environment
2. ✅ Mount source code for hot reload
3. ✅ Keep database in Docker (isolated)
4. ✅ Use pgAdmin for database inspection
5. ✅ Run tests inside container

### Production Deployment

Use `docker-compose.yml` (not `docker-compose.dev.yml`):

```powershell
docker-compose up --build -d
```

**Differences:**

- Optimized production build
- No volume mounts
- Smaller image size
- Health checks enabled
- Security hardened

---

## 🔗 Quick Links

- **App**: http://localhost:3000
- **Admin**: http://localhost:3000/admin-login
- **pgAdmin**: http://localhost:5050
- **Diagnostic**: http://localhost:3000/diagnostic

---

**Status**: Clean rebuild in progress... 🐳✨

**Estimated time**: 3-5 minutes for complete rebuild
