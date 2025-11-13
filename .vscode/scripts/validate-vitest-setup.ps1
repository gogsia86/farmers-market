#!/usr/bin/env pwsh
# ============================================
# VITEST SETUP VALIDATOR
# ============================================
# Validates that Vitest is properly configured after migration
# from deprecated vitest.vitest to vitest.explorer

Write-Host "🔍 Validating Vitest Setup..." -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()
$successes = @()

# ============================================
# 1. Check Extension Installation
# ============================================
Write-Host "📦 Checking Extension Installation..." -ForegroundColor Yellow

$extensionsPath = "$env:USERPROFILE\.vscode\extensions"
$vitestExtension = Get-ChildItem -Path $extensionsPath -Filter "zixuanchen.vitest-explorer*" -Directory -ErrorAction SilentlyContinue

if ($vitestExtension) {
    $successes += "✅ Vitest Explorer extension is installed"
    Write-Host "   ✅ Found: $($vitestExtension.Name)" -ForegroundColor Green
} else {
    $issues += "❌ Vitest Explorer extension not found"
    Write-Host "   ❌ Extension not installed" -ForegroundColor Red
    Write-Host "   💡 Install: ZixuanChen.vitest-explorer" -ForegroundColor Yellow
}

# ============================================
# 2. Check Configuration Files
# ============================================
Write-Host ""
Write-Host "📋 Checking Configuration Files..." -ForegroundColor Yellow

# Check vitest.config.ts
$vitestConfig = "m:\Repo\Farmers Market Platform web and app\vitest.config.ts"
if (Test-Path $vitestConfig) {
    $successes += "✅ vitest.config.ts exists"
    Write-Host "   ✅ vitest.config.ts found" -ForegroundColor Green
    
    # Check for important configurations
    $content = Get-Content $vitestConfig -Raw
    
    if ($content -match "globals:\s*true") {
        $successes += "✅ Global test APIs enabled"
        Write-Host "   ✅ Global test APIs enabled" -ForegroundColor Green
    } else {
        $warnings += "⚠️  Global test APIs not explicitly enabled"
        Write-Host "   ⚠️  Consider enabling global test APIs" -ForegroundColor Yellow
    }
    
    if ($content -match "coverage") {
        $successes += "✅ Coverage configuration present"
        Write-Host "   ✅ Coverage configured" -ForegroundColor Green
    } else {
        $warnings += "⚠️  No coverage configuration found"
        Write-Host "   ⚠️  No coverage configuration" -ForegroundColor Yellow
    }
} else {
    $issues += "❌ vitest.config.ts not found"
    Write-Host "   ❌ vitest.config.ts missing" -ForegroundColor Red
}

# Check package.json for Vitest
$packageJson = "m:\Repo\Farmers Market Platform web and app\package.json"
if (Test-Path $packageJson) {
    $package = Get-Content $packageJson -Raw | ConvertFrom-Json
    
    if ($package.devDependencies.vitest) {
        $successes += "✅ Vitest package installed: $($package.devDependencies.vitest)"
        Write-Host "   ✅ Vitest package: $($package.devDependencies.vitest)" -ForegroundColor Green
    } else {
        $issues += "❌ Vitest package not in devDependencies"
        Write-Host "   ❌ Vitest not installed" -ForegroundColor Red
    }
    
    if ($package.devDependencies.'@vitest/ui') {
        $successes += "✅ Vitest UI installed"
        Write-Host "   ✅ Vitest UI available" -ForegroundColor Green
    } else {
        $warnings += "⚠️  Vitest UI not installed (optional)"
        Write-Host "   ⚠️  Vitest UI not installed" -ForegroundColor Yellow
    }
}

# ============================================
# 3. Check VS Code Settings
# ============================================
Write-Host ""
Write-Host "⚙️  Checking VS Code Settings..." -ForegroundColor Yellow

$settingsPath = "m:\Repo\Farmers Market Platform web and app\.vscode\settings.json"
if (Test-Path $settingsPath) {
    $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    
    # Check for old deprecated extension settings
    $deprecatedSettings = @(
        'vitest.enable',
        'vitest.commandLine'
    )
    
    $foundDeprecated = $false
    foreach ($setting in $deprecatedSettings) {
        if ($settings.PSObject.Properties.Name -contains $setting) {
            $warnings += "⚠️  Deprecated setting found: $setting"
            Write-Host "   ⚠️  Deprecated: $setting" -ForegroundColor Yellow
            $foundDeprecated = $true
        }
    }
    
    if (-not $foundDeprecated) {
        $successes += "✅ No deprecated Vitest settings found"
        Write-Host "   ✅ No deprecated settings" -ForegroundColor Green
    }
} else {
    $warnings += "⚠️  No .vscode/settings.json found"
    Write-Host "   ⚠️  settings.json not found" -ForegroundColor Yellow
}

