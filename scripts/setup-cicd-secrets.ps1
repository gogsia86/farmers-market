# CI/CD Secrets Setup Script for PowerShell
# This script helps you configure GitHub Secrets for CI/CD workflows

Write-Host "`n🚀 Farmers Market Platform - CI/CD Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) is not installed" -ForegroundColor Red
    Write-Host "📥 Install it from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub CLI detected" -ForegroundColor Green
Write-Host ""

# Check if user is authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔑 Please authenticate with GitHub..." -ForegroundColor Yellow
    gh auth login
}

Write-Host ""
Write-Host "📋 Setting up GitHub Secrets..." -ForegroundColor Cyan
Write-Host ""

# Function to set secret
function Set-GitHubSecret {
    param(
        [string]$SecretName,
        [string]$SecretDescription,
        [bool]$IsOptional = $false
    )

    Write-Host "🔐 $SecretName" -ForegroundColor Cyan
    Write-Host "   $SecretDescription" -ForegroundColor Gray

    if ($IsOptional) {
        $answer = Read-Host "   Do you want to set this secret? (y/n)"
        if ($answer -ne 'y') {
            Write-Host "   ⏭️  Skipped" -ForegroundColor Yellow
            Write-Host ""
            return
        }
    }

    $secretValue = Read-Host "   Enter value (input hidden)" -AsSecureString
    $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretValue)
    )

    if ($plainValue) {
        $plainValue | gh secret set $SecretName
        Write-Host "   ✅ Set successfully" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No value provided, skipped" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Required secrets
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Required Secrets" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Set-GitHubSecret -SecretName "DOCKER_USERNAME" -SecretDescription "Docker Hub username"
Set-GitHubSecret -SecretName "DOCKER_PASSWORD" -SecretDescription "Docker Hub access token (not password!)"
Set-GitHubSecret -SecretName "PRODUCTION_HOST" -SecretDescription "Production server IP address"
Set-GitHubSecret -SecretName "PRODUCTION_USER" -SecretDescription "SSH username for production server"
Set-GitHubSecret -SecretName "PRODUCTION_SSH_KEY" -SecretDescription "Private SSH key for production access"

# Optional secrets
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Optional Secrets (Staging & Notifications)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Set-GitHubSecret -SecretName "STAGING_HOST" -SecretDescription "Staging server IP address" -IsOptional $true
Set-GitHubSecret -SecretName "STAGING_USER" -SecretDescription "SSH username for staging server" -IsOptional $true
Set-GitHubSecret -SecretName "STAGING_SSH_KEY" -SecretDescription "Private SSH key for staging access" -IsOptional $true
Set-GitHubSecret -SecretName "SLACK_WEBHOOK" -SecretDescription "Slack webhook URL for notifications" -IsOptional $true
Set-GitHubSecret -SecretName "SNYK_TOKEN" -SecretDescription "Snyk API token for security scanning" -IsOptional $true

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""

$repoInfo = gh repo view --json nameWithOwner -q .nameWithOwner
Write-Host "1. Verify secrets in GitHub:" -ForegroundColor White
Write-Host "   https://github.com/$repoInfo/settings/secrets/actions" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Push code to trigger CI/CD:" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Monitor workflows:" -ForegroundColor White
Write-Host "   https://github.com/$repoInfo/actions" -ForegroundColor Gray
Write-Host ""
Write-Host "4. View documentation:" -ForegroundColor White
Write-Host "   cat docs/CI_CD_SETUP.md" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Happy deploying!" -ForegroundColor Green
