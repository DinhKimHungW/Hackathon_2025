# Infrastructure as Code (IaC) - PortLink Orchestrator

Thư mục này chứa các file Bicep để triển khai infrastructure của PortLink Orchestrator lên Azure.

## 📋 Cấu Trúc

```
infra/
├── main.bicep                    # Main Bicep template
├── main.parameters.json          # Parameters file (sử dụng Key Vault references)
└── main.parameters.local.json    # Parameters file cho local testing (KHÔNG commit vào git)
```

## 🏗️ Architecture

Infrastructure bao gồm các Azure resources sau:

### Core Services
- **Azure Container Apps** - Host Backend và Frontend containers
- **Azure Container Apps Environment** - Môi trường chung cho containers
- **Azure Container Registry (ACR)** - Lưu trữ Docker images

### Data Services
- **Azure Database for PostgreSQL Flexible Server** - Database chính
- **Azure Cache for Redis** - Cache layer cho hiệu suất

### Security & Monitoring
- **Azure Key Vault** - Quản lý secrets an toàn
- **Azure Log Analytics Workspace** - Centralized logging
- **Azure Application Insights** - Application monitoring

## 🚀 Cách Sử Dụng

### Option 1: Sử dụng Azure Developer CLI (Khuyến nghị)

```powershell
# Khởi tạo azd
azd init

# Triển khai
azd up
```

### Option 2: Sử dụng PowerShell Script

```powershell
# Xem trước thay đổi (WhatIf)
.\deploy-azure.ps1 -WhatIf

# Triển khai
.\deploy-azure.ps1 -EnvironmentName "prod" -Location "eastasia"
```

### Option 3: Sử dụng Azure CLI trực tiếp

```powershell
# Tạo resource group
az group create --name rg-portlink-prod --location eastasia

# Validate template
az deployment group validate \
  --resource-group rg-portlink-prod \
  --template-file ./infra/main.bicep \
  --parameters @./infra/main.parameters.local.json

# What-if analysis
az deployment group what-if \
  --resource-group rg-portlink-prod \
  --template-file ./infra/main.bicep \
  --parameters @./infra/main.parameters.local.json

# Deploy
az deployment group create \
  --resource-group rg-portlink-prod \
  --template-file ./infra/main.bicep \
  --parameters @./infra/main.parameters.local.json \
  --name portlink-deployment
```

## 🔑 Parameters

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `postgresAdminUser` | string (secure) | PostgreSQL admin username |
| `postgresAdminPassword` | string (secure) | PostgreSQL admin password |
| `redisPassword` | string (secure) | Redis password |
| `jwtSecret` | string (secure) | JWT secret key |
| `jwtRefreshSecret` | string (secure) | JWT refresh secret key |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `environmentName` | string | `prod` | Environment (dev/staging/prod) |
| `location` | string | Resource Group location | Azure region |
| `acrSku` | string | `Basic` | Container Registry SKU |
| `postgresSku` | string | `Burstable` | PostgreSQL tier |
| `postgresSkuName` | string | `Standard_B2s` | PostgreSQL SKU name |
| `redisSku` | string | `Basic` | Redis SKU |
| `redisCapacity` | int | `0` | Redis cache size |

## 🔐 Security Best Practices

### 1. Secrets Management

**KHÔNG BAO GIỜ** commit secrets vào source control. Sử dụng một trong các phương pháp sau:

#### Phương pháp A: Environment Variables (Local Development)

```powershell
$env:POSTGRES_PASSWORD = "your-secure-password"
$env:REDIS_PASSWORD = "your-redis-password"
$env:JWT_SECRET = "your-jwt-secret"
$env:JWT_REFRESH_SECRET = "your-refresh-secret"

.\deploy-azure.ps1
```

#### Phương pháp B: Azure Key Vault References (Production)

Sử dụng `main.parameters.json` với Key Vault references:

