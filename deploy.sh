#!/bin/bash

# Task Management System API Deployment Script
# This script helps deploy the application to Render or other cloud platforms

echo "🚀 Task Management System API Deployment Script"
echo "=============================================="

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
    echo "   git remote add origin https://github.com/MananJain9876/-Software-Engineer-Intern-role-at-MacV-AI-"
    exit 1
fi

echo "✅ Git repository configured"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy to production $(date)"
git push origin main

echo ""
echo "🎉 Code pushed to GitHub successfully!"
echo ""
echo "📋 Next steps for Render deployment:"
echo "1. Go to https://render.com"
echo "2. Sign up/Login with your GitHub account"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository"
echo "5. Configure the service:"
echo "   - Name: task-management-api"
echo "   - Environment: Python 3"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
echo "6. Add environment variables (see README.md for details)"
echo "7. Click 'Create Web Service'"
echo ""
echo "🔗 Alternative: Use the render.yaml blueprint for one-click deployment!"
echo ""
echo "📚 For detailed instructions, see README.md"
