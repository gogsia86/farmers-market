# 🔐 Vercel Environment Variables Setup Guide

## Farmers Market Platform - Complete Configuration

> **Project ID:** `prj_lOITua9QUS4q0EoC4ZsaChCwaiDS`
> **Organization:** `team_XuAjQnKnlEeUMIx1zh8WtO5X`
> **Project Name:** `farmers-market-platform`
> **Date:** January 8, 2025

---

## 📋 Quick Start Checklist

- [ ] Step 1: Verify Node.js version in Vercel (2 minutes)
- [ ] Step 2: Set critical environment variables (10 minutes)
- [ ] Step 3: Verify configuration (2 minutes)
- [ ] Step 4: Deploy and test (5 minutes)

**Total Time:** ~20 minutes

---

## 🎯 Step 1: Verify Node.js Version in Vercel

### Access Vercel Dashboard

1. **Open Vercel Dashboard:**

   ```
   https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform
   ```

2. **Navigate to Settings:**
   - Click on **"Settings"** tab at the top
   - Select **"General"** from the left sidebar

3. **Find Node.js Version:**
   - Scroll down to **"Node.js Version"** section
   - Current setting: Check what's selected

4. **Update to Recommended Version:**
   - Click the dropdown menu
   - Select: **20.x** (Recommended) or **22.x**
   - Avoid: 24.x (experimental, may have compatibility issues)
   - Click: **"Save"**

### Why This Matters:

- ✅ Matches `package.json` requirement (`>=20.x`)
- ✅ Prevents version conflict warnings
- ✅ Ensures compatibility with all dependencies
- ✅ Prisma 7 works best with Node.js 20.x or 22.x

### ✅ Verification:

After saving, you should see:

```
Node.js Version: 20.x
```

---

## 🔑 Step 2: Set Environment Variables

### Access Environment Variables

1. **Go to Settings → Environment Variables:**

   ```
   https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform/settings/environment-variables
   ```

2. **Click:** "Add New" button (top right)

---

### 🔴 CRITICAL VARIABLES (Required)

Copy and paste these variables **one at a time** into Vercel:

---

#### 1. DATABASE_URL

```bash
DATABASE_URL
```

**Value Format:**

```
postgresql://username:password@host:port/database?schema=public
```

**Example:**

```
postgresql://postgres:mypassword@db.example.com:5432/farmersmarket?schema=public
```

**Where to get this:**

- **Neon:** Dashboard → Connection String
- **Supabase:** Settings → Database → Connection String
- **Railway:** Database → Connection String
- **AWS RDS:** Endpoint details in RDS console
- **Heroku:** Heroku Postgres → Database Credentials

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**⚠️ Important:**

- Replace `username`, `password`, `host`, `port`, `database` with your actual values
- Ensure database is accessible from Vercel IPs
- Test connection before proceeding

---

#### 2. NEXTAUTH_SECRET

```bash
NEXTAUTH_SECRET
```

**Generated Value (use this):**

```
9Z8wul49LBo4LBiuqkFPx6DonBWupzVmiijwqbth51E=
```

**Or generate your own:**

```bash
openssl rand -base64 32
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**⚠️ Important:**

- Must be at least 32 characters
- Keep this secret! Never commit to Git
- Different value for each environment (recommended)

---

#### 3. NEXTAUTH_URL

```bash
NEXTAUTH_URL
```

**Value for Production:**

```
https://your-production-domain.vercel.app
```

**Value for Preview/Development:**

```
https://farmers-market-platform-git-[branch].vercel.app
```

**Environments:**

- **Production:** `https://your-custom-domain.com` (or Vercel domain)
- **Preview:** Auto-generated Vercel preview URL
- **Development:** `http://localhost:3001`

**⚠️ Important:**

- Must match your actual deployment URL
- No trailing slash
- Must use HTTPS in production

---

#### 4. STRIPE_SECRET_KEY

```bash
STRIPE_SECRET_KEY
```

**Value Format:**

```
sk_live_... (production)
sk_test_... (preview/development)
```

**Where to get this:**

1. Go to: https://dashboard.stripe.com/apikeys
2. Find: "Secret key" section
3. Click: "Reveal test key" or "Reveal live key"
4. Copy the key

