# Farmers Market Platform - Dev Server Starter
# PowerShell script to properly start and manage the Next.js dev server on Windows

Write-Host "🚀 Starting Farmers Market Dev Server..." -ForegroundColor Green

# Kill any existing processes on port 3001
Write-Host "🔍 Checking for existing processes on port 3001..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($existingProcess) {
    $pid = $existingProcess.OwningProcess
    Write-Host "🛑 Stopping existing server (PID: $pid)..." -ForegroundColor Red
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Clean up old log file
if (Test-Path "dev-server.log") {
    Remove-Item "dev-server.log" -Force
}

# Start the dev server in a new process
Write-Host "🌱 Starting new dev server..." -ForegroundColor Green

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "npm"
$processInfo.Arguments = "run dev"
$processInfo.UseShellExecute = $false
$processInfo.RedirectStandardOutput = $true
$processInfo.RedirectStandardError = $true
$processInfo.CreateNoWindow = $true
$processInfo.WorkingDirectory = $PWD

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $processInfo

# Create log file stream
$logFile = [System.IO.StreamWriter]::new("dev-server.log", $false)

# Register event handlers for output
$outputHandler = {
    if (-not [string]::IsNullOrEmpty($EventArgs.Data)) {
        $Event.MessageData.WriteLine($EventArgs.Data)
        $Event.MessageData.Flush()
    }
}

Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action $outputHandler -MessageData $logFile | Out-Null
Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action $outputHandler -MessageData $logFile | Out-Null

# Start the process
$process.Start() | Out-Null
$process.BeginOutputReadLine()
$process.BeginErrorReadLine()

$serverPid = $process.Id
Write-Host "📊 Dev server started with PID: $serverPid" -ForegroundColor Cyan

# Wait for server to be ready
Write-Host "⏳ Waiting for server to be ready..." -ForegroundColor Yellow

$maxRetries = 30
$retries = 0
$serverReady = $false

while ($retries -lt $maxRetries) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            break
        }
    }
    catch {
        # Server not ready yet, continue waiting
    }
    $retries++
    Write-Host "   Waiting... ($retries/$maxRetries)" -ForegroundColor Gray
}

if ($serverReady) {
    Write-Host ""
    Write-Host "✅ Dev server is ready!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📊 Server PID: $serverPid" -ForegroundColor Cyan
    Write-Host "🌐 Local URL: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "📝 Logs: Get-Content -Path dev-server.log -Wait" -ForegroundColor Cyan
    Write-Host "🛑 To stop: Stop-Process -Id $serverPid" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Server is running in background. Check dev-server.log for output." -ForegroundColor Yellow
    Write-Host "💡 Run tests with: npm run bot:check:dev" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Server failed to start within 60 seconds" -ForegroundColor Red
    Write-Host "📋 Last 50 lines of logs:" -ForegroundColor Yellow
    Get-Content -Path "dev-server.log" -Tail 50

    # Clean up
    if (-not $process.HasExited) {
        $process.Kill()
    }
    $logFile.Close()
    exit 1
}

# Keep the log file open in the background
# The process will continue running after this script ends
