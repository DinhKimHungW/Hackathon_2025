# ========================================
# PortLink DNS Setup Script
# Automatically configure local DNS for portlink.tech
# ========================================

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-NOT $isAdmin) {
    Write-Host ""
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run PowerShell as Administrator:" -ForegroundColor Yellow
    Write-Host "  1. Right-click PowerShell icon" -ForegroundColor Cyan
    Write-Host "  2. Select 'Run as Administrator'" -ForegroundColor Cyan
    Write-Host "  3. Navigate to this folder and run the script again" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PortLink DNS Configuration Tool            ║" -ForegroundColor Cyan
Write-Host "║   Setup local DNS for portlink.tech          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$localIP = "172.20.10.8"
$domain = "portlink.tech"
$wwwDomain = "www.portlink.tech"
$apiDomain = "api.portlink.tech"
$hostsFile = "C:\Windows\System32\drivers\etc\hosts"

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Local IP:  $localIP" -ForegroundColor White
Write-Host "  Domain:    $domain" -ForegroundColor White
Write-Host "  WWW:       $wwwDomain" -ForegroundColor White
Write-Host "  API:       $apiDomain" -ForegroundColor White
Write-Host ""

# Backup hosts file
Write-Host "📦 Backing up hosts file..." -ForegroundColor Yellow
$backupFile = "$hostsFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
try {
    Copy-Item $hostsFile $backupFile -ErrorAction Stop
    Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not create backup: $($_.Exception.Message)" -ForegroundColor Red
}

# Check if entries already exist
Write-Host ""
Write-Host "🔍 Checking existing entries..." -ForegroundColor Yellow
$existingContent = Get-Content $hostsFile
$hasPortLink = $existingContent | Select-String "portlink.tech"

if ($hasPortLink) {
    Write-Host "⚠️  PortLink entries already exist in hosts file!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Existing entries:" -ForegroundColor Cyan
    $existingContent | Select-String "portlink" | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    Write-Host ""
    
    $response = Read-Host "Do you want to remove old entries and add new ones? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        # Remove old entries
        Write-Host "🗑️  Removing old entries..." -ForegroundColor Yellow
        $newContent = $existingContent | Where-Object { $_ -notmatch "portlink" }
        Set-Content -Path $hostsFile -Value $newContent
        Write-Host "✅ Old entries removed" -ForegroundColor Green
    } else {
        Write-Host "❌ Operation cancelled by user" -ForegroundColor Red
        exit 0
    }
}

# Add new entries
Write-Host ""
Write-Host "➕ Adding DNS entries..." -ForegroundColor Yellow

$entries = @"

# ======================================================
# PortLink Orchestrator - Local DNS Configuration
# Added: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# ======================================================
$localIP $domain
$localIP $wwwDomain
$localIP $apiDomain
# ======================================================

"@

try {
    Add-Content -Path $hostsFile -Value $entries -ErrorAction Stop
    Write-Host "✅ DNS entries added successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add entries: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Flush DNS cache
Write-Host ""
Write-Host "🔄 Flushing DNS cache..." -ForegroundColor Yellow
try {
    ipconfig /flushdns | Out-Null
    Write-Host "✅ DNS cache flushed successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not flush DNS cache: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test DNS resolution
Write-Host ""
Write-Host "🧪 Testing DNS resolution..." -ForegroundColor Yellow
Write-Host ""

# Test ping
$pingResult = Test-Connection -ComputerName $domain -Count 1 -Quiet -ErrorAction SilentlyContinue
if ($pingResult) {
    Write-Host "✅ $domain resolves to correct IP" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not ping $domain (this is normal if server is not running)" -ForegroundColor Yellow
}

# Display results
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   DNS Configuration Complete! 🎉              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "You can now access PortLink using:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🌐 Frontend:  http://$domain:5173" -ForegroundColor Yellow
Write-Host "  🌐 WWW:       http://$wwwDomain:5173" -ForegroundColor Yellow
Write-Host "  🔌 Backend:   http://$domain:3000" -ForegroundColor Yellow
Write-Host "  🔌 API:       http://$apiDomain:3000/api/v1" -ForegroundColor Yellow
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Make sure backend and frontend are running" -ForegroundColor White
Write-Host "  2. Open browser and go to: http://$domain:5173" -ForegroundColor White
Write-Host "  3. For mobile devices, use DNS override apps:" -ForegroundColor White
Write-Host "     - Android: Virtual Hosts" -ForegroundColor Gray
Write-Host "     - iOS: DNSCloak" -ForegroundColor Gray
Write-Host ""

Write-Host "To verify, run:" -ForegroundColor Cyan
Write-Host "  ping $domain" -ForegroundColor White
Write-Host "  curl http://$domain:5173" -ForegroundColor White
Write-Host ""

# Optional: Test web access
$testWeb = Read-Host "Would you like to test web access now? (Y/N)"
if ($testWeb -eq 'Y' -or $testWeb -eq 'y') {
    Write-Host ""
    Write-Host "🌐 Testing frontend access..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://${domain}:5173" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is accessible at http://${domain}:5173" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Could not access frontend. Make sure it's running:" -ForegroundColor Red
        Write-Host "   cd frontend" -ForegroundColor Yellow
        Write-Host "   npm run dev" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🔌 Testing backend API..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://${domain}:3000/api/v1/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend API is accessible at http://${domain}:3000" -ForegroundColor Green
            Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Could not access backend API. Make sure it's running:" -ForegroundColor Red
        Write-Host "   cd backend" -ForegroundColor Yellow
        Write-Host "   npm run start:dev" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✨ Setup complete! Happy coding! 🚀" -ForegroundColor Green
Write-Host ""

# Keep window open
pause
