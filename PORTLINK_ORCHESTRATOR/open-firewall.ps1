# Script để mở Firewall cho PortLink
# Chạy script này với quyền Administrator (Right-click -> Run as Administrator)

Write-Host "Opening firewall ports for PortLink..." -ForegroundColor Yellow

try {
    # Mở port 3000 cho Backend
    New-NetFirewallRule -DisplayName "PortLink Backend Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction Stop
    Write-Host "✓ Opened port 3000 for Backend" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to open port 3000: $_" -ForegroundColor Red
}

try {
    # Mở port 5173 cho Frontend
    New-NetFirewallRule -DisplayName "PortLink Frontend Port 5173" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -ErrorAction Stop
    Write-Host "✓ Opened port 5173 for Frontend" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to open port 5173: $_" -ForegroundColor Red
}

Write-Host "`nFirewall configuration completed!" -ForegroundColor Cyan
Write-Host "Your IP: 172.20.10.8" -ForegroundColor Yellow
Write-Host "Frontend URL: http://172.20.10.8:5173" -ForegroundColor Yellow
Write-Host "Backend URL: http://172.20.10.8:3000" -ForegroundColor Yellow

pause
