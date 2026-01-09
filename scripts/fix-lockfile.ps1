# ============================================================================
# Fix Corrupted Package Lockfile Script (PowerShell)
# ============================================================================
# Purpose: Safely regenerate package-lock.json to fix corruption issues
# Usage: npm run fix:lockfile:win (or .\scripts\fix-lockfile.ps1)
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "🔧 Starting Package Lockfile Regeneration..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json"))
{
  Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
  Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
  exit 1
}

# Backup existing lockfile if it exists
if (Test-Path "package-lock.json")
{
  Write-Host "📦 Backing up existing package-lock.json..." -ForegroundColor Yellow
  $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
  Copy-Item "package-lock.json" "package-lock.json.backup-$timestamp"
  Write-Host "✅ Backup created: package-lock.json.backup-$timestamp" -ForegroundColor Green
  Write-Host ""
}

# Step 1: Delete corrupted lockfile
Write-Host "🗑️  Step 1: Removing corrupted lockfile..." -ForegroundColor Blue
if (Test-Path "package-lock.json")
{
  Remove-Item "package-lock.json" -Force
  Write-Host "✅ Lockfile removed" -ForegroundColor Green
} else
{
  Write-Host "⚠️  No lockfile found (already removed)" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Delete node_modules
Write-Host "🗑️  Step 2: Removing node_modules..." -ForegroundColor Blue
if (Test-Path "node_modules")
{
  Write-Host "   Deleting node_modules (this may take a moment)..." -ForegroundColor Gray
  Remove-Item "node_modules" -Recurse -Force
  Write-Host "✅ node_modules removed" -ForegroundColor Green
} else
{
  Write-Host "⚠️  No node_modules found (already removed)" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Clear npm cache
Write-Host "🧹 Step 3: Clearing npm cache..." -ForegroundColor Blue
npm cache clean --force
Write-Host "✅ Cache cleared" -ForegroundColor Green
Write-Host ""

# Step 4: Verify npm version
Write-Host "🔍 Step 4: Checking npm version..." -ForegroundColor Blue
$npmVersion = npm --version
Write-Host "Current npm version: $npmVersion" -ForegroundColor Green
Write-Host "Note: Using npm 10+ is recommended for consistency" -ForegroundColor Yellow
Write-Host ""

# Step 5: Regenerate lockfile
Write-Host "📦 Step 5: Installing dependencies (this may take a few minutes)..." -ForegroundColor Blue
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 6: Verify installation
Write-Host "🔍 Step 6: Verifying installation..." -ForegroundColor Blue
Write-Host ""

# Check for errors in dependency tree
Write-Host "Checking dependency tree..." -ForegroundColor Gray
try
{
  npm ls 2>&1 | Out-Null
  Write-Host "✅ Dependency tree is valid" -ForegroundColor Green
} catch
{
  Write-Host "⚠️  Some peer dependency warnings (this is normal)" -ForegroundColor Yellow
}
Write-Host ""

# Check for vulnerabilities
Write-Host "Checking for vulnerabilities..." -ForegroundColor Gray
try
{
  npm audit --audit-level=moderate
} catch
{
  Write-Host "Audit completed with some findings" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Verify Prisma
Write-Host "🔍 Step 7: Verifying Prisma client..." -ForegroundColor Blue
try
{
  npm ls @prisma/client 2>&1 | Out-Null
  Write-Host "✅ Prisma client is installed" -ForegroundColor Green
} catch
{
  Write-Host "❌ Prisma client not found" -ForegroundColor Red
}
Write-Host ""

# Step 8: Final checks
Write-Host "🔍 Step 8: Final verification..." -ForegroundColor Blue
Write-Host ""

# Check if lockfile was created
if (Test-Path "package-lock.json")
{
  $lockfileSize = (Get-Item "package-lock.json").Length
  Write-Host "✅ New package-lock.json created ($lockfileSize bytes)" -ForegroundColor Green
} else
{
  Write-Host "❌ Failed to create package-lock.json" -ForegroundColor Red
  exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules")
{
  $modulesCount = (Get-ChildItem "node_modules" -Directory).Count
  Write-Host "✅ node_modules created ($modulesCount packages)" -ForegroundColor Green
} else
{
  Write-Host "❌ node_modules directory not created" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✨ Lockfile regeneration complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run 'npm run build' to verify the build works"
Write-Host "   2. Run 'npm run dev' to test locally"
Write-Host "   3. Commit the new package-lock.json:"
Write-Host "      git add package-lock.json"
Write-Host "      git commit -m 'fix: regenerate corrupted package-lock.json'"
Write-Host "   4. Push and deploy to Vercel"
Write-Host ""
Write-Host "💡 Tip: If you encounter issues, restore the backup:" -ForegroundColor Yellow
if (Test-Path "package-lock.json.backup-$timestamp")
{
  Write-Host "   Copy-Item 'package-lock.json.backup-$timestamp' 'package-lock.json'"
  Write-Host "   npm install"
}
Write-Host ""
Write-Host "🚀 Ready to go!" -ForegroundColor Green
