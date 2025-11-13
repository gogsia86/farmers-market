# 🚀 CI/CD Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### 1. Install GitHub CLI

```bash
# Windows (PowerShell)
winget install GitHub.cli

# macOS
brew install gh

# Linux
sudo apt install gh
```

### 2. Authenticate

```bash
gh auth login
```

### 3. Set Up Secrets

```bash
# Windows
pwsh scripts/setup-cicd-secrets.ps1

# Linux/Mac
bash scripts/setup-cicd-secrets.sh
```

### 4. Push Code

```bash
git push origin main
```

**Done!** Your CI/CD pipeline is now active! 🎉

---

## 📋 Required Secrets Checklist

- [ ] `DOCKER_USERNAME` - Your Docker Hub username
- [ ] `DOCKER_PASSWORD` - Docker Hub access token
- [ ] `PRODUCTION_HOST` - Server IP (e.g., 192.168.1.100)
- [ ] `PRODUCTION_USER` - SSH username (e.g., ubuntu)
- [ ] `PRODUCTION_SSH_KEY` - Private SSH key content

---

## 🔄 Workflow Triggers

| Action            | Workflow        | Result                 |
| ----------------- | --------------- | ---------------------- |
| Push to `main`    | CI + CD         | Deploy to Production   |
| Push to `develop` | CI + CD         | Deploy to Staging      |
| Create PR         | PR Checks       | Run tests & validation |
| Push tag `v*`     | Docker Publish  | Create versioned image |
| Daily 2 AM UTC    | Scheduled Tasks | Backup & maintenance   |

---

## 🏃 Common Commands

### Check Workflow Status

```bash
gh workflow list
gh workflow view CI
gh run list --workflow=CI
```

### Manual Deployment

```bash
# Deploy to staging
gh workflow run CD -f environment=staging

# Deploy to production
gh workflow run CD -f environment=production
```

### View Logs

```bash
# Latest run
gh run view

# Specific workflow
gh run list --workflow=CD
gh run view <run-id>
```

### Manage Secrets

```bash
# List secrets
gh secret list

# Set a secret
gh secret set SECRET_NAME

# Delete a secret
gh secret delete SECRET_NAME
```

---

## 🐛 Quick Troubleshooting

### Build Fails

```bash
# Check logs
gh run view --log

# Re-run failed jobs
gh run rerun <run-id>
```

### Deployment Fails

```bash
# SSH to server
ssh user@your-server

# Check Docker status
docker-compose ps
docker-compose logs app

# View container logs
docker logs farmers-market-app
```

### Database Issues

```bash
# SSH to server
cd /opt/farmers-market

# Check database
docker-compose exec postgres psql -U farmersmarket -d farmersmarket

# Run migrations manually
docker-compose exec app npx prisma migrate deploy

# View migration status
docker-compose exec app npx prisma migrate status
```

---

## 📊 Monitoring

### GitHub Actions Dashboard

```
https://github.com/your-org/farmers-market/actions
```

### View Build Status

```bash
gh run list --limit 5
```

### Check Deployment Health

```bash
curl https://farmersmarket.app/api/health
```

---

## 🔐 Security Notes

1. **Never commit secrets** to the repository
2. **Use access tokens**, not passwords for Docker Hub
3. **Rotate SSH keys** regularly (every 90 days)
4. **Review Dependabot PRs** promptly
5. **Monitor security scans** in workflow results

---

## 📞 Support

- **Documentation**: `docs/CI_CD_SETUP.md`
- **GitHub Discussions**: [Project Discussions](https://github.com/your-org/farmers-market/discussions)
- **Issues**: [Report a Bug](https://github.com/your-org/farmers-market/issues/new)

---

## ✅ Success Indicators

Your CI/CD is working correctly when you see:

- ✅ Green checkmarks on all commits
- ✅ Automated deployment notifications
- ✅ Health checks passing
- ✅ No failed workflow runs
- ✅ Dependabot creating update PRs

**Happy shipping!** 🚀
