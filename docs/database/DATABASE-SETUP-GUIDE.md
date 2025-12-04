# 🌾 DATABASE SETUP GUIDE - FARMERS MARKET PLATFORM

## 📋 Overview

This guide helps you set up the PostgreSQL database for the Farmers Market Platform, working around Prisma 7 configuration challenges.

---

## 🚨 Current Issue: Prisma 7 Configuration

**Problem:** Prisma 7.0.0 introduced breaking changes:

- The `url` property is no longer supported in `schema.prisma`
- Requires `prisma.config.ts` for migrations
- The config file parser is currently having issues

**Impact:**

- ✅ App runs fine (uses runtime adapter configuration)
- ❌ Cannot run `prisma migrate` or `prisma db push`
- ❌ Database tables are not created initially

---

## 🎯 SOLUTION METHODS

### Method 1: Downgrade to Prisma 6 (Recommended for Now)

This is the quickest solution until Prisma 7 stabilizes:

```bash
# Stop the dev server first (Ctrl+C)

# Downgrade Prisma
npm install prisma@6.22.0 @prisma/client@6.22.0 @prisma/adapter-pg@6.22.0

# Add URL back to schema temporarily
```

Then edit `prisma/schema.prisma` datasource section:

```prisma
datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  relationMode = "foreignKeys"
}
```

Run migrations:

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

Start the dev server:

```bash
npm run dev:omen
```

---

### Method 2: Manual Database Setup (Current Workaround)

Since Prisma 7 config is not working, use a direct SQL approach:

#### Step 1: Connect to PostgreSQL

```bash
# Using psql
psql -h localhost -U postgres -d farmersmarket

# Or using Docker
docker exec -it farmers-market-db-dev psql -U postgres -d farmersmarket
```

#### Step 2: Run the Latest Migration SQL

```bash
# Find the latest migration
cd prisma/migrations

# Look for the most recent folder (e.g., 20251117162745_newfmmigration)
# Copy the migration.sql content and run it in psql
```

Or run directly:

```bash
docker exec -i farmers-market-db-dev psql -U postgres -d farmersmarket < prisma/migrations/20251117162745_newfmmigration/migration.sql
```

#### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

#### Step 4: Verify Tables Exist

```bash
# Connect to database
docker exec -it farmers-market-db-dev psql -U postgres -d farmersmarket

# List tables
\dt

# Should see: User, Farm, Product, Order, etc.
```

---

### Method 3: Use Prisma Studio to Create Schema

Prisma Studio can sometimes bypass config issues:

```bash
npx prisma studio
```

However, this won't create tables if they don't exist.

---

## 🔧 CURRENT DATABASE STATUS

Check if your database has tables:

```bash
# Quick check
docker exec -it farmers-market-db-dev psql -U postgres -d farmersmarket -c "\dt"
```

**If tables exist:** ✅ You're good! Just need to generate Prisma Client:

```bash
npx prisma generate
```

**If no tables:** ❌ Follow Method 1 or Method 2 above.

---

## 🗃️ DATABASE CONNECTION DETAILS

