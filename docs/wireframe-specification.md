# Flowra — 19-Screen Wireframe Specification

This document provides layout blueprints, structural descriptions, and behavioral specifications for Flowra's 19 major user screens.

---

## The SaaS Shell Layout

Almost all logged-in screens are encapsulated in the primary **SaaS Shell**.

### Desktop Layout
```text
┌─────────────────────────────────────────────────────────────┐
│ Flowra      Search                         Notifications User│
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│ Dashboard     │                                             │
│ Projects      │               Main Content                  │
│ Tasks         │                                             │
│ Team          │                                             │
│ AI Assistant  │                                             │
│ Analytics     │                                             │
│               │                                             │
│ Settings      │                                             │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

### Mobile Layout
* Sidebar collapses into a hamburger icon in the header.
* Bottom navigation bar provides quick thumb access to: `Dashboard` | `Projects` | `AI Assistant` | `Notifications`.

---

## 1. Authentication Screens

### Screen 1: Login
* **Purpose:** Allows registered users to log in securely.
* **User Role:** All roles.
* **Layout:** Centered single-column minimalist auth card.
* **Components:** Logo, H1 title ("Welcome back"), Email input, Password input, "Forgot Password" link, Primary button ("Sign In"), "Don't have an account? Register" footer.
* **Actions:** Submit form, validate inputs, redirect to Dashboard on success.
* **Navigation:** Redirects to `/register` or `/forgot-password`.
* **States:** 
  * *Loading:* Disable button, replace text with a small spinning teal circle.
  * *Error:* Inline banner with error message: *"Invalid email or password"*.

### Screen 2: Registration
* **Purpose:** onboarding new users.
* **User Role:** All roles.
* **Layout:** Centered single-column card.
* **Components:** Logo, H1 title ("Create your account"), Name input, Email input, Password input, Role Selector (ADMIN / PROJECT_MANAGER / TEAM_MEMBER), Terms checkbox, Submit button.
* **Actions:** Send payload to `/api/auth/register`, redirect to Login on success.
* **Navigation:** Redirects to `/login`.
* **States:**
  * *Error:* Text fields highlight red with assistive caption: *"Email is already in use"*.

### Screen 3: Forgot Password
* **Purpose:** Initiates the password recovery flow.
* **User Role:** All roles.
* **Layout:** Centered card.
* **Components:** Logo, H1 ("Reset your password"), helper caption, Email input, Send Recovery Email button, Back to Login link.
* **Actions:** Send recovery trigger.
* **States:**
  * *Success:* Renders a teal checkmark icon and notification: *"If that email exists, we sent recovery instructions"*.

---

## 2. Main Application Screens

### Screen 4: Dashboard
* **Purpose:** The central workspace presenting personal overview metrics.
* **User Role:** All roles.
* **Layout:** SaaS Shell grid (Top row: 4 KPI Cards; Middle row: Project Progress & My Tasks lists; Bottom row: Recent Activity & AI Insights).
* **Components:**
  * 4 KPI Cards: Total Projects, Active Projects, Pending Tasks, Overdue Tasks.
  * My Tasks table: Task Title, Project, Priority badge, Deadline.
  * Recent Activity list: Chronological action logs.
  * AI Insights card: Clean highlighted block containing AI-analyzed bottleneck alerts.
* **Actions:** Click task to open Details drawer; Click KPI to filter lists.
* **Empty State:** If zero active tasks, render: *"All caught up! Use the AI Assistant to break down your goals."*

### Screen 5: Profile
* **Purpose:** View and modify user-specific accounts details.
* **User Role:** All roles.
* **Layout:** Two-column profile configuration grid.
* **Components:** Left column: avatar image edit with file selector, current role badge, join date. Right column: form with Name input, Email input, "Change Password" nested inputs, save button.
* **Actions:** Trigger profile update or password modification.
* **States:** 
  * *Loading:* Skeleton loaders over input elements.

### Screen 6: Notifications Panel
* **Purpose:** View system alerts and change notification states.
* **User Role:** All roles.
* **Layout:** Floating right sidebar panel (on desktop) or full-screen list (on mobile).
* **Components:** Header with "Mark all as read" button, unread count badge, scrollable list of Notification items (Project invite, task assign, overdue warning) with read/unread color dots.
* **Actions:** Mark individual as read, delete notification, click to redirect to target Project/Task.
* **Empty State:** Centered bell outline with message: *"No new notifications"*.

---

## 3. Projects Screens

### Screen 7: Projects List
* **Purpose:** High-level dashboard containing all active project containers.
* **User Role:** All roles.
* **Layout:** Responsive 3-column card grid or tabular view toggle.
* **Components:** Filter toolbar (Search, Priority, Status dropdowns), "Create Project" button (hidden for TEAM_MEMBER), Project Cards (Title, Manager, Team Avatars, Status Badge, Progress slider).
* **Actions:** Click card to open Project Overview; Filter or search lists.
* **Empty State:** *"No projects found. Create a project to start flowing."*

### Screen 8: Create Project
* **Purpose:** Forms interface to establish a new project container.
* **User Role:** ADMIN, PROJECT_MANAGER.
* **Layout:** Centered content form card.
* **Components:** Project Name input, Description textarea, Priority Select (LOW/MEDIUM/HIGH), Start Date & Deadline inputs, Team Members multi-select dropdown, Submit Button.
* **Actions:** Post data to `/api/projects`, on success redirect to `/projects/:id`.

### Screen 9: Project Overview
* **Purpose:** Central command dashboard for a single selected project.
* **User Role:** All roles (TEAM_MEMBER sees assigned only).
* **Layout:** Header containing Project Title, Status badge, and overall Progress Slider. Sub-navigation Tabs: `Overview` | `Tasks` | `Team` | `Activity` | `Analytics` | `AI Assistant`.
* **Components:** Quick metrics cards, recent comments sidebar, active task countdown.
* **Actions:** Edit project parameters (for PM/Admin), toggle between tabs.

### Screen 10: Project Team Tab
* **Purpose:** Manage active members and review workloads within a project.
* **User Role:** All roles (Edit actions restricted to PM/Admin).
* **Layout:** Two-column panel. Left: Scrollable Member Card listing showing Name, Responsibility badge, Email. Right: Workload Bar Chart showing active tasks per developer.
* **Components:** "Add Team Member" button, Responsibility input field.
* **Actions:** Assign user, change responsibility, delete member from project.

### Screen 11: Project Tasks Tab
* **Purpose:** Workspace displaying and filtering tasks in a project.
* **User Role:** All roles.
* **Layout:** Split layout or Toggle: List View (High-density table) vs. Kanban View (4 columns: TO DO, IN PROGRESS, REVIEW, COMPLETED).
* **Components:** Task Cards with title, priority badge, and avatar. "Add Task" action button.
* **Actions:** Drag cards across Kanban columns, click card to open details.

---

## 4. Tasks Screens

### Screen 12: Task Details Drawer
* **Purpose:** Right-hand side drawer providing deep inspection of a task.
* **User Role:** All roles.
* **Layout:** Slid-out detail drawer. Left column: Description, Subtask Checklist, Comment thread. Right column: Assignee Select, Priority Select, Status Select, Deadline Date, Creator details.
* **Components:** Subtask interactive checklist, Comment thread feed with nested reply boxes.
* **Actions:** Check off subtask, update status dropdown, post comment, request AI subtask breakdown.

### Screen 13: Create/Edit Task Modal
* **Purpose:** Modal form to compile or edit task parameters.
* **User Role:** PM/Admin (or Assigned Developer if permitted).
* **Layout:** Overlay modal card.
* **Components:** Title input, Description textarea, Assignee dropdown, Priority selection buttons (Low/Medium/High), Status select, Deadline, Checklist builder, Submit.
* **Actions:** Post or Patch task payloads, trigger notification dispatch.

---

## 5. Collaboration Screens

### Screen 14: Activity Feed Tab
* **Purpose:** Historical audit trail of all occurrences in a project.
* **User Role:** All roles.
* **Layout:** Timeline feed.
* **Components:** Scrollable stack of Activity Cards (User avatar, descriptive text of action, reference link, calendar timestamp, meta icon).
* **Actions:** Scroll, search feed by username or action keywords.

### Screen 15: Comments Section
* **Purpose:** Threaded communication widget on Projects/Tasks.
* **User Role:** All roles.
* **Layout:** Embedded nested list below task description.
* **Components:** Active commenting rich text input, scrollable stack of Comment cards (author profile, timestamp, text content, "Reply" action link, nested replies panel).
* **Actions:** Post comment, reply to comment, delete own comment.

---

## 6. AI Screens

### Screen 16: AI Project Assistant Tab
* **Purpose:** Contextual assistant optimized for structuring projects.
* **User Role:** PM/Admin (Team Member can use for individual task breakdowns).
* **Layout:** Two-column split interface. Left side: AI Control Center (Action Buttons: "Generate Tasks", "Analyze Risks", "Project Summary"). Right side: Prompt Chat block & structured Action Panel.
* **Components:**
  * Control Center panel.
  * Chat panel (User prompts -> AI structured suggestions).
  * Action Checklist: Lists proposed tasks with checkmarks.
  * Create Tasks Button: `[Create Selected Tasks]`.
* **Actions:** Check/uncheck suggested tasks, edit task titles inline, submit checklist to DB.

---

## 7. Analytics Screens

### Screen 17: Analytics Dashboard Tab
* **Purpose:** Consolidate data into readable visual performance metrics.
* **User Role:** ADMIN, PROJECT_MANAGER.
* **Layout:** Responsive 2-column grid.
* **Components:**
  * Card 1: Completed vs. Total Tasks line chart.
  * Card 2: Task Priority distribution pie chart.
  * Card 3: Team Workload status horizontal bar chart.
  * Card 4: Historical Project completion velocities.
* **Actions:** Export data (CSV), filter metrics by date range.

---

## 8. Administration Screens

### Screen 18: Admin Dashboard
* **Purpose:** System overview statistics for application hosts.
* **User Role:** ADMIN.
* **Layout:** Header with server status metrics. Multi-card dashboard.
* **Components:** Global KPI cards (Total active users, total projects, system-wide task counts, active sessions), Database health panel, recent system activity log list.
* **Actions:** System config settings access, global backup trigger.

### Screen 19: User Management Console
* **Purpose:** Central control grid for Admins to manage and moderate users.
* **User Role:** ADMIN.
* **Layout:** Tabular grid with toolbar.
* **Components:** Search bar, Role filter dropdown, User Table (Profile details, Email, Current Role, Join date, Account status badge, Action dropdown (Edit Role, Activate/Deactivate)).
* **Actions:** Deactivate user account, modify user system roles.
* **States:**
  * *Alert:* Confirmation modal: *"Are you sure you want to deactivate John Doe? This will invalidate their current sessions immediately."*
