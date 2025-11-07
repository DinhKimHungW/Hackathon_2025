# 🚢 PortLink Orchestrator - Digital Twin Platform

[![Docker Build](https://github.com/DinhKimHungW/Hackathon_2025/actions/workflows/docker-build.yml/badge.svg)](https://github.com/DinhKimHungW/Hackathon_2025/actions/workflows/docker-build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PortLink Orchestrator** là một nền tảng Digital Twin tiên tiến cho quản lý cảng biển, được phát triển cho Hackathon 2025.

## 🎯 Tính Năng Chính

### Backend (NestJS + PostgreSQL + Redis)
- ✅ RESTful API với NestJS framework
- ✅ PostgreSQL 16 database với TypeORM
- ✅ Redis caching và session management
- ✅ JWT Authentication & Authorization
- ✅ Role-based Access Control (4 roles: Admin, Port Manager, Ship Operator, Customs Officer)
- ✅ WebSocket real-time updates
- ✅ AI Chatbot với 8 intents
- ✅ Comprehensive health checks

### Frontend (React + TypeScript + Material-UI)
- ✅ React 18 với TypeScript
- ✅ Redux Toolkit state management
- ✅ Material-UI components
- ✅ Real-time dashboard
- ✅ Multi-language support (i18n)
- ✅ Responsive design
- ✅ Interactive data visualization

## 🚀 Triển Khai Nhanh

### Phương Án 1: Docker (Khuyến Nghị) 🐳

```bash
# Di chuyển vào thư mục dự án
cd PORTLINK_ORCHESTRATOR

# Tạo file cấu hình
cp .env.docker.example .env

# Chỉnh sửa .env (thay đổi mật khẩu!)
nano .env

# Build và khởi động
docker compose build
docker compose up -d

# Xem logs
docker compose logs -f

# Truy cập ứng dụng
# Frontend: http://localhost:8080
# Backend: http://localhost:3000/api/v1
```

**Tài khoản mặc định:**
- Email: `admin@portlink.com`
- Password: `Admin@123`

### Phương Án 2: Render.com (Free) ☁️

1. Push code lên GitHub
2. Đăng nhập [Render.com](https://dashboard.render.com)
3. Tạo Blueprint deployment từ `render.yaml`
4. Đợi deployment hoàn tất (~10 phút)

### Phương Án 3: Azure 🔷

```bash
# Đăng nhập Azure
az login

# Deploy
cd PORTLINK_ORCHESTRATOR
./deploy-azure.ps1  # Windows
# hoặc
make azure-deploy   # Linux/Mac
```

### Phương Án 4: Heroku 🟪

```bash
# Đăng nhập Heroku
heroku login

# Tạo app và deploy
heroku create portlink-orchestrator
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
git push heroku main
```

## 📚 Tài Liệu

### Tiếng Việt
- **[🚀 Hướng Dẫn Deploy](PORTLINK_ORCHESTRATOR/HUONG_DAN_DEPLOY.md)** - Hướng dẫn triển khai chi tiết

### English
- **[Quick Start](PORTLINK_ORCHESTRATOR/QUICKSTART.md)** - Get started quickly
- **[Docker Deployment](PORTLINK_ORCHESTRATOR/DOCKER_DEPLOYMENT.md)** - Complete Docker guide
- **[Render Deployment](PORTLINK_ORCHESTRATOR/DEPLOYMENT.md)** - Deploy on Render.com
- **[Azure Deployment](PORTLINK_ORCHESTRATOR/AZURE_DEPLOYMENT_GUIDE.md)** - Deploy on Azure
- **[Heroku Deployment](PORTLINK_ORCHESTRATOR/HEROKU_DEPLOYMENT.md)** - Deploy on Heroku

### Technical Documentation
- **[API Specification](PORTLINK_ORCHESTRATOR/API_Specification_Document.md)** - API documentation
- **[Database Design](PORTLINK_ORCHESTRATOR/Database_Design_Document.md)** - Database schema
- **[System Architecture](PORTLINK_ORCHESTRATOR/System_Architecture_Document.md)** - Architecture overview
- **[User Manual](PORTLINK_ORCHESTRATOR/User_Manual_Guide.md)** - User guide

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Setup

```bash
# Backend
cd PORTLINK_ORCHESTRATOR/backend
npm install
cp .env.example .env
npm run start:dev

# Frontend
cd PORTLINK_ORCHESTRATOR/frontend
npm install
npm run dev
```

### Testing

```bash
# Backend tests
cd PORTLINK_ORCHESTRATOR/backend
npm run test
npm run test:e2e

# Frontend tests
cd PORTLINK_ORCHESTRATOR/frontend
npm run test
```

## 🔧 Kiểm Tra Deployment

### Tự động
```bash
# Linux/Mac
./verify-deployment.sh

# Windows
.\verify-deployment.ps1
```

### Thủ công
```bash
# Kiểm tra services
docker compose ps

# Xem logs
docker compose logs -f

# Health check
curl http://localhost:3000/health
curl http://localhost:8080
```

## 📊 Kiến Trúc

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

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- SQL injection protection (TypeORM)
- XSS protection
- HTTPS support (in production)

## 🌟 Features

### Port Management
- Berth scheduling and allocation
- Ship visit tracking
- Cargo operations management
- Resource optimization

### Real-time Updates
- WebSocket-based live updates
- Real-time dashboard
- Instant notifications
- Live berth status

### AI-Powered Chatbot
- Natural language processing
- 8 supported intents
- Context-aware responses
- Multi-language support

### Analytics & Reporting
- Performance metrics
- Utilization reports
- Revenue analytics
- Operational insights

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Built with ❤️ for Hackathon 2025 by Team PortLink

## 📞 Support

- **Documentation**: See `/PORTLINK_ORCHESTRATOR/` folder
- **Issues**: [GitHub Issues](https://github.com/DinhKimHungW/Hackathon_2025/issues)
- **Email**: support@portlink.com

---

**⭐ If you find this project useful, please give it a star!**
