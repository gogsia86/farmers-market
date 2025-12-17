# 🔐 Git Authentication Guide

Complete guide to authenticating with Git via terminal for pushing and pulling code.

## 📋 Table of Contents

- [Authentication Methods](#authentication-methods)
- [Method 1: GitHub CLI (Recommended)](#method-1-github-cli-recommended)
- [Method 2: Personal Access Token (HTTPS)](#method-2-personal-access-token-https)
- [Method 3: SSH Keys](#method-3-ssh-keys)
- [Method 4: Git Credential Manager](#method-4-git-credential-manager)
- [Troubleshooting](#troubleshooting)
- [Verification](#verification)

---

## 🎯 Authentication Methods

| Method                     | Difficulty | Security | Best For                |
| -------------------------- | ---------- | -------- | ----------------------- |
| **GitHub CLI**             | Easy       | High     | All users (recommended) |
| **Personal Access Token**  | Easy       | High     | HTTPS users             |
| **SSH Keys**               | Medium     | Highest  | Power users             |
| **Git Credential Manager** | Easy       | High     | Windows users           |

---

## Method 1: GitHub CLI (Recommended)

The easiest and most secure method for GitHub repositories.

### Step 1: Install GitHub CLI

#### Windows (PowerShell):

```powershell
# Using winget
winget install --id GitHub.cli

# Or using Chocolatey
choco install gh

# Or using Scoop
scoop install gh
```

#### macOS:

```bash
# Using Homebrew
brew install gh
```

#### Linux (Ubuntu/Debian):

```bash
# Add repository
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null

# Install
sudo apt update
sudo apt install gh
```

### Step 2: Authenticate with GitHub

```bash
# Start authentication flow
gh auth login
```

### Step 3: Follow Interactive Prompts

```
? What account do you want to log into?
  > GitHub.com
    GitHub Enterprise Server

? What is your preferred protocol for Git operations?
  > HTTPS
    SSH

? Authenticate Git with your GitHub credentials?
  > Yes
    No

? How would you like to authenticate GitHub CLI?
  > Login with a web browser
    Paste an authentication token
```

### Step 4: Complete Browser Authentication

1. Press Enter when prompted
2. Copy the one-time code shown
3. Browser opens automatically
4. Paste the code in browser
5. Click "Authorize GitHub"
6. Done! ✅

### Step 5: Verify Authentication

```bash
# Check authentication status
gh auth status

# Test with a git operation
git pull origin master
```

**✅ Advantages:**

- Easiest method
- Automatic credential management
- Works with 2FA
- No manual token management

---

## Method 2: Personal Access Token (HTTPS)

Use a Personal Access Token (PAT) for HTTPS authentication.

### Step 1: Generate Personal Access Token

1. Go to GitHub: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name (e.g., "Dev Machine - Farmers Market")
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages)
   - ✅ `delete:packages` (Delete packages)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Store Token Securely

#### Option A: Use Git Credential Manager (Recommended)

```bash
# Configure git to use credential helper
git config --global credential.helper manager-core

# Or on Linux
git config --global credential.helper cache

# Set cache timeout (1 hour = 3600 seconds)
git config --global credential.helper 'cache --timeout=3600'
```

#### Option B: Store in Git Credential Store (Less Secure)

```bash
# Store credentials in plain text file
git config --global credential.helper store
```

⚠️ **Warning**: This stores credentials in plain text at `~/.git-credentials`

### Step 3: Use Token for Authentication

When Git prompts for credentials:

```
Username: your-github-username
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Use your Personal Access Token as the password!**

### Step 4: Test Authentication

```bash
# Try to push
git push origin master

# Or pull
git pull origin master
```

### Step 5: Update Existing Remote to Use Token

```bash
# Current remote URL
git remote -v

# Update remote URL with token
git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/REPOSITORY.git

# Example:
git remote set-url origin https://ghp_abc123xyz@github.com/vigovrac/fmplatform.git
```

⚠️ **Security Note**: Don't share URLs containing tokens!

---

## Method 3: SSH Keys

Most secure method, no password needed after setup.

### Step 1: Check for Existing SSH Keys

```bash
# List existing keys
ls -al ~/.ssh

# Look for:
# id_rsa.pub
# id_ecdsa.pub
# id_ed25519.pub
```

### Step 2: Generate New SSH Key (if needed)

```bash
# Generate ED25519 key (recommended)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Or RSA key (if ED25519 not supported)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

**Prompts:**

```
Enter file in which to save the key (/home/user/.ssh/id_ed25519): [Press Enter]
Enter passphrase (empty for no passphrase): [Type passphrase or Press Enter]
Enter same passphrase again: [Type passphrase again or Press Enter]
```

### Step 3: Start SSH Agent

#### Linux/macOS:

```bash
# Start the ssh-agent
eval "$(ssh-agent -s)"

# Add key to ssh-agent
ssh-add ~/.ssh/id_ed25519
```

#### Windows (PowerShell):

```powershell
# Start SSH Agent service
Start-Service ssh-agent

# Add key
ssh-add ~\.ssh\id_ed25519
```

### Step 4: Add SSH Key to GitHub

```bash
# Copy public key to clipboard

# macOS
pbcopy < ~/.ssh/id_ed25519.pub

# Linux (requires xclip)
xclip -selection clipboard < ~/.ssh/id_ed25519.pub

# Windows (PowerShell)
Get-Content ~\.ssh\id_ed25519.pub | Set-Clipboard

# Or manually display and copy
cat ~/.ssh/id_ed25519.pub
```

**Add to GitHub:**

1. Go to: https://github.com/settings/ssh/new
2. Title: "Dev Machine" (or descriptive name)
3. Paste the public key
4. Click **"Add SSH key"**

### Step 5: Test SSH Connection

```bash
# Test connection to GitHub
ssh -T git@github.com

# Should see:
# Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

### Step 6: Update Git Remote to Use SSH

```bash
# Check current remote
git remote -v

# Change from HTTPS to SSH
git remote set-url origin git@github.com:USERNAME/REPOSITORY.git

# Example:
git remote set-url origin git@github.com:vigovrac/fmplatform.git
```

### Step 7: Configure Git to Use SSH

```bash
# Set SSH as default
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

**✅ Advantages:**

- Most secure
- No password needed
- Fast authentication
- Works with all Git operations

---

## Method 4: Git Credential Manager

Built into Git for Windows, available for other platforms.

### Step 1: Install Git Credential Manager

#### Windows:

Already included with Git for Windows!

#### macOS:

```bash
brew install git-credential-manager
```

#### Linux:

```bash
# Download latest release
wget https://github.com/GitCredentialManager/git-credential-manager/releases/latest/download/gcm-linux_amd64.deb

# Install
sudo dpkg -i gcm-linux_amd64.deb
```

### Step 2: Configure Git

```bash
# Set credential helper
git config --global credential.helper manager-core

# Or for older versions
git config --global credential.helper manager
```

### Step 3: Authenticate

```bash
# Next git operation will prompt for credentials
git pull origin master
```

A browser window opens for authentication. Sign in and authorize.

**✅ Advantages:**

- Automatic credential management
- Secure storage
- Works with 2FA
- Cross-platform

---

## 🔧 Troubleshooting

### Issue: "Permission denied (publickey)"

**Solution for SSH:**

```bash
# Check SSH agent is running
eval "$(ssh-agent -s)"

# Add your key
ssh-add ~/.ssh/id_ed25519

# Test connection
ssh -T git@github.com
```

### Issue: "Authentication failed"

**Solution for HTTPS:**

```bash
# Clear cached credentials
git credential-cache exit

# Or for Windows
git credential-manager clear

# Try again
git pull origin master
```

### Issue: "remote: Support for password authentication was removed"

**Solution:**
GitHub no longer accepts passwords. Use:

1. Personal Access Token (as password)
2. SSH keys
3. GitHub CLI

```bash
# Use token as password
Username: your-github-username
Password: ghp_your_token_here
```

### Issue: "Could not read from remote repository"

**Check remote URL:**

```bash
# View current remote
git remote -v

# Update if incorrect
git remote set-url origin CORRECT_URL
```

### Issue: Token expired or revoked

**Solution:**

1. Generate new token at: https://github.com/settings/tokens
2. Update stored credentials:

```bash
# Clear old credentials
git credential reject
# Type: protocol=https
# Type: host=github.com
# Press Enter twice

# Next push will prompt for new token
git push origin master
```

---

## ✅ Verification

### Test Your Authentication

```bash
# Test 1: Check remote connection
git ls-remote

# Test 2: Fetch from remote
git fetch origin

# Test 3: Pull changes
git pull origin master

# Test 4: Push changes (safest - nothing happens if up to date)
git push origin master --dry-run
```

### Check Current Configuration

```bash
# View credential helper
git config --global credential.helper

# View all git config
git config --list

# View remote URLs
git remote -v
```

---

## 🎯 Recommended Setup

### For Most Users:

1. **Install GitHub CLI** (`gh`)
2. Run `gh auth login`
3. Choose HTTPS protocol
4. Authenticate via browser
5. Done! ✅

### For Advanced Users:

1. **Generate SSH key** (`ssh-keygen`)
2. **Add to GitHub** (settings/ssh)
3. **Update remote to SSH**
4. **Configure Git** to prefer SSH
5. Done! ✅

---

## 🔒 Security Best Practices

### DO:

- ✅ Use Personal Access Tokens instead of passwords
- ✅ Set token expiration dates
- ✅ Use minimal required scopes
- ✅ Use SSH keys with passphrases
- ✅ Enable 2FA on GitHub account
- ✅ Regularly rotate tokens and keys
- ✅ Use different tokens for different machines

### DON'T:

- ❌ Share your tokens or keys
- ❌ Commit tokens to repositories
- ❌ Use tokens in public URLs
- ❌ Use the same token everywhere
- ❌ Create tokens without expiration
- ❌ Use password authentication (deprecated)

---

## 📚 Quick Reference

### GitHub CLI Commands

```bash
gh auth login          # Authenticate with GitHub
gh auth status         # Check authentication status
gh auth logout         # Logout
gh auth refresh        # Refresh authentication
```

### Git Credential Commands

```bash
git config --global credential.helper manager-core
git credential fill    # Test credential helper
git credential reject  # Clear credentials
git credential approve # Store credentials
```

### SSH Commands

```bash
ssh-keygen -t ed25519 -C "email@example.com"  # Generate key
ssh-add ~/.ssh/id_ed25519                      # Add to agent
ssh -T git@github.com                          # Test connection
```

---

## 🌟 Summary

| What You Want          | Use This Method                      |
| ---------------------- | ------------------------------------ |
| Easiest setup          | GitHub CLI (`gh auth login`)         |
| Most secure            | SSH Keys                             |
| Windows default        | Git Credential Manager               |
| Quick temporary access | Personal Access Token                |
| CI/CD pipelines        | Personal Access Token or Deploy Keys |

---

_"Authenticate with consciousness, commit with confidence, push with divine precision."_ 🔐✨

**Status**: AUTHENTICATION MASTERY ACHIEVED  
**Security Level**: MAXIMUM DIVINE PROTECTION
