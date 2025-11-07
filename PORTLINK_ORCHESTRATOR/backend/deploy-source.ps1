# Deploy Backend Source Code to Azure (let Azure build it)
Write-Host "=== Deploying Backend Source Code ===" -ForegroundColor Green

# 1. Create package with source
Write-Host "`n1. Packaging source code..." -ForegroundColor Cyan
$deployPath = "deploy-source"
if (Test-Path $deployPath) { Remove-Item -Path $deployPath -Recurse -Force }
New-Item -ItemType Directory -Path $deployPath -Force | Out-Null

# Copy source files
Copy-Item -Path "src" -Destination "$deployPath/src" -Recurse -Force
Copy-Item -Path "package.json" -Destination "$deployPath/" -Force
Copy-Item -Path "package-lock.json" -Destination "$deployPath/" -Force
Copy-Item -Path "tsconfig.json" -Destination "$deployPath/" -Force
Copy-Item -Path "tsconfig.build.json" -Destination "$deployPath/" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "nest-cli.json" -Destination "$deployPath/" -Force
Copy-Item -Path ".env.production" -Destination "$deployPath/.env" -Force

# Create .deployment config
@"
[config]
command = bash -c "npm install && npm run build && node dist/main.js"
"@ | Out-File -FilePath "$deployPath/.deployment" -Encoding utf8 -Force

# 2. Zip it
Write-Host "`n2. Creating zip..." -ForegroundColor Cyan
$zipFile = "backend-source.zip"
if (Test-Path $zipFile) { Remove-Item -Path $zipFile -Force }
Compress-Archive -Path "$deployPath/*" -DestinationPath $zipFile -Force

# 3. Deploy
Write-Host "`n3. Deploying to Azure..." -ForegroundColor Cyan
az webapp deploy -g portlink-rg -n portlink-backend --src-path $zipFile --type zip --async true

Write-Host "`n4. Waiting 60 seconds for build..." -ForegroundColor Cyan
Start-Sleep -Seconds 60

# 5. Test
Write-Host "`n5. Testing..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://portlink-backend.azurewebsites.net/api/v1/health" -UseBasicParsing -TimeoutSec 15
    Write-Host "   SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Remove-Item -Path $deployPath -Recurse -Force
Remove-Item -Path $zipFile -Force

Write-Host "`nDone!" -ForegroundColor Green
