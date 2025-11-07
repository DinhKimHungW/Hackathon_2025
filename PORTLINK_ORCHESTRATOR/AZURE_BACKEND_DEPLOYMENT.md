# 🔷 Hướng Dẫn Deploy Backend PortLink Lên Azure - Chi Tiết Từng Bước

## 📋 Tổng Quan

Hướng dẫn này giúp bạn deploy **Backend API** của PortLink Orchestrator lên Microsoft Azure. Backend sẽ chạy trên **Azure Container Apps** với **PostgreSQL** và **Redis**.

## ✅ Yêu Cầu

- Tài khoản Microsoft Azure (Free trial hoặc Student account)
- Azure CLI đã cài đặt
- Docker Desktop (để build images)
- Git Bash hoặc PowerShell

## 🎯 Kiến Trúc Backend Trên Azure

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Container App                     │
│                  Backend API (NestJS)                       │
│                     Port: 3000                              │
└────────────┬────────────────────┬──────────────────────────┘
             │                    │
             ▼                    ▼
    ┌────────────────┐   ┌────────────────┐
    │  PostgreSQL    │   │  Azure Cache   │
    │  Flexible      │   │  for Redis     │
    │  Server        │   │                │
    └────────────────┘   └────────────────┘
```

---

## 📝 Phần 1: Cài Đặt Công Cụ

### Bước 1: Cài Azure CLI

**Windows:**
```powershell
# Sử dụng winget
winget install Microsoft.AzureCLI

# Hoặc download installer
# https://aka.ms/installazurecliwindows
```

**Linux/Mac:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Kiểm tra cài đặt:**
```bash
az --version
```

### Bước 2: Đăng Nhập Azure

```bash
# Đăng nhập
az login

# Xem danh sách subscriptions
az account list --output table

# Thiết lập subscription mặc định (nếu có nhiều subscription)
az account set --subscription "YOUR_SUBSCRIPTION_NAME_OR_ID"

# Xác nhận subscription đang dùng
az account show
```

---

## 🚀 Phần 2: Tạo Resource Group

Resource Group là nơi chứa tất cả resources của bạn.

```bash
# Tạo resource group
az group create \
  --name portlink-rg \
  --location southeastasia

# Location gần Việt Nam:
# - southeastasia (Singapore)
# - eastasia (Hong Kong)
```

**Xác nhận:**
```bash
az group show --name portlink-rg
```

---

## 🗄️ Phần 3: Tạo PostgreSQL Database

### Bước 1: Tạo PostgreSQL Flexible Server

```bash
# Tạo PostgreSQL server
az postgres flexible-server create \
  --name portlink-db-server \
  --resource-group portlink-rg \
  --location southeastasia \
  --admin-user portlinkadmin \
  --admin-password "YourStrongPassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --public-access 0.0.0.0-255.255.255.255

# Lưu ý: Thay "YourStrongPassword123!" bằng mật khẩu mạnh của bạn
# Mật khẩu phải có: chữ hoa, chữ thường, số, ký tự đặc biệt, tối thiểu 8 ký tự
```

**Các tham số:**
- `--sku-name Standard_B1ms`: Tier rẻ nhất ($12/tháng)
- `--tier Burstable`: Cho workload nhẹ
- `--storage-size 32`: 32GB storage
- `--public-access`: Cho phép kết nối từ mọi IP (cần cho development)

### Bước 2: Tạo Database

```bash
# Tạo database
az postgres flexible-server db create \
  --resource-group portlink-rg \
  --server-name portlink-db-server \
  --database-name portlink_db
```

### Bước 3: Cấu Hình Firewall (Cho phép Azure services)

```bash
# Cho phép Azure services kết nối
az postgres flexible-server firewall-rule create \
  --resource-group portlink-rg \
  --name portlink-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Bước 4: Lấy Connection String

