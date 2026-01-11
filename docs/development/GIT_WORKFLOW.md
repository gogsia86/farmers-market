# 🌾 Git Workflow & Branch Strategy

## 📋 Overview

**Purpose:** Define the Git workflow, branching strategy, and best practices for the Farmers Market Platform.

**Audience:** All developers contributing to the project  
**Last Updated:** January 2025  
**Version:** 1.0

---

## 🎯 Workflow Strategy

We use a **modified Git Flow** optimized for continuous deployment with clear separation between development, staging, and production environments.

### Core Principles

1. **Main is Sacred:** Always production-ready, never commit directly
2. **Feature Branches:** All work happens in feature branches
3. **Fast Feedback:** Small, frequent PRs over large, infrequent ones
4. **Clean History:** Meaningful commits that tell a story
5. **CI/CD First:** All branches must pass automated checks

---

## 🌳 Branch Structure

### Permanent Branches

#### `main` (Production)
- **Purpose:** Production-ready code
- **Protection:** Fully protected, requires PR + reviews
- **Deployment:** Auto-deploys to production
- **Merge From:** `develop` (via release PRs)
- **Direct Commits:** ❌ Never

**Rules:**
- All tests must pass
- 2+ approvals required
- No merge commits (squash or rebase)
- Must be deployable at all times

#### `develop` (Integration)
- **Purpose:** Integration branch for features
- **Protection:** Protected, requires PR + 1 review
- **Deployment:** Auto-deploys to staging
- **Merge From:** Feature branches
- **Direct Commits:** ❌ Never (except hotfix merges)

**Rules:**
- All tests must pass
- 1+ approval required
- Regular sync with `main`

---

### Temporary Branches

#### Feature Branches: `feature/*`
**Purpose:** New features and enhancements

**Naming Convention:**
```
feature/<ticket-number>-<short-description>
feature/issue-123-farmer-certification
feature/product-recommendations
feature/real-time-notifications
```

**Lifecycle:**
1. Branch from `develop`
2. Implement feature + tests
3. PR to `develop`
4. Delete after merge

**Example:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/issue-123-farmer-certification

# ... make changes ...

git add .
git commit -m "feat(farms): add certification upload flow"
git push origin feature/issue-123-farmer-certification

