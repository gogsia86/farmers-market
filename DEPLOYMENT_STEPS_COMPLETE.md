# 🚀 COMPLETE VERCEL DEPLOYMENT GUIDE

## ✅ STATUS: All Code Fixes Applied

All necessary code fixes have been completed and committed locally:
- ✅ `.npmrc` fixed (removed Windows-only PowerShell config)
- ✅ `middleware.ts` fixed (proper regex escaping with String.raw)
- ✅ `vercel.json` optimized (added region config)
- ✅ Prisma client generation configured
- ✅ All TypeScript/ESLint issues resolved

---

## 📋 STEP-BY-STEP DEPLOYMENT PROCESS

### **Step 1: Create GitHub Repository**

Since the remote repository doesn't exist yet, you have two options:

#### Option A: Create New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `farmers-market` (or your preferred name)
3. Keep it **Private** (recommended for production code)
4. **DO NOT** initialize with README (we have code already)
5. Click "Create repository"

6. Update your local git remote:
```powershell
# Remove old remote
git remote remove origin

# Add new remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/farmers-market.git

# Push to GitHub
git push -u origin master
```

#### Option B: Use Vercel Git Integration Directly

Skip GitHub and deploy directly from local:

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (this will create a new project)
vercel --prod
```

---

### **Step 2: Configure Vercel Project**

#### If Using GitHub Integration:

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository: `YOUR-USERNAME/farmers-market`
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: Leave empty
6. Build Settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`
   - Install Command: `npm ci`
