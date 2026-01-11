# 🚀 GitHub Actions Setup Guide

## Automated Vercel Deployments via CI/CD

**Last Updated**: January 6, 2026
**Status**: Ready for Implementation
**Estimated Setup Time**: 10 minutes

---

## 📋 Overview

This guide will help you set up GitHub Actions workflows for automated Vercel deployments, bypassing webhook issues and providing reliable CI/CD.

### What You'll Get

✅ **Automatic Production Deployments** - Every push to `master` deploys to production
✅ **Preview Deployments for PRs** - Every pull request gets its own preview URL
✅ **Automated Health Checks** - Verify deployments after they complete
✅ **Quality Gates** - Lint and type-check before deployment
✅ **PR Comments** - Deployment status and URLs posted automatically
✅ **Build Artifacts** - Clear build reports and summaries

---

## 🔧 Prerequisites

Before starting, ensure you have:

- [ ] Admin access to the GitHub repository
- [ ] Admin access to the Vercel project
- [ ] Vercel account with the project deployed

---

## 📝 Step-by-Step Setup

### Step 1: Get Vercel Credentials

#### 1.1 Get Vercel Authentication Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name it: `GitHub Actions CI/CD`
4. Scope: **Full Account**
5. Expiration: **No Expiration** (or set to 1 year)
6. Click **Create Token**
7. **Copy the token** - you'll need it in Step 2

#### 1.2 Get Vercel Organization ID

```bash
# Using Vercel CLI
npx vercel whoami

# Or from dashboard URL
# https://vercel.com/[YOUR-ORG-ID]/farmers-market-platform
#                     ^^^^^^^^^^^^^^^^
#                     This is your ORG ID
```

**Example**: `gogsias-projects` or `team_xxxxxxxxxxxxx`

#### 1.3 Get Vercel Project ID

```bash
# Option A: Using Vercel CLI (recommended)
cd "M:\Repo\Farmers Market Platform web and app"
npx vercel link
cat .vercel/project.json

# Look for "projectId": "prj_xxxxxxxxxxxxx"
```

```bash
# Option B: From .vercel/project.json (if already linked)
cat .vercel/project.json
```

**Example**: `prj_xxxxxxxxxxxxx`

#### 1.4 Alternative: Get IDs from Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `farmers-market-platform`
3. Go to **Settings** → **General**
4. Scroll down to **Project ID** (copy it)
5. The **Organization ID** is in the URL: `vercel.com/[ORG-ID]/project-name`

---

### Step 2: Add GitHub Secrets

#### 2.1 Navigate to Repository Settings

1. Go to your GitHub repository: https://github.com/gogsia86/farmers-market
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

#### 2.2 Add Required Secrets

Add these three secrets one by one:

**Secret 1: VERCEL_TOKEN**

- Name: `VERCEL_TOKEN`
- Value: `[paste token from Step 1.1]`
- Click **Add secret**

**Secret 2: VERCEL_ORG_ID**

- Name: `VERCEL_ORG_ID`
- Value: `[paste org ID from Step 1.2]`
- Example: `gogsias-projects` or `team_xxxxxxxxxxxxx`
- Click **Add secret**

**Secret 3: VERCEL_PROJECT_ID**

- Name: `VERCEL_PROJECT_ID`
- Value: `[paste project ID from Step 1.3]`
- Example: `prj_xxxxxxxxxxxxx`
- Click **Add secret**

#### 2.3 Verify Secrets

After adding all three secrets, you should see:

```
VERCEL_TOKEN          Updated [timestamp]
VERCEL_ORG_ID         Updated [timestamp]
VERCEL_PROJECT_ID     Updated [timestamp]
```

---

### Step 3: Commit and Push Workflows

The workflow files have already been created in `.github/workflows/`:

```
.github/workflows/
├── vercel-production.yml    # Production deployments (master branch)
└── vercel-preview.yml       # Preview deployments (pull requests)
```

Now commit and push them:

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Stage the workflow files
git add .github/workflows/

# Commit
git commit -m "feat: add GitHub Actions workflows for Vercel deployments"

# Push to master (this will trigger the first deployment!)
git push origin master
```

---

### Step 4: Verify Workflows Are Running

#### 4.1 Check GitHub Actions Tab

1. Go to your GitHub repository
2. Click the **Actions** tab (top navigation)
3. You should see a new workflow run: "Deploy to Vercel Production"
4. Click on the workflow to see real-time logs

#### 4.2 Watch the Deployment Progress

The workflow will run these jobs in sequence:

1. **🔍 Quality Checks** (~1 minute)
   - ESLint
   - TypeScript type checking

2. **🏗️ Build Test** (~2 minutes)
   - Test build locally
   - Generate build size report

3. **🚀 Deploy to Production** (~3 minutes)
   - Pull Vercel environment info
   - Build project artifacts
   - Deploy to Vercel production
   - Run health checks

4. **✅ Verify Deployment** (~30 seconds)
   - Run verification script
   - Generate deployment report

**Total time**: ~6-7 minutes

#### 4.3 Check Deployment Output

Once complete, you'll see:

- ✅ Green checkmark next to the workflow run
- 🚀 Deployment URL in the job summary
- 💬 Comment on the commit with deployment details
- 🏥 Health check results

---

### Step 5: Test the Setup

#### 5.1 Test Production Deployment

```bash
# Make a small change
echo "# Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify GitHub Actions deployment"
git push origin master

