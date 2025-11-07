# Start PortLink Locally
Write-Host "=== Starting PortLink (Local Development) ===" -ForegroundColor Green

# Check PostgreSQL
Write-Host "`n1. Checking PostgreSQL..." -ForegroundColor Cyan
try {
    $pgStatus = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgStatus) {
        Write-Host "   PostgreSQL: $($pgStatus.Status)" -ForegroundColor Gray
        if ($pgStatus.Status -ne "Running") {
            Write-Host "   Starting PostgreSQL..." -ForegroundColor Yellow
            Start-Service -Name $pgStatus.Name
        }
    } else {
        Write-Host "   WARNING: PostgreSQL service not found!" -ForegroundColor Yellow
        Write-Host "   Please ensure PostgreSQL is running on localhost:5432" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   WARNING: Could not check PostgreSQL status" -ForegroundColor Yellow
}

# Check Redis
Write-Host "`n2. Checking Redis..." -ForegroundColor Cyan
try {
    $redisStatus = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
    if ($redisStatus) {
        Write-Host "   Redis: $($redisStatus.Status)" -ForegroundColor Gray
        if ($redisStatus.Status -ne "Running") {
            Write-Host "   Starting Redis..." -ForegroundColor Yellow
            Start-Service -Name "Redis"
        }
    } else {
        Write-Host "   WARNING: Redis service not found!" -ForegroundColor Yellow
        Write-Host "   Please ensure Redis is running on localhost:6379" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   WARNING: Could not check Redis status" -ForegroundColor Yellow
}

# Start Backend
Write-Host "`n3. Starting Backend..." -ForegroundColor Cyan
$backendPath = "C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server' -ForegroundColor Green; npm run start:dev"

# Wait for backend to start
Write-Host "   Waiting 10 seconds for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Start Frontend
Write-Host "`n4. Starting Frontend..." -ForegroundColor Cyan
$frontendPath = "C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server' -ForegroundColor Green; npm run dev"

Write-Host "`n=== PortLink Started ===" -ForegroundColor Green
Write-Host "`nBackend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Health:   http://localhost:3000/api/v1/health" -ForegroundColor Cyan
Write-Host "`nDefault Login:" -ForegroundColor Yellow
Write-Host "  Email:    admin@portlink.com" -ForegroundColor Gray
Write-Host "  Password: Admin@123" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C in each terminal window to stop the servers" -ForegroundColor Yellow
