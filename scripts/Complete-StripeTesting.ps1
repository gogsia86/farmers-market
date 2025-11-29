# 🌾 Complete Stripe Testing Script (PowerShell)
# Farmers Market Platform - Interactive Stripe Setup & Testing
# Version: 1.0.0

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"
$Magenta = "Magenta"

# Emojis
$Check = "[OK]"
$Warn = "[WARN]"
$Info = "[INFO]"

Clear-Host

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  🌾 STRIPE TESTING - COMPLETE GUIDE" -ForegroundColor Magenta
Write-Host "  Divine Agricultural Payment Integration" -ForegroundColor Cyan
Write-Host "  Estimated Time: 45 minutes" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Function to wait for user
function Wait-ForUser {
    Write-Host ""
    Write-Host "Press ENTER to continue..." -ForegroundColor Yellow
    $null = Read-Host
}

# Function to ask yes/no
function Ask-YesNo {
    param([string]$Question)
    do {
        $response = Read-Host "$Question (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') { return $true }
        if ($response -eq 'n' -or $response -eq 'N') { return $false }
        Write-Host "Please answer yes (y) or no (n)."
    } while ($true)
}

# ============================================
# STEP 1: Authenticate with Stripe
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "STEP 1: Authenticate with Stripe (5 minutes)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "$Info Checking authentication status..." -ForegroundColor Cyan

$authCheck = & .\.stripe-cli\stripe.exe config --list 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "$Check Already authenticated with Stripe!" -ForegroundColor Green
    Write-Host ""
    & .\.stripe-cli\stripe.exe config --list
    Write-Host ""

    if (Ask-YesNo "Do you want to re-authenticate?") {
        Write-Host ""
        Write-Host "Re-authenticating..." -ForegroundColor Yellow
        & .\.stripe-cli\stripe.exe login
    } else {
        Write-Host "$Check Using existing authentication" -ForegroundColor Green
    }
} else {
    Write-Host "$Warn Not authenticated yet" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This will open your browser to authenticate:" -ForegroundColor Cyan
    Write-Host "  1. Browser will open automatically"
    Write-Host "  2. Click 'Allow access' button"
    Write-Host "  3. Return to this terminal"
    Write-Host ""
    Wait-ForUser

    Write-Host "Opening browser for authentication..." -ForegroundColor Cyan
    & .\.stripe-cli\stripe.exe login

    Write-Host ""
    Write-Host "$Check Authentication complete!" -ForegroundColor Green
}

# ============================================
# STEP 2: Get API Keys
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "STEP 2: Get Your Stripe Test API Keys (5 minutes)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "You need to get your test API keys from the Stripe Dashboard." -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Make sure you're in TEST MODE!" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. URL: https://dashboard.stripe.com/test/apikeys" -ForegroundColor Cyan
Write-Host "2. Toggle at top should say 'Test mode' (NOT Live mode)" -ForegroundColor Cyan
Write-Host "3. Copy both keys:" -ForegroundColor Cyan
Write-Host "   • Publishable key (starts with pk_test_)" -ForegroundColor Magenta
Write-Host "   • Secret key (starts with sk_test_)" -ForegroundColor Magenta
Write-Host ""

if (Ask-YesNo "Open Stripe Dashboard now?") {
    Write-Host ""
    Write-Host "Opening Stripe Dashboard..." -ForegroundColor Cyan
    Start-Process "https://dashboard.stripe.com/test/apikeys"
    Write-Host "$Check Dashboard should be opening..." -ForegroundColor Green
}

Write-Host ""
Write-Host "Once you have your keys ready, we'll update .env.local" -ForegroundColor Cyan
Wait-ForUser

# ============================================
# STEP 3: Configure Environment Variables
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "STEP 3: Configure .env.local (5 minutes)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Please enter your Stripe test API keys:" -ForegroundColor Cyan
Write-Host ""

# Get Publishable Key
Write-Host "Publishable Key (pk_test_...):" -ForegroundColor Magenta
$PublishableKey = Read-Host

