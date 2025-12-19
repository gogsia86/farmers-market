# 🔐 VERCEL ENVIRONMENT VARIABLES - COPY & PASTE CHECKLIST

**Platform:** Farmers Market Platform  
**Deployment Target:** https://vercel.com/gogsias-projects  
**Last Updated:** January 2025

---

## ✅ REQUIRED ENVIRONMENT VARIABLES (6 Total)

Copy these into Vercel Dashboard → Settings → Environment Variables

**For ALL variables, enable:**

- ✅ Production
- ✅ Preview
- ✅ Development

---

### 1️⃣ DATABASE_URL

**Name:**

```
DATABASE_URL
```

**Value Format:**

```
postgresql://username:password@host:5432/database?sslmode=require
```

**Where to Get:**

- **Neon (Recommended):** https://neon.tech
  - Sign up → Create Project → Copy connection string
- **Vercel Postgres:** Dashboard → Storage → Create Database → Copy POSTGRES_PRISMA_URL
- **Railway:** https://railway.app → New Project → PostgreSQL → Copy DATABASE_URL

**Example:**

```
postgresql://user123:pass456@ep-cool-farm-123456.us-east-2.aws.neon.tech/farmersdb?sslmode=require
```

**Enable For:** ✅ Production ✅ Preview ✅ Development

---

### 2️⃣ NEXTAUTH_SECRET

**Name:**

```
NEXTAUTH_SECRET
```

**Value:** (Generate 32+ character random string)

**How to Generate:**

```bash
# Option 1: Git Bash (Recommended)
openssl rand -base64 32

# Option 2: PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Option 3: Use this test secret (CHANGE IN PRODUCTION!)
dGhpc2lzYXRlc3RzZWNyZXRmb3JuZXh0YXV0aGNoYW5nZWlucHJvZHVjdGlvbg==
```

**Example:**

```
7x9KpL3mN8qR2tV5wY1zA4cF6hJ9kM2nP5sT8vX0bD3gH7jL==
```

**Enable For:** ✅ Production ✅ Preview ✅ Development

---

### 3️⃣ NEXTAUTH_URL

**Name:**

```
NEXTAUTH_URL
```

**Value:**

```
https://your-project-name.vercel.app
```

**IMPORTANT:**

