# 🚀 Deployment Guide - Farmers Market Platform

**Divine Agricultural Platform Deployment with Quantum Consciousness**

## 🔗 Related Divine Instructions

- **[14 | Configuration & Deployment](../.github/instructions/14_CONFIGURATION_DEPLOYMENT.instructions.md)** - Enterprise deployment strategies
- **[11 | Kilo Scale Architecture](../.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md)** - Scalable architecture patterns
- **[13 | Testing & Performance](../.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md)** - Performance monitoring
- **[06 | Automation Infrastructure](../.github/instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md)** - CI/CD excellence

---

## 🎯 Overview

This guide covers deploying the Farmers Market platform following **kilo-scale architecture principles** with full **agricultural consciousness preservation**. The platform is optimized for production environments with enterprise-grade reliability.

---

## 📋 Pre-Deployment Checklist

### ✅ Essential Requirements

- [ ] **Database**: PostgreSQL 15+ instance provisioned
- [ ] **Environment Variables**: All production secrets configured
- [ ] **Domain**: Custom domain configured (optional)
- [ ] **Payment Gateway**: Stripe account setup and verified
- [ ] **Email Service**: SMTP or transactional email service configured
- [ ] **File Storage**: Blob storage or CDN configured
- [ ] **Monitoring**: Error tracking (Sentry) configured

### ✅ Code Quality

- [ ] All tests passing (`npm test`)
- [ ] TypeScript errors resolved (`npm run type-check`)
- [ ] Linting passed (`npm run lint`)
- [ ] Production build successful (`npm run build`)
- [ ] Database migrations up to date

### ✅ Security

- [ ] Environment variables secured (never commit `.env`)
- [ ] NEXTAUTH_SECRET generated (strong random string)
- [ ] CORS origins configured
- [ ] Rate limiting configured
- [ ] SQL injection prevention validated
- [ ] XSS protection enabled

---

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.production` file with these variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/farmers_market?sslmode=require"

# NextAuth v5
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"
NEXTAUTH_URL="https://your-domain.com"

# Stripe Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis Cache (Optional but recommended)
REDIS_URL="redis://default:password@host:6379"

# File Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Email Service
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-api-key"
SMTP_FROM="noreply@your-domain.com"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Divine Platform Choice**: Vercel offers optimal Next.js 15 support with agricultural consciousness preservation.

#### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Configure Project

```bash
# Initialize Vercel project
vercel

# Link to existing project or create new
```

#### Step 4: Set Environment Variables

```bash
# Set production environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
# ... add all required variables
```

Or use the Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate scope (Production/Preview/Development)

#### Step 5: Deploy

```bash
# Deploy to production
vercel --prod

