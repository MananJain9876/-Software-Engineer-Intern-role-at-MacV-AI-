# Task Management System API Endpoints

This document provides a comprehensive list of all API endpoints available for testing in the Task Management System.

## Base URL

All API endpoints are prefixed with: `http://localhost:8000/api`

## Authentication

Most endpoints require authentication. To authenticate, you need to obtain a JWT token.

### Get Access Token

```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Register New User

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password",
  "full_name": "New User"
}
```

## User Endpoints

### Get All Users (Superuser Only)

```
GET /users/
```

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

### Get Current User

```
GET /users/me
```

### Update Current User

```
PUT /users/me
```

**Request Body:**
```json
{
  "password": "new_password",  // Optional
  "full_name": "Updated Name",  // Optional
  "email": "updated@example.com"  // Optional
}
```

### Get User by ID

```
GET /users/{user_id}
```

## Project Endpoints

### Get All Projects

```
GET /projects/
```

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

### Create New Project

```
POST /projects/
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description"
}
```

### Get Project with Tasks

```
GET /projects/{project_id}
```

### Update Project

```
PATCH /projects/{project_id}
```

**Request Body:**
```json
{
  "name": "Updated Project Name",  // Optional
  "description": "Updated description"  // Optional
}
```

### Delete Project

```
DELETE /projects/{project_id}
```

## Task Endpoints

### Get All Tasks

```
GET /tasks/
```

**Query Parameters:**
- `status`: Filter by task status (TODO, IN_PROGRESS, DONE)
- `priority`: Filter by task priority (LOW, MEDIUM, HIGH)
- `due_date`: Filter by due date
- `project_id`: Filter by project ID
- `sort`: Sort by field (priority, due_date)
- `sort_order`: Sort direction (asc, desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Create New Task

```
POST /tasks/
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "project_id": 1,
  "status": "TODO",  // TODO, IN_PROGRESS, DONE
  "priority": "MEDIUM",  // LOW, MEDIUM, HIGH
  "due_date": "2023-12-31",
  "assigned_user_id": 1  // Optional
}
```

### Get Task by ID

```
GET /tasks/{task_id}
```

### Update Task

```
PATCH /tasks/{task_id}
```

**Request Body:**
```json
{
  "title": "Updated Task Title",  // Optional
  "description": "Updated description",  // Optional
  "status": "IN_PROGRESS",  // Optional
  "priority": "HIGH",  // Optional
  "due_date": "2023-12-31",  // Optional
  "assigned_user_id": 2  // Optional
}
```

### Delete Task

```
DELETE /tasks/{task_id}
```

## Other Endpoints

### Root Endpoint

```
GET /
```

**Response:**
```json
{
  "message": "Welcome to the Task Management System API"
}
```

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## Authentication Header

For authenticated endpoints, include the token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN
```

## Example cURL Commands

### Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=user@example.com&password=password"
```

### Create a Project

```bash
curl -X POST "http://localhost:8000/api/projects/" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "New Project", "description": "Project description"}'
```

### List Tasks with Filtering and Sorting

```bash
curl -X GET "http://localhost:8000/api/tasks/?status=TODO&priority=HIGH&sort=due_date&page=1&limit=10" \
     -H "Authorization: Bearer YOUR_TOKEN"
```