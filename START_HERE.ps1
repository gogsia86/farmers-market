# 🌾 Farmers Market Platform - Quick Start Script (Windows)
# This script helps you begin Phase 1: Critical Blockers

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Print-Success($message) {
    Write-ColorOutput Green "✅ $message"
}

function Print-Error($message) {
    Write-ColorOutput Red "❌ $message"
}

function Print-Warning($message) {
    Write-ColorOutput Yellow "⚠️  $message"
}

function Print-Info($message) {
    Write-ColorOutput Cyan "ℹ️  $message"
}

function Print-Section($message) {
    Write-Host ""
    Write-ColorOutput Cyan "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-ColorOutput Cyan $message
    Write-ColorOutput Cyan "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
}

function Ask-YesNo($message) {
    $response = Read-Host "$message [y/n]"
    return $response -eq "y" -or $response -eq "Y"
}

# Banner
Write-ColorOutput Green @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🌾  FARMERS MARKET PLATFORM - QUICK START                  ║
║                                                               ║
║   Phase 1: Critical Blockers                                 ║
║   Target: 3 Days                                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@

# Check if we're in the right directory
Print-Section "📍 STEP 1: Verify Project Directory"

if (-not (Test-Path "package.json") -or -not (Test-Path "next.config.mjs")) {
    Print-Error "Not in project root directory!"
    Print-Info "Please run this script from: Farmers Market Platform web and app\"
    exit 1
}

Print-Success "Project directory verified"

# Check Node.js version
Print-Section "📦 STEP 2: Check Node.js Version"

try {
    $nodeVersion = node -v
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')

    if ($nodeMajor -lt 20) {
        Print-Error "Node.js version must be 20 or higher"
        Print-Info "Current version: $nodeVersion"
        Print-Info "Required: v20.18.0 or higher"
        exit 1
    }

    Print-Success "Node.js version: $nodeVersion"
} catch {
    Print-Error "Node.js not found. Please install Node.js 20.18.0 or higher"
    exit 1
}

# Check npm version
try {
    $npmVersion = npm -v
    $npmMajor = [int]($npmVersion -replace '(\d+)\..*', '$1')

    if ($npmMajor -lt 10) {
        Print-Error "npm version must be 10 or higher"
        Print-Info "Current version: $npmVersion"
        Print-Info "Required: v10.0.0 or higher"
        exit 1
    }

    Print-Success "npm version: $npmVersion"
} catch {
    Print-Error "npm not found"
    exit 1
}

# Install dependencies
Print-Section "📥 STEP 3: Install Dependencies"

if (Ask-YesNo "Install/update npm dependencies?") {
    Print-Info "Installing dependencies (this may take a few minutes)..."
    npm install
    Print-Success "Dependencies installed"
} else {
    Print-Warning "Skipping dependency installation"
}

# Check environment variables
Print-Section "🔐 STEP 4: Environment Variables"

if (-not (Test-Path ".env")) {
    Print-Error ".env file not found!"
    Print-Info "Creating .env file from template..."

    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Print-Success ".env file created"
        Print-Warning "IMPORTANT: Edit .env and add your actual values!"
    } else {
        Print-Error ".env.example not found. Creating basic .env..."

        @"
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# Auth
NEXTAUTH_SECRET="generate-a-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis
REDIS_URL="redis://localhost:6379"

# Sentry
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
"@ | Out-File -FilePath ".env" -Encoding utf8

        Print-Success "Basic .env created"
        Print-Warning "IMPORTANT: Edit .env and add your actual values!"
    }
} else {
    Print-Success ".env file exists"
}

# Database check
Print-Section "🗄️  STEP 5: Database Connection"

if (Ask-YesNo "Test database connection?") {
    Print-Info "Testing database connection..."
    try {
        npm run db:test 2>&1 | Out-Null
        Print-Success "Database connection successful"
    } catch {
        Print-Error "Database connection failed"
        Print-Info "Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
    }
} else {
    Print-Warning "Skipping database connection test"
}

# Redis check
Print-Section "📦 STEP 6: Redis Connection"

