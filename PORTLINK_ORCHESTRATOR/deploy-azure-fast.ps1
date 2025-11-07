<#
.SYNOPSIS
  Fast deployment script to build backend and frontend Docker images, push them to Azure Container Registry (ACR),
  and create two App Services (Linux) that run the images from ACR.

USAGE
  Open a PowerShell terminal and run:
    powershell -ExecutionPolicy Bypass -File .\deploy-azure-fast.ps1

NOTES
  - Requires Azure CLI installed and you logged in (`az login`).
  - Requires Docker installed and running.
  - The script creates resources in the provided resource group and location. ACR name must be globally unique.
  - Frontend is built with VITE build args pointing to the backend app host (constructed deterministically).
#>

Set-StrictMode -Version Latest

function Validate-Command($cmd) {
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

if (-not (Validate-Command az)) {
    Write-Error "Azure CLI 'az' not found. Install Azure CLI and log in with 'az login'."
    exit 1
}

if (-not (Validate-Command docker)) {
    Write-Error "Docker CLI 'docker' not found. Install Docker Desktop and ensure docker is running."
    exit 1
}

# --- Defaults and prompts --------------------------------------------------
$defaultResourceGroup = "portlink-rg"
$defaultLocation = "eastus"
$resourceGroup = Read-Host "Resource group name (default: $defaultResourceGroup)"
if ([string]::IsNullOrWhiteSpace($resourceGroup)) { $resourceGroup = $defaultResourceGroup }

$location = Read-Host "Azure location (default: $defaultLocation)"
if ([string]::IsNullOrWhiteSpace($location)) { $location = $defaultLocation }

# ACR name must be globally unique, lowercase, alphanumeric
$suggestedAcr = ("portlinkacr" + (Get-Random -Minimum 1000 -Maximum 9999)).ToLower()
$acrName = Read-Host "ACR name (must be globally unique, default: $suggestedAcr)"
if ([string]::IsNullOrWhiteSpace($acrName)) { $acrName = $suggestedAcr }
$acrName = $acrName.ToLower()

# Build timestamp tag
$tag = (Get-Date -Format yyyyMMddHHmmss)

# Derived names
$backendAppName = "${resourceGroup}-backend-$tag"
$frontendAppName = "${resourceGroup}-frontend-$tag"
$planName = "${resourceGroup}-plan"

$backendImage = "portlink-backend"
$frontendImage = "portlink-frontend"

Write-Host "Using: ResourceGroup=$resourceGroup, Location=$location, ACR=$acrName, Tag=$tag"
Write-Host "Backend app name: $backendAppName"
Write-Host "Frontend app name: $frontendAppName"

Write-Host "You will be prompted for confirmation before resource creation. Press Enter to continue or Ctrl+C to abort."
Read-Host "Continue? (press Enter)"

# --- Create resource group -------------------------------------------------
Write-Host "Creating resource group (if not exists)..."
az group create --name $resourceGroup --location $location | Out-Null

# --- Create ACR -----------------------------------------------------------
Write-Host "Creating ACR '$acrName' (SKU Basic) with admin user enabled..."
az acr create --resource-group $resourceGroup --name $acrName --sku Basic --admin-enabled true --location $location | Out-Null

Write-Host "Retrieving ACR login server and credentials..."
$acrLoginServer = az acr show --name $acrName --resource-group $resourceGroup --query "loginServer" -o tsv
$acrCreds = az acr credential show --name $acrName --resource-group $resourceGroup -o json | ConvertFrom-Json
$acrAdminUser = $acrCreds.username
$acrAdminPassword = $acrCreds.passwords[0].value

if ([string]::IsNullOrWhiteSpace($acrLoginServer)) {
    Write-Error "Failed to get ACR login server. Aborting."
    exit 1
}

Write-Host "ACR login server: $acrLoginServer"

# --- Build images locally and tag for ACR -------------------------------
Write-Host "Building backend image and tagging as $acrLoginServer/$backendImage:$tag ..."
docker build -t "$acrLoginServer/$backendImage:$tag" ./backend
if ($LASTEXITCODE -ne 0) { Write-Error "Backend docker build failed"; exit 1 }

# Frontend needs API base URL baked in at build time. We'll point it to the future backend app host.
$backendHost = "https://$backendAppName.azurewebsites.net"
$apiBase = "$backendHost/api/v1"
$wsUrl = "wss://$backendAppName.azurewebsites.net"

Write-Host "Building frontend image (VITE_API_BASE_URL=$apiBase) and tagging as $acrLoginServer/$frontendImage:$tag ..."
docker build --build-arg VITE_API_BASE_URL=$apiBase --build-arg VITE_WS_URL=$wsUrl -t "$acrLoginServer/$frontendImage:$tag" ./frontend
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend docker build failed"; exit 1 }

# --- Push images to ACR --------------------------------------------------
Write-Host "Logging in to ACR..."
az acr login --name $acrName | Out-Null

Write-Host "Pushing backend image to ACR..."
docker push "$acrLoginServer/$backendImage:$tag"
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to push backend image"; exit 1 }

Write-Host "Pushing frontend image to ACR..."
docker push "$acrLoginServer/$frontendImage:$tag"
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to push frontend image"; exit 1 }

# --- Create App Service plan and Apps -----------------------------------
Write-Host "Creating App Service plan '$planName' (Linux, B1)..."
az appservice plan create --name $planName --resource-group $resourceGroup --is-linux --sku B1 | Out-Null

Write-Host "Creating backend Web App '$backendAppName'..."
az webapp create --resource-group $resourceGroup --plan $planName --name $backendAppName --deployment-container-image-name "$acrLoginServer/$backendImage:$tag" | Out-Null

Write-Host "Configuring backend Web App to pull from ACR..."
az webapp config container set --name $backendAppName --resource-group $resourceGroup --docker-custom-image-name "$acrLoginServer/$backendImage:$tag" --docker-registry-server-url "https://$acrLoginServer" --docker-registry-server-user $acrAdminUser --docker-registry-server-password $acrAdminPassword | Out-Null

Write-Host "Creating frontend Web App '$frontendAppName'..."
az webapp create --resource-group $resourceGroup --plan $planName --name $frontendAppName --deployment-container-image-name "$acrLoginServer/$frontendImage:$tag" | Out-Null

Write-Host "Configuring frontend Web App to pull from ACR..."
az webapp config container set --name $frontendAppName --resource-group $resourceGroup --docker-custom-image-name "$acrLoginServer/$frontendImage:$tag" --docker-registry-server-url "https://$acrLoginServer" --docker-registry-server-user $acrAdminUser --docker-registry-server-password $acrAdminPassword | Out-Null

# Optional: set environment variables for backend app (example)
Write-Host "Setting recommended app settings for backend (NODE_ENV=production, PORT=3000)..."
az webapp config appsettings set --name $backendAppName --resource-group $resourceGroup --settings NODE_ENV=production PORT=3000 | Out-Null

Write-Host "Deployment initiated. The apps may take a few minutes to start."
Write-Host "Backend URL: https://$backendAppName.azurewebsites.net"
Write-Host "Frontend URL: https://$frontendAppName.azurewebsites.net"

Write-Host "If apps fail to start, check container logs with: az webapp log tail --name <appName> --resource-group $resourceGroup"

Write-Host "Done."
