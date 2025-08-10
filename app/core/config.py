import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, EmailStr, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"
    
    # BACKEND_CORS_ORIGINS is a comma-separated list of origins
    # e.g: "http://localhost:8000,http://localhost:3000"
    BACKEND_CORS_ORIGINS: List[str] = []

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
    DATABASE_URL: str
    DATABASE_TEST_URL: Optional[str] = None

    # Email settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # Celery settings
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    model_config = {
        "case_sensitive": True,
        "env_file": ".env"
    }


settings = Settings()