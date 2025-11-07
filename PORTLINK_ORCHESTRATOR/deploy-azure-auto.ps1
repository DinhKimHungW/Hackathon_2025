#!/usr/bin/env pwsh
# ============================================================================
# PORTLINK ORCHESTRATOR - AZURE AUTO DEPLOYMENT SCRIPT
# ============================================================================
# Script tự động deploy toàn bộ dự án lên Azure
# Chạy lệnh: .\deploy-azure-auto.ps1
# ============================================================================

param(
    [string]$Location = "southeastasia",  # Vị trí gần VN nhất
    [string]$AppName = "portlink-$(Get-Random -Maximum 9999)"  # Tên app unique
)

$ErrorActionPreference = "Stop"

# Màu sắc cho output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Step($message) {
    Write-ColorOutput Cyan "`n========================================`n$message`n========================================"
}

function Write-Success($message) {
    Write-ColorOutput Green "✓ $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "✗ $message"
}

# ============================================================================
# BƯỚC 1: KIỂM TRA REQUIREMENTS
# ============================================================================
Write-Step "BƯỚC 1: Kiểm tra requirements"

try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Success "Azure CLI đã cài đặt: $($azVersion.'azure-cli')"
} catch {
    Write-Error "Azure CLI chưa được cài đặt. Vui lòng cài đặt từ: https://aka.ms/installazurecliwindows"
    exit 1
}

# Kiểm tra đăng nhập
Write-Host "Kiểm tra đăng nhập Azure..."
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Chưa đăng nhập Azure. Đang mở trình duyệt để đăng nhập..."
    az login
    $account = az account show | ConvertFrom-Json
}
Write-Success "Đã đăng nhập: $($account.user.name)"
Write-Success "Subscription: $($account.name)"

# ============================================================================
# BƯỚC 2: TẠO RESOURCE GROUP
# ============================================================================
Write-Step "BƯỚC 2: Tạo Resource Group"

$resourceGroup = "$AppName-rg"
Write-Host "Tạo Resource Group: $resourceGroup tại $Location..."
az group create --name $resourceGroup --location $Location --output none
Write-Success "Resource Group đã tạo: $resourceGroup"

# ============================================================================
# BƯỚC 3: TẠO POSTGRESQL DATABASE
# ============================================================================
Write-Step "BƯỚC 3: Tạo PostgreSQL Database"

$dbServerName = "$AppName-db"
$dbAdminUser = "portlinkadmin"
$dbAdminPassword = -join ((65..90) + (97..122) + (48..57) + 33,35,36,37,38,42,43,45,61,63,64 | Get-Random -Count 16 | ForEach-Object {[char]$_})
$dbName = "portlink_db"

Write-Host "Tạo PostgreSQL Server: $dbServerName..."
Write-Host "Đợi 2-3 phút để Azure tạo database..."

az postgres flexible-server create `
    --resource-group $resourceGroup `
    --name $dbServerName `
    --location $Location `
    --admin-user $dbAdminUser `
    --admin-password $dbAdminPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --storage-size 32 `
    --version 16 `
    --public-access All `
    --yes `
    --output none

Write-Success "PostgreSQL Server đã tạo"

# Tạo database
Write-Host "Tạo database: $dbName..."
az postgres flexible-server db create `
    --resource-group $resourceGroup `
    --server-name $dbServerName `
    --database-name $dbName `
    --output none

Write-Success "Database đã tạo: $dbName"

# Lấy connection string
$dbHost = "$dbServerName.postgres.database.azure.com"
$dbConnectionString = "postgresql://${dbAdminUser}:${dbAdminPassword}@${dbHost}:5432/${dbName}?sslmode=require"

# ============================================================================
# BƯỚC 4: TẠO REDIS CACHE
# ============================================================================
Write-Step "BƯỚC 4: Tạo Redis Cache"

$redisName = "$AppName-redis"
Write-Host "Tạo Redis Cache: $redisName..."
Write-Host "Đợi 5-10 phút để Azure tạo Redis (có thể đi uống nước)..."

az redis create `
    --resource-group $resourceGroup `
    --name $redisName `
    --location $Location `
    --sku Basic `
    --vm-size c0 `
    --enable-non-ssl-port false `
    --output none

Write-Success "Redis Cache đã tạo"

# Lấy Redis keys
$redisKeys = az redis list-keys `
    --resource-group $resourceGroup `
    --name $redisName | ConvertFrom-Json

$redisHost = "$redisName.redis.cache.windows.net"
$redisPassword = $redisKeys.primaryKey