7. Click "Deploy" (it will fail initially - that's expected)

#### If Using Vercel CLI:

```powershell
# From project root
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? farmers-market (or your choice)
# - Directory? ./
# - Want to override settings? No
```

---

### **Step 3: Configure Environment Variables**

This is the **MOST CRITICAL** step. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

#### **Required Variables:**

```env
# Database (CRITICAL - Must be configured first!)
DATABASE_URL=postgresql://username:password@host:5432/database

# NextAuth (CRITICAL - Required for authentication)
NEXTAUTH_SECRET=YOUR_RANDOM_32_CHAR_SECRET
NEXTAUTH_URL=https://your-project.vercel.app

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
```

#### **Generate NEXTAUTH_SECRET:**

```powershell
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

#### **Optional but Recommended:**

```env
# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Error Tracking
SENTRY_DSN=https://...
SENTRY_ORG=your-org
SENTRY_PROJECT=farmers-market

# Email (SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com

# AI Services
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
```

**Important:** Set all variables to apply to:
- ✅ Production
- ✅ Preview
- ✅ Development

---

### **Step 4: Database Setup**

#### Option A: Use Vercel Postgres (Easiest)

1. In Vercel Dashboard → Storage
2. Click "Create Database" → "Postgres"
3. Choose your region (iad1 recommended for US East)
4. Database name: `farmers-market-db`
5. **Vercel automatically adds DATABASE_URL to your project!**
6. Skip to Step 5

#### Option B: Use External Database (Neon, Supabase, Railway)

**Using Neon (Recommended for free tier):**

1. Go to https://neon.tech
2. Create account and new project
3. Project name: `farmers-market`
4. Region: Choose closest to your users
5. Copy the connection string
6. Add to Vercel: DATABASE_URL=postgresql://...

**Connection String Format:**
```
postgresql://username:password@host:5432/database?sslmode=require
```

**Important:** Most hosted PostgreSQL requires `?sslmode=require` at the end

---

### **Step 5: Run Database Migrations**

After database is configured and environment variables are set:

#### Method 1: Via Vercel CLI (Recommended)

```powershell
# Install Vercel CLI if not already installed
npm install -g vercel

# Link to your Vercel project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

#### Method 2: One-Time Deployment Script

Add this to your `package.json`:

```json
{
  "scripts": {
    "postdeploy": "npx prisma migrate deploy"
  }
}
```

Then trigger a redeploy in Vercel Dashboard.

---

### **Step 6: Redeploy with Environment Variables**

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find latest deployment → Click three dots (⋮) → Redeploy
3. Check "Use existing Build Cache" → Redeploy
4. Wait 2-5 minutes for build to complete

---

### **Step 7: Verify Deployment**

#### Check Build Logs:

1. Vercel Dashboard → Deployments → Latest
2. Click "Building" to see real-time logs
3. Look for:
   - ✅ `prisma generate` success
   - ✅ `npm run build` success
   - ✅ No TypeScript/ESLint errors
   - ✅ Deployment successful

#### Test Your Site:

```powershell
# Homepage
curl https://your-project.vercel.app

# API health check
curl https://your-project.vercel.app/api/health

# If you have a farms endpoint
curl https://your-project.vercel.app/api/farms
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Build Fails with "Prisma Client not generated"

**Solution:**
1. Check `vercel.json` has correct installCommand
2. Verify `DATABASE_URL` is set in environment variables
3. Clear Vercel cache: Settings → Delete Cache → Redeploy

### Issue 2: Database Connection Timeout

**Solution:**
1. Verify `DATABASE_URL` format is correct
2. Add `?sslmode=require` for hosted databases
3. Check database firewall allows Vercel IPs
4. For Vercel Postgres: Should work automatically

### Issue 3: NEXTAUTH_SECRET Error

**Solution:**
1. Generate new secret: `openssl rand -base64 32`
2. Add to Vercel environment variables
3. Apply to all environments (Production, Preview, Development)
4. Redeploy

### Issue 4: "Module not found" After Deployment

**Solution:**
1. Clear Vercel cache: Settings → Delete Cache
2. Check `package.json` dependencies are correct
3. Run locally: `npm ci && npm run build`
4. If builds locally, redeploy to Vercel

### Issue 5: Environment Variables Not Working

**Solution:**
1. Verify variables are set for correct environment (Production)
2. Check variable names match exactly (case-sensitive!)
3. Redeploy after adding/changing variables
4. Use `vercel env pull` to verify locally

---

## ⚡ OPTIMIZATION TIPS

### 1. Enable Edge Functions for API Routes

```typescript
// In specific API routes that don't need database
export const runtime = 'edge';
export const preferredRegion = 'iad1';
```

### 2. Configure ISR (Incremental Static Regeneration)

```typescript
// In page components
export const revalidate = 3600; // Revalidate every hour
```

### 3. Optimize Images

```typescript
// Already configured in next.config.mjs
// Vercel automatically optimizes images with their CDN
```

### 4. Add Caching Headers

```typescript
// In API routes
export async function GET(request: Request) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

---

## 📱 CUSTOM DOMAIN SETUP

### Step 1: Add Domain in Vercel

1. Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `yourdomain.com`
4. Click "Add"

### Step 2: Update DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600

Type: A (for root domain)
Name: @
Value: 76.76.21.21
TTL: 3600
```

### Step 3: Update Environment Variables

```env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 4: Redeploy

Git push or manual redeploy in Vercel Dashboard.

---

## ✅ FINAL DEPLOYMENT CHECKLIST

- [ ] GitHub repository created (or using Vercel CLI)
- [ ] Code pushed to GitHub (or deployed via CLI)
- [ ] Vercel project created and linked
- [ ] All environment variables configured:
  - [ ] DATABASE_URL
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL
  - [ ] Other optional variables
- [ ] Database provider selected (Vercel Postgres or external)
- [ ] Database migrations run successfully
- [ ] Build completed without errors
- [ ] Site is accessible at Vercel URL
- [ ] API endpoints working
- [ ] Authentication working (if applicable)
- [ ] Custom domain configured (optional)
- [ ] Error tracking setup (Sentry - optional)

---

## 🎉 SUCCESS!

Your Farmers Market platform should now be live on Vercel!

**Live URL:** `https://your-project.vercel.app`

**Next Steps:**
1. Test all critical user flows
2. Monitor build logs for any warnings
3. Set up custom domain (optional)
4. Configure error tracking with Sentry
5. Enable analytics in Vercel Dashboard

---

## 📞 SUPPORT RESOURCES

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma on Vercel:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Vercel Support:** https://vercel.com/support
- **Vercel Discord:** https://vercel.com/discord

---

**Need help?** Check the troubleshooting section above or consult Vercel's excellent documentation.
