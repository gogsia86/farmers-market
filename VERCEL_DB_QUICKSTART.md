# 🚀 VERCEL DATABASE QUICK START GUIDE

**Last Updated:** 2026-01-10  
**Status:** ✅ Database Seeded & Ready

---

## 📋 QUICK COMMANDS

### **Seed the Vercel Database**

```bash
# Interactive mode (recommended for first time)
npm run db:seed:vercel

# Force mode (skip confirmation)
npm run db:seed:vercel:force

# Comprehensive seed (more data)
npm run db:seed:vercel:full
```

### **View Database Data**

```bash
# Load Vercel environment
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"

# Open Prisma Studio
npx prisma studio
```

### **Test Database Connection**

```bash
# Pull latest environment variables
vercel env pull .env.vercel.local --yes

# Test connection
bash scripts/test-vercel-db.sh
```

### **Check Migration Status**

```bash
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
npx prisma migrate status
```

### **Deploy Migrations**

```bash
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
npx prisma migrate deploy
```

---

## 🔐 TEST CREDENTIALS

### **Admin Account**
```
Email:    gogsia@gmail.com
Password: Admin123!
URL:      https://farmers-market-platform.vercel.app/login
```

### **Farmer Account**
```
Email:    farmer1@example.com
Password: Farmer123!
```

### **Consumer Account**
```
Email:    consumer@example.com
Password: Consumer123!
```

---

## 🗄️ DATABASE STATUS

### **Current State**
- ✅ Connected to Vercel Postgres
- ✅ Schema migrated (all tables exist)
- ✅ Seeded with test data
- ✅ 5 users (1 admin, 3 farmers, 1 consumer)
- ✅ 6 farms with products
- ✅ 30+ products across categories
- ✅ Sample reviews

### **Connection Details**
- **Provider:** Prisma Accelerate
- **Host:** db.prisma.io
- **Region:** Global edge network
- **SSL:** Required (enabled)
- **Pooling:** Enabled

---

## 🛠️ COMMON OPERATIONS

### **Reset Database (DESTRUCTIVE!)**

⚠️ **WARNING:** This will delete ALL data!

```bash
# Load environment
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"

# Reset database
npx prisma migrate reset --force

# Re-seed
npm run db:seed:vercel:force
```

### **Add More Seed Data**

```bash
# Run seed again (may create duplicates for some data)
npm run db:seed:vercel:force

# Or use comprehensive seed
npm run db:seed:vercel:full
```

### **Update Environment Variables**

```bash
# Pull latest from Vercel
vercel env pull .env.vercel.local --yes

# Verify variables
grep DATABASE .env.vercel.local
```

### **Generate Prisma Client**

```bash
npx prisma generate
```

---

## 🧪 TESTING

### **Test Login**

```bash
# Visit your deployed app
open https://farmers-market-platform.vercel.app/login

# Try credentials:
# gogsia@gmail.com / Admin123!
```

### **Test API Endpoints**

```bash
# Check health
curl https://farmers-market-platform.vercel.app/api/health

# Check auth session
curl https://farmers-market-platform.vercel.app/api/auth/session
```

### **Run E2E Tests Against Vercel**

```bash
export BASE_URL=https://farmers-market-platform.vercel.app
npm run test:e2e
```

---

## 🔍 TROUBLESHOOTING

### **Problem: "Cannot connect to database"**

**Solution:**
```bash
# Pull fresh environment
vercel env pull .env.vercel.local --yes

# Test connection
bash scripts/test-vercel-db.sh
```

### **Problem: "Table does not exist"**

**Solution:**
```bash
# Deploy migrations
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
npx prisma migrate deploy
```

### **Problem: "Unique constraint failed"**

**Solution:**
```bash
# Data already exists - either:
# 1. Skip re-seeding (you're good!)
# 2. Reset first (DESTRUCTIVE):
npx prisma migrate reset --force
npm run db:seed:vercel:force
```

### **Problem: "Connection timeout"**

**Solution:**
```bash
# Database may be sleeping. Wait 10 seconds and retry
sleep 10
bash scripts/test-vercel-db.sh
```

### **Problem: "Environment variables not loading"**

**Solution:**
```bash
# Re-pull environment
vercel env pull .env.vercel.local --yes

# Verify DATABASE_URL exists
grep DATABASE_URL .env.vercel.local
```

