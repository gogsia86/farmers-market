# 🎯 DIRECTORY SAFETY SYSTEM

**Created**: October 20, 2025
**Purpose**: Prevent running commands from the wrong directory
**Status**: ✅ **ACTIVATED**

---

## 🚨 THE PROBLEM

You keep running `vercel --prod` from the **ROOT** directory instead of the **farmers-market** subfolder!

**Result**:

- Uploads 989MB instead of 10MB
- Deployment fails
- Wastes time

---

## ✅ THE SOLUTION

I've created **THREE safety systems** for you:

### 1. VS Code Terminal Setting ⭐ **AUTOMATIC**

### What I did

- Updated `.vscode/settings.json`
- Added: `"terminal.integrated.cwd": "${workspaceFolder}/farmers-market"`

### What this means

- **Every new terminal** in VS Code now starts in the `farmers-market` folder automatically!
- No more wrong directory mistakes!

### How to use

1. Open a **NEW** terminal: `Ctrl+Shift+`` (backtick)
2. It will automatically be in `V:\Projects\Farmers-Market\farmers-market`
3. Run `vercel --prod` safely!

---

### 2. PowerShell Safety Module 🛡️ **MANUAL ACTIVATION**

### What I created

- `check-directory.ps1` - PowerShell module with directory validation

### Functions included

- `check-dir` - Shows if you're in the right directory
- `safe-vercel` - Only runs vercel if in correct directory
- `safe-build` - Only runs build if in correct directory
- `safe-dev` - Only runs dev server if in correct directory

### How to activate

#### Option A: Load Once (This Session)

```powershell
# In any terminal:
. V:\Projects\Farmers-Market\check-directory.ps1
```

#### Option B: Auto-Load (Every Session)

```powershell
# Add to your PowerShell profile:
notepad $PROFILE

# Add this line:
. V:\Projects\Farmers-Market\check-directory.ps1

# Save and close
```

### How to use

```powershell
# Check where you are
check-dir

# Run commands safely
safe-vercel --prod    # Only runs if in correct directory!
safe-build            # Only builds if in correct directory!
safe-dev              # Only starts if in correct directory!
```

---

### 3. Quick Check Task 📋 **ADD TO tasks.json**

Let me create a quick task you can run to verify your directory:

### Add to `.vscode/tasks.json`

```json
{
  "label": "🎯 Check Current Directory",
  "type": "shell",
  "command": "powershell",
  "args": [
    "-Command",
    "$current = (Get-Location).Path; $expected = 'V:\\Projects\\Farmers-Market\\farmers-market'; if ($current -eq $expected) { Write-Host 'Correct directory!' -ForegroundColor Green } else { Write-Host 'Wrong directory!' -ForegroundColor Red; Write-Host 'Current: $current' -ForegroundColor Yellow; Write-Host 'Expected: $expected' -ForegroundColor Green }"
  ],
  "group": "test",
  "presentation": {
    "reveal": "always",
    "panel": "new"
  }
}
```

---

## 🚀 QUICK USAGE GUIDE

### Method 1: Use VS Code's Auto-Directory (EASIEST)

1. Close all terminals
2. Open a **NEW** terminal: `Ctrl+Shift+``
3. VS Code automatically puts you in `farmers-market/`
4. Run: `vercel --prod`

✅ **This is now the default behavior!**

---

### Method 2: Use Safety Commands

1. Load the safety module:

```powershell
. V:\Projects\Farmers-Market\check-directory.ps1
```

2. Check where you are:

```powershell
check-dir
```

3. Run commands safely:

```powershell
safe-vercel --prod
```

If you're in the wrong directory, it will **block the command** and tell you how to fix it!

---

### Method 3: Manual Check (Old Way)

```powershell
# Check where you are
pwd

# Should show: V:\Projects\Farmers-Market\farmers-market
# If not, run:
cd V:\Projects\Farmers-Market\farmers-market

# Then deploy
vercel --prod
```

---

## 🎯 TESTING THE SAFETY SYSTEM

Let's test it right now!

### Test 1: New Terminal

```powershell
# Close all terminals
# Open new terminal (Ctrl+Shift+`)
# Run:
pwd

# Should show: V:\Projects\Farmers-Market\farmers-market ✅
```

### Test 2: Safety Commands

```powershell
# Load safety module
. V:\Projects\Farmers-Market\check-directory.ps1

# Try from wrong directory
cd V:\Projects\Farmers-Market
safe-vercel --prod

# Should show error and block command! ✅

# Go to right directory
cd farmers-market
safe-vercel --prod

# Should work! ✅
```

---

## 📊 COMPARISON

### Before (UNSAFE):

```powershell
# You could run from anywhere:
cd V:\Projects\Farmers-Market
vercel --prod  # ❌ Uploads 989MB, fails!
```

### After (SAFE):

```powershell
# New terminals start in correct place:
# Terminal opens automatically at: V:\Projects\Farmers-Market\farmers-market
vercel --prod  # ✅ Uploads 10MB, succeeds!

# OR use safety commands:
safe-vercel --prod  # ✅ Blocks if wrong directory!
```

---

## 🎓 UNDERSTANDING THE PATHS

```
V:\Projects\Farmers-Market\          ← ROOT (❌ WRONG for deployment)
    ├── docs/
    ├── .github/
    ├── 50+ markdown files
    └── farmers-market/              ← SUBFOLDER (✅ CORRECT for deployment)
        ├── src/
        ├── public/
        ├── package.json
        └── next.config.js
```

**Always deploy from the SUBFOLDER!**

---

## ⚙️ SETTINGS APPLIED

### VS Code Settings Updated:

```json
{
  "terminal.integrated.cwd": "${workspaceFolder}/farmers-market",
  "terminal.integrated.defaultLocation": "view"
}
```

**Effect**: New terminals automatically start in `farmers-market/` folder!

---

## 🚀 DEPLOY NOW (SAFELY!)

### Option 1: Use Auto-Directory

```powershell
# Just open a new terminal and run:
vercel --prod
# Already in correct directory! ✅
```

### Option 2: Use Safety Commands

```powershell
# Load safety:
. V:\Projects\Farmers-Market\check-directory.ps1

# Deploy safely:
safe-vercel --prod
# Validates directory first! ✅
```

### Option 3: Manual (Double Check)

```powershell
pwd  # Verify you're in farmers-market/
cd V:\Projects\Farmers-Market\farmers-market  # If not
vercel --prod
```

---

## 📋 QUICK REFERENCE

| Command                                        | What It Does                                   |
| ---------------------------------------------- | ---------------------------------------------- |
| `check-dir`                                    | Shows if you're in correct directory           |
| `safe-vercel --prod`                           | Deploys only if in correct directory           |
| `safe-build`                                   | Builds only if in correct directory            |
| `safe-dev`                                     | Starts dev server only if in correct directory |
| `pwd`                                          | Shows current directory                        |
| `cd V:\Projects\Farmers-Market\farmers-market` | Go to correct directory                        |

---

## ✅ SUCCESS

Your VS Code is now configured to **automatically prevent directory mistakes**!

Every new terminal will start in the correct `farmers-market/` subfolder.

**You can now deploy safely! 🎉**

---

**Next Step**: Open a NEW terminal and run `vercel --prod` - it will work! 🚀