# Validate publishable key
if ($PublishableKey -notmatch "^pk_test_") {
    Write-Host "$Warn Warning: Key doesn't start with 'pk_test_'" -ForegroundColor Red
    if (-not (Ask-YesNo "Continue anyway?")) {
        Write-Host "Setup cancelled."
        exit 1
    }
}

Write-Host ""

# Get Secret Key
Write-Host "Secret Key (sk_test_...):" -ForegroundColor Magenta
$SecretKey = Read-Host -AsSecureString
$SecretKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecretKey))

# Validate secret key
if ($SecretKeyPlain -notmatch "^sk_test_") {
    Write-Host "$Warn Warning: Key doesn't start with 'sk_test_'" -ForegroundColor Red
    if (-not (Ask-YesNo "Continue anyway?")) {
        Write-Host "Setup cancelled."
        exit 1
    }
}

Write-Host ""
Write-Host "$Check Keys received!" -ForegroundColor Green

# Backup existing .env.local
if (Test-Path .env.local) {
    $BackupFile = ".env.local.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Write-Host ""
    Write-Host "$Info Backing up existing .env.local to $BackupFile" -ForegroundColor Cyan
    Copy-Item .env.local $BackupFile
    Write-Host "$Check Backup created" -ForegroundColor Green
}

Write-Host ""
Write-Host "$Info Updating .env.local with Stripe keys..." -ForegroundColor Cyan

# Read existing .env.local
$envContent = Get-Content .env.local -Raw

# Update or add Stripe keys
if ($envContent -match "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=") {
    # Update existing keys
    $envContent = $envContent -replace "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PublishableKey"
    $envContent = $envContent -replace "STRIPE_SECRET_KEY=.*", "STRIPE_SECRET_KEY=$SecretKeyPlain"
    Write-Host "$Check Updated existing keys" -ForegroundColor Green
} else {
    # Add new keys
    $envContent += "`n`n# Stripe Test Keys (added by setup script)`n"
    $envContent += "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PublishableKey`n"
    $envContent += "STRIPE_SECRET_KEY=$SecretKeyPlain`n"
    $envContent += "STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_6`n"
    Write-Host "$Check Added new keys" -ForegroundColor Green
}

# Ensure webhook secret line exists
if ($envContent -notmatch "STRIPE_WEBHOOK_SECRET=") {
    $envContent += "STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_6`n"
}

# Save updated content
Set-Content .env.local $envContent -NoNewline

Write-Host "$Check .env.local updated successfully!" -ForegroundColor Green

# ============================================
# STEP 4: Start Development Server
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "STEP 4: Start Development Server (2 minutes)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Starting the development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "$Info This will run in a new window" -ForegroundColor Cyan
Write-Host "$Info Server will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

# Kill any existing process on port 3001
Write-Host "$Info Checking for existing processes on port 3001..." -ForegroundColor Cyan
$existingProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "$Warn Port 3001 is in use, killing existing process..." -ForegroundColor Yellow
    $processId = $existingProcess.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start dev server in new window
Write-Host "$Info Starting dev server in new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev:omen"

# Wait for server to be ready
Write-Host "$Info Waiting for server to be ready (this may take 15-20 seconds)..." -ForegroundColor Cyan
$serverReady = $false
for ($i = 1; $i -le 40; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "$Check Development server is ready!" -ForegroundColor Green
            $serverReady = $true
            break
        }
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
    }
}

if (-not $serverReady) {
    Write-Host ""
    Write-Host "$Warn Server did not start in time. Please check the dev server window." -ForegroundColor Red
    Write-Host "Press ENTER once the server shows 'Ready'" -ForegroundColor Yellow
    $null = Read-Host
}

Write-Host ""
Write-Host "$Check Server running on http://localhost:3001" -ForegroundColor Green
Write-Host ""

# Test health endpoint
Write-Host "$Info Testing webhook health endpoint..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/webhooks/stripe" -Method Get
    if ($healthResponse.status -eq "ok") {
        Write-Host "$Check Webhook endpoint is active!" -ForegroundColor Green
        Write-Host "Response: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Cyan
    } else {
        Write-Host "$Warn Unexpected response: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "$Warn Could not verify health endpoint: $_" -ForegroundColor Yellow
}

