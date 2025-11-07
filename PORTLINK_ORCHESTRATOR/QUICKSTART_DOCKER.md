# 🚀 PortLink Orchestrator - Quick Start Guide

## 📦 What You Have

Complete Docker deployment setup for PortLink Orchestrator Digital Twin Platform with:
- ✅ Backend API (NestJS + PostgreSQL + Redis + AI Chatbot)
- ✅ Frontend Web App (React + Redux + Material-UI)
- ✅ Production-ready Dockerfiles
- ✅ Docker Compose orchestration
- ✅ Automated deployment scripts
- ✅ Database backup/restore tools
- ✅ Health checks and monitoring

## ⚡ Quick Start (Windows)

### Option 1: PowerShell Script (Recommended)

```powershell
# 1. Copy environment template
cp .env.docker.example .env

# 2. Edit .env and change passwords (IMPORTANT!)
notepad .env

# 3. Install everything
.\deploy.ps1 install
```

### Option 2: Docker Compose

```powershell
# 1. Setup environment
cp .env.docker.example .env
# Edit .env file

# 2. Build and start
docker-compose build
docker-compose up -d

# 3. Seed demo data
docker-compose exec backend npm run seed:demo
```

## 🌐 Access Application

After deployment:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api/v1
- **Default Login**: `admin@portlink.com` / `Admin@123`

## 📝 Common Commands

```powershell
# View all commands
.\deploy.ps1 help

# Start services
.\deploy.ps1 up

# Stop services
.\deploy.ps1 down

# View logs
.\deploy.ps1 logs

# Backup database
.\deploy.ps1 backup

# Check health
.\deploy.ps1 health

# Development mode
.\deploy.ps1 dev
```

## 🔧 Configuration

Edit `.env` file for:
- Database credentials
- Redis password
- JWT secrets
- Port numbers
- CORS settings

**⚠️ IMPORTANT**: Change default passwords before production deployment!

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 8080 | React web application |
| Backend | 3000 | NestJS API server |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & session store |

## 🆘 Troubleshooting

### Port already in use
```powershell
# Change ports in .env
BACKEND_PORT=3001
FRONTEND_PORT=8081
```

### Container won't start
```powershell
# View logs
docker-compose logs <service_name>

# Rebuild
.\deploy.ps1 rebuild
```

### Database issues
```powershell
# Reset database
docker-compose down -v
docker-compose up -d
.\deploy.ps1 seed
```

## 📚 Documentation

- **Docker Deployment**: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **API Documentation**: [API_Specification_Document.md](./API_Specification_Document.md)
- **Database Design**: [Database_Design_Document.md](./Database_Design_Document.md)

## 🛠️ Development

```powershell
# Start dev environment
.\deploy.ps1 dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# Stop dev
.\deploy.ps1 dev-down
```

## 🚀 Production Deployment

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for:
- SSL/HTTPS setup
- Reverse proxy configuration
- Performance tuning
- Monitoring setup
- Backup strategies

## 📋 Pre-deployment Checklist

- [ ] Change all default passwords in `.env`
- [ ] Update JWT secrets (min 32 characters)
- [ ] Configure CORS_ORIGIN for your domain
- [ ] Enable SSL/HTTPS in production
- [ ] Setup database backups
- [ ] Configure firewall rules
- [ ] Test health checks

## 🔐 Security Notes

1. Never commit `.env` file
2. Use strong passwords (min 16 characters)
3. Rotate secrets regularly
4. Enable SSL in production
5. Use environment-specific secrets
6. Review CORS settings

## 🎯 Features

### Backend
- ✅ RESTful API with NestJS
- ✅ PostgreSQL database with TypeORM
- ✅ Redis caching
- ✅ JWT authentication
- ✅ Role-based access control (4 roles)
- ✅ WebSocket real-time updates
- ✅ AI Chatbot (8 intent types)
- ✅ Digital Twin simulation

### Frontend
- ✅ React 18 + TypeScript
- ✅ Redux Toolkit state management
- ✅ Material-UI components
- ✅ Real-time dashboard
- ✅ Interactive port map
- ✅ AI Chatbot interface
- ✅ Responsive design

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: See `/docs` folder
- **Logs**: `.\deploy.ps1 logs`

---

**Built with ❤️ for Hackathon 2025**
