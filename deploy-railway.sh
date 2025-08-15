#!/bin/bash

# Railway Deployment Script for Task Management System API
# This script helps deploy the application to Railway (100% FREE!)

echo "🚀 Railway Deployment Script (100% FREE!)"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Git remote origin not set. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/yourrepo.git"
    exit 1
fi

echo "✅ Git repository configured"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Add Railway deployment configuration $(date)"
git push origin master

echo ""
echo "🎉 Code pushed to GitHub successfully!"
echo ""
echo "📋 Next steps for Railway deployment:"
echo "1. Go to https://railway.app"
echo "2. Click 'Login with GitHub'"
echo "3. Click 'New Project'"
echo "4. Select 'Deploy from GitHub repo'"
echo "5. Choose your repository: $(basename -s .git $(git remote get-url origin))"
echo "6. Railway will automatically detect it's a Python app"
echo "7. Add PostgreSQL database: Click 'New' → 'Database' → 'PostgreSQL'"
echo "8. Add Redis service: Click 'New' → 'Redis'"
echo "9. Railway will automatically deploy your app!"
echo ""
echo "🔗 Your app will be available at: https://your-app.railway.app"
echo ""
echo "📚 For detailed instructions, see RAILWAY_DEPLOYMENT.md"
echo ""
echo "💡 Railway is actually EASIER than Render and 100% FREE!"
