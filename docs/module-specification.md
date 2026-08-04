# Flowra — Core Module Specifications

This document defines the functional boundaries, core responsibilities, data flow, inputs, outputs, and edge cases for Flowra's 10 integrated modules.

---

## Module 1 — Authentication & Authorization

### Description
Handles secure onboarding, authentication, role assignment, and access control. It shields api routes on the backend and restricts layout visibility on the frontend.

* **Core Responsibilities:** User registration, password hashing (bcrypt), login session emission (JWT secure cookie), logout clearing, and role-based route protection.
* **Primary Inputs:**
  * Register: Name, Email, Password, Role selection.
  * Login: Email, Password.
* **Primary Outputs:** Signed HTTP-Only cookie containing JWT token, JSON profile payload (id, name, email, role).
* **Edge Cases & Failure Modes:**
  * *Duplicate Email:* Handled by a pre-save check in the database model and database index constraints, returning a `409 Conflict` response to the client.
  * *Compromised Tokens:* Expired JWT tokens will trigger automatic redirection to the login page via Axios interceptors catching `401 Unauthorized` responses.
  * *Password Quality:* Frontend enforces real-time checking; backend re-validates strength before hashing, rejecting weak combinations with `400 Bad Request`.

---

## Module 2 — User & Profile Management

### Description
Allows users to manage their identity and admins to regulate account lifecycles and role escalations.

* **Core Responsibilities:** Personal profile view/update, password modification, profile avatar configuration, user listings, and global deactivation control.
* **Primary Inputs:** Name, password, profileImage URL/file. (For Admin: Target User ID, status state, assigned role).
* **Primary Outputs:** Updated User document in JSON format.
* **Edge Cases & Failure Modes:**
  * *Account Deactivation:* If an active user is deactivated by an Admin, their current session JWT must be invalidated. The backend middleware checks the `isActive` state on every protected request; if false, it immediately returns `403 Forbidden` and clears cookies.
  * *Role Escalation:* A Team Member cannot modify their own role. Role modification endpoints are protected strictly with Admin-only middleware.

---

## Module 3 — Project Management

### Description
Provides the central container for teamwork, defining timelines, progress parameters, and high-level goals.

* **Core Responsibilities:** Project CRUD (Create, Read, Update, Delete), status transitions, priority management, and automated progress monitoring.
* **Primary Inputs:** Name, Description, priority (LOW, MEDIUM, HIGH), status (PLANNING, etc.), startDate, deadline, projectManagerId.
* **Primary Outputs:** Created/Updated Project object, automatically calculated Progress field.
* **Edge Cases & Failure Modes:**
  * *Project Deletion Safety:* When a project is deleted, all dependent tasks, comments, activities, and notifications must not be left orphaned. The system will run a transactional cascade delete or set an active/archive flag.
  * *Deadline Violations:* Start date cannot be later than the deadline. The backend model validates: `deadline >= startDate`.

---

## Module 4 — Team & Member Management

### Description
Defines the collaboration circle of a project, allocating responsibilities and calculating workload.

* **Core Responsibilities:** Team member registration to project, member deletion, responsibility assignment, and user workload measurement.
* **Primary Inputs:** Project ID, Target User ID, responsibility title.
* **Primary Outputs:** Updated Project document (updated `members` array), member workload statistics.
* **Edge Cases & Failure Modes:**
  * *Duplicate Assignment:* A user cannot be added to the same project twice. Mongoose pre-save hooks validate uniqueness within the `members` array.
  * *PM Removal:* A project must always have at least one Project Manager. The system blocks the removal or role-change of the last Project Manager on a project.

---

## Module 5 — Task Management

### Description
The primary action engine, breaking down projects into trackable units of work.

* **Core Responsibilities:** Task CRUD, assignee management, task status workflow updates, subtask checklist operations, searching, and multi-criteria filtering.
* **Primary Inputs:** Project ID, Title, Description, assignedTo (User ID), priority, status, deadline, subtasks list.
* **Primary Outputs:** Task document, checklist progress stats.
* **Edge Cases & Failure Modes:**
  * *Assignee Leaving Project:* If a member is removed from a project, any tasks assigned to them must handle reassignment. The system automatically shifts the status of those tasks to "Unassigned" and fires a notification to the PM.
  * *Workflow Violations:* Status transitions should adhere to the linear sequence where logical: `TO DO` → `IN PROGRESS` → `REVIEW` → `COMPLETED`. While arbitrary shifts are supported, moving to `COMPLETED` requires all critical subtasks to be checked off.

---

## Module 6 — Collaboration & Activity Management

### Description
Facilitates team communication and records a clear, chronological audit trail of project developments.

