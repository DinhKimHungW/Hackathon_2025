# 🌐 DNS Configuration Guide for portlink.tech

## 📋 Overview
Hướng dẫn cấu hình DNS cho domain **portlink.tech** trỏ về server local để truy cập từ mọi thiết bị.

---

## 🔑 Thông tin cấu hình

### Server Information
- **Local IP:** `172.20.10.8`
- **Domain:** `portlink.tech`
- **Frontend Port:** `5173`
- **Backend Port:** `3000`
- **DNS Provider:** get.tech

### Target URLs
- Frontend: `http://portlink.tech:5173`
- Backend API: `http://portlink.tech:3000`
- Alternative: `http://www.portlink.tech:5173`

---

## 🌍 Option 1: Public DNS Configuration (Recommended for Production)

### Prerequisites
✅ Domain đã đăng ký tại get.tech
✅ Có public IP hoặc sử dụng Dynamic DNS
✅ Router hỗ trợ port forwarding

### Steps:

#### 1. Get Public IP Address
```powershell
# Kiểm tra Public IP của bạn
Invoke-WebRequest -Uri "https://api.ipify.org?format=json" | Select-Object -ExpandProperty Content
```

#### 2. Configure DNS at get.tech

Đăng nhập vào https://get.tech và thêm các DNS records:

**A Records:**
```
Type    Name    Value           TTL
A       @       [YOUR_PUBLIC_IP]  3600
A       www     [YOUR_PUBLIC_IP]  3600
A       api     [YOUR_PUBLIC_IP]  3600
```

**CNAME Records (Optional):**
```
Type    Name        Value               TTL
CNAME   frontend    portlink.tech       3600
CNAME   backend     portlink.tech       3600
```

#### 3. Router Port Forwarding

Cấu hình router để forward ports từ public IP về local IP:

```
External Port → Internal IP:Port
5173         → 172.20.10.8:5173  (Frontend)
3000         → 172.20.10.8:3000  (Backend)
80           → 172.20.10.8:5173  (HTTP)
443          → 172.20.10.8:5173  (HTTPS - optional)
```

**Truy cập router:**
1. Mở `http://192.168.1.1` (hoặc IP gateway của router)
2. Đăng nhập với admin credentials
3. Tìm mục "Port Forwarding" hoặc "Virtual Server"
4. Thêm rules như trên

#### 4. Update Backend CORS

File: `backend/.env`
```env
CORS_ORIGIN=http://localhost:5173,http://172.20.10.8:5173,http://portlink.tech,http://portlink.tech:5173,http://www.portlink.tech:5173
```

#### 5. Update Frontend API URL

File: `frontend/.env.development`
```env
VITE_API_URL=http://portlink.tech:3000/api/v1
VITE_WS_URL=ws://portlink.tech:3000
VITE_WEBSOCKET_URL=ws://portlink.tech:3000
```

---

## 🏠 Option 2: Local Network DNS (Recommended for Development)

### For Same WiFi Network Only

#### 1. Configure Local DNS on Router

**Method A: Router DNS Settings**
1. Truy cập router admin (`http://192.168.1.1`)
2. Tìm "DNS Settings" hoặc "Local DNS"
3. Thêm entry:
   ```
   portlink.tech → 172.20.10.8
   www.portlink.tech → 172.20.10.8
   ```

**Method B: Pi-hole / Local DNS Server**
Nếu bạn có Pi-hole hoặc DNS server local:
```bash
# Add to /etc/pihole/custom.list or dnsmasq
172.20.10.8 portlink.tech
172.20.10.8 www.portlink.tech
172.20.10.8 api.portlink.tech
```

#### 2. Device-Specific Configuration

