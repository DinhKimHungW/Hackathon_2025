# Fast Backend Deployment - Using existing dist
Write-Host "=== Fast Backend Deployment ===" -ForegroundColor Green

$ErrorActionPreference = "Stop"
Set-Location C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\backend

# 1. Verify dist exists
if (-not (Test-Path "dist")) {
    Write-Host "ERROR: dist folder not found! Building first..." -ForegroundColor Red
    npm run build
}

# 2. Create deployment package
Write-Host "`nCreating deployment package..." -ForegroundColor Cyan
$deployPath = "azure-deploy"
if (Test-Path $deployPath) {
    Remove-Item -Path $deployPath -Recurse -Force
}
New-Item -ItemType Directory -Path $deployPath -Force | Out-Null

# Copy files
Write-Host "  Copying dist..." -ForegroundColor Gray
Copy-Item -Path "dist" -Destination "$deployPath/dist" -Recurse -Force

Write-Host "  Copying node_modules..." -ForegroundColor Gray  
Copy-Item -Path "node_modules" -Destination "$deployPath/node_modules" -Recurse -Force

Copy-Item -Path "package.json" -Destination "$deployPath/" -Force
Copy-Item -Path "package-lock.json" -Destination "$deployPath/" -Force
Copy-Item -Path ".env.production" -Destination "$deployPath/.env" -Force

# 3. Zip
Write-Host "`nCreating zip..." -ForegroundColor Cyan
$zipFile = "backend-complete.zip"
if (Test-Path $zipFile) { Remove-Item -Path $zipFile -Force }
Compress-Archive -Path "$deployPath/*" -DestinationPath $zipFile -Force
Write-Host "  Size: $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB" -ForegroundColor Green

# 4. Deploy
Write-Host "`nDeploying to Azure..." -ForegroundColor Cyan
az webapp deploy --resource-group portlink-rg --name portlink-backend --src-path $zipFile --type zip --async false

# 5. Configure
Write-Host "`nConfiguring..." -ForegroundColor Cyan
az webapp config set --resource-group portlink-rg --name portlink-backend --startup-file "node dist/main.js"

# 6. Restart
Write-Host "`nRestarting..." -ForegroundColor Cyan
az webapp restart --resource-group portlink-rg --name portlink-backend

# 7. Test
Write-Host "`nWaiting 45s..." -ForegroundColor Cyan
Start-Sleep -Seconds 45

Write-Host "`nTesting health endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://portlink-backend.azurewebsites.net/api/v1/health" -UseBasicParsing -TimeoutSec 20
    Write-Host "SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Cleanup
Remove-Item -Path $deployPath -Recurse -Force
Remove-Item -Path $zipFile -Force

Write-Host "`nDone!" -ForegroundColor Green
