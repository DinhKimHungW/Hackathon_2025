# 🚀 Hướng Dẫn Deploy PortLink lên Azure Portal

> **Deployment Method**: Azure Container Apps với PostgreSQL Flexible Server và Azure Cache for Redis

## 📋 Yêu Cầu

- ✅ Tài khoản Azure (Free tier hoặc Pay-as-you-go)
- ✅ Credit card để verify (Free tier có $200 credit miễn phí 30 ngày)
- ✅ Code đã push lên GitHub
- ✅ Trình duyệt web

---

## 🎯 BƯỚC 1: Chuẩn Bị Azure Account

### 1.1. Đăng ký Azure (nếu chưa có)
1. Truy cập: https://azure.microsoft.com/free/
2. Click **"Start free"**
3. Đăng nhập bằng Microsoft account
4. Nhập thông tin thanh toán (cần credit card để verify)
5. Chọn **"Free trial"** - Nhận $200 credit trong 30 ngày

### 1.2. Đăng nhập Azure Portal
1. Truy cập: https://portal.azure.com/
2. Đăng nhập bằng account vừa tạo
3. Chờ Portal load xong

---

## 🚀 BƯỚC 2: Tạo Resource Group

> Resource Group là container chứa tất cả tài nguyên của project

1. Ở Azure Portal, click **"Resource groups"** (hoặc tìm trong search bar)
2. Click **"+ Create"**
3. Điền thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource group**: `portlink-rg` (hoặc tên bất kỳ)
   - **Region**: **Southeast Asia** (Singapore - gần VN nhất)
4. Click **"Review + create"**
5. Click **"Create"**

✅ **Kết quả**: Resource group `portlink-rg` được tạo

---

## 🗄️ BƯỚC 3: Tạo PostgreSQL Database

### 3.1. Tạo Azure Database for PostgreSQL Flexible Server

1. Ở search bar, tìm **"Azure Database for PostgreSQL"**
2. Click **"+ Create"**
3. Chọn **"Flexible server"**
4. Điền thông tin:

   **Basics tab:**
   - **Subscription**: Chọn subscription của bạn
   - **Resource group**: `portlink-rg`
   - **Server name**: `portlink-db` (phải unique toàn Azure)
   - **Region**: **Southeast Asia**
   - **PostgreSQL version**: **16**
   - **Workload type**: **Development**
   - **Compute + storage**: Click **"Configure server"**
     - Chọn **"Burstable"** (rẻ nhất)
     - **Compute**: B1ms (1 vCore, 2 GiB RAM)
     - **Storage**: 32 GiB
     - Click **"Save"**

   **Authentication tab:**
   - **Authentication method**: **PostgreSQL authentication only**
   - **Admin username**: `portlink_admin`
   - **Password**: `YourSecurePassword123!` (đổi password mạnh)
   - **Confirm password**: `YourSecurePassword123!`

   **Networking tab:**
   - **Connectivity method**: **Public access (allowed IP addresses)**
   - ✅ Check **"Allow public access from any Azure service within Azure to this server"**
   - Click **"+ Add 0.0.0.0 - 255.255.255.255"** (cho phép access từ mọi nơi - chỉ dùng test)

5. Click **"Review + create"**
6. Click **"Create"**
7. **Chờ 5-10 phút** để database được tạo

### 3.2. Tạo Database

1. Sau khi PostgreSQL server tạo xong, click **"Go to resource"**
2. Ở menu bên trái, click **"Databases"**
3. Click **"+ Add"**
4. **Database name**: `portlink_db`
5. Click **"Save"**

### 3.3. Lấy Connection String

1. Ở PostgreSQL server resource, click **"Connect"**
2. Hoặc ở **"Overview"**, tìm **"Server name"**:
   ```
   portlink-db.postgres.database.azure.com
   ```
