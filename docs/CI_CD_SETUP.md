# CI/CD Configuration Guide

Complete Continuous Integration and Continuous Deployment setup for the Farmers Market Platform.

## 📋 Overview

The platform uses GitHub Actions for automated testing, building, and deployment with the following workflows:

### Workflows Created

1. **`ci.yml`** - Continuous Integration
2. **`cd.yml`** - Continuous Deployment
3. **`docker-publish.yml`** - Docker Image Publishing
4. **`pr-checks.yml`** - Pull Request Validation
5. **`scheduled-tasks.yml`** - Automated Maintenance
6. **`dependabot.yml`** - Dependency Management

---

## 🔧 Setup Instructions

### 1. Required GitHub Secrets

Add these secrets in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

#### Docker Hub

```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-token
```

#### Production Server

```
PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=your-ssh-user
PRODUCTION_SSH_KEY=your-private-ssh-key
```

#### Staging Server (Optional)

```
STAGING_HOST=staging-server-ip
STAGING_USER=staging-ssh-user
STAGING_SSH_KEY=staging-private-ssh-key
```

#### Notifications (Optional)

```
SLACK_WEBHOOK=your-slack-webhook-url
SNYK_TOKEN=your-snyk-api-token
```

### 2. Server Prerequisites

Your production/staging servers need:

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/farmers-market
sudo chown $USER:$USER /opt/farmers-market

# Clone repository
cd /opt/farmers-market
git clone https://github.com/your-org/farmers-market.git .

