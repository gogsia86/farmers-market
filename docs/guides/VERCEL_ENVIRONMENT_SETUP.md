# 🚀 Vercel Environment Variables Setup Guide

## Required Environment Variables for Deployment

### 1. Database Configuration

```bash
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

**Where to get it:**

- **Vercel Postgres**: Dashboard → Storage → Connect → Copy connection string
- **External**: Your PostgreSQL hosting provider (Supabase, Neon, Railway, etc.)

**⚠️ Important**: Make sure the database is accessible from Vercel's IP addresses

---

### 2. NextAuth Configuration

```bash
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-generated-secret"
```

**Generate NEXTAUTH_SECRET:**

```bash
# Run this in terminal:
openssl rand -base64 32
```

**Or use this PowerShell command:**

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

### 3. Public App URLs

```bash
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app/api"
```

---

### 4. Stripe Payment (if using payments)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Where to get it:**

- Dashboard: https://dashboard.stripe.com/test/apikeys
- Webhook: https://dashboard.stripe.com/test/webhooks

---

### 5. Email Configuration (Optional but recommended)

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@farmersmarket.app"
```

---

### 6. Sentry Error Tracking (Optional)

```bash
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="farmers-market"
```

---

### 7. Build Configuration

```bash
NODE_ENV="production"
SKIP_ENV_VALIDATION="1"
NEXT_TELEMETRY_DISABLED="1"
```

---

## 📋 Quick Setup Steps

### Option 1: Using Vercel Dashboard (Recommended)

1. **Go to your Vercel project:**
   https://vercel.com/medicis-projects/farmers_market

2. **Navigate to Settings → Environment Variables**

3. **Add each variable:**
   - Click "Add New"
   - Enter variable name
   - Enter value
   - Select environments (Production, Preview, Development)
   - Click "Save"

4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Select "Redeploy"

---

### Option 2: Using Vercel CLI

```bash
# Set a single variable
vercel env add DATABASE_URL production

# Import from file
vercel env pull .env.vercel

# List all variables
vercel env ls
```

---

## 🔐 Security Best Practices

### ✅ DO:

- Use different secrets for development/production
- Rotate secrets regularly
- Use strong, randomly generated secrets
- Enable 2FA on your Vercel account
- Use Vercel's built-in secret management

### ❌ DON'T:

- Commit `.env` files to Git
- Share secrets in plain text
- Use development secrets in production
- Reuse secrets across projects

---

## 🗄️ Database Setup for Vercel

### Option 1: Vercel Postgres (Easiest)

```bash
# In Vercel Dashboard:
1. Go to Storage tab
2. Click "Create Database"
3. Select "Postgres"
4. Copy the connection string
5. Add to Environment Variables as DATABASE_URL
```

### Option 2: External Database (Supabase, Neon, etc.)

```bash
# Make sure to:
1. Whitelist Vercel's IP addresses
2. Enable SSL connections
3. Use connection pooling for better performance
4. Set DATABASE_URL with proper connection string
```

---

## 🔄 After Adding Environment Variables

1. **Redeploy your application:**

   ```bash
   vercel --prod
   ```

2. **Run database migrations:**

   ```bash
   # Option A: Manually in Vercel's terminal
   npx prisma migrate deploy

   # Option B: Add to package.json build script
   "build": "prisma migrate deploy && next build"
   ```

3. **Verify the deployment:**
   - Check health endpoint: `https://your-app.vercel.app/api/health`
   - Test database connection
   - Verify authentication works

---

## 🐛 Troubleshooting

### Build fails with "DATABASE_URL not found"

**Solution:** Add `SKIP_ENV_VALIDATION=1` to build environment variables

### Prisma errors during build

**Solution:** Add to package.json:

```json
{
  "scripts": {
    "postinstall": "prisma generate || echo 'Prisma generate failed, continuing...'"
  }
}
```

### Database connection timeout

**Solution:**

- Check if database is accessible from Vercel
- Use connection pooling
- Increase timeout in Prisma schema

### NEXTAUTH_URL mismatch

**Solution:** Make sure `NEXTAUTH_URL` matches your actual domain:

- Production: `https://your-domain.vercel.app`
- Preview: `https://your-preview-url.vercel.app`

---

## 📝 Minimum Required Variables for Basic Deployment

```bash
# Absolute minimum to get started:
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secret-here"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
SKIP_ENV_VALIDATION="1"
```

---

## 🎯 Recommended Variables for Full Functionality

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secret"

# App URLs
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_API_URL="https://your-app.vercel.app/api"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@farmersmarket.app"

# Payments (if needed)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Build config
NODE_ENV="production"
SKIP_ENV_VALIDATION="1"
```

---

## 🚀 Quick Start Script

Run this to generate a NEXTAUTH_SECRET:

**Windows (PowerShell):**

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Mac/Linux:**

```bash
openssl rand -base64 32
```

---

## 📞 Need Help?

- **Vercel Documentation**: https://vercel.com/docs/concepts/projects/environment-variables
- **NextAuth Configuration**: https://next-auth.js.org/configuration/options
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

---

## ✅ Deployment Checklist

- [ ] Database created and accessible
- [ ] `DATABASE_URL` added to Vercel
- [ ] `NEXTAUTH_SECRET` generated and added
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] Email configuration added (if using emails)
- [ ] Stripe keys added (if using payments)
- [ ] Environment variables set for all environments
- [ ] Application redeployed
- [ ] Health check endpoint returns 200
- [ ] Login functionality tested
- [ ] Database migrations applied
