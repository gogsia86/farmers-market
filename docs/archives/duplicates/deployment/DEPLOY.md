# 🚀 DEPLOYMENT GUIDE

## Simple, Clean Deployment to Vercel

## 🚀 Deployment Guide

This guide covers deployment to production environments with proper security,
monitoring, and CI/CD automation.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (for caching)
- Domain with SSL certificate
- Production server (VPS, cloud instance, or container platform)

---

## 🎯 Deployment Steps

### 1. Prepare Your Code

```powershell
# Ensure all changes are committed
git status
git add .
git commit -m "Ready for deployment"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `farmers-market-platform`
3. Visibility: Private (recommended)
4. **DO NOT** initialize with README
5. Click "Create repository"

### 3. Push to GitHub

```powershell
# Add GitHub remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/farmers-market-platform.git

# Push code
git push -u origin master
```

### 4. Deploy to Vercel

1. Visit https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository: `farmers-market-platform`
4. Framework: Next.js (auto-detected)
5. Click "Deploy"

⚠️ **First deployment will fail** - that's expected. We need to add environment variables.

### 5. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

#### Required Variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
NEXTAUTH_SECRET=your-random-32-char-secret
NEXTAUTH_URL=https://your-project.vercel.app
```

#### Generate NEXTAUTH_SECRET:

```powershell
openssl rand -base64 32
```

#### Database Options:

- **Easy**: Vercel Postgres (Dashboard → Storage → Create Database)
- **Free**: Neon.tech or Supabase

### 6. Redeploy

1. Go to Deployments tab
2. Click latest deployment → ⋮ menu → Redeploy
3. Wait 2-3 minutes

### 7. Run Database Migrations

```powershell
# Install Vercel CLI
npm install -g vercel

# Link to project
vercel link

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy
```

---

## ✅ Verification

Visit your deployment URL and verify:

- Homepage loads
- API routes work: `/api/health`
- Database connection successful

---

## 🆘 Troubleshooting

**Build fails?**

- Check environment variables are set
- Verify DATABASE_URL format
- Clear cache and redeploy

**Database issues?**

- Add `?sslmode=require` to DATABASE_URL
- Verify migrations ran successfully
- Check database firewall settings

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**That's it!** Your platform should now be live. 🎉
