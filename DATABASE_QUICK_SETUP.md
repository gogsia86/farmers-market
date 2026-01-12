# 🗄️ DATABASE QUICK SETUP GUIDE
**Get your database running in 10 minutes**

---

## 🎯 OPTION 1: NEON (RECOMMENDED - 10 MINUTES)

### Why Neon?
- ✅ Free tier: 0.5GB storage, 300 compute hours/month
- ✅ Instant setup, no credit card required
- ✅ Vercel-optimized (built for serverless)
- ✅ Auto-scaling, connection pooling built-in
- ✅ Database branching for dev/staging

### Setup Steps

#### Step 1: Create Neon Account (2 minutes)
```bash
1. Go to: https://neon.tech
2. Click "Sign up"
3. Choose "Continue with GitHub" (fastest)
4. Authorize Neon
```

#### Step 2: Create Database Project (3 minutes)
```bash
1. Click "Create Project"
2. Project Name: farmers-market-prod
3. Region: Choose closest to your Vercel region
   - US East (Ohio) - recommended for US
   - EU West (Frankfurt) - recommended for Europe
4. PostgreSQL Version: 16 (default)
5. Click "Create Project"
```

#### Step 3: Get Connection String (1 minute)
```bash
1. On project dashboard, find "Connection Details"
2. Connection type: "Pooled connection" ⭐ IMPORTANT
3. Copy the full connection string
4. Should look like:
   postgresql://[user]:[password]@[host]/[database]?sslmode=require

Example:
postgresql://divine_user:AbCdEf123456@ep-cool-farm-123456.us-east-2.aws.neon.tech/farmersmarket?sslmode=require
```

#### Step 4: Configure Vercel (2 minutes)
```bash
1. Go to: https://vercel.com/[your-username]/farmers-market
2. Click "Settings" → "Environment Variables"
3. Click "Add New"
4. Enter:
   Name: DATABASE_URL
   Value: [paste your Neon connection string]
   Environment: Production ✅ Preview ✅ Development ✅
5. Click "Save"
```

#### Step 5: Deploy & Initialize (5 minutes)
```bash
# Option A: Auto-deploy (recommended)
1. Push to GitHub (Vercel auto-deploys)
2. Wait for build to complete (~3 minutes)
3. Open Vercel dashboard → "Deployments"
4. Wait for status: "Ready"

# Option B: Manual deploy
vercel deploy --prod
```

#### Step 6: Seed Database (3 minutes)
```bash
# Run locally with production DATABASE_URL
export DATABASE_URL="your_neon_connection_string"

# Push schema to database
npx prisma db push

# Seed with basic data (admin + sample farms)
npm run db:seed:basic

# Or seed with comprehensive data (300+ products)
npm run db:seed
```

#### Step 7: Verify (1 minute)
```bash
# Check database health
curl https://your-app.vercel.app/api/health/database

# Expected response:
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "latency": 45,
    "message": "Database is responsive"
  }
}

# Test the app
1. Visit: https://your-app.vercel.app
2. Try signup/login
3. Browse farms and products
```

### 🎉 DONE! Total Time: ~15 minutes

---

## 🎯 OPTION 2: VERCEL POSTGRES (5 MINUTES)

### Why Vercel Postgres?
- ✅ One-click setup in Vercel dashboard
- ✅ Automatic environment variable configuration
- ✅ Same underlying tech as Neon
- ✅ Managed directly from Vercel

### Setup Steps

#### Step 1: Create Database (2 minutes)
```bash
1. Go to Vercel Project Dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Database Name: farmers-market-prod
6. Region: Same as your project
7. Click "Create"
```

#### Step 2: Connect to Project (1 minute)
```bash
1. Select your project: "farmers-market"
2. Click "Connect"
3. Vercel automatically sets environment variables:
   - DATABASE_URL
   - POSTGRES_URL
   - POSTGRES_PRISMA_URL (use this for Prisma)
```

#### Step 3: Pull Environment Variables (1 minute)
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Pull environment variables locally
vercel env pull .env.local

# Verify DATABASE_URL is set
cat .env.local | grep DATABASE_URL
```

#### Step 4: Initialize Database (2 minutes)
```bash
# Push schema
npx prisma db push

# Seed basic data
npm run db:seed:basic
```

#### Step 5: Deploy & Verify (2 minutes)
```bash
# Deploy to production
vercel deploy --prod

