# Flowra — User Roles & Permissions Matrix

This document defines the roles, system privileges, access controls, and primary user journeys within Flowra.

---

## 1. System Roles

Flowra supports three distinct roles, mapped to standard software engineering and project management operations.

### ADMIN
The global platform overseer. The Admin does not manage individual tasks day-to-day, but controls system integrity, handles user state changes (activations/deactivations), accesses global usage statistics, and maintains system-wide moderation.

### PROJECT_MANAGER (PM)
The project owner. The PM is responsible for structuring projects, assigning team members, generating tasks (with or without AI support), managing schedules, reviewing workloads, and reading project health analytics.

### TEAM_MEMBER (Developer / Designer / Analyst)
The execution engine. Team Members focus on their individual workspace dashboard, updating task statuses, checking off subtask items, collaborating in comment threads, and interacting with the contextual AI assistant to break down their assigned tasks.

---

## 2. Permissions Matrix

The following matrix outlines the operations allowed for each role across the platform:

| Module / Action | ADMIN | PROJECT_MANAGER | TEAM_MEMBER |
| :--- | :---: | :---: | :---: |
| **Authentication & Profile** | | | |
| View / Edit Own Profile | Yes | Yes | Yes |
| Change Own Password | Yes | Yes | Yes |
| **User & Role Management** | | | |
| View Global User List | Yes | No | No |
| Change User Roles | Yes | No | No |
| Deactivate / Activate Accounts | Yes | No | No |
| View System Logs / Statistics | Yes | No | No |
| **Project Management** | | | |
| Create New Projects | Yes | Yes | No |
| Edit / Update All Projects | Yes | No (Only Managed) | No |
| Delete Projects | Yes | No (Only Managed) | No |
| View Projects (List / Detail) | Yes | Yes | Yes (Only Assigned) |
| **Team Management** | | | |
| Add Members to Projects | Yes | Yes | No |
| Remove Members from Projects | Yes | Yes | No |
| Update Member Roles/Details | Yes | Yes | No |
| View Workloads & Allocations | Yes | Yes | Yes (Only Team) |
| **Task Management** | | | |
| Create Tasks in Projects | Yes | Yes | Yes (Only Assigned) |
| Edit Task Title/Desc/Dates | Yes | Yes | No (Own Tasks Only) |
| Change Task Status Workflow | Yes | Yes | Yes (Own Tasks Only) |
| Manage Checklist / Subtasks | Yes | Yes | Yes (Own Tasks Only) |
| **Collaboration** | | | |
| Write Project/Task Comments | Yes | Yes | Yes |
| Reply to Comments | Yes | Yes | Yes |
| Moderate / Delete Comments | Yes | No (Only Own) | No (Only Own) |
| View Activity History Feed | Yes | Yes | Yes (Only Assigned) |
| **Notification Center** | | | |
| Receive & Read Notifications | Yes | Yes | Yes |
| Clear / Dismiss Notifications | Yes | Yes | Yes |
| **AI Project Assistant** | | | |
| Request AI Task Gen / Breakdown | Yes | Yes | Yes |
| Request Priority Suggestions | Yes | Yes | Yes |
| Request Risk & Bottleneck Audits| Yes | Yes | No |
| Approve and Create AI Tasks | Yes | Yes | No |
| **Analytics & Reporting** | | | |
| View Global System Statistics | Yes | No | No |
| View Project Performance Graphs| Yes | Yes | No |
| View Personal Productivity KPIs | Yes | Yes | Yes |

---

## 3. Core User Journeys

### ADMIN Pathway
```text
Login 
  ↓
Global System Dashboard (Check health indicators & user counts)
  ↓
User Management Console (Search users, update status/role, deactivate as needed)
  ↓
Platform Moderation (Review recent global activities or flag inappropriate content)
```

### PROJECT_MANAGER Pathway
```text
Login
  ↓
PM Dashboard (Overview of active projects, workloads, and overdue tasks)
  ↓
Create New Project (Fill details, set deadline, select Priority)
  ↓
Assemble Project Team (Invite users, assign project-level responsibilities)
  ↓
Generate Tasks via AI Assistant (Enter project goals -> review AI-suggested list -> approve -> tasks created)
  ↓
Monitor Workload & Risks (Review charts, reallocate overloaded members, check AI risk flags)
```

### TEAM_MEMBER Pathway
```text
Login
  ↓
Developer Dashboard (Focused calendar, notification panel, and "My Tasks" list)
  ↓
Access Assigned Project (View Kanban board / task list)
  ↓
Task Execution & Status Transition (Move task from TO DO -> IN PROGRESS)
  ↓
AI Task Breakdown (Ask AI Assistant to suggest 5 granular subtasks -> approve -> complete them)
  ↓
Collaboration & Review (Post updates in Task Comments -> Move task to REVIEW -> notify PM)
```
