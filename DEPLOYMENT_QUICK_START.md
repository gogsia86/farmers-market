# 🚀 Deployment Quick Start Guide
**Farmers Market Platform - Production Deployment**

---

## ⚡ Quick Deploy (5 Minutes)

### 1. Prerequisites
```bash
# Ensure you have:
✅ Node.js 18+ installed
✅ PostgreSQL database URL
✅ Stripe account (production mode)
✅ Email provider (Resend or SMTP)
```

### 2. Clone & Install
```bash
git clone <repository-url>
cd "Farmers Market Platform web and app"
npm install
```

### 3. Configure Environment Variables
```bash
# Copy example and edit
cp .env.example .env.production

# Required variables (edit .env.production):
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..." # or SMTP credentials
EMAIL_FROM="noreply@yourdomain.com"
```

### 4. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Deploy database schema
npx prisma migrate deploy

# (Optional) Seed initial data
npm run seed
```

### 5. Build & Deploy
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Server runs on port 3000
# Access at: http://localhost:3000
```

---

## 🔧 Platform-Specific Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard:
# Settings → Environment Variables → Add all required vars
```

### Docker
```bash
# Build Docker image
docker build -t farmers-market-platform .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e NEXTAUTH_SECRET="..." \
  -e STRIPE_SECRET_KEY="..." \
  -e STRIPE_WEBHOOK_SECRET="..." \
  -e RESEND_API_KEY="..." \
  farmers-market-platform
```

### PM2 (Node.js Process Manager)
```bash
# Install PM2
npm install -g pm2

# Build
npm run build

# Start with PM2
pm2 start npm --name "farmers-market" -- start

# Save PM2 config
pm2 save

# Set up auto-restart on reboot
pm2 startup
```

---

## 🔐 Environment Variables Reference

### Critical (Must Have)
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/farmers_market"

# Auth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Option 1: Resend - recommended)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Email (Option 2: SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@yourdomain.com"
```

### Optional (Enhanced Features)
```bash
# SMS Notifications (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# Push Notifications (Firebase)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@project.iam.gserviceaccount.com"

# Redis (Background Jobs)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"
REDIS_TLS="false"

# Monitoring
OPENTELEMETRY_ENDPOINT="https://..."
AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING="InstrumentationKey=..."
```

---

## 📦 Stripe Webhook Configuration

### 1. Create Webhook in Stripe Dashboard
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.created`
   - `charge.refunded`
5. Copy the webhook signing secret

### 2. Add Secret to Environment
```bash
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Test Webhook
```bash
# Use Stripe CLI for testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

---

## ✅ Post-Deployment Checklist

### Infrastructure
- [ ] Database accessible and migrated
- [ ] SSL/TLS certificate configured
- [ ] Domain DNS configured
- [ ] Environment variables set
- [ ] Server/container running

### Stripe
- [ ] Production mode enabled
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to env
- [ ] Test payment completed

### Email
- [ ] Provider credentials configured
- [ ] Sender domain verified
- [ ] Test email sent successfully

### Testing
- [ ] User registration works
- [ ] Login/logout works
- [ ] Payment flow works
- [ ] Webhooks received
- [ ] Emails delivered

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] NEXTAUTH_SECRET is strong
- [ ] API keys are production keys
- [ ] Database has secure password

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Error
```bash
# Test connection
npx prisma db push

# Check DATABASE_URL format:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### Stripe Webhook Not Receiving Events
```bash
# Check webhook URL is publicly accessible
curl https://yourdomain.com/api/webhooks/stripe

# Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard
# Check Stripe dashboard → Webhooks → Recent deliveries
```

### Email Not Sending
```bash
# Check provider credentials
# For Resend: verify API key is active
# For SMTP: test connection with telnet
telnet smtp.example.com 587
```

### Port Already in Use
```bash
# Kill process on port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
PORT=3001 npm start
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# PM2 logs
pm2 logs farmers-market

# Docker logs
docker logs -f <container-id>

# Next.js logs (development)
npm run dev
```

### Health Check
```bash
# Check if server is running
curl https://yourdomain.com/

# Check API
curl https://yourdomain.com/api/health
```

### Database Queries
```bash
# Open Prisma Studio
npx prisma studio

# View database in browser at: http://localhost:5555
```

---

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart server
pm2 restart farmers-market
# or for Docker:
docker restart <container-id>
```

### Database Migrations
```bash
# Create new migration (development)
npx prisma migrate dev --name migration-name

# Deploy to production
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### Backup Database
```bash
# PostgreSQL backup
pg_dump -h hostname -U username -d dbname > backup.sql

# Restore backup
psql -h hostname -U username -d dbname < backup.sql
```

---

## 🆘 Emergency Contacts

### Critical Issues
- Database down → Check hosting provider status
- Payments failing → Check Stripe dashboard
- Site unreachable → Check DNS/server status

### Logs to Check
1. Application logs (PM2/Docker)
2. Stripe webhook logs
3. Email provider logs
4. Database logs
5. Server/hosting logs

### Rollback Procedure
```bash
# Revert to previous deployment
git checkout <previous-commit-hash>
npm install
npm run build
pm2 restart farmers-market
```

---

## 📚 Additional Resources

- **Full Documentation**: `BUILD_SUCCESS_SESSION_SUMMARY.md`
- **Architecture Guide**: `.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md`
- **Quick Reference**: `.github/instructions/16_KILO_QUICK_REFERENCE.instructions.md`
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Stripe Docs**: https://stripe.com/docs

---

## ✨ Success Indicators

Your deployment is successful when:
- ✅ Website loads at your domain
- ✅ Users can register and login
- ✅ Products display correctly
- ✅ Payment flow completes
- ✅ Webhooks are received
- ✅ Emails are delivered
- ✅ No errors in logs

---

**Need Help?** Check `BUILD_SUCCESS_SESSION_SUMMARY.md` for detailed troubleshooting.

**Status**: 🚀 Ready for Production Deployment

*Last Updated: November 15, 2024*
