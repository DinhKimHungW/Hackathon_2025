# ⚡ Quick Start: Deploy PortLink to Azure

Hướng dẫn nhanh để deploy PortLink Orchestrator lên Azure trong vòng 15 phút.

## 📋 Prerequisites (5 phút)

### 1. Cài đặt công cụ

```powershell
# Azure CLI
winget install Microsoft.AzureCLI

# Azure Developer CLI (khuyến nghị)
winget install Microsoft.Azd

# Docker Desktop
winget install Docker.DockerDesktop

# Khởi động lại PowerShell sau khi cài đặt
```

### 2. Đăng nhập Azure

```powershell
# Đăng nhập
az login

# Chọn subscription
az account set --subscription "<your-subscription-name-or-id>"

# Xác nhận
az account show
```

## 🚀 Phương Pháp 1: Azure Developer CLI (Đơn giản nhất - 10 phút)

### Bước 1: Khởi tạo

```powershell
cd c:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR

# Khởi tạo azd environment
azd init
```

Khi được hỏi:
- **Environment name**: `portlink-prod` (hoặc tên bạn muốn)
- **Select subscription**: Chọn subscription của bạn
- **Select location**: Chọn `East Asia` hoặc `Southeast Asia`

### Bước 2: Cấu hình secrets

```powershell
# Tạo file .env trong .azure/<environment-name>/
$envPath = ".azure\portlink-prod\.env"

@"
POSTGRES_ADMIN_USER=portlinkadmin
POSTGRES_ADMIN_PASSWORD=ChangeMeSecure123!@#
REDIS_PASSWORD=RedisSecurePass456!@#
JWT_SECRET=JwtSuperSecretKey789!@#AbCdEf
JWT_REFRESH_SECRET=RefreshSecretKey101112!@#XyZ
"@ | Out-File -FilePath $envPath -Encoding UTF8
```

**⚠️ QUAN TRỌNG**: Thay đổi tất cả các passwords và secrets trên!

### Bước 3: Deploy!

```powershell
# Deploy tất cả (infrastructure + application)
azd up
```

Lệnh này sẽ:
1. ✅ Tạo Azure resources (Container Apps, PostgreSQL, Redis, etc.)
2. ✅ Build Docker images
3. ✅ Push images lên Azure Container Registry
4. ✅ Deploy containers

### Bước 4: Khởi tạo Database

```powershell
# Lấy backend URL
azd env get-values

# Run migrations (thay <backend-url> bằng URL thực tế)
# Hoặc sử dụng Azure Portal > Container Apps > Console
```

### Bước 5: Truy cập ứng dụng

```powershell
# Lấy URLs
azd env get-values | Select-String "FRONTEND_URL|BACKEND_URL"
```

Mở trình duyệt và truy cập Frontend URL!

---

## 🚀 Phương Pháp 2: PowerShell Script (Linh hoạt hơn - 15 phút)

### Bước 1: Thiết lập secrets

```powershell
# Thiết lập environment variables
$env:POSTGRES_PASSWORD = "YourSecurePassword123!@#"
$env:REDIS_PASSWORD = "RedisSecurePass456!@#"
$env:JWT_SECRET = "JwtSuperSecretKey789!@#"
$env:JWT_REFRESH_SECRET = "RefreshSecretKey101!@#"
```

### Bước 2: Xem trước deployment (WhatIf)

```powershell
.\deploy-azure.ps1 -EnvironmentName "prod" -Location "eastasia" -WhatIf
```

Xem kỹ những resources sẽ được tạo.

### Bước 3: Deploy

```powershell
.\deploy-azure.ps1 -EnvironmentName "prod" -Location "eastasia"
```

Script sẽ tự động:
- ✅ Validate prerequisites
- ✅ Create resource group
- ✅ Deploy infrastructure
- ✅ Build và push Docker images
- ✅ Update Container Apps

### Bước 4: Truy cập ứng dụng

Sau khi script hoàn thành, bạn sẽ thấy URLs của Frontend và Backend.

---

## 🔧 Post-Deployment Tasks

### 1. Run Database Migrations

#### Option A: Từ local machine

```powershell
cd backend

# Cấu hình connection string
$env:DB_HOST = "<postgres-server-fqdn>"
$env:DB_PORT = "5432"
$env:DB_USER = "portlinkadmin"
$env:DB_PASSWORD = "<your-password>"
$env:DB_NAME = "portlink_db"

# Run migrations
npm run migration:run
```

#### Option B: Từ Azure Portal

