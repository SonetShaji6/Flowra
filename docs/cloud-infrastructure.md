# Flowra — Cloud Infrastructure Plan

This document outlines the cloud service providers and deployment architecture for Flowra.

---

## 1. Service Stack

| Layer | Provider | Purpose |
| :--- | :--- | :--- |
| **Version Control** | GitHub | Repository hosting and CI/CD triggers. |
| **Frontend Hosting** | Vercel | Hosting the React SPA with automated preview deployments. |
| **Backend Hosting** | Render | Hosting the Node.js/Express API with SSL and auto-deploy. |
| **Database** | MongoDB Atlas | Managed NoSQL database (Shared Cluster / Serverless). |
| **AI Engine** | OpenAI / DeepSeek| Providing LLM capabilities via REST API. |
| **Image Storage** | Cloudinary | CDN-backed storage for user avatars and task attachments. |

---

## 2. Deployment Workflow

1. **Local Development:** Developers work on `feature/*` branches, pushing to GitHub.
2. **Pull Requests:** GitHub triggers a Vercel preview deployment for the frontend.
3. **Merge to `main`:** 
   * Vercel triggers production deployment for `frontend/`.
   * Render triggers production deployment for `backend/`.
   * Database migrations (if any) are handled via Mongoose models.

---

## 3. Environment Variable Management

All secrets are stored in the CI/CD platform settings (not in Git).

### Frontend (Vercel)
* `VITE_API_URL`: URL of the deployed Render backend.

### Backend (Render)
* `PORT`: 5001 (or as assigned).
* `MONGODB_URI`: Connection string for MongoDB Atlas.
* `JWT_SECRET`: Secret key for signing tokens.
* `AI_API_KEY`: Key for the selected LLM provider.
* `CLOUDINARY_URL`: Configuration string for image storage.
* `CLIENT_URL`: URL of the deployed Vercel frontend (for CORS).

---

## 4. Scalability & Monitoring

* **Log Monitoring:** We will use Render's built-in log viewer and `morgan` for backend request logging.
* **Database Scaling:** MongoDB Atlas provides automated scaling. We will monitor index usage and slow queries via the Atlas Performance Advisor.
* **AI Usage Tracking:** The `aiInteractions` collection will store token usage metrics to monitor costs and performance.
