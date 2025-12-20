# ⚡ Vercel Quick Start - 5 Minute Deploy

**Fast track deployment guide for the Farmers Market Platform**

---

## 🎯 Prerequisites (2 minutes)

- [ ] GitHub account with repository pushed
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] PostgreSQL database URL ready
- [ ] Stripe API keys (test mode is fine)

---

## 🚀 Deploy in 5 Steps

### Step 1: Database (Pick One)

**Neon (Recommended):**

```
1. Go to https://neon.tech
2. Sign up → Create Project
3. Copy connection string
```

**Vercel Postgres:**

```
1. Vercel Dashboard → Storage → Create Database
2. Select Postgres
3. Copy POSTGRES_PRISMA_URL
```

---

### Step 2: Import Project to Vercel

```
1. Visit https://vercel.com/new
2. Import your GitHub repository
3. Framework: Next.js (auto-detected)
4. Don't click Deploy yet!
```

---

### Step 3: Add Environment Variables

Go to: **Configure Project → Environment Variables**

Add these 6 required variables:

```bash
# 1. Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# 2. Auth Secret (generate new)
NEXTAUTH_SECRET=your-32-character-random-string

# 3. Auth URL (update after deploy)
NEXTAUTH_URL=https://your-project.vercel.app

# 4. Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx

# 5. Stripe Publishable Key
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx

# 6. Public Stripe Key (same as #5)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
```

**Generate NEXTAUTH_SECRET:**

```bash
# Mac/Linux/Git Bash
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))
```

**Apply to:** ✅ Production ✅ Preview ✅ Development

---

### Step 4: Deploy

Click **"Deploy"** button and wait 6-8 minutes.

---

### Step 5: Initialize Database

After deployment succeeds:

```bash
# Set your database URL
export DATABASE_URL="your_production_database_url"

# Push schema
npx prisma db push

# Seed initial data
npm run db:seed:basic
```

---

## ✅ Verification Checklist

Visit your site: `https://your-project.vercel.app`

```
☐ Homepage loads
☐ Can sign up
☐ Can log in
☐ Can view marketplace
☐ No console errors
```

---

## 🚨 Common Issues

### Build fails: "DATABASE_URL not found"

**Fix:** Add DATABASE_URL in Vercel environment variables, then redeploy.

### 500 error on live site

**Fix:** Check Vercel logs. Usually missing env variables or wrong DATABASE_URL format.

### Database connection timeout

**Fix:** Ensure DATABASE_URL includes `?sslmode=require` for Neon/Railway.

---

## 🎯 Test Credentials (After Seeding)

```
Admin:
Email: admin@farmersmarket.com
Password: Admin123!

Farmer:
Email: farmer1@example.com
Password: Farmer123!

Customer:
Email: customer1@example.com
Password: Customer123!
```

---

## 📚 Need More Help?

- **Full Guide:** `VERCEL_DEPLOYMENT_GUIDE.md`
- **Troubleshooting:** `DEPLOYMENT_CHECKLIST.md`
- **Database Setup:** `DATABASE_SETUP.md`

---

## 🎉 You're Done!

Your Farmers Market Platform is now live on Vercel! 🚀🌾

**Next Steps:**

1. Update NEXTAUTH_URL with your actual domain
2. Test all features thoroughly
3. Add custom domain (optional)
4. Enable monitoring and analytics
5. Replace test data with real farms/products

---

**Deployment Time:** ~15 minutes total
**Build Time:** 6-8 minutes
**Status:** ✅ Production Ready

Last Updated: January 2025
