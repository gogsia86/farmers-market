#!/usr/bin/env pwsh
# ⚡ Divine Dependency Fixer
# Cleans and reinstalls all dependencies with quantum consciousness

Write-Host ""
Write-Host "🌟 ============================================" -ForegroundColor Cyan
Write-Host "   DIVINE DEPENDENCY RESURRECTION PROTOCOL" -ForegroundColor Cyan
Write-Host "============================================ 🌟" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Step 1: Backup current package.json
Write-Host "📦 Step 1: Backing up package.json..." -ForegroundColor Yellow
Copy-Item package.json package.json.backup -Force
Write-Host "✅ Backup created: package.json.backup" -ForegroundColor Green
Write-Host ""

# Step 2: Remove node_modules
Write-Host "🧹 Step 2: Removing node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✅ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found (already clean)" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Remove lock files
Write-Host "🔒 Step 3: Removing lock files..." -ForegroundColor Yellow
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json
    Write-Host "✅ package-lock.json removed" -ForegroundColor Green
}
if (Test-Path pnpm-lock.yaml) {
    Remove-Item -Force pnpm-lock.yaml
    Write-Host "✅ pnpm-lock.yaml removed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Clear npm cache
Write-Host "🗑️  Step 4: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "✅ npm cache cleared" -ForegroundColor Green
Write-Host ""

# Step 5: Check for duplicate Farmers-Market directory
Write-Host "🔍 Step 5: Checking for duplicate directories..." -ForegroundColor Yellow
if (Test-Path "Farmers-Market/node_modules") {
    Write-Host "⚠️  Found duplicate Farmers-Market/node_modules" -ForegroundColor Red
    Write-Host "   This may cause path resolution issues" -ForegroundColor Red

    $response = Read-Host "Remove Farmers-Market/node_modules? (y/n)"
    if ($response -eq 'y') {
        Remove-Item -Recurse -Force Farmers-Market/node_modules
        Write-Host "✅ Removed Farmers-Market/node_modules" -ForegroundColor Green
    }
}
Write-Host ""

# Step 6: Install dependencies
Write-Host "📥 Step 6: Installing dependencies..." -ForegroundColor Yellow
Write-Host "   This may take 3-5 minutes..." -ForegroundColor Gray
Write-Host ""

$installStart = Get-Date
npm install
$installEnd = Get-Date
$installDuration = ($installEnd - $installStart).TotalSeconds

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "   Installation took $([math]::Round($installDuration, 1)) seconds" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Installation failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "   Check errors above for details" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 7: Verify critical packages
Write-Host "🔍 Step 7: Verifying critical packages..." -ForegroundColor Yellow

$criticalPackages = @(
    "next",
    "react",
    "typescript",
    "@prisma/client",
    "next-auth"
)

$allInstalled = $true
foreach ($package in $criticalPackages) {
    if (Test-Path "node_modules/$package") {
        Write-Host "   ✅ $package" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $package (MISSING)" -ForegroundColor Red
        $allInstalled = $false
    }
}

Write-Host ""

if ($allInstalled) {
    Write-Host "✅ All critical packages installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some packages are missing - reinstall may be needed" -ForegroundColor Yellow
}

Write-Host ""

# Step 8: Check for dependency conflicts
Write-Host "⚠️  Step 8: Checking for dependency conflicts..." -ForegroundColor Yellow

# Check for duplicate next-auth
$nextAuthDirs = Get-ChildItem -Path node_modules -Filter "next-auth" -Recurse -Directory -Depth 3 -ErrorAction SilentlyContinue

if ($nextAuthDirs.Count -gt 1) {
    Write-Host "   ⚠️  Multiple next-auth installations found:" -ForegroundColor Yellow
    foreach ($dir in $nextAuthDirs) {
        Write-Host "      - $($dir.FullName)" -ForegroundColor Gray
    }
    Write-Host "   This may cause type conflicts" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ No duplicate next-auth installations" -ForegroundColor Green
}

Write-Host ""

# Step 9: Generate Prisma Client
Write-Host "🗄️  Step 9: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Prisma Client generation failed (may need schema fixes)" -ForegroundColor Yellow
}

Write-Host ""

# Step 10: Summary
Write-Host "🌟 ============================================" -ForegroundColor Cyan
Write-Host "   DIVINE DEPENDENCY RESURRECTION COMPLETE!" -ForegroundColor Cyan
Write-Host "============================================ 🌟" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm run type-check" -ForegroundColor White
Write-Host "   2. Run: npm test" -ForegroundColor White
Write-Host "   3. Run: npm run lint" -ForegroundColor White
Write-Host ""

Write-Host "📊 Installation Statistics:" -ForegroundColor Cyan
Write-Host "   Duration: $([math]::Round($installDuration, 1)) seconds" -ForegroundColor White
Write-Host "   Node Modules: $(if (Test-Path node_modules) { (Get-ChildItem node_modules -Directory).Count } else { 0 }) packages" -ForegroundColor White
Write-Host ""

Write-Host "💡 Tip: If issues persist, check DIVINE_PROJECT_REVIEW_2025-10-25.md" -ForegroundColor Gray
Write-Host ""
