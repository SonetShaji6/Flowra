# Flowra — Week 3 API Test Matrix

This matrix documents the verification of all backend REST endpoints across Flowra's 10 core modules, testing both successful workflows and security/validation negative cases.

**Test Execution Date:** 2026-08-23  
**Total Endpoints Tested:** 51  
**Passed:** 51  
**Failed:** 0  
**Overall Status:** **100% PASS**

---

## 1. Test Summary by Module

| Module | Name | Total Tests | Passed | Failed | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **0** | Health Check | 1 | 1 | 0 | PASS |
| **1** | Authentication & Authorization | 8 | 8 | 0 | PASS |
| **2** | User & Profile Management | 5 | 5 | 0 | PASS |
| **3** | Project Management | 5 | 5 | 0 | PASS |
| **4** | Team & Member Management | 3 | 3 | 0 | PASS |
| **5** | Task Management | 8 | 8 | 0 | PASS |
| **6** | Collaboration & Comments | 5 | 5 | 0 | PASS |
| **7** | Notifications | 2 | 2 | 0 | PASS |
| **8** | AI Project Assistant | 4 | 4 | 0 | PASS |
| **9** | Dashboard & Analytics | 3 | 3 | 0 | PASS |
| **10** | Admin & System Management | 7 | 7 | 0 | PASS |
| **Total** | | **51** | **51** | **0** | **100% PASS** |

---

## 2. Detailed Endpoint Test Matrix