```bash
# Lấy thông tin kết nối
az postgres flexible-server show \
  --resource-group portlink-rg \
  --name portlink-db-server \
  --query "{Host:fullyQualifiedDomainName,AdminUser:administratorLogin}" \
  --output table
```

**Connection string sẽ có dạng:**
```
Host=portlink-db-server.postgres.database.azure.com
Port=5432
Database=portlink_db
Username=portlinkadmin
Password=YourStrongPassword123!
SSL Mode=Require
```

---

## 🔴 Phần 4: Tạo Azure Cache for Redis

```bash
# Tạo Redis cache
az redis create \
  --name portlink-redis \
  --resource-group portlink-rg \
  --location southeastasia \
  --sku Basic \
  --vm-size c0 \
  --enable-non-ssl-port false

# Đợi 5-10 phút để Redis được tạo
```

**Lấy Redis connection info:**
```bash
# Lấy hostname
az redis show \
  --name portlink-redis \
  --resource-group portlink-rg \
  --query "{Host:hostName,Port:sslPort}" \
  --output table

# Lấy access key
az redis list-keys \
  --name portlink-redis \
  --resource-group portlink-rg \
  --query primaryKey \
  --output tsv
```

---

## 🐳 Phần 5: Build và Push Docker Image

### Bước 1: Tạo Azure Container Registry

```bash
# Tạo container registry
az acr create \
  --name portlinkacr \
  --resource-group portlink-rg \
  --location southeastasia \
  --sku Basic \
  --admin-enabled true

# Lưu ý: Tên registry phải unique toàn Azure (chỉ chữ thường, số)
```

### Bước 2: Login vào Registry

```bash
# Login vào ACR
az acr login --name portlinkacr
```

### Bước 3: Build và Push Backend Image

```bash
# Di chuyển vào thư mục backend
cd PORTLINK_ORCHESTRATOR/backend

# Build image
docker build -t portlinkacr.azurecr.io/portlink-backend:latest .

# Push lên ACR
docker push portlinkacr.azurecr.io/portlink-backend:latest

# Xác nhận image đã được push
az acr repository show \
  --name portlinkacr \
  --repository portlink-backend
```

---

## 🌐 Phần 6: Deploy Backend Lên Azure Container Apps

### Bước 1: Tạo Container Apps Environment

```bash
# Tạo environment
az containerapp env create \
  --name portlink-env \
  --resource-group portlink-rg \
  --location southeastasia
```

### Bước 2: Lấy ACR Credentials

```bash
# Lấy username
az acr credential show \
  --name portlinkacr \
  --query "username" \
  --output tsv

# Lấy password
az acr credential show \
  --name portlinkacr \
  --query "passwords[0].value" \
  --output tsv
```

### Bước 3: Deploy Backend Container App

**Tạo file `backend-env.txt` với nội dung:**
```bash
NODE_ENV=production
PORT=3000

# Database (thay bằng thông tin thực tế)
DB_HOST=portlink-db-server.postgres.database.azure.com
DB_PORT=5432
DB_USER=portlinkadmin
DB_PASSWORD=YourStrongPassword123!
DB_NAME=portlink_db

# Redis (thay bằng thông tin thực tế)
REDIS_HOST=portlink-redis.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=YourRedisAccessKey

# JWT
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-refresh-secret-key-32-chars-minimum
JWT_REFRESH_EXPIRES_IN=7d

# CORS (sẽ cập nhật sau khi có frontend URL)
CORS_ORIGIN=*
```

**Deploy container:**
```bash
# Lấy ACR password
ACR_PASSWORD=$(az acr credential show \
  --name portlinkacr \
  --query "passwords[0].value" \
  --output tsv)

# Deploy
az containerapp create \
  --name portlink-backend \
  --resource-group portlink-rg \
  --environment portlink-env \
  --image portlinkacr.azurecr.io/portlink-backend:latest \
  --registry-server portlinkacr.azurecr.io \
  --registry-username portlinkacr \
  --registry-password $ACR_PASSWORD \
  --target-port 3000 \
  --ingress external \
  --env-vars-file backend-env.txt \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 1 \
  --max-replicas 2

# Lưu ý: Delete file backend-env.txt sau khi deploy để bảo mật
rm backend-env.txt
```

