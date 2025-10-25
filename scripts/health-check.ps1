#!/usr/bin/env pwsh
# ⚡ Divine Project Health Check
# Comprehensive status assessment of the Farmers Market project

Write-Host ""
Write-Host "🏥 ============================================" -ForegroundColor Cyan
Write-Host "   DIVINE PROJECT HEALTH CHECK" -ForegroundColor Cyan
Write-Host "============================================ 🏥" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$healthScore = 0
$maxScore = 100

function Write-HealthStatus {
    param($category, $status, $points)
    $color = if ($status -eq "OK") { "Green" } elseif ($status -eq "WARN") { "Yellow" } else { "Red" }
    Write-Host "   $category : " -NoNewline
    Write-Host $status -ForegroundColor $color
    return $points
}

# Check 1: Dependencies (15 points)
Write-Host "📦 1. Dependency Health..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    $moduleCount = (Get-ChildItem node_modules -Directory -ErrorAction SilentlyContinue).Count
    if ($moduleCount -gt 100) {
        $healthScore += Write-HealthStatus "   Dependencies installed" "OK" 15
        Write-Host "      Found $moduleCount packages" -ForegroundColor Gray
    } else {
        $healthScore += Write-HealthStatus "   Dependencies installed" "WARN" 8
        Write-Host "      Only $moduleCount packages (may be incomplete)" -ForegroundColor Gray
    }
} else {
    Write-HealthStatus "   Dependencies installed" "FAIL" 0
    Write-Host "      Run: .\scripts\fix-dependencies.ps1" -ForegroundColor Red
}
Write-Host ""

# Check 2: TypeScript Configuration (10 points)
Write-Host "⚙️  2. TypeScript Configuration..." -ForegroundColor Yellow
if (Test-Path tsconfig.json) {
    $healthScore += Write-HealthStatus "   tsconfig.json exists" "OK" 10
} else {
    Write-HealthStatus "   tsconfig.json exists" "FAIL" 0
}
Write-Host ""

# Check 3: TypeScript Compilation (20 points)
Write-Host "🔍 3. TypeScript Type Checking..." -ForegroundColor Yellow
Write-Host "   Running: npm run type-check" -ForegroundColor Gray

$typeCheckOutput = npm run type-check 2>&1
$typeErrors = ($typeCheckOutput | Select-String "error TS").Count

if ($typeErrors -eq 0) {
    $healthScore += Write-HealthStatus "   Type errors" "OK (0 errors)" 20
} elseif ($typeErrors -lt 10) {
    $healthScore += Write-HealthStatus "   Type errors" "WARN ($typeErrors errors)" 10
} else {
    Write-HealthStatus "   Type errors" "FAIL ($typeErrors errors)" 0
}
Write-Host ""

# Check 4: Linting (10 points)
Write-Host "🎨 4. Code Linting..." -ForegroundColor Yellow
Write-Host "   Running: npm run lint" -ForegroundColor Gray

$lintOutput = npm run lint 2>&1
$hasLintErrors = $lintOutput -match "error"

if (-not $hasLintErrors) {
    $healthScore += Write-HealthStatus "   Lint status" "OK" 10
} else {
    Write-HealthStatus "   Lint status" "FAIL" 0
}
Write-Host ""

# Check 5: Test Configuration (10 points)
Write-Host "🧪 5. Test Configuration..." -ForegroundColor Yellow
if (Test-Path jest.config.simple.js) {
    $healthScore += Write-HealthStatus "   Jest config exists" "OK" 5
} else {
    Write-HealthStatus "   Jest config exists" "FAIL" 0
}

if (Test-Path jest.setup.js) {
    $healthScore += Write-HealthStatus "   Jest setup exists" "OK" 5
} else {
    Write-HealthStatus "   Jest setup exists" "FAIL" 0
}
Write-Host ""

# Check 6: Test Execution (20 points)
Write-Host "🏃 6. Test Execution..." -ForegroundColor Yellow
Write-Host "   Running: npm test -- --passWithNoTests --maxWorkers=1" -ForegroundColor Gray

$testStart = Get-Date
$testOutput = npm test -- --passWithNoTests --maxWorkers=1 2>&1
$testEnd = Get-Date
$testDuration = ($testEnd - $testStart).TotalSeconds

$testsPassing = ($testOutput | Select-String "PASS").Count
$testsFailing = ($testOutput | Select-String "FAIL").Count

Write-Host "   Tests passing: $testsPassing" -ForegroundColor Cyan
Write-Host "   Tests failing: $testsFailing" -ForegroundColor Cyan
Write-Host "   Duration: $([math]::Round($testDuration, 1))s" -ForegroundColor Gray

