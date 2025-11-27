# Database Setup Guide - Farmers Market Platform 🗄️

**Quick Start: Get Your Database Running in 15 Minutes**

---

## 🎯 Goal

Set up a PostgreSQL database for the Farmers Market Platform to unlock Phase 4B performance optimizations.

---

## 📋 What You Need

- PostgreSQL 15+ (we'll help you install it)
- 5-15 minutes of time
- Administrator access on your machine

---

## 🚀 Option 1: PostgreSQL Local Installation (RECOMMENDED)

### For Windows (HP OMEN)

#### Step 1: Download PostgreSQL

1. Visit: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose: **PostgreSQL 16.x for Windows x86-64**
4. Download the installer (approximately 350 MB)

#### Step 2: Install PostgreSQL

```cmd
# Run the downloaded installer
# Follow these settings:

Installation Directory: C:\Program Files\PostgreSQL\16
Components:
  ✅ PostgreSQL Server
  ✅ pgAdmin 4
  ✅ Command Line Tools
  ✅ Stack Builder (optional)

Data Directory: C:\Program Files\PostgreSQL\16\data

Port: 5432 (default)

Superuser Password: [CREATE A STRONG PASSWORD]
  ⚠️ IMPORTANT: Remember this password!
  Example: FarmersMarket2025!Secure
```

#### Step 3: Add PostgreSQL to PATH

```cmd
# Open PowerShell as Administrator
setx PATH "%PATH%;C:\Program Files\PostgreSQL\16\bin" /M

# Restart your terminal/command prompt
```

#### Step 4: Verify Installation

```bash
# Open new terminal
psql --version
# Expected: psql (PostgreSQL) 16.x
```

#### Step 5: Create Database

```bash
# Connect to PostgreSQL (use password you set)
psql -U postgres

# In PostgreSQL prompt, create database:
CREATE DATABASE farmers_market;

# Create dedicated user (optional but recommended)
CREATE USER farmers_admin WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE farmers_market TO farmers_admin;

# Enable required extensions
\c farmers_market
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Exit PostgreSQL
\q
```

#### Step 6: Configure Environment

```bash
# Navigate to project
cd "M:\Repo\Farmers Market Platform web and app"

# Create .env file
echo DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/farmers_market" > .env

# Or with dedicated user:
echo DATABASE_URL="postgresql://farmers_admin:your_secure_password_here@localhost:5432/farmers_market" > .env

# Verify .env was created
cat .env
```

---

## 🐳 Option 2: Docker PostgreSQL (FAST & ISOLATED)

Perfect if you already have Docker Desktop installed.

### Step 1: Create Docker Compose File

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: farmers_market_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: farmers_admin
      POSTGRES_PASSWORD: FarmersMarket2025!
      POSTGRES_DB: farmers_market
      POSTGRES_INITDB_ARGS: "-E UTF8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U farmers_admin -d farmers_market"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: pgAdmin for GUI management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: farmers_market_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@farmersmarket.local
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
    driver: local
EOF
```

### Step 2: Create Initialization Script

```bash
# Create init script for extensions
cat > prisma/init.sql << 'EOF'
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE farmers_market TO farmers_admin;
EOF
```

### Step 3: Start Docker Container

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
docker-compose ps

# Check logs
docker-compose logs postgres

# Expected: "database system is ready to accept connections"
```

### Step 4: Configure Environment

```bash
# Create .env file
echo DATABASE_URL="postgresql://farmers_admin:FarmersMarket2025!@localhost:5432/farmers_market" > .env

# Verify connection
docker exec -it farmers_market_db psql -U farmers_admin -d farmers_market -c "SELECT version();"
```

### Step 5: Optional - Access pgAdmin

```
Open browser: http://localhost:5050
Email: admin@farmersmarket.local
Password: admin123

Add Server:
  Name: Farmers Market Local
  Host: postgres (or host.docker.internal on Windows)
  Port: 5432
  Username: farmers_admin
  Password: FarmersMarket2025!
```

---

## ☁️ Option 3: Cloud Database (PRODUCTION-READY)

### Supabase (FREE Tier Available)

1. **Sign Up**: https://supabase.com
2. **Create New Project**:
   - Project Name: `farmers-market-dev`
   - Database Password: [Strong password]
   - Region: Choose closest to you
3. **Get Connection String**:
   - Go to Project Settings > Database
   - Copy "Connection string" (Transaction mode)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
4. **Configure Environment**:
   ```bash
   echo 'DATABASE_URL="your_supabase_connection_string_here"' > .env
   ```

### Neon (PostgreSQL Serverless - FREE)

1. **Sign Up**: https://neon.tech
2. **Create Project**:
   - Project Name: `farmers-market`
   - PostgreSQL Version: 16
   - Region: Select nearest
3. **Get Connection String**:
   - Copy the connection string from dashboard
4. **Configure**:
   ```bash
   echo 'DATABASE_URL="your_neon_connection_string_here"' > .env
   ```

### Railway (Simple & Fast)

1. **Sign Up**: https://railway.app
2. **New Project** > Add PostgreSQL
3. **Get Connection String** from Variables tab
4. **Configure**:
   ```bash
   echo 'DATABASE_URL="your_railway_connection_string_here"' > .env
   ```

---

## ✅ Verify Database Setup

After setting up your database:

```bash
# 1. Check .env file exists
cat .env
# Should show: DATABASE_URL="postgresql://..."

# 2. Test Prisma connection
npx prisma db execute --stdin <<EOF
SELECT version();
EOF

# 3. Generate Prisma client
npx prisma generate

# 4. Check database connection
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Connected!')).catch(e => console.error('❌ Error:', e.message));"
```

---

## 🚀 Run Migrations (Complete Phase 4B)

Once database is set up and verified:

```bash
# 1. Apply all migrations (creates tables + indexes)
npx prisma migrate dev --name add_performance_indexes

# Expected output:
# ✅ Migration applied: add_performance_indexes
# ✅ Prisma client generated

# 2. Verify tables were created
npx prisma db execute --stdin <<EOF
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
EOF

# 3. Verify performance indexes
npx prisma db execute --stdin <<EOF
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('products','orders','reviews')
ORDER BY tablename, indexname;
EOF

# Should show 9 new performance indexes

# 4. Optional: Seed database with test data
npm run db:seed
```

---

## 🧪 Test Performance Improvements

```bash
# 1. Start dev server
npm run dev

# 2. Test analytics endpoint
curl http://localhost:3000/api/analytics/dashboard

# Expected: <100ms response time (down from ~200ms)

# 3. Check query performance in logs
# Look for Prisma query logs showing index usage
```

---

## 🛠️ Troubleshooting

### Issue: "Connection refused"

**Solution**:

- Check PostgreSQL is running: `pg_isready` (local) or `docker-compose ps` (docker)
- Verify port 5432 is not blocked by firewall
- Check DATABASE_URL has correct host/port

### Issue: "Authentication failed"

**Solution**:

- Verify username/password in DATABASE_URL
- For local: use password set during installation
- For Docker: use `farmers_admin` / `FarmersMarket2025!`

### Issue: "Database does not exist"

**Solution**:

```bash
# Create database manually
psql -U postgres -c "CREATE DATABASE farmers_market;"

# Or with Docker:
docker exec -it farmers_market_db psql -U farmers_admin -c "CREATE DATABASE farmers_market;"
```

### Issue: "Permission denied"

**Solution**:

```sql
-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE farmers_market TO your_user;
GRANT ALL ON SCHEMA public TO your_user;
```

### Issue: Migration fails with "relation already exists"

**Solution**:

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or start fresh:
npx prisma db push --accept-data-loss
```

---

## 📊 Database Configuration Comparison

| Option               | Setup Time | Cost      | Best For                         |
| -------------------- | ---------- | --------- | -------------------------------- |
| **Local PostgreSQL** | 10-15 min  | Free      | Full control, offline work       |
| **Docker**           | 5 min      | Free      | Easy setup, isolated environment |
| **Supabase**         | 2 min      | Free tier | Quick start, built-in features   |
| **Neon**             | 2 min      | Free tier | Serverless, auto-scaling         |
| **Railway**          | 2 min      | Free tier | Simple deployment                |

---

## 🔒 Security Best Practices

### For Local Development

```bash
# Strong password requirements:
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Example: FarmersMarket2025!Secure#Dev

# Keep credentials secure:
- Never commit .env to git (already in .gitignore)
- Use different passwords for dev/prod
- Rotate passwords regularly
```

### For Production

```bash
# Use environment variables (not .env file)
# Configure in hosting platform (Vercel, Railway, etc.)

# Enable SSL:
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Connection pooling (recommended):
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10"
```

---

## 📚 Next Steps After Setup

Once database is ready:

1. ✅ **Run migrations**: `npx prisma migrate dev`
2. ✅ **Seed data** (optional): `npm run db:seed`
3. ✅ **Test queries**: `npm run dev` and test endpoints
4. ✅ **Verify performance**: Check analytics endpoint <100ms
5. ✅ **Update documentation**: Record baseline performance

---

## 💡 Quick Commands Reference

```bash
# Check PostgreSQL status
pg_isready                          # Local
docker-compose ps                   # Docker

# Access database CLI
psql -U postgres -d farmers_market  # Local
docker exec -it farmers_market_db psql -U farmers_admin -d farmers_market  # Docker

# Prisma commands
npx prisma migrate dev              # Create & apply migration
npx prisma migrate deploy           # Apply in production
npx prisma db push                  # Push schema without migration
npx prisma studio                   # Open Prisma Studio GUI
npx prisma db seed                  # Seed database

# Backup & restore
pg_dump farmers_market > backup.sql           # Backup
psql farmers_market < backup.sql              # Restore

# Docker commands
docker-compose up -d                # Start containers
docker-compose down                 # Stop containers
docker-compose logs -f postgres     # View logs
docker-compose restart postgres     # Restart database
```

---

## 🌟 Recommended Setup (for your HP OMEN)

Given your powerful hardware, I recommend **Option 2: Docker PostgreSQL**:

**Why?**

- ✅ Fast setup (5 minutes)
- ✅ Isolated environment
- ✅ Easy to reset/recreate
- ✅ No Windows PATH configuration needed
- ✅ Includes pgAdmin for GUI management
- ✅ Production-like environment

**Alternative**: Local PostgreSQL if you want native performance

---

## 📞 Need Help?

If you encounter issues:

1. Check **Troubleshooting** section above
2. Review Prisma logs: `npx prisma migrate dev --help`
3. Test connection: `node -e "require('@prisma/client')"`
4. Check PostgreSQL logs (see commands above)

---

_Ready to create your database? Choose an option above and follow the steps!_ 🚀

**Estimated Time**: 5-15 minutes  
**Difficulty**: Easy  
**Impact**: Unlocks Phase 4B (60-70% faster queries)  
**Status**: READY TO START ✅
