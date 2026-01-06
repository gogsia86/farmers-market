# 🚀 GitHub Actions Workflows - Quick Reference

## 📋 Overview

This directory contains automated CI/CD workflows for the Farmers Market Platform.

---

## 🗂️ Available Workflows

### 1. **Production Deployment** (`vercel-production.yml`)

**Purpose**: Automatically deploy to production on every push to master

**Triggers**:
- Push to `master` or `main` branch
- Manual trigger via GitHub UI

**What it does**:
1. ✅ Runs quality checks (ESLint, TypeScript)
2. 🏗️ Tests the build
3. 🚀 Deploys to Vercel production
4. 🏥 Runs health checks
5. ✅ Verifies deployment
6. 💬 Posts commit comment with deployment URL

**Environment**: `production`
**URL**: https://farmers-market-platform.vercel.app
**Duration**: ~6-7 minutes

---

### 2. **Preview Deployment** (`vercel-preview.yml`)

**Purpose**: Create isolated preview environments for pull requests

**Triggers**:
- Pull request opened, updated, or reopened
- Manual trigger via GitHub UI

**What it does**:
1. ✅ Runs quality checks
2. 🏗️ Tests the build
3. 🚀 Deploys to Vercel preview
4. 🏥 Runs health checks
5. 💬 Posts PR comment with preview URL
6. 🔦 Optional: Lighthouse audit

**Environment**: `preview`
**URL**: `https://farmers-market-platform-[hash].vercel.app`
**Duration**: ~5-6 minutes

---

## 🔧 Required Secrets

These must be set in GitHub repository settings:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VERCEL_TOKEN` | Vercel authentication token | `abc123...` |
| `VERCEL_ORG_ID` | Vercel organization ID | `gogsias-projects` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_xxxxx` |

**Setup Guide**: See `GITHUB_ACTIONS_SETUP.md` for detailed instructions

---

## 🎯 Quick Commands

### Trigger Manual Deployment

**Via GitHub UI**:
1. Go to **Actions** tab
2. Select "Deploy to Vercel Production"
3. Click **Run workflow**
4. Select branch and click **Run workflow**

**Via GitHub CLI**:
```bash
# Production deployment
gh workflow run vercel-production.yml

# Check status
gh run list

# Watch live logs
gh run watch
```

### View Workflow Logs

```bash
# List recent runs
gh run list

# View specific run
gh run view [run-id]

# Download logs
gh run download [run-id]
```

### Check Deployment Status

```bash
# Via Vercel CLI
npx vercel ls

# Inspect deployment
npx vercel inspect https://farmers-market-platform.vercel.app

# View runtime logs
npx vercel logs https://farmers-market-platform.vercel.app
```

---

## 📊 Workflow Status

### Production Deployment Status

