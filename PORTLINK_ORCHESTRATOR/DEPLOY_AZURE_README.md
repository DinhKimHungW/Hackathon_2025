# 🚀 Deploy PortLink lên Azure - Siêu Đơn Giản

## ⚡ QUICK DEPLOY (Bạn đã có sẵn Database & Redis)

### Bước 1: Mở PowerShell
```powershell
cd c:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR
```

### Bước 2: Chạy Script
```powershell
.\deploy-quick.ps1
```

**Chỉ vậy thôi!** ☕

Script sẽ tự động:
- ✅ Sử dụng PostgreSQL có sẵn (portlink-db)
- ✅ Sử dụng Redis có sẵn (portlink-redis)
- ✅ Tạo App Service Plan
- ✅ Deploy Backend API
- ✅ Deploy Frontend Web
- ✅ Cấu hình tất cả môi trường
- ✅ Chạy migrations và seed data
- ✅ Mở browser cho bạn

### Thông tin cần nhập:
- Database username (mặc định: `portlinkadmin`)
- Database password (bạn đã đặt khi tạo DB)

### Thời gian chờ
- ⏱️ **5-8 phút** (chỉ deploy code, không cần tạo DB/Redis)

### Sau khi Deploy
Script sẽ in ra:
- 🌐 URL của Frontend và Backend
- 🔐 Credentials để login
- � Hướng dẫn chạy migrations thủ công (nếu cần)

---

## 🆕 FULL DEPLOY (Tạo mới tất cả resources)

Nếu bạn muốn tạo mới tất cả (DB + Redis + Apps):

```powershell
.\deploy-azure-auto.ps1
```

Script sẽ tự động:
- ✅ Tạo Resource Group mới
- ✅ Tạo PostgreSQL Database  
- ✅ Tạo Redis Cache
- ✅ Deploy Backend API
- ✅ Deploy Frontend Web
- ✅ Cấu hình tất cả môi trường
- ✅ Chạy migrations và seed data

**Thời gian:** ~15-20 phút

### Tùy chỉnh (Optional)
```powershell
# Deploy tại region khác
.\deploy-azure-auto.ps1 -Location "eastasia"

# Đặt tên app tùy chỉnh
.\deploy-azure-auto.ps1 -AppName "myportlink"
```

---

## 🗑️ Xóa resources

### Xóa chỉ App Services (giữ lại DB & Redis)
```powershell
az webapp delete --name portlink-backend --resource-group portlink-rg
az webapp delete --name portlink-frontend --resource-group portlink-rg
az appservice plan delete --name portlink-plan --resource-group portlink-rg
```

### Xóa tất cả
```powershell
az group delete --name portlink-rg --yes
```

---

**Lưu ý:** Script cần Azure CLI và đã đăng nhập. Nếu chưa login, chạy: `az login`
