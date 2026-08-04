# Flowra — Where Projects Flow.

**Flowra** is an AI-powered project management platform designed to streamline software development workflows through a minimal, professional interface and context-aware intelligent assistance.

Built with the **MERN stack**, Flowra prioritizes visual clarity with its **Minimal Teal + White SaaS Design** (`#0F766E`, `#14B8A6`, `#CCFBF1`, `#FFFFFF`, `#F8FAFC`, `#0F172A`), removing clutter while providing deep, data-driven insights.

---

## 🚀 Overview

* **Product Type:** AI-Powered Project Management Platform
* **Design Identity:** Minimal Teal + White SaaS
* **Target Roles:** Admin, Project Manager, Team Member
* **Status:** **Week 4 (Final Execution, 100% Tests Passed, Full Integration, Deployment Ready) Complete.**

---

## ✨ Key Features (10 Modules)

1. **Auth & Authorization:** Secure JWT authentication with RBAC (Admin, PM, Team Member), password recovery, and 1-click Quick Demo Logins.
2. **User Profiles:** Identity management, profile details, and password security updates.
3. **Project Management:** Project workspaces with automated progress calculations `(completed/total)*100`.
4. **Team Allocation:** Role-based project team allocation, duplicate validation, and member management.
5. **Task Engine:** Unified Kanban Board and List views with subtask checklists and status transitions.
6. **Collaboration:** Chronological threaded comments with author avatars and activity audit trails.
7. **Notifications:** Recipient-isolated notifications with unread badge tracking and batch mark read.
8. **AI Assistant:** Contextual task generation with strict human-in-the-loop review & checkbox approval, risk detection, and executive summaries.
9. **Analytics:** Recharts status donut charts, priority distribution bars, and team workload capacity tables.
10. **Admin Portal:** System statistics, user activation/deactivation toggles, and role modification.

---

## 🏗️ Architecture & Stack

### Frontend
* **React 19** + **Vite 8**
* **Tailwind CSS v4** + Custom Design Tokens + Inter Typography
* **Axios** (Centralized API Client with JWT Interceptors)
* **Recharts** (Interactive Analytics Charts)
* **Lucide React** (Modern Iconography)
* **Sonner** (Toast Notifications)

### Backend
* **Node.js & Express**
* **MongoDB & Mongoose** (Database)
* **JWT & Bcrypt** (Security & RBAC)
* **Zod** (Schema Validation)
* **OpenAI / Heuristic Engine** (AI Core)

---

## 📁 Repository Structure

```text
flowra/
├── frontend/             # React 19 + Vite + Tailwind CSS application
│   ├── src/
│   │   ├── components/   # Reusable UI component system
│   │   ├── context/      # AuthContext global state
│   │   ├── features/     # Auth, Dashboard, Projects, Tasks, AI, Analytics, Admin, Profile, Settings
│   │   ├── layouts/      # AppLayout SaaS shell with Sidebar & Topbar
│   │   ├── routes/       # Protected & Admin route guards
│   │   └── services/     # Central Axios API service modules
│   ├── vercel.json       # SPA client-side routing rewrites
│   └── Dockerfile        # Production NGINX container
├── backend/              # Node.js Express REST API
│   ├── src/
│   │   ├── config/       # Database & environment configuration
│   │   ├── controllers/  # Route controller business logic
│   │   ├── middleware/   # Auth, roles, error, and rate limiting
│   │   ├── models/       # Mongoose data models
│   │   ├── routes/       # Express route handlers
│   │   ├── services/     # AI engine & notification services
│   │   └── validators/   # Zod request validators
│   ├── tests/            # 51-endpoint API matrix & 20-step E2E lifecycle test
│   └── Dockerfile        # Production Node container
├── docs/                 # Testing Report, Deployment Guide, Completion, and Notion docs
├── evidence/             # Postman Collection v2.1, Environment, and JSON payloads
├── render.yaml           # Render deployment blueprint
├── Procfile              # PaaS process file
├── docker-compose.yml    # Full-stack container orchestration
├── DEVELOPMENT_STATUS.md # Live module progress tracking
└── README.md             # This file
```

---

## 🛠️ Quick Start

### 1. Backend Server (Port 5001)
```bash
cd backend
npm install
npm run start
```
*Health Check:* `http://localhost:5001/api/health`

### 2. Frontend Development Server (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
*Frontend URL:* `http://localhost:5173/login`

### 3. Run Automated Verification Test Suites
```bash
cd backend

# Run 51-endpoint API regression suite (100% Pass)
node tests/verify-api.js

# Run 20-step End-to-End lifecycle workflow test (100% Pass)
node tests/e2e.flow.test.js
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Project Manager** | `pm.sarah@flowra.app` | `Password123!` |
| **Team Member** | `alex.dev@flowra.app` | `Password123!` |
| **Admin** | `admin.root@flowra.app` | `Password123!` |

*(Use the 1-click Quick Demo Login buttons on the login page for instant access.)*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
