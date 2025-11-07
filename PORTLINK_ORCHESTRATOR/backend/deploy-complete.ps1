# Complete Backend Deployment - Deploy ONLY dist folder with node_modules
Write-Host "=== Complete Backend Deployment ===" -ForegroundColor Green

$ErrorActionPreference = "Stop"

# 1. Build locally
Write-Host "`n1. Building application locally..." -ForegroundColor Cyan
Set-Location C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\backend

if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "   Running build..." -ForegroundColor Yellow
npx nest build

# 2. Create deployment package
Write-Host "`n2. Creating deployment package..." -ForegroundColor Cyan
$deployPath = "azure-deploy"
if (Test-Path $deployPath) {
    Remove-Item -Path $deployPath -Recurse -Force
}
New-Item -ItemType Directory -Path $deployPath -Force | Out-Null

# Copy built files
Write-Host "   Copying dist folder..." -ForegroundColor Gray
Copy-Item -Path "dist" -Destination "$deployPath/dist" -Recurse -Force

# Copy dependencies
Write-Host "   Copying node_modules (this may take a while)..." -ForegroundColor Gray  
Copy-Item -Path "node_modules" -Destination "$deployPath/node_modules" -Recurse -Force

# Copy config files
Copy-Item -Path "package.json" -Destination "$deployPath/" -Force
Copy-Item -Path "package-lock.json" -Destination "$deployPath/" -Force
Copy-Item -Path ".env.production" -Destination "$deployPath/.env" -Force

# 3. Create startup script
Write-Host "   Creating startup script..." -ForegroundColor Gray
@"
#!/bin/sh
cd /home/site/wwwroot
export NODE_ENV=production
export PORT=8080
node dist/main.js
"@ | Out-File -FilePath "$deployPath/startup.sh" -Encoding utf8 -Force -NoNewline

# 4. Zip package
Write-Host "`n3. Creating zip package..." -ForegroundColor Cyan
$zipFile = "backend-complete.zip"
if (Test-Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}
Compress-Archive -Path "$deployPath/*" -DestinationPath $zipFile -Force
$zipSize = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)
Write-Host "   Package size: $zipSize MB" -ForegroundColor Green

# 5. Deploy to Azure
Write-Host "`n4. Deploying to Azure..." -ForegroundColor Cyan
az webapp deploy `
    --resource-group portlink-rg `
    --name portlink-backend `
    --src-path $zipFile `
    --type zip `
    --async false

# 6. Configure startup
Write-Host "`n5. Configuring startup command..." -ForegroundColor Cyan
az webapp config set `
    --resource-group portlink-rg `
    --name portlink-backend `
    --startup-file "node dist/main.js"

# 7. Restart
Write-Host "`n6. Restarting application..." -ForegroundColor Cyan
az webapp restart --resource-group portlink-rg --name portlink-backend

# 8. Wait and test
Write-Host "`n7. Waiting 45 seconds for startup..." -ForegroundColor Cyan
Start-Sleep -Seconds 45

Write-Host "`n8. Testing health endpoint..." -ForegroundColor Cyan
$healthUrl = "https://portlink-backend.azurewebsites.net/api/v1/health"
try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 20
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    
    Write-Host "`n=== DEPLOYMENT SUCCESSFUL ===" -ForegroundColor Green
    Write-Host "Backend URL: https://portlink-backend.azurewebsites.net" -ForegroundColor Cyan
    Write-Host "Health Check: $healthUrl" -ForegroundColor Cyan
} catch {
    Write-Host "   FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`nPlease check logs at:" -ForegroundColor Yellow
    Write-Host "https://portlink-backend.scm.azurewebsites.net/api/logstream" -ForegroundColor Cyan
}

# 9. Cleanup
Write-Host "`n9. Cleaning up..." -ForegroundColor Cyan
Remove-Item -Path $deployPath -Recurse -Force
Remove-Item -Path $zipFile -Force

Write-Host "`nDone!" -ForegroundColor Green
