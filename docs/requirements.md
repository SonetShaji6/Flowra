# Flowra — Functional & Non-Functional Requirements

This document details the functional scope of Flowra's 10 core modules, alongside its technical and architectural non-functional requirements.

---

## 1. Functional Requirements (by Module)

### Module 1 — Authentication & Authorization
* **FR-1.1:** Users shall be able to register a new account using Name, Email, Password, and Role selection (ADMIN / PROJECT_MANAGER / TEAM_MEMBER).
* **FR-1.2:** Users shall be able to log in securely. The server shall authenticate credentials and return a signed JSON Web Token (JWT) inside an HTTP-only cookie.
* **FR-1.3:** Users shall be able to log out, which invalidates the server session cookie.
* **FR-1.4:** Passwords must be hashed using `bcrypt` on the backend before database persistence.
* **FR-1.5:** The system shall enforce Role-Based Access Control (RBAC) on both the frontend (protected route guards) and backend (role verification middleware).
* **FR-1.6:** Password strength validation must be enforced (minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number).

### Module 2 — User & Profile Management
* **FR-2.1:** Users shall be able to view their personal profile page showing name, email, role, avatar, and assigned projects.
* **FR-2.2:** Users shall be able to update their profile details (name, profile picture URL/upload) and change their password.
* **FR-2.3:** System administrators shall be able to view a global list of users, change user roles, and activate or deactivate user accounts. Deactivated users shall be immediately logged out and blocked from logging in.

### Module 3 — Project Management
* **FR-3.1:** Project Managers and Admins shall be able to create new projects with a Name, Description, Priority (LOW, MEDIUM, HIGH), Start Date, and Deadline.
* **FR-3.2:** Project Managers and Admins shall be able to update and delete projects they manage.
* **FR-3.3:** Projects shall have a Status (PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED).
* **FR-3.4:** The system shall automatically compute project progress as a percentage: `(Completed Tasks / Total Tasks) * 100`. If a project has 0 tasks, progress defaults to 0%.

### Module 4 — Team & Member Management
* **FR-4.1:** Project Managers shall be able to add registered users to a project team and assign specific responsibilities/roles within that project.
* **FR-4.2:** Project Managers shall be able to remove members from a project.
* **FR-4.3:** The project team tab shall display the list of project members, their responsibilities, and their current workload (number of active/pending tasks assigned).

### Module 5 — Task Management
* **FR-5.1:** Users with appropriate project permissions shall be able to create tasks within a project.
* **FR-5.2:** Tasks must contain: Title, Description, Assigned User, Priority (LOW, MEDIUM, HIGH), Status, Deadline, and Subtask checklist.
* **FR-5.3:** Tasks shall follow a strict state workflow: `TO DO` → `IN PROGRESS` → `REVIEW` → `COMPLETED`.
* **FR-5.4:** Users shall be able to search and filter tasks within a project by status, priority, assignee, and keyword.
* **FR-5.5:** Task assignees or managers shall be able to check off subtasks, which update the task's individual completion status.

### Module 6 — Collaboration & Activity Management
* **FR-6.1:** Users shall be able to post comments on both projects and specific tasks.
* **FR-6.2:** Users shall be able to reply directly to task comments, forming a nested comment hierarchy (up to 2 levels deep).
* **FR-6.3:** The system shall automatically record user actions in an audit log (Activity collection) for events such as: creating projects, changing task status, assigning tasks, and posting comments.
* **FR-6.4:** An Activity Feed shall be viewable at the Project level and Task level, showing who performed what action and when.

### Module 7 — Notification & Reminder System
* **FR-7.1:** The system shall trigger in-app notifications to recipients for actions: task assignment, deadline reminders (24 hours prior), comment mentions, and project updates.
* **FR-7.2:** A notification panel/bell in the header shall display unread notifications.
* **FR-7.3:** Users shall be able to mark notifications as read or mark all as read.