- After first deployment, update this to your EXACT Vercel URL
- Must be HTTPS (not http://)
- No trailing slash
- Match exactly or authentication will fail

**Example:**

```
https://farmers-market-gogsias.vercel.app
```

**Enable For:** ✅ Production ✅ Preview ✅ Development

---

### 4️⃣ STRIPE_SECRET_KEY

**Name:**

```
STRIPE_SECRET_KEY
```

**Value Format:**

```
sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to Get:**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Click "Reveal test key" for "Secret key"
3. Copy the full key starting with `sk_test_`

**For Production:** Use live key `sk_live_...` instead

**Example:**

```
sk_test_51Abc123DefGhiJklMnoPqrStuVwxYz0123456789AbCdEfGhIjKlMnOpQrStUvWxYz
```

**Enable For:** ✅ Production ✅ Preview ✅ Development

---

### 5️⃣ STRIPE_PUBLISHABLE_KEY

**Name:**

```
STRIPE_PUBLISHABLE_KEY
```

**Value Format:**

```
pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to Get:**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" (already visible, no reveal needed)
3. Copy the full key starting with `pk_test_`

**For Production:** Use live key `pk_live_...` instead

**Example:**

```
pk_test_51Abc123DefGhiJklMnoPqrStuVwxYz0123456789AbCdEfGhIjKlMnOpQrStUvWxYz
```

**Enable For:** ✅ Production ✅ Preview ✅ Development

---

### 6️⃣ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**Name:**

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**Value:**

```
[SAME VALUE AS STRIPE_PUBLISHABLE_KEY ABOVE]
```

**IMPORTANT:** This must be EXACTLY the same as Variable #5

**Why Two Variables?**

- `STRIPE_PUBLISHABLE_KEY` = Server-side use
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Browser/client-side use
- Both need the same Stripe publishable key

**Example:**

```
pk_test_51Abc123DefGhiJklMnoPqrStuVwxYz0123456789AbCdEfGhIjKlMnOpQrStUvWxYz
```

**Enable For:** ✅ Production ✅ Preview ✅ Development

---

## 📋 OPTIONAL ENVIRONMENT VARIABLES (Recommended)

### Email Service (Resend)

**Name:**

```
RESEND_API_KEY
```

**Value:**

```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to Get:** https://resend.com/api-keys

---

### Image Storage (Cloudinary)

**Names:**

```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

**Where to Get:** https://cloudinary.com/console/settings/security

**Example:**

```
CLOUDINARY_CLOUD_NAME=my-farm-images
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234
```

---

### Error Tracking (Sentry)

**Name:**

```
SENTRY_DSN
```

**Value:**

```
https://xxxxx@o123456.ingest.sentry.io/123456
```

**Where to Get:** https://sentry.io/settings/projects/

---

## ✅ VERIFICATION CHECKLIST

After adding all environment variables:

```
☐ DATABASE_URL added and enabled for all environments
☐ NEXTAUTH_SECRET added and enabled for all environments
☐ NEXTAUTH_URL added and enabled for all environments
☐ STRIPE_SECRET_KEY added and enabled for all environments
☐ STRIPE_PUBLISHABLE_KEY added and enabled for all environments
☐ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY added and enabled for all environments
☐ All variables have "Production" checkbox enabled
☐ All variables have "Preview" checkbox enabled
☐ All variables have "Development" checkbox enabled
☐ No typos in variable names (case-sensitive!)
☐ No extra spaces in values
☐ DATABASE_URL includes ?sslmode=require
☐ NEXTAUTH_SECRET is at least 32 characters
☐ Both Stripe publishable key variables have SAME value
```

---

## 🚀 DEPLOYMENT STEPS AFTER ADDING VARIABLES

1. **Review** all variables are correct
2. **Click** "Deploy" button in Vercel
3. **Wait** 6-8 minutes for build
4. **Update** NEXTAUTH_URL to actual deployment URL
5. **Redeploy** to apply updated NEXTAUTH_URL
6. **Initialize** database with Prisma
7. **Test** your live site!

---

## 🔧 COMMON ISSUES & SOLUTIONS

### Issue: Build fails with "DATABASE_URL not found"

**Solution:**

- Verify variable name is exactly `DATABASE_URL` (all caps)
- Check it's enabled for Production, Preview, AND Development
- Redeploy after adding

### Issue: Authentication doesn't work

**Solution:**

- Update NEXTAUTH_URL to match EXACT deployment URL
- No trailing slash
- Must be HTTPS
- Redeploy after updating

### Issue: Stripe checkout doesn't load

**Solution:**

- Verify all 3 Stripe variables are added
- Check both publishable key variables have SAME value
- Verify keys start with sk*test* and pk*test*
- Keys must be from same Stripe account

---

## 📞 QUICK REFERENCE

**Your Vercel Dashboard:** https://vercel.com/gogsias-projects

**Add Environment Variables:**

1. Go to your project
2. Settings tab
3. Environment Variables section
4. Add each variable one by one
5. Enable all three environments for each
6. Save

**After Adding All Variables:**

- Click "Deploy" or "Redeploy"
- Wait for build to complete
- Test your live site

---

## 🎯 MINIMUM VIABLE DEPLOYMENT

**To get your site running, you MUST have these 6 variables:**

```
1. DATABASE_URL ✅
2. NEXTAUTH_SECRET ✅
3. NEXTAUTH_URL ✅
4. STRIPE_SECRET_KEY ✅
5. STRIPE_PUBLISHABLE_KEY ✅
6. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✅
```

**Without these, the deployment WILL FAIL!**

---

🌾⚡✨ **READY TO ADD YOUR ENVIRONMENT VARIABLES!** ✨⚡🌾

**Status:** ✅ TEMPLATE READY  
**Action:** Copy values to Vercel Dashboard  
**Next:** Click "Deploy"

---

_"Configure with precision, deploy with confidence, scale with ease."_