if ($testsFailing -eq 0 -and $testsPassing -gt 0) {
    $healthScore += Write-HealthStatus "   Test execution" "OK" 20
} elseif ($testsFailing -lt 5) {
    $healthScore += Write-HealthStatus "   Test execution" "WARN" 10
} else {
    Write-HealthStatus "   Test execution" "FAIL" 0
}
Write-Host ""

# Check 7: Prisma Schema (10 points)
Write-Host "🗄️  7. Database Schema..." -ForegroundColor Yellow
if (Test-Path prisma/schema.prisma) {
    $healthScore += Write-HealthStatus "   Prisma schema exists" "OK" 5

    # Check if Prisma Client is generated
    if (Test-Path node_modules/.prisma/client) {
        $healthScore += Write-HealthStatus "   Prisma Client generated" "OK" 5
    } else {
        Write-HealthStatus "   Prisma Client generated" "WARN" 2
        Write-Host "      Run: npx prisma generate" -ForegroundColor Gray
    }
} else {
    Write-HealthStatus "   Prisma schema exists" "FAIL" 0
}
Write-Host ""

# Check 8: Critical Files (5 points)
Write-Host "📄 8. Critical Files..." -ForegroundColor Yellow
$criticalFiles = @(
    "package.json",
    "next.config.mjs",
    "src/app/layout.tsx"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (MISSING)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    $healthScore += 5
}
Write-Host ""

# Check 9: Git Status (5 points)
Write-Host "🔧 9. Git Repository..." -ForegroundColor Yellow
if (Test-Path .git) {
    $healthScore += Write-HealthStatus "   Git initialized" "OK" 5

    $gitStatus = git status --short 2>&1
    if ($gitStatus) {
        Write-Host "      Uncommitted changes detected" -ForegroundColor Gray
    } else {
        Write-Host "      Working tree clean" -ForegroundColor Gray
    }
} else {
    Write-HealthStatus "   Git initialized" "FAIL" 0
}
Write-Host ""

# Check 10: Documentation (5 points)
Write-Host "📚 10. Documentation..." -ForegroundColor Yellow
if (Test-Path README.md) {
    $healthScore += Write-HealthStatus "   README exists" "OK" 3
} else {
    Write-HealthStatus "   README exists" "FAIL" 0
}

if (Test-Path docs) {
    $healthScore += Write-HealthStatus "   docs/ folder exists" "OK" 2
} else {
    Write-HealthStatus "   docs/ folder exists" "FAIL" 0
}
Write-Host ""

# Final Score
Write-Host "🌟 ============================================" -ForegroundColor Cyan
Write-Host "   HEALTH CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "============================================ 🌟" -ForegroundColor Cyan
Write-Host ""

$scorePercentage = [math]::Round(($healthScore / $maxScore) * 100, 0)
$scoreColor = if ($scorePercentage -ge 80) { "Green" } elseif ($scorePercentage -ge 60) { "Yellow" } else { "Red" }

Write-Host "📊 OVERALL HEALTH SCORE: " -NoNewline
Write-Host "$healthScore/$maxScore ($scorePercentage%)" -ForegroundColor $scoreColor
Write-Host ""

# Status assessment
if ($scorePercentage -ge 90) {
    Write-Host "✅ Status: EXCELLENT - Production Ready!" -ForegroundColor Green
} elseif ($scorePercentage -ge 75) {
    Write-Host "🟢 Status: GOOD - Minor fixes needed" -ForegroundColor Green
} elseif ($scorePercentage -ge 60) {
    Write-Host "🟡 Status: FAIR - Significant work required" -ForegroundColor Yellow
} elseif ($scorePercentage -ge 40) {
    Write-Host "🟠 Status: POOR - Critical issues present" -ForegroundColor Yellow
} else {
    Write-Host "🔴 Status: CRITICAL - Immediate attention required" -ForegroundColor Red
}
Write-Host ""

# Recommendations
Write-Host "💡 Recommendations:" -ForegroundColor Cyan

if ($healthScore -lt 60) {
    Write-Host "   1. Run: .\scripts\fix-dependencies.ps1" -ForegroundColor White
    Write-Host "   2. Run: .\scripts\fix-jest-config.ps1" -ForegroundColor White
    Write-Host "   3. Review: DIVINE_PROJECT_REVIEW_2025-10-25.md" -ForegroundColor White
} elseif ($healthScore -lt 80) {
    Write-Host "   1. Fix remaining TypeScript errors" -ForegroundColor White
    Write-Host "   2. Update failing tests" -ForegroundColor White
    Write-Host "   3. Run: npm run type-check" -ForegroundColor White
} else {
    Write-Host "   ✅ Project is in good health!" -ForegroundColor Green
    Write-Host "   Continue with feature development" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 Full details in: DIVINE_PROJECT_REVIEW_2025-10-25.md" -ForegroundColor Gray
Write-Host ""
