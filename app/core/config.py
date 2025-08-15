import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, EmailStr, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Task Management System API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    
    # BACKEND_CORS_ORIGINS is a comma-separated list of origins
    # e.g: "http://localhost:8000,http://localhost:3000"
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @classmethod
    def validate_backend_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
        
    model_config = {
        "validate_assignment": True,
        "json_schema_extra": {
            "BACKEND_CORS_ORIGINS": {"pre": True, "validator": validate_backend_cors_origins}
        }
    }

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./taskmanagement.db")
    DATABASE_TEST_URL: Optional[str] = os.getenv("DATABASE_TEST_URL")

    # Email settings
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"
    SMTP_PORT: Optional[int] = int(os.getenv("SMTP_PORT", "587")) if os.getenv("SMTP_PORT") else None
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: Optional[EmailStr] = os.getenv("EMAILS_FROM_EMAIL")
    EMAILS_FROM_NAME: Optional[str] = os.getenv("EMAILS_FROM_NAME")

    # Celery settings
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    model_config = {
        "case_sensitive": True,
        "env_file": ".env"
    }


settings = Settings()