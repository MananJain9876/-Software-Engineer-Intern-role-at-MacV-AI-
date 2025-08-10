from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import dependencies
from app.models.task import TaskPriority, TaskStatus
from app.services.tasks import notify_task_assigned, notify_task_status_changed

router = APIRouter()


@router.get("/", response_model=List[schemas.Task])
def read_tasks(
    *,
    db: Session = Depends(dependencies.get_db),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    due_date: Optional[datetime] = None,
    project_id: Optional[int] = None,
    sort: Optional[str] = Query(None, description="Sort by: priority, due_date"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Retrieve tasks for the current user with filtering, sorting, and pagination.
    """
    # Calculate offset for pagination
    skip = (page - 1) * limit
    
    # Start building the query
    query = db.query(models.Task).join(models.Project)
    
    # Apply filters
    query = query.filter(models.Project.owner_id == current_user.id)
    
    if status:
        query = query.filter(models.Task.status == status)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if due_date:
        query = query.filter(models.Task.due_date == due_date)
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    
    # Apply sorting
    if sort:
        sort_column = None
        if sort == "priority":
            sort_column = models.Task.priority
        elif sort == "due_date":
            sort_column = models.Task.due_date
        
        if sort_column:
            if sort_order.lower() == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
    
    # Apply pagination
    tasks = query.offset(skip).limit(limit).all()
    
    return tasks


@router.post("/", response_model=schemas.Task)
def create_task(
    *,
    db: Session = Depends(dependencies.get_db),
    task_in: schemas.TaskCreate,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Create new task.
    """
    # Check if project exists and belongs to the current user
    project = db.query(models.Project).filter(
        models.Project.id == task_in.project_id,
        models.Project.owner_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create task
    task = models.Task(**task_in.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Send notification if task is assigned to a user
    if task.assigned_user_id:
        try:
            notify_task_assigned.delay(task.id)
        except Exception as e:
            # Log the error but don't fail the task creation
            print(f"Warning: Could not send notification: {str(e)}")
    
    return task


@router.get("/{task_id}", response_model=schemas.Task)
def read_task(
    *,
    db: Session = Depends(dependencies.get_db),
    task_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Get task by ID.
    """
    task = db.query(models.Task).join(models.Project).filter(
        models.Task.id == task_id,
        models.Project.owner_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=schemas.Task)
def update_task(
    *,
    db: Session = Depends(dependencies.get_db),
    task_id: int,
    task_in: schemas.TaskUpdate,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Update a task.
    """
    task = db.query(models.Task).join(models.Project).filter(
        models.Task.id == task_id,
        models.Project.owner_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if status is being updated
    old_status = task.status
    old_assigned_user_id = task.assigned_user_id
    
    # Update task fields
    update_data = task_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Send notifications if needed
    if task.status != old_status:
        try:
            notify_task_status_changed.delay(task.id, str(old_status), str(task.status))
        except Exception as e:
            # Log the error but don't fail the task update
            print(f"Warning: Could not send status change notification: {str(e)}")
    
    if task.assigned_user_id and task.assigned_user_id != old_assigned_user_id:
        try:
            notify_task_assigned.delay(task.id)
        except Exception as e:
            # Log the error but don't fail the task update
            print(f"Warning: Could not send assignment notification: {str(e)}")
    
    return task


@router.delete("/{task_id}", response_model=schemas.Task)
def delete_task(
    *,
    db: Session = Depends(dependencies.get_db),
    task_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Delete a task.
    """
    task = db.query(models.Task).join(models.Project).filter(
        models.Task.id == task_id,
        models.Project.owner_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return task