**Windows (máy server):**
```powershell
# Add to hosts file
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n172.20.10.8 portlink.tech`n172.20.10.8 www.portlink.tech"
```

**macOS / Linux:**
```bash
# Add to hosts file
echo "172.20.10.8 portlink.tech" | sudo tee -a /etc/hosts
echo "172.20.10.8 www.portlink.tech" | sudo tee -a /etc/hosts
```

**Android:**
1. Cài app "Virtual Hosts" từ Play Store
2. Add entries:
   ```
   172.20.10.8 portlink.tech
   172.20.10.8 www.portlink.tech
   ```
3. Enable Virtual Hosts

**iOS:**
1. Cài app "DNSCloak" hoặc "DNS Override"
2. Add custom DNS mappings:
   ```
   portlink.tech → 172.20.10.8
   www.portlink.tech → 172.20.10.8
   ```

---

## 🔧 Option 3: Dynamic DNS (For Home Network)

### Using No-IP or DuckDNS

#### 1. Register Dynamic DNS
- **No-IP:** https://www.noip.com/
- **DuckDNS:** https://www.duckdns.org/

Tạo hostname như: `portlink.duckdns.org`

#### 2. Install DDNS Client
```powershell
# Windows - Download No-IP DUC
# Or use scheduled task to update IP

# Create PowerShell script: update-ddns.ps1
$publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
Invoke-WebRequest -Uri "https://duckdns.org/update?domains=portlink&token=YOUR_TOKEN&ip=$publicIP"
```

#### 3. Schedule Task
```powershell
# Run every 5 minutes
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\Scripts\update-ddns.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName "UpdateDDNS" -Action $action -Trigger $trigger
```

#### 4. Configure DNS CNAME at get.tech
```
Type    Name    Value                   TTL
CNAME   @       portlink.duckdns.org    3600
CNAME   www     portlink.duckdns.org    3600
```

---

## 📱 Mobile Device Configuration (Fastest Method)

### Android
**App: Virtual Hosts (FREE)**
1. Install from Play Store
2. Add entries:
   ```
   172.20.10.8  portlink.tech
   172.20.10.8  www.portlink.tech
   172.20.10.8  api.portlink.tech
   ```
3. Enable "Virtual Hosts"
4. Open Chrome: `http://portlink.tech:5173`

### iOS
**App: DNSCloak (FREE)**
1. Install from App Store
2. Configure DNS Override:
   ```
   portlink.tech = 172.20.10.8
   www.portlink.tech = 172.20.10.8
   ```
3. Enable DNSCloak
4. Open Safari: `http://portlink.tech:5173`

**Alternative: Surge (Paid)**
```
[Host]
portlink.tech = 172.20.10.8
www.portlink.tech = 172.20.10.8
```

---

## 🚀 Quick Start Script

Tôi đã tạo script tự động để cấu hình DNS local:

### Windows Script: `setup-local-dns.ps1`
```powershell
# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Please run as Administrator!"
    exit
}

# Variables
$localIP = "172.20.10.8"
$domain = "portlink.tech"
$wwwDomain = "www.portlink.tech"
$hostsFile = "C:\Windows\System32\drivers\etc\hosts"

# Backup hosts file
Copy-Item $hostsFile "$hostsFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Add entries
$entries = @"

# PortLink Configuration - Added $(Get-Date)
$localIP $domain
$localIP $wwwDomain
$localIP api.$domain
"@

Add-Content -Path $hostsFile -Value $entries

Write-Host "✅ DNS entries added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now access:" -ForegroundColor Cyan
Write-Host "  Frontend: http://$domain:5173" -ForegroundColor Yellow
Write-Host "  Backend:  http://$domain:3000" -ForegroundColor Yellow
Write-Host "  API:      http://api.$domain:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Testing DNS resolution..." -ForegroundColor Cyan

# Test DNS
$result = Resolve-DnsName $domain -ErrorAction SilentlyContinue
if ($result) {
    Write-Host "✅ DNS resolution working!" -ForegroundColor Green
} else {
    Write-Host "❌ DNS resolution failed. Try flushing DNS cache:" -ForegroundColor Red
    Write-Host "   ipconfig /flushdns" -ForegroundColor Yellow
}
```

**Run:**
```powershell
# Save script and run as Administrator
cd C:\Users\LENOVO\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR
.\setup-local-dns.ps1
```

---

## 🧪 Testing DNS Configuration

### 1. Test DNS Resolution
```powershell
# Windows
nslookup portlink.tech
ping portlink.tech

# Should show: 172.20.10.8
```

