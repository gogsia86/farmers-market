# 🚀 Vercel Environment Variables Checklist

**Last Updated:** January 13, 2025  
**Platform:** Farmers Market Platform  
**Deployment:** Vercel Production

---

## 📋 Overview

This checklist helps you configure all required environment variables in the Vercel Dashboard before deploying to production.

**Vercel Dashboard:** https://vercel.com/your-org/farmers-market/settings/environment-variables

---

## ⚠️ CRITICAL: Required for Basic Operation

These variables are REQUIRED for the application to start:

### Core Application
```
✅ NODE_ENV
   Value: production
   Scope: Production, Preview, Development

✅ NEXT_PUBLIC_APP_URL
   Value: https://yourdomain.com
   Scope: Production
   Note: Change to preview URL for Preview scope

✅ NEXTAUTH_URL
   Value: https://yourdomain.com
   Scope: Production
   Note: Must match NEXT_PUBLIC_APP_URL

✅ NEXTAUTH_SECRET
   Value: [Generate with: openssl rand -base64 32]
   Scope: Production, Preview, Development
   ⚠️ MUST be 32+ characters
   ⚠️ Use different secret for each environment
```

### Database (Use Vercel Postgres or External)
```
✅ DATABASE_URL
   Value: postgres://user:password@host:5432/database
   Scope: Production, Preview, Development
   Options:
   - Vercel Postgres (recommended): Automatically added
   - Supabase: postgresql://postgres.[xxx]:[password]@pooler.supabase.com:6543/postgres
   - Neon: postgresql://user:password@ep-xxx.neon.tech/neondb
```

---

## 💳 Payment Processing (Stripe)

REQUIRED if accepting payments:

```
✅ STRIPE_SECRET_KEY
   Value: sk_live_[your_key] (Production) | sk_test_[your_key] (Preview)
   Scope: Production (live key), Preview (test key)
   Get from: https://dashboard.stripe.com/apikeys
   ⚠️ Use LIVE keys for production, TEST keys for preview

✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   Value: pk_live_[your_key] (Production) | pk_test_[your_key] (Preview)
   Scope: Production (live key), Preview (test key)
   ⚠️ Must match secret key mode (test/live)

✅ STRIPE_WEBHOOK_SECRET
   Value: whsec_[your_secret]
   Scope: Production
   Setup:
   1. Go to: https://dashboard.stripe.com/webhooks
   2. Add endpoint: https://yourdomain.com/api/webhooks/stripe
   3. Select events: checkout.session.completed, payment_intent.*
   4. Copy signing secret
```

---

## 📧 Email Service

REQUIRED for sending emails (order confirmations, notifications):

### Option 1: SendGrid (Recommended)
```
✅ SENDGRID_API_KEY
   Value: SG.[your_api_key]
   Scope: Production, Preview
   Get from: https://app.sendgrid.com/settings/api_keys

✅ EMAIL_FROM
   Value: noreply@yourdomain.com
   Scope: Production, Preview
   ⚠️ Must be verified in SendGrid
```

### Option 2: SMTP
```
✅ SMTP_HOST
   Value: smtp.gmail.com (or your SMTP server)
   Scope: Production

✅ SMTP_PORT
   Value: 587
   Scope: Production

✅ SMTP_USER
   Value: your-email@gmail.com
   Scope: Production

✅ SMTP_PASSWORD
   Value: [your-app-specific-password]
   Scope: Production

✅ SMTP_FROM
   Value: noreply@yourdomain.com
   Scope: Production
```

---

## ☁️ Cloud Storage (Cloudinary)

RECOMMENDED for image uploads:

```
✅ CLOUDINARY_CLOUD_NAME
   Value: your_cloud_name
   Scope: Production, Preview
   Get from: https://cloudinary.com/console

✅ CLOUDINARY_API_KEY
   Value: [your_api_key]
   Scope: Production, Preview

✅ CLOUDINARY_API_SECRET
   Value: [your_api_secret]
   Scope: Production, Preview
   ⚠️ Keep secret!
```

---

## 🔄 Caching (Redis)

HIGHLY RECOMMENDED for production performance:

### Option 1: Upstash Redis (Recommended for Vercel)
```
✅ UPSTASH_REDIS_REST_URL
   Value: https://[xxx].upstash.io
   Scope: Production, Preview
   Get from: https://console.upstash.com/

✅ UPSTASH_REDIS_REST_TOKEN
   Value: [your_token]
   Scope: Production, Preview
   ⚠️ Keep secret!
```

### Option 2: Standard Redis
```
✅ REDIS_URL
   Value: redis://:password@host:6379
   Scope: Production, Preview
```

---

## 📊 Monitoring & Error Tracking

HIGHLY RECOMMENDED for production:

### Sentry
```
✅ SENTRY_DSN
   Value: https://[xxx]@o[xxx].ingest.sentry.io/[xxx]
   Scope: Production, Preview
   Get from: https://sentry.io/settings/projects/

✅ NEXT_PUBLIC_SENTRY_DSN
   Value: [same as SENTRY_DSN]
   Scope: Production, Preview
   Note: Public variable for client-side error tracking
```

### Vercel Analytics
```
✅ NEXT_PUBLIC_VERCEL_ANALYTICS_ID
   Value: [automatically provided by Vercel]
   Scope: Production
   Note: Automatically enabled in Vercel projects
```

---

## 🔐 Optional: OAuth Providers

Only if using social login:

