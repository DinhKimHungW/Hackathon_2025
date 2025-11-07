# 🚀 Hướng Dẫn Deploy PortLink Orchestrator Lên GitHub

## 📋 Tổng Quan

Hướng dẫn này giúp bạn triển khai PortLink Orchestrator sử dụng GitHub Container Registry (GHCR) và GitHub Actions để tự động build và deploy.

## ✅ Điều Kiện Tiên Quyết

- Tài khoản GitHub
- Repository đã được push lên GitHub
- Quyền admin cho repository

## 🎯 Phương Án Deploy

### Phương Án 1: GitHub Container Registry + GitHub Actions (Đã Cấu Hình Sẵn)

Repository này đã được cấu hình sẵn để tự động build Docker images và push lên GitHub Container Registry.

#### Bước 1: Enable GitHub Packages

1. Vào repository trên GitHub
2. Click **Settings** → **Actions** → **General**
3. Trong phần **Workflow permissions**, chọn:
   - ✅ **Read and write permissions**
4. Click **Save**

#### Bước 2: Push Code Lên Main Branch

```bash
# Commit changes nếu có
git add .
git commit -m "chore: prepare for deployment"

# Push lên main branch
git push origin main
```

#### Bước 3: Xem Quá Trình Build

1. Vào tab **Actions** trên GitHub
2. Xem workflow **"Docker Build and Deploy"** đang chạy
3. Đợi ~5-10 phút để build hoàn tất

#### Bước 4: Kiểm Tra Docker Images

Sau khi build thành công, images sẽ có tại:

```
ghcr.io/dinhkimhungw/hackathon_2025/backend:main
ghcr.io/dinhkimhungw/hackathon_2025/frontend:main
```

Xem tại: `https://github.com/DinhKimHungW/Hackathon_2025/pkgs/container/hackathon_2025%2Fbackend`

---

### Phương Án 2: Deploy Frontend Lên GitHub Pages

GitHub Pages chỉ hỗ trợ static websites. Bạn có thể deploy frontend lên GitHub Pages và backend lên nơi khác.

#### Tạo Workflow Deploy GitHub Pages

File đã được tạo sẵn: `.github/workflows/deploy-github-pages.yml`

#### Bật GitHub Pages

1. Vào **Settings** → **Pages**
2. Source: chọn **GitHub Actions**
3. Push code lên main branch
4. Frontend sẽ được deploy tại: `https://dinhkimhungw.github.io/Hackathon_2025/`

**Lưu ý:** Backend cần deploy riêng (xem phần dưới).

---

### Phương Án 3: Deploy Full Stack Với Docker Images

#### Tải và Chạy Docker Images từ GitHub

```bash
# Login vào GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/dinhkimhungw/hackathon_2025/backend:main
docker pull ghcr.io/dinhkimhungw/hackathon_2025/frontend:main

# Tạo docker-compose.yml sử dụng images từ GHCR
# (Xem file docker-compose.ghcr.yml đã tạo sẵn)

# Chạy containers
docker-compose -f docker-compose.ghcr.yml up -d
```

File `docker-compose.ghcr.yml` đã được tạo sẵn trong repository.

---

## 🔧 Cấu Hình Chi Tiết

### GitHub Container Registry (GHCR)

#### Tạo Personal Access Token (nếu cần)

1. Vào **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Chọn scopes:
   - ✅ `read:packages`
   - ✅ `write:packages`
   - ✅ `delete:packages`
4. Click **Generate token**
5. Copy và lưu token

#### Login vào GHCR

```bash
# Sử dụng token
echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

#### Pull Images

```bash
# Backend
docker pull ghcr.io/dinhkimhungw/hackathon_2025/backend:main

