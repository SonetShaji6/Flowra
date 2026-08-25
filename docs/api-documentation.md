# Flowra — Complete API Documentation

**API Base URL:** `http://localhost:5001/api` *(or deployed cloud domain)*  
**Authentication:** JWT Bearer Token in `Authorization: Bearer <token>` header or `token` httpOnly cookie.

---

## Module 1: Authentication & Authorization

### 1. Register User
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public
* **Body:**
  ```json
  {
    "name": "Sarah Jenkins",
    "email": "sarah@flowra.app",
    "password": "Password123!",
    "role": "PROJECT_MANAGER"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "data": {
      "id": "6a8b00206a78aa15301bfe7d",
      "name": "Sarah Jenkins",
      "email": "sarah@flowra.app",
      "role": "PROJECT_MANAGER"
    }
  }
  ```

### 2. Login User
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Body:**
  ```json
  {
    "email": "sarah@flowra.app",
    "password": "Password123!"
  }
  ```
* **Response (200 OK):** Returns JWT token and user profile.

### 3. Current Authenticated User
* **Endpoint:** `GET /api/auth/me`
* **Access:** Authenticated

### 4. Logout
* **Endpoint:** `POST /api/auth/logout`
* **Access:** Authenticated

---

## Module 2: User & Profile Management

### 1. Get Profile
* **Endpoint:** `GET /api/users/me`
* **Access:** Authenticated

### 2. Update Profile
* **Endpoint:** `PATCH /api/users/me`
* **Access:** Authenticated
* **Body:** `{ "name": "Sarah J.", "bio": "Lead PM" }`

### 3. Update Password
* **Endpoint:** `PATCH /api/users/me/password`
* **Access:** Authenticated
* **Body:** `{ "currentPassword": "Password123!", "newPassword": "NewPassword123!" }`

### 4. List Active Users
* **Endpoint:** `GET /api/users`
* **Access:** Authenticated

---

## Module 3: Project Management

### 1. Create Project
* **Endpoint:** `POST /api/projects`
* **Access:** Project Manager / Admin
* **Body:**
  ```json
  {
    "name": "College Event Management System",
    "description": "AI-driven portal for fest registrations and ticketing.",
    "priority": "HIGH",
    "status": "ACTIVE",
    "deadline": "2026-10-31T00:00:00.000Z"
  }
  ```

### 2. List Projects
* **Endpoint:** `GET /api/projects`
* **Access:** Authenticated

### 3. Get Project Details
* **Endpoint:** `GET /api/projects/:id`
* **Access:** Authenticated

### 4. Update Project
* **Endpoint:** `PATCH /api/projects/:id`
* **Access:** Project Manager / Admin

### 5. Delete Project
* **Endpoint:** `DELETE /api/projects/:id`
* **Access:** Project Manager / Admin

---

## Module 4: Team & Member Management

### 1. Add Team Member
* **Endpoint:** `POST /api/projects/:id/members`
* **Access:** Project Manager / Admin
* **Body:** `{ "userId": "6a8b005609e7a351a5ef072d" }`

### 2. Remove Team Member
* **Endpoint:** `DELETE /api/projects/:id/members/:userId`
* **Access:** Project Manager / Admin

### 3. Get Project Members
* **Endpoint:** `GET /api/projects/:id/members`
* **Access:** Authenticated

---

## Module 5: Task Management

### 1. Create Task
* **Endpoint:** `POST /api/tasks`
* **Access:** Authenticated
* **Body:**
  ```json
  {
    "project": "6a8b005909e7a351a5ef0741",
    "title": "Implement QR Scanner",
    "description": "Build responsive QR ticket scanner.",
    "priority": "HIGH",
    "status": "TODO",
    "assignedTo": "6a8b005609e7a351a5ef072d",
    "subtasks": [
      { "title": "Camera decoder component", "isCompleted": false }
    ]
  }
  ```

### 2. List Tasks
* **Endpoint:** `GET /api/tasks?project=:id&status=TODO&priority=HIGH&search=QR`
* **Access:** Authenticated

### 3. Update Task Status
* **Endpoint:** `PATCH /api/tasks/:id/status`
* **Access:** Authenticated
* **Body:** `{ "status": "IN_PROGRESS" }` *(Triggers project progress recalculation)*

---

## Module 6: Collaboration & Comments

### 1. Add Comment
* **Endpoint:** `POST /api/comments`
* **Access:** Authenticated
* **Body:** `{ "task": ":id", "project": ":id", "content": "QR module integrated." }`

### 2. Get Task Comments
* **Endpoint:** `GET /api/comments?taskId=:id`
* **Access:** Authenticated

---

## Module 7: Notifications

### 1. Get Notifications
* **Endpoint:** `GET /api/notifications`
* **Access:** Authenticated

### 2. Mark All Read
* **Endpoint:** `PATCH /api/notifications/read-all`
* **Access:** Authenticated

---

## Module 8: AI Project Assistant

### 1. Generate Task Suggestions
* **Endpoint:** `POST /api/ai/generate-tasks`
* **Access:** Authenticated
* **Body:** `{ "projectId": ":id", "goal": "Build ticket checkout portal" }`
* **Response:** `{ "success": true, "data": { "tasks": [...] } }`

### 2. Task Breakdown
* **Endpoint:** `POST /api/ai/breakdown-task`
* **Access:** Authenticated
* **Body:** `{ "taskId": ":id" }`

### 3. Executive Project Summary
* **Endpoint:** `POST /api/ai/project-summary`
* **Access:** Authenticated
* **Body:** `{ "projectId": ":id" }`

### 4. Risk Analysis
* **Endpoint:** `POST /api/ai/risk-analysis`
* **Access:** Authenticated
* **Body:** `{ "projectId": ":id" }`

---

## Module 9: Analytics & Metrics

### 1. Overview Metrics
* **Endpoint:** `GET /api/analytics/overview`
* **Access:** Authenticated

### 2. Project Analytics
* **Endpoint:** `GET /api/analytics/projects/:id`
* **Access:** Authenticated

### 3. Team Workload Analytics
* **Endpoint:** `GET /api/analytics/team`
* **Access:** Authenticated

---

## Module 10: Admin & System Management

### 1. System Platform Statistics
* **Endpoint:** `GET /api/admin/statistics`
* **Access:** Admin Only (403 for other roles)

### 2. User Directory Management
* **Endpoint:** `GET /api/admin/users`
* **Access:** Admin Only

### 3. Update User Status
* **Endpoint:** `PATCH /api/users/:id/status`
* **Access:** Admin Only
* **Body:** `{ "isActive": false }`

### 4. Update User Role
* **Endpoint:** `PATCH /api/users/:id/role`
* **Access:** Admin Only
* **Body:** `{ "role": "ADMIN" }`
