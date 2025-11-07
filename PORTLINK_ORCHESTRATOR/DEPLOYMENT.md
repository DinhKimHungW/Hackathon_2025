# PortLink Orchestrator Deployment Guide

## Render.com Deployment (GitHub Student Pack)

### Prerequisites
- GitHub account with Student Pack benefits
- Render.com account linked to GitHub
- Repository pushed to GitHub

### Step 1: Prepare Environment Variables

Create a `.env.production` file (DO NOT commit this):

**Backend:**
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=<render-postgres-host>
DATABASE_PORT=5432
DATABASE_USER=<render-postgres-user>
DATABASE_PASSWORD=<render-postgres-password>
DATABASE_NAME=portlink_orchestrator
REDIS_HOST=<render-redis-host>
REDIS_PORT=6379
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=https://portlink-frontend.onrender.com
```

**Frontend:**
```env
VITE_API_BASE_URL=https://portlink-backend.onrender.com/api/v1
VITE_WS_URL=wss://portlink-backend.onrender.com
```

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Create PostgreSQL Database:**
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `portlink-db`
   - Database: `portlink_orchestrator`
   - User: `portlink_user`
   - Plan: Free (with Student Pack)
   - Region: Singapore

2. **Create Redis Instance:**
   - Go to Render Dashboard → New → Redis
   - Name: `portlink-redis`
   - Plan: Free
   - Region: Singapore

3. **Deploy Backend:**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Add environment variables from PostgreSQL and Redis
   - Plan: Free (or Starter with Student Pack)
   - Region: Singapore

4. **Deploy Frontend:**
   - Go to Render Dashboard → New → Static Site
   - Connect your GitHub repository
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add environment variables
   - Plan: Free
   - Region: Singapore

#### Option B: Using render.yaml (Infrastructure as Code)

1. Place `render.yaml` in repository root
2. Connect repository to Render
3. Render will auto-detect and deploy all services

### Step 3: Database Setup

After backend deployment, run migrations:

```bash
# SSH into backend service or use Render Shell
npm run migration:run
```

### Step 4: Seed Demo Data (Optional)

```bash
npm run seed:demo
```

### Step 5: Verify Deployment

1. Backend Health Check: `https://portlink-backend.onrender.com/health`
2. Frontend: `https://portlink-frontend.onrender.com`
3. API Docs: `https://portlink-backend.onrender.com/api/docs`

## Troubleshooting

### Build Failures

**Backend:**
- Check Node.js version (18.x required)
- Verify all dependencies in package.json
- Check build logs for TypeScript errors

**Frontend:**
- Ensure Vite build completes
- Verify environment variables are set
- Check for missing dependencies

### Runtime Issues

**Database Connection:**
- Verify DATABASE_* environment variables
- Check PostgreSQL instance is running
- Ensure IP allowlist includes Render IPs

**CORS Errors:**
- Update CORS_ORIGIN to match frontend URL
- Check backend CORS configuration

**Redis Connection:**
- Verify REDIS_* environment variables
- Check Redis instance status

### Performance Optimization

1. **Enable Caching:**
   - Use Redis for session storage
   - Implement HTTP caching headers

2. **Database Optimization:**
   - Add indexes for frequent queries
   - Use connection pooling

3. **Frontend:**
   - Enable gzip compression
   - Implement code splitting
   - Use CDN for static assets

## Monitoring

### Render Dashboard
- View logs in real-time
- Monitor resource usage
- Set up alerts

### Health Checks
- Backend: `GET /health`
- Database: Check connection pool

## Scaling (With Student Pack)

- Upgrade to Starter plan for better performance
- Enable auto-scaling
- Add more instances for high availability

## Security

1. **Environment Variables:**
   - Never commit .env files
   - Use Render's encrypted environment variables

2. **Database:**
   - Use strong passwords
   - Enable SSL connections
   - Restrict IP access

3. **API:**
   - Implement rate limiting
   - Use JWT for authentication
   - Enable CORS properly

## Costs (GitHub Student Pack)

- PostgreSQL: Free tier available
- Redis: Free tier available
- Web Services: Free tier for both backend/frontend
- Total: $0/month with free tier
- Upgrade options: Starter plan ~$7/month per service with Student discount

## Support

- Render Documentation: https://render.com/docs
- GitHub Student Pack: https://education.github.com/pack
- Community Support: https://community.render.com

## Maintenance

### Regular Tasks
1. Monitor error logs daily
2. Update dependencies monthly
3. Backup database weekly
4. Review security alerts

### Updates
```bash
# Pull latest changes
git pull origin main

# Render auto-deploys on push
git push origin main
```

## Rollback

If deployment fails:
1. Go to Render Dashboard
2. Select the service
3. Click "Manual Deploy"
4. Choose previous successful commit

---

**Last Updated:** November 7, 2025
**Version:** 1.0.0
