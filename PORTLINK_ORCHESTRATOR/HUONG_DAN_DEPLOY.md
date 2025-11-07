# 🚀 Hướng Dẫn Triển Khai PortLink Orchestrator

## 📋 Tổng Quan

Dự án **PortLink Orchestrator** là một nền tảng Digital Twin cho quản lý cảng biển. Tài liệu này hướng dẫn các phương pháp triển khai dự án.

## 🎯 Các Phương Án Triển Khai

### 1. 🐳 Triển Khai Bằng Docker (Khuyến Nghị)

**Ưu điểm:**
- Đơn giản, nhanh chóng
- Chạy được trên mọi hệ điều hành
- Phù hợp cho development và production
- Tự động thiết lập database và cache

**Yêu cầu:**
- Docker Engine 20.10+
- Docker Compose V2+
- 4GB RAM trở lên
- 10GB dung lượng ổ cứng

**Các bước thực hiện:**

```bash
# Bước 1: Di chuyển vào thư mục dự án
cd PORTLINK_ORCHESTRATOR

# Bước 2: Tạo file cấu hình môi trường
cp .env.docker.example .env

# Bước 3: Chỉnh sửa file .env (QUAN TRỌNG!)
# Thay đổi các mật khẩu và secret keys
nano .env  # hoặc notepad .env trên Windows

# Bước 4: Build và khởi động các services
docker compose build
docker compose up -d

# Bước 5: Xem logs để kiểm tra
docker compose logs -f

# Bước 6: Truy cập ứng dụng
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000/api/v1
```

**Tài khoản mặc định:**
- Email: `admin@portlink.com`
- Password: `Admin@123`

**Các lệnh hữu ích:**
```bash
# Dừng tất cả services
docker compose down

# Dừng và xóa tất cả dữ liệu
docker compose down -v

# Xem logs của một service cụ thể
docker compose logs -f backend
docker compose logs -f frontend

# Restart một service
docker compose restart backend

# Rebuild sau khi có thay đổi code
docker compose build
docker compose up -d
```

---

### 2. ☁️ Triển Khai Trên Render.com (Free với GitHub Student Pack)

**Ưu điểm:**
- Hoàn toàn miễn phí với GitHub Student Pack ($200 credit/năm)
- Tự động deploy khi push code
- SSL/HTTPS miễn phí
- Phù hợp cho production

**Yêu cầu:**
- Tài khoản GitHub (đã verify student)
- Tài khoản Render.com

**Các bước thực hiện:**

1. **Đăng ký GitHub Student Pack:**
   - Truy cập: https://education.github.com/pack
   - Xác thực tài khoản sinh viên
   - Nhận $200 credit cho Render.com

2. **Push code lên GitHub:**
   ```bash
   git add .
   git commit -m "chore: prepare for deployment"
   git push origin main
   ```

3. **Triển khai trên Render:**
   - Đăng nhập: https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Chọn repository của bạn
   - Render sẽ tự động phát hiện file `render.yaml`
   - Click "Apply"
   - Đợi ~10 phút để triển khai hoàn tất

4. **Cập nhật environment variables:**
   - Sau khi deploy xong, cập nhật CORS_ORIGIN ở backend
   - Cập nhật VITE_API_BASE_URL ở frontend với URL thực tế

**Xem thêm:** `QUICKSTART.md` và `DEPLOYMENT.md`

---

### 3. 🔷 Triển Khai Trên Azure

**Ưu điểm:**
- Hiệu suất cao
- Tích hợp tốt với doanh nghiệp
- Nhiều dịch vụ hỗ trợ

**Yêu cầu:**
- Tài khoản Azure (có thể dùng Azure Student với $100 credit)
- Azure CLI đã cài đặt

**Các bước thực hiện:**

