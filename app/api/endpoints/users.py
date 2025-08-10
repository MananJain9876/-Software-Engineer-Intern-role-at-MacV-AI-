from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import dependencies
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(dependencies.get_current_active_superuser),
) -> Any:
    """
    Retrieve users. Only for superusers.
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(dependencies.get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    email: str = Body(None),
    current_user: models.User = Depends(dependencies.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = schemas.UserUpdate(**current_user_data)
    if password is not None:
        user_in.password = password
    if full_name is not None:
        user_in.full_name = full_name
    if email is not None:
        user_in.email = email
    
    # Update user in database
    if user_in.password:
        hashed_password = get_password_hash(user_in.password)
        current_user.hashed_password = hashed_password
    if user_in.full_name:
        current_user.full_name = user_in.full_name
    if user_in.email:
        current_user.email = user_in.email
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user == current_user:
        return user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return user