---

## 📊 DATABASE QUERIES

### **Count Users**

```bash
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "User";'
```

### **List All Users**

```bash
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
npx prisma db execute --stdin <<< 'SELECT email, role, "firstName", "lastName" FROM "User";'
```

### **Count Products**

```bash
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "Product";'
```

### **List Farms**

```bash
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
npx prisma db execute --stdin <<< 'SELECT name, city, state FROM "Farm";'
```

---

## 🚀 DEPLOYMENT WORKFLOW

### **1. Seed Database** ✅ DONE
```bash
npm run db:seed:vercel:force
```

### **2. Test Locally**
```bash
npm run dev
# Test at http://localhost:3001
```

### **3. Commit Changes**
```bash
git add .
git commit -m "Database seeded and tested"
```

### **4. Deploy to Vercel**
```bash
git push origin master
# Or: vercel --prod
```

### **5. Test Production**
```bash
# Login to production
open https://farmers-market-platform.vercel.app/login

# Use credentials:
# gogsia@gmail.com / Admin123!
```

---

## 📁 USEFUL FILES

### **Environment Files**
- `.env.vercel.local` - Vercel environment variables (local copy)
- `.env` - Local development environment
- `.env.production` - Production overrides

### **Seed Scripts**
- `prisma/seed-basic.ts` - Basic seed data (5 users, 6 farms, 30 products)
- `prisma/seed.ts` - Comprehensive seed (9 users, 5 farms, full data)
- `scripts/seed-vercel-db.sh` - Vercel database seeding script

### **Documentation**
- `VERCEL_SEEDING_COMPLETE.md` - Full seeding documentation
- `VERCEL_DATABASE_STATUS.md` - Database connection details
- `CREDENTIALS_QUICK_REF.txt` - All test credentials
- `VERCEL_QUICK_SETUP.md` - Initial setup guide

### **Database Tools**
- `scripts/test-vercel-db.sh` - Test database connection
- `scripts/seed-vercel-db.sh` - Seed database with safety checks

---

## 🎯 NEXT STEPS

Now that your database is seeded:

1. **✅ Test Login**
   - Visit: https://farmers-market-platform.vercel.app/login
   - Use: gogsia@gmail.com / Admin123!

2. **✅ Browse Marketplace**
   - Check products are displayed
   - Test search and filtering
   - Add items to cart

3. **✅ Test Farmer Features**
   - Login as farmer1@example.com
   - View your farm
   - Manage products
   - Check orders

4. **✅ Test Admin Features**
   - Login as gogsia@gmail.com
   - Access admin dashboard
   - Manage users and farms
   - Monitor platform

5. **✅ Run E2E Tests**
   ```bash
   export BASE_URL=https://farmers-market-platform.vercel.app
   npm run test:e2e
   ```

---

## 💡 PRO TIPS

### **Prisma Studio Bookmark**
```bash
# Add this to your shell aliases
alias pstudio="source .env.vercel.local && export DATABASE_URL=\$Database_POSTGRES_URL && npx prisma studio"
```

### **Quick DB Check**
```bash
# Add to .bashrc or .zshrc
alias dbcheck="source .env.vercel.local && export DATABASE_URL=\$Database_POSTGRES_URL && npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM \"User\";'"
```

### **Fast Reseed**
```bash
# One-liner to reset and reseed
npm run db:seed:vercel:force
```

---

## 📞 GET HELP

### **Database Issues**
```bash
bash scripts/test-vercel-db.sh
```

### **View Logs**
```bash
vercel logs
```

### **Check Environment**
```bash
vercel env ls
```

### **Force Redeploy**
```bash
vercel --force --prod
```

---

## ✅ VERIFICATION CHECKLIST

- [x] Database connected to Vercel
- [x] Schema migrated (all tables exist)
- [x] Seed data loaded
- [x] Admin account created (gogsia@gmail.com)
- [x] Farmer accounts created
- [x] Consumer account created
- [x] Farms and products created
- [ ] Login tested on production
- [ ] Marketplace browsing tested
- [ ] Order placement tested
- [ ] E2E tests passing

---

**Status:** 🟢 READY FOR TESTING  
**Action:** Login and test your deployment!

**Production URL:** https://farmers-market-platform.vercel.app/login  
**Admin Login:** gogsia@gmail.com / Admin123!