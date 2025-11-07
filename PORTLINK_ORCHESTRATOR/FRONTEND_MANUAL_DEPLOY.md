# 🚀 HƯỚNG DẪN DEPLOY FRONTEND - MANUAL VIA KUDU

## ✅ Chuẩn bị sẵn sàng
- Frontend đã build thành công: `frontend/dist/`
- File cần deploy: Tất cả files trong thư mục `dist`

## 📋 BƯỚC DEPLOY (5-10 PHÚT)

### Bước 1: Mở Kudu Console
1. Mở browser và truy cập:
   ```
   https://portlink-frontend.scm.azurewebsites.net
   ```

2. Đăng nhập bằng Azure credentials của bạn

### Bước 2: Vào Debug Console
1. Click vào menu **"Debug console"** ở thanh menu trên
2. Chọn **"CMD"** hoặc **"PowerShell"**

### Bước 3: Navigate tới wwwroot
1. Trong console, gõ lệnh:
   ```bash
   cd site\wwwroot
   ```

2. Xóa các files cũ (nếu có):
   ```bash
   del *.* /Q
   rd /s /q assets
   ```

### Bước 4: Upload Files
**Phương pháp 1: Drag & Drop (KHUYẾN NGHỊ)**
1. Mở File Explorer trên máy của bạn
2. Navigate đến: `C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\frontend\dist`
3. Chọn **TẤT CẢ** files và folders trong `dist` (Ctrl+A)
4. Kéo thả (drag & drop) vào cửa sổ Kudu file manager (phần dưới của màn hình)
5. Đợi upload hoàn tất

**Phương pháp 2: Upload từng file**
- Click nút **"+"** để upload từng file
- Hoặc kéo thả từng file/folder

### Bước 5: Verify Files
Kiểm tra các files sau đã được upload:
- ✅ `index.html`
- ✅ `package.json` 
- ✅ Folder `assets/` (chứa tất cả JS, CSS files)
- ✅ Các files khác (nếu có)

### Bước 6: Configure App Settings
**Option A: Via Azure Portal**
1. Mở Azure Portal: https://portal.azure.com
2. Tìm Resource Group: `portlink-rg`
3. Click vào `portlink-frontend`
4. Vào **Configuration** > **General settings**
5. **Startup Command**: Nhập:
   ```
   npx --yes serve@latest -s . -p 8080 -n
   ```
6. Click **Save**

**Option B: Via PowerShell** (Nhanh hơn)
Mở PowerShell và chạy:
```powershell
az webapp config set `
  --resource-group portlink-rg `
  --name portlink-frontend `
  --startup-file "npx --yes serve@latest -s . -p 8080 -n"
```

### Bước 7: Restart App
**Via Azure Portal:**
1. Vào `portlink-frontend` trong Portal
2. Click **Restart** ở menu trên
3. Đợi 30-60 giây

**Via PowerShell:**
```powershell
az webapp restart --resource-group portlink-rg --name portlink-frontend
```

### Bước 8: Test Frontend
1. Mở browser và truy cập:
   ```
   https://portlink-frontend.azurewebsites.net
   ```

2. Bạn sẽ thấy giao diện PortLink!

## 🔧 TROUBLESHOOTING

### Lỗi: "Application Error"
**Giải pháp:**
1. Kiểm tra startup command đã set chưa
2. Restart app
3. Xem logs:
   ```powershell
   az webapp log tail -g portlink-rg -n portlink-frontend
   ```

### Lỗi: Blank page hoặc 404
**Giải pháp:**
1. Verify file `index.html` đã upload chưa
2. Kiểm tra folder `assets` có đầy đủ files không
3. Clear browser cache (Ctrl+Shift+R)

### Lỗi: Cannot connect to backend
**Giải pháp:** Cần cập nhật backend URL trong environment variables
```powershell
az webapp config appsettings set `
  --resource-group portlink-rg `
  --name portlink-frontend `
  --settings `
    VITE_API_BASE_URL="https://portlink-backend.azurewebsites.net" `
    VITE_WS_URL="wss://portlink-backend.azurewebsites.net"
```

**LƯU Ý:** Frontend đã build với env variables, nên không cần set lại trừ khi backend URL thay đổi.

## 📊 VERIFY DEPLOYMENT

### Kiểm tra các URL sau hoạt động:
- ✅ Homepage: https://portlink-frontend.azurewebsites.net
- ✅ Login: https://portlink-frontend.azurewebsites.net/login
- ✅ Dashboard: https://portlink-frontend.azurewebsites.net/dashboard

### Kiểm tra Network Tab (F12):
1. Mở DevTools (F12)
2. Vào tab Network
3. Refresh page
4. Verify các files được load:
   - `index.html` (200)
   - `assets/*.js` (200)
   - `assets/*.css` (200)

## 🎯 BƯỚC TIẾP THEO

Sau khi frontend deploy xong:

### 1. Kiểm tra Backend
```powershell
# Xem backend status
az webapp show -g portlink-rg -n portlink-backend --query "state" -o tsv

# Test API
curl https://portlink-backend.azurewebsites.net/api/health
```

### 2. Run Backend Migrations
```powershell
# SSH vào backend
az webapp ssh -g portlink-rg -n portlink-backend

# Trong SSH session:
cd /home/site/wwwroot
npm run migration:run
npm run seed:demo
```

### 3. Test Full Stack
1. Mở frontend: https://portlink-frontend.azurewebsites.net
2. Login với demo credentials (từ seed data)
3. Test các chức năng chính

## 📞 HỖ TRỢ THÊM

Nếu gặp vấn đề, check:
1. **Application logs**: 
   ```powershell
   az webapp log tail -g portlink-rg -n portlink-frontend
   ```

2. **Deployment logs**: Vào Kudu > Deployments tab

3. **File structure**: Verify trong Kudu file manager

---

**Ước tính thời gian:** 5-10 phút
**Độ khó:** ⭐☆☆☆☆ (Rất dễ - chỉ cần drag & drop!)

🎉 Chúc bạn deploy thành công!
