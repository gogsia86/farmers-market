# 🐳 Farmers Market Platform - Docker Startup Script
# Quick start for local development with Docker

Write-Host "🌾 Farmers Market Platform - Docker Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "🔍 Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting Farmers Market Platform..." -ForegroundColor Cyan
Write-Host ""

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down 2>$null

# Start services
Write-Host "🔧 Building and starting services..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be healthy
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   📱 Application:    http://localhost:3000" -ForegroundColor White
Write-Host "   🔐 Admin Login:    http://localhost:3000/admin-login" -ForegroundColor White
Write-Host "   🗄️  pgAdmin:        http://localhost:5050" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Admin:     admin@farmersmarket.app / DivineAdmin123!" -ForegroundColor White
Write-Host "   pgAdmin:   dev@farmersmarket.local / dev123" -ForegroundColor White
Write-Host ""
Write-Host "📝 View Logs:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Stop Services:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to exit log view" -ForegroundColor Yellow
Write-Host ""

# Show logs
docker-compose -f docker-compose.dev.yml logs -f