# Verify health
curl https://your-app.vercel.app/api/health/database
```

### 🎉 DONE! Total Time: ~8 minutes

---

## 🎯 OPTION 3: SUPABASE (12 MINUTES)

### Why Supabase?
- ✅ Free tier: 500MB database
- ✅ PostgreSQL + Auth + Storage + Realtime
- ✅ Visual database editor
- ✅ Connection pooler included (pgBouncer)
- ✅ Automatic backups

### Setup Steps

#### Step 1: Create Supabase Account (2 minutes)
```bash
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Authorize Supabase
```

#### Step 2: Create Project (3 minutes)
```bash
1. Click "New Project"
2. Organization: Create new or use existing
3. Project Name: farmers-market-prod
4. Database Password: Generate strong password (save it!)
5. Region: Choose closest to Vercel region
6. Click "Create new project"
7. Wait 2-3 minutes for project initialization
```

#### Step 3: Get Connection Strings (2 minutes)
```bash
1. Click "Settings" → "Database"
2. Scroll to "Connection string"
3. Copy "Connection pooling" string (not "Direct connection")
4. Format should be:
   postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

⚠️ IMPORTANT: Use "Connection pooling" for Vercel (serverless)
```

#### Step 4: Configure Vercel (2 minutes)
```bash
1. Vercel Dashboard → Settings → Environment Variables
2. Add:
   Name: DATABASE_URL
   Value: [paste Supabase pooling connection string]
   Environments: Production ✅ Preview ✅ Development ✅
3. Save
```

#### Step 5: Deploy & Initialize (5 minutes)
```bash
# Push to GitHub (auto-deploy)
git push origin main

# Or manual deploy
vercel deploy --prod

# Wait for build completion

# Initialize database locally
export DATABASE_URL="your_supabase_connection_string"
npx prisma db push
npm run db:seed:basic
```

#### Step 6: Verify (1 minute)
```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health/database

# Check Supabase dashboard
1. Go to Supabase project
2. Click "Table Editor"
3. Should see: users, farms, products, orders, etc.
```

### 🎉 DONE! Total Time: ~15 minutes

---

## 🔧 TROUBLESHOOTING

### Issue: "P1001: Can't reach database server"
```bash
# ✅ FIX 1: Check connection string format
# Must include ?sslmode=require at the end
postgresql://user:pass@host:5432/db?sslmode=require

# ✅ FIX 2: Verify IP whitelist (Supabase only)
# Supabase: Settings → Database → Connection pooling
# Ensure "0.0.0.0/0" is allowed (or Vercel IPs)

# ✅ FIX 3: Check database is running
# Neon: Check project dashboard
# Supabase: Check project status
```

### Issue: "Environment variable DATABASE_URL not set"
```bash
# ✅ FIX 1: Check Vercel environment variables
vercel env ls

# ✅ FIX 2: Pull latest environment variables
vercel env pull .env.local

# ✅ FIX 3: Redeploy after adding variable
vercel deploy --prod
```

### Issue: "Prisma schema validation failed"
```bash
# ✅ FIX: Regenerate Prisma client
npx prisma generate

# ✅ FIX: Validate schema
npx prisma validate

# ✅ FIX: Format schema
npx prisma format
```

### Issue: "Too many connections"
```bash
# ✅ FIX 1: Use connection pooler (not direct connection)
# Neon: Use "Pooled connection" string
# Supabase: Use "Connection pooling" string

# ✅ FIX 2: Check connection pool settings
# src/lib/database/index.ts
max: 1  // Should be 1 for serverless

# ✅ FIX 3: Restart Vercel deployment
vercel deploy --prod
```

### Issue: "Database is empty / no data"
```bash
# ✅ FIX: Run seed script
export DATABASE_URL="your_connection_string"
npm run db:seed:basic

# Verify data
npx prisma studio
# Check users, farms, products tables
```

### Issue: "Slow database queries (>1s)"
```bash
# ✅ FIX 1: Check database region
# Should be close to Vercel deployment region

# ✅ FIX 2: Add indexes
npm run db:migrate

# ✅ FIX 3: Check slow query logs
# Visit: /api/health/database
# Check latency value