3. **Ghi lại thông tin**:
   ```
   Host: portlink-db.postgres.database.azure.com
   Port: 5432
   Database: portlink_db
   Username: portlink_admin
   Password: YourSecurePassword123!
   ```

✅ **Kết quả**: PostgreSQL database sẵn sàng

---

## 🔴 BƯỚC 4: Tạo Redis Cache

### 4.1. Tạo Azure Cache for Redis

1. Ở search bar, tìm **"Azure Cache for Redis"**
2. Click **"+ Create"**
3. Điền thông tin:

   **Basics tab:**
   - **Subscription**: Chọn subscription của bạn
   - **Resource group**: `portlink-rg`
   - **DNS name**: `portlink-redis` (phải unique)
   - **Location**: **Southeast Asia**
   - **Cache type**: **Basic C0** (250 MB - rẻ nhất)

   **Networking tab:**
   - **Connectivity method**: **Public endpoint**

   **Advanced tab:**
   - **Redis version**: **6** (hoặc mới nhất)

4. Click **"Review + create"**
5. Click **"Create"**
6. **Chờ 10-15 phút** để Redis được tạo

### 4.2. Lấy Redis Connection Info

1. Sau khi tạo xong, click **"Go to resource"**
2. Ở menu bên trái, click **"Access keys"**
3. **Ghi lại thông tin**:
   ```
   Host: portlink-redis.redis.cache.windows.net
   Port: 6380 (SSL) hoặc 6379 (non-SSL)
   Primary Key: <copy từ "Primary connection string">
   ```

✅ **Kết quả**: Redis cache sẵn sàng

---

## 🐳 BƯỚC 5: Tạo Container Registry (để lưu Docker images)

### 5.1. Tạo Azure Container Registry

1. Ở search bar, tìm **"Container registries"**
2. Click **"+ Create"**
3. Điền thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource group**: `portlink-rg`
   - **Registry name**: `portlinkregistry` (phải unique, không có dấu gạch ngang)
   - **Location**: **Southeast Asia**
   - **SKU**: **Basic** (rẻ nhất)
4. Click **"Review + create"**
5. Click **"Create"**

### 5.2. Enable Admin Access

1. Sau khi tạo xong, click **"Go to resource"**
2. Ở menu bên trái, click **"Access keys"**
3. ✅ Enable **"Admin user"**
4. **Ghi lại thông tin**:
   ```
   Login server: portlinkregistry.azurecr.io
   Username: portlinkregistry
   Password: <copy "password">
   ```

✅ **Kết quả**: Container Registry sẵn sàng nhận Docker images

---

## 📦 BƯỚC 6: Build và Push Docker Images

### 6.1. Cài Đặt Azure CLI (nếu chưa có)

**Windows:**
```powershell
# Download và install từ:
# https://aka.ms/installazurecliwindows
```

**Hoặc dùng PowerShell:**
```powershell
winget install -e --id Microsoft.AzureCLI
```

### 6.2. Login vào Azure CLI

```powershell
# Login vào Azure
az login

# Set subscription (nếu có nhiều subscription)
az account set --subscription "<Your Subscription ID>"
```

### 6.3. Login vào Container Registry

```powershell
# Login vào ACR
az acr login --name portlinkregistry
```

### 6.4. Build và Push Backend Image

```powershell
# Navigate to project root
cd C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR

# Build backend image
docker build -t portlinkregistry.azurecr.io/portlink-backend:latest ./backend

# Push backend image
docker push portlinkregistry.azurecr.io/portlink-backend:latest
```

### 6.5. Build và Push Frontend Image

```powershell
# Build frontend image
docker build `
  --build-arg VITE_API_BASE_URL=https://portlink-backend.azurecontainerapps.io/api/v1 `
  --build-arg VITE_WS_URL=wss://portlink-backend.azurecontainerapps.io `
  -t portlinkregistry.azurecr.io/portlink-frontend:latest `
  ./frontend

# Push frontend image
docker push portlinkregistry.azurecr.io/portlink-frontend:latest
```

