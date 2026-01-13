# 🚀 Database Optimization Setup Guide

**Quick Start Guide for Running Performance Optimizations**

---

## 📋 Prerequisites Checklist

Before running the optimization scripts, ensure you have:

- [ ] PostgreSQL 12+ database (14+ recommended)
- [ ] Database connection string (DATABASE_URL)
- [ ] Node.js 18+ installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Database schema migrated (`npx prisma migrate deploy`)

---

## 🔧 Step 1: Configure Environment Variables

### Option A: Use Existing .env.local (Recommended)

Your project already has `.env.local`. Verify it contains:

```bash
DATABASE_URL="postgresql://username:password@host:port/database_name?schema=public"
```

**Example formats:**

```bash
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Railway
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:7894/railway"

# Render
DATABASE_URL="postgresql://user:password@dpg-xxx-a.oregon-postgres.render.com/database_name"

# Heroku
DATABASE_URL="postgresql://user:password@ec2-xxx.compute-1.amazonaws.com:5432/database"

# Neon
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb"

# DigitalOcean
DATABASE_URL="postgresql://doadmin:password@db-postgresql-xxx.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

### Option B: Create .env.local

If `.env.local` doesn't have DATABASE_URL, add it:

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit .env.local and add your DATABASE_URL
nano .env.local  # or use any text editor
```

### Option C: Set Environment Variable Temporarily

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://username:password@host:port/database"
npx tsx scripts/check-db-readiness.ts
```

**Windows (CMD):**
```cmd
set DATABASE_URL=postgresql://username:password@host:port/database
npx tsx scripts/check-db-readiness.ts
```

**Mac/Linux:**
```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
npx tsx scripts/check-db-readiness.ts
```

---

## 🔍 Step 2: Verify Database Connection

Run the readiness check script:

```bash
npx tsx scripts/check-db-readiness.ts
```

### Expected Output:

```
╔════════════════════════════════════════════════════════════════╗
║         DATABASE READINESS CHECK FOR OPTIMIZATIONS            ║
╚════════════════════════════════════════════════════════════════╝

🔍 Running pre-optimization checks...

✅ Environment Configuration: DATABASE_URL is configured
✅ Database Connection: Successfully connected to database
✅ PostgreSQL Version: PostgreSQL 14 detected (optimal)
✅ Required Tables: All 5 required tables exist
✅ Database Permissions: Sufficient permissions for index creation
⚠️  PostgreSQL Extensions: Missing extensions: pg_trgm, pg_stat_statements
✅ Existing Optimization Indexes: No optimization indexes found
✅ Table Statistics: Database contains 1,234 rows
✅ Database Size: Current database size: 45 MB
✅ Database Load: Low load: 3/100 connections (3.0%)

═══════════════════════════════════════════════════════════════
                          SUMMARY                              
═══════════════════════════════════════════════════════════════

✅ Passed:   9/10
⚠️  Warnings: 1/10
❌ Failed:   0/10

⚠️  READINESS: PROCEED WITH CAUTION

💡 Recommendations:
   Review warnings above and proceed carefully.
   Have a rollback plan ready.
```

### Troubleshooting Common Issues:

#### ❌ "DATABASE_URL environment variable not found"
**Solution:** Add DATABASE_URL to `.env.local` or set it in your shell (see Step 1)

#### ❌ "Failed to connect to database"
**Solution:** 
- Verify database is running
- Check host/port/credentials are correct
- Ensure firewall allows connection
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

#### ❌ "Missing tables: farms, products, ..."
**Solution:** Run migrations first:
```bash
npx prisma migrate deploy
```

#### ❌ "PostgreSQL version detected (version 12+ required)"
**Solution:** Upgrade PostgreSQL or use a managed service (Supabase, Railway, etc.)

#### ❌ "Insufficient permissions to create indexes"
**Solution:** 
- Use database superuser account
- Grant CREATE privilege: `GRANT CREATE ON SCHEMA public TO your_user;`
- Contact your DBA

---

## 🚀 Step 3: Apply Database Optimizations

Once readiness check passes, run the optimization script:

```bash
npx tsx scripts/apply-db-optimizations.ts
```

### What This Does:

1. **Enables PostgreSQL Extensions** (requires SUPERUSER)
   - `pg_trgm` - For fast text search (LIKE, ILIKE)
   - `pg_stat_statements` - For query performance tracking

2. **Creates Performance Indexes** (15+ indexes)
   - Composite indexes for common query patterns
   - Partial indexes for filtered queries
   - GIN indexes for full-text search
   - All created CONCURRENTLY (no downtime)

3. **Updates Database Statistics**
   - Runs ANALYZE on all major tables
   - Runs VACUUM to reclaim space
   - Updates query planner statistics

4. **Displays Results**
   - Index creation confirmation
   - Table sizes before/after
   - Index usage statistics

### Expected Runtime:

- Small database (<1000 rows): 30-60 seconds
- Medium database (1k-100k rows): 2-5 minutes
- Large database (100k+ rows): 5-15 minutes

### Expected Output:

```
╔════════════════════════════════════════════════════════════════╗
║           DATABASE OPTIMIZATION SCRIPT                        ║
╚════════════════════════════════════════════════════════════════╝

