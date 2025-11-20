# ============================================================================
# PortLink Orchestrator - Quick Deploy Script (PowerShell)
# ============================================================================
# Quick deployment script for Docker on Windows
# Usage: .\quick-deploy.ps1

# Error handling
$ErrorActionPreference = "Stop"

# Functions
function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   PortLink Orchestrator - Quick Deploy                        ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "▶ $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Check Docker
function Test-Docker {
    Write-Step "Checking Docker installation..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        Write-Host "Visit: https://docs.docker.com/desktop/install/windows-install/"
        exit 1
    }
    
    try {
        $null = docker compose version
        Write-Success "Docker is installed"
    }
    catch {
        Write-Error "Docker Compose V2 is not available."
        exit 1
    }
}

# Setup environment
function Set-Environment {
    Write-Step "Setting up environment configuration..."
    
    if (-not (Test-Path .env)) {
        if (Test-Path .env.docker.example) {
            Copy-Item .env.docker.example .env
            Write-Success "Created .env file from template"
            Write-Warning "IMPORTANT: Please edit .env file and change the default passwords!"
            Write-Warning "Press Enter to continue or Ctrl+C to abort and edit .env first"
            Read-Host
        }
        else {
            Write-Error ".env.docker.example not found"
            exit 1
        }
    }
    else {
        Write-Success ".env file already exists"
    }
}

# Build images
function Build-Images {
    Write-Step "Building Docker images (this may take a few minutes)..."
    
    try {
        docker compose build
        Write-Success "Docker images built successfully"
    }
    catch {
        Write-Error "Failed to build Docker images"
        Write-Host $_.Exception.Message
        exit 1
    }
}

# Start services
function Start-Services {
    Write-Step "Starting services..."
    
    try {
        docker compose up -d
        Write-Success "Services started successfully"
    }
    catch {
        Write-Error "Failed to start services"
        Write-Host $_.Exception.Message
        exit 1
    }
}

# Wait for services
function Wait-ForServices {
    Write-Step "Waiting for services to be ready..."
    
    Write-Host "  Waiting" -NoNewline
    
    for ($i = 0; $i -lt 30; $i++) {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host ""
                Write-Success "Services are ready!"
                return
            }
        }
        catch {
            # Continue waiting
        }
    }
    
    Write-Host ""
    Write-Warning "Services may not be fully ready yet. Check logs with: docker compose logs -f"
}

# Display info
function Show-Info {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✓ Deployment Complete!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access your application:"
    Write-Host ""
    Write-Host "  Frontend:    " -NoNewline
    Write-Host "http://localhost:8080" -ForegroundColor Green
    Write-Host "  Backend API: " -NoNewline
    Write-Host "http://localhost:3000/api/v1" -ForegroundColor Green
    Write-Host "  Health:      " -NoNewline
    Write-Host "http://localhost:3000/health" -ForegroundColor Green
    Write-Host ""
    Write-Host "Default login credentials:"
    Write-Host "  Email:    " -NoNewline
    Write-Host "admin@portlink.com" -ForegroundColor Yellow
    Write-Host "  Password: " -NoNewline
    Write-Host "Admin@123" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Useful commands:"
    Write-Host ""
    Write-Host "  View logs:        docker compose logs -f"
    Write-Host "  Stop services:    docker compose down"
    Write-Host "  Restart:          docker compose restart"
    Write-Host "  View status:      docker compose ps"
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

# Main execution
try {
    Write-Header
    
    # Navigate to script directory
    Set-Location $PSScriptRoot
    
    Test-Docker
    Set-Environment
    Build-Images
    Start-Services
    Wait-ForServices
    Show-Info
}
catch {
    Write-Host ""
    Write-Error "Deployment failed!"
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
}