# ============================================
# 4. Check for Test Files
# ============================================
Write-Host ""
Write-Host "🧪 Checking Test Files..." -ForegroundColor Yellow

$testPatterns = @(
    "*.test.ts",
    "*.test.tsx",
    "*.spec.ts",
    "*.spec.tsx"
)

$testFiles = @()
foreach ($pattern in $testPatterns) {
    $found = Get-ChildItem -Path "m:\Repo\Farmers Market Platform web and app" -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*dist*" -and $_.FullName -notlike "*.next*" }
    $testFiles += $found
}

if ($testFiles.Count -gt 0) {
    $successes += "✅ Found $($testFiles.Count) test files"
    Write-Host "   ✅ Found $($testFiles.Count) test files" -ForegroundColor Green
    
    # Show first 5 test files as examples
    $examples = $testFiles | Select-Object -First 5
    foreach ($file in $examples) {
        $relativePath = $file.FullName -replace [regex]::Escape("m:\Repo\Farmers Market Platform web and app\"), ""
        Write-Host "      • $relativePath" -ForegroundColor Gray
    }
    
    if ($testFiles.Count -gt 5) {
        Write-Host "      ... and $($testFiles.Count - 5) more" -ForegroundColor Gray
    }
} else {
    $warnings += "⚠️  No test files found"
    Write-Host "   ⚠️  No test files found" -ForegroundColor Yellow
}

# ============================================
# 5. Check Node.js and npm
# ============================================
Write-Host ""
Write-Host "🔧 Checking Development Environment..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $successes += "✅ Node.js: $nodeVersion"
        Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        $issues += "❌ Node.js not found"
        Write-Host "   ❌ Node.js not found" -ForegroundColor Red
    }
} catch {
    $issues += "❌ Node.js not accessible"
    Write-Host "   ❌ Node.js not accessible" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        $successes += "✅ npm: $npmVersion"
        Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        $issues += "❌ npm not found"
        Write-Host "   ❌ npm not found" -ForegroundColor Red
    }
} catch {
    $issues += "❌ npm not accessible"
    Write-Host "   ❌ npm not accessible" -ForegroundColor Red
}

# ============================================
# SUMMARY
# ============================================
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Successes: $($successes.Count)" -ForegroundColor Green
foreach ($success in $successes) {
    Write-Host "   $success" -ForegroundColor Green
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Warnings: $($warnings.Count)" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   $warning" -ForegroundColor Yellow
    }
}

if ($issues.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Issues: $($issues.Count)" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   $issue" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan

# ============================================
# RECOMMENDATIONS
# ============================================
if ($issues.Count -gt 0 -or $warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "💡 RECOMMENDATIONS" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $vitestExtension) {
        Write-Host "1. Install Vitest Explorer Extension:" -ForegroundColor Yellow
        Write-Host "   • Open VS Code Command Palette (Ctrl+Shift+P)" -ForegroundColor Gray
        Write-Host "   • Run: Extensions: Install Extensions" -ForegroundColor Gray
        Write-Host "   • Search: ZixuanChen.vitest-explorer" -ForegroundColor Gray
        Write-Host "   • Click Install" -ForegroundColor Gray
        Write-Host ""
    }
    
    if (-not (Test-Path $vitestConfig)) {
        Write-Host "2. Create vitest.config.ts:" -ForegroundColor Yellow
        Write-Host "   • See: .vscode/VITEST_CONFIGURATION_GUIDE.md" -ForegroundColor Gray
        Write-Host ""
    }
    
    if ($testFiles.Count -eq 0) {
        Write-Host "3. Create Test Files:" -ForegroundColor Yellow
        Write-Host "   • Create *.test.ts or *.spec.ts files" -ForegroundColor Gray
        Write-Host "   • See examples in divine instructions" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "📖 For detailed help, see:" -ForegroundColor Cyan
    Write-Host "   • .vscode/VITEST_CONFIGURATION_GUIDE.md" -ForegroundColor Gray
    Write-Host "   • .vscode/VITEST_TROUBLESHOOTING.md" -ForegroundColor Gray
    Write-Host "   • .vscode/VITEST_MIGRATION_GUIDE.md" -ForegroundColor Gray
    Write-Host ""
}

# ============================================
# EXIT CODE
# ============================================
if ($issues.Count -gt 0) {
    Write-Host "❌ Validation completed with issues" -ForegroundColor Red
    exit 1
} elseif ($warnings.Count -gt 0) {
    Write-Host "⚠️  Validation completed with warnings" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✅ All validations passed!" -ForegroundColor Green
    exit 0
}