From your `.env.local`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket?schema=public"
```

**Connection Info:**

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `farmersmarket`

---

## 📝 PRISMA 7 CONFIG FILE FORMATS ATTEMPTED

We tried multiple formats for `prisma.config.ts`:

### Format 1: TypeScript Export

```typescript
export default {
  datasource: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://...",
    },
  },
};
```

**Result:** ❌ "Failed to parse syntax of config file"

### Format 2: CommonJS Module

```javascript
module.exports = {
  datasource: { db: { url: process.env.DATABASE_URL } },
};
```

**Result:** ❌ "Failed to parse syntax of config file"

### Format 3: ES Module (.mjs)

```javascript
export default {
  datasource: { db: { url: process.env.DATABASE_URL } },
};
```

**Result:** ❌ "Failed to parse syntax of config file"

### Format 4: With defineConfig

```typescript
import { defineConfig } from '@prisma/client'
export default defineConfig({ ... })
```

**Result:** ❌ "defineConfig is not a function"

---

## 🎯 RECOMMENDED SOLUTION PATH

**For Immediate Development:**

1. **Option A - Downgrade to Prisma 6** (Fastest)

   ```bash
   npm install prisma@6.22.0 @prisma/client@6.22.0 @prisma/adapter-pg@6.22.0
   ```

2. **Option B - Manual SQL Import**

   ```bash
   # Import the latest migration
   docker exec -i farmers-market-db-dev psql -U postgres -d farmersmarket < prisma/migrations/20251117162745_newfmmigration/migration.sql
   ```

3. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

4. **Restart Dev Server**
   ```bash
   npm run dev:omen
   ```

---

## ✅ VERIFICATION STEPS

After setting up the database, verify everything works:

### 1. Check Tables Exist

```bash
docker exec -it farmers-market-db-dev psql -U postgres -d farmersmarket -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
```

Expected tables:

- User
- Farm
- Product
- Order
- OrderItem
- Category
- Review
- Message
- Notification
- Address
- Payment

### 2. Test API Endpoints

```bash
# Test stats endpoint
curl http://localhost:3000/api/platform/stats

# Test farms endpoint
curl http://localhost:3000/api/featured/farms
```

Should return JSON with `"success": true` instead of errors.

### 3. Check Homepage

Visit `http://localhost:3000` - you should see:

- ✅ Platform statistics (not "Failed to fetch")
- ✅ Featured farms section (not "Failed to fetch")
- ✅ No console errors

---

## 🐛 TROUBLESHOOTING

### Error: "The table `public.farms` does not exist"

**Solution:** Database tables not created. Follow Method 1 or Method 2.

### Error: "Prisma Client not generated"

**Solution:**

```bash
npx prisma generate
```

### Error: "Can't reach database server"

**Solution:** Check Docker containers are running:

```bash
docker ps | grep farmers-market
```

Start if needed:

```bash
docker compose -f docker-compose.dev.yml up -d db
```

### Error: "Connection refused on port 5432"

**Solution:** PostgreSQL container not running:

```bash
docker compose -f docker-compose.dev.yml restart db
```

---

## 📚 USEFUL COMMANDS

```bash
# Check Prisma version
npx prisma --version

# View database in GUI
npx prisma studio

# Check connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# View migration status (if working)
npx prisma migrate status

# Generate Prisma Client
npx prisma generate

# Format schema file
npx prisma format
```

---

## 🔮 FUTURE: When Prisma 7 Config Works

Once Prisma 7 stabilizes and the config file format is fixed:

1. Create `prisma.config.ts` in root:

```typescript
export default {
  datasource: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
```

2. Remove `url` from `prisma/schema.prisma`

3. Use `prisma migrate` commands normally:

```bash
npx prisma migrate dev
npx prisma migrate deploy
```

---

## 🌟 QUICK REFERENCE

### Start Fresh Database

```bash
# 1. Stop dev server
# 2. Reset database
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d

# 3. Setup database (use Method 1 or 2)
# 4. Generate client
npx prisma generate

# 5. Seed data (optional)
npm run seed

# 6. Start dev server
npm run dev:omen
```

### Backup Database

```bash
# Backup
docker exec farmers-market-db-dev pg_dump -U postgres farmersmarket > backup.sql

# Restore
docker exec -i farmers-market-db-dev psql -U postgres farmersmarket < backup.sql
```

---

## 📞 NEED HELP?

- **Prisma 7 Documentation**: https://www.prisma.io/docs
- **Prisma Discord**: https://discord.gg/prisma
- **GitHub Issues**: Report Prisma 7 config parsing issues

---

**Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Status:** Workaround Active - Awaiting Prisma 7 Stability

---

_"Sometimes the best code is the workaround that gets you shipping."_ 🌾