### Google OAuth
```
⭕ GOOGLE_CLIENT_ID
   Value: [your_client_id].apps.googleusercontent.com
   Scope: Production, Preview
   Get from: https://console.cloud.google.com/apis/credentials

⭕ GOOGLE_CLIENT_SECRET
   Value: [your_secret]
   Scope: Production, Preview
```

### GitHub OAuth
```
⭕ GITHUB_ID
   Value: [your_client_id]
   Scope: Production, Preview
   Get from: https://github.com/settings/developers

⭕ GITHUB_SECRET
   Value: [your_client_secret]
   Scope: Production, Preview
```

---

## 🤖 Optional: AI Features

Only if using AI-powered features:

```
⭕ OPENAI_API_KEY
   Value: sk-[your_api_key]
   Scope: Production, Preview
   Get from: https://platform.openai.com/api-keys

⭕ PERPLEXITY_API_KEY
   Value: [your_api_key]
   Scope: Production, Preview
   Get from: https://www.perplexity.ai/settings/api
```

---

## 📱 Optional: SMS Notifications (Twilio)

Only if sending SMS:

```
⭕ TWILIO_ACCOUNT_SID
   Value: AC[your_account_sid]
   Scope: Production
   Get from: https://console.twilio.com/

⭕ TWILIO_AUTH_TOKEN
   Value: [your_auth_token]
   Scope: Production

⭕ TWILIO_PHONE_NUMBER
   Value: +1234567890
   Scope: Production
```

---

## 🌍 Optional: Maps

Only if using map features:

```
⭕ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   Value: AIza[your_api_key]
   Scope: Production, Preview
   Get from: https://console.cloud.google.com/google/maps-apis
```

---

## 🔍 Optional: Analytics

```
⭕ NEXT_PUBLIC_GA_MEASUREMENT_ID
   Value: G-XXXXXXXXXX
   Scope: Production
   Get from: https://analytics.google.com/
```

---

## 📋 Pre-Deployment Checklist

### Before First Deployment

- [ ] All CRITICAL variables are set
- [ ] DATABASE_URL is configured (Vercel Postgres or external)
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] NEXTAUTH_URL matches your domain
- [ ] Stripe LIVE keys are configured for Production
- [ ] Stripe TEST keys are configured for Preview
- [ ] Email service is configured and verified
- [ ] Cloudinary is configured (if using image uploads)
- [ ] Redis is configured (Upstash recommended)
- [ ] Sentry DSN is configured

### Security Check

- [ ] No test credentials in Production scope
- [ ] NEXTAUTH_SECRET is unique (not from example)
- [ ] All secrets are strong and randomly generated
- [ ] Stripe LIVE keys only in Production scope
- [ ] Database password is strong
- [ ] API keys have minimum required permissions

### Testing

- [ ] Deploy to Preview first
- [ ] Test authentication flow
- [ ] Test payment processing (test mode)
- [ ] Test email sending
- [ ] Test image uploads
- [ ] Check error tracking in Sentry
- [ ] Verify environment variables loaded correctly

---

## 🚀 Deployment Steps

### 1. Add Environment Variables

```bash
# Go to Vercel Dashboard
https://vercel.com/your-org/farmers-market/settings/environment-variables

# For each variable:
1. Click "Add New"
2. Enter Key (e.g., DATABASE_URL)
3. Enter Value
4. Select Environment:
   - Production: Live site
   - Preview: Pull request deployments
   - Development: Local `vercel dev`
5. Click "Save"
```

### 2. Deploy

```bash
# Via Git (Recommended)
git push origin main

# Via Vercel CLI
vercel --prod
```

### 3. Verify Deployment

```bash
# Check deployment logs
vercel logs --follow

# Visit your site
https://yourdomain.com

# Test critical features:
- Authentication
- Database queries
- Payment processing (test mode first!)
- Email sending
```

---

## 🐛 Troubleshooting

### Variables Not Loading

**Problem:** Environment variables not accessible in application

**Solutions:**
1. Check variable names match exactly (case-sensitive)
2. Ensure variables are enabled for correct scope
3. Redeploy after adding variables
4. Check Vercel logs for errors

### Database Connection Fails

**Problem:** Can't connect to database

**Solutions:**
1. Verify DATABASE_URL is correct
2. Check database is accessible from Vercel (not localhost!)
3. Ensure SSL mode is correct for cloud databases
4. Test connection from Vercel terminal

### Stripe Keys Not Working

**Problem:** Payments fail or webhook errors

**Solutions:**
1. Verify using LIVE keys in Production, TEST in Preview
2. Check publishable key matches secret key mode
3. Verify webhook endpoint URL is correct
4. Test webhook with Stripe CLI first

---

## 📞 Support

### Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Environment Variables:** https://vercel.com/docs/environment-variables
- **Deployment Docs:** https://vercel.com/docs/deployments/overview

### Getting Help

1. Check Vercel logs: `vercel logs`
2. Review [ENV-SETUP-GUIDE.md](./ENV-SETUP-GUIDE.md)
3. Check [Troubleshooting](./ENV-SETUP-GUIDE.md#troubleshooting)
4. Create GitHub issue with details

---

## ✅ Verification Script

After deployment, verify all services:

```bash
# Run health check
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-01-13T..."
}
```

---

**Last Updated:** January 13, 2025  
**Maintained by:** Farmers Market Platform Team  
**Questions?** See [ENV-SETUP-GUIDE.md](./ENV-SETUP-GUIDE.md) for detailed setup instructions