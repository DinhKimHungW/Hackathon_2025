# ✅ Demo Checklist - portlink.tech

## 📋 Pre-Demo Setup (Do Once)

### 1. DNS Configuration
```powershell
# Run as Administrator
cd C:\Users\LENOVO\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR
.\setup-local-dns.ps1
```

**Expected Result:**
- ✅ DNS entries added to hosts file
- ✅ DNS cache flushed
- ✅ Can ping portlink.tech → 172.20.10.8

### 2. Verify Firewall
```powershell
# Check firewall rules exist
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*PortLink*"}
```

**Expected Result:**
- ✅ PortLink Backend Port 3000 - Enabled
- ✅ PortLink Frontend Port 5173 - Enabled

### 3. Mobile Device Setup
**Android:**
- [ ] Install "Virtual Hosts" app
- [ ] Add: `172.20.10.8  portlink.tech`
- [ ] Enable Virtual Hosts

**iOS:**
- [ ] Install "DNSCloak" app
- [ ] Add: `portlink.tech = 172.20.10.8`
- [ ] Enable DNSCloak

---

## 🚀 Before Every Demo

### Step 1: Start Backend
```powershell
cd C:\Users\LENOVO\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\backend
npm run start:dev
```

**Wait for:**
```
╔═══════════════════════════════════════════════╗
║   PortLink Orchestrator API Server           ║
║   Server running on port: 3000                ║
║   Environment: development                      ║
╚═══════════════════════════════════════════════╝
```

### Step 2: Start Frontend
```powershell
cd C:\Users\LENOVO\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\frontend
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:5173/
➜  Network: http://172.20.10.8:5173/
```

### Step 3: Verify Services
```powershell
# Test Backend
curl http://portlink.tech:3000/api/v1/health

# Test Frontend
curl http://portlink.tech:5173
```

**Expected Results:**
- Backend: `{"status":"ok","timestamp":"..."}`
- Frontend: HTML content with "PortLink"

---

## 🎯 Demo Flow

### Option A: Using Custom Domain (Recommended)
1. Open browser
2. Go to: `http://portlink.tech:5173`
3. Login with:
   - Email: `admin@catlai.com`
   - Password: `Admin@2025`

### Option B: Using IP Address (Fallback)
1. Open browser
2. Go to: `http://172.20.10.8:5173`
3. Same login credentials

---

## 📱 Mobile Demo

### Setup (One Time)
1. Connect phone to same WiFi as laptop
2. Enable DNS override app
3. Verify connection: Open `http://portlink.tech:5173` in mobile browser

### During Demo
1. Show responsive design
2. Demonstrate touch-friendly UI
3. Show mobile-optimized features:
   - Large touch targets
   - Responsive typography
   - Bottom navigation
   - Swipe gestures

---

## 🔍 Quick Tests

### Backend Health
```powershell
curl http://portlink.tech:3000/api/v1/health
```
✅ Should return: `{"status":"ok"}`

### Frontend Access
```powershell
# Desktop
start http://portlink.tech:5173

# Or
Invoke-WebRequest http://portlink.tech:5173
```
✅ Should return: 200 OK

### DNS Resolution
```powershell
ping portlink.tech
nslookup portlink.tech
```
✅ Should show: 172.20.10.8

### CORS Headers
```powershell
$headers = @{
    "Origin" = "http://portlink.tech:5173"
    "Access-Control-Request-Method" = "POST"
}
Invoke-WebRequest -Uri "http://portlink.tech:3000/api/v1/auth/login" -Method OPTIONS -Headers $headers
```
✅ Should have: `Access-Control-Allow-Origin: http://portlink.tech:5173`

---

## 🐛 Troubleshooting During Demo

### DNS not working
```powershell
ipconfig /flushdns
ping portlink.tech
```

### Backend not responding
```powershell
# Check if running
Get-Process node

# Check port
netstat -an | Select-String "3000"

# Restart if needed
cd backend
npm run start:dev
```

### Frontend not loading
```powershell
# Check if running
netstat -an | Select-String "5173"

# Clear cache
Ctrl + Shift + R (in browser)

# Restart if needed
cd frontend
npm run dev
```

### CORS errors
```powershell
# Verify CORS config
cat backend\.env | Select-String "CORS"

# Should include: http://portlink.tech:5173
```

