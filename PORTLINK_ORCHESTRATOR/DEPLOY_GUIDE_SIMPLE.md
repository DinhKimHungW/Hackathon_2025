# PORTLINK - Hướng dẫn Deploy lên Azure (Đơn giản nhất)

## Bạn đã có sẵn:
- portlink-rg
- portlink-db  
- portlink-redis

## CHẠY TỪNG LỆNH SAU (Copy & Paste vào PowerShell):

### Bước 1: Set thông tin cơ bản
```powershell
$rg = "portlink-rg"
$app = "portlink"
$dbPassword = Read-Host "Nhap mat khau database" -AsSecureString
$dbPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
```

### Bước 2: Lấy Redis password
```powershell
$redisPass = az redis list-keys --resource-group $rg --name portlink-redis --query primaryKey -o tsv
```

### Bước 3: Tạo App Service Plan
```powershell
az appservice plan create --name portlink-plan --resource-group $rg --location southeastasia --sku B1 --is-linux
```

### Bước 4: Tạo Backend
```powershell
az webapp create --resource-group $rg --plan portlink-plan --name portlink-backend --runtime NODE:20-lts
```

### Bước 5: Config Backend
```powershell
az webapp config appsettings set --resource-group $rg --name portlink-backend --settings NODE_ENV=production PORT=8080 DB_HOST=portlink-db.postgres.database.azure.com DB_PORT=5432 DB_USER=portlinkadmin "DB_PASSWORD=$dbPass" DB_NAME=portlink_db REDIS_HOST=portlink-redis.redis.cache.windows.net REDIS_PORT=6380 "REDIS_PASSWORD=$redisPass" "JWT_SECRET=$(New-Guid)" JWT_EXPIRES_IN=1d CORS_ORIGIN=https://portlink-frontend.azurewebsites.net
```

### Bước 6: Deploy Backend
```powershell
cd backend
Compress-Archive * deploy.zip -Force
az webapp deployment source config-zip --resource-group $rg --name portlink-backend --src deploy.zip
Remove-Item deploy.zip
cd ..
```

### Bước 7: Tạo Frontend
```powershell
az webapp create --resource-group $rg --plan portlink-plan --name portlink-frontend --runtime NODE:20-lts
```

### Bước 8: Config Frontend
```powershell
az webapp config appsettings set --resource-group $rg --name portlink-frontend --settings VITE_API_BASE_URL=https://portlink-backend.azurewebsites.net/api/v1 VITE_WS_URL=wss://portlink-backend.azurewebsites.net
```

### Bước 9: Build & Deploy Frontend
```powershell
cd frontend
$env:VITE_API_BASE_URL = "https://portlink-backend.azurewebsites.net/api/v1"
$env:VITE_WS_URL = "wss://portlink-backend.azurewebsites.net"
npm install
npm run build
cd dist
Compress-Archive * ../deploy.zip -Force
cd ..
az webapp deployment source config-zip --resource-group $rg --name portlink-frontend --src deploy.zip
Remove-Item deploy.zip
cd ..
```

### Bước 10: XONG!
```powershell
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT HOAN TAT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Frontend: https://portlink-frontend.azurewebsites.net" -ForegroundColor Yellow
Write-Host "Backend:  https://portlink-backend.azurewebsites.net" -ForegroundColor Yellow
Write-Host "Login:    admin@portlink.com / Admin@123" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Green
```

## TẤT CẢ TRONG 1 FILE

Tạo file `deploy.ps1`:
```powershell
$rg = "portlink-rg"
$dbPass = Read-Host "Database password"
$redisPass = az redis list-keys -g $rg -n portlink-redis --query primaryKey -o tsv

az appservice plan create -n portlink-plan -g $rg -l southeastasia --sku B1 --is-linux
az webapp create -g $rg -p portlink-plan -n portlink-backend -r NODE:20-lts
az webapp config appsettings set -g $rg -n portlink-backend --settings NODE_ENV=production PORT=8080 DB_HOST=portlink-db.postgres.database.azure.com DB_PORT=5432 DB_USER=portlinkadmin "DB_PASSWORD=$dbPass" DB_NAME=portlink_db REDIS_HOST=portlink-redis.redis.cache.windows.net REDIS_PORT=6380 "REDIS_PASSWORD=$redisPass" "JWT_SECRET=$(New-Guid)" JWT_EXPIRES_IN=1d CORS_ORIGIN=https://portlink-frontend.azurewebsites.net

cd backend
Compress-Archive * deploy.zip -Force
az webapp deployment source config-zip -g $rg -n portlink-backend --src deploy.zip
Remove-Item deploy.zip
cd ..

az webapp create -g $rg -p portlink-plan -n portlink-frontend -r NODE:20-lts
az webapp config appsettings set -g $rg -n portlink-frontend --settings VITE_API_BASE_URL=https://portlink-backend.azurewebsites.net/api/v1 VITE_WS_URL=wss://portlink-backend.azurewebsites.net

cd frontend
$env:VITE_API_BASE_URL = "https://portlink-backend.azurewebsites.net/api/v1"
$env:VITE_WS_URL = "wss://portlink-backend.azurewebsites.net"
npm install
npm run build
cd dist
Compress-Archive * ../deploy.zip -Force
cd ..
az webapp deployment source config-zip -g $rg -n portlink-frontend --src deploy.zip
Remove-Item deploy.zip
cd ..

Write-Host "`nDONE! https://portlink-frontend.azurewebsites.net" -ForegroundColor Green
```

Chạy: `.\deploy.ps1`
