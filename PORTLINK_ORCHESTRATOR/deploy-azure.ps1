# ============================================================================
# PowerShell Deployment Script for PortLink Orchestrator to Azure
# ============================================================================
# Description: Automated deployment script using Azure CLI and Bicep
# Usage: .\deploy-azure.ps1 -EnvironmentName "prod" -Location "eastasia"
# ============================================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$EnvironmentName = 'prod',
    
    [Parameter(Mandatory = $false)]
    [string]$Location = 'eastasia',
    
    [Parameter(Mandatory = $false)]
    [string]$ResourceGroupName = "rg-portlink-$EnvironmentName",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory = $false)]
    [switch]$WhatIf
)

# ============================================================================
# Configuration
# ============================================================================

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$ScriptRoot = $PSScriptRoot
$InfraPath = Join-Path $ScriptRoot 'infra'
$BackendPath = Join-Path $ScriptRoot 'backend'
$FrontendPath = Join-Path $ScriptRoot 'frontend'

# ============================================================================
# Helper Functions
# ============================================================================

function Write-Step {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Step "Checking Prerequisites"
    
    # Check Azure CLI
    if (!(Get-Command az -ErrorAction SilentlyContinue)) {
        Write-Error "Azure CLI is not installed. Please install it from: https://aka.ms/installazurecli"
        exit 1
    }
    Write-Success "Azure CLI is installed"
    
    # Check Docker
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Warning "Docker is not installed. You'll need it to build container images."
        Write-Info "Install from: https://www.docker.com/products/docker-desktop"
    } else {
        Write-Success "Docker is installed"
    }
    
    # Check Azure CLI login
    $account = az account show 2>$null | ConvertFrom-Json
    if (!$account) {
        Write-Error "Not logged in to Azure. Please run: az login"
        exit 1
    }
    Write-Success "Logged in to Azure as $($account.user.name)"
    Write-Info "Subscription: $($account.name) ($($account.id))"
}

