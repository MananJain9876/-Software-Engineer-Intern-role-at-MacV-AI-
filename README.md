# Task Management System API

A production-ready Task Management System API built with FastAPI, PostgreSQL, and Celery for background jobs.

## Features

- Create and manage projects and tasks
- Assign tasks to users
- Filter, sort, and paginate tasks
- Send email notifications when tasks are assigned or updated
- Handle background jobs with Celery workers
- Daily summary emails for overdue tasks
- Production-ready with Railway deployment support

## Tech Stack

- **FastAPI** - High-performance web framework
- **PostgreSQL** - Production database
- **SQLAlchemy ORM** - Database ORM
- **Alembic** - Database migrations
- **Celery** - Background task processing
- **Redis** - Message broker for Celery
- **JWT** - Authentication
- **Railway** - Cloud deployment platform

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Redis (optional, will fallback to eager mode)

### Local Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd fast
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set environment variables**
```bash
export DATABASE_URL="sqlite:///./taskmanagement.db"
export CELERY_BROKER_URL="redis://localhost:6379/0"
export CELERY_RESULT_BACKEND="redis://localhost:6379/0"
```

5. **Run the application**
```bash
uvicorn app.main:app --reload
```

## Production Deployment

### Railway Deployment (Recommended - 100% FREE!)

Railway is the perfect free alternative that doesn't require a credit card!

1. **Push your code to GitHub**
   ```bash
   ./deploy-railway.sh
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect it's a Python app

3. **Add Services**
   - **PostgreSQL**: Click "New" → "Database" → "PostgreSQL"
   - **Redis**: Click "New" → "Redis"
   - Railway automatically connects everything!

4. **Deploy**
   - Railway automatically builds and deploys your app
   - Get your URL: `https://your-app.railway.app`

### Environment Variables

Railway automatically sets most variables, but you can add:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Railway |
| `CELERY_BROKER_URL` | Redis connection string | Auto-set by Railway |
| `CELERY_RESULT_BACKEND` | Redis connection string | Auto-set by Railway |
| `SECRET_KEY` | JWT secret key | Generate random string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiry | `60` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `BACKEND_CORS_ORIGINS` | CORS origins | `*` |

## API Documentation

Once deployed, access the API documentation at:

- **Swagger UI**: `https://your-app.railway.app/docs`
- **ReDoc**: `https://your-app.railway.app/redoc`
- **Health Check**: `https://your-app.railway.app/health`

## Authentication

### Getting an Access Token

```bash
curl -X POST "https://your-app.railway.app/api/auth/login" \
     -H "Content-Type: application/x-application/x-www-form-urlencoded" \
     -d "username=your-email@example.com&password=your-password"
```

### Using the Token

```bash
curl -X GET "https://your-app.railway.app/api/projects/" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Migrations

For production deployments, run database migrations:

```bash
# Using Alembic
alembic upgrade head

# Or using the application (automatic on startup)
# The app will create tables automatically
```

## Monitoring and Health Checks

- **Health Endpoint**: `/health` - Database connectivity check
- **Logs**: Available in Railway dashboard
- **Metrics**: Built-in FastAPI metrics

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is set by Railway
   - Check if PostgreSQL service is running
   - Ensure database exists and is accessible

2. **Redis Connection Errors**
   - Verify Redis URLs are set by Railway
   - Check if Redis service is running
   - Application will fallback to eager mode if Redis is unavailable

3. **Build Failures**
   - Check Python version compatibility
   - Verify all dependencies in `requirements.txt`
   - Check Railway build logs

### Support

- Check Railway logs in the dashboard
- Verify environment variables are set correctly
- Test locally before deploying

## Why Railway?

- ✅ **100% Free** - No credit card required
- ✅ **Auto-deploy** from GitHub
- ✅ **PostgreSQL & Redis** included
- ✅ **Custom domains** supported
- ✅ **SSL certificates** automatic
- ✅ **Global CDN** included
- ✅ **Actually easier** than other platforms

## License

This project is open source and available under the [MIT License](LICENSE).