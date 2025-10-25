# 🗄️ DATABASE MIGRATION STRATEGY

**Project:** Farmers Market Production Deployment
**Database:** PostgreSQL (Supabase/Neon/Railway)
**ORM:** Prisma
**Date:** October 16, 2025

---

## 📋 MIGRATION OVERVIEW

### **Current State**

- **Development Database:** SQLite (`file:./dev.db`)
- **Production Database:** PostgreSQL (to be provisioned)
- **Schema Files:** `prisma/schema.prisma` (710 lines, 18 models)
- **Migration Status:** Development migrations exist, production needs fresh deployment

### **Target State**

- **Production Database:** Managed PostgreSQL on cloud provider
- **Schema:** All 18 models deployed with indexes and relationships
- **Seed Data:** Optional default categories and test products
- **Backup Strategy:** Automated daily backups with 30-day retention

---

## 🎯 MIGRATION STRATEGY

### **Approach: Fresh Database Deployment**

Since this is the **first production deployment**, we'll use a fresh database setup rather than migrating existing data.
### Rationale
- ✅ Clean slate with production-optimized schema
- ✅ No development data to migrate
- ✅ Simpler deployment process
- ✅ Faster initial setup

---

## 📝 SCHEMA OVERVIEW

### **Database Models (18 Total)**

```prisma
// Authentication & Users
- accounts (NextAuth accounts)
- sessions (NextAuth sessions)
- users (User profiles)
- verification_tokens (Email verification)

// E-Commerce Core
- products (Product catalog)
- categories (Product categories - hierarchical)
- inventory_items (Stock management)
- inventory_history (Stock change audit log)

// Orders & Payments
- orders (Customer orders)
- order_items (Order line items)
- payments (Payment records)

// Vendor Management
- vendor_profiles (Farmer/vendor details)

// Reviews & Ratings
- reviews (Product reviews)

// Chat & Communication
- chats (Chat sessions)
- chat_messages (Chat message history)
- chat_participants (Chat members)

// Notifications
- notifications (User notifications)

// Biodynamic Features
- biodynamic_calendar (Lunar calendar data)
```

### **Key Relationships**

```
users (1) → (N) vendor_profiles
users (1) → (N) orders
users (1) → (N) reviews
users (1) → (N) notifications

vendor_profiles (1) → (N) products
products (1) → (N) inventory_items
products (1) → (N) order_items
products (1) → (N) reviews

orders (1) → (N) order_items
orders (1) → (N) payments
orders (1) → (N) chats

categories (self-referential hierarchical)
```

### **Critical Indexes**

```prisma
// High-traffic queries need indexes
@@index([userId])        // User lookups
@@index([vendorId])      // Vendor product queries
@@index([category])      // Category filtering
@@index([status])        // Order status filtering
@@index([createdAt])     // Date range queries
```

---

## 🚀 MIGRATION STEPS

### **Step 1: Provision Production Database**

### Option A: Supabase (Recommended)

1. Go to: <<https://supabase.com/dashboar>d>
2. Click "New Project"
3. Project details:
   - **Name:** `farmers-market-production`
   - **Database Password:** Generate strong password (save securely)
   - **Region:** East US (iad1) or closest to users
   - **Pricing Plan:** Free tier (500 MB database, 2 GB bandwidth)
4. Wait 2-3 minutes for provisioning
5. Go to: Settings → Database → Connection string
6. Copy **Connection Pooling** string:

```bash
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

7. Copy **Direct Connection** string (for migrations):

```bash
postgresql://postgres.xxxxx:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Option B: Neon (Alternative)

1. Go to: <<https://console.neon.tec>h>
2. Create project: "farmers-market-production"
3. Copy connection strings (pooled and direct)

### Option C: Railway (Alternative)

1. Go to: <<https://railway.app/ne>w>
2. Add PostgreSQL plugin
3. Copy connection string from "Connect" tab

### **Step 2: Configure Environment Variables**

Add to `.env.production.local` (for local testing):

```bash
# Pooled connection (for application)
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

Add to Vercel Dashboard (for production):

1. Project → Settings → Environment Variables
2. Add `DATABASE_URL` → Production + Preview
3. Add `DIRECT_URL` → Production + Preview

### **Step 3: Generate Prisma Client**

```powershell
cd farmers-market

# Generate Prisma client with production schema
npm run db:generate