# Watch it deploy!
# Go to: https://github.com/gogsia86/farmers-market/actions
```

#### 5.2 Test Preview Deployment (Optional)

```bash
# Create a feature branch
git checkout -b test-preview

# Make a change
echo "# Testing preview" >> README.md
git add README.md
git commit -m "test: preview deployment"
git push origin test-preview

# Create a pull request on GitHub
# The preview deployment will trigger automatically
# A comment will be posted with the preview URL
```

---

## 📊 Workflow Features

### Production Workflow (`vercel-production.yml`)

**Triggers:**

- Push to `master` or `main` branch
- Manual trigger from GitHub UI (Actions → Deploy to Vercel Production → Run workflow)

**Steps:**

1. Quality checks (lint, type-check)
2. Build test
3. Deploy to Vercel production
4. Health checks (health endpoint, homepage, API)
5. Post-deployment verification
6. Commit comment with deployment URL

**Environment**: `production`
**URL**: https://farmers-market-platform.vercel.app

### Preview Workflow (`vercel-preview.yml`)

**Triggers:**

- Pull request opened, updated, or reopened
- Manual trigger from GitHub UI

**Steps:**

1. Quality checks
2. Build test
3. Deploy to Vercel preview
4. Health checks
5. PR comment with preview URL and test links
6. Optional: Lighthouse audit (performance scoring)

**Environment**: `preview`
**URL**: `https://farmers-market-platform-[hash]-gogsias-projects.vercel.app`

---

## 🔍 Monitoring and Debugging

### View Workflow Logs

```bash
# List recent workflow runs
gh run list

# View specific run
gh run view [run-id]

# Watch live logs
gh run watch
```

**Or via GitHub UI:**

1. Go to **Actions** tab
2. Click on any workflow run
3. Expand jobs to see detailed logs

### Check Deployment Status

```bash
# Vercel deployments
npx vercel ls

# Inspect specific deployment
npx vercel inspect [deployment-url]

# View runtime logs
npx vercel logs [deployment-url]
```

### Common Issues and Solutions

#### Issue: "Error: Unable to find project"

**Cause**: `VERCEL_PROJECT_ID` or `VERCEL_ORG_ID` is incorrect

**Solution**:

```bash
# Re-link project
npx vercel link
cat .vercel/project.json

# Update GitHub secrets with correct IDs
```

#### Issue: "Error: Invalid token"

**Cause**: `VERCEL_TOKEN` is expired or incorrect

**Solution**:

1. Create a new token at https://vercel.com/account/tokens
2. Update `VERCEL_TOKEN` secret in GitHub
3. Re-run the workflow

#### Issue: "Build failed"

**Cause**: TypeScript errors, missing dependencies, or environment variables

**Solution**:

```bash
# Test build locally
npm run build

# Check for errors
npm run lint
npx tsc --noEmit

# Fix errors and push again
```

#### Issue: Health checks failing

**Cause**: Deployment successful but endpoints not responding

**Solution**:

1. Check Vercel runtime logs: `npx vercel logs [url]`
2. Verify environment variables in Vercel dashboard
3. Check database connectivity
4. Review `DEPLOYMENT_TROUBLESHOOTING.md`

---

## 🎯 Workflow Customization

### Disable Quality Checks

Edit `.github/workflows/vercel-production.yml`:

```yaml
# Comment out or remove the quality-checks job
# jobs:
#   quality-checks:
#     ...

# Update needs in deploy-production
deploy-production:
  needs: [build-test] # Remove quality-checks
```

### Add Slack Notifications

Add this step to the `deploy-production` job:

```yaml
- name: 📢 Notify Slack
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "🚀 Production deployed: ${{ steps.deploy.outputs.url }}"
      }
```

Don't forget to add `SLACK_WEBHOOK_URL` to GitHub secrets.

### Add Email Notifications

Add this step to the `notify-failure` job:

```yaml
- name: 📧 Send email notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "❌ Deployment Failed: ${{ github.repository }}"
    to: team@example.com
    from: GitHub Actions
    body: "Deployment failed. Check logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

### Add Sentry Release Tracking

Add this step after successful deployment:

```yaml
- name: 📊 Create Sentry release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: farmers-market
  with:
    environment: production
    version: ${{ github.sha }}