**Environments:**

- **Production:** Use `sk_live_...` key
- **Preview/Development:** Use `sk_test_...` key

**⚠️ Important:**

- Never use live keys in development
- Keep secret keys secure
- Rotate keys if compromised

---

#### 5. STRIPE_PUBLISHABLE_KEY

```bash
STRIPE_PUBLISHABLE_KEY
```

**Value Format:**

```
pk_live_... (production)
pk_test_... (preview/development)
```

**Where to get this:**

1. Go to: https://dashboard.stripe.com/apikeys
2. Find: "Publishable key" section
3. Copy the key

**Environments:**

- **Production:** Use `pk_live_...` key
- **Preview/Development:** Use `pk_test_...` key

---

#### 6. STRIPE_WEBHOOK_SECRET

```bash
STRIPE_WEBHOOK_SECRET
```

**Value Format:**

```
whsec_...
```

**Where to get this:**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click: "Add endpoint"
3. Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click: "Add endpoint"
6. Copy: "Signing secret" (starts with `whsec_`)

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**⚠️ Important:**

- Must match your webhook endpoint
- Different webhook for each environment

---

#### 7. NEXT_PUBLIC_APP_URL

```bash
NEXT_PUBLIC_APP_URL
```

**Value:**

```
https://your-production-domain.vercel.app
```

**Environments:**

- **Production:** Your production domain
- **Preview:** Preview domain (optional, can be same as production)
- **Development:** `http://localhost:3001`

**⚠️ Important:**

- Must be public (prefixed with `NEXT_PUBLIC_`)
- Used in client-side code
- No trailing slash

---

### 🟡 RECOMMENDED VARIABLES (Highly Recommended)

---

#### 8. SENDGRID_API_KEY

```bash
SENDGRID_API_KEY
```

**Value Format:**

```
SG.xxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

**Where to get this:**

1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click: "Create API Key"
3. Name: "Farmers Market Platform - Production"
4. Permissions: "Full Access" (or "Mail Send" only)
5. Click: "Create & View"
6. Copy the key (shown only once!)

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Used for:**

- Order confirmation emails
- Password reset emails
- Welcome emails
- Notification emails

---

#### 9. SENDGRID_FROM_EMAIL

```bash
SENDGRID_FROM_EMAIL
```

**Value:**

```
noreply@your-domain.com
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**⚠️ Important:**

- Must be verified in SendGrid
- Should be a no-reply address
- Use your custom domain for better deliverability

---

#### 10. SENTRY_DSN

```bash
SENTRY_DSN
```

**Value Format:**

```
https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx@o1234567.ingest.sentry.io/1234567
```

**Where to get this:**

1. Go to: https://sentry.io
2. Create project (if not exists)
3. Go to: Settings → Projects → Your Project → Client Keys (DSN)
4. Copy: DSN

**Environments:** ✅ Production, ✅ Preview, ⚠️ Development (optional)

**Used for:**

- Error tracking
- Performance monitoring
- Issue alerts

---

#### 11. SENTRY_AUTH_TOKEN

```bash
SENTRY_AUTH_TOKEN
```

**Where to get this:**

1. Go to: https://sentry.io/settings/account/api/auth-tokens/
2. Click: "Create New Token"
3. Scopes: `project:releases`, `org:read`
4. Copy token

**Environments:** ✅ Production, ✅ Preview

**Used for:**

- Uploading source maps
- Release tracking

---

### 🟢 OPTIONAL VARIABLES (Nice to Have)

---

#### 12. UPSTASH_REDIS_REST_URL

```bash
UPSTASH_REDIS_REST_URL
```

**Value Format:**

```
https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.upstash.io
```

**Where to get this:**

1. Go to: https://console.upstash.com/
2. Create database (if not exists)
3. Copy: REST URL

**Environments:** ✅ Production, ✅ Preview

**Used for:**

- Rate limiting
- Session storage
- Caching

---

#### 13. UPSTASH_REDIS_REST_TOKEN

```bash
UPSTASH_REDIS_REST_TOKEN
```

**Value Format:**

```
AXXxXxxXXXXxxxxxxxxxxxxxxxxxxxxxxxxxXXXXXXXXxxxxXXXXXXXX=
```

