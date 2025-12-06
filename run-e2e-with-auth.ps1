<#
.SYNOPSIS
    E2E Test Runner with Authentication Setup

.DESCRIPTION
    Farmers Market Platform - Divine Testing Framework
    This script will:
    1. Verify dev server is running
    2. Setup authentication states
    3. Run E2E tests
    4. Generate HTML report

.PARAMETER Browser
    Specify browser to test (chromium, firefox, webkit)

.PARAMETER Headed
    Run tests in headed mode (visible browser)

.PARAMETER Grep
    Run only tests matching pattern

.EXAMPLE
    .\run-e2e-with-auth.ps1

.EXAMPLE
    .\run-e2e-with-auth.ps1 -Browser chromium -Headed

.EXAMPLE
    .\run-e2e-with-auth.ps1 -Grep "marketplace"
#>

param(
    [string]$Browser = "",
    [switch]$Headed = $false,
    [string]$Grep = ""
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧪 E2E Test Suite with Authentication                    ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  This script will:                                        ║" -ForegroundColor Cyan
Write-Host "║  1. Verify dev server is running                          ║" -ForegroundColor Cyan
Write-Host "║  2. Setup authentication states                           ║" -ForegroundColor Cyan
Write-Host "║  3. Run E2E tests                                         ║" -ForegroundColor Cyan
Write-Host "║  4. Generate HTML report                                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Step 1: Check if dev server is running
# ============================================================================

Write-Host "[1/5] 🔍 Checking if dev server is running on http://localhost:3001..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    $statusCode = $response.StatusCode
    Write-Host "✅ Dev server is running (HTTP $statusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Dev server is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the dev server first:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================================================
# Step 2: Ensure auth directory exists
# ============================================================================

Write-Host "[2/5] 📁 Ensuring auth directory exists..." -ForegroundColor Yellow

$authDir = "tests\auth\.auth"
if (-not (Test-Path $authDir)) {
    New-Item -ItemType Directory -Path $authDir -Force | Out-Null
    Write-Host "✅ Created auth directory" -ForegroundColor Green
} else {
    Write-Host "✅ Auth directory exists" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# Step 3: Setup authentication (run setup tests)
# ============================================================================

Write-Host "[3/5] 🔐 Setting up authentication states..." -ForegroundColor Yellow
Write-Host "Running authentication setup..." -ForegroundColor White
Write-Host ""

$setupResult = npx playwright test tests/e2e/auth.setup.ts --config=playwright.config.temp.ts --project=setup 2>&1
$setupExitCode = $LASTEXITCODE

if ($setupExitCode -ne 0) {
    Write-Host ""
    Write-Host "❌ Authentication setup failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "  - Login page not accessible" -ForegroundColor White
    Write-Host "  - Test user credentials incorrect" -ForegroundColor White
    Write-Host "  - Database not seeded with test users" -ForegroundColor White
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Test users exist in database" -ForegroundColor White
    Write-Host "  2. Login functionality is working" -ForegroundColor White
    Write-Host "  3. NextAuth configuration is correct" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "✅ Authentication states created successfully!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 4: Verify auth files were created
# ============================================================================

Write-Host "[4/5] 🔍 Verifying authentication files..." -ForegroundColor Yellow

$authFilesOk = $true
$authFiles = @("admin.json", "farmer.json", "customer.json")

foreach ($file in $authFiles) {
    $filePath = Join-Path $authDir $file
    if (Test-Path $filePath) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $authFilesOk = $false
    }
}

if (-not $authFilesOk) {
    Write-Host ""
    Write-Host "❌ Some authentication files are missing!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All authentication files verified" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 5: Run E2E tests with authentication
# ============================================================================

Write-Host "[5/5] 🧪 Running E2E tests..." -ForegroundColor Yellow
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Running Playwright E2E Test Suite                        ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  This may take several minutes...                         ║" -ForegroundColor Cyan
Write-Host "║  Tests will run across multiple browsers:                 ║" -ForegroundColor Cyan
Write-Host "║  • Chromium, Firefox, WebKit                              ║" -ForegroundColor Cyan
Write-Host "║  • Mobile Chrome, Mobile Safari                           ║" -ForegroundColor Cyan
Write-Host "║  • Authenticated contexts (Admin, Farmer, Customer)       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Build test command
$testCmd = "npx playwright test --config=playwright.config.temp.ts"

if ($Browser) {
    $testCmd += " --project=$Browser"
}

if ($Headed) {
    $testCmd += " --headed"
}

if ($Grep) {
    $testCmd += " --grep `"$Grep`""
}

# Exclude setup tests from main run
$testCmd += " --ignore-snapshots"

Write-Host "Running: $testCmd" -ForegroundColor White
Write-Host ""

# Run tests
Invoke-Expression $testCmd
$testExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Display results
# ============================================================================

if ($testExitCode -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Opening HTML report..." -ForegroundColor Yellow
    npx playwright show-report
} else {
    Write-Host "⚠️  Some tests failed (Exit code: $testExitCode)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📊 View detailed results:" -ForegroundColor Yellow
    Write-Host "   npx playwright show-report" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Tips for fixing failures:" -ForegroundColor Cyan
    Write-Host "   1. Check authentication setup is working" -ForegroundColor White
    Write-Host "   2. Verify all routes exist" -ForegroundColor White
    Write-Host "   3. Check database is seeded properly" -ForegroundColor White
    Write-Host "   4. Review test-results folder for screenshots" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📈 Test Results Summary                                   ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  HTML Report: test-results/html-report/index.html         ║" -ForegroundColor Cyan
Write-Host "║  JSON Results: test-results/e2e-results.json              ║" -ForegroundColor Cyan
Write-Host "║  Screenshots: test-results/ (on failure)                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Usage examples
# ============================================================================

if ($testExitCode -ne 0) {
    Write-Host "💡 Usage Examples:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Run all tests:" -ForegroundColor Yellow
    Write-Host "      .\run-e2e-with-auth.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "   Run specific browser:" -ForegroundColor Yellow
    Write-Host "      .\run-e2e-with-auth.ps1 -Browser chromium" -ForegroundColor White
    Write-Host ""
    Write-Host "   Run in headed mode:" -ForegroundColor Yellow
    Write-Host "      .\run-e2e-with-auth.ps1 -Headed" -ForegroundColor White
    Write-Host ""
    Write-Host "   Run tests matching pattern:" -ForegroundColor Yellow
    Write-Host "      .\run-e2e-with-auth.ps1 -Grep 'marketplace'" -ForegroundColor White
    Write-Host ""
    Write-Host "   Combine options:" -ForegroundColor Yellow
    Write-Host "      .\run-e2e-with-auth.ps1 -Browser chromium -Headed -Grep 'login'" -ForegroundColor White
    Write-Host ""
}

exit $testExitCode
