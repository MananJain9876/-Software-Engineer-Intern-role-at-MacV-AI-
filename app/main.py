from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging
import os

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
    try:
        # Quick DB connection test
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Task Management System API")
    logger.info(f"Database URL: {os.getenv('DATABASE_URL', 'Not set')}")
    logger.info(f"Redis URL: {os.getenv('CELERY_BROKER_URL', 'Not set')}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Task Management System API")