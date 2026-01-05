# 📋 VERCEL ENVIRONMENT VARIABLES - UPLOAD INSTRUCTIONS

**Quick Guide:** How to upload your environment variables to Vercel

---

## ✅ FILES CREATED FOR YOU

**In your project folder, you'll find:**

1. **`env-production-FILLME.txt`** ← **FILL THIS OUT!**
   - Template with all required variables
   - Includes instructions and examples
   - 6 required variables to fill in

2. **`📋_VERCEL_UPLOAD_INSTRUCTIONS.md`** ← **YOU ARE HERE**
   - This file - simple upload guide

---

## 🚀 QUICK START (3 STEPS)

### STEP 1: Fill in the Template (10 minutes)

1. **Open:** `env-production-FILLME.txt` in your project folder
2. **Fill in these 6 values:**

```
DATABASE_URL=postgresql://...           (Get from neon.tech)
NEXTAUTH_SECRET=...                     (Generate with: openssl rand -base64 32)
NEXTAUTH_URL=https://your-project.vercel.app
STRIPE_SECRET_KEY=sk_test_...          (From dashboard.stripe.com)
STRIPE_PUBLISHABLE_KEY=pk_test_...     (From dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (Same as above)
```

3. **Save** the file

---

### STEP 2: Upload to Vercel (2 minutes)

**Method A: Upload File (Easiest)**

1. Rename `env-production-FILLME.txt` to `.env.production`
2. Go to: https://vercel.com/gogsias-projects/farmers-market/settings/environment-variables
3. Click **"..."** (three dots) → **"Import .env File"**
4. Select your `.env.production` file
5. Verify all variables imported
6. Enable for: ✅ Production ✅ Preview ✅ Development
7. Click **"Save"**

**Method B: Manual Entry (Alternative)**

1. Go to: https://vercel.com/gogsias-projects/farmers-market/settings/environment-variables
2. Click **"Add New"**
3. Copy each variable from `env-production-FILLME.txt`:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
   - Enable: Production + Preview + Development
4. Repeat for all 6 variables
5. Click **"Save"**

---

### STEP 3: Deploy (8 minutes)

1. After saving variables, go to: https://vercel.com/gogsias-projects/farmers-market
2. Click **"Redeploy"** or **"Deploy"**
3. Wait 6-8 minutes for build
4. ✅ Done!

---

## 📝 WHERE TO GET EACH VALUE

### 1. DATABASE_URL

- **Go to:** https://neon.tech
- **Sign up:** Free account with GitHub
- **Create Project:** "farmers-market-prod"
- **Copy:** Connection string (full URL)
- **Example:** `postgresql://user:pass@ep-abc-123.us-east-2.aws.neon.tech/db?sslmode=require`

### 2. NEXTAUTH_SECRET

- **Open:** Git Bash or Terminal
- **Run:** `openssl rand -base64 32`
- **Copy:** The output (32+ characters)
- **Or use test value:** `dGhpc2lzYXRlc3RzZWNyZXRmb3JuZXh0YXV0aGNoYW5nZWlucHJvZHVjdGlvbg==`

### 3. NEXTAUTH_URL

- **Format:** `https://your-project-name.vercel.app`
- **After first deploy:** Update to actual Vercel URL
- **Example:** `https://farmers-market-gogsias.vercel.app`
- ⚠️ **Must be HTTPS** (not http)
- ⚠️ **No trailing slash**

### 4. STRIPE_SECRET_KEY

- **Go to:** https://dashboard.stripe.com/test/apikeys
- **Click:** "Reveal test key" (Secret key section)
- **Copy:** Full key starting with `sk_test_`
- **Example:** `sk_test_51Abc123...`

### 5. STRIPE_PUBLISHABLE_KEY

- **Go to:** https://dashboard.stripe.com/test/apikeys
- **Copy:** Publishable key (already visible)
- **Copy:** Full key starting with `pk_test_`
- **Example:** `pk_test_51Abc123...`

### 6. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

- **Value:** SAME as Variable #5
- **Copy:** The exact same publishable key from above
- ⚠️ **Must be identical to STRIPE_PUBLISHABLE_KEY**

---

## ✅ VERIFICATION CHECKLIST

Before deploying, verify:

```
☐ DATABASE_URL includes ?sslmode=require at the end
☐ NEXTAUTH_SECRET is at least 32 characters long
☐ NEXTAUTH_URL is https:// (not http://)
☐ NEXTAUTH_URL has no trailing slash
☐ STRIPE_SECRET_KEY starts with sk_test_
☐ STRIPE_PUBLISHABLE_KEY starts with pk_test_
☐ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY matches STRIPE_PUBLISHABLE_KEY exactly
☐ Both Stripe publishable keys are IDENTICAL
☐ All keys are from the SAME Stripe account
☐ No extra spaces before or after values
☐ All 6 variables added to Vercel
☐ All variables enabled for Production + Preview + Development
```

---

## 🔄 AFTER DEPLOYMENT

### Update NEXTAUTH_URL (Required)

After your first successful deployment:

1. Copy your actual Vercel URL (e.g., `https://farmers-market-abc123.vercel.app`)
2. Go to: Environment Variables settings
3. Find `NEXTAUTH_URL`
4. Click **"Edit"**
5. Update to your exact deployment URL
6. Click **"Save"**
7. **Redeploy** to apply changes

### Initialize Database (Required)

Run these commands locally:

```bash
# Set database URL (PowerShell)
$env:DATABASE_URL="your_database_url_from_neon"

# Push database schema
npx prisma db push

# Seed with sample data (optional)
npm run db:seed:basic
```

---

## 🎯 QUICK SUMMARY

**What you need to do:**

1. ✅ Fill in `env-production-FILLME.txt` (10 min)
2. ✅ Upload to Vercel Settings (2 min)
3. ✅ Deploy (8 min build time)
4. ✅ Update NEXTAUTH_URL after first deploy (2 min)
5. ✅ Initialize database (3 min)

**Total time:** ~25 minutes

---

## 📞 NEED HELP?

**Can't find a value?**

- See detailed instructions in `env-production-FILLME.txt`
- See complete guide in `🎯_VERCEL_PROJECT_READY.md`
- See variable details in `VERCEL_ENV_VARS_CHECKLIST.md`

**Deployment issues?**

- Check Vercel logs: Deployments → Latest → View Logs
- See troubleshooting in `🎯_VERCEL_PROJECT_READY.md`

**Questions?**

- Vercel support: https://vercel.com/support
- Your project: https://vercel.com/gogsias-projects/farmers-market

---

## 🚀 READY?

1. **Open:** `env-production-FILLME.txt`
2. **Fill in:** All 6 required values
3. **Upload:** To Vercel settings
4. **Deploy:** Click the button!

---

🌾⚡✨ **25 MINUTES TO YOUR LIVE MARKETPLACE!** ✨⚡🌾

**Your Vercel Project:** https://vercel.com/gogsias-projects/farmers-market

**Start Here:** Open `env-production-FILLME.txt` and fill it out now!