# ============================================================================
# BƯỚC 5: TẠO APP SERVICE PLAN
# ============================================================================
Write-Step "BƯỚC 5: Tạo App Service Plan"

$appServicePlan = "$AppName-plan"
Write-Host "Tạo App Service Plan: $appServicePlan..."

az appservice plan create `
    --name $appServicePlan `
    --resource-group $resourceGroup `
    --location $Location `
    --sku B1 `
    --is-linux `
    --output none

Write-Success "App Service Plan đã tạo"

# ============================================================================
# BƯỚC 6: TẠO BACKEND WEB APP
# ============================================================================
Write-Step "BƯỚC 6: Tạo Backend Web App"

$backendAppName = "$AppName-backend"
Write-Host "Tạo Backend Web App: $backendAppName..."

az webapp create `
    --resource-group $resourceGroup `
    --plan $appServicePlan `
    --name $backendAppName `
    --runtime "NODE:20-lts" `
    --output none

Write-Success "Backend Web App đã tạo"

# Generate JWT secrets
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Cấu hình Environment Variables cho Backend
Write-Host "Cấu hình environment variables..."
az webapp config appsettings set `
    --resource-group $resourceGroup `
    --name $backendAppName `
    --settings `
        NODE_ENV=production `
        PORT=8080 `
        DB_HOST=$dbHost `
        DB_PORT=5432 `
        DB_USER=$dbAdminUser `
        DB_PASSWORD=$dbAdminPassword `
        DB_NAME=$dbName `
        REDIS_HOST=$redisHost `
        REDIS_PORT=6380 `
        REDIS_PASSWORD=$redisPassword `
        JWT_SECRET=$jwtSecret `
        JWT_EXPIRES_IN=1d `
        JWT_REFRESH_SECRET=$jwtRefreshSecret `
        JWT_REFRESH_EXPIRES_IN=7d `
        CORS_ORIGIN="https://$AppName-frontend.azurewebsites.net" `
        SCM_DO_BUILD_DURING_DEPLOYMENT=true `
    --output none

Write-Success "Environment variables đã cấu hình"

# ============================================================================
# BƯỚC 7: DEPLOY BACKEND CODE
# ============================================================================
Write-Step "BƯỚC 7: Deploy Backend Code"

Write-Host "Đang nén và upload backend code..."
Push-Location backend

# Tạo file .deployment để chỉ định build command
@"
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT = true
"@ | Out-File -FilePath .deployment -Encoding utf8

# Tạo startup script
@"
npm install --production
npm run build
npm run migration:run
node dist/main.js
"@ | Out-File -FilePath startup.sh -Encoding utf8

# Deploy bằng zip
Write-Host "Đang build và deploy backend... (3-5 phút)"
az webapp deployment source config-zip `
    --resource-group $resourceGroup `
    --name $backendAppName `
    --src (Get-Location).Path `
    --timeout 600 `
    --output none 2>$null

Pop-Location
Write-Success "Backend đã deploy"

$backendUrl = "https://$backendAppName.azurewebsites.net"
Write-Success "Backend URL: $backendUrl"

# ============================================================================
# BƯỚC 8: TẠO FRONTEND WEB APP
# ============================================================================
Write-Step "BƯỚC 8: Tạo Frontend Web App"

$frontendAppName = "$AppName-frontend"
Write-Host "Tạo Frontend Web App: $frontendAppName..."

az webapp create `
    --resource-group $resourceGroup `
    --plan $appServicePlan `
    --name $frontendAppName `
    --runtime "NODE:20-lts" `
    --output none

Write-Success "Frontend Web App đã tạo"

# Cấu hình environment cho Frontend
az webapp config appsettings set `
    --resource-group $resourceGroup `
    --name $frontendAppName `
    --settings `
        VITE_API_BASE_URL="$backendUrl/api/v1" `
        VITE_WS_URL="wss://$backendAppName.azurewebsites.net" `
        SCM_DO_BUILD_DURING_DEPLOYMENT=true `
    --output none

# ============================================================================
# BƯỚC 9: DEPLOY FRONTEND CODE
# ============================================================================
Write-Step "BƯỚC 9: Deploy Frontend Code"

Write-Host "Đang build và deploy frontend..."
Push-Location frontend

# Tạo .deployment file
@"
[config]
command = npm install && npm run build
"@ | Out-File -FilePath .deployment -Encoding utf8

# Tạo web.config cho serving SPA
@"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
"@ | Out-File -FilePath web.config -Encoding utf8

# Build frontend locally
Write-Host "Building frontend locally..."
npm install --silent
$env:VITE_API_BASE_URL = "$backendUrl/api/v1"
$env:VITE_WS_URL = "wss://$backendAppName.azurewebsites.net"
npm run build

