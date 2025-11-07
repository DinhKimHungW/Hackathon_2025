# 🐳 PortLink Orchestrator - Docker Deployment Guide

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose V2+
- At least 4GB RAM
- 10GB free disk space

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd PORTLINK_ORCHESTRATOR
cp .env.docker.example .env
```

### 2. Update Environment Variables

Edit `.env` file and change the default passwords and secrets:

```bash
# IMPORTANT: Change these values!
DB_PASSWORD=your_strong_database_password
REDIS_PASSWORD=your_strong_redis_password
JWT_SECRET=your_random_jwt_secret_key
JWT_REFRESH_SECRET=your_random_refresh_secret_key
```

### 3. Build and Start Services

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api/v1
- **API Docs**: http://localhost:3000/api/v1/docs (if enabled)

## 🛠️ Common Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check service status
docker-compose ps
```

### Database Management

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U portlink_user -d portlink_db

# Run SQL file
docker-compose exec -T postgres psql -U portlink_user -d portlink_db < backup.sql

# Create database backup
docker-compose exec postgres pg_dump -U portlink_user portlink_db > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U portlink_user -d portlink_db < backup.sql
```

### Redis Management

```bash
# Access Redis CLI
docker-compose exec redis redis-cli -a your_redis_password

# Flush all cache
docker-compose exec redis redis-cli -a your_redis_password FLUSHALL
```

### Rebuild Services

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up -d --build
```

## 📦 Production Deployment

### 1. Security Checklist

- ✅ Change all default passwords
- ✅ Use strong JWT secrets (min 32 characters random)
- ✅ Update CORS_ORIGIN to your domain
- ✅ Enable HTTPS (use reverse proxy like Nginx/Traefik)
- ✅ Set NODE_ENV=production
- ✅ Configure firewall rules
- ✅ Enable database SSL connections

### 2. Performance Optimization

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
      replicas: 2
      restart_policy:
        condition: on-failure
        max_attempts: 3
```

### 3. SSL/HTTPS Setup (with Nginx Reverse Proxy)

Create `nginx-proxy.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # Frontend
    location / {
        proxy_pass http://frontend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 4. Monitoring & Logs

```bash
# View resource usage
docker stats

# Export logs
docker-compose logs --since 24h > logs.txt

# Monitor specific service
docker-compose logs -f --tail=100 backend
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Or change port in .env
BACKEND_PORT=3001
FRONTEND_PORT=8081
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U portlink_user

# Reset database
docker-compose down
docker volume rm portlink-postgres-data
docker-compose up -d
```

### Out of Memory

```bash
# Increase Docker memory limit in Docker Desktop settings
# Or add resource limits to docker-compose.yml

services:
  backend:
    mem_limit: 2g
    memswap_limit: 2g
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service_name>

# Remove and recreate
docker-compose down
docker-compose up -d --force-recreate

# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Health Checks

All services include health checks:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:3000/api/v1/auth/verify
curl http://localhost:8080
```

## 🔄 Updates & Maintenance

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Backup before update
docker-compose exec postgres pg_dump -U portlink_user portlink_db > backup_before_update.sql
```

## 🗑️ Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (WARNING: Deletes data!)
docker-compose down -v

# Remove unused images
docker image prune -a

# Full cleanup
docker system prune -a --volumes
```

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | postgres | Database hostname |
| `DB_PORT` | 5432 | Database port |
| `DB_USER` | portlink_user | Database username |
| `DB_PASSWORD` | - | Database password (REQUIRED) |
| `DB_NAME` | portlink_db | Database name |
| `REDIS_HOST` | redis | Redis hostname |
| `REDIS_PORT` | 6379 | Redis port |
| `REDIS_PASSWORD` | - | Redis password (REQUIRED) |
| `JWT_SECRET` | - | JWT signing secret (REQUIRED) |
| `JWT_EXPIRES_IN` | 1d | JWT token expiration |
| `BACKEND_PORT` | 3000 | Backend expose port |
| `FRONTEND_PORT` | 8080 | Frontend expose port |
| `CORS_ORIGIN` | * | Allowed CORS origins |
| `NODE_ENV` | production | Node environment |

## 🆘 Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- GitHub Issues: Create an issue with logs
- Documentation: See project README.md
