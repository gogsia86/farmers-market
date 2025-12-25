# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🌾 FARMERS MARKET PLATFORM - DOCKER DEPLOYMENT SCRIPT (Windows)  ║
# ║ Deploy to Docker Desktop with production configuration            ║
# ╚════════════════════════════════════════════════════════════════════╝

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('full', 'quick', 'clean')]
    [string]$DeployType = 'full',

    [Parameter(Mandatory=$false)]
    [switch]$NoSeed,

    [Parameter(Mandatory=$false)]
    [switch]$WithAdmin
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Color functions
function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║ $Message" -ForegroundColor Blue
    Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
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

# Check if Docker is running
function Test-DockerRunning {
    Write-Header "Checking Docker Status"

    try {
        $null = docker info 2>&1
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error-Custom "Docker is not running. Please start Docker Desktop."
        return $false
    }
}

# Check environment file
function Test-EnvFile {
    Write-Header "Checking Environment Configuration"

    if (-not (Test-Path ".env")) {
        Write-Warning-Custom ".env file not found. Creating from .env.example..."

        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Success "Created .env file from .env.example"
            Write-Warning-Custom "Please update .env with your production values!"
            Write-Host ""
            Read-Host "Press Enter to continue or Ctrl+C to exit and update .env first"
        }
        else {
            Write-Error-Custom ".env.example not found. Cannot create .env"
            return $false
        }
    }
    else {
        Write-Success ".env file exists"
    }

    return $true
}

# Stop existing containers
function Stop-ExistingContainers {
    Write-Header "Stopping Existing Containers"

    $containers = docker-compose ps -q 2>$null

    if ($containers) {
        Write-Info "Stopping existing containers..."
        docker-compose down
        Write-Success "Stopped existing containers"
    }
    else {
        Write-Info "No running containers to stop"
    }
}

# Clean build artifacts
function Clear-BuildArtifacts {
    Write-Header "Cleaning Build Artifacts"

    Write-Info "Removing .next directory..."
    if (Test-Path ".next") {
        Remove-Item -Path ".next" -Recurse -Force
    }

    Write-Info "Removing node_modules cache..."
    if (Test-Path "node_modules\.cache") {
        Remove-Item -Path "node_modules\.cache" -Recurse -Force
    }

    Write-Success "Build artifacts cleaned"
}

# Build production image
function Build-ProductionImage {
    Write-Header "Building Production Docker Image"

    Write-Info "This may take several minutes..."
    Write-Host ""

    try {
        docker-compose build --no-cache app
        Write-Success "Docker image built successfully"
        return $true
    }
    catch {
        Write-Error-Custom "Failed to build Docker image"
        Write-Host $_.Exception.Message
        return $false
    }
}

# Start services
function Start-Services {
    Write-Header "Starting Services"

    Write-Info "Starting all services in production mode..."
    Write-Host ""

    try {
        if ($WithAdmin) {
            docker-compose --profile admin up -d
        }
        else {
            docker-compose up -d
        }
        Write-Success "Services started successfully"
        return $true
    }
    catch {
        Write-Error-Custom "Failed to start services"
        Write-Host $_.Exception.Message
        return $false
    }
}

# Wait for service health
function Wait-ForServiceHealth {
    param(
        [string]$ServiceName,
        [int]$MaxWaitSeconds = 60
    )

    $counter = 0

    while ($counter -lt $MaxWaitSeconds) {
        $status = docker-compose ps $ServiceName 2>$null | Select-String "healthy"

        if ($status) {
            return $true
        }

        Start-Sleep -Seconds 2
        $counter += 2
        Write-Host "." -NoNewline
    }

    Write-Host ""
    return $false
}

# Wait for all services
function Wait-ForAllServices {
    Write-Header "Waiting for Services to be Healthy"

    # Wait for database
    Write-Info "Checking database health..."
    if (-not (Wait-ForServiceHealth -ServiceName "postgres" -MaxWaitSeconds 60)) {
        Write-Error-Custom "Database did not become healthy within 60 seconds"
        return $false
    }
    Write-Success "Database is healthy"

    # Wait for Redis
    Write-Info "Checking Redis health..."
    if (-not (Wait-ForServiceHealth -ServiceName "redis" -MaxWaitSeconds 30)) {
        Write-Error-Custom "Redis did not become healthy within 30 seconds"
        return $false
    }
    Write-Success "Redis is healthy"

    # Wait for app
    Write-Info "Checking application health..."
    if (-not (Wait-ForServiceHealth -ServiceName "app" -MaxWaitSeconds 120)) {
        Write-Error-Custom "Application did not become healthy within 120 seconds"
        Write-Info "Check logs with: docker-compose logs app"
        return $false
    }
    Write-Success "Application is healthy"

    return $true
}

# Run database migrations
function Invoke-DatabaseMigrations {
    Write-Header "Running Database Migrations"

    Write-Info "Running Prisma migrations..."

    try {
        docker-compose exec -T app npx prisma migrate deploy
        Write-Success "Migrations completed successfully"
        return $true
    }
    catch {
        Write-Error-Custom "Migrations failed"
        Write-Host $_.Exception.Message
        return $false
    }
}

