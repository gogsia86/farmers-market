# 🗄️ DATABASE QUICK REFERENCE CARD
**Farmers Market Platform - Neon PostgreSQL**

---

## 🔐 CONNECTION DETAILS

**Provider**: Neon PostgreSQL  
**Region**: EU Central 1 (Frankfurt)  
**Database**: neondb  
**Connection Type**: Pooled (serverless-optimized)

**Connection String**:
```
postgresql://neondb_owner:npg_kOFG83Spucdr@ep-bold-surf-aghqa4is-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Neon Console**: https://console.neon.tech/app/projects

---

## 👤 TEST ACCOUNTS

### Admin
- **Email**: gogsia@gmail.com
- **Password**: Admin123!
- **URL**: http://localhost:3001/admin

### Farmer
- **Email**: farmer1@example.com
- **Password**: Farmer123!

### Consumer
- **Email**: consumer@example.com
- **Password**: Consumer123!

---

## ⚡ QUICK COMMANDS

### Start Development
```bash
npm run dev                    # Start server (port 3001)
npm run db:studio              # View database (port 5555)
```

### Database Operations
```bash
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Push schema to database
npm run db:seed                # Seed database with data
npm run db:reset               # Reset and reseed database
npx prisma studio              # Visual database editor
```

### Health Checks
```bash
# Local
http://localhost:3001/api/health/database

# Production
https://your-app.vercel.app/api/health/database
```

---

## 📊 DATABASE STATS

**Current Data**:
- Users: 5 (1 admin, 3 farmers, 1 consumer)
- Farms: 6
- Products: 30
- Reviews: 9
- Tables: 15+

**Free Tier Limits**:
- Storage: 0.5GB
- Compute: 300 hours/month
- Connections: 100 concurrent

---

## 🚀 VERCEL DEPLOYMENT

### Add to Vercel Environment Variables:
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_kOFG83Spucdr@ep-bold-surf-aghqa4is-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
Environments: ✅ Production  ✅ Preview  ✅ Development
```

### Deploy:
```bash
git push origin main           # Auto-deploy
# or
vercel deploy --prod           # Manual deploy
```

---

## 🔧 TROUBLESHOOTING

### Database Not Connecting
```bash
# Check environment variable
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin <<< "SELECT 1"

# Regenerate Prisma Client
npx prisma generate
```

### Schema Out of Sync
```bash
# Push schema
npx prisma db push

# Or use explicit URL
npx prisma db push --url="[your_connection_string]"
```

### Need to Reseed
```bash
npm run db:reset               # ⚠️ Deletes all data!
```

---

## 📁 IMPORTANT FILES

- `.env.local` - Local environment variables (DO NOT COMMIT)
- `prisma/schema.prisma` - Database schema
- `prisma/seed-basic.ts` - Seed script
- `src/lib/database/index.ts` - Database singleton

---

## ⚠️ SECURITY REMINDERS

- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit database credentials
- ✅ Use environment variables in Vercel
- ✅ Rotate passwords every 90 days
- ✅ Enable 2FA on Neon account

---

## 📚 DOCUMENTATION

- `VERCEL_DATABASE_ANALYSIS.md` - Full technical analysis
- `DATABASE_QUICK_SETUP.md` - Setup guide for all providers
- `VERCEL_DEPLOYMENT_COMPLETE.md` - Production deployment
- `DATABASE_SETUP_SUCCESS.md` - Setup completion summary

---

## 🆘 QUICK HELP

**Issue**: Can't reach database  
**Fix**: Verify DATABASE_URL includes `?sslmode=require`

**Issue**: Table not found  
**Fix**: Run `npx prisma db push`

**Issue**: Too many connections  
**Fix**: Use pooled connection (check `-pooler` in URL)

**Issue**: Changes not detected  
**Fix**: Restart dev server (Ctrl+C, then `npm run dev`)

---

## ✅ STATUS: OPERATIONAL

- ✅ Database connected
- ✅ Schema deployed
- ✅ Data seeded
- ✅ Ready for development
- ✅ Ready for production

**Last Updated**: January 12, 2026  
**Setup Time**: ~15 minutes  
**Status**: 🟢 READY

🌾 Happy farming! 🚀