✅ **Kết quả**: Docker images đã được push lên Azure Container Registry

---

## ☁️ BƯỚC 7: Tạo Container Apps Environment

### 7.1. Tạo Container Apps Environment

1. Ở search bar, tìm **"Container Apps"**
2. Click **"Container Apps Environments"**
3. Click **"+ Create"**
4. Điền thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource group**: `portlink-rg`
   - **Environment name**: `portlink-env`
   - **Region**: **Southeast Asia**
   - **Zone redundancy**: **Disabled** (tiết kiệm chi phí)
5. Click **"Review + create"**
6. Click **"Create"**

✅ **Kết quả**: Container Apps Environment sẵn sàng

---

## 🚀 BƯỚC 8: Deploy Backend Container App

### 8.1. Tạo Backend Container App

1. Ở search bar, tìm **"Container Apps"**
2. Click **"+ Create"**
3. Điền thông tin:

   **Basics tab:**
   - **Subscription**: Chọn subscription của bạn
   - **Resource group**: `portlink-rg`
   - **Container app name**: `portlink-backend`
   - **Region**: **Southeast Asia**
   - **Container Apps Environment**: `portlink-env`

   **Container tab:**
   - ✅ **Use quickstart image**: Bỏ tick
   - **Image source**: **Azure Container Registry**
   - **Registry**: `portlinkregistry.azurecr.io`
   - **Image**: `portlink-backend`
   - **Image tag**: `latest`
   - **Registry authentication**: Chọn **Admin credentials**

   **Application ingress:**
   - ✅ **Enable ingress**: Check
   - **Ingress traffic**: **Accept traffic from anywhere**
   - **Ingress type**: **HTTP**
   - **Target port**: `3000`

4. Click **"Review + create"**
5. Click **"Create"**
6. **Chờ 3-5 phút** để container app được deploy

### 8.2. Configure Backend Environment Variables

1. Sau khi tạo xong, click **"Go to resource"**
2. Ở menu bên trái, click **"Environment variables"**
3. Click **"+ Add"**
4. Thêm các environment variables:

   ```plaintext
   Name: NODE_ENV
   Value: production

   Name: PORT
   Value: 3000

   Name: DB_HOST
   Value: portlink-db.postgres.database.azure.com

   Name: DB_PORT
   Value: 5432

   Name: DB_USERNAME
   Value: portlink_admin

   Name: DB_PASSWORD
   Value: YourSecurePassword123!

   Name: DB_DATABASE
   Value: portlink_db

   Name: REDIS_HOST
   Value: portlink-redis.redis.cache.windows.net

   Name: REDIS_PORT
   Value: 6380

   Name: REDIS_PASSWORD
   Value: <Redis Primary Key từ bước 4.2>

   Name: REDIS_TLS
   Value: true

   Name: JWT_SECRET
   Value: your-super-secret-jwt-key-change-this-in-production-2024

   Name: JWT_REFRESH_SECRET
   Value: your-super-secret-refresh-key-change-this-in-production-2024

   Name: CORS_ORIGIN
   Value: https://portlink-frontend.azurecontainerapps.io
   ```

5. Click **"Save"**
6. Click **"Restart"** để apply environment variables

### 8.3. Lấy Backend URL

1. Ở **"Overview"**, tìm **"Application Url"**:
   ```
   https://portlink-backend.<unique-id>.azurecontainerapps.io
   ```
2. **Ghi lại URL này** để dùng cho frontend

✅ **Kết quả**: Backend đang chạy trên Azure Container Apps

---

## 🌐 BƯỚC 9: Deploy Frontend Container App

### 9.1. Rebuild Frontend với Backend URL mới

