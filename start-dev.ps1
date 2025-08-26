# Development startup script for Project Management System
Write-Host "🚀 Starting Project Management System..." -ForegroundColor Green
Write-Host ""

# Kill any existing node processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe 2>$null
    Start-Sleep -Seconds 2
}
catch {
    Write-Host "No existing node processes found" -ForegroundColor Gray
}

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "🔧 Starting Backend Server (Port 4000)..." -ForegroundColor Cyan
Set-Location -Path "backend"

# Start backend in background
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
Start-Sleep -Seconds 3
Write-Host "✅ Backend server started on http://localhost:4000" -ForegroundColor Green
Write-Host "📊 Health check: http://localhost:4000/api/health" -ForegroundColor Gray
Write-Host ""

# Go back to main directory for frontend
Set-Location -Path ".."

# Start Frontend Server
Write-Host "⚡ Starting Frontend Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Starting development servers!" -ForegroundColor Green
Write-Host "📱 Frontend will be available at: http://localhost:3003" -ForegroundColor Cyan
Write-Host "🔧 Backend API available at: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop frontend server" -ForegroundColor Yellow
Write-Host ""

# Start frontend (this will run in foreground)
npm run dev