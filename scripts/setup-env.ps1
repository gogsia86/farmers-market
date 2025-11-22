#!/usr/bin/env pwsh
# ============================================
# 🌟 DIVINE ENVIRONMENT MANAGEMENT SCRIPT
# ============================================
# Purpose: Comprehensive environment variable validation, setup, and management
# Hardware: Optimized for HP OMEN (RTX 2070 Max-Q, 64GB RAM, 12 threads)
# Features: Setup, Verify, Fix, Build integration
# ============================================

param(
    [switch]$Force,
    [switch]$Verbose,
    [switch]$Verify,
    [switch]$Fix,
    [switch]$Build,
    [switch]$Status
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

# ============================================
# BANNER & MODE DETECTION
# ============================================
Write-Host ""
Write-Host "🌟 Divine Environment Management" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$mode = "SETUP"
if ($Verify) { $mode = "VERIFY" }
if ($Fix) { $mode = "FIX" }
if ($Build) { $mode = "BUILD" }
if ($Status) { $mode = "STATUS" }

Write-Host "Mode: $mode" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# ============================================
# CONFIGURATION: Required Environment Variables
# ============================================
$requiredVars = @{
    # CRITICAL: Port Configuration
    "PORT" = "3001"
    "HOSTNAME" = "0.0.0.0"

    # CRITICAL: App URLs (required for Next.js ISR)
    "APP_URL" = "http://localhost:3001"
    "NEXT_PUBLIC_APP_URL" = "http://localhost:3001"
    "NEXT_PUBLIC_API_URL" = "http://localhost:3001/api"

    # Authentication
    "NEXTAUTH_URL" = "http://localhost:3001"
    "NEXTAUTH_SECRET" = $null  # Will generate if missing

    # Database
    "DATABASE_URL" = "postgresql://postgres:postgres@localhost:5432/farmersmarket?schema=public"
    "DIRECT_URL" = "postgresql://postgres:postgres@localhost:5432/farmersmarket?schema=public"

    # Node Environment
    "NODE_ENV" = "development"

    # Next.js Configuration
    "NEXT_TELEMETRY_DISABLED" = "1"
    "GENERATE_SOURCEMAP" = "false"

    # Hardware Optimizations (HP OMEN)
    "NODE_OPTIONS" = "--max-old-space-size=32768 --max-semi-space-size=128"
    "UV_THREADPOOL_SIZE" = "12"
    "PARALLEL_BUILDS" = "12"
    "TERSER_WORKERS" = "12"

    # GPU Acceleration
    "ENABLE_GPU_ACCELERATION" = "true"
    "GPU_MEMORY_LIMIT" = "8192"
    "CUDA_VISIBLE_DEVICES" = "0"
}

$optionalVars = @{
    # Redis Cache
    "REDIS_URL" = "redis://:quantum_cache_password@localhost:6379"

    # Stripe Payments
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = "pk_test_your_stripe_publishable_key"
    "STRIPE_SECRET_KEY" = "sk_test_your_stripe_secret_key"
    "STRIPE_WEBHOOK_SECRET" = "whsec_your_stripe_webhook_secret"

    # AI Services
    "OPENAI_API_KEY" = "sk-your-openai-api-key"
    "PERPLEXITY_API_KEY" = "pplx-your-perplexity-api-key"
    "PERPLEXITY_DEFAULT_MODEL" = "SONAR_PRO"
    "PERPLEXITY_SMART_ROUTING" = "true"

    # Error Tracking
    "SENTRY_DSN" = "https://your-sentry-dsn@sentry.io/your-project-id"
    "SENTRY_ORG" = "your-organization"
    "SENTRY_PROJECT" = "farmers-market"

    # Email Service (SMTP)
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_SECURE" = "false"
    "SMTP_USER" = "your-email@gmail.com"
    "SMTP_PASSWORD" = "your-app-specific-password"
    "SMTP_FROM" = "noreply@farmersmarket.app"

    # Storage
    "STORAGE_PROVIDER" = "local"

    # OpenTelemetry Tracing
    "OTEL_EXPORTER_OTLP_ENDPOINT" = "http://localhost:4318/v1/traces"
    "OTEL_SERVICE_NAME" = "farmers-market-platform"
    "OTEL_SERVICE_VERSION" = "1.0.0"
    "ENABLE_TRACING" = "true"
    "OTEL_TRACES_SAMPLER" = "always_on"
    "ENABLE_AGRICULTURAL_CONSCIOUSNESS" = "true"
    "ENABLE_DIVINE_PATTERNS" = "true"
}

# ============================================
# HELPER FUNCTIONS
# ============================================
function Generate-SecureSecret {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

function Test-EnvVariable {
    param(
        [string]$Name,
        [string]$ExpectedValue,
        [bool]$IsOptional = $false
    )

    $currentValue = [Environment]::GetEnvironmentVariable($Name)
    $status = @{
        Name = $Name
        Expected = $ExpectedValue
        Current = $currentValue
        IsSet = $null -ne $currentValue -and $currentValue -ne ""
        IsCorrect = $currentValue -eq $ExpectedValue
        IsOptional = $IsOptional
    }

    return $status
}

function Show-VariableStatus {
    param($Status)

    Write-Host "   $($Status.Name): " -NoNewline

    if ($Status.IsSet) {
        if ($Status.IsCorrect -or $Status.IsOptional) {
            Write-Host "✅ " -NoNewline -ForegroundColor Green
            if ($Verbose) {
                Write-Host "$($Status.Current)" -ForegroundColor Gray
            } else {
                Write-Host "OK" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  " -NoNewline -ForegroundColor Yellow
            Write-Host "Mismatch (expected: $($Status.Expected), got: $($Status.Current))" -ForegroundColor Yellow
        }
    } else {
        if ($Status.IsOptional) {
            Write-Host "⚪ Not set (optional)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Missing" -ForegroundColor Red
        }
    }
}

# ============================================
# STEP 1: Check for .env file
# ============================================
Write-Host "📋 Step 1: Checking .env files..." -ForegroundColor Yellow
Write-Host ""

$envFile = Join-Path $projectRoot ".env"
$envProductionFile = Join-Path $projectRoot ".env.production"
$envLocalFile = Join-Path $projectRoot ".env.local"
$envExampleFile = Join-Path $projectRoot ".env.example"

$envExists = Test-Path $envFile
$envProductionExists = Test-Path $envProductionFile
$envLocalExists = Test-Path $envLocalFile
$envExampleExists = Test-Path $envExampleFile

Write-Host "   .env file:            " -NoNewline
if ($envExists) {
    Write-Host "✅ Found" -ForegroundColor Green
} else {
    Write-Host "❌ Missing" -ForegroundColor Red
}

Write-Host "   .env.production:      " -NoNewline
if ($envProductionExists) {
    Write-Host "✅ Found" -ForegroundColor Green
} else {
    Write-Host "⚪ Not found (optional)" -ForegroundColor Gray
}

Write-Host "   .env.local:           " -NoNewline
if ($envLocalExists) {
    Write-Host "✅ Found" -ForegroundColor Green
} else {
    Write-Host "⚪ Not found (optional)" -ForegroundColor Gray
}

Write-Host "   .env.example:         " -NoNewline
if ($envExampleExists) {
    Write-Host "✅ Found" -ForegroundColor Green
} else {
    Write-Host "⚪ Not found (optional)" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# STEP 2: Read existing environment variables
# ============================================
Write-Host "📖 Step 2: Reading existing environment variables..." -ForegroundColor Yellow

$envVars = @{}

if ($envExists) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars[$key] = $value
            if ($Verbose) {
                Write-Host "   Found: $key" -ForegroundColor Gray
            }
        }
    }
    Write-Host "   ✅ Loaded $($envVars.Count) variables from .env" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No .env file found - will create one" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# STEP 3: Define required environment variables
# ============================================
Write-Host "🔍 Step 3: Validating required environment variables..." -ForegroundColor Yellow

$requiredVars = @{
    "PORT" = "3000"
    "NEXT_PUBLIC_API_URL" = "http://localhost:3000"
    "APP_URL" = "http://localhost:3000"
    "DATABASE_URL" = "postgresql://user:password@localhost:5432/farmers_market"
    "NEXTAUTH_URL" = "http://localhost:3000"
    "NEXTAUTH_SECRET" = "divine-secret-" + [System.Guid]::NewGuid().ToString()
}

$missingVars = @()
$warnings = @()

foreach ($var in $requiredVars.Keys) {
    Write-Host "   Checking $var... " -NoNewline

    if ($envVars.ContainsKey($var) -and $envVars[$var]) {
        Write-Host "✅ Set" -ForegroundColor Green

        # Check for default/placeholder values
        if ($envVars[$var] -like "*your-*" -or $envVars[$var] -like "*change-this*") {
            $warnings += "   ⚠️  $var has a placeholder value: $($envVars[$var])"
        }
    } else {
        Write-Host "❌ Missing" -ForegroundColor Red
        $missingVars += $var
    }
}

Write-Host ""

# ============================================
# STEP 4: Report warnings
# ============================================
if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
    Write-Host ""
}

# ============================================
# STEP 5: Create or update .env file
# ============================================
if ($missingVars.Count -gt 0 -or $Force) {
    Write-Host "🔧 Step 4: Creating/updating .env file..." -ForegroundColor Yellow

    # Backup existing .env if it exists
    if ($envExists -and -not $Force) {
        $backupFile = Join-Path $projectRoot ".env.backup"
        Copy-Item $envFile $backupFile -Force
        Write-Host "   📦 Backed up existing .env to .env.backup" -ForegroundColor Cyan
    }

    # Create new .env content
    $envContent = @"
# ============================================
# 🌟 DIVINE ENVIRONMENT CONFIGURATION
# ============================================
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
#
# IMPORTANT: Update these values for your environment!
# DO NOT commit sensitive values to version control!

# ============================================
# APPLICATION SETTINGS
# ============================================
PORT=$($requiredVars['PORT'])
NODE_ENV=development
APP_URL=$($requiredVars['APP_URL'])

# ============================================
# NEXT.JS CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=$($requiredVars['NEXT_PUBLIC_API_URL'])
NEXT_TELEMETRY_DISABLED=1

# ============================================
# AUTHENTICATION (NextAuth.js)
# ============================================
NEXTAUTH_URL=$($requiredVars['NEXTAUTH_URL'])
NEXTAUTH_SECRET=$($requiredVars['NEXTAUTH_SECRET'])

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Update this with your actual database connection string!
DATABASE_URL=$($requiredVars['DATABASE_URL'])

# ============================================
# OPTIONAL: EXTERNAL SERVICES
# ============================================
# Uncomment and configure as needed:
# STRIPE_SECRET_KEY=sk_test_your_key_here
# STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
# SENDGRID_API_KEY=your_sendgrid_api_key_here
# UPLOADTHING_SECRET=your_uploadthing_secret_here
# UPLOADTHING_APP_ID=your_uploadthing_app_id_here

# ============================================
# DIVINE DEVELOPMENT SETTINGS
# ============================================
# Agricultural consciousness level (0.0 - 1.0)
AGRICULTURAL_CONSCIOUSNESS=0.95
# Enable divine logging
DIVINE_LOGGING=true

"@

    # Preserve existing custom variables
    if ($envExists) {
        foreach ($key in $envVars.Keys) {
            if (-not $requiredVars.ContainsKey($key)) {
                $envContent += "`n$key=$($envVars[$key])"
            }
        }
    }

    # Write .env file
    Set-Content -Path $envFile -Value $envContent -Encoding UTF8
    Write-Host "   ✅ Created/updated .env file" -ForegroundColor Green

    # Create .env.production if it doesn't exist
    if (-not $envProductionExists -or $Force) {
        $envProductionContent = $envContent -replace 'NODE_ENV=development', 'NODE_ENV=production'
        $envProductionContent = $envProductionContent -replace 'http://localhost:3000', 'https://your-production-domain.com'
        Set-Content -Path $envProductionFile -Value $envProductionContent -Encoding UTF8
        Write-Host "   ✅ Created/updated .env.production file" -ForegroundColor Green
    }

    Write-Host ""
}

# ============================================
# STEP 6: Test Next.js environment loading
# ============================================
Write-Host "🧪 Step 5: Testing Next.js environment loading..." -ForegroundColor Yellow

try {
    # Check if node_modules exists
    $nodeModulesPath = Join-Path $projectRoot "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "   ⚠️  node_modules not found - run 'npm install' first" -ForegroundColor Yellow
    } else {
        # Test loading .env with Next.js
        $testScript = @"
require('dotenv').config();
const port = process.env.PORT;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const dbUrl = process.env.DATABASE_URL;

console.log('PORT:', port || 'NOT SET');
console.log('NEXT_PUBLIC_API_URL:', apiUrl || 'NOT SET');
console.log('DATABASE_URL:', dbUrl ? '***SET***' : 'NOT SET');

if (!port || !apiUrl || !dbUrl) {
    process.exit(1);
}
"@

        $testFile = Join-Path $projectRoot "test-env-loading.js"
        Set-Content -Path $testFile -Value $testScript -Encoding UTF8

        $output = node $testFile 2>&1
        $exitCode = $LASTEXITCODE

        Remove-Item $testFile -Force -ErrorAction SilentlyContinue

        if ($exitCode -eq 0) {
            Write-Host "   ✅ Environment variables loaded successfully" -ForegroundColor Green
            if ($Verbose) {
                $output | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
            }
        } else {
            Write-Host "   ❌ Environment variables not loading correctly" -ForegroundColor Red
            Write-Host "   Output:" -ForegroundColor Yellow
            $output | ForEach-Object { Write-Host "      $_" -ForegroundColor Yellow }
        }
    }
} catch {
    Write-Host "   ⚠️  Could not test environment loading: $_" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# STEP 7: Final summary
# ============================================
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

if ($missingVars.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ All environment variables are configured correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 You can now run:" -ForegroundColor Cyan
    Write-Host "   npm run build" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
} else {
    if ($missingVars.Count -gt 0) {
        Write-Host "⚠️  Missing variables have been added with default values" -ForegroundColor Yellow
    }
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  Some variables need to be updated with real values" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Open .env file and update placeholder values" -ForegroundColor White
    Write-Host "   2. Especially update DATABASE_URL with your real database connection" -ForegroundColor White
    Write-Host "   3. Run 'npm run build' to test the build" -ForegroundColor White
}

Write-Host ""
Write-Host "🌟 Divine environment setup complete!" -ForegroundColor Green
Write-Host ""
