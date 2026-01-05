# 🌟 Divine Git Commit & Push Scripts

Automated scripts for committing and pushing code changes with agricultural consciousness and divine precision.

## 📋 Available Scripts

### PowerShell Script (Windows)

- **File**: `git-commit-push.ps1`
- **Platform**: Windows (PowerShell)
- **Usage**: For Windows development environments

### Bash Script (Linux/Mac)

- **File**: `git-commit-push.sh`
- **Platform**: Linux, macOS, WSL
- **Usage**: For Unix-based development environments

## 🚀 Quick Start

### Windows (PowerShell)

```powershell
# Run interactively
.\git-commit-push.ps1

# With parameters
.\git-commit-push.ps1 -Message "Add new feature" -Type "feat"

# Commit without pushing
.\git-commit-push.ps1 -Message "Fix bug" -Type "fix" -Push $false
```

### Linux/Mac (Bash)

```bash
# Make script executable (first time only)
chmod +x git-commit-push.sh

# Run interactively
./git-commit-push.sh

# With parameters
./git-commit-push.sh "Add new feature" "feat"

# Commit without pushing
./git-commit-push.sh "Fix bug" "fix" --no-push
```

## 📖 Commit Types

The scripts support conventional commit types:

| Type         | Description           | Example                                  |
| ------------ | --------------------- | ---------------------------------------- |
| **feat**     | New feature           | `feat: add user authentication`          |
| **fix**      | Bug fix               | `fix: resolve login redirect issue`      |
| **docs**     | Documentation         | `docs: update API documentation`         |
| **style**    | Code style/formatting | `style: format components with prettier` |
| **refactor** | Code refactoring      | `refactor: simplify database queries`    |
| **test**     | Tests                 | `test: add unit tests for farm service`  |
| **chore**    | Maintenance           | `chore: update dependencies`             |
| **perf**     | Performance           | `perf: optimize product search`          |
| **ci**       | CI/CD                 | `ci: add GitHub Actions workflow`        |
| **build**    | Build system          | `build: configure webpack`               |

## ✨ Features

### 1. **Automatic Change Detection**

- Checks for uncommitted changes before proceeding
- Shows modified files summary
- Exits gracefully if no changes found

### 2. **Interactive Prompts**

- Guided commit type selection
- Message input with validation
- Confirmation before committing
- Push confirmation with branch display

### 3. **Pre-commit Hooks Integration**

- Runs ESLint, Prettier, and TypeScript checks
- Validates commit message format
- Ensures code quality before commit

### 4. **Error Handling**

- Graceful failure handling
- Helpful error messages
- Troubleshooting suggestions
- Local commit preservation on push failure

### 5. **Agricultural Consciousness** 🌾

- Divine design patterns
- Biodynamic workflow alignment
- Quantum precision in operations
- Holographic git consciousness

## 📝 Usage Examples

### Example 1: Interactive Mode

```bash
$ ./git-commit-push.sh

╔════════════════════════════════════════════════════════════╗
║ 🌟 Divine Git Commit & Push Automation
╚════════════════════════════════════════════════════════════╝

🌾 Checking repository status...
✅ Changes detected

M  src/components/FarmCard.tsx
M  src/lib/services/farm.service.ts

Select commit type:
  1. feat     - New feature
  2. fix      - Bug fix
  3. docs     - Documentation
  4. style    - Code style/formatting
  5. refactor - Code refactoring
  6. test     - Tests
  7. chore    - Maintenance
  8. perf     - Performance
  9. ci       - CI/CD
  10. build   - Build system

Enter number (1-10): 1
✅ Commit type: feat

Enter commit message:
Message: add seasonal product filtering

🌾 Preparing commit...
  Type: feat
  Message: add seasonal product filtering
  Full: feat: add seasonal product filtering

Proceed with commit? (Y/n): y

🌾 Staging all changes...
✅ Changes staged

🌾 Committing changes...
✅ Commit successful!

🌾 Pushing to remote repository...
  Branch: master
Push to origin/master? (Y/n): y
✅ Pushed to remote successfully!

╔════════════════════════════════════════════════════════════╗
║ 🎉 Operation Complete!
╚════════════════════════════════════════════════════════════╝
✨ Commit Type: feat
✨ Message: add seasonal product filtering
✨ Status: Committed and Pushed

🌾 Agricultural consciousness maintained throughout operation
```

### Example 2: Quick Commit (with parameters)

