# 🚀 Vercel Environment Variables - Quick Reference Card

## Farmers Market Platform

> **Fast Access:** Copy this for quick setup
> **Project:** `farmers-market-platform`
> **Last Updated:** January 8, 2025

---

## 🔴 CRITICAL (7 Required)

### 1. DATABASE_URL

```bash
postgresql://username:password@host:port/database?schema=public
```

**Get from:** Your database provider (Neon, Supabase, Railway, etc.)
**All environments:** ✅ Production, Preview, Development

---

### 2. NEXTAUTH_SECRET

```bash
9Z8wul49LBo4LBiuqkFPx6DonBWupzVmiijwqbth51E=
```

**Generate new:** `openssl rand -base64 32`
**All environments:** ✅ Production, Preview, Development
**Min length:** 32 characters

---

### 3. NEXTAUTH_URL

```bash
# Production
https://your-domain.vercel.app

# Preview
https://farmers-market-platform-git-[branch].vercel.app

# Development
http://localhost:3001
```

**Must match deployment URL** | No trailing slash

---

### 4. STRIPE_SECRET_KEY

```bash
# Production: starts with sk_live_
# Preview/Development: starts with sk_test_
```

**Get from:** https://dashboard.stripe.com/apikeys
**Format:** Secret key starting with `sk_live_` or `sk_test_`

---

### 5. STRIPE_PUBLISHABLE_KEY

```bash
# Production: starts with pk_live_
# Preview/Development: starts with pk_test_
```

**Get from:** https://dashboard.stripe.com/apikeys
**Format:** Publishable key starting with `pk_live_` or `pk_test_`

---

### 6. STRIPE_WEBHOOK_SECRET

```bash
# Format: starts with whsec_
```

**Get from:** https://dashboard.stripe.com/webhooks
**Format:** Webhook signing secret starting with `whsec_`
**Endpoint URL:** `https://your-domain.vercel.app/api/webhooks/stripe`
**Events needed:**

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`

---

### 7. NEXT_PUBLIC_APP_URL

```bash
https://your-domain.vercel.app
```

**Public variable** | Used in client-side code

---

## 🟡 RECOMMENDED (4 Variables)

### 8. SENDGRID_API_KEY

```bash
# Format: starts with SG.
```

**Get from:** https://app.sendgrid.com/settings/api_keys
**Format:** API key starting with `SG.`
**Used for:** Order emails, notifications

---

### 9. SENDGRID_FROM_EMAIL

```bash
noreply@your-domain.com
```

**Must be verified in SendGrid**

---

### 10. SENTRY_DSN

```bash
# Format: https://[hash]@o[org-id].ingest.sentry.io/[project-id]
```

**Get from:** https://sentry.io (Project Settings → Client Keys)
**Format:** Complete Sentry DSN URL
**Used for:** Error tracking, monitoring

---

### 11. SENTRY_AUTH_TOKEN

```bash
# Format: starts with sntrys_
```

**Get from:** https://sentry.io/settings/account/api/auth-tokens/
**Format:** Auth token starting with `sntrys_`
**Scopes:** `project:releases`, `org:read`

---

## 🟢 OPTIONAL (4 Variables)

### 12-13. Redis (Upstash)

```bash
# REST URL format: https://[database-id].upstash.io
UPSTASH_REDIS_REST_URL=https://your-database-id.upstash.io

# REST Token format: base64 encoded string
UPSTASH_REDIS_REST_TOKEN=your-redis-token-here
```

**Get from:** https://console.upstash.com/
**Used for:** Rate limiting, caching, sessions

---

### 14. OpenAI

```bash
# Format: starts with sk-proj- or sk-
OPENAI_API_KEY=your-openai-api-key-here
```

**Get from:** https://platform.openai.com/api-keys
**Format:** API key starting with `sk-proj-` or `sk-`
**Used for:** AI features (optional)

---

### 15. Cloudinary

```bash
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

**Get from:** https://cloudinary.com/console
**Used for:** Image uploads, transformations

