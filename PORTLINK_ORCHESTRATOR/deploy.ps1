# ============================================================================
# PortLink Orchestrator - Deployment Script (Windows PowerShell)
# ============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet('build', 'up', 'down', 'restart', 'logs', 'clean', 'backup', 'restore', 'install', 'help')]
    [string]$Command = 'help'
)

$ErrorActionPreference = 'Stop'

# Colors
$Blue = "Cyan"
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

function Show-Help {
    Write-Host "`n=== PortLink Orchestrator - Deployment Commands ===" -ForegroundColor $Blue
    Write-Host "`nUsage: .\deploy.ps1 <command>`n" -ForegroundColor White
    
    Write-Host "Development:" -ForegroundColor $Green
    Write-Host "  dev         - Start development environment" -ForegroundColor White
    Write-Host "  dev-down    - Stop development environment" -ForegroundColor White
    
    Write-Host "`nProduction:" -ForegroundColor $Green
    Write-Host "  build       - Build all Docker images" -ForegroundColor White
    Write-Host "  up          - Start all services" -ForegroundColor White
    Write-Host "  down        - Stop all services" -ForegroundColor White
    Write-Host "  restart     - Restart all services" -ForegroundColor White
    Write-Host "  logs        - View logs from all services" -ForegroundColor White
    
    Write-Host "`nDatabase:" -ForegroundColor $Green
    Write-Host "  backup      - Create database backup" -ForegroundColor White
    Write-Host "  restore     - Restore database from backup" -ForegroundColor White
    Write-Host "  seed        - Seed database with demo data" -ForegroundColor White
    
    Write-Host "`nMaintenance:" -ForegroundColor $Green
    Write-Host "  clean       - Remove containers and unused images" -ForegroundColor White
    Write-Host "  rebuild     - Rebuild and restart services" -ForegroundColor White
    Write-Host "  health      - Check service health" -ForegroundColor White
    
    Write-Host "`nQuick Actions:" -ForegroundColor $Green
    Write-Host "  install     - Initial setup (build + up + seed)" -ForegroundColor White
    Write-Host "  help        - Show this help message`n" -ForegroundColor White
}

function Invoke-Build {
    Write-Host "`n[BUILD] Building Docker images..." -ForegroundColor $Green
    docker-compose build --parallel
    Write-Host "[BUILD] ✓ Build complete`n" -ForegroundColor $Green
}

function Invoke-Up {
    Write-Host "`n[START] Starting production services..." -ForegroundColor $Green
    docker-compose up -d
    Write-Host "[START] ✓ Services started" -ForegroundColor $Green
    Write-Host "Frontend: http://localhost:8080" -ForegroundColor $Blue
    Write-Host "Backend:  http://localhost:3000`n" -ForegroundColor $Blue
}

function Invoke-Down {
    Write-Host "`n[STOP] Stopping all services..." -ForegroundColor $Yellow
    docker-compose down
    Write-Host "[STOP] ✓ Services stopped`n" -ForegroundColor $Green
}

function Invoke-Restart {
    Invoke-Down
    Invoke-Up
}

function Invoke-Logs {
    Write-Host "`n[LOGS] Viewing logs (Press Ctrl+C to exit)..." -ForegroundColor $Blue
    docker-compose logs -f
}

function Invoke-Clean {
    Write-Host "`n[CLEAN] Cleaning up..." -ForegroundColor $Yellow
    docker-compose down -v
    docker system prune -f
    Write-Host "[CLEAN] ✓ Cleanup complete`n" -ForegroundColor $Green
}

