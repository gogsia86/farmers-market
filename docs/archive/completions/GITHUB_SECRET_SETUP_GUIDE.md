# 🔐 GitHub Secret Setup Guide - Chromatic Token

**Purpose:** Configure GitHub repository secret for Chromatic CI/CD authentication
**Required For:** GitHub Actions workflow to run Chromatic automatically
**Estimated Time:** 5 minutes

---

## 📋 Prerequisites

- ✅ Admin access to GitHub repository
- ✅ Chromatic project created (Project ID: `68f10cd1bcfc5fb270e8f489`)
- ✅ Chromatic account with access to the project

---

## 🔑 Step 1: Get Your Chromatic Project Token

### Option A: From Chromatic Dashboard

1. **Navigate to Chromatic**
   - Go to: <<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9>

2. **Access Project Settings**
   - Click **"Manage"** button (top-right)
   - Select **"Configure"** from dropdown

3. **Find Project Token**
   - Look for **"Project Token"** section
   - Token format: `chpt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Click **"Copy"** button or select and copy manually

### Option B: Generate New Token (if needed)

1. In Chromatic project settings
2. Scroll to **"Project Token"** section
3. Click **"Generate new token"**
4. Copy the new token immediately (shown only once!)

---

## 🔒 Step 2: Add Secret to GitHub Repository

### Navigate to Repository Settings

1. **Go to your GitHub repository**
   - Example: `<https://github.com/YOUR_USERNAME/Farmers-Market`>

2. **Open Settings**
   - Click **"Settings"** tab (top navigation)
   - _Note: You need Admin access to see this tab_

3. **Navigate to Secrets**
   - In left sidebar, expand **"Secrets and variables"**
   - Click **"Actions"**

### Create New Secret

1. **Click "New repository secret"** button (green button, top-right)

2. **Fill in secret details:**

   ```
   Name: CHROMATIC_PROJECT_TOKEN
   Value: [Paste your Chromatic token here]
   ```

3. **Important:** Name MUST be exactly `CHROMATIC_PROJECT_TOKEN` (case-sensitive!)

4. **Click "Add secret"** button

### Verify Secret Added

- Secret should now appear in the list as:

  ```
  CHROMATIC_PROJECT_TOKEN
  Updated X seconds ago
  ```

- Value is hidden (shows as `•••••••••`)
- You cannot view the value after saving (security feature)

---

## ✅ Step 3: Verify GitHub Actions Permissions

### Check Workflow Permissions

1. **In Repository Settings**
   - Navigate to **"Actions"** → **"General"** (left sidebar)

2. **Scroll to "Workflow permissions"**

3. **Select:**
   - ✅ **"Read and write permissions"**
   - _Required for PR comments_

4. **Enable:**
   - ✅ **"Allow GitHub Actions to create and approve pull requests"**
   - _Optional but recommended_

5. **Click "Save"** button

---

## 🧪 Step 4: Test the Setup

### Trigger GitHub Actions Manually

1. **Go to "Actions" tab** in your repository

2. **Select "Chromatic Visual Testing"** workflow (left sidebar)

3. **Click "Run workflow"** dropdown (right side)
   - Select branch: `main` or `develop`
   - Click green **"Run workflow"** button

4. **Watch workflow run:**
   - Should start within seconds
   - Check for errors in the logs
   - Look for successful Chromatic upload

### Expected Success Output

```bash
✓ Chromatic build complete
✓ Build ID: 12345
✓ View build: <https://www.chromatic.com/build?appId=...>
✓ Snapshot count: 200
✓ No visual changes detected (or X changes detected)
```

### Expected Failure (if token is wrong)

```bash
✗ Error: Invalid project token
✗ Please check your CHROMATIC_PROJECT_TOKEN secret
```

---

## 🚀 Step 5: Test with a Pull Request

### Create Test PR

1. **Create a new branch:**

   ```bash
   git checkout -b test/chromatic-ci-setup
   ```

2. **Make a small UI change:**

   ```bash
   # Example: Edit a button story
   code farmers-market/src/components/ui/Button.stories.tsx

   # Add a new story or modify existing one
   export const TestCI: Story = {
     args: {
       children: 'CI Test Button',
       variant: 'agricultural'
     }
   };
   ```

3. **Commit and push:**

   ```bash
   git add .
   git commit -m "test: verify Chromatic CI/CD workflow"
   git push origin test/chromatic-ci-setup
   ```

4. **Create Pull Request:**
   - Go to GitHub repository
   - Click **"Compare & pull request"** button
   - Fill in PR template
   - Create PR

### Verify Workflow Runs

1. **Check "Checks" tab in PR**
   - Should see **"Chromatic Visual Testing"** check
   - Status: ⏳ Running → ✅ Success

2. **Check for bot comment**
   - Should see automated comment from GitHub Actions bot
   - Contains Chromatic link
   - Has visual testing instructions