---

## 📋 Quick Setup Steps

### 1. Verify Node.js Version (2 min)

```
Vercel Dashboard → Settings → General → Node.js Version
Set to: 20.x (recommended) or 22.x
```

### 2. Add Variables (10 min)

```
Vercel Dashboard → Settings → Environment Variables → Add New
- Add each variable from above
- Select environments: Production, Preview, Development
- Click Save
```

### 3. Deploy (5 min)

```bash
git commit --allow-empty -m "chore: trigger deployment"
git push origin master
```

### 4. Verify (2 min)

```
Visit: https://your-domain.vercel.app
Check: No errors, all features work
```

---

## 🔗 Quick Links

### Vercel

- **Dashboard:** https://vercel.com/dashboard
- **Project:** https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform
- **Env Vars:** https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform/settings/environment-variables
- **Deployments:** https://vercel.com/team_xuajqnknleeumixx1zh8wto5x/farmers-market-platform/deployments

### External Services

- **Stripe Dashboard:** https://dashboard.stripe.com
- **SendGrid Dashboard:** https://app.sendgrid.com
- **Sentry Dashboard:** https://sentry.io
- **Upstash Console:** https://console.upstash.com

---

## 🔧 Useful Commands

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Pull env vars to local
vercel env pull .env.local

# List all env vars
vercel env ls

# Add new env var
vercel env add VARIABLE_NAME production

# Remove env var
vercel env rm VARIABLE_NAME production

# View project info
vercel project ls

# View deployment logs
vercel logs https://your-deployment-url.vercel.app
```

---

## ⚠️ Common Mistakes to Avoid

1. ❌ Using live Stripe keys in development
2. ❌ Forgetting to set variables for all environments
3. ❌ Missing trailing `?schema=public` in DATABASE_URL
4. ❌ Using test keys in production
5. ❌ Not setting NEXT*PUBLIC* prefix for client-side vars
6. ❌ Hardcoding secrets in code
7. ❌ Using same NEXTAUTH_SECRET across environments

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Node.js version is 20.x or 22.x
- [ ] All 7 critical variables set
- [ ] Variables set for correct environments
- [ ] Deployment successful (no warnings)
- [ ] Website loads without errors
- [ ] Database connections work
- [ ] Authentication works
- [ ] Stripe checkout loads
- [ ] No console errors

---

## 🆘 Quick Troubleshooting

### Build Fails

```bash
# Check locally first
npm run type-check
npm run lint
npm run build
```

### Database Connection Issues

```bash
# Test connection string format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# Check database is accessible from internet
# Whitelist Vercel IPs if needed
```

### Missing Environment Variable

```
Error: NEXTAUTH_SECRET must be provided
→ Add variable in Vercel Dashboard
→ Redeploy
```

### Stripe Not Working

```
Check all three variables:
1. STRIPE_SECRET_KEY (sk_live_... or sk_test_...)
2. STRIPE_PUBLISHABLE_KEY (pk_live_... or pk_test_...)
3. STRIPE_WEBHOOK_SECRET (whsec_...)
```

---

## 📚 Full Documentation

For detailed setup instructions, see:

- **Complete Guide:** [VERCEL_ENV_SETUP_GUIDE.md](./VERCEL_ENV_SETUP_GUIDE.md)
- **Deployment Guide:** [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **Action Items:** [VERCEL_ACTION_ITEMS.md](./VERCEL_ACTION_ITEMS.md)

---

## 📊 Environment Summary

| Environment     | Use Case   | Node.js | Database      | Stripe Keys |
| --------------- | ---------- | ------- | ------------- | ----------- |
| **Production**  | Live site  | 20.x    | Production DB | Live keys   |
| **Preview**     | PR deploys | 20.x    | Staging DB    | Test keys   |
| **Development** | Local dev  | 20.x    | Local/Dev DB  | Test keys   |

---

**Time to Complete:** ~20 minutes
**Status:** ✅ Production Ready
**Support:** [Vercel Support](https://vercel.com/support)