1. **Cài đặt Azure CLI:**
   ```bash
   # Windows
   winget install Microsoft.AzureCLI
   
   # Linux/Mac
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Đăng nhập Azure:**
   ```bash
   az login
   ```

3. **Triển khai:**
   ```bash
   # Sử dụng script tự động
   cd PORTLINK_ORCHESTRATOR
   ./deploy-azure.ps1  # Windows
   # hoặc
   make azure-deploy   # Linux/Mac
   ```

**Xem thêm:** `AZURE_DEPLOYMENT_GUIDE.md` và `AZURE_PORTAL_DEPLOYMENT.md`

---

### 4. 🟪 Triển Khai Trên Heroku

**Ưu điểm:**
- Dễ sử dụng
- Tích hợp tốt với Git
- Nhiều add-ons

**Yêu cầu:**
- Tài khoản Heroku
- Heroku CLI

**Các bước thực hiện:**

1. **Cài đặt Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Đăng nhập Heroku:**
   ```bash
   heroku login
   ```

3. **Tạo app:**
   ```bash
   heroku create portlink-orchestrator
   ```

4. **Thêm add-ons:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   heroku addons:create heroku-redis:mini
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

**Xem thêm:** `HEROKU_DEPLOYMENT.md`

---

## 🔧 Cấu Hình Sau Khi Deploy

### Thay Đổi Mật Khẩu Mặc Định
```bash
# Đăng nhập với tài khoản admin
# Truy cập Settings → Change Password
# Hoặc dùng API để đổi mật khẩu
```

### Thiết Lập HTTPS/SSL
- **Docker local**: Sử dụng reverse proxy như Nginx hoặc Caddy
- **Render/Heroku**: SSL tự động được cung cấp
- **Azure**: Cấu hình Application Gateway hoặc Front Door

### Monitoring và Logs
```bash
# Docker
docker compose logs -f

# Render
Xem logs trực tiếp trên dashboard

# Azure
Sử dụng Azure Monitor và Log Analytics

# Heroku
heroku logs --tail
```

## 📊 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────┐
│        Frontend (React + Vite)          │
│           Nginx (Port 8080)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Backend API (NestJS)               │
│        Port 3000                        │
│   ├─ REST API                           │
│   ├─ WebSocket                          │
│   ├─ AI Chatbot                         │
│   └─ Authentication                     │
└──────┬──────────────┬───────────────────┘
       │              │
       ▼              ▼
┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │    Redis     │
│  (Port 5432) │ │  (Port 6379) │
└──────────────┘ └──────────────┘
```

## 🎯 Các Tính Năng Chính

### Backend
- ✅ RESTful API với NestJS + TypeORM
- ✅ PostgreSQL 16 database
- ✅ Redis caching
- ✅ JWT authentication
- ✅ Role-based access control (4 roles)
- ✅ WebSocket real-time updates
- ✅ AI Chatbot (8 intents)
- ✅ Health checks

### Frontend
- ✅ React 18 + TypeScript
- ✅ Redux Toolkit state management
- ✅ Material-UI components
- ✅ Real-time dashboard
- ✅ Multi-language support (i18n)
- ✅ Responsive design

## 📚 Tài Liệu Bổ Sung

- **API Documentation**: `API_Specification_Document.md`
- **Database Design**: `Database_Design_Document.md`
- **System Architecture**: `System_Architecture_Document.md`
- **User Manual**: `User_Manual_Guide.md`
- **Docker Guide**: `DOCKER_DEPLOYMENT.md`
- **Quick Start**: `QUICKSTART.md`

## 🆘 Troubleshooting

### Services không khởi động
```bash
# Kiểm tra logs
docker compose logs

# Rebuild lại
docker compose build --no-cache
docker compose up -d
```

### Port đã bị sử dụng
```bash
# Thay đổi port trong file .env
BACKEND_PORT=3001
FRONTEND_PORT=8081

# Restart
docker compose restart
```

### Database lỗi
```bash
# Reset database
docker compose down -v
docker compose up -d
```

### Out of memory
```bash
# Tăng memory limit trong docker-compose.yml
services:
  backend:
    mem_limit: 2g
  frontend:
    mem_limit: 1g
```

## 💡 Best Practices

1. **Bảo mật:**
   - Luôn thay đổi mật khẩu mặc định
   - Sử dụng JWT secret mạnh (32+ ký tự)
   - Enable HTTPS trong production
   - Cấu hình CORS chính xác

2. **Performance:**
   - Enable Redis caching
   - Sử dụng CDN cho static files
   - Configure proper database indices
   - Monitor resource usage

3. **Backup:**
   - Tự động backup database hàng ngày
   - Lưu trữ backup ở nơi an toàn
   - Test restore process định kỳ

4. **Monitoring:**
   - Setup health check endpoints
   - Configure logging và alerts
   - Monitor application metrics
   - Track error rates

## 📞 Hỗ Trợ

- **Documentation**: Xem các file `.md` trong thư mục dự án
- **Issues**: Tạo issue trên GitHub repository
- **Health Check**: Truy cập `/health` endpoint

---

**✅ Chúc bạn triển khai thành công!**

**Built with ❤️ for Hackathon 2025**