### Module 8 — AI Project Assistant
* **FR-8.1 (AI Task Generator):** Users can supply a high-level goal (e.g., "Build checkout API"). The AI shall analyze the prompt and return a structured list of recommended tasks.
* **FR-8.2 (Task Breakdown):** Users can select any task and trigger "Break Down". The AI shall output a checklist of 4-8 granular subtasks.
* **FR-8.3 (Priority Suggestions):** Based on the task title, description, and project deadline, the AI can suggest an optimal priority tier (LOW, MEDIUM, HIGH) with a brief justification.
* **FR-8.4 (Project Summary):** The AI shall ingest active project metadata (tasks completed, pending, overdue, and recent activities) and output a concise executive summary.
* **FR-8.5 (Risk Detection):** The AI shall scan the project state to identify risks (overdue tasks, deadline bottlenecks, team members with double the average workload) and output flagged alerts.
* **FR-8.6 (User Approval Workflow):** AI-generated items (tasks, subtasks) are presented as interactive checklists in the UI. The database is **never** written directly. The user must review, select/deselect, and click "[Create Selected Tasks]" to write to the MongoDB database.

### Module 9 — Dashboard & Analytics
* **FR-9.1:** The system shall calculate and display KPI cards (Total Projects, Active Projects, Pending Tasks, Overdue Tasks).
* **FR-9.2:** The dashboard shall present visual charts (using Recharts) for: Project completion percentages, Task status distribution (Donut chart), and Team workload allocation (Bar chart).
* **FR-9.3:** A dedicated "AI Insights" card on the dashboard shall surface real-time, non-blocking project alerts and performance optimization suggestions.

### Module 10 — Admin & System Management
* **FR-10.1:** Admins shall have a dedicated portal to view global system health: total registered users, active projects, system-wide task statistics, and database size estimate.
* **FR-10.2:** Admins shall be able to search, filter, activate, and deactivate any user account.
* **FR-10.3:** Admins shall have the authority to delete inappropriate comments or flags across any project.

---

## 2. Non-Functional Requirements

### Performance & Scalability
* **NFR-1.1 (Latency):** All standard database reads/writes (excluding AI API calls) must respond in under 200ms under normal load (up to 100 concurrent requests).
* **NFR-1.2 (AI Timeout):** AI-assistant responses must use optimized streams or respond in under 4 seconds. The UI must render a smooth, minimal skeleton loader while waiting.
* **NFR-1.3 (Database Scalability):** The Mongoose models must utilize proper indices to prevent full-collection scans as the database scales to thousands of projects and tasks.

### Security & Data Protection
* **NFR-2.1 (JWT Storage):** JWT tokens must be stored in secure, `HttpOnly`, `SameSite=Strict`, and `Secure` (in production) cookies to mitigate Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) vulnerabilities.
* **NFR-2.2 (Data-at-Rest):** All database interactions with MongoDB Atlas must utilize TLS 1.3 encryption-in-transit. Passwords must be hashed using bcrypt with a work factor of 10.
* **NFR-2.3 (Secret Masking):** AI API keys (OpenAI / DeepSeek) must reside strictly on the Node.js server. They must never be transmitted, exposed, or logged in client bundles.
* **NFR-2.4 (Rate Limiting):** Public routes (login, register) must be rate-limited to 5 requests per minute per IP to prevent brute-force attacks. Standard API routes must be limited to 100 requests per 15 minutes.

### Usability & Accessibility
* **NFR-3.1 (WCAG Contrast):** The minimal teal-and-white theme must enforce a minimum contrast ratio of `4.5:1` for regular text and `3:1` for large text, adhering to WCAG 2.1 AA guidelines.
* **NFR-3.2 (Typography & Scale):** Text size must use relative units (`rem`) to support user-agent zooming.
* **NFR-3.3 (Responsive Breakpoints):** The layout must support standard mobile (375px+), tablet (768px+), and desktop (1024px+) viewports, gracefully shifting from a multi-column shell to a touch-friendly collapsible drawer structure.