### 2. Test Web Access
```powershell
# Test Frontend
curl http://portlink.tech:5173

# Test Backend
curl http://portlink.tech:3000/api/v1/health
```

### 3. Browser Test
Open browser and go to:
- `http://portlink.tech:5173` - Should load login page
- `http://www.portlink.tech:5173` - Same as above

---

## 🔍 Troubleshooting

### DNS not resolving
```powershell
# Flush DNS cache
ipconfig /flushdns

# Check hosts file
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "portlink"

# Check if DNS server is responding
nslookup portlink.tech 8.8.8.8
```

### Can't access from mobile
1. ✅ Confirm mobile is on same WiFi
2. ✅ Check if mobile can ping server: `ping 172.20.10.8`
3. ✅ Verify firewall ports are open
4. ✅ Use mobile DNS override app
5. ✅ Try direct IP first: `http://172.20.10.8:5173`

### CORS errors
```powershell
# Verify backend CORS includes domain
cat backend\.env | Select-String "CORS_ORIGIN"

# Should include: http://portlink.tech:5173
```

### Port not accessible
```powershell
# Check if ports are listening
netstat -an | Select-String "3000|5173"

# Should show:
# TCP    0.0.0.0:3000    LISTENING
# TCP    0.0.0.0:5173    LISTENING
```

---

## 📊 Configuration Matrix

| Scenario | Method | Complexity | Access Scope |
|----------|--------|------------|--------------|
| Local Dev | Hosts File | Easy ⭐ | Local machine only |
| Team Dev | Router DNS | Medium ⭐⭐ | Same WiFi network |
| Mobile Only | DNS Override App | Easy ⭐ | Per device |
| Production | Public DNS + Port Forward | Hard ⭐⭐⭐ | Internet |
| Home Server | Dynamic DNS + CNAME | Medium ⭐⭐ | Internet |

---

## 🎯 Recommended Setup

### For Hackathon Demo (Same WiFi):
1. ✅ Configure hosts file on demo laptop
2. ✅ Use DNS override app on mobile devices
3. ✅ Keep using `172.20.10.8` as fallback

### For Production (Internet Access):
1. ✅ Get static IP or use Dynamic DNS
2. ✅ Configure public DNS at get.tech
3. ✅ Setup port forwarding on router
4. ✅ Add SSL certificate (Let's Encrypt)
5. ✅ Use Cloudflare as CDN/proxy

---

## 📝 Summary

**Fastest for Demo (5 minutes):**
```powershell
# On Windows (Run as Admin)
Add-Content C:\Windows\System32\drivers\etc\hosts "`n172.20.10.8 portlink.tech"
ipconfig /flushdns

# On Mobile
Install "Virtual Hosts" app → Add entry → Enable
```

**For Production (1-2 hours):**
1. Configure DNS A record at get.tech
2. Setup port forwarding on router
3. Update CORS and API URLs
4. Test from external network

---

## 🔗 Useful Links

- **get.tech Dashboard:** https://get.tech/dashboard
- **DNS Propagation Check:** https://dnschecker.org
- **What's My IP:** https://www.whatismyip.com
- **Port Checker:** https://www.yougetsignal.com/tools/open-ports/
- **Virtual Hosts (Android):** https://play.google.com/store/apps/details?id=com.github.xfalcon.vhosts
- **DNSCloak (iOS):** https://apps.apple.com/app/dnscloak/id1452162351

---

## ✅ Next Steps

1. **Immediate (Demo):**
   - [ ] Run setup-local-dns.ps1
   - [ ] Install DNS override app on mobile
   - [ ] Test access from mobile

2. **Short-term (This week):**
   - [ ] Get public IP or setup DDNS
   - [ ] Configure port forwarding
   - [ ] Update DNS at get.tech

3. **Long-term (Production):**
   - [ ] Setup SSL certificate
   - [ ] Use Cloudflare
   - [ ] Remove port numbers (use 80/443)
   - [ ] Setup proper reverse proxy (Nginx/Caddy)

---

Need help? Contact your network admin or check router documentation! 🚀