# Deploy dist folder
Write-Host "Deploying frontend... (2-3 phút)"
Compress-Archive -Path dist\* -DestinationPath frontend-deploy.zip -Force
az webapp deployment source config-zip `
    --resource-group $resourceGroup `
    --name $frontendAppName `
    --src frontend-deploy.zip `
    --output none

Remove-Item frontend-deploy.zip
Pop-Location

Write-Success "Frontend đã deploy"

$frontendUrl = "https://$frontendAppName.azurewebsites.net"
Write-Success "Frontend URL: $frontendUrl"

# ============================================================================
# BƯỚC 10: RUN DATABASE MIGRATIONS & SEED DATA
# ============================================================================
Write-Step "BƯỚC 10: Setup Database"

Write-Host "Chờ backend khởi động (30 giây)..."
Start-Sleep -Seconds 30

Write-Host "Chạy database migrations..."
az webapp ssh --resource-group $resourceGroup --name $backendAppName --command "cd /home/site/wwwroot && npm run migration:run" 2>$null

Write-Host "Seed demo data..."
az webapp ssh --resource-group $resourceGroup --name $backendAppName --command "cd /home/site/wwwroot && npm run seed:demo" 2>$null

Write-Success "Database đã setup"

# ============================================================================
# BƯỚC 11: RESTART APPS
# ============================================================================
Write-Step "BƯỚC 11: Restart Apps"

Write-Host "Restarting backend..."
az webapp restart --resource-group $resourceGroup --name $backendAppName --output none

Write-Host "Restarting frontend..."
az webapp restart --resource-group $resourceGroup --name $frontendAppName --output none

Start-Sleep -Seconds 10
Write-Success "Apps đã restart"

# ============================================================================
# HOÀN THÀNH - XUẤT THÔNG TIN
# ============================================================================
Write-Step "🎉 DEPLOYMENT HOÀN TẤT 🎉"

$deploymentInfo = @"

╔════════════════════════════════════════════════════════════════╗
║            PORTLINK ORCHESTRATOR - DEPLOYED TO AZURE           ║
╚════════════════════════════════════════════════════════════════╝

📦 RESOURCE GROUP
   └─ $resourceGroup

🌐 APPLICATIONS
   ├─ Frontend:  $frontendUrl
   └─ Backend:   $backendUrl

🗄️  DATABASE
   ├─ Server:    $dbHost
   ├─ Database:  $dbName
   ├─ User:      $dbAdminUser
   └─ Password:  $dbAdminPassword

🔴 REDIS
   ├─ Host:      $redisHost
   ├─ Port:      6380 (SSL)
   └─ Password:  $redisPassword

🔐 JWT SECRETS
   ├─ Secret:         $jwtSecret
   └─ Refresh Secret: $jwtRefreshSecret

📝 DEFAULT LOGIN
   ├─ Email:    admin@portlink.com
   └─ Password: Admin@123

════════════════════════════════════════════════════════════════

🚀 CÁCH SỬ DỤNG:
   1. Mở browser và truy cập: $frontendUrl
   2. Login với tài khoản admin ở trên
   3. Khám phá hệ thống!

📊 QUẢN LÝ RESOURCES:
   └─ Azure Portal: https://portal.azure.com/#@/resource/subscriptions/$($account.id)/resourceGroups/$resourceGroup

💰 CHI PHÍ ƯỚC TÍNH:
   ├─ App Service Plan (B1):  ~$13/tháng
   ├─ PostgreSQL (B1ms):      ~$12/tháng  
   ├─ Redis (C0):             ~$16/tháng
   └─ TỔNG:                   ~$41/tháng

🗑️  XÓA TẤT CẢ (khi không dùng nữa):
   └─ az group delete --name $resourceGroup --yes

════════════════════════════════════════════════════════════════

"@

Write-ColorOutput Green $deploymentInfo

# Lưu thông tin vào file
$deploymentInfo | Out-File -FilePath "AZURE_DEPLOYMENT_INFO.txt" -Encoding utf8
Write-Success "Thông tin đã lưu vào: AZURE_DEPLOYMENT_INFO.txt"

# Mở browser tự động
Write-Host "`nBạn có muốn mở ứng dụng trong browser không? (Y/N): " -NoNewline
$openBrowser = Read-Host
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process $frontendUrl
    Write-Success "Đã mở browser!"
}

Write-ColorOutput Cyan "`n✨ Chúc bạn sử dụng vui vẻ! ✨`n"
