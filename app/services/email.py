import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import emails
from emails.template import JinjaTemplate

from app.core.config import settings


def send_email(
    email_to: str,
    subject_template: str = "",
    html_template: str = "",
    environment: Dict[str, Any] = {},
) -> None:
    """
    Send an email using the configured SMTP server.
    """
    assert settings.EMAILS_FROM_EMAIL
    message = emails.Message(
        subject=JinjaTemplate(subject_template),
        html=JinjaTemplate(html_template),
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, render=environment, smtp=smtp_options)
    logging.info(f"Send email result: {response}")


def send_task_assigned_email(
    email_to: str,
    task_title: str,
    project_name: str,
    due_date: Optional[str] = None,
) -> None:
    """
    Send an email notification when a task is assigned to a user.
    """
    subject = f"Task Assigned: {task_title}"
    html_template = f"""
    <p>You have been assigned a new task:</p>
    <p><strong>Task:</strong> {task_title}</p>
    <p><strong>Project:</strong> {project_name}</p>
    {'<p><strong>Due Date:</strong> ' + due_date + '</p>' if due_date else ''}
    <p>Please log in to the Task Management System to view more details.</p>
    """
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=html_template,
    )


def send_task_status_changed_email(
    email_to: str,
    task_title: str,
    old_status: str,
    new_status: str,
    project_name: str,
) -> None:
    """
    Send an email notification when a task's status changes.
    """
    subject = f"Task Status Changed: {task_title}"
    html_template = f"""
    <p>The status of a task assigned to you has changed:</p>
    <p><strong>Task:</strong> {task_title}</p>
    <p><strong>Project:</strong> {project_name}</p>
    <p><strong>Status Change:</strong> {old_status} → {new_status}</p>
    <p>Please log in to the Task Management System to view more details.</p>
    """
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=html_template,
    )


def send_overdue_tasks_summary_email(
    email_to: str,
    overdue_tasks: List[Dict[str, Any]],
) -> None:
    """
    Send a daily summary email of overdue tasks.
    """
    if not overdue_tasks:
        return
    
    subject = "Daily Summary: Overdue Tasks"
    
    tasks_html = ""
    for task in overdue_tasks:
        tasks_html += f"""
        <tr>
            <td>{task['title']}</td>
            <td>{task['project_name']}</td>
            <td>{task['due_date']}</td>
            <td>{task['priority']}</td>
        </tr>
        """
    
    html_template = f"""
    <p>You have the following overdue tasks:</p>
    <table border="1" cellpadding="5" cellspacing="0">
        <tr>
            <th>Task</th>
            <th>Project</th>
            <th>Due Date</th>
            <th>Priority</th>
        </tr>
        {tasks_html}
    </table>
    <p>Please log in to the Task Management System to update these tasks.</p>
    """
    
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=html_template,
    )