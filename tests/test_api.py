import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app

# Use an in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_db.db"

engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    # Create the database and tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test user
    from app.core.security import get_password_hash
    from app.models.user import User
    from app.models.project import Project
    from app.models.task import Task, TaskStatus, TaskPriority
    
    db = TestingSessionLocal()
    
    # Create test user
    test_user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password"),
        full_name="Test User",
        is_active=True,
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # Create test project
    test_project = Project(
        name="Test Project",
        description="This is a test project",
        owner_id=test_user.id,
    )
    db.add(test_project)
    db.commit()
    db.refresh(test_project)
    
    # Create test task
    test_task = Task(
        title="Test Task",
        description="This is a test task",
        status=TaskStatus.TODO,
        priority=TaskPriority.MEDIUM,
        project_id=test_project.id,
        assigned_user_id=test_user.id,
    )
    db.add(test_task)
    db.commit()
    
    db.close()
    
    # Override the get_db dependency
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield
    
    # Clean up
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_client(test_db):
    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="function")
def test_token(test_client):
    response = test_client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "password"},
    )
    return response.json()["access_token"]


def test_read_main(test_client):
    response = test_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Task Management System API"}


def test_login(test_client):
    response = test_client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_read_projects(test_client, test_token):
    response = test_client.get(
        "/api/projects/",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Test Project"


def test_read_tasks(test_client, test_token):
    response = test_client.get(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Test Task"


def test_create_project(test_client, test_token):
    response = test_client.post(
        "/api/projects/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"name": "New Project", "description": "This is a new project"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Project"


def test_create_task(test_client, test_token):
    # First get a project_id
    projects_response = test_client.get(
        "/api/projects/",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    project_id = projects_response.json()[0]["id"]
    
    response = test_client.post(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "title": "New Task",
            "description": "This is a new task",
            "project_id": project_id,
            "status": "TODO",
            "priority": "HIGH",
        },
    )
    assert response.status_code == 200
    assert response.json()["title"] == "New Task"
    assert response.json()["priority"] == "HIGH"