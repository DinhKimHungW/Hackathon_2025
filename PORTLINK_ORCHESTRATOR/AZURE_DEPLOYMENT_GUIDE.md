# Hướng Dẫn Triển Khai PortLink Orchestrator Lên Azure

## Tổng Quan

Tài liệu này hướng dẫn chi tiết cách triển khai dự án **PortLink Orchestrator** lên Microsoft Azure sử dụng các dịch vụ sau:

- **Azure Container Apps** - Chạy Backend (NestJS) và Frontend (React/Vite)
- **Azure Database for PostgreSQL Flexible Server** - Cơ sở dữ liệu
- **Azure Cache for Redis** - Cache layer
- **Azure Container Registry** - Lưu trữ Docker images
- **Azure Key Vault** - Quản lý secrets an toàn
- **Azure Log Analytics** - Monitoring và logging

## Yêu Cầu Trước Khi Bắt Đầu

### 1. Cài Đặt Công Cụ

```powershell
# Cài đặt Azure CLI
winget install Microsoft.AzureCLI

# Cài đặt Azure Developer CLI (azd)
winget install Microsoft.Azd

# Cài đặt Docker Desktop (để build images)
winget install Docker.DockerDesktop

# Kiểm tra cài đặt
az version
azd version
docker --version
```

### 2. Đăng Nhập Azure

```powershell
# Đăng nhập vào Azure
az login

# Thiết lập subscription mặc định
az account set --subscription "<your-subscription-id>"

# Xác nhận subscription hiện tại
az account show
```

### 3. Đăng Ký Resource Providers

```powershell
# Đăng ký các resource providers cần thiết
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.DBforPostgreSQL
az provider register --namespace Microsoft.Cache
az provider register --namespace Microsoft.KeyVault

# Kiểm tra trạng thái đăng ký
az provider show -n Microsoft.App --query "registrationState"
```

## Phương Pháp Triển Khai

### Option 1: Sử Dụng Azure Developer CLI (azd) - **KHUYẾN NGHỊ**

Đây là cách đơn giản và nhanh nhất.

#### Bước 1: Khởi Tạo azd

```powershell
# Di chuyển đến thư mục dự án
cd c:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR

# Khởi tạo azd (sử dụng cấu hình có sẵn)
azd init
```

Khi được hỏi:
- **Environment name**: `portlink-prod` (hoặc tên bạn muốn)
- **Subscription**: Chọn subscription của bạn
- **Location**: `eastasia` hoặc `southeastasia` (gần Việt Nam nhất)

#### Bước 2: Cấu Hình Biến Môi Trường

Tạo file `.azure/<environment-name>/.env`:

```bash
# Database Configuration
POSTGRES_SERVER_NAME=portlink-db
POSTGRES_ADMIN_USER=portlinkadmin
POSTGRES_ADMIN_PASSWORD=<Tạo-mật-khẩu-mạnh-ở-đây>
POSTGRES_DATABASE_NAME=portlink_db

# Redis Configuration
REDIS_CACHE_NAME=portlink-redis
REDIS_PASSWORD=<Tạo-mật-khẩu-mạnh-ở-đây>

# JWT Secrets
JWT_SECRET=<Tạo-secret-key-mạnh-ở-đây>
JWT_REFRESH_SECRET=<Tạo-refresh-secret-mạnh-ở-đây>

# Application Configuration
CORS_ORIGIN=https://portlink-frontend.azurecontainerapps.io
```

#### Bước 3: Xem Trước Triển Khai

```powershell
# Xem trước các thay đổi sẽ được triển khai
azd provision --preview
```

Xem xét kỹ các tài nguyên sẽ được tạo và chi phí ước tính.

#### Bước 4: Triển Khai

```powershell
# Triển khai toàn bộ infrastructure và application
azd up
```

Lệnh này sẽ:
1. Tạo tất cả Azure resources (Database, Redis, Container Registry, Container Apps, etc.)
2. Build Docker images cho Backend và Frontend
3. Push images lên Azure Container Registry
4. Deploy containers lên Azure Container Apps
5. Cấu hình networking và environment variables

#### Bước 5: Khởi Tạo Database

