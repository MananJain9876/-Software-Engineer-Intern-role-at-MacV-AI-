from functools import wraps
import logging

logger = logging.getLogger(__name__)

def safe_task(func):
    """
    A decorator for Celery tasks that catches exceptions and logs them
    instead of failing the task. This is useful for tasks that should not
    block the main application flow if they fail.
    
    Usage:
        @shared_task
        @safe_task
        def my_task():
            # task implementation
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Task {func.__name__} failed: {str(e)}")
            # You can add additional error handling here if needed
    return wrapper