# Frontend
docker pull ghcr.io/dinhkimhungw/hackathon_2025/frontend:main
```

---

## 🌐 Deploy Backend

Vì GitHub Pages chỉ hỗ trợ static files, backend cần deploy lên nền tảng khác:

### Option A: Deploy Backend Lên Render.com (Free)

1. Vào https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect GitHub repository
4. Chọn `PORTLINK_ORCHESTRATOR/backend`
5. Settings:
   - **Name**: `portlink-backend`
   - **Environment**: `Docker`
   - **Plan**: `Free`
6. Add PostgreSQL database từ **New** → **PostgreSQL**
7. Add Redis từ **New** → **Redis**
8. Deploy!

### Option B: Deploy Backend Lên Railway.app (Free)

1. Vào https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Chọn repository
4. Chọn `backend` folder
5. Add PostgreSQL và Redis services
6. Deploy!

### Option C: Deploy Backend Lên Fly.io (Free)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Deploy:
   ```bash
   cd backend
   fly launch
   fly deploy
   ```

---

## 📊 Kiến Trúc Deploy Trên GitHub

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                       │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         GitHub Actions Workflow                    │    │
│  │  - Build Backend Docker Image                      │    │
│  │  - Build Frontend Docker Image                     │    │
│  │  - Push to GitHub Container Registry               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           GitHub Container Registry (ghcr.io)               │
│                                                             │
│  📦 backend:main    - Backend API Docker image             │
│  📦 frontend:main   - Frontend React app Docker image      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Options                       │
│                                                             │
│  1. GitHub Pages (Frontend only) + Render (Backend)        │
│  2. Pull images và deploy trên server riêng                │
│  3. Railway.app / Fly.io / Render.com                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Start - Deploy Hoàn Chỉnh

### Bước 1: Enable GitHub Actions
```bash
# Repository Settings → Actions → General
# ✅ Read and write permissions
```

### Bước 2: Push Code
```bash
git push origin main
```

### Bước 3: Đợi Build Hoàn Tất
- Xem tại tab **Actions** trên GitHub
- Build mất ~5-10 phút

### Bước 4: Deploy Frontend Lên GitHub Pages
- Settings → Pages → Source: GitHub Actions
- Frontend tự động deploy sau khi push

### Bước 5: Deploy Backend
Chọn một trong các option:
- **Render.com** (Free, dễ nhất) - Xem `DEPLOYMENT.md`
- **Railway.app** (Free)
- **Fly.io** (Free)
- Hoặc pull images từ GHCR và chạy trên server riêng

---

## 📋 Checklist Deploy

- [ ] Enable GitHub Actions với write permissions
- [ ] Push code lên main branch
- [ ] Xác nhận workflow chạy thành công (tab Actions)
- [ ] Kiểm tra images xuất hiện trong Packages
- [ ] (Optional) Enable GitHub Pages cho frontend
- [ ] Deploy backend lên Render/Railway/Fly.io
- [ ] Update CORS_ORIGIN trong backend config
- [ ] Update VITE_API_BASE_URL trong frontend config
- [ ] Test ứng dụng

---

## 🔍 Troubleshooting

### Workflow Không Chạy
- Kiểm tra workflow permissions trong Settings → Actions
- Đảm bảo file `.github/workflows/docker-build.yml` tồn tại
- Push lên branch `main` hoặc `develop`

### Images Không Build
- Xem logs trong tab Actions
- Kiểm tra Dockerfile syntax
- Đảm bảo có quyền write:packages

### Không Pull Được Images
- Login vào GHCR trước: `docker login ghcr.io`
- Đảm bảo images là public (Settings → Packages → Package settings)

---

## 🌟 Deployment URLs

Sau khi deploy thành công:

- **Frontend (GitHub Pages)**: `https://dinhkimhungw.github.io/Hackathon_2025/`
- **Backend (Render.com)**: `https://portlink-backend.onrender.com`
- **Docker Images**: `https://github.com/DinhKimHungW/Hackathon_2025/pkgs/container/hackathon_2025%2Fbackend`

---

## 📚 Tài Liệu Tham Khảo

- **GitHub Container Registry**: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- **GitHub Pages**: https://pages.github.com/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Render.com Deploy**: `DEPLOYMENT.md`
- **Heroku Deploy**: `HEROKU_DEPLOYMENT.md`
- **Azure Deploy**: `AZURE_DEPLOYMENT_GUIDE.md`

---

**✅ Deploy thành công!**

Sau khi làm theo hướng dẫn, ứng dụng của bạn sẽ được deploy và có thể truy cập công khai qua internet.

**Built with ❤️ for Hackathon 2025**
