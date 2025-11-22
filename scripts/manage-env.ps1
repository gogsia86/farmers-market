#!/usr/bin/env pwsh
# ============================================
# 🌟 DIVINE ENVIRONMENT MANAGEMENT SCRIPT
# ============================================
# Purpose: Comprehensive environment variable validation, setup, and management
# Hardware: Optimized for HP OMEN (RTX 2070 Max-Q, 64GB RAM, 12 threads)
# Features: Setup, Verify, Fix, Build integration, Status reporting
# ============================================

param(
    [switch]$Verify,      # Verify all environment variables
    [switch]$Fix,         # Fix issues in current session
    [switch]$Build,       # Fix and run build
    [switch]$Status,      # Show detailed status report
    [switch]$Create,      # Create missing .env file
    [switch]$Update,      # Update existing .env file
    [switch]$Verbose,     # Verbose output
    [switch]$Force        # Force operations without prompts
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

# ============================================
# BANNER & MODE DETECTION
# ============================================
function Show-Banner {
    Write-Host ""
    Write-Host "🌟 Divine Environment Management" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan

    $mode = "INTERACTIVE"
    if ($Verify) { $mode = "VERIFY" }
    if ($Fix) { $mode = "FIX" }
    if ($Build) { $mode = "BUILD" }
    if ($Status) { $mode = "STATUS" }
    if ($Create) { $mode = "CREATE" }
    if ($Update) { $mode = "UPDATE" }

    Write-Host "Mode: $mode" -ForegroundColor Yellow
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host ""
}

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
        [bool]$IsOptional = $false,
        [string]$CurrentValue = $null
    )

    if ($null -eq $CurrentValue) {
        $CurrentValue = [Environment]::GetEnvironmentVariable($Name)
    }

    $status = @{
        Name = $Name
        Expected = $ExpectedValue
        Current = $CurrentValue
        IsSet = $null -ne $CurrentValue -and $CurrentValue -ne ""
        IsCorrect = $CurrentValue -eq $ExpectedValue -or ($IsOptional -and $null -ne $CurrentValue -and $CurrentValue -ne "")
        IsOptional = $IsOptional
        IsPlaceholder = $null -ne $CurrentValue -and ($CurrentValue -like "*your-*" -or $CurrentValue -like "*change-this*")
    }

    return $status
}

function Show-VariableStatus {
    param($Status)

    Write-Host "   $($Status.Name): " -NoNewline

    if ($Status.IsSet) {
        if ($Status.IsPlaceholder) {
            Write-Host "⚠️  " -NoNewline -ForegroundColor Yellow
            Write-Host "Placeholder value" -ForegroundColor Yellow
        } elseif ($Status.IsCorrect -or $Status.IsOptional) {
            Write-Host "✅ " -NoNewline -ForegroundColor Green
            if ($Verbose) {
                $displayValue = if ($Status.Name -like "*SECRET*" -or $Status.Name -like "*PASSWORD*" -or $Status.Name -like "*KEY*") {
                    "***SET***"
                } else {
                    $Status.Current
                }
                Write-Host "$displayValue" -ForegroundColor Gray
            } else {
                Write-Host "OK" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  " -NoNewline -ForegroundColor Yellow
            Write-Host "Mismatch" -ForegroundColor Yellow
            if ($Verbose) {
                Write-Host "      Expected: $($Status.Expected)" -ForegroundColor Gray
                Write-Host "      Got:      $($Status.Current)" -ForegroundColor Gray
            }
        }
    } else {
        if ($Status.IsOptional) {
            Write-Host "⚪ Not set (optional)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Missing" -ForegroundColor Red
        }
    }
}

function Read-EnvFile {
    param([string]$FilePath)

    $envVars = @{}

    if (Test-Path $FilePath) {
        Get-Content $FilePath | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Remove surrounding quotes if present
                if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
                    $value = $matches[1]
                }
                $envVars[$key] = $value
            }
        }
    }

    return $envVars
}

