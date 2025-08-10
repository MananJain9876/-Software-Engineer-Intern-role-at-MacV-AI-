import logging

from sqlalchemy.orm import Session

from app import models
from app.core.security import get_password_hash
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db() -> None:
    db = SessionLocal()
    try:
        # Check if we already have users
        user = db.query(models.User).first()
        if user:
            logger.info("Database already initialized, skipping")
            return

        # Create test user
        logger.info("Creating test user")
        test_user = models.User(
            email="test@example.com",
            hashed_password=get_password_hash("password"),
            full_name="Test User",
            is_active=True,
            is_superuser=True,
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        # Create test project
        logger.info("Creating test project")
        test_project = models.Project(
            name="Test Project",
            description="This is a test project",
            owner_id=test_user.id,
        )
        db.add(test_project)
        db.commit()
        db.refresh(test_project)

        # Create test tasks
        logger.info("Creating test tasks")
        test_tasks = [
            models.Task(
                title="Task 1",
                description="This is task 1",
                status=models.TaskStatus.TODO,
                priority=models.TaskPriority.HIGH,
                project_id=test_project.id,
                assigned_user_id=test_user.id,
            ),
            models.Task(
                title="Task 2",
                description="This is task 2",
                status=models.TaskStatus.IN_PROGRESS,
                priority=models.TaskPriority.MEDIUM,
                project_id=test_project.id,
                assigned_user_id=test_user.id,
            ),
            models.Task(
                title="Task 3",
                description="This is task 3",
                status=models.TaskStatus.DONE,
                priority=models.TaskPriority.LOW,
                project_id=test_project.id,
                assigned_user_id=test_user.id,
            ),
        ]
        db.add_all(test_tasks)
        db.commit()

        logger.info("Database initialized successfully")
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Initializing database")
    init_db()