# Create .env file
cp .env.example .env
# Edit .env with production credentials
```

---

## 🚀 Workflow Details

### CI Workflow (`ci.yml`)

**Triggers:** Push to main/master/develop, Pull Requests

**Jobs:**

1. **Code Quality** - Linting, formatting, type checking
2. **Tests** - Unit & integration tests with PostgreSQL + Redis
3. **Security Scan** - npm audit, Snyk scanning
4. **Docker Build** - Multi-stage Docker image build
5. **Prisma Validation** - Schema validation and formatting
6. **Performance** - Build analysis and bundle size check

**Environment Variables:**

```yaml
NODE_VERSION: "20"
POSTGRES_VERSION: "15"
```

### CD Workflow (`cd.yml`)

**Triggers:**

- Push to main/master (production)
- Push to develop (staging)
- Manual workflow dispatch

**Jobs:**

1. **Deploy Staging** - Deploy to staging environment
2. **Deploy Production** - Deploy with health checks & rollback
3. **Database Migration** - Prisma migrate deploy
4. **Smoke Tests** - Post-deployment validation

**Deployment Process:**

```
Build → Push to Registry → SSH to Server → Pull Image →
Deploy → Run Migrations → Health Check → Notify
```

### Docker Publish Workflow

**Triggers:** Push to main branches, version tags

**Features:**

- Multi-platform builds (amd64, arm64)
- GitHub Container Registry (ghcr.io)
- Image signing with Cosign
- Semantic versioning from git tags

**Image Tags Generated:**

```
ghcr.io/your-org/farmers-market:latest
ghcr.io/your-org/farmers-market:v1.2.3
ghcr.io/your-org/farmers-market:sha-abc123
```

### PR Checks Workflow

**Triggers:** Pull request events

**Validation:**

- Semantic PR titles (feat, fix, docs, etc.)
- Automated code review with ReviewDog
- Coverage diff comparison
- Build preview
- Lighthouse performance check

### Scheduled Tasks Workflow

**Schedule:** Daily at 2 AM UTC

**Tasks:**

- Database backup (30-day retention)
- Dependency update check
- Security audit
- Database health check
- Docker resource cleanup

---

## 📊 Branch Strategy

```
main/master  → Production deployment
develop      → Staging deployment
feature/*    → PR checks only
hotfix/*     → PR checks + fast-track to main
```

### Recommended Git Flow

```bash
# Feature development
git checkout -b feature/new-feature develop
# ... make changes
git push origin feature/new-feature
# Create PR to develop

# Release to staging
git checkout develop
git merge feature/new-feature
git push origin develop  # Auto-deploys to staging

# Release to production
git checkout main
git merge develop
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin main --tags  # Auto-deploys to production
```

---

## 🔐 Security Best Practices

### SSH Key Setup

```bash
# Generate SSH key pair (on your local machine)
ssh-keygen -t ed25519 -C "github-actions@farmersmarket.app" -f ~/.ssh/gh_actions

# Copy public key to server
ssh-copy-id -i ~/.ssh/gh_actions.pub user@your-server

# Add private key to GitHub Secrets
cat ~/.ssh/gh_actions | pbcopy  # macOS
cat ~/.ssh/gh_actions | xclip   # Linux
```

### Docker Hub Token

```bash
# Create read/write token at https://hub.docker.com/settings/security
# Add token (not password) to DOCKER_PASSWORD secret
```

### Environment Variables

Never commit these files:

- `.env`
- `.env.local`
- `.env.production`

Always use GitHub Secrets for sensitive data.

---

## 📈 Monitoring & Notifications

### Slack Integration

```bash
# Create Incoming Webhook
# https://api.slack.com/messaging/webhooks
# Add to SLACK_WEBHOOK secret
```

### GitHub Actions Dashboard

Monitor workflows at:

```
https://github.com/your-org/farmers-market/actions
```

### Deployment Status Badges

Add to README.md:

```markdown
![CI](https://github.com/your-org/farmers-market/workflows/CI/badge.svg)
![CD](https://github.com/your-org/farmers-market/workflows/CD/badge.svg)
```

---

## 🐛 Troubleshooting

### Build Failures

**Problem:** TypeScript errors fail build
**Solution:** Set `ignoreBuildErrors: true` in `next.config.mjs` (temporary)

**Problem:** Prisma migration fails
**Solution:** Check DATABASE_URL secret, verify PostGIS extension

### Deployment Failures

**Problem:** SSH connection timeout
**Solution:** Verify server IP in secrets, check firewall rules

**Problem:** Docker image pull fails
**Solution:** Verify Docker Hub credentials, check image exists

### Database Issues

**Problem:** Migration fails in production
**Solution:** Create manual backup first:

```bash
docker-compose exec postgres pg_dump -U farmersmarket farmersmarket > backup.sql
```

---

## 🔄 Rollback Procedures

### Manual Rollback

```bash
# SSH to server
ssh user@production-server

cd /opt/farmers-market

# View available images
docker images | grep farmers-market

# Use previous version
docker-compose down app
docker tag farmersmarket/app:latest farmersmarket/app:backup
docker pull farmersmarket/app:prod-<previous-sha>
docker tag farmersmarket/app:prod-<previous-sha> farmersmarket/app:latest
docker-compose up -d app

# Restore database if needed
docker-compose exec -T postgres psql -U farmersmarket farmersmarket < backup.sql
```

### Automated Rollback

The CD workflow includes automatic rollback on health check failure.

---

## 📝 Testing Deployments

### Test Staging

```bash
# Push to develop branch
git push origin develop

# Check deployment status
gh workflow view CD --log

# Test staging environment
curl https://staging.farmersmarket.app/api/health
```

### Test Production

```bash
# Create release tag
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0

# Monitor deployment
gh run watch

# Verify production
curl https://farmersmarket.app/api/health
```

---

## 🎯 Performance Optimization

### Cache Strategy

GitHub Actions caches:

- npm dependencies
- Docker layer cache (GHA)
- Build artifacts

### Parallel Jobs

Workflows run jobs in parallel when possible:

- Quality checks + Tests run simultaneously
- Security scan runs independently
- Build happens after tests pass

### Resource Usage

**Approximate CI/CD Costs:**

- CI: ~5-10 minutes per run
- CD: ~10-15 minutes per deployment
- GitHub Actions: 2,000 free minutes/month
- Estimated: ~20-30 deployments/month within free tier

---

## 🔧 Customization

### Add New Workflow

```yaml
name: Custom Workflow

on:
  push:
    branches: [main]

jobs:
  custom-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Custom task"
```

### Modify Deployment Steps

Edit `.github/workflows/cd.yml`:

- Add pre-deployment tasks
- Custom health checks
- Additional notifications

### Change Schedule

Edit `.github/workflows/scheduled-tasks.yml`:

```yaml
schedule:
  - cron: "0 2 * * *" # Daily at 2 AM
  - cron: "0 */6 * * *" # Every 6 hours
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## ✅ Verification Checklist

Before going live:

- [ ] All GitHub Secrets configured
- [ ] SSH access to servers verified
- [ ] Docker installed on servers
- [ ] `.env` files configured on servers
- [ ] Database backups automated
- [ ] Health check endpoints working
- [ ] Rollback procedure tested
- [ ] Team notified of deployment process
- [ ] Monitoring dashboard setup
- [ ] Documentation reviewed

---

## 🎉 Success!

Your CI/CD pipeline is ready! Every commit now triggers:

- ✅ Automated testing
- ✅ Security scanning
- ✅ Docker image building
- ✅ Automated deployment
- ✅ Health monitoring

**Push code with confidence!** 🚀