```json
{
  "postgresAdminPassword": {
    "reference": {
      "keyVault": {
        "id": "/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.KeyVault/vaults/{vault-name}"
      },
      "secretName": "POSTGRES-PASSWORD"
    }
  }
}
```

#### Phương pháp C: GitHub Secrets (CI/CD)

Thiết lập secrets trong GitHub repository settings:
- `AZURE_CREDENTIALS`
- `POSTGRES_ADMIN_USER`
- `POSTGRES_ADMIN_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### 2. Network Security

- PostgreSQL và Redis được cấu hình cho phép truy cập từ Azure services
- Container Apps sử dụng managed identities để truy cập Key Vault
- TLS/SSL được bật cho tất cả connections

### 3. RBAC (Role-Based Access Control)

Template tự động cấu hình:
- System-assigned managed identity cho Container Apps
- Key Vault Secrets User role cho Backend container app

## 📊 Outputs

Sau khi deploy thành công, template trả về các outputs sau:

| Output | Description |
|--------|-------------|
| `backendUrl` | Backend API URL |
| `frontendUrl` | Frontend application URL |
| `acrLoginServer` | Container Registry login server |
| `postgresServerFqdn` | PostgreSQL server FQDN |
| `redisHostName` | Redis cache hostname |
| `keyVaultName` | Key Vault name |
| `resourceGroupName` | Resource Group name |
| `containerAppEnvironmentName` | Container Apps Environment name |

## 💰 Cost Optimization

### Development Environment
```bicep
postgresSku: 'Burstable'
postgresSkuName: 'Standard_B1ms'  // ~$12/month
redisSku: 'Basic'
redisCapacity: 0                   // ~$15/month
acrSku: 'Basic'                    // ~$5/month
```

### Production Environment
```bicep
postgresSku: 'GeneralPurpose'
postgresSkuName: 'Standard_D2s_v3'  // ~$150/month
redisSku: 'Standard'
redisCapacity: 1                     // ~$75/month
acrSku: 'Standard'                   // ~$20/month
```

## 🔄 Update Strategy

### Update Infrastructure Only
```powershell
az deployment group create \
  --resource-group rg-portlink-prod \
  --template-file ./infra/main.bicep \
  --parameters @./infra/main.parameters.local.json \
  --mode Incremental
```

### Update Container Apps Only
```powershell
az containerapp update \
  --name ca-portlink-backend-prod \
  --resource-group rg-portlink-prod \
  --image <acr-name>.azurecr.io/portlink-backend:latest
```

## 🧹 Cleanup

### Xóa toàn bộ resources
```powershell
az group delete --name rg-portlink-prod --yes --no-wait
```

### Xóa riêng lẻ
```powershell
# Xóa Container Apps nhưng giữ database
az containerapp delete --name ca-portlink-backend-prod --resource-group rg-portlink-prod
az containerapp delete --name ca-portlink-frontend-prod --resource-group rg-portlink-prod
```

## 📚 Tài Liệu Tham Khảo

- [Azure Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [PostgreSQL Flexible Server](https://learn.microsoft.com/azure/postgresql/flexible-server/)
- [Azure Cache for Redis](https://learn.microsoft.com/azure/azure-cache-for-redis/)

## 🐛 Troubleshooting

### Deployment Failed

```powershell
# Xem deployment operations
az deployment group show \
  --name portlink-deployment \
  --resource-group rg-portlink-prod

# Xem chi tiết errors
az deployment operation group list \
  --name portlink-deployment \
  --resource-group rg-portlink-prod \
  --query "[?properties.provisioningState=='Failed']"
```

### Container App không start

```powershell
# Xem logs
az containerapp logs show \
  --name ca-portlink-backend-prod \
  --resource-group rg-portlink-prod \
  --follow

# Xem system logs
az containerapp logs show \
  --name ca-portlink-backend-prod \
  --resource-group rg-portlink-prod \
  --type system
```

### Database connection issues

```powershell
# Test connection từ Cloud Shell
psql "host=<server-fqdn> port=5432 dbname=portlink_db user=portlinkadmin sslmode=require"
```
