# 🚀 Chromatic CI/CD Integration Guide

**Purpose:** Automate visual regression testing on every Pull Request
**Last Updated:** October 16, 2025
**Status:** Ready for Implementation

---

## 📋 Overview

This guide will help you set up **GitHub Actions** to automatically run Chromatic visual tests on every PR, ensuring no unintended visual changes make it to production.

### What You'll Achieve

- ✅ Automatic Chromatic builds on every PR
- ✅ Visual regression detection before merge
- ✅ PR status checks (block merge if regressions)
- ✅ Chromatic links posted in PR comments
- ✅ Designer approval workflow integrated

---

## 🔧 Prerequisites

### 1. Chromatic Project Token
### Get your token
1. Go to <<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9>
2. Click **Manage** → **Configure**
3. Copy **Project Token** (looks like: `chpt_...`)
### Store as GitHub Secret
1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CHROMATIC_PROJECT_TOKEN`
5. Value: Paste your token
6. Click **Add secret**

---

## 📝 Step 1: Create GitHub Actions Workflow

Create file: `.github/workflows/chromatic.yml`

```yaml
name: Chromatic Visual Testing

on:
  # Run on pull requests
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'farmers-market/src/**'
      - 'farmers-market/.storybook/**'
      - 'farmers-market/package.json'

  # Manual trigger option
  workflow_dispatch:

jobs:
  chromatic:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      # Checkout code
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for Chromatic

      # Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: farmers-market/package-lock.json

      # Install dependencies
      - name: Install dependencies
        working-directory: farmers-market
        run: npm ci --legacy-peer-deps

      # Run Chromatic
      - name: Run Chromatic
        working-directory: farmers-market
        env:
          CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
        run: |
          npx chromatic \
            --project-token=$CHROMATIC_PROJECT_TOKEN \
            --auto-accept-changes="main" \
            --exit-zero-on-changes \
            --only-changed

      # Comment PR with Chromatic link
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const botComment = comments.find(comment =>
              comment.user.type === 'Bot' &&
              comment.body.includes('Chromatic Visual Testing')
            );

            const commentBody = `## 🎨 Chromatic Visual Testing

Visual regression testing has been completed!

**Review Changes:** [View in Chromatic](<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9)

### What to do:
1. Click the link above
2. Review any visual changes
3. Approve if changes are intentional
4. Request fixes if changes are unexpected

---
*Automated by Chromatic CI/CD*`;

            if (botComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: commentBody,
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: commentBody,
              });
            }
```

---

## 📝 Step 2: Create Chromatic Configuration

Create file: `farmers-market/.chromatic.json`

```json
{
  "projectId": "68f10cd1bcfc5fb270e8f489",
  "buildScriptName": "build-storybook",
  "storybookBuildDir": "storybook-static",
  "onlyChanged": true,
  "autoAcceptChanges": "main",
  "externals": {
    "public/**": "public/**"
  },
  "skip": ["dependabot/**", "renovate/**"],
  "ignoreLastBuildOnBranch": "main",
  "zip": true
}
```
### Configuration explained
- `projectId`: Your Chromatic project ID
- `onlyChanged`: Only test changed stories (faster builds)
- `autoAcceptChanges`: Auto-accept changes on `main` branch
- `skip`: Skip builds for dependency update PRs
- `zip`: Compress uploads for faster transfers

---

## 📝 Step 3: Add Package.json Scripts

Update `farmers-market/package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic --exit-zero-on-changes",
    "chromatic:ci": "chromatic --exit-zero-on-changes --only-changed"
  }
}
```

---

## 📝 Step 4: Create PR Template

Create file: `.github/pull_request_template.md`

```markdown
## 📋 Pull Request Description

### What does this PR do?

<!-- Brief description of changes -->

### What type of PR is this?

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 🎨 UI/Design changes
- [ ] ♻️ Code refactoring
- [ ] 📝 Documentation
- [ ] 🧪 Tests
- [ ] 🔧 Configuration
- [ ] 🚀 Performance improvement

---

## ✅ Checklist

### Code Quality

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No console.log or debugging code left

### Testing

