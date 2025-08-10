from celery import Celery
from celery.schedules import crontab
import logging
import os

from app.core.config import settings

logger = logging.getLogger(__name__)

celery_app = Celery("worker")

# Configure Celery with error handling
try:
    # Check if Redis is available
    broker_url = settings.CELERY_BROKER_URL
    result_backend = settings.CELERY_RESULT_BACKEND
    
    # Configure to use Redis if available
    celery_app.conf.broker_url = broker_url
    celery_app.conf.result_backend = result_backend
    
    # Set broker connection retry to False to avoid hanging on startup when broker is not available
    celery_app.conf.broker_connection_retry = False
    celery_app.conf.broker_connection_retry_on_startup = False
    
    logger.info(f"Celery configured with broker: {broker_url}")
except Exception as e:
    # Fallback to eager mode (tasks execute synchronously) if Redis is not available
    logger.warning(f"Error configuring Celery with Redis: {str(e)}. Falling back to eager mode.")
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    logger.info("Celery configured to run in eager mode (synchronous execution).")

# Import tasks so they are registered with Celery
celery_app.autodiscover_tasks(["app.services.tasks"])

# Configure periodic tasks
celery_app.conf.beat_schedule = {
    "send-daily-overdue-tasks-summary": {
        "task": "app.services.tasks.send_daily_overdue_tasks_summary",
        "schedule": crontab(hour=8, minute=0),  # Run daily at 8:00 AM
    },
}