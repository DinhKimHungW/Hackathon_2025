# ============================================================================
# PortLink Orchestrator - Deployment Verification Script (PowerShell)
# ============================================================================
# This script verifies that the deployment is working correctly
# Usage: .\verify-deployment.ps1 [-BackendUrl <url>] [-FrontendUrl <url>]
# Example: .\verify-deployment.ps1 -BackendUrl "http://localhost:3000" -FrontendUrl "http://localhost:8080"

param(
    [string]$BackendUrl = "http://localhost:3000",
    [string]$FrontendUrl = "http://localhost:8080"
)

# Colors
$colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    White = "White"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Check-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$ExpectedStatus = 200
    )

    Write-Host "Checking $Name... " -NoNewline

    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0 -ErrorAction Stop
        $status = $response.StatusCode

        if ($status -eq $ExpectedStatus -or $status -eq 200) {
            Write-ColorOutput "✓ OK (HTTP $status)" "Green"
        } else {
            Write-ColorOutput "✗ FAIL (HTTP $status)" "Red"
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-ColorOutput "✓ OK (HTTP $statusCode)" "Green"
        } else {
            Write-ColorOutput "✗ FAIL (HTTP $statusCode or connection error)" "Red"
        }
    }
}

function Check-JsonEndpoint {
    param(
        [string]$Url,
        [string]$Name,
        [string]$ExpectedField
    )

    Write-Host "Checking $Name... " -NoNewline

    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        $jsonString = $response | ConvertTo-Json -Depth 10

        if ($jsonString -like "*$ExpectedField*") {
            Write-ColorOutput "✓ OK" "Green"
        } else {
            Write-ColorOutput "✗ FAIL (field '$ExpectedField' not found)" "Red"
        }
    }
    catch {
        Write-ColorOutput "✗ FAIL (connection error)" "Red"
    }
}

# Header
Write-Host ""
Write-ColorOutput "╔════════════════════════════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║   PortLink Orchestrator - Deployment Verification              ║" "Cyan"
Write-ColorOutput "╚════════════════════════════════════════════════════════════════╝" "Cyan"
Write-Host ""
Write-Host "Backend URL:  $BackendUrl"
Write-Host "Frontend URL: $FrontendUrl"
Write-Host ""

# Frontend Checks
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "Frontend Checks" "White"
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Check-Endpoint -Url $FrontendUrl -Name "Frontend Homepage"

Write-Host ""

# Backend API Checks
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "Backend API Checks" "White"
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Check-Endpoint -Url "$BackendUrl/api/v1/auth/verify" -Name "Auth Endpoint" -ExpectedStatus 401
Check-Endpoint -Url "$BackendUrl/health" -Name "Health Endpoint"

Write-Host ""

# Docker Container Checks
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "Service Status" "White"
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "Docker containers:"
    try {
        $containers = docker compose ps --format json 2>$null | ConvertFrom-Json
        if ($containers) {
            foreach ($container in $containers) {
                $status = $container.State
                if ($status -eq "running") {
                    Write-ColorOutput "✓ $($container.Name) - $($container.Service)" "Green"
                } else {
                    Write-ColorOutput "✗ $($container.Name) - $($container.Service) ($status)" "Yellow"
                }
            }
        } else {
            Write-ColorOutput "No containers found" "Yellow"
        }
    }
    catch {
        Write-ColorOutput "Could not get container status" "Yellow"
    }
} else {
    Write-ColorOutput "Docker not available - skipping container checks" "Yellow"
}

Write-Host ""

# Next Steps
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "Next Steps" "White"
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Write-Host "1. Access Frontend: $FrontendUrl"
Write-Host "2. Access Backend API: $BackendUrl/api/v1"
Write-Host "3. Login with:"
Write-Host "   - Email: admin@portlink.com"
Write-Host "   - Password: Admin@123"
Write-Host ""
Write-Host "4. View logs:"
Write-Host "   docker compose logs -f"
Write-Host ""
Write-Host "5. Stop services:"
Write-Host "   docker compose down"
Write-Host ""
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "Verification Complete!" "Green"
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Cyan"
Write-Host ""