[![Deploy to Vercel Production](https://github.com/gogsia86/farmers-market/actions/workflows/vercel-production.yml/badge.svg)](https://github.com/gogsia86/farmers-market/actions/workflows/vercel-production.yml)

### Preview Deployment Status

[![Deploy to Vercel Preview](https://github.com/gogsia86/farmers-market/actions/workflows/vercel-preview.yml/badge.svg)](https://github.com/gogsia86/farmers-market/actions/workflows/vercel-preview.yml)

---

## 🔍 Monitoring

### View All Workflows

```bash
# List all workflows
gh workflow list

# View workflow runs
gh run list --workflow=vercel-production.yml

# Filter by status
gh run list --status=failure
```

### Check Recent Deployments

**GitHub UI**:
- Go to **Actions** tab
- Filter by workflow
- Click on any run to see details

**Vercel Dashboard**:
- Visit: https://vercel.com/gogsias-projects/farmers-market-platform
- Click **Deployments** tab

---

## 🐛 Troubleshooting

### Workflow Not Running?

**Check**:
1. Secrets are correctly set (Settings → Secrets and variables → Actions)
2. Workflows are enabled (Settings → Actions → General)
3. YAML syntax is valid (use a YAML validator)
4. Branch name matches trigger (`master` or `main`)

### Deployment Failed?

**Steps**:
1. Check workflow logs in Actions tab
2. Verify Vercel token is valid
3. Check Vercel dashboard for errors
4. Review build logs for errors
5. Verify environment variables in Vercel

**Common Issues**:
- ❌ Invalid/expired Vercel token → Create new token
- ❌ Build errors → Check TypeScript/ESLint errors
- ❌ Missing dependencies → Run `npm install` locally
- ❌ Environment variables → Check Vercel dashboard

### Health Checks Failing?

**Steps**:
1. Check Vercel runtime logs: `npx vercel logs [url]`
2. Verify DATABASE_URL is set correctly
3. Check database connectivity
4. Review environment variables
5. Run local verification: `./scripts/verify-production.sh`

---

## 📚 Documentation

### Setup & Configuration
- [GitHub Actions Setup Guide](../GITHUB_ACTIONS_SETUP.md) - Complete setup instructions
- [Deployment Troubleshooting](../DEPLOYMENT_TROUBLESHOOTING.md) - Common issues and solutions

### Vercel & Deployment
- [Vercel Build Fixes](../VERCEL_BUILD_FIXES.md) - Build configuration
- [Environment Variables Setup](../ADD_ENV_VARS.md) - Required environment variables
- [Deployment Checklist](../DEPLOYMENT_FIX_CHECKLIST.md) - Pre-deployment checks

### Project Documentation
- [Next Steps Guide](../NEXT_STEPS.md) - Post-deployment actions
- [Deployment Status](../DEPLOYMENT_STATUS.md) - Current deployment info

---

## 🎨 Workflow Customization

### Add Slack Notifications

Edit workflow file and add:

```yaml
- name: 📢 Notify Slack
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "🚀 Deployed to production: ${{ steps.deploy.outputs.url }}"
      }
```

### Skip Deployment for Docs Changes

Add to workflow trigger:

```yaml
on:
  push:
    branches: [master]
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

### Add Email Notifications

```yaml
- name: 📧 Send notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Deployment Status
    to: team@example.com
    body: Deployment completed successfully
```

---

## 🔒 Security Best Practices

### Secrets Management
- ✅ Never commit secrets to git
- ✅ Rotate tokens every 90 days
- ✅ Use least-privilege tokens
- ✅ Audit secret access regularly

### Token Rotation
1. Create new Vercel token (https://vercel.com/account/tokens)
2. Update `VERCEL_TOKEN` in GitHub Secrets
3. Test with manual workflow run
4. Delete old token from Vercel

### Access Control
- Review team access to secrets monthly
- Use environment protection rules for production
- Require PR reviews before merging to master

---

## 📈 Performance Tips

### Faster Builds
1. ✅ Dependency caching (already enabled)
2. ✅ Parallel job execution
3. Consider: Self-hosted runners for better network
4. Consider: Incremental builds

### Optimize Workflow
- Skip quality checks for trusted commits
- Use conditional job execution
- Cache build artifacts between jobs
- Use matrix strategy for parallel testing

---

## 📞 Support

### Issues & Questions
- **GitHub Issues**: https://github.com/gogsia86/farmers-market/issues
- **Discussions**: https://github.com/gogsia86/farmers-market/discussions

### External Resources
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: support@vercel.com

---

## 🔄 Maintenance Schedule

### Weekly
- [ ] Review failed workflows
- [ ] Check deployment metrics

### Monthly
- [ ] Review GitHub Actions usage
- [ ] Audit secret access
- [ ] Review workflow performance

### Quarterly
- [ ] Rotate Vercel tokens
- [ ] Update Node.js version
- [ ] Review deployment strategy
- [ ] Team training on CI/CD

---

## ✨ Benefits of This Setup

✅ **Reliable Deployments** - No more webhook issues
✅ **Automatic Testing** - Catch errors before production
✅ **Preview Environments** - Test PRs before merging
✅ **Health Checks** - Verify deployments automatically
✅ **Full Visibility** - Clear logs and status reports
✅ **Team Collaboration** - PR comments with preview URLs

---

**Last Updated**: January 6, 2026
**Version**: 1.0
**Status**: ✅ Production Ready

For detailed setup instructions, see [GITHUB_ACTIONS_SETUP.md](../GITHUB_ACTIONS_SETUP.md)
