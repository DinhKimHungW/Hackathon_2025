# PORTLINK - Quick Deploy to Azure# PORTLINK ORCHESTRATOR - QUICK DEPLOY

# Uses existing portlink-rg, portlink-db, portlink-redis# Using existing Database and Redis resources

# Run: .\deploy-quick.ps1

param(

    [string]$ResourceGroup = "portlink-rg",param(

    [string]$AppName = "portlink",    [string]$ResourceGroup = "portlink-rg",

    [string]$Location = "southeastasia"    [string]$AppName = "portlink",

)    [string]$Location = "southeastasia"

)

$ErrorActionPreference = "Stop"

$ErrorActionPreference = "Stop"

function Write-Step($msg) {

    Write-Host "`n======================================" -ForegroundColor Cyanfunction Write-Step($message) {

    Write-Host $msg -ForegroundColor Cyan    Write-Host "`n========================================" -ForegroundColor Cyan

    Write-Host "======================================`n" -ForegroundColor Cyan    Write-Host $message -ForegroundColor Cyan

}    Write-Host "========================================`n" -ForegroundColor Cyan

}

function Write-OK($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Yellow }function Write-Success($message) {

    Write-Host "[OK] $message" -ForegroundColor Green

# Step 1: Get resources}

Write-Step "Step 1: Get existing resources"

function Write-Info($message) {

$dbInfo = az postgres flexible-server show --resource-group $ResourceGroup --name portlink-db --output json | ConvertFrom-Json    Write-Host "[INFO] $message" -ForegroundColor Yellow

$dbHost = $dbInfo.fullyQualifiedDomainName}

Write-OK "Database: $dbHost"

# Get Database info

$databases = az postgres flexible-server db list --resource-group $ResourceGroup --server-name portlink-db --output json | ConvertFrom-JsonWrite-Step "Step 1: Get existing resources info"

$dbName = ($databases | Where-Object { $_.name -ne "azure_maintenance" } | Select-Object -First 1).name

if (-not $dbName) {Write-Host "Getting PostgreSQL info..."

    $dbName = "portlink_db"$dbInfo = az postgres flexible-server show --resource-group $ResourceGroup --name portlink-db --output json | ConvertFrom-Json

    az postgres flexible-server db create --resource-group $ResourceGroup --server-name portlink-db --database-name $dbName --output none$dbHost = $dbInfo.fullyQualifiedDomainName

}Write-Success "Database: $dbHost"

Write-OK "Database: $dbName"

$databases = az postgres flexible-server db list --resource-group $ResourceGroup --server-name portlink-db --output json | ConvertFrom-Json

$redisInfo = az redis show --resource-group $ResourceGroup --name portlink-redis --output json | ConvertFrom-Json$dbName = ($databases | Where-Object { $_.name -ne "azure_maintenance" } | Select-Object -First 1).name

$redisHost = $redisInfo.hostNameif (-not $dbName) {

$redisPort = $redisInfo.sslPort    $dbName = "portlink_db"

$redisKeys = az redis list-keys --resource-group $ResourceGroup --name portlink-redis --output json | ConvertFrom-Json    Write-Info "Creating database: $dbName"

$redisPassword = $redisKeys.primaryKey    az postgres flexible-server db create --resource-group $ResourceGroup --server-name portlink-db --database-name $dbName --output none

Write-OK "Redis: $redisHost"}

Write-Success "Database name: $dbName"

# Step 2: Credentials

Write-Step "Step 2: Enter Database Password"# Get Redis info

Write-Host "Getting Redis info..."

$dbUser = Read-Host "Database username (default: portlinkadmin)"$redisInfo = az redis show --resource-group $ResourceGroup --name portlink-redis --output json | ConvertFrom-Json

if (-not $dbUser) { $dbUser = "portlinkadmin" }$redisHost = $redisInfo.hostName

$redisPort = $redisInfo.sslPort

$dbPasswordSecure = Read-Host "Database password" -AsSecureStringWrite-Success "Redis: $redisHost port $redisPort"

$dbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPasswordSecure))

