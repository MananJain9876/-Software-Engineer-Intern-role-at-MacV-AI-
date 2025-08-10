from typing import List, Optional

from pydantic import BaseModel

from app.schemas.task import Task


# Shared properties
class ProjectBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# Properties to receive on project creation
class ProjectCreate(ProjectBase):
    name: str


# Properties to receive on project update
class ProjectUpdate(ProjectBase):
    pass


# Properties shared by models stored in DB
class ProjectInDBBase(ProjectBase):
    id: int
    name: str
    owner_id: int

    class Config:
        orm_mode = True


# Properties to return to client
class Project(ProjectInDBBase):
    pass


# Properties to return to client with tasks
class ProjectWithTasks(ProjectInDBBase):
    tasks: List[Task] = []


# Properties stored in DB
class ProjectInDB(ProjectInDBBase):
    pass