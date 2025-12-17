# ============================================
# 🚀 FARMERS MARKET PLATFORM - PRODUCTION START SCRIPT
# ============================================
# Version: 3.0
# Last Updated: 2025-01-XX
# Description: Start production application with proper configuration
# Platform: Windows PowerShell
# ============================================

# Requires PowerShell 5.1 or higher
#Requires -Version 5.1

# Error handling
$ErrorActionPreference = "Stop"

# Configuration
$ENV_FILE = ".env.production"
$LOG_DIR = "logs"
$PID_FILE = "$LOG_DIR\app.pid"

# Colors for output
function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                                                            ║" -ForegroundColor Magenta
    Write-Host "║  🌾 FARMERS MARKET PLATFORM - PRODUCTION SERVER 🚀        ║" -ForegroundColor Magenta
    Write-Host "║                                                            ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
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
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check if production build exists
function Test-Build {
    if (-not (Test-Path ".next")) {
        Write-Error-Custom "Production build not found!"
        Write-Info "Please run: npm run build"
        exit 1
    }
    Write-Success "Production build verified"
}

# Check environment file
function Test-Environment {
    $script:ENV_FILE = ".env.production"

    if (-not (Test-Path $ENV_FILE)) {
        Write-Warning-Custom "Production environment file not found: $ENV_FILE"
        Write-Info "Looking for alternative environment files..."

        if (Test-Path ".env.local") {
            $script:ENV_FILE = ".env.local"
            Write-Info "Using .env.local"
        }
        elseif (Test-Path ".env") {
            $script:ENV_FILE = ".env"
            Write-Info "Using .env"
        }
        else {
            Write-Error-Custom "No environment file found!"
            Write-Info "Please run: .\setup-production.ps1"
            exit 1
        }
    }
    Write-Success "Environment file found: $ENV_FILE"
}

# Load environment variables
function Import-Environment {
    Write-Info "Loading environment variables..."

    Get-Content $ENV_FILE | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }

    $env:NODE_ENV = "production"
    Write-Success "Environment variables loaded"
}

# Check database connection
function Test-Database {
    Write-Info "Checking database connection..."
    try {
        npx prisma db pull --force 2>&1 | Out-Null
        Write-Success "Database connection successful"
    }
    catch {
        Write-Warning-Custom "Database connection check failed"
        Write-Info "The application will attempt to connect anyway"
    }
}

# Create log directory
function Initialize-Logs {
    if (-not (Test-Path $LOG_DIR)) {
        New-Item -ItemType Directory -Path $LOG_DIR | Out-Null
    }
    Write-Success "Log directory ready: $LOG_DIR"
}

# Check if server is already running
function Test-Running {
    if (Test-Path $PID_FILE) {
        $oldPid = Get-Content $PID_FILE
        $process = Get-Process -Id $oldPid -ErrorAction SilentlyContinue

        if ($process) {
            Write-Warning-Custom "Server is already running (PID: $oldPid)"
            Write-Host ""
            $response = Read-Host "Do you want to restart it? (y/N)"

            if ($response -eq "y" -or $response -eq "Y") {
                Write-Info "Stopping existing server..."
                Stop-Process -Id $oldPid -Force
                Start-Sleep -Seconds 2
                Remove-Item $PID_FILE -Force
                Write-Success "Existing server stopped"
            }
            else {
                Write-Info "Keeping existing server running"
                exit 0
            }
        }
        else {
            # PID file exists but process is not running
            Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
        }
    }
}

# Detect hardware profile
function Get-HardwareProfile {
    # Get total system memory in GB
    $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem
    $totalMemGB = [math]::Round($computerSystem.TotalPhysicalMemory / 1GB)

    # Get CPU cores
    $processor = Get-CimInstance -ClassName Win32_Processor
    $cpuCores = $processor.NumberOfLogicalProcessors

    # Determine optimal settings
    if ($totalMemGB -ge 32 -and $cpuCores -ge 8) {
        # High-end system (HP OMEN profile)
        $nodeOptions = "--max-old-space-size=16384"
        $profile = "OMEN"
    }
    elseif ($totalMemGB -ge 8) {
        # Standard system
        $nodeOptions = "--max-old-space-size=4096"
        $profile = "STANDARD"
    }
    else {
        # Low-end system
        $nodeOptions = "--max-old-space-size=2048"
        $profile = "MINIMAL"
    }

    Write-Info "Detected hardware profile: $profile"
    Write-Info "System resources: ${totalMemGB}GB RAM, ${cpuCores} CPU cores"
    Write-Info "Node.js options: $nodeOptions"

    return $nodeOptions
}