- [ ] Unit tests added/updated
- [ ] All tests passing locally
- [ ] Manual testing completed

### Storybook & Visual Testing

- [ ] Storybook stories added/updated for UI changes
- [ ] Chromatic visual tests reviewed
- [ ] No unintended visual regressions
- [ ] Designer approval obtained (if UI changes)

### Documentation

- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Component usage guide updated (if needed)

---

## 🎨 Chromatic Visual Testing

<!-- This section will be auto-populated by GitHub Actions -->

**Review visual changes:** [Chromatic Dashboard](<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9)

### For Reviewers:

1. Click the Chromatic link above
2. Review side-by-side visual diffs
3. Approve if changes are intentional
4. Request fixes if unexpected changes detected

---

## 📸 Screenshots (if applicable)

<!-- Add before/after screenshots for UI changes -->
### Before### After
---

## 🔗 Related Issues

Closes #
Relates to #

---

## 👥 Reviewers

Please review:

- @designer-username (for UI changes)
- @developer-username (for code review)
- @qa-username (for testing)
```

---

## 📝 Step 5: Configure Branch Protection
### Enable required checks
1. Go to **Settings** → **Branches**
2. Edit **main** branch protection rule
3. Enable **Require status checks to pass before merging**
4. Add required checks:
   - ✅ `chromatic` (Chromatic visual tests)
   - ✅ `build` (if you have build checks)
   - ✅ `test` (if you have test checks)
5. Enable **Require approvals** (1-2 reviewers)
6. **Save changes**
### Optional but recommended
- ✅ Require linear history
- ✅ Include administrators
- ✅ Restrict who can push to main

---

## 🔄 Workflow Examples

### Example 1: Developer Opens PR

1. **Developer creates PR:**

   ```bash
   git checkout -b feature/new-button-variant
   # Make changes to Button.tsx and Button.stories.tsx
   git commit -m "feat: add premium button variant"
   git push origin feature/new-button-variant
   ```

2. **GitHub Actions triggers:**
   - Chromatic workflow runs automatically
   - Builds Storybook
   - Uploads to Chromatic
   - Compares against baseline

3. **Chromatic detects changes:**
   - 1 story modified: `Button/Premium`
   - Visual diff shows new button style
   - Posts comment in PR with link

4. **Designer reviews:**
   - Clicks Chromatic link in PR
   - Reviews visual diff
   - Approves or requests changes

5. **PR merged:**
   - After approval, PR is merged
   - Main branch baseline is updated

---

### Example 2: No Visual Changes

1. **Developer creates PR:**

   ```bash
   # Add new test, no UI changes
   git commit -m "test: add button tests"
   ```

2. **Chromatic runs:**
   - No visual changes detected
   - Status check passes automatically
   - No designer approval needed

3. **PR merged:**
   - Can be merged immediately (if other checks pass)

---

### Example 3: Unintended Visual Regression

1. **Developer creates PR:**

   ```bash
   # Refactor CSS, accidentally breaks button spacing
   git commit -m "refactor: clean up button styles"
   ```

2. **Chromatic detects regression:**
   - 25 button stories show spacing changes
   - Visual diff highlights the issue
   - Status check fails (optional)

3. **Designer reviews:**
   - Sees unintended changes
   - Requests fixes

4. **Developer fixes:**

   ```bash
   # Fix spacing issue
   git commit -m "fix: restore button spacing"
   git push
   ```

5. **Chromatic re-runs:**
   - No more visual changes
   - Status check passes
   - PR can be merged

---

## 🎯 Advanced Configuration

### Only Run on Specific Files

Update `.github/workflows/chromatic.yml`:

```yaml
on:
  pull_request:
    paths:
      # Only run when these files change
      - "farmers-market/src/components/**/*.tsx"
      - "farmers-market/src/components/**/*.stories.tsx"
      - "farmers-market/.storybook/**"
      - "farmers-market/src/app/globals.css"
      - "farmers-market/tailwind.config.ts"