### Bước 4: Lấy Backend URL

```bash
# Lấy URL của backend
az containerapp show \
  --name portlink-backend \
  --resource-group portlink-rg \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv
```

**Backend URL sẽ có dạng:**
```
https://portlink-backend.RANDOM.southeastasia.azurecontainerapps.io
```

---

## 🧪 Phần 7: Kiểm Tra Deployment

### Bước 1: Health Check

```bash
# Kiểm tra backend health
curl https://portlink-backend.RANDOM.southeastasia.azurecontainerapps.io/health

# Kết quả mong đợi:
# {"status":"ok","database":"connected","redis":"connected"}
```

### Bước 2: Test API

```bash
# Test API endpoint
curl https://portlink-backend.RANDOM.southeastasia.azurecontainerapps.io/api/v1/auth/verify

# Nếu chưa login sẽ trả về 401 Unauthorized (đây là đúng)
```

### Bước 3: Xem Logs

```bash
# Xem logs của container
az containerapp logs show \
  --name portlink-backend \
  --resource-group portlink-rg \
  --follow

# Hoặc truy cập Azure Portal → Container Apps → portlink-backend → Log stream
```

---

## 🔧 Phần 8: Quản Lý và Cập Nhật

### Cập Nhật Backend Code

```bash
# 1. Build image mới
cd PORTLINK_ORCHESTRATOR/backend
docker build -t portlinkacr.azurecr.io/portlink-backend:v1.1 .

# 2. Push lên ACR
docker push portlinkacr.azurecr.io/portlink-backend:v1.1

# 3. Update container app
az containerapp update \
  --name portlink-backend \
  --resource-group portlink-rg \
  --image portlinkacr.azurecr.io/portlink-backend:v1.1
```

### Scale Backend

```bash
# Tăng/giảm số replicas
az containerapp update \
  --name portlink-backend \
  --resource-group portlink-rg \
  --min-replicas 2 \
  --max-replicas 5

# Tăng CPU/Memory
az containerapp update \
  --name portlink-backend \
  --resource-group portlink-rg \
  --cpu 1.0 \
  --memory 2.0Gi
```

### Xem Resource Usage

```bash
# Xem metrics
az containerapp show \
  --name portlink-backend \
  --resource-group portlink-rg \
  --query "properties.latestRevisionName"

# Hoặc vào Azure Portal để xem metrics chi tiết
```

---

## 💰 Phần 9: Ước Tính Chi Phí

### Free Tier / Student Benefits

- **Azure for Students**: $100 credit miễn phí/năm
- **Free tier includes**:
  - Container Apps: 180,000 vCPU-seconds/month free
  - PostgreSQL: Không có free tier (bắt đầu từ ~$12/tháng)
  - Redis: Basic tier ~$16/tháng

### Ước Tính Chi Phí Hàng Tháng

| Service | Tier | Cost/Month |
|---------|------|------------|
| Container Apps | 0.5 vCPU, 1GB RAM | ~$15 |
| PostgreSQL Flexible | B1ms (1 vCore, 2GB RAM) | ~$12 |
| Redis Cache | Basic C0 (250MB) | ~$16 |
| Container Registry | Basic | ~$5 |
| **Total** | | **~$48/month** |

**Tiết kiệm:**
- Dùng Azure Student credit → Miễn phí 2+ tháng
- Stop services khi không dùng
- Dùng Burstable tier cho PostgreSQL

---

## 🔒 Phần 10: Bảo Mật

### Cập Nhật Environment Variables

```bash
# Update biến môi trường (không cần restart)
az containerapp update \
  --name portlink-backend \
  --resource-group portlink-rg \
  --set-env-vars \
    JWT_SECRET=new-secret-key \
    CORS_ORIGIN=https://your-frontend-domain.com
```

