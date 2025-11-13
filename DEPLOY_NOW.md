# 🚀 DEPLOY NOW - Quick Start Guide

## ⚡ Fastest Path to Deployment (5 minutes)

### Option 1: Deploy with Vercel CLI (RECOMMENDED)

```powershell
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project root
cd "M:\Repo\Farmers Market Platform web and app"
vercel --prod

# Follow the prompts:
# - Set up and deploy? → Yes
# - Which scope? → Select your account  
# - Link to existing project? → No
# - Project name? → farmers-market
# - Directory? → ./
# - Override settings? → No
```

**That's it!** Your site will be deployed in 2-3 minutes.

---

### Option 2: Deploy via GitHub

```powershell
# 1. Create GitHub repository at https://github.com/new
#    - Name: farmers-market
#    - Private repository
#    - DO NOT initialize with README

# 2. Update git remote (replace YOUR-USERNAME)
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/farmers-market.git

# 3. Push to GitHub
git push -u origin master

# 4. Import to Vercel
#    - Go to https://vercel.com/new
#    - Click "Import Git Repository"
#    - Select your repository
#    - Click "Deploy"
```

---

## ⚙️ CRITICAL: Configure Environment Variables

**After deployment, go to Vercel Dashboard → Settings → Environment Variables**

### Minimum Required Variables:

```env
# Database (choose one option below)
DATABASE_URL=postgresql://username:password@host:5432/database

# Authentication
NEXTAUTH_SECRET=YOUR_32_CHAR_RANDOM_SECRET
NEXTAUTH_URL=https://your-project.vercel.app

# Application
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### Generate NEXTAUTH_SECRET:

```powershell
# Run this command:
openssl rand -base64 32

# Or online: https://generate-secret.vercel.app/32
```

### Database Options:

#### Option A: Vercel Postgres (Easiest)
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Database automatically connects to your project!

#### Option B: Neon (Free Tier)
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Add as DATABASE_URL in Vercel

---

## 🔄 After Adding Variables

1. Vercel Dashboard → Deployments
2. Latest deployment → Click ⋮ → Redeploy
3. Wait 2-3 minutes
4. Done! ✅

---

## ✅ Verify Deployment

```powershell
# Test your deployed site
curl https://your-project.vercel.app

# Should return your homepage HTML
```

---

## 📋 Quick Reference

| Task | Command/Link |
|------|-------------|
| Deploy via CLI | `vercel --prod` |
| Import from GitHub | https://vercel.com/new |
| Add Environment Variables | Vercel Dashboard → Settings → Environment Variables |
| View Build Logs | Vercel Dashboard → Deployments → Latest |
| Generate Secret | `openssl rand -base64 32` |
| Database (Vercel) | Dashboard → Storage → Create Database |
| Database (Neon) | https://neon.tech |

---

## 🆘 Common Issues

### "Repository not found" (GitHub)
- Create repository first at https://github.com/new
- Update git remote URL

### "DATABASE_URL not defined"
- Add DATABASE_URL to Vercel environment variables
- Redeploy after adding

### "Build failed"
- Check build logs in Vercel Dashboard
- Verify all environment variables are set
- Clear cache and redeploy

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test the live site
2. ✅ Run database migrations: `npx prisma migrate deploy`
3. ✅ Add custom domain (optional)
4. ✅ Set up monitoring/analytics

---

**🎉 Your site is live!** Check `DEPLOYMENT_STEPS_COMPLETE.md` for detailed guides.
