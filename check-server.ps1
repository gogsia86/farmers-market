# Check if server is running on port 3001
$maxAttempts = 12
$attempt = 0
$serverReady = $false

Write-Host "Checking if dev server is ready on http://localhost:3001"
Write-Host "This may take up to 60 seconds..."
Write-Host ""

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    $attempt++
    Write-Host "Attempt $attempt/$maxAttempts - Checking server..."

    Start-Sleep -Seconds 5

    try {
        $response = Invoke-WebRequest -Uri 'http://localhost:3001' -UseBasicParsing -TimeoutSec 3
        Write-Host "✅ Server is UP! Status: $($response.StatusCode)" -ForegroundColor Green
        $serverReady = $true
    } catch {
        Write-Host "⏳ Server not ready yet..." -ForegroundColor Yellow
    }
}

Write-Host ""

if ($serverReady) {
    Write-Host "🎉 Server is ready for monitoring!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️ Server did not start within timeout" -ForegroundColor Red
    Write-Host "You may need to start it manually with: npm run dev"
    exit 1
}
