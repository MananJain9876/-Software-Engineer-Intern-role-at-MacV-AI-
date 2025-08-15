#!/bin/bash

# Railway Environment Variables Setup Script
# This script helps you set up environment variables for your Railway deployment

echo "🚂 Railway Environment Variables Setup"
echo "======================================"

echo "\nThis script will help you set up the required environment variables for your Railway deployment.\n"

echo "Step 1: Get your PostgreSQL connection details from Railway\n"
echo "1. Go to your Railway dashboard: https://railway.app/dashboard"
echo "2. Select your project"
echo "3. Click on your PostgreSQL service"
echo "4. Go to the 'Connect' tab"
echo "5. Copy the 'PostgreSQL Connection URL'"
echo "   Example: postgresql://postgres:password@hostname:port/railway\n"

read -p "Enter your PostgreSQL Connection URL: " db_url

echo "\nStep 2: Get your Redis connection details from Railway\n"
echo "1. Go to your Railway dashboard: https://railway.app/dashboard"
echo "2. Select your project"
echo "3. Click on your Redis service"
echo "4. Go to the 'Connect' tab"
echo "5. Copy the 'Redis Connection URL'"
echo "   Example: redis://default:password@hostname:port\n"
echo "   Note: Make sure to use the full URL including 'default:' before the password\n"

read -p "Enter your Redis Connection URL: " redis_url

echo "\nStep 3: Set a secure secret key for JWT authentication\n"
echo "This will be used to sign your JWT tokens. It should be a random string.\n"

# Generate a random secret key
secret_key=$(openssl rand -hex 32)
echo "Generated secret key: $secret_key"

echo "\nStep 4: Setting up environment variables in Railway\n"
echo "1. Go to your Railway dashboard: https://railway.app/dashboard"
echo "2. Select your project"
echo "3. Click on your app service (not the database or Redis)"
echo "4. Go to the 'Variables' tab"
echo "5. Add the following variables:\n"

echo "DATABASE_URL=$db_url"
echo "CELERY_BROKER_URL=$redis_url"
echo "CELERY_RESULT_BACKEND=$redis_url"
echo "SECRET_KEY=$secret_key"
echo "ACCESS_TOKEN_EXPIRE_MINUTES=60"
echo "ALGORITHM=HS256"
echo "BACKEND_CORS_ORIGINS=*"

echo "\n✅ Environment variables setup complete!\n"
echo "Copy these variables to your Railway dashboard as instructed above.\n"
echo "After setting the variables, Railway will automatically redeploy your application.\n"