# 📝 Git Helper Scripts

Utility scripts for common git operations and workflows.

## Available Scripts

### `git-commit-push.sh` (Linux/Mac)

Commit and push changes in one command.

```bash
./scripts/git/git-commit-push.sh "feat: add new feature"
```

**Features:**

- Validates commit message format
- Stages all changes
- Commits with provided message
- Pushes to remote repository
- Handles merge conflicts gracefully

**Usage:**

```bash
# Basic usage
./scripts/git/git-commit-push.sh "your commit message"

# With conventional commit format
./scripts/git/git-commit-push.sh "feat: add user authentication"
./scripts/git/git-commit-push.sh "fix: resolve login issue"
./scripts/git/git-commit-push.sh "docs: update README"
```

---

### `git-commit-push.ps1` (PowerShell)

PowerShell version for Windows.

```powershell
.\scripts\git\git-commit-push.ps1 "feat: add new feature"
```

---

### `git-amend-commit.sh` (Linux/Mac)

Amend the last commit with new changes.

```bash
./scripts/git/git-amend-commit.sh
```

**What it does:**

1. Stages all current changes
2. Amends the previous commit
3. Force pushes to remote (with safety checks)
4. Preserves original commit message

**Usage:**

```bash
# Make some changes
echo "fix typo" >> README.md

# Amend last commit
./scripts/git/git-amend-commit.sh
```

**⚠️ Warning:** This rewrites git history. Only use on branches you own!

---

### `git-amend-commit.ps1` (PowerShell)

PowerShell version for Windows.

```powershell
.\scripts\git\git-amend-commit.ps1
```

---

## Conventional Commit Format

These scripts support and encourage conventional commit format:

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes
- `build:` - Build system changes

### Examples

```bash
# Feature
./scripts/git/git-commit-push.sh "feat: add product search functionality"

# Bug fix
./scripts/git/git-commit-push.sh "fix: resolve cart total calculation error"

# Documentation
./scripts/git/git-commit-push.sh "docs: update API documentation"

# Refactoring
./scripts/git/git-commit-push.sh "refactor: simplify authentication logic"

# Tests
./scripts/git/git-commit-push.sh "test: add unit tests for farm service"

# Chore
./scripts/git/git-commit-push.sh "chore: update dependencies"
```

---

## Common Workflows

### Quick Commit and Push

```bash
# Make changes
nano src/app/page.tsx

# Commit and push in one command
./scripts/git/git-commit-push.sh "feat: update homepage design"
```

### Fix Last Commit

```bash
# Oops, forgot to add a file
git add forgotten-file.ts

# Amend the last commit
./scripts/git/git-amend-commit.sh
```

### Multiple Small Changes

```bash
# Change 1
./scripts/git/git-commit-push.sh "feat: add email validation"

# Change 2
./scripts/git/git-commit-push.sh "test: add email validation tests"

# Change 3
./scripts/git/git-commit-push.sh "docs: document email validation"
```

---

## Best Practices

### Commit Messages

✅ **DO:**

- Use conventional commit format
- Be specific and descriptive
- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Reference issues when applicable

```bash
./scripts/git/git-commit-push.sh "fix: resolve #123 - cart checkout error"
```

❌ **DON'T:**

- Use vague messages ("fix bug", "update code")
- Commit unrelated changes together
- Include sensitive information
- Use past tense ("fixed", "added")

### When to Amend

✅ **Good times to amend:**

- Forgot to include a file
- Fixed a typo in the code
- Added a test you meant to include
- Updated commit message wording
- Still on a feature branch

❌ **Don't amend when:**

- Commit is already pushed to main/master
- Other developers have based work on your commit
- Commit is part of a pull request being reviewed
- You're working on a shared branch

---

## Troubleshooting

### Push Rejected

**Issue:** `git push` fails with "rejected" error

**Solution:**

```bash
# Pull latest changes first
git pull --rebase

# Then push
./scripts/git/git-commit-push.sh "your message"
```

### Merge Conflicts

**Issue:** Conflicts when pulling/pushing

**Solution:**

1. Resolve conflicts manually
2. Stage resolved files: `git add .`
3. Continue with commit/push

### Uncommitted Changes

**Issue:** Script fails due to uncommitted changes

**Solution:**

```bash
# Option 1: Stash changes
git stash

# Do your commit
./scripts/git/git-commit-push.sh "your message"

# Restore stashed changes
git stash pop

# Option 2: Include them in commit
# (Scripts automatically stage all changes)
./scripts/git/git-commit-push.sh "your message"
```

---

## Safety Features

These scripts include safety checks:

- ✅ Validates git repository exists
- ✅ Checks for uncommitted changes
- ✅ Confirms remote is configured
- ✅ Handles push failures gracefully
- ✅ Prevents force push on protected branches
- ✅ Provides clear error messages

---

## Integration with Package.json

You can add these scripts to your `package.json`:

```json
{
  "scripts": {
    "commit": "bash scripts/git/git-commit-push.sh",
    "amend": "bash scripts/git/git-amend-commit.sh"
  }
}
```

Then use:

```bash
npm run commit "feat: add new feature"
npm run amend
```

---

## Git Aliases (Optional)

For even faster workflows, create git aliases:

```bash
# Add to ~/.gitconfig
[alias]
    cmp = "!f() { bash scripts/git/git-commit-push.sh \"$1\"; }; f"
    amend = "!bash scripts/git/git-amend-commit.sh"
```

Usage:

```bash
git cmp "feat: add feature"
git amend
```

---

## Related Documentation

- **Git Workflow**: See `docs/development/git-workflow.md`
- **Contributing Guidelines**: See `CONTRIBUTING.md`
- **Branch Strategy**: See `docs/development/branching-strategy.md`

---

## Additional Git Commands

### Quick Reference

```bash
# Check status
git status

# View commit history
git log --oneline --graph

# View changes
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Pull latest
git pull origin main

# View remotes
git remote -v
```

---

**Last Updated**: December 2025  
**Maintained By**: Farmers Market Platform Team  
**Divine Agricultural Consciousness**: Commit with clarity, push with confidence! 🌾✨