function Write-EnvFile {
    param(
        [string]$FilePath,
        [hashtable]$Variables
    )

    $content = @"
# ============================================
# 🌟 DIVINE ENVIRONMENT CONFIGURATION
# ============================================
# Auto-generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Hardware: HP OMEN (RTX 2070 Max-Q, 64GB RAM, 12 threads)
# ============================================

"@

    $content += "`n# === CRITICAL CONFIGURATION ===`n"
    foreach ($key in ($Variables.Keys | Sort-Object)) {
        if ($requiredVars.ContainsKey($key)) {
            $value = $Variables[$key]
            $content += "$key=$value`n"
        }
    }

    $content += "`n# === OPTIONAL CONFIGURATION ===`n"
    foreach ($key in ($Variables.Keys | Sort-Object)) {
        if ($optionalVars.ContainsKey($key)) {
            $value = $Variables[$key]
            $content += "$key=$value`n"
        }
    }

    $content | Out-File -FilePath $FilePath -Encoding UTF8 -Force
}

# ============================================
# MAIN EXECUTION FLOW
# ============================================
Show-Banner

# ============================================
# STEP 1: Check for .env files
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
Write-Host ""

$envVars = @{}

if ($envExists) {
    $envVars = Read-EnvFile -FilePath $envFile
    Write-Host "   ✅ Loaded $($envVars.Count) variables from .env" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No .env file found" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# STEP 3: Validate required variables
# ============================================
Write-Host "🔍 Step 3: Validating required environment variables..." -ForegroundColor Yellow
Write-Host ""

$missing = @()
$incorrect = @()
$placeholders = @()

foreach ($var in $requiredVars.Keys) {
    $expectedValue = $requiredVars[$var]
    $currentValue = $envVars[$var]

    # Generate NEXTAUTH_SECRET if not set
    if ($var -eq "NEXTAUTH_SECRET" -and (-not $currentValue -or $currentValue -eq "")) {
        $expectedValue = Generate-SecureSecret
        $currentValue = $expectedValue
        $envVars[$var] = $expectedValue
    }

    $status = Test-EnvVariable -Name $var -ExpectedValue $expectedValue -CurrentValue $currentValue
    Show-VariableStatus -Status $status

    if (-not $status.IsSet) {
        $missing += $var
    } elseif ($status.IsPlaceholder) {
        $placeholders += $var
    } elseif (-not $status.IsCorrect) {
        $incorrect += $var
    }
}

Write-Host ""

# ============================================
# STEP 4: Validate optional variables
# ============================================
if ($Status -or $Verbose) {
    Write-Host "📋 Step 4: Checking optional environment variables..." -ForegroundColor Yellow
    Write-Host ""

    foreach ($var in $optionalVars.Keys) {
        $expectedValue = $optionalVars[$var]
        $currentValue = $envVars[$var]

        $status = Test-EnvVariable -Name $var -ExpectedValue $expectedValue -CurrentValue $currentValue -IsOptional $true
        Show-VariableStatus -Status $status

        if ($status.IsPlaceholder) {
            $placeholders += $var
        }
    }

    Write-Host ""
}

# ============================================
# STEP 5: Check system environment variables
# ============================================
if ($Verify -or $Status) {
    Write-Host "🖥️  Step 5: Checking system environment variables..." -ForegroundColor Yellow
    Write-Host ""

    foreach ($var in $requiredVars.Keys) {
        $sysValue = [Environment]::GetEnvironmentVariable($var)
        $fileValue = $envVars[$var]

        Write-Host "   $var" -NoNewline
        if ($sysValue -eq $fileValue) {
            Write-Host " ✅ Synced" -ForegroundColor Green
        } elseif ($null -ne $sysValue) {
            Write-Host " ⚠️  System value differs from .env" -ForegroundColor Yellow
        } else {
            Write-Host " ⚪ Not set in system environment" -ForegroundColor Gray
        }
    }

    Write-Host ""
}

# ============================================
# STEP 6: Fix issues if requested
# ============================================
if ($Fix -or $Build) {
    Write-Host "🔧 Step 6: Fixing environment variables..." -ForegroundColor Yellow
    Write-Host ""

    foreach ($var in $requiredVars.Keys) {
        $value = if ($envVars.ContainsKey($var)) { $envVars[$var] } else { $requiredVars[$var] }

        # Generate secret if needed
        if ($var -eq "NEXTAUTH_SECRET" -and (-not $value -or $value -eq "")) {
            $value = Generate-SecureSecret
        }

        Set-Item -Path "env:$var" -Value $value
        Write-Host "   ✅ Set $var" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "   ✅ Environment variables fixed for this session!" -ForegroundColor Green
    Write-Host "   NOTE: These are temporary. For permanent fix, use -Update." -ForegroundColor Yellow
    Write-Host ""
}

# ============================================
# STEP 7: Create or update .env file
# ============================================
if ($Create -or $Update) {
    Write-Host "📝 Step 7: Updating .env file..." -ForegroundColor Yellow
    Write-Host ""

    # Merge required and optional variables
    $allVars = @{}

    # Add required variables
    foreach ($var in $requiredVars.Keys) {
        $value = if ($envVars.ContainsKey($var)) { $envVars[$var] } else { $requiredVars[$var] }

        # Generate secret if needed
        if ($var -eq "NEXTAUTH_SECRET" -and (-not $value -or $value -eq "")) {
            $value = Generate-SecureSecret
        }

        $allVars[$var] = $value
    }

    # Add optional variables (only if they exist in current .env or we're creating from scratch)
    foreach ($var in $optionalVars.Keys) {
        if ($envVars.ContainsKey($var)) {
            $allVars[$var] = $envVars[$var]
        } elseif ($Create) {
            $allVars[$var] = $optionalVars[$var]
        }
    }

    # Backup existing .env if it exists
    if ($envExists) {
        $backupFile = Join-Path $projectRoot ".env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item -Path $envFile -Destination $backupFile -Force
        Write-Host "   📦 Backed up existing .env to: $(Split-Path -Leaf $backupFile)" -ForegroundColor Cyan
    }

    # Write new .env file
    Write-EnvFile -FilePath $envFile -Variables $allVars
    Write-Host "   ✅ .env file updated successfully!" -ForegroundColor Green
    Write-Host ""
}

# ============================================
# STEP 8: Run build if requested
# ============================================
if ($Build) {
    Write-Host "🏗️  Step 8: Running build..." -ForegroundColor Yellow
    Write-Host ""

    try {
        npm run build
        Write-Host ""
        Write-Host "   ✅ Build completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "   ❌ Build failed!" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
}

# ============================================
# SUMMARY REPORT
# ============================================
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

$totalIssues = $missing.Count + $incorrect.Count + $placeholders.Count

if ($totalIssues -eq 0) {
    Write-Host "✅ All environment variables are configured correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 You can now run:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host "   npm run build" -ForegroundColor White
} else {
    if ($missing.Count -gt 0) {
        Write-Host "❌ Missing variables ($($missing.Count)):" -ForegroundColor Red
        $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        Write-Host ""
    }

    if ($incorrect.Count -gt 0) {
        Write-Host "⚠️  Incorrect variables ($($incorrect.Count)):" -ForegroundColor Yellow
        $incorrect | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
        Write-Host ""
    }

    if ($placeholders.Count -gt 0) {
        Write-Host "⚠️  Placeholder values ($($placeholders.Count)):" -ForegroundColor Yellow
        $placeholders | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
        Write-Host ""
    }

    Write-Host "🔧 Fix with:" -ForegroundColor Cyan
    Write-Host "   .\scripts\manage-env.ps1 -Fix          # Fix for this session" -ForegroundColor White
    Write-Host "   .\scripts\manage-env.ps1 -Update       # Update .env file" -ForegroundColor White
    Write-Host "   .\scripts\manage-env.ps1 -Build        # Fix and build" -ForegroundColor White
    Write-Host ""

    exit 1
}

Write-Host ""
Write-Host "🌟 Divine environment management complete!" -ForegroundColor Cyan
Write-Host ""