```powershell
# Rebuild frontend với backend URL từ Azure
docker build `
  --build-arg VITE_API_BASE_URL=https://portlink-backend.<unique-id>.azurecontainerapps.io/api/v1 `
  --build-arg VITE_WS_URL=wss://portlink-backend.<unique-id>.azurecontainerapps.io `
  -t portlinkregistry.azurecr.io/portlink-frontend:latest `
  ./frontend

# Push lại image
docker push portlinkregistry.azurecr.io/portlink-frontend:latest
```

### 9.2. Tạo Frontend Container App

1. Ở search bar, tìm **"Container Apps"**
2. Click **"+ Create"**
3. Điền thông tin:

   **Basics tab:**
   - **Subscription**: Chọn subscription của bạn
   - **Resource group**: `portlink-rg`
   - **Container app name**: `portlink-frontend`
   - **Region**: **Southeast Asia**
   - **Container Apps Environment**: `portlink-env`

   **Container tab:**
   - ✅ **Use quickstart image**: Bỏ tick
   - **Image source**: **Azure Container Registry**
   - **Registry**: `portlinkregistry.azurecr.io`
   - **Image**: `portlink-frontend`
   - **Image tag**: `latest`
   - **Registry authentication**: Chọn **Admin credentials**

   **Application ingress:**
   - ✅ **Enable ingress**: Check
   - **Ingress traffic**: **Accept traffic from anywhere**
   - **Ingress type**: **HTTP**
   - **Target port**: `8080`

4. Click **"Review + create"**
5. Click **"Create"**
6. **Chờ 3-5 phút** để container app được deploy

### 9.3. Lấy Frontend URL

1. Sau khi tạo xong, click **"Go to resource"**
2. Ở **"Overview"**, tìm **"Application Url"**:
   ```
   https://portlink-frontend.<unique-id>.azurecontainerapps.io
   ```

✅ **Kết quả**: Frontend đang chạy và kết nối với backend

---

## 🗄️ BƯỚC 10: Initialize Database

### 10.1. Run Database Migration

**Option 1: Dùng Azure Cloud Shell**

1. Ở Azure Portal, click icon **">_"** (Cloud Shell) ở top bar
2. Chọn **"Bash"**
3. Clone repository:
   ```bash
   git clone https://github.com/DinhKimHungW/Hackathon_2025.git
   cd Hackathon_2025/PORTLINK_ORCHESTRATOR
   ```

4. Install PostgreSQL client:
   ```bash
   # Nếu chưa có psql
   sudo apt-get update
   sudo apt-get install -y postgresql-client
   ```

5. Connect và run init script:
   ```bash
   psql "host=portlink-db.postgres.database.azure.com port=5432 dbname=portlink_db user=portlink_admin password=YourSecurePassword123! sslmode=require" -f backend/init-database.sql
   ```

**Option 2: Dùng pgAdmin hoặc DBeaver local**

1. Download init script từ GitHub:
   ```
   https://github.com/DinhKimHungW/Hackathon_2025/blob/main/PORTLINK_ORCHESTRATOR/backend/init-database.sql
   ```

2. Kết nối vào PostgreSQL bằng pgAdmin/DBeaver:
   - Host: `portlink-db.postgres.database.azure.com`
   - Port: `5432`
   - Database: `portlink_db`
   - Username: `portlink_admin`
   - Password: `YourSecurePassword123!`
   - SSL Mode: `require`

3. Execute file `init-database.sql`

### 10.2. Verify Database

```sql
-- Connect vào database và check
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Nên thấy các tables: users, roles, ships, berths, schedules, etc.
```

✅ **Kết quả**: Database đã có schema và demo data

---

## 🎉 BƯỚC 11: Test Application

### 11.1. Access Frontend

1. Mở browser, truy cập:
   ```
   https://portlink-frontend.<unique-id>.azurecontainerapps.io
   ```

2. Đăng nhập với:
   - **Email**: `admin@portlink.com`
   - **Password**: `Admin@123`

### 11.2. Test Features

