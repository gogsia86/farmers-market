# 🗄️ DATABASE SETUP GUIDE - Farmers Market Platform

Complete guide to set up PostgreSQL database for local development.

---

## 📋 Table of Contents

1. [Quick Start (Docker - Recommended)](#quick-start-docker)
2. [Manual PostgreSQL Setup](#manual-postgresql-setup)
3. [Database Configuration](#database-configuration)
4. [Run Migrations](#run-migrations)
5. [Seed Test Data](#seed-test-data)
6. [Troubleshooting](#troubleshooting)
7. [Alternative Options](#alternative-options)

---

## 🚀 Quick Start (Docker - Recommended)

The fastest way to get started is using Docker Compose.

### Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Docker Compose available

### Steps

#### 1. Start Database Services

```bash
# Start PostgreSQL + Redis for development
docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev

# OR start with PgAdmin for database management UI
docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev pgadmin-dev
```

#### 2. Verify Services are Running

```bash
# Check container status
docker ps

# You should see:
# - farmers-market-db-dev (PostgreSQL on port 5432)
# - farmers-market-redis-dev (Redis on port 6379)
# - farmers-market-pgadmin-dev (PgAdmin on port 5050 - if started)
```

#### 3. Configure Environment Variables

Create or update `.env` file:

```bash
# Copy example file
cp .env.example .env
```

Add these database settings to `.env`:

```env
# Database Connection (Docker Dev)
DATABASE_URL="postgresql://farmers_user:changeme123@localhost:5432/farmers_market?schema=public"

# Redis Connection (Optional - for caching)
REDIS_URL="redis://:redispass123@localhost:6379/0"

# PgAdmin Access (if using)
PGADMIN_EMAIL="admin@farmersmarket.com"
PGADMIN_PASSWORD="admin123"
```

#### 4. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy

# OR create a new migration (development)
npx prisma migrate dev --name init
```

#### 5. Seed Test Data

```bash
# Populate database with sample farms, products, and users
npm run seed
```

#### 6. Verify Setup

```bash
# Check database connection
npm run bot:check

# You should see ✅ Database Connection - Connected - healthy
```

---

## 🔧 Manual PostgreSQL Setup

If you prefer not to use Docker, install PostgreSQL manually.

### Windows

#### Option 1: PostgreSQL Installer

1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run installer (PostgreSQL 16 recommended)
3. Set password for `postgres` user (remember this!)
4. Default port: `5432`
5. Install pgAdmin (included in installer)

#### Option 2: Chocolatey

```powershell
# Install PostgreSQL
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-16
```

### macOS

```bash
# Install with Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database
createdb farmers_market
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create user and database
sudo -u postgres psql
postgres=# CREATE USER farmers_user WITH PASSWORD 'changeme123';
postgres=# CREATE DATABASE farmers_market OWNER farmers_user;
postgres=# \q
```

### Create Database and User

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create user
CREATE USER farmers_user WITH PASSWORD 'changeme123';

-- Create database
CREATE DATABASE farmers_market OWNER farmers_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE farmers_market TO farmers_user;

-- Exit
\q
```

---

## ⚙️ Database Configuration

### Update `.env` File

```env
# ============================================================================
# DATABASE CONNECTION
# ============================================================================

# Local PostgreSQL (Docker)
DATABASE_URL="postgresql://farmers_user:changeme123@localhost:5432/farmers_market?schema=public"

# OR Local PostgreSQL (Manual Install)
# DATABASE_URL="postgresql://farmers_user:changeme123@localhost:5432/farmers_market?schema=public"

# OR Cloud PostgreSQL (e.g., Supabase)
# DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"

# ============================================================================
# REDIS CACHE (OPTIONAL)
# ============================================================================

# Local Redis (Docker)
REDIS_URL="redis://:redispass123@localhost:6379/0"

# OR Cloud Redis (e.g., Upstash)
# REDIS_URL="redis://[password]@[host]:[port]/0"
```

### Connection String Format

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public

Examples:
- Local:    postgresql://farmers_user:changeme123@localhost:5432/farmers_market
- Docker:   postgresql://farmers_user:changeme123@localhost:5432/farmers_market
- Supabase: postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
- Neon:     postgresql://[user]:[password]@[host].neon.tech:5432/[database]
```

---

## 🏗️ Run Migrations

### Generate Prisma Client

```bash
# Generate Prisma client (required after schema changes)
npx prisma generate
```

### Run Migrations

```bash
# Development - Create and apply migration
npx prisma migrate dev --name init

# Production - Apply existing migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Verify Schema

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Access at: http://localhost:5555
```

---

## 🌱 Seed Test Data

The seed script creates sample data for testing:

### What Gets Created

- **5 Users:**
  - 3 Farmers (farmer1@example.com, farmer2@example.com, farmer3@example.com)
  - 1 Customer (customer@example.com)
  - 1 Admin (admin@example.com)
  - All passwords: `password123`

- **3 Farms:**
  - Green Valley Organic Farm (vegetables, herbs)
  - Sunrise Dairy & Cheese Co (dairy products)
  - Mountain View Orchard (fruits)

- **17+ Products:**
  - Fresh vegetables (tomatoes, spinach, carrots, basil, lettuce)
  - Dairy products (cheddar, mozzarella, milk, yogurt)
  - Fresh fruits (apples, pears, peaches, cherries)

- **5 Categories:**
  - Vegetables, Fruits, Dairy, Herbs, Meat

### Run Seed Script

```bash
# Seed database with test data
npm run seed
```

### Expected Output

```
╔═══════════════════════════════════════════════════════════════════╗
║           🌱 DATABASE SEED SCRIPT - TEST DATA GENERATOR          ║
╚═══════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════
🌱 Seeding Users
═══════════════════════════════════════════════════════════════════
✅ Created user: farmer1@example.com (FARMER)
✅ Created user: farmer2@example.com (FARMER)
...

═══════════════════════════════════════════════════════════════════
📊 Seed Summary
═══════════════════════════════════════════════════════════════════
  👥 Users created/verified: 5
  🚜 Farms created/verified: 3
  🌾 Products created/verified: 17
  📂 Categories created/verified: 5

✨ Database seeding completed successfully!
```

### Test Credentials

After seeding, you can log in with:

```
Farmers:
  Email: farmer1@example.com | Password: password123
  Email: farmer2@example.com | Password: password123
  Email: farmer3@example.com | Password: password123

Customer:
  Email: customer@example.com | Password: password123

Admin:
  Email: admin@example.com | Password: password123
```

---

## 🔍 Troubleshooting

### Issue: "ECONNREFUSED" Error

**Problem:** Cannot connect to database

**Solutions:**

1. **Check if PostgreSQL is running:**

   ```bash
   # Docker
   docker ps | grep postgres

   # Windows
   Get-Service -Name postgresql*

   # macOS
   brew services list | grep postgresql

   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify DATABASE_URL:**
   - Check `.env` file exists
   - Verify connection string format
   - Ensure port is correct (usually 5432)

3. **Start PostgreSQL:**

   ```bash
   # Docker
   docker-compose -f docker-compose.dev.yml up -d postgres-dev

   # Windows
   net start postgresql-x64-16

   # macOS
   brew services start postgresql@16

   # Linux
   sudo systemctl start postgresql
   ```

### Issue: "Database does not exist"

**Solution:**

```bash
# Create database manually
docker exec -it farmers-market-db-dev psql -U farmers_user -c "CREATE DATABASE farmers_market;"

# OR using psql directly
psql -U farmers_user -h localhost -c "CREATE DATABASE farmers_market;"
```

### Issue: "Authentication failed"

**Solution:**

1. Verify username and password in `.env`
2. Reset PostgreSQL password:

   ```sql
   -- Connect as postgres superuser
   psql -U postgres

   -- Change password
   ALTER USER farmers_user WITH PASSWORD 'changeme123';
   ```

### Issue: "Prisma Client not found"

**Solution:**

```bash
# Regenerate Prisma client
npx prisma generate

# Clear cache and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

### Issue: "Migration failed"

**Solution:**

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# OR manually drop and recreate
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres-dev
npx prisma migrate deploy
```

### Check Database Connection

```bash
# Test connection with bot check
npm run bot:check

# OR test with Prisma
npx prisma db pull

# OR connect with psql
psql "postgresql://farmers_user:changeme123@localhost:5432/farmers_market"
```

---

## 🌐 Alternative Options

### Option 1: Supabase (Free PostgreSQL Cloud)

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `.env`:

   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

5. Run migrations: `npx prisma migrate deploy`

### Option 2: Neon (Serverless PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update `.env`:

   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech:5432/[database]"
   ```

5. Run migrations: `npx prisma migrate deploy`

### Option 3: Railway (PostgreSQL + Deployment)

1. Sign up at [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string
4. Update `.env`:

   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host].railway.app:5432/railway"
   ```

5. Run migrations: `npx prisma migrate deploy`

### Option 4: Local SQLite (Quick Testing)

**Note:** Not recommended for production. Some features require PostgreSQL.

1. Update `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Update `.env`:

   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Run migrations: `npx prisma migrate dev`

---

## 📊 Database Management Tools

### PgAdmin (Web UI)

Access at: `http://localhost:5050`

```bash
# Start with Docker
docker-compose -f docker-compose.dev.yml up -d pgadmin-dev

# Login credentials (from .env):
Email: admin@farmersmarket.com
Password: admin123
```

### Prisma Studio (Built-in)

```bash
# Launch Prisma Studio
npx prisma studio

# Access at: http://localhost:5555
```

### Command Line (psql)

```bash
# Connect to database
psql "postgresql://farmers_user:changeme123@localhost:5432/farmers_market"

# Common commands:
\dt              # List all tables
\d users         # Describe users table
\l               # List all databases
\q               # Quit
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] PostgreSQL is running
- [ ] `.env` file configured with DATABASE_URL
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Migrations applied (`npx prisma migrate deploy`)
- [ ] Database seeded (`npm run seed`)
- [ ] Health check passes (`npm run bot:check`)
- [ ] Can access Prisma Studio (`npx prisma studio`)

---

## 🚀 Next Steps

After database setup:

1. **Start Development Server:**

   ```bash
   npm run dev
   ```

2. **Run Health Check:**

   ```bash
   npm run bot:check
   ```

3. **Access Application:**
   - App: `http://localhost:3001`
   - Prisma Studio: `http://localhost:5555`
   - PgAdmin: `http://localhost:5050`

4. **Login with Test Account:**
   - Email: `farmer1@example.com`
   - Password: `password123`

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Project Instructions](.github/instructions/)

---

## 🆘 Need Help?

If you encounter issues:

1. Check this troubleshooting guide
2. Review error messages carefully
3. Verify all environment variables
4. Check PostgreSQL logs: `docker logs farmers-market-db-dev`
5. Ask for help with specific error messages

---

**Happy Farming! 🌾✨**
