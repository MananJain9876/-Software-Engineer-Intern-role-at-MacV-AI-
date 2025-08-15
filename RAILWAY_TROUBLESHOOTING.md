# Railway Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Issues

**Symptoms:**
- Health check shows "database: error"
- Logs show "Database URL: Not set"
- Application fails to start with database-related errors

**Solutions:**

1. **Check Environment Variables**
   - Ensure `DATABASE_URL` is properly set in Railway dashboard
   - The URL should be in format: `postgresql://postgres:password@hostname:port/railway`
   - Copy the exact URL from the PostgreSQL service's "Connect" tab

2. **Verify PostgreSQL Service**
   - Make sure the PostgreSQL service is running in your Railway project
   - Check the PostgreSQL service logs for any errors

3. **Test Database Connection**
   - Use the provided connection command to test directly:
     ```
     PGPASSWORD=your_password psql -h hostname -U postgres -p port -d railway
     ```

### 2. Redis Connection Issues

**Symptoms:**
- Health check shows "redis: error"
- Celery workers fail to start
- Background tasks don't execute

**Solutions:**

1. **Check Environment Variables**
   - Ensure `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` are properly set
   - The URL should be in format: `redis://default:password@hostname:port`
   - Make sure to include the `default:` part before the password
   - Copy the exact URL from the Redis service's "Connect" tab

2. **Verify Redis Service**
   - Make sure the Redis service is running in your Railway project
   - Check the Redis service logs for any errors

### 3. Application Fails to Start

**Symptoms:**
- Deployment shows as failed
- Logs show Python errors

**Solutions:**

1. **Check Logs**
   - Review the application logs in the Railway dashboard
   - Look for specific error messages

2. **Verify Python Version**
   - Railway uses Python 3.11+ by default
   - Make sure your code is compatible

3. **Check Dependencies**
   - Ensure all required packages are in `requirements.txt`
   - Check for version conflicts

### 4. Environment Variable Issues

**Symptoms:**
- Application starts but features don't work
- Authentication fails
- Emails don't send

**Solutions:**

1. **Use the Railway Variables UI**
   - Go to your app service in Railway dashboard
   - Click on the "Variables" tab
   - Add all required variables

2. **Use the Provided Script**
   - Run the `railway-env-setup.sh` script locally
   - Follow the instructions to set up all required variables

### 5. Deployment Stuck or Slow

**Solutions:**

1. **Check Railway Status**
   - Visit [Railway Status](https://status.railway.app)
   - Check if there are any ongoing issues

2. **Restart Deployment**
   - Click "Redeploy" in the Railway dashboard

## Getting Help

If you're still experiencing issues after trying these solutions:

1. Check the [Railway Documentation](https://docs.railway.app)
2. Join the [Railway Discord](https://discord.gg/railway)
3. Open an issue on the GitHub repository

## Useful Commands

### Test PostgreSQL Connection
```bash
PGPASSWORD=your_password psql -h hostname -U postgres -p port -d railway
```

### View Application Logs
In the Railway dashboard:
1. Go to your app service
2. Click on the "Logs" tab

### Redeploy Application
In the Railway dashboard:
1. Go to your app service
2. Click on the "Deployments" tab
3. Click "Redeploy"