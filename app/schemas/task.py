from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.task import TaskPriority, TaskStatus


# Shared properties
class TaskBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None
    assigned_user_id: Optional[int] = None


# Properties to receive on task creation
class TaskCreate(TaskBase):
    title: str
    project_id: int


# Properties to receive on task update
class TaskUpdate(TaskBase):
    pass


# Properties shared by models stored in DB
class TaskInDBBase(TaskBase):
    id: int
    title: str
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime
    updated_at: datetime
    project_id: int

    class Config:
        from_attributes = True


# Properties to return to client
class Task(TaskInDBBase):
    pass


# Properties stored in DB
class TaskInDB(TaskInDBBase):
    pass