```

---

## 🔒 Security Best Practices

### Protect Secrets

✅ **DO:**

- Use GitHub Secrets for all sensitive data
- Rotate Vercel tokens every 90 days
- Use least-privilege tokens (project-specific if possible)
- Review secret access regularly

❌ **DON'T:**

- Commit secrets to git
- Share tokens in chat or email
- Use personal tokens for team projects
- Print secrets in logs

### Secret Rotation Schedule

1. **Vercel Token**: Every 90 days
2. **Review Access**: Every 30 days
3. **Audit Logs**: Weekly

```bash
# Check secret last updated
# GitHub → Settings → Secrets and variables → Actions
# Look at "Updated" timestamp
```

### Environment Protection Rules

Consider adding protection rules for production:

1. Go to **Settings** → **Environments**
2. Click **production**
3. Add protection rules:
   - ✅ Required reviewers (1-2 team members)
   - ✅ Wait timer (1 minute)
   - ✅ Deployment branches (only `master`)

---

## 📈 Performance Optimization

### Cache Dependencies

The workflows already cache npm dependencies:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "20.x"
    cache: "npm" # ← Caches node_modules
```

### Parallel Jobs

Consider running quality checks in parallel:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Run ESLint
        run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - name: TypeScript check
        run: npx tsc --noEmit

  deploy:
    needs: [lint, typecheck] # Wait for both
```

### Conditional Deployments

Skip deployment for documentation-only changes:

```yaml
on:
  push:
    branches: [master]
    paths-ignore:
      - "**.md"
      - "docs/**"
      - ".github/**"
```

---

## 🆘 Troubleshooting

### Workflow Not Triggering

**Check:**

1. Workflow file syntax is valid (YAML)
2. Secrets are correctly set
3. GitHub Actions is enabled (Settings → Actions → General)
4. Branch protection rules aren't blocking

### Deployment Succeeds But Site Broken

**Check:**

1. Vercel environment variables (Dashboard → Settings → Environment Variables)
2. Database connectivity from Vercel
3. Runtime logs: `npx vercel logs [url]`
4. Run verification: `./scripts/verify-production.sh`

### Slow Deployments

**Optimize:**

1. Enable dependency caching (already enabled)
2. Reduce build output size
3. Use incremental builds
4. Consider self-hosted runners for faster network

---

## 📚 Additional Resources

### Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)

### Internal Documentation

- [Deployment Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md)
- [Vercel Build Fixes](./VERCEL_BUILD_FIXES.md)
- [Environment Variables Setup](./ADD_ENV_VARS.md)

### Support

- **GitHub Actions**: https://github.com/features/actions
- **Vercel Support**: support@vercel.com
- **Vercel Status**: https://www.vercel-status.com

---

## ✅ Setup Verification Checklist

Use this checklist to verify everything is working:

### Initial Setup

- [ ] Created Vercel authentication token
- [ ] Found Vercel Organization ID
- [ ] Found Vercel Project ID
- [ ] Added all 3 secrets to GitHub
- [ ] Committed workflow files
- [ ] Pushed to master branch

### First Deployment

- [ ] Workflow triggered automatically
- [ ] Quality checks passed
- [ ] Build test passed
- [ ] Deployment completed successfully
- [ ] Health checks passed
- [ ] Verification completed
- [ ] Commit comment posted with URL

### Verification

- [ ] Production URL is accessible: https://farmers-market-platform.vercel.app
- [ ] Health endpoint returns 200: `/api/health`
- [ ] Homepage loads without errors: `/`
- [ ] API endpoints working: `/api/farms`
- [ ] No errors in Vercel logs
- [ ] GitHub Actions badge is green

### Optional Testing

- [ ] Created test branch
- [ ] Created pull request
- [ ] Preview deployment triggered
- [ ] PR comment posted with preview URL
- [ ] Preview URL is accessible
- [ ] Lighthouse audit ran (if enabled)

---

## 🎉 Success!

Once all checks pass, you have:

✅ Fully automated CI/CD pipeline
✅ Production deployments on every push
✅ Preview deployments for every PR
✅ Automated health checks
✅ Deployment status in PR comments
✅ Build artifacts and reports

**Next Steps:**

1. Share workflow documentation with team
2. Set up Slack/email notifications (optional)
3. Configure environment protection rules
4. Schedule token rotation reminders
5. Monitor deployment metrics

---

## 🔄 Maintenance

### Monthly Tasks

- [ ] Review GitHub Actions usage (Settings → Billing)
- [ ] Check Vercel build minutes used
- [ ] Audit secret access logs
- [ ] Review failed deployments
- [ ] Update dependencies

### Quarterly Tasks

- [ ] Rotate Vercel tokens
- [ ] Review and optimize workflow performance
- [ ] Update Node.js version if needed
- [ ] Review and update deployment strategy
- [ ] Team training on CI/CD process

---

**Last Updated**: January 6, 2026
**Version**: 1.0
**Maintained by**: DevOps Team

For questions or issues, please open a GitHub issue or contact the DevOps team.
