# 🚀 Render Deployment Guide

This guide will walk you through deploying your Task Management System API to Render in just a few steps.

## Prerequisites

- GitHub account
- Render account (free at [render.com](https://render.com))
- Your project code pushed to GitHub

## 🎯 Quick Deploy (Recommended)

### Option 1: One-Click Deploy with Blueprint

1. **Push your code to GitHub**
   ```bash
   ./deploy.sh
   ```

2. **Go to Render**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

3. **Use Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically create all services!

### Option 2: Manual Deploy

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Name**: `task-management-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

2. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - **Name**: `taskmanagement`
   - **Plan**: Free
   - Copy the `DATABASE_URL`

3. **Add Redis Service**
   - Click "New +" → "Redis"
   - **Name**: `task-management-redis`
   - **Plan**: Free
   - Copy the `REDIS_URL`

4. **Configure Environment Variables**
   ```
   DATABASE_URL=<your-postgresql-url>
   CELERY_BROKER_URL=<your-redis-url>
   CELERY_RESULT_BACKEND=<your-redis-url>
   SECRET_KEY=<generate-random-string>
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ALGORITHM=HS256
   BACKEND_CORS_ORIGINS=*
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

## 🔧 Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | From PostgreSQL service | Database connection |
| `CELERY_BROKER_URL` | From Redis service | Redis connection |
| `CELERY_RESULT_BACKEND` | From Redis service | Redis connection |
| `SECRET_KEY` | Random string | JWT encryption |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 60 | Token expiry time |
| `ALGORITHM` | HS256 | JWT algorithm |
| `BACKEND_CORS_ORIGINS` | * | CORS settings |

## 📱 After Deployment

Your API will be available at:
- **API**: `https://your-app.onrender.com`
- **Docs**: `https://your-app.onrender.com/docs`
- **Health**: `https://your-app.onrender.com/health`

## 🧪 Test Your Deployment

1. **Health Check**
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. **API Documentation**
   - Visit `https://your-app.onrender.com/docs`
   - Test the endpoints directly

3. **Create a User**
   ```bash
   curl -X POST "https://your-app.onrender.com/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
   ```

## 🚨 Troubleshooting

### Build Failures
- Check Python version (3.11+)
- Verify `requirements.txt` is correct
- Check build logs in Render dashboard

### Database Issues
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL service is running
- Ensure database exists

### Redis Issues
- Verify Redis URLs are correct
- Check if Redis service is running
- App will fallback to eager mode if Redis is unavailable

### Common Errors
- **Port binding**: Make sure to use `$PORT` in start command
- **Database connection**: Wait for PostgreSQL to be ready
- **Dependencies**: Check if all packages are in `requirements.txt`

## 📊 Monitoring

- **Logs**: Available in Render dashboard
- **Health**: Use `/health` endpoint
- **Metrics**: Built-in FastAPI metrics
- **Uptime**: Render provides uptime monitoring

## 🔄 Updates

To update your deployment:

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Update deployment"
   git push origin main
   ```

2. **Render will automatically redeploy**

## 💰 Costs

- **Free Tier**: $0/month (with limitations)
- **Paid Plans**: Starting from $7/month
- **Database**: Free tier available
- **Redis**: Free tier available

## 🆘 Support

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Render Community**: [community.render.com](https://community.render.com)
- **Project Issues**: Check GitHub repository

---

**🎉 Congratulations! Your Task Management System API is now deployed and accessible worldwide!**