```powershell
# Lấy connection string
$DB_HOST = azd env get-values | Select-String "POSTGRES_HOST" | ForEach-Object { $_.ToString().Split('=')[1] }
$DB_USER = azd env get-values | Select-String "POSTGRES_ADMIN_USER" | ForEach-Object { $_.ToString().Split('=')[1] }
$DB_NAME = azd env get-values | Select-String "POSTGRES_DATABASE_NAME" | ForEach-Object { $_.ToString().Split('=')[1] }

# Chạy migrations
azd exec --service backend npm run migration:run

# Seed demo data (tùy chọn)
azd exec --service backend npm run seed:demo
```

### Option 2: Sử Dụng Azure CLI và Bicep (Chi Tiết Hơn)

Nếu bạn muốn kiểm soát chi tiết hơn hoặc tùy chỉnh infrastructure.

#### Bước 1: Tạo Resource Group

```powershell
# Định nghĩa biến
$RESOURCE_GROUP = "rg-portlink-prod"
$LOCATION = "eastasia"  # hoặc southeastasia
$ENVIRONMENT = "prod"

# Tạo resource group
az group create `
  --name $RESOURCE_GROUP `
  --location $LOCATION `
  --tags environment=$ENVIRONMENT project=portlink
```

#### Bước 2: Triển Khai Infrastructure với Bicep

```powershell
# Validate Bicep template
az deployment group validate `
  --resource-group $RESOURCE_GROUP `
  --template-file ./infra/main.bicep `
  --parameters ./infra/main.parameters.json

# Xem trước thay đổi
az deployment group what-if `
  --resource-group $RESOURCE_GROUP `
  --template-file ./infra/main.bicep `
  --parameters ./infra/main.parameters.json

# Triển khai
az deployment group create `
  --resource-group $RESOURCE_GROUP `
  --template-file ./infra/main.bicep `
  --parameters ./infra/main.parameters.json `
  --name "portlink-deployment-$(Get-Date -Format 'yyyyMMddHHmmss')"
```

#### Bước 3: Build và Push Docker Images

```powershell
# Lấy ACR login server
$ACR_NAME = az deployment group show `
  --resource-group $RESOURCE_GROUP `
  --name "portlink-deployment-*" `
  --query properties.outputs.acrLoginServer.value `
  --output tsv

# Login vào ACR
az acr login --name $ACR_NAME

# Build và push Backend image
docker build -t ${ACR_NAME}/portlink-backend:latest ./backend
docker push ${ACR_NAME}/portlink-backend:latest

# Build và push Frontend image
docker build -t ${ACR_NAME}/portlink-frontend:latest `
  --build-arg VITE_API_BASE_URL=https://<backend-url>/api/v1 `
  ./frontend
docker push ${ACR_NAME}/portlink-frontend:latest
```

#### Bước 4: Deploy Container Apps

```powershell
# Deploy Backend Container App
az containerapp update `
  --name portlink-backend `
  --resource-group $RESOURCE_GROUP `
  --image ${ACR_NAME}/portlink-backend:latest

# Deploy Frontend Container App
az containerapp update `
  --name portlink-frontend `
  --resource-group $RESOURCE_GROUP `
  --image ${ACR_NAME}/portlink-frontend:latest
```

## Cấu Hình Sau Triển Khai

### 1. Cấu Hình Custom Domain (Tùy chọn)

```powershell
# Thêm custom domain cho frontend
az containerapp hostname add `
  --name portlink-frontend `
  --resource-group $RESOURCE_GROUP `
  --hostname "portlink.yourdomain.com"

# Bind certificate
az containerapp hostname bind `
  --name portlink-frontend `
  --resource-group $RESOURCE_GROUP `
  --hostname "portlink.yourdomain.com" `
  --environment portlink-env `
  --validation-method CNAME
```

### 2. Cấu Hình SSL/TLS Certificate

Azure Container Apps tự động cung cấp managed certificates cho custom domains.

### 3. Thiết Lập Continuous Deployment với GitHub Actions

Tạo file `.github/workflows/azure-deploy.yml` (đã được tạo trong dự án).

### 4. Monitoring và Logging

```powershell
# Xem logs của Backend
az containerapp logs show `
  --name portlink-backend `
  --resource-group $RESOURCE_GROUP `
  --follow

# Xem logs của Frontend
az containerapp logs show `
  --name portlink-frontend `
  --resource-group $RESOURCE_GROUP `
  --follow

# Mở Azure Portal để xem Log Analytics
az monitor log-analytics workspace show `
  --resource-group $RESOURCE_GROUP `
  --workspace-name portlink-logs
