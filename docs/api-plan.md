# Flowra — API Plan

This document outlines the REST API structure, endpoints, authentication requirements, and role-based access for Flowra.

---

## 1. Base URL & Common Headers

* **Base URL:** `https://api.flowra.com/api` (Production) or `http://localhost:5001/api` (Local)
* **Default Headers:**
  * `Content-Type: application/json`
* **Authentication:**
  * Bearer token (JWT) passed via HTTP-Only Cookie or `Authorization` header.

---

## 2. API Groups

### Auth & User Profile (`/api/auth`)

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| POST | `/register` | No | Any | Register a new user. |
| POST | `/login` | No | Any | Login and receive JWT cookie. |
| POST | `/logout` | Yes | Any | Clear session cookie. |
| GET | `/me` | Yes | Any | Get current user profile. |
| PUT | `/profile` | Yes | Any | Update profile details / image. |
| PUT | `/change-password` | Yes | Any | Update user password. |

### Users (Admin Only) (`/api/users`)

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| GET | `/` | Yes | ADMIN | List all registered users. |
| GET | `/:id` | Yes | ADMIN | Get specific user details. |
| PATCH | `/:id/status` | Yes | ADMIN | Activate/Deactivate user. |
| PATCH | `/:id/role` | Yes | ADMIN | Change user system role. |

### Projects (`/api/projects`)

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| GET | `/` | Yes | Any | List projects (scoped by role/assignment). |
| POST | `/` | Yes | PM, ADMIN | Create a new project. |
| GET | `/:id` | Yes | Any | Get project details. |
| PUT | `/:id` | Yes | PM, ADMIN | Update project metadata. |
| DELETE | `/:id` | Yes | PM, ADMIN | Delete/Archive project. |
| POST | `/:id/members` | Yes | PM, ADMIN | Add member to project team. |
| DELETE | `/:id/members/:userId` | Yes | PM, ADMIN | Remove member from project. |

### Tasks (`/api/tasks`)

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| GET | `/project/:projectId` | Yes | Any | List all tasks for a project. |
| POST | `/` | Yes | Any | Create a new task. |
| GET | `/:id` | Yes | Any | Get task details. |
| PUT | `/:id` | Yes | Any | Update task title, desc, assignee. |
| PATCH | `/:id/status` | Yes | Any | Transition task status (Kanban move). |
| PATCH | `/:id/subtasks` | Yes | Any | Toggle subtask completion state. |
| DELETE | `/:id` | Yes | PM, ADMIN | Delete a task. |

### Collaboration (`/api/comments`, `/api/activities`)

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| GET | `/comments/task/:taskId` | Yes | Any | Get threaded comments for a task. |
| POST | `/comments` | Yes | Any | Post a new comment or reply. |
| DELETE | `/comments/:id` | Yes | Any | Delete own comment (or any for Admin). |
| GET | `/activities/project/:projectId` | Yes | Any | Get project activity feed. |

### Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| GET | `/` | Yes | Any | Get user's notifications. |
| PATCH | `/:id/read` | Yes | Any | Mark notification as read. |
| PATCH | `/read-all` | Yes | Any | Mark all as read. |

### AI Assistant (`/api/ai`)

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| POST | `/generate-tasks` | Yes | PM, ADMIN | Generate tasks from project goals. |
| POST | `/breakdown-task` | Yes | Any | Generate subtasks for a single task. |
| POST | `/priority-suggestion`| Yes | Any | Suggest priority based on context. |
| GET | `/project-summary/:id` | Yes | PM, ADMIN | Get AI summary of project health. |
| GET | `/risk-detection/:id` | Yes | PM, ADMIN | Get AI risk/bottleneck analysis. |

### Analytics (`/api/analytics`)

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| GET | `/dashboard` | Yes | Any | Get dashboard KPI cards data. |
| GET | `/project/:id` | Yes | Any | Get charts data for a specific project. |
| GET | `/system-health` | Yes | ADMIN | Get global system usage stats. |
