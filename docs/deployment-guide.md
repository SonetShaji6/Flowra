# Flowra — Production Deployment Guide

This guide provides step-by-step instructions for deploying Flowra into a cloud production environment.

---

## 1. System Architecture

```text
[ Client Browser (SPA) ]
           │
           ▼
[ Frontend: Vercel / Netlify / NGINX ]  ── (Port 5173 / 443)
           │
           │  HTTPS / REST API (JWT Bearer / httpOnly Cookie)
           ▼
[ Backend: Render / Railway / Docker ]  ── (Port 5001 / 443)
      │               │
      ▼               ▼
[ MongoDB Atlas ]  [ OpenAI API Core ]
```

---

## 2. Environment Variables Checklist

### Backend Production Environment (`backend/.env`)

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment mode | `production` |
| `PORT` | Server listening port | `5001` (or assigned by platform) |
| `MONGODB_URI` | MongoDB Atlas cluster connection string | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/flowra` |
| `JWT_SECRET` | 64+ character cryptographically secure key | `flowra_prod_secret_f9a83bc1209e74` |
| `JWT_EXPIRES_IN`| Token validity lifespan | `7d` |
| `CLIENT_URL` | Production URL of the frontend app | `https://flowra.vercel.app` |
| `CORS_ORIGINS` | Comma-separated preview/staging origins | `https://flowra-preview.vercel.app` |
| `AI_PROVIDER` | AI service provider | `gemini` |
| `AI_API_KEY` / `GEMINI_API_KEY` | Google Gemini API Key | `AQ.Ab8RN...` |
| `AI_MODEL` | AI engine model identifier | `gemini-3.6-flash` |
| `GEMINI_PROJECT_NAME` | GCP Project resource name | `projects/188387910506` |
| `GEMINI_PROJECT_NUMBER` | GCP Project number | `188387910506` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud name | `rf2hvdrj` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `855845975675466` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `TMMXA8...` |


### Frontend Production Environment (`frontend/.env`)

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of deployed backend API | `https://flowra-api.onrender.com` |

---

## 3. Backend Deployment (Render / PaaS)

### Option A: Using Render Blueprint (`render.yaml`)
1. Connect your GitHub repository to [Render](https://dashboard.render.com/).
2. Select **New** → **Blueprint** and point to the repository root. Render will automatically detect `render.yaml`.
3. In the Render Dashboard, fill in the secret environment variables (`MONGODB_URI`, `JWT_SECRET`, `AI_API_KEY`, `CLIENT_URL`).
4. Click **Apply**. Render will run `npm install` and start the server using `npm run start`.

### Option B: Manual Web Service Setup
- **Environment:** `Node`
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm run start`
- **Health Check Path:** `/api/health`

---

## 4. Frontend Deployment (Vercel / Static Hosting)

### Deploying to Vercel
1. Import the repository into [Vercel](https://vercel.com/new).
2. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. In the **Environment Variables** section, add:
   - `VITE_API_URL` = `https://your-backend-service.onrender.com`
4. Click **Deploy**.
5. Client-side routing is automatically handled by the included `frontend/vercel.json` rewrite rules:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

---

## 5. Docker Containerized Deployment

To run the entire Flowra stack locally or on a VPS using Docker:

```bash
# Set environment variables in .env
docker-compose up --build -d
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5001/api/health`

---

## 6. Post-Deployment Verification Checklist

After deploying live URLs, verify each critical checkpoint:

- [ ] **Health Check:** Open `https://YOUR-BACKEND/api/health` and verify `{ "success": true, "message": "Flowra API is running" }`.
- [ ] **SSL / HTTPS:** Ensure both frontend and backend use valid HTTPS certificates.
- [ ] **CORS Verification:** Inspect browser Network tab on login to confirm `Access-Control-Allow-Origin` matches your frontend domain.
- [ ] **Demo Login:** Sign in via `pm.sarah@flowra.app` using 1-click Quick Demo login.
- [ ] **Page Refresh:** Refresh nested routes (e.g. `/projects`, `/tasks`, `/analytics`) to verify SPA rewrite routing works without 404s.
- [ ] **AI Assistant Test:** Trigger a task generation on a project and confirm suggestions render with selection checkboxes.
- [ ] **Admin Security:** Verify non-admin accounts receive `403 Forbidden` when attempting `/admin` access.

---

## 7. Production Troubleshooting

| Issue | Likely Cause | Resolution |
| :--- | :--- | :--- |
| **CORS Error in Console** | `CLIENT_URL` does not match the frontend origin | Update `CLIENT_URL` in backend environment variables to match frontend domain exactly. |
| **404 on Page Refresh** | Static server lacks SPA fallback | Ensure `vercel.json` or NGINX `try_files $uri /index.html;` is present. |
| **Database Handshake Timeout** | MongoDB Atlas IP Access List restriction | Add `0.0.0.0/0` (Allow Access from Anywhere) in MongoDB Atlas Network Access. |
| **AI Fallback Triggered** | OpenAI API key unset or rate-limited | The built-in heuristic engine automatically generates structured responses with zero downtime. |