| Module | Endpoint | Method | Auth | Expected HTTP | Actual HTTP | Status | Verification Notes |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Health** | `/api/health` | GET | None | 200 | 200 | PASS | Server health status returns `{ success: true }` |
| **Auth** | `/api/auth/register` (PM) | POST | None | 201 | 201 | PASS | Creates Project Manager, returns JWT cookie & token |
| **Auth** | `/api/auth/register` (Member) | POST | None | 201 | 201 | PASS | Creates Team Member, returns JWT cookie & token |
| **Auth** | `/api/auth/register` (Duplicate) | POST | None | 409 | 409 | PASS | Rejects duplicate email registration with 409 Conflict |
| **Auth** | `/api/auth/login` (PM) | POST | None | 200 | 200 | PASS | Authenticates user credentials, sets session token |
| **Auth** | `/api/auth/login` (Bad Pass) | POST | None | 401 | 401 | PASS | Rejects invalid credentials with 401 Unauthorized |
| **Auth** | `/api/auth/me` | GET | Auth | 200 | 200 | PASS | Retrieves authenticated user profile data |
| **Auth** | `/api/auth/me` (No Token) | GET | None | 401 | 401 | PASS | Rejects unauthenticated request with 401 Unauthorized |
| **Auth** | `/api/auth/logout` | POST | Auth | 200 | 200 | PASS | Clears session cookie, returns 200 OK |
| **Users** | `/api/users/me` | GET | Auth | 200 | 200 | PASS | Returns current user profile details |
| **Users** | `/api/users/me` | PATCH | Auth | 200 | 200 | PASS | Updates user display name and profile fields |
| **Users** | `/api/users/me/password` | PATCH | Auth | 200 | 200 | PASS | Validates current password and updates to new password |
| **Users** | `/api/users` | GET | Auth | 200 | 200 | PASS | Returns active users list for assignment and team invite |
| **Users** | `/api/users/:id` | GET | Auth | 200 | 200 | PASS | Returns single user details by ID |
| **Projects** | `/api/projects` | POST | PM | 201 | 201 | PASS | Creates project, assigns manager, initializes 0% progress |
| **Projects** | `/api/projects` (Member) | POST | Member | 403 | 403 | PASS | Rejects unauthorized project creation by Team Member |
| **Projects** | `/api/projects` | GET | Auth | 200 | 200 | PASS | Returns projects filtered by user access & role |
| **Projects** | `/api/projects/:id` | GET | Auth | 200 | 200 | PASS | Returns populated project details with manager and members |
| **Projects** | `/api/projects/:id` | PATCH | PM | 200 | 200 | PASS | Updates project metadata (priority, dates, status) |
| **Team** | `/api/projects/:id/members` | POST | PM | 200 | 200 | PASS | Adds active user to project team, emits notification |
| **Team** | `/api/projects/:id/members` (Dup) | POST | PM | 400 | 400 | PASS | Rejects duplicate member addition with 400 Bad Request |
| **Team** | `/api/projects/:id/members` | GET | Auth | 200 | 200 | PASS | Returns project member directory and manager details |
| **Tasks** | `/api/tasks` | POST | PM | 201 | 201 | PASS | Creates task with subtasks, emits assignment notification |
| **Tasks** | `/api/tasks?project=:id` | GET | Auth | 200 | 200 | PASS | Returns tasks filtered by project ID |
| **Tasks** | `/api/tasks?status=TODO` | GET | Auth | 200 | 200 | PASS | Filters tasks by status and priority |
| **Tasks** | `/api/tasks?search=Landing` | GET | Auth | 200 | 200 | PASS | Case-insensitive title and description search |
| **Tasks** | `/api/tasks/:id` | GET | Auth | 200 | 200 | PASS | Returns populated task details with assignees |
| **Tasks** | `/api/tasks/:id/status` (IN_PROGRESS) | PATCH | Auth | 200 | 200 | PASS | Updates task status to IN_PROGRESS, emits activity |
| **Tasks** | `/api/tasks/:id/status` (COMPLETED) | PATCH | Auth | 200 | 200 | PASS | Updates task to COMPLETED, triggers progress recalculation |
| **Projects** | Progress Calculation Check | GET | Auth | 100 | 100 | PASS | Automatically recalculated project progress to 100% |
| **Comments** | `/api/comments` | POST | Auth | 201 | 201 | PASS | Creates comment on task, emits notification to assignees |
| **Comments** | `/api/comments?taskId=:id` | GET | Auth | 200 | 200 | PASS | Returns chronological comments thread for task |
| **Comments** | `/api/comments/:id` | PATCH | Auth | 200 | 200 | PASS | Updates comment content by author or Admin |
| **Activities** | `/api/activities/project/:id` | GET | Auth | 200 | 200 | PASS | Returns chronological audit log of project events |
| **Activities** | `/api/activities` | GET | Auth | 200 | 200 | PASS | Returns global recent activity stream |
| **Notifications** | `/api/notifications` | GET | Auth | 200 | 200 | PASS | Returns recipient-isolated notifications with unread count |
| **Notifications** | `/api/notifications/read-all` | PATCH | Auth | 200 | 200 | PASS | Marks all notifications for user as read |
| **AI** | `/api/ai/generate-tasks` | POST | Auth | 200 | 200 | PASS | Generates structured task suggestions with review workflow |
| **AI** | `/api/ai/breakdown-task` | POST | Auth | 200 | 200 | PASS | Generates subtask decomposition for complex deliverables |
| **AI** | `/api/ai/project-summary` | POST | Auth | 200 | 200 | PASS | Generates contextual executive summary & health status |
| **AI** | `/api/ai/risk-analysis` | POST | Auth | 200 | 200 | PASS | Scans overdue tasks and returns structured risk mitigations |
| **Analytics** | `/api/analytics/overview` | GET | Auth | 200 | 200 | PASS | Returns KPI totals, status breakdowns, and user stats |
| **Analytics** | `/api/analytics/projects/:id` | GET | Auth | 200 | 200 | PASS | Returns project completion rate, status and priority distribution |
| **Analytics** | `/api/analytics/team` | GET | Auth | 200 | 200 | PASS | Returns team member workload distribution |
| **Admin** | `/api/admin/statistics` | GET | Admin | 200 | 200 | PASS | Returns system health, total entities, and platform metrics |
| **Admin** | `/api/admin/statistics` (PM) | GET | PM | 403 | 403 | PASS | Rejects non-admin access to platform stats with 403 Forbidden |
| **Admin** | `/api/admin/users` | GET | Admin | 200 | 200 | PASS | Returns complete user directory with role & status filters |
| **Admin** | `/api/admin/projects` | GET | Admin | 200 | 200 | PASS | Returns system-wide project directory with manager info |
| **Admin** | `/api/admin/activities` | GET | Admin | 200 | 200 | PASS | Returns system-wide activity audit log |
| **Admin** | `/api/users/:id/status` | PATCH | Admin | 200 | 200 | PASS | Activates / deactivates user accounts |
| **Admin** | `/api/users/:id/role` | PATCH | Admin | 200 | 200 | PASS | Updates user role (ADMIN, PROJECT_MANAGER, TEAM_MEMBER) |