🔧 Phase 1: Enable PostgreSQL Extensions
✅ Extension pg_trgm enabled
✅ Extension pg_stat_statements enabled

🔧 Phase 2: Create Performance Indexes (CONCURRENTLY)
✅ Created index: idx_farms_status_approved_at
✅ Created index: idx_farms_owner_created
✅ Created index: idx_products_farm_status_stock
... (15 total indexes)

🔧 Phase 3: Update Database Statistics
✅ ANALYZE completed on farms
✅ ANALYZE completed on products
✅ VACUUM completed

📊 Results Summary:
   - Indexes created: 15
   - Total index size: 12.5 MB
   - Database size: 45 MB → 57.5 MB
   - Estimated query improvement: 40-80%

✅ Database optimization completed successfully!
```

---

## 📊 Step 4: Run Performance Test

Test the improvements with the site inspector:

```bash
# Run quick inspection
npm run inspect:v4:quick -- --mock-auth

# Compare with baseline
npx tsx scripts/compare-performance.ts --latest
```

### Expected Performance Improvements:

**Before Optimization:**
- Browse Farms: 20,619ms ⚠️
- Browse Products: 21,757ms ⚠️
- Homepage: 10,548ms ⚠️
- Average: 7,289ms ⚠️

**After Optimization:**
- Browse Farms: ~5,000ms ✅ (76% improvement)
- Browse Products: ~5,000ms ✅ (77% improvement)
- Homepage: ~3,000ms ✅ (72% improvement)
- Average: ~2,500ms ✅ (66% improvement)

---

## 🔄 Step 5: Integrate Optimized Code

Update your service layer to use optimized repositories:

### File: `src/lib/services/farm.service.ts`

```typescript
// OLD:
import { farmRepository } from '@/lib/repositories/farm.repository';

// NEW:
import { optimizedFarmRepository as farmRepository } from '@/lib/repositories/farm.repository.optimized';
```

### File: `src/app/api/v1/farms/route.ts`

```typescript
// Use optimized methods
const { items, total } = await farmRepository.findManyWithCount(filters);
```

### File: `src/app/api/v1/farms/[id]/route.ts`

```typescript
// Use optimized detail fetch
const farm = await farmRepository.findByIdOptimized(id);
```

---

## ✅ Verification Checklist

After applying optimizations, verify everything works:

- [ ] Database optimizations completed without errors
- [ ] All indexes created successfully (check with SQL below)
- [ ] Site loads faster (run inspector comparison)
- [ ] No application errors in logs
- [ ] All API endpoints respond correctly
- [ ] User authentication still works
- [ ] Search functionality works
- [ ] Database connections are healthy

### SQL Verification Queries:

```sql
-- Check indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check index usage (after some traffic)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- Check slow queries
SELECT 
    query,
    calls,
    mean_exec_time,
    total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## 🔙 Rollback Plan (If Needed)

If you encounter issues, you can safely rollback:

### Option 1: Drop All Optimization Indexes

