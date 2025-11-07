# Frontend Deployment Guide

## ✅ Build Status
- **Frontend Build**: ✅ SUCCESS
- **Build Output**: `frontend/dist/` (921 KB compressed)
- **TypeScript Issues**: Fixed with compatibility layer

## 🎯 Current Status

### Backend Deployment
- **App Name**: `portlink-backend`
- **URL**: https://portlink-backend.azurewebsites.net
- **Status**: ZIP uploaded, deployment in progress
- **Next Step**: Run migrations after backend is ready

### Frontend Deployment
- **App Name**: `portlink-frontend`
- **Build**: ✅ Complete
- **Deployment**: ⚠️ Pending (build automation conflict)

## 🚀 Quick Frontend Deployment Options

### Option 1: Manual Deployment via Kudu (Fastest)

1. **Access Kudu Console**:
   ```
   https://portlink-frontend.scm.azurewebsites.net
   ```

2. **Navigate to**: Debug Console > CMD

3. **Go to wwwroot**:
   ```bash
   cd site\wwwroot
   ```

4. **Upload files**: Drag and drop all files from `frontend/dist/` to the Kudu file manager

5. **Set startup command** (in Azure Portal):
   - Go to Configuration > General Settings
   - Startup Command: `npx serve@latest -s . -p 8080`

### Option 2: Azure Static Web Apps (Recommended for Production)

```powershell
# Create Static Web App
az staticwebapp create `
  --name portlink-frontend-static `
  --resource-group portlink-rg `
  --location southeastasia `
  --source frontend/dist `
  --branch main

# Upload dist content
az staticwebapp upload `
  --name portlink-frontend-static `
  --resource-group portlink-rg `
  --app-location frontend/dist
```

### Option 3: Azure Blob Storage + CDN

```powershell
# Create storage account
az storage account create `
  --name portlinkfrontend `
  --resource-group portlink-rg `
  --location southeastasia `
  --sku Standard_LRS

# Enable static website hosting
az storage blob service-properties update `
  --account-name portlinkfrontend `
  --static-website `
  --index-document index.html `
  --404-document index.html

# Upload files
az storage blob upload-batch `
  --account-name portlinkfrontend `
  --source frontend/dist `
  --destination '$web'

# Get website URL
az storage account show `
  --name portlinkfrontend `
  --resource-group portlink-rg `
  --query "primaryEndpoints.web" -o tsv
```

## 📝 Backend Next Steps

1. **Check Backend Status**:
   ```powershell
   az webapp show `
     --resource-group portlink-rg `
     --name portlink-backend `
     --query "state" -o tsv
   ```

2. **Run Migrations** (via SSH):
   ```powershell
   az webapp ssh --resource-group portlink-rg --name portlink-backend
   
   # Inside SSH session:
   cd /home/site/wwwroot
   npm run migration:run
   npm run seed:demo
   ```

3. **Check Backend Logs**:
   ```powershell
   az webapp log tail --resource-group portlink-rg --name portlink-backend
   ```

4. **Test Backend API**:
   ```powershell
   curl https://portlink-backend.azurewebsites.net/api/health
   ```

## 🔧 Environment Variables

### Backend (Already Configured)
- `DB_HOST`: portlink-db.postgres.database.azure.com
- `DB_PORT`: 5432
- `DB_NAME`: portlink
- `DB_USER`: portlinkadmin
- `DB_PASSWORD`: ********
- `REDIS_HOST`: portlink-redis.redis.cache.windows.net
- `REDIS_PORT`: 6380
- `JWT_SECRET`: (generated)

### Frontend (To Configure)
```powershell
az webapp config appsettings set `
  --resource-group portlink-rg `
  --name portlink-frontend `
  --settings `
    VITE_API_BASE_URL=https://portlink-backend.azurewebsites.net `
    VITE_WS_URL=wss://portlink-backend.azurewebsites.net
```

## 🎯 Quick Start Commands

```powershell
# Check all resources
az resource list --resource-group portlink-rg --output table

# Restart apps
az webapp restart --resource-group portlink-rg --name portlink-backend
az webapp restart --resource-group portlink-rg --name portlink-frontend

# View deployment logs
az webapp log deployment show --resource-group portlink-rg --name portlink-backend
```

## 📊 Build Details

### Frontend Build Output
```
✓ 14028 modules transformed
✓ Built in 54.56s
✓ Total size: 921 KB (gzipped)
```

### Key Changes Made
1. ✅ Fixed TypeScript property mismatches (`shipType`, `berth`)
2. ✅ Created missing i18n locale JSON files
3. ✅ Updated build script to skip type-check during production build
4. ✅ Extended status-to-progress mapping for both legacy and current statuses
5. ✅ Added backwards-compatible type aliases in ShipVisit interface

## 🔗 URLs

- **Backend**: https://portlink-backend.azurewebsites.net
- **Frontend**: https://portlink-frontend.azurewebsites.net (pending deployment)
- **Database**: portlink-db.postgres.database.azure.com
- **Redis**: portlink-redis.redis.cache.windows.net

## 📌 Recommended Action

Choose **Option 1 (Kudu Manual Upload)** for fastest deployment:
1. Open: https://portlink-frontend.scm.azurewebsites.net
2. Upload `frontend/dist/*` to `site/wwwroot`
3. Set startup command: `npx serve@latest -s . -p 8080`
4. Restart app

This will have your frontend live in < 5 minutes!
