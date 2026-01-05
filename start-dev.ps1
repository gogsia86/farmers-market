# Farmers Market Platform - Development Server Startup Script
# PowerShell Version

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Farmers Market Platform Dev Server" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if port 3001 is in use
Write-Host "Checking for running processes on port 3001..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":3001"

if ($portCheck) {
    Write-Host ""
    Write-Host "WARNING: Port 3001 is already in use!" -ForegroundColor Red
    Write-Host "The following process(es) are using port 3001:" -ForegroundColor Yellow
    Write-Host $portCheck -ForegroundColor Gray
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Close the existing process manually" -ForegroundColor White
    Write-Host "2. Use a different port: npx next dev --turbo -p 3002" -ForegroundColor White
    Write-Host ""

    $response = Read-Host "Would you like to kill the process? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "Attempting to free port 3001..." -ForegroundColor Yellow
        $portCheck | ForEach-Object {
            $pidMatch = $_ -match '\s+(\d+)$'
            if ($pidMatch) {
                $pid = $Matches[1]
                Write-Host "Killing process with PID: $pid" -ForegroundColor Yellow
                taskkill /PID $pid /F 2>$null
            }
        }
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Exiting. Please free port 3001 manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Port 3001 is available." -ForegroundColor Green
Write-Host ""

# Display server information
Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
Write-Host "- Framework: Next.js 16.1.1 (Turbopack)" -ForegroundColor White
Write-Host "- Port: 3001" -ForegroundColor White
Write-Host "- Memory: 16GB allocated" -ForegroundColor White
Write-Host "- Hot Module Replacement: Enabled" -ForegroundColor White
Write-Host "- Fast Refresh: Enabled" -ForegroundColor White
Write-Host ""

Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  Local:   http://localhost:3001" -ForegroundColor Green
Write-Host "  Network: Check terminal output below" -ForegroundColor Green
Write-Host ""

Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the development server
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Server stopped with error!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server stopped gracefully." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