$redisKeys = az redis list-keys --resource-group $ResourceGroup --name portlink-redis --output json | ConvertFrom-Json

# Step 3: App Service Plan$redisPassword = $redisKeys.primaryKey

Write-Step "Step 3: Create App Service Plan"

# Get Database credentials

$planName = "$AppName-plan"Write-Step "Step 2: Database Credentials"

$plan = az appservice plan show --name $planName --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-Json

Write-Host "Enter PostgreSQL credentials:"

if (-not $plan) {$dbUser = Read-Host "Database username (default: portlinkadmin)"

    az appservice plan create --name $planName --resource-group $ResourceGroup --location $Location --sku B1 --is-linux --output noneif (-not $dbUser) { $dbUser = "portlinkadmin" }

    Write-OK "Plan created"

} else {$dbPasswordSecure = Read-Host "Database password" -AsSecureString

    Write-OK "Plan exists"$dbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPasswordSecure))

}

if (-not $dbPassword) {

# Step 4: Backend    Write-Error "Database password is required!"

Write-Step "Step 4: Deploy Backend"    exit 1

}

$backendApp = "$AppName-backend"

$backend = az webapp show --name $backendApp --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-JsonWrite-Success "Credentials configured"



if (-not $backend) {# Create App Service Plan

    az webapp create --resource-group $ResourceGroup --plan $planName --name $backendApp --runtime "NODE:20-lts" --output noneWrite-Step "Step 3: App Service Plan"

    Write-OK "Backend created"

} else {$planName = "$AppName-plan"

    Write-OK "Backend exists"$existingPlan = az appservice plan show --name $planName --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-Json

}

if (-not $existingPlan) {

$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})    Write-Host "Creating App Service Plan: $planName..."

$jwtRefresh = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})    az appservice plan create --name $planName --resource-group $ResourceGroup --location $Location --sku B1 --is-linux --output none

    Write-Success "App Service Plan created"

az webapp config appsettings set --resource-group $ResourceGroup --name $backendApp --settings NODE_ENV=production PORT=8080 DB_HOST=$dbHost DB_PORT=5432 DB_USER=$dbUser DB_PASSWORD=$dbPassword DB_NAME=$dbName REDIS_HOST=$redisHost REDIS_PORT=$redisPort REDIS_PASSWORD=$redisPassword JWT_SECRET=$jwtSecret JWT_EXPIRES_IN=1d JWT_REFRESH_SECRET=$jwtRefresh JWT_REFRESH_EXPIRES_IN=7d "CORS_ORIGIN=https://$AppName-frontend.azurewebsites.net" SCM_DO_BUILD_DURING_DEPLOYMENT=true --output none} else {

    Write-Success "App Service Plan exists: $planName"

Write-Host "Deploying backend code..."}

cd backend

"[config]`ncommand = npm install && npm run build" | Out-File .deployment -Encoding utf8# Create Backend Web App

$zip = "deploy-$(Get-Date -Format 'yyyyMMddHHmmss').zip"Write-Step "Step 4: Deploy Backend"

Get-ChildItem -Exclude node_modules,dist,.git | Compress-Archive -DestinationPath $zip -Force

az webapp deployment source config-zip --resource-group $ResourceGroup --name $backendApp --src $zip --timeout 600 --output none$backendAppName = "$AppName-backend"

Remove-Item $zip$existingBackend = az webapp show --name $backendAppName --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-Json

cd ..

if (-not $existingBackend) {

$backendUrl = "https://$backendApp.azurewebsites.net"    Write-Host "Creating Backend Web App: $backendAppName..."

Write-OK "Backend deployed: $backendUrl"    az webapp create --resource-group $ResourceGroup --plan $planName --name $backendAppName --runtime "NODE:20-lts" --output none

    Write-Success "Backend Web App created"

# Step 5: Frontend} else {

Write-Step "Step 5: Deploy Frontend"    Write-Success "Backend Web App exists: $backendAppName"

}