1. Mở Azure Portal
2. Tìm Backend Container App
3. Vào **Console** tab
4. Chạy: `npm run migration:run`

### 2. Seed Demo Data (Tùy chọn)

```powershell
# Từ console của Backend Container App
npm run seed:demo
```

### 3. Verify Deployment

```powershell
# Test Backend health
curl https://<backend-url>/api/v1/health

# Mở Frontend trong browser
start https://<frontend-url>
```

---

## 📊 Monitoring

### View Logs

```powershell
# Backend logs
az containerapp logs show \
  --name ca-portlink-backend-prod \
  --resource-group rg-portlink-prod \
  --follow

# Frontend logs
az containerapp logs show \
  --name ca-portlink-frontend-prod \
  --resource-group rg-portlink-prod \
  --follow
```

### Azure Portal

1. Mở [Azure Portal](https://portal.azure.com)
2. Tìm resource group: `rg-portlink-prod`
3. Xem:
   - **Container Apps** - Application status
   - **Log Analytics** - Centralized logs
   - **Application Insights** - Performance metrics

---

## 🔄 Update Application

### Update Code và Redeploy

```powershell
# Pull latest code
git pull

# Rebuild và redeploy
azd deploy

# Hoặc chỉ deploy một service cụ thể
azd deploy backend
azd deploy frontend
```

### Scale Container Apps

```powershell
# Scale backend
az containerapp update \
  --name ca-portlink-backend-prod \
  --resource-group rg-portlink-prod \
  --min-replicas 2 \
  --max-replicas 10
```

---

## 🧹 Cleanup

### Xóa toàn bộ (khi không cần nữa)

```powershell
# Với azd
azd down --purge

# Hoặc với Azure CLI
az group delete --name rg-portlink-prod --yes --no-wait
```

---

## 💰 Chi Phí Ước Tính

Với cấu hình mặc định (dev/testing):

| Service | Cost/Month (USD) |
|---------|-----------------|
| Container Apps | ~$50 |
| PostgreSQL (Burstable B2s) | ~$25 |
| Redis (Basic C0) | ~$15 |
| Container Registry | ~$5 |
| Other (Logs, Key Vault) | ~$10 |
| **TOTAL** | **~$105/month** |

💡 **Tip**: Sử dụng `azd down` khi không sử dụng để tiết kiệm chi phí!

---

## ❓ Troubleshooting

### Issue: "Docker is not running"

**Solution**: 
```powershell
# Khởi động Docker Desktop
start "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Đợi Docker khởi động (30s-1min)
docker ps
```

### Issue: "Deployment failed - Invalid password"

**Solution**: Password phải có:
- Ít nhất 8 ký tự
- Chữ hoa và chữ thường
- Số
- Ký tự đặc biệt

### Issue: "Container App không start"

**Solution**:
```powershell
# Xem logs
az containerapp logs show \
  --name ca-portlink-backend-prod \
  --resource-group rg-portlink-prod \
  --tail 100

# Restart container app
az containerapp revision restart \
  --name ca-portlink-backend-prod \
  --resource-group rg-portlink-prod
```

### Issue: "Database connection failed"

**Solution**:
```powershell
# Kiểm tra PostgreSQL firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group rg-portlink-prod \
  --name psql-portlink-prod-*

# Thêm rule nếu cần
az postgres flexible-server firewall-rule create \
  --resource-group rg-portlink-prod \
  --name psql-portlink-prod-* \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## 📚 Next Steps

1. ✅ [Cấu hình Custom Domain](./AZURE_DEPLOYMENT_GUIDE.md#cấu-hình-custom-domain)
2. ✅ [Thiết lập CI/CD với GitHub Actions](./AZURE_DEPLOYMENT_GUIDE.md#thiết-lập-continuous-deployment)
3. ✅ [Cấu hình Backup Strategy](./AZURE_DEPLOYMENT_GUIDE.md#backup-và-disaster-recovery)
4. ✅ [Performance Tuning](./AZURE_DEPLOYMENT_GUIDE.md#scaling-và-performance)

---

## 🆘 Cần Giúp Đỡ?

- 📖 Đọc [Full Deployment Guide](./AZURE_DEPLOYMENT_GUIDE.md)
- 🏗️ Xem [Infrastructure README](./infra/README.md)
- 🐛 Tạo [GitHub Issue](https://github.com/DinhKimHungW/Hackathon_2025/issues)

---

**Chúc bạn deploy thành công! 🎉**