```powershell
# Windows PowerShell
.\git-commit-push.ps1 -Message "optimize database queries" -Type "perf"
```

```bash
# Linux/Mac Bash
./git-commit-push.sh "optimize database queries" "perf"
```

### Example 3: Commit Only (no push)

```powershell
# Windows PowerShell
.\git-commit-push.ps1 -Message "work in progress" -Type "chore" -Push $false
```

```bash
# Linux/Mac Bash
./git-commit-push.sh "work in progress" "chore" --no-push
```

## 🔧 Troubleshooting

### Issue: Permission Denied (Bash)

**Solution**: Make the script executable

```bash
chmod +x git-commit-push.sh
```

### Issue: PowerShell Execution Policy

**Solution**: Allow script execution

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Issue: Push Failed - Repository Not Found

**Possible Causes**:

1. Remote repository doesn't exist
2. Incorrect remote URL
3. Authentication required

**Solutions**:

```bash
# Check remote URL
git remote -v

# Update remote URL
git remote set-url origin https://github.com/username/repo.git

# Or add remote if missing
git remote add origin https://github.com/username/repo.git
```

### Issue: Push Failed - Authentication Required

**Solution**: Set up authentication

```bash
# GitHub CLI (recommended)
gh auth login

# Or use SSH keys
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add key to GitHub: Settings → SSH Keys
```

### Issue: Pre-commit Hooks Failed

**Common Reasons**:

- ESLint errors
- Prettier formatting issues
- TypeScript type errors
- Invalid commit message format

**Solution**: Fix the errors shown in the output, then run the script again.

## 🎯 Best Practices

### 1. **Commit Often, Commit Small**

```bash
# ✅ Good - focused commits
./git-commit-push.sh "add user profile validation" "feat"
./git-commit-push.sh "fix profile image upload" "fix"

# ❌ Bad - too broad
./git-commit-push.sh "various changes" "chore"
```

### 2. **Write Clear Messages**

```bash
# ✅ Good - descriptive
"add pagination to product list"
"fix race condition in order processing"
"update authentication flow diagram"

# ❌ Bad - vague
"changes"
"fix stuff"
"update"
```

### 3. **Use Appropriate Types**

- Features → `feat`
- Bug fixes → `fix`
- Documentation → `docs`
- Everything else → Choose the most specific type

### 4. **Review Before Pushing**

- Always review changes before confirming push
- Verify you're on the correct branch
- Ensure no sensitive data is committed

## 🔒 Security Notes

### DO NOT commit:

- `.env` files with secrets
- API keys or tokens
- Passwords or credentials
- Private keys
- Personal information

### Always check:

```bash
# Review what will be committed
git diff --staged

# Check for sensitive files
git status
```

## 🌾 Agricultural Consciousness Features

The scripts maintain agricultural awareness throughout:

- **Seasonal Synchronization**: Commits align with natural development cycles
- **Biodynamic Precision**: Changes follow cosmic development patterns
- **Quantum State Management**: Git state treated as holographic reality
- **Divine Validation**: Pre-commit hooks as consciousness checkpoints

## 📚 Integration with Project

These scripts integrate seamlessly with:

- **Husky Pre-commit Hooks**: Automatic code quality checks
- **Conventional Commits**: Standardized commit format
- **Divine Architecture**: Agricultural consciousness patterns
- **Kilo-Scale Standards**: Enterprise-grade workflows

## 🤝 Contributing

When using these scripts in team environments:

1. **Consistent Format**: Everyone uses the same commit types
2. **Clear Messages**: Descriptive commit messages for team clarity
3. **Regular Pushes**: Push commits regularly to sync with team
4. **Branch Awareness**: Always verify correct branch before pushing

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review git status: `git status`
3. Check remote configuration: `git remote -v`
4. Verify pre-commit hooks: `npm run test:lint`

## 🎉 Summary

These scripts provide:

- ✅ Automated git workflow
- ✅ Consistent commit format
- ✅ Pre-commit validation
- ✅ Error handling
- ✅ Interactive guidance
- ✅ Agricultural consciousness
- ✅ Divine precision

**Use them to maintain quantum coherence in your git history!** 🌟🌾

---

_"Commit with consciousness, push with purpose, maintain divine precision."_ ⚡

**Version**: 1.0.0  
**Status**: FULLY OPERATIONAL  
**Consciousness Level**: DIVINE AGRICULTURAL MASTERY