$frontendApp = "$AppName-frontend"

$frontend = az webapp show --name $frontendApp --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-Json# Generate JWT secrets

$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

if (-not $frontend) {$jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

    az webapp create --resource-group $ResourceGroup --plan $planName --name $frontendApp --runtime "NODE:20-lts" --output none

    Write-OK "Frontend created"# Configure environment variables

} else {Write-Host "Configuring environment variables..."

    Write-OK "Frontend exists"az webapp config appsettings set --resource-group $ResourceGroup --name $backendAppName --settings NODE_ENV=production PORT=8080 DB_HOST=$dbHost DB_PORT=5432 DB_USER=$dbUser DB_PASSWORD=$dbPassword DB_NAME=$dbName REDIS_HOST=$redisHost REDIS_PORT=$redisPort REDIS_PASSWORD=$redisPassword JWT_SECRET=$jwtSecret JWT_EXPIRES_IN=1d JWT_REFRESH_SECRET=$jwtRefreshSecret JWT_REFRESH_EXPIRES_IN=7d CORS_ORIGIN="https://$AppName-frontend.azurewebsites.net,http://localhost:5173" SCM_DO_BUILD_DURING_DEPLOYMENT=true --output none

}

Write-Success "Environment configured"

az webapp config appsettings set --resource-group $ResourceGroup --name $frontendApp --settings "VITE_API_BASE_URL=$backendUrl/api/v1" "VITE_WS_URL=wss://$backendApp.azurewebsites.net" --output none

# Deploy backend code

Write-Host "Building frontend..."Write-Host "Deploying backend code (5-8 minutes)..."

cd frontendPush-Location backend

$env:VITE_API_BASE_URL = "$backendUrl/api/v1"

$env:VITE_WS_URL = "wss://$backendApp.azurewebsites.net"'[config]

npm install --silent 2>$nullcommand = npm install && npm run build' | Out-File -FilePath .deployment -Encoding utf8

npm run build 2>$null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$zip = "deploy-$(Get-Date -Format 'yyyyMMddHHmmss').zip"$zipFile = "backend-$timestamp.zip"

Compress-Archive -Path dist\* -DestinationPath $zip -Force

az webapp deployment source config-zip --resource-group $ResourceGroup --name $frontendApp --src $zip --output noneGet-ChildItem -Path . -Exclude node_modules,dist,.git | Compress-Archive -DestinationPath $zipFile -Force

Remove-Item $zip

cd ..az webapp deployment source config-zip --resource-group $ResourceGroup --name $backendAppName --src $zipFile --timeout 600 --output none



$frontendUrl = "https://$frontendApp.azurewebsites.net"Remove-Item $zipFile

Write-OK "Frontend deployed: $frontendUrl"Pop-Location



# Step 6: RestartWrite-Success "Backend deployed"

Write-Step "Step 6: Restart Apps"$backendUrl = "https://$backendAppName.azurewebsites.net"

az webapp restart --resource-group $ResourceGroup --name $backendApp --output noneWrite-Success "Backend URL: $backendUrl"

az webapp restart --resource-group $ResourceGroup --name $frontendApp --output none

Start-Sleep -Seconds 5# Create Frontend Web App

Write-Step "Step 5: Deploy Frontend"

# Done

Write-Step "DEPLOYMENT COMPLETED!"$frontendAppName = "$AppName-frontend"

$existingFrontend = az webapp show --name $frontendAppName --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-Json

@"

if (-not $existingFrontend) {

========================================    Write-Host "Creating Frontend Web App: $frontendAppName..."

PORTLINK DEPLOYED TO AZURE    az webapp create --resource-group $ResourceGroup --plan $planName --name $frontendAppName --runtime "NODE:20-lts" --output none

========================================    Write-Success "Frontend Web App created"

} else {

Frontend: $frontendUrl    Write-Success "Frontend Web App exists: $frontendAppName"

Backend:  $backendUrl}



Database: $dbHost/$dbName# Configure environment