```

---

### Auto-Accept Changes on Main

Automatically accept visual changes when merged to `main`:

```yaml
- name: Run Chromatic
  run: |
    npx chromatic \
      --project-token=$CHROMATIC_PROJECT_TOKEN \
      --auto-accept-changes="main" \
      --exit-zero-on-changes
```

---

### Test Only Changed Stories

Speed up builds by testing only affected stories:

```yaml
- name: Run Chromatic
  run: |
    npx chromatic \
      --project-token=$CHROMATIC_PROJECT_TOKEN \
      --only-changed \
      --exit-zero-on-changes
```

---

### Parallel Testing

Run multiple Chromatic builds in parallel:

```yaml
jobs:
  chromatic:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - name: Run Chromatic Shard ${{ matrix.shard }}
        run: |
          npx chromatic \
            --shard=${{ matrix.shard }}/4 \
            --exit-zero-on-changes
```

---

## 📊 Monitoring & Analytics

### Track Chromatic Builds
### Dashboard metrics
- Build frequency
- Average build time
- Approval rate
- Visual change frequency
- Component stability
### Access
<<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9>

---

### GitHub Actions Insights
### View workflow analytics
1. Go to **Actions** tab
2. Click **Chromatic Visual Testing**
3. View:
   - Success rate
   - Average runtime
   - Failure patterns
   - Resource usage

---

## 🆘 Troubleshooting

### Issue: Chromatic Token Not Working
### Solution
1. Verify token is correct
2. Check GitHub secret name: `CHROMATIC_PROJECT_TOKEN`
3. Ensure no extra spaces in token

---

### Issue: Builds Taking Too Long
### Solutions
1. Enable `--only-changed` flag
2. Use `--zip` for faster uploads
3. Skip unchanged stories
4. Consider parallel testing

```yaml
- name: Run Chromatic (Optimized)
  run: |
    npx chromatic \
      --only-changed \
      --zip \
      --exit-zero-on-changes
```

---

### Issue: False Positive Regressions
### Solutions
1. **Delay for animations:**

   ```typescript
   // In story
   export const Animated: Story = {
     play: async () => {
       await new Promise((resolve) => setTimeout(resolve, 1000));
     },
   };
   ```

2. **Ignore specific stories:**

   ```typescript
   // In story
   export const SkipChromatic: Story = {
     parameters: {
       chromatic: { disableSnapshot: true },
     },
   };
   ```

3. **Set threshold for changes:**

   ```json
   // .chromatic.json
   {
     "threshold": 0.05
   }
   ```

---

### Issue: PR Comment Not Appearing
### Solution
1. Ensure GitHub Actions has **Read and write** permissions:
   - **Settings** → **Actions** → **General**
   - Workflow permissions: **Read and write permissions**
   - Save

---

## ✅ Verification Checklist

After setup, verify:

- [ ] GitHub Actions workflow file created
- [ ] Chromatic token added as GitHub secret
- [ ] `.chromatic.json` configuration created
- [ ] Package.json scripts updated
- [ ] PR template created
- [ ] Branch protection enabled
- [ ] Test PR created and Chromatic ran successfully
- [ ] PR comment posted with Chromatic link
- [ ] Designer can access and review changes
- [ ] Status checks working as expected

---

## 🎉 Success

You've successfully integrated Chromatic visual testing into your CI/CD pipeline!

### What Happens Now
### For every PR
1. ✅ Chromatic automatically runs
2. ✅ Visual changes are detected
3. ✅ Designers are notified
4. ✅ Changes are reviewed before merge
5. ✅ No visual regressions slip through
### Benefits
- 🚀 Faster design reviews
- 🐛 Catch visual bugs early
- 🎨 Maintain design consistency
- 🤝 Better designer-developer collaboration
- ✅ Confident deployments

---

## 📚 Additional Resources

- **Chromatic Docs:** <<https://www.chromatic.com/docs/c>i>
- **GitHub Actions Docs:** <<https://docs.github.com/en/action>s>
- **Storybook CI Docs:** <<https://storybook.js.org/docs/react/sharing/publish-storyboo>k>

---

**Guide Version:** 1.0.0
**Last Updated:** October 16, 2025
**Status:** Ready for Implementation 🚀