if (Ask-YesNo "Test Redis connection?") {
    Print-Info "Testing Redis connection..."
    try {
        npm run redis:test 2>&1 | Out-Null
        Print-Success "Redis connection successful"
    } catch {
        Print-Error "Redis connection failed"
        Print-Info "Make sure Redis is running and REDIS_URL is correct in .env"
    }
} else {
    Print-Warning "Skipping Redis connection test"
}

# Run tests
Print-Section "🧪 STEP 7: Verify Tests"

if (Ask-YesNo "Run test suite?") {
    Print-Info "Running tests (this may take a few minutes)..."
    try {
        npm test 2>&1 | Tee-Object -FilePath "test-output.log"
        Print-Success "All tests passed!"
    } catch {
        Print-Error "Some tests failed"
        Print-Info "Check test-output.log for details"
    }
} else {
    Print-Warning "Skipping test execution"
}

# Build check
Print-Section "🏗️  STEP 8: Build Verification"

if (Ask-YesNo "Test production build?") {
    Print-Info "Building for production (this may take a few minutes)..."
    try {
        npm run build 2>&1 | Tee-Object -FilePath "build-output.log"
        Print-Success "Build successful!"
    } catch {
        Print-Error "Build failed"
        Print-Info "Check build-output.log for details"
    }
} else {
    Print-Warning "Skipping build verification"
}

# Summary
Print-Section "📊 SETUP SUMMARY"

Write-ColorOutput Green "✅ Core Setup Complete!`n"

Write-ColorOutput Cyan "Next Steps:"
Write-Host "1. " -NoNewline; Write-ColorOutput Yellow "Review TODO.md for detailed task list"
Write-Host "2. " -NoNewline; Write-ColorOutput Yellow "Fix Vercel deployment (see CRITICAL_ACTIONS_REQUIRED.txt)"
Write-Host "3. " -NoNewline; Write-ColorOutput Yellow "Start development server: npm run dev"
Write-Host "4. " -NoNewline; Write-ColorOutput Yellow "Open browser: http://localhost:3001"

Write-Host "`n"
Write-ColorOutput Cyan "Phase 1 Critical Tasks:"
Write-Host "  [P0] 1.1 Fix Vercel Deployment (4 hours)"
Write-Host "  [P0] 1.2 Fix Sentry Configuration (2 hours)"
Write-Host "  [P0] 1.3 Verify Test Suite (3 hours)"
Write-Host "  [P0] 1.4 Security Audit (2 hours)"

Write-Host "`n"
Write-ColorOutput Cyan "Quick Commands:"
Write-Host "  npm run dev           - Start development server"
Write-Host "  npm test              - Run tests"
Write-Host "  npm run lint          - Check code quality"
Write-Host "  npm run type-check    - Check TypeScript"
Write-Host "  npm run db:studio     - Open Prisma Studio"

Write-Host "`n"
Write-ColorOutput Cyan "Documentation:"
Write-Host "  docs\README.md                           - Documentation hub"
Write-Host "  docs\getting-started\QUICK_START_GUIDE.md - Quick start guide"
Write-Host "  TODO.md                                  - Complete task list"
Write-Host "  CRITICAL_ACTIONS_REQUIRED.txt            - Deployment fixes"

Write-Host "`n"
Write-ColorOutput Cyan "Deployment Checklist:"
Write-Host "  [ ] Clear Vercel build cache"
Write-Host "  [ ] Update SENTRY_AUTH_TOKEN in Vercel env vars"
Write-Host "  [ ] Test deployment locally: vercel --prod"
Write-Host "  [ ] Monitor deployment logs"
Write-Host "  [ ] Test health endpoint: curl https://your-domain.vercel.app/api/health"

Write-Host "`n"
Write-ColorOutput Green "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-ColorOutput Green "Setup complete! Ready to start Phase 1 🚀"
Write-ColorOutput Green "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "`n"

# Optional: Open TODO.md
if (Ask-YesNo "Open TODO.md now?") {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        code TODO.md
    } elseif (Get-Command notepad -ErrorAction SilentlyContinue) {
        notepad TODO.md
    } else {
        Print-Info "Please open TODO.md manually"
    }
}

Write-Host "`n"
Write-ColorOutput Magenta "Good luck! 🌾🚜"
Write-Host "`n"
