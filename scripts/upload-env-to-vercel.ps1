# ═══════════════════════════════════════════════════════════
# 🚀 VERCEL ENVIRONMENT VARIABLES UPLOAD SCRIPT (PowerShell)
# Farmers Market Platform - Automated Environment Setup
# Last Updated: 2024-12-18
# ═══════════════════════════════════════════════════════════

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ═══════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════

function Write-Header {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  🌾 Farmers Market Platform - Vercel Environment Setup" -ForegroundColor Blue
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# ═══════════════════════════════════════════════════════════
# Check Prerequisites
# ═══════════════════════════════════════════════════════════

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    # Check if Vercel CLI is installed
    try {
        $null = vercel --version
        Write-Success "Vercel CLI is installed"
    }
    catch {
        Write-Error-Custom "Vercel CLI is not installed"
        Write-Host ""
        Write-Host "Install it with:"
        Write-Host "  npm install -g vercel"
        Write-Host ""
        exit 1
    }

    # Check if .env.vercel.local exists
    if (-not (Test-Path ".env.vercel.local")) {
        Write-Warning-Custom ".env.vercel.local not found"
        Write-Host ""
        Write-Host "Creating .env.vercel.local from template..."

        if (Test-Path ".env.vercel") {
            Copy-Item ".env.vercel" ".env.vercel.local"
            Write-Success "Created .env.vercel.local from template"
            Write-Host ""
            Write-Warning-Custom "IMPORTANT: Edit .env.vercel.local with your actual values before continuing!"
            Write-Host ""
            Read-Host "Press Enter when you've updated .env.vercel.local with real values"
        }
        else {
            Write-Error-Custom ".env.vercel template not found"
            exit 1
        }
    }

    Write-Success "Prerequisites check passed"
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# Login and Link Project
# ═══════════════════════════════════════════════════════════

function Initialize-Vercel {
    Write-Info "Setting up Vercel connection..."

    # Check if already logged in
    try {
        $null = vercel whoami 2>&1
        Write-Success "Already logged in to Vercel"
    }
    catch {
        Write-Info "Please log in to Vercel..."
        vercel login
    }

    # Check if project is linked
    if (-not (Test-Path ".vercel/project.json")) {
        Write-Info "Linking to Vercel project..."
        vercel link
    }
    else {
        Write-Success "Project already linked"
    }

    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# Upload Environment Variables
# ═══════════════════════════════════════════════════════════

function Send-EnvironmentVariables {
    param(
        [string]$Environment
    )

    $envFile = ".env.vercel.local"
    Write-Info "Uploading environment variables to $Environment..."
    Write-Host ""

    $total = 0
    $success = 0
    $skipped = 0
    $failed = 0

    # Read .env.vercel.local and upload each variable
    $content = Get-Content $envFile -ErrorAction SilentlyContinue

    foreach ($line in $content) {
        # Skip comments and empty lines
        if ($line -match '^\s*#' -or $line -match '^\s*$') {
            continue
        }

        # Parse KEY=VALUE
        if ($line -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
            $key = $Matches[1]
            $value = $Matches[2]

            # Skip if value is a placeholder
            if ($value -match 'your-|xxx|generate-') {
                Write-Warning-Custom "Skipping $key (placeholder value detected)"
                $skipped++
                continue
            }

            # Skip empty values
            if ([string]::IsNullOrWhiteSpace($value)) {
                Write-Warning-Custom "Skipping $key (empty value)"
                $skipped++
                continue
            }

            $total++

            # Upload to Vercel
            try {
                $value | vercel env add $key $Environment --force 2>&1 | Out-Null
                Write-Success "Added $key"
                $success++
            }
            catch {
                Write-Error-Custom "Failed to add $key"
                $failed++
            }
        }
    }

    Write-Host ""
    Write-Info "Upload Summary:"
    Write-Host "  Total processed: $total"
    Write-Host "  Successfully added: $success"
    Write-Host "  Skipped (placeholders): $skipped"
    Write-Host "  Failed: $failed"
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# Interactive Mode
# ═══════════════════════════════════════════════════════════

function Start-InteractiveUpload {
    Write-Host ""
    Write-Host "Which environment do you want to upload to?"
    Write-Host "  1) Production only"
    Write-Host "  2) Preview only"
    Write-Host "  3) Development only"
    Write-Host "  4) All environments"
    Write-Host ""
    $choice = Read-Host "Enter choice (1-4)"

    switch ($choice) {
        "1" {
            Send-EnvironmentVariables -Environment "production"
        }
        "2" {
            Send-EnvironmentVariables -Environment "preview"
        }
        "3" {
            Send-EnvironmentVariables -Environment "development"
        }
        "4" {
            Send-EnvironmentVariables -Environment "production"
            Send-EnvironmentVariables -Environment "preview"
            Send-EnvironmentVariables -Environment "development"
        }
        default {
            Write-Error-Custom "Invalid choice"
            exit 1
        }
    }
}

# ═══════════════════════════════════════════════════════════
# Verify Upload
# ═══════════════════════════════════════════════════════════

function Test-Upload {
    Write-Info "Verifying uploaded environment variables..."
    Write-Host ""

    Write-Host "Production environment variables:"
    vercel env ls production

    Write-Host ""
    $deploy = Read-Host "Do you want to trigger a new deployment? (y/n)"

    if ($deploy -eq "y" -or $deploy -eq "Y") {
        Write-Info "Deploying to production..."
        vercel --prod --force
        Write-Success "Deployment triggered!"
        Write-Host ""
        Write-Info "Check deployment status at: https://vercel.com/dashboard"
    }
}

# ═══════════════════════════════════════════════════════════
# Validate Required Variables
# ═══════════════════════════════════════════════════════════

function Test-RequiredVariables {
    Write-Info "Validating required environment variables..."
    Write-Host ""

    $requiredVars = @(
        "DATABASE_URL",
        "NEXTAUTH_URL",
        "NEXTAUTH_SECRET",
        "JWT_SECRET",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "STRIPE_SECRET_KEY",
        "SENDGRID_API_KEY",
        "GOOGLE_MAPS_API_KEY",
        "ADMIN_API_KEY"
    )

    $missing = 0
    $content = Get-Content ".env.vercel.local" -ErrorAction SilentlyContinue

    foreach ($var in $requiredVars) {
        $found = $false
        $hasValue = $false

        foreach ($line in $content) {
            if ($line -match "^$var=(.+)$") {
                $found = $true
                $value = $Matches[1]

                if ($value -notmatch 'your-|xxx|generate-' -and -not [string]::IsNullOrWhiteSpace($value)) {
                    $hasValue = $true
                }
                break
            }
        }

        if ($found -and $hasValue) {
            Write-Success "Valid: $var"
        }
        else {
            Write-Error-Custom "Missing or invalid: $var"
            $missing++
        }
    }

    Write-Host ""

    if ($missing -gt 0) {
        Write-Error-Custom "$missing required variables are missing or invalid"
        Write-Host ""
        Write-Warning-Custom "Please update .env.vercel.local with actual values"
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            exit 1
        }
    }
    else {
        Write-Success "All required variables are set!"
    }

    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# Generate Secrets Helper
# ═══════════════════════════════════════════════════════════

function New-Secrets {
    Write-Info "Generating secure secrets..."
    Write-Host ""

    Write-Host "NEXTAUTH_SECRET:"
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    [Convert]::ToBase64String($bytes)
    Write-Host ""

    Write-Host "JWT_SECRET:"
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    [Convert]::ToBase64String($bytes)
    Write-Host ""

    Write-Host "ADMIN_API_KEY:"
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    [BitConverter]::ToString($bytes).Replace("-", "").ToLower()
    Write-Host ""

    Write-Host "ADMIN_SECRET_KEY:"
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    [BitConverter]::ToString($bytes).Replace("-", "").ToLower()
    Write-Host ""

    Write-Info "Copy these values to .env.vercel.local"
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# Main Menu
# ═══════════════════════════════════════════════════════════

function Show-Menu {
    while ($true) {
        Write-Host ""
        Write-Host "What would you like to do?"
        Write-Host "  1) Generate secrets (NEXTAUTH_SECRET, JWT_SECRET, etc.)"
        Write-Host "  2) Validate .env.vercel.local"
        Write-Host "  3) Upload environment variables to Vercel"
        Write-Host "  4) List current Vercel environment variables"
        Write-Host "  5) Delete all environment variables (danger!)"
        Write-Host "  6) Exit"
        Write-Host ""
        $menuChoice = Read-Host "Enter choice (1-6)"

        switch ($menuChoice) {
            "1" {
                New-Secrets
            }
            "2" {
                Test-RequiredVariables
            }
            "3" {
                Test-RequiredVariables
                Start-InteractiveUpload
                Test-Upload
            }
            "4" {
                Write-Host ""
                Write-Info "Production environment variables:"
                vercel env ls production
                Write-Host ""
                Write-Info "Preview environment variables:"
                vercel env ls preview
            }
            "5" {
                Write-Warning-Custom "This will delete ALL environment variables!"
                $confirm = Read-Host "Are you sure? Type 'DELETE' to confirm"
                if ($confirm -eq "DELETE") {
                    Write-Info "Deleting all environment variables..."
                    vercel env rm --yes
                    Write-Success "All environment variables deleted"
                }
                else {
                    Write-Info "Deletion cancelled"
                }
            }
            "6" {
                Write-Success "Goodbye!"
                exit 0
            }
            default {
                Write-Error-Custom "Invalid choice"
            }
        }
    }
}

# ═══════════════════════════════════════════════════════════
# Main Execution
# ═══════════════════════════════════════════════════════════

function Main {
    Write-Header
    Test-Prerequisites
    Initialize-Vercel
    Show-Menu
}

# Run main function
Main
