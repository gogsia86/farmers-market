# 🗄️ Database Setup Guide - Quick Start

## Problem

The admin login isn't working because there's no database connection. You need to set up a PostgreSQL database.

---

## ✅ **Recommended: Use Vercel Postgres (FREE)**

### **Step 1: Create Vercel Postgres Database**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `farmers-market-platform-web-and-7mqi5sdcm`
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Postgres** → Click **Continue**
6. Choose **Free** plan → Click **Create**

### **Step 2: Get Connection String**

1. Once created, click on your database
2. Go to **`.env.local`** tab
3. Copy the `POSTGRES_PRISMA_URL` value
4. It looks like: `postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require`

### **Step 3: Update Local Environment**

1. Open `.env.local` file in your project
2. Replace the `DATABASE_URL` with your Vercel Postgres URL:

```bash
DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### **Step 4: Run Database Migration**

```powershell
# Navigate to project root
cd "M:\Repo\Farmers Market Platform web and app"

# Run Prisma migration
npx prisma migrate deploy

# Seed the database with admin user
npx prisma db seed
```

### **Step 5: Restart Dev Server**

```powershell
npm run dev
```

### **Step 6: Login**

- **URL**: http://localhost:3000/admin-login
- **Email**: `admin@farmersmarket.app`
- **Password**: `DivineAdmin123!`

---

## 🐘 **Alternative: Install PostgreSQL Locally**

### **Option A: Docker (Recommended)**

```powershell
# Pull PostgreSQL image
docker pull postgres:15

# Run PostgreSQL container
docker run --name farmers-market-db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=farmers_market `
  -p 5432:5432 `
  -d postgres:15

# Verify it's running
docker ps
```

Your `.env.local` will work as-is:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmers_market?schema=public"
```

Then run migrations:

```powershell
npx prisma migrate deploy
npx prisma db seed
```

### **Option B: Install PostgreSQL Directly**

1. Download: [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Remember your password during installation
4. Create database:

```powershell
# Open psql
psql -U postgres

# Create database
CREATE DATABASE farmers_market;
\q
```

5. Update `.env.local` with your password:

```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/farmers_market?schema=public"
```

6. Run migrations:

```powershell
npx prisma migrate deploy
npx prisma db seed
```

---

## 🎯 **Quickest Solution**

**Use Vercel Postgres** - It's:

- ✅ FREE (10,000 rows)
- ✅ No installation needed
- ✅ Already integrated with your Vercel deployment
- ✅ Works for both dev and production
- ✅ Auto-scaling
- ✅ Automatic backups

Just copy the connection string from Vercel dashboard → Update `.env.local` → Run migrations → Done!

---

## 🔍 **Verify Database Connection**

After setting up, test the connection:

```powershell
npx prisma db pull
```

If successful, you'll see:

```
✔ Introspected 25 models and wrote them into prisma/schema.prisma
```

---

## 🎊 **Next Steps After Setup**

1. ✅ Run migrations: `npx prisma migrate deploy`
2. ✅ Seed database: `npx prisma db seed`
3. ✅ Restart server: `npm run dev`
4. ✅ Login at: http://localhost:3000/admin-login
5. ✅ Credentials: `admin@farmersmarket.app` / `DivineAdmin123!`

---

## 📞 **Troubleshooting**

### **"Invalid credentials" error**

- Database is empty → Run seed: `npx prisma db seed`

### **"Can't reach database" error**

- Check `DATABASE_URL` in `.env.local`
- For local PostgreSQL: Ensure it's running
- For Vercel: Check connection string is correct

### **"Table doesn't exist" error**

- Run migrations: `npx prisma migrate deploy`

---

**Status**: Choose your setup method and follow the steps above! 🚀
