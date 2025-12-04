# Farmers Market Platform - Full Stack Startup Script
# Starting Backend API + Mobile App

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Farmers Market Platform - Full Stack Startup Script" -ForegroundColor Cyan
Write-Host "  Starting Backend API + Mobile App" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Not in the correct directory!" -ForegroundColor Red
    Write-Host "Please run this script from: M:\Repo\Farmers Market Platform web and app" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/6] Cleaning up any existing processes..." -ForegroundColor Yellow
Write-Host ""

# Function to kill process on a specific port
function Stop-ProcessOnPort {
    param($Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  Stopping process $($process.ProcessName) (PID: $($process.Id)) on port $Port" -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# Kill any processes on port 3000 (backend)
Stop-ProcessOnPort -Port 3000

# Kill any processes on port 8081 (Metro bundler)
Stop-ProcessOnPort -Port 8081

Write-Host "Ports cleaned up!" -ForegroundColor Green
Write-Host ""

Write-Host "[2/6] Checking backend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "Backend dependencies already installed." -ForegroundColor Green
}
Write-Host ""

Write-Host "[3/6] Checking mobile app dependencies..." -ForegroundColor Yellow
Push-Location mobile-app
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing mobile app dependencies..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "Mobile app dependencies already installed." -ForegroundColor Green
}
Pop-Location
Write-Host ""

Write-Host "[4/6] Starting Backend API Server..." -ForegroundColor Yellow
Write-Host "Opening new window for backend..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Backend API Server' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 3
Write-Host "Backend API started on http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "[5/6] Starting Mobile App (Expo)..." -ForegroundColor Yellow
Write-Host "Opening new window for Expo Metro bundler..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\mobile-app'; Write-Host 'Mobile App - Expo Dev Server' -ForegroundColor Green; npx expo start --clear"
Start-Sleep -Seconds 3
Write-Host "Mobile app Metro bundler starting..." -ForegroundColor Green
Write-Host ""

Write-Host "[6/6] Startup Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend API:     http://localhost:3000" -ForegroundColor White
Write-Host "  Mobile Metro:    exp://127.0.0.1:8081" -ForegroundColor White
Write-Host ""
Write-Host "  Two PowerShell windows have been opened:" -ForegroundColor Yellow
Write-Host "  1. Backend API Server (port 3000)" -ForegroundColor Gray
Write-Host "  2. Mobile App Expo Dev Server (port 8081)" -ForegroundColor Gray
Write-Host ""
Write-Host "  To run the mobile app:" -ForegroundColor Yellow
Write-Host "  - Press 'w' in the Expo window for web browser" -ForegroundColor Gray
Write-Host "  - Press 'a' in the Expo window for Android (requires Android Studio)" -ForegroundColor Gray
Write-Host "  - Scan QR code with Expo Go app on your phone" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window (servers will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