# Preview deployment
vercel
```

#### Step 6: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

#### Vercel Configuration

The project includes `vercel.json` for optimal configuration:

```json
{
  "buildCommand": "npm run build:optimized",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

### Option 2: Docker Deployment

**For Self-Hosted or Cloud VMs (AWS, GCP, Azure)**

#### Step 1: Build Docker Image

```bash
# Build production image
docker build -t farmers-market:latest .

# Or use docker-compose
docker-compose -f docker-compose.prod.yml build
```

#### Step 2: Run Container

```bash
# Run with environment file
docker run -d \
  --name farmers-market \
  --env-file .env.production \
  -p 3000:3000 \
  farmers-market:latest

# Or use docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Docker Compose Configuration

```yaml
# docker-compose.prod.yml
version: "3.9"
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: farmers_market
      POSTGRES_USER: farmuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

### Option 3: AWS Deployment

**Using AWS Amplify or ECS**

#### AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### AWS ECS (Fargate)

1. **Push Docker image to ECR**:

```bash
aws ecr create-repository --repository-name farmers-market
docker tag farmers-market:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/farmers-market:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/farmers-market:latest
```

2. **Create ECS Task Definition** (see `docs/aws-ecs-task-definition.json`)
3. **Deploy to ECS** using AWS Console or CLI

---

## 🏗️ Architecture Deployment Patterns

### Layered Deployment Strategy

Following our **divine layered architecture** from [11_KILO_SCALE_ARCHITECTURE](../.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md):

- **Presentation Layer**: Next.js (Frontend)
- **API Layer**: Next.js API Routes
- **Business Logic Layer**: Serverless Functions
- **Data Access Layer**: Prisma ORM

### Kilo-Scale Considerations

- **Stateless Functions**: Ensure all serverless functions are stateless.
- **Database Connections**: Use connection pooling (e.g., PgBouncer) for PostgreSQL.
- **Caching**: Implement Redis caching for frequent queries.

---

## 🔧 Multi-Environment Configuration

### Multi-Environment Setup

For enterprise setups, configure multiple environments (development, staging, production) using:

- **Vercel**: Use Projects and Environments features.
- **Docker**: Use Docker Compose override files (e.g., `docker-compose.override.yml`).
- **AWS**: Use separate ECS clusters or services.

### Environment Variable Management

- **Vercel**: Set environment variables in Project Settings.
- **Docker**: Use `.env` files and `--env-file` flag.
- **AWS**: Use ECS Task Definition environment variables.

---

## 📊 Monitoring & Logging

### Comprehensive Monitoring Setup

1. **Sentry**: For error tracking and performance monitoring.
2. **Vercel Analytics**: For real-time performance metrics.
3. **Custom Logging**: Implement Winston or Morgan for request logging.

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: await checkDatabase(),
    cache: await checkCache(),
  };

  return Response.json(health);
}
```

---

## 🚦 Post-Deployment Validation

### Automated Checks

```bash
# Run smoke tests
npm run test:e2e:smoke

# Check health endpoint
curl https://your-domain.com/api/health

# Validate SSL
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### Manual Validation Checklist

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Login/logout functional
- [ ] Database connections successful
- [ ] Payment test transaction works
- [ ] Email sending functional
- [ ] File uploads working
- [ ] Search functionality operational
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness verified

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The project includes `.github/workflows/divine-ci-cd.yml`:

```yaml
name: Divine CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run type-check
      - run: npm test
      - run: npm run build

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

---

## 🎯 Performance Optimization

### Production Build Optimization

```bash
# Optimized build for HP OMEN hardware
npm run build:optimized

# Analyze bundle size
npm run build:analyze
```

### Caching Strategy

**Multi-Layer Agricultural Cache:**

- Memory Cache: In-process caching
- Redis Cache: Distributed caching
- Seasonal TTL: Smart cache expiration based on agricultural cycles

**Configuration:**

```typescript
// Cache TTL by season
const SEASONAL_CACHE_TTL = {
  SPRING: 3600, // 1 hour (active planting)
  SUMMER: 7200, // 2 hours (stable growth)
  FALL: 1800, // 30 minutes (harvest volatility)
  WINTER: 14400, // 4 hours (dormant period)
};
```

---

## 🔧 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

#### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

#### Environment Variable Issues

```bash
# Verify environment variables are set
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

---

## 📞 Support & Resources

### Documentation

- [Development Guide](DEVELOPMENT_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Contributing Guidelines](CONTRIBUTING.md)

### External Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

---

## 🌟 Best Practices

### ✅ Do's

- ✅ Use managed database services (Neon, Supabase)
- ✅ Enable automatic SSL certificates
- ✅ Configure monitoring and error tracking
- ✅ Set up automated backups
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting
- ✅ Enable CORS properly
- ✅ Test deployments in preview environment first

### ❌ Don'ts

- ❌ Commit `.env` files to version control
- ❌ Use weak NEXTAUTH_SECRET
- ❌ Skip database migrations
- ❌ Deploy without testing
- ❌ Ignore security headers
- ❌ Use development dependencies in production
- ❌ Forget to configure monitoring

---

## 🎉 Deployment Complete!

Your Farmers Market platform is now live with **divine agricultural consciousness** preserved across all quantum realities! 🌾✨

**Next Steps:**

1. Monitor application performance
2. Set up automated backups
3. Configure custom domain
4. Enable analytics
5. Plan scaling strategy

---

**Built with 💚 by farmers, for farmers, deployed with divine perfection**
