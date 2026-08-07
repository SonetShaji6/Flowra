# Flowra Frontend Application

Flowra frontend is a modern, responsive Single Page Application (SPA) built with React 19, Vite, and Tailwind CSS. It delivers an AI-powered project management platform styled in a **Minimal Teal + White** aesthetic (`#0F766E`, `#14B8A6`, `#CCFBF1`, `#FFFFFF`, `#F8FAFC`, `#0F172A`).

---

## 🛠️ Technology Stack

- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 + Custom Minimal Teal Theme Tokens + Google Font Inter
- **Routing:** React Router v7 (Protected & Admin Route Guards)
- **API Client:** Axios with JWT Bearer Interceptors & Auto-refresh
- **Icons:** Lucide React
- **Visualizations:** Recharts (Donut status charts, Priority bars, Workload indicators)
- **Notifications:** Sonner Toast Notifications

---

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── components/ui/       # Design System UI Library (Button, Input, Select, Modal, Badge, Card, Avatar, etc.)
│   ├── context/             # AuthContext (user session, JWT token, role checking)
│   ├── features/
│   │   ├── auth/            # LoginPage, RegisterPage, ForgotPasswordPage
│   │   ├── dashboard/       # DashboardPage with KPIs, active projects, and my tasks toggle
│   │   ├── projects/        # ProjectsPage, CreateProjectModal, 6-Tab ProjectDetailsPage
│   │   ├── tasks/           # TasksPage (Kanban Board & List views), TaskModal, TaskDetailsDrawer
│   │   ├── team/            # AddMemberModal, Member directory
│   │   ├── collaboration/   # CommentSection, ActivityFeed
│   │   ├── notifications/   # NotificationsPage, topbar notification drawer
│   │   ├── ai/              # AIAssistantPage, AIAssistantTab (Task Generator with Approval, Risks, Summary)
│   │   ├── analytics/       # AnalyticsPage with Recharts visualizations
│   │   ├── admin/           # AdminPage (user management table, role switch, platform stats)
│   │   ├── profile/         # ProfilePage (editor and password change)
│   │   └── settings/        # SettingsPage (workspace & notification preferences)
│   ├── layouts/             # AppLayout SaaS shell with responsive sidebar & topbar
│   ├── routes/              # AppRoutes router definitions
│   └── services/            # Centralized API service layer (auth, projects, tasks, extra)
├── public/                  # Static assets & brand icons
├── vercel.json              # Client-side SPA routing rewrites
├── Dockerfile               # Multi-stage container build with NGINX
├── .env.example             # Frontend environment variables template
├── package.json
└── README.md
```

---

## 🔑 Environment Variables

Configure `.env` or set deployment variables:

```bash
VITE_API_URL=http://localhost:5001
```

*For production deployments, point `VITE_API_URL` to your live backend domain (e.g. `https://flowra-api.onrender.com`).*

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend URL:* `http://localhost:5173/login`

---

## 🔨 Production Build

```bash
npm run build
```
Outputs optimized static assets to `dist/` with zero build warnings.

---

## 📦 Deployment (Vercel / Netlify / Docker)

- **Vercel:** Includes `vercel.json` with SPA routing rewrites.
- **Docker:** Build with `docker build -t flowra-frontend .` and serve via NGINX on port 80.
- **Backend Reference:** [Flowra Backend API](../backend/README.md)
