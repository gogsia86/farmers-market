# ============================================
# VERCEL ENVIRONMENT VARIABLES SETUP SCRIPT
# Farmers Market Platform
# ============================================

param(
  [Parameter(Mandatory = $false)]
  [string]$Environment = "production",

  [Parameter(Mandatory = $false)]
  [switch]$Interactive = $false
)

Write-Host "🚀 Vercel Environment Variables Setup" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
  npm install -g vercel
}

Write-Host "✅ Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Generate NEXTAUTH_SECRET if needed
Write-Host "🔐 Generating NEXTAUTH_SECRET..." -ForegroundColor Cyan
$nextAuthSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "Generated: $nextAuthSecret" -ForegroundColor Green
Write-Host ""

# Function to add environment variable
function Add-VercelEnv {
  param(
    [string]$Name,
    [string]$Value,
    [string]$Env = "production"
  )

  Write-Host "Adding $Name to $Env environment..." -ForegroundColor Cyan

  # Use vercel env add command
  $Value | vercel env add $Name $Env --force 2>&1 | Out-Null

  if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ $Name added successfully" -ForegroundColor Green
  }
  else {
    Write-Host "  ⚠️  $Name - check manually" -ForegroundColor Yellow
  }
}

if ($Interactive) {
  Write-Host "📝 Interactive Setup - Please provide the following:" -ForegroundColor Cyan
  Write-Host ""

  # Database URL
  Write-Host "1. DATABASE_URL (PostgreSQL connection string):" -ForegroundColor Yellow
  Write-Host "   Example: postgresql://user:pass@host:5432/dbname" -ForegroundColor Gray
  $dbUrl = Read-Host "   Enter DATABASE_URL"

  # NextAuth URL
  Write-Host ""
  Write-Host "2. NEXTAUTH_URL (Your Vercel app URL):" -ForegroundColor Yellow
  Write-Host "   Example: https://farmersmarket.vercel.app" -ForegroundColor Gray
  $nextAuthUrl = Read-Host "   Enter NEXTAUTH_URL"

  # Confirm generated secret
  Write-Host ""
  Write-Host "3. NEXTAUTH_SECRET (Auto-generated):" -ForegroundColor Yellow
  Write-Host "   $nextAuthSecret" -ForegroundColor Gray
  $useGeneratedSecret = Read-Host "   Use this secret? (Y/n)"

  if ($useGeneratedSecret -eq "n") {
    $nextAuthSecret = Read-Host "   Enter your NEXTAUTH_SECRET"
  }

  # App URL
  Write-Host ""
  Write-Host "4. NEXT_PUBLIC_APP_URL (Same as NEXTAUTH_URL):" -ForegroundColor Yellow
  $appUrl = Read-Host "   Enter NEXT_PUBLIC_APP_URL (press Enter to use $nextAuthUrl)"
  if ([string]::IsNullOrWhiteSpace($appUrl)) {
    $appUrl = $nextAuthUrl
  }

  # Optional: Email configuration
  Write-Host ""
  Write-Host "5. Email Configuration (Optional - press Enter to skip):" -ForegroundColor Yellow
  $smtpHost = Read-Host "   SMTP_HOST (e.g., smtp.gmail.com)"

  if (-not [string]::IsNullOrWhiteSpace($smtpHost)) {
    $smtpPort = Read-Host "   SMTP_PORT (587 for TLS)"
    $smtpUser = Read-Host "   SMTP_USER (your email)"
    $smtpPassword = Read-Host "   SMTP_PASSWORD (app password)" -AsSecureString
    $smtpPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
      [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($smtpPassword)
    )
    $smtpFrom = Read-Host "   SMTP_FROM (noreply@yourapp.com)"
  }

  # Optional: Stripe
  Write-Host ""
  Write-Host "6. Stripe Configuration (Optional - press Enter to skip):" -ForegroundColor Yellow
  $stripePublishable = Read-Host "   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"

  if (-not [string]::IsNullOrWhiteSpace($stripePublishable)) {
    $stripeSecret = Read-Host "   STRIPE_SECRET_KEY"
    $stripeWebhook = Read-Host "   STRIPE_WEBHOOK_SECRET"
  }

  Write-Host ""
  Write-Host "📤 Adding environment variables to Vercel..." -ForegroundColor Cyan
  Write-Host ""

  # Add required variables
  Add-VercelEnv "DATABASE_URL" $dbUrl $Environment
  Add-VercelEnv "NEXTAUTH_URL" $nextAuthUrl $Environment
  Add-VercelEnv "NEXTAUTH_SECRET" $nextAuthSecret $Environment
  Add-VercelEnv "NEXT_PUBLIC_APP_URL" $appUrl $Environment
  Add-VercelEnv "NEXT_PUBLIC_API_URL" "$appUrl/api" $Environment
  Add-VercelEnv "SKIP_ENV_VALIDATION" "1" $Environment
  Add-VercelEnv "NODE_ENV" "production" $Environment

  # Add email if provided
  if (-not [string]::IsNullOrWhiteSpace($smtpHost)) {
    Add-VercelEnv "SMTP_HOST" $smtpHost $Environment
    Add-VercelEnv "SMTP_PORT" $smtpPort $Environment
    Add-VercelEnv "SMTP_USER" $smtpUser $Environment
    Add-VercelEnv "SMTP_PASSWORD" $smtpPasswordPlain $Environment
    Add-VercelEnv "SMTP_FROM" $smtpFrom $Environment
    Add-VercelEnv "SMTP_SECURE" "false" $Environment
  }

  # Add Stripe if provided
  if (-not [string]::IsNullOrWhiteSpace($stripePublishable)) {
    Add-VercelEnv "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" $stripePublishable $Environment
    Add-VercelEnv "STRIPE_SECRET_KEY" $stripeSecret $Environment
    Add-VercelEnv "STRIPE_WEBHOOK_SECRET" $stripeWebhook $Environment
  }

}
else {
  Write-Host "📋 Manual Setup Instructions:" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Add these environment variables in Vercel Dashboard:" -ForegroundColor Yellow
  Write-Host "https://vercel.com/medicis-projects/farmers_market/settings/environment-variables" -ForegroundColor Blue
  Write-Host ""

  Write-Host "REQUIRED VARIABLES:" -ForegroundColor Yellow
  Write-Host "===================" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "1. DATABASE_URL" -ForegroundColor Cyan
  Write-Host "   Value: postgresql://username:password@host:5432/database" -ForegroundColor Gray
  Write-Host ""

  Write-Host "2. NEXTAUTH_URL" -ForegroundColor Cyan
  Write-Host "   Value: https://your-app.vercel.app" -ForegroundColor Gray
  Write-Host ""

  Write-Host "3. NEXTAUTH_SECRET" -ForegroundColor Cyan
  Write-Host "   Value: $nextAuthSecret" -ForegroundColor Green
  Write-Host "   (Copy this generated secret)" -ForegroundColor Gray
  Write-Host ""

  Write-Host "4. NEXT_PUBLIC_APP_URL" -ForegroundColor Cyan
  Write-Host "   Value: https://your-app.vercel.app" -ForegroundColor Gray
  Write-Host ""

  Write-Host "5. NEXT_PUBLIC_API_URL" -ForegroundColor Cyan
  Write-Host "   Value: https://your-app.vercel.app/api" -ForegroundColor Gray
  Write-Host ""

  Write-Host "6. SKIP_ENV_VALIDATION" -ForegroundColor Cyan
  Write-Host "   Value: 1" -ForegroundColor Gray
  Write-Host ""

  Write-Host "7. NODE_ENV" -ForegroundColor Cyan
  Write-Host "   Value: production" -ForegroundColor Gray
  Write-Host ""

  Write-Host "OPTIONAL VARIABLES:" -ForegroundColor Yellow
  Write-Host "==================" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Email Configuration:" -ForegroundColor Cyan
  Write-Host "  SMTP_HOST=smtp.gmail.com" -ForegroundColor Gray
  Write-Host "  SMTP_PORT=587" -ForegroundColor Gray
  Write-Host "  SMTP_SECURE=false" -ForegroundColor Gray
  Write-Host "  SMTP_USER=your-email@gmail.com" -ForegroundColor Gray
  Write-Host "  SMTP_PASSWORD=your-app-password" -ForegroundColor Gray
  Write-Host "  SMTP_FROM=noreply@farmersmarket.app" -ForegroundColor Gray
  Write-Host ""

  Write-Host "Stripe Configuration:" -ForegroundColor Cyan
  Write-Host "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..." -ForegroundColor Gray
  Write-Host "  STRIPE_SECRET_KEY=sk_test_..." -ForegroundColor Gray
  Write-Host "  STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Gray
  Write-Host ""
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify variables in Vercel Dashboard" -ForegroundColor White
Write-Host "2. Redeploy your application:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host "3. Run database migrations:" -ForegroundColor White
Write-Host "   npx prisma migrate deploy" -ForegroundColor Gray
Write-Host "4. Test your deployment:" -ForegroundColor White
Write-Host "   https://your-app.vercel.app/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Full documentation: VERCEL_ENVIRONMENT_SETUP.md" -ForegroundColor Cyan
Write-Host ""

# Save generated secret to file
$secretFile = "nextauth-secret.txt"
$nextAuthSecret | Out-File -FilePath $secretFile -Encoding UTF8
Write-Host "🔐 NEXTAUTH_SECRET saved to: $secretFile" -ForegroundColor Green
Write-Host "⚠️  Keep this file secure and don't commit it to Git!" -ForegroundColor Yellow
