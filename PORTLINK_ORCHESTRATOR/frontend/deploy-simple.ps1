$ErrorActionPreference = "Stop"

Write-Host "`n=== Deploying Frontend to Azure ===" -ForegroundColor Cyan

# Paths
$distPath = "C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\frontend\dist"
$zipPath = "C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\frontend\frontend-tar.zip"

# Create zip using tar
Write-Host "Creating zip with tar..." -ForegroundColor Yellow
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Push-Location $distPath
tar -a -c -f $zipPath *
Pop-Location

Write-Host "Zip created: $zipPath" -ForegroundColor Green
Write-Host "Size: $((Get-Item $zipPath).Length / 1KB) KB" -ForegroundColor Yellow

# Get credentials
Write-Host "`nGetting deployment credentials..." -ForegroundColor Yellow
$xml = az webapp deployment list-publishing-profiles --resource-group portlink-rg --name portlink-frontend --xml
$pub = [xml]$xml
$cred = $pub.publishData.publishProfile | Where-Object { $_.publishMethod -eq 'MSDeploy' } | Select-Object -First 1

$username = $cred.userName
$password = $cred.userPWD

# Upload via Kudu API
Write-Host "Uploading to Kudu..." -ForegroundColor Yellow
$kuduUrl = "https://portlink-frontend.scm.azurewebsites.net/api/zipdeploy"
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${username}:${password}"))

$headers = @{ Authorization = "Basic $auth" }

Invoke-RestMethod -Uri $kuduUrl -Method Post -InFile $zipPath -Headers $headers -ContentType "application/zip" -TimeoutSec 300 | Out-Null

Write-Host "Upload complete!" -ForegroundColor Green

# Restart
Write-Host "`nRestarting app..." -ForegroundColor Yellow
az webapp restart --resource-group portlink-rg --name portlink-frontend --output none

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "URL: https://portlink-frontend.azurewebsites.net`n" -ForegroundColor Cyan
