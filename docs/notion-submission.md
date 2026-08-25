# FLOWRA — FINAL NOTION SUBMISSION

## 🎯 Project Overview
* **Project Name:** Flowra
* **Tagline:** *Where Projects Flow.*
* **Product:** AI-Powered Project Management Platform
* **Design Identity:** Minimal Teal + White SaaS (`#0F766E`, `#14B8A6`, `#CCFBF1`, `#FFFFFF`, `#F8FAFC`, `#0F172A`)

---

## 🔗 Repositories & URLs

* **GitHub Repository (Monorepo):** https://github.com/SonetShaji6/Flowra
* **Backend API Base:** `http://localhost:5001/api` *(or deployed Render web service)*
* **Frontend App:** `http://localhost:5173` *(or deployed Vercel domain)*
* **Health Endpoint:** `http://localhost:5001/api/health`

---

## 🏆 Key Features Across 10 Modules

1. **Authentication & Authorization:** JWT (cookies & Bearer tokens), bcrypt, RBAC (`ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`), and 1-click Quick Demo Logins.
2. **User & Profile Management:** Profile editing, password change with current password validation, and user directory.
3. **Project Management:** Project workspaces with automated progress calculations `(completed/total)*100`.
4. **Team Management:** Team member addition/removal with duplicate validation and activity dispatches.
5. **Task Engine:** Unified Kanban Board and List views with subtask checklists and status transitions.
6. **Collaboration & Activity:** Chronological threaded comments with author avatars and activity audit trails.
7. **Notifications:** Recipient-isolated notifications with unread badge tracking and batch mark read.
8. **AI Assistant:** Contextual task generation with strict human-in-the-loop review & checkbox approval, risk detection, and executive summaries.
9. **Analytics:** Recharts status donut charts, priority distribution bars, and team workload capacity tables.
10. **Admin Portal:** System statistics, user activation/deactivation toggles, and role modification.

---

## 🧪 Testing Results

* **API Test Matrix (51 Endpoints):** **51 / 51 Passed (100%)**
* **20-Step End-to-End User Journey Test:** **20 / 20 Steps Passed (100%)**
* **Role-Based Security Tests (RBAC):** All protected endpoints verified with 403 Forbidden guards for unauthorized roles.
* **Frontend Production Build:** `npm run build` compiled with **0 errors**.

---

## 🔑 Demo Logins

| Role | Email | Password |
| :--- | :--- | :--- |
| **Project Manager** | `pm.sarah@flowra.app` | `Password123!` |
| **Team Member** | `alex.dev@flowra.app` | `Password123!` |
| **Admin** | `admin.root@flowra.app` | `Password123!` |

*(Use the 1-click Quick Demo Login buttons on the login page for instant access.)*

---

## 🏁 Final Status
**COMPLETED — READY FOR SUBMISSION**
