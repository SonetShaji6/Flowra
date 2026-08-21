# Flowra — Week 3 Notion Submission

## 🎯 Week 3 Objectives
> **Finalize the Backend → Test all backend APIs using Postman → Start and substantially develop the Frontend.**

---

## 🏆 Key Achievements

### 1. Backend Finalization (10/10 Modules Complete)
- **Module 1 (Auth):** Secure JWT auth (cookies & Bearer tokens), bcrypt hashing, role middleware (`ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`).
- **Module 2 (Users):** Profile management (`GET/PATCH /api/users/me`), password validation, user search directory.
- **Module 3 (Projects):** Project CRUD, role-based authorization, automatic progress recalculation `(completed/total)*100`, activity logging, and notifications.
- **Module 4 (Team):** Team member addition/removal (`POST/DELETE /api/projects/:id/members`), duplicate checks, activity logs, notification dispatches.
- **Module 5 (Tasks):** Full Task CRUD, status lifecycle (`TODO` → `IN_PROGRESS` → `REVIEW` → `COMPLETED`), subtasks checklist, project member validation, multi-filtering, and automatic project progress syncing.
- **Module 6 (Collaboration):** Task & project comments, reply hierarchy, activity audit trail.
- **Module 7 (Notifications):** Recipient-isolated notifications, unread counters, single & batch read actions (`PATCH /api/notifications/read-all`).
- **Module 8 (AI Project Assistant):** OpenAI integration with offline heuristic fallback. Task generation, subtask breakdown, risk analysis, and project summary with interaction logging.
- **Module 9 (Analytics):** Workspace KPI overview, project-level charts, and team workload capacity metrics.
- **Module 10 (Admin):** Platform statistics, user directory with active/inactive toggles and role adjustments.

### 2. Automated API Testing & Postman Deliverables
- **Automated Test Suite:** 51 endpoint tests executed across all 10 modules covering positive paths and negative edge cases (400, 401, 403, 404, 409).
- **Results:** **51 / 51 Passed (100% Pass Rate)**.
- **Postman Collection:** `evidence/week3/Flowra API — Week 3.postman_collection.json` (v2.1).
- **Postman Environment:** `evidence/week3/Flowra Local.postman_environment.json`.
- **Test Matrix Documentation:** `docs/week3-api-test-matrix.md`.
- **Response Payloads:** Captured in `evidence/week3/postman/`.

### 3. Frontend Architecture & Features (React 19 + Vite + Tailwind CSS)
- **Design System:** Strict **Minimal Teal + White** (`#0F766E`, `#14B8A6`, `#CCFBF1`, `#FFFFFF`, `#F8FAFC`, `#0F172A`).
- **Reusable UI Library:** Button, Input, Select, Modal, Badge, Card, Avatar, ProgressBar, KPICard, EmptyState, LoadingSpinner.
- **Application Shell:** Responsive collapsible sidebar, top navigation with global search, notifications indicator with dropdown drawer, and profile menu.
- **Authentication:** Sign in, sign up, and 1-click Quick Demo Logins for PM, Dev, and Admin.
- **Dashboard:** 4 KPI cards, active project health progress bars, My Assigned Tasks with 1-click status transitions, recent activities feed, AI insight cards.
- **Projects Workspace:** Search and filterable project grid, Create Project modal, and **6-Tab Project Details Workspace** (Overview, Tasks, Team, AI Assistant, Analytics, Activity).
- **Task Management:** Unified Kanban Board (4 columns) and List views, multi-filters (Status, Priority, Project), Create/Edit Task modal with subtasks checklist, and Task Details Drawer with real-time comments thread.
- **AI Assistant Panel:** Strict safety approval flow: AI generates task suggestions → Checkboxes allow users to select items → "Create Selected Tasks" executes batch creation. Also includes Risk Detection and Executive Summaries.
- **Analytics:** Recharts status donut chart, priority bar chart, and Team Member Workload capacity table.
- **Admin Console:** System statistics, user directory table with active/deactivate toggle and role assignment.
- **Profile & Settings:** Profile update and password change with current password validation.

---

## 📊 Summary of Evidence & Artifacts

| Deliverable | Location | Description |
| :--- | :--- | :--- |
| **API Test Matrix** | `docs/week3-api-test-matrix.md` | 51-endpoint test matrix with HTTP codes and notes |
| **Postman Collection** | `evidence/week3/Flowra API — Week 3.postman_collection.json` | Complete Postman v2.1 collection |
| **Postman Environment** | `evidence/week3/Flowra Local.postman_environment.json` | Environment variables configuration |
| **API Response Payloads** | `evidence/week3/postman/` | Structured JSON request/response samples |
| **Week 3 Completion Report** | `docs/week3-completion.md` | In-depth technical architecture report |
| **Frontend Source Code** | `frontend/src/` | Production-ready React 19 + Tailwind codebase |

---

## 🚀 How to Run Locally

### 1. Start Backend Server (Port 5001)
```bash
cd backend
npm install
npm run start
```
*Health Check:* `http://localhost:5001/api/health`

### 2. Start Frontend Server (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
*Frontend URL:* `http://localhost:5173/login`

### 3. Run Automated 51-Endpoint API Tests
```bash
cd backend
node tests/verify-api.js
```
