# Task Management System API

A lightweight Task Management System API built with FastAPI, PostgreSQL, and Celery for background jobs.

## Features

- Create and manage projects and tasks
- Assign tasks to users
- Filter, sort, and paginate tasks
- Send email notifications when tasks are assigned or updated
- Handle background jobs with Celery workers
- Daily summary emails for overdue tasks

## Tech Stack

- FastAPI - High-performance web framework
- PostgreSQL/SQLite - Database options
- SQLAlchemy ORM - Database ORM
- Alembic - Database migrations
- Celery - Background task processing
- Redis - Message broker for Celery
- JWT - Authentication
- Docker - Containerization

## Database Schema

![Database Schema](db_schema.png)

The database consists of three main tables:
- **Users**: Stores user information and authentication details
- **Projects**: Contains project information
- **Tasks**: Stores task details with references to projects and assigned users

## Setup Instructions

### Local Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd task-management-system
```

2. **Create a virtual environment and install dependencies**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. **Run database migrations**

```bash
alembic upgrade head
```

5. **Initialize the database with test data (optional)**

```bash
python init_db.py
```

6. **Start the application**

```bash
uvicorn app.main:app --reload
```

7. **Install and start Redis (required for Celery)**

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server
```

8. **Start the Celery worker**

```bash
celery -A app.worker worker --loglevel=info
```

9. **Start the Celery beat scheduler (for periodic tasks)**

```bash
celery -A app.worker beat --loglevel=info
```

### Docker Setup

1. **Build and start the containers**

```bash
docker-compose up -d --build
```

This will start the following services:
- API server (FastAPI) - http://localhost:8000
- PostgreSQL database
- Redis message broker
- Celery worker
- Celery beat scheduler

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Authentication

### Getting an Access Token

To get an access token, make a POST request to `/api/auth/login` with your credentials:

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=test@example.com&password=password"
```

The response will contain an access token:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Using the Token

Use the returned token in the Authorization header for subsequent requests:

```bash
curl -X GET "http://localhost:8000/api/projects/" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

## Celery Worker Setup

The application uses Celery for handling asynchronous tasks and scheduled jobs.

### Task Types

1. **Email Notifications**:
   - When a task is assigned to a user
   - When a task's status changes

2. **Scheduled Tasks**:
   - Daily summary emails of overdue tasks (runs at 8:00 AM)

### Configuration

The Celery worker is configured in `app/worker.py` with the following features:

- **Fault Tolerance**: The worker includes error handling to prevent task failures from affecting the main application
- **Fallback Mode**: If Redis is unavailable, the worker automatically falls back to "eager mode" (synchronous execution)
- **Safe Task Execution**: Tasks are wrapped with a `@safe_task` decorator that catches and logs exceptions

### Environment Variables

Celery configuration is controlled by these environment variables in `.env`:

```
# For local development
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# For Docker
# CELERY_BROKER_URL=redis://redis:6379/0
# CELERY_RESULT_BACKEND=redis://redis:6379/0
```

## Sample API Requests

### Create a Project

```bash
curl -X POST "http://localhost:8000/api/projects/" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "New Project", "description": "Project description"}'
```

### Create a Task

```bash
curl -X POST "http://localhost:8000/api/tasks/" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "New Task", "description": "Task description", "project_id": 1, "status": "TODO", "priority": "MEDIUM", "due_date": "2023-12-31"}'
```

### List Tasks with Filtering and Sorting

```bash
curl -X GET "http://localhost:8000/api/tasks/?status=TODO&priority=HIGH&sort=due_date&page=1&limit=10" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Redis Connection Issues

If you encounter Redis connection errors:

1. Ensure Redis is running: `redis-cli ping` should return `PONG`
2. Check your Redis connection settings in `.env`
3. The application will continue to function in eager mode, but tasks will run synchronously

### Database Issues

If you encounter database connection errors:

1. Check your database connection settings in `.env`
2. For PostgreSQL, ensure the database server is running
3. For SQLite, ensure the application has write permissions to the database file