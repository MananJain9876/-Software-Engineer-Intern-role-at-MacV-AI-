from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine, Base, get_db
from app.models import user, project, task  # Need these imports for SQLAlchemy model registration
from app.worker import celery_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# DB tables setup - runs on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Management System API",
    description="A lightweight Task Management System API built with FastAPI, PostgreSQL, and Celery",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS config for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hook up our API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Task Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    health_status = {"status": "healthy"}
    
    # Check database connection
    try:
        # Quick DB connection test
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        health_status["database"] = {
            "status": "connected",
            "url_configured": os.getenv('DATABASE_URL') is not None
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database"] = {
            "status": "error",
            "message": str(e),
            "url_configured": os.getenv('DATABASE_URL') is not None
        }
    
    # Check Redis connection
    try:
        redis_url = os.getenv('CELERY_BROKER_URL')
        if redis_url:
            import redis
            r = redis.from_url(redis_url)
            r.ping()
            health_status["redis"] = {
                "status": "connected",
                "url_configured": True
            }
        else:
            health_status["redis"] = {
                "status": "not_configured",
                "url_configured": False
            }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["redis"] = {
            "status": "error",
            "message": str(e),
            "url_configured": os.getenv('CELERY_BROKER_URL') is not None
        }
    
    return health_status


@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Task Management System API")
    
    # Log database URL with masked password for security
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        # Mask password in the URL for logging
        masked_db_url = mask_password_in_url(db_url)
        logger.info(f"Database URL: {masked_db_url}")
    else:
        logger.info("Database URL: Not configured. Set DATABASE_URL environment variable.")
    
    # Log Redis URL with masked password for security
    redis_url = os.getenv('CELERY_BROKER_URL')
    if redis_url:
        # Mask password in the URL for logging
        masked_redis_url = mask_password_in_url(redis_url)
        logger.info(f"Redis URL: {masked_redis_url}")
    else:
        logger.info("Redis URL: Not configured. Set CELERY_BROKER_URL environment variable.")


def mask_password_in_url(url):
    """Mask password in a URL for secure logging."""
    try:
        import re
        # For URLs like postgresql://user:password@host:port/dbname
        # or redis://default:password@host:port
        return re.sub(r'(://[^:]+:)[^@]+(@)', r'\1*****\2', url)
    except Exception:
        # If any error occurs during masking, return a generic message
        return "URL configured but masked for security"


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Task Management System API")