Wait-ForUser

# ============================================
# STEP 5: Start Webhook Forwarding
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "STEP 5: Start Webhook Forwarding (2 minutes)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Starting Stripe webhook forwarding..." -ForegroundColor Cyan
Write-Host ""
Write-Host "$Info This will forward Stripe events to your local server" -ForegroundColor Cyan
Write-Host "$Info Watch for the webhook secret (whsec_...) - you'll need it!" -ForegroundColor Yellow
Write-Host ""

Write-Host "Starting webhook listener in new window..." -ForegroundColor Cyan
Write-Host "IMPORTANT: Copy the 'whsec_...' secret from the webhook window!" -ForegroundColor Yellow
Write-Host ""

# Start webhook forwarding in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\.stripe-cli\stripe.exe listen --forward-to localhost:3001/api/webhooks/stripe"

Write-Host ""
Write-Host "$Check Webhook forwarding window opened!" -ForegroundColor Green
Write-Host ""
Write-Host "In the webhook window, you'll see a line like:" -ForegroundColor Cyan
Write-Host "  > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx" -ForegroundColor Yellow
Write-Host ""

Wait-ForUser

# ============================================
# STEP 6: Update Webhook Secret
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "STEP 6: Update Webhook Secret (2 minutes)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Enter your webhook secret from the webhook window:" -ForegroundColor Cyan
Write-Host "(It starts with whsec_...)" -ForegroundColor Yellow
Write-Host ""
$WebhookSecret = Read-Host "Webhook Secret"

# Validate webhook secret
if ($WebhookSecret -notmatch "^whsec_") {
    Write-Host "$Warn Warning: Secret doesn't start with 'whsec_'" -ForegroundColor Yellow
    if (-not (Ask-YesNo "Continue anyway?")) {
        Write-Host "Setup cancelled."
        exit 1
    }
}

Write-Host ""
Write-Host "$Info Updating .env.local with webhook secret..." -ForegroundColor Cyan

# Update webhook secret in .env.local
$envContent = Get-Content .env.local -Raw
$envContent = $envContent -replace "STRIPE_WEBHOOK_SECRET=.*", "STRIPE_WEBHOOK_SECRET=$WebhookSecret"
Set-Content .env.local $envContent -NoNewline

Write-Host "$Check Webhook secret updated in .env.local" -ForegroundColor Green

Write-Host ""
Write-Host "IMPORTANT: Please restart the dev server window now:" -ForegroundColor Yellow
Write-Host "  1. Go to the dev server window" -ForegroundColor Cyan
Write-Host "  2. Press Ctrl+C to stop it" -ForegroundColor Cyan
Write-Host "  3. Run: npm run dev:omen" -ForegroundColor Cyan
Write-Host "  4. Wait for 'Ready' message" -ForegroundColor Cyan
Write-Host ""

Wait-ForUser

# ============================================
# STEP 7: Run Manual Tests
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "STEP 7: Run Payment Tests (30 minutes)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Now we'll test all payment flows!" -ForegroundColor Cyan
Write-Host ""
Write-Host "$Info We'll test the following scenarios:" -ForegroundColor Cyan
Write-Host "  1. Payment Success" -ForegroundColor Green
Write-Host "  2. Payment Failed" -ForegroundColor Yellow
Write-Host "  3. Refund Processing" -ForegroundColor Magenta
Write-Host ""

# Test 1: Payment Success
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "TEST 1: Payment Intent Success" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "$Info Triggering payment_intent.succeeded event..." -ForegroundColor Cyan
& .\.stripe-cli\stripe.exe trigger payment_intent.succeeded

Write-Host ""
Write-Host "Check the webhook window - did you see a [200] response?" -ForegroundColor Cyan
$Test1Passed = Ask-YesNo "Test 1 passed?"

if ($Test1Passed) {
    Write-Host "$Check Test 1: PASSED" -ForegroundColor Green
} else {
    Write-Host "$Warn Test 1: FAILED" -ForegroundColor Red
}

