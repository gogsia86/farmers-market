# 🌾 E2E Test Runner - Farmers Market Platform
# Runs Playwright E2E tests against test database

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🌾 E2E Test Suite - Farmers Market Platform              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Set test database URL
$env:DATABASE_URL = "postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test"

# Check if test database is running
Write-Host "🔍 Checking test database connection..." -ForegroundColor Yellow
$dbCheck = docker-compose -f docker-compose.test.yml ps --format json | ConvertFrom-Json
if ($dbCheck.State -ne "running") {
    Write-Host "❌ Test database is not running!" -ForegroundColor Red
    Write-Host "   Starting test database..." -ForegroundColor Yellow
    docker-compose -f docker-compose.test.yml up -d
    Start-Sleep -Seconds 5
}
Write-Host "✅ Test database is running" -ForegroundColor Green

# Push latest schema to test database
Write-Host ""
Write-Host "📋 Pushing Prisma schema to test database..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Schema push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Schema pushed successfully" -ForegroundColor Green

# Check if dev server is running
Write-Host ""
Write-Host "🔍 Checking if dev server is running on port 3001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Dev server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Dev server is NOT running on port 3001!" -ForegroundColor Red
    Write-Host "   Please start the dev server first:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Cyan
    exit 1
}

# Run E2E tests
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧪 Running E2E Test Suite                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Parse command line arguments
$workers = 6
$headed = $false
$debug = $false
$grep = $null

for ($i = 0; $i -lt $args.Count; $i++) {
    switch ($args[$i]) {
        "--workers" { $workers = $args[++$i] }
        "--headed" { $headed = $true }
        "--debug" { $debug = $true }
        "--grep" { $grep = $args[++$i] }
        "--help" {
            Write-Host "Usage: .\run-e2e-tests.ps1 [options]"
            Write-Host ""
            Write-Host "Options:"
            Write-Host "  --workers [n]     Number of parallel workers (default: 6)"
            Write-Host "  --headed          Run tests in headed mode (visible browser)"
            Write-Host "  --debug           Run tests in debug mode"
            Write-Host "  --grep [pattern]  Only run tests matching pattern"
            Write-Host "  --help            Show this help message"
            Write-Host ""
            Write-Host "Examples:"
            Write-Host "  .\run-e2e-tests.ps1"
            Write-Host "  .\run-e2e-tests.ps1 --workers 4 --headed"
            Write-Host "  .\run-e2e-tests.ps1 --grep 'login'"
            exit 0
        }
    }
}

# Build test command
$testCommand = "npx playwright test --config=playwright.config.temp.ts"
$testCommand += " --workers=$workers"

if ($headed) {
    $testCommand += " --headed"
}

if ($debug) {
    $testCommand += " --debug"
}

if ($grep) {
    $testCommand += " --grep `"$grep`""
}

Write-Host "🚀 Running: $testCommand" -ForegroundColor Cyan
Write-Host ""

# Execute tests
Invoke-Expression $testCommand
$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
if ($exitCode -eq 0) {
    Write-Host "║  ✅ E2E Tests Completed Successfully!                     ║" -ForegroundColor Green
} else {
    Write-Host "║  ❌ E2E Tests Failed                                      ║" -ForegroundColor Red
}
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Show report options
Write-Host "To view the detailed report, run:" -ForegroundColor Yellow
Write-Host "   npx playwright show-report" -ForegroundColor Cyan
Write-Host ""

exit $exitCode
