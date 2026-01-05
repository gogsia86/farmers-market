# 📊 Database Migration Guide for Vercel Deployment

## ✅ Problem Solved: Database Already Has Schema

Your local database already had the schema, so we **baselined** it by marking all migrations as already applied.

---

## 🎯 For Vercel Production Database

When you deploy to Vercel with a **NEW database**, you have two options:

### Option 1: Fresh Database (Recommended)

If using Neon, Supabase, or Vercel Postgres with a **brand new database**:

```bash
# After Vercel deployment
vercel env pull .env.local
npx prisma migrate deploy
```

This will run all migrations from scratch.

---

### Option 2: Existing Database (If Copying Data)

If you're migrating an existing database to production:

#### Step 1: Backup Your Local Database
```bash
# Export schema and data
npx prisma db pull
pg_dump -h localhost -U postgres -d farmers_market > backup.sql
```

#### Step 2: Baseline Production Database
```bash
# Pull production environment
vercel env pull .env.production

# Mark all migrations as applied (don't run them)
for dir in prisma/migrations/*/; do
  dirname=$(basename "$dir")
  if [[ $dirname =~ ^[0-9]+_ ]]; then
    npx prisma migrate resolve --applied "$dirname"
  fi
done
```

#### Step 3: Verify Status
```bash
npx prisma migrate status
# Should show: "Database schema is up to date!"
```

---

## 🔄 Future Migrations

When you add new migrations:

### Local Development
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name
```

### Production Deployment
```bash
# Deploy to Vercel
git push origin master

# After deployment, run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

Vercel will automatically detect new migrations on each deployment.

---

## 🗄️ Database Options for Vercel

### Option 1: Neon (Recommended - Free)
- **Serverless Postgres**
- **Free tier**: 0.5GB storage, 10 branches
- **Perfect for**: Serverless deployments
- **Setup**: https://neon.tech

```bash
# Connection string format
DATABASE_URL="postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require"
```

### Option 2: Vercel Postgres
- **Managed Postgres by Vercel**
- **Built-in integration**
- **Pricing**: $0.06/GB + $0.30/compute hour
- **Setup**: Vercel Dashboard → Storage → Postgres

### Option 3: Supabase
- **Open-source Firebase alternative**
- **Free tier**: 500MB database
- **Includes**: Auth, Storage, Realtime
- **Setup**: https://supabase.com

```bash
# Use transaction pooling connection string for serverless
DATABASE_URL="postgresql://user:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
```

### Option 4: PlanetScale (MySQL)
- **Serverless MySQL**
- **Free tier**: 5GB storage
- **Note**: Requires Prisma schema changes (PostgreSQL → MySQL)
- **Setup**: https://planetscale.com

---

## 🚨 Important Notes

### For Production Database
1. **Always backup** before running migrations
2. **Test migrations** in preview deployments first
3. **Use transactions** for complex migrations
4. **Monitor migration logs** in Vercel

### Environment Variables
Make sure these are set in Vercel:

```bash
# Production
DATABASE_URL=postgresql://production-connection-string

# Preview (optional - use separate database)
DATABASE_URL=postgresql://preview-connection-string
```

---

## 📋 Migration Commands Reference

```bash
# Check migration status
npx prisma migrate status

# Deploy pending migrations (production)
npx prisma migrate deploy

# Create new migration (development)
npx prisma migrate dev --name migration_name

# Resolve migration as applied (baseline)
npx prisma migrate resolve --applied "migration_name"

# Reset database (⚠️ DESTRUCTIVE - dev only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio
```

---

## ✅ Current Status

Your local database is now baselined:
- ✅ All 10 migrations marked as applied
- ✅ Database schema is up to date
- ✅ Ready for new migrations

Your production deployment will:
- ✅ Run all migrations on fresh database
- ✅ Or skip if baselined like local

---

## 🎉 Next Steps

1. **Deploy to Vercel** using GitHub integration
2. **Set up production database** (Neon/Vercel Postgres/Supabase)
3. **Add DATABASE_URL** to Vercel environment variables
4. **Run migrations**: `npx prisma migrate deploy`
5. **Test the live application**

---

_For deployment instructions, see `VERCEL_DEPLOY_STEPS.md`_