Redis:    $redisHostaz webapp config appsettings set --resource-group $ResourceGroup --name $frontendAppName --settings VITE_API_BASE_URL="$backendUrl/api/v1" VITE_WS_URL="wss://$backendAppName.azurewebsites.net" --output none



Default Login:# Build and deploy frontend

  Email:    admin@portlink.comWrite-Host "Building frontend locally..."

  Password: Admin@123Push-Location frontend



========================================$env:VITE_API_BASE_URL = "$backendUrl/api/v1"

$env:VITE_WS_URL = "wss://$backendAppName.azurewebsites.net"

"@ | Tee-Object -FilePath "AZURE_DEPLOYMENT_INFO.txt"

Write-Host "npm install..."

Write-OK "Info saved to: AZURE_DEPLOYMENT_INFO.txt"npm install --silent 2>$null

Write-Host "`nOpen browser? (Y/N): " -NoNewline -ForegroundColor Yellow

if ((Read-Host) -match "^y") {Write-Host "npm run build..."

    Start-Process $frontendUrlnpm run build 2>$null

}

'npm install -g serve
serve -s dist -l 8080' | Out-File -FilePath dist/startup.sh -Encoding utf8

$zipFile = "frontend-$timestamp.zip"
Compress-Archive -Path dist\* -DestinationPath $zipFile -Force

Write-Host "Uploading frontend (2-3 minutes)..."
az webapp deployment source config-zip --resource-group $ResourceGroup --name $frontendAppName --src $zipFile --output none

Remove-Item $zipFile
Pop-Location

Write-Success "Frontend deployed"
$frontendUrl = "https://$frontendAppName.azurewebsites.net"
Write-Success "Frontend URL: $frontendUrl"

# Restart apps
Write-Step "Step 6: Restart Apps"

Write-Host "Restarting backend..."
az webapp restart --resource-group $ResourceGroup --name $backendAppName --output none

Write-Host "Restarting frontend..."
az webapp restart --resource-group $ResourceGroup --name $frontendAppName --output none

Start-Sleep -Seconds 10

# Done
Write-Step "DEPLOYMENT COMPLETED"

$info = @"

=============================================================
PORTLINK - DEPLOYED TO AZURE
=============================================================

APPLICATIONS
- Frontend:  $frontendUrl
- Backend:   $backendUrl

DATABASE (Existing)
- Server:    $dbHost
- Database:  $dbName
- User:      $dbUser

REDIS (Existing)
- Host:      $redisHost
- Port:      $redisPort

JWT SECRETS (New)
- Secret:         $jwtSecret
- Refresh Secret: $jwtRefreshSecret

DEFAULT LOGIN
- Email:    admin@portlink.com
- Password: Admin@123

=============================================================

USAGE:
1. Wait 2-3 minutes for backend to run migrations
2. Open: $frontendUrl
3. Login with admin account

MANAGE:
- Portal: https://portal.azure.com

MANUAL MIGRATIONS (if needed):
1. Go to Azure Portal
2. Open App Service: $backendAppName
3. SSH -> Console
4. Run: cd /home/site/wwwroot && npm run migration:run
5. Run: npm run seed:demo

DELETE APPS (keep DB and Redis):
- az webapp delete --name $backendAppName --resource-group $ResourceGroup
- az webapp delete --name $frontendAppName --resource-group $ResourceGroup
- az appservice plan delete --name $planName --resource-group $ResourceGroup

=============================================================

"@

Write-Host $info -ForegroundColor Green

$info | Out-File -FilePath "AZURE_DEPLOYMENT_INFO.txt" -Encoding utf8
Write-Success "Info saved: AZURE_DEPLOYMENT_INFO.txt"

Write-Host "`nOpen browser? (Y/N): " -NoNewline -ForegroundColor Yellow
$openBrowser = Read-Host
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process $frontendUrl
    Write-Success "Browser opened!"
}

Write-Host "`nDeployment completed successfully!`n" -ForegroundColor Cyan
