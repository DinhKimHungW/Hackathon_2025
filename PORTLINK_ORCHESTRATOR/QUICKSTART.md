# 🚀 PortLink Orchestrator - Render.com Deployment Quick Start

## GitHub Student Pack Setup

### 1. Get GitHub Student Pack (Free Credits!)
1. Go to https://education.github.com/pack
2. Verify your student status
3. Get access to Render.com with $200 credit/year

### 2. Pre-deployment Checklist

Run the deployment readiness check:
```bash
npm run deploy:check
```

Fix any errors before proceeding.

### 3. Push to GitHub

```bash
git add .
git commit -m "chore: prepare for render deployment"
git push origin main
```

### 4. Deploy on Render.com

#### Option A: Blueprint Deployment (Recommended)
1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select `PORTLINK_ORCHESTRATOR` repository
5. Render will detect `render.yaml` automatically
6. Click "Apply"
7. Set environment variables:
   - For backend: Update `CORS_ORIGIN` to frontend URL
   - For frontend: Update `VITE_API_BASE_URL` to backend URL
8. Wait for deployment (~10 minutes)

#### Option B: Manual Deployment
Follow detailed steps in `DEPLOYMENT.md`

### 5. Post-Deployment Setup

#### Update Environment Variables
Once services are deployed, update cross-references:

**Backend (`portlink-backend`):**
```env
CORS_ORIGIN=https://portlink-frontend.onrender.com
```

**Frontend (`portlink-frontend`):**
```env
VITE_API_BASE_URL=https://portlink-backend.onrender.com/api/v1
VITE_WS_URL=wss://portlink-backend.onrender.com
```

#### Run Database Migrations
Access backend shell in Render dashboard:
```bash
npm run migration:run
```

#### Seed Demo Data (Optional)
```bash
npm run seed:demo
```

### 6. Verify Deployment

✅ **Backend Health Check:**
```
https://portlink-backend.onrender.com/health
```

✅ **Frontend:**
```
https://portlink-frontend.onrender.com
```

✅ **API Docs:**
```
https://portlink-backend.onrender.com/api/docs
```

### 7. First Login

Default admin credentials (change after first login):
- Email: `admin@portlink.com`
- Password: Check seed data or create via API

## Costs with GitHub Student Pack

| Service | Regular Price | Student Price | Your Cost |
|---------|--------------|---------------|-----------|
| PostgreSQL | $7/month | Free tier | $0 |
| Redis | $5/month | Free tier | $0 |
| Backend API | $7/month | Covered by credits | $0 |
| Frontend | Free | Free | $0 |
| **Total** | **$19/month** | **Credits cover** | **$0/year** |

💡 **$200 annual credit** = ~10 months of full service or 24+ months with optimization

## Performance Tips

### Free Tier Optimization
1. Services spin down after 15 min of inactivity
2. First request after spin-down takes ~30-60 seconds
3. Use background jobs to keep services warm (optional)

### Upgrade to Starter Plan (Recommended for Production)
- Persistent services (no spin-down)
- Better performance
- Custom domains
- Cost: ~$7/month per service (covered by student credits)

## Monitoring

### Render Dashboard
- Real-time logs
- Resource usage
- Deploy history
- Metrics

### Set Up Alerts
1. Go to service settings
2. Enable "Deploy notifications"
3. Add webhook or email

## Troubleshooting

### Build Fails
```bash
# Check build logs in Render dashboard
# Common issues:
- Missing dependencies → check package.json
- TypeScript errors → run `npm run build` locally first
- Out of memory → upgrade plan or optimize build
```

### Runtime Errors
```bash
# Check application logs
# Common issues:
- Database connection → verify DATABASE_* env vars
- Redis connection → verify REDIS_* env vars
- CORS errors → verify CORS_ORIGIN matches frontend URL
```

### Database Issues
```bash
# Access database via Render dashboard
# Or use connection string:
psql <connection-string-from-render>
```

## Updating Your App

```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main

# Render auto-deploys on push!
# Watch deployment progress in dashboard
```

## Rollback

If deployment breaks:
1. Go to Render dashboard
2. Select service
3. Click "Rollback" to previous version
4. Or manually deploy specific commit

## Support Resources

- 📖 **Render Docs:** https://render.com/docs
- 🎓 **Student Pack:** https://education.github.com/pack
- 💬 **Community:** https://community.render.com
- 📧 **Support:** support@render.com

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure SSL (automatic)
3. ✅ Set up CI/CD with GitHub Actions
4. ✅ Enable monitoring and alerts
5. ✅ Configure backup schedules

---

**Need help?** Check `DEPLOYMENT.md` for detailed documentation.

**Pro tip:** Star this repo on GitHub to track updates! ⭐
