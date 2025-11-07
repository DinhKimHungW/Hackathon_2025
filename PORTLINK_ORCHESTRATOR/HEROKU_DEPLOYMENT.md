# 🚀 Heroku Deployment Guide - PortLink Orchestrator

Complete guide to deploy PortLink Orchestrator on Heroku platform.

## 📋 Prerequisites

1. **Heroku Account**
   - Sign up at [https://signup.heroku.com/](https://signup.heroku.com/)
   - Verify your email address
   - Add payment method (required for addons, even free ones)

2. **Heroku CLI**
   ```bash
   # Windows (via npm)
   npm install -g heroku
   
   # Or download installer from https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Git Repository**
   - Code must be in a Git repository
   - Committed and pushed to GitHub

## 🎯 Deployment Options

### Option 1: Deploy via Heroku Dashboard (Recommended)

#### Step 1: Create New App
1. Go to [Heroku Dashboard](https://dashboard.heroku.com/)
2. Click **"New"** → **"Create new app"**
3. Enter app name: `portlink-orchestrator` (or your choice)
4. Select region: **United States** or **Europe**
5. Click **"Create app"**

#### Step 2: Add PostgreSQL Database
1. In your app dashboard, go to **Resources** tab
2. Search for **"Heroku Postgres"**
3. Select plan: **Essential-0** ($5/month) or **Mini** ($5/month)
4. Click **"Submit Order Form"**

#### Step 3: Add Redis Cache
1. Still in **Resources** tab
2. Search for **"Heroku Redis"**
3. Select plan: **Mini** ($3/month)
4. Click **"Submit Order Form"**

#### Step 4: Configure Environment Variables
1. Go to **Settings** tab
2. Click **"Reveal Config Vars"**
3. Add these variables:

```bash
# Auto-added by addons:
DATABASE_URL=postgres://... (auto-added by Postgres addon)
REDIS_URL=redis://... (auto-added by Redis addon)

# Add these manually:
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
API_PREFIX=api/v1
SWAGGER_PATH=api/docs
```

#### Step 5: Connect to GitHub
1. Go to **Deploy** tab
2. Select **"GitHub"** as deployment method
3. Click **"Connect to GitHub"**
4. Search for repository: `DinhKimHungW/Hackathon_2025`
5. Click **"Connect"**

#### Step 6: Deploy
1. Scroll to **"Manual deploy"** section
2. Select branch: `main`
3. Click **"Deploy Branch"**
4. Wait 5-10 minutes for build to complete

#### Step 7: Run Database Migrations
1. Click **"More"** → **"Run console"**
2. Run command:
   ```bash
   cd backend && npm run migration:run
   ```
3. (Optional) Seed demo data:
   ```bash
   cd backend && npm run seed:demo
   ```

### Option 2: Deploy via Heroku CLI

```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create portlink-orchestrator

# 3. Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# 4. Add Redis
heroku addons:create heroku-redis:mini

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_EXPIRATION=1d
heroku config:set JWT_REFRESH_EXPIRATION=7d
heroku config:set CORS_ORIGIN=https://your-frontend.vercel.app
heroku config:set API_PREFIX=api/v1
heroku config:set SWAGGER_PATH=api/docs

# 6. Deploy
git push heroku main

# 7. Run migrations
heroku run "cd backend && npm run migration:run"

# 8. (Optional) Seed demo data
heroku run "cd backend && npm run seed:demo"

# 9. Open app
heroku open
```

## 🔍 Verify Deployment

### Check Health Endpoint
```bash
# Via browser or curl
curl https://portlink-orchestrator.herokuapp.com/api/v1/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "uptime": 123.45,
  "database": "connected",
  "redis": "connected",
  "environment": "production"
}
```

### Check API Documentation
Visit: `https://portlink-orchestrator.herokuapp.com/api/docs`

### Check Logs
```bash
# Real-time logs
heroku logs --tail

# Recent logs
heroku logs --num 500
```

## 📊 Frontend Deployment (Vercel)

Since Heroku is for backend only, deploy frontend separately:

### Step 1: Prepare Frontend
1. Update `frontend/.env.production`:
   ```bash
   VITE_API_BASE_URL=https://portlink-orchestrator.herokuapp.com
   VITE_WS_URL=wss://portlink-orchestrator.herokuapp.com
   ```

### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### Step 3: Update Backend CORS
```bash
# Update CORS_ORIGIN with Vercel URL
heroku config:set CORS_ORIGIN=https://your-app.vercel.app
```

## 💰 Cost Breakdown

### Backend (Heroku)
- **Dyno (Web Server)**: $5/month (Eco plan)
- **PostgreSQL**: $5/month (Essential-0)
- **Redis**: $3/month (Mini)
- **Total Backend**: **$13/month**

### Frontend (Vercel)
- **Hosting**: **FREE** (Hobby plan)
- **Bandwidth**: 100GB/month included
- **Build Time**: 100 hours/month included

### **Grand Total**: ~$13/month

### Student Discounts
- **Heroku**: No student discount available
- **GitHub Student Pack**: Includes $13/month Heroku credits for 1 year
  - Apply at: https://education.github.com/pack

## 🔧 Troubleshooting

### Build Failed
```bash
# Check build logs
heroku logs --tail

# Common issues:
# 1. Missing dependencies - check package.json
# 2. TypeScript errors - run `npm run build` locally first
# 3. Port binding - make sure app listens on process.env.PORT
```

### Database Connection Error
```bash
# Verify database URL
heroku config:get DATABASE_URL

# Test connection
heroku run "cd backend && npm run migration:run"

# Check database credentials
heroku pg:credentials:url
```

### Redis Connection Error
```bash
# Verify Redis URL
heroku config:get REDIS_URL

# Check Redis status
heroku redis:info

# Restart Redis
heroku redis:restart
```

### Application Crash
```bash
# Check error logs
heroku logs --tail

# Restart app
heroku restart

# Check dyno status
heroku ps
```

### Migration Failed
```bash
# Rollback last migration
heroku run "cd backend && npm run migration:revert"

# Re-run migrations
heroku run "cd backend && npm run migration:run"

# Check migration status
heroku run "cd backend && npm run typeorm migration:show"
```

## 🎯 Post-Deployment Tasks

### 1. Enable Automatic Deploys
1. Go to **Deploy** tab
2. Enable **"Automatic deploys"** from main branch
3. Enable **"Wait for CI to pass before deploy"** (if using GitHub Actions)

### 2. Setup Custom Domain (Optional)
```bash
# Add domain
heroku domains:add www.portlink.com

# Configure DNS:
# CNAME: www.portlink.com → portlink-orchestrator.herokuapp.com
```

### 3. Setup SSL Certificate
- Heroku provides free SSL automatically
- Your app will be accessible via HTTPS
- No additional configuration needed

### 4. Monitoring & Alerts
1. Go to **Resources** tab
2. Add **"Heroku Metrics"** (free)
3. Setup alerts for:
   - High error rate
   - Slow response time
   - Memory usage

### 5. Backup Database
```bash
# Create manual backup
heroku pg:backups:capture

# Schedule automatic backups
heroku pg:backups:schedule --at '02:00 America/Los_Angeles'

# List backups
heroku pg:backups
```

## 📚 Additional Resources

- [Heroku Node.js Documentation](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku PostgreSQL](https://devcenter.heroku.com/articles/heroku-postgresql)
- [Heroku Redis](https://devcenter.heroku.com/articles/heroku-redis)
- [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands)

## 🆘 Support

If you encounter issues:
1. Check logs: `heroku logs --tail`
2. Review this guide
3. Check Heroku Status: https://status.heroku.com/
4. Contact support: https://help.heroku.com/

## ✅ Deployment Checklist

- [ ] Heroku account created and verified
- [ ] Payment method added (required for addons)
- [ ] App created on Heroku
- [ ] PostgreSQL addon added
- [ ] Redis addon added
- [ ] Environment variables configured
- [ ] GitHub repository connected
- [ ] Branch deployed successfully
- [ ] Database migrations run
- [ ] Demo data seeded (optional)
- [ ] Health check endpoint verified
- [ ] API documentation accessible
- [ ] Frontend deployed to Vercel
- [ ] Backend CORS configured for frontend
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup
- [ ] Backups scheduled

---

**Ready to deploy!** 🚀 Follow the steps above and your PortLink Orchestrator will be live on Heroku!
