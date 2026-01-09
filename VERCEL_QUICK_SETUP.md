# 🚀 Vercel Quick Setup - Test Database

**5-Minute Setup Guide**

---

## ⚡ Fastest Method: Use Cloud Database

### Option 1: Vercel Postgres (Recommended)

1. **Create Database in Vercel**
   ```bash
   # Go to: https://vercel.com/dashboard
   # Click: Storage → Create Database → Postgres
   # Select: Same region as your app
   ```

2. **Auto-Configuration**
   - Vercel automatically adds environment variables
   - No manual configuration needed!

3. **Seed Database**
   ```bash
   vercel env pull .env.vercel.local
   npx prisma migrate deploy
   npm run db:seed
   ```

4. **Done!** ✅

---

### Option 2: Supabase (Free Tier)

1. **Create Project**
   - Go to: https://supabase.com
   - Create new project
   - Enable PostGIS extension

2. **Get Connection String**
   ```
   Settings → Database → Connection String
   ```

3. **Add to Vercel**
   ```bash
   vercel env add DATABASE_URL preview
   # Paste your Supabase connection string

   vercel env add NEXTAUTH_SECRET preview
   # Generate: openssl rand -base64 32

   vercel env add AUTH_TRUST_HOST preview
   # Enter: true
   ```

4. **Deploy**
   ```bash
   git push origin master
   ```

---

## 🔧 Manual Setup (If Using Local Database)

### Step 1: Expose Local Database

```bash
# Install ngrok
npm install -g ngrok

# Expose PostgreSQL
ngrok tcp 5433

# Copy the URL (e.g., tcp://0.tcp.ngrok.io:12345)
```

### Step 2: Configure Vercel

```bash
# Add environment variables
vercel env add DATABASE_URL preview
# Enter: postgresql://postgres:test_password_123@0.tcp.ngrok.io:12345/farmersmarket_test

vercel env add NEXTAUTH_SECRET preview
# Enter: openssl rand -base64 32 (generate a random secret)

vercel env add AUTH_TRUST_HOST preview
# Enter: true
```

### Step 3: Deploy

```bash
git push origin master
```

---

## ✅ Verify Setup

### Test Database Connection

```bash
# Check environment variables
vercel env ls

# Test API
curl https://your-app.vercel.app/api/auth/session
```

### Test Login

1. Go to: `https://your-app.vercel.app/login`
2. Use credentials from `CREDENTIALS_QUICK_REF.txt`
3. Try: `farmer1@example.com` / `Farmer123!`

---

## 📋 Required Environment Variables

**Minimum Required:**
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - 32+ char random string
- `AUTH_TRUST_HOST` - Set to `true`

**Recommended:**
- `DIRECT_URL` - Direct DB connection (for migrations)
- `SKIP_ENV_VALIDATION` - Set to `true` for builds

**Auto-Set by Vercel:**
- `VERCEL_URL` - Deployment URL
- `VERCEL_ENV` - Environment (preview/production)

---

## 🎯 Quick Commands

```bash
# Link project
vercel link

# Add environment variable
vercel env add DATABASE_URL preview

# Pull environment variables
vercel env pull .env.vercel.local

# List environment variables
vercel env ls

# Deploy
vercel --prod

# View logs
vercel logs
```

---

## 🐛 Troubleshooting

### "Can't reach database"
- Check ngrok is running (if using local DB)
- Verify DATABASE_URL is correct
- Test: `psql $DATABASE_URL`

### "Authentication failed"
- Generate new NEXTAUTH_SECRET: `openssl rand -base64 32`
- Add to Vercel: `vercel env add NEXTAUTH_SECRET preview`

### "Prisma not found"
- Redeploy: `vercel --force`
- Check build logs: `vercel logs`

### "Migration failed"
- Run manually: `npx prisma migrate deploy`
- Check database permissions

---

## 📚 Full Documentation

For detailed setup instructions, see:
- `docs/VERCEL_DATABASE_SETUP.md` - Complete guide
- `CREDENTIALS_QUICK_REF.txt` - Test credentials
- `TEST_CREDENTIALS.md` - Detailed credential docs

---

## 🚀 One-Command Setup

Use our automated script:

```bash
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

---

## ⚠️ Security Notes

**For Testing (Preview):**
- ✅ Use test database with sample data
- ✅ Use weak passwords for test accounts
- ✅ Keep ngrok tunnel temporary

**For Production:**
- ❌ Never use local database
- ✅ Use cloud database (Vercel Postgres, Supabase)
- ✅ Use strong, unique passwords
- ✅ Enable SSL: `?sslmode=require`
- ✅ Rotate NEXTAUTH_SECRET regularly

---

## 📞 Need Help?

- **Vercel Issues:** https://vercel.com/support
- **Database Issues:** See `docs/VERCEL_DATABASE_SETUP.md`
- **Auth Issues:** Run `npm run debug:auth`

---

**Last Updated:** 2026-01-09
**Status:** ✅ Ready to use
