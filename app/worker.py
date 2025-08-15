import os
from celery import Celery
from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "task_management",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.services.tasks.notify_task_assigned",
        "app.services.tasks.notify_task_status_changed",
        "app.services.tasks.send_daily_overdue_tasks_summary",
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Task routing
celery_app.conf.task_routes = {
    "app.services.tasks.*": {"queue": "celery"},
}

# Error handling and fallback
if not settings.CELERY_BROKER_URL or "redis" not in settings.CELERY_BROKER_URL:
    # Fallback to eager mode if Redis is not available
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True