# Seed database
function Invoke-DatabaseSeed {
    Write-Header "Database Seeding (Optional)"

    if ($NoSeed) {
        Write-Info "Skipping database seeding (--NoSeed flag provided)"
        return $true
    }

    $response = Read-Host "Do you want to seed the database with sample data? (y/N)"

    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Info "Seeding database..."

        try {
            docker-compose exec -T app npm run db:seed
            Write-Success "Database seeded successfully"
            return $true
        }
        catch {
            Write-Warning-Custom "Database seeding failed (non-critical)"
            return $true
        }
    }
    else {
        Write-Info "Skipping database seeding"
        return $true
    }
}

# Show container status
function Show-ContainerStatus {
    Write-Header "Container Status"

    Write-Host ""
    docker-compose ps
    Write-Host ""
}

# Show deployment info
function Show-DeploymentInfo {
    Write-Header "🎉 Deployment Complete!"

    Write-Host ""
    Write-Success "All services are running!"
    Write-Host ""

    Write-Info "Access your application:"
    Write-Host "  🌐 Main App:      http://localhost:3000" -ForegroundColor White
    Write-Host "  🌐 Nginx Proxy:   http://localhost:80" -ForegroundColor White

    if ($WithAdmin) {
        Write-Host "  🔧 PgAdmin:       http://localhost:5050" -ForegroundColor White
        Write-Host "  📊 Redis Cmd:     http://localhost:8081" -ForegroundColor White
    }
    Write-Host ""

    Write-Info "Useful commands:"
    Write-Host "  📋 View logs:         docker-compose logs -f" -ForegroundColor White
    Write-Host "  📋 View app logs:     docker-compose logs -f app" -ForegroundColor White
    Write-Host "  🛑 Stop services:     docker-compose down" -ForegroundColor White
    Write-Host "  🔄 Restart services:  docker-compose restart" -ForegroundColor White
    Write-Host "  🗄️  Access database:   docker-compose exec postgres psql -U farmers_user -d farmers_market" -ForegroundColor White
    Write-Host ""

    Write-Info "Test credentials:"
    Write-Host "  👨‍🌾 Farmer:    farmer@example.com / password123" -ForegroundColor White
    Write-Host "  👤 Customer:  customer@example.com / password123" -ForegroundColor White
    Write-Host "  👑 Admin:     admin@example.com / password123" -ForegroundColor White
    Write-Host ""

    Write-Success "Happy farming! 🌾🚀"
}

# Full deployment
function Invoke-FullDeployment {
    if (-not (Stop-ExistingContainers)) { return $false }
    if (-not (Clear-BuildArtifacts)) { return $false }
    if (-not (Build-ProductionImage)) { return $false }
    if (-not (Start-Services)) { return $false }
    if (-not (Wait-ForAllServices)) { return $false }
    if (-not (Invoke-DatabaseMigrations)) { return $false }
    if (-not (Invoke-DatabaseSeed)) { return $false }

    Show-ContainerStatus
    Show-DeploymentInfo
    return $true
}

# Quick restart
function Invoke-QuickRestart {
    Write-Header "Quick Restart"

    docker-compose restart
    Write-Success "Services restarted"
    Show-ContainerStatus
    return $true
}

# Clean rebuild
function Invoke-CleanRebuild {
    Write-Header "Clean Rebuild"

    Write-Warning-Custom "This will remove all containers, volumes, and images!"
    $response = Read-Host "Are you sure? (y/N)"

    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Info "Clean rebuild cancelled"
        return $false
    }

    Write-Info "Removing all containers, volumes, and images..."
    docker-compose down -v --rmi all

    if (-not (Clear-BuildArtifacts)) { return $false }
    if (-not (Build-ProductionImage)) { return $false }
    if (-not (Start-Services)) { return $false }
    if (-not (Wait-ForAllServices)) { return $false }
    if (-not (Invoke-DatabaseMigrations)) { return $false }
    if (-not (Invoke-DatabaseSeed)) { return $false }

    Show-ContainerStatus
    Show-DeploymentInfo
    return $true
}

# Main execution
function Main {
    Write-Host ""
    Write-Header "🌾 FARMERS MARKET PLATFORM - DOCKER DEPLOYMENT"

    # Check prerequisites
    if (-not (Test-DockerRunning)) {
        exit 1
    }

    if (-not (Test-EnvFile)) {
        exit 1
    }

    # Execute deployment based on type
    $success = $false

    switch ($DeployType) {
        'full' {
            Write-Info "Starting full deployment..."
            $success = Invoke-FullDeployment
        }
        'quick' {
            Write-Info "Starting quick restart..."
            $success = Invoke-QuickRestart
        }
        'clean' {
            Write-Info "Starting clean rebuild..."
            $success = Invoke-CleanRebuild
        }
    }

    if ($success) {
        Write-Host ""
        Write-Success "Deployment completed successfully!"
        exit 0
    }
    else {
        Write-Host ""
        Write-Error-Custom "Deployment failed. Check the logs above for details."
        exit 1
    }
}

# Run main function
Main