function Invoke-Backup {
    Write-Host "`n[BACKUP] Creating database backup..." -ForegroundColor $Green
    
    # Create backups directory if it doesn't exist
    if (!(Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backups\backup_$timestamp.sql"
    
    docker-compose exec -T postgres pg_dump -U portlink_user portlink_db > $backupFile
    Write-Host "[BACKUP] ✓ Backup created: $backupFile`n" -ForegroundColor $Green
}

function Invoke-Restore {
    Write-Host "`n[RESTORE] Restoring database from latest backup..." -ForegroundColor $Yellow
    
    $latestBackup = Get-ChildItem -Path "backups\*.sql" -ErrorAction SilentlyContinue | 
                    Sort-Object LastWriteTime -Descending | 
                    Select-Object -First 1
    
    if (!$latestBackup) {
        Write-Host "[RESTORE] ✗ No backup files found`n" -ForegroundColor $Red
        exit 1
    }
    
    Write-Host "[RESTORE] Restoring from $($latestBackup.Name)..." -ForegroundColor $Blue
    Get-Content $latestBackup.FullName | docker-compose exec -T postgres psql -U portlink_user -d portlink_db
    Write-Host "[RESTORE] ✓ Database restored`n" -ForegroundColor $Green
}

function Invoke-Seed {
    Write-Host "`n[SEED] Seeding database..." -ForegroundColor $Blue
    docker-compose exec backend npm run seed:demo
    Write-Host "[SEED] ✓ Database seeded`n" -ForegroundColor $Green
}

function Invoke-Rebuild {
    Write-Host "`n[REBUILD] Rebuilding all services..." -ForegroundColor $Green
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Write-Host "[REBUILD] ✓ Rebuild complete`n" -ForegroundColor $Green
}

function Invoke-Health {
    Write-Host "`n[HEALTH] Checking service health..." -ForegroundColor $Blue
    docker-compose ps
    
    Write-Host "`nTesting endpoints..." -ForegroundColor $Blue
    
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/verify" -UseBasicParsing -ErrorAction Stop
        Write-Host "✓ Backend API is healthy" -ForegroundColor $Green
    } catch {
        Write-Host "✗ Backend API is down" -ForegroundColor $Red
    }
    
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -ErrorAction Stop
        Write-Host "✓ Frontend is healthy" -ForegroundColor $Green
    } catch {
        Write-Host "✗ Frontend is down" -ForegroundColor $Red
    }
    Write-Host ""
}

function Invoke-Install {
    Write-Host "`n[INSTALL] Starting initial setup..." -ForegroundColor $Blue
    Invoke-Build
    Invoke-Up
    Start-Sleep -Seconds 10  # Wait for services to be ready
    Invoke-Seed
    Write-Host "[INSTALL] ✓ Installation complete!" -ForegroundColor $Green
    Write-Host "Frontend: http://localhost:8080" -ForegroundColor $Blue
    Write-Host "Backend:  http://localhost:3000" -ForegroundColor $Blue
    Write-Host "Default credentials: admin@portlink.com / Admin@123`n" -ForegroundColor $Yellow
}

function Invoke-Dev {
    Write-Host "`n[DEV] Starting development environment..." -ForegroundColor $Green
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    Write-Host "[DEV] ✓ Development environment started" -ForegroundColor $Green
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor $Blue
    Write-Host "Backend:  http://localhost:3000`n" -ForegroundColor $Blue
}

function Invoke-DevDown {
    Write-Host "`n[DEV] Stopping development environment..." -ForegroundColor $Yellow
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    Write-Host "[DEV] ✓ Development environment stopped`n" -ForegroundColor $Green
}

# Main execution
switch ($Command.ToLower()) {
    'build'     { Invoke-Build }
    'up'        { Invoke-Up }
    'down'      { Invoke-Down }
    'restart'   { Invoke-Restart }
    'logs'      { Invoke-Logs }
    'clean'     { Invoke-Clean }
    'backup'    { Invoke-Backup }
    'restore'   { Invoke-Restore }
    'seed'      { Invoke-Seed }
    'rebuild'   { Invoke-Rebuild }
    'health'    { Invoke-Health }
    'install'   { Invoke-Install }
    'dev'       { Invoke-Dev }
    'dev-down'  { Invoke-DevDown }
    'help'      { Show-Help }
    default     { Show-Help }
}