```

## Quản Lý Secrets

### Sử Dụng Azure Key Vault

```powershell
# Tạo secrets
az keyvault secret set `
  --vault-name portlink-kv `
  --name "POSTGRES-PASSWORD" `
  --value "<your-password>"

az keyvault secret set `
  --vault-name portlink-kv `
  --name "JWT-SECRET" `
  --value "<your-jwt-secret>"

# Container Apps sẽ tự động lấy secrets từ Key Vault thông qua Managed Identity
```

## Scaling và Performance

### Auto-scaling

```powershell
# Cấu hình auto-scaling cho backend
az containerapp update `
  --name portlink-backend `
  --resource-group $RESOURCE_GROUP `
  --min-replicas 1 `
  --max-replicas 10 `
  --scale-rule-name http-rule `
  --scale-rule-type http `
  --scale-rule-http-concurrency 100
```

### Database Scaling

```powershell
# Scale up PostgreSQL
az postgres flexible-server update `
  --resource-group $RESOURCE_GROUP `
  --name portlink-db `
  --tier GeneralPurpose `
  --sku-name Standard_D4s_v3
```

## Backup và Disaster Recovery

### Database Backup

```powershell
# Cấu hình automated backups
az postgres flexible-server parameter set `
  --resource-group $RESOURCE_GROUP `
  --server-name portlink-db `
  --name backup.retention_days `
  --value 30

# Manual backup
az postgres flexible-server backup create `
  --resource-group $RESOURCE_GROUP `
  --name portlink-db `
  --backup-name "manual-backup-$(Get-Date -Format 'yyyyMMdd')"
```

## Chi Phí Ước Tính (Tháng)

Dựa trên cấu hình mặc định:

| Service | Configuration | Estimated Cost (USD) |
|---------|--------------|---------------------|
| Azure Container Apps (Backend) | 1 vCPU, 2GB RAM | ~$30-50 |
| Azure Container Apps (Frontend) | 0.5 vCPU, 1GB RAM | ~$20-30 |
| PostgreSQL Flexible Server | Burstable B2s | ~$25-40 |
| Azure Cache for Redis | Basic C0 (250MB) | ~$15 |
| Azure Container Registry | Basic | ~$5 |
| Azure Key Vault | Standard | ~$1 |
| Log Analytics | 5GB/month | ~$10 |
| **TOTAL** | | **~$106-151/month** |

💡 **Mẹo tiết kiệm**: Sử dụng Azure Free Tier và Dev/Test pricing khi có thể.

## Troubleshooting

### Kiểm Tra Trạng Thái Deployment

```powershell
# Kiểm tra Container Apps
az containerapp show `
  --name portlink-backend `
  --resource-group $RESOURCE_GROUP `
  --query "properties.provisioningState"

# Kiểm tra Database connectivity
az postgres flexible-server show `
  --resource-group $RESOURCE_GROUP `
  --name portlink-db `
  --query "state"
```

### Debug Issues

```powershell
# Xem logs real-time
az containerapp logs show `
  --name portlink-backend `
  --resource-group $RESOURCE_GROUP `
  --follow --tail 100

# Exec vào container để debug
az containerapp exec `
  --name portlink-backend `
  --resource-group $RESOURCE_GROUP `
  --command /bin/sh
```

### Common Issues

1. **Database Connection Failed**
   - Kiểm tra firewall rules cho PostgreSQL
   - Verify connection string trong environment variables

2. **Container App không start**
   - Kiểm tra Docker image có build thành công không
   - Verify health check endpoint

3. **Redis connection timeout**
   - Kiểm tra Redis firewall settings
   - Verify Redis password trong secrets

## Cleanup

### Xóa Tất Cả Resources

```powershell
# Sử dụng azd
azd down --purge

# Hoặc xóa resource group
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## Tài Liệu Tham Khảo

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Database for PostgreSQL](https://learn.microsoft.com/azure/postgresql/)
- [Azure Cache for Redis](https://learn.microsoft.com/azure/azure-cache-for-redis/)
- [Azure Container Registry](https://learn.microsoft.com/azure/container-registry/)

## Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [troubleshooting section](#troubleshooting)
2. Xem logs trong Azure Portal
3. Tham khảo Azure documentation
4. Tạo issue trong GitHub repository

---

**Lưu ý**: Đảm bảo thay thế tất cả placeholders (`<your-value>`) bằng giá trị thực tế của bạn trước khi chạy các lệnh.