function New-ResourceGroup {
    Write-Step "Creating Resource Group"
    
    $exists = az group exists --name $ResourceGroupName | ConvertFrom-Json
    
    if ($exists) {
        Write-Info "Resource group '$ResourceGroupName' already exists"
    } else {
        Write-Info "Creating resource group '$ResourceGroupName' in '$Location'"
        
        if (!$WhatIf) {
            az group create `
                --name $ResourceGroupName `
                --location $Location `
                --tags environment=$EnvironmentName project=PortLink
        }
        
        Write-Success "Resource group created"
    }
}

function Get-SecurePassword {
    param(
        [string]$PromptMessage,
        [string]$EnvVarName
    )
    
    # Check if password exists in environment variable
    $password = [System.Environment]::GetEnvironmentVariable($EnvVarName)
    
    if ([string]::IsNullOrWhiteSpace($password)) {
        Write-Info $PromptMessage
        $securePassword = Read-Host -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
    
    return $password
}

function Deploy-Infrastructure {
    Write-Step "Deploying Infrastructure"
    
    # Get secrets
    $postgresPassword = Get-SecurePassword `
        -PromptMessage "Enter PostgreSQL admin password (or set POSTGRES_PASSWORD env var):" `
        -EnvVarName "POSTGRES_PASSWORD"
    
    $redisPassword = Get-SecurePassword `
        -PromptMessage "Enter Redis password (or set REDIS_PASSWORD env var):" `
        -EnvVarName "REDIS_PASSWORD"
    
    $jwtSecret = Get-SecurePassword `
        -PromptMessage "Enter JWT secret (or set JWT_SECRET env var):" `
        -EnvVarName "JWT_SECRET"
    
    $jwtRefreshSecret = Get-SecurePassword `
        -PromptMessage "Enter JWT refresh secret (or set JWT_REFRESH_SECRET env var):" `
        -EnvVarName "JWT_REFRESH_SECRET"
    
    # Validate Bicep template
    Write-Info "Validating Bicep template..."
    az deployment group validate `
        --resource-group $ResourceGroupName `
        --template-file "$InfraPath\main.bicep" `
        --parameters environmentName=$EnvironmentName `
        --parameters location=$Location `
        --parameters postgresAdminUser='portlinkadmin' `
        --parameters postgresAdminPassword=$postgresPassword `
        --parameters redisPassword=$redisPassword `
        --parameters jwtSecret=$jwtSecret `
        --parameters jwtRefreshSecret=$jwtRefreshSecret
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Bicep template validation failed"
        exit 1
    }
    Write-Success "Bicep template is valid"
    
    # Preview changes
    if ($WhatIf) {
        Write-Info "Running what-if analysis..."
        az deployment group what-if `
            --resource-group $ResourceGroupName `
            --template-file "$InfraPath\main.bicep" `
            --parameters environmentName=$EnvironmentName `
            --parameters location=$Location `
            --parameters postgresAdminUser='portlinkadmin' `
            --parameters postgresAdminPassword=$postgresPassword `
            --parameters redisPassword=$redisPassword `
            --parameters jwtSecret=$jwtSecret `
            --parameters jwtRefreshSecret=$jwtRefreshSecret
        return
    }
    
    # Deploy infrastructure
    Write-Info "Deploying infrastructure (this may take 10-15 minutes)..."
    $deploymentName = "portlink-deployment-$(Get-Date -Format 'yyyyMMddHHmmss')"
    
    $deployment = az deployment group create `
        --resource-group $ResourceGroupName `
        --template-file "$InfraPath\main.bicep" `
        --parameters environmentName=$EnvironmentName `
        --parameters location=$Location `
        --parameters postgresAdminUser='portlinkadmin' `
        --parameters postgresAdminPassword=$postgresPassword `
        --parameters redisPassword=$redisPassword `
        --parameters jwtSecret=$jwtSecret `
        --parameters jwtRefreshSecret=$jwtRefreshSecret `
        --name $deploymentName `
        --output json | ConvertFrom-Json
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Infrastructure deployment failed"
        exit 1
    }
    
    Write-Success "Infrastructure deployed successfully"
    
    return $deployment.properties.outputs
}

function Build-And-Push-Images {
    param($outputs)
    
    if ($SkipBuild) {
        Write-Info "Skipping image build (--SkipBuild specified)"
        return
    }
    
    Write-Step "Building and Pushing Docker Images"
    
    $acrLoginServer = $outputs.acrLoginServer.value
    $backendUrl = $outputs.backendUrl.value
    
    Write-Info "ACR Login Server: $acrLoginServer"
    
    # Login to ACR
    Write-Info "Logging in to Azure Container Registry..."
    az acr login --name $acrLoginServer.Split('.')[0]
    
    # Build and push backend
    Write-Info "Building backend image..."
    docker build -t "${acrLoginServer}/portlink-backend:latest" $BackendPath
    
    Write-Info "Pushing backend image..."
    docker push "${acrLoginServer}/portlink-backend:latest"
    Write-Success "Backend image pushed"
    
    # Build and push frontend
    Write-Info "Building frontend image..."
    docker build `
        --build-arg VITE_API_BASE_URL="${backendUrl}/api/v1" `
        --build-arg VITE_WS_URL="${backendUrl.Replace('https://', 'wss://')}" `
        -t "${acrLoginServer}/portlink-frontend:latest" `
        $FrontendPath
    
    Write-Info "Pushing frontend image..."
    docker push "${acrLoginServer}/portlink-frontend:latest"
    Write-Success "Frontend image pushed"
}

function Update-ContainerApps {
    param($outputs)
    
    Write-Step "Updating Container Apps"
    
    $acrLoginServer = $outputs.acrLoginServer.value
    
    # Update backend
    Write-Info "Updating backend container app..."
    az containerapp update `
        --name "ca-portlink-backend-$EnvironmentName" `
        --resource-group $ResourceGroupName `
        --image "${acrLoginServer}/portlink-backend:latest"
    
    Write-Success "Backend container app updated"
    
    # Update frontend
    Write-Info "Updating frontend container app..."
    az containerapp update `
        --name "ca-portlink-frontend-$EnvironmentName" `
        --resource-group $ResourceGroupName `
        --image "${acrLoginServer}/portlink-frontend:latest"
    
    Write-Success "Frontend container app updated"
}

function Show-DeploymentSummary {
    param($outputs)
    
    Write-Step "Deployment Summary"
    
    Write-Host ""
    Write-Host "🎉 Deployment Completed Successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Application URLs:" -ForegroundColor Cyan
    Write-Host "   Frontend: $($outputs.frontendUrl.value)" -ForegroundColor White
    Write-Host "   Backend:  $($outputs.backendUrl.value)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Azure Resources:" -ForegroundColor Cyan
    Write-Host "   Resource Group: $ResourceGroupName" -ForegroundColor White
    Write-Host "   Portal: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$ResourceGroupName" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Key Vault: $($outputs.keyVaultName.value)" -ForegroundColor Cyan
    Write-Host "🗄️  PostgreSQL: $($outputs.postgresServerFqdn.value)" -ForegroundColor Cyan
    Write-Host "💾 Redis: $($outputs.redisHostName.value)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Run database migrations:" -ForegroundColor White
    Write-Host "      cd backend" -ForegroundColor Gray
    Write-Host "      npm run migration:run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Seed demo data (optional):" -ForegroundColor White
    Write-Host "      npm run seed:demo" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Monitor application:" -ForegroundColor White
    Write-Host "      az containerapp logs show --name ca-portlink-backend-$EnvironmentName --resource-group $ResourceGroupName --follow" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# Main Execution
# ============================================================================

try {
    Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   PortLink Orchestrator - Azure Deployment Script           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    Write-Info "Environment: $EnvironmentName"
    Write-Info "Location: $Location"
    Write-Info "Resource Group: $ResourceGroupName"
    
    if ($WhatIf) {
        Write-Warning "Running in WhatIf mode - no changes will be made"
    }
    
    # Execute deployment steps
    Test-Prerequisites
    New-ResourceGroup
    $outputs = Deploy-Infrastructure
    
    if (!$WhatIf) {
        Build-And-Push-Images -outputs $outputs
        Update-ContainerApps -outputs $outputs
        Show-DeploymentSummary -outputs $outputs
    }
    
} catch {
    Write-Error "Deployment failed: $_"
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