### Bật HTTPS Only

```bash
# HTTPS đã tự động bật, nhưng có thể force:
az containerapp ingress update \
  --name portlink-backend \
  --resource-group portlink-rg \
  --allow-insecure false
```

### Private Networking (Nâng cao)

```bash
# Disable public access nếu muốn
az containerapp ingress update \
  --name portlink-backend \
  --resource-group portlink-rg \
  --type internal
```

---

## 🆘 Troubleshooting

### Container không start

```bash
# Xem logs chi tiết
az containerapp logs show \
  --name portlink-backend \
  --resource-group portlink-rg \
  --tail 100

# Xem revision status
az containerapp revision list \
  --name portlink-backend \
  --resource-group portlink-rg \
  --output table
```

### Database connection error

```bash
# Kiểm tra firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group portlink-rg \
  --name portlink-db-server

# Test kết nối từ local
psql "host=portlink-db-server.postgres.database.azure.com port=5432 dbname=portlink_db user=portlinkadmin password=YourPassword sslmode=require"
```

### Redis connection error

```bash
# Kiểm tra Redis status
az redis show \
  --name portlink-redis \
  --resource-group portlink-rg \
  --query "{Status:provisioningState,SSL:enableNonSslPort}" \
  --output table

# Verify keys
az redis list-keys \
  --name portlink-redis \
  --resource-group portlink-rg
```

---

## 🎯 Tóm Tắt - Quick Commands

```bash
# 1. Login
az login

# 2. Tạo resource group
az group create --name portlink-rg --location southeastasia

# 3. Tạo PostgreSQL
az postgres flexible-server create --name portlink-db-server --resource-group portlink-rg --admin-user portlinkadmin --admin-password "YourPassword123!"

# 4. Tạo Redis
az redis create --name portlink-redis --resource-group portlink-rg --sku Basic --vm-size c0

# 5. Tạo Container Registry
az acr create --name portlinkacr --resource-group portlink-rg --sku Basic --admin-enabled true

# 6. Build và push image
cd backend
docker build -t portlinkacr.azurecr.io/portlink-backend:latest .
az acr login --name portlinkacr
docker push portlinkacr.azurecr.io/portlink-backend:latest

# 7. Tạo Container Apps environment
az containerapp env create --name portlink-env --resource-group portlink-rg

# 8. Deploy backend
az containerapp create --name portlink-backend --resource-group portlink-rg --environment portlink-env --image portlinkacr.azurecr.io/portlink-backend:latest --target-port 3000 --ingress external

# 9. Lấy URL
az containerapp show --name portlink-backend --resource-group portlink-rg --query "properties.configuration.ingress.fqdn" -o tsv
```

---

## 📚 Tài Liệu Tham Khảo

- **Azure Container Apps**: https://learn.microsoft.com/azure/container-apps/
- **Azure PostgreSQL**: https://learn.microsoft.com/azure/postgresql/
- **Azure Redis**: https://learn.microsoft.com/azure/azure-cache-for-redis/
- **Azure CLI Reference**: https://learn.microsoft.com/cli/azure/

---

## ✅ Checklist Deploy

- [ ] Cài Azure CLI
- [ ] Login vào Azure (`az login`)
- [ ] Tạo Resource Group
- [ ] Tạo PostgreSQL Database
- [ ] Tạo Redis Cache
- [ ] Tạo Container Registry
- [ ] Build Docker image
- [ ] Push image lên ACR
- [ ] Tạo Container Apps Environment
- [ ] Deploy backend container
- [ ] Test health endpoint
- [ ] Cập nhật CORS_ORIGIN
- [ ] Test API endpoints
- [ ] Monitor logs

---

**🎉 Chúc bạn deploy thành công!**

Nếu gặp vấn đề, kiểm tra logs bằng:
```bash
az containerapp logs show --name portlink-backend --resource-group portlink-rg --follow
```

**Built with ❤️ for Hackathon 2025**