# Create PR to develop
# After merge, delete branch
```

---

#### Bug Fix Branches: `fix/*`
**Purpose:** Bug fixes

**Naming Convention:**
```
fix/<ticket-number>-<short-description>
fix/issue-456-payment-webhook
fix/order-calculation-error
fix/image-upload-timeout
```

**Lifecycle:**
1. Branch from `develop` (or `main` for hotfixes)
2. Fix bug + add regression test
3. PR to source branch
4. Delete after merge

**Example:**
```bash
git checkout develop
git pull origin develop
git checkout -b fix/issue-456-payment-webhook

# ... fix bug and add test ...

git add .
git commit -m "fix(payments): handle Stripe webhook retries"
git push origin fix/issue-456-payment-webhook
```

---

#### Hotfix Branches: `hotfix/*`
**Purpose:** Critical production fixes that can't wait

**Naming Convention:**
```
hotfix/<version>-<critical-issue>
hotfix/1.2.1-payment-failure
hotfix/1.2.2-security-patch
```

**Lifecycle:**
1. Branch from `main`
2. Fix critical issue
3. PR to `main` AND `develop`
4. Tag release
5. Delete after merge

**Example:**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/1.2.1-payment-failure

# ... fix critical bug ...

git add .
git commit -m "fix(payments): prevent duplicate charges"

# Create PR to main
git push origin hotfix/1.2.1-payment-failure

# After merge to main, also merge to develop
git checkout develop
git merge hotfix/1.2.1-payment-failure
git push origin develop
```

---

#### Release Branches: `release/*`
**Purpose:** Prepare for production release

**Naming Convention:**
```
release/<version>
release/1.2.0
release/2.0.0-beta
```

**Lifecycle:**
1. Branch from `develop`
2. Final testing, bug fixes only
3. Update version numbers
4. PR to `main` and back to `develop`
5. Tag release
6. Delete after merge

**Example:**
```bash
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Update version in package.json
npm version 1.2.0

# Final testing and bug fixes
git add .
git commit -m "chore(release): prepare v1.2.0"

# Create PR to main
git push origin release/1.2.0

# After merge, tag the release
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

---

#### Documentation Branches: `docs/*`
**Purpose:** Documentation updates only

**Naming Convention:**
```
docs/<area>-<description>
docs/api-endpoints
docs/testing-guide
docs/onboarding-update
```

**Lifecycle:**
1. Branch from `develop`
2. Update documentation
3. PR to `develop`
4. Delete after merge

---

#### Refactor Branches: `refactor/*`
**Purpose:** Code refactoring without behavior changes

**Naming Convention:**
```
refactor/<component>-<description>
refactor/order-service-architecture
refactor/simplify-auth-flow
```

---

#### Test Branches: `test/*`
**Purpose:** Test additions or improvements

**Naming Convention:**
```
test/<area>-<test-type>
test/orders-e2e
test/payment-integration
```

---

#### Chore Branches: `chore/*`
**Purpose:** Maintenance tasks, dependency updates

**Naming Convention:**
```
chore/<task-description>
chore/update-dependencies
chore/cleanup-unused-code
```

---

## 📝 Commit Message Standards

### Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(farms): add organic certification` |
| `fix` | Bug fix | `fix(orders): prevent duplicate submissions` |
| `docs` | Documentation | `docs(api): update endpoint examples` |
| `style` | Formatting | `style(components): run prettier` |
| `refactor` | Code restructuring | `refactor(auth): simplify token validation` |
| `perf` | Performance | `perf(search): optimize farm queries` |
| `test` | Tests | `test(orders): add cancellation tests` |
| `chore` | Maintenance | `chore(deps): update Next.js to 15.1` |
| `ci` | CI/CD | `ci(github): add security scan workflow` |
| `build` | Build system | `build(webpack): optimize bundle size` |
| `revert` | Revert commit | `revert: feat(farms): add certification` |

### Scope Examples

- `farms` - Farm management
- `orders` - Order processing
- `payments` - Payment handling
- `auth` - Authentication
- `api` - API routes
- `ui` - UI components
- `db` - Database/Prisma
- `tests` - Testing utilities
- `docs` - Documentation
- `deps` - Dependencies

### Commit Message Examples

#### ✅ Good Commits

```
feat(farms): add biodynamic certification verification

- Add certification upload form
- Implement admin verification workflow
- Send email notifications to farmer
- Update farm profile to show certification

Closes #123
```

```
fix(payments): handle Stripe webhook retries correctly

The webhook handler was not idempotent, causing duplicate
order confirmations when Stripe retried failed webhooks.

- Add idempotency check using event ID
- Store processed events in database
- Add retry logic with exponential backoff

Fixes #456
```

```
perf(search): optimize farm search queries

Reduced search response time from 2.5s to 400ms by:
- Adding database indexes on name and location
- Implementing Redis caching for popular searches
- Using Prisma select to reduce payload size

Improves #789
```

#### ❌ Bad Commits

```
update stuff
```

```
fix bug
```

```
WIP
```

```
asdfasdf
```

### Commit Best Practices

**DO:**
- ✅ Write in present tense ("add feature" not "added feature")
- ✅ Use imperative mood ("move cursor to" not "moves cursor to")
- ✅ Capitalize first letter of subject
- ✅ No period at end of subject
- ✅ Keep subject under 72 characters
- ✅ Separate subject from body with blank line
- ✅ Wrap body at 72 characters
- ✅ Explain *what* and *why*, not *how*
- ✅ Reference issues/PRs in footer

**DON'T:**
- ❌ Use vague messages ("fix bug", "update code")
- ❌ Combine unrelated changes in one commit
- ❌ Commit broken/incomplete code
- ❌ Skip the commit message body for complex changes
- ❌ Use `git commit -m` for multi-line messages (use editor)

---

## 🔄 Workflow Scenarios

### Scenario 1: Starting a New Feature

```bash
# 1. Sync with latest develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/issue-123-farmer-analytics

# 3. Make changes
# ... edit files ...

# 4. Stage and commit
git add src/app/analytics/
git commit -m "feat(analytics): add farmer dashboard analytics"

# 5. Push to remote
git push origin feature/issue-123-farmer-analytics

# 6. Create Pull Request on GitHub
# - Target: develop
# - Fill out PR template
# - Request reviewers
```

---

### Scenario 2: Keeping Branch Up-to-Date

```bash
# While working on feature branch, develop has moved ahead

# Option A: Rebase (recommended for clean history)
git checkout feature/issue-123-farmer-analytics
git fetch origin
git rebase origin/develop

# If conflicts occur:
# 1. Resolve conflicts in files
# 2. git add <resolved-files>
# 3. git rebase --continue

# Force push (rewrites history)
git push origin feature/issue-123-farmer-analytics --force-with-lease

# Option B: Merge (creates merge commit)
git checkout feature/issue-123-farmer-analytics
git merge origin/develop
git push origin feature/issue-123-farmer-analytics
```

---

### Scenario 3: Making Changes After PR Review

```bash
# Reviewer requested changes on your PR

# 1. Make changes
# ... edit files ...

# 2. Commit changes
git add .
git commit -m "refactor(analytics): address PR feedback"

# 3. Push to same branch
git push origin feature/issue-123-farmer-analytics

# PR updates automatically
```

---

### Scenario 4: Squashing Commits Before Merge

```bash
# Your branch has many small commits, want to squash them

# 1. Interactive rebase (last 5 commits)
git rebase -i HEAD~5

# In editor, change 'pick' to 'squash' for commits to combine
# pick abc123 feat(analytics): add initial dashboard
# squash def456 fix typo
# squash ghi789 update styles
# squash jkl012 add tests

# 2. Edit commit message in next editor screen

# 3. Force push
git push origin feature/issue-123-farmer-analytics --force-with-lease
```

---

### Scenario 5: Fixing a Production Bug (Hotfix)

```bash
# Critical bug found in production

# 1. Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/1.2.1-payment-error

# 2. Fix the bug
# ... edit files ...
# ... add regression test ...

# 3. Commit
git add .
git commit -m "fix(payments): prevent duplicate charges

Critical fix for payment processing where webhook retries
were causing duplicate charges to customers.

- Add idempotency key validation
- Store processed webhook IDs
- Add integration test

Fixes #999 (critical production bug)"

# 4. Push and create PR to main
git push origin hotfix/1.2.1-payment-error

# 5. After PR approval and merge to main:
# - Deploy to production
# - Tag the release
git checkout main
git pull origin main
git tag -a v1.2.1 -m "Hotfix: Prevent duplicate charges"
git push origin v1.2.1

# 6. Merge hotfix back to develop
git checkout develop
git pull origin develop
git merge hotfix/1.2.1-payment-error
git push origin develop

# 7. Delete hotfix branch
git branch -d hotfix/1.2.1-payment-error
git push origin --delete hotfix/1.2.1-payment-error
```

---

### Scenario 6: Resolving Merge Conflicts

```bash
# Conflict when merging/rebasing

# 1. Identify conflicted files
git status

# 2. Open conflicted files, look for markers:
# <<<<<<< HEAD (your changes)
# =======
# >>>>>>> branch-name (their changes)

# 3. Resolve conflicts by editing files
# Choose which changes to keep or combine both

# 4. Mark as resolved
git add <resolved-files>

# 5. Continue merge/rebase
git rebase --continue  # if rebasing
# or
git commit  # if merging

# 6. Push changes
git push origin your-branch-name --force-with-lease  # if rebased
```

---

### Scenario 7: Undoing Changes

```bash
# Scenario A: Undo uncommitted changes
git checkout -- <file>  # Single file
git reset --hard  # All files (careful!)

# Scenario B: Undo last commit (keep changes)
git reset --soft HEAD~1

# Scenario C: Undo last commit (discard changes)
git reset --hard HEAD~1

# Scenario D: Revert a pushed commit
git revert <commit-hash>
git push origin your-branch-name

# Scenario E: Undo a merge
git revert -m 1 <merge-commit-hash>
```

---

## 🔍 Code Review Process

### Before Requesting Review

**Checklist:**
- [ ] All tests pass locally
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code follows style guidelines
- [ ] Added tests for new code
- [ ] Updated documentation
- [ ] Self-reviewed the diff
- [ ] Meaningful commit messages
- [ ] Branch up-to-date with target

### Requesting Review

1. **Push to GitHub**
   ```bash
   git push origin feature/your-branch-name
   ```

2. **Create Pull Request**
   - Use PR template
   - Clear title and description
   - Link related issues
   - Add screenshots for UI changes
   - Tag appropriate reviewers

3. **Respond to Feedback**
   - Address all comments
   - Ask questions if unclear
   - Make requested changes promptly
   - Re-request review after updates

### Reviewer Guidelines

**What to Look For:**
- Code correctness and logic
- Edge cases and error handling
- Test coverage
- Performance implications
- Security vulnerabilities
- Code style consistency
- Documentation completeness

**How to Review:**
- Be respectful and constructive
- Explain the "why" behind suggestions
- Approve if minor issues (nits)
- Request changes if significant issues
- Comment if questions/discussion needed

---

## 🏷️ Tagging & Releases

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR:** New features, backwards compatible (e.g., 1.0.0 → 1.1.0)
- **PATCH:** Bug fixes, backwards compatible (e.g., 1.0.0 → 1.0.1)

### Creating Tags

```bash
# Annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0: Farmer analytics dashboard"
git push origin v1.2.0

# List tags
git tag -l

# View tag details
git show v1.2.0

# Delete tag (if mistake)
git tag -d v1.2.0  # local
git push origin --delete v1.2.0  # remote
```

### Release Process

1. **Create Release Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/1.2.0
   ```

2. **Update Version**
   ```bash
   npm version 1.2.0
   ```

3. **Update Changelog**
   - Document new features
   - List bug fixes
   - Note breaking changes
   - Thank contributors

4. **Final Testing**
   - Run full test suite
   - Manual QA testing
   - Performance testing
   - Security scan

5. **Merge to Main**
   ```bash
   # Create PR: release/1.2.0 → main
   # After approval and merge:
   git checkout main
   git pull origin main
   ```

6. **Tag Release**
   ```bash
   git tag -a v1.2.0 -m "Release 1.2.0"
   git push origin v1.2.0
   ```

7. **Merge Back to Develop**
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

8. **GitHub Release**
   - Create release on GitHub
   - Use tag v1.2.0
   - Copy changelog content
   - Attach build artifacts

---

## 🚨 Emergency Procedures

### Reverting a Bad Deploy

```bash
# If production is broken after merge to main

# Option 1: Revert the merge commit
git checkout main
git revert -m 1 <merge-commit-hash>
git push origin main

# Option 2: Deploy previous working version
git checkout v1.1.9  # last working tag
# Trigger manual deployment
```

### Fixing Broken Develop

```bash
# If develop is in a bad state

# Option 1: Revert problematic merge
git checkout develop
git revert -m 1 <merge-commit-hash>
git push origin develop

# Option 2: Reset to last known good commit
git checkout develop
git reset --hard <good-commit-hash>
git push origin develop --force  # Use with extreme caution
```

---

## 📊 Branch Hygiene

### Cleaning Up Local Branches

```bash
# List all branches
git branch -a

# Delete local branch
git branch -d feature/old-feature

# Force delete if not merged
git branch -D feature/old-feature

# Delete all merged local branches
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# Prune remote-tracking branches
git fetch --prune
```

### Cleaning Up Remote Branches

```bash
# Delete remote branch
git push origin --delete feature/old-feature

# Automated: Delete after PR merge (GitHub setting)
# Settings → Branches → Automatically delete head branches
```

### Branch Lifecycle Limits

- **Feature/Fix Branches:** Delete after merge
- **Release Branches:** Delete after merge
- **Hotfix Branches:** Delete after merge
- **Stale Branches:** Delete if inactive >30 days

---

## 🛠️ Useful Git Commands

### Status & Information

```bash
# Check status
git status

# View commit history
git log --oneline --graph --all

# View changes
git diff
git diff --staged
git diff main...feature-branch

# Show commit details
git show <commit-hash>

# Who changed what
git blame <file>
```

### Stashing Changes

```bash
# Save work in progress
git stash save "WIP: working on analytics"

# List stashes
git stash list

# Apply latest stash
git stash apply

# Apply and remove stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Clear all stashes
git stash clear
```

### Advanced Operations

```bash
# Cherry-pick a commit
git cherry-pick <commit-hash>

# Amend last commit
git commit --amend

# Change last commit message
git commit --amend -m "New message"

# Interactive rebase (edit history)
git rebase -i HEAD~3

# Find when bug was introduced
git bisect start
git bisect bad  # current commit is bad
git bisect good <commit-hash>  # known good commit
# Git will checkout commits for you to test
git bisect good/bad  # after each test
git bisect reset  # when done
```

---

## 📚 Git Configuration

### Recommended Git Config

```bash
# Set user info
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Default branch name
git config --global init.defaultBranch main

# Auto-correct typos
git config --global help.autocorrect 20

# Better diff output
git config --global diff.algorithm histogram

# Reuse recorded conflict resolutions
git config --global rerere.enabled true

# Prune on fetch
git config --global fetch.prune true

# Default pull behavior
git config --global pull.rebase true

# Better log output
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# Quick status
git config --global alias.st status

# Quick commit
git config --global alias.cm "commit -m"
```

### Project-Specific Config

```bash
# Navigate to project
cd "Farmers Market Platform web and app"

# Set project-specific email
git config user.email "dev@farmersmarket.com"

# Set up commit template
git config commit.template .gitmessage

# Set up hooks path
git config core.hooksPath .githooks
```

---

## 🔒 Security Best Practices

### Never Commit Secrets

```bash
# Check for secrets before committing
git diff --cached

# If secrets committed by mistake:
# 1. Remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/secret-file" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Rotate the secret immediately
# 3. Update .gitignore to prevent future commits
```

### Use .gitignore

```gitignore
# Environment files
.env
.env.local
.env.production

# Dependencies
node_modules/

# Build outputs
.next/
dist/
build/

# Logs
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

---

## 📖 Additional Resources

### Internal Documentation
- [Contributing Guide](../../CONTRIBUTING.md)
- [Code Review Standards](../code-review/CODE_REVIEW_STANDARDS.md)
- [Testing Standards](../testing/TESTING_STANDARDS.md)

### External Resources
- [Pro Git Book](https://git-scm.com/book/en/v2)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Semantic Versioning](https://semver.org/)

---

## 🤝 Getting Help

**Questions about Git workflow?**
- Slack: #engineering
- Documentation: This guide
- Git issues: Ask senior developers

**Git problems?**
- Check Git documentation: `git help <command>`
- Search GitHub discussions
- Ask in #engineering-help

---

**Remember:** Good Git hygiene makes collaboration smoother and history clearer. When in doubt, ask before force-pushing or deleting branches!

---

*Last Updated: January 2025*  
*Version: 1.0*  
*Owner: Technical Lead*