* **Core Responsibilities:** Threaded commenting, comment replies, activity logging, and task update histories.
* **Primary Inputs:** Comment content, parentCommentId (optional), task/project references, activity action metadata.
* **Primary Outputs:** Comment JSON structure (hydrated with User details), Activity stream.
* **Edge Cases & Failure Modes:**
  * *Deep Nesting Clutter:* To preserve screen space and maintain visual simplicity, the database supports arbitrary nesting, but the frontend UI strictly flattens or limits threading to 2 levels deep (Comment -> Reply).
  * *Comment Erasure:* Deleting a comment that has replies can cause visual separation. The system leaves the comment node intact but replaces its content with *"This comment has been deleted"* (similar to Reddit/Linear).

---

## Module 7 — Notification & Reminder System

### Description
An event-driven feedback loop keeping users informed about workload changes, deadlines, and communication updates.

* **Core Responsibilities:** Event-triggered notification distribution, unread/read state tracking, and notification aggregation.
* **Primary Inputs:** Recipient ID, type, title, message body, context references (Project / Task ID).
* **Primary Outputs:** List of notifications, count of unread notifications.
* **Edge Cases & Failure Modes:**
  * *Notification Spanning:* If a user is mentioned multiple times in the same thread, the system aggregates notifications (e.g., *"John Doe and 2 others commented on Task X"*) instead of flooding the user's inbox.
  * *Stale Reminders:* Reminders for tasks that have already transitioned to `COMPLETED` are automatically purged or suppressed by the notification scheduler.

---

## Module 8 — AI Project Assistant

### Description
One of Flowra's primary differentiators. A project-aware assistant that utilizes the metadata of current projects to help managers and developers make smart decisions.

```text
       Project Goal / Task / Metrics
                   │
                   ▼
         AI Processing Server
                   │
                   ▼
  Suggested JSON Response (No DB write!)
                   │
                   ▼
     Interactive Checklist in UI
                   │
                   ▼
 [User Reviews, Modifies & Approves]
                   │
                   ▼
      MongoDB Collections Written
```

* **Core Responsibilities:**
  1. **AI Task Generator:** Converts project descriptions into a structured sequence of tasks.
  2. **Task Breakdown:** Converts a dense task description into an actionable checkbox list.
  3. **Priority Suggestions:** Recommends priority tiers based on scheduling and workloads.
  4. **Project Summary:** Combines completed/pending/overdue task states into natural language statuses.
  5. **Risk Detection:** Identifies bottleneck workloads, overdue risks, and timeline slips.
* **Primary Inputs:** Raw user prompts, project structure (hydrated tasks, deadlines, team capacities).
* **Primary Outputs:** Structured JSON containing recommended tasks/checklist, risk scores, summaries.
* **Edge Cases & Failure Modes:**
  * *API Timeout or Outage:* If the LLM provider fails, the system must not block. Flowra intercepts timeouts, returns a polite fallback message, and allows manual task generation with standard forms.
  * *Hallucinations:* AI output is strictly isolated from the main database. No database records are created or modified without explicit user review, check/uncheck actions, and final click confirmation on the frontend.

---

## Module 9 — Dashboard & Analytics

### Description
Converts raw project data into actionable charts, tracking productivity, team workload, and project milestones.

* **Core Responsibilities:** KPI calculations, progress mapping, data visualization (using Recharts), and AI-insights compiling.
* **Primary Inputs:** Project tasks, statuses, assignee workloads.
* **Primary Outputs:** Progress percentages, data streams for bar/donut/line charts, AI insights messages.
* **Edge Cases & Failure Modes:**
  * *Zero Data / Cold Start:* If a new user logs in and has no projects, the dashboard must not show blank charts or console errors. It gracefully displays styled "Empty States" with prompt buttons to "Create Your First Project" or "Try the AI Assistant".
  * *Caching Stale Data:* Analytics are computed dynamically. To avoid heavy MongoDB queries on every refresh, the backend caches computations for 5 minutes or updates them incrementally upon major mutations.

---

## Module 10 — Admin & System Management

### Description
The operational hub for regulating global system parameters, moderating user content, and analyzing platform-wide statistics.

* **Core Responsibilities:** Global system status views, user lists with status toggling, global role assignment, and inappropriate content removal.
* **Primary Inputs:** User ID, role assignment, active/inactive state, deletion flags.
* **Primary Outputs:** System-wide counts (Users, Projects, Active Nodes), updated user records.
* **Edge Cases & Failure Modes:**
  * *Self-Deactivation:* The system blocks an active Admin from deactivating their own account, preventing lockouts.
  * *Cascading Admins:* At least one master Admin account must exist. If there is only one Admin in the database, the system rejects any attempts to downgrade their role or deactivate their account.