✅ Dashboard loads với KPIs
✅ Ship visits hiển thị
✅ Schedules hoạt động
✅ AI Chatbot phản hồi
✅ Real-time updates qua WebSocket

---

## 📊 Chi Phí Ước Tính (Free Tier)

| Service | SKU | Chi phí/tháng |
|---------|-----|---------------|
| Container Apps | Consumption | $0 (180,000 vCPU-s free) |
| PostgreSQL | B1ms | ~$13 |
| Redis | Basic C0 | ~$17 |
| Container Registry | Basic | ~$5 |
| **TOTAL** | | **~$35/tháng** |

> 💡 **Free tier Azure**: Có $200 credit trong 30 ngày đầu

---

## 🔧 Troubleshooting

### Backend không start

1. Check logs:
   - Vào **Container App** → **Log stream**
   - Hoặc **Monitoring** → **Log Analytics**

2. Check environment variables:
   - Đảm bảo tất cả env vars đã được set đúng
   - Đặc biệt là DB và Redis connection strings

3. Check database connection:
   - Verify PostgreSQL firewall rules allow Azure services
   - Test connection string với psql

### Frontend không kết nối được backend

1. Check CORS:
   - Backend env `CORS_ORIGIN` phải match frontend URL
   - Update và restart backend

2. Rebuild frontend:
   - Đảm bảo `VITE_API_BASE_URL` đúng
   - Rebuild và push lại image

3. Check backend URL:
   - Access `https://portlink-backend.<id>.azurecontainerapps.io/api/v1/health`
   - Phải return `{"status": "ok"}`

### Database connection errors

1. Check firewall:
   - PostgreSQL → **Networking** → **Firewall rules**
   - Ensure "Allow Azure services" is checked

2. Check credentials:
   - Username format: `portlink_admin` (không có @servername)
   - Password đúng
   - Database name: `portlink_db`

3. Check SSL:
   - Azure PostgreSQL requires SSL
   - Connection string phải có `sslmode=require`

---

## 🚀 Quick Commands Reference

### View Container App Logs
```bash
az containerapp logs show \
  --name portlink-backend \
  --resource-group portlink-rg \
  --follow
```

### Restart Container App
```bash
az containerapp revision restart \
  --name portlink-backend \
  --resource-group portlink-rg
```

### Update Container Image
```bash
az containerapp update \
  --name portlink-backend \
  --resource-group portlink-rg \
  --image portlinkregistry.azurecr.io/portlink-backend:latest
```

### Scale Container App
```bash
az containerapp update \
  --name portlink-backend \
  --resource-group portlink-rg \
  --min-replicas 1 \
  --max-replicas 3
```

---

## 📚 Tài Liệu Tham Khảo

- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Database for PostgreSQL](https://learn.microsoft.com/en-us/azure/postgresql/)
- [Azure Cache for Redis](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/)
- [Azure Container Registry](https://learn.microsoft.com/en-us/azure/container-registry/)

---

## ✅ Checklist Deploy

- [ ] 1. Tạo Resource Group
- [ ] 2. Tạo PostgreSQL Database
- [ ] 3. Tạo Redis Cache
- [ ] 4. Tạo Container Registry
- [ ] 5. Build và Push Backend Image
- [ ] 6. Build và Push Frontend Image
- [ ] 7. Tạo Container Apps Environment
- [ ] 8. Deploy Backend Container App
- [ ] 9. Configure Backend Environment Variables
- [ ] 10. Deploy Frontend Container App
- [ ] 11. Initialize Database với init-database.sql
- [ ] 12. Test application

---

## 🎉 Done!

**Frontend URL**: `https://portlink-frontend.<unique-id>.azurecontainerapps.io`

**Backend URL**: `https://portlink-backend.<unique-id>.azurecontainerapps.io`

**Login**: `admin@portlink.com` / `Admin@123`

**Built with ❤️ for Hackathon 2025**
