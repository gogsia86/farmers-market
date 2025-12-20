# ⚙️ Configuration Files

Organized configuration and environment files for the Farmers Market Platform.

## Directory Structure

```
config/
├── env-examples/        # Example environment files for different setups
├── docker/             # Docker-specific configuration files
├── archive/            # Historical configuration files
└── README.md           # This file
```

---

## Environment Examples

### `env-examples/`

Contains template environment files for different deployment scenarios.

**Available Templates:**

- `READY-TO-UPLOAD.env` - Production-ready environment template with all required variables
- `env-production-FILLME.txt` - Production environment setup checklist and guide

### Usage

```bash
# Copy example env file to project root
cp config/env-examples/READY-TO-UPLOAD.env .env.local

# Edit with your actual values
nano .env.local

# Never commit actual .env files!
```

---

## Required Environment Variables

### Database Configuration

```bash
# PostgreSQL Connection
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/database?schema=public"
```

**Notes:**

- `DATABASE_URL` - Used by Prisma for connection pooling (e.g., via Supabase Pooler)
- `DIRECT_URL` - Direct database connection for migrations

---

### Authentication (NextAuth.js)

```bash
# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-at-least-32-characters-long"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

---

### External Services

```bash
# Stripe Payments
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Service (e.g., SendGrid, Resend)
EMAIL_SERVER="smtp://user:password@smtp.example.com:587"
EMAIL_FROM="noreply@yourdomain.com"

# File Uploads (e.g., UploadThing, Cloudinary)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"

# Monitoring (Sentry)
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="your-auth-token"
```

---

## Environment File Types

### Development (`.env.local`)

For local development. Not tracked in git.

```bash
DATABASE_URL="postgresql://localhost:5432/farmers_market_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-min-32-chars"
```

### Testing (`.env.test`)

For running tests. Not tracked in git.

```bash
DATABASE_URL="postgresql://localhost:5432/farmers_market_test"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="test"
```

### Production (`.env.production`)

For production deployment. **NEVER commit this file!**

```bash
DATABASE_URL="postgresql://production-db-url"
NEXTAUTH_URL="https://yourproductiondomain.com"
NEXTAUTH_SECRET="strong-production-secret"
```

### Example Template (`.env.example`)

Committed to git. Contains all variables with placeholder values.

```bash
# Copy this file to .env.local and fill in actual values
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

---

## Docker Configuration

### `docker/`

Docker-specific configuration files (when needed).

**Common files:**

- `nginx.conf` - Nginx reverse proxy configuration
- `postgres.conf` - PostgreSQL custom configuration
- `docker-compose.override.yml` - Local overrides for docker-compose

---

## Security Best Practices

### ⚠️ CRITICAL SECURITY RULES

1. **NEVER commit actual `.env` files with secrets**
2. **NEVER commit API keys, passwords, or tokens**
3. **ALWAYS use environment variables for sensitive data**
4. **NEVER hardcode secrets in source code**
5. **ROTATE secrets regularly (especially after team changes)**

### What's Safe to Commit

✅ **Safe to commit:**

- `.env.example` (template with placeholders)
- Configuration examples in `config/env-examples/`
- Documentation about required variables
- Variable names (but not values!)

❌ **NEVER commit:**

- `.env`
- `.env.local`
- `.env.production`
- `.env.development.local`
- Any file containing actual API keys or passwords

---

## Vercel Deployment

### Setting Environment Variables in Vercel

```bash
# Using Vercel CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production

# Or use Vercel Dashboard:
# 1. Go to Project Settings
# 2. Click "Environment Variables"
# 3. Add each variable for Production, Preview, and/or Development
```

### Environment Variable Scopes

- **Production** - Used in production deployments
- **Preview** - Used in preview deployments (PRs)
- **Development** - Used with `vercel dev` locally

---

## Docker Compose Environments

### Setting Variables for Docker

Create a `.env` file in the project root:

