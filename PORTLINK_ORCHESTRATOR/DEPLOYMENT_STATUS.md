# PortLink - Azure Deployment Status

## ✅ Đã Hoàn Thành

### Resources Created:
1. **App Service Plan**: `portlink-plan` (B1 Linux)
2. **Backend Web App**: `portlink-backend` 
   - Runtime: Node.js 20 LTS
   - URL: https://portlink-backend.azurewebsites.net
   - Status: ✅ Code đã upload, đang deploy

3. **Frontend Web App**: `portlink-frontend`
   - Runtime: Node.js 20 LTS  
   - URL: https://portlink-frontend.azurewebsites.net
   - Status: ⚠️ Cần fix TypeScript errors trước khi build

### Database & Redis (Existing):
- PostgreSQL: `portlink-db.postgres.database.azure.com`
- Redis: `portlink-redis.redis.cache.windows.net`

## ⚠️ Cần Làm Tiếp

### 1. Fix Frontend TypeScript Errors

Frontend code có một số lỗi TypeScript cần sửa:

```
Property 'shipType' does not exist on type 'ShipVisit'
Property 'berth' does not exist on type 'ShipVisit'
```

**Cách sửa nhanh:** Mở file `frontend/tsconfig.json` và thêm:
```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noImplicitAny": false
  }
}
```

Hoặc build với flag bỏ qua errors:
```powershell
cd frontend
npm run build -- --mode production
```

### 2. Deploy Frontend sau khi build xong

```powershell
cd frontend\dist
Compress-Archive -Path * -DestinationPath ..\frontend-deploy.zip -Force
cd ..
az webapp deployment source config-zip -g portlink-rg -n portlink-frontend --src "C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\frontend\frontend-deploy.zip"
```

### 3. Kiểm tra Backend Deployment

Đợi 5-10 phút để backend hoàn tất deployment, sau đó test:
```powershell
Invoke-WebRequest https://portlink-backend.azurewebsites.net/api/v1/auth/verify
```

### 4. Run Database Migrations

Sau khi backend đã chạy, cần run migrations:

**Option 1: Qua Azure Portal**
1. Vào https://portal.azure.com
2. Tìm App Service: `portlink-backend`
3. Vào SSH → Console
4. Chạy:
   ```bash
   cd /home/site/wwwroot
   npm run migration:run
   npm run seed:demo
   ```

**Option 2: Qua Azure CLI**
```powershell
az webapp ssh --resource-group portlink-rg --name portlink-backend --command "cd /home/site/wwwroot && npm run migration:run && npm run seed:demo"
```

## 📊 Deployment Info

### Environment Variables đã cấu hình:

**Backend:**
- NODE_ENV=production
- DB_HOST=portlink-db.postgres.database.azure.com
- DB_NAME=portlink_db
- REDIS_HOST=portlink-redis.redis.cache.windows.net
- JWT_SECRET=<generated>
- CORS_ORIGIN=https://portlink-frontend.azurewebsites.net

**Frontend:**
- VITE_API_BASE_URL=https://portlink-backend.azurewebsites.net/api/v1
- VITE_WS_URL=wss://portlink-backend.azurewebsites.net

## 🎯 Next Steps

1. **Sửa TypeScript errors trong frontend** (hoặc bỏ qua với tsconfig)
2. **Build frontend** thành công
3. **Deploy frontend** lên Azure
4. **Run database migrations** trên backend
5. **Test ứng dụng** tại https://portlink-frontend.azurewebsites.net
6. **Login** với: admin@portlink.com / Admin@123

## 💰 Chi Phí Ước Tính

- App Service Plan (B1): ~$13/tháng
- PostgreSQL (existing): ~$12/tháng
- Redis (existing): ~$16/tháng
- **Tổng**: ~$41/tháng

## 🗑️ Xóa Resources

Nếu muốn xóa chỉ App Services (giữ lại DB & Redis):
```powershell
az webapp delete --name portlink-backend --resource-group portlink-rg --yes
az webapp delete --name portlink-frontend --resource-group portlink-rg --yes
az appservice plan delete --name portlink-plan --resource-group portlink-rg --yes
```

Xóa tất cả:
```powershell
az group delete --name portlink-rg --yes
```

## 📝 Notes

- Backend deployment đang trong quá trình xử lý (có thể mất 5-10 phút)
- Frontend cần fix code trước khi deploy được
- Database migrations cần chạy thủ công sau khi backend deployed
