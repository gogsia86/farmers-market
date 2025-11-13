Write-Host '🌾 Setting up Vercel Environment Variables...' -ForegroundColor Cyan
Write-Host ''

# Generate a secure NEXTAUTH_SECRET
$nextAuthSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host '📝 Generated secure NEXTAUTH_SECRET' -ForegroundColor Green
Write-Host ''

Write-Host '⚙️  Setting environment variables in Vercel...' -ForegroundColor Yellow
Write-Host ''

# Set NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production --force 2>&1 | Out-Null
Write-Host $nextAuthSecret | vercel env add NEXTAUTH_SECRET production 2>&1

# Set NEXTAUTH_URL (production)
Write-Host 'https://farmersmarket.vercel.app' | vercel env add NEXTAUTH_URL production 2>&1

# Set NEXT_PUBLIC_APP_URL
Write-Host 'https://farmersmarket.vercel.app' | vercel env add NEXT_PUBLIC_APP_URL production 2>&1

# Set SKIP_ENV_VALIDATION
Write-Host '1' | vercel env add SKIP_ENV_VALIDATION production 2>&1

# Set NODE_ENV
Write-Host 'production' | vercel env add NODE_ENV production 2>&1

Write-Host ''
Write-Host '✅ Basic environment variables configured!' -ForegroundColor Green
Write-Host ''
Write-Host '📋 Next Steps:' -ForegroundColor Cyan
Write-Host '1. Set DATABASE_URL in Vercel dashboard (requires production database)'
Write-Host '2. Set STRIPE keys if payment processing is needed'
Write-Host '3. Set SENTRY_DSN if error tracking is needed'
Write-Host ''
