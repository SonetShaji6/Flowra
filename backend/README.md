# Flowra Backend API

Flowra backend is the production-grade server-side platform for the AI-powered project management system. It provides high-performance REST APIs across all 10 core modules with JWT authentication, RBAC authorization, automated progress recalculation, audit activity logging, isolated notifications, and contextual AI workflows.

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (v18+)
- **Web Framework:** Express.js
- **Database & ODM:** MongoDB Atlas + Mongoose
- **Security:** JWT (httpOnly Cookies + Bearer headers), Bcrypt, Helmet, Express-Rate-Limit, dynamic CORS
- **Validation:** Zod Schema Validation
- **AI Core:** OpenAI GPT-4o-mini with deterministic heuristic fallback engine
- **Testing:** Supertest automated test runners (51-endpoint matrix + 20-step E2E lifecycle)

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── app.js               # Express application with security middleware & routes
│   ├── server.js            # Server entrypoint with database listener
│   ├── config/              # Database & environment configuration
│   ├── controllers/         # Business logic for auth, users, projects, tasks, comments, notifs
│   ├── middleware/          # JWT auth, role RBAC, error handlers, and rate limiting
│   ├── models/              # Mongoose schemas (User, Project, Task, Comment, Notification, Activity, AIInteraction)
│   ├── routes/              # Express route handlers
│   ├── services/            # OpenAI service, prompt definitions, heuristic engine
│   ├── utils/               # Activity audit loggers, progress calculator, response formatters
│   └── validators/          # Zod request payload schemas
├── tests/
│   ├── verify-api.js        # 51-Endpoint API regression verification suite
│   ├── e2e.flow.test.js     # 20-Step complete user journey acceptance test
│   └── api.integration.test.js
├── Dockerfile               # Production multi-stage Docker container
├── .env.example             # Environment variable specification
├── package.json
└── README.md
```

---

## 🔑 Environment Variables

Create `.env` based on `.env.example`:

```bash
PORT=5001
NODE_ENV=production
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/flowra
JWT_SECRET=your_super_secret_production_key_here
JWT_EXPIRES_IN=7d
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4o-mini
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start server
npm run start
```
*Health Check:* `http://localhost:5001/api/health`

---

## 🧪 Testing

```bash
# Run 51-endpoint API regression suite
node tests/verify-api.js

# Run 20-step End-to-End lifecycle workflow test
node tests/e2e.flow.test.js
```

---

## 🌐 API Overview (10 Core Modules)

1. **Health Check:** `GET /api/health`
2. **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
3. **Users:** `GET /api/users/me`, `PATCH /api/users/me`, `PATCH /api/users/me/password`, `GET /api/users`, `GET /api/users/:id`
4. **Projects:** `POST /api/projects`, `GET /api/projects`, `GET /api/projects/:id`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id`
5. **Team:** `POST /api/projects/:id/members`, `DELETE /api/projects/:id/members/:userId`, `GET /api/projects/:id/members`
6. **Tasks:** `POST /api/tasks`, `GET /api/tasks`, `GET /api/tasks/:id`, `PATCH /api/tasks/:id`, `PATCH /api/tasks/:id/status`, `DELETE /api/tasks/:id`
7. **Comments:** `POST /api/comments`, `GET /api/comments`, `PATCH /api/comments/:id`, `DELETE /api/comments/:id`
8. **Activities:** `GET /api/activities`, `GET /api/activities/project/:id`
9. **Notifications:** `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`, `DELETE /api/notifications/:id`
10. **AI Assistant:** `POST /api/ai/generate-tasks`, `POST /api/ai/breakdown-task`, `POST /api/ai/project-summary`, `POST /api/ai/risk-analysis`
11. **Analytics:** `GET /api/analytics/overview`, `GET /api/analytics/projects/:id`, `GET /api/analytics/team`
12. **Admin:** `GET /api/admin/statistics`, `GET /api/admin/users`, `GET /api/admin/projects`, `GET /api/admin/activities`, `PATCH /api/users/:id/status`, `PATCH /api/users/:id/role`

---

## 📦 Deployment

- **Render Blueprint:** Configured via `render.yaml` and `Procfile`.
- **Docker:** Build with `docker build -t flowra-backend .` and run on port 5001.
- **Frontend Reference:** [Flowra Frontend](../frontend/README.md)
