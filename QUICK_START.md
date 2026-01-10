# 🚀 Quick Start Guide - Farmers Market Platform

## 📋 Database Setup (One-Time)

```bash
# 1. Pull environment variables
vercel env pull .env.vercel.local

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Seed database with sample data
npx prisma db seed

# 5. Verify setup
npm run db:verify
```

---

## 🔑 Test Credentials

### Admin Account
- **Email:** `gogsia@gmail.com`
- **Password:** `Admin123!`

### Farmer Account
- **Email:** `farmer1@example.com`
- **Password:** `Farmer123!`

### Customer Account
- **Email:** `consumer@example.com`
- **Password:** `Consumer123!`

---

## 🛠️ Common Commands

### Development
```bash
# Start development server
npm run dev

# Start with safe mode (checks before starting)
npm run dev:safe

# Build for production
npm run build
```

### Database
```bash
# Verify database status
npm run db:verify

# Reset and reseed database
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio

# Run migrations
npm run db:migrate

# Just seed data
npm run db:seed
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Run all quality checks
npm run quality
```

### Deployment
```bash
# Pre-deployment checks
npm run deploy:check

# Deploy to Vercel
vercel --prod

# Check Vercel deployment
npm run test:vercel
```

---

## 📊 Database Contents

After seeding, you'll have:
- **5 Users** (1 admin, 3 farmers, 1 customer)
- **6 Farms** (all active)
- **30 Products** (distributed across farms)
- **9 Reviews** (sample product reviews)

---

## 🌐 URLs

### Local Development
- **Application:** http://localhost:3001
- **Login:** http://localhost:3001/login
- **Admin Dashboard:** http://localhost:3001/admin
- **Farms:** http://localhost:3001/farms
- **Products:** http://localhost:3001/products

### Production (Vercel)
- **Application:** https://farmers-market-platform.vercel.app
- **Login:** https://farmers-market-platform.vercel.app/login

---

## ⚠️ Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Re-pull environment variables
vercel env pull .env.vercel.local

# Regenerate Prisma client
npx prisma generate
```

### Build Failures
```bash
# Clean all caches
npm run clean:all

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Port Already in Use
```bash
# Kill existing server
npm run kill-server

# Or use a different port
npm run dev -- -p 3002
```

### Seed Failures
```bash
# Force reset and reseed
npx prisma db push --force-reset
npx prisma db seed
npm run db:verify
```

---

## 📁 Important Files

- **`.env.vercel.local`** - Environment variables (don't commit!)
- **`prisma/schema.prisma`** - Database schema
- **`prisma/seed-basic.ts`** - Seed script
- **`src/lib/database/index.ts`** - Database singleton
- **`package.json`** - Project scripts

---

## 🔐 Security Notes

1. ⚠️ **Never commit `.env.vercel.local`** to git
2. 🔑 Change default passwords in production
3. 🛡️ Use strong passwords for all accounts
4. 📝 Keep credentials secure

---

## 📚 Documentation

- **Full Setup:** `DATABASE_SETUP_COMPLETE.md`
- **Deployment Guide:** `DEPLOYMENT_SUCCESS_PATTERN.md`
- **Monitoring:** `DEPLOYMENT_MONITORING.md`
- **API Docs:** `docs/api/`

---

## ✅ Health Check

Run this anytime to verify your setup:

```bash
npm run db:verify
```

Expected output:
- ✅ 5 users
- ✅ 6 farms
- ✅ 30 products
- ✅ 9 reviews
- ✅ Admin account found

---

## 🆘 Need Help?

1. Check `DATABASE_SETUP_COMPLETE.md` for detailed docs
2. Run `npm run db:verify` to diagnose issues
3. Check error logs in `.next/` directory
4. Review Vercel deployment logs

---

## 🎯 Quick Test Workflow

```bash
# 1. Setup
vercel env pull .env.vercel.local
npx prisma generate
npm run db:reset
npm run db:verify

# 2. Start development
npm run dev

# 3. Test login
# Go to http://localhost:3001/login
# Use: gogsia@gmail.com / Admin123!

# 4. Browse farms
# Go to http://localhost:3001/farms

# 5. Success! 🎉
```

---

**Last Updated:** January 10, 2025  
**Status:** ✅ Database Operational  
**Version:** 1.0.0