# Start server
function Start-ProductionServer {
    param([string]$Mode)

    Write-Info "Starting production server..."
    Write-Host ""

    # Detect optimal settings
    $nodeOptions = Get-HardwareProfile

    # Export Node options
    $env:NODE_OPTIONS = $nodeOptions

    # Start server based on mode
    switch ($Mode) {
        "foreground" {
            # Foreground mode - useful for debugging
            Write-Info "Running in FOREGROUND mode (Ctrl+C to stop)"
            Write-Host ""
            npm run start
        }
        "daemon" {
            # Daemon mode with PM2
            if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
                Write-Error-Custom "PM2 is not installed!"
                Write-Info "Install with: npm install -g pm2"
                Write-Info "Or run in foreground mode: .\start-production.ps1 foreground"
                exit 1
            }

            Write-Info "Starting with PM2 process manager..."
            pm2 start npm --name "farmers-market" -- run start
            pm2 save

            Write-Success "Server started with PM2!"
            Write-Host ""
            Write-Info "Useful PM2 commands:"
            Write-Host "  - View logs:    pm2 logs farmers-market"
            Write-Host "  - Monitor:      pm2 monit"
            Write-Host "  - Restart:      pm2 restart farmers-market"
            Write-Host "  - Stop:         pm2 stop farmers-market"
            Write-Host "  - Dashboard:    pm2 plus"
        }
        default {
            # Background mode (default)
            Write-Info "Running in BACKGROUND mode"

            # Start npm in a new process
            $processInfo = New-Object System.Diagnostics.ProcessStartInfo
            $processInfo.FileName = "npm"
            $processInfo.Arguments = "run start"
            $processInfo.UseShellExecute = $false
            $processInfo.RedirectStandardOutput = $true
            $processInfo.RedirectStandardError = $true
            $processInfo.CreateNoWindow = $true

            $process = New-Object System.Diagnostics.Process
            $process.StartInfo = $processInfo

            # Redirect output to log file
            $logFile = "$LOG_DIR\app.log"
            $process.OutputDataReceived.Add({
                param($sender, $e)
                if ($e.Data) {
                    Add-Content -Path $logFile -Value $e.Data
                }
            })
            $process.ErrorDataReceived.Add({
                param($sender, $e)
                if ($e.Data) {
                    Add-Content -Path $logFile -Value "ERROR: $($e.Data)"
                }
            })

            # Start the process
            $process.Start() | Out-Null
            $process.BeginOutputReadLine()
            $process.BeginErrorReadLine()

            $serverPid = $process.Id
            Set-Content -Path $PID_FILE -Value $serverPid

            # Wait a moment and check if server started
            Start-Sleep -Seconds 3

            $runningProcess = Get-Process -Id $serverPid -ErrorAction SilentlyContinue
            if ($runningProcess) {
                Write-Success "Server started successfully! (PID: $serverPid)"
            }
            else {
                Write-Error-Custom "Server failed to start"
                Write-Info "Check logs: Get-Content $LOG_DIR\app.log -Tail 50"
                Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
                exit 1
            }
        }
    }
}

# Display server info
function Show-ServerInfo {
    param([string]$Mode)

    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🚀 Server is running!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📍 Application URL:     " -NoNewline
    Write-Host "http://localhost:3001" -ForegroundColor Cyan
    Write-Host "🏥 Health Check:        " -NoNewline
    Write-Host "http://localhost:3001/api/health" -ForegroundColor Cyan
    Write-Host "📊 Admin Dashboard:     " -NoNewline
    Write-Host "http://localhost:3001/admin" -ForegroundColor Cyan
    Write-Host ""

    if ($Mode -ne "daemon") {
        Write-Host "📋 View Logs:           " -NoNewline
        Write-Host "Get-Content $LOG_DIR\app.log -Tail 50 -Wait" -ForegroundColor Cyan
        Write-Host "🛑 Stop Server:         " -NoNewline
        Write-Host ".\stop-production.ps1" -ForegroundColor Cyan
    }

    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    # Test health check
    Write-Info "Testing health check endpoint..."
    Start-Sleep -Seconds 2

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Health check passed! ✨"
        }
    }
    catch {
        Write-Warning-Custom "Health check not responding yet (server may still be starting)"
        Write-Info "Try again in a few seconds: Invoke-WebRequest http://localhost:3001/api/health"
    }

    Write-Host ""
    Write-Success "🌾 Happy farming! ✨"
    Write-Host ""
}

# Show usage
function Show-Usage {
    Write-Host "Usage: .\start-production.ps1 [mode]"
    Write-Host ""
    Write-Host "Modes:"
    Write-Host "  (none)      - Start in background (default)"
    Write-Host "  foreground  - Start in foreground (see logs directly)"
    Write-Host "  daemon      - Start with PM2 process manager"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\start-production.ps1"
    Write-Host "  .\start-production.ps1 foreground"
    Write-Host "  .\start-production.ps1 daemon"
    Write-Host ""
}

# Main execution
function Main {
    param([string]$Mode)

    Write-Header

    # Check for help flag
    if ($Mode -eq "-h" -or $Mode -eq "--help" -or $Mode -eq "/?" -or $Mode -eq "help") {
        Show-Usage
        exit 0
    }

    try {
        # Pre-flight checks
        Test-Build
        Test-Environment
        Initialize-Logs
        Test-Running
        Import-Environment
        Test-Database

        Write-Host ""

        # Start server
        Start-ProductionServer -Mode $Mode

        # Display info (not in foreground mode as it's blocking)
        if ($Mode -ne "foreground") {
            Show-ServerInfo -Mode $Mode
        }
    }
    catch {
        Write-Error-Custom "An error occurred: $_"
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Warning-Custom "Check logs for more details"
        exit 1
    }
}

# Run main function with first argument
Main -Mode $args[0]
