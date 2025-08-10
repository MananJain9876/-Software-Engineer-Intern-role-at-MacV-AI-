from datetime import datetime
from typing import Any, Dict, List, Optional
import logging

from celery import shared_task
from sqlalchemy.orm import Session

from app import models
from app.db.session import SessionLocal
from app.services.email import (
    send_overdue_tasks_summary_email,
    send_task_assigned_email,
    send_task_status_changed_email,
)
from app.services.celery_utils import safe_task

logger = logging.getLogger(__name__)


def get_db_session() -> Session:
    """
    Get a database session for Celery tasks.
    """
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        db.close()
        raise e


@shared_task
@safe_task
def notify_task_assigned(task_id: int) -> None:
    """
    Send an email notification when a task is assigned to a user.
    """
    db = get_db_session()
    try:
        # Get task with related project and assigned user
        task = (
            db.query(models.Task)
            .join(models.Project)
            .filter(models.Task.id == task_id)
            .first()
        )
        
        if not task or not task.assigned_user_id:
            return
        
        # Get assigned user
        user = db.query(models.User).filter(models.User.id == task.assigned_user_id).first()
        if not user or not user.email:
            return
        
        # Format due date if exists
        due_date_str = None
        if task.due_date:
            due_date_str = task.due_date.strftime("%Y-%m-%d")
        
        # Send email
        send_task_assigned_email(
            email_to=user.email,
            task_title=task.title,
            project_name=task.project.name,
            due_date=due_date_str,
        )
    finally:
        db.close()


@shared_task
@safe_task
def notify_task_status_changed(task_id: int, old_status: str, new_status: str) -> None:
    """
    Send an email notification when a task's status changes.
    """
    db = get_db_session()
    try:
        # Get task with related project and assigned user
        task = (
            db.query(models.Task)
            .join(models.Project)
            .filter(models.Task.id == task_id)
            .first()
        )
        
        if not task or not task.assigned_user_id:
            return
        
        # Get assigned user
        user = db.query(models.User).filter(models.User.id == task.assigned_user_id).first()
        if not user or not user.email:
            return
        
        # Send email
        send_task_status_changed_email(
            email_to=user.email,
            task_title=task.title,
            old_status=old_status,
            new_status=new_status,
            project_name=task.project.name,
        )
    finally:
        db.close()


@shared_task
@safe_task
def send_daily_overdue_tasks_summary() -> None:
    """
    Send a daily summary email of overdue tasks to each user.
    """
    db = get_db_session()
    try:
        # Get all active users
        users = db.query(models.User).filter(models.User.is_active == True).all()
        
        today = datetime.utcnow().date()
        
        for user in users:
            if not user.email:
                continue
            
            # Get overdue tasks for this user
            overdue_tasks = (
                db.query(models.Task)
                .join(models.Project)
                .filter(
                    models.Task.assigned_user_id == user.id,
                    models.Task.due_date < today,
                    models.Task.status != "DONE",
                )
                .all()
            )
            
            if not overdue_tasks:
                continue
            
            # Format tasks for email
            tasks_data = []
            for task in overdue_tasks:
                tasks_data.append({
                    "title": task.title,
                    "project_name": task.project.name,
                    "due_date": task.due_date.strftime("%Y-%m-%d"),
                    "priority": task.priority,
                })
            
            # Send email
            send_overdue_tasks_summary_email(
                email_to=user.email,
                overdue_tasks=tasks_data,
            )
    finally:
        db.close()