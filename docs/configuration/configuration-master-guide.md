# ⚙️ Configuration Master Guide - Farmers Market Platform

**Purpose**: Complete configuration reference for all environments and scenarios
**Status**: Master Documentation - Single Source of Truth
**Last Updated**: January 17, 2025
**Owner**: DevOps & Engineering Teams

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Configuration Files](#configuration-files)
- [Environment-Specific Setup](#environment-specific-setup)
- [Service Integrations](#service-integrations)
- [Security & Secrets](#security--secrets)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🚀 Quick Start

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configure Database

```bash
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# Run migrations
npm run prisma:migrate
```

### 4. Verify Configuration

```bash
# Check all required variables
npm run verify:env

# Test database connection
npm run prisma:studio
```

---

## 🌍 Environment Variables

### Required Variables (All Environments)

#### Database

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Example (local development)
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"

# Example (production with SSL)
DATABASE_URL="postgresql://user:pass@prod.db.com:5432/db?sslmode=require"
```

**Purpose**: Database connection for Prisma ORM
**Required**: ✅ Yes (all environments)
**Format**: PostgreSQL connection string
**Validation**: Tested on startup

#### Authentication

```bash
# NextAuth configuration
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-generated-secret-here"

# Production example
NEXTAUTH_URL="https://farmersmarket.com"
NEXTAUTH_SECRET="[64-character-secret]"
```

**NEXTAUTH_URL**:
- Development: `http://localhost:3001`
- Staging: `https://staging.farmersmarket.com`
- Production: `https://farmersmarket.com`
- Required: ✅ Yes
- Validation: Must be valid URL

**NEXTAUTH_SECRET**:
- Generate: `openssl rand -base64 32`
- Length: Minimum 32 characters
- Required: ✅ Yes
- Security: Never commit to git

#### Payment Processing

```bash
# Stripe configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# PayPal configuration
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-client-secret"
PAYPAL_WEBHOOK_ID="your-webhook-id"
```

**Stripe Variables**:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Client-side, safe to expose
- `STRIPE_SECRET_KEY`: Server-side only, never expose
- `STRIPE_WEBHOOK_SECRET`: From Stripe webhook setup
- Test vs Live: Use `pk_test_*` and `sk_test_*` for development

**PayPal Variables**:
- `PAYPAL_CLIENT_ID`: OAuth 2.0 client ID
- `PAYPAL_CLIENT_SECRET`: OAuth 2.0 client secret
- `PAYPAL_WEBHOOK_ID`: Webhook event ID
- Environment: Sandbox vs Live modes

#### Application

```bash
# Application settings
NODE_ENV="development"  # development | production | test
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

**NODE_ENV**:
- `development`: Local development
- `production`: Production deployment
- `test`: Test environment
- Auto-set by deployment platform usually

**NEXT_PUBLIC_APP_URL**:
- Base URL for application
- Used for redirects, emails, etc.
- Must match NEXTAUTH_URL domain

---

### Optional Variables

#### Monitoring & Observability

```bash
# OpenTelemetry (Development/Production)
NEXT_PUBLIC_OTEL_ENABLED="true"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
OTEL_SERVICE_NAME="farmers-market-platform"

# Azure Application Insights (Production)
AZURE_APPINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=..."

# Sentry Error Tracking (Production)
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
```

**When to Enable**:
- OpenTelemetry: Development (optional), Production (recommended)
- Azure Insights: Production only
- Sentry: Staging + Production

#### Caching

```bash
# Redis configuration (recommended for production)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your-redis-password"
REDIS_TLS="true"  # Production only

# Redis Cluster (production)
REDIS_CLUSTER_ENDPOINTS="redis1:6379,redis2:6379,redis3:6379"
```

**Redis Usage**:
- Session storage
- API response caching
- Rate limiting
- Job queue

#### Email Service

```bash
# Email configuration (SendGrid recommended)
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@farmersmarket.com"

# Alternative: AWS SES
EMAIL_SERVER_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-aws-access-key"
EMAIL_SERVER_PASSWORD="your-aws-secret-key"
```

#### Cloud Storage

```bash
# Cloudinary (recommended)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# AWS S3 (alternative)
AWS_S3_BUCKET="farmers-market-uploads"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
```

#### Development Tools

```bash
# Development settings
LOG_LEVEL="debug"  # debug | info | warn | error
SKIP_ENV_VALIDATION="false"
DOCKER_BUILD="false"

# Debugging
DEBUG="prisma:*"  # Enable Prisma query logging
NEXT_TELEMETRY_DISABLED="1"  # Disable Next.js telemetry
```

---

## 📁 Configuration Files

### Next.js Configuration (`next.config.mjs`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core settings
  reactStrictMode: true,
  swcMinify: true,

  // Build settings
  output: 'standalone',
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: ['res.cloudinary.com', 'your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Custom webpack config
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
};

export default nextConfig;
```

**Key Sections**:
- **reactStrictMode**: Enables React strict mode for better error detection
- **images**: Image optimization configuration
- **headers**: Security headers for all routes
- **webpack**: Custom webpack configuration for optimal bundling

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    // Strict mode (required)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Module resolution
    "target": "ES2022",
    "lib": ["ES2022", "dom", "dom.iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    },

    // Code generation
    "jsx": "preserve",
    "incremental": true,
    "isolatedModules": true,
    "skipLibCheck": true,

    // Plugins
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "dist",
    "build"
  ]
}
```

**Critical Settings**:
- **strict: true**: Enables all strict type checking
- **paths**: Path aliases for cleaner imports
- **incremental**: Faster rebuilds

### Prisma Configuration (`prisma/schema.prisma`)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
  binaryTargets   = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Example model
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  accounts Account[]
  sessions Session[]
  farms    Farm[]
  orders   Order[]

  @@index([email])
  @@map("users")
}

enum UserRole {
  USER
  FARMER
  ADMIN
}
```

**Key Features**:
- Full-text search preview features
- Multi-platform binary targets for Docker
- Proper indexing for performance
- Agricultural-conscious naming

### Jest Configuration (`jest.config.js`)

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

**Coverage Requirements**:
- Minimum 80% coverage across all metrics
- Excludes test files and stories

---

## 🌐 Environment-Specific Setup

### Development Environment

**File**: `.env` (local only, not committed)

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market_dev"

# Auth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="dev-secret-min-32-chars-long-generated"

# Payments (TEST mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

PAYPAL_CLIENT_ID="sandbox-client-id"
PAYPAL_CLIENT_SECRET="sandbox-secret"
PAYPAL_MODE="sandbox"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Development tools
LOG_LEVEL="debug"
SKIP_ENV_VALIDATION="false"

# Optional: Local services
REDIS_URL="redis://localhost:6379"
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"  # MailHog or similar
```

**Setup Steps**:

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
docker-compose up -d postgres
npm run prisma:migrate
npm run prisma:seed
```

3. Start development server:
```bash
npm run dev
```

**Development URLs**:
- Application: http://localhost:3001
- Prisma Studio: http://localhost:5555 (run `npm run prisma:studio`)
- MailHog (email): http://localhost:8025 (if using)

---

### Staging Environment

**File**: `.env.staging` (deployed via CI/CD secrets)

```bash
# Database
DATABASE_URL="postgresql://user:pass@staging-db.cloud.com:5432/farmers_market_staging?sslmode=require"

# Auth
NEXTAUTH_URL="https://staging.farmersmarket.com"
NEXTAUTH_SECRET="[unique-64-char-staging-secret]"

# Payments (TEST mode - still using test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

PAYPAL_CLIENT_ID="sandbox-client-id"
PAYPAL_CLIENT_SECRET="sandbox-secret"
PAYPAL_MODE="sandbox"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://staging.farmersmarket.com"

# Monitoring
NEXT_PUBLIC_OTEL_ENABLED="true"
OTEL_EXPORTER_OTLP_ENDPOINT="https://otel.staging.internal"
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Services
REDIS_URL="redis://:password@staging-redis.cloud.com:6379"
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PASSWORD="staging-sendgrid-key"
CLOUDINARY_CLOUD_NAME="staging-cloud"
```

**Staging Characteristics**:
- Production-like environment
- Test payment credentials
- Full monitoring enabled
- Separate database and services
- Used for QA and UAT

---

### Production Environment

**File**: `.env.production` (managed via secret management system)

```bash
# Database (high-availability cluster)
DATABASE_URL="postgresql://user:pass@prod-primary.cloud.com:5432/farmers_market_prod?sslmode=require&connection_limit=20"
DATABASE_REPLICA_URL="postgresql://user:pass@prod-replica.cloud.com:5432/farmers_market_prod?sslmode=require"

# Auth
NEXTAUTH_URL="https://farmersmarket.com"
NEXTAUTH_SECRET="[unique-strong-64-char-production-secret]"

# Payments (LIVE mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_live_..."

PAYPAL_CLIENT_ID="live-client-id"
PAYPAL_CLIENT_SECRET="live-secret"
PAYPAL_MODE="live"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://farmersmarket.com"

# Monitoring (required)
NEXT_PUBLIC_OTEL_ENABLED="true"
OTEL_EXPORTER_OTLP_ENDPOINT="https://otel.prod.internal"
AZURE_APPINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="production-auth-token"

# Services (production instances)
REDIS_URL="rediss://:password@prod-redis-cluster.cloud.com:6380"
REDIS_CLUSTER_ENDPOINTS="redis1:6379,redis2:6379,redis3:6379"

EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PASSWORD="production-sendgrid-key"
EMAIL_FROM="noreply@farmersmarket.com"

CLOUDINARY_CLOUD_NAME="production-cloud"
CLOUDINARY_API_KEY="prod-key"
CLOUDINARY_API_SECRET="prod-secret"

# Security
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="900000"

# Performance
CACHE_TTL="3600"
ENABLE_COMPRESSION="true"
```

**Production Requirements**:
- ✅ All secrets stored in secret manager (Azure Key Vault, AWS Secrets Manager)
- ✅ Database with replicas for read scaling
- ✅ Redis cluster for high availability
- ✅ Full monitoring and alerting
- ✅ Live payment credentials
- ✅ CDN configured
- ✅ Backup strategy in place

---

### Test Environment

**File**: `.env.test`

```bash
# Database (separate test database)
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market_test"

# Auth (test values)
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="test-secret-at-least-32-characters-long"

# Payments (mock/test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_mock"
STRIPE_SECRET_KEY="sk_test_mock"
STRIPE_WEBHOOK_SECRET="whsec_test_mock"

# Application
NODE_ENV="test"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Disable external services in tests
SKIP_ENV_VALIDATION="true"
LOG_LEVEL="error"
NEXT_PUBLIC_OTEL_ENABLED="false"
```

**Test Setup**:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- path/to/test.spec.ts

# Run in watch mode
npm test -- --watch
```

---

## 🔌 Service Integrations

### Stripe Configuration

**Setup Steps**:

1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard > Developers > API keys
3. Setup webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook signing secret

**Environment Variables**:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Testing**:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

---

### PayPal Configuration

**Setup Steps**:

1. Create PayPal Developer account at https://developer.paypal.com
2. Create app in Dashboard
3. Get Client ID and Secret
4. Setup webhook:
   - URL: `https://your-domain.com/api/webhooks/paypal`
   - Events: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`

**Environment Variables**:
```bash
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-client-secret"
PAYPAL_MODE="sandbox"  # or "live" for production
PAYPAL_WEBHOOK_ID="your-webhook-id"
```

**Testing**:
- Use sandbox accounts from https://developer.paypal.com/developer/accounts/
- Test cards: https://developer.paypal.com/tools/sandbox/card-testing/

---

### Email Service (SendGrid)

**Setup Steps**:

1. Create SendGrid account at https://sendgrid.com
2. Verify sender email/domain
3. Create API key with "Mail Send" permissions
4. Configure DNS records for domain authentication

**Environment Variables**:
```bash
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="SG.your-sendgrid-api-key"
EMAIL_FROM="noreply@farmersmarket.com"
```

**Testing**:
```bash
# Send test email via API
curl -X POST https://localhost:3001/api/email/test
```

---

### Cloud Storage (Cloudinary)

**Setup Steps**:

1. Create Cloudinary account at https://cloudinary.com
2. Get cloud name and API credentials from Dashboard
3. Configure upload presets (optional)

**Environment Variables**:
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Usage Example**:
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image
const result = await cloudinary.uploader.upload(file);
```

---

### Redis Cache

**Setup Steps**:

1. Development: Run via Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```

2. Production: Use managed service (Azure Redis, AWS ElastiCache)

**Environment Variables**:
```bash
# Single instance
REDIS_URL="redis://localhost:6379"

# With password
REDIS_URL="redis://:password@host:6379"

# TLS (production)
REDIS_URL="rediss://:password@host:6380"

# Cluster
REDIS_CLUSTER_ENDPOINTS="node1:6379,node2:6379,node3:6379"
```

**Usage Example**:
```typescript
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

await client.connect();
await client.set('key', 'value', { EX: 3600 });
const value = await client.get('key');
```

---

### Monitoring (Azure Application Insights)

**Setup Steps**:

1. Create Application Insights resource in Azure Portal
2. Copy Connection String
3. Configure in environment

**Environment Variables**:
```bash
AZURE_APPINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=...;LiveEndpoint=..."
NEXT_PUBLIC_OTEL_ENABLED="true"
OTEL_SERVICE_NAME="farmers-market-platform"
```

**Features Tracked**:
- Request/response times
- Error rates
- Custom events
- User flows
- Performance metrics

---

## 🔒 Security & Secrets

### Secret Generation

**NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

**JWT Secrets**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Strong Passwords**:
```bash
openssl rand -base64 24
```

---

### Secret Management

**Development**:
- Store in `.env` (git-ignored)
- Use `.env.example` as template
- Never commit real secrets

**Production**:
- Azure Key Vault (recommended for Azure deployments)
- AWS Secrets Manager (for AWS deployments)
- HashiCorp Vault (platform-agnostic)
- Kubernetes Secrets (for K8s deployments)

**Example: Azure Key Vault Integration**:

```typescript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const client = new SecretClient(
  "https://your-vault.vault.azure.net",
  credential
);

const secret = await client.getSecret("database-url");
process.env.DATABASE_URL = secret.value;
```

---

### Security Best Practices

**✅ DO**:
- ✅ Use environment variables for all secrets
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use different secrets per environment
- ✅ Enable MFA for service accounts
- ✅ Use secret management services in production
- ✅ Audit secret access regularly
- ✅ Use strong, randomly generated secrets

**❌ DON'T**:
- ❌ Commit `.env` files to git
- ❌ Share secrets via email or Slack
- ❌ Use the same secret across environments
- ❌ Hardcode secrets in code
- ❌ Log secrets (even in development)
- ❌ Use weak or guessable secrets
- ❌ Store secrets in frontend code

---

### Environment Variable Validation

**Automatic Validation** (on startup):

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Payments
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

**Manual Validation**:

```bash
# Check all required variables are set
npm run verify:env

# Test database connection
npm run prisma:studio

# Test Stripe configuration
npm run test:stripe

# Validate all configs
npm run validate:config
```

---

## 🔧 Troubleshooting

### Issue: Environment Variables Not Loading

**Symptoms**:
- Variables undefined at runtime
- `process.env.VAR_NAME` returns undefined

**Solutions**:

1. **Check file name**: Must be exactly `.env` (not `.env.txt` or `.env.local`)

2. **Restart dev server**: Changes require restart
```bash
# Stop server (Ctrl+C) then:
npm run dev
```

3. **Check Next.js prefix**: Client-side variables need `NEXT_PUBLIC_` prefix
```bash
# ❌ Won't work on client
API_KEY="key"

# ✅ Works on client
NEXT_PUBLIC_API_KEY="key"
```

4. **Verify `.env` location**: Must be in project root
```bash
project-root/
├── .env          # ✅ Correct location
├── src/
│   └── .env      # ❌ Wrong location
└── package.json
```

---

### Issue: Database Connection Fails

**Symptoms**:
- `P1001: Can't reach database server`
- Connection timeout errors

**Solutions**:

1. **Verify DATABASE_URL format**:
```bash
# Correct format
DATABASE_URL="postgresql://user:password@host:port/database"

# With SSL (production)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

2. **Check database is running**:
```bash
# For local Docker
docker ps

# Start database
docker-compose up -d postgres
```

3. **Test connection manually**:
```bash
psql "postgresql://user:password@localhost:5432/farmers_market"
```

4. **Check network/firewall**:
- Ensure port 5432 is not blocked
- Verify host is reachable

---

### Issue: Stripe Webhooks Not Working

**Symptoms**:
- Webhook events not received
- Signature verification fails

**Solutions**:

1. **Use Stripe CLI for local testing**:
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

2. **Verify webhook secret**:
```bash
# Get from Stripe CLI output or dashboard
STRIPE_WEBHOOK_SECRET="whsec_..."
```

3. **Check endpoint URL**:
- Development: Use Stripe CLI
- Production: Must be publicly accessible HTTPS URL

4. **Verify signature validation** in webhook handler:
```typescript
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const sig = headers().get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig!,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

---

### Issue: NextAuth Errors

**Symptoms**:
- "Missing NEXTAUTH_SECRET" error
- Redirect loops
- Session not persisting

**Solutions**:

1. **Generate proper secret**:
```bash
openssl rand -base64 32
# Copy output to NEXTAUTH_SECRET
```

2. **Verify NEXTAUTH_URL**:
```bash
# Must match your application URL exactly
NEXTAUTH_URL="http://localhost:3001"  # Development
NEXTAUTH_URL="https://farmersmarket.com"  # Production
```

3. **Check callback URLs**:
- OAuth providers must have correct callback URLs
- Format: `https://your-domain.com/api/auth/callback/[provider]`

4. **Clear browser cookies** and restart:
```bash
# Clear site data in browser, then:
npm run dev
```

---

### Issue: Build Fails in Production

**Symptoms**:
- Build succeeds locally but fails in CI/CD
- Type errors in production build
- Missing environment variables

**Solutions**:

1. **Check all environment variables are set**:
```bash
# In CI/CD, ensure all secrets are configured
# GitHub Actions: Settings > Secrets
# Azure DevOps: Pipelines > Variables
```

2. **Verify TypeScript strict mode**:
```bash
# Run type check locally
npx tsc --noEmit
```

3. **Check Node.js version**:
```bash
# Ensure same version locally and in CI
node --version

# Set in package.json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

4. **Clear build cache**:
```bash
rm -rf .next
npm run build
```

---

## 🎯 Best Practices

### Configuration Management

1. **Use Environment Variables for All Configuration**
   - Never hardcode values
   - Use `.env` files for local development
   - Use secret management in production

2. **Validate Early**
   - Validate all required variables on startup
   - Fail fast with clear error messages
   - Use Zod or similar for validation

3. **Document Everything**
   - Keep `.env.example` updated
   - Document purpose of each variable
   - Include example values

4. **Separate Concerns**
   - Different secrets per environment
   - Different databases per environment
   - Use namespacing (e.g., `DEV_`, `PROD_`)

---

### Development Workflow

1. **Local Development**:
```bash
# 1. Copy template
cp .env.example .env

# 2. Generate secrets
openssl rand -base64 32

# 3. Setup database
npm run prisma:migrate

# 4. Start dev server
npm run dev
```

2. **Making Changes**:
- Update `.env.example` when adding new variables
- Document in this guide
- Update validation schema
- Test in all environments

3. **Testing Configuration**:
```bash
# Verify environment
npm run verify:env

# Test build
npm run build

# Test production mode locally
npm run start
```

---

### Security Checklist

- [ ] All secrets stored securely (not in git)
- [ ] Different secrets per environment
- [ ] Secrets rotated regularly (90 days)
- [ ] MFA enabled for service accounts
- [ ] Secret access audited
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` up to date
- [ ] No secrets in logs
- [ ] HTTPS in production
- [ ] Security headers configured

---

## 📚 Related Documentation

- [Getting Started Guide](../getting-started/README.md) - Initial setup
- [Deployment Guide](../deployment/production-checklist.md) - Production deployment
- [Security Guide](../security/SECURITY_GUIDE.md) - Security best practices
- [Monitoring Guide](../monitoring/MONITORING_SETUP.md) - Observability setup
- [Database Guide](../database/DATABASE_GUIDE.md) - Database configuration

---

## 🆘 Getting Help

**Can't find what you need?**

1. Check related documentation (links above)
2. Search GitHub issues
3. Ask in team Slack channel: `#platform-support`
4. Create GitHub issue with `[config]` tag

**For emergencies**:
- On-call engineer: See runbook
- Production issues: Incident response channel

---

**Document Status**: 🟢 Active and Maintained
**Last Updated**: January 17, 2025
**Next Review**: February 2025
**Maintained By**: DevOps Team

---

_"Configuration is the bridge between code and reality. Make it divine."_ ⚙️✨
