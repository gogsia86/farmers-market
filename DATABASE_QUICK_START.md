# 🚀 Database Quick Start Guide

**5-Minute Setup** for the Farmers Market Platform Database

---

## ⚡ Quick Setup (Copy & Paste)

### 1. Create Environment File

```bash
# Copy the template
cp .env.template .env.local
```

### 2. Add Your Database URLs

Open `.env.local` and add these lines:

```bash
# Direct PostgreSQL Connection (REQUIRED)
DATABASE_URL="postgres://604c4fe0c73e61a0f3fb05e4130752b835fcddba7f35f5c87f3f636958772303:sk_NOjmSebRnYcwiC9GGWFzV@db.prisma.io:5432/postgres?sslmode=require"

# Prisma Accelerate (Optional - Production only)
DATABASE_URL_ACCELERATE="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19OT2ptU2ViUm5ZY3dpQzlHR1dGelYiLCJhcGlfa2V5IjoiMDFLQ1dTNzEwWEtROERFOVY2UVhYSFdWQTciLCJ0ZW5hbnRfaWQiOiI2MDRjNGZlMGM3M2U2MWEwZjNmYjA1ZTQxMzA3NTJiODM1ZmNkZGJhN2YzNWY1Yzg3ZjNmNjM2OTU4NzcyMzAzIiwiaW50ZXJuYWxfc2VjcmV0IjoiODhkYzQ0YjAtYjFiMS00YjY0LWFjYjAtYzg0MzhkM2NiZjM0In0.kx13UJDaXpBiWYC93tiaINPUI-FaqW5qkrZzgvn-bps"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Migrations

```bash
npx prisma migrate dev
```

### 6. Verify Setup

```bash
npm run validate:db
```

**Expected Output:**
```
✅ DATABASE_URL is set
✅ Database connection successful
✅ Prisma Client connected
✅ All critical validations passed!
```

---

## 🎯 What You Just Did

| Step | What It Does |
|------|--------------|
| **1. Environment File** | Created `.env.local` with your database credentials |
| **2. Database URLs** | Configured both direct and Accelerate connections |
| **3. Dependencies** | Installed all required packages |
| **4. Generate Client** | Created TypeScript-safe Prisma client |
| **5. Migrations** | Applied database schema to your database |
| **6. Validation** | Verified everything works correctly |

---

## 📝 Understanding Your Database URLs

### Direct PostgreSQL URL (Required)
```
postgres://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?[OPTIONS]
```

**Your URL Breakdown:**
- **Host:** `db.prisma.io:5432`
- **Database:** `postgres`
- **SSL:** Required (`sslmode=require`)

**Used For:**
- ✅ Running migrations
- ✅ Opening Prisma Studio
- ✅ Local development
- ✅ Database seeding

---

### Prisma Accelerate URL (Optional - Production)
```
prisma+postgres://accelerate.prisma-data.net/?api_key=[YOUR_KEY]
```

**Benefits:**
- 🚀 Connection pooling (prevents "too many connections")
- 💾 Query caching (faster responses)
- 🌍 Global CDN (low latency worldwide)

**When to Use:**
- ✅ Production environment
- ✅ High traffic scenarios
- ✅ Serverless deployments (Vercel, AWS Lambda)

**When NOT to Use:**
- ❌ Running migrations
- ❌ Using Prisma Studio
- ❌ Local development

---

## 🔧 Common Commands

```bash
# Open database browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Validate database setup
npm run validate:db

# Test database connection
npm run db:test
```

---

## ✅ Using the Database in Code

### ✅ CORRECT - Use Canonical Import

```typescript
// ALWAYS use this import
import { database } from "@/lib/database";

// Query examples
const farms = await database.farm.findMany({
  where: { status: 'ACTIVE' }
});

const user = await database.user.findUnique({
  where: { id: userId }
});
```

### ✅ CORRECT - Import Types

```typescript
import type { Farm, Product, User } from "@prisma/client";

// Use types
const farm: Farm = await database.farm.findUnique({
  where: { id: farmId }
});
```

### ❌ NEVER DO THIS

```typescript
// ❌ FORBIDDEN - Creates connection leaks!
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // DON'T DO THIS!
```

---

## 🚨 Troubleshooting

### Problem: "DATABASE_URL is not set"

**Solution:**
```bash
# 1. Check if .env.local exists
ls -la .env.local

# 2. If not, create it from template
cp .env.template .env.local

# 3. Add your DATABASE_URL
# Edit .env.local and add the URL from step 2 above

# 4. Restart your dev server
npm run dev
```

---

### Problem: "Can't reach database server"

**Solution:**
```bash
# Test the connection string directly
npx prisma db pull

# If it fails, check:
# 1. Is your internet connection working?
# 2. Is the database host correct?
# 3. Is SSL configured correctly?
# 4. Are credentials correct?
```

---

### Problem: "Too many connections"

**Solution:**

**Option 1 (Recommended):** Use Prisma Accelerate in production
```bash
# Add to .env.production
DATABASE_URL_ACCELERATE="prisma+postgres://..."
```

**Option 2:** Reduce connection pool
```typescript
// src/lib/database/index.ts
max: 1, // Already set in your config
```

---

### Problem: "Migration failed"

**Solution:**
```bash
# 1. Check migration status
npx prisma migrate status

# 2. If there are pending migrations
npx prisma migrate deploy

# 3. If there are conflicts (dev only!)
npx prisma migrate reset

# 4. Create fresh migration
npx prisma migrate dev --name fix_schema
```

---

## 📊 Verify Your Setup

Run the validation script:

```bash
npm run validate:db
```

**You should see:**
```
✅ DATABASE_URL is set
✅ DATABASE_URL format is valid
✅ Database connection successful (45ms)
✅ Prisma Client connected (123ms)
✅ Test query successful (12ms)
✅ Table "User" exists
✅ Table "Farm" exists
✅ Table "Product" exists
✅ Table "Order" exists
✅ Connection pool handled 3 concurrent queries

📈 Validation Summary
Total Tests: 15
✅ Passed: 15
❌ Failed: 0
⚠️  Warnings: 0

✨ All critical validations passed!
```

---

## 🎓 Next Steps

### 1. Open Prisma Studio (Database Browser)
```bash
npx prisma studio
```
Access at: http://localhost:5555

### 2. Seed Test Data (Optional)
```bash
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```
Access at: http://localhost:3001

### 4. Check Application Health
```bash
# Visit in browser
http://localhost:3001/api/health
```

---

## 📚 More Resources

### Documentation
- **Comprehensive Guide:** [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)
- **Prisma Schema:** [prisma/schema.prisma](./prisma/schema.prisma)
- **Database Client:** [src/lib/database/index.ts](./src/lib/database/index.ts)

### Official Docs
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate)

---

## ✨ Summary

You now have:

✅ Database connection configured  
✅ Prisma Client generated  
✅ Schema applied to database  
✅ Validation script passing  
✅ Ready to start coding!

**Your database is properly configured and ready for development! 🎉**

---

**Questions?** Check the [troubleshooting section](#-troubleshooting) or see the [comprehensive guide](./docs/DATABASE_SETUP.md).

**Last Updated:** January 2025  
**Version:** 1.0.0