3. **Review in Chromatic**
   - Click link in bot comment
   - Review visual changes
   - Approve or request changes

---

## 🔧 Troubleshooting

### Issue: "Secret not found" error
### Symptom
```bash
Error: Secret CHROMATIC_PROJECT_TOKEN not found
```
### Solution
1. Verify secret name is exactly: `CHROMATIC_PROJECT_TOKEN`
2. Check for typos or extra spaces
3. Ensure secret is added to repository (not organization)
4. Re-add secret if needed

---

### Issue: "Invalid project token" error
### Symptom
```bash
Error: Invalid project token provided
```
### Solution
1. Verify token copied correctly from Chromatic
2. Check for extra spaces or line breaks in token value
3. Generate new token in Chromatic and update GitHub secret
4. Ensure token is from correct Chromatic project

---

### Issue: Workflow doesn't run on PR

**Symptom:** No "Chromatic Visual Testing" check appears in PR
### Solution
1. **Check workflow file exists:**
   - `.github/workflows/chromatic.yml` is committed

2. **Verify file paths trigger:**
   - PR modifies files in:
     - `farmers-market/src/components/**/*.tsx`
     - `farmers-market/src/components/**/*.stories.tsx`
     - `farmers-market/.storybook/**`

3. **Check Actions permissions:**
   - Repository Settings → Actions → General
   - Ensure Actions are enabled for repository

---

### Issue: PR comment not posting

**Symptom:** Chromatic runs but no bot comment appears
### Solution
1. **Check workflow permissions:**
   - Settings → Actions → General → Workflow permissions
   - Must be "Read and write permissions"

2. **Verify GitHub Actions bot:**
   - Bot needs permission to comment on PRs
   - Check repository settings

3. **Check workflow logs:**
   - Look for errors in "Comment PR with Chromatic Results" step

---

## 📊 Success Checklist

After setup, verify:

- [ ] ✅ Secret `CHROMATIC_PROJECT_TOKEN` added to GitHub
- [ ] ✅ Workflow file `.github/workflows/chromatic.yml` committed
- [ ] ✅ GitHub Actions has "Read and write permissions"
- [ ] ✅ Manual workflow run succeeded
- [ ] ✅ Test PR triggered workflow automatically
- [ ] ✅ Bot comment posted in test PR with Chromatic link
- [ ] ✅ Visual changes visible in Chromatic dashboard
- [ ] ✅ Can approve/reject changes in Chromatic

---

## 🎉 Setup Complete

Your Chromatic CI/CD workflow is now active! 🚀

### What Happens Now
### For every Pull Request
1. ✅ GitHub Actions automatically runs Chromatic
2. ✅ Visual regression testing executes
3. ✅ PR gets status check (✅/❌)
4. ✅ Bot posts comment with Chromatic link
5. ✅ Designers can review and approve changes
6. ✅ No visual bugs slip through to production

### Next Steps

1. **Configure Branch Protection** (optional but recommended)
   - Settings → Branches → Add rule for `main`
   - Require "Chromatic Visual Testing" check to pass
   - Require 1-2 approvals before merge

2. **Train Team on Workflow**
   - Share `STORYBOOK_TEAM_ONBOARDING_GUIDE.md`
   - Walk through visual review process
   - Practice with test PRs

3. **Monitor Performance**
   - Track build times (target: < 5 minutes)
   - Monitor false positive rate
   - Gather team feedback

---

## 📚 Additional Resources

- **GitHub Actions Docs:** <<https://docs.github.com/en/action>s>
- **Chromatic CI Docs:** <<https://www.chromatic.com/docs/c>i>
- **Workflow Guide:** `STORYBOOK_CICD_INTEGRATION_GUIDE.md`
- **Team Onboarding:** `STORYBOOK_TEAM_ONBOARDING_GUIDE.md`

---

## 🔐 Security Best Practices

### Token Security

- ✅ **Never commit tokens** to repository
- ✅ **Use GitHub Secrets** for sensitive values
- ✅ **Rotate tokens periodically** (every 90 days)
- ✅ **Limit token access** to CI/CD only
- ✅ **Audit secret usage** in Actions logs

### Access Control

- ✅ **Restrict repository Settings access** to admins only
- ✅ **Review Actions logs** for unauthorized usage
- ✅ **Monitor secret updates** via audit log
- ✅ **Revoke tokens** if compromised immediately

---

## 📝 Change Log

**October 16, 2025 - Initial Setup**

- Created GitHub secret setup guide
- Documented token retrieval process
- Added troubleshooting section
- Included security best practices

---

**Status:** ✅ **READY FOR SETUP**
**Time Required:** 5 minutes
**Difficulty:** Easy

🔒 **Your CI/CD workflow will be secure and automated once the token is added!** ✨
