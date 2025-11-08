# 🌐 Quick DNS Setup for portlink.tech

## 🚀 Quick Start (5 minutes)

### Step 1: Run DNS Setup Script

```powershell
# Open PowerShell as Administrator (Right-click → Run as Administrator)
cd C:\Users\LENOVO\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR
.\setup-local-dns.ps1
```

**Script will:**
- ✅ Backup your hosts file
- ✅ Add portlink.tech → 172.20.10.8
- ✅ Flush DNS cache
- ✅ Test DNS resolution

### Step 2: Access the Application

Open browser and go to:
```
http://portlink.tech:5173
```

Login with:
- Email: `admin@catlai.com`
- Password: `Admin@2025`

---

## 📱 Mobile Device Setup

### Android
1. Install **"Virtual Hosts"** from Play Store
2. Add entry: `172.20.10.8  portlink.tech`
3. Enable Virtual Hosts
4. Open Chrome: `http://portlink.tech:5173`

### iOS
1. Install **"DNSCloak"** from App Store
2. Add mapping: `portlink.tech = 172.20.10.8`
3. Enable DNSCloak
4. Open Safari: `http://portlink.tech:5173`

---

## 🔧 Manual Setup (If script fails)

### Windows
```powershell
# Open Notepad as Administrator
notepad C:\Windows\System32\drivers\etc\hosts

# Add these lines at the end:
172.20.10.8 portlink.tech
172.20.10.8 www.portlink.tech
172.20.10.8 api.portlink.tech

# Save and close
# Flush DNS:
ipconfig /flushdns
```

### macOS / Linux
```bash
# Edit hosts file
sudo nano /etc/hosts

# Add these lines:
172.20.10.8 portlink.tech
172.20.10.8 www.portlink.tech
172.20.10.8 api.portlink.tech

# Save (Ctrl+O, Enter, Ctrl+X)
# Flush DNS:
sudo dscacheutil -flushcache  # macOS
sudo systemd-resolve --flush-caches  # Linux
```

---

## ✅ Verify Setup

```powershell
# Test DNS resolution
ping portlink.tech
# Should show: 172.20.10.8

# Test Frontend
curl http://portlink.tech:5173

# Test Backend
curl http://portlink.tech:3000/api/v1/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## 🌍 For Public Internet Access (Advanced)

See full guide: [DNS_CONFIGURATION_GUIDE.md](./DNS_CONFIGURATION_GUIDE.md)

**Requirements:**
1. Configure DNS A record at https://get.tech
2. Setup port forwarding on router
3. Get public IP or use Dynamic DNS
4. Update CORS and API URLs

---

## 🐛 Troubleshooting

### "Could not resolve host"
```powershell
ipconfig /flushdns
ping portlink.tech
```

### "Connection refused"
- ✅ Make sure backend is running on port 3000
- ✅ Make sure frontend is running on port 5173
- ✅ Check firewall ports are open

### "CORS error"
- ✅ Check backend/.env includes your domain in CORS_ORIGIN
- ✅ Restart backend after changing .env

### Mobile can't access
- ✅ Confirm same WiFi network
- ✅ Verify firewall rules
- ✅ Use DNS override app
- ✅ Try IP first: `http://172.20.10.8:5173`

---

## 📊 Access URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://portlink.tech:5173 | 5173 |
| Backend | http://portlink.tech:3000 | 3000 |
| API | http://portlink.tech:3000/api/v1 | 3000 |
| Health Check | http://portlink.tech:3000/api/v1/health | 3000 |

---

## 🎯 Current Configuration

**Network:**
- Local IP: `172.20.10.8`
- Domain: `portlink.tech`
- DNS Provider: get.tech

**CORS Enabled For:**
- http://localhost:5173
- http://172.20.10.8:5173
- http://portlink.tech:5173
- http://www.portlink.tech:5173

---

Need more help? Check [DNS_CONFIGURATION_GUIDE.md](./DNS_CONFIGURATION_GUIDE.md) for detailed instructions! 🚀