# ✅ FIX 4: Upgrade database plan
# Neon: Free → Pro ($19/month)
# Supabase: Free → Pro ($25/month)
```

---

## 📊 COMPARISON TABLE

| Feature | Neon | Vercel Postgres | Supabase |
|---------|------|-----------------|----------|
| **Free Tier** | 0.5GB, 300h compute | $0.30/GB | 500MB |
| **Setup Time** | 10 min | 5 min | 12 min |
| **Connection Pooling** | ✅ Built-in | ✅ Built-in | ✅ pgBouncer |
| **Auto-Scaling** | ✅ Yes | ✅ Yes | ❌ Manual |
| **Database Branching** | ✅ Yes | ✅ Yes | ❌ No |
| **Visual Editor** | ✅ Basic | ✅ Basic | ✅ Advanced |
| **Extra Features** | - | - | Auth, Storage, Realtime |
| **Best For** | Production | Vercel projects | Full-stack apps |

---

## 🎯 RECOMMENDED CHOICE

### For This Project: **NEON** ⭐

**Why?**
1. ✅ Serverless-optimized (Vercel's recommendation)
2. ✅ Free tier sufficient for MVP (500-1000 users)
3. ✅ Database branching for dev/staging
4. ✅ Auto-scaling (compute scales to zero)
5. ✅ Easy upgrade path to Pro

**When to Choose Vercel Postgres?**
- If you want everything in Vercel dashboard
- If you prefer single-vendor solution

**When to Choose Supabase?**
- If you need Auth + Storage + Database
- If you want advanced visual editor
- If you plan to use Supabase SDK

---

## 📝 POST-SETUP CHECKLIST

```bash
# ✅ Database connected
□ DATABASE_URL set in Vercel
□ Health endpoint returns "healthy"
□ No connection errors in logs

# ✅ Schema deployed
□ All tables created (users, farms, products, etc.)
□ Indexes applied
□ Foreign keys working

# ✅ Data seeded
□ Admin user created (admin@farmersmarket.app)
□ Sample farms available
□ Sample products available
□ Test orders can be placed

# ✅ Monitoring active
□ Slow query detection working
□ Error logging to Sentry
□ Health checks responding

# ✅ Documentation updated
□ Connection string saved securely
□ Backup procedures documented
□ Team has access to database dashboard
```

---

## 🚀 NEXT STEPS

### After Database Setup

1. **Run Initial Tests**
   ```bash
   # Test signup
   curl -X POST https://your-app.vercel.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   
   # Test login
   # Browse farms
   # Place test order
   ```

2. **Set Up Monitoring**
   ```bash
   # Add Sentry alerts for database errors
   # Configure Vercel logs
   # Set up uptime monitoring
   ```

3. **Plan Scaling**
   ```bash
   # Monitor database size
   # Track connection count
   # Watch query performance
   # Upgrade when needed
   ```

4. **Document Procedures**
   ```bash
   # Backup/restore process
   # Migration workflow
   # Troubleshooting guide
   # Team access procedures
   ```

---

## 📚 HELPFUL RESOURCES

### Documentation
- **Neon**: https://neon.tech/docs
- **Prisma**: https://www.prisma.io/docs
- **Vercel**: https://vercel.com/docs/storage
- **Supabase**: https://supabase.com/docs

### Database Scripts
```bash
# View all available scripts
npm run | grep db

# Common commands
npm run db:migrate      # Run migrations
npm run db:push         # Push schema
npm run db:seed         # Seed comprehensive data
npm run db:seed:basic   # Seed basic data only
npm run db:studio       # Open Prisma Studio
npm run db:validate     # Validate schema
```

### Health Checks
```bash
# Database health
curl https://your-app.vercel.app/api/health/database

# Full system health
curl https://your-app.vercel.app/api/health

# Database statistics
# View in Prisma Studio or database dashboard
```

---

## ✅ SUCCESS CRITERIA

### You're ready for production when:

1. ✅ Database health endpoint returns `{"status": "healthy"}`
2. ✅ Can signup, login, and browse farms
3. ✅ Can create farms and products
4. ✅ Can place orders and checkout
5. ✅ No database connection errors in Vercel logs
6. ✅ Query latency < 500ms (check health endpoint)
7. ✅ Admin user can access admin panel

---

**Setup Time Summary**:
- Neon: ~15 minutes ⭐ RECOMMENDED
- Vercel Postgres: ~8 minutes
- Supabase: ~15 minutes

**Questions?** Check `VERCEL_DATABASE_ANALYSIS.md` for detailed architecture info.

🌾 Happy farming! 🚀