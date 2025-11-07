# Deploy Backend to Azure App Service with npm install
param(
    [string]$ResourceGroup = "portlink-rg",
    [string]$AppName = "portlink-backend"
)

Write-Host "=== PortLink Backend Deployment Script ===" -ForegroundColor Green

# 1. Create deployment package with source code
Write-Host "`n1. Creating deployment package..." -ForegroundColor Cyan
$deployPath = "deploy-package"
if (Test-Path $deployPath) {
    Remove-Item -Path $deployPath -Recurse -Force
}
New-Item -ItemType Directory -Path $deployPath -Force | Out-Null

# Copy necessary files
Write-Host "   Copying files..." -ForegroundColor Gray
Copy-Item -Path "dist" -Destination "$deployPath/dist" -Recurse -Force
Copy-Item -Path "package.json" -Destination "$deployPath/" -Force
Copy-Item -Path "package-lock.json" -Destination "$deployPath/" -Force
Copy-Item -Path ".env.production" -Destination "$deployPath/.env" -Force

# Create web.config for Azure
$webConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/main.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^dist/main.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="dist/main.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
"@
$webConfig | Out-File -FilePath "$deployPath/web.config" -Encoding utf8 -Force

# Create .deployment file
$deployment = @"
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
ENABLE_ORYX_BUILD=true
"@
$deployment | Out-File -FilePath "$deployPath/.deployment" -Encoding utf8 -Force

# 2. Create zip package
Write-Host "`n2. Creating zip package..." -ForegroundColor Cyan
$zipFile = "backend-deploy.zip"
if (Test-Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}
Compress-Archive -Path "$deployPath/*" -DestinationPath $zipFile -Force
Write-Host "   Package created: $zipFile" -ForegroundColor Green

# 3. Deploy to Azure
Write-Host "`n3. Deploying to Azure App Service..." -ForegroundColor Cyan
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $AppName `
    --src $zipFile

# 4. Set startup command
Write-Host "`n4. Configuring startup command..." -ForegroundColor Cyan
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --startup-file "node dist/main.js"

# 5. Configure environment variables via Portal (since CLI doesn't work)
Write-Host "`n5. Opening Azure Portal for environment configuration..." -ForegroundColor Cyan
Write-Host "   Please add these environment variables in Azure Portal:" -ForegroundColor Yellow
Write-Host "   
   NODE_ENV=production
   PORT=8080
   DB_HOST=portlink-db.postgres.database.azure.com
   DB_PORT=5432
   DB_DATABASE=portlink_db
   DB_USERNAME=portlinkadmin
   DB_PASSWORD=<YOUR_DB_PASSWORD>
   REDIS_HOST=portlink-redis.redis.cache.windows.net
   REDIS_PORT=6380
   REDIS_PASSWORD=<YOUR_REDIS_PASSWORD>
   REDIS_TLS=true
   JWT_SECRET=<YOUR_JWT_SECRET>
   CORS_ORIGIN=https://portlink-frontend.azurewebsites.net
" -ForegroundColor White

$portalUrl = "https://portal.azure.com/#@/resource/subscriptions/72424bdf-d998-4235-b864-987cb70e7f04/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$AppName/configuration"
Start-Process $portalUrl

# 6. Restart app
Write-Host "`n6. Restarting application..." -ForegroundColor Cyan
az webapp restart --resource-group $ResourceGroup --name $AppName

# 7. Wait and test
Write-Host "`n7. Waiting for application to start (30 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host "`n8. Testing health endpoint..." -ForegroundColor Cyan
$healthUrl = "https://$AppName.azurewebsites.net/api/v1/health"
try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 10
    Write-Host "   Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Please check application logs in Azure Portal" -ForegroundColor Yellow
}

# Cleanup
Write-Host "`n9. Cleaning up..." -ForegroundColor Cyan
Remove-Item -Path $deployPath -Recurse -Force
Remove-Item -Path $zipFile -Force

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Backend URL: https://$AppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "Health Check: $healthUrl" -ForegroundColor Cyan
