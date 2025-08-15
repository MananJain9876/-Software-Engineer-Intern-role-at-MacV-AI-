# Task Management System API

A production-ready Task Management System API built with FastAPI, PostgreSQL, and Celery for background jobs.

## Features

- Create and manage projects and tasks
- Assign tasks to users
- Filter, sort, and paginate tasks
- Send email notifications when tasks are assigned or updated
- Handle background jobs with Celery workers
- Daily summary emails for overdue tasks
- Production-ready with Docker and cloud deployment support

## Tech Stack

- **FastAPI** - High-performance web framework
- **PostgreSQL** - Production database
- **SQLAlchemy ORM** - Database ORM
- **Alembic** - Database migrations
- **Celery** - Background task processing
- **Redis** - Message broker for Celery
- **JWT** - Authentication
- **Docker** - Containerization

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Docker and Docker Compose
- Redis (optional, will fallback to eager mode)

### Local Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd fast
```

2. **Using Docker (Recommended)**
```bash
docker-compose up -d --build
```

3. **Manual Setup**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="sqlite:///./taskmanagement.db"
export CELERY_BROKER_URL="redis://localhost:6379/0"
export CELERY_RESULT_BACKEND="redis://localhost:6379/0"

# Run the application
uvicorn app.main:app --reload
```

## Production Deployment

### Render Deployment (Recommended)

1. **Fork/Clone this repository to your GitHub account**

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" and select "Web Service"

3. **Configure the Web Service**
   - **Name**: `task-management-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or choose paid plan for production)

4. **Add Environment Variables**
   - `DATABASE_URL`: Will be provided by Render PostgreSQL service
   - `SECRET_KEY`: Generate a secure random string
   - `CELERY_BROKER_URL`: Will be provided by Render Redis service
   - `CELERY_RESULT_BACKEND`: Will be provided by Render Redis service

5. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `taskmanagement`
   - Plan: Free (or choose paid plan for production)
   - Copy the `DATABASE_URL` to your web service environment variables

6. **Add Redis Service**
   - Click "New +" → "Redis"
   - Name: `task-management-redis`
   - Plan: Free (or choose paid plan for production)
   - Copy the `REDIS_URL` to your web service environment variables as `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND`

7. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Alternative: One-Click Deploy with render.yaml

If you have the `render.yaml` file in your repository:

1. **Connect to Render**
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Render will automatically create all services based on the blueprint**

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Or run individual services
docker-compose up -d db redis
docker-compose up -d api
docker-compose up -d celery-worker celery-beat
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `sqlite:///./taskmanagement.db` |
| `CELERY_BROKER_URL` | Redis connection string | `redis://localhost:6379/0` |
| `CELERY_RESULT_BACKEND` | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT secret key | Auto-generated |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiry | `60` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `BACKEND_CORS_ORIGINS` | CORS origins | `*` |

## API Documentation

Once deployed, access the API documentation at:

- **Swagger UI**: `https://your-app.onrender.com/docs`
- **ReDoc**: `https://your-app.onrender.com/redoc`
- **Health Check**: `https://your-app.onrender.com/health`

## Authentication

### Getting an Access Token

```bash
curl -X POST "https://your-app.onrender.com/api/auth/login" \
     -H "Content-Type: application/x-application/x-www-form-urlencoded" \
     -d "username=your-email@example.com&password=your-password"
```

### Using the Token

```bash
curl -X GET "https://your-app.onrender.com/api/projects/" \
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
- **Logs**: Available in Render dashboard
- **Metrics**: Built-in FastAPI metrics

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Check if PostgreSQL service is running
   - Ensure database exists and is accessible

2. **Redis Connection Errors**
   - Verify `CELERY_BROKER_URL` is correct
   - Check if Redis service is running
   - Application will fallback to eager mode if Redis is unavailable

3. **Build Failures**
   - Check Python version compatibility
   - Verify all dependencies in `requirements.txt`
   - Check build logs in Render dashboard

### Support

- Check Render logs in the dashboard
- Verify environment variables are set correctly
- Test locally with Docker before deploying

## License

This project is open source and available under the [MIT License](LICENSE).