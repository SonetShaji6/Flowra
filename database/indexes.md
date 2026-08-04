# Flowra — MongoDB Index Strategy

This document details the indexing strategy for Flowra's collections to ensure high performance as the platform scales.

---

## 1. User Collection (`users`)

| Index Keys | Type | Rationale |
| :--- | :--- | :--- |
| `{ email: 1 }` | Unique | Critical for login lookups and enforcing account uniqueness. |
| `{ role: 1 }` | Standard | Optimizes Admin-only user filtering and role-based counts. |
| `{ isActive: 1 }` | Standard | Used in every request via the auth middleware to check account status. |

---

## 2. Project Collection (`projects`)

| Index Keys | Type | Rationale |
| :--- | :--- | :--- |
| `{ manager: 1 }` | Standard | Optimizes the "My Managed Projects" dashboard view. |
| `{ "members.user": 1 }` | Standard | Critical for the "Projects I am a member of" query for Team Members. |
| `{ status: 1 }` | Standard | Optimizes dashboard filtering (e.g., viewing only Active projects). |
| `{ deadline: 1 }` | Standard | Optimizes sorting by upcoming milestones and deadline risk analysis. |

---

## 3. Task Collection (`tasks`)

| Index Keys | Type | Rationale |
| :--- | :--- | :--- |
| `{ project: 1 }` | Standard | Primary index for loading the Kanban board and task lists for a project. |
| `{ assignedTo: 1, status: 1 }` | Compound | Powering the "My Tasks" dashboard widget for active work. |
| `{ status: 1, deadline: 1 }` | Compound | Critical for overdue task detection and AI risk analysis. |
| `{ priority: 1 }` | Standard | Optimizes task board sorting by urgency. |

---

## 4. Notification Collection (`notifications`)

| Index Keys | Type | Rationale |
| :--- | :--- | :--- |
| `{ recipient: 1, isRead: 1 }` | Compound | Core index for the unread notification bell and badge count. |
| `{ createdAt: -1 }` | Standard | Ensures chronologically descending retrieval of recent alerts. |

---

## 5. Activity Collection (`activities`)

| Index Keys | Type | Rationale |
| :--- | :--- | :--- |
| `{ project: 1, createdAt: -1 }` | Compound | Powers the project-level activity feed with fast chronological sorting. |
| `{ task: 1, createdAt: -1 }` | Compound | Powers the task-specific audit log in the details drawer. |

---

## 6. Authentication & Security

| Index Keys | Type | Rationale |
| :--- | :--- | :--- |
| `{ token: 1 }` | Unique | Used in `refreshTokens` and `passwordResets` for secure lookup. |
| `{ expiresAt: 1 }` | TTL | Automatically purges expired sessions and reset tokens from the DB. |

---

## 7. Search Strategy (Optional / Future)

As the task volume grows, we will implement a **Text Index** on tasks to support natural language search:

```javascript
taskSchema.index({ title: 'text', description: 'text' });
```

This allows users to search for keywords across titles and descriptions within a project context efficiently.