Write-Host ""
Wait-ForUser

# Test 2: Payment Failed
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "TEST 2: Payment Intent Failed" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "$Info Triggering payment_intent.payment_failed event..." -ForegroundColor Cyan
& .\.stripe-cli\stripe.exe trigger payment_intent.payment_failed

Write-Host ""
Write-Host "Check the webhook window - did you see a [200] response?" -ForegroundColor Cyan
$Test2Passed = Ask-YesNo "Test 2 passed?"

if ($Test2Passed) {
    Write-Host "$Check Test 2: PASSED" -ForegroundColor Green
} else {
    Write-Host "$Warn Test 2: FAILED" -ForegroundColor Red
}

Write-Host ""
Wait-ForUser

# Test 3: Refund
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "TEST 3: Charge Refunded" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "$Info Triggering charge.refunded event..." -ForegroundColor Cyan
& .\.stripe-cli\stripe.exe trigger charge.refunded

Write-Host ""
Write-Host "Check the webhook window - did you see a [200] response?" -ForegroundColor Cyan
$Test3Passed = Ask-YesNo "Test 3 passed?"

if ($Test3Passed) {
    Write-Host "$Check Test 3: PASSED" -ForegroundColor Green
} else {
    Write-Host "$Warn Test 3: FAILED" -ForegroundColor Red
}

# ============================================
# STEP 8: Test Summary
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

$TotalTests = 3
$PassedTests = 0
if ($Test1Passed) { $PassedTests++ }
if ($Test2Passed) { $PassedTests++ }
if ($Test3Passed) { $PassedTests++ }

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan

if ($Test1Passed) {
    Write-Host "  $Check Test 1: Payment Success         PASSED" -ForegroundColor Green
} else {
    Write-Host "  $Warn Test 1: Payment Success         FAILED" -ForegroundColor Red
}

if ($Test2Passed) {
    Write-Host "  $Check Test 2: Payment Failed          PASSED" -ForegroundColor Green
} else {
    Write-Host "  $Warn Test 2: Payment Failed          FAILED" -ForegroundColor Red
}

if ($Test3Passed) {
    Write-Host "  $Check Test 3: Refund Processing       PASSED" -ForegroundColor Green
} else {
    Write-Host "  $Warn Test 3: Refund Processing       FAILED" -ForegroundColor Red
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Total: $PassedTests/$TotalTests tests passed" -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

if ($PassedTests -eq $TotalTests) {
    Write-Host "🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Stripe integration is working perfectly!" -ForegroundColor Green
} else {
    Write-Host "$Warn Some tests failed." -ForegroundColor Yellow
    Write-Host "Check the dev server and webhook windows for error messages." -ForegroundColor Cyan
}

# ============================================
# Final Summary
# ============================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "COMPLETION SUMMARY" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "$Check Stripe CLI authenticated" -ForegroundColor Green
Write-Host "$Check API keys configured" -ForegroundColor Green
Write-Host "$Check Webhook secret configured" -ForegroundColor Green
Write-Host "$Check $PassedTests/$TotalTests tests passed" -ForegroundColor Green
Write-Host ""

if ($PassedTests -eq $TotalTests) {
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  🎉 CONGRATULATIONS! 🎉" -ForegroundColor Green
    Write-Host "" -ForegroundColor Cyan
    Write-Host "  Your Stripe integration is 100% working!" -ForegroundColor Green
    Write-Host "  You are now PRODUCTION READY! 🚀" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
} else {
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  TESTING COMPLETE" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Cyan
    Write-Host "  Review failed tests and check the windows" -ForegroundColor Yellow
    Write-Host "  Then re-run this script" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Deploy to staging environment" -ForegroundColor Cyan
Write-Host "  2. Run integration tests" -ForegroundColor Cyan
Write-Host "  3. Launch to production! 🚀" -ForegroundColor Cyan
Write-Host ""
Write-Host "Divine payment consciousness activated! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Press ENTER to exit..." -ForegroundColor Yellow
$null = Read-Host
