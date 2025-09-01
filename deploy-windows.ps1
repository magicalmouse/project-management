# Windows PowerShell Deployment Script for Project Management System
param(
    [switch]$Build,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Logs,
    [switch]$Status,
    [switch]$Clean,
    [switch]$Help
)

# Colors for output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

function Show-Help {
    Write-Host "🚀 Project Management System - Docker Deployment" -ForegroundColor Magenta
    Write-Host "=================================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: .\deploy-windows.ps1 [OPTIONS]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Build     Build and start all services" -ForegroundColor Green
    Write-Host "  -Start     Start all services" -ForegroundColor Green
    Write-Host "  -Stop      Stop all services" -ForegroundColor Green
    Write-Host "  -Restart   Restart all services" -ForegroundColor Green
    Write-Host "  -Logs      Show service logs" -ForegroundColor Green
    Write-Host "  -Status    Show service status" -ForegroundColor Green
    Write-Host "  -Clean     Clean up containers and images" -ForegroundColor Green
    Write-Host "  -Help      Show this help message" -ForegroundColor Green
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deploy-windows.ps1 -Build    # First time deployment"
    Write-Host "  .\deploy-windows.ps1 -Status   # Check service status"
    Write-Host "  .\deploy-windows.ps1 -Logs     # View logs"
    Write-Host "  .\deploy-windows.ps1 -Restart  # Restart services"
}

function Test-Docker {
    try {
        $dockerVersion = docker --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker is installed: $dockerVersion"
            return $true
        }
    } catch {
        Write-Error "Docker is not installed or not running"
        Write-Info "Please install Docker Desktop from: https://docker.com/products/docker-desktop"
        return $false
    }
    return $false
}

function Test-DockerCompose {
    try {
        $composeVersion = docker-compose --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Compose is available: $composeVersion"
            return $true
        }
    } catch {
        Write-Error "Docker Compose is not available"
        return $false
    }
    return $false
}

function Test-Environment {
    if (!(Test-Path ".env")) {
        Write-Warning ".env file not found. Creating from template..."
        if (Test-Path "env.production.example") {
            Copy-Item "env.production.example" ".env"
            Write-Success ".env file created from template"
            Write-Warning "Please edit .env file with your configuration before continuing"
            Write-Info "Press any key to continue after editing .env..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        } else {
            Write-Error "env.production.example not found!"
            return $false
        }
    } else {
        Write-Success ".env file found"
    }
    return $true
}

function Build-Services {
    Write-Info "Building and starting services..."
    
    # Stop existing services
    docker-compose down --remove-orphans 2>$null
    
    # Build and start services
    docker-compose up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services built and started successfully!"
        Start-Sleep -Seconds 5
        Show-Status
        Show-AccessInfo
    } else {
        Write-Error "Failed to build and start services"
        return $false
    }
    return $true
}

function Start-Services {
    Write-Info "Starting services..."
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started successfully!"
        Show-Status
    } else {
        Write-Error "Failed to start services"
        return $false
    }
    return $true
}

function Stop-Services {
    Write-Info "Stopping services..."
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services stopped successfully!"
    } else {
        Write-Error "Failed to stop services"
        return $false
    }
    return $true
}

function Restart-Services {
    Write-Info "Restarting services..."
    docker-compose restart
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services restarted successfully!"
        Show-Status
    } else {
        Write-Error "Failed to restart services"
        return $false
    }
    return $true
}

function Show-Logs {
    Write-Info "Showing service logs (Press Ctrl+C to exit)..."
    docker-compose logs -f
}

function Show-Status {
    Write-Info "Service Status:"
    docker-compose ps
    
    Write-Info "`nContainer Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

function Clean-Docker {
    Write-Warning "This will remove all containers, networks, and unused images"
    $confirm = Read-Host "Are you sure? (y/N)"
    
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        Write-Info "Cleaning up Docker resources..."
        docker-compose down --volumes --remove-orphans
        docker system prune -a -f
        Write-Success "Docker cleanup completed!"
    } else {
        Write-Info "Cleanup cancelled"
    }
}

function Show-AccessInfo {
    Write-Host ""
    Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "======================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Access your application:" -ForegroundColor Yellow
    Write-Host "   Frontend: http://localhost" -ForegroundColor Cyan
    Write-Host "   Backend API: http://localhost:4000" -ForegroundColor Cyan
    Write-Host "   Database: localhost:3306" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔑 Default Admin Login:" -ForegroundColor Yellow
    Write-Host "   Username: admin" -ForegroundColor Cyan
    Write-Host "   Password: admin123" -ForegroundColor Cyan
    Write-Host "   ⚠️  Change this password immediately!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🛠️  Management Commands:" -ForegroundColor Yellow
    Write-Host "   Status: .\deploy-windows.ps1 -Status" -ForegroundColor Cyan
    Write-Host "   Logs: .\deploy-windows.ps1 -Logs" -ForegroundColor Cyan
    Write-Host "   Restart: .\deploy-windows.ps1 -Restart" -ForegroundColor Cyan
    Write-Host "   Stop: .\deploy-windows.ps1 -Stop" -ForegroundColor Cyan
    Write-Host ""
}

# Main execution
Write-Host "🚀 Project Management System - Docker Deployment" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta

if ($Help) {
    Show-Help
    exit 0
}

# Check Docker installation
if (!(Test-Docker)) {
    exit 1
}

if (!(Test-DockerCompose)) {
    exit 1
}

# Check environment file
if (!(Test-Environment)) {
    exit 1
}

# Execute requested action
if ($Build) {
    Build-Services
} elseif ($Start) {
    Start-Services
} elseif ($Stop) {
    Stop-Services
} elseif ($Restart) {
    Restart-Services
} elseif ($Logs) {
    Show-Logs
} elseif ($Status) {
    Show-Status
} elseif ($Clean) {
    Clean-Docker
} else {
    Write-Info "No action specified. Use -Help for usage information."
    Write-Info "Quick start: .\deploy-windows.ps1 -Build"
}