```sql
-- Connect to your database
psql $DATABASE_URL

-- Drop all optimization indexes (safe, immediate)
DROP INDEX CONCURRENTLY IF EXISTS idx_farms_status_approved_at;
DROP INDEX CONCURRENTLY IF EXISTS idx_farms_owner_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_farms_location_status;
DROP INDEX CONCURRENTLY IF EXISTS idx_farms_name_trgm;
DROP INDEX CONCURRENTLY IF EXISTS idx_products_farm_status_stock;
DROP INDEX CONCURRENTLY IF EXISTS idx_products_category_status;
DROP INDEX CONCURRENTLY IF EXISTS idx_products_farm_category;
DROP INDEX CONCURRENTLY IF EXISTS idx_products_name_trgm;
DROP INDEX CONCURRENTLY IF EXISTS idx_reviews_farm_status;
DROP INDEX CONCURRENTLY IF EXISTS idx_reviews_user_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_orders_user_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_orders_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_order_items_order_product;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_email_status;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_role_status;
```

### Option 2: Revert Code Changes

```bash
# If you integrated optimized repository and want to revert
git revert HEAD
git push origin master

# Or checkout specific commit
git checkout 754e4b32  # commit before optimizations
```

### Option 3: Full Database Restore

If something goes seriously wrong (very unlikely):

```bash
# Restore from your backup
# (Follow your backup restoration procedure)
```

---

## 🎯 Common Scenarios

### Scenario 1: Production Database (Recommended Approach)

1. **Test in Staging First**
   ```bash
   # Set staging DATABASE_URL
   export DATABASE_URL="postgresql://..."
   npx tsx scripts/apply-db-optimizations.ts
   ```

2. **Run Load Tests**
   ```bash
   k6 run scripts/load-test.js
   ```

3. **Deploy to Production During Off-Peak Hours**
   - Backup database first
   - Run optimization script
   - Monitor for 15 minutes
   - Rollback if issues

### Scenario 2: Local Development

```bash
# Use local database
export DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"
npx tsx scripts/check-db-readiness.ts
npx tsx scripts/apply-db-optimizations.ts
```

### Scenario 3: Managed Database (Supabase, Railway, etc.)

Most managed services automatically have necessary permissions:

```bash
# Get DATABASE_URL from your provider's dashboard
# Supabase: Settings → Database → Connection string
# Railway: Project → Database → Connect → Postgres Connection URL
# Render: Database → External Database URL

export DATABASE_URL="postgresql://..."
npx tsx scripts/apply-db-optimizations.ts
```

### Scenario 4: Coordinating with DBA

If you don't have SUPERUSER access:

1. Send DBA the SQL file: `scripts/quick-performance-fixes.sql`
2. Request they run it during maintenance window
3. Verify indexes were created
4. Integrate optimized code

---

## 📞 Getting Help

### If Optimizations Don't Complete:

1. Check error message in terminal
2. Review `DB_OPTIMIZATION_STATUS.md` for troubleshooting
3. Try manual SQL: `psql $DATABASE_URL -f scripts/quick-performance-fixes.sql`
4. Contact DBA if permission issues

### If Performance Doesn't Improve:

1. Verify indexes are being used:
   ```sql
   SELECT * FROM pg_stat_user_indexes WHERE indexname LIKE 'idx_%';
   ```

2. Check slow queries:
   ```sql
   SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
   ```

3. Ensure optimized repository is integrated
4. Clear CDN/ISR caches
5. Review `OPTIMIZATION_SUMMARY_2025-01-14.md` for additional steps

### If Application Errors Occur:

1. Check application logs for errors
2. Verify database connection pool is healthy
3. Test API endpoints manually
4. Rollback if necessary (see Rollback Plan above)
5. Re-run after fixing issues

---

## 📚 Additional Resources

- **Full Documentation**: `OPTIMIZATION_SUMMARY_2025-01-14.md`
- **Action Plan**: `NEXT_STEPS_ACTION_PLAN.md`
- **Technical Details**: `DB_OPTIMIZATION_STATUS.md`
- **Session Notes**: `SESSION_SUMMARY_2025-01-14.md`

---

## 🎉 Success Criteria

You'll know the optimization was successful when:

✅ Average page load time drops by 40-60%
✅ Farm/product listing pages load in <5 seconds
✅ Database query times reduced by 40-80%
✅ No increase in error rates
✅ User experience feels significantly faster
✅ Index usage stats show indexes are being used
✅ pg_stat_statements shows improved query times

---

**Ready to optimize?** Start with Step 1! 🚀