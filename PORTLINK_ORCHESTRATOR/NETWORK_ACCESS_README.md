# 📱 Hướng dẫn truy cập PortLink từ Điện thoại

## ✅ Đã cấu hình xong!

### 📍 Thông tin mạng
- **IP máy tính:** `172.20.10.8`
- **Backend Port:** `3000`
- **Frontend Port:** `5173`

### 🔥 Bước 1: Mở Firewall (Cần quyền Admin)

**Cách 1:** Chạy script tự động
```powershell
# Mở PowerShell với quyền Administrator
# Right-click PowerShell -> Run as Administrator
cd C:\Users\LENOVO\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR
.\open-firewall.ps1
```

**Cách 2:** Chạy lệnh thủ công
```powershell
New-NetFirewallRule -DisplayName "PortLink Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "PortLink Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### 🔄 Bước 2: Khởi động lại Backend và Frontend

Backend và Frontend cần được restart để áp dụng cấu hình mới:

**Backend:**
```powershell
cd C:\Users\LENOVO\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\backend
npm run start:dev
```

**Frontend:**
```powershell
cd C:\Users\LENOVO\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\frontend
npm run dev
```

### 🌐 Bước 3: URL truy cập

#### Từ máy tính (localhost):
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

#### Từ điện thoại (cùng WiFi):
- Frontend: **http://172.20.10.8:5173**
- Backend: **http://172.20.10.8:3000**

### 👤 Tài khoản đăng nhập

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@catlai.com | Admin@2025 |
| Manager | manager@catlai.com | Manager@2025 |
| Operations | ops@catlai.com | Ops@2025 |
| Driver | driver@catlai.com | Driver@2025 |

### 🔍 Kiểm tra kết nối

Từ điện thoại, mở trình duyệt và truy cập:
```
http://172.20.10.8:3000/api/v1/health
```

Nếu thấy `{"status":"ok"}` nghĩa là đã kết nối thành công! ✅

### 📝 Các file đã được cấu hình:

✅ `backend/.env` - Đã thêm HOST=0.0.0.0 và CORS_ORIGIN  
✅ `frontend/.env.development` - Đã cập nhật API_URL sang IP mạng  
✅ `frontend/vite.config.ts` - Đã thêm host: '0.0.0.0'  

### ⚠️ Lưu ý quan trọng:

1. **Máy tính và điện thoại phải cùng mạng WiFi**
2. **Firewall phải được mở** (cần quyền Administrator)
3. **Backend và Frontend phải đang chạy**
4. **Nếu đổi mạng WiFi, IP có thể thay đổi** - cần check lại bằng `ipconfig`

### 🎯 Domain portlink.tech (Tùy chọn)

Nếu muốn dùng domain `portlink.tech` thay vì IP:

**Android (không cần root):**
1. Cài app **Virtual Hosts** từ Play Store
2. Thêm entry: `172.20.10.8 portlink.tech`
3. Truy cập: `http://portlink.tech:5173`

**iPhone:**
1. Cài app **DNSCloak** từ App Store
2. Cấu hình custom DNS với entry: `172.20.10.8 portlink.tech`
3. Truy cập: `http://portlink.tech:5173`

---

## 🚀 Quick Start

```powershell
# 1. Mở Firewall (PowerShell as Administrator)
.\open-firewall.ps1

# 2. Start Backend
cd backend
npm run start:dev

# 3. Start Frontend (terminal mới)
cd frontend
npm run dev

# 4. Truy cập từ điện thoại
# http://172.20.10.8:5173
```

---

✨ **Hoàn tất!** Bây giờ bạn có thể truy cập PortLink từ điện thoại!
