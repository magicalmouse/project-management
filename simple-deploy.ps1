# Simple Docker Deployment Script
Write-Host "🚀 Project Management System - Simple Docker Deployment" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Function to wait for Docker to be ready
function Wait-ForDocker {
  Write-Host "⏳ Waiting for Docker to be ready..." -ForegroundColor Yellow
  $maxAttempts = 12
  $attempt = 0
    
  while ($attempt -lt $maxAttempts) {
    try {
      $result = docker ps 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker is ready!" -ForegroundColor Green
        return $true
      }
    }
    catch {
      # Docker not ready yet
    }
        
    $attempt++
    Write-Host "   Attempt $attempt/$maxAttempts - waiting 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
  }
    
  Write-Host "❌ Docker failed to start within 2 minutes" -ForegroundColor Red
  Write-Host "Please check Docker Desktop and try again" -ForegroundColor Yellow
  return $false
}

# Check if Docker is ready
if (!(Wait-ForDocker)) {
  Write-Host "Please ensure Docker Desktop is running and try again" -ForegroundColor Red
  exit 1
}

# Create environment file if it doesn't exist
if (!(Test-Path ".env")) {
  Write-Host "📝 Creating environment file..." -ForegroundColor Cyan
  Copy-Item "env.production.example" ".env"
  Write-Host "✅ Environment file created" -ForegroundColor Green
}

# Pull required images first
Write-Host "📥 Pulling Docker images..." -ForegroundColor Cyan
docker pull mysql:8.0
docker pull node:20-alpine
docker pull nginx:alpine

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Cyan
docker-compose down --remove-orphans 2>$null

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Cyan
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "🎉 Deployment Successful!" -ForegroundColor Green
  Write-Host "========================" -ForegroundColor Green
  Write-Host ""
    
  # Wait a moment for services to start
  Start-Sleep -Seconds 10
    
  # Show status
  Write-Host "📊 Service Status:" -ForegroundColor Yellow
  docker-compose ps
    
  Write-Host ""
  Write-Host "🌐 Access Information:" -ForegroundColor Yellow
  Write-Host "   Frontend: http://localhost" -ForegroundColor Cyan
  Write-Host "   Backend API: http://localhost:4000" -ForegroundColor Cyan
  Write-Host "   Database: localhost:3306" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "🔑 Default Login:" -ForegroundColor Yellow
  Write-Host "   Username: admin" -ForegroundColor Cyan
  Write-Host "   Password: admin123" -ForegroundColor Cyan
  Write-Host "   ⚠️  Change this password immediately!" -ForegroundColor Red
  Write-Host ""
  Write-Host "🛠️  Management Commands:" -ForegroundColor Yellow
  Write-Host "   View logs: docker-compose logs -f" -ForegroundColor Cyan
  Write-Host "   Stop services: docker-compose down" -ForegroundColor Cyan
  Write-Host "   Restart: docker-compose restart" -ForegroundColor Cyan
  Write-Host ""
    
  # Test if frontend is accessible
  Start-Sleep -Seconds 5
  try {
    $response = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 10 -UseBasicParsing 2>$null
    if ($response.StatusCode -eq 200) {
      Write-Host "✅ Frontend is accessible at http://localhost" -ForegroundColor Green
    }
  }
  catch {
    Write-Host "⏳ Frontend is starting up... please wait a moment and try http://localhost" -ForegroundColor Yellow
  }
    
}
else {
  Write-Host ""
  Write-Host "❌ Deployment failed!" -ForegroundColor Red
  Write-Host "Check the logs with: docker-compose logs" -ForegroundColor Yellow
  Write-Host ""
}