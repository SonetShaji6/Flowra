# Flowra — Package & Dependency Plan

This document identifies the libraries, frameworks, and tools selected for the development of Flowra, categorized by their application layer.

---

## 1. Frontend (React)

| Package | Purpose | Rationale |
| :--- | :--- | :--- |
| `react` | UI Library | Industry standard for building dynamic SPAs. |
| `react-dom` | DOM Rendering | Standard React companion. |
| `react-router-dom` | Client Routing | Handles navigation between Dashboard, Projects, and AI screens. |
| `axios` | HTTP Client | Promise-based fetching with easy interceptor support for JWT handling. |
| `lucide-react` | Icons | Modern, lightweight, and customizable SVG icons matching the Teal UI. |
| `@tanstack/react-query`| Data Fetching | Handles caching, synchronization, and loading states for API data. |
| `recharts` | Data Visualization| Used for Dashboard KPI charts and Project analytics. |
| `tailwind-css` | Styling | Utility-first CSS for fast, responsive layout construction. |
| `framer-motion` | Motion | Subtle micro-interactions and transitions (e.g., sidebar slide). |
| `react-hook-form` | Form Management | Performant, flexible form validation. |
| `zod` | Schema Validation | Ensures frontend form data matches backend expectations. |
| `sonner` | Toast Notifications| Minimalist, beautiful toast popups for user feedback. |
| `zustand` | State Management | Lightweight global state for user auth and UI themes. |

---

## 2. Backend (Node.js & Express)

| Package | Purpose | Rationale |
| :--- | :--- | :--- |
| `express` | Web Framework | Minimalist, robust framework for building REST APIs. |
| `mongoose` | MongoDB ODM | Elegant object modeling and validation for MongoDB. |
| `jsonwebtoken` | Auth Tokens | Industry standard for stateless user authentication. |
| `bcryptjs` | Password Hashing | Securely hashes passwords before database storage. |
| `cookie-parser` | Cookie Handling | Parses cookies for secure JWT storage in `HttpOnly` cookies. |
| `cors` | Cross-Origin | Manages frontend-backend communication permissions. |
| `dotenv` | Env Management | Loads environment variables from `.env`. |
| `helmet` | Security Headers | Sets various HTTP headers to secure the app from common attacks. |
| `express-rate-limit` | Rate Limiting | Protects API endpoints from brute-force and DDoS. |
| `zod` | Data Validation | Backend request body and parameter validation. |
| `morgan` | Logging | HTTP request logger middleware for development. |
| `openai` | AI Integration | Official SDK for interacting with GPT/DeepSeek LLM services. |

---

## 3. Development & Tooling

| Package | Purpose | Rationale |
| :--- | :--- | :--- |
| `typescript` | Type Safety | Enhances developer productivity and reduces runtime errors. |
| `eslint` | Linting | Enforces consistent code style and identifies potential bugs. |
| `prettier` | Formatting | Automated code formatting for a clean codebase. |
| `nodemon` | Dev Server | Automatically restarts the Node.js server on file changes. |
| `husky` | Git Hooks | Runs linting and tests before allowing commits. |
| `lint-staged` | Partial Linting | Runs linting only on staged files for faster pre-commit checks. |
| `jest` | Testing | Core testing framework for unit and integration tests. |
| `supertest` | API Testing | Library for testing Express HTTP endpoints. |

---

## 4. AI & Cloud Strategy

* **AI Provider:** OpenAI (using `gpt-4o-mini` for speed/cost) or DeepSeek.
* **Database:** MongoDB Atlas (M0/M10 Tier).
* **Storage:** Cloudinary (for user profile avatars).
* **Deployment:** Vercel (Frontend) and Render/Fly.io (Backend).
