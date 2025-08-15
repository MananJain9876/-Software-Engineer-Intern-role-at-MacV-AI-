# 🚀 Railway Deployment Guide (100% Free!)

This guide will help you deploy your Task Management System API to Railway for **FREE** without requiring a credit card!

## 🆓 **Why Railway?**

- ✅ **100% Free** - No credit card required for basic usage
- ✅ **Auto-deploy** from GitHub
- ✅ **PostgreSQL** database included
- ✅ **Redis** service available
- ✅ **Custom domains** supported
- ✅ **SSL certificates** automatic
- ✅ **Global CDN** included

## 🚀 **Quick Deploy Steps**

### **Step 1: Push Your Code**
```bash
git add .
git commit -m "Add Railway deployment config"
git push origin master
```

### **Step 2: Go to Railway**
1. Visit [railway.app](https://railway.app)
2. Click "Login with GitHub"
3. Authorize Railway to access your repositories

### **Step 3: Deploy Your App**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `-Software-Engineer-Intern-role-at-MacV-AI-`
4. Railway will automatically detect it's a Python app

### **Step 4: Add PostgreSQL Database**
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically connect it to your app
3. The `DATABASE_URL` will be automatically set

### **Step 5: Add Redis Service**
1. Click "New" → "Redis"
2. Railway will automatically connect it to your app
3. The Redis URLs will be automatically set

### **Step 6: Set Environment Variables**
Railway will automatically set most variables, but you can add:
```
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256
BACKEND_CORS_ORIGINS=*
```

### **Step 7: Deploy**
1. Railway will automatically build and deploy your app
2. You'll get a URL like: `https://your-app.railway.app`

## 🔧 **Railway Configuration**

The `railway.json` file I created tells Railway:
- How to build your app
- How to start your app
- Health check settings
- Restart policies

## 📱 **After Deployment**

Your API will be available at:
- **API**: `https://your-app.railway.app`
- **Docs**: `https://your-app.railway.app/docs`
- **Health**: `https://your-app.railway.app/health`

## 🧪 **Test Your Deployment**

1. **Health Check**
   ```bash
   curl https://your-app.railway.app/health
   ```

2. **API Documentation**
   - Visit `https://your-app.railway.app/docs`
   - Test endpoints directly

3. **Create a User**
   ```bash
   curl -X POST "https://your-app.railway.app/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
   ```

## 💰 **Free Tier Limits**

- **Deployments**: Unlimited
- **Build minutes**: 500 minutes/month
- **Database**: 1GB storage
- **Bandwidth**: 100GB/month
- **Custom domains**: 1 domain

## 🔄 **Updates**

To update your deployment:
1. Push changes to GitHub
2. Railway automatically redeploys!

## 🚨 **Troubleshooting**

### **Build Failures**
- Check if `requirements.txt` is correct
- Verify Python version compatibility
- Check Railway build logs

### **Database Issues**
- Verify `DATABASE_URL` is set
- Check if PostgreSQL service is running
- Ensure database exists

### **Redis Issues**
- Verify Redis URLs are set
- Check if Redis service is running
- App will fallback to eager mode if Redis is unavailable

## 🆘 **Support**

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Community**: Very active and helpful

## 🎯 **Alternative: Local Development**

If you prefer to run locally:
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="sqlite:///./taskmanagement.db"
export CELERY_BROKER_URL="redis://localhost:6379/0"
export CELERY_RESULT_BACKEND="redis://localhost:6379/0"

# Run the app
uvicorn app.main:app --reload
```

---

**🎉 Railway is the perfect free alternative to Render! No credit card needed, and it's actually easier to use!**