**Where to get this:**

- Same location as UPSTASH_REDIS_REST_URL
- Copy: REST Token

**Environments:** ✅ Production, ✅ Preview

---

#### 14. OPENAI_API_KEY

```bash
OPENAI_API_KEY
```

**Value Format:**

```
sk-...
```

**Where to get this:**

1. Go to: https://platform.openai.com/api-keys
2. Click: "Create new secret key"
3. Copy key

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Used for:**

- AI-powered features (if applicable)
- Smart recommendations

---

#### 15. CLOUDINARY_URL

```bash
CLOUDINARY_URL
```

**Value Format:**

```
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

**Where to get this:**

1. Go to: https://cloudinary.com/console
2. Dashboard → API Keys
3. Copy: Environment variable

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Used for:**

- Image uploads
- Image transformations
- Media management

---

## 📊 Environment Variable Summary Table

| Variable                   | Required       | Production | Preview | Development |
| -------------------------- | -------------- | ---------- | ------- | ----------- |
| `DATABASE_URL`             | 🔴 Yes         | ✅         | ✅      | ✅          |
| `NEXTAUTH_SECRET`          | 🔴 Yes         | ✅         | ✅      | ✅          |
| `NEXTAUTH_URL`             | 🔴 Yes         | ✅         | ✅      | ✅          |
| `STRIPE_SECRET_KEY`        | 🔴 Yes         | ✅         | ✅      | ✅          |
| `STRIPE_PUBLISHABLE_KEY`   | 🔴 Yes         | ✅         | ✅      | ✅          |
| `STRIPE_WEBHOOK_SECRET`    | 🔴 Yes         | ✅         | ✅      | ✅          |
| `NEXT_PUBLIC_APP_URL`      | 🔴 Yes         | ✅         | ✅      | ✅          |
| `SENDGRID_API_KEY`         | 🟡 Recommended | ✅         | ✅      | ✅          |
| `SENDGRID_FROM_EMAIL`      | 🟡 Recommended | ✅         | ✅      | ✅          |
| `SENTRY_DSN`               | 🟡 Recommended | ✅         | ✅      | ⚠️          |
| `SENTRY_AUTH_TOKEN`        | 🟡 Recommended | ✅         | ✅      | ❌          |
| `UPSTASH_REDIS_REST_URL`   | 🟢 Optional    | ✅         | ✅      | ❌          |
| `UPSTASH_REDIS_REST_TOKEN` | 🟢 Optional    | ✅         | ✅      | ❌          |
| `OPENAI_API_KEY`           | 🟢 Optional    | ✅         | ✅      | ✅          |
| `CLOUDINARY_URL`           | 🟢 Optional    | ✅         | ✅      | ✅          |

---

## ✅ Step 3: Verify Configuration

### Check Environment Variables in Vercel

1. **Go to Settings → Environment Variables:**

   ```
   https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform/settings/environment-variables
   ```

2. **Verify all critical variables are set:**
   - [ ] `DATABASE_URL` - Should show "Hidden" with 🔒 icon
   - [ ] `NEXTAUTH_SECRET` - Should show "Hidden" with 🔒 icon
   - [ ] `NEXTAUTH_URL` - Should show full URL
   - [ ] `STRIPE_SECRET_KEY` - Should show "Hidden" with 🔒 icon
   - [ ] `STRIPE_PUBLISHABLE_KEY` - Should show `pk_...`
   - [ ] `STRIPE_WEBHOOK_SECRET` - Should show "Hidden" with 🔒 icon
   - [ ] `NEXT_PUBLIC_APP_URL` - Should show full URL

3. **Check environments for each variable:**
   - Each should have checkmarks for applicable environments
   - Critical variables should be set for all three environments

### Local Verification (Optional)

Pull environment variables to local `.env.local`:

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local
```

This creates a local `.env.local` file with all your Vercel environment variables.

---

## 🚀 Step 4: Deploy and Test

### Trigger Deployment

#### Option 1: Git Push (Recommended)

```bash
# Make a small change (e.g., update README)
git commit --allow-empty -m "chore: trigger deployment with new env vars"
git push origin master
```

#### Option 2: Vercel Dashboard

