from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging

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
    title=settings.APP_NAME,
    openapi_url=f"/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS config for frontend access
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Hook up our API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Task Management System API"}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Quick DB connection test
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}