# Verify schema is valid
npx prisma validate
```
### Expected Output
```
✔ Prisma schema loaded from prisma\schema.prisma
✔ Environment variables loaded from .env.production.local
✔ Datasource "db": PostgreSQL database
✔ Prisma Client generated to src\generated\prisma
```

### **Step 4: Create Initial Migration**

```powershell
# Create initial migration (development)
npx prisma migrate dev --name initial_production_schema

# This generates:
# prisma/migrations/[timestamp]_initial_production_schema/migration.sql
```
### Review Generated Migration
Open `prisma/migrations/[timestamp]_initial_production_schema/migration.sql`

Verify it contains:

- ✅ All 18 table definitions
- ✅ Indexes on key columns
- ✅ Foreign key constraints
- ✅ Unique constraints
- ✅ Default values
### Sample Migration Preview
```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "products_vendorId_idx" ON "products"("vendorId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### **Step 5: Deploy Migration to Production**

**Method 1: Vercel Build (Automatic)**

Configure `vercel.json` build command:

```json
{
  "buildCommand": "npm run db:generate && npx prisma migrate deploy && npm run build"
}
```

This runs migrations automatically during deployment.

**Method 2: Manual Deployment (Before First Deploy)**

```powershell
# Set production database URL
$env:DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Deploy migrations
npx prisma migrate deploy

# Verify deployment
npx prisma studio
```
### Expected Output
```
✔ 1 migration applied
✓ Migration initial_production_schema applied (2.1s)
✔ All migrations have been successfully applied
```

### **Step 6: Verify Database Schema**

**Option A: Prisma Studio**

```powershell
# Open Prisma Studio (database GUI)
npm run db:studio

# Opens: http://localhost:5555
# Verify all 18 tables exist
```

### Option B: SQL Query (Supabase Dashboard)

1. Go to Supabase Dashboard → SQL Editor
2. Run:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify row counts (should be 0 for fresh database)
SELECT
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders;
```
### Expected Result
```
accounts
biodynamic_calendar
categories
chat_messages
chat_participants
chats
inventory_history
inventory_items
notifications
order_items
orders
payments
products
reviews
sessions
users
vendor_profiles
verification_tokens
```

---

## 🌱 DATABASE SEEDING (OPTIONAL)

### **Create Seed Script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create default categories
  const vegetablesCategory = await prisma.categories.upsert({
    where: { id: "cat-vegetables" },
    update: {},
    create: {
      id: "cat-vegetables",
      name: "Vegetables",
      description: "Fresh farm vegetables",
      image: "/images/categories/vegetables.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const fruitsCategory = await prisma.categories.upsert({
    where: { id: "cat-fruits" },
    update: {},
    create: {
      id: "cat-fruits",
      name: "Fruits",
      description: "Seasonal fruits",
      image: "/images/categories/fruits.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const dairyCategory = await prisma.categories.upsert({
    where: { id: "cat-dairy" },
    update: {},
    create: {
      id: "cat-dairy",
      name: "Dairy",
      description: "Farm-fresh dairy products",
      image: "/images/categories/dairy.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const grainsCategory = await prisma.categories.upsert({
    where: { id: "cat-grains" },
    update: {},
    create: {
      id: "cat-grains",
      name: "Grains",
      description: "Organic grains and seeds",
      image: "/images/categories/grains.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Categories seeded:", {
    vegetablesCategory,
    fruitsCategory,
    dairyCategory,
    grainsCategory,
  });

  // Create test admin user (optional)
  const adminUser = await prisma.users.upsert({
    where: { email: "admin@farmers-market.com" },
    update: {},
    create: {
      id: "user-admin",
      name: "Admin User",
      email: "admin@farmers-market.com",
      role: "ADMIN",
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Admin user created:", adminUser);

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### **Configure Seed Command**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### **Run Seed**

```powershell
# Seed development database
npm run db:seed

# Or seed production (after migration)
$env:DATABASE_URL="postgresql://..."
npm run db:seed
```

---

## 🛡️ BACKUP STRATEGY

### **Automated Backups (Supabase)**

Supabase provides automatic backups:

- **Frequency:** Daily at 2 AM UTC
- **Retention:** 7 days (free tier), 30 days (pro tier)
- **Location:** Same region as database
- **Restore:** Via Supabase Dashboard → Database → Backups

### **Manual Backup Command**

```powershell
# Backup production database to SQL file
$backup_date = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backup_file = "backup-farmers-market-$backup_date.sql"

# Using pg_dump (requires PostgreSQL client tools)
pg_dump "postgresql://postgres.xxxxx:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" > $backup_file

# Compress backup
Compress-Archive -Path $backup_file -DestinationPath "$backup_file.zip"

echo "✅ Backup created: $backup_file.zip"
```

### **Restore from Backup**

```powershell
# Restore from SQL backup
psql "postgresql://postgres.xxxxx:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" < backup-farmers-market-2025-10-16.sql
```

### **Backup Schedule**

| Backup Type                      | Frequency            | Retention | Location      |
| -------------------------------- | -------------------- | --------- | ------------- |
| **Automatic** (Supabase)         | Daily 2 AM           | 7-30 days | Cloud storage |
| **Manual** (pg_dump)             | Before major changes | 90 days   | Local + S3    |
| **Point-in-Time** (Supabase Pro) | Continuous           | 7 days    | Cloud storage |

---

## 🔄 ROLLBACK PLAN

### **Scenario 1: Migration Fails During Deployment**

```powershell
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back [migration-name]

# Fix migration SQL
# Re-run migration
npx prisma migrate deploy
```

### **Scenario 2: Data Corruption After Migration**

```powershell
# Option A: Restore from backup
psql "postgresql://..." < backup-file.sql

# Option B: Reset database (DANGER - loses all data)
npx prisma migrate reset --force
```

### **Scenario 3: Schema Drift Detected**

```powershell
# Check migration status
npx prisma migrate status

# If drift detected:
# 1. Create new migration from current schema
npx prisma migrate dev --name fix_schema_drift

# 2. Deploy migration
npx prisma migrate deploy
```

---

## ✅ MIGRATION CHECKLIST

### **Pre-Migration**

- [ ] Database provisioned (Supabase/Neon/Railway)
- [ ] Connection strings obtained (pooled + direct)
- [ ] Environment variables configured locally
- [ ] Prisma schema validated (`npx prisma validate`)
- [ ] Migration generated (`npx prisma migrate dev`)
- [ ] Migration SQL reviewed for correctness

### **Migration Execution**

- [ ] Migration deployed to production (`npx prisma migrate deploy`)
- [ ] All tables created (verify with Prisma Studio)
- [ ] Indexes created on key columns
- [ ] Foreign keys established
- [ ] Seed data imported (optional)
- [ ] Database backup created

### **Post-Migration Verification**

- [ ] Can connect to database from application
- [ ] Can query all tables
- [ ] Can insert test records
- [ ] Foreign key constraints working
- [ ] Indexes improving query performance
- [ ] Backup restoration tested

---

## 🚨 TROUBLESHOOTING

### **Error: P1001 - Can't reach database server**
### Solution
- ✅ Verify DATABASE_URL is correct
- ✅ Check database is accessible from public internet
- ✅ Verify firewall allows connections from Vercel IPs
- ✅ Check database is not paused (Supabase free tier)

### **Error: P3005 - Database schema drift detected**
### Solution
```powershell
# Option 1: Create migration from current state
npx prisma migrate dev --name resolve_drift

# Option 2: Reset migrations (DANGER)
npx prisma migrate reset --force
```

### **Error: Migration failed with foreign key violation**
### Solution
- Ensure referenced tables exist before creating foreign keys
- Check migration SQL order
- Temporarily disable foreign keys during migration if needed

### **Performance: Slow queries after migration**
### Solution
```powershell
# Add missing indexes
npx prisma migrate dev --name add_performance_indexes

# In migration SQL, add:
-- CREATE INDEX idx_products_vendor ON products(vendorId);
-- CREATE INDEX idx_orders_user ON orders(userId);
-- CREATE INDEX idx_products_category ON products(categoryId);
```

---

## 📞 SUPPORT RESOURCES

- **Prisma Migrate Docs:** <<https://www.prisma.io/docs/guides/migrat>e>
- **Supabase Docs:** <<https://supabase.com/docs/guides/databas>e>
- **PostgreSQL Docs:** <<https://www.postgresql.org/docs>/>

---

**Status:** Migration strategy documented and ready for execution! 🚀

_Generated with agricultural consciousness on October 16, 2025_
