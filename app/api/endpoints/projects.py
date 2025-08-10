from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import dependencies

router = APIRouter()


@router.get("/", response_model=List[schemas.Project])
def read_projects(
    db: Session = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Retrieve projects for the current user.
    """
    projects = (
        db.query(models.Project)
        .filter(models.Project.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return projects


@router.post("/", response_model=schemas.Project)
def create_project(
    *,
    db: Session = Depends(dependencies.get_db),
    project_in: schemas.ProjectCreate,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Create new project.
    """
    project = models.Project(
        **project_in.dict(),
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=schemas.ProjectWithTasks)
def read_project(
    *,
    db: Session = Depends(dependencies.get_db),
    project_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Get project by ID with all tasks.
    """
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=schemas.Project)
def update_project(
    *,
    db: Session = Depends(dependencies.get_db),
    project_id: int,
    project_in: schemas.ProjectUpdate,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Update a project.
    """
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", response_model=schemas.Project)
def delete_project(
    *,
    db: Session = Depends(dependencies.get_db),
    project_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Delete a project.
    """
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return project