1. Go to: **Deployments** tab
2. Click: **"Redeploy"** on latest deployment
3. Check: **"Use existing build cache"** (optional)
4. Click: **"Redeploy"**

### Monitor Deployment

1. **Watch Build Logs:**
   - Go to: **Deployments** → Latest deployment
   - Click: **"Building"** → View logs
   - Look for: Zero warnings, successful build

2. **Expected Output:**

   ```
   ✅ Prisma Client generated
   ✅ Compiled successfully
   ✅ Generating static pages (49/49)
   ✅ Build completed in ~2m 10s
   ✅ Deployment ready
   ```

3. **Check for Errors:**
   - ❌ No "Missing environment variable" errors
   - ❌ No database connection failures
   - ❌ No Stripe initialization errors

### Test Deployment

1. **Visit Your Site:**

   ```
   https://your-domain.vercel.app
   ```

2. **Test Critical Features:**
   - [ ] Homepage loads without errors
   - [ ] User registration works
   - [ ] Login/logout works
   - [ ] Database queries work (check any page with data)
   - [ ] Stripe checkout loads (if applicable)

3. **Check Console for Errors:**
   - Open browser DevTools (F12)
   - Check Console tab
   - Look for any red errors
   - Common issues:
     - Missing `NEXT_PUBLIC_*` variables
     - Stripe publishable key errors
     - API connection errors

---

## 🔧 Troubleshooting

### Issue: "Missing DATABASE_URL"

**Solution:**

1. Go to Vercel → Settings → Environment Variables
2. Add `DATABASE_URL` with your database connection string
3. Ensure it's checked for Production, Preview, and Development
4. Redeploy

---

### Issue: "Invalid NEXTAUTH_SECRET"

**Solution:**

1. Generate a new secret: `openssl rand -base64 32`
2. Update `NEXTAUTH_SECRET` in Vercel
3. Ensure it's at least 32 characters
4. Redeploy

---

### Issue: "Stripe is not configured"

**Solution:**

1. Verify all three Stripe variables are set:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
2. Ensure you're using correct keys (live vs test)
3. Redeploy

---

### Issue: "Build fails with TypeScript errors"

**Solution:**

```bash
# Run type check locally
npm run type-check

# Fix any errors shown
# Then commit and push
```

---

### Issue: "Database connection timeout"

**Solution:**

1. Check database is running and accessible
2. Verify DATABASE_URL format is correct
3. Whitelist Vercel IPs in your database firewall
4. Check connection pooling settings

---

## 📚 Additional Resources

### Vercel CLI Commands

```bash
# View all environment variables
vercel env ls

# Add new environment variable
vercel env add VARIABLE_NAME production

# Remove environment variable
vercel env rm VARIABLE_NAME production

# Pull environment variables to local
vercel env pull .env.local
```

### Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project Settings:** https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform/settings
- **Environment Variables:** https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform/settings/environment-variables
- **Deployments:** https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform/deployments
- **Vercel Docs:** https://vercel.com/docs/concepts/projects/environment-variables

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] Node.js version set to 20.x or 22.x in Vercel
- [ ] All 7 critical environment variables added
- [ ] Recommended variables added (SendGrid, Sentry)
- [ ] Environment variables set for all applicable environments
- [ ] Deployment triggered and successful
- [ ] Website loads without errors
- [ ] Database connections work
- [ ] Authentication works
- [ ] Stripe checkout loads (if applicable)
- [ ] No console errors in browser DevTools

---

## 🎉 Success!

If all items above are checked, your Vercel environment is fully configured and ready for production!

**Next Steps:**

1. ✅ Run comprehensive tests
2. ✅ Monitor error rates in Sentry
3. ✅ Set up uptime monitoring
4. ✅ Configure custom domain (if not done)
5. ✅ Set up SSL certificate (auto with Vercel)

---

**Configuration Date:** January 8, 2025
**Status:** ✅ Ready for Production
**Estimated Setup Time:** 20 minutes

---

**Need Help?**

- 📚 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- 📝 [VERCEL_ACTION_ITEMS.md](./VERCEL_ACTION_ITEMS.md)
- 🔧 [Vercel Support](https://vercel.com/support)
