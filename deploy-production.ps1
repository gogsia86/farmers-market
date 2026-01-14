# 🚀 Farmers Market Platform - Production Deployment Script (Windows)
# This script helps deploy to Vercel with all required environment variables

$ErrorActionPreference = "Stop"

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🌾 FARMERS MARKET PLATFORM - PRODUCTION DEPLOYMENT          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if logged in
try {
    $vercelUser = vercel whoami 2>&1 | Select-String -Pattern ">" | ForEach-Object { $_.Line.Replace(">", "").Trim() }
    Write-Host "✅ Logged in as: $vercelUser" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Vercel" -ForegroundColor Red
    Write-Host "Run: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "This file contains your API keys and secrets." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env.local file found" -ForegroundColor Green
Write-Host ""

# Function to check if env var exists in .env.local
function Test-EnvVar {
    param($VarName)
    $content = Get-Content ".env.local" -Raw
    if ($content -match "^$VarName=") {
        Write-Host "  ✓ $VarName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ✗ $VarName (MISSING)" -ForegroundColor Red
        return $false
    }
}

# Check required environment variables
Write-Host "📋 Checking required environment variables in .env.local..." -ForegroundColor Cyan
Write-Host ""

$requiredVars = @(
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "NEXTAUTH_SECRET"
)

$optionalVars = @(
    "REDIS_URL",
    "NEXTAUTH_URL",
    "NEXT_PUBLIC_APP_URL",
    "STRIPE_SECRET_KEY",
    "SENTRY_DSN"
)

$allPresent = $true

Write-Host "Required Variables:" -ForegroundColor Yellow
foreach ($var in $requiredVars) {
    if (-not (Test-EnvVar $var)) {
        $allPresent = $false
    }
}

Write-Host ""
Write-Host "Optional Variables:" -ForegroundColor Yellow
foreach ($var in $optionalVars) {
    Test-EnvVar $var | Out-Null
}

Write-Host ""

if (-not $allPresent) {
    Write-Host "❌ Some required environment variables are missing!" -ForegroundColor Red
    Write-Host "Please add them to .env.local and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All required environment variables present" -ForegroundColor Green
Write-Host ""

# Pre-deployment checks
Write-Host "🔍 Running pre-deployment checks..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Running TypeScript check..." -ForegroundColor Yellow
try {
    $null = npm run type-check 2>&1
    Write-Host "✅ TypeScript check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ TypeScript check failed" -ForegroundColor Red
    Write-Host "Run 'npm run type-check' to see errors" -ForegroundColor Yellow
    exit 1
}

Write-Host "2️⃣  Running ESLint..." -ForegroundColor Yellow
try {
    $null = npm run lint 2>&1
    Write-Host "✅ Lint check passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Lint check has warnings (continuing anyway)" -ForegroundColor Yellow
}

Write-Host "3️⃣  Testing build..." -ForegroundColor Yellow
Write-Host "   (This may take a few minutes...)" -ForegroundColor Gray
try {
    $null = npm run build 2>&1
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host "Run 'npm run build' to see errors" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ All pre-deployment checks passed!" -ForegroundColor Green
Write-Host ""

# Ask user what they want to do
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  What would you like to do?                                  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "1) Copy environment variables to Vercel (required first time)" -ForegroundColor White
Write-Host "2) Deploy to production" -ForegroundColor White
Write-Host "3) Both (copy env vars + deploy)" -ForegroundColor White
Write-Host "4) Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

function Copy-EnvVarsToVercel {
    param($ProjectName)

    Write-Host ""
    Write-Host "📤 Copying environment variables to Vercel..." -ForegroundColor Cyan
    Write-Host ""

    $projectFlag = ""
    if ($ProjectName) {
        $projectFlag = "--scope=$vercelUser --project=$ProjectName"
    } else {
        Write-Host "⚠️  No project name provided. Using current directory." -ForegroundColor Yellow
    }

    Write-Host "Copying variables to Production environment..." -ForegroundColor Yellow
    Write-Host ""

    # Read .env.local and add each variable
    $envContent = Get-Content ".env.local"

    foreach ($line in $envContent) {
        # Skip comments and empty lines
        if ($line -match '^\s*#' -or $line -match '^\s*$') {
            continue
        }

        # Parse key=value
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()

            # Remove quotes if present
            $value = $value -replace '^["'']|["'']$', ''

            Write-Host "Setting: $key" -ForegroundColor Cyan

            # Special handling for production URLs
            if ($key -eq "NEXTAUTH_URL" -or $key -eq "NEXT_PUBLIC_APP_URL") {
                Write-Host "⚠️  Please update $key to your production domain after deployment" -ForegroundColor Yellow
            }

            # Add to Vercel
            try {
                $value | vercel env add $key production $projectFlag 2>&1 | Out-Null
            } catch {
                # Ignore "already exists" errors
                if ($_.Exception.Message -notmatch "already exists") {
                    Write-Host "  Warning: Could not set $key" -ForegroundColor Yellow
                }
            }
        }
    }

    Write-Host ""
    Write-Host "✅ Environment variables copied to Vercel!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 IMPORTANT: Update these URLs in Vercel dashboard after deployment:" -ForegroundColor Yellow
    Write-Host "   - NEXTAUTH_URL (set to your production domain)" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_APP_URL (set to your production domain)" -ForegroundColor White
    Write-Host ""
    Write-Host "Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables" -ForegroundColor Cyan
    Write-Host ""
}

switch ($choice) {
    "1" {
        $projectName = Read-Host "Enter your Vercel project name (or press Enter to skip)"
        Copy-EnvVarsToVercel -ProjectName $projectName
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
        Write-Host ""
        vercel --prod
    }
    "3" {
        Write-Host ""
        Write-Host "📤 Step 1: Copying environment variables to Vercel..." -ForegroundColor Cyan
        Write-Host ""

        $projectName = Read-Host "Enter your Vercel project name (or press Enter to skip)"
        Copy-EnvVarsToVercel -ProjectName $projectName

        Write-Host "🚀 Step 2: Deploying to production..." -ForegroundColor Cyan
        Write-Host ""
        vercel --prod
    }
    "4" {
        Write-Host "👋 Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  🎉 DEPLOYMENT COMPLETE!                                     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Update production URLs in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "   → NEXTAUTH_URL" -ForegroundColor White
Write-Host "   → NEXT_PUBLIC_APP_URL" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Test your deployment:" -ForegroundColor Yellow
Write-Host "   → Visit your production URL" -ForegroundColor White
Write-Host "   → Test AI features: /ai-assistant (customer) & /farmer/ai-advisor" -ForegroundColor White
Write-Host "   → Check admin dashboard: /admin/ai-monitoring" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Monitor your deployment:" -ForegroundColor Yellow
Write-Host "   → Vercel Logs: https://vercel.com/dashboard/logs" -ForegroundColor Cyan
Write-Host "   → AI Monitoring: https://your-domain.vercel.app/admin/ai-monitoring" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎊 Your Farmers Market Platform is now live! 🌾" -ForegroundColor Green
Write-Host ""
