# ⚡ HƯỚNG DẪN DEPLOY NHANH - CHỈ 1 LỆNH

## 🎯 Bạn đã sẵn sàng!

### Azure CLI đã cài đặt ✅
- Version: 2.79.0
- Python: 3.13.9

## 🚀 BẮT ĐẦU DEPLOY NGAY

### Chỉ cần chạy 1 lệnh này:

```powershell
.\deploy-azure-auto.ps1
```

## 📋 Script sẽ làm GÌ?

1. **Kiểm tra login** - Tự động mở browser nếu chưa login
2. **Tạo Resource Group** - Container cho tất cả resources
3. **Tạo PostgreSQL** - Database server (2-3 phút)
4. **Tạo Redis Cache** - Caching layer (5-10 phút) 
5. **Tạo App Services** - 2 web apps cho backend + frontend
6. **Deploy code** - Build và deploy tự động
7. **Setup database** - Chạy migrations và seed demo data
8. **Mở browser** - Truy cập app của bạn

## ⏱️ Thời gian

- **Tổng thời gian**: ~15-20 phút
- **Bạn cần làm gì**: KHÔNG CÓ GÌ, chỉ chờ!

## 💰 Chi phí

~$41/tháng cho tất cả (Database + Redis + App Services)

## 🎉 Sau khi deploy

Script sẽ cho bạn:
- ✅ URL của website
- ✅ Thông tin database
- ✅ Tài khoản admin để login
- ✅ File `AZURE_DEPLOYMENT_INFO.txt` với tất cả credentials

## 🔧 Tùy chỉnh (Không bắt buộc)

```powershell
# Deploy ở region gần hơn (Hong Kong)
.\deploy-azure-auto.ps1 -Location "eastasia"

# Đặt tên app theo ý bạn
.\deploy-azure-auto.ps1 -AppName "portlink-demo"

# Cả hai
.\deploy-azure-auto.ps1 -Location "eastasia" -AppName "portlink-demo"
```

## 🗑️ Xóa hết khi không dùng

```powershell
az group delete --name portlink-XXXX-rg --yes
```
(Thay XXXX bằng số app của bạn)

---

## ❓ Nếu có lỗi

### Lỗi: "az command not found"
→ Khởi động lại terminal

### Lỗi: "not authorized" 
→ Chạy: `az login` trước

### Lỗi: "location not available"
→ Thử location khác: `.\deploy-azure-auto.ps1 -Location "eastus"`

---

## 📞 Default Login Info

Sau khi deploy, login với:
- **Email**: admin@portlink.com  
- **Password**: Admin@123

---

**Sẵn sàng chưa? GO! 🚀**

```powershell
.\deploy-azure-auto.ps1
```
