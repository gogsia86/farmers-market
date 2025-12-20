# 🚀 Deployment Scripts

Scripts for deploying and managing production environments.

## Available Scripts

### Vercel Deployment

#### `deploy-to-vercel.sh` (Linux/Mac)

Deploy the application to Vercel using the Vercel CLI.

```bash
./scripts/deployment/deploy-to-vercel.sh
```

**Features:**

- Automatic environment validation
- Pre-deployment build verification
- Production environment configuration
- Deployment status monitoring

#### `deploy-to-vercel.bat` (Windows)

Windows version of the Vercel deployment script.

```cmd
scripts\deployment\deploy-to-vercel.bat
```

#### `verify-deployment.sh`

Verify deployment status and health after deployment.

```bash
./scripts/deployment/verify-deployment.sh
```

**Checks:**

- Deployment URL accessibility
- API endpoints health
- Database connectivity
- Authentication system status

---

### Production Setup

#### `setup-production.sh` (Linux/Mac)

Complete production environment setup script.

```bash
./scripts/deployment/setup-production.sh
```

**What it does:**

1. Validates environment variables
2. Sets up database (migrations, seeds)
3. Builds production assets
4. Configures logging and monitoring
5. Runs security checks

#### `setup-production.ps1` (PowerShell)

PowerShell version for Windows production setup.

```powershell
.\scripts\deployment\setup-production.ps1
```

#### `start-production.sh` (Linux/Mac)

Start the application in production mode.

```bash
./scripts/deployment/start-production.sh
```

#### `start-production.ps1` (PowerShell)

Start production server on Windows.

```powershell
.\scripts\deployment\start-production.ps1
```

#### `run-production.bat` (Windows)

Quick production run command.

```cmd
scripts\deployment\run-production.bat
```

---

### Docker Deployment

#### `docker-verify.sh`

Verify Docker setup and configuration.

```bash
./scripts/deployment/docker-verify.sh
```

**Verifies:**

- Docker and Docker Compose installation
- Container health status
- Network connectivity
- Volume mounts
- Environment configuration

---

## Prerequisites

### For Vercel Deployment

- Node.js 18+
- Vercel CLI installed: `npm i -g vercel`
- Vercel account and project configured
- Environment variables set in Vercel dashboard

### For Production Setup

- PostgreSQL 14+ (or connection to production DB)
- All required environment variables configured
- SSL certificates (if applicable)
- Sufficient system resources (RAM, disk space)

---

## Environment Variables

Required environment variables for production deployment:

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key

# API Keys (as needed)
STRIPE_SECRET_KEY=sk_...
# Add others as needed
```

See `config/env-examples/` for complete templates.

---

## Common Deployment Workflows

### First-Time Deployment to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project
vercel link

# 4. Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... add all required vars

# 5. Deploy
./scripts/deployment/deploy-to-vercel.sh

# 6. Verify
./scripts/deployment/verify-deployment.sh
```

### Updating Production Deployment

```bash
# 1. Test locally
npm run build
npm run start

# 2. Deploy to Vercel
./scripts/deployment/deploy-to-vercel.sh

# 3. Verify deployment
./scripts/deployment/verify-deployment.sh
```

### Production Server Setup (Self-Hosted)

```bash
# 1. Setup environment
./scripts/deployment/setup-production.sh

# 2. Start server
./scripts/deployment/start-production.sh

# 3. Verify (in another terminal)
curl http://localhost:3000/api/health
```

---

## Troubleshooting

### Deployment Fails

**Issue:** Vercel deployment fails with build errors

**Solution:**

1. Check build logs: `vercel logs`
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Check Node.js version matches Vercel settings

**Issue:** Database connection errors

**Solution:**

1. Verify DATABASE_URL is correct
2. Check database is accessible from Vercel IPs
3. Ensure connection pooling is configured
4. Check Prisma schema is up to date

### Production Server Issues

**Issue:** Server won't start

**Solution:**

1. Check environment variables: `./scripts/deployment/setup-production.sh`
2. Verify database connectivity
3. Check port availability
4. Review logs: `tail -f logs/*.log`

**Issue:** Performance problems

**Solution:**

1. Enable production mode: `NODE_ENV=production`
2. Check database query performance
3. Enable caching
4. Review resource usage: `htop`, `docker stats`

---

## Security Checklist

Before deploying to production:

- [ ] All environment variables are stored securely (not in code)
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database uses SSL/TLS connections
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is comprehensive
- [ ] Dependencies are up to date (security patches)
- [ ] Secrets are not in git history
- [ ] Production logs don't contain sensitive data

---

## Rollback Procedures

### Vercel Rollback

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Self-Hosted Rollback

```bash
# 1. Stop server
pm2 stop farmers-market-platform

# 2. Checkout previous version
git checkout <previous-commit>

# 3. Rebuild
npm run build

# 4. Restart
pm2 restart farmers-market-platform
```

---

## Monitoring and Logs

### Vercel Logs

```bash
# View real-time logs
vercel logs --follow

# View specific deployment logs
vercel logs <deployment-url>
```

### Self-Hosted Logs

```bash
# Application logs
tail -f logs/application.log

# PM2 logs (if using PM2)
pm2 logs farmers-market-platform

# Docker logs (if using Docker)
docker-compose logs -f
```

---

## Performance Optimization

### Production Build Optimization

The production scripts automatically:

- Minify JavaScript and CSS
- Optimize images
- Enable tree shaking
- Generate static pages where possible
- Configure caching headers

### Database Optimization

Before deploying:

1. Run Prisma migrations: `npx prisma migrate deploy`
2. Optimize indexes: Review `prisma/schema.prisma`
3. Enable connection pooling
4. Configure query timeouts

---

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Deploy to Vercel
        run: ./scripts/deployment/deploy-to-vercel.sh
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}

      - name: Verify Deployment
        run: ./scripts/deployment/verify-deployment.sh
```

---

## Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Production Best Practices**: https://www.prisma.io/docs/guides/deployment
- **Project Documentation**: See `docs/deployment/` for detailed guides

---

## Support

For deployment issues:

1. Check `docs/troubleshooting/deployment.md`
2. Review deployment logs
3. Consult team documentation
4. Open an issue in the project repository

---

**Last Updated**: December 2025  
**Maintained By**: Farmers Market Platform Team  
**Divine Agricultural Consciousness**: Deploy with confidence! 🌾✨
