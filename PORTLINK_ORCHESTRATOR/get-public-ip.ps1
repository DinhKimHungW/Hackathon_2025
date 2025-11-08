# Script to get your public IP address

Write-Host "🔍 Checking your Public IP Address..." -ForegroundColor Cyan
Write-Host ""

try {
    $publicIP = Invoke-RestMethod -Uri "https://api.ipify.org?format=text"
    Write-Host "✅ Your Public IP Address: $publicIP" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Use this IP for DNS A Record on get.tech:" -ForegroundColor Yellow
    Write-Host "   Type: A" -ForegroundColor White
    Write-Host "   Host: @" -ForegroundColor White
    Write-Host "   Value: $publicIP" -ForegroundColor Green
    Write-Host "   TTL: 3600" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Add DNS A Record on get.tech with IP: $publicIP" -ForegroundColor White
    Write-Host "   2. Configure Port Forwarding on your Router:" -ForegroundColor White
    Write-Host "      - Port 80 (HTTP) → 172.20.10.8:5173" -ForegroundColor White
    Write-Host "      - Port 3000 (API) → 172.20.10.8:3000" -ForegroundColor White
    Write-Host "   3. Configure reverse proxy (nginx/caddy) for HTTPS" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get public IP: $_" -ForegroundColor Red
}