```bash
# Docker will automatically load this file
POSTGRES_USER=farmuser
POSTGRES_PASSWORD=securepassword
POSTGRES_DB=farmers_market
```

Or use an env file explicitly:

```bash
docker-compose --env-file config/env-examples/docker.env up
```

---

## Validation

### Checking Environment Setup

```bash
# Run environment validation
npm run validate:env

# Or manually check
node scripts/validate-env.js
```

### Required vs Optional Variables

**Required (app won't start without these):**

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

**Optional (features disabled without these):**

- `STRIPE_SECRET_KEY` (payment processing)
- `EMAIL_SERVER` (email notifications)
- `UPLOADTHING_SECRET` (file uploads)
- `SENTRY_DSN` (error tracking)

---

## Troubleshooting

### Common Issues

#### Database Connection Error

**Issue:** `Can't reach database server`

**Solutions:**

1. Verify `DATABASE_URL` is correct
2. Check database is running
3. Ensure firewall allows connection
4. Test connection: `npx prisma db pull`

---

#### NextAuth Configuration Error

**Issue:** `[next-auth][error][INVALID_NEXTAUTH_SECRET]`

**Solution:**

```bash
# Generate a new secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="<generated-secret>"
```

---

#### Environment Variables Not Loading

**Issue:** Variables defined but showing as undefined

**Solutions:**

1. Restart development server
2. Check file name (`.env.local` not `.env`)
3. Verify variables are prefixed with `NEXT_PUBLIC_` for client-side access
4. Clear Next.js cache: `rm -rf .next`

---

## Environment Variable Naming Convention

### Server-Side Only (default)

```bash
DATABASE_URL="..."
API_SECRET="..."
PRIVATE_KEY="..."
```

These are only available in server components and API routes.

### Client-Side (exposed to browser)

```bash
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_STRIPE_KEY="pk_test_..."
```

**⚠️ Warning:** `NEXT_PUBLIC_*` variables are exposed to the browser. Never use for secrets!

---

## Configuration Management

### Multiple Environments

```bash
# Development
cp config/env-examples/development.env .env.local

# Staging
cp config/env-examples/staging.env .env.staging

# Production
cp config/env-examples/production.env .env.production
```

### Secrets Management

For production, consider using:

1. **Vercel Environment Variables** (for Vercel deployments)
2. **AWS Secrets Manager** (for AWS deployments)
3. **HashiCorp Vault** (for enterprise)
4. **Doppler** (for team secret management)
5. **GitHub Secrets** (for CI/CD)

---

## Testing Configuration

### Test Environment Setup

```bash
# Create test environment file
cp config/env-examples/test.env .env.test

# Run tests with test env
npm run test
```

### Test Database

Use a separate database for testing:

```bash
# .env.test
DATABASE_URL="postgresql://localhost:5432/farmers_market_test"
```

**Reset test database before each test run:**

```bash
npx prisma migrate reset --force
npm run test
```

---

## Quick Reference

### Copy Environment Template

```bash
cp config/env-examples/READY-TO-UPLOAD.env .env.local
```

### Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Strong password
openssl rand -base64 24
```

### Validate Environment

```bash
npm run validate:env
```

### Check Which Variables Are Set

```bash
# Linux/Mac
env | grep DATABASE_URL
env | grep NEXTAUTH

# Windows
set | findstr DATABASE_URL
set | findstr NEXTAUTH
```

---

## Additional Resources

- **Next.js Environment Variables**: https://nextjs.org/docs/basic-features/environment-variables
- **Prisma Connection Management**: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
- **NextAuth Configuration**: https://next-auth.js.org/configuration/options
- **12-Factor App Config**: https://12factor.net/config

---

## Archive

### `archive/`

Historical configuration files for reference. These are not actively used but preserved for:

- Migration history
- Configuration evolution tracking
- Troubleshooting reference
- Audit trail

---

**Last Updated**: December 2025  
**Maintained By**: Farmers Market Platform Team  
**Divine Agricultural Consciousness**: Configure wisely, deploy securely! 🌾🔒