### Mobile can't access
1. ✅ Verify same WiFi network
2. ✅ Check DNS app is enabled
3. ✅ Try IP first: `http://172.20.10.8:5173`
4. ✅ Check firewall is not blocking

---

## 📊 Demo Accounts

### Admin Account (Full Access)
- Email: `admin@catlai.com`
- Password: `Admin@2025`
- Features: All modules

### Manager Account
- Email: `manager@catlai.com`
- Password: `Manager@2025`
- Features: Schedules, Tasks, Reports

### Operations Account
- Email: `operations@catlai.com`
- Password: `Operations@2025`
- Features: Ship Visits, Tasks, Assets

### Driver Account (Mobile Demo)
- Email: `driver@catlai.com`
- Password: `Driver@2025`
- Features: Assigned tasks, Mobile-optimized view

---

## 🎬 Demo Script

### 1. Login (30 seconds)
- Show domain: `portlink.tech:5173`
- Login as Admin
- Highlight clean, modern UI

### 2. Dashboard (1 minute)
- Overview of KPIs
- Active ship visits
- Pending tasks
- Recent activities

### 3. Ship Visits (2 minutes)
- View list of ships
- Show filters and search
- Open ship detail
- Demonstrate real-time updates

### 4. Schedules (2 minutes)
- Timeline view
- Gantt chart
- Resource allocation
- Conflict detection

### 5. Tasks Management (2 minutes)
- Kanban board
- Task assignment
- Progress tracking
- Mobile view

### 6. Conflicts & Simulation (2 minutes)
- Show detected conflicts
- Run "what-if" scenario
- Apply simulation results
- Show optimization

### 7. Mobile Demo (2 minutes)
- Login on phone
- Show responsive design
- Touch-friendly interface
- Offline capabilities (if available)

### 8. Analytics & Reports (1 minute)
- KPI charts
- Performance metrics
- Export capabilities

---

## 📸 Screenshots to Prepare

- [ ] Login page
- [ ] Dashboard overview
- [ ] Ship visits list
- [ ] Schedule timeline
- [ ] Task kanban board
- [ ] Conflict detection
- [ ] Mobile view
- [ ] Analytics charts

---

## 🎯 Key Talking Points

1. **Domain Setup**
   - "We've configured portlink.tech for easy access"
   - "Works on any device on the same network"

2. **Modern UI/UX**
   - "Clean, intuitive interface"
   - "Mobile-optimized for field operations"
   - "Touch-friendly, responsive design"

3. **Real-time Updates**
   - "WebSocket connections for live data"
   - "Instant notifications"
   - "Collaborative environment"

4. **Smart Features**
   - "AI-powered conflict detection"
   - "What-if simulation scenarios"
   - "Automated resource allocation"

5. **Scalability**
   - "Microservices architecture"
   - "RESTful API design"
   - "Database optimization"

---

## ⏱️ Timing Breakdown (15 min demo)

| Segment | Duration | Focus |
|---------|----------|-------|
| Intro & Login | 1 min | Domain, credentials |
| Dashboard | 2 min | Overview, KPIs |
| Ship Visits | 3 min | Core functionality |
| Schedules | 3 min | Resource management |
| Conflicts & AI | 3 min | Smart features |
| Mobile Demo | 2 min | Responsive design |
| Q&A Buffer | 1 min | Questions |

---

## ✅ Final Checklist Before Demo

**5 Minutes Before:**
- [ ] Backend is running
- [ ] Frontend is running
- [ ] DNS working (can access portlink.tech)
- [ ] Mobile connected and tested
- [ ] Demo accounts verified
- [ ] Browser cache cleared
- [ ] Backup tabs ready (IP address fallback)

**During Demo:**
- [ ] Screen sharing started
- [ ] Audio/video working
- [ ] Browser at portlink.tech:5173
- [ ] Mobile device ready
- [ ] Notes/script visible

**After Demo:**
- [ ] Answer questions
- [ ] Share documentation links
- [ ] Provide access credentials (if needed)
- [ ] Follow-up on feedback

---

## 🔗 Quick Reference URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://portlink.tech:5173 | Main application |
| Backend | http://portlink.tech:3000 | API server |
| API Docs | http://portlink.tech:3000/api/v1 | API endpoints |
| Health | http://portlink.tech:3000/api/v1/health | Server status |
| Fallback | http://172.20.10.8:5173 | Direct IP access |

---

Good luck with your demo! 🚀🎉
